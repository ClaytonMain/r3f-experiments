import { useFrame, useThree } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { SetURLSearchParams } from "react-router";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import {
  ATTRACTOR_CONFIGS,
  ATTRACTOR_NAMES,
  DEFAULT_ATTRACTOR_PARAMS,
  DEFAULT_PARTICLE_COUNT,
  TEXTURE_WIDTH,
} from "./consts";
import attractorPositionGPGPUShader from "./shaders/gpgpu/attractorPosition.glsl";
import attractorVelocityGPGPUShader from "./shaders/gpgpu/attractorVelocity.glsl";
import {
  getValidatedAttractorParam,
  updateSearchParam,
} from "./sharedFunctions";
import { AttractorName, PositionUniforms, VelocityUniforms } from "./types";

const positionUniforms: PositionUniforms = {
  uTime: new THREE.Uniform(0),
  uDelta: new THREE.Uniform(0),
  uSystemCenter: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  uPositionScale: new THREE.Uniform(0),
  uVelocityScale: new THREE.Uniform(0),
  uBaseTimeFactor: new THREE.Uniform(0),
  uDecayFactor: new THREE.Uniform(0),
  uNoiseScale: new THREE.Uniform(0),
  uNoiseTimeScale: new THREE.Uniform(0),
  uNoiseIntensity: new THREE.Uniform(0),
};

const velocityUniforms: VelocityUniforms = {
  uAttractorId: new THREE.Uniform(0),
  uSystemCenter: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  uPositionScale: new THREE.Uniform(0),
  uVelocityScale: new THREE.Uniform(0),
  uBaseTimeFactor: new THREE.Uniform(0),
  uMinVelocity: new THREE.Uniform(0),
};

