import React from "react";

type Props = {
  className: string;
  label: string;
  name: string;
  id: string;
  type: React.HTMLInputTypeAttribute;
  value: string | number;
  description?: string;
  placeholder?: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
};

const Input = (props: Props) => {
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
          value={props.value}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5"
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
