# GitHub Upload Guide (Step-by-Step)

Is folder me sirf aur sirf Git ke liye zaroori important files hain (heavy `node_modules` aur build cache ko exclude kar diya gaya hai).

---

### Step 1: GitHub par New Repository banayein
1. Apne browser me **[https://github.com](https://github.com)** kholein.
2. Top right corner par **`+`** icon par click karke **New repository** select karein.
3. Repository name daalein: e.g. `blockchain-certificate-verification`
4. Public select karein aur **Create repository** par click karein.
5. Apni repository ka URL copy kar lein (e.g. `https://github.com/username/blockchain-certificate-verification.git`).

---

### Step 2: Terminal me ye Commands chalayein
Isi folder (`CertiChain-GitHub-Upload`) me Terminal ya PowerShell open karein aur ye 5 commands run karein:

```bash
git init
git add .
git commit -m "feat: initial commit for Blockchain Certificate Verification System"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL_HERE
git push -u origin main
```
*(Note: `YOUR_GITHUB_REPOSITORY_URL_HERE` ki jagah apna copied GitHub link paste karein).*

---

### Agar kisi doosre computer par ye project run karna ho to:
GitHub se clone karne ke baad sirf ye 3 commands chalani hongi:

```bash
# 1. Dependencies install karein
npm install

# 2. Local blockchain start karein
npm run node

# 3. Contract deploy karein aur dev server run karein
npm run deploy
npm run dev
```
