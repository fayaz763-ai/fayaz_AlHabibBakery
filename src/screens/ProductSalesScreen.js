import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Alert, Image, Platform, TextInput } from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BottomTabBar } from '../components/BottomTabBar';
import { Header } from '../components/Header';
import { productStorage, saleStorage, categoryStorage } from '../services/storage';
import { formatCurrency } from '../utils/helpers';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../utils/responsive';

export const ProductSalesScreen = ({ navigation, route }) => {
  const product = route?.params?.product;
  const { user: currentUser } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const [sales, setSales] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(product);
  const [refreshing, setRefreshing] = useState(false);
  
  // Record Sale form state
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState(product?.price?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentProduct?.price) {
      setUnitPrice(currentProduct.price.toString());
    }
  }, [currentProduct]);

  const loadData = async () => {
    if (!product?.id) return;
    try {
      const [productSales, allCategories, updatedProduct] = await Promise.all([
        saleStorage.getByProductId(product.id),
        categoryStorage.getAll(),
        productStorage.getById(product.id),
      ]);
      setSales(productSales.sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt)));
      setCategories(allCategories);
      if (updatedProduct) {
        setCurrentProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Unassigned';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unassigned';
  };

  const getProductRevenue = () => {
    return sales.reduce((sum, sale) => sum + parseFloat(sale.total_price || 0), 0);
  };

  const getStockValue = () => {
    return parseFloat(currentProduct?.price || 0) * parseInt(currentProduct?.stock || 0);
  };

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return (qty * price).toFixed(2);
  };

  const validateSale = () => {
    const newErrors = {};
    if (!quantity || parseFloat(quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    } else if (parseFloat(quantity) > parseInt(currentProduct?.stock || 0)) {
      newErrors.quantity = 'Quantity exceeds available stock';
    }
    if (!unitPrice || parseFloat(unitPrice) < 0) {
      newErrors.unitPrice = 'Valid unit price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSale = async () => {
    if (!validateSale()) return;

    setLoading(true);
    try {
      const saleData = {
        productId: currentProduct.id,
        quantity: parseInt(quantity),
        unit_price: parseFloat(unitPrice),
        total_price: parseFloat(calculateTotal()),
        performedAt: new Date().toISOString(),
      };

      await saleStorage.create(saleData);

      // Update product stock
      const updatedStock = parseInt(currentProduct.stock || 0) - parseInt(quantity);
      await productStorage.update(currentProduct.id, { stock: updatedStock });
      
      // Reset form
      setQuantity('1');
      setUnitPrice(currentProduct.price?.toString() || '');
      
      // Reload data
      await loadData();
      
      Alert.alert('Success', 'Sale recorded successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (sale) => {
    Alert.alert(
      'Delete Sale',
      'Are you sure you want to delete this sale?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await saleStorage.delete(sale.id);
            // Restore stock
            const updatedStock = parseInt(currentProduct.stock || 0) + parseInt(sale.quantity);
            await productStorage.update(currentProduct.id, { stock: updatedStock });
            loadData();
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const revenue = getProductRevenue();
  const stockValue = getStockValue();

  return (
    <View style={styles.wrapper}>
      <Header showLogo={true} />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Product Info */}
        <View style={styles.header}>
        <View style={styles.headerLeft}>
          {currentProduct?.image_uri && (
            <Image source={{ uri: currentProduct.image_uri }} style={styles.productImage} />
          )}
          <Text style={styles.productTitle}>{currentProduct?.name || 'Product'}</Text>
        </View>
        <View style={styles.headerButtons}>
          {currentUser?.role === 'admin' && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('ProductEdit', { product: currentProduct })}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Details Cards */}
      <View style={[styles.detailsGrid, {
        flexDirection: isMobile ? 'column' : 'row',
        flexWrap: 'wrap',
      }]}>
        <Card style={[styles.detailCard, { width: isMobile ? '100%' : '48%' }]}>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.detailValue}>{formatCurrency(currentProduct?.price || 0)}</Text>
        </Card>
        <Card style={[styles.detailCard, { width: isMobile ? '100%' : '48%' }]}>
          <Text style={styles.detailLabel}>Stock</Text>
          <Text style={styles.detailValue}>{currentProduct?.stock || 0}</Text>
        </Card>
        <Card style={[styles.detailCard, { width: isMobile ? '100%' : '48%' }]}>
          <Text style={styles.detailLabel}>Revenue</Text>
          <Text style={styles.detailValue}>{formatCurrency(revenue)}</Text>
        </Card>
        <Card style={[styles.detailCard, { width: isMobile ? '100%' : '48%' }]}>
          <Text style={styles.detailLabel}>Stock Value</Text>
          <Text style={styles.detailValue}>{formatCurrency(stockValue)}</Text>
        </Card>
        <Card style={[styles.detailCard, { width: isMobile ? '100%' : '48%' }]}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>{getCategoryName(currentProduct?.product_category_id)}</Text>
        </Card>
        <Card style={[styles.detailCard, { width: isMobile ? '100%' : '48%' }]}>
          <Text style={styles.detailLabel}>Expiry Date</Text>
          <Text style={styles.detailValue}>
            {currentProduct?.expiry_date ? formatDate(currentProduct.expiry_date) : '-'}
          </Text>
        </Card>
        <Card style={[styles.detailCard, { width: isMobile ? '100%' : '48%' }]}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>{currentProduct?.location || '-'}</Text>
        </Card>
      </View>

      {/* Two Column Layout: Record Sale and Recent Sales */}
      <View style={[styles.contentContainer, {
        flexDirection: isMobile ? 'column' : 'row',
        gap: 16,
      }]}>
        {/* Record Sale Section - Left */}
        {currentUser?.role === 'admin' && (
          <Card style={[styles.sectionCard, { flex: isMobile ? 1 : 1 }]}>
            <Text style={styles.sectionTitle}>Record Sale</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Quantity</Text>
              <TextInput
                style={[styles.formInput, errors.quantity && styles.inputError]}
                value={quantity}
                onChangeText={(text) => {
                  setQuantity(text);
                  setErrors({ ...errors, quantity: '' });
                }}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Available</Text>
              <Text style={styles.availableText}>{currentProduct?.stock || 0}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Unit price</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={[styles.priceInput, errors.unitPrice && styles.inputError]}
                  value={unitPrice}
                  onChangeText={(text) => {
                    setUnitPrice(text);
                    setErrors({ ...errors, unitPrice: '' });
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              {errors.unitPrice && <Text style={styles.errorText}>{errors.unitPrice}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Total</Text>
              <Text style={styles.totalText}>{formatCurrency(calculateTotal())}</Text>
            </View>

            <Button
              title="Save Sale"
              onPress={handleCreateSale}
              loading={loading}
              style={styles.saveButton}
            />
          </Card>
        )}

        {/* Recent Sales Section - Right */}
        <Card style={[styles.sectionCard, { flex: isMobile ? 1 : 1 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sales</Text>
            <TouchableOpacity
              style={styles.allButton}
              onPress={() => navigation.navigate('ProductsTab')}
            >
              <Text style={styles.allButtonText}>All</Text>
            </TouchableOpacity>
          </View>

          {sales.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No sales recorded yet</Text>
            </View>
          ) : (
            <View style={styles.salesTable}>
              {/* Table Header */}
              <View style={styles.tableHeaderRow}>
                <View style={styles.dateColumn}>
                  <Text style={styles.tableHeaderText}>Date</Text>
                </View>
                <View style={styles.qtyColumn}>
                  <Text style={styles.tableHeaderText}>Qty</Text>
                </View>
                <View style={styles.unitColumn}>
                  <Text style={styles.tableHeaderText}>Unit</Text>
                </View>
                <View style={styles.totalColumn}>
                  <Text style={styles.tableHeaderText}>Total</Text>
                </View>
              </View>

              {/* Table Rows */}
              {sales.map((sale) => (
                <View key={sale.id} style={styles.tableRow}>
                  <View style={styles.dateColumn}>
                    <Text style={styles.tableCellText}>{formatDate(sale.performedAt)}</Text>
                  </View>
                  <View style={styles.qtyColumn}>
                    <Text style={styles.tableCellText}>{sale.quantity || 0}</Text>
                  </View>
                  <View style={styles.unitColumn}>
                    <Text style={styles.tableCellText}>{formatCurrency(sale.unit_price)}</Text>
                  </View>
                  <View style={styles.totalColumn}>
                    <Text style={styles.tableCellText}>{formatCurrency(sale.total_price)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>
      </ScrollView>
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
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 80 : 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: colors.border,
    resizeMode: 'cover',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.secondary, // Match AL HABIB BAKERY text color
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsGrid: {
    padding: 16,
    gap: 12,
  },
  detailCard: {
    padding: 16,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  contentContainer: {
    padding: 16,
  },
  sectionCard: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  availableText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  currencySymbol: {
    fontSize: 14,
    color: colors.text,
    paddingHorizontal: 12,
    fontWeight: '600',
  },
  priceInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  saveButton: {
    marginTop: 8,
  },
  allButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: colors.secondary, // Match AL HABIB BAKERY text color
  },
  allButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  salesTable: {
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  dateColumn: {
    flex: 1.5,
    paddingHorizontal: 4,
  },
  qtyColumn: {
    flex: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  unitColumn: {
    flex: 1.5,
    paddingHorizontal: 4,
  },
  totalColumn: {
    flex: 1.5,
    paddingHorizontal: 4,
    alignItems: 'flex-end',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    textTransform: 'uppercase',
  },
  tableCellText: {
    fontSize: 13,
    color: colors.text,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
