extends CanvasLayer
## Everything on screen that is not the 3D table: dot-matrix display, Igor, mission pill, bubbles, pops,
## the apron display (drawn into a texture used by the 3D apron), the arcade, title/pause/game-over cards, input.

var M  # main
var render_scale = 1.0
var view_rect = Rect2()
var touch_ui = true
var igor_frame = 0

var root: Control
var view: TextureRect
var top: Control
var dmd_vp: SubViewport; var dmd_c: Control; var dmd_rect: TextureRect
var ig_panel: Panel; var ig_img: TextureRect; var ig_shield: TextureRect
var tools: HBoxContainer; var b_mute: Button; var b_pause: Button
var mis: Control
var bub: PanelContainer; var bub_l: Label; var bub_t = 0.0; var bub_next = 0.0
var pops: Control
var flash_r: ColorRect
var bigl: Label
var hint_p: PanelContainer; var hint_l: Label
var pm: Control
var arc_box: PanelContainer; var arc_vp: SubViewport; var arc_c: Control; var arc_rect: TextureRect; var arc_title: Label; var arc_how: Label
var ap_vp: SubViewport; var ap_c: Control
var scr: Control; var cards = {}
var over_score: Label; var over_title: Label; var over_sub: Label; var best_l: Label

var F: FontVariation    # Fredoka 600
var FB: FontVariation   # Fredoka 700
var FP: FontFile        # Press Start 2P (pixel)
var DQ = []
var dmd_t = 0.0; var ap_t = 0.0; var mis_t = 0.0
var EM = {}
const DMD_SHADER := "shader_type canvas_item; uniform vec2 cells = vec2(128.0, 32.0); uniform float gap = 0.14;
void fragment(){ vec2 g = UV * cells; vec2 f = fract(g); vec4 s = texture(TEXTURE, (floor(g) + 0.5) / cells);
 float inside = step(gap, f.x) * step(f.x, 1.0 - gap) * step(gap, f.y) * step(f.y, 1.0 - gap);
 vec3 col = mix(vec3(0.165, 0.078, 0.031), s.rgb, s.a); COLOR = vec4(mix(vec3(0.047, 0.024, 0.008), col, inside), 1.0); }"

func tt(e: String, i: String) -> String: return M.tt(e, i)

func _font(path: String, w: int) -> FontVariation:
	var ff: FontFile = load(path)
	var fb: FontFile = load("res://assets/fonts/DejaVuSans-Bold.ttf")
	ff.fallbacks = [fb]
	var fv = FontVariation.new(); fv.base_font = ff
	fv.variation_opentype = {TextServerManager.get_primary_interface().name_to_tag("wght"): w}
	return fv

func em(i: int) -> Texture2D:
	if not EM.has(i): EM[i] = load("res://assets/img/em_%d.png" % i)
	return EM[i]

func sbox(bg: Color, radius := 12, border := 0, bc := Color.TRANSPARENT, pad := 8) -> StyleBoxFlat:
	var s = StyleBoxFlat.new(); s.bg_color = bg; s.set_corner_radius_all(radius); s.set_border_width_all(border); s.border_color = bc
	s.content_margin_left = pad; s.content_margin_right = pad; s.content_margin_top = pad * 0.6; s.content_margin_bottom = pad * 0.6
	s.anti_aliasing = true
	return s

func build() -> void:
	F = _font("res://assets/fonts/Fredoka.ttf", 600); FB = _font("res://assets/fonts/Fredoka.ttf", 700)
	FP = load("res://assets/fonts/PressStart2P-Regular.ttf"); FP.antialiasing = TextServer.FONT_ANTIALIASING_NONE; FP.hinting = TextServer.HINTING_NONE
	FP.subpixel_positioning = TextServer.SUBPIXEL_POSITIONING_DISABLED; FP.fallbacks = [load("res://assets/fonts/DejaVuSans-Bold.ttf")]
	touch_ui = OS.has_feature("mobile") or DisplayServer.is_touchscreen_available()
	render_scale = 0.8 if OS.has_feature("mobile") else 1.0
	var th = Theme.new(); th.default_font = F; th.default_font_size = 15
	root = Control.new(); root.set_anchors_preset(Control.PRESET_FULL_RECT); root.theme = th; root.mouse_filter = Control.MOUSE_FILTER_IGNORE; add_child(root)
	var bg = ColorRect.new(); bg.color = Color("#0e1a33"); bg.set_anchors_preset(Control.PRESET_FULL_RECT); bg.mouse_filter = Control.MOUSE_FILTER_IGNORE; root.add_child(bg)
	view = TextureRect.new(); view.texture = M.sv.get_texture(); view.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; view.stretch_mode = TextureRect.STRETCH_SCALE
	view.mouse_filter = Control.MOUSE_FILTER_IGNORE; root.add_child(view)
	_build_apron(); _build_top(); _build_mis(); _build_misc(); _build_arcade(); _build_screens()
	show_screen("title")

# ---------------- apron (texture for the 3D apron) ----------------
func _build_apron() -> void:
	ap_vp = SubViewport.new(); ap_vp.size = Vector2i(1024, 256); ap_vp.transparent_bg = false; ap_vp.render_target_update_mode = SubViewport.UPDATE_ONCE
	ap_c = Control.new(); ap_c.size = Vector2(1024, 256); ap_vp.add_child(ap_c); ap_c.draw.connect(_draw_apron); add_child(ap_vp)
	if M.apron_mat:
		M.apron_mat.albedo_texture = ap_vp.get_texture(); M.apron_mat.uv1_scale = Vector3(1, -1, 1); M.apron_mat.uv1_offset = Vector3(0, 1, 0)

func _rr(c: CanvasItem, r: Rect2, col: Color, rad: float) -> void:
	var s = StyleBoxFlat.new(); s.bg_color = col; s.set_corner_radius_all(int(rad)); s.anti_aliasing = true; c.draw_style_box(s, r)
func _txt(c: CanvasItem, f: Font, s: String, pos: Vector2, size: int, col: Color, align := HORIZONTAL_ALIGNMENT_LEFT, w := -1.0) -> void:
	# pos.y is the vertical centre of the text
	var asc = f.get_ascent(size); var desc = f.get_descent(size)
	c.draw_string(f, Vector2(pos.x, pos.y + (asc - desc) / 2.0), s, align, w, size, col)
func _fit_text(f: Font, s: String, size: int, maxw: float) -> int:
	var z = size
	while z > 10 and f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, z).x > maxw: z -= 1
	return z

