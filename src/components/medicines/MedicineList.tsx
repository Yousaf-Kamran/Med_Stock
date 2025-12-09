"use client";

import { useMedicines } from "@/contexts/MedicineContext";
import MedicineCard from "./MedicineCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Syringe } from "lucide-react";

export default function MedicineList() {
  const { medicines, isLoading } = useMedicines();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  if (medicines.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-lg">
        <Syringe className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No medicines yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Click "Add Medicine" to start tracking your stock.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {medicines.map((medicine) => (
        <MedicineCard key={medicine.id} medicine={medicine} />
      ))}
    </div>
  );
}
