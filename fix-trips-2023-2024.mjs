// Wayfinder — Fix 2023 & 2024 trip data
// Fixes:
//  1. Create trip-italy-2023 (Rome/Tuscany/Dolomites Oct 7-18 2023, was mislabeled trip-italy-2022)
//  2. Move Italy 2023 places to correct trip
//  3. Remove trip-balkans-2023 from all Central Europe 2024 dual-assigned places
//  4. Fix Innsbruck (in Balkans, should be 2024)
//  5. Fix Prague + Copenhagen airports (wrong year 2023 → 2024, wrong trip)
//  6. Fix SFO 2024-10-16 (in Balkans, should be 2024)
//  7. Fix Iceland visitDates (2024-09 → 2025-09)
//  8. Remove Bosnia from Balkans destinations
//  9. Rebuild all trip itineraries from visitDate data

const SUPABASE_URL = 'https://fkfwjbdnezvwtjzenxgo.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZndqYmRuZXp2d3RqemVueGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY4MDQyMCwiZXhwIjoyMDk2MjU2NDIwfQ.1oOeNdVIfSGwQokDo-TosiscMwozGxMDxCRRugxZTUI';
const H = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };
const userId = 'e8afcdc8-e63c-4d89-a945-793ddacd6ec3';

async function db(path, method = 'GET', body, extra = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method, headers: { ...H, Prefer: 'return=representation', ...extra },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
}

