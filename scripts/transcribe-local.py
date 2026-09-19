import sys, os, json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(root/'renderer/.python'))
os.environ['HF_HUB_DISABLE_TELEMETRY']='1'
from faster_whisper import WhisperModel
model=WhisperModel('base.en',device='cpu',compute_type='int8',download_root=str(root/'renderer/.models'))
audio=Path(sys.argv[1]) if len(sys.argv)>1 else root/'data/0bdc37fa-2353-4721-9252-5d74d99cd700/voice.mp3'
output=Path(sys.argv[2]) if len(sys.argv)>2 else root/'renderer/public/pilot/transcript.json'
segments,info=model.transcribe(str(audio),word_timestamps=True,beam_size=3)
out=[]
for s in segments:
    out.append({'start':s.start,'end':s.end,'text':s.text,'words':[{'word':w.word,'start':w.start,'end':w.end} for w in s.words]})
    print(f'{s.start:.2f} - {s.end:.2f}: {s.text}',flush=True)
output.write_text(json.dumps(out,indent=2))
