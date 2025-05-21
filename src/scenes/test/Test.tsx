import { Plane, useFBO } from "@react-three/drei";
import { createPortal, extend, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import AgentDataMaterial from "./AgentDataMaterial";
import AgentPositionsMaterial from "./AgentPositionsMaterial";
import TrailMaterial from "./TrailMaterial";
import {
  CONTROL_BOUNDS,
  DEFAULT_AGENT_DATA_UNIFORMS,
  DEFAULT_SHARED_UNIFORMS,
  DEFAULT_SIMULATION_SPEED,
  DEFAULT_TRAIL_UNIFORMS,
  DISPLAY_TEXTURE_HEIGHT,
  DISPLAY_TEXTURE_WIDTH,
  GPU_TEXTURE_HEIGHT,
  GPU_TEXTURE_WIDTH,
} from "./consts";
import agentDataFragmentShader from "./shaders/agentData/agentData.frag";
import agentDataVertexShader from "./shaders/agentData/agentData.vert";
import agentPositionsFragmentShader from "./shaders/agentPositions/agentPositions.frag";
import agentPositionsVertexShader from "./shaders/agentPositions/agentPositions.vert";
import displayFragmentShader from "./shaders/display/display.frag";
import displayVertexShader from "./shaders/display/display.vert";
import trailFragmentShader from "./shaders/trail/trail.frag";
import trailVertexShader from "./shaders/trail/trail.vert";

extend({ AgentDataMaterial, AgentPositionsMaterial, TrailMaterial });

// Credit to Maxime Heckel for their layout described in this blog post
// upon which this file is based:
// https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

// Also credit to this person for the idea of using points for the trail:
// https://kaesve.nl/projects/mold/summary.html

const boundaryBehaviors = ["Wrap", "Bounce"];
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
  uTrailTexture: new THREE.Uniform(new THREE.Texture()),
  uAgentPositionsTexture: new THREE.Uniform(new THREE.Texture()),
  uTime: new THREE.Uniform(0.0),
  uDelta: new THREE.Uniform(0.0),
  uPaletteA: new THREE.Uniform(
    new THREE.Vector3(Math.random(), Math.random(), Math.random()),
  ),
  uPaletteB: new THREE.Uniform(
    new THREE.Vector3(Math.random(), Math.random(), Math.random()),
  ),
  uPaletteC: new THREE.Uniform(
    new THREE.Vector3(Math.random(), Math.random(), Math.random()),
  ),
  uPaletteD: new THREE.Uniform(
    new THREE.Vector3(Math.random(), Math.random(), Math.random()),
  ),
};
const agentDataUniformsA = {
  uAgentDataTexture: { value: new THREE.Texture() },
  uAgentPositionsTexture: { value: new THREE.Texture() },
  uTrailTexture: { value: new THREE.Texture() },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uSensorAngle: { value: 22.5 },
  uRotationRate: { value: 2 },
  uSensorOffset: { value: 15 },
  uSensorWidth: { value: 3 },
  uStepSize: { value: 12 },
  uCrowdAvoidance: { value: 0.2 },
  uWanderStrength: { value: 5 },
  uBoundaryBehavior: { value: 1 },
  uTime: { value: 0.0 },
  uDelta: { value: 0.0 },
};
const agentDataUniformsB = {
  uAgentDataTexture: { value: new THREE.Texture() },
  uAgentPositionsTexture: { value: new THREE.Texture() },
  uTrailTexture: { value: new THREE.Texture() },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uSensorAngle: { value: 22.5 },
  uRotationRate: { value: 2 },
  uSensorOffset: { value: 15 },
  uSensorWidth: { value: 3 },
  uStepSize: { value: 12 },
  uCrowdAvoidance: { value: 0.2 },
  uWanderStrength: { value: 5 },
  uBoundaryBehavior: { value: 1 },
  uTime: { value: 0.0 },
  uDelta: { value: 0.0 },
};
const agentPositionsUniforms = {
  uAgentDataTexture: { value: new THREE.Texture() },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
};
const trailUniformsA = {
  uAgentPositionsTexture: { value: new THREE.Texture() },
  uTrailTexture: { value: new THREE.Texture() },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uDecayRate: { value: 0.4 },
  uDepositRate: { value: 5 },
  uDiffuseRate: { value: 10 },
  uBoundaryBehavior: { value: 1 },
  uBorderDistance: { value: 50 },
  uBorderSmoothing: { value: 0.85 },
  uBorderStrength: { value: 8.5 },
  uBorderRoundness: { value: 120 },
  uDelta: { value: 0.0 },
  uTime: { value: 0.0 },
};
const trailUniformsB = {
  uAgentPositionsTexture: { value: new THREE.Texture() },
  uTrailTexture: { value: new THREE.Texture() },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uDecayRate: { value: 0.4 },
  uDepositRate: { value: 5 },
  uDiffuseRate: { value: 10 },
  uBoundaryBehavior: { value: 1 },
  uBorderDistance: { value: 50 },
  uBorderSmoothing: { value: 0.85 },
  uBorderStrength: { value: 8.5 },
  uBorderRoundness: { value: 120 },
  uDelta: { value: 0.0 },
  uTime: { value: 0.0 },
};

