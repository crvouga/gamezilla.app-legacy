import { Backdrop } from "./Backdrop";
import { Loader } from "./Loader";
import { Surface } from "./Surface";

export const ModalLoader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => {
  return (
    <Backdrop>
      <Surface className="flex items-center">
        <Loader className="mr-4" />
        <div>
          <h1 className="text-lg font-medium">{title}</h1>
          {subtitle && <h2 className="text-sm text-gray-400">{subtitle}</h2>}
        </div>
      </Surface>
    </Backdrop>
  );
};
