
'use client';
import GameContainer from '@/components/GameContainer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function Home() {
  return (
    <>
    <div className='connect-button-container'>
      <ConnectButton />
    </div>
    <div className="container">
      <div className="heading">
        <h1 className="title">2048</h1>
        <div className="above-game">
        <a className="restart-button">New Game</a>
      </div>
      </div>
      <GameContainer />
      <div className="scores-container">
          <div className="score-container">0</div>
          <div className="leaderboard-button">
            <Link href="/leaderboard">
              <button>Leaderboard</button>
            </Link>
          </div>
          <div className="best-container">0</div>
        </div>
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
