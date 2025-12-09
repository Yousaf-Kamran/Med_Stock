import type { Medicine, Dosage } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';

export function calculateCurrentStock(medicine: Medicine, now: Date): number {
  const { stock: initialStock, createdAt, dosages } = medicine;
  if (!dosages || dosages.length === 0) {
    return initialStock;
  }

  const startTime = new Date(createdAt);
  let totalAmountTaken = 0;

  for (const dosage of dosages) {
    const [hour, minute] = dosage.time.split(':').map(Number);
    let doseTime = new Date(startTime);
    doseTime.setHours(hour, minute, 0, 0);

    // If the first scheduled dose time on the start day is before the creation time, start counting from the next day's dose.
    if (doseTime.getTime() < startTime.getTime()) {
      doseTime.setDate(doseTime.getDate() + 1);
    }

    while (doseTime.getTime() <= now.getTime()) {
      totalAmountTaken += dosage.amount;
      doseTime.setDate(doseTime.getDate() + 1);
    }
  }

  const currentStock = initialStock - totalAmountTaken;
  return Math.max(0, currentStock);
}

export function calculateEndDate(currentStock: number, dosages: Dosage[], now: Date): Date | null {
  if (dosages.length === 0 || currentStock <= 0) {
    return null;
  }

  const totalDailyDose = dosages.reduce((sum, d) => sum + d.amount, 0);
  if (totalDailyDose <= 0) {
    return null;
  }
  
  let remainingStock = currentStock;
  let predictionDate = new Date(now);
  
  const sortedDosages = [...dosages].sort((a, b) => a.time.localeCompare(b.time));

  // Limit search to 5 years to prevent infinite loops
  for (let i = 0; i < 365 * 5; i++) {
    const isToday = i === 0;
    const currentTimeInMinutes = predictionDate.getHours() * 60 + predictionDate.getMinutes();

    for (const dosage of sortedDosages) {
      const [h, m] = dosage.time.split(':').map(Number);
      const dosageTimeInMinutes = h * 60 + m;

      if (isToday && dosageTimeInMinutes <= currentTimeInMinutes) {
        continue;
      }
      
      remainingStock -= dosage.amount;
      
      if (remainingStock <= 0) {
        predictionDate.setHours(h, m, 0, 0);
        return predictionDate;
      }
    }
    
    predictionDate.setDate(predictionDate.getDate() + 1);
    predictionDate.setHours(0, 0, 0, 0);
  }

  return null;
}

export function formatEndDate(date: Date | null): string {
    if (!date) return 'N/A';
    const now = new Date();
    if (date < now) return 'Depleted';
    
    const friendlyRelative = formatDistanceToNow(date, { addSuffix: true });
    const absolute = format(date, "MMM d, yyyy 'at' h:mm a");

    return `${absolute} (${friendlyRelative})`;
}
