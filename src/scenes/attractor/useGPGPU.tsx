import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useLayoutEffect, useMemo, useReducer, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import {
  ATTRACTOR_CONFIGS,
  ATTRACTOR_NAMES,
  DEFAULT_ATTRACTOR_NAME,
  defaultNumberOfParticles,
  textureWidth,
} from "./consts";
import attractorPositionGPGPUShader from "./shaders/gpgpu/attractorPosition.glsl";
import attractorVelocityGPGPUShader from "./shaders/gpgpu/attractorVelocity.glsl";
import { AttractorName, SearchParamsRef } from "./types";

function getValidAttractorName(
  attemptedAttractorName: string,
  previousAttractorName: AttractorName,
): AttractorName {
  if (ATTRACTOR_NAMES.includes(attemptedAttractorName as AttractorName)) {
    return attemptedAttractorName as AttractorName;
  } else if (ATTRACTOR_NAMES.includes(previousAttractorName)) {
    return previousAttractorName;
  } else {
    return DEFAULT_ATTRACTOR_NAME;
  }
}

interface ReducerState {
  attractorName: AttractorName;
  uAttractorId: number;
  uSystemCenter: THREE.Vector3;
  uPositionScale: number;
  uVelocityScale: number;
  speedScale: number;
}

type UpdateAttractorNameAction = {
  type: "updateAttractorName";
  attemptAttractorName: AttractorName;
};

type UpdateStateValuesAction = {
  type: "updateStateValues";
  updatedValues: {
    attractorName?: AttractorName;
    uAttractorId?: number;
    uSystemCenter?: THREE.Vector3;
    uPositionScale?: number;
    uVelocityScale?: number;
    speedScale?: number;
  };
};

type ReducerAction = UpdateAttractorNameAction | UpdateStateValuesAction;

function reducer(state: ReducerState, action: ReducerAction) {
  switch (action.type) {
    case "updateAttractorName":
      return {
        ...state,
        attractorName: getValidAttractorName(
          action.attemptAttractorName,
          state.attractorName,
        ),
        ...ATTRACTOR_CONFIGS[action.attemptAttractorName],
      };
    case "updateStateValues":
      return {
        ...state,
        ...action.updatedValues,
      };
    default:
      return state;
  }
}

export default function useGPGPU({
  searchParamsRef,
}: {
  searchParamsRef: SearchParamsRef;
}) {
  const [displayState, dispatch] = useReducer(reducer, {
    attractorName: getValidAttractorName(
      searchParamsRef.current.searchParams.get("attractorName") ?? "",
      DEFAULT_ATTRACTOR_NAME,
    ),
    ...ATTRACTOR_CONFIGS[
      getValidAttractorName(
        searchParamsRef.current.searchParams.get("attractorName") ?? "",
        DEFAULT_ATTRACTOR_NAME,
      )
    ],
    speedScale: parseFloat(
      searchParamsRef.current.searchParams.get("speedScale") ?? "1",
    ),
  });

  const gl = useThree((state) => state.gl);

  useControls({
    speedScale: {
      value: displayState.speedScale,
      min: 0,
      max: 10,
      step: 0.1,
      onChange: (value) => {
        dispatch({
          type: "updateStateValues",
          updatedValues: { speedScale: value },
        });
        searchParamsRef.current.setSearchParams(
          (prev) => {
            const props = prev;
            props.set("speedScale", String(Math.round(value * 10) / 10));
            return props;
          },
          {
            replace: true,
          },
        );
      },
    },
  });

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
    positionVariable.material.uniforms.uAttractorId = {
      value: displayState.uAttractorId,
    };
    positionVariable.material.uniforms.uSystemCenter = {
      value: displayState.uSystemCenter,
    };
    positionVariable.material.uniforms.uPositionScale = {
      value: displayState.uPositionScale,
    };
    positionVariable.material.uniforms.uVelocityScale = {
      value: displayState.uVelocityScale,
    };
    positionVariable.material.uniforms.uPositionFlowFieldScale = {
      value: 0.01,
    };

    velocityVariable.material.uniforms.uTime = { value: 0 };
    velocityVariable.material.uniforms.uDelta = { value: 0 };
    velocityVariable.material.uniforms.uAttractorId = {
      value: displayState.uAttractorId,
    };
    velocityVariable.material.uniforms.uSystemCenter = {
      value: displayState.uSystemCenter,
    };
    velocityVariable.material.uniforms.uPositionScale = {
      value: displayState.uPositionScale,
    };
    velocityVariable.material.uniforms.uVelocityScale = {
      value: displayState.uVelocityScale,
    };
    velocityVariable.material.uniforms.uMinVelocity = { value: 0.001 };
    velocityVariable.material.uniforms.uVelocityFlowFieldScale = {
      value: 0.0,
    };

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
  const logIntervalRef = useRef(0);

  useFrame((_, delta) => {
    const uDelta = Math.min(delta, 0.05) * displayState.speedScale;
    uTimeRef.current += uDelta;
    logIntervalRef.current += uDelta;

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
  });

  return {
    texturePosition: texturePositionRef,
    textureVelocity: textureVelocityRef,
  };
}
