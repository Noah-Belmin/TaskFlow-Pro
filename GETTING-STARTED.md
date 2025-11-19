# TaskFlow Pro - Getting Started & Troubleshooting

## Quick Start Guide

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd TaskFlow-Pro
```

### 2. Install Dependencies
**IMPORTANT:** You must run this first!
```bash
npm install
```

This will install all required packages (~135 packages). It may take 1-2 minutes.

### 3. Start Development Server
```bash
npm run dev
```

You should see:
```
VITE v4.5.14  ready in 303 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 4. Open in Browser
Navigate to **http://localhost:5173/** in your web browser.

---

## Common Issues & Solutions

### Issue 1: "Cannot find module" or "Module not found"
**Solution:** You forgot to run `npm install`
```bash
npm install
```

### Issue 2: "Port 5173 is already in use"
**Solution:** Either kill the existing process or use a different port
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# OR use a different port
npm run dev -- --port 3000
```

### Issue 3: Blank white screen in browser
**Possible causes:**
1. Check browser console for errors (F12 → Console tab)
2. Make sure you're using a modern browser (Chrome, Firefox, Edge, Safari latest)
3. Clear browser cache and reload (Ctrl+Shift+R or Cmd+Shift+R)

**Solution:**
```bash
# Clear build cache and reinstall
rm -rf node_modules dist
npm install
npm run dev
```

### Issue 4: TypeScript errors
**Solution:** Make sure TypeScript is installed
```bash
npm install -D typescript
```

### Issue 5: "npm: command not found"
**Solution:** Install Node.js and npm
- Download from: https://nodejs.org/
- Recommended: Node.js 18.x or higher

---

## Requirements

- **Node.js:** 18.x or higher
- **npm:** 9.x or higher
- **Browser:** Chrome, Firefox, Edge, or Safari (latest version)
- **OS:** Windows, macOS, or Linux

### Check Your Versions
```bash
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
```

---

## Project Structure

```
TaskFlow-Pro/
├── src/                    # Source code
│   ├── components/        # React components
│   │   ├── ui/           # UI component library
│   │   ├── NewTaskModal.tsx
│   │   ├── DashboardView.tsx
│   │   ├── ListView.tsx
│   │   └── KanbanView.tsx
│   ├── App.tsx           # Main application
│   ├── types.ts          # TypeScript types
│   ├── utils.ts          # Utility functions
│   ├── main.tsx          # Entry point
│   └── index.css         # Styles
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
└── tailwind.config.js    # Tailwind config
```

---

## Available Commands

```bash
# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run tsc
```

---

## Features to Test

Once the app is running, test these features:

### 1. Create a New Task
- Click the **"New Task"** button in the top right
- Fill in the form (title is required)
- Click **"Create"**
- Task should appear in all views

### 2. Switch Views
- **Dashboard** - See statistics and high-priority tasks
- **List View** - Searchable table with all tasks
- **Kanban Board** - Tasks organized by status

### 3. Update Task Status
- In **List View**: Use the dropdown to change status
- In **Kanban View**: Use the dropdown in each card

### 4. Delete a Task
- In **List View**: Click the trash icon
- Confirm the deletion

### 5. Search & Filter
- In **List View**: Use the search box
- Filter by status using the dropdown

### 6. Export Tasks
- Click **"Export CSV"** button
- Download your tasks as a CSV file

### 7. Data Persistence
- Create some tasks
- Refresh the page
- Tasks should still be there (saved to localStorage)

---

## Development Tips

### Enable Hot Reload
Vite has hot module replacement (HMR) enabled by default. When you save a file, the browser will automatically update without a full page reload.

### Debugging
- Open browser DevTools: F12 (Windows/Linux) or Cmd+Option+I (Mac)
- Check the **Console** tab for errors
- Check the **Network** tab for failed requests
- Check **Application → Local Storage** to see saved tasks

### Clear All Data
To reset the app and clear all tasks:
```javascript
// In browser console (F12)
localStorage.clear()
location.reload()
```

---

## Browser Compatibility

### Supported Browsers
✅ Chrome 90+
✅ Firefox 88+
✅ Edge 90+
✅ Safari 14+

### Not Supported
❌ Internet Explorer (any version)
❌ Older browsers without ES6 support

---

## Still Having Issues?

If you're still experiencing problems:

1. **Check the browser console** (F12) for error messages
2. **Share the error message** - what exactly do you see?
3. **Try incognito/private mode** to rule out extensions
4. **Check Node.js version** - must be 18+
5. **Delete and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## Next Steps

Once you have the app running:
- Read `NEW-TASK-MODAL-README.md` for details on the modal
- Check `TASKFLOW-PRO-EXTENSION-GUIDE.md` for adding features
- Start creating tasks and exploring the UI!

---

## Getting Help

If you encounter issues not covered here, please provide:
- Error message (exact text)
- Browser and version
- Node.js version (`node --version`)
- Operating system
- Steps to reproduce the issue
