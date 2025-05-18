import * as THREE from "three";
import {
  DEFAULT_AGENT_DATA_UNIFORMS,
  DISPLAY_TEXTURE_HEIGHT,
  DISPLAY_TEXTURE_WIDTH,
} from "./consts";
import fragmentShader from "./shaders/agentData/agentData.frag";
import vertexShader from "./shaders/agentData/agentData.vert";

function getData(width: number, height: number) {
  const data = new Float32Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    // const x = Math.random();
    // const y = Math.random();
    // const z = Math.atan2(y * 2 - 1, x * 2 - 1) / Math.PI;

    // const x = 0.5;
    // const y = 0.5;
    // const z = Math.random();

    let z = Math.random();
    const x =
      0.5 +
      (Math.cos(z * Math.PI * 2) * 0.4 * DISPLAY_TEXTURE_HEIGHT) /
        DISPLAY_TEXTURE_WIDTH;
    const y = 0.5 + Math.sin(z * Math.PI * 2) * 0.4;
    if (Math.random() > 0.1) {
      z = (z + 0.5) % 1;
    }

    // const p = Math.random();
    // const r = Math.random() * 0.4;
    // const x =
    //   0.5 +
    //   (Math.cos(p * Math.PI * 2) * r * DISPLAY_TEXTURE_HEIGHT) /
    //     DISPLAY_TEXTURE_WIDTH;
    // const y = 0.5 + Math.sin(p * Math.PI * 2) * r;
    // const z = Math.random();

    const i4 = i * 4;
    data[i4 + 0] = x;
    data[i4 + 1] = y;
    data[i4 + 2] = z;
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
