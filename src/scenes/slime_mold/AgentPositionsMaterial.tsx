import * as THREE from "three";
import { getAgentPositionsTexture } from "./dataTextureFunctions";
import fragmentShader from "./shaders/agentPositions/agentPositions.frag";
import vertexShader from "./shaders/agentPositions/agentPositions.vert";

class AgentPositionsMaterial extends THREE.ShaderMaterial {
  constructor(
    displayTextureWidth: number,
    displayTextureHeight: number,
    uniforms: { [uniform: string]: THREE.IUniform },
  ) {
    const agentPositionsTexture = getAgentPositionsTexture(
      displayTextureWidth,
      displayTextureHeight,
    );

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
