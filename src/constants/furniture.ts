import type { Furniture, FurnitureType } from "../types";

export interface FurniturePreset {
  type: FurnitureType;
  name: string;
  width: number;
  height: number;
  color: string;
  hint: string;
  keywords?: string[];
}

export const GRID_SIZE_CM = 10;

export const FURNITURE_PRESETS: FurniturePreset[] = [
  { type: "bed", name: "침대", width: 120, height: 210, color: "#f0b43c", hint: "싱글 침대 기준", keywords: ["슈퍼싱글", "매트리스", "bed"] },
  { type: "desk", name: "책상", width: 120, height: 60, color: "#f2c65c", hint: "학습용 책상", keywords: ["작업", "데스크", "desk"] },
  { type: "chair", name: "의자", width: 45, height: 45, color: "#dca645", hint: "책상 의자", keywords: ["체어", "스툴", "chair"] },
  { type: "wardrobe", name: "옷장", width: 100, height: 60, color: "#c8b06f", hint: "2문 옷장", keywords: ["행거", "장롱", "wardrobe"] },
  { type: "bookshelf", name: "책장", width: 80, height: 32, color: "#c89e69", hint: "세로 수납 선반", keywords: ["북쉘프", "선반", "책", "bookshelf"] },
  { type: "dresser", name: "서랍장", width: 80, height: 45, color: "#e8bd73", hint: "낮은 수납장", keywords: ["드로어", "수납", "dresser"] },
  { type: "sideTable", name: "협탁", width: 45, height: 40, color: "#d9b684", hint: "침대 옆 작은 테이블", keywords: ["사이드테이블", "탁자", "side table"] },
  { type: "sofa", name: "소파", width: 160, height: 80, color: "#d9a56b", hint: "2인용 소파", keywords: ["쇼파", "카우치", "sofa"] },
  { type: "table", name: "테이블", width: 90, height: 90, color: "#ddb04c", hint: "정사각형 테이블", keywords: ["식탁", "작업대", "table"] },
  { type: "coffeeTable", name: "티테이블", width: 80, height: 50, color: "#d8ad66", hint: "낮은 거실 테이블", keywords: ["커피테이블", "소파테이블", "coffee table"] },
  { type: "vanity", name: "화장대", width: 90, height: 45, color: "#d7b07b", hint: "거울 포함 화장대", keywords: ["드레서", "메이크업", "vanity"] },
  { type: "tv", name: "TV", width: 120, height: 24, color: "#747f8d", hint: "벽걸이 혹은 낮은 TV 기준", keywords: ["티비", "모니터", "television"] },
  { type: "fridge", name: "냉장고", width: 70, height: 70, color: "#a4a3a1", hint: "1도어 냉장고", keywords: ["냉장", "fridge", "refrigerator"] },
  { type: "microwave", name: "전자레인지", width: 50, height: 40, color: "#98a4b1", hint: "소형 주방 가전", keywords: ["전자렌지", "마이크로웨이브", "microwave"] },
  { type: "dishwasher", name: "식기세척기", width: 60, height: 60, color: "#adb7c0", hint: "빌트인 또는 소형 식세기", keywords: ["식세기", "dishwasher"] },
  { type: "washer", name: "세탁기", width: 65, height: 65, color: "#b5b5b4", hint: "드럼 세탁기", keywords: ["세탁", "washer", "washing machine"] },
  { type: "airPurifier", name: "공기청정기", width: 35, height: 35, color: "#bac4cc", hint: "타워형 공기청정기", keywords: ["에어퓨리파이어", "청정기", "air purifier"] },
  { type: "robotVacuum", name: "로봇청소기", width: 38, height: 38, color: "#91979f", hint: "자동 청소 로봇", keywords: ["로청기", "청소기", "robot vacuum"] },
  { type: "floorLamp", name: "스탠드조명", width: 30, height: 30, color: "#ccb37f", hint: "코너 포인트 조명", keywords: ["플로어램프", "램프", "조명", "floor lamp"] },
  { type: "dryingRack", name: "건조대", width: 100, height: 50, color: "#c8ccd2", hint: "접이식 빨래 건조대", keywords: ["빨래건조대", "행거", "drying rack"] },
  { type: "tvStand", name: "TV장", width: 140, height: 40, color: "#cbb680", hint: "낮은 TV장", keywords: ["거실장", "tv stand"] },
  { type: "storage", name: "수납장", width: 60, height: 40, color: "#e1b75e", hint: "모듈 수납장", keywords: ["수납", "장", "storage"] },
  { type: "custom", name: "커스텀", width: 80, height: 80, color: "#e9c77e", hint: "직접 이름과 크기 수정", keywords: ["직접", "사용자", "custom"] },
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
