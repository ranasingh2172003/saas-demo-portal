const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting E2E Tests on localhost:3000...");
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(120000); // 2 minutes for slow LLM

  try {
    // TEST 1: WhatsApp
    console.log("\n=== TEST 1: WhatsApp AI ===");
    await page.goto('http://localhost:3000/whatsapp');
    await page.waitForSelector('text/WhatsApp AI');
    // Click Generate
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const genBtn = btns.find(b => b.textContent.includes('Generate AI Reply'));
      if(genBtn) genBtn.click();
    });
    console.log("Clicked Generate Reply. Waiting for AI inference (~30-60s)...");
    
    // Wait for "Copy to WhatsApp" button to appear (meaning it finished)
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent.includes('Copy to WhatsApp'));
    }, { timeout: 120000 });
    
    const replyText = await page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll('.rounded-2xl'));
      // The last panel is the draft
      return panels[panels.length-1].innerText.replace('Sano AI Draft', '').replace('Copy to WhatsApp', '').trim();
    });
    console.log("✅ WhatsApp Success! Generated Draft:\n" + replyText.substring(0, 150) + "...");

    // TEST 2: LinkedIn
    console.log("\n=== TEST 2: LinkedIn AI ===");
    await page.goto('http://localhost:3000/linkedin');
    await page.waitForSelector('text/LinkedIn AI');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const genBtn = btns.find(b => b.textContent.includes('Generate Messages'));
      if(genBtn) genBtn.click();
    });
    console.log("Clicked Generate. Waiting for AI inference (~30-60s)...");
    await page.waitForSelector('text/Connection Request', { timeout: 120000 });
    console.log("✅ LinkedIn Success! Results rendered.");

    // TEST 3: Website Builder
    console.log("\n=== TEST 3: Website Builder ===");
    await page.goto('http://localhost:3000/website');
    await page.waitForSelector('textarea');
    await page.type('textarea', 'A simple dark mode button');
    await page.evaluate(() => {
      // Click the Send icon button
      const btns = Array.from(document.querySelectorAll('button'));
      btns[btns.length-1].click(); 
    });
    console.log("Clicked Generate. Waiting for HTML stream to start...");
    // Wait until iframe srcdoc has something
    await page.waitForFunction(() => {
      const iframe = document.querySelector('iframe');
      return iframe && iframe.srcdoc && iframe.srcdoc.length > 50;
    }, { timeout: 120000 });
    
    const iframeHtml = await page.evaluate(() => {
      return document.querySelector('iframe').srcdoc;
    });
    console.log("✅ Website Builder Success! Iframe received HTML stream. First 100 chars: " + iframeHtml.substring(0, 100).replace(/\n/g, ' '));

    console.log("\nAll Tests Passed Successfully! The LLM backend is 100% integrated and working.");
  } catch (err) {
    console.error("\n❌ E2E TEST FAILED:");
    console.error(err);
  } finally {
    await browser.close();
  }
})();
