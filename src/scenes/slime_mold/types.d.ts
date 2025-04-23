import { ReactThreeFiber } from "@react-three/fiber";
import { SlimeMoldShaderMaterial } from "./SlimeMoldShaderMaterial";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        slimeMoldShaderMaterial: ReactThreeFiber.Node<
          typeof SlimeMoldShaderMaterial &
            JSX.IntrinsicElements["dreiShaderMaterial"]
        >;
      }
    }
  }
}
