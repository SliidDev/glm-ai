import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/common/Button';

// expo-router renders this for any URL that doesn't match a route —
// mainly reachable via a stale deep link, not normal in-app navigation.
export default function NotFoundRoute() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page not found</Text>
      <Button label="Go home" onPress={() => router.replace('/home')} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0F',
    padding: 24,
    gap: 16,
  },
  title: {
    color: '#F3F2F8',
    fontSize: 17,
    fontWeight: '600',
  },
  button: {
    minWidth: 140,
  },
});
