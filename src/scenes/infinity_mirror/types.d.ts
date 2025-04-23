import { ReactThreeFiber } from "@react-three/fiber";
import { InfinityMirrorShaderMaterial } from "./InfinityMirrorShaderMaterial";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        infinityMirrorShaderMaterial: ReactThreeFiber.Node<
          typeof InfinityMirrorShaderMaterial &
            JSX.IntrinsicElements["dreiShaderMaterial"]
        >;
      }
    }
  }
}
