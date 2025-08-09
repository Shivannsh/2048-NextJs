pub fn main(
    final_score: pub Field,     // Public: claimed final score
    total_moves: Field,         // Private: claimed number of moves
    actual_moves: Field,        // Private: actual number of moves (<= 100)
    actual_score: Field,        // Private: actual score
    address: pub Field          // Public: wallet address (as Field)
) {
   
    print(address);
    // Check the final score
    assert(actual_score == final_score);
    assert(total_moves == actual_moves);
    assert(address != 0);  // Ensure address is not zero
}