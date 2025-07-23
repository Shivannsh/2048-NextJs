import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  // console.log('API: /api/save-prover-data received a request.');
  try {
    const proverData = await request.json();
    // console.log('API: Received proverData:', JSON.stringify(proverData, null, 2));

    const outputPath = path.resolve(process.cwd(), 'game_prover_data.json');
    // console.log('API: Attempting to write to:', outputPath);

    fs.writeFileSync(outputPath, JSON.stringify(proverData, null, 2), 'utf-8');
    // console.log(`API: Prover data saved successfully to ${outputPath}`);
    return NextResponse.json({ message: 'Prover data saved successfully' });
  } catch (error) {
    // console.error('API: Error saving prover data:', error);
    return NextResponse.json({ message: 'Error saving prover data' }, { status: 500 });
  }
}