var Ls = (function () {
    'use strict';

    /**
     * Create a random string.
     * @param {number} length
     * @return {string}
     */
    function randomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            charactersLength = characters.length;

        let result = '';

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    const
        _STORAGE = window.localStorage,
        _KEY_PREFIX = 'ls-',
        _TTL_SUFFIX = '-ls-ttl',
        _KEYS = {};

    /**
     * Get the localStorage method name.
     * @param {string} name
     * @return {string}
     * @private
     */
    function _method(name) {
        return `${name}Item`;
    }

    /**
     * Return the matching key with the prefix.
     * @param {string} key
     * @param {string} prefix
     * @return {string}
     * @private
     */
    function _getKey(key, prefix = '') {
        return prefix + (_KEYS[key] || key);
    }

    /** LocalStorage client with TTL and randomised keys. */
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
            key = _getKey(key, this.options.keyPrefix);

            const set = _method('set');

            if (value && typeof value !== 'string') {
                value = this._stringify(value);
            }

            _STORAGE[set](key, value);

            if (ttl > 0) {
                _STORAGE[set](key + this.options.ttlSuffix, (Date.now() + (ttl * 1000)).toString());
            }
        }

        /**
         * Add an entry by randomising the key.
         * @param {string} key
         * @param {*} value         Number or string-convertible data
         * @param {number} ttl      Time to live in seconds
         * @return void
         */
        setWithRandomKey(key, value, ttl = 0) {
            const key2 = _getKey(key, this.options.keyPrefix);
            _KEYS[key] = key2 ? key2 : randomString(16);
            return this.set(_KEYS[key], value, ttl);
        }

        /**
         * Add an entry by encrypting the given key.
         * @param {string} key
         * @param {*} value         Number or string-convertible data
         * @param {number} ttl      Time to live in seconds
         * @return void
         */
        setWithEncryptedKey(key, value, ttl = 0) {
            _KEYS[key] = this.options.encrypt ? this.options.encrypt(key) : btoa(key);
            return this.set(_KEYS[key], value, ttl);
        }

        /**
         * Get a value from the persistent storage.
         * @param {string} key
         * @param {boolean} forget
         * @return {string|number}
         */
        get(key, forget = false) {
            let key2 = _getKey(key, this.options.keyPrefix);

            const get = _method('get'),
                isTTLKey = this.isTTLKey(key2),
                ttl = !isTTLKey ? this.getTTL(key) : parseInt(_STORAGE[get](key2), 10);

            if (ttl && ttl < Date.now()) {
                key2 = isTTLKey ? key2.replace(this.options.ttlSuffix, '') : key2;
                this.delete(key2);
                return void 0;
            }

            let value = _STORAGE[get](key2);

            if (forget) {
                this.delete(key2);
            }

            return value;
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
            key = _getKey(key, this.options.keyPrefix);

            let ttl = _STORAGE[_method('get')](key + this.options.ttlSuffix);

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
            const rm = _method('remove');

            keys.forEach(key => {
                let k = _getKey(key, this.options.keyPrefix);
                _STORAGE[rm](k);
                _STORAGE[rm](k + this.options.ttlSuffix);
                delete _KEYS[key];
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
