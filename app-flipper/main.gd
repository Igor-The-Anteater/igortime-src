extends Node
## Igor's Music Pinball — native version (Godot 4.3, GL Compatibility).
## Port of flipper/index.html v8: same 2D physics on the playfield (x across, y up the table, R=.27),
## same rules, the table meshes exported from the web version (glTF), sounds rendered from WebAudio.

const UI_SCRIPT := preload("res://ui.gd")
var ui
var IT = true
func tt(e: String, i: String) -> String: return i if IT else e
func L2(a) -> String: return (a[1] if IT else a[0]) if a is Array else str(a)

# ================= music data =================
var NOTE_N: Array
const NOTE_M := [60, 62, 64, 65, 67, 69, 71]
const NOTE_C := ["#ff5a5a", "#ff9a3c", "#ffd84a", "#7fd96a", "#4fd1e8", "#6a86ff", "#c77dff"]
const MIS := [
	{N = ["C major", "Do maggiore"], n = [0, 2, 4]},
	{N = ["A minor", "La minore"], n = [5, 0, 2]},
	{N = ["F major", "Fa maggiore"], n = [3, 5, 0]},
	{N = ["G seventh", "Sol settima"], n = [4, 6, 1, 3]},
	{N = ["D minor seventh", "Re minore settima"], n = [1, 3, 5, 0]},
	{N = ["C major seventh", "Do settima maggiore"], n = [0, 2, 4, 6]},
	{N = ["The whole scale!", "Tutta la scala!"], n = [0, 1, 2, 3, 4, 5, 6]}]
const MODES := [
	{k = "chords", N = ["Chords", "Accordi"], ic = 0, T = 80, need = 3, how = ["Light the notes of 3 chords in the top lanes!", "Accendi nelle corsie in alto le note di 3 accordi!"]},
	{k = "drums", N = ["Drum solo", "Assolo di batteria"], ic = 1, T = 40, need = 40, how = ["Drum solo: hit the drums 40 times!", "Assolo: colpisci la batteria 40 volte!"]},
	{k = "ff", N = ["Fortissimo", "Fortissimo"], ic = 2, T = 50, need = 3, how = ["Knock down the statue: only fortissimo hits count!", "Abbatti la statua: valgono solo i colpi fortissimo!"]},
	{k = "ear", N = ["Which note?", "Che nota è?"], ic = 3, T = 60, need = 3, how = ["Listen to my note and hit its lane!", "Ascolta la mia nota e prendi la sua corsia!"]},
	{k = "key", N = ["Key signature", "Armatura"], ic = 4, T = 60, need = 1, how = ["Each lane: natural, sharp, flat. Set the right key signature!", "Ogni corsia: naturale, diesis, bemolle. Metti l’armatura giusta!"]},
	{k = "metro", N = ["Metronome", "Metronomo"], ic = 5, T = 60, need = 3, how = ["Ramps and orbits on the beat of the metronome!", "Rampe e orbite a tempo col metronomo!"]},
	{k = "tune", N = ["Melody", "Melodia"], ic = 6, T = 60, need = 1, how = ["Play the melody: take the lanes in order!", "Suona la melodia: prendi le corsie in ordine!"]}]
const RANKS := [["Student", "Allievo"], ["Player", "Orchestrale"], ["Soloist", "Solista"], ["Concertmaster", "Primo violino"], ["Maestro", "Maestro"], ["Soloist star", "Solista stella"], ["Conductor", "Direttore"]]
const KEYS := [{N = ["G major", "Sol maggiore"], a = {3: 1}}, {N = ["F major", "Fa maggiore"], a = {6: -1}}, {N = ["D major", "Re maggiore"], a = {3: 1, 0: 1}}, {N = ["B♭ major", "Si♭ maggiore"], a = {6: -1, 2: -1}}]
const TUNES := [{N = ["Frère Jacques", "Fra Martino"], n = [0, 1, 2, 0]}, {N = ["Ode to Joy", "Inno alla gioia"], n = [2, 2, 3, 4]}, {N = ["Twinkle Twinkle", "Brilla brilla stellina"], n = [0, 0, 4, 4]}, {N = ["Happy Birthday", "Tanti auguri"], n = [4, 4, 5, 4]}]
const DYN := ["pp", "p", "mp", "mf", "f", "ff"]
func acc_of(v) -> String: return "♯" if v == 1 else ("♭" if v == -1 else "")
func chord_names(mi) -> String:
	var r = []
	for k in mi.n: r.append(NOTE_N[k])
	return " · ".join(r)
func chord_midi(n: Array) -> Array:
	var r = []; var last = -1
	for k in n:
		var m: int = NOTE_M[k] - 12
		while m <= last: m += 12
		r.append(m); last = m
	return r

const TH := {
	home = {N = ["Igor’s island", "L’isola di Igor"], host = "igorlet", sky = "#10223f", sea = "#163a5c", hemi = ["#ffe2b8", "#24406a"], acc = "#9be38a", acc2 = "#ffd36e", ramp = "#ffd36e", ap = ["#5a3a20", "#3a2513"], bonus = "", hi = ["", ""]},
	carib = {N = ["Caribbean island", "Isola caraibica"], host = "barigor", sky = "#1b4a78", sea = "#1f7f9a", hemi = ["#e8dcc0", "#2f6f7a"], acc = "#4fd1c5", acc2 = "#ff9a3c", ramp = "#4fd1c5", ap = ["#0f5a63", "#0a3a42"], bonus = "ramp",
		hi = ["Welcome to the Caribbean island! Here the ramp is worth double: smoothies for everyone!", "Benvenuto sull’isola caraibica! Qui la rampa vale doppio: frullati per tutti!"]},
	lake = {N = ["Gondoligor’s lake", "Il lago di Gondoligor"], host = "gondoligor", sky = "#16305a", sea = "#1c4f7a", hemi = ["#e2ecff", "#1f4f7a"], acc = "#9fd3ff", acc2 = "#ff8ab6", ramp = "#9fd3ff", ap = ["#173a5a", "#0f263d"], bonus = "orbit",
		hi = ["Ohi! On my lake the orbit is worth double!", "Ohi! Sul mio lago l’orbita vale il doppio!"]},
	shroom = {N = ["Mushroom wood", "Il bosco dei funghi"], host = "cagigor", sky = "#0b1a12", sea = "#0f2a1a", hemi = ["#d8ffd0", "#14301c"], acc = "#9bff5a", acc2 = "#ff5a8a", ramp = "#9bff5a", ap = ["#14261a", "#0b170f"], bonus = "drums",
		hi = ["Shh… in the wood the drums are worth double.", "Shh… nel bosco la batteria vale il doppio."]}}
var THEME = "home"
func th_mul(k: String) -> int: return 2 if TH[THEME].bonus == k else 1

# ================= helpers =================
const CX := 0.4
const CY := 10.5
const R := 0.27
func P(x: float, y: float, h := 0.0) -> Vector3: return Vector3(x - CX, h, CY - y)
func hyp(a: float, b: float) -> float: return sqrt(a * a + b * b)
func fmt(n) -> String:
	var s = str(int(round(n))); var out = ""; var c = 0
	for i in range(s.length() - 1, -1, -1):
		out = s[i] + out; c += 1
		if c % 3 == 0 and i > 0 and s[i - 1] != "-": out = ("." if IT else ",") + out
	return out
func later(sec: float, cb: Callable) -> void:
	get_tree().create_timer(sec, false).timeout.connect(cb)
func now() -> float: return Time.get_ticks_msec() / 1000.0

# ================= physics bodies =================
class Seg:
	var ax: float; var ay: float; var bx: float; var by: float; var dx: float; var dy: float; var l2: float
	var rad: float; var e: float; var kick: float; var tag: String; var on: bool; var one: bool
	var onx: float; var ony: float; var k: int = -1; var i: int = -1; var cx: float; var cy: float
class Circ:
	var x: float; var y: float; var R: float; var e: float; var kick: float; var tag: String; var on: bool
	var vx = 0.0; var vy = 0.0; var i: int = -1
class Flip:
	var px: float; var py: float; var side: int; var len: float; var r0: float; var r1: float
	var rest: float; var up: float; var w = 0.0; var press = false; var ang: float
class Ball:
	var x = 0.0; var y = 0.0; var vx = 0.0; var vy = 0.0; var mode = "play"; var h = 0.0; var hv = 0.0
	var stuck = 0.0; var cap = 0.0; var u = 0.0; var spd = 0.0; var ins = {}
	var has_auto = false; var auto = 0.0; var auto0 = false; var gold = false; var awarded = false; var hold = 0.0; var lock_glow = 0.0
	var gp: PackedVector3Array; var gl: PackedFloat32Array; var glen = 0.0; var ps = 1
	var m: MeshInstance3D; var sh: MeshInstance3D; var trail = []; var hist = []; var hi = 0; var hn = 0; var rot = Basis()

var SEGS: Array[Seg] = []
var CIRCS: Array[Circ] = []
var FL: Array[Flip] = []
var SENS = []
var GATES = []; var DROPS = []; var IGT = []; var BUMPS = []
var WAND: Circ; var CLEF: Circ; var FLAG: Circ; var FFS: Circ
var FLL: Flip; var FLR: Flip; var FLU: Flip
const SAUCER := Vector2(-1.6, 16.1)
const PLUNGE := Vector2(5.0, 0.9 + 0.27 + 0.01)
const XL := -4.6; const XR := 4.6; const XO := 5.4; const YB := -1.6; const YT := 21.3
const LANE_G := [-1.95, -1.15, -0.35, 0.45, 1.25, 2.05, 2.85, 3.65]
var LANE_X = []
const LANE_Y0 := 17.4
const DRUM_C := ["#e0463c", "#4fd1e8", "#ffd84a"]
const BLANES := [[-4.175, 4.8], [-3.3, 5.05], [3.3, 5.05], [4.175, 4.8]]
const TOK_SPOTS := [[-2.2, 10.2], [-0.3, 15.45], [2.55, 13.6], [-0.9, 5.9], [0.95, 5.9], [2.3, 7.6]]
# broadphase grid
const GX0 := -5.5; const GY0 := -2.5; const GC := 1.0; const GW := 13; const GH := 26
var gseg = []; var gcirc = []

func flipper(px, py, side, len := 1.55, r0 := 0.24, r1 := 0.12, rest := 0.52, up := 0.46) -> Flip:
	var f = Flip.new(); f.px = px; f.py = py; f.side = side; f.len = len; f.r0 = r0; f.r1 = r1
	f.rest = -rest if side < 0 else PI + rest; f.up = up if side < 0 else PI - up; f.ang = f.rest; FL.append(f); return f

func load_bodies(data: Dictionary) -> void:
	for d in data.segs:
		var s = Seg.new(); s.ax = d.ax; s.ay = d.ay; s.bx = d.bx; s.by = d.by; s.dx = s.bx - s.ax; s.dy = s.by - s.ay
		s.l2 = max(1e-6, s.dx * s.dx + s.dy * s.dy); s.rad = d.rad; s.e = d.e; s.kick = d.kick; s.tag = d.tag; s.on = d.on; s.one = d.one
		var ln = sqrt(s.l2); s.onx = s.dy / ln; s.ony = -s.dx / ln
		if d.get("k") != null: s.k = int(d.k)
		if d.get("i") != null: s.i = int(d.i)
		if d.get("cx") != null: s.cx = d.cx
		if d.get("cy") != null: s.cy = d.cy
		SEGS.append(s)
		if s.tag == "gate": GATES.append(s)
		elif s.tag == "drop": DROPS.append(s)
		elif s.tag == "igor": IGT.append(s)
	for d in data.circs:
		var c = Circ.new(); c.x = d.x; c.y = d.y; c.R = d.R; c.e = d.e; c.kick = d.kick; c.tag = d.tag; c.on = d.on
		if d.get("i") != null: c.i = int(d.i)
		CIRCS.append(c)
		match c.tag:
			"bumper": BUMPS.append(c)
			"wander": WAND = c
			"clef": CLEF = c
			"flag": FLAG = c
			"ffs": FFS = c
	GATES.sort_custom(func(a, b): return a.k < b.k)
	DROPS.sort_custom(func(a, b): return a.i < b.i)
	IGT.sort_custom(func(a, b): return a.i < b.i)
	BUMPS.sort_custom(func(a, b): return a.i < b.i)
	FLL = flipper(-1.75, 2.4, -1); FLR = flipper(1.75, 2.4, 1); FLU = flipper(-3.22, 14.9, -1, 1.1, 0.2, 0.1, 0.45, 0.5)
	for x in LANE_G.slice(0, 7): LANE_X.append(x + 0.4)
	# grid: every static shape in every cell its (inflated) bounding box touches; moving circles (wander, clef) are tested always
	gseg.resize(GW * GH); gcirc.resize(GW * GH)
	for i in GW * GH: gseg[i] = []; gcirc[i] = []
	var m = R + 0.6
	for s in SEGS: _grid_add(gseg, s, min(s.ax, s.bx) - s.rad - m, max(s.ax, s.bx) + s.rad + m, min(s.ay, s.by) - s.rad - m, max(s.ay, s.by) + s.rad + m)
	for c in CIRCS:
		if c.tag == "wander" or c.tag == "clef": continue
		_grid_add(gcirc, c, c.x - c.R - m, c.x + c.R + m, c.y - c.R - m, c.y + c.R + m)

func _grid_add(g: Array, o, x0: float, x1: float, y0: float, y1: float) -> void:
	for gy in range(max(0, int(floor((y0 - GY0) / GC))), min(GH - 1, int(floor((y1 - GY0) / GC))) + 1):
		for gx in range(max(0, int(floor((x0 - GX0) / GC))), min(GW - 1, int(floor((x1 - GX0) / GC))) + 1):
			g[gy * GW + gx].append(o)

func sens_line(ax, ay, bx, by, fn: Callable) -> void: SENS.append({line = true, ax = ax, ay = ay, bx = bx, by = by, fn = fn})
func sens_circ(x, y, r, fn: Callable) -> void: SENS.append({line = false, x = x, y = y, r = r, fn = fn, id = SENS.size()})

# ================= game state =================
var GS = {}
var BALLS: Array[Ball] = []
var ANT = null
var ant_t = 6.0
var TOK = null
var tok_t = 14.0
var paused = false
var RAMP_PTS: PackedVector3Array
var RAMP_LEN = 28.36
const RAMP_VY := 4.5
const GOLD := [0.55, 0.7]
const METRO_P := 0.8
const G_ := 32.0
const VMAX := 48.0
const FLIP_PASS := 7.0
var PHYS_HZ = 600
var MU = {on = false, next = 0.0, step = 0, bpm = 90.0, en = 0.0}
var ARC = {on = false, phase = "", t = 0.0, n = 0, key = "", G = {}, after = null, res = {}}
const ARC_ORDER := ["gnam", "bumcia"]
const ARC_GAMES := {
	gnam = {N = ["GNAM!", "GNAM!"], how = ["Move Igor with the flippers: catch the 15 tofu ants!", "Muovi Igor con i flipper: prendi le 15 formiche di tofu!"]},
	bumcia = {N = ["BUM CIÀ!", "BUM CIÀ!"], how = ["Hit the drum (left or right flipper) when the note reaches the line!", "Batti il tamburo (flipper sinistro o destro) quando la nota arriva sulla riga!"]}}
