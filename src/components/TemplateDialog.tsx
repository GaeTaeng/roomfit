import { LayoutTemplate, X } from "lucide-react";
import { ROOM_TEMPLATES } from "../constants/templates";
import type { Room } from "../types";
import { formatDimension } from "../utils/layout";
import { ModalShell } from "./ModalShell";

interface TemplateDialogProps {
  isOpen: boolean;
  selectedTemplateId: string | null;
  roomUnit: Room["unit"];
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplateDialog = ({
  isOpen,
  selectedTemplateId,
  roomUnit,
  onClose,
  onSelectTemplate,
}: TemplateDialogProps) => {
  if (!isOpen) {
    return null;
  }

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
    onClose();
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-4xl">
      <div>
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-white/10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Template</p>
            <h2 className="mt-1 text-lg font-semibold text-ink-900 dark:text-[#f4f0e7]">기본 템플릿</h2>
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

        <div className="max-h-[calc(100dvh-168px)] overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2">
            {ROOM_TEMPLATES.map((template) => {
              const selected = selectedTemplateId === template.id;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                    selected
                      ? "border-accent-500 bg-accent-50 dark:bg-[#3a2d16]"
                      : "border-ink-200 bg-white hover:border-ink-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-[#ebe4d6]">
                        <LayoutTemplate className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <p className="font-semibold text-ink-900 dark:text-[#f4f0e7]">{template.name}</p>
                      <p className="mt-1 text-sm text-ink-500 dark:text-[#b9b1a3]">{template.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-medium text-ink-500 dark:bg-white/10 dark:text-[#d3ccbe]">
                      {formatDimension(template.room.width, roomUnit)} × {formatDimension(template.room.height, roomUnit)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
