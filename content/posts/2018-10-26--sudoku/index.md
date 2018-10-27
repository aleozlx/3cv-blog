---
title: A Sudoku Solver
subTitle: Writing a Sudoku solver using Rust
cover: puzzle.jpg
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

Starting off to solve this puzzle, we will import the sample data by hard coding them into the program. The valid values to appear in this array only range from 0 to 9, so we will use an 8-bit vector `Vec<u8>`.

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
For the total 9x9 grid with each variable taking on values from 1 to 9, we will define a 9x9x9 array, called `dom` as in domain, which has 3 conceptual axes `(val, row, col)`, with each cell taking either 0=no or 1=yes representing the feasibility of having `val` filled into cell `(row, col)`.
If you are unfamiliar with multi-dimensional arrays, I'll show you how this works in a moment.

Here is the array `dom`, initialized with all 1s:

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

After running this code, you should get an output of the initial array `x`.

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

## Algorithm

In order to quantitatively discuss about algorithm complexity, we assume that the complexity of the problem is only charactrized by number of vacancies `n`.
Here I will introduce a linear time $O(n)$ algorithm, where each iteration of the loop will fill in at least one vacancy if a solution exists at all.
Some boiler plate code for this linear time algorithm looks like so:

```rust
for _k in 0..n {
  // Continue here...
}
```

### Step 1: Setting domain of non-vacant cells to empty set (all zeros).

Since a non-vacant cell cannot be further filled in with any other number,
we will empty the domain for that cell.
This logic applies to all the cells so it will begin with a double for-loop traversing all cells from array `x`.

```rust
for i in 0..9 {
    for j in 0..9 {
        let v = x[i*9+j];
        if v>0 { // not vacant
            dom_zero(&mut dom, i, j);

            // Continue here...
        }
    }
}
```

If you have not worked with multi-dimensional arrays much, this will be a good practice.
Here's how to clear the domain for cell `(i, j)`:

```rust
fn dom_zero(dom: &mut [u8], i: usize, j: usize) {
    let pt = i * 9 + j;
    for offset in (0..9).map(|x| {x*81}).into_iter() {
        dom[pt+offset] = 0;
    }
}
```

> Note: Most variables in Rust follows the "move semantic" upon passing or assignment, but the primitive types like `usize` have `Copy` trait to avoid transfering the ownership.

`pt` points towards the cell location in each feasibility plane, along whose perpendicular direction the axis of variable domain has stride of 81.
We will be traversing the variable domain for each cell `(i, j)` and set it to 0 (impossible).

> e.g. You may print out all the possible location for number 3 like so
> ```rust
> let k = 3-1;
> debug_view(&dom[(k*81)..((k+1)*81)]);
> ```
> At this moment, any location that is not vacant would be feasible.
> ```
> =========
> 1 1 0 1 1 1 0 1 0
> 0 1 1 1 1 0 1 0 1
> 1 1 1 0 1 0 0 1 1
> 1 0 1 1 0 0 1 1 0
> 0 0 1 1 1 1 1 0 0
> 1 1 1 1 1 1 1 1 1
> 1 1 1 0 1 0 1 1 1
> 0 1 0 1 0 1 1 1 1
> 1 1 1 0 1 1 1 0 0
> =========
> ```

### Step 2: Remove value of non-vacant cells from domains of cells in the same row, column or block.

First we will need to slice out the feasibility plane corresponding to the value that occupies the cell.

```rust
let idx = (v - 1) as usize;
let view = &mut dom[idx*81..(idx + 1)*81];

// Continue here...
```

Then we eliminate values from domains according to the constraints that no duplicate numbers are allowed in any row, any column or any 3x3 blocks.

```rust
let idx = (v - 1) as usize;
let view = &mut dom[idx*81..(idx + 1)*81];
eliminate_h(view, i);
eliminate_v(view, j);
eliminate_b(view, i, j);
```

Here are the direct implementation of the constraints:

```rust
fn eliminate_h(dom_view: &mut [u8], i: usize) {
    let row = i * 9;
    for offset in 0..9 {
        dom_view[row+offset] = 0;
    }
}

fn eliminate_v(dom_view: &mut [u8], j: usize) {
    let col = j;
    for offset in (0..9).map(|x| {x*9}).into_iter() {
        dom_view[col+offset] = 0;
    }
}

fn eliminate_b(dom_view: &mut [u8], i: usize, j: usize) {
    let blk = i / 3 * 3 * 9 + j / 3 * 3;
    for &offset in [0, 1, 2, 9, 10, 11, 18, 19, 20].iter() {
        dom_view[blk+offset] = 0;
    }
}
```

