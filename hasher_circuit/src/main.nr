use dep::std::hash::pedersen_hash;

fn main(moves: [Field; 1000]) -> pub Field {
    pedersen_hash(moves)
}

#[test]
fn test_pedersen_hash_simple() {
    let mut moves_arr = [0; 1000];
    moves_arr[0] = 1;
    moves_arr[1] = 2;
    moves_arr[2] = 3;

    let expected_hash = pedersen_hash(moves_arr);
    let actual_hash = main(moves_arr);
    assert(actual_hash == expected_hash);
}
