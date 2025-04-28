import { Plane } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { SlimeMoldShaderMaterial } from "./SlimeMoldShaderMaterial";
import { HEIGHT, WIDTH } from "./consts";
import useGPGPU from "./useGPGPU";

extend({ SlimeMoldShaderMaterial });

const trailDisplayUniforms = {
  uScreenResolution: {
    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
  },
  uPlaneResolution: { value: new THREE.Vector2(WIDTH, HEIGHT) },
  uGlPositionScale: { value: 1.0 },
};

export default function SlimeMold() {
  const { agentDataTexture, trailDataTexture } = useGPGPU();

  // @ts-expect-error It doesn't like the experimentShaderMaterial.
  const shaderMaterialRef = useRef<experimentShaderMaterial>(null!);
  const trailPlaneMaterialRef = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(({ clock }) => {
    shaderMaterialRef.current.uTime = clock.getElapsedTime();
    shaderMaterialRef.current.uScreenResolution = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight,
    );
    shaderMaterialRef.current.uGlPositionScale = Math.min(
      window.innerWidth / WIDTH,
      window.innerHeight / HEIGHT,
    );

    trailDisplayUniforms.uScreenResolution.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight,
    );
    trailDisplayUniforms.uGlPositionScale.value = Math.min(
      window.innerWidth / WIDTH,
      window.innerHeight / HEIGHT,
    );

    trailPlaneMaterialRef.current.map = trailDataTexture.current;
  });

  return (
    <>
      <Plane>
        <meshBasicMaterial
          ref={trailPlaneMaterialRef}
          onBeforeCompile={(shader) => {
            shader.uniforms.uScreenResolution =
              trailDisplayUniforms.uScreenResolution;
            shader.uniforms.uPlaneResolution = new THREE.Uniform(
              new THREE.Vector2(WIDTH, HEIGHT),
            );
            shader.uniforms.uGlPositionScale =
              trailDisplayUniforms.uGlPositionScale;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /*glsl*/ `
              #include <common>
              uniform vec2 uScreenResolution;
              uniform vec2 uPlaneResolution;
              uniform float uGlPositionScale;`,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <fog_vertex>",
              /*glsl*/ `
              #include <fog_vertex>
              gl_Position = vec4(position, 1.0) * vec4(uScreenResolution.y / uScreenResolution.x * uPlaneResolution.x / uPlaneResolution.y, 1.0, 1.0, 1.0);

              gl_Position.xy *= uGlPositionScale * 1.85;
              `,
            );
          }}
          map={trailDataTexture.current}
          transparent={true}
        />
      </Plane>
      <Plane visible={false}>
        <slimeMoldShaderMaterial
          ref={shaderMaterialRef}
          uTime={0}
          uScreenResolution={
            new THREE.Vector2(window.innerWidth, window.innerHeight)
          }
          uPlaneResolution={new THREE.Vector2(WIDTH, HEIGHT)}
          uGlPositionScale={Math.min(
            window.innerWidth / WIDTH,
            window.innerHeight / HEIGHT,
          )}
        />
      </Plane>
    </>
  );
}
