import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Mistake } from "./quiz-data";

export type Lang = "en" | "tr";

const STORAGE_KEY = "quizforge-lang";

/* ------------------------------------------------------------------ */
/* UI strings                                                          */
/* ------------------------------------------------------------------ */

const en = {
  "nav.dashboard": "Dashboard",
  "nav.vault": "Vault",
  "nav.practice": "Practice",
  "nav.ranks": "Ranks",
  "brand.tagline": "Mistake Vault",
  "side.coach": "Socratic Coach",
  "side.coachLine": "Never get the answer. Get the next question.",
  "header.welcome": "Welcome back,",
  "header.level": "Level",
  "header.xp": "XP",
  "header.day": "Day",
  "lang.label": "Language",
  "lang.en": "English",
  "lang.tr": "Türkçe",

  "dash.openMistakes": "Open mistakes",
  "dash.openMistakesHint": "waiting in your vault",
  "dash.mastered": "Mastered",
  "dash.masteredHint": "resolved for good",
  "dash.weeklyXp": "Weekly XP",
  "dash.weeklyXpHint": "rank #4 this week",
  "dash.weakness": "Weakness analytics",
  "dash.weaknessSub": "Accuracy by topic — the lowest ones feed your daily review.",
  "dash.attempts": "attempts logged",
  "dash.resolvedChart": "Questions resolved",
  "dash.last7": "Last 7 days",
  "dash.quickActions": "Quick actions",
  "dash.upload": "Upload wrong question",
  "dash.startReview": "Start daily review",
  "dash.reviewToast": "Daily review started (+20 XP)",
  "dash.reviewToastDesc": "Beginning with your weakest topic: Kinematics.",
  "dash.generateQuiz": "Generate practice quiz",
  "dash.quizToast": "Practice quiz generated",
  "dash.quizToastDesc": "8 questions mixed from your weakest 3 topics.",
  "dash.todayFocus": "Today's focus",
  "dash.socraticMode": "Socratic mode",
  "dash.focusLine":
    "You have {n} unresolved mistakes. Physics — Kinematics is your weakest topic at 40% accuracy.",
  "dash.openVault": "Open the Mistake Vault →",

  "vault.title": "Mistake Vault",
  "vault.count": "{a} of {b} questions",
  "vault.addNew": "Add new",
  "vault.search": "Search questions…",
  "vault.subject": "Subject",
  "vault.difficulty": "Difficulty",
  "vault.status": "Status",
  "vault.all": "All {label}",
  "vault.allSubject": "All subjects",
  "vault.allDifficulty": "All difficulties",
  "vault.allStatus": "All statuses",
  "vault.empty": "No mistakes match these filters. Try clearing them.",
  "vault.yourNote": "Your note: ",
  "vault.meta": "{n} attempts · added {d}",
  "vault.practice": "Practice",
  "vault.reopen": "Reopen",
  "vault.markMastered": "Mark mastered",
  "vault.masteredBadge": "Mastered",

  "practice.title": "Socratic practice",
  "practice.progress": "Question {i} of {n} in your review queue",
  "practice.variation": "AI variation",
  "practice.fromVault": "From vault",
  "practice.emptyVault": "Your vault is empty — add a wrong question to start practicing.",
  "practice.hint": "Hint",
  "practice.getHint": "Get Socratic hint",
  "practice.noMoreHints": "No more hints — try reasoning it through now.",
  "practice.hintUnlocked": "Socratic hint unlocked",
  "practice.hintUnlockedDesc": "Think it through before asking for the next one.",
  "practice.generateSimilar": "Generate similar question",
  "practice.similarToast": "Similar question generated",
  "practice.similarToastDesc": "Same concept, different numbers and scenario.",
  "practice.submit": "Submit answer",
  "practice.correctToast": "Correct! +{n} XP",
  "practice.wrongToast": "Not quite — read the detailed solution below.",
  "practice.correct": "Correct answer",
  "practice.incorrect": "Incorrect answer",
  "practice.originalNote": "Your original note:",
  "practice.next": "Next question",
  "practice.tryVariation": "Try a variation",
  "practice.masteredToast": "Marked as mastered (+50 XP)",

  "lb.title": "Weekly leaderboard",
  "lb.resets": "Resets Sunday at midnight",
  "lb.season": "Season 4",
  "lb.student": "Student",
  "lb.xp": "XP",
  "lb.resolved": "Resolved",
  "lb.streak": "Streak",
  "lb.you": "You",
  "lb.badges": "Achievement badges",
  "lb.badgesSub": "Earned by resolving mistakes, not by grinding new questions.",
  "lb.unlocked": "Unlocked",
  "lb.complete": "{n}% complete",

  "add.title": "Add a wrong question",
  "add.desc": "Capture the mistake while it is fresh — and say why you missed it.",
  "add.typeIt": "Type it",
  "add.uploadImage": "Upload image",
  "add.question": "Question",
  "add.questionPlaceholder": "Paste or type the question you got wrong…",
  "add.imageLabel": "Question image",
  "add.imagePlaceholder": "Tap to select a photo of the question",
  "add.subject": "Subject",
  "add.difficulty": "Difficulty",
  "add.topic": "Topic",
  "add.topicPlaceholder": "e.g. Kinematics",
  "add.why": "Why did you get it wrong?",
  "add.whyPlaceholder": "e.g. I forgot to check the domain of the logarithm.",
  "add.cancel": "Cancel",
  "add.save": "Save to Vault",
  "add.errQuestion": "Write the question first (at least a few words).",
  "add.errImage": "Pick an image of the question.",
  "add.saved": "Added to your Mistake Vault",
  "add.savedDesc": "The Socratic Coach prepared hints for it.",
  "add.fromImage": "Question captured from image",

  "ocr.trigger": "Scan photo",
  "ocr.title": "AI photo capture",
  "ocr.sourceDesc": "Snap or upload a photo of the question — the AI reads it for you.",
  "ocr.takePhoto": "Take photo",
  "ocr.takePhotoHint": "Opens your camera",
  "ocr.gallery": "Upload from gallery",
  "ocr.galleryHint": "Pick an existing image",
  "ocr.dropTitle": "Drag & drop an image here",
  "ocr.dropHint": "PNG or JPG, question and options in one frame",
  "ocr.dropActive": "Drop the image to continue",
  "ocr.errType": "That file is not an image.",
  "ocr.cropTitle": "Crop the question",
  "ocr.cropDesc": "Drag the corner handles to isolate the question and its options.",
  "ocr.rotate": "Rotate",
  "ocr.zoom": "Zoom",
  "ocr.reset": "Reset crop",
  "ocr.back": "Back",
  "ocr.process": "Crop & process with AI",
  "ocr.scanning": "AI is scanning question, choices, and subject…",
  "ocr.scanStep1": "Enhancing image and detecting text blocks",
  "ocr.scanStep2": "Reading the question stem",
  "ocr.scanStep3": "Separating choices A–E",
  "ocr.scanStep4": "Detecting subject and topic",
  "ocr.verifyTitle": "Check the extracted question",
  "ocr.verifyDesc": "Edit anything the AI misread, then save it to your vault.",
  "ocr.questionText": "Question text",
  "ocr.choices": "Choices",
  "ocr.correctAnswer": "Correct answer",
  "ocr.pickCorrect": "Select the correct choice",
  "ocr.detected": "Auto-detected",
  "ocr.subject": "Subject",
  "ocr.topic": "Topic",
  "ocr.difficulty": "Difficulty",
  "ocr.notes": "Why did you get it wrong?",
  "ocr.rescan": "Re-crop",
  "ocr.save": "Save to Mistake Vault",
  "ocr.errQuestion": "The question text cannot be empty.",
  "ocr.errCorrect": "Confirm which choice is correct.",
  "ocr.saved": "Scanned question saved",
  "ocr.savedDesc": "Extracted by AI and added to your vault.",
  "ocr.confidence": "OCR confidence {n}%",


  "nav.profile": "Profile",
  "profile.plan": "Pro student",
  "profile.account": "Account details",
  "profile.accountSub": "Your login information and contact details.",
  "profile.email": "Email",
  "profile.type": "Account type",
  "profile.phone": "Phone number",
  "profile.optional": "optional",
  "profile.since": "Member since",
  "profile.changePw": "Change password",
  "profile.changePwDesc": "Use at least 8 characters with a number or symbol.",
  "profile.currentPw": "Current password",
  "profile.newPw": "New password",
  "profile.confirmPw": "Confirm new password",
  "profile.savePw": "Update password",
  "profile.pwErrShort": "Password is too short.",
  "profile.pwErrMatch": "The new passwords do not match.",
  "profile.pwUpdated": "Password updated",
  "profile.pwUpdatedDesc": "Use your new password the next time you sign in.",
  "profile.usage": "Streak & usage",
  "profile.usageSub": "How consistently you have been clearing your mistakes.",
  "profile.daysActive": "Days active",
  "profile.daysActiveHint": "total days you used QuizForge",
  "profile.consecutive": "Consecutive days",
  "profile.consecutiveHint": "current streak — keep it alive",
  "profile.security": "Security & account management",
  "profile.securitySub": "Sign out of this device or permanently remove your account.",
  "profile.logout": "Log out",
  "profile.logoutConfirm": "Log out of QuizForge?",
  "profile.logoutConfirmDesc": "You will need to sign in again to reach your Mistake Vault.",
  "profile.loggedOut": "You have been logged out",
  "profile.delete": "Delete account",
  "profile.deleteConfirm": "Delete your account permanently?",
  "profile.deleteConfirmDesc":
    "This removes your vault, XP and streak history. This action cannot be undone.",
  "profile.deleteQueued": "Account deletion requested",
  "profile.deleteQueuedDesc": "Your data will be erased within 30 days.",
};


