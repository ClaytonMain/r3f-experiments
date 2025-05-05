import { Plane, useFBO } from "@react-three/drei";
import { createPortal, extend, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import AgentMaterial from "./AgentMaterial";
import TrailMaterial from "./TrailMaterial";

import {
  DISPLAY_TEXTURE_HEIGHT,
  DISPLAY_TEXTURE_WIDTH,
  GPU_TEXTURE_HEIGHT,
  GPU_TEXTURE_WIDTH,
} from "./consts";

extend({ AgentMaterial, TrailMaterial });

// Credit to Maxime Heckel for their layout described in this blog post
// upon which this file is based:
// https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

// Also credit to this person for the idea of using points for the trail:
// https://kaesve.nl/projects/mold/summary.html

const texturePlaneUniforms = {
  uResolution: new THREE.Uniform(new THREE.Vector2(800, 800)),
  uShowTexture: new THREE.Uniform(1),
};

function FBOSlimeMold() {
  const viewport = useThree((state) => state.viewport);

  const agentMaterialRef = useRef<AgentMaterial>(null);
  const trailMaterialRef = useRef<TrailMaterial>(null);

  const agentDisplayPlaneRef = useRef<THREE.Mesh>(null);
  const trailDisplayPlaneRef = useRef<THREE.Mesh>(null);

  const agentScene = new THREE.Scene();
  const agentCamera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    1 / Math.pow(2, 53),
    1,
  );
  const trailScene = new THREE.Scene();
  const trailCamera = new THREE.OrthographicCamera(
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
  const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);

  const agentRenderTarget = useFBO(GPU_TEXTURE_WIDTH, GPU_TEXTURE_HEIGHT, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
  });
  const trailRenderTarget = useFBO(
    DISPLAY_TEXTURE_WIDTH,
    DISPLAY_TEXTURE_HEIGHT,
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      type: THREE.FloatType,
    },
  );

  const trailPositionsAttribute = useMemo(() => {
    const length = GPU_TEXTURE_WIDTH * GPU_TEXTURE_HEIGHT;
    // Does this need to be length * 3?
    const attributes = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      const i3 = i * 3;
      attributes[i3 + 0] = (i % GPU_TEXTURE_WIDTH) / GPU_TEXTURE_WIDTH;
      attributes[i3 + 1] =
        Math.floor(i / GPU_TEXTURE_WIDTH) / GPU_TEXTURE_HEIGHT;
      attributes[i3 + 2] = 0;
    }
    return attributes;
  }, []);

  useEffect(() => {
    if (viewport.width && viewport.height) {
      texturePlaneUniforms.uResolution.value.set(
        viewport.width,
        viewport.height,
      );
    }
  }, [viewport]);

  const initializedRef = useRef(false);

  useFrame(({ gl }) => {
    gl.setRenderTarget(agentRenderTarget);
    gl.clear();
    gl.render(agentScene, agentCamera);
    gl.setRenderTarget(null);

    // agentMaterialRef.current!.uniforms.uAgentTexture.value =
    //   agentRenderTarget.texture.clone();
    trailMaterialRef.current!.uniforms.uAgentTexture.value =
      agentRenderTarget.texture.clone();

    gl.setRenderTarget(trailRenderTarget);
    gl.clear();
    gl.render(trailScene, trailCamera);
    gl.setRenderTarget(null);

    agentMaterialRef.current!.uniforms.uTrailTexture.value =
      trailRenderTarget.texture.clone();
    trailMaterialRef.current!.uniforms.uTrailTexture.value =
      trailRenderTarget.texture.clone();

    // gl.setRenderTarget(null);

    if (agentDisplayPlaneRef.current) {
      // @ts-expect-error `map` does exist.
      agentDisplayPlaneRef.current.material.map = agentRenderTarget.texture;
    }
    if (trailDisplayPlaneRef.current) {
      // @ts-expect-error `map` does exist.
      trailDisplayPlaneRef.current.material.map = trailRenderTarget.texture;
    }

    if (!initializedRef.current) {
      agentMaterialRef.current!.uniforms.uInitialized.value = 1;
      trailMaterialRef.current!.uniforms.uInitialized.value = 1;
      initializedRef.current = true;
    }
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
        agentScene,
      )}
      {createPortal(
        <mesh>
          <trailMaterial
            ref={trailMaterialRef}
            args={[DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT]}
          />
          <bufferGeometry>
            <bufferAttribute
              args={[trailPositionsAttribute, 3]}
              attach="attributes-position"
              array={trailPositionsAttribute}
              count={trailPositionsAttribute.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
        </mesh>,
        trailScene,
      )}
      <Plane ref={agentDisplayPlaneRef}>
        <meshBasicMaterial
          attach="material"
          map={agentRenderTarget.texture}
          depthTest={false}
          depthWrite={false}
          onBeforeCompile={(shader) => {
            shader.uniforms.uResolution = texturePlaneUniforms.uResolution;
            shader.uniforms.uShowTexture = texturePlaneUniforms.uShowTexture;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
              #include <common>
              uniform vec2 uResolution;
              uniform float uShowTexture;
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              /* glsl */ `
              #include <project_vertex>
              gl_Position = vec4(position, 1.0) * vec4(0.4 * (uResolution.y / uResolution.x), 0.4, 1.0, 1.0) + vec4(1.0 - (0.4 * (uResolution.y / uResolution.x)) * 0.5, 0.8, 0.0, 0.0);
              gl_Position += vec4(vec3((1.0 - uShowTexture) * 9999.0), 0.0);
              `,
            );
          }}
        />
      </Plane>
      <Plane ref={trailDisplayPlaneRef}>
        <meshBasicMaterial
          attach="material"
          map={trailRenderTarget.texture}
          depthTest={false}
          depthWrite={false}
          onBeforeCompile={(shader) => {
            shader.uniforms.uResolution = texturePlaneUniforms.uResolution;
            shader.uniforms.uShowTexture = texturePlaneUniforms.uShowTexture;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
              #include <common>
              uniform vec2 uResolution;
              uniform float uShowTexture;
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              /* glsl */ `
              #include <project_vertex>
              gl_Position = vec4(position, 1.0) * vec4(0.4 * (uResolution.y / uResolution.x), 0.4, 1.0, 1.0) + vec4(1.0 - (0.4 * (uResolution.y / uResolution.x)) * 0.5, 0.4, 0.0, 0.0);
              gl_Position += vec4(vec3((1.0 - uShowTexture) * 9999.0), 0.0);
              `,
            );
          }}
        />
      </Plane>
    </>
  );
}

export default FBOSlimeMold;
