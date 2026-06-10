import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import * as addressesApi from '@/src/api/addresses';
import ErrorView from '@/src/components/ErrorView';
import { FormField } from '@/src/components/FormField';
import LoadingView from '@/src/components/LoadingView';
import { COLORS } from '@/src/constants/config';
import { useAuth } from '@/src/context/AuthContext';
import { Address } from '@/src/types';
import { getApiErrorMessage } from '@/src/utils/apiError';
import { userDisplayName } from '@/src/utils/format';

const schema = z.object({
  title: z.string().min(1, 'Başlık gereklidir'),
  city: z.string().min(1, 'Şehir gereklidir'),
  district: z.string().min(1, 'İlçe gereklidir'),
  fullAddress: z.string().min(1, 'Adres gereklidir'),
});

type FormData = z.infer<typeof schema>;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: 'Ev', city: '', district: '', fullAddress: '' },
  });

  const loadAddresses = useCallback(async () => {
    setError(null);
    try {
      const data = await addressesApi.getAddresses();
      setAddresses(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Adresler yüklenemedi'));
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadAddresses();
      setLoading(false);
    })();
  }, [loadAddresses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  }, [loadAddresses]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await addressesApi.createAddress(data);
      reset({ title: 'Ev', city: '', district: '', fullAddress: '' });
      setShowForm(false);
      await loadAddresses();
      Alert.alert('Başarılı', 'Adres eklendi.');
    } catch (err) {
      Alert.alert('Hata', getApiErrorMessage(err, 'Adres eklenemedi'));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = (address: Address) => {
    Alert.alert('Adresi Sil', `"${address.title}" adresini silmek istiyor musunuz?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await addressesApi.deleteAddress(address.id);
              await loadAddresses();
            } catch (err) {
              Alert.alert('Hata', getApiErrorMessage(err, 'Adres silinemedi'));
            }
          })();
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingView message="Profil yükleniyor..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
      }>
      <Text style={styles.pageTitle}>Profilim</Text>
      <Text style={styles.pageSubtitle}>Hesap bilgileriniz ve kayıtlı adresleriniz.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bilgilerim</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ad soyad</Text>
          <Text style={styles.infoValue}>{userDisplayName(user) || '—'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>E-posta</Text>
          <Text style={styles.infoValue}>{user?.email ?? '—'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Telefon</Text>
          <Text style={styles.infoValue}>{user?.phoneNumber ?? '—'}</Text>
        </View>
        <Pressable style={styles.logoutButton} onPress={() => void logout()}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kayıtlı adreslerim</Text>
        <Text style={styles.sectionHint}>Teslimat adresleriniz listelenir.</Text>

        {error && addresses.length === 0 ? (
          <ErrorView message={error} onRetry={() => void loadAddresses()} />
        ) : addresses.length === 0 ? (
          <Text style={styles.emptyText}>Henüz kayıtlı adres yok.</Text>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressContent}>
                <Text style={styles.addressTitle}>{address.title}</Text>
                <Text style={styles.addressLine}>{address.fullAddress}</Text>
                <Text style={styles.addressMeta}>
                  {[address.district, address.city].filter(Boolean).join(' / ')}
                </Text>
              </View>
              <Pressable onPress={() => onDelete(address)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Sil</Text>
              </Pressable>
            </View>
          ))
        )}

        <Pressable style={styles.addButton} onPress={() => setShowForm((v) => !v)}>
          <Text style={styles.addButtonText}>
            {showForm ? 'Formu Kapat' : '+ Yeni Adres Ekle'}
          </Text>
        </Pressable>

        {showForm ? (
          <View style={styles.form}>
            <FormField control={control} name="title" label="Adres adı" placeholder="Ev, İş..." />
            <FormField
              control={control}
              name="fullAddress"
              label="Açık adres"
              placeholder="Sokak, bina, daire..."
              multiline
            />
            <FormField control={control} name="district" label="İlçe" placeholder="Kadıköy" />
            <FormField control={control} name="city" label="Şehir" placeholder="İstanbul" />
            <Pressable
              style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Adresi Kaydet</Text>
              )}
            </Pressable>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
  },
  logoutButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addressContent: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  addressLine: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  addressMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  deleteText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 13,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  form: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
