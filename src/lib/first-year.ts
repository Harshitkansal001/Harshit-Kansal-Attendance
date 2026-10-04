import type { Slot, SlotOption } from "./timetable";

export const FIRST_YEAR_SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;
export type FirstYearSection = (typeof FIRST_YEAR_SECTIONS)[number];
export const SECTION_CLASSROOMS: Record<FirstYearSection, string> = {
  A: "B2", B: "G1", C: "G2", D: "F1", E: "F2", F: "B2", G: "G1", H: "G2", I: "F1",
};

type Row = { day: number; start: string; end?: string; code: string; teacher: string; group?: 1 | 2 | 3; label?: string };
type GroupRow = { day: number; start: string; end: string; options: SlotOption[] };
type Entry = Row | GroupRow;
const c = (day: number, start: string, code: string, teacher: string, end?: string): Row => ({ day, start, end, code, teacher });
const g = (day: number, start: string, end: string, options: SlotOption[]): GroupRow => ({ day, start, end, options });
const o = (code: string, teacher: string, group: 1 | 2 | 3): SlotOption => ({ code, teacher, group });
const GROUP_CYCLE = (day: number, start: string, end: string, teachers: [string, string, string], codes = ["CS-111", "PH-102", "HS-102"]): GroupRow => g(day, start, end, codes.map((code, i) => o(code, teachers[i]!, (i + 1) as 1 | 2 | 3)));

