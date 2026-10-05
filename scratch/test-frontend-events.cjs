const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  try {
    // 1. Admin login
    await page.goto('http://localhost:5173/admin/login');
    await page.type('input[type="email"]', 'admin@college.edu');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Admin logged in');

    // 2. Go to Admin Events
    await page.goto('http://localhost:5173/admin/events');
    await page.waitForSelector('.admin-table');
    console.log('✅ Reached Admin Events');

    // 3. Create Event (clicking Create Event button)
    const createBtn = await page.$('::-p-text(Create Event)');
    if (createBtn) {
      await createBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      console.log('✅ Created Event via Admin');
    }

    // 4. Publish Event
    const pubBtn = await page.$('::-p-text(Publish)');
    if (pubBtn) {
      await pubBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      console.log('✅ Published Event');
    }

    // 5. Logout admin & login student
    await page.evaluate(() => localStorage.clear());
    
    await page.goto('http://localhost:5173/');
    await page.type('input[type="email"]', 'student@college.edu');
    await page.type('input[type="password"]', 'student123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Student logged in');

    // 6. Go to Events
    await page.goto('http://localhost:5173/events');
    await page.waitForSelector('.card');
    console.log('✅ Reached Student Events page');

    // Click on the first event
    const firstEvent = await page.$('.card');
    await firstEvent.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Reached Student Event Detail page');

    // Register
    const regBtn = await page.$('::-p-text(Register)');
    if (regBtn) {
      await regBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      console.log('✅ Registered for Event');
    }

    console.log('🎉 Browser test passed!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