func _draw_apron() -> void:
	var g = ap_c; var GS: Dictionary = M.GS; var T = M.TH[M.THEME]; var t: float = M.now()
	var c0 = Color(T.ap[0]); var c1 = Color(T.ap[1])
	for i in 16: g.draw_rect(Rect2(0, i * 16, 1024, 16), c0.lerp(c1, i / 15.0))
	var sb = StyleBoxFlat.new(); sb.draw_center = false; sb.set_border_width_all(4); sb.border_color = Color(T.acc, 0.53); sb.set_corner_radius_all(22); sb.anti_aliasing = true
	g.draw_style_box(sb, Rect2(6, 6, 1012, 244))
	var mi = M.MIS[GS.mi]; var bl = int(floor(t * 4)) % 2; var md = M.MODE(); var mo = M.MODES[GS.mode] if GS.mode >= 0 else null
	var head = ""; var sub = ""; var kind = "scale"; var icon = -1
	if GS.finale > 0: head = "GRAN CONCERTO!"; sub = tt("Everything is worth double!", "Tutto vale doppio!") + " · %d s" % ceil(GS.finale); kind = "poly"
	elif GS.multi: head = tt("POLYPHONY!", "POLIFONIA!"); sub = tt("The lanes are closed: hit the notes together for chords!", "Le corsie sono chiuse: colpisci più note insieme per fare accordi!"); kind = "poly"
	elif mo == null:
		var m = M.MODES[GS.sel]
		if GS.ready: head = tt("MISSION READY", "MISSIONE PRONTA") + ": " + M.L2(m.N).to_upper(); sub = tt("Send the ball to the Stage!", "Manda la pallina nel Palco!")
		else: icon = m.ic; head = tt("NEXT MISSION", "PROSSIMA MISSIONE") + ": " + M.L2(m.N).to_upper(); sub = tt("Hit the flag (%d/3), then the Stage", "Colpisci la banderuola (%d/3), poi il Palco") % GS.flag
	else:
		icon = mo.ic; head = M.L2(mo.N).to_upper() + " · %d s" % ceil(GS.modeT); kind = md
		match md:
			"chords": sub = tt("Chord", "Accordo") + " %d/3 · %s: %s" % [GS.mp + 1, M.L2(mi.N), M.chord_names(mi)]
			"drums": sub = tt("Hit the drums! %d/40", "Colpisci la batteria! %d/40") % GS.mp
			"ff": sub = tt("Hit the statue as HARD as you can (a straight shot from the flipper): %d/3 ff", "Colpisci la statua FORTISSIMO (tiro dritto dalla paletta): %d/3 ff") % GS.mp
			"ear": sub = tt("Listen to Igor and take that lane: %d/3", "Ascolta Igor e prendi quella corsia: %d/3") % GS.mp
			"key": sub = M.L2(GS.key.N) + ": " + M.key_text()
			"metro": sub = tt("Ramps and orbits on the beat: %d/3", "Rampe e orbite a tempo: %d/3") % GS.mp
			_: sub = M.L2(GS.tune.N) + ": " + M.tune_text()
	var hx = 150.0
	if icon >= 0: g.draw_texture_rect(em(icon), Rect2(150, 24, 36, 36), false); hx = 194.0
	_txt(g, FB, head, Vector2(hx, 42), _fit_text(FB, head, 32, 1000 - hx), Color("#ffd36e"))
	_txt(g, F, sub, Vector2(150, 80), _fit_text(F, sub, 22, 840), Color("#f3e7d3"))
	var W = 80.0; var H = 98.0; var x0 = 150.0; var y0 = 112.0
	var cell = func(x: float, on: float, col: String, label: String, fs := 34, mark := ""):
		_rr(g, Rect2(x, y0, W, H), Color("#0b0618"), 16)
		_rr(g, Rect2(x + 4, y0 + 4, W - 8, H - 8), Color(col, on), 13)
		_txt(g, FB, label, Vector2(x, y0 + H / 2 + 2), fs, Color("#1b1030") if on > 0.5 else Color(1, 1, 1, 0.67), HORIZONTAL_ALIGNMENT_CENTER, W)
		if mark != "": _txt(g, FB, mark, Vector2(x + W - 24, y0 + 17), 18, Color("#1b1030"))
	var nf = func(k: int) -> int: return 30 if M.NOTE_N[k].length() > 2 else 36
	if kind == "drums":
		_rr(g, Rect2(x0, y0 + 20, 620, 58), Color("#0b0618"), 18)
		_rr(g, Rect2(x0 + 4, y0 + 24, max(30.0, 612 * min(1.0, GS.mp / 40.0)), 50), Color("#ffb35a"), 15)
		g.draw_texture_rect(em(1), Rect2(x0 + 230, y0 + 30, 40, 40), false)
		_txt(g, FB, "%d/40" % GS.mp, Vector2(x0 + 280, y0 + 50), 34, Color.WHITE)
	elif kind == "ff":
		for i in 6:
			var on = 1.0 if (t - GS.dynT < 0.8 and GS.dynI == i) else ((0.8 if bl else 0.35) if i == 5 else 0.18)
			_rr(g, Rect2(x0 + i * 104, y0, 96, H), Color("#0b0618"), 16)
			_rr(g, Rect2(x0 + i * 104 + 4, y0 + 4, 88, H - 8), Color("#ff5a5a" if i == 5 else "#d8d2c4", on), 13)
			_txt(g, FB, M.DYN[i], Vector2(x0 + i * 104, y0 + H / 2), 40, Color("#1b1030"), HORIZONTAL_ALIGNMENT_CENTER, 96)
	elif kind == "metro":
		var ph = fposmod(GS.t - GS.metro0, M.METRO_P) / M.METRO_P; var beat = posmod(int(floor((GS.t - GS.metro0) / M.METRO_P)), 7)
		for k in 7: cell.call(x0 + k * 90, (1 - ph * 0.7) if k == beat else 0.12, "#ffd36e", "●" if k == beat else "", 30)
	elif kind == "tune":
		var n: Array = GS.tune.n
		for i in n.size(): cell.call(x0 + i * 90, 1.0 if i < GS.tuneI else ((0.95 if bl else 0.3) if i == GS.tuneI else 0.15), M.NOTE_C[n[i]], M.NOTE_N[n[i]], nf.call(n[i]), "✓" if i < GS.tuneI else "")
	else:
		for k in 7:
			var x = x0 + k * 90
			if kind == "poly": cell.call(x, 1.0 if t - GS.polyT[k] < 0.4 else 0.35, M.NOTE_C[k], M.NOTE_N[k], nf.call(k))
			elif kind == "chords":
				var need: bool = mi.n.has(k); var lit: bool = GS.lit[k] == 1
				cell.call(x, 1.0 if lit else ((0.95 if bl else 0.3) if need else 0.12), M.NOTE_C[k], M.NOTE_N[k], nf.call(k), "✓" if lit else "")
			elif kind == "ear": cell.call(x, 0.3 + 0.2 * sin(t * 3 + k), M.NOTE_C[k], "?", 36)
			elif kind == "key":
				var want: int = GS.key.a.get(k, 0); var ok: bool = GS.acc[k] == want
				cell.call(x, ((1.0 if want else 0.4) if ok else (0.95 if bl else 0.3)), M.NOTE_C[k], M.NOTE_N[k] + M.acc_of(GS.acc[k]), 26 if M.NOTE_N[k].length() > 2 else 32, "✓" if ok and want else "")
			else: cell.call(x, 1.0 if GS.lit[k] else 0.15, M.NOTE_C[k], M.NOTE_N[k], nf.call(k))
	var rx = x0 + 7 * 90 + 6
	_txt(g, FB, M.L2(M.RANKS[GS.rank]), Vector2(rx, 128), 19, Color("#ffd36e"))
	var stars = ""
	for v in GS.done: stars += "★" if v else "☆"
	_txt(g, FB, stars, Vector2(rx, 154), 20, Color("#ffd36e"))
	var ps = ""
	for i in 3: ps += "★" if i < GS.polyStars else "☆"
	_txt(g, FB, tt("POLYPHONY ", "POLIFONIA ") + ps, Vector2(rx, 182), 17, Color("#c77dff"))
	_txt(g, FB, "GROOVE ×%d" % GS.pfx if GS.pfx > 1 else "GROOVE", Vector2(rx, 208), 17, Color("#ffb35a"))
	g.draw_rect(Rect2(rx, 220, 92, 10), Color(1, 1, 1, 0.13)); g.draw_rect(Rect2(rx, 220, 92 * min(1.0, float(GS.beats) / M.groove_need()), 10), Color("#ffb35a"))

