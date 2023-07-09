import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Chessboard, CustomSquareStyles } from "react-chessboard";
import {
  chessTsMoveToMove,
  createInstance,
  MoveInput,
  Square,
  fromLowercase,
  toLowercaseSquare,
} from "../../chess";
import { BoardProps, theme } from "./chessboard.shared";

export const ChessboardReact = ({
  boardOrientation,
  model,
  onPieceDrop,
  isDraggablePiece,
  customSquareStyles: customSquareStylesProps,
  arrows,
}: BoardProps) => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(0);

  const handler = () => {
    if (ref.current) {
      setBoardWidth(ref.current?.offsetWidth);
    }
  };

  useLayoutEffect(() => {
    handler();
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  const instanceRef = useRef(createInstance(model));
  const [legalMoves, setLegalMoves] = useState<MoveInput[]>([]);
  const [hoveredSquare, setHoveredSquare] = useState<Square | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  const refreshLegalMoves = useCallback(() => {
    const legalMovesNext: MoveInput[] = [];

    for (const chessTsMove of instanceRef.current.moves({ verbose: true })) {
      const move = chessTsMoveToMove(chessTsMove)[0];
      if (move && move.from === selectedSquare) {
        legalMovesNext.push(move);
      }
    }

    setLegalMoves(legalMovesNext);
  }, [setLegalMoves, selectedSquare]);

  useEffect(() => {
    refreshLegalMoves();
  }, [selectedSquare, refreshLegalMoves]);

  useEffect(() => {
    instanceRef.current.load(model.fen);
    refreshLegalMoves();
  }, [model.fen, refreshLegalMoves]);

  const lastMoveStyles: CustomSquareStyles = model.previousMove
    ? {
        [toLowercaseSquare(model.previousMove.to)]: {
          background: "rgba(255, 255, 0, 0.4)",
        },

        [toLowercaseSquare(model.previousMove.from)]: {
          background: "rgba(255, 255, 0, 0.4)",
        },
      }
    : {};

  const game = instanceRef.current;

  const legalMovesStyles = legalMoves.reduce<CustomSquareStyles>(
    (styles, move) => ({
      ...styles,
      [toLowercaseSquare(move.to)]:
        game.get(toLowercaseSquare(move.to)) &&
        selectedSquare &&
        game.get(toLowercaseSquare(move.to))?.color !==
          game.get(toLowercaseSquare(selectedSquare))?.color
          ? {
              background:
                "radial-gradient(circle, rgba(0,0,0,.2) 85%, transparent 85%)",
              borderRadius: "50%",
              cursor: "pointer",
            }
          : {
              background:
                "radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)",
              borderRadius: "50%",
              cursor: "pointer",
            },
    }),
    selectedSquare
      ? {
          [toLowercaseSquare(selectedSquare)]: {
            background: "rgba(255, 255, 0, 0.4)",
          },
        }
      : {}
  );

  useEffect(() => {
    setHoveredSquare(null);
    setSelectedSquare(null);
  }, [model.fen]);

  const customArrows = useMemo(() => {
    return (
      arrows?.map((arrow) => [
        toLowercaseSquare(arrow.from),
        toLowercaseSquare(arrow.to),
      ]) ?? []
    );
  }, [arrows]);

  return (
    <div style={{ position: "relative", width: "100%" }} ref={ref}>
      <Chessboard
        ref={boardRef}
        showBoardNotation
        snapToCursor
        boardOrientation={boardOrientation === "w" ? "white" : "black"}
        position={model.fen}
        boardWidth={boardWidth}
        arePremovesAllowed={false}
        customArrows={customArrows}
        customDarkSquareStyle={{
          backgroundColor: theme.dark,
        }}
        customLightSquareStyle={{
          backgroundColor: theme.light,
        }}
        onMouseOverSquare={(square) => {
          setHoveredSquare(fromLowercase(square));
        }}
        onPieceDragBegin={(_piece, sourceSquare) => {
          setSelectedSquare(fromLowercase(sourceSquare));
        }}
        onPieceClick={() => {
          setSelectedSquare(hoveredSquare);
        }}
        customSquareStyles={{
          ...lastMoveStyles,
          ...legalMovesStyles,
          ...customSquareStylesProps,
        }}
        isDraggablePiece={
          isDraggablePiece
            ? ({ piece }) => {
                return isDraggablePiece({ piece });
              }
            : undefined
        }
        onPieceDrop={
          onPieceDrop
            ? (from, to) => {
                const moveInput: MoveInput = {
                  from: fromLowercase(from),
                  to: fromLowercase(to),
                  promotion: "q",
                };

                return onPieceDrop(moveInput);
              }
            : undefined
        }
      />
    </div>
  );
};
