const { generateSalt, hashPassword, hexToField } = require('./utils');
const { generateProof, verifyProof } = require('./proof');

// In-memory user database (replace with a real database in production)
const users = {};

/**
 * Register a new user with password
 * @param {string} username Username
 * @param {string} password Plain text password
 * @returns {Promise<Object>} User registration data
 */
async function registerUser(username, password) {
  if (users[username]) {
    throw new Error('Username already exists');
  }
  
  // Generate salt and hash the password
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  
  // Convert password hash to a field element
  const secretField = hexToField(passwordHash);
  
  // Create circuit inputs
  const circuitInput = {
    secret: secretField.toString()
  };
  
  try {
    // Generate a proof for the user
    const { proof, publicSignals } = await generateProof(circuitInput);
    
    // Store user data
    users[username] = {
      salt,
      passwordHash,
      commitment: publicSignals[0]
    };
    
    console.log(`User ${username} registered successfully`);
    return {
      username,
      commitment: publicSignals[0]
    };
  } catch (error) {
    console.error(`Failed to register user ${username}:`, error);
    throw error;
  }
}

/**
 * Authenticate a user with password
 * @param {string} username Username
 * @param {string} password Plain text password
 * @returns {Promise<boolean>} Authentication result
 */
async function authenticateUser(username, password) {
  const user = users[username];
  if (!user) {
    console.error(`User ${username} not found`);
    return false;
  }
  
  // Hash the password with the stored salt
  const passwordHash = hashPassword(password, user.salt);
  
  // Convert password hash to a field element
  const secretField = hexToField(passwordHash);
  
  // Create circuit inputs
  const circuitInput = {
    secret: secretField.toString()
  };
  
  try {
    // Generate a proof
    const { proof, publicSignals } = await generateProof(circuitInput);
    
    // Verify the proof
    const isValid = await verifyProof(proof, publicSignals);
    
    // Check if the commitment matches the stored one
    const commitmentMatches = publicSignals[0] === user.commitment;
    
    console.log(`Authentication for user ${username}: ${isValid && commitmentMatches ? 'successful' : 'failed'}`);
    
    return isValid && commitmentMatches;
  } catch (error) {
    console.error(`Authentication failed for user ${username}:`, error);
    return false;
  }
}

module.exports = {
  registerUser,
  authenticateUser,
  // Exposed for testing only
  _users: users
};