# Natours App

A full-stack tour booking web application inspired by the **Natours** project from Jonas Schmedtmann’s Node.js course on Udemy. This app simulates a travel platform where users can browse tours, view tour details, create accounts, manage bookings, and interact with protected features through authentication and role-based access.

## Overview

Natours is a server-rendered web application built with **Node.js**, **Express**, **MongoDB**, and **Pug**. It combines a public-facing tour browsing experience with backend features such as authentication, authorization, data modeling, reviews, and bookings.

This project was recreated as part of a course-based learning project and serves as a hands-on full-stack practice app focused on backend architecture, MVC patterns, RESTful APIs, and secure user flows.

## Features

- Browse available tours
- View detailed tour information
- User authentication and authorization
- JWT-based login and protected routes
- Role-based access control for users, guides, and admins
- Update user profile information
- Manage user passwords securely
- Tour reviews and ratings
- Booking-related functionality
- Server-side rendered pages using Pug templates
- REST API endpoints for tours, users, reviews, and bookings

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Frontend / Templating
- Pug
- CSS
- Vanilla JavaScript

### Authentication / Security
- JWT
- Cookie-based auth flow
- Password hashing and reset flow

### Other Tools / Libraries
- Express Router
- MVC architecture
- Environment variables with dotenv
- ESLint / Prettier

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/lexopez/natours_app.git
   ```
2. Navigate to the project directory:
   ```bash
   cd natours_app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```       
4. Set up environment variables by creating a `.env` file in the root directory and adding the necessary configuration (e.g., database connection string, JWT secret, etc.).
5. Start the development server:
   ```bash
   npm run dev
   ```