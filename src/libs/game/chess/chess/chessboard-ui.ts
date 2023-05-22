/*


Chessboard UI

Objectives:
- Be as fast as possible
- Be framework agnostic

*/

export type Theme = {
  light: string;
  dark: string;
};

const defaultTheme: Theme = {
  light: "#f0d9b5",
  dark: "#b58863",
};

export const themes = {
  base: defaultTheme,
};

const toChecker = (x: number, y: number) => {
  if (x % 2 === 0 && y % 2 !== 0) {
    return "dark";
  }
  return "light";
};

const make = ({ theme = defaultTheme }: { theme?: Theme }) => {
  const currentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  const svg = document.createElement("svg");
  svg.setAttribute("viewBox", "0 0 8 8");
  svg.setAttribute("width", "100%");
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const rect = document.createElement("rect");
      rect.setAttribute("x", x.toString());
      rect.setAttribute("y", y.toString());
      rect.setAttribute("width", "1");
      rect.setAttribute("height", "1");
      rect.setAttribute("fill", theme[toChecker(x, y)]);
      rect.setAttribute("data-x", x.toString());
      rect.setAttribute("data-y", y.toString());
      svg.appendChild(rect);
    }
  }

  const setFEN = (_fen: string) => {
    // const matrixPrev = fenToMatrix(currentFen);
    // const matrixNew = fenToMatrix(fen);
    // console.log(fen, matrix);
  };

  const onDrop = (callback: (fen: string) => void) => {
    callback(currentFen);
    return () => {
      //
    };
  };

  const onGrab = (
    callback: (args: { fen: string }) => { allowed: boolean }
  ) => {
    callback({ fen: currentFen });
    return () => {
      //
    };
  };

  return {
    node: svg,
    setFEN,
    onDrop,
    onGrab,
  };
};

// type Square = {
//   color: string;
//   piece: string;
// };

// const fenToMatrix = (fen: string): Square[][] => {
//   const rows = fen.split(' ')?.[0]?.split('/');

//   const matrix: Square[][] = [];

//   for (let i = 0; i < 8; i++) {
//     const row: Square[] = [];
//     let colIndex = 0;
//     const count = rows?.[i]?.length ?? 0;
//     for (let j = 0; j < count; j++) {
//       const char = rows?.[i]?.[j];
//       if (!char) {
//         continue;
//       }

//       if (isNaN(parseInt(char))) {
//         row.push({
//           color: (colIndex + i) % 2 === 0 ? 'white' : 'black',
//           piece: char,
//         });
//         colIndex++;
//       } else {
//         colIndex += parseInt(char);
//       }
//     }

//     matrix.push(row);
//   }

//   return matrix;
// };

export const ChessboardUI = {
  make,
};
