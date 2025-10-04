import { Plane, Text, useFBO } from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const fontUrl = "./fonts/Roboto_Mono/static/RobotoMono-Regular.ttf";
const fontName = "roboto_mono";
const characters = "0123456789:";

function CharacterDisplay({ character }: { character: string }) {
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
  const currentCharacterIndex = useRef(0);
  const saved = useRef(false);

  const [character, setCharacter] = useState(characters[0]);
  const [characterData, setCharacterData] = useState<Record<string, number[]>>(
    {},
  );
  const size = 32;
  const planeRef = useRef<THREE.Mesh>(null!);

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
    format: THREE.RedFormat,
  });

  const pixelBuffer = new Uint8Array(size * size);

  useFrame(({ gl }) => {
    gl.setRenderTarget(characterDisplayRenderTarget);
    gl.render(characterDisplayScene, characterDisplayCamera);
    if (currentCharacterIndex.current < characters.length) {
      const currentCharacter = characters[currentCharacterIndex.current];
      setCharacter(currentCharacter);
      gl.readRenderTargetPixels(
        characterDisplayRenderTarget,
        0,
        0,
        size,
        size,
        pixelBuffer,
      );
      setCharacterData((prev) => ({
        ...prev,
        [currentCharacter]: Array.from(pixelBuffer),
      }));
      currentCharacterIndex.current += 1;
    } else if (!saved.current) {
      saved.current = true;
      const blob = new Blob([JSON.stringify({ [size]: characterData })], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `character_data_${fontName}_${size}.json`;
      a.click();
      URL.revokeObjectURL(url);
      console.log("Character data saved:", characterData);
    }
    gl.setRenderTarget(null);

    if (planeRef.current) {
      // @ts-expect-error "map" does exist.
      planeRef.current.material.map = characterDisplayRenderTarget.texture;
    }
  });

  return (
    <>
      <Plane position={[0, 0, 0]} ref={planeRef} args={[8, 8]}>
        <meshBasicMaterial />
      </Plane>
      {createPortal(
        <CharacterDisplay character={character} />,
        characterDisplayScene,
      )}
    </>
  );
}
