import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BottomTabBar } from '../components/BottomTabBar';
import { Header } from '../components/Header';
import { productStorage, categoryStorage } from '../services/storage';
import { colors } from '../constants/colors';

// Web-specific file input component
const WebFileInput = React.forwardRef(({ onFileSelect, inputId }, ref) => {
  if (Platform.OS !== 'web') return null;
  
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const existing = document.getElementById(inputId);
    if (existing) {
      existing.remove();
    }
    
    const input = document.createElement('input');
    input.id = inputId;
    input.type = 'file';
    input.accept = 'image/*';
    
    Object.assign(input.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      opacity: '0',
      overflow: 'hidden',
      zIndex: '-1',
      pointerEvents: 'none',
      left: '-9999px',
      top: '-9999px',
      display: 'none',
    });
    
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          Alert.alert('Error', 'Please select a valid image file');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'Image size should be less than 5MB');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            onFileSelect(reader.result);
          }
        };
        reader.onerror = () => {
          Alert.alert('Error', 'Failed to read image file');
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    };
    
    document.body.appendChild(input);
    
    if (ref) {
      if (typeof ref === 'function') {
        ref(input);
      } else {
        ref.current = input;
      }
    }
    
    return () => {
      if (input && input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };
  }, [ref, inputId, onFileSelect]);
  
  return <View ref={containerRef} style={{ width: 0, height: 0, opacity: 0 }} />;
});

// Web-specific date input component
const WebDateInput = ({ value, onChange, inputId, containerStyle }) => {
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
    
    Object.assign(input.style, {
      width: '100%',
      padding: '10px 12px',
      fontSize: '14px',
      border: `1px solid ${colors.border}`,
      borderRadius: '6px',
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: 'inherit',
      outline: 'none',
      boxSizing: 'border-box',
      display: 'block',
    });
    
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

  if (Platform.OS !== 'web') return null;
  
  return <View ref={containerRef} style={containerStyle} />;
};

