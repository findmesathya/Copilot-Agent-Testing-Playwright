import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to Microsoft Copilot login page
  await page.goto('https://m365.cloud.microsoft/chat/?internalredirect=CCM&auth=2');
  
  // Wait for the page to load and redirect to login if needed
  await page.waitForLoadState('networkidle');
  
  // Check if we're redirected to login page
  const currentUrl = page.url();
  if (currentUrl.includes('login.microsoftonline.com') || currentUrl.includes('login.live.com')) {
    console.log('Redirected to login page, proceeding with authentication...');
    
    // Fill in email
    const emailInput = page.locator('input[type="email"], input[name="loginfmt"]');
    await emailInput.waitFor({ timeout: 10000 });
    await emailInput.fill('saraveen@microsoft.com');
    
    // Click Next
    const nextButton = page.locator('input[type="submit"], button[type="submit"]').first();
    await nextButton.click();
    
    // Wait for password page
    await page.waitForLoadState('networkidle');
    
    // Note: Password needs to be entered manually or provided via environment variable
    // For security, we'll pause here for manual password entry
    console.log('🔐 Please enter your password manually in the browser window...');
    console.log('💡 The browser should be visible - if not, run: npm run auth:setup');
    console.log('⏳ Waiting for you to complete login (password + MFA if required)...');
    
    // Wait for successful login - look for Copilot interface
    await page.waitForURL(/.*copilot|.*chat|.*m365.cloud.microsoft.*/, { timeout: 180000 });
    
    // Verify we're logged in by checking for chat interface elements
    const chatInterface = page.locator('textarea, input[type="text"], [role="textbox"]');
    await expect(chatInterface.first()).toBeVisible({ timeout: 70000 });
    
    console.log('Successfully authenticated and logged into Microsoft Copilot!');
  } else {
    console.log('Already logged in or redirected to Copilot directly');
    
    // Still verify we have access to the chat interface
    const chatInterface = page.locator('textarea, input[type="text"], [role="textbox"]');
    await expect(chatInterface.first()).toBeVisible({ timeout: 3000000 });
  }
  
  // Save signed-in state to 'playwright/.auth/user.json'
  await page.context().storageState({ path: authFile });
  
  console.log('Authentication state saved to:', authFile);
});
