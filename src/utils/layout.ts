import type {
  EditorState,
  EvaluatedFurniture,
  EvaluatedSpaceZone,
  EvaluatedWindowOpening,
  Furniture,
  LayoutSummary,
  Room,
  SpaceZone,
  WindowOpening,
} from "../types";

type RectItem = Pick<Furniture, "width" | "height" | "x" | "y">;

const area = (item: Pick<Furniture, "width" | "height">) => item.width * item.height;

const intersects = (a: Furniture, b: Furniture) =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

const isOutOfBounds = (room: Room, item: RectItem) =>
  item.x < 0 || item.y < 0 || item.x + item.width > room.width || item.y + item.height > room.height;

const isWindowOutOfBounds = (room: Room, item: WindowOpening) => {
  const maxLength = item.side === "top" || item.side === "bottom" ? room.width : room.height;

  return item.offset < 0 || item.length <= 0 || item.offset + item.length > maxLength;
};

export const evaluateFurniture = (room: Room, furnitureList: Furniture[]): EvaluatedFurniture[] => {
  const overlapIds = new Set<string>();

  furnitureList.forEach((item, index) => {
    furnitureList.slice(index + 1).forEach((target) => {
      if (intersects(item, target)) {
        overlapIds.add(item.id);
        overlapIds.add(target.id);
      }
    });
  });

  return furnitureList.map((item) => ({
    ...item,
    isOutOfBounds: isOutOfBounds(room, item),
    isOverlapping: overlapIds.has(item.id),
  }));
};

export const evaluateZones = (room: Room, zoneList: SpaceZone[]): EvaluatedSpaceZone[] =>
  zoneList.map((item) => ({
    ...item,
    isOutOfBounds: isOutOfBounds(room, item),
  }));

export const evaluateWindows = (room: Room, windowList: WindowOpening[]): EvaluatedWindowOpening[] =>
  windowList.map((item) => ({
    ...item,
    isOutOfBounds: isWindowOutOfBounds(room, item),
  }));

export const formatDimension = (value: number, unit: Room["unit"]) =>
  unit === "m" ? `${(value / 100).toFixed(2)}m` : `${Math.round(value)}cm`;

export const getSummary = (
  room: Room,
  furnitureList: EvaluatedFurniture[],
  zoneList: EvaluatedSpaceZone[] = [],
  windowList: EvaluatedWindowOpening[] = [],
): LayoutSummary => {
  const totalArea = room.width * room.height;
  const occupiedArea = furnitureList.reduce((sum, item) => sum + area(item), 0);
  const overlapCount = furnitureList.filter((item) => item.isOverlapping).length;
  const outOfBoundsCount = furnitureList.filter((item) => item.isOutOfBounds).length;
  const zoneIssueCount = zoneList.filter((item) => item.isOutOfBounds).length;
  const windowIssueCount = windowList.filter((item) => item.isOutOfBounds).length;
  const occupiedRatio = totalArea === 0 ? 0 : occupiedArea / totalArea;
  const availableRatio = Math.max(0, 1 - occupiedRatio);

  let statusMessage = "가구를 추가해서 배치를 시작해보세요.";
  let statusTone: LayoutSummary["statusTone"] = "valid";

  if (furnitureList.length > 0 && overlapCount === 0 && outOfBoundsCount === 0) {
    statusMessage = "가구가 겹치지 않는 안정적인 배치입니다.";
  }

  if (overlapCount > 0) {
    statusTone = "danger";
    statusMessage = `${overlapCount}개의 가구가 다른 가구와 겹쳐 있습니다. 위치를 조정해 주세요.`;
  }

  if (outOfBoundsCount > 0) {
    statusTone = "danger";
    statusMessage = `${outOfBoundsCount}개의 가구가 방 밖으로 벗어났습니다. 방 안쪽으로 옮겨 주세요.`;
  }

  if (zoneIssueCount > 0) {
    statusTone = "danger";
    statusMessage = `${zoneIssueCount}개의 공간이 전체 방 밖으로 벗어났습니다. 공간 경계를 조정해 주세요.`;
  }

  if (windowIssueCount > 0) {
    statusTone = "danger";
    statusMessage = `${windowIssueCount}개의 창문 위치가 벽 길이를 벗어났습니다. 위치나 길이를 조정해 주세요.`;
  }

  return {
    totalArea,
    occupiedArea,
    occupiedRatio,
    availableRatio,
    overlapCount,
    outOfBoundsCount,
    statusTone,
    statusMessage,
    zoneCount: zoneList.length,
    windowCount: windowList.length,
    zoneIssueCount,
    windowIssueCount,
  };
};

export const clampWithinCanvas = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const duplicateFurniture = (item: Furniture): Furniture => ({
  ...item,
  id: `furniture-${crypto.randomUUID()}`,
  name: `${item.name} 복사본`,
  x: item.x + 20,
  y: item.y + 20,
});

export const duplicateZone = (item: SpaceZone): SpaceZone => ({
  ...item,
  id: `space-${crypto.randomUUID()}`,
  name: `${item.name} 복사본`,
  x: item.x + 20,
  y: item.y + 20,
});

export const createInitialEditorState = (): EditorState => ({
  layoutId: null,
  layoutName: "배치안 1",
  room: { width: 300, height: 400, unit: "cm" },
  furnitureList: [],
  zoneList: [],
  windowList: [],
  selectedItem: null,
});
