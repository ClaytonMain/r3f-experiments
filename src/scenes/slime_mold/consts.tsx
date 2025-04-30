export const WIDTH = 1920;
export const HEIGHT = 1024;

export const NUMBER_OF_AGENTS = 100000;

console.assert(
  NUMBER_OF_AGENTS < WIDTH * HEIGHT,
  "Number of agents must be less than the number of pixels in the texture.",
);
