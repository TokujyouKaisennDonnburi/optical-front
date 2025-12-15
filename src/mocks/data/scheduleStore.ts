import { scheduleMock } from "./schedule";

export const scheduleStore = {
  calendars: [...scheduleMock.calendars],
  items: [...scheduleMock.items],
};
