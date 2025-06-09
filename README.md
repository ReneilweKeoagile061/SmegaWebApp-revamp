# SMEGA Statement Portal - Web Application

This repository contains the web application for the SMEGA Statement Portal. It's built using Node.js (Express.js) for the backend and plain HTML, CSS (Tailwind CSS), and JavaScript for the frontend.

## Table of Contents
- [Features](#features)
- [How to Run Locally](#how-to-run-locally)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Application Usage](#application-usage)
  - [Login Page](#login-page)
  - [Home Page (Statement Search)](#home-page-statement-search)
  - [Download Functionality](#download-functionality)
- [Project Structure](#project-structure)
- [Contact](#contact)

## Features
- User authentication via LDAP (configured through environment variables).
- Secure session management.
- Dynamic display of logged-in user's name on the home page.
- Search for SMEGA statements by phone number and date range.
- Download statements as Excel files.
- Responsive design with Tailwind CSS.

## How to Run Locally

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (LTS version recommended)
- npm (Node Package Manager, usually comes with Node.js)
- Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ReneilweKeoagile061/SmegaWebApp-revamp.git
    cd SmegaWebApp-revamp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a file named `.env` in the root of the `SmegaWebApp-revamp` directory. This file will store sensitive information and configurations.
    Example `.env` content:
    ```
    ServerPort=3400
    SessionKey=YOUR_VERY_SECURE_SESSION_KEY
    CLIENT_ID=btc-ad_client
    CLIENT_SECRET=kgJAQuPkZ94JteTEbK8lh3cS2lIuUqOY
    AUTH_URL=https://keycloak-sso-system.services.btc.bw/auth/realms/btc_staff/protocol/openid-connect/token
    COOKIE=3ef88a617efab92ffb28f2972e7d264d=90685909102409f035b1fa89a0185afd
    ```
    *Replace `YOUR_VERY_SECURE_SESSION_KEY` with a strong, random string.*

### Running the Application

1.  **Build Tailwind CSS (if not already built by `npm install`'s postinstall script):**
    ```bash
    npm run build:css
    ```
    *(This command compiles the Tailwind CSS from `view/css/input.css` to `view/css/output.css`.)*

2.  **Start the server:**
    ```bash
    npm start
    ```
    The server will typically run on `http://localhost:3400` (or the port specified in your `.env` file).

## Application Usage

### Login Page
- Access the application through your web browser (e.g., `http://localhost:3400`).
- Enter your login ID and password.
- Upon successful login, you will be redirected to the home page, and your name should be displayed.

### Home Page (Statement Search)
- **Phone Number:** Enter the 8-digit phone number for which you want to retrieve statements (e.g., `73001762`). Do not include country codes like `267`.
- **Period:** Select the "From" and "To" dates to define the statement period.
- **Search Button:** Click the "SEARCH" button to retrieve statement data.

### Download Functionality
- **Download Button:** After a successful search where data is found, the "Download" button will become active. Click this button to download your statement as an Excel file.

## Project Structure
- `controller/`: Contains controllers for handling requests (e.g., LDAP authentication logic).
- `middleware/`: Contains middleware functions.
- `resoures/`: Contains static assets like images.
- `routes/`: Defines API routes.
- `services/`: Contains service-layer logic (e.g., LDAP service, data processing).
- `view/`: Contains frontend HTML files, CSS, and client-side JavaScript.
    - `view/pages/`: Contains specific HTML pages like `home.html` and `index.html` (login page).
- `server.js`: The main entry point for the Node.js Express server.
- `config.js`, `package.json`, `package-lock.json`, `postcss.config.js`, `tailwind.config.js`: Configuration and dependency files.

## Contact
Contact:© 2025 Botswana Telecommunications Corporation. All rights reserved.
itdevelopment@btc.bw 