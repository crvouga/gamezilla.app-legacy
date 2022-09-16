import * as UI from "../../UI"

export const ViewActionButton = ({
    title,
    icon,
    onClick,
}: {
    title: string
    icon: UI.ViewNode
    onClick: () => void
}) => {
    const theme = UI.useTheme()
    return (
        <UI.ButtonBase
            onClick={onClick}
            sx={{
                flex: 1,
                height: 48,
                display: "flex",
                flexDirection: "column",
                color: theme.palette.action.active,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {icon}
            <UI.Typography variant="caption">{title}</UI.Typography>
        </UI.ButtonBase>
    )
}