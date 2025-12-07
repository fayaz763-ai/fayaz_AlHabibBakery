import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Image, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../components/Button';
import { BottomTabBar } from '../components/BottomTabBar';
import { Header } from '../components/Header';
import { productStorage, categoryStorage, saleStorage } from '../services/storage';
import { formatCurrency, formatDate, isExpired, isExpiringSoon } from '../utils/helpers';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive, getTableColumnWidths } from '../utils/responsive';

// Web-specific date input component
const WebDateInput = ({ value, onChange, inputId, placeholder }) => {
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    
    if (!containerRef.current) return;

    const existing = containerRef.current.querySelector(`#${inputId}`);
    if (existing) {
      existing.remove();
    }
    
    const input = document.createElement('input');
    input.id = inputId;
    input.type = 'date';
    input.value = value || '';
    
    // Match exact styling with filterInput
    const baseStyle = {
      width: '100%',
      paddingTop: '8px',
      paddingBottom: '8px',
      paddingLeft: '12px',
      paddingRight: '12px',
      fontSize: '14px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: colors.border,
      borderRadius: '6px',
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: 'inherit',
      outline: 'none',
      boxSizing: 'border-box',
      display: 'block',
      margin: 0,
    };
    
    Object.assign(input.style, baseStyle);
    
    input.onchange = (e) => {
      onChange(e.target.value || '');
    };
    
    containerRef.current.appendChild(input);
    inputRef.current = input;
    
    return () => {
      if (input && input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };
  }, [value, onChange, inputId]);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value || '';
    }
  }, [value]);

  if (Platform.OS !== 'web') {
    return (
      <TextInput
        style={styles.filterInput}
        placeholder={placeholder || 'dd/mm/yyyy'}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={colors.textSecondary}
      />
    );
  }
  
  return <View ref={containerRef} style={{ width: '100%' }} />;
};

