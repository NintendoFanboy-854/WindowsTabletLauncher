import { plugin as e } from "/plugin-sdk.js";
//#region \0rolldown/runtime.js
var t = Object.create, n = Object.defineProperty, r = Object.getOwnPropertyDescriptor, i = Object.getOwnPropertyNames, a = Object.getPrototypeOf, o = Object.prototype.hasOwnProperty, s = (e, t) => () => (t || (e((t = { exports: {} }).exports, t, t.exports), e = null), t.exports), c = (e, t, a, s) => {
	if (t && typeof t == "object" || typeof t == "function") for (var c = i(t), l = 0, u = c.length, d; l < u; l++) d = c[l], !o.call(e, d) && d !== a && n(e, d, {
		get: ((e) => t[e]).bind(null, d),
		enumerable: !(s = r(t, d)) || s.enumerable
	});
	return e;
}, l = (e, r, i) => (i = e == null ? {} : t(a(e)), c(r || !e || !e.__esModule || !o.call(e, "default") ? n(i, "default", {
	value: e,
	enumerable: !0
}) : i, e)), u = /* @__PURE__ */ s(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var g = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, _ = Object.assign, v = {};
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, y.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function b() {}
	b.prototype = y.prototype;
	function x(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var S = x.prototype = new b();
	S.constructor = x, _(S, y.prototype), S.isPureReactComponent = !0;
	var C = Array.isArray;
	function w() {}
	var T = {
		H: null,
		A: null,
		T: null,
		S: null
	}, E = Object.prototype.hasOwnProperty;
	function D(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function ee(e, t) {
		return D(e.type, t, e.props);
	}
	function te(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function ne(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var re = /\/+/g;
	function ie(e, t) {
		return typeof e == "object" && e && e.key != null ? ne("" + e.key) : t.toString(36);
	}
	function O(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(w, w) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function ae(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, ae(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + ie(e, 0) : a, C(o) ? (i = "", c != null && (i = c.replace(re, "$&/") + "/"), ae(o, r, i, "", function(e) {
			return e;
		})) : o != null && (te(o) && (o = ee(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(re, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (C(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + ie(a, u), c += ae(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + ie(a, u++), c += ae(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ae(O(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function oe(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ae(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function se(e) {
		if (e._status === -1) {
			var t = e._result, n = t();
			n.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t, n.status === void 0 && (n.status = "fulfilled", n.value = t));
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t, n.status === void 0 && (n.status = "rejected", n.reason = t));
			}), e._status === -1 && (e._status = 0, e._result = n);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var ce = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	};
	function le(e) {
		var t = T.T, n = {};
		n.types = t === null ? null : t.types, T.T = n;
		try {
			var r = e(), i = T.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(w, ce);
		} catch (e) {
			ce(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), T.T = t;
		}
	}
	function ue(e) {
		var t = T.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else le(ue.bind(null, e));
	}
	var de = {
		map: oe,
		forEach: function(e, t, n) {
			oe(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return oe(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return oe(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!te(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = de, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = x, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = T, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return T.H.useMemoCache(e);
		}
	}, e.addTransitionType = ue, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !E.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return D(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) E.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return D(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = te, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: se
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = le, e.unstable_useCacheRefresh = function() {
		return T.H.useCacheRefresh();
	}, e.use = function(e) {
		return T.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return T.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return T.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return T.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return T.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return T.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return T.H.useEffectEvent(e);
	}, e.useId = function() {
		return T.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return T.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return T.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return T.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return T.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return T.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return T.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return T.H.useRef(e);
	}, e.useState = function(e) {
		return T.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return T.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return T.H.useTransition();
	}, e.version = "19.3.1";
})), d = /* @__PURE__ */ s(((e, t) => {
	t.exports = u();
})), f = /* @__PURE__ */ s(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (e.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = !1, _ = typeof setTimeout == "function" ? setTimeout : null, v = typeof clearTimeout == "function" ? clearTimeout : null, y = typeof setImmediate < "u" ? setImmediate : null;
	function b(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function x(e) {
		if (h = !1, b(e), !m) {
			if (n(c) !== null) m = !0, S || (S = !0, ee());
			else {
				var t = n(l);
				t !== null && re(x, t.startTime - e);
			}
		}
	}
	var S = !1, C = -1, w = 5, T = -1;
	function E() {
		return g ? !0 : !(e.unstable_now() - T < w);
	}
	function D() {
		if (g = !1, S) {
			var t = e.unstable_now();
			T = t;
			var i = !0;
			try {
				a: {
					m = !1, h && (h = !1, v(C), C = -1), p = !0;
					var a = f;
					try {
						b: {
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && E());) {
								var o = d.callback;
								if (typeof o == "function") {
									d.callback = null, f = d.priorityLevel;
									var s = o(d.expirationTime <= t);
									if (t = e.unstable_now(), typeof s == "function") {
										d.callback = s, b(t), i = !0;
										break b;
									}
									d === n(c) && r(c), b(t);
								} else r(c);
								d = n(c);
							}
							if (d !== null) i = !0;
							else {
								var u = n(l);
								u !== null && re(x, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
					i = void 0;
				}
			} finally {
				i ? ee() : S = !1;
			}
		}
	}
	var ee;
	if (typeof y == "function") ee = function() {
		y(D);
	};
	else if (typeof MessageChannel < "u") {
		var te = new MessageChannel(), ne = te.port2;
		te.port1.onmessage = D, ee = function() {
			ne.postMessage(null);
		};
	} else ee = function() {
		_(D, 0);
	};
	function re(t, n) {
		C = _(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : w = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_requestPaint = function() {
		g = !0;
	}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, re(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, ee()))), r;
	}, e.unstable_shouldYield = E, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), p = /* @__PURE__ */ s(((e, t) => {
	t.exports = f();
})), m = /* @__PURE__ */ s(((e) => {
	var t = d();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, a = Symbol.for("react.portal"), o = Symbol.for("react.recoverable"), s = Symbol.for("react.optimistic_key");
	function c(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: a,
			key: r == null ? null : r === s ? s : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var l = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function u(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.browser = function(e) {
		return {
			$$typeof: o,
			_reason: e
		};
	}, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return c(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = l.T, n = i.p;
		try {
			if (l.T = null, i.p = 2, e) return e();
		} finally {
			l.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = u(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") {
			if (typeof t == "object" && t) {
				if (t.as == null || t.as === "script") {
					var n = u(t.as, t.crossOrigin);
					i.d.M(e, {
						crossOrigin: n,
						integrity: typeof t.integrity == "string" ? t.integrity : void 0,
						nonce: typeof t.nonce == "string" ? t.nonce : void 0,
						fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
					});
				}
			} else t ?? i.d.M(e);
		}
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = u(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") {
			if (t) {
				var n = u(t.as, t.crossOrigin);
				i.d.m(e, {
					as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0,
					fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
				});
			} else i.d.m(e);
		}
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return l.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return l.H.useHostTransitionStatus();
	}, e.version = "19.3.1";
})), h = /* @__PURE__ */ s(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = m();
})), g = /* @__PURE__ */ s(((e) => {
	var t = p(), n = d(), r = h();
	function i(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function a(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function o(e) {
		for (var t = e, n = t; n && !n.alternate;) t = n, t.flags & 4098 && (e = t.return), n = t.return;
		for (; t.return;) t = t.return;
		return t.tag === 3 ? e : null;
	}
	function s(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function c(e) {
		if (e.tag === 31) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function l(e) {
		if (o(e) !== e) throw Error(i(188));
	}
	function u(e) {
		var t = e.alternate;
		if (!t) {
			if (t = o(e), t === null) throw Error(i(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var a = n.return;
			if (a === null) break;
			var s = a.alternate;
			if (s === null) {
				if (r = a.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (a.child === s.child) {
				for (s = a.child; s;) {
					if (s === n) return l(a), e;
					if (s === r) return l(a), t;
					s = s.sibling;
				}
				throw Error(i(188));
			}
			if (n.return !== r.return) n = a, r = s;
			else {
				for (var c = !1, u = a.child; u;) {
					if (u === n) {
						c = !0, n = a, r = s;
						break;
					}
					if (u === r) {
						c = !0, r = a, n = s;
						break;
					}
					u = u.sibling;
				}
				if (!c) {
					for (u = s.child; u;) {
						if (u === n) {
							c = !0, n = s, r = a;
							break;
						}
						if (u === r) {
							c = !0, r = s, n = a;
							break;
						}
						u = u.sibling;
					}
					if (!c) throw Error(i(189));
				}
			}
			if (n.alternate !== r) throw Error(i(190));
		}
		if (n.tag !== 3) throw Error(i(188));
		return n.stateNode.current === n ? e : t;
	}
	function f(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e;
		for (e = e.child; e !== null;) {
			if (t = f(e), t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	function m(e, t, n, r, i, a) {
		for (; e !== null;) {
			if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && n(e, r, i, a) || (e.tag !== 22 || e.memoizedState === null) && (t || e.tag !== 5 && e.tag !== 27) && m(e.child, t, n, r, i, a)) return !0;
			e = e.sibling;
		}
		return !1;
	}
	function g(e) {
		for (e = e.return; e !== null;) {
			if (e.tag === 3 || e.tag === 5 || e.tag === 27) return e;
			e = e.return;
		}
		return null;
	}
	function _(e) {
		var t = !1;
		for (e = e.return; e !== null && (e.tag === 4 && (t = !0), e.tag !== 3 && e.tag !== 5 && e.tag !== 27);) e = e.return;
		return t;
	}
	function v(e) {
		var t = [null, null], n = g(e);
		return n === null || y(t, e, n.child, { foundSelf: !1 }), t;
	}
	function y(e, t, n, r) {
		for (; n !== null;) {
			if (n === t) r.foundSelf = !0;
			else if (n.tag === 5 || n.tag === 27 || n.tag === 6) {
				if (r.foundSelf) return e[1] = n, !0;
				e[0] = n;
			} else if ((n.tag !== 22 || n.memoizedState === null) && y(e, t, n.child, r)) return !0;
			n = n.sibling;
		}
		return !1;
	}
	function b(e) {
		switch (e.tag) {
			case 5:
			case 27:
			case 6: return e.stateNode;
			case 3: return e.stateNode.containerInfo;
			default: throw Error(i(559));
		}
	}
	var x = null, S = null;
	function C(e, t, n) {
		return e === n || e === t && (x = e, !0);
	}
	function w(e, t, n) {
		return e === n ? (S = e, !1) : e === t && (S !== null && (x = e), !0);
	}
	function T(e) {
		if (e === null) return null;
		do
			e = e === null ? null : e.return;
		while (e && e.tag !== 5 && e.tag !== 27 && e.tag !== 3);
		return e || null;
	}
	function E(e, t, n) {
		for (var r = 0, i = e; i; i = n(i)) r++;
		i = 0;
		for (var a = t; a; a = n(a)) i++;
		for (; 0 < r - i;) e = n(e), r--;
		for (; 0 < i - r;) t = n(t), i--;
		for (; r--;) {
			if (e === t || t !== null && e === t.alternate) return e;
			e = n(e), t = n(t);
		}
		return null;
	}
	var D = Object.assign, ee = Symbol.for("react.element"), te = Symbol.for("react.transitional.element"), ne = Symbol.for("react.portal"), re = Symbol.for("react.fragment"), ie = Symbol.for("react.strict_mode"), O = Symbol.for("react.profiler"), ae = Symbol.for("react.consumer"), oe = Symbol.for("react.context"), se = Symbol.for("react.forward_ref"), ce = Symbol.for("react.suspense"), le = Symbol.for("react.suspense_list"), ue = Symbol.for("react.memo"), de = Symbol.for("react.lazy"), fe = Symbol.for("react.activity"), pe = Symbol.for("react.legacy_hidden"), me = Symbol.for("react.memo_cache_sentinel"), he = Symbol.for("react.view_transition"), ge = Symbol.for("react.recoverable"), _e = Symbol.iterator;
	function ve(e) {
		return typeof e != "object" || !e ? null : (e = _e && e[_e] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var ye = Symbol.for("react.client.reference");
	function be(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === ye ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case re: return "Fragment";
			case O: return "Profiler";
			case ie: return "StrictMode";
			case ce: return "Suspense";
			case le: return "SuspenseList";
			case fe: return "Activity";
			case he: return "ViewTransition";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case ne: return "Portal";
			case oe: return e.displayName || "Context";
			case ae: return (e._context.displayName || "Context") + ".Consumer";
			case se:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case ue: return t = e.displayName || null, t === null ? be(e.type) || "Memo" : t;
			case de:
				t = e._payload, e = e._init;
				try {
					return be(e(t));
				} catch {}
		}
		return null;
	}
	var xe = Array.isArray, k = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, A = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Se = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, Ce = [], we = -1;
	function Te(e) {
		return { current: e };
	}
	function Ee(e) {
		0 > we || (e.current = Ce[we], Ce[we] = null, we--);
	}
	function De(e, t) {
		we++, Ce[we] = e.current, e.current = t;
	}
	var Oe = Te(null), ke = Te(null), Ae = Te(null), je = Te(null);
	function Me(e, t) {
		switch (De(Ae, t), De(ke, e), De(Oe, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? dp(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = dp(t), e = fp(t, e);
			else switch (e) {
				case "svg":
					e = 1;
					break;
				case "math":
					e = 2;
					break;
				default: e = 0;
			}
		}
		Ee(Oe), De(Oe, e);
	}
	function Ne() {
		Ee(Oe), Ee(ke), Ee(Ae);
	}
	function Pe(e) {
		var t = e.memoizedState;
		t !== null && (ch._currentValue = t.memoizedState, De(je, e)), t = Oe.current;
		var n = fp(t, e.type);
		t !== n && (De(ke, e), De(Oe, n));
	}
	function Fe(e) {
		ke.current === e && (Ee(Oe), Ee(ke)), je.current === e && (Ee(je), ch._currentValue = Se);
	}
	var Ie, Le;
	function Re(e) {
		if (Ie === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			Ie = t && t[1] || "", Le = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + Ie + e + Le;
	}
	var ze = !1;
	function Be(e, t) {
		if (!e || ze) return "";
		ze = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							n = !1;
							try {
								var i = Object.getOwnPropertyDescriptor(e.prototype, "props");
								Object.defineProperty(e.prototype, "props", {
									configurable: !0,
									set: function() {
										throw Error();
									}
								}), n = !0, new e();
							} finally {
								n && (i === void 0 ? delete e.prototype.props : Object.defineProperty(e.prototype, "props", i));
							}
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			ze = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? Re(n) : "";
	}
	function Ve(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return Re(e.type);
			case 16: return Re("Lazy");
			case 13: return e.child !== t && t !== null ? Re("Suspense Fallback") : Re("Suspense");
			case 19: return Re("SuspenseList");
			case 0:
			case 15: return Be(e.type, !1);
			case 11: return Be(e.type.render, !1);
			case 1: return Be(e.type, !0);
			case 31: return Re("Activity");
			case 30: return Re("ViewTransition");
			default: return "";
		}
	}
	function He(e) {
		try {
			var t = "", n = null;
			do
				t += Ve(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var Ue = Object.prototype.hasOwnProperty, We = t.unstable_scheduleCallback, Ge = t.unstable_cancelCallback, Ke = t.unstable_shouldYield, qe = t.unstable_requestPaint, Je = t.unstable_now, Ye = t.unstable_getCurrentPriorityLevel, Xe = t.unstable_ImmediatePriority, Ze = t.unstable_UserBlockingPriority, Qe = t.unstable_NormalPriority, $e = t.unstable_LowPriority, et = t.unstable_IdlePriority, tt = t.log, nt = t.unstable_setDisableYieldValue, rt = null, it = null;
	function at(e) {
		if (typeof tt == "function" && nt(e), it && typeof it.setStrictMode == "function") try {
			it.setStrictMode(rt, e);
		} catch {}
	}
	var ot = Math.clz32 ? Math.clz32 : lt, st = Math.log, ct = Math.LN2;
	function lt(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (st(e) / ct | 0) | 0;
	}
	var ut = 256, dt = 262144, ft = 4194304;
	function pt(e) {
		var t = e & 42;
		if (t !== 0) return t;
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return e & -e;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return e & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return e & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return e;
		}
	}
	function mt(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = pt(n))) : i = pt(o) : i = pt(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = pt(n))) : i = pt(o)) : i = pt(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function ht(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function gt(e, t) {
		t & 8 && (t |= t & 32);
		var n = e.entangledLanes;
		if (n !== 0) for (e = e.entanglements, n &= t; 0 < n;) {
			var r = 31 - ot(n), i = 1 << r;
			t |= e[r], n &= ~i;
		}
		return t;
	}
	function _t(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return t + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function vt() {
		var e = ft;
		return ft <<= 1, !(ft & 62914560) && (ft = 4194304), e;
	}
	function yt(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function bt(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function xt(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - ot(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && St(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function St(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - ot(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function Ct(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - ot(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function wt(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : Tt(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function Tt(e) {
		switch (e) {
			case 2:
				e = 1;
				break;
			case 8:
				e = 4;
				break;
			case 32:
				e = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				e = 128;
				break;
			case 268435456:
				e = 134217728;
				break;
			default: e = 0;
		}
		return e;
	}
	function Et(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function Dt() {
		var e = A.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : wh(e.type)) : e;
	}
	function Ot(e, t) {
		var n = A.p;
		try {
			return A.p = e, t();
		} finally {
			A.p = n;
		}
	}
	var kt = Math.random().toString(36).slice(2), At = "__reactFiber$" + kt, jt = "__reactProps$" + kt, Mt = "__reactContainer$" + kt, Nt = "__reactEvents$" + kt, Pt = "__reactListeners$" + kt, j = "__reactHandles$" + kt, Ft = "__reactResources$" + kt, It = "__reactMarker$" + kt, Lt = "__reactLoad$" + kt;
	function Rt(e) {
		delete e[At], delete e[jt], delete e[Pt], delete e[j];
	}
	function zt(e) {
		var t;
		if (t = e[At]) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[Mt] || n[At]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = pm(e); e !== null;) {
					if (n = e[At]) return n;
					e = pm(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function Bt(e) {
		if (e = e[At] || e[Mt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function Vt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(i(33));
	}
	function Ht(e) {
		var t = e[Ft];
		return t ||= e[Ft] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function Ut(e) {
		e[It] = !0;
	}
	function Wt(e) {
		e[Lt] = void 0;
	}
	var Gt = /* @__PURE__ */ new Set(), Kt = {};
	function qt(e, t) {
		Jt(e, t), Jt(e + "Capture", t);
	}
	function Jt(e, t) {
		for (Kt[e] = t, e = 0; e < t.length; e++) Gt.add(t[e]);
	}
	var Yt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), Xt = {}, Zt = {};
	function Qt(e) {
		return Ue.call(Zt, e) ? !0 : Ue.call(Xt, e) ? !1 : Yt.test(e) ? Zt[e] = !0 : (Xt[e] = !0, !1);
	}
	var M = !1;
	function $t() {
		var e = M;
		return M = !1, e;
	}
	function en(e, t, n) {
		if (Qt(t)) {
			if (n === null) e.removeAttribute(t);
			else {
				switch (typeof n) {
					case "undefined":
					case "function":
					case "symbol":
						e.removeAttribute(t);
						return;
					case "boolean":
						var r = t.toLowerCase().slice(0, 5);
						if (r !== "data-" && r !== "aria-") {
							e.removeAttribute(t);
							return;
						}
				}
				e.setAttribute(t, n);
			}
		}
	}
	function tn(e, t, n) {
		if (n === null) e.removeAttribute(t);
		else {
			switch (typeof n) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(t);
					return;
			}
			e.setAttribute(t, n);
		}
	}
	function nn(e, t, n, r) {
		if (r === null) e.removeAttribute(n);
		else {
			switch (typeof r) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(n);
					return;
			}
			e.setAttributeNS(t, n, r);
		}
	}
	function rn(e) {
		switch (typeof e) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function an(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function on(e, t, n) {
		var r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
		if (!e.hasOwnProperty(t) && r !== void 0 && typeof r.get == "function" && typeof r.set == "function") {
			var i = r.get, a = r.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					n = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: r.enumerable }), {
				getValue: function() {
					return n;
				},
				setValue: function(e) {
					n = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function sn(e) {
		if (!e._valueTracker) {
			var t = an(e) ? "checked" : "value";
			e._valueTracker = on(e, t, "" + e[t]);
		}
	}
	function cn(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = an(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	var ln = /[\n"\\]/g;
	function un(e) {
		return e.replace(ln, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function dn(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + rn(t)) : e.value !== "" + rn(t) && (e.value = "" + rn(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : pn(e, rn(n)) : o === "number" && e.value == t ? pn(e, rn(e.value)) : pn(e, rn(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + rn(s) : e.removeAttribute("name");
	}
	function fn(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				sn(e);
				return;
			}
			n = n == null ? "" : "" + rn(n), t = t == null ? n : "" + rn(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), sn(e);
	}
	function pn(e, t) {
		e.defaultValue !== "" + t && (e.defaultValue = "" + t);
	}
	function mn(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + rn(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function hn(e, t, n) {
		t != null && (t = "" + rn(t), t !== e.value && (e.value = t), n == null) ? e.defaultValue !== t && (e.defaultValue = t) : e.defaultValue = n == null ? "" : "" + rn(n);
	}
	function gn(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(i(92));
				if (xe(r)) {
					if (1 < r.length) throw Error(i(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = rn(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), sn(e);
	}
	function _n(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var vn = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function yn(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || vn.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function bn(e, t, n) {
		if (t != null && typeof t != "object") throw Error(i(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "", M = !0);
			for (var a in t) r = t[a], t.hasOwnProperty(a) && n[a] !== r && (yn(e, a, r), M = !0);
		} else for (var o in t) t.hasOwnProperty(o) && yn(e, o, t[o]);
	}
	function xn(e) {
		if (e.indexOf("-") === -1) return !1;
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var Sn = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["maskType", "mask-type"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), Cn = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function wn(e) {
		return Cn.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function Tn() {}
	var En = null;
	function Dn(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var On = null, kn = null;
	function An(e) {
		var t = Bt(e);
		if (t && (e = t.stateNode)) {
			var n = e[jt] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (dn(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + un("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var a = r[jt] || null;
								if (!a) throw Error(i(90));
								dn(r, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && cn(r);
					}
					break a;
				case "textarea":
					hn(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && mn(e, !!n.multiple, t, !1);
			}
		}
	}
	var jn = !1;
	function Mn(e, t, n) {
		if (jn) return e(t, n);
		jn = !0;
		try {
			return e(t);
		} finally {
			if (jn = !1, (On !== null || kn !== null) && (zd(), On && (t = On, e = kn, kn = On = null, An(t), e))) for (t = 0; t < e.length; t++) An(e[t]);
		}
	}
	function Nn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[jt] || null;
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(r = !r.disabled) || (e = e.type, r = e !== "button" && e !== "input" && e !== "select" && e !== "textarea"), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(i(231, t, typeof n));
		return n;
	}
	var Pn = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, Fn = !1;
	if (Pn) try {
		var In = {};
		Object.defineProperty(In, "passive", { get: function() {
			Fn = !0;
		} }), window.addEventListener("test", In, In), window.removeEventListener("test", In, In);
	} catch {
		Fn = !1;
	}
	var Ln = null, Rn = null, N = null;
	function zn() {
		if (N) return N;
		var e, t = Rn, n = t.length, r, i = "value" in Ln ? Ln.value : Ln.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return N = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Bn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Vn() {
		return !0;
	}
	function P() {
		return !1;
	}
	function Hn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Vn : P, this.isPropagationStopped = P, this;
		}
		return D(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Vn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Vn);
			},
			persist: function() {},
			isPersistent: Vn
		}), t;
	}
	var Un = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Wn = Hn(Un), Gn = D({}, Un, {
		view: 0,
		detail: 0
	}), Kn = Hn(Gn), qn, F, Jn, Yn = D({}, Gn, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: or,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Jn && (Jn && e.type === "mousemove" ? (qn = e.screenX - Jn.screenX, F = e.screenY - Jn.screenY) : F = qn = 0, Jn = e), qn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : F;
		}
	}), Xn = Hn(Yn), Zn = Hn(D({}, Yn, { dataTransfer: 0 })), Qn = Hn(D({}, Gn, { relatedTarget: 0 })), $n = Hn(D({}, Un, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), er = Hn(D({}, Un, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), tr = Hn(D({}, Un, { data: 0 })), nr = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, rr = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, ir = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function ar(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = ir[e]) ? !!t[e] : !1;
	}
	function or() {
		return ar;
	}
	var sr = Hn(D({}, Gn, {
		key: function(e) {
			if (e.key) {
				var t = nr[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Bn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? rr[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: or,
		charCode: function(e) {
			return e.type === "keypress" ? Bn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Bn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), cr = Hn(D({}, Yn, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), lr = Hn(D({}, Un, { submitter: 0 })), ur = Hn(D({}, Gn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: or
	})), dr = Hn(D({}, Un, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), fr = Hn(D({}, Yn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), pr = Hn(D({}, Un, {
		newState: 0,
		oldState: 0,
		source: 0
	})), mr = [
		9,
		13,
		27,
		32
	], hr = Pn && "CompositionEvent" in window, gr = null;
	Pn && "documentMode" in document && (gr = document.documentMode);
	var _r = Pn && "TextEvent" in window && !gr, vr = Pn && (!hr || gr && 8 < gr && 11 >= gr), yr = " ", br = !1;
	function xr(e, t) {
		switch (e) {
			case "keyup": return mr.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function Sr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var Cr = !1;
	function wr(e, t) {
		switch (e) {
			case "compositionend": return Sr(t);
			case "keypress": return t.which === 32 ? (br = !0, yr) : null;
			case "textInput": return e = t.data, e === yr && br ? null : e;
			default: return null;
		}
	}
	function Tr(e, t) {
		if (Cr) return e === "compositionend" || !hr && xr(e, t) ? (e = zn(), N = Rn = Ln = null, Cr = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return vr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var Er = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function Dr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!Er[e.type] : t === "textarea";
	}
	function Or(e, t, n, r) {
		On ? kn ? kn.push(r) : kn = [r] : On = r, t = Jf(t, "onChange"), 0 < t.length && (n = new Wn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var kr = null, Ar = null;
	function jr(e) {
		Vf(e, 0);
	}
	function Mr(e) {
		if (cn(Vt(e))) return e;
	}
	function Nr(e, t) {
		if (e === "change") return t;
	}
	var Pr = !1;
	if (Pn) {
		var Fr;
		if (Pn) {
			var Ir = "oninput" in document;
			if (!Ir) {
				var Lr = document.createElement("div");
				Lr.setAttribute("oninput", "return;"), Ir = typeof Lr.oninput == "function";
			}
			Fr = Ir;
		} else Fr = !1;
		Pr = Fr && (!document.documentMode || 9 < document.documentMode);
	}
	function Rr() {
		kr && (kr.detachEvent("onpropertychange", zr), Ar = kr = null);
	}
	function zr(e) {
		if (e.propertyName === "value" && Mr(Ar)) {
			var t = [];
			Or(t, Ar, e, Dn(e)), Mn(jr, t);
		}
	}
	function Br(e, t, n) {
		e === "focusin" ? (Rr(), kr = t, Ar = n, kr.attachEvent("onpropertychange", zr)) : e === "focusout" && Rr();
	}
	function Vr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return Mr(Ar);
	}
	function Hr(e, t) {
		if (e === "click") return Mr(t);
	}
	function Ur(e, t) {
		if (e === "input" || e === "change") return Mr(t);
	}
	function Wr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Gr = typeof Object.is == "function" ? Object.is : Wr;
	function Kr(e, t) {
		if (Gr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Ue.call(t, i) || !Gr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function qr(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function Jr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Yr(e, t) {
		var n = Jr(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = Jr(n);
		}
	}
	function Xr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Xr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Zr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = qr(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = qr(e.document);
		}
		return t;
	}
	function Qr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var $r = Pn && "documentMode" in document && 11 >= document.documentMode, ei = null, ti = null, ni = null, ri = !1;
	function ii(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		ri || ei == null || ei !== qr(r) || (r = ei, "selectionStart" in r && Qr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), ni && Kr(ni, r) || (ni = r, r = Jf(ti, "onSelect"), 0 < r.length && (t = new Wn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = ei)));
	}
	function ai(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var oi = {
		animationend: ai("Animation", "AnimationEnd"),
		animationiteration: ai("Animation", "AnimationIteration"),
		animationstart: ai("Animation", "AnimationStart"),
		transitionrun: ai("Transition", "TransitionRun"),
		transitionstart: ai("Transition", "TransitionStart"),
		transitioncancel: ai("Transition", "TransitionCancel"),
		transitionend: ai("Transition", "TransitionEnd")
	}, si = {}, ci = {};
	Pn && (ci = document.createElement("div").style, "AnimationEvent" in window || (delete oi.animationend.animation, delete oi.animationiteration.animation, delete oi.animationstart.animation), "TransitionEvent" in window || delete oi.transitionend.transition);
	function li(e) {
		if (si[e]) return si[e];
		if (!oi[e]) return e;
		var t = oi[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in ci) return si[e] = t[n];
		return e;
	}
	var ui = li("animationend"), di = li("animationiteration"), fi = li("animationstart"), pi = li("transitionrun"), mi = li("transitionstart"), hi = li("transitioncancel"), gi = li("transitionend"), _i = /* @__PURE__ */ new Map(), vi = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	vi.push("scrollEnd");
	function yi(e, t) {
		_i.set(e, t), qt(t, [e]);
	}
	var I = 0;
	function bi(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = bd.identifierPrefix;
		var n = I++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function xi(e) {
		if (e == null || typeof e == "string") return e;
		var t = null, n = Od;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = e[n[r]];
			if (i != null) {
				if (i === "none") return "none";
				t = t == null ? i : t + (" " + i);
			}
		}
		return t ?? e.default;
	}
	function Si(e, t) {
		return e = xi(e), t = xi(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
	}
	var Ci = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, wi = [], Ti = 0, Ei = 0;
	function Di() {
		for (var e = Ti, t = Ei = Ti = 0; t < e;) {
			var n = wi[t];
			wi[t++] = null;
			var r = wi[t];
			wi[t++] = null;
			var i = wi[t];
			wi[t++] = null;
			var a = wi[t];
			if (wi[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && ji(n, i, a);
		}
	}
	function Oi(e, t, n, r) {
		wi[Ti++] = e, wi[Ti++] = t, wi[Ti++] = n, wi[Ti++] = r, Ei |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function ki(e, t, n, r) {
		return Oi(e, t, n, r), Mi(e);
	}
	function Ai(e, t) {
		return Oi(e, null, null, t), Mi(e);
	}
	function ji(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - ot(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function Mi(e) {
		if (50 < kd) throw kd = 0, Ad = null, Error(i(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var Ni = {};
	function Pi(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function Fi(e, t, n, r) {
		return new Pi(e, t, n, r);
	}
	function Ii(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Li(e, t) {
		var n = e.alternate;
		return n === null ? (n = Fi(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 1206910976, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function Ri(e, t) {
		e.flags &= 1206910978;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function zi(e, t, n, r, a, o) {
		var s = 0;
		if (r = e, typeof r == "function") Ii(r) && (s = 1);
		else if (typeof r == "string") s = Jm(e, n, Oe.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case fe: return e = Fi(31, n, t, a), e.elementType = fe, e.lanes = o, e;
			case re: return Bi(n.children, a, o, t);
			case ie:
				s = 8, a |= 24;
				break;
			case O: return e = Fi(12, n, t, a | 2), e.elementType = O, e.lanes = o, e;
			case ce: return e = Fi(13, n, t, a), e.elementType = ce, e.lanes = o, e;
			case le: return e = Fi(19, n, t, a), e.elementType = le, e.lanes = o, e;
			case pe:
			case he: return e = a | 32, e = Fi(30, n, t, e), e.elementType = he, e.lanes = o, e.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, e;
			default:
				if (typeof r == "object" && r) switch (r.$$typeof) {
					case oe:
						s = 10;
						break a;
					case ae:
						s = 9;
						break a;
					case se:
						s = 11;
						break a;
					case ue:
						s = 14;
						break a;
					case de:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(i(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = Fi(s, n, t, a), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function Bi(e, t, n, r) {
		return e = Fi(7, e, r, t), e.lanes = n, e;
	}
	function Vi(e, t, n) {
		return e = Fi(6, e, null, t), e.lanes = n, e;
	}
	function Hi(e) {
		var t = Fi(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function Ui(e, t, n) {
		return t = Fi(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Wi = /* @__PURE__ */ new WeakMap();
	function Gi(e, t) {
		if (typeof e == "object" && e) {
			var n = Wi.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: He(t)
			}, Wi.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: He(t)
		};
	}
	var Ki = [], qi = 0, Ji = null, Yi = 0, Xi = [], Zi = 0, Qi = null, $i = 1, ea = "";
	function L(e, t) {
		Ki[qi++] = Yi, Ki[qi++] = Ji, Ji = e, Yi = t;
	}
	function ta(e, t, n) {
		Xi[Zi++] = $i, Xi[Zi++] = ea, Xi[Zi++] = Qi, Qi = e;
		var r = $i;
		e = ea;
		var i = 32 - ot(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - ot(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, $i = 1 << 32 - ot(t) + i | n << i | r, ea = a + e;
		} else $i = 1 << a | n << i | r, ea = e;
	}
	function na(e) {
		e.return !== null && (L(e, 1), ta(e, 1, 0));
	}
	function ra(e) {
		for (; e === Ji;) Ji = Ki[--qi], Ki[qi] = null, Yi = Ki[--qi], Ki[qi] = null;
		for (; e === Qi;) Qi = Xi[--Zi], Xi[Zi] = null, ea = Xi[--Zi], Xi[Zi] = null, $i = Xi[--Zi], Xi[Zi] = null;
	}
	function ia(e, t) {
		Xi[Zi++] = $i, Xi[Zi++] = ea, Xi[Zi++] = Qi, $i = t.id, ea = t.overflow, Qi = e;
	}
	var aa = null, oa = null, R = !1, sa = null, ca = !1, la = Error(i(519));
	function ua(e) {
		throw ga(Gi(Error(i(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), la;
	}
	function da(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[At] = e, t[jt] = r, n) {
			case "dialog":
				Q("cancel", t), Q("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				Q("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < zf.length; n++) Q(zf[n], t);
				break;
			case "source":
				Q("error", t);
				break;
			case "img":
			case "image":
			case "link":
				Q("error", t), Q("load", t);
				break;
			case "details":
				Q("toggle", t);
				break;
			case "input":
				Q("invalid", t), fn(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), gn(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || ep(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = Tn), t = !0) : t = !1, t || ua(e, !0);
	}
	function fa(e) {
		for (aa = e.return; aa;) switch (aa.tag) {
			case 5:
			case 31:
			case 13:
				ca = !1;
				return;
			case 27:
			case 3:
				ca = !0;
				return;
			default: aa = aa.return;
		}
	}
	function pa(e) {
		if (e !== aa) return !1;
		if (!R) return fa(e), R = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || mp(e.type, e.memoizedProps)), n = !n), n && oa && ua(e), fa(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			oa = fm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			oa = fm(e);
		} else t === 27 ? (t = oa, Cp(e.type) ? (e = dm, dm = null, oa = e) : oa = t) : oa = aa ? um(e.stateNode.nextSibling) : null;
		return !0;
	}
	function ma() {
		oa = aa = null, R = !1;
	}
	function ha() {
		var e = sa;
		return e !== null && (fd === null ? fd = e : fd.push.apply(fd, e), sa = null), e;
	}
	function ga(e) {
		sa === null ? sa = [e] : sa.push(e);
	}
	var _a = Te(null), va = null, ya = null;
	function ba(e, t, n) {
		De(_a, t._currentValue), t._currentValue = n;
	}
	function xa(e) {
		e._currentValue = _a.current, Ee(_a);
	}
	function Sa(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Ca(e, t, n, r) {
		var a = e.child;
		for (a !== null && (a.return = e); a !== null;) {
			var o = a.dependencies;
			if (o !== null) {
				var s = a.child;
				o = o.firstContext;
				a: for (; o !== null;) {
					var c = o;
					o = a;
					for (var l = 0; l < t.length; l++) if (c.context === t[l]) {
						o.lanes |= n, c = o.alternate, c !== null && (c.lanes |= n), Sa(o.return, n, e), r || (s = null);
						break a;
					}
					o = c.next;
				}
			} else if (a.tag === 18) {
				if (s = a.return, s === null) throw Error(i(341));
				s.lanes |= n, o = s.alternate, o !== null && (o.lanes |= n), Sa(s, n, e), s = null;
			} else a.tag === 13 && a.memoizedState !== null && a.memoizedState.dehydrated === null ? (a.lanes |= n, s = a.alternate, s !== null && (s.lanes |= n), Sa(a.return, n, e), s = a.child, s = s === null ? null : s.sibling) : s = a.child;
			if (s !== null) s.return = a;
			else for (s = a; s !== null;) {
				if (s === e) {
					s = null;
					break;
				}
				if (a = s.sibling, a !== null) {
					a.return = s.return, s = a;
					break;
				}
				s = s.return;
			}
			a = s;
		}
	}
	function wa(e, t, n, r) {
		e = null;
		for (var a = t, o = !1; a !== null;) {
			if (!o) {
				if (a.flags & 524288) o = !0;
				else if (a.flags & 262144) break;
			}
			if (a.tag === 10) {
				var s = a.alternate;
				if (s === null) throw Error(i(387));
				if (s = s.memoizedProps, s !== null) {
					var c = a.type;
					Gr(a.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (a === je.current) {
				if (s = a.alternate, s === null) throw Error(i(387));
				s.memoizedState.memoizedState !== a.memoizedState.memoizedState && (e === null ? e = [ch] : e.push(ch));
			}
			a = a.return;
		}
		return e !== null && Ca(t, e, n, r), t.flags |= 262144, e !== null;
	}
	function Ta(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Gr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function Ea(e) {
		va = e, ya = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function Da(e) {
		return ka(va, e);
	}
	function Oa(e, t) {
		return va === null && Ea(e), ka(e, t);
	}
	function ka(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, ya === null) {
			if (e === null) throw Error(i(308));
			ya = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else ya = ya.next = t;
		return n;
	}
	var Aa = typeof AbortController < "u" ? AbortController : function() {
		var e = [], t = this.signal = {
			aborted: !1,
			addEventListener: function(t, n) {
				e.push(n);
			}
		};
		this.abort = function() {
			t.aborted = !0, e.forEach(function(e) {
				return e();
			});
		};
	}, ja = t.unstable_scheduleCallback, Ma = t.unstable_NormalPriority, Na = {
		$$typeof: oe,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function Pa() {
		return {
			controller: new Aa(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function Fa(e) {
		e.refCount--, e.refCount === 0 && ja(Ma, function() {
			e.controller.abort();
		});
	}
	function Ia(e, t) {
		if (e.pendingLanes & 4194048) {
			var n = e.transitionTypes;
			for (n === null && (n = e.transitionTypes = []), e = 0; e < t.length; e++) {
				var r = t[e];
				n.indexOf(r) === -1 && n.push(r);
			}
		}
	}
	var La = null;
	function Ra(e) {
		var t = e.transitionTypes;
		return e.transitionTypes = null, t;
	}
	var za = null, Ba = 0, Va = 0, Ha = null;
	function Ua(e, t) {
		if (za === null) {
			var n = za = [];
			Ba = 0, Va = Pf(), Ha = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return Ba++, t.then(Wa, Wa), t;
	}
	function Wa() {
		if (--Ba === 0 && (La = null, za !== null)) {
			Ha !== null && (Ha.status = "fulfilled");
			var e = za;
			za = null, Va = 0, Ha = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function Ga(e, t) {
		var n = [], r = {
			status: "pending",
			value: null,
			reason: null,
			then: function(e) {
				n.push(e);
			}
		};
		return e.then(function() {
			r.status = "fulfilled", r.value = t;
			for (var e = 0; e < n.length; e++) (0, n[e])(t);
		}, function(e) {
			for (r.status = "rejected", r.reason = e, e = 0; e < n.length; e++) (0, n[e])(void 0);
		}), r;
	}
	var Ka = k.S;
	k.S = function(e, t) {
		if (hd = Je(), typeof t == "object" && t && typeof t.then == "function" && Ua(e, t), La !== null) for (var n = bf; n !== null;) Ia(n, La), n = n.next;
		if (n = e.types, n !== null) {
			for (var r = bf; r !== null;) Ia(r, n), r = r.next;
			if (Va !== 0) {
				r = La, r === null && (r = La = []);
				for (var i = 0; i < n.length; i++) {
					var a = n[i];
					r.indexOf(a) === -1 && r.push(a);
				}
			}
		}
		Ka !== null && Ka(e, t);
	};
	var qa = Te(null);
	function Ja() {
		var e = qa.current;
		return e === null ? $u.pooledCache : e;
	}
	function Ya(e, t) {
		t === null ? De(qa, qa.current) : De(qa, t.pool);
	}
	function z() {
		var e = Ja();
		return e === null ? null : {
			parent: Na._currentValue,
			pool: e
		};
	}
	var Xa = Error(i(460)), Za = Error(i(474)), Qa = Error(i(542)), $a = { then: function() {} };
	function eo(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function to(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Tn, Tn), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, ao(e), e === void 0 && !("reason" in t) ? Error(i(600)) : e;
			default:
				if (typeof t.status == "string") t.then(Tn, Tn);
				else {
					if (e = $u, e !== null && 100 < e.shellSuspendCounter) throw Error(i(482));
					e = t, e.status = "pending", e.then(function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "fulfilled", n.value = e;
						}
					}, function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "rejected", n.reason = e;
						}
					});
				}
				switch (t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw e = t.reason, ao(e), e;
				}
				throw ro = t, Xa;
		}
	}
	function no(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (ro = e, Xa) : e;
		}
	}
	var ro = null;
	function io() {
		if (ro === null) throw Error(i(459));
		var e = ro;
		return ro = null, e;
	}
	function ao(e) {
		if (e === Xa || e === Qa) throw Error(i(483));
	}
	var oo = null, so = 0;
	function co(e) {
		var t = so;
		return so += 1, oo === null && (oo = []), to(oo, e, t);
	}
	function lo(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function uo(e, t) {
		throw t.$$typeof === ee ? Error(i(525)) : (e = Object.prototype.toString.call(t), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function fo(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e) {
			for (var t = /* @__PURE__ */ new Map(); e !== null;) e.key === null ? t.set(e.index, e) : t.set(e.key, e), e = e.sibling;
			return t;
		}
		function a(e, t) {
			return e = Li(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 134217730, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 134217730), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Vi(n, e.mode, r), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var i = n.type;
			return i === re ? (e = d(e, t, n.props.children, r, n.key), lo(e, n), e) : t !== null && (t.elementType === i || typeof i == "object" && i && i.$$typeof === de && no(i) === t.type) ? (t = a(t, n.props), lo(t, n), t.return = e, t) : (t = zi(n.type, n.key, n.props, null, e.mode, r), lo(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = Ui(n, e.mode, r), t.return = e, t) : (t = a(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, i) {
			return t === null || t.tag !== 7 ? (t = Bi(n, e.mode, r, i), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Vi("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case te: return n = zi(t.type, t.key, t.props, null, e.mode, n), lo(n, t), n.return = e, n;
					case ne: return t = Ui(t, e.mode, n), t.return = e, t;
					case de: return t = no(t), f(e, t, n);
				}
				if (xe(t) || ve(t)) return t = Bi(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, co(t), n);
				if (t.$$typeof === oe) return f(e, Oa(e, t), n);
				uo(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case te: return n.key === i ? l(e, t, n, r) : null;
					case ne: return n.key === i ? u(e, t, n, r) : null;
					case de: return n = no(n), p(e, t, n, r);
				}
				if (xe(n) || ve(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, co(n), r);
				if (n.$$typeof === oe) return p(e, t, Oa(e, n), r);
				uo(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case te: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case ne: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case de: return r = no(r), m(e, t, n, r, i);
				}
				if (xe(r) || ve(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, co(r), i);
				if (r.$$typeof === oe) return m(e, t, n, Oa(t, r), i);
				uo(t, r);
			}
			return null;
		}
		function h(i, a, s, c) {
			for (var l = null, u = null, d = a, h = a = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), a = o(_, a, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), R && L(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return R && L(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), R && L(i, h), l;
		}
		function g(a, s, c, l) {
			if (c == null) throw Error(i(151));
			for (var u = null, d = null, h = s, g = s = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(a, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(a, h), s = o(y, s, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(a, h), R && L(a, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(a, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return R && L(a, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, a, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(a, e);
			}), R && L(a, g), u;
		}
		function _(e, r, o, c) {
			if (typeof o == "object" && o && o.type === re && o.key === null && o.props.ref === void 0 && (o = o.props.children), typeof o == "object" && o) {
				switch (o.$$typeof) {
					case te:
						a: {
							for (var l = o.key; r !== null;) {
								if (r.key === l) {
									if (l = o.type, l === re) {
										if (r.tag === 7) {
											n(e, r.sibling), c = a(r, o.props.children), lo(c, o), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === de && no(l) === r.type) {
										n(e, r.sibling), c = a(r, o.props), lo(c, o), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							o.type === re ? (c = Bi(o.props.children, e.mode, c, o.key), lo(c, o), c.return = e, e = c) : (c = zi(o.type, o.key, o.props, null, e.mode, c), lo(c, o), c.return = e, e = c);
						}
						return s(e);
					case ne:
						a: {
							for (l = o.key; r !== null;) {
								if (r.key === l) {
									if (r.tag === 4 && r.stateNode.containerInfo === o.containerInfo && r.stateNode.implementation === o.implementation) {
										n(e, r.sibling), c = a(r, o.children || []), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							c = Ui(o, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case de: return o = no(o), _(e, r, o, c);
				}
				if (xe(o)) return h(e, r, o, c);
				if (ve(o)) {
					if (l = ve(o), typeof l != "function") throw Error(i(150));
					return o = l.call(o), g(e, r, o, c);
				}
				if (typeof o.then == "function") return _(e, r, co(o), c);
				if (o.$$typeof === oe) return _(e, r, Oa(e, o), c);
				uo(e, o);
			}
			return typeof o == "string" && o !== "" || typeof o == "number" || typeof o == "bigint" ? (o = "" + o, r !== null && r.tag === 6 ? (n(e, r.sibling), c = a(r, o), c.return = e, e = c) : (n(e, r), c = Vi(o, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				so = 0;
				var i = _(e, t, n, r);
				return oo = null, i;
			} catch (t) {
				if (t === Xa || t === Qa) throw t;
				var a = Fi(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var po = fo(!0), mo = fo(!1), ho = !1;
	function go(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function _o(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function vo(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function yo(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, q & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = Mi(e), ji(e, null, n), t;
		}
		return Oi(e, r, t, n), Mi(e);
	}
	function bo(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Ct(e, n);
		}
	}
	function xo(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: null,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				callbacks: r.callbacks
			}, e.updateQueue = n;
		} else e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	var So = !1;
	function Co() {
		if (So) {
			var e = Ha;
			if (e !== null) throw e;
		}
	}
	function wo(e, t, n, r) {
		So = !1;
		var i = e.updateQueue;
		ho = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane & -536870913, p = f !== s.lane;
				if (p ? (Y & f) === f : (r & f) === f) {
					f !== 0 && f === Va && (So = !0), u !== null && (u = u.next = {
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: null,
						next: null
					});
					a: {
						var m = e, h = s;
						f = t;
						var g = n;
						switch (h.tag) {
							case 1:
								if (m = h.payload, typeof m == "function") {
									d = m.call(g, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = h.payload, f = typeof m == "function" ? m.call(g, d, f) : m, f == null) break a;
								d = D({}, d, f);
								break a;
							case 2: ho = !0;
						}
					}
					f = s.callback, f !== null && (e.flags |= 64, p && (e.flags |= 8192), p = i.callbacks, p === null ? i.callbacks = [f] : p.push(f));
				} else p = {
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					p = s, s = p.next, p.next = null, i.lastBaseUpdate = p, i.shared.pending = null;
				}
			} while (1);
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), od |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function To(e, t) {
		if (typeof e != "function") throw Error(i(191, e));
		e.call(t);
	}
	function Eo(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) To(n[e], t);
	}
	var Do = Te(null), Oo = Te(0);
	function ko(e, t) {
		e = id, De(Oo, e), De(Do, t), id = e | t.baseLanes;
	}
	function Ao() {
		De(Oo, id), De(Do, Do.current);
	}
	function jo() {
		id = Oo.current, Ee(Do), Ee(Oo);
	}
	var Mo = Te(null), No = null;
	function Po(e) {
		var t = e.alternate;
		De(zo, zo.current & 1), De(Mo, e), No === null && (t === null || Do.current !== null || t.memoizedState !== null) && (No = e);
	}
	function Fo(e) {
		De(zo, zo.current), De(Mo, e), No === null && (No = e);
	}
	function Io(e) {
		e.tag === 22 ? (De(zo, zo.current), De(Mo, e), No === null && (No = e)) : Lo();
	}
	function Lo() {
		De(zo, zo.current), De(Mo, Mo.current);
	}
	function Ro(e) {
		Ee(Mo), No === e && (No = null), Ee(zo);
	}
	var zo = Te(0);
	function Bo(e, t) {
		De(Mo, Mo.current), De(zo, t);
	}
	function Vo(e) {
		Ee(zo), Ee(Mo), No === e && (No = null);
	}
	function Ho(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || sm(n) || cm(n))) return t;
			} else if (t.tag === 19 && t.memoizedProps.revealOrder !== "independent") {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var Uo = 0, B = null, Wo = null, Go = null, Ko = !1, qo = !1, Jo = !1, Yo = 0, Xo = 0, Zo = null, Qo = 0;
	function $o() {
		throw Error(i(321));
	}
	function es(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Gr(e[n], t[n])) return !1;
		return !0;
	}
	function ts(e, t, n, r, i, a) {
		return Uo = a, B = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, k.H = e === null || e.memoizedState === null ? gc : _c, Jo = !1, a = n(r, i), Jo = !1, qo && (a = rs(t, n, r, i)), ns(e), a;
	}
	function ns(e) {
		k.H = hc;
		var t = Wo !== null && Wo.next !== null;
		if (Uo = 0, Go = Wo = B = null, Ko = !1, Xo = 0, Zo = null, t) throw Error(i(300));
		e === null || Pc || (e = e.dependencies, e !== null && Ta(e) && (Pc = !0));
	}
	function rs(e, t, n, r) {
		B = e;
		var a = 0;
		do {
			if (qo && (Zo = null), Xo = 0, qo = !1, 25 <= a) throw Error(i(301));
			if (a += 1, Go = Wo = null, e.updateQueue != null) {
				var o = e.updateQueue;
				o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
			}
			k.H = vc, o = t(n, r);
		} while (qo);
		return o;
	}
	function is() {
		var e = k.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? ds(t) : t, e = e.useState()[0], (Wo === null ? null : Wo.memoizedState) !== e && (B.flags |= 1024), t;
	}
	function as() {
		var e = Yo !== 0;
		return Yo = 0, e;
	}
	function os(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function ss(e) {
		if (Ko) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			Ko = !1;
		}
		Uo = 0, Go = Wo = B = null, qo = !1, Xo = Yo = 0, Zo = null;
	}
	function cs() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return Go === null ? B.memoizedState = Go = e : Go = Go.next = e, Go;
	}
	function ls() {
		if (Wo === null) {
			var e = B.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = Wo.next;
		var t = Go === null ? B.memoizedState : Go.next;
		if (t !== null) Go = t, Wo = e;
		else {
			if (e === null) throw B.alternate === null ? Error(i(467)) : Error(i(310));
			Wo = e, e = {
				memoizedState: Wo.memoizedState,
				baseState: Wo.baseState,
				baseQueue: Wo.baseQueue,
				queue: Wo.queue,
				next: null
			}, Go === null ? B.memoizedState = Go = e : Go = Go.next = e;
		}
		return Go;
	}
	function us() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function ds(e) {
		var t = Xo;
		return Xo += 1, Zo === null && (Zo = []), e = to(Zo, e, t), t = B, (Go === null ? t.memoizedState : Go.next) === null && (t = t.alternate, k.H = t === null || t.memoizedState === null ? gc : _c), e;
	}
	function fs(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return ds(e);
			if (e.$$typeof === ge) return;
			if (e.$$typeof === oe) return Da(e);
		}
		throw Error(i(438, String(e)));
	}
	function ps(e) {
		var t = null, n = B.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = B.alternate;
			r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (t = {
				data: r.data.map(function(e) {
					return e.slice();
				}),
				index: 0
			})));
		}
		if (t ??= {
			data: [],
			index: 0
		}, n === null && (n = us(), B.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = me;
		return t.index++, n;
	}
	function ms(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function hs(e) {
		return gs(ls(), Wo, e);
	}
	function gs(e, t, n) {
		var r = e.queue;
		if (r === null) throw Error(i(311));
		r.lastRenderedReducer = n;
		var a = e.baseQueue, o = r.pending;
		if (o !== null) {
			if (a !== null) {
				var s = a.next;
				a.next = o.next, o.next = s;
			}
			t.baseQueue = a = o, r.pending = null;
		}
		if (o = e.baseState, a === null) e.memoizedState = o;
		else {
			t = a.next;
			var c = s = null, l = null, u = t, d = !1;
			do {
				var f = u.lane & -536870913;
				if (f === u.lane ? (Uo & f) === f : (Y & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === Va && (d = !0);
					else if ((Uo & p) === p) {
						u = u.next, p === Va && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = o) : l = l.next = f, B.lanes |= p, od |= p;
					f = u.action, Jo && n(o, f), o = u.hasEagerState ? u.eagerState : n(o, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = o) : l = l.next = p, B.lanes |= f, od |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = o : l.next = c, !Gr(o, e.memoizedState) && (Pc = !0, d && (n = Ha, n !== null))) throw n;
			e.memoizedState = o, e.baseState = s, e.baseQueue = l, r.lastRenderedState = o;
		}
		return a === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function _s(e) {
		var t = ls(), n = t.queue;
		if (n === null) throw Error(i(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, a = n.pending, o = t.memoizedState;
		if (a !== null) {
			n.pending = null;
			var s = a = a.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== a);
			Gr(o, t.memoizedState) || (Pc = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function vs(e, t, n) {
		var r = B, a = ls(), o = R;
		if (o) {
			if (n === void 0) throw Error(i(407));
			n = n();
		} else n = t();
		var s = !Gr((Wo || a).memoizedState, n);
		if (s && (a.memoizedState = n, Pc = !0), a = a.queue, Us(xs.bind(null, r, a, e), [e]), e = a.getSnapshot !== t || s || Go !== null && !!(Go.memoizedState.tag & 1), Rs(e ? 9 : 8, { destroy: void 0 }, bs.bind(null, r, a, n, t), null), e) {
			if (r.flags |= 2048, $u === null) throw Error(i(349));
			o || Uo & 127 || ys(r, t, n);
		}
		return n;
	}
	function ys(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = B.updateQueue, t === null ? (t = us(), B.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function bs(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Ss(t) && Cs(e);
	}
	function xs(e, t, n) {
		return n(function() {
			Ss(t) && Cs(e);
		});
	}
	function Ss(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Gr(e, n);
		} catch {
			return !0;
		}
	}
	function Cs(e) {
		var t = Ai(e, 2);
		t !== null && Pd(t, e, 2);
	}
	function ws(e) {
		var t = cs();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), Jo) {
				at(!0);
				try {
					n();
				} finally {
					at(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ms,
			lastRenderedState: e
		}, t;
	}
	function Ts(e, t, n, r) {
		return e.baseState = n, gs(e, Wo, typeof r == "function" ? r : ms);
	}
	function Es(e, t, n, r, a) {
		if (fc(e)) throw Error(i(485));
		if (e = t.action, e !== null) {
			var o = {
				payload: a,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(e) {
					o.listeners.push(e);
				}
			};
			k.T === null ? o.isTransition = !1 : n(!0), r(o), n = t.pending, n === null ? (o.next = t.pending = o, Ds(t, o)) : (o.next = n.next, t.pending = n.next = o);
		}
	}
	function Ds(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = k.T, o = {};
			o.types = a === null ? null : a.types, k.T = o;
			try {
				var s = n(i, r), c = k.S;
				c !== null && c(o, s), Os(e, t, s);
			} catch (n) {
				As(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), k.T = a;
			}
		} else try {
			a = n(i, r), Os(e, t, a);
		} catch (n) {
			As(e, t, n);
		}
	}
	function Os(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			ks(e, t, n);
		}, function(n) {
			return As(e, t, n);
		}) : ks(e, t, n);
	}
	function ks(e, t, n) {
		t.status = "fulfilled", t.value = n, js(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Ds(e, n)));
	}
	function As(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, js(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function js(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function Ms(e, t) {
		return t;
	}
	function Ns(e, t) {
		if (R) {
			var n = $u.formState;
			if (n !== null) {
				a: {
					var r = B;
					if (R) {
						if (oa) {
							b: {
								for (var i = oa, a = ca; i.nodeType !== 8;) if (!a || (i = um(i.nextSibling), i === null)) {
									i = null;
									break b;
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								oa = um(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						ua(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = cs(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Ms,
			lastRenderedState: t
		}, n.queue = r, n = lc.bind(null, B, r), r.dispatch = n, r = ws(!1), a = dc.bind(null, B, !1, r.queue), r = cs(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Es.bind(null, B, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function Ps(e) {
		return Fs(ls(), Wo, e);
	}
	function Fs(e, t, n) {
		if (t = gs(e, t, Ms)[0], e = hs(ms)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = ds(t);
		} catch (e) {
			throw e === Xa ? Qa : e;
		}
		else r = t;
		t = ls();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (B.flags |= 2048, Rs(9, { destroy: void 0 }, Is.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Is(e, t) {
		e.action = t;
	}
	function Ls(e) {
		var t = ls(), n = Wo;
		if (n !== null) return Fs(t, n, e);
		ls(), t = t.memoizedState, n = ls();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function Rs(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = B.updateQueue, t === null && (t = us(), B.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function zs() {
		return ls().memoizedState;
	}
	function Bs(e, t, n, r) {
		var i = cs();
		B.flags |= e, i.memoizedState = Rs(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function Vs(e, t, n, r) {
		var i = ls();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		Wo !== null && r !== null && es(r, Wo.memoizedState.deps) ? i.memoizedState = Rs(t, a, n, r) : (B.flags |= e, i.memoizedState = Rs(1 | t, a, n, r));
	}
	function Hs(e, t) {
		Bs(8390656, 8, e, t);
	}
	function Us(e, t) {
		Vs(2048, 8, e, t);
	}
	function Ws(e) {
		B.flags |= 4;
		var t = B.updateQueue;
		if (t === null) t = us(), B.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function Gs(e) {
		var t = ls().memoizedState;
		return Ws({
			ref: t,
			nextImpl: e
		}), function() {
			if (q & 2) throw Error(i(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function Ks(e, t) {
		return Vs(4, 2, e, t);
	}
	function qs(e, t) {
		return Vs(4, 4, e, t);
	}
	function Js(e, t) {
		if (typeof t == "function") {
			e = e();
			var n = t(e);
			return function() {
				typeof n == "function" ? n() : t(null);
			};
		}
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function Ys(e, t, n) {
		n = n == null ? null : n.concat([e]), Vs(4, 4, Js.bind(null, t, e), n);
	}
	function V() {}
	function Xs(e, t) {
		var n = ls();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && es(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Zs(e, t) {
		var n = ls();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && es(t, r[1])) return r[0];
		if (r = e(), Jo) {
			at(!0);
			try {
				e();
			} finally {
				at(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function Qs(e, t, n) {
		return n === void 0 || Uo & 1073741824 && !(Y & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Md(), B.lanes |= e, od |= e, n);
	}
	function $s(e, t, n, r) {
		return Gr(n, t) ? n : Do.current === null ? !(Uo & 106) || Uo & 1073741824 && !(Y & 261930) ? (Pc = !0, e.memoizedState = n) : (e = Md(), B.lanes |= e, od |= e, t) : (e = Qs(e, n, r), Gr(e, t) || (Pc = !0), e);
	}
	function ec(e, t, n, r, i) {
		var a = A.p;
		A.p = a !== 0 && 8 > a ? a : 8;
		var o = k.T, s = {};
		s.types = o === null ? null : o.types, k.T = s, dc(e, !1, t, n);
		try {
			var c = i(), l = k.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? uc(e, t, Ga(c, r), jd(e)) : uc(e, t, r, jd(e));
		} catch (n) {
			uc(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, jd());
		} finally {
			A.p = a, o !== null && s.types !== null && (o.types = s.types), k.T = o;
		}
	}
	function H() {}
	function tc(e, t, n, r) {
		if (e.tag !== 5) throw Error(i(476));
		var a = nc(e).queue;
		ec(e, a, t, Se, n === null ? H : function() {
			return rc(e), n(r);
		});
	}
	function nc(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: Se,
			baseState: Se,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ms,
				lastRenderedState: Se
			},
			next: null
		};
		var n = {};
		return t.next = {
			memoizedState: n,
			baseState: n,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ms,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function rc(e) {
		var t = nc(e);
		t.next === null && (t = e.alternate.memoizedState), uc(e, t.next.queue, {}, jd());
	}
	function ic() {
		return Da(ch);
	}
	function ac() {
		return ls().memoizedState;
	}
	function oc() {
		return ls().memoizedState;
	}
	function sc(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = jd();
					e = vo(n);
					var r = yo(t, e, n);
					r !== null && (Pd(r, t, n), bo(r, t, n)), t = { cache: Pa() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function cc(e, t, n) {
		var r = jd();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, fc(e) ? pc(t, n) : (n = ki(e, t, n, r), n !== null && (Pd(n, e, r), mc(n, t, r)));
	}
	function lc(e, t, n) {
		uc(e, t, n, jd());
	}
	function uc(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (fc(e)) pc(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Gr(s, o)) return Oi(e, t, i, 0), $u === null && Di(), !1;
			} catch {}
			if (n = ki(e, t, i, r), n !== null) return Pd(n, e, r), mc(n, t, r), !0;
		}
		return !1;
	}
	function dc(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: Pf(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, fc(e)) {
			if (t) throw Error(i(479));
		} else t = ki(e, n, r, 2), t !== null && Pd(t, e, 2);
	}
	function fc(e) {
		var t = e.alternate;
		return e === B || t !== null && t === B;
	}
	function pc(e, t) {
		qo = Ko = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function mc(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Ct(e, n);
		}
	}
	var hc = {
		readContext: Da,
		use: fs,
		useCallback: $o,
		useContext: $o,
		useEffect: $o,
		useImperativeHandle: $o,
		useLayoutEffect: $o,
		useInsertionEffect: $o,
		useMemo: $o,
		useReducer: $o,
		useRef: $o,
		useState: $o,
		useDebugValue: $o,
		useDeferredValue: $o,
		useTransition: $o,
		useSyncExternalStore: $o,
		useId: $o,
		useHostTransitionStatus: $o,
		useFormState: $o,
		useActionState: $o,
		useOptimistic: $o,
		useMemoCache: $o,
		useCacheRefresh: $o,
		useEffectEvent: $o
	}, gc = {
		readContext: Da,
		use: fs,
		useCallback: function(e, t) {
			return cs().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Da,
		useEffect: Hs,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), Bs(4194308, 4, Js.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return Bs(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			Bs(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = cs();
			t = t === void 0 ? null : t;
			var r = e();
			if (Jo) {
				at(!0);
				try {
					e();
				} finally {
					at(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = cs();
			if (n !== void 0) {
				var i = n(t);
				if (Jo) {
					at(!0);
					try {
						n(t);
					} finally {
						at(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = cc.bind(null, B, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = cs();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = ws(e);
			var t = e.queue, n = lc.bind(null, B, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: V,
		useDeferredValue: function(e, t) {
			return Qs(cs(), e, t);
		},
		useTransition: function() {
			var e = ws(!1);
			return e = ec.bind(null, B, e.queue, !0, !1), cs().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = B, a = cs();
			if (R) {
				if (n === void 0) throw Error(i(407));
				n = n();
			} else {
				if (n = t(), $u === null) throw Error(i(349));
				Y & 127 || ys(r, t, n);
			}
			a.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return a.queue = o, Hs(xs.bind(null, r, o, e), [e]), r.flags |= 2048, Rs(9, { destroy: void 0 }, bs.bind(null, r, o, n, t), null), n;
		},
		useId: function() {
			var e = cs(), t = $u.identifierPrefix;
			if (R) {
				var n = ea, r = $i;
				n = (r & ~(1 << 32 - ot(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Yo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = Qo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: ic,
		useFormState: Ns,
		useActionState: Ns,
		useOptimistic: function(e) {
			var t = cs();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = dc.bind(null, B, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: ps,
		useCacheRefresh: function() {
			return cs().memoizedState = sc.bind(null, B);
		},
		useEffectEvent: function(e) {
			var t = cs(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (q & 2) throw Error(i(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, _c = {
		readContext: Da,
		use: fs,
		useCallback: Xs,
		useContext: Da,
		useEffect: Us,
		useImperativeHandle: Ys,
		useInsertionEffect: Ks,
		useLayoutEffect: qs,
		useMemo: Zs,
		useReducer: hs,
		useRef: zs,
		useState: function() {
			return hs(ms);
		},
		useDebugValue: V,
		useDeferredValue: function(e, t) {
			return $s(ls(), Wo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = hs(ms)[0], t = ls().memoizedState;
			return [typeof e == "boolean" ? e : ds(e), t];
		},
		useSyncExternalStore: vs,
		useId: ac,
		useHostTransitionStatus: ic,
		useFormState: Ps,
		useActionState: Ps,
		useOptimistic: function(e, t) {
			return Ts(ls(), Wo, e, t);
		},
		useMemoCache: ps,
		useCacheRefresh: oc,
		useEffectEvent: Gs
	}, vc = {
		readContext: Da,
		use: fs,
		useCallback: Xs,
		useContext: Da,
		useEffect: Us,
		useImperativeHandle: Ys,
		useInsertionEffect: Ks,
		useLayoutEffect: qs,
		useMemo: Zs,
		useReducer: _s,
		useRef: zs,
		useState: function() {
			return _s(ms);
		},
		useDebugValue: V,
		useDeferredValue: function(e, t) {
			var n = ls();
			return Wo === null ? Qs(n, e, t) : $s(n, Wo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = _s(ms)[0], t = ls().memoizedState;
			return [typeof e == "boolean" ? e : ds(e), t];
		},
		useSyncExternalStore: vs,
		useId: ac,
		useHostTransitionStatus: ic,
		useFormState: Ls,
		useActionState: Ls,
		useOptimistic: function(e, t) {
			var n = ls();
			return Wo === null ? (n.baseState = e, [e, n.queue.dispatch]) : Ts(n, Wo, e, t);
		},
		useMemoCache: ps,
		useCacheRefresh: oc,
		useEffectEvent: Gs
	};
	function yc(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : D({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var bc = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = jd(), i = vo(r);
			i.payload = t, n != null && (i.callback = n), t = yo(e, i, r), t !== null && (Pd(t, e, r), bo(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = jd(), i = vo(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = yo(e, i, r), t !== null && (Pd(t, e, r), bo(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = jd(), r = vo(n);
			r.tag = 2, t != null && (r.callback = t), t = yo(e, r, n), t !== null && (Pd(t, e, n), bo(t, e, n));
		}
	};
	function xc(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Kr(n, r) || !Kr(i, a) : !0;
	}
	function Sc(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && bc.enqueueReplaceState(t, t.state, null);
	}
	function Cc(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = D({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function wc(e) {
		Ci(e);
	}
	function Tc(e) {
		console.error(e);
	}
	function Ec(e) {
		Ci(e);
	}
	function Dc(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Oc(e, t, n) {
		try {
			var r = e.onCaughtError;
			r(n.value, {
				componentStack: n.stack,
				errorBoundary: t.tag === 1 ? t.stateNode : null
			});
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function kc(e, t, n) {
		return n = vo(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Dc(e, t);
		}, n;
	}
	function Ac(e) {
		return e = vo(e), e.tag = 3, e;
	}
	function jc(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Oc(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Oc(t, n, r), typeof i != "function" && (vd === null ? vd = /* @__PURE__ */ new Set([this]) : vd.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Mc(e, t, n, r, a) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && wa(t, n, a, !0), n = Mo.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13:
					case 19: return No === null ? Kd() : n.alternate === null && ad === 0 && (ad = 3), n.flags &= -257, n.flags |= 65536, n.lanes = a, r === $a ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), mf(e, r, a)), !1;
					case 22: return n.flags |= 65536, r === $a ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), mf(e, r, a)), !1;
				}
				throw Error(i(435, n.tag));
			}
			return mf(e, r, a), Kd(), !1;
		}
		if (R) return t = Mo.current, t === null ? (r !== la && (t = Error(i(423), { cause: r }), ga(Gi(t, n))), e = e.current.alternate, e.flags |= 65536, a &= -a, e.lanes |= a, r = Gi(r, n), a = kc(e.stateNode, r, a), xo(e, a), ad !== 4 && (ad = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = a, r !== la && (e = Error(i(422), { cause: r }), ga(Gi(e, n)))), !1;
		var o = Error(i(520), { cause: r });
		if (o = Gi(o, n), dd === null ? dd = [o] : dd.push(o), ad !== 4 && (ad = 2), t === null) return !0;
		r = Gi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = a & -a, n.lanes |= e, e = kc(n.stateNode, r, e), xo(n, e), !1;
				case 1:
					if (t = n.type, o = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (vd === null || !vd.has(o)))) return n.flags |= 65536, a &= -a, n.lanes |= a, a = Ac(a), jc(a, e, n, r), xo(n, a), !1;
					break;
				case 22: if (n.memoizedState !== null) return n.flags |= 65536, !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Nc = Error(i(461)), Pc = !1;
	function Fc(e, t, n, r) {
		t.child = e === null ? mo(t, null, n, r) : po(t, e.child, n, r);
	}
	function Ic(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Ea(t), r = ts(e, t, n, o, a, i), s = as(), e !== null && !Pc ? (os(e, t, i), sl(e, t, i)) : (R && s && na(t), t.flags |= 1, Fc(e, t, r, i), t.child);
	}
	function Lc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Ii(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, U(e, t, a, r, i)) : (e = zi(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !cl(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Kr : n, n(o, r) && e.ref === t.ref) return sl(e, t, i);
		}
		return t.flags |= 1, e = Li(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function U(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Kr(a, r) && e.ref === t.ref) {
				if (Pc = !1, t.pendingProps = r = a, cl(e, i)) e.flags & 131072 && (Pc = !0);
				else return t.lanes = e.lanes, sl(e, t, i);
			}
		}
		return Wc(e, t, n, r, i);
	}
	function Rc(e, t, n, r) {
		var i = r.children, a = e === null ? null : e.memoizedState;
		if (e === null && t.stateNode === null && (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), r.mode === "hidden") {
			if (t.flags & 128) {
				if (a = a === null ? n : a.baseLanes | n, e !== null) {
					for (r = t.child = e.child, i = 0; r !== null;) i = i | r.lanes | r.childLanes, r = r.sibling;
					r = i & ~a;
				} else r = 0, t.child = null;
				return zc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Ya(t, a === null ? null : a.cachePool), a === null ? Ao() : ko(t, a), Io(t);
			else return r = t.lanes = 536870912, zc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Ya(t, null), Ao(), Lo()) : (Ya(t, a.cachePool), ko(t, a), Lo(), t.memoizedState = null);
		return Fc(e, t, i, n), t.child;
	}
	function W(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function zc(e, t, n, r, i) {
		var a = Ja();
		return a = a === null ? null : {
			parent: Na._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Ya(t, null), Ao(), Io(t), e !== null && wa(e, t, r, !0), t.childLanes = i, null;
	}
	function Bc(e, t) {
		return t = $c({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Vc(e, t, n) {
		return po(t, e.child, null, n), e = Bc(t, t.pendingProps), e.flags |= 2, Ro(t), t.memoizedState = null, e;
	}
	function Hc(e, t, n) {
		var r = t.pendingProps, a = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (R) {
				if (r.mode === "hidden") return e = Bc(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, W(null, e);
				if (Fo(t), (e = oa) ? (e = om(e, ca), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Qi === null ? null : {
						id: $i,
						overflow: ea
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Hi(e), n.return = t, t.child = n, aa = t, oa = null)) : e = null, e === null) throw ua(t);
				return t.lanes = 536870912, null;
			}
			return Bc(t, r);
		}
		var o = e.memoizedState;
		if (o !== null) {
			var s = o.dehydrated;
			if (Fo(t), a) {
				if (t.flags & 256) t.flags &= -257, t = Vc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(i(558));
			} else if (Pc || wa(e, t, n, !1), a = (n & e.childLanes) !== 0, Pc || a) {
				if (Do.current === null) {
					if (r = $u, r !== null && (s = wt(r, n), s !== 0 && s !== o.retryLane)) throw o.retryLane = s, Ai(e, s), Pd(r, e, s), Nc;
					Kd();
				}
				t = Vc(e, t, n);
			} else e = o.treeContext, oa = um(s.nextSibling), aa = t, R = !0, sa = null, ca = !1, e !== null && ia(t, e), t = Bc(t, r), t.flags |= 134221824;
			return t;
		}
		return e = Li(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function Uc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(i(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function Wc(e, t, n, r, i) {
		return Ea(t), n = ts(e, t, n, r, void 0, i), r = as(), e !== null && !Pc ? (os(e, t, i), sl(e, t, i)) : (R && r && na(t), t.flags |= 1, Fc(e, t, n, i), t.child);
	}
	function Gc(e, t, n, r, i, a) {
		return Ea(t), t.updateQueue = null, n = rs(t, r, n, i), ns(e), r = as(), e !== null && !Pc ? (os(e, t, a), sl(e, t, a)) : (R && r && na(t), t.flags |= 1, Fc(e, t, n, a), t.child);
	}
	function Kc(e, t, n, r, i) {
		if (Ea(t), t.stateNode === null) {
			var a = Ni, o = n.contextType;
			typeof o == "object" && o && (a = Da(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = bc, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, go(t), o = n.contextType, a.context = typeof o == "object" && o ? Da(o) : Ni, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (yc(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && bc.enqueueReplaceState(a, a.state, null), wo(t, r, a, i), Co(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Cc(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = Ni, typeof u == "object" && u && (o = Da(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && Sc(t, a, r, o), ho = !1;
			var f = t.memoizedState;
			a.state = f, wo(t, r, a, i), Co(), l = t.memoizedState, s || f !== l || ho ? (typeof d == "function" && (yc(t, n, d, r), l = t.memoizedState), (c = ho || xc(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, _o(e, t), o = t.memoizedProps, u = Cc(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = Ni, typeof l == "object" && l && (c = Da(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && Sc(t, a, r, c), ho = !1, f = t.memoizedState, a.state = f, wo(t, r, a, i), Co();
			var p = t.memoizedState;
			o !== d || f !== p || ho || e !== null && e.dependencies !== null && Ta(e.dependencies) ? (typeof s == "function" && (yc(t, n, s, r), p = t.memoizedState), (u = ho || xc(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Ta(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, Uc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = po(t, e.child, null, i), t.child = po(t, null, n, i)) : Fc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = sl(e, t, i), e;
	}
	function qc(e, t, n, r) {
		return ma(), t.flags |= 256, Fc(e, t, n, r), t.child;
	}
	var Jc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Yc(e) {
		return {
			baseLanes: e,
			cachePool: z()
		};
	}
	function Xc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ld), e;
	}
	function Zc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(zo.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (R) {
				if (i ? Po(t) : Lo(), (e = oa) ? (e = om(e, ca), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Qi === null ? null : {
						id: $i,
						overflow: ea
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Hi(e), n.return = t, t.child = n, aa = t, oa = null)) : e = null, e === null) throw ua(t);
				return t.lanes = cm(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (Lo(), i = t.mode, a = $c({
				mode: "hidden",
				children: a
			}, i), r = Bi(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = Yc(n), r.childLanes = Xc(e, o, n), t.memoizedState = Jc, W(null, r)) : (Po(t), Qc(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return tl(e, t, a, o, r, c, s, n);
		}
		return i ? (Lo(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = Li(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = Bi(i, a, n, null), i.flags |= 2) : i = Li(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, W(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = Yc(n) : (a = i.cachePool, a === null ? a = z() : (s = Na._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = Xc(e, o, n), t.memoizedState = Jc, W(e.child, r)) : (Po(t), n = e.child, e = n.sibling, n = Li(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function Qc(e, t) {
		return t = $c({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function $c(e, t) {
		return e = Fi(22, e, null, t), e.lanes = 0, e;
	}
	function el(e, t, n) {
		return po(t, e.child, null, n), e = Qc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function tl(e, t, n, r, a, o, s, c) {
		if (n) return t.flags & 256 ? (Po(t), t.flags &= -257, el(e, t, c)) : t.memoizedState === null ? (Lo(), o = a.fallback, s = t.mode, a = $c({
			mode: "visible",
			children: a.children
		}, s), o = Bi(o, s, c, null), o.flags |= 2, a.return = t, o.return = t, a.sibling = o, t.child = a, po(t, e.child, null, c), a = t.child, a.memoizedState = Yc(c), a.childLanes = Xc(e, r, c), t.memoizedState = Jc, W(null, a)) : (Lo(), t.child = e.child, t.flags |= 128, null);
		if (Po(t), cm(o)) {
			if (r = o.nextSibling && o.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (a = Error(i(419)), a.stack = "", a.digest = r, ga({
				value: a,
				source: null,
				stack: null
			})), el(e, t, c);
		}
		if (Pc || wa(e, t, c, !1), r = (c & e.childLanes) !== 0, Pc || r) {
			if (Do.current !== null) return el(e, t, c);
			if (r = $u, r !== null && (a = wt(r, c), a !== 0 && a !== s.retryLane)) throw s.retryLane = a, Ai(e, a), Pd(r, e, a), Nc;
			return sm(o) || Kd(), el(e, t, c);
		}
		return sm(o) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, oa = um(o.nextSibling), aa = t, R = !0, sa = null, ca = !1, e !== null && ia(t, e), t = Qc(t, a.children), t.flags |= 134221824, t);
	}
	function nl(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Sa(e.return, t, n);
	}
	function rl(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && Ho(n) === null && (t = e), e = e.sibling;
		}
		return t;
	}
	function G(e, t, n, r, i, a) {
		var o = e.memoizedState;
		o === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i,
			treeForkCount: a
		} : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i, o.treeForkCount = a);
	}
	function il(e) {
		var t = e.child;
		for (e.child = null; t !== null;) {
			var n = t.sibling;
			t.sibling = e.child, e.child = t, t = n;
		}
	}
	function al(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = zo.current;
		if (t.flags & 128) return Bo(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, Bo(t, o), i === "backwards" && e !== null ? (il(e), Fc(e, t, r, n), il(e)) : Fc(e, t, r, n), r = R ? Yi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && nl(e, n, t);
			else if (e.tag === 19) nl(e, n, t);
			else if (e.child !== null) {
				e.child.return = e, e = e.child;
				continue;
			}
			if (e === t) break a;
			for (; e.sibling === null;) {
				if (e.return === null || e.return === t) break a;
				e = e.return;
			}
			e.sibling.return = e.return, e = e.sibling;
		}
		switch (i) {
			case "backwards":
				n = rl(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null, il(t)), G(t, !0, i, null, a, r);
				break;
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && Ho(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				G(t, !0, n, null, a, r);
				break;
			case "together":
				G(t, !1, null, null, void 0, r);
				break;
			case "independent":
				t.memoizedState = null;
				break;
			default: n = rl(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), G(t, !1, i, n, a, r);
		}
		return t.child;
	}
	function ol(e, t, n) {
		var r = t.pendingProps;
		return ba(t, t.type, r.value), Fc(e, t, r.children, n), t.child;
	}
	function sl(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), od |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (wa(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(i(153));
		if (t.child !== null) {
			for (e = t.child, n = Li(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Li(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function cl(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && Ta(e)));
	}
	function ll(e, t, n) {
		switch (t.tag) {
			case 3:
				Me(t, t.stateNode.containerInfo), ba(t, Na, e.memoizedState.cache), ma();
				break;
			case 27:
			case 5:
				Pe(t);
				break;
			case 4:
				Me(t, t.stateNode.containerInfo);
				break;
			case 10:
				ba(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, Fo(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) {
					if (r.dehydrated !== null) return Po(t), t.flags |= 128, null;
					r = wa(e, t, n, !1);
					var i = t.child.childLanes;
					return r || (n & i) !== 0 ? Zc(e, t, n) : (Po(t), e = sl(e, t, n), e === null ? null : e.sibling);
				}
				Po(t);
				break;
			case 19:
				if (t.flags & 128) return al(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (wa(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return al(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Bo(t, zo.current), r) break;
				return null;
			case 22: return t.lanes = 0, Rc(e, t, n, t.pendingProps);
			case 24: ba(t, Na, e.memoizedState.cache);
		}
		return sl(e, t, n);
	}
	function ul(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) Pc = !0;
			else {
				if (!cl(e, n) && !(t.flags & 128)) return Pc = !1, ll(e, t, n);
				Pc = !!(e.flags & 131072);
			}
		} else Pc = !1, R && t.flags & 1048576 && ta(t, Yi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = no(t.elementType), t.type = e, typeof e == "function") Ii(e) ? (r = Cc(e, r), t.tag = 1, t = Kc(null, t, e, r, n)) : (t.tag = 0, t = Wc(null, t, e, r, n));
					else {
						if (e != null) {
							var a = e.$$typeof;
							if (a === se) {
								t.tag = 11, t = Ic(null, t, e, r, n);
								break a;
							}
							if (a === ue) {
								t.tag = 14, t = Lc(null, t, e, r, n);
								break a;
							}
							if (a === oe) {
								t.tag = 10, t.type = e, t = ol(null, t, n);
								break a;
							}
						}
						throw t = be(e) || e, Error(i(306, t, ""));
					}
				}
				return t;
			case 0: return Wc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, a = Cc(r, t.pendingProps), Kc(e, t, r, a, n);
			case 3:
				a: {
					if (Me(t, t.stateNode.containerInfo), e === null) throw Error(i(387));
					r = t.pendingProps;
					var o = t.memoizedState;
					a = o.element, _o(e, t), wo(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, ba(t, Na, r), r !== o.cache && Ca(t, [Na], n, !0), Co(), r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							t = qc(e, t, r, n);
							break a;
						}
						if (r !== a) {
							a = Gi(Error(i(424)), t), ga(a), t = qc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (oa = um(e.firstChild), aa = t, R = !0, sa = null, ca = !0, n = mo(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (ma(), r === a) {
							t = sl(e, t, n);
							break a;
						}
						Fc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return Uc(e, t), e === null ? (n = Pm(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : R || (t.stateNode = pp(t.type, t.pendingProps, Ae.current, t)) : t.memoizedState = Pm(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return Pe(t), e === null && R && (r = t.stateNode = gm(t.type, t.pendingProps, Ae.current), aa = t, ca = !0, a = oa, Cp(t.type) ? (dm = a, oa = um(r.firstChild)) : oa = a), Fc(e, t, t.pendingProps.children, n), Uc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && R && ((a = r = oa) && (r = im(r, t.type, t.pendingProps, ca), r === null ? a = !1 : (t.stateNode = r, aa = t, oa = um(r.firstChild), ca = !1, a = !0)), a || ua(t)), Pe(t), a = t.type, o = t.pendingProps, s = e === null ? null : e.memoizedProps, r = o.children, mp(a, o) ? r = null : s !== null && mp(a, s) && (t.flags |= 32), t.memoizedState !== null && (a = ts(e, t, is, null, null, n), ch._currentValue = a), Uc(e, t), Fc(e, t, r, n), t.child;
			case 6: return e === null && R && ((e = n = oa) && (n = am(n, t.pendingProps, ca), n === null ? e = !1 : (t.stateNode = n, aa = t, oa = null, e = !0)), e || ua(t)), null;
			case 13: return Zc(e, t, n);
			case 4: return Me(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = po(t, null, r, n) : Fc(e, t, r, n), t.child;
			case 11: return Ic(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, Uc(e, t), Fc(e, t, r, n), t.child;
			case 8: return Fc(e, t, t.pendingProps.children, n), t.child;
			case 12: return Fc(e, t, t.pendingProps.children, n), t.child;
			case 10: return ol(e, t, n);
			case 9: return a = t.type._context, r = t.pendingProps.children, Ea(t), a = Da(a), r = r(a), t.flags |= 1, Fc(e, t, r, n), t.child;
			case 14: return Lc(e, t, t.type, t.pendingProps, n);
			case 15: return U(e, t, t.type, t.pendingProps, n);
			case 19: return al(e, t, n);
			case 31: return Hc(e, t, n);
			case 22: return Rc(e, t, n, t.pendingProps);
			case 24: return Ea(t), r = Da(Na), e === null ? (a = Ja(), a === null && (a = $u, o = Pa(), a.pooledCache = o, o.refCount++, o !== null && (a.pooledCacheLanes |= n), a = o), t.memoizedState = {
				parent: r,
				cache: a
			}, go(t), ba(t, Na, a)) : ((e.lanes & n) !== 0 && (_o(e, t), wo(t, null, null, n), Co()), a = e.memoizedState, o = t.memoizedState, a.parent === r ? (r = o.cache, ba(t, Na, r), r !== a.cache && Ca(t, [Na], n, !0)) : (a = {
				parent: r,
				cache: r
			}, t.memoizedState = a, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = a), ba(t, Na, r))), Fc(e, t, t.pendingProps.children, n), t.child;
			case 30: return t.stateNode === null && (t.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : R && na(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : Uc(e, t), Fc(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(i(156, t.tag));
	}
	function dl(e) {
		e.flags |= 4;
	}
	function fl(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Ym(t, r) : Ym(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Ud()) e.flags |= 8192;
				else throw ro = $a, Za;
			}
		} else e.flags &= -16777217;
	}
	function pl(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Xm(t)) {
			if (Ud()) e.flags |= 8192;
			else throw ro = $a, Za;
		}
	}
	function ml(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : vt(), e.lanes |= t, ud |= t);
	}
	function hl(e, t) {
		if (!R) switch (e.tailMode) {
			case "visible": break;
			case "collapsed":
				for (var n = e.tail, r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
				break;
			default:
				for (t = e.tail, n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
		}
	}
	function gl(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function _l(e, t, n) {
		var r = t.pendingProps;
		switch (ra(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return gl(t), null;
			case 1: return gl(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), xa(Na), Ne(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (pa(t) ? dl(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, ha())), gl(t), null;
			case 26:
				var a = t.type, o = t.memoizedState;
				return e === null ? (dl(t), o === null ? (gl(t), fl(t, a, null, r, n)) : (gl(t), pl(t, o))) : o ? o === e.memoizedState ? (gl(t), t.flags &= -16777217) : (dl(t), gl(t), pl(t, o)) : (e = e.memoizedProps, e !== r && dl(t), gl(t), fl(t, a, e, r, n)), null;
			case 27:
				if (Fe(t), n = Ae.current, a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && dl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return gl(t), t.subtreeFlags &= -33554433, null;
					}
					e = Oe.current, pa(t) ? da(t, e) : (e = gm(a, r, n), t.stateNode = e, dl(t));
				}
				return gl(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (Fe(t), a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && dl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return gl(t), t.subtreeFlags &= -33554433, null;
					}
					if (o = Oe.current, pa(t)) da(t, o);
					else {
						var s = up(Ae.current);
						switch (o) {
							case 1:
								o = s.createElementNS("http://www.w3.org/2000/svg", a);
								break;
							case 2:
								o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
								break;
							default: switch (a) {
								case "svg":
									o = s.createElementNS("http://www.w3.org/2000/svg", a);
									break;
								case "math":
									o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
									break;
								case "script":
									o = s.createElement("div"), o.innerHTML = "<script><\/script>", o = o.removeChild(o.firstChild);
									break;
								case "select":
									o = typeof r.is == "string" ? s.createElement("select", { is: r.is }) : s.createElement("select"), r.multiple ? o.multiple = !0 : r.size && (o.size = r.size);
									break;
								default: o = typeof r.is == "string" ? s.createElement(a, { is: r.is }) : s.createElement(a);
							}
						}
						o[At] = t, o[jt] = r;
						a: for (s = t.child; s !== null;) {
							if (s.tag === 5 || s.tag === 6) o.appendChild(s.stateNode);
							else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
								s.child.return = s, s = s.child;
								continue;
							}
							if (s === t) break a;
							for (; s.sibling === null;) {
								if (s.return === null || s.return === t) break a;
								s = s.return;
							}
							s.sibling.return = s.return, s = s.sibling;
						}
						t.stateNode = o;
						a: switch (rp(o, a, r), a) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								r = !!r.autoFocus;
								break a;
							case "img":
								r = !0;
								break a;
							default: r = !1;
						}
						r && dl(t);
					}
				}
				return gl(t), t.subtreeFlags &= -33554433, fl(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && dl(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(i(166));
					if (e = Ae.current, pa(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, a = aa, a !== null) switch (a.tag) {
							case 27:
							case 5: r = a.memoizedProps;
						}
						e[At] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || ep(e.nodeValue, n)), e || ua(t, !0);
					} else e = up(e).createTextNode(r), e[At] = t, t.stateNode = e;
				}
				return gl(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = pa(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(i(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(557));
							e[At] = t;
						} else ma(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						gl(t), e = !1;
					} else n = ha(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (Ro(t), t) : (Ro(t), null);
					if (t.flags & 128) throw Error(i(558));
				}
				return gl(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (a = pa(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!a) throw Error(i(318));
							if (a = t.memoizedState, a = a === null ? null : a.dehydrated, !a) throw Error(i(317));
							a[At] = t;
						} else ma(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						gl(t), a = !1;
					} else a = ha(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), a = !0;
					if (!a) return t.flags & 256 ? (Ro(t), t) : (Ro(t), null);
				}
				return Ro(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, a = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (a = r.alternate.memoizedState.cachePool.pool), o = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== a && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), ml(t, t.updateQueue), gl(t), null);
			case 4: return Ne(), e === null && Wf(t.stateNode.containerInfo), t.flags |= 67108864, gl(t), null;
			case 10: return xa(t.type), gl(t), null;
			case 19:
				if (Vo(t), r = t.memoizedState, r === null) return gl(t), null;
				if (a = !!(t.flags & 128), o = r.rendering, o === null) {
					if (a) hl(r, !1);
					else {
						if (ad !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (o = Ho(e), o !== null) {
								for (t.flags |= 128, hl(r, !1), e = o.updateQueue, t.updateQueue = e, ml(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) Ri(n, e), n = n.sibling;
								return Bo(t, zo.current & 1 | 2), R && L(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Je() > gd && (t.flags |= 128, a = !0, hl(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!a) {
						if (e = Ho(o), e !== null) {
							if (t.flags |= 128, a = !0, e = e.updateQueue, t.updateQueue = e, ml(t, e), hl(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !o.alternate && !R) return gl(t), null;
						} else 2 * Je() - r.renderingStartTime > gd && n !== 536870912 && (t.flags |= 128, a = !0, hl(r, !1), t.lanes = 4194304);
					}
					r.isBackwards ? (o.sibling = t.child, t.child = o) : (e = r.last, e === null ? t.child = o : e.sibling = o, r.last = o);
				}
				if (r.tail !== null) {
					e = r.tail;
					a: {
						for (n = e; n !== null;) {
							if (n.alternate !== null) {
								n = !1;
								break a;
							}
							n = n.sibling;
						}
						n = !0;
					}
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Je(), e.sibling = null, o = zo.current, o = a ? o & 1 | 2 : o & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || R ? Bo(t, o) : (n = o, De(Mo, t), De(zo, n), No === null && (No = t)), R && L(t, r.treeForkCount), e;
				}
				return gl(t), null;
			case 22:
			case 23: return Ro(t), jo(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (gl(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : gl(t), n = t.updateQueue, n !== null && ml(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && Ee(qa), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), xa(Na), gl(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, gl(t), null;
		}
		throw Error(i(156, t.tag));
	}
	function vl(e, t) {
		switch (ra(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return xa(Na), Ne(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return Fe(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (Ro(t), t.alternate === null) throw Error(i(340));
					ma();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (Ro(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(i(340));
					ma();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return Vo(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
			case 4: return Ne(), null;
			case 10: return xa(t.type), null;
			case 22:
			case 23: return Ro(t), jo(), e !== null && Ee(qa), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return xa(Na), null;
			case 25: return null;
			default: return null;
		}
	}
	function yl(e, t) {
		switch (ra(t), t.tag) {
			case 3:
				xa(Na), Ne();
				break;
			case 26:
			case 27:
			case 5:
				Fe(t);
				break;
			case 4:
				Ne();
				break;
			case 31:
				t.memoizedState !== null && Ro(t);
				break;
			case 13:
				Ro(t);
				break;
			case 19:
				Vo(t);
				break;
			case 10:
				xa(t.type);
				break;
			case 22:
			case 23:
				Ro(t), jo(), e !== null && Ee(qa);
				break;
			case 24: xa(Na);
		}
	}
	function bl(e, t) {
		try {
			var n = t.updateQueue, r = n === null ? null : n.lastEffect;
			if (r !== null) {
				var i = r.next;
				n = i;
				do {
					if ((n.tag & e) === e) {
						r = void 0;
						var a = n.create, o = n.inst;
						r = a(), o.destroy = r;
					}
					n = n.next;
				} while (n !== i);
			}
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function xl(e, t, n) {
		try {
			var r = t.updateQueue, i = r === null ? null : r.lastEffect;
			if (i !== null) {
				var a = i.next;
				r = a;
				do {
					if ((r.tag & e) === e) {
						var o = r.inst, s = o.destroy;
						if (s !== void 0) {
							o.destroy = void 0, i = t;
							var c = n, l = s;
							try {
								l();
							} catch (e) {
								Z(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Sl(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Eo(t, n);
			} catch (t) {
				Z(e, e.return, t);
			}
		}
	}
	function Cl(e, t, n) {
		n.props = Cc(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Z(e, t, n);
		}
	}
	function wl(e, t) {
		try {
			var n = e.ref;
			if (n !== null) {
				switch (e.tag) {
					case 26:
					case 27:
					case 5:
						var r = e.stateNode;
						break;
					case 30:
						var i = e.stateNode, a = bi(e.memoizedProps, i);
						(i.ref === null || i.ref.name !== a) && (i.ref = Fp(a)), r = i.ref;
						break;
					case 7:
						if (e.stateNode === null) {
							var o = new Ip(e);
							m(e.child, !1, $p, o, void 0, void 0), e.stateNode = o;
						}
						r = e.stateNode;
						break;
					default: r = e.stateNode;
				}
				typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
			}
		} catch (n) {
			Z(e, t, n);
		}
	}
	function Tl(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				Z(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				Z(e, t, n);
			}
			else n.current = null;
		}
	}
	function El(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) tm(e.stateNode, t[n]);
	}
	function Dl(e) {
		for (var t = e.return; t !== null && (Al(t) && tm(e.stateNode, t.stateNode), !kl(t));) t = t.return;
	}
	function Ol(e) {
		for (var t = e.return; t !== null && (Al(t) && nm(e.stateNode, t.stateNode), !kl(t));) t = t.return;
	}
	function kl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 27;
	}
	function Al(e) {
		return e && e.tag === 7 && e.stateNode !== null;
	}
	function jl(e) {
		var t = e.type, n = e.memoizedProps, r = e.stateNode;
		try {
			a: switch (t) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					n.autoFocus && r.focus();
					break a;
				case "img": n.src ? r.src = n.src : n.srcSet && (r.srcset = n.srcSet);
			}
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Ml(e, t, n) {
		try {
			var r = e.stateNode;
			ap(r, e.type, n, t), r[jt] = t;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Nl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Cp(e.type) || e.tag === 4;
	}
	function Pl(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Nl(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Cp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Fl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Tn)), El(e, r), M = !0;
		else if (i !== 4 && (i === 27 && (El(e, r), r = null, Cp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (Fl(e, t, n, r), e = e.sibling; e !== null;) Fl(e, t, n, r), e = e.sibling;
	}
	function Il(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), El(e, r), M = !0;
		else if (i !== 4 && (i === 27 && (El(e, r), r = null, Cp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Il(e, t, n, r), e = e.sibling; e !== null;) Il(e, t, n, r), e = e.sibling;
	}
	function Ll(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			rp(t, r, n), t[At] = e, t[jt] = n;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	var Rl = !1, zl = null;
	function Bl(e) {
		(e.tag === 30 || e.subtreeFlags & 33554432) && (Rl = !0);
	}
	var Vl = null;
	function Hl() {
		var e = Vl;
		return Vl = null, e;
	}
	var Ul = 0;
	function Wl(e, t, n, r, i) {
		return Ul = 0, Gl(e.child, t, n, r, i);
	}
	function Gl(e, t, n, r, i) {
		for (var a = !1; e !== null;) {
			if (e.tag === 5) {
				var o = e.stateNode;
				if (r !== null) {
					var s = kp(o);
					r.push(s), s.view && (a = !0);
				} else a || kp(o).view && (a = !0);
				Rl = !0, Ep(o, Ul === 0 ? t : t + "_" + Ul, n), Ul++;
			} else (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && i || Gl(e.child, t, n, r, i) && (a = !0));
			e = e.sibling;
		}
		return a;
	}
	function Kl(e, t) {
		for (; e !== null;) e.tag === 5 ? Dp(e.stateNode, e.memoizedProps) : (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && t || Kl(e.child, t)), e = e.sibling;
	}
	function ql(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (ql(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(i(544));
				var n = t.name;
				t = Si(t.default, t.share), t !== "none" && (Wl(e, n, t, null, !1) || Kl(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function Jl(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = bi(r, n), a = Si(r.default, n.paired ? r.share : r.enter);
			a === "none" ? ql(e) : Wl(e, i, a, null, !1) ? (ql(e), n.paired || t || Nd(e, r.onEnter)) : Kl(e.child, !1);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Jl(e, t), e = e.sibling;
		else ql(e);
	}
	function Yl(e) {
		if (zl !== null && zl.size !== 0) {
			var t = zl;
			if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
				if (e.tag !== 22 || e.memoizedState === null) {
					if (e.tag === 30 && e.flags & 18874368) {
						var n = e.memoizedProps, r = n.name;
						if (r != null && r !== "auto") {
							var i = t.get(r);
							if (i !== void 0) {
								var a = Si(n.default, n.share);
								if (a !== "none" && (Wl(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, Nd(e, n.onShare)) : Kl(e.child, !1)), t.delete(r), t.size === 0) break;
							}
						}
					}
					Yl(e);
				}
				e = e.sibling;
			}
		}
	}
	function Xl(e) {
		if (e.tag === 30) {
			var t = e.memoizedProps, n = bi(t, e.stateNode), r = zl === null ? void 0 : zl.get(n), i = Si(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Wl(e, n, i, null, !1) ? r === void 0 ? Nd(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, zl.delete(n), Nd(e, t.onShare)) : Kl(e.child, !1)), zl !== null && Yl(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Xl(e), e = e.sibling;
		else zl !== null && Yl(e);
	}
	function Zl(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = bi(t, e.stateNode);
				t = Si(t.default, t.update), e.flags &= -5, t !== "none" && Wl(e, n, t, e.memoizedState = [], !1);
			} else e.subtreeFlags & 33554432 && Zl(e);
			e = e.sibling;
		}
	}
	function Ql(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if (e.tag !== 22 || e.memoizedState === null) {
				if (e.tag === 30 && e.flags & 18874368) {
					var t = e.stateNode;
					t.paired !== null && (t.paired = null, Kl(e.child, !1));
				}
				Ql(e);
			}
			e = e.sibling;
		}
	}
	function $l(e) {
		if (e.tag === 30) e.stateNode.paired = null, Kl(e.child, !1), Ql(e);
		else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) $l(e), e = e.sibling;
		else Ql(e);
	}
	function eu(e) {
		for (e = e.child; e !== null;) e.tag === 30 ? Kl(e.child, !1) : e.subtreeFlags & 33554432 && eu(e), e = e.sibling;
	}
	function tu(e, t, n, r, i, a, o) {
		for (var s = !1; t !== null;) {
			if (t.tag === 5) {
				var c = t.stateNode;
				if (a !== null && Ul < a.length) {
					var l = a[Ul], u = kp(c);
					(l.view || u.view) && (s = !0);
					var d;
					if (d = !(e.flags & 4)) {
						if (u.clip) d = !0;
						else {
							d = l.rect;
							var f = u.rect;
							d = d.y !== f.y || d.x !== f.x || d.height !== f.height || d.width !== f.width;
						}
					}
					d && (e.flags |= 4), u.abs ? u = !l.abs : (l = l.rect, u = u.rect, u = l.height !== u.height || l.width !== u.width), u && (e.flags |= 32);
				} else e.flags |= 32;
				e.flags & 4 && Ep(c, Ul === 0 ? n : n + "_" + Ul, i), s && e.flags & 4 || (Vl === null && (Vl = []), Vl.push(c, Ul === 0 ? r : r + "_" + Ul, t.memoizedProps)), Ul++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : tu(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function nu(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = bi(n, r), a = Si(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(Ap);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				Ul = 0, i = tu(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || Nd(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && nu(e, t);
			e = e.sibling;
		}
	}
	var ru = !1, K = !1, iu = !1, au = !1, ou = typeof WeakSet == "function" ? WeakSet : Set, su = null, cu = !1, lu = !1, uu = !1, du = !1;
	function fu(e, t, n) {
		if (e = e.containerInfo, cp = _h, e = Zr(e), Qr(e)) {
			if ("selectionStart" in e) var r = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				r = (r = e.ownerDocument) && r.defaultView || window;
				var i = r.getSelection && r.getSelection();
				if (i && i.rangeCount !== 0) {
					r = i.anchorNode;
					var a = i.anchorOffset, o = i.focusNode;
					i = i.focusOffset;
					try {
						r.nodeType, o.nodeType;
					} catch {
						r = null;
						break a;
					}
					var s = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== r || a !== 0 && f.nodeType !== 3 || (c = s + a), f !== o || i !== 0 && f.nodeType !== 3 || (l = s + i), f.nodeType === 3 && (s += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === r && ++u === a && (c = s), p === o && ++d === i && (l = s), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					r = c === -1 || l === -1 ? null : {
						start: c,
						end: l
					};
				} else r = null;
			}
			r ||= {
				start: 0,
				end: 0
			};
		} else r = null;
		for (lp = {
			focusedElem: e,
			selectionRange: r
		}, _h = !1, n = (n & 335544064) === n, su = t, t = n ? 9270 : 1024; su !== null;) {
			if (e = su, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && Xl(r[a]);
			if (e.alternate === null && e.flags & 2) n && Bl(e), pu(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && Xl(r), pu(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && Bl(e), pu(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, su = r) : (n && Zl(e), pu(n));
			}
		}
		zl = null;
	}
	function pu(e) {
		for (; su !== null;) {
			var t = su, n = e, r = t.alternate, a = t.flags;
			switch (t.tag) {
				case 0:
				case 11:
				case 15: break;
				case 1:
					if (a & 1024 && r !== null) {
						n = void 0, a = r.memoizedProps, r = r.memoizedState;
						var o = t.stateNode;
						try {
							var s = Cc(t.type, a);
							n = o.getSnapshotBeforeUpdate(s, r), o.__reactInternalSnapshotBeforeUpdate = n;
						} catch (e) {
							Z(t, t.return, e);
						}
					}
					break;
				case 3:
					if (a & 1024) {
						if (r = t.stateNode.containerInfo, n = r.nodeType, n === 9) rm(r);
						else if (n === 1) switch (r.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								rm(r);
								break;
							default: r.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				case 30:
					n && r !== null && (n = bi(r.memoizedProps, r.stateNode), a = t.memoizedProps, a = Si(a.default, a.update), a !== "none" && Wl(r, n, a, r.memoizedState = [], !0));
					break;
				default: if (a & 1024) throw Error(i(163));
			}
			if (r = t.sibling, r !== null) {
				r.return = t.return, su = r;
				break;
			}
			su = t.return;
		}
	}
	function mu(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				Pu(e, n), r & 4 && bl(5, n);
				break;
			case 1:
				if (Pu(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						Z(n, n.return, e);
					}
					else {
						var i = Cc(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							Z(n, n.return, e);
						}
					}
				}
				r & 64 && Sl(n), r & 512 && wl(n, n.return);
				break;
			case 3:
				if (Pu(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						Eo(e, t);
					} catch (e) {
						Z(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Ll(n);
			case 26:
			case 5:
				Pu(e, n), t === null && r & 4 && jl(n), r & 512 && wl(n, n.return);
				break;
			case 12:
				Pu(e, n);
				break;
			case 31:
				Pu(e, n), r & 4 && Cu(e, n);
				break;
			case 13:
				Pu(e, n), r & 4 && wu(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = _f.bind(null, n), lm(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || ru, !r) {
					var a = t !== null && t.memoizedState !== null || K;
					t = ru, i = K, ru = r, (K = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), Iu(e, n, r)) : Pu(e, n), ru = t, K = i;
				}
				break;
			case 30:
				Pu(e, n), r & 512 && wl(n, n.return);
				break;
			case 7: r & 512 && wl(n, n.return);
			default: Pu(e, n);
		}
	}
	function hu(e, t) {
		for (e = e.child; e !== null;) gu(e, t), e = e.sibling;
	}
	function gu(e, t) {
		switch (e.tag) {
			case 5:
			case 26:
				try {
					var n = e.stateNode;
					if (t) {
						var r = n.style;
						typeof r.setProperty == "function" ? r.setProperty("display", "none", "important") : r.display = "none";
					} else {
						var i = e.stateNode, a = e.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null;
						i.style.display = o == null || typeof o == "boolean" ? "" : ("" + o).trim();
					}
				} catch (t) {
					Z(e, e.return, t);
				}
				_u(e, t);
				break;
			case 6:
				try {
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, M = !0;
				} catch (t) {
					Z(e, e.return, t);
				}
				break;
			case 18:
				try {
					var s = e.stateNode;
					t ? Tp(s, !0) : Tp(e.stateNode, !1);
				} catch (t) {
					Z(e, e.return, t);
				}
				break;
			case 22:
			case 23:
				e.memoizedState === null && hu(e, t);
				break;
			default: hu(e, t);
		}
	}
	function _u(e, t) {
		if (e.subtreeFlags & 67108864) for (e = e.child; e !== null;) {
			a: {
				var n = e, r = t;
				switch (n.tag) {
					case 4:
						gu(n, r);
						break a;
					case 22:
						n.memoizedState === null && _u(n, r);
						break a;
					default: _u(n, r);
				}
			}
			e = e.sibling;
		}
	}
	function vu(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, vu(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Rt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var yu = null, bu = !1;
	function xu(e, t, n) {
		for (n = n.child; n !== null;) Su(e, t, n), n = n.sibling;
	}
	function Su(e, t, n) {
		if (it && typeof it.onCommitFiberUnmount == "function") try {
			it.onCommitFiberUnmount(rt, n);
		} catch {}
		switch (n.tag) {
			case 26:
				K || Tl(n, t), xu(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !K && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				K || Tl(n, t), Ol(n);
				var r = yu, i = bu;
				Cp(n.type) && (yu = n.stateNode, bu = !1), xu(e, t, n), _m(n.stateNode, n.type, n.memoizedProps), yu = r, bu = i;
				break;
			case 5: K || Tl(n, t), Ol(n);
			case 6:
				if (n.tag === 6 && Ol(n), r = yu, i = bu, yu = null, xu(e, t, n), yu = r, bu = i, yu !== null) {
					if (bu) try {
						(yu.nodeType === 9 ? yu.body : yu.nodeName === "HTML" ? yu.ownerDocument.body : yu).removeChild(n.stateNode), M = !0;
					} catch (e) {
						Z(n, t, e);
					}
					else try {
						yu.removeChild(n.stateNode), M = !0;
					} catch (e) {
						Z(n, t, e);
					}
				}
				break;
			case 18:
				yu !== null && (bu ? (e = yu, wp(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Hh(e)) : wp(yu, n.stateNode));
				break;
			case 4:
				r = yu, i = bu, yu = n.stateNode.containerInfo, bu = !0, xu(e, t, n), yu = r, bu = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				xl(2, n, t), K || xl(4, n, t), xu(e, t, n);
				break;
			case 1:
				K || (Tl(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Cl(n, t, r)), xu(e, t, n);
				break;
			case 21:
				xu(e, t, n);
				break;
			case 22:
				K = (r = K) || n.memoizedState !== null, xu(e, t, n), K = r;
				break;
			case 30:
				Tl(n, t), xu(e, t, n);
				break;
			case 7:
				K || Tl(n, t), xu(e, t, n);
				break;
			default: xu(e, t, n);
		}
	}
	function Cu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Hh(e);
			} catch (e) {
				Z(t, t.return, e);
			}
		}
	}
	function wu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Hh(e);
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Tu(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new ou()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new ou()), t;
			default: throw Error(i(435, e.tag));
		}
	}
	function Eu(e, t) {
		var n = Tu(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = vf.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function Du(e, t, n) {
		var r = t.deletions;
		if (r !== null) for (var a = 0; a < r.length; a++) {
			var o = r[a], s = e, c = t, l = c;
			a: for (; l !== null;) {
				switch (l.tag) {
					case 27:
						if (Cp(l.type)) {
							yu = l.stateNode, bu = !1;
							break a;
						}
						break;
					case 5:
						yu = l.stateNode, bu = !1;
						break a;
					case 3:
					case 4:
						yu = l.stateNode.containerInfo, bu = !0;
						break a;
				}
				l = l.return;
			}
			if (yu === null) throw Error(i(160));
			Su(s, c, o), yu = null, bu = !1, s = o.alternate, s !== null && (s.return = null), o.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) ku(t, e, n), t = t.sibling;
	}
	var Ou = null;
	function ku(e, t, n) {
		var r = e.alternate, a = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (a & 4 && (r = e.updateQueue, r = r === null ? null : r.events, r !== null)) for (var o = 0; o < r.length; o++) {
					var s = r[o];
					s.ref.impl = s.nextImpl;
				}
				Du(t, e, n), Au(e), a & 4 && (xl(3, e, e.return), bl(3, e), xl(5, e, e.return));
				break;
			case 1:
				Du(t, e, n), Au(e), a & 512 && (K || r === null || Tl(r, r.return)), a & 64 && ru && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (o = Ou, Du(t, e, n), Au(e), a & 512 && (K || r === null || Tl(r, r.return)), a & 4) {
					if (a = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if (ru) e.stateNode = pp(e.type, e.memoizedProps, t.containerInfo, e);
								else {
									a: {
										t = e.type, n = e.memoizedProps, a = o.ownerDocument || o;
										b: switch (t) {
											case "title":
												r = a.getElementsByTagName("title")[0], (!r || r[It] || r[At] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = a.createElement(t), a.head.insertBefore(r, a.querySelector("head > title"))), rp(r, t, n), r[At] = e, Ut(r), t = r;
												break a;
											case "link":
												if (o = Km("link", "href", a).get(t + (n.href || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && r.getAttribute("rel") === (n.rel == null ? null : n.rel) && r.getAttribute("title") === (n.title == null ? null : n.title) && r.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), rp(r, t, n), a.head.appendChild(r);
												break;
											case "meta":
												if (o = Km("meta", "content", a).get(t + (n.content || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("content") === (n.content == null ? null : "" + n.content) && r.getAttribute("name") === (n.name == null ? null : n.name) && r.getAttribute("property") === (n.property == null ? null : n.property) && r.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && r.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), rp(r, t, n), a.head.appendChild(r);
												break;
											default: throw Error(i(468, t));
										}
										r[At] = e, Ut(r), t = r;
									}
									e.stateNode = t;
								}
							} else ru || qm(o, e.type, e.stateNode);
						} else e.stateNode = Vm(o, n, e.memoizedProps);
					} else a === n ? n === null && e.stateNode !== null && Ml(e, e.memoizedProps, r.memoizedProps) : (a === null ? (t = r.stateNode, t === null || K || t.parentNode.removeChild(t)) : a.count--, n === null ? ru || qm(o, e.type, e.stateNode) : Vm(o, n, e.memoizedProps));
				}
				break;
			case 27:
				Du(t, e, n), Au(e), a & 512 && (K || r === null || Tl(r, r.return)), r !== null && a & 4 && Ml(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (o = iu, iu = !1, Du(t, e, n), iu = o, Au(e), a & 512 && (K || r === null || Tl(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						_n(t, ""), M = !0;
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				a & 4 && e.stateNode != null && (t = e.memoizedProps, Ml(e, t, r === null ? t : r.memoizedProps)), a & 1024 && (au = !0);
				break;
			case 6:
				if (Du(t, e, n), Au(e), a & 4) {
					if (e.stateNode === null) throw Error(i(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, M = !0;
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				break;
			case 3:
				if (M = !1, Gm = null, o = Ou, Ou = xm(t.containerInfo), Du(t, e, n), Ou = o, Au(e), a & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Hh(t.containerInfo);
				} catch (t) {
					Z(e, e.return, t);
				}
				au && (au = !1, ju(e)), M = !1;
				break;
			case 4:
				a = iu, iu = ru, r = $t(), o = Ou, Ou = xm(e.stateNode.containerInfo), Du(t, e, n), Au(e), Ou = o, M && lu && (uu = !0), M = r, iu = a;
				break;
			case 12:
				Du(t, e, n), Au(e);
				break;
			case 31:
				Du(t, e, n), Au(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 13:
				Du(t, e, n), Au(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (md = Je()), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 22:
				o = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = ru, l = K, u = iu;
				ru = c || o, iu = u || o, K = l || s, Du(t, e, n), K = l, iu = u, ru = c, Au(e), a & 8192 && (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, !o || r === null || s || ru || K || (t = s || K, n = ru, r = K, ru = o || ru, K = t, Fu(e, 2), ru = n, K = r), !o && iu || hu(e, o)), a & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, Eu(e, n))));
				break;
			case 19:
				Du(t, e, n), Au(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 30:
				a & 512 && (K || r === null || Tl(r, r.return)), a = $t(), o = lu, s = (n & 335544064) === n, c = e.memoizedProps, lu = s && Si(c.default, c.update) !== "none", Du(t, e, n), Au(e), s && r !== null && M && (e.flags |= 4), lu = o, M = a;
				break;
			case 21: break;
			case 7: a & 512 && (K || r === null || Tl(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: Du(t, e, n), Au(e);
		}
	}
	function Au(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Nl(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				r = null;
				for (var a = e.return; a !== null;) {
					if (Al(a)) {
						var o = a.stateNode;
						r === null ? r = [o] : r.push(o);
					}
					if (kl(a)) break;
					a = a.return;
				}
				var s = r;
				if (n == null) throw Error(i(160));
				switch (n.tag) {
					case 27:
						var c = n.stateNode;
						Il(e, Pl(e), c, s);
						break;
					case 5:
						var l = n.stateNode;
						n.flags & 32 && (_n(l, ""), n.flags &= -33), Il(e, Pl(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						Fl(e, Pl(e), u, s);
						break;
					default: throw Error(i(161));
				}
			} catch (t) {
				Z(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function ju(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			ju(t), t.tag === 5 && t.flags & 1024 && (t = t.stateNode, _h = !0, t.reset(), _h = !1), e = e.sibling;
		}
	}
	function Mu(e, t) {
		if (t.subtreeFlags & 9270) for (t = t.child; t !== null;) Nu(t, e), t = t.sibling;
		else nu(t, !1);
	}
	function Nu(e, t) {
		var n = e.alternate;
		if (n === null) Jl(e, !1);
		else switch (e.tag) {
			case 3:
				if (du = cu = !1, Hl(), Mu(t, e), !cu && !uu) {
					if (e = Vl, e !== null) for (var r = 0; r < e.length; r += 3) {
						n = e[r];
						var i = e[r + 1];
						Dp(n, e[r + 2]), n = n.ownerDocument.documentElement, n !== null && n.animate({
							opacity: [0, 0],
							pointerEvents: ["none", "none"]
						}, {
							duration: 0,
							fill: "forwards",
							pseudoElement: "::view-transition-group(" + i + ")"
						});
					}
					e = t.containerInfo, e = e.nodeType === 9 ? e.documentElement : e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "" && (e.style.viewTransitionName = "none", e.animate({
						opacity: [0, 0],
						pointerEvents: ["none", "none"]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition-group(root)"
					}), e.animate({
						width: [0, 0],
						height: [0, 0]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition"
					})), du = !0;
				}
				Vl = null;
				break;
			case 5:
				Mu(t, e);
				break;
			case 4:
				r = cu, cu = !1, Mu(t, e), cu && (uu = !0), cu = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? Mu(t, e) : Jl(e, !1));
				break;
			case 30:
				r = cu, i = Hl(), cu = !1, Mu(t, e), cu && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = bi(a, o), o = bi(n.memoizedProps, o);
				var s = Si(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, Ul = 0, t = tu(e, n, t, o, s, a, !0), Ul !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (Nd(e, e.memoizedProps.onUpdate), Vl = i) : i !== null && (i.push.apply(i, Vl), Vl = i), cu = e.flags & 32 ? !0 : r;
				break;
			default: Mu(t, e);
		}
	}
	function Pu(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) mu(e, t.alternate, t), t = t.sibling;
	}
	function Fu(e, t) {
		for (e = e.child; e !== null;) {
			var n = e, r = t;
			switch (n.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					xl(4, n, n.return), Fu(n, r);
					break;
				case 1:
					Tl(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && Cl(n, n.return, i), Fu(n, r);
					break;
				case 27: r & 2 && _m(n.stateNode, n.type, n.memoizedProps);
				case 5:
					Tl(n, n.return), n.tag !== 5 && n.tag !== 27 || Ol(n), Fu(n, r);
					break;
				case 6:
					Ol(n);
					break;
				case 26:
					Tl(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || K || i.parentNode.removeChild(i), Fu(n, r);
					break;
				case 22:
					n.memoizedState === null && Fu(n, r);
					break;
				case 30:
					Tl(n, n.return), Fu(n, r);
					break;
				case 7: Tl(n, n.return);
				default: Fu(n, r);
			}
			e = e.sibling;
		}
	}
	function Iu(e, t, n) {
		for (n = t.subtreeFlags & 8772 ? n : n & -2, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags, s = !!(n & 1);
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					Iu(i, a, n), bl(4, a);
					break;
				case 1:
					if (Iu(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Z(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var c = r.stateNode;
						try {
							var l = i.shared.hiddenCallbacks;
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) To(l[i], c);
						} catch (e) {
							Z(r, r.return, e);
						}
					}
					s && o & 64 && Sl(a), wl(a, a.return);
					break;
				case 27: n & 2 && Ll(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || Dl(a), Iu(i, a, n), s && r === null && o & 4 && jl(a), wl(a, a.return);
					break;
				case 6:
					Dl(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || ru || qm(xm(c.ownerDocument), a.type, c), Iu(i, a, n), s && r === null && o & 4 && jl(a), wl(a, a.return);
					break;
				case 12:
					Iu(i, a, n);
					break;
				case 31:
					Iu(i, a, n), s && o & 4 && Cu(i, a);
					break;
				case 13:
					Iu(i, a, n), s && o & 4 && wu(i, a);
					break;
				case 22:
					a.memoizedState === null && Iu(i, a, n), wl(a, a.return);
					break;
				case 30:
					Iu(i, a, n), wl(a, a.return);
					break;
				case 7: wl(a, a.return);
				default: Iu(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Lu(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Fa(n));
	}
	function Ru(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Fa(e));
	}
	function zu(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) Bu(e, t, n, r), t = t.sibling;
		else i && eu(t);
	}
	function Bu(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && $l(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				zu(e, t, n, r), a & 2048 && bl(9, t);
				break;
			case 1:
				zu(e, t, n, r);
				break;
			case 3:
				zu(e, t, n, r), i && du && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && Fa(a)));
				break;
			case 12:
				if (a & 2048) {
					zu(e, t, n, r), a = t.stateNode;
					try {
						var o = t.memoizedProps, s = o.id, c = o.onPostCommit;
						typeof c == "function" && c(s, t.alternate === null ? "mount" : "update", a.passiveEffectDuration, -0);
					} catch (e) {
						Z(t, t.return, e);
					}
				} else zu(e, t, n, r);
				break;
			case 31:
				zu(e, t, n, r);
				break;
			case 13:
				zu(e, t, n, r);
				break;
			case 23: break;
			case 22:
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && $l(t), o._visibility & 2 ? zu(e, t, n, r) : (o._visibility |= 2, Vu(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && $l(s), o._visibility & 2 ? zu(e, t, n, r) : Hu(e, t)), a & 2048 && Lu(s, t);
				break;
			case 24:
				zu(e, t, n, r), a & 2048 && Ru(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (Kl(a.child, !0), Kl(t.child, !0))), zu(e, t, n, r);
				break;
			default: zu(e, t, n, r);
		}
	}
	function Vu(e, t, n, r, i) {
		for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Vu(a, o, s, c, i), bl(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Vu(a, o, s, c, i)) : u._visibility & 2 ? Vu(a, o, s, c, i) : Hu(a, o), i && l & 2048 && Lu(o.alternate, o);
					break;
				case 24:
					Vu(a, o, s, c, i), i && l & 2048 && Ru(o.alternate, o);
					break;
				default: Vu(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Hu(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Hu(n, r), i & 2048 && Lu(r.alternate, r);
					break;
				case 24:
					Hu(n, r), i & 2048 && Ru(r.alternate, r);
					break;
				default: Hu(n, r);
			}
			t = t.sibling;
		}
	}
	var Uu = 8192;
	function Wu(e, t, n) {
		if (e.subtreeFlags & Uu) for (e = e.child; e !== null;) Gu(e, t, n), e = e.sibling;
	}
	function Gu(e, t, n) {
		switch (e.tag) {
			case 26:
				Wu(e, t, n), e.flags & Uu && (e.memoizedState === null ? (e = e.stateNode, (t & 335544128) === t && Qm(n, e)) : $m(n, Ou, e.memoizedState, e.memoizedProps));
				break;
			case 5:
				Wu(e, t, n), e.flags & Uu && (e = e.stateNode, (t & 335544128) === t && Qm(n, e));
				break;
			case 3:
			case 4:
				var r = Ou;
				Ou = xm(e.stateNode.containerInfo), Wu(e, t, n), Ou = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Uu, Uu = 16777216, Wu(e, t, n), Uu = r) : Wu(e, t, n));
				break;
			case 30:
				if ((e.flags & Uu) !== 0 && (r = e.memoizedProps.name, r != null && r !== "auto")) {
					var i = e.stateNode;
					i.paired = null, zl === null && (zl = /* @__PURE__ */ new Map()), zl.set(r, i);
				}
				Wu(e, t, n);
				break;
			default: Wu(e, t, n);
		}
	}
	function Ku(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function qu(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				su = r, Xu(r, e);
			}
			Ku(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Ju(e), e = e.sibling;
	}
	function Ju(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				qu(e), e.flags & 2048 && xl(9, e, e.return);
				break;
			case 3:
				qu(e);
				break;
			case 12:
				qu(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Yu(e)) : qu(e);
				break;
			default: qu(e);
		}
	}
	function Yu(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				su = r, Xu(r, e);
			}
			Ku(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					xl(8, t, t.return), Yu(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Yu(t));
					break;
				default: Yu(t);
			}
			e = e.sibling;
		}
	}
	function Xu(e, t) {
		for (; su !== null;) {
			var n = su;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					xl(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: Fa(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, su = r;
			else a: for (n = e; su !== null;) {
				r = su;
				var i = r.sibling, a = r.return;
				if (vu(r), r === n) {
					su = null;
					break a;
				}
				if (i !== null) {
					i.return = a, su = i;
					break a;
				}
				su = a;
			}
		}
	}
	var Zu = {
		getCacheForType: function(e) {
			var t = Da(Na), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Da(Na).controller.signal;
		}
	}, Qu = typeof WeakMap == "function" ? WeakMap : Map, q = 0, $u = null, J = null, Y = 0, X = 0, ed = null, td = !1, nd = !1, rd = !1, id = 0, ad = 0, od = 0, sd = 0, cd = 0, ld = 0, ud = 0, dd = null, fd = null, pd = !1, md = 0, hd = 0, gd = Infinity, _d = null, vd = null, yd = 0, bd = null, xd = null, Sd = 0, Cd = 0, wd = null, Td = null, Ed = null, Dd = null, Od = null, kd = 0, Ad = null;
	function jd() {
		return q & 2 && Y !== 0 ? Y & -Y : k.T === null ? Dt() : Pf();
	}
	function Md() {
		if (ld === 0) {
			if (!(Y & 536870912) || R) {
				var e = dt;
				dt <<= 1, !(dt & 3932160) && (dt = 262144), ld = e;
			} else ld = 536870912;
		}
		return e = Mo.current, e !== null && (e.flags |= 32), ld;
	}
	function Nd(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Fp(bi(e.memoizedProps, n))), Dd === null && (Dd = []), Dd.push(t.bind(null, r));
		}
	}
	function Pd(e, t, n) {
		(e === $u && (X === 2 || X === 9) || e.cancelPendingCommit !== null) && (Vd(e, 0), Rd(e, Y, ld, !1)), bt(e, n), (!(q & 2) || e !== $u) && (e === $u && (!(q & 2) && (sd |= n), ad === 4 && Rd(e, Y, ld, !1)), Ef(e));
	}
	function Fd(e, t, n) {
		if (q & 6) throw Error(i(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || ht(e, t), a = r ? Yd(e, t) : qd(e, t, !0), o = r;
		do {
			if (a === 0) {
				nd && !r && Rd(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, o && !Ld(n)) a = qd(e, t, !1), o = !1;
			else {
				if (a === 2) {
					if (o = t, e.errorRecoveryDisabledLanes & o) var s = 0;
					else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
					if (s !== 0) {
						t = s;
						a: {
							var c = e;
							a = dd;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (Vd(c, s).flags |= 256), s = qd(c, s, !1), s !== 2 && s !== 6) {
								if (rd && !l) {
									c.errorRecoveryDisabledLanes |= o, sd |= o, a = 4;
									break a;
								}
								o = fd, fd = a, o !== null && (fd === null ? fd = o : fd.push.apply(fd, o));
							}
							a = s;
						}
						if (o = !1, a !== 2) continue;
					}
				}
				if (a === 1) {
					Vd(e, 0), Rd(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, o = a, o) {
						case 0:
						case 1: throw Error(i(345));
						case 4: if ((t & 4194048) !== t && (t & 62914560) !== t) break;
						case 6:
							Rd(r, t, ld, !td);
							break a;
						case 2:
							fd = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(i(329));
					}
					if ((t & 62914560) === t && (a = md + 300 - Je(), 10 < a)) {
						if (Rd(r, t, ld, !td), mt(r, 0, !0) !== 0) break a;
						Sd = t, r.timeoutHandle = _p(Id.bind(null, r, n, fd, _d, pd, t, ld, sd, ud, td, o, "Throttled", -0, 0), a);
						break a;
					}
					Id(r, n, fd, _d, pd, t, ld, sd, ud, td, o, null, -0, 0);
				}
				break;
			}
		} while (1);
		Ef(e);
	}
	function Id(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		e.timeoutHandle = -1;
		var m = t.subtreeFlags, h = (a & 335544064) === a;
		d = null, (h || m & 8192 || (m & 16785408) == 16785408) && (d = {
			stylesheets: null,
			count: 0,
			imgCount: 0,
			imgBytes: 0,
			suspenseyImages: [],
			waitingForImages: !0,
			waitingForViewTransition: !1,
			unsuspend: Tn
		}, zl = null, Gu(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = rh.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? md - Je() : (a & 4194048) === a ? hd - Je() : 0, m = th(d, m), m !== null) ? (Sd = a, e.cancelPendingCommit = m(nf.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), Rd(e, a, o, !l)) : nf(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function Ld(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!Gr(a(), i)) return !1;
				} catch {
					return !1;
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function Rd(e, t, n, r) {
		t = gt(e, t), t &= ~cd, t &= ~sd, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - ot(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && St(e, n, t);
	}
	function zd() {
		return q & 6 ? !0 : (Df(0, !1), !1);
	}
	function Bd() {
		if (J !== null) {
			if (X === 0) var e = J.return;
			else e = J, ya = va = null, ss(e), oo = null, so = 0, e = J;
			for (; e !== null;) yl(e.alternate, e), e = e.return;
			J = null;
		}
	}
	function Vd(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, vp(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), Sd = 0, Bd(), $u = e, J = n = Li(e.current, null), Y = t, X = 0, ed = null, td = !1, nd = ht(e, t), rd = !1, ud = ld = cd = sd = od = ad = 0, fd = dd = null, pd = !1, id = gt(e, t), Di(), n;
	}
	function Hd(e, t) {
		B = null, k.H = hc, t === Xa || t === Qa ? (t = io(), X = 3) : t === Za ? (t = io(), X = 4) : X = t === Nc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, ed = t, J === null && (ad = 1, Dc(e, Gi(t, e.current)));
	}
	function Ud() {
		var e = Mo.current;
		return e === null ? !0 : (Y & 4194048) === Y ? No === null : (Y & 62914560) === Y || Y & 536870912 ? e === No : !1;
	}
	function Wd() {
		var e = k.H;
		return k.H = hc, e === null ? hc : e;
	}
	function Gd() {
		var e = k.A;
		return k.A = Zu, e;
	}
	function Kd() {
		ad = 4, td || (Y & 4194048) !== Y && Mo.current !== null || (nd = !0), !(od & 134217727) && !(sd & 134217727) || $u === null || Rd($u, Y, ld, !1);
	}
	function qd(e, t, n) {
		var r = q;
		q |= 2;
		var i = Wd(), a = Gd();
		($u !== e || Y !== t) && (_d = null, Vd(e, t)), t = !1;
		var o = ad;
		a: do
			try {
				if (X !== 0 && J !== null) {
					var s = J, c = ed;
					switch (X) {
						case 8:
							Bd(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							Mo.current === null && (t = !0);
							var l = X;
							if (X = 0, ed = null, $d(e, s, c, l), n && nd) {
								o = 0;
								break a;
							}
							break;
						default: l = X, X = 0, ed = null, $d(e, s, c, l);
					}
				}
				Jd(), o = ad;
				break;
			} catch (t) {
				Hd(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, ya = va = null, q = r, k.H = i, k.A = a, J === null && ($u = null, Y = 0, Di()), o;
	}
	function Jd() {
		for (; J !== null;) Zd(J);
	}
	function Yd(e, t) {
		var n = q;
		q |= 2;
		var r = Wd(), a = Gd();
		$u !== e || Y !== t ? (_d = null, gd = Je() + 500, Vd(e, t)) : nd = ht(e, t);
		a: do
			try {
				if (X !== 0 && J !== null) {
					t = J;
					var o = ed;
					b: switch (X) {
						case 1:
							X = 0, ed = null, $d(e, t, o, 1);
							break;
						case 2:
						case 9:
							if (eo(o)) {
								X = 0, ed = null, Qd(t);
								break;
							}
							t = function() {
								X !== 2 && X !== 9 || $u !== e || (X = 7), Ef(e);
							}, o.then(t, t);
							break a;
						case 3:
							X = 7;
							break a;
						case 4:
							X = 5;
							break a;
						case 7:
							eo(o) ? (X = 0, ed = null, Qd(t)) : (X = 0, ed = null, $d(e, t, o, 7));
							break;
						case 5:
							var s = null;
							switch (J.tag) {
								case 26: s = J.memoizedState;
								case 5:
								case 27:
									var c = J;
									if (s ? Xm(s) : c.stateNode.complete) {
										X = 0, ed = null;
										var l = c.sibling;
										if (l !== null) J = l;
										else {
											var u = c.return;
											u === null ? J = null : (J = u, ef(u));
										}
										break b;
									}
							}
							X = 0, ed = null, $d(e, t, o, 5);
							break;
						case 6:
							X = 0, ed = null, $d(e, t, o, 6);
							break;
						case 8:
							Bd(), ad = 6;
							break a;
						default: throw Error(i(462));
					}
				}
				Xd();
				break;
			} catch (t) {
				Hd(e, t);
			}
		while (1);
		return ya = va = null, k.H = r, k.A = a, q = n, J === null ? ($u = null, Y = 0, Di(), ad) : 0;
	}
	function Xd() {
		for (; J !== null && !Ke();) Zd(J);
	}
	function Zd(e) {
		var t = ul(e.alternate, e, id);
		e.memoizedProps = e.pendingProps, t === null ? ef(e) : J = t;
	}
	function Qd(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = Gc(n, t, t.pendingProps, t.type, void 0, Y);
				break;
			case 11:
				t = Gc(n, t, t.pendingProps, t.type.render, t.ref, Y);
				break;
			case 5:
				ss(t);
				var r = t;
				r === aa && (R ? (fa(r), r.tag === 5 && r.stateNode != null && (oa = r.stateNode)) : (fa(r), R = !0));
			default: yl(n, t), t = J = Ri(t, id), t = ul(n, t, id);
		}
		e.memoizedProps = e.pendingProps, t === null ? ef(e) : J = t;
	}
	function $d(e, t, n, r) {
		ya = va = null, ss(t), oo = null, so = 0;
		var i = t.return;
		try {
			if (Mc(e, i, t, n, Y)) {
				ad = 1, Dc(e, Gi(n, e.current)), J = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw J = i, t;
			ad = 1, Dc(e, Gi(n, e.current)), J = null;
			return;
		}
		t.flags & 32768 ? (R || r === 1 ? e = !0 : nd || Y & 536870912 ? e = !1 : (td = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Mo.current, r !== null && r.tag === 13 && (r.flags |= 16384))), tf(t, e)) : ef(t);
	}
	function ef(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				tf(t, td);
				return;
			}
			e = t.return;
			var n = _l(t.alternate, t, id);
			if (n !== null) {
				J = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				J = t;
				return;
			}
			J = t = e;
		} while (t !== null);
		ad === 0 && (ad = 5);
	}
	function tf(e, t) {
		do {
			var n = vl(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, J = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				J = e;
				return;
			}
			J = e = n;
		} while (e !== null);
		ad = 6, J = null;
	}
	function nf(e, t, n, r, a, o, s, c, l, u, d, f) {
		e.cancelPendingCommit = null;
		do
			df();
		while (yd !== 0);
		if (q & 6) throw Error(i(327));
		if (t !== null) {
			if (t === e.current) throw Error(i(177));
			e === $u && (J = $u = null, Y = 0), xd = t, bd = e, Sd = n, wd = a, Td = r, rf(e, t, n, s, c, l, f);
		}
	}
	function rf(e, t, n, r, i, a, o) {
		var s = t.lanes | t.childLanes;
		if (Cd = s, s |= Ei, xt(e, n, s, r, i, a), Dd = null, (n & 335544064) === n ? (Od = Ra(e), r = 10262) : (Od = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, yf(Qe, function() {
			return ff(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), Rl = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = k.T, k.T = null, i = A.p, A.p = 2, a = q, q |= 4;
			try {
				fu(e, t, n);
			} finally {
				q = a, A.p = i, k.T = r;
			}
		}
		yd = 1, Rl ? Ed = Np(o, e.containerInfo, Od, sf, cf, of, lf, ff, af, null, null) : (sf(), cf(), lf());
	}
	function af(e) {
		if (yd !== 0) {
			var t = bd.onRecoverableError;
			t(e, { componentStack: null });
		}
	}
	function of() {
		yd === 3 && (yd = 0, Nu(xd, bd), yd = 4);
	}
	function sf() {
		if (yd === 1) {
			yd = 0;
			var e = bd, t = xd, n = Sd, r = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || r) {
				r = k.T, k.T = null;
				var i = A.p;
				A.p = 2;
				var a = q;
				q |= 4;
				try {
					lu = uu = !1, ku(t, e, n), n = lp;
					var o = Zr(e.containerInfo), s = n.focusedElem, c = n.selectionRange;
					if (o !== s && s && s.ownerDocument && Xr(s.ownerDocument.documentElement, s)) {
						if (c !== null && Qr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Yr(s, h), v = Yr(s, g);
									if (_ && v && (p.rangeCount !== 1 || p.anchorNode !== _.node || p.anchorOffset !== _.offset || p.focusNode !== v.node || p.focusOffset !== v.offset)) {
										var y = d.createRange();
										y.setStart(_.node, _.offset), p.removeAllRanges(), h > g ? (p.addRange(y), p.extend(v.node, v.offset)) : (y.setEnd(v.node, v.offset), p.addRange(y));
									}
								}
							}
						}
						for (d = [], p = s; p = p.parentNode;) p.nodeType === 1 && d.push({
							element: p,
							left: p.scrollLeft,
							top: p.scrollTop
						});
						for (typeof s.focus == "function" && s.focus(), s = 0; s < d.length; s++) {
							var b = d[s];
							b.element.scrollLeft = b.left, b.element.scrollTop = b.top;
						}
					}
					_h = !!cp, lp = cp = null;
				} finally {
					q = a, A.p = i, k.T = r;
				}
			}
			e.current = t, yd = 2;
		}
	}
	function cf() {
		if (yd === 2) {
			yd = 0;
			var e = bd, t = xd, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = k.T, k.T = null;
				var r = A.p;
				A.p = 2;
				var i = q;
				q |= 4;
				try {
					mu(e, t.alternate, t);
				} finally {
					q = i, A.p = r, k.T = n;
				}
			}
			yd = 3;
		}
	}
	function lf() {
		if (yd === 4 || yd === 3) {
			yd = 0;
			var e = Ed;
			Ed = null, qe();
			var t = bd, n = xd, r = Sd, i = Td, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? yd = 5 : (yd = 0, xd = bd = null, uf(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (vd = null), Et(r), n = n.stateNode, it && typeof it.onCommitFiberRoot == "function") try {
				it.onCommitFiberRoot(rt, n, void 0, (n.current.flags & 128) == 128);
			} catch {}
			if (i !== null) {
				n = k.T, a = A.p, A.p = 2, k.T = null;
				try {
					for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
						var c = i[s];
						o(c.value, { componentStack: c.stack });
					}
				} finally {
					k.T = n, A.p = a;
				}
			}
			if (i = Dd, o = Od, Od = null, i !== null && (Dd = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			Sd & 3 && df(), Ef(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === Ad ? kd++ : (kd = 0, Ad = t) : (kd = 0, Ad = null), Df(0, !1);
		}
	}
	function uf(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Fa(t)));
	}
	function df() {
		return Ed !== null && (Ed.skipTransition(), Ed = null), sf(), cf(), lf(), ff();
	}
	function ff() {
		if (yd !== 5) return !1;
		var e = bd, t = Cd;
		Cd = 0;
		var n = Et(Sd), r = k.T, a = A.p;
		try {
			A.p = 32 > n ? 32 : n, k.T = null, n = wd, wd = null;
			var o = bd, s = Sd;
			if (yd = 0, xd = bd = null, Sd = 0, q & 6) throw Error(i(331));
			var c = q;
			if (q |= 4, Ju(o.current), Bu(o, o.current, s, n), q = c, Df(0, !1), it && typeof it.onPostCommitFiberRoot == "function") try {
				it.onPostCommitFiberRoot(rt, o);
			} catch {}
			return !0;
		} finally {
			A.p = a, k.T = r, uf(e, t);
		}
	}
	function pf(e, t, n) {
		t = Gi(n, t), t = kc(e.stateNode, t, 2), e = yo(e, t, 2), e !== null && (bt(e, 2), Ef(e));
	}
	function Z(e, t, n) {
		if (e.tag === 3) pf(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				pf(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (vd === null || !vd.has(r))) {
					e = Gi(n, e), n = Ac(2), r = yo(t, n, 2), r !== null && (jc(n, r, t, e), bt(r, 2), Ef(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function mf(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Qu();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (rd = !0, i.add(n), e = hf.bind(null, e, t, n), t.then(e, e));
	}
	function hf(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, $u === e && (Y & n) === n && (ad === 4 || ad === 3 && (Y & 62914560) === Y && 300 > Je() - md ? q & 2 ? cd |= n : Vd(e, 0) : cd |= n, ud === Y && (ud = 0)), Ef(e);
	}
	function gf(e, t) {
		t === 0 && (t = vt()), e = Ai(e, t), e !== null && (bt(e, t), Ef(e));
	}
	function _f(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), gf(e, n);
	}
	function vf(e, t) {
		var n = 0;
		switch (e.tag) {
			case 31:
			case 13:
				var r = e.stateNode, a = e.memoizedState;
				a !== null && (n = a.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			case 22:
				r = e.stateNode._retryCache;
				break;
			default: throw Error(i(314));
		}
		r !== null && r.delete(t), gf(e, n);
	}
	function yf(e, t) {
		return We(e, t);
	}
	var bf = null, xf = null, Sf = !1, Cf = !1, wf = !1, Tf = 0;
	function Ef(e) {
		e !== xf && e.next === null && (xf === null ? bf = xf = e : xf = xf.next = e), Cf = !0, Sf || (Sf = !0, Nf());
	}
	function Df(e, t) {
		if (!wf && Cf) {
			wf = !0;
			do
				for (var n = !1, r = bf; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - ot(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, Mf(r, a));
						} else a = Y, a = mt(r, r === $u ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || ht(r, a) || (n = !0, Mf(r, a));
					}
					r = r.next;
				}
			while (n);
			wf = !1;
		}
	}
	function Of() {
		kf();
	}
	function kf() {
		Cf = Sf = !1;
		var e = 0;
		Tf !== 0 && gp() && (e = Tf);
		for (var t = Je(), n = null, r = bf; r !== null;) {
			var i = r.next, a = Af(r, t);
			a === 0 ? (r.next = null, n === null ? bf = i : n.next = i, i === null && (xf = n)) : (n = r, (e !== 0 || a & 3) && (Cf = !0)), r = i;
		}
		yd !== 0 && yd !== 5 || Df(e, !1), Tf !== 0 && (Tf = 0);
	}
	function Af(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - ot(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = _t(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = $u, n = Y, n = mt(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (X === 2 || X === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Ge(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || ht(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Ge(r), Et(n)) {
				case 2:
				case 8:
					n = Ze;
					break;
				case 32:
					n = Qe;
					break;
				case 268435456:
					n = et;
					break;
				default: n = Qe;
			}
			return r = jf.bind(null, e), n = We(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Ge(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function jf(e, t) {
		if (yd !== 0 && yd !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (df() && e.callbackNode !== n) return null;
		var r = Y;
		return r = mt(e, e === $u ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Fd(e, r, t), Af(e, Je()), e.callbackNode != null && e.callbackNode === n ? jf.bind(null, e) : null);
	}
	function Mf(e, t) {
		if (df()) return null;
		Fd(e, t, !0);
	}
	function Nf() {
		xp(function() {
			q & 6 ? We(Xe, Of) : kf();
		});
	}
	function Pf() {
		if (Tf === 0) {
			var e = Va;
			e === 0 && (e = ut, ut <<= 1, !(ut & 261888) && (ut = 256)), Tf = e;
		}
		return Tf;
	}
	function Ff(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : wn(e);
	}
	function If(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = Ff((i[jt] || null).action), o = r.submitter;
			o && (t = (t = o[jt] || null) ? Ff(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new Wn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (Tf !== 0) {
								var e = new FormData(i, o);
								tc(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = new FormData(i, o), tc(n, {
							pending: !0,
							data: e,
							method: i.method,
							action: a
						}, a, e));
					},
					currentTarget: i
				}]
			});
		}
	}
	for (var Lf = 0; Lf < vi.length; Lf++) {
		var Rf = vi[Lf];
		yi(Rf.toLowerCase(), "on" + (Rf[0].toUpperCase() + Rf.slice(1)));
	}
	yi(ui, "onAnimationEnd"), yi(di, "onAnimationIteration"), yi(fi, "onAnimationStart"), yi("dblclick", "onDoubleClick"), yi("focusin", "onFocus"), yi("focusout", "onBlur"), yi(pi, "onTransitionRun"), yi(mi, "onTransitionStart"), yi(hi, "onTransitionCancel"), yi(gi, "onTransitionEnd"), Jt("onMouseEnter", ["mouseout", "mouseover"]), Jt("onMouseLeave", ["mouseout", "mouseover"]), Jt("onPointerEnter", ["pointerout", "pointerover"]), Jt("onPointerLeave", ["pointerout", "pointerover"]), qt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), qt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), qt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), qt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), qt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), qt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var zf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Bf = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(zf));
	function Vf(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Ci(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Ci(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Q(e, t) {
		var n = t[Nt];
		n === void 0 && (n = t[Nt] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Gf(t, e, 2, !1), n.add(r));
	}
	function Hf(e, t, n) {
		var r = 0;
		t && (r |= 4), Gf(n, e, r, t);
	}
	var Uf = "_reactListening" + Math.random().toString(36).slice(2);
	function Wf(e) {
		if (!e[Uf]) {
			e[Uf] = !0, Gt.forEach(function(t) {
				t !== "selectionchange" && (Bf.has(t) || Hf(t, !1, e), Hf(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Uf] || (t[Uf] = !0, Hf("selectionchange", !1, t));
		}
	}
	function Gf(e, t, n, r) {
		switch (wh(t)) {
			case 2:
				var i = vh;
				break;
			case 8:
				i = yh;
				break;
			default: i = bh;
		}
		n = i.bind(null, t, n, e), i = void 0, !Fn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function Kf(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var s = r.tag;
			if (s === 3 || s === 4) {
				var c = r.stateNode.containerInfo;
				if (c === i) break;
				if (s === 4) for (s = r.return; s !== null;) {
					var l = s.tag;
					if ((l === 3 || l === 4) && s.stateNode.containerInfo === i) return;
					s = s.return;
				}
				for (; c !== null;) {
					if (s = zt(c), s === null) return;
					if (l = s.tag, l === 5 || l === 6 || l === 26 || l === 27) {
						r = a = s;
						continue a;
					}
					c = c.parentNode;
				}
			}
			r = r.return;
		}
		Mn(function() {
			var r = a, i = Dn(n), s = [];
			a: {
				var c = _i.get(e);
				if (c !== void 0) {
					var l = Wn, u = e;
					switch (e) {
						case "keypress": if (Bn(n) === 0) break a;
						case "keydown":
						case "keyup":
							l = sr;
							break;
						case "focusin":
							u = "focus", l = Qn;
							break;
						case "focusout":
							u = "blur", l = Qn;
							break;
						case "beforeblur":
						case "afterblur":
							l = Qn;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							l = Xn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							l = Zn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							l = ur;
							break;
						case ui:
						case di:
						case fi:
							l = $n;
							break;
						case gi:
							l = dr;
							break;
						case "scroll":
						case "scrollend":
							l = Kn;
							break;
						case "wheel":
							l = fr;
							break;
						case "copy":
						case "cut":
						case "paste":
							l = er;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							l = cr;
							break;
						case "submit":
							l = lr;
							break;
						case "toggle":
						case "beforetoggle": l = pr;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? c === null ? null : c + "Capture" : c;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = Nn(m, p), g != null && d.push(qf(m, g, h))), f) break;
						m = m.return;
					}
					0 < d.length && (c = new l(c, u, null, n, i), s.push({
						event: c,
						listeners: d
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (l = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", l && n !== En && (u = n.relatedTarget || n.fromElement) && (zt(u) || u[Mt])) break a;
					(c || l) && (u = i.window === i ? i : (l = i.ownerDocument) ? l.defaultView || l.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? zt(l) : null, l !== null && (f = o(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l && (d = Xn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = cr, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? u : Vt(c), h = l == null ? u : Vt(l), u = new d(g, m + "leave", c, n, i), u.target = f, u.relatedTarget = h, g = null, zt(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = c && l ? E(c, l, Yf) : null, c !== null && Xf(s, u, c, d, !1), l !== null && f !== null && Xf(s, f, l, d, !0)));
				}
				a: {
					if (c = r ? Vt(r) : window, l = c.nodeName && c.nodeName.toLowerCase(), l === "select" || l === "input" && c.type === "file") var _ = Nr;
					else if (Dr(c)) {
						if (Pr) _ = Ur;
						else {
							_ = Vr;
							var v = Br;
						}
					} else l = c.nodeName, !l || l.toLowerCase() !== "input" || c.type !== "checkbox" && c.type !== "radio" ? r && xn(r.elementType) && (_ = Nr) : _ = Hr;
					if (_ &&= _(e, r)) {
						Or(s, _, n, i);
						break a;
					}
					v && v(e, c, r);
				}
				switch (v = r ? Vt(r) : window, e) {
					case "focusin":
						(Dr(v) || v.contentEditable === "true") && (ei = v, ti = r, ni = null);
						break;
					case "focusout":
						ni = ti = ei = null;
						break;
					case "mousedown":
						ri = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						ri = !1, ii(s, n, i);
						break;
					case "selectionchange": if ($r) break;
					case "keydown":
					case "keyup": ii(s, n, i);
				}
				var y;
				if (hr) b: {
					switch (e) {
						case "compositionstart":
							var b = "onCompositionStart";
							break b;
						case "compositionend":
							b = "onCompositionEnd";
							break b;
						case "compositionupdate":
							b = "onCompositionUpdate";
							break b;
					}
					b = void 0;
				}
				else Cr ? xr(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
				b && (vr && n.locale !== "ko" && (Cr || b !== "onCompositionStart" ? b === "onCompositionEnd" && Cr && (y = zn()) : (Ln = i, Rn = "value" in Ln ? Ln.value : Ln.textContent, Cr = !0)), v = Jf(r, b), 0 < v.length && (b = new tr(b, e, null, n, i), s.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = Sr(n), y !== null && (b.data = y)))), (y = _r ? wr(e, n) : Tr(e, n)) && (b = Jf(r, "onBeforeInput"), 0 < b.length && (v = new tr("onBeforeInput", "beforeinput", null, n, i), s.push({
					event: v,
					listeners: b
				}), v.data = y)), If(s, e, r, n, i);
			}
			Vf(s, t);
		});
	}
	function qf(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Jf(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = Nn(e, n), i != null && r.unshift(qf(e, i, a)), i = Nn(e, t), i != null && r.push(qf(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Yf(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Xf(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = Nn(n, a), l != null && o.unshift(qf(n, l, c))) : i || (l = Nn(n, a), l != null && o.push(qf(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var Zf = /\r\n?/g, Qf = /\u0000|\uFFFD/g;
	function $f(e) {
		return (typeof e == "string" ? e : "" + e).replace(Zf, "\n").replace(Qf, "");
	}
	function ep(e, t) {
		return t = $f(t), $f(e) === t;
	}
	function tp(e, t, n, r, a, o) {
		switch (n) {
			case "children":
				if (typeof r == "string") t === "body" || t === "textarea" && r === "" || _n(e, r);
				else if (typeof r == "number" || typeof r == "bigint") t !== "body" && _n(e, "" + r);
				else return;
				break;
			case "className":
				tn(e, "class", r);
				break;
			case "tabIndex":
				tn(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				tn(e, n, r);
				break;
			case "style":
				bn(e, r, o);
				return;
			case "data": if (t !== "object") {
				tn(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href") || r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = wn(r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof o == "function" && (n === "formAction" ? (t !== "input" && tp(e, t, "name", a.name, a, null), tp(e, t, "formEncType", a.formEncType, a, null), tp(e, t, "formMethod", a.formMethod, a, null), tp(e, t, "formTarget", a.formTarget, a, null)) : (tp(e, t, "encType", a.encType, a, null), tp(e, t, "method", a.method, a, null), tp(e, t, "target", a.target, a, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = wn(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = Tn);
				return;
			case "onScroll":
				r != null && Q("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "multiple":
				e.multiple = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "muted":
				e.muted = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
					e.removeAttribute("xlink:href");
					break;
				}
				n = wn(r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "credentialless":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
				break;
			case "capture":
			case "download":
				!0 === r ? e.setAttribute(n, "") : !1 !== r && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "rowSpan":
			case "start":
				r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(n) : e.setAttribute(n, r);
				break;
			case "popover":
				Q("beforetoggle", e), Q("toggle", e), en(e, "popover", r);
				break;
			case "xlinkActuate":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				nn(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				nn(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				nn(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				en(e, "is", r);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") n = Sn.get(n) || n, en(e, n, r);
			else return;
		}
		M = !0;
	}
	function np(e, t, n, r, a, o) {
		switch (n) {
			case "style":
				bn(e, r, o);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "children":
				if (typeof r == "string") _n(e, r);
				else if (typeof r == "number" || typeof r == "bigint") _n(e, "" + r);
				else return;
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				return;
			case "onClick":
				r != null && (e.onclick = Tn);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!Kt.hasOwnProperty(n)) a: {
					if (n[0] === "o" && n[1] === "n" && (a = n.endsWith("Capture"), o = n.slice(2, a ? n.length - 7 : void 0), t = e[jt] || null, t = t == null ? null : t[n], typeof t == "function" && e.removeEventListener(o, t, a), typeof r == "function")) {
						typeof t != "function" && t !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(o, r, a);
						break a;
					}
					M = !0, n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : en(e, n, r);
				}
				return;
		}
		M = !0;
	}
	function rp(e, t, n) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				Q("error", e), Q("load", e);
				var r = !1, a = !1, o;
				for (o in n) if (n.hasOwnProperty(o)) {
					var s = n[o];
					if (s != null) switch (o) {
						case "src":
							r = !0;
							break;
						case "srcSet":
							a = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(i(137, t));
						default: tp(e, t, o, s, n, null);
					}
				}
				a && tp(e, t, "srcSet", n.srcSet, n, null), r && tp(e, t, "src", n.src, n, null);
				return;
			case "input":
				Q("invalid", e);
				var c = o = s = a = null, l = null, u = null;
				for (r in n) if (n.hasOwnProperty(r)) {
					var d = n[r];
					if (d != null) switch (r) {
						case "name":
							a = d;
							break;
						case "type":
							s = d;
							break;
						case "checked":
							l = d;
							break;
						case "defaultChecked":
							u = d;
							break;
						case "value":
							o = d;
							break;
						case "defaultValue":
							c = d;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (d != null) throw Error(i(137, t));
							break;
						default: tp(e, t, r, d, n, null);
					}
				}
				fn(e, o, c, l, u, s, a, !1);
				return;
			case "select":
				for (a in Q("invalid", e), r = s = o = null, n) if (n.hasOwnProperty(a) && (c = n[a], c != null)) switch (a) {
					case "value":
						o = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: tp(e, t, a, c, n, null);
				}
				t = o, n = s, e.multiple = !!r, t == null ? n != null && mn(e, !!r, n, !0) : mn(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in Q("invalid", e), o = a = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
					case "value":
						r = c;
						break;
					case "defaultValue":
						a = c;
						break;
					case "children":
						o = c;
						break;
					case "dangerouslySetInnerHTML":
						if (c != null) throw Error(i(91));
						break;
					default: tp(e, t, s, c, n, null);
				}
				gn(e, r, a, o);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: tp(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				Q("beforetoggle", e), Q("toggle", e), Q("cancel", e), Q("close", e);
				break;
			case "iframe":
			case "object":
				Q("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < zf.length; r++) Q(zf[r], e);
				break;
			case "image":
				Q("error", e), Q("load", e);
				break;
			case "details":
				Q("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": Q("error", e), Q("load", e);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (u in n) if (n.hasOwnProperty(u) && (r = n[u], r != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(i(137, t));
					default: tp(e, t, u, r, n, null);
				}
				return;
			default: if (xn(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && np(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && tp(e, t, c, r, n, null));
	}
	var ip = {};
	function ap(e, t, n, r) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var a = null, o = null, s = null, c = null, l = null, u = null, d = null;
				for (m in n) {
					var f = n[m];
					if (n.hasOwnProperty(m) && f != null) switch (m) {
						case "checked": break;
						case "value": break;
						case "defaultValue": l = f;
						default: r.hasOwnProperty(m) || tp(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							m !== f && (M = !0), o = m;
							break;
						case "name":
							m !== f && (M = !0), a = m;
							break;
						case "checked":
							m !== f && (M = !0), u = m;
							break;
						case "defaultChecked":
							m !== f && (M = !0), d = m;
							break;
						case "value":
							m !== f && (M = !0), s = m;
							break;
						case "defaultValue":
							m !== f && (M = !0), c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(i(137, t));
							break;
						default: m !== f && tp(e, t, p, m, r, f);
					}
				}
				dn(e, s, c, l, u, d, o, a);
				return;
			case "select":
				for (o in m = s = c = p = null, n) if (l = n[o], n.hasOwnProperty(o) && l != null) switch (o) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(o) || tp(e, t, o, null, r, l);
				}
				for (a in r) if (o = r[a], l = n[a], r.hasOwnProperty(a) && (o != null || l != null)) switch (a) {
					case "value":
						o !== l && (M = !0), p = o;
						break;
					case "defaultValue":
						o !== l && (M = !0), c = o;
						break;
					case "multiple": o !== l && (M = !0), s = o;
					default: o !== l && tp(e, t, a, o, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? mn(e, !!n, n ? [] : "", !1) : mn(e, !!n, t, !0)) : mn(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (a = n[c], n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: tp(e, t, c, null, r, a);
				}
				for (s in r) if (a = r[s], o = n[s], r.hasOwnProperty(s) && (a != null || o != null)) switch (s) {
					case "value":
						a !== o && (M = !0), p = a;
						break;
					case "defaultValue":
						a !== o && (M = !0), m = a;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (a != null) throw Error(i(91));
						break;
					default: a !== o && tp(e, t, s, a, r, o);
				}
				hn(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: tp(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						p !== m && (M = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: tp(e, t, l, p, r, m);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && tp(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(i(137, t));
						break;
					default: tp(e, t, u, p, r, m);
				}
				return;
			default: if (xn(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && np(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || np(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && tp(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || tp(e, t, f, p, r, m);
	}
	function op(e) {
		switch (e) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function sp() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && op(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && op(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var cp = null, lp = null;
	function up(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function dp(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function fp(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function pp(e, t, n, r) {
		return n = up(n).createElement(e), n[At] = r, n[jt] = t, rp(n, e, t), Ut(n), n;
	}
	function mp(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var hp = null;
	function gp() {
		var e = window.event;
		return e && e.type === "popstate" ? e !== hp && (hp = e, !0) : (hp = null, !1);
	}
	var _p = typeof setTimeout == "function" ? setTimeout : void 0, vp = typeof clearTimeout == "function" ? clearTimeout : void 0, yp = typeof Promise == "function" ? Promise : void 0, bp = typeof requestAnimationFrame == "function" ? requestAnimationFrame : _p, xp = typeof queueMicrotask == "function" ? queueMicrotask : yp === void 0 ? _p : function(e) {
		return yp.resolve(null).then(e).catch(Sp);
	};
	function Sp(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Cp(e) {
		return e === "head";
	}
	function wp(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$" || n === "/&") {
					if (r === 0) {
						e.removeChild(i), Hh(t);
						return;
					}
					r--;
				} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
				else if (n === "html") vm(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, vm(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[It] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && vm(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Hh(t);
	}
	function Tp(e, t) {
		var n = e;
		e = 0;
		do {
			var r = n.nextSibling;
			if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), r && r.nodeType === 8) {
				if (n = r.data, n === "/$") {
					if (e === 0) break;
					e--;
				} else n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
			}
			n = r;
		} while (n);
	}
	function Ep(e, t, n) {
		if (t = CSS.escape(t) === t ? t : "r-" + btoa(t).replace(/=/g, ""), e.style.viewTransitionName = t, n != null && (e.style.viewTransitionClass = n), n = getComputedStyle(e), n.display === "inline") {
			if (t = e.getClientRects(), t.length === 1) var r = 1;
			else for (var i = r = 0; i < t.length; i++) {
				var a = t[i];
				0 < a.width && 0 < a.height && r++;
			}
			r === 1 && (e = e.style, e.display = t.length === 1 ? "inline-block" : "block", e.marginTop = "-" + n.paddingTop, e.marginBottom = "-" + n.paddingBottom);
		}
	}
	function Dp(e, t) {
		e = e.style, t = t.style;
		var n = t == null ? null : t.hasOwnProperty("viewTransitionName") ? t.viewTransitionName : t.hasOwnProperty("view-transition-name") ? t["view-transition-name"] : null;
		e.viewTransitionName = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), n = t == null ? null : t.hasOwnProperty("viewTransitionClass") ? t.viewTransitionClass : t.hasOwnProperty("view-transition-class") ? t["view-transition-class"] : null, e.viewTransitionClass = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), e.display === "inline-block" && (t == null ? e.display = e.margin = "" : (n = t.display, e.display = n == null || typeof n == "boolean" ? "" : n, n = t.margin, n == null ? (n = t.hasOwnProperty("marginTop") ? t.marginTop : t["margin-top"], e.marginTop = n == null || typeof n == "boolean" ? "" : n, t = t.hasOwnProperty("marginBottom") ? t.marginBottom : t["margin-bottom"], e.marginBottom = t == null || typeof t == "boolean" ? "" : t) : e.margin = n));
	}
	function Op(e, t, n) {
		return n = n.ownerDocument.defaultView, {
			rect: e,
			abs: t.position === "absolute" || t.position === "fixed",
			clip: t.clipPath !== "none" || t.overflow !== "visible" || t.filter !== "none" || t.mask !== "none" || t.mask !== "none" || t.borderRadius !== "0px",
			view: 0 <= e.bottom && 0 <= e.right && e.top <= n.innerHeight && e.left <= n.innerWidth
		};
	}
	function kp(e) {
		return Op(e.getBoundingClientRect(), getComputedStyle(e), e);
	}
	function Ap(e) {
		var t = e.getBoundingClientRect();
		t = new DOMRect(t.x + 2e4, t.y + 2e4, t.width, t.height);
		var n = getComputedStyle(e);
		return Op(t, n, e);
	}
	function jp(e) {
		return e.documentElement.clientHeight;
	}
	function Mp(e) {
		this.addEventListener("load", e), this.addEventListener("error", e);
	}
	function Np(e, t, n, r, i, a, o, s, c) {
		var l = t.nodeType === 9 ? t : t.ownerDocument;
		try {
			var u = l.startViewTransition({
				update: function() {
					var t = l.defaultView, n = t.navigation && t.navigation.transition, o = l.fonts.status;
					r();
					var s = [];
					if (o === "loaded" && (jp(l), l.fonts.status === "loading" && s.push(l.fonts.ready)), o = s.length, e !== null) for (var c = e.suspenseyImages, u = 0, d = 0; d < c.length; d++) {
						var f = c[d];
						if (!f.complete) {
							var p = f.getBoundingClientRect();
							if (0 < p.bottom && 0 < p.right && p.top < t.innerHeight && p.left < t.innerWidth) {
								if (u += Zm(f), u > eh) {
									s.length = o;
									break;
								}
								f = new Promise(Mp.bind(f)), s.push(f);
							}
						}
					}
					if (0 < s.length) return t = Promise.race([Promise.all(s), new Promise(function(e) {
						return setTimeout(e, 500);
					})]).then(i, i), (n ? Promise.allSettled([n.finished, t]) : t).then(a, a);
					if (i(), n) return n.finished.then(a, a);
					a();
				},
				types: n
			});
			l.__reactViewTransition = u;
			var d = [];
			return u.ready.then(function() {
				for (var e = l.documentElement.getAnimations({ subtree: !0 }), t = 0; t < e.length; t++) {
					var n = e[t], r = n.effect, i = r.pseudoElement;
					if (i != null && i.startsWith("::view-transition")) {
						d.push(n), n = r.getKeyframes();
						for (var a = i = void 0, s = !0, c = 0; c < n.length; c++) {
							var u = n[c], f = u.width;
							if (i === void 0) i = f;
							else if (i !== f) {
								s = !1;
								break;
							}
							if (f = u.height, a === void 0) a = f;
							else if (a !== f) {
								s = !1;
								break;
							}
							delete u.width, delete u.height, u.transform === "none" && delete u.transform;
						}
						s && i !== void 0 && a !== void 0 && (r.setKeyframes(n), s = getComputedStyle(r.target, r.pseudoElement), s.width !== i || s.height !== a) && (s = n[0], s.width = i, s.height = a, s = n[n.length - 1], s.width = i, s.height = a, r.setKeyframes(n));
					}
				}
				o();
			}, function(e) {
				l.__reactViewTransition === u && (l.__reactViewTransition = null);
				try {
					if (typeof e == "object" && e) switch (e.name) {
						case "InvalidStateError": (e.message === "View transition was skipped because document visibility state is hidden." || e.message === "Skipping view transition because document visibility state has become hidden." || e.message === "Skipping view transition because viewport size changed." || e.message === "Transition was aborted because of invalid state") && (e = null);
					}
					e !== null && c(e);
				} finally {
					r(), i(), o();
				}
			}), u.finished.finally(function() {
				for (var e = 0; e < d.length; e++) d[e].cancel();
				l.__reactViewTransition === u && (l.__reactViewTransition = null), s();
			}), u;
		} catch {
			return r(), i(), o(), null;
		}
	}
	function Pp(e, t) {
		this._scope = document.documentElement, this._selector = "::view-transition-" + e + "(" + t + ")";
	}
	Pp.prototype.animate = function(e, t) {
		return t = typeof t == "number" ? { duration: t } : D({}, t), t.pseudoElement = this._selector, this._scope.animate(e, t);
	}, Pp.prototype.getAnimations = function() {
		for (var e = this._scope, t = this._selector, n = e.getAnimations({ subtree: !0 }), r = [], i = 0; i < n.length; i++) {
			var a = n[i].effect;
			a !== null && a.target === e && a.pseudoElement === t && r.push(n[i]);
		}
		return r;
	}, Pp.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function Fp(e) {
		return {
			name: e,
			group: new Pp("group", e),
			imagePair: new Pp("image-pair", e),
			old: new Pp("old", e),
			new: new Pp("new", e)
		};
	}
	function Ip(e) {
		this._fragmentFiber = e, this._observers = this._eventListeners = null;
	}
	Ip.prototype.addEventListener = function(e, t, n) {
		var r = null, i = null;
		if (!(n != null && typeof n != "boolean" && (r = n.signal || null, r !== null && r.aborted))) {
			this._eventListeners === null && (this._eventListeners = []);
			var a = this._eventListeners;
			if (Vp(a, e, t, n) === -1) {
				var o = this, s = t;
				n != null && typeof n != "boolean" && !0 === n.once && (s = function(r) {
					o.removeEventListener(e, t, n), typeof t == "function" ? t.call(this, r) : t.handleEvent(r);
				}), r !== null && (i = o.removeEventListener.bind(o, e, t, n), r.addEventListener("abort", i, { once: !0 }), i = r.removeEventListener.bind(r, "abort", i)), r = zp(n), a.push({
					type: e,
					listener: t,
					optionsOrUseCapture: n,
					attachedListener: s,
					cleanup: i
				}), m(this._fragmentFiber.child, !1, Lp, e, s, r);
			}
			this._eventListeners = a;
		}
	};
	function Lp(e, t, n, r) {
		return b(e).addEventListener(t, n, r), !1;
	}
	Ip.prototype.removeEventListener = function(e, t, n) {
		var r = this._eventListeners;
		if (r !== null && (t = Vp(r, e, t, n), t !== -1)) {
			var i = r[t];
			n = i.attachedListener;
			var a = i.cleanup;
			i = zp(i.optionsOrUseCapture), m(this._fragmentFiber.child, !1, Rp, e, n, i), r.splice(t, 1), a !== null && a();
		}
	};
	function Rp(e, t, n, r) {
		return b(e).removeEventListener(t, n, r), !1;
	}
	function zp(e) {
		return e != null && typeof e != "boolean" && (!0 === e.once || e.signal instanceof AbortSignal) ? {
			capture: e.capture,
			passive: e.passive
		} : e;
	}
	function Bp(e) {
		return e == null ? "c=0" : typeof e == "boolean" ? "c=" + (e ? "1" : "0") : "c=" + (e.capture ? "1" : "0");
	}
	function Vp(e, t, n, r) {
		if (e.length === 0) return -1;
		r = Bp(r);
		for (var i = 0; i < e.length; i++) {
			var a = e[i];
			if (a.type === t && a.listener === n && Bp(a.optionsOrUseCapture) === r) return i;
		}
		return -1;
	}
	Ip.prototype.dispatchEvent = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return !0;
		t = b(t);
		var n = this._eventListeners;
		if (n !== null && 0 < n.length || !e.bubbles) {
			var r = t.nodeType === 9 ? t.createComment("") : document.createTextNode("");
			if (n) for (var i = 0; i < n.length; i++) {
				var a = n[i];
				r.addEventListener(a.type, a.attachedListener, zp(a.optionsOrUseCapture));
			}
			if (t.appendChild(r), e = r.dispatchEvent(e), n) for (i = 0; i < n.length; i++) a = n[i], r.removeEventListener(a.type, a.attachedListener, zp(a.optionsOrUseCapture));
			return t.removeChild(r), e;
		}
		return t.dispatchEvent(e);
	}, Ip.prototype.focus = function(e) {
		m(this._fragmentFiber.child, !0, Hp, e, void 0, void 0);
	};
	function Hp(e, t) {
		return e.tag !== 6 && (e = b(e), mm(e, t));
	}
	Ip.prototype.focusLast = function(e) {
		var t = [];
		m(this._fragmentFiber.child, !0, Up, t, void 0, void 0);
		for (var n = t.length - 1; 0 <= n && !Hp(t[n], e); n--);
	};
	function Up(e, t) {
		return t.push(e), !1;
	}
	Ip.prototype.blur = function() {
		var e = g(this._fragmentFiber);
		e !== null && (e = b(e), e = up(e).activeElement, e !== null && m(this._fragmentFiber.child, !1, Wp, e, void 0, void 0));
	};
	function Wp(e, t) {
		return e.tag !== 6 && (e = b(e), e === t || e.contains(t) ? (t.blur(), !0) : !1);
	}
	Ip.prototype.observeUsing = function(e) {
		this._observers === null && (this._observers = /* @__PURE__ */ new Set()), this._observers.add(e), m(this._fragmentFiber.child, !1, Gp, e, void 0, void 0);
	};
	function Gp(e, t) {
		return e.tag === 6 || (e = b(e), t.observe(e)), !1;
	}
	Ip.prototype.unobserveUsing = function(e) {
		var t = this._observers;
		if (t !== null && t.has(e)) {
			t.delete(e), m(this._fragmentFiber.child, !1, Kp, e, void 0, void 0);
			for (var n = t = 0; n < qp.length; n++) {
				var r = qp[n];
				r.fragmentInstance === this && r.observer === e ? e.unobserve(r.instance) : qp[t++] = r;
			}
			qp.length = t;
		}
	};
	function Kp(e, t) {
		return e.tag === 6 || (e = b(e), t.unobserve(e)), !1;
	}
	var qp = [], Jp = !1;
	function Yp(e, t, n) {
		qp.push({
			fragmentInstance: e,
			observer: t,
			instance: n
		}), Jp || (Jp = !0, hm(function() {
			Jp = !1;
			var e = qp;
			qp = [];
			for (var t = 0; t < e.length; t++) {
				var n = e[t];
				n.observer.unobserve(n.instance);
			}
		}));
	}
	Ip.prototype.getClientRects = function() {
		var e = [];
		return m(this._fragmentFiber.child, !1, Xp, e, void 0, void 0), e;
	};
	function Xp(e, t) {
		if (e.tag === 6) {
			e = e.stateNode;
			var n = e.ownerDocument.createRange();
			n.selectNodeContents(e), t.push.apply(t, n.getClientRects());
		} else e = b(e), t.push.apply(t, e.getClientRects());
		return !1;
	}
	Ip.prototype.getRootNode = function(e) {
		var t = g(this._fragmentFiber);
		return t === null ? this : b(t).getRootNode(e);
	}, Ip.prototype.compareDocumentPosition = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var n = [];
		m(this._fragmentFiber.child, !1, Up, n, void 0, void 0);
		var r = b(t);
		if (n.length === 0) {
			if (n = r, _(this._fragmentFiber)) {
				a: {
					for (t = this._fragmentFiber.return; t !== null;) {
						if (t.tag === 4) {
							t = t.stateNode.containerInfo;
							break a;
						}
						if (t.tag === 3 || t.tag === 5 || t.tag === 27) break;
						t = t.return;
					}
					t = null;
				}
				t != null && (n = t);
			}
			t = this._fragmentFiber;
			var i = r = n.compareDocumentPosition(e);
			return n === e ? i = Node.DOCUMENT_POSITION_CONTAINS : r & Node.DOCUMENT_POSITION_CONTAINED_BY && (n = v(t)[1], n === null ? i = Node.DOCUMENT_POSITION_PRECEDING : (e = b(n).compareDocumentPosition(e), i = e === 0 || e & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING)), i |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
		}
		t = b(n[0]), i = b(n[n.length - 1]);
		var a = _(this._fragmentFiber) ? t.parentElement : r;
		if (a == null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		r = a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY, a = a.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		var o = t.compareDocumentPosition(e), s = i.compareDocumentPosition(e), c = o & Node.DOCUMENT_POSITION_CONTAINED_BY || s & Node.DOCUMENT_POSITION_CONTAINED_BY;
		return s = r && a && o & Node.DOCUMENT_POSITION_FOLLOWING && s & Node.DOCUMENT_POSITION_PRECEDING, t = r && t === e || a && i === e || c || s ? Node.DOCUMENT_POSITION_CONTAINED_BY : !r && t === e || !a && i === e ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : o, t & Node.DOCUMENT_POSITION_DISCONNECTED || t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || Zp(t, this._fragmentFiber, n[0], n[n.length - 1], e) ? t : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function Zp(e, t, n, r, i) {
		var a = zt(i);
		if (e & Node.DOCUMENT_POSITION_CONTAINED_BY) {
			if (n = !!a) a: {
				for (; a !== null;) {
					if (a.tag === 7 && (a === t || a.alternate === t)) {
						n = !0;
						break a;
					}
					a = a.return;
				}
				n = !1;
			}
			return n;
		}
		if (e & Node.DOCUMENT_POSITION_CONTAINS) {
			if (a === null) return a = i.ownerDocument, i === a || i === a.documentElement || i === a.body;
			a: {
				for (a = t, t = g(t); a !== null;) {
					if (!(a.tag !== 5 && a.tag !== 3 && a.tag !== 27 || a !== t && a.alternate !== t)) {
						a = !0;
						break a;
					}
					a = a.return;
				}
				a = !1;
			}
			return a;
		}
		return e & Node.DOCUMENT_POSITION_PRECEDING ? ((t = !!a) && !(t = a === n) && (t = E(n, a, T), t === null ? t = !1 : (m(t, !0, C, a, n), a = x, x = null, t = a !== null)), t) : e & Node.DOCUMENT_POSITION_FOLLOWING ? ((t = !!a) && !(t = a === r) && (t = E(r, a, T), t === null ? t = !1 : (m(t, !0, w, a, r), a = x, S = x = null, t = a !== null)), t) : !1;
	}
	function Qp(e, t) {
		var n = e.ownerDocument.createRange();
		n.selectNodeContents(e), e = n.getBoundingClientRect(), window.scrollTo(window.scrollX + e.left, t ? window.scrollY + e.top : window.scrollY + e.bottom - window.innerHeight);
	}
	Ip.prototype.scrollIntoView = function(e) {
		if (typeof e == "object") throw Error(i(566));
		var t = [];
		m(this._fragmentFiber.child, !1, Up, t, void 0, void 0);
		var n = !1 !== e;
		if (t.length === 0) {
			var r = v(this._fragmentFiber);
			if (r = n ? r[1] || r[0] || g(this._fragmentFiber) : r[0] || r[1], r === null) return;
			if (r.tag === 6) {
				e = b(r), Qp(e, n);
				return;
			}
			if (r = b(r), r.nodeType !== 9) {
				if (r.nodeType === 11) {
					n = "host" in r ? r.host : null, n !== null && n.scrollIntoView(e);
					return;
				}
				r.scrollIntoView(e);
			}
		}
		for (r = n ? t.length - 1 : 0; r !== (n ? -1 : t.length);) {
			var a = t[r];
			a.tag === 6 ? (a = b(a), Qp(a, n)) : b(a).scrollIntoView(e), r += n ? -1 : 1;
		}
	};
	function $p(e, t) {
		return e = b(e), em(e, t), !1;
	}
	function em(e, t) {
		e.reactFragments ??= /* @__PURE__ */ new Set(), e.reactFragments.add(t);
	}
	function tm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.addEventListener(i.type, i.attachedListener, zp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			for (var r = 0, i = 0; i < qp.length; i++) {
				var a = qp[i];
				(a.fragmentInstance !== t || a.observer !== n || a.instance !== e) && (qp[r++] = a);
			}
			qp.length = r, n.observe(e);
		}), em(e, t));
	}
	function nm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.removeEventListener(i.type, i.attachedListener, zp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			typeof n.rootMargin == "string" ? Yp(t, n, e) : n.unobserve(e);
		}), e.reactFragments != null && e.reactFragments.delete(t));
	}
	function rm(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					rm(n), Rt(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function im(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) {
				if (t === "input" && e.type === "hidden") {
					var a = i.name == null ? null : "" + i.name;
					if (i.type === "hidden" && e.getAttribute("name") === a) return e;
				} else return e;
			} else if (!e[It]) switch (t) {
				case "meta":
					if (!e.hasAttribute("itemprop")) break;
					return e;
				case "link":
					if (a = e.getAttribute("rel"), a === "stylesheet" && e.hasAttribute("data-precedence") || a !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title)) break;
					return e;
				case "style":
					if (e.hasAttribute("data-precedence")) break;
					return e;
				case "script":
					if (a = e.getAttribute("src"), (a !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && a && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
					return e;
				default: return e;
			}
			if (e = um(e.nextSibling), e === null) break;
		}
		return null;
	}
	function am(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = um(e.nextSibling), e === null)) return null;
		return e;
	}
	function om(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = um(e.nextSibling), e === null)) return null;
		return e;
	}
	function sm(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function cm(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function lm(e, t) {
		var n = e.ownerDocument;
		if (e.data === "$~") e._reactRetry = t;
		else if (e.data !== "$?" || n.readyState !== "loading") t();
		else {
			var r = function() {
				t(), n.removeEventListener("DOMContentLoaded", r);
			};
			n.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
		}
	}
	function um(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
				if (t === "/$" || t === "/&") return null;
			}
		}
		return e;
	}
	var dm = null;
	function fm(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return um(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function pm(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
					if (t === 0) return e;
					t--;
				} else n !== "/$" && n !== "/&" || t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	function mm(e, t) {
		function n() {
			r = !0;
		}
		if (e.ownerDocument.activeElement === e) return !0;
		var r = !1;
		try {
			e.ownerDocument.addEventListener("focus", n, !0), (e.focus || HTMLElement.prototype.focus).call(e, t);
		} finally {
			e.ownerDocument.removeEventListener("focus", n, !0);
		}
		return r;
	}
	function hm(e) {
		bp(function() {
			bp(function(t) {
				return e(t);
			});
		});
	}
	function gm(e, t, n) {
		switch (t = up(n), e) {
			case "html":
				if (e = t.documentElement, !e) throw Error(i(452));
				return e;
			case "head":
				if (e = t.head, !e) throw Error(i(453));
				return e;
			case "body":
				if (e = t.body, !e) throw Error(i(454));
				return e;
			default: throw Error(i(451));
		}
	}
	function _m(e, t, n) {
		for (var r in n) {
			var i = n[r];
			n.hasOwnProperty(r) && i != null && tp(e, t, r, null, ip, i);
		}
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === Tn && (e.onclick = null), Rt(e);
	}
	function vm(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		Rt(e);
	}
	var ym = /* @__PURE__ */ new Map(), bm = /* @__PURE__ */ new Set();
	function xm(e) {
		if (typeof e.getRootNode == "function") {
			var t = e.getRootNode();
			if (t.nodeType === 9 || t.nodeType === 11) return t;
		}
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	var Sm = A.d;
	A.d = {
		f: Cm,
		r: wm,
		D: Dm,
		C: Om,
		L: km,
		m: Am,
		X: Mm,
		S: jm,
		M: Nm
	};
	function Cm() {
		var e = Sm.f(), t = zd();
		return e || t;
	}
	function wm(e) {
		var t = Bt(e);
		t !== null && t.tag === 5 && t.type === "form" ? rc(t) : Sm.r(e);
	}
	var Tm = typeof document > "u" ? null : document;
	function Em(e, t, n) {
		var r = Tm;
		if (r && typeof t == "string" && t) {
			var i = un(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), bm.has(i) || (bm.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), rp(t, "link", e), Ut(t), r.head.appendChild(t)));
		}
	}
	function Dm(e) {
		Sm.D(e), Em("dns-prefetch", e, null);
	}
	function Om(e, t) {
		Sm.C(e, t), Em("preconnect", e, t);
	}
	function km(e, t, n) {
		Sm.L(e, t, n);
		var r = Tm;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + un(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + un(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + un(n.imageSizes) + "\"]")) : i += "[href=\"" + un(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = Fm(e);
					break;
				case "script": a = zm(e);
			}
			if (!(ym.has(a) || (e = D({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), ym.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Im(a)) || t === "script" && r.querySelector(Bm(a))))) {
				var o = r.createElement("link");
				rp(o, "link", e), t === "style" && (o[Lt] = !0, o.onload = o.onerror = function() {
					Wt(o);
				}), Ut(o), r.head.appendChild(o);
			}
		}
	}
	function Am(e, t) {
		Sm.m(e, t);
		var n = Tm;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + un(r) + "\"][href=\"" + un(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = zm(e);
			}
			if (!ym.has(a) && (e = D({
				rel: "modulepreload",
				href: e
			}, t), ym.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(Bm(a))) return;
				}
				r = n.createElement("link"), rp(r, "link", e), Ut(r), n.head.appendChild(r);
			}
		}
	}
	function jm(e, t, n) {
		Sm.S(e, t, n);
		var r = Tm;
		if (r && e) {
			var i = Ht(r).hoistableStyles, a = Fm(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(Im(a))) s.loading = 5;
				else {
					e = D({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = ym.get(a)) && Um(e, n);
					var c = o = r.createElement("link");
					Ut(c), rp(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Hm(o, t, r);
				}
				o = {
					type: "stylesheet",
					instance: o,
					count: 1,
					state: s
				}, i.set(a, o);
			}
		}
	}
	function Mm(e, t) {
		Sm.X(e, t);
		var n = Tm;
		if (n && e) {
			var r = Ht(n).hoistableScripts, i = zm(e), a = r.get(i);
			a || (a = n.querySelector(Bm(i)), a || (e = D({
				src: e,
				async: !0
			}, t), (t = ym.get(i)) && Wm(e, t), a = n.createElement("script"), Ut(a), rp(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Nm(e, t) {
		Sm.M(e, t);
		var n = Tm;
		if (n && e) {
			var r = Ht(n).hoistableScripts, i = zm(e), a = r.get(i);
			a || (a = n.querySelector(Bm(i)), a || (e = D({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = ym.get(i)) && Wm(e, t), a = n.createElement("script"), Ut(a), rp(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Pm(e, t, n, r) {
		var a = (a = Ae.current) ? xm(a) : null;
		if (!a) throw Error(i(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (n = Fm(n.href), t = Ht(a).hoistableStyles, r = t.get(n), r || (r = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
					e = Fm(n.href);
					var o = Ht(a).hoistableStyles, s = o.get(e);
					if (s || (a = a.ownerDocument || a, s = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, o.set(e, s), (o = a.querySelector(Im(e))) ? o._p || (s.instance = o, s.state.loading = 5) : (o = ym.get(e), o || (o = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, ym.set(e, o)), Rm(a, e, o, s.state))), t && r === null) throw Error(i(528, ""));
					return s;
				}
				if (t && r !== null) throw Error(i(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = zm(n), t = Ht(a).hoistableScripts, r = t.get(n), r || (r = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(i(444, e));
		}
	}
	function Fm(e) {
		return "href=\"" + un(e) + "\"";
	}
	function Im(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Lm(e) {
		return D({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Rm(e, t, n, r) {
		if (t = e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]")) {
			if (!0 !== t[Lt]) {
				r.loading = 1;
				return;
			}
		} else t = e.createElement("link"), t[Lt] = !0, t.onload = t.onerror = Wt.bind(null, t), rp(t, "link", n), Ut(t), e.head.appendChild(t);
		r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		});
	}
	function zm(e) {
		return "[src=\"" + un(e) + "\"]";
	}
	function Bm(e) {
		return "script[async]" + e;
	}
	function Vm(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + un(n.href) + "\"]");
				if (r) return t.instance = r, Ut(r), r;
				var a = D({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), Ut(r), rp(r, "style", a), Hm(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				a = Fm(n.href);
				var o = e.querySelector(Im(a));
				if (o) return t.state.loading |= 4, t.instance = o, Ut(o), o;
				r = Lm(n), (a = ym.get(a)) && Um(r, a), o = (e.ownerDocument || e).createElement("link"), Ut(o);
				var s = o;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), rp(o, "link", r), t.state.loading |= 4, Hm(o, n.precedence, e), t.instance = o;
			case "script": return o = zm(n.src), (a = e.querySelector(Bm(o))) ? (t.instance = a, Ut(a), a) : (r = n, (a = ym.get(o)) && (r = D({}, n), Wm(r, a)), e = e.ownerDocument || e, a = e.createElement("script"), Ut(a), rp(a, "link", r), e.head.appendChild(a), t.instance = a);
			case "void": return null;
			default: throw Error(i(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Hm(r, n.precedence, e));
		return t.instance;
	}
	function Hm(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function Um(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function Wm(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Gm = null;
	function Km(e, t, n) {
		if (Gm === null) {
			var r = /* @__PURE__ */ new Map(), i = Gm = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Gm, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[It] || a[At] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function qm(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function Jm(e, t, n) {
		if (n === 1 || t.itemProp != null) return !1;
		switch (e) {
			case "meta":
			case "title": return !0;
			case "style":
				if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
				return !0;
			case "link":
				if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
				switch (t.rel) {
					case "stylesheet": return e = t.disabled, typeof t.precedence == "string" && e == null;
					default: return !0;
				}
			case "script": if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return !0;
		}
		return !1;
	}
	function Ym(e, t) {
		return e === "img" && t.src != null && t.src !== "" && t.onLoad == null && t.loading !== "lazy";
	}
	function Xm(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Zm(e) {
		return (e.width || 100) * (e.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * .25;
	}
	function Qm(e, t) {
		typeof t.decode == "function" && (e.imgCount++, t.complete || (e.imgBytes += Zm(t), e.suspenseyImages.push(t)), e = ih.bind(e), t.decode().then(e, e));
	}
	function $m(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = Fm(r.href), a = t.querySelector(Im(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = rh.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, Ut(a);
					return;
				}
				a = t.ownerDocument || t, r = Lm(r), (i = ym.get(i)) && Um(r, i), a = a.createElement("link"), Ut(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), rp(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = rh.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var eh = 0;
	function th(e, t) {
		return e.stylesheets && e.count === 0 && oh(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && oh(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && eh === 0 && (eh = 62500 * sp());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && oh(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > eh ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function nh(e) {
		if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
			if (e.stylesheets) oh(e, e.stylesheets);
			else if (e.unsuspend) {
				var t = e.unsuspend;
				e.unsuspend = null, t();
			}
		}
	}
	function rh() {
		this.count--, nh(this);
	}
	function ih() {
		this.imgCount--, nh(this);
	}
	var ah = null;
	function oh(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, ah = /* @__PURE__ */ new Map(), t.forEach(sh, e), ah = null, rh.call(e));
	}
	function sh(e, t) {
		if (!(t.state.loading & 4)) {
			var n = ah.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), ah.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = rh.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var ch = {
		$$typeof: oe,
		Provider: null,
		Consumer: null,
		_currentValue: Se,
		_currentValue2: Se,
		_threadCount: 0
	};
	function lh(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = yt(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = yt(0), this.hiddenUpdates = yt(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function uh(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new lh(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = Fi(3, null, null, t), e.current = a, a.stateNode = e, t = Pa(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, go(a), e;
	}
	function dh(e) {
		return e ? (e = Ni, e) : Ni;
	}
	function fh(e, t, n, r, i, a) {
		i = dh(i), r.context === null ? r.context = i : r.pendingContext = i, r = vo(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = yo(e, r, t), n !== null && (Pd(n, e, t), bo(n, e, t));
	}
	function ph(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function mh(e, t) {
		ph(e, t), (e = e.alternate) && ph(e, t);
	}
	function hh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Ai(e, 67108864);
			t !== null && Pd(t, e, 67108864), mh(e, 67108864);
		}
	}
	function gh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = jd();
			t = Tt(t);
			var n = Ai(e, t);
			n !== null && Pd(n, e, t), mh(e, t);
		}
	}
	var _h = !0;
	function vh(e, t, n, r) {
		var i = k.T;
		k.T = null;
		var a = A.p;
		try {
			A.p = 2, bh(e, t, n, r);
		} finally {
			A.p = a, k.T = i;
		}
	}
	function yh(e, t, n, r) {
		var i = k.T;
		k.T = null;
		var a = A.p;
		try {
			A.p = 8, bh(e, t, n, r);
		} finally {
			A.p = a, k.T = i;
		}
	}
	function bh(e, t, n, r) {
		if (_h) {
			var i = xh(r);
			if (i === null) Kf(e, t, r, Sh, n), Mh(e, r);
			else if (Ph(i, e, t, n, r)) r.stopPropagation();
			else if (Mh(e, r), t & 4 && -1 < jh.indexOf(e)) {
				for (; i !== null;) {
					var a = Bt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = pt(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - ot(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									Ef(a), !(q & 6) && (gd = Je() + 500, Df(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Ai(a, 2), s !== null && Pd(s, a, 2), zd(), mh(a, 2);
					}
					if (a = xh(r), a === null && Kf(e, t, r, Sh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Kf(e, t, r, null, n);
		}
	}
	function xh(e) {
		return e = Dn(e), Ch(e);
	}
	var Sh = null;
	function Ch(e) {
		if (Sh = null, e = zt(e), e !== null) {
			var t = o(e);
			if (t === null) e = null;
			else {
				var n = t.tag;
				if (n === 13) {
					if (e = s(t), e !== null) return e;
					e = null;
				} else if (n === 31) {
					if (e = c(t), e !== null) return e;
					e = null;
				} else if (n === 3) {
					if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
					e = null;
				} else t !== e && (e = null);
			}
		}
		return Sh = e, null;
	}
	function wh(e) {
		switch (e) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "fullscreenerror":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "resize":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (Ye()) {
				case Xe: return 2;
				case Ze: return 8;
				case Qe:
				case $e: return 32;
				case et: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var Th = !1, Eh = null, Dh = null, Oh = null, kh = /* @__PURE__ */ new Map(), Ah = /* @__PURE__ */ new Map(), $ = [], jh = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Mh(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				Eh = null;
				break;
			case "dragenter":
			case "dragleave":
				Dh = null;
				break;
			case "mouseover":
			case "mouseout":
				Oh = null;
				break;
			case "pointerover":
			case "pointerout":
				kh.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": Ah.delete(t.pointerId);
		}
	}
	function Nh(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = Bt(t), t !== null && hh(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Ph(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Eh = Nh(Eh, e, t, n, r, i), !0;
			case "dragenter": return Dh = Nh(Dh, e, t, n, r, i), !0;
			case "mouseover": return Oh = Nh(Oh, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return kh.set(a, Nh(kh.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, Ah.set(a, Nh(Ah.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Fh(e) {
		var t = zt(e.target);
		if (t !== null) {
			var n = o(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = s(n), t !== null) {
						e.blockedOn = t, Ot(e.priority, function() {
							gh(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = c(n), t !== null) {
						e.blockedOn = t, Ot(e.priority, function() {
							gh(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function Ih(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = xh(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				En = r, n.target.dispatchEvent(r), En = null;
			} else return t = Bt(n), t !== null && hh(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Lh(e, t, n) {
		Ih(e) && n.delete(t);
	}
	function Rh() {
		Th = !1, Eh !== null && Ih(Eh) && (Eh = null), Dh !== null && Ih(Dh) && (Dh = null), Oh !== null && Ih(Oh) && (Oh = null), kh.forEach(Lh), Ah.forEach(Lh);
	}
	function zh(e, n) {
		e.blockedOn === n && (e.blockedOn = null, Th || (Th = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, Rh)));
	}
	var Bh = null;
	function Vh(e) {
		Bh !== e && (Bh = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			Bh === e && (Bh = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (Ch(r || n) === null) continue;
					break;
				}
				var a = Bt(n);
				a !== null && (e.splice(t, 3), t -= 3, tc(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Hh(e) {
		function t(t) {
			return zh(t, e);
		}
		Eh !== null && zh(Eh, e), Dh !== null && zh(Dh, e), Oh !== null && zh(Oh, e), kh.forEach(t), Ah.forEach(t);
		for (var n = 0; n < $.length; n++) {
			var r = $[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < $.length && (n = $[0], n.blockedOn === null);) Fh(n), n.blockedOn === null && $.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[jt] || null;
			if (typeof a == "function") o || Vh(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[jt] || null) s = o.formAction;
					else if (Ch(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Vh(n);
			}
		}
	}
	function Uh() {
		function e(e) {
			e.canIntercept && e.info === "react-transition" && e.intercept({
				handler: function() {
					return new Promise(function(e) {
						return i = e;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function t() {
			i !== null && (i(), i = null), r || setTimeout(n, 20);
		}
		function n() {
			if (!r && !navigation.transition) {
				var e = navigation.currentEntry;
				e && e.url != null && navigation.navigate(e.url, {
					state: e.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if (typeof navigation == "object") {
			var r = !1, i = null;
			return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
				r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), i !== null && (i(), i = null);
			};
		}
	}
	function Wh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.render = Wh.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(i(409));
		var n = t.current;
		fh(n, jd(), e, t, null, null);
	}, Gh.prototype.unmount = Wh.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			fh(e.current, 2, null, e, null, null), zd(), t[Mt] = null;
		}
	};
	function Gh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = Dt();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < $.length && t !== 0 && t < $[n].priority; n++);
			$.splice(n, 0, e), n === 0 && Fh(e);
		}
	};
	var Kh = n.version;
	if (Kh !== "19.3.1") throw Error(i(527, Kh, "19.3.1"));
	A.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
		return e = u(t), e = e === null ? null : f(e), e = e === null ? null : e.stateNode, e;
	};
	var qh = {
		bundleType: 0,
		version: "19.3.1",
		rendererPackageName: "react-dom",
		currentDispatcherRef: k,
		reconcilerVersion: "19.3.1"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Jh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Jh.isDisabled && Jh.supportsFiber) try {
			rt = Jh.inject(qh), it = Jh;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!a(e)) throw Error(i(299));
		var n = !1, r = "", o = wc, s = Tc, c = Ec;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (c = t.onRecoverableError)), t = uh(e, 1, !1, null, null, n, r, null, o, s, c, Uh), e[Mt] = t.current, Wf(e), new Wh(t);
	};
})), _ = /* @__PURE__ */ s(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = g();
})), v = typeof window > "u" ? global : window, y = "@griffel/";
function b(e, t) {
	return v[Symbol.for(y + e)] || (v[Symbol.for(y + e)] = t), v[Symbol.for(y + e)];
}
var x = /*#__PURE__*/ b("DEFINITION_LOOKUP_TABLE", {}), S = "data-make-styles-bucket", C = "data-priority", w = "data-container", T = {
	all: 1,
	borderColor: 1,
	borderStyle: 1,
	borderWidth: 1,
	borderBlock: 1,
	borderBlockEnd: 1,
	borderBlockStart: 1,
	borderInline: 1,
	borderInlineEnd: 1,
	borderInlineStart: 1
}, E = "DO_NOT_USE_DIRECTLY: @griffel/reset-value";
//#endregion
//#region node_modules/@emotion/hash/dist/emotion-hash.esm.js
function D(e) {
	for (var t = 0, n, r = 0, i = e.length; i >= 4; ++r, i -= 4) n = e.charCodeAt(r) & 255 | (e.charCodeAt(++r) & 255) << 8 | (e.charCodeAt(++r) & 255) << 16 | (e.charCodeAt(++r) & 255) << 24, n = (n & 65535) * 1540483477 + ((n >>> 16) * 59797 << 16), n ^= n >>> 24, t = (n & 65535) * 1540483477 + ((n >>> 16) * 59797 << 16) ^ (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16);
	switch (i) {
		case 3: t ^= (e.charCodeAt(r + 2) & 255) << 16;
		case 2: t ^= (e.charCodeAt(r + 1) & 255) << 8;
		case 1: t ^= e.charCodeAt(r) & 255, t = (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16);
	}
	return t ^= t >>> 13, t = (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16), ((t ^ t >>> 15) >>> 0).toString(36);
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hashSequence.js
function ee(e) {
	let t = e.length;
	if (t === 7) return e;
	for (let n = t; n < 7; n++) e += "0";
	return e;
}
function te(e, t, n = []) {
	return "___" + ee(D(e + t));
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/reduceToClassNameForSlots.js
function ne(e, t) {
	let n = "", r = "";
	for (let i in e) {
		let a = e[i];
		if (a === 0) {
			r += i + " ";
			continue;
		}
		let o = Array.isArray(a), s = t === "rtl" ? (o ? a[1] : a) + " " : (o ? a[0] : a) + " ";
		n += s, r += s;
	}
	return [n.slice(0, -1), r.slice(0, -1)];
}
function re(e, t) {
	let n = {};
	for (let r in e) {
		let [i, a] = ne(e[r], t);
		if (a === "") {
			n[r] = "";
			continue;
		}
		let o = te(a, t), s = o + (i === "" ? "" : " " + i);
		x[o] = [e[r], t], n[r] = s;
	}
	return n;
}
//#endregion
//#region node_modules/@griffel/core/src/mergeClasses.js
var ie = {};
function O() {
	let e = null, t = "", n = "", r = Array(arguments.length);
	for (let e = 0; e < arguments.length; e++) {
		let i = arguments[e];
		if (typeof i == "string" && i !== "") {
			let a = i.indexOf("___");
			if (a === -1) t += i + " ";
			else {
				let o = i.substr(a, 10);
				a > 0 && (t += i.slice(0, a)), n += o, r[e] = o;
			}
		}
	}
	if (n === "") return t.slice(0, -1);
	let i = ie[n];
	if (i !== void 0) return t + i;
	let a = [];
	for (let t = 0; t < arguments.length; t++) {
		let n = r[t];
		if (n) {
			let t = x[n];
			t && (a.push(t[0]), e = t[1]);
		}
	}
	let o = Object.assign.apply(Object, [{}].concat(a)), [s, c] = ne(o, e), l = te(c, e, r), u = l + " " + s;
	return ie[n] = u, x[l] = [o, e], t + u;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/normalizeCSSBucketEntry.js
function ae(e) {
	return Array.isArray(e) ? e : [e];
}
//#endregion
//#region node_modules/@griffel/core/src/renderer/createIsomorphicStyleSheet.js
function oe(e, t, n, r) {
	let i = [];
	if (r[S] = t, r[C] = String(n), e) for (let t in r) e.setAttribute(t, r[t]);
	function a(t) {
		return e?.sheet ? e.sheet.insertRule(t, e.sheet.cssRules.length) : i.push(t);
	}
	return {
		elementAttributes: r,
		insertRule: a,
		element: e,
		bucketName: t,
		cssRules() {
			return e?.sheet ? Array.from(e.sheet.cssRules).map((e) => e.cssText) : i;
		}
	};
}
var se = /*#__PURE__*/ [
	"r",
	"d",
	"l",
	"v",
	"w",
	"f",
	"i",
	"h",
	"a",
	"s",
	"k",
	"t",
	"m",
	"c",
	"x"
].reduce((e, t, n) => (e[t] = n, e), {});
function ce(e, t, n) {
	return e === "m" || e === "x" ? e + t + n : e + n;
}
function le(e, t, n, r, i = {}) {
	let a = e === "m", o = e === "x", s = i.m, c = i.x, l = i.p ?? 0, u = ce(e, c ?? s ?? "0", l);
	if (!r.stylesheets[u]) {
		let d = t && t.createElement("style"), f = oe(d, e, l, {
			...r.styleElementAttributes,
			...a && { media: s },
			...o && { "data-container": c }
		});
		r.stylesheets[u] = f, t?.head && d && t.head.insertBefore(d, de(t, n, e, r, i));
	}
	return r.stylesheets[u];
}
function ue(e, t, n) {
	return e.getAttribute("data-make-styles-bucket") === t ? t === "m" ? n.m === e.media : t !== "x" || n.x === e.getAttribute(w) : !1;
}
function de(e, t, n, r, i = {}) {
	let a = se[n], o = i.m ?? "", s = i.x ?? "", c = i.p ?? 0, l = (e) => a - se[e.getAttribute(S)], u = e.head.querySelectorAll(`[${S}]`);
	if (n === "m" || n === "x") {
		let t = e.head.querySelectorAll(`[${S}="${n}"]`);
		t.length && (u = t, l = n === "m" ? (e) => r.compareMediaQueries(o, e.media) : (e) => r.compareContainerQueries(s, e.getAttribute("data-container") ?? ""));
	}
	let d = (e) => ue(e, n, i) ? c - Number(e.getAttribute(C)) : l(e), f = u.length, p = f - 1;
	for (; p >= 0;) {
		let e = u.item(p);
		if (d(e) > 0) return e.nextSibling;
		p--;
	}
	return f > 0 ? u.item(0) : t ? t.nextSibling : null;
}
//#endregion
//#region node_modules/@griffel/core/src/renderer/safeInsertRule.js
`${/* @__PURE__ */ [
	"-moz-placeholder",
	"-moz-focus-inner",
	"-moz-focusring",
	"-ms-input-placeholder",
	"-moz-read-write",
	"-moz-read-only"
].join("|")}`;
function fe(e, t) {
	try {
		e.insertRule(t);
	} catch {}
}
//#endregion
//#region node_modules/@griffel/core/src/renderer/createDOMRenderer.js
var pe = 0, me = (e, t) => e < t ? -1 : +(e > t);
function he(e = typeof document > "u" ? void 0 : document, t = {}) {
	let { classNameHashSalt: n, unstable_filterCSSRule: r, insertionPoint: i, styleElementAttributes: a, compareMediaQueries: o = me, compareContainerQueries: s = o } = t, c = {
		classNameHashSalt: n,
		insertionCache: {},
		stylesheets: {},
		styleElementAttributes: Object.freeze(a),
		compareMediaQueries: o,
		compareContainerQueries: s,
		id: `d${pe++}`,
		insertCSSRules(t) {
			for (let n in t) {
				let a = t[n];
				for (let t = 0, o = a.length; t < o; t++) {
					let [o, s] = ae(a[t]), l = le(n, e, i || null, c, s);
					c.insertionCache[o] || (c.insertionCache[o] = n, r ? r(o) && fe(l, o) : fe(l, o));
				}
			}
		}
	};
	return c;
}
//#endregion
//#region node_modules/stylis/src/Enum.js
var ge = "-moz-", _e = "-webkit-", ve = "comm", ye = "rule", be = "decl", xe = "@media", k = "@import", A = "@supports", Se = "@namespace", Ce = "@keyframes", we = "@layer", Te = Math.abs, Ee = String.fromCharCode, De = Object.assign;
function Oe(e, t) {
	return Ne(e, 0) ^ 45 ? (((t << 2 ^ Ne(e, 0)) << 2 ^ Ne(e, 1)) << 2 ^ Ne(e, 2)) << 2 ^ Ne(e, 3) : 0;
}
function ke(e) {
	return e.trim();
}
function Ae(e, t) {
	return (e = t.exec(e)) ? e[0] : e;
}
function je(e, t, n) {
	return e.replace(t, n);
}
function Me(e, t) {
	return e.indexOf(t);
}
function Ne(e, t) {
	return e.charCodeAt(t) | 0;
}
function Pe(e, t, n) {
	return e.slice(t, n);
}
function Fe(e) {
	return e.length;
}
function Ie(e) {
	return e.length;
}
function Le(e, t) {
	return t.push(e), e;
}
function Re(e, t) {
	return e.map(t).join("");
}
//#endregion
//#region node_modules/stylis/src/Tokenizer.js
var ze = 1, Be = 1, Ve = 0, He = 0, Ue = 0, We = "";
function Ge(e, t, n, r, i, a, o, s) {
	return {
		value: e,
		root: t,
		parent: n,
		type: r,
		props: i,
		children: a,
		line: ze,
		column: Be,
		length: o,
		return: "",
		siblings: s
	};
}
function Ke(e, t) {
	return De(Ge("", null, null, "", null, null, 0, e.siblings), e, { length: -e.length }, t);
}
function qe() {
	return Ue;
}
function Je() {
	return Ue = He > 0 ? Ne(We, --He) : 0, Be--, Ue === 10 && (Be = 1, ze--), Ue;
}
function Ye() {
	return Ue = He < Ve ? Ne(We, He++) : 0, Be++, Ue === 10 && (Be = 1, ze++), Ue;
}
function Xe() {
	return Ne(We, He);
}
function Ze() {
	return He;
}
function Qe(e, t) {
	return Pe(We, e, t);
}
function $e(e) {
	switch (e) {
		case 0:
		case 9:
		case 10:
		case 13:
		case 32: return 5;
		case 33:
		case 43:
		case 44:
		case 47:
		case 62:
		case 64:
		case 126:
		case 59:
		case 123:
		case 125: return 4;
		case 58: return 3;
		case 34:
		case 39:
		case 40:
		case 91: return 2;
		case 41:
		case 93: return 1;
	}
	return 0;
}
function et(e) {
	return ze = Be = 1, Ve = Fe(We = e), He = 0, [];
}
function tt(e) {
	return We = "", e;
}
function nt(e) {
	return ke(Qe(He - 1, st(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function rt(e) {
	return tt(at(et(e)));
}
function it(e) {
	for (; (Ue = Xe()) && Ue < 33;) Ye();
	return $e(e) > 2 || $e(Ue) > 3 ? "" : " ";
}
function at(e) {
	for (; Ye();) switch ($e(Ue)) {
		case 0:
			Le(lt(He - 1), e);
			break;
		case 2:
			Le(nt(Ue), e);
			break;
		default: Le(Ee(Ue), e);
	}
	return e;
}
function ot(e, t) {
	for (; --t && Ye() && !(Ue < 48 || Ue > 102 || Ue > 57 && Ue < 65 || Ue > 70 && Ue < 97););
	return Qe(e, Ze() + (t < 6 && Xe() == 32 && Ye() == 32));
}
function st(e) {
	for (; Ye();) switch (Ue) {
		case e: return He;
		case 34:
		case 39:
			e !== 34 && e !== 39 && st(Ue);
			break;
		case 40:
			e === 41 && st(e);
			break;
		case 92: Ye();
	}
	return He;
}
function ct(e, t) {
	for (; Ye() && e + Ue !== 57 && (e + Ue !== 84 || Xe() !== 47););
	return "/*" + Qe(t, He - 1) + "*" + Ee(e === 47 ? e : Ye());
}
function lt(e) {
	for (; !$e(Xe());) Ye();
	return Qe(e, He);
}
//#endregion
//#region node_modules/stylis/src/Parser.js
function ut(e) {
	return tt(dt("", null, null, null, [""], e = et(e), 0, [0], e));
}
function dt(e, t, n, r, i, a, o, s, c) {
	for (var l = 0, u = 0, d = o, f = 0, p = 0, m = 0, h = 1, g = 1, _ = 1, v = 0, y = 0, b = "", x = i, S = a, C = r, w = b; g;) switch (m = y, y = Ye()) {
		case 40:
			m != 108 && Ne(w, d - 1) == 58 ? (v++, w += "(") : w += nt(y);
			break;
		case 41:
			v--, w += ")";
			break;
		case 34:
		case 39:
		case 91:
			w += nt(y);
			break;
		case 9:
		case 10:
		case 13:
		case 32:
			if (v > 0) {
				w += Ee(y);
				break;
			}
			w += it(m);
			break;
		case 92:
			w += ot(Ze() - 1, 7);
			continue;
		case 47:
			switch (Xe()) {
				case 42:
				case 47:
					Le(pt(ct(Ye(), Ze()), t, n, c), c), ($e(m || 1) == 5 || $e(Xe() || 1) == 5) && Fe(w) && Pe(w, -1, void 0) !== " " && (w += " ");
					break;
				default: w += "/";
			}
			break;
		case 123 * h: s[l++] = Fe(w) * _;
		case 125 * h:
		case 59:
		case 0:
			if (v > 0 && y) {
				w += Ee(y);
				break;
			}
			switch (y) {
				case 0:
				case 125: g = 0;
				case 59 + u:
					_ == -1 && (w = je(w, /\f/g, "")), p > 0 && (Fe(w) - d || h === 0) && Le(p > 32 ? mt(w + ";", r, n, d - 1, c) : mt(je(w, " ", "") + ";", r, n, d - 2, c), c);
					break;
				case 59: w += ";";
				default: if (Le(C = ft(w, t, n, l, u, i, s, b, x = [], S = [], d, a), a), y === 123) {
					if (u === 0) dt(w, t, C, C, x, a, d, s, S);
					else {
						switch (f) {
							case 99: if (Ne(w, 3) === 110) break;
							case 108: if (Ne(w, 2) === 97) break;
							default: u = 0;
							case 100:
							case 109:
							case 115:
						}
						u ? dt(e, C, C, r && Le(ft(e, C, C, 0, 0, i, s, b, i, x = [], d, S), S), i, S, d, s, r ? x : S) : dt(w, C, C, C, [""], S, 0, s, S);
					}
				}
			}
			l = u = p = 0, h = _ = 1, b = w = "", d = o;
			break;
		case 58: d = 1 + Fe(w), p = m;
		default:
			if (h < 1) {
				if (y == 123) --h;
				else if (y == 125 && h++ == 0 && Je() == 125) continue;
			}
			switch (w += Ee(y), y * h) {
				case 38:
					_ = u > 0 ? 1 : (w += "\f", -1);
					break;
				case 44:
					if (v > 0) break;
					s[l++] = (Fe(w) - 1) * _, _ = 1;
					break;
				case 64:
					Xe() === 45 && (w += nt(Ye())), f = Xe(), u = d = Fe(b = w += lt(Ze())), y++;
					break;
				case 45: m === 45 && Fe(w) == 2 && (h = 0);
			}
	}
	return a;
}
function ft(e, t, n, r, i, a, o, s, c, l, u, d) {
	for (var f = i - 1, p = i === 0 ? a : [""], m = Ie(p), h = 0, g = 0, _ = 0; h < r; ++h) for (var v = 0, y = Pe(e, f + 1, f = Te(g = o[h])), b = e; v < m; ++v) (b = ke(g > 0 ? p[v] + " " + y : je(y, /&\f/g, p[v]))) && (c[_++] = b);
	return Ge(e, t, n, i === 0 ? ye : s, c, l, u, d);
}
function pt(e, t, n, r) {
	return Ge(e, t, n, ve, Ee(qe()), Pe(e, 2, -2), 0, r);
}
function mt(e, t, n, r, i) {
	return Ge(e, t, n, be, Pe(e, 0, r), Pe(e, r + 1, -1), r, i);
}
//#endregion
//#region node_modules/stylis/src/Serializer.js
function ht(e, t) {
	for (var n = "", r = 0; r < e.length; r++) n += t(e[r], r, e, t) || "";
	return n;
}
function gt(e, t, n, r) {
	switch (e.type) {
		case we: if (e.children.length) break;
		case k:
		case Se:
		case be: return e.return = e.return || e.value;
		case ve: return "";
		case Ce: return e.return = e.value + "{" + ht(e.children, r) + "}";
		case ye: if (!Fe(e.value = e.props.join(","))) return "";
	}
	return Fe(n = ht(e.children, r)) ? e.return = e.value + "{" + n + "}" : "";
}
//#endregion
//#region node_modules/stylis/src/Middleware.js
function _t(e) {
	var t = Ie(e);
	return function(n, r, i, a) {
		for (var o = "", s = 0; s < t; s++) o += e[s](n, r, i, a) || "";
		return o;
	};
}
function vt(e) {
	return function(t) {
		t.root || (t = t.return) && e(t);
	};
}
//#endregion
//#region node_modules/@griffel/core/src/insertionFactory.js
var yt = () => {
	let e = {};
	return function(t, n) {
		e[t.id] === void 0 && (t.insertCSSRules(n), e[t.id] = !0);
	};
};
//#endregion
//#region node_modules/rtl-css-js/dist/esm/convert-9768a965.js
function bt(e) {
	return e.reduce(function(e, t) {
		var n = t[0], r = t[1];
		return e[n] = r, e[r] = n, e;
	}, {});
}
function xt(e) {
	return typeof e == "boolean";
}
function St(e) {
	return typeof e == "function";
}
function Ct(e) {
	return typeof e == "number";
}
function wt(e) {
	return e == null;
}
function Tt(e) {
	return e && typeof e == "object";
}
function Et(e) {
	return typeof e == "string";
}
function Dt(e, t) {
	return e.indexOf(t) !== -1;
}
function Ot(e) {
	return parseFloat(e) === 0 ? e : e[0] === "-" ? e.slice(1) : "-" + e;
}
function kt(e, t, n, r) {
	return t + Ot(n) + r;
}
function At(e) {
	var t = e.indexOf(".");
	if (t === -1) e = 100 - parseFloat(e) + "%";
	else {
		var n = e.length - t - 2;
		e = 100 - parseFloat(e), e = e.toFixed(n) + "%";
	}
	return e;
}
function jt(e) {
	return e.replace(/ +/g, " ").split(" ").map(function(e) {
		return e.trim();
	}).filter(Boolean).reduce(function(e, t) {
		var n = e.list, r = e.state, i = (t.match(/\(/g) || []).length, a = (t.match(/\)/g) || []).length;
		return r.parensDepth > 0 ? n[n.length - 1] = n[n.length - 1] + " " + t : n.push(t), r.parensDepth += i - a, {
			list: n,
			state: r
		};
	}, {
		list: [],
		state: { parensDepth: 0 }
	}).list;
}
function Mt(e) {
	var t = jt(e);
	if (t.length <= 3 || t.length > 4) return e;
	var n = t[0], r = t[1], i = t[2];
	return [
		n,
		t[3],
		i,
		r
	].join(" ");
}
function Nt(e) {
	return !xt(e) && !wt(e);
}
function Pt(e) {
	for (var t = [], n = 0, r = 0, i = !1; r < e.length;) !i && e[r] === "," ? (t.push(e.substring(n, r).trim()), r++, n = r) : e[r] === "(" ? (i = !0, r++) : (e[r] === ")" && (i = !1), r++);
	return n != r && t.push(e.substring(n, r + 1)), t;
}
var j = {
	padding: function(e) {
		var t = e.value;
		return Ct(t) ? t : Mt(t);
	},
	textShadow: function(e) {
		var t = e.value;
		return Pt(t).map(function(e) {
			return e.replace(/(^|\s)(-*)([.|\d]+)/, function(e, t, n, r) {
				if (r === "0") return e;
				var i = n === "" ? "-" : "";
				return "" + t + i + r;
			});
		}).join(",");
	},
	borderColor: function(e) {
		var t = e.value;
		return Mt(t);
	},
	borderRadius: function(e) {
		var t = e.value;
		if (Ct(t)) return t;
		if (Dt(t, "/")) {
			var n = t.split("/"), r = n[0], i = n[1], a = j.borderRadius({ value: r.trim() }), o = j.borderRadius({ value: i.trim() });
			return a + " / " + o;
		}
		var s = jt(t);
		switch (s.length) {
			case 2: return s.reverse().join(" ");
			case 4:
				var c = s[0], l = s[1], u = s[2];
				return [
					l,
					c,
					s[3],
					u
				].join(" ");
			default: return t;
		}
	},
	background: function(e) {
		var t = e.value, n = e.valuesToConvert, r = e.isRtl, i = e.bgImgDirectionRegex, a = e.bgPosDirectionRegex;
		if (Ct(t)) return t;
		var o = t.replace(/(url\(.*?\))|(rgba?\(.*?\))|(hsl\(.*?\))|(#[a-fA-F0-9]+)|((^| )(\D)+( |$))/g, "").trim();
		return t = t.replace(o, j.backgroundPosition({
			value: o,
			valuesToConvert: n,
			isRtl: r,
			bgPosDirectionRegex: a
		})), j.backgroundImage({
			value: t,
			valuesToConvert: n,
			bgImgDirectionRegex: i
		});
	},
	backgroundImage: function(e) {
		var t = e.value, n = e.valuesToConvert, r = e.bgImgDirectionRegex;
		return !Dt(t, "url(") && !Dt(t, "linear-gradient(") ? t : t.replace(r, function(e, t, r) {
			return e.replace(r, n[r]);
		});
	},
	backgroundPosition: function(e) {
		var t = e.value, n = e.valuesToConvert, r = e.isRtl, i = e.bgPosDirectionRegex;
		return t.replace(r ? /^((-|\d|\.)+%)/ : null, function(e, t) {
			return At(t);
		}).replace(i, function(e) {
			return n[e];
		});
	},
	backgroundPositionX: function(e) {
		var t = e.value, n = e.valuesToConvert, r = e.isRtl, i = e.bgPosDirectionRegex;
		return Ct(t) ? t : j.backgroundPosition({
			value: t,
			valuesToConvert: n,
			isRtl: r,
			bgPosDirectionRegex: i
		});
	},
	transition: function(e) {
		var t = e.value, n = e.propertiesToConvert;
		return t.split(/,\s*/g).map(function(e) {
			var t = e.split(" ");
			return t[0] = n[t[0]] || t[0], t.join(" ");
		}).join(", ");
	},
	transitionProperty: function(e) {
		var t = e.value, n = e.propertiesToConvert;
		return t.split(/,\s*/g).map(function(e) {
			return n[e] || e;
		}).join(", ");
	},
	transform: function(e) {
		var t = e.value, n = "[^\\u0020-\\u007e]", r = "(?:(?:(?:\\[0-9a-f]{1,6})(?:\\r\\n|\\s)?)|\\\\[^\\r\\n\\f0-9a-f])", i = "((?:-?" + ("(?:[0-9]*\\.[0-9]+|[0-9]+)(?:\\s*(?:em|ex|px|cm|mm|in|pt|pc|deg|rad|grad|ms|s|hz|khz|%)|" + ("-?" + ("(?:[_a-z]|" + n + "|" + r + ")") + ("(?:[_a-z0-9-]|" + n + "|" + r + ")") + "*") + ")?") + ")|(?:inherit|auto))", a = RegExp("(translateX\\s*\\(\\s*)" + i + "(\\s*\\))", "gi"), o = RegExp("(translate\\s*\\(\\s*)" + i + "((?:\\s*,\\s*" + i + "){0,1}\\s*\\))", "gi"), s = RegExp("(translate3d\\s*\\(\\s*)" + i + "((?:\\s*,\\s*" + i + "){0,2}\\s*\\))", "gi"), c = RegExp("(rotate[ZY]?\\s*\\(\\s*)" + i + "(\\s*\\))", "gi");
		return t.replace(a, kt).replace(o, kt).replace(s, kt).replace(c, kt);
	}
};
j.objectPosition = j.backgroundPosition, j.margin = j.padding, j.borderWidth = j.padding, j.boxShadow = j.textShadow, j.webkitBoxShadow = j.boxShadow, j.mozBoxShadow = j.boxShadow, j.WebkitBoxShadow = j.boxShadow, j.MozBoxShadow = j.boxShadow, j.borderStyle = j.borderColor, j.webkitTransform = j.transform, j.mozTransform = j.transform, j.WebkitTransform = j.transform, j.MozTransform = j.transform, j.transformOrigin = j.backgroundPosition, j.webkitTransformOrigin = j.transformOrigin, j.mozTransformOrigin = j.transformOrigin, j.WebkitTransformOrigin = j.transformOrigin, j.MozTransformOrigin = j.transformOrigin, j.webkitTransition = j.transition, j.mozTransition = j.transition, j.WebkitTransition = j.transition, j.MozTransition = j.transition, j.webkitTransitionProperty = j.transitionProperty, j.mozTransitionProperty = j.transitionProperty, j.WebkitTransitionProperty = j.transitionProperty, j.MozTransitionProperty = j.transitionProperty, j["text-shadow"] = j.textShadow, j["border-color"] = j.borderColor, j["border-radius"] = j.borderRadius, j["background-image"] = j.backgroundImage, j["background-position"] = j.backgroundPosition, j["background-position-x"] = j.backgroundPositionX, j["object-position"] = j.objectPosition, j["border-width"] = j.padding, j["box-shadow"] = j.textShadow, j["-webkit-box-shadow"] = j.textShadow, j["-moz-box-shadow"] = j.textShadow, j["border-style"] = j.borderColor, j["-webkit-transform"] = j.transform, j["-moz-transform"] = j.transform, j["transform-origin"] = j.transformOrigin, j["-webkit-transform-origin"] = j.transformOrigin, j["-moz-transform-origin"] = j.transformOrigin, j["-webkit-transition"] = j.transition, j["-moz-transition"] = j.transition, j["transition-property"] = j.transitionProperty, j["-webkit-transition-property"] = j.transitionProperty, j["-moz-transition-property"] = j.transitionProperty;
var Ft = bt([
	["paddingLeft", "paddingRight"],
	["marginLeft", "marginRight"],
	["left", "right"],
	["borderLeft", "borderRight"],
	["borderLeftColor", "borderRightColor"],
	["borderLeftStyle", "borderRightStyle"],
	["borderLeftWidth", "borderRightWidth"],
	["borderTopLeftRadius", "borderTopRightRadius"],
	["borderBottomLeftRadius", "borderBottomRightRadius"],
	["padding-left", "padding-right"],
	["margin-left", "margin-right"],
	["border-left", "border-right"],
	["border-left-color", "border-right-color"],
	["border-left-style", "border-right-style"],
	["border-left-width", "border-right-width"],
	["border-top-left-radius", "border-top-right-radius"],
	["border-bottom-left-radius", "border-bottom-right-radius"]
]), It = ["content"], Lt = bt([
	["ltr", "rtl"],
	["left", "right"],
	["w-resize", "e-resize"],
	["sw-resize", "se-resize"],
	["nw-resize", "ne-resize"]
]), Rt = /* @__PURE__ */ RegExp("(^|\\W|_)((ltr)|(rtl)|(left)|(right))(\\W|_|$)", "g"), zt = /* @__PURE__ */ RegExp("(left)|(right)");
function Bt(e) {
	return Object.keys(e).reduce(function(t, n) {
		var r = e[n];
		if (Et(r) && (r = r.trim()), Dt(It, n)) return t[n] = r, t;
		var i = Vt(n, r), a = i.key;
		return t[a] = i.value, t;
	}, Array.isArray(e) ? [] : {});
}
function Vt(e, t) {
	var n = /\/\*\s?@noflip\s?\*\//.test(t), r = n ? e : Ht(e);
	return {
		key: r,
		value: n ? t : Ut(r, t)
	};
}
function Ht(e) {
	return Ft[e] || e;
}
function Ut(e, t) {
	if (!Nt(t)) return t;
	if (Tt(t)) return Bt(t);
	var n = Ct(t), r = St(t), i = n || r ? t : t.replace(/ !important.*?$/, ""), a = !n && i.length !== t.length, o = j[e], s = o ? o({
		value: i,
		valuesToConvert: Lt,
		propertiesToConvert: Ft,
		isRtl: !0,
		bgImgDirectionRegex: Rt,
		bgPosDirectionRegex: zt
	}) : Lt[i] || i;
	return a ? s + " !important" : s;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/stylis/globalPlugin.js
var Wt = (e) => {
	switch (e.type) {
		case ye:
			if (typeof e.props == "string") return;
			e.props = e.props.map((e) => e.indexOf(":global(") === -1 ? e : rt(e).reduce((e, t, n, r) => {
				if (t === "") return e;
				if (t === ":" && r[n + 1] === "global") {
					let t = r[n + 2].slice(1, -1) + " ";
					return e.unshift(t), r[n + 1] = "", r[n + 2] = "", e;
				}
				return e.push(t), e;
			}, []).join(""));
	}
};
//#endregion
//#region node_modules/@griffel/core/src/runtime/stylis/prefixerPlugin.js
function Gt(e, t, n) {
	switch (Oe(e, t)) {
		case 5103: return _e + "print-" + e + e;
		case 3191:
		case 6645:
		case 3005:
		case 6391:
		case 5879:
		case 5623:
		case 6135:
		case 4599:
		case 4855: return _e + e + e;
		case 4215:
			if (Ne(e, 9) === 102 || Ne(e, t + 1) === 116) return _e + e + e;
			break;
		case 4789: return ge + e + e;
		case 5349:
		case 4246:
		case 6968: return _e + e + ge + e + e;
		case 6187: if (!Ae(e, /grab/)) return je(je(je(e, /(zoom-|grab)/, _e + "$1"), /(image-set)/, _e + "$1"), e, "") + e;
		case 5495:
		case 3959: return je(e, /(image-set\([^]*)/, _e + "$1$`$1");
		case 4095:
		case 3583:
		case 4068:
		case 2532: return je(e, /(.+)-inline(.+)/, _e + "$1$2") + e;
		case 8116:
		case 7059:
		case 5753:
		case 5535:
		case 5445:
		case 5701:
		case 4933:
		case 4677:
		case 5533:
		case 5789:
		case 5021:
		case 4765: if (Fe(e) - 1 - t > 6) switch (Ne(e, t + 1)) {
			case 102: if (Ne(e, t + 3) === 108) return je(e, /(.+:)(.+)-([^]+)/, "$1" + _e + "$2-$3$1" + ge + (Ne(e, t + 3) == 108 ? "$3" : "$2-$3")) + e;
			case 115: return ~Me(e, "stretch") ? Gt(je(e, "stretch", "fill-available"), t, n) + e : e;
		}
	}
	return e;
}
function Kt(e, t, n, r) {
	if (e.length > -1 && !e.return) switch (e.type) {
		case be:
			e.return = Gt(e.value, e.length, n);
			return;
		case ye: if (e.length) return Re(e.props, function(t) {
			switch (Ae(t, /(::plac\w+|:read-\w+)/)) {
				case ":read-only":
				case ":read-write": return ht([Ke(e, { props: [je(t, /:(read-\w+)/, ":" + ge + "$1")] })], r);
				case "::placeholder": return ht([Ke(e, { props: [je(t, /:(plac\w+)/, ":" + _e + "input-$1")] }), Ke(e, { props: [je(t, /:(plac\w+)/, ":" + ge + "$1")] })], r);
			}
			return "";
		});
	}
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/stylis/isAtRuleElement.js
function qt(e) {
	switch (e.type) {
		case "@container":
		case xe:
		case A:
		case we: return !0;
	}
	return !1;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/stylis/sortClassesInAtRulesPlugin.js
var Jt = (e) => {
	qt(e) && Array.isArray(e.children) && e.children.sort((e, t) => e.props[0] > t.props[0] ? 1 : -1);
};
//#endregion
//#region node_modules/@griffel/core/src/runtime/compileCSSRules.js
function Yt() {}
function Xt(e, t) {
	let n = [];
	return ht(ut(e), _t([
		Wt,
		t ? Jt : Yt,
		Kt,
		gt,
		vt((e) => n.push(e))
	])), n;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hyphenateProperty.js
var Zt = /[A-Z]/g, Qt = /^ms-/, M = {};
function $t(e) {
	return "-" + e.toLowerCase();
}
function en(e) {
	if (Object.prototype.hasOwnProperty.call(M, e)) return M[e];
	if (e.substr(0, 2) === "--") return e;
	let t = e.replace(Zt, $t);
	return M[e] = Qt.test(t) ? "-" + t : t;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/normalizeNestedProperty.js
function tn(e) {
	return e.charAt(0) === "&" ? e.slice(1) : e;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/compileAtomicCSSRule.js
var nn = /,( *[^ &])/g;
function rn(e) {
	return "&" + tn(e.replace(nn, ",&$1"));
}
function an(e, t) {
	return t.reduceRight((e, t) => `${rn(t)} { ${e} }`, e);
}
function on(e, t) {
	let { className: n, selectors: r, property: i, rtlClassName: a, rtlProperty: o, rtlValue: s, value: c } = e, { container: l, layer: u, media: d, scope: f, supports: p } = t, m = `.${n}`, h = an(Array.isArray(c) ? `${c.map((e) => `${en(i)}: ${e}`).join(";")};` : `${en(i)}: ${c};`, r), g = f ? `@scope (${m}) ${f} { :scope{${h}} }` : `${m}{${h}}`;
	if (o && a) {
		let e = `.${a}`, t = an(Array.isArray(s) ? `${s.map((e) => `${en(o)}: ${e}`).join(";")};` : `${en(o)}: ${s};`, r);
		g += f ? `@scope (${e}) ${f} { :scope{${t}} }` : `${e}{${t}}`;
	}
	return d && (g = `@media ${d} { ${g} }`), u && (g = `@layer ${u} { ${g} }`), p && (g = `@supports ${p} { ${g} }`), l && (g = `@container ${l} { ${g} }`), Xt(g, !0);
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/cssifyObject.js
function sn(e) {
	let t = "";
	for (let n in e) {
		let r = e[n];
		if (typeof r == "string" || typeof r == "number") t += en(n) + ":" + r + ";";
		else if (Array.isArray(r)) for (let e of r) t += en(n) + ":" + e + ";";
	}
	return t;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/compileKeyframeCSS.js
function cn(e) {
	let t = "";
	for (let n in e) t += `${n}{${sn(e[n])}}`;
	return t;
}
function ln(e, t) {
	let n = `@keyframes ${e} {${t}}`, r = [];
	return ht(ut(n), _t([
		gt,
		Kt,
		vt((e) => r.push(e))
	])), r;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/getStyleBucketName.js
var un = {
	"us-w": "w",
	"us-v": "i",
	nk: "l",
	si: "v",
	cu: "f",
	ve: "h",
	ti: "a"
};
function dn(e, t) {
	if (t.media) return "m";
	if (t.layer || t.supports) return "t";
	if (t.container) return "x";
	if (e.length > 0) {
		let t = e[0].trim();
		if (t.charCodeAt(0) === 58) return un[t.slice(4, 8)] || un[t.slice(3, 5)] || "d";
	}
	return "d";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/shorthands.js
var fn = {
	animation: [-1, [
		"animationDelay",
		"animationDirection",
		"animationDuration",
		"animationFillMode",
		"animationIterationCount",
		"animationName",
		"animationPlayState",
		"animationTimeline",
		"animationTimingFunction"
	]],
	animationRange: [-1, ["animationRangeEnd", "animationRangeStart"]],
	background: [-2, [
		"backgroundAttachment",
		"backgroundClip",
		"backgroundColor",
		"backgroundImage",
		"backgroundOrigin",
		"backgroundPosition",
		"backgroundPositionX",
		"backgroundPositionY",
		"backgroundRepeat",
		"backgroundSize"
	]],
	backgroundPosition: [-1, ["backgroundPositionX", "backgroundPositionY"]],
	border: [-2, [
		"borderBottom",
		"borderBottomColor",
		"borderBottomStyle",
		"borderBottomWidth",
		"borderLeft",
		"borderLeftColor",
		"borderLeftStyle",
		"borderLeftWidth",
		"borderRight",
		"borderRightColor",
		"borderRightStyle",
		"borderRightWidth",
		"borderTop",
		"borderTopColor",
		"borderTopStyle",
		"borderTopWidth"
	]],
	borderBottom: [-1, [
		"borderBottomColor",
		"borderBottomStyle",
		"borderBottomWidth"
	]],
	borderImage: [-1, [
		"borderImageOutset",
		"borderImageRepeat",
		"borderImageSlice",
		"borderImageSource",
		"borderImageWidth"
	]],
	borderLeft: [-1, [
		"borderLeftColor",
		"borderLeftStyle",
		"borderLeftWidth"
	]],
	borderRadius: [-1, [
		"borderBottomLeftRadius",
		"borderBottomRightRadius",
		"borderTopLeftRadius",
		"borderTopRightRadius"
	]],
	borderRight: [-1, [
		"borderRightColor",
		"borderRightStyle",
		"borderRightWidth"
	]],
	borderTop: [-1, [
		"borderTopColor",
		"borderTopStyle",
		"borderTopWidth"
	]],
	caret: [-1, ["caretColor", "caretShape"]],
	columnRule: [-1, [
		"columnRuleColor",
		"columnRuleStyle",
		"columnRuleWidth"
	]],
	columns: [-1, ["columnCount", "columnWidth"]],
	containIntrinsicSize: [-1, ["containIntrinsicHeight", "containIntrinsicWidth"]],
	container: [-1, ["containerName", "containerType"]],
	flex: [-1, [
		"flexBasis",
		"flexGrow",
		"flexShrink"
	]],
	flexFlow: [-1, ["flexDirection", "flexWrap"]],
	font: [-1, [
		"fontFamily",
		"fontSize",
		"fontStretch",
		"fontStyle",
		"fontVariant",
		"fontWeight",
		"lineHeight"
	]],
	gap: [-1, ["columnGap", "rowGap"]],
	grid: [-1, [
		"columnGap",
		"gridAutoColumns",
		"gridAutoFlow",
		"gridAutoRows",
		"gridColumnGap",
		"gridRowGap",
		"gridTemplateAreas",
		"gridTemplateColumns",
		"gridTemplateRows",
		"rowGap"
	]],
	gridArea: [-1, [
		"gridColumnEnd",
		"gridColumnStart",
		"gridRowEnd",
		"gridRowStart"
	]],
	gridColumn: [-1, ["gridColumnEnd", "gridColumnStart"]],
	gridRow: [-1, ["gridRowEnd", "gridRowStart"]],
	gridTemplate: [-1, [
		"gridTemplateAreas",
		"gridTemplateColumns",
		"gridTemplateRows"
	]],
	inset: [-1, [
		"bottom",
		"left",
		"right",
		"top"
	]],
	insetBlock: [-1, ["insetBlockEnd", "insetBlockStart"]],
	insetInline: [-1, ["insetInlineEnd", "insetInlineStart"]],
	listStyle: [-1, [
		"listStyleImage",
		"listStylePosition",
		"listStyleType"
	]],
	margin: [-1, [
		"marginBottom",
		"marginLeft",
		"marginRight",
		"marginTop"
	]],
	marginBlock: [-1, ["marginBlockEnd", "marginBlockStart"]],
	marginInline: [-1, ["marginInlineEnd", "marginInlineStart"]],
	mask: [-1, [
		"maskClip",
		"maskComposite",
		"maskImage",
		"maskMode",
		"maskOrigin",
		"maskPosition",
		"maskRepeat",
		"maskSize"
	]],
	maskBorder: [-1, [
		"maskBorderMode",
		"maskBorderOutset",
		"maskBorderRepeat",
		"maskBorderSlice",
		"maskBorderSource",
		"maskBorderWidth"
	]],
	offset: [-1, [
		"offsetAnchor",
		"offsetDistance",
		"offsetPath",
		"offsetPosition",
		"offsetRotate"
	]],
	outline: [-1, [
		"outlineColor",
		"outlineStyle",
		"outlineWidth"
	]],
	overflow: [-1, ["overflowX", "overflowY"]],
	overscrollBehavior: [-1, ["overscrollBehaviorX", "overscrollBehaviorY"]],
	padding: [-1, [
		"paddingBottom",
		"paddingLeft",
		"paddingRight",
		"paddingTop"
	]],
	paddingBlock: [-1, ["paddingBlockEnd", "paddingBlockStart"]],
	paddingInline: [-1, ["paddingInlineEnd", "paddingInlineStart"]],
	placeContent: [-1, ["alignContent", "justifyContent"]],
	placeItems: [-1, ["alignItems", "justifyItems"]],
	placeSelf: [-1, ["alignSelf", "justifySelf"]],
	positionTry: [-1, ["positionTryFallbacks", "positionTryOrder"]],
	scrollMargin: [-1, [
		"scrollMarginBottom",
		"scrollMarginLeft",
		"scrollMarginRight",
		"scrollMarginTop"
	]],
	scrollMarginBlock: [-1, ["scrollMarginBlockEnd", "scrollMarginBlockStart"]],
	scrollMarginInline: [-1, ["scrollMarginInlineEnd", "scrollMarginInlineStart"]],
	scrollPadding: [-1, [
		"scrollPaddingBottom",
		"scrollPaddingLeft",
		"scrollPaddingRight",
		"scrollPaddingTop"
	]],
	scrollPaddingBlock: [-1, ["scrollPaddingBlockEnd", "scrollPaddingBlockStart"]],
	scrollPaddingInline: [-1, ["scrollPaddingInlineEnd", "scrollPaddingInlineStart"]],
	scrollTimeline: [-1, ["scrollTimelineAxis", "scrollTimelineName"]],
	textDecoration: [-1, [
		"textDecorationColor",
		"textDecorationLine",
		"textDecorationStyle",
		"textDecorationThickness"
	]],
	textEmphasis: [-1, ["textEmphasisColor", "textEmphasisStyle"]],
	textWrap: [-1, ["textWrapMode", "textWrapStyle"]],
	transition: [-1, [
		"transitionBehavior",
		"transitionDelay",
		"transitionDuration",
		"transitionProperty",
		"transitionTimingFunction"
	]],
	viewTimeline: [-1, ["viewTimelineAxis", "viewTimelineName"]]
};
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/generateCombinedMediaQuery.js
function pn(e, t) {
	return e.length === 0 ? t : `${e} and ${t}`;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hashPropertyKey.js
function mn(e, t) {
	return e && t + e;
}
function hn(e) {
	return mn(e.container, "c") + mn(e.media, "m") + mn(e.layer, "l") + mn(e.supports, "s") + mn(e.scope, "o");
}
function gn(e, t, n) {
	let r = D(e + hn(n) + t), i = r.charCodeAt(0);
	return i >= 48 && i <= 57 ? String.fromCharCode(i + 17) + r.slice(1) : r;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hashClassName.js
function _n({ property: e, selector: t, salt: n, value: r }, i) {
	return "f" + D(n + t + hn(i) + e + r.trim());
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isContainerQuerySelector.js
function vn(e) {
	return e.substring(0, 10) === "@container";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isLayerSelector.js
function yn(e) {
	return e.substr(0, 6) === "@layer";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isMediaQuerySelector.js
function bn(e) {
	return e.substr(0, 6) === "@media";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isNestedSelector.js
var xn = /^(:|\[|>|&)/;
function Sn(e) {
	return xn.test(e);
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isObject.js
function Cn(e) {
	return typeof e == "object" && !!e && Array.isArray(e) === !1;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isResetValue.js
function wn(e) {
	return e === E;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isScopeSelector.js
function Tn(e) {
	return e.substring(0, 6) === "@scope";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isSupportQuerySelector.js
function En(e) {
	return e.substr(0, 9) === "@supports";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/trimSelector.js
function Dn(e) {
	return e.replace(/>\s+/g, ">");
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/resolveStyleRules.js
function On(e) {
	return fn[e];
}
function kn(e) {
	return e?.[0] ?? 0;
}
function An(e, t, n, r) {
	e[t] = r ? [n, r] : n;
}
function jn(e, t) {
	return t.length > 0 ? [e, Object.fromEntries(t)] : e;
}
function Mn(e, t, n, r, i, a, o) {
	let s = [];
	o !== 0 && s.push(["p", o]), t === "m" && i && s.push(["m", i]), t === "x" && a && s.push(["x", a]), e[t] ?? (e[t] = []), n && e[t].push(jn(n, s)), r && e[t].push(jn(r, s));
}
function Nn(e, t = "", n = [], r = {
	container: "",
	layer: "",
	media: "",
	supports: "",
	scope: ""
}, i = {}, a = {}, o) {
	for (let s in e) {
		if (T.hasOwnProperty(s)) {
			e[s];
			continue;
		}
		let c = e[s];
		if (c != null) {
			if (wn(c)) An(i, gn(Dn(n.join("")), s, r), 0, void 0);
			else if (typeof c == "string" || typeof c == "number") {
				let e = Dn(n.join("")), l = On(s);
				if (l) {
					let e = l[1];
					Nn(Object.fromEntries(e.map((e) => [e, E])), t, n, r, i, a);
				}
				let u = gn(e, s, r), d = _n({
					value: c.toString(),
					salt: t,
					selector: e,
					property: s
				}, r), f = o && {
					key: s,
					value: o
				} || Vt(s, c), p = f.key !== s || f.value !== c, m = p ? _n({
					value: f.value.toString(),
					property: f.key,
					salt: t,
					selector: e
				}, r) : void 0, h = p ? {
					rtlClassName: m,
					rtlProperty: f.key,
					rtlValue: f.value
				} : void 0, g = dn(n, r), [_, v] = on({
					className: d,
					selectors: n,
					property: s,
					value: c,
					...h
				}, r);
				An(i, u, d, m), Mn(a, g, _, v, r.media, r.container, kn(l));
			} else if (s === "animationName") {
				let e = Array.isArray(c) ? c : [c], o = [], s = [];
				for (let t of e) {
					let e = cn(t), n = cn(Bt(t)), i = "f" + D(e), c, l = ln(i, e), u = [];
					e === n ? c = i : (c = "f" + D(n), u = ln(c, n));
					for (let e = 0; e < l.length; e++) Mn(a, "k", l[e], u[e], r.media, r.container, 0);
					o.push(i), s.push(c);
				}
				Nn({ animationName: o.join(", ") }, t, n, r, i, a, s.join(", "));
			} else if (Array.isArray(c)) {
				if (c.length === 0) continue;
				let e = Dn(n.join("")), o = On(s);
				if (o) {
					let e = o[1];
					Nn(Object.fromEntries(e.map((e) => [e, E])), t, n, r, i, a);
				}
				let l = gn(e, s, r), u = _n({
					value: c.map((e) => (e ?? "").toString()).join(";"),
					salt: t,
					selector: e,
					property: s
				}, r), d = c.map((e) => Vt(s, e));
				if (d.some((e) => e.key !== d[0].key)) continue;
				let f = d[0].key !== s || d.some((e, t) => e.value !== c[t]), p = f ? _n({
					value: d.map((e) => (e?.value ?? "").toString()).join(";"),
					salt: t,
					property: d[0].key,
					selector: e
				}, r) : void 0, m = f ? {
					rtlClassName: p,
					rtlProperty: d[0].key,
					rtlValue: d.map((e) => e.value)
				} : void 0, h = dn(n, r), [g, _] = on({
					className: u,
					selectors: n,
					property: s,
					value: c,
					...m
				}, r);
				An(i, l, u, p), Mn(a, h, g, _, r.media, r.container, kn(o));
			} else if (Cn(c)) {
				if (Sn(s)) Nn(c, t, n.concat(tn(s)), r, i, a);
				else if (bn(s)) {
					let e = pn(r.media, s.slice(6).trim());
					Nn(c, t, n, {
						...r,
						media: e
					}, i, a);
				} else if (yn(s)) {
					let e = (r.layer ? `${r.layer}.` : "") + s.slice(6).trim();
					Nn(c, t, n, {
						...r,
						layer: e
					}, i, a);
				} else if (En(s)) {
					let e = pn(r.supports, s.slice(9).trim());
					Nn(c, t, n, {
						...r,
						supports: e
					}, i, a);
				} else if (vn(s)) {
					let e = s.slice(10).trim();
					Nn(c, t, n, {
						...r,
						container: e
					}, i, a);
				} else if (Tn(s)) {
					if (r.scope) continue;
					let e = s.slice(6).trim();
					if (e === "" || !e.startsWith("to ")) continue;
					Nn(c, t, n, {
						...r,
						scope: e
					}, i, a);
				}
			}
		}
	}
	return [i, a];
}
//#endregion
//#region node_modules/@griffel/core/src/resolveStyleRulesForSlots.js
function Pn(e, t = "") {
	let n = {}, r = {};
	for (let i in e) {
		let a = e[i], [o, s] = Nn(a, t);
		n[i] = o, Object.keys(s).forEach((e) => {
			r[e] = (r[e] || []).concat(s[e]);
		});
	}
	return [n, r];
}
//#endregion
//#region node_modules/@griffel/core/src/makeStyles.js
function Fn(e, t = yt) {
	let n = t(), r = null, i = null, a = null, o = null;
	function s(t) {
		let { dir: s, renderer: c } = t;
		r === null && ([r, i] = Pn(e, c.classNameHashSalt));
		let l = s === "ltr";
		return l ? a === null && (a = re(r, s)) : o === null && (o = re(r, s)), n(c, i), l ? a : o;
	}
	return s;
}
//#endregion
//#region node_modules/@griffel/core/src/__styles.js
function In(e, t, n = yt) {
	let r = n(), i = null, a = null;
	function o(n) {
		let { dir: o, renderer: s } = n, c = o === "ltr";
		return c ? i === null && (i = re(e, o)) : a === null && (a = re(e, o)), r(s, t), c ? i : a;
	}
	return o;
}
//#endregion
//#region node_modules/@griffel/core/src/__resetStyles.js
function Ln(e, t, n, r = yt) {
	let i = r();
	function a(r) {
		let { dir: a, renderer: o } = r, s = a === "ltr" ? e : t || e;
		return i(o, Array.isArray(n) ? { r: n } : n), s;
	}
	return a;
}
//#endregion
//#region node_modules/@griffel/react/src/utils/canUseDOM.js
function Rn() {
	return typeof window < "u" && !!(window.document && window.document.createElement);
}
//#endregion
//#region node_modules/@griffel/react/src/useInsertionEffect.js
var N = /* @__PURE__ */ l(d(), 1), zn = N.useInsertionEffect ? N.useInsertionEffect : void 0, Bn = () => {
	let e = {};
	return function(t, n) {
		zn && Rn() ? zn(() => {
			t.insertCSSRules(n);
		}, [t, n]) : e[t.id] === void 0 && (t.insertCSSRules(n), e[t.id] = !0);
	};
}, Vn = /* @__PURE__ */ s(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), P = /* @__PURE__ */ l((/* @__PURE__ */ s(((e, t) => {
	t.exports = Vn();
})))(), 1), Hn = /*#__PURE__*/ (0, N.createContext)(/*#__PURE__*/ he());
function Un() {
	return (0, N.useContext)(Hn);
}
//#endregion
//#region node_modules/@griffel/react/src/TextDirectionContext.js
var Wn = /*#__PURE__*/ (0, N.createContext)("ltr"), Gn = ({ children: e, dir: t }) => (0, P.jsx)(Wn.Provider, {
	value: t,
	children: e
});
function Kn() {
	return (0, N.useContext)(Wn);
}
//#endregion
//#region node_modules/@griffel/react/src/makeStyles.js
function qn(e) {
	let t = Fn(e, Bn);
	return function() {
		let e = Kn(), n = Un();
		return t({
			dir: e,
			renderer: n
		});
	};
}
//#endregion
//#region node_modules/@griffel/react/src/__styles.js
function F(e, t) {
	let n = In(e, t, Bn);
	return function() {
		let e = Kn(), t = Un();
		return n({
			dir: e,
			renderer: t
		});
	};
}
//#endregion
//#region node_modules/@griffel/react/src/__resetStyles.js
function Jn(e, t, n) {
	let r = Ln(e, t, n, Bn);
	return function() {
		let e = Kn(), t = Un();
		return r({
			dir: e,
			renderer: t
		});
	};
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/createCSSRuleFromTheme.js
var Yn = {
	"<": "\\3C ",
	">": "\\3E "
};
function Xn(e) {
	return e.replace(/[<>]/g, (e) => Yn[e]);
}
function Zn(e, t) {
	let n = Xn(e);
	return t ? `${n} { ${Xn(Object.keys(t).reduce((e, n) => `${e}--${n}: ${t[n]}; `, ""))} }` : `${n} {}`;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/constants.js
var Qn = Symbol.for("fui.slotRenderFunction"), $n = Symbol.for("fui.slotElementType"), er = Symbol.for("fui.slotClassNameProp");
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/slot.js
function tr(e, t) {
	let { defaultProps: n, elementType: r } = t, i = rr(e), a = {
		...n,
		...i,
		[$n]: r,
		[er]: i?.className || n?.className
	};
	return i && typeof i.children == "function" && (a[Qn] = i.children, a.children = n?.children), a;
}
function nr(e, t) {
	if (!(e === null || e === void 0 && !t.renderByDefault)) return tr(e, t);
}
function rr(e) {
	return typeof e == "string" || typeof e == "number" || ir(e) || N.isValidElement(e) ? { children: e } : e;
}
var ir = (e) => typeof e == "object" && !!e && Symbol.iterator in e;
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/isSlot.js
function ar(e) {
	return !!e?.hasOwnProperty($n);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/properties.js
var or = (...e) => {
	let t = {};
	for (let n of e) {
		let e = Array.isArray(n) ? n : Object.keys(n);
		for (let n of e) t[n] = 1;
	}
	return t;
}, sr = or(/* @__PURE__ */ "onAuxClick.onAnimationEnd.onAnimationStart.onCopy.onCut.onPaste.onCompositionEnd.onCompositionStart.onCompositionUpdate.onFocus.onFocusCapture.onBlur.onBlurCapture.onChange.onInput.onSubmit.onLoad.onError.onKeyDown.onKeyDownCapture.onKeyPress.onKeyUp.onAbort.onCanPlay.onCanPlayThrough.onDurationChange.onEmptied.onEncrypted.onEnded.onLoadedData.onLoadedMetadata.onLoadStart.onPause.onPlay.onPlaying.onProgress.onRateChange.onSeeked.onSeeking.onStalled.onSuspend.onTimeUpdate.onVolumeChange.onWaiting.onClick.onClickCapture.onContextMenu.onDoubleClick.onDrag.onDragEnd.onDragEnter.onDragExit.onDragLeave.onDragOver.onDragStart.onDrop.onMouseDown.onMouseDownCapture.onMouseEnter.onMouseLeave.onMouseMove.onMouseOut.onMouseOver.onMouseUp.onMouseUpCapture.onSelect.onTouchCancel.onTouchEnd.onTouchMove.onTouchStart.onScroll.onWheel.onPointerCancel.onPointerDown.onPointerEnter.onPointerLeave.onPointerMove.onPointerOut.onPointerOver.onPointerUp.onGotPointerCapture.onLostPointerCapture".split(".")), cr = or(or([
	"accessKey",
	"children",
	"className",
	"contentEditable",
	"dir",
	"draggable",
	"hidden",
	"htmlFor",
	"id",
	"lang",
	"popover",
	"focusgroup",
	"focusgroupstart",
	"ref",
	"role",
	"style",
	"tabIndex",
	"title",
	"translate",
	"spellCheck",
	"name"
]), sr, or([
	"itemID",
	"itemProp",
	"itemRef",
	"itemScope",
	"itemType"
])), lr = or(cr, ["form"]), ur = or(cr, [
	"height",
	"loop",
	"muted",
	"preload",
	"src",
	"width"
]), dr = or(ur, ["poster"]), fr = or(cr, ["start"]), pr = or(cr, ["value"]), mr = or(cr, [
	"download",
	"href",
	"hrefLang",
	"media",
	"referrerPolicy",
	"rel",
	"target",
	"type"
]), hr = or(cr, ["dateTime"]), gr = or(cr, [
	"autoFocus",
	"disabled",
	"form",
	"formAction",
	"formEncType",
	"formMethod",
	"formNoValidate",
	"formTarget",
	"popoverTarget",
	"popoverTargetAction",
	"type",
	"value"
]), _r = or(gr, /* @__PURE__ */ "accept.alt.autoCorrect.autoCapitalize.autoComplete.checked.dirname.form.height.inputMode.list.max.maxLength.min.minLength.multiple.pattern.placeholder.readOnly.required.src.step.size.type.value.width".split(".")), vr = or(gr, [
	"autoCapitalize",
	"cols",
	"dirname",
	"form",
	"maxLength",
	"placeholder",
	"readOnly",
	"required",
	"rows",
	"wrap"
]), yr = or(gr, [
	"form",
	"multiple",
	"required"
]), br = or(cr, ["selected", "value"]), xr = or(cr, ["cellPadding", "cellSpacing"]), Sr = cr, Cr = or(cr, [
	"colSpan",
	"rowSpan",
	"scope"
]), wr = or(cr, [
	"colSpan",
	"headers",
	"rowSpan",
	"scope"
]), Tr = or(cr, ["span"]), Er = or(cr, ["span"]), Dr = or(cr, ["disabled", "form"]), Or = or(cr, [
	"acceptCharset",
	"action",
	"encType",
	"encType",
	"method",
	"noValidate",
	"target"
]), kr = or(cr, [
	"allow",
	"allowFullScreen",
	"allowPaymentRequest",
	"allowTransparency",
	"csp",
	"height",
	"importance",
	"referrerPolicy",
	"sandbox",
	"src",
	"srcDoc",
	"width"
]), Ar = or(cr, [
	"alt",
	"crossOrigin",
	"height",
	"loading",
	"src",
	"srcSet",
	"useMap",
	"width"
]), jr = or(cr, [
	"open",
	"onCancel",
	"onClose"
]);
function Mr(e, t, n) {
	let r = Array.isArray(t), i = {}, a = Object.keys(e);
	for (let o of a) (!r && t[o] || r && t.indexOf(o) >= 0 || o.indexOf("data-") === 0 || o.indexOf("aria-") === 0) && (!n || n?.indexOf(o) === -1) && (i[o] = e[o]);
	return i;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/getNativeElementProps.js
var Nr = {
	label: lr,
	audio: ur,
	video: dr,
	ol: fr,
	li: pr,
	a: mr,
	button: gr,
	input: _r,
	textarea: vr,
	select: yr,
	option: br,
	table: xr,
	tr: Sr,
	th: Cr,
	td: wr,
	colGroup: Tr,
	col: Er,
	fieldset: Dr,
	form: Or,
	iframe: kr,
	img: Ar,
	time: hr,
	dialog: jr
};
function Pr(e, t, n) {
	let r = e && Nr[e] || cr;
	return r.as = 1, Mr(t, r, n);
}
var Fr = ({ primarySlotTagName: e, props: t, excludedPropNames: n }) => ({
	root: {
		style: t.style,
		className: t.className
	},
	primary: Pr(e, t, [
		...n || [],
		"style",
		"className"
	])
}), Ir = (e, t, n) => Pr(t.as ?? e, t, n);
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useBrowserTimer.js
function Lr(e, t) {
	let n = N.useRef(void 0), r = N.useCallback((r, i) => (n.current !== void 0 && t(n.current), n.current = e(r, i), n.current), [t, e]), i = N.useCallback(() => {
		n.current !== void 0 && (t(n.current), n.current = void 0);
	}, [t]);
	return N.useEffect(() => i, [i]), [r, i];
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/ThemeContext/ThemeContext.js
var Rr = N.createContext(void 0), zr = Rr.Provider, Br = N.createContext(void 0), Vr = "", Hr = Br.Provider;
function Ur() {
	return N.useContext(Br) ?? Vr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/TooltipVisibilityContext/TooltipContext.js
var Wr = N.createContext(void 0), Gr = {}, Kr = Wr.Provider;
function qr() {
	return N.useContext(Wr) ?? Gr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/ProviderContext/ProviderContext.js
var Jr = N.createContext(void 0), Yr = {
	targetDocument: typeof document == "object" ? document : void 0,
	dir: "ltr"
}, Xr = Jr.Provider;
function Zr() {
	return N.useContext(Jr) ?? Yr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/OverridesContext/OverridesContext.js
var Qr = N.createContext(void 0), $r = Qr.Provider;
function ei() {
	return N.useContext(Qr) ?? {};
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/CustomStyleHooksContext/CustomStyleHooksContext.js
var ti = N.createContext(void 0), ni = () => {}, ri = ti.Provider, ii = (e) => N.useContext(ti)?.[e] ?? ni, ai = N.createContext(void 0);
ai.Provider;
function oi() {
	return N.useContext(ai);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useAnimationFrame.js
var si = (e) => (e(0), 0), ci = (e) => e;
function li() {
	let { targetDocument: e } = Zr(), t = e?.defaultView;
	return Lr(t ? t.requestAnimationFrame : si, t ? t.cancelAnimationFrame : ci);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useControllableState.js
function ui(e) {
	return typeof e == "function";
}
var di = (e) => {
	"use no memo";
	let [t, n] = N.useState(() => e.defaultState === void 0 ? e.initialState : fi(e.defaultState) ? e.defaultState() : e.defaultState), r = N.useRef(e.state);
	N.useEffect(() => {
		r.current = e.state;
	}, [e.state]);
	let i = N.useCallback((e) => {
		ui(e) && e(r.current);
	}, []);
	return pi(e.state) ? [e.state, i] : [t, n];
};
function fi(e) {
	return typeof e == "function";
}
var pi = (e) => {
	let [t] = N.useState(() => e !== void 0);
	return t;
};
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/ssr/canUseDOM.js
function mi() {
	return typeof window < "u" && !!(window.document && window.document.createElement);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/ssr/SSRContext.js
var hi = { current: 0 }, gi = /*#__PURE__*/ N.createContext(void 0);
function _i() {
	return N.useContext(gi) ?? hi;
}
function vi() {
	let e = _i() !== hi, [t, n] = N.useState(e);
	return mi() && e && N.useLayoutEffect(() => {
		n(!1);
	}, []), t;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useIsomorphicLayoutEffect.js
var yi = mi() ? N.useLayoutEffect : N.useEffect, I = (e) => {
	let t = N.useRef(() => {
		throw Error("Cannot call an event handler while rendering");
	});
	return yi(() => {
		t.current = e;
	}, [e]), N.useCallback((...e) => {
		let n = t.current;
		return n(...e);
	}, [t]);
};
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useFirstMount.js
function bi() {
	let e = N.useRef(!0);
	return N.useEffect(() => {
		e.current &&= !1;
	}, []), e.current;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useForceUpdate.js
function xi() {
	return N.useReducer((e) => e + 1, 0)[1];
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useId.js
var Si = N.createContext(void 0);
Si.Provider;
function Ci() {
	return N.useContext(Si) || "";
}
function wi(e = "fui-", t) {
	let n = _i(), r = Ci(), i = N.useId;
	if (i) {
		let n = i(), a = N.useMemo(() => n.replace(/:/g, ""), [n]);
		return t || `${r}${e}${a}`;
	}
	return N.useMemo(() => t || `${r}${e}${++n.current}`, [
		r,
		e,
		t,
		n
	]);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useMergedRefs.js
function Ti(...e) {
	let t = N.useCallback((n) => {
		t.current = n;
		for (let t of e) typeof t == "function" ? t(n) : t && (t.current = n);
	}, [...e]);
	return t;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useOnClickOutside.js
var Ei = (e, t) => !!e?.contains(t), Di = (e) => {
	let { targetDocument: t } = Zr(), n = t?.defaultView, { refs: r, callback: i, element: a, disabled: o, disabledFocusOnIframe: s, contains: c = Ei } = e, l = N.useRef(void 0);
	Ai({
		element: a,
		disabled: s || o,
		callback: i,
		refs: r,
		contains: c
	});
	let u = N.useRef(!1), d = I((e) => {
		if (u.current) {
			u.current = !1;
			return;
		}
		let t = e.composedPath()[0];
		r.every((e) => !c(e.current || null, t)) && !o && i(e);
	}), f = I((e) => {
		u.current = r.some((t) => c(t.current || null, e.target));
	});
	N.useEffect(() => {
		if (o) return;
		let e = Oi(n), t = (t) => {
			t === e ? e = void 0 : d(t);
		};
		return a?.addEventListener("click", t, !0), a?.addEventListener("touchstart", t, !0), a?.addEventListener("contextmenu", t, !0), a?.addEventListener("mousedown", f, !0), l.current = n?.setTimeout(() => {
			e = void 0;
		}, 1), () => {
			a?.removeEventListener("click", t, !0), a?.removeEventListener("touchstart", t, !0), a?.removeEventListener("contextmenu", t, !0), a?.removeEventListener("mousedown", f, !0), n?.clearTimeout(l.current), e = void 0;
		};
	}, [
		d,
		a,
		o,
		f,
		n
	]);
}, Oi = (e) => {
	if (e) return typeof e.window == "object" && e.window === e ? e.event : e.ownerDocument?.defaultView?.event ?? void 0;
}, ki = "fuiframefocus", Ai = (e) => {
	let { disabled: t, element: n, callback: r, contains: i = Ei, pollDuration: a = 100, refs: o } = e, s = N.useRef(void 0), c = I((e) => {
		o.every((t) => !i(t.current || null, e.target)) && !t && r(e);
	});
	N.useEffect(() => {
		if (!t) return n?.addEventListener(ki, c, !0), () => {
			n?.removeEventListener(ki, c, !0);
		};
	}, [
		n,
		t,
		c
	]), N.useEffect(() => {
		if (!t) return s.current = n?.defaultView?.setInterval(() => {
			let e = n?.activeElement;
			if (e?.tagName === "IFRAME" || e?.tagName === "WEBVIEW") {
				let t = new CustomEvent(ki, { bubbles: !0 });
				e.dispatchEvent(t);
			}
		}, a), () => {
			var e;
			n == null || (e = n.defaultView) == null || e.clearInterval(s.current);
		};
	}, [
		n,
		t,
		a
	]);
}, ji = (e) => {
	let { refs: t, callback: n, element: r, disabled: i, contains: a } = e, o = I((e) => {
		let r = a || ((e, t) => !!e?.contains(t)), o = e.composedPath()[0];
		t.every((e) => !r(e.current || null, o)) && !i && n(e);
	});
	N.useEffect(() => {
		if (!i) return r?.addEventListener("wheel", o), r?.addEventListener("touchmove", o), () => {
			r?.removeEventListener("wheel", o), r?.removeEventListener("touchmove", o);
		};
	}, [
		o,
		r,
		i
	]);
}, Mi = (e) => -1, Ni = (e) => void 0;
function Pi() {
	let { targetDocument: e } = Zr(), t = e?.defaultView;
	return Lr(t ? t.setTimeout : Mi, t ? t.clearTimeout : Ni);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/clamp.js
var Fi = (e, t, n) => Math.max(t, Math.min(n, e || 0)), Ii = !0;
function Li(e) {
	if (e) return Ii ? e.props.ref : e.ref;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/mergeCallbacks.js
function Ri(e, t) {
	return (...n) => {
		e?.(...n), t?.(...n);
	};
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/isHTMLElement.js
function zi(e, t) {
	let n = e;
	return !!(n != null && n.ownerDocument?.defaultView && n instanceof n.ownerDocument.defaultView[t?.constructorName ?? "HTMLElement"]);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/isFluentTrigger.js
function Bi(e) {
	return !!e.type.isFluentTriggerComponent;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/applyTriggerPropsToChildren.js
function Vi(e, t) {
	return typeof e == "function" ? e(t) : e ? Hi(e, t) : e || null;
}
function Hi(e, t) {
	if (!N.isValidElement(e) || e.type === N.Fragment) throw Error("A trigger element must be a single element for this component. Please ensure that you're not using React Fragments.");
	if (Bi(e)) {
		let n = Hi(e.props.children, t);
		return N.cloneElement(e, void 0, n);
	}
	return N.cloneElement(e, t);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/getTriggerChild.js
function Ui(e) {
	return N.isValidElement(e) ? Bi(e) ? Ui(e.props.children) : e : null;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/isVirtualElement.js
function Wi(e) {
	return e && !!e._virtual;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/getParent.js
function Gi(e) {
	return Wi(e) && e._virtual.parent || null;
}
function Ki(e, t = {}) {
	if (!e) return null;
	if (!t.skipVirtual) {
		let t = Gi(e);
		if (t) return t;
	}
	let n = e.parentNode;
	return n && n.nodeType === 11 ? n.host : n;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/elementContains.js
function qi(e, t) {
	if (!e || !t) return !1;
	if (e === t) return !0;
	{
		let n = /* @__PURE__ */ new WeakSet();
		for (; t;) {
			let r = Ki(t, { skipVirtual: n.has(t) });
			if (n.add(t), r === e) return !0;
			t = r;
		}
	}
	return !1;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/setVirtualParent.js
function Ji(e, t) {
	e && Object.assign(e, { _virtual: { parent: t } });
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/createCompatSlotComponent.js
function Yi(e, t) {
	return {
		...t,
		[$n]: e
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/jsx/createJSX.js
function Xi(e, t) {
	return function(n, r, i, a, o) {
		return ar(r) ? t(Yi(n, r), null, i, a, o) : ar(n) ? t(n, r, i, a, o) : e(n, r, i, a, o);
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/getMetadataFromSlotComponent.js
function Zi(e) {
	let { as: t, [er]: n, [$n]: r, [Qn]: i, ...a } = e, o = a, s = typeof r == "string" ? t ?? r : r;
	return typeof s != "string" && t && (o.as = t), {
		elementType: s,
		props: o,
		renderFunction: i
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/Runtime.js
var Qi = P, $i = (e, t, n) => {
	let { elementType: r, renderFunction: i, props: a } = Zi(e), o = {
		...a,
		...t
	};
	return i ? Qi.jsx(N.Fragment, { children: i(r, o) }, n) : Qi.jsx(r, o, n);
}, ea = (e, t, n) => {
	let { elementType: r, renderFunction: i, props: a } = Zi(e), o = {
		...a,
		...t
	};
	return i ? Qi.jsx(N.Fragment, { children: i(r, {
		...o,
		children: Qi.jsxs(N.Fragment, { children: o.children }, void 0)
	}) }, n) : Qi.jsxs(r, o, n);
}, L = Xi(Qi.jsx, $i), ta = Xi(Qi.jsxs, ea), na = N.createContext(void 0), ra = {}, ia = na.Provider, aa = () => N.useContext(na) ?? ra, oa = (e, t) => /*#__PURE__*/ L(Xr, {
	value: t.provider,
	children: /*#__PURE__*/ L(zr, {
		value: t.theme,
		children: /*#__PURE__*/ L(Hr, {
			value: t.themeClassName,
			children: /*#__PURE__*/ L(ri, {
				value: t.customStyleHooks_unstable,
				children: /*#__PURE__*/ L(Kr, {
					value: t.tooltip,
					children: /*#__PURE__*/ L(Gn, {
						dir: t.textDirection,
						children: /*#__PURE__*/ L(ia, {
							value: t.iconDirection,
							children: /*#__PURE__*/ L($r, {
								value: t.overrides_unstable,
								children: /*#__PURE__*/ ta(e.root, { children: [mi() ? null : /*#__PURE__*/ L("style", {
									dangerouslySetInnerHTML: { __html: e.serverStyleProps.cssRule },
									...e.serverStyleProps.attributes
								}), e.root.children] })
							})
						})
					})
				})
			})
		})
	})
}), R = "data-tabster", sa = "data-tabster-dummy", ca = `:is(${[
	"a[href]",
	"button",
	"input",
	"select",
	"textarea",
	"*[tabindex]",
	"*[contenteditable]",
	"details > summary",
	"audio[controls]",
	"video[controls]"
].join(", ")}):not(:disabled)`, la = {
	EscapeGroupper: 1,
	Restorer: 2,
	Deloser: 3
}, ua = {
	Invisible: 0,
	PartiallyVisible: 1,
	Visible: 2
}, da = {
	Source: 0,
	Target: 1
}, fa = {
	Both: 0,
	Vertical: 1,
	Horizontal: 2,
	Grid: 3,
	GridLinear: 4
}, pa = {
	ArrowUp: 1,
	ArrowDown: 2,
	ArrowLeft: 3,
	ArrowRight: 4,
	PageUp: 5,
	PageDown: 6,
	Home: 7,
	End: 8
}, ma = {
	Auto: 0,
	Inside: 1,
	Outside: 2
};
//#endregion
//#region node_modules/tabster/dist/esm/Instance.js
function ha(e, t) {
	return e.storageEntry(t)?.tabster;
}
function ga(e, t, n) {
	let r = n || e._noop ? void 0 : t.getAttribute(R), i = e.storageEntry(t), a;
	if (r) {
		if (r !== i?.attr?.string) try {
			let e = JSON.parse(r);
			if (typeof e != "object") throw Error(`Value is not a JSON object, got '${r}'.`);
			a = {
				string: r,
				object: e
			};
		} catch {}
		else return;
	} else if (!i) return;
	i ||= e.storageEntry(t, !0), i.tabster || (i.tabster = {});
	let o = i.tabster || {}, s = i.attr?.object || {}, c = a?.object || {};
	for (let n of Object.keys(s)) if (!c[n]) {
		if (n === "root") {
			let t = o[n];
			t && e.root.onRoot(t, !0);
		}
		switch (n) {
			case "deloser":
			case "root":
			case "groupper":
			case "modalizer":
			case "restorer":
			case "mover":
				let r = o[n];
				r && (r.dispose(), delete o[n]);
				break;
			case "observed":
				delete o[n], e.observedElement && e.observedElement.onObservedElementUpdate(t);
				break;
			case "focusable":
			case "outline":
			case "uncontrolled":
			case "sys": delete o[n];
		}
	}
	for (let n of Object.keys(c)) {
		let r = c.sys;
		switch (n) {
			case "root":
				o.root ? o.root.setProps(c.root) : o.root = e.root.createRoot(t, c.root, r), e.root.onRoot(o.root);
				break;
			case "focusable":
				o.focusable = c.focusable;
				break;
			case "observed":
				e.observedElement && (o.observed = c.observed, e.observedElement.onObservedElementUpdate(t));
				break;
			case "uncontrolled":
				o.uncontrolled = c.uncontrolled;
				break;
			case "outline":
				e.outline && (o.outline = c.outline);
				break;
			case "sys":
				o.sys = c.sys;
				break;
			default: {
				let i = e.attrHandlers.get(n);
				i && (o[n] = i(t, o[n], c[n], s?.[n], r));
			}
		}
	}
	a ? i.attr = a : (Object.keys(o).length === 0 && (delete i.tabster, delete i.attr), e.storageEntry(t, !1));
}
//#endregion
//#region node_modules/tabster/node_modules/keyborg/dist/index.js
var _a = (e, t, n) => {
	e.addEventListener(t, n, !0);
}, va = (e, t, n) => {
	e.removeEventListener(t, n, !0);
}, ya = "keyborg:focusin", ba = "keyborg:focusout", xa = 0, Sa = 1, Ca = 2, wa = 3;
function Ta(e) {
	let t = e.focus;
	t.__keyborgNativeFocus ? t.__keyborgNativeFocus.call(e) : e.focus();
}
function Ea(e) {
	let t = e, n = t.document, r = t.HTMLElement.prototype, i = Object.getOwnPropertyDescriptor(r, "focus");
	if (i?.value?.__keyborgNativeFocus) return;
	u.__keyborgNativeFocus = d, u.__keyborgFocusDescriptor = i, Object.defineProperty(r, "focus", {
		configurable: i?.configurable ?? !0,
		enumerable: i?.enumerable ?? !1,
		writable: !0,
		value: u
	});
	let a = /* @__PURE__ */ new Set(), o = (e) => {
		let t = e.target;
		if (!t) return;
		let n = new CustomEvent(ba, {
			cancelable: !0,
			bubbles: !0,
			composed: !0,
			detail: { originalEvent: e }
		});
		t.dispatchEvent(n);
	}, s = (e) => {
		let t = e.target;
		if (!t) return;
		let n = e.composedPath()[0], r = /* @__PURE__ */ new Set();
		for (; n;) n.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? (r.add(n), n = n.host) : n = n.parentNode;
		for (let e of a) {
			let t = e.deref();
			(!t || !r.has(t)) && (a.delete(e), t && (va(t, "focusin", s), va(t, "focusout", o)));
		}
		c(t, e.relatedTarget || void 0);
	}, c = (e, t, n) => {
		let r = e.shadowRoot;
		if (r) {
			for (let e of a) if (e.deref() === r) return;
			_a(r, "focusin", s), _a(r, "focusout", o), a.add(new WeakRef(r));
			return;
		}
		let i = {
			relatedTarget: t,
			originalEvent: n
		}, c = new CustomEvent(ya, {
			cancelable: !0,
			bubbles: !0,
			composed: !0,
			detail: i
		});
		i.isFocusedProgrammatically = e === l[wa]?.deref(), l[wa] = void 0, e.dispatchEvent(c);
	}, l = [
		s,
		o,
		a
	];
	t.__keyborgData = l, _a(n, "focusin", s), _a(n, "focusout", o);
	function u() {
		let e = t.__keyborgData;
		return e && (e[wa] = new WeakRef(this)), d.apply(this, arguments);
	}
	function d() {
		let e = i?.get ? i.get.call(this) : i?.value;
		if (typeof e != "function") throw TypeError("HTMLElement.prototype.focus is not callable");
		return e.apply(this, arguments);
	}
	let f = n.activeElement;
	for (; f && f.shadowRoot;) c(f), f = f.shadowRoot.activeElement;
}
function Da(e) {
	let t = e, n = t.HTMLElement.prototype, r = Object.getOwnPropertyDescriptor(n, "focus")?.value, i = r?.__keyborgFocusDescriptor, a = t.__keyborgData;
	if (a) {
		let e = t.document;
		va(e, "focusin", a[xa]), va(e, "focusout", a[Sa]);
		for (let e of a[Ca]) {
			let t = e.deref();
			t && (va(t, "focusin", a[xa]), va(t, "focusout", a[Sa]));
		}
		a[Ca].clear(), delete t.__keyborgData;
	}
	r?.__keyborgNativeFocus && (i ? Object.defineProperty(n, "focus", i) : delete n.focus);
}
var Oa = 0;
function ka(e) {
	let t = e, n = !1, r, i = () => {
		let e = t?.__keyborg?.refs;
		if (e) for (let t of Object.keys(e)) e[t]._cb.forEach((e) => e(n));
	}, a = (e) => {
		n !== e && (n = e, i());
	}, o = (e) => {
		if (e.key === "Tab") return !0;
		let n = t?.document.activeElement;
		return !n || n.tagName !== "INPUT" && n.tagName !== "TEXTAREA" && !n.isContentEditable;
	}, s = (e) => {
		if (r || n) return;
		let t = e.detail;
		t.relatedTarget && (t.isFocusedProgrammatically || t.isFocusedProgrammatically === void 0 || a(!0));
	}, c = () => {
		t && (r && t.clearTimeout(r), r = t.setTimeout(() => {
			r = void 0;
		}, 1e3)), a(!1);
	}, l = (e) => {
		e.buttons === 0 || e.clientX === 0 && e.clientY === 0 && e.screenX === 0 && e.screenY === 0 || c();
	}, u = (e) => {
		!n && o(e) && a(!0);
	}, d = e.document;
	return _a(d, ya, s), _a(d, "mousedown", l), _a(e, "keydown", u), _a(d, "touchstart", c), _a(d, "touchend", c), _a(d, "touchcancel", c), Ea(e), {
		dispose: () => {
			if (!t) return;
			r &&= (t.clearTimeout(r), void 0), Da(t);
			let e = t.document;
			va(e, ya, s), va(e, "mousedown", l), va(t, "keydown", u), va(e, "touchstart", c), va(e, "touchend", c), va(e, "touchcancel", c), t = void 0;
		},
		get isNavigatingWithKeyboard() {
			return n;
		},
		set isNavigatingWithKeyboard(e) {
			a(e);
		}
	};
}
function Aa(e) {
	let t = e, n = "k" + ++Oa, r = t, i, a = [], o = t.__keyborg;
	i = o ? o.core : ka(t);
	let s = {
		isNavigatingWithKeyboard() {
			return !!i?.isNavigatingWithKeyboard;
		},
		subscribe(e) {
			a.push(e);
		},
		unsubscribe(e) {
			let t = a.indexOf(e);
			t >= 0 && a.splice(t, 1);
		},
		setVal(e) {
			i && (i.isNavigatingWithKeyboard = e);
		},
		_cb: a,
		dispose() {
			let e = r?.__keyborg;
			e?.refs[n] && (delete e.refs[n], Object.keys(e.refs).length === 0 && (e.core.dispose(), delete r.__keyborg)), a.length = 0, i = void 0, r = void 0;
		}
	};
	return o ? o.refs[n] = s : t.__keyborg = {
		core: i,
		refs: { [n]: s }
	}, s;
}
function ja(e) {
	e.dispose();
}
//#endregion
//#region node_modules/tabster/dist/esm/Events.js
var Ma = "tabster:focusin", Na = "tabster:focusout", Pa = "tabster:movefocus", Fa = "tabster:mover:state", Ia = "tabster:mover:movefocus", La = "tabster:mover:memorized-element", Ra = "tabster:restorer:restore-focus", za = "tabster:root:focus", Ba = "tabster:root:blur", Va = typeof CustomEvent < "u" ? CustomEvent : function() {}, Ha = class extends Va {
	constructor(e, t) {
		super(e, {
			bubbles: !0,
			cancelable: !0,
			composed: !0,
			detail: t
		}), this.details = t;
	}
}, Ua = class extends Ha {
	constructor(e) {
		super(Ma, e);
	}
}, Wa = class extends Ha {
	constructor(e) {
		super(Na, e);
	}
}, Ga = class extends Ha {
	constructor(e) {
		super(Pa, e);
	}
}, Ka = class extends Ha {
	constructor(e) {
		super(Fa, e);
	}
}, qa = class extends Ha {
	constructor() {
		super(Ra);
	}
}, Ja = class extends Ha {
	constructor(e) {
		super(za, e);
	}
}, Ya = class extends Ha {
	constructor(e) {
		super(Ba, e);
	}
}, z = {
	createMutationObserver: (e) => new MutationObserver(e),
	createTreeWalker: (e, t, n, r) => e.createTreeWalker(t, n, r),
	getParentNode: (e) => e ? e.parentNode : null,
	getParentElement: (e) => e ? e.parentElement : null,
	nodeContains: (e, t) => !!(t && e?.contains(t)),
	getActiveElement: (e) => e.activeElement,
	querySelector: (e, t) => e.querySelector(t),
	querySelectorAll: (e, t) => Array.prototype.slice.call(e.querySelectorAll(t), 0),
	getElementById: (e, t) => e.getElementById(t),
	getFirstChild: (e) => e?.firstChild || null,
	getLastChild: (e) => e?.lastChild || null,
	getNextSibling: (e) => e?.nextSibling || null,
	getPreviousSibling: (e) => e?.previousSibling || null,
	getFirstElementChild: (e) => e?.firstElementChild || null,
	getLastElementChild: (e) => e?.lastElementChild || null,
	getNextElementSibling: (e) => e?.nextElementSibling || null,
	getPreviousElementSibling: (e) => e?.previousElementSibling || null,
	appendChild: (e, t) => e.appendChild(t),
	insertBefore: (e, t, n) => e.insertBefore(t, n),
	getSelection: (e) => e.ownerDocument?.getSelection() || null,
	getElementsByName: (e, t) => e.ownerDocument.getElementsByName(t)
};
function Xa(e) {
	for (let t of Object.keys(e)) z[t] = e[t];
}
//#endregion
//#region node_modules/tabster/dist/esm/Utils.js
var Za = 0;
function Qa(e) {
	let t = e();
	return t.__tabsterInstanceContext ??= {
		elementByUId: {},
		containerBoundingRectCache: {},
		lastContainerBoundingRectCacheId: 0
	};
}
function $a(e) {
	let t = e, n = t.__tabsterInstanceContext;
	n && (n.elementByUId = {}, n.containerBoundingRectCache = {}, n.containerBoundingRectCacheTimer && e.clearTimeout(n.containerBoundingRectCacheTimer), delete t.__tabsterInstanceContext);
}
function eo(e) {
	return !!e.querySelector(ca);
}
var to = class {
	constructor(e, t) {
		this._ref = new WeakRef(e), this._data = t;
	}
	get() {
		let e = this._ref, t;
		return e && (t = e.deref(), t || delete this._ref), t;
	}
	getData() {
		return this._data;
	}
};
function no(e, t, n) {
	if (t.nodeType === Node.ELEMENT_NODE) return z.createTreeWalker(e, t, NodeFilter.SHOW_ELEMENT, { acceptNode: n });
}
function ro(e, t) {
	let n = t.__tabsterCacheId, r = Qa(e), i = n ? r.containerBoundingRectCache[n] : void 0;
	if (i) return i.rect;
	let a = t.ownerDocument && t.ownerDocument.documentElement;
	if (!a) return new DOMRect();
	let o = 0, s = 0, c = a.clientWidth, l = a.clientHeight;
	if (t !== a) {
		let e = t.getBoundingClientRect();
		o = Math.max(o, e.left), s = Math.max(s, e.top), c = Math.min(c, e.right), l = Math.min(l, e.bottom);
	}
	let u = new DOMRect(o < c ? o : -1, s < l ? s : -1, o < c ? c - o : 0, s < l ? l - s : 0);
	return n || (n = "r-" + ++r.lastContainerBoundingRectCacheId, t.__tabsterCacheId = n), r.containerBoundingRectCache[n] = {
		rect: u,
		element: t
	}, r.containerBoundingRectCacheTimer ||= window.setTimeout(() => {
		r.containerBoundingRectCacheTimer = void 0;
		for (let e of Object.keys(r.containerBoundingRectCache)) delete r.containerBoundingRectCache[e].element.__tabsterCacheId;
		r.containerBoundingRectCache = {};
	}, 50), u;
}
function io(e, t, n) {
	let r = oo(t);
	if (!r) return !1;
	let i = ro(e, r), a = t.getBoundingClientRect(), o = a.height * (1 - n), s = Math.max(0, i.top - a.top) + Math.max(0, a.bottom - i.bottom);
	return s === 0 || s <= o;
}
function ao(e, t, n) {
	let r = oo(t);
	if (r) {
		let i = ro(e, r), a = t.getBoundingClientRect();
		n ? r.scrollTop += a.top - i.top : r.scrollTop += a.bottom - i.bottom;
	}
}
function oo(e) {
	let t = e.ownerDocument;
	if (t) {
		for (let t = z.getParentElement(e); t; t = z.getParentElement(t)) if (t.scrollWidth > t.clientWidth || t.scrollHeight > t.clientHeight) return t;
		return t.documentElement;
	}
	return null;
}
function so(e) {
	e.__shouldIgnoreFocus = !0;
}
function co(e) {
	return !!e.__shouldIgnoreFocus;
}
function lo(e) {
	let t = /* @__PURE__ */ new Uint32Array(4);
	return e.crypto.getRandomValues(t), Array.from(t, (e) => e.toString(36)).join("") + "|" + (++Za).toString(36) + "|" + Date.now().toString(36);
}
function uo(e, t) {
	let n = Qa(e), r = t.__tabsterElementUID ??= lo(e());
	return !n.elementByUId[r] && po(t.ownerDocument, t) && (n.elementByUId[r] = new to(t)), r;
}
function fo(e, t) {
	let n = Qa(e).elementByUId;
	for (let e of Object.keys(n)) {
		let r = n[e]?.get();
		t && r && !z.nodeContains(t, r) || delete n[e];
	}
}
function po(e, t) {
	return z.nodeContains(e?.body, t);
}
function mo(e, t) {
	return typeof e.matches == "function" && e.matches(t);
}
var ho = 0, go = class {
	constructor(e, t, n) {
		this._tabster = e, this._element = new to(t), this._props = { ...n }, this.id = "i" + ++ho;
	}
	getElement() {
		return this._element.get();
	}
	getProps() {
		return this._props;
	}
	setProps(e) {
		this._props = { ...e };
	}
};
function _o(e) {
	let t = null;
	for (let n = z.getLastElementChild(e); n; n = z.getLastElementChild(n)) t = n;
	return t || void 0;
}
function vo(e) {
	let t = e.ownerDocument, n = t.defaultView?.getComputedStyle(e);
	return e.offsetParent === null && t.body !== e && n?.position !== "fixed" || n?.visibility === "hidden" || n?.position === "fixed" && (n.display === "none" || e.parentElement?.offsetParent === null && t.body !== e.parentElement);
}
function yo(e) {
	return e.tagName === "INPUT" && !!e.name && e.type === "radio";
}
function bo(e) {
	if (!yo(e)) return;
	let t = e.name, n = [], r;
	for (let i of z.getElementsByName(e, t)) if (yo(i)) {
		let e = i;
		n.push(e), e.checked && (r = e);
	}
	return {
		name: t,
		buttons: new Set(n),
		checked: r
	};
}
function xo(e, t, n, r) {
	e?.addEventListener(t, n, r);
}
function So(e, t, n, r) {
	e?.removeEventListener(t, n, r);
}
function Co(e, t) {
	return !!e && e.dispatchEvent(t);
}
//#endregion
//#region node_modules/tabster/dist/esm/DummyInput.js
var wo = 100, To = class {
	constructor(e, t, n, r, i) {
		this._focusIn = (e) => {
			if (this._fixedTarget) {
				let e = this._fixedTarget.get();
				e && Ta(e);
				return;
			}
			let t = this.input;
			if (this.onFocusIn && t) {
				let n = e.relatedTarget;
				this.onFocusIn(this, this._isBackward(!0, t, n), n);
			}
		}, this._focusOut = (e) => {
			if (this._fixedTarget) return;
			this.useDefaultAction = !1;
			let t = this.input;
			if (this.onFocusOut && t) {
				let n = e.relatedTarget;
				this.onFocusOut(this, this._isBackward(!1, t, n), n);
			}
		};
		let a = e(), o = a.document.createElement("i");
		o.tabIndex = 0, o.setAttribute("role", "none"), o.setAttribute(sa, ""), o.setAttribute("aria-hidden", "true");
		let s = o.style;
		s.position = "fixed", s.width = s.height = "1px", s.opacity = "0.001", s.zIndex = "-1", s.setProperty("content-visibility", "hidden"), so(o), this.input = o, this.isFirst = n.isFirst, this.isOutside = t, this._isPhantom = n.isPhantom ?? !1, this._fixedTarget = i, xo(o, "focusin", this._focusIn), xo(o, "focusout", this._focusOut), o.__tabsterDummyContainer = r, this._isPhantom && (this._disposeTimer = a.setTimeout(() => {
			delete this._disposeTimer, this.dispose();
		}, 0), this._clearDisposeTimeout = () => {
			this._disposeTimer && (a.clearTimeout(this._disposeTimer), delete this._disposeTimer), delete this._clearDisposeTimeout;
		});
	}
	dispose() {
		this._clearDisposeTimeout && this._clearDisposeTimeout();
		let e = this.input;
		e && (delete this._fixedTarget, delete this.onFocusIn, delete this.onFocusOut, delete this.input, So(e, "focusin", this._focusIn), So(e, "focusout", this._focusOut), delete e.__tabsterDummyContainer, z.getParentNode(e)?.removeChild(e));
	}
	setTopLeft(e, t) {
		let n = this.input?.style;
		n && (n.top = `${e}px`, n.left = `${t}px`);
	}
	_isBackward(e, t, n) {
		return e && !n ? !this.isFirst : !!(n && t.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING);
	}
}, Eo = {
	Root: 1,
	Modalizer: 2,
	Mover: 3,
	Groupper: 4
}, Do = class {
	constructor(e, t, n, r, i, a) {
		this._element = t, this._instance = new ko(e, t, this, n, r, i, a);
	}
	_setHandlers(e, t) {
		this._onFocusIn = e, this._onFocusOut = t;
	}
	moveOut(e) {
		this._instance?.moveOut(e);
	}
	moveOutWithDefaultAction(e, t) {
		this._instance?.moveOutWithDefaultAction(e, t);
	}
	getHandler(e) {
		return e ? this._onFocusIn : this._onFocusOut;
	}
	setTabbable(e) {
		this._instance?.setTabbable(this, e);
	}
	dispose() {
		this._instance && (this._instance.dispose(this), delete this._instance), delete this._onFocusIn, delete this._onFocusOut;
	}
	static moveWithPhantomDummy(e, t, n, r, i) {
		let a = new To(e.getWindow, !0, {
			isPhantom: !0,
			isFirst: !0
		}).input;
		if (a) {
			let o, s;
			if (t.tagName === "BODY") o = t, s = n && r || !n && !r ? z.getFirstElementChild(t) : null;
			else {
				n && (!r || r && !e.focusable.isFocusable(t, !1, !0, !0)) ? (o = t, s = r ? t.firstElementChild : null) : (o = z.getParentElement(t), s = n && r || !n && !r ? t : z.getNextElementSibling(t));
				let i, a;
				do
					i = n && r || !n && !r ? z.getPreviousElementSibling(s) : s, a = Ao(i), a === t ? s = n && r || !n && !r ? i : z.getNextElementSibling(i) : a = null;
				while (a);
			}
			o && Co(o, new Ga({
				by: "root",
				owner: o,
				next: null,
				relatedEvent: i
			})) && (z.insertBefore(o, a, s), Ta(a));
		}
	}
	static addPhantomDummyWithTarget(e, t, n, r) {
		let i = new To(e.getWindow, !0, {
			isPhantom: !0,
			isFirst: !0
		}, void 0, new to(r)).input;
		if (i) {
			let e, r;
			eo(t) && !n ? (e = t, r = z.getFirstElementChild(t)) : (e = z.getParentElement(t), r = n ? t : z.getNextElementSibling(t)), e && z.insertBefore(e, i, r);
		}
	}
}, Oo = class {
	constructor(e) {
		this._updateQueue = /* @__PURE__ */ new Set(), this._lastUpdateQueueTime = 0, this._changedParents = /* @__PURE__ */ new WeakSet(), this._dummyElements = [], this._dummyCallbacks = /* @__PURE__ */ new WeakMap(), this._domChanged = (e) => {
			this._changedParents.has(e) || (this._changedParents.add(e), !this._updateDummyInputsTimer && (this._updateDummyInputsTimer = this._win?.().setTimeout(() => {
				delete this._updateDummyInputsTimer;
				for (let e of this._dummyElements) {
					let t = e.get();
					if (t) {
						let e = this._dummyCallbacks.get(t);
						if (e) {
							let n = z.getParentNode(t);
							(!n || this._changedParents.has(n)) && e();
						}
					}
				}
				this._changedParents = /* @__PURE__ */ new WeakSet();
			}, wo)));
		}, this._win = e;
	}
	add(e, t) {
		!this._dummyCallbacks.has(e) && this._win && (this._dummyElements.push(new to(e)), this._dummyCallbacks.set(e, t), this.domChanged = this._domChanged);
	}
	remove(e) {
		this._dummyElements = this._dummyElements.filter((t) => {
			let n = t.get();
			return n && n !== e;
		}), this._dummyCallbacks.delete(e), this._dummyElements.length === 0 && delete this.domChanged;
	}
	dispose() {
		let e = this._win?.();
		this._updateTimer && (e?.clearTimeout(this._updateTimer), delete this._updateTimer), this._updateDummyInputsTimer && (e?.clearTimeout(this._updateDummyInputsTimer), delete this._updateDummyInputsTimer), this._changedParents = /* @__PURE__ */ new WeakSet(), this._dummyCallbacks = /* @__PURE__ */ new WeakMap(), this._dummyElements = [], this._updateQueue.clear(), delete this.domChanged, delete this._win;
	}
	updatePositions(e) {
		this._win && (this._updateQueue.add(e), this._lastUpdateQueueTime = Date.now(), this._scheduledUpdatePositions());
	}
	_scheduledUpdatePositions() {
		this._updateTimer ||= this._win?.().setTimeout(() => {
			if (delete this._updateTimer, this._lastUpdateQueueTime + wo <= Date.now()) {
				let e = /* @__PURE__ */ new Map(), t = [];
				for (let n of this._updateQueue) t.push(n(e));
				this._updateQueue.clear();
				for (let e of t) e();
				e.clear();
			} else this._scheduledUpdatePositions();
		}, wo);
	}
}, ko = class {
	constructor(e, t, n, r, i, a, o) {
		this._wrappers = [], this._isOutside = !1, this._transformElements = /* @__PURE__ */ new Set(), this._onFocusIn = (e, t, n) => {
			this._onFocus(!0, e, t, n);
		}, this._onFocusOut = (e, t, n) => {
			this._onFocus(!1, e, t, n);
		}, this.moveOut = (e) => {
			let t = this._firstDummy, n = this._lastDummy;
			if (t && n) {
				this._ensurePosition();
				let r = t.input, i = n.input, a = this._element?.get();
				if (r && i && a) {
					let t;
					e ? (r.tabIndex = 0, t = r) : (i.tabIndex = 0, t = i), t && Ta(t);
				}
			}
		}, this.moveOutWithDefaultAction = (e, t) => {
			let n = this._firstDummy, r = this._lastDummy;
			if (n && r) {
				this._ensurePosition();
				let i = n.input, a = r.input, o = this._element?.get();
				if (i && a && o) {
					let s;
					e ? !n.isOutside && this._tabster.focusable.isFocusable(o, !0, !0, !0) ? s = o : (n.useDefaultAction = !0, i.tabIndex = 0, s = i) : (r.useDefaultAction = !0, a.tabIndex = 0, s = a), s && Co(o, new Ga({
						by: "root",
						owner: o,
						next: null,
						relatedEvent: t
					})) && Ta(s);
				}
			}
		}, this.setTabbable = (e, t) => {
			for (let n of this._wrappers) if (n.manager === e) {
				n.tabbable = t;
				break;
			}
			let n = this._getCurrent();
			if (n) {
				let e = n.tabbable ? 0 : -1, t = this._firstDummy?.input;
				t && (t.tabIndex = e), t = this._lastDummy?.input, t && (t.tabIndex = e);
			}
		}, this._addDummyInputs = () => {
			this._addTimer ||= this._getWindow().setTimeout(() => {
				delete this._addTimer, this._ensurePosition(), this._addTransformOffsets();
			}, 0);
		}, this._addTransformOffsets = () => {
			this._tabster._dummyObserver.updatePositions(this._computeTransformOffsets);
		}, this._computeTransformOffsets = (e) => {
			let t = this._firstDummy?.input || this._lastDummy?.input, n = this._transformElements, r = /* @__PURE__ */ new Set(), i = 0, a = 0, o = this._getWindow();
			for (let s = t; s && s.nodeType === Node.ELEMENT_NODE; s = z.getParentElement(s)) {
				let t = e.get(s);
				if (t === void 0) {
					let n = o.getComputedStyle(s).transform;
					n && n !== "none" && (t = {
						scrollTop: s.scrollTop,
						scrollLeft: s.scrollLeft
					}), e.set(s, t || null);
				}
				t && (r.add(s), n.has(s) || xo(s, "scroll", this._addTransformOffsets), i += t.scrollTop, a += t.scrollLeft);
			}
			for (let e of n) r.has(e) || So(e, "scroll", this._addTransformOffsets);
			return this._transformElements = r, () => {
				this._firstDummy?.setTopLeft(i, a), this._lastDummy?.setTopLeft(i, a);
			};
		};
		let s = t.get();
		if (!s) throw Error("No element");
		this._tabster = e, this._getWindow = e.getWindow, this._callForDefaultAction = o;
		let c = s.__tabsterDummy;
		if ((c || this)._wrappers.push({
			manager: n,
			priority: r,
			tabbable: !0
		}), c) return c;
		s.__tabsterDummy = this;
		let l = i?.dummyInputsPosition, u = s.tagName;
		this._isOutside = l ? l === ma.Outside : (a || u === "UL" || u === "OL" || u === "TABLE") && u !== "LI" && u !== "TD" && u !== "TH", this._firstDummy = new To(this._getWindow, this._isOutside, { isFirst: !0 }, t), this._lastDummy = new To(this._getWindow, this._isOutside, { isFirst: !1 }, t);
		let d = this._firstDummy.input;
		d && e._dummyObserver.add(d, this._addDummyInputs), this._firstDummy.onFocusIn = this._onFocusIn, this._firstDummy.onFocusOut = this._onFocusOut, this._lastDummy.onFocusIn = this._onFocusIn, this._lastDummy.onFocusOut = this._onFocusOut, this._element = t, this._addDummyInputs();
	}
	dispose(e, t) {
		if ((this._wrappers = this._wrappers.filter((n) => n.manager !== e && !t)).length === 0) {
			delete (this._element?.get()).__tabsterDummy;
			for (let e of this._transformElements) So(e, "scroll", this._addTransformOffsets);
			this._transformElements.clear();
			let e = this._getWindow();
			this._addTimer && (e.clearTimeout(this._addTimer), delete this._addTimer);
			let t = this._firstDummy?.input;
			t && this._tabster._dummyObserver.remove(t), this._firstDummy?.dispose(), this._lastDummy?.dispose();
		}
	}
	_onFocus(e, t, n, r) {
		let i = this._getCurrent();
		i && (!t.useDefaultAction || this._callForDefaultAction) && i.manager.getHandler(e)?.(t, n, r);
	}
	_getCurrent() {
		return this._wrappers.sort((e, t) => e.tabbable === t.tabbable ? e.priority - t.priority : e.tabbable ? -1 : 1), this._wrappers[0];
	}
	_ensurePosition() {
		let e = this._element?.get(), t = this._firstDummy?.input, n = this._lastDummy?.input;
		if (e && t && n) {
			if (this._isOutside) {
				let r = z.getParentNode(e);
				if (r) {
					let i = z.getNextSibling(e);
					i !== n && z.insertBefore(r, n, i), z.getPreviousElementSibling(e) !== t && z.insertBefore(r, t, e);
				}
			} else {
				z.getLastElementChild(e) !== n && z.appendChild(e, n);
				let r = z.getFirstElementChild(e);
				r && r !== t && r.parentNode && z.insertBefore(r.parentNode, t, r);
			}
		}
	}
};
function Ao(e) {
	return e?.__tabsterDummyContainer?.get() || null;
}
//#endregion
//#region node_modules/tabster/dist/esm/AttributeHelpers.js
function jo(e, t) {
	let n = JSON.stringify(e);
	return t === !0 ? n : { [R]: n };
}
function Mo(e, t) {
	for (let n of Object.keys(t)) {
		let r = t[n];
		r ? e[n] = r : delete e[n];
	}
}
function No(e, t, n) {
	let r;
	if (n) {
		let t = e.getAttribute(R);
		if (t) try {
			r = JSON.parse(t);
		} catch {}
	}
	r ||= {}, Mo(r, t), Object.keys(r).length > 0 ? e.setAttribute(R, jo(r, !0)) : e.removeAttribute(R);
}
//#endregion
//#region node_modules/tabster/dist/esm/Root.js
var Po = class extends Do {
	constructor(e, t, n, r) {
		super(e, t, Eo.Root, r, void 0, !0), this._onDummyInputFocus = (e) => {
			if (e.useDefaultAction) this._setFocused(!1);
			else {
				this._tabster.keyboardNavigation.setNavigatingWithKeyboard(!0);
				let t = this._element.get();
				if (t) {
					this._setFocused(!0);
					let n = this._tabster.focusedElement.getFirstOrLastTabbable(e.isFirst, {
						container: t,
						ignoreAccessibility: !0
					});
					if (n) {
						Ta(n);
						return;
					}
				}
				e.input?.blur();
			}
		}, this._setHandlers(this._onDummyInputFocus), this._tabster = e, this._setFocused = n;
	}
}, Fo = class extends go {
	constructor(e, t, n, r, i) {
		super(e, t, r), this._isFocused = !1, this._setFocused = (e) => {
			if (this._setFocusedTimer && (this._tabster.getWindow().clearTimeout(this._setFocusedTimer), delete this._setFocusedTimer), this._isFocused === e) return;
			let t = this._element.get();
			t && (e ? (this._isFocused = !0, this._dummyManager?.setTabbable(!1), Co(t, new Ja({ element: t }))) : this._setFocusedTimer = this._tabster.getWindow().setTimeout(() => {
				delete this._setFocusedTimer, this._isFocused = !1, this._dummyManager?.setTabbable(!0), Co(t, new Ya({ element: t }));
			}, 0));
		}, this._onFocusIn = (e) => {
			let t = this._tabster.getParent, n = this._element.get(), r = e.composedPath()[0];
			do {
				if (r === n) {
					this._setFocused(!0);
					return;
				}
				r &&= t(r);
			} while (r);
		}, this._onFocusOut = () => {
			this._setFocused(!1);
		}, this._onDispose = n;
		let a = e.getWindow;
		this.uid = uo(a, t), this._sys = i, (e.controlTab || e.rootDummyInputs) && this.addDummyInputs();
		let o = a().document;
		xo(o, ya, this._onFocusIn), xo(o, ba, this._onFocusOut), this._add();
	}
	addDummyInputs() {
		this._dummyManager ||= new Po(this._tabster, this._element, this._setFocused, this._sys);
	}
	dispose() {
		this._onDispose(this);
		let e = this._tabster.getWindow(), t = e.document;
		So(t, ya, this._onFocusIn), So(t, ba, this._onFocusOut), this._setFocusedTimer && (e.clearTimeout(this._setFocusedTimer), delete this._setFocusedTimer), this._dummyManager?.dispose(), this._remove();
	}
	moveOutWithDefaultAction(e, t) {
		let n = this._dummyManager;
		if (n) n.moveOutWithDefaultAction(e, t);
		else {
			let n = this.getElement();
			n && Po.moveWithPhantomDummy(this._tabster, n, !0, e, t);
		}
	}
	_add() {}
	_remove() {}
}, Io = class {
	constructor(e, t) {
		this._autoRootWaiting = !1, this._roots = {}, this._forceDummy = !1, this.rootById = {}, this._autoRootCreate = () => {
			let e = this._win().document, t = e.body;
			if (t) {
				this._autoRootUnwait(e);
				let n = this._autoRoot;
				if (n) return No(t, { root: n }, !0), ga(this._tabster, t), ha(this._tabster, t)?.root;
			} else this._autoRootWaiting || (this._autoRootWaiting = !0, xo(e, "readystatechange", this._autoRootCreate));
		}, this._onRootDispose = (e) => {
			delete this._roots[e.id];
		}, this._tabster = e, this._win = e.getWindow, this._autoRoot = t, e.queueInit(() => {
			this._autoRoot && this._autoRootCreate();
		});
	}
	_autoRootUnwait(e) {
		So(e, "readystatechange", this._autoRootCreate), this._autoRootWaiting = !1;
	}
	dispose() {
		let e = this._win();
		this._autoRootUnwait(e.document), delete this._autoRoot, Object.keys(this._roots).forEach((e) => {
			this._roots[e] && (this._roots[e].dispose(), delete this._roots[e]);
		}), this.rootById = {};
	}
	createRoot(e, t, n) {
		let r = new Fo(this._tabster, e, this._onRootDispose, t, n);
		return this._roots[r.id] = r, this._forceDummy && r.addDummyInputs(), r;
	}
	addDummyInputs() {
		this._forceDummy = !0;
		let e = this._roots;
		for (let t of Object.keys(e)) e[t].addDummyInputs();
	}
	static getRootByUId(e, t) {
		let n = e().__tabsterInstance;
		return n && n.root.rootById[t];
	}
	static getTabsterContext(e, t, n = {}) {
		if (!t.ownerDocument) return;
		let { checkRtl: r, referenceElement: i } = n, a = e.getParent;
		e.drainInitQueue();
		let o, s, c, l, u = !1, d, f, p, m, h = i || t, g = {};
		for (; h && (!o || r);) {
			let n = ha(e, h);
			if (r && p === void 0) {
				let e = h.dir;
				e && (p = e.toLowerCase() === "rtl");
			}
			if (!n) {
				h = a(h);
				continue;
			}
			let i = h.tagName;
			(n.uncontrolled || i === "IFRAME" || i === "WEBVIEW") && e.focusable.isVisible(h) && (m = h), !l && n.focusable?.excludeFromMover && !c && (u = !0);
			let _ = n.modalizer, v = n.groupper, y = n.mover;
			!s && _ && (s = _), !c && v && (!s || _) && (s ? (!v.isActive() && v.getProps().tabbability && s.userId !== e.modalizer?.activeId && (s = void 0, c = v), f = v) : c = v), !l && y && (!s || _) && (!v || h !== t) && h.contains(t) && (l = y, d = !!c && c !== v), n.root && (o = n.root), n.focusable?.ignoreKeydown && Object.assign(g, n.focusable.ignoreKeydown), h = a(h);
		}
		if (!o) {
			let n = e.root;
			n._autoRoot && t.ownerDocument?.body && (o = n._autoRootCreate());
		}
		return c && !l && (d = !0), o ? {
			root: o,
			modalizer: s,
			groupper: c,
			mover: l,
			groupperBeforeMover: d,
			modalizerInGroupper: f,
			rtl: r ? !!p : void 0,
			uncontrolled: m,
			excludedFromMover: u,
			ignoreKeydown: (e) => !!g[e.key]
		} : void 0;
	}
	static getRoot(e, t) {
		let n = e.getParent;
		for (let r = t; r; r = n(r)) {
			let t = ha(e, r)?.root;
			if (t) return t;
		}
	}
	onRoot(e, t) {
		t ? delete this.rootById[e.uid] : this.rootById[e.uid] = e;
	}
}, Lo = class {
	constructor(e) {
		this._tabster = e;
	}
	dispose() {}
	getProps(e) {
		let t = ha(this._tabster, e);
		return t && t.focusable || {};
	}
	isFocusable(e, t, n, r) {
		return mo(e, ca) && (t || e.tabIndex !== -1) ? (n || this.isVisible(e)) && (r || this.isAccessible(e)) : !1;
	}
	isVisible(e) {
		if (!e.ownerDocument || e.nodeType !== Node.ELEMENT_NODE || vo(e)) return !1;
		let t = e.ownerDocument.body.getBoundingClientRect();
		return t.width !== 0 || t.height !== 0;
	}
	isAccessible(e) {
		for (let t = e; t; t = z.getParentElement(t)) {
			let e = ha(this._tabster, t);
			if (this._isHidden(t) || !e?.focusable?.ignoreAriaDisabled && this._isDisabled(t)) return !1;
		}
		return !0;
	}
	_isDisabled(e) {
		return e.hasAttribute("disabled");
	}
	_isHidden(e) {
		let t = e.getAttribute("aria-hidden");
		return !(!t || t.toLowerCase() !== "true" || this._tabster.modalizer?.isAugmented(e));
	}
	findFirst(e, t) {
		return this.findElement({ ...e }, t);
	}
	findLast(e, t) {
		return this.findElement({
			isBackward: !0,
			...e
		}, t);
	}
	findNext(e, t) {
		return this.findElement({ ...e }, t);
	}
	findPrev(e, t) {
		return this.findElement({
			...e,
			isBackward: !0
		}, t);
	}
	findDefault(e, t) {
		return this.findElement({
			...e,
			acceptCondition: (t) => this.isFocusable(t, e.includeProgrammaticallyFocusable) && !!this.getProps(t).isDefault
		}, t) || null;
	}
	findAll(e) {
		return this._findElements(!0, e) || [];
	}
	findElement(e, t) {
		let n = this._findElements(!1, e, t);
		return n && n[0];
	}
	_findElements(e, t, n) {
		let { container: r, currentElement: i = null, includeProgrammaticallyFocusable: a, useActiveModalizer: o, ignoreAccessibility: s, modalizerId: c, isBackward: l, onElement: u } = t;
		n ||= {};
		let d = [], { acceptCondition: f } = t, p = !!f;
		if (!r) return null;
		f ||= (e) => this.isFocusable(e, a, !1, s);
		let m = {
			container: r,
			modalizerUserId: c === void 0 && o ? this._tabster.modalizer?.activeId : c || Io.getTabsterContext(this._tabster, r)?.modalizer?.userId,
			from: i || r,
			isBackward: l,
			isFindAll: e,
			acceptCondition: f,
			hasCustomCondition: p,
			includeProgrammaticallyFocusable: a,
			ignoreAccessibility: s,
			cachedGrouppers: {},
			cachedRadioGroups: {}
		}, h = no(r.ownerDocument, r, (e) => this._acceptElement(e, m));
		if (!h) return null;
		let g = (t) => {
			let r = m.foundElement ?? m.foundBackward;
			return r && d.push(r), e ? r && (m.found = !1, delete m.foundElement, delete m.foundBackward, delete m.fromCtx, m.from = r, u && !u(r)) ? !1 : !!(r || t) : (r && n && (n.uncontrolled = Io.getTabsterContext(this._tabster, r)?.uncontrolled), !(!t || r));
		};
		if (i || (n.outOfDOMOrder = !0), i && z.nodeContains(r, i)) h.currentNode = i;
		else if (l) {
			let e = _o(r);
			if (!e) return null;
			if (this._acceptElement(e, m) === NodeFilter.FILTER_ACCEPT && !g(!0)) return m.skippedFocusable && (n.outOfDOMOrder = !0), d;
			h.currentNode = e;
		}
		do
			l ? h.previousNode() : h.nextNode();
		while (g());
		return m.skippedFocusable && (n.outOfDOMOrder = !0), d.length ? d : null;
	}
	_acceptElement(e, t) {
		if (t.found) return NodeFilter.FILTER_ACCEPT;
		let n = t.foundBackward;
		if (n && (e === n || !z.nodeContains(n, e))) return t.found = !0, t.foundElement = n, NodeFilter.FILTER_ACCEPT;
		let r = t.container;
		if (e === r) return NodeFilter.FILTER_SKIP;
		if (!z.nodeContains(r, e) || Ao(e) || z.nodeContains(t.rejectElementsFrom, e)) return NodeFilter.FILTER_REJECT;
		let i = t.currentCtx = Io.getTabsterContext(this._tabster, e);
		if (!i) return NodeFilter.FILTER_SKIP;
		if (co(e)) return this.isFocusable(e, void 0, !0, !0) && (t.skippedFocusable = !0), NodeFilter.FILTER_SKIP;
		if (!t.hasCustomCondition && (e.tagName === "IFRAME" || e.tagName === "WEBVIEW")) return this.isVisible(e) && i.modalizer?.userId === this._tabster.modalizer?.activeId ? (t.found = !0, t.rejectElementsFrom = t.foundElement = e, NodeFilter.FILTER_ACCEPT) : NodeFilter.FILTER_REJECT;
		if (!t.ignoreAccessibility && !this.isAccessible(e)) return this.isFocusable(e, !1, !0, !0) && (t.skippedFocusable = !0), NodeFilter.FILTER_REJECT;
		let a, o = t.fromCtx;
		o ||= t.fromCtx = Io.getTabsterContext(this._tabster, t.from);
		let s = o?.mover, c = i.groupper, l = i.mover;
		if (a = this._tabster.modalizer?.acceptElement(e, t), a !== void 0 && (t.skippedFocusable = !0), a === void 0 && (c || l || s)) {
			let n = c?.getElement(), i = s?.getElement(), o = l?.getElement();
			if (o && z.nodeContains(i, o) && z.nodeContains(r, i) && (!n || !l || z.nodeContains(i, n)) && (l = s, o = i), n) {
				if (n === r || !z.nodeContains(r, n)) c = void 0;
				else if (!z.nodeContains(n, e)) return NodeFilter.FILTER_REJECT;
			}
			if (o) {
				if (!z.nodeContains(r, o)) l = void 0;
				else if (!z.nodeContains(o, e)) return NodeFilter.FILTER_REJECT;
			}
			c && l && (o && n && !z.nodeContains(n, o) ? l = void 0 : c = void 0), c && (a = c.acceptElement(e, t)), l && (a = l.acceptElement(e, t));
		}
		if (a === void 0 && (a = t.acceptCondition(e) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP, a === NodeFilter.FILTER_SKIP && this.isFocusable(e, !1, !0, !0) && (t.skippedFocusable = !0)), a === NodeFilter.FILTER_ACCEPT && !t.found) {
			if (!t.isFindAll && yo(e) && !e.checked) {
				let n = e.name, r = t.cachedRadioGroups[n];
				if (r || (r = bo(e), r && (t.cachedRadioGroups[n] = r)), r?.checked && r.checked !== e) return NodeFilter.FILTER_SKIP;
			}
			t.isBackward ? (t.foundBackward = e, a = NodeFilter.FILTER_SKIP) : (t.found = !0, t.foundElement = e);
		}
		return a;
	}
}, Ro = {
	Tab: "Tab",
	Enter: "Enter",
	Escape: "Escape",
	Space: " ",
	PageUp: "PageUp",
	PageDown: "PageDown",
	End: "End",
	Home: "Home",
	ArrowLeft: "ArrowLeft",
	ArrowUp: "ArrowUp",
	ArrowRight: "ArrowRight",
	ArrowDown: "ArrowDown"
}, zo = class {
	constructor() {
		this._callbacks = [];
	}
	dispose() {
		this._callbacks = [], delete this._val;
	}
	subscribe(e) {
		let t = this._callbacks;
		t.indexOf(e) < 0 && t.push(e);
	}
	subscribeFirst(e) {
		let t = this._callbacks, n = t.indexOf(e);
		n >= 0 && t.splice(n, 1), t.unshift(e);
	}
	unsubscribe(e) {
		let t = this._callbacks.indexOf(e);
		t >= 0 && this._callbacks.splice(t, 1);
	}
	setVal(e, t) {
		this._val !== e && (this._val = e, this._callCallbacks(e, t));
	}
	getVal() {
		return this._val;
	}
	trigger(e, t) {
		this._callCallbacks(e, t);
	}
	_callCallbacks(e, t) {
		this._callbacks.forEach((n) => n(e, t));
	}
};
//#endregion
//#region node_modules/tabster/dist/esm/State/FocusedElement.js
function Bo(e, t) {
	let n = e.getParent, r = t;
	do {
		let t = ha(e, r)?.uncontrolled;
		if (t && e.uncontrolled.isUncontrolledCompletely(r, !!t.completely)) return r;
		r = n(r);
	} while (r);
}
var Vo = {
	[la.Restorer]: 0,
	[la.Deloser]: 1,
	[la.EscapeGroupper]: 2
}, Ho = class e extends zo {
	static {
		this.isTabbing = !1;
	}
	constructor(t, n) {
		super(), this._init = () => {
			let e = this._win(), t = e.document;
			xo(t, ya, this._onFocusIn, !0), xo(t, ba, this._onFocusOut, !0), xo(e, "keydown", this._onKeyDown, !0);
			let n = z.getActiveElement(t);
			n && n !== t.body && this._setFocusedElement(n), this.subscribe(this._onChanged);
		}, this._onFocusIn = (e) => {
			let t = e.composedPath()[0];
			t && this._setFocusedElement(t, e.detail.relatedTarget, e.detail.isFocusedProgrammatically);
		}, this._onFocusOut = (e) => {
			this._setFocusedElement(void 0, e.detail?.originalEvent.relatedTarget);
		}, this._validateFocusedElement = (e) => {}, this._onKeyDown = (t) => {
			if (t.key !== Ro.Tab || t.ctrlKey) return;
			let n = this.getVal();
			if (!n || !n.ownerDocument || n.contentEditable === "true") return;
			let r = this._tabster, i = r.controlTab, a = Io.getTabsterContext(r, n);
			if (!a || a.ignoreKeydown(t)) return;
			let o = t.shiftKey, s = e.findNextTabbable(r, a, void 0, n, void 0, o, !0), c = a.root.getElement();
			if (!c) return;
			let l = s?.element, u = Bo(r, n);
			if (l) {
				let e = s.uncontrolled;
				if (a.uncontrolled || z.nodeContains(e, n)) {
					if (!s.outOfDOMOrder && e === a.uncontrolled || u && !z.nodeContains(u, l)) return;
					Do.addPhantomDummyWithTarget(r, n, o, l);
					return;
				}
				if (e && r.focusable.isVisible(e) || l.tagName === "IFRAME" && r.focusable.isVisible(l)) {
					Co(c, new Ga({
						by: "root",
						owner: c,
						next: l,
						relatedEvent: t
					})) && Do.moveWithPhantomDummy(r, e ?? l, !1, o, t);
					return;
				}
				(i || s?.outOfDOMOrder) && Co(c, new Ga({
					by: "root",
					owner: c,
					next: l,
					relatedEvent: t
				})) && (t.preventDefault(), t.stopImmediatePropagation(), Ta(l));
			} else !u && Co(c, new Ga({
				by: "root",
				owner: c,
				next: null,
				relatedEvent: t
			})) && a.root.moveOutWithDefaultAction(o, t);
		}, this._onChanged = (e, t) => {
			if (e) Co(e, new Ua(t));
			else {
				let e = this._lastVal?.get();
				if (e) {
					let n = { ...t }, r = Io.getTabsterContext(this._tabster, e)?.modalizer?.userId;
					r && (n.modalizerId = r), Co(e, new Wa(n));
				}
			}
		}, this._tabster = t, this._win = n, t.queueInit(this._init);
	}
	dispose() {
		super.dispose();
		let t = this._win(), n = t.document;
		So(n, ya, this._onFocusIn, !0), So(n, ba, this._onFocusOut, !0), So(t, "keydown", this._onKeyDown, !0), this.unsubscribe(this._onChanged);
		let r = this._asyncFocus;
		r && (t.clearTimeout(r.timeout), delete this._asyncFocus), delete e._lastResetElement, delete this._nextVal, delete this._lastVal;
	}
	static forgetMemorized(t, n) {
		let r = e._lastResetElement, i = r && r.get();
		i && z.nodeContains(n, i) && delete e._lastResetElement, i = t._nextVal?.element?.get(), i && z.nodeContains(n, i) && delete t._nextVal, r = t._lastVal, i = r && r.get(), i && z.nodeContains(n, i) && delete t._lastVal;
	}
	getFocusedElement() {
		return this.getVal();
	}
	getLastFocusedElement() {
		let e = this._lastVal?.get();
		return (!e || e && !po(e.ownerDocument, e)) && (this._lastVal = e = void 0), e;
	}
	focus(e, t, n, r) {
		if (!this._tabster.focusable.isFocusable(e, t, !1, n)) return !1;
		let i = typeof r == "boolean" ? { preventScroll: r } : r;
		return e.focus(i), !0;
	}
	focusDefault(e) {
		let t = this._tabster.focusable.findDefault({ container: e });
		return t ? (this._tabster.focusedElement.focus(t), !0) : !1;
	}
	getFirstOrLastTabbable(t, n) {
		let { container: r, ignoreAccessibility: i } = n, a;
		if (r) {
			let n = Io.getTabsterContext(this._tabster, r);
			n && (a = e.findNextTabbable(this._tabster, n, r, void 0, void 0, !t, i)?.element);
		}
		return a && !z.nodeContains(r, a) && (a = void 0), a || void 0;
	}
	_focusFirstOrLast(e, t) {
		let n = this.getFirstOrLastTabbable(e, t);
		return n ? (this.focus(n, !1, !0), !0) : !1;
	}
	focusFirst(e) {
		return this._focusFirstOrLast(!0, e);
	}
	focusLast(e) {
		return this._focusFirstOrLast(!1, e);
	}
	resetFocus(t) {
		if (!this._tabster.focusable.isVisible(t)) return !1;
		if (this._tabster.focusable.isFocusable(t, !0, !0, !0)) this.focus(t);
		else {
			let n = t.getAttribute("tabindex"), r = t.getAttribute("aria-hidden");
			t.tabIndex = -1, t.setAttribute("aria-hidden", "true"), e._lastResetElement = new to(t), this.focus(t, !0, !0), this._setOrRemoveAttribute(t, "tabindex", n), this._setOrRemoveAttribute(t, "aria-hidden", r);
		}
		return !0;
	}
	requestAsyncFocus(e, t, n) {
		let r = this._tabster.getWindow(), i = this._asyncFocus;
		if (i) {
			if (Vo[e] > Vo[i.source]) return;
			r.clearTimeout(i.timeout);
		}
		this._asyncFocus = {
			source: e,
			callback: t,
			timeout: r.setTimeout(() => {
				this._asyncFocus = void 0, t();
			}, n)
		};
	}
	cancelAsyncFocus(e) {
		let t = this._asyncFocus;
		t?.source === e && (this._tabster.getWindow().clearTimeout(t.timeout), this._asyncFocus = void 0);
	}
	_setOrRemoveAttribute(e, t, n) {
		n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
	}
	_setFocusedElement(t, n, r) {
		if (this._tabster._noop) return;
		let i = { relatedTarget: n };
		if (t) {
			let n = e._lastResetElement?.get();
			if (e._lastResetElement = void 0, n === t || co(t)) return;
			i.isFocusedProgrammatically = r;
			let a = Io.getTabsterContext(this._tabster, t)?.modalizer?.userId;
			a && (i.modalizerId = a);
		}
		let a = this._nextVal = {
			element: t ? new to(t) : void 0,
			detail: i
		};
		t && t !== this._val && this._validateFocusedElement(t), this._nextVal === a && this.setVal(t, i), this._nextVal = void 0;
	}
	setVal(e, t) {
		super.setVal(e, t), e && (this._lastVal = new to(e));
	}
	static findNextTabbable(t, n, r, i, a, o, s) {
		let c = r || n.root.getElement();
		if (!c) return null;
		let l = null, u = e._isTabbingTimer, d = t.getWindow();
		u && d.clearTimeout(u), e.isTabbing = !0, e._isTabbingTimer = d.setTimeout(() => {
			delete e._isTabbingTimer, e.isTabbing = !1;
		}, 0);
		let f = n.modalizer, p = n.groupper, m = n.mover, h = (n) => {
			if (l = n.findNextTabbable(i, a, o, s), i && !l?.element) {
				let a = n !== f && z.getParentElement(n.getElement());
				if (a) {
					let c = Io.getTabsterContext(t, i, { referenceElement: a });
					if (c) {
						let i = n.getElement(), u = o ? i : i && _o(i) || i;
						u && (l = e.findNextTabbable(t, c, r, u, a, o, s), l && (l.outOfDOMOrder = !0));
					}
				}
			}
		};
		if (p && m) h(n.groupperBeforeMover ? p : m);
		else if (p) h(p);
		else if (m) h(m);
		else if (f) h(f);
		else {
			let e = {
				container: c,
				currentElement: i,
				referenceElement: a,
				ignoreAccessibility: s,
				useActiveModalizer: !0
			}, n = {};
			l = {
				element: t.focusable[o ? "findPrev" : "findNext"](e, n),
				outOfDOMOrder: n.outOfDOMOrder,
				uncontrolled: n.uncontrolled
			};
		}
		return l;
	}
}, Uo = class extends zo {
	constructor(e) {
		super(), this._onChange = (e) => {
			this.setVal(e, void 0);
		}, this._keyborg = Aa(e()), this._keyborg.subscribe(this._onChange);
	}
	dispose() {
		super.dispose(), this._keyborg && (this._keyborg.unsubscribe(this._onChange), ja(this._keyborg), delete this._keyborg);
	}
	setNavigatingWithKeyboard(e) {
		this._keyborg?.setVal(e);
	}
	isNavigatingWithKeyboard() {
		return !!this._keyborg?.isNavigatingWithKeyboard();
	}
};
//#endregion
//#region node_modules/tabster/dist/esm/MutationEvent.js
function B(e, t, n, r) {
	if (typeof MutationObserver > "u") return () => {};
	let i = t.getWindow, a, o = (e) => {
		let r = /* @__PURE__ */ new Set();
		for (let i of e) {
			let e = i.target, a = i.removedNodes, o = i.addedNodes;
			if (i.type === "attributes") i.attributeName === "data-tabster" && (r.has(e) || n(t, e));
			else {
				for (let n of a) r.add(n), s(n, !0), t._dummyObserver.domChanged?.(e);
				for (let n of o) s(n), t._dummyObserver.domChanged?.(e);
			}
		}
		r.clear(), t.modalizer?.hiddenUpdate();
	};
	function s(t, n) {
		a ||= Qa(i).elementByUId, c(t, n);
		let r = no(e, t, (e) => c(e, n));
		if (r) for (; r.nextNode(););
	}
	function c(e, r) {
		if (!e.getAttribute) return NodeFilter.FILTER_SKIP;
		let i = e.__tabsterElementUID;
		return i && a && (r ? delete a[i] : a[i] ??= new to(e)), (ha(t, e) || e.hasAttribute("data-tabster")) && n(t, e, r), NodeFilter.FILTER_SKIP;
	}
	let l = z.createMutationObserver(o);
	return r && s(i().document.body), l.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: [R]
	}), () => {
		l.disconnect();
	};
}
//#endregion
//#region node_modules/tabster/dist/esm/Uncontrolled.js
var Wo = class {
	constructor(e) {
		this._isUncontrolledCompletely = e;
	}
	isUncontrolledCompletely(e, t) {
		let n = this._isUncontrolledCompletely?.(e, t);
		return n === void 0 ? t : n;
	}
}, Go = [
	"input",
	"textarea",
	"*[contenteditable]"
].join(", "), Ko = class extends Do {
	constructor(e, t, n, r) {
		super(t, e, Eo.Mover, r), this._onFocusDummyInput = (e) => {
			let t = this._element.get(), n = e.input;
			if (t && n) {
				let r = Io.getTabsterContext(this._tabster, t), i;
				r && (i = Ho.findNextTabbable(this._tabster, r, void 0, n, void 0, !e.isFirst, !0)?.element);
				let a = this._getMemorized()?.get();
				a && this._tabster.focusable.isFocusable(a) && (i = a), i && Ta(i);
			}
		}, this._tabster = t, this._getMemorized = n, this._setHandlers(this._onFocusDummyInput);
	}
}, qo = 1, Jo = 2, Yo = 3, Xo = class extends go {
	constructor(e, t, n, r, i) {
		super(e, t, r), this._visible = {}, this._onIntersection = (e) => {
			for (let t of e) {
				let e = t.target, n = uo(this._win, e), r, i = this._fullyVisible;
				if (t.intersectionRatio >= .25 ? (r = t.intersectionRatio >= .75 ? ua.Visible : ua.PartiallyVisible, r === ua.Visible && (i = n)) : r = ua.Invisible, this._visible[n] !== r) {
					r === void 0 ? (delete this._visible[n], i === n && delete this._fullyVisible) : (this._visible[n] = r, this._fullyVisible = i);
					let t = this.getState(e);
					t && Co(e, new Ka(t));
				}
			}
		}, this._win = e.getWindow, this.visibilityTolerance = r.visibilityTolerance ?? .8, (this._props.trackState || this._props.visibilityAware) && (this._intersectionObserver = new IntersectionObserver(this._onIntersection, { threshold: [
			0,
			.25,
			.5,
			.75,
			1
		] }), this._observeState()), this._onDispose = n;
		let a = () => r.memorizeCurrent ? this._current : void 0;
		e.controlTab || (this.dummyManager = new Ko(this._element, e, a, i));
	}
	dispose() {
		this._onDispose(this), this._intersectionObserver && (this._intersectionObserver.disconnect(), delete this._intersectionObserver), delete this._current, delete this._fullyVisible, delete this._allElements, delete this._updateQueue, this._unobserve && (this._unobserve(), delete this._unobserve);
		let e = this._win();
		this._setCurrentTimer && (e.clearTimeout(this._setCurrentTimer), delete this._setCurrentTimer), this._updateTimer && (e.clearTimeout(this._updateTimer), delete this._updateTimer), this.dummyManager?.dispose(), delete this.dummyManager;
	}
	setCurrent(e) {
		this._current = e ? new to(e) : void 0, (this._props.trackState || this._props.visibilityAware) && !this._setCurrentTimer && (this._setCurrentTimer = this._win().setTimeout(() => {
			delete this._setCurrentTimer;
			let e = [];
			this._current !== this._prevCurrent && (e.push(this._current), e.push(this._prevCurrent), this._prevCurrent = this._current);
			for (let t of e) {
				let e = t?.get();
				if (e && this._allElements?.get(e) === this) {
					let t = this._props;
					if (e && (t.visibilityAware !== void 0 || t.trackState)) {
						let t = this.getState(e);
						t && Co(e, new Ka(t));
					}
				}
			}
		}));
	}
	getCurrent() {
		return this._current?.get() || null;
	}
	findNextTabbable(e, t, n, r) {
		let i = this.getElement(), a = i && Ao(e) === i;
		if (!i) return null;
		let o = null, s = !1, c;
		if (this._props.tabbable || a || e && !z.nodeContains(i, e)) {
			let a = {
				currentElement: e,
				referenceElement: t,
				container: i,
				ignoreAccessibility: r,
				useActiveModalizer: !0
			}, l = {};
			o = this._tabster.focusable[n ? "findPrev" : "findNext"](a, l), s = !!l.outOfDOMOrder, c = l.uncontrolled;
		}
		return {
			element: o,
			uncontrolled: c,
			outOfDOMOrder: s
		};
	}
	acceptElement(e, t) {
		if (!Ho.isTabbing) return t.currentCtx?.excludedFromMover ? NodeFilter.FILTER_REJECT : void 0;
		let { memorizeCurrent: n, visibilityAware: r, hasDefault: i = !0 } = this._props, a = this.getElement();
		if (a && (n || r || i) && (!z.nodeContains(a, t.from) || Ao(t.from) === a)) {
			let e;
			if (n) {
				let n = this._current?.get();
				n && t.acceptCondition(n) && (e = n);
			}
			if (!e && i && (e = this._tabster.focusable.findDefault({
				container: a,
				useActiveModalizer: !0
			})), !e && r && (e = this._tabster.focusable.findElement({
				container: a,
				useActiveModalizer: !0,
				isBackward: t.isBackward,
				acceptCondition: (e) => {
					let n = uo(this._win, e), i = this._visible[n];
					return a !== e && !!this._allElements?.get(e) && t.acceptCondition(e) && (i === ua.Visible || i === ua.PartiallyVisible && (r === ua.PartiallyVisible || !this._fullyVisible));
				}
			})), e) return t.found = !0, t.foundElement = e, t.rejectElementsFrom = a, t.skippedFocusable = !0, NodeFilter.FILTER_ACCEPT;
		}
	}
	_observeState() {
		let e = this.getElement();
		if (this._unobserve || !e || typeof MutationObserver > "u") return;
		let t = this._win(), n = this._allElements = /* @__PURE__ */ new WeakMap(), r = this._tabster.focusable, i = this._updateQueue = [], a = z.createMutationObserver((e) => {
			for (let t of e) {
				let e = t.target, n = t.removedNodes, r = t.addedNodes;
				if (t.type === "attributes") t.attributeName === "tabindex" && i.push({
					element: e,
					type: Jo
				});
				else {
					for (let e = 0; e < n.length; e++) i.push({
						element: n[e],
						type: Yo
					});
					for (let e = 0; e < r.length; e++) i.push({
						element: r[e],
						type: qo
					});
				}
			}
			u();
		}), o = (e, t) => {
			let r = n.get(e);
			r && t && (this._intersectionObserver?.unobserve(e), n.delete(e)), !r && !t && (n.set(e, this), this._intersectionObserver?.observe(e));
		}, s = (e) => {
			let t = r.isFocusable(e);
			n.get(e) ? t || o(e, !0) : t && o(e);
		}, c = (e) => {
			let { mover: n } = d(e);
			if (n && n !== this) {
				if (n.getElement() === e && r.isFocusable(e)) o(e);
				else return;
			}
			let i = no(t.document, e, (e) => {
				let { mover: t, groupper: n } = d(e);
				if (t && t !== this) return NodeFilter.FILTER_REJECT;
				let i = n?.getFirst(!0);
				return n && n.getElement() !== e && i && i !== e ? NodeFilter.FILTER_REJECT : (r.isFocusable(e) && o(e), NodeFilter.FILTER_SKIP);
			});
			if (i) for (i.currentNode = e; i.nextNode(););
		}, l = (e) => {
			n.get(e) && o(e, !0);
			for (let t = z.getFirstElementChild(e); t; t = z.getNextElementSibling(t)) l(t);
		}, u = () => {
			!this._updateTimer && i.length && (this._updateTimer = t.setTimeout(() => {
				delete this._updateTimer;
				for (let { element: e, type: t } of i) switch (t) {
					case Jo:
						s(e);
						break;
					case qo:
						c(e);
						break;
					case Yo: l(e);
				}
				i = this._updateQueue = [];
			}, 0));
		}, d = (e) => {
			let t = {};
			for (let n = e; n; n = z.getParentElement(n)) {
				let e = ha(this._tabster, n);
				if (e && (e.groupper && !t.groupper && (t.groupper = e.groupper), e.mover)) {
					t.mover = e.mover;
					break;
				}
			}
			return t;
		};
		i.push({
			element: e,
			type: qo
		}), u(), a.observe(e, {
			childList: !0,
			subtree: !0,
			attributes: !0,
			attributeFilter: ["tabindex"]
		}), this._unobserve = () => {
			a.disconnect();
		};
	}
	getState(e) {
		let t = uo(this._win, e);
		if (t in this._visible) {
			let n = this._visible[t] || ua.Invisible;
			return {
				isCurrent: this._current ? this._current.get() === e : void 0,
				visibility: n
			};
		}
	}
};
function Zo(e, t, n, r, i, a, o, s) {
	let c = n < i ? i - n : o < e ? e - o : 0, l = r < a ? a - r : s < t ? t - s : 0;
	return c === 0 ? l : l === 0 ? c : Math.sqrt(c * c + l * l);
}
var Qo = class {
	constructor(e, t) {
		this._init = () => {
			let e = this._win();
			xo(e, "keydown", this._onKeyDown, !0), xo(e, Ia, this._onMoveFocus), xo(e, La, this._onMemorizedElement), this._tabster.focusedElement.subscribe(this._onFocus);
		}, this._onMoverDispose = (e) => {
			delete this._movers[e.id];
		}, this._onFocus = (e) => {
			let t = e, n = e;
			for (let r = z.getParentElement(e); r; r = z.getParentElement(r)) {
				let e = ha(this._tabster, r)?.mover;
				e && (e.setCurrent(n), t = void 0), !t && this._tabster.focusable.isFocusable(r) && (t = n = r);
			}
		}, this._onKeyDown = async (e) => {
			if (this._ignoredInputTimer && (this._win().clearTimeout(this._ignoredInputTimer), delete this._ignoredInputTimer), this._ignoredInputResolve?.(!1), e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
			let t = e.key, n;
			if (t === Ro.ArrowDown ? n = pa.ArrowDown : t === Ro.ArrowRight ? n = pa.ArrowRight : t === Ro.ArrowUp ? n = pa.ArrowUp : t === Ro.ArrowLeft ? n = pa.ArrowLeft : t === Ro.PageDown ? n = pa.PageDown : t === Ro.PageUp ? n = pa.PageUp : t === Ro.Home ? n = pa.Home : t === Ro.End && (n = pa.End), !n) return;
			let r = this._tabster.focusedElement.getFocusedElement();
			r && !await this._isIgnoredInput(r, t) && this._moveFocus(r, n, e);
		}, this._onMoveFocus = (e) => {
			let t = e.composedPath()[0], n = e.detail?.key;
			t && n !== void 0 && !e.defaultPrevented && (this._moveFocus(t, n), e.stopImmediatePropagation());
		}, this._onMemorizedElement = (e) => {
			let t = e.composedPath()[0], n = e.detail?.memorizedElement;
			if (t) {
				let r = Io.getTabsterContext(this._tabster, t)?.mover;
				r && (n && !z.nodeContains(r.getElement(), n) && (n = void 0), r.setCurrent(n), e.stopImmediatePropagation());
			}
		}, this._tabster = e, this._win = t, this._movers = {}, e.queueInit(this._init);
	}
	dispose() {
		let e = this._win();
		this._tabster.focusedElement.unsubscribe(this._onFocus), this._ignoredInputResolve?.(!1), this._ignoredInputTimer && (e.clearTimeout(this._ignoredInputTimer), delete this._ignoredInputTimer), So(e, "keydown", this._onKeyDown, !0), So(e, Ia, this._onMoveFocus), So(e, La, this._onMemorizedElement), Object.keys(this._movers).forEach((e) => {
			this._movers[e] && (this._movers[e].dispose(), delete this._movers[e]);
		});
	}
	createMover(e, t, n) {
		let r = new Xo(this._tabster, e, this._onMoverDispose, t, n);
		return this._movers[r.id] = r, r;
	}
	moveFocus(e, t) {
		return this._moveFocus(e, t);
	}
	_moveFocus(e, t, n) {
		let r = this._tabster, i = Io.getTabsterContext(r, e, { checkRtl: !0 });
		if (!i || !i.mover || i.excludedFromMover || n && i.ignoreKeydown(n)) return null;
		let a = i.mover, o = a.getElement();
		if (i.groupperBeforeMover) {
			let e = i.groupper;
			if (e && !e.isActive(!0)) {
				for (let t = z.getParentElement(e.getElement()); t && t !== o; t = z.getParentElement(t)) if (ha(r, t)?.groupper?.isActive(!0)) return null;
			} else return null;
		}
		if (!o) return null;
		let s = r.focusable, c = a.getProps(), l = c.direction || fa.Both, u = l === fa.Both, d = u || l === fa.Vertical, f = u || l === fa.Horizontal, p = l === fa.GridLinear, m = p || l === fa.Grid, h = c.cyclic, g, _, v, y = 0, b = 0;
		if (m && (v = e.getBoundingClientRect(), y = Math.ceil(v.left), b = Math.floor(v.right)), i.rtl && (t === pa.ArrowRight ? t = pa.ArrowLeft : t === pa.ArrowLeft && (t = pa.ArrowRight)), t === pa.ArrowDown && d || t === pa.ArrowRight && (f || m)) {
			if (g = s.findNext({
				currentElement: e,
				container: o,
				useActiveModalizer: !0
			}), g && m) {
				let e = Math.ceil(g.getBoundingClientRect().left);
				!p && b > e && (g = void 0);
			} else !g && h && (g = s.findFirst({
				container: o,
				useActiveModalizer: !0
			}));
		} else if (t === pa.ArrowUp && d || t === pa.ArrowLeft && (f || m)) {
			if (g = s.findPrev({
				currentElement: e,
				container: o,
				useActiveModalizer: !0
			}), g && m) {
				let e = Math.floor(g.getBoundingClientRect().right);
				!p && e > y && (g = void 0);
			} else !g && h && (g = s.findLast({
				container: o,
				useActiveModalizer: !0
			}));
		} else if (t === pa.Home) m ? s.findElement({
			container: o,
			currentElement: e,
			useActiveModalizer: !0,
			isBackward: !0,
			acceptCondition: (t) => {
				if (!s.isFocusable(t)) return !1;
				let n = Math.ceil(t.getBoundingClientRect().left ?? 0);
				return t !== e && y <= n || (g = t, !1);
			}
		}) : g = s.findFirst({
			container: o,
			useActiveModalizer: !0
		});
		else if (t === pa.End) m ? s.findElement({
			container: o,
			currentElement: e,
			useActiveModalizer: !0,
			acceptCondition: (t) => {
				if (!s.isFocusable(t)) return !1;
				let n = Math.ceil(t.getBoundingClientRect().left ?? 0);
				return t !== e && y >= n || (g = t, !1);
			}
		}) : g = s.findLast({
			container: o,
			useActiveModalizer: !0
		});
		else if (t === pa.PageUp) {
			if (s.findElement({
				currentElement: e,
				container: o,
				useActiveModalizer: !0,
				isBackward: !0,
				acceptCondition: (e) => s.isFocusable(e) ? !io(this._win, e, a.visibilityTolerance) || (g = e, !1) : !1
			}), m && g) {
				let e = Math.ceil(g.getBoundingClientRect().left);
				s.findElement({
					currentElement: g,
					container: o,
					useActiveModalizer: !0,
					acceptCondition: (t) => {
						if (!s.isFocusable(t)) return !1;
						let n = Math.ceil(t.getBoundingClientRect().left);
						return y < n || e >= n || (g = t, !1);
					}
				});
			}
			_ = !1;
		} else if (t === pa.PageDown) {
			if (s.findElement({
				currentElement: e,
				container: o,
				useActiveModalizer: !0,
				acceptCondition: (e) => s.isFocusable(e) ? !io(this._win, e, a.visibilityTolerance) || (g = e, !1) : !1
			}), m && g) {
				let e = Math.ceil(g.getBoundingClientRect().left);
				s.findElement({
					currentElement: g,
					container: o,
					useActiveModalizer: !0,
					isBackward: !0,
					acceptCondition: (t) => {
						if (!s.isFocusable(t)) return !1;
						let n = Math.ceil(t.getBoundingClientRect().left);
						return y > n || e <= n || (g = t, !1);
					}
				});
			}
			_ = !0;
		} else if (m) {
			let n = t === pa.ArrowUp, r = y, i = Math.ceil(v.top), a = b, c = Math.floor(v.bottom), l, u, d = 0;
			s.findAll({
				container: o,
				currentElement: e,
				isBackward: n,
				onElement: (e) => {
					let t = e.getBoundingClientRect(), o = Math.ceil(t.left), s = Math.ceil(t.top), f = Math.floor(t.right), p = Math.floor(t.bottom);
					if (n && i < p || !n && c > s) return !0;
					let m = Math.ceil(Math.min(a, f)) - Math.floor(Math.max(r, o)), h = Math.ceil(Math.min(a - r, f - o));
					if (m > 0 && h >= m) {
						let t = m / h;
						t > d && (l = e, d = t);
					} else if (d === 0) {
						let t = Zo(r, i, a, c, o, s, f, p);
						(u === void 0 || t < u) && (u = t, l = e);
					} else if (d > 0) return !1;
					return !0;
				}
			}), g = l;
		}
		return g && (!n || n && Co(o, new Ga({
			by: "mover",
			owner: o,
			next: g,
			relatedEvent: n
		}))) ? (_ !== void 0 && ao(this._win, g, _), n && (n.preventDefault(), n.stopImmediatePropagation()), Ta(g), g) : null;
	}
	async _isIgnoredInput(e, t) {
		if (e.getAttribute("aria-expanded") === "true" && (e.hasAttribute("aria-activedescendant") || e.getAttribute("role") === "combobox")) return !0;
		if (mo(e, Go)) {
			let n = 0, r = 0, i = 0, a;
			if (e.tagName === "INPUT" || e.tagName === "TEXTAREA") {
				let a = e.type;
				if (i = (e.value || "").length, a === "email" || a === "number") {
					if (i) {
						let n = z.getSelection(e);
						if (n) {
							let e = n.toString().length, r = t === Ro.ArrowLeft || t === Ro.ArrowUp;
							if (n.modify("extend", r ? "backward" : "forward", "character"), e !== n.toString().length) return n.modify("extend", r ? "forward" : "backward", "character"), !0;
							i = 0;
						}
					}
				} else {
					let t = e.selectionStart;
					if (t === null) return a === "hidden";
					n = t || 0, r = e.selectionEnd || 0;
				}
			} else e.contentEditable === "true" && (a = new Promise((t) => {
				this._ignoredInputResolve = (e) => {
					delete this._ignoredInputResolve, t(e);
				};
				let a = this._win();
				this._ignoredInputTimer && a.clearTimeout(this._ignoredInputTimer);
				let { anchorNode: o, focusNode: s, anchorOffset: c, focusOffset: l } = z.getSelection(e) || {};
				this._ignoredInputTimer = a.setTimeout(() => {
					delete this._ignoredInputTimer;
					let { anchorNode: t, focusNode: a, anchorOffset: u, focusOffset: d } = z.getSelection(e) || {};
					if (t !== o || a !== s || u !== c || d !== l) this._ignoredInputResolve?.(!1);
					else {
						if (n = u || 0, r = d || 0, i = e.textContent?.length || 0, t && a && z.nodeContains(e, t) && z.nodeContains(e, a) && t !== e) {
							let i = !1, o = (e) => {
								if (e === t) i = !0;
								else if (e === a) return !0;
								let s = e.textContent;
								if (s && !z.getFirstChild(e)) {
									let e = s.length;
									i ? a !== t && (r += e) : (n += e, r += e);
								}
								let c = !1;
								for (let t = z.getFirstChild(e); t && !c; t = t.nextSibling) c = o(t);
								return c;
							};
							o(e);
						}
						this._ignoredInputResolve?.(!0);
					}
				}, 0);
			}));
			if (a && !await a || n !== r || n > 0 && (t === Ro.ArrowLeft || t === Ro.ArrowUp || t === Ro.Home) || n < i && (t === Ro.ArrowRight || t === Ro.ArrowDown || t === Ro.End)) return !0;
		}
		return !1;
	}
};
//#endregion
//#region node_modules/tabster/dist/esm/get/getMover.js
function $o(e) {
	let t = e.core;
	if (!t.mover) {
		let e = new Qo(t, t.getWindow);
		t.mover = e, t.attrHandlers.set("mover", (t, n, r, i, a) => n ? (n.setProps(r), n) : e.createMover(t, r, a));
	}
	return t.mover;
}
//#endregion
//#region node_modules/tabster/dist/esm/Restorer.js
var es = class extends go {
	constructor(e, t, n) {
		if (super(e, t, n), this._hasFocus = !1, this._onFocusOut = (e) => {
			let t = this._element?.get();
			t && e.relatedTarget === null && Co(t, new qa()), t && !z.nodeContains(t, e.relatedTarget) && (this._hasFocus = !1);
		}, this._onFocusIn = () => {
			this._hasFocus = !0;
		}, this._props.type === da.Source) {
			let e = this._element?.get();
			xo(e, "focusout", this._onFocusOut), xo(e, "focusin", this._onFocusIn), this._hasFocus = z.nodeContains(e, e && z.getActiveElement(e.ownerDocument));
		}
	}
	dispose() {
		if (this._props.type === da.Source) {
			let e = this._element?.get();
			if (So(e, "focusout", this._onFocusOut), So(e, "focusin", this._onFocusIn), this._hasFocus) {
				let e = this._tabster.getWindow().document;
				Co(e.body, new qa());
			}
		}
	}
}, ts = class e {
	static {
		this.DEPTH = 10;
	}
	constructor(e) {
		this._stack = [], this._getWindow = e;
	}
	push(t) {
		this._stack[this._stack.length - 1]?.get() !== t && (this._stack.length > e.DEPTH && this._stack.shift(), this._stack.push(new to(t)));
	}
	pop(e = () => !0) {
		let t = this._getWindow().document;
		for (let n = this._stack.length - 1; n >= 0; n--) {
			let n = this._stack.pop()?.get();
			if (n && z.nodeContains(t.body, z.getParentElement(n)) && e(n)) return n;
		}
	}
}, ns = class {
	constructor(e) {
		this._onRestoreFocus = (e) => {
			this._focusedElementState.cancelAsyncFocus(la.Restorer);
			let t = e.composedPath()[0];
			if (t) {
				let e = ha(this._tabster, t)?.restorer?.getProps().id;
				this._focusedElementState.requestAsyncFocus(la.Restorer, () => this._restoreFocus(t, e), 0);
			}
		}, this._onFocusIn = (e) => {
			e && ha(this._tabster, e)?.restorer?.getProps().type === da.Target && this._history.push(e);
		}, this._restoreFocus = (e, t) => {
			let n = this._getWindow().document;
			if (z.getActiveElement(n) !== n.body || !this._keyboardNavState.isNavigatingWithKeyboard() && z.nodeContains(n.body, e)) return;
			let r = (e) => {
				let t = ha(this._tabster, e)?.restorer?.getProps();
				return t ? t.id : null;
			};
			this._history.pop((e) => t === r(e))?.focus();
		}, this._tabster = e, this._getWindow = e.getWindow, xo(this._getWindow(), Ra, this._onRestoreFocus), this._history = new ts(this._getWindow), this._keyboardNavState = e.keyboardNavigation, this._focusedElementState = e.focusedElement, this._focusedElementState.subscribe(this._onFocusIn);
	}
	dispose() {
		let e = this._getWindow();
		this._focusedElementState.unsubscribe(this._onFocusIn), this._focusedElementState.cancelAsyncFocus(la.Restorer), So(e, Ra, this._onRestoreFocus);
	}
	createRestorer(e, t) {
		let n = new es(this._tabster, e, t);
		return t.type === da.Target && z.getActiveElement(e.ownerDocument) === e && this._history.push(e), n;
	}
};
//#endregion
//#region node_modules/tabster/dist/esm/get/getRestorer.js
function rs(e) {
	let t = e.core;
	if (!t.restorer) {
		let e = new ns(t);
		t.restorer = e, t.attrHandlers.set("restorer", (t, n, r) => n ? (n.setProps(r), n) : e.createRestorer(t, r));
	}
	return t.restorer;
}
//#endregion
//#region node_modules/tabster/dist/esm/Tabster.js
var is = class {
	constructor(e) {
		this.keyboardNavigation = e.keyboardNavigation, this.focusedElement = e.focusedElement, this.focusable = e.focusable, this.root = e.root, this.uncontrolled = e.uncontrolled, this.core = e;
	}
}, as = class {
	constructor(e, t) {
		this._forgetMemorizedElements = [], this._wrappers = /* @__PURE__ */ new Set(), this._initQueue = [], this._version = "8.8.1", this._noop = !1, this.attrHandlers = /* @__PURE__ */ new Map(), this.getWindow = () => {
			if (!this._win) throw Error("Using disposed Tabster.");
			return this._win;
		}, this._storage = /* @__PURE__ */ new WeakMap(), this._win = e;
		let n = this.getWindow;
		t?.DOMAPI && Xa({ ...t.DOMAPI }), this.keyboardNavigation = new Uo(n), this.focusedElement = new Ho(this, n), this.focusable = new Lo(this), this.root = new Io(this, t?.autoRoot), this.uncontrolled = new Wo(t?.checkUncontrolledCompletely || t?.checkUncontrolledTrappingFocus), this.controlTab = t?.controlTab ?? !0, this.rootDummyInputs = !!t?.rootDummyInputs, this._dummyObserver = new Oo(n), this.getParent = t?.getParent ?? z.getParentNode, this.internal = {
			stopObserver: () => {
				this._unobserve && (this._unobserve(), delete this._unobserve);
			},
			resumeObserver: (e) => {
				if (!this._unobserve) {
					let t = n().document;
					this._unobserve = B(t, this, ga, e);
				}
			}
		}, this.queueInit(() => {
			this.internal.resumeObserver(!0);
		});
	}
	_mergeProps(e) {
		e && (this.getParent = e.getParent ?? this.getParent);
	}
	createTabster(e, t) {
		let n = new is(this);
		return e || this._wrappers.add(n), this._mergeProps(t), n;
	}
	disposeTabster(e, t) {
		t ? this._wrappers.clear() : this._wrappers.delete(e), this._wrappers.size === 0 && this.dispose();
	}
	dispose() {
		this.internal.stopObserver();
		let e = this._win;
		e?.clearTimeout(this._initTimer), delete this._initTimer, this._initQueue = [], this._forgetMemorizedElements = [], e && this._forgetMemorizedTimer && (e.clearTimeout(this._forgetMemorizedTimer), delete this._forgetMemorizedTimer), this.outline?.dispose(), this.crossOrigin?.dispose(), this.deloser?.dispose(), this.groupper?.dispose(), this.mover?.dispose(), this.modalizer?.dispose(), this.observedElement?.dispose(), this.restorer?.dispose(), this.keyboardNavigation.dispose(), this.focusable.dispose(), this.focusedElement.dispose(), this.root.dispose(), this._dummyObserver.dispose(), this.attrHandlers.clear(), fo(this.getWindow), this._storage = /* @__PURE__ */ new WeakMap(), this._wrappers.clear(), e && ($a(e), delete e.__tabsterInstance, delete this._win);
	}
	storageEntry(e, t) {
		let n = this._storage, r = n.get(e);
		return r ? t === !1 && Object.keys(r).length === 0 && n.delete(e) : t === !0 && (r = {}, n.set(e, r)), r;
	}
	forceCleanup() {
		this._win && (this._forgetMemorizedElements.push(this._win.document.body), !this._forgetMemorizedTimer && (this._forgetMemorizedTimer = this._win.setTimeout(() => {
			delete this._forgetMemorizedTimer;
			for (let e = this._forgetMemorizedElements.shift(); e; e = this._forgetMemorizedElements.shift()) fo(this.getWindow, e), Ho.forgetMemorized(this.focusedElement, e);
		}, 0)));
	}
	queueInit(e) {
		this._win && (this._initQueue.push(e), this._initTimer ||= this._win?.setTimeout(() => {
			delete this._initTimer, this.drainInitQueue();
		}, 0));
	}
	drainInitQueue() {
		if (!this._win) return;
		let e = this._initQueue;
		this._initQueue = [], e.forEach((e) => e());
	}
};
function os(e, t) {
	let n = cs(e);
	return n ? n.createTabster(!1, t) : (n = new as(e, t), e.__tabsterInstance = n, n.createTabster());
}
function ss(e, t) {
	e.core.disposeTabster(e, t);
}
function cs(e) {
	return e.__tabsterInstance;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useTabster.js
var ls = (e) => e;
function us(e) {
	let t = e?.defaultView || void 0, n = t?.__tabsterShadowDOMAPI;
	if (t) return os(t, {
		autoRoot: {},
		controlTab: !1,
		getParent: Ki,
		checkUncontrolledCompletely: (e) => e.firstElementChild?.hasAttribute("data-is-focus-trap-zone-bumper") === !0 || void 0,
		DOMAPI: n
	});
}
function ds(e = ls) {
	let { targetDocument: t } = Zr(), n = N.useRef(null);
	return yi(() => {
		let r = us(t);
		if (r) return n.current = e(r), () => {
			ss(r), n.current = null;
		};
	}, [t, e]), n;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useTabsterAttributes.js
var fs = (e) => {
	ds();
	let t = jo(e, !0);
	return N.useMemo(() => ({ [R]: t }), [t]);
}, ps = (e = {}) => {
	let { circular: t, axis: n, memorizeCurrent: r = !0, tabbable: i, ignoreDefaultKeydown: a, unstable_hasDefault: o } = e;
	return ds($o), fs({
		mover: {
			cyclic: !!t,
			direction: ms(n ?? "vertical"),
			memorizeCurrent: r,
			tabbable: i,
			hasDefault: o
		},
		...a && { focusable: { ignoreKeydown: a } }
	});
};
function ms(e) {
	switch (e) {
		case "horizontal": return fa.Horizontal;
		case "grid": return fa.Grid;
		case "grid-linear": return fa.GridLinear;
		case "both": return fa.Both;
		default: return fa.Vertical;
	}
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusFinders.js
var hs = () => {
	let e = ds(), { targetDocument: t } = Zr();
	return {
		findAllFocusable: N.useCallback((t, n) => t && e.current?.focusable.findAll({
			container: t,
			acceptCondition: n
		}) || [], [e]),
		findFirstFocusable: N.useCallback((t) => t && e.current?.focusable.findFirst({ container: t }), [e]),
		findLastFocusable: N.useCallback((t) => t && e.current?.focusable.findLast({ container: t }), [e]),
		findNextFocusable: N.useCallback((n, r = {}) => {
			if (!e.current || !t || !n) return null;
			let { container: i = t.body } = r;
			return e.current.focusable.findNext({
				currentElement: n,
				container: i
			});
		}, [e, t]),
		findPrevFocusable: N.useCallback((n, r = {}) => {
			if (!e.current || !t || !n) return null;
			let { container: i = t.body } = r;
			return e.current.focusable.findPrev({
				currentElement: n,
				container: i
			});
		}, [e, t])
	};
}, gs = (e, t, n) => {
	e.addEventListener(t, n, !0);
}, _s = (e, t, n) => {
	e.removeEventListener(t, n, !0);
}, vs = "keyborg:focusin", ys = "keyborg:focusout", bs = 0, xs = 1, Ss = 2, Cs = 3;
function ws(e) {
	let t = e.HTMLElement, n = t.prototype.focus, r = !1;
	return t.prototype.focus = function() {
		r = !0;
	}, e.document.createElement("button").focus(), t.prototype.focus = n, r;
}
var Ts = !1;
function Es(e) {
	let t = e, n = t.document, r = t.HTMLElement.prototype;
	Ts ||= ws(t);
	let i = r.focus;
	if (i.__keyborgNativeFocus) return;
	r.focus = u;
	let a = /* @__PURE__ */ new Set(), o = (e) => {
		let t = e.target;
		if (!t) return;
		let n = new CustomEvent(ys, {
			cancelable: !0,
			bubbles: !0,
			composed: !0,
			detail: { originalEvent: e }
		});
		t.dispatchEvent(n);
	}, s = (e) => {
		let t = e.target;
		if (!t) return;
		let n = e.composedPath()[0], r = /* @__PURE__ */ new Set();
		for (; n;) n.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? (r.add(n), n = n.host) : n = n.parentNode;
		for (let e of a) {
			let t = e.deref();
			(!t || !r.has(t)) && (a.delete(e), t && (_s(t, "focusin", s), _s(t, "focusout", o)));
		}
		c(t, e.relatedTarget || void 0);
	}, c = (e, t, n) => {
		let r = e.shadowRoot;
		if (r) {
			for (let e of a) if (e.deref() === r) return;
			gs(r, "focusin", s), gs(r, "focusout", o), a.add(new WeakRef(r));
			return;
		}
		let i = {
			relatedTarget: t,
			originalEvent: n
		}, c = new CustomEvent(vs, {
			cancelable: !0,
			bubbles: !0,
			composed: !0,
			detail: i
		});
		c.details = i, (Ts || l[Cs]) && (i.isFocusedProgrammatically = e === l[Cs]?.deref(), l[Cs] = void 0), e.dispatchEvent(c);
	}, l = [
		s,
		o,
		a
	];
	t.__keyborgData = l, gs(n, "focusin", s), gs(n, "focusout", o);
	function u() {
		let e = t.__keyborgData;
		return e && (e[Cs] = new WeakRef(this)), i.apply(this, arguments);
	}
	let d = n.activeElement;
	for (; d && d.shadowRoot;) c(d), d = d.shadowRoot.activeElement;
	u.__keyborgNativeFocus = i;
}
function Ds(e) {
	let t = e, n = t.HTMLElement.prototype, r = n.focus.__keyborgNativeFocus, i = t.__keyborgData;
	if (i) {
		let e = t.document;
		_s(e, "focusin", i[bs]), _s(e, "focusout", i[xs]);
		for (let e of i[Ss]) {
			let t = e.deref();
			t && (_s(t, "focusin", i[bs]), _s(t, "focusout", i[xs]));
		}
		i[Ss].clear(), delete t.__keyborgData;
	}
	r && (n.focus = r);
}
var Os = 500, ks = 0;
function As(e, t) {
	let n = e, r = !1, i, a, o, s;
	t && (t.triggerKeys?.length && (o = new Set(t.triggerKeys)), t.dismissKeys?.length && (s = new Set(t.dismissKeys)));
	let c = () => {
		let e = n?.__keyborg?.refs;
		if (e) for (let t of Object.keys(e)) e[t]._cb.forEach((e) => e(r));
	}, l = (e) => {
		r !== e && (r = e, c());
	}, u = (e) => {
		if (e.key === "Tab") return !0;
		let t = n?.document.activeElement, r = !o || o.has(e.keyCode), i = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
		return r && !i;
	}, d = (e) => !!s?.has(e.keyCode), f = () => {
		let e = n;
		if (!e) return;
		a &&= (e.clearTimeout(a), void 0);
		let t = e.document.activeElement;
		a = e.setTimeout(() => {
			a = void 0;
			let n = e.document.activeElement;
			t && n && t === n && l(!1);
		}, Os);
	}, p = (e) => {
		if (i || r) return;
		let t = e.detail;
		t.relatedTarget && (t.isFocusedProgrammatically || t.isFocusedProgrammatically === void 0 || l(!0));
	}, m = () => {
		n && (i && n.clearTimeout(i), i = n.setTimeout(() => {
			i = void 0;
		}, 1e3)), l(!1);
	}, h = (e) => {
		e.buttons === 0 || e.clientX === 0 && e.clientY === 0 && e.screenX === 0 && e.screenY === 0 || m();
	}, g = (e) => {
		r ? d(e) && f() : u(e) && l(!0);
	}, _ = e.document;
	return gs(_, vs, p), gs(_, "mousedown", h), gs(e, "keydown", g), gs(_, "touchstart", m), gs(_, "touchend", m), gs(_, "touchcancel", m), Es(e), {
		dispose: () => {
			if (!n) return;
			i &&= (n.clearTimeout(i), void 0), a &&= (n.clearTimeout(a), void 0), Ds(n);
			let e = n.document;
			_s(e, vs, p), _s(e, "mousedown", h), _s(n, "keydown", g), _s(e, "touchstart", m), _s(e, "touchend", m), _s(e, "touchcancel", m), n = void 0;
		},
		get isNavigatingWithKeyboard() {
			return r;
		},
		set isNavigatingWithKeyboard(e) {
			l(e);
		}
	};
}
function js(e, t) {
	let n = e, r = "k" + ++ks, i = n, a, o = [], s = n.__keyborg;
	a = s ? s.core : As(n, t);
	let c = {
		isNavigatingWithKeyboard() {
			return !!a?.isNavigatingWithKeyboard;
		},
		subscribe(e) {
			o.push(e);
		},
		unsubscribe(e) {
			let t = o.indexOf(e);
			t >= 0 && o.splice(t, 1);
		},
		setVal(e) {
			a && (a.isNavigatingWithKeyboard = e);
		},
		_cb: o,
		dispose() {
			let e = i?.__keyborg;
			e?.refs[r] && (delete e.refs[r], Object.keys(e.refs).length === 0 && (e.core.dispose(), delete i.__keyborg)), o.length = 0, a = void 0, i = void 0;
		}
	};
	return s ? s.refs[r] = c : n.__keyborg = {
		core: a,
		refs: { [r]: c }
	}, c;
}
function Ms(e) {
	e.dispose();
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/constants.js
var Ns = "data-fui-focus-visible", Ps = "data-fui-focus-within";
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/focusVisiblePolyfill.js
function Fs(e, t) {
	if (Is(e)) return () => void 0;
	let n = { current: void 0 }, r = js(t);
	function i(e) {
		r.isNavigatingWithKeyboard() && zi(e) && (n.current = e, e.setAttribute(Ns, ""));
	}
	function a() {
		n.current &&= (n.current.removeAttribute(Ns), void 0);
	}
	r.subscribe((e) => {
		e ? i(t.document.activeElement) : a();
	});
	let o = (e) => {
		a();
		let t = e.composedPath()[0];
		i(t);
	}, s = (t) => {
		(!t.relatedTarget || zi(t.relatedTarget) && !e.contains(t.relatedTarget)) && a();
	};
	return e.addEventListener(vs, o), e.addEventListener("focusout", s), e.focusVisible = !0, e.contains(t.document.activeElement) && i(t.document.activeElement), () => {
		a(), e.removeEventListener(vs, o), e.removeEventListener("focusout", s), e.focusVisible = void 0, Ms(r);
	};
}
function Is(e) {
	return e ? e.focusVisible ? !0 : Is(e?.parentElement) : !1;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusVisible.js
function Ls(e = {}) {
	let t = Zr(), n = N.useRef(null), r = e.targetDocument ?? t.targetDocument;
	return N.useEffect(() => {
		if (r?.defaultView && n.current) return Fs(n.current, r.defaultView);
	}, [n, r]), n;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/focusWithinPolyfill.js
function Rs(e, t) {
	let n = js(t);
	n.subscribe((t) => {
		t || Bs(e);
	});
	let r = (t) => {
		n.isNavigatingWithKeyboard() && Vs(t.target) && zs(e);
	}, i = (t) => {
		(!t.relatedTarget || Vs(t.relatedTarget) && !e.contains(t.relatedTarget)) && Bs(e);
	};
	return e.addEventListener(vs, r), e.addEventListener("focusout", i), () => {
		e.removeEventListener(vs, r), e.removeEventListener("focusout", i), Ms(n);
	};
}
function zs(e) {
	e.setAttribute(Ps, "");
}
function Bs(e) {
	e.removeAttribute(Ps);
}
function Vs(e) {
	return e ? !!(e && typeof e == "object" && "classList" in e && "contains" in e) : !1;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusWithin.js
function Hs() {
	let { targetDocument: e } = Zr(), t = N.useRef(null);
	return N.useEffect(() => {
		if (e?.defaultView && t.current) return Rs(t.current, e.defaultView);
	}, [t, e]), t;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useKeyborgRef.js
function Us() {
	let { targetDocument: e } = Zr(), t = N.useRef(null);
	return N.useEffect(() => {
		let n = e?.defaultView;
		if (n) {
			let e = js(n);
			return t.current = e, () => {
				Ms(e), t.current = null;
			};
		}
	}, [e]), t;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useMergeTabsterAttributes.js
var Ws = (...e) => {
	let t = [], n = "";
	for (let r of e) {
		let e = r?.[R];
		e && (t.push(e), n += e + Gs);
	}
	return N.useMemo(() => ({ [R]: Ks(t) }), [n]);
}, Gs = "\0", Ks = (e) => {
	if (e.length !== 0) return e.length === 1 ? e[0] : JSON.stringify(Object.assign({}, ...e.map(qs)));
}, qs = (e) => {
	try {
		return JSON.parse(e);
	} catch {
		return {};
	}
};
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useRestoreFocus.js
function Js() {
	return ds(rs), jo({ restorer: { type: da.Source } });
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useIsNavigatingWithKeyboard.js
function Ys() {
	let e = Us();
	return N.useCallback(() => e.current?.isNavigatingWithKeyboard() ?? !1, [e]);
}
//#endregion
//#region node_modules/@fluentui/tokens/lib/global/colors.js
var V = {
	2: "#050505",
	4: "#0a0a0a",
	6: "#0f0f0f",
	8: "#141414",
	10: "#1a1a1a",
	12: "#1f1f1f",
	14: "#242424",
	16: "#292929",
	18: "#2e2e2e",
	20: "#333333",
	22: "#383838",
	24: "#3d3d3d",
	26: "#424242",
	28: "#474747",
	30: "#4d4d4d",
	32: "#525252",
	34: "#575757",
	36: "#5c5c5c",
	38: "#616161",
	40: "#666666",
	42: "#6b6b6b",
	44: "#707070",
	46: "#757575",
	48: "#7a7a7a",
	50: "#808080",
	52: "#858585",
	54: "#8a8a8a",
	56: "#8f8f8f",
	58: "#949494",
	60: "#999999",
	62: "#9e9e9e",
	64: "#a3a3a3",
	66: "#a8a8a8",
	68: "#adadad",
	70: "#b3b3b3",
	72: "#b8b8b8",
	74: "#bdbdbd",
	76: "#c2c2c2",
	78: "#c7c7c7",
	80: "#cccccc",
	82: "#d1d1d1",
	84: "#d6d6d6",
	86: "#dbdbdb",
	88: "#e0e0e0",
	90: "#e6e6e6",
	92: "#ebebeb",
	94: "#f0f0f0",
	96: "#f5f5f5",
	98: "#fafafa",
	99: "#fcfcfc"
}, Xs = {
	5: "rgba(255, 255, 255, 0.05)",
	10: "rgba(255, 255, 255, 0.1)",
	20: "rgba(255, 255, 255, 0.2)",
	30: "rgba(255, 255, 255, 0.3)",
	40: "rgba(255, 255, 255, 0.4)",
	50: "rgba(255, 255, 255, 0.5)",
	60: "rgba(255, 255, 255, 0.6)",
	70: "rgba(255, 255, 255, 0.7)",
	80: "rgba(255, 255, 255, 0.8)",
	90: "rgba(255, 255, 255, 0.9)"
}, Zs = {
	5: "rgba(0, 0, 0, 0.05)",
	10: "rgba(0, 0, 0, 0.1)",
	20: "rgba(0, 0, 0, 0.2)",
	30: "rgba(0, 0, 0, 0.3)",
	40: "rgba(0, 0, 0, 0.4)",
	50: "rgba(0, 0, 0, 0.5)",
	60: "rgba(0, 0, 0, 0.6)",
	70: "rgba(0, 0, 0, 0.7)",
	80: "rgba(0, 0, 0, 0.8)",
	90: "rgba(0, 0, 0, 0.9)"
}, Qs = {
	5: "rgba(26, 26, 26, 0.05)",
	10: "rgba(26, 26, 26, 0.1)",
	20: "rgba(26, 26, 26, 0.2)",
	30: "rgba(26, 26, 26, 0.3)",
	40: "rgba(26, 26, 26, 0.4)",
	50: "rgba(26, 26, 26, 0.5)",
	60: "rgba(26, 26, 26, 0.6)",
	70: "rgba(26, 26, 26, 0.7)",
	80: "rgba(26, 26, 26, 0.8)",
	90: "rgba(26, 26, 26, 0.9)"
}, $s = {
	5: "rgba(31, 31, 31, 0.05)",
	10: "rgba(31, 31, 31, 0.1)",
	20: "rgba(31, 31, 31, 0.2)",
	30: "rgba(31, 31, 31, 0.3)",
	40: "rgba(31, 31, 31, 0.4)",
	50: "rgba(31, 31, 31, 0.5)",
	60: "rgba(31, 31, 31, 0.6)",
	70: "rgba(31, 31, 31, 0.7)",
	80: "rgba(31, 31, 31, 0.8)",
	90: "rgba(31, 31, 31, 0.9)"
}, ec = {
	5: "rgba(36, 36, 36, 0.05)",
	10: "rgba(36, 36, 36, 0.1)",
	20: "rgba(36, 36, 36, 0.2)",
	30: "rgba(36, 36, 36, 0.3)",
	40: "rgba(36, 36, 36, 0.4)",
	50: "rgba(36, 36, 36, 0.5)",
	60: "rgba(36, 36, 36, 0.6)",
	70: "rgba(36, 36, 36, 0.7)",
	80: "rgba(36, 36, 36, 0.8)",
	90: "rgba(36, 36, 36, 0.9)"
}, H = "#ffffff", tc = "#000000", nc = {
	shade50: "#130204",
	shade40: "#230308",
	shade30: "#420610",
	shade20: "#590815",
	shade10: "#690a19",
	primary: "#750b1c",
	tint10: "#861b2c",
	tint20: "#962f3f",
	tint30: "#ac4f5e",
	tint40: "#d69ca5",
	tint50: "#e9c7cd",
	tint60: "#f9f0f2"
}, rc = {
	shade50: "#200205",
	shade40: "#3b0509",
	shade30: "#6e0811",
	shade20: "#960b18",
	shade10: "#b10e1c",
	primary: "#c50f1f",
	tint10: "#cc2635",
	tint20: "#d33f4c",
	tint30: "#dc626d",
	tint40: "#eeacb2",
	tint50: "#f6d1d5",
	tint60: "#fdf3f4"
}, ic = {
	shade50: "#210809",
	shade40: "#3f1011",
	shade30: "#751d1f",
	shade20: "#9f282b",
	shade10: "#bc2f32",
	primary: "#d13438",
	tint10: "#d7494c",
	tint20: "#dc5e62",
	tint30: "#e37d80",
	tint40: "#f1bbbc",
	tint50: "#f8dadb",
	tint60: "#fdf6f6"
}, ac = {
	shade50: "#230900",
	shade40: "#411200",
	shade30: "#7a2101",
	shade20: "#a62d01",
	shade10: "#c43501",
	primary: "#da3b01",
	tint10: "#de501c",
	tint20: "#e36537",
	tint30: "#e9835e",
	tint40: "#f4bfab",
	tint50: "#f9dcd1",
	tint60: "#fdf6f3"
}, oc = {
	shade50: "#200d03",
	shade40: "#3d1805",
	shade30: "#712d09",
	shade20: "#9a3d0c",
	shade10: "#b6480e",
	primary: "#ca5010",
	tint10: "#d06228",
	tint20: "#d77440",
	tint30: "#df8e64",
	tint40: "#efc4ad",
	tint50: "#f7dfd2",
	tint60: "#fdf7f4"
}, sc = {
	shade50: "#271002",
	shade40: "#4a1e04",
	shade30: "#8a3707",
	shade20: "#bc4b09",
	shade10: "#de590b",
	primary: "#f7630c",
	tint10: "#f87528",
	tint20: "#f98845",
	tint30: "#faa06b",
	tint40: "#fdcfb4",
	tint50: "#fee5d7",
	tint60: "#fff9f5"
}, cc = {
	shade50: "#291600",
	shade40: "#4d2a00",
	shade30: "#8f4e00",
	shade20: "#c26a00",
	shade10: "#e67e00",
	primary: "#ff8c00",
	tint10: "#ff9a1f",
	tint20: "#ffa83d",
	tint30: "#ffba66",
	tint40: "#ffddb3",
	tint50: "#ffedd6",
	tint60: "#fffaf5"
}, lc = {
	shade50: "#251a00",
	shade40: "#463100",
	shade30: "#835b00",
	shade20: "#b27c00",
	shade10: "#d39300",
	primary: "#eaa300",
	tint10: "#edad1c",
	tint20: "#efb839",
	tint30: "#f2c661",
	tint40: "#f9e2ae",
	tint50: "#fcefd3",
	tint60: "#fefbf4"
}, uc = {
	shade50: "#282400",
	shade40: "#4c4400",
	shade30: "#817400",
	shade20: "#c0ad00",
	shade10: "#e4cc00",
	primary: "#fde300",
	tint10: "#fde61e",
	tint20: "#fdea3d",
	tint30: "#feee66",
	tint40: "#fef7b2",
	tint50: "#fffad6",
	tint60: "#fffef5"
}, dc = {
	shade50: "#1f1900",
	shade40: "#3a2f00",
	shade30: "#6c5700",
	shade20: "#937700",
	shade10: "#ae8c00",
	primary: "#c19c00",
	tint10: "#c8a718",
	tint20: "#d0b232",
	tint30: "#dac157",
	tint40: "#ecdfa5",
	tint50: "#f5eece",
	tint60: "#fdfbf2"
}, fc = {
	shade50: "#181202",
	shade40: "#2e2103",
	shade30: "#553e06",
	shade20: "#745408",
	shade10: "#89640a",
	primary: "#986f0b",
	tint10: "#a47d1e",
	tint20: "#b18c34",
	tint30: "#c1a256",
	tint40: "#e0cea2",
	tint50: "#efe4cb",
	tint60: "#fbf8f2"
}, pc = {
	shade50: "#170e07",
	shade40: "#2b1a0e",
	shade30: "#50301a",
	shade20: "#6c4123",
	shade10: "#804d29",
	primary: "#8e562e",
	tint10: "#9c663f",
	tint20: "#a97652",
	tint30: "#bb8f6f",
	tint40: "#ddc3b0",
	tint50: "#edded3",
	tint60: "#faf7f4"
}, mc = {
	shade50: "#0c1501",
	shade40: "#162702",
	shade30: "#294903",
	shade20: "#376304",
	shade10: "#427505",
	primary: "#498205",
	tint10: "#599116",
	tint20: "#6ba02b",
	tint30: "#85b44c",
	tint40: "#bdd99b",
	tint50: "#dbebc7",
	tint60: "#f6faf0"
}, hc = {
	shade50: "#002111",
	shade40: "#003d20",
	shade30: "#00723b",
	shade20: "#009b51",
	shade10: "#00b85f",
	primary: "#00cc6a",
	tint10: "#19d279",
	tint20: "#34d889",
	tint30: "#5ae0a0",
	tint40: "#a8f0cd",
	tint50: "#cff7e4",
	tint60: "#f3fdf8"
}, gc = {
	shade50: "#031a02",
	shade40: "#063004",
	shade30: "#0b5a08",
	shade20: "#0e7a0b",
	shade10: "#11910d",
	primary: "#13a10e",
	tint10: "#27ac22",
	tint20: "#3db838",
	tint30: "#5ec75a",
	tint40: "#a7e3a5",
	tint50: "#cef0cd",
	tint60: "#f2fbf2"
}, _c = {
	shade50: "#031403",
	shade40: "#052505",
	shade30: "#094509",
	shade20: "#0c5e0c",
	shade10: "#0e700e",
	primary: "#107c10",
	tint10: "#218c21",
	tint20: "#359b35",
	tint30: "#54b054",
	tint40: "#9fd89f",
	tint50: "#c9eac9",
	tint60: "#f1faf1"
}, vc = {
	shade50: "#021102",
	shade40: "#032003",
	shade30: "#063b06",
	shade20: "#085108",
	shade10: "#0a5f0a",
	primary: "#0b6a0b",
	tint10: "#1a7c1a",
	tint20: "#2d8e2d",
	tint30: "#4da64d",
	tint40: "#9ad29a",
	tint50: "#c6e7c6",
	tint60: "#f0f9f0"
}, yc = {
	shade50: "#001d1f",
	shade40: "#00373a",
	shade30: "#00666d",
	shade20: "#008b94",
	shade10: "#00a5af",
	primary: "#00b7c3",
	tint10: "#18bfca",
	tint20: "#32c8d1",
	tint30: "#58d3db",
	tint40: "#a6e9ed",
	tint50: "#cef3f5",
	tint60: "#f2fcfd"
}, bc = {
	shade50: "#001516",
	shade40: "#012728",
	shade30: "#02494c",
	shade20: "#026467",
	shade10: "#037679",
	primary: "#038387",
	tint10: "#159195",
	tint20: "#2aa0a4",
	tint30: "#4cb4b7",
	tint40: "#9bd9db",
	tint50: "#c7ebec",
	tint60: "#f0fafa"
}, xc = {
	shade50: "#000f12",
	shade40: "#001b22",
	shade30: "#00333f",
	shade20: "#004555",
	shade10: "#005265",
	primary: "#005b70",
	tint10: "#0f6c81",
	tint20: "#237d92",
	tint30: "#4496a9",
	tint40: "#94c8d4",
	tint50: "#c3e1e8",
	tint60: "#eff7f9"
}, Sc = {
	shade50: "#001322",
	shade40: "#002440",
	shade30: "#004377",
	shade20: "#005ba1",
	shade10: "#006cbf",
	primary: "#0078d4",
	tint10: "#1a86d9",
	tint20: "#3595de",
	tint30: "#5caae5",
	tint40: "#a9d3f2",
	tint50: "#d0e7f8",
	tint60: "#f3f9fd"
}, Cc = {
	shade50: "#000c16",
	shade40: "#00172a",
	shade30: "#002c4e",
	shade20: "#003b6a",
	shade10: "#00467e",
	primary: "#004e8c",
	tint10: "#125e9a",
	tint20: "#286fa8",
	tint30: "#4a89ba",
	tint40: "#9abfdc",
	tint50: "#c7dced",
	tint60: "#f0f6fa"
}, wc = {
	shade50: "#0d1126",
	shade40: "#182047",
	shade30: "#2c3c85",
	shade20: "#3c51b4",
	shade10: "#4760d5",
	primary: "#4f6bed",
	tint10: "#637cef",
	tint20: "#778df1",
	tint30: "#93a4f4",
	tint40: "#c8d1fa",
	tint50: "#e1e6fc",
	tint60: "#f7f9fe"
}, Tc = {
	shade50: "#00061d",
	shade40: "#000c36",
	shade30: "#001665",
	shade20: "#001e89",
	shade10: "#0023a2",
	primary: "#0027b4",
	tint10: "#173bbd",
	tint20: "#3050c6",
	tint30: "#546fd2",
	tint40: "#a3b2e8",
	tint50: "#ccd5f3",
	tint60: "#f2f4fc"
}, Ec = {
	shade50: "#120f25",
	shade40: "#221d46",
	shade30: "#3f3682",
	shade20: "#5649b0",
	shade10: "#6656d1",
	primary: "#7160e8",
	tint10: "#8172eb",
	tint20: "#9184ee",
	tint30: "#a79cf1",
	tint40: "#d2ccf8",
	tint50: "#e7e4fb",
	tint60: "#f9f8fe"
}, Dc = {
	shade50: "#0f0717",
	shade40: "#1c0e2b",
	shade30: "#341a51",
	shade20: "#46236e",
	shade10: "#532982",
	primary: "#5c2e91",
	tint10: "#6b3f9e",
	tint20: "#7c52ab",
	tint30: "#9470bd",
	tint40: "#c6b1de",
	tint50: "#e0d3ed",
	tint60: "#f7f4fb"
}, Oc = {
	shade50: "#160418",
	shade40: "#29072e",
	shade30: "#4c0d55",
	shade20: "#671174",
	shade10: "#7a1589",
	primary: "#881798",
	tint10: "#952aa4",
	tint20: "#a33fb1",
	tint30: "#b55fc1",
	tint40: "#d9a7e0",
	tint50: "#eaceef",
	tint60: "#faf2fb"
}, kc = {
	shade50: "#1f091d",
	shade40: "#3a1136",
	shade30: "#6d2064",
	shade20: "#932b88",
	shade10: "#af33a1",
	primary: "#c239b3",
	tint10: "#c94cbc",
	tint20: "#d161c4",
	tint30: "#da7ed0",
	tint40: "#edbbe7",
	tint50: "#f5daf2",
	tint60: "#fdf5fc"
}, Ac = {
	shade50: "#1c0b1f",
	shade40: "#35153a",
	shade30: "#63276d",
	shade20: "#863593",
	shade10: "#9f3faf",
	primary: "#b146c2",
	tint10: "#ba58c9",
	tint20: "#c36bd1",
	tint30: "#cf87da",
	tint40: "#e6bfed",
	tint50: "#f2dcf5",
	tint60: "#fcf6fd"
}, jc = {
	shade50: "#24091b",
	shade40: "#441232",
	shade30: "#80215d",
	shade20: "#ad2d7e",
	shade10: "#cd3595",
	primary: "#e43ba6",
	tint10: "#e750b0",
	tint20: "#ea66ba",
	tint30: "#ef85c8",
	tint40: "#f7c0e3",
	tint50: "#fbddf0",
	tint60: "#fef6fb"
}, Mc = {
	shade50: "#1f0013",
	shade40: "#390024",
	shade30: "#6b0043",
	shade20: "#91005a",
	shade10: "#ac006b",
	primary: "#bf0077",
	tint10: "#c71885",
	tint20: "#ce3293",
	tint30: "#d957a8",
	tint40: "#eca5d1",
	tint50: "#f5cee6",
	tint60: "#fcf2f9"
}, Nc = {
	shade50: "#13000c",
	shade40: "#240017",
	shade30: "#43002b",
	shade20: "#5a003b",
	shade10: "#6b0045",
	primary: "#77004d",
	tint10: "#87105d",
	tint20: "#98246f",
	tint30: "#ad4589",
	tint40: "#d696c0",
	tint50: "#e9c4dc",
	tint60: "#faf0f6"
}, Pc = {
	shade50: "#141313",
	shade40: "#252323",
	shade30: "#444241",
	shade20: "#5d5958",
	shade10: "#6e6968",
	primary: "#7a7574",
	tint10: "#8a8584",
	tint20: "#9a9594",
	tint30: "#afabaa",
	tint40: "#d7d4d4",
	tint50: "#eae8e8",
	tint60: "#faf9f9"
}, Fc = {
	shade50: "#0f0e0e",
	shade40: "#1c1b1a",
	shade30: "#343231",
	shade20: "#474443",
	shade10: "#54514f",
	primary: "#5d5a58",
	tint10: "#706d6b",
	tint20: "#84817e",
	tint30: "#9e9b99",
	tint40: "#cecccb",
	tint50: "#e5e4e3",
	tint60: "#f8f8f8"
}, Ic = {
	shade50: "#111314",
	shade40: "#1f2426",
	shade30: "#3b4447",
	shade20: "#505c60",
	shade10: "#5f6d71",
	primary: "#69797e",
	tint10: "#79898d",
	tint20: "#89989d",
	tint30: "#a0adb2",
	tint40: "#cdd6d8",
	tint50: "#e4e9ea",
	tint60: "#f8f9fa"
}, Lc = {
	shade50: "#090a0b",
	shade40: "#111315",
	shade30: "#202427",
	shade20: "#2b3135",
	shade10: "#333a3f",
	primary: "#394146",
	tint10: "#4d565c",
	tint20: "#626c72",
	tint30: "#808a90",
	tint40: "#bcc3c7",
	tint50: "#dbdfe1",
	tint60: "#f6f7f8"
}, U = {
	red: ic,
	green: _c,
	darkOrange: ac,
	yellow: uc,
	berry: kc,
	lightGreen: gc,
	marigold: lc
}, Rc = {
	darkRed: nc,
	cranberry: rc,
	pumpkin: oc,
	peach: cc,
	gold: dc,
	brass: fc,
	brown: pc,
	forest: mc,
	seafoam: hc,
	darkGreen: vc,
	lightTeal: yc,
	teal: bc,
	steel: xc,
	blue: Sc,
	royalBlue: Cc,
	cornflower: wc,
	navy: Tc,
	lavender: Ec,
	purple: Dc,
	grape: Oc,
	lilac: Ac,
	pink: jc,
	magenta: Mc,
	plum: Nc,
	beige: Pc,
	mink: Fc,
	platinum: Ic,
	anchor: Lc
}, W = {
	cranberry: rc,
	green: _c,
	orange: sc
}, zc = [
	"red",
	"green",
	"darkOrange",
	"yellow",
	"berry",
	"lightGreen",
	"marigold"
], Bc = /* @__PURE__ */ "darkRed.cranberry.pumpkin.peach.gold.brass.brown.forest.seafoam.darkGreen.lightTeal.teal.steel.blue.royalBlue.cornflower.navy.lavender.purple.grape.lilac.pink.magenta.plum.beige.mink.platinum.anchor".split("."), Vc = {
	success: "green",
	warning: "orange",
	danger: "cranberry"
}, Hc = zc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background1`]: U[t].tint60,
		[`colorPalette${n}Background2`]: U[t].tint40,
		[`colorPalette${n}Background3`]: U[t].primary,
		[`colorPalette${n}Foreground1`]: U[t].shade10,
		[`colorPalette${n}Foreground2`]: U[t].shade30,
		[`colorPalette${n}Foreground3`]: U[t].primary,
		[`colorPalette${n}BorderActive`]: U[t].primary,
		[`colorPalette${n}Border1`]: U[t].tint40,
		[`colorPalette${n}Border2`]: U[t].primary
	};
	return Object.assign(e, r);
}, {});
Hc.colorPaletteYellowForeground1 = U.yellow.shade30, Hc.colorPaletteRedForegroundInverted = U.red.tint20, Hc.colorPaletteGreenForegroundInverted = U.green.tint20, Hc.colorPaletteYellowForegroundInverted = U.yellow.tint40;
var Uc = Bc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background2`]: Rc[t].tint40,
		[`colorPalette${n}Foreground2`]: Rc[t].shade30,
		[`colorPalette${n}BorderActive`]: Rc[t].primary
	};
	return Object.assign(e, r);
}, {}), Wc = {
	...Hc,
	...Uc
}, Gc = Object.entries(Vc).reduce((e, [t, n]) => {
	let r = t.slice(0, 1).toUpperCase() + t.slice(1), i = {
		[`colorStatus${r}Background1`]: W[n].tint60,
		[`colorStatus${r}Background2`]: W[n].tint40,
		[`colorStatus${r}Background3`]: W[n].primary,
		[`colorStatus${r}Foreground1`]: W[n].shade10,
		[`colorStatus${r}Foreground2`]: W[n].shade30,
		[`colorStatus${r}Foreground3`]: W[n].primary,
		[`colorStatus${r}ForegroundInverted`]: W[n].tint30,
		[`colorStatus${r}BorderActive`]: W[n].primary,
		[`colorStatus${r}Border1`]: W[n].tint40,
		[`colorStatus${r}Border2`]: W[n].primary
	};
	return Object.assign(e, i);
}, {});
Gc.colorStatusDangerBackground3Hover = W[Vc.danger].shade10, Gc.colorStatusDangerBackground3Pressed = W[Vc.danger].shade20, Gc.colorStatusWarningForeground1 = W[Vc.warning].shade20, Gc.colorStatusWarningForeground3 = W[Vc.warning].shade20, Gc.colorStatusWarningBorder2 = W[Vc.warning].shade20;
//#endregion
//#region node_modules/@fluentui/tokens/lib/alias/lightColor.js
var Kc = (e) => ({
	colorNeutralForeground1: V[14],
	colorNeutralForeground1Hover: V[14],
	colorNeutralForeground1Pressed: V[14],
	colorNeutralForeground1Selected: V[14],
	colorNeutralForeground2: V[26],
	colorNeutralForeground2Hover: V[14],
	colorNeutralForeground2Pressed: V[14],
	colorNeutralForeground2Selected: V[14],
	colorNeutralForeground2BrandHover: e[80],
	colorNeutralForeground2BrandPressed: e[70],
	colorNeutralForeground2BrandSelected: e[80],
	colorNeutralForeground3: V[38],
	colorNeutralForeground3Hover: V[26],
	colorNeutralForeground3Pressed: V[26],
	colorNeutralForeground3Selected: V[26],
	colorNeutralForeground3BrandHover: e[80],
	colorNeutralForeground3BrandPressed: e[70],
	colorNeutralForeground3BrandSelected: e[80],
	colorNeutralForeground4: V[44],
	colorNeutralForeground5: V[38],
	colorNeutralForeground5Hover: V[14],
	colorNeutralForeground5Pressed: V[14],
	colorNeutralForeground5Selected: V[14],
	colorNeutralForegroundDisabled: V[74],
	colorNeutralForegroundInvertedDisabled: Xs[40],
	colorBrandForegroundLink: e[70],
	colorBrandForegroundLinkHover: e[60],
	colorBrandForegroundLinkPressed: e[40],
	colorBrandForegroundLinkSelected: e[70],
	colorNeutralForeground2Link: V[26],
	colorNeutralForeground2LinkHover: V[14],
	colorNeutralForeground2LinkPressed: V[14],
	colorNeutralForeground2LinkSelected: V[14],
	colorCompoundBrandForeground1: e[80],
	colorCompoundBrandForeground1Hover: e[70],
	colorCompoundBrandForeground1Pressed: e[60],
	colorBrandForeground1: e[80],
	colorBrandForeground2: e[70],
	colorBrandForeground2Hover: e[60],
	colorBrandForeground2Pressed: e[30],
	colorNeutralForeground1Static: V[14],
	colorNeutralForegroundStaticInverted: H,
	colorNeutralForegroundInverted: H,
	colorNeutralForegroundInvertedHover: H,
	colorNeutralForegroundInvertedPressed: H,
	colorNeutralForegroundInvertedSelected: H,
	colorNeutralForegroundInverted2: H,
	colorNeutralForegroundOnBrand: H,
	colorNeutralForegroundInvertedLink: H,
	colorNeutralForegroundInvertedLinkHover: H,
	colorNeutralForegroundInvertedLinkPressed: H,
	colorNeutralForegroundInvertedLinkSelected: H,
	colorBrandForegroundInverted: e[100],
	colorBrandForegroundInvertedHover: e[110],
	colorBrandForegroundInvertedPressed: e[100],
	colorBrandForegroundOnLight: e[80],
	colorBrandForegroundOnLightHover: e[70],
	colorBrandForegroundOnLightPressed: e[50],
	colorBrandForegroundOnLightSelected: e[60],
	colorNeutralBackground1: H,
	colorNeutralBackground1Hover: V[96],
	colorNeutralBackground1Pressed: V[88],
	colorNeutralBackground1Selected: V[92],
	colorNeutralBackground2: V[98],
	colorNeutralBackground2Hover: V[94],
	colorNeutralBackground2Pressed: V[86],
	colorNeutralBackground2Selected: V[90],
	colorNeutralBackground3: V[96],
	colorNeutralBackground3Hover: V[92],
	colorNeutralBackground3Pressed: V[84],
	colorNeutralBackground3Selected: V[88],
	colorNeutralBackground4: V[94],
	colorNeutralBackground4Hover: V[98],
	colorNeutralBackground4Pressed: V[96],
	colorNeutralBackground4Selected: H,
	colorNeutralBackground5: V[92],
	colorNeutralBackground5Hover: V[96],
	colorNeutralBackground5Pressed: V[94],
	colorNeutralBackground5Selected: V[98],
	colorNeutralBackground6: V[90],
	colorNeutralBackground7: "#00000000",
	colorNeutralBackground7Hover: V[92],
	colorNeutralBackground7Pressed: V[84],
	colorNeutralBackground7Selected: "#00000000",
	colorNeutralBackground8: V[99],
	colorNeutralBackgroundInverted: V[16],
	colorNeutralBackgroundInvertedHover: V[24],
	colorNeutralBackgroundInvertedPressed: V[12],
	colorNeutralBackgroundInvertedSelected: V[22],
	colorNeutralBackgroundStatic: V[20],
	colorNeutralBackgroundAlpha: Xs[50],
	colorNeutralBackgroundAlpha2: Xs[80],
	colorSubtleBackground: "transparent",
	colorSubtleBackgroundHover: V[96],
	colorSubtleBackgroundPressed: V[88],
	colorSubtleBackgroundSelected: V[92],
	colorSubtleBackgroundLightAlphaHover: Xs[70],
	colorSubtleBackgroundLightAlphaPressed: Xs[50],
	colorSubtleBackgroundLightAlphaSelected: "transparent",
	colorSubtleBackgroundInverted: "transparent",
	colorSubtleBackgroundInvertedHover: Zs[10],
	colorSubtleBackgroundInvertedPressed: Zs[30],
	colorSubtleBackgroundInvertedSelected: Zs[20],
	colorTransparentBackground: "transparent",
	colorTransparentBackgroundHover: "transparent",
	colorTransparentBackgroundPressed: "transparent",
	colorTransparentBackgroundSelected: "transparent",
	colorNeutralBackgroundDisabled: V[94],
	colorNeutralBackgroundDisabled2: H,
	colorNeutralBackgroundInvertedDisabled: Xs[10],
	colorNeutralStencil1: V[90],
	colorNeutralStencil2: V[98],
	colorNeutralStencil1Alpha: Zs[10],
	colorNeutralStencil2Alpha: Zs[5],
	colorBackgroundOverlay: Zs[40],
	colorScrollbarOverlay: Zs[50],
	colorBrandBackground: e[80],
	colorBrandBackgroundHover: e[70],
	colorBrandBackgroundPressed: e[40],
	colorBrandBackgroundSelected: e[60],
	colorCompoundBrandBackground: e[80],
	colorCompoundBrandBackgroundHover: e[70],
	colorCompoundBrandBackgroundPressed: e[60],
	colorBrandBackgroundStatic: e[80],
	colorBrandBackground2: e[160],
	colorBrandBackground2Hover: e[150],
	colorBrandBackground2Pressed: e[130],
	colorBrandBackground3Static: e[60],
	colorBrandBackground4Static: e[40],
	colorBrandBackgroundInverted: H,
	colorBrandBackgroundInvertedHover: e[160],
	colorBrandBackgroundInvertedPressed: e[140],
	colorBrandBackgroundInvertedSelected: e[150],
	colorNeutralCardBackground: V[98],
	colorNeutralCardBackgroundHover: H,
	colorNeutralCardBackgroundPressed: V[96],
	colorNeutralCardBackgroundSelected: V[92],
	colorNeutralCardBackgroundDisabled: V[94],
	colorNeutralStrokeAccessible: V[38],
	colorNeutralStrokeAccessibleHover: V[34],
	colorNeutralStrokeAccessiblePressed: V[30],
	colorNeutralStrokeAccessibleSelected: e[80],
	colorNeutralStroke1: V[82],
	colorNeutralStroke1Hover: V[78],
	colorNeutralStroke1Pressed: V[70],
	colorNeutralStroke1Selected: V[74],
	colorNeutralStroke2: V[88],
	colorNeutralStroke3: V[94],
	colorNeutralStroke4: V[92],
	colorNeutralStroke4Hover: V[88],
	colorNeutralStroke4Pressed: V[84],
	colorNeutralStroke4Selected: V[92],
	colorNeutralStrokeSubtle: V[88],
	colorNeutralStrokeOnBrand: H,
	colorNeutralStrokeOnBrand2: H,
	colorNeutralStrokeOnBrand2Hover: H,
	colorNeutralStrokeOnBrand2Pressed: H,
	colorNeutralStrokeOnBrand2Selected: H,
	colorBrandStroke1: e[80],
	colorBrandStroke2: e[140],
	colorBrandStroke2Hover: e[120],
	colorBrandStroke2Pressed: e[80],
	colorBrandStroke2Contrast: e[140],
	colorCompoundBrandStroke: e[80],
	colorCompoundBrandStrokeHover: e[70],
	colorCompoundBrandStrokePressed: e[60],
	colorNeutralStrokeDisabled: V[88],
	colorNeutralStrokeDisabled2: V[92],
	colorNeutralStrokeInvertedDisabled: Xs[40],
	colorTransparentStroke: "transparent",
	colorTransparentStrokeInteractive: "transparent",
	colorTransparentStrokeDisabled: "transparent",
	colorNeutralStrokeAlpha: Zs[5],
	colorNeutralStrokeAlpha2: Xs[20],
	colorStrokeFocus1: H,
	colorStrokeFocus2: tc,
	colorNeutralShadowAmbient: "rgba(0,0,0,0.12)",
	colorNeutralShadowKey: "rgba(0,0,0,0.14)",
	colorNeutralShadowAmbientLighter: "rgba(0,0,0,0.06)",
	colorNeutralShadowKeyLighter: "rgba(0,0,0,0.07)",
	colorNeutralShadowAmbientDarker: "rgba(0,0,0,0.20)",
	colorNeutralShadowKeyDarker: "rgba(0,0,0,0.24)",
	colorBrandShadowAmbient: "rgba(0,0,0,0.30)",
	colorBrandShadowKey: "rgba(0,0,0,0.25)"
}), qc = {
	borderRadiusNone: "0",
	borderRadiusSmall: "2px",
	borderRadiusMedium: "4px",
	borderRadiusLarge: "6px",
	borderRadiusXLarge: "8px",
	borderRadius2XLarge: "12px",
	borderRadius3XLarge: "16px",
	borderRadius4XLarge: "24px",
	borderRadius5XLarge: "32px",
	borderRadius6XLarge: "40px",
	borderRadiusCircular: "10000px"
}, Jc = {
	curveAccelerateMax: "cubic-bezier(0.9,0.1,1,0.2)",
	curveAccelerateMid: "cubic-bezier(1,0,1,1)",
	curveAccelerateMin: "cubic-bezier(0.8,0,0.78,1)",
	curveDecelerateMax: "cubic-bezier(0.1,0.9,0.2,1)",
	curveDecelerateMid: "cubic-bezier(0,0,0,1)",
	curveDecelerateMin: "cubic-bezier(0.33,0,0.1,1)",
	curveEasyEaseMax: "cubic-bezier(0.8,0,0.2,1)",
	curveEasyEase: "cubic-bezier(0.33,0,0.67,1)",
	curveLinear: "cubic-bezier(0,0,1,1)"
}, Yc = {
	durationUltraFast: "50ms",
	durationFaster: "100ms",
	durationFast: "150ms",
	durationNormal: "200ms",
	durationGentle: "250ms",
	durationSlow: "300ms",
	durationSlower: "400ms",
	durationUltraSlow: "500ms"
}, Xc = {
	fontSizeBase100: "10px",
	fontSizeBase200: "12px",
	fontSizeBase300: "14px",
	fontSizeBase400: "16px",
	fontSizeBase500: "20px",
	fontSizeBase600: "24px",
	fontSizeHero700: "28px",
	fontSizeHero800: "32px",
	fontSizeHero900: "40px",
	fontSizeHero1000: "68px"
}, Zc = {
	lineHeightBase100: "14px",
	lineHeightBase200: "16px",
	lineHeightBase300: "20px",
	lineHeightBase400: "22px",
	lineHeightBase500: "28px",
	lineHeightBase600: "32px",
	lineHeightHero700: "36px",
	lineHeightHero800: "40px",
	lineHeightHero900: "52px",
	lineHeightHero1000: "92px"
}, Qc = {
	fontWeightRegular: 400,
	fontWeightMedium: 500,
	fontWeightSemibold: 600,
	fontWeightBold: 700
}, $c = {
	fontFamilyBase: "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif",
	fontFamilyMonospace: "Consolas, 'Courier New', Courier, monospace",
	fontFamilyNumeric: "Bahnschrift, 'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif"
}, el = {
	none: "0",
	xxs: "2px",
	xs: "4px",
	sNudge: "6px",
	s: "8px",
	mNudge: "10px",
	m: "12px",
	l: "16px",
	xl: "20px",
	xxl: "24px",
	xxxl: "32px"
}, tl = {
	spacingHorizontalNone: el.none,
	spacingHorizontalXXS: el.xxs,
	spacingHorizontalXS: el.xs,
	spacingHorizontalSNudge: el.sNudge,
	spacingHorizontalS: el.s,
	spacingHorizontalMNudge: el.mNudge,
	spacingHorizontalM: el.m,
	spacingHorizontalL: el.l,
	spacingHorizontalXL: el.xl,
	spacingHorizontalXXL: el.xxl,
	spacingHorizontalXXXL: el.xxxl
}, nl = {
	spacingVerticalNone: el.none,
	spacingVerticalXXS: el.xxs,
	spacingVerticalXS: el.xs,
	spacingVerticalSNudge: el.sNudge,
	spacingVerticalS: el.s,
	spacingVerticalMNudge: el.mNudge,
	spacingVerticalM: el.m,
	spacingVerticalL: el.l,
	spacingVerticalXL: el.xl,
	spacingVerticalXXL: el.xxl,
	spacingVerticalXXXL: el.xxxl
}, rl = {
	strokeWidthThin: "1px",
	strokeWidthThick: "2px",
	strokeWidthThicker: "3px",
	strokeWidthThickest: "4px"
}, G = {
	colorNeutralForeground1: "var(--colorNeutralForeground1)",
	colorNeutralForeground1Hover: "var(--colorNeutralForeground1Hover)",
	colorNeutralForeground1Pressed: "var(--colorNeutralForeground1Pressed)",
	colorNeutralForeground1Selected: "var(--colorNeutralForeground1Selected)",
	colorNeutralForeground2: "var(--colorNeutralForeground2)",
	colorNeutralForeground2Hover: "var(--colorNeutralForeground2Hover)",
	colorNeutralForeground2Pressed: "var(--colorNeutralForeground2Pressed)",
	colorNeutralForeground2Selected: "var(--colorNeutralForeground2Selected)",
	colorNeutralForeground2BrandHover: "var(--colorNeutralForeground2BrandHover)",
	colorNeutralForeground2BrandPressed: "var(--colorNeutralForeground2BrandPressed)",
	colorNeutralForeground2BrandSelected: "var(--colorNeutralForeground2BrandSelected)",
	colorNeutralForeground3: "var(--colorNeutralForeground3)",
	colorNeutralForeground3Hover: "var(--colorNeutralForeground3Hover)",
	colorNeutralForeground3Pressed: "var(--colorNeutralForeground3Pressed)",
	colorNeutralForeground3Selected: "var(--colorNeutralForeground3Selected)",
	colorNeutralForeground3BrandHover: "var(--colorNeutralForeground3BrandHover)",
	colorNeutralForeground3BrandPressed: "var(--colorNeutralForeground3BrandPressed)",
	colorNeutralForeground3BrandSelected: "var(--colorNeutralForeground3BrandSelected)",
	colorNeutralForeground4: "var(--colorNeutralForeground4)",
	colorNeutralForeground5: "var(--colorNeutralForeground5)",
	colorNeutralForeground5Hover: "var(--colorNeutralForeground5Hover)",
	colorNeutralForeground5Pressed: "var(--colorNeutralForeground5Pressed)",
	colorNeutralForeground5Selected: "var(--colorNeutralForeground5Selected)",
	colorNeutralForegroundDisabled: "var(--colorNeutralForegroundDisabled)",
	colorBrandForegroundLink: "var(--colorBrandForegroundLink)",
	colorBrandForegroundLinkHover: "var(--colorBrandForegroundLinkHover)",
	colorBrandForegroundLinkPressed: "var(--colorBrandForegroundLinkPressed)",
	colorBrandForegroundLinkSelected: "var(--colorBrandForegroundLinkSelected)",
	colorNeutralForeground2Link: "var(--colorNeutralForeground2Link)",
	colorNeutralForeground2LinkHover: "var(--colorNeutralForeground2LinkHover)",
	colorNeutralForeground2LinkPressed: "var(--colorNeutralForeground2LinkPressed)",
	colorNeutralForeground2LinkSelected: "var(--colorNeutralForeground2LinkSelected)",
	colorCompoundBrandForeground1: "var(--colorCompoundBrandForeground1)",
	colorCompoundBrandForeground1Hover: "var(--colorCompoundBrandForeground1Hover)",
	colorCompoundBrandForeground1Pressed: "var(--colorCompoundBrandForeground1Pressed)",
	colorNeutralForegroundOnBrand: "var(--colorNeutralForegroundOnBrand)",
	colorNeutralForegroundInverted: "var(--colorNeutralForegroundInverted)",
	colorNeutralForegroundInvertedHover: "var(--colorNeutralForegroundInvertedHover)",
	colorNeutralForegroundInvertedPressed: "var(--colorNeutralForegroundInvertedPressed)",
	colorNeutralForegroundInvertedSelected: "var(--colorNeutralForegroundInvertedSelected)",
	colorNeutralForegroundInverted2: "var(--colorNeutralForegroundInverted2)",
	colorNeutralForegroundStaticInverted: "var(--colorNeutralForegroundStaticInverted)",
	colorNeutralForegroundInvertedLink: "var(--colorNeutralForegroundInvertedLink)",
	colorNeutralForegroundInvertedLinkHover: "var(--colorNeutralForegroundInvertedLinkHover)",
	colorNeutralForegroundInvertedLinkPressed: "var(--colorNeutralForegroundInvertedLinkPressed)",
	colorNeutralForegroundInvertedLinkSelected: "var(--colorNeutralForegroundInvertedLinkSelected)",
	colorNeutralForegroundInvertedDisabled: "var(--colorNeutralForegroundInvertedDisabled)",
	colorBrandForeground1: "var(--colorBrandForeground1)",
	colorBrandForeground2: "var(--colorBrandForeground2)",
	colorBrandForeground2Hover: "var(--colorBrandForeground2Hover)",
	colorBrandForeground2Pressed: "var(--colorBrandForeground2Pressed)",
	colorNeutralForeground1Static: "var(--colorNeutralForeground1Static)",
	colorBrandForegroundInverted: "var(--colorBrandForegroundInverted)",
	colorBrandForegroundInvertedHover: "var(--colorBrandForegroundInvertedHover)",
	colorBrandForegroundInvertedPressed: "var(--colorBrandForegroundInvertedPressed)",
	colorBrandForegroundOnLight: "var(--colorBrandForegroundOnLight)",
	colorBrandForegroundOnLightHover: "var(--colorBrandForegroundOnLightHover)",
	colorBrandForegroundOnLightPressed: "var(--colorBrandForegroundOnLightPressed)",
	colorBrandForegroundOnLightSelected: "var(--colorBrandForegroundOnLightSelected)",
	colorNeutralBackground1: "var(--colorNeutralBackground1)",
	colorNeutralBackground1Hover: "var(--colorNeutralBackground1Hover)",
	colorNeutralBackground1Pressed: "var(--colorNeutralBackground1Pressed)",
	colorNeutralBackground1Selected: "var(--colorNeutralBackground1Selected)",
	colorNeutralBackground2: "var(--colorNeutralBackground2)",
	colorNeutralBackground2Hover: "var(--colorNeutralBackground2Hover)",
	colorNeutralBackground2Pressed: "var(--colorNeutralBackground2Pressed)",
	colorNeutralBackground2Selected: "var(--colorNeutralBackground2Selected)",
	colorNeutralBackground3: "var(--colorNeutralBackground3)",
	colorNeutralBackground3Hover: "var(--colorNeutralBackground3Hover)",
	colorNeutralBackground3Pressed: "var(--colorNeutralBackground3Pressed)",
	colorNeutralBackground3Selected: "var(--colorNeutralBackground3Selected)",
	colorNeutralBackground4: "var(--colorNeutralBackground4)",
	colorNeutralBackground4Hover: "var(--colorNeutralBackground4Hover)",
	colorNeutralBackground4Pressed: "var(--colorNeutralBackground4Pressed)",
	colorNeutralBackground4Selected: "var(--colorNeutralBackground4Selected)",
	colorNeutralBackground5: "var(--colorNeutralBackground5)",
	colorNeutralBackground5Hover: "var(--colorNeutralBackground5Hover)",
	colorNeutralBackground5Pressed: "var(--colorNeutralBackground5Pressed)",
	colorNeutralBackground5Selected: "var(--colorNeutralBackground5Selected)",
	colorNeutralBackground6: "var(--colorNeutralBackground6)",
	colorNeutralBackground7: "var(--colorNeutralBackground7)",
	colorNeutralBackground7Hover: "var(--colorNeutralBackground7Hover)",
	colorNeutralBackground7Pressed: "var(--colorNeutralBackground7Pressed)",
	colorNeutralBackground7Selected: "var(--colorNeutralBackground7Selected)",
	colorNeutralBackground8: "var(--colorNeutralBackground8)",
	colorNeutralBackgroundInverted: "var(--colorNeutralBackgroundInverted)",
	colorNeutralBackgroundInvertedHover: "var(--colorNeutralBackgroundInvertedHover)",
	colorNeutralBackgroundInvertedPressed: "var(--colorNeutralBackgroundInvertedPressed)",
	colorNeutralBackgroundInvertedSelected: "var(--colorNeutralBackgroundInvertedSelected)",
	colorNeutralBackgroundStatic: "var(--colorNeutralBackgroundStatic)",
	colorNeutralBackgroundAlpha: "var(--colorNeutralBackgroundAlpha)",
	colorNeutralBackgroundAlpha2: "var(--colorNeutralBackgroundAlpha2)",
	colorSubtleBackground: "var(--colorSubtleBackground)",
	colorSubtleBackgroundHover: "var(--colorSubtleBackgroundHover)",
	colorSubtleBackgroundPressed: "var(--colorSubtleBackgroundPressed)",
	colorSubtleBackgroundSelected: "var(--colorSubtleBackgroundSelected)",
	colorSubtleBackgroundLightAlphaHover: "var(--colorSubtleBackgroundLightAlphaHover)",
	colorSubtleBackgroundLightAlphaPressed: "var(--colorSubtleBackgroundLightAlphaPressed)",
	colorSubtleBackgroundLightAlphaSelected: "var(--colorSubtleBackgroundLightAlphaSelected)",
	colorSubtleBackgroundInverted: "var(--colorSubtleBackgroundInverted)",
	colorSubtleBackgroundInvertedHover: "var(--colorSubtleBackgroundInvertedHover)",
	colorSubtleBackgroundInvertedPressed: "var(--colorSubtleBackgroundInvertedPressed)",
	colorSubtleBackgroundInvertedSelected: "var(--colorSubtleBackgroundInvertedSelected)",
	colorTransparentBackground: "var(--colorTransparentBackground)",
	colorTransparentBackgroundHover: "var(--colorTransparentBackgroundHover)",
	colorTransparentBackgroundPressed: "var(--colorTransparentBackgroundPressed)",
	colorTransparentBackgroundSelected: "var(--colorTransparentBackgroundSelected)",
	colorNeutralBackgroundDisabled: "var(--colorNeutralBackgroundDisabled)",
	colorNeutralBackgroundDisabled2: "var(--colorNeutralBackgroundDisabled2)",
	colorNeutralBackgroundInvertedDisabled: "var(--colorNeutralBackgroundInvertedDisabled)",
	colorNeutralStencil1: "var(--colorNeutralStencil1)",
	colorNeutralStencil2: "var(--colorNeutralStencil2)",
	colorNeutralStencil1Alpha: "var(--colorNeutralStencil1Alpha)",
	colorNeutralStencil2Alpha: "var(--colorNeutralStencil2Alpha)",
	colorBackgroundOverlay: "var(--colorBackgroundOverlay)",
	colorScrollbarOverlay: "var(--colorScrollbarOverlay)",
	colorBrandBackground: "var(--colorBrandBackground)",
	colorBrandBackgroundHover: "var(--colorBrandBackgroundHover)",
	colorBrandBackgroundPressed: "var(--colorBrandBackgroundPressed)",
	colorBrandBackgroundSelected: "var(--colorBrandBackgroundSelected)",
	colorCompoundBrandBackground: "var(--colorCompoundBrandBackground)",
	colorCompoundBrandBackgroundHover: "var(--colorCompoundBrandBackgroundHover)",
	colorCompoundBrandBackgroundPressed: "var(--colorCompoundBrandBackgroundPressed)",
	colorBrandBackgroundStatic: "var(--colorBrandBackgroundStatic)",
	colorBrandBackground2: "var(--colorBrandBackground2)",
	colorBrandBackground2Hover: "var(--colorBrandBackground2Hover)",
	colorBrandBackground2Pressed: "var(--colorBrandBackground2Pressed)",
	colorBrandBackground3Static: "var(--colorBrandBackground3Static)",
	colorBrandBackground4Static: "var(--colorBrandBackground4Static)",
	colorBrandBackgroundInverted: "var(--colorBrandBackgroundInverted)",
	colorBrandBackgroundInvertedHover: "var(--colorBrandBackgroundInvertedHover)",
	colorBrandBackgroundInvertedPressed: "var(--colorBrandBackgroundInvertedPressed)",
	colorBrandBackgroundInvertedSelected: "var(--colorBrandBackgroundInvertedSelected)",
	colorNeutralCardBackground: "var(--colorNeutralCardBackground)",
	colorNeutralCardBackgroundHover: "var(--colorNeutralCardBackgroundHover)",
	colorNeutralCardBackgroundPressed: "var(--colorNeutralCardBackgroundPressed)",
	colorNeutralCardBackgroundSelected: "var(--colorNeutralCardBackgroundSelected)",
	colorNeutralCardBackgroundDisabled: "var(--colorNeutralCardBackgroundDisabled)",
	colorNeutralStrokeAccessible: "var(--colorNeutralStrokeAccessible)",
	colorNeutralStrokeAccessibleHover: "var(--colorNeutralStrokeAccessibleHover)",
	colorNeutralStrokeAccessiblePressed: "var(--colorNeutralStrokeAccessiblePressed)",
	colorNeutralStrokeAccessibleSelected: "var(--colorNeutralStrokeAccessibleSelected)",
	colorNeutralStroke1: "var(--colorNeutralStroke1)",
	colorNeutralStroke1Hover: "var(--colorNeutralStroke1Hover)",
	colorNeutralStroke1Pressed: "var(--colorNeutralStroke1Pressed)",
	colorNeutralStroke1Selected: "var(--colorNeutralStroke1Selected)",
	colorNeutralStroke2: "var(--colorNeutralStroke2)",
	colorNeutralStroke3: "var(--colorNeutralStroke3)",
	colorNeutralStroke4: "var(--colorNeutralStroke4)",
	colorNeutralStroke4Hover: "var(--colorNeutralStroke4Hover)",
	colorNeutralStroke4Pressed: "var(--colorNeutralStroke4Pressed)",
	colorNeutralStroke4Selected: "var(--colorNeutralStroke4Selected)",
	colorNeutralStrokeSubtle: "var(--colorNeutralStrokeSubtle)",
	colorNeutralStrokeOnBrand: "var(--colorNeutralStrokeOnBrand)",
	colorNeutralStrokeOnBrand2: "var(--colorNeutralStrokeOnBrand2)",
	colorNeutralStrokeOnBrand2Hover: "var(--colorNeutralStrokeOnBrand2Hover)",
	colorNeutralStrokeOnBrand2Pressed: "var(--colorNeutralStrokeOnBrand2Pressed)",
	colorNeutralStrokeOnBrand2Selected: "var(--colorNeutralStrokeOnBrand2Selected)",
	colorBrandStroke1: "var(--colorBrandStroke1)",
	colorBrandStroke2: "var(--colorBrandStroke2)",
	colorBrandStroke2Hover: "var(--colorBrandStroke2Hover)",
	colorBrandStroke2Pressed: "var(--colorBrandStroke2Pressed)",
	colorBrandStroke2Contrast: "var(--colorBrandStroke2Contrast)",
	colorCompoundBrandStroke: "var(--colorCompoundBrandStroke)",
	colorCompoundBrandStrokeHover: "var(--colorCompoundBrandStrokeHover)",
	colorCompoundBrandStrokePressed: "var(--colorCompoundBrandStrokePressed)",
	colorNeutralStrokeDisabled: "var(--colorNeutralStrokeDisabled)",
	colorNeutralStrokeDisabled2: "var(--colorNeutralStrokeDisabled2)",
	colorNeutralStrokeInvertedDisabled: "var(--colorNeutralStrokeInvertedDisabled)",
	colorTransparentStroke: "var(--colorTransparentStroke)",
	colorTransparentStrokeInteractive: "var(--colorTransparentStrokeInteractive)",
	colorTransparentStrokeDisabled: "var(--colorTransparentStrokeDisabled)",
	colorNeutralStrokeAlpha: "var(--colorNeutralStrokeAlpha)",
	colorNeutralStrokeAlpha2: "var(--colorNeutralStrokeAlpha2)",
	colorStrokeFocus1: "var(--colorStrokeFocus1)",
	colorStrokeFocus2: "var(--colorStrokeFocus2)",
	colorNeutralShadowAmbient: "var(--colorNeutralShadowAmbient)",
	colorNeutralShadowKey: "var(--colorNeutralShadowKey)",
	colorNeutralShadowAmbientLighter: "var(--colorNeutralShadowAmbientLighter)",
	colorNeutralShadowKeyLighter: "var(--colorNeutralShadowKeyLighter)",
	colorNeutralShadowAmbientDarker: "var(--colorNeutralShadowAmbientDarker)",
	colorNeutralShadowKeyDarker: "var(--colorNeutralShadowKeyDarker)",
	colorBrandShadowAmbient: "var(--colorBrandShadowAmbient)",
	colorBrandShadowKey: "var(--colorBrandShadowKey)",
	colorPaletteRedBackground1: "var(--colorPaletteRedBackground1)",
	colorPaletteRedBackground2: "var(--colorPaletteRedBackground2)",
	colorPaletteRedBackground3: "var(--colorPaletteRedBackground3)",
	colorPaletteRedBorderActive: "var(--colorPaletteRedBorderActive)",
	colorPaletteRedBorder1: "var(--colorPaletteRedBorder1)",
	colorPaletteRedBorder2: "var(--colorPaletteRedBorder2)",
	colorPaletteRedForeground1: "var(--colorPaletteRedForeground1)",
	colorPaletteRedForeground2: "var(--colorPaletteRedForeground2)",
	colorPaletteRedForeground3: "var(--colorPaletteRedForeground3)",
	colorPaletteRedForegroundInverted: "var(--colorPaletteRedForegroundInverted)",
	colorPaletteGreenBackground1: "var(--colorPaletteGreenBackground1)",
	colorPaletteGreenBackground2: "var(--colorPaletteGreenBackground2)",
	colorPaletteGreenBackground3: "var(--colorPaletteGreenBackground3)",
	colorPaletteGreenBorderActive: "var(--colorPaletteGreenBorderActive)",
	colorPaletteGreenBorder1: "var(--colorPaletteGreenBorder1)",
	colorPaletteGreenBorder2: "var(--colorPaletteGreenBorder2)",
	colorPaletteGreenForeground1: "var(--colorPaletteGreenForeground1)",
	colorPaletteGreenForeground2: "var(--colorPaletteGreenForeground2)",
	colorPaletteGreenForeground3: "var(--colorPaletteGreenForeground3)",
	colorPaletteGreenForegroundInverted: "var(--colorPaletteGreenForegroundInverted)",
	colorPaletteDarkOrangeBackground1: "var(--colorPaletteDarkOrangeBackground1)",
	colorPaletteDarkOrangeBackground2: "var(--colorPaletteDarkOrangeBackground2)",
	colorPaletteDarkOrangeBackground3: "var(--colorPaletteDarkOrangeBackground3)",
	colorPaletteDarkOrangeBorderActive: "var(--colorPaletteDarkOrangeBorderActive)",
	colorPaletteDarkOrangeBorder1: "var(--colorPaletteDarkOrangeBorder1)",
	colorPaletteDarkOrangeBorder2: "var(--colorPaletteDarkOrangeBorder2)",
	colorPaletteDarkOrangeForeground1: "var(--colorPaletteDarkOrangeForeground1)",
	colorPaletteDarkOrangeForeground2: "var(--colorPaletteDarkOrangeForeground2)",
	colorPaletteDarkOrangeForeground3: "var(--colorPaletteDarkOrangeForeground3)",
	colorPaletteYellowBackground1: "var(--colorPaletteYellowBackground1)",
	colorPaletteYellowBackground2: "var(--colorPaletteYellowBackground2)",
	colorPaletteYellowBackground3: "var(--colorPaletteYellowBackground3)",
	colorPaletteYellowBorderActive: "var(--colorPaletteYellowBorderActive)",
	colorPaletteYellowBorder1: "var(--colorPaletteYellowBorder1)",
	colorPaletteYellowBorder2: "var(--colorPaletteYellowBorder2)",
	colorPaletteYellowForeground1: "var(--colorPaletteYellowForeground1)",
	colorPaletteYellowForeground2: "var(--colorPaletteYellowForeground2)",
	colorPaletteYellowForeground3: "var(--colorPaletteYellowForeground3)",
	colorPaletteYellowForegroundInverted: "var(--colorPaletteYellowForegroundInverted)",
	colorPaletteBerryBackground1: "var(--colorPaletteBerryBackground1)",
	colorPaletteBerryBackground2: "var(--colorPaletteBerryBackground2)",
	colorPaletteBerryBackground3: "var(--colorPaletteBerryBackground3)",
	colorPaletteBerryBorderActive: "var(--colorPaletteBerryBorderActive)",
	colorPaletteBerryBorder1: "var(--colorPaletteBerryBorder1)",
	colorPaletteBerryBorder2: "var(--colorPaletteBerryBorder2)",
	colorPaletteBerryForeground1: "var(--colorPaletteBerryForeground1)",
	colorPaletteBerryForeground2: "var(--colorPaletteBerryForeground2)",
	colorPaletteBerryForeground3: "var(--colorPaletteBerryForeground3)",
	colorPaletteMarigoldBackground1: "var(--colorPaletteMarigoldBackground1)",
	colorPaletteMarigoldBackground2: "var(--colorPaletteMarigoldBackground2)",
	colorPaletteMarigoldBackground3: "var(--colorPaletteMarigoldBackground3)",
	colorPaletteMarigoldBorderActive: "var(--colorPaletteMarigoldBorderActive)",
	colorPaletteMarigoldBorder1: "var(--colorPaletteMarigoldBorder1)",
	colorPaletteMarigoldBorder2: "var(--colorPaletteMarigoldBorder2)",
	colorPaletteMarigoldForeground1: "var(--colorPaletteMarigoldForeground1)",
	colorPaletteMarigoldForeground2: "var(--colorPaletteMarigoldForeground2)",
	colorPaletteMarigoldForeground3: "var(--colorPaletteMarigoldForeground3)",
	colorPaletteLightGreenBackground1: "var(--colorPaletteLightGreenBackground1)",
	colorPaletteLightGreenBackground2: "var(--colorPaletteLightGreenBackground2)",
	colorPaletteLightGreenBackground3: "var(--colorPaletteLightGreenBackground3)",
	colorPaletteLightGreenBorderActive: "var(--colorPaletteLightGreenBorderActive)",
	colorPaletteLightGreenBorder1: "var(--colorPaletteLightGreenBorder1)",
	colorPaletteLightGreenBorder2: "var(--colorPaletteLightGreenBorder2)",
	colorPaletteLightGreenForeground1: "var(--colorPaletteLightGreenForeground1)",
	colorPaletteLightGreenForeground2: "var(--colorPaletteLightGreenForeground2)",
	colorPaletteLightGreenForeground3: "var(--colorPaletteLightGreenForeground3)",
	colorPaletteAnchorBackground2: "var(--colorPaletteAnchorBackground2)",
	colorPaletteAnchorBorderActive: "var(--colorPaletteAnchorBorderActive)",
	colorPaletteAnchorForeground2: "var(--colorPaletteAnchorForeground2)",
	colorPaletteBeigeBackground2: "var(--colorPaletteBeigeBackground2)",
	colorPaletteBeigeBorderActive: "var(--colorPaletteBeigeBorderActive)",
	colorPaletteBeigeForeground2: "var(--colorPaletteBeigeForeground2)",
	colorPaletteBlueBackground2: "var(--colorPaletteBlueBackground2)",
	colorPaletteBlueBorderActive: "var(--colorPaletteBlueBorderActive)",
	colorPaletteBlueForeground2: "var(--colorPaletteBlueForeground2)",
	colorPaletteBrassBackground2: "var(--colorPaletteBrassBackground2)",
	colorPaletteBrassBorderActive: "var(--colorPaletteBrassBorderActive)",
	colorPaletteBrassForeground2: "var(--colorPaletteBrassForeground2)",
	colorPaletteBrownBackground2: "var(--colorPaletteBrownBackground2)",
	colorPaletteBrownBorderActive: "var(--colorPaletteBrownBorderActive)",
	colorPaletteBrownForeground2: "var(--colorPaletteBrownForeground2)",
	colorPaletteCornflowerBackground2: "var(--colorPaletteCornflowerBackground2)",
	colorPaletteCornflowerBorderActive: "var(--colorPaletteCornflowerBorderActive)",
	colorPaletteCornflowerForeground2: "var(--colorPaletteCornflowerForeground2)",
	colorPaletteCranberryBackground2: "var(--colorPaletteCranberryBackground2)",
	colorPaletteCranberryBorderActive: "var(--colorPaletteCranberryBorderActive)",
	colorPaletteCranberryForeground2: "var(--colorPaletteCranberryForeground2)",
	colorPaletteDarkGreenBackground2: "var(--colorPaletteDarkGreenBackground2)",
	colorPaletteDarkGreenBorderActive: "var(--colorPaletteDarkGreenBorderActive)",
	colorPaletteDarkGreenForeground2: "var(--colorPaletteDarkGreenForeground2)",
	colorPaletteDarkRedBackground2: "var(--colorPaletteDarkRedBackground2)",
	colorPaletteDarkRedBorderActive: "var(--colorPaletteDarkRedBorderActive)",
	colorPaletteDarkRedForeground2: "var(--colorPaletteDarkRedForeground2)",
	colorPaletteForestBackground2: "var(--colorPaletteForestBackground2)",
	colorPaletteForestBorderActive: "var(--colorPaletteForestBorderActive)",
	colorPaletteForestForeground2: "var(--colorPaletteForestForeground2)",
	colorPaletteGoldBackground2: "var(--colorPaletteGoldBackground2)",
	colorPaletteGoldBorderActive: "var(--colorPaletteGoldBorderActive)",
	colorPaletteGoldForeground2: "var(--colorPaletteGoldForeground2)",
	colorPaletteGrapeBackground2: "var(--colorPaletteGrapeBackground2)",
	colorPaletteGrapeBorderActive: "var(--colorPaletteGrapeBorderActive)",
	colorPaletteGrapeForeground2: "var(--colorPaletteGrapeForeground2)",
	colorPaletteLavenderBackground2: "var(--colorPaletteLavenderBackground2)",
	colorPaletteLavenderBorderActive: "var(--colorPaletteLavenderBorderActive)",
	colorPaletteLavenderForeground2: "var(--colorPaletteLavenderForeground2)",
	colorPaletteLightTealBackground2: "var(--colorPaletteLightTealBackground2)",
	colorPaletteLightTealBorderActive: "var(--colorPaletteLightTealBorderActive)",
	colorPaletteLightTealForeground2: "var(--colorPaletteLightTealForeground2)",
	colorPaletteLilacBackground2: "var(--colorPaletteLilacBackground2)",
	colorPaletteLilacBorderActive: "var(--colorPaletteLilacBorderActive)",
	colorPaletteLilacForeground2: "var(--colorPaletteLilacForeground2)",
	colorPaletteMagentaBackground2: "var(--colorPaletteMagentaBackground2)",
	colorPaletteMagentaBorderActive: "var(--colorPaletteMagentaBorderActive)",
	colorPaletteMagentaForeground2: "var(--colorPaletteMagentaForeground2)",
	colorPaletteMinkBackground2: "var(--colorPaletteMinkBackground2)",
	colorPaletteMinkBorderActive: "var(--colorPaletteMinkBorderActive)",
	colorPaletteMinkForeground2: "var(--colorPaletteMinkForeground2)",
	colorPaletteNavyBackground2: "var(--colorPaletteNavyBackground2)",
	colorPaletteNavyBorderActive: "var(--colorPaletteNavyBorderActive)",
	colorPaletteNavyForeground2: "var(--colorPaletteNavyForeground2)",
	colorPalettePeachBackground2: "var(--colorPalettePeachBackground2)",
	colorPalettePeachBorderActive: "var(--colorPalettePeachBorderActive)",
	colorPalettePeachForeground2: "var(--colorPalettePeachForeground2)",
	colorPalettePinkBackground2: "var(--colorPalettePinkBackground2)",
	colorPalettePinkBorderActive: "var(--colorPalettePinkBorderActive)",
	colorPalettePinkForeground2: "var(--colorPalettePinkForeground2)",
	colorPalettePlatinumBackground2: "var(--colorPalettePlatinumBackground2)",
	colorPalettePlatinumBorderActive: "var(--colorPalettePlatinumBorderActive)",
	colorPalettePlatinumForeground2: "var(--colorPalettePlatinumForeground2)",
	colorPalettePlumBackground2: "var(--colorPalettePlumBackground2)",
	colorPalettePlumBorderActive: "var(--colorPalettePlumBorderActive)",
	colorPalettePlumForeground2: "var(--colorPalettePlumForeground2)",
	colorPalettePumpkinBackground2: "var(--colorPalettePumpkinBackground2)",
	colorPalettePumpkinBorderActive: "var(--colorPalettePumpkinBorderActive)",
	colorPalettePumpkinForeground2: "var(--colorPalettePumpkinForeground2)",
	colorPalettePurpleBackground2: "var(--colorPalettePurpleBackground2)",
	colorPalettePurpleBorderActive: "var(--colorPalettePurpleBorderActive)",
	colorPalettePurpleForeground2: "var(--colorPalettePurpleForeground2)",
	colorPaletteRoyalBlueBackground2: "var(--colorPaletteRoyalBlueBackground2)",
	colorPaletteRoyalBlueBorderActive: "var(--colorPaletteRoyalBlueBorderActive)",
	colorPaletteRoyalBlueForeground2: "var(--colorPaletteRoyalBlueForeground2)",
	colorPaletteSeafoamBackground2: "var(--colorPaletteSeafoamBackground2)",
	colorPaletteSeafoamBorderActive: "var(--colorPaletteSeafoamBorderActive)",
	colorPaletteSeafoamForeground2: "var(--colorPaletteSeafoamForeground2)",
	colorPaletteSteelBackground2: "var(--colorPaletteSteelBackground2)",
	colorPaletteSteelBorderActive: "var(--colorPaletteSteelBorderActive)",
	colorPaletteSteelForeground2: "var(--colorPaletteSteelForeground2)",
	colorPaletteTealBackground2: "var(--colorPaletteTealBackground2)",
	colorPaletteTealBorderActive: "var(--colorPaletteTealBorderActive)",
	colorPaletteTealForeground2: "var(--colorPaletteTealForeground2)",
	colorStatusSuccessBackground1: "var(--colorStatusSuccessBackground1)",
	colorStatusSuccessBackground2: "var(--colorStatusSuccessBackground2)",
	colorStatusSuccessBackground3: "var(--colorStatusSuccessBackground3)",
	colorStatusSuccessForeground1: "var(--colorStatusSuccessForeground1)",
	colorStatusSuccessForeground2: "var(--colorStatusSuccessForeground2)",
	colorStatusSuccessForeground3: "var(--colorStatusSuccessForeground3)",
	colorStatusSuccessForegroundInverted: "var(--colorStatusSuccessForegroundInverted)",
	colorStatusSuccessBorderActive: "var(--colorStatusSuccessBorderActive)",
	colorStatusSuccessBorder1: "var(--colorStatusSuccessBorder1)",
	colorStatusSuccessBorder2: "var(--colorStatusSuccessBorder2)",
	colorStatusWarningBackground1: "var(--colorStatusWarningBackground1)",
	colorStatusWarningBackground2: "var(--colorStatusWarningBackground2)",
	colorStatusWarningBackground3: "var(--colorStatusWarningBackground3)",
	colorStatusWarningForeground1: "var(--colorStatusWarningForeground1)",
	colorStatusWarningForeground2: "var(--colorStatusWarningForeground2)",
	colorStatusWarningForeground3: "var(--colorStatusWarningForeground3)",
	colorStatusWarningForegroundInverted: "var(--colorStatusWarningForegroundInverted)",
	colorStatusWarningBorderActive: "var(--colorStatusWarningBorderActive)",
	colorStatusWarningBorder1: "var(--colorStatusWarningBorder1)",
	colorStatusWarningBorder2: "var(--colorStatusWarningBorder2)",
	colorStatusDangerBackground1: "var(--colorStatusDangerBackground1)",
	colorStatusDangerBackground2: "var(--colorStatusDangerBackground2)",
	colorStatusDangerBackground3: "var(--colorStatusDangerBackground3)",
	colorStatusDangerBackground3Hover: "var(--colorStatusDangerBackground3Hover)",
	colorStatusDangerBackground3Pressed: "var(--colorStatusDangerBackground3Pressed)",
	colorStatusDangerForeground1: "var(--colorStatusDangerForeground1)",
	colorStatusDangerForeground2: "var(--colorStatusDangerForeground2)",
	colorStatusDangerForeground3: "var(--colorStatusDangerForeground3)",
	colorStatusDangerForegroundInverted: "var(--colorStatusDangerForegroundInverted)",
	colorStatusDangerBorderActive: "var(--colorStatusDangerBorderActive)",
	colorStatusDangerBorder1: "var(--colorStatusDangerBorder1)",
	colorStatusDangerBorder2: "var(--colorStatusDangerBorder2)",
	borderRadiusNone: "var(--borderRadiusNone)",
	borderRadiusSmall: "var(--borderRadiusSmall)",
	borderRadiusMedium: "var(--borderRadiusMedium)",
	borderRadiusLarge: "var(--borderRadiusLarge)",
	borderRadiusXLarge: "var(--borderRadiusXLarge)",
	borderRadius2XLarge: "var(--borderRadius2XLarge)",
	borderRadius3XLarge: "var(--borderRadius3XLarge)",
	borderRadius4XLarge: "var(--borderRadius4XLarge)",
	borderRadius5XLarge: "var(--borderRadius5XLarge)",
	borderRadius6XLarge: "var(--borderRadius6XLarge)",
	borderRadiusCircular: "var(--borderRadiusCircular)",
	fontFamilyBase: "var(--fontFamilyBase)",
	fontFamilyMonospace: "var(--fontFamilyMonospace)",
	fontFamilyNumeric: "var(--fontFamilyNumeric)",
	fontSizeBase100: "var(--fontSizeBase100)",
	fontSizeBase200: "var(--fontSizeBase200)",
	fontSizeBase300: "var(--fontSizeBase300)",
	fontSizeBase400: "var(--fontSizeBase400)",
	fontSizeBase500: "var(--fontSizeBase500)",
	fontSizeBase600: "var(--fontSizeBase600)",
	fontSizeHero700: "var(--fontSizeHero700)",
	fontSizeHero800: "var(--fontSizeHero800)",
	fontSizeHero900: "var(--fontSizeHero900)",
	fontSizeHero1000: "var(--fontSizeHero1000)",
	fontWeightRegular: "var(--fontWeightRegular)",
	fontWeightMedium: "var(--fontWeightMedium)",
	fontWeightSemibold: "var(--fontWeightSemibold)",
	fontWeightBold: "var(--fontWeightBold)",
	lineHeightBase100: "var(--lineHeightBase100)",
	lineHeightBase200: "var(--lineHeightBase200)",
	lineHeightBase300: "var(--lineHeightBase300)",
	lineHeightBase400: "var(--lineHeightBase400)",
	lineHeightBase500: "var(--lineHeightBase500)",
	lineHeightBase600: "var(--lineHeightBase600)",
	lineHeightHero700: "var(--lineHeightHero700)",
	lineHeightHero800: "var(--lineHeightHero800)",
	lineHeightHero900: "var(--lineHeightHero900)",
	lineHeightHero1000: "var(--lineHeightHero1000)",
	shadow2: "var(--shadow2)",
	shadow4: "var(--shadow4)",
	shadow8: "var(--shadow8)",
	shadow16: "var(--shadow16)",
	shadow28: "var(--shadow28)",
	shadow64: "var(--shadow64)",
	shadow2Brand: "var(--shadow2Brand)",
	shadow4Brand: "var(--shadow4Brand)",
	shadow8Brand: "var(--shadow8Brand)",
	shadow16Brand: "var(--shadow16Brand)",
	shadow28Brand: "var(--shadow28Brand)",
	shadow64Brand: "var(--shadow64Brand)",
	strokeWidthThin: "var(--strokeWidthThin)",
	strokeWidthThick: "var(--strokeWidthThick)",
	strokeWidthThicker: "var(--strokeWidthThicker)",
	strokeWidthThickest: "var(--strokeWidthThickest)",
	spacingHorizontalNone: "var(--spacingHorizontalNone)",
	spacingHorizontalXXS: "var(--spacingHorizontalXXS)",
	spacingHorizontalXS: "var(--spacingHorizontalXS)",
	spacingHorizontalSNudge: "var(--spacingHorizontalSNudge)",
	spacingHorizontalS: "var(--spacingHorizontalS)",
	spacingHorizontalMNudge: "var(--spacingHorizontalMNudge)",
	spacingHorizontalM: "var(--spacingHorizontalM)",
	spacingHorizontalL: "var(--spacingHorizontalL)",
	spacingHorizontalXL: "var(--spacingHorizontalXL)",
	spacingHorizontalXXL: "var(--spacingHorizontalXXL)",
	spacingHorizontalXXXL: "var(--spacingHorizontalXXXL)",
	spacingVerticalNone: "var(--spacingVerticalNone)",
	spacingVerticalXXS: "var(--spacingVerticalXXS)",
	spacingVerticalXS: "var(--spacingVerticalXS)",
	spacingVerticalSNudge: "var(--spacingVerticalSNudge)",
	spacingVerticalS: "var(--spacingVerticalS)",
	spacingVerticalMNudge: "var(--spacingVerticalMNudge)",
	spacingVerticalM: "var(--spacingVerticalM)",
	spacingVerticalL: "var(--spacingVerticalL)",
	spacingVerticalXL: "var(--spacingVerticalXL)",
	spacingVerticalXXL: "var(--spacingVerticalXXL)",
	spacingVerticalXXXL: "var(--spacingVerticalXXXL)",
	durationUltraFast: "var(--durationUltraFast)",
	durationFaster: "var(--durationFaster)",
	durationFast: "var(--durationFast)",
	durationNormal: "var(--durationNormal)",
	durationGentle: "var(--durationGentle)",
	durationSlow: "var(--durationSlow)",
	durationSlower: "var(--durationSlower)",
	durationUltraSlow: "var(--durationUltraSlow)",
	curveAccelerateMax: "var(--curveAccelerateMax)",
	curveAccelerateMid: "var(--curveAccelerateMid)",
	curveAccelerateMin: "var(--curveAccelerateMin)",
	curveDecelerateMax: "var(--curveDecelerateMax)",
	curveDecelerateMid: "var(--curveDecelerateMid)",
	curveDecelerateMin: "var(--curveDecelerateMin)",
	curveEasyEaseMax: "var(--curveEasyEaseMax)",
	curveEasyEase: "var(--curveEasyEase)",
	curveLinear: "var(--curveLinear)",
	zIndexBackground: "var(--zIndexBackground, 0)",
	zIndexContent: "var(--zIndexContent, 1)",
	zIndexOverlay: "var(--zIndexOverlay, 1000)",
	zIndexPopup: "var(--zIndexPopup, 2000)",
	zIndexMessages: "var(--zIndexMessages, 3000)",
	zIndexFloating: "var(--zIndexFloating, 4000)",
	zIndexPriority: "var(--zIndexPriority, 5000)",
	zIndexDebug: "var(--zIndexDebug, 6000)"
};
//#endregion
//#region node_modules/@fluentui/tokens/lib/utils/shadows.js
function il(e, t, n = "") {
	return {
		[`shadow2${n}`]: `0 0 2px ${e}, 0 1px 2px ${t}`,
		[`shadow4${n}`]: `0 0 2px ${e}, 0 2px 4px ${t}`,
		[`shadow8${n}`]: `0 0 2px ${e}, 0 4px 8px ${t}`,
		[`shadow16${n}`]: `0 0 2px ${e}, 0 8px 16px ${t}`,
		[`shadow28${n}`]: `0 0 8px ${e}, 0 14px 28px ${t}`,
		[`shadow64${n}`]: `0 0 8px ${e}, 0 32px 64px ${t}`
	};
}
//#endregion
//#region node_modules/@fluentui/tokens/lib/utils/createLightTheme.js
var al = (e) => {
	let t = Kc(e);
	return {
		...qc,
		...Xc,
		...Zc,
		...$c,
		...Qc,
		...rl,
		...tl,
		...nl,
		...Yc,
		...Jc,
		...t,
		...Wc,
		...Gc,
		...il(t.colorNeutralShadowAmbient, t.colorNeutralShadowKey),
		...il(t.colorBrandShadowAmbient, t.colorBrandShadowKey, "Brand")
	};
}, ol = {
	10: "#061724",
	20: "#082338",
	30: "#0a2e4a",
	40: "#0c3b5e",
	50: "#0e4775",
	60: "#0f548c",
	70: "#115ea3",
	80: "#0f6cbd",
	90: "#2886de",
	100: "#479ef5",
	110: "#62abf5",
	120: "#77b7f7",
	130: "#96c6fa",
	140: "#b4d6fa",
	150: "#cfe4fa",
	160: "#ebf3fc"
}, sl = zc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background1`]: U[t].shade40,
		[`colorPalette${n}Background2`]: U[t].shade30,
		[`colorPalette${n}Background3`]: U[t].primary,
		[`colorPalette${n}Foreground1`]: U[t].tint30,
		[`colorPalette${n}Foreground2`]: U[t].tint40,
		[`colorPalette${n}Foreground3`]: U[t].tint20,
		[`colorPalette${n}BorderActive`]: U[t].tint30,
		[`colorPalette${n}Border1`]: U[t].primary,
		[`colorPalette${n}Border2`]: U[t].tint20
	};
	return Object.assign(e, r);
}, {});
sl.colorPaletteRedForeground3 = U.red.tint30, sl.colorPaletteRedBorder2 = U.red.tint30, sl.colorPaletteGreenForeground3 = U.green.tint40, sl.colorPaletteGreenBorder2 = U.green.tint40, sl.colorPaletteDarkOrangeForeground3 = U.darkOrange.tint30, sl.colorPaletteDarkOrangeBorder2 = U.darkOrange.tint30, sl.colorPaletteRedForegroundInverted = U.red.primary, sl.colorPaletteGreenForegroundInverted = U.green.primary, sl.colorPaletteYellowForegroundInverted = U.yellow.shade30;
var cl = Bc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background2`]: Rc[t].shade30,
		[`colorPalette${n}Foreground2`]: Rc[t].tint40,
		[`colorPalette${n}BorderActive`]: Rc[t].tint30
	};
	return Object.assign(e, r);
}, {});
cl.colorPaletteDarkRedBackground2 = Rc.darkRed.shade20, cl.colorPalettePlumBackground2 = Rc.plum.shade20;
var ll = {
	...sl,
	...cl
}, ul = Object.entries(Vc).reduce((e, [t, n]) => {
	let r = t.slice(0, 1).toUpperCase() + t.slice(1), i = {
		[`colorStatus${r}Background1`]: W[n].shade40,
		[`colorStatus${r}Background2`]: W[n].shade30,
		[`colorStatus${r}Background3`]: W[n].primary,
		[`colorStatus${r}Foreground1`]: W[n].tint30,
		[`colorStatus${r}Foreground2`]: W[n].tint40,
		[`colorStatus${r}Foreground3`]: W[n].tint20,
		[`colorStatus${r}BorderActive`]: W[n].tint30,
		[`colorStatus${r}ForegroundInverted`]: W[n].shade10,
		[`colorStatus${r}Border1`]: W[n].primary,
		[`colorStatus${r}Border2`]: W[n].tint20
	};
	return Object.assign(e, i);
}, {});
ul.colorStatusDangerBackground3Hover = W[Vc.danger].shade10, ul.colorStatusDangerBackground3Pressed = W[Vc.danger].shade20, ul.colorStatusDangerForeground3 = W[Vc.danger].tint40, ul.colorStatusDangerBorder2 = W[Vc.danger].tint30, ul.colorStatusSuccessForeground3 = W[Vc.success].tint40, ul.colorStatusSuccessBorder2 = W[Vc.success].tint40, ul.colorStatusWarningForegroundInverted = W[Vc.warning].shade20;
//#endregion
//#region node_modules/@fluentui/tokens/lib/themes/web/lightTheme.js
var dl = al(ol), fl = (e) => ({
	colorNeutralForeground1: H,
	colorNeutralForeground1Hover: H,
	colorNeutralForeground1Pressed: H,
	colorNeutralForeground1Selected: H,
	colorNeutralForeground2: V[84],
	colorNeutralForeground2Hover: H,
	colorNeutralForeground2Pressed: H,
	colorNeutralForeground2Selected: H,
	colorNeutralForeground2BrandHover: e[100],
	colorNeutralForeground2BrandPressed: e[90],
	colorNeutralForeground2BrandSelected: e[100],
	colorNeutralForeground3: V[68],
	colorNeutralForeground3Hover: V[84],
	colorNeutralForeground3Pressed: V[84],
	colorNeutralForeground3Selected: V[84],
	colorNeutralForeground3BrandHover: e[100],
	colorNeutralForeground3BrandPressed: e[90],
	colorNeutralForeground3BrandSelected: e[100],
	colorNeutralForeground4: V[60],
	colorNeutralForeground5: V[68],
	colorNeutralForeground5Hover: H,
	colorNeutralForeground5Pressed: H,
	colorNeutralForeground5Selected: H,
	colorNeutralForegroundDisabled: V[36],
	colorNeutralForegroundInvertedDisabled: Xs[40],
	colorBrandForegroundLink: e[100],
	colorBrandForegroundLinkHover: e[110],
	colorBrandForegroundLinkPressed: e[90],
	colorBrandForegroundLinkSelected: e[100],
	colorNeutralForeground2Link: V[84],
	colorNeutralForeground2LinkHover: H,
	colorNeutralForeground2LinkPressed: H,
	colorNeutralForeground2LinkSelected: H,
	colorCompoundBrandForeground1: e[100],
	colorCompoundBrandForeground1Hover: e[110],
	colorCompoundBrandForeground1Pressed: e[90],
	colorBrandForeground1: e[100],
	colorBrandForeground2: e[110],
	colorBrandForeground2Hover: e[130],
	colorBrandForeground2Pressed: e[160],
	colorNeutralForeground1Static: V[14],
	colorNeutralForegroundStaticInverted: H,
	colorNeutralForegroundInverted: V[14],
	colorNeutralForegroundInvertedHover: V[14],
	colorNeutralForegroundInvertedPressed: V[14],
	colorNeutralForegroundInvertedSelected: V[14],
	colorNeutralForegroundInverted2: V[14],
	colorNeutralForegroundOnBrand: H,
	colorNeutralForegroundInvertedLink: H,
	colorNeutralForegroundInvertedLinkHover: H,
	colorNeutralForegroundInvertedLinkPressed: H,
	colorNeutralForegroundInvertedLinkSelected: H,
	colorBrandForegroundInverted: e[80],
	colorBrandForegroundInvertedHover: e[70],
	colorBrandForegroundInvertedPressed: e[60],
	colorBrandForegroundOnLight: e[80],
	colorBrandForegroundOnLightHover: e[70],
	colorBrandForegroundOnLightPressed: e[50],
	colorBrandForegroundOnLightSelected: e[60],
	colorNeutralBackground1: V[16],
	colorNeutralBackground1Hover: V[24],
	colorNeutralBackground1Pressed: V[12],
	colorNeutralBackground1Selected: V[22],
	colorNeutralBackground2: V[12],
	colorNeutralBackground2Hover: V[20],
	colorNeutralBackground2Pressed: V[8],
	colorNeutralBackground2Selected: V[18],
	colorNeutralBackground3: V[8],
	colorNeutralBackground3Hover: V[16],
	colorNeutralBackground3Pressed: V[4],
	colorNeutralBackground3Selected: V[14],
	colorNeutralBackground4: V[4],
	colorNeutralBackground4Hover: V[12],
	colorNeutralBackground4Pressed: tc,
	colorNeutralBackground4Selected: V[10],
	colorNeutralBackground5: tc,
	colorNeutralBackground5Hover: V[8],
	colorNeutralBackground5Pressed: V[2],
	colorNeutralBackground5Selected: V[6],
	colorNeutralBackground6: V[20],
	colorNeutralBackground7: "#00000000",
	colorNeutralBackground7Hover: V[10],
	colorNeutralBackground7Pressed: V[4],
	colorNeutralBackground7Selected: "#00000000",
	colorNeutralBackground8: V[16],
	colorNeutralBackgroundInverted: H,
	colorNeutralBackgroundInvertedHover: V[96],
	colorNeutralBackgroundInvertedPressed: V[88],
	colorNeutralBackgroundInvertedSelected: V[92],
	colorNeutralBackgroundStatic: V[24],
	colorNeutralBackgroundAlpha: Qs[50],
	colorNeutralBackgroundAlpha2: $s[70],
	colorSubtleBackground: "transparent",
	colorSubtleBackgroundHover: V[22],
	colorSubtleBackgroundPressed: V[18],
	colorSubtleBackgroundSelected: V[20],
	colorSubtleBackgroundLightAlphaHover: ec[80],
	colorSubtleBackgroundLightAlphaPressed: ec[50],
	colorSubtleBackgroundLightAlphaSelected: "transparent",
	colorSubtleBackgroundInverted: "transparent",
	colorSubtleBackgroundInvertedHover: Zs[10],
	colorSubtleBackgroundInvertedPressed: Zs[30],
	colorSubtleBackgroundInvertedSelected: Zs[20],
	colorTransparentBackground: "transparent",
	colorTransparentBackgroundHover: "transparent",
	colorTransparentBackgroundPressed: "transparent",
	colorTransparentBackgroundSelected: "transparent",
	colorNeutralBackgroundDisabled: V[8],
	colorNeutralBackgroundDisabled2: V[16],
	colorNeutralBackgroundInvertedDisabled: Xs[10],
	colorNeutralStencil1: V[34],
	colorNeutralStencil2: V[20],
	colorNeutralStencil1Alpha: Xs[10],
	colorNeutralStencil2Alpha: Xs[5],
	colorBackgroundOverlay: Zs[50],
	colorScrollbarOverlay: Xs[60],
	colorBrandBackground: e[70],
	colorBrandBackgroundHover: e[80],
	colorBrandBackgroundPressed: e[40],
	colorBrandBackgroundSelected: e[60],
	colorCompoundBrandBackground: e[100],
	colorCompoundBrandBackgroundHover: e[110],
	colorCompoundBrandBackgroundPressed: e[90],
	colorBrandBackgroundStatic: e[80],
	colorBrandBackground2: e[20],
	colorBrandBackground2Hover: e[40],
	colorBrandBackground2Pressed: e[10],
	colorBrandBackground3Static: e[60],
	colorBrandBackground4Static: e[40],
	colorBrandBackgroundInverted: H,
	colorBrandBackgroundInvertedHover: e[160],
	colorBrandBackgroundInvertedPressed: e[140],
	colorBrandBackgroundInvertedSelected: e[150],
	colorNeutralCardBackground: V[20],
	colorNeutralCardBackgroundHover: V[24],
	colorNeutralCardBackgroundPressed: V[18],
	colorNeutralCardBackgroundSelected: V[22],
	colorNeutralCardBackgroundDisabled: V[8],
	colorNeutralStrokeAccessible: V[68],
	colorNeutralStrokeAccessibleHover: V[74],
	colorNeutralStrokeAccessiblePressed: V[70],
	colorNeutralStrokeAccessibleSelected: e[100],
	colorNeutralStroke1: V[40],
	colorNeutralStroke1Hover: V[46],
	colorNeutralStroke1Pressed: V[42],
	colorNeutralStroke1Selected: V[44],
	colorNeutralStroke2: V[32],
	colorNeutralStroke3: V[24],
	colorNeutralStroke4: V[24],
	colorNeutralStroke4Hover: V[18],
	colorNeutralStroke4Pressed: V[14],
	colorNeutralStroke4Selected: V[24],
	colorNeutralStrokeSubtle: V[4],
	colorNeutralStrokeOnBrand: V[16],
	colorNeutralStrokeOnBrand2: H,
	colorNeutralStrokeOnBrand2Hover: H,
	colorNeutralStrokeOnBrand2Pressed: H,
	colorNeutralStrokeOnBrand2Selected: H,
	colorBrandStroke1: e[100],
	colorBrandStroke2: e[50],
	colorBrandStroke2Hover: e[50],
	colorBrandStroke2Pressed: e[30],
	colorBrandStroke2Contrast: e[50],
	colorCompoundBrandStroke: e[100],
	colorCompoundBrandStrokeHover: e[110],
	colorCompoundBrandStrokePressed: e[90],
	colorNeutralStrokeDisabled: V[26],
	colorNeutralStrokeDisabled2: V[24],
	colorNeutralStrokeInvertedDisabled: Xs[40],
	colorTransparentStroke: "transparent",
	colorTransparentStrokeInteractive: "transparent",
	colorTransparentStrokeDisabled: "transparent",
	colorNeutralStrokeAlpha: Xs[10],
	colorNeutralStrokeAlpha2: Xs[20],
	colorStrokeFocus1: tc,
	colorStrokeFocus2: H,
	colorNeutralShadowAmbient: "rgba(0,0,0,0.24)",
	colorNeutralShadowKey: "rgba(0,0,0,0.28)",
	colorNeutralShadowAmbientLighter: "rgba(0,0,0,0.12)",
	colorNeutralShadowKeyLighter: "rgba(0,0,0,0.14)",
	colorNeutralShadowAmbientDarker: "rgba(0,0,0,0.40)",
	colorNeutralShadowKeyDarker: "rgba(0,0,0,0.48)",
	colorBrandShadowAmbient: "rgba(0,0,0,0.30)",
	colorBrandShadowKey: "rgba(0,0,0,0.25)"
}), pl = ((e) => {
	let t = fl(e);
	return {
		...qc,
		...Xc,
		...Zc,
		...$c,
		...Qc,
		...rl,
		...tl,
		...nl,
		...Yc,
		...Jc,
		...t,
		...ll,
		...ul,
		...il(t.colorNeutralShadowAmbient, t.colorNeutralShadowKey),
		...il(t.colorBrandShadowAmbient, t.colorBrandShadowKey, "Brand")
	};
})(ol), ml = { root: "fui-FluentProvider" }, hl = /*#__PURE__*/ In({ root: {
	sj55zd: "f19n0e5",
	De3pzq: "fxugw4r",
	fsow6f: ["f1o700av", "fes3tcz"],
	Bahqtrf: "fk6fouc",
	Be2twd7: "fkhj508",
	Bhrd7zp: "figsok6",
	Bg96gwp: "f1i3iumi"
} }, { d: [
	".f19n0e5{color:var(--colorNeutralForeground1);}",
	".fxugw4r{background-color:var(--colorNeutralBackground1);}",
	".f1o700av{text-align:left;}",
	".fes3tcz{text-align:right;}",
	".fk6fouc{font-family:var(--fontFamilyBase);}",
	".fkhj508{font-size:var(--fontSizeBase300);}",
	".figsok6{font-weight:var(--fontWeightRegular);}",
	".f1i3iumi{line-height:var(--lineHeightBase300);}"
] }), gl = (e) => {
	let t = Un(), n = hl({
		dir: e.dir,
		renderer: t
	});
	return e.root.className = O(ml.root, e.themeClassName, n.root, e.root.className), e;
}, _l = N.useInsertionEffect ? N.useInsertionEffect : yi, vl = (e, t) => {
	if (!e?.head) return;
	let n = e.createElement("style");
	return Object.keys(t).forEach((e) => {
		n.setAttribute(e, t[e]);
	}), e.head.appendChild(n), n;
}, yl = (e, t) => {
	let n = e.sheet;
	n && (n.cssRules.length > 0 && n.deleteRule(0), n.insertRule(t, 0));
}, bl = (e) => {
	let { targetDocument: t, theme: n, rendererAttributes: r } = e, i = N.useRef(void 0), a = wi(ml.root), o = r, s = N.useMemo(() => Zn(`.${a}`, n), [n, a]);
	return xl(t, a), _l(() => {
		let e = t?.getElementById(a);
		return e ? i.current = e : (i.current = vl(t, {
			...o,
			id: a
		}), i.current && yl(i.current, s)), () => {
			var e;
			(e = i.current) == null || e.remove();
		};
	}, [
		a,
		t,
		s,
		o
	]), {
		styleTagId: a,
		rule: s
	};
};
function xl(e, t) {
	N.useState(() => {
		if (!e) return;
		let n = e.getElementById(t);
		n && e.head.append(n);
	});
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/useFluentProvider.js
var Sl = {}, Cl = {}, wl = (e, t) => {
	let n = Zr(), r = El(), i = ei(), a = N.useContext(ti) || Sl, { applyStylesToPortals: o = !0, customStyleHooks_unstable: s, dir: c = n.dir, targetDocument: l = n.targetDocument, theme: u, overrides_unstable: d = {} } = e, f = Tl(r, u), p = Tl(i, d), m = Tl(a, s), h = Un(), { styleTagId: g, rule: _ } = bl({
		theme: f,
		targetDocument: l,
		rendererAttributes: h.styleElementAttributes ?? Cl
	});
	return {
		applyStylesToPortals: o,
		customStyleHooks_unstable: m,
		dir: c,
		targetDocument: l,
		theme: f,
		overrides_unstable: p,
		themeClassName: g,
		components: { root: "div" },
		root: tr(Ir("div", {
			...e,
			dir: c,
			ref: Ti(t, Ls({ targetDocument: l }))
		}), { elementType: "div" }),
		serverStyleProps: {
			cssRule: _,
			attributes: {
				...h.styleElementAttributes,
				id: g
			}
		}
	};
};
function Tl(e, t) {
	return e && t ? {
		...e,
		...t
	} : e || t;
}
function El() {
	return N.useContext(Rr);
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/useFluentProviderContextValues.js
function Dl(e) {
	let { applyStylesToPortals: t, customStyleHooks_unstable: n, dir: r, root: i, targetDocument: a, theme: o, themeClassName: s, overrides_unstable: c } = e, l = N.useMemo(() => ({
		dir: r,
		targetDocument: a
	}), [r, a]), [u] = N.useState(() => ({}));
	return {
		customStyleHooks_unstable: n,
		overrides_unstable: c,
		provider: l,
		textDirection: r,
		iconDirection: N.useMemo(() => ({ textDirection: r }), [r]),
		tooltip: u,
		theme: o,
		themeClassName: t ? i.className : s
	};
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/FluentProvider.js
var Ol = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = wl(e, t);
	return gl(n), oa(n, Dl(n));
});
Ol.displayName = "FluentProvider";
//#endregion
//#region node_modules/@fluentui/react-context-selector/lib/createContext.js
var kl = p(), Al = (e) => (t) => {
	let n = N.useRef(t.value), r = N.useRef(null);
	return r.current ||= {
		value: n,
		listeners: []
	}, yi(() => {
		n.current = t.value, (0, kl.unstable_runWithPriority)(kl.unstable_NormalPriority, () => {
			r.current.listeners.forEach((e) => {
				e(t.value);
			});
		});
	}, [t.value]), N.createElement(e, { value: r.current }, t.children);
}, jl = (e) => {
	let t = N.createContext({
		value: { current: e },
		listeners: [],
		isDefault: !0
	});
	return t.Provider = Al(t.Provider), delete t.Consumer, t;
}, Ml = (e, t) => {
	let { value: n, listeners: r } = N.useContext(e), i = t(n.current), [, a] = N.useReducer((e) => e + 1, 0), o = N.useRef(t), s = N.useRef(i);
	return yi(() => {
		o.current = t, s.current = i;
	}), yi(() => {
		let e = (e) => {
			try {
				let t = o.current(e);
				Object.is(s.current, t) || a();
			} catch {}
		};
		return r.push(e), e(n.current), () => {
			let t = r.indexOf(e);
			t !== -1 && r.splice(t, 1);
		};
	}, [r, n]), i;
};
//#endregion
//#region node_modules/@fluentui/react-context-selector/lib/useHasParentContext.js
function Nl(e) {
	return !N.useContext(e).isDefault;
}
var Pl = "ArrowLeft", Fl = "ArrowRight";
//#endregion
//#region node_modules/@fluentui/react-aria/lib/button/useARIAButtonProps.js
function Il(e, t) {
	let { disabled: n, disabledFocusable: r = !1, "aria-disabled": i, onClick: a, onKeyDown: o, onKeyUp: s, ...c } = t ?? {}, l = typeof i == "string" ? i === "true" : i, u = n || r || l, d = I((e) => {
		u ? (e.preventDefault(), e.stopPropagation()) : a?.(e);
	}), f = I((e) => {
		if (o?.(e), e.isDefaultPrevented()) return;
		let t = e.key;
		u && (t === "Enter" || t === " ") ? (e.preventDefault(), e.stopPropagation()) : t === " " ? e.preventDefault() : t === "Enter" && (e.preventDefault(), e.currentTarget.click());
	}), p = I((e) => {
		if (s?.(e), e.isDefaultPrevented()) return;
		let t = e.key;
		u && (t === "Enter" || t === " ") ? (e.preventDefault(), e.stopPropagation()) : t === " " && (e.preventDefault(), e.currentTarget.click());
	});
	if (e === "button" || e === void 0) return {
		...c,
		disabled: n && !r,
		"aria-disabled": r ? !0 : l,
		onClick: r ? void 0 : d,
		onKeyUp: r ? void 0 : s,
		onKeyDown: r ? void 0 : o
	};
	{
		let t = !!c.href, i = t ? void 0 : "button";
		!i && u && (i = "link");
		let a = {
			role: i,
			tabIndex: r || !t && !n ? 0 : void 0,
			...c,
			onClick: d,
			onKeyUp: p,
			onKeyDown: f,
			"aria-disabled": u
		};
		return e === "a" && u && (a.href = void 0), a;
	}
}
//#endregion
//#region node_modules/@fluentui/react-icons/lib/utils/useIconStyles.styles.js
var Ll = F({
	root: {
		mc9l5x: "f1w7gpdv",
		Bg96gwp: "fez10in"
	},
	rtl: { Bz10aip: "f13rod7r" }
}, { d: [
	".f1w7gpdv{display:inline;}",
	".fez10in{line-height:0;}",
	".f13rod7r{transform:scaleX(-1);}"
] }), Rl = "fui-Icon", zl = "fui-Icon-filled", Bl = "fui-Icon-regular", Vl = "data-fui-icon", Hl = (e, t) => {
	let { filled: n, idPrefix: r, title: i, primaryFill: a = "currentColor", ...o } = e, s = {
		...o,
		fill: a
	}, c = aa(), l = !!(t?.flipInRtl && c?.textDirection === "rtl");
	return i && (s["aria-label"] = i), !s["aria-label"] && !s["aria-labelledby"] ? s["aria-hidden"] = !0 : s.role = "img", s[Vl] = "", {
		state: s,
		isRtlFlip: l
	};
}, Ul = (e, t) => {
	let n = Ll(), { state: r, isRtlFlip: i } = Hl(e, t);
	return r.className = O(n.root, i && n.rtl, r.className), r;
}, Wl = F({ root: { B8gzw0y: "f1dd5bof" } }, { m: [["@media (forced-colors: active){.f1dd5bof{forced-color-adjust:auto;}}", { m: "(forced-colors: active)" }]] }), Gl = "url(#", Kl = (e, t, n) => {
	let [r, i, ...a] = e, o = i;
	if (n && i) {
		let e = {};
		for (let t in i) {
			let r = i[t];
			if (typeof r != "string") e[t] = r;
			else if (t === "id") e[t] = n + r;
			else {
				let i = r.indexOf(Gl);
				e[t] = i < 0 ? r : r.slice(0, i + 5) + n + r.slice(i + 5);
			}
		}
		o = e;
	}
	return N.createElement(r, {
		...o,
		key: t
	}, ...a.map((e, t) => Kl(e, t, n)));
}, ql = (e) => e === "1em" ? "20" : e, Jl = (e, t, n) => typeof e != "string" && (t?.color || Array.isArray(e[0])) ? e.map((e, t) => Kl(e, t, n)) : void 0, Yl = () => void 0, Xl = (e, t) => {
	let n = Jl(e, t);
	return n ? function(r) {
		return N.useMemo(() => r ? Jl(e, t, r) : n, [r]);
	} : Yl;
}, Zl = (e, t, n) => typeof t == "string" ? N.createElement("svg", {
	...e,
	dangerouslySetInnerHTML: { __html: t }
}) : n ? N.createElement("svg", e, ...n) : N.createElement("svg", e, ...t.map((t) => N.createElement("path", {
	d: t,
	fill: e.fill
}))), Ql = (e, t, n, r) => {
	let i = ql(t), a = Xl(n, r), o = N.forwardRef((e, o) => {
		let s = Wl(), c = Ul(e, { flipInRtl: r?.flipInRtl }), l = a(e.idPrefix);
		return Zl({
			...c,
			className: O(Rl, c.className, s.root),
			ref: o,
			width: t,
			height: t,
			viewBox: `0 0 ${i} ${i}`,
			xmlns: "http://www.w3.org/2000/svg"
		}, n, l);
	});
	return o.displayName = e, o;
}, $l = /*#__PURE__*/ Ql("CircleFilled", "1em", ["M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16"]), eu = /*#__PURE__*/ Ql("ChevronLeftFilled", "1em", ["M12.27 15.8a.75.75 0 0 1-1.06-.03l-5-5.25a.75.75 0 0 1 0-1.04l5-5.25a.75.75 0 1 1 1.08 1.04L7.8 10l4.5 4.73c.29.3.28.78-.02 1.06"]), tu = /*#__PURE__*/ Ql("ChevronLeftRegular", "1em", ["M12.35 15.85a.5.5 0 0 1-.7 0L6.16 10.4a.55.55 0 0 1 0-.78l5.49-5.46a.5.5 0 1 1 .7.7L7.2 10l5.16 5.15c.2.2.2.5 0 .7"]), nu = /*#__PURE__*/ Ql("ChevronRightFilled", "1em", ["M7.73 4.2a.75.75 0 0 1 1.06.03l5 5.25c.28.3.28.75 0 1.04l-5 5.25a.75.75 0 1 1-1.08-1.04L12.2 10l-4.5-4.73a.75.75 0 0 1 .02-1.06"]), ru = /*#__PURE__*/ Ql("ChevronRightRegular", "1em", ["M7.65 4.15c.2-.2.5-.2.7 0l5.49 5.46c.21.22.21.57 0 .78l-5.49 5.47a.5.5 0 0 1-.7-.71L12.8 10 7.65 4.85a.5.5 0 0 1 0-.7"]), K = /*#__PURE__*/ Ql("MoreHorizontal20Regular", "20", ["M6.25 10a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0m5 0a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0M15 11.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5"]), iu = /*#__PURE__*/ Ql("Stop20Filled", "20", ["M4.5 3C3.67 3 3 3.67 3 4.5v11c0 .83.67 1.5 1.5 1.5h11c.83 0 1.5-.67 1.5-1.5v-11c0-.83-.67-1.5-1.5-1.5z"]), au = /*#__PURE__*/ Ql("Warning12Filled", "12", ["M4.28 1.97a2 2 0 0 1 3.43 0l3 5A2 2 0 0 1 9 10H3A2 2 0 0 1 1.3 6.98zM6 6.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5M6 3.5a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V4a.5.5 0 0 0-.5-.5"]), ou = /*#__PURE__*/ Ql("FullScreenMaximize20Regular", "20", ["M3 5c0-1.1.9-2 2-2h2a.5.5 0 0 1 0 1H5a1 1 0 0 0-1 1v2a.5.5 0 0 1-1 0zm9.5-1.5c0-.28.22-.5.5-.5h2a2 2 0 0 1 2 2v2a.5.5 0 0 1-1 0V5a1 1 0 0 0-1-1h-2a.5.5 0 0 1-.5-.5m-9 9c.28 0 .5.22.5.5v2a1 1 0 0 0 1 1h2a.5.5 0 0 1 0 1H5a2 2 0 0 1-2-2v-2c0-.28.22-.5.5-.5m13 0c.28 0 .5.22.5.5v2a2 2 0 0 1-2 2h-2a.5.5 0 0 1 0-1h2a1 1 0 0 0 1-1v-2c0-.28.22-.5.5-.5"]), su = /*#__PURE__*/ Ql("Play20Filled", "20", ["M17.22 8.68a1.5 1.5 0 0 1 0 2.63l-10 5.5A1.5 1.5 0 0 1 5 15.5v-11A1.5 1.5 0 0 1 7.22 3.2z"]), cu = /*#__PURE__*/ Ql("ArrowNext20Regular", "20", ["M13.5 5a.5.5 0 0 1 .5.41v9.09a.5.5 0 0 1-1 .09V5.5c0-.28.22-.5.5-.5m-7.85.15a.5.5 0 0 1 .63-.06l.07.06 4.5 4.5c.18.17.2.44.06.63l-.06.07-4.5 4.5a.5.5 0 0 1-.76-.63l.06-.07L9.79 10 5.65 5.85a.5.5 0 0 1 0-.7"], { flipInRtl: !0 }), lu = /*#__PURE__*/ Ql("ArrowReset20Regular", "20", ["M5.85 2.65c.2.2.2.5 0 .7L4.21 5H11a6 6 0 1 1-6 6 .5.5 0 0 1 1 0 5 5 0 1 0 5-5H4.2l1.65 1.65a.5.5 0 1 1-.7.7l-2.5-2.5a.5.5 0 0 1 0-.7l2.5-2.5c.2-.2.5-.2.7 0"], { flipInRtl: !0 }), uu = /*#__PURE__*/ Ql("Pause20Filled", "20", ["M5 2a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm8 0a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"]), du = /*#__PURE__*/ Ql("CheckmarkCircle12Filled", "12", ["M1 6a5 5 0 1 1 10 0A5 5 0 0 1 1 6m7.35-.9a.5.5 0 1 0-.7-.7L5.5 6.54 4.35 5.4a.5.5 0 1 0-.7.7l1.5 1.5c.2.2.5.2.7 0z"]), fu = /*#__PURE__*/ Ql("DiamondDismiss12Filled", "12", ["M4.59 1.09a2 2 0 0 1 2.82 0l3.5 3.5a2 2 0 0 1 0 2.82l-3.5 3.5a2 2 0 0 1-2.82 0l-3.5-3.5a2 2 0 0 1 0-2.83zm3.26 3.06a.5.5 0 0 0-.7 0L6 5.29 4.85 4.15a.5.5 0 0 0-.7.7L5.29 6 4.15 7.15a.5.5 0 0 0 .7.7L6 6.71l1.15 1.14a.5.5 0 1 0 .7-.7L6.71 6l1.14-1.15a.5.5 0 0 0 0-.7"]), pu = /*#__PURE__*/ Ql("Dismiss20Regular", "20", ["m4.09 4.22.06-.07a.5.5 0 0 1 .63-.06l.07.06L10 9.29l5.15-5.14a.5.5 0 0 1 .63-.06l.07.06c.18.17.2.44.06.63l-.06.07L10.71 10l5.14 5.15c.18.17.2.44.06.63l-.06.07a.5.5 0 0 1-.63.06l-.07-.06L10 10.71l-5.15 5.14a.5.5 0 0 1-.63.06l-.07-.06a.5.5 0 0 1-.06-.63l.06-.07L9.29 10 4.15 4.85a.5.5 0 0 1-.06-.63l.06-.07z"]), mu = F({
	root: { mc9l5x: "fjseox" },
	visible: { mc9l5x: "f1w7gpdv" }
}, { d: [".fjseox{display:none;}", ".f1w7gpdv{display:inline;}"] }), hu = (e, t) => {
	let n = (n) => {
		let { className: r, filled: i, ...a } = n, o = mu();
		return N.createElement(N.Fragment, null, N.createElement(e, Object.assign({}, a, { className: O(o.root, i && o.visible, zl, r) })), N.createElement(t, Object.assign({}, a, { className: O(o.root, !i && o.visible, Bl, r) })));
	};
	return n.displayName = "CompoundIcon", n;
}, gu = {
	durationUltraFast: 50,
	durationFaster: 100,
	durationFast: 150,
	durationNormal: 200,
	durationGentle: 250,
	durationSlow: 300,
	durationSlower: 400,
	durationUltraSlow: 500
}, _u = {
	curveAccelerateMax: "cubic-bezier(0.9,0.1,1,0.2)",
	curveAccelerateMid: "cubic-bezier(1,0,1,1)",
	curveAccelerateMin: "cubic-bezier(0.8,0,0.78,1)",
	curveDecelerateMax: "cubic-bezier(0.1,0.9,0.2,1)",
	curveDecelerateMid: "cubic-bezier(0,0,0,1)",
	curveDecelerateMin: "cubic-bezier(0.33,0,0.1,1)",
	curveEasyEaseMax: "cubic-bezier(0.8,0,0.2,1)",
	curveEasyEase: "cubic-bezier(0.33,0,0.67,1)",
	curveLinear: "cubic-bezier(0,0,1,1)"
}, vu = {
	...gu,
	..._u
};
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/isAnimationRunning.js
function yu(e) {
	if (e.playState === "running") {
		if (e.overallProgress !== void 0) {
			let t = e.overallProgress ?? 0;
			return t > 0 && t < 1;
		}
		let t = Number(e.currentTime ?? 0), n = Number(e.effect?.getTiming().duration ?? 0);
		return t > 0 && t < n;
	}
	return !1;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useAnimateAtoms.js
var bu = { fill: "forwards" }, xu = { duration: 1 };
function Su(e) {
	return {
		set playbackRate(t) {
			e.forEach((e) => {
				e.playbackRate = t;
			});
		},
		setMotionEndCallbacks(t, n) {
			let r = e.map((e) => new Promise((t, n) => {
				e.onfinish = () => t(), e.oncancel = () => n();
			}));
			Promise.all(r).then(() => {
				t();
			}).catch(() => {
				n();
			});
		},
		isRunning() {
			return e.some((e) => yu(e));
		},
		dispose: () => {
			e.length = 0;
		},
		cancel: () => {
			e.forEach((e) => {
				e.cancel();
			});
		},
		pause: () => {
			e.forEach((e) => {
				e.pause();
			});
		},
		play: () => {
			e.forEach((e) => {
				e.play();
			});
		},
		finish: () => {
			e.forEach((e) => {
				e.finish();
			});
		},
		reverse: () => {
			e.forEach((e) => {
				e.reverse();
			});
		}
	};
}
function Cu() {
	let e = typeof window < "u" && typeof window.Animation?.prototype.persist == "function";
	return N.useCallback((t, n, r) => {
		let i = Array.isArray(n) ? n : [n], { isReducedMotion: a } = r;
		return Su(i.map((n) => {
			let { keyframes: r, reducedMotion: i = xu, ...o } = n, { keyframes: s = r, ...c } = i, l = a ? s : r, u = {
				...bu,
				...o,
				...a && c
			};
			try {
				let n = t.animate(l, u);
				if (e) n?.persist();
				else {
					let e = l[l.length - 1];
					Object.assign(t.style ?? {}, e);
				}
				return n;
			} catch {
				return null;
			}
		}).filter((e) => !!e));
	}, [e]);
}
function wu() {
	return Cu();
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useMotionImperativeRef.js
function Tu(e) {
	let t = N.useRef(void 0);
	return N.useImperativeHandle(e, () => ({
		setPlayState: (e) => {
			if (e === "running") {
				var n;
				(n = t.current) == null || n.play();
			}
			if (e === "paused") {
				var r;
				(r = t.current) == null || r.pause();
			}
		},
		setPlaybackRate: (e) => {
			t.current && (t.current.playbackRate = e);
		}
	})), t;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useIsReducedMotion.js
var Eu = "screen and (prefers-reduced-motion: reduce)";
function Du() {
	let { targetDocument: e } = Zr(), t = e?.defaultView ?? null, n = N.useRef(!1), r = N.useCallback(() => n.current, []);
	return yi(() => {
		if (t === null || typeof t.matchMedia != "function") return;
		let e = t.matchMedia(Eu);
		e.matches && (n.current = !0);
		let r = (e) => {
			n.current = e.matches;
		};
		return e.addEventListener("change", r), () => {
			e.removeEventListener("change", r);
		};
	}, [t]), r;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/useChildElement.js
var Ou = [
	"@fluentui/react-motion: Invalid child element.",
	"\n",
	"Motion factories require a single child element to be passed. ",
	"That element element should support ref forwarding i.e. it should be either an intrinsic element (e.g. div) or a component that uses React.forwardRef()."
].join("");
function ku(e, t = !0) {
	let n = N.useRef(null);
	N.useEffect(() => {}, [t]);
	try {
		let t = N.Children.only(e);
		if (N.isValidElement(t)) return [N.cloneElement(t, { ref: Ti(n, Li(t)) }), n];
	} catch {}
	throw Error(Ou);
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/contexts/MotionBehaviourContext.js
var Au = N.createContext(void 0);
Au.Provider;
var ju = () => N.useContext(Au) ?? "default", Mu = Symbol("MOTION_DEFINITION");
function Nu(e) {
	return Object.assign((t) => {
		let { children: n, imperativeRef: r, onMotionFinish: i, onMotionStart: a, onMotionCancel: o, replayKey: s, ...c } = t, l = c, [u, d] = ku(n), f = Tu(r), p = N.useRef(!0), m = ju() === "skip", h = N.useRef({
			skipMotions: m,
			params: l
		}), g = wu(), _ = Du(), v = I(() => {
			a?.(null);
		}), y = I(() => {
			i?.(null);
		}), b = I(() => {
			o?.(null);
		}), x = N.useCallback((e) => {
			v(), e.setMotionEndCallbacks(y, b), h.current.skipMotions && e.finish();
		}, [
			v,
			y,
			b
		]);
		return yi(() => {
			h.current = {
				skipMotions: m,
				params: l
			};
		}), yi(() => {
			let t = d.current;
			if (t) {
				let n = typeof e == "function" ? e({
					element: t,
					...h.current.params
				}) : e, r = g(t, n, { isReducedMotion: _() });
				return f.current = r, x(r), () => {
					r.cancel();
				};
			}
		}, [
			g,
			d,
			f,
			_,
			x
		]), yi(() => {
			if (p.current) return;
			let e = f.current;
			e && (e.cancel(), e.play(), x(e));
		}, [s]), yi(() => (p.current = !1, () => {
			p.current = !0;
		}), []), u;
	}, { [Mu]: typeof e == "function" ? e : () => e });
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/contexts/PresenceGroupChildContext.js
var Pu = N.createContext(void 0);
Pu.Provider;
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useMountedState.js
function Fu(e = !1, t = !1) {
	let n = N.useRef(!t || e), r = xi(), i = N.useCallback((e) => {
		n.current !== e && (n.current = e, r());
	}, [r]);
	return N.useEffect(() => {
		e && (n.current = e);
	}), [e || n.current, i];
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/factories/createPresenceComponent.js
var Iu = Symbol("PRESENCE_MOTION_DEFINITION"), Lu = Symbol.for("interruptablePresence");
function Ru(e) {
	return Object.assign((t) => {
		let n = {
			...N.useContext(Pu),
			...t
		}, r = ju() === "skip", { appear: i, children: a, imperativeRef: o, onExit: s, onMotionFinish: c, onMotionStart: l, onMotionCancel: u, visible: d, unmountOnExit: f, ...p } = n, m = p, [h, g] = Fu(d, f), [_, v] = ku(a, h), y = Tu(o), b = N.useRef({
			appear: i,
			params: m,
			skipMotions: r
		}), x = wu(), S = bi(), C = Du(), w = I((e) => {
			l?.(null, { direction: e });
		}), T = I((e) => {
			c?.(null, { direction: e }), e === "exit" && f && (g(!1), s?.());
		}), E = I((e) => {
			u?.(null, { direction: e });
		});
		return yi(() => {
			b.current = {
				appear: i,
				params: m,
				skipMotions: r
			};
		}), yi(() => {
			let t = v.current;
			if (!t) return;
			let n;
			function r() {
				n && (a && n.isRunning() || (n.cancel(), y.current = void 0));
			}
			let i = typeof e == "function" ? e({
				element: t,
				...b.current.params
			}) : e, a = i[Lu];
			if (a && (n = y.current, n && n.isRunning())) return n.reverse(), r;
			let o = d ? i.enter : i.exit, s = d ? "enter" : "exit", c = !b.current.appear && S, l = b.current.skipMotions;
			return c || w(s), n = x(t, o, { isReducedMotion: C() }), c ? (n.finish(), r) : (y.current = n, n.setMotionEndCallbacks(() => T(s), () => E(s)), l && n.finish(), r);
		}, [
			x,
			v,
			y,
			C,
			T,
			w,
			E,
			d
		]), N.useEffect(() => {
			if (f && !h) {
				var e;
				(e = y.current) == null || e.dispose();
			}
		}, [
			y,
			f,
			h
		]), h ? _ : null;
	}, { [Iu]: typeof e == "function" ? e : () => e }, {
		In: Nu(typeof e == "function" ? (...t) => e(...t).enter : e.enter),
		Out: Nu(typeof e == "function" ? (...t) => e(...t).exit : e.exit)
	});
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/components/MotionRefForwarder.js
var zu = /*#__PURE__*/ N.createContext(void 0);
function Bu() {
	return N.useContext(zu);
}
var Vu = /*#__PURE__*/ N.forwardRef((e, t) => /*#__PURE__*/ N.createElement(zu.Provider, { value: t }, e.children));
Vu.displayName = "MotionRefForwarder";
//#endregion
//#region node_modules/@fluentui/react-motion/lib/slots/motionSlot.js
function Hu(e, t) {
	let { as: n, children: r, ...i } = e ?? {};
	if (e === null) {
		let e = (e, t) => /*#__PURE__*/ N.createElement(N.Fragment, null, t.children);
		return {
			[Qn]: e,
			[$n]: t.elementType
		};
	}
	let a = {
		...t.defaultProps,
		...i,
		[$n]: t.elementType
	};
	return typeof r == "function" && (a[Qn] = r), a;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/slots/presenceMotionSlot.js
function Uu(e, t) {
	let { as: n, children: r, ...i } = e ?? {};
	if (e === null) {
		let e = !t.defaultProps.visible && t.defaultProps.unmountOnExit, n = (t, n) => e ? null : /*#__PURE__*/ N.createElement(N.Fragment, null, n.children);
		return {
			[Qn]: n,
			[$n]: t.elementType
		};
	}
	let a = {
		...t.defaultProps,
		...i,
		[$n]: t.elementType
	};
	return typeof r == "function" && (a[Qn] = r), a;
}
//#endregion
//#region node_modules/@fluentui/react-motion-components-preview/lib/atoms/fade-atom.js
var Wu = ({ direction: e, duration: t, easing: n = vu.curveLinear, delay: r = 0, outOpacity: i = 0, inOpacity: a = 1 }) => {
	let o = [{ opacity: i }, { opacity: a }];
	return e === "exit" && o.reverse(), {
		keyframes: o,
		duration: t,
		easing: n,
		delay: r,
		fill: "both"
	};
}, Gu = ({ direction: e, duration: t, easing: n = vu.curveLinear, delay: r = 0, outX: i = "0px", outY: a = "0px", inX: o = "0px", inY: s = "0px" }) => {
	let c = [{ translate: `${i} ${a}` }, { translate: `${o} ${s}` }];
	return e === "exit" && c.reverse(), {
		keyframes: c,
		duration: t,
		easing: n,
		delay: r
	};
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/createVirtualElementFromClick.js
function Ku(e) {
	let t = e.clientX, n = e.clientY, r = t + 1, i = n + 1;
	function a() {
		return {
			left: t,
			top: n,
			right: r,
			bottom: i,
			x: t,
			y: n,
			height: 1,
			width: 1
		};
	}
	return { getBoundingClientRect: a };
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/constants.js
var qu = "data-popper-is-intersecting", Ju = "data-popper-escaped", Yu = "data-popper-reference-hidden", Xu = "data-popper-placement", Zu = "fui-positioningend", Qu = "--fui-positioning-slide-direction-x", q = "--fui-positioning-slide-direction-y";
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningSlideDirection.js
function $u(e) {
	let t = e.split("-")[0], n = 0, r = 1;
	return t === "right" ? (n = -1, r = 0) : t === "bottom" ? (n = 0, r = -1) : t === "left" && (n = 1, r = 0), {
		x: n,
		y: r
	};
}
function J(e) {
	let { targetDocument: t, onPositioningEnd: n } = e, r = I((e) => {
		n?.(e);
		let t = e.target, r = e.detail.placement;
		if (!zi(t)) return;
		let { x: i, y: a } = $u(r);
		t.style.setProperty(Qu, `${i}px`), t.style.setProperty(q, `${a}px`);
	});
	return N.useEffect(() => {
		var e;
		let n = (t == null || (e = t.defaultView) == null ? void 0 : e.CSS?.registerProperty) ?? (() => {});
		try {
			n({
				name: Qu,
				syntax: "<length>",
				inherits: !1,
				initialValue: "0px"
			}), n({
				name: q,
				syntax: "<length>",
				inherits: !1,
				initialValue: "0px"
			});
		} catch {}
	}, [t]), r;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/PositioningConfigurationContext.js
var Y = ({ options: e }) => e, X = N.createContext(void 0);
X.Provider;
var ed = () => N.useContext(X) ?? Y, td = [
	"top",
	"right",
	"bottom",
	"left"
], nd = Math.min, rd = Math.max, id = Math.round, ad = (e) => ({
	x: e,
	y: e
}), od = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function sd(e, t, n) {
	return rd(e, nd(t, n));
}
function cd(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function ld(e) {
	return e.split("-")[0];
}
function ud(e) {
	return e.split("-")[1];
}
function dd(e) {
	return e === "x" ? "y" : "x";
}
function fd(e) {
	return e === "y" ? "height" : "width";
}
function pd(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function md(e) {
	return dd(pd(e));
}
function hd(e, t, n) {
	n === void 0 && (n = !1);
	let r = ud(e), i = md(e), a = fd(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = wd(o)), [o, wd(o)];
}
function gd(e) {
	let t = wd(e);
	return [
		_d(e),
		t,
		_d(t)
	];
}
function _d(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var vd = ["left", "right"], yd = ["right", "left"], bd = ["top", "bottom"], xd = ["bottom", "top"];
function Sd(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? yd : vd : t ? vd : yd;
		case "left":
		case "right": return t ? bd : xd;
		default: return [];
	}
}
function Cd(e, t, n, r) {
	let i = ud(e), a = Sd(ld(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(_d)))), a;
}
function wd(e) {
	let t = ld(e);
	return od[t] + e.slice(t.length);
}
function Td(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function Ed(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : Td(e);
}
function Dd(e) {
	let { x: t, y: n, width: r, height: i } = e;
	return {
		width: r,
		height: i,
		top: n,
		left: t,
		right: t + r,
		bottom: n + i,
		x: t,
		y: n
	};
}
//#endregion
//#region node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function Od(e, t, n) {
	let { reference: r, floating: i } = e, a = pd(t), o = md(t), s = fd(o), c = ld(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
	switch (c) {
		case "top":
			p = {
				x: u,
				y: r.y - i.height
			};
			break;
		case "bottom":
			p = {
				x: u,
				y: r.y + r.height
			};
			break;
		case "right":
			p = {
				x: r.x + r.width,
				y: d
			};
			break;
		case "left":
			p = {
				x: r.x - i.width,
				y: d
			};
			break;
		default: p = {
			x: r.x,
			y: r.y
		};
	}
	let m = ud(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function kd(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = cd(t, e), p = Ed(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = Dd(await i.getClippingRect({
		element: await (i.isElement == null ? void 0 : i.isElement(m)) ?? !0 ? m : m.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(o.floating)),
		boundary: c,
		rootBoundary: l,
		strategy: s
	})), g = u === "floating" ? {
		x: n,
		y: r,
		width: a.floating.width,
		height: a.floating.height
	} : a.reference, _ = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(o.floating)), v = await (i.isElement == null ? void 0 : i.isElement(_)) && await (i.getScale == null ? void 0 : i.getScale(_)) || {
		x: 1,
		y: 1
	}, y = Dd(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
		elements: o,
		rect: g,
		offsetParent: _,
		strategy: s
	}) : g);
	return {
		top: (h.top - y.top + p.top) / v.y,
		bottom: (y.bottom - h.bottom + p.bottom) / v.y,
		left: (h.left - y.left + p.left) / v.x,
		right: (y.right - h.right + p.right) / v.x
	};
}
var Ad = 50, jd = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: kd
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = Od(l, r, c), f = r, p = 0, m = {};
	for (let n = 0; n < a.length; n++) {
		let h = a[n];
		if (!h) continue;
		let { name: g, fn: _ } = h, { x: v, y, data: b, reset: x } = await _({
			x: u,
			y: d,
			initialPlacement: r,
			placement: f,
			strategy: i,
			middlewareData: m,
			rects: l,
			platform: s,
			elements: {
				reference: e,
				floating: t
			}
		});
		u = v ?? u, d = y ?? d, m[g] = {
			...m[g],
			...b
		}, x && p < Ad && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = Od(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Md = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = cd(e, t) || {};
		if (l == null) return {};
		let d = Ed(u), f = {
			x: n,
			y: r
		}, p = md(i), m = fd(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = nd(d[_], T), D = nd(d[v], T), ee = C - h[m] - D, te = C / 2 - h[m] / 2 + w, ne = sd(E, te, ee), re = !c.arrow && ud(i) != null && te !== ne && a.reference[m] / 2 - (te < E ? E : D) - h[m] / 2 < 0, ie = re ? te < E ? te - E : te - ee : 0;
		return {
			[p]: f[p] + ie,
			data: {
				[p]: ne,
				centerOffset: te - ne - ie,
				...re && { alignmentOffset: ie }
			},
			reset: re
		};
	}
}), Nd = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = cd(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = ld(r), _ = pd(o), v = ld(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [wd(o)] : gd(o)), x = p !== "none";
			!d && x && b.push(...Cd(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = hd(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === pd(t) || T.every((e) => pd(e.placement) !== _ || e.overflows[0] > 0))) return {
					data: {
						index: e,
						overflows: T
					},
					reset: { placement: t }
				};
				let n = T.filter((e) => e.overflows[0] <= 0).sort((e, t) => e.overflows[1] - t.overflows[1])[0]?.placement;
				if (!n) switch (f) {
					case "bestFit": {
						let e = T.filter((e) => {
							if (x) {
								let t = pd(e.placement);
								return t === _ || t === "y";
							}
							return !0;
						}).map((e) => [e.placement, e.overflows.filter((e) => e > 0).reduce((e, t) => e + t, 0)]).sort((e, t) => e[1] - t[1])[0]?.[0];
						e && (n = e);
						break;
					}
					case "initialPlacement": n = o;
				}
				if (r !== n) return { reset: { placement: n } };
			}
			return {};
		}
	};
};
function Pd(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function Fd(e) {
	return td.some((t) => e[t] >= 0);
}
var Id = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = cd(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = Pd(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: Fd(e)
					} };
				}
				case "escaped": {
					let e = Pd(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: Fd(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Ld = /*#__PURE__*/ new Set(["left", "top"]);
async function Rd(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = ld(n), s = ud(n), c = pd(n) === "y", l = Ld.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = cd(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
		mainAxis: d,
		crossAxis: 0,
		alignmentAxis: null
	} : {
		mainAxis: d.mainAxis || 0,
		crossAxis: d.crossAxis || 0,
		alignmentAxis: d.alignmentAxis
	};
	return s && typeof m == "number" && (p = s === "end" ? m * -1 : m), c ? {
		x: p * u,
		y: f * l
	} : {
		x: f * l,
		y: p * u
	};
}
var zd = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Rd(t, e);
			return a === o.offset?.placement && (n = o.arrow) != null && n.alignmentOffset ? {} : {
				x: r + s.x,
				y: i + s.y,
				data: {
					...s,
					placement: a
				}
			};
		}
	};
}, Bd = function(e) {
	return e === void 0 && (e = {}), {
		name: "shift",
		options: e,
		async fn(t) {
			let { x: n, y: r, placement: i, platform: a } = t, { mainAxis: o = !0, crossAxis: s = !1, limiter: c = { fn: (e) => {
				let { x: t, y: n } = e;
				return {
					x: t,
					y: n
				};
			} }, ...l } = cd(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = pd(i), p = dd(f), m = u[p], h = u[f], g = (e, t) => sd(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
			o && (m = g(p, m)), s && (h = g(f, h));
			let _ = c.fn({
				...t,
				[p]: m,
				[f]: h
			});
			return {
				..._,
				data: {
					x: _.x - n,
					y: _.y - r,
					enabled: {
						[p]: o,
						[f]: s
					}
				}
			};
		}
	};
}, Vd = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = cd(e, t), u = {
				x: n,
				y: r
			}, d = pd(i), f = dd(d), p = u[f], m = u[d], h = cd(s, t), g = typeof h == "number" ? {
				mainAxis: h,
				crossAxis: 0
			} : {
				mainAxis: h.mainAxis ?? 0,
				crossAxis: h.crossAxis ?? 0
			};
			if (c) {
				let e = f === "y" ? "height" : "width", t = a.reference[f] - a.floating[e] + g.mainAxis, n = a.reference[f] + a.reference[e] - g.mainAxis;
				p < t ? p = t : p > n && (p = n);
			}
			if (l) {
				let e = f === "y" ? "width" : "height", t = Ld.has(ld(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Hd = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = cd(e, t), c = await i.detectOverflow(t, s), l = ld(n), u = ud(n), d = pd(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = nd(p - c[m], g), y = nd(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * rd(c.left, c.right) : S = p - 2 * rd(c.top, c.bottom)), await o({
				...t,
				availableWidth: C,
				availableHeight: S
			});
			let w = await i.getDimensions(a.floating);
			return f !== w.width || p !== w.height ? { reset: { rects: !0 } } : {};
		}
	};
};
//#endregion
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function Ud() {
	return typeof window < "u";
}
function Wd(e) {
	return qd(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Gd(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Kd(e) {
	return ((qd(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function qd(e) {
	return Ud() ? e instanceof Node || e instanceof Gd(e).Node : !1;
}
function Jd(e) {
	return Ud() ? e instanceof Element || e instanceof Gd(e).Element : !1;
}
function Yd(e) {
	return Ud() ? e instanceof HTMLElement || e instanceof Gd(e).HTMLElement : !1;
}
function Xd(e) {
	return !Ud() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Gd(e).ShadowRoot;
}
function Zd(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = lf(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Qd(e) {
	return /^(table|td|th)$/.test(Wd(e));
}
function $d(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var ef = /transform|translate|scale|rotate|perspective|filter/, tf = /paint|layout|strict|content/, nf = (e) => !!e && e !== "none", rf;
function af(e) {
	let t = Jd(e) ? lf(e) : e;
	return nf(t.transform) || nf(t.translate) || nf(t.scale) || nf(t.rotate) || nf(t.perspective) || !sf() && (nf(t.backdropFilter) || nf(t.filter)) || ef.test(t.willChange || "") || tf.test(t.contain || "");
}
function of(e) {
	let t = df(e);
	for (; Yd(t) && !cf(t);) {
		if (af(t)) return t;
		if ($d(t)) return null;
		t = df(t);
	}
	return null;
}
function sf() {
	return rf ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), rf;
}
function cf(e) {
	return /^(html|body|#document)$/.test(Wd(e));
}
function lf(e) {
	return Gd(e).getComputedStyle(e);
}
function uf(e) {
	return Jd(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function df(e) {
	if (Wd(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Xd(e) && e.host || Kd(e);
	return Xd(t) ? t.host : t;
}
function ff(e) {
	let t = df(e);
	return cf(t) ? (e.ownerDocument || e).body : Yd(t) && Zd(t) ? t : ff(t);
}
function pf(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = ff(e), i = r === e.ownerDocument?.body, a = Gd(r);
	if (i) {
		let e = Z(a);
		return t.concat(a, a.visualViewport || [], Zd(r) ? r : [], e && n ? pf(e) : []);
	}
	return t.concat(r, pf(r, [], n));
}
function Z(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function mf(e) {
	let t = lf(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Yd(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = id(n) !== a || id(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function hf(e) {
	return Jd(e) ? e : e.contextElement;
}
function gf(e) {
	let t = hf(e);
	if (!Yd(t)) return ad(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = mf(t), o = (a ? id(n.width) : n.width) / r, s = (a ? id(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var _f = /*#__PURE__*/ ad(0);
function vf(e) {
	let t = Gd(e);
	return !sf() || !t.visualViewport ? _f : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function yf(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === Gd(e);
}
function bf(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = hf(e), o = ad(1);
	t && (r ? Jd(r) && (o = gf(r)) : o = gf(e));
	let s = yf(a, n, r) ? vf(a) : ad(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = Gd(a), t = Jd(r) ? Gd(r) : r, n = e, i = Z(n);
		for (; i && t !== n;) {
			let e = gf(i), t = i.getBoundingClientRect(), r = lf(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Gd(i), i = Z(n);
		}
	}
	return Dd({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function xf(e, t) {
	let n = uf(e).scrollLeft;
	return t ? t.left + n : bf(Kd(e)).left + n;
}
function Sf(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - xf(e, n),
		y: n.top + t.scrollTop
	};
}
function Cf(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Kd(r), s = t ? $d(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = ad(1), u = ad(0), d = Yd(r);
	if ((d || !a) && ((Wd(r) !== "body" || Zd(o)) && (c = uf(r)), d)) {
		let e = bf(r);
		l = gf(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Sf(o, c) : ad(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function wf(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Tf(e) {
	let t = uf(e), n = e.ownerDocument.body, r = rd(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = rd(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + xf(e), o = -t.scrollTop;
	return lf(n).direction === "rtl" && (a += rd(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var Ef = 25;
function Df(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = Gd(e), a = Kd(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !sf() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (xf(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= Ef && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function Of(e, t) {
	let n = bf(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = gf(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function kf(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = Df(e, n, t);
	else if (t === "document") r = Tf(Kd(e));
	else if (Jd(t)) r = Of(t, n);
	else {
		let n = vf(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return Dd(r);
}
function Af(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = pf(e, [], !1).filter((e) => Jd(e) && Wd(e) !== "body"), i = null, a = lf(e).position === "fixed", o = a ? df(e) : e;
	for (; Jd(o) && !cf(o);) {
		let e = lf(o), t = af(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = df(o);
	}
	return t.set(e, r), r;
}
function jf(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? $d(t) ? [] : Af(t, this._c) : [].concat(n), r], o = kf(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = kf(t, a[e], i);
		s = rd(n.top, s), c = nd(n.right, c), l = nd(n.bottom, l), u = rd(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Mf(e) {
	let { width: t, height: n } = mf(e);
	return {
		width: t,
		height: n
	};
}
function Nf(e, t, n) {
	let r = Yd(t), i = Kd(t), a = n === "fixed", o = bf(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = ad(0);
	if ((r || !a) && ((Wd(t) !== "body" || Zd(i)) && (s = uf(t)), r)) {
		let e = bf(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = xf(i));
	let l = i && !r && !a ? Sf(i, s) : ad(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function Pf(e) {
	return lf(e).position === "static";
}
function Ff(e, t) {
	if (!Yd(e) || lf(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Kd(e) === n && (n = n.ownerDocument.body), n;
}
function If(e, t) {
	let n = Gd(e);
	if ($d(e)) return n;
	if (!Yd(e)) {
		let t = df(e);
		for (; t && !cf(t);) {
			if (Jd(t) && !Pf(t)) return t;
			t = df(t);
		}
		return n;
	}
	let r = Ff(e, t);
	for (; r && Qd(r) && Pf(r);) r = Ff(r, t);
	return r && cf(r) && Pf(r) && !af(r) ? n : r || of(e) || n;
}
var Lf = async function(e) {
	let t = this.getOffsetParent || If, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: Nf(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function Rf(e) {
	return lf(e).direction === "rtl";
}
var zf = {
	convertOffsetParentRelativeRectToViewportRelativeRect: Cf,
	getDocumentElement: Kd,
	getClippingRect: jf,
	getOffsetParent: If,
	getElementRects: Lf,
	getClientRects: wf,
	getDimensions: Mf,
	getScale: gf,
	isElement: Jd,
	isRTL: Rf
}, Bf = kd, Vf = zd, Q = Bd, Hf = Nd, Uf = Hd, Wf = Id, Gf = Md, Kf = Vd, qf = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...zf,
		...i.platform,
		_c: r
	};
	return jd(e, t, {
		...i,
		platform: a
	});
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/parseFloatingUIPlacement.js
function Jf(e) {
	let t = e.split("-");
	return {
		side: t[0],
		alignment: t[1]
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/getScrollParent.js
var Yf = (e) => e.nodeName === "HTML" ? e : e.parentNode || e.host, Xf = (e) => {
	if (e.nodeType !== 1) return {};
	let t = e.ownerDocument?.defaultView;
	return t ? t.getComputedStyle(e, null) : {};
}, Zf = (e) => {
	let t = e && Yf(e);
	if (!t) return document.body;
	switch (t.nodeName) {
		case "HTML":
		case "BODY": return t.ownerDocument.body;
		case "#document": return t.body;
	}
	let { overflow: n, overflowX: r, overflowY: i } = Xf(t);
	return /(auto|scroll|overlay)/.test(n + i + r) ? t : Zf(t);
}, Qf = (e) => {
	let t = Zf(e);
	return t ? t !== t.ownerDocument?.body : !1;
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/getBoundary.js
function $f(e, t) {
	if (t === "window") return e?.ownerDocument.documentElement;
	if (t === "clippingParents") return "clippingAncestors";
	if (t === "scrollParent") {
		let t = Zf(e);
		return t.nodeName === "BODY" && (t = e?.ownerDocument.documentElement), t;
	}
	return t;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/mergeArrowOffset.js
function ep(e, t) {
	return typeof e == "number" || typeof e == "object" && e ? tp(e, t) : typeof e == "function" ? (n) => tp(e(n), t) : { mainAxis: t };
}
var tp = (e, t) => typeof e == "number" ? { mainAxis: e + t } : {
	...e,
	mainAxis: (e.mainAxis ?? 0) + t
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/toFloatingUIPadding.js
function np(e, t) {
	if (typeof e == "number") return e;
	let { start: n, end: r, ...i } = e, a = i, o = t ? "end" : "start", s = t ? "start" : "end";
	return e[o] && (a.left = e[o]), e[s] && (a.right = e[s]), a;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/toFloatingUIPlacement.js
var rp = (e) => ({
	above: "top",
	below: "bottom",
	before: e ? "right" : "left",
	after: e ? "left" : "right"
}), ip = () => ({
	start: "start",
	end: "end",
	top: "start",
	bottom: "end",
	center: void 0
}), ap = (e, t) => {
	let n = e === "above" || e === "below", r = t === "top" || t === "bottom";
	return n && r || !n && !r;
}, op = (e, t, n) => {
	let r = ap(t, e) ? "center" : e, i = t && rp(n)[t], a = r && ip()[r];
	return i && a ? `${i}-${a}` : i;
}, sp = () => ({
	top: "above",
	bottom: "below",
	right: "after",
	left: "before"
}), cp = (e) => e === "above" || e === "below" ? {
	start: "start",
	end: "end"
} : {
	start: "top",
	end: "bottom"
}, lp = (e) => {
	let { side: t, alignment: n } = Jf(e), r = sp()[t];
	return {
		position: r,
		alignment: n && cp(r)[n]
	};
}, up = {
	above: {
		position: "above",
		align: "center"
	},
	"above-start": {
		position: "above",
		align: "start"
	},
	"above-end": {
		position: "above",
		align: "end"
	},
	below: {
		position: "below",
		align: "center"
	},
	"below-start": {
		position: "below",
		align: "start"
	},
	"below-end": {
		position: "below",
		align: "end"
	},
	before: {
		position: "before",
		align: "center"
	},
	"before-top": {
		position: "before",
		align: "top"
	},
	"before-bottom": {
		position: "before",
		align: "bottom"
	},
	after: {
		position: "after",
		align: "center"
	},
	"after-top": {
		position: "after",
		align: "top"
	},
	"after-bottom": {
		position: "after",
		align: "bottom"
	}
};
function dp(e) {
	return e == null ? {} : typeof e == "string" ? up[e] : e;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/useCallbackRef.js
function fp(e, t, n) {
	let r = N.useRef(!0), [i] = N.useState(() => ({
		value: e,
		callback: t,
		facade: {
			get current() {
				return i.value;
			},
			set current(e) {
				let t = i.value;
				if (t !== e) {
					if (i.value = e, n && r.current) return;
					i.callback(e, t);
				}
			}
		}
	}));
	return yi(() => {
		r.current = !1;
	}, []), i.callback = t, i.facade;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/debounce.js
function pp(e) {
	let t;
	return () => (t ||= new Promise((n) => {
		Promise.resolve().then(() => {
			t = void 0, n(e());
		});
	}), t);
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/writeArrowUpdates.js
function mp(e) {
	let { arrow: t, middlewareData: n } = e;
	if (!n.arrow || !t) return;
	let { x: r, y: i } = n.arrow;
	Object.assign(t.style, {
		left: r == null ? "" : `${r}px`,
		top: i == null ? "" : `${i}px`
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/writeContainerupdates.js
function hp(e) {
	let { container: t, placement: n, middlewareData: r, strategy: i, lowPPI: a, coordinates: o, useTransform: s = !0 } = e;
	if (!t) return;
	t.setAttribute(Xu, n), t.removeAttribute(qu), r.intersectionObserver.intersecting && t.setAttribute(qu, ""), t.removeAttribute(Ju), r.hide?.escaped && t.setAttribute(Ju, ""), t.removeAttribute(Yu), r.hide?.referenceHidden && t.setAttribute(Yu, "");
	let c = t.ownerDocument.defaultView?.devicePixelRatio || 1, l = Math.round(o.x * c) / c, u = Math.round(o.y * c) / c;
	Object.assign(t.style, { position: i }), s ? Object.assign(t.style, { transform: a ? `translate(${l}px, ${u}px)` : `translate3d(${l}px, ${u}px, 0)` }) : Object.assign(t.style, {
		left: `${l}px`,
		top: `${u}px`
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/normalizeAutoSize.js
var gp = (e) => {
	switch (e) {
		case "always":
		case !0: return {
			applyMaxWidth: !0,
			applyMaxHeight: !0
		};
		case "width-always":
		case "width": return {
			applyMaxWidth: !0,
			applyMaxHeight: !1
		};
		case "height-always":
		case "height": return {
			applyMaxWidth: !1,
			applyMaxHeight: !0
		};
		default: return !1;
	}
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/listScrollParents.js
function _p(e) {
	let t = [], n = e;
	for (; n;) {
		let r = Zf(n);
		if (e.ownerDocument.body === r) {
			t.push(r);
			break;
		}
		if (r.nodeName === "BODY" && r !== e.ownerDocument.body) break;
		t.push(r), n = r;
	}
	return t;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/createResizeObserver.js
function vp(e, t) {
	return new e.ResizeObserver(t);
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/createPositionManager.js
function yp(e) {
	let { clientWidth: t, clientHeight: n } = e.ownerDocument.documentElement;
	return t === 0 && n === 0;
}
function bp(e) {
	let t = !1, { container: n, target: r, arrow: i, strategy: a, middleware: o, placement: s, useTransform: c = !0, disableUpdateOnResize: l = !1 } = e, u = n.ownerDocument.defaultView;
	if (!r || !n || !u) return {
		updatePosition: () => void 0,
		dispose: () => void 0
	};
	let d = l ? null : vp(u, (e) => {
		e.every((e) => e.contentRect.width > 0 && e.contentRect.height > 0) && h();
	}), f = !0, p = /* @__PURE__ */ new Set();
	Object.assign(n.style, {
		position: "fixed",
		left: 0,
		top: 0,
		margin: 0
	});
	let m = () => {
		t || (f &&= (_p(n).forEach((e) => p.add(e)), zi(r) && _p(r).forEach((e) => p.add(e)), p.forEach((e) => {
			e.addEventListener("scroll", h, { passive: !0 });
		}), d?.observe(n), zi(r) && d?.observe(r), !1), Object.assign(n.style, { position: a }), qf(r, n, {
			placement: s,
			middleware: o,
			strategy: a
		}).then(({ x: e, y: r, middlewareData: o, placement: s }) => {
			if (t) return;
			let l = yp(n) ? {
				...o,
				hide: {
					...o.hide,
					escaped: !1,
					referenceHidden: !1
				}
			} : o;
			mp({
				arrow: i,
				middlewareData: l
			}), hp({
				container: n,
				middlewareData: l,
				placement: s,
				coordinates: {
					x: e,
					y: r
				},
				lowPPI: (u?.devicePixelRatio || 1) <= 1,
				strategy: a,
				useTransform: c
			}), n.dispatchEvent(new CustomEvent(Zu, { detail: {
				placement: s,
				escaped: l.hide?.escaped ?? !1,
				referenceHidden: l.hide?.referenceHidden ?? !1
			} }));
		}).catch((e) => {}));
	}, h = pp(() => m());
	return u && (u.addEventListener("scroll", h, { passive: !0 }), u.addEventListener("resize", h)), h(), {
		updatePosition: h,
		dispose: () => {
			t = !0, u && (u.removeEventListener("scroll", h), u.removeEventListener("resize", h)), p.forEach((e) => {
				e.removeEventListener("scroll", h);
			}), p.clear(), d?.disconnect();
		}
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/coverTarget.js
function xp() {
	return {
		name: "coverTarget",
		fn: (e) => {
			let { placement: t, rects: n, x: r, y: i } = e, a = Jf(t).side, o = {
				x: r,
				y: i
			};
			switch (a) {
				case "bottom":
					o.y -= n.reference.height;
					break;
				case "top":
					o.y += n.reference.height;
					break;
				case "left":
					o.x += n.reference.width;
					break;
				case "right": o.x -= n.reference.width;
			}
			return o;
		}
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/flip.js
function Sp(e) {
	let { hasScrollableElement: t, flipBoundary: n, container: r, fallbackPositions: i = [], isRtl: a } = e, o = i.reduce((e, t) => {
		let { position: n, align: r } = dp(t), i = op(r, n, a);
		return i && e.push(i), e;
	}, []);
	return Hf({
		...t && { boundary: "clippingAncestors" },
		...n && {
			altBoundary: !0,
			boundary: $f(r, n)
		},
		fallbackStrategy: "bestFit",
		...o.length && { fallbackPlacements: o }
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/intersecting.js
function Cp() {
	return {
		name: "intersectionObserver",
		fn: async (e) => {
			let t = e.rects.floating, n = await Bf(e, { altBoundary: !0 }), r = n.top < t.height && n.top > 0, i = n.bottom < t.height && n.bottom > 0;
			return { data: { intersecting: r || i } };
		}
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/maxSize.js
var wp = (e) => ({
	name: "resetMaxSize",
	fn({ middlewareData: t, elements: n }) {
		if (t.resetMaxSize?.maxSizeAlreadyReset) return {};
		let { applyMaxWidth: r, applyMaxHeight: i } = e;
		return r && (n.floating.style.removeProperty("box-sizing"), n.floating.style.removeProperty("max-width"), n.floating.style.removeProperty("width")), i && (n.floating.style.removeProperty("box-sizing"), n.floating.style.removeProperty("max-height"), n.floating.style.removeProperty("height")), {
			data: { maxSizeAlreadyReset: !0 },
			reset: { rects: !0 }
		};
	}
});
function Tp(e, t) {
	let { container: n, overflowBoundary: r, overflowBoundaryPadding: i, isRtl: a } = t;
	return Uf({
		...i && { padding: np(i, a) },
		...r && {
			altBoundary: !0,
			boundary: $f(n, r)
		},
		apply({ availableHeight: t, availableWidth: n, elements: r, rects: i }) {
			let a = (e, t, n) => {
				if (e && (r.floating.style.setProperty("box-sizing", "border-box"), r.floating.style.setProperty(`max-${t}`, `${n}px`), i.floating[t] > n)) {
					r.floating.style.setProperty(t, `${n}px`);
					let e = t === "width" ? "x" : "y";
					r.floating.style.getPropertyValue(`overflow-${e}`) || r.floating.style.setProperty(`overflow-${e}`, "auto");
				}
			}, { applyMaxWidth: o, applyMaxHeight: s } = e;
			a(o, "width", n), a(s, "height", t);
		}
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/getFloatingUIOffset.js
function Ep(e) {
	return !e || typeof e == "number" || typeof e == "object" ? e : ({ rects: { floating: t, reference: n }, placement: r }) => {
		let { position: i, alignment: a } = lp(r);
		return e({
			positionedRect: t,
			targetRect: n,
			position: i,
			alignment: a
		});
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/offset.js
function Dp(e) {
	return Vf(Ep(e));
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/shift.js
function Op(e) {
	let { hasScrollableElement: t, shiftToCoverTarget: n, disableTether: r, overflowBoundary: i, container: a, overflowBoundaryPadding: o, isRtl: s } = e;
	return Q({
		...t && { boundary: "clippingAncestors" },
		...n && {
			crossAxis: !0,
			limiter: Kf({
				crossAxis: !0,
				mainAxis: !1
			})
		},
		...r && {
			crossAxis: r === "all",
			limiter: Kf({
				crossAxis: r !== "all",
				mainAxis: !1
			})
		},
		...o && { padding: np(o, s) },
		...i && {
			altBoundary: !0,
			boundary: $f(a, i)
		}
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/matchTargetSize.js
var kp = "--fui-match-target-size";
function Ap() {
	return {
		name: "matchTargetSize",
		fn: async (e) => {
			let { rects: { reference: t, floating: n }, elements: { floating: r }, middlewareData: { matchTargetSize: { matchTargetSizeAttempt: i = !1 } = {} } } = e;
			if (t.width === n.width || i) return {};
			let { width: a } = t;
			return r.style.setProperty(kp, `${a}px`), r.style.width || (r.style.width = `var(${kp})`), {
				data: { matchTargetSizeAttempt: !0 },
				reset: { rects: !0 }
			};
		}
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningOptions.js
function jp(e, t) {
	let { align: n, arrowPadding: r, autoSize: i, coverTarget: a, disableUpdateOnResize: o, flipBoundary: s, offset: c, overflowBoundary: l, pinned: u, position: d, unstable_disableTether: f, strategy: p, overflowBoundaryPadding: m, fallbackPositions: h, useTransform: g, matchTargetSize: _, shiftToCoverTarget: v } = t;
	return N.useCallback((t, y) => e({
		container: t,
		arrow: y,
		options: {
			autoSize: i,
			disableUpdateOnResize: o,
			matchTargetSize: _,
			offset: c,
			strategy: p,
			coverTarget: a,
			flipBoundary: s,
			overflowBoundary: l,
			useTransform: g,
			overflowBoundaryPadding: m,
			pinned: u,
			arrowPadding: r,
			align: n,
			fallbackPositions: h,
			shiftToCoverTarget: v,
			position: d,
			unstable_disableTether: f
		}
	}), [
		i,
		o,
		_,
		c,
		p,
		a,
		s,
		l,
		g,
		m,
		u,
		r,
		n,
		h,
		v,
		d,
		f,
		e
	]);
}
function Mp(e) {
	let { dir: t, targetDocument: n } = Zr(), r = t === "rtl", i = jp(ed(), e), { positionFixed: a } = e;
	return N.useCallback((e, t) => {
		let n = Qf(e), { autoSize: o, disableUpdateOnResize: s, matchTargetSize: c, offset: l, coverTarget: u, flipBoundary: d, overflowBoundary: f, useTransform: p, overflowBoundaryPadding: m, pinned: h, position: g, arrowPadding: _, strategy: v, align: y, fallbackPositions: b, shiftToCoverTarget: x, unstable_disableTether: S } = i(e, t), C = gp(o), w = [
			C && wp(C),
			c && Ap(),
			l && Dp(l),
			u && xp(),
			!h && Sp({
				container: e,
				flipBoundary: d,
				hasScrollableElement: n,
				isRtl: r,
				fallbackPositions: b
			}),
			Op({
				container: e,
				hasScrollableElement: n,
				overflowBoundary: f,
				disableTether: S,
				overflowBoundaryPadding: m,
				isRtl: r,
				shiftToCoverTarget: x
			}),
			C && Tp(C, {
				container: e,
				overflowBoundary: f,
				overflowBoundaryPadding: m,
				isRtl: r
			}),
			Cp(),
			t && Gf({
				element: t,
				padding: _
			}),
			Wf({ strategy: "referenceHidden" }),
			Wf({ strategy: "escaped" }),
			!1
		].filter(Boolean);
		return {
			placement: op(y, g, r),
			middleware: w,
			strategy: v ?? a ? "fixed" : "absolute",
			disableUpdateOnResize: s,
			useTransform: p
		};
	}, [
		i,
		r,
		n,
		a
	]);
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioning.js
function Np(e) {
	let t = N.useRef(null), n = N.useRef(null), r = N.useRef(null), i = N.useRef(null), a = N.useRef(null), { enabled: o = !0 } = e, s = Mp(e), c = N.useCallback(() => {
		t.current && t.current.dispose(), t.current = null;
		let e = r.current ?? n.current;
		o && mi() && e && i.current && (t.current = bp({
			container: i.current,
			target: e,
			arrow: a.current,
			...s(i.current, a.current)
		}));
	}, [o, s]), l = I((e) => {
		r.current = e, c();
	});
	N.useImperativeHandle(e.positioningRef, () => ({
		updatePosition: () => t.current?.updatePosition(),
		setTarget: (t) => {
			e.target, l(t);
		}
	}), [e.target, l]), yi(() => {
		l(e.target ?? null);
	}, [e.target, l]), yi(() => {
		c();
	}, [c]);
	let u = fp(null, (e) => {
		n.current !== e && (n.current = e, c());
	}), d = I((t) => e.onPositioningEnd?.call(e, t));
	return {
		targetRef: u,
		containerRef: fp(null, (e) => {
			if (i.current !== e) {
				var t;
				(t = i.current) == null || t.removeEventListener("fui-positioningend", d), e?.addEventListener("fui-positioningend", d), i.current = e, c();
			}
		}),
		arrowRef: fp(null, (e) => {
			a.current !== e && (a.current = e, c());
		})
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningMouseTarget.js
var Pp = (e) => {
	let [t, n] = N.useState(e);
	return [t, (e) => {
		if (e == null) {
			n(void 0);
			return;
		}
		let t;
		t = e instanceof MouseEvent ? e : e.nativeEvent, t instanceof MouseEvent;
		let r = Ku(t);
		n(r);
	}];
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/createSafeZoneAreaStateStore.js
function Fp() {
	let e = !1, t = [];
	return {
		isActive() {
			return e;
		},
		toggleActive(n) {
			e !== n && (e = n, t.forEach((t) => t(e)));
		},
		subscribe(e) {
			return t.push(e), () => {
				let n = t.indexOf(e);
				n > -1 && t.splice(n, 1);
			};
		}
	};
}
//#endregion
//#region node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
var Ip = /* @__PURE__ */ s(((e) => {
	var t = d();
	function n(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var r = typeof Object.is == "function" ? Object.is : n, i = t.useState, a = t.useEffect, o = t.useLayoutEffect, s = t.useDebugValue;
	function c(e, t) {
		var n = t(), r = i({ inst: {
			value: n,
			getSnapshot: t
		} }), c = r[0].inst, u = r[1];
		return o(function() {
			c.value = n, c.getSnapshot = t, l(c) && u({ inst: c });
		}, [
			e,
			n,
			t
		]), a(function() {
			return l(c) && u({ inst: c }), e(function() {
				l(c) && u({ inst: c });
			});
		}, [e]), s(n), n;
	}
	function l(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !r(e, n);
		} catch {
			return !0;
		}
	}
	function u(e, t) {
		return t();
	}
	var f = typeof window > "u" || window.document === void 0 || window.document.createElement === void 0 ? u : c;
	e.useSyncExternalStore = t.useSyncExternalStore === void 0 ? f : t.useSyncExternalStore;
})), Lp = /* @__PURE__ */ s(((e, t) => {
	t.exports = Ip();
}));
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getRectCorners.js
function Rp(e, t) {
	return {
		topLeft: [e.left - t[0], e.top - t[1]],
		topRight: [e.right - t[0], e.top - t[1]],
		bottomRight: [e.right - t[0], e.bottom - t[1]],
		bottomLeft: [e.left - t[0], e.bottom - t[1]]
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getMouseAnchor.js
var zp = 20;
function Bp(e, t) {
	return Math.sqrt((e[0] - t[0]) ** 2 + (e[1] - t[1]) ** 2);
}
function Vp(e, t) {
	let n = Bp(e, t);
	return n === 0 ? [0, 0] : [(e[0] - t[0]) / n, (e[1] - t[1]) / n];
}
function Hp(e, t, n) {
	let r = [(e[0] + t[0]) / 2, (e[1] + t[1]) / 2], i = Vp([n[0], n[1]], [r[0], r[1]]), a = Bp([r[0], r[1]], [n[0], n[1]]);
	return [r[0] + i[0] * (a + zp), r[1] + i[1] * (a + zp)];
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/pointsToSvgPath.js
function Up(e) {
	return `M ${e} z`;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/SafeZoneArea.styles.js
var Wp = /*#__PURE__*/ F({
	wrapper: {
		mc9l5x: "fjseox",
		Bqenvij: "fniina8",
		a9b677: "f3tsq5r",
		Bkecrkj: "f1aehjj5"
	},
	wrapperActive: { mc9l5x: "ftgm304" },
	svg: {
		Bkfmm31: "f1au8mb3",
		Bkecrkj: "f1aehjj5",
		qhf8xq: "f19dog8a",
		Bhzewxz: "f15twtuk",
		oyh7mz: ["f1vgc2s3", "f1e31b4d"]
	},
	safeZone: { Bkecrkj: "f1cguypg" },
	safeZoneDebug: {
		Bceei9c: "f7116n6",
		Bkfmm31: "f1xab38x"
	},
	rectDebug: { Bkfmm31: "fyegryc" }
}, { d: [
	".fjseox{display:none;}",
	".fniina8{height:0;}",
	".f3tsq5r{width:0;}",
	".f1aehjj5{pointer-events:none;}",
	".ftgm304{display:block;}",
	".f1au8mb3{fill:transparent;}",
	".f19dog8a{position:fixed;}",
	".f15twtuk{top:0;}",
	".f1vgc2s3{left:0;}",
	".f1e31b4d{right:0;}",
	".f1cguypg{pointer-events:auto;}",
	".f7116n6{cursor:crosshair;}",
	".f1xab38x{fill:color-mix(in srgb, var(--colorPaletteGreenBackground3) 20%, transparent);}",
	".fyegryc{fill:color-mix(in srgb, var(--colorPaletteRedBackground3) 20%, transparent);}"
] });
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/computeOutsideClipPath.js
function Gp(e) {
	if (e.width <= 0 || e.height <= 0) return "";
	let t = "";
	return t += `M ${e.x},${e.y} `, t += `V ${e.y + e.height} `, t += `H ${e.x + e.width} `, t += `V ${e.y} `, t += `H ${e.x} `, t += "Z ", t;
}
function Kp(e, t, n) {
	let r = `M 0,0 H ${e} V ${t} H 0 Z `;
	return r += Gp(n), r;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getSafeZonePoints.js
function qp(e, t) {
	let { topLeft: n, topRight: r, bottomRight: i, bottomLeft: a } = t, o = e[1] < n[1], s = e[1] > a[1], c = e[0] < n[0], l = e[0] > r[0];
	return o ? c ? [
		e,
		a,
		n,
		r
	] : l ? [
		e,
		n,
		r,
		i
	] : [
		e,
		n,
		r
	] : s ? c ? [
		e,
		n,
		a,
		i
	] : l ? [
		e,
		r,
		i,
		a
	] : [
		e,
		i,
		a
	] : c ? [
		e,
		a,
		n
	] : l ? [
		e,
		r,
		i
	] : [];
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/SafeZoneArea.js
var Jp = Lp(), Yp = /*#__PURE__*/ N.memo((e) => {
	let { debug: t, onMouseEnter: n, onMouseMove: r, onMouseLeave: i, stateStore: a } = e, o = wi(), s = Wp(), c = (0, Jp.useSyncExternalStore)(a.subscribe, a.isActive), l = N.useRef(null), u = N.useRef(null), d = N.useRef(null), f = N.useRef(null);
	return N.useImperativeHandle(e.imperativeRef, () => ({ updateSVG({ containerRect: e, targetRect: t, mouseCoordinates: n }) {
		var r, i, a;
		let o = Math.min(t.top, e.top), s = Math.min(t.left, e.left), c = Math.max(t.bottom, e.bottom), p = Math.max(t.right, e.right), m = Rp(e, [s, o]), h = Rp(t, [s, o]), g = [n[0] - s, n[1] - o], _ = Hp(m.topLeft, m.bottomRight, g), v = p - s, y = c - o, b = Kp(v, y, {
			x: h.topLeft[0],
			y: h.topLeft[1],
			width: t.width,
			height: t.height
		});
		l.current && (l.current.style.width = `${v}px`, l.current.style.height = `${y}px`, l.current.style.transform = `translate(${s}px, ${o}px)`);
		let x = qp(_, m);
		(r = u.current) == null || r.setAttribute("d", x.length > 0 ? Up(x) : ""), (i = d.current) == null || i.setAttribute("d", b), (a = f.current) == null || a.setAttribute("d", b);
	} }), []), /*#__PURE__*/ N.createElement("div", {
		className: O(s.wrapper, c && s.wrapperActive),
		"data-safe-zone": ""
	}, /*#__PURE__*/ N.createElement("svg", {
		"aria-hidden": !0,
		className: s.svg,
		xmlns: "http://www.w3.org/2000/svg",
		ref: l,
		style: {
			width: 0,
			height: 0,
			transform: "translate(0px, 0px)"
		}
	}, /*#__PURE__*/ N.createElement("g", {
		className: O(s.safeZone, t && s.safeZoneDebug),
		clipPath: `url(#${o})`,
		onMouseEnter: n,
		onMouseMove: r,
		onMouseLeave: i
	}, /*#__PURE__*/ N.createElement("path", { ref: u })), /*#__PURE__*/ N.createElement("clipPath", { id: o }, /*#__PURE__*/ N.createElement("path", { ref: d })), t && /*#__PURE__*/ N.createElement("path", {
		ref: f,
		className: s.rectDebug
	})));
}), Xp = 2e3;
function Zp({ debug: e = !1, disabled: t = !1, onSafeZoneEnter: n, onSafeZoneMove: r, onSafeZoneLeave: i, onSafeZoneTimeout: a, timeout: o = 1500 } = {}) {
	let [s] = N.useState(Fp), c = N.useRef(null), l = N.useRef(null), u = N.useRef(null), [d, f] = Pi(), [p, m] = li(), h = N.useRef({
		x: 0,
		y: 0
	}), g = N.useMemo(() => {
		if (t) return () => {};
		let e = null;
		function n() {
			f(), s.toggleActive(!1);
		}
		return (t) => {
			t === null && e?.removeEventListener("mouseenter", n), e = t, t?.addEventListener("mouseenter", n);
		};
	}, [
		f,
		t,
		s
	]), _ = N.useMemo(() => {
		if (t) return () => {};
		let e = null;
		function n(e) {
			h.current = {
				x: e.clientX,
				y: e.clientY
			}, s.isActive() || s.toggleActive(!0), d(() => {
				s.toggleActive(!1);
			}, Xp);
		}
		return (t) => {
			t === null && (m(), f(), e?.removeEventListener("mousemove", n)), e = t, t?.addEventListener("mousemove", n);
		};
	}, [
		m,
		f,
		t,
		s,
		d
	]), v = I((e) => {
		n?.(e), d(() => {
			s.toggleActive(!1), a?.();
		}, o);
	}), y = I((e) => {
		d(() => {
			s.toggleActive(!1), a?.();
		}, o), r?.(e);
	}), b = I((e) => {
		i?.(e);
	});
	return N.useEffect(() => s.subscribe((e) => {
		if (e) {
			function e() {
				let t = l.current, n = u.current;
				if (t && n) {
					var r;
					(r = c.current) == null || r.updateSVG({
						containerRect: t.getBoundingClientRect(),
						mouseCoordinates: [h.current.x, h.current.y],
						targetRect: n.getBoundingClientRect()
					});
				}
				p(e);
			}
			e();
		} else m();
	}), [
		m,
		p,
		s
	]), {
		containerRef: Ti(l, g),
		targetRef: Ti(u, _),
		elementToRender: N.useMemo(() => t ? null : /*#__PURE__*/ N.createElement(Yp, {
			debug: e,
			onMouseEnter: v,
			onMouseMove: y,
			onMouseLeave: b,
			imperativeRef: c,
			stateStore: s
		}), [
			t,
			e,
			v,
			y,
			b,
			s
		])
	};
}
//#endregion
//#region node_modules/@fluentui/react-portal/lib/utils/toMountNodeProps.js
function Qp(e) {
	return zi(e) ? { element: e } : typeof e == "object" ? e === null ? { element: null } : e : {};
}
//#endregion
//#region node_modules/@fluentui/react-portal/lib/components/Portal/usePortalMountNodeStyles.styles.js
var $p = /*#__PURE__*/ F({ root: {
	qhf8xq: "f1euv43f",
	Bhzewxz: "f15twtuk",
	oyh7mz: ["f1vgc2s3", "f1e31b4d"],
	j35jbq: ["f1e31b4d", "f1vgc2s3"],
	Bj3rh1h: "f494woh"
} }, { d: [
	".f1euv43f{position:absolute;}",
	".f15twtuk{top:0;}",
	".f1vgc2s3{left:0;}",
	".f1e31b4d{right:0;}",
	".f494woh{z-index:1000000;}"
] }), em = N.useInsertionEffect, tm = (e) => {
	let { className: t, dir: n, focusVisibleRef: r, targetNode: i } = e, a = N.useMemo(() => {
		if (i === void 0 || e.disabled) return null;
		let t = i.ownerDocument.createElement("div");
		return i.appendChild(t), t;
	}, [i, e.disabled]);
	return N.useMemo(() => {
		a && (a.className = t, a.setAttribute("dir", n), a.setAttribute("data-portal-node", "true"), r.current = a);
	}, [
		t,
		n,
		a,
		r
	]), N.useEffect(() => () => {
		a?.remove();
	}, [a]), a;
}, nm = () => {
	let e;
	function t(t, n) {
		return e || (n && (e = t.ownerDocument.createElement("div"), t.appendChild(e)), e);
	}
	function n() {
		e &&= (e.remove(), void 0);
	}
	return {
		get: t,
		dispose: n
	};
}, rm = em ? (e) => {
	"use no memo";
	let { className: t, dir: n, focusVisibleRef: r, targetNode: i } = e, [a] = N.useState(nm), o = N.useMemo(() => i === void 0 || e.disabled ? null : new Proxy({}, {
		get(e, t) {
			if (t === "nodeType") return 1;
			if (t === "remove") {
				let e = a.get(i, !1);
				return e && e.childNodes.length === 0 && a.dispose(), () => {};
			}
			let n = a.get(i, !0), r = n ? n[t] : void 0;
			return typeof r == "function" ? r.bind(n) : r;
		},
		set(e, t, n) {
			let r = t === "_virtual" || t === "focusVisible", o = r ? a.get(i, !1) : a.get(i, !0);
			return r && !o ? !0 : o ? (Object.assign(o, { [t]: n }), !0) : !1;
		}
	}), [
		a,
		i,
		e.disabled
	]);
	return em(() => {
		if (!o) return;
		let e = t.split(" ").filter(Boolean);
		return o.classList.add(...e), o.setAttribute("dir", n), o.setAttribute("data-portal-node", "true"), r.current = o, () => {
			o.classList.remove(...e), o.removeAttribute("dir");
		};
	}, [
		t,
		n,
		o,
		r
	]), N.useEffect(() => () => {
		o?.remove();
	}, [o]), o;
} : tm, im = (e) => {
	"use no memo";
	let { targetDocument: t, dir: n } = Zr(), r = oi(), i = Ls(), a = $p(), o = Ur();
	return rm({
		dir: n,
		disabled: e.disabled,
		focusVisibleRef: i,
		className: O(o, a.root, e.className),
		targetNode: r ?? t?.body
	});
}, am = (e) => {
	let { element: t, className: n } = Qp(e.mountNode), r = N.useRef(null), i = im({
		disabled: !!t,
		className: n
	}), a = t ?? i, o = {
		children: e.children,
		mountNode: a,
		virtualParentRootRef: r
	};
	return N.useEffect(() => {
		if (!a) return;
		let e = r.current, t = a.contains(e);
		if (e && !t) return Ji(a, e), () => {
			Ji(a, void 0);
		};
	}, [r, a]), o;
}, om = /* @__PURE__ */ l(h(), 1), sm = (e) => /*#__PURE__*/ N.createElement("span", {
	hidden: !0,
	ref: e.virtualParentRootRef
}, e.mountNode && /*#__PURE__*/ om.createPortal(/*#__PURE__*/ N.createElement(N.Fragment, null, e.children, /*#__PURE__*/ N.createElement("span", { hidden: !0 })), e.mountNode)), cm = (e) => sm(am(e));
cm.displayName = "Portal";
//#endregion
//#region node_modules/@fluentui/react-tooltip/lib/components/Tooltip/private/useTooltipTimeout.js
var lm = (e) => -1, um = (e) => void 0;
function dm(e) {
	let { targetDocument: t } = Zr(), n = t?.defaultView, r = n ? n.setTimeout : lm, i = n ? n.clearTimeout : um, a = N.useRef(void 0), o = N.useCallback((e, t) => (a.current !== void 0 && i(a.current), a.current = r(e, t ?? 0), a.current), [i, r]), s = N.useCallback(() => {
		a.current !== void 0 && (i(a.current), a.current = void 0);
	}, [i]);
	return N.useEffect(() => {
		let t = e.current;
		return () => {
			(!t || !t.isConnected) && s();
		};
	}, [s, e]), [o, s];
}
//#endregion
//#region node_modules/@fluentui/react-tooltip/lib/components/Tooltip/useTooltipBase.js
var fm = (e) => {
	let t = qr(), n = vi(), { targetDocument: r } = Zr(), [i, a] = di({
		state: e.visible,
		initialState: !1
	}), [o, s] = N.useState(!1), { children: c, content: l, withArrow: u = !1, positioning: d = "above", onVisibleChange: f, relationship: p, showDelay: m = 250, hideDelay: h = 250, mountNode: g } = e, _ = {
		withArrow: u,
		positioning: d,
		showDelay: m,
		hideDelay: h,
		relationship: p,
		visible: i,
		hidden: o,
		shouldRenderTooltip: i,
		mountNode: g,
		components: { content: "div" },
		content: tr(l, {
			defaultProps: { role: "tooltip" },
			elementType: "div"
		})
	};
	_.content.id = wi("tooltip-", _.content.id);
	let v = dp(_.positioning), y = I((e) => {
		var t;
		s(e.detail.referenceHidden), (t = v.onPositioningEnd) == null || t.call(v, e);
	}), b = {
		enabled: _.visible,
		arrowPadding: 8,
		position: "above",
		align: "center",
		offset: 4,
		...v,
		onPositioningEnd: y
	};
	_.withArrow && (b.offset = ep(b.offset, 6));
	let { targetRef: x, containerRef: S, arrowRef: C } = Np(b), [w, T] = dm(S), E = N.useCallback((e, t) => {
		T(), a((n) => (t.visible !== n && f?.(e, t), t.visible));
	}, [
		T,
		a,
		f
	]);
	_.content.ref = Ti(_.content.ref, S), _.arrowRef = C, yi(() => {
		if (i) {
			var e;
			let n = { hide: (e) => E(void 0, {
				visible: !1,
				documentKeyboardEvent: e
			}) };
			(e = t.visibleTooltip) == null || e.hide(), t.visibleTooltip = n;
			let i = (e) => {
				e.key === "Escape" && !e.defaultPrevented && (n.hide(e), e.preventDefault());
			};
			r?.addEventListener("keydown", i, { capture: !0 });
			let a = () => {
				r?.visibilityState === "hidden" && n.hide();
			};
			return r?.addEventListener("visibilitychange", a), () => {
				t.visibleTooltip === n && (t.visibleTooltip = void 0), r?.removeEventListener("keydown", i, { capture: !0 }), r?.removeEventListener("visibilitychange", a);
			};
		}
	}, [
		t,
		r,
		i,
		E
	]);
	let D = N.useRef(!1), ee = N.useCallback((e) => {
		if (e.type === "focus" && D.current) {
			D.current = !1;
			return;
		}
		let n = t.visibleTooltip ? 0 : _.showDelay;
		w(() => {
			E(e, { visible: !0 });
		}, n), e.persist();
	}, [
		w,
		E,
		_.showDelay,
		t
	]), te = Ys(), [ne] = N.useState(() => {
		let e = (e) => {
			e.detail?.isFocusedProgrammatically && !te() && (D.current = !0);
		}, t = null;
		return (n) => {
			t?.removeEventListener("keyborg:focusin", e), n?.addEventListener("keyborg:focusin", e), t = n;
		};
	}), re = N.useCallback((e) => {
		let t = _.hideDelay;
		e.type === "blur" && (t = 0, D.current = r?.activeElement === e.target), w(() => {
			E(e, { visible: !1 });
		}, t), e.persist();
	}, [
		w,
		E,
		_.hideDelay,
		r
	]);
	_.content.onPointerEnter = Ri(_.content.onPointerEnter, T), _.content.onPointerLeave = Ri(_.content.onPointerLeave, re), _.content.onFocus = Ri(_.content.onFocus, T), _.content.onBlur = Ri(_.content.onBlur, re);
	let ie = Ui(c), O = {}, ae = ie?.props?.["aria-haspopup"] && (ie?.props?.["aria-expanded"] === !0 || ie?.props?.["aria-expanded"] === "true");
	return p === "label" ? typeof _.content.children == "string" ? O["aria-label"] = _.content.children : (O["aria-labelledby"] = _.content.id, _.shouldRenderTooltip = !0) : p === "description" && (O["aria-describedby"] = _.content.id, _.shouldRenderTooltip = !0), (n || ae) && (_.shouldRenderTooltip = !1), _.children = Vi(c, {
		...O,
		...ie?.props,
		ref: Ti(Li(ie), ne, b.target === void 0 ? x : void 0),
		onPointerEnter: I(Ri(ie?.props?.onPointerEnter, ee)),
		onPointerLeave: I(Ri(ie?.props?.onPointerLeave, re)),
		onFocus: I(Ri(ie?.props?.onFocus, ee)),
		onBlur: I(Ri(ie?.props?.onBlur, re))
	}), _;
}, pm = (e) => {
	"use no memo";
	let { appearance: t = "normal", ...n } = e;
	return {
		appearance: t,
		...fm(n)
	};
}, mm = (e) => /*#__PURE__*/ ta(N.Fragment, { children: [e.children, e.shouldRenderTooltip && /*#__PURE__*/ L(cm, {
	mountNode: e.mountNode,
	children: /*#__PURE__*/ ta(e.content, { children: [e.withArrow && /*#__PURE__*/ L("div", {
		ref: e.arrowRef,
		className: e.arrowClassName
	}), e.content.children] })
})] }), hm = { content: "fui-Tooltip__content" }, gm = /*#__PURE__*/ F({
	root: {
		mc9l5x: "fjseox",
		B7ck84d: "f1ewtqcl",
		B2u0y6b: "f132xexn",
		Bceei9c: "f158kwzp",
		Bahqtrf: "fk6fouc",
		Be2twd7: "fy9rknc",
		Bg96gwp: "fwrc4pm",
		Btd35i7: "fokg9q4",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "ft85np5",
		Bgfg5da: 0,
		B9xav0g: 0,
		oivjwe: 0,
		Bn0qgzm: 0,
		B4g9neb: 0,
		zhjwy3: 0,
		wvpqe5: 0,
		ibv6hh: 0,
		u1mtju: 0,
		h3c5rm: 0,
		vrafjx: 0,
		Bekrc4i: 0,
		i8vvqc: 0,
		g2u3we: 0,
		icvyot: 0,
		B4j52fo: 0,
		irswps: "f9ggezi",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1bzqsji",
		De3pzq: "fxugw4r",
		sj55zd: "f19n0e5",
		Bhu2qc9: "fxeb0a7"
	},
	visible: { mc9l5x: "ftgm304" },
	hidden: {
		Bcdw1i0: "fd7fpy0",
		Bkecrkj: "f1aehjj5"
	},
	inverted: {
		De3pzq: "fg3r6xk",
		sj55zd: "fonrgv7"
	},
	arrow: {
		B7ck84d: "f1ewtqcl",
		qhf8xq: "f1euv43f",
		Bj3rh1h: "f1bsuimh",
		rhnwrx: "f1s3jn22",
		Bdy53xb: "fv40uqz",
		De3pzq: "f1u2r49w",
		B2eet1l: "fqhgnl",
		Beyfa6y: "f17bz04i",
		Bz10aip: "f36o3x3",
		Bqenvij: "fzofk8q",
		a9b677: "f1wbx1ie",
		Ftih45: "f1wl9k8s",
		Br0sdwz: "f1aocrix",
		cmx5o7: "f1ljr5q2",
		susq4k: 0,
		Biibvgv: 0,
		Bicfajf: 0,
		qehafq: 0,
		Brs5u8j: "f155f1qt",
		Ccq8qp: "f9mhzq7",
		Baz25je: "fr6rhvx",
		Bcgcnre: 0,
		Bqjgrrk: 0,
		qa3bma: 0,
		y0oebl: 0,
		Biqmznv: 0,
		Bm6vgfq: 0,
		Bbv0w2i: 0,
		uvfttm: 0,
		eqrjj: 0,
		Bk5zm6e: 0,
		m598lv: 0,
		B4f6apu: 0,
		ydt019: 0,
		Bq4z7u6: 0,
		Bdkvgpv: 0,
		B0qfbqy: 0,
		kj8mxx: "f1kc0wz4",
		r59vdv: "fgq90dz",
		Bkw5xw4: "fq0y47f",
		hl6cv3: "f1pwrbz6",
		aea9ga: "f1hxxcvm",
		yayu3t: "fw8rgyo",
		Bhsv975: "f1wnzycx",
		rhl9o9: "f1730wal",
		B7gxrvb: "f1fy4ixr",
		B6q6orb: "fobkauc",
		B0lu1f8: "f16bqv1l"
	}
}, { d: [
	".fjseox{display:none;}",
	".f1ewtqcl{box-sizing:border-box;}",
	".f132xexn{max-width:240px;}",
	".f158kwzp{cursor:default;}",
	".fk6fouc{font-family:var(--fontFamilyBase);}",
	".fy9rknc{font-size:var(--fontSizeBase200);}",
	".fwrc4pm{line-height:var(--lineHeightBase200);}",
	".fokg9q4{overflow-wrap:break-word;}",
	[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
	[".f9ggezi{border:1px solid var(--colorTransparentStroke);}", { p: -2 }],
	[".f1bzqsji{padding:4px 11px 6px 11px;}", { p: -1 }],
	".fxugw4r{background-color:var(--colorNeutralBackground1);}",
	".f19n0e5{color:var(--colorNeutralForeground1);}",
	".fxeb0a7{filter:drop-shadow(0 0 2px var(--colorNeutralShadowAmbient)) drop-shadow(0 4px 8px var(--colorNeutralShadowKey));}",
	".ftgm304{display:block;}",
	".fd7fpy0{visibility:hidden;}",
	".f1aehjj5{pointer-events:none;}",
	".fg3r6xk{background-color:var(--colorNeutralBackgroundStatic);}",
	".fonrgv7{color:var(--colorNeutralForegroundStaticInverted);}",
	".f1euv43f{position:absolute;}",
	".f1bsuimh{z-index:-1;}",
	".f1s3jn22{--fui-positioning-arrow-height:8.484px;}",
	".fv40uqz{--fui-positioning-arrow-offset:-4.242px;}",
	".f1u2r49w{background-color:inherit;}",
	".fqhgnl{background-clip:content-box;}",
	".f17bz04i{border-bottom-left-radius:var(--borderRadiusSmall);}",
	".f36o3x3{transform:rotate(var(--fui-positioning-arrow-angle));}",
	".fzofk8q{height:var(--fui-positioning-arrow-height);}",
	".f1wbx1ie{width:var(--fui-positioning-arrow-height);}",
	".f1wl9k8s::before{content:\"\";}",
	".f1aocrix::before{display:block;}",
	".f1ljr5q2::before{background-color:inherit;}",
	[".f155f1qt::before{margin:-1px;}", { p: -1 }],
	".f9mhzq7::before{width:100%;}",
	".fr6rhvx::before{height:100%;}",
	[".f1kc0wz4::before{border:1px solid var(--colorTransparentStroke);}", { p: -2 }],
	".fgq90dz::before{border-bottom-left-radius:var(--borderRadiusSmall);}",
	".fq0y47f::before{clip-path:polygon(0% 0%, 100% 100%, 0% 100%);}",
	"[data-popper-placement^=\"top\"] .f1pwrbz6{bottom:var(--fui-positioning-arrow-offset);}",
	"[data-popper-placement^=\"top\"] .f1hxxcvm{--fui-positioning-arrow-angle:-45deg;}",
	"[data-popper-placement^=\"right\"] .fw8rgyo{left:var(--fui-positioning-arrow-offset);}",
	"[data-popper-placement^=\"right\"] .f1wnzycx{--fui-positioning-arrow-angle:45deg;}",
	"[data-popper-placement^=\"bottom\"] .f1730wal{top:var(--fui-positioning-arrow-offset);}",
	"[data-popper-placement^=\"bottom\"] .f1fy4ixr{--fui-positioning-arrow-angle:135deg;}",
	"[data-popper-placement^=\"left\"] .fobkauc{right:var(--fui-positioning-arrow-offset);}",
	"[data-popper-placement^=\"left\"] .f16bqv1l{--fui-positioning-arrow-angle:225deg;}"
] }), _m = (e) => {
	let t = gm();
	return e.content.className = O(hm.content, t.root, e.appearance === "inverted" && t.inverted, e.visible && t.visible, e.hidden && t.hidden, e.content.className), e.arrowClassName = t.arrow, e;
}, vm = (e) => {
	let t = pm(e);
	return _m(t), ii("useTooltipStyles_unstable")(t), mm(t);
};
vm.displayName = "Tooltip", vm.isFluentTriggerComponent = !0;
//#endregion
//#region node_modules/@fluentui/react-button/lib/components/Button/renderButton.js
var ym = (e) => {
	let { iconOnly: t, iconPosition: n } = e;
	return /*#__PURE__*/ ta(e.root, { children: [
		n !== "after" && e.icon && /*#__PURE__*/ L(e.icon, {}),
		!t && e.root.children,
		n === "after" && e.icon && /*#__PURE__*/ L(e.icon, {})
	] });
}, bm = N.createContext(void 0), xm = {};
bm.Provider;
var Sm = () => N.useContext(bm) ?? xm, Cm = (e, t) => {
	let { size: n } = Sm(), { appearance: r = "secondary", shape: i = "rounded", size: a = n ?? "medium", ...o } = e;
	return {
		appearance: r,
		shape: i,
		size: a,
		...wm(o, t)
	};
}, wm = (e, t) => {
	let { icon: n, iconPosition: r = "before", ...i } = e, a = nr(n, { elementType: "span" });
	return {
		disabled: e.disabled ?? !1,
		disabledFocusable: e.disabledFocusable ?? !1,
		iconPosition: r,
		iconOnly: !(!a?.children || e.children),
		components: {
			root: "button",
			icon: "span"
		},
		root: tr(Il(i.as, i), {
			elementType: "button",
			defaultProps: {
				ref: t,
				type: e.as === "a" ? void 0 : "button"
			}
		}),
		icon: a
	};
}, Tm = {
	root: "fui-Button",
	icon: "fui-Button__icon"
};
`${G.strokeWidthThin}`;
var Em = /*#__PURE__*/ Jn("r1f29ykk", null, {
	r: [
		".r1f29ykk{align-items:center;box-sizing:border-box;display:inline-flex;justify-content:center;text-decoration-line:none;vertical-align:middle;margin:0;overflow:hidden;background-color:var(--colorNeutralBackground1);color:var(--colorNeutralForeground1);border:var(--strokeWidthThin) solid var(--colorNeutralStroke1);font-family:var(--fontFamilyBase);outline-style:none;padding:5px var(--spacingHorizontalM);min-width:96px;border-radius:var(--borderRadiusMedium);font-size:var(--fontSizeBase300);font-weight:var(--fontWeightSemibold);line-height:var(--lineHeightBase300);transition-duration:var(--durationFaster);transition-property:background,border,color;transition-timing-function:var(--curveEasyEase);}",
		".r1f29ykk:hover{background-color:var(--colorNeutralBackground1Hover);border-color:var(--colorNeutralStroke1Hover);color:var(--colorNeutralForeground1Hover);cursor:pointer;}",
		".r1f29ykk:hover:active,.r1f29ykk:active:focus-visible{background-color:var(--colorNeutralBackground1Pressed);border-color:var(--colorNeutralStroke1Pressed);color:var(--colorNeutralForeground1Pressed);outline-style:none;}",
		".r1f29ykk[data-fui-focus-visible]{border-color:var(--colorStrokeFocus2);border-radius:var(--borderRadiusMedium);border-width:1px;outline:var(--strokeWidthThick) solid var(--colorTransparentStroke);box-shadow:0 0 0 var(--strokeWidthThin) var(--colorStrokeFocus2) inset;z-index:1;}"
	],
	s: [
		"@media screen and (prefers-reduced-motion: reduce){.r1f29ykk{transition-duration:0.01ms;}}",
		"@media (forced-colors: active){.r1f29ykk:focus{border-color:ButtonText;}.r1f29ykk:hover{background-color:HighlightText;border-color:Highlight;color:Highlight;forced-color-adjust:none;}.r1f29ykk:hover:active,.r1f29ykk:active:focus-visible{background-color:HighlightText;border-color:Highlight;color:Highlight;forced-color-adjust:none;}}",
		"@supports (-moz-appearance:button){.r1f29ykk[data-fui-focus-visible]{box-shadow:0 0 0 calc(var(--strokeWidthThin) + 0.25px) var(--colorStrokeFocus2) inset;}}"
	]
}), Dm = /*#__PURE__*/ Jn("rywnvv2", null, [".rywnvv2{align-items:center;display:inline-flex;justify-content:center;font-size:20px;height:20px;width:20px;--fui-Button__icon--spacing:var(--spacingHorizontalSNudge);}"]), Om = /*#__PURE__*/ F({
	outline: {
		De3pzq: "f1c21dwh",
		Jwef8y: "fjxutwb",
		Bpjbzib: "fkoldzo"
	},
	primary: {
		De3pzq: "ffp7eso",
		g2u3we: "f1p3nwhy",
		h3c5rm: ["f11589ue", "f1pdflbu"],
		B9xav0g: "f1q5o8ev",
		zhjwy3: ["f1pdflbu", "f11589ue"],
		sj55zd: "f1phragk",
		Jwef8y: "f15wkkf3",
		Bgoe8wy: "f1s2uweq",
		Bwzppfd: ["fr80ssc", "fecsdlb"],
		oetu4i: "f1ukrpxl",
		gg5e9n: ["fecsdlb", "fr80ssc"],
		Bi91k9c: "f1rq72xc",
		Bpjbzib: "f1ksv2xa",
		im15vp: "fhvnf4x",
		Hjvxdg: ["fb6swo4", "f232fm2"],
		Gpfmf1: "f1klyf7k",
		ustxxc: ["f232fm2", "fb6swo4"],
		Brsut9c: "f1d6mv4x",
		By8wz76: "f1nz3ub2",
		Bcq6wej: "fag2qd2",
		Jcjdmf: ["fmvhcg7", "f14bpyus"],
		sc4o1m: "f1o3dhpw",
		Bosien3: ["f14bpyus", "fmvhcg7"],
		B7iucu3: "fqc85l4",
		B8gzw0y: "f1h3a8gf",
		Bbkh6qg: "fkiggi6",
		F230oe: "f8gmj8i",
		Bdw8ktp: ["f1ap8nzx", "fjag8bx"],
		Bj1xduy: "f1igan7k",
		Bhh2cfd: ["fjag8bx", "f1ap8nzx"],
		Bahaeuw: "f1v3eptx",
		Bv2bamp: "f1ysmecq",
		vxuvv6: "faulsx",
		Bli9q98: ["f79t15f", "f8qmx7k"],
		Bx2tt8t: "fbtzoaq",
		yad0b3: ["f8qmx7k", "f79t15f"],
		j2fop7: "fd4bjan"
	},
	secondary: {},
	subtle: {
		De3pzq: "fhovq9v",
		g2u3we: "f1p3nwhy",
		h3c5rm: ["f11589ue", "f1pdflbu"],
		B9xav0g: "f1q5o8ev",
		zhjwy3: ["f1pdflbu", "f11589ue"],
		sj55zd: "fkfq4zb",
		Jwef8y: "f1t94bn6",
		Bgoe8wy: "f1s2uweq",
		Bwzppfd: ["fr80ssc", "fecsdlb"],
		oetu4i: "f1ukrpxl",
		gg5e9n: ["fecsdlb", "fr80ssc"],
		Bi91k9c: "fnwyq0v",
		Bk3fhr4: "ft1hn21",
		Bmfj8id: "fuxngvv",
		Bbdnnc7: "fy5bs14",
		Bpjbzib: "f1q1yqic",
		im15vp: "fhvnf4x",
		Hjvxdg: ["fb6swo4", "f232fm2"],
		Gpfmf1: "f1klyf7k",
		ustxxc: ["f232fm2", "fb6swo4"],
		Brsut9c: "fwga7ee",
		Bqou3pl: "f1nhwcv0",
		Bsnehw8: "f1gm6xmp",
		wsxvnf: "f1xxsver",
		Bahaeuw: "f1v3eptx",
		Buhizc3: "fivsta0",
		j2fop7: "fd4bjan",
		Bqabnb4: "f3m6zum"
	},
	transparent: {
		De3pzq: "f1c21dwh",
		g2u3we: "f1p3nwhy",
		h3c5rm: ["f11589ue", "f1pdflbu"],
		B9xav0g: "f1q5o8ev",
		zhjwy3: ["f1pdflbu", "f11589ue"],
		sj55zd: "fkfq4zb",
		Jwef8y: "fjxutwb",
		Bgoe8wy: "f1s2uweq",
		Bwzppfd: ["fr80ssc", "fecsdlb"],
		oetu4i: "f1ukrpxl",
		gg5e9n: ["fecsdlb", "fr80ssc"],
		Bi91k9c: "f139oj5f",
		Bk3fhr4: "ft1hn21",
		Bmfj8id: "fuxngvv",
		Bpjbzib: "fkoldzo",
		im15vp: "fhvnf4x",
		Hjvxdg: ["fb6swo4", "f232fm2"],
		Gpfmf1: "f1klyf7k",
		ustxxc: ["f232fm2", "fb6swo4"],
		Brsut9c: "f1l983o9",
		Bqou3pl: "f1nhwcv0",
		Bsnehw8: "f1gm6xmp",
		Bbkh6qg: "fxoo9op",
		Bahaeuw: "f1v3eptx",
		Bv2bamp: "f1i0gk12",
		j2fop7: "fd4bjan"
	},
	circular: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "f44lkw9"
	},
	rounded: {},
	square: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "f1fabniw"
	},
	small: {
		Bf4jedk: "fh7ncta",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "fneth5b",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "ft85np5",
		Be2twd7: "fy9rknc",
		Bhrd7zp: "figsok6",
		Bg96gwp: "fwrc4pm"
	},
	smallWithIcon: {
		Byoj8tv: "f1brlhvm",
		z8tnut: "f1sl3k7w"
	},
	medium: {},
	large: {
		Bf4jedk: "f14es27b",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f4db1ww",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "ft85np5",
		Be2twd7: "fod5ikn",
		Bhrd7zp: "fl43uef",
		Bg96gwp: "faaz57k"
	},
	largeWithIcon: {
		Byoj8tv: "fy7v416",
		z8tnut: "f1a1bwwz"
	}
}, {
	d: [
		".f1c21dwh{background-color:var(--colorTransparentBackground);}",
		".ffp7eso{background-color:var(--colorBrandBackground);}",
		".f1p3nwhy{border-top-color:transparent;}",
		".f11589ue{border-right-color:transparent;}",
		".f1pdflbu{border-left-color:transparent;}",
		".f1q5o8ev{border-bottom-color:transparent;}",
		".f1phragk{color:var(--colorNeutralForegroundOnBrand);}",
		".fhovq9v{background-color:var(--colorSubtleBackground);}",
		".fkfq4zb{color:var(--colorNeutralForeground2);}",
		[".f44lkw9{border-radius:var(--borderRadiusCircular);}", { p: -1 }],
		[".f1fabniw{border-radius:var(--borderRadiusNone);}", { p: -1 }],
		".fh7ncta{min-width:64px;}",
		[".fneth5b{padding:3px var(--spacingHorizontalS);}", { p: -1 }],
		[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		".fy9rknc{font-size:var(--fontSizeBase200);}",
		".figsok6{font-weight:var(--fontWeightRegular);}",
		".fwrc4pm{line-height:var(--lineHeightBase200);}",
		".f1brlhvm{padding-bottom:1px;}",
		".f1sl3k7w{padding-top:1px;}",
		".f14es27b{min-width:96px;}",
		[".f4db1ww{padding:8px var(--spacingHorizontalL);}", { p: -1 }],
		[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		".fod5ikn{font-size:var(--fontSizeBase400);}",
		".fl43uef{font-weight:var(--fontWeightSemibold);}",
		".faaz57k{line-height:var(--lineHeightBase400);}",
		".fy7v416{padding-bottom:7px;}",
		".f1a1bwwz{padding-top:7px;}"
	],
	h: [
		".fjxutwb:hover{background-color:var(--colorTransparentBackgroundHover);}",
		".fkoldzo:hover:active,.fkoldzo:active:focus-visible{background-color:var(--colorTransparentBackgroundPressed);}",
		".f15wkkf3:hover{background-color:var(--colorBrandBackgroundHover);}",
		".f1s2uweq:hover{border-top-color:transparent;}",
		".fr80ssc:hover{border-right-color:transparent;}",
		".fecsdlb:hover{border-left-color:transparent;}",
		".f1ukrpxl:hover{border-bottom-color:transparent;}",
		".f1rq72xc:hover{color:var(--colorNeutralForegroundOnBrand);}",
		".f1ksv2xa:hover:active,.f1ksv2xa:active:focus-visible{background-color:var(--colorBrandBackgroundPressed);}",
		".fhvnf4x:hover:active,.fhvnf4x:active:focus-visible{border-top-color:transparent;}",
		".fb6swo4:hover:active,.fb6swo4:active:focus-visible{border-right-color:transparent;}",
		".f232fm2:hover:active,.f232fm2:active:focus-visible{border-left-color:transparent;}",
		".f1klyf7k:hover:active,.f1klyf7k:active:focus-visible{border-bottom-color:transparent;}",
		".f1d6mv4x:hover:active,.f1d6mv4x:active:focus-visible{color:var(--colorNeutralForegroundOnBrand);}",
		".f1t94bn6:hover{background-color:var(--colorSubtleBackgroundHover);}",
		".fnwyq0v:hover{color:var(--colorNeutralForeground2Hover);}",
		".ft1hn21:hover .fui-Icon-filled{display:inline;}",
		".fuxngvv:hover .fui-Icon-regular{display:none;}",
		".fy5bs14:hover .fui-Button__icon{color:var(--colorNeutralForeground2BrandHover);}",
		".f1q1yqic:hover:active,.f1q1yqic:active:focus-visible{background-color:var(--colorSubtleBackgroundPressed);}",
		".fwga7ee:hover:active,.fwga7ee:active:focus-visible{color:var(--colorNeutralForeground2Pressed);}",
		".f1nhwcv0:hover:active .fui-Icon-filled,.f1nhwcv0:active:focus-visible .fui-Icon-filled{display:inline;}",
		".f1gm6xmp:hover:active .fui-Icon-regular,.f1gm6xmp:active:focus-visible .fui-Icon-regular{display:none;}",
		".f1xxsver:hover:active .fui-Button__icon,.f1xxsver:active:focus-visible .fui-Button__icon{color:var(--colorNeutralForeground2BrandPressed);}",
		".f139oj5f:hover{color:var(--colorNeutralForeground2BrandHover);}",
		".f1l983o9:hover:active,.f1l983o9:active:focus-visible{color:var(--colorNeutralForeground2BrandPressed);}"
	],
	m: [
		["@media (forced-colors: active){.f1nz3ub2{background-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fag2qd2{border-top-color:HighlightText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f14bpyus{border-left-color:HighlightText;}.fmvhcg7{border-right-color:HighlightText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1o3dhpw{border-bottom-color:HighlightText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fqc85l4{color:HighlightText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1h3a8gf{forced-color-adjust:none;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fkiggi6:hover{background-color:HighlightText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f8gmj8i:hover{border-top-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1ap8nzx:hover{border-right-color:Highlight;}.fjag8bx:hover{border-left-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1igan7k:hover{border-bottom-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1v3eptx:hover{color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1ysmecq:hover:active,.f1ysmecq:active:focus-visible{background-color:HighlightText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.faulsx:hover:active,.faulsx:active:focus-visible{border-top-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f79t15f:hover:active,.f79t15f:active:focus-visible{border-right-color:Highlight;}.f8qmx7k:hover:active,.f8qmx7k:active:focus-visible{border-left-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fbtzoaq:hover:active,.fbtzoaq:active:focus-visible{border-bottom-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fd4bjan:hover:active,.fd4bjan:active:focus-visible{color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fivsta0:hover .fui-Button__icon{color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f3m6zum:hover:active .fui-Button__icon,.f3m6zum:active:focus-visible .fui-Button__icon{color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fxoo9op:hover{background-color:var(--colorTransparentBackground);}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1i0gk12:hover:active,.f1i0gk12:active:focus-visible{background-color:var(--colorTransparentBackground);}}", { m: "(forced-colors: active)" }]
	]
}), km = /*#__PURE__*/ F({
	base: {
		De3pzq: "f1bg9a2p",
		g2u3we: "f1jj8ep1",
		h3c5rm: ["f15xbau", "fy0fskl"],
		B9xav0g: "f4ikngz",
		zhjwy3: ["fy0fskl", "f15xbau"],
		sj55zd: "f1s2aq7o",
		Bceei9c: "fdrzuqr",
		Bfinmwp: "f15x8b5r",
		Jwef8y: "f1falr9n",
		Bgoe8wy: "f12mpcsy",
		Bwzppfd: ["f1gwvigk", "f18rmfxp"],
		oetu4i: "f1jnshp0",
		gg5e9n: ["f18rmfxp", "f1gwvigk"],
		Bi91k9c: "fvgxktp",
		eoavqd: "fphbwmw",
		Bk3fhr4: "f19vpps7",
		Bmfj8id: "fv5swzo",
		Bbdnnc7: "f1al02dq",
		Bpjbzib: "f1jct5ie",
		im15vp: "f13txml0",
		Hjvxdg: ["f1ncddno", "f1axfvow"],
		Gpfmf1: "f1z04ada",
		ustxxc: ["f1axfvow", "f1ncddno"],
		Brsut9c: "f1uhomfy",
		Bses4qk: "fy9mucy",
		Bqou3pl: "f1g9va8i",
		Bsnehw8: "fwgvudy",
		wsxvnf: "fom6jww"
	},
	highContrast: {
		By8wz76: "f14ptb23",
		Bcq6wej: "f9dbb4x",
		Jcjdmf: ["f3qs60o", "f5u9ap2"],
		sc4o1m: "fwd1oij",
		Bosien3: ["f5u9ap2", "f3qs60o"],
		B7iucu3: "f1cyfu5x",
		Grqk0h: "f127ot8j",
		h3ptyc: "f19etb0b",
		Buw724y: ["f4f984j", "fw441p0"],
		Buk7464: "f3d22hf",
		Hwei09: ["fw441p0", "f4f984j"],
		Bbkh6qg: "fj8k9ua",
		F230oe: "fifrq0d",
		Bdw8ktp: ["f196mwp7", "fnekfq"],
		Bj1xduy: "f1l6uprw",
		Bhh2cfd: ["fnekfq", "f196mwp7"],
		Bahaeuw: "fa9u7a5",
		Buhizc3: "f1m71e0y",
		Bv2bamp: "fw24f3",
		vxuvv6: "f1nznrny",
		Bli9q98: ["fq8nxuu", "f1ao3jkc"],
		Bx2tt8t: "ftoixeo",
		yad0b3: ["f1ao3jkc", "fq8nxuu"],
		j2fop7: "fpmuzpx",
		Bqabnb4: "f168odog"
	},
	outline: {
		De3pzq: "f1c21dwh",
		Jwef8y: "f9ql6rf",
		Bpjbzib: "f9r0db0"
	},
	primary: {
		g2u3we: "f1p3nwhy",
		h3c5rm: ["f11589ue", "f1pdflbu"],
		B9xav0g: "f1q5o8ev",
		zhjwy3: ["f1pdflbu", "f11589ue"],
		Bgoe8wy: "f1s2uweq",
		Bwzppfd: ["fr80ssc", "fecsdlb"],
		oetu4i: "f1ukrpxl",
		gg5e9n: ["fecsdlb", "fr80ssc"],
		im15vp: "fhvnf4x",
		Hjvxdg: ["fb6swo4", "f232fm2"],
		Gpfmf1: "f1klyf7k",
		ustxxc: ["f232fm2", "fb6swo4"]
	},
	secondary: {},
	subtle: {
		De3pzq: "f1c21dwh",
		g2u3we: "f1p3nwhy",
		h3c5rm: ["f11589ue", "f1pdflbu"],
		B9xav0g: "f1q5o8ev",
		zhjwy3: ["f1pdflbu", "f11589ue"],
		Jwef8y: "f9ql6rf",
		Bgoe8wy: "f1s2uweq",
		Bwzppfd: ["fr80ssc", "fecsdlb"],
		oetu4i: "f1ukrpxl",
		gg5e9n: ["fecsdlb", "fr80ssc"],
		Bpjbzib: "f9r0db0",
		im15vp: "fhvnf4x",
		Hjvxdg: ["fb6swo4", "f232fm2"],
		Gpfmf1: "f1klyf7k",
		ustxxc: ["f232fm2", "fb6swo4"]
	},
	transparent: {
		De3pzq: "f1c21dwh",
		g2u3we: "f1p3nwhy",
		h3c5rm: ["f11589ue", "f1pdflbu"],
		B9xav0g: "f1q5o8ev",
		zhjwy3: ["f1pdflbu", "f11589ue"],
		Jwef8y: "f9ql6rf",
		Bgoe8wy: "f1s2uweq",
		Bwzppfd: ["fr80ssc", "fecsdlb"],
		oetu4i: "f1ukrpxl",
		gg5e9n: ["fecsdlb", "fr80ssc"],
		Bpjbzib: "f9r0db0",
		im15vp: "fhvnf4x",
		Hjvxdg: ["fb6swo4", "f232fm2"],
		Gpfmf1: "f1klyf7k",
		ustxxc: ["f232fm2", "fb6swo4"]
	}
}, {
	d: [
		".f1bg9a2p{background-color:var(--colorNeutralBackgroundDisabled);}",
		".f1jj8ep1{border-top-color:var(--colorNeutralStrokeDisabled);}",
		".f15xbau{border-right-color:var(--colorNeutralStrokeDisabled);}",
		".fy0fskl{border-left-color:var(--colorNeutralStrokeDisabled);}",
		".f4ikngz{border-bottom-color:var(--colorNeutralStrokeDisabled);}",
		".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
		".fdrzuqr{cursor:not-allowed;}",
		".f15x8b5r .fui-Button__icon{color:var(--colorNeutralForegroundDisabled);}",
		".f1c21dwh{background-color:var(--colorTransparentBackground);}",
		".f1p3nwhy{border-top-color:transparent;}",
		".f11589ue{border-right-color:transparent;}",
		".f1pdflbu{border-left-color:transparent;}",
		".f1q5o8ev{border-bottom-color:transparent;}"
	],
	h: [
		".f1falr9n:hover{background-color:var(--colorNeutralBackgroundDisabled);}",
		".f12mpcsy:hover{border-top-color:var(--colorNeutralStrokeDisabled);}",
		".f1gwvigk:hover{border-right-color:var(--colorNeutralStrokeDisabled);}",
		".f18rmfxp:hover{border-left-color:var(--colorNeutralStrokeDisabled);}",
		".f1jnshp0:hover{border-bottom-color:var(--colorNeutralStrokeDisabled);}",
		".fvgxktp:hover{color:var(--colorNeutralForegroundDisabled);}",
		".fphbwmw:hover{cursor:not-allowed;}",
		".f19vpps7:hover .fui-Icon-filled{display:none;}",
		".fv5swzo:hover .fui-Icon-regular{display:inline;}",
		".f1al02dq:hover .fui-Button__icon{color:var(--colorNeutralForegroundDisabled);}",
		".f1jct5ie:hover:active,.f1jct5ie:active:focus-visible{background-color:var(--colorNeutralBackgroundDisabled);}",
		".f13txml0:hover:active,.f13txml0:active:focus-visible{border-top-color:var(--colorNeutralStrokeDisabled);}",
		".f1ncddno:hover:active,.f1ncddno:active:focus-visible{border-right-color:var(--colorNeutralStrokeDisabled);}",
		".f1axfvow:hover:active,.f1axfvow:active:focus-visible{border-left-color:var(--colorNeutralStrokeDisabled);}",
		".f1z04ada:hover:active,.f1z04ada:active:focus-visible{border-bottom-color:var(--colorNeutralStrokeDisabled);}",
		".f1uhomfy:hover:active,.f1uhomfy:active:focus-visible{color:var(--colorNeutralForegroundDisabled);}",
		".fy9mucy:hover:active,.fy9mucy:active:focus-visible{cursor:not-allowed;}",
		".f1g9va8i:hover:active .fui-Icon-filled,.f1g9va8i:active:focus-visible .fui-Icon-filled{display:none;}",
		".fwgvudy:hover:active .fui-Icon-regular,.fwgvudy:active:focus-visible .fui-Icon-regular{display:inline;}",
		".fom6jww:hover:active .fui-Button__icon,.fom6jww:active:focus-visible .fui-Button__icon{color:var(--colorNeutralForegroundDisabled);}",
		".f9ql6rf:hover{background-color:var(--colorTransparentBackground);}",
		".f9r0db0:hover:active,.f9r0db0:active:focus-visible{background-color:var(--colorTransparentBackground);}",
		".f1s2uweq:hover{border-top-color:transparent;}",
		".fr80ssc:hover{border-right-color:transparent;}",
		".fecsdlb:hover{border-left-color:transparent;}",
		".f1ukrpxl:hover{border-bottom-color:transparent;}",
		".fhvnf4x:hover:active,.fhvnf4x:active:focus-visible{border-top-color:transparent;}",
		".fb6swo4:hover:active,.fb6swo4:active:focus-visible{border-right-color:transparent;}",
		".f232fm2:hover:active,.f232fm2:active:focus-visible{border-left-color:transparent;}",
		".f1klyf7k:hover:active,.f1klyf7k:active:focus-visible{border-bottom-color:transparent;}"
	],
	m: [
		["@media (forced-colors: active){.f14ptb23{background-color:ButtonFace;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f9dbb4x{border-top-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f3qs60o{border-right-color:GrayText;}.f5u9ap2{border-left-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fwd1oij{border-bottom-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1cyfu5x{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f127ot8j .fui-Button__icon{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f19etb0b:focus{border-top-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f4f984j:focus{border-right-color:GrayText;}.fw441p0:focus{border-left-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f3d22hf:focus{border-bottom-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fj8k9ua:hover{background-color:ButtonFace;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fifrq0d:hover{border-top-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f196mwp7:hover{border-right-color:GrayText;}.fnekfq:hover{border-left-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1l6uprw:hover{border-bottom-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fa9u7a5:hover{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1m71e0y:hover .fui-Button__icon{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fw24f3:hover:active,.fw24f3:active:focus-visible{background-color:ButtonFace;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1nznrny:hover:active,.f1nznrny:active:focus-visible{border-top-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1ao3jkc:hover:active,.f1ao3jkc:active:focus-visible{border-left-color:GrayText;}.fq8nxuu:hover:active,.fq8nxuu:active:focus-visible{border-right-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.ftoixeo:hover:active,.ftoixeo:active:focus-visible{border-bottom-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fpmuzpx:hover:active,.fpmuzpx:active:focus-visible{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f168odog:hover:active .fui-Button__icon,.f168odog:active:focus-visible .fui-Button__icon{color:GrayText;}}", { m: "(forced-colors: active)" }]
	]
}), Am = /*#__PURE__*/ F({
	circular: {
		Bw81rd7: 0,
		kdpuga: 0,
		dm238s: 0,
		B6xbmo0: 0,
		B3whbx2: "f1062rbf"
	},
	rounded: {},
	square: {
		Bw81rd7: 0,
		kdpuga: 0,
		dm238s: 0,
		B6xbmo0: 0,
		B3whbx2: "fj0ryk1"
	},
	primary: {
		B8q5s1w: "f17t0x8g",
		Bci5o5g: ["f194v5ow", "fk7jm04"],
		n8qw10: "f1qgg65p",
		Bdrgwmp: ["fk7jm04", "f194v5ow"],
		j6ew2k: ["fhgccpy", "fjo7pq6"],
		he4mth: "f32wu9k",
		Byr4aka: "fu5nqqq",
		lks7q5: ["f13prjl2", "f1nl83rv"],
		Bnan3qt: "f1czftr5",
		k1dn9: ["f1nl83rv", "f13prjl2"],
		Bqsb82s: ["fixhny3", "f18mfu3r"],
		jg1oma: "feygou5"
	},
	small: {
		Bw81rd7: 0,
		kdpuga: 0,
		dm238s: 0,
		B6xbmo0: 0,
		B3whbx2: "fazmxh"
	},
	medium: {},
	large: {
		Bw81rd7: 0,
		kdpuga: 0,
		dm238s: 0,
		B6xbmo0: 0,
		B3whbx2: "f1b6alqh"
	}
}, {
	d: [
		[".f1062rbf[data-fui-focus-visible]{border-radius:var(--borderRadiusCircular);}", { p: -1 }],
		[".fj0ryk1[data-fui-focus-visible]{border-radius:var(--borderRadiusNone);}", { p: -1 }],
		".f17t0x8g[data-fui-focus-visible]{border-top-color:var(--colorStrokeFocus2);}",
		".f194v5ow[data-fui-focus-visible]{border-right-color:var(--colorStrokeFocus2);}",
		".fk7jm04[data-fui-focus-visible]{border-left-color:var(--colorStrokeFocus2);}",
		".f1qgg65p[data-fui-focus-visible]{border-bottom-color:var(--colorStrokeFocus2);}",
		".fhgccpy[data-fui-focus-visible]{box-shadow:var(--shadow2),0 0 0 var(--strokeWidthThin) var(--colorStrokeFocus2) inset,0 0 0 var(--strokeWidthThick) var(--colorNeutralForegroundOnBrand) inset;}",
		".fjo7pq6[data-fui-focus-visible]{box-shadow:var(--shadow2),0 0 0 var(--strokeWidthThin) var(--colorStrokeFocus2) inset,0 0 0 var(--strokeWidthThick) var(--colorNeutralForegroundOnBrand) inset;}",
		".f32wu9k[data-fui-focus-visible]:hover{box-shadow:var(--shadow2),0 0 0 var(--strokeWidthThin) var(--colorStrokeFocus2) inset;}",
		".fu5nqqq[data-fui-focus-visible]:hover{border-top-color:var(--colorStrokeFocus2);}",
		".f13prjl2[data-fui-focus-visible]:hover{border-right-color:var(--colorStrokeFocus2);}",
		".f1nl83rv[data-fui-focus-visible]:hover{border-left-color:var(--colorStrokeFocus2);}",
		".f1czftr5[data-fui-focus-visible]:hover{border-bottom-color:var(--colorStrokeFocus2);}",
		[".fazmxh[data-fui-focus-visible]{border-radius:var(--borderRadiusSmall);}", { p: -1 }],
		[".f1b6alqh[data-fui-focus-visible]{border-radius:var(--borderRadiusLarge);}", { p: -1 }]
	],
	t: ["@supports (-moz-appearance:button){.f18mfu3r[data-fui-focus-visible]{box-shadow:var(--shadow2),0 0 0 calc(var(--strokeWidthThin) + 0.25px) var(--colorStrokeFocus2) inset,0 0 0 var(--strokeWidthThick) var(--colorNeutralForegroundOnBrand) inset;}.fixhny3[data-fui-focus-visible]{box-shadow:var(--shadow2),0 0 0 calc(var(--strokeWidthThin) + 0.25px) var(--colorStrokeFocus2) inset,0 0 0 var(--strokeWidthThick) var(--colorNeutralForegroundOnBrand) inset;}}", "@supports (-moz-appearance:button){.feygou5[data-fui-focus-visible]:hover{box-shadow:var(--shadow2),0 0 0 calc(var(--strokeWidthThin) + 0.25px) var(--colorStrokeFocus2) inset;}}"]
}), jm = /*#__PURE__*/ F({
	small: {
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "fu97m5z",
		Bf4jedk: "f17fgpbq",
		B2u0y6b: "f1jt17bm"
	},
	medium: {
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f18ktai2",
		Bf4jedk: "fwbmr0d",
		B2u0y6b: "f44c6la"
	},
	large: {
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1hbd1aw",
		Bf4jedk: "f12clzc2",
		B2u0y6b: "fjy1crr"
	}
}, { d: [
	[".fu97m5z{padding:1px;}", { p: -1 }],
	".f17fgpbq{min-width:24px;}",
	".f1jt17bm{max-width:24px;}",
	[".f18ktai2{padding:5px;}", { p: -1 }],
	".fwbmr0d{min-width:32px;}",
	".f44c6la{max-width:32px;}",
	[".f1hbd1aw{padding:7px;}", { p: -1 }],
	".f12clzc2{min-width:40px;}",
	".fjy1crr{max-width:40px;}"
] }), Mm = /*#__PURE__*/ F({
	small: {
		Be2twd7: "fe5j1ua",
		Bqenvij: "fjamq6b",
		a9b677: "f64fuq3",
		Bqrlyyl: "fbaiahx"
	},
	medium: {},
	large: {
		Be2twd7: "f1rt2boy",
		Bqenvij: "frvgh55",
		a9b677: "fq4mcun",
		Bqrlyyl: "f1exjqw5"
	},
	before: { t21cq0: ["f1nizpg2", "f1a695kz"] },
	after: { Frg6f3: ["f1a695kz", "f1nizpg2"] }
}, { d: [
	".fe5j1ua{font-size:20px;}",
	".fjamq6b{height:20px;}",
	".f64fuq3{width:20px;}",
	".fbaiahx{--fui-Button__icon--spacing:var(--spacingHorizontalXS);}",
	".f1rt2boy{font-size:24px;}",
	".frvgh55{height:24px;}",
	".fq4mcun{width:24px;}",
	".f1exjqw5{--fui-Button__icon--spacing:var(--spacingHorizontalSNudge);}",
	".f1nizpg2{margin-right:var(--fui-Button__icon--spacing);}",
	".f1a695kz{margin-left:var(--fui-Button__icon--spacing);}"
] }), Nm = (e) => {
	let t = Em(), n = Dm(), r = Om(), i = km(), a = Am(), o = jm(), s = Mm(), { appearance: c, disabled: l, disabledFocusable: u, icon: d, iconOnly: f, iconPosition: p, shape: m, size: h } = e;
	return e.root.className = O(Tm.root, t, c && r[c], r[h], d && h === "small" && r.smallWithIcon, d && h === "large" && r.largeWithIcon, r[m], (l || u) && i.base, (l || u) && i.highContrast, c && (l || u) && i[c], c === "primary" && a.primary, a[h], a[m], f && o[h], e.root.className), e.icon && (e.icon.className = O(Tm.icon, n, !!e.root.children && s[p], s[h], e.icon.className)), e;
}, Pm = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Cm(e, t);
	return Nm(n), ii("useButtonStyles_unstable")(n), ym(n);
});
Pm.displayName = "Button";
//#endregion
//#region node_modules/@fluentui/react-field/lib/contexts/FieldContext.js
var Fm = N.createContext(void 0), Im = Fm.Provider, Lm = () => N.useContext(Fm), Rm = (e) => {
	let { generatedControlId: t, orientation: n, required: r, size: i, validationState: a } = e, o = e.label?.htmlFor, s = e.label?.id, c = e.validationMessage?.id, l = e.hint?.id;
	return { field: N.useMemo(() => ({
		generatedControlId: t,
		hintId: l,
		labelFor: o,
		labelId: s,
		orientation: n,
		required: r,
		size: i,
		validationMessageId: c,
		validationState: a
	}), [
		t,
		l,
		o,
		s,
		n,
		r,
		i,
		c,
		a
	]) };
};
//#endregion
//#region node_modules/@fluentui/react-field/lib/contexts/useFieldControlProps.js
function zm(e, t) {
	return Bm(Lm(), e, t);
}
function Bm(e, t, n) {
	if (!e) return t;
	t = { ...t };
	let { generatedControlId: r, hintId: i, labelFor: a, labelId: o, required: s, validationMessageId: c, validationState: l } = e;
	if (r) {
		var u;
		(u = t).id ?? (u.id = r);
	}
	if (o && (!n?.supportsLabelFor || a !== t.id)) {
		var d, f;
		(d = t)[f = "aria-labelledby"] ?? (d[f] = o);
	}
	if ((c || i) && (t["aria-describedby"] = [
		c,
		i,
		t?.["aria-describedby"]
	].filter(Boolean).join(" ")), l === "error") {
		var p, m;
		(p = t)[m = "aria-invalid"] ?? (p[m] = !0);
	}
	if (s) {
		if (n?.supportsRequired) {
			var h;
			(h = t).required ?? (h.required = !0);
		} else {
			var g, _;
			(g = t)[_ = "aria-required"] ?? (g[_] = !0);
		}
	}
	if (n?.supportsSize) {
		var v;
		(v = t).size ?? (v.size = e.size);
	}
	return t;
}
//#endregion
//#region node_modules/@fluentui/react-field/lib/components/Field/renderField.js
var Vm = (e, t) => {
	let { children: n } = e;
	return typeof n == "function" && (n = n(Bm(t.field) || {})), /*#__PURE__*/ L(Im, {
		value: t?.field,
		children: /*#__PURE__*/ ta(e.root, { children: [
			e.label && /*#__PURE__*/ L(e.label, {}),
			n,
			e.validationMessage && /*#__PURE__*/ ta(e.validationMessage, { children: [e.validationMessageIcon && /*#__PURE__*/ L(e.validationMessageIcon, {}), e.validationMessage.children] }),
			e.hint && /*#__PURE__*/ L(e.hint, {})
		] })
	});
}, Hm = (e, t) => {
	let { weight: n = "regular", size: r = "medium", ...i } = e;
	return {
		weight: n,
		size: r,
		...Um(i, t)
	};
}, Um = (e, t) => {
	let { disabled: n = !1, required: r = !1, ...i } = e;
	return {
		disabled: n,
		required: nr(r === !0 ? "*" : r || void 0, {
			defaultProps: { "aria-hidden": "true" },
			elementType: "span"
		}),
		components: {
			root: "label",
			required: "span"
		},
		root: tr(Ir("label", {
			ref: t,
			...i
		}), { elementType: "label" })
	};
}, Wm = (e) => /*#__PURE__*/ ta(e.root, { children: [e.root.children, e.required && /*#__PURE__*/ L(e.required, {})] }), Gm = {
	root: "fui-Label",
	required: "fui-Label__required"
}, Km = /*#__PURE__*/ F({
	root: {
		Bahqtrf: "fk6fouc",
		sj55zd: "f19n0e5"
	},
	disabled: {
		sj55zd: "f1s2aq7o",
		B7iucu3: "f1cyfu5x"
	},
	required: {
		sj55zd: "f1whyuy6",
		uwmqm3: ["fruq291", "f7x41pl"]
	},
	small: {
		Be2twd7: "fy9rknc",
		Bg96gwp: "fwrc4pm"
	},
	medium: {
		Be2twd7: "fkhj508",
		Bg96gwp: "f1i3iumi"
	},
	large: {
		Be2twd7: "fod5ikn",
		Bg96gwp: "faaz57k",
		Bhrd7zp: "fl43uef"
	},
	semibold: { Bhrd7zp: "fl43uef" }
}, {
	d: [
		".fk6fouc{font-family:var(--fontFamilyBase);}",
		".f19n0e5{color:var(--colorNeutralForeground1);}",
		".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
		".f1whyuy6{color:var(--colorPaletteRedForeground3);}",
		".fruq291{padding-left:var(--spacingHorizontalXS);}",
		".f7x41pl{padding-right:var(--spacingHorizontalXS);}",
		".fy9rknc{font-size:var(--fontSizeBase200);}",
		".fwrc4pm{line-height:var(--lineHeightBase200);}",
		".fkhj508{font-size:var(--fontSizeBase300);}",
		".f1i3iumi{line-height:var(--lineHeightBase300);}",
		".fod5ikn{font-size:var(--fontSizeBase400);}",
		".faaz57k{line-height:var(--lineHeightBase400);}",
		".fl43uef{font-weight:var(--fontWeightSemibold);}"
	],
	m: [["@media (forced-colors: active){.f1cyfu5x{color:GrayText;}}", { m: "(forced-colors: active)" }]]
}), qm = (e) => {
	let t = Km();
	return e.root.className = O(Gm.root, t.root, e.disabled && t.disabled, t[e.size], e.weight === "semibold" && t.semibold, e.root.className), e.required && (e.required.className = O(Gm.required, t.required, e.disabled && t.disabled, e.required.className)), e;
}, Jm = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Hm(e, t);
	return qm(n), ii("useLabelStyles_unstable")(n), Wm(n);
});
Jm.displayName = "Label";
//#endregion
//#region node_modules/@fluentui/react-field/lib/components/Field/useFieldBase.js
var Ym = (e, t) => {
	let { children: n, required: r = !1, validationState: i = e.validationMessage ? "error" : "none" } = e, a = wi("field-"), o = a + "__control", s = tr(Ir("div", {
		...e,
		ref: t
	}, ["children"]), { elementType: "div" }), c = nr(e.label, {
		defaultProps: {
			htmlFor: o,
			id: a + "__label",
			required: r
		},
		elementType: "label"
	}), l = nr(e.validationMessage, {
		defaultProps: {
			id: a + "__validationMessage",
			role: i === "error" || i === "warning" ? "alert" : void 0
		},
		elementType: "div"
	}), u = nr(e.hint, {
		defaultProps: { id: a + "__hint" },
		elementType: "div"
	});
	return {
		children: n,
		generatedControlId: o,
		required: r,
		validationState: i,
		components: {
			root: "div",
			label: "label",
			validationMessage: "div",
			validationMessageIcon: "span",
			hint: "div"
		},
		root: s,
		label: c,
		validationMessageIcon: nr(e.validationMessageIcon, {
			renderByDefault: !1,
			elementType: "span"
		}),
		validationMessage: l,
		hint: u
	};
}, Xm = {
	error: /*#__PURE__*/ N.createElement(fu, null),
	warning: /*#__PURE__*/ N.createElement(au, null),
	success: /*#__PURE__*/ N.createElement(du, null),
	none: void 0
}, Zm = (e, t) => {
	let { orientation: n = "vertical", size: r = "medium", ...i } = e, a = Ym(i, t), o = Xm[a.validationState];
	return {
		...a,
		components: {
			...a.components,
			label: Jm
		},
		label: nr(e.label, {
			defaultProps: {
				size: r,
				...a.label
			},
			elementType: Jm
		}),
		validationMessageIcon: nr(e.validationMessageIcon, {
			renderByDefault: !!o,
			defaultProps: { children: o },
			elementType: "span"
		}),
		orientation: n,
		size: r
	};
}, Qm = {
	root: "fui-Field",
	label: "fui-Field__label",
	validationMessage: "fui-Field__validationMessage",
	validationMessageIcon: "fui-Field__validationMessageIcon",
	hint: "fui-Field__hint"
}, $m = /*#__PURE__*/ F({
	base: { mc9l5x: "f13qh94s" },
	horizontal: {
		Budl1dq: "f2wwaib",
		wkccdc: "f1645dqt"
	},
	horizontalNoLabel: {
		uwmqm3: ["f15jqgz8", "fggqkej"],
		Budl1dq: "f1c2z91y"
	}
}, { d: [
	".f13qh94s{display:grid;}",
	".f2wwaib{grid-template-columns:33% 1fr;}",
	".f1645dqt{grid-template-rows:auto auto auto 1fr;}",
	".f15jqgz8{padding-left:33%;}",
	".fggqkej{padding-right:33%;}",
	".f1c2z91y{grid-template-columns:1fr;}"
] }), eh = /*#__PURE__*/ F({
	base: {
		B2u0y6b: "f6nezus",
		Bxyxcbc: "f1iqmcbn"
	},
	vertical: {
		z8tnut: "fclwglc",
		Byoj8tv: "fywfov9",
		jrapky: "fyacil5"
	},
	verticalLarge: {
		z8tnut: "f1sl3k7w",
		Byoj8tv: "f1brlhvm",
		jrapky: "f8l5zjj"
	},
	horizontal: {
		z8tnut: "fp2oml8",
		Byoj8tv: "f1tdddsa",
		t21cq0: ["fkujibs", "f199hnxi"],
		Ijaq50: "f16hsg94",
		nk6f5a: "f1nzqi2z"
	},
	horizontalSmall: {
		z8tnut: "f1ywm7hm",
		Byoj8tv: "f14wxoun"
	},
	horizontalLarge: {
		z8tnut: "f1hqyr95",
		Byoj8tv: "fm4hlj0"
	}
}, { d: [
	".f6nezus{max-width:max-content;}",
	".f1iqmcbn{max-height:max-content;}",
	".fclwglc{padding-top:var(--spacingVerticalXXS);}",
	".fywfov9{padding-bottom:var(--spacingVerticalXXS);}",
	".fyacil5{margin-bottom:var(--spacingVerticalXXS);}",
	".f1sl3k7w{padding-top:1px;}",
	".f1brlhvm{padding-bottom:1px;}",
	".f8l5zjj{margin-bottom:var(--spacingVerticalXS);}",
	".fp2oml8{padding-top:var(--spacingVerticalSNudge);}",
	".f1tdddsa{padding-bottom:var(--spacingVerticalSNudge);}",
	".fkujibs{margin-right:var(--spacingHorizontalM);}",
	".f199hnxi{margin-left:var(--spacingHorizontalM);}",
	".f16hsg94{grid-row-start:1;}",
	".f1nzqi2z{grid-row-end:-1;}",
	".f1ywm7hm{padding-top:var(--spacingVerticalXS);}",
	".f14wxoun{padding-bottom:var(--spacingVerticalXS);}",
	".f1hqyr95{padding-top:9px;}",
	".fm4hlj0{padding-bottom:9px;}"
] }), th = /*#__PURE__*/ Jn("r5c4z9l", null, [".r5c4z9l{margin-top:var(--spacingVerticalXXS);color:var(--colorNeutralForeground3);font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase200);}"]), nh = /*#__PURE__*/ F({
	error: { sj55zd: "f1hcrxcs" },
	withIcon: { uwmqm3: ["frawy03", "fg4c52"] }
}, { d: [
	".f1hcrxcs{color:var(--colorPaletteRedForeground1);}",
	".frawy03{padding-left:calc(12px + var(--spacingHorizontalXS));}",
	".fg4c52{padding-right:calc(12px + var(--spacingHorizontalXS));}"
] }), rh = /*#__PURE__*/ Jn("ra7h1uk", "r1rh6bd7", [".ra7h1uk{display:inline-block;font-size:12px;margin-left:calc(-12px - var(--spacingHorizontalXS));margin-right:var(--spacingHorizontalXS);line-height:0;vertical-align:-1px;}", ".r1rh6bd7{display:inline-block;font-size:12px;margin-right:calc(-12px - var(--spacingHorizontalXS));margin-left:var(--spacingHorizontalXS);line-height:0;vertical-align:-1px;}"]), ih = /*#__PURE__*/ F({
	error: { sj55zd: "f1hcrxcs" },
	warning: { sj55zd: "f1k5f75o" },
	success: { sj55zd: "ffmvakt" }
}, { d: [
	".f1hcrxcs{color:var(--colorPaletteRedForeground1);}",
	".f1k5f75o{color:var(--colorPaletteDarkOrangeForeground1);}",
	".ffmvakt{color:var(--colorPaletteGreenForeground1);}"
] }), ah = (e) => {
	let { validationState: t, size: n } = e, r = e.orientation === "horizontal", i = $m();
	e.root.className = O(Qm.root, i.base, r && i.horizontal, r && !e.label && i.horizontalNoLabel, e.root.className);
	let a = eh();
	e.label && (e.label.className = O(Qm.label, a.base, r && a.horizontal, r && n === "small" && a.horizontalSmall, r && n === "large" && a.horizontalLarge, !r && a.vertical, !r && n === "large" && a.verticalLarge, e.label.className));
	let o = rh(), s = ih();
	e.validationMessageIcon && (e.validationMessageIcon.className = O(Qm.validationMessageIcon, o, t !== "none" && s[t], e.validationMessageIcon.className));
	let c = th(), l = nh();
	return e.validationMessage && (e.validationMessage.className = O(Qm.validationMessage, c, t === "error" && l.error, !!e.validationMessageIcon && l.withIcon, e.validationMessage.className)), e.hint && (e.hint.className = O(Qm.hint, c, e.hint.className)), e;
}, oh = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Zm(e, t);
	return ah(n), ii("useFieldStyles_unstable")(n), Vm(n, Rm(n));
});
oh.displayName = "Field";
//#endregion
//#region node_modules/@fluentui/react-divider/lib/components/Divider/renderDivider.js
var sh = (e) => /*#__PURE__*/ L(e.root, { children: e.root.children !== void 0 && /*#__PURE__*/ L(e.wrapper, { children: e.root.children }) }), ch = (e, t) => {
	let { alignContent: n = "center", appearance: r = "default", inset: i = !1, ...a } = e;
	return {
		alignContent: n,
		appearance: r,
		inset: i,
		...lh(a, t)
	};
}, lh = (e, t) => {
	let { vertical: n = !1, wrapper: r, ...i } = e, a = wi("divider-");
	return {
		vertical: n,
		components: {
			root: "div",
			wrapper: "div"
		},
		root: tr({
			role: "separator",
			"aria-orientation": n ? "vertical" : "horizontal",
			"aria-labelledby": e.children ? a : void 0,
			ref: t,
			...i
		}, { elementType: "div" }),
		wrapper: tr(r, {
			defaultProps: {
				id: a,
				children: e.children
			},
			elementType: "div"
		})
	};
}, uh = {
	root: "fui-Divider",
	wrapper: "fui-Divider__wrapper"
}, dh = /*#__PURE__*/ F({
	base: {
		Bt984gj: "f122n59",
		B7ck84d: "f1ewtqcl",
		mc9l5x: "f22iagw",
		Beiy3e4: "f1063pyq",
		Bh6795r: "fqerorx",
		qhf8xq: "f10pi13n",
		Bahqtrf: "fk6fouc",
		Be2twd7: "fy9rknc",
		Bhrd7zp: "figsok6",
		Bg96gwp: "fwrc4pm",
		fsow6f: "f17mccla",
		Bcvre1j: "fyl8oag",
		Br0sdwz: "f16vkdww",
		Bn78ew0: "fhsnbul",
		li1rpt: "f1gw3sf2",
		ap17g6: "f1ly5f7u",
		B771hl4: "f1s3tz6t"
	},
	childless: {
		susq4k: "f1kyqvp9",
		Bicfajf: ["fzynn9s", "f1z0ukd1"],
		jwcpgy: ["fekrn8e", "ftdg338"],
		B4rk6o: "fesgyo"
	},
	start: { Bsft5z2: "f13zj6fq" },
	center: {
		Ftih45: "f1wl9k8s",
		Bsft5z2: "f13zj6fq"
	},
	end: { Ftih45: "f1wl9k8s" },
	brand: {
		sj55zd: "f16muhyy",
		Bq4z7u6: "fcbuu2a",
		Bk5zm6e: ["f1wdw2dr", "f1ttio3w"],
		Bqjgrrk: "f1582fpk",
		Bm6vgfq: ["f1ttio3w", "f1wdw2dr"],
		B0n5ga8: "f1ahrvm8",
		s924m2: ["f1cd3wbc", "f17hbk9y"],
		B1q35kw: "fvrapl0",
		Gp14am: ["f17hbk9y", "f1cd3wbc"]
	},
	default: {
		sj55zd: "fkfq4zb",
		Bq4z7u6: "f1vccso1",
		Bk5zm6e: ["f1geml7w", "fjml6kk"],
		Bqjgrrk: "f1r7kh1m",
		Bm6vgfq: ["fjml6kk", "f1geml7w"],
		B0n5ga8: "f16j7guv",
		s924m2: ["fx01ahm", "fj1a37q"],
		B1q35kw: "fl8d8yv",
		Gp14am: ["fj1a37q", "fx01ahm"]
	},
	subtle: {
		sj55zd: "f11d4kpn",
		Bq4z7u6: "f5g06un",
		Bk5zm6e: ["f13sxdku", "f1n015lb"],
		Bqjgrrk: "f1x6bl8t",
		Bm6vgfq: ["f1n015lb", "f13sxdku"],
		B0n5ga8: "fvod1wy",
		s924m2: ["fwslg65", "flk0e17"],
		B1q35kw: "f103fvts",
		Gp14am: ["flk0e17", "fwslg65"]
	},
	strong: {
		sj55zd: "f19n0e5",
		Bq4z7u6: "f10tv6oz",
		Bk5zm6e: ["f16xp3sf", "f1seuxxq"],
		Bqjgrrk: "fwrmqbx",
		Bm6vgfq: ["f1seuxxq", "f16xp3sf"],
		B0n5ga8: "ft83z1f",
		s924m2: ["f1g4150c", "f192dr6e"],
		B1q35kw: "f1qnawh6",
		Gp14am: ["f192dr6e", "f1g4150c"]
	}
}, { d: /* @__PURE__ */ ".f122n59{align-items:center;},.f1ewtqcl{box-sizing:border-box;},.f22iagw{display:flex;},.f1063pyq{flex-direction:row;},.fqerorx{flex-grow:1;},.f10pi13n{position:relative;},.fk6fouc{font-family:var(--fontFamilyBase);},.fy9rknc{font-size:var(--fontSizeBase200);},.figsok6{font-weight:var(--fontWeightRegular);},.fwrc4pm{line-height:var(--lineHeightBase200);},.f17mccla{text-align:center;},.fyl8oag::before{box-sizing:border-box;},.f16vkdww::before{display:flex;},.fhsnbul::before{flex-grow:1;},.f1gw3sf2::after{box-sizing:border-box;},.f1ly5f7u::after{display:flex;},.f1s3tz6t::after{flex-grow:1;},.f1kyqvp9::before{margin-bottom:0;},.fzynn9s::before{margin-right:0;},.f1z0ukd1::before{margin-left:0;},.fekrn8e::after{margin-left:0;},.ftdg338::after{margin-right:0;},.fesgyo::after{margin-top:0;},.f13zj6fq::after{content:\"\";},.f1wl9k8s::before{content:\"\";},.f16muhyy{color:var(--colorBrandForeground1);},.fcbuu2a::before{border-top-color:var(--colorBrandStroke1);},.f1wdw2dr::before{border-right-color:var(--colorBrandStroke1);},.f1ttio3w::before{border-left-color:var(--colorBrandStroke1);},.f1582fpk::before{border-bottom-color:var(--colorBrandStroke1);},.f1ahrvm8::after{border-top-color:var(--colorBrandStroke1);},.f1cd3wbc::after{border-right-color:var(--colorBrandStroke1);},.f17hbk9y::after{border-left-color:var(--colorBrandStroke1);},.fvrapl0::after{border-bottom-color:var(--colorBrandStroke1);},.fkfq4zb{color:var(--colorNeutralForeground2);},.f1vccso1::before{border-top-color:var(--colorNeutralStroke2);},.f1geml7w::before{border-right-color:var(--colorNeutralStroke2);},.fjml6kk::before{border-left-color:var(--colorNeutralStroke2);},.f1r7kh1m::before{border-bottom-color:var(--colorNeutralStroke2);},.f16j7guv::after{border-top-color:var(--colorNeutralStroke2);},.fx01ahm::after{border-right-color:var(--colorNeutralStroke2);},.fj1a37q::after{border-left-color:var(--colorNeutralStroke2);},.fl8d8yv::after{border-bottom-color:var(--colorNeutralStroke2);},.f11d4kpn{color:var(--colorNeutralForeground3);},.f5g06un::before{border-top-color:var(--colorNeutralStroke3);},.f13sxdku::before{border-right-color:var(--colorNeutralStroke3);},.f1n015lb::before{border-left-color:var(--colorNeutralStroke3);},.f1x6bl8t::before{border-bottom-color:var(--colorNeutralStroke3);},.fvod1wy::after{border-top-color:var(--colorNeutralStroke3);},.fwslg65::after{border-right-color:var(--colorNeutralStroke3);},.flk0e17::after{border-left-color:var(--colorNeutralStroke3);},.f103fvts::after{border-bottom-color:var(--colorNeutralStroke3);},.f19n0e5{color:var(--colorNeutralForeground1);},.f10tv6oz::before{border-top-color:var(--colorNeutralStroke1);},.f16xp3sf::before{border-right-color:var(--colorNeutralStroke1);},.f1seuxxq::before{border-left-color:var(--colorNeutralStroke1);},.fwrmqbx::before{border-bottom-color:var(--colorNeutralStroke1);},.ft83z1f::after{border-top-color:var(--colorNeutralStroke1);},.f1g4150c::after{border-right-color:var(--colorNeutralStroke1);},.f192dr6e::after{border-left-color:var(--colorNeutralStroke1);},.f1qnawh6::after{border-bottom-color:var(--colorNeutralStroke1);}".split(",") }), fh = /*#__PURE__*/ F({
	base: {
		a9b677: "fly5x3f",
		Bdkvgpv: "f163fonl",
		B0qfbqy: "f51yk4v",
		pbipgd: "f13rof3u",
		Bm2nyyq: "f8rth92",
		xrcqlc: "f6czdpx",
		i5u598: "f1iyka9k"
	},
	inset: {
		uwmqm3: ["fjlbh76", "f11qrl6u"],
		z189sj: ["f11qrl6u", "fjlbh76"]
	},
	start: {
		fsow6f: ["f1o700av", "fes3tcz"],
		Ftih45: "f1wl9k8s",
		Bicfajf: ["f1ojjlep", "fk1kexq"],
		Bxwl2t9: "f1he2m4d",
		jwcpgy: ["f12w1bnb", "f1558wlj"]
	},
	center: {
		fsow6f: "f17mccla",
		Bicfajf: ["f1ojjlep", "fk1kexq"],
		jwcpgy: ["f12w1bnb", "f1558wlj"]
	},
	end: {
		fsow6f: ["fes3tcz", "f1o700av"],
		Bicfajf: ["f1ojjlep", "fk1kexq"],
		Bsft5z2: "f13zj6fq",
		jwcpgy: ["f12w1bnb", "f1558wlj"],
		Iy66sp: "f1ayce8x"
	}
}, { d: [
	".fly5x3f{width:100%;}",
	".f163fonl::before{border-top-style:solid;}",
	".f51yk4v::before{border-top-width:var(--strokeWidthThin);}",
	".f13rof3u::before{min-width:8px;}",
	".f8rth92::after{border-top-style:solid;}",
	".f6czdpx::after{border-top-width:var(--strokeWidthThin);}",
	".f1iyka9k::after{min-width:8px;}",
	".fjlbh76{padding-left:12px;}",
	".f11qrl6u{padding-right:12px;}",
	".f1o700av{text-align:left;}",
	".fes3tcz{text-align:right;}",
	".f1wl9k8s::before{content:\"\";}",
	".f1ojjlep::before{margin-right:12px;}",
	".fk1kexq::before{margin-left:12px;}",
	".f1he2m4d::before{max-width:8px;}",
	".f12w1bnb::after{margin-left:12px;}",
	".f1558wlj::after{margin-right:12px;}",
	".f17mccla{text-align:center;}",
	".f13zj6fq::after{content:\"\";}",
	".f1ayce8x::after{max-width:8px;}"
] }), ph = /*#__PURE__*/ F({
	base: {
		Beiy3e4: "f1vx9l62",
		sshi5w: "f16gbxbe",
		m598lv: ["f1yq6w5o", "f1jpmc5p"],
		B4f6apu: ["f9sc749", "f1x8pvcy"],
		zkzzav: "fhkwbjy",
		Barhvk9: ["flthirb", "ftkbnf5"],
		Ihftqj: ["f13hvwk3", "f1en4csx"],
		Bde111x: "f19onpk6"
	},
	inset: {
		B6of3ja: "f1xdg43u",
		jrapky: "f1jlhsmd"
	},
	withChildren: { sshi5w: "f1tjaq3g" },
	start: {
		Ftih45: "f1wl9k8s",
		susq4k: "fg2pwug",
		Bbdr6tz: "fkjtzyi",
		B4rk6o: "f8vk40g"
	},
	center: {
		susq4k: "fg2pwug",
		B4rk6o: "f8vk40g"
	},
	end: {
		susq4k: "fg2pwug",
		Bsft5z2: "f13zj6fq",
		B4rk6o: "f8vk40g",
		gn64ia: "fqg5mu5"
	}
}, { d: [
	".f1vx9l62{flex-direction:column;}",
	".f16gbxbe{min-height:20px;}",
	".f1yq6w5o::before{border-right-style:solid;}",
	".f1jpmc5p::before{border-left-style:solid;}",
	".f9sc749::before{border-right-width:var(--strokeWidthThin);}",
	".f1x8pvcy::before{border-left-width:var(--strokeWidthThin);}",
	".fhkwbjy::before{min-height:8px;}",
	".flthirb::after{border-right-style:solid;}",
	".ftkbnf5::after{border-left-style:solid;}",
	".f13hvwk3::after{border-right-width:var(--strokeWidthThin);}",
	".f1en4csx::after{border-left-width:var(--strokeWidthThin);}",
	".f19onpk6::after{min-height:8px;}",
	".f1xdg43u{margin-top:12px;}",
	".f1jlhsmd{margin-bottom:12px;}",
	".f1tjaq3g{min-height:84px;}",
	".f1wl9k8s::before{content:\"\";}",
	".fg2pwug::before{margin-bottom:12px;}",
	".fkjtzyi::before{max-height:8px;}",
	".f8vk40g::after{margin-top:12px;}",
	".f13zj6fq::after{content:\"\";}",
	".fqg5mu5::after{max-height:8px;}"
] }), mh = (e) => {
	let t = dh(), n = fh(), r = ph(), { alignContent: i, appearance: a, inset: o, vertical: s } = e;
	return e.root.className = O(uh.root, t.base, t[i], a && t[a], !s && n.base, !s && o && n.inset, !s && n[i], s && r.base, s && o && r.inset, s && r[i], s && e.root.children !== void 0 && r.withChildren, e.root.children === void 0 && t.childless, e.root.className), e.wrapper && (e.wrapper.className = O(uh.wrapper, e.wrapper.className)), e;
}, hh = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = ch(e, t);
	return mh(n), ii("useDividerStyles_unstable")(n), sh(n);
});
hh.displayName = "Divider";
//#endregion
//#region node_modules/@fluentui/react-input/lib/components/Input/useInput.js
var gh = (e, t) => {
	let n = ei(), r = Lm(), { size: i = r?.size ?? "medium", appearance: a = n.inputDefaultAppearance ?? "outline", ...o } = e;
	return {
		size: i,
		appearance: a,
		..._h(o, t)
	};
}, _h = (e, t) => {
	let n = zm(e, {
		supportsLabelFor: !0,
		supportsRequired: !0
	}), [r, i] = di({
		state: n.value,
		defaultState: n.defaultValue,
		initialState: ""
	}), a = Fr({
		props: n,
		primarySlotTagName: "input",
		excludedPropNames: [
			"onChange",
			"value",
			"defaultValue"
		]
	}), o = {
		components: {
			root: "span",
			input: "input",
			contentBefore: "span",
			contentAfter: "span"
		},
		input: tr(n.input, {
			defaultProps: {
				type: "text",
				ref: t,
				...a.primary
			},
			elementType: "input"
		}),
		contentAfter: nr(n.contentAfter, { elementType: "span" }),
		contentBefore: nr(n.contentBefore, { elementType: "span" }),
		root: tr(n.root, {
			defaultProps: a.root,
			elementType: "span"
		})
	};
	return o.input.value = r, o.input.onChange = I((e) => {
		var t;
		let r = e.target.value;
		(t = n.onChange) == null || t.call(n, e, { value: r }), i(r);
	}), o;
}, vh = (e) => /*#__PURE__*/ ta(e.root, { children: [
	e.contentBefore && /*#__PURE__*/ L(e.contentBefore, {}),
	/*#__PURE__*/ L(e.input, {}),
	e.contentAfter && /*#__PURE__*/ L(e.contentAfter, {})
] }), yh = {
	root: "fui-Input",
	input: "fui-Input__input",
	contentBefore: "fui-Input__contentBefore",
	contentAfter: "fui-Input__contentAfter"
};
G.spacingHorizontalSNudge, G.spacingHorizontalMNudge, G.spacingHorizontalM, G.spacingHorizontalXXS, G.spacingHorizontalXXS, G.spacingHorizontalSNudge, G.spacingHorizontalS, G.spacingHorizontalM, `${G.spacingHorizontalM}${G.spacingHorizontalSNudge}`;
var bh = /*#__PURE__*/ Jn("r1oeeo9n", "r9sxh5", {
	r: [
		".r1oeeo9n{display:inline-flex;align-items:center;flex-wrap:nowrap;gap:var(--spacingHorizontalXXS);border-radius:var(--borderRadiusMedium);position:relative;box-sizing:border-box;vertical-align:middle;min-height:32px;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase300);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);background-color:var(--colorNeutralBackground1);border:1px solid var(--colorNeutralStroke1);border-bottom-color:var(--colorNeutralStrokeAccessible);}",
		".r1oeeo9n::after{box-sizing:border-box;content:\"\";position:absolute;left:-1px;bottom:-1px;right:-1px;height:max(2px, var(--borderRadiusMedium));border-bottom-left-radius:var(--borderRadiusMedium);border-bottom-right-radius:var(--borderRadiusMedium);border-bottom:2px solid var(--colorCompoundBrandStroke);clip-path:inset(calc(100% - 2px) 0 0 0);transform:scaleX(0);transition-property:transform;transition-duration:var(--durationUltraFast);transition-delay:var(--curveAccelerateMid);}",
		".r1oeeo9n:focus-within::after{transform:scaleX(1);transition-property:transform;transition-duration:var(--durationNormal);transition-delay:var(--curveDecelerateMid);}",
		".r1oeeo9n:focus-within:active::after{border-bottom-color:var(--colorCompoundBrandStrokePressed);}",
		".r1oeeo9n:focus-within{outline:2px solid transparent;}",
		".r9sxh5{display:inline-flex;align-items:center;flex-wrap:nowrap;gap:var(--spacingHorizontalXXS);border-radius:var(--borderRadiusMedium);position:relative;box-sizing:border-box;vertical-align:middle;min-height:32px;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase300);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);background-color:var(--colorNeutralBackground1);border:1px solid var(--colorNeutralStroke1);border-bottom-color:var(--colorNeutralStrokeAccessible);}",
		".r9sxh5::after{box-sizing:border-box;content:\"\";position:absolute;right:-1px;bottom:-1px;left:-1px;height:max(2px, var(--borderRadiusMedium));border-bottom-right-radius:var(--borderRadiusMedium);border-bottom-left-radius:var(--borderRadiusMedium);border-bottom:2px solid var(--colorCompoundBrandStroke);clip-path:inset(calc(100% - 2px) 0 0 0);transform:scaleX(0);transition-property:transform;transition-duration:var(--durationUltraFast);transition-delay:var(--curveAccelerateMid);}",
		".r9sxh5:focus-within::after{transform:scaleX(1);transition-property:transform;transition-duration:var(--durationNormal);transition-delay:var(--curveDecelerateMid);}",
		".r9sxh5:focus-within:active::after{border-bottom-color:var(--colorCompoundBrandStrokePressed);}",
		".r9sxh5:focus-within{outline:2px solid transparent;}"
	],
	s: [
		"@media screen and (prefers-reduced-motion: reduce){.r1oeeo9n::after{transition-duration:0.01ms;transition-delay:0.01ms;}}",
		"@media screen and (prefers-reduced-motion: reduce){.r1oeeo9n:focus-within::after{transition-duration:0.01ms;transition-delay:0.01ms;}}",
		"@media screen and (prefers-reduced-motion: reduce){.r9sxh5::after{transition-duration:0.01ms;transition-delay:0.01ms;}}",
		"@media screen and (prefers-reduced-motion: reduce){.r9sxh5:focus-within::after{transition-duration:0.01ms;transition-delay:0.01ms;}}"
	]
}), xh = /*#__PURE__*/ F({
	small: {
		sshi5w: "f1pha7fy",
		Bahqtrf: "fk6fouc",
		Be2twd7: "fy9rknc",
		Bhrd7zp: "figsok6",
		Bg96gwp: "fwrc4pm"
	},
	medium: {},
	large: {
		sshi5w: "f1w5jphr",
		Bahqtrf: "fk6fouc",
		Be2twd7: "fod5ikn",
		Bhrd7zp: "figsok6",
		Bg96gwp: "faaz57k",
		i8kkvl: 0,
		Belr9w4: 0,
		rmohyg: "f1eyhf9v"
	},
	outline: {},
	outlineInteractive: {
		Bgoe8wy: "fvcxoqz",
		Bwzppfd: ["f1ub3y4t", "f1m52nbi"],
		oetu4i: "f1l4zc64",
		gg5e9n: ["f1m52nbi", "f1ub3y4t"],
		Drbcw7: "f8vnjqi",
		udz0bu: ["fz1etlk", "f1hc16gm"],
		Be8ivqh: "f1klwx88",
		ofdepl: ["f1hc16gm", "fz1etlk"]
	},
	underline: {
		De3pzq: "f1c21dwh",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "fokr779",
		icvyot: "f1ern45e",
		vrafjx: ["f1n71otn", "f1deefiw"],
		wvpqe5: ["f1deefiw", "f1n71otn"],
		Eqx8gd: ["f1n6gb5g", "f15yvnhg"],
		B1piin3: ["f15yvnhg", "f1n6gb5g"]
	},
	underlineInteractive: {
		oetu4i: "f1l4zc64",
		Be8ivqh: "f1klwx88",
		d9w3h3: 0,
		B3778ie: 0,
		B4j8arr: 0,
		Bl18szs: 0,
		Blrzh8d: "f2ale1x"
	},
	filled: {
		g2u3we: "fghlq4f",
		h3c5rm: ["f1gn591s", "fjscplz"],
		B9xav0g: "fb073pr",
		zhjwy3: ["fjscplz", "f1gn591s"]
	},
	filledInteractive: {
		q7v0qe: "ftmjh5b",
		kmh5ft: ["f17blpuu", "fsrcdbj"],
		nagaa4: "f1tpwn32",
		B1yhkcb: ["fsrcdbj", "f17blpuu"]
	},
	invalid: {
		tvckwq: "fs4k3qj",
		gk2u95: ["fcee079", "fmyw78r"],
		hhx65j: "f1fgmyf4",
		Bxowmz0: ["fmyw78r", "fcee079"]
	},
	"filled-darker": { De3pzq: "f16xq7d1" },
	"filled-lighter": { De3pzq: "fxugw4r" },
	"filled-darker-shadow": {
		De3pzq: "f16xq7d1",
		E5pizo: "fyed02w"
	},
	"filled-lighter-shadow": {
		De3pzq: "fxugw4r",
		E5pizo: "fyed02w"
	},
	disabled: {
		Bceei9c: "fdrzuqr",
		De3pzq: "f1c21dwh",
		g2u3we: "f1jj8ep1",
		h3c5rm: ["f15xbau", "fy0fskl"],
		B9xav0g: "f4ikngz",
		zhjwy3: ["fy0fskl", "f15xbau"],
		Bcq6wej: "f9dbb4x",
		Jcjdmf: ["f3qs60o", "f5u9ap2"],
		sc4o1m: "fwd1oij",
		Bosien3: ["f5u9ap2", "f3qs60o"],
		Bsft5z2: "fhr9occ",
		Bduesf4: "f99w1ws"
	},
	smallWithContentBefore: { uwmqm3: ["fk8j09s", "fdw0yi8"] },
	smallWithContentAfter: { z189sj: ["fdw0yi8", "fk8j09s"] },
	mediumWithContentBefore: { uwmqm3: ["f1ng84yb", "f11gcy0p"] },
	mediumWithContentAfter: { z189sj: ["f11gcy0p", "f1ng84yb"] },
	largeWithContentBefore: { uwmqm3: ["f1uw59to", "fw5db7e"] },
	largeWithContentAfter: { z189sj: ["fw5db7e", "f1uw59to"] }
}, {
	d: [
		".f1pha7fy{min-height:24px;}",
		".fk6fouc{font-family:var(--fontFamilyBase);}",
		".fy9rknc{font-size:var(--fontSizeBase200);}",
		".figsok6{font-weight:var(--fontWeightRegular);}",
		".fwrc4pm{line-height:var(--lineHeightBase200);}",
		".f1w5jphr{min-height:40px;}",
		".fod5ikn{font-size:var(--fontSizeBase400);}",
		".faaz57k{line-height:var(--lineHeightBase400);}",
		[".f1eyhf9v{gap:var(--spacingHorizontalSNudge);}", { p: -1 }],
		".f1c21dwh{background-color:var(--colorTransparentBackground);}",
		[".fokr779{border-radius:0;}", { p: -1 }],
		".f1ern45e{border-top-style:none;}",
		".f1n71otn{border-right-style:none;}",
		".f1deefiw{border-left-style:none;}",
		".f1n6gb5g::after{left:0;}",
		".f15yvnhg::after{right:0;}",
		[".f2ale1x::after{border-radius:0;}", { p: -1 }],
		".fghlq4f{border-top-color:var(--colorTransparentStroke);}",
		".f1gn591s{border-right-color:var(--colorTransparentStroke);}",
		".fjscplz{border-left-color:var(--colorTransparentStroke);}",
		".fb073pr{border-bottom-color:var(--colorTransparentStroke);}",
		".fs4k3qj:not(:focus-within),.fs4k3qj:hover:not(:focus-within){border-top-color:var(--colorPaletteRedBorder2);}",
		".fcee079:not(:focus-within),.fcee079:hover:not(:focus-within){border-right-color:var(--colorPaletteRedBorder2);}",
		".fmyw78r:not(:focus-within),.fmyw78r:hover:not(:focus-within){border-left-color:var(--colorPaletteRedBorder2);}",
		".f1fgmyf4:not(:focus-within),.f1fgmyf4:hover:not(:focus-within){border-bottom-color:var(--colorPaletteRedBorder2);}",
		".f16xq7d1{background-color:var(--colorNeutralBackground3);}",
		".fxugw4r{background-color:var(--colorNeutralBackground1);}",
		".fyed02w{box-shadow:var(--shadow2);}",
		".fdrzuqr{cursor:not-allowed;}",
		".f1jj8ep1{border-top-color:var(--colorNeutralStrokeDisabled);}",
		".f15xbau{border-right-color:var(--colorNeutralStrokeDisabled);}",
		".fy0fskl{border-left-color:var(--colorNeutralStrokeDisabled);}",
		".f4ikngz{border-bottom-color:var(--colorNeutralStrokeDisabled);}",
		".fhr9occ::after{content:unset;}",
		".fk8j09s{padding-left:var(--spacingHorizontalSNudge);}",
		".fdw0yi8{padding-right:var(--spacingHorizontalSNudge);}",
		".f1ng84yb{padding-left:var(--spacingHorizontalMNudge);}",
		".f11gcy0p{padding-right:var(--spacingHorizontalMNudge);}",
		".f1uw59to{padding-left:var(--spacingHorizontalM);}",
		".fw5db7e{padding-right:var(--spacingHorizontalM);}"
	],
	h: [
		".fvcxoqz:hover{border-top-color:var(--colorNeutralStroke1Hover);}",
		".f1ub3y4t:hover{border-right-color:var(--colorNeutralStroke1Hover);}",
		".f1m52nbi:hover{border-left-color:var(--colorNeutralStroke1Hover);}",
		".f1l4zc64:hover{border-bottom-color:var(--colorNeutralStrokeAccessibleHover);}",
		".ftmjh5b:hover,.ftmjh5b:focus-within{border-top-color:var(--colorTransparentStrokeInteractive);}",
		".f17blpuu:hover,.f17blpuu:focus-within{border-right-color:var(--colorTransparentStrokeInteractive);}",
		".fsrcdbj:hover,.fsrcdbj:focus-within{border-left-color:var(--colorTransparentStrokeInteractive);}",
		".f1tpwn32:hover,.f1tpwn32:focus-within{border-bottom-color:var(--colorTransparentStrokeInteractive);}"
	],
	a: [
		".f8vnjqi:active,.f8vnjqi:focus-within{border-top-color:var(--colorNeutralStroke1Pressed);}",
		".fz1etlk:active,.fz1etlk:focus-within{border-right-color:var(--colorNeutralStroke1Pressed);}",
		".f1hc16gm:active,.f1hc16gm:focus-within{border-left-color:var(--colorNeutralStroke1Pressed);}",
		".f1klwx88:active,.f1klwx88:focus-within{border-bottom-color:var(--colorNeutralStrokeAccessiblePressed);}"
	],
	m: [
		["@media (forced-colors: active){.f9dbb4x{border-top-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f3qs60o{border-right-color:GrayText;}.f5u9ap2{border-left-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fwd1oij{border-bottom-color:GrayText;}}", { m: "(forced-colors: active)" }]
	],
	w: [".f99w1ws:focus-within{outline-style:none;}"]
}), Sh = /*#__PURE__*/ Jn("r12stul0", null, [
	".r12stul0{align-self:stretch;box-sizing:border-box;flex-grow:1;min-width:0;border-style:none;padding:0 var(--spacingHorizontalM);color:var(--colorNeutralForeground1);background-color:transparent;outline-style:none;font-family:inherit;font-size:inherit;font-weight:inherit;line-height:inherit;}",
	".r12stul0::-webkit-input-placeholder{color:var(--colorNeutralForeground4);opacity:1;}",
	".r12stul0::-moz-placeholder{color:var(--colorNeutralForeground4);opacity:1;}",
	".r12stul0::placeholder{color:var(--colorNeutralForeground4);opacity:1;}"
]), Ch = /*#__PURE__*/ F({
	small: {
		uwmqm3: ["f1f5gg8d", "f1vdfbxk"],
		z189sj: ["f1vdfbxk", "f1f5gg8d"]
	},
	medium: {},
	large: {
		uwmqm3: ["fnphzt9", "flt1dlf"],
		z189sj: ["flt1dlf", "fnphzt9"]
	},
	smallWithContentBefore: { uwmqm3: ["fgiv446", "ffczdla"] },
	smallWithContentAfter: { z189sj: ["ffczdla", "fgiv446"] },
	mediumWithContentBefore: { uwmqm3: ["fgiv446", "ffczdla"] },
	mediumWithContentAfter: { z189sj: ["ffczdla", "fgiv446"] },
	largeWithContentBefore: { uwmqm3: ["fk8j09s", "fdw0yi8"] },
	largeWithContentAfter: { z189sj: ["fdw0yi8", "fk8j09s"] },
	disabled: {
		sj55zd: "f1s2aq7o",
		De3pzq: "f1c21dwh",
		Bceei9c: "fdrzuqr",
		yvdlaj: "fahhnxm"
	}
}, { d: [
	".f1f5gg8d{padding-left:var(--spacingHorizontalS);}",
	".f1vdfbxk{padding-right:var(--spacingHorizontalS);}",
	".fnphzt9{padding-left:calc(var(--spacingHorizontalM) + var(--spacingHorizontalSNudge));}",
	".flt1dlf{padding-right:calc(var(--spacingHorizontalM) + var(--spacingHorizontalSNudge));}",
	".fgiv446{padding-left:var(--spacingHorizontalXXS);}",
	".ffczdla{padding-right:var(--spacingHorizontalXXS);}",
	".fk8j09s{padding-left:var(--spacingHorizontalSNudge);}",
	".fdw0yi8{padding-right:var(--spacingHorizontalSNudge);}",
	".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
	".f1c21dwh{background-color:var(--colorTransparentBackground);}",
	".fdrzuqr{cursor:not-allowed;}",
	".fahhnxm::-webkit-input-placeholder{color:var(--colorNeutralForegroundDisabled);}",
	".fahhnxm::-moz-placeholder{color:var(--colorNeutralForegroundDisabled);}"
] }), wh = /*#__PURE__*/ Jn("r1572tok", null, [".r1572tok{box-sizing:border-box;color:var(--colorNeutralForeground3);display:flex;}", ".r1572tok>svg{font-size:20px;}"]), Th = /*#__PURE__*/ F({
	disabled: { sj55zd: "f1s2aq7o" },
	small: { Duoase: "f3qv9w" },
	medium: {},
	large: { Duoase: "f16u2scb" }
}, { d: [
	".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
	".f3qv9w>svg{font-size:16px;}",
	".f16u2scb>svg{font-size:24px;}"
] }), Eh = (e) => {
	let { size: t, appearance: n } = e, r = e.input.disabled, i = `${e.input["aria-invalid"]}` == "true", a = n.startsWith("filled"), o = xh(), s = Ch(), c = Th();
	e.root.className = O(yh.root, bh(), o[t], e.contentBefore && o[`${t}WithContentBefore`], e.contentAfter && o[`${t}WithContentAfter`], o[n], !r && n === "outline" && o.outlineInteractive, !r && n === "underline" && o.underlineInteractive, !r && a && o.filledInteractive, a && o.filled, !r && i && o.invalid, r && o.disabled, e.root.className), e.input.className = O(yh.input, Sh(), s[t], e.contentBefore && s[`${t}WithContentBefore`], e.contentAfter && s[`${t}WithContentAfter`], r && s.disabled, e.input.className);
	let l = [
		wh(),
		r && c.disabled,
		c[t]
	];
	return e.contentBefore && (e.contentBefore.className = O(yh.contentBefore, ...l, e.contentBefore.className)), e.contentAfter && (e.contentAfter.className = O(yh.contentAfter, ...l, e.contentAfter.className)), e;
}, Dh = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = gh(e, t);
	return Eh(n), ii("useInputStyles_unstable")(n), vh(n);
});
Dh.displayName = "Input";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/contexts/menuContext.js
var Oh = jl(void 0), kh = {
	open: !1,
	setOpen: () => !1,
	checkedValues: {},
	onCheckedValueChange: () => null,
	isSubmenu: !1,
	triggerRef: { current: null },
	menuPopoverRef: { current: null },
	mountNode: null,
	triggerId: "",
	openOnContext: !1,
	openOnHover: !1,
	hasIcons: !1,
	hasCheckmarks: !1,
	inline: !1,
	persistOnItemClick: !1
}, Ah = Oh.Provider, $ = (e) => Ml(Oh, (t = kh) => e(t)), jh = N.createContext(void 0), Mh = !1, Nh = jh.Provider, Ph = () => N.useContext(jh) ?? Mh, Fh = jl(void 0), Ih = {
	checkedValues: {},
	setFocusByFirstCharacter: () => null,
	toggleCheckbox: () => null,
	selectRadio: () => null,
	hasIcons: !1,
	hasCheckmarks: !1
}, Lh = Fh.Provider, Rh = (e) => Ml(Fh, (t = Ih) => e(t)), zh = "fuimenuenter", Bh = (e) => {
	let { refs: t, callback: n, element: r, disabled: i } = e, a = I((e) => {
		let r = t[0], a = e.target;
		!qi(r.current ?? null, a) && !i && n(e);
	});
	N.useEffect(() => {
		if (r != null) return i || r.addEventListener(zh, a), () => {
			r.removeEventListener(zh, a);
		};
	}, [
		a,
		r,
		i
	]);
}, Vh = (e, t) => {
	e.dispatchEvent(new CustomEvent(zh, {
		bubbles: !0,
		detail: { nativeEvent: t }
	}));
};
//#endregion
//#region node_modules/@fluentui/react-menu/lib/utils/useIsSubmenu.js
function Hh() {
	let e = $((e) => e.isSubmenu), t = Nl(Fh);
	return e || t;
}
//#endregion
//#region node_modules/@fluentui/react-menu/lib/utils/useValidateNesting.js
var Uh = (e) => {
	let { targetDocument: t } = Zr();
	return $((e) => e.triggerRef), $((e) => e.inline), N.useRef(null);
}, Wh = "fuimenusafezonetimeout", Gh = (e) => {
	let t = N.useRef(null);
	return N.useCallback((n) => {
		var r;
		(r = t.current) == null || r.removeEventListener("fuimenusafezonetimeout", e), n?.addEventListener("fuimenusafezonetimeout", e), t.current = n;
	}, [e]);
}, Kh = /*#__PURE__*/ F({
	root: {
		a9b677: "fjw5fx7",
		Bqenvij: "fd461yt",
		Bcdw1i0: "fd7fpy0",
		Bnnss6s: "fi64zpg"
	},
	rootChecked: {
		Bcdw1i0: "f1022m68",
		Bnnss6s: "fi64zpg"
	}
}, { d: [
	".fjw5fx7{width:16px;}",
	".fd461yt{height:16px;}",
	".fd7fpy0{visibility:hidden;}",
	".fi64zpg{flex-shrink:0;}",
	".f1022m68{visibility:visible;}"
] }), qh = (e) => {
	let t = Kh();
	e.checkmark && (e.checkmark.className = O(t.root, e.checked && t.rootChecked, e.checkmark.className));
}, Jh = {
	root: "fui-MenuItem",
	icon: "fui-MenuItem__icon",
	checkmark: "fui-MenuItem__checkmark",
	submenuIndicator: "fui-MenuItem__submenuIndicator",
	content: "fui-MenuItem__content",
	secondaryContent: "fui-MenuItem__secondaryContent",
	subText: "fui-MenuItem__subText"
}, Yh = /*#__PURE__*/ Jn("rfoezjv", "r8lt3v0", {
	r: [
		".rfoezjv{border-radius:var(--borderRadiusMedium);position:relative;color:var(--colorNeutralForeground2);background-color:var(--colorNeutralBackground1);padding-right:var(--spacingVerticalSNudge);padding-left:var(--spacingVerticalSNudge);padding-top:var(--spacingVerticalSNudge);padding-bottom:var(--spacingVerticalSNudge);box-sizing:border-box;max-width:290px;min-height:32px;flex-shrink:0;display:flex;align-items:start;font-size:var(--fontSizeBase300);cursor:pointer;gap:4px;-webkit-user-select:none;-moz-user-select:none;user-select:none;}",
		".rfoezjv:hover{background-color:var(--colorNeutralBackground1Hover);color:var(--colorNeutralForeground2Hover);}",
		".rfoezjv:hover .fui-Icon-filled{display:inline;}",
		".rfoezjv:hover .fui-Icon-regular{display:none;}",
		".rfoezjv:hover .fui-MenuItem__icon{color:var(--colorNeutralForeground2BrandSelected);}",
		".rfoezjv:hover .fui-MenuItem__subText{color:var(--colorNeutralForeground3Hover);}",
		".rfoezjv:hover:active{background-color:var(--colorNeutralBackground1Pressed);color:var(--colorNeutralForeground2Pressed);}",
		".rfoezjv:hover:active .fui-MenuItem__subText{color:var(--colorNeutralForeground3Pressed);}",
		".rfoezjv:focus{outline-style:none;}",
		".rfoezjv:focus-visible{outline-style:none;}",
		".rfoezjv[data-fui-focus-visible]{border-top-color:transparent;border-right-color:transparent;border-bottom-color:transparent;border-left-color:transparent;}",
		".rfoezjv[data-fui-focus-visible]::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid var(--colorStrokeFocus2);border-radius:var(--borderRadiusMedium);top:calc(2px * -1);right:calc(2px * -1);bottom:calc(2px * -1);left:calc(2px * -1);}",
		".r8lt3v0{border-radius:var(--borderRadiusMedium);position:relative;color:var(--colorNeutralForeground2);background-color:var(--colorNeutralBackground1);padding-left:var(--spacingVerticalSNudge);padding-right:var(--spacingVerticalSNudge);padding-top:var(--spacingVerticalSNudge);padding-bottom:var(--spacingVerticalSNudge);box-sizing:border-box;max-width:290px;min-height:32px;flex-shrink:0;display:flex;align-items:start;font-size:var(--fontSizeBase300);cursor:pointer;gap:4px;-webkit-user-select:none;-moz-user-select:none;user-select:none;}",
		".r8lt3v0:hover{background-color:var(--colorNeutralBackground1Hover);color:var(--colorNeutralForeground2Hover);}",
		".r8lt3v0:hover .fui-Icon-filled{display:inline;}",
		".r8lt3v0:hover .fui-Icon-regular{display:none;}",
		".r8lt3v0:hover .fui-MenuItem__icon{color:var(--colorNeutralForeground2BrandSelected);}",
		".r8lt3v0:hover .fui-MenuItem__subText{color:var(--colorNeutralForeground3Hover);}",
		".r8lt3v0:hover:active{background-color:var(--colorNeutralBackground1Pressed);color:var(--colorNeutralForeground2Pressed);}",
		".r8lt3v0:hover:active .fui-MenuItem__subText{color:var(--colorNeutralForeground3Pressed);}",
		".r8lt3v0:focus{outline-style:none;}",
		".r8lt3v0:focus-visible{outline-style:none;}",
		".r8lt3v0[data-fui-focus-visible]{border-top-color:transparent;border-left-color:transparent;border-bottom-color:transparent;border-right-color:transparent;}",
		".r8lt3v0[data-fui-focus-visible]::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid var(--colorStrokeFocus2);border-radius:var(--borderRadiusMedium);top:calc(2px * -1);left:calc(2px * -1);bottom:calc(2px * -1);right:calc(2px * -1);}"
	],
	s: [
		"@media (forced-colors: active){.rfoezjv:hover{background-color:Canvas;border-color:Highlight;color:Highlight;}.rfoezjv:focus{outline-style:none;}.rfoezjv:focus-visible{outline-style:none;}.rfoezjv[data-fui-focus-visible]{border-top-color:transparent;border-right-color:transparent;border-bottom-color:transparent;border-left-color:transparent;}@media (forced-colors: active){.rfoezjv[data-fui-focus-visible]::after{border-top-color:Highlight;border-right-color:Highlight;border-bottom-color:Highlight;border-left-color:Highlight;}}.rfoezjv[data-fui-focus-visible]::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid Highlight;border-radius:var(--borderRadiusMedium);top:calc(2px * -1);right:calc(2px * -1);bottom:calc(2px * -1);left:calc(2px * -1);}}",
		"@media (forced-colors: active){.rfoezjv[data-fui-focus-visible]::after{border-top-color:Highlight;border-right-color:Highlight;border-bottom-color:Highlight;border-left-color:Highlight;}}",
		"@media (forced-colors: active){.r8lt3v0:hover{background-color:Canvas;border-color:Highlight;color:Highlight;}.r8lt3v0:focus{outline-style:none;}.r8lt3v0:focus-visible{outline-style:none;}.r8lt3v0[data-fui-focus-visible]{border-top-color:transparent;border-left-color:transparent;border-bottom-color:transparent;border-right-color:transparent;}@media (forced-colors: active){.r8lt3v0[data-fui-focus-visible]::after{border-top-color:Highlight;border-left-color:Highlight;border-bottom-color:Highlight;border-right-color:Highlight;}}.r8lt3v0[data-fui-focus-visible]::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid Highlight;border-radius:var(--borderRadiusMedium);top:calc(2px * -1);left:calc(2px * -1);bottom:calc(2px * -1);right:calc(2px * -1);}}",
		"@media (forced-colors: active){.r8lt3v0[data-fui-focus-visible]::after{border-top-color:Highlight;border-left-color:Highlight;border-bottom-color:Highlight;border-right-color:Highlight;}}"
	]
}), Xh = /*#__PURE__*/ Jn("r1ls86vo", "rpbc5dr", [".r1ls86vo{padding-left:2px;padding-right:2px;background-color:transparent;flex-grow:1;}", ".rpbc5dr{padding-right:2px;padding-left:2px;background-color:transparent;flex-grow:1;}"]), Zh = /*#__PURE__*/ Jn("r12mwwux", "r1ewgu5j", [
	".r12mwwux{padding-left:2px;padding-right:2px;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);color:var(--colorNeutralForeground3);}",
	".r12mwwux:hover{color:var(--colorNeutralForeground3Hover);}",
	".r12mwwux:focus{color:var(--colorNeutralForeground3Hover);}",
	".r1ewgu5j{padding-right:2px;padding-left:2px;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);color:var(--colorNeutralForeground3);}",
	".r1ewgu5j:hover{color:var(--colorNeutralForeground3Hover);}",
	".r1ewgu5j:focus{color:var(--colorNeutralForeground3Hover);}"
]), Qh = /*#__PURE__*/ Jn("ro9koqv", null, [".ro9koqv{width:20px;height:20px;font-size:20px;line-height:0;align-items:center;display:inline-flex;justify-content:center;flex-shrink:0;}"]), $h = /*#__PURE__*/ Jn("r9c34qo", null, [".r9c34qo{width:20px;height:20px;font-size:20px;line-height:0;align-items:center;display:inline-flex;justify-content:center;}"]), eg = /*#__PURE__*/ Jn("rk2ppru", null, [".rk2ppru{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase100);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase100);color:var(--colorNeutralForeground3);}"]), tg = /*#__PURE__*/ F({
	checkmark: { B6of3ja: "fmnzpld" },
	splitItemMain: { Bh6795r: "fqerorx" },
	splitItemTrigger: {
		Btl43ni: ["f1ozlkrg", "f10ostut"],
		Beyfa6y: ["f1deotkl", "f1krrbdw"],
		uwmqm3: ["f1cnd47f", "fhxju0i"],
		Ftih45: "f1wl9k8s",
		Ccq8qp: "f1yn80uh",
		Baz25je: "f68mna0",
		cmx5o7: "f1p5zmk"
	},
	submenuOpen: {
		De3pzq: "f5gciec",
		sj55zd: "fmh2wxz",
		D0sxk3: "fxoiby5",
		t6yez3: "f15q0o9g",
		B3y4be1: "f17gqod3",
		B2i6fwv: "f15ms52v",
		By8wz76: "fix5gee",
		B7iucu3: "f1gokeew"
	},
	disabled: {
		sj55zd: "f1s2aq7o",
		Bi91k9c: "fvgxktp",
		Jwef8y: "f1ijtazh",
		eoavqd: "fphbwmw",
		Bk3fhr4: "f19vpps7",
		Bmfj8id: "fv5swzo",
		Bg7n49j: "f1q1x1ba",
		c7f7en: "ff3wrqt",
		B2d53fq: "fcvwxyo",
		iro3zm: "f1to34ca",
		Bumww26: "fszh5vc",
		t0hwav: "ft33916",
		B7iucu3: "f1cyfu5x",
		Bahaeuw: "fa9u7a5",
		Bbkh6qg: "f1wzezsb",
		B3ejlan: "f1egomlm",
		B41git9: "f1wf2001",
		Boq1n10: "fied5gk",
		Dcq74g: "f1efp33f",
		rxnm8d: "f1m2zpi7",
		wxluhh: "fei14nx",
		idgcvv: "f12hmwa5",
		j9xr24: "f1hzwxd0"
	}
}, {
	d: [
		".fmnzpld{margin-top:2px;}",
		".fqerorx{flex-grow:1;}",
		".f1ozlkrg{border-top-left-radius:0;}",
		".f10ostut{border-top-right-radius:0;}",
		".f1deotkl{border-bottom-left-radius:0;}",
		".f1krrbdw{border-bottom-right-radius:0;}",
		".f1cnd47f{padding-left:0;}",
		".fhxju0i{padding-right:0;}",
		".f1wl9k8s::before{content:\"\";}",
		".f1yn80uh::before{width:var(--strokeWidthThin);}",
		".f68mna0::before{height:24px;}",
		".f1p5zmk::before{background-color:var(--colorNeutralStroke1);}",
		".f5gciec{background-color:var(--colorNeutralBackground1Hover);}",
		".fmh2wxz{color:var(--colorNeutralForeground2Hover);}",
		".fxoiby5 .fui-Icon-filled{display:inline;}",
		".f15q0o9g .fui-Icon-regular{display:none;}",
		".f17gqod3 .fui-MenuItem__icon{color:var(--colorNeutralForeground2BrandSelected);}",
		".f15ms52v .fui-MenuItem__subText{color:var(--colorNeutralForeground3Hover);}",
		".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}"
	],
	m: [
		["@media (forced-colors: active){.fix5gee{background-color:Canvas;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1gokeew{color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1cyfu5x{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fa9u7a5:hover{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1wzezsb:hover{background-color:Canvas;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1egomlm:hover .fui-MenuItem__icon{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1wf2001:hover .fui-MenuItem__icon{background-color:Canvas;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fied5gk:hover .fui-MenuItem__subText{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1efp33f:hover:active{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1m2zpi7:hover:active{background-color:Canvas;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fei14nx:hover:active .fui-MenuItem__subText{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f12hmwa5:focus{color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1hzwxd0:focus{background-color:Canvas;}}", { m: "(forced-colors: active)" }]
	],
	h: [
		".fvgxktp:hover{color:var(--colorNeutralForegroundDisabled);}",
		".f1ijtazh:hover{background-color:var(--colorNeutralBackground1);}",
		".fphbwmw:hover{cursor:not-allowed;}",
		".f19vpps7:hover .fui-Icon-filled{display:none;}",
		".fv5swzo:hover .fui-Icon-regular{display:inline;}",
		".f1q1x1ba:hover .fui-MenuItem__icon{color:var(--colorNeutralForegroundDisabled);}",
		".ff3wrqt:hover .fui-MenuItem__subText{color:var(--colorNeutralForegroundDisabled);}",
		".fcvwxyo:hover:active{color:var(--colorNeutralForegroundDisabled);}",
		".f1to34ca:hover:active{background-color:var(--colorNeutralBackground1);}",
		".fszh5vc:hover:active .fui-MenuItem__subText{color:var(--colorNeutralForegroundDisabled);}"
	],
	f: [".ft33916:focus{color:var(--colorNeutralForegroundDisabled);}"]
}), ng = /*#__PURE__*/ F({ disabled: {
	sj55zd: "f1s2aq7o",
	B7iucu3: "f1cyfu5x"
} }, {
	d: [".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}"],
	m: [["@media (forced-colors: active){.f1cyfu5x{color:GrayText;}}", { m: "(forced-colors: active)" }]]
}), rg = /*#__PURE__*/ F({
	content: {
		mc9l5x: "f22iagw",
		Beiy3e4: "f1vx9l62"
	},
	secondaryContent: { qb2dma: "f7nlbp4" },
	submenuIndicator: { qb2dma: "f7nlbp4" }
}, { d: [
	".f22iagw{display:flex;}",
	".f1vx9l62{flex-direction:column;}",
	".f7nlbp4{align-self:center;}"
] }), ig = (e) => {
	let t = tg(), n = Yh(), r = Xh(), i = Zh(), a = Qh(), o = $h(), s = rg(), c = eg(), l = ng(), u = !!e.subText;
	return e.root.className = O(Jh.root, n, e.submenuOpen && t.submenuOpen, e.disabled && t.disabled, e.root.className), e.content && (e.content.className = O(Jh.content, r, e.content.className, u && s.content)), e.checkmark && (e.checkmark.className = O(Jh.checkmark, t.checkmark, e.checkmark.className)), e.secondaryContent && (e.secondaryContent.className = O(Jh.secondaryContent, i, e.disabled && t.disabled, e.secondaryContent.className, u && s.secondaryContent)), e.icon && (e.icon.className = O(Jh.icon, a, e.icon.className)), e.submenuIndicator && (e.submenuIndicator.className = O(Jh.submenuIndicator, o, e.submenuIndicator.className, u && s.submenuIndicator)), e.subText && (e.subText.className = O(Jh.subText, e.disabled && l.disabled, e.subText.className, c)), qh(e), e;
}, ag = vu.durationSlower, og = vu.curveDecelerateMid, sg = Ru(({ distance: e = 10 }) => ({
	enter: [Wu({
		duration: ag,
		easing: og,
		direction: "enter"
	}), {
		...Gu({
			duration: ag,
			easing: og,
			direction: "enter",
			outX: `calc(var(${Qu}, 0px) * ${e})`,
			outY: `calc(var(${q}, 0px) * ${e})`
		}),
		composite: "accumulate"
	}],
	exit: []
})), cg = [
	"after",
	"after-bottom",
	"before-top",
	"before",
	"before-bottom",
	"above"
], lg = (e) => {
	let { surfaceMotion: t, ...n } = e, r = ug(n);
	return {
		...r,
		components: { surfaceMotion: sg },
		surfaceMotion: Uu(t, {
			elementType: sg,
			defaultProps: {
				visible: r.open,
				appear: !0,
				unmountOnExit: !0
			}
		})
	};
}, ug = (e) => {
	let t = Hh(), { hoverDelay: n = 500, inline: r = !1, hasCheckmarks: i = !1, hasIcons: a = !1, closeOnScroll: o = !1, openOnContext: s = !1, persistOnItemClick: c = !1, openOnHover: l = t, defaultCheckedValues: u, mountNode: d = null, safeZone: f } = e, { targetDocument: p } = Zr(), m = wi("menu"), [h, g] = Pp(), _ = dp(e.positioning), v = J({
		targetDocument: p,
		onPositioningEnd: _.onPositioningEnd
	}), y = {
		position: t ? "after" : "below",
		align: t ? "top" : "start",
		target: e.openOnContext ? h : void 0,
		fallbackPositions: t ? cg : void 0,
		..._,
		onPositioningEnd: v
	}, b = N.Children.toArray(e.children), x, S;
	b.length === 2 ? (x = b[0], S = b[1]) : b.length === 1 && (S = b[0]);
	let { targetRef: C, containerRef: w } = Np(y), T = f && l, E = N.useRef({
		isInside: !1,
		mouseCoordinates: {
			x: 0,
			y: 0
		}
	}), D = Zp({
		disabled: !T,
		timeout: typeof f == "object" ? f.timeout : 300,
		onSafeZoneEnter: (e) => {
			re(e, {
				open: !0,
				keyboard: !1,
				type: "menuSafeZoneMouseEnter",
				event: e
			}), E.current.isInside = !0;
		},
		onSafeZoneLeave: () => {
			E.current.isInside = !1;
		},
		onSafeZoneMove: (e) => {
			E.current.mouseCoordinates = {
				x: e.clientX,
				y: e.clientY
			};
		},
		onSafeZoneTimeout: () => {
			let e = new CustomEvent(Wh);
			re(e, {
				open: !1,
				keyboard: !1,
				type: "menuSafeZoneTimeout",
				event: e
			}), E.current.isInside && p && p.elementsFromPoint(E.current.mouseCoordinates.x, E.current.mouseCoordinates.y).find((e) => e.classList.contains(Jh.root))?.dispatchEvent(e);
		}
	}), ee = Ti(C, D.targetRef), te = Ti(w, D.containerRef), [ne, re] = fg({
		hoverDelay: n,
		isSubmenu: t,
		setContextTarget: g,
		closeOnScroll: o,
		menuPopoverRef: te,
		triggerRef: ee,
		open: e.open,
		defaultOpen: e.defaultOpen,
		onOpenChange: e.onOpenChange,
		openOnContext: s
	}), [ie, O] = dg({
		checkedValues: e.checkedValues,
		defaultCheckedValues: u,
		onCheckedValueChange: e.onCheckedValueChange
	});
	return {
		inline: r,
		hoverDelay: n,
		triggerId: m,
		isSubmenu: t,
		openOnHover: l,
		contextTarget: h,
		setContextTarget: g,
		hasCheckmarks: i,
		hasIcons: a,
		closeOnScroll: o,
		menuTrigger: x,
		menuPopover: S,
		mountNode: d,
		triggerRef: ee,
		menuPopoverRef: te,
		openOnContext: s,
		open: ne,
		setOpen: re,
		checkedValues: ie,
		onCheckedValueChange: O,
		persistOnItemClick: c,
		safeZone: D.elementToRender
	};
}, dg = (e) => {
	let [t, n] = di({
		state: e.checkedValues,
		defaultState: e.defaultCheckedValues,
		initialState: {}
	});
	return [t, I((t, { name: r, checkedItems: i }) => {
		var a;
		(a = e.onCheckedValueChange) == null || a.call(e, t, {
			name: r,
			checkedItems: i
		}), n((e) => ({
			...e,
			[r]: i
		}));
	})];
}, fg = (e) => {
	let { targetDocument: t } = Zr(), n = $((e) => e.setOpen), r = I((t, n) => e.onOpenChange?.call(e, t, n)), i = N.useRef(!1), [a, o] = di({
		state: e.open,
		defaultState: e.defaultOpen,
		initialState: !1
	}), s = I((t, i) => {
		let a = t instanceof CustomEvent && t.type === "fuimenuenter" ? t.detail.nativeEvent : t;
		r?.(a, { ...i }), i.open && t.type === "contextmenu" && e.setContextTarget(t), i.open || e.setContextTarget(void 0), i.bubble && n(t, { ...i }), o(i.open);
	}), [c, l] = Pi(), u = I((t, n) => {
		l(), !(t instanceof Event) && t.persist && t.persist(), !n.ignoreHoverDelay && (t.type === "mouseleave" || t.type === "mouseover" || t.type === "mousemove" || t.type === "fuimenuenter") ? (e.triggerRef.current?.contains(t.target) && (i.current = t.type === "mouseover" || t.type === "mousemove"), c(() => s(t, n), e.hoverDelay)) : s(t, n);
	});
	Di({
		contains: qi,
		disabled: !a,
		element: t,
		refs: [e.menuPopoverRef, !e.openOnContext && e.triggerRef].filter(Boolean),
		callback: (e) => u(e, {
			open: !1,
			type: "clickOutside",
			event: e
		})
	});
	let d = e.openOnContext || e.closeOnScroll;
	ji({
		contains: qi,
		element: t,
		callback: (e) => u(e, {
			open: !1,
			type: "scrollOutside",
			event: e
		}),
		refs: [e.menuPopoverRef, !e.openOnContext && e.triggerRef].filter(Boolean),
		disabled: !a || !d
	}), Bh({
		element: t,
		callback: (e) => {
			i.current || u(e, {
				open: !1,
				type: "menuMouseEnter",
				event: e
			});
		},
		disabled: !a,
		refs: [e.menuPopoverRef]
	});
	let { findFirstFocusable: f } = hs(), p = N.useCallback(() => {
		f(e.menuPopoverRef.current)?.focus();
	}, [f, e.menuPopoverRef]), m = bi();
	return N.useEffect(() => {
		if (a) p();
		else if (!m && (t?.activeElement === t?.body || e.menuPopoverRef.current?.contains(t?.activeElement ?? null))) {
			var n;
			(n = e.triggerRef.current) == null || n.focus();
		}
	}, [
		e.triggerRef,
		e.isSubmenu,
		a,
		p,
		t,
		e.menuPopoverRef
	]), [a, u];
};
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/Menu/useMenuContextValues.js
function pg(e) {
	let { checkedValues: t, hasCheckmarks: n, hasIcons: r, inline: i, isSubmenu: a, menuPopoverRef: o, mountNode: s, onCheckedValueChange: c, open: l, openOnContext: u, openOnHover: d, persistOnItemClick: f, safeZone: p, setOpen: m, triggerId: h, triggerRef: g } = e;
	return { menu: N.useMemo(() => ({
		checkedValues: t,
		hasCheckmarks: n,
		hasIcons: r,
		inline: i,
		isSubmenu: a,
		menuPopoverRef: o,
		mountNode: s,
		onCheckedValueChange: c,
		open: l,
		openOnContext: u,
		openOnHover: d,
		persistOnItemClick: f,
		safeZone: p,
		setOpen: m,
		triggerId: h,
		triggerRef: g
	}), [
		t,
		n,
		r,
		i,
		a,
		o,
		s,
		c,
		l,
		u,
		d,
		f,
		p,
		m,
		h,
		g
	]) };
}
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/Menu/renderMenu.js
var mg = (e, t) => /*#__PURE__*/ ta(Ah, {
	value: t.menu,
	children: [e.menuTrigger, e.menuPopover && /*#__PURE__*/ L(e.surfaceMotion, { children: /*#__PURE__*/ L(Vu, { children: e.menuPopover }) })]
}), hg = (e) => {
	let t = lg(e);
	return mg(t, pg(t));
};
hg.displayName = "Menu";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuItem/useCharacterSearch.js
var gg = (e, t) => {
	let n = Rh((e) => e.setFocusByFirstCharacter), { onKeyDown: r } = e.root;
	return e.root.onKeyDown = (e) => {
		r?.(e), !(e.key?.length > 1) && t.current && n?.(e, t.current);
	}, e;
}, _g = N.createContext(void 0), vg = { setMultiline: () => null };
_g.Provider;
var yg = () => N.useContext(_g) ?? vg, bg = () => yg() !== vg, xg = (e, t) => {
	let n = Ph(), r = $((e) => e.persistOnItemClick), { as: i = "div", disabled: a = !1, hasSubmenu: o = n, persistOnClick: s = r, content: c, ...l } = e, { hasIcons: u, hasCheckmarks: d } = Cg({ hasSubmenu: o }), f = $((e) => e.setOpen), p = $((e) => e.open);
	Sg({
		multiline: !!e.subText,
		hasSubmenu: o
	});
	let m = N.useRef(null), h = N.useRef(!1), g = Uh(wg(e.role)), _ = {
		hasSubmenu: o,
		submenuOpen: o && p,
		disabled: a,
		persistOnClick: s,
		components: {
			root: "div",
			icon: "span",
			checkmark: "span",
			submenuIndicator: "span",
			content: "span",
			secondaryContent: "span",
			subText: "span"
		},
		root: tr(Ir(i, Il(i, {
			role: "menuitem",
			...l,
			disabled: !1,
			disabledFocusable: a,
			ref: Ti(t, m, g),
			onKeyDown: I((t) => {
				var n;
				(n = e.onKeyDown) == null || n.call(e, t), !t.isDefaultPrevented() && (t.key === " " || t.key === "Enter") && (h.current = !0);
			}),
			onMouseMove: I((t) => {
				var n;
				if (t.currentTarget.ownerDocument.activeElement !== t.currentTarget) {
					var r;
					(r = m.current) == null || r.focus();
				}
				(n = e.onMouseMove) == null || n.call(e, t);
			}),
			onClick: I((t) => {
				var n;
				!o && !s && (f(t, {
					open: !1,
					keyboard: h.current,
					bubble: !0,
					type: "menuItemClick",
					event: t
				}), h.current = !1), (n = e.onClick) == null || n.call(e, t);
			})
		})), { elementType: "div" }),
		icon: nr(e.icon, {
			renderByDefault: u,
			elementType: "span"
		}),
		checkmark: nr(e.checkmark, {
			renderByDefault: d,
			elementType: "span"
		}),
		submenuIndicator: nr(e.submenuIndicator, {
			renderByDefault: o,
			elementType: "span"
		}),
		content: nr(e.content, {
			renderByDefault: !!e.children,
			defaultProps: { children: e.children },
			elementType: "span"
		}),
		secondaryContent: nr(e.secondaryContent, { elementType: "span" }),
		subText: nr(e.subText, { elementType: "span" })
	};
	return gg(_, m), _;
}, Sg = (e) => {
	let { hasSubmenu: t, multiline: n } = e, r = bg() && t, { setMultiline: i } = yg();
	yi(() => {
		r || i(n);
	}, [
		i,
		n,
		r
	]);
}, Cg = (e) => {
	let { hasSubmenu: t } = e, n = Rh((e) => e.hasIcons), r = Rh((e) => e.hasCheckmarks), i = bg() && t;
	return {
		hasIcons: n && !i,
		hasCheckmarks: r && !i
	};
}, wg = (e) => {
	switch (e) {
		case "menuitemcheckbox": return "MenuItemCheckbox";
		case "menuitemradio": return "MenuItemRadio";
	}
	return "MenuItem";
}, Tg = hu(nu, ru), Eg = hu(eu, tu), Dg = (e, t) => {
	let { dir: n } = Zr(), r = xg(e, t);
	if (r.submenuIndicator) {
		var i;
		(i = r.submenuIndicator).children ?? (i.children = n === "rtl" ? /*#__PURE__*/ N.createElement(Eg, null) : /*#__PURE__*/ N.createElement(Tg, null));
	}
	return r;
}, Og = (e) => /*#__PURE__*/ ta(e.root, { children: [
	e.checkmark && /*#__PURE__*/ L(e.checkmark, {}),
	e.icon && /*#__PURE__*/ L(e.icon, {}),
	e.content && /*#__PURE__*/ ta(e.content, { children: [e.content.children, e.subText && /*#__PURE__*/ L(e.subText, {})] }),
	e.secondaryContent && /*#__PURE__*/ L(e.secondaryContent, {}),
	e.submenuIndicator && /*#__PURE__*/ L(e.submenuIndicator, {})
] }), kg = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Dg(e, t);
	return ig(n), ii("useMenuItemStyles_unstable")(n), Og(n);
});
kg.displayName = "MenuItem";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuList/useMenuList.js
var Ag = [
	"menuitem",
	"menuitemcheckbox",
	"menuitemradio"
], jg = Ag.map((e) => `[role="${e}"]`).join(","), Mg = (e, t) => {
	let n = Fg(), r = Nl(Oh);
	Ig(e, n, r) && console.warn("You are using both MenuList and Menu props, we recommend you to use Menu props when available");
	let i = N.useRef(null), { findAllFocusable: a } = hs(), { targetDocument: o } = Zr(), s = ps({ circular: !0 }), c = Ng(e, t), l = Ti(c.root.ref, i);
	N.useEffect(() => {
		let e = i.current;
		if (!r || !o || !e) return;
		let t = (t) => {
			let n = t.detail.next;
			n && e.contains(o.activeElement) && !e.contains(n) && t.preventDefault();
		};
		return o.addEventListener(Pa, t), () => {
			o.removeEventListener(Pa, t);
		};
	}, [r, o]);
	let u = N.useCallback((e, t) => {
		i.current && Pg(a(i.current, (e) => e.hasAttribute("role") && Ag.indexOf(e.getAttribute("role")) !== -1), e.key, t);
	}, [a]);
	return {
		...c,
		root: {
			...s,
			...c.root,
			ref: l
		},
		setFocusByFirstCharacter: u
	};
}, Ng = (e, t) => {
	let n = $((e) => e.triggerId), r = $((e) => e.checkedValues), i = $((e) => e.onCheckedValueChange), a = $((e) => e.hasIcons), o = $((e) => e.hasCheckmarks), s = Nl(Oh), c = N.useRef(null), l = Uh("MenuList"), u = N.useCallback((e, t) => {
		c.current && Pg(Array.from(c.current.querySelectorAll(jg)), e.key, t);
	}, []), [d, f] = di({
		state: e.checkedValues ?? (s ? r : void 0),
		defaultState: e.defaultCheckedValues,
		initialState: {}
	}), p = e.onCheckedValueChange ?? (s ? i : void 0), m = I((e, t, n, r) => {
		let i = [...d?.[t] || []];
		r ? i.splice(i.indexOf(n), 1) : i.push(n), p?.(e, {
			name: t,
			checkedItems: i
		}), f((e) => ({
			...e,
			[t]: i
		}));
	}), h = I((e, t, n) => {
		let r = [n];
		f((e) => ({
			...e,
			[t]: r
		})), p?.(e, {
			name: t,
			checkedItems: r
		});
	});
	return {
		components: { root: "div" },
		root: tr(Ir("div", {
			ref: Ti(t, c, l),
			role: "menu",
			"aria-labelledby": n,
			...e
		}), { elementType: "div" }),
		checkedValues: d,
		hasIcons: e.hasIcons ?? a ?? !1,
		hasCheckmarks: e.hasCheckmarks ?? o ?? !1,
		hasMenuContext: s,
		setFocusByFirstCharacter: u,
		selectRadio: h,
		toggleCheckbox: m
	};
}, Pg = (e, t, n) => {
	let r = e.indexOf(n) + 1;
	r === e.length && (r = 0);
	let i = e.map((e) => e.textContent?.charAt(0).toLowerCase()), a = t.toLowerCase(), o = (e) => {
		for (let t = e; t < i.length; t++) if (a === i[t]) return t;
		return -1;
	}, s = o(r);
	s === -1 && (s = o(0)), s > -1 && e[s].focus();
}, Fg = () => ({
	checkedValues: $((e) => e.checkedValues),
	onCheckedValueChange: $((e) => e.onCheckedValueChange),
	triggerId: $((e) => e.triggerId),
	hasIcons: $((e) => e.hasIcons),
	hasCheckmarks: $((e) => e.hasCheckmarks)
}), Ig = (e, t, n) => {
	let r = !1;
	for (let n in t) e[n] && (r = !0);
	return n && r;
}, Lg = (e, t) => /*#__PURE__*/ L(Lh, {
	value: t.menuList,
	children: /*#__PURE__*/ L(e.root, {})
});
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuList/useMenuListContextValues.js
function Rg(e) {
	let { checkedValues: t, hasCheckmarks: n, hasIcons: r, selectRadio: i, setFocusByFirstCharacter: a, toggleCheckbox: o } = e;
	return { menuList: N.useMemo(() => ({
		checkedValues: t,
		hasCheckmarks: n,
		hasIcons: r,
		selectRadio: i,
		setFocusByFirstCharacter: a,
		toggleCheckbox: o
	}), [
		t,
		n,
		r,
		i,
		a,
		o
	]) };
}
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuList/useMenuListStyles.styles.js
var zg = { root: "fui-MenuList" }, Bg = /*#__PURE__*/ F({
	root: {
		mc9l5x: "f22iagw",
		Beiy3e4: "f1vx9l62",
		i8kkvl: 0,
		Belr9w4: 0,
		rmohyg: "f1t6b6ee"
	},
	hasMenuContext: { Bqenvij: "f1l02sjl" }
}, { d: [
	".f22iagw{display:flex;}",
	".f1vx9l62{flex-direction:column;}",
	[".f1t6b6ee{gap:2px;}", { p: -1 }],
	".f1l02sjl{height:100%;}"
] }), Vg = (e) => {
	let t = Bg();
	return e.root.className = O(zg.root, t.root, e.hasMenuContext && t.hasMenuContext, e.root.className), e;
}, Hg = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Mg(e, t), r = Rg(n);
	return Vg(n), ii("useMenuListStyles_unstable")(n), Lg(n, r);
});
Hg.displayName = "MenuList";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuPopover/useMenuPopover.js
var Ug = (e, t) => {
	"use no memo";
	let n = $((e) => e.safeZone), r = $((e) => e.menuPopoverRef), i = $((e) => e.setOpen), a = $((e) => e.open), o = $((e) => e.openOnHover), s = $((e) => e.triggerRef), c = Hh(), l = Rh((e) => e.shouldCloseOnArrowLeft ?? !0), u = N.useRef(!0), [d, f] = Pi(), { dir: p } = Zr(), m = p === "ltr" ? Pl : Fl, h = N.useCallback((e) => {
		e && e.addEventListener("mouseover", (e) => {
			u.current && (u.current = !1, Vh(r.current, e), d(() => {
				u.current = !0;
			}, 250));
		});
	}, [r, d]);
	N.useEffect(() => () => f(), [f]);
	let g = $((e) => e.inline) ?? !1, _ = $((e) => e.mountNode), v = tr(Ir("div", {
		role: "presentation",
		...e,
		ref: Ti(t, r, h)
	}), { elementType: "div" }), { onMouseEnter: y, onKeyDown: b } = v;
	return v.onMouseEnter = I((e) => {
		(o || c) && i(e, {
			open: !0,
			keyboard: !1,
			type: "menuPopoverMouseEnter",
			event: e
		}), y?.(e);
	}), v.onKeyDown = I((e) => {
		let t = e.key;
		if ((t === "Escape" || c && l && t === m) && a && r.current?.contains(e.target) && !e.isDefaultPrevented() && (i(e, {
			open: !1,
			keyboard: !0,
			type: "menuPopoverKeyDown",
			event: e
		}), e.preventDefault()), t === "Tab" && (i(e, {
			open: !1,
			keyboard: !0,
			type: "menuPopoverKeyDown",
			event: e
		}), !c)) {
			var n;
			(n = s.current) == null || n.focus();
		}
		b?.(e);
	}), {
		inline: g,
		mountNode: _,
		safeZone: n,
		components: { root: "div" },
		root: v
	};
}, Wg = (e, t) => {
	let n = Ws(Js(), fs({ focusable: { ignoreKeydown: { Escape: !0 } } })), r = Bu(), i = Ug(e, t);
	return {
		...i,
		root: {
			...n,
			...i.root,
			ref: Ti(i.root.ref, r)
		}
	};
}, Gg = { root: "fui-MenuPopover" }, Kg = /*#__PURE__*/ F({ root: {
	Beyfa6y: 0,
	Bbmb7ep: 0,
	Btl43ni: 0,
	B7oj6ja: 0,
	Dimara: "ft85np5",
	De3pzq: "fxugw4r",
	sj55zd: "f19n0e5",
	B7ck84d: "f1ewtqcl",
	Bf4jedk: "fl8fusi",
	B2u0y6b: "f1kaai3v",
	B68tc82: "f1p9o1ba",
	a9b677: "f1ahpp82",
	E5pizo: "f1hg901r",
	Byoj8tv: 0,
	uwmqm3: 0,
	z189sj: 0,
	z8tnut: 0,
	B0ocmuz: "fd3pd8h",
	Bgfg5da: 0,
	B9xav0g: 0,
	oivjwe: 0,
	Bn0qgzm: 0,
	B4g9neb: 0,
	zhjwy3: 0,
	wvpqe5: 0,
	ibv6hh: 0,
	u1mtju: 0,
	h3c5rm: 0,
	vrafjx: 0,
	Bekrc4i: 0,
	i8vvqc: 0,
	g2u3we: 0,
	icvyot: 0,
	B4j52fo: 0,
	irswps: "f9ggezi",
	Bahqtrf: "fk6fouc",
	Be2twd7: "fkhj508",
	Bhrd7zp: "figsok6",
	Bg96gwp: "f1i3iumi"
} }, { d: [
	[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
	".fxugw4r{background-color:var(--colorNeutralBackground1);}",
	".f19n0e5{color:var(--colorNeutralForeground1);}",
	".f1ewtqcl{box-sizing:border-box;}",
	".fl8fusi{min-width:138px;}",
	".f1kaai3v{max-width:300px;}",
	".f1p9o1ba{overflow-x:hidden;}",
	".f1ahpp82{width:max-content;}",
	".f1hg901r{box-shadow:var(--shadow16);}",
	[".fd3pd8h{padding:4px;}", { p: -1 }],
	[".f9ggezi{border:1px solid var(--colorTransparentStroke);}", { p: -2 }],
	".fk6fouc{font-family:var(--fontFamilyBase);}",
	".fkhj508{font-size:var(--fontSizeBase300);}",
	".figsok6{font-weight:var(--fontWeightRegular);}",
	".f1i3iumi{line-height:var(--lineHeightBase300);}"
] }), qg = (e) => {
	let t = Kg();
	return e.root.className = O(Gg.root, t.root, e.root.className), e;
}, Jg = (e) => e.inline ? /*#__PURE__*/ ta(N.Fragment, { children: [/*#__PURE__*/ L(e.root, {}), e.safeZone] }) : /*#__PURE__*/ ta(cm, {
	mountNode: e.mountNode,
	children: [/*#__PURE__*/ L(e.root, {}), e.safeZone]
}), Yg = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Wg(e, t);
	return qg(n), ii("useMenuPopoverStyles_unstable")(n), Jg(n);
});
Yg.displayName = "MenuPopover";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuTrigger/useMenuTrigger.js
function Xg() {}
var Zg = (e) => {
	let t = $((e) => e.menuPopoverRef), { findFirstFocusable: n } = hs(), r = N.useCallback(() => {
		n(t.current)?.focus();
	}, [n, t]);
	return Qg({
		...e,
		focusFirst: r
	});
}, Qg = (e) => {
	let { children: t, disableButtonEnhancement: n = !1, focusFirst: r } = e, i = $((e) => e.triggerRef), a = $((e) => e.setOpen), o = $((e) => e.open), s = $((e) => e.triggerId), c = $((e) => e.openOnHover), l = $((e) => e.openOnContext), u = Hh(), d = Rh((e) => e.shouldOpenOnArrowRight ?? !0), f = N.useRef(!1), p = N.useRef(!1), m = N.useRef(!1), { dir: h } = Zr(), g = h === "ltr" ? Fl : Pl, _ = Ui(t), v = Gh(I(() => {
		u && (p.current = !0);
	})), y = (e) => {
		$g(e) || e.isDefaultPrevented() || l && (e.preventDefault(), a(e, {
			open: !0,
			keyboard: !1,
			type: "menuTriggerContextMenu",
			event: e
		}));
	}, b = (e) => {
		$g(e) || l || (a(e, {
			open: !o,
			keyboard: f.current,
			type: "menuTriggerClick",
			event: e
		}), f.current = !1);
	}, x = (e) => {
		if ($g(e) || e.isDefaultPrevented()) return;
		let t = e.key;
		!l && (u && d && t === g || !u && t === "ArrowDown") && a(e, {
			open: !0,
			keyboard: !0,
			type: "menuTriggerKeyDown",
			event: e
		}), t === "Escape" && !u && a(e, {
			open: !1,
			keyboard: !0,
			type: "menuTriggerKeyDown",
			event: e
		}), o && t === g && u && d && r?.();
	}, S = (e) => {
		$g(e) || c && (m.current ? a(e, {
			open: !0,
			keyboard: !1,
			type: "menuTriggerMouseEnter",
			event: e
		}) : p.current &&= (a(e, {
			open: !0,
			keyboard: !1,
			ignoreHoverDelay: !0,
			type: "menuTriggerMouseEnter",
			event: e
		}), !1));
	}, C = (e) => {
		$g(e) || c && !m.current && (a(e, {
			open: !0,
			keyboard: !1,
			type: "menuTriggerMouseMove",
			event: e
		}), m.current = !0);
	}, w = (e) => {
		$g(e) || c && a(e, {
			open: !1,
			keyboard: !1,
			type: "menuTriggerMouseLeave",
			event: e
		});
	}, T = {
		id: s,
		..._?.props,
		ref: Ti(i, Li(_), v),
		onMouseEnter: I(_?.props.onMouseEnter ?? Xg),
		onMouseLeave: I(Ri(_?.props.onMouseLeave, w)),
		onContextMenu: I(Ri(_?.props.onContextMenu, y)),
		onMouseMove: I(Ri(_?.props.onMouseMove, C)),
		onMouseOver: I(Ri(_?.props.onMouseOver, S))
	}, E = {
		"aria-haspopup": "menu",
		"aria-expanded": !o && !u ? void 0 : o,
		...T,
		onClick: I(Ri(_?.props.onClick, b)),
		onKeyDown: I(Ri(_?.props.onKeyDown, x))
	}, D = Il(_?.type === "button" || _?.type === "a" ? _.type : "div", E);
	return {
		isSubmenu: u,
		children: Vi(t, l ? T : n ? E : D)
	};
}, $g = (e) => {
	let t = (e) => e.hasAttribute("disabled") || e.hasAttribute("aria-disabled") && e.getAttribute("aria-disabled") === "true";
	return zi(e.target) && t(e.target) ? !0 : zi(e.currentTarget) && t(e.currentTarget);
}, e_ = (e) => /*#__PURE__*/ N.createElement(Nh, { value: e.isSubmenu }, e.children), t_ = (e) => e_(Zg(e));
t_.displayName = "MenuTrigger", t_.isFluentTriggerComponent = !0;
//#endregion
//#region node_modules/@fluentui/react-radio/lib/contexts/RadioGroupContext.js
var n_ = N.createContext(void 0), r_ = {};
n_.Provider;
var i_ = () => N.useContext(n_) || r_, a_ = (e, t) => /*#__PURE__*/ L(n_.Provider, {
	value: t.radioGroup,
	children: /*#__PURE__*/ L(e.root, {})
}), o_ = (e, t) => {
	let { layout: n = "vertical", ...r } = e;
	return {
		layout: n,
		...s_(r, t)
	};
}, s_ = (e, t) => {
	e = zm(e);
	let n = wi("radiogroup-"), { name: r = n, value: i, defaultValue: a, disabled: o, onChange: s, required: c } = e;
	return {
		name: r,
		value: i,
		defaultValue: a,
		disabled: o,
		required: c,
		components: { root: "div" },
		root: {
			ref: t,
			role: "radiogroup",
			...tr(Ir("div", e, ["onChange", "name"]), { elementType: "div" }),
			onChange: I((e) => {
				s && zi(e.target, { constructorName: "HTMLInputElement" }) && e.target.type === "radio" && s(e, { value: e.target.value });
			})
		}
	};
}, c_ = { root: "fui-RadioGroup" }, l_ = /*#__PURE__*/ F({
	root: {
		mc9l5x: "f22iagw",
		Bt984gj: "f6jr5hl"
	},
	vertical: { Beiy3e4: "f1vx9l62" }
}, { d: [
	".f22iagw{display:flex;}",
	".f6jr5hl{align-items:flex-start;}",
	".f1vx9l62{flex-direction:column;}"
] }), u_ = (e) => {
	let t = l_();
	return e.root.className = O(c_.root, t.root, e.layout === "vertical" && t.vertical, e.root.className), e;
}, d_ = (e) => {
	let { name: t, value: n, defaultValue: r, disabled: i, layout: a, required: o } = e, s = e.root["aria-describedby"];
	return { radioGroup: N.useMemo(() => ({
		name: t,
		value: n,
		defaultValue: r,
		disabled: i,
		layout: a,
		required: o,
		"aria-describedby": s
	}), [
		t,
		n,
		r,
		i,
		a,
		o,
		s
	]) };
}, f_ = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = o_(e, t), r = d_(n);
	return u_(n), ii("useRadioGroupStyles_unstable")(n), a_(n, r);
});
f_.displayName = "RadioGroup";
//#endregion
//#region node_modules/@fluentui/react-radio/lib/components/Radio/renderRadio.js
var p_ = (e) => /*#__PURE__*/ ta(e.root, { children: [
	/*#__PURE__*/ L(e.input, {}),
	/*#__PURE__*/ L(e.indicator, {}),
	e.label && /*#__PURE__*/ L(e.label, {})
] }), m_ = (e, t) => {
	let n = h_(e, t);
	return {
		...n,
		components: {
			...n.components,
			label: Jm
		},
		label: nr(e.label, {
			defaultProps: { ...n.label },
			elementType: Jm
		})
	};
}, h_ = (e, t) => {
	let n = i_(), { name: r = n.name, checked: i = n.value === void 0 ? void 0 : n.value === e.value, defaultChecked: a = n.defaultValue === void 0 ? void 0 : n.defaultValue === e.value, labelPosition: o = n.layout === "horizontal-stacked" ? "below" : "after", disabled: s = n.disabled, required: c = n.required, "aria-describedby": l = n["aria-describedby"], onChange: u } = e, d = Fr({
		props: e,
		primarySlotTagName: "input",
		excludedPropNames: [
			"checked",
			"defaultChecked",
			"onChange"
		]
	}), f = tr(e.root, {
		defaultProps: {
			ref: Hs(),
			...d.root
		},
		elementType: "span"
	}), p = tr(e.input, {
		defaultProps: {
			ref: t,
			type: "radio",
			id: wi("radio-", d.primary.id),
			name: r,
			checked: i,
			defaultChecked: a,
			disabled: s,
			required: c,
			"aria-describedby": l,
			...d.primary
		},
		elementType: "input"
	});
	return p.onChange = Ri(p.onChange, (e) => u?.(e, { value: e.currentTarget.value })), {
		labelPosition: o,
		components: {
			root: "span",
			input: "input",
			label: "label",
			indicator: "div"
		},
		root: f,
		input: p,
		label: nr(e.label, {
			defaultProps: {
				htmlFor: p.id,
				disabled: p.disabled
			},
			elementType: "label"
		}),
		indicator: tr(e.indicator, {
			defaultProps: { "aria-hidden": !0 },
			elementType: "div"
		})
	};
}, g_ = {
	root: "fui-Radio",
	indicator: "fui-Radio__indicator",
	input: "fui-Radio__input",
	label: "fui-Radio__label"
}, __ = /*#__PURE__*/ Jn("r1siqwd8", "rmnplyc", {
	r: [
		".r1siqwd8{display:inline-flex;position:relative;}",
		".r1siqwd8:focus{outline-style:none;}",
		".r1siqwd8:focus-visible{outline-style:none;}",
		".r1siqwd8[data-fui-focus-within]:focus-within{border-top-color:transparent;border-right-color:transparent;border-bottom-color:transparent;border-left-color:transparent;}",
		".r1siqwd8[data-fui-focus-within]:focus-within::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid var(--colorStrokeFocus2);border-radius:var(--borderRadiusMedium);top:calc(2px * -1);right:calc(2px * -1);bottom:calc(2px * -1);left:calc(2px * -1);}",
		".rmnplyc{display:inline-flex;position:relative;}",
		".rmnplyc:focus{outline-style:none;}",
		".rmnplyc:focus-visible{outline-style:none;}",
		".rmnplyc[data-fui-focus-within]:focus-within{border-top-color:transparent;border-left-color:transparent;border-bottom-color:transparent;border-right-color:transparent;}",
		".rmnplyc[data-fui-focus-within]:focus-within::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid var(--colorStrokeFocus2);border-radius:var(--borderRadiusMedium);top:calc(2px * -1);left:calc(2px * -1);bottom:calc(2px * -1);right:calc(2px * -1);}"
	],
	s: ["@media (forced-colors: active){.r1siqwd8[data-fui-focus-within]:focus-within::after{border-top-color:Highlight;border-right-color:Highlight;border-bottom-color:Highlight;border-left-color:Highlight;}}", "@media (forced-colors: active){.rmnplyc[data-fui-focus-within]:focus-within::after{border-top-color:Highlight;border-left-color:Highlight;border-bottom-color:Highlight;border-right-color:Highlight;}}"]
}), v_ = /*#__PURE__*/ F({ vertical: {
	Beiy3e4: "f1vx9l62",
	Bt984gj: "f122n59"
} }, { d: [".f1vx9l62{flex-direction:column;}", ".f122n59{align-items:center;}"] }), y_ = /*#__PURE__*/ Jn("rg1upok", "rzwdzb4", {
	r: /* @__PURE__ */ ".rg1upok{position:absolute;left:0;top:0;width:calc(16px + 2 * var(--spacingHorizontalS));height:100%;box-sizing:border-box;margin:0;opacity:0;},.rg1upok:enabled{cursor:pointer;},.rg1upok:enabled~.fui-Radio__label{cursor:pointer;},.rg1upok:enabled:not(:checked)~.fui-Radio__label{color:var(--colorNeutralForeground3);},.rg1upok:enabled:not(:checked)~.fui-Radio__indicator{border-color:var(--colorNeutralStrokeAccessible);},.rg1upok:enabled:not(:checked):hover~.fui-Radio__label{color:var(--colorNeutralForeground2);},.rg1upok:enabled:not(:checked):hover~.fui-Radio__indicator{border-color:var(--colorNeutralStrokeAccessibleHover);},.rg1upok:enabled:not(:checked):hover:active~.fui-Radio__label{color:var(--colorNeutralForeground1);},.rg1upok:enabled:not(:checked):hover:active~.fui-Radio__indicator{border-color:var(--colorNeutralStrokeAccessiblePressed);},.rg1upok:enabled:checked~.fui-Radio__label{color:var(--colorNeutralForeground1);},.rg1upok:enabled:checked~.fui-Radio__indicator{border-color:var(--colorCompoundBrandStroke);color:var(--colorCompoundBrandForeground1);},.rg1upok:enabled:checked:hover~.fui-Radio__indicator{border-color:var(--colorCompoundBrandStrokeHover);color:var(--colorCompoundBrandForeground1Hover);},.rg1upok:enabled:checked:hover:active~.fui-Radio__indicator{border-color:var(--colorCompoundBrandStrokePressed);color:var(--colorCompoundBrandForeground1Pressed);},.rg1upok:disabled~.fui-Radio__label{color:var(--colorNeutralForegroundDisabled);cursor:default;},.rg1upok:disabled~.fui-Radio__indicator{border-color:var(--colorNeutralStrokeDisabled);color:var(--colorNeutralForegroundDisabled);},.rzwdzb4{position:absolute;right:0;top:0;width:calc(16px + 2 * var(--spacingHorizontalS));height:100%;box-sizing:border-box;margin:0;opacity:0;},.rzwdzb4:enabled{cursor:pointer;},.rzwdzb4:enabled~.fui-Radio__label{cursor:pointer;},.rzwdzb4:enabled:not(:checked)~.fui-Radio__label{color:var(--colorNeutralForeground3);},.rzwdzb4:enabled:not(:checked)~.fui-Radio__indicator{border-color:var(--colorNeutralStrokeAccessible);},.rzwdzb4:enabled:not(:checked):hover~.fui-Radio__label{color:var(--colorNeutralForeground2);},.rzwdzb4:enabled:not(:checked):hover~.fui-Radio__indicator{border-color:var(--colorNeutralStrokeAccessibleHover);},.rzwdzb4:enabled:not(:checked):hover:active~.fui-Radio__label{color:var(--colorNeutralForeground1);},.rzwdzb4:enabled:not(:checked):hover:active~.fui-Radio__indicator{border-color:var(--colorNeutralStrokeAccessiblePressed);},.rzwdzb4:enabled:checked~.fui-Radio__label{color:var(--colorNeutralForeground1);},.rzwdzb4:enabled:checked~.fui-Radio__indicator{border-color:var(--colorCompoundBrandStroke);color:var(--colorCompoundBrandForeground1);},.rzwdzb4:enabled:checked:hover~.fui-Radio__indicator{border-color:var(--colorCompoundBrandStrokeHover);color:var(--colorCompoundBrandForeground1Hover);},.rzwdzb4:enabled:checked:hover:active~.fui-Radio__indicator{border-color:var(--colorCompoundBrandStrokePressed);color:var(--colorCompoundBrandForeground1Pressed);},.rzwdzb4:disabled~.fui-Radio__label{color:var(--colorNeutralForegroundDisabled);cursor:default;},.rzwdzb4:disabled~.fui-Radio__indicator{border-color:var(--colorNeutralStrokeDisabled);color:var(--colorNeutralForegroundDisabled);}".split(","),
	s: [
		"@media (forced-colors: active){.rg1upok:enabled:not(:checked)~.fui-Radio__indicator{border-color:ButtonBorder;}}",
		"@media (forced-colors: active){.rg1upok:enabled:checked~.fui-Radio__indicator{border-color:Highlight;color:Highlight;}.rg1upok:enabled:checked~.fui-Radio__indicator::after{background-color:Highlight;}}",
		"@media (forced-colors: active){.rg1upok:disabled~.fui-Radio__label{color:GrayText;}}",
		"@media (forced-colors: active){.rg1upok:disabled~.fui-Radio__indicator{border-color:GrayText;color:GrayText;}.rg1upok:disabled~.fui-Radio__indicator::after{background-color:GrayText;}}",
		"@media (forced-colors: active){.rzwdzb4:enabled:not(:checked)~.fui-Radio__indicator{border-color:ButtonBorder;}}",
		"@media (forced-colors: active){.rzwdzb4:enabled:checked~.fui-Radio__indicator{border-color:Highlight;color:Highlight;}.rzwdzb4:enabled:checked~.fui-Radio__indicator::after{background-color:Highlight;}}",
		"@media (forced-colors: active){.rzwdzb4:disabled~.fui-Radio__label{color:GrayText;}}",
		"@media (forced-colors: active){.rzwdzb4:disabled~.fui-Radio__indicator{border-color:GrayText;color:GrayText;}.rzwdzb4:disabled~.fui-Radio__indicator::after{background-color:GrayText;}}"
	]
}), b_ = /*#__PURE__*/ F({
	below: {
		a9b677: "fly5x3f",
		Bqenvij: "f1je6zif"
	},
	defaultIndicator: { Blbys7f: "f9ma1gx" },
	customIndicator: { Bj53wkj: "f12zxao0" }
}, { d: [
	".fly5x3f{width:100%;}",
	".f1je6zif{height:calc(16px + 2 * var(--spacingVerticalS));}",
	".f9ma1gx:checked~.fui-Radio__indicator::after{content:\"\";}",
	".f12zxao0:not(:checked)~.fui-Radio__indicator>*{opacity:0;}"
] }), x_ = /*#__PURE__*/ Jn("rwtekvw", null, [".rwtekvw{position:relative;width:16px;height:16px;font-size:12px;box-sizing:border-box;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border:var(--strokeWidthThin) solid;border-radius:var(--borderRadiusCircular);margin:var(--spacingVerticalS) var(--spacingHorizontalS);fill:currentColor;pointer-events:none;}", ".rwtekvw::after{position:absolute;width:16px;height:16px;border-radius:var(--borderRadiusCircular);transform:scale(0.625);background-color:currentColor;}"]), S_ = /*#__PURE__*/ F({
	base: {
		qb2dma: "f7nlbp4",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1f5q0n8"
	},
	after: {
		uwmqm3: ["fruq291", "f7x41pl"],
		B6of3ja: "fjzwpt6",
		jrapky: "fh6j2fo"
	},
	below: {
		z8tnut: "f1ywm7hm",
		fsow6f: "f17mccla"
	}
}, { d: [
	".f7nlbp4{align-self:center;}",
	[".f1f5q0n8{padding:var(--spacingVerticalS) var(--spacingHorizontalS);}", { p: -1 }],
	".fruq291{padding-left:var(--spacingHorizontalXS);}",
	".f7x41pl{padding-right:var(--spacingHorizontalXS);}",
	".fjzwpt6{margin-top:calc((16px - var(--lineHeightBase300)) / 2);}",
	".fh6j2fo{margin-bottom:calc((16px - var(--lineHeightBase300)) / 2);}",
	".f1ywm7hm{padding-top:var(--spacingVerticalXS);}",
	".f17mccla{text-align:center;}"
] }), C_ = (e) => {
	let { labelPosition: t } = e, n = __(), r = v_();
	e.root.className = O(g_.root, n, t === "below" && r.vertical, e.root.className);
	let i = y_(), a = b_();
	e.input.className = O(g_.input, i, t === "below" && a.below, e.indicator.children ? a.customIndicator : a.defaultIndicator, e.input.className);
	let o = x_();
	e.indicator.className = O(g_.indicator, o, e.indicator.className);
	let s = S_();
	return e.label && (e.label.className = O(g_.label, s.base, s[t], e.label.className)), e;
}, w_ = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = m_(e, t);
	return C_(n), ii("useRadioStyles_unstable")(n), p_(n);
});
w_.displayName = "Radio";
//#endregion
//#region node_modules/@fluentui/react-slider/lib/components/Slider/Slider.constants.js
var T_ = {
	sliderDirectionVar: "--fui-Slider--direction",
	sliderInnerThumbRadiusVar: "--fui-Slider__inner-thumb--radius",
	sliderProgressVar: "--fui-Slider--progress",
	sliderProgressColorVar: "--fui-Slider__progress--color",
	sliderRailSizeVar: "--fui-Slider__rail--size",
	sliderRailColorVar: "--fui-Slider__rail--color",
	sliderStepsPercentVar: "--fui-Slider--steps-percent",
	sliderThumbColorVar: "--fui-Slider__thumb--color",
	sliderThumbSizeVar: "--fui-Slider__thumb--size"
}, { sliderStepsPercentVar: E_, sliderProgressVar: D_, sliderDirectionVar: O_ } = T_, k_ = (e, t, n) => n === t ? 0 : (e - t) / (n - t) * 100, A_ = (e, t) => {
	let { min: n = 0, max: r = 100, step: i } = t, { dir: a } = Zr(), [o, s] = di({
		state: t.value,
		defaultState: t.defaultValue,
		initialState: 0
	}), c = Fi(o, n, r), l = k_(c, n, r), u = e.input.onChange, d = t.onChange, f = I((e) => {
		let t = Number(e.target.value);
		s(Fi(t, n, r)), u && u !== d ? u(e) : d && d(e, { value: t });
	}), p = i && i > 0 ? `${i * 100 / (r - n)}%` : void 0, m = {
		[O_]: e.vertical ? "0deg" : a === "ltr" ? "90deg" : "270deg",
		[D_]: `${l}%`,
		...p !== void 0 && { [E_]: p }
	};
	return e.root.style = {
		...m,
		...e.root.style
	}, e.input.value = c, e.input.onChange = f, e;
}, j_ = (e, t) => {
	let { size: n = "medium", ...r } = e;
	return {
		...M_(r, t),
		size: n
	};
}, M_ = (e, t) => {
	e = zm(e, { supportsLabelFor: !0 });
	let n = Fr({
		props: e,
		primarySlotTagName: "input",
		excludedPropNames: ["onChange"]
	}), { disabled: r, vertical: i, root: a, input: o, rail: s, thumb: c } = e, l = {
		disabled: r,
		vertical: i,
		components: {
			input: "input",
			rail: "div",
			root: "div",
			thumb: "div"
		},
		root: tr(a, {
			defaultProps: n.root,
			elementType: "div"
		}),
		input: tr(o, {
			defaultProps: {
				id: wi("slider-", e.id),
				ref: t,
				...n.primary,
				type: "range",
				orient: i ? "vertical" : void 0
			},
			elementType: "input"
		}),
		rail: tr(s, { elementType: "div" }),
		thumb: tr(c, { elementType: "div" })
	};
	return l.root.ref = Ti(l.root.ref, Hs()), A_(l, e), l;
}, N_ = (e) => /*#__PURE__*/ ta(e.root, { children: [
	/*#__PURE__*/ L(e.input, {}),
	/*#__PURE__*/ L(e.rail, {}),
	/*#__PURE__*/ L(e.thumb, {})
] }), P_ = {
	root: "fui-Slider",
	rail: "fui-Slider__rail",
	thumb: "fui-Slider__thumb",
	input: "fui-Slider__input"
}, { sliderDirectionVar: F_, sliderInnerThumbRadiusVar: I_, sliderProgressVar: L_, sliderProgressColorVar: R_, sliderRailSizeVar: z_, sliderRailColorVar: B_, sliderStepsPercentVar: V_, sliderThumbColorVar: H_, sliderThumbSizeVar: U_ } = T_, W_ = /*#__PURE__*/ F({
	root: {
		qhf8xq: "f10pi13n",
		mc9l5x: "fwk3njj",
		lpbzjs: "f1sdsnyy",
		Bt984gj: "f122n59",
		B7hvi0a: "f1oiokrs"
	},
	small: {
		Bi64ftq: "f1agqo6f",
		Bslxy2k: "f1mmvox9",
		Ba19x4e: "f1i7ztpd",
		sshi5w: "f1pha7fy"
	},
	medium: {
		Bi64ftq: "f1a78h9h",
		Bslxy2k: "fh1udnr",
		Ba19x4e: "fuok0yf",
		sshi5w: "f1nxs5xn"
	},
	horizontal: {
		Bf4jedk: "fyvtabn",
		wkccdc: "fgfd48t",
		Budl1dq: "f4t5rw1"
	},
	vertical: {
		sshi5w: "f1pzv1zu",
		wkccdc: "fktlcaf",
		Budl1dq: "fiadc6h"
	},
	enabled: {
		B7wi8oa: "f4l8x3l",
		B250r6j: "f671q34",
		Bpmy4es: "fvfzmw5",
		Buw9y6v: "faw1t00",
		Bq939m0: "fxdgx5",
		gjzr1t: "fii04fa",
		tg7hqu: "f36hzz8",
		qhf704: "fdjsfay",
		Blfvze: "f1fen33d",
		genz7u: "f1c6b0w1",
		Brgvh4e: "f1rq9b4z",
		Bsjyjqp: "f4xxiul"
	},
	disabled: {
		Bpmy4es: "foojseg",
		B7wi8oa: "f1lgdqhv",
		B250r6j: "f1veetlj",
		qhf704: "fn4acdm",
		Blfvze: "f4s8dx0",
		genz7u: "f1wil5xy"
	},
	focusIndicatorHorizontal: {
		Brovlpu: "ftqa4ok",
		B486eqv: "f2hkw1w",
		Bssx7fj: "f1b1k54r",
		uh7if5: ["f4ne723", "fqqcjud"],
		clntm0: "fh7aioi",
		Dlk2r6: ["fqqcjud", "f4ne723"],
		h6p2u: "f1ufm4qn",
		I6qiy5: ["f1qnwcb4", "fgrk5zm"],
		yzno9d: "fi52z01",
		By0wis0: ["fgrk5zm", "f1qnwcb4"],
		B2j2mmj: "ffht0p2",
		wigs8: "f1p0ul1q",
		pbfy6t: "f1c901ms",
		B0v4ure: "f1alokd7",
		Byrf0fs: 0,
		Bsiemmq: 0,
		Bwckmig: 0,
		skfxo0: 0,
		Iidy0u: 0,
		B98u21t: 0,
		Bvwlmkc: 0,
		jo1ztg: 0,
		Ba1iezr: 0,
		Blmvk6g: 0,
		B24cy0v: 0,
		Bil7v7r: 0,
		Br3gin4: 0,
		nr063g: 0,
		ghq09: 0,
		Bbgo44z: 0,
		Bseh09z: "fmj8fco",
		az1dzo: 0,
		Ba3ybja: 0,
		B6352mv: 0,
		vppk2z: 0,
		Biaj6j7: "f1iwowo3",
		B2pnrqr: "f1pffoy2",
		B29w5g4: ["f1dfga45", "f63jj3o"],
		Bhhzhcn: "fs6b7xr",
		Bec0n69: ["f63jj3o", "f1dfga45"]
	},
	focusIndicatorVertical: {
		Brovlpu: "ftqa4ok",
		B486eqv: "f2hkw1w",
		Bssx7fj: "f1b1k54r",
		uh7if5: ["f4ne723", "fqqcjud"],
		clntm0: "fh7aioi",
		Dlk2r6: ["fqqcjud", "f4ne723"],
		h6p2u: "f1ufm4qn",
		I6qiy5: ["f1qnwcb4", "fgrk5zm"],
		yzno9d: "fi52z01",
		By0wis0: ["fgrk5zm", "f1qnwcb4"],
		B2j2mmj: "ffht0p2",
		wigs8: "f1p0ul1q",
		pbfy6t: "f1c901ms",
		B0v4ure: "f1alokd7",
		Byrf0fs: 0,
		Bsiemmq: 0,
		Bwckmig: 0,
		skfxo0: 0,
		Iidy0u: 0,
		B98u21t: 0,
		Bvwlmkc: 0,
		jo1ztg: 0,
		Ba1iezr: 0,
		Blmvk6g: 0,
		B24cy0v: 0,
		Bil7v7r: 0,
		Br3gin4: 0,
		nr063g: 0,
		ghq09: 0,
		Bbgo44z: 0,
		Bseh09z: "fmj8fco",
		az1dzo: 0,
		Ba3ybja: 0,
		B6352mv: 0,
		vppk2z: 0,
		Biaj6j7: "f1iwowo3",
		B2pnrqr: "f1pffoy2",
		B29w5g4: ["fm5xmfm", "femsgmt"],
		Bhhzhcn: "fs6b7xr",
		Bec0n69: ["femsgmt", "fm5xmfm"]
	}
}, {
	d: [
		".f10pi13n{position:relative;}",
		".fwk3njj{display:inline-grid;}",
		".f1sdsnyy{touch-action:none;}",
		".f122n59{align-items:center;}",
		".f1oiokrs{justify-items:center;}",
		".f1agqo6f{--fui-Slider__thumb--size:16px;}",
		".f1mmvox9{--fui-Slider__inner-thumb--radius:5px;}",
		".f1i7ztpd{--fui-Slider__rail--size:2px;}",
		".f1pha7fy{min-height:24px;}",
		".f1a78h9h{--fui-Slider__thumb--size:20px;}",
		".fh1udnr{--fui-Slider__inner-thumb--radius:6px;}",
		".fuok0yf{--fui-Slider__rail--size:4px;}",
		".f1nxs5xn{min-height:32px;}",
		".fyvtabn{min-width:120px;}",
		".fgfd48t{grid-template-rows:1fr var(--fui-Slider__thumb--size) 1fr;}",
		".f4t5rw1{grid-template-columns:1fr calc(100% - var(--fui-Slider__thumb--size)) 1fr;}",
		".f1pzv1zu{min-height:120px;}",
		".fktlcaf{grid-template-rows:1fr calc(100% - var(--fui-Slider__thumb--size)) 1fr;}",
		".fiadc6h{grid-template-columns:1fr var(--fui-Slider__thumb--size) 1fr;}",
		".f4l8x3l{--fui-Slider__rail--color:var(--colorNeutralStrokeAccessible);}",
		".f671q34{--fui-Slider__progress--color:var(--colorCompoundBrandBackground);}",
		".fvfzmw5{--fui-Slider__thumb--color:var(--colorCompoundBrandBackground);}",
		".foojseg{--fui-Slider__thumb--color:var(--colorNeutralForegroundDisabled);}",
		".f1lgdqhv{--fui-Slider__rail--color:var(--colorNeutralBackgroundDisabled);}",
		".f1veetlj{--fui-Slider__progress--color:var(--colorNeutralForegroundDisabled);}",
		".f1b1k54r[data-fui-focus-within]:focus-within{border-top-color:transparent;}",
		".f4ne723[data-fui-focus-within]:focus-within{border-right-color:transparent;}",
		".fqqcjud[data-fui-focus-within]:focus-within{border-left-color:transparent;}",
		".fh7aioi[data-fui-focus-within]:focus-within{border-bottom-color:transparent;}",
		".ffht0p2[data-fui-focus-within]:focus-within::after{content:\"\";}",
		".f1p0ul1q[data-fui-focus-within]:focus-within::after{position:absolute;}",
		".f1c901ms[data-fui-focus-within]:focus-within::after{pointer-events:none;}",
		".f1alokd7[data-fui-focus-within]:focus-within::after{z-index:1;}",
		[".fmj8fco[data-fui-focus-within]:focus-within::after{border:2px solid var(--colorStrokeFocus2);}", { p: -2 }],
		[".f1iwowo3[data-fui-focus-within]:focus-within::after{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		".f1pffoy2[data-fui-focus-within]:focus-within::after{top:calc(0px - 2px - -2px);}",
		".f1dfga45[data-fui-focus-within]:focus-within::after{right:calc(0px - 2px - -4px);}",
		".f63jj3o[data-fui-focus-within]:focus-within::after{left:calc(0px - 2px - -4px);}",
		".fs6b7xr[data-fui-focus-within]:focus-within::after{bottom:calc(0px - 2px - -2px);}",
		[".fmj8fco[data-fui-focus-within]:focus-within::after{border:2px solid var(--colorStrokeFocus2);}", { p: -2 }],
		[".f1iwowo3[data-fui-focus-within]:focus-within::after{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		".fm5xmfm[data-fui-focus-within]:focus-within::after{right:calc(0px - 2px - 4px);}",
		".femsgmt[data-fui-focus-within]:focus-within::after{left:calc(0px - 2px - 4px);}"
	],
	h: [".faw1t00:hover{--fui-Slider__thumb--color:var(--colorCompoundBrandBackgroundHover);}", ".fxdgx5:hover{--fui-Slider__progress--color:var(--colorCompoundBrandBackgroundHover);}"],
	a: [".fii04fa:active{--fui-Slider__thumb--color:var(--colorCompoundBrandBackgroundPressed);}", ".f36hzz8:active{--fui-Slider__progress--color:var(--colorCompoundBrandBackgroundPressed);}"],
	m: [
		["@media (forced-colors: active){.fdjsfay{--fui-Slider__rail--color:CanvasText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1fen33d{--fui-Slider__thumb--color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1c6b0w1{--fui-Slider__progress--color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1rq9b4z:hover{--fui-Slider__thumb--color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f4xxiul:hover{--fui-Slider__progress--color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fn4acdm{--fui-Slider__rail--color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f4s8dx0{--fui-Slider__thumb--color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1wil5xy{--fui-Slider__progress--color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1ufm4qn[data-fui-focus-within]:focus-within::after{border-top-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1qnwcb4[data-fui-focus-within]:focus-within::after{border-right-color:Highlight;}.fgrk5zm[data-fui-focus-within]:focus-within::after{border-left-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fi52z01[data-fui-focus-within]:focus-within::after{border-bottom-color:Highlight;}}", { m: "(forced-colors: active)" }]
	],
	f: [".ftqa4ok:focus{outline-style:none;}"],
	i: [".f2hkw1w:focus-visible{outline-style:none;}"]
}), G_ = /*#__PURE__*/ F({
	rail: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "f1kijzfu",
		Bkecrkj: "f1aehjj5",
		Ijaq50: "faunodf",
		nk6f5a: "f88nxoq",
		Br312pm: "fd46tj4",
		Bw0ie65: "f1e2fz10",
		qhf8xq: "f10pi13n",
		Bvjb7m6: "fdgv6k0",
		Bcmaq0h: "fizngqt",
		Bpd4iqm: "fpvhumw",
		oeaueh: "f1yog68k",
		Bw0xxkn: "f13sgyd8",
		Ftih45: "fzhtfnv",
		Brfgrao: "f1j7ml58",
		Bbn5juq: "fx36ao7",
		Bses4cn: "fddlh2i"
	},
	horizontal: {
		a9b677: "fly5x3f",
		Bqenvij: "f1cy86ho",
		Fbdkly: ["f1heqfse", "fkh49vu"],
		mdwyqc: ["fkh49vu", "f1heqfse"],
		Baz25je: "f16tdq4e"
	},
	vertical: {
		a9b677: "fqxfnkd",
		Bqenvij: "f1l02sjl",
		Ccq8qp: "f1rik0od",
		Bciustq: "f14xwovp",
		lawp4y: "fdehrcx"
	}
}, {
	d: [
		[".f1kijzfu{border-radius:var(--borderRadiusXLarge);}", { p: -1 }],
		".f1aehjj5{pointer-events:none;}",
		".faunodf{grid-row-start:2;}",
		".f88nxoq{grid-row-end:2;}",
		".fd46tj4{grid-column-start:2;}",
		".f1e2fz10{grid-column-end:2;}",
		".f10pi13n{position:relative;}",
		".fdgv6k0{forced-color-adjust:none;}",
		".fizngqt{background-image:linear-gradient(\n      var(--fui-Slider--direction),\n      var(--fui-Slider__progress--color) 0%,\n      var(--fui-Slider__progress--color) var(--fui-Slider--progress),\n      var(--fui-Slider__rail--color) var(--fui-Slider--progress)\n    );}",
		".fpvhumw{outline-width:1px;}",
		".f1yog68k{outline-style:solid;}",
		".f13sgyd8{outline-color:var(--colorTransparentStroke);}",
		".fzhtfnv::before{content:'';}",
		".f1j7ml58::before{position:absolute;}",
		".fx36ao7::before{background-image:repeating-linear-gradient(\n        var(--fui-Slider--direction),\n        #0000 0%,\n        #0000 calc(var(--fui-Slider--steps-percent) - 1px),\n        var(--colorNeutralBackground1) calc(var(--fui-Slider--steps-percent) - 1px),\n        var(--colorNeutralBackground1) var(--fui-Slider--steps-percent)\n      );}",
		".fly5x3f{width:100%;}",
		".f1cy86ho{height:var(--fui-Slider__rail--size);}",
		".f1heqfse::before{left:-1px;}",
		".fkh49vu::before{right:-1px;}",
		".f16tdq4e::before{height:var(--fui-Slider__rail--size);}",
		".fqxfnkd{width:var(--fui-Slider__rail--size);}",
		".f1l02sjl{height:100%;}",
		".f1rik0od::before{width:var(--fui-Slider__rail--size);}",
		".f14xwovp::before{top:-1px;}",
		".fdehrcx::before{bottom:-1px;}"
	],
	m: [["@media (forced-colors: active){.fddlh2i::before{background-image:repeating-linear-gradient(\n          var(--fui-Slider--direction),\n          #0000 0%,\n          #0000 calc(var(--fui-Slider--steps-percent) - 1px),\n          HighlightText calc(var(--fui-Slider--steps-percent) - 1px),\n          HighlightText var(--fui-Slider--steps-percent)\n        );}}", { m: "(forced-colors: active)" }]]
}), K_ = /*#__PURE__*/ F({
	thumb: {
		B2lzsem: "ftx3jue",
		Ijaq50: "faunodf",
		nk6f5a: "f88nxoq",
		Br312pm: "fd46tj4",
		Bw0ie65: "f1e2fz10",
		qhf8xq: "f1euv43f",
		a9b677: "f174ca62",
		Bqenvij: "f1yfdkfd",
		Bkecrkj: "f1aehjj5",
		oeaueh: "f1s6fcnf",
		Bvjb7m6: "fdgv6k0",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "f44lkw9",
		E5pizo: "fof7hq0",
		De3pzq: "foksa45",
		Brfgrao: "f1j7ml58",
		Bciustq: "f14u7mkt",
		Fbdkly: ["f5zrw40", "f1ks5ppg"],
		lawp4y: "fto0uou",
		mdwyqc: ["f1ks5ppg", "f5zrw40"],
		r59vdv: 0,
		Budzafs: 0,
		ck0cow: 0,
		n07z76: 0,
		Gng75u: "fielpny",
		Bcvre1j: "fyl8oag",
		Ftih45: "fzhtfnv",
		Bcgcnre: 0,
		Bqjgrrk: 0,
		qa3bma: 0,
		y0oebl: 0,
		Biqmznv: 0,
		Bm6vgfq: 0,
		Bbv0w2i: 0,
		uvfttm: 0,
		eqrjj: 0,
		Bk5zm6e: 0,
		m598lv: 0,
		B4f6apu: 0,
		ydt019: 0,
		Bq4z7u6: 0,
		Bdkvgpv: 0,
		B0qfbqy: 0,
		kj8mxx: "f1fsco4d"
	},
	disabled: {
		Bcgcnre: 0,
		Bqjgrrk: 0,
		qa3bma: 0,
		y0oebl: 0,
		Biqmznv: 0,
		Bm6vgfq: 0,
		Bbv0w2i: 0,
		uvfttm: 0,
		eqrjj: 0,
		Bk5zm6e: 0,
		m598lv: 0,
		B4f6apu: 0,
		ydt019: 0,
		Bq4z7u6: 0,
		Bdkvgpv: 0,
		B0qfbqy: 0,
		kj8mxx: "f1pv9hn4"
	},
	horizontal: {
		Bz10aip: ["f13gfj74", "f1nfknbn"],
		oyh7mz: ["foa2ioz", "fjmilum"]
	},
	vertical: {
		Bz10aip: "f5cv5a3",
		B5kzvoi: "f1k2fpdo"
	}
}, { d: [
	".ftx3jue{--fui-Slider__thumb--position:clamp(var(--fui-Slider__inner-thumb--radius), var(--fui-Slider--progress), calc(100% - var(--fui-Slider__inner-thumb--radius)));}",
	".faunodf{grid-row-start:2;}",
	".f88nxoq{grid-row-end:2;}",
	".fd46tj4{grid-column-start:2;}",
	".f1e2fz10{grid-column-end:2;}",
	".f1euv43f{position:absolute;}",
	".f174ca62{width:var(--fui-Slider__thumb--size);}",
	".f1yfdkfd{height:var(--fui-Slider__thumb--size);}",
	".f1aehjj5{pointer-events:none;}",
	".f1s6fcnf{outline-style:none;}",
	".fdgv6k0{forced-color-adjust:none;}",
	[".f44lkw9{border-radius:var(--borderRadiusCircular);}", { p: -1 }],
	".fof7hq0{box-shadow:0 0 0 calc(var(--fui-Slider__thumb--size) * .2) var(--colorNeutralBackground1) inset;}",
	".foksa45{background-color:var(--fui-Slider__thumb--color);}",
	".f1j7ml58::before{position:absolute;}",
	".f14u7mkt::before{top:0px;}",
	".f5zrw40::before{left:0px;}",
	".f1ks5ppg::before{right:0px;}",
	".fto0uou::before{bottom:0px;}",
	[".fielpny::before{border-radius:var(--borderRadiusCircular);}", { p: -1 }],
	".fyl8oag::before{box-sizing:border-box;}",
	".fzhtfnv::before{content:'';}",
	[".f1fsco4d::before{border:calc(var(--fui-Slider__thumb--size) * .05) solid var(--colorNeutralStroke1);}", { p: -2 }],
	[".f1pv9hn4::before{border:calc(var(--fui-Slider__thumb--size) * .05) solid var(--colorNeutralForegroundDisabled);}", { p: -2 }],
	".f13gfj74{transform:translateX(-50%);}",
	".f1nfknbn{transform:translateX(50%);}",
	".foa2ioz{left:var(--fui-Slider__thumb--position);}",
	".fjmilum{right:var(--fui-Slider__thumb--position);}",
	".f5cv5a3{transform:translateY(50%);}",
	".f1k2fpdo{bottom:var(--fui-Slider__thumb--position);}"
] }), q_ = /*#__PURE__*/ F({
	input: {
		Bceei9c: "f1k6fduh",
		abs64n: "fk73vx1",
		Ijaq50: "f16hsg94",
		nk6f5a: "f1nzqi2z",
		Br312pm: "fwpfdsa",
		Bw0ie65: "fuur7zz",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1mk8lai",
		jrapky: 0,
		Frg6f3: 0,
		t21cq0: 0,
		B6of3ja: 0,
		B74szlk: "f1s184ao"
	},
	disabled: { Bceei9c: "f158kwzp" },
	horizontal: {
		Bqenvij: "f1yfdkfd",
		a9b677: "fly5x3f"
	},
	vertical: {
		Bqenvij: "f1l02sjl",
		a9b677: "f174ca62",
		wtfg9d: "f135tqni",
		By3ymbm: ["f114o3fk", "f1o9w1zd"],
		B1e78rk: "f1jr0wcp"
	}
}, {
	d: [
		".f1k6fduh{cursor:pointer;}",
		".fk73vx1{opacity:0;}",
		".f16hsg94{grid-row-start:1;}",
		".f1nzqi2z{grid-row-end:-1;}",
		".fwpfdsa{grid-column-start:1;}",
		".fuur7zz{grid-column-end:-1;}",
		[".f1mk8lai{padding:0;}", { p: -1 }],
		[".f1s184ao{margin:0;}", { p: -1 }],
		".f158kwzp{cursor:default;}",
		".f1yfdkfd{height:var(--fui-Slider__thumb--size);}",
		".fly5x3f{width:100%;}",
		".f1l02sjl{height:100%;}",
		".f174ca62{width:var(--fui-Slider__thumb--size);}"
	],
	t: [
		"@supports (writing-mode: sideways-lr){.f135tqni{writing-mode:vertical-lr;}}",
		"@supports (writing-mode: sideways-lr){.f114o3fk{direction:rtl;}.f1o9w1zd{direction:ltr;}}",
		"@supports not (writing-mode: sideways-lr){.f1jr0wcp{-webkit-appearance:slider-vertical;}}"
	]
}), J_ = (e) => {
	let t = W_(), n = G_(), r = K_(), i = q_(), a = e.vertical;
	return e.root.className = O(P_.root, t.root, a ? t.focusIndicatorVertical : t.focusIndicatorHorizontal, t[e.size], a ? t.vertical : t.horizontal, e.disabled ? t.disabled : t.enabled, e.root.className), e.rail.className = O(P_.rail, n.rail, a ? n.vertical : n.horizontal, e.rail.className), e.thumb.className = O(P_.thumb, r.thumb, a ? r.vertical : r.horizontal, e.disabled && r.disabled, e.thumb.className), e.input.className = O(P_.input, i.input, a ? i.vertical : i.horizontal, e.disabled && i.disabled, e.input.className), e;
}, Y_ = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = j_(e, t);
	return J_(n), ii("useSliderStyles_unstable")(n), N_(n);
});
Y_.displayName = "Slider";
//#endregion
//#region node_modules/@fluentui/react-switch/lib/components/Switch/useSwitch.js
var X_ = (e, t) => {
	var n;
	let { size: r = "medium", ...i } = e, a = Z_(i, t);
	return (n = a.indicator).children ?? (n.children = /*#__PURE__*/ N.createElement($l, null)), {
		...a,
		components: {
			...a.components,
			label: Jm
		},
		size: r,
		label: nr(e.label, {
			defaultProps: {
				size: "medium",
				...a.label
			},
			elementType: Jm
		})
	};
}, Z_ = (e, t) => {
	e = zm(e, {
		supportsLabelFor: !0,
		supportsRequired: !0
	});
	let { checked: n, defaultChecked: r, disabled: i, disabledFocusable: a = !1, labelPosition: o = "after", onChange: s, required: c } = e, l = Fr({
		props: e,
		primarySlotTagName: "input",
		excludedPropNames: [
			"checked",
			"defaultChecked",
			"onChange",
			"disabledFocusable"
		]
	}), u = wi("switch-", l.primary.id), d = tr(e.root, {
		defaultProps: {
			ref: Hs(),
			...l.root
		},
		elementType: "div"
	}), f = tr(e.indicator, {
		defaultProps: { "aria-hidden": !0 },
		elementType: "div"
	}), p = tr(e.input, {
		defaultProps: {
			checked: n,
			defaultChecked: r,
			id: u,
			ref: t,
			role: "switch",
			type: "checkbox",
			...l.primary,
			disabled: i && !a,
			...a && { "aria-disabled": !0 }
		},
		elementType: "input"
	});
	return p.onChange = Ri(p.onChange, (e) => s?.(e, { checked: e.currentTarget.checked })), p.onClick = Ri(p.onClick, (e) => {
		a && e.preventDefault();
	}), p.onKeyDown = Ri(p.onKeyDown, (e) => {
		a && (e.key === " " || e.key === "Enter") && e.preventDefault();
	}), {
		disabledFocusable: a,
		labelPosition: o,
		components: {
			root: "div",
			indicator: "div",
			input: "input",
			label: "label"
		},
		root: d,
		indicator: f,
		input: p,
		label: nr(e.label, {
			defaultProps: {
				disabled: i || a,
				htmlFor: u,
				required: c
			},
			elementType: "label"
		})
	};
}, Q_ = (e) => {
	let { labelPosition: t } = e;
	return /*#__PURE__*/ ta(e.root, { children: [
		/*#__PURE__*/ L(e.input, {}),
		t !== "after" && e.label && /*#__PURE__*/ L(e.label, {}),
		/*#__PURE__*/ L(e.indicator, {}),
		t === "after" && e.label && /*#__PURE__*/ L(e.label, {})
	] });
}, $_ = {
	root: "fui-Switch",
	indicator: "fui-Switch__indicator",
	input: "fui-Switch__input",
	label: "fui-Switch__label"
};
$_.root;
var ev = /*#__PURE__*/ Jn("r2i81i2", "rofhmb8", {
	r: [
		".r2i81i2{align-items:flex-start;box-sizing:border-box;display:inline-flex;position:relative;}",
		".r2i81i2:focus{outline-style:none;}",
		".r2i81i2:focus-visible{outline-style:none;}",
		".r2i81i2[data-fui-focus-within]:focus-within{border-top-color:transparent;border-right-color:transparent;border-bottom-color:transparent;border-left-color:transparent;}",
		".r2i81i2[data-fui-focus-within]:focus-within::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid var(--colorStrokeFocus2);border-radius:var(--borderRadiusMedium);top:calc(2px * -1);right:calc(2px * -1);bottom:calc(2px * -1);left:calc(2px * -1);}",
		".rofhmb8{align-items:flex-start;box-sizing:border-box;display:inline-flex;position:relative;}",
		".rofhmb8:focus{outline-style:none;}",
		".rofhmb8:focus-visible{outline-style:none;}",
		".rofhmb8[data-fui-focus-within]:focus-within{border-top-color:transparent;border-left-color:transparent;border-bottom-color:transparent;border-right-color:transparent;}",
		".rofhmb8[data-fui-focus-within]:focus-within::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid var(--colorStrokeFocus2);border-radius:var(--borderRadiusMedium);top:calc(2px * -1);left:calc(2px * -1);bottom:calc(2px * -1);right:calc(2px * -1);}"
	],
	s: ["@media (forced-colors: active){.r2i81i2[data-fui-focus-within]:focus-within::after{border-top-color:Highlight;border-right-color:Highlight;border-bottom-color:Highlight;border-left-color:Highlight;}}", "@media (forced-colors: active){.rofhmb8[data-fui-focus-within]:focus-within::after{border-top-color:Highlight;border-left-color:Highlight;border-bottom-color:Highlight;border-right-color:Highlight;}}"]
}), tv = /*#__PURE__*/ F({ vertical: { Beiy3e4: "f1vx9l62" } }, { d: [".f1vx9l62{flex-direction:column;}"] }), nv = /*#__PURE__*/ Jn("r1c3hft5", null, {
	r: [".r1c3hft5{border-radius:var(--borderRadiusCircular);border:1px solid;line-height:0;box-sizing:border-box;fill:currentColor;flex-shrink:0;font-size:18px;height:20px;margin:var(--spacingVerticalS) var(--spacingHorizontalS);pointer-events:none;transition-duration:var(--durationNormal);transition-timing-function:var(--curveEasyEase);transition-property:background,border,color;width:40px;}", ".r1c3hft5>*{transition-duration:var(--durationNormal);transition-timing-function:var(--curveEasyEase);transition-property:transform;}"],
	s: [
		"@media screen and (prefers-reduced-motion: reduce){.r1c3hft5{transition-duration:0.01ms;}}",
		"@media (forced-colors: active){.r1c3hft5{color:CanvasText;}.r1c3hft5>i{forced-color-adjust:none;}}",
		"@media screen and (prefers-reduced-motion: reduce){.r1c3hft5>*{transition-duration:0.01ms;}}"
	]
}), rv = /*#__PURE__*/ F({
	labelAbove: { B6of3ja: "f1hu3pq6" },
	sizeSmall: {
		Be2twd7: "fses1vf",
		Bqenvij: "fd461yt",
		a9b677: "f1szoe96"
	}
}, { d: [
	".f1hu3pq6{margin-top:0;}",
	".fses1vf{font-size:14px;}",
	".fd461yt{height:16px;}",
	".f1szoe96{width:32px;}"
] }), iv = /*#__PURE__*/ Jn("r12ojtgy", "rhc0e9x", {
	r: [
		".r12ojtgy{box-sizing:border-box;cursor:pointer;height:100%;margin:0;opacity:0;position:absolute;width:calc(40px + 2 * var(--spacingHorizontalS));}",
		".r12ojtgy:checked~.fui-Switch__indicator>*{transform:translateX(20px);}",
		".r12ojtgy:disabled,.r12ojtgy[aria-disabled=\"true\"]{cursor:default;}",
		".r12ojtgy:disabled~.fui-Switch__indicator,.r12ojtgy[aria-disabled=\"true\"]~.fui-Switch__indicator{color:var(--colorNeutralForegroundDisabled);}",
		".r12ojtgy:disabled~.fui-Switch__label,.r12ojtgy[aria-disabled=\"true\"]~.fui-Switch__label{cursor:default;color:var(--colorNeutralForegroundDisabled);}",
		".r12ojtgy:enabled:not(:checked):not([aria-disabled=\"true\"])~.fui-Switch__indicator{color:var(--colorNeutralStrokeAccessible);border-color:var(--colorNeutralStrokeAccessible);}",
		".r12ojtgy:enabled:not(:checked):not([aria-disabled=\"true\"])~.fui-Switch__label{color:var(--colorNeutralForeground1);}",
		".r12ojtgy:enabled:not(:checked):not([aria-disabled=\"true\"]):hover~.fui-Switch__indicator{color:var(--colorNeutralStrokeAccessibleHover);border-color:var(--colorNeutralStrokeAccessibleHover);}",
		".r12ojtgy:enabled:not(:checked):not([aria-disabled=\"true\"]):hover:active~.fui-Switch__indicator{color:var(--colorNeutralStrokeAccessiblePressed);border-color:var(--colorNeutralStrokeAccessiblePressed);}",
		".r12ojtgy:enabled:checked:not([aria-disabled=\"true\"])~.fui-Switch__indicator{background-color:var(--colorCompoundBrandBackground);color:var(--colorNeutralForegroundInverted);border-color:var(--colorTransparentStroke);}",
		".r12ojtgy:enabled:checked:not([aria-disabled=\"true\"]):hover~.fui-Switch__indicator{background-color:var(--colorCompoundBrandBackgroundHover);border-color:var(--colorTransparentStrokeInteractive);}",
		".r12ojtgy:enabled:checked:not([aria-disabled=\"true\"]):hover:active~.fui-Switch__indicator{background-color:var(--colorCompoundBrandBackgroundPressed);border-color:var(--colorTransparentStrokeInteractive);}",
		".r12ojtgy:disabled:not(:checked)~.fui-Switch__indicator,.r12ojtgy[aria-disabled=\"true\"]:not(:checked)~.fui-Switch__indicator{border-color:var(--colorNeutralStrokeDisabled);}",
		".r12ojtgy:disabled:checked~.fui-Switch__indicator,.r12ojtgy[aria-disabled=\"true\"]:checked~.fui-Switch__indicator{background-color:var(--colorNeutralBackgroundDisabled);border-color:var(--colorTransparentStrokeDisabled);}",
		".rhc0e9x{box-sizing:border-box;cursor:pointer;height:100%;margin:0;opacity:0;position:absolute;width:calc(40px + 2 * var(--spacingHorizontalS));}",
		".rhc0e9x:checked~.fui-Switch__indicator>*{transform:translateX(-20px);}",
		".rhc0e9x:disabled,.rhc0e9x[aria-disabled=\"true\"]{cursor:default;}",
		".rhc0e9x:disabled~.fui-Switch__indicator,.rhc0e9x[aria-disabled=\"true\"]~.fui-Switch__indicator{color:var(--colorNeutralForegroundDisabled);}",
		".rhc0e9x:disabled~.fui-Switch__label,.rhc0e9x[aria-disabled=\"true\"]~.fui-Switch__label{cursor:default;color:var(--colorNeutralForegroundDisabled);}",
		".rhc0e9x:enabled:not(:checked):not([aria-disabled=\"true\"])~.fui-Switch__indicator{color:var(--colorNeutralStrokeAccessible);border-color:var(--colorNeutralStrokeAccessible);}",
		".rhc0e9x:enabled:not(:checked):not([aria-disabled=\"true\"])~.fui-Switch__label{color:var(--colorNeutralForeground1);}",
		".rhc0e9x:enabled:not(:checked):not([aria-disabled=\"true\"]):hover~.fui-Switch__indicator{color:var(--colorNeutralStrokeAccessibleHover);border-color:var(--colorNeutralStrokeAccessibleHover);}",
		".rhc0e9x:enabled:not(:checked):not([aria-disabled=\"true\"]):hover:active~.fui-Switch__indicator{color:var(--colorNeutralStrokeAccessiblePressed);border-color:var(--colorNeutralStrokeAccessiblePressed);}",
		".rhc0e9x:enabled:checked:not([aria-disabled=\"true\"])~.fui-Switch__indicator{background-color:var(--colorCompoundBrandBackground);color:var(--colorNeutralForegroundInverted);border-color:var(--colorTransparentStroke);}",
		".rhc0e9x:enabled:checked:not([aria-disabled=\"true\"]):hover~.fui-Switch__indicator{background-color:var(--colorCompoundBrandBackgroundHover);border-color:var(--colorTransparentStrokeInteractive);}",
		".rhc0e9x:enabled:checked:not([aria-disabled=\"true\"]):hover:active~.fui-Switch__indicator{background-color:var(--colorCompoundBrandBackgroundPressed);border-color:var(--colorTransparentStrokeInteractive);}",
		".rhc0e9x:disabled:not(:checked)~.fui-Switch__indicator,.rhc0e9x[aria-disabled=\"true\"]:not(:checked)~.fui-Switch__indicator{border-color:var(--colorNeutralStrokeDisabled);}",
		".rhc0e9x:disabled:checked~.fui-Switch__indicator,.rhc0e9x[aria-disabled=\"true\"]:checked~.fui-Switch__indicator{background-color:var(--colorNeutralBackgroundDisabled);border-color:var(--colorTransparentStrokeDisabled);}"
	],
	s: ["@media (forced-colors: active){.r12ojtgy:disabled~.fui-Switch__indicator,.r12ojtgy[aria-disabled=\"true\"]~.fui-Switch__indicator{color:GrayText;border-color:GrayText;}.r12ojtgy:disabled~.fui-Switch__label,.r12ojtgy[aria-disabled=\"true\"]~.fui-Switch__label{color:GrayText;}.r12ojtgy:hover{color:CanvasText;}.r12ojtgy:hover:active{color:CanvasText;}.r12ojtgy:enabled:checked:not([aria-disabled=\"true\"]):hover~.fui-Switch__indicator{background-color:Highlight;color:Canvas;}.r12ojtgy:enabled:checked:not([aria-disabled=\"true\"]):hover:active~.fui-Switch__indicator{background-color:Highlight;color:Canvas;}.r12ojtgy:enabled:checked:not([aria-disabled=\"true\"])~.fui-Switch__indicator{background-color:Highlight;color:Canvas;}}", "@media (forced-colors: active){.rhc0e9x:disabled~.fui-Switch__indicator,.rhc0e9x[aria-disabled=\"true\"]~.fui-Switch__indicator{color:GrayText;border-color:GrayText;}.rhc0e9x:disabled~.fui-Switch__label,.rhc0e9x[aria-disabled=\"true\"]~.fui-Switch__label{color:GrayText;}.rhc0e9x:hover{color:CanvasText;}.rhc0e9x:hover:active{color:CanvasText;}.rhc0e9x:enabled:checked:not([aria-disabled=\"true\"]):hover~.fui-Switch__indicator{background-color:Highlight;color:Canvas;}.rhc0e9x:enabled:checked:not([aria-disabled=\"true\"]):hover:active~.fui-Switch__indicator{background-color:Highlight;color:Canvas;}.rhc0e9x:enabled:checked:not([aria-disabled=\"true\"])~.fui-Switch__indicator{background-color:Highlight;color:Canvas;}}"]
}), av = /*#__PURE__*/ F({
	before: {
		j35jbq: ["f1e31b4d", "f1vgc2s3"],
		Bhzewxz: "f15twtuk"
	},
	after: {
		oyh7mz: ["f1vgc2s3", "f1e31b4d"],
		Bhzewxz: "f15twtuk"
	},
	above: {
		B5kzvoi: "f1yab3r1",
		Bqenvij: "f1aar7gd",
		a9b677: "fly5x3f"
	},
	sizeSmall: {
		a9b677: "f83td6f",
		oedwrj: ["f1t5zc5r", "fmy58zi"]
	}
}, { d: [
	".f1e31b4d{right:0;}",
	".f1vgc2s3{left:0;}",
	".f15twtuk{top:0;}",
	".f1yab3r1{bottom:0;}",
	".f1aar7gd{height:calc(20px + var(--spacingVerticalS));}",
	".fly5x3f{width:100%;}",
	".f83td6f{width:calc(32px + 2 * var(--spacingHorizontalS));}",
	".f1t5zc5r:checked~.fui-Switch__indicator>*{transform:translateX(16px);}",
	".fmy58zi:checked~.fui-Switch__indicator>*{transform:translateX(-16px);}"
] }), ov = /*#__PURE__*/ F({
	base: {
		Bceei9c: "f1k6fduh",
		jrapky: "f49ad5g",
		B6of3ja: "f1xlvstr",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1f5q0n8"
	},
	sizeSmall: {
		Be2twd7: "fy9rknc",
		Bg96gwp: "fwrc4pm",
		jrapky: "f1suqah5",
		B6of3ja: "f26bnac"
	},
	above: {
		z8tnut: "f1ywm7hm",
		Byoj8tv: "f14wxoun",
		a9b677: "fly5x3f"
	},
	after: { uwmqm3: ["fruq291", "f7x41pl"] },
	before: { z189sj: ["f7x41pl", "fruq291"] }
}, { d: [
	".f1k6fduh{cursor:pointer;}",
	".f49ad5g{margin-bottom:calc((20px - var(--lineHeightBase300)) / 2);}",
	".f1xlvstr{margin-top:calc((20px - var(--lineHeightBase300)) / 2);}",
	[".f1f5q0n8{padding:var(--spacingVerticalS) var(--spacingHorizontalS);}", { p: -1 }],
	".fy9rknc{font-size:var(--fontSizeBase200);}",
	".fwrc4pm{line-height:var(--lineHeightBase200);}",
	".f1suqah5{margin-bottom:calc((16px - var(--lineHeightBase200)) / 2);}",
	".f26bnac{margin-top:calc((16px - var(--lineHeightBase200)) / 2);}",
	".f1ywm7hm{padding-top:var(--spacingVerticalXS);}",
	".f14wxoun{padding-bottom:var(--spacingVerticalXS);}",
	".fly5x3f{width:100%;}",
	".fruq291{padding-left:var(--spacingHorizontalXS);}",
	".f7x41pl{padding-right:var(--spacingHorizontalXS);}"
] }), sv = (e) => {
	let t = ev(), n = tv(), r = nv(), i = rv(), a = iv(), o = av(), s = ov(), { label: c, labelPosition: l, size: u } = e;
	return e.root.className = O($_.root, t, l === "above" && n.vertical, e.root.className), e.indicator.className = O($_.indicator, r, c && l === "above" && i.labelAbove, u === "small" && i.sizeSmall, e.indicator.className), e.input.className = O($_.input, a, c && o[l], u === "small" && o.sizeSmall, e.input.className), e.label && (e.label.className = O($_.label, s.base, s[l], u === "small" && s.sizeSmall, e.label.className)), e;
}, cv = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = X_(e, t);
	return sv(n), ii("useSwitchStyles_unstable")(n), Q_(n);
});
cv.displayName = "Switch";
//#endregion
//#region node_modules/@fluentui/react-text/lib/components/Text/useText.js
var lv = (e, t) => {
	let { wrap: n, truncate: r, block: i, italic: a, underline: o, strikethrough: s, size: c, font: l, weight: u, align: d } = e;
	return {
		align: d ?? "start",
		block: i ?? !1,
		font: l ?? "base",
		italic: a ?? !1,
		size: c ?? 300,
		strikethrough: s ?? !1,
		truncate: r ?? !1,
		underline: o ?? !1,
		weight: u ?? "regular",
		wrap: n ?? !0,
		components: { root: "span" },
		root: tr(Ir("span", {
			ref: t,
			...e
		}), { elementType: "span" })
	};
}, uv = (e) => /*#__PURE__*/ L(e.root, {}), dv = { root: "fui-Text" }, fv = /*#__PURE__*/ F({
	root: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fkhj508",
		Bg96gwp: "f1i3iumi",
		Bhrd7zp: "figsok6",
		fsow6f: "fpgzoln",
		mc9l5x: "f1w7gpdv",
		Huce71: "f6juhto",
		B68tc82: 0,
		Bmxbyg5: 0,
		Bpg54ce: "f1gl81tg",
		ygn44y: "f2jf649"
	},
	nowrap: {
		Huce71: "fz5stix",
		B68tc82: 0,
		Bmxbyg5: 0,
		Bpg54ce: "f1a3p1vp"
	},
	truncate: { ygn44y: "f1cmbuwj" },
	block: { mc9l5x: "ftgm304" },
	italic: { B80ckks: "f1j4dglz" },
	underline: { w71qe1: "f13mvf36" },
	strikethrough: { w71qe1: "fv5q2k7" },
	strikethroughUnderline: { w71qe1: "f1drk4o6" },
	base100: {
		Be2twd7: "f13mqy1h",
		Bg96gwp: "fcpl73t"
	},
	base200: {
		Be2twd7: "fy9rknc",
		Bg96gwp: "fwrc4pm"
	},
	base400: {
		Be2twd7: "fod5ikn",
		Bg96gwp: "faaz57k"
	},
	base500: {
		Be2twd7: "f1pp30po",
		Bg96gwp: "f106mvju"
	},
	base600: {
		Be2twd7: "f1x0m3f5",
		Bg96gwp: "fb86gi6"
	},
	hero700: {
		Be2twd7: "fojgt09",
		Bg96gwp: "fcen8rp"
	},
	hero800: {
		Be2twd7: "fccw675",
		Bg96gwp: "f1ebx5kk"
	},
	hero900: {
		Be2twd7: "f15afnhw",
		Bg96gwp: "fr3w3wp"
	},
	hero1000: {
		Be2twd7: "fpyltcb",
		Bg96gwp: "f1ivgwrt"
	},
	monospace: { Bahqtrf: "f1fedwem" },
	numeric: { Bahqtrf: "f1uq0ln5" },
	weightMedium: { Bhrd7zp: "fdj6btp" },
	weightSemibold: { Bhrd7zp: "fl43uef" },
	weightBold: { Bhrd7zp: "flh3ekv" },
	alignCenter: { fsow6f: "f17mccla" },
	alignEnd: { fsow6f: "f12ymhq5" },
	alignJustify: { fsow6f: "f1j59e10" }
}, { d: [
	".fk6fouc{font-family:var(--fontFamilyBase);}",
	".fkhj508{font-size:var(--fontSizeBase300);}",
	".f1i3iumi{line-height:var(--lineHeightBase300);}",
	".figsok6{font-weight:var(--fontWeightRegular);}",
	".fpgzoln{text-align:start;}",
	".f1w7gpdv{display:inline;}",
	".f6juhto{white-space:normal;}",
	[".f1gl81tg{overflow:visible;}", { p: -1 }],
	".f2jf649{text-overflow:clip;}",
	".fz5stix{white-space:nowrap;}",
	[".f1a3p1vp{overflow:hidden;}", { p: -1 }],
	".f1cmbuwj{text-overflow:ellipsis;}",
	".ftgm304{display:block;}",
	".f1j4dglz{font-style:italic;}",
	".f13mvf36{text-decoration-line:underline;}",
	".fv5q2k7{text-decoration-line:line-through;}",
	".f1drk4o6{text-decoration-line:line-through underline;}",
	".f13mqy1h{font-size:var(--fontSizeBase100);}",
	".fcpl73t{line-height:var(--lineHeightBase100);}",
	".fy9rknc{font-size:var(--fontSizeBase200);}",
	".fwrc4pm{line-height:var(--lineHeightBase200);}",
	".fod5ikn{font-size:var(--fontSizeBase400);}",
	".faaz57k{line-height:var(--lineHeightBase400);}",
	".f1pp30po{font-size:var(--fontSizeBase500);}",
	".f106mvju{line-height:var(--lineHeightBase500);}",
	".f1x0m3f5{font-size:var(--fontSizeBase600);}",
	".fb86gi6{line-height:var(--lineHeightBase600);}",
	".fojgt09{font-size:var(--fontSizeHero700);}",
	".fcen8rp{line-height:var(--lineHeightHero700);}",
	".fccw675{font-size:var(--fontSizeHero800);}",
	".f1ebx5kk{line-height:var(--lineHeightHero800);}",
	".f15afnhw{font-size:var(--fontSizeHero900);}",
	".fr3w3wp{line-height:var(--lineHeightHero900);}",
	".fpyltcb{font-size:var(--fontSizeHero1000);}",
	".f1ivgwrt{line-height:var(--lineHeightHero1000);}",
	".f1fedwem{font-family:var(--fontFamilyMonospace);}",
	".f1uq0ln5{font-family:var(--fontFamilyNumeric);}",
	".fdj6btp{font-weight:var(--fontWeightMedium);}",
	".fl43uef{font-weight:var(--fontWeightSemibold);}",
	".flh3ekv{font-weight:var(--fontWeightBold);}",
	".f17mccla{text-align:center;}",
	".f12ymhq5{text-align:end;}",
	".f1j59e10{text-align:justify;}"
] }), pv = (e) => {
	let t = fv();
	return e.root.className = O(dv.root, t.root, e.wrap === !1 && t.nowrap, e.truncate && t.truncate, e.block && t.block, e.italic && t.italic, e.underline && t.underline, e.strikethrough && t.strikethrough, e.underline && e.strikethrough && t.strikethroughUnderline, e.size === 100 && t.base100, e.size === 200 && t.base200, e.size === 400 && t.base400, e.size === 500 && t.base500, e.size === 600 && t.base600, e.size === 700 && t.hero700, e.size === 800 && t.hero800, e.size === 900 && t.hero900, e.size === 1e3 && t.hero1000, e.font === "monospace" && t.monospace, e.font === "numeric" && t.numeric, e.weight === "medium" && t.weightMedium, e.weight === "semibold" && t.weightSemibold, e.weight === "bold" && t.weightBold, e.align === "center" && t.alignCenter, e.align === "end" && t.alignEnd, e.align === "justify" && t.alignJustify, e.root.className), e;
}, mv = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = lv(e, t);
	return pv(n), ii("useTextStyles_unstable")(n), uv(n);
});
mv.displayName = "Text";
//#endregion
//#region node_modules/@fluentui/react-progress/lib/utils/clampMax.js
var hv = (e) => e <= 0 ? 1 : e, gv = (e, t) => e === void 0 ? e : e < 0 ? 0 : e > t ? t : e, _v = Nu({
	keyframes: [{ translate: "-100%" }, { translate: "300%" }],
	duration: 3e3,
	iterations: Infinity,
	easing: vu.curveLinear,
	reducedMotion: {
		keyframes: [
			{ opacity: .2 },
			{ opacity: 1 },
			{ opacity: .2 }
		],
		duration: 3e3,
		iterations: Infinity
	}
}), vv = (e, t) => {
	let n = Lm()?.validationState, { color: r = n === "error" || n === "warning" || n === "success" ? n : "brand", shape: i = "rounded", thickness: a = "medium", indeterminateMotion: o, ...s } = e, c = yv(s, t);
	return {
		...c,
		components: {
			...c.components,
			indeterminateMotion: _v
		},
		color: r,
		shape: i,
		thickness: a,
		indeterminateMotion: c.value === void 0 ? Hu(o, {
			elementType: _v,
			defaultProps: {}
		}) : void 0
	};
}, yv = (e, t) => {
	let n = Lm(), r = hv(e.max ?? 1), i = gv(e.value, r), a = tr(Ir("div", {
		ref: t,
		role: "progressbar",
		"aria-valuemin": i === void 0 ? void 0 : 0,
		"aria-valuemax": i === void 0 ? void 0 : r,
		"aria-valuenow": i,
		"aria-labelledby": n?.labelId,
		...e
	}), { elementType: "div" });
	return n && (n.validationMessageId || n.hintId) && (a["aria-describedby"] = [
		n?.validationMessageId,
		n?.hintId,
		a["aria-describedby"]
	].filter(Boolean).join(" ")), {
		max: r,
		value: i,
		components: {
			root: "div",
			bar: "div",
			indeterminateMotion: "div"
		},
		root: a,
		bar: tr(e.bar, { elementType: "div" })
	};
}, bv = (e) => /*#__PURE__*/ L(e.root, { children: e.bar && (e.indeterminateMotion ? /*#__PURE__*/ L(e.indeterminateMotion, { children: /*#__PURE__*/ L(e.bar, {}) }) : /*#__PURE__*/ L(e.bar, {})) }), xv = {
	root: "fui-ProgressBar",
	bar: "fui-ProgressBar__bar"
}, Sv = .01, Cv = /*#__PURE__*/ F({
	root: {
		mc9l5x: "ftgm304",
		De3pzq: "f18f03hv",
		a9b677: "fly5x3f",
		B68tc82: 0,
		Bmxbyg5: 0,
		Bpg54ce: "f1a3p1vp",
		Bomf52o: "f1skxd4g"
	},
	rounded: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "ft85np5"
	},
	square: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "f1fabniw"
	},
	medium: { Bqenvij: "f4t8t6x" },
	large: { Bqenvij: "f6ywr7j" }
}, {
	d: [
		".ftgm304{display:block;}",
		".f18f03hv{background-color:var(--colorNeutralBackground6);}",
		".fly5x3f{width:100%;}",
		[".f1a3p1vp{overflow:hidden;}", { p: -1 }],
		[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		[".f1fabniw{border-radius:var(--borderRadiusNone);}", { p: -1 }],
		".f4t8t6x{height:2px;}",
		".f6ywr7j{height:4px;}"
	],
	m: [["@media screen and (forced-colors: active){.f1skxd4g{background-color:CanvasText;}}", { m: "screen and (forced-colors: active)" }]]
}), wv = /*#__PURE__*/ F({
	base: {
		Bomf52o: "f1tnpuu0",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "f12b9xdw",
		Bqenvij: "f1l02sjl"
	},
	nonZeroDeterminate: {
		Bmy1vo4: "fjt6zfz",
		B3o57yi: "f1wofebd",
		Bkqvd7p: "fv71qf3"
	},
	indeterminate: {
		B2u0y6b: "fa0wk36",
		qhf8xq: "f10pi13n",
		Bcmaq0h: ["fpo0yib", "f1u5hf6c"],
		jpy9cc: "f3z2g5w"
	},
	brand: { De3pzq: "ftywsgz" },
	error: { De3pzq: "fdl5y0r" },
	warning: { De3pzq: "f1s438gw" },
	success: { De3pzq: "flxk52p" }
}, {
	m: [["@media screen and (forced-colors: active){.f1tnpuu0{background-color:Highlight;}}", { m: "screen and (forced-colors: active)" }], ["@media screen and (prefers-reduced-motion: reduce){.f3z2g5w{max-width:100%;}}", { m: "screen and (prefers-reduced-motion: reduce)" }]],
	d: [
		[".f12b9xdw{border-radius:inherit;}", { p: -1 }],
		".f1l02sjl{height:100%;}",
		".fjt6zfz{transition-property:width;}",
		".f1wofebd{transition-duration:0.3s;}",
		".fv71qf3{transition-timing-function:ease;}",
		".fa0wk36{max-width:33%;}",
		".f10pi13n{position:relative;}",
		".fpo0yib{background-image:linear-gradient(\n      to right,\n      var(--colorNeutralBackground6) 0%,\n      var(--colorTransparentBackground) 50%,\n      var(--colorNeutralBackground6) 100%\n    );}",
		".f1u5hf6c{background-image:linear-gradient(\n      to left,\n      var(--colorNeutralBackground6) 0%,\n      var(--colorTransparentBackground) 50%,\n      var(--colorNeutralBackground6) 100%\n    );}",
		".ftywsgz{background-color:var(--colorCompoundBrandBackground);}",
		".fdl5y0r{background-color:var(--colorPaletteRedBackground3);}",
		".f1s438gw{background-color:var(--colorPaletteDarkOrangeBackground3);}",
		".flxk52p{background-color:var(--colorPaletteGreenBackground3);}"
	]
}), Tv = (e) => {
	let { color: t, max: n, shape: r, thickness: i, value: a } = e, o = Cv(), s = wv();
	return e.root.className = O(xv.root, o.root, o[r], o[i], e.root.className), e.bar && (e.bar.className = O(xv.bar, s.base, s.brand, a === void 0 && s.indeterminate, a !== void 0 && a > Sv && s.nonZeroDeterminate, t && a !== void 0 && s[t], e.bar.className)), e.bar && a !== void 0 && (e.bar.style = {
		width: Math.min(100, Math.max(0, a / n * 100)) + "%",
		...e.bar.style
	}), e;
}, Ev = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = vv(e, t);
	return Tv(n), ii("useProgressBarStyles_unstable")(n), bv(n);
});
Ev.displayName = "ProgressBar";
//#endregion
//#region public/plugins/_shared/theme.js
var Dv = _(), Ov = {
	background: "colorNeutralBackground1",
	foreground: "colorNeutralForeground1",
	muted: "colorNeutralForeground2",
	accent: "colorBrandBackground"
};
function kv() {
	return (typeof window < "u" && window.matchMedia?.("(prefers-color-scheme: light)"))?.matches ? "light" : "dark";
}
function Av(e) {
	let t = e && typeof e == "object" ? e : {}, n = t.colorScheme === "light" ? "light" : t.colorScheme === "dark" ? "dark" : kv(), r = n === "light" ? dl : pl, i = {};
	for (let [e, n] of Object.entries(t)) {
		if (typeof n != "string" || !n || e === "colorScheme") continue;
		let t = Ov[e];
		t ? i[t] = n : Object.prototype.hasOwnProperty.call(r, e) && (i[e] = n);
	}
	return {
		theme: Object.keys(i).length > 0 ? {
			...r,
			...i
		} : r,
		scheme: n
	};
}
function jv(e) {
	if (!e || typeof e != "object") return null;
	let t = String(e.background || "");
	return {
		colorScheme: (() => {
			let e = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(t);
			if (e) return (Number(e[1]) + Number(e[2]) + Number(e[3])) / 3 / 255;
			let n = /#([0-9a-f]{6})/i.exec(t);
			if (n) {
				let e = parseInt(n[1].slice(0, 2), 16), t = parseInt(n[1].slice(2, 4), 16), r = parseInt(n[1].slice(4, 6), 16);
				return (e + t + r) / 3 / 255;
			}
			return 0;
		})() > .5 ? "light" : "dark",
		background: e.background,
		foreground: e.foreground,
		muted: e.muted,
		accent: e.accent
	};
}
//#endregion
//#region public/plugins/_shared/host.js
var Mv = {
	init: null,
	legacyTheme: null,
	started: !1
};
function Nv() {
	Mv.started || (Mv.started = !0, e.onInit((e) => {
		Mv.init ||= e;
	}), window.addEventListener("message", (e) => {
		let t = e.data;
		t && t.type === "wtsl:init" && t.theme && (Mv.legacyTheme ||= t.theme);
	}));
}
function Pv() {
	return Mv.init;
}
function Fv(e) {
	return Mv.init?.theme ? Mv.init.theme : Mv.legacyTheme && jv(Mv.legacyTheme) || { colorScheme: e };
}
function Iv(e) {
	let t = Mv.init?.config;
	if (t && typeof t == "object") return t[e];
}
var Lv = "(prefers-color-scheme: light)";
function Rv() {
	return typeof window > "u" || typeof window.matchMedia != "function" ? "dark" : window.matchMedia(Lv).matches ? "light" : "dark";
}
function zv(t = "dark") {
	let [n, r] = (0, N.useState)(() => Fv(t)), [i, a] = (0, N.useState)(Rv);
	(0, N.useEffect)(() => e.onTheme((e) => {
		e && typeof e == "object" && r(e);
	}), []), (0, N.useEffect)(() => {
		if (e.inHost || typeof window.matchMedia != "function") return;
		let t = window.matchMedia(Lv), n = () => a(t.matches ? "light" : "dark");
		return typeof t.addEventListener == "function" ? (t.addEventListener("change", n), () => t.removeEventListener("change", n)) : (t.addListener(n), () => t.removeListener(n));
	}, []);
	let o = e.inHost ? n : {
		...n,
		colorScheme: i
	}, s = (0, N.useMemo)(() => Av(o), [o]);
	return (0, N.useEffect)(() => {
		typeof document < "u" && (document.documentElement.style.colorScheme = s.scheme, document.body && (document.body.style.colorScheme = s.scheme));
	}, [s.scheme]), s;
}
function Bv(t, n) {
	let r = (0, N.useRef)(t);
	r.current = t;
	let [i, a] = (0, N.useState)(() => {
		let e = Mv.init?.size;
		return Array.isArray(e) ? r.current(e) : n;
	});
	return (0, N.useEffect)(() => e.onResize((e) => {
		Array.isArray(e) && e.length === 2 && a(r.current(e));
	}), []), i;
}
function Vv(t, n, r) {
	let i = (0, N.useRef)(r);
	i.current = r;
	let [a, o] = (0, N.useState)(() => {
		let e = Iv(t);
		return i.current ? i.current(e) : e ?? n;
	}), [s, c] = (0, N.useState)(() => Iv(t) !== void 0);
	(0, N.useEffect)(() => {
		if (Iv(t) !== void 0) {
			c(!0);
			return;
		}
		let r = !0;
		return e.getConfig(t).then((e) => {
			r && (o(i.current ? i.current(e) : e ?? n), c(!0));
		}).catch(() => {
			r && c(!0);
		}), () => {
			r = !1;
		};
	}, [t]);
	let l = (0, N.useCallback)((n) => {
		o((r) => {
			let i = typeof n == "function" ? n(r) : n;
			return e.setConfig(t, i).catch(() => {}), i;
		});
	}, [t]);
	return (0, N.useEffect)(() => {
		let r = `plugin.${e.pluginId}.${t}`, a = (a) => {
			(a.key === r || a.key === null) && e.getConfig(t).then((e) => {
				o(i.current ? i.current(e) : e ?? n);
			}).catch(() => {});
		};
		return window.addEventListener("storage", a), () => window.removeEventListener("storage", a);
	}, [t]), [
		a,
		l,
		s
	];
}
function Hv() {
	let e = new URLSearchParams(location.search);
	return e.get("view") || (e.get("settings") === "1" ? "settings" : null);
}
function Uv(e, t) {
	window.parent.postMessage({
		type: "plugin:request-overlay",
		payload: {
			view: e,
			title: t
		}
	}, "*");
}
function Wv(e = "设置") {
	Uv("settings", e);
}
typeof window < "u" && Hv() && window.addEventListener("keydown", (e) => {
	e.key === "Escape" && (e.preventDefault(), window.parent.postMessage({ type: "plugin:request-overlay-close" }, "*"));
});
function Gv(e) {
	let t = (0, N.useRef)(e);
	t.current = e, (0, N.useEffect)(() => {
		let e = (e) => {
			if (e.source !== window.parent) return;
			let n = e.data;
			n && typeof n == "object" && n.type === "host:open-settings" && t.current();
		};
		return window.addEventListener("message", e), () => window.removeEventListener("message", e);
	}, []);
}
function Kv(t, n) {
	let r = (0, N.useRef)(n);
	r.current = n;
	let i = (0, N.useRef)(t);
	(0, N.useEffect)(() => (e.ready(i.current), e.onToolCall(async (t) => {
		if (!t || typeof t.name != "string") return;
		let n = r.current?.[t.name];
		try {
			if (!n) {
				e.toolResult(t.id, !1, `未知工具：${t.name}`);
				return;
			}
			let r = await n(t.args);
			e.toolResult(t.id, !0, r);
		} catch (n) {
			e.toolResult(t.id, !1, n instanceof Error ? n.message : String(n));
		}
	})), []);
}
//#endregion
//#region public/plugins/_shared/typography.js
var qv = {
	48: {
		fontSize: "48px",
		lineHeight: "56px"
	},
	80: {
		fontSize: "80px",
		lineHeight: "88px"
	},
	96: {
		fontSize: "96px",
		lineHeight: "104px"
	},
	112: {
		fontSize: "112px",
		lineHeight: "124px"
	}
};
function Jv(e) {
	let t = qv[e];
	if (!t) throw Error(`Display XL 只定义了 48/80/96/112，收到 ${String(e)}`);
	return t;
}
var Yv = { fontVariantNumeric: "tabular-nums" }, Xv = {
	"1x1": [1, 1],
	"2x1": [2, 1],
	"2x2": [2, 2],
	"3x2": [3, 2]
};
function Zv(e) {
	if (!Array.isArray(e) || e.length < 2) return "2x1";
	let t = `${Number(e[0])}x${Number(e[1])}`;
	return Xv[t] ? t : "2x1";
}
function Qv() {
	let e = new URLSearchParams(location.search).get("size"), t = /^(\d+)x(\d+)$/.exec(e || "");
	if (!t) return null;
	let n = `${Number(t[1])}x${Number(t[2])}`;
	return Xv[n] ? n : null;
}
//#endregion
//#region public/plugins/pomodoro/src/data/audio.js
var $v = .3, ey = .25, ty = [
	{
		id: "none",
		label: "无"
	},
	{
		id: "rain",
		label: "雨声"
	},
	{
		id: "cafe",
		label: "咖啡厅"
	},
	{
		id: "fan",
		label: "风扇"
	}
], ny = {
	ctx: null,
	gain: null,
	nodes: [],
	kind: "none"
};
function ry() {
	try {
		if (!ny.ctx) {
			let e = window.AudioContext || window.webkitAudioContext;
			if (!e) return null;
			ny.ctx = new e();
		}
		return ny.ctx.state === "suspended" && ny.ctx.resume().catch(() => {}), ny.ctx;
	} catch {
		return null;
	}
}
function iy() {
	ry();
}
function ay(e, t) {
	let n = Math.floor(e.sampleRate * 2), r = e.createBuffer(1, n, e.sampleRate), i = r.getChannelData(0), a = 0;
	for (let e = 0; e < n; e += 1) {
		let n = Math.random() * 2 - 1;
		t === "cafe" ? (a = (a + .02 * n) / 1.02, i[e] = a * 3.5) : t === "fan" ? (a = (a + .08 * n) / 1.08, i[e] = a * 2.5) : i[e] = n;
	}
	return r;
}
function oy(e = !1) {
	if (!ny.gain || !ny.ctx) return;
	let t = ny.ctx, n = ny.gain, r = ny.nodes, i = e ? .02 : ey;
	try {
		let e = t.currentTime;
		n.gain.cancelScheduledValues(e), n.gain.setValueAtTime(Math.max(n.gain.value, 1e-4), e), n.gain.linearRampToValueAtTime(1e-4, e + i);
	} catch {}
	ny.gain = null, ny.nodes = [], ny.kind = "none", window.setTimeout(() => {
		for (let e of r) try {
			e.stop?.(), e.disconnect?.();
		} catch {}
	}, e ? 60 : 330);
}
function sy(e, t) {
	if (e === "none") return;
	let n = ry();
	if (n) {
		oy(!0);
		try {
			let r = n.createBufferSource();
			r.buffer = ay(n, e), r.loop = !0;
			let i = n.createGain();
			i.gain.value = 1e-4;
			let a = r;
			if (e === "rain") {
				let e = n.createBiquadFilter();
				e.type = "highpass", e.frequency.value = 900;
				let t = n.createBiquadFilter();
				t.type = "lowpass", t.frequency.value = 7200, r.connect(e), e.connect(t), a = t;
			} else if (e === "cafe") {
				let e = n.createBiquadFilter();
				e.type = "bandpass", e.frequency.value = 520, e.Q.value = .6, r.connect(e), a = e;
			} else if (e === "fan") {
				let e = n.createBiquadFilter();
				e.type = "lowpass", e.frequency.value = 520, r.connect(e), a = e;
			}
			a.connect(i), i.connect(n.destination);
			let o = n.currentTime;
			i.gain.setValueAtTime(1e-4, o), i.gain.linearRampToValueAtTime(t / 100 * .25, o + $v), r.start(), ny.nodes = [r], ny.gain = i, ny.kind = e;
		} catch {
			oy(!0);
		}
	}
}
function cy() {
	oy(!1);
}
function ly(e) {
	if (ny.gain && ny.ctx) try {
		let t = ny.ctx.currentTime;
		ny.gain.gain.cancelScheduledValues(t), ny.gain.gain.setTargetAtTime(e / 100 * .25, t, .12);
	} catch {}
}
function uy() {
	let e = ry();
	if (e) try {
		let t = e.currentTime;
		for (let n of [{
			frequency: 880,
			offset: 0
		}, {
			frequency: 1174.66,
			offset: .16
		}]) {
			let r = e.createOscillator(), i = e.createGain();
			r.type = "sine", r.frequency.value = n.frequency;
			let a = t + n.offset;
			i.gain.setValueAtTime(1e-4, a), i.gain.exponentialRampToValueAtTime(.12, a + .02), i.gain.exponentialRampToValueAtTime(1e-4, a + .5), r.connect(i), i.connect(e.destination), r.start(a), r.stop(a + .55);
		}
	} catch {}
}
//#endregion
//#region public/plugins/pomodoro/src/data/timer.js
var dy = "settings", fy = "pomodoro.sessions", py = "pomodoro.runtime", my = 250, hy = 5e3, gy = {
	focus: {
		label: "专注",
		minutesKey: "focusMin"
	},
	shortBreak: {
		label: "短休",
		minutesKey: "shortBreakMin"
	},
	longBreak: {
		label: "长休",
		minutesKey: "longBreakMin"
	}
}, _y = {
	focusMin: 25,
	shortBreakMin: 5,
	longBreakMin: 15,
	roundsBeforeLongBreak: 4,
	autoStartNext: !1,
	sound: !0,
	keepAwake: !0,
	whiteNoise: "none",
	whiteNoiseVolume: 40
}, vy = new Map(ty.map((e) => [e.id, e])), yy = (e) => String(e).padStart(2, "0");
function by(e, t) {
	try {
		let n = localStorage.getItem(e);
		return n == null ? t : JSON.parse(n);
	} catch {
		return t;
	}
}
function xy(e, t) {
	try {
		localStorage.setItem(e, JSON.stringify(t));
	} catch {}
}
function Sy(e, t) {
	let n = Math.round(Number(e));
	return !Number.isFinite(n) || n <= 0 ? t : n;
}
function Cy(e) {
	let t = e && typeof e == "object" && !Array.isArray(e) ? e : {}, n = {
		..._y,
		...t
	};
	for (let e of [
		"focusMin",
		"shortBreakMin",
		"longBreakMin",
		"roundsBeforeLongBreak"
	]) n[e] = Sy(n[e], _y[e]);
	return n.autoStartNext = !!n.autoStartNext, n.sound = !!n.sound, n.keepAwake = !!n.keepAwake, n.whiteNoiseVolume = Math.min(100, Math.max(0, Math.round(Number(n.whiteNoiseVolume) || _y.whiteNoiseVolume))), vy.has(n.whiteNoise) || (n.whiteNoise = "none"), n;
}
function wy(e) {
	let t = Math.max(0, Math.ceil(e / 1e3)), n = Math.floor(t / 3600), r = Math.floor(t % 3600 / 60), i = t % 60;
	return n > 0 ? `${n}:${yy(r)}:${yy(i)}` : `${yy(r)}:${yy(i)}`;
}
function Ty(e) {
	return new Date(e.getFullYear(), e.getMonth(), e.getDate());
}
function Ey(e) {
	return `${e.getFullYear()}-${yy(e.getMonth() + 1)}-${yy(e.getDate())}`;
}
function Dy() {
	let e = by(fy, []);
	return Array.isArray(e) ? e.filter((e) => e && typeof e.id == "string" && gy[e.phase] && typeof e.startedAt == "string" && Number.isFinite(Number(e.durationMin))) : [];
}
function Oy(e) {
	xy(fy, e);
}
function ky(e, t) {
	return {
		id: `ps-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
		startedAt: (/* @__PURE__ */ new Date()).toISOString(),
		phase: e,
		durationMin: t,
		actualMs: 0,
		taskId: null,
		taskTitle: null
	};
}
function Ay(e) {
	return {
		phase: "focus",
		running: !1,
		totalMs: e.focusMin * 6e4,
		remainingMs: e.focusMin * 6e4,
		endsAt: 0,
		segmentStartedAt: 0,
		focusRound: 0,
		session: null
	};
}
function jy(e, t = "today") {
	let n = Ty(/* @__PURE__ */ new Date()), r = n;
	t === "week" ? r = new Date(n.getFullYear(), n.getMonth(), n.getDate() - 6) : t === "month" && (r = new Date(n.getFullYear(), n.getMonth(), 1));
	let i = e.filter((e) => {
		if (e.phase !== "focus" || !e.endedAt) return !1;
		let t = new Date(e.endedAt);
		return !Number.isNaN(t.getTime()) && t >= r;
	});
	return {
		range: t,
		completed: i.filter((e) => e.completed).length,
		focusMinutes: i.reduce((e, t) => e + (Number(t.actualMin) || 0), 0)
	};
}
function My(e) {
	let t = new Set(e.filter((e) => e.phase === "focus" && e.completed && e.endedAt).map((e) => Ey(new Date(e.endedAt))).filter(Boolean)), n = Ty(/* @__PURE__ */ new Date());
	t.has(Ey(n)) || n.setDate(n.getDate() - 1);
	let r = 0;
	for (; t.has(Ey(n));) r += 1, n.setDate(n.getDate() - 1);
	return r;
}
var Ny = class {
	constructor() {
		this.settings = Cy(null), this.sessions = Dy(), this.runtime = this.#a(), this.listeners = /* @__PURE__ */ new Set(), this.snapshot = null, this.ticker = 0, this.started = !1, this.lastPersistAt = 0, this.lastKeepAwake = null, this.ticking = !1, this.#l();
	}
	subscribe = (e) => (this.listeners.add(e), () => this.listeners.delete(e));
	getSnapshot = () => this.snapshot;
	startEngine() {
		this.started || (this.started = !0, this.ticker = window.setInterval(() => this.#e(), my), this.#u());
	}
	stopEngine() {
		this.started = !1, window.clearInterval(this.ticker), this.ticker = 0, this.#s(!1);
	}
	setSettings(e) {
		let t = Cy(e), n = this.settings;
		this.settings = t;
		let r = this.runtime;
		!r.running && !r.session && (r.totalMs = t[gy[r.phase].minutesKey] * 6e4, r.remainingMs = r.totalMs), r.running && n.whiteNoise !== t.whiteNoise && (t.whiteNoise === "none" ? cy() : sy(t.whiteNoise, t.whiteNoiseVolume)), n.whiteNoiseVolume !== t.whiteNoiseVolume && ly(t.whiteNoiseVolume), this.#s(), this.#u();
	}
	remainingMs() {
		let e = this.runtime;
		return e.running ? Math.max(0, e.endsAt - Date.now()) : Math.max(0, e.remainingMs);
	}
	status() {
		let e = this.runtime, t = jy(this.sessions, "today");
		return {
			phase: e.phase,
			phaseLabel: gy[e.phase].label,
			running: e.running,
			remainingSec: Math.ceil(this.remainingMs() / 1e3),
			totalSec: Math.round(e.totalMs / 1e3),
			roundsDone: e.focusRound,
			roundsBeforeLongBreak: this.settings.roundsBeforeLongBreak,
			taskId: e.session?.taskId ?? null,
			taskTitle: e.session?.taskTitle ?? null,
			whiteNoise: this.settings.whiteNoise,
			today: t
		};
	}
	stats(e = "today") {
		return {
			...jy(this.sessions, e),
			streakDays: My(this.sessions)
		};
	}
	toggle() {
		iy(), this.runtime.running ? this.pause() : this.remainingMs() <= 0 ? this.#r() : this.#t();
	}
	start(e = {}) {
		iy();
		let t = this.runtime;
		return t.running || (!t.session && t.phase === "focus" && e.minutes && (t.totalMs = Sy(e.minutes, this.settings.focusMin) * 6e4, t.remainingMs = t.totalMs), t.session || (t.session = ky(t.phase, Math.round(t.totalMs / 6e4)), t.session.taskId = e.taskId ?? null, t.session.taskTitle = e.taskTitle ?? null), this.#t()), this.status();
	}
	pause() {
		let e = this.runtime;
		if (!e.running) return;
		let t = Date.now();
		e.remainingMs = Math.max(0, e.endsAt - t), e.session && e.segmentStartedAt && (e.session.actualMs += Math.max(0, t - e.segmentStartedAt)), e.running = !1, e.endsAt = 0, e.segmentStartedAt = 0, cy(), this.#s(), this.#o(), this.#u();
	}
	skip() {
		let e = this.runtime, t = e.phase;
		cy(), this.#i(!1);
		let n = "focus";
		t === "focus" ? (n = "shortBreak", this.#c("已跳过专注，进入短休")) : (n = "focus", t === "longBreak" && (e.focusRound = 0), this.#c("已跳过休息，回到专注")), this.#n(n, this.settings.autoStartNext);
	}
	reset() {
		cy(), this.#i(!1), this.runtime.focusRound = 0, this.#c("已重置番茄钟"), this.#n("focus", !1);
	}
	stop() {
		cy();
		let e = this.#i(!1), t = this.runtime.phase;
		return this.#c("已停止本轮"), this.#n(t, !1), e;
	}
	#e() {
		if (this.runtime.running && !this.ticking) {
			this.ticking = !0;
			try {
				let e = Date.now();
				if (this.runtime.endsAt > 0 && e >= this.runtime.endsAt) {
					this.#r();
					return;
				}
				e - this.lastPersistAt >= hy && this.#o(), this.#u();
			} finally {
				this.ticking = !1;
			}
		}
	}
	#t() {
		let e = this.runtime;
		e.session ||= ky(e.phase, Math.round(e.totalMs / 6e4));
		let t = Date.now();
		e.running = !0, e.segmentStartedAt = t, e.endsAt = t + Math.max(0, e.remainingMs), this.settings.whiteNoise !== "none" && sy(this.settings.whiteNoise, this.settings.whiteNoiseVolume), this.#s(), this.#o(), this.#u();
	}
	#n(e, t) {
		let n = this.runtime, r = this.settings[gy[e].minutesKey];
		n.phase = e, n.totalMs = r * 6e4, n.remainingMs = n.totalMs, n.running = !1, n.endsAt = 0, n.segmentStartedAt = 0, n.session = null, cy(), this.#s(), this.#o(), this.#u(), t && this.#t();
	}
	#r() {
		let e = this.runtime, t = e.phase;
		cy(), this.#i(!0, !0);
		let n = "focus";
		t === "focus" ? (e.focusRound += 1, e.focusRound >= this.settings.roundsBeforeLongBreak ? (n = "longBreak", e.focusRound = 0) : n = "shortBreak") : (t === "longBreak" && (e.focusRound = 0), n = "focus");
		let r = this.settings[gy[n].minutesKey];
		this.#c(t === "focus" ? `专注完成，${gy[n].label} ${r} 分钟` : `${gy[t].label}结束，开始专注 ${r} 分钟`), this.settings.sound && uy(), this.#n(n, this.settings.autoStartNext);
	}
	#i(e, t = !0) {
		let n = this.runtime, r = n.session;
		if (!r) return null;
		let i = Date.now(), a = n.running && n.segmentStartedAt ? Math.max(0, i - n.segmentStartedAt) : 0, o = r.actualMs + a;
		if (n.session = null, n.segmentStartedAt = 0, !t || r.phase !== "focus" || o < 1e3) return null;
		let s = {
			id: r.id,
			startedAt: r.startedAt,
			endedAt: (/* @__PURE__ */ new Date()).toISOString(),
			phase: "focus",
			durationMin: r.durationMin,
			actualMin: Math.max(0, Math.round(o / 6e4)),
			completed: !!e,
			taskId: r.taskId ?? void 0
		};
		return this.sessions.push(s), Oy(this.sessions), s;
	}
	#a() {
		let e = by(py, null);
		if (!e || !gy[e.phase]) return Ay(this.settings);
		let t = e.phase, n = Number(e.totalMs) > 0 ? Number(e.totalMs) : this.settings[gy[t].minutesKey] * 6e4, r = e.session && typeof e.session == "object" ? e.session : null, i = {
			phase: t,
			running: !!e.running,
			totalMs: n,
			remainingMs: Number(e.remainingMs) > 0 ? Number(e.remainingMs) : n,
			endsAt: Number(e.endsAt) || 0,
			segmentStartedAt: Number(e.segmentStartedAt) || 0,
			focusRound: Number(e.focusRound) || 0,
			session: r ? {
				...r,
				actualMs: Number(r.actualMs) || 0
			} : null
		};
		if (!i.session) return i;
		if (i.running) {
			let e = Date.now();
			if (i.endsAt > 0 && i.endsAt <= e) {
				let e = Math.max(0, i.endsAt - i.segmentStartedAt);
				return i.session.actualMs += e, i.running = !1, i.segmentStartedAt = 0, i.remainingMs = 0, this.runtime = i, this.#i(!0, !0), this.#n("shortBreak", !1), this.runtime;
			}
			let t = i.segmentStartedAt ? Math.max(0, e - i.segmentStartedAt) : 0;
			i.session.actualMs += t, i.segmentStartedAt = e, i.remainingMs = Math.max(0, i.endsAt - e);
		}
		return i;
	}
	#o() {
		this.lastPersistAt = Date.now();
		let e = this.runtime;
		xy(py, {
			phase: e.phase,
			running: e.running,
			totalMs: e.totalMs,
			remainingMs: e.remainingMs,
			endsAt: e.endsAt,
			segmentStartedAt: e.segmentStartedAt,
			focusRound: e.focusRound,
			session: e.session
		});
	}
	#s(t) {
		let n = this.runtime, r = t === void 0 ? !!(this.settings.keepAwake && n.running && n.phase === "focus") : !!t;
		r !== this.lastKeepAwake && (this.lastKeepAwake = r, Promise.resolve(e.setKeepAwake(r)).catch(() => {}));
	}
	#c(t) {
		t && e.notify(t);
	}
	#l() {
		let e = this.runtime, t = this.remainingMs(), n = jy(this.sessions, "today"), r = e.session;
		this.snapshot = {
			phase: e.phase,
			phaseLabel: gy[e.phase].label,
			running: e.running,
			remainingMs: t,
			remainingText: wy(t),
			totalMs: e.totalMs,
			progress: e.totalMs > 0 ? 1 - Math.min(1, t / e.totalMs) : 0,
			taskTitle: r?.taskTitle ?? (r?.taskId ? `任务 ${r.taskId}` : null),
			focusRound: e.focusRound,
			roundsBeforeLongBreak: this.settings.roundsBeforeLongBreak,
			whiteNoise: this.settings.whiteNoise,
			whiteNoiseVolume: this.settings.whiteNoiseVolume,
			sound: this.settings.sound,
			keepAwake: this.settings.keepAwake,
			today: n
		};
	}
	#u() {
		this.#l();
		for (let e of this.listeners) e();
	}
}, Py = null;
function Fy() {
	return Py ??= new Ny(), Py;
}
async function Iy() {
	let e = by(fy, null);
	if (Array.isArray(e) && e.length) return;
	let t = /* @__PURE__ */ new Date(), n = [];
	for (let e = 0; e < 3; e += 1) {
		let r = /* @__PURE__ */ new Date(t.getTime() - (e * 45 + 25) * 6e4), i = /* @__PURE__ */ new Date(r.getTime() - 15e5);
		n.push({
			id: `demo-session-${e}`,
			startedAt: i.toISOString(),
			endedAt: r.toISOString(),
			phase: "focus",
			durationMin: 25,
			actualMin: 25,
			completed: !0
		});
	}
	Oy(n);
	let r = Date.now() - 72e4;
	xy(py, {
		phase: "focus",
		running: !0,
		totalMs: 15e5,
		remainingMs: 78e4,
		endsAt: r + 15e5,
		segmentStartedAt: r,
		focusRound: 1,
		session: {
			id: "demo-session-current",
			startedAt: new Date(r).toISOString(),
			phase: "focus",
			durationMin: 25,
			actualMs: 0,
			taskId: null,
			taskTitle: "写周报"
		}
	});
}
//#endregion
//#region public/plugins/pomodoro/src/PomodoroApp.jsx
var Ly = 500, Ry = Jv(48), zy = Jv(96), By = Jv(112), Vy = {
	focus: G.colorBrandForeground1,
	shortBreak: G.colorStatusSuccessForeground1,
	longBreak: G.colorBrandForeground2
}, Hy = qn({
	root: {
		position: "relative",
		boxSizing: "border-box",
		width: "100%",
		height: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		color: G.colorNeutralForeground1,
		overflow: "hidden",
		userSelect: "none"
	},
	root1: {
		alignItems: "center",
		justifyContent: "space-evenly",
		gap: G.spacingVerticalXS,
		padding: G.spacingVerticalS,
		cursor: "pointer"
	},
	root21: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: G.spacingHorizontalM,
		padding: `${G.spacingVerticalS} ${G.spacingHorizontalM}`
	},
	root22: {
		gap: G.spacingVerticalS,
		padding: G.spacingVerticalM
	},
	root32: {
		gap: G.spacingVerticalS,
		padding: `${G.spacingVerticalM} ${G.spacingHorizontalL}`
	},
	time48: {
		...Ry,
		...Yv,
		fontWeight: G.fontWeightSemibold
	},
	time96: {
		...zy,
		...Yv,
		fontWeight: G.fontWeightSemibold
	},
	time112: {
		...By,
		...Yv,
		fontWeight: G.fontWeightSemibold
	},
	time: {
		...Yv,
		fontWeight: G.fontWeightSemibold,
		whiteSpace: "nowrap"
	},
	phaseRow: {
		display: "flex",
		alignItems: "center",
		gap: G.spacingHorizontalXS,
		minWidth: 0
	},
	task: {
		color: G.colorNeutralForeground2,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		maxWidth: "100%"
	},
	stats: {
		display: "flex",
		flexDirection: "column",
		gap: G.spacingVerticalXXS,
		color: G.colorNeutralForeground2,
		minWidth: 0
	},
	statsLine: {
		color: G.colorNeutralForeground2,
		whiteSpace: "nowrap"
	},
	round: {
		color: G.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	primaryColumn: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: G.spacingVerticalXXS,
		minWidth: 0
	},
	rowMain: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: G.spacingVerticalXXS,
		minWidth: 0
	},
	actions: {
		display: "flex",
		alignItems: "center",
		gap: G.spacingHorizontalS,
		flex: "0 0 auto"
	},
	wide: {
		display: "grid",
		gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)",
		alignItems: "stretch",
		columnGap: G.spacingHorizontalXL,
		rowGap: G.spacingVerticalS,
		minHeight: 0,
		flex: "1 1 auto"
	},
	wideMain: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		justifyContent: "center",
		gap: G.spacingVerticalXS,
		minWidth: 0
	},
	wideSide: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-end",
		justifyContent: "space-between",
		gap: G.spacingVerticalXS,
		minWidth: 0
	},
	progressTop: {
		width: "100%",
		flex: "0 0 auto"
	},
	progressBottom: { width: "72%" },
	immersive: {
		position: "absolute",
		inset: 0,
		zIndex: 2,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: G.spacingVerticalM,
		padding: G.spacingHorizontalL,
		backgroundColor: G.colorNeutralBackground1,
		textAlign: "center"
	},
	immersiveActions: {
		display: "flex",
		alignItems: "center",
		gap: G.spacingHorizontalM,
		flexWrap: "wrap",
		justifyContent: "center"
	},
	immersiveClose: {
		position: "absolute",
		top: G.spacingVerticalS,
		right: G.spacingHorizontalS
	}
});
function Uy(e) {
	let t = (0, N.useRef)({
		timer: 0,
		origin: null,
		suppressClick: !1
	}), n = (0, N.useCallback)(() => {
		window.clearTimeout(t.current.timer), t.current.timer = 0, t.current.origin = null;
	}, []);
	return (0, N.useEffect)(() => n, [n]), {
		onPointerDown: (0, N.useCallback)((r) => {
			r.button === 0 && (n(), t.current.origin = {
				x: r.clientX,
				y: r.clientY
			}, t.current.timer = window.setTimeout(() => {
				t.current.suppressClick = !0, e();
			}, Ly));
		}, [n, e]),
		onPointerMove: (0, N.useCallback)((e) => {
			let r = t.current.origin;
			r && Math.hypot(e.clientX - r.x, e.clientY - r.y) > 8 && n();
		}, [n]),
		onPointerUp: n,
		onPointerCancel: n,
		onPointerLeave: n,
		consumeSuppressedClick: (0, N.useCallback)(() => t.current.suppressClick ? (t.current.suppressClick = !1, !0) : !1, [])
	};
}
function Wy({ fallbackSizeKey: e }) {
	let t = Hy(), n = Bv(Zv, e || "2x1"), [r] = Vv(dy, _y, Cy), i = Fy(), a = (0, N.useSyncExternalStore)(i.subscribe, i.getSnapshot), [o, s] = (0, N.useState)(() => new URLSearchParams(location.search).get("immersive") === "1"), c = (0, N.useRef)(i);
	c.current = i;
	let l = n === "1x1", u = n === "2x1", d = n === "3x2";
	(0, N.useEffect)(() => (i.startEngine(), () => i.stopEngine()), [i]), (0, N.useEffect)(() => {
		i.setSettings(r);
	}, [i, r]), Gv(() => Wv("番茄钟设置"));
	let f = (0, N.useCallback)(() => i.toggle(), [i]), p = (0, N.useCallback)(() => Uv("detail", "专注详情"), []), m = (0, N.useCallback)(() => Wv("番茄钟设置"), []), h = Uy(m);
	Kv([
		{
			name: "pomodoro.start",
			description: "开始或继续一轮专注",
			parameters: {
				type: "object",
				properties: {
					minutes: {
						type: "number",
						description: "本轮专注分钟数，省略用设置里的 focusMin"
					},
					taskId: {
						type: "string",
						description: "关联的待办任务 id"
					},
					taskTitle: {
						type: "string",
						description: "关联任务标题（仅展示用）"
					}
				},
				additionalProperties: !1
			}
		},
		{
			name: "pomodoro.pause",
			description: "暂停当前一轮",
			parameters: {
				type: "object",
				properties: {},
				additionalProperties: !1
			}
		},
		{
			name: "pomodoro.resume",
			description: "继续当前一轮",
			parameters: {
				type: "object",
				properties: {},
				additionalProperties: !1
			}
		},
		{
			name: "pomodoro.stop",
			description: "停止当前一轮并落库本次记录",
			parameters: {
				type: "object",
				properties: {},
				additionalProperties: !1
			}
		},
		{
			name: "pomodoro.skip",
			description: "跳过当前阶段",
			parameters: {
				type: "object",
				properties: {},
				additionalProperties: !1
			}
		},
		{
			name: "pomodoro.status",
			description: "读取阶段、剩余秒数、任务与今日统计",
			parameters: {
				type: "object",
				properties: {},
				additionalProperties: !1
			}
		},
		{
			name: "pomodoro.stats",
			description: "读取完成数、专注分钟与连续天数",
			parameters: {
				type: "object",
				properties: { range: {
					type: "string",
					enum: [
						"today",
						"week",
						"month"
					],
					description: "统计范围，默认 today"
				} },
				additionalProperties: !1
			}
		}
	], {
		"pomodoro.start": (e) => c.current.start(e),
		"pomodoro.pause": () => (c.current.pause(), c.current.status()),
		"pomodoro.resume": () => c.current.start(),
		"pomodoro.stop": () => ({
			session: c.current.stop(),
			status: c.current.status()
		}),
		"pomodoro.skip": () => (c.current.skip(), c.current.status()),
		"pomodoro.status": () => c.current.status(),
		"pomodoro.stats": (e) => c.current.stats(e?.range)
	});
	let g = a.running ? "暂停" : a.phase !== "focus" || a.progress > 0 ? "继续" : "开始", _ = (e) => /* @__PURE__ */ (0, P.jsx)(vm, {
		content: a.running ? "暂停" : "开始 / 继续",
		relationship: "label",
		children: /* @__PURE__ */ (0, P.jsx)(Pm, {
			appearance: "primary",
			size: "large",
			icon: a.running ? /* @__PURE__ */ (0, P.jsx)(uu, {}) : /* @__PURE__ */ (0, P.jsx)(su, {}),
			onClick: f,
			"aria-label": a.running ? "暂停" : "开始",
			children: e ? g : null
		})
	}), v = /* @__PURE__ */ (0, P.jsxs)(hg, { children: [/* @__PURE__ */ (0, P.jsx)(t_, {
		disableButtonEnhancement: !0,
		children: /* @__PURE__ */ (0, P.jsx)(vm, {
			content: "更多操作",
			relationship: "label",
			children: /* @__PURE__ */ (0, P.jsx)(Pm, {
				appearance: "subtle",
				size: "large",
				icon: /* @__PURE__ */ (0, P.jsx)(K, {}),
				"aria-label": "更多操作"
			})
		})
	}), /* @__PURE__ */ (0, P.jsx)(Yg, { children: /* @__PURE__ */ (0, P.jsxs)(Hg, { children: [
		/* @__PURE__ */ (0, P.jsx)(kg, {
			icon: /* @__PURE__ */ (0, P.jsx)(ou, {}),
			onClick: () => s(!0),
			children: "沉浸模式"
		}),
		/* @__PURE__ */ (0, P.jsx)(kg, {
			onClick: p,
			children: "详情与统计"
		}),
		/* @__PURE__ */ (0, P.jsx)(kg, {
			icon: /* @__PURE__ */ (0, P.jsx)(cu, {}),
			onClick: () => i.skip(),
			children: "跳过本轮"
		}),
		/* @__PURE__ */ (0, P.jsx)(kg, {
			icon: /* @__PURE__ */ (0, P.jsx)(lu, {}),
			onClick: () => i.reset(),
			children: "重置"
		}),
		/* @__PURE__ */ (0, P.jsx)(kg, {
			onClick: m,
			children: "设置"
		})
	] }) })] }), y = (e = 300) => /* @__PURE__ */ (0, P.jsx)(mv, {
		size: e,
		weight: "semibold",
		style: { color: Vy[a.phase] },
		children: a.phaseLabel
	}), b = o && /* @__PURE__ */ (0, P.jsxs)("div", {
		className: t.immersive,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "沉浸模式",
		children: [
			/* @__PURE__ */ (0, P.jsx)(Pm, {
				className: t.immersiveClose,
				appearance: "subtle",
				size: "large",
				icon: /* @__PURE__ */ (0, P.jsx)(pu, {}),
				"aria-label": "退出沉浸模式",
				onClick: () => s(!1)
			}),
			y(400),
			/* @__PURE__ */ (0, P.jsx)(mv, {
				className: t.time112,
				children: a.remainingText
			}),
			a.taskTitle && /* @__PURE__ */ (0, P.jsx)(mv, {
				size: 400,
				className: t.task,
				children: a.taskTitle
			}),
			/* @__PURE__ */ (0, P.jsxs)("div", {
				className: t.immersiveActions,
				children: [/* @__PURE__ */ (0, P.jsx)(Pm, {
					appearance: "primary",
					size: "large",
					icon: a.running ? /* @__PURE__ */ (0, P.jsx)(uu, {}) : /* @__PURE__ */ (0, P.jsx)(su, {}),
					onClick: f,
					children: a.running ? "暂停" : "继续"
				}), /* @__PURE__ */ (0, P.jsx)(Pm, {
					size: "large",
					icon: /* @__PURE__ */ (0, P.jsx)(iu, {}),
					onClick: () => {
						i.stop(), s(!1);
					},
					children: "结束本轮"
				})]
			}),
			/* @__PURE__ */ (0, P.jsxs)(mv, {
				size: 300,
				style: { color: G.colorNeutralForeground3 },
				children: [
					"今日 ",
					a.today.completed,
					" 个 · ",
					a.today.focusMinutes,
					" 分钟"
				]
			})
		]
	}), x = {
		onPointerDown: h.onPointerDown,
		onPointerMove: h.onPointerMove,
		onPointerUp: h.onPointerUp,
		onPointerCancel: h.onPointerCancel,
		onPointerLeave: h.onPointerLeave,
		onContextMenu: (e) => {
			e.preventDefault(), m();
		}
	};
	return l ? /* @__PURE__ */ (0, P.jsxs)("div", {
		className: O(t.root, t.root1),
		role: "button",
		tabIndex: 0,
		"aria-label": `${a.phaseLabel} ${a.remainingText}，点击开始或暂停`,
		onClick: () => {
			h.consumeSuppressedClick() || f();
		},
		onKeyDown: (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), f());
		},
		...x,
		children: [
			/* @__PURE__ */ (0, P.jsx)(mv, {
				className: t.time48,
				children: a.remainingText
			}),
			y(300),
			/* @__PURE__ */ (0, P.jsx)(Ev, {
				className: t.progressBottom,
				value: a.progress,
				max: 1,
				"aria-label": "本轮进度"
			}),
			b
		]
	}) : u ? /* @__PURE__ */ (0, P.jsxs)("div", {
		className: O(t.root, t.root21),
		...x,
		children: [
			/* @__PURE__ */ (0, P.jsxs)("div", {
				className: t.rowMain,
				children: [y(300), /* @__PURE__ */ (0, P.jsx)(mv, {
					className: t.time,
					size: 1e3,
					weight: "semibold",
					children: a.remainingText
				})]
			}),
			/* @__PURE__ */ (0, P.jsx)("div", {
				className: t.actions,
				children: _(!0)
			}),
			b
		]
	}) : d ? /* @__PURE__ */ (0, P.jsxs)("div", {
		className: O(t.root, t.root32),
		...x,
		children: [
			/* @__PURE__ */ (0, P.jsx)(Ev, {
				className: t.progressTop,
				value: a.progress,
				max: 1,
				thickness: "large",
				"aria-label": "本轮进度"
			}),
			/* @__PURE__ */ (0, P.jsxs)("div", {
				className: t.wide,
				children: [/* @__PURE__ */ (0, P.jsxs)("div", {
					className: t.wideMain,
					children: [y(400), /* @__PURE__ */ (0, P.jsx)(mv, {
						className: t.time96,
						children: a.remainingText
					})]
				}), /* @__PURE__ */ (0, P.jsxs)("div", {
					className: t.wideSide,
					children: [
						/* @__PURE__ */ (0, P.jsx)(mv, {
							size: 400,
							className: t.task,
							children: a.taskTitle ?? "未关联任务"
						}),
						/* @__PURE__ */ (0, P.jsxs)("div", {
							className: t.stats,
							children: [
								/* @__PURE__ */ (0, P.jsxs)(mv, {
									size: 400,
									className: t.statsLine,
									children: [
										"今日完成 ",
										a.today.completed,
										" 个"
									]
								}),
								/* @__PURE__ */ (0, P.jsxs)(mv, {
									size: 400,
									className: t.statsLine,
									children: [
										"专注 ",
										a.today.focusMinutes,
										" 分钟"
									]
								}),
								/* @__PURE__ */ (0, P.jsxs)(mv, {
									size: 200,
									className: t.round,
									children: [
										"第 ",
										Math.min(a.roundsBeforeLongBreak, a.focusRound + 1),
										" / ",
										a.roundsBeforeLongBreak,
										" 轮"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, P.jsxs)("div", {
							className: t.actions,
							children: [_(!0), v]
						})
					]
				})]
			}),
			b
		]
	}) : /* @__PURE__ */ (0, P.jsxs)("div", {
		className: O(t.root, t.root22),
		...x,
		children: [
			/* @__PURE__ */ (0, P.jsx)(mv, {
				className: t.time,
				size: 1e3,
				weight: "semibold",
				children: a.remainingText
			}),
			y(300),
			/* @__PURE__ */ (0, P.jsx)(mv, {
				size: 400,
				className: t.task,
				children: a.taskTitle ?? "未关联任务"
			}),
			/* @__PURE__ */ (0, P.jsxs)(mv, {
				size: 400,
				className: t.statsLine,
				children: [
					"今日 ",
					a.today.completed,
					" 个 · 专注 ",
					a.today.focusMinutes,
					" 分钟"
				]
			}),
			/* @__PURE__ */ (0, P.jsx)("div", {
				className: t.actions,
				children: _(!0)
			}),
			b
		]
	});
}
//#endregion
//#region public/plugins/pomodoro/src/PomodoroDetail.jsx
var Gy = qn({
	root: {
		boxSizing: "border-box",
		width: "100%",
		height: "100%",
		padding: `${G.spacingVerticalL} ${G.spacingHorizontalL}`,
		display: "flex",
		flexDirection: "column",
		gap: G.spacingVerticalM,
		overflowY: "auto",
		color: G.colorNeutralForeground1
	},
	heading: {
		display: "flex",
		alignItems: "baseline",
		gap: G.spacingHorizontalS,
		flexWrap: "wrap"
	},
	hint: { color: G.colorNeutralForeground3 },
	grid: {
		display: "flex",
		flexDirection: "column",
		gap: G.spacingVerticalXS
	},
	row: {
		display: "flex",
		alignItems: "baseline",
		justifyContent: "space-between",
		gap: G.spacingHorizontalL,
		minHeight: "40px"
	},
	label: { color: G.colorNeutralForeground3 },
	value: {
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	}
});
function Ky() {
	let e = Gy(), t = Fy(), [n, r] = (0, N.useState)(() => t.status()), [i, a] = (0, N.useState)(() => t.stats("today")), [o, s] = (0, N.useState)(() => t.stats("week"));
	(0, N.useEffect)(() => {
		let e = () => {
			r(t.status()), a(t.stats("today")), s(t.stats("week"));
		};
		e();
		let n = window.setInterval(e, 1e3);
		return () => window.clearInterval(n);
	}, [t]);
	let c = [
		["阶段", n.phaseLabel],
		["剩余", `${Math.floor(n.remainingSec / 60)} 分 ${String(n.remainingSec % 60).padStart(2, "0")} 秒`],
		["本轮进度", `${n.roundsDone} / ${n.roundsBeforeLongBreak}`],
		["当前任务", n.taskTitle ?? "未关联任务"],
		["今日完成", `${i.completed} 个`],
		["今日专注", `${i.focusMinutes} 分钟`],
		["本周完成", `${o.completed} 个 · ${o.focusMinutes} 分钟`],
		["连续天数", `${i.streakDays} 天`],
		["白噪音", n.whiteNoise === "none" ? "关" : n.whiteNoise]
	];
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: e.root,
		children: [
			/* @__PURE__ */ (0, P.jsxs)("div", {
				className: e.heading,
				children: [/* @__PURE__ */ (0, P.jsx)(mv, {
					size: 400,
					weight: "semibold",
					children: "专注详情"
				}), /* @__PURE__ */ (0, P.jsx)(mv, {
					className: e.hint,
					size: 200,
					children: n.running ? "进行中" : "已暂停 / 待开始"
				})]
			}),
			/* @__PURE__ */ (0, P.jsx)("div", {
				className: e.grid,
				children: c.map(([t, n]) => /* @__PURE__ */ (0, P.jsxs)("div", {
					className: e.row,
					children: [/* @__PURE__ */ (0, P.jsx)(mv, {
						className: e.label,
						size: 300,
						children: t
					}), /* @__PURE__ */ (0, P.jsx)(mv, {
						className: e.value,
						size: 300,
						weight: "semibold",
						children: n
					})]
				}, t))
			}),
			/* @__PURE__ */ (0, P.jsx)(hh, {}),
			/* @__PURE__ */ (0, P.jsx)(mv, {
				className: e.hint,
				size: 200,
				children: "计时、跳过、重置与沉浸模式都在卡片上的 ⋯ 菜单里；每次专注都会被记录，并汇总到复盘。"
			})
		]
	});
}
//#endregion
//#region public/plugins/pomodoro/src/PomodoroSettings.jsx
var qy = qn({
	root: {
		boxSizing: "border-box",
		width: "100%",
		height: "100%",
		padding: `${G.spacingVerticalL} ${G.spacingHorizontalL}`,
		display: "flex",
		flexDirection: "column",
		gap: G.spacingVerticalL,
		overflowY: "auto",
		color: G.colorNeutralForeground1
	},
	section: {
		display: "flex",
		flexDirection: "column",
		gap: G.spacingVerticalM
	},
	numbers: {
		display: "flex",
		flexWrap: "wrap",
		gap: G.spacingHorizontalL,
		alignItems: "flex-end"
	},
	field: {
		minWidth: "140px",
		flex: "1 1 140px"
	},
	row: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: G.spacingHorizontalL,
		minHeight: "40px"
	},
	rowText: {
		display: "flex",
		flexDirection: "column",
		gap: G.spacingVerticalXXS,
		minWidth: 0
	},
	noiseRow: {
		display: "flex",
		alignItems: "center",
		gap: G.spacingHorizontalL,
		flexWrap: "wrap"
	},
	slider: {
		flex: "1 1 220px",
		minWidth: "180px"
	},
	subtle: { color: G.colorNeutralForeground3 }
});
function Jy() {
	let e = qy(), [t, n, r] = Vv(dy, _y, Cy), i = (e) => n((t) => ({
		...t,
		...e
	})), a = (e, t) => (n) => {
		let r = Number(n.target.value), a = Number.isFinite(r) && r > 0 ? Math.round(r) : t;
		i({ [e]: a });
	};
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: e.root,
		children: [
			/* @__PURE__ */ (0, P.jsxs)("section", {
				className: e.section,
				"aria-label": "时长",
				children: [/* @__PURE__ */ (0, P.jsx)(mv, {
					size: 400,
					weight: "semibold",
					children: "时长与轮数"
				}), /* @__PURE__ */ (0, P.jsxs)("div", {
					className: e.numbers,
					children: [
						/* @__PURE__ */ (0, P.jsx)(oh, {
							label: "专注（分钟）",
							className: e.field,
							children: /* @__PURE__ */ (0, P.jsx)(Dh, {
								type: "number",
								min: 1,
								value: String(t.focusMin),
								disabled: !r,
								onChange: a("focusMin", _y.focusMin)
							})
						}),
						/* @__PURE__ */ (0, P.jsx)(oh, {
							label: "短休（分钟）",
							className: e.field,
							children: /* @__PURE__ */ (0, P.jsx)(Dh, {
								type: "number",
								min: 1,
								value: String(t.shortBreakMin),
								disabled: !r,
								onChange: a("shortBreakMin", _y.shortBreakMin)
							})
						}),
						/* @__PURE__ */ (0, P.jsx)(oh, {
							label: "长休（分钟）",
							className: e.field,
							children: /* @__PURE__ */ (0, P.jsx)(Dh, {
								type: "number",
								min: 1,
								value: String(t.longBreakMin),
								disabled: !r,
								onChange: a("longBreakMin", _y.longBreakMin)
							})
						}),
						/* @__PURE__ */ (0, P.jsx)(oh, {
							label: "长休前轮数",
							className: e.field,
							children: /* @__PURE__ */ (0, P.jsx)(Dh, {
								type: "number",
								min: 1,
								value: String(t.roundsBeforeLongBreak),
								disabled: !r,
								onChange: a("roundsBeforeLongBreak", _y.roundsBeforeLongBreak)
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, P.jsx)(hh, {}),
			/* @__PURE__ */ (0, P.jsxs)("section", {
				className: e.section,
				"aria-label": "行为",
				children: [
					/* @__PURE__ */ (0, P.jsxs)("div", {
						className: e.row,
						children: [/* @__PURE__ */ (0, P.jsxs)("div", {
							className: e.rowText,
							children: [/* @__PURE__ */ (0, P.jsx)(mv, {
								size: 300,
								children: "自动开始下一阶段"
							}), /* @__PURE__ */ (0, P.jsx)(mv, {
								className: e.subtle,
								size: 200,
								children: "关闭时阶段结束停在「待开始」"
							})]
						}), /* @__PURE__ */ (0, P.jsx)(cv, {
							checked: t.autoStartNext,
							disabled: !r,
							"aria-label": "自动开始下一阶段",
							onChange: (e, t) => i({ autoStartNext: t.checked })
						})]
					}),
					/* @__PURE__ */ (0, P.jsxs)("div", {
						className: e.row,
						children: [/* @__PURE__ */ (0, P.jsxs)("div", {
							className: e.rowText,
							children: [/* @__PURE__ */ (0, P.jsx)(mv, {
								size: 300,
								children: "阶段结束提示音"
							}), /* @__PURE__ */ (0, P.jsx)(mv, {
								className: e.subtle,
								size: 200,
								children: "由系统合成，不占用网络"
							})]
						}), /* @__PURE__ */ (0, P.jsx)(cv, {
							checked: t.sound,
							disabled: !r,
							"aria-label": "阶段结束提示音",
							onChange: (e, t) => i({ sound: t.checked })
						})]
					}),
					/* @__PURE__ */ (0, P.jsxs)("div", {
						className: e.row,
						children: [/* @__PURE__ */ (0, P.jsxs)("div", {
							className: e.rowText,
							children: [/* @__PURE__ */ (0, P.jsx)(mv, {
								size: 300,
								children: "专注时阻止息屏"
							}), /* @__PURE__ */ (0, P.jsx)(mv, {
								className: e.subtle,
								size: 200,
								children: "专注期间不锁屏，结束后自动恢复"
							})]
						}), /* @__PURE__ */ (0, P.jsx)(cv, {
							checked: t.keepAwake,
							disabled: !r,
							"aria-label": "专注时阻止息屏",
							onChange: (e, t) => i({ keepAwake: t.checked })
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, P.jsx)(hh, {}),
			/* @__PURE__ */ (0, P.jsxs)("section", {
				className: e.section,
				"aria-label": "白噪音",
				children: [
					/* @__PURE__ */ (0, P.jsx)(mv, {
						size: 400,
						weight: "semibold",
						children: "白噪音"
					}),
					/* @__PURE__ */ (0, P.jsx)(f_, {
						value: t.whiteNoise,
						layout: "horizontal",
						onChange: (e, t) => i({ whiteNoise: t.value }),
						children: ty.map((e) => /* @__PURE__ */ (0, P.jsx)(w_, {
							value: e.id,
							label: e.label
						}, e.id))
					}),
					/* @__PURE__ */ (0, P.jsxs)("div", {
						className: e.noiseRow,
						children: [/* @__PURE__ */ (0, P.jsxs)(mv, {
							size: 300,
							className: e.subtle,
							children: ["音量 ", t.whiteNoiseVolume]
						}), /* @__PURE__ */ (0, P.jsx)(Y_, {
							className: e.slider,
							min: 0,
							max: 100,
							value: t.whiteNoiseVolume,
							"aria-label": "白噪音音量",
							onChange: (e, t) => i({ whiteNoiseVolume: t.value })
						})]
					}),
					/* @__PURE__ */ (0, P.jsx)(mv, {
						className: e.subtle,
						size: 200,
						children: "白噪音随阶段结束淡出；浏览器要求用户手势后才能播放，改动后回到卡片点一次开始即可生效。"
					})
				]
			})
		]
	});
}
//#endregion
//#region public/plugins/pomodoro/src/main.jsx
Nv();
var Yy = new URLSearchParams(location.search), Xy = Hv(), Zy = Qv();
function Qy(t = 2500) {
	return !e.inHost || Pv() ? Promise.resolve() : new Promise((e) => {
		let n = Date.now(), r = window.setInterval(() => {
			(Pv() || Date.now() - n > t) && (window.clearInterval(r), e());
		}, 30);
	});
}
function $y() {
	let { theme: t } = zv(), n = e.inHost ? "transparent" : t.colorNeutralBackground1;
	return /* @__PURE__ */ (0, P.jsx)(Ol, {
		theme: t,
		style: {
			width: "100%",
			height: "100%",
			background: n,
			colorScheme: "normal"
		},
		children: Xy === "settings" ? /* @__PURE__ */ (0, P.jsx)(Jy, {}) : Xy === "detail" ? /* @__PURE__ */ (0, P.jsx)(Ky, {}) : /* @__PURE__ */ (0, P.jsx)(Wy, { fallbackSizeKey: Zy })
	});
}
async function eb() {
	let e = document.getElementById("root");
	e && (await Qy(), Yy.get("demo") === "1" && await Iy(), (0, Dv.createRoot)(e).render(/* @__PURE__ */ (0, P.jsx)($y, {})));
}
eb();
//#endregion
