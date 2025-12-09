import Header from "@/components/layout/Header";
import MedicineList from "@/components/medicines/MedicineList";

export default function Home() {
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
