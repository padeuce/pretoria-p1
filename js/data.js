// Static event content. Today's fixtures were synced from the official schedule on 2026-07-29.
export const API_CONFIG = {
  liveScoreEndpoint: "",
  refreshInterval: 15000,
  useMockData: true,
  timeout: 8000
};

export const eventData = {
  id: "pretoria-p1-2026", name: "Pretoria P1", competition: "Premier Padel",
  city: "Pretoria", country: "South Africa", currentDay: 4, status: "live",
  officialUrl: "https://premierpadel.com/en/tournaments-detail/pretoria-p1"
};

export const liveMatches = [{
  id: "match-101", status: "live", court: "Centre Court", division: "Men",
  round: "Quarter-final", format: "Best of 3", currentSet: "Second set",
  updatedAt: new Date().toISOString(),
  teams: [
    { names: ["Arturo Coello", "Agustín Tapia"], sets: [6, 3], current: 30, serving: true },
    { names: ["Ale Galán", "Fede Chingotto"], sets: [4, 2], current: 15, serving: false }
  ]
}];

export const fixtures = [
  {id:"18236",time:"Followed by",court:"Centre Court",division:"Men",round:"Round of 32",a:"Arturo Coello / Agustin Tapia",b:"Valentino Libaak / Gonzalo Gabriel Alfonso",status:"Starting Soon"},
  {id:"18235",time:"Not before 18:00",court:"Centre Court",division:"Men",round:"Round of 32",a:"Enrique Goenaga / Manuel Castaño",b:"Jorge Nieto Ruiz / Jon Sanz",status:"Starting Soon"},
  {id:"18243",time:"Followed by",court:"Court 2",division:"Men",round:"Round of 32",a:"Pablo Reina Ambel / Marcel Font",b:"Eduardo Alonso / Aimar Goñi Lacabe",status:"Starting Soon"},
  {id:"18248",time:"Followed by",court:"Court 3",division:"Men",round:"Round of 32",a:"Alejandro Arroyo / Jose Jimenez Casas",b:"Antonio Fernandez / Ignacio Vilariño Gestoso",status:"Starting Soon"},
  {id:"18249",time:"Followed by",court:"Court 3",division:"Men",round:"Round of 32",a:"Jairo Bautista / Inigo Jofre",b:"Maximiliano Sanchez Blasco / Daniel Santigosa Sastre",status:"Starting Soon"},
  {id:"18230",time:"09:00",court:"Centre Court",division:"Women",round:"Round of 32",a:"Beatriz Caldera Sanchez / Carmen Goenaga Garcia",b:"Tamara Icardo Alcorisa / Claudia Jensen",status:"Completed",scoreA:"5  2",scoreB:"7  6",winner:"b",duration:"1h 37m"},
  {id:"18232",time:"Followed by",court:"Centre Court",division:"Men",round:"Round of 32",a:"Jose Antonio Diestro / Marc Sintes Villalonga",b:"Francisco Navarro / Martin Di Nenno",status:"Completed",scoreA:"2  1",scoreB:"6  6",winner:"b",duration:"50m"},
  {id:"18231",time:"Followed by",court:"Centre Court",division:"Men",round:"Round of 32",a:"Jeronimo Gonzalez / Lucas Campagnolo",b:"Javier Ruiz Gonzalez / Santiago Jose Pineda Cabello",status:"Completed",scoreA:"6⁵  6  6",scoreB:"7  2  3",winner:"a",duration:"1h 50m"},
  {id:"18233",time:"Followed by",court:"Centre Court",division:"Men",round:"Round of 32",a:"Maximiliano Sanchez Aguero / Juan Ignacio Rubini",b:"Alejandro Galan / Federico Chingotto",status:"Completed",scoreA:"2  6⁶",scoreB:"6  7",winner:"b",duration:"1h 07m"},
  {id:"18237",time:"09:00",court:"Court 2",division:"Women",round:"Round of 32",a:"Julieta Evangelina Bidahorria / Marta Caparros Maldonado",b:"Araceli Martinez / Laura Luján Rodríguez",status:"Completed",scoreA:"6  6",scoreB:"3  2",winner:"a",duration:"1h 16m"},
  {id:"18241",time:"Followed by",court:"Court 2",division:"Men",round:"Round of 32",a:"Pablo Garcia Rodrigo / Leonel Daniel Aguirre",b:"Javier Barahona / Alex Chozas",status:"Completed",scoreA:"6  6",scoreB:"2  4",winner:"a",duration:"1h 03m"},
  {id:"18238",time:"Followed by",court:"Court 2",division:"Men",round:"Round of 32",a:"Juan Cruz Belluati / Ignacio Piotto Albornoz",b:"Juanlu Esbri / Carlos Daniel Gutierrez",status:"Completed",scoreA:"6  3  4",scoreB:"4  6  6",winner:"b",duration:"1h 33m"},
  {id:"18239",time:"Followed by",court:"Court 2",division:"Men",round:"Round of 32",a:"Alejandro Ruiz Granados / Javier Garcia",b:"David Gala / Enzo Jensen Sirvent",status:"Completed",scoreA:"6  6",scoreB:"2  3",winner:"a",duration:"1h 03m"},
  {id:"18240",time:"Followed by",court:"Court 2",division:"Men",round:"Round of 32",a:"Javier Garrido / Lucas Bergamini",b:"Victor Ruiz / Mario Ortega",status:"Completed",scoreA:"6  6",scoreB:"2  1",winner:"a",duration:"54m"},
  {id:"18244",time:"09:00",court:"Court 3",division:"Women",round:"Round of 32",a:"Julia Polo Bautista / Marina Lobo",b:"Carla Fernandez Gonzalez / Nerea Guerra Santana",status:"Completed",scoreA:"6  3  6",scoreB:"2  6  3",winner:"a",duration:"1h 48m"},
  {id:"18245",time:"Followed by",court:"Court 3",division:"Women",round:"Round of 32",a:"Barbara Las Heras / Daria Kucheriavaia",b:"Marta Barrera De La Fuente / Jana Montes Cabruja",status:"Completed",scoreA:"3  7  6³",scoreB:"6  6⁵  7",winner:"b",duration:"2h 26m"},
  {id:"18246",time:"Followed by",court:"Court 3",division:"Men",round:"Round of 32",a:"Alvaro Montiel Caruso / Flavio Abbate",b:"Marc Quilez / Federico Mouriño",status:"Completed",scoreA:"6  6",scoreB:"3  4",winner:"a",duration:"1h 08m"},
  {id:"18247",time:"Followed by",court:"Court 3",division:"Men",round:"Round of 32",a:"Denis Tomas Perino / Facundo Dominguez",b:"Juan Tello / Maximiliano Arce Simo",status:"Completed",scoreA:"4  3",scoreB:"6  6",winner:"b",duration:"1h 21m"}
];

