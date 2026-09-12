import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome to Directory</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Listings')}
        style={styles.button}
      >
        View Listings
      </Button>
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
  button: {
    marginTop: 15,
    width: '100%',
  },
});

export default HomeScreen;
