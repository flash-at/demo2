require('dotenv').config();

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase Admin SDK
// For production, use environment variables for the service account
const serviceAccount = {
  type: "service_account",
  project_id: "portfolio-56be7",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "portfolio-56be7"
  });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://your-frontend-domain.com'],
  credentials: true
}));
app.use(express.json());

// Middleware to verify admin access
const verifyAdminAccess = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if user is admin
    const adminEmails = ['maheshch1094@gmail.com', 'admin@codecafe.com', 'superadmin@codecafe.com'];
    if (!adminEmails.includes(decodedToken.email?.toLowerCase())) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying admin access:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// GET /api/admin/users - List all Firebase users
app.get('/api/admin/users', verifyAdminAccess, async (req, res) => {
  try {
    const maxResults = parseInt(req.query.limit) || 1000;
    const nextPageToken = req.query.pageToken;

    const listUsersResult = await admin.auth().listUsers(maxResults, nextPageToken);
    
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      phoneNumber: userRecord.phoneNumber,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      lastRefreshTime: userRecord.metadata.lastRefreshTime,
      providerData: userRecord.providerData.map(provider => ({
        providerId: provider.providerId,
        uid: provider.uid,
        email: provider.email,
        displayName: provider.displayName,
        photoURL: provider.photoURL
      })),
      customClaims: userRecord.customClaims || {},
      tokensValidAfterTime: userRecord.tokensValidAfterTime
    }));

    res.json({
      users,
      pageToken: listUsersResult.pageToken,
      totalUsers: users.length
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ 
      error: 'Failed to list users',
      details: error.message 
    });
  }
});

// GET /api/admin/users/:uid - Get a single user's details
app.get('/api/admin/users/:uid', verifyAdminAccess, async (req, res) => {
  const uid = req.params.uid;
  try {
    const userRecord = await admin.auth().getUser(uid);
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      phoneNumber: userRecord.phoneNumber,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      lastRefreshTime: userRecord.metadata.lastRefreshTime,
      providerData: userRecord.providerData,
      customClaims: userRecord.customClaims || {},
      tokensValidAfterTime: userRecord.tokensValidAfterTime
    });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ error: `User with UID ${uid} not found` });
    } else {
      console.error(`Error fetching user ${uid}:`, error);
      res.status(500).json({ 
        error: `Failed to fetch user ${uid}`,
        details: error.message 
      });
    }
  }
});

// POST /api/admin/users/:uid/disable - Disable a user
app.post('/api/admin/users/:uid/disable', verifyAdminAccess, async (req, res) => {
  const uid = req.params.uid;
  try {
    await admin.auth().updateUser(uid, { disabled: true });
    res.json({ 
      message: `User ${uid} disabled successfully`,
      uid,
      disabled: true 
    });
  } catch (error) {
    console.error(`Error disabling user ${uid}:`, error);
    res.status(500).json({ 
      error: `Failed to disable user ${uid}`,
      details: error.message 
    });
  }
});

// POST /api/admin/users/:uid/enable - Enable a user
app.post('/api/admin/users/:uid/enable', verifyAdminAccess, async (req, res) => {
  const uid = req.params.uid;
  try {
    await admin.auth().updateUser(uid, { disabled: false });
    res.json({ 
      message: `User ${uid} enabled successfully`,
      uid,
      disabled: false 
    });
  } catch (error) {
    console.error(`Error enabling user ${uid}:`, error);
    res.status(500).json({ 
      error: `Failed to enable user ${uid}`,
      details: error.message 
    });
  }
});

// DELETE /api/admin/users/:uid - Delete a user
app.delete('/api/admin/users/:uid', verifyAdminAccess, async (req, res) => {
  const uid = req.params.uid;
  try {
    await admin.auth().deleteUser(uid);
    res.json({ 
      message: `User ${uid} deleted successfully`,
      uid 
    });
  } catch (error) {
    console.error(`Error deleting user ${uid}:`, error);
    res.status(500).json({ 
      error: `Failed to delete user ${uid}`,
      details: error.message 
    });
  }
});

// PUT /api/admin/users/:uid - Update user properties
app.put('/api/admin/users/:uid', verifyAdminAccess, async (req, res) => {
  const uid = req.params.uid;
  const { email, displayName, phoneNumber, emailVerified, disabled } = req.body;
  
  try {
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    if (disabled !== undefined) updateData.disabled = disabled;

    const userRecord = await admin.auth().updateUser(uid, updateData);
    res.json({
      message: `User ${uid} updated successfully`,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        disabled: userRecord.disabled,
        emailVerified: userRecord.emailVerified
      }
    });
  } catch (error) {
    console.error(`Error updating user ${uid}:`, error);
    res.status(500).json({ 
      error: `Failed to update user ${uid}`,
      details: error.message 
    });
  }
});

// POST /api/admin/users - Create a new user
app.post('/api/admin/users', verifyAdminAccess, async (req, res) => {
  const { email, password, displayName, phoneNumber, emailVerified = false } = req.body;
  
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      phoneNumber,
      emailVerified
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error.message 
    });
  }
});

// POST /api/admin/users/:uid/custom-claims - Set custom claims
app.post('/api/admin/users/:uid/custom-claims', verifyAdminAccess, async (req, res) => {
  const uid = req.params.uid;
  const { customClaims } = req.body;
  
  try {
    await admin.auth().setCustomUserClaims(uid, customClaims);
    res.json({
      message: `Custom claims set for user ${uid}`,
      uid,
      customClaims
    });
  } catch (error) {
    console.error(`Error setting custom claims for user ${uid}:`, error);
    res.status(500).json({ 
      error: `Failed to set custom claims for user ${uid}`,
      details: error.message 
    });
  }
});

// POST /api/admin/users/:uid/revoke-tokens - Revoke refresh tokens
app.post('/api/admin/users/:uid/revoke-tokens', verifyAdminAccess, async (req, res) => {
  const uid = req.params.uid;
  
  try {
    await admin.auth().revokeRefreshTokens(uid);
    res.json({
      message: `Refresh tokens revoked for user ${uid}`,
      uid
    });
  } catch (error) {
    console.error(`Error revoking tokens for user ${uid}:`, error);
    res.status(500).json({ 
      error: `Failed to revoke tokens for user ${uid}`,
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Firebase Admin API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;