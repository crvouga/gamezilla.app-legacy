import { describe, expect, test } from "bun:test";
import { TimeSpan } from "./time-span";

describe(import.meta.file, () => {
	test("should return 'X year(s) ago' for year intervals", () => {
		expect(TimeSpan.humanFriendlyString(TimeSpan.days(365))).toBe(
			"1 year ago",
		);
		expect(TimeSpan.humanFriendlyString(TimeSpan.days(365 * 2))).toBe(
			"2 years ago",
		);
	});

	test("should return 'X month(s) ago' for month intervals", () => {
		expect(TimeSpan.humanFriendlyString(TimeSpan.days(32))).toBe(
			"1 month ago",
		);
		expect(TimeSpan.humanFriendlyString(TimeSpan.days(64))).toBe(
			"2 months ago",
		);
	});

	test("should return 'X day(s) ago' for day intervals", () => {
		expect(TimeSpan.humanFriendlyString(TimeSpan.days(1))).toBe(
			"1 day ago",
		);
		expect(TimeSpan.humanFriendlyString(TimeSpan.days(2))).toBe(
			"2 days ago",
		);
	});

	test("should return 'X hour(s) ago' for hour intervals", () => {
		expect(TimeSpan.humanFriendlyString(TimeSpan.hours(1))).toBe(
			"1 hour ago",
		);
		expect(TimeSpan.humanFriendlyString(TimeSpan.hours(2))).toBe(
			"2 hours ago",
		);
	});

	test("should return 'X minute(s) ago' for minute intervals", () => {
		expect(TimeSpan.humanFriendlyString(TimeSpan.minutes(1))).toBe(
			"1 minute ago",
		);
		expect(TimeSpan.humanFriendlyString(TimeSpan.minutes(2))).toBe(
			"2 minutes ago",
		);
	});

	test("should return 'A moment ago' for intervals less than a minute", () => {
		expect(TimeSpan.humanFriendlyString(TimeSpan.seconds(30))).toBe(
			"A moment ago",
		);
	});
});
