# Space Dodger Walkthrough (Updated for Urban Crisis Dashboard)

## How to use the Adaptive Intelligence Dashboard
1. **Open Directory**: `c:/PromptWar/urban_crisis_dashboard/`
2. **Launch**: Open `index.html`.
3. **Interaction**:
   - **Live Feed**: Observe incoming incidents on the left.
   - **Details**: Click an alert to pan the map and trigger Gemini AI summarization.
   - **Filters**: Toggle between "ALL" and "CRITICAL" using the tactical buttons.
   - **Auth**: Click "Login with Google" to test the UI flow.

## Developer Setup
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Maps JavaScript API** and **Generative Language API**.
3. Create a **Firebase** project and enable Auth/Firestore.
4. Replace keys in `app.js` -> `CONFIG` object.

## Run Tests
1. Open Console (F12).
2. Type: `import { DashboardTests } from './tests.js'; DashboardTests.run();`
3. View the detailed validation report.
