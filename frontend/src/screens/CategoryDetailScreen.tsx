import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryListItem from '../components/CategoryListItem';

type RootStackParamList = {
  CategoryDetail: { categoryId: string };
  ListingDetail: { listingId: string };
};

type CategoryDetailScreenRouteProp = RouteProp<RootStackParamList, 'CategoryDetail'>;
type CategoryDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryDetail'>;

const CATEGORIES = [
  { id: '1', name: 'Home Services', icon: 'home-outline' },
  { id: '2', name: 'Daily Needs', icon: 'cart-outline' },
  { id: '3', name: 'Doctor', icon: 'medkit-outline' },
  { id: '4', name: 'Cake Shop', icon: 'cafe-outline' },
  { id: '5', name: 'Restaurants', icon: 'restaurant-outline' },
  { id: '6', name: 'Hotels', icon: 'bed-outline' },
  { id: '7', name: 'Salon & Spa', icon: 'cut-outline' },
  { id: '8', name: 'Education', icon: 'school-outline' },
];

const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'Professional Cleaning Service',
    location: '123 Main St, City Center',
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
    categoryId: '1',
  },
  {
    id: '2',
    title: 'City Fresh Supermarket',
    location: '45 Market Blvd',
    rating: 4.5,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=400&fit=crop',
    categoryId: '2',
  },
  {
    id: '3',
    title: 'Dr. Smith Clinic',
    location: 'Health Avenue 9',
    rating: 4.9,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=400&fit=crop',
    categoryId: '3',
  },
  {
    id: '4',
    title: 'Sweet Treats Bakery',
    location: 'Baker Street 22',
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop',
    categoryId: '4',
  },
];

const CategoryDetailScreen = () => {
  const route = useRoute<CategoryDetailScreenRouteProp>();
  const navigation = useNavigation<CategoryDetailScreenNavigationProp>();
  const initialCategoryId = route.params?.categoryId || '1';
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);

  const displayListings = MOCK_LISTINGS;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle}>Categories</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.categoryScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipSelected
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={selectedCategory === cat.id ? '#fff' : '#666'}
                style={styles.categoryChipIcon}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.id && styles.categoryChipTextSelected
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={displayListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <CategoryListItem
            item={item}
            onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  categoryScrollContainer: {
    backgroundColor: '#fff',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  categoryChipSelected: {
    backgroundColor: '#FF6B35',
  },
  categoryChipIcon: {
    marginRight: 6,
  },
  categoryChipText: {
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
});

export default CategoryDetailScreen;
