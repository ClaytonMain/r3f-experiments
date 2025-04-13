import { Circle, Cylinder, Ring, useTexture } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import * as THREE from "three";
import { InfinityMirrorShaderMaterial } from "./InfinityMirrorShaderMaterial";
import { uniformDefaults } from "./consts";

extend({ InfinityMirrorShaderMaterial });

export default function InfinityMirror() {
  // @ts-expect-error It doesn't like the experimentShaderMaterial.
  const shaderMaterialRef = useRef<infinityMirrorShaderMaterial>(null!);

  const textureProps = useTexture({
    aoMap: "textures/dark_wood/dark_wood_ao_4k.jpg",
    map: "textures/dark_wood/dark_wood_diff_4k.jpg",
    normalMap: "textures/dark_wood/dark_wood_nor_gl_4k.jpg",
    roughnessMap: "textures/dark_wood/dark_wood_rough_4k.jpg",
    clearcoatMap: "textures/dark_wood/dark_wood_rough_4k.jpg",
  });
  textureProps.map.repeat.set(1, 1);
  textureProps.map.wrapS = THREE.RepeatWrapping;
  textureProps.map.wrapT = THREE.RepeatWrapping;
  const frameMaterial = new THREE.MeshPhysicalMaterial({
    ...textureProps,
    side: THREE.DoubleSide,
    color: new THREE.Color("#3c1c0c"),
    roughness: 0.7,
    metalness: 0.2,
    clearcoat: 0.6,
    clearcoatRoughness: 0.5,
    toneMapped: false,
  });

  useControls({
    uPaletteA_InfinityMirror: {
      label: "Palette A",
      value: uniformDefaults.uPaletteA.toArray(),
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uPaletteA = value;
      },
    },
    uPaletteB_InfinityMirror: {
      label: "Palette B",
      value: uniformDefaults.uPaletteB.toArray(),
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uPaletteB = value;
      },
    },
    uPaletteC_InfinityMirror: {
      label: "Palette C",
      value: uniformDefaults.uPaletteC.toArray(),
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uPaletteC = value;
      },
    },
    uPaletteD_InfinityMirror: {
      label: "Palette D",
      value: uniformDefaults.uPaletteD.toArray(),
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uPaletteD = value;
      },
    },
    uDotRadius_InfinityMirror: {
      label: "Dot Radius",
      value: Math.pow(uniformDefaults.uDotRadius, 1 / 3),
      min: 0.1,
      max: 1.0,
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uDotRadius = Math.pow(value, 3);
      },
    },
    uDotSpacing_InfinityMirror: {
      label: "Dot Spacing",
      value: Math.pow(uniformDefaults.uDotSpacing, 1 / 3),
      min: 0.1,
      max: 1.0,
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uDotSpacing = Math.pow(value, 3);
      },
    },
    uDotCenterRadius_InfinityMirror: {
      label: "Dot Center Radius",
      value: uniformDefaults.uDotCenterRadius,
      min: 0.1,
      max: 5.0,
      step: 0.1,
      onChange: (value) => {
        shaderMaterialRef.current.uDotCenterRadius = value;
      },
    },
    uRadialRepetitions_InfinityMirror: {
      label: "Radial Repetitions",
      value: uniformDefaults.uRadialRepetitions,
      min: 0,
      max: 1000.0,
      step: 1,
      onChange: (value) => {
        shaderMaterialRef.current.uRadialRepetitions = value;
      },
    },
    uTanOscAmplitude_InfinityMirror: {
      label: "Tan Osc Amplitude",
      value: uniformDefaults.uTanOscAmplitude,
      min: 0,
      max: 5.0,
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uTanOscAmplitude = value;
      },
    },
    uTanOscFrequency_InfinityMirror: {
      label: "Tan Osc Frequency",
      value: uniformDefaults.uTanOscFrequency,
      min: 0,
      max: 5.0,
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uTanOscFrequency = value;
      },
    },
    uTanOscPhaseSpeed_InfinityMirror: {
      label: "Tan Osc Phase Speed",
      value: uniformDefaults.uTanOscPhaseSpeed,
      min: 0,
      max: 5.0,
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uTanOscPhaseSpeed = value;
      },
    },
    uRadOscAmplitude_InfinityMirror: {
      label: "Rad Osc Amplitude",
      value: uniformDefaults.uRadOscAmplitude,
      min: 0,
      max: 5.0,
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uRadOscAmplitude = value;
      },
    },
    uRadOscFrequency_InfinityMirror: {
      label: "Rad Osc Frequency",
      value: uniformDefaults.uRadOscFrequency,
      min: 0,
      max: 5.0,
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uRadOscFrequency = value;
      },
    },
    uRadOscPhaseSpeed_InfinityMirror: {
      label: "Rad Osc Phase Speed",
      value: uniformDefaults.uRadOscPhaseSpeed,
      min: 0,
      max: 5.0,
      step: 0.01,
      onChange: (value) => {
        shaderMaterialRef.current.uRadOscPhaseSpeed = value;
      },
    },
  });

  useFrame(({ clock, camera }) => {
    shaderMaterialRef.current.uTime = clock.getElapsedTime();
    shaderMaterialRef.current.uCameraPosition = camera.position;
  });

  return (
    <>
      <Circle
        rotation={[-Math.PI / 2, 0, 0]}
        args={[1, 100]}
        castShadow
        receiveShadow
      >
        <infinityMirrorShaderMaterial
          ref={shaderMaterialRef}
          uTime={0}
          uCameraPosition={new THREE.Vector3()}
        />
      </Circle>
      <Ring
        args={[1.0, 1.1, 100, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
        material={frameMaterial}
        castShadow
        receiveShadow
      />
      <Cylinder
        args={[1.0, 1.0, 0.05, 100, 1, true]}
        position={[0, 0.025, 0]}
        material={frameMaterial}
        castShadow
        receiveShadow
      />
      <Cylinder
        args={[1.1, 1.1, 0.1, 100, 1, true]}
        material={frameMaterial}
        castShadow
        receiveShadow
      />
      <Circle
        args={[1.1, 100]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        material={frameMaterial}
        castShadow
        receiveShadow
      />
    </>
  );
}
