# MOCA JWT Backend Server

Node.js backend service for generating JWT tokens for the AIR MOCA SDK.

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Place Key Files

Place the following files in the `backend/` folder:

- `partner_private.key` - Private RSA key for signing JWT tokens
- `partner_public.pem` - Public RSA key for verification
- `jwks.json` - Already created with public key in JWKS format

**Important:** These key files are in `.gitignore` and will NOT be committed to version control.

### 3. Configure Environment

The `.env` file is already configured with:
- `PORT=8080` - Server port
- `PARTNER_ID` - Your AIR partner ID
- `KID` - Key identifier for JWT header
- `TOKEN_EXPIRY=24h` - Token expiration time

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## Endpoints

### GET /jwks
Returns the public key in JWKS format. This URL should be configured in your AIR SDK dashboard.

**Response:**
```json
{
  "keys": [
    {
      "alg": "RS256",
      "e": "AQAB",
      "kid": "6386cb4d-c0de-4629-a412-8dcf6f50f805",
      "kty": "RSA",
      "n": "...",
      "use": "sig"
    }
  ]
}
```

### GET /generate-token
Generates a fresh JWT token signed with the private key.

**Response:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjYzODZjYjRkLWMwZGUtNDYyOS1hNDEyLThkY2Y2ZjUwZjgwNSJ9...",
  "expiresIn": "24h",
  "payload": {
    "partnerId": "8b5773b4-adea-487c-bcec-f362e8b285bf",
    "scope": "issue verify"
  },
  "kid": "6386cb4d-c0de-4629-a412-8dcf6f50f805"
}
```

### POST /verify-token
Optional endpoint to verify token validity (for testing).

**Request:**
```json
{
  "token": "your-jwt-token"
}
```

**Response:**
```json
{
  "valid": true,
  "payload": { ... },
  "message": "Token is valid"
}
```

## Deployment

When deploying to production:

1. Update the frontend `.env` with your production backend URL
2. Configure CORS in `server.js` to only allow your frontend domain
3. Share the JWKS URL with the AIR SDK dashboard (e.g., `https://your-domain.com/jwks`)
4. Use HTTPS for all production endpoints
5. Ensure private key is stored securely on the server