type Key = keyof typeof en;

const tr: Record<Key, string> = {
  "nav.dashboard": "Panel",
  "nav.vault": "Defter",
  "nav.practice": "Pratik",
  "nav.ranks": "Sıralama",
  "brand.tagline": "Yanlış Defteri",
  "side.coach": "Sokratik Koç",
  "side.coachLine": "Cevabı alma. Bir sonraki soruyu al.",
  "header.welcome": "Tekrar hoş geldin,",
  "header.level": "Seviye",
  "header.xp": "XP",
  "header.day": "Gün",
  "lang.label": "Dil",
  "lang.en": "English",
  "lang.tr": "Türkçe",

  "dash.openMistakes": "Açık yanlışlar",
  "dash.openMistakesHint": "defterinde bekliyor",
  "dash.mastered": "Öğrenildi",
  "dash.masteredHint": "tamamen çözüldü",
  "dash.weeklyXp": "Haftalık XP",
  "dash.weeklyXpHint": "bu hafta #4 sıradasın",
  "dash.weakness": "Zayıf konu analizi",
  "dash.weaknessSub": "Konuya göre doğruluk — en düşükler günlük tekrarını belirler.",
  "dash.attempts": "deneme kaydedildi",
  "dash.resolvedChart": "Çözülen sorular",
  "dash.last7": "Son 7 gün",
  "dash.quickActions": "Hızlı işlemler",
  "dash.upload": "Yanlış soru yükle",
  "dash.startReview": "Günlük tekrarı başlat",
  "dash.reviewToast": "Günlük tekrar başladı (+20 XP)",
  "dash.reviewToastDesc": "En zayıf konunla başlıyoruz: Kinematik.",
  "dash.generateQuiz": "Deneme quizi oluştur",
  "dash.quizToast": "Deneme quizi oluşturuldu",
  "dash.quizToastDesc": "En zayıf 3 konundan karışık 8 soru.",
  "dash.todayFocus": "Bugünün odağı",
  "dash.socraticMode": "Sokratik mod",
  "dash.focusLine":
    "{n} çözülmemiş yanlışın var. Fizik — Kinematik %40 doğrulukla en zayıf konun.",
  "dash.openVault": "Yanlış Defterini aç →",

  "vault.title": "Yanlış Defteri",
  "vault.count": "{b} sorudan {a} tanesi",
  "vault.addNew": "Yeni ekle",
  "vault.search": "Soru ara…",
  "vault.subject": "Ders",
  "vault.difficulty": "Zorluk",
  "vault.status": "Durum",
  "vault.all": "Tüm {label}",
  "vault.allSubject": "Tüm dersler",
  "vault.allDifficulty": "Tüm zorluklar",
  "vault.allStatus": "Tüm durumlar",
  "vault.empty": "Bu filtrelere uyan yanlış yok. Filtreleri temizlemeyi dene.",
  "vault.yourNote": "Notun: ",
  "vault.meta": "{n} deneme · eklendi {d}",
  "vault.practice": "Pratik yap",
  "vault.reopen": "Yeniden aç",
  "vault.markMastered": "Öğrenildi işaretle",
  "vault.masteredBadge": "Öğrenildi",

  "practice.title": "Sokratik pratik",
  "practice.progress": "Tekrar sıranda {n} sorudan {i}. soru",
  "practice.variation": "Yapay zekâ varyasyonu",
  "practice.fromVault": "Defterden",
  "practice.emptyVault": "Defterin boş — pratiğe başlamak için bir yanlış soru ekle.",
  "practice.hint": "İpucu",
  "practice.getHint": "Sokratik ipucu al",
  "practice.noMoreHints": "Başka ipucu yok — artık kendin akıl yürütmeyi dene.",
  "practice.hintUnlocked": "Sokratik ipucu açıldı",
  "practice.hintUnlockedDesc": "Bir sonrakini istemeden önce iyice düşün.",
  "practice.generateSimilar": "Benzer soru üret",
  "practice.similarToast": "Benzer soru üretildi",
  "practice.similarToastDesc": "Aynı kavram, farklı sayılar ve senaryo.",
  "practice.submit": "Cevabı gönder",
  "practice.correctToast": "Doğru! +{n} XP",
  "practice.wrongToast": "Olmadı — aşağıdaki detaylı çözümü oku.",
  "practice.correct": "Doğru cevap",
  "practice.incorrect": "Yanlış cevap",
  "practice.originalNote": "İlk notun:",
  "practice.next": "Sonraki soru",
  "practice.tryVariation": "Varyasyon dene",
  "practice.masteredToast": "Öğrenildi olarak işaretlendi (+50 XP)",

  "lb.title": "Haftalık sıralama",
  "lb.resets": "Pazar gece yarısı sıfırlanır",
  "lb.season": "Sezon 4",
  "lb.student": "Öğrenci",
  "lb.xp": "XP",
  "lb.resolved": "Çözülen",
  "lb.streak": "Seri",
  "lb.you": "Sen",
  "lb.badges": "Başarı rozetleri",
  "lb.badgesSub": "Yeni soru çözerek değil, yanlışlarını gidererek kazanılır.",
  "lb.unlocked": "Kazanıldı",
  "lb.complete": "%{n} tamamlandı",

  "add.title": "Yanlış soru ekle",
  "add.desc": "Yanlışı tazeyken kaydet — ve neden yanlış yaptığını yaz.",
  "add.typeIt": "Yazarak",
  "add.uploadImage": "Görsel yükle",
  "add.question": "Soru",
  "add.questionPlaceholder": "Yanlış yaptığın soruyu yapıştır veya yaz…",
  "add.imageLabel": "Soru görseli",
  "add.imagePlaceholder": "Sorunun fotoğrafını seçmek için dokun",
  "add.subject": "Ders",
  "add.difficulty": "Zorluk",
  "add.topic": "Konu",
  "add.topicPlaceholder": "örn. Kinematik",
  "add.why": "Neden yanlış yaptın?",
  "add.whyPlaceholder": "örn. Logaritmanın tanım kümesini kontrol etmeyi unuttum.",
  "add.cancel": "Vazgeç",
  "add.save": "Deftere kaydet",
  "add.errQuestion": "Önce soruyu yaz (en az birkaç kelime).",
  "add.errImage": "Sorunun görselini seç.",
  "add.saved": "Yanlış Defterine eklendi",
  "add.savedDesc": "Sokratik Koç bunun için ipuçları hazırladı.",
  "add.fromImage": "Görselden alınan soru",

  "nav.profile": "Profil",
  "profile.plan": "Pro öğrenci",
  "profile.account": "Hesap bilgileri",
  "profile.accountSub": "Giriş bilgilerin ve iletişim detayların.",
  "profile.email": "E-posta",
  "profile.type": "Hesap türü",
  "profile.phone": "Telefon numarası",
  "profile.optional": "isteğe bağlı",
  "profile.since": "Üyelik başlangıcı",
  "profile.changePw": "Şifre değiştir",
  "profile.changePwDesc": "En az 8 karakter kullan; bir rakam veya sembol ekle.",
  "profile.currentPw": "Mevcut şifre",
  "profile.newPw": "Yeni şifre",
  "profile.confirmPw": "Yeni şifreyi doğrula",
  "profile.savePw": "Şifreyi güncelle",
  "profile.pwErrShort": "Şifre çok kısa.",
  "profile.pwErrMatch": "Yeni şifreler eşleşmiyor.",
  "profile.pwUpdated": "Şifre güncellendi",
  "profile.pwUpdatedDesc": "Bir sonraki girişinde yeni şifreni kullan.",
  "profile.usage": "Seri ve kullanım",
  "profile.usageSub": "Yanlışlarını ne kadar düzenli giderdiğin.",
  "profile.daysActive": "Aktif gün",
  "profile.daysActiveHint": "QuizForge'u kullandığın toplam gün",
  "profile.consecutive": "Ardışık gün",
  "profile.consecutiveHint": "mevcut serin — devam ettir",
  "profile.security": "Güvenlik ve hesap yönetimi",
  "profile.securitySub": "Bu cihazdan çıkış yap veya hesabını kalıcı olarak sil.",
  "profile.logout": "Çıkış yap",
  "profile.logoutConfirm": "QuizForge'dan çıkış yapılsın mı?",
  "profile.logoutConfirmDesc": "Yanlış Defterine ulaşmak için tekrar giriş yapman gerekecek.",
  "profile.loggedOut": "Çıkış yapıldı",
  "profile.delete": "Hesabı sil",
  "profile.deleteConfirm": "Hesabın kalıcı olarak silinsin mi?",
  "profile.deleteConfirmDesc":
    "Bu işlem defterini, XP'ni ve seri geçmişini siler. Geri alınamaz.",
  "profile.deleteQueued": "Hesap silme talebi alındı",
  "profile.deleteQueuedDesc": "Verilerin 30 gün içinde silinecek.",
};


