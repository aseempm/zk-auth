const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Field size for BN254 curve (commonly used in zkSNARKs)
const FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

/**
 * Generate a random salt
 * @param {number} length Length of the salt in bytes
 * @returns {string} Hex-encoded salt
 */
function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a password with salt using SHA-256
 * @param {string} password User password
 * @param {string} salt Salt value
 * @returns {string} Hex-encoded hash
 */
function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

/**
 * Convert a hex string to a field element compatible with the BN254 curve
 * @param {string} hexString Hex string to convert
 * @returns {BigInt} Field element as BigInt
 */
function hexToField(hexString) {
  return BigInt('0x' + hexString) % FIELD_SIZE;
}

/**
 * Ensure a directory exists
 * @param {string} dirPath Path to the directory
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

module.exports = {
  FIELD_SIZE,
  generateSalt,
  hashPassword,
  hexToField,
  ensureDir
};