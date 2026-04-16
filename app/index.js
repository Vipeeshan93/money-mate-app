import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { setUser } from './session';
import * as Crypto from 'expo-crypto';

const db = getFirestore(app);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateAndLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setError('');

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid email or password.');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      
      const hashedInputPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );

      if (hashedInputPassword !== userData.password) {
        setError('Invalid email or password.');
        return;
      }

      setUser(userDoc.id);
      router.push('/dashboard');

    } catch (err) {
      console.log(err);
      setError('Failed to login.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F5F7FA' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>

        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Image source={require('../assets/images/moneymate.jpg')} style={{ width: 140, height: 140, resizeMode: 'contain' }} />
          <Text style={{ fontSize: 26, marginTop: 10, fontWeight: '600' }}>MoneyMate</Text>
        </View>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={{ borderWidth: 1, borderColor: '#999', marginBottom: 12, padding: 12, borderRadius: 8, backgroundColor: '#fff' }}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ borderWidth: 1, borderColor: '#999', marginBottom: 10, padding: 12, borderRadius: 8, backgroundColor: '#fff' }}
        />

        {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}

        <TouchableOpacity onPress={validateAndLogin} style={{ backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 }}>
          <Text style={{ color: 'white', fontSize: 16 }}>Login</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={{ color: '#2196F3' }}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/forget')}>
            <Text style={{ color: '#2196F3' }}>Change Password</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}