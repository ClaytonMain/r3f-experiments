import { SetURLSearchParams } from "react-router";
import {
  ATTRACTOR_NAMES,
  COLOR_MODES,
  DEFAULT_ATTRACTOR_PARAMS,
  DEFAULT_STYLE_PARAMS,
} from "./consts";
import {
  AttractorName,
  AttractorParams,
  ColorMode,
  StyleParams,
} from "./types";

function getValidAttractorName(
  attemptedAttractorName: string | null,
  previousAttractorName?: string | null,
): AttractorName {
  if (ATTRACTOR_NAMES.includes(attemptedAttractorName as AttractorName)) {
    return attemptedAttractorName as AttractorName;
  } else if (
    previousAttractorName &&
    ATTRACTOR_NAMES.includes(previousAttractorName as AttractorName)
  ) {
    return previousAttractorName as AttractorName;
  } else {
    return DEFAULT_ATTRACTOR_PARAMS.attractorName as AttractorName;
  }
}

function getParsedAttemptedAndPreviousNumeric(
  attemptedParamValue: string | null,
  previousParamValue?: number | null,
) {
  const parsedAttempted = attemptedParamValue
    ? parseFloat(attemptedParamValue)
    : null;
  const parsedPrevious = previousParamValue
    ? parseFloat(previousParamValue.toString())
    : null;
  return { parsedAttempted, parsedPrevious };
}

export function validateAttractorParam(
  paramName: string,
  attemptedParamValue: string | null,
  previousParamValue?: string | number | null,
) {
  if (paramName === "attractorName") {
    return getValidAttractorName(
      attemptedParamValue,
      previousParamValue ? previousParamValue.toString() : null,
    );
  } else if (paramName in DEFAULT_ATTRACTOR_PARAMS) {
    const { parsedAttempted, parsedPrevious } =
      getParsedAttemptedAndPreviousNumeric(
        attemptedParamValue,
        previousParamValue as number,
      );
    return (
      // @ts-expect-error We'll only get here if paramName is in DEFAULT_ATTRACTOR_PARAMS.
      parsedAttempted ?? parsedPrevious ?? DEFAULT_ATTRACTOR_PARAMS[paramName]
    );
  }
}

function getValidColorMode(
  attemptedColorMode: string | null,
  previousColorMode?: string | null,
): ColorMode {
  if (COLOR_MODES.includes(attemptedColorMode as ColorMode)) {
    return attemptedColorMode as ColorMode;
  } else if (
    previousColorMode &&
    COLOR_MODES.includes(previousColorMode as ColorMode)
  ) {
    return previousColorMode as ColorMode;
  } else {
    return DEFAULT_STYLE_PARAMS.colorMode as ColorMode;
  }
}

function getParsedAttemptedAndPreviousString(
  attemptedParamValue: string | null,
  previousParamValue?: string | null,
) {
  const parsedAttempted = attemptedParamValue;
  const parsedPrevious = previousParamValue ? previousParamValue : null;
  return { parsedAttempted, parsedPrevious };
}

export function validateStyleParam(
  paramName: string,
  attemptedParamValue: string | null,
  previousParamValue?: string | number | null,
) {
  if (paramName === "colorMode") {
    return getValidColorMode(
      attemptedParamValue,
      previousParamValue ? previousParamValue.toString() : null,
    );
  } else if (paramName in DEFAULT_STYLE_PARAMS) {
    let parsedAttempted;
    let parsedPrevious;
    // @ts-expect-error We'll only get here if paramName is in DEFAULT_STYLE_PARAMS.
    if (typeof DEFAULT_STYLE_PARAMS[paramName] === "string") {
      ({ parsedAttempted, parsedPrevious } =
        getParsedAttemptedAndPreviousString(
          attemptedParamValue,
          previousParamValue as string,
        ));
    } else {
      ({ parsedAttempted, parsedPrevious } =
        getParsedAttemptedAndPreviousNumeric(
          attemptedParamValue,
          previousParamValue as number,
        ));
    }
    return (
      // @ts-expect-error We'll only get here if paramName is in DEFAULT_STYLE_PARAMS.
      parsedAttempted ?? parsedPrevious ?? DEFAULT_STYLE_PARAMS[paramName]
    );
  }
}

export function updateNumericSearchParam({
  setSearchParams,
  key,
  value,
  decimalPlaces = 2,
}: {
  setSearchParams: SetURLSearchParams;
  key: string;
  value: number;
  decimalPlaces?: number;
}) {
  setSearchParams(
    (prev) => {
      const props = prev;
      props.set(key, value.toFixed(decimalPlaces));
      return props;
    },
    {
      replace: true,
    },
  );
}

export function updateStringSearchParam({
  setSearchParams,
  key,
  value,
}: {
  setSearchParams: SetURLSearchParams;
  key: string;
  value: string;
}) {
  setSearchParams(
    (prev) => {
      const props = prev;
      props.set(key, value);
      return props;
    },
    {
      replace: true,
    },
  );
}

export function updateSearchParam(
  setSearchParams: SetURLSearchParams,
  key: string,
  value: string | number,
) {
  let updatedValue = value;
  if (typeof value === "number") {
    updatedValue = value.toFixed(2);
  }
  setSearchParams(
    (prev) => {
      const props = prev;
      props.set(key, updatedValue.toString());
      return props;
    },
    {
      replace: true,
    },
  );
}

export function getValidatedAttractorParam<
  P extends AttractorParams,
  K extends keyof AttractorParams,
>(
  searchParams: URLSearchParams,
  paramName: K,
  attemptedParamValue?: unknown,
  previousParamValue?: P[K],
): P[K] {
  const currentSearchParamValue = searchParams.get(paramName);
  const defaultValue = DEFAULT_ATTRACTOR_PARAMS[paramName];
  const potentialValues = [
    attemptedParamValue,
    currentSearchParamValue,
    previousParamValue,
  ];

  if (typeof defaultValue === "number") {
    potentialValues.forEach(
      (value, i) =>
        (potentialValues[i] = value ? parseFloat(value.toString()) : null),
    );
  }

  for (const value of potentialValues) {
    if (value) {
      if (
        paramName === "attractorName" &&
        ATTRACTOR_NAMES.includes(value as AttractorName)
      ) {
        return value as P[K];
      } else if (typeof value === typeof defaultValue) {
        return value as P[K];
      }
    }
  }
  return defaultValue as P[K];
}

export function getValidatedStyleParam<
  P extends StyleParams,
  K extends keyof StyleParams,
>(
  searchParams: URLSearchParams,
  paramName: K,
  attemptedParamValue?: unknown,
  previousParamValue?: P[K],
): P[K] {
  const currentSearchParamValue = searchParams.get(paramName);
  const defaultValue = DEFAULT_STYLE_PARAMS[paramName];
  const potentialValues = [
    attemptedParamValue,
    currentSearchParamValue,
    previousParamValue,
  ];

  if (typeof defaultValue === "number") {
    potentialValues.forEach(
      (value, i) =>
        (potentialValues[i] = value ? parseFloat(value.toString()) : null),
    );
  }

  for (const value of potentialValues) {
    if (value) {
      if (
        paramName === "colorMode" &&
        COLOR_MODES.includes(value as ColorMode)
      ) {
        return value as P[K];
      } else if (typeof value === typeof defaultValue) {
        return value as P[K];
      }
    }
  }
  return defaultValue as P[K];
}
