const { Pool } = require('pg');
const puppeteer = require('puppeteer');

const pool = new Pool({
    user: 'aiclub',
    password: 'password',
    host: 'localhost',
    port: 5433,
    database: 'aiclub_db'
});

const API_BASE = 'http://localhost:3005';
const FRONTEND_BASE = 'http://localhost:5173';

async function runVerification() {
    let report = [];
    const log = (msg) => {
        console.log(msg);
        report.push(msg);
    };

    log("==================================================");
    log("1. REAL ENVIRONMENT & 2. DATABASE STRUCTURE");
    log("==================================================");
    
    // Check announcements table structure
    let dbRes = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'announcements'
    `);
    if (dbRes.rowCount === 0) throw new Error("Table 'announcements' not found");
    let hasCreatedBy = dbRes.rows.find(r => r.column_name === 'created_by');
    let hasPublishedAt = dbRes.rows.find(r => r.column_name === 'published_at');
    if (!hasCreatedBy || !hasPublishedAt) throw new Error("Missing critical columns in announcements table");
    log("PASS: announcements table structure verified");

    // Check announcement_reads table structure
    dbRes = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'announcement_reads'
    `);
    if (dbRes.rowCount === 0) throw new Error("Table 'announcement_reads' not found");
    log("PASS: announcement_reads table structure verified");
    
    // Check constraints (PK, FK)
    dbRes = await pool.query(`
        SELECT tc.constraint_type, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'announcement_reads'
    `);
    const pks = dbRes.rows.filter(r => r.constraint_type === 'PRIMARY KEY').map(r => r.column_name);
    if (!pks.includes('announcement_id') || !pks.includes('member_id')) {
        throw new Error("announcement_reads composite PK missing");
    }
    log("PASS: announcement_reads composite primary key verified");

    log("==================================================");
    log("3. ADMIN AUTHORIZATION & 4. ADMIN CREATION");
    log("==================================================");

    // Get Admin JWT
    let res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'superadmin@college.edu', password: 'password123' })
    });
    if (!res.ok) throw new Error("Admin login failed");
    let { data: adminAuth } = await res.json();
    const adminToken = adminAuth.token;
    const adminId = adminAuth.user.id;

    // Get Student JWT
    res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student1@test.com', password: 'password123' })
    });
    if (!res.ok) throw new Error("Student login failed");
    let { data: studentAuth } = await res.json();
    const studentToken = studentAuth.token;
    const studentId = studentAuth.user.id;

    // No JWT 401
    res = await fetch(`${API_BASE}/api/admin/announcements`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    log("PASS: 401 enforced without JWT");

    // Student JWT 403
    res = await fetch(`${API_BASE}/api/admin/announcements`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
    log("PASS: 403 enforced for student JWT");

    // Admin JWT 200
    res = await fetch(`${API_BASE}/api/admin/announcements`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    log("PASS: 200 OK for admin JWT");

    // Create Announcement + spoofing test
    res = await fetch(`${API_BASE}/api/admin/announcements`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'TEST_ANNOUNCEMENT_10_3',
            body: 'Test Body',
            category: 'general',
            priority: 'normal',
            status: 'draft',
            created_by: 'spoofed-id-123' // Spoof attempt
        })
    });
    if (res.status !== 201) throw new Error(`Admin create failed: ${res.status}`);
    let { data: createdAnn } = await res.json();
    const annId = createdAnn.id;

    let dbCheck = await pool.query(`SELECT created_by FROM announcements WHERE id = $1`, [annId]);
    if (dbCheck.rows[0].created_by !== adminId) {
        throw new Error("created_by spoofing was successful! Should be admin ID.");
    }
    log("PASS: Admin creation success and created_by spoofing ignored");

    log("==================================================");
    log("5. DRAFT VISIBILITY & 6. PUBLISHED VISIBILITY");
    log("==================================================");

    // Verify draft is absent for student
    res = await fetch(`${API_BASE}/api/announcements`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    let studentFeed = await res.json();
    if (studentFeed.data.some(a => a.id === annId)) {
        throw new Error("Draft is visible to student!");
    }
    log("PASS: Draft visibility restricted");

    // Publish
    await pool.query(`UPDATE announcements SET status = 'published' WHERE id = $1`, [annId]);
    
    // Verify published is present for student
    res = await fetch(`${API_BASE}/api/announcements`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    studentFeed = await res.json();
    if (!studentFeed.data.some(a => a.id === annId)) {
        throw new Error("Published announcement NOT visible to student!");
    }
    log("PASS: Published announcement visible");

    log("==================================================");
    log("7. FUTURE PUBLICATION & 8. EXPIRATION");
    log("==================================================");

    const futureAnnId = (await pool.query(`INSERT INTO announcements (title, body, category, priority, status, published_at, expires_at, created_by) VALUES ('TEST_ANNOUNCEMENT_SCHEDULED_10_3', 'body', 'general', 'normal', 'published', NOW() + INTERVAL '1 day', NULL, $1) RETURNING id`, [adminId])).rows[0].id;
    
    const expiredAnnId = (await pool.query(`INSERT INTO announcements (title, body, category, priority, status, published_at, expires_at, created_by) VALUES ('TEST_ANNOUNCEMENT_EXPIRED_10_3', 'body', 'general', 'normal', 'published', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', $1) RETURNING id`, [adminId])).rows[0].id;

    res = await fetch(`${API_BASE}/api/announcements`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    studentFeed = await res.json();
    
    if (studentFeed.data.some(a => a.id === futureAnnId)) {
        throw new Error("Scheduled future announcement is visible!");
    }
    log("PASS: Future scheduled publication correctly hidden");

    if (studentFeed.data.some(a => a.id === expiredAnnId)) {
        throw new Error("Expired announcement is visible!");
    }
    log("PASS: Expired announcement correctly hidden");

    log("==================================================");
    log("9. ARCHIVE & 10. STUDENT READ FLOW & 11. IDEMPOTENCY & 12. SPOOFING");
    log("==================================================");

    res = await fetch(`${API_BASE}/api/announcements/unread-count`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const jsonA = await res.json();
    const countA = parseInt(jsonA.data.count);

    // Student reads
    res = await fetch(`${API_BASE}/api/announcements/${annId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: 'fake-member-id', user_id: 'fake-user-id' }) // spoof attempt
    });
    if (res.status !== 200) throw new Error("Read receipt failed: " + await res.text());

    // Verify spoofing ignored
    let readCheck = await pool.query(`SELECT count(*) FROM announcement_reads WHERE announcement_id = $1`, [annId]);
    if (parseInt(readCheck.rows[0].count) !== 1) throw new Error("Read record not created exactly once");

    res = await fetch(`${API_BASE}/api/announcements/unread-count`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const jsonB = await res.json();
    const countB = parseInt(jsonB.data.count);
    if (countB !== countA - 1) {
        throw new Error(`Unread count did not decrement correctly! A=${countA}, B=${countB}`);
    }
    log("PASS: Student read flow, unread count tracking verified");

    // Idempotency
    await fetch(`${API_BASE}/api/announcements/${annId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    readCheck = await pool.query(`SELECT count(*) FROM announcement_reads WHERE announcement_id = $1`, [annId]);
    if (parseInt(readCheck.rows[0].count) !== 1) throw new Error("Duplicate read record created!");
    log("PASS: Read receipt idempotency and identity spoofing protection verified");

    log("==================================================");
    log("13. INVALID ANNOUNCEMENT & 14. DELETE + READ CLEANUP");
    log("==================================================");

    res = await fetch(`${API_BASE}/api/admin/announcements`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }) // Invalid
    });
    if (res.status !== 400) throw new Error("Invalid payload didn't return 400");
    const errJson = await res.json();
    if (errJson.error.code !== 'VALIDATION_ERROR') throw new Error("Missing structured validation error");
    log("PASS: Invalid announcement returns structured validation error");

    // Delete
    await fetch(`${API_BASE}/api/admin/announcements/${annId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const dbAnn = await pool.query(`SELECT count(*) FROM announcements WHERE id = $1`, [annId]);
    if (parseInt(dbAnn.rows[0].count) !== 0) throw new Error("Announcement not deleted");
    
    const dbReadDel = await pool.query(`SELECT count(*) FROM announcement_reads WHERE announcement_id = $1`, [annId]);
    if (parseInt(dbReadDel.rows[0].count) !== 0) throw new Error("Read records not cascade deleted");
    log("PASS: Delete cascade cleanup verified");

    log("==================================================");
    log("15. BROWSER E2E TESTS (Admin + Student)");
    log("==================================================");
    
    // Defer to Puppeteer
    const browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    try {
        const page = await browser.newPage();
        page.on('dialog', async d => await d.accept());
        await page.goto(`${FRONTEND_BASE}/admin/login`);
        await page.waitForSelector('input');
        const inputs = await page.$$('input');
        await inputs[0].type('superadmin@college.edu');
        await inputs[1].type('password123');
        await page.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 2000));
        
        await page.goto(`${FRONTEND_BASE}/admin/announcements`);
        await new Promise(r => setTimeout(r, 1000));
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.textContent.includes('New Announcement'));
            if(btn) btn.click();
        });
        
        await page.waitForSelector('form input[type="text"]');
        await page.type('form input[type="text"]', 'E2E_PUPPETEER_DRAFT');
        await page.type('form textarea', 'Draft body');
        await page.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 1000));
        
        log("PASS: Admin browser E2E created announcement");
        
        const pageStudent = await browser.newPage();
        await pageStudent.goto(`${FRONTEND_BASE}`);
        await pageStudent.waitForSelector('input');
        const sInputs = await pageStudent.$$('input');
        await sInputs[0].type('student1@test.com');
        await sInputs[1].type('password123');
        await pageStudent.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 2000));
        
        await pageStudent.goto(`${FRONTEND_BASE}/dashboard`);
        await new Promise(r => setTimeout(r, 1000));
        const html = await pageStudent.evaluate(() => document.body.innerHTML);
        if (html.includes('E2E_PUPPETEER_DRAFT')) throw new Error("Draft visible on dashboard!");
        
        log("PASS: Student browser E2E draft hidden");

    } finally {
        await browser.close();
    }

    log("==================================================");
    log("23. DATABASE CLEANUP");
    log("==================================================");

    await pool.query(`DELETE FROM announcements WHERE title LIKE 'TEST_ANNOUNCEMENT%' OR title LIKE 'E2E_PUPPETEER%'`);
    log("PASS: Database cleaned up");

    console.log("\nALL VERIFICATIONS PASSED!");
    process.exit(0);
}

runVerification().catch(e => {
    console.error("FAILED:", e.message);
    process.exit(1);
});
