import { useState } from "react";
import { LayoutTemplate, Plus, Upload } from "lucide-react";
import type { FurnitureType, LayoutRecord, Room, SpaceType, Unit, WindowSide } from "../types";
import { ObjectAddDialog } from "./ObjectAddDialog";
import { SectionTitle } from "./SectionTitle";
import { TemplateDialog } from "./TemplateDialog";

interface LeftSidebarProps {
  room: Room;
  selectedTemplateId: string | null;
  savedLayouts: LayoutRecord[];
  isLoadPanelOpen: boolean;
  snapEnabled: boolean;
  onRoomChange: (patch: Partial<Room>) => void;
  onSelectTemplate: (templateId: string) => void;
  onAddFurniture: (type: FurnitureType) => void;
  onAddZone: (type: SpaceType) => void;
  onAddWindow: (side: WindowSide) => void;
  onLoadLayout: (layoutId: string) => void;
  onDeleteLayout: (layoutId: string) => void;
  onImportLayoutFile: () => void;
  onToggleSnap: () => void;
}

const unitLabels: Record<Unit, string> = {
  cm: "cm",
  m: "m",
};

export const LeftSidebar = ({
  room,
  selectedTemplateId,
  savedLayouts,
  isLoadPanelOpen,
  snapEnabled,
  onRoomChange,
  onSelectTemplate,
  onAddFurniture,
  onAddZone,
  onAddWindow,
  onLoadLayout,
  onDeleteLayout,
  onImportLayoutFile,
  onToggleSnap,
}: LeftSidebarProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const roomWidthInput = room.unit === "m" ? Number((room.width / 100).toFixed(2)) : room.width;
  const roomHeightInput = room.unit === "m" ? Number((room.height / 100).toFixed(2)) : room.height;
  const roomStep = room.unit === "m" ? "0.1" : "10";
  const roomMin = room.unit === "m" ? "1" : "100";

  return (
    <aside className="space-y-5 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-paper backdrop-blur transition-colors duration-300 dark:border-white/10 dark:bg-[#191815] dark:shadow-none xl:h-fit xl:self-start xl:sticky xl:top-5 xl:max-h-[calc(100dvh-40px)] xl:overflow-y-auto">
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <SectionTitle eyebrow="Room" title="방 크기 설정" description="수치를 바꾸면 평면도와 면적 계산이 바로 반영됩니다." />
          <button
            type="button"
            onClick={() => setIsTemplateDialogOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 dark:border-white/10 dark:bg-white/5 dark:text-[#ebe4d6] dark:hover:bg-white/10"
          >
            <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
            템플릿 보기
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="rounded-2xl border border-ink-200 bg-ink-50 px-3 py-3 dark:border-white/10 dark:bg-white/5">
            <span className="text-xs font-medium text-ink-500 dark:text-[#b9b1a3]">가로</span>
            <input
              type="number"
              min={roomMin}
              step={roomStep}
              value={roomWidthInput}
              onChange={(event) =>
                onRoomChange({
                  width:
                    room.unit === "m" ? Math.round((Number(event.target.value) || 0) * 100) : Number(event.target.value) || 0,
                })
              }
              className="mt-2 w-full bg-transparent text-lg font-semibold text-ink-900 outline-none dark:text-[#f4f0e7]"
            />
          </label>
          <label className="rounded-2xl border border-ink-200 bg-ink-50 px-3 py-3 dark:border-white/10 dark:bg-white/5">
            <span className="text-xs font-medium text-ink-500 dark:text-[#b9b1a3]">세로</span>
            <input
              type="number"
              min={roomMin}
              step={roomStep}
              value={roomHeightInput}
              onChange={(event) =>
                onRoomChange({
                  height:
                    room.unit === "m" ? Math.round((Number(event.target.value) || 0) * 100) : Number(event.target.value) || 0,
                })
              }
              className="mt-2 w-full bg-transparent text-lg font-semibold text-ink-900 outline-none dark:text-[#f4f0e7]"
            />
          </label>
        </div>
        <div className="flex gap-2">
          {Object.entries(unitLabels).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onRoomChange({ unit: value as Unit })}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                room.unit === value
                  ? "bg-ink-900 text-white dark:bg-[#f3e5c1] dark:text-[#1f1b14]"
                  : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-white/10 dark:text-[#d3ccbe] dark:hover:bg-white/15"
              }`}
            >
              {label} 기준
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onToggleSnap}
          className={`w-full rounded-2xl px-4 py-3 text-sm font-medium transition ${
            snapEnabled
              ? "bg-accent-100 text-accent-700 dark:bg-[#47310f] dark:text-[#ffd27e]"
              : "bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-[#d3ccbe]"
          }`}
        >
          격자 스냅 {snapEnabled ? "켜짐" : "꺼짐"}
        </button>
      </section>

      <section className="rounded-[24px] border border-ink-200 bg-ink-50 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">Add</p>
            <h2 className="mt-1 text-base font-semibold text-ink-900 dark:text-[#f4f0e7]">오브젝트</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAddDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink-700 dark:bg-[#f3e5c1] dark:text-[#1f1b14] dark:hover:bg-[#f7edd7]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            추가
          </button>
        </div>
      </section>

      {isLoadPanelOpen ? (
        <section className="space-y-4 rounded-3xl border border-ink-200 bg-ink-50 p-4 dark:border-white/10 dark:bg-white/5">
          <SectionTitle eyebrow="Saved" title="저장된 배치안" description="localStorage 목록을 보거나 RoomFit JSON 파일을 바로 불러옵니다." />
          <button
            type="button"
            onClick={onImportLayoutFile}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition hover:border-ink-300 hover:bg-ink-50 dark:border-white/10 dark:bg-white/5 dark:text-[#ebe4d6] dark:hover:bg-white/10"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            파일 불러오기
          </button>
          {savedLayouts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-4 py-6 text-sm text-ink-500 dark:border-white/10 dark:bg-white/5 dark:text-[#b9b1a3]">
              아직 저장된 배치안이 없습니다. 상단의 저장 버튼이나 파일 저장으로 첫 배치안을 만들어 보세요.
            </div>
          ) : (
            <div className="space-y-3">
              {savedLayouts.map((layout) => (
                <div key={layout.id} className="rounded-2xl border border-white bg-white px-4 py-4 dark:border-white/10 dark:bg-[#21201c]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-900 dark:text-[#f4f0e7]">{layout.name}</p>
                      <p className="mt-1 text-xs text-ink-500 dark:text-[#b9b1a3]">
                        {new Date(layout.updatedAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <span className="rounded-full bg-ink-100 px-2 py-1 text-xs font-medium text-ink-500 dark:bg-white/10 dark:text-[#d3ccbe]">
                      {(layout.furnitureList ?? []).length + (layout.zoneList ?? []).length + (layout.windowList ?? []).length}개
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onLoadLayout(layout.id)}
                      className="flex-1 rounded-xl bg-ink-900 px-3 py-2 text-sm font-medium text-white dark:bg-[#f3e5c1] dark:text-[#1f1b14]"
                    >
                      불러오기
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteLayout(layout.id)}
                      className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 dark:border-white/10 dark:text-[#d3ccbe]"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <ObjectAddDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddFurniture={onAddFurniture}
        onAddZone={onAddZone}
        onAddWindow={onAddWindow}
      />
      <TemplateDialog
        isOpen={isTemplateDialogOpen}
        selectedTemplateId={selectedTemplateId}
        roomUnit={room.unit}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSelectTemplate={onSelectTemplate}
      />
    </aside>
  );
};
