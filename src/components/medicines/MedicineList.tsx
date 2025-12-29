"use client";

import { useState, useMemo } from "react";
import { useMedicines } from "@/contexts/MedicineContext";
import MedicineCard from "./MedicineCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Syringe, AlertTriangle } from "lucide-react";
import type { ProcessedMedicine } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EditMedicineDialog } from './EditMedicineDialog';
import { useToast } from "@/hooks/use-toast";

type DialogState = 
  | { type: 'edit'; medicine: ProcessedMedicine }
  | { type: 'delete'; medicine: ProcessedMedicine }
  | null;

function LowStockAlert({ lowStockMedicines }: { lowStockMedicines: ProcessedMedicine[] }) {
  if (lowStockMedicines.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Restock Required</AlertTitle>
      <AlertDescription>
        The following medicines are running low:{" "}
        <strong>{lowStockMedicines.map(m => m.name).join(', ')}</strong>.
      </AlertDescription>
    </Alert>
  );
}

export default function MedicineList() {
  const { medicines, isLoading, deleteMedicine } = useMedicines();
  const { toast } = useToast();
  const [activeDialog, setActiveDialog] = useState<DialogState>(null);

  const lowStockMedicines = useMemo(() => {
    return medicines.filter(m => m.currentStock < (m.lowStockThreshold ?? 10));
  }, [medicines]);

  const confirmDelete = () => {
    if (activeDialog?.type === 'delete') {
      deleteMedicine(activeDialog.medicine.id);
      toast({
        title: "Medicine Deleted",
        description: `${activeDialog.medicine.name} has been removed.`,
        variant: "destructive"
      });
      setActiveDialog(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-lg" />
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
    <>
      <LowStockAlert lowStockMedicines={lowStockMedicines} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {medicines.map((medicine) => (
          <MedicineCard 
            key={medicine.id} 
            medicine={medicine} 
            onEdit={() => setActiveDialog({ type: 'edit', medicine })}
            onDelete={() => setActiveDialog({ type: 'delete', medicine })}
          />
        ))}
      </div>

      {activeDialog?.type === 'edit' && (
        <EditMedicineDialog 
          medicineToEdit={activeDialog.medicine}
          open={true}
          onOpenChange={(open) => !open && setActiveDialog(null)}
        />
      )}

      {activeDialog?.type === 'delete' && (
        <AlertDialog open={true} onOpenChange={(open) => !open && setActiveDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                <span className="font-semibold"> {activeDialog.medicine.name} </span> 
                medicine from your tracker.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
