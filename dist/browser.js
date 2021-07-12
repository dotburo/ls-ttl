var Ls = (function () {
    'use strict';

    const _IN_MEMORY_STORAGE = {};

    /**
     * Evaluate if the browser support usage of localStorage (eg. when Safari is set to block all cookies).
     * @return {boolean}
     */
    function checkSupport() {
        try {
            const key = '__random_tmp_key__';
            window.localStorage.setItem(key, key);
            window.localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get the localStorage method name.
     * @param {string} name
     * @return {function<*>}
     */
    function getStorageMethod(name) {
        if (checkSupport()) {
            return window.localStorage[`${name}Item`].bind(window.localStorage)
        }

        switch (name) {
            case 'get':
                return (key) => _IN_MEMORY_STORAGE[key];
            case 'set':
                return (key, value) => _IN_MEMORY_STORAGE[key] = value;
            case 'remove':
                return (key) => delete _IN_MEMORY_STORAGE[key];
        }
    }

    const _KEY_PREFIX = 'ls-',
        _TTL_SUFFIX = '-ls-ttl';

    /** LocalStorage client with TTL. */
    class Ls {
        constructor(options = {}) {
            this.options = {
                keyPrefix: options.keyPrefix || _KEY_PREFIX,
                ttlSuffix: options.ttlSuffix || _TTL_SUFFIX,
                encrypt: options.encrypt || null,
            };
        }

        /**
         * Add an entry to the persistent storage.
         * @param {string} key
         * @param {*} value         Number or string-convertible data
         * @param {number} ttl      Time to live in seconds
         */
        set(key, value, ttl = 0) {
            key = this.makeKey(key);

            if (value && typeof value !== 'string') {
                value = this._stringify(value);
            }

            getStorageMethod('set')(key, value);

            if (ttl > 0) {
                getStorageMethod('set')(key + this.options.ttlSuffix, (Date.now() + (ttl * 1000)).toString());
            }
        }

        /**
         * Get a value from the persistent storage.
         * @param {string} key
         * @param {boolean} forget
         * @return {string|number}
         */
        get(key, forget = false) {
            let key2 = this.makeKey(key);

            const isTTLKey = this.isTTLKey(key2),
                ttl = !isTTLKey ? this.getTTL(key) : parseInt(getStorageMethod('get')(key2), 10);

            if (ttl && ttl < Date.now()) {
                key2 = isTTLKey ? key2.replace(this.options.ttlSuffix, '') : key2;
                this.delete(key2);
                return void 0;
            }

            let value = getStorageMethod('get')(key2);

            if (forget) {
                this.delete(key);
            }

            try {
                return JSON.parse(value);
            } catch (error) {
                return value;
            }
        }

        /**
         * Return the matching key with the prefix.
         * @param {string} key
         * @param {string} prefix
         * @return {string}
         * @private
         */
        makeKey(key, prefix = '') {
            return this.options.keyPrefix
                + (typeof this.options.encrypt === 'function' ? this.options.encrypt(key) : key);
        }

        /**
         * Check if given key is a TTL key.
         * @param {string} key
         * @return {boolean}
         */
        isTTLKey(key) {
            return (new RegExp(`${this.options.ttlSuffix}$`)).test(key)
        }

        /**
         * Get the TTL of a saved value.
         * @param {string} key
         * @return {number}
         */
        getTTL(key) {
            key = this.makeKey(key);

            let ttl = getStorageMethod('get')(key + this.options.ttlSuffix);

            if (!ttl) {
                return 0;
            }

            return parseInt(ttl, 10);
        }

        /**
         * Remove an entry from the persistent storage.
         * @param {string|string[]} keys
         */
        delete(...keys) {
            const rm = getStorageMethod('remove');

            keys.forEach(key => {
                key = this.makeKey(key);
                rm(key);
                rm(key + this.options.ttlSuffix);
            });
        }

        /**
         * Convert given value to a string.
         * @param {*} value
         * @return {string|Number}
         * @private
         */
        _stringify(value) {
            // Make sure we do not save `undefined` or `null` as string.
            // LocalStorage only saves and returns strings.
            if (!value) return '';

            if (typeof value.stringify === 'function') return value.stringify();

            if (typeof value === 'object') return JSON.stringify(value);

            if (typeof value.toString === 'function') return value.toString();

            return value;
        }
    }

    return Ls;

}());
//# sourceMappingURL=browser.js.map
