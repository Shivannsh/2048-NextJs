import { GameManager } from './game-manager';
import { Tile } from './tile';

// Mock dependencies
class DummyInputManager {
  on() {}
}
class DummyActuator {
  actuate() {}
  continueGame() {}
}
class DummyStorageManager {
  clearGameState() {}
  getGameState() { return null; }
  setGameState() {}
  getBestScore() { return 0; }
  setBestScore() {}
}

describe('GameManager win condition', () => {
  it('should set won=true when a 2048 tile is created', () => {
    const game = new GameManager(4, DummyInputManager, DummyActuator, DummyStorageManager);
    // Clear the board and insert a 1024 tile at (0,0) and (1,0)
    game.grid = game.grid || { cells: [] };
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        game.grid.cells[x][y] = null;
      }
    }
    const tile1 = new Tile({ x: 0, y: 0 }, 1024);
    const tile2 = new Tile({ x: 1, y: 0 }, 1024);
    game.grid.insertTile(tile1);
    game.grid.insertTile(tile2);
    // Move right to merge them into 2048
    game.move(1); // 1 = right
    expect(game.won).toBe(true);
  });
}); 