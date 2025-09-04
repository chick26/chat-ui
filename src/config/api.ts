// API Configuration
// This file uses environment variables for sensitive information
// Make sure to set these in your .env file

// Supported bot scenarios
export type BotScenario = 'route' | 'cable' | 'maintenance';

// Scenario-specific API tokens
const SCENARIO_TOKENS = {
  route: process.env.REACT_APP_API_TOKEN_ROUTE || process.env.REACT_APP_API_TOKEN || '',
  cable: process.env.REACT_APP_API_TOKEN_CABLE || process.env.REACT_APP_API_TOKEN || '',
  maintenance: process.env.REACT_APP_API_TOKEN_MAINTENANCE || process.env.REACT_APP_API_TOKEN || '',
} as const;

export const API_CONFIG = {
  // API Base URL - set REACT_APP_API_BASE_URL in .env file
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  
  // API Version
  VERSION: process.env.REACT_APP_API_VERSION || 'v1',
  
  // Get token for specific scenario
  getToken(scenario: BotScenario = 'route'): string {
    return SCENARIO_TOKENS[scenario];
  },
  
  // Construct full API URL
  get CHAT_MESSAGES_URL() {
    return `${this.BASE_URL}/${this.VERSION}/chat-messages`;
  },
  
  // Get headers for specific scenario
  getHeaders(scenario: BotScenario = 'route') {
    return {
      'Authorization': `Bearer ${this.getToken(scenario)}`,
      'Content-Type': 'application/json',
    };
  },
  
  // Legacy: Default headers for backward compatibility
  get HEADERS() {
    return this.getHeaders('route');
  }
} as const;

// Validate configuration
const validateConfiguration = () => {
  if (process.env.NODE_ENV === 'production') {
    // Check if base URL is configured
    if (!process.env.REACT_APP_API_BASE_URL) {
      console.warn('API_CONFIG: Missing API base URL in production environment');
    }
    
    // Check if at least one token is configured
    const hasAnyToken = Object.values(SCENARIO_TOKENS).some(token => token);
    if (!hasAnyToken) {
      console.warn('API_CONFIG: No API tokens configured in production environment');
    }
    
    // Warn about missing scenario-specific tokens
    Object.entries(SCENARIO_TOKENS).forEach(([scenario, token]) => {
      if (!token) {
        console.warn(`API_CONFIG: Missing token for scenario '${scenario}' in production environment`);
      }
    });
  }
};

// Run validation
validateConfiguration();
