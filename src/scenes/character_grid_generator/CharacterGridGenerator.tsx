import {
  OrthographicCamera,
  Plane,
  RenderTexture,
  Text,
  useFBO,
} from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const fontUrl = "./fonts/Roboto_Mono/static/RobotoMono-Regular.ttf";
const characters = "0123456789:";

function CharacterDisplay() {
  const characterIndexRef = useRef(0);
  const [character, setCharacter] = useState(characters[0]);
  useEffect(() => {
    const interval = setInterval(() => {
      const newIndex = (characterIndexRef.current + 1) % characters.length;
      setCharacter(characters.charAt(newIndex));
      characterIndexRef.current = newIndex;
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Text
      position={[0, 0.35, 0]}
      font={fontUrl}
      color={"white"}
      fontSize={10}
      anchorX="center"
      anchorY="middle"
    >
      {character}
    </Text>
  );
}

export default function CharacterGridGenerator() {
  const size = 32;
  const planeRef01 = useRef<THREE.Mesh>(null!);
  const planeRef02 = useRef<THREE.Mesh>(null!);

  const characterIndexRef = useRef(0);
  const [character, setCharacter] = useState(characters[0]);

  const readRenderTargetPixelsFlag = useRef(false);

  const characterDisplayScene = useMemo(() => new THREE.Scene(), []);
  const characterDisplayCamera = useMemo(() => {
    const camera = new THREE.OrthographicCamera(-4, 4, 4, -4, 0.1, 20);
    camera.position.set(0, 0, 10);
    return camera;
  }, []);
  const characterDisplayRenderTarget = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    stencilBuffer: false,
    depthBuffer: false,
    type: THREE.UnsignedByteType,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newIndex = (characterIndexRef.current + 1) % characters.length;
      setCharacter(characters.charAt(newIndex));
      characterIndexRef.current = newIndex;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pixelBuffer = new Uint8Array(size * size * 4);

  useFrame(({ gl }) => {
    gl.setRenderTarget(characterDisplayRenderTarget);
    gl.render(characterDisplayScene, characterDisplayCamera);
    if (readRenderTargetPixelsFlag.current) {
      gl.readRenderTargetPixels(
        characterDisplayRenderTarget,
        0,
        0,
        size,
        size,
        pixelBuffer,
      );
      // For debugging purposes, log the pixel buffer to see the RGBA values.
      console.log("Pixel Buffer:", pixelBuffer);
      readRenderTargetPixelsFlag.current = false;
    }
    gl.setRenderTarget(null);

    if (planeRef02.current) {
      // @ts-expect-error "map" does exist.
      planeRef02.current.material.map = characterDisplayRenderTarget.texture;
    }
  });

  return (
    <>
      <Plane
        position={[0, -5, 0]}
        ref={planeRef01}
        args={[8, 8]}
        onClick={() => {
          console.log(planeRef01.current.material);
        }}
      >
        <meshBasicMaterial>
          <RenderTexture
            width={32}
            height={32}
            attach="map"
            magFilter={THREE.NearestFilter}
            minFilter={THREE.NearestFilter}
          >
            <OrthographicCamera
              makeDefault
              left={-4}
              right={4}
              top={4}
              bottom={-4}
              near={0.1}
              far={20}
              position={[0, 0, 10]}
            />

            <Text
              position={[0, 0.35, 0]}
              font={fontUrl}
              color={"white"}
              fontSize={10}
              anchorX="center"
              anchorY="middle"
            >
              {character}
            </Text>
          </RenderTexture>
        </meshBasicMaterial>
      </Plane>
      <Plane
        position={[0, 5, 0]}
        ref={planeRef02}
        args={[8, 8]}
        onClick={() => {
          readRenderTargetPixelsFlag.current = true;
        }}
      >
        <meshBasicMaterial />
      </Plane>
      {createPortal(<CharacterDisplay />, characterDisplayScene)}
    </>
  );
}
