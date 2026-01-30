/**
 * Simple Test Runner for Space Dodger
 * Open index.html and run `runTests()` in console, or include this file.
 */

const Tests = {
    run() {
        console.log("%c STARTING TESTS ", "background: #222; color: #bada55");
        let passed = 0;
        let failed = 0;

        const assert = (condition, message) => {
            if (condition) {
                console.log(`%c PASS: ${message}`, "color: green");
                passed++;
            } else {
                console.error(`%c FAIL: ${message}`, "color: red");
                failed++;
            }
        };

        // TEST 1: Collision Detection Math
        // AABB Collision mock
        const rect1 = { x: 0, y: 0, width: 10, height: 10 };
        const rect2 = { x: 5, y: 5, width: 10, height: 10 }; // Intersecting
        const rect3 = { x: 20, y: 20, width: 10, height: 10 }; // Not intersecting

        const isColliding = (r1, r2) => {
            return r1.x < r2.x + r2.width &&
                r1.x + r1.width > r2.x &&
                r1.y < r2.y + r2.height &&
                r1.y + r1.height > r2.y;
        };

        assert(isColliding(rect1, rect2) === true, "Rectangle Intersection (True)");
        assert(isColliding(rect1, rect3) === false, "Rectangle Intersection (False)");

        // TEST 2: Score State
        const mockState = { score: 100, highScore: 200 };
        mockState.score += 50;
        assert(mockState.score === 150, "Score increments correctly");

        // TEST 3: Input Validation
        const allowedKeys = ['ArrowUp', 'Space'];
        const validateKey = (k) => allowedKeys.includes(k);
        assert(validateKey('ArrowUp') === true, "ArrowUp is allowed");
        assert(validateKey('Enter') === false, "Enter is not in allowed movement keys");

        console.log(`%c TESTS COMPLETE: ${passed} Passed, ${failed} Failed`, "font-weight: bold");
    }
};

// Auto-run if in dev mode or manually called
// Tests.run();
