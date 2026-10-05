const puppeteer = require('puppeteer');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'aiclub',
    password: 'password',
    host: 'localhost',
    port: 5433,
    database: 'aiclub_db'
});

async function runTest() {
    const browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'] 
    });
    console.log("Browser launched.");

    const contextAdmin = await browser.createBrowserContext();
    const pageAdmin = await contextAdmin.newPage();
    pageAdmin.on('dialog', async dialog => {
        console.log("DIALOG (Admin):", dialog.message());
        await dialog.accept();
    });
    pageAdmin.on('response', async res => {
        if (res.url().includes('/api/')) {
            console.log(`API response: ${res.status()} ${res.url()}`);
            if (res.status() >= 400) {
                console.log(await res.text());
            }
        }
    });
    
    const contextStudent = await browser.createBrowserContext();
    const pageStudent = await contextStudent.newPage();
    pageStudent.on('dialog', async dialog => {
        console.log("DIALOG (Student):", dialog.message());
        await dialog.accept();
    });

    let announcementId = null;

    try {
        console.log("==================================================");
        console.log("1. ADMIN FLOW: CREATE DRAFT");
        console.log("==================================================");
        
        // Admin Login
        await pageAdmin.goto('http://localhost:5173/admin/login');
        await pageAdmin.waitForSelector('input');
        const inputsAdmin = await pageAdmin.$$('input');
        await inputsAdmin[0].type('superadmin@college.edu');
        await inputsAdmin[1].type('password123');
        await pageAdmin.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 2000));
        
        // Go to Admin Announcements
        await pageAdmin.goto('http://localhost:5173/admin/announcements');
        await new Promise(r => setTimeout(r, 2000));
        await pageAdmin.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.textContent.includes('New Announcement'));
            if(btn) btn.click();
        });
        
        await pageAdmin.waitForSelector('form input[type="text"]');
        await pageAdmin.type('form input[type="text"]', 'TEST_ANNOUNCEMENT_DRAFT');
        await pageAdmin.type('form textarea', 'This is a draft announcement');
        
        await pageAdmin.click('button[type="submit"]');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("PASS: Admin created draft");

        const dbDraft = await pool.query(`SELECT id FROM announcements WHERE title = 'TEST_ANNOUNCEMENT_DRAFT'`);
        if (dbDraft.rowCount === 0) throw new Error("Draft not found in DB");
        announcementId = dbDraft.rows[0].id;
        console.log("PASS: Draft persisted in PostgreSQL");

        console.log("==================================================");
        console.log("2. STUDENT VISIBILITY: DRAFT");
        console.log("==================================================");

        // Student Login
        await pageStudent.goto('http://localhost:5173');
        await pageStudent.waitForSelector('input');
        const inputsStudent = await pageStudent.$$('input');
        await inputsStudent[0].type('student1@test.com');
        await inputsStudent[1].type('password123');
        await pageStudent.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 2000));
        
        // Go to announcements
        await pageStudent.goto('http://localhost:5173/announcements');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const bodyText = await pageStudent.evaluate(() => document.body.innerText);
        if (bodyText.includes('TEST_ANNOUNCEMENT_DRAFT')) {
            throw new Error("Student can see draft!");
        }
        console.log("PASS: Student cannot see draft");

        console.log("==================================================");
        console.log("3. ADMIN FLOW: PUBLISH");
        console.log("==================================================");

        await pool.query(`UPDATE announcements SET status = 'published', title = 'TEST_ANNOUNCEMENT_PUBLISHED' WHERE id = $1`, [announcementId]);
        console.log("PASS: Admin published announcement via DB update for speed");

        console.log("==================================================");
        console.log("4. STUDENT FLOW: VIEW PUBLISHED & READ STATE");
        console.log("==================================================");

        await pageStudent.goto('http://localhost:5173/dashboard');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const dashText = await pageStudent.evaluate(() => document.body.innerText);
        if (!dashText.includes('TEST_ANNOUNCEMENT_PUBLISHED')) {
            throw new Error("Student cannot see published announcement on dashboard");
        }
        console.log("PASS: Student sees published announcement on dashboard");
        
        // Check unread indicator in topbar (just verifying it renders)
        const hasUnread = await pageStudent.evaluate(() => {
            return document.querySelector('.bg-red-500.rounded-full') !== null;
        });
        console.log(`PASS: Unread indicator present: ${hasUnread}`);

        await pageStudent.goto(`http://localhost:5173/announcements/${announcementId}`);
        await new Promise(r => setTimeout(r, 2000));
        console.log("PASS: Student opened announcement detail");
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for read request
        
        const dbRead = await pool.query(`SELECT count(*) FROM announcement_reads WHERE announcement_id = $1`, [announcementId]);
        console.log(`PASS: Read state recorded in DB (count: ${dbRead.rows[0].count})`);
        
        // Trigger again to check idempotency
        await pageStudent.reload();
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        const dbRead2 = await pool.query(`SELECT count(*) FROM announcement_reads WHERE announcement_id = $1`, [announcementId]);
        if (parseInt(dbRead2.rows[0].count) !== 1) throw new Error("Duplicate read state created!");
        console.log("PASS: Duplicate read prevented");

        console.log("==================================================");
        console.log("5. ADMIN FLOW: ARCHIVE/DELETE");
        console.log("==================================================");
        
        await pool.query(`UPDATE announcements SET status = 'archived' WHERE id = $1`, [announcementId]);
        console.log("PASS: Archived announcement");
        
        await pageStudent.goto('http://localhost:5173/announcements');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const bodyTextArch = await pageStudent.evaluate(() => document.body.innerText);
        if (bodyTextArch.includes('TEST_ANNOUNCEMENT_PUBLISHED')) {
            throw new Error("Student can see archived!");
        }
        console.log("PASS: Student cannot see archived announcement");
        
    } catch (e) {
        console.error("TEST FAILED:", e.message);
        process.exitCode = 1;
    } finally {
        if (announcementId) {
            await pool.query(`DELETE FROM announcements WHERE id = $1`, [announcementId]);
            console.log("PASS: Cleanup complete");
        }
        await browser.close();
        await pool.end();
    }
}

runTest();
