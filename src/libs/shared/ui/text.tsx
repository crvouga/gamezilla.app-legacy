import React, { ElementType } from "react";

type Variant = "h1" | "h2" | "h3" | "h4" | "h5" | "body" | "body-sm" | "sm";

type Props = {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  color?: "primary" | "secondary";
};

const tags: Record<Variant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  body: "p",
  "body-sm": "p",
  sm: "span",
};

const sizes: Record<Variant, string> = {
  h1: "text-4xl font-bold sm:text-5xl",
  h2: "text-3xl font-bold sm:text-4xl",
  h3: "text-2xl font-bold sm:text-3xl",
  h4: "text-xl font-bold sm:text-2xl",
  h5: "text-lg font-bold sm:text-xl",
  body: "text-md sm:text-lg",
  "body-sm": "text-sm sm:text-md",
  sm: "text-xs sm:text-sm",
};

export const Text = ({
  color = "primary",
  variant,
  children,
  className,
  as,
}: Props) => {
  const sizeClasses = sizes[variant];
  const Tag = as || tags[variant];

  return (
    <Tag
      className={`${sizeClasses} ${className} ${
        color === "primary" ? "text-white" : "text-secondary"
      }`}>
      {children}
    </Tag>
  );
};