const DICT: Record<Lang, Record<string, string>> = { en, tr };

/* ------------------------------------------------------------------ */
/* Data term + content translations                                    */
/* ------------------------------------------------------------------ */

const TERMS: Record<string, string> = {
  Math: "Matematik",
  Physics: "Fizik",
  Chemistry: "Kimya",
  Biology: "Biyoloji",
  History: "Tarih",
  Easy: "Kolay",
  Medium: "Orta",
  Hard: "Zor",
  Unresolved: "Çözülmedi",
  Mastered: "Öğrenildi",
  Kinematics: "Kinematik",
  Logarithms: "Logaritma",
  Stoichiometry: "Stokiyometri",
  Genetics: "Genetik",
  Derivatives: "Türev",
  "Acids & Bases": "Asitler ve Bazlar",
  "Industrial Revolution": "Sanayi Devrimi",
  General: "Genel",
  Mon: "Pzt",
  Tue: "Sal",
  Wed: "Çar",
  Thu: "Per",
  Fri: "Cum",
  Sat: "Cmt",
  Sun: "Paz",
};

type MistakeContent = {
  question: string;
  choices: string[];
  hints: string[];
  solution: string;
  notes: string;
};

const TR_MISTAKES: Record<string, MistakeContent> = {
  m1: {
    question:
      "Bir araba duraksız olarak sabit ivmeyle harekete geçiyor ve 5 s'de 100 m yol alıyor. İvmesi nedir?",
    choices: ["4 m/s²", "8 m/s²", "10 m/s²", "20 m/s²"],
    hints: [
      "İlk hız sıfırken yolu, zamanı ve ivmeyi hangi kinematik denklem birbirine bağlar?",
      "x = v₀t + ½at² ile başla. Araba duruştan kalkıyorsa ilk terime ne olur?",
      "a = 2x / t² şeklinde düzenle. Şimdi x = 100 m ve t = 5 s koy.",
    ],
    solution:
      "v₀ = 0 olduğundan x = ½at² → a = 2x/t² = 2(100)/25 = 8 m/s². Yaygın hata a = x/t² kullanıp 4 m/s² bulmaktır.",
    notes: "Yer değiştirme denklemindeki ½ çarpanını unuttum.",
  },
  m2: {
    question: "x'i bul: log₂(x) + log₂(x - 2) = 3",
    choices: ["x = 2", "x = 4", "x = -2", "x = 4 ve x = -2"],
    hints: [
      "Aynı tabandaki iki logaritmanın toplamı hangi tek logaritmaya eşittir?",
      "log₂(x(x-2)) = 3 ise x(x-2) = 2³ olur. İkinci dereceden denklemi yaz.",
      "x² - 2x - 8 = 0, kökleri 4 ve -2. Logaritmanın tanım kümesi hangi köke izin verir?",
    ],
    solution:
      "x² - 2x - 8 = 0 → x = 4 veya x = -2. Tanım kümesi x > 2 gerektirdiğinden yalnızca x = 4 geçerlidir.",
    notes: "Tanım kümesini kontrol etmeyi unutup negatif kökleri kabul ediyorum.",
  },
  m3: {
    question:
      "4 g H₂, fazla O₂ ile tamamen tepkimeye girdiğinde kaç gram H₂O oluşur? (H = 1, O = 16)",
    choices: ["18 g", "36 g", "72 g", "9 g"],
    hints: [
      "Önce tepkimeyi yaz ve denkleştir: 2H₂ + O₂ → 2H₂O.",
      "M(H₂) = 2 g/mol kullanarak 4 g H₂'yi mole çevir.",
      "H₂ : H₂O mol oranı 1 : 1 ve M(H₂O) = 18 g/mol.",
    ],
    solution: "n(H₂) = 4/2 = 2 mol → n(H₂O) = 2 mol → m = 2 × 18 = 36 g.",
    notes: "H₂ yerine H'nin mol kütlesini kullandım.",
  },
  m4: {
    question:
      "Heterozigot iki uzun bitki (Tt) çaprazlanıyor. Yavruların kaçta kaçının kısa olması beklenir?",
    choices: ["0", "1/4", "1/2", "3/4"],
    hints: [
      "Tt × Tt için Punnett karesini çiz.",
      "Kısa olmak çekinik fenotiptir — hangi genotip bunu verir?",
      "Dört kutudan kaç tanesi tt say.",
    ],
    solution: "Tt × Tt sonucu 1 TT : 2 Tt : 1 tt verir. Yalnızca tt kısadır, yani 1/4.",
    notes: "Genotip oranıyla fenotip oranını karıştırdım.",
  },
  m5: {
    question:
      "Bir top yukarı doğru 20 m/s ile atılıyor. Atanın eline dönmesi ne kadar sürer? (g = 10 m/s²)",
    choices: ["2 s", "4 s", "5 s", "10 s"],
    hints: [
      "En yüksek noktada topun hızı nedir?",
      "Tepeye çıkış süresi: t = v₀/g.",
      "Hareket simetrik olduğundan toplam süre çıkış süresinin iki katıdır.",
    ],
    solution: "t_çıkış = 20/10 = 2 s, toplam = 2 × 2 = 4 s.",
    notes: "Sadece tepeye çıkma süresini hesapladım.",
  },
  m6: {
    question: "f(x) = x² · sin(x) fonksiyonunun türevi nedir?",
    choices: ["2x·cos(x)", "2x·sin(x) + x²·cos(x)", "x²·cos(x)", "2x·sin(x) - x²·cos(x)"],
    hints: [
      "Fonksiyon iki fonksiyonun çarpımı — hangi kural uygulanır?",
      "Çarpım kuralı: (uv)' = u'v + uv'.",
      "Burada u = x² yani u' = 2x, v = sin(x) yani v' = cos(x).",
    ],
    solution: "f'(x) = 2x·sin(x) + x²·cos(x).",
    notes: "Çarpım kuralı yerine zincir kuralını uyguladım.",
  },
  m7: {
    question: "Hangi buluş fabrikaların nehirlerden uzakta kurulmasını en doğrudan sağlamıştır?",
    choices: ["İplik eğirme makinesi", "Buhar makinesi", "Telgraf", "Çırçır makinesi"],
    hints: [
      "Bu buluştan önce fabrikalar güç için su çarklarına bağlıydı.",
      "Yakıt taşınabilen her yere kurulabilen bir güç kaynağı düşün.",
      "1770'lerde James Watt tarafından geliştirilmiştir.",
    ],
    solution:
      "Buhar makinesi fabrikaları su gücünden kurtardı ve şehirlerde kurulmalarına imkân verdi.",
    notes: "Güç kaynaklarıyla tekstil makinelerini karıştırdım.",
  },
  m8: {
    question: "0,001 M HCl çözeltisinin pH'ı kaçtır?",
    choices: ["1", "2", "3", "11"],
    hints: [
      "HCl kuvvetli bir asittir — ne kadarı iyonlaşır?",
      "Yani [H⁺] = 0,001 M = 10⁻³ M.",
      "pH = -log[H⁺].",
    ],
    solution: "pH = -log(10⁻³) = 3.",
    notes: "pH yerine pOH hesapladım.",
  },
};

