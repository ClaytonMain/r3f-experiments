import { Bounds, Plane, shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { HEIGHT, WIDTH } from "./consts";
import wallGridFragmentShader from "./shaders/wallGrid/wallGrid.frag";
import wallGridVertexShader from "./shaders/wallGrid/wallGrid.vert";
import useGPGPU from "./useGPGPU";

export default function WallGrid() {
  const planeRef = useRef<THREE.Mesh>(null!);
  const { drawTexture } = useGPGPU({ drawPlaneRef: planeRef });
  const wallScale = 0.05;

  useControls({
    cellScale: {
      value: 0.75,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => {
        particlesMaterialRef.current.uCellScale = value;
      },
    },
  });

  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry();
    const reference = new Float32Array(WIDTH * HEIGHT * 2);
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      const i2 = i * 2;
      reference[i2 + 0] = (i % WIDTH) / (WIDTH - 1);
      reference[i2 + 1] = Math.floor(i / WIDTH) / (HEIGHT - 1);
    }
    geometry.setAttribute(
      "aPositionOffset",
      new THREE.InstancedBufferAttribute(reference, 2),
    );
    return geometry;
  }, []);

  const ParticlesMaterial = shaderMaterial(
    {
      uCellScale: 0.75,
      uDelta: 0.0,
      uDrawTexture: new THREE.Texture(),
      uWallWidth: WIDTH,
      uWallHeight: HEIGHT,
    },
    wallGridVertexShader,
    wallGridFragmentShader,
  );

  extend({ ParticlesMaterial });

  const particlesMaterialRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame((_, delta) => {
    const uDelta = Math.min(delta, 0.1);

    particlesMaterialRef.current.uDelta = uDelta;
    particlesMaterialRef.current.uDrawTexture = drawTexture.current;

    if (planeRef.current) {
      planeRef.current.material.map = drawTexture.current;
    }
  });

  return (
    <>
      <Plane
        ref={planeRef}
        args={[WIDTH, HEIGHT]}
        scale={wallScale}
        visible={false}
        position={[0, 0, 0]}
      >
        <meshBasicMaterial
          attach="material"
          map={drawTexture.current}
          transparent
        />
      </Plane>
      <instancedMesh
        scale={wallScale}
        args={[undefined, undefined, WIDTH * HEIGHT]}
        geometry={particlesGeometry}
      >
        <particlesMaterial ref={particlesMaterialRef} attach="material" />
      </instancedMesh>
    </>
  );
}
