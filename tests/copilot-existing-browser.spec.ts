import { test, expect, chromium, Locator, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config();

// Helper function to get video path for the test
function getVideoPath(testInfo: any): string | null {
  const attachment = testInfo.attachments.find((a: any) => a.name === 'video');
  return attachment ? attachment.path : null;
}

// Helper function to create a test summary with all artifacts
async function createTestSummary(testInfo: any, screenshotPaths: string[], hasOpenAIKey: boolean): Promise<void> {
  const summaryDir = path.join(__dirname, '../test-results/conversation-summary');
  if (!fs.existsSync(summaryDir)) {
    fs.mkdirSync(summaryDir, { recursive: true });
  }

  const videoPath = getVideoPath(testInfo);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  const summary = {
    testTitle: testInfo.title,
    testName: testInfo.titlePath.join(' > '),
    timestamp: new Date().toISOString(),
    duration: testInfo.duration,
    status: testInfo.status,
    conversationMode: hasOpenAIKey ? 'LLM-powered with GPT-4o' : 'Simple fallback',
    artifacts: {
      video: videoPath ? path.relative(summaryDir, videoPath) : null,
      screenshots: screenshotPaths.map(p => path.relative(summaryDir, p)),
      screenshotsCount: screenshotPaths.length
    },
    testConfig: {
      browser: 'Edge with existing session',
      llmAnalysis: hasOpenAIKey,
      maxConversationTurns: 5
    }
  };

  const summaryPath = path.join(summaryDir, `conversation-summary-${timestamp}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log(`📋 Test summary created: ${summaryPath}`);
  if (videoPath) {
    console.log(`🎬 Video recording: ${videoPath}`);
  }
}

// Helper function to take a screenshot and save it
async function takeScreenshot(page: Page, fileName: string): Promise<string> {
  const screenshotsDir = path.join(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  const screenshotPath = path.join(screenshotsDir, fileName);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

// Helper function to analyze screenshot using GPT-4o and generate intelligent follow-up
async function analyzeScreenshotWithLLM(screenshotPath: string, conversationContext: string, conversationTurn: number): Promise<string> {
  try {
    // Read the screenshot as base64
    const imageBuffer = fs.readFileSync(screenshotPath);
    const base64Image = imageBuffer.toString('base64');
    
    // Prepare the prompt for GPT-4o
    const systemPrompt = `You are an intelligent conversation assistant analyzing a screenshot of a Microsoft Copilot chat interface of a chat between Agent and the user. 
    Your task is to:
    1. Analyze the visual content of the screenshot to understand the current state of the conversation
    2. Read and understand the agent's latest response visible in the screenshot. This response might have some follow-up questions to user. If there are questions or clarifications needed, answer those questions in your response in Step 3
    3. Generate a natural, contextual response answer or comment that would meaningfully continue the conversation and answers if there are any follow-up questions or clarifications needed.
    
    Guidelines:
    - Generate responses that feel natural and human-like
    - Create hypothetical but relevant responses - be specific to the conversation content
    - Unless required, do not ask questions. Your job is to answer questions or continue conversation. Do not ask follow-up questions
    - Keep responses conversational and engaging
    - If the conversation seems to be concluding naturally, thank the agent. 
    
    Current conversation turn: ${conversationTurn}
    Previous conversation context: ${conversationContext}
    
    Return ONLY with response text, nothing else. Your response should not have questions. It should be a response to the Agent's text`;

    const userPrompt = `Please analyze this screenshot of a Microsoft Copilot conversation and generate an intelligent response. The screenshot shows the current state of the chat interface with the agent's latest response visible.`;

    // Make API call to OpenAI GPT-4o
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'your-api-key-here'}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const followUpResponse = data.choices[0]?.message?.content?.trim();

    if (!followUpResponse) {
      throw new Error('No response generated from LLM');
    }

    console.log(`🤖 LLM generated follow-up: "${followUpResponse}"`);
    return followUpResponse;

  } catch (error) {
    console.log(`❌ Error with LLM analysis: ${error.message}`);
    
    // Fallback to simple contextual responses if LLM fails
    const fallbackResponses = [
      "Can you tell me more about that?",
      "That's interesting! Could you elaborate?",
      "What would be the next step?",
      "How would I apply this in practice?",
      "Thank you! Is there anything else I should know?"
    ];
    
    const fallbackIndex = Math.min(conversationTurn - 1, fallbackResponses.length - 1);
    const fallbackResponse = fallbackResponses[fallbackIndex];
    console.log(`🔄 Using fallback response: "${fallbackResponse}"`);
    return fallbackResponse;
  }
}

