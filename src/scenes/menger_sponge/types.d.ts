import { ReactThreeFiber } from "@react-three/fiber";
import { MengerSpongeShaderMaterial } from "./MengerSpongeShaderMaterial";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mengerSpongeShaderMaterial: ReactThreeFiber.Noed<
        typeof MengerSpongeShaderMaterial &
          JSX.IntrinsicElements["dreiShaderMaterial"]
      >;
    }
  }
}
