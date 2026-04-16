import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { collection, addDoc, serverTimestamp, getFirestore } from "firebase/firestore";
import { app } from '../firebaseConfig';
import * as Crypto from 'expo-crypto';

const db = getFirestore(app);

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');

  const securityQuestion = "What is your favourite color?";

  const handleSignUp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName || !lastName || !contact || !email || !password || !securityAnswer) {
      setError('All fields are required.');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setError('');

      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );

      const hashedAnswer = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        securityAnswer.toLowerCase()
      );

      await addDoc(collection(db, 'users'), {
        firstName,
        lastName,
        contact,
        email,
        password: hashedPassword,
        securityQuestion,
        securityAnswer: hashedAnswer,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'User registered successfully!');
      router.push('/');

    } catch (err) {
      console.log(err);
      setError('Failed to register.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F5F7FA' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        <Text style={{ fontSize: 26, fontWeight: '600', marginBottom: 20, textAlign: 'center' }}>Sign Up</Text>

        <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} style={{ borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12 }} />
        <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} style={{ borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12 }} />
        <TextInput placeholder="Contact Number" value={contact} onChangeText={setContact} style={{ borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12 }} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12 }} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12 }} />

        <Text style={{ marginBottom: 5 }}>{securityQuestion}</Text>
        <TextInput placeholder="Enter Answer" value={securityAnswer} onChangeText={setSecurityAnswer} secureTextEntry autoCapitalize="none" style={{ borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12 }} />

        {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}

        <TouchableOpacity onPress={handleSignUp} style={{ backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 16 }}>Sign Up</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}