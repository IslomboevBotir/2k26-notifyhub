import { Group, User } from "./recipients";

/**
 * Namunaviy qabul qiluvchilar bazasi (universitet portali misolida).
 *
 *   Hammasi
 *   ├── 3-kurs
 *   │   ├── 301-guruh: Ali Valiyev
 *   │   └── 302-guruh: Vali Karimov
 *   ├── 4-kurs
 *   │   ├── 401-guruh: Sardor Toshmatov, Madina Yusupova
 *   │   └── 402-guruh: Jasur Rahimov
 *   └── O'qituvchilar: Nodira Azimova
 *
 * Statistikada xatolar ham ko'rinishi uchun ataylab "nosoz" ma'lumotlar bor:
 * Vali Karimovning Telegrami yo'q, Madina Yusupovaning telefon raqami noto'g'ri.
 */
export function buildDefaultDirectory(): Group {
  const ali = new User("Ali Valiyev", "+998901112233", "@ali_valiyev");
  const vali = new User("Vali Karimov", "+998907778899");
  const sardor = new User("Sardor Toshmatov", "+998935554433", "@sardor_t");
  const madina = new User("Madina Yusupova", "90-123", "@madina_y");
  const jasur = new User("Jasur Rahimov", "+998946667788", "@jasur_r");
  const nodira = new User("Nodira Azimova", "+998971234567", "@nodira_teacher");

  const course3 = new Group("3-kurs", [
    new Group("301-guruh", [ali]),
    new Group("302-guruh", [vali]),
  ]);
  const course4 = new Group("4-kurs", [
    new Group("401-guruh", [sardor, madina]),
    new Group("402-guruh", [jasur]),
  ]);
  const teachers = new Group("O'qituvchilar", [nodira]);

  return new Group("Hammasi", [course3, course4, teachers]);
}