Now we are performing some analysis that is not all trivial!
Let's print all the possible location of 3 again:

```
=========
0 0 0 0 0 0 0 0 0
0 1 1 1 1 0 0 0 0
1 1 1 0 1 0 0 0 0
1 0 1 1 0 0 0 1 0
0 0 1 1 1 0 0 0 0
1 1 1 1 1 0 0 1 0
0 0 0 0 0 0 0 0 0
0 1 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0
=========
```

### Step 3: Finalize variables where the domain is of size 1 (i.e. we don't have other other options).

Since we have formulated it as CSP, naturally when the domain is reduced to size 1.
We would have no other options but to assign the variable permanently.

We will jump out of the double for-loop and implement this idea:

```rust
for i in 0..9 {
    for j in 0..9 {
      // ... omitting the previous double for-loop ...
    }
}

for i in 0..9 {
    for j in 0..9 {
        let ref mut out = 0u8;
        count_possibilities(&dom, out, i, j); // Count options

        if *out == 1 { // If there is only one option,
            let v = dom_get(&dom, i, j); // which exactly is it?
            println!("[{}, {}] ← {} (constraint)", i+1, j+1, v);
            x[i*9+j] = v;
        }
    }
}
```

We can run that and see domains narrow down by CSP elimination.

```
[1, 5] ← 4 (constraint)
[1, 6] ← 9 (constraint)
[1, 4] ← 6 (constraint)
[2, 4] ← 3 (constraint)
[2, 5] ← 7 (constraint)
[2, 9] ← 6 (constraint)
[3, 5] ← 2 (constraint)
=========
0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0
1 1 1 0 0 0 0 0 0
1 0 1 0 0 0 0 1 0
0 0 1 0 1 0 0 0 0
1 1 1 0 1 0 0 1 0
0 0 0 0 0 0 0 0 0
0 1 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0
=========
```

### Step 4: Assign by counting principles.

However the constraints have allowed us to narrow down possible locations for each numbers, we didn't solve the problem entirely.
That is because another important piece of logic is missing.

**Observe the 2nd to the last row where there is only one possible location for 3, but our algorithm still hesitate about it!**

