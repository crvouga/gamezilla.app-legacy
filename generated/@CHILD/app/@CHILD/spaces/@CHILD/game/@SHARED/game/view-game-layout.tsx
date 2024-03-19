import { cn } from "gamezilla-app/@CHILD/app/@SHARED/ui";
import { VDomChildren } from "gamezilla-app/@SHARED/vdom";
export const GameLayout = ({ children, isSpectating, className, }: {
    className?: string;
    isSpectating?: boolean;
    children?: VDomChildren;
}) => {
    return (<div className={cn("flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll", isSpectating && "border-8 border-t-0 border-blue-500", className)}>
      {isSpectating && (<div className="flex w-full items-center justify-center bg-blue-500 py-1 text-sm font-semibold text-white">
          You are spectating
        </div>)}
      {children}
    </div>);
};
