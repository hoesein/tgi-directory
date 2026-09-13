import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    icon: string;
  };
  onPress?: () => void;
}

const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={28} color="#FF6B35" />
      </View>
      <Text variant="bodySmall" style={styles.label} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    textAlign: 'center',
    color: '#333',
  },
});

export default CategoryCard;
