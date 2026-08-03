# 🛡️ TrustNest — On-Demand Verified Home & Local Services Platform

> A modern, secure, and reliable full-stack platform connecting customers with background-verified service professionals (cleaners, electricians, plumbers, carpenters, technicians) with real-time tracking, SOS emergency alerts, and transparent escrow workflows.

---

## 🌟 Key Features

* **🛡️ Verified Professionals:** Background & police ID verification system for service workers.
* **🚨 Real-Time SOS Alert System:** Dedicated emergency alert mechanism for user safety during active service visits.
* **📍 Live Distance & Proximity:** Worker location matching with distance calculations and interactive maps.
* **🔐 Secure OTP Verification:** Two-way OTP validation for service start, milestone completion, and attendance tracking.
* **⚡ Real-Time Socket.io:** Instant notifications, live status updates, and bidirectional messaging.
* **💳 Escrow & Payments:** Integrated with Razorpay for automated platform commissions and payments.
* **🤖 Smart Matchmaking:** AI-powered worker matchmaking and automated recommendations with Google Gemini AI.

---

## 🏗️ Architecture & Tech Stack

```
trustNest/
├── client/          # Frontend Web Application (React 19, Vite, Redux Toolkit)
└── server/          # Backend REST & WebSocket API (Node.js, Express, MongoDB)
```

### 💻 Frontend (`client/`)
* **Core:** React 19, Vite
* **State Management:** Redux Toolkit
* **Real-Time Client:** Socket.io-client
* **Notifications:** React Hot Toast
* **Icons & Maps:** Lucide React, Leaflet / Map integration
* **Styling:** Custom modern dark/light mode CSS design system

### ⚙️ Backend (`server/`)
* **Runtime & Framework:** Node.js, Express.js
* **Database:** MongoDB with Mongoose ODM
* **Security:** Helmet, Express Rate Limit, Express Mongo Sanitize, XSS-Clean, JWT (Access & Refresh tokens)
* **Real-time Engine:** Socket.io
* **Third-Party Integrations:**
  * **Razorpay:** Payments & transactions
  * **Cloudinary:** Document verification & profile image storage
  * **Google Generative AI (Gemini):** AI service assistant
  * **Nodemailer:** Email OTPs and booking receipts
  * **Firebase Admin:** Cloud messaging and push notifications

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)
* [Git](https://git-scm.com/)

---

### 1. Server Setup

```bash
cd server
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

The API server will run at `http://localhost:5000`.

---

### 2. Client Setup

```bash
cd ../client
npm install

# Start Vite dev server
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## 📂 Project Structure

```text
trustNest/
├── .gitignore
├── README.md
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   ├── cards/WorkerCard.jsx
│       │   └── layout/CustomerLayout.jsx
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── AuthPage.jsx
│       │   ├── WorkerDashboard.jsx
│       │   ├── NotificationsPage.jsx
│       │   ├── SOSPage.jsx
│       │   ├── ReviewPage.jsx
│       │   └── Customer/
│       │       ├── CustomerDashboard.jsx
│       │       ├── MyBookings.jsx
│       │       └── MapComponent.jsx
│       ├── slices/authSlice.js
│       └── store/store.js
└── server/
    ├── server.js
    ├── package.json
    ├── .env.example
    └── src/
        ├── app.js
        ├── socket.js
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        ├── services/
        └── utils/
```

---

## 🔒 Security & Safety Highlights
* **Zero-Trust Worker Onboarding:** Worker profiles require ID card proof, certificates, and background checks before becoming eligible for jobs.
* **In-Visit SOS Trigger:** Immediate alert dispatch to emergency contacts and admin dashboards via Socket.io during active bookings.
* **Token Authentication:** Secure HTTP-only cookies combined with short-lived JWT access tokens and revolving refresh tokens.

---

## 📄 License
MIT License. Built for trust and safety in local home services.
