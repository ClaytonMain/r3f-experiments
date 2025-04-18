import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import Footer from "../../components/Footer";
import MengerSponge from "./MengerSponge";
import { DPR, FOV } from "./consts";

function FooterInformation() {
  return (
    <>
      <div className="flex cursor-auto flex-col indent-6">
        <span className="mb-4 text-center text-2xl font-bold">About</span>
        <p>
          This is a modified{" "}
          <a
            href="https://en.wikipedia.org/wiki/Menger_sponge"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Menger Sponge
          </a>{" "}
          rendered in a fragment shader using raymarching. I'd like to be able
          to create more elaborate fractals, but at the start of this project, I
          didn't have much (any) experience with coding them. I figured the
          Menger Sponge would be a good one to start with, so I walked through{" "}
          <a
            href="https://iquilezles.org/articles/menger/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            this article
          </a>{" "}
          by Iñigo Quilez to try to get a feel for how to code fractals in
          general.
        </p>
        <p>
          While I'm not sure how much of this I can apply to other fractals, it
          was pretty fun to work through. I did have to figure out how to get
          the camera from R3F to play nice with the shader while displaying the
          shader fullscreen (as opposed to the setup in the Infinity Mirror
          scene, which isn't fullscreen), so that was a fun little challenge.
        </p>
        <p>
          I may come back to this at some point and try to make it look better
          and add more options to the panel, but for now I'll leave it as-is.
        </p>
        <div className="mt-3 w-full text-end text-sm text-slate-200">
          Originally added: Apr 2025
        </div>
      </div>
    </>
  );
}

export default function MengerSpongeScene() {
  const backgroundColor = "#18042b";

  useEffect(() => {
    document.title = "Menger Sponge";
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
          fov: FOV,
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
            // maxPolarAngle={Math.PI / 2 - 0.1}
          />
          {/* <ambientLight color={"#fff"} intensity={0.5} /> */}
          {/* <Stage environment={"warehouse"} preset={"portrait"} intensity={1.0}> */}
          <MengerSponge />
          {/* </Stage> */}
          <Stats />
        </Suspense>
      </Canvas>
      <Footer information={<FooterInformation />} />
    </>
  );
}
