import { Plane } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import * as THREE from "three";
import { MengerSpongeShaderMaterial } from "./MengerSpongeShaderMaterial";
import { DPR, FOV, uniformDefaults } from "./consts";

extend({ MengerSpongeShaderMaterial });

export default function MengerSponge() {
  // @ts-expect-error It doesn't like the experimentShaderMaterial.
  const shaderMaterialRef = useRef<mengerSpongeShaderMaterial>(null!);

  useControls({
    uPaletteA_MengerSponge: {
      label: "Palette A",
      value: uniformDefaults.uPaletteA.toArray(),
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uPaletteA = value;
      },
    },
    uPaletteB_MengerSponge: {
      label: "Palette B",
      value: uniformDefaults.uPaletteB.toArray(),
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uPaletteB = value;
      },
    },
    uPaletteC_MengerSponge: {
      label: "Palette C",
      value: uniformDefaults.uPaletteC.toArray(),
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uPaletteC = value;
      },
    },
    uPaletteD_MengerSponge: {
      label: "Palette D",
      value: uniformDefaults.uPaletteD.toArray(),
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uPaletteD = value;
      },
    },
  });

  const cameraPosition = new THREE.Vector3();

  useFrame(({ clock, camera, gl }) => {
    camera.getWorldPosition(cameraPosition);
    shaderMaterialRef.current.uCameraPosition.copy(cameraPosition);
    shaderMaterialRef.current.uTime = clock.getElapsedTime();
    shaderMaterialRef.current.uResolution = new THREE.Vector2(
      window.innerWidth * DPR,
      window.innerHeight * DPR,
    );
    shaderMaterialRef.current.uFrameNumber = gl.info.render.frame;
  });

  return (
    <>
      <Plane>
        <mengerSpongeShaderMaterial
          ref={shaderMaterialRef}
          uTime={0}
          uCameraPosition={new THREE.Vector3()}
          uResolution={new THREE.Vector2()}
          uGlZ={-1 / (2 * Math.tan(FOV * (Math.PI / 180) * 0.5))}
        />
      </Plane>
    </>
  );
}
