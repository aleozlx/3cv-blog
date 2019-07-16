---
title: Linear Regression tutorial (PyTorch)
subTitle: A beginner level tutorial to get you started on Machine Learning with PyTorch
cover: LA.png
category: "ML"
---

Follow this article to get you started with a linear regression example from scratch.
I will introduce one of the simplest machine learning models, linear regression, and how to make one yourself using PyTorch,
so you can get familiar with its API usage and fundamental workflow of creating a machine learning model.

## Install PyTorch

To install torch properly, go to https://pytorch.org/get-started/locally/ and read the instructions.
Otherwise, if you just want to hit the ground running and get through this tutorial as quickly as possible try install PyTorch this way:

```sh
sudo pip3 install torch
```

For this tutorial, you will also need `pandas` and `numpy`, which you may install in a similar fashion.

## Prepare data

Open up your favorite editor or Python IDE (No preference? Try VSCode.), and start with the following code.

```python
import torch
import pandas as pd
import numpy as np

_X = np.array([[1], [2], [3]], dtype='f4')
_y = np.array([[2], [4], [6]], dtype='f4')

X = torch.tensor(_X)
y = torch.tensor(_y)

# Continue here...

```

We have just defined two arrays `X` and `y` as features and the target, respectively.
A **supervised machine learning model** typically learns the the relation between pairs of features and target samples,
which, in turn, allows the model to make predictions upon seeing new feature input.
So a model can be viewed as some function that attempts to map input `X` to output `y`.

$$
y = \text{model}(X)
$$

Training is the procedure where the model learns how to do that, given data samples to learn from.


`X` is capitalized because most training data contain multiple features, i.e. the input has many components, to form a matrix.
The capital case is to remind us this is a matrix, known as a **data matrix**, where rows are samples and columns are features.
The table (from the UCI wine dataset) below can be an example of a data matrix.

<style>
  table.dataframe {
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 20px;
  }
  .dataframe tbody tr th:only-of-type {
    vertical-align: middle;
  }
  .dataframe tbody tr th {
    vertical-align: top;
  }
  .dataframe thead th {
    text-align: right;
  }
</style>

<table class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>density</th>
      <th>pH</th>
      <th>sulphates</th>
      <th>alcohol</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1.0010</td>
      <td>3.00</td>
      <td>0.45</td>
      <td>8.8</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0.9940</td>
      <td>3.30</td>
      <td>0.49</td>
      <td>9.5</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0.9951</td>
      <td>3.26</td>
      <td>0.44</td>
      <td>10.1</td>
    </tr>
    <tr>
      <th>3</th>
      <td>0.9956</td>
      <td>3.19</td>
      <td>0.40</td>
      <td>9.9</td>
    </tr>
    <tr>
      <th>4</th>
      <td>0.9956</td>
      <td>3.19</td>
      <td>0.40</td>
      <td>9.9</td>
    </tr>
  </tbody>
</table>

`y` is usually an array where each element is the prediction target of the sample. It is not capitalized to remind us that it is a vector or a **single column** table.

<table class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th>quality</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>6</td>
    </tr>
    <tr>
      <td>5</td>
    </tr>
    <tr>
      <td>5</td>
    </tr>
    <tr>
      <td>6</td>
    </tr>
    <tr>
      <td>4</td>
    </tr>
  </tbody>
</table>

But the first example is made really simple because we will hand calculate derivatives, weight updates to explain the training.

```python
_X = np.array([[1], [2], [3]], dtype='f4')
```

As shown in this line, the data matrix contains 3 entries, with only one feature, and they are stored as `f4`, which is single precision floats which takes up 4 bytes.

```python
X = torch.tensor(_X)
```

It is subsequently converted into a PyTorch tensor, which is the type of multi-dimensional array that PyTorch recognizes and operates on.

## Linear Regression model

Going back to your code editor and now we will define a linear regression model.

```python
class LinearRegressionModel(torch.nn.Module):
    def __init__(self):
        super(LinearRegressionModel, self).__init__()
        self.linear = torch.nn.Linear(1, 1)

    def forward(self, x):
        return self.linear(x)

model = LinearRegressionModel()

# Continue here...

```

