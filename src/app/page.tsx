import Navbar from "@/components/Navbar";
import Tamagotchi from "@/components/Tamagotchi";
import { TamagotchiNewUI } from "@/components/tamagotchi-new-ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <TamagotchiNewUI />
    </main>
  );
}
