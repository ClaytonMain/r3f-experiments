import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "./GPUComputationRenderer.js";
import { HEIGHT, NUMBER_OF_AGENTS, WIDTH } from "./consts";
import agentDataShader from "./shaders/gpgpu/agentData.glsl";
import trailDataFragmentShader from "./shaders/gpgpu/trailData.frag";
import trailDataVertexShader from "./shaders/gpgpu/trailData.vert";

const agentUniforms = {
  uSensorAngle: new THREE.Uniform(Math.PI / 4),
  uRotationAngle: new THREE.Uniform(Math.PI / 8),
  uSensorOffset: new THREE.Uniform(9.0),
  uSensorWidth: new THREE.Uniform(1.0),
  uStepSize: new THREE.Uniform(1.0),
  uDepositPerStep: new THREE.Uniform(0.05),
};

// const trailUniforms = {};

export default function useGPGPU() {
  const gl = useThree((state) => state.gl);

  const agentDataTextureRef = useRef<THREE.Texture>(null!);
  const trailDataTextureRef = useRef<THREE.Texture>(null!);

  const gpgpu = useMemo(() => {
    const computation = new GPUComputationRenderer(WIDTH, HEIGHT, gl);

    const agentDataTexture = computation.createTexture();
    const trailDataTexture = computation.createTexture();

    const agentDataArray = agentDataTexture.image.data as Float32Array;
    const trailDataArray = trailDataTexture.image.data as Float32Array;

    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      const i4 = i * 4;
      trailDataArray[i4 + 0] = 0.0;
      trailDataArray[i4 + 1] = 0.0;
      trailDataArray[i4 + 2] = 0.0;
      trailDataArray[i4 + 3] = 1.0;
    }

    const usedIndices = new Set<number>();

    for (let i = 0; i < NUMBER_OF_AGENTS; i++) {
      let x;
      let y;
      let index;
      while (true) {
        x = Math.floor(Math.random() * WIDTH);
        y = Math.floor(Math.random() * HEIGHT);
        index = y * WIDTH + x;

        if (!usedIndices.has(index)) {
          usedIndices.add(index);
          break;
        }
      }
      const i4 = i * 4;
      const trailDataIndex = index * 4;

      agentDataArray[i4 + 0] = x / WIDTH;
      agentDataArray[i4 + 1] = y / HEIGHT;
      agentDataArray[i4 + 2] = Math.random();
      agentDataArray[i4 + 3] = 1.0;

      trailDataArray[trailDataIndex + 0] = 1.0;
    }

    const agentDataTextureVariable = computation.addVariable(
      "agentDataTexture",
      agentDataShader,
      agentDataTexture,
    );
    const trailDataTextureVariable = computation.addVariable(
      "trailDataTexture",
      trailDataFragmentShader,
      trailDataTexture,
      trailDataVertexShader,
    );

    computation.setVariableDependencies(agentDataTextureVariable, [
      agentDataTextureVariable,
      trailDataTextureVariable,
    ]);
    computation.setVariableDependencies(trailDataTextureVariable, [
      agentDataTextureVariable,
      trailDataTextureVariable,
    ]);

    agentDataTextureRef.current = agentDataTexture;
    trailDataTextureRef.current = trailDataTexture;

    agentDataTextureVariable.material.uniforms.uTime = new THREE.Uniform(0.0);
    agentDataTextureVariable.material.uniforms.uDelta = new THREE.Uniform(0.0);
    agentDataTextureVariable.material.uniforms.uResolution = new THREE.Uniform(
      new THREE.Vector2(WIDTH, HEIGHT),
    );
    agentDataTextureVariable.material.uniforms.uNumberOfAgents =
      new THREE.Uniform(NUMBER_OF_AGENTS);
    agentDataTextureVariable.material.uniforms.uSensorAngle =
      agentUniforms.uSensorAngle;
    agentDataTextureVariable.material.uniforms.uRotationAngle =
      agentUniforms.uRotationAngle;
    agentDataTextureVariable.material.uniforms.uSensorOffset =
      agentUniforms.uSensorOffset;
    agentDataTextureVariable.material.uniforms.uSensorWidth =
      agentUniforms.uSensorWidth;
    agentDataTextureVariable.material.uniforms.uStepSize =
      agentUniforms.uStepSize;
    agentDataTextureVariable.material.uniforms.uDepositPerStep =
      agentUniforms.uDepositPerStep;

    trailDataTextureVariable.material.uniforms.uTime = new THREE.Uniform(0.0);
    trailDataTextureVariable.material.uniforms.uDelta = new THREE.Uniform(0.0);
    trailDataTextureVariable.material.uniforms.uResolution = new THREE.Uniform(
      new THREE.Vector2(WIDTH, HEIGHT),
    );

    return {
      computation,
      agentDataTextureVariable,
      trailDataTextureVariable,
    };
  }, [gl]);

  useLayoutEffect(() => {
    const error = gpgpu.computation.init();
    if (error !== null) {
      console.error(error);
    }
  });

  const uTimeRef = useRef(0);

  useFrame((_, delta) => {
    const uDelta = Math.min(delta, 0.1);

    uTimeRef.current += delta;

    gpgpu.agentDataTextureVariable.material.uniforms.uTime.value =
      uTimeRef.current;
    gpgpu.agentDataTextureVariable.material.uniforms.uDelta.value = uDelta;

    gpgpu.trailDataTextureVariable.material.uniforms.uTime.value =
      uTimeRef.current;
    gpgpu.trailDataTextureVariable.material.uniforms.uDelta.value = uDelta;

    gpgpu.computation.compute();

    agentDataTextureRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.agentDataTextureVariable,
    ).texture;
    trailDataTextureRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.trailDataTextureVariable,
    ).texture;
  });

  return {
    agentDataTexture: agentDataTextureRef,
    trailDataTexture: trailDataTextureRef,
  };
}
