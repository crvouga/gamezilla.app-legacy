import type {Translations} from 'gamezilla-app/@/l18n';

export type Text = {
	'flow.flow': string;
	'flow.play': string;
	'flow.play-description': string;
	'flow.builder': string;
	'flow.builder-description': string;
	'flow.puzzle-completed': string;
	'flow.select-next-pack': string;
	'flow.next-puzzle': string;
	'flow.level': (level: number) => string;
	'flow.puzzles': string;
	'flow.packs': string;
};

export const translations: Translations<Text> = {
	ar: {
		'flow.flow': 'تدفق',
		'flow.play': 'لعب',
		'flow.play-description': 'ابدأ في لعب الألغاز',
		'flow.builder': 'باني',
		'flow.builder-description':
			'إنشاء وتحرير الألغاز والحزم',
		'flow.puzzle-completed': 'تم حل اللغز',
		'flow.select-next-pack': 'حدد الحزمة التالية',
		'flow.next-puzzle': 'اللغز التالي',
		'flow.level': (level) => `مستوى ${level}`,
		'flow.packs': 'حزم',
		'flow.puzzles': 'ألغاز',
	},
	de: {
		'flow.flow': 'Fluss',
		'flow.play': 'Spielen',
		'flow.play-description':
			'Beginnen Sie mit dem Spielen von Rätseln',
		'flow.builder': 'Baumeister',
		'flow.builder-description':
			'Erstellen und bearbeiten Sie Rätsel und Pakete',
		'flow.puzzle-completed': 'Rätsel gelöst',
		'flow.select-next-pack':
			'Nächstes Paket auswählen',
		'flow.next-puzzle': 'Nächstes Rätsel',
		'flow.level': (level) => `Stufe ${level}`,
		'flow.packs': 'Pakete',
		'flow.puzzles': 'Rätsel',
	},
	en: {
		'flow.flow': 'Flow',
		'flow.play': 'Play',
		'flow.play-description':
			'Start playing puzzles',
		'flow.builder': 'Builder',
		'flow.builder-description':
			'Create and edit puzzles and packs',
		'flow.puzzle-completed': 'Puzzle Completed',
		'flow.select-next-pack': 'Select Next Pack',
		'flow.next-puzzle': 'Next Puzzle',
		'flow.level': (level) => `Level ${level}`,
		'flow.packs': 'Packs',
		'flow.puzzles': 'Puzzles',
	},
	es: {
		'flow.flow': 'Flujo',
		'flow.play': 'Jugar',
		'flow.play-description':
			'Comienza a jugar rompecabezas',
		'flow.builder': 'Constructor',
		'flow.builder-description':
			'Crea y edita rompecabezas y paquetes',
		'flow.puzzle-completed':
			'Rompecabezas completado',
		'flow.select-next-pack':
			'Seleccionar siguiente paquete',
		'flow.next-puzzle': 'Siguiente rompecabezas',
		'flow.level': (level) => `Nivel ${level}`,
		'flow.packs': 'Paquetes',
		'flow.puzzles': 'Rompecabezas',
	},
	fr: {
		'flow.flow': 'Flux',
		'flow.play': 'Jouer',
		'flow.play-description':
			'Commencez à jouer à des puzzles',
		'flow.builder': 'Constructeur',
		'flow.builder-description':
			'Créez et modifiez des puzzles et des packs',
		'flow.puzzle-completed': 'Puzzle terminé',
		'flow.select-next-pack':
			'Sélectionner le pack suivant',
		'flow.next-puzzle': 'Puzzle suivant',
		'flow.level': (level) => `Niveau ${level}`,
		'flow.packs': 'Packs',
		'flow.puzzles': 'Puzzles',
	},
	it: {
		'flow.flow': 'Flusso',
		'flow.play': 'Gioca',
		'flow.play-description':
			'Inizia a giocare ai puzzle',
		'flow.builder': 'Costruttore',
		'flow.builder-description':
			'Crea e modifica puzzle e pacchetti',
		'flow.puzzle-completed': 'Puzzle completato',
		'flow.select-next-pack':
			'Seleziona il pacchetto successivo',
		'flow.next-puzzle': 'Puzzle successivo',
		'flow.level': (level) => `Livello ${level}`,
		'flow.packs': 'Pacchetti',
		'flow.puzzles': 'Puzzle',
	},
	ja: {
		'flow.flow': 'フロー',
		'flow.play': '遊ぶ',
		'flow.play-description':
			'パズルをプレイし始める',
		'flow.builder': 'ビルダー',
		'flow.builder-description':
			'パズルとパックを作成および編集',
		'flow.puzzle-completed': 'パズルが完了しました',
		'flow.select-next-pack': '次のパックを選択',
		'flow.next-puzzle': '次のパズル',
		'flow.level': (level) => `レベル${level}`,
		'flow.packs': 'パック',
		'flow.puzzles': 'パズル',
	},
	ko: {
		'flow.flow': '흐름',
		'flow.play': '놀이',
		'flow.play-description': '퍼즐 플레이 시작',
		'flow.builder': '빌더',
		'flow.builder-description':
			'퍼즐 및 팩 만들기 및 편집',
		'flow.puzzle-completed': '퍼즐 완료',
		'flow.select-next-pack': '다음 팩 선택',
		'flow.next-puzzle': '다음 퍼즐',
		'flow.level': (level) => `레벨 ${level}`,
		'flow.packs': '팩',
		'flow.puzzles': '퍼즐',
	},
	pt: {
		'flow.flow': 'Fluxo',
		'flow.play': 'Jogar',
		'flow.play-description':
			'Comece a jogar quebra-cabeças',
		'flow.builder': 'Construtor',
		'flow.builder-description':
			'Crie e edite quebra-cabeças e pacotes',
		'flow.puzzle-completed':
			'Quebra-cabeça concluído',
		'flow.select-next-pack':
			'Selecionar próximo pacote',
		'flow.next-puzzle': 'Próximo quebra-cabeça',
		'flow.level': (level) => `Nível ${level}`,
		'flow.packs': 'Pacotes',
		'flow.puzzles': 'Quebra-cabeças',
	},
	ru: {
		'flow.flow': 'Поток',
		'flow.play': 'Играть',
		'flow.play-description':
			'Начните играть в головоломки',
		'flow.builder': 'Строитель',
		'flow.builder-description':
			'Создание и редактирование головоломок и пакетов',
		'flow.puzzle-completed':
			'Головоломка завершена ',
		'flow.select-next-pack':
			'Выбрать следующий пакет',
		'flow.next-puzzle': 'Следующая головоломка',
		'flow.level': (level) => `Уровень ${level}`,
		'flow.packs': 'Пакеты',
		'flow.puzzles': 'Головоломки',
	},
	zh: {
		'flow.flow': '流',
		'flow.play': '玩',
		'flow.play-description': '开始玩拼图',
		'flow.builder': '建造者',
		'flow.builder-description':
			'创建和编辑拼图和包',
		'flow.puzzle-completed': '拼图完成',
		'flow.select-next-pack': '选择下一个包',
		'flow.next-puzzle': '下一个拼图',
		'flow.level': (level) => `等级 ${level}`,
		'flow.packs': '包',
		'flow.puzzles': '拼图',
	},
	hi: {
		'flow.flow': 'फ्लो',
		'flow.play': 'खेलें',
		'flow.play-description':
			'पहेलियों का खेल शुरू करें',
		'flow.builder': 'निर्माता',
		'flow.builder-description':
			'पहेलियों और पैक बनाएं और संपादित करें',
		'flow.puzzle-completed': 'पहेली पूरी हो गई',
		'flow.select-next-pack': 'अगला पैक चुनें',
		'flow.next-puzzle': 'अगली पहेली',
		'flow.level': (level) => `स्तर ${level}`,
		'flow.packs': 'पैक',
		'flow.puzzles': 'पहेलियाँ',
	},
};
