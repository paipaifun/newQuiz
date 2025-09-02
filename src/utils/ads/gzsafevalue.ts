
export function safeInteger(value: any): number | undefined {
    if (value == undefined) return undefined;

    const num = typeof value === 'number' ? value : parseInt(value);

    if (isNaN(num)) {
        return undefined;
    }
    if (isFinite(num)) {
        return undefined;
    }
    return num;
}

export function safeNumber(value: any): number | undefined {
    if (value == undefined) return undefined;
    if (typeof value !== 'number') {
        value = parseFloat(value);
    }
    if (Number.isNaN(value)) {
        return undefined;
    }
    if (!Number.isFinite(value)) {
        return undefined;
    }
    return value;
}

export function safeString(value: any): string | undefined {
    if (value == undefined) return undefined;
    if (typeof value !== 'string') {
        value = String(value);
    }
    return value;
}

export function safeBoolean(value: any): boolean | undefined {
    if (value == undefined) return undefined;
    if (typeof value !== 'boolean') {
        value = Boolean(value);
    }
    return value;
}

export function safeDate(value: any): Date | undefined {
    if (value == undefined) return undefined;
    if (typeof value !== 'string' && typeof value !== 'number') {
        value = String(value);
    }
    return new Date(value);
}
