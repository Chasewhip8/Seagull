import React, { ChangeEventHandler } from "react";
import { classNames } from "../utils/styles";

type Props = {
  className: string;
  label: string;
  name: string;
  id: string;
  type: React.HTMLInputTypeAttribute;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  min?: number;
  value: string | number;
  description?: string;
  placeholder?: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
};

const Input = (props: Props) => {
  const isNumeric = props.inputMode == "numeric" || props.inputMode == "decimal";

  return (
    <div className={props.className}>
      {props.label ? (
        <label
          htmlFor={props.name}
          className="block text-sm font-medium text-gray-700"
        >
          {props.label}
        </label>
      ) : null}
      <div className="mt-1">
        <input
          type={props.type}
          name={props.name}
          id={props.id}
          value={isNumeric ? props.value : undefined}
          onChange={props.onChange}
          min={isNumeric ? props.min : undefined}
          disabled={props.disabled}
          inputMode={props.inputMode}
          className={classNames(
              "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5",
              props.disabled ? "bg-gray-100" : ""
          )}
          placeholder={props.placeholder ? props.placeholder : null}
          aria-describedby={props.ariaDescribedBy}
        />
      </div>
      {props.description ? (
        <p className="mt-2 text-sm text-gray-500" id="email-description">
          {props.description}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
