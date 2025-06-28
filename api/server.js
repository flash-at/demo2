const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Check if required environment variables are set
const requiredEnvVars = [
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CLIENT_CERT_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file and ensure all Firebase service account variables are set.');
  process.exit(1);
}

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "portfolio-56be7",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'portfolio-56be7'
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.error('Please verify your Firebase service account credentials in the .env file');
  console.error('Make sure the private key is properly formatted with escaped newlines (\\\\n)');
  process.exit(1);
}

// Admin emails that can access the API
const ADMIN_EMAILS = ['maheshch1094@gmail.com'];

// Middleware to verify Firebase ID token and check admin status
const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if user is admin
    if (!ADMIN_EMAILS.includes(decodedToken.email)) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all users
app.get('/api/admin/users', verifyAdminToken, async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime
      },
      customClaims: user.customClaims || {}
    }));
    
    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by UID
app.get('/api/admin/users/:uid', verifyAdminToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await admin.auth().getUser(uid);
    
    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime
      },
      customClaims: user.customClaims || {}
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(404).json({ error: 'User not found' });
  }
});

// Create new user
app.post('/api/admin/users', verifyAdminToken, async (req, res) => {
  try {
    const { email, password, displayName, phoneNumber } = req.body;
    
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      phoneNumber,
      emailVerified: false
    });
    
    res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user
app.put('/api/admin/users/:uid', verifyAdminToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body;
    
    const userRecord = await admin.auth().updateUser(uid, updates);
    
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/admin/users/:uid', verifyAdminToken, async (req, res) => {
  try {
    const { uid } = req.params;
    await admin.auth().deleteUser(uid);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Disable user
app.post('/api/admin/users/:uid/disable', verifyAdminToken, async (req, res) => {
  try {
    const { uid } = req.params;
    await admin.auth().updateUser(uid, { disabled: true });
    res.json({ message: 'User disabled successfully' });
  } catch (error) {
    console.error('Error disabling user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Enable user
app.post('/api/admin/users/:uid/enable', verifyAdminToken, async (req, res) => {
  try {
    const { uid } = req.params;
    await admin.auth().updateUser(uid, { disabled: false });
    res.json({ message: 'User enabled successfully' });
  } catch (error) {
    console.error('Error enabling user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Set custom claims
app.post('/api/admin/users/:uid/custom-claims', verifyAdminToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const { customClaims } = req.body;
    
    await admin.auth().setCustomUserClaims(uid, customClaims);
    res.json({ message: 'Custom claims set successfully' });
  } catch (error) {
    console.error('Error setting custom claims:', error);
    res.status(400).json({ error: error.message });
  }
});

// Revoke refresh tokens
app.post('/api/admin/users/:uid/revoke-tokens', verifyAdminToken, async (req, res) => {
  try {
    const { uid } = req.params;
    await admin.auth().revokeRefreshTokens(uid);
    res.json({ message: 'Refresh tokens revoked successfully' });
  } catch (error) {
    console.error('Error revoking tokens:', error);
    res.status(400).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Firebase Admin API server running on port ${PORT}`);
});