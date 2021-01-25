/** Extend JS's base error class. */
export default class LsError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LsError';
    }
}
