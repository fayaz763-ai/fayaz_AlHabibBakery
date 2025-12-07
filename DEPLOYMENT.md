# Deployment Guide - Al Habib Bakery

Complete guide for deploying the Al Habib Bakery Expo React Native application.

## 🚀 Quick Deploy to Netlify (Recommended)

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### Step 2: Deploy on Netlify
1. Go to **[netlify.com](https://netlify.com)** and sign in with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Select repository: **fayaz763-ai/fayaz_AlHabibBakery**
4. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build:web`
   - Publish directory: `dist`
   - Node version: `20`
5. Click **"Deploy site"**
6. Wait 1-2 minutes
7. ✅ **Your app is live!** URL: `https://your-site-name.netlify.app`

### Automatic Deployments
- Every push to `main` branch = automatic deployment
- Pull requests get preview URLs automatically

---

## 🌐 Alternative: GitHub Pages

### Step 1: Enable GitHub Pages
1. Go to: https://github.com/fayaz763-ai/fayaz_AlHabibBakery/settings/pages
2. Under **"Source"**, select: **"GitHub Actions"**
3. Click **"Save"**

### Step 2: Push Code
```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### Step 3: Wait for Deployment
1. Go to **"Actions"** tab in your repo
2. Watch the workflow run (~2 minutes)
3. ✅ Your app: **https://fayaz763-ai.github.io/fayaz_AlHabibBakery**

---

## 🔧 Testing Locally

Before deploying, test your production build:

```bash
# Build the app
npm run build:web

# Preview the build
npm run preview
```

Visit the URL shown (usually `http://localhost:3000`) to test.

---

## 🐛 Troubleshooting

### Netlify 404 Error
If you see "Page not found" on Netlify:
1. ✅ **Already fixed!** The `_redirects` file is automatically created during build
2. Clear cache and redeploy:
   - Netlify Dashboard → Deploys → "Clear cache and deploy site"

### Build Fails
- Ensure Node.js version is 18+ (set to 20 in `netlify.toml`)
- Clear cache: `npm cache clean --force`
- Delete `node_modules`: `rm -rf node_modules && npm install`

### Routing Issues
- The `_redirects` file handles SPA routing automatically
- All routes redirect to `index.html` for client-side routing

### Assets Not Loading
- Verify `app.json` has correct `assetBundlePatterns`
- Check that assets are in the `assets/` folder

---

## 📁 Project Structure

```
├── src/                    # Source code
├── assets/                 # Images and static assets
├── public/                 # Public files (redirects)
├── .github/workflows/      # GitHub Actions workflows
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies and scripts
├── app.json               # Expo configuration
└── README.md              # Project documentation
```

---

## 🔄 Updating Your Deployed App

### Automatic (Recommended):
Just push to GitHub:
```bash
git add .
git commit -m "Update app"
git push origin main
```
Platform automatically rebuilds and deploys (1-2 minutes).

### Manual:
1. Make changes locally
2. Commit and push
3. Wait for deployment

---

## 📊 Build Configuration

### Netlify (`netlify.toml`)
- Build command: `npm run build:web`
- Publish directory: `dist`
- Node version: `20`
- Redirects: All routes → `index.html` (SPA routing)

### Build Script (`package.json`)
- `npm run build:web` - Builds production web version
- `npm run preview` - Preview production build locally

---

## ✅ Files Included in Repository

**Required Files:**
- ✅ Source code (`src/`, `App.js`)
- ✅ Configuration (`package.json`, `app.json`, `netlify.toml`)
- ✅ Assets (`assets/`)
- ✅ Public files (`public/_redirects`)
- ✅ GitHub workflows (`.github/workflows/`)
- ✅ Documentation (`README.md`, `DEPLOYMENT.md`)

**Excluded (via `.gitignore`):**
- ❌ `node_modules/` - Dependencies
- ❌ `dist/` - Build output
- ❌ `.expo/` - Expo cache
- ❌ Environment files (`.env*`)

---

## 🎯 Next Steps

1. ✅ Code is ready to deploy
2. Choose platform (Netlify recommended)
3. Follow deployment steps above
4. Share your live URL! 🎉

Your app will be accessible worldwide in minutes!
