import Navbar from "@/components/Navbar";
import { Tamagotchi } from "@/components/Tamagotchi";

export default function Home() {
  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Navbar />
        <Tamagotchi />
      </div>
    </>
  );
}