var best = 0

func reset_gs() -> void:
	GS = {state = "title", score = 0, shown = 0.0, ball = 1, balls = 3, mi = 0, loop = 1, bx = 1, pfx = 1, pfxT = 0.0, beats = 0, grooveLv = 0, lit = [0, 0, 0, 0, 0, 0, 0], jack = 0.0,
		igor = [0, 0, 0, 0], drop = [0, 0, 0], bl = [0, 0, 0, 0], polyStars = 0, polyReady = false, multi = false, polyT = [-9.0, -9.0, -9.0, -9.0, -9.0, -9.0, -9.0], save = 0.0, themeT = 0.0,
		mode = -1, modeT = 0.0, mp = 0, done = [false, false, false, false, false, false, false], rank = 0, sel = 0, flag = 0, ready = false, finale = 0.0, acc = [0, 0, 0, 0, 0, 0, 0],
		combo = 0, comboT = 0.0, skill = -1, skillT = 0.0, t = 0.0, shake = 0.0, ants = 0, antsEver = 0, ramps = 0, orbits = 0, drums = 0, notes = 0, plunge = 0.0, charging = false,
		extraGiven = false, clefT = 6.0, clefU = 0.0, ffHits = 0, dynI = -1, dynT = -9.0, ear = 0, earT = 0.0, key = KEYS[0], tune = TUNES[0], tuneI = 0, metro0 = 0.0, metroN = -1}
func groove_need() -> int: return 20 + GS.grooveLv * 10
func MODE():
	return MODES[GS.mode].k if GS.mode >= 0 else ""

# ================= 3D =================
var sv: SubViewport
var cam: Camera3D
var env: Environment
var table: Node3D
var gi: OmniLight3D
var sun: DirectionalLight3D
var sea_mat: StandardMaterial3D
var N = {}  # named nodes
var INS = []   # {m, halo, mat, hmat, col_on, col_off, st, base}
var I = {}
var BULBS = []
var ACCENT_MATS = []
var pf_mat: StandardMaterial3D
var ramp_mat: StandardMaterial3D
var flag_mat: StandardMaterial3D
var apron_mat: StandardMaterial3D
var drum_mats = []
var gate_mats = []
var band_mats = []
var SPR = {}
var CHAR = {}
var clef_spr: Sprite3D
var ffbar: Sprite3D
var ball_mat: Material
var trail_mats = []
var shadow_tex: Texture2D
var dot_tex: Texture2D
var parts: MultiMeshInstance3D
const PN := 400
var PD = []
var p_i = 0
var cam_base = Vector3()
var cam_basis = Basis()
var tex_cache = {}
func tex(path: String) -> Texture2D:
	if not tex_cache.has(path): tex_cache[path] = load(path)
	return tex_cache[path]

func _ready() -> void:
	var lang = "it"
	var loc = OS.get_locale_language()
	if loc != "it": IT = false
	if OS.get_cmdline_user_args().has("it"): IT = true
	if not IT: lang = "en"
	NOTE_N = ["DO", "RE", "MI", "FA", "SOL", "LA", "SI"] if IT else ["C", "D", "E", "F", "G", "A", "B"]
	if OS.has_feature("mobile"): PHYS_HZ = 600
	var cf = ConfigFile.new()
	if cf.load("user://flipper.cfg") == OK: best = cf.get_value("p", "best", 0)
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/data.json"))
	load_bodies(data)
	RAMP_LEN = data.rampLen
	for p in data.ramp: RAMP_PTS.append(Vector3(p[0], p[1], p[2]))
	reset_gs()
	_build_world(lang, data)
	_sensors()
	ui = UI_SCRIPT.new(); ui.M = self; add_child(ui); ui.build()
	set_mission(0); spawn_ant(); set_theme("home", true); flag_tex()
	var d = new_ball(0, 16, "play"); d.vx = 6; d.vy = -2
	get_viewport().size_changed.connect(fit)
	fit()
	if OS.get_cmdline_user_args().has("shot"):
		var tn = load("res://test.gd").new(); tn.M = self; add_child(tn)

func _build_world(lang: String, data: Dictionary) -> void:
	sv = SubViewport.new(); sv.msaa_3d = Viewport.MSAA_2X if not OS.has_feature("mobile") else Viewport.MSAA_2X
	sv.render_target_update_mode = SubViewport.UPDATE_ALWAYS; sv.own_world_3d = true
	add_child(sv)
	env = Environment.new()
	var sky = Sky.new(); var sm = ShaderMaterial.new(); var sh = Shader.new()
	sh.code = "shader_type sky; uniform sampler2D pano: source_color, filter_linear; uniform vec3 bg: source_color; void sky(){ if(AT_CUBEMAP_PASS){ COLOR = texture(pano, SKY_COORDS).rgb; } else { COLOR = bg; } }"
	sm.shader = sh; sm.set_shader_parameter("pano", tex("res://assets/img/env.png")); sm.set_shader_parameter("bg", Color("#10223f"))
	sky.sky_material = sm; sky.radiance_size = Sky.RADIANCE_SIZE_64
	env.background_mode = Environment.BG_SKY; env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR; env.ambient_light_color = Color("#c9b89a"); env.ambient_light_energy = 0.9
	env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
	env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	env.fog_enabled = false
	var we = WorldEnvironment.new(); we.environment = env; sv.add_child(we)
	sun = DirectionalLight3D.new(); sun.light_color = Color("#fff0d8"); sun.light_energy = 0.85; sv.add_child(sun)
	sun.look_at_from_position(Vector3(-3, 14, -10), Vector3.ZERO)
	var fill = DirectionalLight3D.new(); fill.light_color = Color("#24406a"); fill.light_energy = 0.25; sv.add_child(fill)
	fill.look_at_from_position(Vector3(2, -6, 4), Vector3.ZERO)
	gi = OmniLight3D.new(); gi.light_color = Color("#d7defa"); gi.light_energy = 1.1; gi.omni_range = 30; gi.omni_attenuation = 1.6; gi.position = P(0, 10, 6); sv.add_child(gi)
	cam = Camera3D.new(); cam.fov = 40; cam.near = 0.1; cam.far = 300; sv.add_child(cam)
	var root: Node3D = load("res://assets/table_%s.glb" % lang).instantiate()
	sv.add_child(root)
	table = root.find_child("table", true, false)
	for n in ["pf", "flip0", "flip1", "flip2", "snout0", "snout1", "apron", "saucer", "sauSw", "spin", "plunger", "rampStrip", "wand", "flag", "flagRot", "flagCloth", "ffStatue", "ffBlock",
			"scen_home", "scen_carib", "scen_lake", "scen_shroom", "tok_carib", "tok_shroom", "tok_lake", "ant"]:
		N[n] = root.find_child(n, true, false)
	for i in 2:
		for j in 2: N["lid%d_%d" % [i, j]] = root.find_child("lid%d_%d" % [i, j], true, false)
	for i in 3:
		N["drum%d" % i] = root.find_child("drum%d" % i, true, false); N["drumhit%d" % i] = root.find_child("drumhit%d" % i, true, false)
		N["drumring%d" % i] = root.find_child("drumring%d" % i, true, false)
		N["drop%d" % i] = root.find_child("drop%d" % i, true, false)
	for i in 4: N["igt%d" % i] = root.find_child("igt%d" % i, true, false)
	for i in 7: N["gate%d" % i] = root.find_child("gate%d" % i, true, false)
	for i in 6: N["spring%d" % i] = root.find_child("spring%d" % i, true, false)
	for i in 2: N["band%d" % i] = root.find_child("band%d" % i, true, false)
	for k in ["tok_carib", "tok_shroom", "tok_lake", "ant"]: N[k].visible = false
	# playfield, ramp, flag, apron materials
	pf_mat = _own_mat(N.pf)
	pf_mat.metallic = 0.1; pf_mat.roughness = 0.5; pf_mat.uv1_scale = Vector3(1, -1, 1); pf_mat.uv1_offset = Vector3(0, 1, 0)
	ramp_mat = _own_mat(N.rampStrip); ramp_mat.blend_mode = BaseMaterial3D.BLEND_MODE_MIX
	flag_mat = _own_mat(N.flagCloth); flag_mat.cull_mode = BaseMaterial3D.CULL_DISABLED; flag_mat.uv1_scale = Vector3(1, -1, 1); flag_mat.uv1_offset = Vector3(0, 1, 0)
	apron_mat = null
	var ap: MeshInstance3D = N.apron
	for si in ap.mesh.get_surface_count():
		var m = ap.mesh.surface_get_material(si)
		if m is StandardMaterial3D and m.albedo_texture != null and m.albedo_texture.get_width() == 1024:
			apron_mat = m.duplicate(); ap.set_surface_override_material(si, apron_mat)
	# inserts
	for i in data.ins.size():
		var m: MeshInstance3D = root.find_child("ins%d" % i, true, false)
		var h: MeshInstance3D = root.find_child("halo%d" % i, true, false)
		var mat = _own_mat(m); mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		var hm = _own_mat(h); hm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; hm.blend_mode = BaseMaterial3D.BLEND_MODE_ADD; hm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		hm.no_depth_test = false
		var con = Color(data.ins[i].col)
		INS.append({m = m, halo = h, mat = mat, hmat = hm, on = con, off = con * Color(0.3, 0.3, 0.3, 1), st = 0, base = data.ins[i].base})
	for k in data.insIdx:
		var v = data.insIdx[k]
		if v is Array:
			var a = []
			for x in v: a.append(INS[int(x)])
			I[k] = a
		else: I[k] = INS[int(v)]
	var bi = 0
	while true:
		var b = root.find_child("bulb%d" % bi, true, false)
		if b == null: break
		var bm = _own_mat(b); bm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		BULBS.append({n = b, mat = bm}); bi += 1
	for i in 3:
		var hm = _own_mat(N["drumhit%d" % i]); hm.emission_enabled = true
		var rm = _own_mat(N["drumring%d" % i]) if N["drumring%d" % i] != null else hm
		if rm != hm: rm.emission_enabled = true; rm.emission = Color(DRUM_C[i])
		if i < 2: hm.emission = Color("#ffffff")
		drum_mats.append({hit = hm, ring = rm})
	for i in 7:
		var gm = _own_mat(N["gate%d" % i]); gm.emission_enabled = true; gm.emission = Color(NOTE_C[i]); gate_mats.append(gm)
	for i in 2:
		var bm = _own_mat(N["band%d" % i]); bm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; band_mats.append(bm)
	# accent (neon strips) materials: albedo close to #9be38a and lit
	var acc = Color("#9be38a")
	for mi in root.find_children("*", "MeshInstance3D", true, false):
		var m = mi.get_active_material(0)
		if m is StandardMaterial3D and m.shading_mode != BaseMaterial3D.SHADING_MODE_UNSHADED and m.albedo_texture == null:
			var c: Color = m.albedo_color
			if absf(c.r - acc.r) < 0.03 and absf(c.g - acc.g) < 0.03 and absf(c.b - acc.b) < 0.03 and not ACCENT_MATS.has(m): ACCENT_MATS.append(m)
	# metal (chrome, gold, the ball): a reflection of the same panorama the web version used as env map
	var cache = {}
	for mi in root.find_children("*", "MeshInstance3D", true, false):
		if mi.mesh == null: continue
		for si in mi.mesh.get_surface_count():
			var m = mi.mesh.surface_get_material(si)
			if m is StandardMaterial3D and m.metallic > 0.8 and m.albedo_texture == null:
				if not cache.has(m): cache[m] = chrome_mat(m.albedo_color, m.roughness)
				mi.set_surface_override_material(si, cache[m])
	# sea
	var sea = MeshInstance3D.new(); var pm = PlaneMesh.new(); pm.size = Vector2(160, 160); sea.mesh = pm; sea.position.y = -1.4
	sea_mat = StandardMaterial3D.new(); sea_mat.albedo_color = Color("#163a5c"); sea_mat.roughness = 0.35; sea.material_override = sea_mat; sv.add_child(sea)
	# stars
	var st = MultiMeshInstance3D.new(); var mm = MultiMesh.new(); mm.transform_format = MultiMesh.TRANSFORM_3D
	var q = QuadMesh.new(); q.size = Vector2(0.5, 0.5); mm.mesh = q; mm.instance_count = 500
	var stm = StandardMaterial3D.new(); stm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; stm.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED; stm.albedo_color = Color(1, 1, 1)
	q.material = stm
	for i in 500:
		var u = randf() * TAU; var v = acos(randf_range(-0.2, 1.0)); var r = randf_range(60, 120)
		mm.set_instance_transform(i, Transform3D(Basis(), Vector3(r * sin(v) * cos(u), r * cos(v), r * sin(v) * sin(u))))
	st.multimesh = mm; sv.add_child(st)
	# ball materials, trail, shadow, particles
	ball_mat = chrome_mat(Color("#eef3f8"), 0.05, 1.25)
	dot_tex = tex("res://assets/img/dot.png"); shadow_tex = tex("res://assets/img/shadow.png")
	for i in 10:
		var tm = StandardMaterial3D.new(); tm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; tm.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
		tm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA; tm.blend_mode = BaseMaterial3D.BLEND_MODE_ADD; tm.albedo_texture = dot_tex
		tm.albedo_color = Color(1, 0.95, 0.78, 0.42 * (1 - i / 10.0)); tm.no_depth_test = false; tm.disable_receive_shadows = true
		trail_mats.append(tm)
	parts = MultiMeshInstance3D.new(); var pmm = MultiMesh.new(); pmm.transform_format = MultiMesh.TRANSFORM_3D; pmm.use_colors = true
	var pq = QuadMesh.new(); pq.size = Vector2(0.24, 0.24); var ppm = StandardMaterial3D.new(); ppm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	ppm.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED; ppm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA; ppm.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	ppm.albedo_texture = dot_tex; ppm.vertex_color_use_as_albedo = true; pq.material = ppm; pmm.mesh = pq; pmm.instance_count = PN
	parts.multimesh = pmm; sv.add_child(parts)
	for i in PN:
		PD.append({l = 0.0, m = 1.0, p = Vector3(), v = Vector3(), c = Color.WHITE})
		pmm.set_instance_transform(i, Transform3D(Basis().scaled(Vector3.ZERO), Vector3(0, -99, 0)))
	# characters
	for k in ["igorlet", "igorlet2", "barigor", "gondoligor", "cagigor"]: CHAR[k] = tex("res://assets/img/ch_%s.png" % k)
	for i in 3: CHAR["igor%d" % i] = tex("res://assets/img/ch_igor%d.png" % i)
	SPR.igor = _char_sprite("igor0", 3.0, false, P(-4.75, -1.5, 0.7))
	SPR.host = _char_sprite("igorlet", 2.8, true, P(4.6, -1.5, 0.7))
	SPR.d1 = _char_sprite("igorlet", 1.3, false, P(-1.75, 19.55, 0))
	SPR.d2 = _char_sprite("igorlet2", 1.3, true, P(2.35, 19.75, 0))
	clef_spr = Sprite3D.new(); clef_spr.texture = tex("res://assets/img/clef.png"); clef_spr.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	clef_spr.pixel_size = 1.1 / 128.0; clef_spr.visible = false; clef_spr.shaded = false; sv.add_child(clef_spr)
	ffbar = Sprite3D.new(); ffbar.texture = tex("res://assets/img/ff_1.png"); ffbar.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	ffbar.pixel_size = 1.9 / 192.0; ffbar.no_depth_test = true; ffbar.visible = false; ffbar.render_priority = 10; sv.add_child(ffbar)

