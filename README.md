# Backend

## Overview
This is the backend part of the project, built with Node.js and Express. It handles real-time communication using Socket.io.

## Features
- Real-time communication with Socket.io
- Parses chatbot responses and emits parsed options

## Setup Instructions
1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the server**
   ```bash
   node index.js
   ```
   The server will run on [http://localhost:5000](http://localhost:5000).
   
4. **Change the Socket Url and adjust the CORS to your Frontend Url**


## Usage
- The server listens for chat messages and emits parsed options back to the client.

## Technologies Used
- Node.js
- Express
- Socket.io

## License
This project is licensed under the MIT License. 