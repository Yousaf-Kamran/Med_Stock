"use client";

import { Pill } from "lucide-react";
import dynamic from 'next/dynamic';

const AddMedicineDialog = dynamic(() => import('../medicines/AddMedicineDialog'), { ssr: false });

export default function Header() {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Pill className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              MedStock Tracker
            </h1>
          </div>
          <AddMedicineDialog />
        </div>
      </div>
    </header>
  );
}
