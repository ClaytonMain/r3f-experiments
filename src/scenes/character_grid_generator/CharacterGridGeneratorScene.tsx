import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import Footer from "../../components/Footer";
import CharacterGridGenerator from "./CharacterGridGenerator";

export default function CharacterGridGeneratorScene() {
  const backgroundColor = "#18042b";

  useEffect(() => {
    document.title = "Character Grid Generator Scene";
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
          zoom: 25,
          near: 0.1,
          far: 20,
          position: [0, 0, 10],
        }}
        orthographic
        style={{ background: backgroundColor }}
      >
        <Suspense fallback={null}>
          <ambientLight color={"#fff"} intensity={0.5} />
          <CharacterGridGenerator />
          <Stats />
        </Suspense>
      </Canvas>
      <Footer />
    </>
  );
}
