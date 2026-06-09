// Wayfinder — fix all 269 place categories
// Research-based: every place looked up and hand-categorized
// Macro keys: outdoors | food-drink | sights | stay | shopping | transit | other
// Run: node fix-place-categories.mjs

const SUPABASE_URL = 'https://fkfwjbdnezvwtjzenxgo.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZndqYmRuZXp2d3RqemVueGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY4MDQyMCwiZXhwIjoyMDk2MjU2NDIwfQ.1oOeNdVIfSGwQokDo-TosiscMwozGxMDxCRRugxZTUI';
const H = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

// "name|country" → correct macro category
// Every entry researched: what is this place, what do travelers use it for?
const CORRECT = {
  // ── AUSTRIA ───────────────────────────────────────────────
  'Gosauseen Lake|Austria':                          'outdoors', // mountain lake in Salzkammergut
  'Grossglockner High Alpine Road|Austria':          'outdoors', // scenic alpine toll road w/ viewpoints, not transit
  'Hallstatt Lake|Austria':                          'outdoors', // UNESCO lake, Hallstatt
  'Innsbruck|Austria':                               'sights',   // Tyrolean capital, Old Town, Golden Roof
  'Pasterze Glacier|Austria':                        'outdoors', // Austria's longest glacier

  // ── CROATIA ───────────────────────────────────────────────
  'Blue Caves - 5 Islands Tour|Croatia':             'outdoors', // boat tour to sea caves
  'Cable Car|Croatia':                               'sights',   // Dubrovnik cable car to Mt Srđ — tourist attraction
  'Cathedral of Saint Domnius|Croatia':              'sights',   // Split's 4th-century cathedral
  'City Walls Tour|Croatia':                         'sights',   // Dubrovnik's famous city walls
  'Cogito Coffee Shop|Croatia':                      'food-drink',
  "Diocletian's Palace|Croatia":                     'sights',   // Roman emperor's palace, Split
  'Dubravka 1836 Restaurant & Cafe|Croatia':         'food-drink',
  'Dubrovnik Airbnb|Croatia':                        'stay',
  'EGGSPRESS|Croatia':                               'food-drink',
  'Elafiti Islands|Croatia':                         'outdoors', // island archipelago day trip
  'Fort Lovrijenac|Croatia':                         'sights',   // medieval fortress, Dubrovnik
  'Il Secondo|Croatia':                              'food-drink',
  'Jarun Lake|Croatia':                              'outdoors', // Zagreb recreation lake
  'Jelacic Square|Croatia':                          'sights',   // Zagreb's main square
  'Kavanica|Croatia':                                'food-drink',
  'Korčula|Croatia':                                 'sights',   // medieval walled island town
  'Krka National Park|Croatia':                      'outdoors',
  'La Štruk|Croatia':                                'food-drink', // famous štruklji restaurant, Zagreb
  'Maksimir Park|Croatia':                           'outdoors', // Zagreb's largest city park
  'Mljet Island|Croatia':                            'outdoors', // national park island
  'Mt Srd Hike|Croatia':                             'outdoors', // hike above Dubrovnik
  'Plitvice Airbnb|Croatia':                         'stay',
  'Plitvice Lakes National Park - Lower Lakes|Croatia': 'outdoors',
  'Plitvice Lakes National Park - Upper Lakes|Croatia': 'outdoors',
  'Pri zvoncu|Croatia':                              'food-drink',
  'Restaurant Maskeron|Croatia':                     'food-drink',
  'Restaurant Panorama|Croatia':                     'food-drink',
  'Split Airbnb|Croatia':                            'stay',
  "Split's Riva Promenade|Croatia":                  'sights',   // Split's iconic waterfront
  'Tkalciceva Street|Croatia':                       'sights',   // Zagreb's famous street
  'Trattoria Carmen|Croatia':                        'food-drink',
  'Vis Island|Croatia':                              'outdoors', // remote Adriatic island
  'Zagreb Airbnb|Croatia':                           'stay',
  'Zagreb Airport|Croatia':                          'transit',
  'Zagreb Cathedral|Croatia':                        'sights',

  // ── CZECH REPUBLIC ────────────────────────────────────────
  'Astronomical Clock|Czech Republic':               'sights',   // Orloj, Old Town Hall
  'Charles Bridge|Czech Republic':                   'sights',
  'Letná Park|Czech Republic':                       'outdoors', // park with city panorama
  'Old Town Square|Czech Republic':                  'sights',
  'Prague Airport (Václav Havel Airport Prague)|Czech Republic': 'transit',
  'Prague Castle|Czech Republic':                    'sights',
  'St Vitus Cathedral|Czech Republic':               'sights',
  'St. Nicholas Church|Czech Republic':              'sights',

  // ── DENMARK ───────────────────────────────────────────────
  'Copenhagen Kastrup Airport|Denmark':              'transit',

  // ── GERMANY ───────────────────────────────────────────────
  'Almbachklamm|Germany':                            'outdoors', // gorge walk near Berchtesgaden
  'Berchtesgaden|Germany':                           'sights',   // Bavarian alpine town
  'Eibsee Lake|Germany':                             'outdoors', // emerald lake below Zugspitze
  'Fussen|Germany':                                  'sights',   // town near Neuschwanstein
  'Garmisch-Partenkirchen|Germany':                  'sights',   // mountain resort town
  'Höllentalklamm Gorge|Germany':                    'outdoors',
  'Königssee|Germany':                               'outdoors', // fjord-like mountain lake
  'Lake Eibsee|Germany':                             'outdoors', // same lake, alternate name
  'Leutaschklamm Gorge|Germany':                     'outdoors',
  'Mittenwald|Germany':                              'sights',   // Alpine violin-making town
  'Neuschwanstein Castle|Germany':                   'sights',
  'Partnachklamm Gorge|Germany':                     'outdoors',
  "The Eagle's Nest|Germany":                        'sights',   // Kehlsteinhaus — WWII historical sight
  'Wagenbrüchsee (Geroldsee Lake)|Germany':          'outdoors', // mountain lake, Zugspitze backdrop
  'Wagenbrüchsee (Geroldsee)|Germany':               'outdoors',
  'Wallfahrtskirche Maria Gern|Germany':             'sights',   // Baroque pilgrimage church
  'Zugspitze|Germany':                               'outdoors', // Germany's highest peak

  // ── ICELAND ───────────────────────────────────────────────
  'Akureyri|Iceland':                                'sights',   // Iceland's second city
  'Aldeyjarfoss Waterfall|Iceland':                  'outdoors',
  'Arnarstapi|Iceland':                              'outdoors', // basalt sea arch coastal walk
  'Bjarnarfoss Waterfall|Iceland':                   'outdoors',
  'Bridge Between Continents|Iceland':               'sights',   // tectonic plate bridge, Reykjanes
  'Brunnhóll Ice Cream Farm|Iceland':                'food-drink',
  "Daddi's Pizza|Iceland":                           'food-drink',
  'DC-3 Plane Wreck|Iceland':                        'sights',   // iconic abandoned plane on black sand beach
  'Dettifoss|Iceland':                               'outdoors', // Europe's most powerful waterfall
  'Diamond Beach|Iceland':                           'outdoors', // icebergs on black sand
  'Dimmuborgir Lava Fields|Iceland':                 'outdoors',
  'Dyrhólaey Cliffs|Iceland':                        'outdoors', // coastal arch/cliffs
  'Eystrahorn|Iceland':                              'outdoors', // dramatic mountain hike
  'Fjaðrárgljúfur Canyon|Iceland':                   'outdoors',
  'Fjallsárlón Glacier Lagoon|Iceland':              'outdoors',
  'Friðheimar|Iceland':                              'food-drink', // tomato greenhouse restaurant
  'Geysir Geothermal Area|Iceland':                  'outdoors',
  'Glacier Goodies|Iceland':                         'food-drink',
  'Gljúfrabúi|Iceland':                              'outdoors', // hidden waterfall inside canyon
  'Goðafoss Waterfall|Iceland':                      'outdoors',
  'Grjótagjá Lava Cave|Iceland':                     'outdoors', // hot spring lava cave (Game of Thrones)
  'Grotta Lighthouse|Iceland':                       'sights',   // Reykjavik lighthouse, Northern Lights spot
  'Gullfoss Waterfall|Iceland':                      'outdoors',
  'Gunnuhver Hot Springs|Iceland':                   'outdoors',
  'Hafragilsfoss|Iceland':                           'outdoors',
  'Háifoss Waterfall|Iceland':                       'outdoors', // one of Iceland's tallest
  'Hallgrímskirkja Church|Iceland':                  'sights',   // Reykjavik's iconic church
  'Hálsanefshellir Cave|Iceland':                    'outdoors', // sea cave at Reynisfjara
  'Harpa Concert Hall|Iceland':                      'sights',   // Reykjavik architectural landmark
  'Heinabergslón Glacier Lagoon|Iceland':            'outdoors',
  'Hengifoss Waterfall|Iceland':                     'outdoors',
  'Hljóðaklettar (Echo Rocks)|Iceland':              'outdoors', // basalt rock formations
  'Hof Turf Church|Iceland':                         'sights',   // historic 18th-century turf church
  'Höfði Peninsula Walk|Iceland':                    'outdoors',
  'Hoffell Hot Tubs|Iceland':                        'outdoors', // geothermal pots in a barn
  'Hoffellsjökull|Iceland':                          'outdoors', // glacier tongue
  'Hofsós|Iceland':                                  'sights',   // small historic fishing village
  'Hraunfossar & Barnafoss|Iceland':                 'outdoors',
  'Hverfjall Crater Hike|Iceland':                   'outdoors',
  'Hverir Geothermal Area|Iceland':                  'outdoors', // bubbling mud pools, fumaroles
  'Hvítserkur|Iceland':                              'outdoors', // 15m basalt sea stack
  'Ishusid Pizzeria|Iceland':                        'food-drink',
  'Jökulsárlón Glacier Lagoon|Iceland':              'outdoors',
  'Katla Ice Cave Tour|Iceland':                     'outdoors',
  'Keflavík International Airport|Iceland':          'transit',
  'Kirkjufell Mountain|Iceland':                     'outdoors', // most photographed mountain in Iceland
  'Kirkjufellsfoss Waterfall|Iceland':               'outdoors',
  'Kleifarvatn Lake|Iceland':                        'outdoors',
  'Krafla Crater|Iceland':                           'outdoors',
  'Kvernufoss Waterfall|Iceland':                    'outdoors',
  'Laugavegur Street|Iceland':                       'sights',   // Reykjavik's main street
  'Laxá River|Iceland':                              'outdoors',
  'Leirhnjúkur Lava Fields|Iceland':                 'outdoors',
  "Mia's Country Van|Iceland":                       'food-drink',
  'Möðrudalur Farm + Church|Iceland':                'sights',   // Iceland's highest farm, historic church + café
  'Múlagljúfur Canyon|Iceland':                      'outdoors',
  'Mývatn Nature Baths|Iceland':                     'outdoors',
  'Narfeyrarstofa|Iceland':                          'food-drink', // restaurant on Snæfellsnes peninsula
  'Reynisfjara Black Sand Beach|Iceland':            'outdoors',
  'Rjúkandi Waterfall|Iceland':                      'outdoors',
  'Rok|Iceland':                                     'food-drink', // restaurant, Reykjavik
  'Sandholt Bakery|Iceland':                         'food-drink',
  'Secret Lagoon|Iceland':                           'outdoors',
  'Selfoss waterfall|Iceland':                       'outdoors',
  'Seljalandsfoss Waterfall|Iceland':                'outdoors',
  'Skaftafell National Park|Iceland':                'outdoors',
  'Skógafoss Waterfall|Iceland':                     'outdoors',
  'Skool Beans|Iceland':                             'food-drink',
  'Skútustaðagígar (pseudocraters)|Iceland':         'outdoors',
  'Smiðjan Brugghús|Iceland':                        'food-drink',
  'Sólheimajökull Glacier|Iceland':                  'outdoors',
  'Stokksnes & Vestrahorn|Iceland':                  'outdoors',
  'Stuðlagil Canyon|Iceland':                        'outdoors',
  'Stykkishólmur|Iceland':                           'sights',   // charming town, Snæfellsnes gateway
  'Súgandisey Lighthouse Walk|Iceland':              'outdoors', // walk to lighthouse island
  'Sun Voyager Sculpture|Iceland':                   'sights',   // Sólfar Viking ship sculpture, Reykjavik
  'Svartifoss Waterfall|Iceland':                    'outdoors',
  'Svöðufoss Waterfall|Iceland':                     'outdoors',
  'Tröllaskagi Peninsula|Iceland':                   'outdoors', // scenic peninsula drive
  'Vík Church|Iceland':                              'sights',   // iconic black church above Vík
  'Vogafjós Cow Café|Iceland':                       'food-drink',
  'Þingvellir National Park|Iceland':                'outdoors',

  // ── ITALY ─────────────────────────────────────────────────
  '1000 Gourmet Venezia|Italy':                      'food-drink',
  'Ai Do Leoni|Italy':                               'food-drink',
  'Airbnb Misurina|Italy':                           'stay',
  'Airbnb Ortisei|Italy':                            'stay',
  'Airbnb Roma|Italy':                               'stay',
  'Airbnb San Gimignano|Italy':                      'stay',
  'Airbnb, Rome|Italy':                              'stay',
  'Airbnb, Venice|Italy':                            'stay',
  'Alpe Di Siusi / Seiser Alm|Italy':                'outdoors', // Dolomite alpine meadow plateau
  'Cadini di Misurina|Italy':                        'outdoors', // dramatic Dolomite peaks
  'Chianti Region|Italy':                            'sights',   // Tuscan wine country cultural landscape
  'Cinque Torri|Italy':                              'outdoors', // Dolomite rock towers, hiking
  'Colosseum|Italy':                                 'sights',
  'Grand Canal, Venice|Italy':                       'sights',
  'Hotel Cruise|Italy':                              'stay',
  'Lago di Braies|Italy':                            'outdoors', // emerald alpine lake, Dolomites
  'Lago di Carezza|Italy':                           'outdoors', // turquoise lake with Dolomite backdrop
  'Lago di Limides|Italy':                           'outdoors',
  'Lake Como|Italy':                                 'outdoors',
  'Milan Malpensa Airport|Italy':                    'transit',
  'Montepulciano|Italy':                             'sights',   // Renaissance hilltop wine town
  'Palatine Hill|Italy':                             'sights',   // ancient Roman hill, Rome
  'Passo Gardena|Italy':                             'outdoors', // high alpine pass, Dolomites
  'Pasticceria Marchini|Italy':                      'food-drink',
  'Piazza Navona|Italy':                             'sights',   // Baroque piazza, Bernini fountain, Rome
  'Rifugio Lagazuoi|Italy':                          'stay',     // high-altitude mountain refuge
  'Roma Termini Station|Italy':                      'transit',
  'Roman Forum|Italy':                               'sights',
  'San Gimignano|Italy':                             'sights',   // UNESCO medieval towers town, Tuscany
  'Seceda Ridgeline|Italy':                          'outdoors', // iconic Dolomite ridgeline hike
  'Siena|Italy':                                     'sights',   // UNESCO medieval city, Piazza del Campo
  'Sistine Chapel|Italy':                            'sights',
  'Sixt Rental Car - Roma Via Veneto|Italy':         'transit',
  "St. Mark's Campanile|Italy":                      'sights',
  "St. Mark's Square|Italy":                         'sights',   // Piazza San Marco, Venice
  'The Pantheon|Italy':                              'sights',
  'Tre Cime di Lavaredo|Italy':                      'outdoors', // iconic Dolomite triple peaks
  "Val d'Orcia|Italy":                               'sights',   // UNESCO rolling Tuscan hills landscape
  'Val di Funes|Italy':                              'outdoors', // valley with Santa Maddalena church view
  "Vatican Museums & St. Peter's Basilica|Italy":   'sights',
  'Venezia Piazzale Roma|Italy':                     'transit',  // Venice bus/car terminal
  'Venice Boat Cruise|Italy':                        'sights',

  // ── MONTENEGRO ────────────────────────────────────────────
  'Kotor Old Town|Montenegro':                       'sights',   // UNESCO medieval walled town
  'Lovćen National Park|Montenegro':                 'outdoors',
  'Perast|Montenegro':                               'sights',   // Baroque village on Bay of Kotor
  'San Giovanni Fortress|Montenegro':                'sights',   // fortress above Kotor

  // ── SLOVENIA ──────────────────────────────────────────────
  'Bled Airbnb|Slovenia':                            'stay',
  'Bled Castle|Slovenia':                            'sights',
  'Boka Waterfall|Slovenia':                         'outdoors',
  "Caffe Peglez'n|Slovenia":                         'food-drink',
  'Farm Bukovc|Slovenia':                            'sights',   // traditional farm with Triglav views
  'Kozjak Waterfall|Slovenia':                       'outdoors',
  'Lake Bled|Slovenia':                              'outdoors',
  'Ljubljana Castle|Slovenia':                       'sights',
  'Logar Valley/Solcava Scenic Drive|Slovenia':      'outdoors',
  'Mala Osojnica|Slovenia':                          'outdoors', // hike above Lake Bled
  'Old Cellar Bled|Slovenia':                        'food-drink',
  'Soca River|Slovenia':                             'outdoors',
  'Tivoli Park|Slovenia':                            'outdoors', // Ljubljana's large central park
  'Velika Planina|Slovenia':                         'outdoors', // alpine shepherd plateau
  'Vintgar Gorge|Slovenia':                          'outdoors',

  // ── SWITZERLAND ───────────────────────────────────────────
  'Alp Chlus|Switzerland':                           'outdoors',
  'Appenzell|Switzerland':                           'sights',   // charming Appenzeller village
  'Bachalpsee|Switzerland':                          'outdoors', // alpine lake, Grindelwald
  'Berggasthaus Ebenalp|Switzerland':                'stay',     // cliff-side mountain guesthouse
  'Berggasthaus Schäfler|Switzerland':               'stay',
  'Birg Thrill Walk|Switzerland':                    'outdoors', // suspended walkway, Schilthorn
  'Chalet Jungfrau Isenfluh|Switzerland':            'stay',
  'Eiger Express|Switzerland':                       'transit',  // cable car system
  'Eiger Trail|Switzerland':                         'outdoors',
  'First|Switzerland':                               'outdoors', // mountain station above Grindelwald
  'First Cliff Walk|Switzerland':                    'outdoors', // suspended walkway
  'Furka Pass|Switzerland':                          'outdoors', // high alpine pass (James Bond Goldfinger)
  'Gimmelwald|Switzerland':                          'sights',   // tiny car-free mountain village
  'Grindelwald|Switzerland':                         'sights',   // base village for Jungfrau region
  'Grütschalp Cable Car|Switzerland':                'transit',
  'Interlaken|Switzerland':                          'sights',
  'Jungfraujoch|Switzerland':                        'outdoors', // Top of Europe glacier station
  'Kandersteg|Switzerland':                          'sights',
  'Kleine Scheidegg|Switzerland':                    'outdoors', // mountain pass with Eiger views
  'Lake Oeschinensee|Switzerland':                   'outdoors',
  'Lauterbrunnen|Switzerland':                       'sights',   // famous waterfall valley village
  'Lauterbrunnen Valley|Switzerland':                'outdoors',
  'Lucerne|Switzerland':                             'sights',
  'Lugano|Switzerland':                              'sights',
  'Männlichen|Switzerland':                          'outdoors',
  'Mount Säntis|Switzerland':                        'outdoors',
  'Mount Schäfler|Switzerland':                      'outdoors',
  'Mürren|Switzerland':                              'sights',   // car-free cliff village
  'Murrenbach Fall|Switzerland':                     'outdoors',
  'Northface Trail|Switzerland':                     'outdoors',
  'Panorama Trail|Switzerland':                      'outdoors',
  'Piz Gloria|Switzerland':                          'food-drink', // revolving restaurant on Schilthorn (James Bond)
  'Saxer Lucke|Switzerland':                         'outdoors',
  'Schafler Ridge|Switzerland':                      'outdoors',
  'Schäfler Ridge|Switzerland':                      'outdoors',
  'Schäfler Ridge Viewpoint|Switzerland':            'outdoors',
  'Schäfler Summit Viewpoint|Switzerland':           'outdoors',
  'Schilthorn|Switzerland':                          'outdoors', // 2970m peak, 360° alpine views
  'Schilthornbahn|Switzerland':                      'transit',  // cable car system
  'Schynige Platte|Switzerland':                     'outdoors', // alpine garden ridge
  'Staubbach Falls|Switzerland':                     'outdoors', // 300m free-fall waterfall
  'Stechelberg|Switzerland':                         'sights',   // valley floor village
  'Trummelbach Falls|Switzerland':                   'outdoors', // glacier waterfalls inside mountain
  'Wasserauen|Switzerland':                          'sights',   // small village
  'Wasserauen-Ebenalp Cable Car|Switzerland':        'transit',
  'Wengen|Switzerland':                              'sights',   // car-free mountain village

  // ── UNITED STATES ─────────────────────────────────────────
  'Bryce Canyon|United States':                      'outdoors',
  'Gardnerville|United States':                      'sights',   // small Nevada town
  'Grand Tetons National Park|United States':        'outdoors',
  'Mount Rainier|United States':                     'outdoors',
  'Park N Fly|United States':                        'transit',
  'San Francisco International Airport|United States': 'transit',
  'Sedona|United States':                            'sights',   // red rock destination city
  'SFO Airport|United States':                       'transit',
  'Sisters, Oregon|United States':                   'sights',   // charming mountain town
  'Twin Falls|United States':                        'outdoors', // Snake River Canyon, Shoshone Falls
  'Yellowstone National Park|United States':         'outdoors',

  // ── NO COUNTRY ────────────────────────────────────────────
  'Zion National Park|':                             'outdoors',
};

