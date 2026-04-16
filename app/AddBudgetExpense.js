import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useBudgets } from './context/BudgetContext';
import { useTransactions } from './context/TransactionContext';

export default function AddBudgetExpense() {
  const { budgets, addBudget, updateBudget } = useBudgets();
  const { transactions } = useTransactions();
  const { id } = useLocalSearchParams();

  const editing = id ? budgets.find(b => b.id === id) : null;

  const [title, setTitle] = useState(editing?.title || '');
  const [currency, setCurrency] = useState(editing?.currency || 'LKR');
  const [maxAmount, setMaxAmount] = useState(editing ? String(editing.maxAmount) : '');
  const [frequency, setFrequency] = useState(editing?.frequency || '');

  const actualAmount = useMemo(() => {
    if (!title) return 0;

    let filtered = transactions.filter(t => t.type === 'expense' && t.title === title);
    const now = new Date();

    if (frequency === 'Weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(t => new Date(t.date) >= weekAgo);
    } else if (frequency === 'Monthly') {
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (frequency === 'Annually') {
      filtered = filtered.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
    }

    return filtered.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions, title, frequency]);

  const exceeded = maxAmount && actualAmount > parseFloat(maxAmount);

  const handleSave = () => {
    if (!title || !maxAmount || !frequency) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const newBudget = {
      type: 'expense',
      title,
      currency,
      amount: actualAmount,
      maxAmount: parseFloat(maxAmount),
      frequency,
    };

    if (editing) {
      updateBudget({ ...newBudget, id: editing.id });
    } else {
      addBudget(newBudget);
    }

    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>
        {editing ? 'Edit Expense Budget' : 'Add Expense Budget'}
      </Text>

      <Picker selectedValue={title} onValueChange={setTitle}>
        <Picker.Item label="Select Expense Type" value="" />
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

      <Text style={{ marginTop: 10 }}>
        Actual Expense ({frequency || 'Select Frequency'}): {currency} {actualAmount.toFixed(2)}
      </Text>

      {exceeded && (
        <Text style={{ color: 'red', marginTop: 5 }}>
          ⚠ Actual expense exceeds max budget!
        </Text>
      )}

      <TextInput
        placeholder="Enter Budget Expense"
        value={maxAmount}
        onChangeText={setMaxAmount}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          marginVertical: 10,
          borderRadius: 6,
        }}
      />

      <Picker selectedValue={frequency} onValueChange={setFrequency}>
        <Picker.Item label="Select Frequency" value="" />
        <Picker.Item label="Weekly" value="Weekly" />
        <Picker.Item label="Monthly" value="Monthly" />
        <Picker.Item label="Annually" value="Annually" />
      </Picker>

      <TouchableOpacity onPress={handleSave} style={{ marginTop: 20 }}>
        <Text style={{ backgroundColor: '#F44336', color: '#fff', padding: 12, textAlign: 'center' }}>
          Save
        </Text>
      </TouchableOpacity>
    </View>
  );
}