export default function useGPGPU({
  searchParams,
  setSearchParams,
}: {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}) {
  const gl = useThree((state) => state.gl);
  const attractorNameRef = useRef<AttractorName>(
    getValidatedAttractorParam(searchParams, "attractorName"),
  );
  const speedScaleRef = useRef<number>(
    getValidatedAttractorParam(searchParams, "speedScale") as number,
  );

  function handleAttractorNameChange(value: AttractorName) {
    if (attractorNameRef.current === value) return;
    attractorNameRef.current = value;
    updateSearchParam(setSearchParams, "attractorName", value);
    const attractorConfig = ATTRACTOR_CONFIGS[value];

    positionUniforms.uSystemCenter.value = attractorConfig.uSystemCenter;
    positionUniforms.uPositionScale.value = attractorConfig.uPositionScale;
    positionUniforms.uVelocityScale.value = attractorConfig.uVelocityScale;
    positionUniforms.uBaseTimeFactor.value = attractorConfig.uBaseTimeFactor;

    velocityUniforms.uAttractorId.value = attractorConfig.uAttractorId;
    velocityUniforms.uSystemCenter.value = attractorConfig.uSystemCenter;
    velocityUniforms.uPositionScale.value = attractorConfig.uPositionScale;
    velocityUniforms.uVelocityScale.value = attractorConfig.uVelocityScale;
    velocityUniforms.uBaseTimeFactor.value = attractorConfig.uBaseTimeFactor;
  }

  useEffect(() => {
    const attractorName = getValidatedAttractorParam(
      searchParams,
      "attractorName",
    );

    const attractorConfig = ATTRACTOR_CONFIGS[attractorName];

    positionUniforms.uSystemCenter.value = attractorConfig.uSystemCenter;
    positionUniforms.uPositionScale.value = attractorConfig.uPositionScale;
    positionUniforms.uVelocityScale.value = attractorConfig.uVelocityScale;
    positionUniforms.uBaseTimeFactor.value = attractorConfig.uBaseTimeFactor;

    velocityUniforms.uAttractorId.value = attractorConfig.uAttractorId;
    velocityUniforms.uSystemCenter.value = attractorConfig.uSystemCenter;
    velocityUniforms.uPositionScale.value = attractorConfig.uPositionScale;
    velocityUniforms.uVelocityScale.value = attractorConfig.uVelocityScale;
    velocityUniforms.uBaseTimeFactor.value = attractorConfig.uBaseTimeFactor;

    const decayFactor = getValidatedAttractorParam(searchParams, "decayFactor");
    const noiseScale = getValidatedAttractorParam(searchParams, "noiseScale");
    const noiseTimeScale = getValidatedAttractorParam(
      searchParams,
      "noiseTimeScale",
    );
    const noiseIntensity = getValidatedAttractorParam(
      searchParams,
      "noiseIntensity",
    );

    positionUniforms.uDecayFactor.value = decayFactor;
    positionUniforms.uNoiseScale.value = noiseScale;
    positionUniforms.uNoiseTimeScale.value = noiseTimeScale;
    positionUniforms.uNoiseIntensity.value = noiseIntensity;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentTimeRef = useRef<number>(0);

  function updatePositionUniform<K extends keyof PositionUniforms>(
    key: K,
    value: PositionUniforms[K]["value"],
  ) {
    positionUniforms[key].value = value;
  }

  // function updateVelocityUniform<K extends keyof VelocityUniforms>(
  //   key: K,
  //   value: VelocityUniforms[K]["value"],
  // ) {
  //   velocityUniforms[key].value = value;
  // }

  useControls(
    {
      Simulation: folder({
        attractorName: {
          value: getValidatedAttractorParam(searchParams, "attractorName"),
          options: ATTRACTOR_NAMES,
          onChange: (value) => {
            handleAttractorNameChange(value);
          },
        },
        speedScale: {
          value: getValidatedAttractorParam(searchParams, "speedScale"),
          min: 0,
          max: 10,
          step: 0.1,
          onChange: (value) => {
            speedScaleRef.current = value;
          },
          onEditEnd: (value) => {
            speedScaleRef.current = value;
            updateSearchParam(setSearchParams, "speedScale", value);
          },
        },
        decayFactor: {
          value: getValidatedAttractorParam(searchParams, "decayFactor"),
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (value) => {
            updatePositionUniform("uDecayFactor", value);
          },
          onEditEnd: (value) => {
            updatePositionUniform("uDecayFactor", value);
            updateSearchParam(setSearchParams, "decayFactor", value);
          },
        },
      }),
      "Position Noise": folder({
        noiseScale: {
          value: getValidatedAttractorParam(searchParams, "noiseScale"),
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (value) => {
            updatePositionUniform("uNoiseScale", value);
          },
          onEditEnd: (value) => {
            updatePositionUniform("uNoiseScale", value);
            updateSearchParam(setSearchParams, "noiseScale", value);
          },
        },
        noiseTimeScale: {
          value: getValidatedAttractorParam(searchParams, "noiseTimeScale"),
          min: 0,
          max: 10,
          step: 0.1,
          onChange: (value) => {
            updatePositionUniform("uNoiseTimeScale", value);
          },
          onEditEnd: (value) => {
            updatePositionUniform("uNoiseTimeScale", value);
            updateSearchParam(setSearchParams, "noiseTimeScale", value);
          },
        },
        noiseIntensity: {
          value: getValidatedAttractorParam(searchParams, "noiseIntensity"),
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (value) => {
            updatePositionUniform("uNoiseIntensity", value);
          },
          onEditEnd: (value) => {
            updatePositionUniform("uNoiseIntensity", value);
            updateSearchParam(setSearchParams, "noiseIntensity", value);
          },
        },
      }),
    },
    [currentTimeRef.current],
  );

  const texturePositionRef = useRef<THREE.Texture>();
  const textureVelocityRef = useRef<THREE.Texture>();

  const gpgpu = useMemo(() => {
    const attractorName = getValidatedAttractorParam(
      searchParams,
      "attractorName",
    );
    const attractorConfig = ATTRACTOR_CONFIGS[attractorName];

    const computation = new GPUComputationRenderer(
      TEXTURE_WIDTH,
      TEXTURE_WIDTH,
      gl,
    );

    const texturePosition = computation.createTexture();
    const textureVelocity = computation.createTexture();

    const positionArray = texturePosition.image.data as Float32Array;
    const velocityArray = textureVelocity.image.data as Float32Array;

    for (let i = 0; i < DEFAULT_PARTICLE_COUNT; i++) {
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
    positionVariable.material.uniforms.uSystemCenter = {
      value: attractorConfig.uSystemCenter,
    };
    positionVariable.material.uniforms.uPositionScale = {
      value: attractorConfig.uPositionScale,
    };
    positionVariable.material.uniforms.uVelocityScale = {
      value: attractorConfig.uVelocityScale,
    };
    positionVariable.material.uniforms.uBaseTimeFactor = {
      value: attractorConfig.uBaseTimeFactor,
    };
    positionVariable.material.uniforms.uDecayFactor = {
      value: DEFAULT_ATTRACTOR_PARAMS.decayFactor,
    };
    positionVariable.material.uniforms.uNoiseScale = {
      value: DEFAULT_ATTRACTOR_PARAMS.noiseScale,
    };
    positionVariable.material.uniforms.uNoiseTimeScale = {
      value: DEFAULT_ATTRACTOR_PARAMS.noiseTimeScale,
    };
    positionVariable.material.uniforms.uNoiseIntensity = {
      value: DEFAULT_ATTRACTOR_PARAMS.noiseIntensity,
    };

    velocityVariable.material.uniforms.uAttractorId = {
      value: attractorConfig.uAttractorId,
    };
    velocityVariable.material.uniforms.uSystemCenter = {
      value: attractorConfig.uSystemCenter,
    };
    velocityVariable.material.uniforms.uPositionScale = {
      value: attractorConfig.uPositionScale,
    };
    velocityVariable.material.uniforms.uVelocityScale = {
      value: attractorConfig.uVelocityScale,
    };
    velocityVariable.material.uniforms.uBaseTimeFactor = {
      value: attractorConfig.uBaseTimeFactor,
    };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uTimeRef = useRef(0);

  useFrame(({ clock }, delta) => {
    const uDelta =
      Math.min(delta, 0.05) *
      (speedScaleRef.current ?? DEFAULT_ATTRACTOR_PARAMS.speedScale);
    uTimeRef.current += uDelta;

    gpgpu.positionVariable.material.uniforms.uTime.value = uTimeRef.current;
    gpgpu.positionVariable.material.uniforms.uDelta.value = uDelta;
    gpgpu.positionVariable.material.uniforms.uSystemCenter.value =
      positionUniforms.uSystemCenter.value;
    gpgpu.positionVariable.material.uniforms.uPositionScale.value =
      positionUniforms.uPositionScale.value;
    gpgpu.positionVariable.material.uniforms.uVelocityScale.value =
      positionUniforms.uVelocityScale.value;
    gpgpu.positionVariable.material.uniforms.uBaseTimeFactor.value =
      positionUniforms.uBaseTimeFactor.value;
    gpgpu.positionVariable.material.uniforms.uDecayFactor.value =
      positionUniforms.uDecayFactor.value;
    gpgpu.positionVariable.material.uniforms.uNoiseScale.value =
      positionUniforms.uNoiseScale.value;
    gpgpu.positionVariable.material.uniforms.uNoiseTimeScale.value =
      positionUniforms.uNoiseTimeScale.value;
    gpgpu.positionVariable.material.uniforms.uNoiseIntensity.value =
      positionUniforms.uNoiseIntensity.value;

    gpgpu.velocityVariable.material.uniforms.uAttractorId.value =
      velocityUniforms.uAttractorId.value;
    gpgpu.velocityVariable.material.uniforms.uSystemCenter.value =
      velocityUniforms.uSystemCenter.value;
    gpgpu.velocityVariable.material.uniforms.uPositionScale.value =
      velocityUniforms.uPositionScale.value;
    gpgpu.velocityVariable.material.uniforms.uVelocityScale.value =
      velocityUniforms.uVelocityScale.value;
    gpgpu.velocityVariable.material.uniforms.uBaseTimeFactor.value =
      velocityUniforms.uBaseTimeFactor.value;
    gpgpu.velocityVariable.material.uniforms.uMinVelocity.value =
      velocityUniforms.uMinVelocity.value;

    gpgpu.computation.compute();

    texturePositionRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.positionVariable,
    ).texture;
    textureVelocityRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.velocityVariable,
    ).texture;

    if (clock.elapsedTime > currentTimeRef.current + 0.5) {
      currentTimeRef.current = clock.elapsedTime;
    }
  });

  return {
    texturePosition: texturePositionRef,
    textureVelocity: textureVelocityRef,
  };
}
