import { createFurnitureItem } from "./furniture";
import { createSpaceZone, createWindowOpening } from "./spaces";
import type { Template } from "../types";

export const ROOM_TEMPLATES: Template[] = [
  {
    id: "studio-5",
    name: "5평 원룸",
    description: "주방과 휴식 공간을 나눠보기 좋은 기본형입니다.",
    room: { width: 330, height: 500, unit: "cm" },
    starterZones: [
      createSpaceZone("veranda", { x: 0, y: 0, width: 330, height: 80, name: "베란다" }),
      createSpaceZone("kitchen", { x: 200, y: 360, width: 130, height: 140, name: "주방" }),
      createSpaceZone("entry", { x: 0, y: 400, width: 110, height: 100, name: "현관" }),
    ],
    starterWindows: [
      createWindowOpening("top", { offset: 48, length: 128, name: "베란다 창문" }),
      createWindowOpening("left", { offset: 135, length: 92, name: "측면 창문" }),
    ],
    starterFurniture: [
      createFurnitureItem("bed", { x: 20, y: 110 }),
      createFurnitureItem("desk", { x: 190, y: 105, height: 120, width: 60, rotation: 90 }),
      createFurnitureItem("fridge", { x: 220, y: 380 }),
      createFurnitureItem("storage", { x: 20, y: 370, width: 40, height: 120 }),
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
