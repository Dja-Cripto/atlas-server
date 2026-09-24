import test from 'node:test';
import assert from 'node:assert/strict';
import { MUSIC_CATEGORIES, TRACK_CLASSIFICATIONS, EXCLUDED_BEAT_TRACKS, selectBestMusic, getAllTracks } from '../lib/music-catalog.mjs';

test('music catalog provides comprehensive categories and classified tracks', () => {
  assert.ok(MUSIC_CATEGORIES.geopolitics);
  assert.ok(MUSIC_CATEGORIES.mystery_dark);
  assert.ok(MUSIC_CATEGORIES.curiosity_flow);
  assert.ok(MUSIC_CATEGORIES.epic_monumental);
  assert.ok(MUSIC_CATEGORIES.emotional_drama);
  assert.ok(MUSIC_CATEGORIES.shorts_viral);
  assert.ok(MUSIC_CATEGORIES.funny_quirky);

  // Volume verification for documentary voice ducking
  assert.equal(MUSIC_CATEGORIES.geopolitics.defaultVolume, 0.06);
  assert.equal(MUSIC_CATEGORIES.curiosity_flow.defaultVolume, 0.06);
  assert.equal(MUSIC_CATEGORIES.shorts_viral.defaultVolume, 0.06);

  const allTracks = getAllTracks();
  assert.ok(allTracks.length > 200, `Expected > 200 tracks, found ${allTracks.length}`);
  
  // Verify classification integrity
  const sample = allTracks[0];
  assert.ok(sample.filename);
  assert.ok(sample.folder);
  assert.ok(sample.category);
  assert.ok(sample.relPath);

  // Verify beat exclusion
  const warzone = allTracks.find(t => t.filename.includes('Warzone'));
  assert.ok(warzone);
  assert.equal(warzone.documentarySuitable, false);
  assert.equal(warzone.beatHeavy, true);
});

test('selectBestMusic accurately selects appropriate tracks based on video theme and excludes beat tracks', () => {
  // 1. Geopolitics & Ports (Long Video)
  const geoResult = selectBestMusic({
    title: 'How China Quietly Bought 100 Strategic Ports Around the World',
    script: 'In the past two decades, Chinese state-owned companies acquired controlling stakes in major maritime hubs...',
    isShort: false
  });
  assert.equal(geoResult.category, 'geopolitics');
  assert.equal(geoResult.defaultVolume, 0.06);
  assert.ok(geoResult.path.includes('.mp3'));
  assert.ok(!EXCLUDED_BEAT_TRACKS.has(geoResult.name + '.mp3'));

  // 2. Dark Channel / Mysteries
  const darkResult = selectBestMusic({
    title: 'Top 5 Forbidden Bunkers and Nuclear Secrets Never Revealed',
    script: 'Deep beneath the mountains lie military installations kept classified for decades...',
    isShort: false
  });
  assert.equal(darkResult.category, 'mystery_dark');
  assert.equal(darkResult.defaultVolume, 0.06);
  assert.ok(!EXCLUDED_BEAT_TRACKS.has(darkResult.name + '.mp3'));

  // 3. YouTube Shorts / Curiosity Flow (inherits documentary theme without aggressive beats)
  const shortResult = selectBestMusic({
    title: 'How Monaco Became the Richest Country on Earth',
    script: 'Did you know that 1 in every 3 residents in Monaco is a millionaire?',
    isShort: true
  });
  assert.equal(shortResult.category, 'curiosity_flow');
  assert.equal(shortResult.defaultVolume, 0.06);
  assert.ok(shortResult.path.includes('Musicas/'));
  assert.ok(!EXCLUDED_BEAT_TRACKS.has(shortResult.name + '.mp3'));

  // 4. Geopolitics Short (e.g. Strait of Malacca)
  const malaccaShort = selectBestMusic({
    title: 'The 1.7-Mile Chokepoint Holding World Trade Hostage',
    script: 'Did you know that 40% of all global trade squeezes through a gap in the Strait of Malacca just 1.7 miles wide?',
    isShort: true
  });
  assert.equal(malaccaShort.category, 'geopolitics');
  assert.equal(malaccaShort.defaultVolume, 0.06);
  assert.ok(!EXCLUDED_BEAT_TRACKS.has(malaccaShort.name + '.mp3'));

  // 5. Monument / Ancient Empire video must select epic monumental and never rock
  const epicResult = selectBestMusic({
    title: 'The Rise and Fall of the Ancient Roman Empire and its Colosseum Monument',
    script: 'Across centuries, ancient emperors built monumental structures of conquest and imperial power...',
    isShort: false
  });
  assert.equal(epicResult.category, 'epic_monumental');
  assert.ok(!EXCLUDED_BEAT_TRACKS.has(epicResult.name + '.mp3'));
  assert.ok(!/fire_breather|demilitarized_zone|loitering|tidal_wave|2nd mix|sugar_zone|rock|punk|metal/i.test(epicResult.name));

  // 6. Eiffel Tower video selects clean curiosity track without rock
  const eiffelResult = selectBestMusic({
    title: 'Why the Eiffel Tower Gets Slightly Taller in Summer',
    script: 'Every summer, thermal expansion causes the tower structure to grow...',
    isShort: false
  });
  assert.ok(!EXCLUDED_BEAT_TRACKS.has(eiffelResult.name + '.mp3'));
  assert.ok(!/fire_breather|demilitarized_zone|loitering|tidal_wave|2nd mix|sugar_zone|rock|punk|metal/i.test(eiffelResult.name));

  // Verify explicit blacklist contains all banned rock/metal/punk tracks
  const banned = ['Fire_Breather.mp3', 'Demilitarized_Zone.mp3', 'Loitering.mp3', 'Tidal_Wave.mp3', '2nd Mix -.mp3', 'Sugar_Zone.mp3'];
  for (const b of banned) {
    assert.ok(EXCLUDED_BEAT_TRACKS.has(b), `Expected ${b} to be in EXCLUDED_BEAT_TRACKS`);
  }
});


