import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { LeftSidebar } from "./components/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar";
import { RoomCanvas } from "./components/RoomCanvas";
import { SummaryBar } from "./components/SummaryBar";
import { createFurnitureItem } from "./constants/furniture";
import { createSpaceZone, createWindowOpening } from "./constants/spaces";
import { ROOM_TEMPLATES } from "./constants/templates";
import type { EditorState, Furniture, LayoutRecord, Room, Selection, SpaceZone, WindowOpening } from "./types";
import {
  createInitialEditorState,
  duplicateFurniture,
  duplicateZone,
  evaluateFurniture,
  evaluateWindows,
  evaluateZones,
  getSummary,
} from "./utils/layout";
import { loadSavedLayouts, saveSavedLayouts, serializeEditorState } from "./utils/storage";

interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
  previewOrigin: EditorState | null;
}

const DEFAULT_TEMPLATE_ID = "studio-5";

const createInitialStateWithTemplate = (): EditorState => {
  const base = createInitialEditorState();
  const template = ROOM_TEMPLATES.find((item) => item.id === DEFAULT_TEMPLATE_ID);

  if (!template) {
    return base;
  }

  return {
    ...base,
    layoutName: template.name,
    room: template.room,
    zoneList: template.starterZones ?? [],
    windowList: template.starterWindows ?? [],
    furnitureList: template.starterFurniture ?? [],
  };
};

const statesEqual = (left: EditorState, right: EditorState) => serializeEditorState(left) === serializeEditorState(right);

const moveItemToEdge = <T extends { id: string }>(list: T[], id: string, direction: "front" | "back") => {
  const currentIndex = list.findIndex((item) => item.id === id);

  if (currentIndex < 0) {
    return list;
  }

  const targetIndex = direction === "front" ? list.length - 1 : 0;

  if (currentIndex === targetIndex) {
    return list;
  }

  const nextList = [...list];
  const [targetItem] = nextList.splice(currentIndex, 1);
  nextList.splice(targetIndex, 0, targetItem);

  return nextList;
};

