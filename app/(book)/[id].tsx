import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useGlobalSearchParams, useNavigation } from 'expo-router';
import { getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../config/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const BookPage = () => {
  const { id } = useGlobalSearchParams();
  const [book, setBook] = useState<any>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (!book) return;
    const favorite = book.favorite;

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [book]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const fbDoc = await getDoc(doc(FIRESTORE_DB, `users/simon/books/${id}`));
      if (!fbDoc.exists()) return;
      const data = await fbDoc.data();
      setBook(data);
    };
    load();
  }, [id]);

  const toggleFavorite = () => {
    const isFavorite = book.favorite;
    const fbDoc = doc(FIRESTORE_DB, `users/simon/books/${id}`);
    updateDoc(fbDoc, { favorite: !isFavorite });
    setBook({ ...book, favorite: !isFavorite });
  };

  const removeBook = () => {
    const fbDoc = doc(FIRESTORE_DB, `users/simon/books/${id}`);
    deleteDoc(fbDoc);
    navigation.goBack();
  };

  return (
    <ScrollView>
      <Stack.Screen options={{ headerTitle: book ? `${book.volumeInfo.title}` : '...' }} />

      <View style={styles.card}>
        {book && (
          <>
            <Image style={styles.image} source={{ uri: book.volumeInfo.imageLinks.thumbnail }} />
            <Text style={styles.title}>{book.volumeInfo.title}</Text>
            <Text>{book.volumeInfo.description}</Text>
            <Button title="Remove" onPress={removeBook} color={'red'} />
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 20,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 4,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
  },
});

export default BookPage;
