import { OrbitControls, Plane, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { voxelsPerAxis } from "./consts";
import GPUFlowFieldInstancedMesh from "./GPUFlowFieldInstancedMesh";

export default function GPUFlowFieldInstancedMeshScene() {
    return (
        <Canvas
            gl={{
                preserveDrawingBuffer: true,
                toneMappingExposure: 1.5,
            }}
            shadows
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: new THREE.Vector3(
                    voxelsPerAxis * 1.5,
                    voxelsPerAxis * 1.5,
                    voxelsPerAxis * 1.5
                ),
            }}
            style={{ background: "#a4e897" }}
        >
            <Suspense fallback={null}>
                <OrbitControls
                    autoRotate
                    autoRotateSpeed={0.5}
                />
                <Plane
                    args={[100, 100]}
                    position={[0, -16, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    receiveShadow
                >
                    <meshBasicMaterial
                        attach="material"
                        color={"#a4e897"}
                    />
                </Plane>
                <GPUFlowFieldInstancedMesh />
                <ambientLight
                    color={"#fff"}
                    intensity={0.5}
                />
                <directionalLight
                    color={"#fff"}
                    intensity={4}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-near={1}
                    shadow-camera-far={100}
                    shadow-camera-left={-50}
                    shadow-camera-right={50}
                    shadow-camera-top={50}
                    shadow-camera-bottom={-50}
                    position={new THREE.Vector3(10, 30, 20)}
                />
                <Stats />
            </Suspense>
        </Canvas>
    );
}
