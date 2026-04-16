import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useMemo } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { PieChart } from 'react-native-chart-kit';
import { useTransactions } from './context/TransactionContext';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function Report() {
  const { transactions } = useTransactions();

  const [type, setType] = useState('');
  const [frequency, setFrequency] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

 
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(t => t.type === type);
    const now = date;

    if (frequency === 'Weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      filtered = filtered.filter(t => new Date(t.date) >= startOfWeek);
    } 
    else if (frequency === 'Monthly') {
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } 
    else if (frequency === 'Annually') {
      filtered = filtered.filter(
        t => new Date(t.date).getFullYear() === now.getFullYear()
      );
    }

    return filtered;
  }, [transactions, type, frequency, date]);

  
  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );

  
  const pieData = useMemo(() => {
    const grouped = {};

    filteredTransactions.forEach(t => {
      grouped[t.title] = (grouped[t.title] || 0) + Number(t.amount || 0);
    });

    const colors = [
      '#4CAF50', '#F44336', '#FFC107', '#2196F3',
      '#9C27B0', '#FF5722', '#03A9F4', '#8BC34A',
      '#FF9800', '#E91E63'
    ];

    return Object.keys(grouped).map((key, index) => {
      const amount = grouped[key];
      const percentage =
        totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;

      return {
        name: `${key}`, 
        amount: amount,
        color: colors[index % colors.length],
        legendFontColor: '#333',
        legendFontSize: 10,
      };
    });
  }, [filteredTransactions, totalAmount]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction Report</Text>

      {/* TYPE */}
      <Picker selectedValue={type} onValueChange={setType} style={styles.picker}>
        <Picker.Item label="Select Type" value="" />
        <Picker.Item label="Income" value="income" />
        <Picker.Item label="Expense" value="expense" />
      </Picker>

      {/* FREQUENCY */}
      <Picker selectedValue={frequency} onValueChange={setFrequency} style={styles.picker}>
        <Picker.Item label="Select Frequency" value="" />
        <Picker.Item label="Weekly" value="Weekly" />
        <Picker.Item label="Monthly" value="Monthly" />
        <Picker.Item label="Annually" value="Annually" />
      </Picker>

      {/* DATE PICKER */}
      <TouchableOpacity onPress={() => setShowDate(true)} style={styles.datePicker}>
        <Text>Select Date: {date.toDateString()}</Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(e, d) => {
            setShowDate(false);
            if (d) setDate(d);
          }}
        />
      )}

      {/* TOTAL */}
      {type !== '' && (
        <Text style={styles.total}>
          Total {type === 'income' ? 'Income' : 'Expense'}: {totalAmount.toFixed(2)}
        </Text>
      )}

      {/* PIE CHART */}
      {pieData.length > 0 ? (
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={240}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: () => '#000',
            labelColor: () => '#000',
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          hasLegend={true}
          absolute={false}   
        />
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          No transactions for this period
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  picker: { marginBottom: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 6 },
  datePicker: { padding: 10, backgroundColor: '#f5f5f5', borderRadius: 6, marginBottom: 10 },
  total: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
});