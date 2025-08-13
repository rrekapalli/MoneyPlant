export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  enginesApiUrl: 'http://localhost:8081/engines',
  enginesWebSocketUrl: 'ws://localhost:8081/engines',
  useMockData: true,
  
  // OAuth Configuration
  oauth: {
    google: {
      clientId: 'your-google-client-id', // Replace with your Google Client ID
      redirectUri: 'http://localhost:4200'
    },
    microsoft: {
      clientId: 'your-microsoft-client-id', // Replace with your Microsoft Azure AD Client ID
      redirectUri: 'http://localhost:4200'
    }
  }
};
