# Khatma App

A collaborative Khatma tracking app built with React, Tailwind CSS, Firebase, and React Hook Form.

[GitHub Repository](https://github.com/anaskhafegui/khatma-app)

## Features

- Create and manage Khatma sessions
- Assign surahs to users, track read counts
- Progress bar and stats for each Khatma
- Admin controls: lock/unlock, change status (pending/started/ended)
- History and active Khatmas tracked in your browser
- Beautiful UI with Tailwind CSS

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173)

## Deploying to Vercel

1. Push your code to GitHub (already done!)
2. Go to [vercel.com](https://vercel.com/) and sign in with your GitHub account
3. Click **New Project** and import your `khatma-app` repository
4. Use the default settings (Vercel auto-detects Vite/React)
5. Click **Deploy**
6. After deployment, you'll get a live URL to share your app!

## Environment Variables

- If you want to use a different Firebase project, update the config in `src/firebase/firebase.ts`.

---

Made with ❤️ for collaborative Quran reading.
