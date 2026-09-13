import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface NearestCardProps {
  listing: {
    id: string;
    name: string;
    address: string;
    rating: number;
    distance: string;
    image: string;
  };
  onPress: () => void;
}

const NearestCard = ({ listing, onPress }: NearestCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: listing.image }} style={styles.image} />
      <View style={styles.content}>
        <Text variant="titleSmall" style={styles.name} numberOfLines={1}>
          {listing.name}
        </Text>
        <Text variant="bodySmall" style={styles.address} numberOfLines={1}>
          {listing.address}
        </Text>
        <View style={styles.info}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text variant="bodySmall" style={styles.ratingText}>{listing.rating}</Text>
          </View>
          <View style={styles.distance}>
            <Ionicons name="location-outline" size={14} color="#FF6B35" />
            <Text variant="bodySmall" style={styles.distanceText}>{listing.distance}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 100,
  },
  content: {
    padding: 10,
  },
  name: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  address: {
    color: '#666',
    marginBottom: 8,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    color: '#333',
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    marginLeft: 4,
    color: '#FF6B35',
  },
});

export default NearestCard;
