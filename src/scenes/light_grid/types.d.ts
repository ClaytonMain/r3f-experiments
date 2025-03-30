import { ReactThreeFiber } from "@react-three/fiber";
import { LightGridShaderMaterial } from "./LightGridShaderMaterial";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      lightGridShaderMaterial: ReactThreeFiber.Node<
        typeof LightGridShaderMaterial &
          JSX.IntrinsicElements["dreiShaderMaterial"]
      >;
    }
  }
}
