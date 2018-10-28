---
title: Let's pacstrap Arch into a GCE
subTitle: Creating an ArchLinux GCP image from a bootstrap image
cover: arch.png
category: "Tips&Tricks"
---

## Intro

ArchLinux isn't as general as other Linux distributions.
Usually, some software does not actively support ArchLinux. Instead, it may be lucky to be supported.
Reasonably, GCP doesn't officially provide Arch images either.
That is because ArchLinux is built to be customized and personalized, and Arch users run their own risk of putting up with a fiddly system that can potentially crash any day if not enough care was taken, and they have entirely themselves to blame because all the official packages are stable and optimized to be fair.
I thought it would be nice to have a cloud environment where I can experiment with new ideas for building my system.
The goal here is to develop a way to build a reasonably comfortable-to-use base image with Google Cloud.

## Ingredients

* A builder machine with just standard CPU/memory setting.
* 64G disk space for shuffling things around.
* 10G (exactly) separate disk to pacstrap to and image from.

## Plan of Attack

1. Download and chroot into an Arch bootstrap environment so we have to tools to pacstrap Arch.
2. Format the 10G disk and pacstrap base system into this drive.
3. Chroot into the base system and finish ArchLinux installation.
4. Go back to host and sync and umount the 10G disk.
4. Create a GCP boot image out of the 10G disk by raw cloning and compressing into a tar ball.
5. Upload to a GCP bucket and try to create a new VM from the boot image.

## Step 1: Setup Builder Environment

I would create a new VM on GCP with the above specs with CentOS 7 on it.

```sh
sudo -i
cd /tmp
```

## Step 2: Create Bootstrap Environment

Downloading bootstrap image.

```sh
curl http://mirror.rackspace.com/archlinux/iso/2018.10.01/archlinux-bootstrap-2018.10.01-x86_64.tar.gz | tar xz
```

Enable a pacman mirror server. e.g.

```sh
sed -i -r -e 's/^#(.*mirrors\.acm.*)$/\1/g' root.x86_64/etc/pacman.d/mirrorlist
```

After the chroot, we will start ArchLinux way of doing things.

```sh
root.x86_64/bin/arch-chroot root.x86_64/
```

Generate entropy to help create key ring.

```sh
dd if=/dev/urandom of=/dev/sdb &
pacman-key --init
pacman-key --populate archlinux
kill %1
```

Pacstrap!

```sh
echo 'type=83' | sfdisk /dev/sdb
mkfs.ext4 /dev/sdb1
mount /dev/sdb1 /mnt
pacstrap /mnt base vim grub openssh sudo
```

## Step 3: System Installation

```sh
genfstab -U /mnt >> /mnt/etc/fstab
arch-chroot /mnt
```

Looks familiar? Follow through [ArchWiki: Installation_guide / Configure the system](https://wiki.archlinux.org/index.php/Installation_guide#Configure_the_system).

A few tricks:

### Locale generation for American English

```sh
sed -i -r -e 's/^#(en_US.UTF-8.*)$/\1/g' /etc/locale.gen
echo 'LANG=en_US.UTF-8' > /etc/locale.conf
locale-gen
```

### Give myself passwordless sudo

```sh
ME=alex
useradd ${ME}
echo "${ME} All=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${ME}"
mkdir -p "/home/${ME}"
chown alex:alex "/home/${ME}"
```

### Enable ethernet & ssh

```sh
ETH=$(ip -o link show | awk -F': ' '{print $2}' | grep '^e')
sed -e "s/^Interface=.*/Interface=${ETH}/" /etc/netctl/examples/ethernet-dhcp > "/etc/netctl/${ETH}-profile"
netctl enable "${ETH}-profile"
systemctl enable sshd
```

> Make sure a password or a key is set.

### Edit grub and fstab config for GCP console

```sh
sed -i -e 's/GRUB_CMDLINE_LINUX_DEFAULT=.*/GRUB_CMDLINE_LINUX_DEFAULT="console=ttyS0,38400n8d"/g' /etc/default/grub
grub-mkconfig -o /boot/grub/grub.cfg
grub-install --target=i386-pc /dev/sdb

ROOT=$(sed -n -r -e 's/^.*UUID=([^ ]+).*$/\1/p' /boot/grub/grub.cfg | head -n 1)
sed -i -e "s/^\/dev\/sdb1/UUID=${ROOT}/" /etc/fstab
```

### Finish up system installation

```sh
exit
sync
umount /mnt
exit
```

## Step 4: Create Boot Image

Back in the host OS, for me, this is CentOS 7. (n.b. We can't do this from the bootstrap environment because it does not have `tar`.)

```sh
dd if=/dev/sdb of=/tmp/disk.raw bs=4M conv=sparse
cd /tmp && tar Sczf arch-linux.tar.gz disk.raw
```

I got a nice 700MB+ boot image!

```
[root@instance-1 tmp]# ls -hl *.tar.gz
-rw-r--r--. 1 root root 744M Oct 28 03:47 arch-linux.tar.gz
```

Now upload.

```sh
gsutil cp arch-linux.tar.gz gs://BUCKET_NAME_HERE/os-images
```

## Step 4: Create a New GCP Image and a Test VM

Now you should be able to easily create these from GCP Console.
GCP won't be able to transfer project-wide key into this instance, so access it directly with ssh.
