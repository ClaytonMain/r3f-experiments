import { Plane } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import AgentMaterial from "./AgentMaterial";

import trailFragmentShader from "./shaders/trail/trail.frag";
import trailVertexShader from "./shaders/trail/trail.vert";

extend({ AgentMaterial });

// Credit to Maxime Heckel for their layout described in this blog post
// upon which this file is based:
// https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

// Also credit to this person for the idea of using points for the trail:
// https://kaesve.nl/projects/mold/summary.html

function FBOSlimeMold() {
  const trailRef = useRef<THREE.Points>(null);
  const agentMaterialRef = useRef<AgentMaterial>(null);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    1 / Math.pow(2, 53),
    1,
  );

  return <points ref={trailRef} />;
}
