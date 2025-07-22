
'use client';
import GameContainer from '@/components/GameContainer';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <>
    <div className='connect-button-container'>
      <ConnectButton />
    </div>
    <div className="container">
      <div className="heading">
        <h1 className="title">2048</h1>
        <div className="scores-container">
          <div className="score-container">0</div>
          <div className="best-container">0</div>
        </div>
      </div>

      <div className="above-game">
        <a className="restart-button">New Game</a>
      </div>

      <GameContainer />

      <div className="footer">
        <p>
          <strong className="important">How to play:</strong> Use your{' '}
          <strong>arrow keys</strong> to move the tiles. When two tiles with the same
          number touch, they <strong>merge into one!</strong>
        </p>
      </div>
    </div>
    </>
  );
}
