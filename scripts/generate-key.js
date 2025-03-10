const snarkjs = require('snarkjs');
const path = require('path');
const fs = require('fs');
const { prepareTrustedSetup } = require('./setup');
const { ensureDir } = require('../src/utils');

// Constants
const CIRCUIT_NAME = 'authentication';
const BUILD_DIR = path.join(__dirname, '..', 'build');
const KEYS_DIR = path.join(__dirname, '..', 'keys');

/**
 * Generate proving and verification keys
 */
async function generateKeys() {
  ensureDir(KEYS_DIR);
  
  // Paths
  const r1csPath = path.join(BUILD_DIR, `${CIRCUIT_NAME}.r1cs`);
  const ptauPath = await prepareTrustedSetup();
  const zkeyPath = path.join(KEYS_DIR, `${CIRCUIT_NAME}_final.zkey`);
  const vkeyPath = path.join(KEYS_DIR, 'verification_key.json');
  
  console.log('Generating proving and verification keys...');
  
  try {
    // Phase 1: Create initial zKey
    await snarkjs.zKey.newZKey(r1csPath, ptauPath, path.join(KEYS_DIR, `${CIRCUIT_NAME}_0.zkey`));
    console.log('Initial zKey created');
    
    // Phase 2: Contribute to the zKey (simulated ceremony)
    await snarkjs.zKey.contribute(
      path.join(KEYS_DIR, `${CIRCUIT_NAME}_0.zkey`),
      path.join(KEYS_DIR, `${CIRCUIT_NAME}_1.zkey`),
      'Contributor 1',
      'First contribution'
    );
    console.log('First contribution added');
    
    // Finalize the zKey
    await snarkjs.zKey.beacon(
      path.join(KEYS_DIR, `${CIRCUIT_NAME}_1.zkey`),
      zkeyPath,
      'Final Beacon',
      '0102030405060708090a0b0c0d0e0f101112231415161718221a1b1c1d1e1f',
      10
    );
    console.log('zKey finalized');
    
    // Export the verification key
    const vKey = await snarkjs.zKey.exportVerificationKey(zkeyPath);
    fs.writeFileSync(vkeyPath, JSON.stringify(vKey, null, 2));
    console.log(`Verification key exported to ${vkeyPath}`);
    
    // Clean up intermediate files
    fs.unlinkSync(path.join(KEYS_DIR, `${CIRCUIT_NAME}_0.zkey`));
    fs.unlinkSync(path.join(KEYS_DIR, `${CIRCUIT_NAME}_1.zkey`));
    
    return { zkeyPath, vkeyPath };
  } catch (error) {
    console.error('Failed to generate keys:', error);
    throw error;
  }
}

// Only run directly if script is executed directly (not imported)
if (require.main === module) {
  generateKeys()
    .then(() => console.log('Key generation complete'))
    .catch(err => {
      console.error('Key generation failed:', err);
      process.exit(1);
    });
}

module.exports = { generateKeys };