export class EventManager {
    #callbacks;

    constructor() {
        this.#callbacks = {};
    }

    add(keyword, callback) {
        if (!this.#callbacks[keyword]) {
            this.#callbacks[keyword] = [];
        }
        
        this.#callbacks[keyword].push({ callback });
    }

    call(keyword, ...args) {
        if (!this.#callbacks[keyword]) {
            return;
        }

        const callbacksToRemove = [];

        this.#callbacks[keyword].forEach(async (item, index) => {
            const rac = item.callback(...args);

            if (rac === true) {
                callbacksToRemove.push(index);
            }
        });

        callbacksToRemove.reverse().forEach(index => {
            this.#callbacks[keyword].splice(index, 1);
        });

        if (this.#callbacks[keyword].length === 0) {
            delete this.#callbacks[keyword];
        }
    }
} 