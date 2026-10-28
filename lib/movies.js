export const GENRES = [
  { id: "action", label: "Action", h: 25 },
  { id: "comedy", label: "Comedy", h: 85 },
  { id: "drama", label: "Drama", h: 255 },
  { id: "romance", label: "Romance", h: 350 },
  { id: "thriller", label: "Thriller", h: 200 },
  { id: "horror", label: "Horror", h: 300 },
  { id: "scifi", label: "Sci-Fi", h: 230 },
  { id: "animation", label: "Animation", h: 150 },
  { id: "sports", label: "Sports", h: 50 },
  { id: "family", label: "Family", h: 120 },
];

export const GENRE_BY_ID = Object.fromEntries(GENRES.map((g) => [g.id, g]));

const RAW = [
  ["paddington-2", "Paddington 2", 2017, "Paul King", "English", ["family", "comedy"], "Paddington is jailed for a theft he didn't commit and wins over the whole prison with marmalade and manners."],
  ["zindagi-na-milegi-dobara", "Zindagi Na Milegi Dobara", 2011, "Zoya Akhtar", "Hindi", ["comedy", "drama"], "Three old friends take a bachelor trip across Spain, with one adventure sport each that tests a fear."],
  ["little-miss-sunshine", "Little Miss Sunshine", 2006, "Jonathan Dayton, Valerie Faris", "English", ["comedy", "drama"], "A mismatched family crams into a yellow van to get a seven-year-old to a beauty pageant."],
  ["the-intouchables", "The Intouchables", 2011, "Olivier Nakache, Éric Toledano", "French", ["comedy", "drama"], "A wealthy man who uses a wheelchair hires an unlikely caregiver from the Paris suburbs, and both are changed."],
  ["dil-chahta-hai", "Dil Chahta Hai", 2001, "Farhan Akhtar", "Hindi", ["comedy", "drama", "romance"], "Three friends in their twenties drift apart and back together across love, Goa and growing up."],
  ["3-idiots", "3 Idiots", 2009, "Rajkumar Hirani", "Hindi", ["comedy", "drama"], "Two friends search for a third who vanished after engineering college, and recall how he taught them to learn."],
  ["queen", "Queen", 2013, "Vikas Bahl", "Hindi", ["comedy", "drama"], "Left at the altar days before her wedding, a young Delhi woman takes her honeymoon to Paris and Amsterdam alone."],
  ["taare-zameen-par", "Taare Zameen Par", 2007, "Aamir Khan", "Hindi", ["drama", "family"], "A teacher notices what everyone else misses about a struggling eight-year-old who sees letters differently."],
  ["coco", "Coco", 2017, "Lee Unkrich", "English", ["animation", "family"], "A boy who dreams of music slips into the Land of the Dead on Día de Muertos to find his family's secret."],
  ["inside-out", "Inside Out", 2015, "Pete Docter", "English", ["animation", "family", "comedy"], "Five emotions run an eleven-year-old girl's head while she copes with a move to a new city."],
  ["the-pursuit-of-happyness", "The Pursuit of Happyness", 2006, "Gabriele Muccino", "English", ["drama"], "A salesman and his young son lose their home, and he takes an unpaid internship that could change their lives."],
  ["barfi", "Barfi!", 2012, "Anurag Basu", "Hindi", ["romance", "comedy", "drama"], "A deaf and mute man in 1970s Darjeeling charms his way through love, mischief and a kidnapping tangle."],
  ["eternal-sunshine", "Eternal Sunshine of the Spotless Mind", 2004, "Michel Gondry", "English", ["romance", "scifi", "drama"], "After a breakup, two people choose to erase each other from memory and find it isn't so simple."],
  ["mad-max-fury-road", "Mad Max: Fury Road", 2015, "George Miller", "English", ["action", "scifi", "thriller"], "A tanker war rig barrels across the desert with fugitives and a warlord's army on its tail."],
  ["inception", "Inception", 2010, "Christopher Nolan", "English", ["scifi", "action", "thriller"], "A thief who steals secrets from dreams takes one last job: planting an idea instead."],
  ["parasite", "Parasite", 2019, "Bong Joon-ho", "Korean", ["thriller", "drama", "comedy"], "A poor family schemes its way into a wealthy household, and the plan starts to slip."],
  ["andhadhun", "Andhadhun", 2018, "Sriram Raghavan", "Hindi", ["thriller", "comedy"], "A pianist who pretends to be blind sees a crime he should have missed, and things spiral."],
  ["la-la-land", "La La Land", 2016, "Damien Chazelle", "English", ["romance", "drama"], "An aspiring actress and a jazz pianist fall in love in Los Angeles while chasing separate dreams."],
  ["before-sunrise", "Before Sunrise", 1995, "Richard Linklater", "English", ["romance", "drama"], "Two strangers meet on a train and spend one night walking and talking through Vienna."],
  ["the-notebook", "The Notebook", 2004, "Nick Cassavetes", "English", ["romance", "drama"], "A young couple's summer romance in the American South is told through an old man reading to a woman."],
  ["jab-we-met", "Jab We Met", 2007, "Imtiaz Ali", "Hindi", ["romance", "comedy"], "A heartbroken businessman and a talkative runaway meet on a train and take a long detour."],
  ["her", "Her", 2013, "Spike Jonze", "English", ["scifi", "romance", "drama"], "A lonely writer in near-future Los Angeles falls for his AI operating system."],
  ["get-out", "Get Out", 2017, "Jordan Peele", "English", ["horror", "thriller"], "A young Black photographer visits his girlfriend's family estate and notices something is wrong."],
  ["the-conjuring", "The Conjuring", 2013, "James Wan", "English", ["horror"], "Paranormal investigators Ed and Lorraine Warren help a family haunted in their Rhode Island farmhouse."],
  ["tumbbad", "Tumbbad", 2018, "Rahi Anil Barve", "Hindi", ["horror", "thriller"], "Folklore horror about a cursed village in Maharashtra and a man's hunger for hidden gold."],
  ["a-quiet-place", "A Quiet Place", 2018, "John Krasinski", "English", ["horror", "scifi", "thriller"], "A family lives in near-silence on a farm, because the creatures that hunt by sound are close."],
  ["interstellar", "Interstellar", 2014, "Christopher Nolan", "English", ["scifi", "drama"], "As Earth fails, a former pilot leads a crew through a wormhole to find a new home."],
  ["arrival", "Arrival", 2016, "Denis Villeneuve", "English", ["scifi", "drama"], "A linguist is brought in to find out why twelve alien ships have landed, and how to talk to them."],
  ["spirited-away", "Spirited Away", 2001, "Hayao Miyazaki", "Japanese", ["animation", "family"], "A girl wanders into a bathhouse for spirits and must work there to free her parents."],
  ["kikis-delivery-service", "Kiki's Delivery Service", 1989, "Hayao Miyazaki", "Japanese", ["animation", "family"], "A young witch moves to a seaside town for her year of training and starts a delivery service."],
  ["ratatouille", "Ratatouille", 2007, "Brad Bird", "English", ["animation", "family", "comedy"], "A Parisian rat with a gifted nose teams up with a clumsy kitchen worker to cook."],
  ["the-grand-budapest-hotel", "The Grand Budapest Hotel", 2014, "Wes Anderson", "English", ["comedy"], "A legendary concierge and his lobby boy get tangled in a stolen painting and a family fortune."],
  ["rocky", "Rocky", 1976, "John G. Avildsen", "English", ["sports", "drama"], "A small-time Philadelphia boxer gets a shot at the heavyweight title."],
  ["whiplash", "Whiplash", 2014, "Damien Chazelle", "English", ["drama"], "A young jazz drummer and a ruthless conductor push each other past the breaking point."],
  ["dangal", "Dangal", 2016, "Nitesh Tiwari", "Hindi", ["sports", "drama"], "A former wrestler trains his daughters to compete, against what the village expects."],
  ["lagaan", "Lagaan", 2001, "Ashutosh Gowariker", "Hindi", ["sports", "drama"], "Under colonial rule, villagers bet their tax on a cricket match against British officers."],
  ["chak-de-india", "Chak De! India", 2007, "Shimit Amin", "Hindi", ["sports", "drama"], "A disgraced hockey player coaches the Indian women's national team toward the World Cup."],
  ["the-dark-knight", "The Dark Knight", 2008, "Christopher Nolan", "English", ["action", "thriller"], "Batman, Gordon and Harvey Dent go after the mob, until the Joker turns Gotham into his stage."],
  ["rrr", "RRR", 2022, "S. S. Rajamouli", "Telugu", ["action", "drama"], "Two revolutionaries in 1920s India become close friends, then find themselves on opposite sides."],
  ["john-wick", "John Wick", 2014, "Chad Stahelski", "English", ["action", "thriller"], "A retired hitman returns to the underworld after thugs kill the dog his late wife left him."],
  ["mission-impossible-fallout", "Mission: Impossible – Fallout", 2018, "Christopher McQuarrie", "English", ["action", "thriller"], "Ethan Hunt and his team race to undo a mission gone wrong before plutonium reaches terrorists."],
  ["spider-man-into-the-spider-verse", "Spider-Man: Into the Spider-Verse", 2018, "Bob Persichetti, Peter Ramsey, Rodney Rothman", "English", ["animation", "action", "family"], "Miles Morales becomes Spider-Man and meets other Spider-people from across dimensions."],
  ["hera-pheri", "Hera Pheri", 2000, "Priyadarshan", "Hindi", ["comedy"], "Three broke Mumbai men get a wrong-number ransom call and try to cash in."],
  ["the-hangover", "The Hangover", 2009, "Todd Phillips", "English", ["comedy"], "Three friends wake up in Las Vegas after a bachelor party with no memory and a missing groom."],
  ["superbad", "Superbad", 2007, "Greg Mottola", "English", ["comedy"], "Two high school friends try to get alcohol for a party before graduation and end up in a very long night."],
  ["andaz-apna-apna", "Andaz Apna Apna", 1994, "Rajkumar Santoshi", "Hindi", ["comedy", "romance"], "Two slackers compete to win a rich heiress, unaware of the plot closing in around her."],
  ["knives-out", "Knives Out", 2019, "Rian Johnson", "English", ["comedy", "thriller"], "A detective investigates the death of a wealthy crime novelist and his scheming family."],
  ["baahubali-the-beginning", "Baahubali: The Beginning", 2015, "S. S. Rajamouli", "Telugu", ["action", "drama"], "A young man raised in a village climbs a great waterfall and learns he is heir to a lost kingdom."],
  ["pushpa-the-rise", "Pushpa: The Rise", 2021, "Sukumar", "Telugu", ["action", "drama"], "A labourer climbs the ranks of the red sandalwood smuggling trade in the forests of Seshachalam."],
  ["arjun-reddy", "Arjun Reddy", 2017, "Sandeep Reddy Vanga", "Telugu", ["romance", "drama"], "A brilliant, short-tempered surgeon spirals after losing the woman he loves."],
  ["eega", "Eega", 2012, "S. S. Rajamouli", "Telugu", ["action", "comedy"], "A murdered man is reborn as a housefly and sets out to take revenge on his killer."],
  ["magadheera", "Magadheera", 2009, "S. S. Rajamouli", "Telugu", ["action", "romance"], "A warrior's love story from a past life resurfaces when the reincarnated lovers meet again."],
  ["jersey", "Jersey", 2019, "Gowtham Tinnanuri", "Telugu", ["sports", "drama"], "A failed cricketer returns to the game in his thirties to keep a promise to his young son."],
  ["mahanati", "Mahanati", 2018, "Nag Ashwin", "Telugu", ["drama"], "The life of the actress Savitri, from child performer to one of Telugu cinema's biggest stars."],
  ["kalki-2898-ad", "Kalki 2898 AD", 2024, "Nag Ashwin", "Telugu", ["scifi", "action"], "In a far-future city, a bounty hunter and an expectant mother are pulled into a war that echoes the Mahabharata."],
  ["ala-vaikunthapurramuloo", "Ala Vaikunthapurramuloo", 2020, "Trivikram Srinivas", "Telugu", ["comedy", "drama"], "A man raised in a modest family finds out he was swapped at birth with a rich businessman's son."],
  ["sita-ramam", "Sita Ramam", 2022, "Hanu Raghavapudi", "Telugu", ["romance", "drama"], "A young woman sets out to deliver a love letter that a soldier wrote to her decades earlier."],
];

