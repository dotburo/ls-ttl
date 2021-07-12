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
 * @return {Function}
 */
export function getStorageMethod(name) {
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
