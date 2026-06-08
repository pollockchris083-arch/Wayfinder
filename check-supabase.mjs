// Wayfinder Supabase state checker
// Run: node check-supabase.mjs
// Shows current rows in all tables. Run before and after a sync to verify data landed.

const SUPABASE_URL = 'https://fkfwjbdnezvwtjzenxgo.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZndqYmRuZXp2d3RqemVueGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY4MDQyMCwiZXhwIjoyMDk2MjU2NDIwfQ.1oOeNdVIfSGwQokDo-TosiscMwozGxMDxCRRugxZTUI';

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Range': '*',
};

async function query(table, select = '*', params = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}${params}`, { headers });
  const range = res.headers.get('content-range') || '?';
  const data = await res.json();
  return { data, range, status: res.status };
}

async function listUsers() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=50`, { headers });
  if (!res.ok) return [];
  const body = await res.json();
  return body.users || [];
}

async function main() {
  console.log('\n=== Supabase State Check ===\n');

  // Auth users
  const users = await listUsers();
  if (users.length) {
    console.log('Auth users:');
    users.forEach(u => console.log(`  ${u.id}  ${u.email}  provider:${u.app_metadata?.provider}`));
  } else {
    console.log('Auth users: (could not list — check service key)');
  }

  // Trips
  const trips = await query('wf_trips', 'id,name,start_date,end_date,destinations,status', '&order=start_date');
  console.log(`\nwf_trips (${trips.range}):`);
  if (Array.isArray(trips.data) && trips.data.length) {
    trips.data.forEach(t => {
      const days = t.start_date && t.end_date
        ? Math.round((new Date(t.end_date) - new Date(t.start_date)) / 86400000) + 1
        : '?';
      console.log(`  [${t.id.slice(0,8)}] "${t.name}"  ${t.start_date}→${t.end_date}  (${days}d)  ${(t.destinations||[]).join(', ')}`);
    });
  } else {
    console.log('  (empty)');
  }

  // Places
  const places = await query('wf_places', 'id,name,country,status,trip_ids', '&order=name');
  console.log(`\nwf_places (${places.range}):`);
  if (Array.isArray(places.data) && places.data.length) {
    places.data.slice(0, 20).forEach(p => {
      console.log(`  [${p.id.slice(0,8)}] "${p.name}"  ${p.country}  ${p.status}  trips:[${(p.trip_ids||[]).join(',')}]`);
    });
    if (places.data.length > 20) console.log(`  ... and ${places.data.length - 20} more`);
  } else {
    console.log('  (empty)');
  }

  // Journal
  const journal = await query('wf_journal', 'id,date,title,trip_id', '&order=date');
  console.log(`\nwf_journal (${journal.range}):`);
  if (Array.isArray(journal.data) && journal.data.length) {
    journal.data.slice(0, 10).forEach(j => {
      console.log(`  [${j.id.slice(0,8)}] ${j.date}  "${j.title}"  trip:${j.trip_id?.slice(0,8)||'—'}`);
    });
    if (journal.data.length > 10) console.log(`  ... and ${journal.data.length - 10} more`);
  } else {
    console.log('  (empty)');
  }

  // Settings
  const settings = await query('wf_settings', 'user_id,name,partner,home_city,since');
  console.log(`\nwf_settings (${settings.range}):`);
  if (Array.isArray(settings.data) && settings.data.length) {
    settings.data.forEach(s => console.log(`  ${s.user_id}  name:"${s.name}"  home:"${s.home_city}"  since:${s.since}`));
  } else {
    console.log('  (empty)');
  }

  console.log('');
}

main().catch(console.error);
