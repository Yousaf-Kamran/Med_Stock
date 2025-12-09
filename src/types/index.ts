export interface Dosage {
  id: string;
  time: string; // "HH:mm"
  amount: number;
}

export interface Medicine {
  id:string;
  name: string;
  stock: number; // Initial stock
  dosages: Omit<Dosage, 'id'>[];
  createdAt: string; // ISO date string
}

export interface ProcessedMedicine extends Omit<Medicine, 'dosages'> {
  dosages: Dosage[];
  currentStock: number;
  endDate: Date | null;
}
