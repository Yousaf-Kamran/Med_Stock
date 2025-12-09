"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth, getFirebaseDb } from '@/firebase/config'; // Use the new getter functions
import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
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
  isAuthLoading: boolean;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export const MedicineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!isAuthLoading) {
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      if (!user && !isAuthPage) {
        router.push('/login');
      } else if (user && isAuthPage) {
        router.push('/');
      }
    }
  }, [user, isAuthLoading, router, pathname]);
  
  const fetchMedicines = useCallback(async (userId: string) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const db = getFirebaseDb();
      const medicinesCol = collection(db, 'medicines');
      const q = query(medicinesCol, where("userId", "==", userId));
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
      fetchMedicines(user.uid);
    } else if (!isAuthLoading) {
      setMedicines([]);
      setIsLoading(false);
    }
  }, [user, isAuthLoading, fetchMedicines]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const addMedicine = async (medicineData: Omit<Medicine, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) {
      console.error("No user logged in to add medicine");
      return;
    }
    const newMedicine: Omit<Medicine, 'id'> = {
      ...medicineData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      const db = getFirebaseDb();
      const newDocRef = doc(collection(db, 'medicines'));
      await setDoc(newDocRef, newMedicine);
      setMedicines(prev => [...prev, { ...newMedicine, id: newDocRef.id }]);
    } catch (error) {
      console.error("Error adding medicine: ", error);
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'medicines', id));
      setMedicines(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error deleting medicine: ", error);
    }
  };
  
  const updateMedicine = async (id: string, updatedMedicineData: Omit<Medicine, 'id' | 'createdAt' | 'userId'>) => {
     if (!user) {
      console.error("No user logged in to update medicine");
      return;
    }
    try {
      const db = getFirebaseDb();
      const medicineRef = doc(db, 'medicines', id);
      const originalMedicine = medicines.find(m => m.id === id);
      if (originalMedicine) {
        const fullUpdateData = {
          ...originalMedicine,
          ...updatedMedicineData,
          userId: user.uid,
        };
        await setDoc(medicineRef, fullUpdateData);
        setMedicines(prev => 
          prev.map(m => 
            m.id === id ? { ...fullUpdateData, id: id } : m
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

  const value = { medicines: processedMedicines, addMedicine, deleteMedicine, updateMedicine, isLoading, user, isAuthLoading };

  return (
    <MedicineContext.Provider value={value}>
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