export const seededPairs = [
  {
    division: "Men",
    pairs: [
      {seed:1,players:[{name:"Agustin Tapia",country:"ARG"},{name:"Arturo Coello",country:"ESP"}],points:42674},
      {seed:2,players:[{name:"Alejandro Galan",country:"ESP"},{name:"Federico Chingotto",country:"ARG"}],points:34788},
      {seed:3,players:[{name:"Leandro Augsburger",country:"ARG"},{name:"Juan Lebron",country:"ESP"}],points:15704},
      {seed:4,players:[{name:"Miguel Yanguas",country:"ESP"},{name:"Franco Stupaczuk",country:"ARG"}],points:13569},
      {seed:5,players:[{name:"Martin Di Nenno",country:"ARG"},{name:"Francisco Navarro",country:"ESP"}],points:10923},
      {seed:6,players:[{name:"Jorge Nieto",country:"ESP"},{name:"Jon Sanz",country:"ESP"}],points:10628},
      {seed:7,players:[{name:"Javier Leal",country:"ESP"},{name:"Francisco Guerrero",country:"ESP"}],points:7873},
      {seed:8,players:[{name:"Jeronimo Gonzalez",country:"ESP"},{name:"Lucas Campagnolo",country:"BRA"}],points:7616},
      {seed:9,players:[{name:"Javier Garrido",country:"ESP"},{name:"Lucas Bergamini",country:"BRA"}],points:6618},
      {seed:10,players:[{name:"Juan Tello",country:"ARG"},{name:"Maximiliano Arce Simo",country:"ARG"}],points:5314}
    ]
  },
  {
    division: "Ladies",
    pairs: [
      {seed:1,players:[{name:"Gemma Triay Pons",country:"ESP"},{name:"Delfina Brea Senesi",country:"ARG"}],points:36514},
      {seed:2,players:[{name:"Beatriz Gonzalez Fernandez",country:"ESP"},{name:"Paula Josemaria Martin",country:"ESP"}],points:28743},
      {seed:3,players:[{name:"Ariana Sanchez Fallada",country:"ESP"},{name:"Andrea Ustero Prieto",country:"ESP"}],points:22496},
      {seed:4,players:[{name:"Claudia Fernandez Sanchez",country:"ESP"},{name:"Martina Calvo Santamaria",country:"ESP"}],points:15801},
      {seed:5,players:[{name:"Marta Ortega Gallego",country:"ESP"},{name:"Sofia Araujo",country:"POR"}],points:12948},
      {seed:6,players:[{name:"Tamara Icardo Alcorisa",country:"ESP"},{name:"Claudia Jensen",country:"ARG"}],points:12233},
      {seed:7,players:[{name:"Marina Guinart España",country:"ESP"},{name:"Alejandra Alonso De Villa",country:"ESP"}],points:8964},
      {seed:8,players:[{name:"Alejandra Salazar Bengoechea",country:"ESP"},{name:"Aranzazu Osoro Ulrich",country:"ARG"}],points:7615},
      {seed:9,players:[{name:"Jimena Velasco Postiguillo",country:"ESP"},{name:"Veronica Virseda",country:"ESP"}],points:6600},
      {seed:10,players:[{name:"Beatriz Caldera Sanchez",country:"ESP"},{name:"Carmen Goenaga Garcia",country:"ESP"}],points:6458}
    ]
  }
];

