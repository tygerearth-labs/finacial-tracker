# 🚀 Cara Push ke GitHub - Panduan Lengkap

## 📋 Prerequisites
- Akun GitHub (gratis di github.com)
- Git sudah terinstall (sudah ada di sistem)

---

## 🌐 Langkah 1: Buat Repository di GitHub

### 1.1 Login ke GitHub
1. Buka [github.com](https://github.com)
2. Login atau Sign Up
3. Klik tombol **"New"** di kanan atas
4. Pilih **"New repository"**

### 1.2 Create Repository
1. **Repository name:** `financial-tracker`
2. **Description:** `Aplikasi pencatatan keuangan modern dengan Next.js`
3. **Visibility:** Pilih **Public** (gratis) atau **Private**
4. **Jangan centang** "Add a README file", "Add .gitignore", atau "Choose a license"
5. Klik **"Create repository"**

### 1.3 Copy Repository URL
Setelah repository dibuat, Anda akan melihat:
```
…or create a new repository on the command line
echo "# financial-tracker" >> README.md
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/username/financial-tracker.git
git push -u origin main
```

**Copy URL:** `https://github.com/username/financial-tracker.git`

---

## 💻 Langkah 2: Setup Git di Local

### 2.1 Check Git Status
```bash
git status
```
Output seharusnya:
```
On branch master
nothing to commit, working tree clean
```

### 2.2 Check Remote Repository
```bash
git remote -v
```
Jika belum ada output, kita perlu menambahkan remote.

---

## 🔗 Langkah 3: Connect Local ke GitHub

### 3.1 Add Remote Repository
```bash
# Ganti username dengan GitHub username Anda
git remote add origin https://github.com/username/financial-tracker.git
```

### 3.2 Verify Remote
```bash
git remote -v
```
Output seharusnya:
```
origin  https://github.com/username/financial-tracker.git (fetch)
origin  https://github.com/username/financial-tracker.git (push)
```

---

## 📤 Langkah 4: Push ke GitHub

### 4.1 Add All Files
```bash
git add .
```

### 4.2 Commit Changes
```bash
git commit -m "Initial commit - Financial Tracker application ready for deployment"
```

### 4.3 Push to GitHub
```bash
git push -u origin main
```

**Jika error "Authentication failed", lanjut ke Langkah 5.**

---

## 🔐 Langkah 5: Setup Authentication (Jika Diperlukan)

### 5.1 Method 1: Personal Access Token (Recommended)

#### Buat Personal Access Token:
1. Login ke GitHub
2. Klik profile photo → **Settings**
3. Scroll ke bawah → **Developer settings**
4. Klik **Personal access tokens** → **Tokens (classic)**
5. Klik **Generate new token**
6. **Note:** `Financial Tracker Deployment`
7. **Expiration:** pilih tanggal (recommended 90 days)
8. **Scopes:** Centang **repo** (Full control of private repositories)
9. Klik **Generate token**
10. **Copy token** (simpan di tempat aman!)

#### Gunakan Token:
```bash
# Remove existing origin (jika ada)
git remote remove origin

# Add origin dengan token
git remote add origin https://username:token@github.com/username/financial-tracker.git

# Push
git push -u origin main
```

### 5.2 Method 2: SSH Key (Advanced)

#### Generate SSH Key:
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

#### Add SSH Key ke GitHub:
1. GitHub → Settings → SSH and GPG keys
2. Click **New SSH key**
3. Paste public key
4. Click **Add SSH key**

#### Use SSH URL:
```bash
# Remove HTTPS origin
git remote remove origin

# Add SSH origin
git remote add origin git@github.com:username/financial-tracker.git

# Push
git push -u origin main
```

---

## 🔄 Langkah 6: Update Code (Future Commits)

### 6.1 Check Changes
```bash
git status
```

### 6.2 Add Changes
```bash
git add .
# atau spesifik file
git add src/components/navbar.tsx
```

### 6.3 Commit Changes
```bash
git commit -m "Update navbar with session management"
```

### 6.4 Push Changes
```bash
git push
```

---

## 🛠️ Git Commands Dasar

### **Status & History**
```bash
git status                    # Lihat perubahan
git log --oneline             # Lihat commit history
git diff                      # Lihat perubahan detail
```

### **Branch Management**
```bash
git branch                    # Lihat branch
git branch new-feature        # Buat branch baru
git checkout new-feature      # Pindah ke branch
git merge new-feature         # Merge branch
git branch -d new-feature     # Hapus branch
```

### **Undo Changes**
```bash
git checkout -- filename     # Undo file changes
git reset HEAD~1              # Undo last commit
git reset --hard HEAD~1       # Undo last commit + changes
```

---

## 🚨 Troubleshooting

### **Error: "Authentication failed"**
```bash
# Solution 1: Use Personal Access Token
git remote set-url origin https://username:token@github.com/username/financial-tracker.git

# Solution 2: Use SSH
git remote set-url origin git@github.com:username/financial-tracker.git
```

### **Error: "Permission denied"**
- Pastikan token memiliki `repo` scope
- Pastikan repository URL benar
- Coba generate token baru

### **Error: "fatal: couldn't find remote ref refs/heads/main"**
```bash
# Push ke main branch
git push -u origin main

# Atau set default branch
git branch -M main
```

### **Error: "Updates were rejected because the remote contains work that you do not have"**
```bash
# Pull latest changes
git pull origin main

# Then push
git push
```

---

## 📱 GitHub Desktop (GUI Alternative)

### Install GitHub Desktop:
1. Download dari [desktop.github.com](https://desktop.github.com)
2. Install dan login
3. **File → Add Local Repository**
4. Pilih folder project
5. Masukkan repository URL
6. Click **Publish Repository**

---

## 🎉 Success Check

### Verify di GitHub:
1. Buka repository GitHub Anda
2. Semua file harus muncul
3. Commit history terlihat
4. README.md ter-generate otomatis

### Verify di Local:
```bash
git status
# Output: "nothing to commit, working tree clean"

git log --oneline -1
# Output: "xxxxxxxx Initial commit - Financial Tracker application ready for deployment"
```

---

## 🔄 Next Steps Setelah Push

### **Auto-Deploy ke Vercel:**
1. Hubungkan GitHub ke Vercel
2. Setiap push akan auto-deploy
3. Preview untuk setiap PR

### **Collaboration:**
- Invite collaborators di GitHub
- Review code dengan Pull Requests
- Issues tracking untuk bug reports

---

## 📋 Quick Reference

```bash
# One-time setup
git remote add origin https://github.com/username/financial-tracker.git
git add .
git commit -m "Initial commit"
git push -u origin main

# Daily workflow
git add .
git commit -m "Update feature"
git push
```

---

## 🆘 Help

### **GitHub Documentation:**
- [GitHub Docs](https://docs.github.com)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

### **Community:**
- [GitHub Community Forum](https://github.community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/github)

---

## 🎯 Tips Pro

1. **Commit messages yang jelas:** "Fix navbar responsive issue"
2. **Push frequently:** Jangan menumpuk terlalu banyak changes
3. **Use .gitignore:** Jangan commit node_modules, .next, env files
4. **Branch untuk features:** Gunakan branch untuk development
5. **Pull requests:** Review code sebelum merge ke main

---

**Selamat! Aplikasi Anda sekarang ada di GitHub! 🎉**