import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useListing } from '../api/useListings';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  ListingDetail: { listingId: string };
};

type ListingDetailRouteProp = RouteProp<RootStackParamList, 'ListingDetail'>;

const { width } = Dimensions.get('window');

const ListingDetailScreen = () => {
  const route = useRoute<ListingDetailRouteProp>();
  const navigation = useNavigation();
  const { listingId } = route.params;
  const { data: listingData, isLoading } = useListing(listingId);

  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'reviews'

  // MOCK DATA for when backend is not running
  const mockListings = [
    {
      id: '1',
      title: 'Royal Restaurant',
      location: 'Ferry Road, Maidenhead',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      description: 'Its picture-book riverbank location may look and feel as English as The Wind in the Willows, but everything else at The Waterside Inn...'
    },
    {
      id: '2',
      title: 'The Garden Cafe',
      location: 'High Street, London',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
      description: 'A beautiful cafe in the heart of London with amazing pastries.'
    },
    {
      id: '3',
      title: 'Spice Kitchen',
      location: 'Main Road, Rickmansworth',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
      description: 'Authentic spices and great Indian cuisine for everyone.'
    },
  ];

  const listing = listingData || mockListings.find(l => l.id === listingId) || mockListings[0];

  const mockImage = listing?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop';
  const distance = '1.5 KM';
  const rating = '4.5';
  const discount = 'Get 10% Discount';
  const fullAddress = listing?.location || 'Ferry Road, Berkshire, SL6 2AT';
  
  if (isLoading && !listingData) {
    // Only show loading if we really have no data and no mock fallback (which we do, so it's practically bypassed)
  }

  if (!listing) {
    return (
      <View style={styles.center}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Top Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: mockImage }} style={styles.image} resizeMode="cover" />
          
          <SafeAreaView style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
          
          {/* Simple Image Dots indicator mock */}
          <View style={styles.imageDots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Content Card overlapping image */}
        <View style={styles.contentCard}>
          <View style={styles.titleRow}>
            <Text variant="headlineSmall" style={styles.title}>{listing.title}</Text>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          </View>
          
          <Text style={styles.subtitle}>{listing.location}</Text>
          
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFB800" />
            <Text style={styles.ratingText}>{rating}</Text>
            
            <View style={styles.discountBadge}>
              <Ionicons name="pricetag" size={14} color="#FF9500" style={styles.discountIcon} />
              <Text style={styles.discountText}>{discount}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Map Location Section */}
          <View style={styles.mapSection}>
            <View style={styles.mapThumbnailPlaceholder}>
              <Ionicons name="map-outline" size={24} color="#ccc" />
            </View>
            <View style={styles.mapInfo}>
              <Text style={styles.mapAddress} numberOfLines={2}>{fullAddress}</Text>
              <TouchableOpacity style={styles.openMapBtn}>
                <Ionicons name="location" size={16} color="#3b5998" />
                <Text style={styles.openMapText}>Open on Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity 
              style={styles.tab} 
              onPress={() => setActiveTab('about')}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
                About Restaurant
              </Text>
              {activeTab === 'about' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tab} 
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                Reviews
              </Text>
              {activeTab === 'reviews' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'about' ? (
              <Text style={styles.description}>
                {listing.description || 'Its picture-book riverbank location may look and feel as English as The Wind in the Willows, but everything else at The Waterside Inn...'}
                <Text style={styles.readMore}> Read More</Text>
              </Text>
            ) : (
              <Text style={styles.description}>No reviews yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.callButton}>
          <Text style={styles.callButtonText}>Call for More Information</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageDots: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#FF9500',
    width: 16,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 24,
    paddingBottom: 100, // padding for the sticky bottom button
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 10,
  },
  distanceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
    marginRight: 16,
    color: '#333',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountIcon: {
    marginRight: 4,
  },
  discountText: {
    color: '#666',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  mapSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapThumbnailPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mapInfo: {
    flex: 1,
  },
  mapAddress: {
    color: '#666',
    fontSize: 13,
    marginBottom: 4,
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openMapText: {
    color: '#3b5998',
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    marginRight: 24,
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#333',
  },
  activeTabIndicator: {
    height: 3,
    backgroundColor: '#FF9500',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 1.5,
  },
  tabContent: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  readMore: {
    color: '#FF9500',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32, // extra padding for bottom area
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  callButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListingDetailScreen;
