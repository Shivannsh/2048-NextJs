const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function generateProverTomlForCircuit2048() {
  // 1. Read proverData from game_prover_data.json
  const proverDataFilePath = path.resolve(__dirname, 'game_prover_data.json');
  let proverData;
  try {
    proverData = JSON.parse(fs.readFileSync(proverDataFilePath, 'utf-8'));
    console.log("Successfully loaded prover data from game_prover_data.json");
  } catch (error) {
    console.error(`Error reading prover data from ${proverDataFilePath}:`, error);
    console.log("Please ensure you have played a game and the data has been saved.");
    return;
  }

  let moves = proverData.moves;

  // Pad the moves array to 1000 elements with zeros for the Noir circuit
  const MAX_MOVES_CIRCUIT = 1000;
  if (moves.length < MAX_MOVES_CIRCUIT) {
    moves = moves.concat(Array(MAX_MOVES_CIRCUIT - moves.length).fill(0));
  }

  console.log("Length of padded moves array:", moves.length);

  // 2. Ensure hasher_circuit exists and is compiled
  const hasherCircuitDir = path.resolve(__dirname, 'hasher_circuit');
  const hasherCircuitTargetPath = path.join(hasherCircuitDir, 'target', 'hasher_circuit.json');

  if (!fs.existsSync(hasherCircuitTargetPath)) {
    console.log("Hasher circuit not found or not compiled. Creating and compiling...");
    execSync(`nargo new hasher_circuit`, { cwd: __dirname });

    // Write main.nr for the hasher circuit
    const hasherMainNrContent = `use dep::std::hash::pedersen_hash;\n\nfn main(moves: [Field; 1000]) -> pub Field {\n    pedersen_hash(moves)\n}\n\n#[test]\nfn test_pedersen_hash_simple() {\n    let mut moves_arr = [0; 1000];\n    moves_arr[0] = 1;\n    moves_arr[1] = 2;\n    moves_arr[2] = 3;\n\n    let expected_hash = pedersen_hash(moves_arr);\n    let actual_hash = main(moves_arr);\n    assert(actual_hash == expected_hash);\n}\n`;
    fs.writeFileSync(path.join(hasherCircuitDir, 'src/main.nr'), hasherMainNrContent);

    // Write Nargo.toml for the hasher circuit
    const hasherNargoTomlContent = `[package]\nname = "hasher_circuit"\ntype = "bin"\nauthors = [""]\n\n[dependencies]\n`;
    fs.writeFileSync(path.join(hasherCircuitDir, 'Nargo.toml'), hasherNargoTomlContent);

    // Compile the hasher circuit
    execSync(`nargo compile`, { cwd: hasherCircuitDir });
    console.log("Hasher circuit created and compiled.");
  } else {
    console.log("Hasher circuit already exists and is compiled. Skipping creation.");
  }

  // 3. Write Prover.toml for the hasher circuit
  const hasherProverTomlContent = `moves = [${moves.map(m => `"${m.toString()}"`).join(', ')}]\n`;
  fs.writeFileSync(path.join(hasherCircuitDir, 'Prover.toml'), hasherProverTomlContent);

  // 4. Execute the hasher circuit to get the hash
  console.log("Executing hasher circuit to get Pedersen hash...");
  const hasherOutput = execSync(`nargo execute`, { cwd: hasherCircuitDir }).toString();
  
  // Extract the hash from the output
  const hashMatch = hasherOutput.match(/Circuit output: Field\((.*?)\)/);
  let pedersenHash = "";
  if (hashMatch && hashMatch[1]) {
    pedersenHash = hashMatch[1];
    console.log("Calculated Pedersen Hash:", pedersenHash);
  } else {
    throw new Error("Could not extract Pedersen hash from hasher circuit output.");
  }

  // 5. Generate Prover.toml for circuit_2048
  const circuit2048ProverTomlPath = path.resolve(__dirname, 'circuit_2048/Prover.toml');

  let tomlContent = '';
  tomlContent += `moves_hash = "${pedersenHash}"\n`;
  tomlContent += `final_score = ${proverData.final_score}\n`;
  tomlContent += `total_moves = ${proverData.total_moves}\n`;
  tomlContent += `moves = [${moves.map(m => `"${m.toString()}"`).join(', ')}]\n`;
  tomlContent += `actual_moves = ${proverData.actual_moves}\n`;
  tomlContent += `actual_score = ${proverData.actual_score}\n`;

  fs.writeFileSync(circuit2048ProverTomlPath, tomlContent, 'utf-8');
  console.log(`Prover.toml for circuit_2048 written to ${circuit2048ProverTomlPath}`);
}

generateProverTomlForCircuit2048().catch(console.error);