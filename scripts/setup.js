const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const fs = require('fs');
const { ensureDir } = require('../src/utils');

// Constants
const CIRCUIT_NAME = 'authentication';
const BUILD_DIR = path.join(__dirname, '..', 'build');
const PTAU_DIR = path.join(__dirname, '..', 'ptau');

/**
 * Download Powers of Tau file for the trusted setup
 */
async function downloadPtau() {
  ensureDir(PTAU_DIR);
  
  const ptauPath = path.join(PTAU_DIR, 'pot12_final.ptau');
  
  // Skip if already downloaded
  if (fs.existsSync(ptauPath)) {
    console.log('Powers of Tau file already exists, skipping download.');
    return ptauPath;
  }
  
  console.log('Downloading Powers of Tau file...');
  try {
    // You can change the URL to a different Powers of Tau file based on your circuit size
    await exec(
      `curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -o ${ptauPath}`
    );
    console.log(`Powers of Tau file downloaded to ${ptauPath}`);
    return ptauPath;
  } catch (error) {
    console.error('Failed to download Powers of Tau file:', error);
    throw error;
  }
}

/**
 * Fetch the required Powers of Tau file and prepare for trusted setup
 */
async function prepareTrustedSetup() {
  const ptauPath = await downloadPtau();
  console.log('Ready for trusted setup with Powers of Tau file:', ptauPath);
  return ptauPath;
}

// Only run directly if script is executed directly (not imported)
if (require.main === module) {
  prepareTrustedSetup()
    .then(() => console.log('Setup preparation complete'))
    .catch(err => {
      console.error('Setup preparation failed:', err);
      process.exit(1);
    });
}

module.exports = { prepareTrustedSetup };