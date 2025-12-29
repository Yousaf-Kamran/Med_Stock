"use client";

import type { ProcessedMedicine } from "@/types";
import { CalendarClock, Clock, MoreVertical, Trash2, Warehouse, Pencil, AlertTriangle } from "lucide-react";
import { formatEndDate } from "@/lib/medicine-utils";

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
import { Button } from '@/components/ui/button';

interface MedicineCardProps {
  medicine: ProcessedMedicine;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MedicineCard({ medicine, onEdit, onDelete }: MedicineCardProps) {
  const stockPercentage = medicine.stock > 0 ? (medicine.currentStock / medicine.stock) * 100 : 0;
  const isLowStock = medicine.currentStock < (medicine.lowStockThreshold ?? 10);

  return (
    <Card className={`flex flex-col h-full shadow-md hover:shadow-lg transition-all duration-300 ${isLowStock ? 'border-destructive/50' : ''}`}>
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
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
          {isLowStock && (
            <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              Low stock warning
            </div>
          )}
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
          {medicine.dosages.map((dosage, index) => (
            <Badge key={index} variant="secondary">
              {dosage.amount} at {dosage.time}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
