import React from "react";
import { classNames } from "utils/styles";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const Container = (props: Props) => {
  return (
    <div
      className={classNames(
        props.className,
        "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      )}
    >
      {/* We've used 3xl here, but feel free to try other max-widths based on your needs */}
      <div className="mx-auto max-w-3xl">{props.children}</div>
    </div>
  );
};

export default Container;
