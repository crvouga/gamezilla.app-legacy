const Info = ({ text }: { text: string }) => {
  return (
    <div class="flex w-full items-center justify-center text-xs text-secondary">
      {text}
    </div>
  );
};

export const FeedItem = {
  Info,
};
