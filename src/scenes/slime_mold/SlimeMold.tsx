import { Plane } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { SlimeMoldShaderMaterial } from "./SlimeMoldShaderMaterial";

extend({ SlimeMoldShaderMaterial });

export default function SlimeMold() {
  // @ts-expect-error It doesn't like the experimentShaderMaterial.
  const shaderMaterialRef = useRef<experimentShaderMaterial>(null!);

  useFrame(({ clock }) => {
    shaderMaterialRef.current.uTime = clock.getElapsedTime();
  });

  return (
    <Plane>
      <slimeMoldShaderMaterial ref={shaderMaterialRef} uTime={0} />
    </Plane>
  );
}
