# Vi-Notes Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js (verify with `npm --version`)
- **Git**: For version control ([Download](https://git-scm.com/))
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/vicharanashala/vi-notes.git
cd vi-notes
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Backend Setup (New Terminal)

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Verify Setup

Open your browser:
- **Frontend**: http://localhost:3000 → Should see the editor
- **Backend Health**: http://localhost:5000/api/health → Should return JSON

---

## Detailed Setup Instructions

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd frontend
```

#### 2. Install Dependencies
```bash
npm install
```

This will install:
- React 18.2
- TypeScript
- Vite (build tool)
- Axios (HTTP client)
- And development dependencies

#### 3. Environment Configuration

Create `.env.local` in the `frontend/` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Vi-Notes
```

#### 4. Start Development Server

```bash
npm run dev
```

Output should show:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

#### 5. Open in Browser

Navigate to `http://localhost:3000` - you should see the Text Editor!

### Backend Setup

#### 1. Navigate to Backend Directory
```bash
cd backend
```

#### 2. Install Dependencies
```bash
npm install
```

This will install:
- Express.js
- TypeScript
- MongoDB driver (Mongoose)
- JWT authentication
- And development dependencies

#### 3. Environment Configuration

Create `.env.local` in the `backend/` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vi-notes
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**Note**: For Feature #1, you don't strictly need MongoDB. It will be required in Feature #2.

#### 4. Start Development Server

```bash
npm run dev
```

Output should show:
```
🚀 Vi-Notes Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Server running on http://localhost:5000
✓ Environment: development
✓ Frontend URL: http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 5. Verify Health Check

Open in your browser: `http://localhost:5000/api/health`

Should see:
```json
{
  "success": true,
  "message": "Vi-Notes backend is running",
  "timestamp": "2024-03-24T10:30:45.123Z"
}
```

---

## Project Structure

```
vi-notes/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Editor/
│   │   │       ├── TextEditor.tsx
│   │   │       └── TextEditor.css
│   │   ├── pages/
│   │   │   └── EditorPage.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── .gitignore
│
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   └── config/
│   │       └── database.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   ├── .env.example
│   └── .gitignore
│
├── docs/
│   ├── FEATURE_1_EDITOR.md
│   ├── SETUP.md (this file)
│   └── ...
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## Troubleshooting

### Issue: Port Already in Use

**Frontend Port 3000 is in use:**
```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Then restart: `npm run dev`

**Backend Port 5000 is in use:**
```bash
# Change in backend/.env.local
PORT=5001
```

### Issue: npm install hangs or times out

```bash
# Clear npm cache
npm cache clean --force

# Install with force flag
npm install --force

# Or use legacy peer deps
npm install --legacy-peer-deps
```

### Issue: TypeScript Compilation Errors

```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Rebuild TypeScript
npm run build
```

### Issue: Frontend won't connect to Backend

1. Verify backend is running on `http://localhost:5000`
2. Check health endpoint: `http://localhost:5000/api/health`
3. Verify `.env.local` has correct `VITE_API_URL`
4. Check browser console for CORS errors
5. Restart both servers

### Issue: Module not found errors

```bash
cd frontend
npm install

cd ../backend
npm install
```

### Issue: Vite app shows blank page

1. Check browser console (F12) for errors
2. Verify `npm run dev` is running
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check that all files exist in `src/` directory

---

## Development Workflow

### Making Changes

**Frontend Changes:**
1. Edit files in `frontend/src/`
2. Vite will automatically hot-reload in browser
3. No need to restart dev server

**Backend Changes:**
1. Edit files in `backend/src/`
2. Nodemon will automatically restart server
3. Check terminal for any errors

### Code Standards

- **Formatting**: Prettier (configured in package.json)
- **Linting**: ESLint (configured)
- **TypeScript**: Strict mode enabled

Run checks:
```bash
# Frontend
npm run lint

# Backend
npm run lint
```

---

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

Creates optimized build in `frontend/dist/`

### Backend Build

```bash
cd backend
npm run build
```

Creates compiled JavaScript in `backend/dist/`

### Running Production Build

**Frontend** (requires static server):
```bash
npm install -g serve
serve -s dist
```

**Backend**:
```bash
npm run start
```

---

## Environment Variables Reference

### Frontend (.env.local)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000` | Backend API base URL |
| `VITE_APP_NAME` | `Vi-Notes` | Application name |

### Backend (.env.local)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | No (Feature #1) | MongoDB connection string |
| `JWT_SECRET` | No (Feature #2) | Secret for JWT signing |
| `JWT_EXPIRE` | No | Token expiration (default: 7d) |
| `FRONTEND_URL` | No | Frontend URL for CORS |

---

## IDE Setup (VS Code)

### Recommended Extensions

1. **ES7+ React/Redux/React-Native snippets**
   - ID: dsznajder.es7-react-js-snippets

2. **Prettier - Code formatter**
   - ID: esbenp.prettier-vscode

3. **ESLint**
   - ID: dbaeumer.vscode-eslint

4. **Thunder Client** (for API testing)
   - ID: rangav.vscode-thunder-client

### VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Git Workflow

### Initial Clone

```bash
git clone https://github.com/vicharanashala/vi-notes.git
cd vi-notes
```

### Before Pushing Changes

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name
```

### Sync with Main Branch

```bash
git fetch origin
git rebase origin/main
```

---

## Performance Tips

### Frontend
- Clear browser cache if seeing old versions
- Use DevTools Performance tab to profile
- Check Network tab for slow API calls

### Backend
- Monitor CPU/Memory with `npm list`
- Check database query performance
- Use `console.time()` for profiling

---

## Support

If you encounter issues:

1. **Check Documentation**: Review [FEATURE_1_EDITOR.md](./FEATURE_1_EDITOR.md)
2. **Check Browser Console**: F12 → Console tab
3. **Check Terminal Errors**: Look for error messages in terminal
4. **Clear Cache**: `npm cache clean --force`
5. **Reinstall**: Delete `node_modules` and run `npm install` again

---

## Next Steps

After successful setup:

1. ✅ Verify the editor loads at `http://localhost:3000`
2. ✅ Try typing in the editor
3. ✅ Check word/character counts
4. ✅ Test the Save button
5. ✅ Test the Clear button
6. 📖 Read [FEATURE_1_EDITOR.md](./FEATURE_1_EDITOR.md) for detailed documentation
7. ➡️  Move to Feature #2: User Login and Registration

---

**Last Updated**: March 24, 2026
**Version**: 1.0.0
