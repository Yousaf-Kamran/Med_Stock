"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMedicines } from "@/contexts/MedicineContext";
import { useToast } from "@/hooks/use-toast";
import type { ProcessedMedicine } from "@/types";

const dosageSchema = z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time (HH:MM)"),
  amount: z.coerce.number().positive("Must be > 0"),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  stock: z.coerce.number().int().min(1, "Stock must be at least 1."),
  dosages: z.array(dosageSchema).min(1, "At least one dosage schedule is required."),
});

type FormData = z.infer<typeof formSchema>;

interface EditMedicineDialogProps {
  medicineToEdit: ProcessedMedicine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMedicineDialog({ medicineToEdit, open, onOpenChange }: EditMedicineDialogProps) {
  const { updateMedicine } = useMedicines();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      stock: 0,
      dosages: [{ time: "00:00", amount: 0 }],
    },
  });
  
  useEffect(() => {
    if (open && medicineToEdit) {
      form.reset({
        name: medicineToEdit.name,
        stock: medicineToEdit.stock,
        dosages: medicineToEdit.dosages,
      });
    }
  }, [medicineToEdit, open, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dosages",
  });

  function onSubmit(data: FormData) {
    if (!medicineToEdit) return;
    updateMedicine(medicineToEdit.id, data);
    toast({
      title: "Medicine Updated",
      description: `${data.name} has been updated.`,
    });
    onOpenChange(false);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Medicine</DialogTitle>
          <DialogDescription>
            Update the details of your medicine.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicine Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Insulin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Dosage Schedule</FormLabel>
              <div className="space-y-2 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`dosages.${index}.time`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`dosages.${index}.amount`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormControl>
                            <Input type="number" placeholder="Amt." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
               <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ time: "20:00", amount: 1 })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Dosage Time
              </Button>
            </div>
            
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
