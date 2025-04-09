import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import Footer from "../../components/Footer";
import Template from "./Template";

export default function TemplateScene() {
  const backgroundColor = "#18042b";

  useEffect(() => {
    document.title = "Template Scene";
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
          position: [0, 0, 8],
        }}
        style={{ background: backgroundColor }}
      >
        <Suspense fallback={null}>
          <ambientLight color={"#fff"} intensity={0.5} />
          <Template />
          <Stats />
        </Suspense>
      </Canvas>
      <Footer />
    </>
  );
}
