import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import * as Crypto from 'expo-crypto'; 

const db = getFirestore(app);

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState(''); 
  const [securityQuestion, setSecurityQuestion] = useState(''); 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userDocId, setUserDocId] = useState(null);

  const handleReset = async () => {

    if (loading) return;
    setLoading(true);

    console.log("🚀 Reset process started");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      setLoading(false);
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));

      
      let currentUser = userData;
      let currentDocId = userDocId;

      
      if (!currentUser) {

        console.log("⏳ Fetching user from Firestore...");
        const startFetch = Date.now();

        const querySnapshot = await getDocs(q);

        console.log("✅ Fetch complete in", Date.now() - startFetch, "ms");

        if (querySnapshot.empty) {
          Alert.alert('Error', 'Email not found. Please sign up first.');
          setLoading(false);
          return;
        }

        const userDocSnap = querySnapshot.docs[0];
        currentUser = userDocSnap.data();
        currentDocId = userDocSnap.id;

       
        setUserData(currentUser);
        setUserDocId(currentDocId);

        
        if (!securityQuestion) {
          setSecurityQuestion(currentUser.securityQuestion);
          setLoading(false);
          return;
        }
      }

      

      console.log("⏳ Hashing security answer...");
      const startHash1 = Date.now();

      const hashedAnswer = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        securityAnswer.toLowerCase()
      );

      console.log("✅ Hashing answer took", Date.now() - startHash1, "ms");

      if (hashedAnswer !== currentUser.securityAnswer) {
        Alert.alert('Error', 'Security answer is incorrect');
        setLoading(false);
        return;
      }

      if (!newPassword || !confirmPassword) {
        Alert.alert('Error', 'Please fill all fields');
        setLoading(false);
        return;
      }

      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        setLoading(false);
        return;
      }

      if (!passwordRegex.test(newPassword)) {
        Alert.alert('Error', 'Password must be 8-12 characters and include at least 1 uppercase letter and 1 special character');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        setLoading(false);
        return;
      }

      console.log("⏳ Hashing new password...");
      const startHash2 = Date.now();

      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        newPassword
      );

      console.log(" Password hash took", Date.now() - startHash2, "ms");

      console.log("⏳ Updating Firestore...");
      const startUpdate = Date.now();

      const userDoc = doc(db, 'users', currentDocId);
      await updateDoc(userDoc, { password: hashedPassword });

      console.log(" Update completed in", Date.now() - startUpdate, "ms");

      Alert.alert('Success', 'Password reset successfully!', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);

    } catch (err) {
      console.log("❌ ERROR:", err);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
      console.log("🏁 Process finished");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F5F7FA' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 26, fontWeight: '600', marginBottom: 20, textAlign: 'center'}}>Reset Password</Text>

        <TextInput 
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none" 
          style={{ borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12 }} 
        />

        {securityQuestion !== '' && (
          <>
            <Text style={{ marginBottom: 5 }}>{securityQuestion}</Text>

            <TextInput 
              placeholder="Enter Security Answer" 
              value={securityAnswer} 
              onChangeText={setSecurityAnswer} 
              secureTextEntry
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12 }} 
            />

            <TextInput 
              placeholder="New Password" 
              value={newPassword} 
              onChangeText={(text) => setNewPassword(text.slice(0,12))} 
              secureTextEntry 
              style={{ borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12 }} 
            />

            <TextInput 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChangeText={(text) => setConfirmPassword(text.slice(0,12))} 
              secureTextEntry 
              style={{ borderWidth: 1, borderColor: '#999', padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 20 }} 
            />
          </>
        )}

        <TouchableOpacity 
          onPress={handleReset} 
          disabled={loading}
          style={{ backgroundColor: loading ? '#999' : '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16 }}>Reset</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}