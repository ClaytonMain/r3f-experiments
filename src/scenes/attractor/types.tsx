import { MutableRefObject } from "react";
import { SetURLSearchParams } from "react-router";
import * as THREE from "three";

export type AttractorName = "lorenz" | "thomas" | "aizawa";

export interface AttractorConfig {
  uAttractorId: number;
  uSystemCenter: THREE.Vector3;
  uPositionScale: number;
  uVelocityScale: number;
}

export type AttractorConfigs = Record<AttractorName, AttractorConfig>;

export type SearchParamsRef = MutableRefObject<{
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}>;
