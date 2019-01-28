---
title: My Arch systems quick manual
subTitle: A single-page documentation for my Arch Linux systems
cover: arch.png
category: "Tips"
---

# Backup
## Full system backup

**Stuff to exclude** @ `/root/backup.exclude`

```
/proc
/tmp
/mnt
/dev
/sys
/run
/var/log
/var/cache/pacman/pkg
/var/lib/docker
/root/.cache
/home/*/.cache
```

**Backup**
```sh
tar --exclude-from=/root/backup.exclude -Ipbzip2 --xattrs -cpf /mnt/latitude-5289-backup.tar.bz2 /
```

**Restore**
```sh
bsdtar --xattrs -xpf /backup/latitude-5289-backup.tar.bz2
mkdir proc tmp mnt dev sys run
```

_ref_. https://help.ubuntu.com/community/BackupYourSystem/TAR

# Boot

## Initramfs

Get kernel version
```sh
lsinitcpio /boot/initramfs-linux.img | grep 'modules/.*-ARCH$'
```

Update kernel
```
pacman -Sy
pacman -S filesystem linux
```

## Yubikey LUKS encryption

### Package setup for Live CD

```sh
# Add sudoer
ME=alex
HOME=/home/${ME}
mkdir ${HOME}
chown ${ME}:${ME} ${HOME}
useradd -d ${ME}
echo "${ME} All=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${ME}"

# Install ykfde-* commands
pacman -Sy binutils fakeroot make git
wget https://raw.githubusercontent.com/agherzan/yubikey-full-disk-encryption/master/PKGBUILD
makepkg -srci

# To install pre-build package without sudoer
pacman -Sy
pacman -U *.xz
```

> May be helpful to save to `/boot`.

### Configure

+ /etc/ykfde.conf `<<< make sure this is the first thing to set up!`
+ /etc/mkinitcpio.conf
 `HOOKS=(base udev resume autodetect keyboard keymap modconf block ykfde filesystems fsck)`

### Prepare device

```sh
DEVICE=/dev/nvme0n1p4
ykfde-format --cipher aes-xts-plain64 --key-size 512 --hash sha512 ${DEVICE}
ykfde-open -d ${DEVICE} -n root
mkfs.ext4 ${DEVICE}
```

# Storage

## ZFS

### Install

*ref*. https://github.com/zfsonlinux/zfs/wiki/Signing-Keys

```sh
gpg --keyserver pgp.mit.edu --recv C77B9667
gpg --keyserver pgp.mit.edu --recv D4598027
gpg --keyserver pgp.mit.edu --recv C6AF658B
sudo pacman -S patch
yaourt -S zfs-linux
sudo systemctl enable zfs.target
sudo systemctl enable zfs-import-cache
sudo systemctl enable zfs-mount
sudo systemctl enable zfs-import.target
```

### Schedule zpool scrubbing

*AUR*: `systemd-zpool-scrub`

**zpool-scrub@.service**
```sh
[Unit]
Description=Scrub ZFS Pool
Requires=zfs.target
After=zfs.target

[Service]
Type=oneshot
ExecStartPre=-/usr/sbin/zpool scrub -s %I
ExecStart=/usr/sbin/zpool scrub %I
```

**zpool-scrub@.timer**
```sh
[Unit]
Description=Scrub ZFS pool weekly

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
```

**Usage**
```sh
install -m 644 -o root -g root zpool-scrub@.service /etc/systemd/system
install -m 644 -o root -g root zpool-scrub@.timer /etc/systemd/system

systemctl daemon-reload
systemctl enable --now zpool-scrub@tank.timer
```

**Check systemctl timers**
```sh
systemctl list-timers
```

# Terminal

## Shell

```
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

# Change theme
sed -i -e 's/^ZSH_THEME=.*$/ZSH_THEME="af-magic"/g' ~/.zshrc
```

## Vim

```
curl 'http://vim-bootstrap.com/generate.vim' --data 'langs=c&langs=go&langs=haskell&langs=html&langs=javascript&langs=lisp&langs=lua&langs=perl&langs=php&langs=python&langs=ruby&langs=rust&langs=scala&editor=vim' > ~/.vimrc

vim # Enter vim once to get packages installed
cat <<EOF >~/.vimrc.local
colorscheme darkblue
let g:airline_theme = 'cool'
EOF
```

To update:

```
:VimBootstrapUpdate
:PlugInstall
```

ref: https://github.com/avelino/vim-bootstrap#commands

# Graphics

## xinitrc

```
#!/bin/sh
# xrandr --dpi 180
xrdb -merge ~/.Xresources
~/bin/2in1screen &
redshift &>/dev/null &
exec i3

#vncviewer 172.16.94.65:5901 &
#exec openbox
#exec vncviewer 172.16.94.65:5901
```

# Network

## AutoSSH Tunnel

**/etc/systemd/system/mytunnel@.service**
```sh
[Unit]
Description=AutoSSH remote tunnel into %i
After=network.target

[Service]
User=alex
Environment="AUTOSSH_GATETIME=0"
ExecStart=/usr/bin/autossh -M 21300 -o "ServerAliveInterval 30" -o "ServerAliveCountMax 3" -N -R 21322:localhost:22 %i

[Install]
WantedBy=multi-user.target
```

**Allow AutoSSH heartbeat through the firewall**

```iptables
-A INPUT -p tcp -m tcp -s 128.206.0.0/16 --dport 21300 -j ACCEPT
```

**Example**
```sh
sudo systemctl enable --now mytunnel@ballast.service 
```

## DNS

Configure `dnsmasq` to work with `openresolv` https://wiki.archlinux.org/index.php/dnsmasq#openresolv
and poll configurations from `resolvconf`, which can expose the DNS update API to OpenVPN.

Start `dnsmasq` as a standalone caching service and disable DNS configuration from the network manager.
All DNS queries should run by `dnsmasq` through localhost.

# Travelling

## Switching time zone

To use UCT as RTC time zone:

```
timedatectl set-local-rtc 0
```

An example to set the time zone to Shanghai:

```
timedatectl set-timezone Asia/Shanghai
```

Sync time:

https://wiki.archlinux.org/index.php/Systemd-timesyncd

## Typing foreign languages

Get current keyboard layout, etc.

```
setxkbmap -query
```

An example to add a Russian keyboard and use right Alt key to switch back and forth.

```
setxkbmap -layout us,ru -option grp:toggle

```

# Vendors Specific
## BIOS configurations for a new Dell device

1. Find `System Configuration` > `SATA Operation` and change from RAID to AHCI. This will trash the Windows system that comes with the new laptop, and also directly expose the NVMe as a block device.
2. Get rid of `Secure Boot`


