import { Grid } from "./grid";
import { Tile } from "./tile";
import {  UltraPlonkBackend } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
import circuitJson from "circuit_2048/target/circuit_2048.json";

import { Buffer } from "buffer";

import { getAccount } from '@wagmi/core'
import { supabase } from "./database";
import { config } from "@/app/providers";

export class GameManager {
  size: number;
  startTiles: number;
  inputManager: any;
  storageManager: any;
  actuator: any;
  grid!: Grid;
  score!: number;
  over!: boolean;
  won!: boolean;
  keepPlaying!: boolean;
  movesHistory: number[]; // Stores only the direction of each move
  address: string; // Store the wallet address

  constructor(
    size: number,
    InputManager: any,
    Actuator: any,
    StorageManager: any,
    address: string
  ) {
    this.size = size; // Size of the grid
    this.inputManager = new InputManager();
    this.storageManager = new StorageManager();
    this.actuator = new Actuator();
    this.address = address; // Store the wallet address

    this.startTiles = 2;

    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));
    this.inputManager.on("keepPlaying", this.keepPlayingHandler.bind(this));

    this.movesHistory = [];

    this.setup();
  }

  restart() {
    this.storageManager.clearGameState();
    this.actuator.continueGame(); // Clear the game won/lost message
    this.movesHistory = []; // Clear moves history on restart
    this.setup();
  }

  keepPlayingHandler() {
    this.keepPlaying = true;
    this.actuator.continueGame(); // Clear the game won/lost message
  }

  isGameTerminated() {
    return this.over || (this.won && !this.keepPlaying);
  }

  setup() {
    const previousState = this.storageManager.getGameState();

    if (previousState && this.validateGameState(previousState)) {
      this.grid = new Grid(previousState.grid.size, previousState.grid.cells);
      this.score = previousState.score;
      this.over = previousState.over;
      this.won = previousState.won;
      this.keepPlaying = previousState.keepPlaying;
      this.movesHistory = previousState.movesHistory || [];
    } else {
      // Invalid or no previous state - start fresh
      if (previousState) {
        console.warn('🚨 Invalid game state detected - starting new game');
        this.storageManager.clearGameState();
      }
      
      this.grid = new Grid(this.size);
      this.score = 0;
      this.over = false;
      this.won = false;
      this.keepPlaying = false;
      this.movesHistory = [];

      this.addStartTiles();
    }

    this.actuate();
  }

  // Validate game state integrity
  validateGameState(state: any): boolean {
    try {
      // Basic structure validation
      if (!state.grid || !state.grid.cells || typeof state.score !== 'number') {
        return false;
      }

      // Score validation - reasonable limits
      if (state.score < 0 || state.score > 1000000) {
        console.warn('🚨 Suspicious score detected:', state.score);
        return false;
      }

      // Moves validation
      if (state.movesHistory) {
        if (state.movesHistory.length > 10000) { // Max reasonable moves
          console.warn('🚨 Too many moves detected:', state.movesHistory.length);
          return false;
        }

        // Validate move directions (0-3)
        for (let move of state.movesHistory) {
          if (move < 0 || move > 3) {
            console.warn('🚨 Invalid move direction:', move);
            return false;
          }
        }
      }

      // Grid validation
      const grid = state.grid;
      if (grid.size !== 4 || !Array.isArray(grid.cells)) {
        return false;
      }

      // Validate grid dimensions
      if (grid.cells.length !== 4 || grid.cells.some(row => !Array.isArray(row) || row.length !== 4)) {
        return false;
      }

      // Validate tile values (must be powers of 2)
      let calculatedScore = 0;
      for (let row of grid.cells) {
        for (let cell of row) {
          if (cell !== null) {
            if (!cell.value || !this.isPowerOfTwo(cell.value) || cell.value < 2 || cell.value > 131072) {
              console.warn('🚨 Invalid tile value:', cell.value);
              return false;
            }
            // Rough score calculation for validation
            calculatedScore += cell.value;
          }
        }
      }
      return true;
    } catch (error) {
      console.warn('🚨 Error validating game state:', error);
      return false;
    }
  }

  // Helper function to check if number is power of 2
  isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  addStartTiles() {
    for (let i = 0; i < this.startTiles; i++) {
      this.addRandomTile();
    }
  }

  addRandomTile() {
    if (this.grid.cellsAvailable()) {
      const value = Math.random() < 0.9 ? 2 : 4;
      const cell = this.grid.randomAvailableCell();
      if (cell) {
        const tile = new Tile(cell, value);
        this.grid.insertTile(tile);
      }
    }
  }

  actuate() {
    if (this.storageManager.getBestScore() < this.score) {
      this.storageManager.setBestScore(this.score);
    }

    if (this.over) {
      this.storageManager.clearGameState();
      // Log when the game is lost
      console.log("Game Over! You lost.");
    } else if (this.won && !this.keepPlaying) {
      // Log when the game is won
      console.log("Congratulations! You won!");
     
    } else if (this.isGameTerminated()) {
      // Log if the game is otherwise terminated (should cover all cases)
      console.log("Game ended.");
    } else {
      this.storageManager.setGameState(this.serialize());
    }

      this.actuator.actuate(this.grid, {
      score: this.score,
      over: this.over,
      won: this.won,
      bestScore: this.storageManager.getBestScore(),
      terminated: this.isGameTerminated(),
    }, this);
  }

  serialize() {
    return {
      grid: this.grid.serialize(),
      score: this.score,
      over: this.over,
      won: this.won,
      keepPlaying: this.keepPlaying,
      movesHistory: this.movesHistory, // Include movesHistory in serialization
    };
  }

  prepareTiles() {
    this.grid.eachCell((x, y, tile) => {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }

  moveTile(tile: Tile, cell: { x: number; y: number }) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  }

  move(direction: number) {
    if (this.isGameTerminated()) return;

    let cell: { x: number; y: number };
    let tile: Tile | null;

    const vector = this.getVector(direction);
    const traversals = this.buildTraversals(vector);
    let moved = false;

    this.prepareTiles();

    traversals.x.forEach((x) => {
      traversals.y.forEach((y) => {
        cell = { x, y };
        tile = this.grid.cellContent(cell);

        if (tile) {
          const positions = this.findFarthestPosition(cell, vector);
          const next = this.grid.cellContent(positions.next);

          if (next && next.value === tile.value && !next.mergedFrom) {
            const merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];

            this.grid.insertTile(merged);
            this.grid.removeTile(tile);

            tile.updatePosition(positions.next);

            this.score += merged.value;

            if (merged.value === 2048) this.won = true;
          } else {
            this.moveTile(tile, positions.farthest);
          }

          if (!this.positionsEqual(cell, tile)) {
            moved = true;
          }
        }
      });
    });

    if (moved) {
      this.movesHistory.push(direction); // Record the move direction
      this.addRandomTile();

      if (!this.movesAvailable()) {
        this.over = true; // Game over!
      }

      this.actuate();

      // Log proverData after each move
      // console.log(JSON.stringify(this.getProverData(), null, 2));
    }
  }

  getVector(direction: number) {
    const map: { [key: number]: { x: number; y: number } } = {
      0: { x: 0, y: -1 }, // Up
      1: { x: 1, y: 0 }, // Right
      2: { x: 0, y: 1 }, // Down
      3: { x: -1, y: 0 }, // Left
    };
    return map[direction];
  }

  buildTraversals(vector: { x: number; y: number }) {
    const traversals: { x: number[]; y: number[] } = { x: [], y: [] };

    for (let pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
  }

  findFarthestPosition(
    cell: { x: number; y: number },
    vector: { x: number; y: number }
  ) {
    let previous;
    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell,
    };
  }

  movesAvailable() {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  }

  tileMatchesAvailable() {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.grid.cellContent({ x, y });

        if (tile) {
          for (let direction = 0; direction < 4; direction++) {
            const vector = this.getVector(direction);
            const cell = { x: x + vector.x, y: y + vector.y };
            const other = this.grid.cellContent(cell);

            if (other && other.value === tile.value) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  positionsEqual(
    first: { x: number; y: number },
    second: { x: number; y: number }
  ) {
    return first.x === second.x && first.y === second.y;
  }

  getProverData() {
    return {
      final_score: this.score,
      moves: this.movesHistory, // No padding, just the actual moves
      total_moves: this.movesHistory.length,
      actual_moves: this.movesHistory.length,
      actual_score: this.score,
    };
  }

  async generateProof(): Promise<any> {
    // Enhanced security checks
    if (!this.isGameTerminated()) {
      this.actuator.showProofMessage("❌ Game must be finished before generating proof.");
      return;
    }
    
    if (this.movesHistory.length === 0) {
      this.actuator.showProofMessage("❌ No moves recorded. Play the game first.");
      return;
    }
    
    if (this.score <= 0) {
      this.actuator.showProofMessage("❌ Invalid score detected.");
      return;
    }

    // Validate current game state integrity
    const currentState = this.serialize();
    if (!this.validateGameState(currentState)) {
      this.actuator.showProofMessage("❌ Game state validation failed. Possible tampering detected.");
      return;
    }

    // Check for localStorage tampering
    const storedState = this.storageManager.getGameState();
    if (storedState && JSON.stringify(currentState) !== JSON.stringify(storedState)) {
      this.actuator.showProofMessage("❌ Game state mismatch detected. Please restart the game.");
      return;
    }
    
    this.actuator.showProofMessage("Generating proof...");
    const proverData = this.getProverData();

    try {
      const noirInput = {
        final_score: proverData.final_score,
        total_moves: proverData.total_moves,
        actual_moves: proverData.actual_moves,
        actual_score: proverData.actual_score,
        address: this.address,
      };
      const noir = new Noir(circuitJson as any);
      const backend = new UltraPlonkBackend(circuitJson.bytecode as any, {
        threads: 2,
      });

      // Generate witness and proof
      const { witness } = await noir.execute(noirInput);
      const { proof, publicInputs } = await backend.generateProof(witness);

      const vk = await backend.getVerificationKey();

      this.actuator.showProofMessage("Verifying proof...");

      //   Send to backend for verification
      const res = await fetch("/api/relayer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proof: proof,
          publicInputs: publicInputs,
          vk: Buffer.from(vk).toString("base64"),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        this.actuator.showProofMessage('✅ Proof verified successfully!', `https://zkverify-testnet.subscan.io/extrinsic/${data.txHash}`);
        if (data.txHash) {
          console.log(data.txHash);

          const account = getAccount(config);
          const userAddress = account.address;

          if (userAddress) {
            const { error } = await supabase
              .from('leaderboard')
              .insert([
                { 
                  address: userAddress, 
                  score: this.score, 
                  proof_url: `https://zkverify-testnet.subscan.io/extrinsic/${data.txHash}`,
                  date: new Date().toISOString(),
                },
              ]);

            if (error) {
              console.error('Error inserting into Supabase:', error);
            } else {
              console.log('Leaderboard updated successfully!');
            }
          } else {
            console.log('User address not found.');
          }
        }
      } else {
        this.actuator.showProofMessage('❌ Proof verification failed.');
      }
    } catch (error) {
      console.error("Error generating proof or verifying:", error);
      this.actuator.showProofMessage(
        "❌ Error generating or verifying proof. Please check your inputs and try again."
      );
    } finally {
      // No need to log here, as messages are shown in UI
    }
  }
}
