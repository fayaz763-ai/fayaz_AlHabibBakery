# 🚀 Running Al Habib Bakery Application

## Application Status

The Expo development server is starting up. Here's how to access and run the application:

## Method 1: Using the Startup Script (Easiest)

```bash
cd "/Users/fayaz.alam/ROR/Al Habib Bakery"
./start.sh
```

## Method 2: Manual Start

### For Web (Desktop) - Recommended
```bash
cd "/Users/fayaz.alam/ROR/Al Habib Bakery"
export NODE_TLS_REJECT_UNAUTHORIZED=0
npm run web
```

### For iOS Simulator
```bash
cd "/Users/fayaz.alam/ROR/Al Habib Bakery"
export NODE_TLS_REJECT_UNAUTHORIZED=0
npm run ios
```

### For Android Emulator
```bash
cd "/Users/fayaz.alam/ROR/Al Habib Bakery"
export NODE_TLS_REJECT_UNAUTHORIZED=0
npm run android
```

### Start Dev Server (Choose Platform)
```bash
cd "/Users/fayaz.alam/ROR/Al Habib Bakery"
export NODE_TLS_REJECT_UNAUTHORIZED=0
npm start
```
Then press:
- `w` - Open in web browser
- `i` - Open in iOS simulator
- `a` - Open in Android emulator

## Access the Application

Once the server starts, you'll see:

```
Metro waiting on exp://192.168.x.x:8081
› Press w │ open web
› Press i │ open iOS simulator
› Press a │ open Android emulator
```

### Web Browser
- **URL**: http://localhost:8081
- The app will automatically open in your default browser
- Or manually navigate to the URL

### Mobile Devices
1. Install **Expo Go** app on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code shown in the terminal
3. The app will load on your device

## Default Login Credentials

After the app loads, use these credentials:

- **Email**: `admin@habib.com`
- **Password**: `password123`

## Troubleshooting

### If you see certificate errors:
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

### If port 8081 is busy:
```bash
npx expo start --port 8082
```

### To clear cache:
```bash
npx expo start -c
```

### To stop the server:
Press `Ctrl + C` in the terminal

## Expected Startup Time

- First time: 30-60 seconds (downloading dependencies)
- Subsequent: 10-20 seconds

## What to Expect

1. ✅ Metro bundler starts
2. ✅ Webpack compiles the app
3. ✅ Browser opens automatically (for web)
4. ✅ App loads with login screen

## Application Features Available

Once logged in, you can:
- 📊 View Dashboard with statistics
- 🍞 Manage Products (CRUD operations)
- 💰 Record Sales
- 📁 Manage Categories
- 🔍 Search Products
- 📈 View Sales History

## Server Status

The development server is running in the background. Check the terminal output for:
- Server URL
- QR code (for mobile)
- Platform options

## Next Steps

1. ✅ Server is starting
2. ⏳ Wait for compilation (30-60 seconds)
3. 🌐 Open browser to http://localhost:8081
4. 🔑 Login with admin credentials
5. 🎉 Start using the app!

---

**Note**: The application uses local storage, so all data persists between sessions. The first time you run it, a default admin user is automatically created.