function dateRange(start, end) {
  const days = [];
  for (let d = new Date(start + 'T00:00:00Z'); d <= new Date(end + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

async function main() {
  console.log('Fetching all data...');
  const [places, trips] = await Promise.all([
    db('wf_places?select=*&order=visitDate,name'),
    db('wf_trips?select=*&order=start_date'),
  ]);
  console.log(`${places.length} places, ${trips.length} trips loaded\n`);

  const tripMap = Object.fromEntries(trips.map(t => [t.id, t]));
  let changed = 0;

  // ── STEP 1: Create Italy 2023 trip ───────────────────────────────────────
  console.log('── Step 1: Creating trip-italy-2023...');
  const existingItaly2023 = trips.find(t => t.id === 'trip-italy-2023');
  if (!existingItaly2023) {
    const newTrip = {
      id: 'trip-italy-2023',
      user_id: userId,
      name: 'Italy: Rome, Tuscany & Dolomites 2023',
      start_date: '2023-10-07',
      end_date: '2023-10-18',
      destinations: ['Italy'],
      status: 'past',
      type: 'international',
      notes: '',
      budget: null,
      itinerary: [],
      added_at: Date.now(),
    };
    const r = await db('wf_trips', 'POST', newTrip);
    console.log('  Created:', r[0]?.name || r);
    tripMap['trip-italy-2023'] = newTrip;
  } else {
    console.log('  Already exists — skipping create');
  }

  // ── STEP 2: Move Italy 2023 places from trip-italy-2022 → trip-italy-2023 ─
  console.log('\n── Step 2: Moving Italy 2023 places...');
  const italy2023Places = places.filter(p =>
    p.visitDate && p.visitDate.startsWith('2023-10') &&
    (p.trip_ids || []).includes('trip-italy-2022')
  );
  console.log(`  Found ${italy2023Places.length} Italy 2023 places mislabeled as 2022`);
  for (const p of italy2023Places) {
    const newIds = (p.trip_ids || [])
      .filter(id => id !== 'trip-italy-2022')
      .concat('trip-italy-2023')
      .filter((v, i, a) => a.indexOf(v) === i);
    await db(`wf_places?id=eq.${p.id}`, 'PATCH', { trip_ids: newIds });
    console.log(`  ✓ ${p.visitDate}  ${p.name}`);
    p.trip_ids = newIds;
    changed++;
  }

  // ── STEP 3: Remove trip-balkans-2023 from all Central Europe 2024 places ─
  console.log('\n── Step 3: Fixing dual-assigned 2024 places...');
  const dualAssigned = places.filter(p =>
    (p.trip_ids || []).includes('trip-balkans-2023') &&
    (p.trip_ids || []).includes('trip-central-europe-2024')
  );
  console.log(`  Found ${dualAssigned.length} places with both trip IDs`);
  for (const p of dualAssigned) {
    const newIds = p.trip_ids.filter(id => id !== 'trip-balkans-2023');
    await db(`wf_places?id=eq.${p.id}`, 'PATCH', { trip_ids: newIds });
    console.log(`  ✓ ${p.name}  (${p.country})`);
    p.trip_ids = newIds;
    changed++;
  }

  // ── STEP 4: Fix Innsbruck (in Balkans → 2024) ────────────────────────────
  console.log('\n── Step 4: Fixing Innsbruck...');
  const innsbruck = places.find(p => p.name === 'Innsbruck' && p.country === 'Austria');
  if (innsbruck && (innsbruck.trip_ids || []).includes('trip-balkans-2023') &&
      !(innsbruck.trip_ids || []).includes('trip-central-europe-2024')) {
    const newIds = innsbruck.trip_ids.filter(id => id !== 'trip-balkans-2023').concat('trip-central-europe-2024');
    await db(`wf_places?id=eq.${innsbruck.id}`, 'PATCH', { trip_ids: newIds });
    console.log(`  ✓ Innsbruck → trip-central-europe-2024`);
    innsbruck.trip_ids = newIds;
    changed++;
  } else {
    console.log('  Already correct or not found');
  }

  // ── STEP 5: Fix Prague Airport (wrong year + wrong trip) ─────────────────
  console.log('\n── Step 5: Fixing Prague Airport...');
  const praguePorts = places.filter(p => p.name === 'Prague Airport (Václav Havel Airport Prague)');
  for (const p of praguePorts) {
    const newDate = p.visitDate?.startsWith('2023') ? '2024-10-31' : p.visitDate;
    const newIds = ['trip-central-europe-2024'];
    await db(`wf_places?id=eq.${p.id}`, 'PATCH', { trip_ids: newIds, visitDate: newDate });
    console.log(`  ✓ Prague Airport: ${p.visitDate} → ${newDate}, trips: ${newIds}`);
    p.trip_ids = newIds; p.visitDate = newDate;
    changed++;
  }

  // ── STEP 6: Fix Copenhagen Kastrup (wrong year + wrong trip) ─────────────
  console.log('\n── Step 6: Fixing Copenhagen Kastrup Airport...');
  const cph = places.find(p => p.name === 'Copenhagen Kastrup Airport');
  if (cph) {
    const newDate = cph.visitDate?.startsWith('2023') ? '2024-10-31' : cph.visitDate;
    const newIds = ['trip-central-europe-2024'];
    await db(`wf_places?id=eq.${cph.id}`, 'PATCH', { trip_ids: newIds, visitDate: newDate });
    console.log(`  ✓ Copenhagen: ${cph.visitDate} → ${newDate}, trips: ${newIds}`);
    cph.trip_ids = newIds; cph.visitDate = newDate;
    changed++;
  }

  // ── STEP 7: Fix SFO departure Oct 16 2024 (in Balkans → 2024 trip) ───────
  console.log('\n── Step 7: Fixing SFO 2024-10-16...');
  const sfo2024 = places.find(p =>
    (p.name === 'SFO Airport' || p.name === 'San Francisco International Airport') &&
    p.visitDate === '2024-10-16'
  );
  if (sfo2024) {
    const newIds = ['trip-central-europe-2024'];
    await db(`wf_places?id=eq.${sfo2024.id}`, 'PATCH', { trip_ids: newIds });
    console.log(`  ✓ SFO 2024-10-16 → trip-central-europe-2024`);
    sfo2024.trip_ids = newIds;
    changed++;
  } else {
    console.log('  Not found or already correct');
  }

  // ── STEP 8: Fix Iceland visitDates (2024-09 → 2025-09) ───────────────────
  console.log('\n── Step 8: Fixing Iceland year offset...');
  const icelandWrongYear = places.filter(p =>
    p.country === 'Iceland' &&
    p.visitDate && p.visitDate.startsWith('2024-09')
  );
  console.log(`  Found ${icelandWrongYear.length} Iceland places with 2024-09 dates`);
  for (const p of icelandWrongYear) {
    const newDate = p.visitDate.replace('2024-09', '2025-09');
    await db(`wf_places?id=eq.${p.id}`, 'PATCH', { visitDate: newDate });
    console.log(`  ✓ ${p.visitDate} → ${newDate}  ${p.name}`);
    p.visitDate = newDate;
    changed++;
  }

  // Also fix Park N Fly and SFO associated with Iceland 2024-09
  const icelandTransit2024 = places.filter(p =>
    (p.trip_ids || []).includes('trip-iceland-2025') &&
    p.visitDate && p.visitDate.startsWith('2024-09')
  );
  for (const p of icelandTransit2024) {
    if (!p.country || p.country === 'Iceland') continue; // already handled above
    const newDate = p.visitDate.replace('2024-09', '2025-09');
    await db(`wf_places?id=eq.${p.id}`, 'PATCH', { visitDate: newDate });
    console.log(`  ✓ [transit] ${p.visitDate} → ${newDate}  ${p.name}`);
    p.visitDate = newDate;
    changed++;
  }

  // ── STEP 9: Fix Balkans 2023 — remove Bosnia, fix end date ───────────────
  console.log('\n── Step 9: Fixing Balkans 2023 trip metadata...');
  const balkans = trips.find(t => t.id === 'trip-balkans-2023');
  if (balkans) {
    const newDest = (balkans.destinations || []).filter(d => d !== 'Bosnia');
    await db('wf_trips?id=eq.trip-balkans-2023', 'PATCH', { destinations: newDest });
    console.log(`  ✓ Destinations: ${JSON.stringify(newDest)}`);
  }

  // ── STEP 10: Rebuild all itineraries from visitDate ──────────────────────
  console.log('\n── Step 10: Rebuilding trip itineraries from visitDate...');

  // Re-fetch places after all our updates
  const updatedPlaces = await db('wf_places?select=id,name,visitDate,trip_ids&order=visitDate,name');
  console.log(`  Re-fetched ${updatedPlaces.length} places`);

  const tripsToRebuild = [
    { id: 'trip-italy-2022',           start: '2022-10-06', end: '2022-10-22' },
    { id: 'trip-italy-2023',           start: '2023-10-07', end: '2023-10-18' },
    { id: 'trip-balkans-2023',         start: '2023-10-18', end: '2023-11-04' },
    { id: 'trip-central-europe-2024',  start: '2024-10-16', end: '2024-10-31' },
    { id: 'trip-iceland-2025',         start: '2025-09-10', end: '2025-09-26' },
  ];

  for (const trip of tripsToRebuild) {
    const tripPlaces = updatedPlaces.filter(p =>
      (p.trip_ids || []).includes(trip.id) && p.visitDate
    );

    // Group by date
    const byDate = {};
    for (const p of tripPlaces) {
      if (!byDate[p.visitDate]) byDate[p.visitDate] = [];
      byDate[p.visitDate].push({ name: p.name, placeId: p.id });
    }

    // Build day-by-day itinerary
    const itinerary = dateRange(trip.start, trip.end).map(date => ({
      date,
      stops: byDate[date] || [],
    }));

    const daysWithStops = itinerary.filter(d => d.stops.length > 0).length;
    console.log(`\n  ${trip.id}: ${daysWithStops}/${itinerary.length} days with stops`);
    itinerary.filter(d => d.stops.length).forEach(d => {
      console.log(`    ${d.date}: ${d.stops.map(s => s.name).join(' | ')}`);
    });

    await db(`wf_trips?id=eq.${trip.id}`, 'PATCH', {
      itinerary,
      ...(trip.id === 'trip-italy-2023' ? {
        start_date: trip.start,
        end_date: trip.end,
        destinations: ['Italy'],
        status: 'past',
        type: 'international',
      } : {}),
    });
    console.log(`  ✓ ${trip.id} itinerary saved`);
  }

  console.log(`\n✅ Done — ${changed} place records updated, all itineraries rebuilt.`);
}

main().catch(console.error);