export const INDUSTRIES = [
  { id: "all", label: "All" },
  { id: "hollywood", label: "Hollywood" },
  { id: "bollywood", label: "Bollywood" },
  { id: "tollywood", label: "Tollywood" },
  { id: "world", label: "World" },
];

const industryOf = (language) =>
  language === "English" ? "hollywood" : language === "Hindi" ? "bollywood" : language === "Telugu" ? "tollywood" : "world";

export const MOVIES = RAW.map(([id, title, year, director, language, genres, blurb], n) => ({
  id, title, year, director, language, genres, blurb, n, industry: industryOf(language),
}));

export const MOVIE_BY_ID = Object.fromEntries(MOVIES.map((m) => [m.id, m]));
export const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Superb"];

// Other films ranked by shared genres, then same director, then same language.
export function similarTo(movie, limit = 10) {
  return MOVIES.filter((m) => m.id !== movie.id)
    .map((m) => ({
      m,
      score:
        m.genres.filter((g) => movie.genres.includes(g)).length * 3 +
        (m.director === movie.director ? 2 : 0) +
        (m.language === movie.language ? 1 : 0),
    }))
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score || a.m.n - b.m.n)
    .slice(0, limit)
    .map((x) => x.m);
}

// Streaming catalogues change by country and week, so link to live lookups instead of listing services that may be wrong.
export function watchLinks(movie) {
  const q = encodeURIComponent(`${movie.title} ${movie.year}`);
  return [
    { label: "Streaming options (JustWatch)", href: `https://www.justwatch.com/in/search?q=${encodeURIComponent(movie.title)}` },
    { label: "Search the web", href: `https://www.google.com/search?q=${encodeURIComponent("watch " + movie.title + " " + movie.year + " online")}` },
    { label: "Details on IMDb", href: `https://www.imdb.com/find/?q=${q}&s=tt` },
  ];
}
