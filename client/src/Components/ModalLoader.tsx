import { Backdrop } from "./Backdrop";
import { Loader } from "./Loader";
import { Surface } from "./Surface";

export const ModalLoader = ({ title }: { title: string }) => {
  return (
    <Backdrop>
      <Surface className="flex items-center">
        <Loader className="mr-4" />
        <h1 className="text-lg font-medium">{title}</h1>
      </Surface>
    </Backdrop>
  );
};
