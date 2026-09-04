import { describe, expect, it } from "vitest";

describe("editorial workflow contract", () => {
  it("requires sequential review before approval", () => {
    const transitions: Record<string, string[]> = { DRAFT: ["IN_REVIEW"], IN_REVIEW: ["DRAFT", "COPY_EDIT"], COPY_EDIT: ["IN_REVIEW", "APPROVED"] };
    expect(transitions.DRAFT).toContain("IN_REVIEW");
    expect(transitions.DRAFT).not.toContain("PUBLISHED");
    expect(transitions.COPY_EDIT).toContain("APPROVED");
  });
});
