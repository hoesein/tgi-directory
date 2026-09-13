import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ImageSlider from '../components/ImageSlider';
import CategoriesList from '../components/CategoriesList';
import NearestListings from '../components/NearestListings';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ListingDetail: { listingId: string };
};

type HomeScreenProp = NativeStackNavigationProp<RootStackParamList, 'ListingDetail'>;

interface HomeScreenProps {
  navigation: HomeScreenProp;
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewAllCategories = () => {
    console.log('View all categories');
  };

  const handleViewAllNearest = () => {
    console.log('View all nearest');
  };

  const handleListingPress = (id: string) => {
    navigation.navigate('ListingDetail', { listingId: id });
  };

  const handleSearchSubmit = () => {
    console.log('Search:', searchQuery);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.topRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#999" />
              <TextInput
                placeholder="Search..."
                placeholderTextColor="#999"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => console.log('Notification pressed')}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={22} color="#333" />
            </TouchableOpacity>
          </View>
          <ImageSlider />
        </View>
        <CategoriesList onViewAll={handleViewAllCategories} />
        <NearestListings onViewAll={handleViewAllNearest} onListingPress={handleListingPress} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
  },
  notificationBtn: {
    marginLeft: 12,
    padding: 8,
  },
});

export default HomeScreen;
