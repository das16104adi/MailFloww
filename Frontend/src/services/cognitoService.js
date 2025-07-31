import { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommand, ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider';
import { generateSecretHash, getCognitoConfig } from '../utils/cognitoUtils';

class CognitoService {
  constructor() {
    const config = getCognitoConfig();
    this.client = new CognitoIdentityProviderClient({
      region: config.region,
    });
    this.userPoolId = config.userPoolId;
    this.clientId = config.userPoolClientId;
    this.clientSecret = config.clientSecret;
  }

  async signUp(email, password, attributes = {}) {
    try {
      // For email alias configuration, create a username that's not email format
      // Use email prefix + timestamp to ensure uniqueness
      const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      const username = emailPrefix + '_' + Date.now().toString().slice(-6);

      const secretHash = generateSecretHash(username, this.clientId, this.clientSecret);

      // Add email as a user attribute - this enables email alias login
      const userAttributes = [
        { Name: 'email', Value: email },
        ...Object.entries(attributes).map(([key, value]) => ({
          Name: key,
          Value: value
        }))
      ];

      const command = new SignUpCommand({
        ClientId: this.clientId,
        Username: username, // Use generated username (not email format)
        Password: password,
        SecretHash: secretHash,
        UserAttributes: userAttributes
      });

      const response = await this.client.send(command);

      // Store the username mapping for confirmation and future use
      localStorage.setItem(`cognito_username_${email}`, username);

      return { ...response, generatedUsername: username };
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  }

  async confirmSignUp(email, confirmationCode) {
    try {
      // Get the stored username for this email
      const username = localStorage.getItem(`cognito_username_${email}`);
      if (!username) {
        throw new Error('Username not found. Please sign up again.');
      }

      const secretHash = generateSecretHash(username, this.clientId, this.clientSecret);

      const command = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: username, // Use the stored username
        ConfirmationCode: confirmationCode,
        SecretHash: secretHash
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error('ConfirmSignUp error:', error);
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      // For email alias configuration, we can use email directly for sign-in
      // The SECRET_HASH should be generated with the email (alias)
      const secretHash = generateSecretHash(email, this.clientId, this.clientSecret);

      // Try USER_PASSWORD_AUTH first, fallback to ADMIN_INITIATE_AUTH if needed
      const command = new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email, // Use email for sign-in (alias)
          PASSWORD: password,
          SECRET_HASH: secretHash
        }
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error('SignIn error:', error);

      // Provide specific error messages for common issues
      if (error.name === 'InvalidParameterException' && error.message.includes('USER_PASSWORD_AUTH')) {
        throw new Error('Authentication method not enabled. Please contact support or enable USER_PASSWORD_AUTH in AWS Cognito.');
      } else if (error.name === 'NotAuthorizedException') {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (error.name === 'UserNotConfirmedException') {
        throw new Error('Please verify your email address before signing in.');
      } else if (error.name === 'UserNotFoundException') {
        throw new Error('No account found with this email address.');
      }

      throw error;
    }
  }

  async resendConfirmationCode(email) {
    try {
      // Get the stored username for this email
      const username = localStorage.getItem(`cognito_username_${email}`);
      if (!username) {
        throw new Error('Username not found. Please sign up again.');
      }

      const secretHash = generateSecretHash(username, this.clientId, this.clientSecret);

      const command = new ResendConfirmationCodeCommand({
        ClientId: this.clientId,
        Username: username, // Use the stored username
        SecretHash: secretHash
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error('ResendConfirmationCode error:', error);
      throw error;
    }
  }
}

const cognitoService = new CognitoService();
export default cognitoService;
