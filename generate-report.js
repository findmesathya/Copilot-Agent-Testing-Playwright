#!/usr/bin/env node

/**
 * HTML Report Generator for Copilot Conversation Tests
 * Generates a comprehensive HTML report with video and screenshots
 */

const fs = require('fs');
const path = require('path');

function generateComprehensiveReport() {
  try {
    console.log('🔄 Generating comprehensive test report...\n');

    // Read the test summary
    const summaryFiles = fs.readdirSync('./test-results/conversation-summary')
        .filter(file => file.endsWith('.json'))
        .sort()
        .reverse(); // Get the most recent

    if (summaryFiles.length === 0) {
        console.log('No test summary files found.');
        return;
    }

    const latestSummary = summaryFiles[0];
    const summaryPath = `./test-results/conversation-summary/${latestSummary}`;
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    console.log(`📋 Found test summary: ${latestSummary}`);

    // Read the detailed Playwright results
    let playwrightResults = null;
    try {
        playwrightResults = JSON.parse(fs.readFileSync('./test-results/results.json', 'utf8'));
        console.log('📊 Found detailed Playwright execution data');
    } catch (e) {
        console.log('⚠️  No Playwright results.json found, using basic summary only');
    }

    // Read the comprehensive template
    const template = fs.readFileSync('./test-report-template-comprehensive.html', 'utf8');

    // Extract detailed test data
    const testResult = playwrightResults?.suites?.[0]?.suites?.[0]?.specs?.[0]?.tests?.[0]?.results?.[0];
    const screenshots = summary.artifacts?.screenshots || summary.screenshots || [];

    // Generate comprehensive report content
    const reportContent = generateReportContent(template, summary, testResult, screenshots);

    // Write the report
    fs.writeFileSync('./test-results/conversation-test-report.html', reportContent);
    fs.writeFileSync('./conversation-test-report.html', reportContent);

    console.log('✅ Comprehensive test report generated: test-results/conversation-test-report.html');
    console.log('📋 Report also available at: conversation-test-report.html');
    
    const stepCount = testResult?.stdout ? 
        testResult.stdout.filter(log => {
            const text = log.text || log.toString();
            return text.includes('Step ') || text.includes('Conversation Turn') || text.includes('Screenshot saved');
        }).length : 0;
        
    console.log(`📊 Report includes: ${screenshots.length} screenshots, ${stepCount} execution steps, detailed timeline`);
    
    if (playwrightResults) {
        console.log('🎯 Enhanced with detailed Playwright execution data');
    }

  } catch (error) {
    console.error('❌ Error generating comprehensive report:', error);
  }
}

