import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawn, execSync } from 'node:child_process';

const CAPCUT_ROOT = path.join(process.env.LOCALAPPDATA || '', 'CapCut/User Data/Projects/com.lveditor.draft');

export function findCapCutExecutable() {
  const localApp = process.env.LOCALAPPDATA || '';
  const appsDir = path.join(localApp, 'CapCut/Apps');
  if (existsSync(appsDir)) {
    try {
      const dirs = readdirSync(appsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => path.join(appsDir, d.name))
        .sort()
        .reverse();
      for (const d of dirs) {
        const exe = path.join(d, 'CapCut.exe');
        if (existsSync(exe)) return exe;
      }
    } catch {}
  }
  const fallback = path.join(localApp, 'CapCut/CapCut.exe');
  if (existsSync(fallback)) return fallback;
  return null;
}

export function launchCapCut() {
  const exe = findCapCutExecutable();
  if (!exe) throw new Error('CapCut Desktop não foi encontrado no computador.');
  try {
    try {
      execSync('taskkill /f /im CapCut.exe', { stdio: 'ignore' });
    } catch {}
    const child = spawn(exe, [], { detached: true, stdio: 'ignore' });
    child.unref();
  } catch (err) {
    try {
      spawn('cmd.exe', ['/c', 'start', '""', exe], { detached: true, stdio: 'ignore' }).unref();
    } catch {
      throw new Error('Não foi possível iniciar o CapCut Desktop: ' + err.message);
    }
  }
  return { success: true, path: exe };
}

export function ensureVideoClip(clipPath, clipDuration = 5) {
  if (!clipPath || !existsSync(clipPath)) return null;
  const ext = path.extname(clipPath).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.bmp'].includes(ext)) {
    const mp4Path = clipPath.replace(new RegExp(`\\${ext}$`, 'i'), '.mp4');
    if (existsSync(mp4Path)) return mp4Path;
    const targetDur = Math.max(15, Math.ceil(clipDuration + 5));
    try {
      execSync(`ffmpeg -y -hide_banner -loglevel error -loop 1 -i "${clipPath}" -c:v libx264 -preset ultrafast -tune stillimage -t ${targetDur} -pix_fmt yuv420p -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" "${mp4Path}"`, { stdio: 'ignore' });
    } catch (e) {
      console.error('Failed to convert image to video for CapCut:', e);
    }
    if (existsSync(mp4Path)) return mp4Path;
  }
  return clipPath;
}

