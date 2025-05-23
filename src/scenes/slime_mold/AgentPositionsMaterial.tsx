import * as THREE from "three";
import fragmentShader from "./shaders/agentPositions/agentPositions.frag";
import vertexShader from "./shaders/agentPositions/agentPositions.vert";

function getData(width: number, height: number) {
  const data = new Float32Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const i4 = i * 4;
    data[i4 + 0] = 0.0;
    data[i4 + 1] = 0.0;
    data[i4 + 2] = 0.0;
    data[i4 + 3] = 1.0;
  }
  return data;
}

class AgentPositionsMaterial extends THREE.ShaderMaterial {
  constructor(
    width: number,
    height: number,
    uniforms: { [uniform: string]: THREE.IUniform },
  ) {
    const agentPositionsTexture = new THREE.DataTexture(
      getData(width, height),
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    agentPositionsTexture.needsUpdate = true;

    const agentPositionsUniforms = {
      ...uniforms,
      uAgentPositionsTexture: { value: agentPositionsTexture },
    };

    super({
      uniforms: agentPositionsUniforms,
      vertexShader,
      fragmentShader,
    });
  }
}

export default AgentPositionsMaterial;
