/**
 * Props to wtshm for the original code that this is based on.
 * https://codesandbox.io/p/sandbox/admiring-christian-nnxq97
 */

import { Plane } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  numVoxels,
  textureHeight,
  textureWidth,
  voxelSize,
  voxelsPerAxis,
} from "./consts";
import useGPGPUVoxelInstancedMesh from "./useGPUFlowFieldInstancedMesh";

const voxelUniforms = {
  uTextureSize: { value: new THREE.Texture() },
  uNumVoxels: { value: numVoxels },
  uVoxelSize: { value: voxelSize },
  uVoxelsPerAxis: { value: voxelsPerAxis },
};

const texturePlaneUniforms = {
  uResolution: new THREE.Uniform(new THREE.Vector2(800, 800)),
};

export default function GPUFlowFieldInstancedMesh() {
  const { textureSize } = useGPGPUVoxelInstancedMesh();
  const viewport = useThree((state) => state.viewport);

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const planeRef = useRef<THREE.Mesh>(null);

  const voxelsGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
    const references = new Float32Array(numVoxels * 2);

    const maxTextureDimension = Math.max(textureWidth, textureHeight);

    for (let i = 0; i < numVoxels; i++) {
      const i2 = i * 2;
      references[i2 + 0] =
        (i % maxTextureDimension) / (maxTextureDimension - 1);
      references[i2 + 1] =
        ~~(i / maxTextureDimension) / (maxTextureDimension - 1);
    }

    geometry.setAttribute(
      "aReference",
      new THREE.InstancedBufferAttribute(references, 2),
    );

    return geometry;
  }, []);

  useEffect(() => {
    if (instancedMeshRef.current) {
      const instanceColors = ["#ee5599", "#bb4422"].map((hex) =>
        new THREE.Color(hex).convertSRGBToLinear(),
      );
      for (let i = 0; i < numVoxels; i++) {
        instancedMeshRef.current.setMatrixAt(
          i,
          new THREE.Matrix4().setPosition(
            (i % voxelsPerAxis) - (voxelsPerAxis - 1) / 2,
            ~~(i / voxelsPerAxis ** 2) - (voxelsPerAxis - 1) / 2,
            ~~((i / voxelsPerAxis) % voxelsPerAxis) - (voxelsPerAxis - 1) / 2,
          ),
        );
        instancedMeshRef.current.setColorAt(
          i,
          instanceColors[
            ~~(Math.pow(Math.random(), 2) * instanceColors.length)
          ],
        );
      }
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  useEffect(() => {
    if (viewport.width && viewport.height) {
      texturePlaneUniforms.uResolution.value.set(
        viewport.width,
        viewport.height,
      );
    }
  }, [viewport]);

  useFrame(() => {
    if (instancedMeshRef.current && textureSize.current) {
      voxelUniforms.uTextureSize.value = textureSize.current;
    }
    if (planeRef.current && textureSize.current) {
      // @ts-expect-error 'map' does exist.
      planeRef.current.material.map = textureSize.current;
    }
  });

  return (
    <>
      <Plane ref={planeRef}>
        <meshBasicMaterial
          attach="material"
          map={textureSize.current}
          depthTest={false}
          depthWrite={false}
          onBeforeCompile={(shader) => {
            shader.uniforms.uResolution = texturePlaneUniforms.uResolution;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
              #include <common>
              uniform vec2 uResolution;
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              /* glsl */ `
              #include <project_vertex>
              gl_Position = vec4(position, 1.0) * vec4(0.4 * (uResolution.y / uResolution.x), 0.4, 1.0, 1.0) + vec4(1.0 - (0.4 * (uResolution.y / uResolution.x)) * 0.5, 0.8, 0.0, 0.0);
              `,
            );
          }}
        />
      </Plane>
      <instancedMesh
        ref={instancedMeshRef}
        geometry={voxelsGeometry!}
        castShadow
        receiveShadow
        args={[undefined, undefined, numVoxels]}
      >
        <meshStandardMaterial
          attach="material"
          metalness={0.6}
          roughness={0.8}
          // flatShading={true}
          onBeforeCompile={(shader) => {
            shader.uniforms.uTextureSize = voxelUniforms.uTextureSize;
            shader.uniforms.uNumVoxels = voxelUniforms.uNumVoxels;
            shader.uniforms.uVoxelSize = voxelUniforms.uVoxelSize;
            shader.uniforms.uVoxelsPerAxis = voxelUniforms.uVoxelsPerAxis;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
              #include <common>

              uniform sampler2D uTextureSize;
              uniform int uNumVoxels;
              uniform float uVoxelSize;
              uniform int uVoxelsPerAxis;

              attribute vec2 aReference;
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <begin_vertex>",
              /* glsl */ `
              #include <begin_vertex>

              float fNumVoxels = float(uNumVoxels);
              float fVoxelsPerAxis = float(uVoxelsPerAxis);

              vec4 sizeInfo = texture(uTextureSize, aReference);

              sizeInfo = smoothstep(0.0, 1.0, sizeInfo);
              float sizeIn = smoothstep(0.0, 0.1, sizeInfo.x);
              float sizeOut = 1.0 - smoothstep(0.9, 1.0, sizeInfo.x);
              float size = min(sizeIn, sizeOut);

              transformed *= vec3(size);
              `,
            );
          }}
        />
        <meshDepthMaterial
          attach={"customDepthMaterial"}
          depthPacking={THREE.RGBADepthPacking}
          onBeforeCompile={(shader) => {
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
              #include <common>

              uniform sampler2D uTextureSize;
              uniform int uNumVoxels;
              uniform float uVoxelSize;
              uniform int uVoxelsPerAxis;

              attribute vec2 aReference;
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <begin_vertex>",
              /* glsl */ `
              #include <begin_vertex>

              float fNumVoxels = float(uNumVoxels);
              float fVoxelsPerAxis = float(uVoxelsPerAxis);

              vec4 sizeInfo = texture(uTextureSize, aReference);

              sizeInfo = smoothstep(0.0, 1.0, sizeInfo);
              float sizeIn = smoothstep(0.0, 0.1, sizeInfo.x);
              float sizeOut = 1.0 - smoothstep(0.7, 1.0, sizeInfo.x);
              float size = min(sizeIn, sizeOut);

              transformed *= vec3(size);
              `,
            );
          }}
        />
      </instancedMesh>
    </>
  );
}
