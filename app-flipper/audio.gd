extends Node
## Sounds rendered from the web version (WebAudio, offline) and played with polyphonic players.
## Two buses: dry and "Verb" (reverb send), both into Master (compressor + limiter).

var S = {}            # name -> AudioStreamWAV
var GRID = {}         # instrument -> PackedInt32Array of midi pitches available
var pdry: AudioStreamPlaybackPolyphonic
var pver: AudioStreamPlaybackPolyphonic
var muted = false
const VERB := ["note_", "nbrass_", "fan_", "ant", "target", "ramp_", "warp", "eject", "jackpot_", "drain_", "rock", "snare", "cymbal",
	"pluck_", "steel_", "arpT_", "drone_", "prep_", "tone_", "tri_", "triL_", "drop"]

func _ready() -> void:
	var m = AudioServer.get_bus_index("Master")
	var comp = AudioEffectCompressor.new(); comp.threshold = -16; comp.ratio = 5; comp.attack_us = 3000; comp.release_ms = 250
	AudioServer.add_bus_effect(m, comp)
	var lim = AudioEffectHardLimiter.new(); lim.ceiling_db = -0.5
	AudioServer.add_bus_effect(m, lim)
	AudioServer.add_bus(); var vb = AudioServer.bus_count - 1
	AudioServer.set_bus_name(vb, "Verb"); AudioServer.set_bus_send(vb, "Master")
	var rv = AudioEffectReverb.new(); rv.room_size = 0.62; rv.damping = 0.45; rv.spread = 0.8; rv.wet = 0.22; rv.dry = 1.0; rv.predelay_msec = 20
	AudioServer.add_bus_effect(vb, rv)
	AudioServer.set_bus_volume_db(m, -1.0)
	var d = DirAccess.open("res://assets/snd")
	for f in d.get_files():
		var fn = f.trim_suffix(".import")
		if not fn.ends_with(".wav") or S.has(fn.get_basename()): continue
		var nm = fn.get_basename()
		S[nm] = load("res://assets/snd/" + fn)
		var parts = nm.split("_")
		if parts.size() == 2 and parts[1].is_valid_int() and nm.begins_with(parts[0]) and not nm.begins_with("note") and not nm.begins_with("nbrass") and not nm.begins_with("sling") and not nm.begins_with("ramp") and not nm.begins_with("jackpot") and not nm.begins_with("drain"):
			if not GRID.has(parts[0]): GRID[parts[0]] = PackedInt32Array()
			GRID[parts[0]].append(int(parts[1]))
	for k in GRID: GRID[k].sort()
	pdry = _player("Master")
	pver = _player("Verb")
	var cf = ConfigFile.new()
	if cf.load("user://flipper.cfg") == OK: muted = cf.get_value("p", "mute", false)

func _player(bus: String) -> AudioStreamPlaybackPolyphonic:
	var p = AudioStreamPlayer.new(); var st = AudioStreamPolyphonic.new(); st.polyphony = 40
	p.stream = st; p.bus = bus; add_child(p); p.play()
	return p.get_stream_playback()

func set_mute(v: bool) -> void:
	muted = v
	AudioServer.set_bus_mute(AudioServer.get_bus_index("Master"), v)
	var cf = ConfigFile.new(); cf.load("user://flipper.cfg"); cf.set_value("p", "mute", v); cf.save("user://flipper.cfg")

func _is_verb(nm: String) -> bool:
	for p in VERB:
		if nm.begins_with(p): return true
	return false

## play a sample by name; vol is linear (1 = as rendered)
func play(nm: String, vol := 1.0, pitch := 1.0) -> void:
	if muted or not S.has(nm) or vol <= 0.0005: return
	var pb = pver if _is_verb(nm) else pdry
	pb.play_stream(S[nm], 0.0, linear_to_db(vol), pitch)

## play a pitched instrument at midi m
func inst(name: String, m: float, vol := 1.0) -> void:
	if not GRID.has(name): return
	var g: PackedInt32Array = GRID[name]
	var best = g[0]
	for p in g:
		if absf(p - m) < absf(best - m): best = p
	play(name + "_" + str(best), vol, pow(2.0, (m - best) / 12.0))