const schedules: Record<FirstYearSection, Entry[]> = {
  A: [
    ...[1, 2].flatMap((d) => [c(d,"09:00","MA-111","Tanya"),c(d,"10:00","PH-101","Navneet"),c(d,"11:00","ME-101","Nitish"),c(d,"12:00","CS-111","Keshav"),GROUP_CYCLE(d,"16:00","18:00",["Keshav","Navneet","Manoj"])]),
    c(3,"09:00","MA-111","Tanya"),c(3,"10:00","PH-101","Navneet"),c(3,"14:00","ME-101","Nitish"),c(3,"15:00","ME-102","K Dass"),c(3,"16:00","ME-102","K Dass","18:00"),
    GROUP_CYCLE(4,"09:00","11:00",["Keshav","Navneet","Manoj"]),c(4,"14:00","HS-103","Spriha"),c(4,"15:00","HS-101","Manoj"),
    c(5,"14:00","HS-103","Spriha"),c(5,"15:00","HS-101","Manoj"),
  ],
  B: [
    g(1,"09:00","11:00",[o("CS-111","Vidyotma",1),o("PH-102","Suresh",2),o("HS-102","P. Puri",3)]),c(1,"11:00","ME-102","K Dass","13:00"),c(1,"14:00","ME-101","Deepak"),c(1,"15:00","ME-102","K Dass"),
    g(2,"09:00","11:00",[o("CS-111","Vidyotma",1),o("PH-102","Shailja",2),o("HS-102","P. Puri",3)]),g(2,"11:00","13:00",[o("CS-111","Vidyotma",3),o("PH-102","Navneet",2),o("HS-102","P. Puri",1)]),c(2,"14:00","HS-103","Vishal"),c(2,"15:00","CS-111","Vidyotma"),
    c(3,"09:00","MA-111","Pawan K"),c(3,"10:00","PH-101","B. Das"),c(3,"14:00","HS-103","Vishal"),c(3,"15:00","CS-111","Vidyotma"),
    c(4,"09:00","ME-101","Deepak"),c(4,"10:00","HS-101","P. Puri"),c(4,"11:00","MA-111","Pawan K"),c(4,"12:00","PH-101","B. Das"),
    c(5,"09:00","ME-101","Deepak"),c(5,"10:00","HS-101","P. Puri"),c(5,"11:00","MA-111","Pawan K"),c(5,"12:00","PH-101","B. Das"),
  ],
  C: [
    ...[1,2].flatMap((d) => [c(d,"09:00","MA-111","R. K. Vats"),c(d,"10:00","PH-101","Abhishek"),c(d,"11:00","ME-101","Shania")]),c(1,"12:00","CS-111","Priyanka"),c(2,"12:00","ME-102","K Dass"),c(2,"16:00","ME-102","Param","18:00"),
    c(3,"09:00","MA-111","R. K. Vats"),c(3,"10:00","PH-101","Abhishek"),c(3,"14:00","ME-101","Shania"),c(3,"15:00","CS-111","Priyanka"),c(3,"16:00","HS-101","Zareena"),
    g(4,"11:00","13:00",[o("CS-111","Priyanka",2),o("PH-102","Navneet",3),o("HS-102","Zareena",1)]),c(4,"15:00","HS-103","Vishal"),GROUP_CYCLE(4,"16:00","18:00",["Priyanka","S Kaur","Zareena"]),
    c(5,"14:00","HS-101","Zareena"),c(5,"15:00","HS-103","Vishal"),g(5,"16:00","18:00",[o("CS-111","Priyanka",3),o("PH-102","Suresh",1),o("HS-102","Zareena",2)]),
  ],
  D: [
    g(1,"11:00","13:00",[o("CS-111","Khalid",1),o("PH-102","Shailja",2),o("HS-102","Sumita",3)]),c(1,"14:00","ME-101","Abhishek"),c(1,"15:00","CS-111","Khalid"),c(1,"16:00","HS-102","Sumita","18:00"),
    c(2,"14:00","HS-101","Sumita"),c(2,"15:00","HS-103","Spriha"),
    g(3,"09:00","11:00",[o("CS-111","Khalid",2),o("PH-102","Shailja",1)]),c(3,"11:00","MA-111","Shilpa"),c(3,"12:00","PH-101","Shailja"),c(3,"14:00","HS-101","Sumita"),c(3,"15:00","HS-103","Spriha"),
    c(4,"09:00","ME-101","Abhishek"),c(4,"10:00","ME-102","Ankush"),c(4,"11:00","MA-111","Shilpa"),c(4,"12:00","PH-101","Shailja"),g(4,"14:00","16:00",[o("CS-111","Khalid",3),o("PH-102","Shailja",2),o("HS-102","Sumita",1)]),c(4,"16:00","ME-102","Ankush","18:00"),
    c(5,"09:00","ME-101","Abhishek"),c(5,"10:00","CS-111","Khalid"),c(5,"11:00","MA-111","Shilpa"),c(5,"12:00","PH-101","Shailja"),
  ],
  E: [
    c(1,"14:00","ME-101","Rohit"),c(1,"15:00","PH-101","S Kaur"),c(2,"14:00","HS-103","SK Negi"),c(2,"15:00","HS-101","Sumita"),
    c(3,"09:00","MA-111","Soniya"),c(3,"10:00","PH-101","S Kaur"),g(3,"11:00","13:00",[o("CS-111","Akanksha",1),o("PH-102","S Kaur",3),o("HS-102","Sumita",2)]),c(3,"14:00","HS-103","SK Negi"),c(3,"15:00","HS-101","Sumita"),g(3,"16:00","18:00",[o("CS-111","Akanksha",3),o("PH-102","S Kaur",2),o("HS-102","Sumita",1)]),
    c(4,"09:00","ME-101","Rohit"),c(4,"10:00","CS-111","Akanksha"),c(4,"11:00","MA-111","Soniya"),c(4,"12:00","PH-101","S Kaur"),
    c(5,"09:00","ME-101","Rohit"),c(5,"10:00","CS-111","Akanksha"),c(5,"11:00","MA-111","Soniya"),c(5,"12:00","ME-102","Ankush"),g(5,"14:00","16:00",[o("CS-111","Akanksha",2),o("PH-102","S Kaur",3),o("HS-102","Sunita",1)]),c(5,"16:00","ME-102","Ankush","18:00"),
  ],
  F: [
    g(1,"09:00","11:00",[o("CY-102","Varun",1),o("EE-102","Ashok K, Avinash",2),o("CS-111","Jyoti",3)]),g(1,"11:00","13:00",[o("CY-102","K S Ghosh",3),o("EE-102","R Chandel, Ravi",1),o("CS-111","Jyoti",2)]),c(1,"14:00","CS-111","Jyoti"),c(1,"15:00","EN-101","Adya"),c(1,"16:00","MB-101","Kamboj"),
    g(2,"09:00","11:00",[o("CY-102","K.S Ghosh",2),o("EE-102","Krishan K, Vishal",3),o("CS-111","Jyoti",1)]),c(2,"14:00","CS-111","Jyoti"),c(2,"15:00","EN-101","Adya"),
    c(3,"11:00","MA-111","Maan"),c(3,"12:00","CY-101","Raj K"),c(3,"14:00","CE-101","Harshita","15:00"),c(3,"15:00","CE-101(P)","Harshita, Anita, Amit","17:00"),
    c(4,"09:00","EE-101","Ravi"),c(4,"10:00","EC-101","Deepanshu"),c(4,"11:00","MA-111","Maan"),c(4,"12:00","CY-101","Raj K"),
    c(5,"09:00","EE-101","Ravi"),c(5,"10:00","EC-101","Deepanshu"),c(5,"11:00","MA-111","Maan"),c(5,"12:00","CY-101","Raj K"),
  ],
  G: [
    ...[1,2].flatMap((d) => [c(d,"09:00","EE-101","Neeraj"),c(d,"10:00","EC-101","Abhishek"),c(d,"11:00","MA-111","Monika"),c(d,"12:00","CY-101","J. Prakash")]),
    c(1,"15:00","CE-101","Rajat","16:00"),c(1,"16:00","CE-101(P)","Rajat, Ram Raj, Amit","18:00"),
    g(3,"11:00","13:00",[o("CS-111","M. Nayyer",1),o("CY-102","J. Prakash",2),o("EE-102","Angira, Neeraj",3)]),c(3,"09:00","MA-111","Monika"),c(3,"10:00","CY-101","J. Prakash"),
    g(4,"09:00","11:00",[o("CS-111","M. Nayyer",3),o("CY-102","J. Prakash",1),o("EE-102","M Bharti, Abhishek",2)]),g(4,"11:00","13:00",[o("CS-111","M. Nayyer",2),o("CY-102","P. Awasthi",3),o("EE-102","Krishan K, Vishal",1)]),c(4,"14:00","CS-111","M. Nayyer"),c(4,"15:00","EN-101","Ravin"),
    c(5,"14:00","CS-111","M. Nayyer"),c(5,"15:00","EN-101","Ravin"),c(5,"16:00","MB-101","Richa"),
  ],
  H: [
    c(1,"14:00","CS-111","Pratibha"),c(1,"15:00","EE-101","Vishal"),g(1,"16:00","18:00",[o("CY-102","J. Kuchlyan",2),o("CS-111","Pratibha",1),o("EE-101","Vishal",3)]),
    g(2,"11:00","13:00",[o("CY-102","J. Kuchlyan",2),o("EE-102","Saurabh, Avinash",3),o("CS-111","Pratibha",1)]),c(2,"14:00","CS-111","Pratibha"),c(2,"15:00","EE-101","Vishal"),c(2,"16:00","MB-101","Pratima"),
    g(3,"09:00","11:00",[o("CY-102","J. Kuchlyan",1),o("EE-102","Aman, Neeraj",2),o("CS-111","Pratibha",2)]),c(3,"11:00","MA-111","Shruti"),c(3,"12:00","CY-101","J. Kuchlyan"),g(3,"14:00","16:00",[o("CY-102","Arun",3),o("EE-102","Rakesh, Neeraj",1),o("CS-111","Pratibha",3)]),
    c(4,"09:00","EN-101","Ravin"),c(4,"10:00","EC-101","Abhishek"),c(4,"11:00","MA-111","Shruti"),c(4,"12:00","CY-101","J. Kuchlyan"),c(4,"15:00","CE-101","Shubham","16:00"),c(4,"16:00","CE-101(P)","Shubham, Sumit, Rajat","18:00"),
    c(5,"09:00","EN-101","Ravin"),c(5,"10:00","EC-101","Abhishek"),c(5,"11:00","MA-111","Shruti"),c(5,"12:00","CY-101","J. Kuchlyan"),
  ],
  I: [
    ...[1,2].flatMap((d) => [c(d,"09:00","EE-101","Abhishek"),c(d,"10:00","EC-101","Apoorva"),c(d,"11:00","MA-111","Suket"),c(d,"12:00","CY-101","Varun")]),c(2,"15:00","CE-101","Anita","16:00"),c(2,"16:00","CE-101(P)","Anita, Ekta, Rajat","18:00"),
    c(3,"09:00","MA-111","Suket"),c(3,"10:00","CY-101","Varun"),g(3,"16:00","18:00",[o("CS-111","Shobhna",1),o("CY-102","Varun",2),o("EE-102","CS Prasad, Avinash",3)]),
    c(4,"14:00","EN-101","Neha"),c(4,"15:00","CS-111","Shobhna"),g(4,"16:00","18:00",[o("CS-111","Shobhna",3),o("CY-102","Varun",1),o("EE-102","Avijit, Avinash",2)]),
    g(5,"09:00","11:00",[o("CS-111","Shobhna",2),o("CY-102","Varun",3),o("EE-102","Avijit, Avinash",1)]),c(5,"14:00","EN-101","Neha"),c(5,"15:00","CS-111","Shobhna"),c(5,"16:00","MB-101","Pratima"),
  ],
};

export function buildFirstYearTimetable(section: string): Slot[] {
  const entries = schedules[section as FirstYearSection];
  if (!entries) return [];
  return entries.map((entry, index) => {
    const base = { id: `fy-${section}-${entry.day}-${entry.start.replace(":", "")}-${index}`, day: entry.day, start: entry.start, end: entry.end ?? addHour(entry.start) };
    return "options" in entry
      ? { ...base, options: entry.options }
      : { ...base, options: [{ code: entry.code, teacher: entry.teacher, ...(entry.group ? { group: entry.group } : {}), ...(entry.label ? { label: entry.label } : {}) }] };
  });
}
function addHour(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${String((h ?? 0) + 1).padStart(2,"0")}:${String(m ?? 0).padStart(2,"0")}`;
}
