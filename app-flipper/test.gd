extends Node
## test driver: --  shot  → plays automatically and saves screenshots to /tmp/gshot_N.png
var M
var t := 0.0
var shots := [2.0, 6.2, 9.0, 16.0, 22.0]
var n := 0
var started := false
var did := false
var scn := ""
func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("scn="): scn = a.substr(4)
func _process(dt: float) -> void:
	t += dt
	if t > 0.8 and not started:
		started = true; M.start_game()
	if started and M.GS.state == "play":
		var lane = M._lane_ball(true)
		if lane != null and not M.GS.charging and t > 1.5: M.charge(true); get_tree().create_timer(0.62).timeout.connect(func(): M.charge(false))
		var l := false; var r := false
		for b in M.BALLS:
			if b.mode == "play" and b.y < 3.4 and b.y > 1.2 and b.vy < 0:
				if b.x < 0: l = true
				else: r = true
		M.flip(-1, l); M.flip(1, r)
	if started and not did and t > 3.0:
		did = true
		match scn:
			"arc": M.GS.mode = 0; M.complete_mode()
			"carib": M.set_theme("carib")
			"shroom": M.set_theme("shroom")
			"chords": M.start_mode(0)
			"ff": M.start_mode(2)
			"poly": M.start_poly()
			"lake": M.set_theme("lake")
	if n < shots.size() and t > shots[n]:
		get_viewport().get_texture().get_image().save_png("/tmp/gshot_%d.png" % n)
		print("shot ", n, " fps ", Engine.get_frames_per_second(), " score ", M.GS.score, " balls ", M.BALLS.size(), " state ", M.GS.state)
		n += 1
		if n >= shots.size(): get_tree().quit()
