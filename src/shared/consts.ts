import { ValidScene } from "./types";

export const DEFAULT_SCENE: ValidScene = "attractor";

export const SCENES: ValidScene[] = [
  "gpu_flow_field_instanced_mesh",
  "mesh_surface_game_of_life",
  "attractor",
  "polygonizer",
  "light_grid",
  "snow",
  "introduction_to_raymarching",
  "infinity_mirror",
];
