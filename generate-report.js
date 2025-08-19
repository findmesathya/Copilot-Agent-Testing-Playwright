#!/usr/bin/env node

/**
 * HTML Report Generator for Copilot Conversation Tests
 * Generates a comprehensive HTML report with video and screenshots
 */

const fs = require('fs');
const path = require('path');

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
  generateHTMLReport();
} catch (error) {
  console.error('❌ Error generating report:', error.message);
  process.exit(1);
}
