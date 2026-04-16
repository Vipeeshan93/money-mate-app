import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { getUser } from '../session';

const db = getFirestore(app);
const BudgetContext = createContext(null);

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);

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
        setBudgets([]);

        if (userId) {
          unsubscribe = onSnapshot(
            collection(db, 'users', userId, 'budgets'),
            (snapshot) => {
              const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setBudgets(data);
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

  const addBudget = async (budget) => {
    const userId = getUser();
    if (!userId) return;

    await addDoc(collection(db, 'users', userId, 'budgets'), budget);
  };

  const updateBudget = async (updated) => {
    const userId = getUser();
    if (!userId) return;

    const ref = doc(db, 'users', userId, 'budgets', updated.id);
    await updateDoc(ref, updated);
  };

  const deleteBudget = async (id) => {
    const userId = getUser();
    if (!userId) return;

    await deleteDoc(doc(db, 'users', userId, 'budgets', id));
  };

  return (
    <BudgetContext.Provider value={{ budgets, addBudget, updateBudget, deleteBudget }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => useContext(BudgetContext);