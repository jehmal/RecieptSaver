const { chromium } = require('playwright');

async function analyzeConsoleErrors() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  
  // Listen to console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      errors.push({
        text,
        location: msg.location(),
        args: msg.args()
      });
    } else if (type === 'warning') {
      warnings.push({
        text,
        location: msg.location(),
        args: msg.args()
      });
    }
  });
  
  // Navigate and perform actions
  try {
    await page.goto('http://localhost:8081');
    await page.waitForTimeout(2000);
    
    // Click through onboarding
    const skipButton = await page.getByText('').first();
    if (skipButton) await skipButton.click();
    await page.waitForTimeout(1000);
    
    // Click Sign In
    await page.getByText('Sign In').click();
    await page.waitForTimeout(1000);
    
    // Click Sign In without credentials
    await page.getByText('Sign In').nth(2).click();
    await page.waitForTimeout(2000);
    
    // Click on a receipt
    const receiptButton = await page.getByRole('button', { name: /Whole Foods|Target|Starbucks/ }).first();
    if (receiptButton) await receiptButton.click();
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('Navigation error:', error);
  }
  
  // Output results
  console.log('\n=== CONSOLE ERRORS ===');
  errors.forEach((err, idx) => {
    console.log(`\nError ${idx + 1}:`);
    console.log('Text:', err.text);
    console.log('Location:', err.location);
  });
  
  console.log('\n=== CONSOLE WARNINGS ===');
  warnings.forEach((warn, idx) => {
    console.log(`\nWarning ${idx + 1}:`);
    console.log('Text:', warn.text);
    console.log('Location:', warn.location);
  });
  
  await browser.close();
}

analyzeConsoleErrors().catch(console.error);