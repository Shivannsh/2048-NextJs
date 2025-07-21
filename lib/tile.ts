
let nextId = 0;

export class Tile {
  x: number;
  y: number;
  value: number;
  id: number; // Added for unique identification
  previousPosition: { x: number; y: number } | null;
  mergedFrom: Tile[] | null;

  constructor(position: { x: number; y: number }, value: number) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;
    this.id = nextId++; // Assign a unique ID
    this.previousPosition = null;
    this.mergedFrom = null; // Tracks tiles that merged together
  }

  savePosition() {
    this.previousPosition = { x: this.x, y: this.y };
  }

  updatePosition(position: { x: number; y: number }) {
    this.x = position.x;
    this.y = position.y;
  }

  serialize() {
    return {
      position: {
        x: this.x,
        y: this.y,
      },
      value: this.value,
    };
  }
}