// Normalize curly quotes/apostrophes to straight apostrophes for matching
function norm(s) { return (s||'').replace(/[‘’‚‛′`]/g,"'").replace(/[“”„‟″"]/g,'"'); }

async function main() {
  console.log('Fetching all places from Supabase...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/wf_places?select=id,name,country,category&order=country,name`, { headers: H });
  const places = await res.json();
  console.log(`Fetched ${places.length} places\n`);

  const updates = {}; // id → newCategory
  const unrecognized = [];

  for (const p of places) {
    const key = `${norm(p.name)}|${p.country || ''}`;
    const correct = CORRECT[key];
    if (!correct) {
      unrecognized.push(`  [${(p.category||'').padEnd(13)}] ${p.country || '(no country)'} · ${p.name}  KEY:"${key}"`);
      continue;
    }
    if (p.category !== correct) {
      updates[p.id] = { name: p.name, country: p.country, old: p.category, new: correct };
    }
  }

  if (unrecognized.length) {
    console.log(`⚠️  ${unrecognized.length} places not in lookup — skipped (already correct or needs manual check):`);
    unrecognized.forEach(u => console.log(u));
    console.log('');
  }

  const toUpdate = Object.entries(updates);
  console.log(`Found ${toUpdate.length} places needing category update:`);
  toUpdate.forEach(([id, u]) => console.log(`  ${u.old.padEnd(15)} → ${u.new.padEnd(12)}  ${u.country || '—'} · ${u.name}`));

  if (!toUpdate.length) {
    console.log('\n✅ All places already correctly categorized.');
    return;
  }

  // Group by new category for efficient batched PATCH
  const byCat = {};
  for (const [id, u] of toUpdate) {
    if (!byCat[u.new]) byCat[u.new] = [];
    byCat[u.new].push(id);
  }

  console.log('\nSending updates to Supabase...');
  let totalUpdated = 0;
  for (const [cat, ids] of Object.entries(byCat)) {
    const idList = ids.join(',');
    const r = await fetch(`${SUPABASE_URL}/rest/v1/wf_places?id=in.(${idList})`, {
      method: 'PATCH',
      headers: { ...H, Prefer: 'return=minimal' },
      body: JSON.stringify({ category: cat }),
    });
    if (r.ok) {
      console.log(`  ✅ ${cat.padEnd(12)} — updated ${ids.length} place${ids.length !== 1 ? 's' : ''}`);
      totalUpdated += ids.length;
    } else {
      const err = await r.text();
      console.log(`  ❌ ${cat} — error: ${err}`);
    }
  }

  console.log(`\n✅ Done! ${totalUpdated} places updated.`);
  console.log('The app will pick up correct categories on next sync.');
}

main().catch(console.error);
