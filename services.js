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
        this.init();
    }

    init() {
        try {
            if (firebase.apps.length === 0) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            this.auth = firebase.auth();
            this.db = firebase.firestore();

            this.setupAuthListener();
            this.setupUIListeners();
            console.log("Services Initialized");
        } catch (e) {
            console.warn("Firebase not configured correctly. Running in offline mode.", e);
        }
    }

    setupAuthListener() {
        this.auth.onAuthStateChanged(user => {
            this.user = user;
            const loginBtn = document.getElementById('login-btn');
            const logoutBtn = document.getElementById('logout-btn');
            const userDisplay = document.getElementById('user-display');

            if (user) {
                loginBtn.classList.add('hidden');
                logoutBtn.classList.remove('hidden');
                userDisplay.classList.remove('hidden');
                userDisplay.textContent = `Pilot: ${user.displayName}`;
                console.log("User logged in:", user.uid);
            } else {
                loginBtn.classList.remove('hidden');
                logoutBtn.classList.add('hidden');
                userDisplay.classList.add('hidden');
            }
        });
    }

    setupUIListeners() {
        document.getElementById('login-btn').addEventListener('click', () => this.login());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        document.getElementById('export-btn').addEventListener('click', () => this.exportSession());
    }

    async login() {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await this.auth.signInWithPopup(provider);
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. See console for details.");
        }
    }

    async logout() {
        await this.auth.signOut();
    }

    async saveScore(score) {
        if (!this.user) {
            alert("Please sign in to save scores to the cloud leaderboard.");
            return;
        }

        const scoreData = {
            uid: this.user.uid,
            name: this.user.displayName,
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const loading = document.getElementById('loading-overlay');
            loading.classList.remove('hidden');

            await this.db.collection('scores').add(scoreData);

            loading.classList.add('hidden');
            alert("Score saved to Global Leaderboard!");
        } catch (error) {
            console.error("Error saving score:", error);
            document.getElementById('loading-overlay').classList.add('hidden');
            alert("Could not save score. Check console.");
        }
    }

    async exportSession() {
        // Placeholder for Google Sheets/Drive API
        // Real implementation requires detailed OAuth2 flow beyond simple Firebase Auth
        alert("Exporting to Google Sheets... (Feature Mockup)\nData: " + JSON.stringify({
            score: document.getElementById('final-score').innerText,
            date: new Date().toISOString()
        }));
    }
}

// Expose to window
window.GameServices = new ServiceManager();
