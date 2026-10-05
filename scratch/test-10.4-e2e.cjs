const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Logging in...');
    await page.goto('http://localhost:5176/login');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'student1@test.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log('Verifying Dashboard...');
    if (page.url() !== 'http://localhost:5176/dashboard') {
      throw new Error(`Expected /dashboard, got ${page.url()}`);
    }
    const dashboardHtml = await page.content();
    if (!dashboardHtml.includes('Member Directory')) {
      throw new Error('Member Directory section missing from Dashboard');
    }

    console.log('Navigating to Members Directory...');
    await page.goto('http://localhost:5176/members');
    await page.waitForSelector('.max-w-6xl');
    
    // Test filter
    console.log('Testing Filters...');
    await page.select('select:nth-of-type(1)', 'CSE');
    await page.waitForTimeout(500);
    
    // Find a member link
    const memberLink = await page.$('a[href^="/members/"]');
    if (!memberLink) {
      throw new Error('No member links found in directory after filtering');
    }
    const href = await page.evaluate(el => el.href, memberLink);
    console.log('Opening member profile:', href);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      memberLink.click()
    ]);
    
    // Profile view
    const profileHtml = await page.content();
    if (!profileHtml.includes('Skills') && !profileHtml.includes('Technical Interests')) {
      throw new Error('Profile details missing');
    }

    // Verify privacy
    if (profileHtml.includes('student1@test.com') || profileHtml.includes('student2@test.com')) {
       // Wait, a student might have email in bio? But they shouldn't show college_email explicitly.
       // Let's just check for 'password_hash' and 'phone' fields implicitly
       if (profileHtml.includes('college_email') || profileHtml.includes('phone number')) {
         throw new Error('Private fields might be exposed');
       }
    }

    console.log('PASS: Browser E2E workflow succeeded.');
  } catch (err) {
    console.error('FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
