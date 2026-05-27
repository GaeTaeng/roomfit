import type { LayoutSummary, Room } from "../types";
import { formatDimension } from "../utils/layout";

interface SummaryBarProps {
  room: Room;
  summary: LayoutSummary;
  furnitureCount: number;
  zoneCount: number;
  windowCount: number;
}

const formatArea = (value: number, unit: Room["unit"]) => {
  if (unit === "m") {
    return `${(value / 10000).toFixed(2)}㎡`;
  }

  return `${Math.round(value).toLocaleString("ko-KR")}㎠`;
};

export const SummaryBar = ({ room, summary, furnitureCount, zoneCount, windowCount }: SummaryBarProps) => (
  <section className="grid gap-4 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-paper backdrop-blur md:grid-cols-5">
    <article className="rounded-2xl bg-ink-50 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-400">Room</p>
      <p className="mt-2 text-lg font-semibold text-ink-900">
        {formatDimension(room.width, room.unit)} × {formatDimension(room.height, room.unit)}
      </p>
      <p className="mt-1 text-sm text-ink-500">총 면적 {formatArea(summary.totalArea, room.unit)}</p>
    </article>
    <article className="rounded-2xl bg-ink-50 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-400">Furniture</p>
      <p className="mt-2 text-lg font-semibold text-ink-900">{furnitureCount}개 배치</p>
      <p className="mt-1 text-sm text-ink-500">차지 면적 {formatArea(summary.occupiedArea, room.unit)}</p>
    </article>
    <article className="rounded-2xl bg-ink-50 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-400">Zones</p>
      <p className="mt-2 text-lg font-semibold text-ink-900">{zoneCount}개 공간</p>
      <p className="mt-1 text-sm text-ink-500">창문 {windowCount}개 설정</p>
    </article>
    <article className="rounded-2xl bg-ink-50 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-400">Usage</p>
      <p className="mt-2 text-lg font-semibold text-ink-900">{Math.round(summary.occupiedRatio * 100)}%</p>
      <p className="mt-1 text-sm text-ink-500">남은 공간 {Math.round(summary.availableRatio * 100)}%</p>
    </article>
    <article
      className={`rounded-2xl px-4 py-4 ${
        summary.statusTone === "danger" ? "bg-danger-100" : "bg-valid-100"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-400">Status</p>
      <p className="mt-2 text-lg font-semibold text-ink-900">{summary.statusTone === "danger" ? "주의 필요" : "배치 안정"}</p>
      <p className="mt-1 text-sm text-ink-600">{summary.statusMessage}</p>
    </article>
  </section>
);
