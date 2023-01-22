import { FC, useMemo, useState } from "react";
import { ConstraintValidator } from "../../../utils/constraints/constraints";

interface AmountInputProps {
    amount: number,
    onChange: (amount: number) => void,

    validator?: ConstraintValidator<number>
    showUseMax?: boolean,
    minAmount?: number,
    maxAmount?: number,
    decimals?: number

    disabled?: boolean
}

export const AmountInput: FC<AmountInputProps> = ({ amount, onChange, minAmount, decimals, maxAmount, disabled, validator }) => {
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
        <div className={"relative flex items-center group"}>
            <input
                className={`px-2 py-3 rounded-xl w-full h-14 
                ${disabled ? "bg-grey-lightish cursor-not-allowed text-black/75" : "bg-grey-light"} 
                ${hasError ? "text-red outline-red outline outline-[1.5px] bg-red-light/30" : ""}`}
                type={"text"}
                inputMode={"decimal"}
                min={minAmount ?? 0}
                value={displayAmount ? displayAmount : 0} // Dont add a default value since we set the value here
                onChange={(event) => handleChange(event.currentTarget.value)}
                disabled={disabled}
            />
            <button
                className={`absolute right-3 text-green-dark font-bold text-medium ${disabled ? "cursor-not-allowed text-green-dark/75" : "button-silent"}`}
                onClick={() => handleChange(String(maxAmount))}
            >USE MAX
            </button>
        </div>
    )
}