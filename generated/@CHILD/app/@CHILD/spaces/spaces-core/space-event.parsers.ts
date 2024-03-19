import typia from "typia";
import { SpaceEvent } from "./space-event";
export const check = (input: any): input is SpaceEvent => {
    const $io0 = (input: any): boolean => "user-started-space" === input.t && "string" === typeof input.userId && "string" === typeof input.spaceId;
    const $io1 = (input: any): boolean => "user-ended-space" === input.t && "string" === typeof input.userId && "string" === typeof input.spaceId;
    const $io2 = (input: any): boolean => "user-joined-space" === input.t && "string" === typeof input.userId && "string" === typeof input.spaceId;
    const $io3 = (input: any): boolean => "user-left-space" === input.t && "string" === typeof input.userId && "string" === typeof input.spaceId;
    const $io4 = (input: any): boolean => "user-inputted-game" === input.t && "string" === typeof input.userId && "string" === typeof input.spaceId && (null === input.game || "connect-four" === input.game || "flow" === input.game);
    const $io5 = (input: any): boolean => "game" === input.t && "string" === typeof input.spaceId && ("object" === typeof input.c && null !== input.c && $iu0(input.c));
    const $io6 = (input: any): boolean => "connect-four" === input.t && ("object" === typeof input.c && null !== input.c && $iu1(input.c));
    const $io7 = (input: any): boolean => "user-changed-mode" === input.t && ("none" === input.mode || "vs-bot" === input.mode || "vs-user" === input.mode) && "string" === typeof input.userId;
    const $io8 = (input: any): boolean => "vs-bot" === input.t && ("object" === typeof input.c && null !== input.c && $iu2(input.c));
    const $io9 = (input: any): boolean => "user-dropped-disc" === input.t && (0 === input.columnIndex || 1 === input.columnIndex || 2 === input.columnIndex || 3 === input.columnIndex || 4 === input.columnIndex || 5 === input.columnIndex || 6 === input.columnIndex) && "string" === typeof input.userId;
    const $io10 = (input: any): boolean => "user-left" === input.t && "string" === typeof input.userId;
    const $io11 = (input: any): boolean => "bot-dropped-disc" === input.t && (0 === input.columnIndex || 1 === input.columnIndex || 2 === input.columnIndex || 3 === input.columnIndex || 4 === input.columnIndex || 5 === input.columnIndex || 6 === input.columnIndex);
    const $io12 = (input: any): boolean => "user-started-playing" === input.t && "string" === typeof input.userId && ("player-one" === input.playerType || "player-two" === input.playerType);
    const $io13 = (input: any): boolean => "user-stopped-playing" === input.t && "string" === typeof input.userId;
    const $io14 = (input: any): boolean => "user-started-game" === input.t && "string" === typeof input.userId;
    const $io15 = (input: any): boolean => "user-stopped-game" === input.t && "string" === typeof input.userId;
    const $io16 = (input: any): boolean => "user-swapped-sides" === input.t && "string" === typeof input.userId;
    const $io17 = (input: any): boolean => "user-changed-bot-level" === input.t && ("Easy" === input.botLevel || "Hard" === input.botLevel || "Medium" === input.botLevel) && "string" === typeof input.userId;
    const $io18 = (input: any): boolean => "time-passed" === input.t && "number" === typeof input.now;
    const $io19 = (input: any): boolean => "user-restarted-game" === input.t && "string" === typeof input.userId;
    const $io20 = (input: any): boolean => "vs-user" === input.t && ("object" === typeof input.c && null !== input.c && $iu3(input.c));
    const $io21 = (input: any): boolean => "user-stopped-playing" === input.t && "string" === typeof input.userId;
    const $io22 = (input: any): boolean => "user-started-playing" === input.t && "string" === typeof input.userId && ("player-one" === input.playerType || "player-two" === input.playerType);
    const $io23 = (input: any): boolean => "user-inputted-move-time-limit" === input.t && "string" === typeof input.userId && (5 === input.moveTimeLimit || 7 === input.moveTimeLimit || 9 === input.moveTimeLimit);
    const $io24 = (input: any): boolean => "user-dropped-disc" === input.t && (0 === input.columnIndex || 1 === input.columnIndex || 2 === input.columnIndex || 3 === input.columnIndex || 4 === input.columnIndex || 5 === input.columnIndex || 6 === input.columnIndex) && "string" === typeof input.userId;
    const $io25 = (input: any): boolean => "user-started-game" === input.t && "string" === typeof input.userId;
    const $io26 = (input: any): boolean => "user-stopped-game" === input.t && "string" === typeof input.userId;
    const $io27 = (input: any): boolean => "user-requested-rematch" === input.t && "string" === typeof input.userId;
    const $io28 = (input: any): boolean => "user-responded-to-rematch-request" === input.t && "string" === typeof input.userId && ("Accept" === input.response || "Decline" === input.response);
    const $io29 = (input: any): boolean => "user-cancelled-rematch" === input.t && "string" === typeof input.userId;
    const $io30 = (input: any): boolean => "user-resigned" === input.t && "string" === typeof input.userId;
    const $io31 = (input: any): boolean => "time-passed" === input.t && "number" === typeof input.currentTime;
    const $io32 = (input: any): boolean => "user-left" === input.t && "string" === typeof input.userId;
    const $io33 = (input: any): boolean => "flow" === input.t && ("object" === typeof input.c && null !== input.c && $iu4(input.c));
    const $io34 = (input: any): boolean => "user-changed-mode" === input.t && (null === input.mode || "create" === input.mode || "play" === input.mode) && "string" === typeof input.userId;
    const $io35 = (input: any): boolean => "play" === input.t && ("object" === typeof input.c && null !== input.c && $io36(input.c));
    const $io36 = (input: any): boolean => "grid" === input.t && ("object" === typeof input.c && null !== input.c && $iu5(input.c));
    const $io37 = (input: any): boolean => "pressed-down" === input.t && "string" === typeof input.nodeId;
    const $io38 = (input: any): boolean => "pressed-up" === input.t && "string" === typeof input.nodeId;
    const $io39 = (input: any): boolean => "dragged-over" === input.t && "string" === typeof input.nodeId;
    const $io40 = (input: any): boolean => "left" === input.t;
    const $io41 = (input: any): boolean => "create" === input.t && ("object" === typeof input.c && null !== input.c && $iu6(input.c));
    const $io42 = (input: any): boolean => "user-changed-list-tab" === input.t && ("packs" === input.listTab || "puzzles" === input.listTab);
    const $io43 = (input: any): boolean => "pack-builder.user-clicked-exit-button" === input.t && "string" === typeof input.userId;
    const $io44 = (input: any): boolean => "pack-builder.saved-pack" === input.t && ("object" === typeof input.saved && null !== input.saved && $iu7(input.saved));
    const $io45 = (input: any): boolean => "err" === input.t && "string" === typeof input.error;
    const $io46 = (input: any): boolean => "ok" === input.t && ("object" === typeof input.value && null !== input.value && $io47(input.value));
    const $io47 = (input: any): boolean => "string" === typeof input.id && "string" === typeof input.createdBy && "number" === typeof input.createdAt && "string" === typeof input.lastUpdatedBy && "number" === typeof input.lastUpdatedAt && "string" === typeof input.name && (Array.isArray(input.puzzleIds) && input.puzzleIds.every((elem: any) => "string" === typeof elem));
    const $io48 = (input: any): boolean => "pack-builder.user-clicked-open-add-puzzle-button" === input.t && "string" === typeof input.userId;
    const $io49 = (input: any): boolean => "pack-builder.user-closed-add-puzzle" === input.t;
    const $io50 = (input: any): boolean => "pack-builder.user-clicked-add-puzzle-item" === input.t && ("object" === typeof input.puzzle && null !== input.puzzle && $io51(input.puzzle)) && "string" === typeof input.userId;
    const $io51 = (input: any): boolean => "string" === typeof input.id && "string" === typeof input.name && "number" === typeof input.createdAt && "string" === typeof input.createdBy && "number" === typeof input.lastUpdatedAt && "string" === typeof input.lastUpdatedBy && ("object" === typeof input.flow && null !== input.flow && $iu8(input.flow));
    const $io52 = (input: any): boolean => true === input.Flow && ("object" === typeof input.nodes && null !== input.nodes && false === Array.isArray(input.nodes) && $io53(input.nodes)) && ("object" === typeof input.edges && null !== input.edges && false === Array.isArray(input.edges) && $io55(input.edges)) && ("string" === typeof input.edgeHash || "number" === typeof input.edgeHash) && ("object" === typeof input.terminalsByGroupId && null !== input.terminalsByGroupId && false === Array.isArray(input.terminalsByGroupId) && $io57(input.terminalsByGroupId)) && ("object" === typeof input.pipesBySourceId && null !== input.pipesBySourceId && false === Array.isArray(input.pipesBySourceId) && $io59(input.pipesBySourceId)) && "flow-grid" === input.t && "number" === typeof input.width && "number" === typeof input.height && ("object" === typeof input.positions && null !== input.positions && false === Array.isArray(input.positions) && $io61(input.positions));
    const $io53 = (input: any): boolean => Object.keys(input).every((key: any) => {
        const value = input[key];
        if (undefined === value)
            return true;
        return "object" === typeof value && null !== value && "string" === typeof (value as any).nodeId;
    });
    const $io55 = (input: any): boolean => Object.keys(input).every((key: any) => {
        const value = input[key];
        if (undefined === value)
            return true;
        return "object" === typeof value && null !== value && ("string" === typeof (value as any).sourceId && "string" === typeof (value as any).targetId);
    });
    const $io57 = (input: any): boolean => (undefined === input.A || "object" === typeof input.A && null !== input.A && $io58(input.A)) && (undefined === input.D || "object" === typeof input.D && null !== input.D && $io58(input.D)) && (undefined === input.B || "object" === typeof input.B && null !== input.B && $io58(input.B)) && (undefined === input.C || "object" === typeof input.C && null !== input.C && $io58(input.C)) && (undefined === input.E || "object" === typeof input.E && null !== input.E && $io58(input.E)) && (undefined === input.F || "object" === typeof input.F && null !== input.F && $io58(input.F)) && (undefined === input.G || "object" === typeof input.G && null !== input.G && $io58(input.G)) && (undefined === input.H || "object" === typeof input.H && null !== input.H && $io58(input.H)) && (undefined === input.P || "object" === typeof input.P && null !== input.P && $io58(input.P)) && (undefined === input.N || "object" === typeof input.N && null !== input.N && $io58(input.N)) && (undefined === input.Q || "object" === typeof input.Q && null !== input.Q && $io58(input.Q)) && (undefined === input.K || "object" === typeof input.K && null !== input.K && $io58(input.K)) && (undefined === input.I || "object" === typeof input.I && null !== input.I && $io58(input.I)) && (undefined === input.J || "object" === typeof input.J && null !== input.J && $io58(input.J)) && (undefined === input.L || "object" === typeof input.L && null !== input.L && $io58(input.L)) && (undefined === input.M || "object" === typeof input.M && null !== input.M && $io58(input.M)) && (undefined === input.O || "object" === typeof input.O && null !== input.O && $io58(input.O));
    const $io58 = (input: any): boolean => ("A" === input.groupId || "B" === input.groupId || "C" === input.groupId || "D" === input.groupId || "E" === input.groupId || "F" === input.groupId || "G" === input.groupId || "H" === input.groupId || "I" === input.groupId || "J" === input.groupId || "K" === input.groupId || "L" === input.groupId || "M" === input.groupId || "N" === input.groupId || "O" === input.groupId || "P" === input.groupId || "Q" === input.groupId) && "string" === typeof input.startId && (null === input.endId || undefined === input.endId || "string" === typeof input.endId);
    const $io59 = (input: any): boolean => Object.keys(input).every((key: any) => {
        const value = input[key];
        if (undefined === value)
            return true;
        return "object" === typeof value && null !== value && $io60(value);
    });
    const $io60 = (input: any): boolean => ("A" === input.groupId || "B" === input.groupId || "C" === input.groupId || "D" === input.groupId || "E" === input.groupId || "F" === input.groupId || "G" === input.groupId || "H" === input.groupId || "I" === input.groupId || "J" === input.groupId || "K" === input.groupId || "L" === input.groupId || "M" === input.groupId || "N" === input.groupId || "O" === input.groupId || "P" === input.groupId || "Q" === input.groupId) && "string" === typeof input.edgeId;
    const $io61 = (input: any): boolean => Object.keys(input).every((key: any) => {
        const value = input[key];
        if (undefined === value)
            return true;
        return "object" === typeof value && null !== value && ("number" === typeof (value as any).x && "number" === typeof (value as any).y);
    });
    const $io63 = (input: any): boolean => true === input.Flow && ("object" === typeof input.nodes && null !== input.nodes && false === Array.isArray(input.nodes) && $io53(input.nodes)) && ("object" === typeof input.edges && null !== input.edges && false === Array.isArray(input.edges) && $io55(input.edges)) && ("string" === typeof input.edgeHash || "number" === typeof input.edgeHash) && ("object" === typeof input.terminalsByGroupId && null !== input.terminalsByGroupId && false === Array.isArray(input.terminalsByGroupId) && $io57(input.terminalsByGroupId)) && ("object" === typeof input.pipesBySourceId && null !== input.pipesBySourceId && false === Array.isArray(input.pipesBySourceId) && $io59(input.pipesBySourceId)) && "flow-hex" === input.t && "number" === typeof input.width && "number" === typeof input.height && "number" === typeof input.side && true === input.FlowHex && ("object" === typeof input.positions && null !== input.positions && false === Array.isArray(input.positions) && $io64(input.positions));
    const $io64 = (input: any): boolean => Object.keys(input).every((key: any) => {
        const value = input[key];
        if (undefined === value)
            return true;
        return "object" === typeof value && null !== value && ("number" === typeof (value as any).x && "number" === typeof (value as any).y && "number" === typeof (value as any).z);
    });
    const $io66 = (input: any): boolean => true === input.Flow && ("object" === typeof input.nodes && null !== input.nodes && false === Array.isArray(input.nodes) && $io53(input.nodes)) && ("object" === typeof input.edges && null !== input.edges && false === Array.isArray(input.edges) && $io55(input.edges)) && ("string" === typeof input.edgeHash || "number" === typeof input.edgeHash) && ("object" === typeof input.terminalsByGroupId && null !== input.terminalsByGroupId && false === Array.isArray(input.terminalsByGroupId) && $io57(input.terminalsByGroupId)) && ("object" === typeof input.pipesBySourceId && null !== input.pipesBySourceId && false === Array.isArray(input.pipesBySourceId) && $io59(input.pipesBySourceId)) && "flow-tri" === input.t && "number" === typeof input.side && true === input.FlowTri;
    const $io67 = (input: any): boolean => "pack-builder.user-clicked-pack-item" === input.t && ("object" === typeof input.puzzle && null !== input.puzzle && $io51(input.puzzle)) && "number" === typeof input.index;
    const $io68 = (input: any): boolean => "pack-builder.flow-play-ui" === input.t && ("object" === typeof input.c && null !== input.c && $iu5(input.c));
    const $io69 = (input: any): boolean => "pack-builder.user-clicked-exit-puzzle-button" === input.t && "string" === typeof input.userId;
    const $io70 = (input: any): boolean => "pack-builder.user-clicked-next-puzzle-button" === input.t && "string" === typeof input.userId && ("object" === typeof input.nextPuzzle && null !== input.nextPuzzle && $io51(input.nextPuzzle));
    const $io71 = (input: any): boolean => "pack-builder.user-clicked-previous-puzzle-button" === input.t && "string" === typeof input.userId && ("object" === typeof input.previousPuzzle && null !== input.previousPuzzle && $io51(input.previousPuzzle));
    const $io72 = (input: any): boolean => "pack-builder.puzzle-screen.user-clicked-more-button" === input.t && "string" === typeof input.userId;
    const $io73 = (input: any): boolean => "pack-builder.puzzle-screen.user-closed-more-drawer" === input.t && "string" === typeof input.userId;
    const $io74 = (input: any): boolean => "user-created-pack" === input.t && ("object" === typeof input.created && null !== input.created && $iu7(input.created)) && "string" === typeof input.userId;
    const $io75 = (input: any): boolean => "pack-list.user-clicked-pack-item" === input.t && ("object" === typeof input.pack && null !== input.pack && $io47(input.pack));
    const $io76 = (input: any): boolean => "remove-puzzle.user-clicked-remove-puzzle-button" === input.t && "string" === typeof input.userId && "string" === typeof input.puzzleId;
    const $io77 = (input: any): boolean => "remove-puzzle.user-removed-puzzle-from-pack" === input.t && ("object" === typeof input.result && null !== input.result && $iu9(input.result)) && "string" === typeof input.puzzleId && "string" === typeof input.userId && "number" === typeof input.now;
    const $io78 = (input: any): boolean => "ok" === input.t && (undefined !== input.value && null === input.value);
    const $io79 = (input: any): boolean => "puzzle-builder.flow-ui-play" === input.t && ("object" === typeof input.c && null !== input.c && $iu5(input.c));
    const $io80 = (input: any): boolean => "puzzle-builder.flow-ui-edit" === input.t && ("object" === typeof input.c && null !== input.c && $iu10(input.c));
    const $io81 = (input: any): boolean => "dragged-over" === input.t && "string" === typeof input.nodeId;
    const $io82 = (input: any): boolean => "pressed-up-node" === input.t && "string" === typeof input.nodeId;
    const $io83 = (input: any): boolean => "pressed-down-node" === input.t && "string" === typeof input.nodeId;
    const $io84 = (input: any): boolean => "clicked-clear" === input.t;
    const $io85 = (input: any): boolean => "clicked-undo" === input.t;
    const $io86 = (input: any): boolean => "clicked-redo" === input.t;
    const $io87 = (input: any): boolean => "dimensions-form.clicked-open" === input.t;
    const $io88 = (input: any): boolean => "dimensions-form.closed" === input.t;
    const $io89 = (input: any): boolean => "dimensions-form.clicked-cancel" === input.t;
    const $io90 = (input: any): boolean => "dimensions-form.clicked-save" === input.t;
    const $io91 = (input: any): boolean => "dimensions-form.inputted" === input.t && ("object" === typeof input.dimensions && null !== input.dimensions && $iu11(input.dimensions));
    const $io92 = (input: any): boolean => "flow-grid" === input.t && "number" === typeof input.width && "number" === typeof input.height;
    const $io93 = (input: any): boolean => "flow-hex" === input.t && "number" === typeof input.width && "number" === typeof input.height && "number" === typeof input.side;
    const $io94 = (input: any): boolean => "flow-tri" === input.t && "number" === typeof input.side;
    const $io95 = (input: any): boolean => "puzzle-builder.user-clicked-edit-mode-button" === input.t && "string" === typeof input.userId;
    const $io96 = (input: any): boolean => "puzzle-builder.user-clicked-play-mode-button" === input.t && "string" === typeof input.userId;
    const $io97 = (input: any): boolean => "puzzle-builder.user-clicked-exit-button" === input.t && "string" === typeof input.userId;
    const $io98 = (input: any): boolean => "user-created-puzzle" === input.t && ("object" === typeof input.created && null !== input.created && $iu12(input.created)) && "string" === typeof input.userId;
    const $io99 = (input: any): boolean => "ok" === input.t && ("object" === typeof input.value && null !== input.value && $io51(input.value));
    const $io100 = (input: any): boolean => "user-deleted-puzzle" === input.t && ("object" === typeof input.deleted && null !== input.deleted && $iu9(input.deleted)) && "string" === typeof input.flowPuzzleId && "string" === typeof input.userId;
    const $io101 = (input: any): boolean => "user-edited-puzzle-name" === input.t && ("object" === typeof input.edited && null !== input.edited && $iu9(input.edited)) && "string" === typeof input.flowPuzzleId && "string" === typeof input.newName && "string" === typeof input.userId;
    const $io102 = (input: any): boolean => "puzzle-list.clicked-puzzle-list-item" === input.t && ("object" === typeof input.puzzle && null !== input.puzzle && $io51(input.puzzle));
    const $io103 = (input: any): boolean => "puzzle-builder.saved-puzzle" === input.t && ("object" === typeof input.saved && null !== input.saved && $iu12(input.saved)) && "string" === typeof input.userId;
    const $iu0 = (input: any): any => (() => {
        if ("flow" === input.t)
            return $io33(input);
        else if ("connect-four" === input.t)
            return $io6(input);
        else
            return false;
    })();
    const $iu1 = (input: any): any => (() => {
        if ("user-changed-mode" === input.t)
            return $io7(input);
        else if ("vs-user" === input.t)
            return $io20(input);
        else if ("vs-bot" === input.t)
            return $io8(input);
        else
            return false;
    })();
    const $iu2 = (input: any): any => (() => {
        if ("user-dropped-disc" === input.t)
            return $io9(input);
        else if ("user-left" === input.t)
            return $io10(input);
        else if ("bot-dropped-disc" === input.t)
            return $io11(input);
        else if ("user-started-playing" === input.t)
            return $io12(input);
        else if ("user-restarted-game" === input.t)
            return $io19(input);
        else if ("user-swapped-sides" === input.t)
            return $io16(input);
        else if ("user-stopped-game" === input.t)
            return $io15(input);
        else if ("user-started-game" === input.t)
            return $io14(input);
        else if ("user-stopped-playing" === input.t)
            return $io13(input);
        else if ("user-changed-bot-level" === input.t)
            return $io17(input);
        else if ("time-passed" === input.t)
            return $io18(input);
        else
            return false;
    })();
    const $iu3 = (input: any): any => (() => {
        if ("user-stopped-playing" === input.t)
            return $io21(input);
        else if ("user-started-playing" === input.t)
            return $io22(input);
        else if ("user-inputted-move-time-limit" === input.t)
            return $io23(input);
        else if ("user-dropped-disc" === input.t)
            return $io24(input);
        else if ("user-left" === input.t)
            return $io32(input);
        else if ("user-resigned" === input.t)
            return $io30(input);
        else if ("user-cancelled-rematch" === input.t)
            return $io29(input);
        else if ("user-requested-rematch" === input.t)
            return $io27(input);
        else if ("user-stopped-game" === input.t)
            return $io26(input);
        else if ("user-started-game" === input.t)
            return $io25(input);
        else if ("user-responded-to-rematch-request" === input.t)
            return $io28(input);
        else if ("time-passed" === input.t)
            return $io31(input);
        else
            return false;
    })();
    const $iu4 = (input: any): any => (() => {
        if ("user-changed-mode" === input.t)
            return $io34(input);
        else if ("create" === input.t)
            return $io41(input);
        else if ("play" === input.t)
            return $io35(input);
        else
            return false;
    })();
    const $iu5 = (input: any): any => (() => {
        if ("dragged-over" === input.t)
            return $io39(input);
        else if ("pressed-up" === input.t)
            return $io38(input);
        else if ("pressed-down" === input.t)
            return $io37(input);
        else if ("left" === input.t)
            return $io40(input);
        else
            return false;
    })();
    const $iu6 = (input: any): any => (() => {
        if ("user-changed-list-tab" === input.t)
            return $io42(input);
        else if ("pack-builder.user-clicked-exit-button" === input.t)
            return $io43(input);
        else if ("pack-builder.saved-pack" === input.t)
            return $io44(input);
        else if ("pack-builder.user-clicked-open-add-puzzle-button" === input.t)
            return $io48(input);
        else if ("pack-builder.user-closed-add-puzzle" === input.t)
            return $io49(input);
        else if ("pack-builder.user-clicked-add-puzzle-item" === input.t)
            return $io50(input);
        else if ("pack-builder.user-clicked-pack-item" === input.t)
            return $io67(input);
        else if ("pack-builder.flow-play-ui" === input.t)
            return $io68(input);
        else if ("pack-builder.user-clicked-exit-puzzle-button" === input.t)
            return $io69(input);
        else if ("pack-builder.user-clicked-next-puzzle-button" === input.t)
            return $io70(input);
        else if ("pack-builder.user-clicked-previous-puzzle-button" === input.t)
            return $io71(input);
        else if ("pack-builder.puzzle-screen.user-closed-more-drawer" === input.t)
            return $io73(input);
        else if ("pack-builder.puzzle-screen.user-clicked-more-button" === input.t)
            return $io72(input);
        else if ("user-created-pack" === input.t)
            return $io74(input);
        else if ("pack-list.user-clicked-pack-item" === input.t)
            return $io75(input);
        else if ("remove-puzzle.user-clicked-remove-puzzle-button" === input.t)
            return $io76(input);
        else if ("remove-puzzle.user-removed-puzzle-from-pack" === input.t)
            return $io77(input);
        else if ("puzzle-builder.flow-ui-edit" === input.t)
            return $io80(input);
        else if ("puzzle-builder.flow-ui-play" === input.t)
            return $io79(input);
        else if ("puzzle-builder.user-clicked-exit-button" === input.t)
            return $io97(input);
        else if ("puzzle-builder.user-clicked-play-mode-button" === input.t)
            return $io96(input);
        else if ("puzzle-builder.user-clicked-edit-mode-button" === input.t)
            return $io95(input);
        else if ("user-created-puzzle" === input.t)
            return $io98(input);
        else if ("user-deleted-puzzle" === input.t)
            return $io100(input);
        else if ("user-edited-puzzle-name" === input.t)
            return $io101(input);
        else if ("puzzle-list.clicked-puzzle-list-item" === input.t)
            return $io102(input);
        else if ("puzzle-builder.saved-puzzle" === input.t)
            return $io103(input);
        else
            return false;
    })();
    const $iu7 = (input: any): any => (() => {
        if ("err" === input.t)
            return $io45(input);
        else if ("ok" === input.t)
            return $io46(input);
        else
            return false;
    })();
    const $iu8 = (input: any): any => (() => {
        if ("flow-grid" === input.t)
            return $io52(input);
        else if ("flow-hex" === input.t)
            return $io63(input);
        else if ("flow-tri" === input.t)
            return $io66(input);
        else
            return false;
    })();
    const $iu9 = (input: any): any => (() => {
        if ("ok" === input.t)
            return $io78(input);
        else if ("err" === input.t)
            return $io45(input);
        else
            return false;
    })();
    const $iu10 = (input: any): any => (() => {
        if ("pressed-down-node" === input.t)
            return $io83(input);
        else if ("pressed-up-node" === input.t)
            return $io82(input);
        else if ("dragged-over" === input.t)
            return $io81(input);
        else if ("dimensions-form.clicked-save" === input.t)
            return $io90(input);
        else if ("dimensions-form.clicked-cancel" === input.t)
            return $io89(input);
        else if ("dimensions-form.closed" === input.t)
            return $io88(input);
        else if ("dimensions-form.clicked-open" === input.t)
            return $io87(input);
        else if ("clicked-redo" === input.t)
            return $io86(input);
        else if ("clicked-undo" === input.t)
            return $io85(input);
        else if ("clicked-clear" === input.t)
            return $io84(input);
        else if ("dimensions-form.inputted" === input.t)
            return $io91(input);
        else
            return false;
    })();
    const $iu11 = (input: any): any => (() => {
        if ("flow-grid" === input.t)
            return $io92(input);
        else if ("flow-hex" === input.t)
            return $io93(input);
        else if ("flow-tri" === input.t)
            return $io94(input);
        else
            return false;
    })();
    const $iu12 = (input: any): any => (() => {
        if ("err" === input.t)
            return $io45(input);
        else if ("ok" === input.t)
            return $io99(input);
        else
            return false;
    })();
    const $iu13 = (input: any): any => (() => {
        if ("user-left-space" === input.t)
            return $io3(input);
        else if ("user-joined-space" === input.t)
            return $io2(input);
        else if ("user-ended-space" === input.t)
            return $io1(input);
        else if ("user-started-space" === input.t)
            return $io0(input);
        else if ("user-inputted-game" === input.t)
            return $io4(input);
        else if ("game" === input.t)
            return $io5(input);
        else
            return false;
    })();
    return "object" === typeof input && null !== input && $iu13(input);
};
