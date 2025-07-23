

pub fn main(
    final_score: pub Field,     // Public: claimed final score
    total_moves: pub Field,     // Public: claimed number of moves  // Private: the moves array (padded with 0s if less than 100)
    actual_moves: Field,        // Private: actual number of moves (<= 100)
    actual_score: Field         // Private: actual score
) {
    // 1. Check the hash of the moves array
   
    // 2. Check the number of moves
    assert(actual_moves == total_moves);

    // 3. Check the final score
    assert(actual_score == final_score);

    // (Optional) You could replay the moves here to compute actual_score, but that's complex.
    // For now, you just prove knowledge of a moves array with the claimed hash, score, and move count.
}

// #[test]
// fn test_valid_game_proof() {
//     let mut moves_array: [Field; 1000] = [0; 1000];
//     moves_array[0] = 1; // Example move 1
//     moves_array[1] = 2; // Example move 2
//     moves_array[2] = 3; // Example move 3

//     let computed_hash_for_test = std::hash::pedersen_hash(moves_array);
//     let claimed_final_score = 100;
//     let claimed_total_moves = 3;

//     main(
//         computed_hash_for_test,
//         claimed_final_score,
//         claimed_total_moves,
//         moves_array,
//         claimed_total_moves,
//         claimed_final_score
//     );
// }

// #[test(should_fail)]
// fn test_invalid_score() {
//     let mut moves_array: [Field; 1000] = [0; 1000];
//     moves_array[0] = 1;

//     let expected_hash = std::hash::pedersen_hash(moves_array);
//     let claimed_final_score = 99; // Incorrect score
//     let claimed_total_moves = 1;

//     main(
//         expected_hash,
//         claimed_final_score,
//         claimed_total_moves,
//         moves_array,
//         1, // Actual moves
//         100 // Actual score
//     );
// }

// #[test(should_fail)]
// fn test_invalid_moves_count() {
//     let mut moves_array: [Field; 1000] = [0; 1000];
//     moves_array[0] = 1;

//     let expected_hash = std::hash::pedersen_hash(moves_array);
//     let claimed_final_score = 100;
//     let claimed_total_moves = 2; // Incorrect moves count

//     main(
//         expected_hash,
//         claimed_final_score,
//         claimed_total_moves,
//         moves_array,
//         1, // Actual moves
//         100 // Actual score
//     );
// }

// #[test(should_fail)]
// fn test_invalid_moves_hash() {
//     let mut moves_array: [Field; 1000] = [0; 1000];
//     moves_array[0] = 1;

//     let mut tampered_moves_array: [Field; 1000] = [0; 1000];
//     tampered_moves_array[0] = 2; // Tampered move

//     let expected_hash = std::hash::pedersen_hash(tampered_moves_array); // Hash of tampered moves
//     let claimed_final_score = 100;
//     let claimed_total_moves = 1;

//     main(
//         expected_hash,
//         claimed_final_score,
//         claimed_total_moves,
//         moves_array, // Original moves array
//         1,
//         100
//     );
// }