# ---------------- top bar: dot-matrix display, Igor, tools ----------------
func _build_top() -> void:
	top = Control.new(); top.mouse_filter = Control.MOUSE_FILTER_IGNORE; root.add_child(top)
	var grad = ColorRect.new(); grad.color = Color("#0e1a33f2"); grad.mouse_filter = Control.MOUSE_FILTER_IGNORE; grad.name = "bg"; top.add_child(grad)
	dmd_vp = SubViewport.new(); dmd_vp.size = Vector2i(128, 32); dmd_vp.transparent_bg = true; dmd_vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	dmd_vp.canvas_item_default_texture_filter = Viewport.DEFAULT_CANVAS_ITEM_TEXTURE_FILTER_NEAREST
	dmd_c = Control.new(); dmd_c.size = Vector2(128, 32); dmd_vp.add_child(dmd_c); dmd_c.draw.connect(_draw_dmd); add_child(dmd_vp)
	var frame = Panel.new(); frame.name = "dmdw"; var fs = sbox(Color("#5a3a20"), 10, 2, Color("#8a5a32")); fs.shadow_color = Color("#ff8a1e33"); fs.shadow_size = 10
	frame.add_theme_stylebox_override("panel", fs); frame.mouse_filter = Control.MOUSE_FILTER_IGNORE; top.add_child(frame)
	dmd_rect = TextureRect.new(); dmd_rect.texture = dmd_vp.get_texture(); dmd_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; dmd_rect.stretch_mode = TextureRect.STRETCH_SCALE
	dmd_rect.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST; var sm = ShaderMaterial.new(); var sh = Shader.new(); sh.code = DMD_SHADER; sm.shader = sh; dmd_rect.material = sm
	dmd_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE; frame.add_child(dmd_rect)
	ig_panel = Panel.new(); var isb = sbox(Color("#1d3354"), 64, 2, Color("#9be38a88")); ig_panel.add_theme_stylebox_override("panel", isb)
	ig_panel.clip_children = CanvasItem.CLIP_CHILDREN_AND_DRAW; ig_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE; top.add_child(ig_panel)
	ig_img = TextureRect.new(); ig_img.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; ig_img.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	ig_img.texture = M.CHAR.igor0; ig_img.mouse_filter = Control.MOUSE_FILTER_IGNORE; ig_panel.add_child(ig_img)
	ig_shield = TextureRect.new(); ig_shield.texture = em(11); ig_shield.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; ig_shield.size = Vector2(20, 20); ig_shield.visible = false
	ig_shield.mouse_filter = Control.MOUSE_FILTER_IGNORE; top.add_child(ig_shield)
	tools = HBoxContainer.new(); tools.add_theme_constant_override("separation", 6); top.add_child(tools)
	b_mute = _tool_btn(em(13 if Snd.muted else 12), func(): Snd.set_mute(not Snd.muted); b_mute.icon = em(13 if Snd.muted else 12))
	b_pause = _tool_btn(em(14), func(): M.toggle_pause())

func _tool_btn(icon: Texture2D, cb: Callable) -> Button:
	var b = Button.new(); b.icon = icon; b.expand_icon = true; b.custom_minimum_size = Vector2(38, 38); b.focus_mode = Control.FOCUS_NONE
	for st in ["normal", "hover", "pressed", "focus"]: b.add_theme_stylebox_override(st, sbox(Color("#1d1230cc"), 19, 2, Color("#f1b46e66"), 6))
	b.pressed.connect(cb); tools.add_child(b); return b

func hud_height() -> float: return top.size.y + 26 if top else 100.0

func _layout() -> void:
	var vs = root.get_viewport_rect().size; var W = vs.x
	var safe = DisplayServer.get_display_safe_area(); var win = DisplayServer.window_get_size()
	var inset = 0.0
	if win.y > 0 and safe.size.y > 0: inset = safe.position.y * vs.y / win.y
	var y0: float = max(8.0, inset + 4)
	var narrow = W < 640
	tools.position = Vector2(W - 92, y0); tools.size = Vector2(84, 38)
	var dw: float = min(440.0, W - (104.0 if narrow else 150.0) - 64)
	if narrow: dw = W - 104 - 10
	var dh = dw / 4.0
	var ytop = y0 + (44.0 if narrow else 0.0)
	var frame: Panel = top.get_node("dmdw")
	var total = dw + 10 + 10 + 64
	var x = (W - total) / 2.0
	frame.position = Vector2(x, ytop); frame.size = Vector2(dw + 10, dh + 10); dmd_rect.position = Vector2(5, 5); dmd_rect.size = Vector2(dw, dh)
	ig_panel.position = Vector2(x + dw + 20, ytop + (dh + 10 - 64) / 2.0); ig_panel.size = Vector2(64, 64); ig_img.position = Vector2(4, 4); ig_img.size = Vector2(56, 58)
	ig_shield.position = ig_panel.position + Vector2(46, 46)
	top.position = Vector2.ZERO; top.size = Vector2(W, ytop + dh + 16)
	var bgr: ColorRect = top.get_node("bg"); bgr.size = top.size; bgr.position = Vector2.ZERO
	mis.position = Vector2(0, top.size.y - 4); mis.size = Vector2(W, 28)