var chrome_shader: Shader
func chrome_mat(tint: Color, rough: float, refl := 1.0) -> ShaderMaterial:
	if chrome_shader == null:
		chrome_shader = Shader.new()
		chrome_shader.code = """shader_type spatial;
uniform vec4 tint: source_color = vec4(1.0);
uniform sampler2D pano: source_color, filter_linear, repeat_enable;
uniform float refl = 1.0;
uniform float rough = 0.2;
void fragment(){
	vec3 n = normalize((INV_VIEW_MATRIX * vec4(NORMAL, 0.0)).xyz);
	vec3 v = normalize((INV_VIEW_MATRIX * vec4(VIEW, 0.0)).xyz);
	vec3 r = reflect(-v, n);
	vec2 uv = vec2(atan(r.z, r.x) / 6.2831853 + 0.5, acos(clamp(r.y, -1.0, 1.0)) / 3.14159265);
	vec3 env = mix(texture(pano, uv).rgb, vec3(0.82, 0.8, 0.9), 0.28);
	float fres = 0.6 + 0.4 * pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.0);
	ALBEDO = tint.rgb * 0.2;
	ROUGHNESS = 0.25 + rough;
	SPECULAR = 0.6;
	EMISSION = env * tint.rgb * refl * fres;
}"""
	var m = ShaderMaterial.new(); m.shader = chrome_shader
	m.set_shader_parameter("tint", tint); m.set_shader_parameter("pano", tex("res://assets/img/env.png")); m.set_shader_parameter("refl", refl); m.set_shader_parameter("rough", rough)
	return m

func _own_mat(mi: MeshInstance3D) -> StandardMaterial3D:
	var m = mi.get_active_material(0)
	var d: StandardMaterial3D = m.duplicate() if m != null else StandardMaterial3D.new()
	mi.material_override = d
	return d

func _char_sprite(k: String, h: float, flip: bool, pos: Vector3) -> Sprite3D:
	var s = Sprite3D.new(); s.texture = CHAR[k]; s.billboard = BaseMaterial3D.BILLBOARD_ENABLED; s.shaded = false
	s.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD; s.alpha_scissor_threshold = 0.12; s.centered = true; s.flip_h = flip
	s.pixel_size = h / float(s.texture.get_height()); s.offset = Vector2(0, s.texture.get_height() / 2.0)
	s.position = pos; s.set_meta("h", h); s.set_meta("jump", 0.0); s.set_meta("base", pos); sv.add_child(s)
	return s

func jump(sp: Sprite3D, a := 1.0) -> void: sp.set_meta("jump", max(sp.get_meta("jump"), a))

# ================= camera fit =================
var HUDH = 100.0
func fit() -> void:
	var vs: Vector2 = get_viewport().get_visible_rect().size
	if ui: ui._layout(); HUDH = ui.hud_height()
	var W = vs.x; var avH: float = max(200.0, vs.y - HUDH)
	var sc: float = get_window().size.x / vs.x if vs.x > 0 else 1.0
	ui.set_view_rect(Rect2(0, HUDH, W, avH))
	sv.size = Vector2i(int(W * sc * ui.render_scale), int(avH * sc * ui.render_scale))
	var asp = W / avH
	cam.fov = 40.0 if asp < 0.8 else 34.0
	var pitch = 1.08 if asp < 0.6 else (1.0 if asp < 1.0 else 0.92)
	var tgt = P(0.4, 9.6, 0)
	var dir = Vector3(0, sin(pitch), cos(pitch))
	var pts = []
	for x in [XL - 0.6, XO + 0.6]:
		for y in [YB - 0.4, YT + 0.6]:
			for h in [0.0, 1.0]: pts.append(P(x, y, h))
	pts.append(P(0, 20.4, 1.9))
	cam.v_offset = 0.0
	var lo = 5.0; var hi = 120.0
	for k in 30:
		var mid = (lo + hi) / 2
		cam.look_at_from_position(tgt + dir * mid, tgt)
		var ok = true; var ya = 9.0; var yb = -9.0
		for p in pts:
			var q = _ndc(p)
			ya = min(ya, q.y); yb = max(yb, q.y)
			if absf(q.x) > 0.97: ok = false; break
		if ok and yb - ya > 1.95: ok = false
		if ok: hi = mid
		else: lo = mid
	cam.look_at_from_position(tgt + dir * hi, tgt)
	# centre vertically: shift the camera along its up axis so the table is centred in the view
	var y0 = 1.0; var y1 = -1.0
	for p in pts:
		var q = _ndc(p); y0 = min(y0, q.y); y1 = max(y1, q.y)
	var mid_ndc = (y0 + y1) / 2.0
	var dist = hi
	var half_h = tan(deg_to_rad(cam.fov) / 2.0) * dist
	cam.v_offset = mid_ndc * half_h * 0.98
	cam_base = cam.position; cam_basis = cam.basis

func _ndc(p: Vector3) -> Vector2:
	# manual projection with the camera's own frustum (independent of viewport pixel size)
	var lp: Vector3 = cam.global_transform.affine_inverse() * p
	var f = 1.0 / tan(deg_to_rad(cam.fov) / 2.0)
	var asp = float(sv.size.x) / float(max(1, sv.size.y))
	if lp.z >= -0.001: return Vector2(9, 9)
	return Vector2(f / asp * lp.x / -lp.z, f * lp.y / -lp.z)

func screen_of(p: Vector3) -> Vector2:
	var sp = cam.unproject_position(p)
	var r: Rect2 = ui.view_rect
	return r.position + sp * r.size / Vector2(max(1, sv.size.x), max(1, sv.size.y))

# ================= scoring and missions =================
func add_score(n: float, x = null, y = null, col := "#ffd36e", big := false) -> void:
	if GS.state == "title": return
	var v = int(round(n * GS.loop * GS.pfx * (2 if GS.finale > 0 else 1)))
	GS.score += v
	if x != null: ui.pop(screen_of(P(x, y, 0.7)), "+" + fmt(v), col, big)
func add_score_raw(n: float) -> void: GS.score += int(round(n * GS.loop))
func set_save(s: float) -> void: GS.save = max(GS.save, s)

func set_mission(i: int) -> void:
	GS.mi = i; GS.lit = [0, 0, 0, 0, 0, 0, 0]; GS.jack = 0.0
	var mi = MIS[i]; GS.clefT = 6.0
	gi.light_color = Color(NOTE_C[mi.n[0]])
	if GS.state == "play" and MODE() == "chords":
		ui.dmsg([tt("CHORD", "ACCORDO") + " %d/3" % (GS.mp + 1), L2(mi.N).to_upper()], 2.4, false, 2)
		later(0.4, func(): ui.say(tt("New chord: %s! %s", "Nuovo accordo: %s! %s") % [L2(mi.N), chord_names(mi)], 3.4, true))

func light_note(k: int, x: float, y: float, given := false) -> void:
	var mi = MIS[GS.mi]; GS.notes += 1
	if GS.state != "play": snd_note(k); add_score(1000, x, y, NOTE_C[k]); return
	if mi.n.has(k) and not GS.lit[k]:
		GS.lit[k] = 1; snd_nbrass(k); snd_note(k, true); add_score(15000 if given else 10000, x, y, NOTE_C[k], true); burst(LANE_X[k], 17, 0.4, NOTE_C[k], 18, 3)
		var all = true; var c = 0
		for n in mi.n:
			if not GS.lit[n]: all = false
			else: c += 1
		if all: chord_done()
		else: ui.dmsg([NOTE_N[k] + "!", "%d/%d" % [c, mi.n.size()]], 1.1, false, 1)
	else:
		snd_note(k); add_score(1000 if GS.lit[k] else 2000, x, y, NOTE_C[k])

func chord_done() -> void:
	var mi = MIS[GS.mi]
	for s in [SPR.igor, SPR.host, SPR.d1, SPR.d2]: jump(s, 1)
	MU.en = 1.0; snd_fanfare(mi.n); ui.flash(0.7); GS.shake = 0.4; add_score(100000 * (GS.mi + 1), 0, 17, "#ffd36e", true)
	ui.dmsg([tt("CHORD", "ACCORDO"), L2(mi.N).to_upper().left(16)], 2.4, true, 3); ui.say(tt("%s! What a sound!", "%s! Che suono!") % L2(mi.N), 2.6, true)
	for k in 7:
		if mi.n.has(k): burst(LANE_X[k], 17.5, 0.5, NOTE_C[k], 20, 4)
	GS.mp += 1
	if GS.mp >= 3: later(0.9, func(): if MODE() == "chords": complete_mode())
	else: later(1.4, func(): if MODE() == "chords": set_mission((GS.mi + 1) % 7))

func next_mission() -> void:
	var i: int = GS.mi + 1
	if i >= MIS.size():
		i = 0; GS.loop += 1; ui.dmsg([tt("SYMPHONY!", "SINFONIA!"), "× %d" % GS.loop], 3, true, 3)
		ui.say(tt("All the chords! Now everything is worth ×%d!", "Tutti gli accordi! Ora tutto vale ×%d!") % GS.loop, 3.4, true)
	if i == 3 and not GS.extraGiven:
		GS.extraGiven = true; GS.balls += 1
		later(2.6, func(): ui.dmsg([tt("EXTRA", "PALLA"), tt("BALL!", "EXTRA!")], 2, true, 3); ui.say(tt("Extra ball! Igor is so happy!", "Palla extra! Igor è felicissimo!"), 2.6, true))
	later(1.2, func(): set_mission(i))

# ---------- balls ----------
func new_ball(x: float, y: float, mode: String) -> Ball:
	var b = Ball.new(); b.x = x; b.y = y; b.mode = mode
	b.m = MeshInstance3D.new(); var s = SphereMesh.new(); s.radius = R; s.height = 2 * R; s.radial_segments = 28; s.rings = 16; b.m.mesh = s; b.m.material_override = ball_mat
	sv.add_child(b.m)
	b.sh = MeshInstance3D.new(); var q = PlaneMesh.new(); q.size = Vector2(0.75, 0.75); b.sh.mesh = q
	var shm = StandardMaterial3D.new(); shm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; shm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA; shm.albedo_texture = shadow_tex
	b.sh.material_override = shm; sv.add_child(b.sh)
	for i in 10:
		var t = MeshInstance3D.new(); var tq = QuadMesh.new(); var k = 0.62 * (1 - i / 12.0); tq.size = Vector2(k, k); t.mesh = tq; t.material_override = trail_mats[i]; t.visible = false
		sv.add_child(t); b.trail.append(t)
	for i in 21: b.hist.append(Vector3())
	BALLS.append(b); _ball_pos(b)
	return b

func remove_ball(b: Ball) -> void:
	b.m.queue_free(); b.sh.queue_free()
	for t in b.trail: t.queue_free()
	BALLS.erase(b)

func launch_hint() -> void: ui.hint(tt("Hold the right side, let go: launch!", "Tieni premuto a destra e lascia: lancio!") if ui.touch_ui else tt("Hold Space, let go: launch!", "Tieni premuto Spazio e lascia: lancio!"))
func serve(auto := false) -> Ball:
	var b = new_ball(PLUNGE.x, PLUNGE.y, "lane"); GS.plunge = 0.0
	if auto: b.has_auto = true; b.auto = 0.7
	else: GS.skill = randi() % 7; launch_hint()
	return b
func plunge_v(c: float) -> float:
	if c < 0.15: return 31 + c / 0.15 * 2.5
	if c < 0.85: return 33.5 + (c - 0.15) / 0.7 * 5
	return 38.5 + (c - 0.85) / 0.15 * 7.5

func _make_path(b: Ball, pts: Array) -> void:
	# uniform Catmull-Rom through pts, sampled and arc-length parametrised
	var out = PackedVector3Array(); var n = pts.size()
	for i in n - 1:
		var p0: Vector3 = pts[max(0, i - 1)]; var p1: Vector3 = pts[i]; var p2: Vector3 = pts[i + 1]; var p3: Vector3 = pts[min(n - 1, i + 2)]
		for s in 12:
			var t = s / 12.0; var t2 = t * t; var t3 = t2 * t
			out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
	out.append(pts[n - 1])
	var cl = PackedFloat32Array([0.0])
	for i in range(1, out.size()): cl.append(cl[i - 1] + out[i].distance_to(out[i - 1]))
	b.gp = out; b.gl = cl; b.glen = cl[cl.size() - 1]

func _path_at(b: Ball, u: float) -> Vector3:
	var d = clampf(u, 0, 1) * b.glen
	var lo = 0; var hi = b.gl.size() - 1
	while hi - lo > 1:
		var mid = (lo + hi) / 2
		if b.gl[mid] < d: lo = mid
		else: hi = mid
	var seg = b.gl[hi] - b.gl[lo]
	return b.gp[lo].lerp(b.gp[hi], 0.0 if seg <= 0 else (d - b.gl[lo]) / seg)

func ramp_at(u: float) -> Vector3:
	var f = clampf(u, 0, 1) * (RAMP_PTS.size() - 1); var i = int(f)
	if i >= RAMP_PTS.size() - 1: return RAMP_PTS[RAMP_PTS.size() - 1]
	return RAMP_PTS[i].lerp(RAMP_PTS[i + 1], f - i)

func gold_path(b: Ball) -> void:
	var a0 = atan2(b.y - 16, b.x - 0.4); var pts = []; var a = a0
	while a < 2.35:
		pts.append(P(0.4 + 4.73 * cos(a), 16 + 4.73 * sin(a), R)); a += 0.12
	pts.append(P(-2.45, 18.35, R)); pts.append(P(-2.62, 17.4, R)); pts.append(P(-2.7, 16.35, R))
	_make_path(b, pts); b.u = 0; b.spd = max(9.0, hyp(b.vx, b.vy)); b.mode = "guide"

func launch(b: Ball, c: float) -> void:
	b.mode = "play"; b.y = PLUNGE.y; b.vx = 0; b.vy = plunge_v(c); b.gold = not b.auto0 and c >= GOLD[0] and c <= GOLD[1]
	snd("launch"); GS.skillT = 4.0; ui.hint("")
	if GS.save <= 0 and not GS.multi and not b.auto0: set_save(10)

func start_game() -> void:
	for b in BALLS.duplicate(): remove_ball(b)
	var keep_t: float = GS.t
	reset_gs(); GS.t = keep_t; GS.state = "play"
	FFS.on = false; upd_variants(); flag_tex()
	for s in DROPS: s.on = true
	for g in GATES: g.on = false
	set_mission(0); serve(); MU.on = true; ant_t = 4.0; MU.bpm = 88.0; MU.en = 0.0
	if TOK: TOK.G.queue_free(); TOK = null
	tok_t = 14.0; set_theme("home", true)
	ui.dmsg([tt("CHOOSE", "SCEGLI"), tt("A MISSION", "UNA MISSIONE")], 2.2, false, 2)
	ui.say(tt("Let’s make music! Hit the flag three times to choose a mission, then the Stage!", "Facciamo musica! Colpisci tre volte la banderuola per scegliere la missione, poi il Palco!"), 3.8, true)
	ui.show_screen("")

