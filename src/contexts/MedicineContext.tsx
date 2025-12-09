"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Medicine, ProcessedMedicine, Dosage } from '@/types';
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

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('medicines');
      if (item) {
        setMedicines(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load medicines from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if(!isLoading) {
      try {
        window.localStorage.setItem('medicines', JSON.stringify(medicines));
      } catch (error) {
        console.error("Failed to save medicines to localStorage", error);
      }
    }
  }, [medicines, isLoading]);

  const addMedicine = (medicine: Omit<Medicine, 'id' | 'createdAt'>) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: new Date().toISOString() + Math.random(),
      createdAt: new Date().toISOString(),
    };
    setMedicines(prev => [...prev, newMedicine]);
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };
  
  const updateMedicine = (id: string, updatedMedicineData: Omit<Medicine, 'id' | 'createdAt'>) => {
    setMedicines(prev => 
      prev.map(m => 
        m.id === id ? { ...m, ...updatedMedicineData } : m
      )
    );
  };

  const processedMedicines = useMemo((): ProcessedMedicine[] => {
    return medicines.map(med => {
      const currentStock = calculateCurrentStock(med);
      const endDate = calculateEndDate(currentStock, med.dosages);
      return { ...med, currentStock, endDate };
    }).sort((a, b) => (a.endDate?.getTime() ?? Infinity) - (b.endDate?.getTime() ?? Infinity));
  }, [medicines]);

  return (
    <MedicineContext.Provider value={{ medicines: processedMedicines, addMedicine, deleteMedicine, updateMedicine, isLoading }}>
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