export const results = [
  {id:"r1",division:"Women",round:"Quarter-final",winner:0,teams:[{name:"Ari Sánchez / Paula Josemaría",sets:"6  6"},{name:"Gemma Triay / Claudia Fernández",sets:"4  3"}],duration:"1h 18m"},
  {id:"r2",division:"Men",round:"Round of 16",winner:1,teams:[{name:"Momo González / Edu Alonso",sets:"6  3  4"},{name:"Coki Nieto / Jon Sanz",sets:"4  6  6"}],duration:"2h 06m"},
  {id:"r3",division:"Women",round:"Round of 16",winner:0,teams:[{name:"Delfi Brea / Bea González",sets:"7  6"},{name:"Virginia Riera / Carmen Goenaga",sets:"5  2"}],duration:"1h 31m"},
  {id:"r4",division:"Men",round:"Round of 16",winner:0,teams:[{name:"Arturo Coello / Agustín Tapia",sets:"6  6"},{name:"Javi Garrido / Pablo Cardona",sets:"2  3"}],duration:"59m"}
];

export const behindScenes = [
  {
    category:"Premier Padel · Reel",
    caption:"Remember his name 🧠 @pabloo.ra_96",
    time:"29 Jul",
    url:"https://www.instagram.com/premierpadel/reel/DbYt6-GONHk/",
    image:"assets/images/instagram-remember-his-name.jpg",
    alt:"Pablo Cardona points toward the camera on the Pretoria P1 court."
  },
  {
    category:"Premier Padel · Reel",
    caption:"IN-SANE 💥🤯 @manucastanoo",
    time:"29 Jul",
    url:"https://www.instagram.com/premierpadel/reel/DbYopjxOtHy/",
    image:"assets/images/instagram-insane-point.jpg",
    alt:"Manu Castaño plays an acrobatic padel shot beside the glass."
  },
  {
    category:"Premier Padel · Reel",
    caption:"🐎 If the Trojan Horse was a point.",
    time:"29 Jul",
    url:"https://www.instagram.com/premierpadel/reel/DbYk5yrKxUR/",
    image:"assets/images/instagram-trojan-horse.jpg",
    alt:"A padel player jumps across the net to reach a high ball."
  },
  {
    category:"Premier Padel · Carousel",
    caption:"Swipe to see who survived the three-set deciders ➡️🫨🇿🇦",
    time:"29 Jul",
    url:"https://www.instagram.com/premierpadel/p/DbYdNFUCgmF/",
    image:"assets/images/instagram-three-set-deciders.jpg",
    alt:"Close-up of a decorated padel racket at Pretoria P1."
  },
  {
    category:"Premier Padel · Reel",
    caption:"🏉 Who could make it in rugby? @cokinieto and @maxiarcesimo have their picks… Do you agree?",
    time:"29 Jul",
    url:"https://www.instagram.com/premierpadel/reel/DbYYM1SxXyN/",
    image:"assets/images/instagram-rugby-picks.jpg",
    alt:"A Premier Padel player answers a rugby question during an interview."
  }
];
