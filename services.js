/**
 * Google Services Integration Module
 * Handles Firebase Auth, Firestore, and other Google APIs.
 * Note: Placeholders are used for API Keys. User must replace them.
 */

const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "00000000000",
    appId: "1:00000000000:web:000000000000"
};

class ServiceManager {
    constructor() {
        this.user = null;
        this.db = null;
        this.mockMode = false;

        // Local "Cloud" for mock mode
        this.mockLeaderboard = [
            { name: "StarLord", score: 5000 },
            { name: "Rocket", score: 4500 },
            { name: "Groot", score: 3000 },
            { name: "Drax", score: 1200 },
            { name: "Mantis", score: 800 }
        ];

        this.init();
    }

    init() {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                this.auth = firebase.auth();
                this.db = firebase.firestore();
                this.setupAuthListener();
                console.log("Services Initialized (Online Mode)");
            } else if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
                firebase.initializeApp(FIREBASE_CONFIG);
                this.auth = firebase.auth();
                this.db = firebase.firestore();
                this.setupAuthListener();
                console.log("Services Initialized (Online Mode)");
            } else {
                throw new Error("Firebase SDK not connected or Config missing.");
            }
        } catch (e) {
            console.warn("Firebase not configured or reachable. Running in OFFLINE/MOCK mode.");
            this.mockMode = true;
            // Auto-login as Guest in mock mode for better UX
            this.user = { uid: 'mock-user-1', displayName: 'Guest Pilot' };
            this.updateAuthUI(this.user);
        }

        this.setupUIListeners();
    }

    setupAuthListener() {
        if (this.mockMode) return;
        this.auth.onAuthStateChanged(user => {
            this.user = user;
            this.updateAuthUI(user);
        });
    }

    updateAuthUI(user) {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userDisplay = document.getElementById('user-display');

        // Safety check if elements exist
        if (!loginBtn || !logoutBtn || !userDisplay) return;

        if (user) {
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            userDisplay.classList.remove('hidden');
            userDisplay.textContent = `Pilot: ${user.displayName || 'Anonymous'}`;
        } else {
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            userDisplay.classList.add('hidden');
        }
    }

    setupUIListeners() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const exportBtn = document.getElementById('export-btn');
        const closeLbBtn = document.getElementById('close-leaderboard-btn');
        const lbScreen = document.getElementById('leaderboard-screen');

        if (loginBtn) loginBtn.addEventListener('click', () => this.login());
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportSession());

        // Leaderboard UI controls
        if (closeLbBtn && lbScreen) {
            closeLbBtn.addEventListener('click', () => {
                lbScreen.classList.add('hidden');
            });
        }
    }

    async login() {
        if (this.mockMode) {
            alert("Mock Mode: Logging you in as Test User.");
            this.user = { uid: 'mock-123', displayName: 'Test Pilot' };
            this.updateAuthUI(this.user);
            return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await this.auth.signInWithPopup(provider);
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed.");
        }
    }

    async logout() {
        if (this.mockMode) {
            this.user = null;
            this.updateAuthUI(null);
            return;
        }
        await this.auth.signOut();
    }

    async saveScore(score) {
        if (!this.user) {
            alert("Please sign in to save scores to the cloud leaderboard.");
            return;
        }

        const scoreData = {
            uid: this.user.uid,
            name: this.user.displayName || "Anonymous",
            score: score,
            timestamp: new Date()
        };

        const loading = document.getElementById('loading-overlay');
        if (loading) loading.classList.remove('hidden');

        try {
            if (this.mockMode) {
                // Simulate network delay
                await new Promise(r => setTimeout(r, 800));
                this.mockLeaderboard.push({ name: scoreData.name, score: scoreData.score });
                this.mockLeaderboard.sort((a, b) => b.score - a.score);
                console.log("Mock Save:", scoreData);
            } else {
                await this.db.collection('scores').add({
                    ...scoreData,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            alert("Score saved to Global Leaderboard!");
        } catch (error) {
            console.error("Error saving score:", error);
            alert("Could not save score.");
        } finally {
            if (loading) loading.classList.add('hidden');
        }
    }

    // New Feature: UI for Leaderboard
    async updateLeaderboardUI() {
        const lbScreen = document.getElementById('leaderboard-screen');
        const lbBody = document.getElementById('leaderboard-body');

        if (!lbScreen || !lbBody) return;

        lbBody.innerHTML = ''; // Clear

        // Fetch data
        let data = [];
        if (this.mockMode) {
            data = this.mockLeaderboard;
        } else {
            // Real fetch
            try {
                const snapshot = await this.db.collection('scores')
                    .orderBy('score', 'desc')
                    .limit(10)
                    .get();
                data = snapshot.docs.map(doc => doc.data());
            } catch (e) {
                console.error("Fetch failed", e);
            }
        }

        // Render
        data.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid #333;">#${index + 1}</td>
                <td style="padding: 10px; border-bottom: 1px solid #333;">${entry.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #333; color: var(--primary-color);">${entry.score}</td>
            `;
            lbBody.appendChild(row);
        });

        lbScreen.classList.remove('hidden');
    }

    async exportSession() {
        alert("Exporting to Google Sheets... (Feature Mockup)\nData: " + JSON.stringify({
            score: document.getElementById('final-score').innerText,
            date: new Date().toISOString()
        }));
    }
}

// Expose to window
window.GameServices = new ServiceManager();
