"use client";
import { INTERACTION } from "@/app/utils/interaction";
import React, { useState, useEffect } from "react";
import { idle, drinkingCoffee, death } from "./tamagotchiFrames";

import "../index.css";

const DEFAULT_STATUS = ":)";
const Tamagotchi: React.FC = () => {
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [tamagotchiState, setTamagotchiState] = useState<any>({});
  const [animation, setAnimation] = useState<string[]>(idle);
  const [tamaStatus, setTamaStatus] = useState(DEFAULT_STATUS);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  //TODO - call init endpoint to determine if tamagotchi is initialized. if not generate one.

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/getState", { method: "POST" });
        if (response.ok) {
          const jsonData = await response.json();
          if (!!!jsonData.comment) {
            jsonData.comment = "No comments";
          }
          setTamagotchiState(jsonData);
          console.log(jsonData);
          handleDeath(jsonData, pollInterval);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Cycle through frames every 1 second
    const frameInterval = setInterval(() => {
      setFrameIndex((prevIndex) => (prevIndex + 1) % idle.length);
    }, 1000);

    // Fetch data on component mount
    fetchData();

    // Start polling data every N seconds (adjust the interval as needed)
    const pollInterval = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(pollInterval);
      clearInterval(frameInterval);
    };
  }, []);

  const handleResponse = (responseText: string) => {
    const responseJSON = JSON.parse(responseText);
    const animation = JSON.parse(responseJSON.animation);
    const status = responseJSON.status;
    setFrameIndex(0);
    setAnimation(animation);
    setTamaStatus(status);
  };

  const handleDeath = (jsonData: any, pollInterval: NodeJS.Timer) => {
    if (jsonData.death) {
      setAnimation(death);
      setTamaStatus("Dead :(");
      clearInterval(pollInterval);
    }
  };

  const handleBath = async () => {
    setIsInteracting(true);
    setTamaStatus("Bathing...");
    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        body: JSON.stringify({
          interactionType: INTERACTION.BATH,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseText = await response.text();
      handleResponse(responseText);
    } catch (e) {
      console.log(e);
    }

    setTimeout(() => {
      setAnimation(idle);
      setTamaStatus(DEFAULT_STATUS);
      setIsInteracting(false);
    }, 9000);
  };

  const feedTamagotchi = async (e: any) => {
    setIsInteracting(true);
    // Add logic to feed the Tamagotchi here
    setTamaStatus("Feeding...");
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
      const responseText = await response.text();
      handleResponse(responseText);
    } catch (e) {
      console.log(e);
    }

    console.log("Tamagotchi fed!");

    // TODO - there may be a race condition here if user clicks the button too fast?
    setTimeout(() => {
      setAnimation(idle);
      setTamaStatus(DEFAULT_STATUS);
      setIsInteracting(false);
    }, 9000);
  };

  const playWithTamagotchi = async (e: any) => {
    // Add logic to feed the Tamagotchi here
    setTamaStatus("Playing...");
    setIsInteracting(true);
    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        body: JSON.stringify({
          interactionType: INTERACTION.PLAY,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseText = await response.text();
      handleResponse(responseText);
    } catch (e) {
      console.log(e);
    }
    setTimeout(() => {
      setAnimation(idle);
      setTamaStatus(DEFAULT_STATUS);
      setIsInteracting(false);
    }, 9000);
  };

  const treatSickTamagotchi = async (e: any) => {
    setIsInteracting(true);
    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        body: JSON.stringify({
          interactionType: INTERACTION.GO_TO_HOSPITAL,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseText = await response.text();
      handleResponse(responseText);
    } catch (e) {
      console.log(e);
    }
    setTimeout(() => {
      setAnimation(idle);
      setTamaStatus(DEFAULT_STATUS);
      setIsInteracting(false);
    }, 9000);
  };

  const handleDiscipline = async () => {
    setTamaStatus("Discipling...");
    setIsInteracting(true);
    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        body: JSON.stringify({
          interactionType: INTERACTION.DISCIPLINE,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseText = await response.text();
      handleResponse(responseText);
    } catch (e) {
      console.log(e);
    }
    setTimeout(() => {
      setAnimation(idle);
      setTamaStatus(DEFAULT_STATUS);
      setIsInteracting(false);
    }, 9000);
  };

  const checkStatus = () => {
    if (!isInteracting) {
      setTamaStatus("Checking Status...");
      setCheckingStatus(true);
      setTimeout(() => {
        setCheckingStatus(false);
      }, 9000);
    }
  };

  let needForBath = "";
  for (let i = 0; i < tamagotchiState.poop; i++) {
    needForBath += "💩";
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-slate-50 tamago-frame">
      <div className="text-center mb-2">Status: {tamaStatus}</div>
      <div className="min-w-[300px] p-4 border border-black rounded-lg  h-[330px] overflow-auto tamago-screen">
        <div className="flex justify-between mb-4">
          <button
            onClick={feedTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
            style={{ width: "80px" }}
          >
            🍴
          </button>
          {/* TODO - all other actions */}
          {/* <button
            onClick={feedTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
          >
            💡
          </button> */}
          <button
            onClick={playWithTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
            style={{ width: "80px" }}
          >
            🎯
          </button>
          <button
            onClick={treatSickTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
            style={{ width: "80px" }}
          >
            💉
          </button>
        </div>
        {/* Tamagotchi display */}
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-64 h-48 overflow-hidden">
            {!checkingStatus && (
              <div>
                <pre className="text-center">{animation[frameIndex]}</pre>
                <div>{needForBath}</div>
              </div>
            )}

            {checkingStatus && (
              <pre
                className="text-left overflow-x-hidden overflow-y-auto whitespace-normal"
                style={{ maxHeight: "100%", maxWidth: "100%" }}
              >
                Age: {tamagotchiState.age || "No age"} <br />
                Happiness: {tamagotchiState.happiness || "No happiness"} <br />
                Hunger: {tamagotchiState.hunger || "No hunger"} <br />
                Health: {tamagotchiState.health || "No health"} <br />
                🚽: {tamagotchiState.poop || "👍"} <br />
                {'"' + tamagotchiState.comment || "No comments" + '"'}
              </pre>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={handleBath}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
            style={{ width: "80px" }}
          >
            🛀
          </button>
          <button
            onClick={checkStatus}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
            style={{ width: "80px" }}
          >
            📋
          </button>
          <button
            onClick={handleDiscipline}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
            style={{ width: "80px" }}
          >
            😡
          </button>
          {/* <button
            onClick={feedTamagotchi}
            className="px-4 py-2 mr-2 bg-blue-200 rounded-lg"
          >
            👥
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Tamagotchi;