func ball_lost(b: Ball) -> void:
	remove_ball(b)
	if GS.state == "title":
		var d = new_ball(randf_range(-2, 2), 16, "play"); d.vx = randf_range(-6, 6); return
	if GS.state != "play": return
	if GS.multi:
		if BALLS.size() <= 1: end_poly()
		if BALLS.size(): return
	if BALLS.size(): return
	if GS.save > 0:
		ui.dmsg([tt("BALL", "PALLA"), tt("SAVED!", "SALVATA!")], 1.6, true, 3); ui.say(tt("Igor saved the ball for you!", "Igor ti ha salvato la pallina!"), 2.4, true)
		GS.save = 0.0; serve(true); return
	end_of_ball()

func end_of_ball() -> void:
	GS.state = "bonus"; snd("drain_%d" % GS.mi); ui.say_line("drain", true); GS.jack = 0.0; GS.pfx = 1; GS.pfxT = 0.0
	var base: int = GS.ants * 10000 + GS.ramps * 5000 + GS.orbits * 3000 + GS.drums * 100 + GS.notes * 500
	var tot: int = base * GS.bx
	ui.dmsg([tt("BONUS", "BONUS"), fmt(base)], 1, false, 4)
	later(1.0, func(): ui.dmsg(["× %d" % GS.bx, fmt(tot)], 1.1, false, 4))
	later(2.4, func():
		GS.score += tot * GS.loop; GS.ants = 0; GS.ramps = 0; GS.orbits = 0; GS.drums = 0; GS.notes = 0; GS.bx = 1
		if GS.ball >= GS.balls: game_over(); return
		GS.ball += 1; GS.state = "play"; ui.dmsg([tt("BALL", "PALLA"), str(GS.ball)], 1.4, false, 3); serve())

func game_over() -> void:
	GS.state = "over"; MU.on = false; GS.shown = GS.score
	var rec: bool = GS.score > best
	if rec:
		best = GS.score
		var cf = ConfigFile.new(); cf.load("user://flipper.cfg"); cf.set_value("p", "best", best); cf.save("user://flipper.cfg")
	ui.show_over(rec)
	ui.say(tt("A new record! You are a pinball maestro!", "Nuovo record! Sei un maestro del flipper!") if rec else tt("Great concert! One more?", "Bel concerto! Un altro?"), 3.5, true)

# ---------- polyphony ----------
func start_poly() -> void:
	GS.polyReady = false; GS.multi = true; GS.polyStars = 0; set_save(12)
	for g in GATES: g.on = true
	ui.dmsg([tt("POLYPHONY", "POLIFONIA"), "MULTIBALL!"], 2.6, true, 4); snd("fan_0246"); ui.flash(0.9); GS.shake = 0.7
	ui.say(tt("Polyphony! Three balls, and the lanes sing when you hit them!", "Polifonia! Tre palline, e le corsie suonano quando le colpisci!"), 3.4, true)
	for k in 2: later(0.4 + k * 0.8, _poly_ball)
func _poly_ball() -> void:
	if GS.state != "play" or not GS.multi: return
	var nb = new_ball(SAUCER.x, SAUCER.y, "hole"); nb.u = 0.7; nb.awarded = true
func end_poly() -> void:
	GS.multi = false
	for g in GATES: g.on = false
	for s in DROPS: s.on = true
	GS.drop = [0, 0, 0]; ui.dmsg([tt("POLYPHONY", "POLIFONIA"), tt("THE END", "FINE")], 1.6, false, 2)
func poly_hit(k: int, x: float) -> void:
	if ["chords", "ear", "key", "tune"].has(MODE()): lane_hit(k, x)
	var t: float = GS.t; GS.polyT[k] = t; N["gate%d" % k].set_meta("t", 1.0); snd_nbrass(k); snd_note(k, true); add_score(25000, x, LANE_Y0, NOTE_C[k]); burst(x, LANE_Y0, 0.4, NOTE_C[k], 12, 3)
	var voices = 0
	for pt in GS.polyT:
		if t - pt < 1.2: voices += 1
	if voices >= 2:
		add_score(50000 * voices * voices, x, LANE_Y0 - 1, "#c77dff", true); ui.dmsg([tt("CHORD", "ACCORDO"), "%d %s!" % [voices, tt("VOICES", "VOCI")]], 1.2, true, 2)
		if voices >= 3: ui.flash(0.4)

# ---------- missions ----------
func next_sel(from: int) -> int:
	for i in range(1, 8):
		var j = (from + i) % 7
		if not GS.done[j]: return j
	return from
func start_mode(i: int) -> void:
	var m = MODES[i]; GS.mode = i; GS.modeT = float(m.T); GS.mp = 0; GS.ready = false; GS.flag = 0; GS.lit = [0, 0, 0, 0, 0, 0, 0]
	if m.k == "chords": set_mission((GS.mi + 1) % 6)
	if m.k == "ff": FFS.on = true; GS.ffHits = 0; N.ffStatue.set_meta("t", 0.0); ffbar.texture = tex("res://assets/img/ff_1.png")
	if m.k == "ear": GS.ear = randi() % 7; GS.earT = 1.2
	if m.k == "key": GS.key = KEYS.pick_random(); GS.acc = [0, 0, 0, 0, 0, 0, 0]
	if m.k == "metro": GS.metro0 = GS.t
	if m.k == "tune": GS.tune = TUNES.pick_random(); GS.tuneI = 0
	upd_variants(); snd("fan_024"); ui.flash(0.4); jump(SPR.igor); jump(SPR.host)
	ui.dmsg([tt("MISSION", "MISSIONE"), L2(m.N).to_upper().left(16)], 2.6, true, 4)
	var extra = ""
	if m.k == "key": extra = " " + L2(GS.key.N) + ": " + key_text()
	elif m.k == "tune": extra = " " + L2(GS.tune.N) + ": " + tune_text()
	ui.say(L2(m.how) + extra, 4.2, true)
func key_text() -> String:
	var r = []
	for k in GS.key.a: r.append(NOTE_N[k] + acc_of(GS.key.a[k]))
	return " ".join(r)
func tune_text() -> String:
	var r = []
	for k in GS.tune.n: r.append(NOTE_N[k])
	return " ".join(r)
func complete_mode() -> void:
	var m = MODES[GS.mode]; var v = 300000 * (GS.rank + 1); add_score(v, 0, 10, "#ffd36e", true); GS.done[GS.mode] = true; GS.rank = min(RANKS.size() - 1, GS.rank + 1)
	snd("fan_0246"); ui.flash(0.8); GS.shake = 0.5
	for s in [SPR.igor, SPR.host, SPR.d1, SPR.d2]: jump(s)
	MU.en = 1.0; burst(0, 10, 1, "#ffd36e", 60, 7)
	ui.dmsg([L2(m.N).to_upper().left(16), tt("COMPLETE!", "COMPIUTA!")], 2.6, true, 4)
	later(2.7, func():
		if GS.state == "play" or GS.state == "bonus":
			ui.dmsg([tt("NEW RANK", "NUOVO GRADO"), L2(RANKS[GS.rank]).to_upper().left(16)], 2.4, true, 3)
			ui.say(tt("Mission complete! You are now: %s!", "Missione compiuta! Ora sei: %s!") % L2(RANKS[GS.rank]), 3.4, true))
	if GS.rank == 3 and not GS.extraGiven:
		GS.extraGiven = true; GS.balls += 1; later(5.4, func(): ui.dmsg([tt("EXTRA", "PALLA"), tt("BALL!", "EXTRA!")], 2, true, 3))
	end_mode()
	var fin = true
	for d in GS.done: fin = fin and d
	mission_complete_show(fin)
func fail_mode() -> void:
	var m = MODES[GS.mode]; ui.dmsg([tt("TIME!", "TEMPO!"), L2(m.N).to_upper().left(16)], 1.8, false, 3)
	ui.say(tt("Time’s up! No problem: the flag is waiting for you, we’ll try again!", "Tempo scaduto! Nessun problema: la banderuola ti aspetta, ci riproviamo!"), 3.2, true); end_mode()
func end_mode() -> void:
	GS.mode = -1; GS.flag = 0; FFS.on = false; GS.lit = [0, 0, 0, 0, 0, 0, 0]; GS.sel = next_sel(GS.sel); flag_tex(); upd_variants()
func upd_variants() -> void:
	WAND.on = GS.rank >= 2 and MODE() != "ff"; N.wand.visible = WAND.on
func start_finale() -> void:
	if GS.state != "play": return
	GS.finale = 45.0; GS.multi = true; set_save(15); ui.dmsg(["GRAN", "CONCERTO!"], 3, true, 5); snd("fan_0246"); ui.flash(1.0); GS.shake = 0.8; MU.en = 1.0
	ui.say(tt("All seven missions! GRAN CONCERTO: four balls and everything is worth double!", "Tutte e sette le missioni! GRAN CONCERTO: quattro palline e tutto vale doppio!"), 4, true)
	for k in 3: later(0.4 + k * 0.7, func():
		if GS.state != "play": return
		var nb = new_ball(SAUCER.x, SAUCER.y, "hole"); nb.u = 0.7; nb.awarded = true)
func end_finale() -> void:
	GS.finale = 0.0; GS.done = [false, false, false, false, false, false, false]; GS.loop += 1; GS.sel = 0; flag_tex()
	ui.dmsg([tt("ENCORE!", "BIS!"), "× %d" % GS.loop], 2.6, true, 4); ui.say(tt("Encore! The missions start again, everything ×%d!", "Bis! Le missioni ripartono, tutto vale ×%d!") % GS.loop, 3.4, true)
func flag_tex() -> void:
	flag_mat.albedo_texture = tex("res://assets/img/flag_%d_%d_%s.png" % [GS.sel, 1 if GS.ready else 0, "it" if IT else "en"])
func flag_hit() -> void:
	N.flag.set_meta("w", min(26.0, N.flag.get_meta("w", 0.0) + 14)); snd("target"); add_score(2000, FLAG.x, FLAG.y, "#ffd36e")
	if GS.state != "play" or GS.mode >= 0 or GS.ready or GS.finale > 0: return
	GS.sel = GS.sel if GS.flag == 0 and not GS.done[GS.sel] else next_sel(GS.sel); GS.flag += 1; flag_tex(); var m = MODES[GS.sel]
	if GS.flag >= 3:
		GS.ready = true; flag_tex(); ui.dmsg([tt("MISSION READY", "MISSIONE PRONTA"), tt("TO THE STAGE!", "AL PALCO!")], 2.2, true, 3)
		ui.say(tt("%s is ready: send the ball to the Stage!", "%s è pronta: manda la pallina nel Palco!") % L2(m.N), 3, true)
	else: ui.dmsg([tt("FLAG", "BANDERUOLA") + " %d/3" % GS.flag, L2(m.N).to_upper().left(16)], 1.4, false, 2)

func lane_hit(k: int, x: float) -> void:
	var m = MODE()
	if m == "chords": light_note(k, x, 18.2); return
	if m == "ear":
		snd_note(k)
		if k == GS.ear:
			GS.mp += 1; add_score(60000, x, 18.2, NOTE_C[k], true); snd_nbrass(k); burst(x, 17.5, 0.5, NOTE_C[k], 24, 4); jump(SPR.igor)
			if GS.mp >= 3: complete_mode(); return
			ui.say(tt("Yes! It was %s! Next one…", "Sì! Era il %s! La prossima…") % NOTE_N[k], 2.2, true); GS.ear = (GS.ear + 1 + randi() % 6) % 7; GS.earT = 2.2
		else:
			add_score(2000, x, 18.2, NOTE_C[k])
			var hi: bool = NOTE_M[GS.ear] > NOTE_M[k]
			ui.say(tt("That’s %s: mine is %s!", "Questo è il %s: il mio è più %s!") % [NOTE_N[k], tt("higher" if hi else "lower", "alto" if hi else "basso")], 2.4, true); GS.earT = 1.4
		return
	if m == "key":
		var a: Array = GS.acc; a[k] = 1 if a[k] == 0 else (-1 if a[k] == 1 else 0)
		Snd.inst("tone", NOTE_M[k] + 12 + a[k]); ui.pop(screen_of(P(x, 18.4, 0.7)), NOTE_N[k] + acc_of(a[k]), NOTE_C[k], true); add_score(3000)
		var ok = true
		for i in 7: ok = ok and a[i] == GS.key.a.get(i, 0)
		if ok:
			GS.mp = 1
			for i in 8: later(i * 0.12, Snd.inst.bind("tri", NOTE_M[i % 7] + 12 * (1 if i >= 7 else 0) + GS.key.a.get(i % 7, 0) + 12, 1.0))
			complete_mode()
		return
	if m == "tune":
		var T = GS.tune
		if k == T.n[GS.tuneI]:
			GS.tuneI += 1; snd_nbrass(k); snd_note(k, true); add_score(20000, x, 18.2, NOTE_C[k], true); burst(x, 17.5, 0.4, NOTE_C[k], 14, 3)
			if GS.tuneI >= T.n.size():
				GS.mp = 1
				for i in T.n.size(): later(0.3 + i * 0.3, Snd.inst.bind("tri", NOTE_M[T.n[i]] + 12, 1.15))
				complete_mode()
		else:
			snd_note(k); add_score(1000); ui.say(tt("Now %s!", "Ora il %s!") % NOTE_N[T.n[GS.tuneI]], 1.6, false)
		return
	# no mission: the scale
	if not GS.lit[k]:
		GS.lit[k] = 1; snd_note(k, true); add_score(3000, x, 18.2, NOTE_C[k])
		var all = true
		for v in GS.lit: all = all and v == 1
		if all:
			GS.bx = min(6, GS.bx + 1); add_score(100000, 0.3, 17, "#ffd36e", true); ui.dmsg([tt("SCALE!", "SCALA!"), "BONUS %dX" % GS.bx], 1.8, true, 3)
			for i in 7: later(i * 0.08, Snd.inst.bind("tri", NOTE_M[i] + 12, 0.85))
			later(1.2, func(): if MODE() == "": GS.lit = [0, 0, 0, 0, 0, 0, 0])
	else:
		snd_note(k); add_score(1000, x, 18.2, NOTE_C[k])

func metro_shot(x: float, y: float) -> void:
	if MODE() != "metro": return
	var ph = fposmod(GS.t - GS.metro0, METRO_P) / METRO_P; var off: float = min(ph, 1 - ph) * METRO_P
	if off < 0.15:
		GS.mp += 1; add_score(80000, x, y, "#ffd36e", true); ui.dmsg([tt("ON THE BEAT!", "A TEMPO!"), "%d/3" % GS.mp], 1.4, true, 3); snd("jackpot_%d" % GS.mi); jump(SPR.host)
		if GS.mp >= 3: complete_mode()
	else: ui.dmsg([tt("A BIT LATE", "UN PO’ TARDI") if ph < 0.5 else tt("A BIT EARLY", "UN PO’ PRESTO"), tt("LISTEN TO THE TICK", "ASCOLTA IL TIC")], 1.4, false, 2)

