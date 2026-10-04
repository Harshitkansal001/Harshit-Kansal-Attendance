import type { Slot, SlotOption } from "./timetable";

export const FIRST_YEAR_SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;
export type FirstYearSection = (typeof FIRST_YEAR_SECTIONS)[number];
export const SECTION_CLASSROOMS: Record<FirstYearSection, string> = {
  A: "B2",
  B: "G1",
  C: "G2",
  D: "F1",
  E: "F2",
  F: "B2",
  G: "G1",
  H: "G2",
  I: "F1",
};

type SingleClass = {
  day: number;
  start: string;
  end?: string;
  code: string;
  teacher: string;
  group?: 1 | 2 | 3;
  label?: string;
};
type GroupClass = { day: number; start: string; end: string; options: SlotOption[] };
type TimetableEntry = SingleClass | GroupClass;

// These helpers keep the section schedules below easy to scan and edit.
const singleClass = (
  day: number,
  start: string,
  code: string,
  teacher: string,
  end?: string,
): SingleClass => ({
  day,
  start,
  end,
  code,
  teacher,
});
const groupClass = (
  day: number,
  start: string,
  end: string,
  options: SlotOption[],
): GroupClass => ({
  day,
  start,
  end,
  options,
});
const groupOption = (code: string, teacher: string, group: 1 | 2 | 3): SlotOption => ({
  code,
  teacher,
  group,
});
const rotatingGroups = (
  day: number,
  start: string,
  end: string,
  teachers: [string, string, string],
  codes = ["CS-111", "PH-102", "HS-102"],
): GroupClass =>
  groupClass(
    day,
    start,
    end,
    codes.map((code, i) => groupOption(code, teachers[i]!, (i + 1) as 1 | 2 | 3)),
  );

