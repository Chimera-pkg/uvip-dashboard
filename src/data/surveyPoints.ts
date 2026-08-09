export interface SurveyPoint {
  key: string;
  thumbnail: string;
  name: string;
  area: string;
  city: string;
  uvi: number;
  uviLevel: "high" | "medium" | "low";
  date: string;
  time: string;
  lat: string;
  lng: string;
}

export const surveyPoints: SurveyPoint[] = [
  {
    key: "sp-1",
    thumbnail: "",
    name: "Jl. Ijen",
    area: "Klojen, Malang",
    city: "Malang",
    uvi: 8.14,
    uviLevel: "high",
    date: "Today",
    time: "10:24",
    lat: "-7.9792",
    lng: "112.6301",
  },
  {
    key: "sp-2",
    thumbnail: "",
    name: "Jl. Soekarno Hatta",
    area: "Lowokwaru, Malang",
    city: "Malang",
    uvi: 5.42,
    uviLevel: "medium",
    date: "Today",
    time: "10:18",
    lat: "-7.9543",
    lng: "112.6370",
  },
  {
    key: "sp-3",
    thumbnail: "",
    name: "Kayutangan Heritage",
    area: "Klojen, Malang",
    city: "Malang",
    uvi: 8.91,
    uviLevel: "high",
    date: "Today",
    time: "10:09",
    lat: "-7.9786",
    lng: "112.6324",
  },
  {
    key: "sp-4",
    thumbnail: "",
    name: "Jl. Kawi",
    area: "Klojen, Malang",
    city: "Malang",
    uvi: 4.76,
    uviLevel: "low",
    date: "Today",
    time: "09:58",
    lat: "-7.9881",
    lng: "112.6335",
  },
  {
    key: "sp-5",
    thumbnail: "",
    name: "Jl. Veteran",
    area: "Lowokwaru, Malang",
    city: "Malang",
    uvi: 6.03,
    uviLevel: "medium",
    date: "Today",
    time: "09:52",
    lat: "-7.9948",
    lng: "112.6462",
  },
];