func mode_tick(dt: float) -> void:
	var m = MODE()
	if GS.finale > 0:
		GS.finale -= dt
		if GS.finale <= 0: end_finale()
	if m == "": return
	GS.modeT -= dt
	if GS.modeT <= 0: fail_mode(); return
	if m == "ear":
		GS.earT -= dt
		if GS.earT <= 0:
			GS.earT = 5.0; snd_note(GS.ear, true); Snd.inst("triL", NOTE_M[GS.ear] + 12); ui.say(tt("♪ Which note is this?", "♪ Che nota è questa?"), 2, true); jump(SPR.igor, 0.6)
	if m == "metro":
		var n = int(floor((GS.t - GS.metro0) / METRO_P))
		if n != GS.metroN: GS.metroN = n; snd("tick_lo" if n % 4 else "tick_hi")

# ---------- arcade ----------
func mission_complete_show(fin: bool) -> void:
	ARC.on = true; ARC.phase = "banner"; ARC.t = 2.4; ARC.after = fin
	ui.big(tt("MISSION", "MISSIONE") + "\n" + tt("COMPLETE!", "COMPIUTA!"))
	for f in FL: f.press = false
	GS.charging = false
func arc_start() -> void:
	var k: String = ARC_ORDER[ARC.n % ARC_ORDER.size()]; ARC.n += 1; ARC.key = k; ARC.G = {}; arc_init(k, ARC.G); ARC.phase = "intro"; ARC.t = 2.2
	ui.big(""); ui.arc_show(true, L2(ARC_GAMES[k].N), L2(ARC_GAMES[k].how)); ui.say(L2(ARC_GAMES[k].how), 3, true)
func arc_init(k: String, G: Dictionary) -> void:
	if k == "gnam":
		G.x = 64.0; G.ants = []; G.spawned = 0; G.caught = 0; G.next = 0.8; G.L = 0; G.R = 0; G.open = 0.0
	else:
		var beat = 60.0 / 100.0; G.notes = []; var pat = "LRLRLLRRLRLRRLRLLRLRLLRR"
		for i in pat.length(): G.notes.append({s = -1 if pat[i] == "L" else 1, t = 2 + i * beat * (1.0 if i % 4 == 3 else 0.5) * 1.6, done = ""})
		G.t = 0.0; G.hit = 0; G.flash = {-1: 0.0, 1: 0.0}; G.msg = ""; G.msgT = 0.0
func arc_tick_game(dt: float) -> bool:
	var G: Dictionary = ARC.G
	if ARC.key == "gnam":
		G.x = clampf(G.x + (G.R - G.L) * 78 * dt, 8, 120); G.open = max(0.0, G.open - dt)
		G.next -= dt
		if G.next <= 0 and G.spawned < 15:
			G.ants.append({x = 8 + randf() * 112, y = -2.0, v = 18 + G.spawned * 2.2, done = ""}); G.spawned += 1; G.next = max(0.55, 1.15 - G.spawned * 0.04)
		for a in G.ants:
			a.y += a.v * dt
			if a.done == "" and a.y >= 54 and a.y <= 60 and absf(a.x - G.x) < 9:
				a.done = "ok"; G.caught += 1; G.open = 0.25; snd("ant"); add_score_raw(20000)
			elif a.done == "" and a.y > 64: a.done = "miss"; snd("amiss")
		G.ants = G.ants.filter(func(a): return a.done == "")
		return G.spawned >= 15 and G.ants.is_empty()
	else:
		G.t += dt
		for k in G.flash: G.flash[k] = max(0.0, G.flash[k] - dt)
		G.msgT = max(0.0, G.msgT - dt)
		var all = true
		for n in G.notes:
			if n.done == "" and G.t - n.t > 0.16: n.done = "miss"
			if n.done == "": all = false
		return all and G.t > G.notes[G.notes.size() - 1].t + 0.6
func arc_press(side: int) -> void:
	var G: Dictionary = ARC.G; G.flash[side] = 0.15; var bestn = null
	for n in G.notes:
		if n.s != side or n.done != "": continue
		var d = absf(n.t - G.t)
		if d < 0.16 and (bestn == null or d < absf(bestn.t - G.t)): bestn = n
	if bestn != null:
		bestn.done = "ok"; G.hit += 1; snd("kick" if side < 0 else "snare"); add_score_raw(15000)
		G.msg = tt("PERFECT", "PERFETTO") if absf(bestn.t - G.t) < 0.06 else "OK"; G.msgT = 0.4
	else: snd("amiss2")
func arc_input(side: int, on: bool) -> void:
	if ARC.phase != "play": return
	if ARC.key == "gnam":
		if side < 0: ARC.G.L = 1 if on else 0
		else: ARC.G.R = 1 if on else 0
	elif on: arc_press(side)
func arc_end() -> void:
	var G: Dictionary = ARC.G; var r = {}
	if ARC.key == "gnam": r = {score = 300000 if G.caught == 15 else 0, line = "%d/15" % G.caught, perfect = G.caught == 15}
	else: r = {score = 300000 if G.hit == G.notes.size() else 0, line = "%d/%d" % [G.hit, G.notes.size()], perfect = G.hit == G.notes.size()}
	if r.score: add_score_raw(r.score)
	ARC.phase = "result"; ARC.t = 2.4; ARC.res = r
	if r.perfect: snd("fan_0246"); ui.flash(0.5)
	else: snd("jackpot_%d" % GS.mi)
func arc_tick(dt: float) -> void:
	ARC.t -= dt
	if ARC.phase == "banner":
		if ARC.t <= 0: arc_start()
		return
	if ARC.phase == "intro":
		if ARC.t <= 0: ARC.phase = "play"
		return
	if ARC.phase == "play":
		if arc_tick_game(dt): arc_end()
		return
	if ARC.phase == "result":
		if ARC.t <= 0: ui.arc_show(false, "", ""); ARC.phase = "count"; ARC.t = 2.4
		return
	if ARC.phase == "count":
		var n = int(ceil(ARC.t / 0.8)); ui.big(str(n) if n > 0 else tt("GO!", "VIA!"))
		if ARC.t <= 0:
			ui.big(""); ARC.on = false; set_save(6)
			if ARC.after: later(0.6, start_finale)

# ---------- events ----------
func combo(x: float, y: float) -> void:
	if GS.comboT > 0:
		GS.combo += 1; var c: int = GS.combo; add_score(10000 * c, x, y - 0.6, "#7fe3ef"); ui.dmsg(["COMBO", "×%d" % (c + 1)], 1.2, true, 2)
	else: GS.combo = 0
	GS.comboT = 4.0

func on_hit(tag: String, o, b: Ball, imp: float) -> void:
	match tag:
		"bumper":
			var i: int = o.i; N["drum%d" % i].set_meta("t", 1.0); add_score(1000 * th_mul("drums"), o.x, o.y, DRUM_C[i]); MU.en = min(1.0, MU.en + 0.05)
			if th_mul("drums") > 1: jump(SPR.host, 0.5)
			GS.drums += 1; snd(["kick", "snare", "cymbal"][i]); burst(o.x, o.y, 0.6, DRUM_C[i], 10, 3); GS.shake = max(GS.shake, 0.12)
			if GS.state != "play": return
			if MODE() == "drums":
				GS.mp += 1
				if GS.mp >= 40: complete_mode()
				elif GS.mp % 10 == 0: ui.dmsg([tt("DRUM SOLO", "ASSOLO"), "%d/40" % GS.mp], 1, false, 2, "drum")
			GS.beats += 1
			if GS.beats >= groove_need():
				GS.beats = 0; GS.grooveLv += 1; GS.pfx = min(4, GS.pfx + 1); GS.pfxT = 30.0; ui.dmsg(["GROOVE!", "%dX" % GS.pfx], 2.4, false, 3, "drum"); snd_fanfare(MIS[GS.mi].n); ui.say_line("drum", true)
		"sling":
			N["band%d" % (0 if o.ax < 0 else 1)].set_meta("t", 1.0); add_score(110); snd("sling_%d" % GS.mi)
		"drop":
			if not o.on: return
			o.on = false; GS.drop[o.i] = 1; add_score(3000, o.cx, 8.5, "#ffd36e"); snd("drop"); burst(o.cx, 8.5, 0.4, "#ffd36e", 8, 2)
			if GS.drop[0] and GS.drop[1] and GS.drop[2]:
				add_score(30000, -0.9, 8.2, "#ffd36e", true); snd("target")
				if GS.multi: later(1.2, reset_drops); return
				GS.polyStars = min(3, GS.polyStars + 1)
				if GS.polyStars >= 3:
					GS.polyReady = true; ui.dmsg([tt("POLYPHONY", "POLIFONIA"), tt("READY: RAMP!", "PRONTA: RAMPA!")], 2.2, true, 3)
					ui.say(tt("Polyphony is ready: shoot the ramp!", "La polifonia è pronta: prendi la rampa!"), 3, true)
				else: ui.dmsg(["A N T", "★ %d/3" % GS.polyStars], 1.6, true, 2); later(1.4, reset_drops)
		"igor":
			N["igt%d" % o.i].set_meta("t", 1.0); snd("target")
			if GS.igor[o.i]: add_score(1000, -3.1, o.cy); return
			GS.igor[o.i] = 1; add_score(5000, -3.0, o.cy, "#9be38a")
			if GS.igor[0] and GS.igor[1] and GS.igor[2] and GS.igor[3]:
				GS.bx = min(6, GS.bx + 1); add_score(50000, -2.8, 11.6, "#9be38a", true); ui.dmsg(["I G O R", "BONUS %dX" % GS.bx], 1.6, true, 2); snd("fan_024")
				ui.say(tt("That’s my name!", "È il mio nome!"), 2.4, true); later(1.5, func(): GS.igor = [0, 0, 0, 0])
		"gate": poly_hit(o.k, LANE_X[o.k])
		"flag": flag_hit()
		"ffs":
			var d = 0 if imp < 4 else (1 if imp < 7 else (2 if imp < 10 else (3 if imp < 13 else (4 if imp < 16 else 5))))
			ffbar.texture = tex("res://assets/img/ff_%d.png" % (d + 1)); GS.dynI = d; GS.dynT = GS.t; N.ffStatue.set_meta("shake", 1.0)
			ui.pop(screen_of(P(o.x, o.y + 0.4, 0.7)), DYN[d], "#ff5a5a" if d == 5 else "#ffffff", true); Snd.play("ffhit", (0.12 + d * 0.06) / 0.42)
			if d == 5:
				GS.mp += 1; GS.shake = 0.5; burst(o.x, o.y, 0.6, "#cfc8b8", 20 + GS.mp * 10, 4); add_score(50000, o.x, o.y, "#ffd36e", true); ui.dmsg(["FORTISSIMO!", "%d/3" % GS.mp], 1.4, true, 3); jump(SPR.igor)
				if GS.mp >= 3: FFS.on = false; burst(o.x, o.y, 0.6, "#cfc8b8", 80, 7); complete_mode()
			else: add_score(2000); ui.dmsg([DYN[d].to_upper(), tt("HARDER!", "PIÙ FORTE!")], 1, false, 2)
		"wander": add_score(5000, o.x, o.y, "#ff8ab6"); snd("rock"); burst(o.x, o.y, 0.5, "#ff8ab6", 14, 3); GS.shake = 0.15
		"clef":
			o.on = false; clef_spr.visible = false; add_score(100000, o.x, o.y, "#ffd84a", true); snd("jackpot_%d" % GS.mi); burst(o.x, o.y, 0.5, "#ffd84a", 40, 6)
			ui.dmsg([tt("TREBLE CLEF!", "CHIAVE DI SOL!"), "100.000" if IT else "100,000"], 1.4, true, 2); ui.say(tt("You caught the treble clef!", "Hai preso la chiave di violino!"), 2.4, true); GS.clefT = 9.0

func reset_drops() -> void:
	if GS.polyReady: return
	for b in BALLS:
		if absf(b.y - 8.5) < 0.6 and b.x > -2.2 and b.x < 0.4: later(0.5, reset_drops); return
	for s in DROPS: s.on = true
	GS.drop = [0, 0, 0]

func super_skill() -> void:
	if GS.skillT <= 0: return
	GS.skillT = 0.0; add_score(250000, -2.6, 16.6, "#ffd36e", true); set_save(15); ui.dmsg(["SUPER", "SKILL SHOT!"], 2.2, true, 4); snd("jackpot_%d" % GS.mi); ui.flash(0.6)
	jump(SPR.igor); jump(SPR.host); burst(-2.6, 16.9, 0.4, "#ffd36e", 40, 5); ui.say(tt("Super skill shot! The secret passage!", "Super skill shot! Il passaggio segreto!"), 2.8, true)

func _sensors() -> void:
	sens_line(-4.6, 10.4, -3.55, 10.4, func(b, up):
		if up and b.vy > 9:
			GS.orbits += 1; add_score(15000 * th_mul("orbit"), -4.07, 10.8, "#7fe3ef"); MU.en = min(1.0, MU.en + 0.2); jump(SPR.igor, 0.6)
			if th_mul("orbit") > 1: jump(SPR.host)
			snd("roll"); combo(-4.07, 10.8); burst(-4.07, 10.4, 0.3, "#7fe3ef", 10, 3); metro_shot(-4.07, 11.2))
	sens_line(-4.6, 12.6, -3.55, 12.6, func(b, up): N.spin.set_meta("w", N.spin.get_meta("w", 0.0) + min(60.0, absf(b.vy) * 2.2)))
	sens_line(-3.25, 16.9, -2.0, 16.9, func(b, up):
		if up: return
		if GS.skillT > 0: super_skill()
		else: add_score(5000, -2.6, 16.6, "#ffd36e"); snd("roll"))
	sens_line(2.22, 10.85, 3.5, 10.6, func(b, up):
		if up and hyp(b.vx, b.vy) > 9:
			b.mode = "ramp"; b.u = 0; b.spd = clampf(hyp(b.vx, b.vy) * 0.7, 14, 24); snd("ramp_%d" % GS.mi))
	for k in 7:
		var x: float = LANE_X[k]
		sens_circ(x, 18.0, 0.28, func(b):
			if GS.multi and GS.finale <= 0: return
			if GS.skillT > 0 and k == GS.skill:
				GS.skillT = 0.0; add_score(75000, x, 18.2, "#ffffff", true); ui.dmsg(["SKILL", "SHOT!"], 1.6, true, 3); snd("jackpot_%d" % GS.mi); ui.say(tt("Skill shot! Bullseye!", "Skill shot! Centro perfetto!"), 2.4, true)
			GS.skillT = 0.0; lane_hit(k, x))
	for i in 4:
		var x: float = BLANES[i][0]; var y: float = BLANES[i][1]
		sens_circ(x, y, 0.3, func(b):
			snd("roll"); add_score(500, x, y)
			if GS.state != "play": return
			GS.bl[i] = 1
			if (i == 0 or i == 3) and GS.save <= 0: ui.say(tt("Careful… Igor believes in you!", "Attenzione… Igor crede in te!"), 2, false)
			if GS.bl[0] and GS.bl[1] and GS.bl[2] and GS.bl[3]:
				GS.bl = [0, 0, 0, 0]; set_save(15); GS.bx = min(6, GS.bx + 1); add_score(25000, 0, 5, "#9be38a", true)
				ui.dmsg([tt("ALL LANES", "CORSIE OK"), tt("BALL SAVER", "SALVA PALLA")], 1.8, true, 3); ui.say(tt("All four lanes: I’ll save your ball!", "Tutte e quattro le corsie: ti salvo la pallina!"), 2.6, true))