export const ProductCreateScreen = ({ navigation, route }) => {
  const product = route?.params?.product;
  const isEdit = !!product;
  const fileInputRef = useRef(null);

  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [stock, setStock] = useState(product?.stock?.toString() ?? '');
  const [location, setLocation] = useState(product?.location ?? '');
  const [expiryDate, setExpiryDate] = useState(product?.expiry_date ? product.expiry_date.split('T')[0] : '');
  const [categoryId, setCategoryId] = useState(product?.product_category_id ?? '');
  const [categoryInput, setCategoryInput] = useState('');
  const [imageUri, setImageUri] = useState(product?.image_uri ?? null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const loadCategories = async () => {
    try {
      const allCategories = await categoryStorage.getAll();
      setCategories(allCategories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    loadCategories();
    if (Platform.OS !== 'web') {
      ImagePicker.requestMediaLibraryPermissionsAsync();
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCategories();
    });
    return unsubscribe;
  }, [navigation]);

  const handleCategorySelect = (catId) => {
    setCategoryId(catId);
    setCategoryInput('');
  };

  const handleCategoryInput = (text) => {
    setCategoryInput(text);
    // Check if it matches an existing category
    const matchingCategory = categories.find(c => 
      c.name.toLowerCase() === text.toLowerCase()
    );
    if (matchingCategory) {
      setCategoryId(matchingCategory.id);
    } else {
      setCategoryId('');
    }
  };

  const handleImageSelect = () => {
    if (Platform.OS === 'web') {
      const input = fileInputRef.current || document.getElementById('product-image-input');
      if (input) {
        input.click();
      }
    } else {
      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Choose from Gallery', 
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
              }
            }
          },
          { 
            text: 'Take Photo', 
            onPress: async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permission is required');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
              }
            }
          },
        ]
      );
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!price || parseFloat(price) < 0) {
      newErrors.price = 'Valid price is required';
    }
    if (stock === '' || parseInt(stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    if (location && location.length > 100) {
      newErrors.location = 'Location must be up to 100 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      let finalCategoryId = categoryId;
      
      // If category input doesn't match existing, create new category
      if (categoryInput && !categoryId) {
        const newCategory = await categoryStorage.create({
          name: categoryInput.trim(),
        });
        finalCategoryId = newCategory.id;
      }

      // Format expiry date properly (ensure it's in YYYY-MM-DD format)
      let formattedExpiryDate = null;
      if (expiryDate && expiryDate.trim()) {
        // If expiryDate is already in YYYY-MM-DD format, use it
        if (/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
          formattedExpiryDate = expiryDate;
        } else {
          // Otherwise, parse it from dd/mm/yyyy or dd.mm.yyyy format
          formattedExpiryDate = parseExpiryDate(expiryDate);
          // Validate the parsed date
          if (!formattedExpiryDate || !/^\d{4}-\d{2}-\d{2}$/.test(formattedExpiryDate)) {
            console.warn('Invalid expiry date format:', expiryDate);
            formattedExpiryDate = null;
          }
        }
      }

      const productData = {
        name: name.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        location: location.trim() || null,
        expiry_date: formattedExpiryDate || null,
        product_category_id: finalCategoryId || null,
        image_uri: imageUri || null,
      };

      if (isEdit) {
        if (!product || !product.id) {
          Alert.alert('Error', 'Product ID is missing. Cannot update product.');
          setLoading(false);
          return;
        }
        console.log('Updating product:', product.id, productData);
        const updated = await productStorage.update(product.id, productData);
        if (updated) {
          // Show success message
          if (Platform.OS === 'web') {
            // On web, use window.alert for immediate feedback, then navigate
            window.alert('Product updated successfully');
            navigation.goBack();
          } else {
            // On mobile, use Alert.alert with callback
            Alert.alert('Success', 'Product updated successfully', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        } else {
          Alert.alert('Error', 'Failed to update product. Product not found.');
        }
      } else {
        await productStorage.create(productData);
        // Show success message
        if (Platform.OS === 'web') {
          // On web, use window.alert for immediate feedback, then navigate
          window.alert('Product created successfully');
          navigation.goBack();
        } else {
          // On mobile, use Alert.alert with callback
          Alert.alert('Success', 'Product created successfully', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const formatExpiryDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const parseExpiryDate = (dateStr) => {
    if (!dateStr) return '';
    // Handle both dots and slashes as separators
    const parts = dateStr.split(/[./-]/);
    if (parts.length === 3) {
      // If it looks like dd/mm/yyyy or dd.mm.yyyy format
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      // Convert to YYYY-MM-DD format
      return `${year}-${month}-${day}`;
    }
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    return '';
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Header */}
        <Header
          title={isEdit ? 'Edit Product' : 'Create Product'}
          rightComponent={
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.headerButtonText}>Back</Text>
            </TouchableOpacity>
          }
        />

        {/* Two Column Layout */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Left Column - Form */}
        <View style={styles.leftColumn}>
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>NAME</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="Enter product name"
              placeholderTextColor={colors.textSecondary}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>PRICE</Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={[styles.priceInput, errors.price && styles.inputError]}
                value={price}
                onChangeText={setPrice}
                placeholder="0.0"
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>EXPIRY DATE</Text>
            {Platform.OS === 'web' ? (
              <WebDateInput
                value={expiryDate}
                onChange={setExpiryDate}
                inputId="product-expiry-date-input"
                containerStyle={styles.dateInputWrapper}
              />
            ) : (
              <TextInput
                style={styles.input}
                value={expiryDate ? formatExpiryDate(expiryDate) : ''}
                onChangeText={(text) => {
                  if (text.length === 0) {
                    setExpiryDate('');
                  } else {
                    // Parse the input and store in YYYY-MM-DD format
                    const parsed = parseExpiryDate(text);
                    setExpiryDate(parsed);
                  }
                }}
                placeholder="dd/mm/yyyy"
                placeholderTextColor={colors.textSecondary}
              />
            )}
            <Text style={styles.optionalText}>Optional</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <TextInput
              style={styles.input}
              value={categoryInput || (categoryId ? (categories.find(c => c.id === categoryId)?.name || '') : '')}
              onChangeText={handleCategoryInput}
              placeholder="Select or type new"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.helperText}>Select or type to add new</Text>
            {categories.length > 0 && !categoryInput && (
              <ScrollView style={styles.categoryDropdown} nestedScrollEnabled>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      categoryId === cat.id && styles.categoryOptionSelected
                    ]}
                    onPress={() => handleCategorySelect(cat.id)}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      categoryId === cat.id && styles.categoryOptionTextSelected
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>STOCK</Text>
            <TextInput
              style={[styles.input, errors.stock && styles.inputError]}
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
            {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>LOCATION</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              value={location}
              onChangeText={setLocation}
              placeholder="Storage location"
              placeholderTextColor={colors.textSecondary}
              maxLength={100}
            />
            <Text style={styles.helperText}>Up to 100 chars</Text>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={isEdit ? 'Update Product' : 'Create Product'}
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Column - Image */}
        <View style={styles.rightColumn}>
          <Text style={styles.imageLabel}>PRODUCT IMAGE</Text>
          
          {Platform.OS === 'web' && (
            <WebFileInput 
              inputId="product-image-input"
              onFileSelect={setImageUri}
              ref={fileInputRef}
            />
          )}

          <TouchableOpacity
            style={styles.fileInputButton}
            onPress={handleImageSelect}
          >
            <Text style={styles.fileInputText}>
              {Platform.OS === 'web' ? 'Choose file' : 'Select Image'}
            </Text>
            {Platform.OS === 'web' && (
              <Text style={styles.fileInputHint}>No file chosen</Text>
            )}
          </TouchableOpacity>

          <View style={styles.imagePreviewContainer}>
            {imageUri ? (
              <>
                <Text style={styles.currentImageLabel}>Current image</Text>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}
                >
                  <Text style={styles.removeImageText}>Remove Image</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>No image selected</Text>
              </View>
            )}
          </View>

          <Text style={styles.imageGuidelines}>
            PNG / JPG up to ~5MB. Preview updates instantly.
          </Text>
        </View>
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
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    padding: 20,
    gap: 20,
  },
  leftColumn: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 400 : '100%',
  },
  rightColumn: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 400 : '100%',
  },
  formSection: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
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
  optionalText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dateInputWrapper: {
    width: '100%',
    alignSelf: 'stretch',
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  categoryDropdown: {
    maxHeight: 150,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryOptionSelected: {
    backgroundColor: colors.secondary, // Match AL HABIB BAKERY text color
  },
  categoryOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  imageLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fileInputButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  fileInputText: {
    color: colors.text,
    fontSize: 14,
  },
  fileInputHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  imagePreviewContainer: {
    width: '100%',
    minHeight: 300,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginBottom: 12,
    overflow: 'hidden',
  },
  currentImageLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: colors.background,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  removeImageButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  removeImageText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  imageGuidelines: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