export const ProductsScreen = ({ navigation }) => {
  const { user: currentUser } = useAuth();
  const { isMobile, isTablet, width } = useResponsive();
  const columnWidths = getTableColumnWidths(isMobile, isTablet);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expiryFrom, setExpiryFrom] = useState('');
  const [expiryTo, setExpiryTo] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      setImageErrors({});
    }, [])
  );

  const loadData = async () => {
    try {
      const [allProducts, allCategories, allSales] = await Promise.all([
        productStorage.getAll(),
        categoryStorage.getAll(),
        saleStorage.getAll(),
      ]);
      setProducts(allProducts);
      setCategories(allCategories);
      setSales(allSales);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = async (product) => {
    // Check if product has sales
    const productSales = sales.filter(s => s.productId === product.id);
    const hasSales = productSales.length > 0;
    
    const confirmMessage = hasSales 
      ? `Are you sure you want to delete "${product.name}"? This will also delete ${productSales.length} associated sale(s).`
      : `Are you sure you want to delete "${product.name}"?`;
    
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        try {
          // Delete associated sales first
          if (hasSales) {
            for (const sale of productSales) {
              await saleStorage.delete(sale.id);
            }
          }
          
          const result = await productStorage.delete(product.id);
          if (result) {
            Alert.alert('Success', 'Product deleted successfully');
            await loadData();
          } else {
            Alert.alert('Error', 'Failed to delete product');
          }
        } catch (error) {
          console.error('Error deleting product:', error);
          Alert.alert('Error', 'Failed to delete product');
        }
      }
    } else {
      Alert.alert(
        'Delete Product',
        confirmMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                // Delete associated sales first
                if (hasSales) {
                  for (const sale of productSales) {
                    await saleStorage.delete(sale.id);
                  }
                }
                
                const result = await productStorage.delete(product.id);
                if (result) {
                  Alert.alert('Success', 'Product deleted successfully');
                  await loadData();
                } else {
                  Alert.alert('Error', 'Failed to delete product');
                }
              } catch (error) {
                console.error('Error deleting product:', error);
                Alert.alert('Error', 'Failed to delete product');
              }
            },
          },
        ]
      );
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return '';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

  const getProductRevenue = (productId) => {
    const productSales = sales.filter(s => s.productId === productId);
    return productSales.reduce((sum, sale) => sum + parseFloat(sale.total_price || 0), 0);
  };

  const getStockValue = (product) => {
    return parseFloat(product.price || 0) * parseInt(product.stock || 0);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortProducts = (productsToSort) => {
    return [...productsToSort].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'category':
          aValue = getCategoryName(a.product_category_id).toLowerCase();
          bValue = getCategoryName(b.product_category_id).toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.price || 0);
          bValue = parseFloat(b.price || 0);
          break;
        case 'stock':
          aValue = parseInt(a.stock || 0);
          bValue = parseInt(b.stock || 0);
          break;
        case 'revenue':
          aValue = getProductRevenue(a.id);
          bValue = getProductRevenue(b.id);
          break;
        case 'stockValue':
          aValue = getStockValue(a);
          bValue = getStockValue(b);
          break;
        case 'expiry':
          aValue = a.expiry_date ? new Date(a.expiry_date).getTime() : 0;
          bValue = b.expiry_date ? new Date(b.expiry_date).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filterProducts = () => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.location && product.location.toLowerCase().includes(query)) ||
        getCategoryName(product.product_category_id).toLowerCase().includes(query)
      );
    }

    // Expiry date filters
    if (expiryFrom) {
      const fromDate = new Date(expiryFrom);
      filtered = filtered.filter(product => {
        if (!product.expiry_date) return false;
        return new Date(product.expiry_date) >= fromDate;
      });
    }

    if (expiryTo) {
      const toDate = new Date(expiryTo);
      filtered = filtered.filter(product => {
        if (!product.expiry_date) return false;
        return new Date(product.expiry_date) <= toDate;
      });
    }

    return filtered;
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setExpiryFrom('');
    setExpiryTo('');
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const filteredProducts = sortProducts(filterProducts());

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Dynamic styles based on screen size
  const dynamicStyles = StyleSheet.create({
    filterRow: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 8 : 12,
    },
    filterGroup: {
      minWidth: isMobile ? '100%' : 150,
    },
    tableHeader: {
      paddingVertical: isMobile ? 8 : 12,
      paddingHorizontal: isMobile ? 4 : 8,
    },
    headerText: {
      fontSize: isMobile ? 10 : 12,
    },
    tableRow: {
      paddingVertical: isMobile ? 8 : 12,
      paddingHorizontal: isMobile ? 4 : 8,
    },
    cellText: {
      fontSize: isMobile ? 11 : 13,
    },
    productName: {
      fontSize: isMobile ? 12 : 14,
    },
  });

  const renderProductRow = (product) => {
    const expired = isExpired(product.expiry_date);
    const expiringSoon = isExpiringSoon(product.expiry_date);
    const lowStock = parseInt(product.stock || 0) < 5;
    const hasImageError = imageErrors[product.id];
    const revenue = getProductRevenue(product.id);
    const stockValue = getStockValue(product);
    const rowStyle = [
      styles.tableRow,
      expired && styles.expiredRow,
      lowStock && !expired && styles.lowStockRow,
    ];

    return (
      <View key={product.id} style={[rowStyle, dynamicStyles.tableRow]}>
        {/* Image */}
        <View style={styles.imageCell}>
          {product.image_uri && !hasImageError ? (
            <Image
              source={{ uri: product.image_uri }}
              style={styles.productImage}
              onError={() => handleImageError(product.id)}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷</Text>
            </View>
          )}
        </View>

        {/* Name */}
        <View style={styles.nameCell}>
          <TouchableOpacity onPress={() => navigation.navigate('ProductSales', { product })}>
            <Text style={[styles.productName, dynamicStyles.productName, styles.productNameLink]}>
              {product.name}
            </Text>
          </TouchableOpacity>
          {expired && (
            <View style={styles.badge}>
              <Text style={styles.badgeTextExpired}>Expired</Text>
            </View>
          )}
          {lowStock && !expired && (
            <View style={styles.badge}>
              <Text style={styles.badgeTextLow}>Low</Text>
            </View>
          )}
        </View>

        {/* Category */}
        <View style={styles.categoryCell}>
          <Text style={[styles.cellText, dynamicStyles.cellText]}>{getCategoryName(product.product_category_id) || '-'}</Text>
        </View>

        {/* Price */}
        <View style={styles.priceCell}>
          <Text style={[styles.cellText, dynamicStyles.cellText]}>{formatCurrency(product.price)}</Text>
        </View>

        {/* Stock */}
        <View style={styles.stockCell}>
          <Text style={[styles.cellText, dynamicStyles.cellText, lowStock && styles.lowStockText]}>
            {product.stock || 0}
          </Text>
        </View>

        {/* Revenue - Hidden on mobile */}
        {!isMobile && (
          <View style={styles.revenueCell}>
            <Text style={[styles.cellText, dynamicStyles.cellText]}>{formatCurrency(revenue)}</Text>
          </View>
        )}

        {/* Stock Value - Hidden on mobile */}
        {!isMobile && (
          <View style={styles.stockValueCell}>
            <Text style={[styles.cellText, dynamicStyles.cellText]}>{formatCurrency(stockValue)}</Text>
          </View>
        )}

        {/* Expiry */}
        <View style={styles.expiryCell}>
          {product.expiry_date ? (
            <Text style={[styles.cellText, dynamicStyles.cellText, expired && styles.expiredText]}>
              {new Date(product.expiry_date).toISOString().split('T')[0]}
            </Text>
          ) : (
            <Text style={[styles.cellText, dynamicStyles.cellText]}>-</Text>
          )}
        </View>

        {/* Location - Hidden on mobile */}
        {!isMobile && (
          <View style={styles.locationCell}>
            <Text style={[styles.cellText, dynamicStyles.cellText]}>{product.location || '-'}</Text>
          </View>
        )}

        {/* Actions */}
        {currentUser?.role === 'admin' && (
          <View style={styles.actionsCell}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProductEdit', { product })}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(product)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Header */}
        <Header
          title="Products"
          rightComponent={
            currentUser?.role === 'admin' ? (
              <Button
                title={isMobile ? "+ New" : "+ New Product"}
                onPress={() => navigation.navigate('ProductCreate')}
                style={styles.addButton}
              />
            ) : null
          }
        />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={[styles.filterRow, dynamicStyles.filterRow]}>
          <View style={[styles.filterGroup, dynamicStyles.filterGroup]}>
            <Text style={styles.filterLabel}>Name</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Search name"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Expiry From</Text>
            <WebDateInput
              value={expiryFrom}
              onChange={setExpiryFrom}
              inputId="expiry-from-date-picker"
              placeholder="dd/mm/yyyy"
            />
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Expiry To</Text>
            <WebDateInput
              value={expiryTo}
              onChange={setExpiryTo}
              inputId="expiry-to-date-picker"
              placeholder="dd/mm/yyyy"
            />
          </View>
          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilters}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Table */}
      <ScrollView
        style={styles.tableContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.tableContentContainer}
      >
        {/* Table Header */}
        <View style={[styles.tableHeader, dynamicStyles.tableHeader]}>
          <View style={styles.imageCell}>
            <Text style={[styles.headerText, dynamicStyles.headerText]}>Image</Text>
          </View>
          <TouchableOpacity
            style={styles.nameCell}
            onPress={() => handleSort('name')}
          >
            <Text style={[styles.headerText, dynamicStyles.headerText]}>
              Name{renderSortIcon('name')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.categoryCell}
            onPress={() => handleSort('category')}
          >
            <Text style={[styles.headerText, dynamicStyles.headerText]}>
              Category{renderSortIcon('category')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.priceCell}
            onPress={() => handleSort('price')}
          >
            <Text style={[styles.headerText, dynamicStyles.headerText]}>
              Price{renderSortIcon('price')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stockCell}
            onPress={() => handleSort('stock')}
          >
            <Text style={[styles.headerText, dynamicStyles.headerText]}>
              Stock{renderSortIcon('stock')}
            </Text>
          </TouchableOpacity>
          {!isMobile && (
            <>
              <TouchableOpacity
                style={styles.revenueCell}
                onPress={() => handleSort('revenue')}
              >
                <Text style={[styles.headerText, dynamicStyles.headerText]}>
                  Revenue{renderSortIcon('revenue')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stockValueCell}
                onPress={() => handleSort('stockValue')}
              >
                <Text style={[styles.headerText, dynamicStyles.headerText]}>
                  Stock Value{renderSortIcon('stockValue')}
                </Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.expiryCell}
            onPress={() => handleSort('expiry')}
          >
            <Text style={[styles.headerText, dynamicStyles.headerText]}>
              Expiry{renderSortIcon('expiry')}
            </Text>
          </TouchableOpacity>
          {!isMobile && (
            <View style={styles.locationCell}>
              <Text style={[styles.headerText, dynamicStyles.headerText]}>Location</Text>
            </View>
          )}
          {currentUser?.role === 'admin' && (
            <View style={styles.actionsCell}>
              <Text style={[styles.headerText, dynamicStyles.headerText]}>Actions</Text>
            </View>
          )}
        </View>

        {/* Table Body */}
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          filteredProducts.map(product => renderProductRow(product))
        )}
      </ScrollView>
      </View>
      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filtersContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 12,
  },
  filterGroup: {
    flex: 1,
    minWidth: 150,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  filterActions: {
    justifyContent: 'flex-end',
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  tableContainer: {
    flex: 1,
    width: '100%',
  },
  tableContentContainer: {
    flexGrow: 1,
    width: '100%',
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    width: '100%',
  },
  expiredRow: {
    backgroundColor: '#FFEBEE',
  },
  lowStockRow: {
    backgroundColor: '#FFF9C4',
  },
  imageCell: {
    flex: 0.8,
    minWidth: 60,
    maxWidth: 80,
    paddingHorizontal: 4,
  },
  nameCell: {
    flex: 2,
    minWidth: 120,
    paddingHorizontal: 8,
  },
  categoryCell: {
    flex: 1.2,
    minWidth: 100,
    paddingHorizontal: 8,
  },
  priceCell: {
    flex: 1,
    minWidth: 80,
    paddingHorizontal: 8,
  },
  stockCell: {
    flex: 0.8,
    minWidth: 60,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  revenueCell: {
    flex: 1.2,
    minWidth: 100,
    paddingHorizontal: 8,
  },
  stockValueCell: {
    flex: 1.2,
    minWidth: 100,
    paddingHorizontal: 8,
  },
  expiryCell: {
    flex: 1.2,
    minWidth: 100,
    paddingHorizontal: 8,
  },
  locationCell: {
    flex: 1.2,
    minWidth: 100,
    paddingHorizontal: 8,
  },
  actionsCell: {
    flex: 1,
    minWidth: 120,
    maxWidth: 150,
    paddingHorizontal: 8,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-end',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    textTransform: 'uppercase',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 24,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  productNameLink: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeTextExpired: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.error,
    backgroundColor: '#FFCDD2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  badgeTextLow: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F57C00',
    backgroundColor: '#FFF59D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  cellText: {
    fontSize: 13,
    color: colors.text,
  },
  lowStockText: {
    color: colors.warning,
    fontWeight: '600',
  },
  expiredText: {
    color: colors.error,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.secondary, // Match AL HABIB BAKERY text color
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    width: '100%',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
