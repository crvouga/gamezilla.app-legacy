import { Column } from './connect-four';

export const create = (root: HTMLElement) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  for (let i = 0; i < 6; i++) {
    const row = document.createElement('div');
    row.classList.add('row');
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      row.appendChild(cell);
    }
    root.appendChild(row);
  }

  root.appendChild(svg);

  const setColumns = (columns: Column) => {
    console.log(columns);
  };

  return {
    root,
    setColumns,
  };
};

export const initDefs = () => {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const linearGradient = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'linearGradient'
  );
  linearGradient.setAttribute('id', 'gradient');
  linearGradient.setAttribute('x1', '0%');
  linearGradient.setAttribute('y1', '0%');
  linearGradient.setAttribute('x2', '0%');
  linearGradient.setAttribute('y2', '100%');
  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', '#f00');
  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', '#f00');
  linearGradient.appendChild(stop1);
  linearGradient.appendChild(stop2);
  defs.appendChild(linearGradient);
  return defs;
};
