import { Flow } from ".";
import { GroupId } from "./flow";
// source: https://tailwindcss.com/docs/customizing-colors
const COLOR_TO_HEX = {
    red: "#FE0500",
    orange: "#ea580c",
    amber: "#d97706",
    yellow: "#EBDF04",
    lime: "#84cc16",
    green: "#068C01",
    emerald: "#10b981",
    teal: "#2dd4bf",
    cyan: "#22d3ee",
    sky: "#38bdf8",
    blue: "#0D2AFE",
    indigo: "#4f46e5",
    violet: "#7c3aed",
    purple: "#9333ea",
    fuchsia: "#c026d3",
    pink: "#ec4899",
    rose: "#e11d48",
} as const;
export const GROUP_ID_TO_COLOR: {
    [groupId in GroupId]: Color;
} = {
    A: "red",
    B: "blue",
    C: "yellow",
    D: "green",
    E: "pink",
    F: "orange",
    G: "purple",
    H: "amber",
    I: "lime",
    J: "emerald",
    K: "teal",
    L: "cyan",
    M: "sky",
    N: "indigo",
    O: "violet",
    P: "fuchsia",
    Q: "rose",
};
const ALL_COLORS = Object.keys(COLOR_TO_HEX) as Color[];
const colorToHex = (color: Color): string => {
    return COLOR_TO_HEX[color];
};
export type Color = keyof typeof COLOR_TO_HEX;
const isColor = (value: string): value is Color => {
    return value in COLOR_TO_HEX;
};
const COLOR_TO_EMOJI: {
    [key in Color]: Emoji;
} = {
    blue: "🔵",
    violet: "🍇",
    red: "🔴",
    orange: "🟠",
    amber: "🚨",
    yellow: "🟡",
    lime: "🥝",
    green: "🟢",
    emerald: "❇️",
    teal: "🩱",
    cyan: "🌐",
    sky: "🏙",
    indigo: "🟪",
    purple: "🟣",
    pink: "🌸",
    rose: "🌹",
    fuchsia: "💜",
};
const colorToEmoji = (color: Color): Emoji => {
    return COLOR_TO_EMOJI[color];
};
export type Emoji = "🔵" // blue
 | "🍇" // violet
 | "🔴" // red
 | "🟠" // orange
 | "🚨" // amber
 | "🟡" // yellow
 | "🥝" // lime
 | "🟢" // green
 | "❇️" // emerald
 | "🩱" // teal
 | "🌐" // cyan
 | "🏙" // sky
 | "🟪" // indigo
 | "🟣" // purple
 | "🌸" // pink
 | "🌹" // rose
 | "💜"; // fuchsia
const EMOJI_TO_COLOR_MAP: {
    [key in Emoji]: Color;
} = {
    "🔵": "blue",
    "🍇": "violet",
    "🔴": "red",
    "🟠": "orange",
    "🚨": "amber",
    "🟡": "yellow",
    "🥝": "lime",
    "🟢": "green",
    "❇️": "emerald",
    "🩱": "teal",
    "🌐": "cyan",
    "🏙": "sky",
    "🟪": "indigo",
    "🟣": "purple",
    "🌸": "pink",
    "🌹": "rose",
    "💜": "fuchsia",
};
const ALL_EMOJI = Object.keys(EMOJI_TO_COLOR_MAP) as Emoji[];
const emojiToColor = (emoji: Emoji): Color => {
    return EMOJI_TO_COLOR_MAP[emoji];
};
export const isEmoji = (value: string): value is Emoji => {
    return value in EMOJI_TO_COLOR_MAP;
};
const emojiToHex = (emoji: Emoji): string => {
    return colorToHex(emojiToColor(emoji));
};
export const Emoji = {
    is: isEmoji,
    fromColor: colorToEmoji,
    all: ALL_EMOJI,
    toHex: emojiToHex,
};
export const Color = {
    is: isColor,
    fromEmoji: emojiToColor,
    all: ALL_COLORS,
    toHex: colorToHex,
    groupIdToColor: GROUP_ID_TO_COLOR,
    groupIdToHex: (groupId: GroupId): string => {
        return colorToHex(GROUP_ID_TO_COLOR[groupId]);
    },
};
export type FlowViewProps<TModel> = {
    disabled?: boolean;
    className?: string;
    model: TModel;
    isDragging?: boolean;
    autocompleteEdge?: (Flow.Edge & {
        groupId: Flow.GroupId;
    }) | null;
    showCoordinates?: boolean;
    onPressDown?: (nodeId: Flow.NodeId) => void;
    onPressUp?: (nodeId: Flow.NodeId) => void;
    onLeave?: () => void;
    onDraggedOver?: (nodeId: Flow.NodeId) => void;
    isActive?: ({ nodeId, groupId, }: {
        groupId: Flow.GroupId;
        nodeId: Flow.NodeId;
    }) => boolean;
};
