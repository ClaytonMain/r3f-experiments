import { Plane } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { GameOfLifeShaderMaterial } from "./GameOfLifeShaderMaterial";

extend({ GameOfLifeShaderMaterial });

export default function HalftoneGameOfLife() {
  // @ts-expect-error It doesn't like the shader material.
  const shaderMaterialRef = useRef<gameOfLifeShaderMaterial>(null!);

  useFrame(({ clock }) => {
    shaderMaterialRef.current.uTime = clock.getElapsedTime();
  });

  return (
    <Plane>
      <gameOfLifeShaderMaterial ref={shaderMaterialRef} uTime={0} />
    </Plane>
  );
}
