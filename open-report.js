#!/usr/bin/env node

/**
 * Open the conversation test report in the default browser
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

function openReport() {
  const reportPath = path.join(__dirname, 'conversation-test-report.html');
  
  if (!fs.existsSync(reportPath)) {
    console.log('❌ Report not found. Generate it first:');
    console.log('   npm run generate-report');
    process.exit(1);
  }

  const fileUrl = `file://${reportPath}`;
  console.log(`🌐 Opening report: ${fileUrl}`);

  // Open in default browser based on platform
  const platform = process.platform;
  let command;

  if (platform === 'darwin') {
    command = `open "${fileUrl}"`;
  } else if (platform === 'win32') {
    command = `start "${fileUrl}"`;
  } else {
    command = `xdg-open "${fileUrl}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.log('❌ Could not open browser automatically.');
      console.log(`🔗 Please open this URL manually: ${fileUrl}`);
    } else {
      console.log('✅ Report opened in default browser');
    }
  });
}

openReport();