The `forward()` function takes input featues and fulfills the prediction, a.k.a the **forward pass**,
as opposed to the **backward pass** which steers the model towards the right direction based on the error of the prediction,
which will be covered later.
It is clear that the prediction is ultimately computed by `torch.nn.Linear`.
The `(1, 1)` here indicates the model has 1 feature and the target also has only 1 component.

Without jumping into the multi-dimensional deep end, this `torch.nn.Linear` represents model of a line, which requires two parameters: `a` the slope, and `b` the intercept.

$$
y = ax + b
$$

Based on the given data, we know this line would fit perfectly:

$$
y = 2x
$$

But how can a computer find this model, especially when there is not a perfectly fit model, how can a computer find a best performing one?
The follow section addresses this problem from a generalized top-down approach.

## Parameter space

Consider a world whose coordinates consist of parameters of a model, each point $(a, b)$ would represent a model.
This space contains all the linear models thus formulated possible!
If we assign a score $(a, b) \rightarrow  e$ to each model assessing its expected prediction error,
we turn finding the best performing into an optimization problem, where we want to find the point in parameter space that minimizes the error.

$$
\text{model} = \text{argmin}_{(a,b)} {e(a,b)}
$$

We will need to create a training loop which allows the model to gradually move towards the optimal point.
A **batch size** will determine number of samples we use to update the model in each iteration.
And this approach takes many repetitions (**epochs**) to reach a stable point of the model, a.k.a. convergence.

```python

# Continue here...

batch_size = 5
for epoch in range(100):
    for i in range(0, X.shape[0], batch_size):
        y_pred = model(X[i:i+batch_size]) # forward pass
        loss = error(y_pred, y[i:i+batch_size])
```

## Least square error

A common type of error function of choice is the least square error, where you compute the expectation of the difference between predicted value and target value, squared.

$$
e = \mathbb{E} (y - \text{model}(x))^2 = \mathbb{E} (y - (ax+b))^2 = \frac{1}{N} \sum_{i=1}^n {(y_i - (ax_i+b))^2}
$$

We square this error so this formula preserves errors that occur in both positive and negative directions as opposed to letting them cancel, and squaring is conveniently differentiable.
This is provided by PyTorch.

```python
error = torch.nn.MSELoss()

batch_size = 5
for epoch in range(100):
    for i in range(0, X.shape[0], batch_size):
        y_pred = model(X[i:i+batch_size]) # forward pass
        loss = error(y_pred, y[i:i+batch_size])

        # Continue here...
```

## From an analytical approach to an iterative approach

Setting the two partial derivatives to 0, we can find the optimal point via the following equation system:

$$
\partial_a e(a, b) = -\frac{2}{N} \sum_{i=1}^n {(y_i - (ax_i+b)) x_i } = 0 
$$

$$
\partial_b e(a, b) = -\frac{2}{N} \sum_{i=1}^n {(y_i - (ax_i+b)) } = 0
$$

But to solve this linear equation system, we practically have to load the entire data matrix and prediction target into memory,
which will physically limit the scale of the problem we could apply this to.
Regardless of the complexity of the model, we do not want such limitation to the training approach.

Considering the reverse direction of the gradients $ -(\partial_a e, \partial_b e) $, which can still gradually lead the model towards the optimal point,
we can use it to develop an iterative approach to update the parameters.

$$
a \leftarrow a - \gamma \partial_a e
$$

$$
b \leftarrow b - \gamma \partial_a e
$$

Intuitively, $\partial_a e$ is the rate of change in $e$ caused by change in $a$, which indicates the part where error in $a$ is contributing to total error $e$.
So, why don't we correct $a$ by an amount that is proportional to $\partial_a e$?
Taking into account that this correction will be nowhere near perfect because we will be using paritial data in the interative approach,
a factor $\gamma$ is multiplied to the correction which will also affect the speed of learning a.k.a the learning rate.

```python
error = torch.nn.MSELoss()

# Continue here...

batch_size = 5
for epoch in range(100):
    for i in range(0, X.shape[0], batch_size):
        y_pred = model(X[i:i+batch_size]) # forward pass
        loss = error(y_pred, y[i:i+batch_size])

        optimizer.zero_grad() # prepare parameter gradients
        loss.backward() # compute parameter gradients
        optimizer.step() # update weights
```

This is the gist of stochastic gradient descent!
These computations will be handled by a PyTorch optimizer.

```python
optimizer = torch.optim.SGD(model.parameters(), lr=0.1, momentum=0)
```
