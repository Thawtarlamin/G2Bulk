# Google OAuth Setup Guide

## 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
7. Copy your **Client ID** and **Client Secret**

## 2. Environment Variables

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
SESSION_SECRET=your-random-session-secret-key
FRONTEND_URL=http://localhost:3001
```

## 3. API Endpoints

### Start Google OAuth Flow
```
GET /api/auth/google
```
Redirects user to Google login page.

### Google Callback (Automatic)
```
GET /api/auth/google/callback
```
Google redirects here after successful authentication.
Redirects to: `${FRONTEND_URL}/auth/callback?token=${JWT_TOKEN}`

## 4. Frontend Integration

### Login Button
```html
<a href="http://localhost:3000/api/auth/google">
  <button>Login with Google</button>
</a>
```

### Handle Callback
```javascript
// In your frontend callback page (e.g., /auth/callback)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (token) {
  // Save token to localStorage
  localStorage.setItem('token', token);
  
  // Redirect to dashboard
  window.location.href = '/dashboard';
}
```

## 5. User Flow

1. **User clicks "Login with Google"**
   - Frontend: `<a href="http://localhost:3000/api/auth/google">`

2. **Backend redirects to Google**
   - User logs in with Google account
   - User grants permissions

3. **Google redirects back to callback**
   - `GET /api/auth/google/callback`
   - Backend creates or finds user
   - Generates JWT token

4. **Backend redirects to frontend with token**
   - `${FRONTEND_URL}/auth/callback?token=${JWT_TOKEN}`

5. **Frontend saves token and redirects**
   - Save to localStorage
   - Redirect to dashboard

## 6. User Model Changes

Users created via Google OAuth:
- `authProvider: 'google'`
- `googleId: '123456789'` (Google's unique ID)
- `password: random` (auto-generated, not used)

Existing users linking Google:
- If email matches, `googleId` is added to existing account
- Can login with both email/password and Google

## 7. Testing

### Local Development
```bash
# Start server
npm run dev

# Navigate to
http://localhost:3000/api/auth/google
```

### Production Setup

Update redirect URI in Google Console:
```
https://yourdomain.com/api/auth/google/callback
```

Update `.env`:
```env
FRONTEND_URL=https://yourfrontend.com
```

## 8. Security Notes

1. **Never commit** `.env` file
2. Use strong `SESSION_SECRET` in production
3. Enable HTTPS in production
4. Set `secure: true` for cookies in production
5. Whitelist only trusted domains in CORS

## 9. Error Handling

### Authentication Failed
```
Redirects to: /login
```

### Missing Credentials
```json
{
  "message": "Authentication failed"
}
```

### Server Error
```json
{
  "message": "Error message details"
}
```

## 10. Database Schema

```javascript
{
  name: "John Doe",
  email: "john@gmail.com",
  password: "random-string",
  googleId: "123456789",
  authProvider: "google",
  balance: 0,
  role: "user"
}
```
