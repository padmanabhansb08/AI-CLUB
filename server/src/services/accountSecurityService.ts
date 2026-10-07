import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { pool } from "../db";
import { config } from "../config";
import { ApiError } from "../middleware/errorHandler";

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const neutralMessage =
  "If an eligible account exists, an email will arrive shortly. Check your spam folder too.";

export const accountSecurityService = {
  async requestLink(email: string, purpose: "reset" | "verify") {
    if (!config.SMTP_HOST || !config.MAIL_FROM)
      throw new ApiError(
        "MAIL_UNAVAILABLE",
        "Email assistance is currently unavailable. Please contact your club administrator.",
        503,
      );
    const found = await pool.query(
      "SELECT id, email, email_verified_at FROM users WHERE LOWER(email) = LOWER($1)",
      [email],
    );
    const user = found.rows[0];
    if (!user || (purpose === "verify" && user.email_verified_at))
      return neutralMessage;
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const duration = purpose === "reset" ? 30 : 24 * 60;
    await pool.query(
      "INSERT INTO account_tokens (token_hash, user_id, purpose, expires_at) VALUES ($1, $2, $3, NOW() + $4 * INTERVAL '1 minute')",
      [tokenHash, user.id, purpose, duration],
    );
    const route = purpose === "reset" ? "reset-password" : "verify-email";
    const link = `${config.FRONTEND_URL.replace(/\/$/, "")}/${route}#token=${token}`;
    const transport = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: Number(config.SMTP_PORT),
      secure: config.SMTP_PORT === "465",
      requireTLS: config.NODE_ENV === "production",
      ...(config.SMTP_USER
        ? { auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD } }
        : {}),
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    try {
      await transport.sendMail({
        from: config.MAIL_FROM,
        to: user.email,
        subject:
          purpose === "reset"
            ? "Reset your AI CLUB · SIET password"
            : "Verify your AI CLUB · SIET email",
        text: `AI CLUB · SIET\n\n${purpose === "reset" ? "Set a new password" : "Confirm your email address"} using this link:\n${link}\n\nThis link expires in ${purpose === "reset" ? "30 minutes" : "24 hours"} and can be used once. If you did not request it, ignore this email.`,
      });
    } catch {
      await pool.query("DELETE FROM account_tokens WHERE token_hash = $1", [
        tokenHash,
      ]);
      throw new ApiError(
        "MAIL_UNAVAILABLE",
        "We could not send your email. Please try again later.",
        503,
      );
    } finally {
      transport.close();
    }
    return neutralMessage;
  },

  async consumeLink(
    token: string,
    purpose: "reset" | "verify",
    password?: string,
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const owner = await client.query(
        "SELECT user_id FROM account_tokens WHERE token_hash = $1 AND purpose = $2",
        [hashToken(token), purpose],
      );
      if (!owner.rows[0])
        throw new ApiError(
          "INVALID_LINK",
          "This link is invalid or has expired. Please request a new one.",
          400,
        );
      await client.query("SELECT id FROM users WHERE id = $1 FOR UPDATE", [
        owner.rows[0].user_id,
      ]);
      const result = await client.query(
        "SELECT * FROM account_tokens WHERE token_hash = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > NOW() FOR UPDATE",
        [hashToken(token), purpose],
      );
      const record = result.rows[0];
      if (!record)
        throw new ApiError(
          "INVALID_LINK",
          "This link is invalid or has expired. Please request a new one.",
          400,
        );
      if (purpose === "reset") {
        const passwordHash = await bcrypt.hash(password!, 12);
        await client.query(
          "UPDATE users SET password_hash = $1, session_version = session_version + 1, updated_at = NOW() WHERE id = $2",
          [passwordHash, record.user_id],
        );
      } else {
        await client.query(
          "UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()), updated_at = NOW() WHERE id = $1",
          [record.user_id],
        );
      }
      await client.query(
        "UPDATE account_tokens SET used_at = NOW() WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL",
        [record.user_id, purpose],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "SELECT password_hash FROM users WHERE id = $1 FOR UPDATE",
        [userId],
      );
      if (
        !result.rows[0] ||
        !(await bcrypt.compare(currentPassword, result.rows[0].password_hash))
      )
        throw new ApiError(
          "INVALID_PASSWORD",
          "Your current password is incorrect.",
          400,
        );
      await client.query(
        "UPDATE users SET password_hash = $1, session_version = session_version + 1, updated_at = NOW() WHERE id = $2",
        [await bcrypt.hash(newPassword, 12), userId],
      );
      await client.query(
        "UPDATE account_tokens SET used_at = NOW() WHERE user_id = $1 AND purpose = 'reset' AND used_at IS NULL",
        [userId],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
