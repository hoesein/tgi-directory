import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface CategoryListItemProps {
  item: {
    id: string;
    title: string;
    location: string;
    rating: number;
    reviews: number;
    image: string;
  };
  onPress: () => void;
}

const CategoryListItem = ({ item, onPress }: CategoryListItemProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text variant="bodySmall" style={styles.location} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text variant="bodySmall" style={styles.rating}>
            {item.rating} ({item.reviews} reviews)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    marginLeft: 4,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    color: '#666',
    fontWeight: '500',
  },
});

export default CategoryListItem;
