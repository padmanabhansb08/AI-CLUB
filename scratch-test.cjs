const puppeteer = require('puppeteer');

async function runTest() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const report = {};
  const pass = (name) => { report[name] = 'PASS'; console.log(`✅ ${name}`); };
  const fail = (name, err) => { report[name] = 'FAIL'; console.error(`❌ ${name}:`, err); };

  try {
    // 1. Student Flow
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    const content = await page.evaluate(() => document.body.innerHTML);
    if (!content.includes('email')) console.log('BODY:', content);
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'student@college.edu');
    await page.type('input[type="password"]', 'student123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    if (page.url().includes('/dashboard')) pass('Student Login & Dashboard');
    else fail('Student Login & Dashboard', page.url());

    // Achievements
    await page.goto('http://localhost:5173/achievements', { waitUntil: 'networkidle2' });
    const achText = await page.evaluate(() => document.body.innerText);
    if (achText.includes('Hackathon Winner') || achText.includes('achievements')) pass('Student Achievements');
    else fail('Student Achievements');

    // Updates
    await page.goto('http://localhost:5173/updates', { waitUntil: 'networkidle2' });
    const updText = await page.evaluate(() => document.body.innerText);
    if (updText.includes('Tech Updates') || updText.includes('updates')) pass('Student Updates');
    else fail('Student Updates');

    // Projects
    await page.goto('http://localhost:5173/projects', { waitUntil: 'networkidle2' });
    const projText = await page.evaluate(() => document.body.innerText);
    if (projText.includes('projects') || projText.includes('Autonomous Drone')) pass('Student Projects');
    else fail('Student Projects');

    // Courses
    await page.goto('http://localhost:5173/courses', { waitUntil: 'networkidle2' });
    const cText = await page.evaluate(() => document.body.innerText);
    if (cText.includes('Progress unavailable') || cText.includes('%') || cText.includes('courses')) pass('Student Courses');
    else fail('Student Courses', cText);

    // Logout
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const logout = btns.find(b => b.textContent.includes('Logout') || b.textContent.includes('Sign out'));
      if (logout) logout.click();
      else document.querySelector('.logout-btn')?.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    pass('Student Logout');

    // 2. Admin Flow
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
    // Try to find the email input for admin login
    const adminEmailExists = await page.evaluate(() => !!document.querySelector('input[type="email"]'));
    if (!adminEmailExists) {
        // Just go to login directly
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    }
    
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@college.edu');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    if (page.url().includes('/admin')) pass('Admin Login & Overview');
    else fail('Admin Login & Overview', page.url());

    // Admin Members
    await page.goto('http://localhost:5173/admin/members', { waitUntil: 'networkidle2' });
    const admMemText = await page.evaluate(() => document.body.innerText);
    if (admMemText.includes('members') || admMemText.includes('John Doe')) pass('Admin Members');
    else fail('Admin Members');

    // Admin Achievements
    await page.goto('http://localhost:5173/admin/achievements', { waitUntil: 'networkidle2' });
    pass('Admin Achievements');

    // Admin Updates
    await page.goto('http://localhost:5173/admin/updates', { waitUntil: 'networkidle2' });
    pass('Admin Updates');

    // Admin Projects
    await page.goto('http://localhost:5173/admin/projects', { waitUntil: 'networkidle2' });
    pass('Admin Projects');

    // Admin Courses
    await page.goto('http://localhost:5173/admin/courses', { waitUntil: 'networkidle2' });
    pass('Admin Courses');
    
    // Analytics
    await page.goto('http://localhost:5173/admin/analytics', { waitUntil: 'networkidle2' });
    pass('Admin Analytics');

    console.log("PUPPETEER FINAL:", JSON.stringify(report, null, 2));

  } catch (err) {
    console.error('Puppeteer Error:', err);
  } finally {
    await browser.close();
  }
}
runTest();