func set_view_rect(r: Rect2) -> void:
	view_rect = r; view.position = r.position; view.size = r.size

# ---------------- mission pill ----------------
func _build_mis() -> void:
	mis = Control.new(); mis.mouse_filter = Control.MOUSE_FILTER_IGNORE; mis.draw.connect(_draw_mis); root.add_child(mis)

func _draw_mis() -> void:
	var GS: Dictionary = M.GS; var md = M.MODE(); var mo = M.MODES[GS.mode] if GS.mode >= 0 else null; var mi = M.MIS[GS.mi]
	var col = Color("#ffd36e") if GS.finale > 0 else (Color("#c77dff") if GS.multi else (Color("#ffd36e") if mo != null or GS.ready else Color("#ff8a5a")))
	var txt = ""; var frac = 0.0; var ct = ""; var icon = -1
	if GS.finale > 0: txt = "Gran concerto!"; frac = GS.finale / 45.0; ct = "%ds" % ceil(GS.finale)
	elif GS.multi: txt = tt("Polyphony! Hit notes together", "Polifonia! Colpisci le note insieme"); frac = 1.0
	elif mo != null:
		var p = 0.0
		if md == "tune": p = float(GS.tuneI) / GS.tune.n.size()
		elif md == "key":
			var c = 0
			for i in 7: c += 1 if GS.acc[i] == GS.key.a.get(i, 0) else 0
			p = c / 7.0
		else: p = float(GS.mp) / mo.need
		icon = mo.ic; txt = M.L2(mo.N) + (" · " + M.chord_names(mi) if md == "chords" else ""); frac = p; ct = "%ds" % ceil(GS.modeT)
	else:
		var m = M.MODES[GS.sel]
		if GS.ready: txt = tt("%s ready: to the Stage!", "%s pronta: al Palco!") % M.L2(m.N); ct = ""
		else: icon = 10; txt = M.L2(m.N); ct = "%d/3" % GS.flag
		frac = GS.flag / 3.0
	var thi = -1
	if M.THEME != "home": thi = {"carib": 7, "lake": 8, "shroom": 9}[M.THEME]
	var fs = 13
	var tw = F.get_string_size(txt, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x
	var extra = (40.0 if thi >= 0 else 0.0) + (18.0 if icon >= 0 else 0.0)
	var cw = F.get_string_size(ct, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x
	var w = 6 + 18 + 8 + extra + tw + 8 + 70 + 8 + cw + 12
	var W = mis.size.x; var x = (W - w) / 2.0; var h = 26.0
	var sb = StyleBoxFlat.new(); sb.bg_color = Color("#140b22d9"); sb.set_corner_radius_all(13); sb.set_border_width_all(2); sb.border_color = Color(col, 0.67); sb.anti_aliasing = true
	mis.draw_style_box(sb, Rect2(x, 0, w, h))
	mis.draw_circle(Vector2(x + 15, h / 2), 9, col)
	var cx = x + 32
	if thi >= 0:
		mis.draw_texture_rect(em(thi), Rect2(cx, 4, 18, 18), false); _txt(mis, F, "%ds·" % ceil(GS.themeT), Vector2(cx + 19, h / 2), 12, Color("#f3e7d3")); cx += 40
	if icon >= 0: mis.draw_texture_rect(em(icon), Rect2(cx, 5, 16, 16), false); cx += 18
	_txt(mis, F, txt, Vector2(cx, h / 2), fs, col); cx += tw + 8
	_rr(mis, Rect2(cx, h / 2 - 3.5, 70, 7), Color(1, 1, 1, 0.13), 4)
	if frac > 0: _rr(mis, Rect2(cx, h / 2 - 3.5, 70 * clampf(frac, 0, 1), 7), col, 4)
	cx += 78
	_txt(mis, F, ct, Vector2(cx, h / 2), fs, col)

# ---------------- dot-matrix display ----------------
func dmsg(lines: Array, dur := 1.6, fl := false, pri := 1, anim := "") -> void:
	if M.GS.state == "title": return
	if DQ.size() and DQ[0].pri > pri and DQ[0].t < DQ[0].dur * 0.6: return
	DQ.clear(); DQ.append({lines = lines, dur = dur, t = 0.0, flash = fl, pri = pri, anim = anim})

func _dt(s: String, y: float, size: int, align := "center", x := -1.0) -> void:
	var w = FP.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	var px = 0.0
	if align == "center": px = (x if x >= 0 else 64.0) - w / 2.0
	elif align == "left": px = x if x >= 0 else 1.0
	else: px = (x if x >= 0 else 127.0) - w
	dmd_c.draw_string(FP, Vector2(round(px), y + size), s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, Color("#ff8a1e"))
func _fit(s: String, maxw: float) -> int:
	for z in [16, 12, 8]:
		if FP.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, z).x <= maxw: return z
	return 8

func _drummer(t: float, x0: float) -> void:
	var g = dmd_c; var hit = int(floor(t * 8)) % 2; var c = Color("#ff8a1e")
	g.draw_circle(Vector2(x0 + 14, 6), 4, c); g.draw_rect(Rect2(x0 + 12, 10, 5, 9), c)
	g.draw_rect(Rect2(x0 + 4, 19, 22, 2), c); g.draw_rect(Rect2(x0 + 5, 21, 2, 8), c); g.draw_rect(Rect2(x0 + 23, 21, 2, 8), c)
	g.draw_rect(Rect2(x0 - 4, 20, 9, 7), c); g.draw_rect(Rect2(x0 + 26, 18, 8, 6), c)
	g.draw_rect(Rect2(x0 + 30, 7 + (0 if hit else 2), 10, 1.5), c); g.draw_rect(Rect2(x0 + 34, 8, 1, 14), c)
	g.draw_polyline(PackedVector2Array([Vector2(x0 + 12, 12), Vector2(x0 + 5, 15 if hit else 19), Vector2(x0 + (1 if hit else 3), 13 if hit else 20)]), c, 1.5)
	g.draw_polyline(PackedVector2Array([Vector2(x0 + 17, 12), Vector2(x0 + 25, 16 if hit else 11), Vector2(x0 + (29 if hit else 33), 17 if hit else 6)]), c, 1.5)

func _draw_dmd() -> void:
	var GS: Dictionary = M.GS; var m = DQ[0] if DQ.size() else null; var t: float = M.now()
	if m != null and not (m.flash and int(floor(m.t * 8)) % 2 == 1):
		var L: Array = m.lines
		if m.anim == "drum": _drummer(t, 4); _dt(L[0], 2, 8, "center", 86); _dt(L[1], 13, _fit(L[1], 80), "center", 86)
		elif L.size() == 1: var z = _fit(L[0], 126); _dt(L[0], (32 - z) / 2.0, z)
		else: _dt(L[0], 1, 8); var z = _fit(L[1], 126); _dt(L[1], 12, z)
	elif m == null:
		if GS.state == "title" or GS.state == "over":
			var s: String = M.fmt(GS.score if GS.state == "over" else M.best)
			_dt("GAME OVER" if GS.state == "over" else tt("IGOR PINBALL", "FLIPPER IGOR"), 1, 8); _dt(s, 13, _fit(s, 126))
		else:
			var s: String = M.fmt(GS.shown); _dt(s, 2, _fit(s, 126))
			var alt = int(floor(t / 3)) % 3; var mo = M.MODES[GS.mode] if GS.mode >= 0 else null; var ln = ""
			if GS.finale > 0: ln = "GRAN CONCERTO!"
			elif GS.multi: ln = tt("POLYPHONY!", "POLIFONIA!")
			elif alt == 0: ln = "%s %d BONUS %dX" % [tt("BALL", "PALLA"), GS.ball, GS.bx]
			elif alt == 1: ln = ("%s %dS" % [M.L2(mo.N).to_upper().left(10), ceil(GS.modeT)]) if mo != null else (tt("TO THE STAGE!", "AL PALCO!") if GS.ready else "%s %d/3" % [tt("FLAG", "BANDIERA"), GS.flag])
			else: ln = M.L2(M.RANKS[GS.rank]).to_upper().left(16)
			_dt(ln, 23, 8)

# ---------------- bubble, pops, flash, big message, hint, plunger meter ----------------
func _build_misc() -> void:
	pops = Control.new(); pops.set_anchors_preset(Control.PRESET_FULL_RECT); pops.mouse_filter = Control.MOUSE_FILTER_IGNORE; root.add_child(pops)
	flash_r = ColorRect.new(); flash_r.set_anchors_preset(Control.PRESET_FULL_RECT); flash_r.color = Color(1, 1, 1, 0); flash_r.mouse_filter = Control.MOUSE_FILTER_IGNORE; root.add_child(flash_r)
	bub = PanelContainer.new(); var bs = sbox(Color("#fffaf0"), 14, 3, Color("#2b2018"), 12); bub.add_theme_stylebox_override("panel", bs); bub.mouse_filter = Control.MOUSE_FILTER_IGNORE
	bub_l = Label.new(); bub_l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; bub_l.add_theme_color_override("font_color", Color("#2b2018")); bub_l.add_theme_font_override("font", F)
	bub_l.add_theme_font_size_override("font_size", 15); bub_l.custom_minimum_size = Vector2(276, 20); bub.add_child(bub_l); bub.modulate.a = 0; root.add_child(bub)
	hint_p = PanelContainer.new(); hint_p.add_theme_stylebox_override("panel", sbox(Color("#140b22e6"), 16, 2, Color("#9be38a88"), 14)); hint_p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hint_l = Label.new(); hint_l.add_theme_color_override("font_color", Color("#e8ffe0")); hint_p.add_child(hint_l); hint_p.modulate.a = 0; root.add_child(hint_p)
	pm = Control.new(); pm.mouse_filter = Control.MOUSE_FILTER_IGNORE; pm.draw.connect(_draw_pm); root.add_child(pm)
	bigl = Label.new(); bigl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; bigl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	bigl.add_theme_font_override("font", FB); bigl.add_theme_font_size_override("font_size", 64); bigl.add_theme_color_override("font_color", Color("#ffd36e"))
	bigl.add_theme_color_override("font_outline_color", Color("#6b3a12")); bigl.add_theme_constant_override("outline_size", 14); bigl.modulate.a = 0; bigl.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(bigl)

func say(txt: String, dur := 2.6, force := false) -> void:
	if M.GS.state == "title": return
	var t = Time.get_ticks_msec() / 1000.0
	if not force and t < bub_next: return
	bub_next = t + (0.6 if force else 4.5)
	bub_l.text = txt; bub_t = dur
	var W = root.get_viewport_rect().size.x; var w: float = min(300.0, W * 0.7)
	var th: float = F.get_multiline_string_size(txt, HORIZONTAL_ALIGNMENT_LEFT, w - 24, 15).y
	bub_l.custom_minimum_size = Vector2(w - 24, th); bub.size = Vector2(w, th + 18); bub.call_deferred("reset_size")
	bub.position = Vector2(W - w - 12, ig_panel.position.y + 72)
	var tw = create_tween(); tw.tween_property(bub, "modulate:a", 1.0, 0.2)
	var tw2 = create_tween(); tw2.tween_property(ig_panel, "position:y", ig_panel.position.y - 4, 0.17).set_trans(Tween.TRANS_SINE); tw2.tween_property(ig_panel, "position:y", ig_panel.position.y, 0.17)
const LINES := {
	ramp = [["Through the galaxy!", "In giro per la galassia!"], ["What a ramp!", "Che rampa!"], ["Wheee!", "Wiiii!"]],
	drain = [["No problem: here comes another ball!", "Nessun problema: arriva un’altra pallina!"], ["Nice try! Again!", "Bel tentativo! Ancora!"], ["The music goes on!", "La musica continua!"]],
	drum = [["Boom, tsss!", "Bum, tsss!"], ["What a groove!", "Che groove!"], ["Ba-dum-tss!", "Ba-dum-tss!"]]}
func say_line(k: String, f: bool) -> void: say(M.L2(LINES[k].pick_random()), 2.6, f)

func pop(pos: Vector2, txt: String, col: String, big := false) -> void:
	var l = Label.new(); l.text = txt; l.add_theme_font_override("font", FB); l.add_theme_font_size_override("font_size", 26 if big else 15)
	l.add_theme_color_override("font_color", Color(col)); l.add_theme_color_override("font_outline_color", Color(0, 0, 0)); l.add_theme_constant_override("outline_size", 5)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE; pops.add_child(l); l.reset_size()
	var sz = l.size; l.pivot_offset = sz / 2; l.position = pos - sz / 2; l.scale = Vector2(0.6, 0.6); l.modulate.a = 0
	var tw = create_tween().set_parallel(true)
	tw.tween_property(l, "modulate:a", 1.0, 0.15); tw.tween_property(l, "scale", Vector2(1.15, 1.15), 0.15)
	tw.chain().set_parallel(true)
	tw.tween_property(l, "position:y", l.position.y - sz.y * 1.3, 0.85).set_ease(Tween.EASE_OUT); tw.tween_property(l, "modulate:a", 0.0, 0.85); tw.tween_property(l, "scale", Vector2.ONE, 0.85)
	tw.chain().tween_callback(l.queue_free)

func flash(a := 0.6) -> void:
	flash_r.color = Color(1, 1, 1, a * 0.4); var tw = create_tween(); tw.tween_property(flash_r, "color:a", 0.0, 0.5)

func hint(t: String) -> void:
	if t != "": hint_l.text = t
	var tw = create_tween(); tw.tween_property(hint_p, "modulate:a", 1.0 if t != "" else 0.0, 0.3)

func big(t: String) -> void:
	if t == "":
		var tw = create_tween(); tw.tween_property(bigl, "modulate:a", 0.0, 0.25); return
	var vs = root.get_viewport_rect().size
	bigl.text = t; bigl.add_theme_font_size_override("font_size", int(clampf(vs.x * 0.11, 40, 86)))
	bigl.size = Vector2(vs.x, vs.y * 0.4); bigl.position = Vector2(0, vs.y * 0.42 - vs.y * 0.2); bigl.pivot_offset = bigl.size / 2
	if bigl.modulate.a < 0.5:
		bigl.scale = Vector2(0.6, 0.6); var tw = create_tween().set_parallel(true)
		tw.tween_property(bigl, "modulate:a", 1.0, 0.25); tw.tween_property(bigl, "scale", Vector2.ONE, 0.35).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func _draw_pm() -> void:
	var GS: Dictionary = M.GS
	if not (GS.charging and GS.state == "play"): return
	var w = pm.size.x; var h = 14.0
	_rr(pm, Rect2(0, 0, w, h), Color("#140b22e6"), 9)
	var sb = StyleBoxFlat.new(); sb.draw_center = false; sb.set_border_width_all(2); sb.border_color = Color("#ffd36e"); sb.set_corner_radius_all(6); sb.shadow_color = Color("#ffd36e88"); sb.shadow_size = 6
	pm.draw_style_box(sb, Rect2(w * 0.55, -3, w * 0.15, h + 6))
	var gold: bool = GS.plunge >= M.GOLD[0] and GS.plunge <= M.GOLD[1]
	if GS.plunge > 0.02: _rr(pm, Rect2(0, 0, w * GS.plunge, h), Color("#ffd36e") if gold else Color("#9be38a"), 9)
	_txt(pm, FB, "★", Vector2(w * 0.625 - 6, -12), 13, Color("#ffd36e"))

# ---------------- arcade ----------------
func _build_arcade() -> void:
	arc_vp = SubViewport.new(); arc_vp.size = Vector2i(128, 64); arc_vp.transparent_bg = false; arc_vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	arc_vp.canvas_item_default_texture_filter = Viewport.DEFAULT_CANVAS_ITEM_TEXTURE_FILTER_NEAREST
	arc_c = Control.new(); arc_c.size = Vector2(128, 64); arc_vp.add_child(arc_c); arc_c.draw.connect(_draw_arc); add_child(arc_vp)
	arc_box = PanelContainer.new(); var s = sbox(Color("#4f3119"), 16, 3, Color("#8a5a32"), 10); s.shadow_color = Color(0, 0, 0, 0.6); s.shadow_size = 30
	arc_box.add_theme_stylebox_override("panel", s); arc_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var v = VBoxContainer.new(); v.add_theme_constant_override("separation", 6); arc_box.add_child(v)
	arc_title = Label.new(); arc_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; arc_title.add_theme_font_override("font", FP); arc_title.add_theme_font_size_override("font_size", 16)
	arc_title.add_theme_color_override("font_color", Color("#ffd36e")); v.add_child(arc_title)
	arc_rect = TextureRect.new(); arc_rect.texture = arc_vp.get_texture(); arc_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; arc_rect.stretch_mode = TextureRect.STRETCH_SCALE
	arc_rect.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST; var sm = ShaderMaterial.new(); var sh = Shader.new(); sh.code = DMD_SHADER; sm.shader = sh; sm.set_shader_parameter("cells", Vector2(128, 64)); sm.set_shader_parameter("gap", 0.08)
	arc_rect.material = sm; v.add_child(arc_rect)
	arc_how = Label.new(); arc_how.custom_minimum_size = Vector2(300, 20); arc_how.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; arc_how.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; v.add_child(arc_how)
	var k = Label.new(); k.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; k.add_theme_color_override("font_color", Color("#ffd36e")); k.add_theme_font_size_override("font_size", 13)
	k.text = tt("Tap left / right", "Tocca a sinistra / a destra") if touch_ui else tt("← → or Z / M", "← → oppure Z / M"); v.add_child(k)
	arc_box.visible = false; root.add_child(arc_box)

func arc_show(on: bool, title: String, how: String) -> void:
	if on:
		arc_title.text = title; arc_how.text = how
		var vs = root.get_viewport_rect().size; var w: float = min(580.0, vs.x * 0.94)
		var hh: float = F.get_multiline_string_size(how, HORIZONTAL_ALIGNMENT_CENTER, w - 20, 15).y
		arc_rect.custom_minimum_size = Vector2(w - 20, (w - 20) / 2.0); arc_how.custom_minimum_size = Vector2(w - 20, hh)
		var tot: float = 12 + 22 + 6 + (w - 20) / 2.0 + 6 + hh + 6 + 18 + 12
		arc_box.size = Vector2(w, tot)
		arc_box.position = Vector2((vs.x - w) / 2, vs.y * 0.5 - tot / 2); arc_box.pivot_offset = arc_box.size / 2
		arc_box.visible = true; arc_box.scale = Vector2(0.3, 0.3); arc_box.modulate.a = 0
		var tw = create_tween().set_parallel(true); tw.tween_property(arc_box, "scale", Vector2.ONE, 0.45).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT); tw.tween_property(arc_box, "modulate:a", 1.0, 0.3)
	else:
		var tw = create_tween(); tw.tween_property(arc_box, "modulate:a", 0.0, 0.3); tw.tween_callback(func(): arc_box.visible = false)

