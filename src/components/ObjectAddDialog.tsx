import { useState, type ReactNode } from "react";
import { Armchair, Layers3, PanelTop, Plus, X } from "lucide-react";
import { FURNITURE_PRESETS } from "../constants/furniture";
import { SPACE_PRESETS, WINDOW_PRESETS } from "../constants/spaces";
import type { FurnitureType, SpaceType, WindowSide } from "../types";
import { FurnitureShape } from "./FurnitureShape";
import { ModalShell } from "./ModalShell";

type AddTab = "furniture" | "space" | "window";

interface ObjectAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFurniture: (type: FurnitureType) => void;
  onAddZone: (type: SpaceType) => void;
  onAddWindow: (side: WindowSide) => void;
}

const tabs: Array<{ id: AddTab; label: string; icon: typeof Armchair }> = [
  { id: "furniture", label: "가구", icon: Armchair },
  { id: "space", label: "공간", icon: Layers3 },
  { id: "window", label: "창문", icon: PanelTop },
];

export const ObjectAddDialog = ({
  isOpen,
  onClose,
  onAddFurniture,
  onAddZone,
  onAddWindow,
}: ObjectAddDialogProps) => {
  const [activeTab, setActiveTab] = useState<AddTab>("furniture");

  if (!isOpen) {
    return null;
  }

  const handleAddFurniture = (type: FurnitureType) => {
    onAddFurniture(type);
    onClose();
  };

  const handleAddZone = (type: SpaceType) => {
    onAddZone(type);
    onClose();
  };

  const handleAddWindow = (side: WindowSide) => {
    onAddWindow(side);
    onClose();
  };

  const getPreviewSize = (width: number, height: number) => ({
    width: Math.min(116, Math.max(40, width * 0.42)),
    height: Math.min(78, Math.max(30, height * 0.24)),
  });

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <div>
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-white/10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Add</p>
            <h2 className="mt-1 text-lg font-semibold text-ink-900 dark:text-[#f4f0e7]">오브젝트 추가</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-50 dark:border-white/10 dark:bg-white/5 dark:text-[#ebe4d6] dark:hover:bg-white/10"
            aria-label="닫기"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-ink-100 px-5 py-3 dark:border-white/10">
          <div className="grid grid-cols-1 gap-2 rounded-2xl bg-ink-100 p-1 dark:bg-white/10 sm:grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-white text-ink-900 shadow-sm dark:bg-[#f3e5c1] dark:text-[#1f1b14]"
                      : "text-ink-500 hover:text-ink-900 dark:text-[#cbc4b6] dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-h-[calc(100dvh-228px)] overflow-y-auto p-4 sm:p-5">
          {activeTab === "furniture" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FURNITURE_PRESETS.map((preset) => (
                <PresetButton
                  key={preset.type}
                  name={preset.name}
                  meta={`${preset.width}×${preset.height}cm`}
                  hint={preset.hint}
                  color={preset.color}
                  preview={
                    <div className="mb-4 flex h-24 items-center rounded-2xl bg-ink-50 px-3 dark:bg-white/5">
                      <div
                        className="overflow-hidden rounded-[20px] shadow-[0_10px_22px_rgba(39,35,28,0.12)]"
                        style={{
                          width: `${getPreviewSize(preset.width, preset.height).width}px`,
                          height: `${getPreviewSize(preset.width, preset.height).height}px`,
                          backgroundColor: preset.color,
                        }}
                      >
                        <FurnitureShape type={preset.type} name={preset.name} compact />
                      </div>
                    </div>
                  }
                  onClick={() => handleAddFurniture(preset.type)}
                />
              ))}
            </div>
          ) : null}

          {activeTab === "space" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SPACE_PRESETS.map((preset) => (
                <PresetButton
                  key={preset.type}
                  name={preset.name}
                  meta={`${preset.width}×${preset.height}cm`}
                  hint={preset.hint}
                  color={preset.color}
                  block
                  onClick={() => handleAddZone(preset.type)}
                />
              ))}
            </div>
          ) : null}

          {activeTab === "window" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {WINDOW_PRESETS.map((preset) => (
                <PresetButton
                  key={preset.side}
                  name={preset.name}
                  meta={`길이 ${preset.length}cm`}
                  hint="벽 기준 위치 조정"
                  color={preset.color}
                  onClick={() => handleAddWindow(preset.side)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </ModalShell>
  );
};

interface PresetButtonProps {
  name: string;
  meta: string;
  hint: string;
  color: string;
  block?: boolean;
  preview?: ReactNode;
  onClick: () => void;
}

const PresetButton = ({ name, meta, hint, color, block = false, preview, onClick }: PresetButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="group rounded-2xl border border-ink-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
  >
    {preview ?? (
      <div
        className={`mb-4 border border-black/10 ${block ? "h-10 rounded-xl" : "h-3 w-16 rounded-full"}`}
        style={{ backgroundColor: color }}
      />
    )}
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-ink-900 dark:text-[#f4f0e7]">{name}</p>
        <p className="mt-1 text-xs text-ink-500 dark:text-[#c3bcaf]">{meta}</p>
        <p className="mt-2 text-xs text-ink-400 dark:text-[#9e9789]">{hint}</p>
      </div>
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600 transition group-hover:bg-ink-900 group-hover:text-white dark:bg-white/10 dark:text-[#e7dfcf] dark:group-hover:bg-[#f3e5c1] dark:group-hover:text-[#1f1b14]">
        <Plus className="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
  </button>
);
