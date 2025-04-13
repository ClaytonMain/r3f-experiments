import { OrbitControls, Stage, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import Footer from "../../components/Footer";
import InfinityMirror from "./InfinityMirror";

export default function InfinityMirrorScene() {
  const backgroundColor = "#18042b";

  useEffect(() => {
    document.title = "Infinity Mirror";
    document.body.style.background = backgroundColor;
  }, []);

  return (
    <>
      <Canvas
        gl={{
          preserveDrawingBuffer: true,
          toneMappingExposure: 1.5,
        }}
        className="touch-none"
        dpr={Math.min(window.devicePixelRatio, 2)}
        shadows
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [0, 3, 4],
        }}
        style={{ background: backgroundColor }}
      >
        <Suspense fallback={null}>
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.3}
            enablePan={false}
            minDistance={0.11}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2 - 0.1}
          />
          {/* <ambientLight color={"#fff"} intensity={0.5} /> */}
          <Stage environment={"warehouse"} preset={"portrait"} intensity={1.0}>
            <InfinityMirror />
          </Stage>
          <Stats />
        </Suspense>
      </Canvas>
      <Footer />
    </>
  );
}
