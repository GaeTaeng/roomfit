import type { FurnitureType } from "../types";

interface FurnitureShapeProps {
  type: FurnitureType;
  name: string;
  compact?: boolean;
}

type VisualType =
  | FurnitureType
  | "mirror"
  | "hanger"
  | "box"
  | "lp"
  | "cosmetics";

const lineClass = "rounded-full bg-black/10";

const resolveVisualType = (type: FurnitureType, name: string): VisualType => {
  if (type !== "custom") {
    return type;
  }

  const normalized = name.replace(/\s+/g, "").toLowerCase();

  if (normalized.includes("tv") || normalized.includes("티비")) {
    return "tv";
  }

  if (normalized.includes("냉장고")) {
    return "fridge";
  }

  if (normalized.includes("식세기") || normalized.includes("식기세척기")) {
    return "dishwasher";
  }

  if (normalized.includes("세탁기")) {
    return "washer";
  }

  if (normalized.includes("로청기") || normalized.includes("로봇청소기")) {
    return "robotVacuum";
  }

  if (normalized.includes("식탁") || normalized.includes("테이블")) {
    return "table";
  }

  if (normalized.includes("책상")) {
    return "desk";
  }

  if (normalized.includes("의자")) {
    return "chair";
  }

  if (normalized.includes("소파")) {
    return "sofa";
  }

  if (normalized.includes("옷장")) {
    return "wardrobe";
  }

  if (normalized.includes("행거")) {
    return "hanger";
  }

  if (normalized.includes("서랍")) {
    return "dresser";
  }

  if (normalized.includes("수납")) {
    return "storage";
  }

  if (normalized.includes("거울")) {
    return "mirror";
  }

  if (normalized.includes("짐")) {
    return "box";
  }

  if (normalized.includes("lp")) {
    return "lp";
  }

  if (normalized.includes("화장품")) {
    return "cosmetics";
  }

  return "custom";
};

