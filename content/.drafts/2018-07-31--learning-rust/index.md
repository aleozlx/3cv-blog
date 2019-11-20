---
title: Learning Rust
subTitle: A "smart" programming language backed by a good optimizer
cover: rust.png
category: "Blog"
---

## How I stumbled upon Rust

Python and C++ has been my go-to programming languages for a very long time now.
Looking at my Python codes that frequently glue various pieces of highly optimized C++ packages in a haphazard way (yes they do provide multiple orders of magnitudes of speedup),
I can not help thinking this just doesn't feel right:

~~~python
if DEVICE == 'GPU':
    import tensorflow as tf
# ...
    spfreqOp = tf.load_op_library(os.path.join(OP_PATH, "spfreq.so"...
    if rank == 0:
        logging.info('Using custom CUDA Op')

# 20 lines later ...

import importlib.util
lycon_spec = importlib.util.find_spec('lycon')
# use lycon to drastically accelerate image read/resize
if lycon_spec:
    def read_resize(fname, image_resize, greyscale=False):
        import lycon
        if greyscale:
            return lycon.resize(lycon.load(fname, ...
        else:
            ...
else:
    if rank==0:
        logging.warning('Using skimage for image read/resize. SLOW!!')
    def read_resize(fname, image_resize, greyscale=False):
        return skimage.transform.resize(skimage.io.imread(fname, ...

# With many slow parts replaced like that, the rest works beautifully...
~~~

The key question for me is this: **How can I write reasonably maintainable and very efficient code at the same time?**
For example, I HATE going back and forth between source and header files whenever I decide to change a function signature every single time.
How on earth are header files still a necessity in the 21th century? No, I'm not going to be doing this project-wide.

Then again, autotools and cmake are brilliant build tools just based on the fact that they are able to manage such a complex build process and all the dependencies.
C++ project management is often times still that typical intricate disaster.
Plus, I don't always want to setup all that to just build a couple files, right?
However, here's still a glimpse of how I handle "just a couple files": (notice there's a variable literally called `TF_CUDA_HACK`)

~~~python
CMD.let(
    BUILD_PATH = args.build_path,
    TF_INC = tf.sysconfig.get_include(),
    TF_LIB = tf.sysconfig.get_lib(),
    CUDA_INC = '/opt/cuda/include',
    CUDA_LIB = '/opt/cuda/lib64',
    TF_CUDA_HACK = '/opt', # https://github.com/tensorflow/tensorflow/issues/15002#issuecomment-355101446
        # to fix fatal error: cuda/include/cuda.h: No such file or directory
        # WTF: TensorFlow is constantly changing their packaging, breaking tensorflow/core/util/cuda_kernel_helper.h
    CXX_FLAGS = '-O2',
    GLIBCXX_ABI = '-D_GLIBCXX_USE_CXX11_ABI=1', # GCC >=5 uses C++11 ABI.
        # Most TensorFlow packages are compiled using old ABI, yet "python-tensorflow 1.8.0-1" with ArchLinux uses the new one.
    TARGET_LIBS = "-lcublas -lcudart -lcuda -ltensorflow_framework",
        # ref: http://arnon.dk/matching-sm-architectures-arch-and-gencode-for-various-nvidia-cards/
    CUDA_GENCODE = """-gencode arch=compute_60,code=sm_60 -gencode arch=compute_61,code=sm_61 -gencode arch=compute_61,code=compute_61""")(
        CMD("""nvcc -dc -std=c++11 --compiler-options {CXX_FLAGS} --expt-relaxed-constexpr \
            -I "{TF_INC}" -I "{CUDA_INC}" -I "{TF_CUDA_HACK}" \
            -Xcompiler -fPIC -DGOOGLE_CUDA=1 \
            {CUDA_GENCODE} \
            -dlink -o {BUILD_PATH}/spfreq_kernel.o spfreq_kernel.cu""") \
        .then(CMD("""nvcc -dlink -Xcompiler -fPIC {CUDA_GENCODE} \
            -o {BUILD_PATH}/spfreq_kernel.dlink.o {BUILD_PATH}/spfreq_kernel.o""")) \
        .then(CMD("""g++ -std=c++11 {CXX_FLAGS} -shared -o {BUILD_PATH}/spfreq.so \
            -fPIC -DGOOGLE_CUDA=1 -I "{TF_INC}" -I "{CUDA_INC}" \
            spfreq.cc {BUILD_PATH}/spfreq_kernel.o {BUILD_PATH}/spfreq_kernel.dlink.o \
            {GLIBCXX_ABI} -L{CUDA_LIB} -L{TF_LIB} {TARGET_LIBS}"""))
)
~~~

That should be some demonstration of the reason why I needed to search for a new language which provides fancy high-level features like Python does but with really minimum overhead once compiled, and must come with a good build system.
It's a tough requirement, but in theory, it's just difficult, not impossible.
That's why I picked Rust after hours of Googling, searching for a new programming language that has these desirable qualities, in belief that years down the line, this thing would prove to be worthwhile, like how I several years ago learned Python when very few asks about it and now it's the gorilla glue that I apply extensively to my projects.

## Talk about Rust

My journey of learning Rust has begun with this nice first impression.
I used the Rust package manager to new a Rust project and it created the project structure and set up a git repository for me.

~~~bash
~/Code » cargo new test-project
     Created binary (application) `test-project` project
~/Code » cd test-project && tree
.
├── Cargo.toml
└── src
    └── main.rs

1 directory, 2 files
~/Code/test-project(master*) » 
~~~

Then building the program was painless:

~~~bash
~/Code/test-project(master*) » cargo run
   Compiling test-project v0.1.0 (file:///home/alex/Code/test-project)
    Finished dev [unoptimized + debuginfo] target(s) in 0.59s
     Running `target/debug/test-project`
Hello, world!
~~~

The language appeared to be odd intially without support for classes, constructors, try/catch blocks, even function overrides, instead I needed to get used to struct, enum std::result::Result, traits, etc.

Then it reassured me "this is the right way to do things" by allowing me to write SIMD code easily:

~~~rust
struct Matrix {
    rows: usize,
    cols: usize,
    data: Vec<f32>
}

impl Matrix {
    #[target_feature(enable = "avx2")]
    #[target_feature(enable = "fma")]
    unsafe fn s_product_sum(&mut self, a: &Matrix, b: &Matrix, j: usize) {
        let s_view = &b.data[j*b.rows..(j+1)*b.rows];
        // grab the resulting column
        let out_view = &mut self.data[j*self.rows..(j+1)*self.rows];
        // reset output space to prepare for accumulation
        for p in 0..self.rows {
            out_view[p] = 0.0;
        }

        for k in 0..a.cols {
            let scalar = s_view[k];
            let in_view = &a.data[k*a.rows..(k+1)*a.rows];
            for p in 0..self.rows {
                // the following can be accelerated using FMA
                // creation of the views has made optimization 
                //    very obvious for compliers & humans
                out_view[p] = scalar.mul_add(in_view[p], out_view[p]);
            }
        }
    }

    fn matmul(&mut self, a: &Matrix, b: &Matrix) {
        for j in 0..b.cols {
            unsafe{ self.s_product_sum(a, b, j); }
        }
    }
}
~~~

You may have guessed it. It spits out things like:

~~~assembly
vmovss    (%rbp,%rax,4), %xmm1
vfmadd213ss    (%rbx,%rax,4), %xmm0, %xmm1
vmovss    %xmm1, (%rbx,%rax,4)
~~~

I kept on reading about its cheap references and structures and they work the way I'd love them to be: many high-level concepts are going to be optimized away.

For example, without optimization, the "Python-style" for-loop in Rust compiles into the following. (`.LBB24_9` is the loop body that does the arithmetic with overflow checking.)

~~~rust
let mut a = 0;
for i in 0..50 {
    a += i+1;
}
~~~

~~~assembly
    movl    $0, 184(%rsp)
    movl    $50, 188(%rsp)
    movl    184(%rsp), %edi
    movl    188(%rsp), %esi
    callq   _ZN54_$LT$I$u20$as$u20$core..iter..traits..IntoIterator$GT$9into_iter17ha16befe02d7878c8E
    movl    %edx, 180(%rsp)
    movl    %eax, 176(%rsp)
    movl    176(%rsp), %eax
    movl    180(%rsp), %ecx
    movl    %eax, 192(%rsp)
    movl    %ecx, 196(%rsp)
.LBB24_5:
    leaq    192(%rsp), %rdi
    callq   _ZN4core4iter5range93_$LT$impl$u20$core..iter..iterator..Iterator$u20$for$u20$core..ops..range..Range$LT$A$GT$$GT$4next17h8381468c04ed8e40E
    movl    %edx, 204(%rsp)
    movl    %eax, 200(%rsp)
    movl    200(%rsp), %eax
    movl    %eax, %ecx
    testq   %rcx, %rcx
    movq    %rcx, 56(%rsp)
    je  .LBB24_7
    jmp .LBB24_17
.LBB24_17:
    movq    56(%rsp), %rax
    subq    $1, %rax
    movq    %rax, 48(%rsp)
    je  .LBB24_9
    jmp .LBB24_8
.LBB24_7:
    movq    _ZN4core3fmt3num52_$LT$impl$u20$core..fmt..Display$u20$for$u20$i32$GT$3fmt17h383a3ff0b4b953abE@GOTPCREL(%rip), %rsi
    leaq    92(%rsp), %rax
    movq    %rax, 272(%rsp)
    movq    272(%rsp), %rdi
    callq   _ZN4core3fmt10ArgumentV13new17hf63dba792c823d06E
    movq    %rax, 40(%rsp)
    movq    %rdx, 32(%rsp)
    jmp .LBB24_12
.LBB24_8:
    ud2
.LBB24_9:
    movl    204(%rsp), %eax
    incl    %eax
    seto    %cl
    testb   $1, %cl
    movl    %eax, 28(%rsp)
    jne .LBB24_15
    movl    28(%rsp), %eax
    addl    92(%rsp), %eax
    seto    %cl
    testb   $1, %cl
    movl    %eax, 24(%rsp)
    jne .LBB24_16
    movl    24(%rsp), %eax
    movl    %eax, 92(%rsp)
    jmp .LBB24_5
.LBB24_12:
~~~

With optimization:

~~~asm
addl    $1275, 12(%rsp)
~~~

Oops! I was gonna show you what a light for-loop looks like but the whole thing was optimized into a constant. Let's again try this way:

~~~rust
fn s(n: i32) -> i32 {
    let mut a = 0;
    for i in 0..n {
        a += i+1;
    }
    return a;
}

fn main() {
    let mut a = 0;
    a = s(50);
    println!("{}", a);
}
~~~

~~~assembly
movl    $1275, 12(%rsp)
~~~

Well, Rust still optimized the whole thing into a constant and inlined the function as well..

But I insist to show you and try making it a public no-mangle no-inline function so it's difficult for the optimizer to deduce the result directly.

~~~rust
#[no_mangle]
#[inline(never)]
pub fn s(n: i32) -> i32 {
    let mut a = 0;
    for i in 0..n {
        a += i+1;
    }
    return a;
}
~~~

~~~assembly
    testl   %edi, %edi
    jle .LBB4_1
    leal    -1(%rdi), %eax
    leal    -2(%rdi), %ecx
    imulq   %rax, %rcx
    shrq    %rcx
    leal    (%rcx,%rdi,2), %eax
    addl    $-1, %eax
    retq
.LBB4_1:
    xorl    %eax, %eax
    retq
~~~

If you can read assembly, this function just got translated into:

$$
2n + \bigl\lfloor \frac{(n-1)(n-2)}{2} \bigr\rfloor - 1 
$$

which hits every correct answer without using a for-loop.
It defeated the purpose of showing you what a light for-loop looks like but I guess it did show you how Rust is backed by an excellent optimizer from LLVM and generates very efficient code.

Finally showing you the light for-loop as promised by making this function calculate fractorial (hopefully the compiler can't figure out a closed-form solution this time).

~~~rust
#[no_mangle]
#[inline(never)]
pub fn s(n: i32) -> i32 {
    let mut a = 1;
    for i in 0..n {
        a *= i+1;
    }
    return a;
}
~~~

~~~assembly
    testl   %edi, %edi
    jle .LBB4_1
    cmpl    $7, %edi
    ja  .LBB4_6
    xorl    %ecx, %ecx
    movl    $1, %eax
    jmp .LBB4_4
.LBB4_1:
    movl    $1, %eax
    retq
.LBB4_6: ...
.LBB4_8: ...
.LBB4_9: ...
.LBB4_11: ...
.LBB4_12: ...
.LBB4_13: ...
.LBB4_4:
    addl    $1, %ecx
    negl    %edi
    .p2align    4, 0x90
.LBB4_5:
    imull   %ecx, %eax
    leal    (%rdi,%rcx), %edx
    addl    $1, %edx
    leal    1(%rcx), %ecx
    cmpl    $1, %edx
    jne .LBB4_5
.LBB4_14:
    retq
~~~

We can see that the compiler decides to let the program return 1 if the input is less than or equal to 0; jumps to `.LBB4_6` to run some crazy SSE2 operations (which I'll omit here) if the input is greater than 7; otherwise `.LBB4_5` would be the for-loop body that we have been expecting,  that really only handles input ranging from 1..6, 6 exact cases, which the compiler considers too trivial to optimize.
At this point I'm almost surprised that it doesn't just do a table look up with good old XLAT or whatnot. Well, I guess it does save us several bytes of memory by running a tiny for-loop for maybe a dozen nano seconds instead. How considerate!

## Mutability, Ownership and Lifetime

The compiler would statically analyze reference mutability, ownership and lifetime so well that it would take some illuminati to seg-fault in Rust.
Nevertheless, Rust provides the `unsafe` block to let you go crazy with pointers or when you decide to borrow multiple mutable references to mess with some theoratically non-overlapping memory section in your genius way.

Here are some stupid trivial things not permitted in Rust language:

~~~rust
let x = vec![1, 2, 3];
// assign last element to 0
x[x.len()-1] = 0; // no, this won't compile.
~~~

This doesn't compile in rust because a mutable borrow `x[]` occurred before an immutable borrow `x.len()`, and in Rust logic you can't hand out some mutable reference, then hand out more referneces that are supposed to guarantee immutability.

Either reverse the order:

~~~rust
let mut x = vec![1, 2, 3];
let idx_last = x.len()-1;
x[idx_last] = 0;
~~~

Or do it with appropriate API:

~~~rust
let mut x = vec![1, 2, 3];
if let Some(last) = x.last_mut() {
    *last = 0;
}
~~~

Variables can be either constant, immutable, mutable.
"Immutable" is a great concept to promote functional programming and improve program accuracy verification, which many programming language lacks.
This also helps a lot with optimization because it essentially applies notions of `const` and `__restrict__` from C++ world whenever possible.

The default way of passing variables around is neither by value nor by reference, but by move semantics (transfer of ownership).

~~~rust
struct Complex {
    a: f32,
    b: f32
}

impl Complex {
    fn new(a: f32, b: f32) -> Complex {
        Complex {a: a, b: b}
    }

    fn add(&self, another: Complex) -> Complex {
        Complex {
            a: self.a + another.a,
            b: self.b + another.b
        }
    }
}

fn main() {
    let a = Complex::new(0.0, 1.0);
    let b = Complex::new(1.0, 0.0);
    let c = a.add(b);
    let d = b.add(a); // b is gone at this point
}
~~~

This code won't compile either. Probably a better way is to hand out references instead of transfering ownership of the object itself.
And keep in mind, all these ownership checks exist only at compile time,
which means they implies no performance overhead.

~~~rust
impl Complex {
    fn new(a: f32, b: f32) -> Complex {
        Complex {a: a, b: b}
    }

    fn add(&self, another: &Complex) -> Complex {
        Complex {
            a: self.a + another.a,
            b: self.b + another.b
        }
    }
}

fn main() {
    let a = Complex::new(0.0, 1.0);
    let b = Complex::new(1.0, 0.0);
    let c = a.add(&b); // return value is owned by c.
    let d = b.add(&a); // return value is owned by d.
}
~~~

Now let's try to implement the actual "+" operator by implementing the trait.

~~~rust
impl Complex {
    fn new(a: f32, b: f32) -> Complex {
        Complex {a: a, b: b}
    }

    fn add_another(&self, another: &Complex) -> Complex {
        Complex {
            a: self.a + another.a,
            b: self.b + another.b
        }
    }
}

impl std::ops::Add<Complex> for Complex {
    type Output = Complex;

    fn add(self, rhs: Complex) -> Complex {
        self.add_another(&rhs)
    }
}

fn main() {
    let a = Complex::new(0.0, 1.0);
    let b = Complex::new(1.0, 0.0);
    let c = a+b; // obviously we lose a and b after this.
    let d = a+b; // this line won't compile.
}
~~~

Unfortunately we would lose a and b very quickly because the operator would consume both operands with move semantics.
So we have to implement the operator not for the structure but the reference of the structure.
And at the same time we must specify the lifetimes `'a` and `'b` of the references to make sure they would be valid during the operation.

~~~rust
impl<'a, 'b> std::ops::Add<&'b Complex> for &'a Complex {
    type Output = Complex;

    fn add(self, rhs: &'b Complex) -> Complex {
        self.add_another(rhs)
    }
}

fn main() {
    let a = Complex::new(0.0, 1.0);
    let b = Complex::new(1.0, 0.0);
    let c = &a+&b; // now this looks odd but that's how we get to keep them
}
~~~

But you can let variable hold the references instead.

~~~rust
fn main() {
    let ref a = Complex::new(0.0, 1.0);
    let ref b = Complex::new(1.0, 0.0);
    let c = a+b; // now this looks natural
}
~~~

Wait! We just replicated what variable means in other OOP languages, that they hold references.
The Rust way is a multi-paradigm design decision! C++ is also multi-paradigm by letting you define constuctor, copy constructor and move constructor.
Rust just picked a way for you, which still allows you construct others.

Last thing I want to touch on is it's strong generic type inference.

~~~rust
fn push<T>(x: &mut Vec<T>, val: T) {
    x.push(val);
}

fn main() {
    let mut x = Vec::new(); // impossible to deduce type of x here
    push(&mut x, 0); // type of x can be deduced from here
}
~~~

Notice how `push()` is specialized for `i32`, then `x` is deduced to be `Vec<i32>` because that's the only type would fit the function.

That's how Rust can provide simple syntax comparable to dynamically typed languages, but Rust is still strongly statically typed. Rust type deduction is so dominate that function overiding is not supported. That's counterintuitive at first but it turned out to work so well.

Speaking of which, Rust is pretty conventionally anti-OOP because there are no classes, no type inheritance, no constructors, no function overrides, let alone up/down casting, virtual methods, etc. But it presents itself in such a peculiar way that oddly makes program more elegant. Now conventional OOP style feels like a hack, immature, clear at first then quickly turns into chaos. Go on and read the official chapter in the Rust documentation, which shares some pretty interesting takes on the topic of OOP. I personally felt enlightened.

## 5 top things I love about Rust

This exciting topic of having a glorious highly-optimized AOT compiled language at disposal can probably go on forever.
But if I have to choose, here are 5 things I appreciate the most of Rust:

+ Cargo
+ Stdandard library
+ FP features
+ Enum variants
+ Unsafe block


~~~rust
use std;
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::fs::File;
use std::io::BufReader;
use std::io::prelude::*;
use regex::Regex;

pub struct H5Group {
    pub name: String,
    pub children: BTreeMap<String, H5Obj>
}

pub struct H5Dataset {
    pub name: String
}

pub enum H5Obj{
    Group(H5Group),
    Dataset(H5Dataset)
}

impl H5Group {
    pub fn locate_group_mut(&mut self, path: &Path) -> &mut H5Group {
        // println!("locate_group_mut {} {:#?}", &self.name, path);
        let mut components = path.components();
        if path.is_absolute() {
            if self.name == "/" {
                components.next(); // skip root
            }
            else { panic!("Absolute path cannot be traced from here."); }
        }

        let next = components.next();
        match next {
            None => self,
            Some(group_component) => {
                let group_name = group_component.as_os_str().to_str().unwrap(); 
                self.children.get_mut(group_name)
                    .expect(&format!("Group \"{}\" doesn't exist.", group_name))
                    .to_group().locate_group_mut(components.as_path())
            }
        }
    }
}

impl From<H5Group> for H5Obj {
    fn from(val: H5Group) -> Self {
        H5Obj::Group(val)
    }
}

impl From<H5Dataset> for H5Obj {
    fn from(val: H5Dataset) -> Self {
        H5Obj::Dataset(val)
    }
}

impl H5Obj {
    fn to_group(&mut self) -> &mut H5Group {
        if let H5Obj::Group(g) = self { g }
        else { panic!("Failed to cast H5Obj into H5Group.") }
    }
}

fn subgroup(parent: &PathBuf, child: &PathBuf) -> Option<String> {
    let tmp = child.strip_prefix(parent);
    match tmp {
        Ok(rel_name) => match rel_name.components().count() {
            1usize => Some(String::from(rel_name.to_str().unwrap())),
            _ => None
        },
        Err(_) => None
    }
}

pub fn parse(fname: &PathBuf) -> std::io::Result<()> {
    let rule = Regex::new(r"^(?P<name>[^ ]+)\s+(?P<type>Group|Dataset)").unwrap();
    let file = File::open(fname)?;
    let reader = BufReader::new(file);
    let mut root = H5Group { name: String::from("/"), children: BTreeMap::new() };
    let mut spath = PathBuf::from(&root.name);
    for ll in reader.lines() {
        let line = ll?;
        let m = rule.captures(&line);
        match m {
            Some(captures) => {
                match &captures["type"] {
                    "Group" => {
                        let full_name = &captures["name"];
                        if full_name != "/" {
                            // println!("G {}", full_name);
                            let full_name = PathBuf::from(full_name);
                            loop {
                                match subgroup(&spath, &full_name) {
                                    Some(group_name) => {
                                        root.locate_group_mut(&spath)
                                            .children.insert(
                                                group_name.clone(),
                                                H5Obj::from(H5Group {
                                                    name: group_name.clone(),
                                                    children: BTreeMap::new()
                                            }));
                                        spath.push(group_name.clone());
                                        break;
                                    },
                                    None => {
                                        spath.pop(); // trace back
                                    }
                                }
                            }                            
                        }
                    },
                    "Dataset" => {
                        let full_name = &captures["name"];
                        // println!("D {}", full_name);
                        let full_name = PathBuf::from(full_name);
                        let dataset_name = String::from(
                            full_name.file_name().unwrap()
                                .to_str().unwrap());
                        root.locate_group_mut(&spath)
                            .children.insert(
                                dataset_name.clone(),
                                H5Obj::from(H5Dataset {
                                    name: dataset_name.clone()
                                }));
                    },
                    _ => ()
                }
            }
            None => ()
        };
        
    }
    Ok(())
}

~~~
