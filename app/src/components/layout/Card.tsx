import React from "react";
import { classNames } from "utils/styles";

type Props = {
  children?: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
};

const Card = (props: Props) => {
  return (
    <div
      className={classNames(
        props.className,
        "divide-y divide-gray-200 rounded-lg bg-white shadow-lg"
      )}
    >
      <div className="px-4 py-5 sm:px-6">{props.header}</div>
      <div className="px-4 py-5 sm:p-6">{props.children}</div>
    </div>
  );
};

export default Card;
