import { Icosahedron, Plane } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import { SetURLSearchParams } from "react-router";
import * as THREE from "three";
import {
  ATTRACTOR_CONFIGS,
  COLOR_MODES,
  DEFAULT_PARTICLE_COUNT,
  TEXTURE_WIDTH,
} from "./consts";
import particlesFragmentShader from "./shaders/particles/particles.frag";
import particlesVertexShader from "./shaders/particles/particles.vert";
import {
  getValidatedAttractorParam,
  getValidatedStyleParam,
  updateSearchParam,
} from "./sharedFunctions";
import { AttractorName, ParticlesUniforms } from "./types";
import useGPGPU from "./useGPGPU";

const particlesUniforms: ParticlesUniforms = {
  uTime: new THREE.Uniform(0.0),
  uTexturePosition: new THREE.Uniform(new THREE.Texture()),
  uTextureVelocity: new THREE.Uniform(new THREE.Texture()),
  uSystemCenter: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  uPositionScale: new THREE.Uniform(1.0),
  uVelocityScale: new THREE.Uniform(1.0),
  uDpr: new THREE.Uniform(1.0),

  uColorMode: new THREE.Uniform(0),
  uColor1: new THREE.Uniform(new THREE.Color("#000000")),
  uColor2: new THREE.Uniform(new THREE.Color("#000000")),
  uColor3: new THREE.Uniform(new THREE.Color("#000000")),
  uBlendCenter: new THREE.Uniform(0.0),
  uBlendScale: new THREE.Uniform(0.0),
  uBlendSharpness: new THREE.Uniform(0.0),
  uPositionRandomization: new THREE.Uniform(0.0),
};

const texturePlaneUniforms = {
  uResolution: new THREE.Uniform(new THREE.Vector2(800, 800)),
  uShowTexture: new THREE.Uniform(1),
};

