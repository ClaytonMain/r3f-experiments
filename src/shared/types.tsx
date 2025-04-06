export type ValidScene =
  | "gpu_flow_field_instanced_mesh"
  | "mesh_surface_game_of_life"
  | "attractor"
  | "polygonizer"
  | "light_grid"
  | "snow";

export interface ValidUrlSearchParams {
  scene: ValidScene;
}
