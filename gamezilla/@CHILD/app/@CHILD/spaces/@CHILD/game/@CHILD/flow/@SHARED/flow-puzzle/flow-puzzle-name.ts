import { adjectives, nouns } from "gamezilla/@CHILD/app/@SHARED/data/words";

const generate = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
};

export const FlowPuzzleName = {
  generate,
};
