# Files Manager

Welcome to **Files Manager**, a platform for managing file uploads and viewing. This project combines essential back-end technologies to create a robust system for handling files efficiently. It is part of the **Holberton School - Web Stack Programming** curriculum.

## 📖 Table of Contents

- [Description](#description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Authors](#authors)

---

## 📄 Description

**Files Manager** is a full-stack back-end project designed to bring together various technologies like Node.js, MongoDB, Redis, and Express. The objective is to create a streamlined file management system capable of performing operations like user authentication, file uploads, permission management, and more.

This project showcases critical concepts such as:

- Building APIs with **Express**.
- Using **MongoDB** for persistent storage.
- Leveraging **Redis** for temporary storage and caching.
- Employing **Bull** for background job processing.

---

## ✨ Features

1. **User Authentication**:
   - Token-based authentication system.
   
2. **File Management**:
   - Upload files of various types.
   - List all uploaded files.
   - Manage file permissions (public/private).
   
3. **File Viewing**:
   - Access files based on permissions.
   
4. **Thumbnail Generation**:
   - Automatically create thumbnails for uploaded images.
   
5. **Background Processing**:
   - Efficiently handle tasks using workers.

---

## 🛠️ Technologies Used

- **Node.js** (v20.x.x) - JavaScript runtime environment.
- **Express** - Web framework for building APIs.
- **MongoDB** - Database for storing user and file metadata.
- **Redis** - In-memory data structure store for caching.
- **Bull** - Background job processing.
- **Image-thumbnail** - Library for generating image thumbnails.
- **Mocha & Chai** - Testing framework and assertion library.

---

## ⚙️ Setup Instructions

### Prerequisites

Ensure the following are installed on your system:

- [Node.js](https://nodejs.org) (v20.x.x)
- [MongoDB](https://www.mongodb.com)
- [Redis](https://redis.io)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GoldenHatchet15/holbertonschool-files_manager.git
   cd files_manager

## Install dependencies:

```
bash

npm install
```

## Configure your environment variables:

Create a .env file to store necessary configurations like database URLs and secret keys.
Start the server and worker:

## Server:
```
bash
npm run start-server
```
## Worker:
```
bash

npm run start-worker
```
## 🚀 Usage
API Endpoints
User Authentication:

POST /auth/login - Authenticate a user and retrieve a token.
POST /auth/logout - Log out a user.
File Management:

POST /files - Upload a new file.
GET /files - List all files.
GET /files/:id - View a specific file.
PUT /files/:id/permissions - Modify file permissions.
Thumbnails:

Thumbnails are automatically generated for supported image uploads.
## Running Tests
Run the following command to execute tests:

```
bash

npm test
```
## 🧑‍💻 Authors

- [Raphael Santos](https://github.com/GoldenHatchet15)
- [Nacim Saafi](https://github.com/NACIMSAAFI)

