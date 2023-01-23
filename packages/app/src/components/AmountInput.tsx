import { FC, useMemo, useState } from "react";
import { ConstraintValidator } from "../utils/constraints/constraints";
import Input from "./Input";

interface AmountInputProps {
    amount: number,
    onChange: (amount: number) => void,
    className?: string,

    validator?: ConstraintValidator<number>
    showUseMax?: boolean,
    minAmount?: number,
    maxAmount?: number,
    decimals?: number,
    id: string,
    label: string,
    name: string,

    disabled?: boolean
}

export const AmountInput: FC<AmountInputProps> = ({ className, amount, name, label, onChange, minAmount, decimals, id, maxAmount, disabled, validator }) => {
    const error = useMemo(() => validator?.validate(amount), [validator, amount]);
    const hasError = !disabled && error;

    const [displayAmount, setDisplayAmount] = useState("");
    // Always keep the state passed in and the internal state similar (not exact)
    if (amount != Number(displayAmount)) {
        setDisplayAmount(String(amount));
    }

    const handleChange = (value: string) => {
        let newAmount = value.replaceAll(/(^0+(?!\.|$)|[^0-9.]|(?<=\..*?)\.)/g, '');
        if (newAmount == '.'){
            newAmount = "0";
        }

        if (decimals){
            const extraTailLength = 1 + decimals - newAmount.substring(newAmount.indexOf(".")).length;
            if (extraTailLength < 0){
                newAmount = newAmount.slice(0, extraTailLength);
            }
        }

        setDisplayAmount(newAmount);

        const newAmountNumber = Number(newAmount);
        if (amount != newAmountNumber) {
            onChange(newAmountNumber);
        }
    };

    return (
        <Input
            className={`${hasError ? "text-red outline-red outline outline-[1.5px] bg-red-light/30" : ""} ${className}`}
            type={"text"}
            inputMode={"decimal"}
            min={minAmount ?? 0}
            value={displayAmount ? displayAmount : 0} // Dont add a default value since we set the value here
            onChange={(event) => handleChange(event.currentTarget.value)}
            disabled={disabled}
            id={id}
            label={label}
            name={name}
        />
    )
}