/**
 * Props to wtshm for the original code that this is based on.
 * https://codesandbox.io/p/sandbox/admiring-christian-nnxq97
 */

import { Plane } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import voxelSizeFragmentShader from "../shaders/voxelSize/voxelSize.frag";
import voxelSizeVertexShader from "../shaders/voxelSize/voxelSize.vert?raw";
import useGPGPUVoxelInstancedMesh from "../useGPGPUVoxelInstancedMesh";
import {
    numVoxels,
    textureHeight,
    textureWidth,
    voxelSize,
    voxelsPerAxis,
} from "../voxelConsts";

const voxelUniforms = {
    uTextureSize: { value: new THREE.Texture() },
    uNumVoxels: { value: numVoxels },
    uVoxelSize: { value: voxelSize },
    uVoxelsPerAxis: { value: voxelsPerAxis },
};

export default function VoxelInstancedMesh() {
    const { textureSize } = useGPGPUVoxelInstancedMesh();

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
            new THREE.InstancedBufferAttribute(references, 2)
        );

        return geometry;
    }, []);

    const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
    const planeRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
        if (instancedMeshRef.current) {
            const instanceColors = ["#ee5599", "#bb4422"].map((hex) =>
                new THREE.Color(hex).convertSRGBToLinear()
            );
            let offsetI: number;
            for (let i = 0; i < numVoxels; i++) {
                offsetI = ~~(i + (voxelsPerAxis - 1) / 2);
                instancedMeshRef.current.setMatrixAt(
                    i,
                    new THREE.Matrix4().setPosition(
                        (i % voxelsPerAxis) - (voxelsPerAxis - 1) / 2,
                        ~~(i / voxelsPerAxis ** 2) - (voxelsPerAxis - 1) / 2,
                        ~~((i / voxelsPerAxis) % voxelsPerAxis) -
                            (voxelsPerAxis - 1) / 2
                    )
                );
                instancedMeshRef.current.setColorAt(
                    i,
                    instanceColors[
                        ~~(Math.pow(Math.random(), 2) * instanceColors.length)
                    ]
                );
            }
            instancedMeshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, []);

    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ camera }, delta) => {
        if (instancedMeshRef.current && textureSize.current) {
            voxelUniforms.uTextureSize.value = textureSize.current;
        }
        if (planeRef.current && textureSize.current) {
            planeRef.current.material.map = textureSize.current;
            planeRef.current.lookAt(camera.position);
        }
        if (groupRef.current) {
            // groupRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <>
            <Plane
                ref={planeRef}
                position={[0, voxelsPerAxis / 2 + 1, 0]}
            >
                <meshBasicMaterial
                    map={textureSize.current}
                    onBeforeCompile={(shader) => {
                        shader.vertexShader = shader.vertexShader.replace(
                            "#include <project_vertex>",
                            /* glsl */ `
                            #include <project_vertex>
                            gl_Position = vec4(position, 1.0) * vec4(0.4, 0.4, 1.0, 1.0) + vec4(0.8, 0.8, 0.0, 0.0);
                        `
                        );
                    }}
                />
            </Plane>
            <group ref={groupRef}>
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
                            shader.uniforms.uTextureSize =
                                voxelUniforms.uTextureSize;
                            shader.uniforms.uNumVoxels =
                                voxelUniforms.uNumVoxels;
                            shader.uniforms.uVoxelSize =
                                voxelUniforms.uVoxelSize;
                            shader.uniforms.uVoxelsPerAxis =
                                voxelUniforms.uVoxelsPerAxis;
                            shader.vertexShader = shader.vertexShader.replace(
                                "#include <common>",
                                /* glsl */ `
                                #include <common>

                                uniform sampler2D uTextureSize;
                                uniform int uNumVoxels;
                                uniform float uVoxelSize;
                                uniform int uVoxelsPerAxis;

                                attribute vec2 aReference;
                                `
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
                                `
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
                            `
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
                            `
                            );
                        }}
                    />
                </instancedMesh>
            </group>
        </>
    );
}
