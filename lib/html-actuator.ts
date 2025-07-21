
import { Grid } from './grid';
import { Tile } from './tile';

export class HTMLActuator {
  tileContainer: HTMLElement;
  scoreContainer: HTMLElement;
  bestContainer: HTMLElement;
  messageContainer: HTMLElement;
  score: number;

  constructor() {
    this.tileContainer = document.querySelector('.tile-container')!;
    this.scoreContainer = document.querySelector('.score-container')!;
    this.bestContainer = document.querySelector('.best-container')!;
    this.messageContainer = document.querySelector('.game-message')!;
    this.score = 0;
  }

  actuate(grid: Grid, metadata: any) {
    window.requestAnimationFrame(() => {
      this.clearContainer(this.tileContainer);

      grid.cells.forEach((column) => {
        column.forEach((cell) => {
          if (cell) {
            this.addTile(cell);
          }
        });
      });

      this.updateScore(metadata.score);
      this.updateBestScore(metadata.bestScore);

      if (metadata.terminated) {
        if (metadata.over) {
          this.message(false); // You lose
        } else if (metadata.won) {
          this.message(true); // You win!
        }
      }
    });
  }

  continueGame() {
    this.clearMessage();
  }

  clearContainer(container: HTMLElement) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  addTile(tile: Tile) {
    const wrapper = document.createElement('div');
    const inner = document.createElement('div');
    const position = tile.previousPosition || { x: tile.x, y: tile.y };
    const positionClass = this.positionClass(position);

    const classes = ['tile', `tile-${tile.value}`, positionClass];

    if (tile.value > 2048) classes.push('tile-super');

    this.applyClasses(wrapper, classes);

    inner.classList.add('tile-inner');
    inner.textContent = tile.value.toString();

    if (tile.previousPosition) {
      window.requestAnimationFrame(() => {
        classes[2] = this.positionClass({ x: tile.x, y: tile.y });
        this.applyClasses(wrapper, classes);
      });
    } else if (tile.mergedFrom) {
      classes.push('tile-merged');
      this.applyClasses(wrapper, classes);

      tile.mergedFrom.forEach((merged) => {
        this.addTile(merged);
      });
    } else {
      classes.push('tile-new');
      this.applyClasses(wrapper, classes);
    }

    wrapper.appendChild(inner);
    this.tileContainer.appendChild(wrapper);
  }

  applyClasses(element: HTMLElement, classes: string[]) {
    element.setAttribute('class', classes.join(' '));
  }

  normalizePosition(position: { x: number; y: number }) {
    return { x: position.x + 1, y: position.y + 1 };
  }

  positionClass(position: { x: number; y: number }) {
    position = this.normalizePosition(position);
    return `tile-position-${position.x}-${position.y}`;
  }

  updateScore(score: number) {
    this.clearContainer(this.scoreContainer);

    const difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = this.score.toString();

    if (difference > 0) {
      const addition = document.createElement('div');
      addition.classList.add('score-addition');
      addition.textContent = `+${difference}`;
      this.scoreContainer.appendChild(addition);
    }
  }

  updateBestScore(bestScore: number) {
    this.bestContainer.textContent = bestScore.toString();
  }

  message(won: boolean) {
    const type = won ? 'game-won' : 'game-over';
    const message = won ? 'You win!' : 'Game over!';

    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName('p')[0].textContent = message;
  }

  clearMessage() {
    this.messageContainer.classList.remove('game-won');
    this.messageContainer.classList.remove('game-over');
  }
}
