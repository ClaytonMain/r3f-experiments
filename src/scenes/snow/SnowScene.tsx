import { KeyboardControls, OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import Footer from "../../components/Footer";
import Snow from "./Snow";
import { Controls } from "./types";

type KeyboardControlsEntry<T extends string = string> = {
  /** Name of the action */
  name: T;
  /** The keys that define it, you can use either event.key, or event.code */
  keys: string[];
  /** If the event receives the keyup event, true by default */
  up?: boolean;
};

export default function SnowScene() {
  const backgroundColor = "#18042b";

  useEffect(() => {
    document.title = "Snow";
    document.body.style.background = backgroundColor;
  }, []);

  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.backward, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.jump, keys: ["Space"] },
      { name: Controls.reset, keys: ["KeyR"] },
    ],
    [],
  );
  const lightRef = useRef<THREE.DirectionalLight>(null);
  useControls({
    shadowNormalBias: {
      value: 0.4,
      min: 0,
      max: 1.0,
      step: 0.1,
      onChange: (value) => {
        if (lightRef.current) {
          lightRef.current.shadow.normalBias = value / 10;
        }
      },
    },
  });

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
          // fov: 45,
          zoom: 25,
          near: 0.1,
          far: 200,
          position: [15, 15, 15],
        }}
        style={{ background: backgroundColor }}
        orthographic
      >
        <Suspense fallback={null}>
          <OrbitControls makeDefault />
          <ambientLight color={"#fff"} intensity={0.5} />
          <directionalLight
            ref={lightRef}
            color={"#fff"}
            intensity={3}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={1}
            shadow-camera-far={100}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            position={[10, 30, 20]}
            shadow-normalBias={0.04}
            // shadow-bias={-0.004}
          />
          <KeyboardControls map={map}>
            <Snow />
          </KeyboardControls>
          <Stats />
        </Suspense>
      </Canvas>
      <Footer />
    </>
  );
}
