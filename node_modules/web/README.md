# Aegis — Smart Home Security Platform

A full-stack security monitoring dashboard for Aegis, featuring real-time telemetry, environmental triggers, and AI threat assessment. 

## Project Structure
This is an npm workspace monorepo containing:
* `apps/api`: A NestJS backend providing a REST API and Server-Sent Events (SSE) stream.
* `apps/web`: A React SPA built with Vite.

## Getting Started
1. Clone the repository.
2. Run `npm install` from the root directory.
3. Boot the backend: `cd apps/api && npm run start:dev`
4. Boot the frontend: `cd apps/web && npm run dev`

* The frontend will be available at `http://localhost:5173`.
* The API health check is available at `http://localhost:3000/api/health`.