export interface UviEvaluation {
  level: number;
  category: string;
  color: string;
}

export function hexToRgba(hex: string, alpha: number = 1): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getUviBadgeStyle(color: string) {
  return {
    backgroundColor: hexToRgba(color, 0.1),
    borderColor: hexToRgba(color, 0.3),
    color: color,
  };
}

/**
 * Evaluates UVI score based on standard rules (primaryColor #02BDDB)
 */
export function evaluateUviScore(
  uviScore: number | string | null | undefined,
  rawScore?: number | string | null | undefined,
): UviEvaluation {
  const numUvi =
    uviScore !== null && uviScore !== undefined && uviScore !== ""
      ? typeof uviScore === "number"
        ? uviScore
        : parseFloat(String(uviScore))
      : null;

  const normalizedScore =
    numUvi !== null && !isNaN(numUvi)
      ? numUvi > 1
        ? numUvi / 10
        : numUvi
      : null;

  const effectiveRaw = rawScore !== undefined ? rawScore : uviScore;

  if (
    effectiveRaw === null ||
    effectiveRaw === undefined ||
    effectiveRaw === "" ||
    normalizedScore === null ||
    normalizedScore < 0.0
  ) {
    return {
      level: 1,
      category: "Sangat rendah",
      color: "#C62828",
    };
  }
  if (normalizedScore < 0.0492) {
    return {
      level: 2,
      category: "Rendah",
      color: "#E53935",
    };
  }
  if (normalizedScore < 0.1704) {
    return {
      level: 3,
      category: "Cenderung rendah",
      color: "#FF7043",
    };
  }
  if (normalizedScore < 0.2917) {
    return {
      level: 4,
      category: "Sedang",
      color: "#FFA000",
    };
  }
  if (normalizedScore < 0.413) {
    return {
      level: 5,
      category: "Cenderung tinggi",
      color: "#4CAF50",
    };
  }
  if (normalizedScore < 0.5343) {
    return {
      level: 6,
      category: "Tinggi",
      color: "#00BFA5",
    };
  }
  return {
    level: 7,
    category: "Sangat tinggi",
    color: "#02BDDB",
  };
}
