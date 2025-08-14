
export class LocalStorageManager {
  bestScoreKey: string;
  gameStateKey: string;
  checksumKey: string;
  storage: Storage;
  private gameSessionId: string;

  constructor() {
    this.bestScoreKey = 'bestScore';
    this.gameStateKey = 'gameState';
    this.checksumKey = 'gameChecksum';
    this.gameSessionId = this.generateSessionId();

    const supported = this.localStorageSupported();
    this.storage = supported ? window.localStorage : window.fakeStorage;
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateChecksum(data: string): string {
    // Simple checksum using session ID as salt
    let hash = 0;
    const saltedData = data + this.gameSessionId;
    for (let i = 0; i < saltedData.length; i++) {
      const char = saltedData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private validateChecksum(data: string, storedChecksum: string): boolean {
    const calculatedChecksum = this.generateChecksum(data);
    return calculatedChecksum === storedChecksum;
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
    const storedChecksum = this.storage.getItem(this.checksumKey);
    
    if (!stateJSON) return null;
    
    // Validate integrity
    if (storedChecksum && !this.validateChecksum(stateJSON, storedChecksum)) {
      console.warn('🚨 Game state integrity check failed - possible tampering detected');
      this.clearGameState(); // Clear potentially tampered data
      return null;
    }
    
    try {
      const parsedState = JSON.parse(stateJSON);
      
      // Additional timestamp validation
      if (parsedState.timestamp && Date.now() - parsedState.timestamp > 72 * 60 * 60 * 1000) {
        console.warn('🚨 Game state too old - clearing');
        this.clearGameState();
        return null;
      }
      
      return parsedState;
    } catch (error) {
      console.warn('🚨 Invalid game state JSON - clearing');
      this.clearGameState();
      return null;
    }
  }

  setGameState(gameState: any) {
    // Add timestamp and session info
    const enhancedState = {
      ...gameState,
      timestamp: Date.now(),
      sessionId: this.gameSessionId
    };
    
    const stateJSON = JSON.stringify(enhancedState);
    const checksum = this.generateChecksum(stateJSON);
    
    this.storage.setItem(this.gameStateKey, stateJSON);
    this.storage.setItem(this.checksumKey, checksum);
  }

  clearGameState() {
    this.storage.removeItem(this.gameStateKey);
    this.storage.removeItem(this.checksumKey);
  }
}

declare global {
  interface Window {
    fakeStorage: any;
  }
}
