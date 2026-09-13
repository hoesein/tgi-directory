import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useListing } from '../api/useListings';

type RootStackParamList = {
  ListingDetail: { listingId: string };
};

type ListingDetailRouteProp = RouteProp<RootStackParamList, 'ListingDetail'>;

const ListingDetailScreen = () => {
  const route = useRoute<ListingDetailRouteProp>();
  const { listingId } = route.params;
  const { data: listing, isLoading, error } = useListing(listingId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !listing) {
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
