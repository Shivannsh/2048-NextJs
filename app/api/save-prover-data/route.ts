import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const proverData = await request.json();
    const outputPath = path.resolve(process.cwd(), 'game_prover_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(proverData, null, 2), 'utf-8');
    console.log(`Prover data saved to ${outputPath}`);
    return NextResponse.json({ message: 'Prover data saved successfully' });
  } catch (error) {
    console.error('Error saving prover data:', error);
    return NextResponse.json({ message: 'Error saving prover data' }, { status: 500 });
  }
}
