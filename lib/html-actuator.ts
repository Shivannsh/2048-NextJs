
import { Grid } from './grid';
import { Tile } from './tile';

export class HTMLActuator {
  tileContainer: HTMLElement;
  scoreContainer: HTMLElement;
  bestContainer: HTMLElement;
  messageContainer: HTMLElement;
  score: number;
  tileElements: { [key: number]: HTMLElement }; // Map to store tile elements
  gameManager: any;

  constructor() {
    this.tileContainer = document.querySelector('.tile-container')!;
    this.scoreContainer = document.querySelector('.score-container')!;
    this.bestContainer = document.querySelector('.best-container')!;
    this.messageContainer = document.querySelector('.game-message')!;
    this.score = 0;
    this.tileElements = {}; // Initialize the map
  }

  actuate(grid: Grid, metadata: any, gameManager?: any) {
    this.gameManager = gameManager;
    window.requestAnimationFrame(() => {
      const currentTileElements: { [key: number]: HTMLElement } = {};

      grid.cells.forEach((column) => {
        column.forEach((cell) => {
          if (cell) {
            this.addTile(cell, currentTileElements);
          }
        });
      });

      // Remove old tiles
      for (const id in this.tileElements) {
        if (!(parseInt(id) in currentTileElements)) {
          const element = this.tileElements[parseInt(id)];
          this.tileContainer.removeChild(element);
          delete this.tileElements[parseInt(id)];
        }
      }

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

  addTile(tile: Tile, currentTileElements: { [key: number]: HTMLElement }) {
    let wrapper = this.tileElements[tile.id];
    let inner: HTMLElement;

    if (wrapper) {
      // Update existing tile
      inner = wrapper.querySelector('.tile-inner')!;
      currentTileElements[tile.id] = wrapper;
    } else {
      // Create new tile
      wrapper = document.createElement('div');
      inner = document.createElement('div');
      inner.classList.add('tile-inner');
      wrapper.appendChild(inner);
      this.tileContainer.appendChild(wrapper);
      this.tileElements[tile.id] = wrapper;
      currentTileElements[tile.id] = wrapper;
    }

    const position = tile.previousPosition || { x: tile.x, y: tile.y };
    const positionClass = this.positionClass(position);

    const classes = ['tile', `tile-${tile.value}`, positionClass];

    if (tile.value > 2048) classes.push('tile-super');

    this.applyClasses(wrapper, classes);

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
        this.addTile(merged, currentTileElements);
      });
    } else {
      classes.push('tile-new');
      this.applyClasses(wrapper, classes);
    }
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

    this.showProofMessage(message);

    if (this.inputManager) {
      const retryButton = this.messageContainer.querySelector('.retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', this.inputManager.restart.bind(this.inputManager));
      }
    }
  }

  clearMessage() {
    this.messageContainer.classList.remove('game-won');
    this.messageContainer.classList.remove('game-over');
    this.messageContainer.innerHTML = '<p></p><div class="lower"></div>'; // Reset content
  }

  showProofMessage(message: string, url?: string) {
    this.messageContainer.classList.add('game-over'); // Use game-over class for styling
    this.messageContainer.getElementsByTagName('p')[0].textContent = message;

    const lowerDiv = this.messageContainer.querySelector('.lower')!;
    lowerDiv.innerHTML = ''; // Clear previous content

    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.textContent = 'View Proof on Explorer';
      link.target = '_blank';
      lowerDiv.appendChild(link);
    } else if (this.gameManager) { // Only show button if gameManager is available
      if (message === 'Game over!' || message === 'You win!') {
        const generateProofButton = document.createElement('button');
        generateProofButton.innerText = 'Generate Proof';
        generateProofButton.classList.add('generate-proof-button');
        lowerDiv.appendChild(generateProofButton);
        generateProofButton.addEventListener('click', () => {
          this.gameManager.generateProof();
        });
      }
    }
  }
}
