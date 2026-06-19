import { Download, FolderOpen, RotateCcw, Save } from "lucide-react";
import type { LayoutSummary } from "../types";

interface HeaderProps {
  layoutName: string;
  onLayoutNameChange: (value: string) => void;
  onSave: () => void;
  onExportFile: () => void;
  onToggleLoadPanel: () => void;
  onReset: () => void;
  summary: LayoutSummary;
}

export const Header = ({
  layoutName,
  onLayoutNameChange,
  onSave,
  onExportFile,
  onToggleLoadPanel,
  onReset,
  summary,
}: HeaderProps) => (
  <header className="rounded-[30px] border border-white/70 bg-white/80 px-4 py-4 shadow-paper backdrop-blur sm:px-6 sm:py-5">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-3 rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-xs font-medium text-ink-500">
          <span className="h-2 w-2 rounded-full bg-accent-500" />
          RoomFit
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-ink-900 sm:text-3xl lg:text-[2.2rem]">
            내 방에 딱 맞는 가구 배치 시뮬레이터
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            방 크기를 입력하고, 가구를 드래그해서 배치한 뒤 저장해 두세요.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:min-w-[420px] xl:items-end">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
          <label className="flex w-full items-center gap-2 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 sm:min-w-[220px] sm:flex-1">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">Layout</span>
            <input
              value={layoutName}
              onChange={(event) => onLayoutNameChange(event.target.value)}
              className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300"
              placeholder="배치안 이름"
            />
          </label>

          <button
            type="button"
            onClick={onSave}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-ink-700 sm:w-auto"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            저장
          </button>
          <button
            type="button"
            onClick={onExportFile}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-50 sm:w-auto"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            파일 저장
          </button>
          <button
            type="button"
            onClick={onToggleLoadPanel}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-50 sm:w-auto"
          >
            <FolderOpen className="h-4 w-4" aria-hidden="true" />
            불러오기
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700 transition hover:border-danger-500 hover:text-danger-500 sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            초기화
          </button>
        </div>

        <div
          className={`w-full rounded-2xl px-4 py-3 text-sm font-medium xl:w-auto ${
            summary.statusTone === "danger" ? "bg-danger-100 text-danger-500" : "bg-valid-100 text-valid-500"
          }`}
        >
          {summary.statusMessage}
        </div>
      </div>
    </div>
  </header>
);
