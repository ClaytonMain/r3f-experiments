import { ReactThreeFiber } from "@react-three/fiber";
import { ExperimentShaderMaterial } from "./ExperimentShaderMaterial";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      experimentShaderMaterial: ReactThreeFiber.Noed<
        typeof ExperimentShaderMaterial &
          JSX.IntrinsicElements["dreiShaderMaterial"]
      >;
    }
  }
}
