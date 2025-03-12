import { useSearchParams } from "react-router";
import { ATTRACTOR_NAMES } from "../consts";
import { AttractorName } from "../types";

export default function useAttractorName() {
  const [searchParams] = useSearchParams();
  const attractorName = searchParams.get("attractorName");
  if (ATTRACTOR_NAMES.includes(attractorName as AttractorName)) {
    return attractorName as AttractorName;
  }
  return "lorenz";
}
