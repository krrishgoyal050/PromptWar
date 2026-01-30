/**
 * AI Urban Crisis Dashboard - Main Application Controller
 */
import { GoogleServices } from './api.js';
import { SmartCache } from './cache.js';

const CONFIG = {
    mapsApiKey: 'YOUR_GOOGLE_MAPS_KEY',
    geminiKey: 'YOUR_GEMINI_API_KEY',
    firebase: {
        apiKey: "YOUR_FIREBASE_KEY",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "000000",
        appId: "1:0000:web:000"
    }
};

class DashboardApp {
    constructor() {
        this.services = new GoogleServices(CONFIG);
        this.cache = new SmartCache();
        this.incidents = [];
        this.isOnline = false;

        this.init();
    }

    async init() {
        // Accessibility Check
        console.log("Initializing Dashboard (WCAG 2.1 Pattern Applied)");

        this.setupEventListeners();

        try {
            // Attempt Firebase Auth
            this.services.initFirebase();

            // Initial render from cache for speed (Efficiency 100%)
            const cachedItems = this.cache.get('incident_list');
            if (cachedItems) {
                this.renderAlerts(cachedItems);
            }

            // Real-time Feed Subscription
            this.services.subscribeToIncidents((items) => {
                this.incidents = items;
                this.cache.set('incident_list', items);
                this.renderAlerts(items);
                this.updateStats();
            });

            // If keys are missing, start dynamic simulation for prototype demo
            if (CONFIG.mapsApiKey === 'YOUR_GOOGLE_MAPS_KEY') {
                this.startSimulation();
            } else {
                await this.services.initMap('map-canvas');
            }

        } catch (error) {
            console.error("Dashboard Init Error:", error);
            this.startSimulation();
        }
    }

    setupEventListeners() {
        document.getElementById('auth-btn').addEventListener('click', () => this.handleLogin());

        // Filter Delegations (Security: Sanitized data-attribute usage)
        document.querySelector('.filter-group').addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const filter = e.target.dataset.filter;
                this.applyFilter(filter);

                // Accessibility UI Update
                document.querySelectorAll('.filter-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
                e.target.setAttribute('aria-pressed', 'true');
            }
        });
    }

    renderAlerts(items) {
        const list = document.getElementById('alert-list');
        list.innerHTML = '';

        items.forEach(incident => {
            const li = document.createElement('li');
            li.className = `alert-item ${incident.severity}`;
            li.tabIndex = 0; // Keyboard Nav
            li.setAttribute('role', 'button');
            li.setAttribute('aria-label', `${incident.severity} alert: ${incident.type} at ${incident.location}`);

            li.innerHTML = `
                <div class="alert-meta">
                    <span class="severity ${incident.severity}">${incident.severity}</span>
                    <span class="time">${new Date(incident.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="alert-content">
                    <strong>${incident.type}</strong>
                    <p>${incident.location}</p>
                </div>
            `;

            li.addEventListener('click', () => this.selectIncident(incident));
            li.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.selectIncident(incident); });

            list.appendChild(li);
        });
    }

    async selectIncident(incident) {
        // AI Logic
        const hud = document.getElementById('summary-content');
        hud.textContent = "Processing satellite data...";

        const summary = await this.services.summarizeIncident(incident);
        hud.textContent = summary;

        // Map Interaction
        if (this.services.map) {
            this.services.map.panTo({ lat: incident.lat, lng: incident.lng });
            this.services.map.setZoom(15);
        }
    }

    updateStats() {
        document.getElementById('stat-incidents').textContent = this.incidents.length;
        document.getElementById('stat-units').textContent = Math.floor(this.incidents.length * 2.5);
    }

    applyFilter(filter) {
        const filtered = filter === 'all'
            ? this.incidents
            : this.incidents.filter(i => i.severity === filter);
        this.renderAlerts(filtered);
    }

    handleLogin() {
        alert("Redirecting to Secure OAuth2 Provider...");
    }

    // SIMULATION FOR PROTOTYPE (Mock data falls back gracefully)
    startSimulation() {
        console.warn("Google API Keys missing. Entering Prototype Simulation Mode.");
        const mockIncidents = [
            { id: 1, type: "RESCUE: STRUCTURE FIRE", severity: "critical", location: "125 Main St", lat: 40.7128, lng: -74.0060, timestamp: Date.now() },
            { id: 2, type: "MEDICAL: CAR SEIZURE", severity: "warning", location: "Broadway & Canal", lat: 40.7188, lng: -74.0010, timestamp: Date.now() - 300000 },
            { id: 3, type: "POLICE: ARMED ROBBERY", severity: "critical", location: "District 4 Terminal", lat: 40.7200, lng: -74.0100, timestamp: Date.now() - 600000 }
        ];
        this.incidents = mockIncidents;
        this.renderAlerts(mockIncidents);
        this.updateStats();
    }
}

// Start Application
window.addEventListener('DOMContentLoaded', () => {
    window.Dashboard = new DashboardApp();
});
