import { ReactThreeFiber } from "@react-three/fiber";
import { SlimeMoldShaderMaterial } from "./SlimeMoldShaderMaterial";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      slimeMoldShaderMaterial: ReactThreeFiber.Noed<
        typeof SlimeMoldShaderMaterial &
          JSX.IntrinsicElements["dreiShaderMaterial"]
      >;
    }
  }
}
