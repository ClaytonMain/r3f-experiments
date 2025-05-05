import { Plane, useFBO } from "@react-three/drei";
import { createPortal, extend, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import AgentMaterial from "./AgentMaterial";

import {
  DISPLAY_TEXTURE_HEIGHT,
  DISPLAY_TEXTURE_WIDTH,
  GPU_TEXTURE_HEIGHT,
  GPU_TEXTURE_WIDTH,
} from "./consts";
import trailFragmentShader from "./shaders/trail/trail.frag";
import trailVertexShader from "./shaders/trail/trail.vert";

extend({ AgentMaterial });

// Credit to Maxime Heckel for their layout described in this blog post
// upon which this file is based:
// https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

// Also credit to this person for the idea of using points for the trail:
// https://kaesve.nl/projects/mold/summary.html

function FBOSlimeMold() {
  const trailRef = useRef<THREE.Points>(null);
  const agentMaterialRef = useRef<AgentMaterial>(null);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    1 / Math.pow(2, 53),
    1,
  );
  const positions = new Float32Array([
    -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
  ]);
  const uvs = new Float32Array([
    0,
    0, // bottom-left
    1,
    0, // bottom-right
    1,
    1, // top-right
    0,
    0, // bottom-left
    1,
    1, // top-right
    0,
    1, // top-left
  ]);

  const agentRenderTarget = useFBO(GPU_TEXTURE_WIDTH, GPU_TEXTURE_HEIGHT, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
  });

  const agentPositionAttributes = useMemo(() => {
    const length = GPU_TEXTURE_WIDTH * GPU_TEXTURE_HEIGHT;
    // Does this need to be length * 3?
    const attributes = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      const i3 = i * 3;
      attributes[i3 + 0] = (i % GPU_TEXTURE_WIDTH) / GPU_TEXTURE_WIDTH;
      attributes[i3 + 1] =
        Math.floor(i / GPU_TEXTURE_WIDTH) / GPU_TEXTURE_HEIGHT;
      // attributes[i3 + 2] = 0;
    }
    return attributes;
  }, []);

  const trailUniforms = useMemo(() => {
    return {
      uAgentPositions: {
        value: null,
      },
    };
  }, []);

  useFrame(({ gl, clock }) => {
    gl.setRenderTarget(agentRenderTarget);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    trailRef.current!.material.uniforms.uAgentPositions.value =
      agentRenderTarget.texture;

    // agentMaterialRef.current!.uniforms.uTime.value = clock.elapsedTime;

    // console.log(trailRef.current!.material);
  });

  return (
    <>
      {createPortal(
        <mesh>
          <agentMaterial
            ref={agentMaterialRef}
            args={[GPU_TEXTURE_WIDTH, GPU_TEXTURE_HEIGHT]}
          />
          <bufferGeometry>
            <bufferAttribute
              args={[positions, 3]}
              attach="attributes-position"
              array={positions}
              count={positions.length / 3}
              itemSize={3}
            />
            <bufferAttribute
              args={[uvs, 2]}
              attach="attributes-uv"
              array={uvs}
              count={uvs.length / 2}
              itemSize={2}
            />
          </bufferGeometry>
        </mesh>,
        scene,
      )}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            args={[agentPositionAttributes, 3]}
            attach="attributes-position"
            array={agentPositionAttributes}
            count={agentPositionAttributes.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          uniforms={trailUniforms}
          vertexShader={trailVertexShader}
          fragmentShader={trailFragmentShader}
        />
      </points>
    </>
  );
}

export default FBOSlimeMold;
