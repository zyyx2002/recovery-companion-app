import React from 'react';
import { View, Text, useColorScheme } from 'react-native';

export default function SectionHeader({ title, subtitle, uppercase = false }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            color: isDark ? '#fff' : '#000',
            textTransform: uppercase ? 'uppercase' : 'none',
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              color: isDark ? '#8F8F8F' : '#9E9E9E',
              marginLeft: 8,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}