import { Icosahedron, Plane, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  Physics,
  RapierCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useControls } from "leva";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { HEIGHT, WIDTH } from "./consts";
import useGPGPU from "./useGPGPU";

const snowUniforms = {
  uDrawTexture: new THREE.Uniform(new THREE.Texture()),
  uShift: new THREE.Uniform(0.02),
  uPlaneSize: new THREE.Uniform(new THREE.Vector2(WIDTH, HEIGHT)),
  uPlaneScale: new THREE.Uniform(0.2),
  uColor1: new THREE.Uniform(new THREE.Color("#97cced")),
  uColor2: new THREE.Uniform(new THREE.Color("#52a6e2")),
};

export default function Snow() {
  const planeRef = useRef<THREE.Mesh>(null!);
  const ballRef = useRef<RapierRigidBody>(null!);
  const sensorRef = useRef<RapierCollider>(null!);
  const snowRef = useRef<THREE.Mesh>(null!);
  const snowMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null!);

  const heightOffset = -8;
  const planeScale = 0.2;
  const ballRadius = 1;
  const snowHeight = 1;

  const cameraDirection = new THREE.Vector3();
  const impulseDirection = new THREE.Vector3();
  const controlDirection = new THREE.Vector3();

  useControls({
    color1: {
      value: "#97cced",
      onChange: (value) => {
        snowUniforms.uColor1.value = new THREE.Color(value);
        snowMaterialRef.current.color = new THREE.Color(value);
      },
    },
    color2: {
      value: "#5ca0e0",
      onChange: (value) => {
        snowUniforms.uColor2.value = new THREE.Color(value);
      },
    },
    emissive: {
      value: "#000000",
      onChange: (value) => {
        snowMaterialRef.current.emissive = new THREE.Color(value);
      },
    },
    roughness: {
      value: 0.8,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => {
        snowMaterialRef.current.roughness = value;
      },
    },
    metalness: {
      value: 0.3,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (value) => {
        snowMaterialRef.current.metalness = value;
      },
    },
  });

  const snowGeometry = useMemo(() => {
    const geometry = mergeVertices(
      new THREE.BoxGeometry(
        WIDTH * planeScale,
        snowHeight,
        HEIGHT * planeScale,
        Math.floor(WIDTH),
        1,
        Math.floor(HEIGHT),
      ),
    );
    geometry.computeTangents();
    return geometry;
  }, []);

  const { drawTexture } = useGPGPU({
    sensorRef: sensorRef,
    ballRef: ballRef,
    ballRadius: ballRadius,
    planeScale: planeScale,
    snowHeight: snowHeight,
  });

  const [, getKeys] = useKeyboardControls();

  function resetBall() {
    if (ballRef.current) {
      const currentTranslation = ballRef.current.translation();
      ballRef.current.setTranslation(
        {
          x: currentTranslation.x,
          y: Math.abs(heightOffset * 20),
          z: currentTranslation.z,
        },
        true,
      );
      ballRef.current.setTranslation({ x: 0, y: heightOffset + 5, z: 0 }, true);
      ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }

  const elapsedRef = useRef(0);

  useFrame(({ camera }, delta) => {
    const uDelta = Math.min(delta, 0.1);

    elapsedRef.current += uDelta;

    if (ballRef.current && ballRef.current.worldCom().y < heightOffset * 5) {
      resetBall();
    }

    const { forward, backward, left, right } = getKeys();

    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    impulseDirection.set(0, 0, 0);

    if (forward) {
      controlDirection.copy(cameraDirection);
      impulseDirection.add(controlDirection);
    }
    if (backward) {
      controlDirection.copy(cameraDirection).multiplyScalar(-1);
      impulseDirection.add(controlDirection);
    }
    if (left) {
      controlDirection
        .copy(cameraDirection)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
      impulseDirection.add(controlDirection);
    }
    if (right) {
      controlDirection
        .copy(cameraDirection)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
      impulseDirection.add(controlDirection);
    }

    ballRef.current.applyImpulse(
      new THREE.Vector3().copy(impulseDirection).multiplyScalar(50 * uDelta),
      true,
    );
    ballRef.current.applyTorqueImpulse(
      new THREE.Vector3()
        .copy(impulseDirection)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
        .multiplyScalar(50 * uDelta),
      true,
    );

    if (planeRef.current) {
      // @ts-expect-error "map" does exist.
      planeRef.current.material.map = drawTexture.current;
    }

    if (drawTexture.current) {
      snowUniforms.uDrawTexture.value = drawTexture.current;
    }
  });

  return (
    <>
      <Plane
        ref={planeRef}
        args={[WIDTH * planeScale, HEIGHT * planeScale]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={true}
        position={[0, heightOffset, 0]}
      >
        <meshBasicMaterial
          attach="material"
          map={drawTexture.current}
          // transparent
        />
      </Plane>
      <Physics>
        <RigidBody type="fixed" position={[0, heightOffset + 0.5, 0]}>
          <CuboidCollider
            ref={sensorRef}
            args={[(WIDTH * planeScale) / 2, 0.5, (HEIGHT * planeScale) / 2]}
            sensor
          />
        </RigidBody>
        <RigidBody type="fixed" colliders="cuboid">
          <CuboidCollider
            args={[(WIDTH * planeScale) / 2, 0.5, (HEIGHT * planeScale) / 2]}
            position={[0, heightOffset - 0.5, 0]}
            contactSkin={0.1}
          />
        </RigidBody>
        <RigidBody
          ref={ballRef}
          colliders="ball"
          position={[0, heightOffset + 5, 0]}
          canSleep={false}
          restitution={0.2}
          mass={1}
          friction={1}
          angularDamping={1.5}
        >
          <Icosahedron args={[ballRadius, 3]} castShadow receiveShadow>
            <meshStandardMaterial color={"#97cced"} />
          </Icosahedron>
        </RigidBody>
      </Physics>
      <mesh
        ref={snowRef}
        geometry={snowGeometry}
        position={[0, heightOffset + 0.5, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          ref={snowMaterialRef}
          roughness={0.8}
          metalness={0.3}
          emissive={"#000000"}
          // visible={false}
          // flatShading
          // wireframe
          color={"#97cced"}
          onBeforeCompile={(shader) => {
            shader.uniforms.uDrawTexture = snowUniforms.uDrawTexture;
            shader.uniforms.uShift = snowUniforms.uShift;
            shader.uniforms.uPlaneSize = snowUniforms.uPlaneSize;
            shader.uniforms.uPlaneScale = snowUniforms.uPlaneScale;
            shader.uniforms.uColor2 = snowUniforms.uColor2;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
            #include <common>

            attribute vec4 tangent;

            uniform sampler2D uDrawTexture;
            uniform float uShift;
            uniform vec2 uPlaneSize;
            uniform float uPlaneScale;

            varying float vSnowDepth;

            float random(vec2 st) {
              return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            float noise(vec2 n) {
              const vec2 d = vec2(0.0, 1.0);
              vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
              return mix(mix(random(b), random(b + d.yx), f.x), mix(random(b + d.xy), random(b + d.yy), f.x), f.y);
            }

            vec3 rotateAxis(vec3 p, vec3 axis, float angle) {
              return mix(dot(axis, p) * axis, p, cos(angle)) +
                cross(axis, p) * sin(angle);
            }

            vec2 getUv(vec3 position) {
              return position.xz / (uPlaneSize * uPlaneScale) * vec2(1.0, -1.0) + vec2(0.5, 0.5);
            }

            float angleBetweenVectors(vec3 v1, vec3 v2) {
              float dotProduct = dot(v1, v2);
              float magnitudeProduct = length(v1) * length(v2);
              float cosTheta = dotProduct / magnitudeProduct;
              return acos(clamp(cosTheta, -1.0, 1.0));
            }

            float getSnowDepthOffset(float depth, float randomOffset) {
              return pow(abs(sin(PI * depth / 2.0)), 1.5) + (-randomOffset * (1.0 - depth));
            }

            const vec3 UP = vec3(0.0, 1.0, 0.0);`,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <beginnormal_vertex>",
              /* glsl */ `
              float dotNormalUp = dot(normal, UP);

              float randomOffset = noise(uv * 100.0) * 0.05 - 0.05;

              vec3 newPosition = position;
              vec3 newNormal = normal;
              vec3 newTangent = tangent.xyz;

              if (dotNormalUp > 0.5) {
                vec4 drawData = texture2D(uDrawTexture, uv);

                vSnowDepth = getSnowDepthOffset(drawData.r, randomOffset);
                newPosition.y -= vSnowDepth;

                float angle;
                vec3 rotatedTangent;
                vec3 rotatedBiTangent;
                vec3 calculatedNormal;
                vec3 neighborPositionA;
                vec3 neighborPositionB;
                vec2 neighborUvA;
                vec2 neighborUvB;
                float neighborRandomOffsetA;
                float neighborRandomOffsetB;
                vec4 neighborDataA;
                vec4 neighborDataB;
                vec3 toA;
                vec3 toB;
                vec3 neighborCross;
                float strengthFactor;

                // I figured calculating the average normal & tangent based on neighbor
                // displacement would be useful, but it doesn't seem to have much
                // effect on the final result.
                for (int i = 0; i < 4; i++) {
                  angle = PI2 * float(i) / 4.0;
                  rotatedTangent = rotateAxis(newTangent, newNormal, angle);
                  rotatedBiTangent = cross(newNormal, rotatedTangent);

                  neighborPositionA = position + (rotatedTangent * uShift);
                  neighborPositionB = position + (rotatedBiTangent * uShift);

                  neighborUvA = getUv(neighborPositionA);
                  neighborUvB = getUv(neighborPositionB);

                  neighborDataA = texture2D(uDrawTexture, neighborUvA);
                  neighborDataB = texture2D(uDrawTexture, neighborUvB);

                  neighborRandomOffsetA = noise(neighborUvA * 100.0) * 0.05 - 0.05;
                  neighborRandomOffsetB = noise(neighborUvB * 100.0) * 0.05 - 0.05;

                  neighborPositionA.y -= getSnowDepthOffset(neighborDataA.r, neighborRandomOffsetA);
                  neighborPositionB.y -= getSnowDepthOffset(neighborDataB.r, neighborRandomOffsetB);

                  toA = normalize(neighborPositionA - newPosition);
                  toB = normalize(neighborPositionB - newPosition);

                  neighborCross = cross(toA, toB);
                  // strengthFactor = 1.0 - abs(dot(newNormal, neighborCross) * 0.5);

                  calculatedNormal += neighborCross;
                }

                newNormal = normalize(calculatedNormal);
                float angleBetween = angleBetweenVectors(newNormal, UP);
                vec3 normalCross = normalize(cross(newNormal, UP));
                newTangent = normalize(rotateAxis(newTangent, normalCross, angleBetween));
              }
              // start modified <beginnormal_vertex>
              vec3 objectNormal = vec3( newNormal );
              #ifdef USE_TANGENT
                vec3 objectTangent = vec3( newTangent );
              #endif
              // end modified <beginnormal_vertex>
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <begin_vertex>",
              /* glsl */ `
              // start modified <begin_vertex>
              vec3 transformed = vec3( newPosition );
              #ifdef USE_ALPHAHASH
                vPosition = vec3( newPosition );
              #endif
              // end modified <begin_vertex>
              `,
            );
            shader.fragmentShader = shader.fragmentShader.replace(
              "#define STANDARD",
              /* glsl */ `
              #define STANDARD
              uniform vec3 uColor2;
              varying float vSnowDepth;`,
            );
            shader.fragmentShader = shader.fragmentShader.replace(
              "vec4 diffuseColor = vec4( diffuse, opacity );",
              /* glsl */ `
              vec4 diffuseColor = vec4( mix(diffuse, uColor2, vSnowDepth), opacity );`,
            );
          }}
        />
      </mesh>
    </>
  );
}
