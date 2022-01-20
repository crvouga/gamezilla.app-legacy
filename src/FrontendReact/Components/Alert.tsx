import React from "react";
import * as Icons from "./Icons";

type AlertVariant = "error";

const variantToIcon: { [variant in AlertVariant]: React.ReactNode } = {
  error: <Icons.Error />,
};

const variantToClassNames: {
  [variant in AlertVariant]: {
    root: string;
    icon: string;
    title: string;
    body: string;
  };
} = {
  error: {
    root: "bg-red-300",
    title: "text-red-800",
    icon: "text-red-700",
    body: "text-red-700",
  },
};

export const Alert = ({
  variant,
  title,
  body,
  className,
}: {
  variant: AlertVariant;
  title?: React.ReactNode;
  body?: React.ReactNode;
  className?: string;
}) => {
  const classNames = variantToClassNames[variant];
  return (
    <div
      className={`p-4 flex items-start justify-center rounded ${classNames.root} ${className}`}
    >
      <div className={`mr-4 ${classNames.icon}`}>{variantToIcon[variant]}</div>

      <div>
        {title && (
          <div className={`font-bold text-base ${classNames.title}`}>
            {title}
          </div>
        )}
        {body && (
          <div className={`font-medium text-sm ${classNames.body}`}>{body}</div>
        )}
      </div>
    </div>
  );
};
