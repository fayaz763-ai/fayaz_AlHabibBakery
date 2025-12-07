# Quick Start Guide - Al Habib Bakery

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd "/Users/fayaz.alam/ROR/Al Habib Bakery"
npm install --legacy-peer-deps
```

### Step 2: Start the Application
```bash
# For Web (Desktop)
npm run web

# OR start Expo dev server and choose platform
npm start
# Then press 'w' for web, 'i' for iOS, 'a' for Android
```

### Step 3: Access the Application
- **Web**: Open http://localhost:8081 in your browser
- **Mobile**: Use Expo Go app to scan QR code

## 🔑 Default Login

After first launch, use these credentials:
- **Email**: `admin@habib.com`
- **Password**: `password123`

## 📱 Features Available

1. **Dashboard** - View statistics and recent sales
2. **Products** - Manage bakery products
3. **Sales** - Record and track sales
4. **Categories** - Organize products by category

## 🛠️ Troubleshooting

### If npm start fails:
```bash
# Try with explicit port
npx expo start --port 8082 --web
```

### If you see certificate errors:
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
npm start
```

### To clear cache:
```bash
npx expo start -c
```

## 📦 Project Location

Full path: `/Users/fayaz.alam/ROR/Al Habib Bakery`

## ✅ What's Included

- ✅ Complete React Native app
- ✅ All screens and components
- ✅ Local data storage
- ✅ Authentication system
- ✅ Product management
- ✅ Sales tracking
- ✅ Category management
- ✅ Dashboard with statistics

## 🎯 Next Steps

1. Test the application
2. Push to Git: `git init && git add . && git commit -m "Initial commit"`
3. Deploy to free hosting (see SETUP.md)

Enjoy your bakery management app! 🍞

