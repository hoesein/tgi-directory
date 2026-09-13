import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';

const ProfileScreen = () => {
  const { signOut } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Profile</Text>
      <Button mode="outlined" onPress={signOut} style={styles.button}>
        Sign Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default ProfileScreen;
