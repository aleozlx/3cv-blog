---
title: Curriculum Vitae
menuTitle: Curriculum Vitae
---

# 2019

`07` Started a Superpixel Analyser project.

`06` FuzzIEEE tutorial session [[Fuzzy Fusion of Decisions from Heterogeneous Deep Machine Learning Models]](https://github.com/scottgs/FuzzyFusion_DeepLearning_Tutorial): **PyTorch** Introduction, Transfer learning DCNNs, Data-driven Fuzzy Choquet Integral.

`05` Kubernetes Cluster Modulation System called Sprinkler: it serves to prevent certain dockerd vulnerabilities from bringing about a cascading systemwide failure by listening to and filtering docker events and terminating containers that will trigger the cascading failure. This manifests as consuming RAM and storage space which paralyzes our systems. I have led the root cause analysis, and pinpointed the vulnerable code, but we created this system which is non-centeralized and external to Kubernetes to future-proof similar situations.

`05` First research paper submission. See also my [Publications](/pub) page.

`04` PhD Qualifying Exam. This has established my main research direction: the ideology of Superpixel Image Analysis

`02` Hotwings job submission system based on **Celery** and **Kubernetes**. It is mostly a proof-of-concept at the time which consists of OS provisioning, Kubernetes cluster provisioning, service routing, storage provisioning, job processing and scheduling. It is designed to not only manage GPU workflows, but more importantly, allows unallocated infrastructure to be quickly turned into a pool of computing resources available to researchers or students on demand.


# 2018

`10` Started this blog to document my experiences. This website is designed to be self-sustaining to minimize maintaince effort, thanks to **Gatsby** and **Netlify**. The contents are compiled from Markdown source files and the deployment is git-driven.

`10` Started playbook-rs which is a YAML based **Docker**/**Kubernetes** workflow orchestration system. This creates a template to organize my research projects.

`10` Created a **Celery** based job submission system that allowed students to submit GPU workflows to our own infrastructure. Hundreds of deep learning jobs **(TensorFlow)** were submitted through and executed in an orderly manner.

`09` Created a system that allow students to provision their own **AWS EMR** clusters and keeps track of and enforces limits on these clusters. It is used for a Spark learning environment. It also relates EBS persistent volumes to student accounts so that students can save/resume their projects without having the cluster turned on all the time. It transparently distributes security keys and secrets and collaborates with **LastPass**. There were almost 100 clusters in use with over 10 concurrency at any moment. I have supported the system for several months.

`08` Started programming in **Rust**. This has turned out to be very helpful and has enabled me to write better C++ programs as well.

`07` Learned about high-throughput computing (HTC) systems, especially **HTCondor**, using the national Open Science Grid (OSG) at University of Wisconsin.

`06` Started contributing to an internal version of **Keras** framework for research use, and extending Keras and TensorFlow capabilities with novel operations and more flexible design patterns.

`05` Automated **Cloudera Distributed Hadoop** cluster provisioning with **Ansible** and supported provisioning and maintaince of multiple clusters used by different academic programs.

`02` Organized Algorithm Practice weekly sessions in form of small group, that helps people practice interview and problem solving strategies with an emphasis on algorithm accuracy and efficiency reasoning.

`01` Supported **Advanced Data Visualization**, a course of **Data Science and Analytics Program**, that involves data visualization techniques using **R**, **ggplot**, **Plotly**, **Shiny**, etc. Developed code for **Shiny** labs as course material. 

# 2017

`12` Researched and maintained **Cloudera Distributed Hadoop** infrastructure for **Data Science and Analytics Program** in order to help support technical needs with **Spark** and **Drill** usage in course materials. Developed ways to tie these computation resources to **JupyterHub** educational environment. Created detailed documentations for sustainable maintaince.

`12` Graduated from **University of Missouri** with a Master's Degree in Computer Science, and continue on to a PhD degree. Completed and defended Master's Thesis: RELATIVE DEPTH ESTIMATION FROM SINGLE MONOCULAR IMAGES WITH DEEP CONVOLUTIONAL NETWORK. It is based on VGG deep convolutional network, Superpixel and Conditional Random Field, implemented using **TensorFlow** and **CUDA**.

`08` Led an **Mizzou Computing Association** Special Interest Group: Scientific Computing using Python,
that introduces various topics from data carpentery to machine learning to college students, with whiteboard theory sessions and open source materials.

`06` Put together course materials and code for labs and exercises for a graduate level Data Science Emphasis Area course: **Applied Machine Learning from Data Analytics**. Students learn from concepts and API usage to an in-depth understanding of how to select appropriate techniques for various data science tasks and operationalize their workflow. Topics cover a spectrum from simple Bayesian modeling to more advanced algorithms such as support vector machines, decision trees/forests, and neural networks. Technologies mainly involve **Scipy** stack, **Scikit-learn**, **TensorFlow** and **SparkML**.

`06` Started working for **Data Science and Analytics Master's Program** at **University of Missouri** as GRA/GTA, developing course materials, researching infrastructure technologies and supporting students online.

`02` Organized Technical Interview Prep weekly sessions in form of small group, that helps people practice interview and problem solving strategies by whiteboard coding and brainstorming possible solutions.

`01` **NewsXplore** project in [RJI Student Competition](https://www.rjionline.org/stories/informatr-produces-new-insights-wins-2017-rji-student-competition): Developed a machine learning model and APIs that supports a mobile app which allows user to easily highlight and fact-check news articles against credible sources, then generates a report that includes critical supporting and contradicting information. It is based on cutting-edge research and implemented as a ready and scalable service using **TensorFlow**, **Flask**, **Redis** and **Docker**.

# 2016

`10` Participated in **HackMizzou** organized by Major League Hacking, and developed a music player that captures user’s headshot from webcam, then decides whether or not to skip this song automatically based on user's emotion. It was an all-front-end architecture built with Material, WebRTC and Microsoft Cognitive Emotion API.

`06` Graduated from **East China University of Science and Technology** with a BE Degree in Computer Science. My Capstone Project was a Shared-nothing Parallel Database, which parses SQL statments and generates query plans and executes query using **OpenMPI**. The project was implemented in C++ and achieved linear scalability tested in a distributed environment up to 48 cores.

`01` I took the **Parallel Programming for High Performance Computing** class at **University of Missouri** taught by Dr. Grant Scott, and learned some solid SIMD, multi-threading, GPGPU and distributed computing technologies there. I think this changed my course of education and target career and Dr. Scott has been my adviser and mentor.

# 2015

`05` Created a compiler that compiles PL/0 source code into Java bytecode, or transpiles into C source code, based on a recursive descent parser.

`02` Implemented an Application Layer Switch Protocol using **twistd** that supports packet switching through TCP or UDP, which facilitates centralized communication between NATs. It has Python, Java and C/C++ client API.

# 2014

`11` Web development for Lücheng Legal Service: A legal service website based on **Django** to allow customers to order services and generate or upload documents. Architecture design, project management, programming.
Implemented automatic legal document (.docx) generation, which is a trending feature in the industry at the time. This site was meticulously tested to contain risk of cyber attacks, such as XSS, CSRF, DDoS and various kinds of spoofing.

`05` Wrote an operating system mimicking basic functions of Linux kernel. It boots on its own with MBR and runs in 32-bit protected mode and schedules tasks on a single processor. It features task management, memory management, I/O management, although lacks a file system.

`03` Web development for Mogu Travel Agency: A **Tornado** and **PostgreSQL** based web site. 

# 2010

`??` Learned to program ARM Cortex-M, megaAVR, STM51 chips and playing with LM amplifiers, 74 logic chips, 78 voltage regulators, etc, in high school out of interest, and just began to win some programming competitions here and there.
