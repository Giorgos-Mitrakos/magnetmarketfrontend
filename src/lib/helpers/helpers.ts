type DataWrapper<T> = {
    data: T;
};

type AttributesWrapper<T> = {
    attributes: T;
};

type StrapiWrapper<T> = DataWrapper<T> | AttributesWrapper<T>;

export function flattenJSON<T>(obj: T): T extends StrapiWrapper<infer U> ? U : T extends Array<infer V> ? Array<ReturnType<typeof flattenJSON<V>>> : T extends object ? { [K in keyof T]: ReturnType<typeof flattenJSON<T[K]>> } : T {
    if (obj === null || obj === undefined) {
        return obj as any;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => flattenJSON(item)) as any;
    }

    if (typeof obj === 'object') {
        // Αν το object έχει μόνο ένα key που είναι "data", επιστρέφουμε το περιεχόμενό του
        if (Object.keys(obj).length === 1 && 'data' in obj) {
            return flattenJSON((obj as any).data);
        }

        // Αν το object έχει μόνο ένα key που είναι "attributes", επιστρέφουμε το περιεχόμενό του
        if (Object.keys(obj).length === 1 && 'attributes' in obj) {
            return flattenJSON((obj as any).attributes);
        }

        // Αν έχει και "data" και άλλα keys, κρατάμε τα άλλα και αντικαθιστούμε το "data"
        if ('data' in obj) {
            const { data, ...rest } = obj as any;
            return flattenJSON({ ...rest, ...data });
        }

        // Αν έχει και "attributes" και άλλα keys, κρατάμε τα άλλα και αντικαθιστούμε το "attributes"
        if ('attributes' in obj) {
            const { attributes, ...rest } = obj as any;
            return flattenJSON({ ...rest, ...attributes });
        }

        // Για όλα τα άλλα objects, επεξεργαζόμαστε αναδρομικά κάθε property
        const result = {} as any;
        for (const [key, value] of Object.entries(obj)) {
            result[key] = flattenJSON(value);
        }
        return result;
    }

    // Για primitive values, επιστρέφουμε όπως είναι
    return obj as any;
}