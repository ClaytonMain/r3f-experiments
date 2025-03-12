import { Plane, TorusKnot } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { radialSegments, textureWidth, tubularSegments } from "./consts";
import pointsFragmentShader from "./shaders/points/points.frag";
import pointsVertexShader from "./shaders/points/points.vert";
import useGPGPU from "./useGPGPU";

const gameOfLifeUniforms = {
  uTextureGameState: { value: new THREE.Texture() },
  uRadialSegments: { value: radialSegments },
  uTubularSegments: { value: tubularSegments },
  uTextureWidth: { value: textureWidth },
};

const texturePlaneUniforms = {
  uResolution: new THREE.Uniform(new THREE.Vector2(800, 800)),
};

export default function MeshSurfaceGameOfLife() {
  const { textureGameState } = useGPGPU();
  const viewport = useThree((state) => state.viewport);

  const planeRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null!);

  const particlesGeometry = useMemo(() => {
    const particles = BufferGeometryUtils.mergeVertices(
      new THREE.TorusKnotGeometry(1, 0.4, tubularSegments, radialSegments),
    );
    const particleCount = radialSegments * tubularSegments;
    const references = new Float32Array(particleCount * 2);
    for (let i = 0; i < particleCount; i++) {
      const i2 = i * 2;
      references[i2 + 0] = (i % radialSegments) / (radialSegments - 1);
      references[i2 + 1] = ~~(i / radialSegments) / (tubularSegments - 1);
    }
    particles.setAttribute(
      "aReference",
      new THREE.InstancedBufferAttribute(references, 2),
    );
    return particles;
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
    if (pointsRef.current && textureGameState.current) {
      gameOfLifeUniforms.uTextureGameState.value = textureGameState.current;
    }
    if (planeRef.current && textureGameState.current) {
      // @ts-expect-error uniforms does exist.
      planeRef.current.material.map = textureGameState.current;
    }
  });

  return (
    <>
      <Plane ref={planeRef}>
        <meshBasicMaterial
          attach="material"
          map={textureGameState.current}
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
      <TorusKnot args={[1, 0.4 - 0.001, tubularSegments, radialSegments]}>
        <meshStandardMaterial color="#000" flatShading />
      </TorusKnot>
      <points ref={pointsRef} geometry={particlesGeometry}>
        <shaderMaterial
          attach={"material"}
          uniforms={gameOfLifeUniforms}
          vertexShader={pointsVertexShader}
          fragmentShader={pointsFragmentShader}
          transparent
          // depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}
