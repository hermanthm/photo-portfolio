export const COVER_ASPECT_RATIOS = [
  "ratio_16_10",
  "ratio_4_3",
  "ratio_3_2",
  "ratio_1_1",
  "ratio_21_9",
] as const;

export type CoverAspectRatio = (typeof COVER_ASPECT_RATIOS)[number];

export const DEFAULT_COVER_ASPECT_RATIO: CoverAspectRatio = "ratio_16_10";
export const DEFAULT_COVER_FOCAL_X = 50;
export const DEFAULT_COVER_FOCAL_Y = 50;

export const COVER_ASPECT_RATIO_OPTIONS: {
  value: CoverAspectRatio;
  label: string;
}[] = [
  { value: "ratio_16_10", label: "16:10 (default)" },
  { value: "ratio_4_3", label: "4:3" },
  { value: "ratio_3_2", label: "3:2" },
  { value: "ratio_1_1", label: "1:1 (square)" },
  { value: "ratio_21_9", label: "21:9 (cinematic)" },
];

const ASPECT_RATIO_CSS: Record<CoverAspectRatio, string> = {
  ratio_16_10: "16 / 10",
  ratio_4_3: "4 / 3",
  ratio_3_2: "3 / 2",
  ratio_1_1: "1 / 1",
  ratio_21_9: "21 / 9",
};

export function coverAspectRatioToCss(ratio: CoverAspectRatio): string {
  return ASPECT_RATIO_CSS[ratio];
}

export function coverFocalToObjectPosition(focalX: number, focalY: number): string {
  return `${focalX}% ${focalY}%`;
}

export function clampFocalPoint(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}