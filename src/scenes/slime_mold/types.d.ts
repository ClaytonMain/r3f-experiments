import { ReactThreeFiber } from "@react-three/fiber";
import { AgentMaterial } from "./AgentMaterial";
import { SlimeMoldShaderMaterial } from "./SlimeMoldShaderMaterial";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        slimeMoldShaderMaterial: ReactThreeFiber.Node<
          typeof SlimeMoldShaderMaterial &
            JSX.IntrinsicElements["dreiShaderMaterial"]
        >;
        agentMaterial: ReactThreeFiber.Node<
          typeof AgentMaterial & JSX.IntrinsicElements["shaderMaterial"]
        >;
      }
    }
  }
}
