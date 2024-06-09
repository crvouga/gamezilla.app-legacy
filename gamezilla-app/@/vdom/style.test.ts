import { describe, expect, it } from "bun:test";
import { camelStringToKehabString, styles } from "./style";

describe(import.meta.file, () => {
    it("should convert kehab-case to camelCase", () => {
        const kehab = "transition-delay";
        const camel = "transitionDelay";
        expect(camelStringToKehabString(camel)).toBe(kehab);
    })
    it("should convert camelCase to kehab-case", () => {
        const kehab = "transition-delay";
        const camel = "transitionDelay";
        expect(camelStringToKehabString(camel)).toBe(kehab);
    })
	it("should convert kehab-case to camelCase when rendering with React", () => {
		expect(styles({ "transition-delay": "100ms" }, "react")).toEqual({
			transitionDelay: "100ms",
		});
    });
    
    it('should not convert kehab-case to camelCase when rendering with Inferno', () => {
        expect(styles({ "transition-delay": "100ms" }, "inferno")).toEqual({
            "transition-delay": "100ms"
        })
    })
});
