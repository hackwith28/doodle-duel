# 🎨 Doodle Duel – Real-Time Multiplayer Drawing Game

Doodle Duel is a real-time multiplayer drawing and guessing game inspired by Skribbl.io.  
Players can join rooms, take turns drawing words, guess in real time, chat with others, and earn points based on speed and accuracy.

🔗 **Live Demo:** https://doddle-duel.netlify.app/

---

## 🚀 Features

- 🎨 Real-time collaborative drawing canvas
- 👥 Multiplayer rooms with live player list
- 🔄 Automatic drawer rotation
- ⏱️ Timed rounds with countdown
- 💬 Live chat for guessing words
- 🏆 Dynamic leaderboard & scoring system
- 🔊 Game sounds and round notifications
- 🔌 WebSocket-based real-time sync (Socket.IO)

---

## 🛠️ Tech Stack

### Frontend
- React
- HTML5 Canvas
- CSS
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO

### Deployment
- **Frontend:** Netlify
- **Backend:** Render

---

## 📂 Project Structure

```

doodle-duel/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── socket.js
│   │   └── App.jsx
│   └── public/
│
├── backend/
│   ├── rooms.js
│   ├── socketHandlers.js
│   └── index.js
│
└── README.md

````

---

## ⚙️ How It Works

1. Players join a room using a room code
2. One player becomes the drawer
3. Drawer draws the given word on the canvas
4. Other players guess via chat
5. Points are awarded based on correct and faster guesses
6. Turns rotate automatically after each round

---

## 🧪 Run Locally

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/doodle-duel.git
cd doodle-duel
````

### 2️⃣ Start Backend

```bash
cd backend
npm install
npm start
```

Backend runs on: `http://localhost:3000`

### 3️⃣ Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🌐 Environment Setup

Update the backend URL in frontend socket config:

```js
import { io } from "socket.io-client";

export const socket = io("https://your-backend-url.onrender.com", {
  transports: ["websocket"],
});
```

---

## 📸 Screenshots

*(Add screenshots of gameplay, lobby, leaderboard here)*

---

## 📈 Future Improvements

* 🔐 Private rooms with passwords
* 🎭 Custom word packs
* 📱 Better mobile responsiveness
* 👤 User authentication
* 🎥 Drawing replay feature

---

## 👨‍💻 Author

**Reetesh Sahu**

* Aspiring Software Engineer
* Passionate about real-time systems & full-stack development

---

## ⭐ Show Your Support

If you like this project, please ⭐ the repository — it really helps!

```

---

### 🔥 Why this README is strong
✅ Recruiter friendly  
✅ Interview-ready explanation  
✅ Shows **deployment + real-time systems**  
✅ Looks like a **production project**, not college work  

---

If you want, I can:
- Customize it with **your GitHub username**
- Add **badges** (Netlify, Render, React)
- Write a **LinkedIn launch post**
- Create **resume bullets** using this project

Just say the word bhai 👑🔥
```
