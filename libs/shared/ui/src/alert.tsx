import { ReactNode } from 'react';
import { IconExclamationCircle, IconInfoCircle } from './icon';
import { IconCheckmarkCircle } from './icon/icon-checkmark-circle';
import { classNames } from './utils';

export const AlertError = ({
  className,
  children,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        'bg-red-500 text-white rounded-md p-4 flex items-center w-full gap-2',
        className
      )}
    >
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
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        className,
        'bg-blue-500 text-white p-4 rounded-md flex items-center w-full gap-2'
      )}
    >
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
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        className,
        'bg-green-500 text-white p-4 rounded-md flex items-center w-full gap-2'
      )}
    >
      <div>
        <IconCheckmarkCircle />
      </div>
      {children}
    </div>
  );
};
