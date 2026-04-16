import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useBudgets } from './context/BudgetContext';
import { useTransactions } from './context/TransactionContext';


export default function Budget() {
  const router = useRouter();
  const { budgets, deleteBudget } = useBudgets();
  const { transactions } = useTransactions();

  
  const isInPeriod = (dateString, frequency) => {
    const tDate = new Date(dateString);
    const now = new Date();

    if (frequency === 'Weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0,0,0,0);
      return tDate >= startOfWeek;
    }

    if (frequency === 'Monthly') {
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    }

    if (frequency === 'Annually') {
      return tDate.getFullYear() === now.getFullYear();
    }

    return true;
  };

  const totalIncome = budgets
    .filter(b => b.type === 'income')
    .reduce((sum, b) => {
      const actual = transactions
        .filter(t => t.type === 'income' && t.title === b.title && isInPeriod(t.date, b.frequency))
        .reduce((s, t) => s + Number(t.amount || 0), 0);
      return sum + actual;
    }, 0);

  const totalExpense = budgets
    .filter(b => b.type === 'expense')
    .reduce((sum, b) => {
      const actual = transactions
        .filter(t => t.type === 'expense' && t.title === b.title && isInPeriod(t.date, b.frequency))
        .reduce((s, t) => s + Number(t.amount || 0), 0);
      return sum + actual;
    }, 0);

  const balance = totalIncome - totalExpense;

  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteBudget(id) },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const actualAmount = transactions
      .filter(t => t.type === item.type && t.title === item.title && isInPeriod(t.date, item.frequency))
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    // Only calculate usage if expense
    const exceeded = item.type === 'expense' && actualAmount > item.maxAmount;
    const percent = item.type === 'expense' && item.maxAmount > 0 
      ? ((actualAmount / item.maxAmount) * 100).toFixed(1)
      : null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.title} ({item.type})</Text>
        <Text>Actual: {item.currency} {actualAmount.toFixed(2)}</Text>
        <Text>Max: {item.currency} {item.maxAmount.toFixed(2)}</Text>
        <Text>Frequency: {item.frequency}</Text>

        {/* Only show usage and warning for expenses */}
        {item.type === 'expense' && (
          <>
            <Text>Usage: {percent}%</Text>
            {exceeded && <Text style={{ color: 'red', marginTop: 4 }}>⚠ Budget Exceeded!</Text>}
          </>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: item.type === 'income' ? '/AddBudgetIncome' : '/AddBudgetExpense',
                params: { id: item.id },
              })
            }
          >
            <Text style={{ color: '#2196F3' }}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => confirmDelete(item.id)}>
            <Text style={{ color: '#F44336' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Dashboard */}
      <View style={styles.dashboard}>
        <Text style={styles.dashboardText}>Total Income: {totalIncome.toFixed(2)}</Text>
        <Text style={styles.dashboardText}>Total Expense: {totalExpense.toFixed(2)}</Text>
        <Text style={styles.balanceText}>Balance: {balance.toFixed(2)}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/AddBudgetIncome')}>
          <Text style={styles.buttonText}>+ Income Budget</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/AddBudgetExpense')}>
          <Text style={styles.buttonText}>+ Expense Budget</Text>
        </TouchableOpacity>
      </View>

      {/* Budget List */}
      <FlatList
        data={budgets}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No budgets added yet
          </Text>
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  dashboard: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#f5f5f5' },
  dashboardText: { fontSize: 16, marginBottom: 4 },
  balanceText: { fontSize: 18, fontWeight: 'bold', marginTop: 6 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  button: { backgroundColor: '#4e8cff', padding: 10, borderRadius: 6, width: '48%', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  card: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10 },
  cardTitle: { fontWeight: 'bold', marginBottom: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});
