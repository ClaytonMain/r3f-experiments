import { ReactThreeFiber } from "@react-three/fiber";
import { AgentMaterial } from "./AgentMaterial";
import { TrailMaterial } from "./TrailMaterial";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        agentMaterial: ReactThreeFiber.Node<
          typeof AgentMaterial & JSX.IntrinsicElements["shaderMaterial"]
        >;
        trailMaterial: ReactThreeFiber.Node<
          typeof TrailMaterial & JSX.IntrinsicElements["shaderMaterial"]
        >;
      }
    }
  }
}
