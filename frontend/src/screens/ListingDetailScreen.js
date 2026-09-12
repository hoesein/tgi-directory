import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import api from '../services/api';

const ListingDetailScreen = ({ route, navigation }) => {
  const { listingId } = route.params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListing();
  }, []);

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${listingId}`);
      setListing(response.data.data);
    } catch (error) {
      console.error('Failed to fetch listing');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.center}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>{listing.title}</Text>
        <Text variant="bodyLarge" style={styles.location}>{listing.location}</Text>
        <Text variant="bodyMedium" style={styles.description}>{listing.description}</Text>
        {listing.phone && (
          <Text variant="bodyMedium" style={styles.info}>Phone: {listing.phone}</Text>
        )}
        {listing.email && (
          <Text variant="bodyMedium" style={styles.info}>Email: {listing.email}</Text>
        )}
        {listing.website && (
          <Text variant="bodyMedium" style={styles.info}>Website: {listing.website}</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 10,
  },
  location: {
    color: '#666',
    marginBottom: 20,
  },
  description: {
    marginBottom: 20,
    lineHeight: 24,
  },
  info: {
    marginBottom: 10,
    color: '#333',
  },
});

export default ListingDetailScreen;
