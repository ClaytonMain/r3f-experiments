import { ChangeEvent, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { DEFAULT_SCENE, SCENES } from "../shared/consts";
import { ValidScene } from "../shared/types";

export default function Footer() {
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
    <div className="fixed bottom-0 left-0 z-20 mt-4 flex w-full justify-center bg-slate-100/70 p-5 backdrop-blur-md dark:bg-slate-800/70">
      <form className="mx-auto max-w-sm">
        <label
          htmlFor="scene"
          className="text-md mb-2 block text-center font-medium text-slate-900 dark:text-slate-50"
        >
          Scene
        </label>
        <select
          onChange={handleSceneChange}
          value={sceneRef.current}
          id="scene"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        >
          <option value="gpu_flow_field_instanced_mesh">
            GPU Flow Field Instanced Mesh
          </option>
          <option value="mesh_surface_game_of_life">
            Mesh Surface Game of Life
          </option>
          <option value="attractor">Attractor</option>
          <option value="polygonizer">Polygonizer</option>
        </select>
      </form>
    </div>
  );
}