func ramp_done(b: Ball) -> void:
	MU.en = min(1.0, MU.en + 0.3); jump(SPR.igor, 0.7); b.mode = "play"; b.x = -3.3; b.y = 6.3; b.vx = 0; b.vy = -RAMP_VY; b.h = 0.62; b.hv = 0; GS.ramps += 1; burst(-3.3, 6.4, 0.6, "#ff8ab6", 16, 3)
	if GS.polyReady and not GS.multi: add_score(50000, -3.3, 7, "#c77dff", true); start_poly(); return
	if GS.multi:
		add_score(500000, -3.3, 7, "#ffd36e", true); ui.dmsg(["JACKPOT!", fmt(500000 * GS.loop * GS.pfx)], 1.8, true, 3); snd("jackpot_%d" % GS.mi); ui.flash(0.7); GS.shake = 0.5
		ui.say(tt("JACKPOT! Igor is dancing!", "JACKPOT! Igor balla!"), 2.4, true); return
	if GS.jack > 0:
		var v = 250000 * (GS.mi + 1) * th_mul("ramp")
		for s in [SPR.igor, SPR.host, SPR.d1, SPR.d2]: jump(s)
		GS.jack = 0.0; add_score(v, -3.3, 7, "#ffd36e", true); ui.dmsg([tt("CHORD", "ACCORDO"), "JACKPOT!"], 2.2, true, 4); snd("jackpot_%d" % GS.mi); ui.flash(0.8); GS.shake = 0.6
		ui.say(tt("Chord jackpot! On to the next chord!", "Jackpot dell’accordo! Avanti col prossimo!"), 2.8, true); next_mission(); return
	add_score(25000 * th_mul("ramp"), -3.3, 7, "#ff8ab6"); combo(-3.3, 7.4)
	if th_mul("ramp") > 1: jump(SPR.host)
	metro_shot(-3.3, 7.6)
	var miss = []
	if MODE() == "chords":
		for k in MIS[GS.mi].n:
			if not GS.lit[k]: miss.append(k)
	if miss.size():
		var k: int = miss[0]
		later(0.15, func():
			if GS.state == "play":
				light_note(k, LANE_X[k], 17.4, true); ui.say(tt("The ramp gives you a %s!", "La rampa ti regala un %s!") % NOTE_N[k], 2.2, false))
	elif randf() < 0.4: ui.say_line("ramp", false)

func saucer_catch(b: Ball) -> void:
	b.mode = "hole"; b.u = 0; snd("warp"); add_score(10000, SAUCER.x, SAUCER.y, "#c77dff"); burst(SAUCER.x, SAUCER.y, 0.3, "#c77dff", 24, 4)
func saucer_award(b: Ball) -> void:
	if GS.state != "play" or GS.multi:
		if GS.multi: add_score(50000, SAUCER.x, SAUCER.y, "#c77dff")
		return
	if GS.ready and GS.mode < 0: b.hold = 3.0; add_score(50000, SAUCER.x, SAUCER.y, "#ffd36e", true); start_mode(GS.sel); return
	var miss = []
	if MODE() == "chords":
		for k in MIS[GS.mi].n:
			if not GS.lit[k]: miss.append(k)
	var opts = [["save", tt("BALL SAVER", "SALVA PALLA")], ["bx", "BONUS +1X"], ["pts", "50.000" if IT else "50,000"], ["beat", "GROOVE +10"]]
	if miss.size() and GS.jack <= 0: opts += [["note", tt("A NOTE", "UNA NOTA")], ["note", tt("A NOTE", "UNA NOTA")]]
	if GS.polyStars < 3 and not GS.polyReady: opts.append(["star", tt("POLY STAR", "STELLA POLI")])
	var o = opts.pick_random(); var k: String = o[0]; ui.dmsg([tt("MYSTERY", "MISTERO"), o[1]], 1.6, true, 2)
	match k:
		"save": set_save(20); ui.say(tt("Igor’s shield: your ball is safe!", "Lo scudo di Igor: la pallina è al sicuro!"), 2.4, true)
		"bx": GS.bx = min(6, GS.bx + 1)
		"pts": add_score(50000, SAUCER.x, SAUCER.y, "#c77dff", true)
		"beat":
			GS.beats += 10
			if GS.beats >= groove_need(): on_hit("bumper", BUMPS[0], b, 0)
		"note": var n: int = miss.pick_random(); light_note(n, LANE_X[n], 17.4, true)
		"star":
			GS.polyStars += 1
			if GS.polyStars >= 3:
				GS.polyReady = true
				for s in DROPS: s.on = false
				GS.drop = [1, 1, 1]; ui.say(tt("Polyphony is ready: shoot the ramp!", "La polifonia è pronta: prendi la rampa!"), 3, true)

# ---------- the tofu ant ----------
func spawn_ant() -> void:
	var x = 0.0; var y = 0.0; var k = 0
	while true:
		x = randf_range(-2.8, 2.8); y = randf_range(5.6, 15); k += 1
		var bad = false
		for b in BUMPS: bad = bad or hyp(b.x - x, b.y - y) < 1.2
		for b in BALLS: bad = bad or hyp(b.x - x, b.y - y) < 2.5
		bad = bad or (x > 2 and y > 9.8 and y < 12.5)
		if not bad or k >= 40: break
	var m: Node3D = N.ant.duplicate(); m.visible = true; table.add_child(m)
	var legs = []
	for i in 6: legs.append(m.find_child("leg%d" % i, true, false))
	var halo: MeshInstance3D = m.find_child("antHalo", true, false)
	var hm = _own_mat(halo); hm.blend_mode = BaseMaterial3D.BLEND_MODE_ADD; hm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; hm.cull_mode = BaseMaterial3D.CULL_DISABLED
	ANT = {x = x, y = y, a = randf_range(0, TAU), m = m, t = 0.0, born = 0.0, legs = legs, hm = hm}
	if GS.state == "play": ui.say(tt("A tofu ant! Catch it: it’s Igor’s shield!", "Una formica di tofu! Prendila: è lo scudo di Igor!"), 2.6, false)
func ant_step(dt: float) -> void:
	if ANT == null:
		if GS.state == "play":
			ant_t -= dt
			if ant_t <= 0: spawn_ant()
		return
	var a = ANT; a.t += dt; a.born = min(1.0, a.born + dt * 2); a.a += sin(a.t * 1.3) * dt * 1.2
	if a.x < -2.9 or a.x > 2.9 or a.y < 5.4 or a.y > 15.2:
		var d = atan2(10 - a.y, 0 - a.x) - a.a; d = atan2(sin(d), cos(d)); a.a += d * dt * 3
	for b in BUMPS:
		var dx: float = a.x - b.x; var dy: float = a.y - b.y; var dd = hyp(dx, dy)
		if dd < 1.1:
			var q = atan2(dy, dx) - a.a; q = atan2(sin(q), cos(q)); a.a += q * dt * 4; a.x = b.x + dx / dd * 1.1; a.y = b.y + dy / dd * 1.1
	a.x += cos(a.a) * 0.5 * dt; a.y += sin(a.a) * 0.5 * dt
	a.m.position = P(a.x, a.y, 0); a.m.rotation = Vector3(0, a.a - PI / 2, 0); a.m.scale = Vector3.ONE * max(0.01, 1.5 * a.born)
	for k in 6: a.legs[k].rotation.y = sin(a.t * 14 + k * 2) * 0.4
	a.hm.albedo_color.a = 0.4 + 0.35 * sin(a.t * 5)
	if GS.state != "play": return
	for b in BALLS:
		if b.mode == "play" and hyp(b.x - a.x, b.y - a.y) < R + 0.32: eat_ant(); break
func eat_ant() -> void:
	var a = ANT; jump(SPR.igor); a.m.queue_free(); ANT = null; ant_t = 30.0; GS.ants += 1; GS.antsEver += 1; add_score(25000, a.x, a.y, "#9be38a", true); snd("ant"); burst(a.x, a.y, 0.3, "#9be38a", 24, 3)
	if GS.antsEver == 5:
		GS.balls += 1; ui.dmsg([tt("EXTRA", "PALLA"), tt("BALL!", "EXTRA!")], 2, true, 3); ui.say(tt("Gnam! The fifth ant: extra ball!", "Gnam! La quinta formica: palla extra!"), 2.8, true); snd("fan_024")
	else:
		set_save(12); ui.dmsg(["GNAM!", tt("BALL SAVER", "SALVA PALLA")], 1.6, true, 3); ui.say(tt("Gnam! Now Igor protects your ball!", "Gnam! Ora Igor protegge la tua pallina!"), 2.6, true)

# ---------- tokens: the islands ----------
func spawn_tok() -> void:
	var kinds = ["carib", "lake", "shroom"].filter(func(k): return k != THEME); var kind: String = kinds.pick_random()
	var spots = []
	for s in TOK_SPOTS:
		var ok = true
		for b in BALLS: ok = ok and hyp(b.x - s[0], b.y - s[1]) >= 1.6
		if ok: spots.append(s)
	if spots.is_empty(): tok_t = 2.0; return
	var sp = spots.pick_random()
	var G = Node3D.new(); G.position = P(sp[0], sp[1], 0); table.add_child(G)
	var m: Node3D = N["tok_" + kind].duplicate(); m.visible = true; m.position = Vector3.ZERO; G.add_child(m)
	var ring = MeshInstance3D.new(); var tm = TorusMesh.new(); tm.inner_radius = 0.42; tm.outer_radius = 0.5; ring.mesh = tm
	var rm = StandardMaterial3D.new(); rm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; rm.albedo_color = Color(TH[kind].acc); ring.material_override = rm; ring.position.y = 0.03; G.add_child(ring)
	TOK = {kind = kind, x = sp[0], y = sp[1], G = G, m = m, ring = ring, t = 0.0}
	ui.say(tt("Look, a palm tree! Hit it and we go to the Caribbean!", "Guarda, una palma! Colpiscila e andiamo ai Caraibi!") if kind == "carib" else (tt("A gondola! Hit it: Gondoligor’s lake!", "Una gondola! Colpiscila: il lago di Gondoligor!") if kind == "lake" else tt("A mushroom! Hit it: the wood of John Cagigor!", "Un fungo! Colpiscilo: il bosco di John Cagigor!")), 2.8, false)
func tok_step(dt: float, t: float) -> void:
	if GS.state != "play": return
	if TOK == null:
		tok_t -= dt
		if tok_t <= 0: spawn_tok()
		return
	var T = TOK; T.t += dt
	var pop: float = min(1.0, T.t * 3) * (max(0.0, 1 - (T.t - 14)) if T.t > 14 else 1.0)
	T.G.scale = Vector3.ONE * max(0.01, pop); T.m.rotation.y += dt * 0.8; T.m.position.y = absf(sin(t * 3)) * 0.08; T.ring.scale = Vector3.ONE * (1 + 0.1 * sin(t * 6))
	if T.t > 15: T.G.queue_free(); TOK = null; tok_t = 10.0; return
	for b in BALLS:
		if b.mode == "play" and hyp(b.x - T.x, b.y - T.y) < R + 0.42:
			T.G.queue_free(); TOK = null; tok_t = 22.0; burst(T.x, T.y, 0.5, TH[T.kind].acc, 40, 5); set_theme(T.kind); break

func set_theme(k: String, quiet := false) -> void:
	THEME = k; var T = TH[k]; GS.themeT = 0.0 if k == "home" else 60.0
	pf_mat.albedo_texture = tex("res://assets/img/pf_%s_%s.png" % [k, "it" if IT else "en"])
	(env.sky.sky_material as ShaderMaterial).set_shader_parameter("bg", Color(T.sky)); sea_mat.albedo_color = Color(T.sea)
	env.ambient_light_color = Color(T.hemi[0]).lerp(Color(T.hemi[1]), 0.35); env.ambient_light_energy = 0.75 if k == "carib" else 0.9
	for m in ACCENT_MATS: m.albedo_color = Color(T.acc)
	for i in BULBS.size(): BULBS[i].mat.albedo_color = Color(T.acc if i % 2 else T.acc2)
	ramp_mat.albedo_color = Color(T.ramp)
	for s in ["home", "carib", "lake", "shroom"]: N["scen_" + s].visible = s == k
	SPR.host.texture = CHAR[T.host]
	if quiet: return
	snd_fanfare(MIS[GS.mi].n); ui.flash(0.6); jump(SPR.host); jump(SPR.igor)
	ui.dmsg([tt("BACK HOME", "SI TORNA A CASA") if k == "home" else tt("ISLAND", "ISOLA"), L2(T.N).to_upper().left(16)], 2.4, true, 3)
	ui.say(tt("Back home on Igor’s island!", "Si torna a casa sull’isola di Igor!") if k == "home" else L2(T.hi), 3.6, true)

# ================= sound shortcuts =================
func snd(nm: String, vol := 1.0) -> void: Snd.play(nm, vol)
func snd_note(k: int, loud := false) -> void: Snd.play("note_%d_%d" % [k, 1 if loud else 0])
func snd_nbrass(k: int) -> void: Snd.play("nbrass_%d" % k)
func snd_fanfare(n: Array) -> void:
	for i in MIS.size():
		if MIS[i].n == n: Snd.play("fan_m%d" % i); return
	Snd.play("fan_0246" if n.size() == 4 else "fan_024")

# ================= physics =================
func collide_seg(b: Ball, s: Seg) -> void:
	if not s.on: return
	var px = b.x - s.ax; var py = b.y - s.ay
	var t = (px * s.dx + py * s.dy) / s.l2; t = 0.0 if t < 0 else (1.0 if t > 1 else t)
	var qx = s.ax + s.dx * t; var qy = s.ay + s.dy * t
	var nx = b.x - qx; var ny = b.y - qy; var d2 = nx * nx + ny * ny; var rr = R + s.rad
	if d2 >= rr * rr: return
	if s.one and (px * s.onx + py * s.ony) < 0: return
	var d = sqrt(d2) if d2 > 1e-12 else 1e-6
	nx /= d; ny /= d; b.x = qx + nx * rr; b.y = qy + ny * rr
	var vn = b.vx * nx + b.vy * ny
	if vn < 0:
		b.vx -= (1 + s.e) * vn * nx; b.vy -= (1 + s.e) * vn * ny
		if s.kick and -vn > 1.2: b.vx += nx * s.kick; b.vy += ny * s.kick
		if s.tag != "wall" and -vn > 0.6: on_hit(s.tag, s, b, -vn)
		elif -vn > 3: Snd.play("wall", min(0.07, -vn * 0.005) / 0.07)