func _at(s: String, x: float, y: float, size := 8, col := "#ff8a1e", al := "center") -> void:
	var w = FP.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	var px = x - w / 2.0 if al == "center" else (x if al == "left" else x - w)
	arc_c.draw_string(FP, Vector2(round(px), y + size), s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, Color(col))
func _ar(x: float, y: float, w: float, h: float, col: String) -> void: arc_c.draw_rect(Rect2(x, y, w, h), Color(col))
func _pigor(x: float, y: float, open: bool) -> void:
	_ar(x - 6, y - 6, 12, 7, "#9be38a"); _ar(x - 4, y - 8, 8, 2, "#9be38a"); _ar(x + 5, y - 3, 5, 3, "#9be38a")
	_ar(x - 3, y - 5, 3, 3, "#ffffff"); _ar(x + 1, y - 5, 3, 3, "#ffffff"); _ar(x - 2, y - 4, 1, 2, "#000000"); _ar(x + 2, y - 4, 1, 2, "#000000")
	if open: _ar(x + 9, y - 2, 3, 1, "#ff5a8a")
func _pant(x: float, y: float) -> void:
	_ar(x - 2, y - 1, 2, 2, "#fbf7ea"); _ar(x, y - 1, 2, 2, "#fbf7ea"); _ar(x + 2, y - 1, 2, 2, "#fbf7ea")
	_ar(x - 1, y + 1, 1, 1, "#bdb7a6"); _ar(x + 1, y + 1, 1, 1, "#bdb7a6"); _ar(x + 3, y + 1, 1, 1, "#bdb7a6")

