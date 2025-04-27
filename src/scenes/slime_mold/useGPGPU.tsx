import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { HEIGHT, NUM_AGENTS, WIDTH } from "./consts";
import agentDataShader from "./shaders/gpgpu/agentData.glsl";
import trailDataShader from "./shaders/gpgpu/trailData.glsl";

// const agentUniforms = {};

// const trailUniforms = {};

export default function useGPGPU() {
  const gl = useThree((state) => state.gl);

  const agentDataTextureRef = useRef<THREE.Texture>(null!);
  const trailDataTextureRef = useRef<THREE.Texture>(null!);

  const gpgpu = useMemo(() => {
    const computation = new GPUComputationRenderer(WIDTH, HEIGHT, gl);

    /**
     * Just need position & angle; don't need an entire vector for direction.
     * Don't try to fullscreen it for now, just have an orbitcontrols type
     * setup that we've used in the intro to raymarching and portal scenes.
     * So you can fix the plane to a specific size & not worry about people
     * resizing the window. Oh, yeah, just like in the light grid scene.
     */

    const agentDataTexture = computation.createTexture();
    const trailDataTexture = computation.createTexture();

    const agentDataArray = agentDataTexture.image.data as Float32Array;
    const trailDataArray = trailDataTexture.image.data as Float32Array;

    const usedPoints = new Set<number>();

    for (let i = 0; i < NUM_AGENTS; i++) {
      const i4 = i * 4;

      const theta = Math.random() * Math.PI * 2;

      while (usedPoints.size < i) {
        const x = Math.floor(Math.random() * WIDTH);
        const y = Math.floor(Math.random() * HEIGHT);
        const i2 = y * WIDTH + x;
        if (!usedPoints.has(i2)) {
          agentDataArray[i4 + 0] = x / WIDTH;
          agentDataArray[i4 + 1] = y / HEIGHT;
          agentDataArray[i4 + 2] = theta;
          agentDataArray[i4 + 3] = 0.0;

          usedPoints.add(i2);
          // break;
        }
      }
      trailDataArray[i4 + 0] = 0.0;
      trailDataArray[i4 + 1] = 0.0;
      trailDataArray[i4 + 2] = 0.0;
      trailDataArray[i4 + 3] = 0.0;
    }

    const agentDataTextureVariable = computation.addVariable(
      "agentData",
      agentDataShader,
      agentDataTexture,
    );
    const trailDataTextureVariable = computation.addVariable(
      "trailData",
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
