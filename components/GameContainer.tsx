"use client";

import { useEffect } from "react";
import { GameManager } from "@/lib/game-manager";
import { KeyboardInputManager } from "@/lib/keyboard-input-manager";
import { HTMLActuator } from "@/lib/html-actuator";
import { LocalStorageManager } from "@/lib/local-storage-manager";

const GameContainer = () => {
  useEffect(() => {
    // Wait till the browser is ready to render the game (avoids glitches)
    window.requestAnimationFrame(() => {
      new GameManager(
        4,
        KeyboardInputManager,
        HTMLActuator,
        LocalStorageManager
      );
    });
  }, []);

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
