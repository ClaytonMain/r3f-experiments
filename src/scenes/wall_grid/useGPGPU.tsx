import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { MutableRefObject, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { HEIGHT, WIDTH } from "./consts";
import gpgpuShader from "./shaders/gpgpu/gpgpu.glsl";

export default function useGPGPU({
  drawPlaneRef,
}: {
  drawPlaneRef: MutableRefObject<THREE.Mesh>;
}) {
  const {
    growDistance,
    growSpeed,
    growSpeedSpread,
    fadeSpeed,
    fadeSpeedSpread,
  } = useControls({
    growDistance: {
      value: 10,
      min: 1,
      max: 50,
      step: 1,
    },
    growSpeed: {
      value: 0.9,
      min: 0,
      max: 5,
      step: 0.01,
    },
    growSpeedSpread: {
      value: 0.2,
      min: 0,
      max: 5,
      step: 0.01,
    },
    fadeSpeed: {
      value: 0.2,
      min: 0,
      max: 5,
      step: 0.01,
    },
    fadeSpeedSpread: {
      value: 0.8,
      min: 0,
      max: 5,
      step: 0.01,
    },
  });
  const gl = useThree((state) => state.gl);

  const drawTextureRef = useRef<THREE.Texture>();

  const gpgpu = useMemo(() => {
    const computation = new GPUComputationRenderer(WIDTH, HEIGHT, gl);
    const drawTexture = computation.createTexture();
    const drawTextureArray = drawTexture.image.data as Float32Array;

    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      const i4 = i * 4;
      drawTextureArray[i4 + 0] = 0.0;
      drawTextureArray[i4 + 1] = Math.random() * fadeSpeed + fadeSpeedSpread;
      drawTextureArray[i4 + 2] = Math.random() * growSpeed + growSpeedSpread;
      drawTextureArray[i4 + 3] = 0.0;
    }

    const drawTextureVariable = computation.addVariable(
      "drawTexture",
      gpgpuShader,
      drawTexture,
    );

    computation.setVariableDependencies(drawTextureVariable, [
      drawTextureVariable,
    ]);

    drawTextureRef.current = drawTexture;

    drawTextureVariable.material.uniforms.uDelta = new THREE.Uniform(0.0);
    drawTextureVariable.material.uniforms.uMousePosition = new THREE.Uniform(
      new THREE.Vector3(),
    );
    drawTextureVariable.material.uniforms.uMouseVelocity = new THREE.Uniform(
      new THREE.Vector3(),
    );
    drawTextureVariable.material.uniforms.uGrowDistance = new THREE.Uniform(
      growDistance,
    );
    drawTextureVariable.material.uniforms.uGrowSpeed = new THREE.Uniform(
      growSpeed,
    );
    drawTextureVariable.material.uniforms.uGrowSpeedSpread = new THREE.Uniform(
      growSpeedSpread,
    );
    drawTextureVariable.material.uniforms.uFadeSpeed = new THREE.Uniform(
      fadeSpeed,
    );
    drawTextureVariable.material.uniforms.uFadeSpeedSpread = new THREE.Uniform(
      fadeSpeedSpread,
    );

    return {
      computation,
      drawTextureVariable,
    };
  }, [gl]);

  useLayoutEffect(() => {
    const error = gpgpu.computation.init();
    if (error !== null) {
      console.error(error);
    }
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const mousePositionRef = useRef(new THREE.Vector3());

  useFrame(({ pointer, camera }, delta) => {
    const uDelta = Math.min(delta, 0.1);

    mouse.lerp(pointer, 0.1);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(drawPlaneRef.current);

    if (intersects.length > 0) {
      gpgpu.drawTextureVariable.material.uniforms.uMousePosition.value.copy(
        intersects[0].uv,
      );
      if (intersects[0].uv) {
        gpgpu.drawTextureVariable.material.uniforms.uMouseVelocity.value.copy(
          intersects[0].uv.clone().sub(mousePositionRef.current),
        );
        mousePositionRef.current.x = intersects[0].uv.x;
        mousePositionRef.current.y = intersects[0].uv.y;
      }
    }

    gpgpu.drawTextureVariable.material.uniforms.uDelta.value = uDelta;
    gpgpu.drawTextureVariable.material.uniforms.uGrowDistance.value =
      growDistance;
    gpgpu.drawTextureVariable.material.uniforms.uGrowSpeed.value = growSpeed;
    gpgpu.drawTextureVariable.material.uniforms.uGrowSpeedSpread.value =
      growSpeedSpread;
    gpgpu.drawTextureVariable.material.uniforms.uFadeSpeed.value = fadeSpeed;
    gpgpu.drawTextureVariable.material.uniforms.uFadeSpeedSpread.value =
      fadeSpeedSpread;

    gpgpu.computation.compute();

    drawTextureRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.drawTextureVariable,
    ).texture;
  });

  return {
    drawTexture: drawTextureRef,
  };
}
