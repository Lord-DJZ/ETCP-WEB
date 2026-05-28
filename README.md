# ETCP-WEB

Eco Tourism Ceylon Platform website prototype built with HTML, CSS, and JavaScript.

## Project Files

- `index.html` - home page
- `search.html` - trip search page
- `details.html` - destination or package details page
- `booking.html` - booking page
- `login.html` - login page
- `styles.css` - main styling
- `script.js` - shared website interactions
- `assets/` - images and videos used by the website

## How to Start

This project is a static website, so there is no install or build step.

### Option 1: Open Directly

Open `index.html` in your browser.

### Option 2: Run With a Local Server

From the project folder, run:

```powershell
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

If Python is not installed, you can also use the VS Code Live Server extension and choose `Open with Live Server` on `index.html`.

## Git Push Steps

Check the current changes:

```powershell
git status
```

Add the changed files:

```powershell
git add README.md
```

Commit the update:

```powershell
git commit -m "Update README with start and push instructions"
```

Push to GitHub:

```powershell
git push origin main
```

After pushing, refresh the GitHub repository page to see the updated README.

## First-Time Git Setup

If this project is not connected to GitHub yet, run:

```powershell
git init
git branch -M main
git remote add origin https://github.com/Lord-DJZ/ETCP-WEB.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

Do not commit temporary files, editor folders, or private credentials.
