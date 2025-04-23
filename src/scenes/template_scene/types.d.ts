import { ReactThreeFiber } from "@react-three/fiber";
import { ExperimentShaderMaterial } from "./ExperimentShaderMaterial";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        experimentShaderMaterial: ReactThreeFiber.Node<
          typeof ExperimentShaderMaterial &
            JSX.IntrinsicElements["dreiShaderMaterial"]
        >;
      }
    }
  }
}
