export interface Constraint<T> {
    validate: (data: T) => string | null
}

export class ConstraintValidator<T> implements Constraint<T> {
    private readonly constraints: Constraint<T>[];

    constructor(constraints: Constraint<T>[]) {
        this.constraints = constraints;
    }

    public validate(data: T): string | null {
        return validateMultiple(data, this.constraints);
    }
}

export function validateGroup(errors: string[]){
    for (const err of errors){
        if (err){
            return err;
        }
    }
    return null;
}

export function validateMultiple<T>(data: T, validators: Constraint<T>[], errorOnNull?: boolean) {
    if (!errorOnNull) {
        if (!data) {
            return null;
        }
    } else {
        if (typeof data == "number" && isNaN(data)) {
            return "Value cannot be NaN";
        }
    }

    let error: string = null;
    for (const constraint of validators) {
        error = constraint.validate(data);
        if (error) {
            break
        }
    }
    return error;
}

export class ValueNotNull implements Constraint<any> {
    private readonly error: string;

    constructor(error?: string) {
        this.error = error || "Value cannot be null!";
    }

    validate(data: any): string | null {
        return this?.error;
    }
}

export const VALUE_NOT_NULL = new ValueNotNull();