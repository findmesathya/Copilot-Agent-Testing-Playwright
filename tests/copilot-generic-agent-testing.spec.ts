import { test, expect, chromium, Locator } from '@playwright/test';

// ✅ TEST SCENARIOS - Add as many agent/prompt combinations as you want to test
const TEST_SCENARIOS = [
  {
    agentName: 'Prompt Coach',
    prompt: 'Help me write a professional email about project updates',
    description: 'Test Prompt Coach with email writing request'
  },
  {
    agentName: 'Researcher',
    prompt: 'What are the latest trends in artificial intelligence?',
    description: 'Test Researcher with AI trends question'
  },
  {
    agentName: 'Analyst',
    prompt: 'Analyze the performance metrics for our Q4 sales data',
    description: 'Test Analyst with data analysis request'
  }
  // Add more scenarios here as needed
];

test.describe('Microsoft Copilot - Generic Agent Testing', () => {
  
  // Run tests for each scenario
  for (const scenario of TEST_SCENARIOS) {
    test(`should test ${scenario.agentName} - ${scenario.description}`, async () => {
      // Increase test timeout for debug mode
      test.setTimeout(300000); // 5 minutes for debug mode
      
      const { agentName, prompt } = scenario;
      
      let browser;
      let context;
      let page;

      try {
        // Connect to existing Edge browser instance
        browser = await chromium.connectOverCDP('http://localhost:9222');
        context = browser.contexts()[0] || await browser.newContext();
        page = context.pages()[0] || await context.newPage();

        console.log(`🚀 Starting test for ${agentName}`);
        console.log(`📝 Prompt: "${prompt}"`);

        // Navigate to Copilot (if not already there)
        await page.goto('https://m365.cloud.microsoft/chat/?internalredirect=CCM&auth=2');
        
        // Wait for basic page load
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);

        // Step 1: Click on "All agents"
        console.log('Step 1: Navigating to Agent Store...');
        const allAgentsClicked = await clickElement(page, [
          'text="All agents"',
          '[href*="agents"]',
          'a:has-text("All agents")',
          'button:has-text("All agents")',
          'a[data-testid*="all-agents"]'
        ], 'All agents');

        if (!allAgentsClicked) {
          console.log('Could not find "All agents" link, may already be on agents page');
        }

        await page.waitForTimeout(2000);

        // Step 2: Search for the agent
        console.log(`Step 2: Searching for ${agentName}...`);
        const searchResult = await searchForAgent(page, agentName);
        
        if (!searchResult) {
          throw new Error(`Could not search for ${agentName}`);
        }

        // Step 3: Select the agent
        console.log(`Step 3: Selecting ${agentName}...`);
        const agentSelected = await selectAgent(page, agentName);
        
        if (!agentSelected) {
          throw new Error(`Could not select ${agentName} from search results`);
        }

        await page.waitForTimeout(3000);

        // Step 4: Send the prompt
        console.log(`Step 4: Sending prompt to ${agentName}...`);
        const promptSent = await sendPrompt(page, prompt);
        
        if (!promptSent) {
          throw new Error(`Could not send prompt to ${agentName}`);
        }

        console.log(`✅ Successfully completed test for ${agentName}`);
        console.log(`📤 Sent: "${prompt}"`);

        // Verify we're connected and page is functional
        await expect(page.locator('body')).toBeVisible();

      } catch (error) {
        console.log(`❌ Test failed for ${agentName}: ${error.message}`);
        throw error;
      }
    });
  }
});

// Helper function to click an element using multiple selectors
async function clickElement(page: any, selectors: string[], elementName: string): Promise<boolean> {
  for (const selector of selectors) {
    try {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 5000 })) {
        await element.click();
        console.log(`✅ Successfully clicked ${elementName}`);
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

// Helper function to search for an agent
async function searchForAgent(page: any, agentName: string): Promise<boolean> {
  const searchSelectors = [
    'input[placeholder*="Search agents"]',
    'input[placeholder*="search"]',
    '[data-testid*="search"]',
    'input[type="search"]',
    '.search-input',
    '#search-agents'
  ];

  for (const selector of searchSelectors) {
    try {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 5000 })) {
        await element.fill(agentName);
        await page.waitForTimeout(1000);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(10000);
        console.log(`✅ Successfully searched for ${agentName}`);
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

// Helper function to select an agent from search results
async function selectAgent(page: any, agentName: string): Promise<boolean> {
  const agentSelectors = [
    `div:has-text("${agentName}"):not(:has-text("search")):visible`,
    `button:has-text("${agentName}")`,
    `[data-testid*="${agentName.toLowerCase().replace(/\s+/g, '-')}"]`,
    `.agent-card:has-text("${agentName}")`,
    `.search-suggestion:has-text("${agentName}")`,
    `text="${agentName}"`,
    `:is(button, a, div[role="button"], [tabindex]):has-text("${agentName}")`,
    `div:has(img) + div:has-text("${agentName}")`,
    `div:has([data-testid*="icon"]):has-text("${agentName}")`
  ];

  for (let i = 0; i < agentSelectors.length; i++) {
    const selector = agentSelectors[i];
    try {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        for (let j = 0; j < count; j++) {
          const element = elements.nth(j);
          const isVisible = await element.isVisible({ timeout: 2000 });
          
          if (isVisible) {
            await element.click();
            console.log(`✅ Successfully selected ${agentName}`);
            return true;
          }
        }
      }
    } catch {
      continue;
    }
  }
  return false;
}

// Helper function to send a prompt
async function sendPrompt(page: any, prompt: string): Promise<boolean> {
  const chatInputSelectors = [
    'textarea[placeholder*="message"]',
    'textarea[placeholder*="Message Copilot"]', 
    'input[type="text"]',
    'textarea',
    '#chat-input',
    '[data-testid*="chat-input"]',
    '[role="textbox"]',
    'div[contenteditable="true"]',
    '[contenteditable="true"]'
  ];

  for (const selector of chatInputSelectors) {
    try {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 10000 })) {
        await element.fill(prompt);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        console.log(`✅ Successfully sent prompt: "${prompt}"`);
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}
