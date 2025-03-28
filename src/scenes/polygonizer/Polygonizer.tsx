import {
  Box,
  Grid,
  Icosahedron,
  Stage,
  Torus,
  TorusKnot,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import * as THREE from "three";

const uniforms = {
  uScale: new THREE.Uniform(16),
};

export default function Polygonizer() {
  const boxRef = useRef<THREE.Mesh>(null!);
  const torusRef = useRef<THREE.Mesh>(null!);
  const sphereRef = useRef<THREE.Mesh>(null!);
  const torusKnotRef = useRef<THREE.Mesh>(null!);

  const xRotationSpeedRef = useRef(0.05);
  const yRotationSpeedRef = useRef(0.05);
  const zRotationSpeedRef = useRef(0.05);

  const { color, emissive, roughness, metalness, reflectivity, wireframe } =
    useControls({
      xRotationSpeed: {
        value: 0.5,
        min: 0,
        max: 10,
        step: 0.1,
        onChange: (value) => {
          xRotationSpeedRef.current = value / 10;
        },
      },
      yRotationSpeed: {
        value: 0.5,
        min: 0,
        max: 10,
        step: 0.1,
        onChange: (value) => {
          yRotationSpeedRef.current = value / 10;
        },
      },
      zRotationSpeed: {
        value: 0.5,
        min: 0,
        max: 10,
        step: 0.1,
        onChange: (value) => {
          zRotationSpeedRef.current = value / 10;
        },
      },
      polygonScale: {
        value: uniforms.uScale.value,
        min: 1,
        max: 64,
        step: 1,
        onChange: (value) => {
          uniforms.uScale.value = value;
        },
      },
      color: {
        value: "#d53a3a",
      },
      emissive: {
        value: "#000000",
      },
      roughness: {
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
      },
      metalness: {
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
      },
      reflectivity: {
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
      },
      wireframe: {
        value: false,
      },
    });

  const Material = (
    <meshPhysicalMaterial
      // ref={materialRef}
      onBeforeCompile={(shader) => {
        shader.uniforms.uScale = uniforms.uScale;
        shader.vertexShader = shader.vertexShader.replace(
          "#include <common>",
          /* glsl */ `
              #include <common>
              uniform float uScale;

              vec3 orientations[6] = vec3[6](
                vec3(1.0, 0.0, 0.0),
                vec3(-1.0, 0.0, 0.0),
                vec3(0.0, 1.0, 0.0),
                vec3(0.0, -1.0, 0.0),
                vec3(0.0, 0.0, 1.0),
                vec3(0.0, 0.0, -1.0)
              );

              vec3 vNewNormal;
              `,
        );
        shader.vertexShader = shader.vertexShader.replace(
          "#include <defaultnormal_vertex>", // Line 601 compiled
          /* glsl */ `
              #include <defaultnormal_vertex>
              vec3 newTransformedNormal;
              vec3 viewDirection = normalize( vViewPosition );
              float viewDotSign = sign( dot( transformedNormal, viewDirection ) );
              float maxDot = 0.0;
              float newDot;
              for (int i = 0; i < 6; i++) {
                newDot = dot(transformedNormal, orientations[i]);
                if (newDot > maxDot) {
                  maxDot = newDot;
                  newTransformedNormal = orientations[i];
                  // if(sign(dot(newTransformedNormal, viewDirection)) != viewDotSign) {
                  //   newTransformedNormal = -newTransformedNormal;
                  // }
                }
              }
              transformedNormal = newTransformedNormal;
              vNewNormal = transformedNormal;
              // vNormal = normalize( transformedNormal );
              `,
        );
        shader.vertexShader = shader.vertexShader.replace(
          "#include <project_vertex>",
          /* glsl */ `
            // vec4 mvPosition = vec4( round(transformed * roundFactor) / roundFactor, 1.0 );
            vec4 mvPosition = vec4( transformed, 1.0 );
            #ifdef USE_BATCHING
              mvPosition = batchingMatrix * mvPosition;
            #endif
            #ifdef USE_INSTANCING
              mvPosition = instanceMatrix * mvPosition;
            #endif
            mvPosition = round(modelMatrix * mvPosition * uScale) / uScale;
            mvPosition = viewMatrix * mvPosition;
            gl_Position = projectionMatrix * mvPosition;
              `,
        );
      }}
      flatShading
      color={color}
      emissive={emissive}
      roughness={roughness}
      metalness={metalness}
      reflectivity={reflectivity}
      wireframe={wireframe}
    />
  );

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);

    boxRef.current.rotation.x += d * xRotationSpeedRef.current;
    boxRef.current.rotation.y += d * yRotationSpeedRef.current;
    boxRef.current.rotation.z += d * zRotationSpeedRef.current;

    torusRef.current.rotation.x += d * xRotationSpeedRef.current;
    torusRef.current.rotation.y += d * yRotationSpeedRef.current;
    torusRef.current.rotation.z += d * zRotationSpeedRef.current;

    sphereRef.current.rotation.x += d * xRotationSpeedRef.current;
    sphereRef.current.rotation.y += d * yRotationSpeedRef.current;
    sphereRef.current.rotation.z += d * zRotationSpeedRef.current;

    torusKnotRef.current.rotation.x += d * xRotationSpeedRef.current;
    torusKnotRef.current.rotation.y += d * yRotationSpeedRef.current;
    torusKnotRef.current.rotation.z += d * zRotationSpeedRef.current;
  });

  return (
    <group>
      <Grid args={[10, 10, 10]} position={[0, -2.01, 0]} />
      <Stage adjustCamera={1.5}>
        <Box
          ref={boxRef}
          args={[1, 1, 1, 20, 20, 20]}
          position={[1, 1, 0]}
          castShadow
          receiveShadow
        >
          {Material}
        </Box>
        <Torus
          ref={torusRef}
          args={[0.5, 0.2, 16, 50]}
          position={[1, -1, 0]}
          castShadow
          receiveShadow
        >
          {Material}
        </Torus>
        <Icosahedron
          ref={sphereRef}
          args={[0.5, 4]}
          position={[-1, 1, 0]}
          castShadow
          receiveShadow
        >
          {Material}
        </Icosahedron>
        <TorusKnot
          ref={torusKnotRef}
          args={[0.5, 0.2, 100, 16]}
          position={[-1, -1, 0]}
          castShadow
          receiveShadow
        >
          {Material}
        </TorusKnot>
      </Stage>
    </group>
  );
}
