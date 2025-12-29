"use client";

import { useEffect, useRef } from 'react';
import { useMedicines } from '@/contexts/MedicineContext';
import { useToast } from './use-toast';

const NOTIFICATION_INTERVAL = 3600 * 1000; // 1 hour
const LAST_CHECK_KEY = 'medicine_last_notification_check';
const LOW_STOCK_NOTIFIED_KEY = 'medicine_low_stock_notified';

export function useMedicineNotifications() {
  const { medicines, isLoading } = useMedicines();
  const { toast } = useToast();
  const workerRef = useRef<Worker>();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/service-worker.js').catch(err => {
        console.error('Service Worker registration failed:', err);
      });
    }
  }, []);

  useEffect(() => {
    const notificationPermission = window.localStorage.getItem('notification_permission');
    if (notificationPermission !== 'granted' || isLoading) {
      return;
    }
    
    // Function to perform the check
    const checkStockAndNotify = () => {
      const previouslyNotified: string[] = JSON.parse(localStorage.getItem(LOW_STOCK_NOTIFIED_KEY) || '[]');
      const newlyLowStockMedicines = medicines.filter(med => {
        const isLow = med.currentStock < (med.lowStockThreshold ?? 10);
        return isLow && !previouslyNotified.includes(med.id);
      });

      if (newlyLowStockMedicines.length > 0) {
        const medicineNames = newlyLowStockMedicines.map(m => m.name).join(', ');
        const notification = new Notification('Low Stock Alert', {
          body: `Time to restock: ${medicineNames}`,
          icon: '/favicon.ico',
        });
        
        const updatedNotified = [...previouslyNotified, ...newlyLowStockMedicines.map(m => m.id)];
        localStorage.setItem(LOW_STOCK_NOTIFIED_KEY, JSON.stringify(updatedNotified));
      }
      
      // Clean up notified list for medicines that are no longer low stock
      const currentlyLowStockIds = medicines.filter(m => m.currentStock < (m.lowStockThreshold ?? 10)).map(m => m.id);
      const stillNotified = previouslyNotified.filter(id => currentlyLowStockIds.includes(id));
      if (stillNotified.length !== previouslyNotified.length) {
         localStorage.setItem(LOW_STOCK_NOTIFIED_KEY, JSON.stringify(stillNotified));
      }
    };
    
    // Perform check immediately on load if enough time has passed
    const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0', 10);
    if (Date.now() - lastCheck > NOTIFICATION_INTERVAL) {
        checkStockAndNotify();
        localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    }

    // Set up interval to check periodically
    const intervalId = setInterval(() => {
        checkStockAndNotify();
        localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    }, NOTIFICATION_INTERVAL);

    return () => clearInterval(intervalId);

  }, [medicines, isLoading, toast]);
}
