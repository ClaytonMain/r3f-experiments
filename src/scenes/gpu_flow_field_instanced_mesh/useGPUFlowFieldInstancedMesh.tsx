/**
 * Props to wtshm for the original useGPGPU hook that this is based on.
 * https://codesandbox.io/p/sandbox/admiring-christian-nnxq97
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import {
    numVoxels,
    textureHeight,
    textureWidth,
    voxelSize,
    voxelsPerAxis,
} from "./consts";
import voxelsSizeShader from "./shaders/gpgpu/size.glsl";

export default function useGPUFlowFieldInstancedMesh() {
    const gl = useThree((state) => state.gl);

    const textureSizeRef = useRef<THREE.Texture>();

    const gpgpu = useMemo(() => {
        const computation = new GPUComputationRenderer(
            textureWidth,
            textureHeight,
            gl
        );

        const textureSize = computation.createTexture();

        const sizeArray = textureSize.image.data as Float32Array;

        for (let i = 0; i < numVoxels; i++) {
            const i4 = i * 4;
            sizeArray[i4 + 0] = voxelSize;
            sizeArray[i4 + 1] = voxelSize;
            sizeArray[i4 + 2] = voxelSize;
            sizeArray[i4 + 3] = 1.0;
        }

        const textureDefaultSize = textureSize.clone();

        const sizeVariable = computation.addVariable(
            "textureSize",
            voxelsSizeShader,
            textureSize
        );

        computation.setVariableDependencies(sizeVariable, [sizeVariable]);

        textureSizeRef.current = textureSize;

        sizeVariable.material.uniforms.uTime = { value: 0.0 };
        sizeVariable.material.uniforms.uDelta = { value: 0.0 };
        sizeVariable.material.uniforms.uMouse3d = {
            value: new THREE.Vector3(),
        };
        sizeVariable.material.uniforms.uTextureDefaultSize = {
            value: textureDefaultSize,
        };
        sizeVariable.material.uniforms.voxelsPerAxis = { value: voxelsPerAxis };

        return {
            computation,
            sizeVariable,
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

        gpgpu.sizeVariable.material.uniforms.uTime.value = clock.elapsedTime;
        gpgpu.sizeVariable.material.uniforms.uDelta.value = deltaRatio;
        gpgpu.sizeVariable.material.uniforms.uMouse3d.value.copy(mousePosition);
        gpgpu.computation.compute();

        textureSizeRef.current = gpgpu.computation.getCurrentRenderTarget(
            gpgpu.sizeVariable
        ).texture;
    });

    return {
        textureSize: textureSizeRef,
    };
}
