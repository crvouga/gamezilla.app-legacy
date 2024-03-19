const board = [
    ["b", "r", "r", "r", "o"],
    ["b", "r", "y", "y", "o"],
    ["b", "r", "y", "o", "o"],
    ["b", "r", "o", "o", "g"],
    ["b", "b", "g", "g", "g"],
] as const;
const letterToColor = (letter: "b" | "r" | "o" | "g" | "y"): string => {
    switch (letter) {
        case "b":
            return "blue";
        case "r":
            return "red";
        case "o":
            return "orange";
        case "g":
            return "green";
        case "y":
            return "yellow";
    }
};
export const CoverArt = (props: {
    className?: string;
}) => {
    return (<svg width="100%" viewBox="0 0 5 5" {...props}>
      <rect width="100%" height="100%" fill="black"/>
      {board.map((row, y) => row.map((letter, x) => {
            const fill = letterToColor(letter);
            const isNorth = board[y - 1]?.[x] === letter;
            const isSouth = board[y + 1]?.[x] === letter;
            const isEast = board[y]?.[x + 1] === letter;
            const isWest = board[y]?.[x - 1] === letter;
            const isEndpoint = [isNorth, isSouth, isEast, isWest].filter((flag) => flag).length ===
                1;
            return (<g key={`${x}-${y}-${fill}`} transform="translate(0.5, 0.5)" strokeWidth={0.3}>
              <circle cx={x} cy={y} r={isEndpoint ? 0.3 : 0.15} fill={fill}/>
              {isNorth && (<line x1={x} y1={y} x2={x} y2={y - 0.6} stroke={fill}/>)}
              {isSouth && (<line x1={x} y1={y} x2={x} y2={y + 0.6} stroke={fill}/>)}
              {isWest && (<line x1={x} y1={y} x2={x - 0.6} y2={y} stroke={fill}/>)}
              {isEast && (<line x1={x} y1={y} x2={x + 0.6} y2={y} stroke={fill}/>)}
            </g>);
        }))}
    </svg>);
};
