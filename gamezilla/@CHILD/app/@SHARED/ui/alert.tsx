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
      class={cn(
        "flex w-full items-center rounded-md bg-red-500 p-4 text-white",
        className
      )}>
      <div class="mr-2">
        <IconExclamationCircle class="h-6 w-6" />
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
      class={cn(
        className,
        "flex w-full items-center rounded-md bg-blue-500 p-4 text-white"
      )}>
      <div class="mr-2">
        <IconInfoCircle class="h-6 w-6" />
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
      class={cn(
        className,
        "flex w-full items-center rounded-md bg-green-500 p-4 text-white"
      )}>
      <div class="mr-2">
        <IconCheckmarkCircle class="h-6 w-6" />
      </div>
      {children}
    </div>
  );
};
