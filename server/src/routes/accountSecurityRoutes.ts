import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";
import { accountSecurityService } from "../services/accountSecurityService";

const router = Router();
const emailSchema = z.object({ email: z.string().email().max(255) });
const tokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) });
const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .refine(
    (value) => Buffer.byteLength(value, "utf8") <= 72,
    "Password must fit within 72 UTF-8 bytes",
  );
router.post("/forgot-password", authLimiter, async (req, res, next) => {
  try {
    const { email } = emailSchema.parse(req.body);
    res.json({
      data: {
        message: await accountSecurityService.requestLink(email, "reset"),
      },
    });
  } catch (error) {
    next(error);
  }
});
router.post("/resend-verification", authLimiter, async (req, res, next) => {
  try {
    const { email } = emailSchema.parse(req.body);
    res.json({
      data: {
        message: await accountSecurityService.requestLink(email, "verify"),
      },
    });
  } catch (error) {
    next(error);
  }
});
router.post("/reset-password", authLimiter, async (req, res, next) => {
  try {
    const { token, password } = tokenSchema
      .extend({ password: passwordSchema })
      .parse(req.body);
    await accountSecurityService.consumeLink(token, "reset", password);
    res.json({
      data: {
        message:
          "Your password has been reset. Sign in with your new password.",
      },
    });
  } catch (error) {
    next(error);
  }
});
router.post("/verify-email", authLimiter, async (req, res, next) => {
  try {
    const { token } = tokenSchema.parse(req.body);
    await accountSecurityService.consumeLink(token, "verify");
    res.json({
      data: { message: "Your email address is verified. You can sign in now." },
    });
  } catch (error) {
    next(error);
  }
});
router.post(
  "/change-password",
  authLimiter,
  authenticate,
  async (req: any, res, next) => {
    try {
      const { currentPassword, password } = z
        .object({
          currentPassword: z.string().min(1).max(72),
          password: passwordSchema,
        })
        .parse(req.body);
      await accountSecurityService.changePassword(
        req.user.id,
        currentPassword,
        password,
      );
      res.json({
        data: {
          message: "Your password has changed. Sign in again on your devices.",
        },
      });
    } catch (error) {
      next(error);
    }
  },
);
export default router;
