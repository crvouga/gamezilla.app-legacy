import { Profile } from "gamezilla/@CHILD/app/@SHARED/data";
import { Avatar } from "gamezilla/@CHILD/app/@SHARED/ui";

export const ViewProfileCard = ({
  profile,
  subtitle,
}: {
  profile?: Profile | null;
  subtitle?: string;
}) => {
  return (
    <div className="flex w-full items-center gap-2 p-2">
      <Avatar className="h-12 w-12" src={profile?.avatarUrl} />
      <div className="flex flex-1 flex-col">
        <p>{profile?.username ?? "..."}</p>

        {typeof subtitle === 'string' && (
          <p className="text-sm text-secondary">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
