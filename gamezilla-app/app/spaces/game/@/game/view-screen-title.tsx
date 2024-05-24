import { cn } from "gamezilla-app/app/@/ui"

export const ViewScreenTitle = (input: { title: string, center?:boolean }) => {
    return (
        <div className={cn("w-full p-3", input.center && "text-center")}>
            <p className="text-3xl font-bold">{ input.title}</p>
        </div>
    )
}