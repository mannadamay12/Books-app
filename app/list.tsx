import { View, StyleSheet, TouchableOpacity, Text, FlatList, ListRenderItem, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getBookByISBN } from '../api/books';
import * as book1 from '@/api/book1.json';
import * as book2 from '@/api/book2.json';
import { serverTimestamp, addDoc, collection, onSnapshot } from 'firebase/firestore';
import { FIRESTORE_DB } from '../config/FirebaseConfig';
import { Stack, useRouter } from 'expo-router';

const list = () => {
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const booksCollection = collection(FIRESTORE_DB, 'users', 'simon', 'books');

    onSnapshot(booksCollection, (snapshot) => {
      const books = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      setBooks(books);
    });
  }, []);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    const code = data;
    const bookData = await getBookByISBN(code);
    setShowScanner(false);
    if (!bookData.items) return;
    addBook(bookData.items[0]);
  };

  const addBook = async (book: any) => {
    // const book = book1.items[0];
    const newBook = {
      bookId: book.id,
      volumeInfo: book.volumeInfo,
      webReaderLink: book.accessInfo?.webReaderLink,
      textSnippet: book.searchInfo.textSnippet,
      favorite: false,
      created: serverTimestamp(),
    };
    const db = await addDoc(collection(FIRESTORE_DB, 'users', 'simon', 'books'), newBook);
    console.log('🚀 ~ file: list.tsx:40 ~ addBook ~ db:', db);
  };

  const renderItem: ListRenderItem<any> = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => router.push(`/(book)/${item.id}`)}>
        <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center', marginBottom: 20 }}>
          <Image source={{ uri: item.volumeInfo.imageLinks.thumbnail }} style={{ width: 50, height: 50 }} />
          <View>
            <Text>{item.volumeInfo.title}</Text>
            <Text>{item.volumeInfo.authors[0]}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => <TouchableOpacity onPress={() => setShowScanner(false)}>{showScanner ? <Text>Close</Text> : <></>}</TouchableOpacity>,
        }}
      />
      {showScanner && <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={{ width: '100%', height: '100%', elevation: 2, zIndex: 2 }} />}

      <FlatList data={books} renderItem={renderItem} keyExtractor={(item) => item.id} />

      {hasPermission && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowScanner(true)}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#03A9F4',
    borderRadius: 30,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
  },
});
export default list;