const TR_VARIANTS: Record<string, { question: (m: Mistake) => string; choices: string[]; solution: string }> = {
  Physics: {
    question: (m) =>
      m.question
        .replace("A train accelerates uniformly from rest and covers", "Bir tren duruştan sabit ivmeyle harekete geçiyor ve")
        .replace("What is its acceleration?", "İvmesi nedir?")
        .replace(" m in ", " m yolu ")
        .replace(" s. ", " s'de alıyor. "),
    choices: ["1.2 m/s²", "2.8 m/s²", "3.5 m/s²", "5.0 m/s²"],
    solution: "x = ½at² kullan → a = 2x/t². Yeni sayıları yerine koy ve ½ çarpanını unutma.",
  },
  Math: {
    question: (m) => m.question.replace("Solve for x:", "x'i bul:"),
    choices: ["x = 3", "x = 9", "x = -1", "Çözüm yok"],
    solution: "Logaritmaları birleştir, ikinci dereceden denklemi çöz, tanım kümesi dışındaki kökleri ele.",
  },
  Chemistry: {
    question: (m) =>
      m.question
        .replace("How many grams of NH₃ form when", "Fazla N₂ ile")
        .replace("g of H₂ reacts with excess N₂?", "g H₂ tepkimeye girdiğinde kaç gram NH₃ oluşur?"),
    choices: ["17 g", "34 g", "51 g", "68 g"],
    solution: "N₂ + 3H₂ → 2NH₃ denkleştir, gramı mole çevir, 3:2 oranını uygula.",
  },
  Biology: {
    question: () =>
      "Heterozigot bir bitki (Tt) kısa bir bitkiyle (tt) çaprazlanıyor. Yavruların kaçta kaçı kısadır?",
    choices: ["0", "1/4", "1/2", "3/4"],
    solution: "Tt × tt çaprazı 1 Tt : 1 tt verir, yani yavruların yarısı kısadır.",
  },
  History: {
    question: () =>
      "Sanayi Devrimi sırasında malların taşınmasını en doğrudan hızlandıran gelişme hangisidir?",
    choices: ["Buharlı lokomotif", "Çıkrık makinesi (mule)", "Bessemer yöntemi", "Ucuz posta"],
    solution: "Buharlı lokomotifli demiryolu taşımacılığı, mal ve hammadde dağıtımını kökten değiştirdi.",
  },
};

