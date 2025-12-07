import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { categoryStorage } from '../services/storage';
import { colors } from '../constants/colors';

export const CategoryCreateScreen = ({ navigation, route }) => {
  const category = route?.params?.category;
  const isEdit = !!category;

  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Category name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const categoryData = {
        name: name.trim(),
        description: description.trim() || null,
      };

      if (isEdit) {
        await categoryStorage.update(category.id, categoryData);
        Alert.alert('Success', 'Category updated successfully');
      } else {
        await categoryStorage.create(categoryData);
        Alert.alert('Success', 'Category created successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Header
        title={isEdit ? 'Edit Category' : 'Create Category'}
        rightComponent={
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.form}>
          <Input
            label="Category Name *"
            value={name}
            onChangeText={setName}
            placeholder="Enter category name"
            error={errors.name}
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter category description (optional)"
            multiline
            error={errors.description}
          />

          <Button
            title={isEdit ? 'Update Category' : 'Create Category'}
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 24,
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
  form: {
    width: '100%',
  },
  saveButton: {
    marginTop: 8,
  },
});

