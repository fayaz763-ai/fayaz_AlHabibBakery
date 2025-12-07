# Al Habib Bakery - Setup and Running Guide

## Project Overview

This is a React Native application built with Expo that supports both mobile and desktop platforms. It's a complete bakery inventory and sales management system with local data storage.

## Features

✅ **User Authentication**
- Login/Register functionality
- Role-based access (Admin/User)
- Session management

✅ **Product Management**
- Create, Read, Update, Delete products
- Search and filter products
- Track stock levels
- Expiry date tracking
- Location tracking
- Category assignment

✅ **Sales Tracking**
- Record sales for products
- Automatic stock deduction
- Sales history per product
- Revenue tracking

✅ **Category Management**
- Create and manage product categories
- Assign products to categories

✅ **Dashboard**
- Total products count
- Total revenue
- Stock value
- Low stock alerts
- Recent sales

✅ **Local Data Storage**
- All data stored locally using AsyncStorage
- No backend required
- Data persists across app restarts

## Project Structure

```
Al Habib Bakery/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.js
│   │   ├── Input.js
│   │   └── Card.js
│   ├── screens/             # Screen components
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── ProductsScreen.js
│   │   ├── ProductCreateScreen.js
│   │   ├── SalesScreen.js
│   │   ├── ProductSalesScreen.js
│   │   ├── CategoriesScreen.js
│   │   └── CategoryCreateScreen.js
│   ├── services/            # Data storage and business logic
│   │   ├── storage.js       # AsyncStorage wrapper
│   │   └── auth.js           # Authentication service
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.js
│   ├── contexts/            # React contexts
│   │   └── AuthContext.js
│   ├── utils/               # Utility functions
│   │   └── helpers.js
│   └── constants/          # Constants
│       └── colors.js
├── App.js                   # Main app entry point
├── package.json
└── app.json
```

## Installation

1. **Install Dependencies**
   ```bash
   cd "Al Habib Bakery"
   npm install --legacy-peer-deps
   ```

2. **Note**: This project requires Node.js 18+ for optimal performance. If you're using Node 16, it will work but with warnings.

## Running the Application

### Web (Desktop)
```bash
npm run web
```
Then open http://localhost:8081 in your browser

### iOS Simulator
```bash
npm run ios
```
(Requires Xcode and iOS Simulator)

### Android Emulator
```bash
npm run android
```
(Requires Android Studio and Android Emulator)

### Start Expo Dev Server
```bash
npm start
```
Then press:
- `w` for web
- `i` for iOS
- `a` for Android

## Default Login Credentials

After first launch, a default admin user is created:
- **Email**: admin@habib.com
- **Password**: password123

## Data Storage

All data is stored locally using AsyncStorage:
- Users
- Products
- Sales
- Categories

Data persists across app restarts and is stored on the device.

## Key Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tooling
- **React Navigation**: Navigation library
- **AsyncStorage**: Local data persistence
- **React Context**: State management for authentication

## Platform Support

✅ **Web (Desktop)**: Full support
✅ **iOS**: Full support
✅ **Android**: Full support

## Features Matching Rails App

This React Native app replicates all features from the Rails application:

1. ✅ User authentication with roles
2. ✅ Product CRUD operations
3. ✅ Sales recording and tracking
4. ✅ Product categories
5. ✅ Dashboard with statistics
6. ✅ Search and filtering
7. ✅ Stock management
8. ✅ Expiry date tracking

## Next Steps for Deployment

1. **Build for Production**
   ```bash
   # Web
   npx expo export:web
   
   # iOS
   eas build --platform ios
   
   # Android
   eas build --platform android
   ```

2. **Free Hosting Options**
   - **Web**: Netlify, Vercel, GitHub Pages
   - **Mobile**: Expo Application Services (EAS)

3. **Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Al Habib Bakery React Native app"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

## Troubleshooting

### Certificate Issues
If you encounter SSL certificate errors, try:
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
npm start
```

### Node Version
If you have Node 16, the app will work but consider upgrading to Node 18+:
```bash
nvm install 18
nvm use 18
```

### Port Already in Use
If port 8081 is in use:
```bash
npx expo start --port 8082
```

## Development Notes

- All screens are responsive and work on both mobile and desktop
- The app uses a bakery-themed color scheme (browns and beiges)
- Admin users have full CRUD access
- Regular users can view products and sales but cannot create/edit/delete

