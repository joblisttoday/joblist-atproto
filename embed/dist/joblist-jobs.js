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
		r: B,
		l: null
	};
}
function Ke(e) {
	var t = E, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) _n(r);
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
	var t = L, n = B;
	z(null), V(null);
	try {
		return e();
	} finally {
		z(t), V(n);
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
	var s = B, c = st(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				un(e, s);
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
		Promise.all(n.map((e) => /* @__PURE__ */ ft(e))).then(u).catch((e) => un(e, s)).finally(d);
	}
	l ? l.then(() => {
		s.f & 16384 ? d() : (c(), f(), ct());
	}) : f();
}
function st() {
	var e = B, t = L, n = E, r = O;
	return function(i = !0) {
		V(e), z(t), We(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ct(e = !0) {
	V(null), z(null), We(null), e && O?.deactivate();
}
function lt() {
	var e = B, t = e.b, n = O, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function ut(e) {
	var t = 2 | b;
	return B !== null && (B.f |= ie), {
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
		parent: B,
		ac: null
	};
}
var dt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function ft(e, t, n) {
	let i = B;
	i === null && Ne();
	var a = void 0, o = zt(r), s = !L, c = /* @__PURE__ */ new Set();
	return bn(() => {
		var t = B, n = v();
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
	}), hn(() => {
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
	return Rn(t), t;
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
		for (var n = 0; n < t.length; n += 1) I(t[n]);
	}
}
function gt(e) {
	var t, n = B, i = e.parent;
	if (!Fn && i !== null && e.v !== r && i.f & 24576) return xe(), e.v;
	V(i);
	try {
		ht(e), t = qn(e);
	} finally {
		V(n);
	}
	return t;
}
function _t(e) {
	var t = gt(e);
	!e.equals(t) && (e.wv = Wn(), (!O?.is_fork || e.deps === null) && (O === null ? e.v = t : (O.capture(e, t, !0), xt?.capture(e, t, !0)), e.deps === null)) ? D(e, y) : Fn || (k === null ? et(e) : (mn() || O?.is_fork) && k.set(e, t));
}
function vt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && it(() => {
		t.ac.abort(ye), t.ac = null;
	}), t.fn !== null && (t.teardown = g), Xn(t, 0), Tn(t));
}
function yt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Zn(t);
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
				a ? r.f ^= y : i & 4 ? t.push(r) : Gn(r) && (i & 16 && this.#d.add(r), Zn(r));
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
		un(e, St);
	}
}
var Mt = null;
function Nt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Gn(r) && (Mt = /* @__PURE__ */ new Set(), Zn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && On(r), Mt?.size > 0)) {
				A.clear();
				for (let e of Mt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Mt.has(n) && (Mt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Zn(n);
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
	return Rn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Bt(e, t = !1, n = !0) {
	let r = zt(e);
	return t || (r.equals = Me), r;
}
function M(e, t, n = !1) {
	return L !== null && (!R || L.f & 131072) && Je() && L.f & 4325394 && (Ln === null || !Ln.has(e)) && He(), Ut(e, n ? qt(t) : t, Et);
}
var Vt = null, Ht = 0;
function Ut(e, t, n = null) {
	if (!e.equals(t)) {
		Fn ? A.set(e, t) : A.has(e) || A.set(e, e.v);
		var r = kt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && gt(t), k === null && et(t);
		}
		e.wv = Wn(), Vt = null, Ht = 0, Kt(e, b, n), Vt = null, Je() && B !== null && B.f & 1024 && !(B.f & 96) && (W === null ? zn([e]) : W.push(e)), !r.is_fork && Lt.size > 0 && !Rt && Wt();
	}
	return t;
}
function Wt() {
	Rt = !1;
	for (let e of Lt) {
		e.f & 1024 && D(e, x);
		let t;
		try {
			t = Gn(e);
		} catch {
			t = !0;
		}
		t && Zn(e);
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
			if (i || s !== B) {
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
	var n = /* @__PURE__ */ new Map(), i = a(e), o = /* @__PURE__ */ j(0), s = null, c = Hn, l = (e) => {
		if (Hn === c) return e();
		var t = L, n = Hn;
		z(null), Un(c);
		var r = e();
		return z(t), Un(n), r;
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
				var d = G(o);
				return d === r ? void 0 : d;
			}
			return Reflect.get(t, i, a);
		},
		getOwnPropertyDescriptor(e, t) {
			this.has?.(e, t);
			var i = Reflect.getOwnPropertyDescriptor(e, t), a = n.get(t);
			if (a !== void 0) {
				var o = G(a);
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
			return (i !== void 0 || B !== null && (!a || u(e, t)?.writable)) && (i === void 0 && (i = l(() => /* @__PURE__ */ j(a ? qt(e[t]) : r, s)), n.set(t, i)), G(i) === r) ? !1 : a;
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
			G(o);
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
	return t && cn(n), T(n), n;
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
		cn(w);
	}
	return w;
}
function P(e, t = !1) {
	if (!C) return /* @__PURE__ */ $t(e);
	var n = tn(e, t);
	return Ee(e), n;
}
function rn(e, t = 1, n = !1) {
	let r = C ? w : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ en(r);
	if (!C) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = N();
			return r === null ? i?.after(a) : r.before(a), T(a), a;
		}
		cn(r);
	}
	return T(r), r;
}
function an(e) {
	e.textContent = "";
}
function on() {
	return !1;
}
function sn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function cn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
function ln(e) {
	var t = B;
	if (t === null) return L.f |= le, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	un(e, t);
}
function un(e, t) {
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
function dn(e) {
	B === null && (L === null && Le(e), Ie()), Fn && Fe(e);
}
function fn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function pn(e, t) {
	var n = B;
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
			Zn(r);
		} catch (e) {
			throw I(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= re));
	}
	if (i !== null && (i.parent = n, n !== null && fn(i, n), L !== null && L.f & 2 && !(e & 64))) {
		var a = L;
		(a.effects ??= []).push(i);
	}
	return r;
}
function mn() {
	return L !== null && !R;
}
function hn(e) {
	let t = pn(8, null);
	return D(t, y), t.teardown = e, t;
}
function gn(e) {
	dn("$effect");
	var t = B.f;
	if (!L && t & 32 && E !== null && !E.i) {
		var n = E;
		(n.e ??= []).push(e);
	} else return _n(e);
}
function _n(e) {
	return pn(4 | ae, e);
}
function vn(e) {
	kt.ensure();
	let t = pn(64 | ie, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? kn(t, () => {
			I(t), n(void 0);
		}) : (I(t), n(void 0));
	});
}
function yn(e) {
	return pn(4, e);
}
function bn(e) {
	return pn(ce | ie, e);
}
function xn(e, t = 0) {
	return pn(8 | t, e);
}
function Sn(e, t = [], n = [], r = []) {
	ot(r, t, n, (t) => {
		pn(8, () => {
			e(...t.map(G));
		});
	});
}
function Cn(e, t = 0) {
	return pn(16 | t, e);
}
function F(e) {
	return pn(32 | ie, e);
}
function wn(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = Fn, r = L;
		In(!0), z(null);
		try {
			t.call(null);
		} catch (t) {
			un(t, e.parent);
		} finally {
			In(n), z(r);
		}
	}
}
function Tn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && it(() => {
			e.abort(ye);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : I(n, t), n = r;
	}
}
function En(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || I(t), t = n;
	}
}
function I(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Dn(e.nodes.start, e.nodes.end), n = !0), e.f |= ne, Tn(e, t && !n), Xn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	wn(e), e.f ^= ne, e.f |= ee;
	var i = e.parent;
	i !== null && i.first !== null && On(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Dn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ en(e);
		e.remove(), e = n;
	}
}
function On(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function kn(e, t, n = !0) {
	var r = [];
	e.f |= 256, An(e, r, !0);
	var i = () => {
		n && I(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function An(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= S;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				An(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function jn(e) {
	e.f &= -257, Mn(e, !0);
}
function Mn(e, t) {
	if (!(e.f & 256) && e.f & 8192) {
		e.f ^= S, e.f & 1024 || (D(e, b), kt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Mn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Nn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ en(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Pn = null, Fn = !1;
function In(e) {
	Fn = e;
}
var L = null, R = !1;
function z(e) {
	L = e;
}
var B = null;
function V(e) {
	B = e;
}
var Ln = null;
function Rn(e) {
	L !== null && (L.f & 2097152 || L.f & 2) && (Ln ??= /* @__PURE__ */ new Set()).add(e);
}
var H = null, U = 0, W = null;
function zn(e) {
	W = e;
}
var Bn = 1, Vn = 0, Hn = Vn;
function Un(e) {
	Hn = e;
}
function Wn() {
	return ++Bn;
}
function Gn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Gn(a) && _t(a), a.wv > e.wv) return !0;
		}
		t & 512 && k === null && D(e, y);
	}
	return !1;
}
function Kn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Ln !== null && Ln.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Kn(a, t, !1) : t === a && (n ? D(a, b) : a.f & 1024 && D(a, x), Pt(a));
	}
}
function qn(e) {
	var t = H, n = U, r = W, i = L, a = Ln, o = E, s = R, c = Hn, l = e.f;
	H = null, U = 0, W = null, L = l & 96 ? null : e, Ln = null, We(e.ctx), R = !1, Hn = ++Vn, e.ac !== null && (it(() => {
		e.ac.abort(ye);
	}), e.ac = null);
	try {
		e.f |= se;
		var u = e.fn, d = u();
		e.f |= te;
		var f = Jn(e);
		if (Je() && W !== null && !R && f !== null && !(e.f & 6146)) for (var p = 0; p < W.length; p++) Kn(W[p], e);
		if (i !== null && i !== e) {
			if (Vn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Vn;
			if (t !== null) for (let e of t) e.rv = Vn;
			W !== null && (r === null ? r = W : r.push(...W));
		}
		return e.f & 8388608 && (e.f ^= le), d;
	} catch (t) {
		return Jn(e), ln(t);
	} finally {
		e.f ^= se, H = t, U = n, W = r, L = i, Ln = a, We(o), R = s, Hn = c;
	}
}
function Jn(e) {
	var t = e.deps, n = O?.is_fork;
	if (H !== null) {
		var r;
		if (n || Xn(e, U), t !== null && U > 0) for (t.length = U + H.length, r = 0; r < H.length; r++) t[U + r] = H[r];
		else e.deps = t = H;
		if (mn() && e.f & 512) for (r = U; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && U < t.length && (Xn(e, U), t.length = U);
	return t;
}
function Yn(e, t) {
	let n = t.reactions;
	if (n !== null) {
		var i = o.call(n, e);
		if (i !== -1) {
			var a = n.length - 1;
			a === 0 ? n = t.reactions = null : (n[i] = n[a], n.pop());
		}
	}
	if (n === null && t.f & 2 && (H === null || !s.call(H, t))) {
		var c = t;
		c.f & 512 && (c.f ^= 512), c.v !== r && et(c), c.ac !== null && it(() => {
			c.ac.abort(ye), c.ac = null, D(c, b);
		}), vt(c), Xn(c, 0);
	}
}
function Xn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Yn(e, n[r]);
}
function Zn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		D(e, y);
		var n = B;
		B = e;
		try {
			t & 16777232 ? En(e) : Tn(e), wn(e);
			var r = qn(e);
			e.teardown = typeof r == "function" ? r : null, e.wv = Bn;
		} finally {
			B = n;
		}
	}
}
async function Qn() {
	await Promise.resolve(), At();
}
function G(e) {
	var t = !!(e.f & 2);
	if (Pn?.add(e), L !== null && !R && !(B !== null && B.f & 16384) && (Ln === null || !Ln.has(e))) {
		var n = L.deps;
		if (L.f & 2097152) e.rv < Vn && (e.rv = Vn, H === null && n !== null && n[U] === e ? U++ : H === null ? H = [e] : H.push(e));
		else {
			L.deps ??= [], s.call(L.deps, e) || L.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [L] : s.call(r, L) || r.push(L);
		}
	}
	if (Fn && A.has(e)) return A.get(e);
	if (t) {
		var i = e;
		if (Fn) {
			var a = i.v;
			return (!(i.f & 1024) && i.reactions !== null || er(i)) && (a = gt(i)), A.set(i, a), a;
		}
		var o = !(i.f & 512) && !R && L !== null && !!(L.f & 512), c = (i.f & te) === 0;
		Gn(i) && (o && (i.f |= 512), _t(i)), o && !c && (yt(i), $n(i));
	}
	if (k?.has(e)) return k.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function $n(e) {
	if (e.f |= 512, e.deps !== null) for (let n of e.deps) {
		var t = n.reactions;
		t === null ? n.reactions = [e] : s.call(t, e) || t.push(e), n.f & 2 && !(n.f & 512) && (yt(n), $n(n));
	}
}
function er(e) {
	if (e.v === r) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (A.has(t) || t.f & 2 && er(t)) return !0;
	return !1;
}
function tr(e) {
	var t = R;
	try {
		return R = !0, e();
	} finally {
		R = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var nr = Symbol("events"), rr = /* @__PURE__ */ new Set(), ir = /* @__PURE__ */ new Set(), ar = null, or = !1;
function sr(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	ar = e, or || (or = !0, setTimeout(() => {
		or = !1, ar = null;
	}));
	var o = 0, s = ar === e && e[nr];
	if (s) {
		var c = i.indexOf(s);
		if (c !== -1 && (t === document || t === window)) {
			e[nr] = t;
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
		var d = L, f = B;
		z(null), V(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[nr]?.[r];
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
			e[nr] = t, delete e.currentTarget, z(d), V(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var cr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function lr(e) {
	return cr?.createHTML(e) ?? e;
}
function ur(e) {
	var t = sn("template");
	return t.innerHTML = lr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function dr(e, t) {
	var n = B;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function K(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (C) return dr(w, null), w;
		i === void 0 && (i = ur(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ $t(i)));
		var t = r || Yt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ $t(t), s = t.lastChild;
			dr(o, s);
		} else dr(t, t);
		return t;
	};
}
function q(e, t) {
	if (C) {
		var n = B;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = w), Te();
	} else e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var fr = ["touchstart", "touchmove"];
function pr(e) {
	return fr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function mr(e) {
	let t = 0, n = zt(0), r;
	return () => {
		mn() && (G(n), xn(() => (t === 0 && (r = tr(() => e(() => Gt(n)))), t += 1, () => {
			Ze(() => {
				--t, t === 0 && (r?.(), r = void 0, Gt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var hr = re | ie;
function gr(e, t, n, r) {
	new _r(e, t, n, r);
}
var _r = class {
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
	#h = mr(() => (this.#m = zt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = B;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = B.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Cn(() => {
			if (C) {
				let e = ke(this.#t);
				Te();
				let t = e === "[!";
				if (e.startsWith("[?")) {
					let t = JSON.parse(e.slice(2));
					this.#_(t);
				} else t ? this.#b() : this.#g();
			} else this.#x();
		}, hr), C && (this.#e = w);
	}
	#g() {
		try {
			this.#a = F(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Ze(r), t && (this.#s = F(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			this.#y() || (t ? Ce() : (t = !0, n && Ue(), this.#s !== null && kn(this.#s, () => {
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
					un(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		return (this.#i.f & (ee | ne)) !== 0;
	}
	#b() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = F(() => e(this.#e)), Ze(() => {
			if (!this.#y()) {
				var e = this.#c = document.createDocumentFragment(), t = N(), n = !1;
				e.append(t), this.#a = this.#C(() => {
					try {
						return F(() => this.#r(t));
					} catch (e) {
						try {
							this.error(e), n = !0;
						} catch (e) {
							un(e, this.#i.parent);
						}
						return null;
					}
				}), this.#a === null ? (this.#c = null, n && this.#S(O)) : this.#u === 0 && (this.#e.before(e), this.#c = null, kn(this.#o, () => {
					this.#o = null;
				}), this.#S(O));
			}
		}));
	}
	#x() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = F(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Nn(this.#a, e);
				let t = this.#n.pending;
				this.#o = F(() => t(this.#e));
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
		var t = B, n = L, r = E;
		V(this.#i), z(this.#i), We(this.#i.ctx);
		try {
			return kt.ensure(), e();
		} finally {
			V(t), z(n), We(r);
		}
	}
	#w(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#S(t), this.#o && kn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#w(e, t);
	}
	update_pending_count(e, t) {
		this.#w(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ze(() => {
			this.#d = !1, this.#m && Ut(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), G(this.#m);
	}
	error(e) {
		if (e === n || !this.#n.onerror && !this.#n.failed) throw e;
		O?.is_fork ? (this.#a && O.skip_effect(this.#a), this.#o && O.skip_effect(this.#o), this.#s && O.skip_effect(this.#s), O.oncommit(() => {
			this.#y() || this.#T(e);
		})) : this.#T(e);
	}
	#T(e) {
		this.#a &&= (I(this.#a), null), this.#o &&= (I(this.#o), null), this.#s &&= (I(this.#s), null), C && (T(this.#t), De(), T(Oe()));
		let t = this.#n.failed, n = (e) => {
			if (this.#y()) return;
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && !this.#y() && (this.#s = this.#C(() => {
				try {
					return F(() => {
						var r = B;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return un(e, this.#i.parent), null;
				}
			}));
		};
		Ze(() => {
			if (!this.#y()) {
				var t;
				try {
					t = this.transform_error(e);
				} catch (e) {
					un(e, this.#i && this.#i.parent);
					return;
				}
				typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => un(e, this.#i && this.#i.parent)) : n(t);
			}
		});
	}
};
function J(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[_e] ??= e.nodeValue) && (e[_e] = n, e.nodeValue = `${n}`);
}
function vr(e, t) {
	return br(e, t);
}
var yr = /* @__PURE__ */ new Map();
function br(e, { target: t, anchor: r, props: i = {}, events: a, context: o, intro: s = !0, transformError: l }) {
	Qt();
	var u = void 0, d = vn(() => {
		var s = r ?? t.appendChild(N());
		gr(s, { pending: () => {} }, (t) => {
			Ge({});
			var r = E;
			if (o && (r.c = o), a && (i.$$events = a), C && dr(t, null), u = e(t, i) || qe(), C && (B.nodes.end = w, w === null || w.nodeType !== 8 || w.data !== "]")) throw Se(), n;
			Ke();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!d.has(r)) {
					d.add(r);
					var i = pr(r);
					for (let e of [t, document]) {
						var a = yr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), yr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, sr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(c(rr)), ir.add(f), () => {
			for (var e of d) for (let r of [t, document]) {
				var n = yr.get(r), i = n.get(e);
				--i == 0 ? (r.removeEventListener(e, sr), n.delete(e), n.size === 0 && yr.delete(r)) : n.set(e, i);
			}
			ir.delete(f), s !== r && s.parentNode?.removeChild(s);
		};
	});
	return xr.set(u, d), u;
}
var xr = /* @__PURE__ */ new WeakMap(), Sr = class {
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
			if (n) jn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (jn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (I(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Nn(r, t), t.append(N()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else I(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), kn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (I(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = O, r = on();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = N();
				i.append(a), this.#n.set(e, {
					effect: F(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, F(() => t(this.anchor)));
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
function Cr(e, t, ...n) {
	var r = new Sr(e);
	Cn(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, re);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function wr(e, t, n = !1) {
	var r;
	C && (r = w, Te());
	var i = new Sr(e), a = n ? re : 0;
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
	Cn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Tr(e, t, n) {
	for (var r = [], i = t.length, a, o = t.length, s = 0; s < i; s++) {
		let n = t[s];
		kn(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					Er(e, c(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --o;
		}, !1);
	}
	if (o === 0) {
		var l = r.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			an(d), d.append(u), e.items.clear();
		}
		Er(e, t, !l);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function Er(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= oe, Nn(a, document.createDocumentFragment())) : I(t[i], n);
	}
}
var Dr;
function Or(e, t, n, r, i, o = null) {
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
			var n = G(f);
			_.fallback = d, Ar(_, n, s, t, r), d !== null && (n.length === 0 ? d.f & 33554432 ? (d.f ^= oe, Mr(d, null, s)) : jn(d) : kn(d, () => {
				d = null;
			}));
		}
	}
	function g(e) {
		_.pending.delete(e);
	}
	var _ = {
		effect: Cn(() => {
			var e = G(f), a = e.length;
			let c = !1;
			C && ke(s) === "[!" != (a === 0) && (s = Oe(), T(s), we(!1), c = !0);
			for (var u = /* @__PURE__ */ new Set(), _ = O, v = on(), y = 0; y < a; y += 1) {
				C && w.nodeType === 8 && w.data === "]" && (s = w, c = !0, we(!1));
				var b = e[y], x = r(b, y), S = m ? null : l.get(x);
				S ? (S.v && Ut(S.v, b), S.i && Ut(S.i, y), v && _.unskip_effect(S.e)) : (S = jr(l, m ? s : Dr ??= N(), b, x, y, i, t, n), m || (S.e.f |= oe), l.set(x, S)), u.add(x);
			}
			if (a === 0 && o && !d && (m ? d = F(() => o(s)) : (d = F(() => o(Dr ??= N())), d.f |= oe)), a > u.size && Pe("", "", ""), C && a > 0 && T(Oe()), !m) {
				if (p.set(_, u), v) {
					for (let [e, t] of l) u.has(e) || _.skip_effect(t.e);
					_.oncommit(h), _.ondiscard(g);
				} else h(_);
			}
			c && we(!0), G(f);
		}),
		flags: t,
		items: l,
		pending: p,
		outrogroups: null,
		fallback: d
	};
	m = !1, C && (s = w);
}
function kr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Ar(e, t, n, r, i) {
	var a = !!(r & 8), o = t.length, s = e.items, l = kr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (a) for (v = 0; v < o; v += 1) h = t[v], g = i(h, v), _ = s.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < o; v += 1) {
		if (h = t[v], g = i(h, v), _ = s.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (jn(_), a && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= oe, _ === l) Mr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Nr(e, d, _), Nr(e, _, y), Mr(_, y, n), d = _, p = [], m = [], l = kr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], ee = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Mr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Nr(e, S.prev, ee.next), Nr(e, d, S), Nr(e, ee, b), l = b, d = ee, --v, p = [], m = [];
				} else u.delete(_), Mr(_, l, n), Nr(e, _.prev, _.next), Nr(e, _, d === null ? e.effect.first : d.next), Nr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = kr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = kr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Er(e, c(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var te = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || te.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && te.push(l), l = kr(l.next);
		var ne = te.length;
		if (ne > 0) {
			var re = r & 4 && o === 0 ? n : null;
			if (a) {
				for (v = 0; v < ne; v += 1) te[v].nodes?.a?.measure();
				for (v = 0; v < ne; v += 1) te[v].nodes?.a?.fix();
			}
			Tr(e, te, re);
		}
	}
	a && Ze(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function jr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? zt(n) : /* @__PURE__ */ Bt(n, !1, !1) : null, l = o & 2 ? zt(i) : null;
	return {
		v: c,
		i: l,
		e: F(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Mr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ en(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Nr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/css.js
function Pr(e, t) {
	yn(() => {
		e = B?.parent?.nodes?.start ?? e;
		var n = e.getRootNode(), r = n.host ? n : n.head ?? n.ownerDocument.head;
		if (!r.querySelector("#" + t.hash)) {
			let e = sn("style");
			e.id = t.hash, e.textContent = t.code, r.appendChild(e);
		}
	});
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
var Fr = [..." 	\n\r\f\xA0\v﻿"];
function Ir(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Fr.includes(r[o - 1])) && (s === r.length || Fr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Lr(e, t, n, r, i, a) {
	var o = e[he];
	if (C || o !== n || o === void 0) {
		var s = Ir(n, r, a);
		(!C || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[he] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var Rr = Symbol("is custom element"), zr = Symbol("is html"), Br = be ? "link" : "LINK";
function Vr(e) {
	if (C) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					Y(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					Y(e, "checked", null), e.checked = r;
				}
			}
		};
		e[ve] = n, Ze(n), rt();
	}
}
function Y(e, t, n, r) {
	var i = Ur(e);
	C && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Br) || i[t] !== (i[t] = n) && (t === "loading" && (e[pe] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Gr(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function Hr(e, t, n) {
	var r = L, i = B;
	let a = C;
	C && we(!1), z(null), V(null);
	try {
		t !== "style" && (Wr.has(e.getAttribute("is") || e.nodeName) || !customElements || customElements.get(e.getAttribute("is") || e.nodeName.toLowerCase()) ? Gr(e).has(t) : n && typeof n == "object") ? e[t] = n : Y(e, t, n == null ? n : String(n));
	} finally {
		z(r), V(i), a && we(!0);
	}
}
function Ur(e) {
	return e[me] ??= {
		[Rr]: e.nodeName.includes("-"),
		[zr]: e.namespaceURI === i
	};
}
var Wr = /* @__PURE__ */ new Map();
function Gr(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Wr.get(t);
	if (n) return n;
	Wr.set(t, n = /* @__PURE__ */ new Set());
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = d(i), r) r[o].set && o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.add(o);
		i = m(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function Kr(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	at(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = qr(e) ? Jr(a) : a, n(a), O !== null && r.add(O), await Qn(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (C && e.defaultValue !== e.value || tr(t) == null && e.value) && (n(qr(e) ? Jr(e.value) : e.value), O !== null && r.add(O)), xn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = O;
			if (r.has(i)) return;
		}
		qr(e) && n === Jr(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function qr(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function Jr(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var Yr = !1;
function Xr(e) {
	var t = Yr;
	try {
		return Yr = !1, [e(), Yr];
	} finally {
		Yr = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function Zr(e, t, n, r) {
	var i = !0, a = !!(n & 8), o = !!(n & 16), s = r, c = !0, l = void 0, d = () => o && i ? (l ??= /* @__PURE__ */ ut(r), G(l)) : (c && (c = !1, s = o ? tr(r) : r), s);
	let f;
	if (a) {
		var p = ue in e || fe in e;
		f = u(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = Xr(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ze(t), f(m)));
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
	a && G(y);
	var b = B;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? G(y) : i && a ? qt(e) : e;
			return M(y, n), v = !0, s !== void 0 && (s = n), e;
		}
		return Fn && v || b.f & 16384 ? y.v : G(y);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
var X = {
	userAgent: "joblist.today (+https://joblist.today/llms.txt)",
	name: "joblist",
	url: "https://joblist.today",
	source: "https://github.com/joblisttoday/joblisttoday",
	shareImage: {
		path: "/og.png",
		width: 1200,
		height: 630
	},
	collections: {
		company: "today.joblist.company",
		job: "today.joblist.job"
	},
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
		bare: ["/jobs"]
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
		page: "/embed",
		scripts: "/embed/",
		shown: 20
	},
	curated: { max: 500 },
	nameSearch: {
		minLength: 3,
		waitMs: 600,
		shown: 5,
		cacheDays: 7,
		wikidata: "https://www.wikidata.org/w/api.php",
		bluesky: "https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead",
		socials: {
			P2002: "https://x.com/{id}",
			P4033: "mastodon",
			P12361: "https://bsky.app/profile/{id}",
			P4264: "https://www.linkedin.com/company/{id}",
			P2037: "https://github.com/{id}",
			P2003: "https://www.instagram.com/{id}",
			P2013: "https://www.facebook.com/{id}",
			P2397: "https://www.youtube.com/channel/{id}"
		}
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
	jobs: {
		pageSize: 50,
		companySearchFrom: 10,
		teamsShown: 12,
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
		namesShown: 5,
		boardsPerVisit: 40,
		refreshHours: 6,
		newDays: 7
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
	jobPost: {
		renewWithin: 7,
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
}, Qr = {
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
			"job.at": "{title} at {company}",
			"job.hide": "Hide this job"
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
			"job.at": "{title} chez {company}",
			"job.hide": "Masquer cette offre"
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
			"job.at": "{title} bei {company}",
			"job.hide": "Diese Stelle ausblenden"
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
			"job.at": "{title} en {company}",
			"job.hide": "Ocultar esta oferta"
		}
	}
}.strings, $r = qt({ locale: "en" });
function Z(e, t = {}) {
	let n = Qr[$r.locale] || Qr.en, r = t.count === 1 && (n[`${e}.one`] || Qr.en[`${e}.one`]) || n[e] || Qr.en[e] || e;
	for (let [e, n] of Object.entries(t)) r = r.replaceAll(`{${e}}`, typeof n == "number" ? n.toLocaleString($r.locale) : String(n));
	return r;
}
//#endregion
//#region src/lib/components/JobCard.svelte
var ei = /* @__PURE__ */ K("<jl-chip> </jl-chip>", 2), ti = /* @__PURE__ */ K("<strong class=\"svelte-1vivc5\"> </strong> <small class=\"svelte-1vivc5\"><!><!><span> </span></small>", 1), ni = {
	hash: "svelte-1vivc5",
	code: "strong.svelte-1vivc5 {display:block;font-weight:var(--font-weight-strong);}small.svelte-1vivc5 {display:flex;flex-wrap:wrap;align-items:center;gap:0 var(--space-xs);color:var(--color-muted);font-size:var(--font-size-small);}\n	/* Its own copy of the chip (the embed lives in a shadow root, apart from the site's styles). */small.svelte-1vivc5 > jl-chip {display:inline-flex;align-items:center;gap:var(--space-xxs);padding:0 var(--space-s);border-radius:var(--radius-round);background:var(--color-soft);color:var(--color-fg);font-weight:var(--font-weight-strong);line-height:var(--chip-line);white-space:nowrap;}small.svelte-1vivc5 > jl-chip[tone='ok'] {color:var(--color-ok);}small.svelte-1vivc5 > jl-chip[tone='warn'] {color:var(--color-warn);}small.svelte-1vivc5 > jl-chip[tone='new'] {background:var(--color-ok);color:var(--color-bg);}"
};
function ri(e, t) {
	Ge(t, !0), Pr(e, ni);
	let n = Zr(t, "company", 3, ""), r = /* @__PURE__ */ pt(() => [
		n(),
		t.facts.line,
		t.facts.place,
		t.facts.pay,
		t.facts.age
	].filter(Boolean).join(" · "));
	var i = ti(), a = nn(i), o = P(a, !0), s = rn(a, 2), c = tn(s);
	Cr(c, () => t.lead ?? g);
	var l = rn(c), u = (e) => {
		var t = ei();
		Hr(t, "tone", "warn"), Sn((e) => Hr(t, "title", e), [() => Z("job.older.hint", { days: X.jobs.olderDays })]);
		var n = P(t, !0);
		Sn((e) => J(n, e), [() => Z("job.older")]), q(e, t);
	};
	wr(l, (e) => {
		t.facts.older && e(u);
	});
	var d = P(rn(l), !0);
	Ee(s), Sn(() => {
		J(o, t.title), J(d, G(r));
	}), q(e, i), Ke();
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
//#region src/lib/models/team.js
function Oi(e) {
	return String(e || "").trim().replace(/\s+/g, " ").toLowerCase();
}
function ki(e) {
	return Oi(e.department);
}
//#endregion
//#region src/lib/models/job.js
var Ai = X.jobs.remoteWords, ji = RegExp(`\\b(${Ai.join("|")})\\b`, "i"), Mi = RegExp(`([(\\[|,]|\\s[-–]\\s)\\s*(${Ai.join("|")})\\b`, "i"), Ni = RegExp(`\\b(${X.jobs.hybridWords.join("|")})\\b`, "i"), Pi = RegExp(`([(\\[|,]|\\s[-–]\\s)\\s*(${X.jobs.hybridWords.join("|")})\\b`, "i"), Fi = RegExp(`\\b(${X.jobs.onsiteWords.join("|")})\\b`, "i"), Ii = (e) => e.toLowerCase().split(/\s+/).filter(Boolean);
function Li(e) {
	if (e.remote === "onsite" || e.remote === "hybrid" || e.remote === "remote") return e.remote;
	if (e.remote !== "") {
		if (ji.test(e.location || "") || Mi.test(e.title)) return "remote";
		if (Ni.test(e.location || "") || Pi.test(e.title)) return "hybrid";
		if (Fi.test(e.location || "")) return "onsite";
	}
}
function Ri(e) {
	return Li(e) === "remote";
}
function zi(e) {
	return Ri(e) ? Si(e.location, Ai) : "";
}
function Bi(e, { query: t, where: n, remote: r, pay: i, field: a, team: o, near: s, within: c = 0, area: l, places: u }, d) {
	let f = Ii(t), p = n.trim() ? bi(n) : null, m = u?.length ? u.map(bi) : null, h = !f.length && !p && !m && !r && !i && !a && !o && !l ? e : e.filter((e) => {
		if (i && !e.salary || a && ki(e) !== a || o && ki(e) !== o || l && !(e.point && ci(e.point, l)) || r && !Ri(e) || r === "anywhere" && zi(e) || p && (!r || zi(e)) && !p(e.location, Ri(e)) || m && (!r || zi(e)) && !m.some((t) => t(e.location, Ri(e)))) return !1;
		if (!f.length) return !0;
		let t = Ji(e, d);
		return f.every((e) => t.includes(e));
	});
	return s ? h.filter((e) => e.point).map((e) => ({
		...e,
		km: oi(s, e.point)
	})).filter((e) => !c || si(e.km) <= c).sort((e, t) => Vi(e.km) - Vi(t.km) || Gi(t.published) - Gi(e.published) || e.km - t.km) : h;
}
function Vi(e) {
	return Math.floor(si(e) / X.travel.bandMinutes);
}
function Hi(e) {
	let t = e.map((e) => e.posted ? "" : Xi(e)), n = /* @__PURE__ */ new Map();
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
function Ui(e) {
	return [...new Set([e, ...e.also || []].map((e) => Wi(e.location)).filter(Boolean))];
}
function Wi(e) {
	let t = /* @__PURE__ */ new Set();
	return (e || "").split(/\s*,\s*/).filter((e) => e && !t.has(e.toLowerCase()) && t.add(e.toLowerCase())).join(", ");
}
function Gi(e) {
	if (!e) return 0;
	let t = String(e), n = Date.parse(t.includes(" ") ? t.replace(" UTC", "Z").replace(" ", "T") : t);
	return Number.isFinite(n) ? n : 0;
}
function Ki(e, t = Date.now(), n = X.jobs.olderDays) {
	let r = Gi(e.published);
	return !e.posted && r > 0 && t - r > n * 864e5;
}
var qi = /* @__PURE__ */ new WeakMap();
function Ji(e, t) {
	let n = qi.get(e);
	return n === void 0 && (n = `${e.title} ${e.department || ""} ${t.get(e.company) || ""}`.toLowerCase(), qi.set(e, n)), n;
}
function Yi(e) {
	let t = e.map((e) => Gi(e.published)), n = Array.from(e.keys()).sort((e, n) => t[n] - t[e] || e - n).map((t) => e[t]);
	for (let t = 0; t < n.length; t++) e[t] = n[t];
}
function Xi(e) {
	return `${e.company}\n${e.title.trim().toLowerCase()}`;
}
//#endregion
//#region src/lib/i18n/dates.js
var Zi = [
	["year", 31536e6],
	["month", 2592e6],
	["week", 6048e5],
	["day", 864e5]
];
function Qi(e, t, n = Date.now()) {
	if (!e) return "";
	let r = e - n, i = new Intl.RelativeTimeFormat(t, { numeric: "auto" });
	for (let [e, t] of Zi) if (Math.abs(r) >= t) return i.format(Math.round(r / t), e);
	return i.format(0, "day");
}
//#endregion
//#region src/lib/models/salary.js
var $i = 1e4, ea = /* @__PURE__ */ new Map();
function ta(e, t, n) {
	let r = `${e}\n${t}\n${n}`, i = ea.get(r);
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
	}), ea.set(r, i)), i;
}
function na({ min: e, max: t, currency: n }, r) {
	let i = ta(r, n, (t ?? e ?? 0) >= $i);
	return e && t && e !== t ? i.formatRange(e, t) : i.format(e ?? t);
}
//#endregion
//#region src/lib/models/job-card.js
function ra(e, { t, locale: n, where: r = Li(e) }) {
	let i = r ? t(`job.remote.${r}`) : "", a = i && !(e.location || "").toLowerCase().includes(i.toLowerCase()) ? i : "", o = Ui(e), s = X.jobs.placesShown;
	return {
		line: [o.length > s ? `${o.slice(0, s).join("; ")} ${t("job.places.more", { count: o.length - s })}` : o.join("; "), e.department].filter(Boolean).join(" · "),
		place: a,
		pay: e.salary ? t(`job.salary.${e.salary.period}`, { amount: na(e.salary, n) }) : "",
		age: Qi(Gi(e.published), n),
		older: Ki(e)
	};
}
//#endregion
//#region src/lib/data/providers.json
var ia = [
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
function aa(e, { email: t = !1 } = {}) {
	let n = String(e ?? "").trim();
	if (oa.test(n)) return n;
	try {
		let { protocol: e } = new URL(n);
		return e === "https:" || e === "http:" || t && e === "mailto:" ? n : "";
	} catch {
		return "";
	}
}
var oa = /^https?:\/\/[a-z0-9.-]+(?::\d+)?(?:[/?#][^\s"'<>\\]*)?$/i;
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
function sa(...e) {
	return e.filter(Boolean).join(", ");
}
function ca(e) {
	let t = String(e || "").toLowerCase().replace(/[^a-z]/g, "");
	if (t === "remote") return "remote";
	if (t === "hybrid") return "hybrid";
	if (t === "onsite" || t === "inoffice" || t === "office") return "onsite";
}
function la(e) {
	let t = /* @__PURE__ */ new Map();
	return (n) => (t.has(n) || t.set(n, e(n)), t.get(n));
}
//#endregion
//#region src/lib/ats/salary.js
var ua = [
	"year",
	"month",
	"week",
	"day",
	"hour"
];
function da(e) {
	let t = Number(typeof e == "string" ? e.replace(/[\s,]/g, "") : e);
	return e !== null && e !== "" && Number.isFinite(t) && t > 0 ? t : void 0;
}
function fa({ min: e, max: t, currency: n, period: r }) {
	let i = da(e), a = da(t), o = String(n || "").toUpperCase(), s = String(r || "").toLowerCase();
	if (!i && !a || !/^[A-Z]{3}$/.test(o) || !ua.includes(s)) return;
	i && a && i > a && ([i, a] = [a, i]);
	let c = {
		currency: o,
		period: s
	};
	return i && (c.min = i), a && (c.max = a), c;
}
function pa(e) {
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
function ma(e) {
	let t = String(e || "").toLowerCase();
	if (!/bi-?week|^\s*([2-9]|\d{2,})\s/.test(t)) {
		if (/hour/.test(t)) return "hour";
		if (/day|daily/.test(t)) return "day";
		if (/week/.test(t)) return "week";
		if (/month/.test(t)) return "month";
		if (/year|annual|annum/.test(t)) return "year";
	}
}
//#endregion
//#region src/lib/ats/ashby.js
var ha = /* @__PURE__ */ t({
	default: () => ga,
	describe: () => ya
});
async function ga(e) {
	return ((await va(e))?.jobs || []).filter((e) => e.isListed !== !1).map((e) => ({
		id: e.id,
		title: e.title,
		url: e.jobUrl,
		location: [e.location, ...(e.secondaryLocations || []).map((e) => e.location)].filter(Boolean).join(", "),
		department: e.department,
		published: e.publishedAt,
		remote: ca(e.workplaceType) || (e.isRemote ? "remote" : void 0),
		salary: _a(e)
	}));
}
function _a(e) {
	return e.shouldDisplayCompensationOnJobPostings ? pa((e.compensation?.summaryComponents || []).filter((e) => e.compensationType === "Salary").map((e) => fa({
		min: e.minValue,
		max: e.maxValue,
		currency: e.currencyCode,
		period: ma(e.interval)
	}))) : void 0;
}
var va = la((e) => $(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(e)}?includeCompensation=true`));
async function ya(e, t) {
	return (await va(e))?.jobs?.find((e) => e.id === t)?.descriptionPlain || "";
}
//#endregion
//#region src/lib/ats/text.js
function ba(e) {
	return Ca(String(e || "").replace(/<(script|style)[\s\S]*?<\/\1>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<li[^>]*>/gi, "\n• ").replace(/<\/(p|div|h[1-6]|ul|ol|section|blockquote|tr)>/gi, "\n\n").replace(/<(p|div|h[1-6]|ul|ol|section|blockquote|tr)[^>]*>/gi, "\n\n").replace(/<[^>]+>/g, "")).replace(/[ \t ]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function xa(e) {
	return Ca(String(e || ""));
}
var Sa = {
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
function Ca(e) {
	return e.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (e, t) => {
		if (t[0] === "#") {
			let n = t[1].toLowerCase() === "x" ? parseInt(t.slice(2), 16) : Number(t.slice(1));
			return Number.isFinite(n) && n > 0 && n < 1114112 ? String.fromCodePoint(n) : e;
		}
		return Sa[t.toLowerCase()] ?? e;
	});
}
//#endregion
//#region src/lib/ats/greenhouse.js
var wa = /* @__PURE__ */ t({
	default: () => Ta,
	departmentsByJob: () => Ea,
	describe: () => ka,
	payRange: () => Oa
});
async function Ta(e) {
	let t = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(e)}`, [n, r] = await Promise.all([$(`${t}/jobs?pay_transparency=true`), $(`${t}/departments`)]), i = Ea(r);
	return (n?.jobs || []).map((e) => ({
		id: String(e.id),
		title: e.title,
		url: e.absolute_url,
		location: e.location?.name,
		department: i.get(String(e.id)),
		published: e.first_published || e.updated_at,
		salary: pa((e.pay_input_ranges || []).map(Oa))
	}));
}
function Ea(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e?.departments || []) {
		let e = String(n?.name || "").trim();
		if (e && e !== "No Department") for (let r of n.jobs || []) t.has(String(r.id)) || t.set(String(r.id), e);
	}
	return t;
}
var Da = /variable|bonus|commission|equity/i;
function Oa(e) {
	if (Da.test(e?.title || "")) return;
	let t = `${e.title || ""} ${ba(e.blurb)}`, n = Math.max(Number(e.min_cents) || 0, Number(e.max_cents) || 0) / 100, r = /\bhour(ly)?\b/i.test(t) && n < 1e3, i = /\bmonth(ly)?\b/i.test(t) && !/\bannual|\byear/i.test(t), a = r ? "hour" : i ? "month" : n >= 1e3 ? "year" : "";
	return fa({
		min: Number(e.min_cents) / 100,
		max: Number(e.max_cents) / 100,
		currency: e.currency_type,
		period: a
	});
}
async function ka(e, t) {
	return ba(xa((await $(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(e)}/jobs/${encodeURIComponent(t)}`))?.content));
}
//#endregion
//#region src/lib/ats/lever.js
var Aa = /* @__PURE__ */ t({
	default: () => ja,
	describe: () => Ma
});
async function ja(e) {
	return (await $(`https://api.lever.co/v0/postings/${encodeURIComponent(e)}?mode=json`) || []).map((e) => ({
		id: e.id,
		title: e.text,
		url: e.hostedUrl,
		location: (e.categories?.allLocations || [e.categories?.location]).filter(Boolean).join(", "),
		department: e.categories?.team || e.categories?.department,
		published: e.createdAt ? new Date(e.createdAt).toISOString() : void 0,
		remote: ca(e.workplaceType),
		salary: e.salaryRange ? fa({
			...e.salaryRange,
			period: ma(e.salaryRange.interval)
		}) : void 0
	}));
}
async function Ma(e, t) {
	let n = await $(`https://api.lever.co/v0/postings/${encodeURIComponent(e)}/${encodeURIComponent(t)}`);
	if (!n) return "";
	let r = (n.lists || []).map((e) => `${e.text}\n${ba(e.content)}`);
	return [
		n.descriptionPlain,
		...r,
		n.additionalPlain
	].filter(Boolean).join("\n\n").trim();
}
//#endregion
//#region src/lib/ats/personio.js
var Na = /* @__PURE__ */ t({
	default: () => Ia,
	describe: () => La
}), Pa = (e) => `https://${encodeURIComponent(e)}.jobs.personio.de`, Fa = la(async (e) => {
	try {
		let t = await fetch(`${Pa(e)}/xml?language=en`);
		return t.ok ? await t.text() : "";
	} catch {
		return "";
	}
});
async function Ia(e) {
	return Ra(await Fa(e)).map(({ fields: t }) => ({
		id: t.id,
		title: t.name || "",
		url: `${Pa(e)}/job/${t.id}`,
		location: t.office,
		department: t.department,
		published: t.createdAt
	}));
}
async function La(e, t) {
	let n = Ra(await Fa(e)).find((e) => e.fields.id === t);
	return n ? [...n.body.matchAll(/<jobDescription>([\s\S]*?)<\/jobDescription>/g)].map(([, e]) => `${za(e, "name")}\n${ba(za(e, "value"))}`.trim()).join("\n\n") : "";
}
function Ra(e) {
	return [...e.matchAll(/<position>([\s\S]*?)<\/position>/g)].map(([, e]) => {
		let t = {};
		for (let [, n, r] of e.matchAll(/<(\w+)>([^<]*)<\/\1>/g)) t[n] = Ba(r.trim());
		return {
			fields: t,
			body: e
		};
	});
}
function za(e, t) {
	let n = e.match(RegExp(`<${t}>([\\s\\S]*?)</${t}>`))?.[1].trim() || "", r = n.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
	return r ? r[1] : Ba(n);
}
function Ba(e) {
	return e.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&");
}
//#endregion
//#region src/lib/ats/recruitee.js
var Va = /* @__PURE__ */ t({
	default: () => Ha,
	describe: () => Wa
});
async function Ha(e) {
	return ((await $(`https://${encodeURIComponent(e)}.recruitee.com/api/offers`))?.offers || []).map((e) => ({
		id: String(e.id),
		title: e.title,
		url: e.careers_url,
		location: e.location || sa(e.city, e.country),
		department: e.department,
		published: e.published_at,
		remote: e.remote ? "remote" : e.hybrid ? "hybrid" : e.on_site ? "onsite" : void 0,
		salary: e.salary ? fa({
			...e.salary,
			period: ma(e.salary.period)
		}) : void 0
	}));
}
var Ua = la((e) => $(`https://${encodeURIComponent(e)}.recruitee.com/api/offers`));
async function Wa(e, t) {
	let n = (await Ua(e))?.offers?.find((e) => String(e.id) === t);
	return n ? ba(`${n.description || ""}${n.requirements || ""}`) : "";
}
//#endregion
//#region src/lib/ats/rippling.js
var Ga = /* @__PURE__ */ t({
	default: () => Ka,
	describe: () => qa
});
async function Ka(e) {
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
		remote: ca(e.locations?.[0]?.workplaceType)
	}));
}
async function qa(e, t) {
	let n = await $(`https://api.rippling.com/platform/api/ats/v2/board/${encodeURIComponent(e)}/jobs/${encodeURIComponent(t)}`);
	return ba(`${n?.description?.role || ""}${n?.description?.company || ""}`);
}
//#endregion
//#region src/lib/ats/smartrecruiters.js
var Ja = /* @__PURE__ */ t({
	default: () => Xa,
	describe: () => Za
});
async function Ya(e) {
	let { boardPageSize: t, jobsPerBoard: n } = X.limits, r = [];
	for (let i = 0; i < n; i += t) {
		let n = await $(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(e)}/postings?limit=${t}&offset=${i}`), a = n?.content || [];
		if (r.push(...a), a.length < t || r.length >= (n?.totalFound ?? 0)) break;
	}
	return r.slice(0, n);
}
async function Xa(e) {
	return (await Ya(e)).map((t) => ({
		id: t.id,
		title: t.name,
		url: `https://jobs.smartrecruiters.com/${encodeURIComponent(e)}/${t.id}`,
		location: t.location?.fullLocation,
		department: t.department?.label,
		published: t.releasedDate,
		remote: t.location?.remote ? "remote" : t.location?.hybrid ? "hybrid" : "onsite"
	}));
}
async function Za(e, t) {
	let n = (await $(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(e)}/postings/${encodeURIComponent(t)}`))?.jobAd?.sections || {};
	return [
		n.jobDescription,
		n.qualifications,
		n.additionalInformation,
		n.companyDescription
	].filter((e) => e?.text).map((e) => `${e.title || ""}\n${ba(e.text)}`.trim()).join("\n\n");
}
//#endregion
//#region src/lib/ats/workable.js
var Qa = /* @__PURE__ */ t({
	default: () => $a,
	describe: () => to
});
async function $a(e) {
	return ((await $(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(e)}`))?.jobs || []).map((e) => ({
		id: e.shortcode,
		title: e.title,
		url: e.url || e.shortlink,
		location: e.telecommuting && !e.city ? sa("Remote", e.country) : sa(e.city, e.country),
		department: e.department,
		published: e.published_on,
		remote: e.telecommuting ? "remote" : void 0
	}));
}
var eo = la((e) => $(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(e)}?details=true`));
async function to(e, t) {
	let n = (await eo(e))?.jobs?.find((e) => e.shortcode === t);
	return ba(n?.description);
}
//#endregion
//#region src/lib/ats/index.js
var no = {
	ashby: ha,
	greenhouse: wa,
	lever: Aa,
	personio: Na,
	recruitee: Va,
	rippling: Ga,
	smartrecruiters: Ja,
	workable: Qa
}, ro = /* @__PURE__ */ new Map();
function io(e) {
	let { provider: t = "", id: n = "" } = e.jobBoard || {}, r = no[t]?.default;
	if (!r || !n) return Promise.resolve([]);
	let i = `${t}:${n}`;
	return ro.has(i) || ro.set(i, r(n).then((t) => t.map((e) => ({
		...e,
		url: aa(e.url)
	})).filter((e) => e.title && e.url).map((t) => ({
		...t,
		location: ao(t.location),
		company: e.key
	}))).catch(() => [])), ro.get(i);
}
function ao(e) {
	return e?.split(",").map((e) => e.trim()).filter(Boolean).join(", ") || void 0;
}
//#endregion
//#region src/lib/ats/board-check.js
var oo = {
	greenhouse: async (e) => (await $(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(e)}`))?.name,
	workable: async (e) => (await $(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(e)}`))?.name,
	smartrecruiters: async (e) => (await $(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(e)}/postings?limit=1`))?.content?.[0]?.company?.name,
	recruitee: async (e) => (await $(`https://${encodeURIComponent(e)}.recruitee.com/api/offers`))?.offers?.[0]?.company_name
};
async function so({ provider: e, id: t }) {
	try {
		return String(await oo[e]?.(t) || "").trim();
	} catch {
		return "";
	}
}
//#endregion
//#region src/lib/ats/detect.js
var co = /* @__PURE__ */ new Set([
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
]), lo = [
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
function uo(e) {
	let t;
	try {
		t = new URL(e.startsWith("//") ? `https:${e}` : e);
	} catch {
		return null;
	}
	let n = t.hostname.toLowerCase(), r = lo.find((e) => e.host.test(n) && (!(e.from instanceof RegExp) || e.from.test(t.pathname)));
	if (!r) return null;
	let i = t.searchParams.get("for");
	if (r.provider === "greenhouse" && i) return {
		provider: "greenhouse",
		id: i
	};
	let a = r.from instanceof RegExp ? decodeURIComponent(t.pathname.match(r.from)?.[1] || "") : r.from === "subdomain" ? n.split(".")[0] : decodeURIComponent(t.pathname.split("/").filter(Boolean)[0] || "");
	return co.has(a.toLowerCase()) ? null : {
		provider: r.provider,
		id: a
	};
}
var fo = {
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
					description: "The job board's provider; 'today.joblist.job' when the organization posts its jobs as today.joblist.job records from its own account (then no id).",
					knownValues: [
						"ashby",
						"greenhouse",
						"lever",
						"personio",
						"recruitee",
						"rippling",
						"smartrecruiters",
						"workable",
						"today.joblist.job"
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
}, po = {
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
}, mo = {
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
}, ho = {
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
}, go = 8192, _o = new Map([
	fo,
	po,
	mo,
	ho
].map((e) => [e.id, e]));
function vo(e, t) {
	return e.length <= t ? e : Array.from(e.slice(0, t * 2)).slice(0, t).join("");
}
function yo(e, t) {
	let [n, r = "main"] = e.split("#"), i = n ? _o.get(n) : t, a = i?.defs[r];
	return i && a ? [i, a] : null;
}
function bo(e, t, n) {
	if (e != null) switch (t.type) {
		case "ref": {
			let r = yo(t.ref, n);
			return r ? bo(e, r[1], r[0]) : void 0;
		}
		case "string": {
			if (typeof e != "string") return;
			let n = t.maxGraphemes ?? t.maxLength ?? e.length;
			return !t.format && t.minLength === void 0 ? vo(e, n) : e.length >= (t.minLength ?? 0) && e.length <= (t.maxLength ?? go) ? e : void 0;
		}
		case "integer": return Number.isSafeInteger(e) ? e : void 0;
		case "boolean": return typeof e == "boolean" ? e : void 0;
		case "array": return !Array.isArray(e) || !t.items ? void 0 : e.slice(0, t.maxLength ?? e.length).map((e) => bo(e, t.items, n)).filter((e) => e !== void 0);
		case "record": return bo(e, t.record, n);
		case "object": {
			if (typeof e != "object" || Array.isArray(e)) return;
			let r = e, i = {};
			for (let [e, a] of Object.entries(t.properties || {})) {
				let t = bo(r[e], a, n);
				t !== void 0 && (i[e] = t);
			}
			return i;
		}
		default: return;
	}
}
function xo(e, t) {
	let n = _o.get(e);
	if (!n) throw Error(`no lexicon for ${e}`);
	let r = bo(t, n.defs.main, n);
	return r ? {
		$type: e,
		...r
	} : {};
}
//#endregion
//#region src/lib/models/company.js
function So(e, t, n) {
	let r = e.get(t);
	return !!n && r?.handle === n && r.verified !== !1;
}
function Co(e) {
	return e.map((e) => ({
		...e,
		lat: Number(e.latitude),
		lon: Number(e.longitude)
	})).filter((e) => e.latitude && e.longitude && Number.isFinite(e.lat) && Number.isFinite(e.lon));
}
X.collections.job;
//#endregion
//#region src/lib/models/paste.js
function wo(e) {
	return e.split(/[-_\s]+/).filter(Boolean).map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(" ");
}
//#endregion
//#region src/lib/atproto/xrpc.js
async function To(e, t, n = {}) {
	let r = new URL(`${e.replace(/\/$/, "")}/xrpc/${t}`);
	for (let [e, t] of Object.entries(n)) t !== void 0 && r.searchParams.set(e, String(t));
	let i = await fetch(r, { headers: { accept: "application/json" } });
	if (!i.ok) throw Object.assign(/* @__PURE__ */ Error(`${t} failed (${i.status})`), { status: i.status });
	return i.json();
}
function Eo(e) {
	let t = e?.status;
	return typeof t == "number" && t >= 400 && t < 500;
}
//#endregion
//#region src/lib/atproto/identity.js
var Do = /* @__PURE__ */ new Map();
function Oo(e) {
	return Do.has(e) || Do.set(e, ko(e)), Do.get(e);
}
async function ko(e) {
	let t = e.startsWith("did:web:") ? `https://${e.slice(8)}/.well-known/did.json` : `${X.services.plc}/${e}`, n = await fetch(t);
	if (!n.ok) throw Error(`cannot resolve ${e}`);
	let r = ((await n.json()).service || []).find((t) => t.id === "#atproto_pds" || t.id === `${e}#atproto_pds`);
	if (!r) throw Error(`no PDS for ${e}`);
	return r.serviceEndpoint;
}
async function Ao(e) {
	if (e.startsWith("did:")) return e;
	let { did: t } = await To(X.services.appview, "com.atproto.identity.resolveHandle", { handle: e });
	return t;
}
//#endregion
//#region src/lib/atproto/records.js
async function jo(e, t, n) {
	let r = await Oo(e), i = [], a, o = 0;
	do {
		let s = await To(r, "com.atproto.repo.listRecords", {
			repo: e,
			collection: t,
			limit: 100,
			cursor: a
		});
		for (let n of s.records || []) {
			let r = No(n.uri, e, t);
			r && i.push({
				did: e,
				rkey: r,
				uri: n.uri,
				cid: n.cid,
				value: n.value
			});
		}
		n?.(s.records?.length || 0), a = s.records?.length ? s.cursor : void 0, o++;
	} while (a && o < X.limits.pagesPerRepo);
	return i;
}
async function Mo(e, t, n) {
	let r = await Oo(e);
	try {
		let i = await To(r, "com.atproto.repo.getRecord", {
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
		if (Eo(e)) return null;
		throw e;
	}
}
function No(e, t, n) {
	let r = `at://${t}/${n}/`;
	if (typeof e != "string" || !e.startsWith(r)) return "";
	let i = e.slice(r.length);
	return /^[A-Za-z0-9._:~-]{1,512}$/.test(i) && i !== "." && i !== ".." ? i : "";
}
//#endregion
//#region src/lib/models/job-post.js
var Po = 864e5, { days: Fo, maxDays: Io } = X.jobPost;
function Lo(e, t = Date.now()) {
	if (!e?.title || !e.company || !e.url || e.status && e.status !== X.jobPost.status[0]) return !1;
	let n = Date.parse(String(e.expiresAt || ""));
	return Number.isFinite(n) && n > t && n <= t + (Io + 1) * Po;
}
function Ro(e, t) {
	let n = xo(X.collections.job, e.value);
	return {
		uri: e.uri,
		did: e.did,
		rkey: e.rkey,
		title: String(n.title || ""),
		company: String(n.company || ""),
		url: aa(n.url),
		description: String(n.description || ""),
		locations: Array.isArray(n.locations) ? n.locations : [],
		remote: n.remote,
		employment: n.employment,
		apply: n.apply && typeof n.apply == "object" ? {
			...n.apply,
			url: aa(n.apply.url, { email: !0 }) || void 0
		} : {},
		salary: n.salary && typeof n.salary == "object" ? Vo(fa(n.salary)) : void 0,
		status: typeof n.status == "string" && n.status ? n.status : X.jobPost.status[0],
		createdAt: String(n.createdAt || ""),
		updatedAt: typeof n.updatedAt == "string" ? n.updatedAt : void 0,
		expiresAt: String(n.expiresAt || ""),
		verified: So(t, e.did, String(n.company || "")),
		record: e
	};
}
function zo(e) {
	let [t] = Co(e.locations);
	return {
		title: e.title,
		url: e.url,
		company: e.company,
		location: Bo(e.locations) || void 0,
		published: e.createdAt,
		remote: e.remote || void 0,
		salary: e.salary,
		posted: {
			did: e.did,
			rkey: e.rkey,
			verified: e.verified
		},
		point: t && [t.lon, t.lat]
	};
}
function Bo(e) {
	return [...new Set(e.map((e) => [e.name, e.country].filter(Boolean).join(", ")).filter(Boolean))].join("; ");
}
function Vo(e) {
	if (!e) return;
	let t = {
		currency: e.currency,
		period: e.period
	};
	return e.min && (t.min = Math.round(e.min)), e.max && (t.max = Math.round(e.max)), t;
}
//#endregion
//#region src/lib/network/organization-jobs.js
async function Ho(e) {
	let t = e.trim().toLowerCase();
	if (!t) return null;
	let n;
	try {
		n = await Ao(t);
	} catch {
		return null;
	}
	let [r, i] = await Promise.all([Mo(n, X.collections.company, t).catch(() => null), jo(n, X.collections.job).catch(() => [])]);
	if (!r && !i.length) return null;
	let a = String(r?.value?.name || t), { provider: o = "", id: s = "" } = r?.value?.jobBoard || {};
	if (s && ia.some((e) => e.id === o)) {
		let e = {
			provider: o,
			id: s
		}, n = await io({
			key: t,
			jobBoard: e
		});
		return Yi(n), {
			name: a,
			board: e,
			jobs: n
		};
	}
	let c = /* @__PURE__ */ new Map([[n, { handle: t }]]), l = i.filter((e) => Lo(e.value) && e.value.company === t).map((e) => zo(Ro(e, c)));
	return Yi(l), {
		name: a,
		board: null,
		jobs: l
	};
}
//#endregion
//#region embed/src/find.js
function Uo(e) {
	let t = e.trim(), [, n, r] = t.match(/^([a-z]+):([^/\s]+)$/) || [];
	return n && r && ia.some((e) => e.id === n) ? {
		provider: n,
		id: r
	} : t ? uo(t) : null;
}
async function Wo(e, t) {
	let n = await io({
		key: t,
		jobBoard: e
	});
	return Yi(n), n;
}
async function Go(e) {
	if (!e) return null;
	let [t, n] = await Promise.all([so(e), Wo(e, e.id)]);
	return {
		name: t || wo(e.id),
		jobs: n
	};
}
async function Ko(e) {
	let t = await Ho(e).catch(() => null);
	return t ? {
		name: t.name,
		jobs: t.jobs
	} : null;
}
//#endregion
//#region embed/src/JoblistJobs.svelte
var qo = /* @__PURE__ */ K("<p class=\"svelte-uruhdc\"> </p>"), Jo = /* @__PURE__ */ K("<label class=\"svelte-uruhdc\"> </label> <input type=\"search\" class=\"svelte-uruhdc\"/>", 1), Yo = /* @__PURE__ */ K("<li class=\"svelte-uruhdc\"><a target=\"_blank\" rel=\"noopener\" class=\"svelte-uruhdc\"><!></a></li>"), Xo = /* @__PURE__ */ K("<ul class=\"svelte-uruhdc\"></ul>"), Zo = /* @__PURE__ */ K("<a target=\"_blank\" rel=\"noopener\" class=\"svelte-uruhdc\"> </a> ·", 1), Qo = /* @__PURE__ */ K("<p class=\"svelte-uruhdc\"> </p> <!> <footer class=\"svelte-uruhdc\"><!> <a target=\"_blank\" rel=\"noopener\" class=\"svelte-uruhdc\"> </a></footer>", 1), $o = /* @__PURE__ */ K("<h2 class=\"svelte-uruhdc\"><a target=\"_blank\" rel=\"noopener\" class=\"svelte-uruhdc\"> </a></h2> <!> <!>", 1), es = /* @__PURE__ */ K("<jl-embed><!></jl-embed>", 2), ts = {
	hash: "svelte-uruhdc",
	code: "\n	/* joblist's tokens (src/app.css), here on any page: its colors from the page's, unless set. */jl-embed.svelte-uruhdc {--space-xxs: 0.125rem;--space-xs: 0.25rem;--space-s: 0.5rem;--space-m: 1rem;--radius: 0.5rem;--radius-round: 999px;--font-size-small: 0.875rem;--font-weight-strong: 600;--chip-line: 1.6;--color-fg: var(--joblist-fg, currentColor);--color-muted: var(--joblist-muted, rgb(128 128 128));--color-soft: var(--joblist-soft, rgb(128 128 128 / 0.14));--color-line: var(--joblist-line, rgb(128 128 128 / 0.3));--color-warn: var(--joblist-warn, #8a5a00);--color-accent: var(--joblist-accent, currentColor);display:block;font-family:var(--joblist-font, inherit);color:var(--color-fg);line-height:1.45;}h2.svelte-uruhdc {margin:0 0 var(--space-s);font-size:1.15em;}a.svelte-uruhdc {color:inherit;}h2.svelte-uruhdc a:where(.svelte-uruhdc) {text-decoration:none;}h2.svelte-uruhdc a:where(.svelte-uruhdc):hover {text-decoration:underline;}label.svelte-uruhdc {position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);}input.svelte-uruhdc {box-sizing:border-box;width:100%;margin:0 0 var(--space-s);padding:var(--space-s) var(--space-m);font:inherit;color:inherit;background:transparent;border:1px solid var(--color-line);border-radius:var(--radius);}p.svelte-uruhdc,\n	footer.svelte-uruhdc {margin:0;color:var(--color-muted);font-size:var(--font-size-small);}footer.svelte-uruhdc {margin-top:var(--space-s);}footer.svelte-uruhdc a:where(.svelte-uruhdc) {color:var(--color-accent);}ul.svelte-uruhdc {margin:var(--space-xs) 0 0;padding:0;list-style:none;}\n	/* The site's job cards: a line between them, the title underlined on hover. */li.svelte-uruhdc {border-bottom:1px solid var(--color-line);}li.svelte-uruhdc a:where(.svelte-uruhdc) {display:block;padding:var(--space-s) 0;text-decoration:none;}li.svelte-uruhdc a:where(.svelte-uruhdc):hover strong {text-decoration:underline;}"
};
function ns(e, t) {
	Ge(t, !0), Pr(e, ts);
	let n = Zr(t, "board", 3, ""), r = Zr(t, "organization", 3, ""), i = Zr(t, "lang", 3, ""), a = Zr(t, "limit", 3, 0), o = Zr(t, "query", 3, ""), s = Zr(t, "where", 3, ""), c = Zr(t, "remote", 3, ""), l = Zr(t, "search", 3, !1), u = {
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
				"job.at": "{title} at {company}",
				"job.hide": "Hide this job"
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
				"job.at": "{title} chez {company}",
				"job.hide": "Masquer cette offre"
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
				"job.at": "{title} bei {company}",
				"job.hide": "Diese Stelle ausblenden"
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
				"job.at": "{title} en {company}",
				"job.hide": "Ocultar esta oferta"
			}
		}
	}, d = `jl-${Math.random().toString(36).slice(2, 8)}`;
	gn(() => {
		let e = (i() || document.documentElement.lang || navigator.language || "en").slice(0, 2).toLowerCase();
		$r.locale = e in u.strings ? e : "en";
	});
	let f = /* @__PURE__ */ pt(() => Uo(n() || "")), p = /* @__PURE__ */ j(void 0);
	gn(() => {
		let e = G(f), t = r();
		M(p, void 0), (t && !e ? Ko(t) : Go(e)).then((n) => e === G(f) && t === r() && M(p, n, !0));
	});
	let m = /* @__PURE__ */ j(""), h = /* @__PURE__ */ pt(() => new Map(G(p) ? [[G(p).jobs[0]?.company || "", G(p).name]] : [])), g = /* @__PURE__ */ pt(() => G(p) ? Hi(Bi(G(p).jobs, {
		query: `${o() || ""} ${G(m)}`.trim(),
		where: s() || "",
		remote: c() === "remote" ? "remote" : ""
	}, G(h))) : []), _ = /* @__PURE__ */ pt(() => G(g).slice(0, Math.max(1, Number(a()) || u.shown))), v = /* @__PURE__ */ pt(() => Z("embed.count", { count: G(g).length })), y = /* @__PURE__ */ pt(() => r() && !G(f) ? `${u.site}/${r()}` : G(f) ? `${u.site}/me/organization#${new URLSearchParams({ url: n() || "" })}` : u.site);
	var b = es();
	Lr(b, 1, "svelte-uruhdc");
	var x = tn(b), S = (e) => {
		var t = qo(), n = P(t, !0);
		Sn((e) => J(n, e), [() => Z("embed.error")]), q(e, t);
	}, ee = (e) => {
		var t = $o(), n = nn(t), i = tn(n), a = P(i, !0);
		Ee(n);
		var o = rn(n, 2), s = (e) => {
			var t = Jo(), n = nn(t), r = P(n, !0), i = rn(n, 2);
			Vr(i), Sn((e, t) => {
				Y(n, "for", `${d}-search`), J(r, e), Y(i, "id", `${d}-search`), Y(i, "placeholder", t);
			}, [() => Z("embed.search"), () => Z("embed.search")]), Kr(i, () => G(m), (e) => M(m, e)), q(e, t);
		};
		wr(o, (e) => {
			l() && e(s);
		});
		var c = rn(o, 2), h = (e) => {
			var t = Qo(), n = nn(t), r = P(n, !0), i = rn(n, 2), a = (e) => {
				var t = Xo();
				Or(t, 21, () => G(_), (e) => e.url, (e, t) => {
					var n = Yo(), r = tn(n), i = tn(r);
					{
						let e = /* @__PURE__ */ pt(() => ra(G(t), {
							t: Z,
							locale: $r.locale
						}));
						ri(i, {
							get title() {
								return G(t).title;
							},
							get facts() {
								return G(e);
							}
						});
					}
					Ee(r), Ee(n), Sn(() => Y(r, "href", G(t).url)), q(e, n);
				}), Ee(t), q(e, t);
			}, o = (e) => {
				var t = qo(), n = P(t, !0);
				Sn((e) => J(n, e), [() => Z("embed.none")]), q(e, t);
			};
			wr(i, (e) => {
				G(_).length ? e(a) : e(o, -1);
			});
			var s = rn(i, 2), c = tn(s), l = (e) => {
				var t = Zo(), n = nn(t), r = P(n, !0);
				De(), Sn((e) => {
					Y(n, "href", G(y)), J(r, e);
				}, [() => Z("embed.more", { count: G(v) })]), q(e, t);
			};
			wr(c, (e) => {
				G(g).length > G(_).length && e(l);
			});
			var d = rn(c, 2), f = P(d, !0);
			Ee(s), Sn((e) => {
				J(r, G(v)), Y(d, "href", u.site), J(f, e);
			}, [() => Z("embed.by")]), q(e, t);
		};
		wr(c, (e) => {
			G(p) && e(h);
		}), Sn((e) => {
			Y(i, "href", G(y)), J(a, e);
		}, [() => Z("embed.title", { name: G(p)?.name || G(f)?.id || r() || "" })]), q(e, t);
	};
	wr(x, (e) => {
		G(p) === null ? e(S) : e(ee, -1);
	}), Ee(b), q(e, b), Ke();
}
//#endregion
//#region embed/src/joblist-jobs.svelte.js
var rs = [
	"board",
	"organization",
	"lang",
	"limit",
	"query",
	"where",
	"remote",
	"search"
], is = class extends HTMLElement {
	static observedAttributes = rs;
	#e = /* @__PURE__ */ j(qt({}));
	get props() {
		return G(this.#e);
	}
	set props(e) {
		M(this.#e, e, !0);
	}
	connectedCallback() {
		if (!this.shadowRoot) {
			for (let e of rs) this.read(e);
			vr(ns, {
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
customElements.get("joblist-jobs") || customElements.define("joblist-jobs", is);
//#endregion
