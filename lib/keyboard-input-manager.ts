
export class KeyboardInputManager {
  events: { [key: string]: Function[] };
  eventTouchstart: string;
  eventTouchmove: string;
  eventTouchend: string;

  constructor() {
    this.events = {};

    if ("msPointerEnabled" in window.navigator && (window.navigator as any).msPointerEnabled) {
      this.eventTouchstart = 'MSPointerDown';
      this.eventTouchmove = 'MSPointerMove';
      this.eventTouchend = 'MSPointerUp';
    } else {
      this.eventTouchstart = 'touchstart';
      this.eventTouchmove = 'touchmove';
      this.eventTouchend = 'touchend';
    }

    this.listen();
  }

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event: string, data?: any) {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(data);
      });
    }
  }

  listen() {
    const map: { [key: number]: number } = {
      38: 0, // Up
      39: 1, // Right
      40: 2, // Down
      37: 3, // Left
      75: 0, // Vim up
      76: 1, // Vim right
      74: 2, // Vim down
      72: 3, // Vim left
      87: 0, // W
      68: 1, // D
      83: 2, // S
      65: 3, // A
    };

    document.addEventListener('keydown', (event) => {
      const modifiers =
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      const mapped = map[event.which];

      if (!modifiers) {
        if (mapped !== undefined) {
          event.preventDefault();
          this.emit('move', mapped);
        }
      }

      if (!modifiers && event.which === 82) {
        this.restart.call(this, event);
      }
    });

    this.bindButtonPress('.restart-button', this.restart);

    let touchStartClientX: number, touchStartClientY: number;
    const gameContainer = document.getElementsByClassName(
      'game-container'
    )[0] as HTMLElement;

    gameContainer.addEventListener(this.eventTouchstart, (event: any) => {
      if (
        (!("msPointerEnabled" in window.navigator && (window.navigator as any).msPointerEnabled) && event.touches.length > 1) ||
        (event.targetTouches && event.targetTouches.length > 1)
      ) {
        return; // Ignore if touching with more than 1 finger
      }

      if ("msPointerEnabled" in window.navigator && (window.navigator as any).msPointerEnabled) {
        touchStartClientX = event.pageX;
        touchStartClientY = event.pageY;
      } else {
        touchStartClientX = event.touches[0].clientX;
        touchStartClientY = event.touches[0].clientY;
      }

      event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchmove, (event) => {
      event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchend, (event: any) => {
      if (
        (!("msPointerEnabled" in window.navigator && (window.navigator as any).msPointerEnabled) && event.touches.length > 0) ||
        (event.targetTouches && event.targetTouches.length > 0)
      ) {
        return; // Ignore if still touching with one or more fingers
      }

      let touchEndClientX: number, touchEndClientY: number;

      if ("msPointerEnabled" in window.navigator && (window.navigator as any).msPointerEnabled) {
        touchEndClientX = event.pageX;
        touchEndClientY = event.pageY;
      } else {
        touchEndClientX = event.changedTouches[0].clientX;
        touchEndClientY = event.changedTouches[0].clientY;
      }

      const dx = touchEndClientX - touchStartClientX;
      const absDx = Math.abs(dx);

      const dy = touchEndClientY - touchStartClientY;
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 10) {
        this.emit('move', absDx > absDy ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0);
      }
    });
  }

  restart(event: Event) {
    event.preventDefault();
    this.emit('restart');
  }

  keepPlaying(event: Event) {
    event.preventDefault();
    this.emit('keepPlaying');
  }

  bindButtonPress(selector: string, fn: (event: Event) => void) {
    const button = document.querySelector(selector);
    if (button) {
      button.addEventListener('click', fn.bind(this));
      button.addEventListener(this.eventTouchend, fn.bind(this));
    }
  }
}
