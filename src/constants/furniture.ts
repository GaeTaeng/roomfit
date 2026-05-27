import type { Furniture, FurnitureType } from "../types";

export interface FurniturePreset {
  type: FurnitureType;
  name: string;
  width: number;
  height: number;
  color: string;
  hint: string;
}

export const GRID_SIZE_CM = 10;

export const FURNITURE_PRESETS: FurniturePreset[] = [
  { type: "bed", name: "침대", width: 120, height: 210, color: "#f0b43c", hint: "싱글 침대 기준" },
  { type: "desk", name: "책상", width: 120, height: 60, color: "#f2c65c", hint: "학습용 책상" },
  { type: "chair", name: "의자", width: 45, height: 45, color: "#dca645", hint: "책상 의자" },
  { type: "wardrobe", name: "옷장", width: 100, height: 60, color: "#c8b06f", hint: "2문 옷장" },
  { type: "dresser", name: "서랍장", width: 80, height: 45, color: "#e8bd73", hint: "낮은 수납장" },
  { type: "sofa", name: "소파", width: 160, height: 80, color: "#d9a56b", hint: "2인용 소파" },
  { type: "table", name: "테이블", width: 90, height: 90, color: "#ddb04c", hint: "정사각형 테이블" },
  { type: "fridge", name: "냉장고", width: 70, height: 70, color: "#a4a3a1", hint: "1도어 냉장고" },
  { type: "washer", name: "세탁기", width: 65, height: 65, color: "#b5b5b4", hint: "드럼 세탁기" },
  { type: "tvStand", name: "TV장", width: 140, height: 40, color: "#cbb680", hint: "낮은 TV장" },
  { type: "storage", name: "수납장", width: 60, height: 40, color: "#e1b75e", hint: "모듈 수납장" },
  { type: "custom", name: "커스텀", width: 80, height: 80, color: "#e9c77e", hint: "직접 이름과 크기 수정" },
];

export const getPresetByType = (type: FurnitureType): FurniturePreset =>
  FURNITURE_PRESETS.find((preset) => preset.type === type) ?? FURNITURE_PRESETS[FURNITURE_PRESETS.length - 1];

export const createFurnitureItem = (
  type: FurnitureType,
  overrides: Partial<Furniture> = {},
): Furniture => {
  const preset = getPresetByType(type);

  return {
    id: `furniture-${crypto.randomUUID()}`,
    name: preset.name,
    type: preset.type,
    width: preset.width,
    height: preset.height,
    x: 20,
    y: 20,
    rotation: 0,
    color: preset.color,
    ...overrides,
  };
};
