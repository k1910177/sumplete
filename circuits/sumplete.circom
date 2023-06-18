pragma circom 2.1.4;

template Sumplete(n){
    signal input solution[n][n];
    signal input puzzle[n][n];
    signal input sum[2][n];

    for(var row = 0; row < n; row++){
        var test_sum = 0;
        for(var col = 0; col < n; col++){
            solution[row][col] * (puzzle[row][col] - solution[row][col]) === 0;
            test_sum += solution[row][col];
        }
        test_sum === sum[0][row];
    }

    for(var col = 0; col < n; col++){
        var test_sum = 0;
        for(var row = 0; row < n; row++){
            test_sum += solution[row][col];
        }
        test_sum === sum[1][col];
    }
}

component main {public[puzzle, sum]} = Sumplete(3);
