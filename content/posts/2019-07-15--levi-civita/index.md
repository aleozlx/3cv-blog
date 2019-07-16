---
title: Levi-Civita symbol
subTitle: Levi-Civita symbol, Skew-symmetric matrix, Cross product & Determinant.
cover: LA.png
category: "Maths"
---

## Encounter

When I was 16 reading about determinants, I saw a definition that involved the notion of inversion counts.
That was not an intuitive definition when comes to considering a high dimensional determinant.

However the computation of determinant, cross product, and other tensor analyses in differential geometry and projective geometry, all have something to do with permutations.
The Levi-Civita symbol precisely captures this computational pattern and facilitates the simplification of many formulae.

## Three dimensions

**Definition:** The tensor $\epsilon_{rst}$ takes values from $\{0,1,-1\}$, where the component is equal to $-1$ when its indices are a odd permutation, $1$ when even permutation, and $0$ everywhere else.

This is easy to construct with a computer program.

```python
import itertools
import numpy as np
epsilon = np.zeros((3,3,3))
odd_perm = {(0, 2, 1), (1, 0 ,2), (2, 1, 0)}
for r, s, t in itertools.product(range(3), repeat = 3):
    if r != s != t != r:
        epsilon[r, s, t] = -1 if (r, s, t) in odd_perm else 1
```

Let's verify a few claims right away, to see how it relates to skew-symmetric matrix, cross product & determinant.

> Note:  Einstein notation is used, where every repeated pair of indices implies a summation.
> Superscripts are (contravariant) indices, not exponents.

**Cross Product**

$$
(\vec a \times \vec b)_i = \epsilon_{ijk} a^j b^k
$$

```python
# Generate random data
a = np.random.uniform(-1,1, (3,))
b = np.random.uniform(-1,1, (3,))
c = np.random.uniform(-1,1, (3,))

# Verify by comparing the following:
np.testing.assert_equal(
    np.cross(a, b),
    np.einsum('ijk,j,k->i', epsilon, a, b)
)
```

**Skew-symmetric Matrix**

$$
\left([\vec a]_\times \right)_{ik} = \epsilon_{ijk} a^j
$$

We verify this indirectly through the use of the Skew-symmetric Matrix, which is performing cross product using matrix multiplication.

$$
\vec a \times \vec b = [\vec a]_\times \vec b = (a^T [\vec b]_\times)^T
$$

```python
ax = np.einsum('ijk,j->ik', epsilon, a)
bx = np.einsum('ijk,j->ik', epsilon, b)

np.testing.assert_equal(
    np.dot(ax, b),
    np.dot(a.T, bx).T
)

```

And we can probably explain why is $[\vec a]_\times \vec b = (a^T [\vec b]_\times)^T$ using the Levi-Civita symbol.

$$
[\vec a]_\times \vec b = (\epsilon_{ijk} a^j) b^k = (\epsilon_{ijk} b^k) a^j = (-\epsilon_{ikj} b^k) a^j = (-[\vec b]_\times) \vec a = (a^T [\vec b]_\times)^T
$$

> Note: adding odd permutation(s) to $\epsilon$ would alter the index permutation parity, therefore generating a negative sign.
> And by the definition of a Skew-symmetric Matrix, this negative sign can be absorbed and turned into a transpose notation.

**Determinant**

$$
\det\left( 
    \begin{matrix} a^T \\ b^T \\ c^T \end{matrix}
\right) = \epsilon_{ijk} a^i b^j c^k
$$

```python
A = np.vstack([a, b, c])

np.testing.assert_equal(
    np.linalg.det(A),
    np.einsum('ijk,i,j,k', epsilon, a, b, c)
)
```