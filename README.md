# AIR MOCA SDK - Verifier Implementation

A React + Vite application demonstrating credential verification using the AIR MOCA SDK with JWT authentication.

## Overview

This project consists of two parts:
1. **Frontend (React + Vite)** - User interface for credential verification
2. **Backend (Node.js + Express)** - JWT token generation and JWKS endpoint

## Prerequisites

- Node.js 16+ and npm
- RSA key pair for JWT signing (private and public keys)
- AIR MOCA SDK dashboard account and configuration

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

**Frontend Configuration:**
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `VITE_BACKEND_URL` - Backend server URL (http://localhost:8080 for local)
- `VITE_PROGRAM_ID` - From AIR MOCA dashboard
- `VITE_PARTNER_ID` - From AIR MOCA dashboard
- `VITE_REDIRECT_URL` - Post-verification redirect URL

**Note:** API URL is automatically determined by `BUILD_ENV.SANDBOX` or `BUILD_ENV.PRODUCTION` in the code.

**Backend Configuration:**
The backend `.env` is already configured with default values. Adjust if needed.

### 3. Add RSA Key Files

Place the following files in the `backend/` folder:
- `partner_private.key` - Your RSA private key for signing JWT tokens
- `partner_public.pem` - Your RSA public key for verification

**Important:** These files are in `.gitignore` and will NOT be committed to version control.

### 4. Configure AIR Dashboard

1. Log in to your AIR MOCA SDK dashboard
2. Navigate to your verifier configuration
3. Set the JWKS URL to your backend endpoint:
   - Local: `http://localhost:8080/jwks`
   - Production: `https://your-domain.com/jwks`

## Running the Application

### Development Mode

You need to run both the backend and frontend:

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```
Backend will run on http://localhost:8080

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
Frontend will run on http://localhost:5173

### Production Build

**Frontend:**
```bash
npm run build
npm run preview
```

**Backend:**
Deploy the `backend/` folder to your hosting service and ensure:
- Environment variables are set
- RSA key files are uploaded securely
- JWKS endpoint is publicly accessible
- CORS is configured for your frontend domain

## How It Works

### JWT Authentication Flow

1. **Token Generation:**
   - Frontend requests a fresh JWT token from backend on initialization
   - Backend signs the token using RSA private key
   - Token includes: `partnerId`, `scope: "issue verify"`, 24-hour expiration

2. **JWKS Verification:**
   - AIR SDK fetches public key from your `/jwks` endpoint
   - Verifies JWT signature is valid
   - Ensures token hasn't been tampered with

3. **Credential Verification:**
   - User clicks "Start Verification"
   - App uses JWT token to authenticate with AIR SDK
   - SDK handles the verification workflow

### Key Components

**Frontend:**
- `src/services/tokenService.js` - JWT token fetching
- `src/pages/Home/index.jsx` - Main verification UI
- `src/App.jsx` - Application root

**Backend:**
- `backend/server.js` - Express server with JWT endpoints
- `GET /jwks` - Public key endpoint for AIR SDK
- `GET /generate-token` - JWT token generation
- `POST /verify-token` - Optional token validation

## Project Structure

```
moca-kit/
├── backend/                    # Node.js backend
│   ├── server.js              # Express server
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Backend configuration
│   ├── jwks.json              # Public key (JWKS format)
│   ├── partner_private.key    # Private key (not in git)
│   └── partner_public.pem     # Public key (not in git)
├── src/
│   ├── pages/Home/            # Main verification page
│   ├── services/              # API services
│   └── components/            # Reusable UI components
├── .env                        # Frontend configuration
└── README.md
```

## Troubleshooting

**Frontend can't connect to backend:**
- Ensure backend is running on port 8080
- Check `VITE_BACKEND_URL` in `.env`
- Verify no firewall blocking localhost connections

**JWT token generation fails:**
- Ensure `partner_private.key` exists in `backend/` folder
- Check file permissions are readable
- Verify the key format is correct PEM

**AIR SDK verification fails:**
- Confirm JWKS URL is configured in AIR dashboard
- Ensure `/jwks` endpoint is publicly accessible
- Check that `KID` in backend matches dashboard configuration

## Security Notes

- Never commit private keys to version control
- Use HTTPS in production for all endpoints
- Rotate JWT tokens regularly
- Configure CORS to only allow your frontend domain
- Store private keys securely on the server

## Additional Resources

- [AIR MOCA SDK Documentation](https://developers.sandbox.air3.com/)
- [JWT.io](https://jwt.io/) - JWT debugging
- See `CLAUDE.md` for detailed development guidance

