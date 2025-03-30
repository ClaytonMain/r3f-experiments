import { extend, useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { MutableRefObject, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { HEIGHT, WIDTH } from "./consts";
import { LightGridShaderMaterial } from "./LightGridShaderMaterial";
import gpgpuShader from "./shaders/gpgpu/gpgpu.glsl";

const uniformDefaults = {
  growDistance: 40,
  growSpeed: 0.9,
  growSpeedSpread: 0.2,
  fadeSpeed: 1.0,
  fadeSpeedSpread: 3.0,
};

const uniforms = {
  growDistance: uniformDefaults.growDistance,
  growSpeed: uniformDefaults.growSpeed,
  growSpeedSpread: uniformDefaults.growSpeedSpread,
  fadeSpeed: uniformDefaults.fadeSpeed,
  fadeSpeedSpread: uniformDefaults.fadeSpeedSpread,
};

export default function useGPGPU({
  drawPlaneRef,
}: {
  drawPlaneRef: MutableRefObject<THREE.Mesh>;
}) {
  extend({ LightGridShaderMaterial });

  useControls({
    growDistance: {
      value: uniformDefaults.growDistance,
      min: 1,
      max: 50,
      step: 1,
      onChange: (value) => {
        uniforms.growDistance = value;
      },
    },
    growSpeed: {
      value: uniformDefaults.growSpeed,
      min: 0,
      max: 5,
      step: 0.01,
      onChange: (value) => {
        uniforms.growSpeed = value;
      },
    },
    growSpeedSpread: {
      value: uniformDefaults.growSpeedSpread,
      min: 0,
      max: 5,
      step: 0.01,
      onChange: (value) => {
        uniforms.growSpeedSpread = value;
      },
    },
    fadeSpeed: {
      value: uniformDefaults.fadeSpeed,
      min: 0,
      max: 5,
      step: 0.01,
      onChange: (value) => {
        uniforms.fadeSpeed = value;
      },
    },
    fadeSpeedSpread: {
      value: uniformDefaults.fadeSpeedSpread,
      min: 0,
      max: 5,
      step: 0.01,
      onChange: (value) => {
        uniforms.fadeSpeedSpread = value;
      },
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
      drawTextureArray[i4 + 1] =
        Math.random() * uniformDefaults.fadeSpeed +
        uniformDefaults.fadeSpeedSpread;
      drawTextureArray[i4 + 2] =
        Math.random() * uniformDefaults.growSpeed +
        uniformDefaults.growSpeedSpread;
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
      0.0,
    );
    drawTextureVariable.material.uniforms.uGrowDistance = new THREE.Uniform(
      uniformDefaults.growDistance,
    );
    drawTextureVariable.material.uniforms.uGrowSpeed = new THREE.Uniform(
      uniformDefaults.growSpeed,
    );
    drawTextureVariable.material.uniforms.uGrowSpeedSpread = new THREE.Uniform(
      uniformDefaults.growSpeedSpread,
    );
    drawTextureVariable.material.uniforms.uFadeSpeed = new THREE.Uniform(
      uniformDefaults.fadeSpeed,
    );
    drawTextureVariable.material.uniforms.uFadeSpeedSpread = new THREE.Uniform(
      uniformDefaults.fadeSpeedSpread,
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
        gpgpu.drawTextureVariable.material.uniforms.uMouseVelocity.value =
          mousePositionRef.current.distanceTo(
            new THREE.Vector3(intersects[0].uv.x, intersects[0].uv.y, 0),
          );
        mousePositionRef.current.x = intersects[0].uv.x;
        mousePositionRef.current.y = intersects[0].uv.y;
      }
    }

    gpgpu.drawTextureVariable.material.uniforms.uDelta.value = uDelta;
    gpgpu.drawTextureVariable.material.uniforms.uGrowDistance.value =
      uniforms.growDistance;
    gpgpu.drawTextureVariable.material.uniforms.uGrowSpeed.value =
      uniforms.growSpeed;
    gpgpu.drawTextureVariable.material.uniforms.uGrowSpeedSpread.value =
      uniforms.growSpeedSpread;
    gpgpu.drawTextureVariable.material.uniforms.uFadeSpeed.value =
      uniforms.fadeSpeed;
    gpgpu.drawTextureVariable.material.uniforms.uFadeSpeedSpread.value =
      uniforms.fadeSpeedSpread;

    gpgpu.computation.compute();

    drawTextureRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.drawTextureVariable,
    ).texture;
  });

  return {
    drawTexture: drawTextureRef,
  };
}
