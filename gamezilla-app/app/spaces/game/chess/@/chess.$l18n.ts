import type { Translations } from "gamezilla-app/@/l18n";
import { BotLevel } from "./chess/chess-core";

export type Text = {
	"chess.puzzle-title": string;
	"chess.puzzle-description": string;
	"chess.white": string;
	"chess.black": string;
	"chess.bot-level": (botLevel: BotLevel) => string;
};

export const translations: Translations<Text> = {
	en: {
		"chess.puzzle-title": "Puzzles",
		"chess.puzzle-description": "Train with more than 3 million puzzles",
		"chess.black": "Black",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "Beginner";
				case 1:
					return "Intermediate";
				case 2:
					return "Advanced";
				case 3:
					return "Expert";
				case 4:
					return "Master";
				default:
					return "Unknown";
			}
		},
		"chess.white": "White",
	},
	ar: {
		"chess.puzzle-description": "تدرب مع أكثر من 3 ملايين لغز",
		"chess.puzzle-title": "ألغاز",
		"chess.black": "أسود",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "مبتدئ";
				case 1:
					return "متوسط";
				case 2:
					return "متقدم";
				case 3:
					return "خبير";
				case 4:
					return "ماجستير";
				default:
					return "غير معروف";
			}
		},
		"chess.white": "أبيض",
	},
	de: {
		"chess.puzzle-description":
			"Trainieren Sie mit mehr als 3 Millionen Rätseln",
		"chess.puzzle-title": "Rätsel",
		"chess.black": "Schwarz",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "Anfänger";
				case 1:
					return "Fortgeschritten";
				case 2:
					return "Experte";
				case 3:
					return "Profi";
				case 4:
					return "Meister";
				default:
					return "Unbekannt";
			}
		},
		"chess.white": "Weiß",
	},
	es: {
		"chess.puzzle-description":
			"Entrenar con más de 3 millones de rompecabezas",
		"chess.puzzle-title": "Rompecabezas",
		"chess.white": "Blanco",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "Principiante";
				case 1:
					return "Intermedio";
				case 2:
					return "Avanzado";
				case 3:
					return "Experto";
				case 4:
					return "Maestro";
				default:
					return "Desconocido";
			}
		},
		"chess.black": "Black",
	},
	fr: {
		"chess.puzzle-description":
			"Entraînez-vous avec plus de 3 millions de puzzles",
		"chess.puzzle-title": "Puzzles",
		"chess.black": "Noir",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "Débutant";
				case 1:
					return "Intermédiaire";
				case 2:
					return "Avancé";
				case 3:
					return "Expert";
				case 4:
					return "Maître";
				default:
					return "Inconnu";
			}
		},
		"chess.white": "Blanc",
	},
	hi: {
		"chess.puzzle-description": "3 मिलियन से अधिक पहेलियों के साथ प्रशिक्षण करें",
		"chess.puzzle-title": "पहेलियाँ",
		"chess.black": "काला",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "शुरुआती";
				case 1:
					return "इंटरमीडिएट";
				case 2:
					return "उन्नत";
				case 3:
					return "विशेषज्ञ";
				case 4:
					return "मास्टर";
				default:
					return "अज्ञात";
			}
		},
		"chess.white": "सफेद",
	},
	it: {
		"chess.puzzle-description": "Allenati con più di 3 milioni di puzzle",
		"chess.puzzle-title": "Puzzle",
		"chess.black": "Nero",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "Principiante";
				case 1:
					return "Intermedio";
				case 2:
					return "Avanzato";
				case 3:
					return "Esperto";
				case 4:
					return "Maestro";
				default:
					return "Sconosciuto";
			}
		},
		"chess.white": "Bianco",
	},
	ja: {
		"chess.puzzle-description": "300 万以上のパズルでトレーニング",
		"chess.puzzle-title": "パズル",
		"chess.black": "黒",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "初心者";
				case 1:
					return "中級";
				case 2:
					return "上級";
				case 3:
					return "エキスパート";
				case 4:
					return "マスター";
				default:
					return "不明";
			}
		},
		"chess.white": "白",
	},
	ko: {
		"chess.puzzle-description": "300 만 개 이상의 퍼즐로 훈련",
		"chess.puzzle-title": "퍼즐",
		"chess.black": "검은색",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "초보자";
				case 1:
					return "중급";
				case 2:
					return "고급";
				case 3:
					return "전문가";
				case 4:
					return "마스터";
				default:
					return "알 수 없음";
			}
		},
		"chess.white": "흰색",
	},
	pt: {
		"chess.puzzle-description":
			"Treine com mais de 3 milhões de quebra-cabeças",
		"chess.puzzle-title": "Quebra-cabeças",
		"chess.black": "Preto",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "Iniciante";
				case 1:
					return "Intermediário";
				case 2:
					return "Avançado";
				case 3:
					return "Especialista";
				case 4:
					return "Mestre";
				default:
					return "Desconhecido";
			}
		},
		"chess.white": "Branco",
	},
	ru: {
		"chess.puzzle-description":
			"Тренируйтесь с более чем 3 миллионами головоломок",
		"chess.puzzle-title": "Головоломки",
		"chess.black": "Черный",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "Новичок";
				case 1:
					return "Средний";
				case 2:
					return "Продвинутый";
				case 3:
					return "Эксперт";
				case 4:
					return "Мастер";
				default:
					return "Неизвестно";
			}
		},
		"chess.white": "Белый",
	},
	zh: {
		"chess.puzzle-description": "使用300多万个拼图进行训练",
		"chess.puzzle-title": "拼图",
		"chess.black": "黑色",
		"chess.bot-level": (botLevel) => {
			switch (botLevel) {
				case 0:
					return "初学者";
				case 1:
					return "中级";
				case 2:
					return "高级";
				case 3:
					return "专家";
				case 4:
					return "大师";
				default:
					return "未知";
			}
		},
		"chess.white": "白色",
	},
};
