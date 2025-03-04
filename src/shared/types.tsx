export type ValidScene =
  | "gpu_flow_field_instanced_mesh"
  | "mesh_surface_game_of_life";

export interface ValidUrlSearchParams {
  scene: ValidScene;
}
