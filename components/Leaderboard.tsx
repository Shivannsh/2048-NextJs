'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/database';

interface LeaderboardEntry {
  address: string;
  score: number;
  proof_url: string;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  console.log('leaderboard', leaderboard);
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const {data ,error} = await supabase.from('leaderboard').select('address,score,proof_url').order('score', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard:', error);
      } else {
        setLeaderboard(data as LeaderboardEntry[]);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Leaderboard</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Address</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={index}>
              <td>{entry.address}</td>
              <td>{entry.score}</td>
              <td>
                <a href={entry.proof_url} target="_blank" rel="noopener noreferrer">
                  Proof
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
