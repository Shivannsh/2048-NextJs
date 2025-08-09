"use client";

import { useEffect, useRef } from "react";
import { GameManager } from "@/lib/game-manager";
import { KeyboardInputManager } from "@/lib/keyboard-input-manager";
import { HTMLActuator } from "@/lib/html-actuator";
import { LocalStorageManager } from "@/lib/local-storage-manager";
import { useAccount } from "wagmi";

const GameContainer = () => {
  const { address } = useAccount();
  const gameManagerRef = useRef<GameManager | null>(null);
  
  useEffect(() => {
    // Create game instance only once
    if (!gameManagerRef.current) {
      window.requestAnimationFrame(() => {
        gameManagerRef.current = new GameManager(
          4,
          KeyboardInputManager,
          HTMLActuator,
          LocalStorageManager,
          address || ""
        );
      });
    } else {
      // Update address in existing game instance
      gameManagerRef.current.address = address || "";
    }
  }, [address]);

  return (
    <div className="game-container">
      <div className="game-message">
        <p></p>
        <div className="lower">
          <a className="retry-button">New Game</a>
        </div>
      </div>

      <div className="grid-container">
        <div className="grid-row">
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
        </div>
        <div className="grid-row">
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
        </div>
        <div className="grid-row">
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
        </div>
        <div className="grid-row">
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
          <div className="grid-cell"></div>
        </div>
      </div>

      <div className="tile-container"></div>
    </div>
  );
};

export default GameContainer;
