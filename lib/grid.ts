
import { Tile } from './tile';

export class Grid {
  size: number;
  cells: (Tile | null)[][];

  constructor(size: number, previousState: any = null) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
  }

  empty() {
    const cells: (Tile | null)[][] = [];
    for (let x = 0; x < this.size; x++) {
      const row: (Tile | null)[] = [];
      for (let y = 0; y < this.size; y++) {
        row.push(null);
      }
      cells.push(row);
    }
    return cells;
  }

  fromState(state: any) {
    const cells: (Tile | null)[][] = [];
    for (let x = 0; x < this.size; x++) {
      const row: (Tile | null)[] = [];
      for (let y = 0; y < this.size; y++) {
        const tile = state[x][y];
        row.push(tile ? new Tile(tile.position, tile.value) : null);
      }
      cells.push(row);
    }
    return cells;
  }

  randomAvailableCell() {
    const cells = this.availableCells();
    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
    return null;
  }

  availableCells() {
    const cells: { x: number; y: number }[] = [];
    this.eachCell((x, y, tile) => {
      if (!tile) {
        cells.push({ x, y });
      }
    });
    return cells;
  }

  eachCell(callback: (x: number, y: number, tile: Tile | null) => void) {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  }

  cellsAvailable() {
    return !!this.availableCells().length;
  }

  cellAvailable(cell: { x: number; y: number }) {
    return !this.cellOccupied(cell);
  }

  cellOccupied(cell: { x: number; y: number }) {
    return !!this.cellContent(cell);
  }

  cellContent(cell: { x: number; y: number }) {
    if (this.withinBounds(cell)) {
      return this.cells[cell.x][cell.y];
    }
    return null;
  }

  insertTile(tile: Tile) {
    this.cells[tile.x][tile.y] = tile;
  }

  removeTile(tile: Tile) {
    this.cells[tile.x][tile.y] = null;
  }

  withinBounds(position: { x: number; y: number }) {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    );
  }

  serialize() {
    const cellState = [];
    for (let x = 0; x < this.size; x++) {
      const row = [];
      for (let y = 0; y < this.size; y++) {
        row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
      }
      cellState.push(row);
    }
    return {
      size: this.size,
      cells: cellState,
    };
  }
}
