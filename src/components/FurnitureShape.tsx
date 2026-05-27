import type { FurnitureType } from "../types";

interface FurnitureShapeProps {
  type: FurnitureType;
  name: string;
}

const lineClass = "rounded-full bg-black/10";

export const FurnitureShape = ({ type, name }: FurnitureShapeProps) => {
  if (type === "bed") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] border border-black/10">
        <div className="absolute left-[14%] top-[8%] h-[18%] w-[72%] rounded-[10px] bg-white/55" />
        <div className="absolute left-[14%] top-[32%] h-[8%] w-[72%] rounded-full bg-black/10" />
        <span className="relative z-10 px-2 text-center text-sm font-semibold text-ink-900">{name}</span>
      </div>
    );
  }

  if (type === "sofa") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] border border-black/10">
        <div className="absolute inset-x-[10%] top-[10%] h-[20%] rounded-[10px] bg-black/12" />
        <div className="absolute inset-x-[12%] bottom-[14%] h-[16%] rounded-full bg-black/10" />
        <span className="relative z-10 px-2 text-center text-sm font-semibold text-ink-900">{name}</span>
      </div>
    );
  }

  if (type === "desk" || type === "table") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] border border-black/10">
        <div className="absolute inset-x-[8%] top-[12%] h-[8%] rounded-full bg-black/12" />
        <div className={`absolute bottom-[14%] left-[18%] h-[18%] w-[8%] ${lineClass}`} />
        <div className={`absolute bottom-[14%] right-[18%] h-[18%] w-[8%] ${lineClass}`} />
        <span className="relative z-10 px-2 text-center text-sm font-semibold text-ink-900">{name}</span>
      </div>
    );
  }

  if (type === "wardrobe" || type === "storage" || type === "dresser" || type === "tvStand") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] border border-black/10">
        <div className="absolute bottom-[14%] left-1/2 top-[10%] w-px -translate-x-1/2 bg-black/12" />
        <div className="absolute left-[44%] top-[36%] h-[10%] w-[3%] rounded-full bg-black/12" />
        <div className="absolute right-[44%] top-[36%] h-[10%] w-[3%] rounded-full bg-black/12" />
        <span className="relative z-10 px-2 text-center text-sm font-semibold text-ink-900">{name}</span>
      </div>
    );
  }

  if (type === "fridge" || type === "washer") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] border border-black/10">
        <div className="absolute inset-x-[14%] top-[16%] h-[28%] rounded-[12px] bg-white/35" />
        <div className="absolute inset-x-[18%] bottom-[14%] top-[52%] rounded-[12px] border border-black/10" />
        <span className="relative z-10 px-2 text-center text-sm font-semibold text-ink-900">{name}</span>
      </div>
    );
  }

  if (type === "chair") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] border border-black/10">
        <div className="absolute inset-x-[22%] top-[18%] h-[20%] rounded-[10px] bg-black/12" />
        <div className={`absolute bottom-[15%] left-[24%] h-[22%] w-[7%] ${lineClass}`} />
        <div className={`absolute bottom-[15%] right-[24%] h-[22%] w-[7%] ${lineClass}`} />
        <span className="relative z-10 px-2 text-center text-[13px] font-semibold text-ink-900">{name}</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-[18px] border border-black/10">
      <span className="px-2 text-center text-sm font-semibold text-ink-900">{name}</span>
    </div>
  );
};
