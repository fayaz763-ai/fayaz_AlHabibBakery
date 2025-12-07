import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BottomTabBar } from '../components/BottomTabBar';
import { Header } from '../components/Header';
import { productStorage, saleStorage } from '../services/storage';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/colors';
import { useResponsive } from '../utils/responsive';

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    recentSales: [],
    lowStockProducts: [],
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const products = await productStorage.getAll();
      const sales = await saleStorage.getAll();
      const recentSales = await saleStorage.getRecent(10);

      // Get product names for sales
      const salesWithProducts = recentSales.map(sale => {
        const product = products.find(p => p.id === sale.productId);
        return {
          ...sale,
          productName: product?.name || 'Unknown Product',
        };
      });

      const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_price || 0), 0);
      const totalStockValue = products.reduce((sum, product) => {
        return sum + (parseInt(product.stock || 0) * parseFloat(product.price || 0));
      }, 0);
      
      const lowStockProducts = products
        .filter(p => parseInt(p.stock || 0) < 5)
        .sort((a, b) => parseInt(a.stock || 0) - parseInt(b.stock || 0))
        .slice(0, 10);

      setStats({
        totalProducts: products.length,
        totalRevenue,
        totalStockValue,
        lowStockCount: lowStockProducts.length,
        recentSales: salesWithProducts,
        lowStockProducts,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
      <Header
        title="Dashboard"
      />

      {/* KPI Cards */}
      <View style={[styles.statsGrid, { 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 8 : 12,
      }]}>
        <Card 
          style={[styles.statCard, { 
            width: isMobile ? '100%' : isTablet ? '48%' : '24%',
          }]}
          onPress={() => navigation.navigate('Main', { screen: 'ProductsTab' })}
        >
          <Text style={styles.statLabel}>TOTAL PRODUCTS</Text>
          <Text style={styles.statValue}>{stats.totalProducts}</Text>
        </Card>

        <Card style={[styles.statCard, { 
          width: isMobile ? '100%' : isTablet ? '48%' : '24%',
        }]}>
          <Text style={styles.statLabel}>TOTAL REVENUE</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
        </Card>

        <Card style={[styles.statCard, { 
          width: isMobile ? '100%' : isTablet ? '48%' : '24%',
        }]}>
          <Text style={styles.statLabel}>STOCK VALUE</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.totalStockValue)}</Text>
        </Card>

        <Card style={[styles.statCard, stats.lowStockCount > 0 && styles.warningCard, { 
          width: isMobile ? '100%' : isTablet ? '48%' : '24%',
        }]}>
          <Text style={styles.statLabel}>LOW STOCK ITEMS</Text>
          <Text style={[styles.statValue, stats.lowStockCount > 0 && styles.warningValue]}>
            {stats.lowStockCount}
          </Text>
        </Card>
      </View>

      {/* Two Column Layout: Recent Sales and Low Stock */}
      <View style={[styles.tablesContainer, {
        flexDirection: isMobile ? 'column' : 'row',
        gap: 16,
      }]}>
        {/* Recent Sales Section */}
        <Card style={[styles.tableCard, {
          flex: isMobile ? 1 : 1,
        }]}>
          <View style={styles.tableHeaderSection}>
            <Text style={styles.sectionTitle}>Recent Sales</Text>
            <View style={styles.tableButtons}>
              <TouchableOpacity
                style={styles.inactiveButton}
                onPress={() => navigation.navigate('ProductsTab')}
              >
                <Text style={styles.inactiveButtonText}>All Products</Text>
              </TouchableOpacity>
              {user?.role === 'admin' && (
                <TouchableOpacity
                  style={styles.activeButton}
                  onPress={() => navigation.navigate('ProductCreate')}
                >
                  <Text style={styles.activeButtonText}>New Product</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {stats.recentSales.length === 0 ? (
            <View style={styles.emptyTableContainer}>
              <Text style={styles.emptyText}>No sales yet</Text>
            </View>
          ) : (
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeaderRow}>
                <View style={styles.dateColumn}>
                  <Text style={styles.tableHeaderText}>Date</Text>
                </View>
                <View style={styles.productColumn}>
                  <Text style={styles.tableHeaderText}>Product</Text>
                </View>
                <View style={styles.qtyColumn}>
                  <Text style={styles.tableHeaderText}>Qty</Text>
                </View>
                <View style={styles.totalColumn}>
                  <Text style={styles.tableHeaderText}>Total</Text>
                </View>
              </View>

              {/* Table Rows */}
              {stats.recentSales.map((sale) => (
                <View key={sale.id} style={styles.tableRow}>
                  <View style={styles.dateColumn}>
                    <Text style={styles.tableCellText}>{formatDate(sale.performedAt)}</Text>
                  </View>
                  <View style={styles.productColumn}>
                    <Text style={styles.tableCellText}>{sale.productName}</Text>
                  </View>
                  <View style={styles.qtyColumn}>
                    <Text style={styles.tableCellText}>{sale.quantity || 0}</Text>
                  </View>
                  <View style={styles.totalColumn}>
                    <Text style={styles.tableCellText}>{formatCurrency(sale.total_price)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Low Stock Section */}
        <Card style={[styles.tableCard, {
          flex: isMobile ? 1 : 1,
        }]}>
          <View style={styles.tableHeaderSection}>
            <Text style={styles.sectionTitle}>Low Stock</Text>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => navigation.navigate('ProductsTab')}
            >
              <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>

          {stats.lowStockProducts.length === 0 ? (
            <View style={styles.emptyTableContainer}>
              <Text style={styles.emptyText}>No low stock items</Text>
            </View>
          ) : (
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeaderRow}>
                <View style={styles.nameColumn}>
                  <Text style={styles.tableHeaderText}>Name</Text>
                </View>
                <View style={styles.stockColumn}>
                  <Text style={styles.tableHeaderText}>Stock</Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.tableHeaderText}>Price</Text>
                </View>
                <View style={styles.viewColumn}>
                  <Text style={styles.tableHeaderText}></Text>
                </View>
              </View>

              {/* Table Rows */}
              {stats.lowStockProducts.map((product) => (
                <View key={product.id} style={styles.tableRow}>
                  <View style={styles.nameColumn}>
                    <Text style={styles.tableCellText}>{product.name}</Text>
                  </View>
                  <View style={styles.stockColumn}>
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockBadgeText}>{product.stock || 0}</Text>
                    </View>
                  </View>
                  <View style={styles.priceColumn}>
                    <Text style={styles.tableCellText}>{formatCurrency(product.price)}</Text>
                  </View>
                  <View style={styles.viewColumn}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => navigation.navigate('ProductEdit', { product })}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
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
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.error,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsGrid: {
    padding: 16,
  },
  statCard: {
    marginBottom: 12,
    alignItems: 'center',
    padding: 20,
  },
  warningCard: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  warningValue: {
    color: colors.error,
  },
  tablesContainer: {
    padding: 16,
  },
  tableCard: {
    padding: 16,
  },
  tableHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  tableButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  inactiveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  inactiveButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  activeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: colors.secondary, // Match AL HABIB BAKERY text color
  },
  activeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  manageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: colors.secondary, // Match AL HABIB BAKERY text color
  },
  manageButtonText: {
    color: '#FFFFFF', // White text on colored background
    fontSize: 12,
    fontWeight: '600',
  },
  table: {
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
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
    flex: 1,
    paddingHorizontal: 4,
  },
  productColumn: {
    flex: 2,
    paddingHorizontal: 4,
  },
  qtyColumn: {
    flex: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  totalColumn: {
    flex: 1.5,
    paddingHorizontal: 4,
    alignItems: 'flex-end',
  },
  nameColumn: {
    flex: 2,
    paddingHorizontal: 4,
  },
  stockColumn: {
    flex: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  priceColumn: {
    flex: 1.5,
    paddingHorizontal: 4,
  },
  viewColumn: {
    flex: 1,
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
  stockBadge: {
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  viewButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.secondary, // Match AL HABIB BAKERY text color
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyTableContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
