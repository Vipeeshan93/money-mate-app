import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useTransactions } from './context/TransactionContext';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Filter() {

  const { transactions } = useTransactions();

  const [type, setType] = useState('income');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [result, setResult] = useState([]);
  const [total, setTotal] = useState(0);

  
  const handleFilter = () => {

    
    if (fromDate > toDate) {
      alert("From date cannot be later than To date");
      return;
    }

    const filtered = transactions.filter(t => {

      if (!t.date) return false;

      let d;

      if (typeof t.date === "object" && t.date.seconds) {
        d = new Date(t.date.seconds * 1000);
      } else {
        d = new Date(t.date);
      }

      
      const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
      const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

      return (
        t.type === type &&
        dDate >= from &&
        dDate <= to
      );
    });

    
    const grouped = {};

    filtered.forEach(t => {
      if (!grouped[t.title]) {
        grouped[t.title] = 0;
      }
      grouped[t.title] += t.amount;
    });

    
    const groupedList = Object.keys(grouped).map(key => ({
      title: key,
      amount: grouped[key]
    }));

    //  TOTAL
    const totalAmount = groupedList.reduce((s, t) => s + t.amount, 0);

    setResult(groupedList);
    setTotal(totalAmount);
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Advanced Filter</Text>

      {/* TYPE SELECT */}
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setType('income')} style={styles.btn}>
          <Text>💰 Income</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setType('expense')} style={styles.btn}>
          <Text>🧾 Expense</Text>
        </TouchableOpacity>
      </View>

      {/* DATE PICKERS */}
      <TouchableOpacity onPress={() => setShowFrom(true)} style={styles.dateBtn}>
        <Text>From: {fromDate.toDateString()}</Text>
      </TouchableOpacity>

      {showFrom && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          onChange={(e, date) => {
            setShowFrom(false);

            
            if (date && date > toDate) {
              alert("From date cannot be later than To date");
              return;
            }

            if (date) setFromDate(date);
          }}
        />
      )}

      <TouchableOpacity onPress={() => setShowTo(true)} style={styles.dateBtn}>
        <Text>To: {toDate.toDateString()}</Text>
      </TouchableOpacity>

      {showTo && (
        <DateTimePicker
          value={toDate}
          mode="date"
          onChange={(e, date) => {
            setShowTo(false);

            
            if (date && date < fromDate) {
              alert("To date cannot be earlier than From date");
              return;
            }

            if (date) setToDate(date);
          }}
        />
      )}

      {/* SUBMIT */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleFilter}>
        <Text style={{ color: '#fff' }}>Apply Filter</Text>
      </TouchableOpacity>

      {/* RESULT */}
      <View style={styles.summary}>
        <Text style={styles.total}>
          {type === 'income' ? 'Total Income' : 'Total Expense'}: {total.toFixed(2)}
        </Text>
      </View>

      <FlatList
        data={result}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.title}</Text>
            <Text>{item.amount.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No data</Text>}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 15 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },

  btn: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 8
  },

  dateBtn: {
    backgroundColor: '#eee',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8
  },

  submitBtn: {
    backgroundColor: '#4CAF50',
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },

  summary: {
    marginVertical: 10
  },

  total: {
    fontSize: 18,
    fontWeight: '700'
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1
  }
});