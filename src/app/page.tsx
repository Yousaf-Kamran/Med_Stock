import Header from "@/components/layout/Header";
import MedicineList from "@/components/medicines/MedicineList";

export default function Home() {
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
