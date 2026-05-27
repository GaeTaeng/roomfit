import type { EditorState, LayoutRecord } from "../types";

const STORAGE_KEY = "roomfit-layouts";

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
