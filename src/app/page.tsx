"use client";

import Header from "@/components/layout/Header";
import MedicineList from "@/components/medicines/MedicineList";
import { useMedicines } from "@/contexts/MedicineContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, isLoading } = useMedicines();

  if (isLoading || !user) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <MedicineList />
        </div>
      </main>
    </div>
  );
}
