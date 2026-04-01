import { Amplify } from 'aws-amplify';

Amplify.configure({
  aws_project_region: import.meta.env.VITE_AWS_REGION ?? 'us-east-1',
  aws_appsync_graphqlEndpoint: import.meta.env.VITE_APPSYNC_ENDPOINT,
  aws_appsync_region: import.meta.env.VITE_AWS_REGION ?? 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: import.meta.env.VITE_APPSYNC_API_KEY,
  aws_cognito_region: import.meta.env.VITE_AWS_REGION ?? 'us-east-1',
  aws_user_pools_id: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  aws_user_pools_web_client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  aws_cognito_username_attributes: ['EMAIL'],
  aws_cognito_signup_attributes: ['EMAIL'],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [
      'REQUIRES_LOWERCASE',
      'REQUIRES_UPPERCASE',
      'REQUIRES_NUMBERS',
      'REQUIRES_SYMBOLS',
    ],
  },
});
