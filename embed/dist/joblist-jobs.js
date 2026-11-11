//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = {}, r = Symbol("uninitialized"), i = "http://www.w3.org/1999/xhtml", a = Array.isArray, o = Array.prototype.indexOf, s = Array.prototype.includes, c = Array.from, l = Object.defineProperty, u = Object.getOwnPropertyDescriptor, d = Object.getOwnPropertyDescriptors, f = Object.prototype, p = Array.prototype, m = Object.getPrototypeOf, h = Object.isExtensible, g = () => {};
function _(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function v() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var y = 1024, b = 2048, x = 4096, S = 8192, ee = 16384, te = 32768, ne = 1 << 25, re = 65536, ie = 1 << 19, ae = 1 << 20, oe = 1 << 25, se = 1 << 21, ce = 1 << 22, le = 1 << 23, ue = Symbol("$state"), de = Symbol("component"), fe = Symbol("legacy props"), pe = Symbol(""), me = Symbol("attributes"), he = Symbol("class"), ge = Symbol("style"), _e = Symbol("text"), ve = Symbol("form reset"), ye = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), be = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function xe() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Se(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Ce() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var C = !1;
function we(e) {
	C = e;
}
var w;
function T(e) {
	if (e === null) throw Se(), n;
	return w = e;
}
function Te() {
	return T(/* @__PURE__ */ en(w));
}
function Ee(e) {
	if (C) {
		if (/* @__PURE__ */ en(w) !== null) throw Se(), n;
		w = e;
	}
}
function De(e = 1) {
	if (C) {
		for (var t = e, n = w; t--;) n = /* @__PURE__ */ en(n);
		w = n;
	}
}
function Oe(e = !0) {
	for (var t = 0, n = w;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ en(n);
		e && n.remove(), n = i;
	}
}
function ke(e) {
	if (!e || e.nodeType !== 8) throw Se(), n;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Ae(e) {
	return e === this.v;
}
function je(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Me(e) {
	return !je(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function Ne() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function Pe(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function Fe(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function Ie() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Le(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function Re() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ze(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function Be() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ve() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function He() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ue() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var E = null;
function We(e) {
	E = e;
}
function Ge(e, t = !1, n) {
	E = {
		p: E,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: H,
		l: null
	};
}
function Ke(e) {
	var t = E, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) hn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, E = t.p, qe(e);
}
function qe(e = {}) {
	return l(e, de, { value: !0 }), e;
}
function Je() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ye = [];
function Xe() {
	var e = Ye;
	Ye = [], _(e);
}
function Ze(e) {
	if (Ye.length === 0 && !Ct) {
		var t = Ye;
		queueMicrotask(() => {
			t === Ye && Xe();
		});
	}
	Ye.push(e);
}
function Qe() {
	for (; Ye.length > 0;) Xe();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var $e = ~(b | x | y);
function D(e, t) {
	e.f = e.f & $e | t;
}
function et(e) {
	e.f & 512 || e.deps === null ? D(e, y) : D(e, x);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function tt(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), D(e, y);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
var nt = !1;
function rt() {
	nt || (nt = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ve]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function it(e) {
	var t = z, n = H;
	V(null), Fn(null);
	try {
		return e();
	} finally {
		V(t), Fn(n);
	}
}
function at(e, t, n, r = n) {
	e.addEventListener(t, () => it(n));
	let i = e[ve];
	e[ve] = i ? () => {
		i(), r(!0);
	} : () => r(!0), rt();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function ot(e, t, n, r) {
	let i = Je() ? ut : mt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = H, c = st(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				I(e, s);
			}
			ct();
		}
	}
	var d = lt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ ft(e))).then(u).catch((e) => I(e, s)).finally(d);
	}
	l ? l.then(() => {
		s.f & 16384 ? d() : (c(), f(), ct());
	}) : f();
}
function st() {
	var e = H, t = z, n = E, r = O;
	return function(i = !0) {
		Fn(e), V(t), We(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ct(e = !0) {
	Fn(null), V(null), We(null), e && O?.deactivate();
}
function lt() {
	var e = H, t = e.b, n = O, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function ut(e) {
	var t = 2 | b;
	return H !== null && (H.f |= ie), {
		ctx: E,
		deps: null,
		effects: null,
		equals: Ae,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: r,
		wv: 0,
		parent: H,
		ac: null
	};
}
var dt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function ft(e, t, n) {
	let i = H;
	i === null && Ne();
	var a = void 0, o = zt(r), s = !z, c = /* @__PURE__ */ new Set();
	return vn(() => {
		var t = H, n = v();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ye && n.reject(e);
			}).finally(ct);
		} catch (e) {
			n.reject(e), ct();
		}
		var r = O;
		if (s) {
			if (t.f & 32768) var l = lt();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(dt);
			else for (let e of c.values()) e.reject(dt);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== dt && (r.activate(), t ? (o.f |= le, Ut(o, t)) : (o.f & 8388608 && (o.f ^= le), Ut(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), pn(() => {
		for (let e of c) e.reject(dt);
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
function pt(e) {
	let t = /* @__PURE__ */ ut(e);
	return Ln(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function mt(e) {
	let t = /* @__PURE__ */ ut(e);
	return t.equals = Me, t;
}
function ht(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) R(t[n]);
	}
}
function gt(e) {
	var t, n = H, i = e.parent;
	if (!Nn && i !== null && e.v !== r && i.f & 24576) return xe(), e.v;
	Fn(i);
	try {
		ht(e), t = Kn(e);
	} finally {
		Fn(n);
	}
	return t;
}
function _t(e) {
	var t = gt(e);
	!e.equals(t) && (e.wv = Un(), (!O?.is_fork || e.deps === null) && (O === null ? e.v = t : (O.capture(e, t, !0), xt?.capture(e, t, !0)), e.deps === null)) ? D(e, y) : Nn || (k === null ? et(e) : (fn() || O?.is_fork) && k.set(e, t));
}
function vt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && it(() => {
		t.ac.abort(ye), t.ac = null;
	}), t.fn !== null && (t.teardown = g), Yn(t, 0), Cn(t));
}
function yt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Xn(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var bt = null, O = null, xt = null, k = null, St = null, Ct = !1, wt = !1, Tt = null, Et = null, Dt = 0, Ot = 1, kt = class e {
	id = Ot++;
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
		bt === null ? bt = this : (bt.#n = this, this.#t = bt), bt = this;
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
			for (var r of n.d) D(r, b), t(r);
			for (r of n.m) D(r, x), t(r);
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
					t.f ^= y;
				}
			}
			n || e.push(t);
		}
		return this.#c = [], e;
	}
	#_() {
		this.#e = !0;
		for (let e of this.#u) this.#d.delete(e), D(e, b), this.schedule(e);
		for (let e of this.#d) D(e, x), this.schedule(e);
		this.apply();
		for (var t = Tt = [], n = [], r = Et = []; this.#c.length > 0;) {
			Dt++ > 1e3 && (this.#S(), jt());
			for (let e of this.#g()) try {
				this.#v(e, t, n);
			} catch (t) {
				throw It(e), this.#h() || this.discard(), t;
			}
		}
		if (O = null, r.length > 0) {
			var i = e.ensure();
			for (let e of r) i.schedule(e);
		}
		if (Tt = null, Et = null, this.#h()) {
			this.#x(n), this.#x(t);
			for (let [e, t] of this.#f) Ft(e, t);
			r.length > 0 && O.#_();
			return;
		}
		let a = this.#y();
		if (a) this.#x(n), this.#x(t), a.#b(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), xt = this, Nt(n), Nt(t), xt = null, this.#s?.resolve();
			var o = O;
			if (this.#a === 0 && (this.#c.length === 0 || o !== null) && this.#S(), this.#c.length > 0) {
				if (o !== null) {
					for (let e of this.#c) o.#c.push(e);
					this.#c = [];
				} else o = this;
			}
			o !== null && (A.clear(), o.#_());
		}
	}
	#v(e, t, n) {
		e.f ^= y;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= y : i & 4 ? t.push(r) : Wn(r) && (i & 16 && this.#d.add(r), Xn(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), D(i, b), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#S(), O = this, this.#_();
	}
	#x(e) {
		for (var t = 0; t < e.length; t += 1) tt(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== r && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), k?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		O = this;
	}
	deactivate() {
		O = null, k = null;
	}
	flush() {
		try {
			wt = !0, O = this, this.#_();
		} finally {
			Dt = 0, St = null, Tt = null, Et = null, wt = !1, O = null, k = null, A.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(dt);
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
		this.#m || (this.#m = !0, Ze(() => {
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
		return (this.#s ??= v()).promise;
	}
	static ensure() {
		if (O === null) {
			let t = O = new e();
			!wt && !Ct && Ze(() => {
				t.#e || t.flush();
			});
		}
		return O;
	}
	apply() {
		k = null;
	}
	schedule(e) {
		St = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768) ? e.b.defer_effect(e) : this.#c.push(e);
	}
	#S() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? bt = e : t.#t = e, this.linked = !1;
		}
	}
};
function At(e) {
	var t = Ct, n = xt;
	xt = null, Ct = !0;
	try {
		var r;
		for (e && (At(), r = e());;) {
			if (Qe(), O === null) return r;
			O.flush();
		}
	} finally {
		Ct = t, xt = n;
	}
}
function jt() {
	try {
		Re();
	} catch (e) {
		I(e, St);
	}
}
var Mt = null;
function Nt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Wn(r) && (Mt = /* @__PURE__ */ new Set(), Xn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && En(r), Mt?.size > 0)) {
				A.clear();
				for (let e of Mt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Mt.has(n) && (Mt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Xn(n);
					}
				}
				Mt.clear();
			}
		}
		Mt = null;
	}
}
function Pt(e) {
	O.schedule(e);
}
function Ft(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), D(e, y);
		for (var n = e.first; n !== null;) Ft(n, t), n = n.next;
	}
}
function It(e) {
	D(e, y);
	for (var t = e.first; t !== null;) It(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Lt = /* @__PURE__ */ new Set(), A = /* @__PURE__ */ new Map(), Rt = !1;
function zt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Ae,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function j(e, t) {
	let n = zt(e, t);
	return Ln(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Bt(e, t = !1, n = !0) {
	let r = zt(e);
	return t || (r.equals = Me), r;
}
function M(e, t, n = !1) {
	return z !== null && (!B || z.f & 131072) && Je() && z.f & 4325394 && (In === null || !In.has(e)) && He(), Ut(e, n ? qt(t) : t, Et);
}
var Vt = null, Ht = 0;
function Ut(e, t, n = null) {
	if (!e.equals(t)) {
		Nn ? A.set(e, t) : A.has(e) || A.set(e, e.v);
		var r = kt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && gt(t), k === null && et(t);
		}
		e.wv = Un(), Vt = null, Ht = 0, Kt(e, b, n), Vt = null, Je() && H !== null && H.f & 1024 && !(H.f & 96) && (G === null ? Rn([e]) : G.push(e)), !r.is_fork && Lt.size > 0 && !Rt && Wt();
	}
	return t;
}
function Wt() {
	Rt = !1;
	for (let e of Lt) {
		e.f & 1024 && D(e, x);
		let t;
		try {
			t = Wn(e);
		} catch {
			t = !0;
		}
		t && Xn(e);
	}
	Lt.clear();
}
function Gt(e) {
	M(e, e.v + 1);
}
function Kt(e, t, n) {
	var r = e.reactions;
	if (r !== null) {
		var i = Je(), a = r.length;
		if (Ht += a, Ht > 1e5 && Vt === null && (Vt = /* @__PURE__ */ new Set()), Vt !== null) {
			if (Vt.has(e)) return;
			Vt.add(e);
		}
		for (var o = 0; o < a; o++) {
			var s = r[o], c = s.f;
			if (i || s !== H) {
				var l = (c & b) === 0;
				if (l && D(s, t), c & 131072) Lt.add(s);
				else if (c & 2) {
					var u = s;
					k?.delete(u), Kt(u, x, n);
				} else if (l) {
					var d = s;
					c & 16 && Mt !== null && Mt.add(d), n === null ? Pt(d) : n.push(d);
				}
			}
		}
	}
}
function qt(e) {
	if (typeof e != "object" || !e || ue in e || de in e) return e;
	let t = m(e);
	if (t !== f && t !== p) return e;
	var n = /* @__PURE__ */ new Map(), i = a(e), o = /* @__PURE__ */ j(0), s = null, c = Vn, l = (e) => {
		if (Vn === c) return e();
		var t = z, n = Vn;
		V(null), Hn(c);
		var r = e();
		return V(t), Hn(n), r;
	};
	return i && n.set("length", /* @__PURE__ */ j(e.length, s)), new Proxy(e, {
		defineProperty(e, t, r) {
			(!("value" in r) || r.configurable === !1 || r.enumerable === !1 || r.writable === !1) && Be();
			var i = n.get(t);
			return i === void 0 ? l(() => {
				var e = /* @__PURE__ */ j(r.value, s);
				return n.set(t, e), e;
			}) : M(i, r.value, !0), !0;
		},
		deleteProperty(e, t) {
			var i = n.get(t);
			if (i === void 0) {
				if (t in e) {
					let e = l(() => /* @__PURE__ */ j(r, s));
					n.set(t, e), Gt(o);
				}
			} else M(i, r), Gt(o);
			return !0;
		},
		get(t, i, a) {
			if (i === ue) return e;
			var o = n.get(i), c = i in t;
			if (o === void 0 && (!c || u(t, i)?.writable) && (o = l(() => /* @__PURE__ */ j(qt(c ? t[i] : r), s)), n.set(i, o)), o !== void 0) {
				var d = K(o);
				return d === r ? void 0 : d;
			}
			return Reflect.get(t, i, a);
		},
		getOwnPropertyDescriptor(e, t) {
			this.has?.(e, t);
			var i = Reflect.getOwnPropertyDescriptor(e, t), a = n.get(t);
			if (a !== void 0) {
				var o = K(a);
				if (o === r) return;
				if (i && "value" in i) i.value = o;
				else return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return i;
		},
		has(e, t) {
			if (t === ue) return !0;
			var i = n.get(t), a = i !== void 0 && i.v !== r || Reflect.has(e, t);
			return (i !== void 0 || H !== null && (!a || u(e, t)?.writable)) && (i === void 0 && (i = l(() => /* @__PURE__ */ j(a ? qt(e[t]) : r, s)), n.set(t, i)), K(i) === r) ? !1 : a;
		},
		set(e, t, a, c) {
			var d = n.get(t), f = t in e;
			if (i && t === "length") for (var p = a; p < d.v; p += 1) {
				var m = n.get(p + "");
				m === void 0 ? p in e && (m = l(() => /* @__PURE__ */ j(r, s)), n.set(p + "", m)) : M(m, r);
			}
			if (d === void 0) (!f || u(e, t)?.writable) && (d = l(() => /* @__PURE__ */ j(void 0, s)), M(d, qt(a)), n.set(t, d));
			else {
				f = d.v !== r;
				var h = l(() => qt(a));
				M(d, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, t);
			if (g?.set && g.set.call(c, a), !f) {
				if (i && typeof t == "string") {
					var _ = n.get("length"), v = Number(t);
					Number.isInteger(v) && v >= _.v && M(_, v + 1);
				}
				Gt(o);
			}
			return !0;
		},
		ownKeys(e) {
			K(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = n.get(e);
				return t === void 0 || t.v !== r;
			});
			for (var [i, a] of n) a.v !== r && !(i in e) && t.push(i);
			return t;
		},
		setPrototypeOf() {
			Ve();
		}
	});
}
var Jt, Yt, Xt, Zt;
function Qt() {
	if (Jt === void 0) {
		Jt = window, Yt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Xt = u(t, "firstChild").get, Zt = u(t, "nextSibling").get, h(e) && (e[he] = void 0, e[me] = null, e[ge] = void 0, e.__e = void 0), h(n) && (n[_e] = void 0);
	}
}
function N(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function $t(e) {
	return Xt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function en(e) {
	return Zt.call(e);
}
function tn(e, t) {
	if (!C) return /* @__PURE__ */ $t(e);
	var n = /* @__PURE__ */ $t(w);
	if (n === null) n = w.appendChild(N());
	else if (t && n.nodeType !== 3) {
		var r = N();
		return n?.before(r), T(r), r;
	}
	return t && sn(n), T(n), n;
}
function nn(e, t = !1) {
	if (!C) {
		var n = /* @__PURE__ */ $t(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ en(n) : n;
	}
	if (t) {
		if (w?.nodeType !== 3) {
			var r = N();
			return w?.before(r), T(r), r;
		}
		sn(w);
	}
	return w;
}
function P(e, t = !1) {
	if (!C) return /* @__PURE__ */ $t(e);
	var n = tn(e, t);
	return Ee(e), n;
}
function F(e, t = 1, n = !1) {
	let r = C ? w : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ en(r);
	if (!C) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = N();
			return r === null ? i?.after(a) : r.before(a), T(a), a;
		}
		sn(r);
	}
	return T(r), r;
}
function rn(e) {
	e.textContent = "";
}
function an() {
	return !1;
}
function on(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function sn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
function cn(e) {
	var t = H;
	if (t === null) return z.f |= le, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	I(e, t);
}
function I(e, t) {
	if (e === n) throw e;
	if (!(t !== null && t.f & 16384)) {
		for (; t !== null;) {
			if (t.f & 128 && !(t.f & 33570816)) {
				if (!(t.f & 32768)) throw e;
				try {
					t.b.error(e);
					return;
				} catch (t) {
					e = t;
				}
			}
			t = t.parent;
		}
		throw e;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function ln(e) {
	H === null && (z === null && Le(e), Ie()), Nn && Fe(e);
}
function un(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function dn(e, t) {
	var n = H;
	n !== null && n.f & 8192 && (e |= S);
	var r = {
		ctx: E,
		deps: null,
		nodes: null,
		f: e | b | 512,
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
	O?.register_created_effect(r);
	var i = r;
	if (e & 4) Tt === null ? kt.ensure().schedule(r) : Tt.push(r);
	else if (t !== null) {
		try {
			Xn(r);
		} catch (e) {
			throw R(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= re));
	}
	if (i !== null && (i.parent = n, n !== null && un(i, n), z !== null && z.f & 2 && !(e & 64))) {
		var a = z;
		(a.effects ??= []).push(i);
	}
	return r;
}
function fn() {
	return z !== null && !B;
}
function pn(e) {
	let t = dn(8, null);
	return D(t, y), t.teardown = e, t;
}
function mn(e) {
	ln("$effect");
	var t = H.f;
	if (!z && t & 32 && E !== null && !E.i) {
		var n = E;
		(n.e ??= []).push(e);
	} else return hn(e);
}
function hn(e) {
	return dn(4 | ae, e);
}
function gn(e) {
	kt.ensure();
	let t = dn(64 | ie, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Dn(t, () => {
			R(t), n(void 0);
		}) : (R(t), n(void 0));
	});
}
function _n(e) {
	return dn(4, e);
}
function vn(e) {
	return dn(ce | ie, e);
}
function yn(e, t = 0) {
	return dn(8 | t, e);
}
function bn(e, t = [], n = [], r = []) {
	ot(r, t, n, (t) => {
		dn(8, () => {
			e(...t.map(K));
		});
	});
}
function xn(e, t = 0) {
	return dn(16 | t, e);
}
function L(e) {
	return dn(32 | ie, e);
}
function Sn(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = Nn, r = z;
		Pn(!0), V(null);
		try {
			t.call(null);
		} catch (t) {
			I(t, e.parent);
		} finally {
			Pn(n), V(r);
		}
	}
}
function Cn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && it(() => {
			e.abort(ye);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : R(n, t), n = r;
	}
}
function wn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || R(t), t = n;
	}
}
function R(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Tn(e.nodes.start, e.nodes.end), n = !0), e.f |= ne, Cn(e, t && !n), Yn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Sn(e), e.f ^= ne, e.f |= ee;
	var i = e.parent;
	i !== null && i.first !== null && En(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Tn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ en(e);
		e.remove(), e = n;
	}
}
function En(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Dn(e, t, n = !0) {
	var r = [];
	e.f |= 256, On(e, r, !0);
	var i = () => {
		n && R(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function On(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= S;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				On(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function kn(e) {
	e.f &= -257, An(e, !0);
}
function An(e, t) {
	if (!(e.f & 256) && e.f & 8192) {
		e.f ^= S, e.f & 1024 || (D(e, b), kt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			An(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function jn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ en(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Mn = null, Nn = !1;
function Pn(e) {
	Nn = e;
}
var z = null, B = !1;
function V(e) {
	z = e;
}
var H = null;
function Fn(e) {
	H = e;
}
var In = null;
function Ln(e) {
	z !== null && (z.f & 2097152 || z.f & 2) && (In ??= /* @__PURE__ */ new Set()).add(e);
}
var U = null, W = 0, G = null;
function Rn(e) {
	G = e;
}
var zn = 1, Bn = 0, Vn = Bn;
function Hn(e) {
	Vn = e;
}
function Un() {
	return ++zn;
}
function Wn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Wn(a) && _t(a), a.wv > e.wv) return !0;
		}
		t & 512 && k === null && D(e, y);
	}
	return !1;
}
function Gn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(In !== null && In.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Gn(a, t, !1) : t === a && (n ? D(a, b) : a.f & 1024 && D(a, x), Pt(a));
	}
}
function Kn(e) {
	var t = U, n = W, r = G, i = z, a = In, o = E, s = B, c = Vn, l = e.f;
	U = null, W = 0, G = null, z = l & 96 ? null : e, In = null, We(e.ctx), B = !1, Vn = ++Bn, e.ac !== null && (it(() => {
		e.ac.abort(ye);
	}), e.ac = null);
	try {
		e.f |= se;
		var u = e.fn, d = u();
		e.f |= te;
		var f = qn(e);
		if (Je() && G !== null && !B && f !== null && !(e.f & 6146)) for (var p = 0; p < G.length; p++) Gn(G[p], e);
		if (i !== null && i !== e) {
			if (Bn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Bn;
			if (t !== null) for (let e of t) e.rv = Bn;
			G !== null && (r === null ? r = G : r.push(...G));
		}
		return e.f & 8388608 && (e.f ^= le), d;
	} catch (t) {
		return qn(e), cn(t);
	} finally {
		e.f ^= se, U = t, W = n, G = r, z = i, In = a, We(o), B = s, Vn = c;
	}
}
function qn(e) {
	var t = e.deps, n = O?.is_fork;
	if (U !== null) {
		var r;
		if (n || Yn(e, W), t !== null && W > 0) for (t.length = W + U.length, r = 0; r < U.length; r++) t[W + r] = U[r];
		else e.deps = t = U;
		if (fn() && e.f & 512) for (r = W; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && W < t.length && (Yn(e, W), t.length = W);
	return t;
}
function Jn(e, t) {
	let n = t.reactions;
	if (n !== null) {
		var i = o.call(n, e);
		if (i !== -1) {
			var a = n.length - 1;
			a === 0 ? n = t.reactions = null : (n[i] = n[a], n.pop());
		}
	}
	if (n === null && t.f & 2 && (U === null || !s.call(U, t))) {
		var c = t;
		c.f & 512 && (c.f ^= 512), c.v !== r && et(c), c.ac !== null && it(() => {
			c.ac.abort(ye), c.ac = null, D(c, b);
		}), vt(c), Yn(c, 0);
	}
}
function Yn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Jn(e, n[r]);
}
function Xn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		D(e, y);
		var n = H;
		H = e;
		try {
			t & 16777232 ? wn(e) : Cn(e), Sn(e);
			var r = Kn(e);
			e.teardown = typeof r == "function" ? r : null, e.wv = zn;
		} finally {
			H = n;
		}
	}
}
async function Zn() {
	await Promise.resolve(), At();
}
function K(e) {
	var t = !!(e.f & 2);
	if (Mn?.add(e), z !== null && !B && !(H !== null && H.f & 16384) && (In === null || !In.has(e))) {
		var n = z.deps;
		if (z.f & 2097152) e.rv < Bn && (e.rv = Bn, U === null && n !== null && n[W] === e ? W++ : U === null ? U = [e] : U.push(e));
		else {
			z.deps ??= [], s.call(z.deps, e) || z.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [z] : s.call(r, z) || r.push(z);
		}
	}
	if (Nn && A.has(e)) return A.get(e);
	if (t) {
		var i = e;
		if (Nn) {
			var a = i.v;
			return (!(i.f & 1024) && i.reactions !== null || $n(i)) && (a = gt(i)), A.set(i, a), a;
		}
		var o = !(i.f & 512) && !B && z !== null && !!(z.f & 512), c = (i.f & te) === 0;
		Wn(i) && (o && (i.f |= 512), _t(i)), o && !c && (yt(i), Qn(i));
	}
	if (k?.has(e)) return k.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Qn(e) {
	if (e.f |= 512, e.deps !== null) for (let n of e.deps) {
		var t = n.reactions;
		t === null ? n.reactions = [e] : s.call(t, e) || t.push(e), n.f & 2 && !(n.f & 512) && (yt(n), Qn(n));
	}
}
function $n(e) {
	if (e.v === r) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (A.has(t) || t.f & 2 && $n(t)) return !0;
	return !1;
}
function er(e) {
	var t = B;
	try {
		return B = !0, e();
	} finally {
		B = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var tr = Symbol("events"), nr = /* @__PURE__ */ new Set(), rr = /* @__PURE__ */ new Set(), ir = null, ar = !1;
function or(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	ir = e, ar || (ar = !0, setTimeout(() => {
		ar = !1, ir = null;
	}));
	var o = 0, s = ir === e && e[tr];
	if (s) {
		var c = i.indexOf(s);
		if (c !== -1 && (t === document || t === window)) {
			e[tr] = t;
			return;
		}
		var u = i.indexOf(t);
		if (u === -1) return;
		c <= u && (o = c);
	}
	if (a = i[o] || e.target, a !== t) {
		l(e, "currentTarget", {
			configurable: !0,
			get() {
				return a || n;
			}
		});
		var d = z, f = H;
		V(null), Fn(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[tr]?.[r];
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
			e[tr] = t, delete e.currentTarget, V(d), Fn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var sr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function cr(e) {
	return sr?.createHTML(e) ?? e;
}
function lr(e) {
	var t = on("template");
	return t.innerHTML = cr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function ur(e, t) {
	var n = H;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function q(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (C) return ur(w, null), w;
		i === void 0 && (i = lr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ $t(i)));
		var t = r || Yt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ $t(t), s = t.lastChild;
			ur(o, s);
		} else ur(t, t);
		return t;
	};
}
function J(e, t) {
	if (C) {
		var n = H;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = w), Te();
	} else e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var dr = ["touchstart", "touchmove"];
function fr(e) {
	return dr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function pr(e) {
	let t = 0, n = zt(0), r;
	return () => {
		fn() && (K(n), yn(() => (t === 0 && (r = er(() => e(() => Gt(n)))), t += 1, () => {
			Ze(() => {
				--t, t === 0 && (r?.(), r = void 0, Gt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var mr = re | ie;
function hr(e, t, n, r) {
	new gr(e, t, n, r);
}
var gr = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = C ? w : null;
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
	#h = pr(() => (this.#m = zt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = H;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = H.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = xn(() => {
			if (C) {
				let e = ke(this.#t);
				Te();
				let t = e === "[!";
				if (e.startsWith("[?")) {
					let t = JSON.parse(e.slice(2));
					this.#_(t);
				} else t ? this.#b() : this.#g();
			} else this.#x();
		}, mr), C && (this.#e = w);
	}
	#g() {
		try {
			this.#a = L(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Ze(r), t && (this.#s = L(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			this.#y() || (t ? Ce() : (t = !0, n && Ue(), this.#s !== null && Dn(this.#s, () => {
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
					I(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		return (this.#i.f & (ee | ne)) !== 0;
	}
	#b() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = L(() => e(this.#e)), Ze(() => {
			if (!this.#y()) {
				var e = this.#c = document.createDocumentFragment(), t = N(), n = !1;
				e.append(t), this.#a = this.#C(() => {
					try {
						return L(() => this.#r(t));
					} catch (e) {
						try {
							this.error(e), n = !0;
						} catch (e) {
							I(e, this.#i.parent);
						}
						return null;
					}
				}), this.#a === null ? (this.#c = null, n && this.#S(O)) : this.#u === 0 && (this.#e.before(e), this.#c = null, Dn(this.#o, () => {
					this.#o = null;
				}), this.#S(O));
			}
		}));
	}
	#x() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = L(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				jn(this.#a, e);
				let t = this.#n.pending;
				this.#o = L(() => t(this.#e));
			} else this.#S(O);
		} catch (e) {
			this.error(e);
		}
	}
	#S(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		tt(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#C(e) {
		var t = H, n = z, r = E;
		Fn(this.#i), V(this.#i), We(this.#i.ctx);
		try {
			return kt.ensure(), e();
		} finally {
			Fn(t), V(n), We(r);
		}
	}
	#w(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#S(t), this.#o && Dn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#w(e, t);
	}
	update_pending_count(e, t) {
		this.#w(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ze(() => {
			this.#d = !1, this.#m && Ut(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), K(this.#m);
	}
	error(e) {
		if (e === n || !this.#n.onerror && !this.#n.failed) throw e;
		O?.is_fork ? (this.#a && O.skip_effect(this.#a), this.#o && O.skip_effect(this.#o), this.#s && O.skip_effect(this.#s), O.oncommit(() => {
			this.#y() || this.#T(e);
		})) : this.#T(e);
	}
	#T(e) {
		this.#a &&= (R(this.#a), null), this.#o &&= (R(this.#o), null), this.#s &&= (R(this.#s), null), C && (T(this.#t), De(), T(Oe()));
		let t = this.#n.failed, n = (e) => {
			if (this.#y()) return;
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && !this.#y() && (this.#s = this.#C(() => {
				try {
					return L(() => {
						var r = H;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return I(e, this.#i.parent), null;
				}
			}));
		};
		Ze(() => {
			if (!this.#y()) {
				var t;
				try {
					t = this.transform_error(e);
				} catch (e) {
					I(e, this.#i && this.#i.parent);
					return;
				}
				typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => I(e, this.#i && this.#i.parent)) : n(t);
			}
		});
	}
};
function Y(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[_e] ??= e.nodeValue) && (e[_e] = n, e.nodeValue = `${n}`);
}
function _r(e, t) {
	return yr(e, t);
}
var vr = /* @__PURE__ */ new Map();
function yr(e, { target: t, anchor: r, props: i = {}, events: a, context: o, intro: s = !0, transformError: l }) {
	Qt();
	var u = void 0, d = gn(() => {
		var s = r ?? t.appendChild(N());
		hr(s, { pending: () => {} }, (t) => {
			Ge({});
			var r = E;
			if (o && (r.c = o), a && (i.$$events = a), C && ur(t, null), u = e(t, i) || qe(), C && (H.nodes.end = w, w === null || w.nodeType !== 8 || w.data !== "]")) throw Se(), n;
			Ke();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!d.has(r)) {
					d.add(r);
					var i = fr(r);
					for (let e of [t, document]) {
						var a = vr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), vr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, or, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(c(nr)), rr.add(f), () => {
			for (var e of d) for (let r of [t, document]) {
				var n = vr.get(r), i = n.get(e);
				--i == 0 ? (r.removeEventListener(e, or), n.delete(e), n.size === 0 && vr.delete(r)) : n.set(e, i);
			}
			rr.delete(f), s !== r && s.parentNode?.removeChild(s);
		};
	});
	return br.set(u, d), u;
}
var br = /* @__PURE__ */ new WeakMap(), xr = class {
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
			if (n) kn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (kn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (R(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						jn(r, t), t.append(N()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else R(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Dn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (R(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = O, r = an();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = N();
				i.append(a), this.#n.set(e, {
					effect: L(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, L(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else C && (this.anchor = w), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function Sr(e, t, ...n) {
	var r = new xr(e);
	xn(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, re);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function Cr(e, t, n = !1) {
	var r;
	C && (r = w, Te());
	var i = new xr(e), a = n ? re : 0;
	function o(e, t) {
		if (C) {
			var n = ke(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Oe();
				T(a), i.anchor = a, we(!1), i.ensure(e, t), we(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	xn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function wr(e, t, n) {
	for (var r = [], i = t.length, a, o = t.length, s = 0; s < i; s++) {
		let n = t[s];
		Dn(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					Tr(e, c(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --o;
		}, !1);
	}
	if (o === 0) {
		var l = r.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			rn(d), d.append(u), e.items.clear();
		}
		Tr(e, t, !l);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function Tr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= oe, jn(a, document.createDocumentFragment())) : R(t[i], n);
	}
}
var Er;
function Dr(e, t, n, r, i, o = null) {
	var s = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		s = C ? T(/* @__PURE__ */ $t(u)) : u.appendChild(N());
	}
	C && Te();
	var d = null, f = /* @__PURE__ */ mt(() => {
		var e = n();
		return a(e) ? e : e == null ? [] : c(e);
	}), p = /* @__PURE__ */ new Map(), m = !0;
	function h(e) {
		if (!(_.effect.f & 16384)) {
			_.pending.delete(e);
			var n = K(f);
			_.fallback = d, kr(_, n, s, t, r), d !== null && (n.length === 0 ? d.f & 33554432 ? (d.f ^= oe, jr(d, null, s)) : kn(d) : Dn(d, () => {
				d = null;
			}));
		}
	}
	function g(e) {
		_.pending.delete(e);
	}
	var _ = {
		effect: xn(() => {
			var e = K(f), a = e.length;
			let c = !1;
			C && ke(s) === "[!" != (a === 0) && (s = Oe(), T(s), we(!1), c = !0);
			for (var u = /* @__PURE__ */ new Set(), _ = O, v = an(), y = 0; y < a; y += 1) {
				C && w.nodeType === 8 && w.data === "]" && (s = w, c = !0, we(!1));
				var b = e[y], x = r(b, y), S = m ? null : l.get(x);
				S ? (S.v && Ut(S.v, b), S.i && Ut(S.i, y), v && _.unskip_effect(S.e)) : (S = Ar(l, m ? s : Er ??= N(), b, x, y, i, t, n), m || (S.e.f |= oe), l.set(x, S)), u.add(x);
			}
			if (a === 0 && o && !d && (m ? d = L(() => o(s)) : (d = L(() => o(Er ??= N())), d.f |= oe)), a > u.size && Pe("", "", ""), C && a > 0 && T(Oe()), !m) {
				if (p.set(_, u), v) {
					for (let [e, t] of l) u.has(e) || _.skip_effect(t.e);
					_.oncommit(h), _.ondiscard(g);
				} else h(_);
			}
			c && we(!0), K(f);
		}),
		flags: t,
		items: l,
		pending: p,
		outrogroups: null,
		fallback: d
	};
	m = !1, C && (s = w);
}
function Or(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function kr(e, t, n, r, i) {
	var a = !!(r & 8), o = t.length, s = e.items, l = Or(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (a) for (v = 0; v < o; v += 1) h = t[v], g = i(h, v), _ = s.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < o; v += 1) {
		if (h = t[v], g = i(h, v), _ = s.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (kn(_), a && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= oe, _ === l) jr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Mr(e, d, _), Mr(e, _, y), jr(_, y, n), d = _, p = [], m = [], l = Or(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], ee = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) jr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Mr(e, S.prev, ee.next), Mr(e, d, S), Mr(e, ee, b), l = b, d = ee, --v, p = [], m = [];
				} else u.delete(_), jr(_, l, n), Mr(e, _.prev, _.next), Mr(e, _, d === null ? e.effect.first : d.next), Mr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Or(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Or(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Tr(e, c(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var te = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || te.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && te.push(l), l = Or(l.next);
		var ne = te.length;
		if (ne > 0) {
			var re = r & 4 && o === 0 ? n : null;
			if (a) {
				for (v = 0; v < ne; v += 1) te[v].nodes?.a?.measure();
				for (v = 0; v < ne; v += 1) te[v].nodes?.a?.fix();
			}
			wr(e, te, re);
		}
	}
	a && Ze(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Ar(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? zt(n) : /* @__PURE__ */ Bt(n, !1, !1) : null, l = o & 2 ? zt(i) : null;
	return {
		v: c,
		i: l,
		e: L(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function jr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ en(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Mr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/css.js
function Nr(e, t) {
	_n(() => {
		e = H?.parent?.nodes?.start ?? e;
		var n = e.getRootNode(), r = n.host ? n : n.head ?? n.ownerDocument.head;
		if (!r.querySelector("#" + t.hash)) {
			let e = on("style");
			e.id = t.hash, e.textContent = t.code, r.appendChild(e);
		}
	});
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
var Pr = [..." 	\n\r\f\xA0\v﻿"];
function Fr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Pr.includes(r[o - 1])) && (s === r.length || Pr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Ir(e, t, n, r, i, a) {
	var o = e[he];
	if (C || o !== n || o === void 0) {
		var s = Fr(n, r, a);
		(!C || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[he] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var Lr = Symbol("is custom element"), Rr = Symbol("is html"), zr = be ? "link" : "LINK";
function Br(e) {
	if (C) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					Vr(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					Vr(e, "checked", null), e.checked = r;
				}
			}
		};
		e[ve] = n, Ze(n), rt();
	}
}
function Vr(e, t, n, r) {
	var i = Hr(e);
	C && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === zr) || i[t] !== (i[t] = n) && (t === "loading" && (e[pe] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Wr(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function Hr(e) {
	return e[me] ??= {
		[Lr]: e.nodeName.includes("-"),
		[Rr]: e.namespaceURI === i
	};
}
var Ur = /* @__PURE__ */ new Map();
function Wr(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Ur.get(t);
	if (n) return n;
	Ur.set(t, n = /* @__PURE__ */ new Set());
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = d(i), r) r[o].set && o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.add(o);
		i = m(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function Gr(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	at(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Kr(e) ? qr(a) : a, n(a), O !== null && r.add(O), await Zn(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (C && e.defaultValue !== e.value || er(t) == null && e.value) && (n(Kr(e) ? qr(e.value) : e.value), O !== null && r.add(O)), yn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = O;
			if (r.has(i)) return;
		}
		Kr(e) && n === qr(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function Kr(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function qr(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var Jr = !1;
function Yr(e) {
	var t = Jr;
	try {
		return Jr = !1, [e(), Jr];
	} finally {
		Jr = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function Xr(e, t, n, r) {
	var i = !0, a = !!(n & 8), o = !!(n & 16), s = r, c = !0, l = void 0, d = () => o && i ? (l ??= /* @__PURE__ */ ut(r), K(l)) : (c && (c = !1, s = o ? er(r) : r), s);
	let f;
	if (a) {
		var p = ue in e || fe in e;
		f = u(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = Yr(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ze(t), f(m)));
	var g = i ? () => {
		var n = e[t];
		return n === void 0 ? d() : (c = !0, n);
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
	var v = !1, y = (n & 1 ? ut : mt)(() => (v = !1, g()));
	a && K(y);
	var b = H;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? K(y) : i && a ? qt(e) : e;
			return M(y, n), v = !0, s !== void 0 && (s = n), e;
		}
		return Nn && v || b.f & 16384 ? y.v : K(y);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
var X = {
	userAgent: "joblist.today (+https://joblist.today/llms.txt)",
	name: "joblist",
	url: "https://joblist.today",
	source: "https://github.com/joblisttoday/joblist-atproto",
	shareImage: {
		path: "/og.png",
		width: 1200,
		height: 630
	},
	collections: {
		company: "today.joblist.company",
		job: "today.joblist.job"
	},
	bots: ["did:plc:jqaucxlucukeif3bltpuc7zx"],
	lexicons: {
		dir: "lexicons",
		did: "did:plc:jqaucxlucukeif3bltpuc7zx",
		permissionSet: "today.joblist.authFull"
	},
	services: {
		relay: "https://relay1.us-east.bsky.network",
		relayFallbacks: ["https://relay1.us-west.bsky.network"],
		appview: "https://public.api.bsky.app",
		plc: "https://plc.directory",
		handleResolver: "https://public.api.bsky.app",
		placeSearch: "https://photon.komoot.io/api/"
	},
	layout: {
		wide: "(min-width: 64rem)",
		dragThreshold: 6,
		finePointer: "(hover: hover) and (pointer: fine)",
		sheetPeekBelow: .3,
		sheetFullAbove: .72,
		copiedMs: 3e3,
		bare: ["/jobs", "/companies"],
		explore: ["/jobs", "/companies"],
		searchInPage: ["/", "/me/organizations"]
	},
	map: {
		style: "https://tiles.openfreemap.org/styles/positron",
		styleDark: "https://tiles.openfreemap.org/styles/dark",
		projection: "globe",
		clusterRadius: 40,
		clusterMaxZoom: 13,
		nearZoom: 11,
		selectZoom: 12,
		globeSizePx: 320,
		globeMinZoom: 1,
		globeCenter: [10, 30],
		globeSpan: 90,
		frameDelayMs: 600,
		loadWaitMs: 3e3,
		center: [13.405, 52.52],
		zoom: 2,
		maxZoom: 13,
		padding: 40,
		pointRadius: 6,
		pointStroke: 2,
		popupMax: 8,
		placeMax: 500,
		focus: {
			cellDeg: .5,
			km: 40,
			share: .5
		},
		font: ["Noto Sans Regular"],
		hitRadius: 22,
		areaMinZoom: 4
	},
	limits: {
		concurrency: 6,
		jobsConcurrency: 6,
		liveBoards: 20,
		pagesPerRepo: 100,
		indexerConcurrency: 8,
		boardPageSize: 100,
		jobsPerBoard: 2e3,
		perAccount: {
			company: 200,
			job: 50
		},
		boardsPerAccount: 100,
		boards: 3e3
	},
	locales: [
		"en",
		"fr",
		"de",
		"es"
	],
	defaultLocale: "en",
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
	hostedHandles: [".bsky.social"],
	embed: {
		dir: "companies",
		page: "/embed",
		scripts: "/embed/",
		shown: 20
	},
	quickSearch: {
		places: 2e3,
		shown: {
			fields: 2,
			cities: 2,
			companies: 4,
			tags: 2,
			places: 3
		}
	},
	bluesky: {
		file: "bluesky.json",
		concurrency: 12
	},
	handles: {
		dns: "https://cloudflare-dns.com/dns-query",
		timeoutMs: 8e3,
		concurrency: 12
	},
	workplaces: {
		file: "workplaces.json",
		perRun: 1500,
		concurrency: 2
	},
	ledger: {
		file: "offers.json",
		keepDays: 30
	},
	versions: {
		file: "versions.json",
		newAccountDays: 7
	},
	jobs: {
		pageSize: 50,
		companySearchFrom: 10,
		spread: 2,
		olderDays: 90,
		placesSuggested: 30,
		prepareChunk: 500,
		prepareWaitMs: 5e3,
		placesShown: 3,
		nearbyShown: 5,
		typingDelayMs: 200,
		notJobs: [
			"general application",
			"open application",
			"spontaneous application",
			"unsolicited application",
			"initiativbewerbung",
			"blindbewerbung",
			"candidature spontan[ée]e",
			"talent (pool|community|network)"
		],
		jobParam: "job",
		remoteWords: [
			"remote",
			"anywhere",
			"home office",
			"homeoffice",
			"work from home",
			"wfh",
			"distributed",
			"télétravail",
			"teletravail",
			"fernarbeit",
			"mobiles arbeiten"
		],
		hybridWords: ["hybrid", "hybride"],
		onsiteWords: [
			"on-site",
			"onsite",
			"on site",
			"in-office",
			"in office",
			"office-based",
			"office based",
			"in-person",
			"in person",
			"sur site",
			"vor ort"
		]
	},
	companies: { pageSize: 100 },
	companyForm: {
		kinds: [
			"company",
			"cooperative",
			"nonprofit",
			"collective",
			"project",
			"public"
		],
		foldAt: 320,
		nameMax: 100,
		descriptionMax: 3e3,
		tagsMax: 20,
		tagMax: 64,
		linksMax: 20,
		tagSuggestions: 8,
		boardCheckDelayMs: 600
	},
	saveSignIn: { returnMinutes: 30 },
	me: { glance: 3 },
	kept: {
		max: 500,
		namesShown: 5
	},
	jobCollections: {
		file: "joblist-collections.json",
		fileMaxBytes: 5e6,
		max: 100,
		jobsMax: 5e3,
		idMax: 40,
		nameMax: 80,
		titleMax: 300,
		companyMax: 200,
		urlMax: 2e3,
		keyMax: 2500
	},
	landing: {
		dir: "landing",
		shown: 50,
		linked: 20,
		pages: 10,
		minJobs: {
			city: 20,
			field: 20,
			cityField: 10
		},
		cityAliases: {
			nyc: "new-york",
			"new-york-city": "new-york",
			bangalore: "bengaluru",
			munchen: "munich",
			koln: "cologne",
			wien: "vienna",
			"ho-chi-minh-city": "ho-chi-minh",
			sf: "san-francisco",
			"washington-dc": "washington",
			"washington-d-c": "washington",
			gurgaon: "gurugram",
			bombay: "mumbai"
		},
		slugMax: 60,
		cacheSeconds: 1800,
		snapshotCacheSeconds: 900,
		missingCacheSeconds: 300,
		sitemap: "/sitemap-places.xml"
	},
	searchFeed: {
		path: "/feed/search.xml",
		file: "landing/recent.json",
		hours: 24,
		rows: 1e3,
		maxLength: 100
	},
	stats: {
		file: "stats.json",
		weeks: 104,
		cities: 20,
		weekCityMin: 3,
		minSample: 20,
		shownWeeks: 26
	},
	bot: {
		minHours: 160,
		tag: "joblistweekly",
		shown: 3
	},
	links: {
		signup: "https://bsky.app",
		profile: "https://bsky.app/profile/{handle}",
		handleHelp: "https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial"
	},
	analytics: {
		script: "/vendor/umami.js",
		hostUrl: "https://gateway.umami.is",
		websiteId: "479fa5c4-e9c9-4d8d-85c6-9a88c886dd24",
		domains: "joblist.today"
	},
	geocode: {
		service: "https://nominatim.openstreetmap.org/search",
		delayMs: 1100,
		officeBudget: 300,
		officeCategories: ["office"],
		officeMaxKm: 50,
		budget: 1100,
		tooWide: [
			"continent",
			"country",
			"state",
			"region",
			"province",
			"state_district",
			"county"
		],
		cityCountries: [
			"singapore",
			"hong kong",
			"luxembourg",
			"monaco",
			"macao",
			"vatican city",
			"gibraltar"
		],
		countryWords: [
			"usa",
			"us",
			"uk",
			"uae",
			"united states of america",
			"europe",
			"asia",
			"africa",
			"north america",
			"south america",
			"latin america"
		],
		cityRegions: [
			"JP-13",
			"CN-SH",
			"CN-BJ",
			"CN-TJ",
			"CN-CQ"
		],
		countryAliases: {
			uk: "gb",
			usa: "us",
			"united states": "us",
			uae: "ae"
		},
		placesFile: "places-2.json",
		officesFile: "offices.json",
		ignoreWords: /* @__PURE__ */ "hybrid.on-site.onsite.on site.office.headquarters.hq.multiple locations.various locations.flexible.friendly.travel required.jobs?.global.worldwide.international.distributed.emea.apac.latam.americas.amer.namer.nordics.dach.benelux".split(".")
	},
	travel: {
		kmPerHour: {
			walk: 5,
			bike: 15
		},
		mode: "bike",
		detour: 1.3,
		bandMinutes: 5,
		minutes: [
			15,
			30,
			45,
			60
		]
	},
	cache: { writeDelayMs: 400 },
	outbox: { retryMs: 3e4 },
	serviceWorker: {
		snapshotWaitMs: 4e3,
		snapshotFilesKept: 400
	},
	snapshot: {
		path: "https://raw.githubusercontent.com/joblisttoday/joblist-snapshot/gh-pages",
		everyHours: 6,
		companyFiles: 40,
		maxAgeHours: 48,
		prerenderFiles: [
			"records.json",
			"jobs.json",
			"meta.json",
			"bluesky.json",
			"landing/index.json"
		],
		preload: {
			page: ["records.json"],
			counts: ["records.json", "counts.json"],
			company: ["records.json"],
			explore: [
				"first.json",
				"records.json",
				"jobs.json"
			]
		},
		refreshDelayMs: 15e3
	},
	crawler: {
		service: "https://bsky.social",
		maxWritesPerRun: 200,
		maxNewCompaniesPerRun: 25,
		batchSize: 50,
		pauseSeconds: 10,
		concurrency: 8,
		out: "static/snapshot/crawl",
		openJobs: "https://raw.githubusercontent.com/elliottdehn/open-jobs/a6bb3ab9a96d87d02e4369cb97f55a8399e2d965/slugs.json",
		search: {
			service: "https://api.bsky.app",
			queries: [
				"we're hiring",
				"we are hiring",
				"#hiring",
				"join our team",
				"open roles",
				"now hiring",
				"job opening",
				"come work with us"
			],
			pages: 5
		},
		bluesky: {
			queries: [
				"careers",
				"jobs",
				"hiring",
				"join our team",
				"open roles"
			],
			pages: 1,
			followersOf: ["joblist.today"],
			followerPages: 3,
			maxAccounts: 40,
			maxConnect: 30,
			concurrency: 4
		}
	},
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
		],
		status: [
			"open",
			"filled",
			"closed"
		],
		schemaEmployment: {
			"full-time": "FULL_TIME",
			"part-time": "PART_TIME",
			contract: "CONTRACTOR",
			internship: "INTERN",
			volunteer: "VOLUNTEER"
		}
	}
}, Zr = {
	snapshot: "https://raw.githubusercontent.com/joblisttoday/joblist-snapshot/gh-pages",
	dir: "companies",
	site: "https://joblist.today",
	shown: 20,
	strings: {
		en: {
			"embed.title": "Open jobs at {name}",
			"embed.count": "{count} open jobs",
			"embed.count.one": "1 open job",
			"embed.none": "No open jobs right now.",
			"embed.more": "See all {count}",
			"embed.by": "on joblist",
			"embed.error": "The jobs could not be read.",
			"embed.search": "Search these jobs",
			"embed.page": "As your own jobs page",
			"embed.page.intro": "A whole page to put at jobs.your-domain or your-domain/jobs, on any static host (GitHub Pages, Cloudflare Pages, your server). Change query, where or remote to show only some jobs.",
			"embed.section": "Show these jobs on your site",
			"embed.intro": "Paste one of these in your website: the list stays up to date by itself.",
			"embed.iframe": "As a frame (any site)",
			"embed.element": "As an element (styled by your site)",
			"embed.copy": "Copy",
			"embed.copied": "Copied",
			"job.distance.bike": "{minutes} min · {km} km",
			"job.distance.walk": "{minutes} min · {km} km",
			"job.where": "Where",
			"job.company.more": "{count} open jobs at {name}",
			"job.company.more.one": "1 open job at {name}",
			"job.company.one": "The only open job at {name}",
			"job.new": "New",
			"job.older": "Open for a while",
			"job.older.hint": "First seen more than {days} days ago: it may already be filled.",
			"job.places.more": "and {count} more places",
			"job.places.more.one": "and 1 more place",
			"job.verified": "posted by the organization",
			"job.sharedBy": "shared by",
			"job.notFromCompany": "Not from {company}: {company} posts its own offers here, and this one was shared by someone else. To apply, go to {company}'s own website.",
			"job.remote.onsite": "On site",
			"job.remote.hybrid": "Hybrid",
			"job.remote.remote": "Remote",
			"job.salary.year": "{amount} a year",
			"job.salary.month": "{amount} a month",
			"job.salary.week": "{amount} a week",
			"job.salary.day": "{amount} a day",
			"job.salary.hour": "{amount} an hour",
			"job.employment.full-time": "Full time",
			"job.employment.part-time": "Part time",
			"job.employment.contract": "Contract",
			"job.employment.internship": "Internship",
			"job.employment.volunteer": "Volunteer",
			"job.apply": "How to apply",
			"job.apply.link": "Apply on their site",
			"job.apply.email": "Apply by email",
			"job.apply.bluesky": "Message @{handle} on Bluesky",
			"job.apply.bluesky.help": "Opens their Bluesky profile: send them a message from there.",
			"job.apply.privacy": "Your application goes straight to the poster: joblist never sees it.",
			"job.apply.none": "The poster did not say how to apply. Read the full offer.",
			"job.description.loading": "Reading the description…",
			"job.description.none": "The job board gives no description: read the full offer.",
			"job.offer": "Full offer",
			"job.posted": "Posted {ago}",
			"job.until": "Shown until {date}",
			"job.expired": "Expired: no longer shown.",
			"job.notFound": "This job offer does not exist, or its poster removed it.",
			"job.notFoundTitle": "Job not found",
			"job.at": "{title} at {company}"
		},
		fr: {
			"embed.title": "Offres chez {name}",
			"embed.count": "{count} offres",
			"embed.count.one": "1 offre",
			"embed.none": "Aucune offre pour l'instant.",
			"embed.more": "Voir les {count}",
			"embed.by": "sur joblist",
			"embed.error": "Les offres n'ont pas pu être lues.",
			"embed.search": "Chercher dans ces offres",
			"embed.page": "Comme votre propre page emplois",
			"embed.page.intro": "Une page entière à mettre sur jobs.votre-domaine ou votre-domaine/jobs, chez n'importe quel hébergeur statique (GitHub Pages, Cloudflare Pages, votre serveur). Changez query, where ou remote pour n'en montrer qu'une partie.",
			"embed.section": "Afficher ces offres sur votre site",
			"embed.intro": "Collez l'un de ces codes dans votre site : la liste se met à jour toute seule.",
			"embed.iframe": "En cadre (tout site)",
			"embed.element": "En élément (au style de votre site)",
			"embed.copy": "Copier",
			"embed.copied": "Copié",
			"job.distance.bike": "{minutes} min · {km} km",
			"job.distance.walk": "{minutes} min · {km} km",
			"job.where": "Où",
			"job.company.more": "{count} offres chez {name}",
			"job.company.more.one": "1 offre chez {name}",
			"job.company.one": "La seule offre chez {name}",
			"job.new": "Nouveau",
			"job.older": "En ligne depuis longtemps",
			"job.older.hint": "Vue pour la première fois il y a plus de {days} jours : elle est peut-être déjà pourvue.",
			"job.places.more": "et {count} autres lieux",
			"job.places.more.one": "et 1 autre lieu",
			"job.verified": "publiée par l'organisation",
			"job.sharedBy": "partagée par",
			"job.notFromCompany": "Pas de {company} : {company} publie ses propres offres ici, et celle-ci a été partagée par quelqu'un d'autre. Pour postuler, passez par le site de {company}.",
			"job.remote.onsite": "Sur place",
			"job.remote.hybrid": "Hybride",
			"job.remote.remote": "Télétravail",
			"job.salary.year": "{amount} par an",
			"job.salary.month": "{amount} par mois",
			"job.salary.week": "{amount} par semaine",
			"job.salary.day": "{amount} par jour",
			"job.salary.hour": "{amount} de l'heure",
			"job.employment.full-time": "Temps plein",
			"job.employment.part-time": "Temps partiel",
			"job.employment.contract": "Contrat de mission",
			"job.employment.internship": "Stage",
			"job.employment.volunteer": "Bénévolat",
			"job.apply": "Comment postuler",
			"job.apply.link": "Postuler sur leur site",
			"job.apply.email": "Postuler par e-mail",
			"job.apply.bluesky": "Écrire à @{handle} sur Bluesky",
			"job.apply.bluesky.help": "Ouvre son profil Bluesky : envoyez-lui un message depuis là.",
			"job.apply.privacy": "Votre candidature va directement à l'auteur de l'offre : joblist ne la voit jamais.",
			"job.apply.none": "L'auteur n'a pas dit comment postuler. Lisez l'offre complète.",
			"job.description.loading": "Lecture de la description…",
			"job.description.none": "Le site d'emploi ne donne pas de description : lisez l'offre complète.",
			"job.offer": "Offre complète",
			"job.posted": "Publiée {ago}",
			"job.until": "Affichée jusqu'au {date}",
			"job.expired": "Expirée : elle n'est plus affichée.",
			"job.notFound": "Cette offre n'existe pas, ou son auteur l'a retirée.",
			"job.notFoundTitle": "Offre introuvable",
			"job.at": "{title} chez {company}"
		},
		de: {
			"embed.title": "Offene Stellen bei {name}",
			"embed.count": "{count} offene Stellen",
			"embed.count.one": "1 offene Stelle",
			"embed.none": "Gerade keine offenen Stellen.",
			"embed.more": "Alle {count} ansehen",
			"embed.by": "auf joblist",
			"embed.error": "Die Jobs konnten nicht gelesen werden.",
			"embed.search": "Diese Jobs durchsuchen",
			"embed.page": "Als deine eigene Jobseite",
			"embed.page.intro": "Eine ganze Seite für jobs.deine-domain oder deine-domain/jobs, auf jedem statischen Hosting (GitHub Pages, Cloudflare Pages, dein Server). Ändere query, where oder remote, um nur einige Jobs zu zeigen.",
			"embed.section": "Diese Jobs auf deiner Website zeigen",
			"embed.intro": "Füg eins davon in deine Website ein: Die Liste bleibt von selbst aktuell.",
			"embed.iframe": "Als Frame (jede Website)",
			"embed.element": "Als Element (im Stil deiner Website)",
			"embed.copy": "Kopieren",
			"embed.copied": "Kopiert",
			"job.distance.bike": "{minutes} Min. · {km} km",
			"job.distance.walk": "{minutes} Min. · {km} km",
			"job.where": "Wo",
			"job.company.more": "{count} offene Stellen bei {name}",
			"job.company.more.one": "1 offene Stelle bei {name}",
			"job.company.one": "Die einzige offene Stelle bei {name}",
			"job.new": "Neu",
			"job.older": "Schon länger offen",
			"job.older.hint": "Zuerst vor mehr als {days} Tagen gesehen: Sie ist vielleicht schon besetzt.",
			"job.places.more": "und {count} weitere Orte",
			"job.places.more.one": "und 1 weiterer Ort",
			"job.verified": "von der Organisation veröffentlicht",
			"job.sharedBy": "geteilt von",
			"job.notFromCompany": "Nicht von {company}: {company} veröffentlicht ihre eigenen Angebote hier, und dieses wurde von jemand anderem geteilt. Um dich zu bewerben, geh auf die eigene Website von {company}.",
			"job.remote.onsite": "Vor Ort",
			"job.remote.hybrid": "Hybrid",
			"job.remote.remote": "Remote",
			"job.salary.year": "{amount} pro Jahr",
			"job.salary.month": "{amount} pro Monat",
			"job.salary.week": "{amount} pro Woche",
			"job.salary.day": "{amount} pro Tag",
			"job.salary.hour": "{amount} pro Stunde",
			"job.employment.full-time": "Vollzeit",
			"job.employment.part-time": "Teilzeit",
			"job.employment.contract": "Befristet",
			"job.employment.internship": "Praktikum",
			"job.employment.volunteer": "Ehrenamt",
			"job.apply": "So bewirbst du dich",
			"job.apply.link": "Auf ihrer Website bewerben",
			"job.apply.email": "Per E-Mail bewerben",
			"job.apply.bluesky": "@{handle} auf Bluesky schreiben",
			"job.apply.bluesky.help": "Öffnet das Bluesky-Profil: Schick von dort eine Nachricht.",
			"job.apply.privacy": "Deine Bewerbung geht direkt an die ausschreibende Stelle: joblist sieht sie nie.",
			"job.apply.none": "Es wurde nicht angegeben, wie man sich bewirbt. Lies das vollständige Angebot.",
			"job.description.loading": "Beschreibung wird gelesen…",
			"job.description.none": "Die Jobbörse liefert keine Beschreibung: Lies das vollständige Angebot.",
			"job.offer": "Vollständiges Angebot",
			"job.posted": "Veröffentlicht {ago}",
			"job.until": "Angezeigt bis {date}",
			"job.expired": "Abgelaufen: wird nicht mehr angezeigt.",
			"job.notFound": "Dieses Jobangebot gibt es nicht, oder es wurde entfernt.",
			"job.notFoundTitle": "Job nicht gefunden",
			"job.at": "{title} bei {company}"
		},
		es: {
			"embed.title": "Ofertas abiertas en {name}",
			"embed.count": "{count} ofertas abiertas",
			"embed.count.one": "1 oferta abierta",
			"embed.none": "No hay ofertas abiertas por ahora.",
			"embed.more": "Ver las {count}",
			"embed.by": "en joblist",
			"embed.error": "No se pudieron leer las ofertas.",
			"embed.search": "Buscar en estas ofertas",
			"embed.page": "Como tu propia página de empleo",
			"embed.page.intro": "Una página completa para poner en jobs.tu-dominio o tu-dominio/jobs, en cualquier hosting estático (GitHub Pages, Cloudflare Pages, tu servidor). Cambia query, where o remote para mostrar solo algunas ofertas.",
			"embed.section": "Muestra estas ofertas en tu sitio",
			"embed.intro": "Pega uno de estos en tu sitio web: la lista se mantiene al día sola.",
			"embed.iframe": "Como marco (cualquier sitio)",
			"embed.element": "Como elemento (con el estilo de tu sitio)",
			"embed.copy": "Copiar",
			"embed.copied": "Copiado",
			"job.distance.bike": "{minutes} min · {km} km",
			"job.distance.walk": "{minutes} min · {km} km",
			"job.where": "Dónde",
			"job.company.more": "{count} ofertas abiertas en {name}",
			"job.company.more.one": "1 oferta abierta en {name}",
			"job.company.one": "La única oferta abierta en {name}",
			"job.new": "Nueva",
			"job.older": "Abierta hace tiempo",
			"job.older.hint": "Vista por primera vez hace más de {days} días: puede que ya esté cubierta.",
			"job.places.more": "y {count} lugares más",
			"job.places.more.one": "y 1 lugar más",
			"job.verified": "publicada por la organización",
			"job.sharedBy": "compartida por",
			"job.notFromCompany": "No es de {company}: {company} publica sus propias ofertas aquí, y esta la compartió otra persona. Para postularte, ve al sitio web de {company}.",
			"job.remote.onsite": "Presencial",
			"job.remote.hybrid": "Híbrido",
			"job.remote.remote": "Remoto",
			"job.salary.year": "{amount} al año",
			"job.salary.month": "{amount} al mes",
			"job.salary.week": "{amount} a la semana",
			"job.salary.day": "{amount} al día",
			"job.salary.hour": "{amount} la hora",
			"job.employment.full-time": "Jornada completa",
			"job.employment.part-time": "Media jornada",
			"job.employment.contract": "Contrato temporal",
			"job.employment.internship": "Prácticas",
			"job.employment.volunteer": "Voluntariado",
			"job.apply": "Cómo postularte",
			"job.apply.link": "Postúlate en su sitio",
			"job.apply.email": "Postúlate por email",
			"job.apply.bluesky": "Escribe a @{handle} en Bluesky",
			"job.apply.bluesky.help": "Abre su perfil de Bluesky: envíale un mensaje desde allí.",
			"job.apply.privacy": "Tu postulación va directo a quien publicó la oferta: joblist nunca la ve.",
			"job.apply.none": "Quien la publicó no dijo cómo postularse. Lee la oferta completa.",
			"job.description.loading": "Leyendo la descripción…",
			"job.description.none": "El portal de empleo no da descripción: lee la oferta completa.",
			"job.offer": "Oferta completa",
			"job.posted": "Publicada {ago}",
			"job.until": "Visible hasta el {date}",
			"job.expired": "Vencida: ya no se muestra.",
			"job.notFound": "Esta oferta no existe, o quien la publicó la quitó.",
			"job.notFoundTitle": "Oferta no encontrada",
			"job.at": "{title} en {company}"
		}
	}
}.strings, Qr = qt({ locale: "en" });
function Z(e, t = {}) {
	let n = Zr[Qr.locale] || Zr.en, r = t.count === 1 && (n[`${e}.one`] || Zr.en[`${e}.one`]) || n[e] || Zr.en[e] || e;
	for (let [e, n] of Object.entries(t)) r = r.replaceAll(`{${e}}`, typeof n == "number" ? n.toLocaleString(Qr.locale) : String(n));
	return r;
}
//#endregion
//#region src/lib/components/JobCard.svelte
var $r = /* @__PURE__ */ q("<span> </span>"), ei = /* @__PURE__ */ q("<em class=\"svelte-1vivc5\"> </em>"), ti = /* @__PURE__ */ q("<strong class=\"svelte-1vivc5\"> </strong> <small class=\"svelte-1vivc5\"> </small> <jl-chips><!><!><!></jl-chips>", 3), ni = {
	hash: "svelte-1vivc5",
	code: "strong.svelte-1vivc5 {display:block;font-weight:var(--font-weight-strong);}small.svelte-1vivc5 {display:block;color:var(--color-muted);font-size:var(--font-size-small);}jl-chips.svelte-1vivc5 {display:flex;flex-wrap:wrap;gap:var(--space-xs);margin-top:var(--space-xs);}jl-chips.svelte-1vivc5 > * {padding:0 var(--space-s);border-radius:var(--radius-round);background:var(--color-soft);color:var(--color-fg);font-size:var(--font-size-small);line-height:var(--chip-line);}\n	/* An offer listed for long: told, not hidden. */jl-chips.svelte-1vivc5 > em:where(.svelte-1vivc5) {font-style:normal;color:var(--color-warn);}"
};
function ri(e, t) {
	Ge(t, !0), Nr(e, ni);
	let n = Xr(t, "company", 3, ""), r = /* @__PURE__ */ pt(() => [
		t.facts.place,
		t.facts.pay,
		t.facts.age
	].filter(Boolean));
	var i = ti(), a = nn(i), o = P(a, !0), s = F(a, 2), c = P(s), l = F(s, 2);
	Ir(l, 1, "svelte-1vivc5");
	var u = tn(l);
	Sr(u, () => t.lead ?? g);
	var d = F(u);
	Dr(d, 16, () => K(r), (e) => e, (e, t) => {
		var n = $r(), r = P(n, !0);
		bn(() => Y(r, t)), J(e, n);
	});
	var f = F(d), p = (e) => {
		var t = ei(), n = P(t, !0);
		bn((e, r) => {
			Vr(t, "title", e), Y(n, r);
		}, [() => Z("job.older.hint", { days: X.jobs.olderDays }), () => Z("job.older")]), J(e, t);
	};
	Cr(f, (e) => {
		t.facts.older && e(p);
	}), Ee(l), bn(() => {
		Y(o, t.title), Y(c, `${n() ? `${n()}${t.facts.line ? " · " : ""}` : ""}${t.facts.line ?? ""}`);
	}), J(e, i), Ke();
}
//#endregion
//#region src/lib/models/distance.js
var ii = 6371, ai = (e) => e * Math.PI / 180;
function oi([e, t], [n, r]) {
	let i = Math.sin(ai(r - t) / 2) ** 2 + Math.cos(ai(t)) * Math.cos(ai(r)) * Math.sin(ai(n - e) / 2) ** 2;
	return 2 * ii * Math.asin(Math.sqrt(i));
}
function si(e, t = X.travel.mode) {
	return Math.round(e * X.travel.detour / X.travel.kmPerHour[t] * 60);
}
function ci([e, t], [[n, r], [i, a]]) {
	return t < r || t > a ? !1 : n <= i ? e >= n && e <= i : e >= n || e <= i;
}
var li = {
	same: [
		[
			"united states",
			"us",
			"usa",
			"u.s.",
			"u.s.a.",
			"united states of america",
			"america"
		],
		[
			"united kingdom",
			"uk",
			"u.k.",
			"great britain",
			"england",
			"scotland",
			"wales"
		],
		["germany", "deutschland"],
		["france"],
		[
			"spain",
			"españa",
			"espana"
		],
		[
			"netherlands",
			"nederland",
			"holland"
		],
		[
			"switzerland",
			"schweiz",
			"suisse"
		],
		[
			"austria",
			"österreich",
			"osterreich"
		],
		["canada"],
		[
			"new york",
			"new york city",
			"nyc",
			"ny"
		],
		[
			"san francisco",
			"sf",
			"bay area",
			"sf bay area"
		],
		[
			"munich",
			"münchen",
			"munchen"
		],
		[
			"cologne",
			"köln",
			"koln"
		],
		["vienna", "wien"],
		["zurich", "zürich"],
		["lisbon", "lisboa"],
		["bengaluru", "bangalore"],
		["district of columbia", "dc"]
	],
	regions: {
		europe: [
			"europe",
			"eu",
			"emea",
			"eea",
			"european union"
		],
		americas: [
			"americas",
			"amer",
			"the americas",
			"north america",
			"latam",
			"latin america",
			"south america"
		],
		asia: [
			"asia",
			"apac",
			"asia pacific"
		]
	},
	countries: {
		europe: /* @__PURE__ */ "germany.france.spain.netherlands.switzerland.austria.united kingdom.ireland.italy.portugal.belgium.poland.sweden.denmark.norway.finland.czechia.czech republic.greece.romania.hungary.estonia.latvia.lithuania.croatia.slovenia.slovakia.bulgaria.luxembourg.serbia.ukraine.berlin.paris.london.amsterdam.barcelona.madrid.munich.hamburg.cologne.vienna.zurich.lisbon.dublin.warsaw.prague.stockholm.copenhagen".split("."),
		americas: [
			"united states",
			"canada",
			"mexico",
			"brazil",
			"argentina",
			"colombia",
			"chile",
			"peru",
			"new york",
			"san francisco",
			"toronto",
			"montreal"
		],
		asia: [
			"india",
			"japan",
			"singapore",
			"china",
			"korea",
			"south korea",
			"indonesia",
			"philippines",
			"vietnam",
			"thailand",
			"malaysia",
			"pakistan",
			"australia",
			"new zealand"
		]
	},
	cities: {
		germany: [
			"berlin",
			"munich",
			"hamburg",
			"cologne",
			"frankfurt",
			"stuttgart",
			"leipzig",
			"dusseldorf",
			"düsseldorf"
		],
		france: [
			"paris",
			"lyon",
			"marseille",
			"toulouse",
			"bordeaux",
			"nantes",
			"lille"
		],
		"united kingdom": [
			"london",
			"manchester",
			"edinburgh",
			"bristol",
			"cardiff",
			"glasgow",
			"cambridge",
			"oxford"
		],
		netherlands: [
			"amsterdam",
			"rotterdam",
			"utrecht",
			"eindhoven",
			"the hague"
		],
		spain: [
			"barcelona",
			"madrid",
			"valencia",
			"seville"
		],
		austria: [
			"vienna",
			"graz",
			"linz"
		],
		switzerland: [
			"zurich",
			"geneva",
			"basel",
			"lausanne",
			"bern"
		],
		portugal: ["lisbon", "porto"],
		ireland: ["dublin", "cork"],
		poland: [
			"warsaw",
			"krakow",
			"kraków",
			"wroclaw",
			"wrocław",
			"gdansk"
		],
		sweden: [
			"stockholm",
			"gothenburg",
			"malmo",
			"malmö"
		],
		denmark: ["copenhagen", "aarhus"],
		czechia: ["prague", "brno"],
		"united states": [
			"new york",
			"san francisco",
			"seattle",
			"austin",
			"boston",
			"chicago",
			"los angeles",
			"denver",
			"miami",
			"atlanta",
			"washington dc",
			"portland"
		],
		canada: [
			"toronto",
			"montreal",
			"vancouver",
			"ottawa",
			"calgary"
		]
	},
	anywhere: [
		"anywhere",
		"worldwide",
		"global",
		"international",
		"any location",
		"all locations",
		"earth",
		"world"
	],
	remoteNoise: [
		"only",
		"based",
		"eligible",
		"friendly",
		"first",
		"optional",
		"possible",
		"hub cities",
		"or",
		"and",
		"in",
		"from",
		"job",
		"location",
		"position",
		"fully",
		"100%"
	],
	usStates: {
		AL: "Alabama",
		AK: "Alaska",
		AZ: "Arizona",
		AR: "Arkansas",
		CA: "California",
		CO: "Colorado",
		CT: "Connecticut",
		FL: "Florida",
		GA: "Georgia",
		HI: "Hawaii",
		ID: "Idaho",
		IL: "Illinois",
		IN: "Indiana",
		IA: "Iowa",
		KS: "Kansas",
		KY: "Kentucky",
		LA: "Louisiana",
		ME: "Maine",
		MD: "Maryland",
		MA: "Massachusetts",
		MI: "Michigan",
		MN: "Minnesota",
		MS: "Mississippi",
		MO: "Missouri",
		MT: "Montana",
		NE: "Nebraska",
		NV: "Nevada",
		NH: "New Hampshire",
		NJ: "New Jersey",
		NM: "New Mexico",
		NY: "New York",
		NC: "North Carolina",
		ND: "North Dakota",
		OH: "Ohio",
		OK: "Oklahoma",
		OR: "Oregon",
		PA: "Pennsylvania",
		RI: "Rhode Island",
		SC: "South Carolina",
		SD: "South Dakota",
		TN: "Tennessee",
		TX: "Texas",
		UT: "Utah",
		VT: "Vermont",
		VA: "Virginia",
		WA: "Washington",
		WV: "West Virginia",
		WI: "Wisconsin",
		WY: "Wyoming"
	}
};
//#endregion
//#region src/lib/models/place.js
function Q(e) {
	return ` ${e.toLowerCase().replace(/\./g, "").replace(/[^\p{L}\p{N}%]+/gu, " ").trim()} `;
}
var ui = [...li.same.flatMap(([e, ...t]) => t.map((t) => [Q(t), Q(e)])), ...Object.entries(li.regions).flatMap(([e, t]) => t.map((t) => [Q(t), Q(e)]))].filter(([e, t]) => e !== t).sort((e, t) => t[0].length - e[0].length), di = new Map(Object.entries(li.countries).flatMap(([e, t]) => t.map((t) => [Q(t), e]))), fi = li.anywhere.map(Q), pi = li.remoteNoise.map(Q), mi = RegExp(`,\\s*(${Object.keys(li.usStates).join("|")})\\b(?!\\s*,(?!\\s*(US|USA|U\\.S\\.A?\\.?|United States)\\b))`, "g");
function hi(e) {
	return e.replace(mi, (e, t) => `, ${li.usStates[t]}`);
}
function gi(e) {
	let t = Q(hi(e));
	for (let [e, n] of ui) for (; t.includes(e);) t = t.replace(e, n);
	return t;
}
var _i = new Map(Object.entries(li.cities).flatMap(([e, t]) => t.map((t) => [Q(t), Q(e)]))), vi = /* @__PURE__ */ new Map();
function yi(e, t) {
	let n = `${t ? "r" : "o"}${e}`, r = vi.get(n);
	if (r === void 0) {
		r = gi(e);
		let i = /* @__PURE__ */ new Set();
		for (let [e, t] of di) r.includes(e) && i.add(t);
		if (t) {
			for (let [e, t] of Object.entries(li.countries)) if (r.includes(` ${e} `)) for (let e of t) i.add(e);
		}
		r = `${r}${[...i].join(" ")} `, vi.set(n, r);
	}
	return r;
}
function bi(e) {
	let t = gi(e);
	if (!t.trim()) return () => !0;
	let n = t.trim().split(" ").filter(Boolean), r = _i.get(t), i = r ? r.trim().split(" ").filter(Boolean) : null, a = /* @__PURE__ */ new Map();
	return (e, t = !1) => {
		let r = `${t ? "r" : "o"}${e || ""}`, o = a.get(r);
		if (o === void 0) {
			let s = yi(e || "", t), c = (e) => e.every((e) => s.includes(` ${e}`));
			o = c(n) || !!(t && i && c(i)), a.set(r, o);
		}
		return o;
	};
}
var xi = /* @__PURE__ */ new Map();
function Si(e, t) {
	let n = e || "", r = xi.get(n);
	if (r !== void 0) return r;
	let i = gi(n);
	for (let e of [
		...t.map(Q),
		...fi,
		...pi
	]) for (; i.includes(e);) i = i.replace(e, " ");
	return i = i.trim(), xi.set(n, i), i;
}
//#endregion
//#region src/lib/models/place-names.js
var Ci = (e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), wi = [
	...X.jobs.remoteWords,
	...X.jobs.hybridWords,
	...X.jobs.onsiteWords,
	...li.remoteNoise
], Ti = wi.sort((e, t) => t.length - e.length).map(Ci).join("|"), Ei = "[\\s\\[\\]\\-–—:·•*]", Di = `\\(?\\s*(?:${Ti})\\s*\\)?`;
RegExp(`^(?:${Ei}+|${Di}(?=${Ei}|[()]|$))`, "iu"), RegExp(`(?:(?<=${Ei}|[()])${Di}|${Ei}+)$`, "iu"), Math.max(...wi.map((e) => e.length)) + 8;
//#endregion
//#region src/lib/models/landing.js
var Oi = [
	{
		slug: "engineering",
		query: "engineer",
		words: [
			"engineer",
			"engineering",
			"developer",
			"software",
			"devops",
			"sre",
			"backend",
			"back-end",
			"frontend",
			"front-end",
			"full-stack",
			"fullstack",
			"programmer",
			"architect",
			"entwickler",
			"entwicklerin",
			"développeur",
			"développeuse",
			"ingénieur",
			"ingénieure"
		]
	},
	{
		slug: "data",
		query: "data",
		words: [
			"data",
			"analytics",
			"analyst",
			"machine learning",
			"ml",
			"ai",
			"bi",
			"business intelligence",
			"statistician"
		]
	},
	{
		slug: "design",
		query: "design",
		words: [
			"design",
			"designer",
			"ux",
			"ui",
			"user experience",
			"user research",
			"illustrator",
			"art director",
			"creative director",
			"gestalter",
			"gestalterin"
		]
	},
	{
		slug: "product",
		query: "product",
		words: [
			"product manager",
			"product owner",
			"product lead",
			"head of product",
			"product management",
			"product director",
			"chef de produit"
		]
	},
	{
		slug: "marketing",
		query: "marketing",
		words: [
			"marketing",
			"seo",
			"content",
			"brand",
			"growth",
			"communications",
			"social media",
			"copywriter",
			"public relations",
			"pr manager"
		]
	},
	{
		slug: "sales",
		query: "sales",
		words: [
			"sales",
			"account executive",
			"account manager",
			"business development",
			"sdr",
			"bdr",
			"go to market",
			"go-to-market",
			"gtm",
			"vertrieb",
			"commercial"
		]
	},
	{
		slug: "customer-support",
		query: "customer",
		words: [
			"customer success",
			"customer support",
			"customer service",
			"customer experience",
			"customer care",
			"support specialist",
			"support engineer",
			"help desk",
			"helpdesk",
			"kundenservice"
		]
	},
	{
		slug: "operations",
		query: "operations",
		words: [
			"operations",
			"logistics",
			"supply chain",
			"procurement",
			"purchasing",
			"warehouse",
			"office manager",
			"administrative",
			"assistant"
		]
	},
	{
		slug: "finance",
		query: "finance",
		words: [
			"finance",
			"financial",
			"accounting",
			"accountant",
			"controller",
			"controlling",
			"tax",
			"treasury",
			"payroll",
			"audit",
			"auditor",
			"buchhaltung",
			"comptable"
		]
	},
	{
		slug: "people",
		query: "recruit",
		words: [
			"recruiter",
			"recruiting",
			"recruitment",
			"talent acquisition",
			"people",
			"hr",
			"human resources",
			"personalwesen",
			"ressources humaines"
		]
	},
	{
		slug: "legal",
		query: "legal",
		words: [
			"legal",
			"counsel",
			"lawyer",
			"attorney",
			"paralegal",
			"compliance",
			"jurist",
			"juriste"
		]
	},
	{
		slug: "security",
		query: "security",
		words: [
			"security",
			"cybersecurity",
			"infosec",
			"penetration",
			"soc analyst"
		]
	},
	{
		slug: "science",
		query: "scientist",
		words: [
			"scientist",
			"research",
			"researcher",
			"laboratory",
			"lab",
			"chemist",
			"chemistry",
			"biologist",
			"biology",
			"physicist",
			"clinical"
		]
	},
	{
		slug: "hardware",
		query: "technician",
		words: [
			"technician",
			"mechanical",
			"electrical",
			"manufacturing",
			"production",
			"assembly",
			"machinist",
			"avionics",
			"hardware",
			"welder",
			"mechatronics",
			"testing",
			"quality"
		]
	}
];
function ki(e) {
	let t = e.words.map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
	return RegExp(`\\b(?:${t.join("|")})\\b`, "i");
}
var Ai = new Map(Oi.map((e) => [e.slug, ki(e)]));
function ji(e) {
	let t = `${e.t} ${e.d || ""}`;
	return Oi.filter((e) => Ai.get(e.slug)?.test(t)).map((e) => e.slug);
}
//#endregion
//#region src/lib/models/team.js
function Mi(e) {
	let t = e.department?.trim();
	if (t) return t;
	let n = ji({
		t: e.title,
		d: ""
	})[0];
	return n ? `field:${n}` : "";
}
//#endregion
//#region src/lib/models/job.js
var Ni = X.jobs.remoteWords, Pi = RegExp(`\\b(${Ni.join("|")})\\b`, "i"), Fi = RegExp(`([(\\[|,]|\\s[-–]\\s)\\s*(${Ni.join("|")})\\b`, "i"), Ii = RegExp(`\\b(${X.jobs.hybridWords.join("|")})\\b`, "i"), Li = RegExp(`([(\\[|,]|\\s[-–]\\s)\\s*(${X.jobs.hybridWords.join("|")})\\b`, "i"), Ri = RegExp(`\\b(${X.jobs.onsiteWords.join("|")})\\b`, "i"), zi = (e) => e.toLowerCase().split(/\s+/).filter(Boolean);
function Bi(e) {
	if (e.remote === "onsite" || e.remote === "hybrid" || e.remote === "remote") return e.remote;
	if (e.remote !== "") {
		if (Pi.test(e.location || "") || Fi.test(e.title)) return "remote";
		if (Ii.test(e.location || "") || Li.test(e.title)) return "hybrid";
		if (Ri.test(e.location || "")) return "onsite";
	}
}
function Vi(e) {
	return Bi(e) === "remote";
}
function Hi(e) {
	return Vi(e) ? Si(e.location, Ni) : "";
}
function Ui(e, { query: t, where: n, remote: r, pay: i, field: a, team: o, near: s, within: c = 0, area: l, places: u }, d) {
	let f = zi(t), p = n.trim() ? bi(n) : null, m = u?.length ? u.map(bi) : null, h = !f.length && !p && !m && !r && !i && !a && !o && !l ? e : e.filter((e) => {
		if (i && !e.salary || a && !ji({
			t: e.title,
			d: e.department
		}).includes(a) || o && Mi(e) !== o || l && !(e.point && ci(e.point, l)) || r && !Vi(e) || r === "anywhere" && Hi(e) || p && (!r || Hi(e)) && !p(e.location, Vi(e)) || m && (!r || Hi(e)) && !m.some((t) => t(e.location, Vi(e)))) return !1;
		if (!f.length) return !0;
		let t = Zi(e, d);
		return f.every((e) => t.includes(e));
	});
	return s ? h.filter((e) => e.point).map((e) => ({
		...e,
		km: oi(s, e.point)
	})).filter((e) => !c || si(e.km) <= c).sort((e, t) => Wi(e.km) - Wi(t.km) || Ji(t.published) - Ji(e.published) || e.km - t.km) : h;
}
function Wi(e) {
	return Math.floor(si(e) / X.travel.bandMinutes);
}
function Gi(e) {
	let t = e.map((e) => e.posted ? "" : $i(e)), n = /* @__PURE__ */ new Map();
	e.forEach((e, r) => {
		if (!t[r]) return;
		let i = n.get(t[r]);
		i ? i.push(e) : n.set(t[r], [e]);
	});
	let r = [];
	return e.forEach((e, i) => {
		if (!t[i]) return void r.push(e);
		let a = n.get(t[i]);
		a[0] === e && r.push(a.length > 1 ? {
			...e,
			also: a.slice(1)
		} : e);
	}), r;
}
function Ki(e) {
	return [...new Set([e, ...e.also || []].map((e) => qi(e.location)).filter(Boolean))];
}
function qi(e) {
	let t = /* @__PURE__ */ new Set();
	return (e || "").split(/\s*,\s*/).filter((e) => e && !t.has(e.toLowerCase()) && t.add(e.toLowerCase())).join(", ");
}
function Ji(e) {
	if (!e) return 0;
	let t = String(e), n = Date.parse(t.includes(" ") ? t.replace(" UTC", "Z").replace(" ", "T") : t);
	return Number.isFinite(n) ? n : 0;
}
function Yi(e, t = Date.now(), n = X.jobs.olderDays) {
	let r = Ji(e.published);
	return !e.posted && r > 0 && t - r > n * 864e5;
}
var Xi = /* @__PURE__ */ new WeakMap();
function Zi(e, t) {
	let n = Xi.get(e);
	return n === void 0 && (n = `${e.title} ${e.department || ""} ${t.get(e.company) || ""}`.toLowerCase(), Xi.set(e, n)), n;
}
function Qi(e) {
	let t = e.map((e) => Ji(e.published)), n = Array.from(e.keys()).sort((e, n) => t[n] - t[e] || e - n).map((t) => e[t]);
	for (let t = 0; t < n.length; t++) e[t] = n[t];
}
function $i(e) {
	return `${e.company}\n${e.title.trim().toLowerCase()}`;
}
//#endregion
//#region src/lib/i18n/dates.js
var ea = [
	["year", 31536e6],
	["month", 2592e6],
	["week", 6048e5],
	["day", 864e5]
];
function ta(e, t, n = Date.now()) {
	if (!e) return "";
	let r = e - n, i = new Intl.RelativeTimeFormat(t, { numeric: "auto" });
	for (let [e, t] of ea) if (Math.abs(r) >= t) return i.format(Math.round(r / t), e);
	return i.format(0, "day");
}
//#endregion
//#region src/lib/models/salary.js
var na = 1e4, ra = /* @__PURE__ */ new Map();
function ia(e, t, n) {
	let r = `${e}\n${t}\n${n}`, i = ra.get(r);
	return i || (i = new Intl.NumberFormat(e, n ? {
		style: "currency",
		currency: t,
		notation: "compact",
		maximumSignificantDigits: 3
	} : {
		style: "currency",
		currency: t,
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}), ra.set(r, i)), i;
}
function aa({ min: e, max: t, currency: n }, r) {
	let i = ia(r, n, (t ?? e ?? 0) >= na);
	return e && t && e !== t ? i.formatRange(e, t) : i.format(e ?? t);
}
//#endregion
//#region src/lib/models/job-card.js
function oa(e, { t, locale: n, where: r = Bi(e) }) {
	let i = r ? t(`job.remote.${r}`) : "", a = i && !(e.location || "").toLowerCase().includes(i.toLowerCase()) ? i : "", o = Ki(e), s = X.jobs.placesShown;
	return {
		line: [o.length > s ? `${o.slice(0, s).join("; ")} ${t("job.places.more", { count: o.length - s })}` : o.join("; "), e.department].filter(Boolean).join(" · "),
		place: a,
		pay: e.salary ? t(`job.salary.${e.salary.period}`, { amount: aa(e.salary, n) }) : "",
		age: ta(Ji(e.published), n),
		older: Yi(e)
	};
}
//#endregion
//#region src/lib/data/providers.json
var sa = [
	{
		id: "ashby",
		name: "Ashby",
		board: "https://jobs.ashbyhq.com/{id}"
	},
	{
		id: "greenhouse",
		name: "Greenhouse",
		board: "https://job-boards.greenhouse.io/{id}"
	},
	{
		id: "lever",
		name: "Lever",
		board: "https://jobs.lever.co/{id}"
	},
	{
		id: "personio",
		name: "Personio",
		board: "https://{id}.jobs.personio.de"
	},
	{
		id: "recruitee",
		name: "Recruitee",
		board: "https://{id}.recruitee.com"
	},
	{
		id: "rippling",
		name: "Rippling",
		board: "https://ats.rippling.com/{id}/jobs"
	},
	{
		id: "smartrecruiters",
		name: "SmartRecruiters",
		board: "https://jobs.smartrecruiters.com/{id}"
	},
	{
		id: "workable",
		name: "Workable",
		board: "https://apply.workable.com/{id}"
	}
];
//#endregion
//#region src/lib/models/url.js
function ca(e, { email: t = !1 } = {}) {
	let n = String(e ?? "").trim();
	if (la.test(n)) return n;
	try {
		let { protocol: e } = new URL(n);
		return e === "https:" || e === "http:" || t && e === "mailto:" ? n : "";
	} catch {
		return "";
	}
}
var la = /^https?:\/\/[a-z0-9.-]+(?::\d+)?(?:[/?#][^\s"'<>\\]*)?$/i;
//#endregion
//#region src/lib/ats/job.js
async function $(e) {
	try {
		let t = await fetch(e, { headers: { accept: "application/json" } });
		return t.ok ? await t.json() : null;
	} catch {
		return null;
	}
}
function ua(...e) {
	return e.filter(Boolean).join(", ");
}
function da(e) {
	let t = String(e || "").toLowerCase().replace(/[^a-z]/g, "");
	if (t === "remote") return "remote";
	if (t === "hybrid") return "hybrid";
	if (t === "onsite" || t === "inoffice" || t === "office") return "onsite";
}
function fa(e) {
	let t = /* @__PURE__ */ new Map();
	return (n) => (t.has(n) || t.set(n, e(n)), t.get(n));
}
//#endregion
//#region src/lib/ats/salary.js
var pa = [
	"year",
	"month",
	"week",
	"day",
	"hour"
];
function ma(e) {
	let t = Number(typeof e == "string" ? e.replace(/[\s,]/g, "") : e);
	return e !== null && e !== "" && Number.isFinite(t) && t > 0 ? t : void 0;
}
function ha({ min: e, max: t, currency: n, period: r }) {
	let i = ma(e), a = ma(t), o = String(n || "").toUpperCase(), s = String(r || "").toLowerCase();
	if (!i && !a || !/^[A-Z]{3}$/.test(o) || !pa.includes(s)) return;
	i && a && i > a && ([i, a] = [a, i]);
	let c = {
		currency: o,
		period: s
	};
	return i && (c.min = i), a && (c.max = a), c;
}
function ga(e) {
	let t = e.filter(Boolean), [n] = t;
	if (!n) return;
	let r = t.filter((e) => e.currency === n.currency && e.period === n.period), i = r.map((e) => e.min ?? e.max ?? 0), a = r.map((e) => e.max ?? e.min ?? 0), o = Math.min(...i), s = Math.max(...a);
	return {
		currency: n.currency,
		period: n.period,
		...o ? { min: o } : {},
		...s && s !== o ? { max: s } : {}
	};
}
function _a(e) {
	let t = String(e || "").toLowerCase();
	if (!/bi-?week|^\s*([2-9]|\d{2,})\s/.test(t)) {
		if (/hour/.test(t)) return "hour";
		if (/day|daily/.test(t)) return "day";
		if (/week/.test(t)) return "week";
		if (/month/.test(t)) return "month";
		if (/year|annual|annum/.test(t)) return "year";
	}
}
function va(e) {
	if (!Array.isArray(e)) return;
	let [t, n, r, i] = e;
	return ha({
		min: t,
		max: n,
		currency: r,
		period: i
	});
}
//#endregion
//#region src/lib/ats/ashby.js
var ya = /* @__PURE__ */ t({
	default: () => ba,
	describe: () => Ca
});
async function ba(e) {
	return ((await Sa(e))?.jobs || []).filter((e) => e.isListed !== !1).map((e) => ({
		id: e.id,
		title: e.title,
		url: e.jobUrl,
		location: [e.location, ...(e.secondaryLocations || []).map((e) => e.location)].filter(Boolean).join(", "),
		department: e.department,
		published: e.publishedAt,
		remote: da(e.workplaceType) || (e.isRemote ? "remote" : void 0),
		salary: xa(e)
	}));
}
function xa(e) {
	return e.shouldDisplayCompensationOnJobPostings ? ga((e.compensation?.summaryComponents || []).filter((e) => e.compensationType === "Salary").map((e) => ha({
		min: e.minValue,
		max: e.maxValue,
		currency: e.currencyCode,
		period: _a(e.interval)
	}))) : void 0;
}
var Sa = fa((e) => $(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(e)}?includeCompensation=true`));
async function Ca(e, t) {
	return (await Sa(e))?.jobs?.find((e) => e.id === t)?.descriptionPlain || "";
}
//#endregion
//#region src/lib/ats/text.js
function wa(e) {
	return Da(String(e || "").replace(/<(script|style)[\s\S]*?<\/\1>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<li[^>]*>/gi, "\n• ").replace(/<\/(p|div|h[1-6]|ul|ol|section|blockquote|tr)>/gi, "\n\n").replace(/<(p|div|h[1-6]|ul|ol|section|blockquote|tr)[^>]*>/gi, "\n\n").replace(/<[^>]+>/g, "")).replace(/[ \t ]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function Ta(e) {
	return Da(String(e || ""));
}
var Ea = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'",
	nbsp: "\xA0",
	rsquo: "’",
	lsquo: "‘",
	rdquo: "”",
	ldquo: "“",
	ndash: "–",
	mdash: "—",
	hellip: "…",
	bull: "•",
	euro: "€"
};
function Da(e) {
	return e.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (e, t) => {
		if (t[0] === "#") {
			let n = t[1].toLowerCase() === "x" ? parseInt(t.slice(2), 16) : Number(t.slice(1));
			return Number.isFinite(n) && n > 0 && n < 1114112 ? String.fromCodePoint(n) : e;
		}
		return Ea[t.toLowerCase()] ?? e;
	});
}
//#endregion
//#region src/lib/ats/greenhouse.js
var Oa = /* @__PURE__ */ t({
	default: () => ka,
	describe: () => Ma,
	payRange: () => ja
});
async function ka(e) {
	return ((await $(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(e)}/jobs?pay_transparency=true`))?.jobs || []).map((e) => ({
		id: String(e.id),
		title: e.title,
		url: e.absolute_url,
		location: e.location?.name,
		published: e.first_published || e.updated_at,
		salary: ga((e.pay_input_ranges || []).map(ja))
	}));
}
var Aa = /variable|bonus|commission|equity/i;
function ja(e) {
	if (Aa.test(e?.title || "")) return;
	let t = `${e.title || ""} ${wa(e.blurb)}`, n = Math.max(Number(e.min_cents) || 0, Number(e.max_cents) || 0) / 100, r = /\bhour(ly)?\b/i.test(t) && n < 1e3, i = /\bmonth(ly)?\b/i.test(t) && !/\bannual|\byear/i.test(t), a = r ? "hour" : i ? "month" : n >= 1e3 ? "year" : "";
	return ha({
		min: Number(e.min_cents) / 100,
		max: Number(e.max_cents) / 100,
		currency: e.currency_type,
		period: a
	});
}
async function Ma(e, t) {
	return wa(Ta((await $(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(e)}/jobs/${encodeURIComponent(t)}`))?.content));
}
//#endregion
//#region src/lib/ats/lever.js
var Na = /* @__PURE__ */ t({
	default: () => Pa,
	describe: () => Fa
});
async function Pa(e) {
	return (await $(`https://api.lever.co/v0/postings/${encodeURIComponent(e)}?mode=json`) || []).map((e) => ({
		id: e.id,
		title: e.text,
		url: e.hostedUrl,
		location: (e.categories?.allLocations || [e.categories?.location]).filter(Boolean).join(", "),
		department: e.categories?.team || e.categories?.department,
		published: e.createdAt ? new Date(e.createdAt).toISOString() : void 0,
		remote: da(e.workplaceType),
		salary: e.salaryRange ? ha({
			...e.salaryRange,
			period: _a(e.salaryRange.interval)
		}) : void 0
	}));
}
async function Fa(e, t) {
	let n = await $(`https://api.lever.co/v0/postings/${encodeURIComponent(e)}/${encodeURIComponent(t)}`);
	if (!n) return "";
	let r = (n.lists || []).map((e) => `${e.text}\n${wa(e.content)}`);
	return [
		n.descriptionPlain,
		...r,
		n.additionalPlain
	].filter(Boolean).join("\n\n").trim();
}
//#endregion
//#region src/lib/ats/personio.js
var Ia = /* @__PURE__ */ t({
	default: () => za,
	describe: () => Ba
}), La = (e) => `https://${encodeURIComponent(e)}.jobs.personio.de`, Ra = fa(async (e) => {
	try {
		let t = await fetch(`${La(e)}/xml?language=en`);
		return t.ok ? await t.text() : "";
	} catch {
		return "";
	}
});
async function za(e) {
	return Va(await Ra(e)).map(({ fields: t }) => ({
		id: t.id,
		title: t.name || "",
		url: `${La(e)}/job/${t.id}`,
		location: t.office,
		department: t.department,
		published: t.createdAt
	}));
}
async function Ba(e, t) {
	let n = Va(await Ra(e)).find((e) => e.fields.id === t);
	return n ? [...n.body.matchAll(/<jobDescription>([\s\S]*?)<\/jobDescription>/g)].map(([, e]) => `${Ha(e, "name")}\n${wa(Ha(e, "value"))}`.trim()).join("\n\n") : "";
}
function Va(e) {
	return [...e.matchAll(/<position>([\s\S]*?)<\/position>/g)].map(([, e]) => {
		let t = {};
		for (let [, n, r] of e.matchAll(/<(\w+)>([^<]*)<\/\1>/g)) t[n] = Ua(r.trim());
		return {
			fields: t,
			body: e
		};
	});
}
function Ha(e, t) {
	let n = e.match(RegExp(`<${t}>([\\s\\S]*?)</${t}>`))?.[1].trim() || "", r = n.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
	return r ? r[1] : Ua(n);
}
function Ua(e) {
	return e.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&");
}
//#endregion
//#region src/lib/ats/recruitee.js
var Wa = /* @__PURE__ */ t({
	default: () => Ga,
	describe: () => qa
});
async function Ga(e) {
	return ((await $(`https://${encodeURIComponent(e)}.recruitee.com/api/offers`))?.offers || []).map((e) => ({
		id: String(e.id),
		title: e.title,
		url: e.careers_url,
		location: e.location || ua(e.city, e.country),
		department: e.department,
		published: e.published_at,
		remote: e.remote ? "remote" : e.hybrid ? "hybrid" : e.on_site ? "onsite" : void 0,
		salary: e.salary ? ha({
			...e.salary,
			period: _a(e.salary.period)
		}) : void 0
	}));
}
var Ka = fa((e) => $(`https://${encodeURIComponent(e)}.recruitee.com/api/offers`));
async function qa(e, t) {
	let n = (await Ka(e))?.offers?.find((e) => String(e.id) === t);
	return n ? wa(`${n.description || ""}${n.requirements || ""}`) : "";
}
//#endregion
//#region src/lib/ats/rippling.js
var Ja = /* @__PURE__ */ t({
	default: () => Ya,
	describe: () => Xa
});
async function Ya(e) {
	let t = [];
	for (let n = 0; n < 20; n++) {
		let r = await $(`https://api.rippling.com/platform/api/ats/v2/board/${encodeURIComponent(e)}/jobs?page=${n}`);
		if (t.push(...r?.items || []), !r || n + 1 >= (r.totalPages || 0)) break;
	}
	return t.map((e) => ({
		id: e.id,
		title: e.name,
		url: e.url,
		location: (e.locations || []).map((e) => e.name).join(", "),
		department: e.department?.name,
		remote: da(e.locations?.[0]?.workplaceType)
	}));
}
async function Xa(e, t) {
	let n = await $(`https://api.rippling.com/platform/api/ats/v2/board/${encodeURIComponent(e)}/jobs/${encodeURIComponent(t)}`);
	return wa(`${n?.description?.role || ""}${n?.description?.company || ""}`);
}
//#endregion
//#region src/lib/ats/smartrecruiters.js
var Za = /* @__PURE__ */ t({
	default: () => $a,
	describe: () => eo
});
async function Qa(e) {
	let { boardPageSize: t, jobsPerBoard: n } = X.limits, r = [];
	for (let i = 0; i < n; i += t) {
		let n = await $(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(e)}/postings?limit=${t}&offset=${i}`), a = n?.content || [];
		if (r.push(...a), a.length < t || r.length >= (n?.totalFound ?? 0)) break;
	}
	return r.slice(0, n);
}
async function $a(e) {
	return (await Qa(e)).map((t) => ({
		id: t.id,
		title: t.name,
		url: `https://jobs.smartrecruiters.com/${encodeURIComponent(e)}/${t.id}`,
		location: t.location?.fullLocation,
		department: t.department?.label,
		published: t.releasedDate,
		remote: t.location?.remote ? "remote" : t.location?.hybrid ? "hybrid" : "onsite"
	}));
}
async function eo(e, t) {
	let n = (await $(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(e)}/postings/${encodeURIComponent(t)}`))?.jobAd?.sections || {};
	return [
		n.jobDescription,
		n.qualifications,
		n.additionalInformation,
		n.companyDescription
	].filter((e) => e?.text).map((e) => `${e.title || ""}\n${wa(e.text)}`.trim()).join("\n\n");
}
//#endregion
//#region src/lib/ats/workable.js
var to = /* @__PURE__ */ t({
	default: () => no,
	describe: () => io
});
async function no(e) {
	return ((await $(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(e)}`))?.jobs || []).map((e) => ({
		id: e.shortcode,
		title: e.title,
		url: e.url || e.shortlink,
		location: e.telecommuting && !e.city ? ua("Remote", e.country) : ua(e.city, e.country),
		department: e.department,
		published: e.published_on,
		remote: e.telecommuting ? "remote" : void 0
	}));
}
var ro = fa((e) => $(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(e)}?details=true`));
async function io(e, t) {
	let n = (await ro(e))?.jobs?.find((e) => e.shortcode === t);
	return wa(n?.description);
}
//#endregion
//#region src/lib/ats/index.js
var ao = {
	ashby: ya,
	greenhouse: Oa,
	lever: Na,
	personio: Ia,
	recruitee: Wa,
	rippling: Ja,
	smartrecruiters: Za,
	workable: to
}, oo = /* @__PURE__ */ new Map();
function so(e) {
	let { provider: t = "", id: n = "" } = e.jobBoard || {}, r = ao[t]?.default;
	if (!r || !n) return Promise.resolve([]);
	let i = `${t}:${n}`;
	return oo.has(i) || oo.set(i, r(n).then((t) => t.map((e) => ({
		...e,
		url: ca(e.url)
	})).filter((e) => e.title && e.url).map((t) => ({
		...t,
		location: co(t.location),
		company: e.key
	}))).catch(() => [])), oo.get(i);
}
function co(e) {
	return e?.split(",").map((e) => e.trim()).filter(Boolean).join(", ") || void 0;
}
//#endregion
//#region src/lib/ats/board-check.js
var lo = {
	greenhouse: async (e) => (await $(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(e)}`))?.name,
	workable: async (e) => (await $(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(e)}`))?.name,
	smartrecruiters: async (e) => (await $(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(e)}/postings?limit=1`))?.content?.[0]?.company?.name,
	recruitee: async (e) => (await $(`https://${encodeURIComponent(e)}.recruitee.com/api/offers`))?.offers?.[0]?.company_name
};
async function uo({ provider: e, id: t }) {
	try {
		return String(await lo[e]?.(t) || "").trim();
	} catch {
		return "";
	}
}
//#endregion
//#region src/lib/ats/detect.js
var fo = /* @__PURE__ */ new Set([
	"",
	"api",
	"app",
	"www",
	"embed",
	"v0",
	"v1",
	"jobs",
	"job",
	"static",
	"assets",
	"careers",
	"login",
	"signup",
	"help"
]), po = [
	{
		provider: "greenhouse",
		host: /^boards-api\.greenhouse\.io$/,
		from: /^\/v1\/boards\/([^/?#]+)/
	},
	{
		provider: "ashby",
		host: /^api\.ashbyhq\.com$/,
		from: /^\/posting-api\/job-board\/([^/?#]+)/
	},
	{
		provider: "lever",
		host: /^api\.(eu\.)?lever\.co$/,
		from: /^\/v0\/postings\/([^/?#]+)/
	},
	{
		provider: "workable",
		host: /^apply\.workable\.com$/,
		from: /^\/api\/v\d+\/(?:widget\/)?accounts\/([^/?#]+)/
	},
	{
		provider: "smartrecruiters",
		host: /^api\.smartrecruiters\.com$/,
		from: /^\/v1\/companies\/([^/?#]+)/
	},
	{
		provider: "rippling",
		host: /^api\.rippling\.com$/,
		from: /^\/platform\/api\/ats\/v\d+\/board\/([^/?#]+)/
	},
	{
		provider: "greenhouse",
		host: /^(job-)?boards(\.eu)?\.greenhouse\.io$/,
		from: "path"
	},
	{
		provider: "lever",
		host: /^jobs\.lever\.co$/,
		from: "path"
	},
	{
		provider: "ashby",
		host: /^jobs\.ashbyhq\.com$/,
		from: "path"
	},
	{
		provider: "workable",
		host: /^apply\.workable\.com$/,
		from: "path"
	},
	{
		provider: "workable",
		host: /^[a-z0-9-]+\.workable\.com$/,
		from: "subdomain"
	},
	{
		provider: "personio",
		host: /^[a-z0-9-]+\.jobs\.personio\.(de|com)$/,
		from: "subdomain"
	},
	{
		provider: "recruitee",
		host: /^[a-z0-9-]+\.recruitee\.com$/,
		from: "subdomain"
	},
	{
		provider: "smartrecruiters",
		host: /^(jobs|careers)\.smartrecruiters\.com$/,
		from: "path"
	},
	{
		provider: "rippling",
		host: /^ats\.rippling\.com$/,
		from: "path"
	}
];
function mo(e) {
	let t;
	try {
		t = new URL(e.startsWith("//") ? `https:${e}` : e);
	} catch {
		return null;
	}
	let n = t.hostname.toLowerCase(), r = po.find((e) => e.host.test(n) && (!(e.from instanceof RegExp) || e.from.test(t.pathname)));
	if (!r) return null;
	let i = t.searchParams.get("for");
	if (r.provider === "greenhouse" && i) return {
		provider: "greenhouse",
		id: i
	};
	let a = r.from instanceof RegExp ? decodeURIComponent(t.pathname.match(r.from)?.[1] || "") : r.from === "subdomain" ? n.split(".")[0] : decodeURIComponent(t.pathname.split("/").filter(Boolean)[0] || "");
	return fo.has(a.toLowerCase()) ? null : {
		provider: r.provider,
		id: a
	};
}
new Map([
	{
		lexicon: 1,
		id: "today.joblist.company",
		description: "A company or organization, described by anyone, like a wiki page: each author's record is one version. The record key is the organization's domain, normalised: the website's host name, lowercase, without 'www.' (e.g. 'example.org' for https://www.Example.org/jobs), at most 253 characters (a DNS name). When the author's handle equals that domain, the record is the organization's own.",
		defs: {
			main: {
				type: "record",
				key: "any",
				record: {
					type: "object",
					required: ["name", "createdAt"],
					properties: {
						name: {
							type: "string",
							maxLength: 1e3,
							maxGraphemes: 100
						},
						url: {
							type: "string",
							format: "uri",
							description: "The organization's website."
						},
						description: {
							type: "string",
							maxLength: 3e4,
							maxGraphemes: 3e3
						},
						kind: {
							type: "string",
							maxLength: 64,
							knownValues: [
								"company",
								"cooperative",
								"nonprofit",
								"collective",
								"project",
								"public"
							],
							description: "What sort of organization it is: a company, a cooperative, a nonprofit, a collective, a project, a public body. Apps show others as unknown."
						},
						tags: {
							type: "array",
							maxLength: 20,
							items: {
								type: "string",
								maxLength: 640,
								maxGraphemes: 64
							}
						},
						locations: {
							type: "array",
							maxLength: 50,
							items: {
								type: "ref",
								ref: "#location"
							}
						},
						jobBoard: {
							type: "ref",
							ref: "#jobBoard"
						},
						links: {
							type: "array",
							maxLength: 20,
							description: "Other public pages of the organization (social profiles, wikipedia, etc.).",
							items: {
								type: "string",
								format: "uri"
							}
						},
						createdAt: {
							type: "string",
							format: "datetime",
							description: "When this author first described the organization."
						},
						updatedAt: {
							type: "string",
							format: "datetime",
							description: "When this author last saved this version. The most recently edited version is the one shown, unless the organization publishes its own."
						}
					}
				}
			},
			location: {
				type: "object",
				properties: {
					name: {
						type: "string",
						maxLength: 1e3,
						maxGraphemes: 100,
						description: "City or place name."
					},
					address: {
						type: "string",
						maxLength: 2e3,
						maxGraphemes: 200
					},
					country: {
						type: "string",
						maxLength: 1e3,
						maxGraphemes: 100
					},
					countryCode: {
						type: "string",
						minLength: 2,
						maxLength: 2,
						description: "ISO 3166-1 alpha-2 code of the country (e.g. 'DE'), alongside its name."
					},
					latitude: {
						type: "string",
						maxLength: 32,
						description: "Decimal degrees, as a string."
					},
					longitude: {
						type: "string",
						maxLength: 32,
						description: "Decimal degrees, as a string."
					}
				}
			},
			jobBoard: {
				type: "object",
				description: "Where the organization publishes its jobs.",
				properties: {
					provider: {
						type: "string",
						maxLength: 64,
						knownValues: [
							"ashby",
							"greenhouse",
							"lever",
							"personio",
							"recruitee",
							"rippling",
							"smartrecruiters",
							"workable"
						]
					},
					id: {
						type: "string",
						maxLength: 256,
						description: "The organization's identifier at the provider."
					},
					url: {
						type: "string",
						format: "uri",
						description: "Careers page, when there is no supported provider."
					}
				}
			}
		}
	},
	{
		lexicon: 1,
		id: "today.joblist.job",
		description: "A job offer, posted by anyone. When the author's handle equals the company key (its domain), it is the company's own offer. Offers expire; renew to extend. Applications never go through joblist: `apply` says where to send them.",
		defs: {
			main: {
				type: "record",
				key: "tid",
				record: {
					type: "object",
					required: [
						"title",
						"company",
						"url",
						"createdAt",
						"expiresAt"
					],
					properties: {
						title: {
							type: "string",
							maxLength: 2e3,
							maxGraphemes: 200
						},
						company: {
							type: "string",
							maxLength: 253,
							description: "Company record key: its domain, lowercase, without 'www.' (see today.joblist.company)."
						},
						url: {
							type: "string",
							format: "uri",
							description: "Where to read the offer: its page on the company's site or job board, or its joblist page. May equal the application link."
						},
						description: {
							type: "string",
							maxLength: 1e5,
							maxGraphemes: 1e4
						},
						locations: {
							type: "array",
							maxLength: 20,
							items: {
								type: "ref",
								ref: "today.joblist.company#location"
							}
						},
						remote: {
							type: "string",
							knownValues: [
								"onsite",
								"hybrid",
								"remote"
							]
						},
						employment: {
							type: "string",
							knownValues: [
								"full-time",
								"part-time",
								"contract",
								"internship",
								"volunteer"
							]
						},
						apply: {
							type: "ref",
							ref: "#apply"
						},
						salary: {
							type: "ref",
							ref: "#salary"
						},
						status: {
							type: "string",
							maxLength: 32,
							knownValues: [
								"open",
								"filled",
								"closed"
							],
							description: "Whether the offer still takes applications. Missing means open; a filled or closed offer is no longer shown."
						},
						applicantLocations: {
							type: "array",
							maxLength: 50,
							description: "Countries applicants can work from (ISO 3166-1 alpha-2 codes, e.g. 'DE'), for remote offers.",
							items: {
								type: "string",
								minLength: 2,
								maxLength: 2
							}
						},
						langs: {
							type: "array",
							maxLength: 3,
							description: "Languages the offer is written in (BCP-47 tags).",
							items: {
								type: "string",
								format: "language"
							}
						},
						createdAt: {
							type: "string",
							format: "datetime"
						},
						updatedAt: {
							type: "string",
							format: "datetime",
							description: "When the poster last edited the offer."
						},
						expiresAt: {
							type: "string",
							format: "datetime",
							description: "After this date the offer is no longer shown."
						}
					}
				}
			},
			salary: {
				type: "object",
				description: "What the job pays, in whole units of the currency (not cents). At least one of min and max.",
				required: ["currency", "period"],
				properties: {
					min: {
						type: "integer",
						minimum: 0
					},
					max: {
						type: "integer",
						minimum: 0
					},
					currency: {
						type: "string",
						minLength: 3,
						maxLength: 3,
						description: "ISO 4217 code, e.g. 'EUR'."
					},
					period: {
						type: "string",
						maxLength: 16,
						knownValues: [
							"year",
							"month",
							"week",
							"day",
							"hour"
						]
					}
				}
			},
			apply: {
				type: "object",
				description: "How to apply. Applications go straight to the poster: joblist never receives them.",
				properties: {
					url: {
						type: "string",
						format: "uri",
						description: "An application form (https://…) or an email address (mailto:…)."
					},
					bluesky: {
						type: "boolean",
						description: "Apply by sending a direct message to the poster's account on Bluesky."
					}
				}
			}
		}
	},
	{
		lexicon: 1,
		id: "today.joblist.list",
		description: "A list of companies curated by its author, who can let others add to it.",
		defs: { main: {
			type: "record",
			key: "tid",
			record: {
				type: "object",
				required: [
					"name",
					"companies",
					"createdAt"
				],
				properties: {
					name: {
						type: "string",
						maxLength: 1e3,
						maxGraphemes: 100
					},
					description: {
						type: "string",
						maxLength: 3e4,
						maxGraphemes: 3e3
					},
					companies: {
						type: "array",
						maxLength: 2e3,
						description: "Company record keys (domains), in the curator's order.",
						items: {
							type: "string",
							maxLength: 253
						}
					},
					copiedFrom: {
						type: "string",
						format: "at-uri",
						description: "The list this one was copied from."
					},
					open: {
						type: "boolean",
						description: "Anyone can add companies: companies suggested for this list (today.joblist.suggestion records) are shown in it at once, credited to who suggested them. Otherwise the author accepts or dismisses each one."
					},
					hidden: {
						type: "array",
						maxLength: 2e3,
						description: "Company record keys suggested by others that the author hid or dismissed.",
						items: {
							type: "string",
							maxLength: 253
						}
					},
					createdAt: {
						type: "string",
						format: "datetime"
					}
				}
			}
		} }
	},
	{
		lexicon: 1,
		id: "today.joblist.suggestion",
		description: "A company someone suggests for a list they do not own, written in their own repository. Open lists show it at once, credited to its author; for other lists, the list's author accepts or dismisses it.",
		defs: { main: {
			type: "record",
			key: "tid",
			record: {
				type: "object",
				required: [
					"list",
					"company",
					"createdAt"
				],
				properties: {
					list: {
						type: "string",
						format: "at-uri",
						description: "The today.joblist.list the company is suggested for."
					},
					company: {
						type: "string",
						maxLength: 253,
						description: "Company record key (its domain)."
					},
					note: {
						type: "string",
						maxLength: 3e3,
						maxGraphemes: 300,
						description: "Why it belongs in the list."
					},
					createdAt: {
						type: "string",
						format: "datetime"
					}
				}
			}
		} }
	}
].map((e) => [e.id, e]));
//#endregion
//#region src/lib/models/paste.js
function ho(e) {
	return e.split(/[-_\s]+/).filter(Boolean).map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(" ");
}
//#endregion
//#region src/lib/models/snapshot-job.js
function go(e) {
	if (e.s?.startsWith("at://")) return null;
	let t = ca(e.u);
	if (!t) return null;
	let n = e.i ?? t.slice(t.lastIndexOf("/") + 1);
	return {
		title: e.t,
		url: t,
		company: e.c,
		location: e.l,
		department: e.d,
		published: e.p,
		id: n,
		remote: e.r || "",
		point: e.g,
		salary: va(e.m)
	};
}
//#endregion
//#region embed/src/find.js
function _o(e) {
	let t = e.trim(), [, n, r] = t.match(/^([a-z]+):([^/\s]+)$/) || [];
	return n && r && sa.some((e) => e.id === n) ? {
		provider: n,
		id: r
	} : t ? mo(t) : null;
}
async function vo(e, t) {
	let n = await so({
		key: t,
		jobBoard: e
	});
	return Qi(n), n;
}
async function yo({ board: e, company: t, index: n, dir: r }) {
	if (e) {
		let [t, n] = await Promise.all([uo(e), vo(e, e.id)]);
		return {
			name: t || ho(e.id),
			jobs: n
		};
	}
	if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(t)) return null;
	let i = await fetch(`${n}/${r}/${t}.json`).then((e) => e.ok ? e.json() : null).catch(() => null);
	if (!i) return null;
	let a = Array.isArray(i.jobs) ? i.jobs : [], o = a.filter((e) => e.s && ca(e.u)).map((e) => ({
		title: String(e.t),
		url: ca(e.u),
		company: t,
		location: e.l,
		published: e.p,
		id: String(e.s),
		remote: e.r || ""
	})), s = a.map(go).filter((e) => e !== null), c = i.board?.provider && i.board?.id ? {
		provider: String(i.board.provider),
		id: String(i.board.id)
	} : null, l = c ? await vo(c, t) : [], u = new Map(s.map((e) => [e.url, e.remote])), d = l.map((e) => e.remote ? e : {
		...e,
		remote: u.get(e.url) || ""
	}), f = [...o, ...d.length ? d : s];
	return Qi(f), {
		name: String(i.name || t),
		jobs: f
	};
}
//#endregion
//#region embed/src/JoblistJobs.svelte
var bo = /* @__PURE__ */ q("<p class=\"svelte-uruhdc\"> </p>"), xo = /* @__PURE__ */ q("<label class=\"svelte-uruhdc\"> </label> <input type=\"search\" class=\"svelte-uruhdc\"/>", 1), So = /* @__PURE__ */ q("<li class=\"svelte-uruhdc\"><a target=\"_blank\" rel=\"noopener\" class=\"svelte-uruhdc\"><!></a></li>"), Co = /* @__PURE__ */ q("<ul class=\"svelte-uruhdc\"></ul>"), wo = /* @__PURE__ */ q("<a target=\"_blank\" rel=\"noopener\" class=\"svelte-uruhdc\"> </a> ·", 1), To = /* @__PURE__ */ q("<p class=\"svelte-uruhdc\"> </p> <!> <footer class=\"svelte-uruhdc\"><!> <a target=\"_blank\" rel=\"noopener\" class=\"svelte-uruhdc\"> </a></footer>", 1), Eo = /* @__PURE__ */ q("<h2 class=\"svelte-uruhdc\"><a target=\"_blank\" rel=\"noopener\" class=\"svelte-uruhdc\"> </a></h2> <!> <!>", 1), Do = /* @__PURE__ */ q("<jl-embed><!></jl-embed>", 2), Oo = {
	hash: "svelte-uruhdc",
	code: "\n	/* joblist's tokens (src/app.css), here on any page: its colors from the page's, unless set. */jl-embed.svelte-uruhdc {--space-xxs: 0.125rem;--space-xs: 0.25rem;--space-s: 0.5rem;--space-m: 1rem;--radius: 0.5rem;--radius-round: 999px;--font-size-small: 0.875rem;--font-weight-strong: 600;--chip-line: 1.6;--color-fg: var(--joblist-fg, currentColor);--color-muted: var(--joblist-muted, rgb(128 128 128));--color-soft: var(--joblist-soft, rgb(128 128 128 / 0.14));--color-line: var(--joblist-line, rgb(128 128 128 / 0.3));--color-warn: var(--joblist-warn, #8a5a00);--color-accent: var(--joblist-accent, currentColor);display:block;font-family:var(--joblist-font, inherit);color:var(--color-fg);line-height:1.45;}h2.svelte-uruhdc {margin:0 0 var(--space-s);font-size:1.15em;}a.svelte-uruhdc {color:inherit;}h2.svelte-uruhdc a:where(.svelte-uruhdc) {text-decoration:none;}h2.svelte-uruhdc a:where(.svelte-uruhdc):hover {text-decoration:underline;}label.svelte-uruhdc {position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);}input.svelte-uruhdc {box-sizing:border-box;width:100%;margin:0 0 var(--space-s);padding:var(--space-s) var(--space-m);font:inherit;color:inherit;background:transparent;border:1px solid var(--color-line);border-radius:var(--radius);}p.svelte-uruhdc,\n	footer.svelte-uruhdc {margin:0;color:var(--color-muted);font-size:var(--font-size-small);}footer.svelte-uruhdc {margin-top:var(--space-s);}footer.svelte-uruhdc a:where(.svelte-uruhdc) {color:var(--color-accent);}ul.svelte-uruhdc {margin:var(--space-xs) 0 0;padding:0;list-style:none;}\n	/* The site's job cards: a line between them, the title underlined on hover. */li.svelte-uruhdc {border-bottom:1px solid var(--color-line);}li.svelte-uruhdc a:where(.svelte-uruhdc) {display:block;padding:var(--space-s) 0;text-decoration:none;}li.svelte-uruhdc a:where(.svelte-uruhdc):hover strong {text-decoration:underline;}"
};
function ko(e, t) {
	Ge(t, !0), Nr(e, Oo);
	let n = Xr(t, "board", 3, ""), r = Xr(t, "company", 3, ""), i = Xr(t, "index", 3, ""), a = Xr(t, "lang", 3, ""), o = Xr(t, "limit", 3, 0), s = Xr(t, "query", 3, ""), c = Xr(t, "where", 3, ""), l = Xr(t, "remote", 3, ""), u = Xr(t, "search", 3, !1), d = {
		snapshot: "https://raw.githubusercontent.com/joblisttoday/joblist-snapshot/gh-pages",
		dir: "companies",
		site: "https://joblist.today",
		shown: 20,
		strings: {
			en: {
				"embed.title": "Open jobs at {name}",
				"embed.count": "{count} open jobs",
				"embed.count.one": "1 open job",
				"embed.none": "No open jobs right now.",
				"embed.more": "See all {count}",
				"embed.by": "on joblist",
				"embed.error": "The jobs could not be read.",
				"embed.search": "Search these jobs",
				"embed.page": "As your own jobs page",
				"embed.page.intro": "A whole page to put at jobs.your-domain or your-domain/jobs, on any static host (GitHub Pages, Cloudflare Pages, your server). Change query, where or remote to show only some jobs.",
				"embed.section": "Show these jobs on your site",
				"embed.intro": "Paste one of these in your website: the list stays up to date by itself.",
				"embed.iframe": "As a frame (any site)",
				"embed.element": "As an element (styled by your site)",
				"embed.copy": "Copy",
				"embed.copied": "Copied",
				"job.distance.bike": "{minutes} min · {km} km",
				"job.distance.walk": "{minutes} min · {km} km",
				"job.where": "Where",
				"job.company.more": "{count} open jobs at {name}",
				"job.company.more.one": "1 open job at {name}",
				"job.company.one": "The only open job at {name}",
				"job.new": "New",
				"job.older": "Open for a while",
				"job.older.hint": "First seen more than {days} days ago: it may already be filled.",
				"job.places.more": "and {count} more places",
				"job.places.more.one": "and 1 more place",
				"job.verified": "posted by the organization",
				"job.sharedBy": "shared by",
				"job.notFromCompany": "Not from {company}: {company} posts its own offers here, and this one was shared by someone else. To apply, go to {company}'s own website.",
				"job.remote.onsite": "On site",
				"job.remote.hybrid": "Hybrid",
				"job.remote.remote": "Remote",
				"job.salary.year": "{amount} a year",
				"job.salary.month": "{amount} a month",
				"job.salary.week": "{amount} a week",
				"job.salary.day": "{amount} a day",
				"job.salary.hour": "{amount} an hour",
				"job.employment.full-time": "Full time",
				"job.employment.part-time": "Part time",
				"job.employment.contract": "Contract",
				"job.employment.internship": "Internship",
				"job.employment.volunteer": "Volunteer",
				"job.apply": "How to apply",
				"job.apply.link": "Apply on their site",
				"job.apply.email": "Apply by email",
				"job.apply.bluesky": "Message @{handle} on Bluesky",
				"job.apply.bluesky.help": "Opens their Bluesky profile: send them a message from there.",
				"job.apply.privacy": "Your application goes straight to the poster: joblist never sees it.",
				"job.apply.none": "The poster did not say how to apply. Read the full offer.",
				"job.description.loading": "Reading the description…",
				"job.description.none": "The job board gives no description: read the full offer.",
				"job.offer": "Full offer",
				"job.posted": "Posted {ago}",
				"job.until": "Shown until {date}",
				"job.expired": "Expired: no longer shown.",
				"job.notFound": "This job offer does not exist, or its poster removed it.",
				"job.notFoundTitle": "Job not found",
				"job.at": "{title} at {company}"
			},
			fr: {
				"embed.title": "Offres chez {name}",
				"embed.count": "{count} offres",
				"embed.count.one": "1 offre",
				"embed.none": "Aucune offre pour l'instant.",
				"embed.more": "Voir les {count}",
				"embed.by": "sur joblist",
				"embed.error": "Les offres n'ont pas pu être lues.",
				"embed.search": "Chercher dans ces offres",
				"embed.page": "Comme votre propre page emplois",
				"embed.page.intro": "Une page entière à mettre sur jobs.votre-domaine ou votre-domaine/jobs, chez n'importe quel hébergeur statique (GitHub Pages, Cloudflare Pages, votre serveur). Changez query, where ou remote pour n'en montrer qu'une partie.",
				"embed.section": "Afficher ces offres sur votre site",
				"embed.intro": "Collez l'un de ces codes dans votre site : la liste se met à jour toute seule.",
				"embed.iframe": "En cadre (tout site)",
				"embed.element": "En élément (au style de votre site)",
				"embed.copy": "Copier",
				"embed.copied": "Copié",
				"job.distance.bike": "{minutes} min · {km} km",
				"job.distance.walk": "{minutes} min · {km} km",
				"job.where": "Où",
				"job.company.more": "{count} offres chez {name}",
				"job.company.more.one": "1 offre chez {name}",
				"job.company.one": "La seule offre chez {name}",
				"job.new": "Nouveau",
				"job.older": "En ligne depuis longtemps",
				"job.older.hint": "Vue pour la première fois il y a plus de {days} jours : elle est peut-être déjà pourvue.",
				"job.places.more": "et {count} autres lieux",
				"job.places.more.one": "et 1 autre lieu",
				"job.verified": "publiée par l'organisation",
				"job.sharedBy": "partagée par",
				"job.notFromCompany": "Pas de {company} : {company} publie ses propres offres ici, et celle-ci a été partagée par quelqu'un d'autre. Pour postuler, passez par le site de {company}.",
				"job.remote.onsite": "Sur place",
				"job.remote.hybrid": "Hybride",
				"job.remote.remote": "Télétravail",
				"job.salary.year": "{amount} par an",
				"job.salary.month": "{amount} par mois",
				"job.salary.week": "{amount} par semaine",
				"job.salary.day": "{amount} par jour",
				"job.salary.hour": "{amount} de l'heure",
				"job.employment.full-time": "Temps plein",
				"job.employment.part-time": "Temps partiel",
				"job.employment.contract": "Contrat de mission",
				"job.employment.internship": "Stage",
				"job.employment.volunteer": "Bénévolat",
				"job.apply": "Comment postuler",
				"job.apply.link": "Postuler sur leur site",
				"job.apply.email": "Postuler par e-mail",
				"job.apply.bluesky": "Écrire à @{handle} sur Bluesky",
				"job.apply.bluesky.help": "Ouvre son profil Bluesky : envoyez-lui un message depuis là.",
				"job.apply.privacy": "Votre candidature va directement à l'auteur de l'offre : joblist ne la voit jamais.",
				"job.apply.none": "L'auteur n'a pas dit comment postuler. Lisez l'offre complète.",
				"job.description.loading": "Lecture de la description…",
				"job.description.none": "Le site d'emploi ne donne pas de description : lisez l'offre complète.",
				"job.offer": "Offre complète",
				"job.posted": "Publiée {ago}",
				"job.until": "Affichée jusqu'au {date}",
				"job.expired": "Expirée : elle n'est plus affichée.",
				"job.notFound": "Cette offre n'existe pas, ou son auteur l'a retirée.",
				"job.notFoundTitle": "Offre introuvable",
				"job.at": "{title} chez {company}"
			},
			de: {
				"embed.title": "Offene Stellen bei {name}",
				"embed.count": "{count} offene Stellen",
				"embed.count.one": "1 offene Stelle",
				"embed.none": "Gerade keine offenen Stellen.",
				"embed.more": "Alle {count} ansehen",
				"embed.by": "auf joblist",
				"embed.error": "Die Jobs konnten nicht gelesen werden.",
				"embed.search": "Diese Jobs durchsuchen",
				"embed.page": "Als deine eigene Jobseite",
				"embed.page.intro": "Eine ganze Seite für jobs.deine-domain oder deine-domain/jobs, auf jedem statischen Hosting (GitHub Pages, Cloudflare Pages, dein Server). Ändere query, where oder remote, um nur einige Jobs zu zeigen.",
				"embed.section": "Diese Jobs auf deiner Website zeigen",
				"embed.intro": "Füg eins davon in deine Website ein: Die Liste bleibt von selbst aktuell.",
				"embed.iframe": "Als Frame (jede Website)",
				"embed.element": "Als Element (im Stil deiner Website)",
				"embed.copy": "Kopieren",
				"embed.copied": "Kopiert",
				"job.distance.bike": "{minutes} Min. · {km} km",
				"job.distance.walk": "{minutes} Min. · {km} km",
				"job.where": "Wo",
				"job.company.more": "{count} offene Stellen bei {name}",
				"job.company.more.one": "1 offene Stelle bei {name}",
				"job.company.one": "Die einzige offene Stelle bei {name}",
				"job.new": "Neu",
				"job.older": "Schon länger offen",
				"job.older.hint": "Zuerst vor mehr als {days} Tagen gesehen: Sie ist vielleicht schon besetzt.",
				"job.places.more": "und {count} weitere Orte",
				"job.places.more.one": "und 1 weiterer Ort",
				"job.verified": "von der Organisation veröffentlicht",
				"job.sharedBy": "geteilt von",
				"job.notFromCompany": "Nicht von {company}: {company} veröffentlicht ihre eigenen Angebote hier, und dieses wurde von jemand anderem geteilt. Um dich zu bewerben, geh auf die eigene Website von {company}.",
				"job.remote.onsite": "Vor Ort",
				"job.remote.hybrid": "Hybrid",
				"job.remote.remote": "Remote",
				"job.salary.year": "{amount} pro Jahr",
				"job.salary.month": "{amount} pro Monat",
				"job.salary.week": "{amount} pro Woche",
				"job.salary.day": "{amount} pro Tag",
				"job.salary.hour": "{amount} pro Stunde",
				"job.employment.full-time": "Vollzeit",
				"job.employment.part-time": "Teilzeit",
				"job.employment.contract": "Befristet",
				"job.employment.internship": "Praktikum",
				"job.employment.volunteer": "Ehrenamt",
				"job.apply": "So bewirbst du dich",
				"job.apply.link": "Auf ihrer Website bewerben",
				"job.apply.email": "Per E-Mail bewerben",
				"job.apply.bluesky": "@{handle} auf Bluesky schreiben",
				"job.apply.bluesky.help": "Öffnet das Bluesky-Profil: Schick von dort eine Nachricht.",
				"job.apply.privacy": "Deine Bewerbung geht direkt an die ausschreibende Stelle: joblist sieht sie nie.",
				"job.apply.none": "Es wurde nicht angegeben, wie man sich bewirbt. Lies das vollständige Angebot.",
				"job.description.loading": "Beschreibung wird gelesen…",
				"job.description.none": "Die Jobbörse liefert keine Beschreibung: Lies das vollständige Angebot.",
				"job.offer": "Vollständiges Angebot",
				"job.posted": "Veröffentlicht {ago}",
				"job.until": "Angezeigt bis {date}",
				"job.expired": "Abgelaufen: wird nicht mehr angezeigt.",
				"job.notFound": "Dieses Jobangebot gibt es nicht, oder es wurde entfernt.",
				"job.notFoundTitle": "Job nicht gefunden",
				"job.at": "{title} bei {company}"
			},
			es: {
				"embed.title": "Ofertas abiertas en {name}",
				"embed.count": "{count} ofertas abiertas",
				"embed.count.one": "1 oferta abierta",
				"embed.none": "No hay ofertas abiertas por ahora.",
				"embed.more": "Ver las {count}",
				"embed.by": "en joblist",
				"embed.error": "No se pudieron leer las ofertas.",
				"embed.search": "Buscar en estas ofertas",
				"embed.page": "Como tu propia página de empleo",
				"embed.page.intro": "Una página completa para poner en jobs.tu-dominio o tu-dominio/jobs, en cualquier hosting estático (GitHub Pages, Cloudflare Pages, tu servidor). Cambia query, where o remote para mostrar solo algunas ofertas.",
				"embed.section": "Muestra estas ofertas en tu sitio",
				"embed.intro": "Pega uno de estos en tu sitio web: la lista se mantiene al día sola.",
				"embed.iframe": "Como marco (cualquier sitio)",
				"embed.element": "Como elemento (con el estilo de tu sitio)",
				"embed.copy": "Copiar",
				"embed.copied": "Copiado",
				"job.distance.bike": "{minutes} min · {km} km",
				"job.distance.walk": "{minutes} min · {km} km",
				"job.where": "Dónde",
				"job.company.more": "{count} ofertas abiertas en {name}",
				"job.company.more.one": "1 oferta abierta en {name}",
				"job.company.one": "La única oferta abierta en {name}",
				"job.new": "Nueva",
				"job.older": "Abierta hace tiempo",
				"job.older.hint": "Vista por primera vez hace más de {days} días: puede que ya esté cubierta.",
				"job.places.more": "y {count} lugares más",
				"job.places.more.one": "y 1 lugar más",
				"job.verified": "publicada por la organización",
				"job.sharedBy": "compartida por",
				"job.notFromCompany": "No es de {company}: {company} publica sus propias ofertas aquí, y esta la compartió otra persona. Para postularte, ve al sitio web de {company}.",
				"job.remote.onsite": "Presencial",
				"job.remote.hybrid": "Híbrido",
				"job.remote.remote": "Remoto",
				"job.salary.year": "{amount} al año",
				"job.salary.month": "{amount} al mes",
				"job.salary.week": "{amount} a la semana",
				"job.salary.day": "{amount} al día",
				"job.salary.hour": "{amount} la hora",
				"job.employment.full-time": "Jornada completa",
				"job.employment.part-time": "Media jornada",
				"job.employment.contract": "Contrato temporal",
				"job.employment.internship": "Prácticas",
				"job.employment.volunteer": "Voluntariado",
				"job.apply": "Cómo postularte",
				"job.apply.link": "Postúlate en su sitio",
				"job.apply.email": "Postúlate por email",
				"job.apply.bluesky": "Escribe a @{handle} en Bluesky",
				"job.apply.bluesky.help": "Abre su perfil de Bluesky: envíale un mensaje desde allí.",
				"job.apply.privacy": "Tu postulación va directo a quien publicó la oferta: joblist nunca la ve.",
				"job.apply.none": "Quien la publicó no dijo cómo postularse. Lee la oferta completa.",
				"job.description.loading": "Leyendo la descripción…",
				"job.description.none": "El portal de empleo no da descripción: lee la oferta completa.",
				"job.offer": "Oferta completa",
				"job.posted": "Publicada {ago}",
				"job.until": "Visible hasta el {date}",
				"job.expired": "Vencida: ya no se muestra.",
				"job.notFound": "Esta oferta no existe, o quien la publicó la quitó.",
				"job.notFoundTitle": "Oferta no encontrada",
				"job.at": "{title} en {company}"
			}
		}
	}, f = `jl-${Math.random().toString(36).slice(2, 8)}`;
	mn(() => {
		let e = (a() || document.documentElement.lang || navigator.language || "en").slice(0, 2).toLowerCase();
		Qr.locale = e in d.strings ? e : "en";
	});
	let p = /* @__PURE__ */ pt(() => ({
		board: _o(n() || ""),
		company: (r() || "").trim().toLowerCase(),
		index: (i() || d.snapshot).replace(/\/$/, ""),
		dir: d.dir
	})), m = /* @__PURE__ */ j(void 0);
	mn(() => {
		let e = K(p);
		M(m, void 0), yo(e).then((t) => e === K(p) && M(m, t, !0));
	});
	let h = /* @__PURE__ */ j(""), g = /* @__PURE__ */ pt(() => new Map(K(m) ? [[K(m).jobs[0]?.company || "", K(m).name]] : [])), _ = /* @__PURE__ */ pt(() => K(m) ? Gi(Ui(K(m).jobs, {
		query: `${s() || ""} ${K(h)}`.trim(),
		where: c() || "",
		remote: l() === "remote" ? "remote" : ""
	}, K(g))) : []), v = /* @__PURE__ */ pt(() => K(_).slice(0, Math.max(1, Number(o()) || d.shown))), y = /* @__PURE__ */ pt(() => Z("embed.count", { count: K(_).length })), b = /* @__PURE__ */ pt(() => K(p).company ? `${d.site}/${K(p).company}` : K(p).board ? `${d.site}/me/organization#${new URLSearchParams({ url: n() || "" })}` : d.site);
	var x = Do();
	Ir(x, 1, "svelte-uruhdc");
	var S = tn(x), ee = (e) => {
		var t = bo(), n = P(t, !0);
		bn((e) => Y(n, e), [() => Z("embed.error")]), J(e, t);
	}, te = (e) => {
		var t = Eo(), n = nn(t), r = tn(n), i = P(r, !0);
		Ee(n);
		var a = F(n, 2), o = (e) => {
			var t = xo(), n = nn(t), r = P(n, !0), i = F(n, 2);
			Br(i), bn((e, t) => {
				Vr(n, "for", `${f}-search`), Y(r, e), Vr(i, "id", `${f}-search`), Vr(i, "placeholder", t);
			}, [() => Z("embed.search"), () => Z("embed.search")]), Gr(i, () => K(h), (e) => M(h, e)), J(e, t);
		};
		Cr(a, (e) => {
			u() && e(o);
		});
		var s = F(a, 2), c = (e) => {
			var t = To(), n = nn(t), r = P(n, !0), i = F(n, 2), a = (e) => {
				var t = Co();
				Dr(t, 21, () => K(v), (e) => e.url, (e, t) => {
					var n = So(), r = tn(n), i = tn(r);
					{
						let e = /* @__PURE__ */ pt(() => oa(K(t), {
							t: Z,
							locale: Qr.locale
						}));
						ri(i, {
							get title() {
								return K(t).title;
							},
							get facts() {
								return K(e);
							}
						});
					}
					Ee(r), Ee(n), bn(() => Vr(r, "href", K(t).url)), J(e, n);
				}), Ee(t), J(e, t);
			}, o = (e) => {
				var t = bo(), n = P(t, !0);
				bn((e) => Y(n, e), [() => Z("embed.none")]), J(e, t);
			};
			Cr(i, (e) => {
				K(v).length ? e(a) : e(o, -1);
			});
			var s = F(i, 2), c = tn(s), l = (e) => {
				var t = wo(), n = nn(t), r = P(n, !0);
				De(), bn((e) => {
					Vr(n, "href", K(b)), Y(r, e);
				}, [() => Z("embed.more", { count: K(y) })]), J(e, t);
			};
			Cr(c, (e) => {
				K(_).length > K(v).length && e(l);
			});
			var u = F(c, 2), f = P(u, !0);
			Ee(s), bn((e) => {
				Y(r, K(y)), Vr(u, "href", d.site), Y(f, e);
			}, [() => Z("embed.by")]), J(e, t);
		};
		Cr(s, (e) => {
			K(m) && e(c);
		}), bn((e) => {
			Vr(r, "href", K(b)), Y(i, e);
		}, [() => Z("embed.title", { name: K(m)?.name || K(p).board?.id || K(p).company })]), J(e, t);
	};
	Cr(S, (e) => {
		K(m) === null ? e(ee) : e(te, -1);
	}), Ee(x), J(e, x), Ke();
}
//#endregion
//#region embed/src/joblist-jobs.svelte.js
var Ao = [
	"board",
	"company",
	"index",
	"lang",
	"limit",
	"query",
	"where",
	"remote",
	"search"
], jo = class extends HTMLElement {
	static observedAttributes = Ao;
	#e = /* @__PURE__ */ j(qt({}));
	get props() {
		return K(this.#e);
	}
	set props(e) {
		M(this.#e, e, !0);
	}
	connectedCallback() {
		if (!this.shadowRoot) {
			for (let e of Ao) this.read(e);
			_r(ko, {
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
		this.props[e] = e === "search" ? t !== null : t ?? "";
	}
};
customElements.get("joblist-jobs") || customElements.define("joblist-jobs", jo);
//#endregion