const TR_BADGES: Record<string, { name: string; description: string }> = {
  b1: { name: "Yanlış Kırıcı", description: "Defterindeki 25 soruyu öğren" },
  b2: { name: "10 Gün Serisi", description: "10 günlük tekrar serisini sürdür" },
  b3: { name: "Gece Kuşu", description: "Gece yarısından sonra 15 tekrar tamamla" },
  b4: { name: "Sokratik Bilge", description: "20 soruyu sadece ilk ipucuyla çöz" },
  b5: { name: "Formül Ustası", description: "Tüm Kinematik yanlışlarını öğren" },
  b6: { name: "Hafta Sonu Savaşçısı", description: "6 hafta sonu üst üste tekrar yap" },
};

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

type I18n = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
  term: (value: string) => string;
  localizeMistake: (m: Mistake) => Mistake;
  badgeText: (id: string, name: string, description: string) => { name: string; description: string };
};

const Ctx = createContext<I18n | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "tr" || saved === "en") setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: Key, vars?: Record<string, string | number>) => {
      let s = DICT[lang]?.[key] ?? en[key] ?? String(key);
      if (vars) {
        for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      }
      return s;
    },
    [lang],
  );

  const term = useCallback(
    (value: string) => (lang === "tr" ? (TERMS[value] ?? value) : value),
    [lang],
  );

  const localizeMistake = useCallback(
    (m: Mistake): Mistake => {
      if (lang !== "tr") return m;
      const variantMatch = /^(.*)-var-\d+$/.exec(m.id);
      if (variantMatch) {
        const v = TR_VARIANTS[m.subject];
        const baseId = variantMatch[1] ?? "";
        const baseHints = TR_MISTAKES[baseId]?.hints ?? m.hints;
        if (!v) return m;
        return {
          ...m,
          topic: TERMS[m.topic] ?? m.topic,
          question: v.question(m),
          choices: v.choices,
          hints: baseHints,
          solution: v.solution,
        };
      }
      const c = TR_MISTAKES[m.id];
      if (!c) return { ...m, topic: TERMS[m.topic] ?? m.topic };
      return {
        ...m,
        topic: TERMS[m.topic] ?? m.topic,
        question: c.question,
        choices: c.choices,
        hints: c.hints,
        solution: c.solution,
        notes: c.notes,
      };
    },
    [lang],
  );

  const badgeText = useCallback(
    (id: string, name: string, description: string) =>
      lang === "tr" ? (TR_BADGES[id] ?? { name, description }) : { name, description },
    [lang],
  );

  const value = useMemo<I18n>(
    () => ({ lang, setLang, t, term, localizeMistake, badgeText }),
    [lang, setLang, t, term, localizeMistake, badgeText],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const FALLBACK: I18n = {
  lang: "en",
  setLang: () => {},
  t: (key, vars) => {
    let s: string = en[key] ?? String(key);
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  },
  term: (value) => value,
  localizeMistake: (m) => m,
  badgeText: (_id, name, description) => ({ name, description }),
};

export function useI18n() {
  return useContext(Ctx) ?? FALLBACK;
}

