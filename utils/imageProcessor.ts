import type { CSSProperties } from "react";

export type Finish = "glossy" | "matte" | "satin";
export type LightMode = "white" | "yellow";

export const FINISH_SURCHARGE: Record<Finish, number> = {
  glossy: 0,
  satin: 3200,
  matte: 5200,
};

export const BASE_QUOTE_PRICE = 125000;

export function getColorBlendMode(finish: Finish): CSSProperties["mixBlendMode"] {
  if (finish === "satin") {
    return "hue";
  }
  return "multiply";
}

export function getImageFilter(finish: Finish, lightMode: LightMode): string {
  const byFinish: Record<Finish, string> = {
    glossy: "contrast(1.2) brightness(1.1)",
    matte: "saturate(0.8) contrast(0.9) brightness(0.9)",
    satin: "contrast(1.03) brightness(1.02) saturate(1.06)",
  };

  const lighting = lightMode === "yellow" ? " brightness(1.02)" : "";

  return `${byFinish[finish]}${lighting}`;
}

export function getFinishOverlayStyle(finish: Finish): CSSProperties {
  if (finish === "glossy") {
    return {
      background:
        "linear-gradient(118deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.28) 38%, rgba(255,255,255,0.02) 65%, rgba(255,255,255,0.2) 100%)",
      mixBlendMode: "screen",
      opacity: 0.45,
    };
  }

  if (finish === "matte") {
    return {
      background: "rgba(0, 0, 0, 0.22)",
      mixBlendMode: "multiply",
      opacity: 0.72,
    };
  }

  return {
    background:
      "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.16), rgba(255,255,255,0) 42%), radial-gradient(circle at 72% 40%, rgba(255,255,255,0.1), rgba(255,255,255,0) 44%)",
    mixBlendMode: "soft-light",
    opacity: 0.55,
    filter: "blur(2px)",
  };
}

export function getLightingTintStyle(lightMode: LightMode): CSSProperties {
  if (lightMode === "yellow") {
    return {
      background: "rgba(255, 255, 0, 0.1)",
      mixBlendMode: "overlay",
      opacity: 1,
    };
  }

  return {
    background:
      "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 65%)",
    opacity: 0.75,
  };
}