import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  onSearch: () => void;
  onNotification: () => void;
}

const Header = ({ onSearch, onNotification }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Home</Text>
      <View style={styles.icons}>
        <TouchableOpacity style={styles.iconButton} onPress={onSearch}>
          <Ionicons name="search-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onNotification}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    color: '#333',
  },
  icons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
});

export default Header;
