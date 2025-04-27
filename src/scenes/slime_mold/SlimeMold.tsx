import { Plane } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { SlimeMoldShaderMaterial } from "./SlimeMoldShaderMaterial";

extend({ SlimeMoldShaderMaterial });

export default function SlimeMold() {
  // @ts-expect-error It doesn't like the experimentShaderMaterial.
  const shaderMaterialRef = useRef<experimentShaderMaterial>(null!);

  useFrame(({ clock }) => {
    shaderMaterialRef.current.uTime = clock.getElapsedTime();
    shaderMaterialRef.current.uResolution = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight,
    );
  });

  return (
    <Plane>
      <slimeMoldShaderMaterial
        ref={shaderMaterialRef}
        uTime={0}
        uResolution={new THREE.Vector2(100, 100)}
      />
    </Plane>
  );
}
