import { ReactThreeFiber } from "@react-three/fiber";
import { MengerSpongeShaderMaterial } from "./MengerSpongeShaderMaterial";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        mengerSpongeShaderMaterial: ReactThreeFiber.Node<
          typeof MengerSpongeShaderMaterial &
            JSX.IntrinsicElements["dreiShaderMaterial"]
        >;
      }
    }
  }
}
