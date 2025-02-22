import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import "./App.css";
import CurlFlowInstancedMesh from "./components/CurlFlowInstancedMesh";

function App() {
    const bgColorLinear = new THREE.Color("#222311").convertSRGBToLinear();

    return (
        <>
            <Canvas
                gl={{
                    preserveDrawingBuffer: true,
                    toneMappingExposure: 1.5,
                }}
                shadows
                camera={{
                    fov: 45,
                    near: 10,
                    far: 3000,
                    position: new THREE.Vector3(-300, 60, -300)
                        .normalize()
                        .multiplyScalar(320),
                }}
            >
                <Suspense fallback={null}>
                    <OrbitControls />
                    <CurlFlowInstancedMesh />
                    <mesh
                        rotation-x={-Math.PI / 2}
                        position-y={-40}
                        receiveShadow
                    >
                        <planeGeometry args={[3000, 3000]} />
                        <meshStandardMaterial
                            roughness={1}
                            metalness={0}
                            color={bgColorLinear}
                        />
                    </mesh>
                    <ambientLight
                        color={"#fff"}
                        intensity={0.15}
                    />
                    <directionalLight
                        color={"#fff"}
                        intensity={4}
                        castShadow
                        shadow-mapSize={[2048, 2048]}
                        shadow-camera-near={1}
                        shadow-camera-far={800}
                        shadow-camera-left={-250}
                        shadow-camera-right={250}
                        shadow-camera-top={250}
                        shadow-camera-bottom={-250}
                        position={new THREE.Vector3(-3, 2, -0.35)
                            .normalize()
                            .multiplyScalar(200)}
                    />
                    <fog
                        attach="fog"
                        color={bgColorLinear}
                        near={500}
                        far={800}
                    />
                    <Stats />
                </Suspense>
            </Canvas>
        </>
    );
}

export default App;
