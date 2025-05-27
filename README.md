
# 🎬 MovieMate Backend

This is the **backend server** for the MovieMate MERN Stack application. It handles secure user authentication using JWT, stores watchlist data in MongoDB, and provides protected API endpoints for user-specific data operations.

---

## 🔧 Core Features

### 🛡️ Authentication
- Secure registration with hashed passwords (`bcrypt`)
- Login and token generation with **JWT**
- Access token with **10-minute session expiry**
- Middleware to protect private routes
- Decodes and extracts `userId` from JWT to personalize watchlist data

### 📋 Watchlist (Protected Routes)
- Add movie to watchlist
- Get all movies from a user’s watchlist
- Delete a movie from watchlist
- All actions require valid JWT



## 📁 Folder Structure

```

/server
├── controllers
│   ├── authController.js
│   └── watchlistController.js
├── middleware
│   └── authMiddleware.js
├── models
│   ├── User.js
│   └── Watchlist.js
├── routes
│   ├── authRoutes.js
│   └── watchlistRoutes.js
├── .env
├── server.js

````

## 📜 API Endpoints

### 🔐 Auth Routes
```
| Method | Route          | Description             |
|--------|----------------|-------------------------|
| POST   | `/api/auth/register` | Register a new user     |
| POST   | `/api/auth/login`    | Login & receive JWT     |
```

### 🔒 Watchlist Routes *(Protected)*
```
| Method | Route              | Description             |
|--------|--------------------|-------------------------|
| POST   | `/api/watchlist/add`     | Add movie to watchlist  |
| GET    | `/api/watchlist/get`     | Get all saved movies    |
| DELETE | `/api/watchlist/delete/:movieId` | Remove movie by ID       |
```

## 🔑 JWT Auth Flow

1. User logs in → receives JWT access token
2. Frontend stores the token in `localStorage`
3. Token is sent in `Authorization` header for protected routes
4. Backend middleware verifies and extracts user ID
5. Routes proceed with personalized DB actions


## 🛠️ Setup Instructions

1. **Clone the Repo**

```bash
git clone https://github.com/dhruvin3007/moviemate-backend.git
cd moviemate-backend
````

2. **Install Dependencies**

```bash
npm install
```

3. **Create `.env` File**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. **Run the Server**

```bash
npm run dev
```

## 🔮 Future Improvements

* Refresh token strategy
* Rate limiting to protect routes
* Centralized error handling middleware
* Role-based access control (admin/user)
* Integration with frontend CI/CD pipeline

---

## 👨‍💻 Author

**Dhruvin Mehta**
[GitHub](https://github.com/dhruvin2968)




