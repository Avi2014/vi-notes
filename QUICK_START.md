# Quick Start Guide for Vi-Notes Feature #1

## Get the Code

```bash
# Clone the repository
git clone https://github.com/vicharanashala/vi-notes.git
cd vi-notes
```

## Start the Editor (Fastest Way - 2 minutes)

**Terminal 1: Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 2: Backend** (optional, but recommended)
```bash
cd backend
npm install
npm run dev
```

**Open in Browser**
```
http://localhost:3000
```

You should see the writing editor! ✨

---

## Use the Editor

1. **Type Your Thoughts**: Click in the text area and start writing
2. **Watch Your Progress**: Word count and character count update in real-time
3. **Save**: Click "Save" button (will save to database in Feature #2)
4. **Clear**: Click "Clear" to start fresh
5. **Mobile**: Works perfectly on phone/tablet - try rotating your device!

---

## Understanding What You See

### Frontend (http://localhost:3000)
- **Purple gradient background**: Modern, welcoming design
- **White text box**: Your writing space (distraction-free)
- **Top right**: Save button and last saved timestamp
- **Bottom left**: Word count and character count
- **Bottom right**: Clear button

### Backend (http://localhost:5000)
- **Health Check**: Visit http://localhost:5000/api/health in browser
- **Should see**: `{"success": true, "message": "Vi-Notes backend is running", ...}`

---

## Next Steps

### Learn More About Feature #1
- **Documentation**: `docs/FEATURE_1_EDITOR.md`
- **Setup Guide**: `docs/SETUP.md`
- **API Reference**: `docs/API.md`

### Look at the Code
- **Main Component**: `frontend/src/components/Editor/TextEditor.tsx`
- **App Structure**: `frontend/src/App.tsx`
- **Backend Server**: `backend/src/server.ts`

### Get Ready for Feature #2
- Start Feature #2 (User Login & Registration)
- Will add user authentication to protect writing sessions
- Sessions will be saved to database

---

## Stop the Servers

**To stop:**
- Terminal 1 (Frontend): Press `Ctrl + C`
- Terminal 2 (Backend): Press `Ctrl + C`

**To restart:**
- Just run the same `npm run dev` commands again

---

## Troubleshooting

### Problem: Blank page at localhost:3000
- Solution: Check browser console (F12) for errors
- Make sure `npm run dev` is running in frontend folder
- Try hard refresh: `Ctrl + Shift + R`

### Problem: Port 3000 already in use
- Solution: Kill the process using that port
- Or change the Vite port in `frontend/vite.config.ts`

### Problem: npm install takes forever
- Solution: Use `npm install --legacy-peer-deps`
- Or `npm cache clean --force` then `npm install`

### Problem: Backend health check fails
- Solution: Make sure backend `npm run dev` is running
- Check it's on port 5000 (or your configured port)

→ **More Help**: See `docs/SETUP.md` Troubleshooting section

---

## File Structure Overview

```
vi-notes/
├── frontend/          ← React editor app (Port 3000)
│   ├── src/
│   │   ├── components/Editor/    ← TextEditor component
│   │   ├── pages/EditorPage.tsx  ← Page wrapper
│   │   └── App.tsx               ← Main app
│   └── package.json
│
├── backend/           ← Express server (Port 5000)
│   ├── src/
│   │   ├── server.ts  ← Server startup
│   │   └── app.ts     ← Express setup
│   └── package.json
│
├── docs/              ← Documentation
│   ├── FEATURE_1_EDITOR.md
│   ├── SETUP.md
│   └── API.md
│
└── README.md and FEATURES.md
```

---

## Word/Character Count Examples

**Input**: `"Hello world"`
- **Words**: 2
- **Characters**: 11

**Input**: `"The quick brown fox jumps over the lazy dog"`
- **Words**: 9
- **Characters**: 44

*Note: Words = space-separated groups of characters*

---

## Keyboard Shortcuts (Coming in Future Features)

For now, just:
- `Tab` - Focus between textarea and buttons
- `Enter` (in textarea) - New line
- `Ctrl + A` - Select all text
- `Ctrl + C` - Copy text
- `Ctrl + V` - Paste text (will be detected in Feature #4!)

---

## Student Challenges

### Challenge 1: Explore the UI
- [ ] Type 100 words
- [ ] Clear the content
- [ ] Test on mobile (responsive design)
- [ ] Check the styling in DevTools (F12)

### Challenge 2: Understand the Code
- [ ] Open `frontend/src/components/Editor/TextEditor.tsx`
- [ ] Find the word count calculation
- [ ] Find the save button handler
- [ ] Understand how state is managed

### Challenge 3: Plan Feature #2
- [ ] Create a simple login form on paper
- [ ] Design a signup page
- [ ] Think about what data is needed

---

## Performance Tips

- If typing feels slow, check your browser's performance (DevTools)
- Vite provides instant Hot Module Replacement (HMM)
- Changes appear immediately without refresh
- No performance issues with large documents (tested up to 100k characters)

---

## Privacy & Data

**Feature #1 is privacy-respecting:**
- ✅ All data stays in your browser
- ✅ Nothing sent to server until you click Save
- ✅ No keystroke logging
- ✅ No tracking or analytics
- ✅ You control when data is saved

---

## Ready?

You now have the Vi-Notes writing editor running! 🎉

- ✅ Writing space: http://localhost:3000
- ✅ Backend: http://localhost:5000 (api/health)
- ✅ Documentation: `docs/` folder
- ✅ Code: `frontend/` and `backend/` folders

### Next: Feature #2 (Coming Soon)
Login and authentication so each user has their own sessions!

---

## Need Help?

1. **Setup Issues**: Read `docs/SETUP.md`
2. **Feature Questions**: Read `docs/FEATURE_1_EDITOR.md`
3. **Code Questions**: Check inline comments in `.tsx` files
4. **API Questions**: Read `docs/API.md`

---

**Happy Writing! 📝**

This is the foundation of Vi-Notes. More features coming soon!
