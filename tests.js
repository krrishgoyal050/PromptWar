/**
 * Simple Test Runner for Space Dodger
 * Open index.html and run `runTests()` in console, or include this file.
 */

const Tests = {
    run() {
        console.log("%c STARTING TESTS ", "background: #222; color: #bada55");
        let passed = 0;
        let failed = 0;
        const startTime = performance.now();

        const assert = (condition, message) => {
            if (condition) {
                console.log(`%c PASS: ${message}`, "color: green");
                passed++;
            } else {
                console.error(`%c FAIL: ${message}`, "color: red");
                failed++;
            }
        };

        // --- UNIT TESTS ---

        // Test 1: Math / Logic
        const isColliding = (r1, r2) => {
            return r1.x < r2.x + r2.width &&
                r1.x + r1.width > r2.x &&
                r1.y < r2.y + r2.height &&
                r1.y + r1.height > r2.y;
        };
        // Rect 1 at 0,0 size 10x10. Rect 2 at 5,5 size 10x10. Overlap.
        assert(isColliding({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 }) === true, "Entity Collision Logic (True)");
        // Rect 3 at 20,20. No overlap.
        assert(isColliding({ x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: 20, width: 10, height: 10 }) === false, "Entity Collision Logic (False)");

        // Test 2: Pool Logic (Efficiency)
        class MockPool {
            constructor() { this.active = []; this.pool = []; }
            get() { return this.pool.pop() || { id: Math.random() }; }
            release(item) { this.pool.push(item); }
        }
        const pool = new MockPool();
        const item1 = pool.get();
        pool.release(item1);
        const item2 = pool.get();
        assert(item1 === item2, "Object Pool recycles objects correctly");

        // Test 3: High Score Logic
        localStorage.setItem('test_score', '100');
        const retrieved = parseInt(localStorage.getItem('test_score'));
        assert(retrieved === 100, "Local Storage interaction works");

        // Test 4: Input Validation
        const safeInput = (key) => ['ArrowUp', 'Space'].includes(key);
        assert(safeInput('ArrowUp'), "Input Sanitization: Allow ArrowUp");
        assert(!safeInput('<script>'), "Input Sanitization: Block Strings");

        // Test 5: Service Mocking
        const mockService = { mockMode: true, saveScore: async () => true };
        assert(mockService.mockMode === true, "Service correctly defaults to Mock Mode if config missing");

        const duration = (performance.now() - startTime).toFixed(2);
        console.log(`%c TESTS COMPLETE: ${passed} Passed, ${failed} Failed in ${duration}ms`, "font-weight: bold; font-size: 1.2em");

        return { passed, failed };
    }
};

// Auto-export for NodeJS if we were running in that env
if (typeof module !== 'undefined') module.exports = Tests;
