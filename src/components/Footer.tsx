import { AnimatePresence, motion } from "motion/react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { DEFAULT_SCENE, SCENES } from "../shared/consts";
import { ValidScene } from "../shared/types";

function Information({ information }: { information?: string | JSX.Element }) {
  const [showInformation, setShowInformation] = useState(false);

  return (
    <>
      <AnimatePresence>
        {showInformation && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed top-0 left-0 z-50 flex h-screen w-full cursor-pointer items-center justify-center bg-slate-600/70"
            onClick={() => setShowInformation(false)}
          >
            <div
              className="flex w-screen items-center rounded-md bg-slate-800 p-3 text-white sm:w-5/6 sm:rounded-2xl sm:p-10 lg:w-4/6 2xl:w-3/6"
              onClick={(e) => e.stopPropagation()}
            >
              {information}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: showInformation ? 1 : 0.5 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowInformation(!showInformation)}
        className="absolute right-5 bottom-10 z-25 cursor-pointer rounded-full bg-slate-800/70 p-1 backdrop-blur-md"
      >
        <svg
          className="h-6 w-6 text-white sm:h-8 sm:w-8"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </motion.div>
    </>
  );
}

export default function Footer({
  information,
}: {
  information?: string | JSX.Element;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const sceneRef = useRef(
    (location.pathname.slice(1) as ValidScene) || DEFAULT_SCENE,
  );

  useEffect(() => {
    const scene = location.pathname.slice(1) as ValidScene;
    if (SCENES.includes(scene)) {
      if (sceneRef.current === scene) return;
      sceneRef.current = scene;
    } else {
      sceneRef.current = DEFAULT_SCENE;
    }
  }, [location]);

  function handleSceneChange(e: ChangeEvent<HTMLSelectElement>) {
    navigate(`/${e.target.value}`);
  }

  return (
    <>
      {information && <Information information={information} />}
      <div className="fixed bottom-0 left-0 z-20 mt-4 flex w-full justify-center bg-slate-800/70 p-5 backdrop-blur-md">
        <form className="mx-auto max-w-sm">
          <label
            htmlFor="scene"
            className="text-md mb-2 block text-center font-medium text-slate-50"
          >
            Scene
          </label>
          <select
            onChange={handleSceneChange}
            value={sceneRef.current}
            id="scene"
            className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="gpu_flow_field_instanced_mesh">
              GPU Flow Field Instanced Mesh
            </option>
            <option value="mesh_surface_game_of_life">
              Mesh Surface Game of Life
            </option>
            <option value="attractor">Attractor</option>
            <option value="polygonizer">Polygonizer</option>
            <option value="light_grid">Light Grid</option>
            <option value="snow">Snow</option>
            <option value="introduction_to_raymarching">
              Introduction to Raymarching
            </option>
            <option value="infinity_mirror">Infinity Mirror</option>
            <option value="menger_sponge">Menger Sponge</option>
          </select>
        </form>
      </div>
    </>
  );
}
