import * as Marimba from "./marimba";

export const nthConnectedTerminal = (n: number): string => {
	const clampedIndex = Math.min(
		Math.max(0, n),
		Marimba.NODES_WITH_OCTAVE.length - 1,
	);
	const note: Marimba.NoteWithOctave =
		Marimba.NODES_WITH_OCTAVE[clampedIndex] ?? "C3";
	const sound = Marimba.toSoundSrc(note);
	return sound;
};
