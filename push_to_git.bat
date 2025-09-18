@echo off
setlocal enabledelayedexpansion

:: Step 1: Check if in a project folder
if not exist "%cd%\*" (
    echo [ERROR] No project found in current directory.
    pause
    exit /b
)

:: Step 2: Initialize git repo if not already
if not exist ".git" (
    echo Initializing new Git repository...
    git init
) else (
    echo Git repository already initialized.
)

:: Step 3: Ask for remote origin
set /p remoteUrl=Enter your Git remote origin URL:

:: Step 4: Add all files and commit
git add .
git commit -m "Initial commit" || echo Nothing to commit.

:: Step 5: Set remote origin (force update if exists)
git remote remove origin 2>nul
git remote add origin %remoteUrl%

:: Step 6: Ask for branch name
set /p branchName=Enter branch name to push (default: main):
if "%branchName%"=="" set branchName=main

:: Step 7: Push to remote
echo Pushing code to %remoteUrl% on branch %branchName%...
git push -u origin %branchName%

echo Done!
pause

