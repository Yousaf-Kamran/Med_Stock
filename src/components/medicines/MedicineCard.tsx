"use client";

import { useState } from 'react';
import type { ProcessedMedicine } from "@/types";
import { CalendarClock, Clock, MoreVertical, Trash2, Warehouse } from "lucide-react";
import { formatEndDate } from "@/lib/medicine-utils";
import { useMedicines } from '@/contexts/MedicineContext';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from '@/components/ui/button';

interface MedicineCardProps {
  medicine: ProcessedMedicine;
}

export default function MedicineCard({ medicine }: MedicineCardProps) {
  const { deleteMedicine } = useMedicines();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const stockPercentage = medicine.stock > 0 ? (medicine.currentStock / medicine.stock) * 100 : 0;
  const isLowStock = stockPercentage < 20;

  const handleDelete = () => {
    deleteMedicine(medicine.id);
    toast({
      title: "Medicine Deleted",
      description: `${medicine.name} has been removed.`,
      variant: "destructive"
    });
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <>
      <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{medicine.name}</CardTitle>
            <CardDescription>Added on {new Date(medicine.createdAt).toLocaleDateString()}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Warehouse className="h-4 w-4" />
                <span>Current Stock</span>
              </div>
              <span className={`font-bold text-lg ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                {Math.floor(medicine.currentStock)}
                <span className="text-sm font-normal text-muted-foreground"> / {medicine.stock}</span>
              </span>
            </div>
            <Progress value={stockPercentage} className={`h-2 ${isLowStock ? '[&>div]:bg-destructive' : ''}`} />
          </div>

          <div className="space-y-2">
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                <span>Predicted End Date</span>
              </div>
            <p className="font-semibold text-accent-foreground/90 bg-accent/20 p-2 rounded-md text-sm">
              {medicine.currentStock > 0 ? formatEndDate(medicine.endDate) : "Depleted"}
            </p>
          </div>

        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Dosage Schedule</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {medicine.dosages.map((dosage) => (
              <Badge key={dosage.id} variant="secondary">
                {dosage.amount} at {dosage.time}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <span className="font-semibold"> {medicine.name} </span> 
              medicine from your tracker.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
