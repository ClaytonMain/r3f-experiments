import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  DEFAULT_GAME_SPEED,
  DEFAULT_WRAP_MODE,
  GAME_TEXTURE_SIZE,
  INITIAL_LIFE_PROBABILITY,
} from "./consts";
import pointsFragmentShader from "./shaders/points/points.frag";
import pointsVertexShader from "./shaders/points/points.vert";
import { GameVariables } from "./types";
import useGPGPU from "./useGPGPU";

const gameVariables: GameVariables = {
  gameTextureSize: GAME_TEXTURE_SIZE,
  gameSpeed: DEFAULT_GAME_SPEED,
  lifeProbability: INITIAL_LIFE_PROBABILITY,
  wrapMode: DEFAULT_WRAP_MODE, // 0: no wrap, 1: wrap x, 2: wrap y, 3: wrap both
};

const sharedParticlesUniforms = {
  uDelta: new THREE.Uniform(0.0),
  uTime: new THREE.Uniform(0.0),
  uGameTextureSize: new THREE.Uniform(gameVariables.gameTextureSize),
  uGameSpeed: new THREE.Uniform(gameVariables.gameSpeed),
  uLifeProbability: new THREE.Uniform(gameVariables.lifeProbability),
  uParticleGrowRate: new THREE.Uniform(0.1),
};
const particlesUniformsC = {
  ...sharedParticlesUniforms,
  uColor: new THREE.Uniform(new THREE.Color(0.0, 1.0, 1.0)),
  // uColor: new THREE.Uniform(new THREE.Color(1.0, 0.0, 0.0)),
  uGameStateTexture: new THREE.Uniform(new THREE.Texture()),
};
const particlesUniformsM = {
  ...sharedParticlesUniforms,
  uColor: new THREE.Uniform(new THREE.Color(1.0, 0.0, 1.0)),
  // uColor: new THREE.Uniform(new THREE.Color(0.0, 1.0, 0.0)),
  uGameStateTexture: new THREE.Uniform(new THREE.Texture()),
};
const particlesUniformsY = {
  ...sharedParticlesUniforms,
  uColor: new THREE.Uniform(new THREE.Color(1.0, 1.0, 0.0)),
  // uColor: new THREE.Uniform(new THREE.Color(0.0, 0.0, 1.0)),
  uGameStateTexture: new THREE.Uniform(new THREE.Texture()),
};
const particlesUniformsK = {
  ...sharedParticlesUniforms,
  uColor: new THREE.Uniform(new THREE.Color(0.0, 0.0, 0.0)),
  uGameStateTexture: new THREE.Uniform(new THREE.Texture()),
};

export default function HalftoneGameOfLife() {
  const gameStateTextureRefC = useGPGPU(gameVariables).gameStateTextureRef;
  const gameStateTextureRefM = useGPGPU(gameVariables).gameStateTextureRef;
  const gameStateTextureRefY = useGPGPU(gameVariables).gameStateTextureRef;
  const gameStateTextureRefK = useGPGPU(gameVariables).gameStateTextureRef;

  const pointsRefC = useRef<THREE.Points>(null);
  const pointsRefM = useRef<THREE.Points>(null);
  const pointsRefY = useRef<THREE.Points>(null);
  const pointsRefK = useRef<THREE.Points>(null);

  const pointsGeometry = useMemo(() => {
    const aUv = new Float32Array(
      gameVariables.gameTextureSize * gameVariables.gameTextureSize * 2,
    );
    for (
      let i = 0;
      i < gameVariables.gameTextureSize * gameVariables.gameTextureSize;
      i++
    ) {
      const i3 = i * 2;
      // x = ((i + 0.5) % width) / width
      aUv[i3 + 0] =
        ((i + 0.5) % gameVariables.gameTextureSize) /
        gameVariables.gameTextureSize;
      // y = (floor(i / width) + 0.5) / height
      aUv[i3 + 1] =
        (Math.floor(i / gameVariables.gameTextureSize) + 0.5) /
        gameVariables.gameTextureSize;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("aUv", new THREE.BufferAttribute(aUv, 2));
    geometry.setDrawRange(
      0,
      gameVariables.gameTextureSize * gameVariables.gameTextureSize,
    );
    return geometry;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameVariables.gameTextureSize]);

  const uDeltaRef = useRef(0);
  const uTimeRef = useRef(0);
  useFrame((_, delta) => {
    uDeltaRef.current += Math.min(delta, 0.1) * gameVariables.gameSpeed;
    uTimeRef.current += delta;

    sharedParticlesUniforms.uDelta.value = uDeltaRef.current;

    if (pointsRefC.current && gameStateTextureRefC.current) {
      particlesUniformsC.uGameStateTexture.value = gameStateTextureRefC.current;
    }
    if (pointsRefM.current && gameStateTextureRefM.current) {
      particlesUniformsM.uGameStateTexture.value = gameStateTextureRefM.current;
    }
    if (pointsRefY.current && gameStateTextureRefY.current) {
      particlesUniformsY.uGameStateTexture.value = gameStateTextureRefY.current;
    }
    if (pointsRefK.current && gameStateTextureRefK.current) {
      particlesUniformsK.uGameStateTexture.value = gameStateTextureRefK.current;
    }
  });

  const pointBlendingMode = THREE.NormalBlending;

  return (
    <>
      <points
        ref={pointsRefC}
        geometry={pointsGeometry}
        position={[0, 0, -0.003]}
        rotation={[0, 0, (15 * Math.PI) / 180]}
        frustumCulled={false}
      >
        <shaderMaterial
          attach="material"
          uniforms={particlesUniformsC}
          vertexShader={pointsVertexShader}
          fragmentShader={pointsFragmentShader}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={pointBlendingMode}
        />
      </points>
      <points
        ref={pointsRefM}
        geometry={pointsGeometry}
        position={[0, 0, -0.002]}
        rotation={[0, 0, (75 * Math.PI) / 180]}
        frustumCulled={false}
      >
        <shaderMaterial
          attach="material"
          uniforms={particlesUniformsM}
          vertexShader={pointsVertexShader}
          fragmentShader={pointsFragmentShader}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={pointBlendingMode}
        />
      </points>
      <points
        ref={pointsRefY}
        geometry={pointsGeometry}
        position={[0, 0, -0.001]}
        rotation={[0, 0, (0 * Math.PI) / 180]}
        frustumCulled={false}
      >
        <shaderMaterial
          attach="material"
          uniforms={particlesUniformsY}
          vertexShader={pointsVertexShader}
          fragmentShader={pointsFragmentShader}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={pointBlendingMode}
        />
      </points>
      <points
        ref={pointsRefK}
        geometry={pointsGeometry}
        position={[0, 0, 0.0]}
        rotation={[0, 0, (45 * Math.PI) / 180]}
        frustumCulled={false}
      >
        <shaderMaterial
          attach="material"
          uniforms={particlesUniformsK}
          vertexShader={pointsVertexShader}
          fragmentShader={pointsFragmentShader}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={pointBlendingMode}
        />
      </points>
    </>
  );
}
