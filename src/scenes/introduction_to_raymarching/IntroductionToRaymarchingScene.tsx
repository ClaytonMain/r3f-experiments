import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import Footer from "../../components/Footer";
import IntroductionToRaymarching from "./IntroductionToRaymarching";

/**
 * Credit to Kishimisu on YouTube for the Introduction to Raymarching tutorial.
 * https://www.youtube.com/watch?v=khblXafu7iA
 */

const DPR = 1.0;

export default function IntroductionToRaymarchingScene() {
  const backgroundColor = "#18042b";

  useEffect(() => {
    document.title = "Introduction To Raymarching";
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
        dpr={DPR}
        shadows
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [0, 0, -2],
        }}
        style={{ background: backgroundColor }}
      >
        <Suspense fallback={null}>
          <OrbitControls />
          <ambientLight color={"#fff"} intensity={0.5} />
          <IntroductionToRaymarching />
          <Stats />
        </Suspense>
      </Canvas>
      <Footer />
    </>
  );
}
