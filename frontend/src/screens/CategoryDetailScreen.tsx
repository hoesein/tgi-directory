import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryListItem from '../components/CategoryListItem';
import { useCategory } from '../api/useCategories';
import { useListings } from '../api/useListings';

type RootStackParamList = {
  CategoryDetail: { categoryId: string };
  ListingDetail: { listingId: string };
};

type CategoryDetailScreenRouteProp = RouteProp<RootStackParamList, 'CategoryDetail'>;
type CategoryDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryDetail'>;

const MOCK_LISTINGS = [
  { id: '1', title: 'Grand Hotel Deluxe', location: 'Downtown', rating: 4.8, reviews: 124, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop', categoryId: 'hotel-1' },
  { id: '2', title: 'Cozy Guest House', location: 'Riverside', rating: 4.5, reviews: 89, image: 'https://images.unsplash.com/photo-1551882547-b79c417635b0?w=400&h=400&fit=crop', categoryId: 'guest-1' },
  { id: '3', title: 'Sunrise Cafe', location: 'Market St', rating: 4.7, reviews: 210, image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=400&fit=crop', categoryId: 'cafe-1' },
  { id: '4', title: 'Downtown Bar', location: 'Main Ave', rating: 4.6, reviews: 156, image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=400&fit=crop', categoryId: 'bar-1' },
];

const CategoryDetailScreen = () => {
  const route = useRoute<CategoryDetailScreenRouteProp>();
  const navigation = useNavigation<CategoryDetailScreenNavigationProp>();
  const categoryId = route.params?.categoryId ?? '';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeId, setActiveTypeId] = useState<string | null>(null);

  const { data: categoryData, isLoading: catLoading } = useCategory(categoryId);
  // fetch listings under this category tree (backend expands descendants)
  const { data: listingsData } = useListings({ category_id: (activeTypeId ?? categoryId) || undefined });

  // searchable types = children + grandchildren (level 1 and 2 under main)
  const typeOptions = useMemo(() => {
    if (!categoryData) return [];
    const children = (categoryData as { children?: { id: string; name: string; icon?: string | null; children?: { id: string; name: string }[] }[] }).children ?? [];
    const leaves: { id: string; name: string }[] = [];
    children.forEach((c) => {
      leaves.push({ id: c.id, name: c.name });
      (c.children ?? []).forEach((g) => leaves.push({ id: g.id, name: g.name }));
    });
    // also if the category itself is level 0, show its direct children as filters
    return leaves.length ? leaves : children.map((c) => ({ id: c.id, name: c.name }));
  }, [categoryData]);

  const displayListings = useMemo(() => {
    const base = (listingsData as typeof MOCK_LISTINGS | undefined) ?? MOCK_LISTINGS;
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter((l) => l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q));
  }, [listingsData, searchQuery]);

  const title = (categoryData as { name?: string } | undefined)?.name ?? 'Category';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          placeholder="Search by type..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {catLoading ? (
        <ActivityIndicator style={{ paddingTop: 20 }} color="#FF6B35" />
      ) : typeOptions.length > 0 ? (
        <View style={styles.typeScrollContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScrollContent}>
            <TouchableOpacity
              style={[styles.typeChip, activeTypeId === null && styles.typeChipSelected]}
              onPress={() => setActiveTypeId(null)}
            >
              <Text style={[styles.typeChipText, activeTypeId === null && styles.typeChipTextSelected]}>All</Text>
            </TouchableOpacity>
            {typeOptions.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeChip, activeTypeId === t.id && styles.typeChipSelected]}
                onPress={() => setActiveTypeId(t.id)}
              >
                <Text style={[styles.typeChipText, activeTypeId === t.id && styles.typeChipTextSelected]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

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
        ListEmptyComponent={<Text style={styles.emptyText}>No listings found.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
  },
  backButton: { padding: 4 },
  headerTitle: { fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 16, marginTop: 12, borderRadius: 10, paddingHorizontal: 12, height: 44,
    borderWidth: 1, borderColor: '#eee',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333', paddingVertical: 0 },
  typeScrollContainer: { backgroundColor: '#fff', paddingVertical: 12, marginTop: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  typeScrollContent: { paddingHorizontal: 16, gap: 8 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f0f0f0', borderRadius: 20 },
  typeChipSelected: { backgroundColor: '#FF6B35' },
  typeChipText: { color: '#666', fontWeight: '500' },
  typeChipTextSelected: { color: '#fff' },
  listContent: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 32 },
});

export default CategoryDetailScreen;
