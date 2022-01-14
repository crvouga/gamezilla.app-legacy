import { Backdrop } from "./Backdrop";
import { Loader } from "./Loader";
import { Surface } from "./Surface";

export const BackdropLoaderTitle = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <h1 className="text-lg font-medium">{children}</h1>;
};

export const BackdropLoader = ({ children }: { children: React.ReactNode }) => {
  return (
    <Backdrop>
      <Surface className="flex items-center">
        <Loader className="mr-4" />
        {children}
      </Surface>
    </Backdrop>
  );
};
