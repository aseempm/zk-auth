const snarkjs = require('snarkjs');
const path = require('path');
const fs = require('fs');

// Constants
const CIRCUIT_NAME = 'authentication';
const BUILD_DIR = path.join(__dirname, '..', 'build');
const KEYS_DIR = path.join(__dirname, '..', 'keys');

/**
 * Generate a ZK proof for authentication
 * @param {Object} input Circuit inputs
 * @returns {Promise<Object>} Proof and public signals
 */
async function generateProof(input) {
  const wasmPath = path.join(BUILD_DIR, `${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm`);
  const zkeyPath = path.join(KEYS_DIR, `${CIRCUIT_NAME}_final.zkey`);
  
  // Ensure files exist
  if (!fs.existsSync(wasmPath)) {
    throw new Error(`WASM file not found at ${wasmPath}. Run 'npm run compile' first.`);
  }
  
  if (!fs.existsSync(zkeyPath)) {
    throw new Error(`zKey file not found at ${zkeyPath}. Run 'npm run generate-keys' first.`);
  }
  
  try {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );
    
    return { proof, publicSignals };
  } catch (error) {
    console.error('Failed to generate proof:', error);
    throw error;
  }
}

/**
 * Verify a ZK proof
 * @param {Object} proof ZK proof
 * @param {Array<string>} publicSignals Public signals (commitments)
 * @returns {Promise<boolean>} Verification result
 */
async function verifyProof(proof, publicSignals) {
  const vkeyPath = path.join(KEYS_DIR, 'verification_key.json');
  
  if (!fs.existsSync(vkeyPath)) {
    throw new Error(`Verification key not found at ${vkeyPath}. Run 'npm run generate-keys' first.`);
  }
  
  try {
    const vKey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    
    return isValid;
  } catch (error) {
    console.error('Failed to verify proof:', error);
    throw error;
  }
}

module.exports = {
  generateProof,
  verifyProof
};