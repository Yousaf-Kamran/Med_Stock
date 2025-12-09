"use client";

import Header from "@/components/layout/Header";
import MedicineList from "@/components/medicines/MedicineList";
import { useMedicines } from "@/contexts/MedicineContext";

export default function Home() {
  const { user, isAuthLoading } = useMedicines();

  if (isAuthLoading || !user) {
    return null; // The context handles redirection and loading state
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 px-4 md:px-6 lg:px-8">
          <MedicineList />
        </div>
      </main>
    </>
  );
}
