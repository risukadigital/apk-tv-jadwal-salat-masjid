# Mosque TV Prayer Schedule

A local-network mosque information system built with Node.js and Express. It displays prayer schedules and mosque announcements on a TV screen while allowing administrators to update content through a web-based admin panel.

## Features

- **TV Display:** A dedicated screen for mosque prayer schedules and announcements.
- **Admin Panel:** Manage mosque information, prayer times, Friday prayer details, weekly activities, announcements, and Quranic verses or hadith.
- **Local Data Storage:** Store application content in a local JSON file.
- **Local Network Access:** Access the admin panel and TV display from compatible devices connected to the same local network.
- **Lightweight Backend:** Built with Node.js and Express.

## Requirements

- Node.js 18 or newer
- npm
- A computer running the application server
- A local network connecting the server, administrator's device, and TV

## Installation

1. Clone or download this repository.
2. Open the project directory in a terminal.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open the admin panel:

   `http://localhost:3000/admin`

6. Open the TV display:

   `http://localhost:3000/tv`

To access the application from another device, use the server computer's local IP address instead of `localhost`.

## Data Storage

Application content is stored locally in `data/content.json`. Prayer schedule data is also maintained locally. The application does not require Firebase.

Ensure the required data files are available before running the application.

## Current Limitations

- The admin panel does not yet include authentication.
- Prayer times require manual configuration or a compatible prepared schedule.
- The server must remain running for other devices to receive updates.
- Smart TV browser compatibility and local network connectivity should be tested on the target devices.
- This project is an MVP and may require additional configuration before production use.

## Technology Stack

- Node.js
- Express
- HTML
- CSS
- JavaScript
- JSON

## Repository

[https://github.com/risukadigital/apk-tv-jadwal-salat-masjid](https://github.com/risukadigital/apk-tv-jadwal-salat-masjid)

---

Developed by **HUI TEKNO**.
