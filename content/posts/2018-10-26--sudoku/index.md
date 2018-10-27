---
title: A Sudoku Solver
subTitle: Writing a Sudoku solver using Rust
cover: LA.png
category: "Algorithm"
---

This time I would guide you through solving Sudoku, a puzzle enjoyed by many people to kill time.

## Background

A Sudoku looks like this (except a little nicer in some smart phone games):

```
0, 0, 7 | 0, 0, 0 | 3, 0, 2,
2, 0, 0 | 0, 0, 5 | 0, 1, 0,
0, 0, 0 | 8, 0, 1 | 4, 0, 0,
----------------------------
0, 1, 0 | 0, 9, 6 | 0, 0, 8,
7, 6, 0 | 0, 0, 0 | 0, 4, 9,
0, 0, 0 | 0, 0, 0 | 0, 0, 0,
----------------------------
0, 0, 0 | 1, 0, 3 | 0, 0, 0,
8, 0, 1 | 0, 6, 0 | 0, 0, 0,
0, 0, 0 | 7, 0, 0 | 0 ,6, 3
```

0s represent vacancies to be filled in with other numbers from 1 ~ 9.
The rule is simple: no duplicate numbers are allowed in any row, any column or any 3x3 blocks.

This article is about finding a solution to this kind of puzzles with an efficient algorithm.

## Data structure

To begin solving this puzzle, we will import the sample data by hard coding them into the program. The valid values to appear in this array only range from 0 to 9, so we will use an 8-bit vector `Vec<u8>`.

```rust
fn main() {
    let mut x = vec![
        0u8, 0, 7, 0, 0, 0, 3, 0, 2,
        2, 0, 0, 0, 0, 5, 0, 1, 0,
        0, 0, 0, 8, 0, 1, 4, 0, 0,
        0, 1, 0, 0, 9, 6, 0, 0, 8,
        7, 6, 0, 0, 0, 0, 0, 4, 9,
        0, 0, 0, 0, 0, 0 ,0, 0, 0,
        0, 0, 0, 1, 0, 3, 0, 0, 0,
        8, 0, 1, 0, 6, 0, 0, 0, 0,
        0, 0, 0 ,7, 0, 0, 0 ,6, 3
    ];

    // Counting number of vacancies
    let n: usize = x.iter().map(|i| if *i==0 {1} else {0}).sum();

    // Continue here...
}
```

To fill in the vacancies, we fomulate this as a [Constraint Satisfaction Problem (CSP)](https://en.wikipedia.org/wiki/Constraint_satisfaction_problem) where each variable that some vacancy corresponds to takes on the values in a nonempty set called its domain.
For the total 9x9 grid with each variable taking on values from 1 to 9, we will define a 9x9x9 array, called `dom` as in domain, which has 3 conceptual axes (val, row, col).
If you are unfamiliar with multi-dimensional arrays, I'll show you how this works in a moment.

Here is the array `dom`:

```rust
let mut dom = vec![1u8; 9*9*9];
```

Jumping out of the `main()` for a little bit, we will define a function that allows us to inspect these arrays at runtime.

```rust
fn debug_view(v: &[u8]) {
    println!("=========");
    for i in 0..9 {
        let r = &v[i*9..(i+1)*9];
        println!("{} {} {} {} {} {} {} {} {}", r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8]);
    }
    println!("=========");
}

fn main() {
    // ... code section omitted ...

    let mut dom = vec![1u8; 9*9*9];
    
    // Continue here...

    debug_view(&x);
}
```

After running this code, you should get an output of the initial array.

```
=========
0 0 7 0 0 0 3 0 2
2 0 0 0 0 5 0 1 0
0 0 0 8 0 1 4 0 0
0 1 0 0 9 6 0 0 8
7 6 0 0 0 0 0 4 9
0 0 0 0 0 0 0 0 0
0 0 0 1 0 3 0 0 0
8 0 1 0 6 0 0 0 0
0 0 0 7 0 0 0 6 3
=========
```

