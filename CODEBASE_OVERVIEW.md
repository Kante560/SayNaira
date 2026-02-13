# SayLess Codebase Architecture & Overview

Welcome to the **SayLess** documentation. This document provides a high-level overview of the project structure, technology stack, and core functionalities of the application.

---

## 🚀 1. Project Vision
**SayLess** is a modern, real-time messaging and social feed application designed for speed and ease of use. It features a dark-themed, premium UI with a focus on real-time communication without the need for downloads or installs.

---

## 🛠 2. Technology Stack
- **Frontend Framework**: [React.js](https://reactjs.org/) (Vite-powered)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (with custom configuration)
- **State Management**: React Context API
- **Real-time Engine**: [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)

---

## 📁 3. Directory Structure

```text
src/
├── _component_/       # Real-time chat & specialized logic components
├── Context/            # State management (Auth, Theme)
├── Home/               # Landing page specific components (Hero, Nav, About)
├── pages/              # Main application views/routes
├── assets/             # Static images and icons
├── firebase.js         # Firebase initialization & config
└── App.jsx             # Main router and entry point
```

---

## 🔑 4. Core Architecture

### **State Management**
The app uses the **Context API** to handle global state across two main providers:
1. **AuthContext.jsx**: Tracks `user` state, handling Login, Logout, and Signup persistence.
2. **ThemeContext.jsx**: Manages the light/dark mode preference, persisting choice to `localStorage`.

### **Data Layer (Firestore)**
Data is structured in collections for real-time synchronization:
- `users/`: Stores user profiles (name, email, uid).
- `chats/`: Documents for each conversation pair (e.g., `user1UID_user2UID`).
  - `messages/`: Sub-collection containing individual message documents.
- `status/`: Tracks real-time presence (online/offline).
- `posts/`: Stores social feed content.
- `notifications/`: User-specific message alerts.

---

## 💬 5. Key Features

### **Real-time Messaging**
- **Dynamic Routing**: Uses `recipientId` in the URL to dynamically load chat windows.
- **Message Types**: Supports standard **Text** and specialized **Stickers**.
- **Read Receipts**: Real-time "seen" status using Lucide checkmarks.
- **Scroll Management**: Hidden scrollbars for a cleaner UI, with automatic "scroll-to-bottom" logic.

### **Sticker System**
- Integrated `StickerPicker` component.
- Tabbed interface for Emoji, Reactions, and Animals categories.
- Stickers are sent as objects with a `type: "sticker"` flag and a `stickerUrl`.

### **Social Feed (Blog)**
- Users can create posts with real-time updates.
- Integrated "Message Author" buttons allowing users to jump directly from a post to a private DM.

### **Responsive Dark Mode**
- Class-based dark mode (`dark:` variant in Tailwind).
- Transitions for smooth theme switching.
- Custom scrollbar styling that adapts to the active theme.

---

## 🚦 6. Main Routes (`App.jsx`)
- `/`: Home/Landing page (switches to `ChatList` if user is logged in).
- `/signup` / `/login`: Authentication portals.
- `/messages`: Directory of active conversations.
- `/chat/:recipientId`: Individual private chat routing.
- `/blog`: The main social feed/community posts.
- `/profile`: User account management.

---

## 🛠 7. Custom Utilities
- **`index.css`**: Contains the global design system, including `.no-scrollbar` and custom Webkit scrollbar styles for a seamless look across browsers.
- **`STICKER_FEATURE_DOCS.md`**: Detailed guide on expanding the sticker system.
- **`DARK_MODE_DOCUMENTATION.md`**: Technical breakdown of the theme logic.

---

## 📈 8. Future Roadmap
- [ ] Image/Media sharing in chats.
- [ ] Group chat support.
- [ ] User status/stories implementation.
- [ ] Push notifications using FCM.

---
*Created by Antigravity AI for SayLess Project*
