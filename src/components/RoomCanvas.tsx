import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Redo2, Trash2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { GRID_SIZE_CM } from "../constants/furniture";
import { useElementSize } from "../hooks/useElementSize";
import type {
  EvaluatedFurniture,
  EvaluatedSpaceZone,
  EvaluatedWindowOpening,
  Furniture,
  Selection,
  SpaceZone,
  WindowOpening,
} from "../types";
import { clampWithinCanvas, formatDimension } from "../utils/layout";
import { FurnitureShape } from "./FurnitureShape";

interface RoomCanvasProps {
  room: {
    width: number;
    height: number;
    unit: "cm" | "m";
  };
  furnitureList: EvaluatedFurniture[];
  zoneList: EvaluatedSpaceZone[];
  windowList: EvaluatedWindowOpening[];
  selectedItem: Selection | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onSelectItem: (selection: Selection | null) => void;
  onMoveStart: () => void;
  onMoveFurniture: (id: string, position: Pick<Furniture, "x" | "y">) => void;
  onMoveZone: (id: string, position: Pick<SpaceZone, "x" | "y">) => void;
  onMoveWindow: (id: string, patch: Pick<WindowOpening, "offset">) => void;
  onResizeFurniture: (id: string, patch: Pick<Furniture, "x" | "y" | "width" | "height">) => void;
  onResizeZone: (id: string, patch: Pick<SpaceZone, "x" | "y" | "width" | "height">) => void;
  onResizeWindow: (id: string, patch: Pick<WindowOpening, "offset" | "length">) => void;
  onMoveEnd: () => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  snapEnabled: boolean;
}

interface DragState {
  type: Selection["type"];
  id: string;
  mode: "move" | "resize";
  offsetX: number;
  offsetY: number;
  handle?: ResizeHandle;
  startX?: number;
  startY?: number;
  startWidth?: number;
  startHeight?: number;
  startOffset?: number;
  startLength?: number;
}

type ResizeHandle = "nw" | "ne" | "sw" | "se" | "start" | "end";

const MIN_OBJECT_SIZE = 30;
const MIN_WINDOW_LENGTH = 30;

const cornerHandles: Array<{ key: ResizeHandle; className: string; cursor: string; label: string }> = [
  { key: "nw", className: "-left-2 -top-2", cursor: "nwse-resize", label: "왼쪽 위 크기 조절" },
  { key: "ne", className: "-right-2 -top-2", cursor: "nesw-resize", label: "오른쪽 위 크기 조절" },
  { key: "sw", className: "-bottom-2 -left-2", cursor: "nesw-resize", label: "왼쪽 아래 크기 조절" },
  { key: "se", className: "-bottom-2 -right-2", cursor: "nwse-resize", label: "오른쪽 아래 크기 조절" },
];

const handleBaseClass =
  "absolute rounded-full border-2 border-white bg-ink-900 shadow-md touch-none h-5 w-5 sm:h-4 sm:w-4";

