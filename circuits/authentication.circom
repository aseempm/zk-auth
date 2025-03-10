pragma circom 2.1.4;

/*
 * Authentication circuit
 * Proves knowledge of a secret (password hash) without revealing it
 */
template Authentication() {
    // Private input: The secret (password hash)
    signal input secret;
    
    // Public output: A commitment to the secret
    signal output commitment;
    
    // Simple commitment scheme: square the secret
    // In a real implementation, use a more secure commitment scheme
    commitment <== secret * secret;
}

component main = Authentication();