import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactions } from './context/TransactionContext';

export default function AddExpense() {
  const { transactions, addTransaction, updateTransaction } = useTransactions();
  const { id } = useLocalSearchParams();

  const editingTransaction = id ? transactions.find(t => t.id === id) : null;

  const [type, setType] = useState(editingTransaction?.title || '');
  const [currency, setCurrency] = useState(editingTransaction?.currency || '');
  const [amount, setAmount] = useState(
    editingTransaction ? editingTransaction.amount.toString() : ''
  );
  const [note, setNote] = useState(editingTransaction?.note || '');
  const [date, setDate] = useState(
    editingTransaction ? new Date(editingTransaction.date) : new Date()
  );
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

    if (note && !/^[A-Za-z\s]+$/.test(note)) {
      Alert.alert('Error', 'Note must contain text only');
      return;
    }

    // Duplicate validation 
    const isDuplicate = transactions.some(t =>
      t.type === 'expense' &&
      t.title.toLowerCase() === type.toLowerCase() &&
      t.currency === currency &&
      t.amount === parseFloat(amount) &&
      t.date === date.toDateString() &&
      (!editingTransaction || t.id !== editingTransaction.id)
    );

    if (isDuplicate) {
      Alert.alert('Duplicate Entry', 'This expense already exists.');
      return;
    }

    const newItem = {
      type: 'expense',
      title: type,
      currency,
      amount: parseFloat(amount),
      note,
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
        {editingTransaction ? 'Edit Expense' : 'Add Expense'}
      </Text>

      <Picker selectedValue={type} onValueChange={setType}>
        <Picker.Item label="Select Type" value="" />
        <Picker.Item label="Food" value="Food" />
        <Picker.Item label="Transport" value="Transport" />
        <Picker.Item label="Bills" value="Bills" />
        <Picker.Item label="Health" value="Health" />
        <Picker.Item label="Personal Care" value="Personal Care" />
        <Picker.Item label="Entertainment" value="Entertainment" />
        <Picker.Item label="Shopping" value="Shopping" />
        <Picker.Item label="Debt" value="Debt" />
        <Picker.Item label="Insurance" value="Insurance" />
        <Picker.Item label="Other Expense" value="Other Expense" />
      </Picker>

      <Picker selectedValue={currency} onValueChange={setCurrency}>
        <Picker.Item label="Select Currency" value="" />
        <Picker.Item label="LKR" value="LKR" />
      </Picker>

      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={(t) => {
          if (/^\d*\.?\d*$/.test(t)) setAmount(t);
        }}
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Note (text only)"
        value={note}
        onChangeText={setNote}
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
        <Text
          style={{
            backgroundColor: '#F44336',
            color: '#fff',
            padding: 12,
            textAlign: 'center',
          }}
        >
          Save
        </Text>
      </TouchableOpacity>
    </View>
  );
}