export const RoomCanvas = ({
  room,
  furnitureList,
  zoneList,
  windowList,
  selectedItem,
  zoom,
  onZoomChange,
  onSelectItem,
  onMoveStart,
  onMoveFurniture,
  onMoveZone,
  onMoveWindow,
  onResizeFurniture,
  onResizeZone,
  onResizeWindow,
  onMoveEnd,
  onDuplicateSelected,
  onDeleteSelected,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  snapEnabled,
}: RoomCanvasProps) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<HTMLDivElement | null>(null);
  const stageSize = useElementSize(stageRef);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const scale = useMemo(() => {
    const availableWidth = Math.max(stageSize.width - 32, 240);
    const availableHeight = Math.max(stageSize.height - 32, 260);
    const fitScale = Math.min(availableWidth / room.width, availableHeight / room.height);
    return Math.max(0.2, fitScale * zoom);
  }, [room.height, room.width, stageSize.height, stageSize.width, zoom]);

  const roomPixelWidth = room.width * scale;
  const roomPixelHeight = room.height * scale;
  const hasSelection = selectedItem !== null;
  const canDuplicateSelection = selectedItem?.type === "furniture" || selectedItem?.type === "space";
  const isSelected = (type: Selection["type"], id: string) => selectedItem?.type === type && selectedItem.id === id;
  const snapValue = useCallback(
    (value: number) => (snapEnabled ? Math.round(value / GRID_SIZE_CM) * GRID_SIZE_CM : value),
    [snapEnabled],
  );

  const getObjectResizePatch = useCallback(
    (
      pointerX: number,
      pointerY: number,
      state: DragState,
      maxWidth: number,
      maxHeight: number,
    ): Pick<Furniture, "x" | "y" | "width" | "height"> | null => {
      if (!state.handle || state.startX === undefined || state.startY === undefined || state.startWidth === undefined || state.startHeight === undefined) {
        return null;
      }

      const startRight = state.startX + state.startWidth;
      const startBottom = state.startY + state.startHeight;
      let nextX = state.startX;
      let nextY = state.startY;
      let nextWidth = state.startWidth;
      let nextHeight = state.startHeight;

      if (state.handle.includes("e")) {
        nextWidth = snapValue(pointerX - state.startX);
      }

      if (state.handle.includes("s")) {
        nextHeight = snapValue(pointerY - state.startY);
      }

      if (state.handle.includes("w")) {
        const snappedX = snapValue(pointerX);
        nextX = clampWithinCanvas(snappedX, 0, startRight - MIN_OBJECT_SIZE);
        nextWidth = startRight - nextX;
      }

      if (state.handle.includes("n")) {
        const snappedY = snapValue(pointerY);
        nextY = clampWithinCanvas(snappedY, 0, startBottom - MIN_OBJECT_SIZE);
        nextHeight = startBottom - nextY;
      }

      nextWidth = clampWithinCanvas(nextWidth, MIN_OBJECT_SIZE, maxWidth - nextX);
      nextHeight = clampWithinCanvas(nextHeight, MIN_OBJECT_SIZE, maxHeight - nextY);

      return {
        x: Math.round(nextX),
        y: Math.round(nextY),
        width: Math.round(nextWidth),
        height: Math.round(nextHeight),
      };
    },
    [snapValue],
  );

  const getWindowResizePatch = useCallback(
    (
      pointerX: number,
      pointerY: number,
      state: DragState,
      activeWindow: EvaluatedWindowOpening,
    ): Pick<WindowOpening, "offset" | "length"> | null => {
      if (!state.handle || state.startOffset === undefined || state.startLength === undefined) {
        return null;
      }

      const axisPointer = activeWindow.side === "top" || activeWindow.side === "bottom" ? pointerX : pointerY;
      const wallLength = activeWindow.side === "top" || activeWindow.side === "bottom" ? room.width : room.height;
      const startEnd = state.startOffset + state.startLength;

      if (state.handle === "start") {
        const nextOffset = clampWithinCanvas(snapValue(axisPointer), 0, startEnd - MIN_WINDOW_LENGTH);

        return {
          offset: Math.round(nextOffset),
          length: Math.round(startEnd - nextOffset),
        };
      }

      const nextLength = clampWithinCanvas(snapValue(axisPointer - state.startOffset), MIN_WINDOW_LENGTH, wallLength - state.startOffset);

      return {
        offset: Math.round(state.startOffset),
        length: Math.round(nextLength),
      };
    },
    [room.height, room.width, snapValue],
  );

  const moveItem = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragState || !roomRef.current) {
        return;
      }

      const rect = roomRef.current.getBoundingClientRect();
      const pointerX = (clientX - rect.left) / scale;
      const pointerY = (clientY - rect.top) / scale;

      if (dragState.type === "furniture") {
        const activeItem = furnitureList.find((item) => item.id === dragState.id);

        if (!activeItem) {
          return;
        }

        if (dragState.mode === "resize") {
          const patch = getObjectResizePatch(pointerX, pointerY, dragState, room.width, room.height);

          if (patch) {
            onResizeFurniture(dragState.id, patch);
          }

          return;
        }

        const nextX = pointerX - dragState.offsetX;
        const nextY = pointerY - dragState.offsetY;
        const snappedX = snapValue(nextX);
        const snappedY = snapValue(nextY);

        onMoveFurniture(dragState.id, {
          x: clampWithinCanvas(snappedX, -activeItem.width / 2, room.width - activeItem.width / 2),
          y: clampWithinCanvas(snappedY, -activeItem.height / 2, room.height - activeItem.height / 2),
        });
      }

      if (dragState.type === "space") {
        const activeZone = zoneList.find((item) => item.id === dragState.id);

        if (!activeZone) {
          return;
        }

        if (dragState.mode === "resize") {
          const patch = getObjectResizePatch(pointerX, pointerY, dragState, room.width, room.height);

          if (patch) {
            onResizeZone(dragState.id, patch);
          }

          return;
        }

        const nextX = pointerX - dragState.offsetX;
        const nextY = pointerY - dragState.offsetY;
        const snappedX = snapValue(nextX);
        const snappedY = snapValue(nextY);

        onMoveZone(dragState.id, {
          x: clampWithinCanvas(snappedX, -activeZone.width / 2, room.width - activeZone.width / 2),
          y: clampWithinCanvas(snappedY, -activeZone.height / 2, room.height - activeZone.height / 2),
        });
      }

      if (dragState.type === "window") {
        const activeWindow = windowList.find((item) => item.id === dragState.id);

        if (!activeWindow) {
          return;
        }

        if (dragState.mode === "resize") {
          const patch = getWindowResizePatch(pointerX, pointerY, dragState, activeWindow);

          if (patch) {
            onResizeWindow(dragState.id, patch);
          }

          return;
        }

        const rawOffset =
          activeWindow.side === "top" || activeWindow.side === "bottom"
            ? pointerX - dragState.offsetX
            : pointerY - dragState.offsetY;
        const maxOffset =
          activeWindow.side === "top" || activeWindow.side === "bottom"
            ? room.width - activeWindow.length
            : room.height - activeWindow.length;
        const snappedOffset = snapValue(rawOffset);

        onMoveWindow(dragState.id, {
          offset: clampWithinCanvas(snappedOffset, 0, Math.max(0, maxOffset)),
        });
      }
    },
    [
      dragState,
      furnitureList,
      getObjectResizePatch,
      getWindowResizePatch,
      onMoveFurniture,
      onResizeFurniture,
      onResizeWindow,
      onResizeZone,
      onMoveWindow,
      onMoveZone,
      room.height,
      room.width,
      scale,
      snapValue,
      windowList,
      zoneList,
    ],
  );

  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      moveItem(event.clientX, event.clientY);
    };

    const handlePointerEnd = () => {
      setDragState(null);
      onMoveEnd();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, [dragState, moveItem, onMoveEnd]);

  const getWindowStyle = (item: EvaluatedWindowOpening) => {
    const thickness = Math.max(10, item.depth * scale);

    if (item.side === "top") {
      return {
        left: item.offset * scale,
        top: -thickness / 2,
        width: item.length * scale,
        height: thickness,
      };
    }

    if (item.side === "bottom") {
      return {
        left: item.offset * scale,
        top: roomPixelHeight - thickness / 2,
        width: item.length * scale,
        height: thickness,
      };
    }

    if (item.side === "right") {
      return {
        left: roomPixelWidth - thickness / 2,
        top: item.offset * scale,
        width: thickness,
        height: item.length * scale,
      };
    }

    return {
      left: -thickness / 2,
      top: item.offset * scale,
      width: thickness,
      height: item.length * scale,
    };
  };

  return (
    <section className="flex min-h-[500px] flex-col rounded-[32px] border border-white/70 bg-white/80 p-4 shadow-paper backdrop-blur sm:min-h-[560px] sm:p-5 lg:min-h-[640px] xl:min-h-[720px]">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-ink-200 bg-ink-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ink-900">2D 평면도</p>
          <p className="text-xs text-ink-500">
            가구를 드래그해서 배치하고, 겹치거나 방을 벗어나면 붉은 테두리로 경고합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="실행 취소"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">실행 취소</span>
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="다시 실행"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Redo2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">다시 실행</span>
          </button>
          <button
            type="button"
            onClick={onDuplicateSelected}
            disabled={!canDuplicateSelection}
            aria-label="선택 항목 복사"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">복사</span>
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            aria-label="선택 항목 삭제"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">삭제</span>
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-2 py-2">
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(0.7, Number((zoom - 0.1).toFixed(1))))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-sm font-bold text-ink-700"
              aria-label="축소"
            >
              <ZoomOut className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-14 text-center text-sm font-medium text-ink-700">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(1.8, Number((zoom + 0.1).toFixed(1))))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-sm font-bold text-ink-700"
              aria-label="확대"
            >
              <ZoomIn className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div ref={stageRef} className="mt-4 flex-1 overflow-auto rounded-[28px] border border-ink-200 bg-[#f6f5f0] p-3 sm:mt-5 sm:p-6">
        <div className="flex min-h-full min-w-full items-start justify-center">
          <div
            ref={roomRef}
            className="relative shrink-0 overflow-visible rounded-[26px] border-[14px] border-[#d8d3c5] bg-white shadow-[inset_0_0_0_1px_rgba(39,35,28,0.06)]"
            style={{
              width: roomPixelWidth,
              height: roomPixelHeight,
              backgroundImage:
                "linear-gradient(rgba(162, 157, 146, 0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(162, 157, 146, 0.13) 1px, transparent 1px)",
              backgroundSize: `${GRID_SIZE_CM * scale}px ${GRID_SIZE_CM * scale}px`,
            }}
            onClick={() => onSelectItem(null)}
          >
            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink-500">
              {formatDimension(room.width, room.unit)} × {formatDimension(room.height, room.unit)}
            </div>

            {zoneList.map((item) => {
              const hasWarning = item.isOutOfBounds;

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className={`absolute z-0 touch-none border text-left transition ${
                    isSelected("space", item.id) ? "ring-4 ring-accent-300" : "ring-0"
                  } ${hasWarning ? "border-danger-500 bg-danger-100" : "border-dashed border-ink-300"}`}
                  style={{
                    left: item.x * scale,
                    top: item.y * scale,
                    width: item.width * scale,
                    height: item.height * scale,
                    backgroundColor: hasWarning ? "#f6d1d1" : item.color,
                    opacity: 0.72,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectItem({ type: "space", id: item.id });
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onSelectItem({ type: "space", id: item.id });
                    onMoveStart();
                    setDragState({
                      type: "space",
                      id: item.id,
                      mode: "move",
                      offsetX: (event.clientX - event.currentTarget.getBoundingClientRect().left) / scale,
                      offsetY: (event.clientY - event.currentTarget.getBoundingClientRect().top) / scale,
                    });
                  }}
                  onDragStart={(event) => event.preventDefault()}
                  draggable={false}
                >
                  <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2 py-1 text-[11px] font-semibold text-ink-700">
                    {item.name}
                  </span>
                  {isSelected("space", item.id)
                    ? cornerHandles.map((handle) => (
                        <span
                          key={handle.key}
                          role="presentation"
                          aria-label={handle.label}
                          className={`${handleBaseClass} ${handle.className}`}
                          style={{ cursor: handle.cursor }}
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            onSelectItem({ type: "space", id: item.id });
                            onMoveStart();
                            setDragState({
                              type: "space",
                              id: item.id,
                              mode: "resize",
                              handle: handle.key,
                              offsetX: 0,
                              offsetY: 0,
                              startX: item.x,
                              startY: item.y,
                              startWidth: item.width,
                              startHeight: item.height,
                            });
                          }}
                        />
                      ))
                    : null}
                </div>
              );
            })}

            {furnitureList.map((item) => {
              const selected = isSelected("furniture", item.id);
              const hasWarning = item.isOutOfBounds || item.isOverlapping;

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className={`absolute z-10 touch-none rounded-[20px] transition ${
                    selected ? "ring-4 ring-accent-300" : "ring-0"
                  } ${hasWarning ? "shadow-[0_0_0_2px_rgba(201,79,79,0.8)]" : "shadow-[0_12px_26px_rgba(39,35,28,0.12)]"}`}
                  style={{
                    left: item.x * scale,
                    top: item.y * scale,
                    width: item.width * scale,
                    height: item.height * scale,
                    backgroundColor: item.isOutOfBounds ? "#f6d1d1" : item.color,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectItem({ type: "furniture", id: item.id });
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onSelectItem({ type: "furniture", id: item.id });
                    onMoveStart();
                    setDragState({
                      type: "furniture",
                      id: item.id,
                      mode: "move",
                      offsetX: (event.clientX - event.currentTarget.getBoundingClientRect().left) / scale,
                      offsetY: (event.clientY - event.currentTarget.getBoundingClientRect().top) / scale,
                    });
                  }}
                  onDragStart={(event) => event.preventDefault()}
                  draggable={false}
                >
                  <FurnitureShape type={item.type} name={item.name} />
                  <div className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-ink-500">
                    {item.x}, {item.y}
                  </div>
                  {item.rotation === 90 ? (
                    <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-ink-500">
                      90°
                    </div>
                  ) : null}
                  {selected
                    ? cornerHandles.map((handle) => (
                        <span
                          key={handle.key}
                          role="presentation"
                          aria-label={handle.label}
                          className={`${handleBaseClass} ${handle.className}`}
                          style={{ cursor: handle.cursor }}
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            onSelectItem({ type: "furniture", id: item.id });
                            onMoveStart();
                            setDragState({
                              type: "furniture",
                              id: item.id,
                              mode: "resize",
                              handle: handle.key,
                              offsetX: 0,
                              offsetY: 0,
                              startX: item.x,
                              startY: item.y,
                              startWidth: item.width,
                              startHeight: item.height,
                            });
                          }}
                        />
                      ))
                    : null}
                </div>
              );
            })}

            {windowList.map((item) => {
              const style = getWindowStyle(item);
              const vertical = item.side === "left" || item.side === "right";

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className={`absolute z-20 touch-none rounded-full border-2 bg-white text-[10px] font-semibold transition ${
                    isSelected("window", item.id)
                      ? "border-accent-500 ring-4 ring-accent-300"
                      : item.isOutOfBounds
                        ? "border-danger-500"
                        : "border-[#2f7f98]"
                  }`}
                  style={{
                    ...style,
                    backgroundColor: item.isOutOfBounds ? "#f6d1d1" : item.color,
                    color: "#173c48",
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectItem({ type: "window", id: item.id });
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onSelectItem({ type: "window", id: item.id });
                    onMoveStart();
                    const currentRect = event.currentTarget.getBoundingClientRect();

                    setDragState({
                      type: "window",
                      id: item.id,
                      mode: "move",
                      offsetX: vertical ? 0 : (event.clientX - currentRect.left) / scale,
                      offsetY: vertical ? (event.clientY - currentRect.top) / scale : 0,
                    });
                  }}
                  onDragStart={(event) => event.preventDefault()}
                  draggable={false}
                >
                  <span className={vertical ? "sr-only" : "block truncate px-2"}>{item.name}</span>
                  {isSelected("window", item.id) ? (
                    <>
                      <span
                        role="presentation"
                        aria-label="창문 시작점 조절"
                        className={`${handleBaseClass} ${
                          vertical ? "-top-2 left-1/2 -translate-x-1/2" : "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        }`}
                        style={{ cursor: vertical ? "ns-resize" : "ew-resize" }}
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          onSelectItem({ type: "window", id: item.id });
                          onMoveStart();
                          setDragState({
                            type: "window",
                            id: item.id,
                            mode: "resize",
                            handle: "start",
                            offsetX: 0,
                            offsetY: 0,
                            startOffset: item.offset,
                            startLength: item.length,
                          });
                        }}
                      />
                      <span
                        role="presentation"
                        aria-label="창문 끝점 조절"
                        className={`${handleBaseClass} ${
                          vertical
                            ? "-bottom-2 left-1/2 -translate-x-1/2"
                            : "right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
                        }`}
                        style={{ cursor: vertical ? "ns-resize" : "ew-resize" }}
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          onSelectItem({ type: "window", id: item.id });
                          onMoveStart();
                          setDragState({
                            type: "window",
                            id: item.id,
                            mode: "resize",
                            handle: "end",
                            offsetX: 0,
                            offsetY: 0,
                            startOffset: item.offset,
                            startLength: item.length,
                          });
                        }}
                      />
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
