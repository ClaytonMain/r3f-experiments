import { Route, Routes } from "react-router";
import "./App.css";
import AttractorScene from "./scenes/attractor/AttractorScene";
import GPUFlowFieldInstancedMeshScene from "./scenes/gpu_flow_field_instanced_mesh/GPUFlowFieldInstancedMeshScene";
import InfinityMirrorScene from "./scenes/infinity_mirror/InfinityMirrorScene";
import IntroductionToRaymarchingScene from "./scenes/introduction_to_raymarching/IntroductionToRaymarchingScene";
import LightGridScene from "./scenes/light_grid/LightGridScene";
import MeshSurfaceGameOfLifeScene from "./scenes/mesh_surface_game_of_life/MeshSurfaceGameOfLifeScene";
import PolygonizerScene from "./scenes/polygonizer/PolygonizerScene";
import SnowScene from "./scenes/snow/SnowScene";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/gpu_flow_field_instanced_mesh"
          element={<GPUFlowFieldInstancedMeshScene />}
        />
        <Route
          path="/mesh_surface_game_of_life"
          element={<MeshSurfaceGameOfLifeScene />}
        />
        <Route path="/attractor" element={<AttractorScene />} />
        <Route path="/polygonizer" element={<PolygonizerScene />} />
        <Route path="/light_grid" element={<LightGridScene />} />
        <Route path="/snow" element={<SnowScene />} />
        <Route
          path="/introduction_to_raymarching"
          element={<IntroductionToRaymarchingScene />}
        />
        <Route path="/infinity_mirror" element={<InfinityMirrorScene />} />
        <Route path="*" element={<AttractorScene />} />
      </Routes>
    </>
  );
}

export default App;
