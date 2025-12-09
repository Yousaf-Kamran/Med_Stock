"use client";

import { useState } from "react";
import { useMedicines } from "@/contexts/MedicineContext";
import MedicineCard from "./MedicineCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Syringe, Loader2 } from "lucide-react";
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
import { EditMedicineDialog } from './EditMedicineDialog';
import { useToast } from "@/hooks/use-toast";

export default function MedicineList() {
  const { medicines, isLoading, deleteMedicine, isAuthLoading, user } = useMedicines();
  const { toast } = useToast();

  const [medicineToEdit, setMedicineToEdit] = useState<ProcessedMedicine | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [medicineToDelete, setMedicineToDelete] = useState<ProcessedMedicine | null>(null);

  const handleEdit = (medicine: ProcessedMedicine) => {
    setMedicineToEdit(medicine);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    if (!open) {
      setMedicineToEdit(null);
    }
    setIsEditDialogOpen(open);
  }

  const handleDeleteRequest = (medicine: ProcessedMedicine) => {
    setMedicineToDelete(medicine);
  };

  const confirmDelete = () => {
    if (medicineToDelete) {
      deleteMedicine(medicineToDelete.id);
      toast({
        title: "Medicine Deleted",
        description: `${medicineToDelete.name} has been removed.`,
        variant: "destructive"
      });
      setMedicineToDelete(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    // This case should be handled by the context redirect, but as a fallback:
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-lg">
        <h3 className="mt-4 text-lg font-medium text-foreground">Please log in</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You need to be logged in to view your medicines.
        </p>
      </div>
    )
  }

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {medicines.map((medicine) => (
          <MedicineCard 
            key={medicine.id} 
            medicine={medicine} 
            onEdit={() => handleEdit(medicine)}
            onDelete={() => handleDeleteRequest(medicine)}
          />
        ))}
      </div>

      {medicineToEdit && (
        <EditMedicineDialog 
          medicineToEdit={medicineToEdit}
          open={isEditDialogOpen}
          onOpenChange={handleEditDialogClose}
        />
      )}

      {medicineToDelete && (
        <AlertDialog open={!!medicineToDelete} onOpenChange={(open) => !open && setMedicineToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                <span className="font-semibold"> {medicineToDelete.name} </span> 
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
