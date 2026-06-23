import { ChevronsDown, ChevronsUp } from "lucide-react";
import type {
  EvaluatedFurniture,
  EvaluatedSpaceZone,
  EvaluatedWindowOpening,
  Selection,
  SpaceZone,
  WindowOpening,
  WindowSide,
} from "../types";
import { formatDimension } from "../utils/layout";
import { SectionTitle } from "./SectionTitle";

interface RightSidebarProps {
  selectedItem: Selection | null;
  selectedFurniture: EvaluatedFurniture | null;
  selectedZone: EvaluatedSpaceZone | null;
  selectedWindow: EvaluatedWindowOpening | null;
  selectedLayer: { index: number; count: number } | null;
  roomUnit: "cm" | "m";
  onUpdateFurniture: (patch: Partial<EvaluatedFurniture>) => void;
  onUpdateZone: (patch: Partial<SpaceZone>) => void;
  onUpdateWindow: (patch: Partial<WindowOpening>) => void;
  onRotateFurniture: () => void;
  onBringSelectedToFront: () => void;
  onSendSelectedToBack: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
}

const windowSideLabels: Record<WindowSide, string> = {
  top: "상단",
  right: "오른쪽",
  bottom: "하단",
  left: "왼쪽",
};

export const RightSidebar = ({
  selectedItem,
  selectedFurniture,
  selectedZone,
  selectedWindow,
  selectedLayer,
  roomUnit,
  onUpdateFurniture,
  onUpdateZone,
  onUpdateWindow,
  onRotateFurniture,
  onBringSelectedToFront,
  onSendSelectedToBack,
  onDeleteSelected,
  onDuplicateSelected,
}: RightSidebarProps) => {
  const title =
    selectedItem?.type === "space" ? "선택한 공간" : selectedItem?.type === "window" ? "선택한 창문" : "선택한 가구";

  return (
    <aside className="space-y-5 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-paper backdrop-blur transition-colors duration-300 dark:border-white/10 dark:bg-[#191815] dark:shadow-none xl:h-fit xl:self-start xl:sticky xl:top-5 xl:max-h-[calc(100dvh-40px)] xl:overflow-y-auto">
      <SectionTitle
        eyebrow="Inspector"
        title={title}
        description={
          selectedItem
            ? "선택한 요소의 이름, 크기, 위치를 조정합니다."
            : "캔버스에서 가구, 공간, 창문을 선택하면 상세 설정이 표시됩니다."
        }
      />

      {selectedFurniture ? (
        <div className="space-y-5">
          <div
            className={`rounded-3xl border px-4 py-4 ${
              selectedFurniture.isOutOfBounds || selectedFurniture.isOverlapping
                ? "border-danger-500 bg-danger-100 dark:bg-[#3a1d1d]"
                : "border-valid-500 bg-valid-100 dark:bg-[#163024]"
            }`}
          >
            <p className="text-sm font-semibold text-ink-900 dark:text-[#f4f0e7]">{selectedFurniture.name}</p>
            <p className="mt-1 text-sm text-ink-500 dark:text-[#c6bfaf]">
              {selectedFurniture.isOutOfBounds
                ? "방 바깥으로 벗어났습니다."
                : selectedFurniture.isOverlapping
                  ? "다른 가구와 겹쳐 있습니다."
                  : "현재 상태는 안정적입니다."}
            </p>
          </div>

          <label className="block rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <span className="text-xs font-medium text-ink-500 dark:text-[#b9b1a3]">가구 이름</span>
            <input
              value={selectedFurniture.name}
              onChange={(event) => onUpdateFurniture({ name: event.target.value })}
              className="mt-2 w-full bg-transparent text-lg font-semibold text-ink-900 outline-none dark:text-[#f4f0e7]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3">
              <span className="text-xs font-medium text-ink-500">가로</span>
              <input
                type="number"
                min="20"
                step="5"
                value={selectedFurniture.width}
                onChange={(event) => onUpdateFurniture({ width: Number(event.target.value) || 0 })}
                className="mt-2 w-full bg-transparent text-lg font-semibold text-ink-900 outline-none"
              />
            </label>
            <label className="rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3">
              <span className="text-xs font-medium text-ink-500">세로</span>
              <input
                type="number"
                min="20"
                step="5"
                value={selectedFurniture.height}
                onChange={(event) => onUpdateFurniture({ height: Number(event.target.value) || 0 })}
                className="mt-2 w-full bg-transparent text-lg font-semibold text-ink-900 outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="현재 위치" value={`x ${formatDimension(selectedFurniture.x, roomUnit)}`} subValue={`y ${formatDimension(selectedFurniture.y, roomUnit)}`} />
            <InfoBox label="회전 상태" value={`${selectedFurniture.rotation}°`} subValue="회전 시 가로/세로 값이 교체됩니다." />
          </div>

          <LayerControls
            selectedLayer={selectedLayer}
            onBringSelectedToFront={onBringSelectedToFront}
            onSendSelectedToBack={onSendSelectedToBack}
          />

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onRotateFurniture} className="rounded-2xl bg-ink-900 px-4 py-3 text-sm font-medium text-white dark:bg-[#f3e5c1] dark:text-[#1f1b14]">
              90° 회전
            </button>
            <button
              type="button"
              onClick={onDuplicateSelected}
              className="rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700 dark:border-white/10 dark:bg-white/5 dark:text-[#ebe4d6]"
            >
              복사
            </button>
          </div>

          <DeleteButton label="선택한 가구 삭제" onClick={onDeleteSelected} />
        </div>
      ) : null}

      {selectedZone ? (
        <div className="space-y-5">
          <div
            className={`rounded-3xl border px-4 py-4 ${
              selectedZone.isOutOfBounds ? "border-danger-500 bg-danger-100 dark:bg-[#3a1d1d]" : "border-valid-500 bg-valid-100 dark:bg-[#163024]"
            }`}
          >
            <p className="text-sm font-semibold text-ink-900 dark:text-[#f4f0e7]">{selectedZone.name}</p>
            <p className="mt-1 text-sm text-ink-500 dark:text-[#c6bfaf]">
              {selectedZone.isOutOfBounds ? "공간 경계가 전체 방을 벗어났습니다." : "전체 방 안에 배치되어 있습니다."}
            </p>
          </div>

          <label className="block rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <span className="text-xs font-medium text-ink-500 dark:text-[#b9b1a3]">공간 이름</span>
            <input
              value={selectedZone.name}
              onChange={(event) => onUpdateZone({ name: event.target.value })}
              className="mt-2 w-full bg-transparent text-lg font-semibold text-ink-900 outline-none dark:text-[#f4f0e7]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <NumberField label="가로" value={selectedZone.width} onChange={(value) => onUpdateZone({ width: value })} />
            <NumberField label="세로" value={selectedZone.height} onChange={(value) => onUpdateZone({ height: value })} />
            <NumberField label="x 위치" value={selectedZone.x} onChange={(value) => onUpdateZone({ x: value })} />
            <NumberField label="y 위치" value={selectedZone.y} onChange={(value) => onUpdateZone({ y: value })} />
          </div>

          <LayerControls
            selectedLayer={selectedLayer}
            onBringSelectedToFront={onBringSelectedToFront}
            onSendSelectedToBack={onSendSelectedToBack}
          />

          <button
            type="button"
            onClick={onDuplicateSelected}
            className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700 dark:border-white/10 dark:bg-white/5 dark:text-[#ebe4d6]"
          >
            공간 복사
          </button>

          <DeleteButton label="선택한 공간 삭제" onClick={onDeleteSelected} />
        </div>
      ) : null}

      {selectedWindow ? (
        <div className="space-y-5">
          <div
            className={`rounded-3xl border px-4 py-4 ${
              selectedWindow.isOutOfBounds ? "border-danger-500 bg-danger-100 dark:bg-[#3a1d1d]" : "border-valid-500 bg-valid-100 dark:bg-[#163024]"
            }`}
          >
            <p className="text-sm font-semibold text-ink-900 dark:text-[#f4f0e7]">{selectedWindow.name}</p>
            <p className="mt-1 text-sm text-ink-500 dark:text-[#c6bfaf]">
              {selectedWindow.isOutOfBounds ? "창문이 선택한 벽 길이를 벗어났습니다." : "벽 안에 배치되어 있습니다."}
            </p>
          </div>

          <label className="block rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <span className="text-xs font-medium text-ink-500 dark:text-[#b9b1a3]">창문 이름</span>
            <input
              value={selectedWindow.name}
              onChange={(event) => onUpdateWindow({ name: event.target.value })}
              className="mt-2 w-full bg-transparent text-lg font-semibold text-ink-900 outline-none dark:text-[#f4f0e7]"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(windowSideLabels) as WindowSide[]).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => onUpdateWindow({ side })}
                className={`rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  selectedWindow.side === side
                    ? "bg-ink-900 text-white dark:bg-[#f3e5c1] dark:text-[#1f1b14]"
                    : "bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-[#d3ccbe]"
                }`}
              >
                {windowSideLabels[side]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField label="시작 위치" value={selectedWindow.offset} onChange={(value) => onUpdateWindow({ offset: value })} />
            <NumberField label="창문 길이" value={selectedWindow.length} onChange={(value) => onUpdateWindow({ length: value })} />
          </div>

          <LayerControls
            selectedLayer={selectedLayer}
            onBringSelectedToFront={onBringSelectedToFront}
            onSendSelectedToBack={onSendSelectedToBack}
          />

          <DeleteButton label="선택한 창문 삭제" onClick={onDeleteSelected} />
        </div>
      ) : null}

      {!selectedItem ? (
        <div className="rounded-3xl border border-dashed border-ink-200 bg-ink-50 px-4 py-8 text-sm text-ink-500 dark:border-white/10 dark:bg-white/5 dark:text-[#b9b1a3]">
          왼쪽 패널에서 요소를 추가한 뒤 중앙 캔버스에서 선택하세요.
        </div>
      ) : null}
    </aside>
  );
};

interface InfoBoxProps {
  label: string;
  value: string;
  subValue: string;
}

const InfoBox = ({ label, value, subValue }: InfoBoxProps) => (
  <div className="rounded-2xl border border-ink-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/5">
    <p className="text-xs font-medium text-ink-500 dark:text-[#b9b1a3]">{label}</p>
    <p className="mt-2 text-sm font-semibold text-ink-900 dark:text-[#f4f0e7]">{value}</p>
    <p className="mt-1 text-xs text-ink-500 dark:text-[#b9b1a3]">{subValue}</p>
  </div>
);

interface LayerControlsProps {
  selectedLayer: { index: number; count: number } | null;
  onBringSelectedToFront: () => void;
  onSendSelectedToBack: () => void;
}

const LayerControls = ({ selectedLayer, onBringSelectedToFront, onSendSelectedToBack }: LayerControlsProps) => {
  const canReorder = Boolean(selectedLayer && selectedLayer.count > 1);

  return (
    <div className="rounded-2xl border border-ink-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-ink-500 dark:text-[#b9b1a3]">레이어 순서</p>
          <p className="mt-2 text-sm font-semibold text-ink-900 dark:text-[#f4f0e7]">
            {selectedLayer ? `${selectedLayer.index} / ${selectedLayer.count}` : "-"}
          </p>
          <p className="mt-1 text-xs text-ink-500 dark:text-[#b9b1a3]">숫자가 클수록 같은 종류 안에서 앞에 보입니다.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onSendSelectedToBack}
          disabled={!canReorder}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm font-medium text-ink-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/8 dark:text-[#ebe4d6]"
        >
          <ChevronsDown className="h-4 w-4" aria-hidden="true" />
          맨뒤로
        </button>
        <button
          type="button"
          onClick={onBringSelectedToFront}
          disabled={!canReorder}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#f3e5c1] dark:text-[#1f1b14]"
        >
          <ChevronsUp className="h-4 w-4" aria-hidden="true" />
          맨앞으로
        </button>
      </div>
    </div>
  );
};

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const NumberField = ({ label, value, onChange }: NumberFieldProps) => (
  <label className="rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
    <span className="text-xs font-medium text-ink-500 dark:text-[#b9b1a3]">{label}</span>
    <input
      type="number"
      min="0"
      step="5"
      value={value}
      onChange={(event) => onChange(Number(event.target.value) || 0)}
      className="mt-2 w-full bg-transparent text-lg font-semibold text-ink-900 outline-none dark:text-[#f4f0e7]"
    />
  </label>
);

interface DeleteButtonProps {
  label: string;
  onClick: () => void;
}

const DeleteButton = ({ label, onClick }: DeleteButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-2xl border border-danger-500 bg-white px-4 py-3 text-sm font-medium text-danger-500 dark:bg-transparent dark:text-[#ffb0b0]"
  >
    {label}
  </button>
);
