import { Plane, useFBO } from "@react-three/drei";
import { createPortal, extend, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import AgentDataMaterial from "./AgentDataMaterial";
import AgentPositionsMaterial from "./AgentPositionsMaterial";
import {
  DISPLAY_TEXTURE_HEIGHT,
  DISPLAY_TEXTURE_WIDTH,
  GPU_TEXTURE_HEIGHT,
  GPU_TEXTURE_WIDTH,
} from "./consts";
import trailDisplayFragmentShader from "./shaders/trailDisplay/trailDisplay.frag";
import trailDisplayVertexShader from "./shaders/trailDisplay/trailDisplay.vert";

extend({ AgentDataMaterial, AgentPositionsMaterial });

// Credit to Maxime Heckel for their layout described in this blog post
// upon which this file is based:
// https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

// Also credit to this person for the idea of using points for the trail:
// https://kaesve.nl/projects/mold/summary.html

const texturePlaneUniforms = {
  uResolution: new THREE.Uniform(new THREE.Vector2(800, 800)),
  uShowTexture: new THREE.Uniform(1),
};

const trailDisplayUniforms = {
  uScreenResolution: new THREE.Uniform(new THREE.Vector2(800, 800)),
  uPlaneResolution: new THREE.Uniform(
    new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  ),
  uGlPositionScale: new THREE.Uniform(1),
  uAgentPositionsTexture: new THREE.Uniform(null),
};

function FBOSlimeMold() {
  const viewport = useThree((state) => state.viewport);

  const agentDataMaterialRefA = useRef<AgentDataMaterial>(null);
  const agentDataMaterialRefB = useRef<AgentDataMaterial>(null);
  const agentPositionsMaterialRef = useRef<AgentPositionsMaterial>(null);

  const trailPlaneMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const agentDataDisplayPlaneOneRef = useRef<THREE.Mesh>(null);
  const agentDataDisplayPlaneTwoRef = useRef<THREE.Mesh>(null);
  const agentPositionsDisplayPlaneRef = useRef<THREE.Mesh>(null);

  const agentDataSceneA = new THREE.Scene();
  const agentDataSceneB = new THREE.Scene();
  const agentDataCamera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    1 / Math.pow(2, 53),
    1,
  );
  const agentPositionsScene = new THREE.Scene();
  const agentPositionsCamera = new THREE.OrthographicCamera(
    0,
    DISPLAY_TEXTURE_WIDTH,
    DISPLAY_TEXTURE_HEIGHT,
    0,
    1 / Math.pow(2, 53),
    1,
  );

  const positions = new Float32Array([
    -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
  ]);
  const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);

  const agentDataRenderTargetA = useFBO(GPU_TEXTURE_WIDTH, GPU_TEXTURE_HEIGHT, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
  });
  const agentDataRenderTargetB = useFBO(GPU_TEXTURE_WIDTH, GPU_TEXTURE_HEIGHT, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
  });
  const agentPositionsRenderTarget = useFBO(
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

  const agentPositionsAttribute = useMemo(() => {
    const length = GPU_TEXTURE_WIDTH * GPU_TEXTURE_HEIGHT;
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

  useEffect(() => {
    if (trailPlaneMaterialRef.current) {
      trailPlaneMaterialRef.current.uniforms.uScreenResolution.value =
        new THREE.Vector2(window.innerWidth, window.innerHeight);
      trailPlaneMaterialRef.current.uniforms.uGlPositionScale.value = Math.min(
        window.innerWidth / DISPLAY_TEXTURE_WIDTH,
        window.innerHeight / DISPLAY_TEXTURE_HEIGHT,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.innerWidth, window.innerHeight]);

  const frameCountRef = useRef(0);
  const pingPongRef = useRef(true);

  useFrame(({ gl, clock }) => {
    if (pingPongRef.current) {
      agentDataMaterialRefA.current!.uniforms.uTime.value =
        clock.getElapsedTime();

      gl.setRenderTarget(agentDataRenderTargetA);
      gl.clear();
      gl.render(agentDataSceneA, agentDataCamera);
      gl.setRenderTarget(null);

      agentDataMaterialRefB.current!.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetA.texture;
      agentPositionsMaterialRef.current!.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetA.texture;
    } else {
      agentDataMaterialRefB.current!.uniforms.uTime.value =
        clock.getElapsedTime();

      gl.setRenderTarget(agentDataRenderTargetB);
      gl.clear();
      gl.render(agentDataSceneB, agentDataCamera);
      gl.setRenderTarget(null);

      agentDataMaterialRefA.current!.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetB.texture;
      agentPositionsMaterialRef.current!.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetB.texture;
    }

    pingPongRef.current = !pingPongRef.current;

    gl.setRenderTarget(agentPositionsRenderTarget);
    gl.clear();
    gl.render(agentPositionsScene, agentPositionsCamera);
    gl.setRenderTarget(null);

    trailPlaneMaterialRef.current!.uniforms.uAgentPositionsTexture.value =
      agentPositionsRenderTarget.texture;

    if (agentDataDisplayPlaneOneRef.current) {
      // @ts-expect-error `map` does exist.
      agentDataDisplayPlaneOneRef.current.material.map =
        agentDataRenderTargetA.texture;
    }
    if (agentDataDisplayPlaneTwoRef.current) {
      // @ts-expect-error `map` does exist.
      agentDataDisplayPlaneTwoRef.current.material.map =
        agentDataRenderTargetB.texture;
    }
    if (agentPositionsDisplayPlaneRef.current) {
      // @ts-expect-error `map` does exist.
      agentPositionsDisplayPlaneRef.current.material.map =
        agentPositionsRenderTarget.texture;
    }

    frameCountRef.current++;
  });

  return (
    <>
      {createPortal(
        <mesh>
          <agentDataMaterial
            ref={agentDataMaterialRefA}
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
        agentDataSceneA,
      )}
      {createPortal(
        <mesh>
          <agentDataMaterial
            ref={agentDataMaterialRefB}
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
        agentDataSceneB,
      )}
      {createPortal(
        <points>
          <agentPositionsMaterial
            ref={agentPositionsMaterialRef}
            args={[DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT]}
          />
          <bufferGeometry>
            <bufferAttribute
              args={[agentPositionsAttribute, 3]}
              attach="attributes-position"
              array={agentPositionsAttribute}
              count={agentPositionsAttribute.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
        </points>,
        agentPositionsScene,
      )}
      <Plane>
        <shaderMaterial
          ref={trailPlaneMaterialRef}
          uniforms={trailDisplayUniforms}
          vertexShader={trailDisplayVertexShader}
          fragmentShader={trailDisplayFragmentShader}
          depthTest={false}
          depthWrite={false}
          transparent
        />
      </Plane>
      <Plane ref={agentDataDisplayPlaneOneRef}>
        <meshBasicMaterial
          attach="material"
          map={agentDataRenderTargetA.texture}
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
      <Plane ref={agentDataDisplayPlaneTwoRef}>
        <meshBasicMaterial
          attach="material"
          map={agentDataRenderTargetB.texture}
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
      <Plane ref={agentPositionsDisplayPlaneRef}>
        <meshBasicMaterial
          attach="material"
          map={agentPositionsRenderTarget.texture}
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
              gl_Position = vec4(position, 1.0) * vec4(0.4 * (uResolution.y / uResolution.x), 0.4, 1.0, 1.0) + vec4(1.0 - (0.4 * (uResolution.y / uResolution.x)) * 0.5, 0.0, 0.0, 0.0);
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
