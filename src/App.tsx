import { Route, Routes } from "react-router";
import "./App.css";
import AttractorScene from "./scenes/attractor/AttractorScene";
import GPUFlowFieldInstancedMeshScene from "./scenes/gpu_flow_field_instanced_mesh/GPUFlowFieldInstancedMeshScene";
import MeshSurfaceGameOfLifeScene from "./scenes/mesh_surface_game_of_life/MeshSurfaceGameOfLifeScene";

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
        <Route path="*" element={<AttractorScene />} />
      </Routes>
    </>
  );
}

export default App;
