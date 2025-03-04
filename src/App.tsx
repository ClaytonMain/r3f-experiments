import "./App.css";
import Footer from "./components/Footer";
import useScene from "./hooks/useScene";
import GPUFlowFieldInstancedMeshScene from "./scenes/gpu_flow_field_instanced_mesh/GPUFlowFieldInstancedMeshScene";
import MeshSurfaceGameOfLifeScene from "./scenes/mesh_surface_game_of_life/MeshSurfaceGameOfLifeScene";

function App() {
  const scene = useScene();

  return (
    <>
      {scene === "gpu_flow_field_instanced_mesh" && (
        <GPUFlowFieldInstancedMeshScene />
      )}
      {scene === "mesh_surface_game_of_life" && <MeshSurfaceGameOfLifeScene />}
      <Footer />
    </>
  );
}

export default App;