We know that no duplicate numbers are allowed in each row, which means each number has to distinctively go somewhere in that row because our number of values is equal to the number of cells in each row, which is 9.
This is a special case of the [Pigeonhole Principle](https://en.wikipedia.org/wiki/Pigeonhole_principle), a famous counting argument.
Therefore, when a number has only one possible location to go in any row, it has to go there.

The same argument applies to columns and blocks. And these are **sufficient conditions** to directly set variables to a certain value, which is what's driving this whole algorithm do execute in linear time.
There will be no solution space searching, but each iteration, we will knock out at least one vacancy.

```rust
for i in 0..9 {
    for j in 0..9 {
      // ... omitting the previous double for-loop ...
    }
}

for idx in 0..9 {
    for i in 0..9 {
        let ref mut out = 0u8;
        let view = &dom[idx*81..(idx + 1)*81];
        count_h(view, out, i); // Count possible locations in a row

        if *out == 1 { // If there is only one location,
            let j = dom_get_h(view, i); // where exactly is that?
            let v = (idx + 1) as u8;
            println!("[{}, {}] ← {} (h scan)", i+1, j+1, v);
            x[i*9+j] = v; // Assign to x
        }
    }
}
```

We only need to assign to array `x` because in the next iteration of vacancy sweep, the domains will be eliminated by the algorithms we wrote before.

To make this work, we have to implement `count_h()` and `dom_get_h()`.

```rust
fn count_h(dom_view: &[u8], out: &mut u8, i: usize) {
    let mut s = 0u8;
    let row = i * 9;
    for offset in 0..9 {
        s += dom_view[row+offset];
    }
    *out = s;
}

fn dom_get_h(dom_view: &[u8], i: usize) -> usize {
    let row = i * 9;
    for j in 0..9 {
        if dom_view[row+j] > 0 {
            return j;
        }
    }
    unreachable!();
}
```

Giving this a test, we can observe that vacancy has been knocked out! (I also printed the new `x` array at the end)

```
[1, 5] ← 4 (constraint)
[1, 1] ← 1 (h scan)
[9, 7] ← 1 (h scan)
[3, 5] ← 2 (h scan)
[8, 2] ← 3 (h scan)
[1, 6] ← 9 (constraint)
[5, 5] ← 1 (h scan)
[1, 4] ← 6 (h scan)
[2, 4] ← 3 (constraint)
[6, 9] ← 1 (h scan)
[2, 5] ← 7 (constraint)
[5, 3] ← 3 (h scan)
[6, 7] ← 6 (h scan)
[2, 9] ← 6 (constraint)
[3, 1] ← 3 (h scan)
[4, 8] ← 3 (h scan)
[5, 6] ← 8 (h scan)
[6, 5] ← 3 (h scan)
[3, 3] ← 6 (h scan)
[4, 7] ← 7 (h scan)
[9, 5] ← 8 (h scan)
[7, 5] ← 5 (constraint)
[7, 1] ← 6 (h scan)
[6, 6] ← 7 (h scan)
=========
0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0
=========
=========
1 0 7 6 4 9 3 0 2
2 0 0 3 7 5 0 1 6
3 0 6 8 2 1 4 0 0
0 1 0 0 9 6 7 3 8
7 6 3 0 1 8 0 4 9
0 0 0 0 3 7 6 0 1
6 0 0 1 5 3 0 0 0
8 3 1 0 6 0 0 0 0
0 0 0 7 8 0 1 6 3
=========
```

Time to implement the same for columns and blocks!

```rust
  let mut mat_p = vec![0; 81]; // Here is some scratch space
    // to facilitate parallelism in the future!
    // All the for-loops here don't have data dependency
    // and can be fully parallelized.

  for idx in 0..9 {
      for j in 0..9 {
          let out = &mut mat_p[idx*9+j];
          let view = &dom[idx*81..(idx + 1)*81];
          count_v(view, out, j);

          if *out == 1 {
              let i = dom_get_v(view, j);
              let v = (idx + 1) as u8;
              println!("[{}, {}] ← {} (v scan)", i+1, j+1, v);
              x[i*9+j] = v;
          }
      }
  }

  for idx in 0..9 {
      for (i_blk, &blk) in [0, 3, 6, 27, 30, 33, 54, 57, 60].iter().enumerate() {
          let out = &mut mat_p[idx*9+i_blk];
          let view = &dom[idx*81..(idx + 1)*81];
          count_b(view, out, blk);

          if *out == 1 {
              let (i, j) = dom_get_b(view, blk);
              let v = (idx + 1) as u8;
              println!("[{}, {}] ← {} (blk)", i+1, j+1, v);
              x[i*9+j] = v;
          }
      }
  }
```

```rust
fn count_v(dom_view: &[u8], out: &mut u8, j: usize) {
    let mut s = 0u8;
    let col = j;
    for offset in (0..9).map(|x| {x*9}).into_iter() {
        s += dom_view[col+offset];
    }
    *out = s;
}

fn dom_get_v(dom_view: &[u8], j: usize) -> usize {
    let col = j;
    for i in 0..9 {
        if dom_view[i*9+col] > 0 {
            return i;
        }
    }
    unreachable!();
}

fn count_b(dom_view: &[u8], out: &mut u8, blk: usize) {
    let mut s = 0u8;
    for &offset in [0, 1, 2, 9, 10, 11, 18, 19, 20].iter() {
        s += dom_view[blk+offset];
    }
    *out = s;
}

fn dom_get_b(dom_view: &[u8], blk: usize) -> (usize, usize) {
    for &offset in [0, 1, 2, 9, 10, 11, 18, 19, 20].iter() {
        let ptr = blk+offset;
        if dom_view[ptr] > 0 {
            return (ptr / 9, ptr % 9);
        }
    }
    unreachable!();
}
```

In the new testing results, we can see that all cells have been filled in.
The algorithm has shown the entire steps.

```
[1, 5] ← 4 (constraint)
[1, 1] ← 1 (h scan)
[9, 7] ← 1 (h scan)
[3, 5] ← 2 (h scan)
[8, 2] ← 3 (h scan)
[1, 1] ← 1 (v scan)
[6, 9] ← 1 (v scan)
[6, 6] ← 7 (v scan)
[1, 1] ← 1 (blk)
[9, 7] ← 1 (blk)
[3, 5] ← 2 (blk)
[8, 2] ← 3 (blk)
[1, 6] ← 9 (constraint)
[5, 5] ← 1 (h scan)
[1, 4] ← 6 (h scan)
[6, 7] ← 6 (h scan)
[5, 5] ← 1 (v scan)
[7, 2] ← 7 (v scan)
[2, 5] ← 7 (v scan)
[5, 5] ← 1 (blk)
[6, 7] ← 6 (blk)
[2, 5] ← 7 (blk)
[7, 2] ← 7 (blk)
[2, 4] ← 3 (constraint)
[2, 9] ← 6 (constraint)
[6, 5] ← 3 (v scan)
[8, 4] ← 9 (v scan)
[2, 4] ← 3 (blk)
[8, 4] ← 9 (blk)
[5, 3] ← 3 (h scan)
[4, 8] ← 3 (v scan)
[4, 8] ← 3 (blk)
[5, 6] ← 8 (blk)
[3, 1] ← 3 (h scan)
[4, 7] ← 7 (h scan)
[9, 5] ← 8 (h scan)
[3, 1] ← 3 (v scan)
[3, 1] ← 3 (blk)
[4, 7] ← 7 (blk)
[7, 5] ← 5 (constraint)
[3, 3] ← 6 (h scan)
[7, 5] ← 5 (v scan)
[7, 1] ← 6 (v scan)
[7, 5] ← 5 (blk)
[3, 3] ← 6 (blk)
[7, 9] ← 4 (constraint)
[8, 6] ← 4 (h scan)
[9, 6] ← 2 (constraint)
[9, 6] ← 2 (v scan)
[9, 6] ← 2 (blk)
[6, 2] ← 2 (v scan)
[7, 3] ← 2 (blk)
[6, 8] ← 5 (constraint)
[4, 4] ← 2 (h scan)
[6, 3] ← 8 (h scan)
[8, 8] ← 2 (v scan)
[5, 7] ← 2 (blk)
[6, 3] ← 8 (blk)
[1, 8] ← 8 (constraint)
[5, 4] ← 5 (constraint)
[6, 4] ← 4 (constraint)
[8, 7] ← 5 (constraint)
[1, 2] ← 5 (h scan)
[5, 4] ← 5 (h scan)
[8, 9] ← 7 (h scan)
[6, 1] ← 9 (h scan)
[6, 4] ← 4 (v scan)
[5, 4] ← 5 (v scan)
[8, 7] ← 5 (v scan)
[3, 8] ← 7 (v scan)
[6, 4] ← 4 (blk)
[3, 9] ← 5 (blk)
[5, 4] ← 5 (blk)
[8, 9] ← 7 (blk)
[6, 1] ← 9 (blk)
[2, 7] ← 9 (constraint)
[3, 2] ← 9 (constraint)
[7, 8] ← 9 (constraint)
[2, 2] ← 8 (h scan)
[7, 7] ← 8 (h scan)
[3, 2] ← 9 (h scan)
[2, 2] ← 8 (v scan)
[7, 7] ← 8 (v scan)
[7, 8] ← 9 (v scan)
[2, 2] ← 8 (blk)
[7, 7] ← 8 (blk)
[2, 7] ← 9 (blk)
[2, 3] ← 4 (constraint)
[9, 2] ← 4 (constraint)
[2, 3] ← 4 (h scan)
[9, 3] ← 9 (h scan)
[9, 2] ← 4 (v scan)
[9, 3] ← 9 (v scan)
[2, 3] ← 4 (blk)
[9, 3] ← 9 (blk)
[4, 3] ← 5 (constraint)
[9, 1] ← 5 (constraint)
[4, 1] ← 4 (h scan)
[9, 1] ← 5 (h scan)
[4, 1] ← 4 (v scan)
[4, 3] ← 5 (v scan)
[4, 1] ← 4 (blk)
[9, 1] ← 5 (blk)
=========
1 5 7 6 4 9 3 8 2
2 8 4 3 7 5 9 1 6
3 9 6 8 2 1 4 7 5
4 1 5 2 9 6 7 3 8
7 6 3 5 1 8 2 4 9
9 2 8 4 3 7 6 5 1
6 7 2 1 5 3 8 9 4
8 3 1 9 6 4 5 2 7
5 4 9 7 8 2 1 6 3
=========
```

## Conclusion

The goal of the game is to fill in all the vacancies with no duplicate numbers are allowed in any row, any column or any 3x3 blocks.
Assume a unique solution to the puzzle exists, the algorithm will knock out at least one vacancy during each iteration of sweep, which is determined unambiguously via constraint eliminations and counting principles. Therefore the algorithm will reach the accurate solution in linear time $\Theta(n)$, where $n$ is number of vacancies.