func _draw_arc() -> void:
	var A: Dictionary = M.ARC
	if not A.on: return
	_ar(0, 0, 128, 64, "#120802")
	if A.phase == "intro": _at(M.L2(M.ARC_GAMES[A.key].N), 64, 14, 16, "#ffd36e"); _at(tt("GET READY", "PRONTI"), 64, 40)
	elif A.phase == "play":
		var G: Dictionary = A.G
		if A.key == "gnam":
			_ar(0, 0, 128, 64, "#14304a")
			for i in 14: _ar(i * 10, 58, 9, 6, "#2a5a2a")
			for a in G.ants: _pant(a.x, a.y)
			_pigor(G.x, 57, G.open > 0); _at("%d/15" % G.caught, 2, 1, 8, "#ffd36e", "left"); _at("GNAM!", 126, 1, 8, "#9be38a", "right")
		else:
			_ar(0, 0, 128, 64, "#1a0d22")
			for s in [-1, 1]:
				var lx = 40 if s < 0 else 88
				_ar(lx - 9, 0, 18, 64, "#3a2030"); _ar(lx - 10, 50, 20, 3, "#ffd36e" if G.flash[s] > 0 else "#ff8a1e"); _ar(lx - 8, 54, 16, 8, "#ffffff" if G.flash[s] > 0 else "#7a4a2a")
			for n in G.notes:
				if n.done == "ok": continue
				var y: float = 50 - (n.t - G.t) * 40
				if y < -4 or y > 64: continue
				_ar((40 if n.s < 0 else 88) - 6, y - 2, 12, 4, "#553333" if n.done == "miss" else ("#ff5a5a" if n.s < 0 else "#4fd1e8"))
			_at("%d/%d" % [G.hit, G.notes.size()], 2, 1, 8, "#ffd36e", "left")
			if G.msgT > 0: _at(G.msg, 64, 24, 8, "#ffffff")
	elif A.phase == "result":
		var r: Dictionary = A.res
		_at(tt("PERFECT!", "PERFETTO!") if r.perfect else tt("WELL DONE!", "BRAVO!"), 64, 10, 16, "#ffd36e"); _at(r.line, 64, 34, 12)
		if r.score: _at("+" + M.fmt(r.score * M.GS.loop), 64, 50, 8, "#9be38a")