export const FurnitureShape = ({ type, name, compact = false }: FurnitureShapeProps) => {
  const visualType = resolveVisualType(type, name);
  const labelClass = compact ? "text-[11px]" : "text-sm";
  const label = (
    <span className={`relative z-10 px-2 text-center font-semibold leading-tight text-ink-900 ${labelClass}`}>{name}</span>
  );
  const frameClass = "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] border border-black/10";

  if (visualType === "bed") {
    return (
      <div className={frameClass}>
        <div className="absolute left-[14%] top-[8%] h-[18%] w-[72%] rounded-[10px] bg-white/55" />
        <div className="absolute left-[14%] top-[32%] h-[8%] w-[72%] rounded-full bg-black/10" />
        {label}
      </div>
    );
  }

  if (visualType === "sofa") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-x-[10%] top-[10%] h-[20%] rounded-[10px] bg-black/12" />
        <div className="absolute inset-x-[12%] bottom-[14%] h-[16%] rounded-full bg-black/10" />
        {label}
      </div>
    );
  }

  if (visualType === "desk") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-x-[10%] top-[14%] h-[14%] rounded-full bg-black/12" />
        <div className={`absolute bottom-[14%] left-[18%] h-[22%] w-[8%] ${lineClass}`} />
        <div className={`absolute bottom-[14%] right-[18%] h-[22%] w-[8%] ${lineClass}`} />
        {label}
      </div>
    );
  }

  if (visualType === "table") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-x-[14%] top-[12%] bottom-[20%] rounded-[18px] border border-black/10 bg-white/18" />
        <div className={`absolute bottom-[12%] left-[22%] h-[14%] w-[8%] ${lineClass}`} />
        <div className={`absolute bottom-[12%] right-[22%] h-[14%] w-[8%] ${lineClass}`} />
        {label}
      </div>
    );
  }

  if (visualType === "chair") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-x-[24%] top-[16%] h-[20%] rounded-[10px] bg-black/12" />
        <div className="absolute left-[28%] top-[40%] h-[10%] w-[44%] rounded-full bg-black/10" />
        <div className={`absolute bottom-[15%] left-[26%] h-[22%] w-[7%] ${lineClass}`} />
        <div className={`absolute bottom-[15%] right-[26%] h-[22%] w-[7%] ${lineClass}`} />
        {label}
      </div>
    );
  }

  if (visualType === "wardrobe" || visualType === "storage" || visualType === "dresser") {
    return (
      <div className={frameClass}>
        <div className="absolute bottom-[14%] left-1/2 top-[10%] w-px -translate-x-1/2 bg-black/12" />
        <div className="absolute left-[44%] top-[36%] h-[10%] w-[3%] rounded-full bg-black/12" />
        <div className="absolute right-[44%] top-[36%] h-[10%] w-[3%] rounded-full bg-black/12" />
        {visualType === "dresser" ? (
          <>
            <div className="absolute inset-x-[14%] top-[28%] h-px bg-black/10" />
            <div className="absolute inset-x-[14%] top-[52%] h-px bg-black/10" />
          </>
        ) : null}
        {label}
      </div>
    );
  }

  if (visualType === "tvStand") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-x-[16%] top-[14%] h-[26%] rounded-[12px] border border-black/12 bg-black/16" />
        <div className="absolute inset-x-[10%] bottom-[14%] top-[48%] rounded-[14px] border border-black/10 bg-white/18" />
        <div className="absolute bottom-[22%] left-[28%] h-[10%] w-[4%] rounded-full bg-black/10" />
        <div className="absolute bottom-[22%] right-[28%] h-[10%] w-[4%] rounded-full bg-black/10" />
        {label}
      </div>
    );
  }

  if (visualType === "tv") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-x-[10%] top-[16%] h-[42%] rounded-[12px] border border-black/10 bg-slate-900/20" />
        <div className="absolute left-1/2 top-[60%] h-[8%] w-[12%] -translate-x-1/2 rounded-full bg-black/14" />
        <div className="absolute bottom-[16%] left-1/2 h-[7%] w-[40%] -translate-x-1/2 rounded-full bg-black/12" />
        {label}
      </div>
    );
  }

  if (visualType === "fridge") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-x-[14%] top-[10%] h-[26%] rounded-[12px] bg-white/35" />
        <div className="absolute inset-x-[14%] bottom-[12%] top-[40%] rounded-[12px] border border-black/10 bg-white/18" />
        <div className="absolute right-[24%] top-[22%] h-[10%] w-[3%] rounded-full bg-black/12" />
        <div className="absolute right-[24%] top-[56%] h-[16%] w-[3%] rounded-full bg-black/12" />
        {label}
      </div>
    );
  }

  if (visualType === "washer") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-x-[14%] top-[14%] h-[18%] rounded-[10px] bg-white/38" />
        <div className="absolute left-1/2 top-[38%] h-[40%] w-[40%] -translate-x-1/2 rounded-full border-[5px] border-black/12 bg-white/25" />
        <div className="absolute left-1/2 top-[48%] h-[20%] w-[20%] -translate-x-1/2 rounded-full bg-black/8" />
        {label}
      </div>
    );
  }

  if (visualType === "dishwasher") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-x-[14%] top-[12%] h-[14%] rounded-full bg-white/42" />
        <div className="absolute inset-x-[16%] bottom-[16%] top-[32%] rounded-[14px] border border-black/10 bg-white/18" />
        <div className="absolute left-[26%] top-[48%] h-[10%] w-[48%] rounded-full border border-black/10 bg-white/28" />
        <div className="absolute left-[26%] top-[62%] h-[10%] w-[48%] rounded-full border border-black/10 bg-white/22" />
        {label}
      </div>
    );
  }

  if (visualType === "robotVacuum") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-black/10">
        <div className="absolute inset-[18%] rounded-full border-[5px] border-black/12 bg-white/25" />
        <div className="absolute left-[34%] top-[24%] h-[10%] w-[32%] rounded-full bg-black/12" />
        <div className="absolute inset-[34%] rounded-full bg-black/8" />
        {label}
      </div>
    );
  }

  if (visualType === "mirror") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-[12%] rounded-[16px] border border-black/12 bg-white/48 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.45)]" />
        <div className="absolute left-[24%] top-[24%] h-[42%] w-[16%] rotate-[-18deg] rounded-full bg-white/28" />
        {label}
      </div>
    );
  }

  if (visualType === "hanger") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-x-[18%] top-[18%] h-[7%] rounded-full bg-black/12" />
        <div className="absolute left-[24%] top-[30%] h-[22%] w-[14%] rounded-b-[12px] rounded-t-sm border border-black/12 bg-white/18" />
        <div className="absolute left-[43%] top-[30%] h-[22%] w-[14%] rounded-b-[12px] rounded-t-sm border border-black/12 bg-white/18" />
        <div className="absolute left-[62%] top-[30%] h-[22%] w-[14%] rounded-b-[12px] rounded-t-sm border border-black/12 bg-white/18" />
        {label}
      </div>
    );
  }

  if (visualType === "lp") {
    return (
      <div className={frameClass}>
        <div className="absolute inset-[18%] rounded-[12px] bg-black/10" />
        <div className="absolute inset-[28%] rounded-full bg-black/30" />
        <div className="absolute inset-[41%] rounded-full bg-white/58" />
        {label}
      </div>
    );
  }

  if (visualType === "box") {
    return (
      <div className={frameClass}>
        <div className="absolute left-[18%] top-[20%] h-[24%] w-[34%] rounded-[10px] border border-black/10 bg-white/18" />
        <div className="absolute right-[18%] top-[38%] h-[24%] w-[34%] rounded-[10px] border border-black/10 bg-white/18" />
        <div className="absolute left-[34%] top-[20%] h-px w-[8%] bg-black/10" />
        <div className="absolute right-[34%] top-[38%] h-px w-[8%] bg-black/10" />
        {label}
      </div>
    );
  }

  if (visualType === "cosmetics") {
    return (
      <div className={frameClass}>
        <div className="absolute left-[22%] top-[24%] h-[34%] w-[16%] rounded-[8px] bg-white/35" />
        <div className="absolute left-[42%] top-[18%] h-[40%] w-[16%] rounded-[10px] bg-white/48" />
        <div className="absolute left-[62%] top-[28%] h-[30%] w-[12%] rounded-[8px] bg-white/28" />
        <div className="absolute left-[46%] top-[14%] h-[6%] w-[8%] rounded-full bg-black/10" />
        {label}
      </div>
    );
  }

  return (
    <div className={frameClass}>
      <div className="absolute inset-[14%] rounded-[14px] border border-dashed border-black/12 bg-white/12" />
      {label}
    </div>
  );
};
