import { Plane } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { ExperimentShaderMaterial } from "./ExperimentShaderMaterial";

extend({ ExperimentShaderMaterial });

export default function Template() {
  // @ts-expect-error It doesn't like the experimentShaderMaterial.
  const shaderMaterialRef = useRef<experimentShaderMaterial>(null!);

  useFrame(({ clock }) => {
    shaderMaterialRef.current.uTime = clock.getElapsedTime();
  });

  return (
    <Plane>
      <experimentShaderMaterial ref={shaderMaterialRef} uTime={0} />
    </Plane>
  );
}
