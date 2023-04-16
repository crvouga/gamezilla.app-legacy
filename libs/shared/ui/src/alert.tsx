import { ReactNode } from 'react';
import { IconExclamationCircle, IconInfoCircle } from './icon';
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
        'bg-red-500 text-white rounded-md p-4 flex items-center w-full',
        className
      )}
    >
      <IconExclamationCircle className="w-6 h-6 mr-2" />
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
        'bg-blue-500 text-white p-4 rounded-md flex items-center w-full'
      )}
    >
      <IconInfoCircle className="w-6 h-6 mr-2" />
      {children}
    </div>
  );
};