# ---------------- screens ----------------
func _btn(text: String, cb: Callable, alt := false) -> Button:
	var b = Button.new(); b.text = text; b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_override("font", FB); b.add_theme_font_size_override("font_size", 16 if alt else 20)
	var c = Color("#2d2148") if alt else Color("#8fe07a")
	var s = sbox(c, 16, 3, Color("#6e5a8a") if alt else Color("#1b1030"), 22)
	if not alt: s.shadow_color = Color("#1b1030"); s.shadow_offset = Vector2(0, 4); s.shadow_size = 1
	for st in ["normal", "hover", "focus"]: b.add_theme_stylebox_override(st, s)
	var sp = s.duplicate(); sp.bg_color = c.darkened(0.15); b.add_theme_stylebox_override("pressed", sp)
	b.add_theme_color_override("font_color", Color("#f3e7d3") if alt else Color("#1b1030")); b.add_theme_color_override("font_pressed_color", Color("#1b1030") if not alt else Color.WHITE)
	b.add_theme_color_override("font_hover_color", Color("#f3e7d3") if alt else Color("#1b1030"))
	b.pressed.connect(cb); return b

func _card(name: String) -> VBoxContainer:
	var c = CenterContainer.new(); c.set_anchors_preset(Control.PRESET_FULL_RECT); c.visible = false; scr.add_child(c); cards[name] = c
	var p = PanelContainer.new(); var s = sbox(Color("#191030"), 22, 2, Color("#4a3463"), 18); s.shadow_color = Color("#8b5cf633"); s.shadow_size = 30
	p.add_theme_stylebox_override("panel", s); p.custom_minimum_size = Vector2(min(420.0, root.get_viewport_rect().size.x * 0.92), 0); c.add_child(p)
	var v = VBoxContainer.new(); v.alignment = BoxContainer.ALIGNMENT_CENTER; v.add_theme_constant_override("separation", 8); p.add_child(v)
	return v
func _lab(v: Control, t: String, size := 15, col := Color("#f3e7d3"), font: Font = null, wrap := true) -> Label:
	var l = Label.new(); l.text = t; l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; l.add_theme_font_size_override("font_size", size); l.add_theme_color_override("font_color", col)
	if font: l.add_theme_font_override("font", font)
	if wrap: l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	v.add_child(l); return l

