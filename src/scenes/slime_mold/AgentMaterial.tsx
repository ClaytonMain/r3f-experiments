import * as THREE from "three";
import { DEFAULT_AGENT_UNIFORMS } from "./consts";
import fragmentShader from "./shaders/agent/agent.frag";
import vertexShader from "./shaders/agent/agent.vert";

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

class AgentMaterial extends THREE.ShaderMaterial {
  constructor(width: number, height: number) {
    const agentTexture = new THREE.DataTexture(
      getData(width, height),
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    agentTexture.needsUpdate = true;

    const agentUniforms = {
      ...DEFAULT_AGENT_UNIFORMS,
      uAgentTexture: { value: agentTexture },
    };

    super({
      uniforms: agentUniforms,
      vertexShader,
      fragmentShader,
    });
  }
}

export default AgentMaterial;
