import { ReactThreeFiber } from "@react-three/fiber";
import { GameOfLifeShaderMaterial } from "./GameOfLifeShaderMaterial";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        gameOfLifeShaderMaterial: ReactThreeFiber.Node<
          typeof GameOfLifeShaderMaterial &
            JSX.IntrinsicElements["dreiShaderMaterial"]
        >;
      }
    }
  }
}
