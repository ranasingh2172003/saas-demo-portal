const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting Voice E2E Test...");
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--use-file-for-fake-audio-capture=/tmp/hello.wav'
    ] 
  });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/voice');
    console.log("Navigated to /voice");
    
    // Wait for the button
    await page.waitForSelector('button');
    
    // Click "Start Voice Session"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => b.textContent.includes('Start Voice Session') || b.textContent.includes('Connect'));
      if(startBtn) startBtn.click();
    });
    
    console.log("Clicked Start Voice Session. Streaming fake audio...");
    
    // Wait for 15 seconds to let STT and LLM process it
    await new Promise(r => setTimeout(r, 15000));
    
    console.log("Done waiting.");
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
