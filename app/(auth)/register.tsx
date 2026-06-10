import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import { FormField } from '@/src/components/FormField';
import { COLORS } from '@/src/constants/config';
import { useAuth } from '@/src/context/AuthContext';
import { getApiErrorMessage } from '@/src/utils/apiError';

const schema = z.object({
  firstName: z.string().min(1, 'Ad gereklidir'),
  lastName: z.string().min(1, 'Soyad gereklidir'),
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);
    try {
      await register(data);
      router.replace('/(tabs)');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Kayıt başarısız'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Kayıt Ol</Text>
        <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>

        <FormField control={control} name="firstName" label="Ad" placeholder="Adınız" autoCapitalize="words" />
        <FormField control={control} name="lastName" label="Soyad" placeholder="Soyadınız" autoCapitalize="words" />
        <FormField control={control} name="email" label="E-posta" placeholder="ornek@email.com" keyboardType="email-address" autoCapitalize="none" />
        <FormField control={control} name="password" label="Şifre" placeholder="••••••" secureTextEntry autoCapitalize="none" />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.link}>Giriş Yap</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 28,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  link: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
