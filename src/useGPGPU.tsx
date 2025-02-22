/**
 * Props to wtshm for the original useGPGPU hook that this is based on.
 * https://codesandbox.io/p/sandbox/admiring-christian-nnxq97
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { numParticles, textureHeight, textureWidth } from "./consts";
import particlesPositionShader from "./shaders/gpgpu/position.glsl";
import particlesVelocityShader from "./shaders/gpgpu/velocity.glsl";

export default function useGPGPU() {
    const gl = useThree((state) => state.gl);

    const texturePositionRef = useRef<THREE.Texture>();
    const textureVelocityRef = useRef<THREE.Texture>();

    const gpgpu = useMemo(() => {
        const computation = new GPUComputationRenderer(
            textureWidth,
            textureHeight,
            gl
        );

        const texturePosition = computation.createTexture();
        const textureVelocity = computation.createTexture();

        const positionArray = texturePosition.image.data as Float32Array;
        const velocityArray = textureVelocity.image.data as Float32Array;
        for (let i = 0; i < numParticles; i++) {
            const i4 = i * 4;

            const r = (0.5 + Math.random() * 0.5) * 50;
            const phi = (Math.random() - 0.5) * Math.PI;
            const theta = Math.random() * Math.PI * 2;
            positionArray[i4 + 0] = r * Math.cos(theta) * Math.cos(phi);
            positionArray[i4 + 1] = r * Math.sin(phi);
            positionArray[i4 + 2] = r * Math.sin(theta) * Math.cos(phi);
            positionArray[i4 + 3] = Math.random();
            velocityArray[i4 + 0] = 0;
            velocityArray[i4 + 1] = 0;
            velocityArray[i4 + 2] = 0;
            velocityArray[i4 + 3] = 0;
        }
        const textureDefaultPosition = texturePosition.clone();

        const positionVariable = computation.addVariable(
            "texturePosition",
            particlesPositionShader,
            texturePosition
        );
        const velocityVariable = computation.addVariable(
            "textureVelocity",
            particlesVelocityShader,
            textureVelocity
        );
        computation.setVariableDependencies(positionVariable, [
            positionVariable,
            velocityVariable,
        ]);
        computation.setVariableDependencies(velocityVariable, [
            positionVariable,
            velocityVariable,
        ]);

        texturePositionRef.current = texturePosition;
        textureVelocityRef.current = textureVelocity;

        positionVariable.material.uniforms.uTime = { value: 0.0 };
        positionVariable.material.uniforms.uDelta = { value: 0.0 };
        positionVariable.material.uniforms.uDieSpeed = { value: 0.013 };
        positionVariable.material.uniforms.uRadius = { value: 0.36 };
        positionVariable.material.uniforms.uMouse3d = {
            value: new THREE.Vector3(),
        };
        positionVariable.material.uniforms.uTextureDefaultPosition = {
            value: textureDefaultPosition,
        };
        velocityVariable.material.uniforms.uTime = { value: 0.0 };
        velocityVariable.material.uniforms.uDelta = { value: 0.0 };
        velocityVariable.material.uniforms.uSpeed = { value: 1.1 };
        velocityVariable.material.uniforms.uAttraction = { value: 1 };
        velocityVariable.material.uniforms.uCurlSize = { value: 0.02 };
        velocityVariable.material.uniforms.uTimeScale = { value: 0.8 };
        velocityVariable.material.uniforms.uMouse3d = {
            value: new THREE.Vector3(),
        };

        return {
            computation,
            positionVariable,
            velocityVariable,
        };
    }, [gl]);

    useLayoutEffect(() => {
        const error = gpgpu.computation.init();
        if (error !== null) {
            console.error(error);
        }
    });

    const [ray] = useState(() => new THREE.Ray());

    useFrame(({ camera, clock, pointer }, delta) => {
        const deltaRatio = 60 * delta;

        ray.origin.copy(camera.position);
        ray.direction
            .set(pointer.x, pointer.y, 0.5)
            .unproject(camera)
            .sub(ray.origin)
            .normalize();
        const mousePosition = new THREE.Vector3();
        mousePosition.copy(ray.direction);
        mousePosition.multiplyScalar(
            ray.origin.length() /
                Math.cos(Math.PI - ray.direction.angleTo(ray.origin))
        );
        mousePosition.add(ray.origin);

        gpgpu.positionVariable.material.uniforms.uTime.value =
            clock.elapsedTime;
        gpgpu.positionVariable.material.uniforms.uDelta.value = deltaRatio;
        gpgpu.positionVariable.material.uniforms.uMouse3d.value.copy(
            mousePosition
        );
        gpgpu.velocityVariable.material.uniforms.uTime.value =
            clock.elapsedTime;
        gpgpu.velocityVariable.material.uniforms.uDelta.value = deltaRatio;
        gpgpu.velocityVariable.material.uniforms.uMouse3d.value.copy(
            mousePosition
        );
        gpgpu.computation.compute();

        texturePositionRef.current = gpgpu.computation.getCurrentRenderTarget(
            gpgpu.positionVariable
        ).texture;
        textureVelocityRef.current = gpgpu.computation.getCurrentRenderTarget(
            gpgpu.velocityVariable
        ).texture;
        // console.log(texturePositionRef.current);
    });

    return {
        texturePosition: texturePositionRef,
        textureVelocity: textureVelocityRef,
    };
}
