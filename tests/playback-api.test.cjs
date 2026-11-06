const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

/** Runs the real API module without Spotify credentials or network access. */
function createApiHarness() {
  const requests = [];
  const file = path.join(__dirname, '../src/features/spotify/api.ts');
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  const context = {
    exports,
    require: (id) => {
      if (id === '../auth/spotifyAuth') {
        return { getSpotifyAccessToken: async () => 'test-token' };
      }
      throw new Error(`Unexpected import: ${id}`);
    },
    fetch: async (url, options) => {
      requests.push({ url, options, body: JSON.parse(options.body ?? '{}') });
      return { status: 204, ok: true };
    },
    Set,
    Error,
    Number,
    JSON,
    encodeURIComponent,
  };
  vm.runInNewContext(output, context, { filename: 'api.ts' });
  return { api: exports.spotifyApi, requests };
}

test('selected playlist song preserves the playlist and exact position', async () => {
  const { api, requests } = createApiHarness();
  await api.playPlaylistTrack('device123', 'spotify:playlist:abc', 'spotify:track:xyz', 8);
  assert.equal(requests.length, 1);
  assert.match(requests[0].url, /\/me\/player\/play\?device_id=device123$/);
  assert.deepEqual(JSON.parse(JSON.stringify(requests[0].body)), {
    context_uri: 'spotify:playlist:abc',
    offset: { position: 8 },
    position_ms: 0,
  });
  assert.equal(requests[0].options.method, 'PUT');
});

test('selected playlist song without an index uses the track URI offset', async () => {
  const { api, requests } = createApiHarness();
  await api.playPlaylistTrack('device123', 'spotify:playlist:abc', 'spotify:track:xyz');
  assert.deepEqual(JSON.parse(JSON.stringify(requests[0].body.offset)), {
    uri: 'spotify:track:xyz',
  });
});

test('liked song queue sends an ordered set of tracks, not just a single song', async () => {
  const { api, requests } = createApiHarness();
  await api.playTrackSequence('device123', ['spotify:track:one', 'spotify:track:two']);
  assert.deepEqual(Array.from(requests[0].body.uris), ['spotify:track:one', 'spotify:track:two']);
  assert.equal(requests[0].body.context_uri, undefined);
});

test('Play Playlist remains a full playlist context without an offset', async () => {
  const { api, requests } = createApiHarness();
  await api.playContext('device123', 'spotify:playlist:abc');
  assert.deepEqual(JSON.parse(JSON.stringify(requests[0].body)), { context_uri: 'spotify:playlist:abc' });
});
