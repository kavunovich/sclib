import { ALPHABET } from './../constants.js';

export class SMDTransformer {
    static transform_array(array, transformFunction) {
        const stack = [[array, []]];
        const transformed = {};
   
        while (stack.length > 0) {
            const [current, path] = stack.pop();
   
            for (const [key, value] of Object.entries(current)) {
                const newKey = transformFunction(key);
                const currentPath = [...path, newKey];
                
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    stack.push([value, currentPath]);
                    let ref = transformed;
                    for (const pathKey of currentPath) {
                        if (!(pathKey in ref)) {
                            ref[pathKey] = {};
                        }
                        ref = ref[pathKey];
                    }
                } else {
                    let ref = transformed;
                    const lastKey = currentPath.pop();
                    for (const pathKey of currentPath) {
                        if (!(pathKey in ref)) {
                            ref[pathKey] = {};
                        }
                        ref = ref[pathKey];
                    }
                    ref[lastKey] = value;
                }
            }
        }
   
        return transformed;
    }

    static sort_object(array) {
        const stack = [[array, []]];
        const sorted = {};
   
        while (stack.length > 0) {
            const [current, path] = stack.pop();
            const sortedKeys = Object.keys(current).sort();
   
            for (const key of sortedKeys) {
                const value = current[key];
                const currentPath = [...path, key];
                
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    let ref = sorted;
                    stack.push([value, currentPath]);

                    for (const pathKey of currentPath) {
                        if (!(pathKey in ref)) {
                            ref[pathKey] = {};
                        }

                        ref = ref[pathKey];
                    }
                } else {
                    let ref = sorted;
                    const lastKey = currentPath.pop();

                    for (const pathKey of currentPath) {
                        if (!(pathKey in ref)) {
                            ref[pathKey] = {};
                        }

                        ref = ref[pathKey];
                    }

                    ref[lastKey] = value;
                }
            }
        }
   
        return sorted;
    }
   
    static shorten(data) {
        if (typeof data === 'string') {
            const index = Object.entries(ALPHABET).find(([_, value]) => value === data)?.[0];
            return index !== undefined ? index : data;
        }
   
        const transformed = this.transform_array(data, (key) => {
            const index = Object.entries(ALPHABET).find(([_, value]) => value === key)?.[0];
            return index !== undefined ? index : key;
        });
   
        return this.sort_object(transformed);
    }
   
    static expand(data) {
        if (typeof data === 'string') {
            return ALPHABET[data] || data;
        }
   
        const transformed = this.transform_array(data, (key) => {
            return ALPHABET[key] || key;
        });
   
        return this.sort_object(transformed);
    }
}
