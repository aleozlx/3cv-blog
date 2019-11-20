---
title: OSG User School 2018 Experience
subTitle: Learning High Throughput Grid Computing with HTCondor at UW
cover: HTCondor.png
category: "Blog"
---

# Draft notes

https://docs.google.com/document/d/15DTPmBkd7xw8gXzVu1MVpHeo3BNNMnko9wsheocMy0s  
http://opensciencegrid.org/user-school-2018/#curriculum/assignment/  

# Monday

## Running simple jobs with HTCondor (hands-on)

- Runs any executable
- A submit file that specifies jobs

## Running Many HTC Jobs (lecture)
- Variables (ids, lists: syntax of this looks a bit like list comprehensions, even from csv files) inside of the submit file that facilitates a scatter pattern
- Transfers data (files or directories) as opposed shared file system. (Sensitive data?)
- Jobs requirements can be edited when put on hold
- Schedule based on past usage / fairness

## HTCondor Job Matching and Automation (lecture)
- They have a standalone version for personal multithreaded computers
- Slot/Job ClassAd is used to  match resources
- Some machines supports GPUs
    http://chtc.cs.wisc.edu/gpu-jobs.shtml
- they have got 24 gpu machines in UW
- Jobs are run  with ssh authenticated user or a dummy user permission
- Supports ssh into the worker node with condor_ssh_to_job
- Supports submission in interactive mode i.e. transfer + drop into remote shell: great for developing jobs
- Supports dockers via the docker universe
- Limitation: Data transfer at the beginning and end of a batch of jobs. IO bottleneck may occur here.

[Docker vs Singularity vs Shifter in an HPC environment](http://geekyap.blogspot.com/2016/11/docker-vs-singularity-vs-shifter-in-hpc.html)

## Automating HTC Workflows (lecture)
- DAGMan DAG workflow submission
- DAG workflow jobs are coordinated by a "DAG job"
- DAG splices that may contain another DAG, and external DAGs that may load a DAG dynamically
-  Generates a "rescue DAG" upon job failure for progress recovery

# Tuesday

## Introduction to DHTC and overlay systems (lecture)
- Cloud backend with condor_annex
- Physical Condor pools (compute clusters) federated using an overlay system that creates logical pools where user jobs can be distributed.

# Wednesday

## Compiled software and wrapper scripts (hands-on)
- Packaging Matlab code (resulting in a license free binary that can be freely distributed; there exists Matlab toolboxes that cannot be statically compiled though) http://opensciencegrid.org/user-school-2018/#materials/day3/part2-ex1-matlab/
- Packaging source-built Python interpreter (supporting newer versions of Python)
- Packaging docker

## Container & GPU talk
- Supports Docker or Singularity with GPU support
- Condor docker integration for security reasons
- Supports nvidia-docker
- GPU resources are pretty scarce in the grid

# Thursday

## OSG Connect (lecture)
- OASIS is OSG maintained pre-compiled software repositories
- These repositories are not exactly permanently installed on the compute nodes.
- Package requirements can be provided to make sure a OASIS module exist on the compute node

## HTC considerations for "big data"? (lecture)
- 140M (CoreHrs / mo) util over the OSG grid and increasing
- Stash and GridFS for high volume transfers

## Solutions for large input data (lecture)

- Web files are usually cached into a storage which has proximity to the execute node
- StachCache on OSGConnect is a public distributed storage

## Large output and local file systems (lecture)

- Writing back to StachCache is experimental, also how to grant write permissions to the right people?
- Recommend to write large output to Gluster or S3.