function Test() {
  console.log("Component Rendered");

  const viewport = useThree((state) => state.viewport);

  const simulationSpeedRef = useRef(DEFAULT_SIMULATION_SPEED);

  const agentDataMaterialRefA = useRef<THREE.ShaderMaterial>(null!);
  const agentDataMaterialRefB = useRef<THREE.ShaderMaterial>(null!);
  const agentPositionsMaterialRef = useRef<THREE.ShaderMaterial>(null!);
  const trailMaterialRefA = useRef<THREE.ShaderMaterial>(null!);
  const trailMaterialRefB = useRef<THREE.ShaderMaterial>(null!);

  const agentDataDisplayPlaneRef = useRef<THREE.Mesh>(null!);
  const agentPositionsDisplayPlaneRef = useRef<THREE.Mesh>(null!);
  const trailDisplayPlaneRef = useRef<THREE.Mesh>(null!);

  const slimeMoldDisplayShaderRef = useRef<THREE.ShaderMaterial>(null!);

  const agentDataSceneA = useMemo(() => new THREE.Scene(), []);
  const agentDataSceneB = useMemo(() => new THREE.Scene(), []);
  const agentPositionsScene = useMemo(() => new THREE.Scene(), []);
  const trailSceneA = useMemo(() => new THREE.Scene(), []);
  const trailSceneB = useMemo(() => new THREE.Scene(), []);

  const cameraA = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
    [],
  );
  const cameraB = useMemo(
    () =>
      new THREE.OrthographicCamera(
        0,
        DISPLAY_TEXTURE_WIDTH,
        DISPLAY_TEXTURE_HEIGHT,
        0,
        1 / Math.pow(2, 53),
        1,
      ),
    [],
  );

  const renderPlanePositions = useMemo(
    () =>
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ]),
    [],
  );
  const renderPlaneUvs = useMemo(
    () => new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]),
    [],
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GPU_TEXTURE_WIDTH, GPU_TEXTURE_HEIGHT]);

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
      (window.innerWidth / window.devicePixelRatio / DISPLAY_TEXTURE_WIDTH) * 4,
      (window.innerHeight / window.devicePixelRatio / DISPLAY_TEXTURE_HEIGHT) *
        4,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.innerWidth, window.innerHeight]);

  useEffect(() => {
    // Initialize all the stuff we don't want reset each time the screen resizes.
    // That will include nearly all of the uniforms, plus our fbo textures.

    // Agent data.
    const agentDataTextureData = new Float32Array(
      GPU_TEXTURE_WIDTH * GPU_TEXTURE_HEIGHT * 4,
    );
    for (let i = 0; i < GPU_TEXTURE_WIDTH * GPU_TEXTURE_HEIGHT; i++) {
      const i4 = i * 4;
      agentDataTextureData[i4 + 0] = 0.5;
      agentDataTextureData[i4 + 1] = 0.5;
      agentDataTextureData[i4 + 2] = Math.random();
      agentDataTextureData[i4 + 3] = 1.0;
    }
    const agentDataTexture = new THREE.DataTexture(
      agentDataTextureData,
      GPU_TEXTURE_WIDTH,
      GPU_TEXTURE_HEIGHT,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    agentDataTexture.needsUpdate = true;

    // Agent positions.
    const agentPositionsTextureData = new Float32Array(
      DISPLAY_TEXTURE_WIDTH * DISPLAY_TEXTURE_HEIGHT * 4,
    );
    for (
      let i = 0;
      i < DISPLAY_TEXTURE_WIDTH * DISPLAY_TEXTURE_HEIGHT * 4;
      i++
    ) {
      const i4 = i * 4;
      agentPositionsTextureData[i4 + 0] = 0.0;
      agentPositionsTextureData[i4 + 1] = 0.0;
      agentPositionsTextureData[i4 + 2] = 0.0;
      agentPositionsTextureData[i4 + 3] = 1.0;
    }
    const agentPositionsTexture = new THREE.DataTexture(
      agentPositionsTextureData,
      DISPLAY_TEXTURE_WIDTH,
      DISPLAY_TEXTURE_HEIGHT,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    agentPositionsTexture.needsUpdate = true;

    // Trail.
    const trailTextureData = new Float32Array(
      DISPLAY_TEXTURE_WIDTH * DISPLAY_TEXTURE_HEIGHT * 4,
    );
    for (
      let i = 0;
      i < DISPLAY_TEXTURE_WIDTH * DISPLAY_TEXTURE_HEIGHT * 4;
      i++
    ) {
      const i4 = i * 4;
      trailTextureData[i4 + 0] = 0.0;
      trailTextureData[i4 + 1] = 0.0;
      trailTextureData[i4 + 2] = 0.0;
      trailTextureData[i4 + 3] = 1.0;
    }
    const trailTexture = new THREE.DataTexture(
      trailTextureData,
      DISPLAY_TEXTURE_WIDTH,
      DISPLAY_TEXTURE_HEIGHT,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    trailTexture.needsUpdate = true;

    // Assign the textures to the uniforms.
    agentDataUniformsA.uAgentDataTexture.value = agentDataTexture;
    agentDataUniformsA.uAgentPositionsTexture.value = agentPositionsTexture;
    agentDataUniformsA.uTrailTexture.value = trailTexture;
    agentDataUniformsB.uAgentDataTexture.value = agentDataTexture;
    agentDataUniformsB.uAgentPositionsTexture.value = agentPositionsTexture;
    agentDataUniformsB.uTrailTexture.value = trailTexture;
    agentPositionsUniforms.uAgentDataTexture.value = agentDataTexture;
    trailUniformsA.uAgentPositionsTexture.value = agentPositionsTexture;
    trailUniformsA.uTrailTexture.value = trailTexture;
    trailUniformsB.uAgentPositionsTexture.value = agentPositionsTexture;
    trailUniformsB.uTrailTexture.value = trailTexture;

    // agentDataMaterialRefA.current.uniforms = agentDataUniformsA;
    // agentDataMaterialRefB.current.uniforms = agentDataUniformsB;
    // agentPositionsMaterialRef.current.uniforms = agentPositionsUniforms;
    // trailMaterialRefA.current.uniforms = trailUniformsA;
    // trailMaterialRefB.current.uniforms = trailUniformsB;

    console.log("Stuff initialized");
  }, []);

  const pingPongRef = useRef(true);
  const uDeltaRef = useRef(0.0);
  const uTimeRef = useRef(0.0);

  useFrame(({ gl }, delta) => {
    uDeltaRef.current = Math.min(delta * simulationSpeedRef.current, 0.1);
    uTimeRef.current += uDeltaRef.current;

    agentDataUniformsA.uDelta.value = uDeltaRef.current;
    agentDataUniformsA.uTime.value = uTimeRef.current;
    agentDataUniformsB.uDelta.value = uDeltaRef.current;
    agentDataUniformsB.uTime.value = uTimeRef.current;
    trailUniformsA.uDelta.value = uDeltaRef.current;
    trailUniformsA.uTime.value = uTimeRef.current;
    trailUniformsB.uDelta.value = uDeltaRef.current;
    trailUniformsB.uTime.value = uTimeRef.current;
    slimeMoldDisplayPlaneUniforms.uDelta.value = uDeltaRef.current;
    slimeMoldDisplayPlaneUniforms.uTime.value = uTimeRef.current;

    if (pingPongRef.current) {
      gl.setRenderTarget(agentDataRenderTargetA);
      gl.clear();
      gl.render(agentDataSceneA, cameraA);

      agentDataUniformsB.uAgentDataTexture.value =
        agentDataRenderTargetA.texture;
      agentPositionsUniforms.uAgentDataTexture.value =
        agentDataRenderTargetA.texture;

      agentDataMaterialRefB.current.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetA.texture;
      agentPositionsMaterialRef.current.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetA.texture;
    } else {
      gl.setRenderTarget(agentDataRenderTargetB);
      gl.clear();
      gl.render(agentDataSceneB, cameraA);

      agentDataUniformsA.uAgentDataTexture.value =
        agentDataRenderTargetB.texture;
      agentPositionsUniforms.uAgentDataTexture.value =
        agentDataRenderTargetB.texture;

      agentDataMaterialRefA.current.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetB.texture;
      agentPositionsMaterialRef.current.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetB.texture;
    }

    gl.setRenderTarget(agentPositionsRenderTarget);
    gl.clear();
    gl.render(agentPositionsScene, cameraB);

    trailUniformsA.uAgentPositionsTexture.value =
      agentPositionsRenderTarget.texture;
    trailUniformsB.uAgentPositionsTexture.value =
      agentPositionsRenderTarget.texture;
    agentDataUniformsA.uAgentPositionsTexture.value =
      agentPositionsRenderTarget.texture;
    agentDataUniformsB.uAgentPositionsTexture.value =
      agentPositionsRenderTarget.texture;

    agentDataMaterialRefA.current.uniforms.uAgentPositionsTexture.value =
      agentPositionsRenderTarget.texture;
    agentDataMaterialRefB.current.uniforms.uAgentPositionsTexture.value =
      agentPositionsRenderTarget.texture;
    trailMaterialRefA.current.uniforms.uAgentPositionsTexture.value =
      agentPositionsRenderTarget.texture;
    trailMaterialRefB.current.uniforms.uAgentPositionsTexture.value =
      agentPositionsRenderTarget.texture;

    if (pingPongRef.current) {
      gl.setRenderTarget(trailRenderTargetA);
      gl.clear();
      gl.render(trailSceneA, cameraA);

      trailUniformsB.uTrailTexture.value = trailRenderTargetA.texture;
      agentDataUniformsB.uTrailTexture.value = trailRenderTargetA.texture;

      agentDataMaterialRefB.current.uniforms.uTrailTexture.value =
        trailRenderTargetA.texture;
      trailMaterialRefB.current.uniforms.uTrailTexture.value =
        trailRenderTargetA.texture;
    } else {
      gl.setRenderTarget(trailRenderTargetB);
      gl.clear();
      gl.render(trailSceneB, cameraA);

      trailUniformsA.uTrailTexture.value = trailRenderTargetB.texture;
      agentDataUniformsA.uTrailTexture.value = trailRenderTargetB.texture;

      agentDataMaterialRefA.current.uniforms.uTrailTexture.value =
        trailRenderTargetB.texture;
      trailMaterialRefA.current.uniforms.uTrailTexture.value =
        trailRenderTargetB.texture;
    }

    gl.setRenderTarget(null);
    // gl.render(scene, camera);

    if (pingPongRef.current) {
      if (trailRenderTargetA.texture) {
        slimeMoldDisplayPlaneUniforms.uTrailTexture.value =
          trailRenderTargetA.texture;
      }
    } else {
      if (trailRenderTargetB.texture) {
        slimeMoldDisplayPlaneUniforms.uTrailTexture.value =
          trailRenderTargetB.texture;
      }
    }

    if (agentPositionsRenderTarget.texture) {
      slimeMoldDisplayPlaneUniforms.uAgentPositionsTexture.value =
        agentPositionsRenderTarget.texture;
    }

    if (agentDataDisplayPlaneRef.current && agentDataRenderTargetA.texture) {
      // @ts-expect-error `map` does exist.
      agentDataDisplayPlaneRef.current.material.map =
        agentDataRenderTargetA.texture;
    }
    if (
      agentPositionsDisplayPlaneRef.current &&
      agentPositionsRenderTarget.texture
    ) {
      // @ts-expect-error `map` does exist.
      agentPositionsDisplayPlaneRef.current.material.map =
        agentPositionsRenderTarget.texture;
    }
    if (trailDisplayPlaneRef.current && trailRenderTargetA.texture) {
      // @ts-expect-error `map` does exist.
      trailDisplayPlaneRef.current.material.map = trailRenderTargetA.texture;
    }

    pingPongRef.current = !pingPongRef.current;
  });

  return (
    <>
      {createPortal(
        <mesh>
          <shaderMaterial
            ref={agentDataMaterialRefA}
            uniforms={agentDataUniformsA}
            vertexShader={agentDataVertexShader}
            fragmentShader={agentDataFragmentShader}
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
          <shaderMaterial
            ref={agentDataMaterialRefB}
            uniforms={agentDataUniformsB}
            vertexShader={agentDataVertexShader}
            fragmentShader={agentDataFragmentShader}
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
          <shaderMaterial
            ref={agentPositionsMaterialRef}
            uniforms={agentPositionsUniforms}
            vertexShader={agentPositionsVertexShader}
            fragmentShader={agentPositionsFragmentShader}
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
          <shaderMaterial
            ref={trailMaterialRefA}
            uniforms={trailUniformsA}
            vertexShader={trailVertexShader}
            fragmentShader={trailFragmentShader}
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
          <shaderMaterial
            ref={trailMaterialRefB}
            uniforms={trailUniformsB}
            vertexShader={trailVertexShader}
            fragmentShader={trailFragmentShader}
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
      <Plane>
        <shaderMaterial
          ref={slimeMoldDisplayShaderRef}
          uniforms={slimeMoldDisplayPlaneUniforms}
          vertexShader={displayVertexShader}
          fragmentShader={displayFragmentShader}
        />
      </Plane>
      <Plane ref={agentDataDisplayPlaneRef} visible={true}>
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
      <Plane ref={agentPositionsDisplayPlaneRef} visible={true}>
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
      <Plane ref={trailDisplayPlaneRef} visible={true}>
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

export default Test;
