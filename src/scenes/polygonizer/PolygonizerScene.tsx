import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useEffect } from "react";
import Footer from "../../components/Footer";
import Polygonizer from "./Polygonizer";

export default function PolygonizerScene() {
  const backgroundColor = "#18042b";

  useEffect(() => {
    document.title = "Polygonizer";
    document.body.style.background = backgroundColor;
  }, []);

  const { autoRotate, autoRotateSpeed } = useControls("Camera", {
    autoRotate: true,
    autoRotateSpeed: {
      value: 0.5,
      min: -5,
      max: 5,
      step: 0.1,
    },
  });

  return (
    <>
      <Canvas
        gl={{
          preserveDrawingBuffer: true,
          toneMappingExposure: 1.5,
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        shadows
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [0, 5, 8],
        }}
        style={{ background: backgroundColor }}
      >
        <Suspense fallback={null}>
          {/* <axesHelper args={[1]} /> */}
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
          />
          {/* <ambientLight color={"#fff"} intensity={0.5} /> */}
          {/* <directionalLight
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
            position={[10, 30, 20]}
          /> */}
          <Polygonizer />
          <Stats />
        </Suspense>
      </Canvas>
      <Footer />
    </>
  );
}
