import { Translations } from "gamezilla-app/@/l18n";

export type Text = {
	"flow.flow": string;
	"flow.play": string;
	"flow.builder": string;
	"flow.puzzle-completed": string;
	"flow.select-next-pack": string;
	"flow.next-puzzle": string;
	"flow.level": (level: number) => string;
};

export const translations: Translations<Text> = {
	ar: {
		"flow.flow": "تدفق",
		"flow.play": "لعب",
		"flow.builder": "باني",
		"flow.puzzle-completed": "تم حل اللغز",
		"flow.select-next-pack": "حدد الحزمة التالية",
		"flow.next-puzzle": "اللغز التالي",
		"flow.level": (level) => `مستوى ${level}`,
	},
	de: {
		"flow.flow": "Fluss",
		"flow.play": "Spielen",
		"flow.builder": "Baumeister",
		"flow.puzzle-completed": "Rätsel gelöst",
		"flow.select-next-pack": "Nächstes Paket auswählen",
		"flow.next-puzzle": "Nächstes Rätsel",
		"flow.level": (level) => `Stufe ${level}`,
	},
	en: {
		"flow.flow": "Flow",
		"flow.play": "Play",
		"flow.builder": "Builder",
		"flow.puzzle-completed": "Puzzle Completed",
		"flow.select-next-pack": "Select Next Pack",
		"flow.next-puzzle": "Next Puzzle",
		"flow.level": (level) => `Level ${level}`,
	},
	es: {
		"flow.flow": "Flujo",
		"flow.play": "Jugar",
		"flow.builder": "Constructor",
		"flow.puzzle-completed": "Rompecabezas completado",
		"flow.select-next-pack": "Seleccionar siguiente paquete",
		"flow.next-puzzle": "Siguiente rompecabezas",
		"flow.level": (level) => `Nivel ${level}`,
	},
	fr: {
		"flow.flow": "Flux",
		"flow.play": "Jouer",
		"flow.builder": "Constructeur",
		"flow.puzzle-completed": "Puzzle terminé",
		"flow.select-next-pack": "Sélectionner le pack suivant",
		"flow.next-puzzle": "Puzzle suivant",
		"flow.level": (level) => `Niveau ${level}`,
	},
	it: {
		"flow.flow": "Flusso",
		"flow.play": "Gioca",
		"flow.builder": "Costruttore",
		"flow.puzzle-completed": "Puzzle completato",
		"flow.select-next-pack": "Seleziona il pacchetto successivo",
		"flow.next-puzzle": "Puzzle successivo",
		"flow.level": (level) => `Livello ${level}`,
	},
	ja: {
		"flow.flow": "フロー",
		"flow.play": "遊ぶ",
		"flow.builder": "ビルダー",
		"flow.puzzle-completed": "パズルが完了しました",
		"flow.select-next-pack": "次のパックを選択",
		"flow.next-puzzle": "次のパズル",
		"flow.level": (level) => `レベル${level}`,
	},
	ko: {
		"flow.flow": "흐름",
		"flow.play": "놀이",
		"flow.builder": "빌더",
		"flow.puzzle-completed": "퍼즐 완료",
		"flow.select-next-pack": "다음 팩 선택",
		"flow.next-puzzle": "다음 퍼즐",
		"flow.level": (level) => `레벨 ${level}`,
	},
	pt: {
		"flow.flow": "Fluxo",
		"flow.play": "Jogar",
		"flow.builder": "Construtor",
		"flow.puzzle-completed": "Quebra-cabeça concluído",
		"flow.select-next-pack": "Selecionar próximo pacote",
		"flow.next-puzzle": "Próximo quebra-cabeça",
		"flow.level": (level) => `Nível ${level}`,
	},
	ru: {
		"flow.flow": "Поток",
		"flow.play": "Играть",
		"flow.builder": "Строитель",
		"flow.puzzle-completed": "Головоломка завершена ",
		"flow.select-next-pack": "Выбрать следующий пакет",
		"flow.next-puzzle": "Следующая головоломка",
		"flow.level": (level) => `Уровень ${level}`,
	},
	zh: {
		"flow.flow": "流",
		"flow.play": "玩",
		"flow.builder": "建造者",
		"flow.puzzle-completed": "拼图完成",
		"flow.select-next-pack": "选择下一个包",
		"flow.next-puzzle": "下一个拼图",
		"flow.level": (level) => `等级 ${level}`,
	},
	hi: {
		"flow.flow": "फ्लो",
		"flow.play": "खेलें",
		"flow.builder": "निर्माता",
		"flow.puzzle-completed": "पहेली पूरी हो गई",
		"flow.select-next-pack": "अगला पैक चुनें",
		"flow.next-puzzle": "अगली पहेली",
		"flow.level": (level) => `स्तर ${level}`,
	},
};
