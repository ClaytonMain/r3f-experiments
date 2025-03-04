import { Hud, PerspectiveCamera, Plane, TorusKnot } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
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

  const viewport = useThree((state) => state.viewport);

  return (
    <>
      <Hud>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={1.0} />
        <Plane
          ref={planeRef}
          position={[viewport.width / 2 - 2, viewport.height / 2 - 2, 0]}
        >
          <meshBasicMaterial
            attach={"material"}
            map={textureGameState.current}
          />
        </Plane>
      </Hud>
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
