import * as THREE from "three";
import { DISPLAY_TEXTURE_HEIGHT, DISPLAY_TEXTURE_WIDTH } from "./consts";
import fragmentShader from "./shaders/agentData/agentData.frag";
import vertexShader from "./shaders/agentData/agentData.vert";

function getData(width: number, height: number) {
  const data = new Float32Array(width * height * 4);
  const choice = Math.floor(Math.random() * 6);
  for (let i = 0; i < width * height; i++) {
    let x = 0.0;
    let y = 0.0;
    let z = 0.0;

    if (choice === 0) {
      x = Math.random();
      y = Math.random();
      z = Math.random();
    } else if (choice === 1) {
      x = Math.random();
      y = Math.random();
      z = Math.atan2(y * 2 - 1, x * 2 - 1) / Math.PI;
    } else if (choice === 2) {
      x = 0.5;
      y = 0.5;
      z = Math.random();
    } else if (choice === 3) {
      z = Math.random();
      x =
        0.5 +
        (Math.cos(z * Math.PI * 2) * 0.4 * DISPLAY_TEXTURE_HEIGHT) /
          DISPLAY_TEXTURE_WIDTH;
      y = 0.5 + Math.sin(z * Math.PI * 2) * 0.4;
      if (Math.random() > 0.1) {
        z = (z + 0.5) % 1;
      }
    } else if (choice === 4) {
      const p = Math.random();
      const r = Math.random() * 0.4;
      x =
        0.5 +
        (Math.cos(p * Math.PI * 2) * r * DISPLAY_TEXTURE_HEIGHT) /
          DISPLAY_TEXTURE_WIDTH;
      y = 0.5 + Math.sin(p * Math.PI * 2) * r;
      z = Math.random();
    } else if (choice === 5) {
      x = Math.round(Math.random() * 2) * 0.5;
      y = Math.round(Math.random() * 2) * 0.5;
      z = Math.random();
    }

    const i4 = i * 4;
    data[i4 + 0] = x;
    data[i4 + 1] = y;
    data[i4 + 2] = z;
    data[i4 + 3] = 1.0;
  }
  return data;
}

class AgentDataMaterial extends THREE.ShaderMaterial {
  constructor(
    width: number,
    height: number,
    uniforms: { [uniform: string]: THREE.IUniform },
  ) {
    const agentDataTexture = new THREE.DataTexture(
      getData(width, height),
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    agentDataTexture.needsUpdate = true;

    const agentDataUniforms = {
      ...uniforms,
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
