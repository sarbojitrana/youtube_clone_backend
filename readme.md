v-tube Backend

This repository contains the backend source code for v-tube, a YouTube clone with all the major functionalities.

Here is the link to the model : https://app.eraser.io/workspace/PY3vByByg92gkS3wTfcl?origin=share

🚀 About The Project

This is a complete, production-grade backend service for a video-sharing platform. It handles everything from user authentication and video processing to comments, likes, and subscriptions.

✨ Key Features

User Authentication: Secure JWT (Access & Refresh Tokens) based authentication with password hashing (bcrypt).

Video Management: Upload, update, delete, and stream video content.

Cloud Integration: Uses Cloudinary for storing and managing all media assets (videos, thumbnails, avatars).

MongoDB Atlas: Leverages MongoDB as the database, with mongoose for object data modeling (ODM).

Advanced Features: Includes support for subscriptions, likes, comments, tweets, and complex database aggregation pipelines for dashboards.

File Handling: Uses multer for robust file upload management.

Pagination: Implements mongoose-aggregate-paginate-v2 for efficient pagination on complex queries.

🛠️ Tech Stack

This project is built with modern backend technologies:

Runtime: Node.js (ES Module)

Framework: Express.js

Database: MongoDB with Mongoose

Authentication: JWT (jsonwebtoken) & bcrypt

File Uploads: Multer

Cloud Storage: Cloudinary

Utilities:

cookie-parser: For handling HTTP cookies (auth tokens).

cors: For enabling Cross-Origin Resource Sharing.

dotenv: For managing environment variables.

nodemon: For live-reloading during development.

prettier: For code formatting.

🏁 Getting Started

Follow these instructions to get a local copy up and running for development.

1. Prerequisites

Make sure you have the following installed on your machine:

Node.js (v18 or higher recommended)

npm

Git

A MongoDB Atlas account (or a local MongoDB server)

A Cloudinary account

2. Installation

Clone the repository:

git clone [https://github.com/sarbojitrana/youtube_clone_backend.git](https://github.com/sarbojitrana/youtube_clone_backend)
cd v-tube


3. Environment Setup

Create a .env file in the root directory of the project. Do not commit this file to Git!

Add the following environment variables. You will need to get these values from your MongoDB and Cloudinary accounts.

⚠️ IMPORTANT: SECURITY WARNING

Never paste your actual secret keys or connection strings into this README.md file or any other file that is tracked by Git.

The code block below is a template. You must create your own .env file locally, add your secrets there, and ensure that .env is listed in your .gitignore file.

# Server Configuration
PORT=8000

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# CORS Origin
CORS_ORIGIN=http://localhost:5173

# Authentication Tokens (generate strong secrets)
ACCESS_TOKEN_SECRET=your_super_strong_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_strong_refresh_secret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret



4. Running the Application

To run the application in development mode with auto-reloading:

npm run dev


The server will start on the PORT specified in your .env file (e.g., http://localhost:8000).

👤 Author

sarbojit

📄 License

This project is licensed under the ISC License.