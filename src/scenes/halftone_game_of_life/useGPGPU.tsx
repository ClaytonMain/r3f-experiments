import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import gpgpuShader from "./shaders/gpgpu/gpgpu.glsl";
import { GameVariables } from "./types";

export default function useGPGPU(gameVariables: GameVariables) {
  const gl = useThree((state) => state.gl);

  const gameStateTextureRef = useRef<THREE.Texture>(null!);

  const gpgpu = useMemo(() => {
    const computation = new GPUComputationRenderer(
      gameVariables.gameTextureSize,
      gameVariables.gameTextureSize,
      gl,
    );

    const gameStateTexture = computation.createTexture();

    const gameStateArray = gameStateTexture.image.data as Float32Array;
    for (
      let i = 0;
      i < gameVariables.gameTextureSize * gameVariables.gameTextureSize;
      i++
    ) {
      const i4 = i * 4;
      gameStateArray[i4 + 0] =
        Math.random() > gameVariables.lifeProbability ? 0 : 1; // alive or dead
      gameStateArray[i4 + 1] = 0; // unused
      gameStateArray[i4 + 2] = 0; // unused
      gameStateArray[i4 + 3] = 1; // unused
    }

    const gameStateVariable = computation.addVariable(
      "uGameState",
      gpgpuShader,
      gameStateTexture,
    );

    computation.setVariableDependencies(gameStateVariable, [gameStateVariable]);

    gameStateTextureRef.current = gameStateTexture;

    gameStateVariable.material.uniforms.uWrapMode = new THREE.Uniform(
      gameVariables.wrapMode,
    );

    return {
      computation,
      gameStateVariable,
    };
  }, [
    gl,
    gameVariables.gameTextureSize,
    gameVariables.lifeProbability,
    gameVariables.wrapMode,
  ]);

  useLayoutEffect(() => {
    const error = gpgpu.computation.init();
    if (error !== error) {
      console.error("GPUComputationRenderer initialization error:", error);
    }
  });

  const frameDurationRef = useRef(0);
  useFrame((_, delta) => {
    frameDurationRef.current += Math.min(delta, 0.1) * gameVariables.gameSpeed;
    if (frameDurationRef.current < 1) return;
    frameDurationRef.current = 0;

    // Set uniforms here, if any are needed.

    gpgpu.computation.compute();

    gameStateTextureRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.gameStateVariable,
    ).texture;
  });

  return {
    gameStateTextureRef: gameStateTextureRef,
  };
}
