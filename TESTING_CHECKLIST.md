# Testing Checklist - Al Habib Bakery

## ✅ Application Testing Flow

### 1. Authentication Flow

#### Login Test
- [ ] Navigate to http://localhost:8081
- [ ] Should see Login screen
- [ ] Enter email: `admin@habib.com`
- [ ] Enter password: `password123`
- [ ] Click Login button
- [ ] Should navigate to Dashboard
- [ ] Should see user info displayed

#### Register Test
- [ ] Click "Register" link on Login screen
- [ ] Fill in name, email, password, confirm password
- [ ] Click Register button
- [ ] Should automatically log in and navigate to Dashboard

#### Logout Test
- [ ] From Dashboard, click Logout button
- [ ] Confirm logout in alert
- [ ] Should navigate back to Login screen
- [ ] Should not be able to access Dashboard without login

### 2. Dashboard Flow

- [ ] View Dashboard statistics:
  - Total Products count
  - Total Revenue
  - Stock Value
  - Low Stock Items count
- [ ] View Recent Sales list
- [ ] Pull to refresh works
- [ ] User info displays correctly
- [ ] Logout button works

### 3. Products Flow

#### View Products
- [ ] Navigate to Products tab
- [ ] Should see list of products (or empty state)
- [ ] Search functionality works
- [ ] Product cards display correctly

#### Create Product (Admin Only)
- [ ] Click "+ Add Product" button
- [ ] Fill in product details:
  - Name (required)
  - Price (required)
  - Stock (required)
  - Location (optional)
  - Expiry Date (optional)
  - Category (optional)
- [ ] Click "Create Product"
- [ ] Should see success message
- [ ] Should navigate back to Products list
- [ ] New product should appear in list

#### Edit Product (Admin Only)
- [ ] Click "Edit" on a product
- [ ] Modify product details
- [ ] Click "Update Product"
- [ ] Should see success message
- [ ] Changes should reflect in product list

#### Delete Product (Admin Only)
- [ ] Click "Delete" on a product
- [ ] Confirm deletion
- [ ] Product should be removed from list

#### View Product Sales
- [ ] Click "View Sales" on a product
- [ ] Should see sales history for that product
- [ ] Should see sales statistics

#### Record Sale (Admin Only)
- [ ] Click "Record Sale" on a product
- [ ] Enter quantity
- [ ] Enter unit price (or use default)
- [ ] Enter sale date
- [ ] Total price should calculate automatically
- [ ] Click "Record Sale"
- [ ] Should see success message
- [ ] Stock should decrease automatically

### 4. Sales Flow

- [ ] View sales for a product
- [ ] Delete sale (should restore stock)
- [ ] Sales statistics display correctly
- [ ] Recent sales show in Dashboard

### 5. Categories Flow

#### View Categories
- [ ] Navigate to Categories tab
- [ ] Should see list of categories (or empty state)

#### Create Category (Admin Only)
- [ ] Click "+ Add Category"
- [ ] Enter category name
- [ ] Enter description (optional)
- [ ] Click "Create Category"
- [ ] Should see success message
- [ ] Category should appear in list

#### Edit Category (Admin Only)
- [ ] Click "Edit" on a category
- [ ] Modify category details
- [ ] Click "Update Category"
- [ ] Changes should reflect

#### Delete Category (Admin Only)
- [ ] Try to delete category with products (should show error)
- [ ] Delete empty category (should work)

#### Assign Category to Product
- [ ] Create/Edit product
- [ ] Select a category
- [ ] Save product
- [ ] Category should appear on product card

### 6. Data Persistence

- [ ] Create some products
- [ ] Record some sales
- [ ] Refresh browser
- [ ] All data should persist
- [ ] Logout and login again
- [ ] All data should still be there

### 7. Role-Based Access

#### Admin User
- [ ] Can create/edit/delete products
- [ ] Can record sales
- [ ] Can create/edit/delete categories
- [ ] Can delete sales

#### Regular User (if registered)
- [ ] Can view products
- [ ] Can view sales
- [ ] Cannot create/edit/delete products
- [ ] Cannot record sales
- [ ] Cannot manage categories

### 8. Search and Filter

- [ ] Search products by name
- [ ] Search products by location
- [ ] Search products by category
- [ ] Results update in real-time

### 9. Error Handling

- [ ] Try to login with wrong credentials (should show error)
- [ ] Try to create product without required fields (should show validation errors)
- [ ] Try to record sale with quantity > stock (should show error)
- [ ] Try to delete category with products (should show error)

### 10. UI/UX

- [ ] All screens are responsive
- [ ] Loading states show during operations
- [ ] Success/error messages display correctly
- [ ] Navigation flows smoothly
- [ ] Forms validate input
- [ ] Pull to refresh works
- [ ] Empty states display correctly

## Test Results

Date: _______________
Tester: _______________

### Issues Found:
1. 
2. 
3. 

### Notes:
- 

