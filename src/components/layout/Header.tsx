"use client";

import { Pill, LogOut } from "lucide-react";
import dynamic from 'next/dynamic';
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { signOut } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";


const AddMedicineDialog = dynamic(() => import('../medicines/AddMedicineDialog'), { ssr: false });

export default function Header() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Sign out error", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

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
          <div className="flex items-center gap-4">
            <AddMedicineDialog />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
