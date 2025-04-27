export const HEIGHT = 1024;
export const WIDTH = 1024;

export const NUM_AGENTS = 100000;

console.assert(
  NUM_AGENTS <= WIDTH * HEIGHT,
  "Number of agents must be less than or equal to the number of pixels",
);
