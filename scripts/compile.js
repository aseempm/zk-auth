const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const { ensureDir } = require('../src/utils');

// Constants
const CIRCUIT_NAME = 'authentication';
const CIRCUIT_DIR = path.join(__dirname, '..', 'circuits');
const BUILD_DIR = path.join(__dirname, '..', 'build');

/**
 * Compile the circuit using Rust implementation of Circom
 */
async function compileCircuit() {
  // Ensure build directory exists
  ensureDir(BUILD_DIR);
  
  const circuitPath = path.join(CIRCUIT_DIR, `${CIRCUIT_NAME}.circom`);
  
  console.log('Compiling circuit with Circom (Rust implementation)...');
  
  try {
    // Using circom-rs (Rust implementation)
    // Flags:
    // --r1cs: Generate r1cs constraint system
    // --wasm: Generate WebAssembly
    // --sym: Generate symbolic information
    // --c: Generate C++ code (optional)
    // -o: Output directory
    const { stdout, stderr } = await exec(
      `circom ${circuitPath} --r1cs --wasm --sym -o ${BUILD_DIR}`
    );
    
    console.log('Circuit compilation output:', stdout);
    
    if (stderr && stderr.trim() !== '') {
      console.error('Circuit compilation warnings/errors:', stderr);
    }
    
    console.log(`Circuit successfully compiled to ${BUILD_DIR}`);
    return true;
  } catch (error) {
    console.error('Failed to compile circuit:', error);
    throw error;
  }
}

// Only run directly if script is executed directly (not imported)
if (require.main === module) {
  compileCircuit()
    .then(() => console.log('Compilation complete'))
    .catch(err => {
      console.error('Compilation failed:', err);
      process.exit(1);
    });
}

module.exports = { compileCircuit };