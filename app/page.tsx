
'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import GameContainer from '@/components/GameContainer';
import Leaderboard from '@/components/Leaderboard';

export default function Home() {
  return (
    <div className="container">
      <div className="heading" id='overall-heading'>
        <h1 className="title" id='2048-title'>2048</h1>
        <div className="scores-container">
          <div className="score-container">0</div>
          <div className="best-container">0</div>
          <ConnectButton />
        </div>
      </div>

      <div className="above-game">
        <p className="game-intro">
          Join the numbers and get to the <strong>2048 tile!</strong>
        </p>
        <a className="restart-button">New Game</a>
      </div>

      <GameContainer />
      <Leaderboard />

      <p className="game-explanation">
        <strong className="important">How to play:</strong> Use your{' '}
        <strong>arrow keys</strong> to move the tiles. When two tiles with the same
        number touch, they <strong>merge into one!</strong>
      </p>
    </div>
  );
}
