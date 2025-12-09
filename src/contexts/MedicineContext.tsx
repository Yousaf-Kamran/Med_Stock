"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import type { Medicine, ProcessedMedicine } from '@/types';
import { calculateCurrentStock, calculateEndDate } from '@/lib/medicine-utils';
import { useRouter, usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser && pathname !== '/login' && pathname !== '/signup') {
        router.push('/login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, pathname]);

  const fetchMedicines = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const medicinesCol = collection(db, 'medicines');
      const q = query(medicinesCol, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const userMedicines = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
      setMedicines(userMedicines);
    } catch (error) {
      console.error("Failed to load medicines from Firestore", error);
      // It's possible we get a permission error if the rules are not set up yet.
      // We'll ignore this for now to allow the app to load.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMedicines(user.uid);
    } else {
      // Clear medicines when user logs out
      setMedicines([]);
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
      // We fetch the original doc to keep createdAt and userId
      const originalMedicine = medicines.find(m => m.id === id);
      if (originalMedicine) {
        const fullUpdateData = {
          ...originalMedicine,
          ...updatedMedicineData,
        };
        await setDoc(medicineRef, fullUpdateData);
        setMedicines(prev => 
          prev.map(m => 
            m.id === id ? fullUpdateData : m
          )
        );
      }
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
