import { Plane, TorusKnot } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
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

export default function MeshSurfaceGameOfLife() {
  const { textureGameState } = useGPGPU();

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

  const planeRef = useRef<THREE.Mesh>(null);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame(() => {
    if (pointsRef.current && textureGameState.current) {
      gameOfLifeUniforms.uTextureGameState.value = textureGameState.current;
      // // @ts-expect-error uniforms does exist.
      // pointsRef.current.material.uniforms.uTime.value = clock.elapsedTime;
      // console.log(pointsRef.current.material.uniforms);
    }
    if (planeRef.current && textureGameState.current) {
      // @ts-expect-error uniforms does exist.
      planeRef.current.material.map = textureGameState.current;
    }
  });

  return (
    <>
      <Plane ref={planeRef} position={[3, 3, 0]}>
        <meshBasicMaterial
          attach={"material"}
          map={textureGameState.current}
          onBeforeCompile={(shader) => {
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              /* glsl */ `
            #include <project_vertex>
            gl_Position = vec4(position, 1.0) * vec4(0.4, 0.4, 1.0, 1.0) + vec4(0.8, 0.8, 0.0, 0.0);
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
