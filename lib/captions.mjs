function stamp(seconds) {
  const milliseconds = Math.max(0, Math.round(Number(seconds || 0) * 1000));
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor(milliseconds % 3_600_000 / 60_000);
  const secs = Math.floor(milliseconds % 60_000 / 1000);
  const ms = milliseconds % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

export function transcriptToVtt(transcript) {
  if (!Array.isArray(transcript) || !transcript.length) throw new Error('Transcrição indisponível.');
  const cues = transcript
    .filter((cue) => Number.isFinite(Number(cue?.start)) && Number.isFinite(Number(cue?.end)) && String(cue?.text || '').trim())
    .map((cue) => `${stamp(cue.start)} --> ${stamp(cue.end)}\n${String(cue.text).trim().replace(/-->/g, '→')}`);
  if (!cues.length) throw new Error('Transcrição sem trechos válidos.');
  return `WEBVTT\n\n${cues.join('\n\n')}\n`;
}
