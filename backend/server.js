import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration from environment
const PARTNER_ID = process.env.PARTNER_ID || '8b5773b4-adea-487c-bcec-f362e8b285bf';
const KID = process.env.KID || '6386cb4d-c0de-4629-a412-8dcf6f50f805';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '24h'; // 24 hours

// Load private key for signing JWT
let privateKey;
try {
  privateKey = fs.readFileSync(path.join(__dirname, 'partner_private.key'), 'utf8');
  console.log('✓ Private key loaded successfully');
} catch (error) {
  console.error('✗ Failed to load private key:', error.message);
  console.error('  Make sure partner_private.key exists in the backend folder');
}

// Load JWKS (JSON Web Key Set) with public key
let jwks;
try {
  const jwksContent = fs.readFileSync(path.join(__dirname, 'jwks.json'), 'utf8');
  jwks = JSON.parse(jwksContent);
  console.log('✓ JWKS loaded successfully');
} catch (error) {
  console.error('✗ Failed to load JWKS:', error.message);
  console.error('  Make sure jwks.json exists in the backend folder');
}

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    service: 'MOCA JWT Token Service',
    status: 'running',
    endpoints: {
      jwks: '/jwks',
      generateToken: '/generate-token',
      verifyToken: '/verify-token'
    }
  });
});

/**
 * GET /jwks
 * Exposes the public key in JWKS format
 * This URL should be configured in the AIR SDK dashboard
 */
app.get('/jwks', (req, res) => {
  if (!jwks) {
    return res.status(500).json({
      error: 'JWKS not available',
      message: 'jwks.json file not found or invalid'
    });
  }

  console.log('📋 JWKS requested');
  res.json(jwks);
});

/**
 * GET /generate-token
 * Generates a fresh JWT token signed with the private key
 * Returns: { token, expiresIn, payload }
 */
app.get('/generate-token', (req, res) => {
  if (!privateKey) {
    return res.status(500).json({
      error: 'Private key not available',
      message: 'Cannot generate token without private key'
    });
  }

  try {
    // Payload matching AIR MOCA SDK requirements
    const payload = {
      partnerId: PARTNER_ID,
      scope: 'issue verify'
    };

    // Generate JWT token with RS256 algorithm
    const token = jwt.sign(
      payload,
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: TOKEN_EXPIRY,
        header: {
          kid: KID,
          alg: 'RS256'
        }
      }
    );

    console.log('✓ Token generated successfully');

    res.json({
      token,
      expiresIn: TOKEN_EXPIRY,
      payload,
      kid: KID
    });
  } catch (error) {
    console.error('✗ Token generation failed:', error);
    res.status(500).json({
      error: 'Token generation failed',
      message: error.message
    });
  }
});

/**
 * POST /verify-token
 * Optional endpoint to verify token validity (for testing)
 * Body: { token: "your-jwt-token" }
 */
app.post('/verify-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      error: 'Token required',
      message: 'Please provide a token in the request body'
    });
  }

  try {
    // Load public key for verification
    const publicKey = fs.readFileSync(path.join(__dirname, 'partner_public.pem'), 'utf8');

    // Verify the token
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });

    console.log('✓ Token verified successfully');

    res.json({
      valid: true,
      payload: decoded,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('✗ Token verification failed:', error.message);

    let errorMessage = 'Token verification failed';
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    }

    res.status(400).json({
      valid: false,
      error: errorMessage,
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 MOCA JWT Backend Server');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`📋 JWKS endpoint: http://localhost:${PORT}/jwks`);
  console.log(`🎫 Token generation: http://localhost:${PORT}/generate-token`);
  console.log('\n⚠️  Remember to:');
  console.log('   1. Place partner_private.key in the backend folder');
  console.log('   2. Place partner_public.pem in the backend folder');
  console.log('   3. Place jwks.json in the backend folder');
  console.log('   4. Configure the JWKS URL in your AIR SDK dashboard\n');
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
