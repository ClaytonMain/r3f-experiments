import { Plane, useFBO } from "@react-three/drei";
import { createPortal, extend, useFrame, useThree } from "@react-three/fiber";
import { button, folder, useControls } from "leva";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import AgentDataMaterial from "./AgentDataMaterial";
import AgentPositionsMaterial from "./AgentPositionsMaterial";
import TrailMaterial from "./TrailMaterial";
import {
  CONTROL_BOUNDS,
  DEFAULT_SHARED_UNIFORMS,
  DEFAULT_SIMULATION_SPEED,
  DISPLAY_TEXTURE_HEIGHT,
  DISPLAY_TEXTURE_WIDTH,
  getGaussRandomInControlBounds,
  GPU_TEXTURE_HEIGHT,
  GPU_TEXTURE_WIDTH,
} from "./consts";
import displayFragmentShader from "./shaders/display/display.frag";
import displayVertexShader from "./shaders/display/display.vert";

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
  uTrailTexture: new THREE.Uniform(new THREE.Texture()),
  uAgentPositionsTexture: new THREE.Uniform(new THREE.Texture()),
  uDisplayTextureResolution: new THREE.Uniform(
    new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  ),
  uDisplayScale: new THREE.Uniform(new THREE.Vector2(1, 1)),
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

const agentDataUniforms = {
  uAgentDataTexture: { value: new THREE.Texture() },
  uAgentPositionsTexture: { value: new THREE.Texture() },
  uTrailTexture: { value: new THREE.Texture() },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uSensorAngle: {
    value: getGaussRandomInControlBounds("uSensorAngle", 22.5, 5),
  },
  uRotationRate: {
    value: getGaussRandomInControlBounds("uRotationRate", 2, 0.4),
  },
  uSensorOffset: {
    value: getGaussRandomInControlBounds("uSensorOffset", 15, 2),
  },
  uSensorWidth: {
    value: getGaussRandomInControlBounds("uSensorWidth", 3, 0.2),
  },
  uStepSize: { value: getGaussRandomInControlBounds("uStepSize", 12, 2) },
  uCrowdAvoidance: {
    value: getGaussRandomInControlBounds("uCrowdAvoidance", 0.2, 0.05),
  },
  uWanderStrength: {
    value: getGaussRandomInControlBounds("uWanderStrength", 5, 1.2),
  },
  uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
  uTime: { value: 0.0 },
  uDelta: { value: 0.0 },
};
const agentPositionsUniforms = {
  uAgentDataTexture: { value: new THREE.Texture() },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
};
const trailUniforms = {
  uAgentPositionsTexture: { value: new THREE.Texture() },
  uTrailTexture: { value: new THREE.Texture() },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uDecayRate: { value: getGaussRandomInControlBounds("uDecayRate", 0.4, 0.1) },
  uDepositRate: { value: getGaussRandomInControlBounds("uDepositRate", 5, 1) },
  uDiffuseRate: { value: getGaussRandomInControlBounds("uDiffuseRate", 10, 2) },
  uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
  uBorderDistance: {
    value: getGaussRandomInControlBounds("uBorderDistance", 50, 20),
  },
  uBorderSmoothing: {
    value: getGaussRandomInControlBounds("uBorderSmoothing", 0.85, 0.5),
  },
  uBorderStrength: {
    value: getGaussRandomInControlBounds("uBorderStrength", 8.5, 1),
  },
  uBorderRoundness: {
    value: getGaussRandomInControlBounds("uBorderRoundness", 120, 20),
  },
  uDelta: { value: 0.0 },
  uTime: { value: 0.0 },
};

