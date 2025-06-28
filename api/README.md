# Firebase Admin API

This is a Node.js/Express API server that provides Firebase user management capabilities using the Firebase Admin SDK.

## Setup Instructions

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Firebase Service Account Setup

1. Go to your Firebase Console: https://console.firebase.google.com/
2. Select your project: `portfolio-56be7`
3. Go to Project Settings (gear icon) → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file

### 3. Environment Variables

Create a `.env` file in the `api` directory:

```bash
cp .env.example .env
```

Extract the following values from your downloaded service account JSON file and add them to `.env`:

**IMPORTANT**: For the private key, you need to escape the newlines properly. Copy the entire private key from the JSON file (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts) and replace all `\n` with `\\n` when placing it in the `.env` file with double quotes:

```env
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_from_json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nyour_actual_private_key_content_here\\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@portfolio-56be7.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id_from_json
FIREBASE_CLIENT_CERT_URL=your_client_cert_url_from_json
```

**Alternative**: You can also use single quotes or no quotes for the private key, in which case use `\n` instead of `\\n`:

```env
FIREBASE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\nyour_actual_private_key_content_here\n-----END PRIVATE KEY-----'
```

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
All admin endpoints require a valid Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

### User Management Endpoints

- `GET /api/health` - Health check
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:uid` - Get user details
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:uid` - Update user
- `DELETE /api/admin/users/:uid` - Delete user
- `POST /api/admin/users/:uid/disable` - Disable user
- `POST /api/admin/users/:uid/enable` - Enable user
- `POST /api/admin/users/:uid/custom-claims` - Set custom claims
- `POST /api/admin/users/:uid/revoke-tokens` - Revoke refresh tokens

## Security

- Only admin emails can access the API endpoints
- All requests are authenticated using Firebase ID tokens
- CORS is configured for your frontend domains
- Service account credentials should be kept secure

## Deployment

For production deployment, consider:
- Using environment variables for all sensitive data
- Deploying to Firebase Cloud Functions, Google Cloud Run, or similar
- Setting up proper logging and monitoring
- Implementing rate limiting