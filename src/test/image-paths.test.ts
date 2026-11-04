import { describe, expect, it } from "vitest";
import { thumbPath } from "@/lib/catalog-source";

describe("product photo thumbnails", () => {
  it("points grid photos at the SKU thumbs folder, leaving the original path intact", () => {
    expect(thumbPath("BR001/01.jpg")).toBe("BR001/thumbs/01.jpg");
  });
});
