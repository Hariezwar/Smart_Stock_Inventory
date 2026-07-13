🚌 TransitTrace
===============

Real-Time Public Transport Tracking for Small Cities
-----------------------------------------------------

TransitTrace is a lightweight, real-time public transport tracking system built for small city bus networks. It lets commuters see live bus locations on a map, check estimated arrival times at their stop, and helps transit operators monitor their fleet — without the cost or complexity of enterprise transit software.

--------------------------------------------------------------------
Features
--------------------------------------------------------------------
- 📍 Live bus location tracking on an interactive map (Leaflet + OpenStreetMap)
- 🔄 Real-time updates over WebSockets (Socket.io) — no page refresh needed
- 🚏 Predefined routes and stops with ETA estimation
- 📊 Simple REST API for buses, routes, and stops
- 🧪 Built-in GPS simulator so the system works even without real hardware
- 📱 Responsive frontend, works on phones for commuters and on desktop for control-room staff
- 🛠️ Easy to extend to real GPS hardware (just POST coordinates to the ingest endpoint)

--------------------------------------------------------------------
Tech Stack
--------------------------------------------------------------------
| Layer      | Technology                          |
|------------|--------------------------------------|
| Backend    | Node.js, Express, Socket.io          |
| Frontend   | HTML, CSS, JavaScript, Leaflet.js    |
| Data       | In-memory store (swap for MongoDB/Postgres in production) |
| Simulation | Custom GPS simulator (server/simulator) |

--------------------------------------------------------------------
Project Structure
--------------------------------------------------------------------
```
transport-tracker/
├── README.md
├── LICENSE
├── package.json
├── .gitignore
├── server/
│   ├── server.js              # Express + Socket.io entry point
│   ├── models/
│   │   └── Bus.js             # Bus data model + route definitions
│   ├── routes/
│   │   └── busRoutes.js       # REST API endpoints
│   └── simulator/
│       └── busSimulator.js    # Simulates buses moving along routes
└── public/
    ├── index.html              # Commuter-facing live map dashboard
    ├── css/
    │   └── style.css
    └── js/
        └── app.js              # Map rendering + Socket.io client
```

--------------------------------------------------------------------
Getting Started
--------------------------------------------------------------------
1. Install dependencies
   ```
   npm install
   ```

2. Start the server
   ```
   npm start
   ```

3. Open the dashboard
   ```
   http://localhost:3000
   ```

The built-in simulator will automatically start moving 4 demo buses along 2 routes so you can see the system working immediately. To connect real hardware/GPS trackers instead, POST location updates to:
```
POST /api/buses/:busId/location
Body: { "lat": 12.9716, "lng": 77.5946, "speed": 22 }
```

--------------------------------------------------------------------
API Reference
--------------------------------------------------------------------
| Method | Endpoint                        | Description                     |
|--------|----------------------------------|----------------------------------|
| GET    | /api/buses                       | List all buses and current state |
| GET    | /api/buses/:busId                | Get a single bus's details        |
| POST   | /api/buses/:busId/location        | Push a new GPS location for a bus |
| GET    | /api/routes                      | List all routes and their stops   |
| GET    | /api/routes/:routeId/eta/:stopId | Estimated arrival time at a stop  |

--------------------------------------------------------------------
Roadmap
--------------------------------------------------------------------
- [ ] Persistent storage (MongoDB/PostgreSQL)
- [ ] Admin panel for adding/editing routes and stops
- [ ] Push notifications when a bus is close to a favorited stop
- [ ] Offline-friendly PWA support for low-connectivity areas
- [ ] SMS-based tracking for non-smartphone users

--------------------------------------------------------------------
License
--------------------------------------------------------------------
This project is licensed under the MIT License — see the LICENSE file for details.

--------------------------------------------------------------------
Contributing
--------------------------------------------------------------------
Contributions are welcome. Fork the repo, create a feature branch, and open a pull request.
