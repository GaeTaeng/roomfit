export type Unit = "cm" | "m";

export type FurnitureType =
  | "bed"
  | "desk"
  | "chair"
  | "wardrobe"
  | "dresser"
  | "sofa"
  | "table"
  | "fridge"
  | "washer"
  | "tvStand"
  | "storage"
  | "custom";

export type SpaceType = "room" | "veranda" | "kitchen" | "bathroom" | "entry" | "closet" | "custom";

export type WindowSide = "top" | "right" | "bottom" | "left";

export type Selection =
  | {
      type: "furniture";
      id: string;
    }
  | {
      type: "space";
      id: string;
    }
  | {
      type: "window";
      id: string;
    };

export interface Room {
  width: number;
  height: number;
  unit: Unit;
}

export interface Furniture {
  id: string;
  name: string;
  type: FurnitureType;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: 0 | 90;
  color: string;
}

export interface EvaluatedFurniture extends Furniture {
  isOverlapping: boolean;
  isOutOfBounds: boolean;
}

export interface SpaceZone {
  id: string;
  name: string;
  type: SpaceType;
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
}

export interface EvaluatedSpaceZone extends SpaceZone {
  isOutOfBounds: boolean;
}

export interface WindowOpening {
  id: string;
  name: string;
  side: WindowSide;
  offset: number;
  length: number;
  depth: number;
  color: string;
}

export interface EvaluatedWindowOpening extends WindowOpening {
  isOutOfBounds: boolean;
}

export interface LayoutRecord {
  id: string;
  name: string;
  room: Room;
  furnitureList: Furniture[];
  zoneList: SpaceZone[];
  windowList: WindowOpening[];
  createdAt: string;
  updatedAt: string;
}

export interface LayoutFilePayload {
  format: "roomfit-layout";
  version: 1;
  exportedAt: string;
  layout: LayoutRecord;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  room: Room;
  starterFurniture?: Furniture[];
  starterZones?: SpaceZone[];
  starterWindows?: WindowOpening[];
}

export interface LayoutSummary {
  totalArea: number;
  occupiedArea: number;
  occupiedRatio: number;
  availableRatio: number;
  overlapCount: number;
  outOfBoundsCount: number;
  statusTone: "valid" | "danger";
  statusMessage: string;
  zoneCount: number;
  windowCount: number;
  zoneIssueCount: number;
  windowIssueCount: number;
}

export interface EditorState {
  layoutId: string | null;
  layoutName: string;
  room: Room;
  furnitureList: Furniture[];
  zoneList: SpaceZone[];
  windowList: WindowOpening[];
  selectedItem: Selection | null;
}

export interface SavedLayoutsState {
  layouts: LayoutRecord[];
}
