export interface Dosage {
  time: string; // "HH:mm"
  amount: number;
}

export interface Medicine {
  id: string;
  name: string;
  stock: number; // Initial stock
  dosages: Dosage[];
  createdAt: string; // ISO date string
  userId: string;
}

export interface ProcessedMedicine extends Medicine {
  currentStock: number;
  endDate: Date | null;
}
