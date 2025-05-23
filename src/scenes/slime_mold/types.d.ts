import { ReactThreeFiber } from "@react-three/fiber";
import AgentDataMaterial from "./AgentDataMaterial";
import AgentPositionsMaterial from "./AgentPositionsMaterial";
import TrailMaterial from "./TrailMaterial";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        agentDataMaterial: ReactThreeFiber.Node<
          typeof AgentDataMaterial & JSX.IntrinsicElements["shaderMaterial"]
        >;
        agentPositionsMaterial: ReactThreeFiber.Node<
          typeof AgentPositionsMaterial &
            JSX.IntrinsicElements["shaderMaterial"]
        >;
        trailMaterial: ReactThreeFiber.Node<
          typeof TrailMaterial & JSX.IntrinsicElements["shaderMaterial"]
        >;
      }
    }
  }
}
