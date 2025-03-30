import { ReactThreeFiber } from "@react-three/fiber";
import { WallGridShaderMaterial } from "./WallGridShaderMaterial";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      wallGridShaderMaterial: ReactThreeFiber.Node<
        typeof WallGridShaderMaterial &
          JSX.IntrinsicElements["dreiShaderMaterial"]
      >;
    }
  }
}