func collide_circ(b: Ball, c: Circ) -> void:
	if not c.on: return
	var dx = b.x - c.x; var dy = b.y - c.y; var d2 = dx * dx + dy * dy; var rr = R + c.R
	if d2 >= rr * rr: return
	var d = sqrt(d2) if d2 > 1e-12 else 1e-6
	var nx = dx / d; var ny = dy / d; b.x = c.x + nx * rr; b.y = c.y + ny * rr
	var vn = (b.vx - c.vx) * nx + (b.vy - c.vy) * ny
	if vn < 0:
		b.vx -= (1 + c.e) * vn * nx; b.vy -= (1 + c.e) * vn * ny
		if c.kick:
			b.vx += nx * c.kick; b.vy += ny * c.kick
			var o = b.vx * nx + b.vy * ny
			if o < c.kick * 1.2: b.vx += nx * (c.kick * 1.2 - o); b.vy += ny * (c.kick * 1.2 - o)
		if c.tag != "post": on_hit(c.tag, c, b, -vn)
		elif -vn > 3: Snd.play("wall", min(0.07, -vn * 0.005) / 0.07)

func collide_flip(b: Ball, f: Flip) -> void:
	var ex = cos(f.ang) * f.len; var ey = sin(f.ang) * f.len; var px = b.x - f.px; var py = b.y - f.py
	var t = (px * ex + py * ey) / (f.len * f.len); t = 0.0 if t < 0 else (1.0 if t > 1 else t)
	var qx = f.px + ex * t; var qy = f.py + ey * t; var rad = f.r0 + (f.r1 - f.r0) * t
	var nx = b.x - qx; var ny = b.y - qy; var d2 = nx * nx + ny * ny; var rr = R + rad
	if d2 >= rr * rr: return
	var d = sqrt(d2) if d2 > 1e-12 else 1e-6
	nx /= d; ny /= d; b.x = qx + nx * rr; b.y = qy + ny * rr
	var cx = qx + nx * rad - f.px; var cy = qy + ny * rad - f.py; var svx = -f.w * cy; var svy = f.w * cx
	var vn = (b.vx - svx) * nx + (b.vy - svy) * ny
	if vn < 0:
		var e = 0.32 if f.w != 0 else (0.5 if -vn > FLIP_PASS else 0.06)
		b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny
		if -vn > 4: Snd.play("wall", min(0.07, -vn * 0.5 * 0.005) / 0.07)
	if f.w == 0:
		var tx = -ny; var ty = nx; var vt = b.vx * tx + b.vy * ty; b.vx -= tx * vt * 0.0015; b.vy -= ty * vt * 0.0015

func sensors(b: Ball, ox: float, oy: float) -> void:
	for s in SENS:
		if s.line:
			var dx: float = s.bx - s.ax; var dy: float = s.by - s.ay
			var c0: float = (ox - s.ax) * dy - (oy - s.ay) * dx; var c1: float = (b.x - s.ax) * dy - (b.y - s.ay) * dx
			if (c0 < 0) != (c1 < 0):
				var t: float = ((b.x - s.ax) * dx + (b.y - s.ay) * dy) / (dx * dx + dy * dy)
				if t >= -0.05 and t <= 1.05: s.fn.call(b, b.y > oy)
		else:
			var inn = hyp(b.x - s.x, b.y - s.y) < s.r
			if inn and not b.ins.get(s.id, false): s.fn.call(b)
			b.ins[s.id] = inn

func step(dt: float) -> void:
	for f in FL:
		var tg = f.up if f.press else f.rest; var d = tg - f.ang; var sp = 38.0 if f.press else 22.0
		if absf(d) <= sp * dt: f.w = 0; f.ang = tg
		else: f.w = signf(d) * sp; f.ang += f.w * dt
	for b in BALLS:
		if b.mode != "play": continue
		var ox = b.x; var oy = b.y
		b.vy -= G_ * dt
		var sp = hyp(b.vx, b.vy)
		if sp > VMAX: b.vx *= VMAX / sp; b.vy *= VMAX / sp
		b.x += b.vx * dt; b.y += b.vy * dt
		var gx = int(floor((b.x - GX0) / GC)); var gy = int(floor((b.y - GY0) / GC))
		if gx >= 0 and gx < GW and gy >= 0 and gy < GH:
			var ci = gy * GW + gx
			for s in gseg[ci]: collide_seg(b, s)
			for c in gcirc[ci]: collide_circ(b, c)
		else:
			for s in SEGS: collide_seg(b, s)
			for c in CIRCS: collide_circ(b, c)
		if WAND.on: collide_circ(b, WAND)
		if CLEF.on: collide_circ(b, CLEF)
		for f in FL: collide_flip(b, f)
		var s2 = hyp(b.vx, b.vy)
		if s2 > VMAX + 8: b.vx *= (VMAX + 8) / s2; b.vy *= (VMAX + 8) / s2
		sensors(b, ox, oy)
		if b.cap > 0: b.cap -= dt
		elif hyp(b.x - SAUCER.x, b.y - SAUCER.y) < 0.36 and hyp(b.vx, b.vy) < 19: saucer_catch(b)
	var n = BALLS.size()
	for i in n:
		for j in range(i + 1, n):
			var a = BALLS[i]; var b = BALLS[j]
			if a.mode != "play" or b.mode != "play": continue
			var dx = b.x - a.x; var dy = b.y - a.y; var d2 = dx * dx + dy * dy
			if d2 < 4 * R * R and d2 > 1e-8:
				var d = sqrt(d2); var nx = dx / d; var ny = dy / d; var o = (2 * R - d) / 2
				a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o
				var vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
				if vn < 0: a.vx += vn * nx * 0.95; a.vy += vn * ny * 0.95; b.vx -= vn * nx * 0.95; b.vy -= vn * ny * 0.95

func _ball_pos(b: Ball, p = null) -> void:
	var pos: Vector3 = p if p != null else P(b.x, b.y, R + b.h)
	b.m.position = pos

func balls_frame(dt: float) -> void:
	for b in BALLS.duplicate():
		if b.mode == "lane":
			b.x = PLUNGE.x; b.y = PLUNGE.y - GS.plunge * 0.7; b.vx = 0; b.vy = 0
			if b.has_auto:
				b.auto -= dt
				if b.auto <= 0: b.has_auto = false; b.auto0 = true; launch(b, randf_range(0.5, 0.7))
		elif b.mode == "guide":
			b.spd = max(6.0, b.spd - dt * 14); b.u += b.spd * dt / b.glen
			if b.u >= 1: b.mode = "play"; b.x = -2.7; b.y = 16.35; b.vx = 0; b.vy = -3; b.gold = false; super_skill()
			else:
				var p = _path_at(b, b.u); b.m.position = p; b.sh.position = Vector3(p.x, 0.012, p.z); continue
		elif b.mode == "ramp":
			b.u += b.spd * dt / RAMP_LEN
			if b.u >= 1: ramp_done(b)
			else:
				var p = ramp_at(b.u); b.m.position = p; b.sh.position = Vector3(p.x, 0.012, p.z); b.sh.material_override.albedo_color.a = 0.35; continue
		elif b.mode == "hole":
			b.u += dt
			var sink = b.u / 0.4 if b.u < 0.4 else (1.0 if b.u < 0.9 else max(0.0, 1 - (b.u - 0.9) / 0.25))
			b.m.position = P(SAUCER.x, SAUCER.y, R - sink * 0.55); b.m.scale = Vector3.ONE * (1 - sink * 0.5); b.sh.position = P(SAUCER.x, SAUCER.y, 0.012)
			if b.u > 0.6 and not b.awarded: b.awarded = true; saucer_award(b)
			if b.hold > 0: b.hold -= dt; b.u = min(b.u, 0.85); continue
			if b.u >= 1.15:
				b.mode = "play"; b.awarded = false; b.m.scale = Vector3.ONE; b.x = SAUCER.x + 0.05; b.y = SAUCER.y - 0.25
				var a = atan2(4 - SAUCER.y, 1.2 - SAUCER.x) + randf_range(-0.12, 0.12); var v = randf_range(8, 10)
				b.vx = cos(a) * v; b.vy = sin(a) * v; b.cap = 0.9; snd("eject")
			continue
		if b.mode == "play":
			if b.y < -1.2: ball_lost(b); continue
			if b.gold and b.y > 16.2 and b.x < XR + 0.1 and b.x > 2.5: b.gold = false; gold_path(b); continue
			if b.x > XR and b.y < 1.6 and hyp(b.vx, b.vy) < 1 and not b.has_auto:
				b.mode = "lane"
				if GS.state != "play": b.has_auto = true; b.auto = 0.4; continue
				launch_hint()
			var sp = hyp(b.vx, b.vy)
			var cradle = (FLL.press and b.x < 0 and b.y < 4) or (FLR.press and b.x > 0 and b.y < 4)
			if sp < 0.5 and b.x < XR and not cradle: b.stuck += dt
			else: b.stuck = 0
			if b.y < 6.2 and b.stuck > 0.8:
				b.stuck = 0; var s = 1 if b.x < 0 else -1; b.vx = 2.6 * s; b.vy = -1.8
			elif b.stuck > 2.5:
				b.stuck = 0; b.vx = -signf(b.x if b.x != 0 else 1.0) * randf_range(2, 4); b.vy = randf_range(4, 6); ui.say(tt("Igor blows: fff!", "Igor soffia: fff!"), 1.8, true)
			if b.h > 0 or b.hv != 0:
				b.hv -= 14 * dt; b.h += b.hv * dt
				if b.h <= 0: b.h = 0; b.hv = 0
		b.m.position = P(b.x, b.y, R + b.h)
		# rolling: rotate around the axis perpendicular to the motion
		var vv = Vector3(b.vx, 0, -b.vy)
		if vv.length() > 0.01: b.m.rotate(Vector3.UP.cross(vv).normalized(), vv.length() * dt / R * 0.6)
		b.sh.position = P(b.x + 0.08, b.y - 0.05, 0.012); b.sh.material_override.albedo_color.a = 1.0

func variants(dt: float, t: float) -> void:
	if WAND.on:
		var x = -0.3 + 1.8 * sin(t * 0.7); WAND.x = x; WAND.y = 9.95; WAND.vx = 1.8 * 0.7 * cos(t * 0.7); WAND.vy = 0
		N.wand.position = P(x, 9.95, 0); N.wand.rotation.y += dt
	else: WAND.vx = 0
	if GS.rank >= 3 and GS.state == "play":
		if not CLEF.on:
			GS.clefT -= dt
			if GS.clefT <= 0:
				CLEF.on = true; GS.clefU = 0.0; clef_spr.visible = true; ui.say(tt("The treble clef is flying! Catch it!", "Vola la chiave di violino! Prendila!"), 2.2, true)
		else:
			GS.clefU += dt / 8; var u: float = GS.clefU; var x = lerpf(-2.8, 2.4, u); var y = lerpf(15, 6.2, u) + sin(u * 9) * 0.6
			CLEF.vx = 5.2 / 8; CLEF.vy = -8.8 / 8; CLEF.x = x; CLEF.y = y; clef_spr.position = P(x, y, 0.65)
			if u >= 1: CLEF.on = false; clef_spr.visible = false; GS.clefT = 8.0
	elif CLEF.on and GS.rank < 3: CLEF.on = false; clef_spr.visible = false

# ================= particles =================
func burst(x: float, y: float, h: float, col: String, n := 18, sp := 4.0) -> void:
	var c = Color(col); var v = P(x, y, h)
	for k in n:
		p_i = (p_i + 1) % PN; var d = PD[p_i]
		var a = randf() * TAU; var u = randf() * sp
		d.v = Vector3(cos(a) * u, randf_range(1, sp * 0.9), sin(a) * u); d.l = randf_range(0.5, 1.1); d.m = d.l; d.p = v; d.c = c
func part_step(dt: float) -> void:
	var mm = parts.multimesh
	for i in PN:
		var d = PD[i]
		if d.l <= 0: continue
		d.l -= dt
		if d.l <= 0: mm.set_instance_transform(i, Transform3D(Basis().scaled(Vector3.ZERO), Vector3(0, -99, 0))); continue
		d.v.y -= 7 * dt; d.p += d.v * dt; d.p.y = max(0.05, d.p.y)
		var k: float = d.l / d.m
		mm.set_instance_transform(i, Transform3D(Basis(), d.p)); mm.set_instance_color(i, Color(d.c.r * k, d.c.g * k, d.c.b * k, 1))

# ================= main loop =================
var fps = 60.0
var slow = 0.0
var ap_t = 0.0
var spin_a = 0.0
var flag_a = 0.0
var blink = {next = 2.0, start = -9.0}
func game_tick(dt: float, t: float) -> void:
	if ARC.on: arc_tick(dt); return
	var n = int(ceil(dt * PHYS_HZ)); var h = dt / n
	for i in n: step(h)
	balls_frame(dt); variants(dt, t); ant_step(dt); tok_step(dt, t)
	MU.bpm = lerpf(MU.bpm, bpm_target(), min(1.0, dt * 0.5)); MU.en = max(0.0, MU.en - dt * 0.07)
	if GS.state == "play" and THEME != "home":
		GS.themeT -= dt
		if GS.themeT <= 0: set_theme("home")
	if GS.state == "play": mode_tick(dt)
	if GS.state == "play":
		if GS.save > 0: GS.save -= dt
		if GS.comboT > 0: GS.comboT -= dt
		if GS.skillT > 0: GS.skillT -= dt
		if GS.charging and _lane_ball() != null: GS.plunge = min(1.0, GS.plunge + dt * 0.9)
		if GS.pfxT > 0:
			GS.pfxT -= dt
			if GS.pfxT <= 0: GS.pfx = 1; ui.dmsg(["GROOVE", tt("ENDS", "FINITO")], 1.2, false, 1)
		if GS.jack > 0:
			GS.jack -= dt
			if GS.jack <= 0:
				GS.jack = 0.0; ui.say(tt("The jackpot is gone, but the chord is yours! Next one!", "Il jackpot è sfumato, ma l’accordo è tuo! Il prossimo!"), 2.8, true); next_mission()

func _lane_ball(manual := false):
	for b in BALLS:
		if b.mode == "lane" and (not manual or not b.has_auto): return b
	return null

func bpm_target() -> float:
	var s = 0.0; var n = 0
	for b in BALLS:
		if b.mode == "play" or b.mode == "ramp":
			s += b.spd if b.mode == "ramp" else hyp(b.vx, b.vy); n += 1
	if n == 0: return 84.0
	return 80 + clampf(s / n - 4, 0, 30) * 2

func _process(delta: float) -> void:
	var dt: float = min(0.05, delta)
	fps = lerpf(fps, 1.0 / max(0.001, delta), 0.05)
	if fps < 45 and ui.render_scale > 0.6:
		slow += dt
		if slow > 2.5: slow = 0; ui.render_scale = max(0.6, ui.render_scale - 0.1); fit()
	else: slow = 0
	var t = now(); GS.t = t
	if not paused:
		music(t)
		game_tick(dt, t)
		if GS.shown < GS.score: GS.shown = min(float(GS.score), GS.shown + max(37.0, (GS.score - GS.shown) * dt * 6))
		_visuals(dt, t)
		part_step(dt)
	ui.frame(dt, t)

