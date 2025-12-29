"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getFirebaseDb } from '@/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import type { Medicine, ProcessedMedicine } from '@/types';
import { calculateCurrentStock, calculateEndDate } from '@/lib/medicine-utils';

interface MedicineContextType {
  medicines: ProcessedMedicine[];
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt'>) => void;
  deleteMedicine: (id: string) => void;
  updateMedicine: (id: string, updatedMedicine: Omit<Medicine, 'id' | 'createdAt'>) => void;
  isLoading: boolean;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export const MedicineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const fetchMedicines = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getFirebaseDb();
      const medicinesCol = collection(db, 'medicines');
      const querySnapshot = await getDocs(medicinesCol);
      const allMedicines = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
      setMedicines(allMedicines);
    } catch (error) {
      console.error("Failed to load medicines from Firestore", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const addMedicine = async (medicineData: Omit<Medicine, 'id' | 'createdAt'>) => {
    const newMedicine: Omit<Medicine, 'id'> = {
      ...medicineData,
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

  const updateMedicine = async (id: string, updatedMedicineData: Omit<Medicine, 'id' | 'createdAt'>) => {
    try {
      const db = getFirebaseDb();
      const medicineRef = doc(db, 'medicines', id);
      const originalMedicine = medicines.find(m => m.id === id);
      if (originalMedicine) {
        const fullUpdateData = {
          ...originalMedicine,
          ...updatedMedicineData,
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

  const value = { medicines: processedMedicines, addMedicine, deleteMedicine, updateMedicine, isLoading };

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
