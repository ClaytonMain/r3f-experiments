import { useSearchParams } from "react-router";
import { DEFAULT_SCENE, SCENES } from "../shared/consts";
import { ValidScene } from "../shared/types";

export default function useScene() {
  const [searchParams] = useSearchParams();
  const scene = searchParams.get("scene") || DEFAULT_SCENE;
  if (SCENES.includes(scene as ValidScene)) {
    return scene as ValidScene;
  }
  return DEFAULT_SCENE;
}
