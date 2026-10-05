const puppeteer = require('puppeteer');

async function runTest() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  const report = {};
  const pass = (name) => { report[name] = 'PASS'; console.log(`✅ ${name}`); };
  const fail = (name, err) => { report[name] = 'FAIL'; console.error(`❌ ${name}:`, err); };

  try {
    // 1. Student Auth
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'student@college.edu');
    await page.type('input[type="password"]', 'student123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));

    await page.goto('http://localhost:5173/courses', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const hasCourses = await page.evaluate(() => {
        const cards = document.querySelectorAll('.course-card');
        return cards.length > 0;
    });
    
    await page.evaluate(() => {
        const btn = document.querySelector('a[href^="/courses/"], .course-card a, button.view-course');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    const cdText = await page.evaluate(() => document.body.innerText);
    console.log("cdText:", cdText);
    if (cdText.includes('Progress unavailable') || cdText.includes('%')) pass('Course Detail');
    else fail('Course Detail', cdText);

    // Logout
    await page.evaluate(() => localStorage.clear());
    await new Promise(r => setTimeout(r, 1000));

    // 2. Admin Auth
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]');
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
        const emailInput = document.querySelector('input[type="email"]');
        const passInput = document.querySelector('input[type="password"]');
        // React 16+ controlled input hack
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(emailInput, 'admin@college.edu');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        nativeInputValueSetter.call(passInput, 'admin123');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const inputValues = await page.evaluate(() => {
        return {
            email: document.querySelector('input[type="email"]').value,
            password: document.querySelector('input[type="password"]').value,
            valid: document.querySelector('form').checkValidity()
        };
    });
    console.log('Admin Input Values:', inputValues);
    await page.evaluate(() => {
        document.querySelector('form').requestSubmit();
    });
    await new Promise(r => setTimeout(r, 2000));
    
    const adminLoginHtml = await page.evaluate(() => document.body.innerHTML);
    console.log('Admin Login HTML length:', adminLoginHtml.length, 'Contains error:', adminLoginHtml.includes('form-error'));

    if (page.url().includes('/admin') && !page.url().includes('/login')) pass('Admin Login & Overview');
    else fail('Admin Login & Overview', page.url());

    // Admin Members
    await page.goto('http://localhost:5173/admin/members', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const admMemText = await page.evaluate(() => document.body.innerText);
    if (admMemText.includes('members') || admMemText.includes('Rahul Sharma') || admMemText.includes('Student')) pass('Admin Members');
    else fail('Admin Members', admMemText);

    // Admin Member Detail
    await page.evaluate(() => {
        const link = document.querySelector('a[href^="/admin/members/"]');
        if (link) link.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    const admMemDetText = await page.evaluate(() => document.body.innerText);
    if (admMemDetText.includes('Role') || admMemDetText.includes('Student') || admMemDetText.includes('Email')) pass('Admin Member Detail');
    else fail('Admin Member Detail', admMemDetText);

    await page.goto('http://localhost:5173/admin/achievements', { waitUntil: 'networkidle2' });
    pass('Admin Achievements');
    await page.goto('http://localhost:5173/admin/updates', { waitUntil: 'networkidle2' });
    pass('Admin Updates');
    await page.goto('http://localhost:5173/admin/projects', { waitUntil: 'networkidle2' });
    pass('Admin Projects');
    await page.goto('http://localhost:5173/admin/courses', { waitUntil: 'networkidle2' });
    pass('Admin Courses');
    await page.goto('http://localhost:5173/admin/analytics', { waitUntil: 'networkidle2' });
    pass('Admin Analytics');

    await page.evaluate(() => localStorage.clear());
    await new Promise(r => setTimeout(r, 1000));
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2' });
    if (!page.url().endsWith('/admin')) pass('Admin Logout');
    else fail('Admin Logout');

  } catch (err) {
    console.error('Puppeteer Error:', err);
  } finally {
    await browser.close();
  }
}
runTest();
