import { describe, expect, it } from "vitest";
import { AppError, notFound, toAppError, validationError } from "@/lib/error";
import { runAction } from "@/lib/action";

describe("AppError envelope", () => {
  it("memetakan kode ke status HTTP yang tepat", () => {
    expect(new AppError("NOT_FOUND", "x").httpStatus).toBe(404);
    expect(new AppError("VALIDATION_ERROR", "x").httpStatus).toBe(422);
    expect(new AppError("RATE_LIMITED", "x").httpStatus).toBe(429);
  });

  it("tidak membocorkan cause ke client", () => {
    const err = notFound("Pesan aman", { sql: "SELECT * FROM secret" });
    const json = err.toJSON();
    expect(json.ok).toBe(false);
    expect(json.error.message).toBe("Pesan aman");
    expect(JSON.stringify(json)).not.toContain("SELECT");
  });

  it("error tak dikenal menjadi INTERNAL generik", () => {
    const appErr = toAppError(new Error("postgres connection refused"));
    expect(appErr.code).toBe("INTERNAL");
    expect(JSON.stringify(appErr.toJSON())).not.toContain("postgres");
  });

  it("runAction membungkus AppError tanpa melempar", async () => {
    const res = await runAction(
      async () => {
        throw validationError([{ field: "name", message: "Wajib diisi" }]);
      },
      { module: "test", action: "demo" },
    );
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("VALIDATION_ERROR");
      expect(res.error.details?.[0]?.field).toBe("name");
    }
  });
});
