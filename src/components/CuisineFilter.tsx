import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Senin kendi API dosyanı projeye dahil ediyoruz
import * as restaurantsApi from '@/src/api/restaurants';

interface Props {
    selectedCuisine: string | null;
    onSelectCuisine: (cuisine: string | null) => void;
}

export default function CuisineFilter({ selectedCuisine, onSelectCuisine }: Props) {
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Mutfak türlerini kendi güvenli API'n üzerinden çekiyoruz
    useEffect(() => {
        const fetchCuisines = async () => {
            try {
                // Ham fetch yerine, senin projenin API fonksiyonunu çağırıyoruz
                // Bu sayede token ve auth işlemleri arka planda otomatik hallediliyor
                const data = await restaurantsApi.getCuisines();

                if (data && data.length > 0) {
                    setCuisines(data);
                } else {
                    setCuisines([]);
                }

            } catch (error) {
                console.error("Mutfak türleri yetki veya sunucu hatası:", error);
                setCuisines([]); // Hata durumunda listeyi boş bırak, çökmeyi engelle
            } finally {
                setIsLoading(false);
            }
        };

        fetchCuisines();
    }, []);

    const handleSelect = (item: string) => {
        onSelectCuisine(selectedCuisine === item ? null : item);
    };

    if (isLoading) {
        return <ActivityIndicator size="small" color="#ff6b6b" style={{ marginVertical: 15 }} />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={cuisines}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const isSelected = selectedCuisine === item;
                    return (
                        <TouchableOpacity
                            style={[styles.chip, isSelected && styles.selectedChip]}
                            onPress={() => handleSelect(item)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.text, isSelected && styles.selectedText]}>{item}</Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        backgroundColor: '#ffffff',
    },
    listContent: {
        paddingHorizontal: 15,
        gap: 10,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#f1f3f5',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginRight: 10,
    },
    selectedChip: {
        backgroundColor: '#ff6b6b',
        borderColor: '#ff6b6b',
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
    },
    selectedText: {
        color: '#ffffff',
    }
});