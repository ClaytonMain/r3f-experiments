import { Plane, useFBO } from "@react-three/drei";
import { createPortal, extend, useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import AgentDataMaterial from "./AgentDataMaterial";
import AgentPositionsMaterial from "./AgentPositionsMaterial";
import TrailMaterial from "./TrailMaterial";
import {
  DEFAULT_AGENT_DATA_UNIFORMS,
  DEFAULT_TRAIL_UNIFORMS,
  DISPLAY_TEXTURE_HEIGHT,
  DISPLAY_TEXTURE_WIDTH,
  GPU_TEXTURE_HEIGHT,
  GPU_TEXTURE_WIDTH,
} from "./consts";

extend({ AgentDataMaterial, AgentPositionsMaterial, TrailMaterial });

// Credit to Maxime Heckel for their layout described in this blog post
// upon which this file is based:
// https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

// Also credit to this person for the idea of using points for the trail:
// https://kaesve.nl/projects/mold/summary.html

const texturePlaneUniforms = {
  uResolution: new THREE.Uniform(new THREE.Vector2(800, 800)),
  uShowTexture: new THREE.Uniform(1),
};

const slimeMoldDisplayPlaneUniforms = {
  uResolution: new THREE.Uniform(new THREE.Vector2(800, 800)),
  uDisplayTextureResolution: new THREE.Uniform(
    new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  ),
  uGlPositionScale: new THREE.Uniform(1),
};

function FBOSlimeMold() {
  useControls("Slime Mold", {
    slimeMold_uSensorAngle: {
      label: "Sensor Angle",
      value: DEFAULT_AGENT_DATA_UNIFORMS.uSensorAngle.value,
      min: 0,
      max: Math.PI,
      onChange: (value) => {
        agentDataMaterialRefA.current!.uniforms.uSensorAngle.value = value;
        agentDataMaterialRefB.current!.uniforms.uSensorAngle.value = value;
      },
    },
    slimeMold_uRotationAngle: {
      label: "Rotation Angle",
      value: DEFAULT_AGENT_DATA_UNIFORMS.uRotationAngle.value,
      min: 0,
      max: Math.PI,
      onChange: (value) => {
        agentDataMaterialRefA.current!.uniforms.uRotationAngle.value = value;
        agentDataMaterialRefB.current!.uniforms.uRotationAngle.value = value;
      },
    },
    slimeMold_uSensorOffset: {
      label: "Sensor Offset",
      value: DEFAULT_AGENT_DATA_UNIFORMS.uSensorOffset.value,
      min: 0,
      max: 20,
      onChange: (value) => {
        agentDataMaterialRefA.current!.uniforms.uSensorOffset.value = value;
        agentDataMaterialRefB.current!.uniforms.uSensorOffset.value = value;
      },
    },
    slimeMold_uSensorWidth: {
      label: "Sensor Width",
      value: DEFAULT_AGENT_DATA_UNIFORMS.uSensorWidth.value,
      min: 0,
      max: 10,
      onChange: (value) => {
        agentDataMaterialRefA.current!.uniforms.uSensorWidth.value = value;
        agentDataMaterialRefB.current!.uniforms.uSensorWidth.value = value;
      },
    },
    slimeMold_uStepSize: {
      label: "Step Size",
      value: DEFAULT_AGENT_DATA_UNIFORMS.uStepSize.value,
      min: 0,
      max: 10,
      onChange: (value) => {
        agentDataMaterialRefA.current!.uniforms.uStepSize.value = value;
        agentDataMaterialRefB.current!.uniforms.uStepSize.value = value;
      },
    },
    slimeMold_uDecayRate: {
      label: "Decay Rate",
      value: DEFAULT_TRAIL_UNIFORMS.uDecayRate.value,
      min: 0,
      max: 1,
      onChange: (value) => {
        trailMaterialRefA.current!.uniforms.uDecayRate.value = value;
        trailMaterialRefB.current!.uniforms.uDecayRate.value = value;
      },
    },
    slimeMold_uDepositRate: {
      label: "Deposit Rate",
      value: DEFAULT_TRAIL_UNIFORMS.uDepositRate.value,
      min: 0,
      max: 1,
      onChange: (value) => {
        trailMaterialRefA.current!.uniforms.uDepositRate.value = value;
        trailMaterialRefB.current!.uniforms.uDepositRate.value = value;
      },
    },
  });

  const viewport = useThree((state) => state.viewport);

  const agentDataMaterialRefA = useRef<AgentDataMaterial>(null);
  const agentDataMaterialRefB = useRef<AgentDataMaterial>(null);
  const agentPositionsMaterialRef = useRef<AgentPositionsMaterial>(null);
  const trailMaterialRefA = useRef<TrailMaterial>(null);
  const trailMaterialRefB = useRef<TrailMaterial>(null);

  const agentDataDisplayPlaneRef = useRef<THREE.Mesh>(null);
  const agentPositionsDisplayPlaneRef = useRef<THREE.Mesh>(null);
  const trailDisplayPlaneRef = useRef<THREE.Mesh>(null);

  const slimeMoldDisplayPlaneRef = useRef<THREE.Mesh>(null);

  const agentDataSceneA = new THREE.Scene();
  const agentDataSceneB = new THREE.Scene();
  const agentPositionsScene = new THREE.Scene();
  const trailSceneA = new THREE.Scene();
  const trailSceneB = new THREE.Scene();

  const cameraA = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    1 / Math.pow(2, 53),
    1,
  );
  const cameraB = new THREE.OrthographicCamera(
    0,
    DISPLAY_TEXTURE_WIDTH,
    DISPLAY_TEXTURE_HEIGHT,
    0,
    1 / Math.pow(2, 53),
    1,
  );

  const renderPlanePositions = new Float32Array([
    -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
  ]);
  const renderPlaneUvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);

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
  const trailRenderTargetA = useFBO(
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
  const trailRenderTargetB = useFBO(
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
    slimeMoldDisplayPlaneUniforms.uResolution.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight,
    );
    slimeMoldDisplayPlaneUniforms.uGlPositionScale.value = Math.min(
      window.innerWidth / DISPLAY_TEXTURE_WIDTH,
      window.innerHeight / DISPLAY_TEXTURE_HEIGHT,
    );
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
      gl.render(agentDataSceneA, cameraA);
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
      gl.render(agentDataSceneB, cameraA);
      gl.setRenderTarget(null);

      agentDataMaterialRefA.current!.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetB.texture;
      agentPositionsMaterialRef.current!.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetB.texture;
    }

    gl.setRenderTarget(agentPositionsRenderTarget);
    gl.clear();
    gl.render(agentPositionsScene, cameraB);
    gl.setRenderTarget(null);

    if (pingPongRef.current) {
      agentDataMaterialRefB.current!.uniforms.uAgentPositionsTexture.value =
        agentPositionsRenderTarget.texture;
    } else {
      agentDataMaterialRefA.current!.uniforms.uAgentPositionsTexture.value =
        agentPositionsRenderTarget.texture;
    }

    if (pingPongRef.current) {
      trailMaterialRefA.current!.uniforms.uAgentPositionsTexture.value =
        agentPositionsRenderTarget.texture;

      gl.setRenderTarget(trailRenderTargetA);
      gl.clear();
      gl.render(trailSceneA, cameraA);
      gl.setRenderTarget(null);

      trailMaterialRefB.current!.uniforms.uTrailTexture.value =
        trailRenderTargetA.texture;
      agentDataMaterialRefB.current!.uniforms.uTrailTexture.value =
        trailRenderTargetA.texture;
    } else {
      trailMaterialRefB.current!.uniforms.uAgentPositionsTexture.value =
        agentPositionsRenderTarget.texture;

      gl.setRenderTarget(trailRenderTargetB);
      gl.clear();
      gl.render(trailSceneB, cameraA);
      gl.setRenderTarget(null);

      trailMaterialRefA.current!.uniforms.uTrailTexture.value =
        trailRenderTargetB.texture;
      agentDataMaterialRefA.current!.uniforms.uTrailTexture.value =
        trailRenderTargetB.texture;
    }

    if (slimeMoldDisplayPlaneRef.current) {
      // @ts-expect-error `map` does exist.
      slimeMoldDisplayPlaneRef.current.material.map =
        trailRenderTargetA.texture;
    }
    if (agentDataDisplayPlaneRef.current) {
      // @ts-expect-error `map` does exist.
      agentDataDisplayPlaneRef.current.material.map =
        agentDataRenderTargetA.texture;
    }
    if (agentPositionsDisplayPlaneRef.current) {
      // @ts-expect-error `map` does exist.
      agentPositionsDisplayPlaneRef.current.material.map =
        agentPositionsRenderTarget.texture;
    }
    if (trailDisplayPlaneRef.current) {
      // @ts-expect-error `map` does exist.
      trailDisplayPlaneRef.current.material.map = trailRenderTargetA.texture;
    }

    pingPongRef.current = !pingPongRef.current;
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
              args={[renderPlanePositions, 3]}
              attach="attributes-position"
              array={renderPlanePositions}
              count={renderPlanePositions.length / 3}
              itemSize={3}
            />
            <bufferAttribute
              args={[renderPlaneUvs, 2]}
              attach="attributes-uv"
              array={renderPlaneUvs}
              count={renderPlaneUvs.length / 2}
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
              args={[renderPlanePositions, 3]}
              attach="attributes-position"
              array={renderPlanePositions}
              count={renderPlanePositions.length / 3}
              itemSize={3}
            />
            <bufferAttribute
              args={[renderPlaneUvs, 2]}
              attach="attributes-uv"
              array={renderPlaneUvs}
              count={renderPlaneUvs.length / 2}
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
      {createPortal(
        <mesh>
          <trailMaterial
            ref={trailMaterialRefA}
            args={[DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT]}
          />
          <bufferGeometry>
            <bufferAttribute
              args={[renderPlanePositions, 3]}
              attach="attributes-position"
              array={renderPlanePositions}
              count={renderPlanePositions.length / 3}
              itemSize={3}
            />
            <bufferAttribute
              args={[renderPlaneUvs, 2]}
              attach="attributes-uv"
              array={renderPlaneUvs}
              count={renderPlaneUvs.length / 2}
              itemSize={2}
            />
          </bufferGeometry>
        </mesh>,
        trailSceneA,
      )}
      {createPortal(
        <mesh>
          <trailMaterial
            ref={trailMaterialRefB}
            args={[DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT]}
          />
          <bufferGeometry>
            <bufferAttribute
              args={[renderPlanePositions, 3]}
              attach="attributes-position"
              array={renderPlanePositions}
              count={renderPlanePositions.length / 3}
              itemSize={3}
            />
            <bufferAttribute
              args={[renderPlaneUvs, 2]}
              attach="attributes-uv"
              array={renderPlaneUvs}
              count={renderPlaneUvs.length / 2}
              itemSize={2}
            />
          </bufferGeometry>
        </mesh>,
        trailSceneB,
      )}
      <Plane ref={slimeMoldDisplayPlaneRef}>
        <meshBasicMaterial
          attach="material"
          map={trailRenderTargetA.texture}
          depthTest={false}
          depthWrite={false}
          onBeforeCompile={(shader) => {
            shader.uniforms.uResolution =
              slimeMoldDisplayPlaneUniforms.uResolution;
            shader.uniforms.uDisplayTextureResolution =
              slimeMoldDisplayPlaneUniforms.uDisplayTextureResolution;
            shader.uniforms.uGlPositionScale =
              slimeMoldDisplayPlaneUniforms.uGlPositionScale;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
              #include <common>
              uniform vec2 uResolution;
              uniform vec2 uDisplayTextureResolution;
              uniform float uGlPositionScale;
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              /* glsl */ `
              #include <project_vertex>
              gl_Position = vec4(position, 1.0) * vec4(uResolution.y / uResolution.x * uDisplayTextureResolution.x / uDisplayTextureResolution.y, 1.0, 1.0, 1.0);
              gl_Position.xy *= uGlPositionScale * 3.5;
              `,
            );
          }}
        />
      </Plane>
      <Plane ref={agentDataDisplayPlaneRef}>
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
              gl_Position = vec4(position, 1.0) * vec4(0.4 * (uResolution.y / uResolution.x), 0.4, 1.0, 1.0) + vec4(1.0 - (0.4 * (uResolution.y / uResolution.x)) * 0.5, 0.4, 0.0, 0.0);
              gl_Position += vec4(vec3((1.0 - uShowTexture) * 9999.0), 0.0);
              `,
            );
          }}
        />
      </Plane>

      <Plane ref={trailDisplayPlaneRef}>
        <meshBasicMaterial
          attach="material"
          map={trailRenderTargetA.texture}
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
