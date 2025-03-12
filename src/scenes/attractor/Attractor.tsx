import { Plane } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  ATTRACTOR_CONFIGS,
  defaultNumberOfParticles,
  textureWidth,
} from "./consts";
import particlesFragmentShader from "./shaders/particles/particles.frag";
import particlesVertexShader from "./shaders/particles/particles.vert";
import { AttractorName } from "./types";
import useGPGPU from "./useGPGPU";

const particlesUniforms = {
  uTexturePosition: new THREE.Uniform(new THREE.Texture()),
  uTextureVelocity: new THREE.Uniform(new THREE.Texture()),
  uPositionCalculationScale: new THREE.Uniform(0.001),
  uVelocityCalculationScale: new THREE.Uniform(0.001),
};

const texturePlaneUniforms = {
  uResolution: new THREE.Uniform(new THREE.Vector2(800, 800)),
};

export default function Attractor({
  attractorName,
}: {
  attractorName: AttractorName;
}) {
  const { texturePosition, textureVelocity } = useGPGPU({ attractorName });
  const viewport = useThree((state) => state.viewport);

  const attractorConfig = ATTRACTOR_CONFIGS[attractorName];
  particlesUniforms.uPositionCalculationScale.value =
    attractorConfig.uPositionCalculationScale;
  particlesUniforms.uVelocityCalculationScale.value =
    attractorConfig.uVelocityCalculationScale;

  const positionPlaneRef = useRef<THREE.Mesh>(null!);
  const velocityPlaneRef = useRef<THREE.Mesh>(null!);
  const pointsRef = useRef<THREE.Points>(null!);

  const particlesGeometry = useMemo(() => {
    const references = new Float32Array(defaultNumberOfParticles * 2);
    const positions = new Float32Array(defaultNumberOfParticles * 3);
    for (let i = 0; i < defaultNumberOfParticles; i++) {
      const i2 = i * 2;

      references[i2 + 0] = (i % textureWidth) / (textureWidth - 1);
      references[i2 + 1] = ~~(i / textureWidth) / (textureWidth - 1);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "aReference",
      new THREE.BufferAttribute(references, 2),
    );

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    geometry.setDrawRange(0, defaultNumberOfParticles);

    return geometry;
  }, []);

  useEffect(() => {
    if (viewport.width && viewport.height) {
      texturePlaneUniforms.uResolution.value.set(
        viewport.width,
        viewport.height,
      );
    }
  }, [viewport]);

  useFrame(() => {
    if (
      pointsRef.current &&
      texturePosition.current &&
      textureVelocity.current
    ) {
      particlesUniforms.uTexturePosition.value = texturePosition.current;
      particlesUniforms.uTextureVelocity.value = textureVelocity.current;
      if (positionPlaneRef.current) {
        // @ts-expect-error 'map' does exist.
        positionPlaneRef.current.material.map = texturePosition.current;
      }
      if (velocityPlaneRef.current) {
        // @ts-expect-error 'map' does exist.
        velocityPlaneRef.current.material.map = textureVelocity.current;
      }
    }
  });

  return (
    <>
      {/* <group rotation={[Math.PI / 2, 0, 0]} scale={[1, -1, -1]}> */}
      <group>
        {/* <axesHelper args={[1]} /> */}
        <points
          // scale={attractorConfig.particlesScale}
          // rotation={[Math.PI / 2, 0, 0]}
          ref={pointsRef}
          geometry={particlesGeometry}
        >
          <shaderMaterial
            attach="material"
            uniforms={particlesUniforms}
            fragmentShader={particlesFragmentShader}
            vertexShader={particlesVertexShader}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
            depthTest={false}
          />
        </points>
      </group>
      <Plane ref={positionPlaneRef}>
        <meshBasicMaterial
          attach="material"
          map={texturePosition.current}
          depthTest={false}
          depthWrite={false}
          onBeforeCompile={(shader) => {
            shader.uniforms.uResolution = texturePlaneUniforms.uResolution;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
              #include <common>
              uniform vec2 uResolution;
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              /* glsl */ `
              #include <project_vertex>
              gl_Position = vec4(position, 1.0) * vec4(0.4 * (uResolution.y / uResolution.x), 0.4, 1.0, 1.0) + vec4(1.0 - (0.4 * (uResolution.y / uResolution.x)) * 0.5, 0.8, 0.0, 0.0);
              `,
            );
          }}
        />
      </Plane>
      <Plane ref={velocityPlaneRef}>
        <meshBasicMaterial
          attach="material"
          map={textureVelocity.current}
          depthTest={false}
          depthWrite={false}
          onBeforeCompile={(shader) => {
            shader.uniforms.uResolution = texturePlaneUniforms.uResolution;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
              #include <common>
              uniform vec2 uResolution;
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              /* glsl */ `
              #include <project_vertex>
              gl_Position = vec4(position, 1.0) * vec4(0.4 * (uResolution.y / uResolution.x), 0.4, 1.0, 1.0) + vec4(1.0 - (0.4 * (uResolution.y / uResolution.x)) * 0.5, 0.4, 0.0, 0.0);
              `,
            );
          }}
        />
      </Plane>
    </>
  );
}
