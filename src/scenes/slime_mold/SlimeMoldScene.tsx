import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Bloom,
  ColorAverage,
  EffectComposer,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense, useEffect } from "react";
import Footer from "../../components/Footer";
import SlimeMold from "./SlimeMold";

export default function SlimeMoldScene() {
  const backgroundColor = "#18042b";

  useEffect(() => {
    document.title = "Slime Mold Scene";
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
        dpr={1.0}
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
          <ambientLight color={"#fff"} intensity={1.0} />
          <SlimeMold />
          <Stats />
        </Suspense>
        <EffectComposer>
          {/* <ColorAverage blendFunction={BlendFunction.ADD} /> */}
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
