# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + Vite application that serves as a minimal test setup for the AIR MOCA SDK, specifically configured as a verifier-only implementation. The application demonstrates credential verification workflows using the Moca Network's AIR protocol.

## Development Commands

### Setup
1. Copy `.env.example` to `.env` and fill in your configuration values from the Moca Network Dashboard
2. Place RSA key files in the `backend/` folder:
   - `partner_private.key` - Private key for signing JWT tokens
   - `partner_public.pem` - Public key for verification
   - `jwks.json` - Already created, contains public key in JWKS format
3. Install dependencies:
   - Frontend: `npm install`
   - Backend: `cd backend && npm install`
4. Configure the backend JWKS URL in your AIR SDK dashboard (e.g., `http://localhost:8080/jwks` for local, or your production URL)

### Build and Development

**Frontend:**
- `npm run dev` - Start the Vite development server (default: http://localhost:5173)
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on the codebase

**Backend:**
- `cd backend && npm install` - Install backend dependencies (first time only)
- `cd backend && npm start` - Start the backend server (http://localhost:8080)
- `cd backend && npm run dev` - Start backend with auto-reload

**Important:** The backend must be running before starting the frontend, as the frontend fetches JWT tokens from the backend on initialization.

## Environment Variables

All configuration is managed through environment variables in the `.env` file. Vite requires the `VITE_` prefix for client-side environment variables.

**Required Variables:**
- `VITE_BACKEND_URL` - Backend server URL for JWT token generation (default: `http://localhost:8080`)
- `VITE_PROGRAM_ID` - Program identifier configured on dashboard
- `VITE_PARTNER_ID` - Air partner identifier
- `VITE_REDIRECT_URL` - Post-verification redirect URL

**Notes:**
- API URL is automatically determined by `BUILD_ENV.SANDBOX` or `BUILD_ENV.PRODUCTION` in code
- JWT tokens are generated dynamically by the backend server (no static API key needed)
- See `.env.example` for the template
- Never commit `.env` to version control

## Architecture

### JWT Authentication Flow

The application uses a Node.js backend to generate and sign JWT tokens for AIR SDK authentication:

**Backend (Node.js + Express) - `backend/` folder:**
- `/jwks` - Exposes public key in JWKS format (configure this URL in AIR SDK dashboard)
- `/generate-token` - Generates fresh JWT tokens signed with RSA private key
- Tokens include: `partnerId`, `scope: "issue verify"`, 24-hour expiration
- Private key stays secure on backend, never exposed to frontend

**Frontend Flow:**
1. On app initialization, fetch fresh JWT from backend (`src/services/tokenService.js`)
2. Store token in React state
3. Initialize AirService with `partnerId`
4. Use dynamic token in `widget.verifyCredential()`

**JWKS Verification:**
- AIR SDK fetches public key from your `/jwks` endpoint (configured in dashboard)
- Verifies JWT signature using the public key
- Ensures tokens are valid and not tampered with

### Core SDK Integration
The application integrates with `@mocanetwork/airkit` (v1.6.0), which is the primary SDK for interacting with the Moca Network's AIR protocol. The SDK provides:
- `AirService` - Main service class for SDK operations
- `BUILD_ENV` - Environment configuration (SANDBOX/PRODUCTION)
- Credential verification workflows
- User authentication/login flows

### Application Structure

**Entry Point Flow:**
- `main.jsx` → `App.jsx` → `RoutesList.jsx` → configured routes

**Routing:**
- Uses React Router v7.9.1 with `createBrowserRouter`
- Routes are centrally defined in `src/routes/routes.jsx`
- Currently implements lazy-loaded pages for code splitting

**Pages:**
- `Home` (`src/pages/Home/index.jsx`) - Primary verification interface
- Implements the complete AirService initialization and verification workflow

**Reusable Components:**
- `CustomButton` - Styled Bootstrap button wrapper with loading states
- `CustomImage` - Image component wrapper
- `VerificationNote` - Verification status display component

**Utilities:**
- `utils/Helper.jsx` - Contains `getAirVerifierAuthToken()` for API authentication
- `src/constants/` - Centralized constants including image assets

### Configuration Requirements

The AIR SDK requires specific configuration obtained from the Moca Network Dashboard:
- `partnerId` - Air partner identifier (from dashboard)
- `programId` - Configured program identifier (from dashboard)
- `redirectUrl` - Post-verification redirect URL
- `backendUrl` - Your Node.js backend URL for JWT generation

**JWT Token Configuration (Backend):**
- `partner_private.key` - RSA private key for signing tokens (never commit to git)
- `partner_public.pem` - RSA public key for verification
- `KID` - Key identifier matching the one in AIR dashboard
- Token expiry: 24 hours by default

**Note:** API URL is automatically set by `BUILD_ENV.SANDBOX` (uses `https://credential.api.sandbox.air3.com`) or `BUILD_ENV.PRODUCTION` in the SDK initialization.

Configuration is loaded from environment variables (see `.env` file) and accessed in `src/pages/Home/index.jsx:15-19` via `import.meta.env`. JWT tokens are fetched dynamically from the backend instead of using static tokens.

### Vite Configuration

**Node Polyfills:**
The project uses `vite-plugin-node-polyfills` to support Node.js built-in modules in the browser, specifically:
- buffer, crypto, assert, http, https, os, url, zlib

This is required for the AIR SDK's cryptographic operations and is configured in `vite.config.js:9-11`.

### AirService Workflow

**Initialization Pattern (src/pages/Home/index.jsx:37-77):**
1. Fetch fresh JWT token from backend (`generateToken()` from `tokenService.js`)
2. Store token in React state
3. Create `AirService` instance with `partnerId`
4. Call `init()` with `BUILD_ENV.SANDBOX` and logging options
5. Enable `skipRehydration: true` for verifier-only mode

**Verification Flow (src/pages/Home/index.jsx:80-127):**
1. Ensure widget is initialized and token is available
2. Call `widget.login()` to authenticate user (triggers login UI if needed)
3. Call `widget.verifyCredential()` with dynamic JWT token, programId, and redirectUrl
4. Handle verification result or error states

**Key Files:**
- `src/services/tokenService.js` - JWT token fetching service
- `src/pages/Home/index.jsx` - Main verification component

### Styling

- Bootstrap 5.3.8 for UI components
- React-Bootstrap 2.10.10 for React wrapper components
- Custom CSS in `src/App.css` and `src/index.css`
- Bootstrap imported globally in `main.jsx:3`

### ESLint Configuration

Uses modern ESLint flat config (`eslint.config.js`):
- React Hooks plugin with recommended-latest rules
- React Refresh plugin for Vite HMR
- Custom rule: Uppercase and underscore-prefixed variables ignored for unused-vars
- ES2020 target with browser globals

## Key Implementation Notes

- The application uses React 19.1.1 with StrictMode enabled
- All API interactions use the sandbox environment (`BUILD_ENV.SANDBOX`)
- API endpoint base: `https://credential.api.sandbox.air3.com`
- The verifier authentication flow uses `X-Test: "true"` header for testing
- Error handling includes detailed console logging for debugging SDK interactions