func _build_screens() -> void:
	scr = Control.new(); scr.set_anchors_preset(Control.PRESET_FULL_RECT); root.add_child(scr)
	var dim = ColorRect.new(); dim.color = Color("#05030dcc"); dim.set_anchors_preset(Control.PRESET_FULL_RECT); scr.add_child(dim)
	# title
	var v = _card("title")
	var im = TextureRect.new(); im.texture = load("res://assets/img/igor.webp"); im.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; im.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	im.custom_minimum_size = Vector2(110, 110); v.add_child(im)
	_lab(v, tt("Igor’s Music Pinball", "Il Flipper Musicale di Igor"), 30, Color("#9be38a"), FB)
	_lab(v, tt("Seven note lanes, chords to build, a drum kit and a tofu ant.", "Sette corsie-nota, accordi da costruire, una batteria e una formica di tofu."), 14, Color("#b9a8d6"))
	var pills = [tt("Tap left / right: the flippers", "Tocca a sinistra / a destra: i flipper"), tt("Hold right, let go: launch the ball", "Tieni premuto a destra e lascia: lanci la pallina")] if touch_ui else [tt("← → (or Z and M): the flippers", "← → (oppure Z e M): i flipper"), tt("Hold Space, let go: launch the ball", "Tieni premuto Spazio e lascia: lanci la pallina")]
	pills.append(tt("Light the notes in the top lanes to build the chord, then the ramp: jackpot!", "Accendi le note nelle corsie in alto per fare l’accordo, poi la rampa: jackpot!"))
	for p in pills:
		var pc = PanelContainer.new(); pc.add_theme_stylebox_override("panel", sbox(Color(1, 1, 1, 0.06), 12, 0, Color.TRANSPARENT, 10)); v.add_child(pc)
		var l = Label.new(); l.text = p; l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; l.add_theme_font_size_override("font_size", 14); pc.add_child(l)
	var row = CenterContainer.new(); v.add_child(row); row.add_child(_btn(tt("▶ Play", "▶ Gioca"), M.start_game))
	best_l = _lab(v, "", 14, Color("#ffd36e"))
	var site = _btn("igortime.com", func(): OS.shell_open("https://igortime.com"), true); var r2 = CenterContainer.new(); r2.add_child(site); v.add_child(r2)
	# pause
	v = _card("pause")
	_lab(v, tt("Pause", "Pausa"), 30, Color("#9be38a"), FB); _lab(v, tt("Igor is waiting for you.", "Igor ti aspetta."), 14, Color("#b9a8d6"))
	var r3 = CenterContainer.new(); v.add_child(r3); r3.add_child(_btn(tt("▶ Go on", "▶ Continua"), func(): M.toggle_pause(false)))
	# game over
	v = _card("over")
	var im2 = TextureRect.new(); im2.texture = im.texture; im2.expand_mode = TextureRect.EXPAND_IGNORE_SIZE; im2.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED; im2.custom_minimum_size = Vector2(90, 90); v.add_child(im2)
	over_title = _lab(v, "", 30, Color("#9be38a"), FB); over_score = _lab(v, "", 38, Color("#ffd36e"), FB); over_sub = _lab(v, "", 14, Color("#b9a8d6"))
	var r4 = CenterContainer.new(); v.add_child(r4); r4.add_child(_btn(tt("Again!", "Ancora!"), M.start_game))

func show_screen(name: String) -> void:
	scr.visible = name != ""
	for k in cards: cards[k].visible = k == name
	if name == "title": best_l.text = (tt("Record", "Record") + ": " + M.fmt(M.best)) if M.best else ""

func show_over(rec: bool) -> void:
	over_title.text = tt("New record!", "Nuovo record!") if rec else tt("What a concert!", "Che concerto!")
	over_score.text = M.fmt(M.GS.score)
	over_sub.text = "%s: %s · %s: %d" % [tt("Record", "Record"), M.fmt(M.best), tt("chords", "accordi"), M.GS.mi + (M.GS.loop - 1) * 7]
	show_screen("over")

# ---------------- per frame ----------------
func frame(dt: float, t: float) -> void:
	_layout()
	if DQ.size():
		DQ[0].t += dt
		if DQ[0].t > DQ[0].dur: DQ.pop_front()
	dmd_t += dt
	if dmd_t > 1.0 / 30: dmd_t = 0; dmd_c.queue_redraw()
	ap_t += dt
	if ap_t > (0.2 if OS.has_feature("mobile") else 0.12):
		ap_t = 0; ap_c.queue_redraw(); ap_vp.render_target_update_mode = SubViewport.UPDATE_ONCE
	mis_t += dt
	if mis_t > 0.25: mis_t = 0; mis.queue_redraw()
	if M.ARC.on: arc_c.queue_redraw()
	if bub_t > 0:
		bub_t -= dt
		if bub_t <= 0: var tw = create_tween(); tw.tween_property(bub, "modulate:a", 0.0, 0.2)
	ig_img.texture = M.CHAR["igor%d" % igor_frame]
	var save: bool = M.GS.save > 0 and M.GS.state == "play"
	ig_shield.visible = save
	var isb: StyleBoxFlat = ig_panel.get_theme_stylebox("panel")
	isb.border_color = Color("#9be38a") if save else Color("#9be38a88"); isb.shadow_color = Color(0.61, 0.89, 0.54, 0.5 + 0.3 * sin(t * 6)) if save else Color(0, 0, 0, 0); isb.shadow_size = 10 if save else 0
	var vs = root.get_viewport_rect().size
	var pw: float = min(260.0, vs.x * 0.6)
	pm.position = Vector2((vs.x - pw) / 2, vs.y - 74); pm.size = Vector2(pw, 14); pm.queue_redraw()
	hint_p.reset_size(); hint_p.position = Vector2((vs.x - hint_p.size.x) / 2, vs.y - hint_p.size.y - 16)

# ---------------- input ----------------
var PT = {}
func _input(ev: InputEvent) -> void:
	if ev is InputEventKey:
		touch_ui = false
		var k: int = ev.physical_keycode
		if ev.echo: return
		var L = [KEY_LEFT, KEY_Z, KEY_A, KEY_SHIFT]; var Rk = [KEY_RIGHT, KEY_M, KEY_L, KEY_SLASH]; var Pk = [KEY_SPACE, KEY_DOWN, KEY_ENTER, KEY_S]
		if ev.pressed:
			if M.GS.state == "title" and (k == KEY_SPACE or k == KEY_ENTER): M.start_game(); return
			if M.GS.state == "over" and k == KEY_ENTER: M.start_game(); return
			if k == KEY_P or k == KEY_ESCAPE: M.toggle_pause(); return
		if scr.visible: return
		if L.has(k): M.flip(-1, ev.pressed)
		if Rk.has(k): M.flip(1, ev.pressed)
		if Pk.has(k): M.charge(ev.pressed)
		return
	if not (ev is InputEventScreenTouch): return
	if scr.visible: return
	var W = root.get_viewport_rect().size.x
	if ev.pressed:
		if M.GS.state != "play" and not M.ARC.on: return
		if ev.position.y < top.size.y and ev.position.x > W - 100: return   # tool buttons
		var right: bool = ev.position.x > W / 2
		var role = "R" if right else "L"
		var manual_lane = M._lane_ball(true)
		var playing = false
		for b in M.BALLS: playing = playing or b.mode == "play"
		if right and manual_lane != null and not playing and not M.ARC.on: role = "P"; M.charge(true)
		else: M.flip(1 if right else -1, true)
		PT[ev.index] = role
	else:
		if not PT.has(ev.index): return
		var r: String = PT[ev.index]; PT.erase(ev.index)
		if r == "P": M.charge(false)
		elif not PT.values().has(r): M.flip(1 if r == "R" else -1, false)
