import { ChangeEvent } from "react";
import { useSearchParams } from "react-router";
import useScene from "../hooks/useScene";

export default function Footer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scene = useScene();

  function handleSceneChange(e: ChangeEvent<HTMLSelectElement>) {
    searchParams.set("scene", e.target.value);
    setSearchParams(searchParams);
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
          value={scene}
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
        </select>
      </form>
    </div>
  );
}
