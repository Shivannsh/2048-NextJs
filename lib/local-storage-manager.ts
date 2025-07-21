
export class LocalStorageManager {
  bestScoreKey: string;
  gameStateKey: string;
  storage: Storage;

  constructor() {
    this.bestScoreKey = 'bestScore';
    this.gameStateKey = 'gameState';

    const supported = this.localStorageSupported();
    this.storage = supported ? window.localStorage : window.fakeStorage;
  }

  localStorageSupported() {
    const testKey = 'test';
    try {
      const storage = window.localStorage;
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  getBestScore() {
    return parseInt(this.storage.getItem(this.bestScoreKey) || '0', 10);
  }

  setBestScore(score: number) {
    this.storage.setItem(this.bestScoreKey, score.toString());
  }

  getGameState() {
    const stateJSON = this.storage.getItem(this.gameStateKey);
    return stateJSON ? JSON.parse(stateJSON) : null;
  }

  setGameState(gameState: any) {
    this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
  }

  clearGameState() {
    this.storage.removeItem(this.gameStateKey);
  }
}

declare global {
  interface Window {
    fakeStorage: any;
  }
}
