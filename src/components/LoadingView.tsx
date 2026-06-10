import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/constants/config';

interface Props {
  message?: string;
}

export default function LoadingView({ message = 'Yükleniyor...' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});
