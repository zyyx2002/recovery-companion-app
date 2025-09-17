import React from 'react';
import { View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScreenContainer({ children, backgroundColor }) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const bgColor = backgroundColor || (isDark ? '#121212' : '#fff');

  return (
    <View 
      style={{ 
        flex: 1, 
        backgroundColor: bgColor,
        paddingTop: insets.top 
      }}
    >
      {children}
    </View>
  );
}