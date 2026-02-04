import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'id' | 'en' | 'jp';

interface Translations {
  [key: string]: {
    id: string;
    en: string;
    jp: string;
  };
}

const translations: Translations = {
  // Cutscene translations
  cutscene_boot: {
    id: '> NEXUS SYSTEM v1.0.0 ... BOOTING',
    en: '> NEXUS SYSTEM v1.0.0 ... BOOTING',
    jp: '> NEXUS SYSTEM v1.0.0 ... 起動中',
  },
  cutscene_init: {
    id: '> MENGINISIALISASI PORTFOLIO ENGINE... BERHASIL',
    en: '> INITIALIZING PORTFOLIO ENGINE... SUCCESS',
    jp: '> ポートフォリオエンジン初期化中... 成功',
  },
  cutscene_greeting: {
    id: 'Selamat datang, Traveler. Aku adalah Navigator AI dari NEXUS SPACE.',
    en: 'Welcome, Traveler. I am the Navigator AI of NEXUS SPACE.',
    jp: 'ようこそ、トラベラー。私はNEXUS SPACEのナビゲーターAIです。',
  },
  cutscene_intro1: {
    id: 'Kamu telah memasuki dimensi portfolio milik ZIDANDEV - seorang developer yang passionate dalam membangun pengalaman digital yang unik.',
    en: 'You have entered the portfolio dimension of ZIDANDEV - a developer passionate about building unique digital experiences.',
    jp: 'あなたはZIDANDEVのポートフォリオ次元に入りました - ユニークなデジタル体験の構築に情熱を注ぐ開発者です。',
  },
  cutscene_intro2: {
    id: 'Di sini, kamu akan menjelajahi berbagai proyek, skill, dan cerita di balik perjalanan coding-nya.',
    en: 'Here, you will explore various projects, skills, and the story behind their coding journey.',
    jp: 'ここでは、様々なプロジェクト、スキル、そしてコーディングの旅の物語を探索します。',
  },
  cutscene_tutorial1: {
    id: 'Gunakan JOYSTICK di kiri bawah layar untuk menggerakkan pesawat luar angkasa-mu.',
    en: 'Use the JOYSTICK at the bottom left of the screen to move your spaceship.',
    jp: '画面左下のジョイスティックを使って宇宙船を動かしてください。',
  },
  cutscene_tutorial2: {
    id: 'Navigasi ke berbagai STATION untuk membuka konten portfolio - About, Projects, Skills, dan lainnya.',
    en: 'Navigate to various STATIONS to unlock portfolio content - About, Projects, Skills, and more.',
    jp: '様々なステーションに移動してポートフォリオコンテンツをアンロック - About、Projects、Skillsなど。',
  },
  cutscene_tutorial3: {
    id: 'Eksplorasi ruang angkasa, kumpulkan bintang, dan temukan easter egg yang tersembunyi!',
    en: 'Explore the space, collect stars, and find hidden easter eggs!',
    jp: '宇宙を探索し、星を集め、隠されたイースターエッグを見つけよう！',
  },
  cutscene_ready: {
    id: 'Pesawatmu sudah siap. Saatnya memulai perjalanan epik ini!',
    en: 'Your ship is ready. Time to begin this epic journey!',
    jp: '船の準備ができました。このエピックな旅を始める時です！',
  },
  cutscene_launch: {
    id: '> PELUNCURAN DALAM 3... 2... 1... SELAMAT MENJELAJAH!',
    en: '> LAUNCHING IN 3... 2... 1... HAPPY EXPLORING!',
    jp: '> 発射 3... 2... 1... 探索を楽しんで！',
  },
  cutscene_continue: {
    id: 'LANJUTKAN',
    en: 'CONTINUE',
    jp: '続ける',
  },
  cutscene_start: {
    id: 'MULAI PETUALANGAN',
    en: 'START ADVENTURE',
    jp: '冒険を始める',
  },
  // Loading Screen
  // Loading Screen
  loading: {
    id: 'MEMUAT SISTEM...',
    en: 'LOADING SYSTEM...',
    jp: 'システム読み込み中...',
  },
  initializing: {
    id: 'Menginisialisasi Nexus Space...',
    en: 'Initializing Nexus Space...',
    jp: 'Nexus Spaceを初期化中...',
  },
  
  // Main Menu
  startJourney: {
    id: 'MULAI PERJALANAN',
    en: 'START JOURNEY',
    jp: '旅を始める',
  },
  changeLanguage: {
    id: 'GANTI BAHASA',
    en: 'CHANGE LANGUAGE',
    jp: '言語変更',
  },
  exit: {
    id: 'KELUAR',
    en: 'EXIT',
    jp: '終了',
  },
  selectLanguage: {
    id: 'Pilih Bahasa',
    en: 'Select Language',
    jp: '言語を選択',
  },
  
  // Content Titles
  aboutMe: {
    id: 'Tentang Saya',
    en: 'About Me',
    jp: '自己紹介',
  },
  skills: {
    id: 'Keahlian',
    en: 'Skills',
    jp: 'スキル',
  },
  gameProjects: {
    id: 'Proyek Game',
    en: 'Game Projects',
    jp: 'ゲームプロジェクト',
  },
  webProjects: {
    id: 'Proyek Web',
    en: 'Web Projects',
    jp: 'ウェブプロジェクト',
  },
  certificates: {
    id: 'Sertifikat',
    en: 'Certificates',
    jp: '資格証明書',
  },
  socialMedia: {
    id: 'Media Sosial',
    en: 'Social Media',
    jp: 'ソーシャルメディア',
  },
  contact: {
    id: 'Kontak',
    en: 'Contact',
    jp: 'お問い合わせ',
  },
  contactDesc: {
    id: 'Kirim pesan langsung ke Zidandev! Saya akan senang mendengar dari kamu.',
    en: 'Send a message directly to Zidandev! I would love to hear from you.',
    jp: 'Zidandevに直接メッセージを送信！ぜひご連絡ください。',
  },
  contactSubject: {
    id: 'Judul',
    en: 'Subject',
    jp: '件名',
  },
  contactSubjectPlaceholder: {
    id: 'Masukkan judul pesan...',
    en: 'Enter message subject...',
    jp: 'メッセージの件名を入力...',
  },
  contactEmail: {
    id: 'Email Pengirim',
    en: 'Your Email',
    jp: 'あなたのメール',
  },
  contactEmailPlaceholder: {
    id: 'email@contoh.com',
    en: 'email@example.com',
    jp: 'email@example.com',
  },
  contactMessage: {
    id: 'Pesan',
    en: 'Message',
    jp: 'メッセージ',
  },
  contactMessagePlaceholder: {
    id: 'Tulis pesanmu di sini...',
    en: 'Write your message here...',
    jp: 'ここにメッセージを書いてください...',
  },
  contactSend: {
    id: 'LUNCURKAN PESAN',
    en: 'LAUNCH MESSAGE',
    jp: 'メッセージを送信',
  },
  contactSending: {
    id: 'MELUNCURKAN...',
    en: 'LAUNCHING...',
    jp: '送信中...',
  },
  contactSent: {
    id: 'PESAN TERKIRIM!',
    en: 'MESSAGE SENT!',
    jp: 'メッセージ送信完了！',
  },
  contactSuccess: {
    id: 'Pesanmu berhasil diluncurkan ke luar angkasa! Zidandev akan segera membacanya.',
    en: 'Your message has been launched into space! Zidandev will read it soon.',
    jp: 'メッセージが宇宙に送信されました！Zidandevがすぐに読みます。',
  },
  contactError: {
    id: 'Gagal mengirim pesan. Silakan coba lagi.',
    en: 'Failed to send message. Please try again.',
    jp: 'メッセージの送信に失敗しました。もう一度お試しください。',
  },
  contactFillAll: {
    id: 'Mohon isi semua field.',
    en: 'Please fill in all fields.',
    jp: 'すべてのフィールドに入力してください。',
  },
  contactInvalidEmail: {
    id: 'Format email tidak valid.',
    en: 'Invalid email format.',
    jp: 'メールの形式が無効です。',
  },
  
  // About Me Content
  aboutMeDesc: {
    id: 'Halo! Nama saya Zidane Achmad Nurjayyin, atau lebih dikenal dengan nama digital Zidandev. Saya adalah seorang Game Developer dan Web Developer yang passionate dengan dunia teknologi dan kreativitas digital. Perjalanan saya dimulai dari kecintaan terhadap game - saking seringnya bermain dan mengeksplorasi berbagai jenis game, saya terinspirasi untuk tidak hanya menjadi pemain, tetapi juga pencipta.',
    en: 'Hello! My name is Zidane Achmad Nurjayyin, also known digitally as Zidandev. I am a Game Developer and Web Developer who is passionate about technology and digital creativity. My journey started from my love for games - from playing and exploring various types of games so frequently, I was inspired to not only be a player but also a creator.',
    jp: 'こんにちは！私の名前はZidane Achmad Nurjayyinで、デジタル名はZidandevとして知られています。私はテクノロジーとデジタルクリエイティビティに情熱を持つゲーム開発者およびウェブ開発者です。私の旅はゲームへの愛から始まりました - 様々なゲームをプレイし探求する中で、プレイヤーだけでなくクリエイターになることにインスピレーションを受けました。',
  },
  languageSkills: {
    id: 'Bahasa yang dikuasai: English & Nihongo (Bahasa Jepang)',
    en: 'Languages: English & Nihongo (Japanese)',
    jp: '言語スキル：英語と日本語',
  },
  passion: {
    id: 'Perjalanan saya dimulai dari kecintaan terhadap game. Setiap project yang saya kerjakan selalu diusahakan untuk memberikan pengalaman yang unik dan berkesan.',
    en: 'My journey started from my love for games. Every project I work on is always strived to provide a unique and memorable experience.',
    jp: '私の旅はゲームへの愛から始まりました。私が取り組むすべてのプロジェクトは、常にユニークで思い出に残る体験を提供することを目指しています。',
  },
  
  // Skills Categories
  gameEngines: {
    id: 'Game Engine',
    en: 'Game Engines',
    jp: 'ゲームエンジン',
  },
  webDev: {
    id: 'Pengembangan Web',
    en: 'Web Development',
    jp: 'ウェブ開発',
  },
  languages: {
    id: 'Bahasa Pemrograman',
    en: 'Programming Languages',
    jp: 'プログラミング言語',
  },
  
  // Game Projects
  game2DFrits: {
    id: '2D Frits - Game petualangan 2D yang menggabungkan elemen platformer dengan sistem inventory yang unik. Pemain akan menjelajahi dunia yang penuh dengan tantangan dan misteri. Dikembangkan dengan Unity menggunakan pixel art style yang nostalgic.',
    en: '2D Frits - A 2D adventure game that combines platformer elements with a unique inventory system. Players will explore a world full of challenges and mysteries. Developed with Unity using nostalgic pixel art style.',
    jp: '2D Frits - プラットフォーマー要素とユニークなインベントリシステムを組み合わせた2Dアドベンチャーゲーム。挑戦と謎に満ちた世界を探検します。懐かしいピクセルアートスタイルでUnityで開発。',
  },
  gameSpaceShot: {
    id: 'Space Shot - Game arcade shooter di mana pemain harus menembak sampah luar angkasa sambil menghindari rintangan. Gameplay yang cepat dengan sistem score dan power-ups. Mengajarkan pentingnya menjaga kebersihan, bahkan di luar angkasa!',
    en: 'Space Shot - An arcade shooter game where players must shoot space trash while avoiding obstacles. Fast-paced gameplay with score system and power-ups. Teaches the importance of cleanliness, even in outer space!',
    jp: 'Space Shot - 障害物を避けながら宇宙ゴミを撃つアーケードシューターゲーム。スコアシステムとパワーアップを備えたテンポの速いゲームプレイ。宇宙でも清潔さの重要性を教えています！',
  },
  gameZidaneWorld: {
    id: 'Zidane World Nexus - Proyek ambisius yang menggabungkan berbagai elemen gameplay dalam satu dunia yang luas. Fitur open world dengan multiple gameplay systems, rich storyline, dan unique art direction. Representasi dari visi kreatif saya dalam game development.',
    en: 'Zidane World Nexus - An ambitious project that combines various gameplay elements in one vast world. Features open world with multiple gameplay systems, rich storyline, and unique art direction. A representation of my creative vision in game development.',
    jp: 'Zidane World Nexus - 様々なゲームプレイ要素を一つの広大な世界に組み合わせた野心的なプロジェクト。複数のゲームプレイシステム、豊かなストーリーライン、ユニークなアートディレクションを備えたオープンワールド。ゲーム開発における私のクリエイティブビジョンの表現。',
  },
  gameEcoLove: {
    id: 'Eco Love - Game edukatif bertema lingkungan di mana pemain belajar tentang pentingnya menjaga kelestarian alam melalui gameplay yang interaktif dan menyenangkan. Fitur environmental awareness themes dengan beautiful nature-inspired visuals.',
    en: 'Eco Love - An educational game with environmental themes where players learn about the importance of nature conservation through interactive and fun gameplay. Features environmental awareness themes with beautiful nature-inspired visuals.',
    jp: 'Eco Love - 環境テーマの教育ゲームで、インタラクティブで楽しいゲームプレイを通じて自然保護の重要性を学びます。美しい自然にインスパイアされたビジュアルを持つ環境意識のテーマが特徴。',
  },
  
  // Web Projects
  webEnvironment: {
    id: 'Environtment - Website kompetisi bertema sekolah sehat dan lingkungan. Menampilkan informasi tentang pentingnya menjaga kesehatan dan kebersihan lingkungan sekolah dengan desain responsif dan interactive elements.',
    en: 'Environtment - Competition website themed healthy school and environment. Displays information about the importance of maintaining health and cleanliness in school environment with responsive design and interactive elements.',
    jp: 'Environtment - 健康な学校と環境をテーマにしたコンペティションウェブサイト。レスポンシブデザインとインタラクティブ要素で学校環境における健康と清潔さを維持することの重要性に関する情報を表示。',
  },
  webGlobalVista: {
    id: 'GlobalVista - Website yang menampilkan perspektif global tentang berbagai isu. Dikembangkan untuk kompetisi dengan fokus pada desain yang menarik, informatif, dan modern landing page dengan smooth animations.',
    en: 'GlobalVista - A website that presents a global perspective on various issues. Developed for competition with focus on attractive, informative design and modern landing page with smooth animations.',
    jp: 'GlobalVista - 様々な問題についてのグローバルな視点を提示するウェブサイト。魅力的で情報豊富なデザインとスムーズなアニメーションを備えたモダンなランディングページに焦点を当てたコンペティション用に開発。',
  },
  webVeirTech: {
    id: 'VeirTech - Website bertema teknologi yang berhasil meraih penghargaan dalam kompetisi! Menampilkan desain futuristik dengan fokus pada inovasi teknologi, award-winning design, dan optimized performance.',
    en: 'VeirTech - Technology-themed website that won an award in competition! Features futuristic design with focus on technological innovation, award-winning design, and optimized performance.',
    jp: 'VeirTech - コンペティションで賞を受賞したテクノロジーテーマのウェブサイト！技術革新に焦点を当てた未来的なデザイン、受賞歴のあるデザイン、最適化されたパフォーマンスが特徴。',
  },
  webSACG: {
    id: 'SACG (Student Activity & Community Games) - Platform yang menghubungkan komunitas gaming pelajar. Dirancang untuk mempromosikan aktivitas gaming yang positif dengan community-focused design dan gaming aesthetic.',
    en: 'SACG (Student Activity & Community Games) - Platform connecting student gaming community. Designed to promote positive gaming activities with community-focused design and gaming aesthetic.',
    jp: 'SACG（学生活動とコミュニティゲーム）- 学生ゲームコミュニティをつなぐプラットフォーム。コミュニティ重視のデザインとゲーム美学でポジティブなゲーム活動を促進するために設計。',
  },
  
  // Certificates
  certVeirTech: {
    id: 'Sertifikat VeirTech - Penghargaan kompetisi web development untuk website VeirTech yang berhasil meraih prestasi dengan desain inovatif dan futuristik. Bukti pencapaian dalam bidang teknologi web.',
    en: 'VeirTech Certificate - Web development competition award for VeirTech website that achieved recognition with innovative and futuristic design. Proof of achievement in web technology field.',
    jp: 'VeirTech証明書 - 革新的で未来的なデザインで認められたVeirTechウェブサイトのウェブ開発コンペティション賞。ウェブテクノロジー分野での実績の証明。',
  },
  certHadroh: {
    id: 'Sertifikat Hadroh - Sertifikat partisipasi dan pencapaian dalam kegiatan seni musik tradisional Hadroh. Menunjukkan kemampuan dalam seni musik dan kerja sama tim.',
    en: 'Hadroh Certificate - Participation and achievement certificate in traditional Hadroh music art activities. Shows ability in music art and teamwork.',
    jp: 'Hadroh証明書 - 伝統的なHadroh音楽芸術活動への参加と達成の証明書。音楽芸術とチームワークの能力を示す。',
  },
  certJapan: {
    id: 'Sertifikat Bahasa Jepang - Sertifikat kemampuan berbahasa Jepang (Nihongo) yang membuktikan profisiensi dalam membaca, menulis, dan berbicara bahasa Jepang.',
    en: 'Japanese Language Certificate - Japanese language (Nihongo) proficiency certificate proving ability in reading, writing, and speaking Japanese.',
    jp: '日本語証明書 - 日本語の読み書き、会話能力を証明する日本語能力証明書。',
  },
  
  // Social Media
  youtube: {
    id: 'YouTube - Konten gaming dan tutorial.',
    en: 'YouTube - Gaming content and tutorials.',
    jp: 'YouTube - ゲームコンテンツとチュートリアル。',
  },
  instagram: {
    id: 'Instagram - Momen gaming dan update terbaru.',
    en: 'Instagram - Gaming moments and latest updates.',
    jp: 'Instagram - ゲームの瞬間と最新アップデート。',
  },
  github: {
    id: 'GitHub - Repository kode dan proyek open source.',
    en: 'GitHub - Code repositories and open source projects.',
    jp: 'GitHub - コードリポジトリとオープンソースプロジェクト。',
  },
  itchio: {
    id: 'itch.io - Koleksi game yang bisa dimainkan.',
    en: 'itch.io - Collection of playable games.',
    jp: 'itch.io - プレイ可能なゲームのコレクション。',
  },
  
  // UI Elements
  close: {
    id: 'Tutup',
    en: 'Close',
    jp: '閉じる',
  },
  visitSite: {
    id: 'Kunjungi Situs',
    en: 'Visit Site',
    jp: 'サイトを訪問',
  },
  playGame: {
    id: 'Mainkan Game',
    en: 'Play Game',
    jp: 'ゲームをプレイ',
  },
  viewCertificate: {
    id: 'Lihat Sertifikat',
    en: 'View Certificate',
    jp: '証明書を見る',
  },
  controls: {
    id: 'Kontrol: WASD atau Panah untuk bergerak',
    en: 'Controls: WASD or Arrow keys to move',
    jp: 'コントロール：WASDまたは矢印キーで移動',
  },
  touchControls: {
    id: 'Sentuh dan geser joystick untuk bergerak',
    en: 'Touch and drag joystick to move',
    jp: 'ジョイスティックをタッチしてドラッグして移動',
  },
  welcomeMessage: {
    id: 'Selamat datang di Nexus Space Portfolio',
    en: 'Welcome to Nexus Space Portfolio',
    jp: 'Nexus Space ポートフォリオへようこそ',
  },
  exitConfirm: {
    id: 'Terima kasih telah berkunjung!',
    en: 'Thank you for visiting!',
    jp: 'ご訪問ありがとうございます！',
  },
  
  // Testimonials
  testimonials: {
    id: 'Testimoni',
    en: 'Testimonials',
    jp: 'お客様の声',
  },
  testimonialsDesc: {
    id: 'Lihat review dari orang-orang yang pernah bekerjasama dengan Zidandev, atau tulis testimonimu sendiri!',
    en: 'See reviews from people who have worked with Zidandev, or write your own testimonial!',
    jp: 'Zidandevと一緒に仕事をした人々のレビューを見るか、自分の感想を書いてください！',
  },
  testimonialsTabRead: {
    id: 'LIHAT REVIEW',
    en: 'VIEW REVIEWS',
    jp: 'レビューを見る',
  },
  testimonialsTabWrite: {
    id: 'TULIS REVIEW',
    en: 'WRITE REVIEW',
    jp: 'レビューを書く',
  },
  testimonialsName: {
    id: 'Nama',
    en: 'Name',
    jp: '名前',
  },
  testimonialsNamePlaceholder: {
    id: 'Masukkan nama kamu...',
    en: 'Enter your name...',
    jp: 'お名前を入力...',
  },
  testimonialsRating: {
    id: 'Rating',
    en: 'Rating',
    jp: '評価',
  },
  testimonialsMessage: {
    id: 'Pesan',
    en: 'Message',
    jp: 'メッセージ',
  },
  testimonialsMessagePlaceholder: {
    id: 'Tulis pengalamanmu bekerja dengan Zidandev...',
    en: 'Write about your experience working with Zidandev...',
    jp: 'Zidandevとの仕事の経験について書いてください...',
  },
  testimonialsSubmit: {
    id: 'KIRIM TESTIMONI',
    en: 'SUBMIT TESTIMONIAL',
    jp: 'レビューを送信',
  },
  testimonialsSending: {
    id: 'MENGIRIM...',
    en: 'SENDING...',
    jp: '送信中...',
  },
  testimonialsSent: {
    id: 'TERKIRIM!',
    en: 'SENT!',
    jp: '送信完了！',
  },
  testimonialsSuccess: {
    id: 'Terima kasih! Testimonimu telah terkirim.',
    en: 'Thank you! Your testimonial has been submitted.',
    jp: 'ありがとうございます！レビューが送信されました。',
  },
  testimonialsError: {
    id: 'Gagal mengirim testimoni. Silakan coba lagi.',
    en: 'Failed to submit testimonial. Please try again.',
    jp: 'レビューの送信に失敗しました。もう一度お試しください。',
  },
  testimonialsFillAll: {
    id: 'Mohon isi nama dan pesan.',
    en: 'Please fill in name and message.',
    jp: '名前とメッセージを入力してください。',
  },
  testimonialsInvalidRating: {
    id: 'Rating harus antara 1-5.',
    en: 'Rating must be between 1-5.',
    jp: '評価は1〜5の間でなければなりません。',
  },
  testimonialsLoading: {
    id: 'Memuat testimoni...',
    en: 'Loading testimonials...',
    jp: 'レビューを読み込み中...',
  },
  testimonialsEmpty: {
    id: 'Belum ada testimoni. Jadilah yang pertama!',
    en: 'No testimonials yet. Be the first!',
    jp: 'まだレビューがありません。最初の一人になりましょう！',
  },
  testimonialsBeFirst: {
    id: 'TULIS TESTIMONI PERTAMA',
    en: 'WRITE THE FIRST TESTIMONIAL',
    jp: '最初のレビューを書く',
  },
  testimonialsTranslate: {
    id: 'Terjemahkan',
    en: 'Translate',
    jp: '翻訳する',
  },
  testimonialsTranslating: {
    id: 'Menerjemahkan...',
    en: 'Translating...',
    jp: '翻訳中...',
  },
  testimonialsRateLimited: {
    id: 'Terlalu banyak permintaan. Tunggu sebentar sebelum mengirim lagi.',
    en: 'Too many requests. Please wait before submitting again.',
    jp: 'リクエストが多すぎます。再送信する前にお待ちください。',
  },
  testimonialsWait: {
    id: 'Tunggu',
    en: 'Wait',
    jp: '待機',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('id');

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
