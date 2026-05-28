import { createFurnitureItem } from "./furniture";
import { createSpaceZone, createWindowOpening } from "./spaces";
import type { Template } from "../types";

export const ROOM_TEMPLATES: Template[] = [
  {
    id: "studio-5",
    name: "5평 원룸",
    description: "참고 스케치처럼 고정 공간과 생활 동선을 함께 보는 기본형입니다.",
    room: { width: 330, height: 500, unit: "cm" },
    starterZones: [
      createSpaceZone("custom", { x: 0, y: 0, width: 108, height: 70, name: "보일러실", color: "#a8a7a2" }),
      createSpaceZone("kitchen", { x: 145, y: 340, width: 55, height: 160, name: "주방", color: "#b8b8b5" }),
      createSpaceZone("bathroom", { x: 200, y: 340, width: 130, height: 160, name: "화장실" }),
      createSpaceZone("entry", { x: 0, y: 455, width: 120, height: 45, name: "현관/신발장", color: "#a8a7a2" }),
    ],
    starterWindows: [
      createWindowOpening("top", { offset: 120, length: 100, name: "상단 창문" }),
      createWindowOpening("left", { offset: 120, length: 72, name: "측면 창문" }),
    ],
    starterFurniture: [
      createFurnitureItem("custom", { x: 118, y: 6, width: 58, height: 42, name: "짐", color: "#f0b43c" }),
      createFurnitureItem("washer", { x: 256, y: 12, width: 62, height: 62, name: "세탁기" }),
      createFurnitureItem("custom", { x: 6, y: 82, width: 55, height: 34, name: "LP", color: "#f0b43c" }),
      createFurnitureItem("sofa", { x: 65, y: 82, width: 55, height: 34, name: "소파" }),
      createFurnitureItem("custom", { x: 218, y: 82, width: 50, height: 34, name: "화장품", color: "#f0b43c" }),
      createFurnitureItem("bed", { x: 10, y: 130, width: 110, height: 170 }),
      createFurnitureItem("desk", { x: 266, y: 126, width: 52, height: 92, rotation: 90 }),
      createFurnitureItem("custom", { x: 152, y: 216, width: 70, height: 110, name: "식탁", color: "#f0b43c" }),
      createFurnitureItem("custom", { x: 266, y: 226, width: 52, height: 64, name: "옷수납", color: "#f0b43c" }),
      createFurnitureItem("custom", { x: 266, y: 306, width: 52, height: 86, name: "행거", color: "#f0b43c" }),
      createFurnitureItem("custom", { x: 6, y: 360, width: 40, height: 42, name: "거울", color: "#f0b43c" }),
      createFurnitureItem("storage", { x: 6, y: 408, width: 40, height: 68, name: "수납" }),
      createFurnitureItem("storage", { x: 106, y: 392, width: 38, height: 66, name: "수납" }),
      createFurnitureItem("fridge", { x: 160, y: 338, width: 50, height: 62, name: "냉장고" }),
    ],
  },
  {
    id: "studio-6",
    name: "6평 원룸",
    description: "침대와 책상을 분리하기 쉬운 여유 있는 직사각형 구조입니다.",
    room: { width: 360, height: 540, unit: "cm" },
    starterZones: [
      createSpaceZone("veranda", { x: 0, y: 0, width: 360, height: 72, name: "창가 베란다" }),
      createSpaceZone("kitchen", { x: 230, y: 390, width: 130, height: 150, name: "주방" }),
    ],
    starterWindows: [createWindowOpening("top", { offset: 72, length: 140, name: "큰 창문" })],
    starterFurniture: [
      createFurnitureItem("bed", { x: 24, y: 132 }),
      createFurnitureItem("desk", { x: 252, y: 150 }),
      createFurnitureItem("sofa", { x: 160, y: 40 }),
      createFurnitureItem("wardrobe", { x: 250, y: 20 }),
    ],
  },
  {
    id: "officetel-8",
    name: "8평 오피스텔",
    description: "소파와 식탁까지 넣어보는 다목적 배치 연습용입니다.",
    room: { width: 420, height: 620, unit: "cm" },
    starterZones: [
      createSpaceZone("veranda", { x: 0, y: 0, width: 420, height: 80, name: "베란다" }),
      createSpaceZone("bathroom", { x: 290, y: 440, width: 130, height: 180, name: "욕실" }),
      createSpaceZone("kitchen", { x: 180, y: 455, width: 110, height: 165, name: "주방" }),
    ],
    starterWindows: [
      createWindowOpening("top", { offset: 96, length: 160, name: "전면 창문" }),
      createWindowOpening("right", { offset: 110, length: 120, name: "측면 창문" }),
    ],
    starterFurniture: [
      createFurnitureItem("bed", { x: 26, y: 160 }),
      createFurnitureItem("table", { x: 180, y: 240 }),
      createFurnitureItem("sofa", { x: 160, y: 70 }),
      createFurnitureItem("tvStand", { x: 250, y: 510, width: 40, height: 140, rotation: 90 }),
    ],
  },
  {
    id: "rectangle",
    name: "직사각형 방",
    description: "가장 보편적인 장방형 방 구조입니다.",
    room: { width: 300, height: 400, unit: "cm" },
  },
  {
    id: "square",
    name: "정사각형 방",
    description: "벽면 활용이 중요한 정사각형 구조입니다.",
    room: { width: 360, height: 360, unit: "cm" },
  },
  {
    id: "long",
    name: "긴 방 구조",
    description: "동선이 길게 이어지는 좁고 긴 방입니다.",
    room: { width: 260, height: 520, unit: "cm" },
  },
];
