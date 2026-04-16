import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { clearUser } from './session';


import { getAuth } from "firebase/auth";

export default function Dashboard() {

  
  const auth = getAuth();
  const user = auth.currentUser;

  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            clearUser();          
            router.replace('/');  
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      
      <View style={styles.grid}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/Budget')}
        >
          <View style={styles.cardContent}>
            <Image
              source={require('../assets/images/Budget.png')}
              style={styles.cardImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardText}>Budget</Text>
              <Text style={styles.cardSubText}>Set Budget for Income & Expense</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/Transaction')}
        >
          <View style={styles.cardContent}>
            <Image
              source={require('../assets/images/Transaction.png')}
              style={styles.cardImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardText}>Transaction</Text>
              <Text style={styles.cardSubText}>Add Income & Expense</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push('/Filter')}
       >
      <View style={styles.cardContent}>
      <Image
      source={require('../assets/images/Filter.png')} 
      style={styles.cardImage}
      />
       <View style={{ flex: 1 }}>
       <Text style={styles.cardText}>Filter</Text>
       <Text style={styles.cardSubText}>View transactions by period</Text>
       </View>
       </View>
      </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/Report')}
        >
          <View style={styles.cardContent}>
            <Image
              source={require('../assets/images/Report.png')}
              style={styles.cardImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardText}>Report</Text>
              <Text style={styles.cardSubText}>View Pie Charts & Summary</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/chatbot",
              params: { userId: user?.uid }   
            })
          }
        >
          <View style={styles.cardContent}>
            <Image
              source={require('../assets/images/Chatbot.png')}
              style={styles.cardImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardText}>Chatbot</Text>
              <Text style={styles.cardSubText}>Financial Assistant</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 10,
  },

  
  logoutButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#F44336',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginBottom: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },

  grid: {
    width: '100%',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 50,
    height: 50,
    marginRight: 15,
    resizeMode: 'contain',
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubText: {
    fontSize: 12,
    color: '#666',
  },
});