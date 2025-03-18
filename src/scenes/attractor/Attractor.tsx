import { Plane } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
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
  updateStringSearchParam,
  validateAttractorParam,
  validateStyleParam,
} from "./sharedFunctions";
import { AttractorName, ColorMode, StyleParams } from "./types";
import useGPGPU from "./useGPGPU";

const particlesUniforms = {
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
  uBlendScale: new THREE.Uniform(0.0),
};

const texturePlaneUniforms = {
  uResolution: new THREE.Uniform(new THREE.Vector2(800, 800)),
};

const styleParams: StyleParams = {
  colorMode: null,
  color1: null,
  color2: null,
  color3: null,
  blendScale: null,
};

export default function Attractor({
  searchParams,
  setSearchParams,
}: {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}) {
  const attractorNameRef = useRef<AttractorName>(
    validateAttractorParam(
      "attractorName",
      searchParams.get("attractorName"),
    ) as AttractorName,
  );
  const { texturePosition, textureVelocity } = useGPGPU({
    searchParams,
    setSearchParams,
  });
  const viewport = useThree((state) => state.viewport);

  const attractorConfig = ATTRACTOR_CONFIGS[attractorNameRef.current];
  particlesUniforms.uSystemCenter.value = attractorConfig.uSystemCenter!;
  particlesUniforms.uPositionScale.value = attractorConfig.uPositionScale!;
  particlesUniforms.uVelocityScale.value = attractorConfig.uVelocityScale!;
  particlesUniforms.uDpr.value = Math.min(viewport.dpr, 2.0);

  const positionPlaneRef = useRef<THREE.Mesh>(null!);
  const velocityPlaneRef = useRef<THREE.Mesh>(null!);
  const pointsRef = useRef<THREE.Points>(null!);

  const particlesGeometry = useMemo(() => {
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

    geometry.setDrawRange(0, DEFAULT_PARTICLE_COUNT);

    return geometry;
  }, []);

  useEffect(() => {
    const initialColorMode = validateStyleParam(
      "colorMode",
      searchParams.get("colorMode"),
    ) as ColorMode;
    const color1 = validateStyleParam("color1", searchParams.get("color1"));
    const color2 = validateStyleParam("color2", searchParams.get("color2"));
    const color3 = validateStyleParam("color3", searchParams.get("color3"));
    const blendScale = validateStyleParam(
      "blendScale",
      searchParams.get("blendScale"),
    );

    styleParams.colorMode = initialColorMode;
    styleParams.color1 = color1;
    styleParams.color2 = color2;
    styleParams.color3 = color3;
    styleParams.blendScale = blendScale;

    particlesUniforms.uColorMode.value = COLOR_MODES.indexOf(initialColorMode);
    particlesUniforms.uColor1.value = new THREE.Color(color1);
    particlesUniforms.uColor2.value = new THREE.Color(color2);
    particlesUniforms.uColor3.value = new THREE.Color(color3);
    particlesUniforms.uBlendScale.value = blendScale;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    for (const [key, value] of Object.entries(styleParams)) {
      const searchParamsValue = searchParams.get(key);
      let newColorMode: ColorMode;
      let newParamValue: string;

      switch (key) {
        case "colorMode":
          newColorMode = validateStyleParam(
            key,
            searchParamsValue,
            value,
          ) as ColorMode;
          if (newColorMode !== value) {
            particlesUniforms.uColorMode.value =
              COLOR_MODES.indexOf(newColorMode);
            styleParams.colorMode = newColorMode;
          }
          break;
        default:
          if (key in styleParams) {
            newParamValue = validateStyleParam(key, searchParamsValue, value);
            if (newParamValue !== value) {
              // @ts-expect-error We'll only get to this point if the key is in styleParams.
              styleParams[key] = newParamValue;
              const uniformKey = `u${key[0].toUpperCase()}${key.slice(1)}`;
              if (uniformKey in particlesUniforms) {
                if (key === "color1" || key === "color2" || key === "color3") {
                  // @ts-expect-error We'll only get to this point if the key is in particlesUniform
                  particlesUniforms[uniformKey].value = new THREE.Color(
                    newParamValue,
                  );
                } else {
                  // @ts-expect-error We'll only get to this point if the key is in particlesUniform
                  particlesUniforms[uniformKey].value = newParamValue;
                }
              }
            }
          }
          break;
      }
    }
  }, [searchParams]);

  const lastEditRef = useRef<number>(Date.now());
  const currentTimeRef = useRef<number>(0);

  useControls(
    "Colors",
    {
      colorMode: {
        value: validateStyleParam(
          "colorMode",
          searchParams.get("colorMode"),
          styleParams.colorMode,
        ) as ColorMode,
        options: COLOR_MODES,
        onChange: (value) => {
          updateStringSearchParam({
            setSearchParams,
            key: "colorMode",
            value,
          });
        },
      },
      color1: {
        value: validateStyleParam(
          "color1",
          searchParams.get("color1"),
          styleParams.color1,
        ),
        render: () =>
          ["single", "double", "triple"].includes(styleParams.colorMode!),
        onChange: (value) => {
          if (Date.now() - lastEditRef.current < 100) return;
          lastEditRef.current = Date.now();
          console.log("value", value);
          updateStringSearchParam({
            setSearchParams,
            key: "color1",
            value,
          });
        },
        onEditEnd: (value) => {
          lastEditRef.current = Date.now();
          updateStringSearchParam({
            setSearchParams,
            key: "color1",
            value,
          });
        },
      },
      color2: {
        value: validateStyleParam(
          "color2",
          searchParams.get("color2"),
          styleParams.color2,
        ),
        render: () => ["double", "triple"].includes(styleParams.colorMode!),
        onChange: (value) => {
          if (Date.now() - lastEditRef.current < 100) return;
          lastEditRef.current = Date.now();
          updateStringSearchParam({
            setSearchParams,
            key: "color2",
            value,
          });
        },
        onEditEnd: (value) => {
          lastEditRef.current = Date.now();
          updateStringSearchParam({
            setSearchParams,
            key: "color2",
            value,
          });
        },
      },
      color3: {
        value: validateStyleParam(
          "color3",
          searchParams.get("color3"),
          styleParams.color3,
        ),
        render: () => styleParams.colorMode === "triple",
        onChange: (value) => {
          if (Date.now() - lastEditRef.current < 100) return;
          lastEditRef.current = Date.now();
          updateStringSearchParam({
            setSearchParams,
            key: "color3",
            value,
          });
        },
        onEditEnd: (value) => {
          lastEditRef.current = Date.now();
          updateStringSearchParam({
            setSearchParams,
            key: "color3",
            value,
          });
        },
      },
      blendScale: {
        value: validateStyleParam(
          "blendScale",
          searchParams.get("blendScale"),
          styleParams.blendScale,
        ),
        min: 0,
        max: 1,
        render: () => ["double", "triple"].includes(styleParams.colorMode!),
        onChange: (value) => {
          if (Date.now() - lastEditRef.current < 100) return;
          lastEditRef.current = Date.now();
          updateStringSearchParam({
            setSearchParams,
            key: "blendScale",
            value,
          });
        },
        onEditEnd: (value) => {
          lastEditRef.current = Date.now();
          updateStringSearchParam({
            setSearchParams,
            key: "blendScale",
            value,
          });
        },
      },
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

  useFrame(({ clock }) => {
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
    if (clock.elapsedTime > currentTimeRef.current + 0.1) {
      currentTimeRef.current = clock.elapsedTime;
    }
  });

  return (
    <>
      {/* <group rotation={[Math.PI / 2, 0, 0]} scale={[1, -1, -1]}> */}
      <group>
        {/* <Icosahedron args={[0.5, 4]}>
          <meshBasicMaterial color={"#2e0952"} wireframe />
        </Icosahedron> */}
        {/* <axesHelper args={[1]} /> */}
        <points
          // scale={attractorConfig.particlesScale}
          // rotation={[Math.PI / 2, 0, 0]}
          ref={pointsRef}
          geometry={particlesGeometry}
        >
          <shaderMaterial
            attach="material"
            uniforms={particlesUniforms}
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
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
              #include <common>
              uniform vec2 uResolution;
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              /* glsl */ `
              #include <project_vertex>
              gl_Position = vec4(position, 1.0) * vec4(0.4 * (uResolution.y / uResolution.x), 0.4, 1.0, 1.0) + vec4(1.0 - (0.4 * (uResolution.y / uResolution.x)) * 0.5, 0.8, 0.0, 0.0);
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
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
              #include <common>
              uniform vec2 uResolution;
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              /* glsl */ `
              #include <project_vertex>
              gl_Position = vec4(position, 1.0) * vec4(0.4 * (uResolution.y / uResolution.x), 0.4, 1.0, 1.0) + vec4(1.0 - (0.4 * (uResolution.y / uResolution.x)) * 0.5, 0.4, 0.0, 0.0);
              `,
            );
          }}
        />
      </Plane>
    </>
  );
}