export default function App() {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: createInitialStateWithTemplate(),
    future: [],
    previewOrigin: null,
  });
  const [savedLayouts, setSavedLayouts] = useState<LayoutRecord[]>(() =>
    typeof window === "undefined" ? [] : loadSavedLayouts(),
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(DEFAULT_TEMPLATE_ID);
  const [zoom, setZoom] = useState(1);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [isLoadPanelOpen, setIsLoadPanelOpen] = useState(false);

  const editor = history.present;
  const evaluatedFurniture = useMemo(
    () => evaluateFurniture(editor.room, editor.furnitureList),
    [editor.furnitureList, editor.room],
  );
  const evaluatedZones = useMemo(() => evaluateZones(editor.room, editor.zoneList), [editor.room, editor.zoneList]);
  const evaluatedWindows = useMemo(
    () => evaluateWindows(editor.room, editor.windowList),
    [editor.room, editor.windowList],
  );
  const selectedFurniture =
    editor.selectedItem?.type === "furniture"
      ? evaluatedFurniture.find((item) => item.id === editor.selectedItem?.id) ?? null
      : null;
  const selectedZone =
    editor.selectedItem?.type === "space"
      ? evaluatedZones.find((item) => item.id === editor.selectedItem?.id) ?? null
      : null;
  const selectedWindow =
    editor.selectedItem?.type === "window"
      ? evaluatedWindows.find((item) => item.id === editor.selectedItem?.id) ?? null
      : null;
  const summary = useMemo(
    () => getSummary(editor.room, evaluatedFurniture, evaluatedZones, evaluatedWindows),
    [editor.room, evaluatedFurniture, evaluatedZones, evaluatedWindows],
  );
  const selectedLayer = useMemo(() => {
    if (!editor.selectedItem) {
      return null;
    }

    const sourceList =
      editor.selectedItem.type === "furniture"
        ? editor.furnitureList
        : editor.selectedItem.type === "space"
          ? editor.zoneList
          : editor.windowList;
    const index = sourceList.findIndex((item) => item.id === editor.selectedItem?.id);

    if (index < 0) {
      return null;
    }

    return {
      index: index + 1,
      count: sourceList.length,
    };
  }, [editor.furnitureList, editor.selectedItem, editor.windowList, editor.zoneList]);

  const commit = (recipe: (state: EditorState) => EditorState) => {
    setHistory((previous) => {
      const nextPresent = recipe(previous.present);

      if (statesEqual(previous.present, nextPresent)) {
        return previous;
      }

      return {
        past: [...previous.past.slice(-49), previous.present],
        present: nextPresent,
        future: [],
        previewOrigin: null,
      };
    });
  };

  const startPreview = () => {
    setHistory((previous) =>
      previous.previewOrigin
        ? previous
        : {
            ...previous,
            previewOrigin: previous.present,
          },
    );
  };

  const updatePreview = (recipe: (state: EditorState) => EditorState) => {
    setHistory((previous) => {
      const nextPresent = recipe(previous.present);

      if (statesEqual(previous.present, nextPresent)) {
        return previous;
      }

      return {
        ...previous,
        present: nextPresent,
      };
    });
  };

  const finishPreview = () => {
    setHistory((previous) => {
      if (!previous.previewOrigin || statesEqual(previous.previewOrigin, previous.present)) {
        return {
          ...previous,
          previewOrigin: null,
        };
      }

      return {
        past: [...previous.past.slice(-49), previous.previewOrigin],
        present: previous.present,
        future: [],
        previewOrigin: null,
      };
    });
  };

  const replaceEntireState = (nextState: EditorState) => {
    setHistory((previous) => ({
      past: [...previous.past.slice(-49), previous.present],
      present: nextState,
      future: [],
      previewOrigin: null,
    }));
  };

  const updateRoom = (patch: Partial<Room>) => {
    commit((state) => ({
      ...state,
      room: {
        ...state.room,
        ...patch,
      },
    }));
  };

  const addFurniture = (type: Furniture["type"]) => {
    const nextItem = createFurnitureItem(type, {
      x: Math.max(20, editor.furnitureList.length * 18 + 20),
      y: Math.max(20, editor.furnitureList.length * 18 + 20),
      ...(type === "custom" ? { name: "커스텀 가구" } : {}),
    });

    commit((state) => ({
      ...state,
      furnitureList: [...state.furnitureList, nextItem],
      selectedItem: { type: "furniture", id: nextItem.id },
    }));
  };

  const updateSelectedFurniture = (patch: Partial<Furniture>) => {
    if (editor.selectedItem?.type !== "furniture") {
      return;
    }

    commit((state) => ({
      ...state,
      furnitureList: state.furnitureList.map((item) =>
        item.id === state.selectedItem?.id ? { ...item, ...patch } : item,
      ),
    }));
  };

  const addZone = (type: SpaceZone["type"]) => {
    const nextZone = createSpaceZone(type, {
      x: Math.max(20, editor.zoneList.length * 18 + 20),
      y: Math.max(20, editor.zoneList.length * 18 + 20),
    });

    commit((state) => ({
      ...state,
      zoneList: [...state.zoneList, nextZone],
      selectedItem: { type: "space", id: nextZone.id },
    }));
  };

  const addWindow = (side: WindowOpening["side"] = "top") => {
    const maxLength = side === "top" || side === "bottom" ? editor.room.width : editor.room.height;
    const nextWindow = createWindowOpening(side, {
      offset: Math.max(0, Math.round((maxLength - 110) / 2)),
      length: Math.min(120, Math.max(60, maxLength - 40)),
    });

    commit((state) => ({
      ...state,
      windowList: [...state.windowList, nextWindow],
      selectedItem: { type: "window", id: nextWindow.id },
    }));
  };

  const updateSelectedZone = (patch: Partial<SpaceZone>) => {
    if (editor.selectedItem?.type !== "space") {
      return;
    }

    commit((state) => ({
      ...state,
      zoneList: state.zoneList.map((item) => (item.id === state.selectedItem?.id ? { ...item, ...patch } : item)),
    }));
  };

  const updateSelectedWindow = (patch: Partial<WindowOpening>) => {
    if (editor.selectedItem?.type !== "window") {
      return;
    }

    commit((state) => ({
      ...state,
      windowList: state.windowList.map((item) => (item.id === state.selectedItem?.id ? { ...item, ...patch } : item)),
    }));
  };

  const deleteSelectedItem = () => {
    if (!editor.selectedItem) {
      return;
    }

    const { type, id } = editor.selectedItem;

    commit((state) => ({
      ...state,
      furnitureList: type === "furniture" ? state.furnitureList.filter((item) => item.id !== id) : state.furnitureList,
      zoneList: type === "space" ? state.zoneList.filter((item) => item.id !== id) : state.zoneList,
      windowList: type === "window" ? state.windowList.filter((item) => item.id !== id) : state.windowList,
      selectedItem: null,
    }));
  };

  const duplicateSelectedItem = () => {
    if (selectedFurniture) {
      const nextItem = duplicateFurniture(selectedFurniture);

      commit((state) => ({
        ...state,
        furnitureList: [...state.furnitureList, nextItem],
        selectedItem: { type: "furniture", id: nextItem.id },
      }));
    }

    if (selectedZone) {
      const nextZone = duplicateZone(selectedZone);

      commit((state) => ({
        ...state,
        zoneList: [...state.zoneList, nextZone],
        selectedItem: { type: "space", id: nextZone.id },
      }));
    }
  };

  const moveSelectedItemToFront = () => {
    if (!editor.selectedItem) {
      return;
    }

    const { id, type } = editor.selectedItem;

    commit((state) => ({
      ...state,
      furnitureList: type === "furniture" ? moveItemToEdge(state.furnitureList, id, "front") : state.furnitureList,
      zoneList: type === "space" ? moveItemToEdge(state.zoneList, id, "front") : state.zoneList,
      windowList: type === "window" ? moveItemToEdge(state.windowList, id, "front") : state.windowList,
    }));
  };

  const moveSelectedItemToBack = () => {
    if (!editor.selectedItem) {
      return;
    }

    const { id, type } = editor.selectedItem;

    commit((state) => ({
      ...state,
      furnitureList: type === "furniture" ? moveItemToEdge(state.furnitureList, id, "back") : state.furnitureList,
      zoneList: type === "space" ? moveItemToEdge(state.zoneList, id, "back") : state.zoneList,
      windowList: type === "window" ? moveItemToEdge(state.windowList, id, "back") : state.windowList,
    }));
  };

  const rotateSelectedFurniture = () => {
    if (editor.selectedItem?.type !== "furniture") {
      return;
    }

    commit((state) => ({
      ...state,
      furnitureList: state.furnitureList.map((item) =>
        item.id === state.selectedItem?.id
          ? {
              ...item,
              width: item.height,
              height: item.width,
              rotation: item.rotation === 0 ? 90 : 0,
            }
          : item,
      ),
    }));
  };

  const moveFurniture = (id: string, position: Pick<Furniture, "x" | "y">) => {
    updatePreview((state) => ({
      ...state,
      furnitureList: state.furnitureList.map((item) => (item.id === id ? { ...item, ...position } : item)),
      selectedItem: { type: "furniture", id },
    }));
  };

  const moveZone = (id: string, position: Pick<SpaceZone, "x" | "y">) => {
    updatePreview((state) => ({
      ...state,
      zoneList: state.zoneList.map((item) => (item.id === id ? { ...item, ...position } : item)),
      selectedItem: { type: "space", id },
    }));
  };

  const moveWindow = (id: string, patch: Pick<WindowOpening, "offset">) => {
    updatePreview((state) => ({
      ...state,
      windowList: state.windowList.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      selectedItem: { type: "window", id },
    }));
  };

  const resizeFurniture = (id: string, patch: Pick<Furniture, "x" | "y" | "width" | "height">) => {
    updatePreview((state) => ({
      ...state,
      furnitureList: state.furnitureList.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      selectedItem: { type: "furniture", id },
    }));
  };

  const resizeZone = (id: string, patch: Pick<SpaceZone, "x" | "y" | "width" | "height">) => {
    updatePreview((state) => ({
      ...state,
      zoneList: state.zoneList.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      selectedItem: { type: "space", id },
    }));
  };

  const resizeWindow = (id: string, patch: Pick<WindowOpening, "offset" | "length">) => {
    updatePreview((state) => ({
      ...state,
      windowList: state.windowList.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      selectedItem: { type: "window", id },
    }));
  };

  const applyTemplate = (templateId: string) => {
    const template = ROOM_TEMPLATES.find((item) => item.id === templateId);

    if (!template) {
      return;
    }

    setSelectedTemplateId(templateId);
    commit((state) => ({
      ...state,
      room: template.room,
      zoneList: template.starterZones ?? [],
      windowList: template.starterWindows ?? [],
      furnitureList: template.starterFurniture ?? [],
      selectedItem: null,
      layoutId: null,
      layoutName: template.name,
    }));
  };

  const saveCurrentLayout = () => {
    const trimmedName = editor.layoutName.trim() || `배치안 ${savedLayouts.length + 1}`;
    const matchedLayout = savedLayouts.find((layout) => layout.id === editor.layoutId && layout.name === trimmedName);
    const now = new Date().toISOString();

    const nextLayout: LayoutRecord = {
      id: matchedLayout?.id ?? `layout-${crypto.randomUUID()}`,
      name: trimmedName,
      room: editor.room,
      furnitureList: editor.furnitureList,
      zoneList: editor.zoneList,
      windowList: editor.windowList,
      createdAt: matchedLayout?.createdAt ?? now,
      updatedAt: now,
    };

    const nextLayouts = matchedLayout
      ? savedLayouts.map((layout) => (layout.id === matchedLayout.id ? nextLayout : layout))
      : [nextLayout, ...savedLayouts];

    setSavedLayouts(nextLayouts);
    saveSavedLayouts(nextLayouts);

    commit((state) => ({
      ...state,
      layoutId: nextLayout.id,
      layoutName: nextLayout.name,
    }));
  };

  const loadLayout = (layoutId: string) => {
    const target = savedLayouts.find((layout) => layout.id === layoutId);

    if (!target) {
      return;
    }

    replaceEntireState({
      layoutId: target.id,
      layoutName: target.name,
      room: target.room,
      furnitureList: target.furnitureList ?? [],
      zoneList: target.zoneList ?? [],
      windowList: target.windowList ?? [],
      selectedItem: null,
    });
    setIsLoadPanelOpen(false);
    setSelectedTemplateId(null);
  };

  const deleteLayout = (layoutId: string) => {
    const nextLayouts = savedLayouts.filter((layout) => layout.id !== layoutId);
    setSavedLayouts(nextLayouts);
    saveSavedLayouts(nextLayouts);

    if (editor.layoutId === layoutId) {
      commit((state) => ({
        ...state,
        layoutId: null,
      }));
    }
  };

  const resetLayout = () => {
    replaceEntireState(createInitialStateWithTemplate());
    setSelectedTemplateId(DEFAULT_TEMPLATE_ID);
    setZoom(1);
  };

  const undo = () => {
    setHistory((previous) => {
      if (previous.past.length === 0) {
        return previous;
      }

      const nextPast = previous.past.slice(0, -1);
      const previousPresent = previous.past[previous.past.length - 1];

      return {
        past: nextPast,
        present: previousPresent,
        future: [previous.present, ...previous.future].slice(0, 50),
        previewOrigin: null,
      };
    });
  };

  const redo = () => {
    setHistory((previous) => {
      if (previous.future.length === 0) {
        return previous;
      }

      const [nextPresent, ...restFuture] = previous.future;

      return {
        past: [...previous.past.slice(-49), previous.present],
        present: nextPresent,
        future: restFuture,
        previewOrigin: null,
      };
    });
  };

  return (
    <div className="min-h-screen bg-paper px-3 py-4 text-ink-900 sm:px-4 sm:py-5 lg:px-6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-5">
        <Header
          layoutName={editor.layoutName}
          onLayoutNameChange={(value) => commit((state) => ({ ...state, layoutName: value }))}
          onSave={saveCurrentLayout}
          onToggleLoadPanel={() => setIsLoadPanelOpen((value) => !value)}
          onReset={resetLayout}
          summary={summary}
        />

        <main className="grid gap-5 xl:items-start xl:grid-cols-[300px_minmax(0,1fr)_300px] 2xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <LeftSidebar
            room={editor.room}
            selectedTemplateId={selectedTemplateId}
            savedLayouts={savedLayouts}
            isLoadPanelOpen={isLoadPanelOpen}
            snapEnabled={snapEnabled}
            onRoomChange={updateRoom}
            onSelectTemplate={applyTemplate}
            onAddFurniture={addFurniture}
            onAddZone={addZone}
            onAddWindow={addWindow}
            onLoadLayout={loadLayout}
            onDeleteLayout={deleteLayout}
            onToggleSnap={() => setSnapEnabled((value) => !value)}
          />

          <RoomCanvas
            room={editor.room}
            furnitureList={evaluatedFurniture}
            zoneList={evaluatedZones}
            windowList={evaluatedWindows}
            selectedItem={editor.selectedItem}
            zoom={zoom}
            onZoomChange={setZoom}
            onSelectItem={(selection: Selection | null) => commit((state) => ({ ...state, selectedItem: selection }))}
            onMoveStart={startPreview}
            onMoveFurniture={moveFurniture}
            onMoveZone={moveZone}
            onMoveWindow={moveWindow}
            onResizeFurniture={resizeFurniture}
            onResizeZone={resizeZone}
            onResizeWindow={resizeWindow}
            onMoveEnd={finishPreview}
            onDuplicateSelected={duplicateSelectedItem}
            onDeleteSelected={deleteSelectedItem}
            onUndo={undo}
            onRedo={redo}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
            snapEnabled={snapEnabled}
          />

          <RightSidebar
            selectedItem={editor.selectedItem}
            selectedFurniture={selectedFurniture}
            selectedZone={selectedZone}
            selectedWindow={selectedWindow}
            selectedLayer={selectedLayer}
            roomUnit={editor.room.unit}
            onUpdateFurniture={updateSelectedFurniture}
            onUpdateZone={updateSelectedZone}
            onUpdateWindow={updateSelectedWindow}
            onRotateFurniture={rotateSelectedFurniture}
            onBringSelectedToFront={moveSelectedItemToFront}
            onSendSelectedToBack={moveSelectedItemToBack}
            onDeleteSelected={deleteSelectedItem}
            onDuplicateSelected={duplicateSelectedItem}
          />
        </main>

        <SummaryBar
          room={editor.room}
          summary={summary}
          furnitureCount={editor.furnitureList.length}
          zoneCount={editor.zoneList.length}
          windowCount={editor.windowList.length}
        />
      </div>
    </div>
  );
}
