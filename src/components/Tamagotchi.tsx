"use client";
import { INTERACTION } from "@/app/utils/interaction";
import React, { useState, useEffect } from "react";
import { idle, drinkingCoffee } from "./tamagotchiFrames";

const Tamagotchi: React.FC = () => {
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [animation, setAnimation] = useState(idle);

  //TODO - call init endpoint to determine if tamagotchi is initialized. if not generate one.

  useEffect(() => {
    // Cycle through frames every 1 second
    const interval = setInterval(() => {
      setFrameIndex((prevIndex) => (prevIndex + 1) % idle.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const feedTamagotchi = async (e: any) => {
    // Add logic to feed the Tamagotchi here
    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        body: JSON.stringify({
          interactionType: INTERACTION.FEED,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      console.log(e);
    }

    setAnimation(drinkingCoffee);

    console.log("Tamagotchi fed!");
    setTimeout(() => {
      setAnimation(idle);
    }, 3000);
  };

  const checkStatus = () => {
    // Add logic to check the Tamagotchi's status here
    console.log("Tamagotchi status checked!");
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-slate-50">
      <div className="p-4 border border-black rounded-lg  h-[260px] overflow-auto">
        <div className="flex justify-between mb-4">
          <button
            onClick={feedTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
          >
            🍴
          </button>
          {/* TODO - all other actions */}
          <button
            onClick={feedTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
          >
            💡
          </button>
          <button
            onClick={feedTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
          >
            🎯
          </button>
          <button
            onClick={feedTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
          >
            💉
          </button>
        </div>
        <pre className="text-center">{animation[frameIndex]}</pre>
        <div className="flex justify-between">
          <button
            onClick={feedTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
          >
            🛀
          </button>
          <button
            onClick={feedTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
          >
            📋
          </button>
          <button
            onClick={feedTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
          >
            😡
          </button>
          <button
            onClick={feedTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
          >
            👥
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tamagotchi;