export function sanitizeDraftName(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') return getNextDraftName();
  const cleaned = rawTitle.replace(/[<>:"/\\|?*]/g, '').trim().replace(/\s+/g, ' ').slice(0, 50);
  return cleaned || getNextDraftName();
}

function getNextDraftName() {
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  return `Atlas Project ${ts}`;
}

export async function exportToCapCut({ title, durationSec = 60, mediaClips = [], scenes = [], overlayPath = null, voicePath = null, bgmPath = null, coverImagePath = null, projectDir = null, cleanAllDrafts = true }) {
  if (!existsSync(CAPCUT_ROOT)) {
    await mkdir(CAPCUT_ROOT, { recursive: true });
  }

  // Wipe out any old/stale project drafts in CapCut so the user always gets a clean, fresh project
  if (cleanAllDrafts) {
    try {
      const existing = readdirSync(CAPCUT_ROOT, { withFileTypes: true });
      for (const d of existing) {
        if (d.isDirectory() && !d.name.startsWith('.')) {
          try {
            rmSync(path.join(CAPCUT_ROOT, d.name), { recursive: true, force: true });
          } catch {}
        }
      }
    } catch {}
  }

  const draftName = sanitizeDraftName(title);
  const capcutDraftDir = path.join(CAPCUT_ROOT, draftName);
  
  if (existsSync(capcutDraftDir)) {
    try {
      rmSync(capcutDraftDir, { recursive: true, force: true });
    } catch {}
  }
  await mkdir(capcutDraftDir, { recursive: true });

  const durationUs = Math.round(durationSec * 1000000);
  const nowSec = Math.floor(Date.now() / 1000);
  const nowUsec = Date.now() * 1000;
  const draftId = randomUUID().toUpperCase();

  // Base template
  const templatePath = path.join(process.cwd(), 'custom_capcut_test/CapCut_Draft_Point_Nemo/draft_content.json');
  let content = {};
  if (existsSync(templatePath)) {
    content = JSON.parse(await readFile(templatePath, 'utf-8'));
  }

  content.id = draftId;
  content.name = draftName;
  content.duration = durationUs;
  content.create_time = nowSec;
  content.update_time = nowSec;
  content.version = 360000;
  content.new_version = '9.4.0';
  content.platform = {
    app_id: 359289,
    app_source: 'cc',
    app_version: '9.4.0',
    device_id: 'a3f62b5e43dc81e2ef3d2659dce0bca1',
    hard_disk_id: '',
    mac_address: '59f2530883602eb3db773a462f0d2196',
    os: 'windows',
    os_version: '10.0.26200'
  };
  content.last_modified_platform = {
    app_id: 359289,
    app_source: 'cc',
    app_version: '9.4.0',
    device_id: 'a3f62b5e43dc81e2ef3d2659dce0bca1',
    hard_disk_id: '',
    mac_address: '59f2530883602eb3db773a462f0d2196',
    os: 'windows',
    os_version: '10.0.26200'
  };

  const baseVMat = content.materials?.videos?.[0] || {
    id: '', type: 'video', duration: durationUs, path: '', has_audio: false, width: 1920, height: 1080,
    material_name: '', check_flag: 62978047,
    crop: { lower_left_x: 0, lower_left_y: 1, lower_right_x: 1, lower_right_y: 1, upper_left_x: 0, upper_left_y: 0, upper_right_x: 1, upper_right_y: 0 }
  };
  const baseAMat = content.materials?.audios?.[0] || {
    id: '', type: 'extract_music', name: '', duration: durationUs, path: '', check_flag: 1
  };
  const baseVSeg = content.tracks?.[0]?.segments?.[0] || {
    id: '', material_id: '', source_timerange: { start: 0, duration: durationUs }, target_timerange: { start: 0, duration: durationUs },
    render_timerange: { start: 0, duration: 0 }, volume: 0.0, last_nonzero_volume: 0.0, extra_material_refs: [], keyframe_refs: [],
    visible: true, source: 'segmentsourcenormal', clip: { scale: { x: 1, y: 1 }, rotation: 0, transform: { x: 0, y: 0 } }
  };
  const baseASeg = content.tracks?.[1]?.segments?.[0] || {
    id: '', material_id: '', source_timerange: { start: 0, duration: durationUs }, target_timerange: { start: 0, duration: durationUs },
    render_timerange: { start: 0, duration: 0 }, volume: 1.0, last_nonzero_volume: 1.0, extra_material_refs: [], keyframe_refs: [],
    visible: true, source: 'segmentsourcenormal'
  };

  const vMats = [];
  const vSegs = [];
  let curUs = 0;
  for (let i = 0; i < mediaClips.length; i++) {
    const clip = mediaClips[i];
    const validPath = ensureVideoClip(clip.path, clip.duration);
    if (!validPath) continue;
    const matId = randomUUID().toUpperCase();
    let clipUs = Math.round((clip.duration || (durationSec / mediaClips.length)) * 1000000);
    let startUs = clip.start !== undefined ? Math.round(clip.start * 1000000) : curUs;
    if (i === 0) startUs = 0;
    if (i === mediaClips.length - 1 && startUs + clipUs < durationUs) {
      clipUs = durationUs - startUs;
    }
    const vm = JSON.parse(JSON.stringify(baseVMat));
    vm.id = matId;
    vm.path = validPath.replace(/\\/g, '/');
    vm.duration = clipUs;
    vm.material_name = path.basename(validPath);
    vm.local_material_id = randomUUID();
    vMats.push(vm);

    const vs = JSON.parse(JSON.stringify(baseVSeg));
    vs.id = randomUUID().toUpperCase();
    vs.material_id = matId;
    vs.source_timerange = { start: 0, duration: clipUs };
    vs.target_timerange = { start: startUs, duration: clipUs };
    vs.render_timerange = { start: 0, duration: 0 };
    vs.volume = 0.0;
    vs.last_nonzero_volume = 0.0;
    vSegs.push(vs);
    curUs = startUs + clipUs;
  }

  // Overlay / Motion Graphics Track (V2)
  const overlaySegs = [];
  if (overlayPath && existsSync(overlayPath)) {
    const validOverlay = ensureVideoClip(overlayPath, durationSec);
    const overlayMatId = randomUUID().toUpperCase();
    const vm = JSON.parse(JSON.stringify(baseVMat));
    vm.id = overlayMatId;
    vm.path = validOverlay.replace(/\\/g, '/');
    vm.duration = durationUs;
    vm.material_name = path.basename(validOverlay);
    vm.local_material_id = randomUUID();
    vMats.push(vm);

    const vs = JSON.parse(JSON.stringify(baseVSeg));
    vs.id = randomUUID().toUpperCase();
    vs.material_id = overlayMatId;
    vs.source_timerange = { start: 0, duration: durationUs };
    vs.target_timerange = { start: 0, duration: durationUs };
    vs.render_timerange = { start: 0, duration: 0 };
    vs.volume = 0.0;
    vs.last_nonzero_volume = 0.0;
    overlaySegs.push(vs);
  }

  // Native CapCut Text Tracks: Headings & Captions
  const tMats = [];
  const headingSegs = [];
  const captionSegs = [];

  const fontPath = 'C:/Users/da338/AppData/Local/CapCut/Apps/9.4.0.4015/Resources/Font/SystemFont/en.ttf';
  const resolvedFont = existsSync(fontPath) ? fontPath : '';

  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const startSec = sc.start !== undefined ? sc.start : (i * (durationSec / Math.max(1, scenes.length)));
    const endSec = sc.end !== undefined ? sc.end : ((i + 1) * (durationSec / Math.max(1, scenes.length)));
    const startUs = Math.round(startSec * 1000000);
    const durUs = Math.max(500000, Math.round((endSec - startSec) * 1000000));

    if (sc.heading && typeof sc.heading === 'string' && sc.heading.trim()) {
      const headingText = sc.heading.trim();
      const headingMatId = randomUUID().toUpperCase();
      const headingContent = JSON.stringify({
        styles: [{
          fill: { alpha: 1.0, content: { render_type: 'solid', solid: { alpha: 1.0, color: [1.0, 1.0, 1.0] } } },
          font: { id: '', path: resolvedFont },
          range: [0, headingText.length],
          size: 15.0
        }],
        text: headingText
      });

      tMats.push({
        id: headingMatId,
        name: headingText.slice(0, 24),
        type: 'text',
        content: headingContent,
        text_color: '#FFFFFF',
        text_alpha: 1,
        font_size: 15,
        font_title: 'none',
        font_path: resolvedFont,
        typesetting: 0,
        alignment: 1,
        has_shadow: true,
        shadow_color: '#000000',
        shadow_alpha: 0.9,
        shadow_distance: 4,
        border_alpha: 1,
        border_color: '#000000',
        border_width: 0.06,
        sub_type: 0,
        check_flag: 7
      });

      headingSegs.push({
        id: randomUUID().toUpperCase(),
        source_timerange: null,
        target_timerange: { start: startUs, duration: durUs },
        render_timerange: { start: 0, duration: 0 },
        desc: '',
        state: 0,
        speed: 1.0,
        is_loop: false,
        volume: 1.0,
        last_nonzero_volume: 1.0,
        clip: {
          scale: { x: 1.0, y: 1.0 },
          rotation: 0,
          transform: { x: 0, y: -0.65 },
          flip: { vertical: false, horizontal: false },
          alpha: 1.0
        },
        uniform_scale: { on: true, value: 1.0 },
        material_id: headingMatId,
        extra_material_refs: [],
        render_index: 14000,
        keyframe_refs: [],
        visible: true,
        source: 'segmentsourcenormal'
      });
    }

    if (sc.caption && typeof sc.caption === 'string' && sc.caption.trim()) {
      const captionText = sc.caption.trim();
      const captionMatId = randomUUID().toUpperCase();
      const captionContent = JSON.stringify({
        styles: [{
          fill: { alpha: 1.0, content: { render_type: 'solid', solid: { alpha: 1.0, color: [0.94, 0.88, 0.72] } } },
          font: { id: '', path: resolvedFont },
          range: [0, captionText.length],
          size: 10.0
        }],
        text: captionText
      });

      tMats.push({
        id: captionMatId,
        name: captionText.slice(0, 24),
        type: 'text',
        content: captionContent,
        text_color: '#F0E0B8',
        text_alpha: 1,
        font_size: 10,
        font_title: 'none',
        font_path: resolvedFont,
        typesetting: 0,
        alignment: 1,
        has_shadow: true,
        shadow_color: '#000000',
        shadow_alpha: 0.9,
        shadow_distance: 3,
        border_alpha: 1,
        border_color: '#000000',
        border_width: 0.05,
        sub_type: 0,
        check_flag: 7
      });

      captionSegs.push({
        id: randomUUID().toUpperCase(),
        source_timerange: null,
        target_timerange: { start: startUs, duration: durUs },
        render_timerange: { start: 0, duration: 0 },
        desc: '',
        state: 0,
        speed: 1.0,
        is_loop: false,
        volume: 1.0,
        last_nonzero_volume: 1.0,
        clip: {
          scale: { x: 1.0, y: 1.0 },
          rotation: 0,
          transform: { x: 0, y: 0.72 },
          flip: { vertical: false, horizontal: false },
          alpha: 1.0
        },
        uniform_scale: { on: true, value: 1.0 },
        material_id: captionMatId,
        extra_material_refs: [],
        render_index: 14001,
        keyframe_refs: [],
        visible: true,
        source: 'segmentsourcenormal'
      });
    }
  }

  const aMats = [];
  const voiceSegs = [];
  if (voicePath && existsSync(voicePath)) {
    const voiceMatId = randomUUID().toUpperCase();
    const am = JSON.parse(JSON.stringify(baseAMat));
    am.id = voiceMatId;
    am.path = voicePath.replace(/\\/g, '/');
    am.duration = durationUs;
    am.name = path.basename(voicePath);
    aMats.push(am);

    const as = JSON.parse(JSON.stringify(baseASeg));
    as.id = randomUUID().toUpperCase();
    as.material_id = voiceMatId;
    as.source_timerange = { start: 0, duration: durationUs };
    as.target_timerange = { start: 0, duration: durationUs };
    as.render_timerange = { start: 0, duration: 0 };
    as.volume = 1.0;
    as.last_nonzero_volume = 1.0;
    voiceSegs.push(as);
  }

  const bgmSegs = [];
  if (bgmPath && existsSync(bgmPath)) {
    const bgmMatId = randomUUID().toUpperCase();
    const am = JSON.parse(JSON.stringify(baseAMat));
    am.id = bgmMatId;
    am.path = bgmPath.replace(/\\/g, '/');
    am.duration = durationUs;
    am.name = path.basename(bgmPath);
    aMats.push(am);

    const as = JSON.parse(JSON.stringify(baseASeg));
    as.id = randomUUID().toUpperCase();
    as.material_id = bgmMatId;
    as.source_timerange = { start: 0, duration: durationUs };
    as.target_timerange = { start: 0, duration: durationUs };
    as.render_timerange = { start: 0, duration: 0 };
    as.volume = 0.22;
    as.last_nonzero_volume = 0.22;
    bgmSegs.push(as);
  }

  content.materials = content.materials || {};
  content.materials.videos = vMats;
  content.materials.audios = aMats;
  content.materials.texts = tMats;

  const tracks = [];
  let trackIdx = 0;
  if (vSegs.length > 0) {
    tracks.push({ id: randomUUID().toUpperCase(), type: 'video', render_index: trackIdx++, attribute: 0, flag: 0, segments: vSegs });
  }
  if (overlaySegs.length > 0) {
    tracks.push({ id: randomUUID().toUpperCase(), type: 'video', render_index: trackIdx++, attribute: 0, flag: 0, name: 'Remotion Overlay', segments: overlaySegs });
  }
  if (headingSegs.length > 0) {
    tracks.push({ id: randomUUID().toUpperCase(), type: 'text', render_index: trackIdx++, attribute: 0, flag: 0, name: 'Headings', segments: headingSegs });
  }
  if (captionSegs.length > 0) {
    tracks.push({ id: randomUUID().toUpperCase(), type: 'text', render_index: trackIdx++, attribute: 0, flag: 0, name: 'Captions', segments: captionSegs });
  }
  if (voiceSegs.length > 0) {
    tracks.push({ id: randomUUID().toUpperCase(), type: 'audio', render_index: trackIdx++, attribute: 0, flag: 0, segments: voiceSegs });
  }
  if (bgmSegs.length > 0) {
    tracks.push({ id: randomUUID().toUpperCase(), type: 'audio', render_index: trackIdx++, attribute: 0, flag: 0, segments: bgmSegs });
  }
  content.tracks = tracks;

  // Write draft_content.json and backup and tmps
  const contentStr = JSON.stringify(content, null, 2);
  await writeFile(path.join(capcutDraftDir, 'draft_content.json'), contentStr, 'utf-8');
  await writeFile(path.join(capcutDraftDir, 'draft_content.json.bak'), contentStr, 'utf-8');
  await writeFile(path.join(capcutDraftDir, 'template.tmp'), contentStr, 'utf-8');
  await writeFile(path.join(capcutDraftDir, 'template-2.tmp'), contentStr, 'utf-8');

  // Write draft_settings
  const settingsStr = `[General]\ndraft_create_time=${nowSec}\ndraft_last_edit_time=${nowSec}\nreal_edit_seconds=0\nreal_edit_keys=1\n`;
  await writeFile(path.join(capcutDraftDir, 'draft_settings'), settingsStr, 'utf-8');

  // Write Timelines structure
  const timelinesDir = path.join(capcutDraftDir, 'Timelines');
  const timelineUuidDir = path.join(timelinesDir, draftId);
  await mkdir(timelineUuidDir, { recursive: true });

  const projectJson = {
    config: { color_space: 0, hdr_vivid: false, mixed_track_mode_on: false, render_index_track_mode_on: false, use_float_render: false },
    create_time: nowUsec,
    id: draftId,
    main_timeline_id: draftId,
    timelines: [
      { create_time: nowUsec, id: draftId, is_marked_delete: false, name: 'Timeline 01', update_time: nowUsec }
    ],
    update_time: nowUsec,
    version: 0
  };
  await writeFile(path.join(timelinesDir, 'project.json'), JSON.stringify(projectJson, null, 2), 'utf-8');
  await writeFile(path.join(timelinesDir, 'project.json.bak'), JSON.stringify(projectJson, null, 2), 'utf-8');

  await writeFile(path.join(timelineUuidDir, 'draft_content.json'), contentStr, 'utf-8');
  await writeFile(path.join(timelineUuidDir, 'draft_content.json.bak'), contentStr, 'utf-8');
  await writeFile(path.join(timelineUuidDir, 'template.tmp'), contentStr, 'utf-8');
  await writeFile(path.join(timelineUuidDir, 'template-2.tmp'), contentStr, 'utf-8');

  // Handle Cover Image
  const targetCover = path.join(capcutDraftDir, 'draft_cover.jpg');
  if (coverImagePath && existsSync(coverImagePath)) {
    await copyFile(coverImagePath, targetCover);
  } else if (vMats[0]?.path && existsSync(vMats[0].path)) {
    try {
      execSync(`ffmpeg -y -ss 00:00:02 -i "${vMats[0].path}" -frames:v 1 -q:v 2 "${targetCover}"`, { stdio: 'ignore' });
    } catch {}
  }

  // Write draft_meta_info.json
  const meta = {
    draft_cloud_last_action_download: false,
    draft_cloud_purchase_info: '',
    draft_cloud_template_id: '',
    draft_cloud_tutorial_info: '',
    draft_cloud_videocut_purchase_info: '',
    draft_cover: 'draft_cover.jpg',
    draft_fold_path: `${CAPCUT_ROOT}/${draftName}`.replace(/\\/g, '/'),
    draft_id: draftId,
    draft_is_ai_clip: false,
    draft_is_ai_shorts: false,
    draft_is_ai_subdraft: false,
    draft_is_business: false,
    draft_is_cloud_enterprise: false,
    draft_is_enterprise_video: false,
    draft_is_from_deeplink: 'false',
    draft_is_invisible: false,
    draft_is_rich_text: false,
    draft_is_ugc_template: false,
    draft_materials: [
      { type: 0, value: vMats.map(m => ({ file_Path: m.path, height: 1080, id: m.id, import_time: nowSec, type: 0, width: 1920 })) },
      { type: 1, value: aMats.map(m => ({ file_Path: m.path, height: 0, id: m.id, import_time: nowSec, type: 1, width: 0 })) }
    ],
    draft_name: draftName,
    draft_need_rename_folder: false,
    draft_new_version: '9.4.0',
    draft_root_path: CAPCUT_ROOT.replace(/\\/g, '/'),
    tm_draft_create: nowUsec,
    tm_draft_modified: nowUsec,
    tm_duration: durationUs
  };
  await writeFile(path.join(capcutDraftDir, 'draft_meta_info.json'), JSON.stringify(meta, null, 2), 'utf-8');

  // Backup in projectDir
  if (projectDir) {
    const backupDir = path.join(projectDir, 'capcut_draft');
    await mkdir(backupDir, { recursive: true });
    await copyFile(path.join(capcutDraftDir, 'draft_content.json'), path.join(backupDir, 'draft_content.json'));
    await copyFile(path.join(capcutDraftDir, 'draft_meta_info.json'), path.join(backupDir, 'draft_meta_info.json'));
    if (existsSync(targetCover)) await copyFile(targetCover, path.join(backupDir, 'draft_cover.jpg'));
  }

  // Update root_meta_info.json
  const rootMetaPath = path.join(CAPCUT_ROOT, 'root_meta_info.json');
  try {
    const rootEntry = {
      cloud_draft_cover: false,
      cloud_draft_sync: false,
      draft_cloud_last_action_download: false,
      draft_cloud_purchase_info: '',
      draft_cloud_template_id: '',
      draft_cloud_tutorial_info: '',
      draft_cloud_videocut_purchase_info: '',
      draft_cover: `${CAPCUT_ROOT}/${draftName}/draft_cover.jpg`.replace(/\\/g, '/'),
      draft_fold_path: `${CAPCUT_ROOT}/${draftName}`.replace(/\\/g, '/'),
      draft_id: draftId,
      draft_is_ai_shorts: false,
      draft_is_cloud_temp_draft: false,
      draft_is_infinite_canvas_draft: false,
      draft_is_invisible: false,
      draft_is_pippit_draft: false,
      draft_is_web_article_video: false,
      draft_json_file: `${CAPCUT_ROOT}/${draftName}/draft_content.json`.replace(/\\/g, '/'),
      draft_name: draftName,
      draft_new_version: '9.4.0',
      draft_root_path: CAPCUT_ROOT.replace(/\\/g, '/'),
      draft_timeline_materials_size: 25000000,
      draft_type: '',
      draft_web_article_video_enter_from: '',
      pippit_avatar_url: '',
      pippit_extra_info: '',
      pippit_id: '',
      pippit_user_name: '',
      streaming_edit_draft_ready: true,
      tm_draft_cloud_completed: '',
      tm_draft_cloud_entry_id: -1,
      tm_draft_cloud_modified: 0,
      tm_draft_cloud_parent_entry_id: -1,
      tm_draft_cloud_space_id: -1,
      tm_draft_cloud_user_id: -1,
      tm_draft_create: nowUsec,
      tm_draft_modified: nowUsec,
      tm_draft_removed: 0,
      tm_duration: durationUs
    };

    let rootData = { all_draft_store: [], draft_ids: 44, root_path: CAPCUT_ROOT.replace(/\\/g, '/') };
    if (existsSync(rootMetaPath)) {
      try { rootData = JSON.parse(await readFile(rootMetaPath, 'utf-8')); } catch {}
    }
    const allDrafts = (rootData.all_draft_store || []).filter(d => d.draft_name !== draftName);
    allDrafts.unshift(rootEntry);
    rootData.all_draft_store = allDrafts;
    await writeFile(rootMetaPath, JSON.stringify(rootData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Warning: could not update root_meta_info.json:', err);
  }

  return { draftName, draftId, path: capcutDraftDir };
}