export default function Attractor({
  searchParams,
  setSearchParams,
}: {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}) {
  const { texturePosition, textureVelocity } = useGPGPU({
    searchParams,
    setSearchParams,
  });
  const viewport = useThree((state) => state.viewport);
  const attractorNameRef = useRef<AttractorName>(
    getValidatedAttractorParam(searchParams, "attractorName"),
  );
  const colorTimeScaleRef = useRef<number>(0.01);

  function handleAttractorNameChange(value: AttractorName) {
    if (value === attractorNameRef.current) return;
    attractorNameRef.current = value;
    const attractorConfig = ATTRACTOR_CONFIGS[value];
    particlesUniforms.uSystemCenter.value = attractorConfig.uSystemCenter;
    particlesUniforms.uPositionScale.value = attractorConfig.uPositionScale;
    particlesUniforms.uVelocityScale.value = attractorConfig.uVelocityScale;
  }

  // On load, set the particlesUniforms based on the searchParams.
  useEffect(() => {
    // Get the attractorName from the searchParams and validate it. If the parameter name
    // is invalid, the default value will be used.
    const attractorName = getValidatedAttractorParam(
      searchParams,
      "attractorName",
    );
    // The attractorConfig contains uniform values for the attractor that the end-user
    // cannot change (to help ensure consistent visuals between attractors).
    const attractorConfig = ATTRACTOR_CONFIGS[attractorName];
    particlesUniforms.uSystemCenter.value = attractorConfig.uSystemCenter;
    particlesUniforms.uPositionScale.value = attractorConfig.uPositionScale;
    particlesUniforms.uVelocityScale.value = attractorConfig.uVelocityScale;
    particlesUniforms.uDpr.value = Math.min(viewport.dpr, 2.0);

    // The following uniforms can be set by the end-user, so we need to use any existing
    // values in the searchParams.
    const colorMode = getValidatedStyleParam(searchParams, "colorMode");
    particlesUniforms.uColorMode.value = COLOR_MODES.indexOf(colorMode);
    particlesUniforms.uColor1.value = new THREE.Color(
      getValidatedStyleParam(searchParams, "color1"),
    );
    particlesUniforms.uColor2.value = new THREE.Color(
      getValidatedStyleParam(searchParams, "color2"),
    );
    particlesUniforms.uColor3.value = new THREE.Color(
      getValidatedStyleParam(searchParams, "color3"),
    );
    particlesUniforms.uBlendCenter.value = getValidatedStyleParam(
      searchParams,
      "blendCenter",
    );
    particlesUniforms.uBlendScale.value = getValidatedStyleParam(
      searchParams,
      "blendScale",
    );
    particlesUniforms.uBlendSharpness.value = getValidatedStyleParam(
      searchParams,
      "blendSharpness",
    );
    particlesUniforms.uPositionRandomization.value = getValidatedStyleParam(
      searchParams,
      "positionRandomization",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const positionPlaneRef = useRef<THREE.Mesh>(null!);
  const velocityPlaneRef = useRef<THREE.Mesh>(null!);
  const pointsRef = useRef<THREE.Points>(null!);

  const particlesGeometry = useMemo(() => {
    // TODO: Refactor this to put the references into the positions array
    // and get rid of the references array. Just taking up memmory that doesn't
    // need to be used. This should be fine since the "positions" array doesn't
    // actually get updated within the geometry, so the references values
    // will be static.
    const references = new Float32Array(DEFAULT_PARTICLE_COUNT * 2);
    const positions = new Float32Array(DEFAULT_PARTICLE_COUNT * 3);
    for (let i = 0; i < DEFAULT_PARTICLE_COUNT; i++) {
      const i2 = i * 2;

      references[i2 + 0] = (i % TEXTURE_WIDTH) / (TEXTURE_WIDTH - 1);
      references[i2 + 1] = ~~(i / TEXTURE_WIDTH) / (TEXTURE_WIDTH - 1);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "aReference",
      new THREE.BufferAttribute(references, 2),
    );

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // TODO: Check if this is necessary.
    geometry.setDrawRange(0, DEFAULT_PARTICLE_COUNT);

    return geometry;
  }, []);

  useEffect(() => {
    const attractorName = getValidatedAttractorParam(
      searchParams,
      "attractorName",
    );
    handleAttractorNameChange(attractorName);
  }, [searchParams]);

  const currentTimeRef = useRef<number>(0);

  function updateParticlesUniform<K extends keyof ParticlesUniforms>(
    key: K,
    value: ParticlesUniforms[K]["value"],
  ) {
    particlesUniforms[key].value = value;
  }

  useControls(
    {
      Colors: folder({
        colorMode: {
          value: getValidatedStyleParam(searchParams, "colorMode"),
          options: COLOR_MODES,
          onChange: (value) => {
            updateParticlesUniform("uColorMode", COLOR_MODES.indexOf(value));
            updateSearchParam(setSearchParams, "colorMode", value);
          },
        },
        color1: {
          value: getValidatedStyleParam(searchParams, "color1"),
          render: () => [0, 1, 2].includes(particlesUniforms.uColorMode.value),
          onChange: (value) => {
            updateParticlesUniform("uColor1", new THREE.Color(value));
          },
          onEditEnd: (value) => {
            updateParticlesUniform("uColor1", new THREE.Color(value));
            updateSearchParam(setSearchParams, "color1", value);
          },
        },
        color2: {
          value: getValidatedStyleParam(searchParams, "color2"),
          render: () => [1, 2].includes(particlesUniforms.uColorMode.value),
          onChange: (value) => {
            updateParticlesUniform("uColor2", new THREE.Color(value));
          },
          onEditEnd: (value) => {
            updateParticlesUniform("uColor2", new THREE.Color(value));
            updateSearchParam(setSearchParams, "color2", value);
          },
        },
        color3: {
          value: getValidatedStyleParam(searchParams, "color3"),
          render: () => [2].includes(particlesUniforms.uColorMode.value),
          onChange: (value) => {
            updateParticlesUniform("uColor3", new THREE.Color(value));
          },
          onEditEnd: (value) => {
            updateParticlesUniform("uColor3", new THREE.Color(value));
            updateSearchParam(setSearchParams, "color3", value);
          },
        },
        blendCenter: {
          value: getValidatedStyleParam(searchParams, "blendCenter"),
          min: 0,
          max: 1,
          step: 0.01,
          render: () => [1, 2].includes(particlesUniforms.uColorMode.value),
          onChange: (value) => {
            updateParticlesUniform("uBlendCenter", value);
          },
          onEditEnd: (value) => {
            updateParticlesUniform("uBlendCenter", value);
            updateSearchParam(setSearchParams, "blendCenter", value);
          },
        },
        blendScale: {
          value: getValidatedStyleParam(searchParams, "blendScale"),
          min: 0,
          max: 1,
          step: 0.01,
          render: () => [2, 3].includes(particlesUniforms.uColorMode.value),
          onChange: (value) => {
            updateParticlesUniform("uBlendScale", value);
          },
          onEditEnd: (value) => {
            updateParticlesUniform("uBlendScale", value);
            updateSearchParam(setSearchParams, "blendScale", value);
          },
        },
        blendSharpness: {
          value: getValidatedStyleParam(searchParams, "blendSharpness"),
          min: 0,
          max: 1,
          step: 0.01,
          render: () => [1, 2].includes(particlesUniforms.uColorMode.value),
          onChange: (value) => {
            updateParticlesUniform("uBlendSharpness", 1 - value);
          },
          onEditEnd: (value) => {
            updateParticlesUniform("uBlendSharpness", 1 - value);
            updateSearchParam(setSearchParams, "blendSharpness", 1 - value);
          },
        },
        colorTimeScale: {
          value: getValidatedStyleParam(searchParams, "colorTimeScale"),
          min: 0,
          max: 1,
          step: 0.01,
          render: () => [3].includes(particlesUniforms.uColorMode.value),
          onChange: (value) => {
            colorTimeScaleRef.current = value;
          },
          onEditEnd: (value) => {
            colorTimeScaleRef.current = value;
            updateSearchParam(setSearchParams, "colorTimeScale", value);
          },
        },
      }),
      "Position Style": folder({
        positionRandomization: {
          value: getValidatedStyleParam(searchParams, "positionRandomization"),
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (value) => {
            updateParticlesUniform("uPositionRandomization", value);
          },
          onEditEnd: (value) => {
            updateParticlesUniform("uPositionRandomization", value);
            updateSearchParam(setSearchParams, "positionRandomization", value);
          },
        },
      }),
      Misc: folder({
        showGPGPUTextures: {
          value: true,
          onChange: (value) => {
            texturePlaneUniforms.uShowTexture.value = value ? 1 : 0;
          },
        },
      }),
    },
    [currentTimeRef.current],
  );

  useEffect(() => {
    if (viewport.width && viewport.height) {
      texturePlaneUniforms.uResolution.value.set(
        viewport.width,
        viewport.height,
      );
    }
    if (viewport.dpr) {
      particlesUniforms.uDpr.value = Math.min(viewport.dpr, 2.0);
    }
  }, [viewport]);

  const uTimeRef = useRef<number>(0);

  useFrame(({ clock }, delta) => {
    const uDelta =
      Math.min(delta, 0.05) * Math.pow(colorTimeScaleRef.current, 3.0);
    uTimeRef.current += uDelta;

    particlesUniforms.uTime.value = uTimeRef.current;
    if (
      pointsRef.current &&
      texturePosition.current &&
      textureVelocity.current
    ) {
      particlesUniforms.uTexturePosition.value = texturePosition.current;
      particlesUniforms.uTextureVelocity.value = textureVelocity.current;
      // particlesUniforms.uDpr.value = Math.min(viewport.dpr, 2.0);
      if (positionPlaneRef.current) {
        // @ts-expect-error 'map' does exist.
        positionPlaneRef.current.material.map = texturePosition.current;
      }
      if (velocityPlaneRef.current) {
        // @ts-expect-error 'map' does exist.
        velocityPlaneRef.current.material.map = textureVelocity.current;
      }
    }
    if (clock.elapsedTime > currentTimeRef.current + 0.5) {
      currentTimeRef.current = clock.elapsedTime;
    }
  });

  return (
    <>
      {/* <group rotation={[Math.PI / 2, 0, 0]} scale={[1, -1, -1]}> */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <Icosahedron args={[0.5, 4]}>
          <meshBasicMaterial visible={false} color={"#2e0952"} wireframe />
        </Icosahedron>
        {/* <axesHelper args={[1]} /> */}
        <points
          // scale={attractorConfig.particlesScale}
          // rotation={[Math.PI / 2, 0, 0]}
          ref={pointsRef}
          geometry={particlesGeometry}
        >
          <shaderMaterial
            attach="material"
            uniforms={
              particlesUniforms as unknown as {
                [uniform: string]: THREE.IUniform;
              }
            }
            fragmentShader={particlesFragmentShader}
            vertexShader={particlesVertexShader}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
            depthTest={false}
          />
        </points>
      </group>
      <Plane ref={positionPlaneRef}>
        <meshBasicMaterial
          attach="material"
          map={texturePosition.current}
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
      <Plane ref={velocityPlaneRef}>
        <meshBasicMaterial
          attach="material"
          map={textureVelocity.current}
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
