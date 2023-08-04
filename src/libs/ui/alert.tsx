import { IconExclamationCircle, IconInfoCircle } from "./icon";
import { IconCheckmarkCircle } from "./icon/icon-checkmark-circle";
import { VDomChildren, cn } from "./utils";

export const AlertError = ({
  className,
  children,
}: {
  children?: VDomChildren;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-md bg-red-500 p-4 text-white",
        className
      )}>
      <div>
        <IconExclamationCircle />
      </div>

      {children}
    </div>
  );
};

export const AlertInfo = ({
  children,
  className,
}: {
  children?: VDomChildren;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        className,
        "flex w-full items-center gap-2 rounded-md bg-blue-500 p-4 text-white"
      )}>
      <div>
        <IconInfoCircle />
      </div>
      {children}
    </div>
  );
};

export const AlertSuccess = ({
  children,
  className,
}: {
  children?: VDomChildren;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        className,
        "flex w-full items-center gap-2 rounded-md bg-green-500 p-4 text-white"
      )}>
      <div>
        <IconCheckmarkCircle />
      </div>
      {children}
    </div>
  );
};
