# GateForge PWA — Deploy Guide

## 📁 Files
- index.html      → Main app shell
- GateForge-2.jsx → Your app code
- manifest.json   → PWA settings
- sw.js           → Offline support
- icons/          → App icons

---

## 🚀 Deploy करायचे Options (सर्व FREE)

### Option 1 — Netlify (सर्वात सोपं, 2 मिनिट)
1. https://netlify.com वर जा → Sign up (free)
2. "Add new site" → "Deploy manually"
3. हा GateForge-PWA folder drag & drop करा
4. तुला मिळेल: `https://yourname.netlify.app`
5. Phone वर उघड → "Add to Home Screen" → Done! ✅

### Option 2 — Vercel
1. https://vercel.com → Sign up
2. New Project → Upload folder
3. Deploy → Link मिळेल

### Option 3 — GitHub Pages (Free forever)
1. GitHub account बनव
2. New repository → "gateforge"
3. सगळ्या files upload करा
4. Settings → Pages → Enable
5. `https://username.github.io/gateforge` वर app ready!

---

## 📲 Phone वर Install कसं करायचं?

Deploy केल्यावर:
1. Chrome मध्ये तुझी link उघड
2. 3 dots menu (⋮) → "Add to Home screen"
3. "Install" → Done!

App icon home screen वर येईल — exactly APK सारखं! ✅

---

## ✅ Features
- Offline काम करतो (Service Worker)
- Home screen icon येतो
- Full screen (no browser bar)
- App सारखा feel
- Data localStorage मध्ये save होतो

---

## 🔧 Name बदलायचं असेल तर
manifest.json मध्ये "name" आणि "short_name" edit करा.
