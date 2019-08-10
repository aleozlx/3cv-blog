---
title: Contour Moments (pt. II)
subTitle: A special application of Green's theorem
cover: LA.png
category: "Maths"
---

## Calculate other moments using Green's theorem

$$
\oint_C Ldx + Mdy = \iint_D \left(\frac{\partial M}{\partial x} -\frac{\partial L}{\partial y}\right) \mathrm{d}x \mathrm{d}y
$$

$$
\oint_C f(x,y) \det \left( \begin{matrix}x && y \\ \mathrm{d}x && \mathrm{d}y\end{matrix}\right) = \iint_{\textbf{p} \in D} \left(\nabla f \cdot \textbf{p} + 2f \right)\mathrm{d}x \mathrm{d}y
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

But in general, it is relatively simple to obtain the continuous form of contour moments by solving a differential equation, much harder to derive the discrete form from the continuous form.

**Second Order**

Using a similar technique,

$$
M_{20}=\frac{1}{4} \oint_C x^2 \det \left( \begin{matrix}x && y \\ \mathrm{d}x && \mathrm{d}y\end{matrix}\right)
$$

$$
M_{11}=\frac{1}{4} \oint_C xy \det \left( \begin{matrix}x && y \\ \mathrm{d}x && \mathrm{d}y\end{matrix}\right)
$$