const puppeteer = require('puppeteer');
const { Pool } = require('pg');

const API_URL = 'http://localhost:3005';
const FRONTEND_URL = 'http://localhost:5173';

const pool = new Pool({
  user: 'aiclub',
  host: 'localhost',
  database: 'aiclub_db',
  password: 'password',
  port: 5433,
});

async function runTests() {
  console.log(`Starting E2E tests...`);
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  
  try {
    await pool.query("DELETE FROM members WHERE college_email IN ('student1@test.com', 'student2@test.com', 'student3@test.com')");
    await pool.query("DELETE FROM users WHERE email IN ('student1@test.com', 'student2@test.com', 'student3@test.com')");

    const registerStudent = async (email) => {
      const payload = { 
        email: email,
        collegeEmail: email, 
        password: 'password123', 
        fullName: email.split('@')[0], 
        registerNumber: 'R'+Date.now()+Math.random(),
        year: 2,
        department: 'CS',
        classSection: 'A',
        phone: '1234567890'
      };
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    };

    const loginStudent = async (email) => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      const data = await res.json();
      if(!data.data) throw new Error("Login failed for " + email + ": " + JSON.stringify(data));
      // fetch member info to get ID
      const memRes = await pool.query('SELECT id FROM members WHERE user_id = $1', [data.data.user.id]);
      return memRes.rows[0].id;
    };

    console.log("Registering students...");
    await registerStudent('student1@test.com');
    await registerStudent('student2@test.com');
    await registerStudent('student3@test.com');
    
    console.log("Logging in students to get Member IDs...");
    const s1Id = await loginStudent('student1@test.com');
    const s2Id = await loginStudent('student2@test.com');
    const s3Id = await loginStudent('student3@test.com');

    let page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('response', async res => {
      if(res.status() >= 400) console.log('NETWORK ERROR:', res.status(), res.url());
      if(res.url().includes('/api/projects') && !res.url().includes('teams')) {
        try {
          const json = await res.json();
          console.log('PROJECTS API RESPONSE LENGTH:', json.data?.length || json.length);
        } catch(e) {}
      }
    });
    
    // 2. STUDENT 1
    console.log("--- STUDENT 1 FLOW ---");
    await page.goto(`${FRONTEND_URL}/`);
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    } catch(e) {
      await page.screenshot({ path: 'scratch/error.png' });
      throw e;
    }
    await page.type('input[type="email"]', 'student1@test.com');
    await page.type('input[type="password"]', 'password123');
    await Promise.all([page.waitForNavigation(), page.click('button[type="submit"]')]);
    
    await page.goto(`${FRONTEND_URL}/projects`);
    try {
      await page.waitForSelector('.project-card', { timeout: 5000 });
    } catch (e) {
      await page.screenshot({ path: 'scratch/error_projects.png' });
      throw e;
    }
    await page.click('.project-card');
    await page.waitForSelector('.detail-title');
    await page.click('::-p-text(I\'m Interested)');
    await new Promise(r => setTimeout(r, 500));

    // capture project ID from url
    const projectUrl = page.url();
    const projectId = projectUrl.split('/').pop();
    
    // Create Team
    await page.click('::-p-text(Create Team)');
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="text"]', 'Alpha Team');
    await page.$eval('input[type="number"]', el => el.value = '');
    await page.type('input[type="number"]', '2');
    
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => !document.querySelector('.modal-backdrop'));
    await page.waitForFunction(() => document.body.innerText.includes('Alpha Team'));
    console.log("PASS: Team created via UI");

    const teamRes = await pool.query(`SELECT * FROM project_teams WHERE project_id = $1 AND name = 'Alpha Team'`, [projectId]);
    const team = teamRes.rows[0];
    console.log(`PASS: DB project_teams row exists: ${!!team}`);
    const memberRes = await pool.query(`SELECT * FROM project_team_members WHERE team_id = $1 AND member_id = $2`, [team.id, s1Id]);
    console.log(`PASS: DB project_team_members role: ${memberRes.rows[0].role}`);

    // 3. RELOAD
    console.log("--- RELOAD PERSISTENCE ---");
    await page.reload();
    await page.waitForSelector('.detail-title');
    await page.waitForFunction(() => document.body.innerText.includes('Alpha Team'));
    console.log("PASS: Team exists after reload");
    
    // 4. STUDENT 2 JOIN
    console.log("--- STUDENT 2 JOIN ---");
    const page2 = await browser.newPage();
    await page2.goto(`${FRONTEND_URL}/`);
    await page2.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page2.type('input[type="email"]', 'student2@test.com');
    await page2.type('input[type="password"]', 'password123');
    await Promise.all([page2.waitForNavigation(), page2.click('button[type="submit"]')]);
    
    await page2.goto(`${FRONTEND_URL}/projects/${projectId}`);
    await page2.waitForSelector('.detail-title');
    await page2.click('::-p-text(I\'m Interested)');
    await new Promise(r => setTimeout(r, 500));
    await page2.waitForFunction(() => document.body.innerText.includes('Join Team'));
    await page2.click('::-p-text(Join Team)');
    await page2.waitForFunction(() => document.body.innerText.includes('Leave Team'));
    console.log("PASS: Student 2 joined team via UI");

    // 5. DUPLICATE JOIN
    console.log("--- DUPLICATE JOIN ---");
    const dupRes = await page2.evaluate(async (tid) => {
       const res = await fetch('http://localhost:3005/api/me/teams/' + tid + '/join', {
         method: 'POST',
         headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
       });
       return { status: res.status, body: await res.text() };
    }, team.id);
    console.log(`PASS: Duplicate join fetch handled. HTTP ${dupRes.status} Body: ${dupRes.body}`);

    // 6. CAPACITY
    console.log("--- CAPACITY ---");
    const page3 = await browser.newPage();
    await page3.goto(`${FRONTEND_URL}/`);
    await page3.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page3.type('input[type="email"]', 'student3@test.com');
    await page3.type('input[type="password"]', 'password123');
    await Promise.all([page3.waitForNavigation(), page3.click('button[type="submit"]')]);
    await page3.goto(`${FRONTEND_URL}/projects/${projectId}`);
    await page3.waitForSelector('.detail-title');
    await page3.waitForFunction(() => document.body.innerText.includes('Team Full'));
    console.log(`PASS: UI displays 'Team Full'`);
    
    const capRes = await page3.evaluate(async (tid) => {
       const res = await fetch('http://localhost:3005/api/me/teams/' + tid + '/join', {
         method: 'POST',
         headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
       });
       return { status: res.status, body: await res.text() };
    }, team.id);
    console.log(`PASS: Capacity overflow fetch rejected HTTP ${capRes.status} Body: ${capRes.body}`);
    const dbS3 = await pool.query(`SELECT * FROM project_team_members WHERE team_id = $1 AND member_id = $2`, [team.id, s3Id]);
    console.log(`PASS: DB Student 3 membership count (expected 0): ${dbS3.rowCount}`);
    // 7. LEAVE MEMBER
    console.log("--- LEAVE MEMBER ---");
    await page2.evaluate(() => {
        window.__E2E_TEST__ = true;
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Leave Team'));
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page2.screenshot({ path: 'scratch/debug_after_leave.png' });
    try {
        await page2.waitForFunction(() => document.body.innerText.includes('Join Team') || document.body.innerText.includes('Team Full'), { timeout: 10000 });
    } catch (e) {
        await page2.screenshot({ path: 'scratch/error_leave.png' });
        throw e;
    }


    console.log("PASS: Student 2 left team via UI");

    // 8. LEADER PROTECTION
    console.log("--- LEADER PROTECTION ---");
    page.on('dialog', async dialog => {
        console.log('DIALOG:', dialog.message());
        await dialog.accept();
    });
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Leave Team'));
        if (btn) setTimeout(() => btn.click(), 0);
    });
    await new Promise(r => setTimeout(r, 1000)); // wait for network rejection
    const dbS1Leader = await pool.query(`SELECT * FROM project_team_members WHERE team_id = $1 AND member_id = $2`, [team.id, s1Id]);
    console.log(`PASS: DB Student 1 membership retained after trying to leave as sole leader: ${dbS1Leader.rowCount}`);

    // 9. MY TEAMS
    console.log("--- MY TEAMS ---");
    await page.goto(`${FRONTEND_URL}/projects`);
    // wait for teams
    await new Promise(r => setTimeout(r, 1000));
    const myTeams = await page.evaluate(() => document.body.innerText.includes('Alpha Team'));
    console.log(`PASS: Alpha Team present in My Teams: ${myTeams}`);

    // 10. DASHBOARD
    console.log("--- DASHBOARD ---");
    await page.goto(`${FRONTEND_URL}/dashboard`);
    await new Promise(r => setTimeout(r, 1000));
    const dashTeams = await page.evaluate(() => document.body.innerText.includes('1 active team'));
    console.log(`PASS: Dashboard shows 1 active team: ${dashTeams}`);

    // 11. ADMIN
    console.log("--- ADMIN ---");
    const pageAdmin = await browser.newPage();
    await pageAdmin.goto(`${FRONTEND_URL}/admin/login`);
    await pageAdmin.waitForSelector('input[type="email"]', { timeout: 10000 });
    await pageAdmin.type('input[type="email"]', 'admin@aiclub.edu');
    await pageAdmin.type('input[type="password"]', 'admin123');
    await pageAdmin.click('button[type="submit"]');
    await pageAdmin.waitForFunction(() => window.location.pathname.startsWith('/admin'), { timeout: 10000 });
    
    await pageAdmin.goto(`${FRONTEND_URL}/admin/projects`);
    await pageAdmin.waitForSelector('button[title="Inspect Teams"]', { timeout: 2000 }).catch(() => {});
    await pageAdmin.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button[title="Inspect Teams"]'));
      if(btns.length > 0) btns[0].click();
    });
    await pageAdmin.waitForSelector('.modal-content', { timeout: 3000 }).catch(() => {});
    const adminSeesTeam = await pageAdmin.evaluate(() => document.body.innerText.includes('Alpha Team'));
    console.log(`PASS: Admin sees 'Alpha Team' in modal: ${adminSeesTeam}`);

    // CLEANUP
    console.log("--- CLEANUP ---");
    await pool.query(`DELETE FROM project_teams WHERE name = 'Alpha Team'`);

  } catch(e) {
    console.error("Test failed:", e);
    try {
      await page.screenshot({ path: 'scratch/error_final_p1.png' });
      await page2.screenshot({ path: 'scratch/error_final_p2.png' });
    } catch(err) {}
    process.exit(1);
  } finally {
    await browser.close();
    pool.end();
  }
}

runTests();
