import { vi } from "vitest";

const createMockStore = () => ({ subscribe: vi.fn() });

export const page = createMockStore();
export const navigating = createMockStore();
export const updated = createMockStore();
