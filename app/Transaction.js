import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTransactions } from './context/TransactionContext';

export default function Transaction() {
  const { transactions, deleteTransaction } = useTransactions();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.sumText}>Income: {totalIncome.toFixed(2)}</Text>
        <Text style={styles.sumText}>Expense: {totalExpense.toFixed(2)}</Text>
        <Text style={styles.balance}>Balance: {balance.toFixed(2)}</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>{item.date}</Text>
              {item.note ? <Text style={styles.note}>Note: {item.note}</Text> : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.amount, { color: item.type === 'income' ? '#2E7D32' : '#C62828' }]}>
                {item.currency} {item.amount.toFixed(2)}
              </Text>

              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: item.type === 'income' ? '/AddIncome' : '/AddExpense',
                      params: { id: item.id },
                    })
                  }
                  style={{ marginRight: 10 }}
                >
                  <Text style={{ color: '#2196F3' }}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                  <Text style={{ color: '#F44336' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No transactions yet</Text>}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.incomeBtn} onPress={() => router.push('/AddIncome')}>
          <Text style={styles.btnText}>Add Income</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.expenseBtn} onPress={() => router.push('/AddExpense')}>
          <Text style={styles.btnText}>Add Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F7FA' },
  summary: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  sumText: { fontSize: 16 },
  balance: { fontSize: 18, fontWeight: '700', marginTop: 5 },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { fontWeight: '600' },
  date: { fontSize: 12, color: '#777' },
  note: { fontSize: 12, color: '#555', fontStyle: 'italic' },
  amount: { fontWeight: '700' },
  actions: { flexDirection: 'row', marginTop: 10 },
  incomeBtn: { flex: 1, backgroundColor: '#4CAF50', padding: 12, marginRight: 5, borderRadius: 8 },
  expenseBtn: { flex: 1, backgroundColor: '#F44336', padding: 12, marginLeft: 5, borderRadius: 8 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
