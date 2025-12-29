"use client";

import { useEffect } from 'react';
import { useMedicines } from '@/contexts/MedicineContext';

const NOTIFICATION_INTERVAL = 3600 * 1000; // 1 hour
const LAST_CHECK_KEY = 'medicine_last_notification_check';
const LOW_STOCK_NOTIFIED_KEY = 'medicine_low_stock_notified';

export function useMedicineNotifications() {
  const { medicines, isLoading } = useMedicines();

  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) {
      return;
    }

    let hasLocalStorage = false;
    try {
      hasLocalStorage = !!window.localStorage;
    } catch {
      hasLocalStorage = false;
    }

    if (!hasLocalStorage || !('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'granted' || window.localStorage.getItem('notification_permission') !== 'granted') {
      return;
    }
    
    const checkStockAndNotify = () => {
      const previouslyNotified: string[] = JSON.parse(localStorage.getItem(LOW_STOCK_NOTIFIED_KEY) || '[]');
      const newlyLowStockMedicines = medicines.filter(med => {
        const isLow = med.currentStock < (med.lowStockThreshold ?? 10);
        return isLow && !previouslyNotified.includes(med.id);
      });

      if (newlyLowStockMedicines.length > 0) {
        const medicineNames = newlyLowStockMedicines.map(m => m.name).join(', ');
        new Notification('Low Stock Alert', {
          body: `Time to restock: ${medicineNames}`,
          icon: '/favicon.ico',
        });
        
        const updatedNotified = [...previouslyNotified, ...newlyLowStockMedicines.map(m => m.id)];
        localStorage.setItem(LOW_STOCK_NOTIFIED_KEY, JSON.stringify(updatedNotified));
      }
      
      const currentlyLowStockIds = medicines.filter(m => m.currentStock < (m.lowStockThreshold ?? 10)).map(m => m.id);
      const stillNotified = previouslyNotified.filter(id => currentlyLowStockIds.includes(id));
      if (stillNotified.length !== previouslyNotified.length) {
         localStorage.setItem(LOW_STOCK_NOTIFIED_KEY, JSON.stringify(stillNotified));
      }
    };
    
    const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0', 10);
    if (Date.now() - lastCheck > NOTIFICATION_INTERVAL) {
        checkStockAndNotify();
        localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    }

    const intervalId = setInterval(() => {
        checkStockAndNotify();
        localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    }, NOTIFICATION_INTERVAL);

    return () => clearInterval(intervalId);

  }, [medicines, isLoading]);
}