function FBOSlimeMold() {
  const [agentCount, setAgentCount] = useState(
    GPU_TEXTURE_WIDTH * GPU_TEXTURE_HEIGHT,
  );
  const [displayTextureResolution, setDisplayTextureResolution] = useState(
    new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  );

  function randomizeColorPalette() {
    const keys = ["uPaletteA", "uPaletteB", "uPaletteC", "uPaletteD"];
    keys.forEach((key) => {
      const value = new THREE.Vector3(
        Math.random(),
        Math.random(),
        Math.random(),
      );
      // @ts-expect-error the key is valid.
      slimeMoldDisplayPlaneUniforms[key].value = value;
      setControls({
        [`slimeMold_${key}1`]: value.x,
        [`slimeMold_${key}2`]: value.y,
        [`slimeMold_${key}3`]: value.z,
      });
    });
  }
  // function restartSimulation() {
  //   agentDataUniforms.uAgentDataTexture.value.dispose();
  //   agentPositionsUniforms.uAgentDataTexture.value.dispose();
  //   trailUniforms.uTrailTexture.value.dispose();
  // }
  const [, setControls] = useControls(() => ({
    "Quick Controls": folder({
      "Randomize Color Palette": button(() => randomizeColorPalette()),
    }),
    "Simulation Controls": folder(
      {
        slimeMold_simulationSpeed: {
          label: "Simulation Speed",
          value: DEFAULT_SIMULATION_SPEED,
          min: CONTROL_BOUNDS.simulationSpeed.min,
          max: CONTROL_BOUNDS.simulationSpeed.max,
          onChange: (value) => {
            simulationSpeedRef.current = value;
          },
        },
      },
      { collapsed: false },
    ),
    "Agent Parameters": folder(
      {
        slimeMold_agentCount: {
          label: "Agent Count",
          value: agentCount,
          options: [128 * 128, 256 * 256, 512 * 512, 768 * 768, 1024 * 1024],
          onChange: (value) => {
            setAgentCount(value);
          },
        },
        slimeMold_uSensorAngle: {
          label: "Sensor Degrees",
          value: agentDataUniforms.uSensorAngle.value,
          min: CONTROL_BOUNDS.uSensorAngle.min,
          max: CONTROL_BOUNDS.uSensorAngle.max,
          onChange: (value) => {
            agentDataUniforms.uSensorAngle.value = (value / 180) * Math.PI;
          },
        },
        slimeMold_uRotationRate: {
          label: "Rotation Rate",
          value: agentDataUniforms.uRotationRate.value,
          min: CONTROL_BOUNDS.uRotationRate.min,
          max: CONTROL_BOUNDS.uRotationRate.max,
          onChange: (value) => {
            agentDataUniforms.uRotationRate.value = value;
          },
        },
        slimeMold_uSensorOffset: {
          label: "Sensor Offset",
          value: agentDataUniforms.uSensorOffset.value,
          min: CONTROL_BOUNDS.uSensorOffset.min,
          max: CONTROL_BOUNDS.uSensorOffset.max,
          onChange: (value) => {
            agentDataUniforms.uSensorOffset.value = value;
          },
        },
        slimeMold_uSensorWidth: {
          label: "Sensor Width",
          value: agentDataUniforms.uSensorWidth.value,
          min: CONTROL_BOUNDS.uSensorWidth.min,
          max: CONTROL_BOUNDS.uSensorWidth.max,
          onChange: (value) => {
            agentDataUniforms.uSensorWidth.value = value;
          },
        },
        slimeMold_uStepSize: {
          label: "Step Size",
          value: agentDataUniforms.uStepSize.value,
          min: CONTROL_BOUNDS.uStepSize.min,
          max: CONTROL_BOUNDS.uStepSize.max,
          onChange: (value) => {
            agentDataUniforms.uStepSize.value = value;
          },
        },
        slimeMold_uCrowdAvoidance: {
          label: "Crowd Avoidance",
          value: agentDataUniforms.uCrowdAvoidance.value,
          min: CONTROL_BOUNDS.uCrowdAvoidance.min,
          max: CONTROL_BOUNDS.uCrowdAvoidance.max,
          onChange: (value) => {
            agentDataUniforms.uCrowdAvoidance.value = value;
          },
        },
        slimeMold_uWanderStrength: {
          label: "Wander Strength",
          value: agentDataUniforms.uWanderStrength.value,
          min: CONTROL_BOUNDS.uWanderStrength.min,
          max: CONTROL_BOUNDS.uWanderStrength.max,
          onChange: (value) => {
            agentDataUniforms.uWanderStrength.value = value;
          },
        },
      },
      { collapsed: false },
    ),
    "Trail Parameters": folder(
      {
        slimeMold_displayTextureResolution: {
          label: "Display Texture Resolution",
          value: `${displayTextureResolution.x} x ${displayTextureResolution.y}`,
          options: [
            "640 x 480",
            "800 x 600",
            "1280 x 720",
            "1920 x 1080",
            "2560 x 1440",
            "3840 x 2160",
          ],
          onChange: (stringValue) => {
            const [width, height] = stringValue.split(" x ").map(Number);
            const value = new THREE.Vector2(width, height);
            setDisplayTextureResolution(value);
            agentDataUniforms.uDisplayTextureResolution.value = value;
            slimeMoldDisplayPlaneUniforms.uDisplayTextureResolution.value =
              value;
            agentPositionsUniforms.uDisplayTextureResolution.value = value;
            trailUniforms.uDisplayTextureResolution.value = value;
          },
        },
        slimeMold_uDecayRate: {
          label: "Decay Rate",
          value: trailUniforms.uDecayRate.value,
          min: CONTROL_BOUNDS.uDecayRate.min,
          max: CONTROL_BOUNDS.uDecayRate.max,
          step: 0.01,
          onChange: (value) => {
            trailUniforms.uDecayRate.value = value;
          },
        },
        slimeMold_uDepositRate: {
          label: "Deposit Rate",
          value: trailUniforms.uDepositRate.value,
          min: CONTROL_BOUNDS.uDepositRate.min,
          max: CONTROL_BOUNDS.uDepositRate.max,
          onChange: (value) => {
            trailUniforms.uDepositRate.value = value;
          },
        },
        slimeMold_uDiffuseRate: {
          label: "Diffuse Rate",
          value: trailUniforms.uDiffuseRate.value,
          min: CONTROL_BOUNDS.uDiffuseRate.min,
          max: CONTROL_BOUNDS.uDiffuseRate.max,
          onChange: (value) => {
            trailUniforms.uDiffuseRate.value = value;
          },
        },
      },
      { collapsed: false },
    ),
    "Boundary Parameters": folder(
      {
        slimeMold_uBoundaryBehavior: {
          label: "Boundary Behavior",
          value:
            boundaryBehaviors[DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value],
          options: boundaryBehaviors,
          onChange: (value) => {
            const valueIndex = boundaryBehaviors.indexOf(value);
            agentDataUniforms.uBoundaryBehavior.value = valueIndex;
            trailUniforms.uBoundaryBehavior.value = valueIndex;
          },
        },
        slimeMold_uBorderDistance: {
          label: "Border Distance",
          value: trailUniforms.uBorderDistance.value,
          min: CONTROL_BOUNDS.uBorderDistance.min,
          max: CONTROL_BOUNDS.uBorderDistance.max,
          onChange: (value) => {
            trailUniforms.uBorderDistance.value = value;
          },
        },
        slimeMold_uBorderSmoothing: {
          label: "Border Smoothing",
          value: trailUniforms.uBorderSmoothing.value,
          min: CONTROL_BOUNDS.uBorderSmoothing.min,
          max: CONTROL_BOUNDS.uBorderSmoothing.max,
          onChange: (value) => {
            trailUniforms.uBorderSmoothing.value = value;
          },
        },
        slimeMold_uBorderStrength: {
          label: "Border Strength",
          value: trailUniforms.uBorderStrength.value,
          min: CONTROL_BOUNDS.uBorderStrength.min,
          max: CONTROL_BOUNDS.uBorderStrength.max,
          onChange: (value) => {
            trailUniforms.uBorderStrength.value = value;
          },
        },
        slimeMold_uBorderRoundness: {
          label: "Border Roundness",
          value: trailUniforms.uBorderRoundness.value,
          min: CONTROL_BOUNDS.uBorderRoundness.min,
          max: CONTROL_BOUNDS.uBorderRoundness.max,
          onChange: (value) => {
            trailUniforms.uBorderRoundness.value = value;
          },
        },
      },
      { collapsed: true },
    ),
    "Color Palette": folder(
      {
        slimeMold_uPaletteA1: {
          label: "Palette A1",
          value: slimeMoldDisplayPlaneUniforms.uPaletteA.value.x,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteA.value.x = value;
          },
        },
        slimeMold_uPaletteA2: {
          label: "Palette A2",
          value: slimeMoldDisplayPlaneUniforms.uPaletteA.value.y,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteA.value.y = value;
          },
        },
        slimeMold_uPaletteA3: {
          label: "Palette A3",
          value: slimeMoldDisplayPlaneUniforms.uPaletteA.value.z,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteA.value.z = value;
          },
        },
        slimeMold_uPaletteB1: {
          label: "Palette B1",
          value: slimeMoldDisplayPlaneUniforms.uPaletteB.value.x,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteB.value.x = value;
          },
        },
        slimeMold_uPaletteB2: {
          label: "Palette B2",
          value: slimeMoldDisplayPlaneUniforms.uPaletteB.value.y,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteB.value.y = value;
          },
        },
        slimeMold_uPaletteB3: {
          label: "Palette B3",
          value: slimeMoldDisplayPlaneUniforms.uPaletteB.value.z,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteB.value.z = value;
          },
        },
        slimeMold_uPaletteC1: {
          label: "Palette C1",
          value: slimeMoldDisplayPlaneUniforms.uPaletteC.value.x,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteC.value.x = value;
          },
        },
        slimeMold_uPaletteC2: {
          label: "Palette C2",
          value: slimeMoldDisplayPlaneUniforms.uPaletteC.value.y,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteC.value.y = value;
          },
        },
        slimeMold_uPaletteC3: {
          label: "Palette C3",
          value: slimeMoldDisplayPlaneUniforms.uPaletteC.value.z,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteC.value.z = value;
          },
        },
        slimeMold_uPaletteD1: {
          label: "Palette D1",
          value: slimeMoldDisplayPlaneUniforms.uPaletteD.value.x,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteD.value.x = value;
          },
        },
        slimeMold_uPaletteD2: {
          label: "Palette D2",
          value: slimeMoldDisplayPlaneUniforms.uPaletteD.value.y,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteD.value.y = value;
          },
        },
        slimeMold_uPaletteD3: {
          label: "Palette D3",
          value: slimeMoldDisplayPlaneUniforms.uPaletteD.value.z,
          min: 0,
          max: 1,
          onChange: (value) => {
            slimeMoldDisplayPlaneUniforms.uPaletteD.value.z = value;
          },
        },
        "Randomize Color Palette": button(() => randomizeColorPalette()),
      },
      { collapsed: true },
    ),
  }));

  const viewport = useThree((state) => state.viewport);

  const simulationSpeedRef = useRef(DEFAULT_SIMULATION_SPEED);

  const agentDataMaterialRefA = useRef<AgentDataMaterial>(null!);
  const agentDataMaterialRefB = useRef<AgentDataMaterial>(null!);
  const agentPositionsMaterialRef = useRef<AgentPositionsMaterial>(null!);
  const trailMaterialRefA = useRef<TrailMaterial>(null!);
  const trailMaterialRefB = useRef<TrailMaterial>(null!);

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
        displayTextureResolution.x,
        displayTextureResolution.y,
        0,
        1 / Math.pow(2, 53),
        1,
      ),
    [displayTextureResolution],
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

  const agentDataRenderTargetA = useFBO(
    Math.sqrt(agentCount),
    Math.sqrt(agentCount),
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      type: THREE.FloatType,
    },
  );
  const agentDataRenderTargetB = useFBO(
    Math.sqrt(agentCount),
    Math.sqrt(agentCount),
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      type: THREE.FloatType,
    },
  );
  const agentPositionsRenderTarget = useFBO(
    displayTextureResolution.x,
    displayTextureResolution.y,
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      type: THREE.FloatType,
    },
  );
  const trailRenderTargetA = useFBO(
    displayTextureResolution.x,
    displayTextureResolution.y,
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      type: THREE.FloatType,
    },
  );
  const trailRenderTargetB = useFBO(
    displayTextureResolution.x,
    displayTextureResolution.y,
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      type: THREE.FloatType,
    },
  );

  const agentPositionsAttribute = useMemo(() => {
    const length = agentCount;
    const side = Math.sqrt(length);
    const attributes = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      const i3 = i * 3;
      attributes[i3 + 0] = (i % side) / side;
      attributes[i3 + 1] = Math.floor(i / side) / side;
      attributes[i3 + 2] = 0;
    }
    return attributes;
  }, [agentCount]);

  // useEffect(() => {
  //   const timer = setTimeout(function () {
  //     location.reload();
  //   }, 300000);
  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, []);

  useEffect(() => {
    if (viewport.width && viewport.height) {
      texturePlaneUniforms.uResolution.value.set(
        viewport.width,
        viewport.height,
      );
    }
  }, [viewport]);

  useEffect(() => {
    const targetAspect =
      displayTextureResolution.x / displayTextureResolution.y;
    const windowAspect = window.innerWidth / window.innerHeight;

    // If windowAspect > targetAspect scale x, otherwise scale y
    if (windowAspect > targetAspect) {
      slimeMoldDisplayPlaneUniforms.uDisplayScale.value = new THREE.Vector2(
        (targetAspect * 2) / windowAspect,
        2,
      );
    } else {
      slimeMoldDisplayPlaneUniforms.uDisplayScale.value = new THREE.Vector2(
        2,
        (windowAspect * 2) / targetAspect,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.innerWidth, window.innerHeight]);

  const pingPongRef = useRef(true);
  const uDeltaRef = useRef(0.0);
  const uTimeRef = useRef(0.0);

  useFrame(({ gl }, delta) => {
    uDeltaRef.current = Math.min(delta * simulationSpeedRef.current, 0.1);
    uTimeRef.current += uDeltaRef.current;

    if (pingPongRef.current) {
      agentDataMaterialRefA.current.uniforms.uDelta.value = uDeltaRef.current;
      agentDataMaterialRefA.current.uniforms.uTime.value = uTimeRef.current;

      gl.setRenderTarget(agentDataRenderTargetA);
      gl.clear();
      gl.render(agentDataSceneA, cameraA);

      agentDataMaterialRefB.current.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetA.texture;
      agentPositionsMaterialRef.current.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetA.texture;
    } else {
      agentDataMaterialRefB.current.uniforms.uDelta.value = uDeltaRef.current;
      agentDataMaterialRefB.current.uniforms.uTime.value = uTimeRef.current;

      gl.setRenderTarget(agentDataRenderTargetB);
      gl.clear();
      gl.render(agentDataSceneB, cameraA);

      agentDataMaterialRefA.current.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetB.texture;
      agentPositionsMaterialRef.current.uniforms.uAgentDataTexture.value =
        agentDataRenderTargetB.texture;
    }

    gl.setRenderTarget(agentPositionsRenderTarget);
    gl.clear();
    gl.render(agentPositionsScene, cameraB);

    if (pingPongRef.current) {
      trailMaterialRefA.current.uniforms.uDelta.value = uDeltaRef.current;
      trailMaterialRefA.current.uniforms.uTime.value = uTimeRef.current;
      trailMaterialRefA.current.uniforms.uAgentPositionsTexture.value =
        agentPositionsRenderTarget.texture;

      gl.setRenderTarget(trailRenderTargetA);
      gl.clear();
      gl.render(trailSceneA, cameraA);

      trailMaterialRefB.current.uniforms.uTrailTexture.value =
        trailRenderTargetA.texture;
      agentDataMaterialRefB.current.uniforms.uTrailTexture.value =
        trailRenderTargetA.texture;
    } else {
      trailMaterialRefB.current.uniforms.uDelta.value = uDeltaRef.current;
      trailMaterialRefB.current.uniforms.uTime.value = uTimeRef.current;
      trailMaterialRefB.current.uniforms.uAgentPositionsTexture.value =
        agentPositionsRenderTarget.texture;

      gl.setRenderTarget(trailRenderTargetB);
      gl.clear();
      gl.render(trailSceneB, cameraA);

      trailMaterialRefA.current.uniforms.uTrailTexture.value =
        trailRenderTargetB.texture;
      agentDataMaterialRefA.current.uniforms.uTrailTexture.value =
        trailRenderTargetB.texture;
    }

    gl.setRenderTarget(null);

    if (pingPongRef.current) {
      slimeMoldDisplayPlaneUniforms.uTrailTexture.value =
        trailRenderTargetA.texture;
    } else {
      slimeMoldDisplayPlaneUniforms.uTrailTexture.value =
        trailRenderTargetB.texture;
    }

    slimeMoldDisplayPlaneUniforms.uAgentPositionsTexture.value =
      agentPositionsRenderTarget.texture;
    slimeMoldDisplayPlaneUniforms.uDelta.value = uDeltaRef.current;
    slimeMoldDisplayPlaneUniforms.uTime.value = uTimeRef.current;
    // @ts-expect-error `map` does exist.
    agentDataDisplayPlaneRef.current.material.map =
      agentDataRenderTargetA.texture;
    // @ts-expect-error `map` does exist.
    agentPositionsDisplayPlaneRef.current.material.map =
      agentPositionsRenderTarget.texture;
    // @ts-expect-error `map` does exist.
    trailDisplayPlaneRef.current.material.map = trailRenderTargetA.texture;

    pingPongRef.current = !pingPongRef.current;
  });

  return (
    <>
      {createPortal(
        <mesh>
          <agentDataMaterial
            ref={agentDataMaterialRefA}
            args={[
              Math.sqrt(agentCount),
              Math.sqrt(agentCount),
              agentDataUniforms,
              displayTextureResolution.x,
              displayTextureResolution.y,
            ]}
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
            args={[
              Math.sqrt(agentCount),
              Math.sqrt(agentCount),
              agentDataUniforms,
              displayTextureResolution.x,
              displayTextureResolution.y,
            ]}
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
            args={[
              displayTextureResolution.x,
              displayTextureResolution.y,
              agentPositionsUniforms,
            ]}
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
            args={[
              displayTextureResolution.x,
              displayTextureResolution.y,
              trailUniforms,
            ]}
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
            args={[
              displayTextureResolution.x,
              displayTextureResolution.y,
              trailUniforms,
            ]}
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
      <Plane ref={agentDataDisplayPlaneRef} visible={false}>
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
      <Plane ref={agentPositionsDisplayPlaneRef} visible={false}>
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
      <Plane ref={trailDisplayPlaneRef} visible={false}>
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
