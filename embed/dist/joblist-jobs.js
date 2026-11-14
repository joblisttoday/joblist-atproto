//#region node_modules/svelte/src/constants.js
var e = {}, t = Symbol("uninitialized"), n = "http://www.w3.org/1999/xhtml", r = Array.isArray, i = Array.prototype.indexOf, a = Array.prototype.includes, o = Array.from, s = Object.defineProperty, c = Object.getOwnPropertyDescriptor, l = Object.getOwnPropertyDescriptors, u = Object.prototype, d = Array.prototype, f = Object.getPrototypeOf, p = Object.isExtensible, m = () => {};
function h(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function g() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var _ = 1024, v = 2048, y = 4096, b = 8192, x = 16384, S = 32768, ee = 1 << 25, C = 65536, te = 1 << 19, ne = 1 << 20, re = 1 << 25, ie = 1 << 21, ae = 1 << 22, oe = 1 << 23, se = Symbol("$state"), ce = Symbol("component"), le = Symbol("legacy props"), ue = Symbol(""), de = Symbol("attributes"), fe = Symbol("class"), pe = Symbol("style"), me = Symbol("text"), he = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), ge = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function _e() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function ve(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function ye() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var w = !1;
function be(e) {
	w = e;
}
var T;
function E(t) {
	if (t === null) throw ve(), e;
	return T = t;
}
function xe() {
	return E(/* @__PURE__ */ L(T));
}
function Se(t) {
	if (w) {
		if (/* @__PURE__ */ L(T) !== null) throw ve(), e;
		T = t;
	}
}
function Ce(e = 1) {
	if (w) {
		for (var t = e, n = T; t--;) n = /* @__PURE__ */ L(n);
		T = n;
	}
}
function we(e = !0) {
	for (var t = 0, n = T;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ L(n);
		e && n.remove(), n = i;
	}
}
function Te(t) {
	if (!t || t.nodeType !== 8) throw ve(), e;
	return t.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Ee(e) {
	return e === this.v;
}
function De(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Oe(e) {
	return !De(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function ke() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function Ae(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function je(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function Me() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ne(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function Pe() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Fe(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function Ie() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Le() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Re() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ze() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var D = null;
function Be(e) {
	D = e;
}
function Ve(e, t = !1, n) {
	D = {
		p: D,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: K,
		l: null
	};
}
function He(e) {
	var t = D, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) rn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, D = t.p, Ue(e);
}
function Ue(e = {}) {
	return s(e, ce, { value: !0 }), e;
}
function We() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ge = [];
function Ke() {
	var e = Ge;
	Ge = [], h(e);
}
function O(e) {
	if (Ge.length === 0 && !mt) {
		var t = Ge;
		queueMicrotask(() => {
			t === Ge && Ke();
		});
	}
	Ge.push(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var qe = ~(v | y | _);
function k(e, t) {
	e.f = e.f & qe | t;
}
function Je(e) {
	e.f & 512 || e.deps === null ? k(e, _) : k(e, y);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Ye(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), k(e, _);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Xe(e) {
	var t = U, n = K;
	G(null), q(null);
	try {
		return e();
	} finally {
		G(t), q(n);
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function Ze(e, t, n, r) {
	let i = We() ? tt : at;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = K, c = Qe(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				R(e, s);
			}
			$e();
		}
	}
	var d = et();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ rt(e))).then(u).catch((e) => R(e, s)).finally(d);
	}
	l ? l.then(() => {
		s.f & 16384 ? d() : (c(), f(), $e());
	}) : f();
}
function Qe() {
	var e = K, t = U, n = D, r = A;
	return function(i = !0) {
		q(e), G(t), Be(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function $e(e = !0) {
	q(null), G(null), Be(null), e && A?.deactivate();
}
function et() {
	var e = K, t = e.b, n = A, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function tt(e) {
	var n = 2 | v;
	return K !== null && (K.f |= te), {
		ctx: D,
		deps: null,
		effects: null,
		equals: Ee,
		f: n,
		fn: e,
		reactions: null,
		rv: 0,
		v: t,
		wv: 0,
		parent: K,
		ac: null
	};
}
var nt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function rt(e, n, r) {
	let i = K;
	i === null && ke();
	var a = void 0, o = Ot(t), s = !U, c = /* @__PURE__ */ new Set();
	return sn(() => {
		var t = K, n = g();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== he && n.reject(e);
			}).finally($e);
		} catch (e) {
			n.reject(e), $e();
		}
		var r = A;
		if (s) {
			if (t.f & 32768) var l = et();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(nt);
			else for (let e of c.values()) e.reject(nt);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== nt && (r.activate(), t ? (o.f |= oe, Mt(o, t)) : (o.f & 8388608 && (o.f ^= oe), Mt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), tn(() => {
		for (let e of c) e.reject(nt);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === a ? e(o) : t(a);
			}
			n.then(r, r);
		}
		t(a);
	});
}
/*#__NO_SIDE_EFFECTS__*/
function it(e) {
	let t = /* @__PURE__ */ tt(e);
	return Cn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function at(e) {
	let t = /* @__PURE__ */ tt(e);
	return t.equals = Oe, t;
}
function ot(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) V(t[n]);
	}
}
function st(e) {
	var n, r = K, i = e.parent;
	if (!H && i !== null && e.v !== t && i.f & 24576) return _e(), e.v;
	q(i);
	try {
		ot(e), n = Mn(e);
	} finally {
		q(r);
	}
	return n;
}
function ct(e) {
	var t = st(e);
	!e.equals(t) && (e.wv = kn(), (!A?.is_fork || e.deps === null) && (A === null ? e.v = t : (A.capture(e, t, !0), ft?.capture(e, t, !0)), e.deps === null)) ? k(e, _) : H || (j === null ? Je(e) : (en() || A?.is_fork) && j.set(e, t));
}
function lt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Xe(() => {
		t.ac.abort(he), t.ac = null;
	}), t.fn !== null && (t.teardown = m), Fn(t, 0), fn(t));
}
function ut(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && In(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var dt = null, A = null, ft = null, j = null, pt = null, mt = !1, ht = !1, gt = null, _t = null, vt = 0, yt = 1, bt = class e {
	id = yt++;
	#e = !1;
	linked = !0;
	#t = null;
	#n = null;
	async_deriveds = /* @__PURE__ */ new Map();
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = /* @__PURE__ */ new Set();
	#a = 0;
	#o = /* @__PURE__ */ new Map();
	#s = null;
	#c = [];
	#l = [];
	#u = /* @__PURE__ */ new Set();
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Map();
	#p = /* @__PURE__ */ new Set();
	is_fork = !1;
	#m = !1;
	constructor() {
		dt === null ? dt = this : (dt.#n = this, this.#t = dt), dt = this;
	}
	#h() {
		if (this.is_fork) return !0;
		for (let n of this.#o.keys()) {
			for (var e = n, t = !1; e.parent !== null;) {
				if (this.#f.has(e)) {
					t = !0;
					break;
				}
				e = e.parent;
			}
			if (!t) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#f.has(e) || this.#f.set(e, {
			d: [],
			m: []
		}), this.#p.delete(e);
	}
	unskip_effect(e, t = (e) => this.schedule(e)) {
		var n = this.#f.get(e);
		if (n) {
			this.#f.delete(e);
			for (var r of n.d) k(r, v), t(r);
			for (r of n.m) k(r, y), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		var e = [];
		for (let i of this.#c) if (!(i.f & 16384 || !(i.f & 6144))) {
			for (var t = i, n = !1; t.parent !== null;) {
				t = t.parent;
				var r = t.f;
				if (r & 96) {
					if (!(r & 1024)) {
						n = !0;
						break;
					}
					t.f ^= _;
				}
			}
			n || e.push(t);
		}
		return this.#c = [], e;
	}
	#_() {
		this.#e = !0;
		for (let e of this.#u) this.#d.delete(e), k(e, v), this.schedule(e);
		for (let e of this.#d) k(e, y), this.schedule(e);
		this.apply();
		for (var t = gt = [], n = [], r = _t = []; this.#c.length > 0;) {
			vt++ > 1e3 && (this.#S(), xt());
			for (let e of this.#g()) try {
				this.#v(e, t, n);
			} catch (t) {
				throw Tt(e), this.#h() || this.discard(), t;
			}
		}
		if (A = null, r.length > 0) {
			var i = e.ensure();
			for (let e of r) i.schedule(e);
		}
		if (gt = null, _t = null, this.#h()) {
			this.#x(n), this.#x(t);
			for (let [e, t] of this.#f) wt(e, t);
			r.length > 0 && A.#_();
			return;
		}
		let a = this.#y();
		if (a) this.#x(n), this.#x(t), a.#b(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), ft = this, St(n), St(t), ft = null, this.#s?.resolve();
			var o = A;
			if (this.#a === 0 && (this.#c.length === 0 || o !== null) && this.#S(), this.#c.length > 0) {
				if (o !== null) {
					for (let e of this.#c) o.#c.push(e);
					this.#c = [];
				} else o = this;
			}
			o !== null && (N.clear(), o.#_());
		}
	}
	#v(e, t, n) {
		e.f ^= _;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= _ : i & 4 ? t.push(r) : An(r) && (i & 16 && this.#d.add(r), In(r));
				var o = r.first;
				if (o !== null) {
					r = o;
					continue;
				}
			}
			for (; r !== null;) {
				var s = r.next;
				if (s !== null) {
					r = s;
					break;
				}
				r = r.parent;
			}
		}
	}
	#y() {
		for (var e = this.#t; e !== null;) {
			if (!e.is_fork) {
				for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
			}
			e = e.#t;
		}
		return null;
	}
	#b(e) {
		for (let [t, n] of e.current) !this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n);
		for (let [t, n] of e.async_deriveds) {
			let e = this.async_deriveds.get(t);
			e && n.promise.then(e.resolve).catch(e.reject);
		}
		e.async_deriveds.clear(), this.transfer_effects(e.#u, e.#d);
		let t = (e) => {
			var n = e.reactions;
			if (n !== null && !(e.f & 2 && !(e.f & 6144))) for (let e of n) {
				var r = e.f;
				if (r & 2) t(e);
				else {
					var i = e;
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), k(i, v), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#S(), A = this, this.#_();
	}
	#x(e) {
		for (var t = 0; t < e.length; t += 1) Ye(e[t], this.#u, this.#d);
	}
	capture(e, n, r = !1) {
		e.v !== t && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [n, r]), j?.set(e, n)), this.is_fork || (e.v = n);
	}
	activate() {
		A = this;
	}
	deactivate() {
		A = null, j = null;
	}
	flush() {
		try {
			ht = !0, A = this, this.#_();
		} finally {
			vt = 0, pt = null, gt = null, _t = null, ht = !1, A = null, j = null, N.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(nt);
		this.#S(), this.#s?.resolve();
	}
	register_created_effect(e) {
		this.#l.push(e);
	}
	increment(e, t) {
		if (this.#a += 1, e) {
			let e = this.#o.get(t) ?? 0;
			this.#o.set(t, e + 1);
		}
	}
	decrement(e, t) {
		if (--this.#a, e) {
			let e = this.#o.get(t) ?? 0;
			e === 1 ? this.#o.delete(t) : this.#o.set(t, e - 1);
		}
		this.#m || (this.#m = !0, O(() => {
			this.#m = !1, this.linked && this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#u.add(t);
		for (let e of t) this.#d.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#r.add(e);
	}
	ondiscard(e) {
		this.#i.add(e);
	}
	settled() {
		return (this.#s ??= g()).promise;
	}
	static ensure() {
		if (A === null) {
			let t = A = new e();
			!ht && O(() => {
				t.#e || t.flush();
			});
		}
		return A;
	}
	apply() {
		j = null;
	}
	schedule(e) {
		pt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768) ? e.b.defer_effect(e) : this.#c.push(e);
	}
	#S() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? dt = e : t.#t = e, this.linked = !1;
		}
	}
};
function xt() {
	try {
		Pe();
	} catch (e) {
		R(e, pt);
	}
}
var M = null;
function St(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && An(r) && (M = /* @__PURE__ */ new Set(), In(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && hn(r), M?.size > 0)) {
				N.clear();
				for (let e of M) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) M.has(n) && (M.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || In(n);
					}
				}
				M.clear();
			}
		}
		M = null;
	}
}
function Ct(e) {
	A.schedule(e);
}
function wt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), k(e, _);
		for (var n = e.first; n !== null;) wt(n, t), n = n.next;
	}
}
function Tt(e) {
	k(e, _);
	for (var t = e.first; t !== null;) Tt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Et = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Map(), Dt = !1;
function Ot(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Ee,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function P(e, t) {
	let n = Ot(e, t);
	return Cn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function kt(e, t = !1, n = !0) {
	let r = Ot(e);
	return t || (r.equals = Oe), r;
}
function F(e, t, n = !1) {
	return U !== null && (!W || U.f & 131072) && We() && U.f & 4325394 && (J === null || !J.has(e)) && Re(), Mt(e, n ? It(t) : t, _t);
}
var At = null, jt = 0;
function Mt(e, t, n = null) {
	if (!e.equals(t)) {
		H ? N.set(e, t) : N.has(e) || N.set(e, e.v);
		var r = bt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && st(t), j === null && Je(t);
		}
		e.wv = kn(), At = null, jt = 0, Ft(e, v, n), At = null, We() && K !== null && K.f & 1024 && !(K.f & 96) && (Z === null ? wn([e]) : Z.push(e)), !r.is_fork && Et.size > 0 && !Dt && Nt();
	}
	return t;
}
function Nt() {
	Dt = !1;
	for (let e of Et) {
		e.f & 1024 && k(e, y);
		let t;
		try {
			t = An(e);
		} catch {
			t = !0;
		}
		t && In(e);
	}
	Et.clear();
}
function Pt(e) {
	F(e, e.v + 1);
}
function Ft(e, t, n) {
	var r = e.reactions;
	if (r !== null) {
		var i = We(), a = r.length;
		if (jt += a, jt > 1e5 && At === null && (At = /* @__PURE__ */ new Set()), At !== null) {
			if (At.has(e)) return;
			At.add(e);
		}
		for (var o = 0; o < a; o++) {
			var s = r[o], c = s.f;
			if (i || s !== K) {
				var l = (c & v) === 0;
				if (l && k(s, t), c & 131072) Et.add(s);
				else if (c & 2) {
					var u = s;
					j?.delete(u), Ft(u, y, n);
				} else if (l) {
					var d = s;
					c & 16 && M !== null && M.add(d), n === null ? Ct(d) : n.push(d);
				}
			}
		}
	}
}
function It(e) {
	if (typeof e != "object" || !e || se in e || ce in e) return e;
	let n = f(e);
	if (n !== u && n !== d) return e;
	var i = /* @__PURE__ */ new Map(), a = r(e), o = /* @__PURE__ */ P(0), s = null, l = Dn, p = (e) => {
		if (Dn === l) return e();
		var t = U, n = Dn;
		G(null), On(l);
		var r = e();
		return G(t), On(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ P(e.length, s)), new Proxy(e, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && Ie();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ P(n.value, s);
				return i.set(t, e), e;
			}) : F(r, n.value, !0), !0;
		},
		deleteProperty(e, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in e) {
					let e = p(() => /* @__PURE__ */ P(t, s));
					i.set(n, e), Pt(o);
				}
			} else F(r, t), Pt(o);
			return !0;
		},
		get(n, r, a) {
			if (r === se) return e;
			var o = i.get(r), l = r in n;
			if (o === void 0 && (!l || c(n, r)?.writable) && (o = p(() => /* @__PURE__ */ P(It(l ? n[r] : t), s)), i.set(r, o)), o !== void 0) {
				var u = Q(o);
				return u === t ? void 0 : u;
			}
			return Reflect.get(n, r, a);
		},
		getOwnPropertyDescriptor(e, n) {
			this.has?.(e, n);
			var r = Reflect.getOwnPropertyDescriptor(e, n), a = i.get(n);
			if (a !== void 0) {
				var o = Q(a);
				if (o === t) return;
				if (r && "value" in r) r.value = o;
				else return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return r;
		},
		has(e, n) {
			if (n === se) return !0;
			var r = i.get(n), a = r !== void 0 && r.v !== t || Reflect.has(e, n);
			return (r !== void 0 || K !== null && (!a || c(e, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ P(a ? It(e[n]) : t, s)), i.set(n, r)), Q(r) === t) ? !1 : a;
		},
		set(e, n, r, l) {
			var u = i.get(n), d = n in e;
			if (a && n === "length") for (var f = r; f < u.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in e && (m = p(() => /* @__PURE__ */ P(t, s)), i.set(f + "", m)) : F(m, t);
			}
			if (u === void 0) (!d || c(e, n)?.writable) && (u = p(() => /* @__PURE__ */ P(void 0, s)), F(u, It(r)), i.set(n, u));
			else {
				d = u.v !== t;
				var h = p(() => It(r));
				F(u, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(l, r), !d) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && F(_, v + 1);
				}
				Pt(o);
			}
			return !0;
		},
		ownKeys(e) {
			Q(o);
			var n = Reflect.ownKeys(e).filter((e) => {
				var n = i.get(e);
				return n === void 0 || n.v !== t;
			});
			for (var [r, a] of i) a.v !== t && !(r in e) && n.push(r);
			return n;
		},
		setPrototypeOf() {
			Le();
		}
	});
}
var Lt, Rt, zt, Bt;
function Vt() {
	if (Lt === void 0) {
		Lt = window, Rt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		zt = c(t, "firstChild").get, Bt = c(t, "nextSibling").get, p(e) && (e[fe] = void 0, e[de] = null, e[pe] = void 0, e.__e = void 0), p(n) && (n[me] = void 0);
	}
}
function I(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Ht(e) {
	return zt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function L(e) {
	return Bt.call(e);
}
function Ut(e, t) {
	if (!w) return /* @__PURE__ */ Ht(e);
	var n = /* @__PURE__ */ Ht(T);
	if (n === null) n = T.appendChild(I());
	else if (t && n.nodeType !== 3) {
		var r = I();
		return n?.before(r), E(r), r;
	}
	return t && Xt(n), E(n), n;
}
function Wt(e, t = !1) {
	if (!w) {
		var n = /* @__PURE__ */ Ht(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ L(n) : n;
	}
	if (t) {
		if (T?.nodeType !== 3) {
			var r = I();
			return T?.before(r), E(r), r;
		}
		Xt(T);
	}
	return T;
}
function Gt(e, t = !1) {
	if (!w) return /* @__PURE__ */ Ht(e);
	var n = Ut(e, t);
	return Se(e), n;
}
function Kt(e, t = 1, n = !1) {
	let r = w ? T : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ L(r);
	if (!w) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = I();
			return r === null ? i?.after(a) : r.before(a), E(a), a;
		}
		Xt(r);
	}
	return E(r), r;
}
function qt(e) {
	e.textContent = "";
}
function Jt() {
	return !1;
}
function Yt(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function Xt(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
function Zt(e) {
	var t = K;
	if (t === null) return U.f |= oe, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	R(e, t);
}
function R(t, n) {
	if (t === e) throw t;
	if (!(n !== null && n.f & 16384)) {
		for (; n !== null;) {
			if (n.f & 128 && !(n.f & 33570816)) {
				if (!(n.f & 32768)) throw t;
				try {
					n.b.error(t);
					return;
				} catch (e) {
					t = e;
				}
			}
			n = n.parent;
		}
		throw t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function Qt(e) {
	K === null && (U === null && Ne(e), Me()), H && je(e);
}
function $t(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function z(e, t) {
	var n = K;
	n !== null && n.f & 8192 && (e |= b);
	var r = {
		ctx: D,
		deps: null,
		nodes: null,
		f: e | v | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	A?.register_created_effect(r);
	var i = r;
	if (e & 4) gt === null ? bt.ensure().schedule(r) : gt.push(r);
	else if (t !== null) {
		try {
			In(r);
		} catch (e) {
			throw V(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= C));
	}
	if (i !== null && (i.parent = n, n !== null && $t(i, n), U !== null && U.f & 2 && !(e & 64))) {
		var a = U;
		(a.effects ??= []).push(i);
	}
	return r;
}
function en() {
	return U !== null && !W;
}
function tn(e) {
	let t = z(8, null);
	return k(t, _), t.teardown = e, t;
}
function nn(e) {
	Qt("$effect");
	var t = K.f;
	if (!U && t & 32 && D !== null && !D.i) {
		var n = D;
		(n.e ??= []).push(e);
	} else return rn(e);
}
function rn(e) {
	return z(4 | ne, e);
}
function an(e) {
	bt.ensure();
	let t = z(64 | te, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? gn(t, () => {
			V(t), n(void 0);
		}) : (V(t), n(void 0));
	});
}
function on(e) {
	return z(4, e);
}
function sn(e) {
	return z(ae | te, e);
}
function cn(e, t = 0) {
	return z(8 | t, e);
}
function ln(e, t = [], n = [], r = []) {
	Ze(r, t, n, (t) => {
		z(8, () => {
			e(...t.map(Q));
		});
	});
}
function un(e, t = 0) {
	return z(16 | t, e);
}
function B(e) {
	return z(32 | te, e);
}
function dn(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = H, r = U;
		Sn(!0), G(null);
		try {
			t.call(null);
		} catch (t) {
			R(t, e.parent);
		} finally {
			Sn(n), G(r);
		}
	}
}
function fn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Xe(() => {
			e.abort(he);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : V(n, t), n = r;
	}
}
function pn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || V(t), t = n;
	}
}
function V(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (mn(e.nodes.start, e.nodes.end), n = !0), e.f |= ee, fn(e, t && !n), Fn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	dn(e), e.f ^= ee, e.f |= x;
	var i = e.parent;
	i !== null && i.first !== null && hn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function mn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ L(e);
		e.remove(), e = n;
	}
}
function hn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function gn(e, t, n = !0) {
	var r = [];
	e.f |= 256, _n(e, r, !0);
	var i = () => {
		n && V(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function _n(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= b;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				_n(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function vn(e) {
	e.f &= -257, yn(e, !0);
}
function yn(e, t) {
	if (!(e.f & 256) && e.f & 8192) {
		e.f ^= b, e.f & 1024 || (k(e, v), bt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			yn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function bn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ L(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var xn = null, H = !1;
function Sn(e) {
	H = e;
}
var U = null, W = !1;
function G(e) {
	U = e;
}
var K = null;
function q(e) {
	K = e;
}
var J = null;
function Cn(e) {
	U !== null && (U.f & 2097152 || U.f & 2) && (J ??= /* @__PURE__ */ new Set()).add(e);
}
var Y = null, X = 0, Z = null;
function wn(e) {
	Z = e;
}
var Tn = 1, En = 0, Dn = En;
function On(e) {
	Dn = e;
}
function kn() {
	return ++Tn;
}
function An(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (An(a) && ct(a), a.wv > e.wv) return !0;
		}
		t & 512 && j === null && k(e, _);
	}
	return !1;
}
function jn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(J !== null && J.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? jn(a, t, !1) : t === a && (n ? k(a, v) : a.f & 1024 && k(a, y), Ct(a));
	}
}
function Mn(e) {
	var t = Y, n = X, r = Z, i = U, a = J, o = D, s = W, c = Dn, l = e.f;
	Y = null, X = 0, Z = null, U = l & 96 ? null : e, J = null, Be(e.ctx), W = !1, Dn = ++En, e.ac !== null && (Xe(() => {
		e.ac.abort(he);
	}), e.ac = null);
	try {
		e.f |= ie;
		var u = e.fn, d = u();
		e.f |= S;
		var f = Nn(e);
		if (We() && Z !== null && !W && f !== null && !(e.f & 6146)) for (var p = 0; p < Z.length; p++) jn(Z[p], e);
		if (i !== null && i !== e) {
			if (En++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = En;
			if (t !== null) for (let e of t) e.rv = En;
			Z !== null && (r === null ? r = Z : r.push(...Z));
		}
		return e.f & 8388608 && (e.f ^= oe), d;
	} catch (t) {
		return Nn(e), Zt(t);
	} finally {
		e.f ^= ie, Y = t, X = n, Z = r, U = i, J = a, Be(o), W = s, Dn = c;
	}
}
function Nn(e) {
	var t = e.deps, n = A?.is_fork;
	if (Y !== null) {
		var r;
		if (n || Fn(e, X), t !== null && X > 0) for (t.length = X + Y.length, r = 0; r < Y.length; r++) t[X + r] = Y[r];
		else e.deps = t = Y;
		if (en() && e.f & 512) for (r = X; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && X < t.length && (Fn(e, X), t.length = X);
	return t;
}
function Pn(e, n) {
	let r = n.reactions;
	if (r !== null) {
		var o = i.call(r, e);
		if (o !== -1) {
			var s = r.length - 1;
			s === 0 ? r = n.reactions = null : (r[o] = r[s], r.pop());
		}
	}
	if (r === null && n.f & 2 && (Y === null || !a.call(Y, n))) {
		var c = n;
		c.f & 512 && (c.f ^= 512), c.v !== t && Je(c), c.ac !== null && Xe(() => {
			c.ac.abort(he), c.ac = null, k(c, v);
		}), lt(c), Fn(c, 0);
	}
}
function Fn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Pn(e, n[r]);
}
function In(e) {
	var t = e.f;
	if (!(t & 16384)) {
		k(e, _);
		var n = K;
		K = e;
		try {
			t & 16777232 ? pn(e) : fn(e), dn(e);
			var r = Mn(e);
			e.teardown = typeof r == "function" ? r : null, e.wv = Tn;
		} finally {
			K = n;
		}
	}
}
function Q(e) {
	var t = !!(e.f & 2);
	if (xn?.add(e), U !== null && !W && !(K !== null && K.f & 16384) && (J === null || !J.has(e))) {
		var n = U.deps;
		if (U.f & 2097152) e.rv < En && (e.rv = En, Y === null && n !== null && n[X] === e ? X++ : Y === null ? Y = [e] : Y.push(e));
		else {
			U.deps ??= [], a.call(U.deps, e) || U.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [U] : a.call(r, U) || r.push(U);
		}
	}
	if (H && N.has(e)) return N.get(e);
	if (t) {
		var i = e;
		if (H) {
			var o = i.v;
			return (!(i.f & 1024) && i.reactions !== null || Rn(i)) && (o = st(i)), N.set(i, o), o;
		}
		var s = !(i.f & 512) && !W && U !== null && !!(U.f & 512), c = (i.f & S) === 0;
		An(i) && (s && (i.f |= 512), ct(i)), s && !c && (ut(i), Ln(i));
	}
	if (j?.has(e)) return j.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Ln(e) {
	if (e.f |= 512, e.deps !== null) for (let n of e.deps) {
		var t = n.reactions;
		t === null ? n.reactions = [e] : a.call(t, e) || t.push(e), n.f & 2 && !(n.f & 512) && (ut(n), Ln(n));
	}
}
function Rn(e) {
	if (e.v === t) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (N.has(t) || t.f & 2 && Rn(t)) return !0;
	return !1;
}
function zn(e) {
	var t = W;
	try {
		return W = !0, e();
	} finally {
		W = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var Bn = Symbol("events"), Vn = /* @__PURE__ */ new Set(), Hn = /* @__PURE__ */ new Set(), Un = null, Wn = !1;
function Gn(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	Un = e, Wn || (Wn = !0, setTimeout(() => {
		Wn = !1, Un = null;
	}));
	var o = 0, c = Un === e && e[Bn];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[Bn] = t;
			return;
		}
		var u = i.indexOf(t);
		if (u === -1) return;
		l <= u && (o = l);
	}
	if (a = i[o] || e.target, a !== t) {
		s(e, "currentTarget", {
			configurable: !0,
			get() {
				return a || n;
			}
		});
		var d = U, f = K;
		G(null), q(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[Bn]?.[r];
					h != null && (!a.disabled || e.target === a) && h.call(a, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				o++, a = o < i.length ? i[o] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[Bn] = t, delete e.currentTarget, G(d), q(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Kn = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function qn(e) {
	return Kn?.createHTML(e) ?? e;
}
function Jn(e) {
	var t = Yt("template");
	return t.innerHTML = qn(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Yn(e, t) {
	var n = K;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Xn(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (w) return Yn(T, null), T;
		i === void 0 && (i = Jn(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Ht(i)));
		var t = r || Rt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Ht(t), s = t.lastChild;
			Yn(o, s);
		} else Yn(t, t);
		return t;
	};
}
function Zn(e, t) {
	if (w) {
		var n = K;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = T), xe();
	} else e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var Qn = ["touchstart", "touchmove"];
function $n(e) {
	return Qn.includes(e);
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function er(e) {
	let t = 0, n = Ot(0), r;
	return () => {
		en() && (Q(n), cn(() => (t === 0 && (r = zn(() => e(() => Pt(n)))), t += 1, () => {
			O(() => {
				--t, t === 0 && (r?.(), r = void 0, Pt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var tr = C | te;
function nr(e, t, n, r) {
	new rr(e, t, n, r);
}
var rr = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = w ? T : null;
	#n;
	#r;
	#i;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = 0;
	#u = 0;
	#d = !1;
	#f = /* @__PURE__ */ new Set();
	#p = /* @__PURE__ */ new Set();
	#m = null;
	#h = er(() => (this.#m = Ot(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = K;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = K.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = un(() => {
			if (w) {
				let e = Te(this.#t);
				xe();
				let t = e === "[!";
				if (e.startsWith("[?")) {
					let t = JSON.parse(e.slice(2));
					this.#_(t);
				} else t ? this.#b() : this.#g();
			} else this.#x();
		}, tr), w && (this.#e = T);
	}
	#g() {
		try {
			this.#a = B(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		O(r), t && (this.#s = B(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			this.#y() || (t ? ye() : (t = !0, n && ze(), this.#s !== null && gn(this.#s, () => {
				this.#s = null;
			}), this.#C(() => {
				this.#x();
			})));
		};
		return {
			reset: r,
			invoke_onerror: () => {
				if (!this.#y()) try {
					n = !0, this.#n.onerror?.(e, r), n = !1;
				} catch (e) {
					R(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		return (this.#i.f & (x | ee)) !== 0;
	}
	#b() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = B(() => e(this.#e)), O(() => {
			if (!this.#y()) {
				var e = this.#c = document.createDocumentFragment(), t = I(), n = !1;
				e.append(t), this.#a = this.#C(() => {
					try {
						return B(() => this.#r(t));
					} catch (e) {
						try {
							this.error(e), n = !0;
						} catch (e) {
							R(e, this.#i.parent);
						}
						return null;
					}
				}), this.#a === null ? (this.#c = null, n && this.#S(A)) : this.#u === 0 && (this.#e.before(e), this.#c = null, gn(this.#o, () => {
					this.#o = null;
				}), this.#S(A));
			}
		}));
	}
	#x() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = B(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				bn(this.#a, e);
				let t = this.#n.pending;
				this.#o = B(() => t(this.#e));
			} else this.#S(A);
		} catch (e) {
			this.error(e);
		}
	}
	#S(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		Ye(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#C(e) {
		var t = K, n = U, r = D;
		q(this.#i), G(this.#i), Be(this.#i.ctx);
		try {
			return bt.ensure(), e();
		} finally {
			q(t), G(n), Be(r);
		}
	}
	#w(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#S(t), this.#o && gn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#w(e, t);
	}
	update_pending_count(e, t) {
		this.#w(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, O(() => {
			this.#d = !1, this.#m && Mt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), Q(this.#m);
	}
	error(t) {
		if (t === e || !this.#n.onerror && !this.#n.failed) throw t;
		A?.is_fork ? (this.#a && A.skip_effect(this.#a), this.#o && A.skip_effect(this.#o), this.#s && A.skip_effect(this.#s), A.oncommit(() => {
			this.#y() || this.#T(t);
		})) : this.#T(t);
	}
	#T(e) {
		this.#a &&= (V(this.#a), null), this.#o &&= (V(this.#o), null), this.#s &&= (V(this.#s), null), w && (E(this.#t), Ce(), E(we()));
		let t = this.#n.failed, n = (e) => {
			if (this.#y()) return;
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && !this.#y() && (this.#s = this.#C(() => {
				try {
					return B(() => {
						var r = K;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return R(e, this.#i.parent), null;
				}
			}));
		};
		O(() => {
			if (!this.#y()) {
				var t;
				try {
					t = this.transform_error(e);
				} catch (e) {
					R(e, this.#i && this.#i.parent);
					return;
				}
				typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => R(e, this.#i && this.#i.parent)) : n(t);
			}
		});
	}
};
function ir(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[me] ??= e.nodeValue) && (e[me] = n, e.nodeValue = `${n}`);
}
function ar(e, t) {
	return sr(e, t);
}
var or = /* @__PURE__ */ new Map();
function sr(t, { target: n, anchor: r, props: i = {}, events: a, context: s, intro: c = !0, transformError: l }) {
	Vt();
	var u = void 0, d = an(() => {
		var c = r ?? n.appendChild(I());
		nr(c, { pending: () => {} }, (n) => {
			Ve({});
			var r = D;
			if (s && (r.c = s), a && (i.$$events = a), w && Yn(n, null), u = t(n, i) || Ue(), w && (K.nodes.end = T, T === null || T.nodeType !== 8 || T.data !== "]")) throw ve(), e;
			He();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = $n(r);
					for (let e of [n, document]) {
						var a = or.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), or.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Gn, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(o(Vn)), Hn.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = or.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, Gn), t.delete(e), t.size === 0 && or.delete(r)) : t.set(e, i);
			}
			Hn.delete(f), c !== r && c.parentNode?.removeChild(c);
		};
	});
	return cr.set(u, d), u;
}
var cr = /* @__PURE__ */ new WeakMap(), lr = class {
	anchor;
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new Map();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = !0;
	constructor(e, t = !0) {
		this.anchor = e, this.#i = t;
	}
	#a = (e) => {
		if (this.#e.has(e)) {
			var t = this.#e.get(e), n = this.#t.get(t);
			if (n) vn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (vn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (V(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						bn(r, t), t.append(I()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else V(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), gn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (V(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = A, r = Jt();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = I();
				i.append(a), this.#n.set(e, {
					effect: B(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, B(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else w && (this.anchor = T), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function ur(e, t, n = !1) {
	var r;
	w && (r = T, xe());
	var i = new lr(e), a = n ? C : 0;
	function o(e, t) {
		if (w) {
			var n = Te(r);
			if (e !== parseInt(n.substring(1))) {
				var a = we();
				E(a), i.anchor = a, be(!1), i.ensure(e, t), be(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	un(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function dr(e, t, n) {
	for (var r = [], i = t.length, a, s = t.length, c = 0; c < i; c++) {
		let n = t[c];
		gn(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					fr(e, o(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = r.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			qt(d), d.append(u), e.items.clear();
		}
		fr(e, t, !l);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function fr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= re, bn(a, document.createDocumentFragment())) : V(t[i], n);
	}
}
var pr;
function mr(e, t, n, i, a, s = null) {
	var c = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		c = w ? E(/* @__PURE__ */ Ht(u)) : u.appendChild(I());
	}
	w && xe();
	var d = null, f = /* @__PURE__ */ at(() => {
		var e = n();
		return r(e) ? e : e == null ? [] : o(e);
	}), p = /* @__PURE__ */ new Map(), m = !0;
	function h(e) {
		if (!(_.effect.f & 16384)) {
			_.pending.delete(e);
			var n = Q(f);
			_.fallback = d, gr(_, n, c, t, i), d !== null && (n.length === 0 ? d.f & 33554432 ? (d.f ^= re, vr(d, null, c)) : vn(d) : gn(d, () => {
				d = null;
			}));
		}
	}
	function g(e) {
		_.pending.delete(e);
	}
	var _ = {
		effect: un(() => {
			var e = Q(f), r = e.length;
			let o = !1;
			w && Te(c) === "[!" != (r === 0) && (c = we(), E(c), be(!1), o = !0);
			for (var u = /* @__PURE__ */ new Set(), _ = A, v = Jt(), y = 0; y < r; y += 1) {
				w && T.nodeType === 8 && T.data === "]" && (c = T, o = !0, be(!1));
				var b = e[y], x = i(b, y), S = m ? null : l.get(x);
				S ? (S.v && Mt(S.v, b), S.i && Mt(S.i, y), v && _.unskip_effect(S.e)) : (S = _r(l, m ? c : pr ??= I(), b, x, y, a, t, n), m || (S.e.f |= re), l.set(x, S)), u.add(x);
			}
			if (r === 0 && s && !d && (m ? d = B(() => s(c)) : (d = B(() => s(pr ??= I())), d.f |= re)), r > u.size && Ae("", "", ""), w && r > 0 && E(we()), !m) {
				if (p.set(_, u), v) {
					for (let [e, t] of l) u.has(e) || _.skip_effect(t.e);
					_.oncommit(h), _.ondiscard(g);
				} else h(_);
			}
			o && be(!0), Q(f);
		}),
		flags: t,
		items: l,
		pending: p,
		outrogroups: null,
		fallback: d
	};
	m = !1, w && (c = T);
}
function hr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function gr(e, t, n, r, i) {
	var a = !!(r & 8), s = t.length, c = e.items, l = hr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (a) for (v = 0; v < s; v += 1) h = t[v], g = i(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = i(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (vn(_), a && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= re, _ === l) vr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), yr(e, d, _), yr(e, _, y), vr(_, y, n), d = _, p = [], m = [], l = hr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], ee = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) vr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					yr(e, S.prev, ee.next), yr(e, d, S), yr(e, ee, b), l = b, d = ee, --v, p = [], m = [];
				} else u.delete(_), vr(_, l, n), yr(e, _.prev, _.next), yr(e, _, d === null ? e.effect.first : d.next), yr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = hr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = hr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (fr(e, o(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var C = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || C.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && C.push(l), l = hr(l.next);
		var te = C.length;
		if (te > 0) {
			var ne = r & 4 && s === 0 ? n : null;
			if (a) {
				for (v = 0; v < te; v += 1) C[v].nodes?.a?.measure();
				for (v = 0; v < te; v += 1) C[v].nodes?.a?.fix();
			}
			dr(e, C, ne);
		}
	}
	a && O(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function _r(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Ot(n) : /* @__PURE__ */ kt(n, !1, !1) : null, l = o & 2 ? Ot(i) : null;
	return {
		v: c,
		i: l,
		e: B(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function vr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ L(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function yr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/css.js
function br(e, t) {
	on(() => {
		e = K?.parent?.nodes?.start ?? e;
		var n = e.getRootNode(), r = n.host ? n : n.head ?? n.ownerDocument.head;
		if (!r.querySelector("#" + t.hash)) {
			let e = Yt("style");
			e.id = t.hash, e.textContent = t.code, r.appendChild(e);
		}
	});
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
var xr = [..." 	\n\r\f\xA0\v﻿"];
function Sr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || xr.includes(r[o - 1])) && (s === r.length || xr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Cr(e, t, n, r, i, a) {
	var o = e[fe];
	if (w || o !== n || o === void 0) {
		var s = Sr(n, r, a);
		(!w || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[fe] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var wr = Symbol("is custom element"), Tr = Symbol("is html"), Er = ge ? "link" : "LINK";
function Dr(e, t, n, r) {
	var i = Or(e);
	w && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Er) || i[t] !== (i[t] = n) && (t === "loading" && (e[ue] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Ar(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function Or(e) {
	return e[de] ??= {
		[wr]: e.nodeName.includes("-"),
		[Tr]: e.namespaceURI === n
	};
}
var kr = /* @__PURE__ */ new Map();
function Ar(e) {
	var t = e.getAttribute("is") || e.nodeName, n = kr.get(t);
	if (n) return n;
	kr.set(t, n = /* @__PURE__ */ new Set());
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = l(i), r) r[o].set && o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.add(o);
		i = f(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var jr = !1;
function Mr(e) {
	var t = jr;
	try {
		return jr = !1, [e(), jr];
	} finally {
		jr = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function Nr(e, t, n, r) {
	var i = !0, a = !!(n & 8), o = !!(n & 16), s = r, l = !0, u = void 0, d = () => o && i ? (u ??= /* @__PURE__ */ tt(r), Q(u)) : (l && (l = !1, s = o ? zn(r) : r), s);
	let f;
	if (a) {
		var p = se in e || le in e;
		f = c(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = Mr(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && Fe(t), f(m)));
	var g = i ? () => {
		var n = e[t];
		return n === void 0 ? d() : (l = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (s = void 0), n === void 0 ? s : n;
	};
	if (i && !(n & 4)) return g;
	if (f) {
		var _ = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || _ || h) && f(t ? g() : e), e) : g();
		});
	}
	var v = !1, y = (n & 1 ? tt : at)(() => (v = !1, g()));
	a && Q(y);
	var b = K;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? Q(y) : i && a ? It(e) : e;
			return F(y, n), v = !0, s !== void 0 && (s = n), e;
		}
		return H && v || b.f & 16384 ? y.v : Q(y);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
var $ = {
	name: "joblist",
	url: "https://joblist.today",
	source: "https://github.com/joblisttoday/joblisttoday",
	collections: {
		company: "today.joblist.company",
		job: "today.joblist.job"
	},
	lexicons: {
		dir: "lexicons",
		did: "did:plc:jqaucxlucukeif3bltpuc7zx",
		permissionSet: "today.joblist.authFull"
	},
	locales: [
		"en",
		"fr",
		"de",
		"es"
	],
	defaultLocale: "en",
	embed: {
		page: "/embed",
		scripts: "/embed/",
		shown: 20
	},
	analytics: {
		script: "/vendor/umami.js",
		hostUrl: "https://gateway.umami.is",
		websiteId: "479fa5c4-e9c9-4d8d-85c6-9a88c886dd24",
		domains: "joblist.today"
	},
	services: {
		appview: "https://public.api.bsky.app",
		plc: "https://plc.directory",
		handleResolver: "https://public.api.bsky.app",
		dns: "https://cloudflare-dns.com/dns-query",
		relay: "https://relay1.us-east.bsky.network",
		placeSearch: "https://photon.komoot.io/api/"
	},
	links: { signup: "https://bsky.app" },
	jobPost: {
		days: 30,
		maxDays: 120,
		dayChoices: [
			7,
			14,
			30,
			60,
			120
		],
		titleMax: 200,
		descriptionMax: 1e4,
		page: "/job/{did}/{rkey}",
		remote: [
			"onsite",
			"hybrid",
			"remote"
		],
		employment: [
			"full-time",
			"part-time",
			"contract",
			"internship",
			"volunteer"
		]
	},
	limits: { pagesPerRepo: 100 },
	shareImage: {
		path: "/og.png",
		width: 1200,
		height: 630
	},
	map: {
		style: "https://tiles.openfreemap.org/styles/positron",
		styleDark: "https://tiles.openfreemap.org/styles/dark",
		projection: "globe",
		center: [10, 30],
		zoom: 1,
		maxZoom: 11,
		padding: 48,
		pointRadius: 6,
		pointStroke: 2,
		clusterRadius: 40,
		clusterMaxZoom: 11,
		popupMax: 8,
		font: ["Noto Sans Regular"],
		finePointer: "(hover: hover) and (pointer: fine)"
	},
	placeSearch: {
		limit: 6,
		minLength: 2,
		delayMs: 250,
		languages: [
			"en",
			"fr",
			"de"
		],
		layers: [
			"city",
			"locality",
			"district",
			"county",
			"state",
			"country"
		]
	},
	search: {
		minLength: 2,
		shown: 30,
		organizations: 200
	},
	companyForm: {
		locationsMax: 50,
		linksMax: 20,
		sections: [
			"about",
			"kind",
			"tags",
			"places",
			"links"
		]
	}
}, Pr = (e) => String(Math.round(e * 1e5) / 1e5), Fr = (e, t) => typeof e == "string" ? e.trim().slice(0, t) : "";
function Ir(e) {
	if (!e || typeof e != "object") return null;
	let t = e, n = {}, r = Fr(t.name, 100), i = Fr(t.address, 200), a = Fr(t.country, 100), o = Fr(t.countryCode, 2).toUpperCase();
	r && (n.name = r), i && (n.address = i), a && (n.country = a), /^[A-Z]{2}$/.test(o) && (n.countryCode = o);
	let s = Number(t.latitude), c = Number(t.longitude);
	return t.latitude !== "" && t.longitude !== "" && Number.isFinite(s) && Number.isFinite(c) && Math.abs(s) <= 90 && Math.abs(c) <= 180 && (n.latitude = Pr(s), n.longitude = Pr(c)), n.name || n.address || n.country || n.latitude ? n : null;
}
var Lr = (e, t = 50) => Array.isArray(e) ? e.map(Ir).filter((e) => e !== null).slice(0, t) : [], Rr = (e) => [e.name || e.address, e.country].filter(Boolean).join(", "), zr = 864e5, { days: Br, maxDays: Vr } = $.jobPost;
function Hr(e, { email: t = !1 } = {}) {
	let n = String(e ?? "").trim();
	try {
		let { protocol: e } = new URL(n);
		return e === "https:" || e === "http:" || t && e === "mailto:" ? n : "";
	} catch {
		return "";
	}
}
function Ur(e) {
	return {
		name: String(e.name || ""),
		url: Hr(e.url),
		description: String(e.description || ""),
		kind: String(e.kind || ""),
		tags: Array.isArray(e.tags) ? e.tags.filter((e) => typeof e == "string") : [],
		locations: Lr(e.locations, $.companyForm.locationsMax),
		links: Array.isArray(e.links) ? e.links.map((e) => Hr(e)).filter(Boolean) : []
	};
}
var Wr = (e, t) => $.jobPost.page.replace("{did}", encodeURIComponent(e)).replace("{rkey}", encodeURIComponent(t));
function Gr(e, t = Date.now()) {
	if (!e?.title || !e.company || !e.url || e.status && e.status !== "open") return !1;
	let n = Date.parse(String(e.expiresAt || ""));
	return Number.isFinite(n) && n > t && n <= t + (Vr + 1) * zr;
}
function Kr(e) {
	let t = Lr(e.locations, 20);
	return {
		title: String(e.title || ""),
		company: String(e.company || ""),
		description: String(e.description || ""),
		locations: t,
		place: t.map(Rr).filter(Boolean).join(" · "),
		remote: String(e.remote || ""),
		employment: String(e.employment || ""),
		apply: Hr(e.apply?.url, { email: !0 }) || (String(e.url || "").startsWith(`${$.url}/job/`) ? "" : Hr(e.url)),
		createdAt: String(e.createdAt || ""),
		expiresAt: String(e.expiresAt || "")
	};
}
var qr = {
	accounts: [],
	domains: []
};
//#endregion
//#region src/lib/atproto.js
async function Jr(e, t, n = {}) {
	let r = new URL(`${e.replace(/\/$/, "")}/xrpc/${t}`);
	for (let [e, t] of Object.entries(n)) t !== void 0 && r.searchParams.set(e, String(t));
	let i = await fetch(r, { headers: { accept: "application/json" } });
	if (!i.ok) throw Object.assign(/* @__PURE__ */ Error(`${t} failed (${i.status})`), { status: i.status });
	return i.json();
}
function Yr(e) {
	let t = e?.status;
	return typeof t == "number" && t >= 400 && t < 500;
}
async function Xr(e) {
	if (e.startsWith("did:")) return e;
	try {
		let { did: t } = await Jr($.services.appview, "com.atproto.identity.resolveHandle", { handle: e });
		return t;
	} catch (t) {
		let n = `${$.services.dns}?${new URLSearchParams({
			name: `_atproto.${e}`,
			type: "TXT"
		})}`, r = ((await fetch(n, { headers: { accept: "application/dns-json" } }).then((e) => e.ok ? e.json() : null, () => null))?.Answer || []).map((e) => String(e.data).replace(/"/g, "")).find((e) => e.startsWith("did="));
		if (r) return r.slice(4);
		throw t;
	}
}
var Zr = /* @__PURE__ */ new Map();
function Qr(e) {
	if (!Zr.has(e)) {
		let t = e.startsWith("did:web:") ? `https://${e.slice(8)}/.well-known/did.json` : `${$.services.plc}/${e}`;
		Zr.set(e, fetch(t).then((t) => {
			if (!t.ok) throw Error(`cannot resolve ${e}`);
			return t.json();
		}));
	}
	return Zr.get(e);
}
async function $r(e) {
	let t = ((await Qr(e)).service || []).find((t) => t.id === "#atproto_pds" || t.id === `${e}#atproto_pds`);
	if (!t) throw Error(`no server for ${e}`);
	return t.serviceEndpoint;
}
async function ei(e) {
	let t = ((await Qr(e).catch(() => null))?.alsoKnownAs || []).find((e) => e.startsWith("at://")), n = t ? t.slice(5).toLowerCase() : "";
	return n && await Xr(n).catch(() => "") === e ? n : null;
}
async function ti(e) {
	try {
		let t = await Jr($.services.appview, "app.bsky.actor.getProfile", { actor: e });
		return {
			handle: t.handle,
			displayName: t.displayName,
			avatar: t.avatar
		};
	} catch {
		return null;
	}
}
function ni(e, t, n) {
	let r = `at://${t}/${n}/`;
	if (typeof e != "string" || !e.startsWith(r)) return "";
	let i = e.slice(r.length);
	return /^[A-Za-z0-9._:~-]{1,512}$/.test(i) && i !== "." && i !== ".." ? i : "";
}
async function ri(e, t) {
	let n = await $r(e), r = [], i, a = 0;
	do {
		let o = await Jr(n, "com.atproto.repo.listRecords", {
			repo: e,
			collection: t,
			limit: 100,
			cursor: i
		});
		for (let n of o.records || []) {
			let i = ni(n.uri, e, t);
			i && r.push({
				did: e,
				rkey: i,
				uri: n.uri,
				cid: n.cid,
				value: n.value
			});
		}
		i = o.records?.length ? o.cursor : void 0, a++;
	} while (i && a < $.limits.pagesPerRepo);
	return r;
}
async function ii(e, t, n) {
	let r = await $r(e);
	try {
		let i = await Jr(r, "com.atproto.repo.getRecord", {
			repo: e,
			collection: t,
			rkey: n
		});
		return {
			did: e,
			rkey: n,
			uri: i.uri,
			cid: i.cid,
			value: i.value
		};
	} catch (e) {
		if (Yr(e)) return null;
		throw e;
	}
}
Math.floor(Math.random() * 1024);
//#endregion
//#region src/lib/profile.js
var ai = new Set(qr.accounts);
async function oi(e) {
	let t = await Xr(e).catch(() => null);
	if (!t || ai.has(t) || await ei(t) !== e) return null;
	let [n, r, i] = await Promise.all([
		ii(t, $.collections.company, e),
		ri(t, $.collections.job),
		ti(t)
	]), a = r.filter((t) => t.value?.company === e && t.value?.title).map((e) => ({
		...Kr(e.value),
		rkey: e.rkey,
		live: Gr(e.value),
		value: e.value
	})).sort((e, t) => t.createdAt.localeCompare(e.createdAt));
	return {
		domain: e,
		did: t,
		avatar: i?.avatar || "",
		company: n?.value?.name ? Ur(n.value) : null,
		value: n?.value || null,
		jobs: a
	};
}
//#endregion
//#region embed/src/i18n.svelte.js
var si = {
	site: "https://joblist.today",
	shown: 20,
	strings: {
		en: {
			"job.remote.onsite": "On site",
			"job.remote.hybrid": "Hybrid",
			"job.remote.remote": "Remote",
			"job.employment.full-time": "Full-time",
			"job.employment.part-time": "Part-time",
			"job.employment.contract": "Contract",
			"job.employment.internship": "Internship",
			"job.employment.volunteer": "Volunteer",
			"job.apply": "Apply",
			"job.posted": "Posted {ago}",
			"job.left": "{count} days left",
			"job.left.one": "1 day left",
			"job.closed": "This offer is no longer shown: expired or closed.",
			"job.notFound": "This job offer does not exist, or not any more.",
			"job.delete": "Delete",
			"job.delete.confirm": "Delete this offer from your account?",
			"embed.section": "Show your jobs on your website",
			"embed.intro": "Paste one of these in your website: the list stays up to date by itself.",
			"embed.iframe": "As a frame (any site)",
			"embed.element": "As an element (styled by your site)",
			"embed.copy": "Copy",
			"embed.copied": "Copied",
			"embed.preview": "Preview",
			"embed.title": "Open jobs at {name}",
			"embed.count": "{count} open jobs",
			"embed.count.one": "1 open job",
			"embed.none": "No open jobs right now.",
			"embed.error": "The jobs could not be read.",
			"embed.by": "on joblist"
		},
		fr: {
			"job.remote.onsite": "Sur place",
			"job.remote.hybrid": "Hybride",
			"job.remote.remote": "À distance",
			"job.employment.full-time": "Temps plein",
			"job.employment.part-time": "Temps partiel",
			"job.employment.contract": "Contrat",
			"job.employment.internship": "Stage",
			"job.employment.volunteer": "Bénévolat",
			"job.apply": "Postuler",
			"job.posted": "Publiée {ago}",
			"job.left": "encore {count} jours",
			"job.left.one": "encore 1 jour",
			"job.closed": "Cette offre n’est plus affichée : expirée ou fermée.",
			"job.notFound": "Cette offre n’existe pas, ou plus.",
			"job.delete": "Supprimer",
			"job.delete.confirm": "Supprimer cette offre de votre compte ?",
			"embed.section": "Affichez vos offres sur votre site",
			"embed.intro": "Collez l’un de ces codes dans votre site : la liste se met à jour toute seule.",
			"embed.iframe": "En cadre (tout site)",
			"embed.element": "En élément (au style de votre site)",
			"embed.copy": "Copier",
			"embed.copied": "Copié",
			"embed.preview": "Aperçu",
			"embed.title": "Offres ouvertes chez {name}",
			"embed.count": "{count} offres ouvertes",
			"embed.count.one": "1 offre ouverte",
			"embed.none": "Aucune offre ouverte pour le moment.",
			"embed.error": "Les offres n’ont pas pu être lues.",
			"embed.by": "sur joblist"
		},
		de: {
			"job.remote.onsite": "Vor Ort",
			"job.remote.hybrid": "Hybrid",
			"job.remote.remote": "Remote",
			"job.employment.full-time": "Vollzeit",
			"job.employment.part-time": "Teilzeit",
			"job.employment.contract": "Vertrag",
			"job.employment.internship": "Praktikum",
			"job.employment.volunteer": "Ehrenamt",
			"job.apply": "Bewerben",
			"job.posted": "Veröffentlicht {ago}",
			"job.left": "noch {count} Tage",
			"job.left.one": "noch 1 Tag",
			"job.closed": "Dieses Angebot wird nicht mehr gezeigt: abgelaufen oder geschlossen.",
			"job.notFound": "Dieses Angebot gibt es nicht, oder nicht mehr.",
			"job.delete": "Löschen",
			"job.delete.confirm": "Dieses Angebot aus deinem Konto löschen?",
			"embed.section": "Zeige deine Stellen auf deiner Website",
			"embed.intro": "Füge eins davon in deine Website ein: die Liste bleibt von selbst aktuell.",
			"embed.iframe": "Als Rahmen (jede Website)",
			"embed.element": "Als Element (im Stil deiner Website)",
			"embed.copy": "Kopieren",
			"embed.copied": "Kopiert",
			"embed.preview": "Vorschau",
			"embed.title": "Offene Stellen bei {name}",
			"embed.count": "{count} offene Stellen",
			"embed.count.one": "1 offene Stelle",
			"embed.none": "Gerade keine offenen Stellen.",
			"embed.error": "Die Stellen konnten nicht gelesen werden.",
			"embed.by": "auf joblist"
		},
		es: {
			"job.remote.onsite": "Presencial",
			"job.remote.hybrid": "Híbrido",
			"job.remote.remote": "Remoto",
			"job.employment.full-time": "Jornada completa",
			"job.employment.part-time": "Media jornada",
			"job.employment.contract": "Contrato",
			"job.employment.internship": "Prácticas",
			"job.employment.volunteer": "Voluntariado",
			"job.apply": "Postular",
			"job.posted": "Publicada {ago}",
			"job.left": "quedan {count} días",
			"job.left.one": "queda 1 día",
			"job.closed": "Esta oferta ya no se muestra: vencida o cerrada.",
			"job.notFound": "Esta oferta no existe, o ya no.",
			"job.delete": "Eliminar",
			"job.delete.confirm": "¿Eliminar esta oferta de tu cuenta?",
			"embed.section": "Muestra tus ofertas en tu sitio web",
			"embed.intro": "Pega uno de estos en tu sitio web: la lista se actualiza sola.",
			"embed.iframe": "Como marco (cualquier sitio)",
			"embed.element": "Como elemento (con el estilo de tu sitio)",
			"embed.copy": "Copiar",
			"embed.copied": "Copiado",
			"embed.preview": "Vista previa",
			"embed.title": "Ofertas abiertas en {name}",
			"embed.count": "{count} ofertas abiertas",
			"embed.count.one": "1 oferta abierta",
			"embed.none": "Ninguna oferta abierta por ahora.",
			"embed.error": "No se pudieron leer las ofertas.",
			"embed.by": "en joblist"
		}
	}
}.strings, ci = It({ locale: "en" });
function li(e, t = {}) {
	let n = si[ci.locale] || si.en, r = t.count === 1 && (n[`${e}.one`] || si.en[`${e}.one`]) || n[e] || si.en[e] || e;
	for (let [e, n] of Object.entries(t)) r = r.replaceAll(`{${e}}`, typeof n == "number" ? n.toLocaleString(ci.locale) : String(n));
	return r;
}
//#endregion
//#region embed/src/JoblistJobs.svelte
var ui = /* @__PURE__ */ Xn("<p class=\"svelte-uruhdc\"> </p>"), di = /* @__PURE__ */ Xn("<small class=\"svelte-uruhdc\"> </small>"), fi = /* @__PURE__ */ Xn("<li class=\"svelte-uruhdc\"><a target=\"_blank\" rel=\"noopener\" class=\"svelte-uruhdc\"> </a> <!></li>"), pi = /* @__PURE__ */ Xn("<p class=\"svelte-uruhdc\"> </p> <ul class=\"svelte-uruhdc\"></ul>", 1), mi = /* @__PURE__ */ Xn("<h2 class=\"svelte-uruhdc\"><a target=\"_blank\" rel=\"noopener\" class=\"svelte-uruhdc\"> </a></h2> <!> <footer class=\"svelte-uruhdc\"><a target=\"_blank\" rel=\"noopener\" class=\"svelte-uruhdc\"> </a></footer>", 1), hi = /* @__PURE__ */ Xn("<jl-embed><!></jl-embed>", 2), gi = {
	hash: "svelte-uruhdc",
	code: "\n	/* Its colors from the page's, unless set. */jl-embed.svelte-uruhdc {--color-fg: var(--joblist-fg, currentColor);--color-muted: var(--joblist-muted, rgb(128 128 128));--color-line: var(--joblist-line, rgb(128 128 128 / 0.3));display:block;font-family:var(--joblist-font, inherit);color:var(--color-fg);line-height:1.45;}h2.svelte-uruhdc {margin:0 0 0.25rem;font-size:1.15em;}a.svelte-uruhdc {color:inherit;}h2.svelte-uruhdc a:where(.svelte-uruhdc) {text-decoration:none;}ul.svelte-uruhdc {margin:0.5rem 0;padding:0;list-style:none;}li.svelte-uruhdc {display:grid;padding:0.5rem 0;border-bottom:1px solid var(--color-line);}li.svelte-uruhdc a:where(.svelte-uruhdc) {font-weight:600;text-decoration:none;}li.svelte-uruhdc a:where(.svelte-uruhdc):hover,\n	h2.svelte-uruhdc a:where(.svelte-uruhdc):hover {text-decoration:underline;}p.svelte-uruhdc,\n	small.svelte-uruhdc,\n	footer.svelte-uruhdc {margin:0;color:var(--color-muted);font-size:0.875rem;}"
};
function _i(e, t) {
	Ve(t, !0), br(e, gi);
	let n = Nr(t, "organization", 3, ""), r = Nr(t, "lang", 3, ""), i = Nr(t, "limit", 3, 0), a = {
		site: "https://joblist.today",
		shown: 20,
		strings: {
			en: {
				"job.remote.onsite": "On site",
				"job.remote.hybrid": "Hybrid",
				"job.remote.remote": "Remote",
				"job.employment.full-time": "Full-time",
				"job.employment.part-time": "Part-time",
				"job.employment.contract": "Contract",
				"job.employment.internship": "Internship",
				"job.employment.volunteer": "Volunteer",
				"job.apply": "Apply",
				"job.posted": "Posted {ago}",
				"job.left": "{count} days left",
				"job.left.one": "1 day left",
				"job.closed": "This offer is no longer shown: expired or closed.",
				"job.notFound": "This job offer does not exist, or not any more.",
				"job.delete": "Delete",
				"job.delete.confirm": "Delete this offer from your account?",
				"embed.section": "Show your jobs on your website",
				"embed.intro": "Paste one of these in your website: the list stays up to date by itself.",
				"embed.iframe": "As a frame (any site)",
				"embed.element": "As an element (styled by your site)",
				"embed.copy": "Copy",
				"embed.copied": "Copied",
				"embed.preview": "Preview",
				"embed.title": "Open jobs at {name}",
				"embed.count": "{count} open jobs",
				"embed.count.one": "1 open job",
				"embed.none": "No open jobs right now.",
				"embed.error": "The jobs could not be read.",
				"embed.by": "on joblist"
			},
			fr: {
				"job.remote.onsite": "Sur place",
				"job.remote.hybrid": "Hybride",
				"job.remote.remote": "À distance",
				"job.employment.full-time": "Temps plein",
				"job.employment.part-time": "Temps partiel",
				"job.employment.contract": "Contrat",
				"job.employment.internship": "Stage",
				"job.employment.volunteer": "Bénévolat",
				"job.apply": "Postuler",
				"job.posted": "Publiée {ago}",
				"job.left": "encore {count} jours",
				"job.left.one": "encore 1 jour",
				"job.closed": "Cette offre n’est plus affichée : expirée ou fermée.",
				"job.notFound": "Cette offre n’existe pas, ou plus.",
				"job.delete": "Supprimer",
				"job.delete.confirm": "Supprimer cette offre de votre compte ?",
				"embed.section": "Affichez vos offres sur votre site",
				"embed.intro": "Collez l’un de ces codes dans votre site : la liste se met à jour toute seule.",
				"embed.iframe": "En cadre (tout site)",
				"embed.element": "En élément (au style de votre site)",
				"embed.copy": "Copier",
				"embed.copied": "Copié",
				"embed.preview": "Aperçu",
				"embed.title": "Offres ouvertes chez {name}",
				"embed.count": "{count} offres ouvertes",
				"embed.count.one": "1 offre ouverte",
				"embed.none": "Aucune offre ouverte pour le moment.",
				"embed.error": "Les offres n’ont pas pu être lues.",
				"embed.by": "sur joblist"
			},
			de: {
				"job.remote.onsite": "Vor Ort",
				"job.remote.hybrid": "Hybrid",
				"job.remote.remote": "Remote",
				"job.employment.full-time": "Vollzeit",
				"job.employment.part-time": "Teilzeit",
				"job.employment.contract": "Vertrag",
				"job.employment.internship": "Praktikum",
				"job.employment.volunteer": "Ehrenamt",
				"job.apply": "Bewerben",
				"job.posted": "Veröffentlicht {ago}",
				"job.left": "noch {count} Tage",
				"job.left.one": "noch 1 Tag",
				"job.closed": "Dieses Angebot wird nicht mehr gezeigt: abgelaufen oder geschlossen.",
				"job.notFound": "Dieses Angebot gibt es nicht, oder nicht mehr.",
				"job.delete": "Löschen",
				"job.delete.confirm": "Dieses Angebot aus deinem Konto löschen?",
				"embed.section": "Zeige deine Stellen auf deiner Website",
				"embed.intro": "Füge eins davon in deine Website ein: die Liste bleibt von selbst aktuell.",
				"embed.iframe": "Als Rahmen (jede Website)",
				"embed.element": "Als Element (im Stil deiner Website)",
				"embed.copy": "Kopieren",
				"embed.copied": "Kopiert",
				"embed.preview": "Vorschau",
				"embed.title": "Offene Stellen bei {name}",
				"embed.count": "{count} offene Stellen",
				"embed.count.one": "1 offene Stelle",
				"embed.none": "Gerade keine offenen Stellen.",
				"embed.error": "Die Stellen konnten nicht gelesen werden.",
				"embed.by": "auf joblist"
			},
			es: {
				"job.remote.onsite": "Presencial",
				"job.remote.hybrid": "Híbrido",
				"job.remote.remote": "Remoto",
				"job.employment.full-time": "Jornada completa",
				"job.employment.part-time": "Media jornada",
				"job.employment.contract": "Contrato",
				"job.employment.internship": "Prácticas",
				"job.employment.volunteer": "Voluntariado",
				"job.apply": "Postular",
				"job.posted": "Publicada {ago}",
				"job.left": "quedan {count} días",
				"job.left.one": "queda 1 día",
				"job.closed": "Esta oferta ya no se muestra: vencida o cerrada.",
				"job.notFound": "Esta oferta no existe, o ya no.",
				"job.delete": "Eliminar",
				"job.delete.confirm": "¿Eliminar esta oferta de tu cuenta?",
				"embed.section": "Muestra tus ofertas en tu sitio web",
				"embed.intro": "Pega uno de estos en tu sitio web: la lista se actualiza sola.",
				"embed.iframe": "Como marco (cualquier sitio)",
				"embed.element": "Como elemento (con el estilo de tu sitio)",
				"embed.copy": "Copiar",
				"embed.copied": "Copiado",
				"embed.preview": "Vista previa",
				"embed.title": "Ofertas abiertas en {name}",
				"embed.count": "{count} ofertas abiertas",
				"embed.count.one": "1 oferta abierta",
				"embed.none": "Ninguna oferta abierta por ahora.",
				"embed.error": "No se pudieron leer las ofertas.",
				"embed.by": "en joblist"
			}
		}
	};
	nn(() => {
		let e = (r() || document.documentElement.lang || navigator.language || "en").slice(0, 2).toLowerCase();
		ci.locale = e in a.strings ? e : "en";
	});
	let o = /* @__PURE__ */ P(void 0);
	nn(() => {
		let e = n();
		F(o, void 0), e && oi(e).then((t) => e === n() && F(o, t, !0), () => e === n() && F(o, null));
	});
	let s = /* @__PURE__ */ it(() => Q(o) ? Q(o).jobs.filter((e) => e.live) : []), c = /* @__PURE__ */ it(() => Q(s).slice(0, Math.max(1, Number(i()) || a.shown))), l = (e) => [
		e.place,
		e.remote && li(`job.remote.${e.remote}`),
		e.employment && li(`job.employment.${e.employment}`)
	].filter(Boolean).join(" · ");
	var u = hi();
	Cr(u, 1, "svelte-uruhdc");
	var d = Ut(u), f = (e) => {
		var t = ui(), n = Gt(t, !0);
		ln((e) => ir(n, e), [() => li("embed.error")]), Zn(e, t);
	}, p = (e) => {
		var t = mi(), r = Wt(t), i = Ut(r), u = Gt(i, !0);
		Se(r);
		var d = Kt(r, 2), f = (e) => {
			var t = pi(), n = Wt(t), r = Gt(n, !0), i = Kt(n, 2);
			mr(i, 21, () => Q(c), (e) => e.rkey, (e, t) => {
				var n = fi(), r = Ut(n), i = Gt(r, !0), s = Kt(r, 2), c = (e) => {
					var n = di(), r = Gt(n, !0);
					ln((e) => ir(r, e), [() => l(Q(t))]), Zn(e, n);
				}, u = /* @__PURE__ */ it(() => l(Q(t)));
				ur(s, (e) => {
					Q(u) && e(c);
				}), Se(n), ln((e) => {
					Dr(r, "href", `${a.site ?? ""}${e ?? ""}`), ir(i, Q(t).title);
				}, [() => Wr(Q(o).did, Q(t).rkey)]), Zn(e, n);
			}), Se(i), ln((e) => ir(r, e), [() => Q(s).length ? li("embed.count", { count: Q(s).length }) : li("embed.none")]), Zn(e, t);
		};
		ur(d, (e) => {
			Q(o) && e(f);
		});
		var p = Kt(d, 2), m = Ut(p), h = Gt(m, !0);
		Se(p), ln((e, t) => {
			Dr(i, "href", `${a.site ?? ""}/${n() ?? ""}`), ir(u, e), Dr(m, "href", `${a.site ?? ""}/${n() ?? ""}`), ir(h, t);
		}, [() => li("embed.title", { name: Q(o)?.company?.name || n() }), () => li("embed.by")]), Zn(e, t);
	};
	ur(d, (e) => {
		Q(o) === null ? e(f) : e(p, -1);
	}), Se(u), Zn(e, u), He();
}
//#endregion
//#region embed/src/joblist-jobs.svelte.js
var vi = [
	"organization",
	"lang",
	"limit"
], yi = class extends HTMLElement {
	static observedAttributes = vi;
	#e = /* @__PURE__ */ P(It({}));
	get props() {
		return Q(this.#e);
	}
	set props(e) {
		F(this.#e, e, !0);
	}
	connectedCallback() {
		if (!this.shadowRoot) {
			for (let e of vi) this.read(e);
			ar(_i, {
				target: this.attachShadow({ mode: "open" }),
				props: this.props
			});
		}
	}
	attributeChangedCallback(e) {
		this.read(e);
	}
	read(e) {
		let t = this.getAttribute(e);
		this.props[e] = t ?? "";
	}
};
customElements.get("joblist-jobs") || customElements.define("joblist-jobs", yi);
//#endregion
