import { Constraint } from "./constraints";

export class NumberGreaterThan implements Constraint<number> {
    private readonly compare: number;
    private readonly error: string;

    constructor(compare: number, error?: string) {
        this.compare = compare;
        this.error = error || `Value has to be greater than ${this.compare}`;
    }

    validate(data: number): string | null {
        return data > this.compare ? null : this.error;
    }
}

export class NumberGreaterThanOrEqual implements Constraint<number> {
    private readonly compare: number;
    private readonly error: string;

    constructor(compare: number, error?: string) {
        this.compare = compare;
        this.error = error || `Value has to be ${this.compare} or more`;
    }

    validate(data: number): string | null {
        return data >= this.compare ? null : this.error;
    }
}

export class NumberLessThan implements Constraint<number> {
    private readonly compare: number;
    private readonly error: string;

    constructor(compare: number, error?: string) {
        this.compare = compare;
        this.error = error || `Value has to be less than ${this.compare}`;
    }

    validate(data: number): string | null {
        return data < this.compare ? null : this.error;
    }
}

export class NumberLessThanOrEqual implements Constraint<number> {
    private readonly compare: number;
    private readonly error: string;

    constructor(compare: number, error?: string) {
        this.compare = compare;
        this.error = error || `Value has to be ${this.compare} or less`;
    }

    validate(data: number): string | null {
        return data <= this.compare ? null : this.error;
    }
}

export class NumberEqualTo implements Constraint<number> {
    private readonly compare: number;
    private readonly error: string;

    constructor(compare: number, error?: string) {
        this.compare = compare;
        this.error = error || `Value is not equal to ${this.compare}`;
    }

    validate(data: number): string | null {
        return data == this.compare ? null : this.error;
    }
}

export class NumberNotEqualTo implements Constraint<number> {
    private readonly compare: number;
    private readonly error: string;

    constructor(compare: number, error?: string) {
        this.compare = compare;
        this.error = error || `Value is not equal to ${this.compare}`;
    }

    validate(data: number): string | null {
        return data != this.compare ? null : this.error;
    }
}

export const NUMBER_EQUAL_TO_0 = new NumberEqualTo(0);
export const NUMBER_NOT_EQUAL_TO_0 = new NumberNotEqualTo(0);