import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/constants/config';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorView({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Tekrar Dene</Text>
        </Pressable>
      ) : null}
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
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
