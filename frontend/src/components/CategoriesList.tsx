import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import CategoryCard from './CategoryCard';

interface Category {
  id: string;
  name: string;
  icon: string;
}

const CATEGORIES: Category[] = [
  { id: '1', name: 'Home Services', icon: 'home-outline' },
  { id: '2', name: 'Daily Needs', icon: 'cart-outline' },
  { id: '3', name: 'Doctor', icon: 'medkit-outline' },
  { id: '4', name: 'Cake Shop', icon: 'cafe-outline' },
  { id: '5', name: 'Restaurants', icon: 'restaurant-outline' },
  { id: '6', name: 'Hotels', icon: 'bed-outline' },
  { id: '7', name: 'Salon & Spa', icon: 'cut-outline' },
  { id: '8', name: 'Education', icon: 'school-outline' },
];

interface CategoriesListProps {
  onViewAll: () => void;
}

const CategoriesList = ({ onViewAll }: CategoriesListProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>Categories</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text variant="bodyMedium" style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {CATEGORIES.map((category) => (
          <View key={category.id} style={styles.gridItem}>
            <CategoryCard category={category} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    color: '#FF6B35',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  gridItem: {
    width: '25%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default CategoriesList;