// One weekly schedule per section. Days use 1 = Monday through 5 = Friday.
const schedules: Record<FirstYearSection, TimetableEntry[]> = {
  A: [
    ...[1, 2].flatMap((d) => [
      singleClass(d, "09:00", "MA-111", "Tanya"),
      singleClass(d, "10:00", "PH-101", "Navneet"),
      singleClass(d, "11:00", "ME-101", "Nitish"),
      singleClass(d, "12:00", "CS-111", "Keshav"),
      rotatingGroups(d, "16:00", "18:00", ["Keshav", "Navneet", "Manoj"]),
    ]),
    singleClass(3, "09:00", "MA-111", "Tanya"),
    singleClass(3, "10:00", "PH-101", "Navneet"),
    singleClass(3, "14:00", "ME-101", "Nitish"),
    singleClass(3, "15:00", "ME-102", "K Dass"),
    singleClass(3, "16:00", "ME-102", "K Dass", "18:00"),
    rotatingGroups(4, "09:00", "11:00", ["Keshav", "Navneet", "Manoj"]),
    singleClass(4, "14:00", "HS-103", "Spriha"),
    singleClass(4, "15:00", "HS-101", "Manoj"),
    singleClass(5, "14:00", "HS-103", "Spriha"),
    singleClass(5, "15:00", "HS-101", "Manoj"),
  ],
  B: [
    groupClass(1, "09:00", "11:00", [
      groupOption("CS-111", "Vidyotma", 1),
      groupOption("PH-102", "Suresh", 2),
      groupOption("HS-102", "P. Puri", 3),
    ]),
    singleClass(1, "11:00", "ME-102", "K Dass", "13:00"),
    singleClass(1, "14:00", "ME-101", "Deepak"),
    singleClass(1, "15:00", "ME-102", "K Dass"),
    groupClass(2, "09:00", "11:00", [
      groupOption("CS-111", "Vidyotma", 1),
      groupOption("PH-102", "Shailja", 2),
      groupOption("HS-102", "P. Puri", 3),
    ]),
    groupClass(2, "11:00", "13:00", [
      groupOption("CS-111", "Vidyotma", 3),
      groupOption("PH-102", "Navneet", 2),
      groupOption("HS-102", "P. Puri", 1),
    ]),
    singleClass(2, "14:00", "HS-103", "Vishal"),
    singleClass(2, "15:00", "CS-111", "Vidyotma"),
    singleClass(3, "09:00", "MA-111", "Pawan K"),
    singleClass(3, "10:00", "PH-101", "B. Das"),
    singleClass(3, "14:00", "HS-103", "Vishal"),
    singleClass(3, "15:00", "CS-111", "Vidyotma"),
    singleClass(4, "09:00", "ME-101", "Deepak"),
    singleClass(4, "10:00", "HS-101", "P. Puri"),
    singleClass(4, "11:00", "MA-111", "Pawan K"),
    singleClass(4, "12:00", "PH-101", "B. Das"),
    singleClass(5, "09:00", "ME-101", "Deepak"),
    singleClass(5, "10:00", "HS-101", "P. Puri"),
    singleClass(5, "11:00", "MA-111", "Pawan K"),
    singleClass(5, "12:00", "PH-101", "B. Das"),
  ],
  C: [
    ...[1, 2].flatMap((d) => [
      singleClass(d, "09:00", "MA-111", "R. K. Vats"),
      singleClass(d, "10:00", "PH-101", "Abhishek"),
      singleClass(d, "11:00", "ME-101", "Shania"),
    ]),
    singleClass(1, "12:00", "CS-111", "Priyanka"),
    singleClass(2, "12:00", "ME-102", "K Dass"),
    singleClass(2, "16:00", "ME-102", "Param", "18:00"),
    singleClass(3, "09:00", "MA-111", "R. K. Vats"),
    singleClass(3, "10:00", "PH-101", "Abhishek"),
    singleClass(3, "14:00", "ME-101", "Shania"),
    singleClass(3, "15:00", "CS-111", "Priyanka"),
    singleClass(3, "16:00", "HS-101", "Zareena"),
    groupClass(4, "11:00", "13:00", [
      groupOption("CS-111", "Priyanka", 2),
      groupOption("PH-102", "Navneet", 3),
      groupOption("HS-102", "Zareena", 1),
    ]),
    singleClass(4, "15:00", "HS-103", "Vishal"),
    rotatingGroups(4, "16:00", "18:00", ["Priyanka", "S Kaur", "Zareena"]),
    singleClass(5, "14:00", "HS-101", "Zareena"),
    singleClass(5, "15:00", "HS-103", "Vishal"),
    groupClass(5, "16:00", "18:00", [
      groupOption("CS-111", "Priyanka", 3),
      groupOption("PH-102", "Suresh", 1),
      groupOption("HS-102", "Zareena", 2),
    ]),
  ],
  D: [
    groupClass(1, "11:00", "13:00", [
      groupOption("CS-111", "Khalid", 1),
      groupOption("PH-102", "Shailja", 2),
      groupOption("HS-102", "Sumita", 3),
    ]),
    singleClass(1, "14:00", "ME-101", "Abhishek"),
    singleClass(1, "15:00", "CS-111", "Khalid"),
    singleClass(1, "16:00", "HS-102", "Sumita", "18:00"),
    singleClass(2, "14:00", "HS-101", "Sumita"),
    singleClass(2, "15:00", "HS-103", "Spriha"),
    groupClass(3, "09:00", "11:00", [
      groupOption("CS-111", "Khalid", 2),
      groupOption("PH-102", "Shailja", 1),
    ]),
    singleClass(3, "11:00", "MA-111", "Shilpa"),
    singleClass(3, "12:00", "PH-101", "Shailja"),
    singleClass(3, "14:00", "HS-101", "Sumita"),
    singleClass(3, "15:00", "HS-103", "Spriha"),
    singleClass(4, "09:00", "ME-101", "Abhishek"),
    singleClass(4, "10:00", "ME-102", "Ankush"),
    singleClass(4, "11:00", "MA-111", "Shilpa"),
    singleClass(4, "12:00", "PH-101", "Shailja"),
    groupClass(4, "14:00", "16:00", [
      groupOption("CS-111", "Khalid", 3),
      groupOption("PH-102", "Shailja", 2),
      groupOption("HS-102", "Sumita", 1),
    ]),
    singleClass(4, "16:00", "ME-102", "Ankush", "18:00"),
    singleClass(5, "09:00", "ME-101", "Abhishek"),
    singleClass(5, "10:00", "CS-111", "Khalid"),
    singleClass(5, "11:00", "MA-111", "Shilpa"),
    singleClass(5, "12:00", "PH-101", "Shailja"),
  ],
  E: [
    singleClass(1, "14:00", "ME-101", "Rohit"),
    singleClass(1, "15:00", "PH-101", "S Kaur"),
    singleClass(2, "14:00", "HS-103", "SK Negi"),
    singleClass(2, "15:00", "HS-101", "Sumita"),
    singleClass(3, "09:00", "MA-111", "Soniya"),
    singleClass(3, "10:00", "PH-101", "S Kaur"),
    groupClass(3, "11:00", "13:00", [
      groupOption("CS-111", "Akanksha", 1),
      groupOption("PH-102", "S Kaur", 3),
      groupOption("HS-102", "Sumita", 2),
    ]),
    singleClass(3, "14:00", "HS-103", "SK Negi"),
    singleClass(3, "15:00", "HS-101", "Sumita"),
    groupClass(3, "16:00", "18:00", [
      groupOption("CS-111", "Akanksha", 3),
      groupOption("PH-102", "S Kaur", 2),
      groupOption("HS-102", "Sumita", 1),
    ]),
    singleClass(4, "09:00", "ME-101", "Rohit"),
    singleClass(4, "10:00", "CS-111", "Akanksha"),
    singleClass(4, "11:00", "MA-111", "Soniya"),
    singleClass(4, "12:00", "PH-101", "S Kaur"),
    singleClass(5, "09:00", "ME-101", "Rohit"),
    singleClass(5, "10:00", "CS-111", "Akanksha"),
    singleClass(5, "11:00", "MA-111", "Soniya"),
    singleClass(5, "12:00", "ME-102", "Ankush"),
    groupClass(5, "14:00", "16:00", [
      groupOption("CS-111", "Akanksha", 2),
      groupOption("PH-102", "S Kaur", 3),
      groupOption("HS-102", "Sunita", 1),
    ]),
    singleClass(5, "16:00", "ME-102", "Ankush", "18:00"),
  ],
  F: [
    groupClass(1, "09:00", "11:00", [
      groupOption("CY-102", "Varun", 1),
      groupOption("EE-102", "Ashok K, Avinash", 2),
      groupOption("CS-111", "Jyoti", 3),
    ]),
    groupClass(1, "11:00", "13:00", [
      groupOption("CY-102", "K S Ghosh", 3),
      groupOption("EE-102", "R Chandel, Ravi", 1),
      groupOption("CS-111", "Jyoti", 2),
    ]),
    singleClass(1, "14:00", "CS-111", "Jyoti"),
    singleClass(1, "15:00", "EN-101", "Adya"),
    singleClass(1, "16:00", "MB-101", "Kamboj"),
    groupClass(2, "09:00", "11:00", [
      groupOption("CY-102", "K.S Ghosh", 2),
      groupOption("EE-102", "Krishan K, Vishal", 3),
      groupOption("CS-111", "Jyoti", 1),
    ]),
    singleClass(2, "14:00", "CS-111", "Jyoti"),
    singleClass(2, "15:00", "EN-101", "Adya"),
    singleClass(3, "11:00", "MA-111", "Maan"),
    singleClass(3, "12:00", "CY-101", "Raj K"),
    singleClass(3, "14:00", "CE-101", "Harshita", "15:00"),
    singleClass(3, "15:00", "CE-101(P)", "Harshita, Anita, Amit", "17:00"),
    singleClass(4, "09:00", "EE-101", "Ravi"),
    singleClass(4, "10:00", "EC-101", "Deepanshu"),
    singleClass(4, "11:00", "MA-111", "Maan"),
    singleClass(4, "12:00", "CY-101", "Raj K"),
    singleClass(5, "09:00", "EE-101", "Ravi"),
    singleClass(5, "10:00", "EC-101", "Deepanshu"),
    singleClass(5, "11:00", "MA-111", "Maan"),
    singleClass(5, "12:00", "CY-101", "Raj K"),
  ],
  G: [
    ...[1, 2].flatMap((d) => [
      singleClass(d, "09:00", "EE-101", "Neeraj"),
      singleClass(d, "10:00", "EC-101", "Abhishek"),
      singleClass(d, "11:00", "MA-111", "Monika"),
      singleClass(d, "12:00", "CY-101", "J. Prakash"),
    ]),
    singleClass(1, "15:00", "CE-101", "Rajat", "16:00"),
    singleClass(1, "16:00", "CE-101(P)", "Rajat, Ram Raj, Amit", "18:00"),
    groupClass(3, "11:00", "13:00", [
      groupOption("CS-111", "M. Nayyer", 1),
      groupOption("CY-102", "J. Prakash", 2),
      groupOption("EE-102", "Angira, Neeraj", 3),
    ]),
    singleClass(3, "09:00", "MA-111", "Monika"),
    singleClass(3, "10:00", "CY-101", "J. Prakash"),
    groupClass(4, "09:00", "11:00", [
      groupOption("CS-111", "M. Nayyer", 3),
      groupOption("CY-102", "J. Prakash", 1),
      groupOption("EE-102", "M Bharti, Abhishek", 2),
    ]),
    groupClass(4, "11:00", "13:00", [
      groupOption("CS-111", "M. Nayyer", 2),
      groupOption("CY-102", "P. Awasthi", 3),
      groupOption("EE-102", "Krishan K, Vishal", 1),
    ]),
    singleClass(4, "14:00", "CS-111", "M. Nayyer"),
    singleClass(4, "15:00", "EN-101", "Ravin"),
    singleClass(5, "14:00", "CS-111", "M. Nayyer"),
    singleClass(5, "15:00", "EN-101", "Ravin"),
    singleClass(5, "16:00", "MB-101", "Richa"),
  ],
  H: [
    singleClass(1, "14:00", "CS-111", "Pratibha"),
    singleClass(1, "15:00", "EE-101", "Vishal"),
    groupClass(1, "16:00", "18:00", [
      groupOption("CY-102", "J. Kuchlyan", 2),
      groupOption("CS-111", "Pratibha", 1),
      groupOption("EE-101", "Vishal", 3),
    ]),
    groupClass(2, "11:00", "13:00", [
      groupOption("CY-102", "J. Kuchlyan", 2),
      groupOption("EE-102", "Saurabh, Avinash", 3),
      groupOption("CS-111", "Pratibha", 1),
    ]),
    singleClass(2, "14:00", "CS-111", "Pratibha"),
    singleClass(2, "15:00", "EE-101", "Vishal"),
    singleClass(2, "16:00", "MB-101", "Pratima"),
    groupClass(3, "09:00", "11:00", [
      groupOption("CY-102", "J. Kuchlyan", 1),
      groupOption("EE-102", "Aman, Neeraj", 2),
      groupOption("CS-111", "Pratibha", 2),
    ]),
    singleClass(3, "11:00", "MA-111", "Shruti"),
    singleClass(3, "12:00", "CY-101", "J. Kuchlyan"),
    groupClass(3, "14:00", "16:00", [
      groupOption("CY-102", "Arun", 3),
      groupOption("EE-102", "Rakesh, Neeraj", 1),
      groupOption("CS-111", "Pratibha", 3),
    ]),
    singleClass(4, "09:00", "EN-101", "Ravin"),
    singleClass(4, "10:00", "EC-101", "Abhishek"),
    singleClass(4, "11:00", "MA-111", "Shruti"),
    singleClass(4, "12:00", "CY-101", "J. Kuchlyan"),
    singleClass(4, "15:00", "CE-101", "Shubham", "16:00"),
    singleClass(4, "16:00", "CE-101(P)", "Shubham, Sumit, Rajat", "18:00"),
    singleClass(5, "09:00", "EN-101", "Ravin"),
    singleClass(5, "10:00", "EC-101", "Abhishek"),
    singleClass(5, "11:00", "MA-111", "Shruti"),
    singleClass(5, "12:00", "CY-101", "J. Kuchlyan"),
  ],
  I: [
    ...[1, 2].flatMap((d) => [
      singleClass(d, "09:00", "EE-101", "Abhishek"),
      singleClass(d, "10:00", "EC-101", "Apoorva"),
      singleClass(d, "11:00", "MA-111", "Suket"),
      singleClass(d, "12:00", "CY-101", "Varun"),
    ]),
    singleClass(2, "15:00", "CE-101", "Anita", "16:00"),
    singleClass(2, "16:00", "CE-101(P)", "Anita, Ekta, Rajat", "18:00"),
    singleClass(3, "09:00", "MA-111", "Suket"),
    singleClass(3, "10:00", "CY-101", "Varun"),
    groupClass(3, "16:00", "18:00", [
      groupOption("CS-111", "Shobhna", 1),
      groupOption("CY-102", "Varun", 2),
      groupOption("EE-102", "CS Prasad, Avinash", 3),
    ]),
    singleClass(4, "14:00", "EN-101", "Neha"),
    singleClass(4, "15:00", "CS-111", "Shobhna"),
    groupClass(4, "16:00", "18:00", [
      groupOption("CS-111", "Shobhna", 3),
      groupOption("CY-102", "Varun", 1),
      groupOption("EE-102", "Avijit, Avinash", 2),
    ]),
    groupClass(5, "09:00", "11:00", [
      groupOption("CS-111", "Shobhna", 2),
      groupOption("CY-102", "Varun", 3),
      groupOption("EE-102", "Avijit, Avinash", 1),
    ]),
    singleClass(5, "14:00", "EN-101", "Neha"),
    singleClass(5, "15:00", "CS-111", "Shobhna"),
    singleClass(5, "16:00", "MB-101", "Pratima"),
  ],
};

export function buildFirstYearTimetable(section: string): Slot[] {
  const entries = schedules[section as FirstYearSection];
  if (!entries) return [];
  return entries.map((entry, index) => {
    const base = {
      id: `fy-${section}-${entry.day}-${entry.start.replace(":", "")}-${index}`,
      day: entry.day,
      start: entry.start,
      end: entry.end ?? addHour(entry.start),
    };
    return "options" in entry
      ? { ...base, options: entry.options }
      : {
          ...base,
          options: [
            {
              code: entry.code,
              teacher: entry.teacher,
              ...(entry.group ? { group: entry.group } : {}),
              ...(entry.label ? { label: entry.label } : {}),
            },
          ],
        };
  });
}
function addHour(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${String((h ?? 0) + 1).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
}
