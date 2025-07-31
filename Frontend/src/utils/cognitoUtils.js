import CryptoJS from 'crypto-js';

/**
 * Generate SECRET_HASH for AWS Cognito
 * @param {string} username - The username (email)
 * @param {string} clientId - Cognito Client ID
 * @param {string} clientSecret - Cognito Client Secret
 * @returns {string} - Base64 encoded SECRET_HASH
 */
export function generateSecretHash(username, clientId, clientSecret) {
  const message = username + clientId;
  const hash = CryptoJS.HmacSHA256(message, clientSecret);
  return CryptoJS.enc.Base64.stringify(hash);
}

/**
 * Get Cognito configuration with SECRET_HASH support
 */
export function getCognitoConfig() {
  return {
    region: process.env.REACT_APP_AWS_REGION || 'your-aws-region',
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'your-user-pool-id',
    userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.REACT_APP_COGNITO_CLIENT_SECRET || 'your-client-secret'
  };
}
