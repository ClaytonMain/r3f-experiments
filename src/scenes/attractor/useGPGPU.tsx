import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import {
  ATTRACTOR_CONFIGS,
  defaultNumberOfParticles,
  textureWidth,
} from "./consts";
import attractorPositionGPGPUShader from "./shaders/gpgpu/attractorPosition.glsl";
import attractorVelocityGPGPUShader from "./shaders/gpgpu/attractorVelocity.glsl";
import { AttractorName } from "./types";

export default function useGPGPU({
  attractorName,
}: {
  attractorName: AttractorName;
}) {
  const gl = useThree((state) => state.gl);
  const { uAttractorId, uSystemCenter, uSystemScale, deltaScale } =
    ATTRACTOR_CONFIGS[attractorName];

  const texturePositionRef = useRef<THREE.Texture>();
  const textureVelocityRef = useRef<THREE.Texture>();

  const gpgpu = useMemo(() => {
    const computation = new GPUComputationRenderer(
      textureWidth,
      textureWidth,
      gl,
    );

    const texturePosition = computation.createTexture();
    const textureVelocity = computation.createTexture();

    const positionArray = texturePosition.image.data as Float32Array;
    const velocityArray = textureVelocity.image.data as Float32Array;

    for (let i = 0; i < defaultNumberOfParticles; i++) {
      const i4 = i * 4;

      const r = Math.random() * 0.5;
      const phi = (Math.random() - 0.5) * Math.PI;
      const theta = Math.random() * Math.PI * 2;

      positionArray[i4 + 0] = r * Math.cos(theta) * Math.cos(phi);
      positionArray[i4 + 1] = r * Math.sin(phi);
      positionArray[i4 + 2] = r * Math.sin(theta) * Math.cos(phi);
      positionArray[i4 + 3] = Math.random();

      velocityArray[i4 + 0] = 0;
      velocityArray[i4 + 1] = 0;
      velocityArray[i4 + 2] = 0;
      velocityArray[i4 + 3] = 0;
    }

    // I don't expect to use this.
    // const textureDefaultPosition = texturePosition.clone();

    const positionVariable = computation.addVariable(
      "texturePosition",
      attractorPositionGPGPUShader,
      texturePosition,
    );
    const velocityVariable = computation.addVariable(
      "textureVelocity",
      attractorVelocityGPGPUShader,
      textureVelocity,
    );

    computation.setVariableDependencies(positionVariable, [
      positionVariable,
      velocityVariable,
    ]);
    computation.setVariableDependencies(velocityVariable, [
      positionVariable,
      velocityVariable,
    ]);

    texturePositionRef.current = texturePosition;
    textureVelocityRef.current = textureVelocity;

    positionVariable.material.uniforms.uTime = { value: 0 };
    positionVariable.material.uniforms.uDelta = { value: 0 };
    positionVariable.material.uniforms.uAttractorId = { value: uAttractorId };
    positionVariable.material.uniforms.uSystemCenter = {
      value: uSystemCenter,
    };
    positionVariable.material.uniforms.uSystemScale = { value: uSystemScale };

    velocityVariable.material.uniforms.uTime = { value: 0 };
    velocityVariable.material.uniforms.uDelta = { value: 0 };
    velocityVariable.material.uniforms.uAttractorId = { value: uAttractorId };
    velocityVariable.material.uniforms.uSystemCenter = {
      value: uSystemCenter,
    };
    velocityVariable.material.uniforms.uSystemScale = { value: uSystemScale };
    velocityVariable.material.uniforms.uFlowFieldScale = { value: 0.01 };
    velocityVariable.material.uniforms.uMinVelocity = { value: 0.001 };

    return {
      computation,
      positionVariable,
      velocityVariable,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

  useLayoutEffect(() => {
    const error = gpgpu.computation.init();
    if (error !== null) {
      console.error(error);
    }
  });

  const uTimeRef = useRef(0);

  useFrame((_, delta) => {
    uTimeRef.current += Math.min(delta, 0.05);
    const uDelta = Math.min(delta, 0.05) * deltaScale;

    gpgpu.positionVariable.material.uniforms.uTime.value = uTimeRef.current;
    gpgpu.positionVariable.material.uniforms.uDelta.value = uDelta;

    gpgpu.velocityVariable.material.uniforms.uTime.value = uTimeRef.current;
    gpgpu.velocityVariable.material.uniforms.uDelta.value = uDelta;

    gpgpu.computation.compute();

    texturePositionRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.positionVariable,
    ).texture;
    textureVelocityRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.velocityVariable,
    ).texture;

    // console.log(
    //   gpgpu.computation.getCurrentRenderTarget(gpgpu.positionVariable).texture,
    // );
  });

  return {
    texturePosition: texturePositionRef,
    textureVelocity: textureVelocityRef,
  };
}
