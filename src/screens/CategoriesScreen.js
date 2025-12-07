import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, RefreshControl, Modal, Platform } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BottomTabBar } from '../components/BottomTabBar';
import { Header } from '../components/Header';
import { categoryStorage, productStorage } from '../services/storage';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

export const CategoriesScreen = ({ navigation }) => {
  const { user: currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const allCategories = await categoryStorage.getAll();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingCategory) {
        await categoryStorage.update(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        });
        Alert.alert('Success', 'Category updated successfully');
      } else {
        await categoryStorage.create({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        });
        Alert.alert('Success', 'Category created successfully');
      }
      resetForm();
      await loadCategories();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save category');
    }
  };

  const handleDelete = async (category) => {
    const products = await productStorage.getAll();
    const hasProducts = products.some(p => p.product_category_id === category.id);

    if (hasProducts) {
      Alert.alert('Cannot Delete', 'This category has products assigned to it.');
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await categoryStorage.delete(category.id);
            loadCategories();
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setFormErrors({});
    setEditingCategory(null);
    setShowModal(false);
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Header */}
        <Header
          title="Categories"
          rightComponent={
            currentUser?.role === 'admin' ? (
              <Button
                title="New Category"
                onPress={openCreateModal}
                style={styles.newButton}
              />
            ) : null
          }
        />

      {/* Table */}
      <ScrollView
        style={styles.tableContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.tableContent}
      >
        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories found</Text>
          </View>
        ) : (
          <>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.nameHeader}>
                <Text style={styles.headerText}>Name</Text>
              </View>
              <View style={styles.descriptionHeader}>
                <Text style={styles.headerText}>Description</Text>
              </View>
              <View style={styles.createdHeader}>
                <Text style={styles.headerText}>Created</Text>
              </View>
              {currentUser?.role === 'admin' && (
                <View style={styles.actionsHeader}>
                  <Text style={styles.headerText}>Actions</Text>
                </View>
              )}
            </View>

            {/* Table Rows */}
            {categories.map((category, index) => (
              <View
                key={category.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlternate
                ]}
              >
                <View style={styles.nameCell}>
                  <Text style={styles.cellText}>{category.name}</Text>
                </View>
                <View style={styles.descriptionCell}>
                  <Text style={styles.cellText}>
                    {category.description || '-'}
                  </Text>
                </View>
                <View style={styles.createdCell}>
                  <Text style={styles.cellText}>
                    {formatDate(category.createdAt)}
                  </Text>
                </View>
                {currentUser?.role === 'admin' && (
                  <View style={styles.actionsCell}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => startEdit(category)}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(category)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      {currentUser?.role === 'admin' && (
        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={resetForm}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </Text>
                <TouchableOpacity onPress={resetForm}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Input
                  label="Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter category name"
                  error={formErrors.name}
                />

                <Input
                  label="Description"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Enter category description (optional)"
                  multiline
                  style={styles.descriptionInput}
                />

                <View style={styles.modalActions}>
                  <Button
                    title={editingCategory ? 'Update Category' : 'Create Category'}
                    onPress={handleSave}
                    style={styles.submitButton}
                  />
                  <TouchableOpacity
                    style={styles.cancelModalButton}
                    onPress={resetForm}
                  >
                    <Text style={styles.cancelModalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
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
    backgroundColor: colors.background,
  },
  newButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tableContainer: {
    flex: 1,
  },
  tableContent: {
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4A5568',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  nameHeader: {
    flex: 2,
    paddingHorizontal: 8,
  },
  descriptionHeader: {
    flex: 2,
    paddingHorizontal: 8,
  },
  createdHeader: {
    flex: 1,
    paddingHorizontal: 8,
  },
  actionsHeader: {
    width: 150,
    paddingHorizontal: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  tableRowAlternate: {
    backgroundColor: '#F7FAFC',
  },
  nameCell: {
    flex: 2,
    paddingHorizontal: 8,
  },
  descriptionCell: {
    flex: 2,
    paddingHorizontal: 8,
  },
  createdCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  actionsCell: {
    width: 150,
    paddingHorizontal: 8,
    flexDirection: 'row',
    gap: 8,
  },
  cellText: {
    fontSize: 14,
    color: colors.text,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: colors.secondary, // Match AL HABIB BAKERY text color
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF', // White text on colored background
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: Platform.OS === 'web' ? 500 : '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalClose: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  modalBody: {
    padding: 20,
  },
  descriptionInput: {
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    flex: 1,
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
