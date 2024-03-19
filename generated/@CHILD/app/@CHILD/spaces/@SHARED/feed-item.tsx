const Info = ({ text }: {
    text: string;
}) => {
    return (<div className="flex w-full items-center justify-center text-xs text-neutral-300">
      {text}
    </div>);
};
export const FeedItem = {
    Info,
};
