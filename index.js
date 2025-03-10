const { compileCircuit } = require('./scripts/compile');
const { generateKeys } = require('./scripts/generate-key');
const { registerUser, authenticateUser } = require('./src/user');

/**
 * Run the complete ZKP authentication demo
 */
async function runDemo() {
  console.log('==== ZKP Authentication Demo ====');
  
  try {
    // 1. Compile the circuit
    console.log('\n--- Circuit Compilation ---');
    await compileCircuit();
    
    // 2. Generate keys
    console.log('\n--- Key Generation ---');
    await generateKeys();
    
    // 3. Register a user
    console.log('\n--- User Registration ---');
    const username = 'testuser';
    const password = 'correct-password';
    await registerUser(username, password);
    
    // 4. Authenticate with correct password
    console.log('\n--- Authentication with correct password ---');
    const correctAuth = await authenticateUser(username, password);
    console.log(`Authentication result: ${correctAuth}`);
    
    // 5. Authenticate with incorrect password
    console.log('\n--- Authentication with incorrect password ---');
    const incorrectAuth = await authenticateUser(username, 'wrong-password');
    console.log(`Authentication result: ${incorrectAuth}`);
    
    console.log('\n--- Demo Completed Successfully ---');
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

// Run the demo when executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };