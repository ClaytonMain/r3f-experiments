import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "react-router";
import Footer from "../../components/Footer";
import Attractor from "./Attractor";

function FooterInformation() {
  return (
    <div className="flex flex-col gap-y-3 indent-6 text-white">
      <p>
        These are various{" "}
        <a
          href="https://en.wikipedia.org/wiki/Attractor"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Attractors
        </a>{" "}
        simulated using GPGPU. Most, if not all, of the formulas for these
        attractors are from{" "}
        <a
          href="https://www.dynamicmath.xyz/strange-attractors/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          this article
        </a>{" "}
        by Juan Carlos Ponce Campuzano.
      </p>
      <p>
        I wanted to get a little more experience using GPGPU inside of R3F, and
        attractors seemed like a fun way to do that.
      </p>
      <p>
        There are a few issues that can cause some lag, such as allowing too
        many particles to overlap, but overall I'm fairly pleased with how
        decently it runs.
      </p>
      <div className="w-full text-end text-sm text-slate-300">
        Originally added: Mar. 2025
      </div>
    </div>
  );
}

export default function AttractorScene() {
  const backgroundColor = "#18042b";
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Attractor";
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
          position: [0, 1, 2],
        }}
        style={{ background: backgroundColor }}
      >
        <Suspense fallback={null}>
          {/* <axesHelper args={[1]} /> */}
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
          />
          <ambientLight color={"#fff"} intensity={0.5} />
          <directionalLight
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
          />
          <Attractor
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
          <Stats />
        </Suspense>
      </Canvas>
      <Footer information={<FooterInformation />} header="About" />
    </>
  );
}
