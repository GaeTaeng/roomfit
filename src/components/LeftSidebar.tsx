import { FURNITURE_PRESETS } from "../constants/furniture";
import { SPACE_PRESETS, WINDOW_PRESETS } from "../constants/spaces";
import { ROOM_TEMPLATES } from "../constants/templates";
import type { LayoutRecord, Room, SpaceType, Unit, WindowSide } from "../types";
import { formatDimension } from "../utils/layout";
import { SectionTitle } from "./SectionTitle";

interface LeftSidebarProps {
  room: Room;
  selectedTemplateId: string | null;
  savedLayouts: LayoutRecord[];
  isLoadPanelOpen: boolean;
  snapEnabled: boolean;
  onRoomChange: (patch: Partial<Room>) => void;
  onSelectTemplate: (templateId: string) => void;
  onAddFurniture: (type: (typeof FURNITURE_PRESETS)[number]["type"]) => void;
  onAddZone: (type: SpaceType) => void;
  onAddWindow: (side: WindowSide) => void;
  onLoadLayout: (layoutId: string) => void;
  onDeleteLayout: (layoutId: string) => void;
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
  onToggleSnap,
}: LeftSidebarProps) => {
  const roomWidthInput = room.unit === "m" ? Number((room.width / 100).toFixed(2)) : room.width;
  const roomHeightInput = room.unit === "m" ? Number((room.height / 100).toFixed(2)) : room.height;
  const roomStep = room.unit === "m" ? "0.1" : "10";
  const roomMin = room.unit === "m" ? "1" : "100";

  return (
    <aside className="space-y-5 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-paper backdrop-blur">
      <section className="space-y-4">
        <SectionTitle eyebrow="Room" title="방 크기 설정" description="수치를 바꾸면 평면도와 면적 계산이 바로 반영됩니다." />
        <div className="grid grid-cols-2 gap-3">
          <label className="rounded-2xl border border-ink-200 bg-ink-50 px-3 py-3">
            <span className="text-xs font-medium text-ink-500">가로</span>
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
              className="mt-2 w-full bg-transparent text-lg font-semibold text-ink-900 outline-none"
            />
          </label>
          <label className="rounded-2xl border border-ink-200 bg-ink-50 px-3 py-3">
            <span className="text-xs font-medium text-ink-500">세로</span>
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
              className="mt-2 w-full bg-transparent text-lg font-semibold text-ink-900 outline-none"
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
                room.unit === value ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200"
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
            snapEnabled ? "bg-accent-100 text-accent-700" : "bg-ink-100 text-ink-600"
          }`}
        >
          격자 스냅 {snapEnabled ? "켜짐" : "꺼짐"}
        </button>
      </section>

    {isLoadPanelOpen ? (
      <section className="space-y-4 rounded-3xl border border-ink-200 bg-ink-50 p-4">
        <SectionTitle eyebrow="Saved" title="저장된 배치안" description="localStorage에 저장된 배치안을 다시 불러옵니다." />
        {savedLayouts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-4 py-6 text-sm text-ink-500">
            아직 저장된 배치안이 없습니다. 상단의 저장 버튼으로 첫 배치안을 만들어 보세요.
          </div>
        ) : (
          <div className="space-y-3">
            {savedLayouts.map((layout) => (
              <div key={layout.id} className="rounded-2xl border border-white bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900">{layout.name}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {new Date(layout.updatedAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <span className="rounded-full bg-ink-100 px-2 py-1 text-xs font-medium text-ink-500">
                    {(layout.furnitureList ?? []).length + (layout.zoneList ?? []).length + (layout.windowList ?? []).length}개
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onLoadLayout(layout.id)}
                    className="flex-1 rounded-xl bg-ink-900 px-3 py-2 text-sm font-medium text-white"
                  >
                    불러오기
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteLayout(layout.id)}
                    className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600"
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

    <section className="space-y-4">
      <SectionTitle eyebrow="Template" title="기본 템플릿" description="바로 시작할 수 있도록 자주 쓰는 방 크기를 준비했습니다." />
      <div className="space-y-3">
        {ROOM_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelectTemplate(template.id)}
            className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
              selectedTemplateId === template.id
                ? "border-accent-500 bg-accent-50"
                : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900">{template.name}</p>
                <p className="mt-1 text-sm text-ink-500">{template.description}</p>
              </div>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-ink-500">
                {formatDimension(template.room.width, room.unit)} × {formatDimension(template.room.height, room.unit)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>

    <section className="space-y-4">
      <SectionTitle eyebrow="Furniture" title="가구 추가" description="기본 가구를 클릭해 바로 방 안에 배치하세요." />
      <div className="grid grid-cols-2 gap-3">
        {FURNITURE_PRESETS.map((preset) => (
          <button
            key={preset.type}
            type="button"
            onClick={() => onAddFurniture(preset.type)}
            className="rounded-2xl border border-ink-200 bg-white px-3 py-4 text-left transition hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-md"
          >
            <div className="mb-3 h-3 w-14 rounded-full" style={{ backgroundColor: preset.color }} />
            <p className="font-semibold text-ink-900">{preset.name}</p>
            <p className="mt-1 text-xs text-ink-500">
              {preset.width}×{preset.height}cm
            </p>
            <p className="mt-2 text-xs text-ink-400">{preset.hint}</p>
          </button>
        ))}
      </div>
    </section>

      <section className="space-y-4">
        <SectionTitle eyebrow="Zone" title="공간 분리" description="방 안에 베란다, 주방, 현관 같은 구역을 추가합니다." />
        <div className="grid grid-cols-2 gap-3">
          {SPACE_PRESETS.map((preset) => (
            <button
              key={preset.type}
              type="button"
              onClick={() => onAddZone(preset.type)}
              className="rounded-2xl border border-ink-200 bg-white px-3 py-4 text-left transition hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-md"
            >
              <div className="mb-3 h-10 rounded-xl border border-black/10" style={{ backgroundColor: preset.color }} />
              <p className="font-semibold text-ink-900">{preset.name}</p>
              <p className="mt-1 text-xs text-ink-500">
                {preset.width}×{preset.height}cm
              </p>
              <p className="mt-2 text-xs text-ink-400">{preset.hint}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle eyebrow="Window" title="창문 위치 설정" description="벽 방향별 창문을 추가하고 위치와 길이를 조정합니다." />
        <div className="grid grid-cols-2 gap-3">
          {WINDOW_PRESETS.map((preset) => (
            <button
              key={preset.side}
              type="button"
              onClick={() => onAddWindow(preset.side)}
              className="rounded-2xl border border-ink-200 bg-white px-3 py-4 text-left transition hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-md"
            >
              <div className="mb-3 h-3 rounded-full bg-[#69a7bf]" />
              <p className="font-semibold text-ink-900">{preset.name}</p>
              <p className="mt-1 text-xs text-ink-500">길이 {preset.length}cm</p>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
};
