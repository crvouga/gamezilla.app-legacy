import { cn } from "gamezilla-app/app/@SHARED/ui"
import { VDom } from "gamezilla-app/@SHARED/vdom"

export const ViewGameHeader = ({
  title,
  renderCoverArt = renderDefaultCoverArt,
}: {
  title?: string | null
  renderCoverArt?: (props: { key: string; className: string }) => VDom
}) => {
  return (
    <section className="flex min-h-fit w-full">
      <div className="flex h-48 w-full flex-col items-center justify-center gap-4">
        <p
          className={cn(
            "text-center",
            typeof title === "string"
              ? "text-3xl font-bold"
              : "flex h-[36px] items-center justify-center font-bold text-neutral-300",
          )}
        >
          {title ?? "No game selected"}
        </p>

        {renderCoverArt({
          key: title ?? "PLACEHOLDER",
          className:
            "w-28 h-28 overflow-hidden rounded-lg border border-white/20",
        })}
      </div>
    </section>
  )
}

const renderDefaultCoverArt = (props: { key: string; className: string }) => {
  return (
    <div
      key={props.key}
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-neutral-800 p-4 text-neutral-300",
        props.className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 512"
        className="h-16 w-16"
        fill="currentColor"
        stroke="currentColor"
      >
        <path d="M192 64C86 64 0 150 0 256S86 448 192 448H448c106 0 192-86 192-192s-86-192-192-192H192zM496 168a40 40 0 1 1 0 80 40 40 0 1 1 0-80zM392 304a40 40 0 1 1 80 0 40 40 0 1 1 -80 0zM168 200c0-13.3 10.7-24 24-24s24 10.7 24 24v32h32c13.3 0 24 10.7 24 24s-10.7 24-24 24H216v32c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h32V200z" />
      </svg>
    </div>
  )
}
