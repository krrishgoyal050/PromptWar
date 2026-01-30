/**
 * Caching Module - Smart Caching with TTL & Invalidation
 */
export class SmartCache {
    constructor(ttlMinutes = 10) {
        this.ttl = ttlMinutes * 60 * 1000;
        this.cacheKey = 'uc_ai_cache';
    }

    set(key, data) {
        const payload = {
            timestamp: Date.now(),
            data: data
        };
        const store = this._getStore();
        store[key] = payload;
        this._saveStore(store);
    }

    get(key) {
        const store = this._getStore();
        const entry = store[key];

        if (!entry) return null;

        // Invalidation logic
        if (Date.now() - entry.timestamp > this.ttl) {
            delete store[key];
            this._saveStore(store);
            return null;
        }

        return entry.data;
    }

    _getStore() {
        try {
            return JSON.parse(localStorage.getItem(this.cacheKey)) || {};
        } catch (e) {
            return {};
        }
    }

    _saveStore(store) {
        localStorage.setItem(this.cacheKey, JSON.stringify(store));
    }

    clear() {
        localStorage.removeItem(this.cacheKey);
    }
}
