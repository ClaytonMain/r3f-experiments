import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo } from "react";
import Footer from "../../components/Footer";
import SlimeMold from "./SlimeMold";

export default function SlimeMoldScene() {
  const backgroundColor = useMemo(() => "#060808", []);

  useEffect(() => {
    document.title = "Slime Mold Scene";
    document.body.style.background = backgroundColor;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Canvas
        gl={{
          preserveDrawingBuffer: true,
          toneMappingExposure: 1.5,
        }}
        className="touch-none"
        dpr={1.0}
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [0, 0, 8],
        }}
        style={{ background: backgroundColor }}
      >
        <Suspense fallback={null}>
          <ambientLight color={"#fff"} intensity={1.0} />
          <SlimeMold />
          <Stats />
        </Suspense>
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.0}
            luminanceSmoothing={0.9}
            height={300}
          />
        </EffectComposer>
      </Canvas>
      <Footer />
    </>
  );
}
