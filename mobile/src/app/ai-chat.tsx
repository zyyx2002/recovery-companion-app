import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AIChatScreen from '../components/ai/AIChatScreen';

export default function AIChatPage() {
  return (
    <SafeAreaView style={styles.container}>
      <AIChatScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
