---
title: Contour Moments (pt. II)
subTitle: A special application of Green's theorem
cover: LA.png
category: "Maths"
---

## Calculate other moments using Green's Theorem

$$
\oint_C Ldx + Mdy = \iint_D \left(\frac{\partial M}{\partial x} -\frac{\partial L}{\partial y}\right) \mathrm{d}x \mathrm{d}y
$$

Based on Green's Theorem, we have:

$$
\oint_{C=\partial D} f(x,y) \det \left( \begin{matrix}x && y \\ \mathrm{d}x && \mathrm{d}y\end{matrix}\right) = \iint_{\textbf{p} =(x,y)\in D} \left(\nabla f \cdot \textbf{p} + 2f \right)\mathrm{d}x \mathrm{d}y
$$

Setting $\left(\nabla f \cdot \textbf{p} + 2f \right) = x^\alpha y^\beta$, we will be able to calculate the raw moment $M_{\alpha \beta}$.
Through this practice, it becomes evident that the computational efficiency of contour moments is precisely due to the analytical solution to the differential equation.

> Note: these expressions are equivalent when integrating counterclockwise
> $$
> x \mathrm{d}y - y \mathrm{d}x = \det \left( \begin{matrix}x && y \\ \mathrm{d}x && \mathrm{d}y\end{matrix}\right) = || \textbf{p}\times \mathrm{d}\textbf{p} ||
> $$

**Zeroth Order**

We know from pt. I that calculating area using this is trivial, but let's verify anyway:

$$
\nabla f \cdot \textbf{p} + 2f = 1
$$

$$
f(x,y)=c
$$

$$
c = \frac{1}{2}
$$

$$
M_{00} = \iint_D \mathrm{d}A =\frac{1}{2} \sum_i \left|\begin{matrix}x_{i-1} && y_{i-1}\\x_i && y_i\end{matrix}\right|
$$

**First Order**

$$
\nabla f \cdot \textbf{p} + 2f = x
$$

By a comparison of the left handside and right handside of the equation,

$$
\nabla f = (c, 0) \Rightarrow f(x,y)=cx
$$

By back substitution, we can obtain:

$$
c=\frac{1}{3}
$$

In conclusion, the first order moment can be calculated as:

$$
M_{10}=\frac{1}{3} \oint_C x \det \left( \begin{matrix}x && y \\ \mathrm{d}x && \mathrm{d}y\end{matrix}\right)
$$

In a discrete form, it is found to be equivalent to:

$$
M_{10}=\frac{1}{3} \sum_i \frac{1}{2} (P_i + P_{i-1})^T \textbf{e}_1 \det \left(\begin{matrix}P_{i-1}^T\\P_i^T\end{matrix}\right)
$$

or

$$
M_{10}= \iint_D x \mathrm{d}A = \frac{1}{3} \sum_i \frac{1}{2} (x_i + x_{i-1}) \left|\begin{matrix}x_{i-1} && y_{i-1}\\x_i && y_i\end{matrix}\right|
$$

But in general, it is relatively simple to obtain the continuous form of contour moments by solving a differential equation, much harder to derive the discrete form from the continuous form.

Through symmetry,

$$
M_{01}= \iint_D y \mathrm{d}A =\frac{1}{3} \sum_i \frac{1}{2} (y_i + y_{i-1}) \left|\begin{matrix}x_{i-1} && y_{i-1}\\x_i && y_i\end{matrix}\right|
$$

**Second Order**

Using a similar technique,

$$
M_{20}=\frac{1}{4} \oint_C x^2 \det \left( \begin{matrix}x && y \\ \mathrm{d}x && \mathrm{d}y\end{matrix}\right)
$$

$$
M_{20}=\frac{1}{4} \oint_C y^2 \det \left( \begin{matrix}x && y \\ \mathrm{d}x && \mathrm{d}y\end{matrix}\right)
$$

$$
M_{11}=\frac{1}{4} \oint_C xy \det \left( \begin{matrix}x && y \\ \mathrm{d}x && \mathrm{d}y\end{matrix}\right)
$$

In discrete form,

$$
M_{20}= \iint_D x^2 \mathrm{d}A=\frac{1}{4} \sum_i \frac{1}{3}\left( x_{i-1}^2 + x_{i-1} x_i + x_i^2 \right) \left|\begin{matrix}x_{i-1} && y_{i-1}\\x_i && y_i\end{matrix}\right|
$$

$$
M_{20}= \iint_D y^2 \mathrm{d}A=\frac{1}{4} \sum_i \frac{1}{3}\left( y_{i-1}^2 + y_{i-1} y_i + y_i^2 \right) \left|\begin{matrix}x_{i-1} && y_{i-1}\\x_i && y_i\end{matrix}\right|
$$

$$
M_{11}= \iint_D xy \mathrm{d}A=\frac{1}{4} \sum_i \left( \frac{1}{3} x_{i-1} y_{i-1} + \frac{1}{6} x_{i-1} y_i + \frac{1}{6} x_i y_{i-1} +  \frac{1}{3} x_i y_i  \right) \left|\begin{matrix}x_{i-1} && y_{i-1}\\x_i && y_i\end{matrix}\right|
$$

**Concluding Remarks**

Shall we move on to the third order? I'm sure there is an emerging pattern to doing this, but I am not a mathematician.
Nevertheless it is worthwhile to point out that it is overwhelmingly more efficient to compute $\sum_i$ side of the equation on CPU than running the $\iint_D$ side of the equation on GPU by plugging in every pixel at the same time, even though you always can.
