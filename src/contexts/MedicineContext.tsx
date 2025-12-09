"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import type { Medicine, ProcessedMedicine } from '@/types';
import { calculateCurrentStock, calculateEndDate } from '@/lib/medicine-utils';
import { useRouter } from 'next/navigation';

interface MedicineContextType {
  medicines: ProcessedMedicine[];
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'userId'>) => void;
  deleteMedicine: (id: string) => void;
  updateMedicine: (id: string, updatedMedicine: Omit<Medicine, 'id' | 'createdAt' | 'userId'>) => void;
  isLoading: boolean;
  user: User | null;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export const MedicineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        setMedicines([]);
        router.push('/login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchMedicines = useCallback(async (userId: string) => {
    try {
      const medicinesCol = collection(db, 'medicines');
      const q = query(medicinesCol, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const userMedicines = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
      setMedicines(userMedicines);
    } catch (error) {
      console.error("Failed to load medicines from Firestore", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchMedicines(user.uid);
    }
  }, [user, fetchMedicines]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const addMedicine = async (medicineData: Omit<Medicine, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    const newMedicine: Omit<Medicine, 'id'> = {
      ...medicineData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      const newDocRef = doc(collection(db, 'medicines'));
      await setDoc(newDocRef, newMedicine);
      setMedicines(prev => [...prev, { ...newMedicine, id: newDocRef.id }]);
    } catch (error) {
      console.error("Error adding medicine: ", error);
    }
  };

  const deleteMedicine = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'medicines', id));
      setMedicines(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error deleting medicine: ", error);
    }
  };
  
  const updateMedicine = async (id: string, updatedMedicineData: Omit<Medicine, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    try {
      const medicineRef = doc(db, 'medicines', id);
      await setDoc(medicineRef, updatedMedicineData, { merge: true });
      setMedicines(prev => 
        prev.map(m => 
          m.id === id ? { ...m, ...updatedMedicineData } : m
        )
      );
    } catch (error) {
      console.error("Error updating medicine: ", error);
    }
  };

  const processedMedicines = useMemo((): ProcessedMedicine[] => {
    return medicines.map(med => {
      const currentStock = calculateCurrentStock(med, now);
      const endDate = calculateEndDate(currentStock, med.dosages, now);
      return { ...med, currentStock, endDate };
    }).sort((a, b) => (a.endDate?.getTime() ?? Infinity) - (b.endDate?.getTime() ?? Infinity));
  }, [medicines, now]);

  return (
    <MedicineContext.Provider value={{ user, medicines: processedMedicines, addMedicine, deleteMedicine, updateMedicine, isLoading }}>
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicines = (): MedicineContextType => {
  const context = useContext(MedicineContext);
  if (context === undefined) {
    throw new Error('useMedicines must be used within a MedicineProvider');
  }
  return context;
};
