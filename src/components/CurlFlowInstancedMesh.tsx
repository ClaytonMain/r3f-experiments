/**
 * Props to wtshm for the original code that this is based on.
 * https://codesandbox.io/p/sandbox/admiring-christian-nnxq97
 */

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { numParticles, textureHeight, textureWidth } from "../consts";
import useGPGPU from "../useGPGPU";

const particleUniforms = {
    uTexturePosition: { value: new THREE.Texture() },
    uTextureVelocity: { value: new THREE.Texture() },
};

export default function CurlFlowInstancedMesh() {
    const { texturePosition, textureVelocity } = useGPGPU();
    console.log(texturePosition, textureVelocity);

    const particlesGeometry = useMemo(() => {
        const geometry = new THREE.OctahedronGeometry();
        const references = new Float32Array(numParticles * 2);

        const maxTextureDimension = Math.max(textureWidth, textureHeight);

        for (let i = 0; i < numParticles; i++) {
            const i2 = i * 2;
            references[i2 + 0] =
                (i % maxTextureDimension) / (maxTextureDimension - 1);
            // Oh neat. The double tilde is faster than Math.floor (plus some other stuff).
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

    useEffect(() => {
        if (instancedMeshRef.current) {
            const instanceColors = ["#ee5599", "#bb4422"].map((hex) =>
                new THREE.Color(hex).convertSRGBToLinear()
            );
            for (let i = 0; i < numParticles; i++) {
                instancedMeshRef.current.setMatrixAt(i, new THREE.Matrix4());
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

    useFrame(() => {
        if (
            instancedMeshRef.current &&
            texturePosition.current &&
            textureVelocity.current
        ) {
            particleUniforms.uTexturePosition.value = texturePosition.current;
            particleUniforms.uTextureVelocity.value = textureVelocity.current;
        }
    });

    return (
        <>
            <instancedMesh
                ref={instancedMeshRef}
                geometry={particlesGeometry!}
                castShadow
                receiveShadow
                args={[undefined, undefined, numParticles]}
            >
                <meshStandardMaterial
                    attach={"material"}
                    metalness={0.6}
                    roughness={0.8}
                    flatShading={true}
                    onBeforeCompile={(shader) => {
                        shader.uniforms.uTexturePosition =
                            particleUniforms.uTexturePosition;
                        shader.uniforms.uTextureVelocity =
                            particleUniforms.uTextureVelocity;
                        shader.vertexShader = shader.vertexShader.replace(
                            "#include <common>",
                            /* glsl */ `
                            #include <common>
            
                            uniform sampler2D uTexturePosition;
                            uniform sampler2D uTextureVelocity;
            
                            attribute vec2 aReference;
            
                            mat3 getRotation(vec3 velocity) {
                            velocity = normalize(velocity);
                            velocity.z *= -1.;
            
                            float xz = length(velocity.xz);
                            float xyz = 1.;
                            float x = sqrt(1. - velocity.y * velocity.y);
            
                            float cosry = velocity.x / xz;
                            float sinry = velocity.z / xz;
            
                            float cosrz = x / xyz;
                            float sinrz = velocity.y / xyz;
            
                            mat3 maty = mat3(cosry, 0, -sinry, 0, 1, 0, sinry, 0, cosry);
                            mat3 matz = mat3(cosrz, sinrz, 0, -sinrz, cosrz, 0, 0, 0, 1);
            
                            return maty * matz;
                            }`
                        );
                        shader.vertexShader = shader.vertexShader.replace(
                            "#include <beginnormal_vertex>",
                            /* glsl */ `
                            #include <beginnormal_vertex>
            
                            vec4 velocityInfo = texture2D(uTextureVelocity, aReference);
                            mat3 particleRotation = getRotation(velocityInfo.xyz);
                            vec3 particleScale = vec3(
                            min(4.0, 3.0 * length(velocityInfo.xyz)) + 2.0,
                            1.0,
                            1.0
                            );
            
                            objectNormal = normalize(particleRotation * objectNormal / particleScale);`
                        );
                        shader.vertexShader = shader.vertexShader.replace(
                            "#include <begin_vertex>",
                            /* glsl */ `
                            #include <begin_vertex>
            
                            vec4 positionInfo = texture2D(uTexturePosition, aReference);
            
                            transformed *= positionInfo.w * particleScale;
                            transformed = particleRotation * transformed;
                            transformed += positionInfo.xyz;`
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

                            uniform sampler2D uTexturePosition;
                            uniform sampler2D uTextureVelocity;

                            attribute vec2 aReference;

                            mat3 getRotation(vec3 velocity) {
                                velocity = normalize(velocity);
                                velocity.z *= -1.;

                                float xz = length(velocity.xz);
                                float xyz = 1.;
                                float x = sqrt(1. - velocity.y * velocity.y);

                                float cosry = velocity.x / xz;
                                float sinry = velocity.z / xz;

                                float cosrz = x / xyz;
                                float sinrz = velocity.y / xyz;

                                mat3 maty = mat3(cosry, 0, -sinry, 0, 1, 0, sinry, 0, cosry);
                                mat3 matz = mat3(cosrz, sinrz, 0, -sinrz, cosrz, 0, 0, 0, 1);

                                return maty * matz;
                            }`
                        );
                        shader.vertexShader = shader.vertexShader.replace(
                            "#include <begin_vertex>",
                            /* glsl */ `
                            #include <begin_vertex>

                            vec4 positionInfo = texture2D(uTexturePosition, aReference);
                            vec4 velocityInfo = texture2D(uTextureVelocity, aReference);
                            mat3 particleRotation = getRotation(velocityInfo.xyz);
                            vec3 particleScale = vec3(
                                min(4.0, 3.0 * length(velocityInfo.xyz)) + 2.0,
                                1.0,
                                1.0
                            );

                            transformed *= positionInfo.w * particleScale;
                            transformed = particleRotation * transformed;
                            transformed += positionInfo.xyz;`
                        );
                    }}
                />
            </instancedMesh>
        </>
    );
}
