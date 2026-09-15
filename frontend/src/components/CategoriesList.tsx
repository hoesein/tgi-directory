import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import CategoryCard from './CategoryCard';
import { useMainCategories } from '../api/useCategories';

interface CategoriesListProps {
  onViewAll: () => void;
  onCategoryPress: (id: string) => void;
}

const FALLBACK_CATEGORIES = [
  { id: 'fallback-hotel', name: 'Hotel', icon: 'bed-outline', level: 0, parent_id: null, sort_order: 1 },
  { id: 'fallback-restaurant', name: 'Restaurant', icon: 'restaurant-outline', level: 0, parent_id: null, sort_order: 2 },
  { id: 'fallback-emergency', name: 'Emergency', icon: 'warning-outline', level: 0, parent_id: null, sort_order: 3 },
  { id: 'fallback-hospital', name: 'Hospital/Clinic', icon: 'medkit-outline', level: 0, parent_id: null, sort_order: 4 },
] as const;

const CategoriesList = ({ onViewAll, onCategoryPress }: CategoriesListProps) => {
  const { data, isLoading } = useMainCategories();
  const categories = data && data.length > 0 ? data : FALLBACK_CATEGORIES;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>Categories</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text variant="bodyMedium" style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      {isLoading && !data ? (
        <ActivityIndicator style={{ paddingVertical: 20 }} color="#FF6B35" />
      ) : (
        <View style={styles.grid}>
          {categories.map((category) => (
            <View key={category.id} style={styles.gridItem}>
              <CategoryCard
                category={{ id: category.id, name: category.name, icon: category.icon ?? 'apps-outline' }}
                onPress={() => onCategoryPress(category.id)}
              />
            </View>
          ))}
        </View>
      )}
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
