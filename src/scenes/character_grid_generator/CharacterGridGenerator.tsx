import { Fbo, Plane, Text } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export default function CharacterGridGenerator() {
  const renderTargetRef = useRef<THREE.WebGLRenderTarget>(null!);
  const fontUrl = "./fonts/Roboto_Mono/static/RobotoMono-Regular.ttf";

  return (
    <>
      <Plane args={[1, 1]} position={[0, 0, -0.1]} />
      <Fbo
        // @ts-expect-error ref in the docs tho
        ref={renderTargetRef}
        width={512}
        height={512}
        generateMipmaps
        depthBuffer={false}
      >
        {() => (
          <Text
            font={fontUrl}
            color={"white"}
            fontSize={0.1}
            anchorX="center"
            anchorY="middle"
          >
            0
          </Text>
        )}
      </Fbo>
    </>
  );
}
