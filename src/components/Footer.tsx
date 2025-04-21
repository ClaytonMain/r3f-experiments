import { AnimatePresence, motion } from "motion/react";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { DEFAULT_SCENE, SCENES } from "../shared/consts";
import { ValidScene } from "../shared/types";

function Information({
  information,
  setShowInformation,
  header,
}: {
  information?: string | React.JSX.Element;
  setShowInformation: Dispatch<SetStateAction<boolean>>;
  header?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-0 left-0 z-50000 flex h-screen w-full cursor-pointer items-center justify-center bg-slate-600/70"
      onClick={() => setShowInformation(false)}
    >
      <div className="h-1/2 w-full max-w-2xl cursor-auto p-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          className="relative max-h-full overflow-y-auto rounded-lg bg-slate-800 shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-between rounded-t border-b border-slate-600 bg-slate-800 p-4 md:p-5">
            {header && (
              <h3 className="text-xl font-semibold text-white">{header}</h3>
            )}
            <button
              type="button"
              className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-slate-400 hover:bg-slate-600 hover:text-white"
              onClick={() => setShowInformation(false)}
            >
              <svg
                className="h-3 w-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="space-y-4 p-4 md:p-5">{information}</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Footer({
  information,
  header,
}: {
  information?: string | React.JSX.Element;
  header?: string;
}) {
  const [showInformation, setShowInformation] = useState(false);
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
      <AnimatePresence>
        {information && showInformation && (
          <Information
            information={information}
            setShowInformation={setShowInformation}
            header={header}
          />
        )}
      </AnimatePresence>
      <div className="fixed bottom-0 left-0 z-20 mt-4 flex w-full items-center justify-center bg-slate-800/70 p-5 backdrop-blur-md">
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
            className="w-full flex-grow rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
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
            <option value="slime_mold">Slime Mold</option>
          </select>
        </form>
        {information && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: showInformation ? 1 : 0.5 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowInformation(!showInformation)}
            className="cursor-pointer rounded-full bg-slate-800/70 p-1 backdrop-blur-md"
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
        )}
      </div>
    </>
  );
}
