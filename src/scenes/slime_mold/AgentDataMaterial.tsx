import * as THREE from "three";
import { DEFAULT_AGENT_DATA_UNIFORMS } from "./consts";
import fragmentShader from "./shaders/agentData/agentData.frag";
import vertexShader from "./shaders/agentData/agentData.vert";

function getData(width: number, height: number) {
  const data = new Float32Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const i4 = i * 4;
    data[i4 + 0] = Math.random();
    data[i4 + 1] = Math.random();
    data[i4 + 2] = Math.random();
    data[i4 + 3] = 1.0;
  }
  return data;
}

class AgentDataMaterial extends THREE.ShaderMaterial {
  constructor(width: number, height: number) {
    const agentDataTexture = new THREE.DataTexture(
      getData(width, height),
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    agentDataTexture.needsUpdate = true;

    const agentDataUniforms = {
      ...DEFAULT_AGENT_DATA_UNIFORMS,
      uAgentDataTexture: { value: agentDataTexture },
    };

    super({
      uniforms: agentDataUniforms,
      vertexShader,
      fragmentShader,
    });
  }
}

export default AgentDataMaterial;
