import type { SpaceType, SpaceZone, WindowOpening, WindowSide } from "../types";

export interface SpacePreset {
  type: SpaceType;
  name: string;
  width: number;
  height: number;
  color: string;
  hint: string;
}

export interface WindowPreset {
  side: WindowSide;
  name: string;
  offset: number;
  length: number;
  depth: number;
  color: string;
}

export const SPACE_PRESETS: SpacePreset[] = [
  { type: "room", name: "작은 방", width: 170, height: 190, color: "#dce8f7", hint: "가벽으로 나눈 방" },
  { type: "veranda", name: "베란다", width: 300, height: 70, color: "#d7efed", hint: "창가 쪽 보조 공간" },
  { type: "kitchen", name: "주방", width: 130, height: 150, color: "#ece3d2", hint: "분리된 조리 공간" },
  { type: "bathroom", name: "화장실", width: 120, height: 150, color: "#e2e7ec", hint: "고정 설비 공간" },
  { type: "entry", name: "현관", width: 120, height: 90, color: "#e8e0d6", hint: "출입 동선 공간" },
  { type: "closet", name: "드레스룸", width: 140, height: 150, color: "#eadff0", hint: "수납 중심 공간" },
  { type: "custom", name: "커스텀 공간", width: 140, height: 140, color: "#e7ece0", hint: "직접 이름과 크기 수정" },
];

export const WINDOW_PRESETS: WindowPreset[] = [
  { side: "top", name: "상단 창문", offset: 70, length: 120, depth: 12, color: "#69a7bf" },
  { side: "right", name: "오른쪽 창문", offset: 120, length: 110, depth: 12, color: "#69a7bf" },
  { side: "bottom", name: "하단 창문", offset: 80, length: 100, depth: 12, color: "#69a7bf" },
  { side: "left", name: "왼쪽 창문", offset: 120, length: 110, depth: 12, color: "#69a7bf" },
];

export const getSpacePresetByType = (type: SpaceType): SpacePreset =>
  SPACE_PRESETS.find((preset) => preset.type === type) ?? SPACE_PRESETS[SPACE_PRESETS.length - 1];

export const createSpaceZone = (type: SpaceType, overrides: Partial<SpaceZone> = {}): SpaceZone => {
  const preset = getSpacePresetByType(type);

  return {
    id: `space-${crypto.randomUUID()}`,
    name: preset.name,
    type: preset.type,
    width: preset.width,
    height: preset.height,
    x: 30,
    y: 30,
    color: preset.color,
    ...overrides,
  };
};

export const createWindowOpening = (
  side: WindowSide = "top",
  overrides: Partial<WindowOpening> = {},
): WindowOpening => {
  const preset = WINDOW_PRESETS.find((item) => item.side === side) ?? WINDOW_PRESETS[0];

  return {
    id: `window-${crypto.randomUUID()}`,
    name: preset.name,
    side: preset.side,
    offset: preset.offset,
    length: preset.length,
    depth: preset.depth,
    color: preset.color,
    ...overrides,
  };
};
