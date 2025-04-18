import { shaderMaterial } from "@react-three/drei";
import { uniformDefaults } from "./consts";
import fragmentShader from "./shaders/mengerSponge/mengerSponge.frag";
import vertexShader from "./shaders/mengerSponge/mengerSponge.vert";

export const MengerSpongeShaderMaterial = shaderMaterial(
  uniformDefaults,
  vertexShader,
  fragmentShader,
);
