import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { getUser } from '../session';

const db = getFirestore(app);
const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let unsubscribe = null;
    let currentUserId = null;

    const interval = setInterval(() => {
      const userId = getUser();

      if (userId !== currentUserId) {
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }

        currentUserId = userId;
        setTransactions([]);

        if (userId) {
          unsubscribe = onSnapshot(
            collection(db, 'users', userId, 'transactions'),
            (snapshot) => {
              const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setTransactions(data);
            }
          );
        }
      }
    }, 300);

    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const addTransaction = async (transaction) => {
    const userId = getUser();
    if (!userId) return;

    await addDoc(
      collection(db, 'users', userId, 'transactions'),
      transaction
    );
  };

  const updateTransaction = async (updated) => {
    const userId = getUser();
    if (!userId) return;

    const ref = doc(db, 'users', userId, 'transactions', updated.id);
    await updateDoc(ref, updated);
  };

  const deleteTransaction = async (id) => {
    const userId = getUser();
    if (!userId) return;

    await deleteDoc(
      doc(db, 'users', userId, 'transactions', id)
    );
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);