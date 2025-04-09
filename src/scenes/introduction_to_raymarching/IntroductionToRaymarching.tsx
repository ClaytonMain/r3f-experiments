import { Plane } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { ExperimentShaderMaterial } from "./ExperimentShaderMaterial";

extend({ ExperimentShaderMaterial });

const DPR = 1.0;

export default function IntroductionToRaymarching() {
  // @ts-expect-error It doesn't like the experimentShaderMaterial.
  const shaderMaterialRef = useRef<experimentShaderMaterial>(null!);

  useFrame(({ clock, camera }) => {
    shaderMaterialRef.current.uTime = clock.getElapsedTime();
    shaderMaterialRef.current.uCameraPosition = camera.position;
    shaderMaterialRef.current.uCameraRotation = camera.rotation;
    shaderMaterialRef.current.uResolution = new THREE.Vector2(
      window.innerWidth * DPR,
      window.innerHeight * DPR,
    );
  });

  return (
    <>
      <Plane rotation={[0, Math.PI, 0]}>
        <experimentShaderMaterial
          ref={shaderMaterialRef}
          uTime={0}
          uCameraPosition={new THREE.Vector3()}
          uCameraRotation={new THREE.Euler()}
          uResolution={new THREE.Vector2(100, 100)}
        />
      </Plane>
    </>
  );
}
