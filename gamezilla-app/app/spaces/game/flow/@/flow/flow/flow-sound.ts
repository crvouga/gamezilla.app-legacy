import type { GroupId } from "./flow";
import type * as Marimba from "./marimba";

export const groupIdToNote = (groupId: GroupId): Marimba.NoteWithOctave => {
	switch (groupId) {
		case "A": {
			return "C3";
		}
		case "B": {
			return "D3";
		}
		case "C": {
			return "E3";
		}
		case "D": {
			return "F3";
		}
		case "E": {
			return "G3";
		}
		case "F": {
			return "A3";
		}
		case "G": {
			return "B3";
		}
		case "H": {
			return "C4";
		}
		case "I": {
			return "D4";
		}
		case "J": {
			return "E4";
		}
		case "K": {
			return "F4";
		}
		case "L": {
			return "G4";
		}
		case "M": {
			return "A4";
		}
		case "N": {
			return "B4";
		}
		case "O": {
			return "C5";
		}
		case "P": {
			return "D5";
		}
		case "Q": {
			return "E5";
		}
	}
};
