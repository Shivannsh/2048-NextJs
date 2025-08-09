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
    // Only create game if wallet is connected
    if (address && !gameManagerRef.current) {
      window.requestAnimationFrame(() => {
        gameManagerRef.current = new GameManager(
          4,
          KeyboardInputManager,
          HTMLActuator,
          LocalStorageManager,
          address
        );
      });
    } else if (address && gameManagerRef.current) {
      // Update address in existing game instance
      gameManagerRef.current.address = address;
    }
  }, [address]);

  // Show connect wallet message if no wallet is connected
  if (!address) {
    return (
      <div className="game-container">
        <div className="game-message" style={{ display: 'block' }}>
          <p>Please connect your wallet to play the game</p>
          <div className="lower">
            <p style={{ fontSize: '14px', color: '#776e65', marginTop: '10px' }}>
              Connect your wallet using the button in the top navigation
            </p>
          </div>
        </div>
        
        <div className="grid-container" style={{ opacity: 0.3 }}>
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
  }

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
