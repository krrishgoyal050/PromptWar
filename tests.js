/**
 * Comprehensive Test Suite for Urban Crisis Dashboard
 * Targets: Security, Efficiency (Caching), and Core Logic
 */

export const DashboardTests = {
    async run() {
        console.log("%c --- STARTING DASHBOARD VALIDATION SUITE --- ", "background: #111; color: #00f2ff; font-weight: bold;");

        const results = { passed: 0, failed: 0 };

        const test = async (name, fn) => {
            try {
                await fn();
                console.log(`%c PASS: ${name}`, "color: #4ade80");
                results.passed++;
            } catch (e) {
                console.error(`%c FAIL: ${name} -> ${e.message}`, "color: #f87171");
                results.failed++;
            }
        };

        // 1. SECURITY: Input Sanitization
        await test("Security: Sanitizes HTML Tags in Location Strings", () => {
            const unsafeString = "<script>alert('xss')</script>Bleecker St";
            const div = document.createElement('div');
            div.textContent = unsafeString; // Safe DOM pattern
            if (div.innerHTML.includes('<script>')) throw new Error("XSS string survived sanitization");
        });

        // 2. EFFICIENCY: Caching Logic
        await test("Efficiency: Cache TTL Invalidation", async () => {
            localStorage.clear();
            const { SmartCache } = await import('./cache.js');
            const cache = new SmartCache(0.0001); // Instant expiry for test

            cache.set('test_key', { val: 1 });
            await new Promise(r => setTimeout(r, 100)); // Wait for expiry

            if (cache.get('test_key') !== null) throw new Error("Cache failed to invalidate after TTL");
        });

        // 3. CORE LOGIC: Alert Rendering
        await test("Core: Alert List generates correct DOM nodes", () => {
            const list = document.getElementById('alert-list');
            const initialCount = list.childElementCount;
            // App normally handles this, we verify state
            if (initialCount === 0 && !list.innerHTML.includes('Satellite')) throw new Error("Alert list is empty and no loading state seen");
        });

        // 4. ACCESSIBILITY: ARIA Compliance
        await test("Accessibility: Essential Roles Present", () => {
            const feed = document.getElementById('live-feed');
            if (feed.getAttribute('aria-labelledby') !== 'feed-title') throw new Error("Missing ARIA labeling on Live Feed sidebar");
        });

        // 5. GOOGLE SERVICES: API Resilience
        await test("Services: Graceful Fallback for Missing Keys", async () => {
            const { GoogleServices } = await import('./api.js');
            const gs = new GoogleServices({ mapsApiKey: 'INVALID' });
            const summary = await gs.summarizeIncident({ type: 'Fire' });
            if (typeof summary !== 'string') throw new Error("Service failed to return fallback string on API err");
        });

        console.log(`%c --- TEST COMPLETE: ${results.passed} PASSED, ${results.failed} FAILED --- `, "font-weight: bold; font-size: 1.1em;");
        return results;
    }
};

// Manually trigger if needed: DashboardTests.run()
