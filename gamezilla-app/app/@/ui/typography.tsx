import { TranslatedText } from "gamezilla-app/@/l18n";
import { cn } from "./ui";
import { AriaRole } from "react";

export type TypographyVariant = "title" | "body" | "label";

const variantClasses: {[variant in TypographyVariant]: string } = {
    title: "text-3xl font-bold text-white",
    body: "text-base text-neutral-300",
    label: "text-xs text-neutral-300",
};

export const Typography = (input: { text: TranslatedText; variant: TypographyVariant, className?: string, role?: AriaRole }) => {
    return (
        <p className={cn(variantClasses[input.variant], input.className)} aria-role={input.role}>
            {input.text}
        </p>
    );
};
