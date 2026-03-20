// app.js — Passenger entry point for MilesWeb
// This file simply loads the compiled backend server

process.chdir(__dirname);
require('./dist/backend/server.js');
