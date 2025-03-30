import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { HEIGHT, WIDTH } from "./consts";
import wallGridFragmentShader from "./shaders/wallGrid/wallGrid.frag";
import wallGridVertexShader from "./shaders/wallGrid/wallGrid.vert";

export const WallGridShaderMaterial = shaderMaterial(
  {
    uCellScale: 0.75,
    uDelta: 0.0,
    uDrawTexture: new THREE.Texture(),
    uWallWidth: WIDTH,
    uWallHeight: HEIGHT,
  },
  wallGridVertexShader,
  wallGridFragmentShader,
);
