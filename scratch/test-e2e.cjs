const puppeteer = require('puppeteer');
const { Client } = require('pg');

async function runE2E() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const db = new Client({ connectionString: 'postgres://aiclub:password@localhost:5433/aiclub_db' });
  await db.connect();

  let results = {};

  try {
    // 1. Admin Login
    await page.goto('http://localhost:5173/admin/login');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@college.edu');
    await page.type('input[type="password"]', 'admin123');
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);
    results['Admin Login'] = 'PASS';

    // 2. Admin Dashboard
    await page.goto('http://localhost:5173/admin');
    await page.waitForSelector('.metric-card');
    results['Admin Dashboard'] = 'PASS';

    // 3. Admin Members
    await page.goto('http://localhost:5173/admin/members');
    await page.waitForSelector('.admin-table');
    const memberRows = await page.$$('.admin-table tbody tr');
    if (memberRows.length === 0) throw new Error('No members found in Admin Members');
    
    // 4. Admin Member Detail
    await Promise.all([
      page.waitForNavigation(),
      page.click('.admin-table tbody tr:first-child a.view-link')
    ]);
    await page.waitForSelector('.detail-card');
    results['Admin Member Workflow'] = 'PASS';

    // 5. Achievement E2E
    await page.goto('http://localhost:5173/admin/achievements');
    await page.waitForSelector('.admin-table');
    await page.click('button.btn-primary'); // Add Achievement
    await page.waitForSelector('.modal');
    const uniqAch = 'E2E Test Achievement ' + Date.now();
    const titleInputs = await page.$$('input[type="text"]');
    await titleInputs[1].type(uniqAch); // title input
    await page.type('textarea', 'E2E Description');
    // select category
    await page.select('.modal select', 'Hackathons');
    await page.type('input[type="date"]', '2026-10-04');
    // Save
    await Promise.all([
      page.click('.modal button.btn-primary'),
      new Promise(r => setTimeout(r, 1000))
    ]);
    // verify in DB
    const res = await db.query('SELECT * FROM achievements WHERE title = $1', [uniqAch]);
    if (res.rowCount !== 1) throw new Error('Achievement not in DB');
    
    // Student UI verify
    await page.goto('http://localhost:5173/achievements');
    await page.waitForSelector('.achievement-card');
    const content = await page.content();
    if (!content.includes(uniqAch)) throw new Error('Achievement not in Student UI');
    
    // Delete in Admin
    await page.goto('http://localhost:5173/admin/achievements');
    await page.waitForSelector('.admin-table');
    const achs = await page.$$('.admin-table tbody tr');
    for (let ach of achs) {
      const text = await page.evaluate(el => el.textContent, ach);
      if (text.includes(uniqAch)) {
        const delBtn = await ach.$('button.action-btn.delete-btn');
        if (delBtn) {
          await delBtn.click();
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    const res2 = await db.query('SELECT * FROM achievements WHERE title = $1', [uniqAch]);
    if (res2.rowCount !== 0) throw new Error('Achievement still in DB after delete');
    results['Achievement E2E'] = 'PASS';

    // 6. Updates E2E
    const uniqUpdate = 'E2E Update ' + Date.now();
    await page.goto('http://localhost:5173/admin/updates');
    await page.waitForSelector('.admin-table');
    await page.click('button.btn-primary'); 
    await page.waitForSelector('.modal');
    const upInputs = await page.$$('input[type="text"]');
    await upInputs[1].type(uniqUpdate);
    await page.type('textarea', 'Update summary E2E');
    await page.type('input[type="date"]', '2026-10-04');
    await Promise.all([
      page.click('.modal button.btn-primary'),
      new Promise(r => setTimeout(r, 1000))
    ]);
    const resU = await db.query('SELECT * FROM updates WHERE title = $1', [uniqUpdate]);
    if (resU.rowCount !== 1) throw new Error('Update not in DB');
    
    // Student UI
    await page.goto('http://localhost:5173/updates');
    await page.waitForSelector('.update-card');
    const contentU = await page.content();
    if (!contentU.includes(uniqUpdate)) throw new Error('Update not in Student UI');
    
    // Delete
    await page.goto('http://localhost:5173/admin/updates');
    await page.waitForSelector('.admin-table');
    const ups = await page.$$('.admin-table tbody tr');
    for (let u of ups) {
      const text = await page.evaluate(el => el.textContent, u);
      if (text.includes(uniqUpdate)) {
        const delBtn = await u.$('button.action-btn.delete-btn');
        if (delBtn) {
          await delBtn.click();
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    const resU2 = await db.query('SELECT * FROM updates WHERE title = $1', [uniqUpdate]);
    if (resU2.rowCount !== 0) throw new Error('Update still in DB after delete');
    results['Update E2E'] = 'PASS';

    // 7. Projects E2E
    const uniqProj = 'E2E Project ' + Date.now();
    await page.goto('http://localhost:5173/admin/projects');
    await page.waitForSelector('.admin-table');
    await page.click('button.btn-primary'); 
    await page.waitForSelector('.modal');
    const pInputs = await page.$$('input[type="text"]');
    await pInputs[1].type(uniqProj);
    await page.type('textarea', 'Project desc E2E');
    await page.type('input[placeholder*="React"]', 'E2E, Test');
    await Promise.all([
      page.click('.modal button.btn-primary'),
      new Promise(r => setTimeout(r, 1000))
    ]);
    const resP = await db.query('SELECT * FROM projects WHERE title = $1', [uniqProj]);
    if (resP.rowCount !== 1) throw new Error('Project not in DB');
    
    // Student UI
    await page.goto('http://localhost:5173/projects');
    await page.waitForSelector('.project-card');
    const contentP = await page.content();
    if (!contentP.includes(uniqProj)) throw new Error('Project not in Student UI');
    
    // Delete
    await page.goto('http://localhost:5173/admin/projects');
    await page.waitForSelector('.admin-table');
    const projs = await page.$$('.admin-table tbody tr');
    for (let p of projs) {
      const text = await page.evaluate(el => el.textContent, p);
      if (text.includes(uniqProj)) {
        const delBtn = await p.$('button.action-btn.delete-btn');
        if (delBtn) {
          await delBtn.click();
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    const resP2 = await db.query('SELECT * FROM projects WHERE title = $1', [uniqProj]);
    if (resP2.rowCount !== 0) throw new Error('Project still in DB after delete');
    results['Project E2E'] = 'PASS';

    // 8. Courses E2E
    const uniqCourse = 'E2E Course ' + Date.now();
    await page.goto('http://localhost:5173/admin/courses');
    await page.waitForSelector('.admin-table');
    await page.click('button.btn-primary'); 
    await page.waitForSelector('.modal');
    const cInputs = await page.$$('input[type="text"]');
    await cInputs[1].type(uniqCourse);
    await cInputs[2].type('E2E Provider');
    await page.type('textarea', 'Course desc E2E');
    await page.type('input[placeholder*="URL"]', 'https://e2e.com');
    await Promise.all([
      page.click('.modal button.btn-primary'),
      new Promise(r => setTimeout(r, 1000))
    ]);
    const resC = await db.query('SELECT * FROM courses WHERE title = $1', [uniqCourse]);
    if (resC.rowCount !== 1) throw new Error('Course not in DB');
    
    // Student UI
    await page.goto('http://localhost:5173/courses');
    await page.waitForSelector('.course-card');
    const contentC = await page.content();
    if (!contentC.includes(uniqCourse)) throw new Error('Course not in Student UI');
    
    // Delete
    await page.goto('http://localhost:5173/admin/courses');
    await page.waitForSelector('.admin-table');
    const courses = await page.$$('.admin-table tbody tr');
    for (let c of courses) {
      const text = await page.evaluate(el => el.textContent, c);
      if (text.includes(uniqCourse)) {
        const delBtn = await c.$('button.action-btn.delete-btn');
        if (delBtn) {
          await delBtn.click();
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    const resC2 = await db.query('SELECT * FROM courses WHERE title = $1', [uniqCourse]);
    if (resC2.rowCount !== 0) throw new Error('Course still in DB after delete');
    results['Course E2E'] = 'PASS';

    // Student Browser Flow
    await page.goto('http://localhost:5173/'); // or /login
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 's2026@college.edu');
    await page.type('input[type="password"]', 'password123');
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);
    results['Student Login'] = 'PASS';
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForSelector('.metric-card');
    results['Student Dashboard'] = 'PASS';

  } catch (err) {
    console.error(err);
    results['ERROR'] = err.message;
  } finally {
    console.log(JSON.stringify(results, null, 2));
    await browser.close();
    await db.end();
  }
}
runE2E();
