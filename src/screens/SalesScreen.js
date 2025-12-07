import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { saleStorage, productStorage } from '../services/storage';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import { colors } from '../constants/colors';

export const SalesScreen = ({ navigation, route }) => {
  const product = route?.params?.product;
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState(product?.price?.toString() || '');
  const [performedAt, setPerformedAt] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState('');

  useEffect(() => {
    if (product?.price) {
      setUnitPrice(product.price.toString());
    }
    calculateTotal();
  }, [quantity, unitPrice]);

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    setTotalPrice((qty * price).toFixed(2));
  };

  const validate = () => {
    const newErrors = {};
    if (!quantity || parseFloat(quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    } else if (product && parseFloat(quantity) > parseInt(product.stock || 0)) {
      newErrors.quantity = 'Quantity exceeds available stock';
    }
    if (!unitPrice || parseFloat(unitPrice) < 0) {
      newErrors.unitPrice = 'Valid unit price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSale = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const saleData = {
        productId: product.id,
        quantity: parseInt(quantity),
        unit_price: parseFloat(unitPrice),
        total_price: parseFloat(totalPrice),
        performedAt: performedAt ? new Date(performedAt).toISOString() : new Date().toISOString(),
      };

      await saleStorage.create(saleData);

      // Update product stock
      const updatedStock = parseInt(product.stock || 0) - parseInt(quantity);
      await productStorage.update(product.id, { stock: updatedStock });

      Alert.alert('Success', 'Sale recorded successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Record Sale</Text>
          {product && (
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productStock}>
                Available Stock: {product.stock || 0}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <Input
            label="Quantity *"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Enter quantity"
            keyboardType="numeric"
            error={errors.quantity}
          />

          <Input
            label="Unit Price *"
            value={unitPrice}
            onChangeText={setUnitPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.unitPrice}
          />

          <Input
            label="Sale Date"
            value={performedAt}
            onChangeText={setPerformedAt}
            placeholder="YYYY-MM-DD"
            error={errors.performedAt}
          />

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Price:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
          </View>

          <Button
            title="Record Sale"
            onPress={handleCreateSale}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  productInfo: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  productStock: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
  },
  saveButton: {
    marginTop: 8,
  },
});

