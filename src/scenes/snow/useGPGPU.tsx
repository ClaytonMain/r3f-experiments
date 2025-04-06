import { useFrame, useThree } from "@react-three/fiber";
import { RapierCollider, RapierRigidBody } from "@react-three/rapier";
import { useControls } from "leva";
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { HEIGHT, WIDTH } from "./consts";
import gpgpuShader from "./shaders/gpgpu/gpgpu.glsl";

const uniformDefaults = {
  uIntersectUv: new THREE.Vector2(9999, 9999),
  uIntersectDepth: 0,
  uPlaneSize: new THREE.Vector2(WIDTH, HEIGHT),
  uPlaneScale: 0.2,
  uBallRadius: 1,
  uSnowHeight: 1,
  uRegrowDelay: 8,
  uRegrowSpeed: 0.5,
};

const uniforms = {
  intersectUv: uniformDefaults.uIntersectUv,
  intersectDepth: uniformDefaults.uIntersectDepth,
  planeSize: uniformDefaults.uPlaneSize,
  planeScale: uniformDefaults.uPlaneScale,
  ballRadius: uniformDefaults.uBallRadius,
  snowHeight: uniformDefaults.uSnowHeight,
  regrowDelay: uniformDefaults.uRegrowDelay,
  regrowSpeed: uniformDefaults.uRegrowSpeed,
};

export default function useGPGPU({
  sensorRef,
  ballRef,
  ballRadius,
  snowHeight,
  planeScale,
}: {
  sensorRef: MutableRefObject<RapierCollider>;
  ballRef: MutableRefObject<RapierRigidBody>;
  ballRadius: number;
  planeScale: number;
  snowHeight: number;
}) {
  useControls({
    regrowDelay: {
      value: uniformDefaults.uRegrowDelay,
      min: 0,
      max: 10,
      step: 0.1,
      onChange: (value) => {
        uniforms.regrowDelay = value;
      },
    },
    regrowSpeed: {
      value: uniformDefaults.uRegrowSpeed,
      min: 0,
      max: 10,
      step: 0.1,
      onChange: (value) => {
        uniforms.regrowSpeed = value;
      },
    },
  });
  const gl = useThree((state) => state.gl);

  const drawTextureRef = useRef<THREE.Texture>();

  const gpgpu = useMemo(() => {
    const computation = new GPUComputationRenderer(WIDTH * 16, HEIGHT * 16, gl);
    const drawTexture = computation.createTexture();
    const drawTextureArray = drawTexture.image.data as Float32Array;

    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      const i4 = i * 4;
      drawTextureArray[i4 + 0] = 0.0; // Depth.
      drawTextureArray[i4 + 1] = 0.0; // Life.
      drawTextureArray[i4 + 2] = 0.0;
      drawTextureArray[i4 + 3] = 1.0;
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
    drawTextureVariable.material.uniforms.uIntersectUv = new THREE.Uniform(
      uniformDefaults.uIntersectUv,
    );
    drawTextureVariable.material.uniforms.uIntersectDepth = new THREE.Uniform(
      uniformDefaults.uIntersectDepth,
    );
    drawTextureVariable.material.uniforms.uPlaneSize = new THREE.Uniform(
      uniformDefaults.uPlaneSize,
    );
    drawTextureVariable.material.uniforms.uPlaneScale = new THREE.Uniform(
      planeScale,
    );
    drawTextureVariable.material.uniforms.uBallRadius = new THREE.Uniform(
      ballRadius,
    );
    drawTextureVariable.material.uniforms.uSnowHeight = new THREE.Uniform(
      snowHeight,
    );
    drawTextureVariable.material.uniforms.uRegrowDelay = new THREE.Uniform(
      uniformDefaults.uRegrowDelay,
    );
    drawTextureVariable.material.uniforms.uRegrowSpeed = new THREE.Uniform(
      uniformDefaults.uRegrowSpeed,
    );

    return {
      computation,
      drawTextureVariable,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

  useLayoutEffect(() => {
    const error = gpgpu.computation.init();
    if (error !== null) {
      console.error(error);
    }
  });

  useEffect(() => {
    uniforms.ballRadius = ballRadius;
    uniforms.snowHeight = snowHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensorIntersectPoint = new THREE.Vector3();
  const ballIntersectPoint = new THREE.Vector3();

  useFrame((_, delta) => {
    const uDelta = Math.min(delta, 0.1);

    if (
      sensorRef.current &&
      ballRef.current &&
      ballRef.current.numColliders() > 0
    ) {
      sensorIntersectPoint.copy(
        sensorRef.current.contactCollider(ballRef.current.collider(0), 0.1)
          ?.point1 || sensorIntersectPoint,
      );
      ballIntersectPoint.copy(
        sensorRef.current.contactCollider(ballRef.current.collider(0), 0.1)
          ?.point2 || ballIntersectPoint,
      );

      gpgpu.drawTextureVariable.material.uniforms.uIntersectUv.value.copy(
        new THREE.Vector2(
          sensorIntersectPoint.x / (WIDTH * planeScale) + 0.5,
          -sensorIntersectPoint.z / (HEIGHT * planeScale) + 0.5,
        ),
      );
      gpgpu.drawTextureVariable.material.uniforms.uIntersectDepth.value =
        sensorIntersectPoint.y - ballIntersectPoint.y;
    }

    gpgpu.drawTextureVariable.material.uniforms.uDelta.value = uDelta;
    gpgpu.drawTextureVariable.material.uniforms.uBallRadius.value =
      uniforms.ballRadius;
    gpgpu.drawTextureVariable.material.uniforms.uSnowHeight.value =
      uniforms.snowHeight;
    gpgpu.drawTextureVariable.material.uniforms.uRegrowDelay.value =
      uniforms.regrowDelay;
    gpgpu.drawTextureVariable.material.uniforms.uRegrowSpeed.value =
      uniforms.regrowSpeed;

    gpgpu.computation.compute();

    drawTextureRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.drawTextureVariable,
    ).texture;
  });

  return {
    drawTexture: drawTextureRef,
  };
}
