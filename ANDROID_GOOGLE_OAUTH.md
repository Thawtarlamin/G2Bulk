# Android Google OAuth Setup Guide

## 1. Backend Setup (Already Done)

Backend က mobile နဲ့ web နှစ်မျိုးလုံး support လုပ်ပြီးပါပြီ။

## 2. Google Cloud Console Setup

### Add Android OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Application type: **Android**
5. Package name: `com.yourcompany.g2bulk` (your Android app package)
6. SHA-1 certificate fingerprint:

```bash
# Debug SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release SHA-1 (for production)
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
```

### Add Authorized Redirect URIs

In your **Web OAuth Client** credentials:
- Add: `http://localhost:3000/api/auth/google/callback`
- Add: `https://yourdomain.com/api/auth/google/callback` (for production)

## 3. Android App Setup

### Step 1: Add Dependencies

In `android/app/build.gradle`:

```gradle
dependencies {
    // Google Sign-In
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
    
    // For deep linking
    implementation 'androidx.browser:browser:1.7.0'
}
```

### Step 2: Configure AndroidManifest.xml

```xml
<manifest>
    <application>
        <!-- Your Main Activity -->
        <activity
            android:name=".MainActivity"
            android:launchMode="singleTask">
            
            <!-- Deep Link Intent Filter -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                
                <!-- Deep Link Scheme: g2bulk://auth/callback -->
                <data
                    android:scheme="g2bulk"
                    android:host="auth"
                    android:pathPrefix="/callback" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### Step 3: Google Sign-In Implementation

```kotlin
// MainActivity.kt or your Auth Activity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import android.content.Intent
import android.net.Uri

class MainActivity : AppCompatActivity() {
    
    private lateinit var googleSignInClient: GoogleSignInClient
    private val RC_SIGN_IN = 9001
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Configure Google Sign-In
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestIdToken(getString(R.string.google_client_id)) // From strings.xml
            .build()
            
        googleSignInClient = GoogleSignIn.getClient(this, gso)
        
        // Check for deep link callback
        handleDeepLink(intent)
    }
    
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }
    
    private fun handleDeepLink(intent: Intent?) {
        val data: Uri? = intent?.data
        if (data != null && data.scheme == "g2bulk" && data.host == "auth") {
            val token = data.getQueryParameter("token")
            if (token != null) {
                // Save token and navigate to home
                saveToken(token)
                navigateToHome()
            }
        }
    }
    
    // Method 1: Using Web OAuth Flow (Recommended)
    fun signInWithGoogle() {
        val backendUrl = "https://yourdomain.com/api/auth/google?platform=mobile"
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(backendUrl))
        startActivity(intent)
    }
    
    // Method 2: Using Google Sign-In SDK + Backend Token Exchange
    fun signInWithGoogleSDK() {
        val signInIntent = googleSignInClient.signInIntent
        startActivityForResult(signInIntent, RC_SIGN_IN)
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(ApiException::class.java)
                sendTokenToBackend(account.idToken)
            } catch (e: ApiException) {
                // Handle error
            }
        }
    }
    
    private fun sendTokenToBackend(idToken: String?) {
        // Send ID token to your backend for verification
        // Backend creates/finds user and returns JWT token
        val client = OkHttpClient()
        val json = JSONObject()
        json.put("idToken", idToken)
        
        val body = RequestBody.create(
            "application/json".toMediaType(),
            json.toString()
        )
        
        val request = Request.Builder()
            .url("https://yourdomain.com/api/auth/google/verify")
            .post(body)
            .build()
            
        client.newCall(request).enqueue(object : Callback {
            override fun onResponse(call: Call, response: Response) {
                val token = response.body?.string()
                saveToken(token)
                navigateToHome()
            }
            
            override fun onFailure(call: Call, e: IOException) {
                // Handle error
            }
        })
    }
    
    private fun saveToken(token: String) {
        val prefs = getSharedPreferences("auth", Context.MODE_PRIVATE)
        prefs.edit().putString("jwt_token", token).apply()
    }
    
    private fun navigateToHome() {
        // Navigate to main screen
    }
}
```

### Step 4: strings.xml

```xml
<resources>
    <string name="google_client_id">YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com</string>
</resources>
```

## 4. API Flow

### Method 1: Web OAuth Flow (Recommended)

```
1. User clicks "Sign in with Google"
   → Open browser: https://yourdomain.com/api/auth/google?platform=mobile

2. User logs in with Google

3. Backend redirects to: g2bulk://auth/callback?token=JWT_TOKEN

4. Android app receives deep link
   → Extract token
   → Save to SharedPreferences
   → Navigate to home
```

### Method 2: Token Exchange (Alternative)

```
1. User clicks "Sign in with Google"
   → Google Sign-In SDK

2. Get ID token from Google

3. Send to backend: POST /api/auth/google/verify
   Body: { "idToken": "..." }

4. Backend verifies with Google
   → Creates/finds user
   → Returns JWT token

5. Save token and navigate
```

## 5. Backend Endpoints

### Web OAuth (Already Implemented)
```
GET /api/auth/google?platform=mobile
GET /api/auth/google/callback
```

### Token Verification (Need to Add)
```kotlin
// Add this to authController.js
exports.googleVerify = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify token with Google
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;
    
    // Find or create user
    let user = await User.findOne({ googleId });
    
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save();
      } else {
        user = await User.create({
          name,
          email,
          googleId,
          authProvider: 'google',
          password: Math.random().toString(36).slice(-8)
        });
      }
    }
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};
```

## 6. Testing

### Local Testing
```bash
# Use ngrok for HTTPS callback
ngrok http 3000

# Update Google Console with ngrok URL:
https://xxxxx.ngrok.io/api/auth/google/callback

# Update .env:
BACKEND_URL=https://xxxxx.ngrok.io

# Test on Android device or emulator
```

### Deep Link Testing
```bash
# Test deep link with ADB
adb shell am start -W -a android.intent.action.VIEW -d "g2bulk://auth/callback?token=test_token" com.yourcompany.g2bulk
```

## 7. Production Checklist

- [ ] Get production SHA-1 certificate fingerprint
- [ ] Add production OAuth credentials in Google Console
- [ ] Update authorized redirect URIs with production domain
- [ ] Update `FRONTEND_URL` and backend URL in .env
- [ ] Test on real device with production build
- [ ] Enable ProGuard rules for Google Play Services

## 8. ProGuard Rules

In `android/app/proguard-rules.pro`:

```proguard
# Google Play Services
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Google Auth
-keep class com.google.android.gms.auth.** { *; }
```

## 9. Environment Variables

`.env` file:
```env
GOOGLE_CLIENT_ID=your-web-client-id
GOOGLE_CLIENT_SECRET=your-web-client-secret
MOBILE_DEEP_LINK_SCHEME=g2bulk
FRONTEND_URL=http://localhost:5173
```

## 10. Complete Flow Diagram

```
Android App                     Backend                      Google
    |                              |                            |
    |-- Click "Sign in" ---------->|                            |
    |                              |-- Redirect ------------->  |
    |                              |                            |
    |<-------------------------- Login with Google -------------|
    |                              |                            |
    |                              |<-- User Data --------------|
    |                              |                            |
    |                              |-- Create/Find User         |
    |                              |-- Generate JWT             |
    |                              |                            |
    |<-- Deep Link: g2bulk://auth/callback?token=xxx ----------|
    |                              |                            |
    |-- Save Token                 |                            |
    |-- Navigate Home              |                            |
```
