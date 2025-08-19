#!/usr/bin/env node

/**
 * Quick test script to verify OpenAI API integration
 * Run this before running the main tests to ensure LLM analysis will work
 */

require('dotenv').config();

async function testOpenAIIntegration() {
  console.log('🧪 Testing OpenAI API Integration...\n');

  // Check if API key is set
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    console.log('❌ OPENAI_API_KEY not found or not set properly');
    console.log('💡 Please set your OpenAI API key in the .env file');
    console.log('   1. Copy .env.example to .env');
    console.log('   2. Add your OpenAI API key to the OPENAI_API_KEY variable');
    console.log('   3. Get your API key from: https://platform.openai.com/api-keys\n');
    return false;
  }

  console.log('✅ API key found');
  console.log(`   Key format: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}\n`);

  // Test API connection
  try {
    console.log('🔗 Testing API connection...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: 'Respond with exactly: "API test successful"'
          }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.choices[0]?.message?.content?.trim();
    
    if (message) {
      console.log('✅ API connection successful');
      console.log(`   Response: "${message}"\n`);
      
      console.log('🎉 OpenAI integration is ready!');
      console.log('   Your tests will use GPT-4o for intelligent conversation analysis');
      return true;
    } else {
      throw new Error('No response from API');
    }

  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    console.log('💡 Please check:');
    console.log('   - Your API key is valid and has GPT-4o access');
    console.log('   - You have sufficient API credits');
    console.log('   - Your internet connection is working\n');
    return false;
  }
}

// Run the test
testOpenAIIntegration().then(success => {
  if (!success) {
    console.log('⚠️  Tests will fall back to simple conversation logic without LLM analysis');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