func _visuals(dt: float, t: float) -> void:
	for i in 3: N["flip%d" % i].rotation.y = FL[i].ang
	for i in 2:
		var S: Node3D = N["snout%d" % i]; var f: Flip = FL[i]
		var st: float = S.get_meta("t", 0.0); st = min(1.0, st + dt * 12) if f.press else max(0.0, st - dt * 6); S.set_meta("t", st)
		S.scale = Vector3.ONE * (1 + st * 0.06)
		var bl = 1.0 if sin(t * 0.9 + (2.0 if f.side > 0 else 0.0)) > 0.985 else 0.0
		for j in 2: N["lid%d_%d" % [i, j]].scale.y = max(0.01, max(bl, st * 0.55))
	for i in 3:
		var G: Node3D = N["drum%d" % i]; var k: float = G.get_meta("t", 0.0); var e = sin((1 - k) * PI * 2.5) * k
		G.scale = Vector3(1 + 0.3 * e, 1 - 0.25 * e + 0.15 * k, 1 + 0.3 * e); G.set_meta("t", max(0.0, k - dt * 3.2))
		var hit: Node3D = N["drumhit%d" % i]
		if i < 2:
			drum_mats[i].hit.emission_energy_multiplier = k * 0.8; hit.position.y = 0.42 - k * 0.03
			if drum_mats[i].ring != drum_mats[i].hit: drum_mats[i].ring.emission_energy_multiplier = 0.15 + k * 0.9
		else:
			hit.rotation.x = sin(t * 30) * k * 0.25; hit.rotation.z = cos(t * 27) * k * 0.2; hit.position.y = 0.8 - k * 0.05
	for i in 2:
		var bn: Node3D = N["band%d" % i]; var k: float = max(0.0, bn.get_meta("t", 0.0) - dt * 6); bn.set_meta("t", k)
		band_mats[i].albedo_color = Color(0.4 + k * 0.6, 0.4 + k * 0.6, 0.47 + k * 0.53)
	for i in 3:
		var d: Node3D = N["drop%d" % i]; d.position.y = lerpf(d.position.y, 0.23 if DROPS[i].on else -0.25, min(1.0, dt * 14))
	for i in 4:
		var o: Node3D = N["igt%d" % i]; var k: float = max(0.0, o.get_meta("t", 0.0) - dt * 5); o.set_meta("t", k); o.position.x = (-3.43 - k * 0.06) - CX
	for k in 7:
		var g: Node3D = N["gate%d" % k]; var gt: float = max(0.0, g.get_meta("t", 0.0) - dt * 4); g.set_meta("t", gt)
		g.position.y = lerpf(g.position.y, 0.18 if GATES[k].on else -0.3, min(1.0, dt * 10)); gate_mats[k].emission_energy_multiplier = 0.4 + gt * 1.6
	var sw: float = N.spin.get_meta("w", 0.0) * pow(0.25, dt); var pa = spin_a; spin_a += sw * dt; N.spin.set_meta("w", sw)
	if floor(spin_a / PI) != floor(pa / PI) and sw > 2: add_score(200); snd("wall", 0.4)
	N.spin.rotation.x = spin_a
	var fw: float = N.flag.get_meta("w", 0.0) * pow(0.3, dt); N.flag.set_meta("w", fw); flag_a += fw * dt; N.flagRot.rotation.y = flag_a + sin(t * 2) * 0.15
	ffbar.visible = FFS.on and GS.state == "play"; ffbar.position = P(FFS.x, FFS.y + 0.2, 2.2)
	var fy: float = N.ffStatue.get_meta("y", -1.2); fy = lerpf(fy, 0.0 if FFS.on else -1.2, min(1.0, dt * 3)); N.ffStatue.set_meta("y", fy)
	var fsh: float = max(0.0, N.ffStatue.get_meta("shake", 0.0) - dt * 4); N.ffStatue.set_meta("shake", fsh)
	N.ffStatue.position = P(FFS.x + randf_range(-1, 1) * fsh * 0.05, FFS.y, fy); N.ffBlock.scale.y = 1 - (GS.mp / 4.0) * (1.0 if MODE() == "ff" else 0.0)
	N.sauSw.rotate(Vector3.UP, -dt * 2)
	ramp_mat.uv1_offset.x -= dt * (3.0 if GS.multi or GS.jack > 0 or GS.polyReady else 1.2) / 16.0 * 16.0
	ramp_mat.albedo_color = Color("#ffd36e") if GS.jack > 0 or GS.multi else (Color("#c77dff") if GS.polyReady else Color(TH[THEME].ramp))
	var lane = _lane_ball()
	var pl: float = GS.plunge if lane != null else 0.0
	N.plunger.position = P(5.0, 0.9 - 0.8 - 0.06 - pl * 0.7, 0.22)
	for i in 6: N["spring%d" % i].position.z = -0.6 + i * 0.18 * (1 - pl * 0.55)
	# inserts
	var bl = int(floor(t * 4)) % 2; var fast = int(floor(t * 8)) % 2; var mi = MIS[GS.mi]; var md = MODE()
	I.ramp.st = 2 if (GS.multi or GS.polyReady or md == "metro") else 1
	I.ramp.on = Color("#ffd36e") if (GS.multi or GS.jack > 0) else (Color("#c77dff") if GS.polyReady else Color("#ff8ab6"))
	I.jack.st = 2 if (GS.multi or GS.jack > 0) else 0
	I.orbit.st = 2 if md == "metro" else 1
	I.hole.st = 2 if GS.ready else 1; I.hole.on = Color("#ffd36e") if GS.ready else Color("#c77dff")
	for i in 7: I.modes[i].st = 3 if GS.done[i] else (2 if GS.mode == i else 0)
	for i in 3: I.flag[i].st = 2 if GS.ready else (3 if i < GS.flag else 0)
	for i in 4: I.igor[i].st = 3 if GS.igor[i] else 0
	for i in 3:
		I.ant[i].st = 3 if GS.drop[i] else 0
		I.poly[i].st = 3 if i < GS.polyStars else (2 if GS.polyReady else 0)
	for k in 7:
		var s = 0
		if GS.multi and GS.finale <= 0: s = 3 if t - GS.polyT[k] < 0.4 else 1
		elif md == "chords": s = 3 if GS.lit[k] else (2 if mi.n.has(k) else 0)
		elif md == "ear": s = 1
		elif md == "key": s = (3 if GS.acc[k] else 0) if GS.acc[k] == GS.key.a.get(k, 0) else 2
		elif md == "tune": s = 2 if k == GS.tune.n[min(GS.tuneI, GS.tune.n.size() - 1)] else 0
		else: s = 3 if GS.lit[k] else (2 if (GS.skillT > 0 or lane != null) and k == GS.skill else 0)
		I.notes[k].st = s
	for i in 5: I.bx[i].st = 3 if GS.bx >= i + 2 else 0
	for i in 4: I.bl[i].st = 3 if GS.bl[i] else 0
	I.again.st = (2 if GS.save < 3 else 3) if GS.save > 0 else 0
	for i in 3: I.groove[i].st = 3 if GS.pfx >= i + 2 else (1 if float(GS.beats) / groove_need() > (i + 1) / 4.0 else 0)
	var attract: bool = GS.state == "title" or GS.state == "over"
	for o in INS:
		var v: float
		if o.st == 3: v = 1.0
		elif o.st == 2: v = 1.0 if ((fast if (o == I.again or o == I.jack) else bl) == 1) else 0.2
		elif o.st == 1: v = 0.45 + 0.35 * sin(t * 5)
		else: v = o.base
		if attract: v = 0.15 + 0.85 * max(0.0, sin(t * 3 + o.m.position.z * 0.6 + o.m.position.x * 0.3))
		var con: Color = o.on
		o.mat.albedo_color = Color(con.r * 0.3, con.g * 0.3, con.b * 0.3).lerp(con, v)
		o.hmat.albedo_color = Color(con.r, con.g, con.b, (v - 0.5) * 1.1 if v > 0.5 else 0.0)
	# ball trails
	for b in BALLS:
		b.hi = (b.hi + 1) % 21; b.hist[b.hi] = b.m.position; b.hn = min(21, b.hn + 1)
		for i in b.trail.size():
			var k = i * 2 + 2; var s: MeshInstance3D = b.trail[i]
			if k < b.hn and not ARC.on: s.visible = true; s.position = b.hist[(b.hi - k + 42) % 21]
			else: s.visible = false
	# characters
	var beat_bpm: float = MU.bpm
	for nm in SPR:
		var sp: Sprite3D = SPR[nm]; var u: float = max(0.0, sp.get_meta("jump") - dt * 2.2); sp.set_meta("jump", u)
		var j = sin(min(1.0, 1 - u) * PI) * u * 0.6
		var dancer: bool = nm == "d1" or nm == "d2"
		var bob = absf(sin(t * beat_bpm / 60 * PI)) * 0.12 if dancer else 0.0
		var sq = 1 + sin(t * beat_bpm / 60 * TAU) * (0.04 if dancer else 0.015)
		var hgt: float = sp.get_meta("h")
		sp.pixel_size = hgt * sq / float(sp.texture.get_height()); sp.scale = Vector3(1 / (sq * sq), 1, 1)
		var bp: Vector3 = sp.get_meta("base"); sp.position = Vector3(bp.x, bp.y + bob + j, bp.z)
	# Igor blinks
	if t > blink.next: blink.start = t; blink.next = t + (0.45 if randf() < 0.2 else 2.5 + randf() * 4)
	var bu: float = t - blink.start; var kk = 0.0 if (bu < 0 or bu > 0.26) else (bu / 0.07 if bu < 0.07 else (1.0 if bu < 0.12 else 1 - (bu - 0.12) / 0.14))
	var fr = 2 if kk > 0.75 else (1 if kk > 0.25 else 0)
	SPR.igor.texture = CHAR["igor%d" % fr]; ui.igor_frame = fr
	for i in BULBS.size(): BULBS[i].n.scale = Vector3.ONE * (0.8 + 0.4 * max(0.0, sin(t * 3 + i * 0.7)))
	# camera shake / attract sway
	GS.shake = max(0.0, GS.shake - dt * 2.5); var sh: float = GS.shake * GS.shake * 0.6
	cam.position = cam_base + Vector3(randf_range(-sh, sh), randf_range(-sh, sh) * 0.5, 0)
	if attract: cam.position.x = cam_base.x + sin(t * 0.25) * 0.6
	# title: the flippers play by themselves
	if GS.state == "title":
		var l = false; var r = false
		for b in BALLS:
			if b.x < 0 and b.y < 3.6 and b.y > 1.4: l = true
			if b.x > 0 and b.x < XR and b.y < 3.6 and b.y > 1.4: r = true
		FLL.press = l; FLU.press = l; FLR.press = r

# ================= music =================
func triad(d: int) -> Array:
	var r = []
	for k in [0, 2, 4]:
		var i = d + k; r.append(NOTE_M[i % 7] + 12 * int(i / 7))
	return r
func prog_chord(bar: int) -> Array:
	var r: int = MIS[GS.mi].n[0]
	return triad([r, (r + 5) % 7, (r + 3) % 7, (r + 4) % 7][bar % 4])
func music(t: float) -> void:
	if not MU.on: return
	if MU.next < t - 0.2: MU.next = t + 0.05
	while MU.next <= t:
		var th = THEME; var SPB = 12 if th == "lake" else 16; var st: int = MU.step % SPB; var bar: int = MU.step / SPB
		_style(th, st, prog_chord(bar), MU.en, GS.pfx > 1)
		if GS.multi and MU.step % 2 == 1: Snd.play("mhat", 1.0)
		MU.step += 1; MU.next += 60.0 / (MU.bpm * (1.15 if th == "lake" else 1.0)) / 4.0
func _hat(v := 0.02) -> void: Snd.play("mhat", v / 0.03)
func _style(th: String, st: int, ch: Array, en: float, gr: bool) -> void:
	match th:
		"home":
			if st % 2 == 0: var p: int = [0, 1, 2, 1, 0, 2, 1, 2][st / 2]; Snd.inst("pluck", ch[p] + 12)
			if st == 0:
				for m in ch: Snd.inst("pad", m)
				Snd.inst("bass", ch[0] - 12)
			if st == 8: Snd.inst("bass", ch[0] - 12, 0.78)
			if en > 0.3 and st % 2 == 1: _hat(0.012 + 0.012 * en)
			if gr or en > 0.75:
				if st % 4 == 0: Snd.play("mkick")
				if st == 4 or st == 12: Snd.play("msnr")
		"carib":
			var i = [0, 3, 6, 8, 10, 12, 14].find(st)
			if i >= 0: Snd.inst("steel", ch[[0, 2, 1, 0, 2, 1, 2][i]] + 12)
			if [0, 6, 8, 14].has(st): Snd.inst("bassS", ch[0] - 12)
			if [0, 3, 6, 10, 12].has(st): Snd.play("click")
			_hat(0.01 + 0.012 * en)
			if gr and st % 8 == 0: Snd.play("mkick")
		"lake":
			if st == 0: Snd.inst("bassT", ch[0] - 12)
			if st == 4 or st == 8:
				for m in ch: Snd.inst("accord", m)
			if st % 2 == 0 and en > 0.2: Snd.inst("arpT", ch[(st / 2) % 3] + 24)
			if gr and st == 0: Snd.play("mkick")
		"shroom":
			if st == 0: Snd.inst("drone", ch[0] - 24)
			if randf() < 0.16 + 0.34 * en: Snd.inst("prep", ch.pick_random() + 12 * (1 + (1 if randf() < 0.4 else 0)))
			if gr and st % 8 == 0: Snd.play("thump")

# ================= input =================
func flip(side: int, on: bool) -> void:
	if ARC.on: arc_input(side, on); return
	var fs = [FLL, FLU] if side < 0 else [FLR]
	if fs[0].press == on: return
	for f in fs: f.press = on
	if on and GS.state == "play":
		snd("flip")
		if side < 0: GS.bl.push_back(GS.bl.pop_front())
		else: GS.bl.push_front(GS.bl.pop_back())
func charge(on: bool) -> void:
	var lane = _lane_ball(true)
	if on:
		if lane != null and GS.state == "play": GS.charging = true
	elif GS.charging:
		GS.charging = false
		if lane != null and GS.state == "play": launch(lane, GS.plunge)
		GS.plunge = 0.0

func toggle_pause(force = null) -> void:
	var p: bool = force if force != null else not paused
	if GS.state != "play" and GS.state != "bonus" and not paused: return
	paused = p; ui.show_screen("pause" if p else "")
	AudioServer.set_bus_mute(AudioServer.get_bus_index("Verb"), p)
	if p:
		for f in FL: f.press = false
		GS.charging = false

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		if GS.get("state") == "play" or GS.get("state") == "bonus":
			if paused: get_tree().quit()
			else: toggle_pause(true)
		else: get_tree().quit()
		return
	if what == NOTIFICATION_APPLICATION_PAUSED or what == NOTIFICATION_APPLICATION_FOCUS_OUT:
		if GS.get("state") == "play" or GS.get("state") == "bonus": toggle_pause(true)
