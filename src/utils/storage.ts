import type { EditorState, Furniture, LayoutFilePayload, LayoutRecord, Room, SpaceZone, WindowOpening } from "../types";

const STORAGE_KEY = "roomfit-layouts";
const FILE_FORMAT = "roomfit-layout";
const FILE_VERSION = 1;
const FILE_EXTENSION = ".roomfit.json";
const JSON_MIME_TYPE = "application/json";
const VALID_UNITS = ["cm", "m"] as const;
const VALID_FURNITURE_TYPES = [
  "bed",
  "desk",
  "chair",
  "wardrobe",
  "dresser",
  "sofa",
  "table",
  "fridge",
  "washer",
  "tvStand",
  "storage",
  "custom",
] as const;
const VALID_SPACE_TYPES = ["room", "veranda", "kitchen", "bathroom", "entry", "closet", "custom"] as const;
const VALID_WINDOW_SIDES = ["top", "right", "bottom", "left"] as const;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const toFiniteNumber = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const toStringValue = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const isOneOf = <T extends readonly string[]>(value: unknown, options: T): value is T[number] =>
  typeof value === "string" && options.includes(value);

const normalizeRoom = (value: unknown): Room | null => {
  if (!isObject(value) || !isOneOf(value.unit, VALID_UNITS)) {
    return null;
  }

  return {
    width: Math.max(0, Math.round(toFiniteNumber(value.width))),
    height: Math.max(0, Math.round(toFiniteNumber(value.height))),
    unit: value.unit,
  };
};

const normalizeFurnitureList = (value: unknown): Furniture[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isObject)
    .flatMap((item) => {
      if (!isOneOf(item.type, VALID_FURNITURE_TYPES)) {
        return [];
      }

      return [
        {
          id: toStringValue(item.id, `furniture-${crypto.randomUUID()}`),
          name: toStringValue(item.name, "가구"),
          type: item.type,
          width: Math.max(0, Math.round(toFiniteNumber(item.width))),
          height: Math.max(0, Math.round(toFiniteNumber(item.height))),
          x: Math.round(toFiniteNumber(item.x)),
          y: Math.round(toFiniteNumber(item.y)),
          rotation: item.rotation === 90 ? 90 : 0,
          color: toStringValue(item.color, "#e9c77e"),
        },
      ];
    });
};

const normalizeZoneList = (value: unknown): SpaceZone[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isObject)
    .flatMap((item) => {
      if (!isOneOf(item.type, VALID_SPACE_TYPES)) {
        return [];
      }

      return [
        {
          id: toStringValue(item.id, `space-${crypto.randomUUID()}`),
          name: toStringValue(item.name, "공간"),
          type: item.type,
          width: Math.max(0, Math.round(toFiniteNumber(item.width))),
          height: Math.max(0, Math.round(toFiniteNumber(item.height))),
          x: Math.round(toFiniteNumber(item.x)),
          y: Math.round(toFiniteNumber(item.y)),
          color: toStringValue(item.color, "#e7ece0"),
        },
      ];
    });
};

const normalizeWindowList = (value: unknown): WindowOpening[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isObject)
    .flatMap((item) => {
      if (!isOneOf(item.side, VALID_WINDOW_SIDES)) {
        return [];
      }

      return [
        {
          id: toStringValue(item.id, `window-${crypto.randomUUID()}`),
          name: toStringValue(item.name, "창문"),
          side: item.side,
          offset: Math.round(toFiniteNumber(item.offset)),
          length: Math.max(0, Math.round(toFiniteNumber(item.length))),
          depth: Math.max(1, Math.round(toFiniteNumber(item.depth, 12))),
          color: toStringValue(item.color, "#69a7bf"),
        },
      ];
    });
};

const normalizeLayoutRecord = (value: unknown): LayoutRecord | null => {
  if (!isObject(value)) {
    return null;
  }

  const room = normalizeRoom(value.room);

  if (!room) {
    return null;
  }

  const now = new Date().toISOString();
  const name = toStringValue(value.name, "").trim() || "불러온 배치안";

  return {
    id: toStringValue(value.id, `layout-${crypto.randomUUID()}`),
    name,
    room,
    furnitureList: normalizeFurnitureList(value.furnitureList),
    zoneList: normalizeZoneList(value.zoneList),
    windowList: normalizeWindowList(value.windowList),
    createdAt: toStringValue(value.createdAt, now),
    updatedAt: toStringValue(value.updatedAt, now),
  };
};

const sanitizeFileName = (name: string) =>
  (name || "roomfit-layout")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

export const loadSavedLayouts = (): LayoutRecord[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as LayoutRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveSavedLayouts = (layouts: LayoutRecord[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
};

export const createLayoutRecord = (
  state: EditorState,
  fallbackName: string,
  existingLayout?: Pick<LayoutRecord, "id" | "createdAt"> | null,
): LayoutRecord => {
  const now = new Date().toISOString();

  return {
    id: existingLayout?.id ?? `layout-${crypto.randomUUID()}`,
    name: state.layoutName.trim() || fallbackName,
    room: state.room,
    furnitureList: state.furnitureList,
    zoneList: state.zoneList,
    windowList: state.windowList,
    createdAt: existingLayout?.createdAt ?? now,
    updatedAt: now,
  };
};

export const upsertLayoutRecord = (layouts: LayoutRecord[], nextLayout: LayoutRecord) => {
  const matchedLayout = layouts.find((layout) => layout.id === nextLayout.id);

  return matchedLayout
    ? layouts.map((layout) => (layout.id === nextLayout.id ? nextLayout : layout))
    : [nextLayout, ...layouts];
};

export const exportLayoutRecordToFile = (layout: LayoutRecord) => {
  const payload: LayoutFilePayload = {
    format: FILE_FORMAT,
    version: FILE_VERSION,
    exportedAt: new Date().toISOString(),
    layout,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: JSON_MIME_TYPE });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${sanitizeFileName(layout.name)}${FILE_EXTENSION}`;
  link.click();
  URL.revokeObjectURL(objectUrl);
};

export const importLayoutRecordFromFile = async (file: File): Promise<LayoutRecord> => {
  const raw = await file.text();
  const parsed = JSON.parse(raw) as unknown;
  const candidate =
    isObject(parsed) && parsed.format === FILE_FORMAT && parsed.version === FILE_VERSION ? parsed.layout : parsed;
  const layout = normalizeLayoutRecord(candidate);

  if (!layout) {
    throw new Error("RoomFit 배치 파일 형식이 아닙니다.");
  }

  return layout;
};

export const serializeEditorState = (state: EditorState) =>
  JSON.stringify({
    layoutId: state.layoutId,
    layoutName: state.layoutName,
    room: state.room,
    furnitureList: state.furnitureList,
    zoneList: state.zoneList,
    windowList: state.windowList,
    selectedItem: state.selectedItem,
  });
