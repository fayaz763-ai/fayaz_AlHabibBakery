import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, RefreshControl, TextInput, Modal } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BottomTabBar } from '../components/BottomTabBar';
import { Header } from '../components/Header';
import { userStorage } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/colors';

export const UsersScreen = ({ navigation }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await userStorage.getAll();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!editingUser && !formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      const existingUser = await userStorage.getByEmail(formData.email);
      if (existingUser) {
        Alert.alert('Error', 'Email already exists');
        return;
      }

      await userStorage.create({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });

      Alert.alert('Success', 'User created successfully');
      resetForm();
      await loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) return;

    try {
      const existingUser = await userStorage.getByEmail(formData.email);
      if (existingUser && existingUser.id !== editingUser.id) {
        Alert.alert('Error', 'Email already exists');
        return;
      }

      const updates = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
      };

      if (formData.password) {
        updates.password = formData.password;
      }

      await userStorage.update(editingUser.id, updates);
      Alert.alert('Success', 'User updated successfully');
      resetForm();
      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.id === currentUser?.id) {
      Alert.alert('Error', 'You cannot delete your own account');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${userToDelete.name || userToDelete.email}?`;
    
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        try {
          await userStorage.delete(userToDelete.id);
          Alert.alert('Success', 'User deleted successfully');
          await loadUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          Alert.alert('Error', 'Failed to delete user');
        }
      }
    } else {
      Alert.alert('Delete User', confirmMessage, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userStorage.delete(userToDelete.id);
              Alert.alert('Success', 'User deleted successfully');
              await loadUsers();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
    });
    setFormErrors({});
    setEditingUser(null);
    setShowModal(false);
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'user',
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
          title="Users"
          rightComponent={
            <Button
              title="New User"
              onPress={openCreateModal}
              style={styles.newButton}
            />
          }
        />

      {/* Table */}
      <ScrollView
        style={styles.tableContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.tableContent}
      >
        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : (
          <>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.emailHeader}>
                <Text style={styles.headerText}>Email</Text>
              </View>
              <View style={styles.roleHeader}>
                <Text style={styles.headerText}>Role</Text>
              </View>
              <View style={styles.createdHeader}>
                <Text style={styles.headerText}>Created</Text>
              </View>
              <View style={styles.actionsHeader}>
                <Text style={styles.headerText}>Actions</Text>
              </View>
            </View>

            {/* Table Rows */}
            {users.map((user, index) => (
              <View
                key={user.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlternate
                ]}
              >
                <View style={styles.emailCell}>
                  <Text style={styles.emailLink}>{user.email}</Text>
                </View>
                <View style={styles.roleCell}>
                  <View
                    style={[
                      styles.roleBadge,
                      user.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeUser
                    ]}
                  >
                    <Text style={styles.roleBadgeText}>
                      {user.role || 'user'}
                    </Text>
                  </View>
                </View>
                <View style={styles.createdCell}>
                  <Text style={styles.cellText}>
                    {formatDate(user.createdAt)}
                  </Text>
                </View>
                <View style={styles.actionsCell}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => startEdit(user)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  {user.id !== currentUser?.id && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteUser(user)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
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
                {editingUser ? 'Edit User' : 'New User'}
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
                placeholder="Enter user name"
                error={formErrors.name}
              />

              <Input
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={formErrors.email}
              />

              <Input
                label={editingUser ? 'New Password (leave empty to keep current)' : 'Password'}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="Enter password"
                secureTextEntry
                error={formErrors.password}
              />

              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Role</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      formData.role === 'admin' && styles.roleButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'admin' })}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        formData.role === 'admin' && styles.roleButtonTextActive,
                      ]}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      formData.role === 'user' && styles.roleButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'user' })}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        formData.role === 'user' && styles.roleButtonTextActive,
                      ]}
                    >
                      User
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalActions}>
                <Button
                  title={editingUser ? 'Update User' : 'Create User'}
                  onPress={editingUser ? handleUpdateUser : handleCreateUser}
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
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  emailHeader: {
    flex: 2,
    paddingHorizontal: 8,
  },
  roleHeader: {
    flex: 1,
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
    backgroundColor: '#F9FAFB',
  },
  emailCell: {
    flex: 2,
    paddingHorizontal: 8,
  },
  roleCell: {
    flex: 1,
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
  emailLink: {
    fontSize: 14,
    color: '#0284C7',
    textDecorationLine: 'underline',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeAdmin: {
    backgroundColor: colors.error,
  },
  roleBadgeUser: {
    backgroundColor: '#6B7280',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'lowercase',
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
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F9FAFB', // Light gray background
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#F3E5D8', // Light beige/tan background
    borderColor: '#D4A574', // Light brown border
  },
  roleButtonText: {
    fontSize: 16,
    color: colors.textSecondary, // Medium gray text
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#8B4513', // Saddle brown text for active state
    fontWeight: '700',
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
