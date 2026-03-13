# Google OAuth Setup (Fix consent screen)

## 1. Add Privacy Policy & Terms of Service URLs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. **APIs & Services** → **OAuth consent screen**
4. Click **Edit app**
5. Fill in:
   - **Application privacy policy link:** `http://localhost:3000/privacy`
   - **Application terms of service link:** `http://localhost:3000/terms`
6. Click **Save and continue**

## 2. Add yourself as Test User (if app is in Testing)

1. On OAuth consent screen, scroll to **Test users**
2. Click **Add users**
3. Add `canyamanipekli@gmail.com`
4. Click **Save**

## 3. Enable Gmail API

1. **APIs & Services** → **Library**
2. Search for **Gmail API**
3. Click **Enable**

## 4. Verify OAuth redirect URIs

1. **APIs & Services** → **Credentials**
2. Click your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs** add both:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://127.0.0.1:3000/api/auth/callback/google`
