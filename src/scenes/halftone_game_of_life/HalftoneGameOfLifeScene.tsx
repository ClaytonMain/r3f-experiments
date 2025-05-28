import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import Footer from "../../components/Footer";
import HalftoneGameOfLife from "./HalftoneGameOfLife";

export default function HalftoneGameOfLifeScene() {
  const backgroundColor = "#fff";

  useEffect(() => {
    document.title = "Halftone Game of Life Scene";
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
        dpr={1}
        shadows
        camera={{
          fov: 45,
          near: 0.001,
          far: 20,
          position: [0, 0, 8],
        }}
        style={{ background: backgroundColor }}
      >
        <Suspense fallback={null}>
          <OrbitControls />
          <ambientLight color={"#fff"} intensity={0.5} />
          <HalftoneGameOfLife />
          <Stats />
        </Suspense>
      </Canvas>
      <Footer information={"I really had hoped this would look cooler..."} />
    </>
  );
}
