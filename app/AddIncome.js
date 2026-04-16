import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactions } from './context/TransactionContext';

export default function AddIncome() {
  const { transactions, addTransaction, updateTransaction } = useTransactions();
  const { id } = useLocalSearchParams();

  const editingTransaction = id ? transactions.find(t => t.id === id) : null;

  const [type, setType] = useState(editingTransaction?.title || '');
  const [currency, setCurrency] = useState(editingTransaction?.currency || '');
  const [amount, setAmount] = useState(editingTransaction ? editingTransaction.amount.toString() : '');
  const [date, setDate] = useState(editingTransaction ? new Date(editingTransaction.date) : new Date());
  const [showDate, setShowDate] = useState(false);

  const handleSave = () => {
    if (!type || !currency || !amount) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (!/^\d*\.?\d*$/.test(amount)) {
      Alert.alert('Error', 'Amount must be a number');
      return;
    }

    //  Duplicate validation 
    const isDuplicate = transactions.some(t =>
      t.type === 'income' &&
      t.title.toLowerCase() === type.toLowerCase() &&
      t.currency === currency &&
      t.amount === parseFloat(amount) &&
      t.date === date.toDateString() &&
      (!editingTransaction || t.id !== editingTransaction.id)
    );

    if (isDuplicate) {
      Alert.alert('Duplicate Entry', 'This income already exists.');
      return;
    }

    const newItem = {
      type: 'income',
      title: type,
      currency,
      amount: parseFloat(amount),
      date: date.toDateString(),
    };

    if (editingTransaction) {
      updateTransaction({ ...newItem, id: editingTransaction.id });
    } else {
      addTransaction(newItem);
    }

    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>
        {editingTransaction ? 'Edit Income' : 'Add Income'}
      </Text>

      <Picker selectedValue={type} onValueChange={setType}>
        <Picker.Item label="Select Type" value="" />
        <Picker.Item label="Salary" value="Salary" />
        <Picker.Item label="Sales Income" value="Sales Income" />
        <Picker.Item label="Interest Income" value="Interest Income" />
        <Picker.Item label="Investment Income" value="Investment Income" />
        <Picker.Item label="Other Income" value="Other Income" />
      </Picker>

      <Picker selectedValue={currency} onValueChange={setCurrency}>
        <Picker.Item label="Select Currency" value="" />
        <Picker.Item label="LKR" value="LKR" />
      </Picker>

      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={(t) => { if (/^\d*\.?\d*$/.test(t)) setAmount(t); }}
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 15 }}
      />

      <TouchableOpacity onPress={() => setShowDate(true)}>
        <Text>Select Date: {date.toDateString()}</Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(e, d) => {
            setShowDate(false);
            if (d) setDate(d);
          }}
        />
      )}

      <TouchableOpacity onPress={handleSave} style={{ marginTop: 20 }}>
        <Text style={{ backgroundColor: '#4CAF50', color: '#fff', padding: 12, textAlign: 'center' }}>
          Save
        </Text>
      </TouchableOpacity>
    </View>
  );
}