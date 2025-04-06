import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { HEIGHT, WIDTH } from "./consts";
import lightGridFragmentShader from "./shaders/lightGrid/lightGrid.frag";
import lightGridVertexShader from "./shaders/lightGrid/lightGrid.vert";

export const LightGridShaderMaterial = shaderMaterial(
  {
    uCellScale: 0.75,
    uDelta: 0.0,
    uDrawTexture: new THREE.Texture(),
    uWallWidth: WIDTH,
    uWallHeight: HEIGHT,
  },
  lightGridVertexShader,
  lightGridFragmentShader,
);
