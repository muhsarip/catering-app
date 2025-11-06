import serverless from 'serverless-http';
import createApp from '../src/app.js';

/**
 * Single Netlify Function entry point for all API routes
 */

const app = createApp();

// Export the serverless handler with base path stripping
export const handler = serverless(app, {
  basePath: '/.netlify/functions/api'
});
