import {
  Box,
  Icosahedron,
  Plane,
  useKeyboardControls,
} from "@react-three/drei";
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
  uColor2: new THREE.Uniform(new THREE.Color("#5ca0e0")),
};

export default function Snow() {
  const planeRef = useRef<THREE.Mesh>(null!);
  const ballRef = useRef<RapierRigidBody>(null!);
  const sensorRef = useRef<RapierCollider>(null!);
  const snowRef = useRef<THREE.Mesh>(null!);
  const snowMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null!);

  const heightOffset = -10;
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

  const [subscribeKeys, getKeys] = useKeyboardControls();

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

    if (
      ballRef.current &&
      ballRef.current.numColliders() > 0 &&
      elapsedRef.current > 5.0
    ) {
      const point1 = sensorRef.current.contactCollider(
        ballRef.current.collider(0),
        0.1,
      )?.point1;
      const point2 = sensorRef.current.contactCollider(
        ballRef.current.collider(0),
        0.1,
      )?.point2;
      console.log("point1", point1);
      console.log("point2", point2);

      if (point1?.x && point1?.z) {
        console.log(point1?.x / (WIDTH * planeScale) + 0.5);
        console.log(point1?.z / (HEIGHT * planeScale) + 0.5);
      }

      if (point1 && point2) {
        console.log("intersect depth", point1.y - point2.y);
      }

      elapsedRef.current = 0;
    }

    if (ballRef.current && ballRef.current.worldCom().y < heightOffset * 5) {
      resetBall();
    }

    const { forward, backward, left, right, jump, reset } = getKeys();

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
      <axesHelper />
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
      <Physics debug>
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
            <meshStandardMaterial flatShading color={"#08bec4"} />
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
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              /* glsl */ `
            #include <common>
            attribute vec4 tangent;

            uniform sampler2D uDrawTexture;
            uniform float uShift;
            uniform vec2 uPlaneSize;
            uniform float uPlaneScale;

            const vec3 UP = vec3(0.0, 1.0, 0.0);`,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <beginnormal_vertex>",
              /* glsl */ `
              float dotNormalUp = dot(normal, UP);

              vec3 newPosition = position;
              vec3 newNormal = normal;

              if (dotNormalUp > 0.5) {
                vec4 drawData = texture2D(uDrawTexture, uv);

                newPosition.y -= pow(abs(sin(PI * drawData.r / 2.0)), 0.5);

                vec3 biTangent = cross(newNormal, tangent.xyz);

                vec3 neighborPositionA = position + (tangent.xyz * uShift);
                vec3 neighborPositionB = position + (biTangent * uShift);

                vec2 neighborUvA = neighborPositionA.xz / (uPlaneSize * uPlaneScale);
                vec2 neighborUvB = neighborPositionB.xz / (uPlaneSize * uPlaneScale);

                neighborUvA *= vec2(1.0, -1.0);
                neighborUvA += vec2(0.5, 0.5);

                neighborUvB *= vec2(1.0, -1.0);
                neighborUvB += vec2(0.5, 0.5);

                neighborUvA = uv + vec2(0.001, 0.0);
                neighborUvB = uv + vec2(0.0, 0.001);

                vec4 neighborDataA = texture2D(uDrawTexture, neighborUvA);
                vec4 neighborDataB = texture2D(uDrawTexture, neighborUvB);

                neighborPositionA.y -= pow(abs(sin(PI * neighborDataA.r / 2.0)), 0.5);
                neighborPositionB.y -= pow(abs(sin(PI * neighborDataB.r / 2.0)), 0.5);

                vec3 toA = normalize(neighborPositionA - newPosition);
                vec3 toB = normalize(neighborPositionB - newPosition);

                newNormal = cross(toA, toB);
              }
              // start modified <beginnormal_vertex>
              vec3 objectNormal = vec3( newNormal );
              #ifdef USE_TANGENT
                vec3 objectTangent = vec3( tangent.xyz );
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
            console.log(shader.fragmentShader);
          }}
        />
      </mesh>
    </>
  );
}
