import type { Reason } from "../../src/types";

export const reasons: Record<Reason, string> = {
  UNDERCUT: "Дешевле конкурента",
  AT_MIN: "Минимальная цена",
  AT_MAX: "Максимальная цена",
  NO_COMPETITORS: "Нет доступных конкурентов",
};

/** 389990 → "389 990 ₸" */
export const money = (value: number) => new Intl.NumberFormat("ru-RU").format(value) + " ₸";
