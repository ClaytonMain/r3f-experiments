import { ReactThreeFiber } from "@react-three/fiber";
import { InfinityMirrorShaderMaterial } from "./InfinityMirrorShaderMaterial";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      infinityMirrorShaderMaterial: ReactThreeFiber.Noed<
        typeof InfinityMirrorShaderMaterial &
          JSX.IntrinsicElements["dreiShaderMaterial"]
      >;
    }
  }
}
