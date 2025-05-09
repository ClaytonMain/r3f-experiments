import { ReactThreeFiber } from "@react-three/fiber";
import { AgentDataMaterial } from "./AgentDataMaterial";
import { AgentPositionsMaterial } from "./AgentPositionsMaterial";

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
      }
    }
  }
}
