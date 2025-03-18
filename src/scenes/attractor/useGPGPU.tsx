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
  updateNumericSearchParam,
  updateStringSearchParam,
  validateAttractorParam,
} from "./sharedFunctions";
import { AttractorConfig, AttractorName, AttractorParams } from "./types";

const attractorParams: AttractorParams = {
  attractorName: null,
  speedScale: null,
  decayFactor: null,
  noiseScale: null,
  noiseTimeScale: null,
  noiseIntensity: null,
};

const attractorConfig: AttractorConfig = {
  uAttractorId: null,
  uSystemCenter: null,
  uPositionScale: null,
  uVelocityScale: null,
  uBaseTimeFactor: null,
};

export default function useGPGPU({
  searchParams,
  setSearchParams,
}: {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const initialAttractorName = validateAttractorParam(
      "attractorName",
      searchParams.get("attractorName"),
    ) as AttractorName;
    const initialAttractorConfig = ATTRACTOR_CONFIGS[initialAttractorName];
    attractorParams.attractorName = initialAttractorName;
    attractorConfig.uAttractorId = initialAttractorConfig.uAttractorId;
    attractorConfig.uSystemCenter = initialAttractorConfig.uSystemCenter;
    attractorConfig.uPositionScale = initialAttractorConfig.uPositionScale;
    attractorConfig.uVelocityScale = initialAttractorConfig.uVelocityScale;
    attractorConfig.uBaseTimeFactor = initialAttractorConfig.uBaseTimeFactor;

    attractorParams.speedScale = parseFloat(
      searchParams.get("speedScale") ??
        attractorParams.speedScale?.toString() ??
        DEFAULT_ATTRACTOR_PARAMS.speedScale!.toString(),
    );
    attractorParams.decayFactor = parseFloat(
      searchParams.get("decayFactor") ??
        attractorParams.decayFactor?.toString() ??
        DEFAULT_ATTRACTOR_PARAMS.decayFactor!.toString(),
    );

    attractorParams.noiseScale = parseFloat(
      searchParams.get("noiseScale") ??
        attractorParams.noiseScale?.toString() ??
        DEFAULT_ATTRACTOR_PARAMS.noiseScale!.toString(),
    );
    attractorParams.noiseTimeScale = parseFloat(
      searchParams.get("noiseTimeScale") ??
        attractorParams.noiseTimeScale?.toString() ??
        DEFAULT_ATTRACTOR_PARAMS.noiseTimeScale!.toString(),
    );
    attractorParams.noiseIntensity = parseFloat(
      searchParams.get("noiseIntensity") ??
        attractorParams.noiseIntensity?.toString() ??
        DEFAULT_ATTRACTOR_PARAMS.noiseIntensity!.toString(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    for (const [key, value] of Object.entries(attractorParams)) {
      const searchParamsValue = searchParams.get(key);
      let newAttractorName: AttractorName;
      let newParamValue: number;

      switch (key) {
        case "attractorName":
          newAttractorName = validateAttractorParam(
            key,
            searchParamsValue,
            value,
          ) as AttractorName;
          if (newAttractorName !== value) {
            attractorParams.attractorName = newAttractorName;
            const newAttractorConfig = ATTRACTOR_CONFIGS[newAttractorName];
            attractorConfig.uAttractorId = newAttractorConfig.uAttractorId;
            attractorConfig.uSystemCenter = newAttractorConfig.uSystemCenter;
            attractorConfig.uPositionScale = newAttractorConfig.uPositionScale;
            attractorConfig.uVelocityScale = newAttractorConfig.uVelocityScale;
            attractorConfig.uBaseTimeFactor =
              newAttractorConfig.uBaseTimeFactor;
          }
          break;
        default:
          if (key in attractorParams) {
            newParamValue = validateAttractorParam(
              key,
              searchParamsValue,
              value,
            ) as number;
            if (newParamValue !== value) {
              // @ts-expect-error We'll only get to this point if the key is in attractorParams.
              attractorParams[key] = newParamValue;
            }
          }
          break;
      }
    }
  }, [searchParams]);

  const lastEditRef = useRef<number>(Date.now());
  useControls({
    attractorName: {
      value: validateAttractorParam(
        "attractorName",
        searchParams.get("attractorName"),
        attractorParams.attractorName,
      ) as AttractorName,
      options: ATTRACTOR_NAMES,
      onChange: (value) => {
        updateStringSearchParam({
          setSearchParams,
          key: "attractorName",
          value,
        });
      },
    },
    speedScale: {
      value: validateAttractorParam(
        "speedScale",
        searchParams.get("speedScale"),
        attractorParams.speedScale,
      ) as number,
      min: 0,
      max: 10,
      step: 0.1,
      onChange: (value) => {
        if (Date.now() - lastEditRef.current < 100) return;
        lastEditRef.current = Date.now();
        updateNumericSearchParam({
          setSearchParams,
          key: "speedScale",
          value,
          decimalPlaces: 1,
        });
      },
      onEditEnd: (value) => {
        lastEditRef.current = Date.now();
        updateNumericSearchParam({
          setSearchParams,
          key: "speedScale",
          value,
          decimalPlaces: 1,
        });
      },
    },
    decayFactor: {
      value: validateAttractorParam(
        "decayFactor",
        searchParams.get("decayFactor"),
        attractorParams.decayFactor,
      ) as number,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => {
        if (Date.now() - lastEditRef.current < 100) return;
        lastEditRef.current = Date.now();
        updateNumericSearchParam({
          setSearchParams,
          key: "decayFactor",
          value,
        });
      },
      onEditEnd: (value) => {
        lastEditRef.current = Date.now();
        updateNumericSearchParam({
          setSearchParams,
          key: "decayFactor",
          value,
        });
      },
    },
    "Position Noise": folder({
      noiseScale: {
        value: validateAttractorParam(
          "noiseScale",
          searchParams.get("noiseScale"),
          attractorParams.noiseScale,
        ) as number,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => {
          if (Date.now() - lastEditRef.current < 100) return;
          lastEditRef.current = Date.now();
          updateNumericSearchParam({
            setSearchParams,
            key: "noiseScale",
            value,
          });
        },
        onEditEnd: (value) => {
          lastEditRef.current = Date.now();
          updateNumericSearchParam({
            setSearchParams,
            key: "noiseScale",
            value,
          });
        },
      },
      noiseTimeScale: {
        value: validateAttractorParam(
          "noiseTimeScale",
          searchParams.get("noiseTimeScale"),
          attractorParams.noiseTimeScale,
        ) as number,
        min: 0,
        max: 10,
        step: 0.1,
        onChange: (value) => {
          if (Date.now() - lastEditRef.current < 100) return;
          lastEditRef.current = Date.now();
          updateNumericSearchParam({
            setSearchParams,
            key: "noiseTimeScale",
            value,
            decimalPlaces: 1,
          });
        },
        onEditEnd: (value) => {
          lastEditRef.current = Date.now();
          updateNumericSearchParam({
            setSearchParams,
            key: "noiseTimeScale",
            value,
            decimalPlaces: 1,
          });
        },
      },
      noiseIntensity: {
        value: validateAttractorParam(
          "noiseIntensity",
          searchParams.get("noiseIntensity"),
          attractorParams.noiseIntensity,
        ) as number,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => {
          if (Date.now() - lastEditRef.current < 100) return;
          lastEditRef.current = Date.now();
          updateNumericSearchParam({
            setSearchParams,
            key: "noiseIntensity",
            value,
          });
        },
        onEditEnd: (value) => {
          lastEditRef.current = Date.now();
          updateNumericSearchParam({
            setSearchParams,
            key: "noiseIntensity",
            value,
          });
        },
      },
    }),
  });

  const texturePositionRef = useRef<THREE.Texture>();
  const textureVelocityRef = useRef<THREE.Texture>();

  const gpgpu = useMemo(() => {
    const initialAttractorConfig =
      ATTRACTOR_CONFIGS[
        validateAttractorParam(
          "attractorName",
          searchParams.get("attractorName"),
          attractorParams.attractorName,
        ) as AttractorName
      ];
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
    positionVariable.material.uniforms.uAttractorId = {
      value: initialAttractorConfig.uAttractorId,
    };
    positionVariable.material.uniforms.uSystemCenter = {
      value: initialAttractorConfig.uSystemCenter,
    };
    positionVariable.material.uniforms.uPositionScale = {
      value: initialAttractorConfig.uPositionScale,
    };
    positionVariable.material.uniforms.uVelocityScale = {
      value: initialAttractorConfig.uVelocityScale,
    };
    positionVariable.material.uniforms.uBaseTimeFactor = {
      value: initialAttractorConfig.uBaseTimeFactor,
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

    velocityVariable.material.uniforms.uTime = { value: 0 };
    velocityVariable.material.uniforms.uDelta = { value: 0 };
    velocityVariable.material.uniforms.uAttractorId = {
      value: initialAttractorConfig.uAttractorId,
    };
    velocityVariable.material.uniforms.uSystemCenter = {
      value: initialAttractorConfig.uSystemCenter,
    };
    velocityVariable.material.uniforms.uPositionScale = {
      value: initialAttractorConfig.uPositionScale,
    };
    velocityVariable.material.uniforms.uVelocityScale = {
      value: initialAttractorConfig.uVelocityScale,
    };
    velocityVariable.material.uniforms.uBaseTimeFactor = {
      value: initialAttractorConfig.uBaseTimeFactor,
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

  useFrame((_, delta) => {
    const uDelta =
      Math.min(delta, 0.05) *
      (attractorParams.speedScale ?? DEFAULT_ATTRACTOR_PARAMS.speedScale!);
    uTimeRef.current += uDelta;

    gpgpu.positionVariable.material.uniforms.uTime.value = uTimeRef.current;
    gpgpu.positionVariable.material.uniforms.uDelta.value = uDelta;
    if (attractorConfig.uAttractorId !== null) {
      gpgpu.positionVariable.material.uniforms.uAttractorId.value =
        attractorConfig.uAttractorId!;
      gpgpu.positionVariable.material.uniforms.uSystemCenter.value =
        attractorConfig.uSystemCenter!;
      gpgpu.positionVariable.material.uniforms.uPositionScale.value =
        attractorConfig.uPositionScale!;
      gpgpu.positionVariable.material.uniforms.uVelocityScale.value =
        attractorConfig.uVelocityScale!;
      gpgpu.positionVariable.material.uniforms.uBaseTimeFactor.value =
        attractorConfig.uBaseTimeFactor!;
    }

    gpgpu.positionVariable.material.uniforms.uDecayFactor.value =
      attractorParams.decayFactor;

    gpgpu.positionVariable.material.uniforms.uNoiseScale.value =
      attractorParams.noiseScale;
    gpgpu.positionVariable.material.uniforms.uNoiseTimeScale.value =
      attractorParams.noiseTimeScale;
    gpgpu.positionVariable.material.uniforms.uNoiseIntensity.value =
      attractorParams.noiseIntensity;

    gpgpu.velocityVariable.material.uniforms.uTime.value = uTimeRef.current;
    gpgpu.velocityVariable.material.uniforms.uDelta.value = uDelta;
    if (attractorConfig.uAttractorId !== null) {
      gpgpu.velocityVariable.material.uniforms.uAttractorId.value =
        attractorConfig.uAttractorId!;
      gpgpu.velocityVariable.material.uniforms.uSystemCenter.value =
        attractorConfig.uSystemCenter!;
      gpgpu.velocityVariable.material.uniforms.uPositionScale.value =
        attractorConfig.uPositionScale!;
      gpgpu.velocityVariable.material.uniforms.uVelocityScale.value =
        attractorConfig.uVelocityScale!;
      gpgpu.velocityVariable.material.uniforms.uBaseTimeFactor.value =
        attractorConfig.uBaseTimeFactor!;
    }

    gpgpu.computation.compute();

    texturePositionRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.positionVariable,
    ).texture;
    textureVelocityRef.current = gpgpu.computation.getCurrentRenderTarget(
      gpgpu.velocityVariable,
    ).texture;
  });

  return {
    texturePosition: texturePositionRef,
    textureVelocity: textureVelocityRef,
  };
}
