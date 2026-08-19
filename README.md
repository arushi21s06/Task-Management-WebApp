<div align="center">

# ✦ TaskFlow

**A modern, premium task management application designed to make everyday productivity simple, fast, and visually beautiful.**

[Live Demo](#) 

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 📸 Project Preview

<img width="1688" height="886" alt="image" src="https://github.com/user-attachments/assets/fe423af7-771f-4b42-83d1-af8d7dc0fd38" />


---

## ✨ Why TaskFlow?

TaskFlow is more than just a CRUD application; it is built to mimic the premium feel of top-tier SaaS productivity tools using entirely vanilla web technologies on the frontend. It solves the problem of clunky, over-engineered task managers by providing a frictionless, lightning-fast experience. The focus is strictly on fluid micro-animations, optimistic UI updates, and intelligent visual design to ensure you spend less time managing your tasks and more time completing them.

---

## ⚡ Features

<table>
  <tr>
    <td width="50%">
      <h3>📝 Task Management</h3>
      <p>Seamlessly create, edit, delete, and complete tasks with optimistic UI updates.</p>
    </td>
    <td width="50%">
      <h3>🔍 Smart Search & Filters</h3>
      <p>Instantly search by keywords or filter by priority and status without page reloads.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔔 Smart Notifications</h3>
      <p>Custom animated toast notifications that gracefully appear and dismiss themselves.</p>
    </td>
    <td width="50%">
      <h3>📊 Productivity Stats</h3>
      <p>Real-time dashboard counters and animated circular progress rings for completion.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🌓 Dark / Light Mode</h3>
      <p>A beautifully curated theme system that stores your preferences locally.</p>
    </td>
    <td width="50%">
      <h3>✨ Aesthetic UI</h3>
      <p>Glassmorphism elements, subtle animated backgrounds, and reduced-motion support.</p>
    </td>
  </tr>
</table>

---

## 🧩 Tech Stack

### Frontend
- **HTML5**: Semantic document structure
- **CSS3**: Custom design system, CSS variables, keyframe animations, glassmorphism
- **JavaScript (ES6+)**: Vanilla component architecture, custom event bus, dynamic DOM manipulation

### Backend & Database
- **Node.js & Express.js**: RESTful API architecture, middleware routing, and rate limiting
- **MongoDB Atlas & Mongoose**: Cloud database, schemas, and connection pooling
- **JSON Web Tokens (JWT)**: Stateless user authentication and authorization

### Deployment
- **Vercel**: Serverless API execution and global static frontend hosting

---

## 🏗️ How it Works

```text
┌────────────────────────┐         ┌────────────────────────┐
│      TaskFlow UI       │         │       REST API         │
│   (Vanilla JS + CSS)   │ ──────▶ │    (Node + Express)    │
│  State via Custom Evts │ ◀────── │  JWT Auth & Validation │
└──────────┬─────────────┘         └──────────┬─────────────┘
           │                                  │
           ▼                                  ▼
┌────────────────────────┐         ┌────────────────────────┐
│     Local Storage      │         │     MongoDB Atlas      │
│  (Token & User Data)   │         │    (Cloud Database)    │
└────────────────────────┘         └────────────────────────┘
```

---

## 📂 Project Structure

```text
TaskFlow/
├── client/                 # Static Frontend
│   ├── index.html          # SPA entry point
│   ├── css/                # Token-based CSS design system
│   │   ├── variables.css   # Dark/Light theme tokens
│   │   ├── dashboard.css   # Core layout styles
│   │   └── ...
│   └── js/                 # Modular Vanilla JS
│       ├── api.js          # Fetch wrappers
│       ├── app.js          # App initialization & routing
│       └── ...
├── server/                 # Express Backend
│   ├── config/db.js        # Cached MongoDB connection
│   ├── controllers/        # Route logic (Auth, Tasks)
│   ├── models/             # Mongoose Schemas (User, Task)
│   ├── routes/             # Express Routers
│   └── server.js           # Express Entry Point (Serverless Ready)
├── .env.example            # Environment templates
├── package.json            # Scripts & dependencies
└── vercel.json             # Vercel deployment config
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Create a `.env` file in the root directory. **Never commit this file to GitHub.**
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=development
```

**4. Run Locally**
The project uses `concurrently` to start both the Node server and the static frontend.
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

---

## 🔌 API Reference

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate an existing user |
| `GET`  | `/api/auth/me` | Fetch the current logged-in user's data |
| `GET`  | `/api/tasks` | Fetch all tasks (supports search & filters) |
| `POST` | `/api/tasks` | Create a new task |
| `GET`  | `/api/tasks/stats` | Get aggregated productivity statistics |
| `GET`  | `/api/tasks/:id` | Fetch a specific task by ID |
| `PUT`  | `/api/tasks/:id` | Update an entire task |
| `PATCH`| `/api/tasks/:id/status`| Toggle task completion status |
| `DELETE`|`/api/tasks/:id` | Delete a task |

*(All `/api/tasks/*` routes and `/api/auth/me` require a valid JWT Bearer Token in the Authorization header)*

---

## 🌐 Deployment

This project is natively configured for deployment on **Vercel** via serverless functions.

```text
       Vercel Edge Network
               │
      ┌────────┴────────┐
      ▼                 ▼
 Static Files       Serverless API
 (client/**)     (server/server.js)
                        │
                        ▼
                  MongoDB Atlas
```

**To Deploy:**
1. Import the repository into Vercel.
2. Under **Environment Variables**, securely add your actual `MONGO_URI` and `JWT_SECRET`.
3. Vercel automatically reads the `vercel.json` file for routing (`/api` -> backend, `/` -> client).
4. Click **Deploy**.

---

## 🧪 Functionality Check

- [x] Create tasks
- [x] Edit tasks
- [x] Complete tasks
- [x] Delete tasks
- [x] Search tasks
- [x] Notifications
- [x] MongoDB persistence
- [x] Responsive interface

---

## 🔮 Future Roadmap

- [ ] Drag-and-drop task organization
- [ ] Extended productivity analytics and historical charts
- [ ] Collaborative task sharing

---

<div align="center">

### 👩‍💻 Author

**Built with ☕ and JavaScript by Arushi Singh**  
*Engineering Student · Developer*

[Gmail](arushi.s246@gmail.com) · [LinkedIn](www.linkedin.com/in/arushisingh21)

<br>

⭐ **Star this repository if you found it useful!**

</div>
