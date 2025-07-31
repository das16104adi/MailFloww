import { Amplify } from 'aws-amplify';

// AWS Amplify v6 Configuration
const awsConfig = {
  Auth: {
    Cognito: {
      region: process.env.REACT_APP_AWS_REGION || 'your-aws-region',
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'your-user-pool-id',
      userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || 'your-client-id',
      userPoolClientSecret: process.env.REACT_APP_COGNITO_CLIENT_SECRET || 'your-client-secret',
      authenticationFlowType: 'USER_PASSWORD_AUTH',
      oauth: {
        domain: 'your-cognito-domain.auth.your-region.amazoncognito.com',
        scope: ['email', 'profile', 'openid'],
        redirectSignIn: 'http://localhost:3000/',
        redirectSignOut: 'http://localhost:3000/',
        responseType: 'code'
      },
      loginWith: {
        email: true,
        username: true,
        phone: false
      },
      signUpVerificationMethod: 'code', // 'code' for email verification
      userAttributes: {
        email: {
          required: true
        }
      },
      allowGuestAccess: false,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false
      },
      authenticationFlowType: 'USER_PASSWORD_AUTH'
    }
  }
};

// Configure Amplify
Amplify.configure(awsConfig);

export default awsConfig;
