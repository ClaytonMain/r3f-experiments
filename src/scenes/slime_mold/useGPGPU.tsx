import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { AGENT_DENSITY, HEIGHT, WIDTH } from "./consts";
import agentDataShader from "./shaders/gpgpu/agentData.glsl";
import trailDataShader from "./shaders/gpgpu/trailData.glsl";

// const agentUniforms = {};

// const trailUniforms = {};

export default function useGPGPU() {
  const gl = useThree((state) => state.gl);

  const agentDataTextureRef = useRef<THREE.Texture>(null!);
  const trailDataTextureRef = useRef<THREE.Texture>(null!);

  const gpgpu = useMemo(() => {
    console.log("memoizing");
    const computation = new GPUComputationRenderer(WIDTH, HEIGHT, gl);

    const agentDataTexture = computation.createTexture();
    const trailDataTexture = computation.createTexture();

    const agentDataArray = agentDataTexture.image.data as Float32Array;
    const trailDataArray = trailDataTexture.image.data as Float32Array;

    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      const i4 = i * 4;

      agentDataArray[i4 + 0] = 0.0;
      agentDataArray[i4 + 1] = 0.0;
      agentDataArray[i4 + 2] = 0.0;
      agentDataArray[i4 + 3] = 1.0;

      trailDataArray[i4 + 0] = 0.0;
      trailDataArray[i4 + 1] = 0.0;
      trailDataArray[i4 + 2] = 0.0;
      trailDataArray[i4 + 3] = 1.0;

      if (Math.random() < AGENT_DENSITY) {
        agentDataArray[i4 + 0] = 1.0;
        agentDataArray[i4 + 1] = Math.random();

        trailDataArray[i4 + 0] = 1.0;
      }
    }

    const agentDataTextureVariable = computation.addVariable(
      "agentDataTexture",
      agentDataShader,
      agentDataTexture,
    );
    const trailDataTextureVariable = computation.addVariable(
      "trailDataTexture",
      trailDataShader,
      trailDataTexture,
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

    agentDataTextureVariable.material.uniforms.uTime = { value: 0.0 };
    agentDataTextureVariable.material.uniforms.uDelta = { value: 0.0 };

    trailDataTextureVariable.material.uniforms.uTime = {
      value: 0.0,
    };
    trailDataTextureVariable.material.uniforms.uDelta = {
      value: 0.0,
    };

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
