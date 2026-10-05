import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log('Navigating to login...');
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('input[type="email"]');

    console.log('Logging in...');
    await page.type('input[type="email"]', 'student@college.edu');
    await page.type('input[type="password"]', 'student123');
    await page.click('button[type="submit"]');

    console.log('Waiting for dashboard...');
    await page.waitForSelector('.dashboard-intro', { timeout: 10000 });
    
    // Check for profile completion widget
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes('complete')) {
      console.log('Profile completion widget is visible!');
    } else {
      console.log('Profile completion widget NOT visible!');
    }
    
    console.log('Navigating to profile...');
    await page.goto('http://127.0.0.1:5173/profile');
    await page.waitForSelector('.profile-header', { timeout: 10000 });
    
    console.log('Clicking Edit Profile...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const editBtn = btns.find(b => b.innerText.includes('Edit Profile'));
      if(editBtn) editBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    console.log('Typing new bio...');
    await page.waitForSelector('textarea[name="bio"]');
    await page.type('textarea[name="bio"]', ' Test bio updated via Puppeteer');
    
    console.log('Saving profile...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.innerText.includes('Save Changes'));
      if(saveBtn) saveBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    // verify it updated
    const newText = await page.evaluate(() => document.body.innerText);
    if (newText.includes('Test bio updated via Puppeteer')) {
      console.log('Profile edit successful and verified in UI!');
    } else {
      console.log('Profile edit failed!');
    }
    
    await page.screenshot({ path: 'C:/Users/Acer/.gemini/antigravity-ide/brain/9db1bd9d-0826-4b0d-a28a-b125fbf4783d/puppeteer-profile.webp', type: 'webp' });
    console.log('Done!');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();
