import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import NearestCard from './NearestCard';

interface Listing {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: string;
  image: string;
}

const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    name: 'Royal Restaurant',
    address: 'Ferry Road, Maidenhead',
    rating: 4.5,
    distance: '1.5 KM',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop',
  },
  {
    id: '2',
    name: 'The Garden Cafe',
    address: 'High Street, London',
    rating: 4.2,
    distance: '2.0 KM',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=200&fit=crop',
  },
  {
    id: '3',
    name: 'Spice Kitchen',
    address: 'Main Road, Rickmansworth',
    rating: 4.7,
    distance: '0.8 KM',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop',
  },
];

interface NearestListingsProps {
  onViewAll: () => void;
  onListingPress: (id: string) => void;
}

const NearestListings = ({ onViewAll, onListingPress }: NearestListingsProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>Nearest for your Home</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text variant="bodyMedium" style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_LISTINGS.map((listing) => (
          <NearestCard
            key={listing.id}
            listing={listing}
            onPress={() => onListingPress(listing.id)}
          />
        ))}
      </ScrollView>
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
});

export default NearestListings;
