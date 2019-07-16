---
title: How to undo with Git
subTitle: Quick tips to recover data using Git
cover: git.png
category: "Tips&Tricks"
---

Git is a **version control system** that tracks your project's changes over time and supports concurrent development workflow.

If you are actively using Git for your project, chances are that whatever you want to recover is actually sitting in some commit history of some branch at some local or remote location. That is not to say you are immune from loss of data, especially without a backup system, but odds of getting them back are pretty good. So we shall walk through common scenarios and answer how.

## Undo unstaged changes

If you made some changes to some particular files, but you never used `git add` on these files, then they are not staged for a git-commit. To recover the data before you have made such changes:

```
git checkout -- <paths>
```

This command will overwrite these file specified with ones stored in HEAD of current branch. The double dash `--` emphasizes that this is about files as opposed to branches or tags, without which there can be ambiguity.

See https://git-scm.com/docs/git-checkout/1.6.2.3

## Undo unstaged changes that are not even tracked

If your changes are not tracked by Git, in general, you can not recover using Git, with an exception of the undoing should result in removal of these files, in which case you can:

```
git clean -f
```
This would typically remove all the untracked files.

See https://git-scm.com/docs/git-clean

## Unstage some changes aka to undo git-add

If you regret running `git add` on some files, but have not committed, use `git reset` to reverse `git add`.

```
git reset -- <paths>
```

You want to git-reset all of them? You should:

```
git reset
```

See https://git-scm.com/docs/git-reset

## Undo git-commits that are not pushed

If you made a git-commit, you officially left a mark in the commit history, which you can see using `git log`.

To remove the last commit:

```
git reset HEAD^
```

To remove the last 2 commits:

```
git reset HEAD~2
```

To remove the last commit and undo changes therein committed:

```
git reset --hard HEAD^
```

To discard all local commits and changes therein committed (go back to your last git-pull):

```
git reset --hard
```

See https://git-scm.com/docs/git-reset

If you simply want to change some information about the last commit, such as a commit message use:

```
git commit --amend
```

If you are looking for undoing one file that was committed, use `git checkout`.

If the reason you want to undo a commit is because of a git merge conflict that you don't want to manually resolve, look up `git checkout --ours` or `git checkout --theirs` or `git merge --abort`.

If you are smart enough to commit things into a wrong branch like me, you could `git rebase`, but I typically just squash that commit and redo in the right place.

## What if I git-pushed?

Then it is possible that your mistake is also distributed to others. That's why a recommended remedy would be to make a new commit where you undo these changes, although the commit history keeps moving forward.
You may look up `git revert`, which will create forward commits in order to revert a commit.

## What if I committed something really stupid and I need to remove it from commit history?

This applies, for example, when you have committed sentitive data or some gigabytes of dataset into the repository. Here's how to delete them:

```
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch PATH-TO-YOUR-SENSITIVE-DATA' \
--prune-empty --tag-name-filter cat -- --all
```

or

```
git filter-branch --tree-filter 'rm -rf PATH-TO-YOUR-SENSITIVE-DATA' HEAD
```

See https://help.github.com/articles/removing-sensitive-data-from-a-repository/  
See also https://blog.ostermiller.org/git-remove-from-history

If you need to rewrite commit history, you would also need to use `git push -f` to force a git-push.

## A comprehensive guide on undoing Git

I don't blame you if your situation is unfortunately none of the above. Here's link to a much more comprehensive guide regarding this topic that hopefully covers your situation.

[On undoing, fixing, or removing commits in git](https://sethrobertson.github.io/GitFixUm/fixup.html)