function generateReportContent(template, summary, testResult, screenshots) {
  // Helper to replace all placeholders globally
  function applyPlaceholders(tpl, values) {
    let out = tpl;
    for (const [key, val] of Object.entries(values)) {
      const safe = String(val ?? '');
      // Replace all occurrences like {{KEY}}
      out = out.replaceAll(`{{${key}}}`, safe);
    }
    return out;
  }

  // Generate screenshot gallery HTML
  let screenshotGallery = '';
  if (screenshots && screenshots.length > 0) {
      screenshotGallery = screenshots.map((screenshot, index) => {
          const filename = path.basename(screenshot);
          const screenshotTime = new Date(Date.now() - ((screenshots.length - index) * 30000));
          // Use absolute file URL so it works from both root and test-results copies
          const absPath = path.join(__dirname, 'screenshots', filename).replace(/\\/g, '/');
          const imgSrc = `file://${absPath}`;
          return `
              <div class="screenshot-item">
                  <img src="${imgSrc}" alt="Screenshot ${index + 1}">
                  <div class="screenshot-info">
                      <div class="screenshot-title">Conversation Turn ${index + 1}</div>
                      <div class="screenshot-timestamp">${screenshotTime.toLocaleTimeString()}</div>
                  </div>
              </div>
          `;
      }).join('');
  } else {
      screenshotGallery = '<p>No screenshots captured during this test run.</p>';
  }

  // Generate conversation flow steps
  let conversationSteps = '';
  if (screenshots && screenshots.length > 0) {
      conversationSteps = screenshots.map((_, index) => `
          <div class="flow-step">
              <div class="step-number">${index + 1}</div>
              <div>
                  <strong>Turn ${index + 1}:</strong> User interaction and agent response
              </div>
          </div>
      `).join('');
  }

  // Generate execution steps from console logs
  let executionSteps = '';
  if (testResult?.stdout) {
      const steps = [];
      testResult.stdout.forEach(log => {
          const text = log.text || log.toString();
          if (text.includes('Step ') || text.includes('Conversation Turn') || text.includes('Screenshot saved')) {
              steps.push(text.trim());
          }
      });
      
      executionSteps = steps.map((step, index) => `
          <div class="step-item">
              <div class="step-title">${escapeHtml(step)}</div>
              <div class="step-details">Execution step ${index + 1}</div>
          </div>
      `).join('');
  }
  
  if (!executionSteps) {
      executionSteps = '<p>No detailed execution steps available.</p>';
  }

  // Generate timeline from console logs
  let timelineItems = '';
  if (testResult?.stdout) {
      const startTime = testResult.startTime ? new Date(testResult.startTime) : new Date();
      let currentTime = 0;
      
      const timelineEvents = [];
      testResult.stdout.forEach(log => {
          const text = log.text || log.toString();
          if (text.includes('Step ') || text.includes('Conversation Turn') || 
              text.includes('Screenshot saved') || text.includes('LLM generated')) {
              timelineEvents.push({
                  time: new Date(startTime.getTime() + currentTime),
                  text: text.trim()
              });
              currentTime += 5000;
          }
      });
      
      timelineItems = timelineEvents.map(event => `
          <div class="timeline-item">
              <div class="timeline-time">${event.time.toLocaleTimeString()}</div>
              <div class="timeline-content">
                  <strong>${escapeHtml(event.text)}</strong>
              </div>
          </div>
      `).join('');
  }
  
  if (!timelineItems) {
      timelineItems = '<div class="timeline-item"><div class="timeline-content">No detailed timeline available.</div></div>';
  }

  // Generate execution logs
  let executionLogs = '';
  if (testResult?.stdout) {
      executionLogs = testResult.stdout.map(log => 
          `<div>${escapeHtml(log.text || log.toString())}</div>`
      ).join('\n');
  }
  
  if (!executionLogs) {
      executionLogs = '<div>No detailed execution logs available.</div>';
  }

  // Generate LLM analysis content
  let llmAnalysisContent = '';
  if (testResult?.stdout) {
      const llmResponses = [];
      testResult.stdout.forEach(log => {
          const text = log.text || log.toString();
          if (text.includes('LLM generated follow-up:')) {
              const response = text.replace('🤖 LLM generated follow-up: ', '').replace(/"/g, '');
              llmResponses.push(response);
          }
      });
      
      if (llmResponses.length > 0) {
          llmAnalysisContent = llmResponses.map((response, index) => `
              <div class="llm-analysis">
                  <h4>LLM Follow-up ${index + 1}</h4>
                  <p>${escapeHtml(response)}</p>
              </div>
          `).join('');
      }
  }
  
  if (!llmAnalysisContent) {
      llmAnalysisContent = '<p>No LLM analysis data available for this test run.</p>';
  }

  // Calculate metrics
  const conversationTurns = screenshots ? screenshots.length : 0;
  const successRate = testResult && testResult.status === 'passed' ? 100 : 0;
  const statusClass = (testResult?.status === 'passed') ? 'passed' : 'failed';
  const testStatus = testResult?.status || summary.status || 'Unknown';

  // Format timestamp
  const timestamp = new Date(summary.timestamp);
  const formattedTimestamp = timestamp.toLocaleString();

  // Video section
  const videoSection = `
      <div class="video-placeholder">
          <h4>📹 Test Recording</h4>
          <p>Video recording is configured but not displayed in this report.</p>
          <p>Check the test-results folder for video files if recording was enabled.</p>
      </div>
  `;

  // Replace placeholders in template
  return applyPlaceholders(template, {
      TEST_TITLE: summary.testTitle || 'Conversation Test',
      TEST_STATUS: testStatus.toUpperCase(),
      STATUS_CLASS: statusClass,
      DURATION: formatDuration(testResult?.duration || 0),
      AGENT_NAME: summary.agentName || 'Microsoft Copilot',
      BROWSER_INFO: summary.browserInfo || 'Chrome (Existing)',
      LLM_MODE: summary.llmMode || 'GPT-4o',
      SCREENSHOT_COUNT: conversationTurns,
      FORMATTED_TIMESTAMP: formattedTimestamp,
      CONVERSATION_STEPS: conversationSteps,
      CONVERSATION_TURNS: conversationTurns,
      SUCCESS_RATE: successRate,
      AGENT_RESPONSES: conversationTurns,
      INITIAL_PROMPT: summary.initialPrompt || 'Test user interaction with Microsoft Copilot',
      VIDEO_SECTION: videoSection,
      EXECUTION_STEPS: executionSteps,
      SCREENSHOT_GALLERY: screenshotGallery,
      TIMELINE_ITEMS: timelineItems,
      EXECUTION_LOGS: executionLogs,
      LLM_ANALYSIS_CONTENT: llmAnalysisContent,
  });
}

function formatDuration(ms) {
    if (!ms) return 'N/A';
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function generateHTMLReport() {
  console.log('🔄 Generating HTML test report...\n');

  const summaryDir = path.join(__dirname, 'test-results/conversation-summary');
  const reportDir = path.join(__dirname, 'test-results');
  
  // Ensure directories exist
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Find the latest test summary
  let latestSummary = null;
  if (fs.existsSync(summaryDir)) {
    const summaryFiles = fs.readdirSync(summaryDir)
      .filter(file => file.startsWith('conversation-summary-') && file.endsWith('.json'))
      .sort()
      .reverse();

    if (summaryFiles.length > 0) {
      const latestSummaryPath = path.join(summaryDir, summaryFiles[0]);
      latestSummary = JSON.parse(fs.readFileSync(latestSummaryPath, 'utf8'));
      console.log(`📋 Found test summary: ${summaryFiles[0]}`);
    }
  }

  // Read the HTML template
  const templatePath = path.join(__dirname, 'test-report-template.html');
  let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  // Prepare test data
  const testData = latestSummary || {
    testTitle: 'Microsoft Copilot Conversation Test',
    testName: 'Microsoft Copilot - Intelligent Conversation with LLM Analysis',
    timestamp: new Date().toISOString(),
    duration: 'N/A',
    status: 'No data available',
    conversationMode: 'No test data found',
    artifacts: {
      video: null,
      screenshots: [],
      screenshotsCount: 0
    },
    testConfig: {
      browser: 'Edge with existing session',
      llmAnalysis: false,
      maxConversationTurns: 5
    }
  };

  // Convert relative paths to work in the report
  const processedScreenshots = testData.artifacts.screenshots.map(screenshot => {
    if (screenshot && !screenshot.startsWith('http')) {
      return path.join('..', screenshot).replace(/\\/g, '/');
    }
    return screenshot;
  });

  const processedVideo = testData.artifacts.video ? 
    path.join('..', testData.artifacts.video).replace(/\\/g, '/') : null;

  // Create the JavaScript data injection
  const testDataScript = `
    <script>
      // Override the loadTestData function with actual data
      async function loadTestData() {
        const testData = ${JSON.stringify({
          testName: testData.testName,
          status: testData.status,
          duration: testData.duration,
          timestamp: testData.timestamp,
          conversationMode: testData.conversationMode,
          browserType: testData.testConfig.browser,
          screenshots: processedScreenshots,
          videoPath: processedVideo,
          screenshotCount: testData.artifacts.screenshotsCount
        }, null, 2)};

        // Populate the UI
        document.getElementById('testName').textContent = testData.testName;
        document.getElementById('testStatus').textContent = testData.status;
        document.getElementById('testStatus').className = 'badge ' + (testData.status === 'passed' ? 'success' : 'simple');
        document.getElementById('testDuration').textContent = testData.duration;
        document.getElementById('testTimestamp').textContent = new Date(testData.timestamp).toLocaleString();
        
        const modeElement = document.getElementById('conversationMode');
        const badgeClass = testData.conversationMode.includes('LLM-powered') ? 'llm' : 'simple';
        modeElement.innerHTML = \`<span class="badge \${badgeClass}">\${testData.conversationMode}</span>\`;
        
        document.getElementById('browserType').textContent = testData.browserType;
        document.getElementById('screenshotCount').textContent = testData.screenshotCount || testData.screenshots.length;

        // Load video if available
        const videoSection = document.getElementById('videoSection');
        if (testData.videoPath && testData.videoPath !== 'null') {
          document.getElementById('videoSource').src = testData.videoPath;
          document.getElementById('testVideo').load();
          videoSection.style.display = 'block';
        } else {
          videoSection.style.display = 'none';
        }

        // Load screenshots
        const gallery = document.getElementById('screenshotGallery');
        gallery.innerHTML = '';

        if (testData.screenshots.length === 0) {
          gallery.innerHTML = '<div class="info-card"><h3>No Screenshots Available</h3><p>Screenshots will appear here after running the conversation test. Make sure to run:</p><p><code>npm run test:copilot-conversation</code></p></div>';
        } else {
          testData.screenshots.forEach((screenshot, index) => {
            const turnNumber = index < testData.screenshots.length - 1 ? index + 1 : 'Final';
            const item = document.createElement('div');
            item.className = 'screenshot-item';
            item.innerHTML = \`
              <h4>Turn \${turnNumber}</h4>
              <img src="\${screenshot}" alt="Conversation Turn \${turnNumber}" onclick="openModal(this.src)" 
                   onerror="this.parentElement.innerHTML='<p>Screenshot not found</p>'">
            \`;
            gallery.appendChild(item);
          });
        }
      }
    </script>
  `;

  // Inject the data script before the closing body tag
  htmlTemplate = htmlTemplate.replace('</body>', testDataScript + '\n</body>');

  // Write the report
  const reportPath = path.join(reportDir, 'conversation-test-report.html');
  fs.writeFileSync(reportPath, htmlTemplate);

  console.log(`✅ HTML report generated: ${reportPath}`);
  
  // Also copy to root for easy access
  const rootReportPath = path.join(__dirname, 'conversation-test-report.html');
  fs.writeFileSync(rootReportPath, htmlTemplate);
  console.log(`📋 Report also available at: ${rootReportPath}`);

  if (latestSummary) {
    console.log(`\n📊 Report Summary:`);
    console.log(`   Test: ${latestSummary.testName}`);
    console.log(`   Status: ${latestSummary.status}`);
    console.log(`   Mode: ${latestSummary.conversationMode}`);
    console.log(`   Screenshots: ${latestSummary.artifacts.screenshotsCount}`);
    console.log(`   Video: ${latestSummary.artifacts.video ? '✅ Available' : '❌ Not available'}`);
  } else {
    console.log(`\n⚠️  No test data found. Run a test first:`);
    console.log(`   npm run test:copilot-conversation`);
  }

  console.log(`\n🌐 Open the report in your browser:`);
  console.log(`   file://${rootReportPath}`);
}

// Run the generator
try {
  // First try to generate comprehensive report if template exists
  if (fs.existsSync('./test-report-template-comprehensive.html')) {
    generateComprehensiveReport();
  } else {
    console.log('Comprehensive template not found, falling back to basic report...');
    generateHTMLReport();
  }
} catch (error) {
  console.error('❌ Error generating report:', error.message);
  process.exit(1);
}
