import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { cn } from "./utils";

describe("cn utility - property tests", () => {
  it("should always return a string", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = cn(input);
        expect(typeof result).toBe("string");
      }),
    );
  });

  it("should be idempotent when called with same input", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        expect(cn(input)).toBe(cn(input));
      }),
    );
  });
});
