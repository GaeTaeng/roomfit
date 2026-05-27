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
  offsetX: number;
  offsetY: number;
}

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
  const stageSize = useElementSize(stageRef.current);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const scale = useMemo(() => {
    const availableWidth = Math.max(stageSize.width - 48, 360);
    const availableHeight = Math.max(stageSize.height - 48, 360);
    const fitScale = Math.min(availableWidth / room.width, availableHeight / room.height);
    return Math.max(0.2, fitScale * zoom);
  }, [room.height, room.width, stageSize.height, stageSize.width, zoom]);

  const roomPixelWidth = room.width * scale;
  const roomPixelHeight = room.height * scale;
  const hasSelection = selectedItem !== null;
  const canDuplicateSelection = selectedItem?.type === "furniture" || selectedItem?.type === "space";
  const isSelected = (type: Selection["type"], id: string) => selectedItem?.type === type && selectedItem.id === id;

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

        const nextX = pointerX - dragState.offsetX;
        const nextY = pointerY - dragState.offsetY;
        const snappedX = snapEnabled ? Math.round(nextX / GRID_SIZE_CM) * GRID_SIZE_CM : nextX;
        const snappedY = snapEnabled ? Math.round(nextY / GRID_SIZE_CM) * GRID_SIZE_CM : nextY;

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

        const nextX = pointerX - dragState.offsetX;
        const nextY = pointerY - dragState.offsetY;
        const snappedX = snapEnabled ? Math.round(nextX / GRID_SIZE_CM) * GRID_SIZE_CM : nextX;
        const snappedY = snapEnabled ? Math.round(nextY / GRID_SIZE_CM) * GRID_SIZE_CM : nextY;

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

        const rawOffset =
          activeWindow.side === "top" || activeWindow.side === "bottom"
            ? pointerX - dragState.offsetX
            : pointerY - dragState.offsetY;
        const maxOffset =
          activeWindow.side === "top" || activeWindow.side === "bottom"
            ? room.width - activeWindow.length
            : room.height - activeWindow.length;
        const snappedOffset = snapEnabled ? Math.round(rawOffset / GRID_SIZE_CM) * GRID_SIZE_CM : rawOffset;

        onMoveWindow(dragState.id, {
          offset: clampWithinCanvas(snappedOffset, 0, Math.max(0, maxOffset)),
        });
      }
    },
    [
      dragState,
      furnitureList,
      onMoveFurniture,
      onMoveWindow,
      onMoveZone,
      room.height,
      room.width,
      scale,
      snapEnabled,
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
    <section className="flex min-h-[780px] flex-col rounded-[32px] border border-white/70 bg-white/80 p-5 shadow-paper backdrop-blur">
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
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            실행 취소
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Redo2 className="h-4 w-4" aria-hidden="true" />
            다시 실행
          </button>
          <button
            type="button"
            onClick={onDuplicateSelected}
            disabled={!canDuplicateSelection}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            복사
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            삭제
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

      <div ref={stageRef} className="mt-5 flex-1 overflow-auto rounded-[28px] border border-ink-200 bg-[#f6f5f0] p-6">
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
                <button
                  key={item.id}
                  type="button"
                  className={`absolute z-0 overflow-hidden border text-left transition ${
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
                </button>
              );
            })}

            {furnitureList.map((item) => {
              const selected = isSelected("furniture", item.id);
              const hasWarning = item.isOutOfBounds || item.isOverlapping;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`absolute z-10 rounded-[20px] transition ${
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
                </button>
              );
            })}

            {windowList.map((item) => {
              const style = getWindowStyle(item);
              const vertical = item.side === "left" || item.side === "right";

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`absolute z-20 overflow-hidden rounded-full border-2 bg-white text-[10px] font-semibold transition ${
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
                      offsetX: vertical ? 0 : (event.clientX - currentRect.left) / scale,
                      offsetY: vertical ? (event.clientY - currentRect.top) / scale : 0,
                    });
                  }}
                  onDragStart={(event) => event.preventDefault()}
                  draggable={false}
                >
                  <span className={vertical ? "sr-only" : "block truncate px-2"}>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
