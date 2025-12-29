"use client";

import Header from "@/components/layout/Header";
import MedicineList from "@/components/medicines/MedicineList";
import { useMedicineNotifications } from "@/hooks/useMedicineNotifications";

export default function Home() {
  useMedicineNotifications();

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
