import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USERS: 'users',
  PRODUCTS: 'products',
  SALES: 'sales',
  CATEGORIES: 'categories',
  CURRENT_USER: 'current_user',
};

// Generic storage helpers
const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
};

const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    return false;
  }
};

const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return false;
  }
};

// User storage
export const userStorage = {
  async getAll() {
    return (await getItem(STORAGE_KEYS.USERS)) || [];
  },

  async getById(id) {
    const users = await this.getAll();
    return users.find(u => u.id === id);
  },

  async getByEmail(email) {
    const users = await this.getAll();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async create(user) {
    const users = await this.getAll();
    const newUser = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    await setItem(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  async update(id, updates) {
    const users = await this.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    await setItem(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  async delete(id) {
    const users = await this.getAll();
    const filtered = users.filter(u => u.id !== id);
    await setItem(STORAGE_KEYS.USERS, filtered);
    return true;
  },
};

// Product storage
export const productStorage = {
  async getAll() {
    return (await getItem(STORAGE_KEYS.PRODUCTS)) || [];
  },

  async getById(id) {
    const products = await this.getAll();
    return products.find(p => p.id === id);
  },

  async create(product) {
    const products = await this.getAll();
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      stock: product.stock || 0,
      price: parseFloat(product.price) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    await setItem(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },

  async update(id, updates) {
    const products = await this.getAll();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      console.error('Product not found for update:', id);
      return null;
    }
    products[index] = { 
      ...products[index], 
      ...updates, 
      price: updates.price !== undefined ? parseFloat(updates.price) : products[index].price,
      stock: updates.stock !== undefined ? parseInt(updates.stock) : products[index].stock,
      updatedAt: new Date().toISOString() 
    };
    await setItem(STORAGE_KEYS.PRODUCTS, products);
    console.log('Product updated successfully:', products[index]);
    return products[index];
  },

  async delete(id) {
    try {
      const products = await this.getAll();
      const initialLength = products.length;
      const filtered = products.filter(p => p.id !== id);
      
      if (filtered.length === initialLength) {
        console.error('Product not found for deletion:', id);
        return false;
      }
      
      const result = await setItem(STORAGE_KEYS.PRODUCTS, filtered);
      console.log('Product deleted successfully:', id);
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  },

  async search(query) {
    const products = await this.getAll();
    if (!query) return products;
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      (p.location && p.location.toLowerCase().includes(lowerQuery))
    );
  },
};

// Sale storage
export const saleStorage = {
  async getAll() {
    return (await getItem(STORAGE_KEYS.SALES)) || [];
  },

  async getByProductId(productId) {
    const sales = await this.getAll();
    return sales.filter(s => s.productId === productId);
  },

  async create(sale) {
    const sales = await this.getAll();
    const newSale = {
      ...sale,
      id: Date.now().toString(),
      performedAt: sale.performedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sales.push(newSale);
    await setItem(STORAGE_KEYS.SALES, sales);
    return newSale;
  },

  async delete(id) {
    const sales = await this.getAll();
    const filtered = sales.filter(s => s.id !== id);
    await setItem(STORAGE_KEYS.SALES, filtered);
    return true;
  },

  async getRecent(limit = 10) {
    const sales = await this.getAll();
    return sales.sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt)).slice(0, limit);
  },
};

// Category storage
export const categoryStorage = {
  async getAll() {
    return (await getItem(STORAGE_KEYS.CATEGORIES)) || [];
  },

  async getById(id) {
    const categories = await this.getAll();
    return categories.find(c => c.id === id);
  },

  async create(category) {
    const categories = await this.getAll();
    const newCategory = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    await setItem(STORAGE_KEYS.CATEGORIES, categories);
    return newCategory;
  },

  async update(id, updates) {
    const categories = await this.getAll();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    categories[index] = { ...categories[index], ...updates, updatedAt: new Date().toISOString() };
    await setItem(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  },

  async delete(id) {
    const categories = await this.getAll();
    const filtered = categories.filter(c => c.id !== id);
    await setItem(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  },
};

// Auth storage
export const authStorage = {
  async getCurrentUser() {
    return await getItem(STORAGE_KEYS.CURRENT_USER);
  },

  async setCurrentUser(user) {
    return await setItem(STORAGE_KEYS.CURRENT_USER, user);
  },

  async clearCurrentUser() {
    return await removeItem(STORAGE_KEYS.CURRENT_USER);
  },
};

// Initialize default admin user
export const initializeDefaultData = async () => {
  const users = await userStorage.getAll();
  if (users.length === 0) {
    await userStorage.create({
      email: 'admin@habib.com',
      password: 'password123', // In real app, this should be hashed
      role: 'admin',
      name: 'Admin User',
    });
  }
};

