import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import {
  defaultMaxSteps,
  defaultRandomizationDensity,
  defaultStepDuration,
  radialSegments,
  textureWidth,
  tubularSegments,
} from "./consts";
import gameOfLifeGPGPUShader from "./shaders/gpgpu/gameOfLife.glsl";

export default function useGPGPU() {
  const gl = useThree((state) => state.gl);

  const textureGameStateRef = useRef<THREE.Texture>(null);

  const gpgpu = useMemo(() => {
    const computation = new GPUComputationRenderer(
      textureWidth,
      textureWidth,
      gl,
    );
    const textureGameState = computation.createTexture();
    const gameStateArray = textureGameState.image.data as Float32Array;
    for (let i = 0; i < radialSegments * tubularSegments; i++) {
      const i4 = i * 4;
      gameStateArray[i4 + 0] =
        Math.random() > defaultRandomizationDensity ? 0 : 1;
      gameStateArray[i4 + 1] = 0;
      gameStateArray[i4 + 2] = 0;
      gameStateArray[i4 + 3] = i / (radialSegments * tubularSegments);
    }

    const gameStateVariable = computation.addVariable(
      "gameState",
      gameOfLifeGPGPUShader,
      textureGameState,
    );

    computation.setVariableDependencies(gameStateVariable, [gameStateVariable]);

    textureGameStateRef.current = textureGameState;

    gameStateVariable.material.uniforms.uDelta = { value: 0.0 };
    gameStateVariable.material.uniforms.uRadialSegments = {
      value: radialSegments,
    };
    gameStateVariable.material.uniforms.uTubularSegments = {
      value: tubularSegments,
    };
    gameStateVariable.material.uniforms.uStepDuration = {
      value: defaultStepDuration,
    };
    gameStateVariable.material.uniforms.uMaxSteps = { value: defaultMaxSteps };
    gameStateVariable.material.uniforms.uRandomSeed = {
      value: new THREE.Vector2(Math.random(), Math.random()),
    };
    gameStateVariable.material.uniforms.uRandomizationDensity = {
      value: defaultRandomizationDensity,
    };

    return {
      computation,
      gameStateVariable,
    };
  }, [gl]);

  useLayoutEffect(() => {
    const error = gpgpu.computation.init();
    if (error !== null) {
      console.error(error);
    }
  });

  useFrame((_, delta) => {
    gpgpu.gameStateVariable.material.uniforms.uDelta.value = delta;
    gpgpu.gameStateVariable.material.uniforms.uRandomSeed.value.set(
      Math.random(),
      Math.random(),
    );
    gpgpu.computation.compute();

    textureGameStateRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.gameStateVariable,
    ).texture;
  });

  return {
    textureGameState: textureGameStateRef,
  };
}