// Helper function to determine if conversation should continue based on LLM analysis
async function shouldContinueConversationWithLLM(screenshotPath: string, conversationTurn: number): Promise<boolean> {
  // Simple rules to avoid infinite conversations
  if (conversationTurn >= 5) {
    console.log('🛑 Maximum conversation turns reached');
    return false;
  }

  try {
    // Read the screenshot as base64
    const imageBuffer = fs.readFileSync(screenshotPath);
    const base64Image = imageBuffer.toString('base64');
    
    const systemPrompt = `You are analyzing a screenshot of a Microsoft Copilot conversation to determine if the conversation should continue or naturally end.
    
    Look for signs that the conversation is concluding:
    - Agent giving final recommendations or summaries
    - Agent asking if there's anything else they can help with
    - Conversation reaching a natural conclusion point
    - User's question has been thoroughly answered
    
    Return ONLY "CONTINUE" or "END" based on whether the conversation should continue.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'your-api-key-here'}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Should this conversation continue or end naturally?'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 10,
        temperature: 0.3
      })
    });

    if (response.ok) {
      const data = await response.json();
      const decision = data.choices[0]?.message?.content?.trim().toUpperCase();
      return decision === 'CONTINUE';
    }
  } catch (error) {
    console.log(`⚠️ LLM conversation analysis failed, using fallback logic: ${error.message}`);
  }

  // Fallback: continue for first 3-4 turns, then end
  return conversationTurn < 4;
}

// Helper function to generate a follow-up question based on the agent's response
function generateFollowUpQuestion(agentResponse: string, conversationTurn: number): string {
  // This function is now deprecated in favor of LLM analysis
  // Keeping it as fallback only
  const fallbackResponses = [
    "Can you provide more details about that?",
    "How would I implement this in practice?",
    "Are there alternative approaches to consider?",
    "Can you summarize the key takeaways?",
    "Thank you! Is there anything else important I should know?"
  ];
  
  const index = Math.min(conversationTurn - 1, fallbackResponses.length - 1);
  return fallbackResponses[index];
}

// Helper function to determine if conversation should continue
function shouldContinueConversation(agentResponse: string, conversationTurn: number): boolean {
  // This function is now deprecated in favor of LLM analysis
  // Keeping it as fallback only
  return conversationTurn < 4 && agentResponse.length > 50;
}

// Main conversation loop function using LLM analysis
async function conversationLoop(page: Page, chatInput: Locator, isContentEditable: boolean): Promise<string[]> {
  let conversationTurn = 0;
  let conversationContext = '';
  const maxTurns = 5;
  const screenshotPaths: string[] = [];

  console.log('🔄 Starting intelligent conversation loop with LLM analysis...');
  
  // Check if OpenAI API key is available
  const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-api-key-here';
  if (!hasOpenAIKey) {
    console.log('⚠️ OpenAI API key not found. Set OPENAI_API_KEY environment variable for LLM analysis.');
    console.log('💡 Falling back to simple conversation logic.');
  }

  while (conversationTurn < maxTurns) {
    conversationTurn++;
    console.log(`\n--- Conversation Turn ${conversationTurn} ---`);

    // Wait for agent response to fully load
    console.log('⏳ Waiting for agent response...');
    await page.waitForTimeout(10000); // Longer wait for complete response

    // Take screenshot
    const screenshotFileName = `conversation-turn-${conversationTurn}-${Date.now()}.png`;
    const screenshotPath = await takeScreenshot(page, screenshotFileName);
    screenshotPaths.push(screenshotPath);

    let shouldContinue = false;
    let followUpQuestion = '';

    if (hasOpenAIKey) {
      // Use LLM to analyze screenshot and generate intelligent response
      console.log('🤖 Using LLM to analyze conversation and generate follow-up...');
      
      try {
        // Check if conversation should continue using LLM
        shouldContinue = await shouldContinueConversationWithLLM(screenshotPath, conversationTurn);
        
        if (shouldContinue) {
          // Generate intelligent follow-up using LLM
          followUpQuestion = await analyzeScreenshotWithLLM(screenshotPath, conversationContext, conversationTurn);
          conversationContext += ` Turn ${conversationTurn}: ${followUpQuestion}`;
        }
      } catch (error) {
        console.log(`❌ LLM analysis failed: ${error.message}`);
        // Fall back to simple logic
        shouldContinue = conversationTurn < 4;
        if (shouldContinue) {
          followUpQuestion = generateFollowUpQuestion('', conversationTurn);
        }
      }
    } else {
      // Fallback logic without LLM
      shouldContinue = conversationTurn < 4;
      if (shouldContinue) {
        followUpQuestion = generateFollowUpQuestion('', conversationTurn);
      }
    }

    // Check if we should continue the conversation
    if (!shouldContinue) {
      console.log('🏁 Conversation analysis indicates natural ending point');
      break;
    }

    console.log(`❓ Follow-up question: "${followUpQuestion}"`);

    // Send the follow-up question
    try {
      await chatInput.fill(followUpQuestion);
      await page.keyboard.press('Enter');
      console.log(`✅ Sent follow-up question`);
      
      // Brief pause between messages
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log(`❌ Error sending follow-up question: ${error.message}`);
      break;
    }
  }

  // Take final screenshot
  const finalScreenshotFileName = `conversation-final-${Date.now()}.png`;
  const finalScreenshotPath = await takeScreenshot(page, finalScreenshotFileName);
  screenshotPaths.push(finalScreenshotPath);
  
  console.log(`🎯 Intelligent conversation completed after ${conversationTurn} turns`);
  console.log(`📸 Total screenshots captured: ${screenshotPaths.length}`);
  
  return screenshotPaths;
}

test.describe('Microsoft Copilot - Intelligent Conversation with LLM Analysis', () => {
  test('should connect to existing Edge browser and conduct intelligent conversation with any Agent', async ({ }, testInfo) => {
    // ✅ CONFIGURABLE PARAMETERS - Change these to test different agents and prompts
    const AGENT_NAME = 'CAPEPilot'; // Change this to test other agents like 'Researcher', 'Analyst', etc.
    const TEST_PROMPT = 'Help me write a recognition note for a colleague who did a great job on the project'; // Change this to any prompt you want to test

    // 🤖 LLM-POWERED CONVERSATION FEATURES:
    // - Takes screenshots at each conversation turn
    // - Uses GPT-4o to analyze conversation state visually
    // - Generates intelligent, contextual follow-up questions
    // - Determines when conversation should naturally end
    // - Requires OPENAI_API_KEY environment variable (falls back to simple logic if not set)

    // Check if OpenAI API key is available for LLM analysis
    const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here';

    // Increase test timeout for debug mode and LLM analysis
    test.setTimeout(600000); // 10 minutes for LLM-powered conversation
    
    // Connect to existing Edge browser instance
    // First, you need to start Edge with: --remote-debugging-port=9222
    
    let browser;
    let context;
    let page;

    try {
      // Try to connect to existing browser
      browser = await chromium.connectOverCDP('http://localhost:9222');
      context = browser.contexts()[0] || await browser.newContext();
      page = context.pages()[0] || await context.newPage();

      console.log('Connected to existing Edge browser!');

      // Navigate to Copilot (if not already there)
      await page.goto('https://m365.cloud.microsoft/chat/?internalredirect=CCM&auth=2');
      
      // Wait for basic page load without networkidle timeout
      await page.waitForLoadState('domcontentloaded');

      // Wait for interface to load
      await page.waitForTimeout(3000);

      // Step 1: Click on "All agents" to navigate to Agent Store
      console.log('Step 1: Clicking on All agents...');
      const allAgentsSelectors = [
        'text="All agents"',
        '[href*="agents"]',
        'a:has-text("All agents")',
        'button:has-text("All agents")',
        'a[data-testid*="all-agents"]'
      ];

      let allAgentsClicked = false;
      for (const selector of allAgentsSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible({ timeout: 10000 })) {
            await element.click();
            allAgentsClicked = true;
            console.log('Successfully clicked on All agents');
            break;
          }
        } catch {
          continue;
        }
      }

      if (!allAgentsClicked) {
        console.log('Could not find "All agents" link, may already be on agents page');
      }

      // Wait for Agent Store page to load
      await page.waitForTimeout(2000);

      // Step 2: Find and use the search box to search for the specified agent
      console.log(`Step 2: Searching for ${AGENT_NAME}...`);
      const searchSelectors = [
        'input[placeholder*="Search agents"]',
        'input[placeholder*="search"]',
        '[data-testid*="search"]',
        'input[type="search"]',
        '.search-input',
        '#search-agents'
      ];

      let searchInput: Locator | null = null;
      for (const selector of searchSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible({ timeout: 10000 })) {
            searchInput = element;
            break;
          }
        } catch {
          continue;
        }
      }

      if (searchInput) {
        await searchInput.fill(AGENT_NAME);
        console.log(`Filled search input with "${AGENT_NAME}"`);
        
        // Wait a moment for dropdown suggestions to appear
        await page.waitForTimeout(1000);
        
        // Try pressing Enter or clicking search button
        await page.keyboard.press('Enter');
        console.log('Pressed Enter to search');
        
        // Wait for search results
        await page.waitForTimeout(10000);
        
        // Debug: Let's see what's on the page now
        const pageTitle = await page.title();
        console.log(`Page title after search: ${pageTitle}`);
        const url = page.url();
        console.log(`Current URL: ${url}`);
        
        // Check if we have any search results
        const hasResults = await page.locator(`*:has-text("${AGENT_NAME}")`).count();
        console.log(`Found ${hasResults} elements containing "${AGENT_NAME}" after search`);

        // Step 3: Select the specified agent from search results
        console.log(`Step 3: Selecting ${AGENT_NAME} from results...`);
        
        // First, let's see what elements we can find
        const allAgentElements = await page.locator(`*:has-text("${AGENT_NAME}")`).all();
        console.log(`Found ${allAgentElements.length} elements containing "${AGENT_NAME}"`);
        
        // Try different approaches to select the agent
        const agentSelectors = [
          // Try clicking on the main agent card/button
          `div:has-text("${AGENT_NAME}"):not(:has-text("search")):visible`,
          `button:has-text("${AGENT_NAME}")`,
          `[data-testid*="${AGENT_NAME.toLowerCase().replace(/\s+/g, '-')}"]`,
          `.agent-card:has-text("${AGENT_NAME}")`,
          // Try the dropdown suggestion first
          `.search-suggestion:has-text("${AGENT_NAME}")`,
          // Try direct text match
          `text="${AGENT_NAME}"`,
          // Try any clickable element with agent name
          `:is(button, a, div[role="button"], [tabindex]):has-text("${AGENT_NAME}")`,
          // Try the icon + text combination
          `div:has(img) + div:has-text("${AGENT_NAME}")`,
          `div:has([data-testid*="icon"]):has-text("${AGENT_NAME}")`
        ];

        let agentSelected = false;
        for (let i = 0; i < agentSelectors.length; i++) {
          const selector = agentSelectors[i];
          try {
            console.log(`Trying selector ${i + 1}: ${selector}`);
            const elements = page.locator(selector);
            const count = await elements.count();
            console.log(`Found ${count} elements with this selector`);
            
            if (count > 0) {
              // Try to click the first visible one
              for (let j = 0; j < count; j++) {
                const element = elements.nth(j);
                const isVisible = await element.isVisible({ timeout: 2000 });
                console.log(`Element ${j}: visible=${isVisible}`);
                
                if (isVisible) {
                  await element.click();
                  agentSelected = true;
                  console.log(`Successfully clicked ${AGENT_NAME} using selector: ${selector} (element ${j})`);
                  break;
                }
              }
              if (agentSelected) break;
            }
          } catch (error) {
            console.log(`Selector ${i + 1} failed: ${error.message}`);
            continue;
          }
        }

        if (!agentSelected) {
          console.log(`Could not find ${AGENT_NAME} in search results`);
        }

        // Wait for agent to load
        await page.waitForTimeout(3000);
      } else {
        console.log('Could not find search input, trying direct navigation');
      }

      // Step 4: Now find the chat input and send the prompt
      console.log('Step 4: Looking for chat input...');
      const chatInputSelectors = [
        'textarea[placeholder*="message"]',
        'textarea[placeholder*="Message Copilot"]', 
        'input[type="text"]',
        'textarea',
        '#chat-input',
        '[data-testid*="chat-input"]',
        '[role="textbox"]', // This might be a contenteditable div
        'div[contenteditable="true"]',
        '[contenteditable="true"]'
      ];

      let chatInput: Locator | null = null;
      let isContentEditable = false;
      for (const selector of chatInputSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible({ timeout: 10000 })) {
            chatInput = element;
            
            // Check if it's a contenteditable element
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            const isEditableDiv = tagName === 'div' || await element.getAttribute('contenteditable') === 'true';
            isContentEditable = isEditableDiv;
            
            console.log(`Found chat input with selector: ${selector} (${tagName}, contenteditable: ${isContentEditable})`);
            break;
          }
        } catch {
          continue;
        }
      }

      if (chatInput) {
        // Step 5: Send the test prompt to the selected agent
        console.log(`Step 5: Sending prompt to ${AGENT_NAME}...`);
        await chatInput.fill(TEST_PROMPT);
        await page.keyboard.press('Enter');
        
        // Wait for response
        await page.waitForTimeout(5000);
        
        console.log(`Successfully sent prompt: "${TEST_PROMPT}"`);
        
        // Start conversation loop and collect screenshot paths
        const screenshotPaths = await conversationLoop(page, chatInput, isContentEditable);
        
        // Create test summary with all artifacts (video, screenshots)
        await createTestSummary(testInfo, screenshotPaths, !!hasOpenAIKey);
        
        console.log(`✅ Complete workflow executed: All agents → Search → ${AGENT_NAME} → Send prompt → ${hasOpenAIKey ? 'LLM-powered' : 'Simple'} conversation completed`);
      } else {
        console.log(`❌ Chat interface not found after navigating to ${AGENT_NAME}`);
      }

      // Verify we're connected and page is functional
      await expect(page.locator('body')).toBeVisible();

    } catch (error) {
      console.log('Could not connect to existing browser. Error:', error.message);
      console.log('Make sure Edge is running with: --remote-debugging-port=9222');
      
      // Fall back to regular test approach
      throw new Error('Could not connect to existing Edge browser. Please start Edge with debugging port enabled.');
    }
  });
});
