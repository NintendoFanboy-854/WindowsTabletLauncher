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
				t !== null && k(x, t.startTime - e);
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
								u !== null && k(x, u.startTime - t), i = !1;
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
		var te = new MessageChannel(), O = te.port2;
		te.port1.onmessage = D, ee = function() {
			O.postMessage(null);
		};
	} else ee = function() {
		_(D, 0);
	};
	function k(t, n) {
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
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, k(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, ee()))), r;
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
})), d = /* @__PURE__ */ s(((e, t) => {
	t.exports = u();
})), f = /* @__PURE__ */ s(((e) => {
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
	function O(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var k = /\/+/g;
	function ne(e, t) {
		return typeof e == "object" && e && e.key != null ? O("" + e.key) : t.toString(36);
	}
	function A(e) {
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
	function re(e, r, i, a, o) {
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
				case d: return c = e._init, re(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + ne(e, 0) : a, C(o) ? (i = "", c != null && (i = c.replace(k, "$&/") + "/"), re(o, r, i, "", function(e) {
			return e;
		})) : o != null && (te(o) && (o = ee(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(k, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (C(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + ne(a, u), c += re(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + ne(a, u++), c += re(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return re(A(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function ie(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return re(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function ae(e) {
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
	var oe = typeof reportError == "function" ? reportError : function(e) {
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
	function se(e) {
		var t = T.T, n = {};
		n.types = t === null ? null : t.types, T.T = n;
		try {
			var r = e(), i = T.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(w, oe);
		} catch (e) {
			oe(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), T.T = t;
		}
	}
	function ce(e) {
		var t = T.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else se(ce.bind(null, e));
	}
	var le = {
		map: ie,
		forEach: function(e, t, n) {
			ie(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ie(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ie(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!te(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = le, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = x, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = T, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return T.H.useMemoCache(e);
		}
	}, e.addTransitionType = ce, e.cache = function(e) {
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
			_init: ae
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = se, e.unstable_useCacheRefresh = function() {
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
})), p = /* @__PURE__ */ s(((e, t) => {
	t.exports = f();
})), m = /* @__PURE__ */ s(((e) => {
	var t = p();
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
	var t = d(), n = p(), r = h();
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
	var D = Object.assign, ee = Symbol.for("react.element"), te = Symbol.for("react.transitional.element"), O = Symbol.for("react.portal"), k = Symbol.for("react.fragment"), ne = Symbol.for("react.strict_mode"), A = Symbol.for("react.profiler"), re = Symbol.for("react.consumer"), ie = Symbol.for("react.context"), ae = Symbol.for("react.forward_ref"), oe = Symbol.for("react.suspense"), se = Symbol.for("react.suspense_list"), ce = Symbol.for("react.memo"), le = Symbol.for("react.lazy"), ue = Symbol.for("react.activity"), de = Symbol.for("react.legacy_hidden"), fe = Symbol.for("react.memo_cache_sentinel"), pe = Symbol.for("react.view_transition"), me = Symbol.for("react.recoverable"), he = Symbol.iterator;
	function ge(e) {
		return typeof e != "object" || !e ? null : (e = he && e[he] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var _e = Symbol.for("react.client.reference");
	function ve(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === _e ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case k: return "Fragment";
			case A: return "Profiler";
			case ne: return "StrictMode";
			case oe: return "Suspense";
			case se: return "SuspenseList";
			case ue: return "Activity";
			case pe: return "ViewTransition";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case O: return "Portal";
			case ie: return e.displayName || "Context";
			case re: return (e._context.displayName || "Context") + ".Consumer";
			case ae:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case ce: return t = e.displayName || null, t === null ? ve(e.type) || "Memo" : t;
			case le:
				t = e._payload, e = e._init;
				try {
					return ve(e(t));
				} catch {}
		}
		return null;
	}
	var ye = Array.isArray, j = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, be = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, xe = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, Se = [], Ce = -1;
	function we(e) {
		return { current: e };
	}
	function Te(e) {
		0 > Ce || (e.current = Se[Ce], Se[Ce] = null, Ce--);
	}
	function Ee(e, t) {
		Ce++, Se[Ce] = e.current, e.current = t;
	}
	var De = we(null), Oe = we(null), ke = we(null), Ae = we(null);
	function je(e, t) {
		switch (Ee(ke, t), Ee(Oe, e), Ee(De, null), t.nodeType) {
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
		Te(De), Ee(De, e);
	}
	function Me() {
		Te(De), Te(Oe), Te(ke);
	}
	function Ne(e) {
		var t = e.memoizedState;
		t !== null && (ch._currentValue = t.memoizedState, Ee(Ae, e)), t = De.current;
		var n = fp(t, e.type);
		t !== n && (Ee(Oe, e), Ee(De, n));
	}
	function Pe(e) {
		Oe.current === e && (Te(De), Te(Oe)), Ae.current === e && (Te(Ae), ch._currentValue = xe);
	}
	var Fe, Ie;
	function Le(e) {
		if (Fe === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			Fe = t && t[1] || "", Ie = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + Fe + e + Ie;
	}
	var Re = !1;
	function ze(e, t) {
		if (!e || Re) return "";
		Re = !0;
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
			Re = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? Le(n) : "";
	}
	function Be(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return Le(e.type);
			case 16: return Le("Lazy");
			case 13: return e.child !== t && t !== null ? Le("Suspense Fallback") : Le("Suspense");
			case 19: return Le("SuspenseList");
			case 0:
			case 15: return ze(e.type, !1);
			case 11: return ze(e.type.render, !1);
			case 1: return ze(e.type, !0);
			case 31: return Le("Activity");
			case 30: return Le("ViewTransition");
			default: return "";
		}
	}
	function Ve(e) {
		try {
			var t = "", n = null;
			do
				t += Be(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var He = Object.prototype.hasOwnProperty, Ue = t.unstable_scheduleCallback, We = t.unstable_cancelCallback, Ge = t.unstable_shouldYield, Ke = t.unstable_requestPaint, qe = t.unstable_now, Je = t.unstable_getCurrentPriorityLevel, Ye = t.unstable_ImmediatePriority, Xe = t.unstable_UserBlockingPriority, Ze = t.unstable_NormalPriority, Qe = t.unstable_LowPriority, $e = t.unstable_IdlePriority, et = t.log, tt = t.unstable_setDisableYieldValue, nt = null, rt = null;
	function it(e) {
		if (typeof et == "function" && tt(e), rt && typeof rt.setStrictMode == "function") try {
			rt.setStrictMode(nt, e);
		} catch {}
	}
	var at = Math.clz32 ? Math.clz32 : ct, ot = Math.log, st = Math.LN2;
	function ct(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (ot(e) / st | 0) | 0;
	}
	var lt = 256, ut = 262144, dt = 4194304;
	function ft(e) {
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
	function pt(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = ft(n))) : i = ft(o) : i = ft(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = ft(n))) : i = ft(o)) : i = ft(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function mt(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function ht(e, t) {
		t & 8 && (t |= t & 32);
		var n = e.entangledLanes;
		if (n !== 0) for (e = e.entanglements, n &= t; 0 < n;) {
			var r = 31 - at(n), i = 1 << r;
			t |= e[r], n &= ~i;
		}
		return t;
	}
	function gt(e, t) {
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
	function _t() {
		var e = dt;
		return dt <<= 1, !(dt & 62914560) && (dt = 4194304), e;
	}
	function vt(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function yt(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function bt(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - at(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && xt(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function xt(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - at(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function St(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - at(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function Ct(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : wt(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function wt(e) {
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
	function Tt(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function Et() {
		var e = be.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : wh(e.type)) : e;
	}
	function Dt(e, t) {
		var n = be.p;
		try {
			return be.p = e, t();
		} finally {
			be.p = n;
		}
	}
	var Ot = Math.random().toString(36).slice(2), kt = "__reactFiber$" + Ot, At = "__reactProps$" + Ot, jt = "__reactContainer$" + Ot, Mt = "__reactEvents$" + Ot, Nt = "__reactListeners$" + Ot, M = "__reactHandles$" + Ot, Pt = "__reactResources$" + Ot, Ft = "__reactMarker$" + Ot, It = "__reactLoad$" + Ot;
	function Lt(e) {
		delete e[kt], delete e[At], delete e[Nt], delete e[M];
	}
	function Rt(e) {
		var t;
		if (t = e[kt]) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[jt] || n[kt]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = pm(e); e !== null;) {
					if (n = e[kt]) return n;
					e = pm(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function zt(e) {
		if (e = e[kt] || e[jt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function Bt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(i(33));
	}
	function Vt(e) {
		var t = e[Pt];
		return t ||= e[Pt] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function Ht(e) {
		e[Ft] = !0;
	}
	function Ut(e) {
		e[It] = void 0;
	}
	var Wt = /* @__PURE__ */ new Set(), Gt = {};
	function Kt(e, t) {
		qt(e, t), qt(e + "Capture", t);
	}
	function qt(e, t) {
		for (Gt[e] = t, e = 0; e < t.length; e++) Wt.add(t[e]);
	}
	var Jt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), Yt = {}, Xt = {};
	function Zt(e) {
		return He.call(Xt, e) ? !0 : He.call(Yt, e) ? !1 : Jt.test(e) ? Xt[e] = !0 : (Yt[e] = !0, !1);
	}
	var N = !1;
	function Qt() {
		var e = N;
		return N = !1, e;
	}
	function $t(e, t, n) {
		if (Zt(t)) {
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
	function en(e, t, n) {
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
	function tn(e, t, n, r) {
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
	function nn(e) {
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
	function rn(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function an(e, t, n) {
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
	function on(e) {
		if (!e._valueTracker) {
			var t = rn(e) ? "checked" : "value";
			e._valueTracker = an(e, t, "" + e[t]);
		}
	}
	function sn(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = rn(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	var cn = /[\n"\\]/g;
	function ln(e) {
		return e.replace(cn, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function un(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + nn(t)) : e.value !== "" + nn(t) && (e.value = "" + nn(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : fn(e, nn(n)) : o === "number" && e.value == t ? fn(e, nn(e.value)) : fn(e, nn(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + nn(s) : e.removeAttribute("name");
	}
	function dn(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				on(e);
				return;
			}
			n = n == null ? "" : "" + nn(n), t = t == null ? n : "" + nn(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), on(e);
	}
	function fn(e, t) {
		e.defaultValue !== "" + t && (e.defaultValue = "" + t);
	}
	function pn(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + nn(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function mn(e, t, n) {
		t != null && (t = "" + nn(t), t !== e.value && (e.value = t), n == null) ? e.defaultValue !== t && (e.defaultValue = t) : e.defaultValue = n == null ? "" : "" + nn(n);
	}
	function hn(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(i(92));
				if (ye(r)) {
					if (1 < r.length) throw Error(i(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = nn(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), on(e);
	}
	function gn(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var _n = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function vn(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || _n.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function yn(e, t, n) {
		if (t != null && typeof t != "object") throw Error(i(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "", N = !0);
			for (var a in t) r = t[a], t.hasOwnProperty(a) && n[a] !== r && (vn(e, a, r), N = !0);
		} else for (var o in t) t.hasOwnProperty(o) && vn(e, o, t[o]);
	}
	function bn(e) {
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
	var xn = /* @__PURE__ */ new Map([
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
	]), Sn = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function Cn(e) {
		return Sn.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function wn() {}
	var Tn = null;
	function En(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var Dn = null, On = null;
	function kn(e) {
		var t = zt(e);
		if (t && (e = t.stateNode)) {
			var n = e[At] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (un(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + ln("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var a = r[At] || null;
								if (!a) throw Error(i(90));
								un(r, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && sn(r);
					}
					break a;
				case "textarea":
					mn(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && pn(e, !!n.multiple, t, !1);
			}
		}
	}
	var An = !1;
	function jn(e, t, n) {
		if (An) return e(t, n);
		An = !0;
		try {
			return e(t);
		} finally {
			if (An = !1, (Dn !== null || On !== null) && (Bd(), Dn && (t = Dn, e = On, On = Dn = null, kn(t), e))) for (t = 0; t < e.length; t++) kn(e[t]);
		}
	}
	function Mn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[At] || null;
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
	var Nn = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, Pn = !1;
	if (Nn) try {
		var Fn = {};
		Object.defineProperty(Fn, "passive", { get: function() {
			Pn = !0;
		} }), window.addEventListener("test", Fn, Fn), window.removeEventListener("test", Fn, Fn);
	} catch {
		Pn = !1;
	}
	var In = null, Ln = null, P = null;
	function Rn() {
		if (P) return P;
		var e, t = Ln, n = t.length, r, i = "value" in In ? In.value : In.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return P = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function zn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Bn() {
		return !0;
	}
	function F() {
		return !1;
	}
	function Vn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Bn : F, this.isPropagationStopped = F, this;
		}
		return D(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Bn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Bn);
			},
			persist: function() {},
			isPersistent: Bn
		}), t;
	}
	var Hn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Un = Vn(Hn), Wn = D({}, Hn, {
		view: 0,
		detail: 0
	}), Gn = Vn(Wn), Kn, I, qn, Jn = D({}, Wn, {
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
		getModifierState: ar,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== qn && (qn && e.type === "mousemove" ? (Kn = e.screenX - qn.screenX, I = e.screenY - qn.screenY) : I = Kn = 0, qn = e), Kn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : I;
		}
	}), Yn = Vn(Jn), Xn = Vn(D({}, Jn, { dataTransfer: 0 })), Zn = Vn(D({}, Wn, { relatedTarget: 0 })), Qn = Vn(D({}, Hn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), $n = Vn(D({}, Hn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), er = Vn(D({}, Hn, { data: 0 })), tr = {
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
	}, nr = {
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
	}, rr = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function ir(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = rr[e]) ? !!t[e] : !1;
	}
	function ar() {
		return ir;
	}
	var or = Vn(D({}, Wn, {
		key: function(e) {
			if (e.key) {
				var t = tr[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = zn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? nr[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: ar,
		charCode: function(e) {
			return e.type === "keypress" ? zn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? zn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), sr = Vn(D({}, Jn, {
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
	})), cr = Vn(D({}, Hn, { submitter: 0 })), lr = Vn(D({}, Wn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: ar
	})), ur = Vn(D({}, Hn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), dr = Vn(D({}, Jn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), fr = Vn(D({}, Hn, {
		newState: 0,
		oldState: 0,
		source: 0
	})), pr = [
		9,
		13,
		27,
		32
	], mr = Nn && "CompositionEvent" in window, hr = null;
	Nn && "documentMode" in document && (hr = document.documentMode);
	var gr = Nn && "TextEvent" in window && !hr, _r = Nn && (!mr || hr && 8 < hr && 11 >= hr), vr = " ", yr = !1;
	function br(e, t) {
		switch (e) {
			case "keyup": return pr.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function xr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var Sr = !1;
	function Cr(e, t) {
		switch (e) {
			case "compositionend": return xr(t);
			case "keypress": return t.which === 32 ? (yr = !0, vr) : null;
			case "textInput": return e = t.data, e === vr && yr ? null : e;
			default: return null;
		}
	}
	function wr(e, t) {
		if (Sr) return e === "compositionend" || !mr && br(e, t) ? (e = Rn(), P = Ln = In = null, Sr = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return _r && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var Tr = {
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
	function Er(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!Tr[e.type] : t === "textarea";
	}
	function Dr(e, t, n, r) {
		Dn ? On ? On.push(r) : On = [r] : Dn = r, t = Yf(t, "onChange"), 0 < t.length && (n = new Un("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var Or = null, kr = null;
	function Ar(e) {
		Hf(e, 0);
	}
	function jr(e) {
		if (sn(Bt(e))) return e;
	}
	function Mr(e, t) {
		if (e === "change") return t;
	}
	var Nr = !1;
	if (Nn) {
		var Pr;
		if (Nn) {
			var Fr = "oninput" in document;
			if (!Fr) {
				var Ir = document.createElement("div");
				Ir.setAttribute("oninput", "return;"), Fr = typeof Ir.oninput == "function";
			}
			Pr = Fr;
		} else Pr = !1;
		Nr = Pr && (!document.documentMode || 9 < document.documentMode);
	}
	function Lr() {
		Or && (Or.detachEvent("onpropertychange", Rr), kr = Or = null);
	}
	function Rr(e) {
		if (e.propertyName === "value" && jr(kr)) {
			var t = [];
			Dr(t, kr, e, En(e)), jn(Ar, t);
		}
	}
	function zr(e, t, n) {
		e === "focusin" ? (Lr(), Or = t, kr = n, Or.attachEvent("onpropertychange", Rr)) : e === "focusout" && Lr();
	}
	function Br(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return jr(kr);
	}
	function Vr(e, t) {
		if (e === "click") return jr(t);
	}
	function Hr(e, t) {
		if (e === "input" || e === "change") return jr(t);
	}
	function Ur(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Wr = typeof Object.is == "function" ? Object.is : Ur;
	function Gr(e, t) {
		if (Wr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!He.call(t, i) || !Wr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Kr(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function qr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Jr(e, t) {
		var n = qr(e);
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
			n = qr(n);
		}
	}
	function Yr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Yr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Xr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Kr(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Kr(e.document);
		}
		return t;
	}
	function Zr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Qr = Nn && "documentMode" in document && 11 >= document.documentMode, $r = null, ei = null, ti = null, ni = !1;
	function ri(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		ni || $r == null || $r !== Kr(r) || (r = $r, "selectionStart" in r && Zr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), ti && Gr(ti, r) || (ti = r, r = Yf(ei, "onSelect"), 0 < r.length && (t = new Un("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = $r)));
	}
	function ii(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var ai = {
		animationend: ii("Animation", "AnimationEnd"),
		animationiteration: ii("Animation", "AnimationIteration"),
		animationstart: ii("Animation", "AnimationStart"),
		transitionrun: ii("Transition", "TransitionRun"),
		transitionstart: ii("Transition", "TransitionStart"),
		transitioncancel: ii("Transition", "TransitionCancel"),
		transitionend: ii("Transition", "TransitionEnd")
	}, oi = {}, si = {};
	Nn && (si = document.createElement("div").style, "AnimationEvent" in window || (delete ai.animationend.animation, delete ai.animationiteration.animation, delete ai.animationstart.animation), "TransitionEvent" in window || delete ai.transitionend.transition);
	function ci(e) {
		if (oi[e]) return oi[e];
		if (!ai[e]) return e;
		var t = ai[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in si) return oi[e] = t[n];
		return e;
	}
	var li = ci("animationend"), ui = ci("animationiteration"), di = ci("animationstart"), fi = ci("transitionrun"), pi = ci("transitionstart"), mi = ci("transitioncancel"), hi = ci("transitionend"), gi = /* @__PURE__ */ new Map(), _i = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	_i.push("scrollEnd");
	function vi(e, t) {
		gi.set(e, t), Kt(t, [e]);
	}
	var yi = 0;
	function bi(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = xd.identifierPrefix;
		var n = yi++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function xi(e) {
		if (e == null || typeof e == "string") return e;
		var t = null, n = kd;
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
	var L = typeof reportError == "function" ? reportError : function(e) {
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
	}, Ci = [], wi = 0, Ti = 0;
	function Ei() {
		for (var e = wi, t = Ti = wi = 0; t < e;) {
			var n = Ci[t];
			Ci[t++] = null;
			var r = Ci[t];
			Ci[t++] = null;
			var i = Ci[t];
			Ci[t++] = null;
			var a = Ci[t];
			if (Ci[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Ai(n, i, a);
		}
	}
	function Di(e, t, n, r) {
		Ci[wi++] = e, Ci[wi++] = t, Ci[wi++] = n, Ci[wi++] = r, Ti |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function Oi(e, t, n, r) {
		return Di(e, t, n, r), ji(e);
	}
	function ki(e, t) {
		return Di(e, null, null, t), ji(e);
	}
	function Ai(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - at(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function ji(e) {
		if (50 < Ad) throw Ad = 0, jd = null, Error(i(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var Mi = {};
	function Ni(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function Pi(e, t, n, r) {
		return new Ni(e, t, n, r);
	}
	function Fi(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Ii(e, t) {
		var n = e.alternate;
		return n === null ? (n = Pi(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 1206910976, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function Li(e, t) {
		e.flags &= 1206910978;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function Ri(e, t, n, r, a, o) {
		var s = 0;
		if (r = e, typeof r == "function") Fi(r) && (s = 1);
		else if (typeof r == "string") s = Jm(e, n, De.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case ue: return e = Pi(31, n, t, a), e.elementType = ue, e.lanes = o, e;
			case k: return zi(n.children, a, o, t);
			case ne:
				s = 8, a |= 24;
				break;
			case A: return e = Pi(12, n, t, a | 2), e.elementType = A, e.lanes = o, e;
			case oe: return e = Pi(13, n, t, a), e.elementType = oe, e.lanes = o, e;
			case se: return e = Pi(19, n, t, a), e.elementType = se, e.lanes = o, e;
			case de:
			case pe: return e = a | 32, e = Pi(30, n, t, e), e.elementType = pe, e.lanes = o, e.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, e;
			default:
				if (typeof r == "object" && r) switch (r.$$typeof) {
					case ie:
						s = 10;
						break a;
					case re:
						s = 9;
						break a;
					case ae:
						s = 11;
						break a;
					case ce:
						s = 14;
						break a;
					case le:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(i(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = Pi(s, n, t, a), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function zi(e, t, n, r) {
		return e = Pi(7, e, r, t), e.lanes = n, e;
	}
	function Bi(e, t, n) {
		return e = Pi(6, e, null, t), e.lanes = n, e;
	}
	function Vi(e) {
		var t = Pi(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function Hi(e, t, n) {
		return t = Pi(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Ui = /* @__PURE__ */ new WeakMap();
	function Wi(e, t) {
		if (typeof e == "object" && e) {
			var n = Ui.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: Ve(t)
			}, Ui.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: Ve(t)
		};
	}
	var Gi = [], Ki = 0, qi = null, Ji = 0, Yi = [], Xi = 0, Zi = null, Qi = 1, $i = "";
	function ea(e, t) {
		Gi[Ki++] = Ji, Gi[Ki++] = qi, qi = e, Ji = t;
	}
	function ta(e, t, n) {
		Yi[Xi++] = Qi, Yi[Xi++] = $i, Yi[Xi++] = Zi, Zi = e;
		var r = Qi;
		e = $i;
		var i = 32 - at(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - at(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, Qi = 1 << 32 - at(t) + i | n << i | r, $i = a + e;
		} else Qi = 1 << a | n << i | r, $i = e;
	}
	function na(e) {
		e.return !== null && (ea(e, 1), ta(e, 1, 0));
	}
	function R(e) {
		for (; e === qi;) qi = Gi[--Ki], Gi[Ki] = null, Ji = Gi[--Ki], Gi[Ki] = null;
		for (; e === Zi;) Zi = Yi[--Xi], Yi[Xi] = null, $i = Yi[--Xi], Yi[Xi] = null, Qi = Yi[--Xi], Yi[Xi] = null;
	}
	function ra(e, t) {
		Yi[Xi++] = Qi, Yi[Xi++] = $i, Yi[Xi++] = Zi, Qi = t.id, $i = t.overflow, Zi = e;
	}
	var ia = null, aa = null, z = !1, oa = null, sa = !1, ca = Error(i(519));
	function la(e) {
		throw ha(Wi(Error(i(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), ca;
	}
	function ua(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[kt] = e, t[At] = r, n) {
			case "dialog":
				Z("cancel", t), Z("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				Z("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < Bf.length; n++) Z(Bf[n], t);
				break;
			case "source":
				Z("error", t);
				break;
			case "img":
			case "image":
			case "link":
				Z("error", t), Z("load", t);
				break;
			case "details":
				Z("toggle", t);
				break;
			case "input":
				Z("invalid", t), dn(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Z("invalid", t);
				break;
			case "textarea": Z("invalid", t), hn(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || tp(t.textContent, n) ? (r.popover != null && (Z("beforetoggle", t), Z("toggle", t)), r.onScroll != null && Z("scroll", t), r.onScrollEnd != null && Z("scrollend", t), r.onClick != null && (t.onclick = wn), t = !0) : t = !1, t || la(e, !0);
	}
	function da(e) {
		for (ia = e.return; ia;) switch (ia.tag) {
			case 5:
			case 31:
			case 13:
				sa = !1;
				return;
			case 27:
			case 3:
				sa = !0;
				return;
			default: ia = ia.return;
		}
	}
	function fa(e) {
		if (e !== ia) return !1;
		if (!z) return da(e), z = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || mp(e.type, e.memoizedProps)), n = !n), n && aa && la(e), da(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			aa = fm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			aa = fm(e);
		} else t === 27 ? (t = aa, Cp(e.type) ? (e = dm, dm = null, aa = e) : aa = t) : aa = ia ? um(e.stateNode.nextSibling) : null;
		return !0;
	}
	function pa() {
		aa = ia = null, z = !1;
	}
	function ma() {
		var e = oa;
		return e !== null && (pd === null ? pd = e : pd.push.apply(pd, e), oa = null), e;
	}
	function ha(e) {
		oa === null ? oa = [e] : oa.push(e);
	}
	var ga = we(null), _a = null, va = null;
	function ya(e, t, n) {
		Ee(ga, t._currentValue), t._currentValue = n;
	}
	function ba(e) {
		e._currentValue = ga.current, Te(ga);
	}
	function xa(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Sa(e, t, n, r) {
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
						o.lanes |= n, c = o.alternate, c !== null && (c.lanes |= n), xa(o.return, n, e), r || (s = null);
						break a;
					}
					o = c.next;
				}
			} else if (a.tag === 18) {
				if (s = a.return, s === null) throw Error(i(341));
				s.lanes |= n, o = s.alternate, o !== null && (o.lanes |= n), xa(s, n, e), s = null;
			} else a.tag === 13 && a.memoizedState !== null && a.memoizedState.dehydrated === null ? (a.lanes |= n, s = a.alternate, s !== null && (s.lanes |= n), xa(a.return, n, e), s = a.child, s = s === null ? null : s.sibling) : s = a.child;
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
	function Ca(e, t, n, r) {
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
					Wr(a.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (a === Ae.current) {
				if (s = a.alternate, s === null) throw Error(i(387));
				s.memoizedState.memoizedState !== a.memoizedState.memoizedState && (e === null ? e = [ch] : e.push(ch));
			}
			a = a.return;
		}
		return e !== null && Sa(t, e, n, r), t.flags |= 262144, e !== null;
	}
	function wa(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Wr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function Ta(e) {
		_a = e, va = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function Ea(e) {
		return Oa(_a, e);
	}
	function Da(e, t) {
		return _a === null && Ta(e), Oa(e, t);
	}
	function Oa(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, va === null) {
			if (e === null) throw Error(i(308));
			va = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else va = va.next = t;
		return n;
	}
	var ka = typeof AbortController < "u" ? AbortController : function() {
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
	}, Aa = t.unstable_scheduleCallback, ja = t.unstable_NormalPriority, Ma = {
		$$typeof: ie,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function Na() {
		return {
			controller: new ka(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function Pa(e) {
		e.refCount--, e.refCount === 0 && Aa(ja, function() {
			e.controller.abort();
		});
	}
	function Fa(e, t) {
		if (e.pendingLanes & 4194048) {
			var n = e.transitionTypes;
			for (n === null && (n = e.transitionTypes = []), e = 0; e < t.length; e++) {
				var r = t[e];
				n.indexOf(r) === -1 && n.push(r);
			}
		}
	}
	var Ia = null;
	function La(e) {
		var t = e.transitionTypes;
		return e.transitionTypes = null, t;
	}
	var Ra = null, za = 0, Ba = 0, Va = null;
	function Ha(e, t) {
		if (Ra === null) {
			var n = Ra = [];
			za = 0, Ba = Ff(), Va = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return za++, t.then(Ua, Ua), t;
	}
	function Ua() {
		if (--za === 0 && (Ia = null, Ra !== null)) {
			Va !== null && (Va.status = "fulfilled");
			var e = Ra;
			Ra = null, Ba = 0, Va = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function Wa(e, t) {
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
	var Ga = j.S;
	j.S = function(e, t) {
		if (gd = qe(), typeof t == "object" && t && typeof t.then == "function" && Ha(e, t), Ia !== null) for (var n = xf; n !== null;) Fa(n, Ia), n = n.next;
		if (n = e.types, n !== null) {
			for (var r = xf; r !== null;) Fa(r, n), r = r.next;
			if (Ba !== 0) {
				r = Ia, r === null && (r = Ia = []);
				for (var i = 0; i < n.length; i++) {
					var a = n[i];
					r.indexOf(a) === -1 && r.push(a);
				}
			}
		}
		Ga !== null && Ga(e, t);
	};
	var Ka = we(null);
	function qa() {
		var e = Ka.current;
		return e === null ? $u.pooledCache : e;
	}
	function Ja(e, t) {
		t === null ? Ee(Ka, Ka.current) : Ee(Ka, t.pool);
	}
	function Ya() {
		var e = qa();
		return e === null ? null : {
			parent: Ma._currentValue,
			pool: e
		};
	}
	var Xa = Error(i(460)), Za = Error(i(474)), B = Error(i(542)), Qa = { then: function() {} };
	function $a(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function eo(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(wn, wn), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, io(e), e === void 0 && !("reason" in t) ? Error(i(600)) : e;
			default:
				if (typeof t.status == "string") t.then(wn, wn);
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
					case "rejected": throw e = t.reason, io(e), e;
				}
				throw no = t, Xa;
		}
	}
	function to(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (no = e, Xa) : e;
		}
	}
	var no = null;
	function ro() {
		if (no === null) throw Error(i(459));
		var e = no;
		return no = null, e;
	}
	function io(e) {
		if (e === Xa || e === B) throw Error(i(483));
	}
	var ao = null, oo = 0;
	function so(e) {
		var t = oo;
		return oo += 1, ao === null && (ao = []), eo(ao, e, t);
	}
	function co(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function lo(e, t) {
		throw t.$$typeof === ee ? Error(i(525)) : (e = Object.prototype.toString.call(t), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function uo(e) {
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
			return e = Ii(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 134217730, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 134217730), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Bi(n, e.mode, r), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var i = n.type;
			return i === k ? (e = d(e, t, n.props.children, r, n.key), co(e, n), e) : t !== null && (t.elementType === i || typeof i == "object" && i && i.$$typeof === le && to(i) === t.type) ? (t = a(t, n.props), co(t, n), t.return = e, t) : (t = Ri(n.type, n.key, n.props, null, e.mode, r), co(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = Hi(n, e.mode, r), t.return = e, t) : (t = a(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, i) {
			return t === null || t.tag !== 7 ? (t = zi(n, e.mode, r, i), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Bi("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case te: return n = Ri(t.type, t.key, t.props, null, e.mode, n), co(n, t), n.return = e, n;
					case O: return t = Hi(t, e.mode, n), t.return = e, t;
					case le: return t = to(t), f(e, t, n);
				}
				if (ye(t) || ge(t)) return t = zi(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, so(t), n);
				if (t.$$typeof === ie) return f(e, Da(e, t), n);
				lo(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case te: return n.key === i ? l(e, t, n, r) : null;
					case O: return n.key === i ? u(e, t, n, r) : null;
					case le: return n = to(n), p(e, t, n, r);
				}
				if (ye(n) || ge(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, so(n), r);
				if (n.$$typeof === ie) return p(e, t, Da(e, n), r);
				lo(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case te: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case O: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case le: return r = to(r), m(e, t, n, r, i);
				}
				if (ye(r) || ge(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, so(r), i);
				if (r.$$typeof === ie) return m(e, t, n, Da(t, r), i);
				lo(t, r);
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
			if (h === s.length) return n(i, d), z && ea(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return z && ea(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), z && ea(i, h), l;
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
			if (v.done) return n(a, h), z && ea(a, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(a, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return z && ea(a, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, a, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(a, e);
			}), z && ea(a, g), u;
		}
		function _(e, r, o, c) {
			if (typeof o == "object" && o && o.type === k && o.key === null && o.props.ref === void 0 && (o = o.props.children), typeof o == "object" && o) {
				switch (o.$$typeof) {
					case te:
						a: {
							for (var l = o.key; r !== null;) {
								if (r.key === l) {
									if (l = o.type, l === k) {
										if (r.tag === 7) {
											n(e, r.sibling), c = a(r, o.props.children), co(c, o), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === le && to(l) === r.type) {
										n(e, r.sibling), c = a(r, o.props), co(c, o), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							o.type === k ? (c = zi(o.props.children, e.mode, c, o.key), co(c, o), c.return = e, e = c) : (c = Ri(o.type, o.key, o.props, null, e.mode, c), co(c, o), c.return = e, e = c);
						}
						return s(e);
					case O:
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
							c = Hi(o, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case le: return o = to(o), _(e, r, o, c);
				}
				if (ye(o)) return h(e, r, o, c);
				if (ge(o)) {
					if (l = ge(o), typeof l != "function") throw Error(i(150));
					return o = l.call(o), g(e, r, o, c);
				}
				if (typeof o.then == "function") return _(e, r, so(o), c);
				if (o.$$typeof === ie) return _(e, r, Da(e, o), c);
				lo(e, o);
			}
			return typeof o == "string" && o !== "" || typeof o == "number" || typeof o == "bigint" ? (o = "" + o, r !== null && r.tag === 6 ? (n(e, r.sibling), c = a(r, o), c.return = e, e = c) : (n(e, r), c = Bi(o, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				oo = 0;
				var i = _(e, t, n, r);
				return ao = null, i;
			} catch (t) {
				if (t === Xa || t === B) throw t;
				var a = Pi(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var fo = uo(!0), po = uo(!1), mo = !1;
	function ho(e) {
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
	function go(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function _o(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function vo(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, Qu & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = ji(e), Ai(e, null, n), t;
		}
		return Di(e, r, t, n), ji(e);
	}
	function yo(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, St(e, n);
		}
	}
	function bo(e, t) {
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
	var xo = !1;
	function So() {
		if (xo) {
			var e = Va;
			if (e !== null) throw e;
		}
	}
	function Co(e, t, n, r) {
		xo = !1;
		var i = e.updateQueue;
		mo = !1;
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
					f !== 0 && f === Ba && (xo = !0), u !== null && (u = u.next = {
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
							case 2: mo = !0;
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
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), sd |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function wo(e, t) {
		if (typeof e != "function") throw Error(i(191, e));
		e.call(t);
	}
	function To(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) wo(n[e], t);
	}
	var Eo = we(null), Do = we(0);
	function Oo(e, t) {
		e = ad, Ee(Do, e), Ee(Eo, t), ad = e | t.baseLanes;
	}
	function ko() {
		Ee(Do, ad), Ee(Eo, Eo.current);
	}
	function Ao() {
		ad = Do.current, Te(Eo), Te(Do);
	}
	var jo = we(null), Mo = null;
	function No(e) {
		var t = e.alternate;
		Ee(Ro, Ro.current & 1), Ee(jo, e), Mo === null && (t === null || Eo.current !== null || t.memoizedState !== null) && (Mo = e);
	}
	function Po(e) {
		Ee(Ro, Ro.current), Ee(jo, e), Mo === null && (Mo = e);
	}
	function Fo(e) {
		e.tag === 22 ? (Ee(Ro, Ro.current), Ee(jo, e), Mo === null && (Mo = e)) : Io();
	}
	function Io() {
		Ee(Ro, Ro.current), Ee(jo, jo.current);
	}
	function Lo(e) {
		Te(jo), Mo === e && (Mo = null), Te(Ro);
	}
	var Ro = we(0);
	function zo(e, t) {
		Ee(jo, jo.current), Ee(Ro, t);
	}
	function Bo(e) {
		Te(Ro), Te(jo), Mo === e && (Mo = null);
	}
	function Vo(e) {
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
	var Ho = 0, V = null, Uo = null, Wo = null, Go = !1, Ko = !1, qo = !1, Jo = 0, Yo = 0, Xo = null, Zo = 0;
	function Qo() {
		throw Error(i(321));
	}
	function $o(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Wr(e[n], t[n])) return !1;
		return !0;
	}
	function es(e, t, n, r, i, a) {
		return Ho = a, V = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, j.H = e === null || e.memoizedState === null ? hc : gc, qo = !1, a = n(r, i), qo = !1, Ko && (a = ns(t, n, r, i)), ts(e), a;
	}
	function ts(e) {
		j.H = mc;
		var t = Uo !== null && Uo.next !== null;
		if (Ho = 0, Wo = Uo = V = null, Go = !1, Yo = 0, Xo = null, t) throw Error(i(300));
		e === null || Nc || (e = e.dependencies, e !== null && wa(e) && (Nc = !0));
	}
	function ns(e, t, n, r) {
		V = e;
		var a = 0;
		do {
			if (Ko && (Xo = null), Yo = 0, Ko = !1, 25 <= a) throw Error(i(301));
			if (a += 1, Wo = Uo = null, e.updateQueue != null) {
				var o = e.updateQueue;
				o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
			}
			j.H = _c, o = t(n, r);
		} while (Ko);
		return o;
	}
	function rs() {
		var e = j.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? us(t) : t, e = e.useState()[0], (Uo === null ? null : Uo.memoizedState) !== e && (V.flags |= 1024), t;
	}
	function is() {
		var e = Jo !== 0;
		return Jo = 0, e;
	}
	function as(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function os(e) {
		if (Go) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			Go = !1;
		}
		Ho = 0, Wo = Uo = V = null, Ko = !1, Yo = Jo = 0, Xo = null;
	}
	function ss() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return Wo === null ? V.memoizedState = Wo = e : Wo = Wo.next = e, Wo;
	}
	function cs() {
		if (Uo === null) {
			var e = V.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = Uo.next;
		var t = Wo === null ? V.memoizedState : Wo.next;
		if (t !== null) Wo = t, Uo = e;
		else {
			if (e === null) throw V.alternate === null ? Error(i(467)) : Error(i(310));
			Uo = e, e = {
				memoizedState: Uo.memoizedState,
				baseState: Uo.baseState,
				baseQueue: Uo.baseQueue,
				queue: Uo.queue,
				next: null
			}, Wo === null ? V.memoizedState = Wo = e : Wo = Wo.next = e;
		}
		return Wo;
	}
	function ls() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function us(e) {
		var t = Yo;
		return Yo += 1, Xo === null && (Xo = []), e = eo(Xo, e, t), t = V, (Wo === null ? t.memoizedState : Wo.next) === null && (t = t.alternate, j.H = t === null || t.memoizedState === null ? hc : gc), e;
	}
	function ds(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return us(e);
			if (e.$$typeof === me) return;
			if (e.$$typeof === ie) return Ea(e);
		}
		throw Error(i(438, String(e)));
	}
	function fs(e) {
		var t = null, n = V.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = V.alternate;
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
		}, n === null && (n = ls(), V.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = fe;
		return t.index++, n;
	}
	function ps(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function ms(e) {
		return hs(cs(), Uo, e);
	}
	function hs(e, t, n) {
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
				if (f === u.lane ? (Ho & f) === f : (Y & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === Ba && (d = !0);
					else if ((Ho & p) === p) {
						u = u.next, p === Ba && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = o) : l = l.next = f, V.lanes |= p, sd |= p;
					f = u.action, qo && n(o, f), o = u.hasEagerState ? u.eagerState : n(o, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = o) : l = l.next = p, V.lanes |= f, sd |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = o : l.next = c, !Wr(o, e.memoizedState) && (Nc = !0, d && (n = Va, n !== null))) throw n;
			e.memoizedState = o, e.baseState = s, e.baseQueue = l, r.lastRenderedState = o;
		}
		return a === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function gs(e) {
		var t = cs(), n = t.queue;
		if (n === null) throw Error(i(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, a = n.pending, o = t.memoizedState;
		if (a !== null) {
			n.pending = null;
			var s = a = a.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== a);
			Wr(o, t.memoizedState) || (Nc = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function _s(e, t, n) {
		var r = V, a = cs(), o = z;
		if (o) {
			if (n === void 0) throw Error(i(407));
			n = n();
		} else n = t();
		var s = !Wr((Uo || a).memoizedState, n);
		if (s && (a.memoizedState = n, Nc = !0), a = a.queue, Hs(bs.bind(null, r, a, e), [e]), e = a.getSnapshot !== t || s || Wo !== null && !!(Wo.memoizedState.tag & 1), Ls(e ? 9 : 8, { destroy: void 0 }, ys.bind(null, r, a, n, t), null), e) {
			if (r.flags |= 2048, $u === null) throw Error(i(349));
			o || Ho & 127 || vs(r, t, n);
		}
		return n;
	}
	function vs(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = V.updateQueue, t === null ? (t = ls(), V.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function ys(e, t, n, r) {
		t.value = n, t.getSnapshot = r, xs(t) && Ss(e);
	}
	function bs(e, t, n) {
		return n(function() {
			xs(t) && Ss(e);
		});
	}
	function xs(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Wr(e, n);
		} catch {
			return !0;
		}
	}
	function Ss(e) {
		var t = ki(e, 2);
		t !== null && Fd(t, e, 2);
	}
	function Cs(e) {
		var t = ss();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), qo) {
				it(!0);
				try {
					n();
				} finally {
					it(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ps,
			lastRenderedState: e
		}, t;
	}
	function ws(e, t, n, r) {
		return e.baseState = n, hs(e, Uo, typeof r == "function" ? r : ps);
	}
	function Ts(e, t, n, r, a) {
		if (dc(e)) throw Error(i(485));
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
			j.T === null ? o.isTransition = !1 : n(!0), r(o), n = t.pending, n === null ? (o.next = t.pending = o, Es(t, o)) : (o.next = n.next, t.pending = n.next = o);
		}
	}
	function Es(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = j.T, o = {};
			o.types = a === null ? null : a.types, j.T = o;
			try {
				var s = n(i, r), c = j.S;
				c !== null && c(o, s), Ds(e, t, s);
			} catch (n) {
				ks(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), j.T = a;
			}
		} else try {
			a = n(i, r), Ds(e, t, a);
		} catch (n) {
			ks(e, t, n);
		}
	}
	function Ds(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Os(e, t, n);
		}, function(n) {
			return ks(e, t, n);
		}) : Os(e, t, n);
	}
	function Os(e, t, n) {
		t.status = "fulfilled", t.value = n, As(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Es(e, n)));
	}
	function ks(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, As(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function As(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function js(e, t) {
		return t;
	}
	function Ms(e, t) {
		if (z) {
			var n = $u.formState;
			if (n !== null) {
				a: {
					var r = V;
					if (z) {
						if (aa) {
							b: {
								for (var i = aa, a = sa; i.nodeType !== 8;) if (!a || (i = um(i.nextSibling), i === null)) {
									i = null;
									break b;
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								aa = um(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						la(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = ss(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: js,
			lastRenderedState: t
		}, n.queue = r, n = cc.bind(null, V, r), r.dispatch = n, r = Cs(!1), a = uc.bind(null, V, !1, r.queue), r = ss(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Ts.bind(null, V, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function Ns(e) {
		return Ps(cs(), Uo, e);
	}
	function Ps(e, t, n) {
		if (t = hs(e, t, js)[0], e = ms(ps)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = us(t);
		} catch (e) {
			throw e === Xa ? B : e;
		}
		else r = t;
		t = cs();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (V.flags |= 2048, Ls(9, { destroy: void 0 }, Fs.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Fs(e, t) {
		e.action = t;
	}
	function Is(e) {
		var t = cs(), n = Uo;
		if (n !== null) return Ps(t, n, e);
		cs(), t = t.memoizedState, n = cs();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function Ls(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = V.updateQueue, t === null && (t = ls(), V.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function Rs() {
		return cs().memoizedState;
	}
	function zs(e, t, n, r) {
		var i = ss();
		V.flags |= e, i.memoizedState = Ls(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function Bs(e, t, n, r) {
		var i = cs();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		Uo !== null && r !== null && $o(r, Uo.memoizedState.deps) ? i.memoizedState = Ls(t, a, n, r) : (V.flags |= e, i.memoizedState = Ls(1 | t, a, n, r));
	}
	function Vs(e, t) {
		zs(8390656, 8, e, t);
	}
	function Hs(e, t) {
		Bs(2048, 8, e, t);
	}
	function Us(e) {
		V.flags |= 4;
		var t = V.updateQueue;
		if (t === null) t = ls(), V.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function Ws(e) {
		var t = cs().memoizedState;
		return Us({
			ref: t,
			nextImpl: e
		}), function() {
			if (Qu & 2) throw Error(i(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function Gs(e, t) {
		return Bs(4, 2, e, t);
	}
	function H(e, t) {
		return Bs(4, 4, e, t);
	}
	function Ks(e, t) {
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
	function qs(e, t, n) {
		n = n == null ? null : n.concat([e]), Bs(4, 4, Ks.bind(null, t, e), n);
	}
	function Js() {}
	function Ys(e, t) {
		var n = cs();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && $o(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Xs(e, t) {
		var n = cs();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && $o(t, r[1])) return r[0];
		if (r = e(), qo) {
			it(!0);
			try {
				e();
			} finally {
				it(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function U(e, t, n) {
		return n === void 0 || Ho & 1073741824 && !(Y & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Nd(), V.lanes |= e, sd |= e, n);
	}
	function Zs(e, t, n, r) {
		return Wr(n, t) ? n : Eo.current === null ? !(Ho & 106) || Ho & 1073741824 && !(Y & 261930) ? (Nc = !0, e.memoizedState = n) : (e = Nd(), V.lanes |= e, sd |= e, t) : (e = U(e, n, r), Wr(e, t) || (Nc = !0), e);
	}
	function Qs(e, t, n, r, i) {
		var a = be.p;
		be.p = a !== 0 && 8 > a ? a : 8;
		var o = j.T, s = {};
		s.types = o === null ? null : o.types, j.T = s, uc(e, !1, t, n);
		try {
			var c = i(), l = j.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? lc(e, t, Wa(c, r), Md(e)) : lc(e, t, r, Md(e));
		} catch (n) {
			lc(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, Md());
		} finally {
			be.p = a, o !== null && s.types !== null && (o.types = s.types), j.T = o;
		}
	}
	function $s() {}
	function ec(e, t, n, r) {
		if (e.tag !== 5) throw Error(i(476));
		var a = tc(e).queue;
		Qs(e, a, t, xe, n === null ? $s : function() {
			return nc(e), n(r);
		});
	}
	function tc(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: xe,
			baseState: xe,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ps,
				lastRenderedState: xe
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
				lastRenderedReducer: ps,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function nc(e) {
		var t = tc(e);
		t.next === null && (t = e.alternate.memoizedState), lc(e, t.next.queue, {}, Md());
	}
	function rc() {
		return Ea(ch);
	}
	function ic() {
		return cs().memoizedState;
	}
	function ac() {
		return cs().memoizedState;
	}
	function oc(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = Md();
					e = _o(n);
					var r = vo(t, e, n);
					r !== null && (Fd(r, t, n), yo(r, t, n)), t = { cache: Na() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function sc(e, t, n) {
		var r = Md();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, dc(e) ? fc(t, n) : (n = Oi(e, t, n, r), n !== null && (Fd(n, e, r), pc(n, t, r)));
	}
	function cc(e, t, n) {
		lc(e, t, n, Md());
	}
	function lc(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (dc(e)) fc(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Wr(s, o)) return Di(e, t, i, 0), $u === null && Ei(), !1;
			} catch {}
			if (n = Oi(e, t, i, r), n !== null) return Fd(n, e, r), pc(n, t, r), !0;
		}
		return !1;
	}
	function uc(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: Ff(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, dc(e)) {
			if (t) throw Error(i(479));
		} else t = Oi(e, n, r, 2), t !== null && Fd(t, e, 2);
	}
	function dc(e) {
		var t = e.alternate;
		return e === V || t !== null && t === V;
	}
	function fc(e, t) {
		Ko = Go = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function pc(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, St(e, n);
		}
	}
	var mc = {
		readContext: Ea,
		use: ds,
		useCallback: Qo,
		useContext: Qo,
		useEffect: Qo,
		useImperativeHandle: Qo,
		useLayoutEffect: Qo,
		useInsertionEffect: Qo,
		useMemo: Qo,
		useReducer: Qo,
		useRef: Qo,
		useState: Qo,
		useDebugValue: Qo,
		useDeferredValue: Qo,
		useTransition: Qo,
		useSyncExternalStore: Qo,
		useId: Qo,
		useHostTransitionStatus: Qo,
		useFormState: Qo,
		useActionState: Qo,
		useOptimistic: Qo,
		useMemoCache: Qo,
		useCacheRefresh: Qo,
		useEffectEvent: Qo
	}, hc = {
		readContext: Ea,
		use: ds,
		useCallback: function(e, t) {
			return ss().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Ea,
		useEffect: Vs,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), zs(4194308, 4, Ks.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return zs(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			zs(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = ss();
			t = t === void 0 ? null : t;
			var r = e();
			if (qo) {
				it(!0);
				try {
					e();
				} finally {
					it(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = ss();
			if (n !== void 0) {
				var i = n(t);
				if (qo) {
					it(!0);
					try {
						n(t);
					} finally {
						it(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = sc.bind(null, V, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = ss();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = Cs(e);
			var t = e.queue, n = cc.bind(null, V, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: Js,
		useDeferredValue: function(e, t) {
			return U(ss(), e, t);
		},
		useTransition: function() {
			var e = Cs(!1);
			return e = Qs.bind(null, V, e.queue, !0, !1), ss().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = V, a = ss();
			if (z) {
				if (n === void 0) throw Error(i(407));
				n = n();
			} else {
				if (n = t(), $u === null) throw Error(i(349));
				Y & 127 || vs(r, t, n);
			}
			a.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return a.queue = o, Vs(bs.bind(null, r, o, e), [e]), r.flags |= 2048, Ls(9, { destroy: void 0 }, ys.bind(null, r, o, n, t), null), n;
		},
		useId: function() {
			var e = ss(), t = $u.identifierPrefix;
			if (z) {
				var n = $i, r = Qi;
				n = (r & ~(1 << 32 - at(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Jo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = Zo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: rc,
		useFormState: Ms,
		useActionState: Ms,
		useOptimistic: function(e) {
			var t = ss();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = uc.bind(null, V, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: fs,
		useCacheRefresh: function() {
			return ss().memoizedState = oc.bind(null, V);
		},
		useEffectEvent: function(e) {
			var t = ss(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (Qu & 2) throw Error(i(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, gc = {
		readContext: Ea,
		use: ds,
		useCallback: Ys,
		useContext: Ea,
		useEffect: Hs,
		useImperativeHandle: qs,
		useInsertionEffect: Gs,
		useLayoutEffect: H,
		useMemo: Xs,
		useReducer: ms,
		useRef: Rs,
		useState: function() {
			return ms(ps);
		},
		useDebugValue: Js,
		useDeferredValue: function(e, t) {
			return Zs(cs(), Uo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = ms(ps)[0], t = cs().memoizedState;
			return [typeof e == "boolean" ? e : us(e), t];
		},
		useSyncExternalStore: _s,
		useId: ic,
		useHostTransitionStatus: rc,
		useFormState: Ns,
		useActionState: Ns,
		useOptimistic: function(e, t) {
			return ws(cs(), Uo, e, t);
		},
		useMemoCache: fs,
		useCacheRefresh: ac,
		useEffectEvent: Ws
	}, _c = {
		readContext: Ea,
		use: ds,
		useCallback: Ys,
		useContext: Ea,
		useEffect: Hs,
		useImperativeHandle: qs,
		useInsertionEffect: Gs,
		useLayoutEffect: H,
		useMemo: Xs,
		useReducer: gs,
		useRef: Rs,
		useState: function() {
			return gs(ps);
		},
		useDebugValue: Js,
		useDeferredValue: function(e, t) {
			var n = cs();
			return Uo === null ? U(n, e, t) : Zs(n, Uo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = gs(ps)[0], t = cs().memoizedState;
			return [typeof e == "boolean" ? e : us(e), t];
		},
		useSyncExternalStore: _s,
		useId: ic,
		useHostTransitionStatus: rc,
		useFormState: Is,
		useActionState: Is,
		useOptimistic: function(e, t) {
			var n = cs();
			return Uo === null ? (n.baseState = e, [e, n.queue.dispatch]) : ws(n, Uo, e, t);
		},
		useMemoCache: fs,
		useCacheRefresh: ac,
		useEffectEvent: Ws
	};
	function vc(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : D({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var yc = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = Md(), i = _o(r);
			i.payload = t, n != null && (i.callback = n), t = vo(e, i, r), t !== null && (Fd(t, e, r), yo(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = Md(), i = _o(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = vo(e, i, r), t !== null && (Fd(t, e, r), yo(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = Md(), r = _o(n);
			r.tag = 2, t != null && (r.callback = t), t = vo(e, r, n), t !== null && (Fd(t, e, n), yo(t, e, n));
		}
	};
	function bc(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Gr(n, r) || !Gr(i, a) : !0;
	}
	function xc(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && yc.enqueueReplaceState(t, t.state, null);
	}
	function Sc(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = D({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Cc(e) {
		L(e);
	}
	function wc(e) {
		console.error(e);
	}
	function Tc(e) {
		L(e);
	}
	function Ec(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Dc(e, t, n) {
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
	function Oc(e, t, n) {
		return n = _o(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Ec(e, t);
		}, n;
	}
	function kc(e) {
		return e = _o(e), e.tag = 3, e;
	}
	function Ac(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Dc(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Dc(t, n, r), typeof i != "function" && (yd === null ? yd = /* @__PURE__ */ new Set([this]) : yd.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function jc(e, t, n, r, a) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Ca(t, n, a, !0), n = jo.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13:
					case 19: return Mo === null ? qd() : n.alternate === null && od === 0 && (od = 3), n.flags &= -257, n.flags |= 65536, n.lanes = a, r === Qa ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), hf(e, r, a)), !1;
					case 22: return n.flags |= 65536, r === Qa ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), hf(e, r, a)), !1;
				}
				throw Error(i(435, n.tag));
			}
			return hf(e, r, a), qd(), !1;
		}
		if (z) return t = jo.current, t === null ? (r !== ca && (t = Error(i(423), { cause: r }), ha(Wi(t, n))), e = e.current.alternate, e.flags |= 65536, a &= -a, e.lanes |= a, r = Wi(r, n), a = Oc(e.stateNode, r, a), bo(e, a), od !== 4 && (od = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = a, r !== ca && (e = Error(i(422), { cause: r }), ha(Wi(e, n)))), !1;
		var o = Error(i(520), { cause: r });
		if (o = Wi(o, n), fd === null ? fd = [o] : fd.push(o), od !== 4 && (od = 2), t === null) return !0;
		r = Wi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = a & -a, n.lanes |= e, e = Oc(n.stateNode, r, e), bo(n, e), !1;
				case 1:
					if (t = n.type, o = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (yd === null || !yd.has(o)))) return n.flags |= 65536, a &= -a, n.lanes |= a, a = kc(a), Ac(a, e, n, r), bo(n, a), !1;
					break;
				case 22: if (n.memoizedState !== null) return n.flags |= 65536, !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Mc = Error(i(461)), Nc = !1;
	function W(e, t, n, r) {
		t.child = e === null ? po(t, null, n, r) : fo(t, e.child, n, r);
	}
	function Pc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Ta(t), r = es(e, t, n, o, a, i), s = is(), e !== null && !Nc ? (as(e, t, i), ol(e, t, i)) : (z && s && na(t), t.flags |= 1, W(e, t, r, i), t.child);
	}
	function G(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Fi(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, Fc(e, t, a, r, i)) : (e = Ri(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !sl(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Gr : n, n(o, r) && e.ref === t.ref) return ol(e, t, i);
		}
		return t.flags |= 1, e = Ii(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Fc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Gr(a, r) && e.ref === t.ref) {
				if (Nc = !1, t.pendingProps = r = a, sl(e, i)) e.flags & 131072 && (Nc = !0);
				else return t.lanes = e.lanes, ol(e, t, i);
			}
		}
		return Uc(e, t, n, r, i);
	}
	function Ic(e, t, n, r) {
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
				return Rc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Ja(t, a === null ? null : a.cachePool), a === null ? ko() : Oo(t, a), Fo(t);
			else return r = t.lanes = 536870912, Rc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Ja(t, null), ko(), Io()) : (Ja(t, a.cachePool), Oo(t, a), Io(), t.memoizedState = null);
		return W(e, t, i, n), t.child;
	}
	function Lc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function Rc(e, t, n, r, i) {
		var a = qa();
		return a = a === null ? null : {
			parent: Ma._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Ja(t, null), ko(), Fo(t), e !== null && Ca(e, t, r, !0), t.childLanes = i, null;
	}
	function zc(e, t) {
		return t = Qc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Bc(e, t, n) {
		return fo(t, e.child, null, n), e = zc(t, t.pendingProps), e.flags |= 2, Lo(t), t.memoizedState = null, e;
	}
	function Vc(e, t, n) {
		var r = t.pendingProps, a = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (z) {
				if (r.mode === "hidden") return e = zc(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, Lc(null, e);
				if (Po(t), (e = aa) ? (e = om(e, sa), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Zi === null ? null : {
						id: Qi,
						overflow: $i
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Vi(e), n.return = t, t.child = n, ia = t, aa = null)) : e = null, e === null) throw la(t);
				return t.lanes = 536870912, null;
			}
			return zc(t, r);
		}
		var o = e.memoizedState;
		if (o !== null) {
			var s = o.dehydrated;
			if (Po(t), a) {
				if (t.flags & 256) t.flags &= -257, t = Bc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(i(558));
			} else if (Nc || Ca(e, t, n, !1), a = (n & e.childLanes) !== 0, Nc || a) {
				if (Eo.current === null) {
					if (r = $u, r !== null && (s = Ct(r, n), s !== 0 && s !== o.retryLane)) throw o.retryLane = s, ki(e, s), Fd(r, e, s), Mc;
					qd();
				}
				t = Bc(e, t, n);
			} else e = o.treeContext, aa = um(s.nextSibling), ia = t, z = !0, oa = null, sa = !1, e !== null && ra(t, e), t = zc(t, r), t.flags |= 134221824;
			return t;
		}
		return e = Ii(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function Hc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(i(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function Uc(e, t, n, r, i) {
		return Ta(t), n = es(e, t, n, r, void 0, i), r = is(), e !== null && !Nc ? (as(e, t, i), ol(e, t, i)) : (z && r && na(t), t.flags |= 1, W(e, t, n, i), t.child);
	}
	function Wc(e, t, n, r, i, a) {
		return Ta(t), t.updateQueue = null, n = ns(t, r, n, i), ts(e), r = is(), e !== null && !Nc ? (as(e, t, a), ol(e, t, a)) : (z && r && na(t), t.flags |= 1, W(e, t, n, a), t.child);
	}
	function Gc(e, t, n, r, i) {
		if (Ta(t), t.stateNode === null) {
			var a = Mi, o = n.contextType;
			typeof o == "object" && o && (a = Ea(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = yc, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, ho(t), o = n.contextType, a.context = typeof o == "object" && o ? Ea(o) : Mi, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (vc(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && yc.enqueueReplaceState(a, a.state, null), Co(t, r, a, i), So(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Sc(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = Mi, typeof u == "object" && u && (o = Ea(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && xc(t, a, r, o), mo = !1;
			var f = t.memoizedState;
			a.state = f, Co(t, r, a, i), So(), l = t.memoizedState, s || f !== l || mo ? (typeof d == "function" && (vc(t, n, d, r), l = t.memoizedState), (c = mo || bc(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, go(e, t), o = t.memoizedProps, u = Sc(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = Mi, typeof l == "object" && l && (c = Ea(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && xc(t, a, r, c), mo = !1, f = t.memoizedState, a.state = f, Co(t, r, a, i), So();
			var p = t.memoizedState;
			o !== d || f !== p || mo || e !== null && e.dependencies !== null && wa(e.dependencies) ? (typeof s == "function" && (vc(t, n, s, r), p = t.memoizedState), (u = mo || bc(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && wa(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, Hc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = fo(t, e.child, null, i), t.child = fo(t, null, n, i)) : W(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = ol(e, t, i), e;
	}
	function Kc(e, t, n, r) {
		return pa(), t.flags |= 256, W(e, t, n, r), t.child;
	}
	var qc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Jc(e) {
		return {
			baseLanes: e,
			cachePool: Ya()
		};
	}
	function Yc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ud), e;
	}
	function Xc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(Ro.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (z) {
				if (i ? No(t) : Io(), (e = aa) ? (e = om(e, sa), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Zi === null ? null : {
						id: Qi,
						overflow: $i
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Vi(e), n.return = t, t.child = n, ia = t, aa = null)) : e = null, e === null) throw la(t);
				return t.lanes = cm(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (Io(), i = t.mode, a = Qc({
				mode: "hidden",
				children: a
			}, i), r = zi(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = Jc(n), r.childLanes = Yc(e, o, n), t.memoizedState = qc, Lc(null, r)) : (No(t), Zc(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return K(e, t, a, o, r, c, s, n);
		}
		return i ? (Io(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = Ii(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = zi(i, a, n, null), i.flags |= 2) : i = Ii(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, Lc(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = Jc(n) : (a = i.cachePool, a === null ? a = Ya() : (s = Ma._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = Yc(e, o, n), t.memoizedState = qc, Lc(e.child, r)) : (No(t), n = e.child, e = n.sibling, n = Ii(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function Zc(e, t) {
		return t = Qc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function Qc(e, t) {
		return e = Pi(22, e, null, t), e.lanes = 0, e;
	}
	function $c(e, t, n) {
		return fo(t, e.child, null, n), e = Zc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function K(e, t, n, r, a, o, s, c) {
		if (n) return t.flags & 256 ? (No(t), t.flags &= -257, $c(e, t, c)) : t.memoizedState === null ? (Io(), o = a.fallback, s = t.mode, a = Qc({
			mode: "visible",
			children: a.children
		}, s), o = zi(o, s, c, null), o.flags |= 2, a.return = t, o.return = t, a.sibling = o, t.child = a, fo(t, e.child, null, c), a = t.child, a.memoizedState = Jc(c), a.childLanes = Yc(e, r, c), t.memoizedState = qc, Lc(null, a)) : (Io(), t.child = e.child, t.flags |= 128, null);
		if (No(t), cm(o)) {
			if (r = o.nextSibling && o.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (a = Error(i(419)), a.stack = "", a.digest = r, ha({
				value: a,
				source: null,
				stack: null
			})), $c(e, t, c);
		}
		if (Nc || Ca(e, t, c, !1), r = (c & e.childLanes) !== 0, Nc || r) {
			if (Eo.current !== null) return $c(e, t, c);
			if (r = $u, r !== null && (a = Ct(r, c), a !== 0 && a !== s.retryLane)) throw s.retryLane = a, ki(e, a), Fd(r, e, a), Mc;
			return sm(o) || qd(), $c(e, t, c);
		}
		return sm(o) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, aa = um(o.nextSibling), ia = t, z = !0, oa = null, sa = !1, e !== null && ra(t, e), t = Zc(t, a.children), t.flags |= 134221824, t);
	}
	function el(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), xa(e.return, t, n);
	}
	function tl(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && Vo(n) === null && (t = e), e = e.sibling;
		}
		return t;
	}
	function nl(e, t, n, r, i, a) {
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
	function rl(e) {
		var t = e.child;
		for (e.child = null; t !== null;) {
			var n = t.sibling;
			t.sibling = e.child, e.child = t, t = n;
		}
	}
	function il(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = Ro.current;
		if (t.flags & 128) return zo(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, zo(t, o), i === "backwards" && e !== null ? (rl(e), W(e, t, r, n), rl(e)) : W(e, t, r, n), r = z ? Ji : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && el(e, n, t);
			else if (e.tag === 19) el(e, n, t);
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
				n = tl(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null, rl(t)), nl(t, !0, i, null, a, r);
				break;
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && Vo(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				nl(t, !0, n, null, a, r);
				break;
			case "together":
				nl(t, !1, null, null, void 0, r);
				break;
			case "independent":
				t.memoizedState = null;
				break;
			default: n = tl(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), nl(t, !1, i, n, a, r);
		}
		return t.child;
	}
	function al(e, t, n) {
		var r = t.pendingProps;
		return ya(t, t.type, r.value), W(e, t, r.children, n), t.child;
	}
	function ol(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), sd |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (Ca(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(i(153));
		if (t.child !== null) {
			for (e = t.child, n = Ii(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Ii(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function sl(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && wa(e)));
	}
	function cl(e, t, n) {
		switch (t.tag) {
			case 3:
				je(t, t.stateNode.containerInfo), ya(t, Ma, e.memoizedState.cache), pa();
				break;
			case 27:
			case 5:
				Ne(t);
				break;
			case 4:
				je(t, t.stateNode.containerInfo);
				break;
			case 10:
				ya(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, Po(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) {
					if (r.dehydrated !== null) return No(t), t.flags |= 128, null;
					r = Ca(e, t, n, !1);
					var i = t.child.childLanes;
					return r || (n & i) !== 0 ? Xc(e, t, n) : (No(t), e = ol(e, t, n), e === null ? null : e.sibling);
				}
				No(t);
				break;
			case 19:
				if (t.flags & 128) return il(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (Ca(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return il(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), zo(t, Ro.current), r) break;
				return null;
			case 22: return t.lanes = 0, Ic(e, t, n, t.pendingProps);
			case 24: ya(t, Ma, e.memoizedState.cache);
		}
		return ol(e, t, n);
	}
	function ll(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) Nc = !0;
			else {
				if (!sl(e, n) && !(t.flags & 128)) return Nc = !1, cl(e, t, n);
				Nc = !!(e.flags & 131072);
			}
		} else Nc = !1, z && t.flags & 1048576 && ta(t, Ji, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = to(t.elementType), t.type = e, typeof e == "function") Fi(e) ? (r = Sc(e, r), t.tag = 1, t = Gc(null, t, e, r, n)) : (t.tag = 0, t = Uc(null, t, e, r, n));
					else {
						if (e != null) {
							var a = e.$$typeof;
							if (a === ae) {
								t.tag = 11, t = Pc(null, t, e, r, n);
								break a;
							}
							if (a === ce) {
								t.tag = 14, t = G(null, t, e, r, n);
								break a;
							}
							if (a === ie) {
								t.tag = 10, t.type = e, t = al(null, t, n);
								break a;
							}
						}
						throw t = ve(e) || e, Error(i(306, t, ""));
					}
				}
				return t;
			case 0: return Uc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, a = Sc(r, t.pendingProps), Gc(e, t, r, a, n);
			case 3:
				a: {
					if (je(t, t.stateNode.containerInfo), e === null) throw Error(i(387));
					r = t.pendingProps;
					var o = t.memoizedState;
					a = o.element, go(e, t), Co(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, ya(t, Ma, r), r !== o.cache && Sa(t, [Ma], n, !0), So(), r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							t = Kc(e, t, r, n);
							break a;
						}
						if (r !== a) {
							a = Wi(Error(i(424)), t), ha(a), t = Kc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (aa = um(e.firstChild), ia = t, z = !0, oa = null, sa = !0, n = po(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (pa(), r === a) {
							t = ol(e, t, n);
							break a;
						}
						W(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return Hc(e, t), e === null ? (n = Pm(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : z || (t.stateNode = pp(t.type, t.pendingProps, ke.current, t)) : t.memoizedState = Pm(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return Ne(t), e === null && z && (r = t.stateNode = gm(t.type, t.pendingProps, ke.current), ia = t, sa = !0, a = aa, Cp(t.type) ? (dm = a, aa = um(r.firstChild)) : aa = a), W(e, t, t.pendingProps.children, n), Hc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && z && ((a = r = aa) && (r = im(r, t.type, t.pendingProps, sa), r === null ? a = !1 : (t.stateNode = r, ia = t, aa = um(r.firstChild), sa = !1, a = !0)), a || la(t)), Ne(t), a = t.type, o = t.pendingProps, s = e === null ? null : e.memoizedProps, r = o.children, mp(a, o) ? r = null : s !== null && mp(a, s) && (t.flags |= 32), t.memoizedState !== null && (a = es(e, t, rs, null, null, n), ch._currentValue = a), Hc(e, t), W(e, t, r, n), t.child;
			case 6: return e === null && z && ((e = n = aa) && (n = am(n, t.pendingProps, sa), n === null ? e = !1 : (t.stateNode = n, ia = t, aa = null, e = !0)), e || la(t)), null;
			case 13: return Xc(e, t, n);
			case 4: return je(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = fo(t, null, r, n) : W(e, t, r, n), t.child;
			case 11: return Pc(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, Hc(e, t), W(e, t, r, n), t.child;
			case 8: return W(e, t, t.pendingProps.children, n), t.child;
			case 12: return W(e, t, t.pendingProps.children, n), t.child;
			case 10: return al(e, t, n);
			case 9: return a = t.type._context, r = t.pendingProps.children, Ta(t), a = Ea(a), r = r(a), t.flags |= 1, W(e, t, r, n), t.child;
			case 14: return G(e, t, t.type, t.pendingProps, n);
			case 15: return Fc(e, t, t.type, t.pendingProps, n);
			case 19: return il(e, t, n);
			case 31: return Vc(e, t, n);
			case 22: return Ic(e, t, n, t.pendingProps);
			case 24: return Ta(t), r = Ea(Ma), e === null ? (a = qa(), a === null && (a = $u, o = Na(), a.pooledCache = o, o.refCount++, o !== null && (a.pooledCacheLanes |= n), a = o), t.memoizedState = {
				parent: r,
				cache: a
			}, ho(t), ya(t, Ma, a)) : ((e.lanes & n) !== 0 && (go(e, t), Co(t, null, null, n), So()), a = e.memoizedState, o = t.memoizedState, a.parent === r ? (r = o.cache, ya(t, Ma, r), r !== a.cache && Sa(t, [Ma], n, !0)) : (a = {
				parent: r,
				cache: r
			}, t.memoizedState = a, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = a), ya(t, Ma, r))), W(e, t, t.pendingProps.children, n), t.child;
			case 30: return t.stateNode === null && (t.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : z && na(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : Hc(e, t), W(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(i(156, t.tag));
	}
	function ul(e) {
		e.flags |= 4;
	}
	function dl(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Ym(t, r) : Ym(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Wd()) e.flags |= 8192;
				else throw no = Qa, Za;
			}
		} else e.flags &= -16777217;
	}
	function fl(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Xm(t)) {
			if (Wd()) e.flags |= 8192;
			else throw no = Qa, Za;
		}
	}
	function pl(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : _t(), e.lanes |= t, dd |= t);
	}
	function ml(e, t) {
		if (!z) switch (e.tailMode) {
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
	function hl(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function gl(e, t, n) {
		var r = t.pendingProps;
		switch (R(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return hl(t), null;
			case 1: return hl(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), ba(Ma), Me(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (fa(t) ? ul(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, ma())), hl(t), null;
			case 26:
				var a = t.type, o = t.memoizedState;
				return e === null ? (ul(t), o === null ? (hl(t), dl(t, a, null, r, n)) : (hl(t), fl(t, o))) : o ? o === e.memoizedState ? (hl(t), t.flags &= -16777217) : (ul(t), hl(t), fl(t, o)) : (e = e.memoizedProps, e !== r && ul(t), hl(t), dl(t, a, e, r, n)), null;
			case 27:
				if (Pe(t), n = ke.current, a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && ul(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return hl(t), t.subtreeFlags &= -33554433, null;
					}
					e = De.current, fa(t) ? ua(t, e) : (e = gm(a, r, n), t.stateNode = e, ul(t));
				}
				return hl(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (Pe(t), a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && ul(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return hl(t), t.subtreeFlags &= -33554433, null;
					}
					if (o = De.current, fa(t)) ua(t, o);
					else {
						var s = up(ke.current);
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
						o[kt] = t, o[At] = r;
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
						r && ul(t);
					}
				}
				return hl(t), t.subtreeFlags &= -33554433, dl(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && ul(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(i(166));
					if (e = ke.current, fa(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, a = ia, a !== null) switch (a.tag) {
							case 27:
							case 5: r = a.memoizedProps;
						}
						e[kt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || tp(e.nodeValue, n)), e || la(t, !0);
					} else e = up(e).createTextNode(r), e[kt] = t, t.stateNode = e;
				}
				return hl(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = fa(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(i(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(557));
							e[kt] = t;
						} else pa(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						hl(t), e = !1;
					} else n = ma(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (Lo(t), t) : (Lo(t), null);
					if (t.flags & 128) throw Error(i(558));
				}
				return hl(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (a = fa(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!a) throw Error(i(318));
							if (a = t.memoizedState, a = a === null ? null : a.dehydrated, !a) throw Error(i(317));
							a[kt] = t;
						} else pa(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						hl(t), a = !1;
					} else a = ma(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), a = !0;
					if (!a) return t.flags & 256 ? (Lo(t), t) : (Lo(t), null);
				}
				return Lo(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, a = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (a = r.alternate.memoizedState.cachePool.pool), o = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== a && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), pl(t, t.updateQueue), hl(t), null);
			case 4: return Me(), e === null && Gf(t.stateNode.containerInfo), t.flags |= 67108864, hl(t), null;
			case 10: return ba(t.type), hl(t), null;
			case 19:
				if (Bo(t), r = t.memoizedState, r === null) return hl(t), null;
				if (a = !!(t.flags & 128), o = r.rendering, o === null) {
					if (a) ml(r, !1);
					else {
						if (od !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (o = Vo(e), o !== null) {
								for (t.flags |= 128, ml(r, !1), e = o.updateQueue, t.updateQueue = e, pl(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) Li(n, e), n = n.sibling;
								return zo(t, Ro.current & 1 | 2), z && ea(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && qe() > _d && (t.flags |= 128, a = !0, ml(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!a) {
						if (e = Vo(o), e !== null) {
							if (t.flags |= 128, a = !0, e = e.updateQueue, t.updateQueue = e, pl(t, e), ml(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !o.alternate && !z) return hl(t), null;
						} else 2 * qe() - r.renderingStartTime > _d && n !== 536870912 && (t.flags |= 128, a = !0, ml(r, !1), t.lanes = 4194304);
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
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = qe(), e.sibling = null, o = Ro.current, o = a ? o & 1 | 2 : o & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || z ? zo(t, o) : (n = o, Ee(jo, t), Ee(Ro, n), Mo === null && (Mo = t)), z && ea(t, r.treeForkCount), e;
				}
				return hl(t), null;
			case 22:
			case 23: return Lo(t), Ao(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (hl(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : hl(t), n = t.updateQueue, n !== null && pl(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && Te(Ka), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), ba(Ma), hl(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, hl(t), null;
		}
		throw Error(i(156, t.tag));
	}
	function _l(e, t) {
		switch (R(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return ba(Ma), Me(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return Pe(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (Lo(t), t.alternate === null) throw Error(i(340));
					pa();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (Lo(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(i(340));
					pa();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return Bo(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
			case 4: return Me(), null;
			case 10: return ba(t.type), null;
			case 22:
			case 23: return Lo(t), Ao(), e !== null && Te(Ka), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return ba(Ma), null;
			case 25: return null;
			default: return null;
		}
	}
	function vl(e, t) {
		switch (R(t), t.tag) {
			case 3:
				ba(Ma), Me();
				break;
			case 26:
			case 27:
			case 5:
				Pe(t);
				break;
			case 4:
				Me();
				break;
			case 31:
				t.memoizedState !== null && Lo(t);
				break;
			case 13:
				Lo(t);
				break;
			case 19:
				Bo(t);
				break;
			case 10:
				ba(t.type);
				break;
			case 22:
			case 23:
				Lo(t), Ao(), e !== null && Te(Ka);
				break;
			case 24: ba(Ma);
		}
	}
	function yl(e, t) {
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
			X(t, t.return, e);
		}
	}
	function bl(e, t, n) {
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
								X(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			X(t, t.return, e);
		}
	}
	function xl(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				To(t, n);
			} catch (t) {
				X(e, e.return, t);
			}
		}
	}
	function Sl(e, t, n) {
		n.props = Sc(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			X(e, t, n);
		}
	}
	function Cl(e, t) {
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
			X(e, t, n);
		}
	}
	function wl(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				X(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				X(e, t, n);
			}
			else n.current = null;
		}
	}
	function Tl(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) tm(e.stateNode, t[n]);
	}
	function El(e) {
		for (var t = e.return; t !== null && (kl(t) && tm(e.stateNode, t.stateNode), !Ol(t));) t = t.return;
	}
	function Dl(e) {
		for (var t = e.return; t !== null && (kl(t) && nm(e.stateNode, t.stateNode), !Ol(t));) t = t.return;
	}
	function Ol(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 27;
	}
	function kl(e) {
		return e && e.tag === 7 && e.stateNode !== null;
	}
	function Al(e) {
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
			X(e, e.return, t);
		}
	}
	function jl(e, t, n) {
		try {
			var r = e.stateNode;
			ap(r, e.type, n, t), r[At] = t;
		} catch (t) {
			X(e, e.return, t);
		}
	}
	function Ml(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Cp(e.type) || e.tag === 4;
	}
	function Nl(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Ml(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Cp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Pl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = wn)), Tl(e, r), N = !0;
		else if (i !== 4 && (i === 27 && (Tl(e, r), r = null, Cp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (Pl(e, t, n, r), e = e.sibling; e !== null;) Pl(e, t, n, r), e = e.sibling;
	}
	function Fl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), Tl(e, r), N = !0;
		else if (i !== 4 && (i === 27 && (Tl(e, r), r = null, Cp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Fl(e, t, n, r), e = e.sibling; e !== null;) Fl(e, t, n, r), e = e.sibling;
	}
	function Il(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			rp(t, r, n), t[kt] = e, t[At] = n;
		} catch (t) {
			X(e, e.return, t);
		}
	}
	var Ll = !1, Rl = null;
	function zl(e) {
		(e.tag === 30 || e.subtreeFlags & 33554432) && (Ll = !0);
	}
	var Bl = null;
	function Vl() {
		var e = Bl;
		return Bl = null, e;
	}
	var Hl = 0;
	function Ul(e, t, n, r, i) {
		return Hl = 0, Wl(e.child, t, n, r, i);
	}
	function Wl(e, t, n, r, i) {
		for (var a = !1; e !== null;) {
			if (e.tag === 5) {
				var o = e.stateNode;
				if (r !== null) {
					var s = kp(o);
					r.push(s), s.view && (a = !0);
				} else a || kp(o).view && (a = !0);
				Ll = !0, Ep(o, Hl === 0 ? t : t + "_" + Hl, n), Hl++;
			} else (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && i || Wl(e.child, t, n, r, i) && (a = !0));
			e = e.sibling;
		}
		return a;
	}
	function Gl(e, t) {
		for (; e !== null;) e.tag === 5 ? Dp(e.stateNode, e.memoizedProps) : (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && t || Gl(e.child, t)), e = e.sibling;
	}
	function Kl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (Kl(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(i(544));
				var n = t.name;
				t = Si(t.default, t.share), t !== "none" && (Ul(e, n, t, null, !1) || Gl(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function ql(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = bi(r, n), a = Si(r.default, n.paired ? r.share : r.enter);
			a === "none" ? Kl(e) : Ul(e, i, a, null, !1) ? (Kl(e), n.paired || t || Pd(e, r.onEnter)) : Gl(e.child, !1);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) ql(e, t), e = e.sibling;
		else Kl(e);
	}
	function Jl(e) {
		if (Rl !== null && Rl.size !== 0) {
			var t = Rl;
			if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
				if (e.tag !== 22 || e.memoizedState === null) {
					if (e.tag === 30 && e.flags & 18874368) {
						var n = e.memoizedProps, r = n.name;
						if (r != null && r !== "auto") {
							var i = t.get(r);
							if (i !== void 0) {
								var a = Si(n.default, n.share);
								if (a !== "none" && (Ul(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, Pd(e, n.onShare)) : Gl(e.child, !1)), t.delete(r), t.size === 0) break;
							}
						}
					}
					Jl(e);
				}
				e = e.sibling;
			}
		}
	}
	function Yl(e) {
		if (e.tag === 30) {
			var t = e.memoizedProps, n = bi(t, e.stateNode), r = Rl === null ? void 0 : Rl.get(n), i = Si(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Ul(e, n, i, null, !1) ? r === void 0 ? Pd(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, Rl.delete(n), Pd(e, t.onShare)) : Gl(e.child, !1)), Rl !== null && Jl(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Yl(e), e = e.sibling;
		else Rl !== null && Jl(e);
	}
	function Xl(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = bi(t, e.stateNode);
				t = Si(t.default, t.update), e.flags &= -5, t !== "none" && Ul(e, n, t, e.memoizedState = [], !1);
			} else e.subtreeFlags & 33554432 && Xl(e);
			e = e.sibling;
		}
	}
	function Zl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if (e.tag !== 22 || e.memoizedState === null) {
				if (e.tag === 30 && e.flags & 18874368) {
					var t = e.stateNode;
					t.paired !== null && (t.paired = null, Gl(e.child, !1));
				}
				Zl(e);
			}
			e = e.sibling;
		}
	}
	function Ql(e) {
		if (e.tag === 30) e.stateNode.paired = null, Gl(e.child, !1), Zl(e);
		else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Ql(e), e = e.sibling;
		else Zl(e);
	}
	function $l(e) {
		for (e = e.child; e !== null;) e.tag === 30 ? Gl(e.child, !1) : e.subtreeFlags & 33554432 && $l(e), e = e.sibling;
	}
	function eu(e, t, n, r, i, a, o) {
		for (var s = !1; t !== null;) {
			if (t.tag === 5) {
				var c = t.stateNode;
				if (a !== null && Hl < a.length) {
					var l = a[Hl], u = kp(c);
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
				e.flags & 4 && Ep(c, Hl === 0 ? n : n + "_" + Hl, i), s && e.flags & 4 || (Bl === null && (Bl = []), Bl.push(c, Hl === 0 ? r : r + "_" + Hl, t.memoizedProps)), Hl++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : eu(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function tu(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = bi(n, r), a = Si(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(Ap);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				Hl = 0, i = eu(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || Pd(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && tu(e, t);
			e = e.sibling;
		}
	}
	var nu = !1, ru = !1, iu = !1, au = !1, ou = typeof WeakSet == "function" ? WeakSet : Set, su = null, cu = !1, lu = !1, uu = !1, du = !1;
	function fu(e, t, n) {
		if (e = e.containerInfo, cp = _h, e = Xr(e), Zr(e)) {
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
			if (e = su, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && Yl(r[a]);
			if (e.alternate === null && e.flags & 2) n && zl(e), pu(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && Yl(r), pu(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && zl(e), pu(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, su = r) : (n && Xl(e), pu(n));
			}
		}
		Rl = null;
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
							var s = Sc(t.type, a);
							n = o.getSnapshotBeforeUpdate(s, r), o.__reactInternalSnapshotBeforeUpdate = n;
						} catch (e) {
							X(t, t.return, e);
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
					n && r !== null && (n = bi(r.memoizedProps, r.stateNode), a = t.memoizedProps, a = Si(a.default, a.update), a !== "none" && Ul(r, n, a, r.memoizedState = [], !0));
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
				Pu(e, n), r & 4 && yl(5, n);
				break;
			case 1:
				if (Pu(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						X(n, n.return, e);
					}
					else {
						var i = Sc(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							X(n, n.return, e);
						}
					}
				}
				r & 64 && xl(n), r & 512 && Cl(n, n.return);
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
						To(e, t);
					} catch (e) {
						X(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Il(n);
			case 26:
			case 5:
				Pu(e, n), t === null && r & 4 && Al(n), r & 512 && Cl(n, n.return);
				break;
			case 12:
				Pu(e, n);
				break;
			case 31:
				Pu(e, n), r & 4 && Cu(e, n);
				break;
			case 13:
				Pu(e, n), r & 4 && wu(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = vf.bind(null, n), lm(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || nu, !r) {
					var a = t !== null && t.memoizedState !== null || ru;
					t = nu, i = ru, nu = r, (ru = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), Iu(e, n, r)) : Pu(e, n), nu = t, ru = i;
				}
				break;
			case 30:
				Pu(e, n), r & 512 && Cl(n, n.return);
				break;
			case 7: r & 512 && Cl(n, n.return);
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
					X(e, e.return, t);
				}
				_u(e, t);
				break;
			case 6:
				try {
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, N = !0;
				} catch (t) {
					X(e, e.return, t);
				}
				break;
			case 18:
				try {
					var s = e.stateNode;
					t ? Tp(s, !0) : Tp(e.stateNode, !1);
				} catch (t) {
					X(e, e.return, t);
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
		t !== null && (e.alternate = null, vu(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Lt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var yu = null, bu = !1;
	function xu(e, t, n) {
		for (n = n.child; n !== null;) Su(e, t, n), n = n.sibling;
	}
	function Su(e, t, n) {
		if (rt && typeof rt.onCommitFiberUnmount == "function") try {
			rt.onCommitFiberUnmount(nt, n);
		} catch {}
		switch (n.tag) {
			case 26:
				ru || wl(n, t), xu(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !ru && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				ru || wl(n, t), Dl(n);
				var r = yu, i = bu;
				Cp(n.type) && (yu = n.stateNode, bu = !1), xu(e, t, n), _m(n.stateNode, n.type, n.memoizedProps), yu = r, bu = i;
				break;
			case 5: ru || wl(n, t), Dl(n);
			case 6:
				if (n.tag === 6 && Dl(n), r = yu, i = bu, yu = null, xu(e, t, n), yu = r, bu = i, yu !== null) {
					if (bu) try {
						(yu.nodeType === 9 ? yu.body : yu.nodeName === "HTML" ? yu.ownerDocument.body : yu).removeChild(n.stateNode), N = !0;
					} catch (e) {
						X(n, t, e);
					}
					else try {
						yu.removeChild(n.stateNode), N = !0;
					} catch (e) {
						X(n, t, e);
					}
				}
				break;
			case 18:
				yu !== null && (bu ? (e = yu, wp(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Uh(e)) : wp(yu, n.stateNode));
				break;
			case 4:
				r = yu, i = bu, yu = n.stateNode.containerInfo, bu = !0, xu(e, t, n), yu = r, bu = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				bl(2, n, t), ru || bl(4, n, t), xu(e, t, n);
				break;
			case 1:
				ru || (wl(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Sl(n, t, r)), xu(e, t, n);
				break;
			case 21:
				xu(e, t, n);
				break;
			case 22:
				ru = (r = ru) || n.memoizedState !== null, xu(e, t, n), ru = r;
				break;
			case 30:
				wl(n, t), xu(e, t, n);
				break;
			case 7:
				ru || wl(n, t), xu(e, t, n);
				break;
			default: xu(e, t, n);
		}
	}
	function Cu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Uh(e);
			} catch (e) {
				X(t, t.return, e);
			}
		}
	}
	function wu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Uh(e);
		} catch (e) {
			X(t, t.return, e);
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
				var r = yf.bind(null, e, t);
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
				Du(t, e, n), Au(e), a & 4 && (bl(3, e, e.return), yl(3, e), bl(5, e, e.return));
				break;
			case 1:
				Du(t, e, n), Au(e), a & 512 && (ru || r === null || wl(r, r.return)), a & 64 && nu && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (o = Ou, Du(t, e, n), Au(e), a & 512 && (ru || r === null || wl(r, r.return)), a & 4) {
					if (a = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if (nu) e.stateNode = pp(e.type, e.memoizedProps, t.containerInfo, e);
								else {
									a: {
										t = e.type, n = e.memoizedProps, a = o.ownerDocument || o;
										b: switch (t) {
											case "title":
												r = a.getElementsByTagName("title")[0], (!r || r[Ft] || r[kt] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = a.createElement(t), a.head.insertBefore(r, a.querySelector("head > title"))), rp(r, t, n), r[kt] = e, Ht(r), t = r;
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
										r[kt] = e, Ht(r), t = r;
									}
									e.stateNode = t;
								}
							} else nu || qm(o, e.type, e.stateNode);
						} else e.stateNode = Vm(o, n, e.memoizedProps);
					} else a === n ? n === null && e.stateNode !== null && jl(e, e.memoizedProps, r.memoizedProps) : (a === null ? (t = r.stateNode, t === null || ru || t.parentNode.removeChild(t)) : a.count--, n === null ? nu || qm(o, e.type, e.stateNode) : Vm(o, n, e.memoizedProps));
				}
				break;
			case 27:
				Du(t, e, n), Au(e), a & 512 && (ru || r === null || wl(r, r.return)), r !== null && a & 4 && jl(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (o = iu, iu = !1, Du(t, e, n), iu = o, Au(e), a & 512 && (ru || r === null || wl(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						gn(t, ""), N = !0;
					} catch (t) {
						X(e, e.return, t);
					}
				}
				a & 4 && e.stateNode != null && (t = e.memoizedProps, jl(e, t, r === null ? t : r.memoizedProps)), a & 1024 && (au = !0);
				break;
			case 6:
				if (Du(t, e, n), Au(e), a & 4) {
					if (e.stateNode === null) throw Error(i(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, N = !0;
					} catch (t) {
						X(e, e.return, t);
					}
				}
				break;
			case 3:
				if (N = !1, Gm = null, o = Ou, Ou = xm(t.containerInfo), Du(t, e, n), Ou = o, Au(e), a & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Uh(t.containerInfo);
				} catch (t) {
					X(e, e.return, t);
				}
				au && (au = !1, ju(e)), N = !1;
				break;
			case 4:
				a = iu, iu = nu, r = Qt(), o = Ou, Ou = xm(e.stateNode.containerInfo), Du(t, e, n), Au(e), Ou = o, N && lu && (uu = !0), N = r, iu = a;
				break;
			case 12:
				Du(t, e, n), Au(e);
				break;
			case 31:
				Du(t, e, n), Au(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 13:
				Du(t, e, n), Au(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (hd = qe()), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 22:
				o = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = nu, l = ru, u = iu;
				nu = c || o, iu = u || o, ru = l || s, Du(t, e, n), ru = l, iu = u, nu = c, Au(e), a & 8192 && (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, !o || r === null || s || nu || ru || (t = s || ru, n = nu, r = ru, nu = o || nu, ru = t, Fu(e, 2), nu = n, ru = r), !o && iu || hu(e, o)), a & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, Eu(e, n))));
				break;
			case 19:
				Du(t, e, n), Au(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 30:
				a & 512 && (ru || r === null || wl(r, r.return)), a = Qt(), o = lu, s = (n & 335544064) === n, c = e.memoizedProps, lu = s && Si(c.default, c.update) !== "none", Du(t, e, n), Au(e), s && r !== null && N && (e.flags |= 4), lu = o, N = a;
				break;
			case 21: break;
			case 7: a & 512 && (ru || r === null || wl(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: Du(t, e, n), Au(e);
		}
	}
	function Au(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Ml(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				r = null;
				for (var a = e.return; a !== null;) {
					if (kl(a)) {
						var o = a.stateNode;
						r === null ? r = [o] : r.push(o);
					}
					if (Ol(a)) break;
					a = a.return;
				}
				var s = r;
				if (n == null) throw Error(i(160));
				switch (n.tag) {
					case 27:
						var c = n.stateNode;
						Fl(e, Nl(e), c, s);
						break;
					case 5:
						var l = n.stateNode;
						n.flags & 32 && (gn(l, ""), n.flags &= -33), Fl(e, Nl(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						Pl(e, Nl(e), u, s);
						break;
					default: throw Error(i(161));
				}
			} catch (t) {
				X(e, e.return, t);
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
		else tu(t, !1);
	}
	function Nu(e, t) {
		var n = e.alternate;
		if (n === null) ql(e, !1);
		else switch (e.tag) {
			case 3:
				if (du = cu = !1, Vl(), Mu(t, e), !cu && !uu) {
					if (e = Bl, e !== null) for (var r = 0; r < e.length; r += 3) {
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
				Bl = null;
				break;
			case 5:
				Mu(t, e);
				break;
			case 4:
				r = cu, cu = !1, Mu(t, e), cu && (uu = !0), cu = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? Mu(t, e) : ql(e, !1));
				break;
			case 30:
				r = cu, i = Vl(), cu = !1, Mu(t, e), cu && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = bi(a, o), o = bi(n.memoizedProps, o);
				var s = Si(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, Hl = 0, t = eu(e, n, t, o, s, a, !0), Hl !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (Pd(e, e.memoizedProps.onUpdate), Bl = i) : i !== null && (i.push.apply(i, Bl), Bl = i), cu = e.flags & 32 ? !0 : r;
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
					bl(4, n, n.return), Fu(n, r);
					break;
				case 1:
					wl(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && Sl(n, n.return, i), Fu(n, r);
					break;
				case 27: r & 2 && _m(n.stateNode, n.type, n.memoizedProps);
				case 5:
					wl(n, n.return), n.tag !== 5 && n.tag !== 27 || Dl(n), Fu(n, r);
					break;
				case 6:
					Dl(n);
					break;
				case 26:
					wl(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || ru || i.parentNode.removeChild(i), Fu(n, r);
					break;
				case 22:
					n.memoizedState === null && Fu(n, r);
					break;
				case 30:
					wl(n, n.return), Fu(n, r);
					break;
				case 7: wl(n, n.return);
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
					Iu(i, a, n), yl(4, a);
					break;
				case 1:
					if (Iu(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						X(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var c = r.stateNode;
						try {
							var l = i.shared.hiddenCallbacks;
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) wo(l[i], c);
						} catch (e) {
							X(r, r.return, e);
						}
					}
					s && o & 64 && xl(a), Cl(a, a.return);
					break;
				case 27: n & 2 && Il(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || El(a), Iu(i, a, n), s && r === null && o & 4 && Al(a), Cl(a, a.return);
					break;
				case 6:
					El(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || nu || qm(xm(c.ownerDocument), a.type, c), Iu(i, a, n), s && r === null && o & 4 && Al(a), Cl(a, a.return);
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
					a.memoizedState === null && Iu(i, a, n), Cl(a, a.return);
					break;
				case 30:
					Iu(i, a, n), Cl(a, a.return);
					break;
				case 7: Cl(a, a.return);
				default: Iu(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Lu(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Pa(n));
	}
	function Ru(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Pa(e));
	}
	function zu(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) Bu(e, t, n, r), t = t.sibling;
		else i && $l(t);
	}
	function Bu(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && Ql(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				zu(e, t, n, r), a & 2048 && yl(9, t);
				break;
			case 1:
				zu(e, t, n, r);
				break;
			case 3:
				zu(e, t, n, r), i && du && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && Pa(a)));
				break;
			case 12:
				if (a & 2048) {
					zu(e, t, n, r), a = t.stateNode;
					try {
						var o = t.memoizedProps, s = o.id, c = o.onPostCommit;
						typeof c == "function" && c(s, t.alternate === null ? "mount" : "update", a.passiveEffectDuration, -0);
					} catch (e) {
						X(t, t.return, e);
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
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && Ql(t), o._visibility & 2 ? zu(e, t, n, r) : (o._visibility |= 2, Vu(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && Ql(s), o._visibility & 2 ? zu(e, t, n, r) : Hu(e, t)), a & 2048 && Lu(s, t);
				break;
			case 24:
				zu(e, t, n, r), a & 2048 && Ru(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (Gl(a.child, !0), Gl(t.child, !0))), zu(e, t, n, r);
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
					Vu(a, o, s, c, i), yl(8, o);
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
	function q(e, t, n) {
		if (e.subtreeFlags & Uu) for (e = e.child; e !== null;) Wu(e, t, n), e = e.sibling;
	}
	function Wu(e, t, n) {
		switch (e.tag) {
			case 26:
				q(e, t, n), e.flags & Uu && (e.memoizedState === null ? (e = e.stateNode, (t & 335544128) === t && Qm(n, e)) : $m(n, Ou, e.memoizedState, e.memoizedProps));
				break;
			case 5:
				q(e, t, n), e.flags & Uu && (e = e.stateNode, (t & 335544128) === t && Qm(n, e));
				break;
			case 3:
			case 4:
				var r = Ou;
				Ou = xm(e.stateNode.containerInfo), q(e, t, n), Ou = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Uu, Uu = 16777216, q(e, t, n), Uu = r) : q(e, t, n));
				break;
			case 30:
				if ((e.flags & Uu) !== 0 && (r = e.memoizedProps.name, r != null && r !== "auto")) {
					var i = e.stateNode;
					i.paired = null, Rl === null && (Rl = /* @__PURE__ */ new Map()), Rl.set(r, i);
				}
				q(e, t, n);
				break;
			default: q(e, t, n);
		}
	}
	function Gu(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Ku(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				su = r, Yu(r, e);
			}
			Gu(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) qu(e), e = e.sibling;
	}
	function qu(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Ku(e), e.flags & 2048 && bl(9, e, e.return);
				break;
			case 3:
				Ku(e);
				break;
			case 12:
				Ku(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Ju(e)) : Ku(e);
				break;
			default: Ku(e);
		}
	}
	function Ju(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				su = r, Yu(r, e);
			}
			Gu(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					bl(8, t, t.return), Ju(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Ju(t));
					break;
				default: Ju(t);
			}
			e = e.sibling;
		}
	}
	function Yu(e, t) {
		for (; su !== null;) {
			var n = su;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					bl(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: Pa(n.memoizedState.cache);
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
	var Xu = {
		getCacheForType: function(e) {
			var t = Ea(Ma), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Ea(Ma).controller.signal;
		}
	}, Zu = typeof WeakMap == "function" ? WeakMap : Map, Qu = 0, $u = null, J = null, Y = 0, ed = 0, td = null, nd = !1, rd = !1, id = !1, ad = 0, od = 0, sd = 0, cd = 0, ld = 0, ud = 0, dd = 0, fd = null, pd = null, md = !1, hd = 0, gd = 0, _d = Infinity, vd = null, yd = null, bd = 0, xd = null, Sd = null, Cd = 0, wd = 0, Td = null, Ed = null, Dd = null, Od = null, kd = null, Ad = 0, jd = null;
	function Md() {
		return Qu & 2 && Y !== 0 ? Y & -Y : j.T === null ? Et() : Ff();
	}
	function Nd() {
		if (ud === 0) {
			if (!(Y & 536870912) || z) {
				var e = ut;
				ut <<= 1, !(ut & 3932160) && (ut = 262144), ud = e;
			} else ud = 536870912;
		}
		return e = jo.current, e !== null && (e.flags |= 32), ud;
	}
	function Pd(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Fp(bi(e.memoizedProps, n))), Od === null && (Od = []), Od.push(t.bind(null, r));
		}
	}
	function Fd(e, t, n) {
		(e === $u && (ed === 2 || ed === 9) || e.cancelPendingCommit !== null) && (Hd(e, 0), zd(e, Y, ud, !1)), yt(e, n), (!(Qu & 2) || e !== $u) && (e === $u && (!(Qu & 2) && (cd |= n), od === 4 && zd(e, Y, ud, !1)), Df(e));
	}
	function Id(e, t, n) {
		if (Qu & 6) throw Error(i(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || mt(e, t), a = r ? Xd(e, t) : Jd(e, t, !0), o = r;
		do {
			if (a === 0) {
				rd && !r && zd(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, o && !Rd(n)) a = Jd(e, t, !1), o = !1;
			else {
				if (a === 2) {
					if (o = t, e.errorRecoveryDisabledLanes & o) var s = 0;
					else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
					if (s !== 0) {
						t = s;
						a: {
							var c = e;
							a = fd;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (Hd(c, s).flags |= 256), s = Jd(c, s, !1), s !== 2 && s !== 6) {
								if (id && !l) {
									c.errorRecoveryDisabledLanes |= o, cd |= o, a = 4;
									break a;
								}
								o = pd, pd = a, o !== null && (pd === null ? pd = o : pd.push.apply(pd, o));
							}
							a = s;
						}
						if (o = !1, a !== 2) continue;
					}
				}
				if (a === 1) {
					Hd(e, 0), zd(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, o = a, o) {
						case 0:
						case 1: throw Error(i(345));
						case 4: if ((t & 4194048) !== t && (t & 62914560) !== t) break;
						case 6:
							zd(r, t, ud, !nd);
							break a;
						case 2:
							pd = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(i(329));
					}
					if ((t & 62914560) === t && (a = hd + 300 - qe(), 10 < a)) {
						if (zd(r, t, ud, !nd), pt(r, 0, !0) !== 0) break a;
						Cd = t, r.timeoutHandle = _p(Ld.bind(null, r, n, pd, vd, md, t, ud, cd, dd, nd, o, "Throttled", -0, 0), a);
						break a;
					}
					Ld(r, n, pd, vd, md, t, ud, cd, dd, nd, o, null, -0, 0);
				}
				break;
			}
		} while (1);
		Df(e);
	}
	function Ld(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
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
			unsuspend: wn
		}, Rl = null, Wu(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = rh.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? hd - qe() : (a & 4194048) === a ? gd - qe() : 0, m = th(d, m), m !== null) ? (Cd = a, e.cancelPendingCommit = m(rf.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), zd(e, a, o, !l)) : rf(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function Rd(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!Wr(a(), i)) return !1;
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
	function zd(e, t, n, r) {
		t = ht(e, t), t &= ~ld, t &= ~cd, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - at(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && xt(e, n, t);
	}
	function Bd() {
		return Qu & 6 ? !0 : (Of(0, !1), !1);
	}
	function Vd() {
		if (J !== null) {
			if (ed === 0) var e = J.return;
			else e = J, va = _a = null, os(e), ao = null, oo = 0, e = J;
			for (; e !== null;) vl(e.alternate, e), e = e.return;
			J = null;
		}
	}
	function Hd(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, vp(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), Cd = 0, Vd(), $u = e, J = n = Ii(e.current, null), Y = t, ed = 0, td = null, nd = !1, rd = mt(e, t), id = !1, dd = ud = ld = cd = sd = od = 0, pd = fd = null, md = !1, ad = ht(e, t), Ei(), n;
	}
	function Ud(e, t) {
		V = null, j.H = mc, t === Xa || t === B ? (t = ro(), ed = 3) : t === Za ? (t = ro(), ed = 4) : ed = t === Mc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, td = t, J === null && (od = 1, Ec(e, Wi(t, e.current)));
	}
	function Wd() {
		var e = jo.current;
		return e === null ? !0 : (Y & 4194048) === Y ? Mo === null : (Y & 62914560) === Y || Y & 536870912 ? e === Mo : !1;
	}
	function Gd() {
		var e = j.H;
		return j.H = mc, e === null ? mc : e;
	}
	function Kd() {
		var e = j.A;
		return j.A = Xu, e;
	}
	function qd() {
		od = 4, nd || (Y & 4194048) !== Y && jo.current !== null || (rd = !0), !(sd & 134217727) && !(cd & 134217727) || $u === null || zd($u, Y, ud, !1);
	}
	function Jd(e, t, n) {
		var r = Qu;
		Qu |= 2;
		var i = Gd(), a = Kd();
		($u !== e || Y !== t) && (vd = null, Hd(e, t)), t = !1;
		var o = od;
		a: do
			try {
				if (ed !== 0 && J !== null) {
					var s = J, c = td;
					switch (ed) {
						case 8:
							Vd(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							jo.current === null && (t = !0);
							var l = ed;
							if (ed = 0, td = null, ef(e, s, c, l), n && rd) {
								o = 0;
								break a;
							}
							break;
						default: l = ed, ed = 0, td = null, ef(e, s, c, l);
					}
				}
				Yd(), o = od;
				break;
			} catch (t) {
				Ud(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, va = _a = null, Qu = r, j.H = i, j.A = a, J === null && ($u = null, Y = 0, Ei()), o;
	}
	function Yd() {
		for (; J !== null;) Qd(J);
	}
	function Xd(e, t) {
		var n = Qu;
		Qu |= 2;
		var r = Gd(), a = Kd();
		$u !== e || Y !== t ? (vd = null, _d = qe() + 500, Hd(e, t)) : rd = mt(e, t);
		a: do
			try {
				if (ed !== 0 && J !== null) {
					t = J;
					var o = td;
					b: switch (ed) {
						case 1:
							ed = 0, td = null, ef(e, t, o, 1);
							break;
						case 2:
						case 9:
							if ($a(o)) {
								ed = 0, td = null, $d(t);
								break;
							}
							t = function() {
								ed !== 2 && ed !== 9 || $u !== e || (ed = 7), Df(e);
							}, o.then(t, t);
							break a;
						case 3:
							ed = 7;
							break a;
						case 4:
							ed = 5;
							break a;
						case 7:
							$a(o) ? (ed = 0, td = null, $d(t)) : (ed = 0, td = null, ef(e, t, o, 7));
							break;
						case 5:
							var s = null;
							switch (J.tag) {
								case 26: s = J.memoizedState;
								case 5:
								case 27:
									var c = J;
									if (s ? Xm(s) : c.stateNode.complete) {
										ed = 0, td = null;
										var l = c.sibling;
										if (l !== null) J = l;
										else {
											var u = c.return;
											u === null ? J = null : (J = u, tf(u));
										}
										break b;
									}
							}
							ed = 0, td = null, ef(e, t, o, 5);
							break;
						case 6:
							ed = 0, td = null, ef(e, t, o, 6);
							break;
						case 8:
							Vd(), od = 6;
							break a;
						default: throw Error(i(462));
					}
				}
				Zd();
				break;
			} catch (t) {
				Ud(e, t);
			}
		while (1);
		return va = _a = null, j.H = r, j.A = a, Qu = n, J === null ? ($u = null, Y = 0, Ei(), od) : 0;
	}
	function Zd() {
		for (; J !== null && !Ge();) Qd(J);
	}
	function Qd(e) {
		var t = ll(e.alternate, e, ad);
		e.memoizedProps = e.pendingProps, t === null ? tf(e) : J = t;
	}
	function $d(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = Wc(n, t, t.pendingProps, t.type, void 0, Y);
				break;
			case 11:
				t = Wc(n, t, t.pendingProps, t.type.render, t.ref, Y);
				break;
			case 5:
				os(t);
				var r = t;
				r === ia && (z ? (da(r), r.tag === 5 && r.stateNode != null && (aa = r.stateNode)) : (da(r), z = !0));
			default: vl(n, t), t = J = Li(t, ad), t = ll(n, t, ad);
		}
		e.memoizedProps = e.pendingProps, t === null ? tf(e) : J = t;
	}
	function ef(e, t, n, r) {
		va = _a = null, os(t), ao = null, oo = 0;
		var i = t.return;
		try {
			if (jc(e, i, t, n, Y)) {
				od = 1, Ec(e, Wi(n, e.current)), J = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw J = i, t;
			od = 1, Ec(e, Wi(n, e.current)), J = null;
			return;
		}
		t.flags & 32768 ? (z || r === 1 ? e = !0 : rd || Y & 536870912 ? e = !1 : (nd = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = jo.current, r !== null && r.tag === 13 && (r.flags |= 16384))), nf(t, e)) : tf(t);
	}
	function tf(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				nf(t, nd);
				return;
			}
			e = t.return;
			var n = gl(t.alternate, t, ad);
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
		od === 0 && (od = 5);
	}
	function nf(e, t) {
		do {
			var n = _l(e.alternate, e);
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
		od = 6, J = null;
	}
	function rf(e, t, n, r, a, o, s, c, l, u, d, f) {
		e.cancelPendingCommit = null;
		do
			ff();
		while (bd !== 0);
		if (Qu & 6) throw Error(i(327));
		if (t !== null) {
			if (t === e.current) throw Error(i(177));
			e === $u && (J = $u = null, Y = 0), Sd = t, xd = e, Cd = n, Td = a, Ed = r, af(e, t, n, s, c, l, f);
		}
	}
	function af(e, t, n, r, i, a, o) {
		var s = t.lanes | t.childLanes;
		if (wd = s, s |= Ti, bt(e, n, s, r, i, a), Od = null, (n & 335544064) === n ? (kd = La(e), r = 10262) : (kd = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, bf(Ze, function() {
			return pf(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), Ll = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = j.T, j.T = null, i = be.p, be.p = 2, a = Qu, Qu |= 4;
			try {
				fu(e, t, n);
			} finally {
				Qu = a, be.p = i, j.T = r;
			}
		}
		bd = 1, Ll ? Dd = Np(o, e.containerInfo, kd, cf, lf, sf, uf, pf, of, null, null) : (cf(), lf(), uf());
	}
	function of(e) {
		if (bd !== 0) {
			var t = xd.onRecoverableError;
			t(e, { componentStack: null });
		}
	}
	function sf() {
		bd === 3 && (bd = 0, Nu(Sd, xd), bd = 4);
	}
	function cf() {
		if (bd === 1) {
			bd = 0;
			var e = xd, t = Sd, n = Cd, r = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || r) {
				r = j.T, j.T = null;
				var i = be.p;
				be.p = 2;
				var a = Qu;
				Qu |= 4;
				try {
					lu = uu = !1, ku(t, e, n), n = lp;
					var o = Xr(e.containerInfo), s = n.focusedElem, c = n.selectionRange;
					if (o !== s && s && s.ownerDocument && Yr(s.ownerDocument.documentElement, s)) {
						if (c !== null && Zr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Jr(s, h), v = Jr(s, g);
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
					Qu = a, be.p = i, j.T = r;
				}
			}
			e.current = t, bd = 2;
		}
	}
	function lf() {
		if (bd === 2) {
			bd = 0;
			var e = xd, t = Sd, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = j.T, j.T = null;
				var r = be.p;
				be.p = 2;
				var i = Qu;
				Qu |= 4;
				try {
					mu(e, t.alternate, t);
				} finally {
					Qu = i, be.p = r, j.T = n;
				}
			}
			bd = 3;
		}
	}
	function uf() {
		if (bd === 4 || bd === 3) {
			bd = 0;
			var e = Dd;
			Dd = null, Ke();
			var t = xd, n = Sd, r = Cd, i = Ed, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? bd = 5 : (bd = 0, Sd = xd = null, df(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (yd = null), Tt(r), n = n.stateNode, rt && typeof rt.onCommitFiberRoot == "function") try {
				rt.onCommitFiberRoot(nt, n, void 0, (n.current.flags & 128) == 128);
			} catch {}
			if (i !== null) {
				n = j.T, a = be.p, be.p = 2, j.T = null;
				try {
					for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
						var c = i[s];
						o(c.value, { componentStack: c.stack });
					}
				} finally {
					j.T = n, be.p = a;
				}
			}
			if (i = Od, o = kd, kd = null, i !== null && (Od = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			Cd & 3 && ff(), Df(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === jd ? Ad++ : (Ad = 0, jd = t) : (Ad = 0, jd = null), Of(0, !1);
		}
	}
	function df(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Pa(t)));
	}
	function ff() {
		return Dd !== null && (Dd.skipTransition(), Dd = null), cf(), lf(), uf(), pf();
	}
	function pf() {
		if (bd !== 5) return !1;
		var e = xd, t = wd;
		wd = 0;
		var n = Tt(Cd), r = j.T, a = be.p;
		try {
			be.p = 32 > n ? 32 : n, j.T = null, n = Td, Td = null;
			var o = xd, s = Cd;
			if (bd = 0, Sd = xd = null, Cd = 0, Qu & 6) throw Error(i(331));
			var c = Qu;
			if (Qu |= 4, qu(o.current), Bu(o, o.current, s, n), Qu = c, Of(0, !1), rt && typeof rt.onPostCommitFiberRoot == "function") try {
				rt.onPostCommitFiberRoot(nt, o);
			} catch {}
			return !0;
		} finally {
			be.p = a, j.T = r, df(e, t);
		}
	}
	function mf(e, t, n) {
		t = Wi(n, t), t = Oc(e.stateNode, t, 2), e = vo(e, t, 2), e !== null && (yt(e, 2), Df(e));
	}
	function X(e, t, n) {
		if (e.tag === 3) mf(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				mf(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (yd === null || !yd.has(r))) {
					e = Wi(n, e), n = kc(2), r = vo(t, n, 2), r !== null && (Ac(n, r, t, e), yt(r, 2), Df(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function hf(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Zu();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (id = !0, i.add(n), e = gf.bind(null, e, t, n), t.then(e, e));
	}
	function gf(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, $u === e && (Y & n) === n && (od === 4 || od === 3 && (Y & 62914560) === Y && 300 > qe() - hd ? Qu & 2 ? ld |= n : Hd(e, 0) : ld |= n, dd === Y && (dd = 0)), Df(e);
	}
	function _f(e, t) {
		t === 0 && (t = _t()), e = ki(e, t), e !== null && (yt(e, t), Df(e));
	}
	function vf(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), _f(e, n);
	}
	function yf(e, t) {
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
		r !== null && r.delete(t), _f(e, n);
	}
	function bf(e, t) {
		return Ue(e, t);
	}
	var xf = null, Sf = null, Cf = !1, wf = !1, Tf = !1, Ef = 0;
	function Df(e) {
		e !== Sf && e.next === null && (Sf === null ? xf = Sf = e : Sf = Sf.next = e), wf = !0, Cf || (Cf = !0, Pf());
	}
	function Of(e, t) {
		if (!Tf && wf) {
			Tf = !0;
			do
				for (var n = !1, r = xf; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - at(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, Nf(r, a));
						} else a = Y, a = pt(r, r === $u ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || mt(r, a) || (n = !0, Nf(r, a));
					}
					r = r.next;
				}
			while (n);
			Tf = !1;
		}
	}
	function kf() {
		Af();
	}
	function Af() {
		wf = Cf = !1;
		var e = 0;
		Ef !== 0 && gp() && (e = Ef);
		for (var t = qe(), n = null, r = xf; r !== null;) {
			var i = r.next, a = jf(r, t);
			a === 0 ? (r.next = null, n === null ? xf = i : n.next = i, i === null && (Sf = n)) : (n = r, (e !== 0 || a & 3) && (wf = !0)), r = i;
		}
		bd !== 0 && bd !== 5 || Of(e, !1), Ef !== 0 && (Ef = 0);
	}
	function jf(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - at(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = gt(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = $u, n = Y, n = pt(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (ed === 2 || ed === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && We(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || mt(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && We(r), Tt(n)) {
				case 2:
				case 8:
					n = Xe;
					break;
				case 32:
					n = Ze;
					break;
				case 268435456:
					n = $e;
					break;
				default: n = Ze;
			}
			return r = Mf.bind(null, e), n = Ue(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && We(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function Mf(e, t) {
		if (bd !== 0 && bd !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (ff() && e.callbackNode !== n) return null;
		var r = Y;
		return r = pt(e, e === $u ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Id(e, r, t), jf(e, qe()), e.callbackNode != null && e.callbackNode === n ? Mf.bind(null, e) : null);
	}
	function Nf(e, t) {
		if (ff()) return null;
		Id(e, t, !0);
	}
	function Pf() {
		xp(function() {
			Qu & 6 ? Ue(Ye, kf) : Af();
		});
	}
	function Ff() {
		if (Ef === 0) {
			var e = Ba;
			e === 0 && (e = lt, lt <<= 1, !(lt & 261888) && (lt = 256)), Ef = e;
		}
		return Ef;
	}
	function If(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Cn(e);
	}
	function Lf(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = If((i[At] || null).action), o = r.submitter;
			o && (t = (t = o[At] || null) ? If(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new Un("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (Ef !== 0) {
								var e = new FormData(i, o);
								ec(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = new FormData(i, o), ec(n, {
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
	for (var Rf = 0; Rf < _i.length; Rf++) {
		var zf = _i[Rf];
		vi(zf.toLowerCase(), "on" + (zf[0].toUpperCase() + zf.slice(1)));
	}
	vi(li, "onAnimationEnd"), vi(ui, "onAnimationIteration"), vi(di, "onAnimationStart"), vi("dblclick", "onDoubleClick"), vi("focusin", "onFocus"), vi("focusout", "onBlur"), vi(fi, "onTransitionRun"), vi(pi, "onTransitionStart"), vi(mi, "onTransitionCancel"), vi(hi, "onTransitionEnd"), qt("onMouseEnter", ["mouseout", "mouseover"]), qt("onMouseLeave", ["mouseout", "mouseover"]), qt("onPointerEnter", ["pointerout", "pointerover"]), qt("onPointerLeave", ["pointerout", "pointerover"]), Kt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Kt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Kt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), Kt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Kt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Kt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var Bf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Vf = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Bf));
	function Hf(e, t) {
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
						L(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						L(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Z(e, t) {
		var n = t[Mt];
		n === void 0 && (n = t[Mt] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Kf(t, e, 2, !1), n.add(r));
	}
	function Uf(e, t, n) {
		var r = 0;
		t && (r |= 4), Kf(n, e, r, t);
	}
	var Wf = "_reactListening" + Math.random().toString(36).slice(2);
	function Gf(e) {
		if (!e[Wf]) {
			e[Wf] = !0, Wt.forEach(function(t) {
				t !== "selectionchange" && (Vf.has(t) || Uf(t, !1, e), Uf(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Wf] || (t[Wf] = !0, Uf("selectionchange", !1, t));
		}
	}
	function Kf(e, t, n, r) {
		switch (wh(t)) {
			case 2:
				var i = vh;
				break;
			case 8:
				i = yh;
				break;
			default: i = bh;
		}
		n = i.bind(null, t, n, e), i = void 0, !Pn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function qf(e, t, n, r, i) {
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
					if (s = Rt(c), s === null) return;
					if (l = s.tag, l === 5 || l === 6 || l === 26 || l === 27) {
						r = a = s;
						continue a;
					}
					c = c.parentNode;
				}
			}
			r = r.return;
		}
		jn(function() {
			var r = a, i = En(n), s = [];
			a: {
				var c = gi.get(e);
				if (c !== void 0) {
					var l = Un, u = e;
					switch (e) {
						case "keypress": if (zn(n) === 0) break a;
						case "keydown":
						case "keyup":
							l = or;
							break;
						case "focusin":
							u = "focus", l = Zn;
							break;
						case "focusout":
							u = "blur", l = Zn;
							break;
						case "beforeblur":
						case "afterblur":
							l = Zn;
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
							l = Yn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							l = Xn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							l = lr;
							break;
						case li:
						case ui:
						case di:
							l = Qn;
							break;
						case hi:
							l = ur;
							break;
						case "scroll":
						case "scrollend":
							l = Gn;
							break;
						case "wheel":
							l = dr;
							break;
						case "copy":
						case "cut":
						case "paste":
							l = $n;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							l = sr;
							break;
						case "submit":
							l = cr;
							break;
						case "toggle":
						case "beforetoggle": l = fr;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? c === null ? null : c + "Capture" : c;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = Mn(m, p), g != null && d.push(Jf(m, g, h))), f) break;
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
					if (l = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", l && n !== Tn && (u = n.relatedTarget || n.fromElement) && (Rt(u) || u[jt])) break a;
					(c || l) && (u = i.window === i ? i : (l = i.ownerDocument) ? l.defaultView || l.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? Rt(l) : null, l !== null && (f = o(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l && (d = Yn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = sr, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? u : Bt(c), h = l == null ? u : Bt(l), u = new d(g, m + "leave", c, n, i), u.target = f, u.relatedTarget = h, g = null, Rt(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = c && l ? E(c, l, Xf) : null, c !== null && Zf(s, u, c, d, !1), l !== null && f !== null && Zf(s, f, l, d, !0)));
				}
				a: {
					if (c = r ? Bt(r) : window, l = c.nodeName && c.nodeName.toLowerCase(), l === "select" || l === "input" && c.type === "file") var _ = Mr;
					else if (Er(c)) {
						if (Nr) _ = Hr;
						else {
							_ = Br;
							var v = zr;
						}
					} else l = c.nodeName, !l || l.toLowerCase() !== "input" || c.type !== "checkbox" && c.type !== "radio" ? r && bn(r.elementType) && (_ = Mr) : _ = Vr;
					if (_ &&= _(e, r)) {
						Dr(s, _, n, i);
						break a;
					}
					v && v(e, c, r);
				}
				switch (v = r ? Bt(r) : window, e) {
					case "focusin":
						(Er(v) || v.contentEditable === "true") && ($r = v, ei = r, ti = null);
						break;
					case "focusout":
						ti = ei = $r = null;
						break;
					case "mousedown":
						ni = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						ni = !1, ri(s, n, i);
						break;
					case "selectionchange": if (Qr) break;
					case "keydown":
					case "keyup": ri(s, n, i);
				}
				var y;
				if (mr) b: {
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
				else Sr ? br(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
				b && (_r && n.locale !== "ko" && (Sr || b !== "onCompositionStart" ? b === "onCompositionEnd" && Sr && (y = Rn()) : (In = i, Ln = "value" in In ? In.value : In.textContent, Sr = !0)), v = Yf(r, b), 0 < v.length && (b = new er(b, e, null, n, i), s.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = xr(n), y !== null && (b.data = y)))), (y = gr ? Cr(e, n) : wr(e, n)) && (b = Yf(r, "onBeforeInput"), 0 < b.length && (v = new er("onBeforeInput", "beforeinput", null, n, i), s.push({
					event: v,
					listeners: b
				}), v.data = y)), Lf(s, e, r, n, i);
			}
			Hf(s, t);
		});
	}
	function Jf(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Yf(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = Mn(e, n), i != null && r.unshift(Jf(e, i, a)), i = Mn(e, t), i != null && r.push(Jf(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Xf(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Zf(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = Mn(n, a), l != null && o.unshift(Jf(n, l, c))) : i || (l = Mn(n, a), l != null && o.push(Jf(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var Qf = /\r\n?/g, $f = /\u0000|\uFFFD/g;
	function ep(e) {
		return (typeof e == "string" ? e : "" + e).replace(Qf, "\n").replace($f, "");
	}
	function tp(e, t) {
		return t = ep(t), ep(e) === t;
	}
	function Q(e, t, n, r, a, o) {
		switch (n) {
			case "children":
				if (typeof r == "string") t === "body" || t === "textarea" && r === "" || gn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") t !== "body" && gn(e, "" + r);
				else return;
				break;
			case "className":
				en(e, "class", r);
				break;
			case "tabIndex":
				en(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				en(e, n, r);
				break;
			case "style":
				yn(e, r, o);
				return;
			case "data": if (t !== "object") {
				en(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href") || r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Cn(r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof o == "function" && (n === "formAction" ? (t !== "input" && Q(e, t, "name", a.name, a, null), Q(e, t, "formEncType", a.formEncType, a, null), Q(e, t, "formMethod", a.formMethod, a, null), Q(e, t, "formTarget", a.formTarget, a, null)) : (Q(e, t, "encType", a.encType, a, null), Q(e, t, "method", a.method, a, null), Q(e, t, "target", a.target, a, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Cn(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = wn);
				return;
			case "onScroll":
				r != null && Z("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Z("scrollend", e);
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
				n = Cn(r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
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
				Z("beforetoggle", e), Z("toggle", e), $t(e, "popover", r);
				break;
			case "xlinkActuate":
				tn(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				tn(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				tn(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				tn(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				tn(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				tn(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				tn(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				tn(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				tn(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				$t(e, "is", r);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") n = xn.get(n) || n, $t(e, n, r);
			else return;
		}
		N = !0;
	}
	function np(e, t, n, r, a, o) {
		switch (n) {
			case "style":
				yn(e, r, o);
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
				if (typeof r == "string") gn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") gn(e, "" + r);
				else return;
				break;
			case "onScroll":
				r != null && Z("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Z("scrollend", e);
				return;
			case "onClick":
				r != null && (e.onclick = wn);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!Gt.hasOwnProperty(n)) a: {
					if (n[0] === "o" && n[1] === "n" && (a = n.endsWith("Capture"), o = n.slice(2, a ? n.length - 7 : void 0), t = e[At] || null, t = t == null ? null : t[n], typeof t == "function" && e.removeEventListener(o, t, a), typeof r == "function")) {
						typeof t != "function" && t !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(o, r, a);
						break a;
					}
					N = !0, n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : $t(e, n, r);
				}
				return;
		}
		N = !0;
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
				Z("error", e), Z("load", e);
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
						default: Q(e, t, o, s, n, null);
					}
				}
				a && Q(e, t, "srcSet", n.srcSet, n, null), r && Q(e, t, "src", n.src, n, null);
				return;
			case "input":
				Z("invalid", e);
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
						default: Q(e, t, r, d, n, null);
					}
				}
				dn(e, o, c, l, u, s, a, !1);
				return;
			case "select":
				for (a in Z("invalid", e), r = s = o = null, n) if (n.hasOwnProperty(a) && (c = n[a], c != null)) switch (a) {
					case "value":
						o = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: Q(e, t, a, c, n, null);
				}
				t = o, n = s, e.multiple = !!r, t == null ? n != null && pn(e, !!r, n, !0) : pn(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in Z("invalid", e), o = a = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
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
					default: Q(e, t, s, c, n, null);
				}
				hn(e, r, a, o);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: Q(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				Z("beforetoggle", e), Z("toggle", e), Z("cancel", e), Z("close", e);
				break;
			case "iframe":
			case "object":
				Z("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < Bf.length; r++) Z(Bf[r], e);
				break;
			case "image":
				Z("error", e), Z("load", e);
				break;
			case "details":
				Z("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": Z("error", e), Z("load", e);
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
					default: Q(e, t, u, r, n, null);
				}
				return;
			default: if (bn(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && np(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && Q(e, t, c, r, n, null));
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
						default: r.hasOwnProperty(m) || Q(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							m !== f && (N = !0), o = m;
							break;
						case "name":
							m !== f && (N = !0), a = m;
							break;
						case "checked":
							m !== f && (N = !0), u = m;
							break;
						case "defaultChecked":
							m !== f && (N = !0), d = m;
							break;
						case "value":
							m !== f && (N = !0), s = m;
							break;
						case "defaultValue":
							m !== f && (N = !0), c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(i(137, t));
							break;
						default: m !== f && Q(e, t, p, m, r, f);
					}
				}
				un(e, s, c, l, u, d, o, a);
				return;
			case "select":
				for (o in m = s = c = p = null, n) if (l = n[o], n.hasOwnProperty(o) && l != null) switch (o) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(o) || Q(e, t, o, null, r, l);
				}
				for (a in r) if (o = r[a], l = n[a], r.hasOwnProperty(a) && (o != null || l != null)) switch (a) {
					case "value":
						o !== l && (N = !0), p = o;
						break;
					case "defaultValue":
						o !== l && (N = !0), c = o;
						break;
					case "multiple": o !== l && (N = !0), s = o;
					default: o !== l && Q(e, t, a, o, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? pn(e, !!n, n ? [] : "", !1) : pn(e, !!n, t, !0)) : pn(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (a = n[c], n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: Q(e, t, c, null, r, a);
				}
				for (s in r) if (a = r[s], o = n[s], r.hasOwnProperty(s) && (a != null || o != null)) switch (s) {
					case "value":
						a !== o && (N = !0), p = a;
						break;
					case "defaultValue":
						a !== o && (N = !0), m = a;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (a != null) throw Error(i(91));
						break;
					default: a !== o && Q(e, t, s, a, r, o);
				}
				mn(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: Q(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						p !== m && (N = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: Q(e, t, l, p, r, m);
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
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && Q(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(i(137, t));
						break;
					default: Q(e, t, u, p, r, m);
				}
				return;
			default: if (bn(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && np(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || np(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && Q(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || Q(e, t, f, p, r, m);
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
		return n = up(n).createElement(e), n[kt] = r, n[At] = t, rp(n, e, t), Ht(n), n;
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
						e.removeChild(i), Uh(t);
						return;
					}
					r--;
				} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
				else if (n === "html") vm(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, vm(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[Ft] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && vm(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Uh(t);
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
		var a = Rt(i);
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
					rm(n), Lt(n);
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
			} else if (!e[Ft]) switch (t) {
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
			n.hasOwnProperty(r) && i != null && Q(e, t, r, null, ip, i);
		}
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === wn && (e.onclick = null), Lt(e);
	}
	function vm(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		Lt(e);
	}
	var ym = /* @__PURE__ */ new Map(), bm = /* @__PURE__ */ new Set();
	function xm(e) {
		if (typeof e.getRootNode == "function") {
			var t = e.getRootNode();
			if (t.nodeType === 9 || t.nodeType === 11) return t;
		}
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	var Sm = be.d;
	be.d = {
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
		var e = Sm.f(), t = Bd();
		return e || t;
	}
	function wm(e) {
		var t = zt(e);
		t !== null && t.tag === 5 && t.type === "form" ? nc(t) : Sm.r(e);
	}
	var Tm = typeof document > "u" ? null : document;
	function Em(e, t, n) {
		var r = Tm;
		if (r && typeof t == "string" && t) {
			var i = ln(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), bm.has(i) || (bm.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), rp(t, "link", e), Ht(t), r.head.appendChild(t)));
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
			var i = "link[rel=\"preload\"][as=\"" + ln(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + ln(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + ln(n.imageSizes) + "\"]")) : i += "[href=\"" + ln(e) + "\"]";
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
				rp(o, "link", e), t === "style" && (o[It] = !0, o.onload = o.onerror = function() {
					Ut(o);
				}), Ht(o), r.head.appendChild(o);
			}
		}
	}
	function Am(e, t) {
		Sm.m(e, t);
		var n = Tm;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + ln(r) + "\"][href=\"" + ln(e) + "\"]", a = i;
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
				r = n.createElement("link"), rp(r, "link", e), Ht(r), n.head.appendChild(r);
			}
		}
	}
	function jm(e, t, n) {
		Sm.S(e, t, n);
		var r = Tm;
		if (r && e) {
			var i = Vt(r).hoistableStyles, a = Fm(e);
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
					Ht(c), rp(c, "link", e), c._p = new Promise(function(e, t) {
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
			var r = Vt(n).hoistableScripts, i = zm(e), a = r.get(i);
			a || (a = n.querySelector(Bm(i)), a || (e = D({
				src: e,
				async: !0
			}, t), (t = ym.get(i)) && Wm(e, t), a = n.createElement("script"), Ht(a), rp(a, "link", e), n.head.appendChild(a)), a = {
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
			var r = Vt(n).hoistableScripts, i = zm(e), a = r.get(i);
			a || (a = n.querySelector(Bm(i)), a || (e = D({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = ym.get(i)) && Wm(e, t), a = n.createElement("script"), Ht(a), rp(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Pm(e, t, n, r) {
		var a = (a = ke.current) ? xm(a) : null;
		if (!a) throw Error(i(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (n = Fm(n.href), t = Vt(a).hoistableStyles, r = t.get(n), r || (r = {
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
					var o = Vt(a).hoistableStyles, s = o.get(e);
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
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = zm(n), t = Vt(a).hoistableScripts, r = t.get(n), r || (r = {
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
		return "href=\"" + ln(e) + "\"";
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
			if (!0 !== t[It]) {
				r.loading = 1;
				return;
			}
		} else t = e.createElement("link"), t[It] = !0, t.onload = t.onerror = Ut.bind(null, t), rp(t, "link", n), Ht(t), e.head.appendChild(t);
		r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		});
	}
	function zm(e) {
		return "[src=\"" + ln(e) + "\"]";
	}
	function Bm(e) {
		return "script[async]" + e;
	}
	function Vm(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + ln(n.href) + "\"]");
				if (r) return t.instance = r, Ht(r), r;
				var a = D({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), Ht(r), rp(r, "style", a), Hm(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				a = Fm(n.href);
				var o = e.querySelector(Im(a));
				if (o) return t.state.loading |= 4, t.instance = o, Ht(o), o;
				r = Lm(n), (a = ym.get(a)) && Um(r, a), o = (e.ownerDocument || e).createElement("link"), Ht(o);
				var s = o;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), rp(o, "link", r), t.state.loading |= 4, Hm(o, n.precedence, e), t.instance = o;
			case "script": return o = zm(n.src), (a = e.querySelector(Bm(o))) ? (t.instance = a, Ht(a), a) : (r = n, (a = ym.get(o)) && (r = D({}, n), Wm(r, a)), e = e.ownerDocument || e, a = e.createElement("script"), Ht(a), rp(a, "link", r), e.head.appendChild(a), t.instance = a);
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
			if (!(a[Ft] || a[kt] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
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
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = rh.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, Ht(a);
					return;
				}
				a = t.ownerDocument || t, r = Lm(r), (i = ym.get(i)) && Um(r, i), a = a.createElement("link"), Ht(a);
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
		$$typeof: ie,
		Provider: null,
		Consumer: null,
		_currentValue: xe,
		_currentValue2: xe,
		_threadCount: 0
	};
	function lh(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = vt(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = vt(0), this.hiddenUpdates = vt(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function uh(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new lh(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = Pi(3, null, null, t), e.current = a, a.stateNode = e, t = Na(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, ho(a), e;
	}
	function dh(e) {
		return e ? (e = Mi, e) : Mi;
	}
	function fh(e, t, n, r, i, a) {
		i = dh(i), r.context === null ? r.context = i : r.pendingContext = i, r = _o(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = vo(e, r, t), n !== null && (Fd(n, e, t), yo(n, e, t));
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
			var t = ki(e, 67108864);
			t !== null && Fd(t, e, 67108864), mh(e, 67108864);
		}
	}
	function gh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Md();
			t = wt(t);
			var n = ki(e, t);
			n !== null && Fd(n, e, t), mh(e, t);
		}
	}
	var _h = !0;
	function vh(e, t, n, r) {
		var i = j.T;
		j.T = null;
		var a = be.p;
		try {
			be.p = 2, bh(e, t, n, r);
		} finally {
			be.p = a, j.T = i;
		}
	}
	function yh(e, t, n, r) {
		var i = j.T;
		j.T = null;
		var a = be.p;
		try {
			be.p = 8, bh(e, t, n, r);
		} finally {
			be.p = a, j.T = i;
		}
	}
	function bh(e, t, n, r) {
		if (_h) {
			var i = xh(r);
			if (i === null) qf(e, t, r, Sh, n), Nh(e, r);
			else if (Fh(i, e, t, n, r)) r.stopPropagation();
			else if (Nh(e, r), t & 4 && -1 < Mh.indexOf(e)) {
				for (; i !== null;) {
					var a = zt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = ft(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - at(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									Df(a), !(Qu & 6) && (_d = qe() + 500, Of(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = ki(a, 2), s !== null && Fd(s, a, 2), Bd(), mh(a, 2);
					}
					if (a = xh(r), a === null && qf(e, t, r, Sh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else qf(e, t, r, null, n);
		}
	}
	function xh(e) {
		return e = En(e), Ch(e);
	}
	var Sh = null;
	function Ch(e) {
		if (Sh = null, e = Rt(e), e !== null) {
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
			case "message": switch (Je()) {
				case Ye: return 2;
				case Xe: return 8;
				case Ze:
				case Qe: return 32;
				case $e: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var Th = !1, Eh = null, Dh = null, Oh = null, kh = /* @__PURE__ */ new Map(), Ah = /* @__PURE__ */ new Map(), jh = [], Mh = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Nh(e, t) {
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
	function Ph(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = zt(t), t !== null && hh(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Fh(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Eh = Ph(Eh, e, t, n, r, i), !0;
			case "dragenter": return Dh = Ph(Dh, e, t, n, r, i), !0;
			case "mouseover": return Oh = Ph(Oh, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return kh.set(a, Ph(kh.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, Ah.set(a, Ph(Ah.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Ih(e) {
		var t = Rt(e.target);
		if (t !== null) {
			var n = o(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = s(n), t !== null) {
						e.blockedOn = t, Dt(e.priority, function() {
							gh(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = c(n), t !== null) {
						e.blockedOn = t, Dt(e.priority, function() {
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
	function Lh(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = xh(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				Tn = r, n.target.dispatchEvent(r), Tn = null;
			} else return t = zt(n), t !== null && hh(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Rh(e, t, n) {
		Lh(e) && n.delete(t);
	}
	function zh() {
		Th = !1, Eh !== null && Lh(Eh) && (Eh = null), Dh !== null && Lh(Dh) && (Dh = null), Oh !== null && Lh(Oh) && (Oh = null), kh.forEach(Rh), Ah.forEach(Rh);
	}
	function Bh(e, n) {
		e.blockedOn === n && (e.blockedOn = null, Th || (Th = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, zh)));
	}
	var Vh = null;
	function Hh(e) {
		Vh !== e && (Vh = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			Vh === e && (Vh = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (Ch(r || n) === null) continue;
					break;
				}
				var a = zt(n);
				a !== null && (e.splice(t, 3), t -= 3, ec(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Uh(e) {
		function t(t) {
			return Bh(t, e);
		}
		Eh !== null && Bh(Eh, e), Dh !== null && Bh(Dh, e), Oh !== null && Bh(Oh, e), kh.forEach(t), Ah.forEach(t);
		for (var n = 0; n < jh.length; n++) {
			var r = jh[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < jh.length && (n = jh[0], n.blockedOn === null);) Ih(n), n.blockedOn === null && jh.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[At] || null;
			if (typeof a == "function") o || Hh(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[At] || null) s = o.formAction;
					else if (Ch(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Hh(n);
			}
		}
	}
	function Wh() {
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
	function Gh(e) {
		this._internalRoot = e;
	}
	Kh.prototype.render = Gh.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(i(409));
		var n = t.current;
		fh(n, Md(), e, t, null, null);
	}, Kh.prototype.unmount = Gh.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			fh(e.current, 2, null, e, null, null), Bd(), t[jt] = null;
		}
	};
	function Kh(e) {
		this._internalRoot = e;
	}
	Kh.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = Et();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < jh.length && t !== 0 && t < jh[n].priority; n++);
			jh.splice(n, 0, e), n === 0 && Ih(e);
		}
	};
	var qh = n.version;
	if (qh !== "19.3.1") throw Error(i(527, qh, "19.3.1"));
	be.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
		return e = u(t), e = e === null ? null : f(e), e = e === null ? null : e.stateNode, e;
	};
	var Jh = {
		bundleType: 0,
		version: "19.3.1",
		rendererPackageName: "react-dom",
		currentDispatcherRef: j,
		reconcilerVersion: "19.3.1"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Yh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Yh.isDisabled && Yh.supportsFiber) try {
			nt = Yh.inject(Jh), rt = Yh;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!a(e)) throw Error(i(299));
		var n = !1, r = "", o = Cc, s = wc, c = Tc;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (c = t.onRecoverableError)), t = uh(e, 1, !1, null, null, n, r, null, o, s, c, Wh), e[jt] = t.current, Gf(e), new Gh(t);
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
function O(e, t) {
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
function k(e, t) {
	let n = {};
	for (let r in e) {
		let [i, a] = O(e[r], t);
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
var ne = {};
function A() {
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
	let i = ne[n];
	if (i !== void 0) return t + i;
	let a = [];
	for (let t = 0; t < arguments.length; t++) {
		let n = r[t];
		if (n) {
			let t = x[n];
			t && (a.push(t[0]), e = t[1]);
		}
	}
	let o = Object.assign.apply(Object, [{}].concat(a)), [s, c] = O(o, e), l = te(c, e, r), u = l + " " + s;
	return ne[n] = u, x[l] = [o, e], t + u;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/normalizeCSSBucketEntry.js
function re(e) {
	return Array.isArray(e) ? e : [e];
}
//#endregion
//#region node_modules/@griffel/core/src/renderer/createIsomorphicStyleSheet.js
function ie(e, t, n, r) {
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
var ae = /*#__PURE__*/ [
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
function oe(e, t, n) {
	return e === "m" || e === "x" ? e + t + n : e + n;
}
function se(e, t, n, r, i = {}) {
	let a = e === "m", o = e === "x", s = i.m, c = i.x, l = i.p ?? 0, u = oe(e, c ?? s ?? "0", l);
	if (!r.stylesheets[u]) {
		let d = t && t.createElement("style"), f = ie(d, e, l, {
			...r.styleElementAttributes,
			...a && { media: s },
			...o && { "data-container": c }
		});
		r.stylesheets[u] = f, t?.head && d && t.head.insertBefore(d, le(t, n, e, r, i));
	}
	return r.stylesheets[u];
}
function ce(e, t, n) {
	return e.getAttribute("data-make-styles-bucket") === t ? t === "m" ? n.m === e.media : t !== "x" || n.x === e.getAttribute(w) : !1;
}
function le(e, t, n, r, i = {}) {
	let a = ae[n], o = i.m ?? "", s = i.x ?? "", c = i.p ?? 0, l = (e) => a - ae[e.getAttribute(S)], u = e.head.querySelectorAll(`[${S}]`);
	if (n === "m" || n === "x") {
		let t = e.head.querySelectorAll(`[${S}="${n}"]`);
		t.length && (u = t, l = n === "m" ? (e) => r.compareMediaQueries(o, e.media) : (e) => r.compareContainerQueries(s, e.getAttribute("data-container") ?? ""));
	}
	let d = (e) => ce(e, n, i) ? c - Number(e.getAttribute(C)) : l(e), f = u.length, p = f - 1;
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
function ue(e, t) {
	try {
		e.insertRule(t);
	} catch {}
}
//#endregion
//#region node_modules/@griffel/core/src/renderer/createDOMRenderer.js
var de = 0, fe = (e, t) => e < t ? -1 : +(e > t);
function pe(e = typeof document > "u" ? void 0 : document, t = {}) {
	let { classNameHashSalt: n, unstable_filterCSSRule: r, insertionPoint: i, styleElementAttributes: a, compareMediaQueries: o = fe, compareContainerQueries: s = o } = t, c = {
		classNameHashSalt: n,
		insertionCache: {},
		stylesheets: {},
		styleElementAttributes: Object.freeze(a),
		compareMediaQueries: o,
		compareContainerQueries: s,
		id: `d${de++}`,
		insertCSSRules(t) {
			for (let n in t) {
				let a = t[n];
				for (let t = 0, o = a.length; t < o; t++) {
					let [o, s] = re(a[t]), l = se(n, e, i || null, c, s);
					c.insertionCache[o] || (c.insertionCache[o] = n, r ? r(o) && ue(l, o) : ue(l, o));
				}
			}
		}
	};
	return c;
}
//#endregion
//#region node_modules/stylis/src/Enum.js
var me = "-moz-", he = "-webkit-", ge = "comm", _e = "rule", ve = "decl", ye = "@media", j = "@import", be = "@supports", xe = "@namespace", Se = "@keyframes", Ce = "@layer", we = Math.abs, Te = String.fromCharCode, Ee = Object.assign;
function De(e, t) {
	return Me(e, 0) ^ 45 ? (((t << 2 ^ Me(e, 0)) << 2 ^ Me(e, 1)) << 2 ^ Me(e, 2)) << 2 ^ Me(e, 3) : 0;
}
function Oe(e) {
	return e.trim();
}
function ke(e, t) {
	return (e = t.exec(e)) ? e[0] : e;
}
function Ae(e, t, n) {
	return e.replace(t, n);
}
function je(e, t) {
	return e.indexOf(t);
}
function Me(e, t) {
	return e.charCodeAt(t) | 0;
}
function Ne(e, t, n) {
	return e.slice(t, n);
}
function Pe(e) {
	return e.length;
}
function Fe(e) {
	return e.length;
}
function Ie(e, t) {
	return t.push(e), e;
}
function Le(e, t) {
	return e.map(t).join("");
}
//#endregion
//#region node_modules/stylis/src/Tokenizer.js
var Re = 1, ze = 1, Be = 0, Ve = 0, He = 0, Ue = "";
function We(e, t, n, r, i, a, o, s) {
	return {
		value: e,
		root: t,
		parent: n,
		type: r,
		props: i,
		children: a,
		line: Re,
		column: ze,
		length: o,
		return: "",
		siblings: s
	};
}
function Ge(e, t) {
	return Ee(We("", null, null, "", null, null, 0, e.siblings), e, { length: -e.length }, t);
}
function Ke() {
	return He;
}
function qe() {
	return He = Ve > 0 ? Me(Ue, --Ve) : 0, ze--, He === 10 && (ze = 1, Re--), He;
}
function Je() {
	return He = Ve < Be ? Me(Ue, Ve++) : 0, ze++, He === 10 && (ze = 1, Re++), He;
}
function Ye() {
	return Me(Ue, Ve);
}
function Xe() {
	return Ve;
}
function Ze(e, t) {
	return Ne(Ue, e, t);
}
function Qe(e) {
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
function $e(e) {
	return Re = ze = 1, Be = Pe(Ue = e), Ve = 0, [];
}
function et(e) {
	return Ue = "", e;
}
function tt(e) {
	return Oe(Ze(Ve - 1, ot(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function nt(e) {
	return et(it($e(e)));
}
function rt(e) {
	for (; (He = Ye()) && He < 33;) Je();
	return Qe(e) > 2 || Qe(He) > 3 ? "" : " ";
}
function it(e) {
	for (; Je();) switch (Qe(He)) {
		case 0:
			Ie(ct(Ve - 1), e);
			break;
		case 2:
			Ie(tt(He), e);
			break;
		default: Ie(Te(He), e);
	}
	return e;
}
function at(e, t) {
	for (; --t && Je() && !(He < 48 || He > 102 || He > 57 && He < 65 || He > 70 && He < 97););
	return Ze(e, Xe() + (t < 6 && Ye() == 32 && Je() == 32));
}
function ot(e) {
	for (; Je();) switch (He) {
		case e: return Ve;
		case 34:
		case 39:
			e !== 34 && e !== 39 && ot(He);
			break;
		case 40:
			e === 41 && ot(e);
			break;
		case 92: Je();
	}
	return Ve;
}
function st(e, t) {
	for (; Je() && e + He !== 57 && (e + He !== 84 || Ye() !== 47););
	return "/*" + Ze(t, Ve - 1) + "*" + Te(e === 47 ? e : Je());
}
function ct(e) {
	for (; !Qe(Ye());) Je();
	return Ze(e, Ve);
}
//#endregion
//#region node_modules/stylis/src/Parser.js
function lt(e) {
	return et(ut("", null, null, null, [""], e = $e(e), 0, [0], e));
}
function ut(e, t, n, r, i, a, o, s, c) {
	for (var l = 0, u = 0, d = o, f = 0, p = 0, m = 0, h = 1, g = 1, _ = 1, v = 0, y = 0, b = "", x = i, S = a, C = r, w = b; g;) switch (m = y, y = Je()) {
		case 40:
			m != 108 && Me(w, d - 1) == 58 ? (v++, w += "(") : w += tt(y);
			break;
		case 41:
			v--, w += ")";
			break;
		case 34:
		case 39:
		case 91:
			w += tt(y);
			break;
		case 9:
		case 10:
		case 13:
		case 32:
			if (v > 0) {
				w += Te(y);
				break;
			}
			w += rt(m);
			break;
		case 92:
			w += at(Xe() - 1, 7);
			continue;
		case 47:
			switch (Ye()) {
				case 42:
				case 47:
					Ie(ft(st(Je(), Xe()), t, n, c), c), (Qe(m || 1) == 5 || Qe(Ye() || 1) == 5) && Pe(w) && Ne(w, -1, void 0) !== " " && (w += " ");
					break;
				default: w += "/";
			}
			break;
		case 123 * h: s[l++] = Pe(w) * _;
		case 125 * h:
		case 59:
		case 0:
			if (v > 0 && y) {
				w += Te(y);
				break;
			}
			switch (y) {
				case 0:
				case 125: g = 0;
				case 59 + u:
					_ == -1 && (w = Ae(w, /\f/g, "")), p > 0 && (Pe(w) - d || h === 0) && Ie(p > 32 ? pt(w + ";", r, n, d - 1, c) : pt(Ae(w, " ", "") + ";", r, n, d - 2, c), c);
					break;
				case 59: w += ";";
				default: if (Ie(C = dt(w, t, n, l, u, i, s, b, x = [], S = [], d, a), a), y === 123) {
					if (u === 0) ut(w, t, C, C, x, a, d, s, S);
					else {
						switch (f) {
							case 99: if (Me(w, 3) === 110) break;
							case 108: if (Me(w, 2) === 97) break;
							default: u = 0;
							case 100:
							case 109:
							case 115:
						}
						u ? ut(e, C, C, r && Ie(dt(e, C, C, 0, 0, i, s, b, i, x = [], d, S), S), i, S, d, s, r ? x : S) : ut(w, C, C, C, [""], S, 0, s, S);
					}
				}
			}
			l = u = p = 0, h = _ = 1, b = w = "", d = o;
			break;
		case 58: d = 1 + Pe(w), p = m;
		default:
			if (h < 1) {
				if (y == 123) --h;
				else if (y == 125 && h++ == 0 && qe() == 125) continue;
			}
			switch (w += Te(y), y * h) {
				case 38:
					_ = u > 0 ? 1 : (w += "\f", -1);
					break;
				case 44:
					if (v > 0) break;
					s[l++] = (Pe(w) - 1) * _, _ = 1;
					break;
				case 64:
					Ye() === 45 && (w += tt(Je())), f = Ye(), u = d = Pe(b = w += ct(Xe())), y++;
					break;
				case 45: m === 45 && Pe(w) == 2 && (h = 0);
			}
	}
	return a;
}
function dt(e, t, n, r, i, a, o, s, c, l, u, d) {
	for (var f = i - 1, p = i === 0 ? a : [""], m = Fe(p), h = 0, g = 0, _ = 0; h < r; ++h) for (var v = 0, y = Ne(e, f + 1, f = we(g = o[h])), b = e; v < m; ++v) (b = Oe(g > 0 ? p[v] + " " + y : Ae(y, /&\f/g, p[v]))) && (c[_++] = b);
	return We(e, t, n, i === 0 ? _e : s, c, l, u, d);
}
function ft(e, t, n, r) {
	return We(e, t, n, ge, Te(Ke()), Ne(e, 2, -2), 0, r);
}
function pt(e, t, n, r, i) {
	return We(e, t, n, ve, Ne(e, 0, r), Ne(e, r + 1, -1), r, i);
}
//#endregion
//#region node_modules/stylis/src/Serializer.js
function mt(e, t) {
	for (var n = "", r = 0; r < e.length; r++) n += t(e[r], r, e, t) || "";
	return n;
}
function ht(e, t, n, r) {
	switch (e.type) {
		case Ce: if (e.children.length) break;
		case j:
		case xe:
		case ve: return e.return = e.return || e.value;
		case ge: return "";
		case Se: return e.return = e.value + "{" + mt(e.children, r) + "}";
		case _e: if (!Pe(e.value = e.props.join(","))) return "";
	}
	return Pe(n = mt(e.children, r)) ? e.return = e.value + "{" + n + "}" : "";
}
//#endregion
//#region node_modules/stylis/src/Middleware.js
function gt(e) {
	var t = Fe(e);
	return function(n, r, i, a) {
		for (var o = "", s = 0; s < t; s++) o += e[s](n, r, i, a) || "";
		return o;
	};
}
function _t(e) {
	return function(t) {
		t.root || (t = t.return) && e(t);
	};
}
//#endregion
//#region node_modules/@griffel/core/src/insertionFactory.js
var vt = () => {
	let e = {};
	return function(t, n) {
		e[t.id] === void 0 && (t.insertCSSRules(n), e[t.id] = !0);
	};
};
//#endregion
//#region node_modules/rtl-css-js/dist/esm/convert-9768a965.js
function yt(e) {
	return e.reduce(function(e, t) {
		var n = t[0], r = t[1];
		return e[n] = r, e[r] = n, e;
	}, {});
}
function bt(e) {
	return typeof e == "boolean";
}
function xt(e) {
	return typeof e == "function";
}
function St(e) {
	return typeof e == "number";
}
function Ct(e) {
	return e == null;
}
function wt(e) {
	return e && typeof e == "object";
}
function Tt(e) {
	return typeof e == "string";
}
function Et(e, t) {
	return e.indexOf(t) !== -1;
}
function Dt(e) {
	return parseFloat(e) === 0 ? e : e[0] === "-" ? e.slice(1) : "-" + e;
}
function Ot(e, t, n, r) {
	return t + Dt(n) + r;
}
function kt(e) {
	var t = e.indexOf(".");
	if (t === -1) e = 100 - parseFloat(e) + "%";
	else {
		var n = e.length - t - 2;
		e = 100 - parseFloat(e), e = e.toFixed(n) + "%";
	}
	return e;
}
function At(e) {
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
function jt(e) {
	var t = At(e);
	if (t.length <= 3 || t.length > 4) return e;
	var n = t[0], r = t[1], i = t[2];
	return [
		n,
		t[3],
		i,
		r
	].join(" ");
}
function Mt(e) {
	return !bt(e) && !Ct(e);
}
function Nt(e) {
	for (var t = [], n = 0, r = 0, i = !1; r < e.length;) !i && e[r] === "," ? (t.push(e.substring(n, r).trim()), r++, n = r) : e[r] === "(" ? (i = !0, r++) : (e[r] === ")" && (i = !1), r++);
	return n != r && t.push(e.substring(n, r + 1)), t;
}
var M = {
	padding: function(e) {
		var t = e.value;
		return St(t) ? t : jt(t);
	},
	textShadow: function(e) {
		var t = e.value;
		return Nt(t).map(function(e) {
			return e.replace(/(^|\s)(-*)([.|\d]+)/, function(e, t, n, r) {
				if (r === "0") return e;
				var i = n === "" ? "-" : "";
				return "" + t + i + r;
			});
		}).join(",");
	},
	borderColor: function(e) {
		var t = e.value;
		return jt(t);
	},
	borderRadius: function(e) {
		var t = e.value;
		if (St(t)) return t;
		if (Et(t, "/")) {
			var n = t.split("/"), r = n[0], i = n[1], a = M.borderRadius({ value: r.trim() }), o = M.borderRadius({ value: i.trim() });
			return a + " / " + o;
		}
		var s = At(t);
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
		if (St(t)) return t;
		var o = t.replace(/(url\(.*?\))|(rgba?\(.*?\))|(hsl\(.*?\))|(#[a-fA-F0-9]+)|((^| )(\D)+( |$))/g, "").trim();
		return t = t.replace(o, M.backgroundPosition({
			value: o,
			valuesToConvert: n,
			isRtl: r,
			bgPosDirectionRegex: a
		})), M.backgroundImage({
			value: t,
			valuesToConvert: n,
			bgImgDirectionRegex: i
		});
	},
	backgroundImage: function(e) {
		var t = e.value, n = e.valuesToConvert, r = e.bgImgDirectionRegex;
		return !Et(t, "url(") && !Et(t, "linear-gradient(") ? t : t.replace(r, function(e, t, r) {
			return e.replace(r, n[r]);
		});
	},
	backgroundPosition: function(e) {
		var t = e.value, n = e.valuesToConvert, r = e.isRtl, i = e.bgPosDirectionRegex;
		return t.replace(r ? /^((-|\d|\.)+%)/ : null, function(e, t) {
			return kt(t);
		}).replace(i, function(e) {
			return n[e];
		});
	},
	backgroundPositionX: function(e) {
		var t = e.value, n = e.valuesToConvert, r = e.isRtl, i = e.bgPosDirectionRegex;
		return St(t) ? t : M.backgroundPosition({
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
		return t.replace(a, Ot).replace(o, Ot).replace(s, Ot).replace(c, Ot);
	}
};
M.objectPosition = M.backgroundPosition, M.margin = M.padding, M.borderWidth = M.padding, M.boxShadow = M.textShadow, M.webkitBoxShadow = M.boxShadow, M.mozBoxShadow = M.boxShadow, M.WebkitBoxShadow = M.boxShadow, M.MozBoxShadow = M.boxShadow, M.borderStyle = M.borderColor, M.webkitTransform = M.transform, M.mozTransform = M.transform, M.WebkitTransform = M.transform, M.MozTransform = M.transform, M.transformOrigin = M.backgroundPosition, M.webkitTransformOrigin = M.transformOrigin, M.mozTransformOrigin = M.transformOrigin, M.WebkitTransformOrigin = M.transformOrigin, M.MozTransformOrigin = M.transformOrigin, M.webkitTransition = M.transition, M.mozTransition = M.transition, M.WebkitTransition = M.transition, M.MozTransition = M.transition, M.webkitTransitionProperty = M.transitionProperty, M.mozTransitionProperty = M.transitionProperty, M.WebkitTransitionProperty = M.transitionProperty, M.MozTransitionProperty = M.transitionProperty, M["text-shadow"] = M.textShadow, M["border-color"] = M.borderColor, M["border-radius"] = M.borderRadius, M["background-image"] = M.backgroundImage, M["background-position"] = M.backgroundPosition, M["background-position-x"] = M.backgroundPositionX, M["object-position"] = M.objectPosition, M["border-width"] = M.padding, M["box-shadow"] = M.textShadow, M["-webkit-box-shadow"] = M.textShadow, M["-moz-box-shadow"] = M.textShadow, M["border-style"] = M.borderColor, M["-webkit-transform"] = M.transform, M["-moz-transform"] = M.transform, M["transform-origin"] = M.transformOrigin, M["-webkit-transform-origin"] = M.transformOrigin, M["-moz-transform-origin"] = M.transformOrigin, M["-webkit-transition"] = M.transition, M["-moz-transition"] = M.transition, M["transition-property"] = M.transitionProperty, M["-webkit-transition-property"] = M.transitionProperty, M["-moz-transition-property"] = M.transitionProperty;
var Pt = yt([
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
]), Ft = ["content"], It = yt([
	["ltr", "rtl"],
	["left", "right"],
	["w-resize", "e-resize"],
	["sw-resize", "se-resize"],
	["nw-resize", "ne-resize"]
]), Lt = /* @__PURE__ */ RegExp("(^|\\W|_)((ltr)|(rtl)|(left)|(right))(\\W|_|$)", "g"), Rt = /* @__PURE__ */ RegExp("(left)|(right)");
function zt(e) {
	return Object.keys(e).reduce(function(t, n) {
		var r = e[n];
		if (Tt(r) && (r = r.trim()), Et(Ft, n)) return t[n] = r, t;
		var i = Bt(n, r), a = i.key;
		return t[a] = i.value, t;
	}, Array.isArray(e) ? [] : {});
}
function Bt(e, t) {
	var n = /\/\*\s?@noflip\s?\*\//.test(t), r = n ? e : Vt(e);
	return {
		key: r,
		value: n ? t : Ht(r, t)
	};
}
function Vt(e) {
	return Pt[e] || e;
}
function Ht(e, t) {
	if (!Mt(t)) return t;
	if (wt(t)) return zt(t);
	var n = St(t), r = xt(t), i = n || r ? t : t.replace(/ !important.*?$/, ""), a = !n && i.length !== t.length, o = M[e], s = o ? o({
		value: i,
		valuesToConvert: It,
		propertiesToConvert: Pt,
		isRtl: !0,
		bgImgDirectionRegex: Lt,
		bgPosDirectionRegex: Rt
	}) : It[i] || i;
	return a ? s + " !important" : s;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/stylis/globalPlugin.js
var Ut = (e) => {
	switch (e.type) {
		case _e:
			if (typeof e.props == "string") return;
			e.props = e.props.map((e) => e.indexOf(":global(") === -1 ? e : nt(e).reduce((e, t, n, r) => {
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
function Wt(e, t, n) {
	switch (De(e, t)) {
		case 5103: return he + "print-" + e + e;
		case 3191:
		case 6645:
		case 3005:
		case 6391:
		case 5879:
		case 5623:
		case 6135:
		case 4599:
		case 4855: return he + e + e;
		case 4215:
			if (Me(e, 9) === 102 || Me(e, t + 1) === 116) return he + e + e;
			break;
		case 4789: return me + e + e;
		case 5349:
		case 4246:
		case 6968: return he + e + me + e + e;
		case 6187: if (!ke(e, /grab/)) return Ae(Ae(Ae(e, /(zoom-|grab)/, he + "$1"), /(image-set)/, he + "$1"), e, "") + e;
		case 5495:
		case 3959: return Ae(e, /(image-set\([^]*)/, he + "$1$`$1");
		case 4095:
		case 3583:
		case 4068:
		case 2532: return Ae(e, /(.+)-inline(.+)/, he + "$1$2") + e;
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
		case 4765: if (Pe(e) - 1 - t > 6) switch (Me(e, t + 1)) {
			case 102: if (Me(e, t + 3) === 108) return Ae(e, /(.+:)(.+)-([^]+)/, "$1" + he + "$2-$3$1" + me + (Me(e, t + 3) == 108 ? "$3" : "$2-$3")) + e;
			case 115: return ~je(e, "stretch") ? Wt(Ae(e, "stretch", "fill-available"), t, n) + e : e;
		}
	}
	return e;
}
function Gt(e, t, n, r) {
	if (e.length > -1 && !e.return) switch (e.type) {
		case ve:
			e.return = Wt(e.value, e.length, n);
			return;
		case _e: if (e.length) return Le(e.props, function(t) {
			switch (ke(t, /(::plac\w+|:read-\w+)/)) {
				case ":read-only":
				case ":read-write": return mt([Ge(e, { props: [Ae(t, /:(read-\w+)/, ":" + me + "$1")] })], r);
				case "::placeholder": return mt([Ge(e, { props: [Ae(t, /:(plac\w+)/, ":" + he + "input-$1")] }), Ge(e, { props: [Ae(t, /:(plac\w+)/, ":" + me + "$1")] })], r);
			}
			return "";
		});
	}
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/stylis/isAtRuleElement.js
function Kt(e) {
	switch (e.type) {
		case "@container":
		case ye:
		case be:
		case Ce: return !0;
	}
	return !1;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/stylis/sortClassesInAtRulesPlugin.js
var qt = (e) => {
	Kt(e) && Array.isArray(e.children) && e.children.sort((e, t) => e.props[0] > t.props[0] ? 1 : -1);
};
//#endregion
//#region node_modules/@griffel/core/src/runtime/compileCSSRules.js
function Jt() {}
function Yt(e, t) {
	let n = [];
	return mt(lt(e), gt([
		Ut,
		t ? qt : Jt,
		Gt,
		ht,
		_t((e) => n.push(e))
	])), n;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hyphenateProperty.js
var Xt = /[A-Z]/g, Zt = /^ms-/, N = {};
function Qt(e) {
	return "-" + e.toLowerCase();
}
function $t(e) {
	if (Object.prototype.hasOwnProperty.call(N, e)) return N[e];
	if (e.substr(0, 2) === "--") return e;
	let t = e.replace(Xt, Qt);
	return N[e] = Zt.test(t) ? "-" + t : t;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/normalizeNestedProperty.js
function en(e) {
	return e.charAt(0) === "&" ? e.slice(1) : e;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/compileAtomicCSSRule.js
var tn = /,( *[^ &])/g;
function nn(e) {
	return "&" + en(e.replace(tn, ",&$1"));
}
function rn(e, t) {
	return t.reduceRight((e, t) => `${nn(t)} { ${e} }`, e);
}
function an(e, t) {
	let { className: n, selectors: r, property: i, rtlClassName: a, rtlProperty: o, rtlValue: s, value: c } = e, { container: l, layer: u, media: d, scope: f, supports: p } = t, m = `.${n}`, h = rn(Array.isArray(c) ? `${c.map((e) => `${$t(i)}: ${e}`).join(";")};` : `${$t(i)}: ${c};`, r), g = f ? `@scope (${m}) ${f} { :scope{${h}} }` : `${m}{${h}}`;
	if (o && a) {
		let e = `.${a}`, t = rn(Array.isArray(s) ? `${s.map((e) => `${$t(o)}: ${e}`).join(";")};` : `${$t(o)}: ${s};`, r);
		g += f ? `@scope (${e}) ${f} { :scope{${t}} }` : `${e}{${t}}`;
	}
	return d && (g = `@media ${d} { ${g} }`), u && (g = `@layer ${u} { ${g} }`), p && (g = `@supports ${p} { ${g} }`), l && (g = `@container ${l} { ${g} }`), Yt(g, !0);
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/cssifyObject.js
function on(e) {
	let t = "";
	for (let n in e) {
		let r = e[n];
		if (typeof r == "string" || typeof r == "number") t += $t(n) + ":" + r + ";";
		else if (Array.isArray(r)) for (let e of r) t += $t(n) + ":" + e + ";";
	}
	return t;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/compileKeyframeCSS.js
function sn(e) {
	let t = "";
	for (let n in e) t += `${n}{${on(e[n])}}`;
	return t;
}
function cn(e, t) {
	let n = `@keyframes ${e} {${t}}`, r = [];
	return mt(lt(n), gt([
		ht,
		Gt,
		_t((e) => r.push(e))
	])), r;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/getStyleBucketName.js
var ln = {
	"us-w": "w",
	"us-v": "i",
	nk: "l",
	si: "v",
	cu: "f",
	ve: "h",
	ti: "a"
};
function un(e, t) {
	if (t.media) return "m";
	if (t.layer || t.supports) return "t";
	if (t.container) return "x";
	if (e.length > 0) {
		let t = e[0].trim();
		if (t.charCodeAt(0) === 58) return ln[t.slice(4, 8)] || ln[t.slice(3, 5)] || "d";
	}
	return "d";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/shorthands.js
var dn = {
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
function fn(e, t) {
	return e.length === 0 ? t : `${e} and ${t}`;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hashPropertyKey.js
function pn(e, t) {
	return e && t + e;
}
function mn(e) {
	return pn(e.container, "c") + pn(e.media, "m") + pn(e.layer, "l") + pn(e.supports, "s") + pn(e.scope, "o");
}
function hn(e, t, n) {
	let r = D(e + mn(n) + t), i = r.charCodeAt(0);
	return i >= 48 && i <= 57 ? String.fromCharCode(i + 17) + r.slice(1) : r;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hashClassName.js
function gn({ property: e, selector: t, salt: n, value: r }, i) {
	return "f" + D(n + t + mn(i) + e + r.trim());
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isContainerQuerySelector.js
function _n(e) {
	return e.substring(0, 10) === "@container";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isLayerSelector.js
function vn(e) {
	return e.substr(0, 6) === "@layer";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isMediaQuerySelector.js
function yn(e) {
	return e.substr(0, 6) === "@media";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isNestedSelector.js
var bn = /^(:|\[|>|&)/;
function xn(e) {
	return bn.test(e);
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isObject.js
function Sn(e) {
	return typeof e == "object" && !!e && Array.isArray(e) === !1;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isResetValue.js
function Cn(e) {
	return e === E;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isScopeSelector.js
function wn(e) {
	return e.substring(0, 6) === "@scope";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isSupportQuerySelector.js
function Tn(e) {
	return e.substr(0, 9) === "@supports";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/trimSelector.js
function En(e) {
	return e.replace(/>\s+/g, ">");
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/resolveStyleRules.js
function Dn(e) {
	return dn[e];
}
function On(e) {
	return e?.[0] ?? 0;
}
function kn(e, t, n, r) {
	e[t] = r ? [n, r] : n;
}
function An(e, t) {
	return t.length > 0 ? [e, Object.fromEntries(t)] : e;
}
function jn(e, t, n, r, i, a, o) {
	let s = [];
	o !== 0 && s.push(["p", o]), t === "m" && i && s.push(["m", i]), t === "x" && a && s.push(["x", a]), e[t] ?? (e[t] = []), n && e[t].push(An(n, s)), r && e[t].push(An(r, s));
}
function Mn(e, t = "", n = [], r = {
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
			if (Cn(c)) kn(i, hn(En(n.join("")), s, r), 0, void 0);
			else if (typeof c == "string" || typeof c == "number") {
				let e = En(n.join("")), l = Dn(s);
				if (l) {
					let e = l[1];
					Mn(Object.fromEntries(e.map((e) => [e, E])), t, n, r, i, a);
				}
				let u = hn(e, s, r), d = gn({
					value: c.toString(),
					salt: t,
					selector: e,
					property: s
				}, r), f = o && {
					key: s,
					value: o
				} || Bt(s, c), p = f.key !== s || f.value !== c, m = p ? gn({
					value: f.value.toString(),
					property: f.key,
					salt: t,
					selector: e
				}, r) : void 0, h = p ? {
					rtlClassName: m,
					rtlProperty: f.key,
					rtlValue: f.value
				} : void 0, g = un(n, r), [_, v] = an({
					className: d,
					selectors: n,
					property: s,
					value: c,
					...h
				}, r);
				kn(i, u, d, m), jn(a, g, _, v, r.media, r.container, On(l));
			} else if (s === "animationName") {
				let e = Array.isArray(c) ? c : [c], o = [], s = [];
				for (let t of e) {
					let e = sn(t), n = sn(zt(t)), i = "f" + D(e), c, l = cn(i, e), u = [];
					e === n ? c = i : (c = "f" + D(n), u = cn(c, n));
					for (let e = 0; e < l.length; e++) jn(a, "k", l[e], u[e], r.media, r.container, 0);
					o.push(i), s.push(c);
				}
				Mn({ animationName: o.join(", ") }, t, n, r, i, a, s.join(", "));
			} else if (Array.isArray(c)) {
				if (c.length === 0) continue;
				let e = En(n.join("")), o = Dn(s);
				if (o) {
					let e = o[1];
					Mn(Object.fromEntries(e.map((e) => [e, E])), t, n, r, i, a);
				}
				let l = hn(e, s, r), u = gn({
					value: c.map((e) => (e ?? "").toString()).join(";"),
					salt: t,
					selector: e,
					property: s
				}, r), d = c.map((e) => Bt(s, e));
				if (d.some((e) => e.key !== d[0].key)) continue;
				let f = d[0].key !== s || d.some((e, t) => e.value !== c[t]), p = f ? gn({
					value: d.map((e) => (e?.value ?? "").toString()).join(";"),
					salt: t,
					property: d[0].key,
					selector: e
				}, r) : void 0, m = f ? {
					rtlClassName: p,
					rtlProperty: d[0].key,
					rtlValue: d.map((e) => e.value)
				} : void 0, h = un(n, r), [g, _] = an({
					className: u,
					selectors: n,
					property: s,
					value: c,
					...m
				}, r);
				kn(i, l, u, p), jn(a, h, g, _, r.media, r.container, On(o));
			} else if (Sn(c)) {
				if (xn(s)) Mn(c, t, n.concat(en(s)), r, i, a);
				else if (yn(s)) {
					let e = fn(r.media, s.slice(6).trim());
					Mn(c, t, n, {
						...r,
						media: e
					}, i, a);
				} else if (vn(s)) {
					let e = (r.layer ? `${r.layer}.` : "") + s.slice(6).trim();
					Mn(c, t, n, {
						...r,
						layer: e
					}, i, a);
				} else if (Tn(s)) {
					let e = fn(r.supports, s.slice(9).trim());
					Mn(c, t, n, {
						...r,
						supports: e
					}, i, a);
				} else if (_n(s)) {
					let e = s.slice(10).trim();
					Mn(c, t, n, {
						...r,
						container: e
					}, i, a);
				} else if (wn(s)) {
					if (r.scope) continue;
					let e = s.slice(6).trim();
					if (e === "" || !e.startsWith("to ")) continue;
					Mn(c, t, n, {
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
function Nn(e, t = "") {
	let n = {}, r = {};
	for (let i in e) {
		let a = e[i], [o, s] = Mn(a, t);
		n[i] = o, Object.keys(s).forEach((e) => {
			r[e] = (r[e] || []).concat(s[e]);
		});
	}
	return [n, r];
}
//#endregion
//#region node_modules/@griffel/core/src/makeStyles.js
function Pn(e, t = vt) {
	let n = t(), r = null, i = null, a = null, o = null;
	function s(t) {
		let { dir: s, renderer: c } = t;
		r === null && ([r, i] = Nn(e, c.classNameHashSalt));
		let l = s === "ltr";
		return l ? a === null && (a = k(r, s)) : o === null && (o = k(r, s)), n(c, i), l ? a : o;
	}
	return s;
}
//#endregion
//#region node_modules/@griffel/core/src/__styles.js
function Fn(e, t, n = vt) {
	let r = n(), i = null, a = null;
	function o(n) {
		let { dir: o, renderer: s } = n, c = o === "ltr";
		return c ? i === null && (i = k(e, o)) : a === null && (a = k(e, o)), r(s, t), c ? i : a;
	}
	return o;
}
//#endregion
//#region node_modules/@griffel/core/src/__resetStyles.js
function In(e, t, n, r = vt) {
	let i = r();
	function a(r) {
		let { dir: a, renderer: o } = r, s = a === "ltr" ? e : t || e;
		return i(o, Array.isArray(n) ? { r: n } : n), s;
	}
	return a;
}
//#endregion
//#region node_modules/@griffel/react/src/utils/canUseDOM.js
function Ln() {
	return typeof window < "u" && !!(window.document && window.document.createElement);
}
//#endregion
//#region node_modules/@griffel/react/src/useInsertionEffect.js
var P = /* @__PURE__ */ l(p(), 1), Rn = P.useInsertionEffect ? P.useInsertionEffect : void 0, zn = () => {
	let e = {};
	return function(t, n) {
		Rn && Ln() ? Rn(() => {
			t.insertCSSRules(n);
		}, [t, n]) : e[t.id] === void 0 && (t.insertCSSRules(n), e[t.id] = !0);
	};
}, Bn = /* @__PURE__ */ s(((e) => {
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
})), F = /* @__PURE__ */ l((/* @__PURE__ */ s(((e, t) => {
	t.exports = Bn();
})))(), 1), Vn = /*#__PURE__*/ (0, P.createContext)(/*#__PURE__*/ pe());
function Hn() {
	return (0, P.useContext)(Vn);
}
//#endregion
//#region node_modules/@griffel/react/src/TextDirectionContext.js
var Un = /*#__PURE__*/ (0, P.createContext)("ltr"), Wn = ({ children: e, dir: t }) => (0, F.jsx)(Un.Provider, {
	value: t,
	children: e
});
function Gn() {
	return (0, P.useContext)(Un);
}
//#endregion
//#region node_modules/@griffel/react/src/makeStyles.js
function Kn(e) {
	let t = Pn(e, zn);
	return function() {
		let e = Gn(), n = Hn();
		return t({
			dir: e,
			renderer: n
		});
	};
}
//#endregion
//#region node_modules/@griffel/react/src/__styles.js
function I(e, t) {
	let n = Fn(e, t, zn);
	return function() {
		let e = Gn(), t = Hn();
		return n({
			dir: e,
			renderer: t
		});
	};
}
//#endregion
//#region node_modules/@griffel/react/src/__resetStyles.js
function qn(e, t, n) {
	let r = In(e, t, n, zn);
	return function() {
		let e = Gn(), t = Hn();
		return r({
			dir: e,
			renderer: t
		});
	};
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/createCSSRuleFromTheme.js
var Jn = {
	"<": "\\3C ",
	">": "\\3E "
};
function Yn(e) {
	return e.replace(/[<>]/g, (e) => Jn[e]);
}
function Xn(e, t) {
	let n = Yn(e);
	return t ? `${n} { ${Yn(Object.keys(t).reduce((e, n) => `${e}--${n}: ${t[n]}; `, ""))} }` : `${n} {}`;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/constants.js
var Zn = Symbol.for("fui.slotRenderFunction"), Qn = Symbol.for("fui.slotElementType"), $n = Symbol.for("fui.slotClassNameProp");
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/slot.js
function er(e, t) {
	let { defaultProps: n, elementType: r } = t, i = nr(e), a = {
		...n,
		...i,
		[Qn]: r,
		[$n]: i?.className || n?.className
	};
	return i && typeof i.children == "function" && (a[Zn] = i.children, a.children = n?.children), a;
}
function tr(e, t) {
	if (!(e === null || e === void 0 && !t.renderByDefault)) return er(e, t);
}
function nr(e) {
	return typeof e == "string" || typeof e == "number" || rr(e) || P.isValidElement(e) ? { children: e } : e;
}
var rr = (e) => typeof e == "object" && !!e && Symbol.iterator in e;
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/isResolvedShorthand.js
function ir(e) {
	return typeof e == "object" && !!e && !Array.isArray(e) && !P.isValidElement(e);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/isSlot.js
function ar(e) {
	return !!e?.hasOwnProperty(Qn);
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
//#region node_modules/@fluentui/react-utilities/lib/utils/omit.js
function Lr(e, t) {
	let n = {};
	for (let r in e) t.indexOf(r) === -1 && e.hasOwnProperty(r) && (n[r] = e[r]);
	return n;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useBrowserTimer.js
function Rr(e, t) {
	let n = P.useRef(void 0), r = P.useCallback((r, i) => (n.current !== void 0 && t(n.current), n.current = e(r, i), n.current), [t, e]), i = P.useCallback(() => {
		n.current !== void 0 && (t(n.current), n.current = void 0);
	}, [t]);
	return P.useEffect(() => i, [i]), [r, i];
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/ThemeContext/ThemeContext.js
var zr = P.createContext(void 0), Br = zr.Provider, Vr = P.createContext(void 0), Hr = "", Ur = Vr.Provider;
function Wr() {
	return P.useContext(Vr) ?? Hr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/TooltipVisibilityContext/TooltipContext.js
var Gr = P.createContext(void 0), Kr = {}, qr = Gr.Provider;
function Jr() {
	return P.useContext(Gr) ?? Kr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/ProviderContext/ProviderContext.js
var Yr = P.createContext(void 0), Xr = {
	targetDocument: typeof document == "object" ? document : void 0,
	dir: "ltr"
}, Zr = Yr.Provider;
function Qr() {
	return P.useContext(Yr) ?? Xr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/OverridesContext/OverridesContext.js
var $r = P.createContext(void 0), ei = $r.Provider;
function ti() {
	return P.useContext($r) ?? {};
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/CustomStyleHooksContext/CustomStyleHooksContext.js
var ni = P.createContext(void 0), ri = () => {}, ii = ni.Provider, ai = (e) => P.useContext(ni)?.[e] ?? ri, oi = P.createContext(void 0);
oi.Provider;
function si() {
	return P.useContext(oi);
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/AnnounceContext/AnnounceContext.js
var ci = P.createContext(void 0);
ci.Provider;
function li() {
	return P.useContext(ci) ?? { announce: () => void 0 };
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useAnimationFrame.js
var ui = (e) => (e(0), 0), di = (e) => e;
function fi() {
	let { targetDocument: e } = Qr(), t = e?.defaultView;
	return Rr(t ? t.requestAnimationFrame : ui, t ? t.cancelAnimationFrame : di);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useControllableState.js
function pi(e) {
	return typeof e == "function";
}
var mi = (e) => {
	"use no memo";
	let [t, n] = P.useState(() => e.defaultState === void 0 ? e.initialState : hi(e.defaultState) ? e.defaultState() : e.defaultState), r = P.useRef(e.state);
	P.useEffect(() => {
		r.current = e.state;
	}, [e.state]);
	let i = P.useCallback((e) => {
		pi(e) && e(r.current);
	}, []);
	return gi(e.state) ? [e.state, i] : [t, n];
};
function hi(e) {
	return typeof e == "function";
}
var gi = (e) => {
	let [t] = P.useState(() => e !== void 0);
	return t;
};
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/ssr/canUseDOM.js
function _i() {
	return typeof window < "u" && !!(window.document && window.document.createElement);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/ssr/SSRContext.js
var vi = { current: 0 }, yi = /*#__PURE__*/ P.createContext(void 0);
function bi() {
	return P.useContext(yi) ?? vi;
}
function xi() {
	let e = bi() !== vi, [t, n] = P.useState(e);
	return _i() && e && P.useLayoutEffect(() => {
		n(!1);
	}, []), t;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useIsomorphicLayoutEffect.js
var Si = _i() ? P.useLayoutEffect : P.useEffect, L = (e) => {
	let t = P.useRef(() => {
		throw Error("Cannot call an event handler while rendering");
	});
	return Si(() => {
		t.current = e;
	}, [e]), P.useCallback((...e) => {
		let n = t.current;
		return n(...e);
	}, [t]);
};
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useFirstMount.js
function Ci() {
	let e = P.useRef(!0);
	return P.useEffect(() => {
		e.current &&= !1;
	}, []), e.current;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useForceUpdate.js
function wi() {
	return P.useReducer((e) => e + 1, 0)[1];
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useId.js
var Ti = P.createContext(void 0);
Ti.Provider;
function Ei() {
	return P.useContext(Ti) || "";
}
function Di(e = "fui-", t) {
	let n = bi(), r = Ei(), i = P.useId;
	if (i) {
		let n = i(), a = P.useMemo(() => n.replace(/:/g, ""), [n]);
		return t || `${r}${e}${a}`;
	}
	return P.useMemo(() => t || `${r}${e}${++n.current}`, [
		r,
		e,
		t,
		n
	]);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useMergedRefs.js
function Oi(...e) {
	let t = P.useCallback((n) => {
		t.current = n;
		for (let t of e) typeof t == "function" ? t(n) : t && (t.current = n);
	}, [...e]);
	return t;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useOnClickOutside.js
var ki = (e, t) => !!e?.contains(t), Ai = (e) => {
	let { targetDocument: t } = Qr(), n = t?.defaultView, { refs: r, callback: i, element: a, disabled: o, disabledFocusOnIframe: s, contains: c = ki } = e, l = P.useRef(void 0);
	Ni({
		element: a,
		disabled: s || o,
		callback: i,
		refs: r,
		contains: c
	});
	let u = P.useRef(!1), d = L((e) => {
		if (u.current) {
			u.current = !1;
			return;
		}
		let t = e.composedPath()[0];
		r.every((e) => !c(e.current || null, t)) && !o && i(e);
	}), f = L((e) => {
		u.current = r.some((t) => c(t.current || null, e.target));
	});
	P.useEffect(() => {
		if (o) return;
		let e = ji(n), t = (t) => {
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
}, ji = (e) => {
	if (e) return typeof e.window == "object" && e.window === e ? e.event : e.ownerDocument?.defaultView?.event ?? void 0;
}, Mi = "fuiframefocus", Ni = (e) => {
	let { disabled: t, element: n, callback: r, contains: i = ki, pollDuration: a = 100, refs: o } = e, s = P.useRef(void 0), c = L((e) => {
		o.every((t) => !i(t.current || null, e.target)) && !t && r(e);
	});
	P.useEffect(() => {
		if (!t) return n?.addEventListener(Mi, c, !0), () => {
			n?.removeEventListener(Mi, c, !0);
		};
	}, [
		n,
		t,
		c
	]), P.useEffect(() => {
		if (!t) return s.current = n?.defaultView?.setInterval(() => {
			let e = n?.activeElement;
			if (e?.tagName === "IFRAME" || e?.tagName === "WEBVIEW") {
				let t = new CustomEvent(Mi, { bubbles: !0 });
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
}, Pi = (e) => {
	let { refs: t, callback: n, element: r, disabled: i, contains: a } = e, o = L((e) => {
		let r = a || ((e, t) => !!e?.contains(t)), o = e.composedPath()[0];
		t.every((e) => !r(e.current || null, o)) && !i && n(e);
	});
	P.useEffect(() => {
		if (!i) return r?.addEventListener("wheel", o), r?.addEventListener("touchmove", o), () => {
			r?.removeEventListener("wheel", o), r?.removeEventListener("touchmove", o);
		};
	}, [
		o,
		r,
		i
	]);
}, Fi = (e) => -1, Ii = (e) => void 0;
function Li() {
	let { targetDocument: e } = Qr(), t = e?.defaultView;
	return Rr(t ? t.setTimeout : Fi, t ? t.clearTimeout : Ii);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/getReactElementRef.js
var Ri = !0;
function zi(e) {
	if (e) return Ri ? e.props.ref : e.ref;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/mergeCallbacks.js
function Bi(e, t) {
	return (...n) => {
		e?.(...n), t?.(...n);
	};
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/isHTMLElement.js
function Vi(e, t) {
	let n = e;
	return !!(n != null && n.ownerDocument?.defaultView && n instanceof n.ownerDocument.defaultView[t?.constructorName ?? "HTMLElement"]);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/isFluentTrigger.js
function Hi(e) {
	return !!e.type.isFluentTriggerComponent;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/applyTriggerPropsToChildren.js
function Ui(e, t) {
	return typeof e == "function" ? e(t) : e ? Wi(e, t) : e || null;
}
function Wi(e, t) {
	if (!P.isValidElement(e) || e.type === P.Fragment) throw Error("A trigger element must be a single element for this component. Please ensure that you're not using React Fragments.");
	if (Hi(e)) {
		let n = Wi(e.props.children, t);
		return P.cloneElement(e, void 0, n);
	}
	return P.cloneElement(e, t);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/getTriggerChild.js
function Gi(e) {
	return P.isValidElement(e) ? Hi(e) ? Gi(e.props.children) : e : null;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/isVirtualElement.js
function Ki(e) {
	return e && !!e._virtual;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/getParent.js
function qi(e) {
	return Ki(e) && e._virtual.parent || null;
}
function Ji(e, t = {}) {
	if (!e) return null;
	if (!t.skipVirtual) {
		let t = qi(e);
		if (t) return t;
	}
	let n = e.parentNode;
	return n && n.nodeType === 11 ? n.host : n;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/elementContains.js
function Yi(e, t) {
	if (!e || !t) return !1;
	if (e === t) return !0;
	{
		let n = /* @__PURE__ */ new WeakSet();
		for (; t;) {
			let r = Ji(t, { skipVirtual: n.has(t) });
			if (n.add(t), r === e) return !0;
			t = r;
		}
	}
	return !1;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/setVirtualParent.js
function Xi(e, t) {
	e && Object.assign(e, { _virtual: { parent: t } });
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/createCompatSlotComponent.js
function Zi(e, t) {
	return {
		...t,
		[Qn]: e
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/jsx/createJSX.js
function Qi(e, t) {
	return function(n, r, i, a, o) {
		return ar(r) ? t(Zi(n, r), null, i, a, o) : ar(n) ? t(n, r, i, a, o) : e(n, r, i, a, o);
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/getMetadataFromSlotComponent.js
function $i(e) {
	let { as: t, [$n]: n, [Qn]: r, [Zn]: i, ...a } = e, o = a, s = typeof r == "string" ? t ?? r : r;
	return typeof s != "string" && t && (o.as = t), {
		elementType: s,
		props: o,
		renderFunction: i
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/Runtime.js
var ea = F, ta = (e, t, n) => {
	let { elementType: r, renderFunction: i, props: a } = $i(e), o = {
		...a,
		...t
	};
	return i ? ea.jsx(P.Fragment, { children: i(r, o) }, n) : ea.jsx(r, o, n);
}, na = (e, t, n) => {
	let { elementType: r, renderFunction: i, props: a } = $i(e), o = {
		...a,
		...t
	};
	return i ? ea.jsx(P.Fragment, { children: i(r, {
		...o,
		children: ea.jsxs(P.Fragment, { children: o.children }, void 0)
	}) }, n) : ea.jsxs(r, o, n);
}, R = Qi(ea.jsx, ta), ra = Qi(ea.jsxs, na), ia = P.createContext(void 0), aa = {}, z = ia.Provider, oa = () => P.useContext(ia) ?? aa, sa = (e, t) => /*#__PURE__*/ R(Zr, {
	value: t.provider,
	children: /*#__PURE__*/ R(Br, {
		value: t.theme,
		children: /*#__PURE__*/ R(Ur, {
			value: t.themeClassName,
			children: /*#__PURE__*/ R(ii, {
				value: t.customStyleHooks_unstable,
				children: /*#__PURE__*/ R(qr, {
					value: t.tooltip,
					children: /*#__PURE__*/ R(Wn, {
						dir: t.textDirection,
						children: /*#__PURE__*/ R(z, {
							value: t.iconDirection,
							children: /*#__PURE__*/ R(ei, {
								value: t.overrides_unstable,
								children: /*#__PURE__*/ ra(e.root, { children: [_i() ? null : /*#__PURE__*/ R("style", {
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
}), ca = "data-tabster", la = "data-tabster-dummy", ua = `:is(${[
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
].join(", ")}):not(:disabled)`, da = {
	EscapeGroupper: 1,
	Restorer: 2,
	Deloser: 3
}, fa = {
	Invisible: 0,
	PartiallyVisible: 1,
	Visible: 2
}, pa = {
	Source: 0,
	Target: 1
}, ma = {
	Both: 0,
	Vertical: 1,
	Horizontal: 2,
	Grid: 3,
	GridLinear: 4
}, ha = {
	ArrowUp: 1,
	ArrowDown: 2,
	ArrowLeft: 3,
	ArrowRight: 4,
	PageUp: 5,
	PageDown: 6,
	Home: 7,
	End: 8
}, ga = {
	Auto: 0,
	Inside: 1,
	Outside: 2
};
//#endregion
//#region node_modules/tabster/dist/esm/Instance.js
function _a(e, t) {
	return e.storageEntry(t)?.tabster;
}
function va(e, t, n) {
	let r = n || e._noop ? void 0 : t.getAttribute(ca), i = e.storageEntry(t), a;
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
var ya = (e, t, n) => {
	e.addEventListener(t, n, !0);
}, ba = (e, t, n) => {
	e.removeEventListener(t, n, !0);
}, xa = "keyborg:focusin", Sa = "keyborg:focusout", Ca = 0, wa = 1, Ta = 2, Ea = 3;
function Da(e) {
	let t = e.focus;
	t.__keyborgNativeFocus ? t.__keyborgNativeFocus.call(e) : e.focus();
}
function Oa(e) {
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
		let n = new CustomEvent(Sa, {
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
			(!t || !r.has(t)) && (a.delete(e), t && (ba(t, "focusin", s), ba(t, "focusout", o)));
		}
		c(t, e.relatedTarget || void 0);
	}, c = (e, t, n) => {
		let r = e.shadowRoot;
		if (r) {
			for (let e of a) if (e.deref() === r) return;
			ya(r, "focusin", s), ya(r, "focusout", o), a.add(new WeakRef(r));
			return;
		}
		let i = {
			relatedTarget: t,
			originalEvent: n
		}, c = new CustomEvent(xa, {
			cancelable: !0,
			bubbles: !0,
			composed: !0,
			detail: i
		});
		i.isFocusedProgrammatically = e === l[Ea]?.deref(), l[Ea] = void 0, e.dispatchEvent(c);
	}, l = [
		s,
		o,
		a
	];
	t.__keyborgData = l, ya(n, "focusin", s), ya(n, "focusout", o);
	function u() {
		let e = t.__keyborgData;
		return e && (e[Ea] = new WeakRef(this)), d.apply(this, arguments);
	}
	function d() {
		let e = i?.get ? i.get.call(this) : i?.value;
		if (typeof e != "function") throw TypeError("HTMLElement.prototype.focus is not callable");
		return e.apply(this, arguments);
	}
	let f = n.activeElement;
	for (; f && f.shadowRoot;) c(f), f = f.shadowRoot.activeElement;
}
function ka(e) {
	let t = e, n = t.HTMLElement.prototype, r = Object.getOwnPropertyDescriptor(n, "focus")?.value, i = r?.__keyborgFocusDescriptor, a = t.__keyborgData;
	if (a) {
		let e = t.document;
		ba(e, "focusin", a[Ca]), ba(e, "focusout", a[wa]);
		for (let e of a[Ta]) {
			let t = e.deref();
			t && (ba(t, "focusin", a[Ca]), ba(t, "focusout", a[wa]));
		}
		a[Ta].clear(), delete t.__keyborgData;
	}
	r?.__keyborgNativeFocus && (i ? Object.defineProperty(n, "focus", i) : delete n.focus);
}
var Aa = 0;
function ja(e) {
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
	return ya(d, xa, s), ya(d, "mousedown", l), ya(e, "keydown", u), ya(d, "touchstart", c), ya(d, "touchend", c), ya(d, "touchcancel", c), Oa(e), {
		dispose: () => {
			if (!t) return;
			r &&= (t.clearTimeout(r), void 0), ka(t);
			let e = t.document;
			ba(e, xa, s), ba(e, "mousedown", l), ba(t, "keydown", u), ba(e, "touchstart", c), ba(e, "touchend", c), ba(e, "touchcancel", c), t = void 0;
		},
		get isNavigatingWithKeyboard() {
			return n;
		},
		set isNavigatingWithKeyboard(e) {
			a(e);
		}
	};
}
function Ma(e) {
	let t = e, n = "k" + ++Aa, r = t, i, a = [], o = t.__keyborg;
	i = o ? o.core : ja(t);
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
function Na(e) {
	e.dispose();
}
//#endregion
//#region node_modules/tabster/dist/esm/Events.js
var Pa = "tabster:focusin", Fa = "tabster:focusout", Ia = "tabster:movefocus", La = "tabster:mover:state", Ra = "tabster:mover:movefocus", za = "tabster:mover:memorized-element", Ba = "tabster:restorer:restore-focus", Va = "tabster:root:focus", Ha = "tabster:root:blur", Ua = typeof CustomEvent < "u" ? CustomEvent : function() {}, Wa = class extends Ua {
	constructor(e, t) {
		super(e, {
			bubbles: !0,
			cancelable: !0,
			composed: !0,
			detail: t
		}), this.details = t;
	}
}, Ga = class extends Wa {
	constructor(e) {
		super(Pa, e);
	}
}, Ka = class extends Wa {
	constructor(e) {
		super(Fa, e);
	}
}, qa = class extends Wa {
	constructor(e) {
		super(Ia, e);
	}
}, Ja = class extends Wa {
	constructor(e) {
		super(La, e);
	}
}, Ya = class extends Wa {
	constructor() {
		super(Ba);
	}
}, Xa = class extends Wa {
	constructor(e) {
		super(Va, e);
	}
}, Za = class extends Wa {
	constructor(e) {
		super(Ha, e);
	}
}, B = {
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
function Qa(e) {
	for (let t of Object.keys(e)) B[t] = e[t];
}
//#endregion
//#region node_modules/tabster/dist/esm/Utils.js
var $a = 0;
function eo(e) {
	let t = e();
	return t.__tabsterInstanceContext ??= {
		elementByUId: {},
		containerBoundingRectCache: {},
		lastContainerBoundingRectCacheId: 0
	};
}
function to(e) {
	let t = e, n = t.__tabsterInstanceContext;
	n && (n.elementByUId = {}, n.containerBoundingRectCache = {}, n.containerBoundingRectCacheTimer && e.clearTimeout(n.containerBoundingRectCacheTimer), delete t.__tabsterInstanceContext);
}
function no(e) {
	return !!e.querySelector(ua);
}
var ro = class {
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
function io(e, t, n) {
	if (t.nodeType === Node.ELEMENT_NODE) return B.createTreeWalker(e, t, NodeFilter.SHOW_ELEMENT, { acceptNode: n });
}
function ao(e, t) {
	let n = t.__tabsterCacheId, r = eo(e), i = n ? r.containerBoundingRectCache[n] : void 0;
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
function oo(e, t, n) {
	let r = co(t);
	if (!r) return !1;
	let i = ao(e, r), a = t.getBoundingClientRect(), o = a.height * (1 - n), s = Math.max(0, i.top - a.top) + Math.max(0, a.bottom - i.bottom);
	return s === 0 || s <= o;
}
function so(e, t, n) {
	let r = co(t);
	if (r) {
		let i = ao(e, r), a = t.getBoundingClientRect();
		n ? r.scrollTop += a.top - i.top : r.scrollTop += a.bottom - i.bottom;
	}
}
function co(e) {
	let t = e.ownerDocument;
	if (t) {
		for (let t = B.getParentElement(e); t; t = B.getParentElement(t)) if (t.scrollWidth > t.clientWidth || t.scrollHeight > t.clientHeight) return t;
		return t.documentElement;
	}
	return null;
}
function lo(e) {
	e.__shouldIgnoreFocus = !0;
}
function uo(e) {
	return !!e.__shouldIgnoreFocus;
}
function fo(e) {
	let t = /* @__PURE__ */ new Uint32Array(4);
	return e.crypto.getRandomValues(t), Array.from(t, (e) => e.toString(36)).join("") + "|" + (++$a).toString(36) + "|" + Date.now().toString(36);
}
function po(e, t) {
	let n = eo(e), r = t.__tabsterElementUID ??= fo(e());
	return !n.elementByUId[r] && ho(t.ownerDocument, t) && (n.elementByUId[r] = new ro(t)), r;
}
function mo(e, t) {
	let n = eo(e).elementByUId;
	for (let e of Object.keys(n)) {
		let r = n[e]?.get();
		t && r && !B.nodeContains(t, r) || delete n[e];
	}
}
function ho(e, t) {
	return B.nodeContains(e?.body, t);
}
function go(e, t) {
	return typeof e.matches == "function" && e.matches(t);
}
var _o = 0, vo = class {
	constructor(e, t, n) {
		this._tabster = e, this._element = new ro(t), this._props = { ...n }, this.id = "i" + ++_o;
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
function yo(e) {
	let t = null;
	for (let n = B.getLastElementChild(e); n; n = B.getLastElementChild(n)) t = n;
	return t || void 0;
}
function bo(e) {
	let t = e.ownerDocument, n = t.defaultView?.getComputedStyle(e);
	return e.offsetParent === null && t.body !== e && n?.position !== "fixed" || n?.visibility === "hidden" || n?.position === "fixed" && (n.display === "none" || e.parentElement?.offsetParent === null && t.body !== e.parentElement);
}
function xo(e) {
	return e.tagName === "INPUT" && !!e.name && e.type === "radio";
}
function So(e) {
	if (!xo(e)) return;
	let t = e.name, n = [], r;
	for (let i of B.getElementsByName(e, t)) if (xo(i)) {
		let e = i;
		n.push(e), e.checked && (r = e);
	}
	return {
		name: t,
		buttons: new Set(n),
		checked: r
	};
}
function Co(e, t, n, r) {
	e?.addEventListener(t, n, r);
}
function wo(e, t, n, r) {
	e?.removeEventListener(t, n, r);
}
function To(e, t) {
	return !!e && e.dispatchEvent(t);
}
//#endregion
//#region node_modules/tabster/dist/esm/DummyInput.js
var Eo = 100, Do = class {
	constructor(e, t, n, r, i) {
		this._focusIn = (e) => {
			if (this._fixedTarget) {
				let e = this._fixedTarget.get();
				e && Da(e);
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
		o.tabIndex = 0, o.setAttribute("role", "none"), o.setAttribute(la, ""), o.setAttribute("aria-hidden", "true");
		let s = o.style;
		s.position = "fixed", s.width = s.height = "1px", s.opacity = "0.001", s.zIndex = "-1", s.setProperty("content-visibility", "hidden"), lo(o), this.input = o, this.isFirst = n.isFirst, this.isOutside = t, this._isPhantom = n.isPhantom ?? !1, this._fixedTarget = i, Co(o, "focusin", this._focusIn), Co(o, "focusout", this._focusOut), o.__tabsterDummyContainer = r, this._isPhantom && (this._disposeTimer = a.setTimeout(() => {
			delete this._disposeTimer, this.dispose();
		}, 0), this._clearDisposeTimeout = () => {
			this._disposeTimer && (a.clearTimeout(this._disposeTimer), delete this._disposeTimer), delete this._clearDisposeTimeout;
		});
	}
	dispose() {
		this._clearDisposeTimeout && this._clearDisposeTimeout();
		let e = this.input;
		e && (delete this._fixedTarget, delete this.onFocusIn, delete this.onFocusOut, delete this.input, wo(e, "focusin", this._focusIn), wo(e, "focusout", this._focusOut), delete e.__tabsterDummyContainer, B.getParentNode(e)?.removeChild(e));
	}
	setTopLeft(e, t) {
		let n = this.input?.style;
		n && (n.top = `${e}px`, n.left = `${t}px`);
	}
	_isBackward(e, t, n) {
		return e && !n ? !this.isFirst : !!(n && t.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING);
	}
}, Oo = {
	Root: 1,
	Modalizer: 2,
	Mover: 3,
	Groupper: 4
}, ko = class {
	constructor(e, t, n, r, i, a) {
		this._element = t, this._instance = new jo(e, t, this, n, r, i, a);
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
		let a = new Do(e.getWindow, !0, {
			isPhantom: !0,
			isFirst: !0
		}).input;
		if (a) {
			let o, s;
			if (t.tagName === "BODY") o = t, s = n && r || !n && !r ? B.getFirstElementChild(t) : null;
			else {
				n && (!r || r && !e.focusable.isFocusable(t, !1, !0, !0)) ? (o = t, s = r ? t.firstElementChild : null) : (o = B.getParentElement(t), s = n && r || !n && !r ? t : B.getNextElementSibling(t));
				let i, a;
				do
					i = n && r || !n && !r ? B.getPreviousElementSibling(s) : s, a = Mo(i), a === t ? s = n && r || !n && !r ? i : B.getNextElementSibling(i) : a = null;
				while (a);
			}
			o && To(o, new qa({
				by: "root",
				owner: o,
				next: null,
				relatedEvent: i
			})) && (B.insertBefore(o, a, s), Da(a));
		}
	}
	static addPhantomDummyWithTarget(e, t, n, r) {
		let i = new Do(e.getWindow, !0, {
			isPhantom: !0,
			isFirst: !0
		}, void 0, new ro(r)).input;
		if (i) {
			let e, r;
			no(t) && !n ? (e = t, r = B.getFirstElementChild(t)) : (e = B.getParentElement(t), r = n ? t : B.getNextElementSibling(t)), e && B.insertBefore(e, i, r);
		}
	}
}, Ao = class {
	constructor(e) {
		this._updateQueue = /* @__PURE__ */ new Set(), this._lastUpdateQueueTime = 0, this._changedParents = /* @__PURE__ */ new WeakSet(), this._dummyElements = [], this._dummyCallbacks = /* @__PURE__ */ new WeakMap(), this._domChanged = (e) => {
			this._changedParents.has(e) || (this._changedParents.add(e), !this._updateDummyInputsTimer && (this._updateDummyInputsTimer = this._win?.().setTimeout(() => {
				delete this._updateDummyInputsTimer;
				for (let e of this._dummyElements) {
					let t = e.get();
					if (t) {
						let e = this._dummyCallbacks.get(t);
						if (e) {
							let n = B.getParentNode(t);
							(!n || this._changedParents.has(n)) && e();
						}
					}
				}
				this._changedParents = /* @__PURE__ */ new WeakSet();
			}, Eo)));
		}, this._win = e;
	}
	add(e, t) {
		!this._dummyCallbacks.has(e) && this._win && (this._dummyElements.push(new ro(e)), this._dummyCallbacks.set(e, t), this.domChanged = this._domChanged);
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
			if (delete this._updateTimer, this._lastUpdateQueueTime + Eo <= Date.now()) {
				let e = /* @__PURE__ */ new Map(), t = [];
				for (let n of this._updateQueue) t.push(n(e));
				this._updateQueue.clear();
				for (let e of t) e();
				e.clear();
			} else this._scheduledUpdatePositions();
		}, Eo);
	}
}, jo = class {
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
					e ? (r.tabIndex = 0, t = r) : (i.tabIndex = 0, t = i), t && Da(t);
				}
			}
		}, this.moveOutWithDefaultAction = (e, t) => {
			let n = this._firstDummy, r = this._lastDummy;
			if (n && r) {
				this._ensurePosition();
				let i = n.input, a = r.input, o = this._element?.get();
				if (i && a && o) {
					let s;
					e ? !n.isOutside && this._tabster.focusable.isFocusable(o, !0, !0, !0) ? s = o : (n.useDefaultAction = !0, i.tabIndex = 0, s = i) : (r.useDefaultAction = !0, a.tabIndex = 0, s = a), s && To(o, new qa({
						by: "root",
						owner: o,
						next: null,
						relatedEvent: t
					})) && Da(s);
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
			for (let s = t; s && s.nodeType === Node.ELEMENT_NODE; s = B.getParentElement(s)) {
				let t = e.get(s);
				if (t === void 0) {
					let n = o.getComputedStyle(s).transform;
					n && n !== "none" && (t = {
						scrollTop: s.scrollTop,
						scrollLeft: s.scrollLeft
					}), e.set(s, t || null);
				}
				t && (r.add(s), n.has(s) || Co(s, "scroll", this._addTransformOffsets), i += t.scrollTop, a += t.scrollLeft);
			}
			for (let e of n) r.has(e) || wo(e, "scroll", this._addTransformOffsets);
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
		this._isOutside = l ? l === ga.Outside : (a || u === "UL" || u === "OL" || u === "TABLE") && u !== "LI" && u !== "TD" && u !== "TH", this._firstDummy = new Do(this._getWindow, this._isOutside, { isFirst: !0 }, t), this._lastDummy = new Do(this._getWindow, this._isOutside, { isFirst: !1 }, t);
		let d = this._firstDummy.input;
		d && e._dummyObserver.add(d, this._addDummyInputs), this._firstDummy.onFocusIn = this._onFocusIn, this._firstDummy.onFocusOut = this._onFocusOut, this._lastDummy.onFocusIn = this._onFocusIn, this._lastDummy.onFocusOut = this._onFocusOut, this._element = t, this._addDummyInputs();
	}
	dispose(e, t) {
		if ((this._wrappers = this._wrappers.filter((n) => n.manager !== e && !t)).length === 0) {
			delete (this._element?.get()).__tabsterDummy;
			for (let e of this._transformElements) wo(e, "scroll", this._addTransformOffsets);
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
				let r = B.getParentNode(e);
				if (r) {
					let i = B.getNextSibling(e);
					i !== n && B.insertBefore(r, n, i), B.getPreviousElementSibling(e) !== t && B.insertBefore(r, t, e);
				}
			} else {
				B.getLastElementChild(e) !== n && B.appendChild(e, n);
				let r = B.getFirstElementChild(e);
				r && r !== t && r.parentNode && B.insertBefore(r.parentNode, t, r);
			}
		}
	}
};
function Mo(e) {
	return e?.__tabsterDummyContainer?.get() || null;
}
//#endregion
//#region node_modules/tabster/dist/esm/AttributeHelpers.js
function No(e, t) {
	let n = JSON.stringify(e);
	return t === !0 ? n : { [ca]: n };
}
function Po(e, t) {
	for (let n of Object.keys(t)) {
		let r = t[n];
		r ? e[n] = r : delete e[n];
	}
}
function Fo(e, t, n) {
	let r;
	if (n) {
		let t = e.getAttribute(ca);
		if (t) try {
			r = JSON.parse(t);
		} catch {}
	}
	r ||= {}, Po(r, t), Object.keys(r).length > 0 ? e.setAttribute(ca, No(r, !0)) : e.removeAttribute(ca);
}
//#endregion
//#region node_modules/tabster/dist/esm/Root.js
var Io = class extends ko {
	constructor(e, t, n, r) {
		super(e, t, Oo.Root, r, void 0, !0), this._onDummyInputFocus = (e) => {
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
						Da(n);
						return;
					}
				}
				e.input?.blur();
			}
		}, this._setHandlers(this._onDummyInputFocus), this._tabster = e, this._setFocused = n;
	}
}, Lo = class extends vo {
	constructor(e, t, n, r, i) {
		super(e, t, r), this._isFocused = !1, this._setFocused = (e) => {
			if (this._setFocusedTimer && (this._tabster.getWindow().clearTimeout(this._setFocusedTimer), delete this._setFocusedTimer), this._isFocused === e) return;
			let t = this._element.get();
			t && (e ? (this._isFocused = !0, this._dummyManager?.setTabbable(!1), To(t, new Xa({ element: t }))) : this._setFocusedTimer = this._tabster.getWindow().setTimeout(() => {
				delete this._setFocusedTimer, this._isFocused = !1, this._dummyManager?.setTabbable(!0), To(t, new Za({ element: t }));
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
		this.uid = po(a, t), this._sys = i, (e.controlTab || e.rootDummyInputs) && this.addDummyInputs();
		let o = a().document;
		Co(o, xa, this._onFocusIn), Co(o, Sa, this._onFocusOut), this._add();
	}
	addDummyInputs() {
		this._dummyManager ||= new Io(this._tabster, this._element, this._setFocused, this._sys);
	}
	dispose() {
		this._onDispose(this);
		let e = this._tabster.getWindow(), t = e.document;
		wo(t, xa, this._onFocusIn), wo(t, Sa, this._onFocusOut), this._setFocusedTimer && (e.clearTimeout(this._setFocusedTimer), delete this._setFocusedTimer), this._dummyManager?.dispose(), this._remove();
	}
	moveOutWithDefaultAction(e, t) {
		let n = this._dummyManager;
		if (n) n.moveOutWithDefaultAction(e, t);
		else {
			let n = this.getElement();
			n && Io.moveWithPhantomDummy(this._tabster, n, !0, e, t);
		}
	}
	_add() {}
	_remove() {}
}, Ro = class {
	constructor(e, t) {
		this._autoRootWaiting = !1, this._roots = {}, this._forceDummy = !1, this.rootById = {}, this._autoRootCreate = () => {
			let e = this._win().document, t = e.body;
			if (t) {
				this._autoRootUnwait(e);
				let n = this._autoRoot;
				if (n) return Fo(t, { root: n }, !0), va(this._tabster, t), _a(this._tabster, t)?.root;
			} else this._autoRootWaiting || (this._autoRootWaiting = !0, Co(e, "readystatechange", this._autoRootCreate));
		}, this._onRootDispose = (e) => {
			delete this._roots[e.id];
		}, this._tabster = e, this._win = e.getWindow, this._autoRoot = t, e.queueInit(() => {
			this._autoRoot && this._autoRootCreate();
		});
	}
	_autoRootUnwait(e) {
		wo(e, "readystatechange", this._autoRootCreate), this._autoRootWaiting = !1;
	}
	dispose() {
		let e = this._win();
		this._autoRootUnwait(e.document), delete this._autoRoot, Object.keys(this._roots).forEach((e) => {
			this._roots[e] && (this._roots[e].dispose(), delete this._roots[e]);
		}), this.rootById = {};
	}
	createRoot(e, t, n) {
		let r = new Lo(this._tabster, e, this._onRootDispose, t, n);
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
			let n = _a(e, h);
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
			let t = _a(e, r)?.root;
			if (t) return t;
		}
	}
	onRoot(e, t) {
		t ? delete this.rootById[e.uid] : this.rootById[e.uid] = e;
	}
}, zo = class {
	constructor(e) {
		this._tabster = e;
	}
	dispose() {}
	getProps(e) {
		let t = _a(this._tabster, e);
		return t && t.focusable || {};
	}
	isFocusable(e, t, n, r) {
		return go(e, ua) && (t || e.tabIndex !== -1) ? (n || this.isVisible(e)) && (r || this.isAccessible(e)) : !1;
	}
	isVisible(e) {
		if (!e.ownerDocument || e.nodeType !== Node.ELEMENT_NODE || bo(e)) return !1;
		let t = e.ownerDocument.body.getBoundingClientRect();
		return t.width !== 0 || t.height !== 0;
	}
	isAccessible(e) {
		for (let t = e; t; t = B.getParentElement(t)) {
			let e = _a(this._tabster, t);
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
			modalizerUserId: c === void 0 && o ? this._tabster.modalizer?.activeId : c || Ro.getTabsterContext(this._tabster, r)?.modalizer?.userId,
			from: i || r,
			isBackward: l,
			isFindAll: e,
			acceptCondition: f,
			hasCustomCondition: p,
			includeProgrammaticallyFocusable: a,
			ignoreAccessibility: s,
			cachedGrouppers: {},
			cachedRadioGroups: {}
		}, h = io(r.ownerDocument, r, (e) => this._acceptElement(e, m));
		if (!h) return null;
		let g = (t) => {
			let r = m.foundElement ?? m.foundBackward;
			return r && d.push(r), e ? r && (m.found = !1, delete m.foundElement, delete m.foundBackward, delete m.fromCtx, m.from = r, u && !u(r)) ? !1 : !!(r || t) : (r && n && (n.uncontrolled = Ro.getTabsterContext(this._tabster, r)?.uncontrolled), !(!t || r));
		};
		if (i || (n.outOfDOMOrder = !0), i && B.nodeContains(r, i)) h.currentNode = i;
		else if (l) {
			let e = yo(r);
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
		if (n && (e === n || !B.nodeContains(n, e))) return t.found = !0, t.foundElement = n, NodeFilter.FILTER_ACCEPT;
		let r = t.container;
		if (e === r) return NodeFilter.FILTER_SKIP;
		if (!B.nodeContains(r, e) || Mo(e) || B.nodeContains(t.rejectElementsFrom, e)) return NodeFilter.FILTER_REJECT;
		let i = t.currentCtx = Ro.getTabsterContext(this._tabster, e);
		if (!i) return NodeFilter.FILTER_SKIP;
		if (uo(e)) return this.isFocusable(e, void 0, !0, !0) && (t.skippedFocusable = !0), NodeFilter.FILTER_SKIP;
		if (!t.hasCustomCondition && (e.tagName === "IFRAME" || e.tagName === "WEBVIEW")) return this.isVisible(e) && i.modalizer?.userId === this._tabster.modalizer?.activeId ? (t.found = !0, t.rejectElementsFrom = t.foundElement = e, NodeFilter.FILTER_ACCEPT) : NodeFilter.FILTER_REJECT;
		if (!t.ignoreAccessibility && !this.isAccessible(e)) return this.isFocusable(e, !1, !0, !0) && (t.skippedFocusable = !0), NodeFilter.FILTER_REJECT;
		let a, o = t.fromCtx;
		o ||= t.fromCtx = Ro.getTabsterContext(this._tabster, t.from);
		let s = o?.mover, c = i.groupper, l = i.mover;
		if (a = this._tabster.modalizer?.acceptElement(e, t), a !== void 0 && (t.skippedFocusable = !0), a === void 0 && (c || l || s)) {
			let n = c?.getElement(), i = s?.getElement(), o = l?.getElement();
			if (o && B.nodeContains(i, o) && B.nodeContains(r, i) && (!n || !l || B.nodeContains(i, n)) && (l = s, o = i), n) {
				if (n === r || !B.nodeContains(r, n)) c = void 0;
				else if (!B.nodeContains(n, e)) return NodeFilter.FILTER_REJECT;
			}
			if (o) {
				if (!B.nodeContains(r, o)) l = void 0;
				else if (!B.nodeContains(o, e)) return NodeFilter.FILTER_REJECT;
			}
			c && l && (o && n && !B.nodeContains(n, o) ? l = void 0 : c = void 0), c && (a = c.acceptElement(e, t)), l && (a = l.acceptElement(e, t));
		}
		if (a === void 0 && (a = t.acceptCondition(e) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP, a === NodeFilter.FILTER_SKIP && this.isFocusable(e, !1, !0, !0) && (t.skippedFocusable = !0)), a === NodeFilter.FILTER_ACCEPT && !t.found) {
			if (!t.isFindAll && xo(e) && !e.checked) {
				let n = e.name, r = t.cachedRadioGroups[n];
				if (r || (r = So(e), r && (t.cachedRadioGroups[n] = r)), r?.checked && r.checked !== e) return NodeFilter.FILTER_SKIP;
			}
			t.isBackward ? (t.foundBackward = e, a = NodeFilter.FILTER_SKIP) : (t.found = !0, t.foundElement = e);
		}
		return a;
	}
}, Bo = {
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
}, Vo = class {
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
function Ho(e, t) {
	let n = e.getParent, r = t;
	do {
		let t = _a(e, r)?.uncontrolled;
		if (t && e.uncontrolled.isUncontrolledCompletely(r, !!t.completely)) return r;
		r = n(r);
	} while (r);
}
var V = {
	[da.Restorer]: 0,
	[da.Deloser]: 1,
	[da.EscapeGroupper]: 2
}, Uo = class e extends Vo {
	static {
		this.isTabbing = !1;
	}
	constructor(t, n) {
		super(), this._init = () => {
			let e = this._win(), t = e.document;
			Co(t, xa, this._onFocusIn, !0), Co(t, Sa, this._onFocusOut, !0), Co(e, "keydown", this._onKeyDown, !0);
			let n = B.getActiveElement(t);
			n && n !== t.body && this._setFocusedElement(n), this.subscribe(this._onChanged);
		}, this._onFocusIn = (e) => {
			let t = e.composedPath()[0];
			t && this._setFocusedElement(t, e.detail.relatedTarget, e.detail.isFocusedProgrammatically);
		}, this._onFocusOut = (e) => {
			this._setFocusedElement(void 0, e.detail?.originalEvent.relatedTarget);
		}, this._validateFocusedElement = (e) => {}, this._onKeyDown = (t) => {
			if (t.key !== Bo.Tab || t.ctrlKey) return;
			let n = this.getVal();
			if (!n || !n.ownerDocument || n.contentEditable === "true") return;
			let r = this._tabster, i = r.controlTab, a = Ro.getTabsterContext(r, n);
			if (!a || a.ignoreKeydown(t)) return;
			let o = t.shiftKey, s = e.findNextTabbable(r, a, void 0, n, void 0, o, !0), c = a.root.getElement();
			if (!c) return;
			let l = s?.element, u = Ho(r, n);
			if (l) {
				let e = s.uncontrolled;
				if (a.uncontrolled || B.nodeContains(e, n)) {
					if (!s.outOfDOMOrder && e === a.uncontrolled || u && !B.nodeContains(u, l)) return;
					ko.addPhantomDummyWithTarget(r, n, o, l);
					return;
				}
				if (e && r.focusable.isVisible(e) || l.tagName === "IFRAME" && r.focusable.isVisible(l)) {
					To(c, new qa({
						by: "root",
						owner: c,
						next: l,
						relatedEvent: t
					})) && ko.moveWithPhantomDummy(r, e ?? l, !1, o, t);
					return;
				}
				(i || s?.outOfDOMOrder) && To(c, new qa({
					by: "root",
					owner: c,
					next: l,
					relatedEvent: t
				})) && (t.preventDefault(), t.stopImmediatePropagation(), Da(l));
			} else !u && To(c, new qa({
				by: "root",
				owner: c,
				next: null,
				relatedEvent: t
			})) && a.root.moveOutWithDefaultAction(o, t);
		}, this._onChanged = (e, t) => {
			if (e) To(e, new Ga(t));
			else {
				let e = this._lastVal?.get();
				if (e) {
					let n = { ...t }, r = Ro.getTabsterContext(this._tabster, e)?.modalizer?.userId;
					r && (n.modalizerId = r), To(e, new Ka(n));
				}
			}
		}, this._tabster = t, this._win = n, t.queueInit(this._init);
	}
	dispose() {
		super.dispose();
		let t = this._win(), n = t.document;
		wo(n, xa, this._onFocusIn, !0), wo(n, Sa, this._onFocusOut, !0), wo(t, "keydown", this._onKeyDown, !0), this.unsubscribe(this._onChanged);
		let r = this._asyncFocus;
		r && (t.clearTimeout(r.timeout), delete this._asyncFocus), delete e._lastResetElement, delete this._nextVal, delete this._lastVal;
	}
	static forgetMemorized(t, n) {
		let r = e._lastResetElement, i = r && r.get();
		i && B.nodeContains(n, i) && delete e._lastResetElement, i = t._nextVal?.element?.get(), i && B.nodeContains(n, i) && delete t._nextVal, r = t._lastVal, i = r && r.get(), i && B.nodeContains(n, i) && delete t._lastVal;
	}
	getFocusedElement() {
		return this.getVal();
	}
	getLastFocusedElement() {
		let e = this._lastVal?.get();
		return (!e || e && !ho(e.ownerDocument, e)) && (this._lastVal = e = void 0), e;
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
			let n = Ro.getTabsterContext(this._tabster, r);
			n && (a = e.findNextTabbable(this._tabster, n, r, void 0, void 0, !t, i)?.element);
		}
		return a && !B.nodeContains(r, a) && (a = void 0), a || void 0;
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
			t.tabIndex = -1, t.setAttribute("aria-hidden", "true"), e._lastResetElement = new ro(t), this.focus(t, !0, !0), this._setOrRemoveAttribute(t, "tabindex", n), this._setOrRemoveAttribute(t, "aria-hidden", r);
		}
		return !0;
	}
	requestAsyncFocus(e, t, n) {
		let r = this._tabster.getWindow(), i = this._asyncFocus;
		if (i) {
			if (V[e] > V[i.source]) return;
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
			if (e._lastResetElement = void 0, n === t || uo(t)) return;
			i.isFocusedProgrammatically = r;
			let a = Ro.getTabsterContext(this._tabster, t)?.modalizer?.userId;
			a && (i.modalizerId = a);
		}
		let a = this._nextVal = {
			element: t ? new ro(t) : void 0,
			detail: i
		};
		t && t !== this._val && this._validateFocusedElement(t), this._nextVal === a && this.setVal(t, i), this._nextVal = void 0;
	}
	setVal(e, t) {
		super.setVal(e, t), e && (this._lastVal = new ro(e));
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
				let a = n !== f && B.getParentElement(n.getElement());
				if (a) {
					let c = Ro.getTabsterContext(t, i, { referenceElement: a });
					if (c) {
						let i = n.getElement(), u = o ? i : i && yo(i) || i;
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
}, Wo = class extends Vo {
	constructor(e) {
		super(), this._onChange = (e) => {
			this.setVal(e, void 0);
		}, this._keyborg = Ma(e()), this._keyborg.subscribe(this._onChange);
	}
	dispose() {
		super.dispose(), this._keyborg && (this._keyborg.unsubscribe(this._onChange), Na(this._keyborg), delete this._keyborg);
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
function Go(e, t, n, r) {
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
		a ||= eo(i).elementByUId, c(t, n);
		let r = io(e, t, (e) => c(e, n));
		if (r) for (; r.nextNode(););
	}
	function c(e, r) {
		if (!e.getAttribute) return NodeFilter.FILTER_SKIP;
		let i = e.__tabsterElementUID;
		return i && a && (r ? delete a[i] : a[i] ??= new ro(e)), (_a(t, e) || e.hasAttribute("data-tabster")) && n(t, e, r), NodeFilter.FILTER_SKIP;
	}
	let l = B.createMutationObserver(o);
	return r && s(i().document.body), l.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: [ca]
	}), () => {
		l.disconnect();
	};
}
//#endregion
//#region node_modules/tabster/dist/esm/Uncontrolled.js
var Ko = class {
	constructor(e) {
		this._isUncontrolledCompletely = e;
	}
	isUncontrolledCompletely(e, t) {
		let n = this._isUncontrolledCompletely?.(e, t);
		return n === void 0 ? t : n;
	}
}, qo = [
	"input",
	"textarea",
	"*[contenteditable]"
].join(", "), Jo = class extends ko {
	constructor(e, t, n, r) {
		super(t, e, Oo.Mover, r), this._onFocusDummyInput = (e) => {
			let t = this._element.get(), n = e.input;
			if (t && n) {
				let r = Ro.getTabsterContext(this._tabster, t), i;
				r && (i = Uo.findNextTabbable(this._tabster, r, void 0, n, void 0, !e.isFirst, !0)?.element);
				let a = this._getMemorized()?.get();
				a && this._tabster.focusable.isFocusable(a) && (i = a), i && Da(i);
			}
		}, this._tabster = t, this._getMemorized = n, this._setHandlers(this._onFocusDummyInput);
	}
}, Yo = 1, Xo = 2, Zo = 3, Qo = class extends vo {
	constructor(e, t, n, r, i) {
		super(e, t, r), this._visible = {}, this._onIntersection = (e) => {
			for (let t of e) {
				let e = t.target, n = po(this._win, e), r, i = this._fullyVisible;
				if (t.intersectionRatio >= .25 ? (r = t.intersectionRatio >= .75 ? fa.Visible : fa.PartiallyVisible, r === fa.Visible && (i = n)) : r = fa.Invisible, this._visible[n] !== r) {
					r === void 0 ? (delete this._visible[n], i === n && delete this._fullyVisible) : (this._visible[n] = r, this._fullyVisible = i);
					let t = this.getState(e);
					t && To(e, new Ja(t));
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
		e.controlTab || (this.dummyManager = new Jo(this._element, e, a, i));
	}
	dispose() {
		this._onDispose(this), this._intersectionObserver && (this._intersectionObserver.disconnect(), delete this._intersectionObserver), delete this._current, delete this._fullyVisible, delete this._allElements, delete this._updateQueue, this._unobserve && (this._unobserve(), delete this._unobserve);
		let e = this._win();
		this._setCurrentTimer && (e.clearTimeout(this._setCurrentTimer), delete this._setCurrentTimer), this._updateTimer && (e.clearTimeout(this._updateTimer), delete this._updateTimer), this.dummyManager?.dispose(), delete this.dummyManager;
	}
	setCurrent(e) {
		this._current = e ? new ro(e) : void 0, (this._props.trackState || this._props.visibilityAware) && !this._setCurrentTimer && (this._setCurrentTimer = this._win().setTimeout(() => {
			delete this._setCurrentTimer;
			let e = [];
			this._current !== this._prevCurrent && (e.push(this._current), e.push(this._prevCurrent), this._prevCurrent = this._current);
			for (let t of e) {
				let e = t?.get();
				if (e && this._allElements?.get(e) === this) {
					let t = this._props;
					if (e && (t.visibilityAware !== void 0 || t.trackState)) {
						let t = this.getState(e);
						t && To(e, new Ja(t));
					}
				}
			}
		}));
	}
	getCurrent() {
		return this._current?.get() || null;
	}
	findNextTabbable(e, t, n, r) {
		let i = this.getElement(), a = i && Mo(e) === i;
		if (!i) return null;
		let o = null, s = !1, c;
		if (this._props.tabbable || a || e && !B.nodeContains(i, e)) {
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
		if (!Uo.isTabbing) return t.currentCtx?.excludedFromMover ? NodeFilter.FILTER_REJECT : void 0;
		let { memorizeCurrent: n, visibilityAware: r, hasDefault: i = !0 } = this._props, a = this.getElement();
		if (a && (n || r || i) && (!B.nodeContains(a, t.from) || Mo(t.from) === a)) {
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
					let n = po(this._win, e), i = this._visible[n];
					return a !== e && !!this._allElements?.get(e) && t.acceptCondition(e) && (i === fa.Visible || i === fa.PartiallyVisible && (r === fa.PartiallyVisible || !this._fullyVisible));
				}
			})), e) return t.found = !0, t.foundElement = e, t.rejectElementsFrom = a, t.skippedFocusable = !0, NodeFilter.FILTER_ACCEPT;
		}
	}
	_observeState() {
		let e = this.getElement();
		if (this._unobserve || !e || typeof MutationObserver > "u") return;
		let t = this._win(), n = this._allElements = /* @__PURE__ */ new WeakMap(), r = this._tabster.focusable, i = this._updateQueue = [], a = B.createMutationObserver((e) => {
			for (let t of e) {
				let e = t.target, n = t.removedNodes, r = t.addedNodes;
				if (t.type === "attributes") t.attributeName === "tabindex" && i.push({
					element: e,
					type: Xo
				});
				else {
					for (let e = 0; e < n.length; e++) i.push({
						element: n[e],
						type: Zo
					});
					for (let e = 0; e < r.length; e++) i.push({
						element: r[e],
						type: Yo
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
			let i = io(t.document, e, (e) => {
				let { mover: t, groupper: n } = d(e);
				if (t && t !== this) return NodeFilter.FILTER_REJECT;
				let i = n?.getFirst(!0);
				return n && n.getElement() !== e && i && i !== e ? NodeFilter.FILTER_REJECT : (r.isFocusable(e) && o(e), NodeFilter.FILTER_SKIP);
			});
			if (i) for (i.currentNode = e; i.nextNode(););
		}, l = (e) => {
			n.get(e) && o(e, !0);
			for (let t = B.getFirstElementChild(e); t; t = B.getNextElementSibling(t)) l(t);
		}, u = () => {
			!this._updateTimer && i.length && (this._updateTimer = t.setTimeout(() => {
				delete this._updateTimer;
				for (let { element: e, type: t } of i) switch (t) {
					case Xo:
						s(e);
						break;
					case Yo:
						c(e);
						break;
					case Zo: l(e);
				}
				i = this._updateQueue = [];
			}, 0));
		}, d = (e) => {
			let t = {};
			for (let n = e; n; n = B.getParentElement(n)) {
				let e = _a(this._tabster, n);
				if (e && (e.groupper && !t.groupper && (t.groupper = e.groupper), e.mover)) {
					t.mover = e.mover;
					break;
				}
			}
			return t;
		};
		i.push({
			element: e,
			type: Yo
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
		let t = po(this._win, e);
		if (t in this._visible) {
			let n = this._visible[t] || fa.Invisible;
			return {
				isCurrent: this._current ? this._current.get() === e : void 0,
				visibility: n
			};
		}
	}
};
function $o(e, t, n, r, i, a, o, s) {
	let c = n < i ? i - n : o < e ? e - o : 0, l = r < a ? a - r : s < t ? t - s : 0;
	return c === 0 ? l : l === 0 ? c : Math.sqrt(c * c + l * l);
}
var es = class {
	constructor(e, t) {
		this._init = () => {
			let e = this._win();
			Co(e, "keydown", this._onKeyDown, !0), Co(e, Ra, this._onMoveFocus), Co(e, za, this._onMemorizedElement), this._tabster.focusedElement.subscribe(this._onFocus);
		}, this._onMoverDispose = (e) => {
			delete this._movers[e.id];
		}, this._onFocus = (e) => {
			let t = e, n = e;
			for (let r = B.getParentElement(e); r; r = B.getParentElement(r)) {
				let e = _a(this._tabster, r)?.mover;
				e && (e.setCurrent(n), t = void 0), !t && this._tabster.focusable.isFocusable(r) && (t = n = r);
			}
		}, this._onKeyDown = async (e) => {
			if (this._ignoredInputTimer && (this._win().clearTimeout(this._ignoredInputTimer), delete this._ignoredInputTimer), this._ignoredInputResolve?.(!1), e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
			let t = e.key, n;
			if (t === Bo.ArrowDown ? n = ha.ArrowDown : t === Bo.ArrowRight ? n = ha.ArrowRight : t === Bo.ArrowUp ? n = ha.ArrowUp : t === Bo.ArrowLeft ? n = ha.ArrowLeft : t === Bo.PageDown ? n = ha.PageDown : t === Bo.PageUp ? n = ha.PageUp : t === Bo.Home ? n = ha.Home : t === Bo.End && (n = ha.End), !n) return;
			let r = this._tabster.focusedElement.getFocusedElement();
			r && !await this._isIgnoredInput(r, t) && this._moveFocus(r, n, e);
		}, this._onMoveFocus = (e) => {
			let t = e.composedPath()[0], n = e.detail?.key;
			t && n !== void 0 && !e.defaultPrevented && (this._moveFocus(t, n), e.stopImmediatePropagation());
		}, this._onMemorizedElement = (e) => {
			let t = e.composedPath()[0], n = e.detail?.memorizedElement;
			if (t) {
				let r = Ro.getTabsterContext(this._tabster, t)?.mover;
				r && (n && !B.nodeContains(r.getElement(), n) && (n = void 0), r.setCurrent(n), e.stopImmediatePropagation());
			}
		}, this._tabster = e, this._win = t, this._movers = {}, e.queueInit(this._init);
	}
	dispose() {
		let e = this._win();
		this._tabster.focusedElement.unsubscribe(this._onFocus), this._ignoredInputResolve?.(!1), this._ignoredInputTimer && (e.clearTimeout(this._ignoredInputTimer), delete this._ignoredInputTimer), wo(e, "keydown", this._onKeyDown, !0), wo(e, Ra, this._onMoveFocus), wo(e, za, this._onMemorizedElement), Object.keys(this._movers).forEach((e) => {
			this._movers[e] && (this._movers[e].dispose(), delete this._movers[e]);
		});
	}
	createMover(e, t, n) {
		let r = new Qo(this._tabster, e, this._onMoverDispose, t, n);
		return this._movers[r.id] = r, r;
	}
	moveFocus(e, t) {
		return this._moveFocus(e, t);
	}
	_moveFocus(e, t, n) {
		let r = this._tabster, i = Ro.getTabsterContext(r, e, { checkRtl: !0 });
		if (!i || !i.mover || i.excludedFromMover || n && i.ignoreKeydown(n)) return null;
		let a = i.mover, o = a.getElement();
		if (i.groupperBeforeMover) {
			let e = i.groupper;
			if (e && !e.isActive(!0)) {
				for (let t = B.getParentElement(e.getElement()); t && t !== o; t = B.getParentElement(t)) if (_a(r, t)?.groupper?.isActive(!0)) return null;
			} else return null;
		}
		if (!o) return null;
		let s = r.focusable, c = a.getProps(), l = c.direction || ma.Both, u = l === ma.Both, d = u || l === ma.Vertical, f = u || l === ma.Horizontal, p = l === ma.GridLinear, m = p || l === ma.Grid, h = c.cyclic, g, _, v, y = 0, b = 0;
		if (m && (v = e.getBoundingClientRect(), y = Math.ceil(v.left), b = Math.floor(v.right)), i.rtl && (t === ha.ArrowRight ? t = ha.ArrowLeft : t === ha.ArrowLeft && (t = ha.ArrowRight)), t === ha.ArrowDown && d || t === ha.ArrowRight && (f || m)) {
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
		} else if (t === ha.ArrowUp && d || t === ha.ArrowLeft && (f || m)) {
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
		} else if (t === ha.Home) m ? s.findElement({
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
		else if (t === ha.End) m ? s.findElement({
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
		else if (t === ha.PageUp) {
			if (s.findElement({
				currentElement: e,
				container: o,
				useActiveModalizer: !0,
				isBackward: !0,
				acceptCondition: (e) => s.isFocusable(e) ? !oo(this._win, e, a.visibilityTolerance) || (g = e, !1) : !1
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
		} else if (t === ha.PageDown) {
			if (s.findElement({
				currentElement: e,
				container: o,
				useActiveModalizer: !0,
				acceptCondition: (e) => s.isFocusable(e) ? !oo(this._win, e, a.visibilityTolerance) || (g = e, !1) : !1
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
			let n = t === ha.ArrowUp, r = y, i = Math.ceil(v.top), a = b, c = Math.floor(v.bottom), l, u, d = 0;
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
						let t = $o(r, i, a, c, o, s, f, p);
						(u === void 0 || t < u) && (u = t, l = e);
					} else if (d > 0) return !1;
					return !0;
				}
			}), g = l;
		}
		return g && (!n || n && To(o, new qa({
			by: "mover",
			owner: o,
			next: g,
			relatedEvent: n
		}))) ? (_ !== void 0 && so(this._win, g, _), n && (n.preventDefault(), n.stopImmediatePropagation()), Da(g), g) : null;
	}
	async _isIgnoredInput(e, t) {
		if (e.getAttribute("aria-expanded") === "true" && (e.hasAttribute("aria-activedescendant") || e.getAttribute("role") === "combobox")) return !0;
		if (go(e, qo)) {
			let n = 0, r = 0, i = 0, a;
			if (e.tagName === "INPUT" || e.tagName === "TEXTAREA") {
				let a = e.type;
				if (i = (e.value || "").length, a === "email" || a === "number") {
					if (i) {
						let n = B.getSelection(e);
						if (n) {
							let e = n.toString().length, r = t === Bo.ArrowLeft || t === Bo.ArrowUp;
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
				let { anchorNode: o, focusNode: s, anchorOffset: c, focusOffset: l } = B.getSelection(e) || {};
				this._ignoredInputTimer = a.setTimeout(() => {
					delete this._ignoredInputTimer;
					let { anchorNode: t, focusNode: a, anchorOffset: u, focusOffset: d } = B.getSelection(e) || {};
					if (t !== o || a !== s || u !== c || d !== l) this._ignoredInputResolve?.(!1);
					else {
						if (n = u || 0, r = d || 0, i = e.textContent?.length || 0, t && a && B.nodeContains(e, t) && B.nodeContains(e, a) && t !== e) {
							let i = !1, o = (e) => {
								if (e === t) i = !0;
								else if (e === a) return !0;
								let s = e.textContent;
								if (s && !B.getFirstChild(e)) {
									let e = s.length;
									i ? a !== t && (r += e) : (n += e, r += e);
								}
								let c = !1;
								for (let t = B.getFirstChild(e); t && !c; t = t.nextSibling) c = o(t);
								return c;
							};
							o(e);
						}
						this._ignoredInputResolve?.(!0);
					}
				}, 0);
			}));
			if (a && !await a || n !== r || n > 0 && (t === Bo.ArrowLeft || t === Bo.ArrowUp || t === Bo.Home) || n < i && (t === Bo.ArrowRight || t === Bo.ArrowDown || t === Bo.End)) return !0;
		}
		return !1;
	}
};
//#endregion
//#region node_modules/tabster/dist/esm/get/getMover.js
function ts(e) {
	let t = e.core;
	if (!t.mover) {
		let e = new es(t, t.getWindow);
		t.mover = e, t.attrHandlers.set("mover", (t, n, r, i, a) => n ? (n.setProps(r), n) : e.createMover(t, r, a));
	}
	return t.mover;
}
//#endregion
//#region node_modules/tabster/dist/esm/Restorer.js
var ns = class extends vo {
	constructor(e, t, n) {
		if (super(e, t, n), this._hasFocus = !1, this._onFocusOut = (e) => {
			let t = this._element?.get();
			t && e.relatedTarget === null && To(t, new Ya()), t && !B.nodeContains(t, e.relatedTarget) && (this._hasFocus = !1);
		}, this._onFocusIn = () => {
			this._hasFocus = !0;
		}, this._props.type === pa.Source) {
			let e = this._element?.get();
			Co(e, "focusout", this._onFocusOut), Co(e, "focusin", this._onFocusIn), this._hasFocus = B.nodeContains(e, e && B.getActiveElement(e.ownerDocument));
		}
	}
	dispose() {
		if (this._props.type === pa.Source) {
			let e = this._element?.get();
			if (wo(e, "focusout", this._onFocusOut), wo(e, "focusin", this._onFocusIn), this._hasFocus) {
				let e = this._tabster.getWindow().document;
				To(e.body, new Ya());
			}
		}
	}
}, rs = class e {
	static {
		this.DEPTH = 10;
	}
	constructor(e) {
		this._stack = [], this._getWindow = e;
	}
	push(t) {
		this._stack[this._stack.length - 1]?.get() !== t && (this._stack.length > e.DEPTH && this._stack.shift(), this._stack.push(new ro(t)));
	}
	pop(e = () => !0) {
		let t = this._getWindow().document;
		for (let n = this._stack.length - 1; n >= 0; n--) {
			let n = this._stack.pop()?.get();
			if (n && B.nodeContains(t.body, B.getParentElement(n)) && e(n)) return n;
		}
	}
}, is = class {
	constructor(e) {
		this._onRestoreFocus = (e) => {
			this._focusedElementState.cancelAsyncFocus(da.Restorer);
			let t = e.composedPath()[0];
			if (t) {
				let e = _a(this._tabster, t)?.restorer?.getProps().id;
				this._focusedElementState.requestAsyncFocus(da.Restorer, () => this._restoreFocus(t, e), 0);
			}
		}, this._onFocusIn = (e) => {
			e && _a(this._tabster, e)?.restorer?.getProps().type === pa.Target && this._history.push(e);
		}, this._restoreFocus = (e, t) => {
			let n = this._getWindow().document;
			if (B.getActiveElement(n) !== n.body || !this._keyboardNavState.isNavigatingWithKeyboard() && B.nodeContains(n.body, e)) return;
			let r = (e) => {
				let t = _a(this._tabster, e)?.restorer?.getProps();
				return t ? t.id : null;
			};
			this._history.pop((e) => t === r(e))?.focus();
		}, this._tabster = e, this._getWindow = e.getWindow, Co(this._getWindow(), Ba, this._onRestoreFocus), this._history = new rs(this._getWindow), this._keyboardNavState = e.keyboardNavigation, this._focusedElementState = e.focusedElement, this._focusedElementState.subscribe(this._onFocusIn);
	}
	dispose() {
		let e = this._getWindow();
		this._focusedElementState.unsubscribe(this._onFocusIn), this._focusedElementState.cancelAsyncFocus(da.Restorer), wo(e, Ba, this._onRestoreFocus);
	}
	createRestorer(e, t) {
		let n = new ns(this._tabster, e, t);
		return t.type === pa.Target && B.getActiveElement(e.ownerDocument) === e && this._history.push(e), n;
	}
};
//#endregion
//#region node_modules/tabster/dist/esm/get/getRestorer.js
function as(e) {
	let t = e.core;
	if (!t.restorer) {
		let e = new is(t);
		t.restorer = e, t.attrHandlers.set("restorer", (t, n, r) => n ? (n.setProps(r), n) : e.createRestorer(t, r));
	}
	return t.restorer;
}
//#endregion
//#region node_modules/tabster/dist/esm/Tabster.js
var os = class {
	constructor(e) {
		this.keyboardNavigation = e.keyboardNavigation, this.focusedElement = e.focusedElement, this.focusable = e.focusable, this.root = e.root, this.uncontrolled = e.uncontrolled, this.core = e;
	}
}, ss = class {
	constructor(e, t) {
		this._forgetMemorizedElements = [], this._wrappers = /* @__PURE__ */ new Set(), this._initQueue = [], this._version = "8.8.1", this._noop = !1, this.attrHandlers = /* @__PURE__ */ new Map(), this.getWindow = () => {
			if (!this._win) throw Error("Using disposed Tabster.");
			return this._win;
		}, this._storage = /* @__PURE__ */ new WeakMap(), this._win = e;
		let n = this.getWindow;
		t?.DOMAPI && Qa({ ...t.DOMAPI }), this.keyboardNavigation = new Wo(n), this.focusedElement = new Uo(this, n), this.focusable = new zo(this), this.root = new Ro(this, t?.autoRoot), this.uncontrolled = new Ko(t?.checkUncontrolledCompletely || t?.checkUncontrolledTrappingFocus), this.controlTab = t?.controlTab ?? !0, this.rootDummyInputs = !!t?.rootDummyInputs, this._dummyObserver = new Ao(n), this.getParent = t?.getParent ?? B.getParentNode, this.internal = {
			stopObserver: () => {
				this._unobserve && (this._unobserve(), delete this._unobserve);
			},
			resumeObserver: (e) => {
				if (!this._unobserve) {
					let t = n().document;
					this._unobserve = Go(t, this, va, e);
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
		let n = new os(this);
		return e || this._wrappers.add(n), this._mergeProps(t), n;
	}
	disposeTabster(e, t) {
		t ? this._wrappers.clear() : this._wrappers.delete(e), this._wrappers.size === 0 && this.dispose();
	}
	dispose() {
		this.internal.stopObserver();
		let e = this._win;
		e?.clearTimeout(this._initTimer), delete this._initTimer, this._initQueue = [], this._forgetMemorizedElements = [], e && this._forgetMemorizedTimer && (e.clearTimeout(this._forgetMemorizedTimer), delete this._forgetMemorizedTimer), this.outline?.dispose(), this.crossOrigin?.dispose(), this.deloser?.dispose(), this.groupper?.dispose(), this.mover?.dispose(), this.modalizer?.dispose(), this.observedElement?.dispose(), this.restorer?.dispose(), this.keyboardNavigation.dispose(), this.focusable.dispose(), this.focusedElement.dispose(), this.root.dispose(), this._dummyObserver.dispose(), this.attrHandlers.clear(), mo(this.getWindow), this._storage = /* @__PURE__ */ new WeakMap(), this._wrappers.clear(), e && (to(e), delete e.__tabsterInstance, delete this._win);
	}
	storageEntry(e, t) {
		let n = this._storage, r = n.get(e);
		return r ? t === !1 && Object.keys(r).length === 0 && n.delete(e) : t === !0 && (r = {}, n.set(e, r)), r;
	}
	forceCleanup() {
		this._win && (this._forgetMemorizedElements.push(this._win.document.body), !this._forgetMemorizedTimer && (this._forgetMemorizedTimer = this._win.setTimeout(() => {
			delete this._forgetMemorizedTimer;
			for (let e = this._forgetMemorizedElements.shift(); e; e = this._forgetMemorizedElements.shift()) mo(this.getWindow, e), Uo.forgetMemorized(this.focusedElement, e);
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
function cs(e, t) {
	let n = us(e);
	return n ? n.createTabster(!1, t) : (n = new ss(e, t), e.__tabsterInstance = n, n.createTabster());
}
function ls(e, t) {
	e.core.disposeTabster(e, t);
}
function us(e) {
	return e.__tabsterInstance;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useTabster.js
var ds = (e) => e;
function fs(e) {
	let t = e?.defaultView || void 0, n = t?.__tabsterShadowDOMAPI;
	if (t) return cs(t, {
		autoRoot: {},
		controlTab: !1,
		getParent: Ji,
		checkUncontrolledCompletely: (e) => e.firstElementChild?.hasAttribute("data-is-focus-trap-zone-bumper") === !0 || void 0,
		DOMAPI: n
	});
}
function ps(e = ds) {
	let { targetDocument: t } = Qr(), n = P.useRef(null);
	return Si(() => {
		let r = fs(t);
		if (r) return n.current = e(r), () => {
			ls(r), n.current = null;
		};
	}, [t, e]), n;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useTabsterAttributes.js
var ms = (e) => {
	ps();
	let t = No(e, !0);
	return P.useMemo(() => ({ [ca]: t }), [t]);
}, hs = (e = {}) => {
	let { circular: t, axis: n, memorizeCurrent: r = !0, tabbable: i, ignoreDefaultKeydown: a, unstable_hasDefault: o } = e;
	return ps(ts), ms({
		mover: {
			cyclic: !!t,
			direction: gs(n ?? "vertical"),
			memorizeCurrent: r,
			tabbable: i,
			hasDefault: o
		},
		...a && { focusable: { ignoreKeydown: a } }
	});
};
function gs(e) {
	switch (e) {
		case "horizontal": return ma.Horizontal;
		case "grid": return ma.Grid;
		case "grid-linear": return ma.GridLinear;
		case "both": return ma.Both;
		default: return ma.Vertical;
	}
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusFinders.js
var _s = () => {
	let e = ps(), { targetDocument: t } = Qr();
	return {
		findAllFocusable: P.useCallback((t, n) => t && e.current?.focusable.findAll({
			container: t,
			acceptCondition: n
		}) || [], [e]),
		findFirstFocusable: P.useCallback((t) => t && e.current?.focusable.findFirst({ container: t }), [e]),
		findLastFocusable: P.useCallback((t) => t && e.current?.focusable.findLast({ container: t }), [e]),
		findNextFocusable: P.useCallback((n, r = {}) => {
			if (!e.current || !t || !n) return null;
			let { container: i = t.body } = r;
			return e.current.focusable.findNext({
				currentElement: n,
				container: i
			});
		}, [e, t]),
		findPrevFocusable: P.useCallback((n, r = {}) => {
			if (!e.current || !t || !n) return null;
			let { container: i = t.body } = r;
			return e.current.focusable.findPrev({
				currentElement: n,
				container: i
			});
		}, [e, t])
	};
}, vs = (e, t, n) => {
	e.addEventListener(t, n, !0);
}, ys = (e, t, n) => {
	e.removeEventListener(t, n, !0);
}, bs = "keyborg:focusin", xs = "keyborg:focusout", Ss = 0, Cs = 1, ws = 2, Ts = 3;
function Es(e) {
	let t = e.HTMLElement, n = t.prototype.focus, r = !1;
	return t.prototype.focus = function() {
		r = !0;
	}, e.document.createElement("button").focus(), t.prototype.focus = n, r;
}
var Ds = !1;
function Os(e) {
	let t = e, n = t.document, r = t.HTMLElement.prototype;
	Ds ||= Es(t);
	let i = r.focus;
	if (i.__keyborgNativeFocus) return;
	r.focus = u;
	let a = /* @__PURE__ */ new Set(), o = (e) => {
		let t = e.target;
		if (!t) return;
		let n = new CustomEvent(xs, {
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
			(!t || !r.has(t)) && (a.delete(e), t && (ys(t, "focusin", s), ys(t, "focusout", o)));
		}
		c(t, e.relatedTarget || void 0);
	}, c = (e, t, n) => {
		let r = e.shadowRoot;
		if (r) {
			for (let e of a) if (e.deref() === r) return;
			vs(r, "focusin", s), vs(r, "focusout", o), a.add(new WeakRef(r));
			return;
		}
		let i = {
			relatedTarget: t,
			originalEvent: n
		}, c = new CustomEvent(bs, {
			cancelable: !0,
			bubbles: !0,
			composed: !0,
			detail: i
		});
		c.details = i, (Ds || l[Ts]) && (i.isFocusedProgrammatically = e === l[Ts]?.deref(), l[Ts] = void 0), e.dispatchEvent(c);
	}, l = [
		s,
		o,
		a
	];
	t.__keyborgData = l, vs(n, "focusin", s), vs(n, "focusout", o);
	function u() {
		let e = t.__keyborgData;
		return e && (e[Ts] = new WeakRef(this)), i.apply(this, arguments);
	}
	let d = n.activeElement;
	for (; d && d.shadowRoot;) c(d), d = d.shadowRoot.activeElement;
	u.__keyborgNativeFocus = i;
}
function ks(e) {
	let t = e, n = t.HTMLElement.prototype, r = n.focus.__keyborgNativeFocus, i = t.__keyborgData;
	if (i) {
		let e = t.document;
		ys(e, "focusin", i[Ss]), ys(e, "focusout", i[Cs]);
		for (let e of i[ws]) {
			let t = e.deref();
			t && (ys(t, "focusin", i[Ss]), ys(t, "focusout", i[Cs]));
		}
		i[ws].clear(), delete t.__keyborgData;
	}
	r && (n.focus = r);
}
var As = 500, js = 0;
function Ms(e, t) {
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
		}, As);
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
	return vs(_, bs, p), vs(_, "mousedown", h), vs(e, "keydown", g), vs(_, "touchstart", m), vs(_, "touchend", m), vs(_, "touchcancel", m), Os(e), {
		dispose: () => {
			if (!n) return;
			i &&= (n.clearTimeout(i), void 0), a &&= (n.clearTimeout(a), void 0), ks(n);
			let e = n.document;
			ys(e, bs, p), ys(e, "mousedown", h), ys(n, "keydown", g), ys(e, "touchstart", m), ys(e, "touchend", m), ys(e, "touchcancel", m), n = void 0;
		},
		get isNavigatingWithKeyboard() {
			return r;
		},
		set isNavigatingWithKeyboard(e) {
			l(e);
		}
	};
}
function Ns(e, t) {
	let n = e, r = "k" + ++js, i = n, a, o = [], s = n.__keyborg;
	a = s ? s.core : Ms(n, t);
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
function Ps(e) {
	e.dispose();
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/constants.js
var Fs = "data-fui-focus-visible";
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/focusVisiblePolyfill.js
function Is(e, t) {
	if (Ls(e)) return () => void 0;
	let n = { current: void 0 }, r = Ns(t);
	function i(e) {
		r.isNavigatingWithKeyboard() && Vi(e) && (n.current = e, e.setAttribute(Fs, ""));
	}
	function a() {
		n.current &&= (n.current.removeAttribute(Fs), void 0);
	}
	r.subscribe((e) => {
		e ? i(t.document.activeElement) : a();
	});
	let o = (e) => {
		a();
		let t = e.composedPath()[0];
		i(t);
	}, s = (t) => {
		(!t.relatedTarget || Vi(t.relatedTarget) && !e.contains(t.relatedTarget)) && a();
	};
	return e.addEventListener(bs, o), e.addEventListener("focusout", s), e.focusVisible = !0, e.contains(t.document.activeElement) && i(t.document.activeElement), () => {
		a(), e.removeEventListener(bs, o), e.removeEventListener("focusout", s), e.focusVisible = void 0, Ps(r);
	};
}
function Ls(e) {
	return e ? e.focusVisible ? !0 : Ls(e?.parentElement) : !1;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusVisible.js
function Rs(e = {}) {
	let t = Qr(), n = P.useRef(null), r = e.targetDocument ?? t.targetDocument;
	return P.useEffect(() => {
		if (r?.defaultView && n.current) return Is(n.current, r.defaultView);
	}, [n, r]), n;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useKeyborgRef.js
function zs() {
	let { targetDocument: e } = Qr(), t = P.useRef(null);
	return P.useEffect(() => {
		let n = e?.defaultView;
		if (n) {
			let e = Ns(n);
			return t.current = e, () => {
				Ps(e), t.current = null;
			};
		}
	}, [e]), t;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useMergeTabsterAttributes.js
var Bs = (...e) => {
	let t = [], n = "";
	for (let r of e) {
		let e = r?.[ca];
		e && (t.push(e), n += e + Vs);
	}
	return P.useMemo(() => ({ [ca]: Hs(t) }), [n]);
}, Vs = "\0", Hs = (e) => {
	if (e.length !== 0) return e.length === 1 ? e[0] : JSON.stringify(Object.assign({}, ...e.map(Us)));
}, Us = (e) => {
	try {
		return JSON.parse(e);
	} catch {
		return {};
	}
};
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useRestoreFocus.js
function Ws() {
	return ps(as), No({ restorer: { type: pa.Source } });
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useIsNavigatingWithKeyboard.js
function Gs() {
	let e = zs();
	return P.useCallback(() => e.current?.isNavigatingWithKeyboard() ?? !1, [e]);
}
//#endregion
//#region node_modules/@fluentui/tokens/lib/global/colors.js
var H = {
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
}, Ks = {
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
}, qs = {
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
}, Js = {
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
}, Ys = {
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
}, Xs = {
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
}, U = "#ffffff", Zs = "#000000", Qs = {
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
}, $s = {
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
}, ec = {
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
}, tc = {
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
}, nc = {
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
}, rc = {
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
}, ic = {
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
}, ac = {
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
}, oc = {
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
}, sc = {
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
}, cc = {
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
}, lc = {
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
}, uc = {
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
}, dc = {
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
}, fc = {
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
}, pc = {
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
}, mc = {
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
}, hc = {
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
}, gc = {
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
}, _c = {
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
}, vc = {
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
}, yc = {
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
}, bc = {
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
}, xc = {
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
}, Sc = {
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
}, Cc = {
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
}, wc = {
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
}, Tc = {
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
}, Ec = {
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
}, Dc = {
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
}, Oc = {
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
}, kc = {
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
}, Ac = {
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
}, jc = {
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
}, Mc = {
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
}, Nc = {
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
}, W = {
	red: ec,
	green: pc,
	darkOrange: tc,
	yellow: oc,
	berry: Tc,
	lightGreen: fc,
	marigold: ac
}, Pc = {
	darkRed: Qs,
	cranberry: $s,
	pumpkin: nc,
	peach: ic,
	gold: sc,
	brass: cc,
	brown: lc,
	forest: uc,
	seafoam: dc,
	darkGreen: mc,
	lightTeal: hc,
	teal: gc,
	steel: _c,
	blue: vc,
	royalBlue: yc,
	cornflower: bc,
	navy: xc,
	lavender: Sc,
	purple: Cc,
	grape: wc,
	lilac: Ec,
	pink: Dc,
	magenta: Oc,
	plum: kc,
	beige: Ac,
	mink: jc,
	platinum: Mc,
	anchor: Nc
}, G = {
	cranberry: $s,
	green: pc,
	orange: rc
}, Fc = [
	"red",
	"green",
	"darkOrange",
	"yellow",
	"berry",
	"lightGreen",
	"marigold"
], Ic = /* @__PURE__ */ "darkRed.cranberry.pumpkin.peach.gold.brass.brown.forest.seafoam.darkGreen.lightTeal.teal.steel.blue.royalBlue.cornflower.navy.lavender.purple.grape.lilac.pink.magenta.plum.beige.mink.platinum.anchor".split("."), Lc = {
	success: "green",
	warning: "orange",
	danger: "cranberry"
}, Rc = Fc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background1`]: W[t].tint60,
		[`colorPalette${n}Background2`]: W[t].tint40,
		[`colorPalette${n}Background3`]: W[t].primary,
		[`colorPalette${n}Foreground1`]: W[t].shade10,
		[`colorPalette${n}Foreground2`]: W[t].shade30,
		[`colorPalette${n}Foreground3`]: W[t].primary,
		[`colorPalette${n}BorderActive`]: W[t].primary,
		[`colorPalette${n}Border1`]: W[t].tint40,
		[`colorPalette${n}Border2`]: W[t].primary
	};
	return Object.assign(e, r);
}, {});
Rc.colorPaletteYellowForeground1 = W.yellow.shade30, Rc.colorPaletteRedForegroundInverted = W.red.tint20, Rc.colorPaletteGreenForegroundInverted = W.green.tint20, Rc.colorPaletteYellowForegroundInverted = W.yellow.tint40;
var zc = Ic.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background2`]: Pc[t].tint40,
		[`colorPalette${n}Foreground2`]: Pc[t].shade30,
		[`colorPalette${n}BorderActive`]: Pc[t].primary
	};
	return Object.assign(e, r);
}, {}), Bc = {
	...Rc,
	...zc
}, Vc = Object.entries(Lc).reduce((e, [t, n]) => {
	let r = t.slice(0, 1).toUpperCase() + t.slice(1), i = {
		[`colorStatus${r}Background1`]: G[n].tint60,
		[`colorStatus${r}Background2`]: G[n].tint40,
		[`colorStatus${r}Background3`]: G[n].primary,
		[`colorStatus${r}Foreground1`]: G[n].shade10,
		[`colorStatus${r}Foreground2`]: G[n].shade30,
		[`colorStatus${r}Foreground3`]: G[n].primary,
		[`colorStatus${r}ForegroundInverted`]: G[n].tint30,
		[`colorStatus${r}BorderActive`]: G[n].primary,
		[`colorStatus${r}Border1`]: G[n].tint40,
		[`colorStatus${r}Border2`]: G[n].primary
	};
	return Object.assign(e, i);
}, {});
Vc.colorStatusDangerBackground3Hover = G[Lc.danger].shade10, Vc.colorStatusDangerBackground3Pressed = G[Lc.danger].shade20, Vc.colorStatusWarningForeground1 = G[Lc.warning].shade20, Vc.colorStatusWarningForeground3 = G[Lc.warning].shade20, Vc.colorStatusWarningBorder2 = G[Lc.warning].shade20;
//#endregion
//#region node_modules/@fluentui/tokens/lib/alias/lightColor.js
var Hc = (e) => ({
	colorNeutralForeground1: H[14],
	colorNeutralForeground1Hover: H[14],
	colorNeutralForeground1Pressed: H[14],
	colorNeutralForeground1Selected: H[14],
	colorNeutralForeground2: H[26],
	colorNeutralForeground2Hover: H[14],
	colorNeutralForeground2Pressed: H[14],
	colorNeutralForeground2Selected: H[14],
	colorNeutralForeground2BrandHover: e[80],
	colorNeutralForeground2BrandPressed: e[70],
	colorNeutralForeground2BrandSelected: e[80],
	colorNeutralForeground3: H[38],
	colorNeutralForeground3Hover: H[26],
	colorNeutralForeground3Pressed: H[26],
	colorNeutralForeground3Selected: H[26],
	colorNeutralForeground3BrandHover: e[80],
	colorNeutralForeground3BrandPressed: e[70],
	colorNeutralForeground3BrandSelected: e[80],
	colorNeutralForeground4: H[44],
	colorNeutralForeground5: H[38],
	colorNeutralForeground5Hover: H[14],
	colorNeutralForeground5Pressed: H[14],
	colorNeutralForeground5Selected: H[14],
	colorNeutralForegroundDisabled: H[74],
	colorNeutralForegroundInvertedDisabled: Ks[40],
	colorBrandForegroundLink: e[70],
	colorBrandForegroundLinkHover: e[60],
	colorBrandForegroundLinkPressed: e[40],
	colorBrandForegroundLinkSelected: e[70],
	colorNeutralForeground2Link: H[26],
	colorNeutralForeground2LinkHover: H[14],
	colorNeutralForeground2LinkPressed: H[14],
	colorNeutralForeground2LinkSelected: H[14],
	colorCompoundBrandForeground1: e[80],
	colorCompoundBrandForeground1Hover: e[70],
	colorCompoundBrandForeground1Pressed: e[60],
	colorBrandForeground1: e[80],
	colorBrandForeground2: e[70],
	colorBrandForeground2Hover: e[60],
	colorBrandForeground2Pressed: e[30],
	colorNeutralForeground1Static: H[14],
	colorNeutralForegroundStaticInverted: U,
	colorNeutralForegroundInverted: U,
	colorNeutralForegroundInvertedHover: U,
	colorNeutralForegroundInvertedPressed: U,
	colorNeutralForegroundInvertedSelected: U,
	colorNeutralForegroundInverted2: U,
	colorNeutralForegroundOnBrand: U,
	colorNeutralForegroundInvertedLink: U,
	colorNeutralForegroundInvertedLinkHover: U,
	colorNeutralForegroundInvertedLinkPressed: U,
	colorNeutralForegroundInvertedLinkSelected: U,
	colorBrandForegroundInverted: e[100],
	colorBrandForegroundInvertedHover: e[110],
	colorBrandForegroundInvertedPressed: e[100],
	colorBrandForegroundOnLight: e[80],
	colorBrandForegroundOnLightHover: e[70],
	colorBrandForegroundOnLightPressed: e[50],
	colorBrandForegroundOnLightSelected: e[60],
	colorNeutralBackground1: U,
	colorNeutralBackground1Hover: H[96],
	colorNeutralBackground1Pressed: H[88],
	colorNeutralBackground1Selected: H[92],
	colorNeutralBackground2: H[98],
	colorNeutralBackground2Hover: H[94],
	colorNeutralBackground2Pressed: H[86],
	colorNeutralBackground2Selected: H[90],
	colorNeutralBackground3: H[96],
	colorNeutralBackground3Hover: H[92],
	colorNeutralBackground3Pressed: H[84],
	colorNeutralBackground3Selected: H[88],
	colorNeutralBackground4: H[94],
	colorNeutralBackground4Hover: H[98],
	colorNeutralBackground4Pressed: H[96],
	colorNeutralBackground4Selected: U,
	colorNeutralBackground5: H[92],
	colorNeutralBackground5Hover: H[96],
	colorNeutralBackground5Pressed: H[94],
	colorNeutralBackground5Selected: H[98],
	colorNeutralBackground6: H[90],
	colorNeutralBackground7: "#00000000",
	colorNeutralBackground7Hover: H[92],
	colorNeutralBackground7Pressed: H[84],
	colorNeutralBackground7Selected: "#00000000",
	colorNeutralBackground8: H[99],
	colorNeutralBackgroundInverted: H[16],
	colorNeutralBackgroundInvertedHover: H[24],
	colorNeutralBackgroundInvertedPressed: H[12],
	colorNeutralBackgroundInvertedSelected: H[22],
	colorNeutralBackgroundStatic: H[20],
	colorNeutralBackgroundAlpha: Ks[50],
	colorNeutralBackgroundAlpha2: Ks[80],
	colorSubtleBackground: "transparent",
	colorSubtleBackgroundHover: H[96],
	colorSubtleBackgroundPressed: H[88],
	colorSubtleBackgroundSelected: H[92],
	colorSubtleBackgroundLightAlphaHover: Ks[70],
	colorSubtleBackgroundLightAlphaPressed: Ks[50],
	colorSubtleBackgroundLightAlphaSelected: "transparent",
	colorSubtleBackgroundInverted: "transparent",
	colorSubtleBackgroundInvertedHover: qs[10],
	colorSubtleBackgroundInvertedPressed: qs[30],
	colorSubtleBackgroundInvertedSelected: qs[20],
	colorTransparentBackground: "transparent",
	colorTransparentBackgroundHover: "transparent",
	colorTransparentBackgroundPressed: "transparent",
	colorTransparentBackgroundSelected: "transparent",
	colorNeutralBackgroundDisabled: H[94],
	colorNeutralBackgroundDisabled2: U,
	colorNeutralBackgroundInvertedDisabled: Ks[10],
	colorNeutralStencil1: H[90],
	colorNeutralStencil2: H[98],
	colorNeutralStencil1Alpha: qs[10],
	colorNeutralStencil2Alpha: qs[5],
	colorBackgroundOverlay: qs[40],
	colorScrollbarOverlay: qs[50],
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
	colorBrandBackgroundInverted: U,
	colorBrandBackgroundInvertedHover: e[160],
	colorBrandBackgroundInvertedPressed: e[140],
	colorBrandBackgroundInvertedSelected: e[150],
	colorNeutralCardBackground: H[98],
	colorNeutralCardBackgroundHover: U,
	colorNeutralCardBackgroundPressed: H[96],
	colorNeutralCardBackgroundSelected: H[92],
	colorNeutralCardBackgroundDisabled: H[94],
	colorNeutralStrokeAccessible: H[38],
	colorNeutralStrokeAccessibleHover: H[34],
	colorNeutralStrokeAccessiblePressed: H[30],
	colorNeutralStrokeAccessibleSelected: e[80],
	colorNeutralStroke1: H[82],
	colorNeutralStroke1Hover: H[78],
	colorNeutralStroke1Pressed: H[70],
	colorNeutralStroke1Selected: H[74],
	colorNeutralStroke2: H[88],
	colorNeutralStroke3: H[94],
	colorNeutralStroke4: H[92],
	colorNeutralStroke4Hover: H[88],
	colorNeutralStroke4Pressed: H[84],
	colorNeutralStroke4Selected: H[92],
	colorNeutralStrokeSubtle: H[88],
	colorNeutralStrokeOnBrand: U,
	colorNeutralStrokeOnBrand2: U,
	colorNeutralStrokeOnBrand2Hover: U,
	colorNeutralStrokeOnBrand2Pressed: U,
	colorNeutralStrokeOnBrand2Selected: U,
	colorBrandStroke1: e[80],
	colorBrandStroke2: e[140],
	colorBrandStroke2Hover: e[120],
	colorBrandStroke2Pressed: e[80],
	colorBrandStroke2Contrast: e[140],
	colorCompoundBrandStroke: e[80],
	colorCompoundBrandStrokeHover: e[70],
	colorCompoundBrandStrokePressed: e[60],
	colorNeutralStrokeDisabled: H[88],
	colorNeutralStrokeDisabled2: H[92],
	colorNeutralStrokeInvertedDisabled: Ks[40],
	colorTransparentStroke: "transparent",
	colorTransparentStrokeInteractive: "transparent",
	colorTransparentStrokeDisabled: "transparent",
	colorNeutralStrokeAlpha: qs[5],
	colorNeutralStrokeAlpha2: Ks[20],
	colorStrokeFocus1: U,
	colorStrokeFocus2: Zs,
	colorNeutralShadowAmbient: "rgba(0,0,0,0.12)",
	colorNeutralShadowKey: "rgba(0,0,0,0.14)",
	colorNeutralShadowAmbientLighter: "rgba(0,0,0,0.06)",
	colorNeutralShadowKeyLighter: "rgba(0,0,0,0.07)",
	colorNeutralShadowAmbientDarker: "rgba(0,0,0,0.20)",
	colorNeutralShadowKeyDarker: "rgba(0,0,0,0.24)",
	colorBrandShadowAmbient: "rgba(0,0,0,0.30)",
	colorBrandShadowKey: "rgba(0,0,0,0.25)"
}), Uc = {
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
}, Wc = {
	curveAccelerateMax: "cubic-bezier(0.9,0.1,1,0.2)",
	curveAccelerateMid: "cubic-bezier(1,0,1,1)",
	curveAccelerateMin: "cubic-bezier(0.8,0,0.78,1)",
	curveDecelerateMax: "cubic-bezier(0.1,0.9,0.2,1)",
	curveDecelerateMid: "cubic-bezier(0,0,0,1)",
	curveDecelerateMin: "cubic-bezier(0.33,0,0.1,1)",
	curveEasyEaseMax: "cubic-bezier(0.8,0,0.2,1)",
	curveEasyEase: "cubic-bezier(0.33,0,0.67,1)",
	curveLinear: "cubic-bezier(0,0,1,1)"
}, Gc = {
	durationUltraFast: "50ms",
	durationFaster: "100ms",
	durationFast: "150ms",
	durationNormal: "200ms",
	durationGentle: "250ms",
	durationSlow: "300ms",
	durationSlower: "400ms",
	durationUltraSlow: "500ms"
}, Kc = {
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
}, qc = {
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
}, Jc = {
	fontWeightRegular: 400,
	fontWeightMedium: 500,
	fontWeightSemibold: 600,
	fontWeightBold: 700
}, Yc = {
	fontFamilyBase: "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif",
	fontFamilyMonospace: "Consolas, 'Courier New', Courier, monospace",
	fontFamilyNumeric: "Bahnschrift, 'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif"
}, Xc = {
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
}, Zc = {
	spacingHorizontalNone: Xc.none,
	spacingHorizontalXXS: Xc.xxs,
	spacingHorizontalXS: Xc.xs,
	spacingHorizontalSNudge: Xc.sNudge,
	spacingHorizontalS: Xc.s,
	spacingHorizontalMNudge: Xc.mNudge,
	spacingHorizontalM: Xc.m,
	spacingHorizontalL: Xc.l,
	spacingHorizontalXL: Xc.xl,
	spacingHorizontalXXL: Xc.xxl,
	spacingHorizontalXXXL: Xc.xxxl
}, Qc = {
	spacingVerticalNone: Xc.none,
	spacingVerticalXXS: Xc.xxs,
	spacingVerticalXS: Xc.xs,
	spacingVerticalSNudge: Xc.sNudge,
	spacingVerticalS: Xc.s,
	spacingVerticalMNudge: Xc.mNudge,
	spacingVerticalM: Xc.m,
	spacingVerticalL: Xc.l,
	spacingVerticalXL: Xc.xl,
	spacingVerticalXXL: Xc.xxl,
	spacingVerticalXXXL: Xc.xxxl
}, $c = {
	strokeWidthThin: "1px",
	strokeWidthThick: "2px",
	strokeWidthThicker: "3px",
	strokeWidthThickest: "4px"
}, K = {
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
function el(e, t, n = "") {
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
var tl = (e) => {
	let t = Hc(e);
	return {
		...Uc,
		...Kc,
		...qc,
		...Yc,
		...Jc,
		...$c,
		...Zc,
		...Qc,
		...Gc,
		...Wc,
		...t,
		...Bc,
		...Vc,
		...el(t.colorNeutralShadowAmbient, t.colorNeutralShadowKey),
		...el(t.colorBrandShadowAmbient, t.colorBrandShadowKey, "Brand")
	};
}, nl = {
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
}, rl = Fc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background1`]: W[t].shade40,
		[`colorPalette${n}Background2`]: W[t].shade30,
		[`colorPalette${n}Background3`]: W[t].primary,
		[`colorPalette${n}Foreground1`]: W[t].tint30,
		[`colorPalette${n}Foreground2`]: W[t].tint40,
		[`colorPalette${n}Foreground3`]: W[t].tint20,
		[`colorPalette${n}BorderActive`]: W[t].tint30,
		[`colorPalette${n}Border1`]: W[t].primary,
		[`colorPalette${n}Border2`]: W[t].tint20
	};
	return Object.assign(e, r);
}, {});
rl.colorPaletteRedForeground3 = W.red.tint30, rl.colorPaletteRedBorder2 = W.red.tint30, rl.colorPaletteGreenForeground3 = W.green.tint40, rl.colorPaletteGreenBorder2 = W.green.tint40, rl.colorPaletteDarkOrangeForeground3 = W.darkOrange.tint30, rl.colorPaletteDarkOrangeBorder2 = W.darkOrange.tint30, rl.colorPaletteRedForegroundInverted = W.red.primary, rl.colorPaletteGreenForegroundInverted = W.green.primary, rl.colorPaletteYellowForegroundInverted = W.yellow.shade30;
var il = Ic.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background2`]: Pc[t].shade30,
		[`colorPalette${n}Foreground2`]: Pc[t].tint40,
		[`colorPalette${n}BorderActive`]: Pc[t].tint30
	};
	return Object.assign(e, r);
}, {});
il.colorPaletteDarkRedBackground2 = Pc.darkRed.shade20, il.colorPalettePlumBackground2 = Pc.plum.shade20;
var al = {
	...rl,
	...il
}, ol = Object.entries(Lc).reduce((e, [t, n]) => {
	let r = t.slice(0, 1).toUpperCase() + t.slice(1), i = {
		[`colorStatus${r}Background1`]: G[n].shade40,
		[`colorStatus${r}Background2`]: G[n].shade30,
		[`colorStatus${r}Background3`]: G[n].primary,
		[`colorStatus${r}Foreground1`]: G[n].tint30,
		[`colorStatus${r}Foreground2`]: G[n].tint40,
		[`colorStatus${r}Foreground3`]: G[n].tint20,
		[`colorStatus${r}BorderActive`]: G[n].tint30,
		[`colorStatus${r}ForegroundInverted`]: G[n].shade10,
		[`colorStatus${r}Border1`]: G[n].primary,
		[`colorStatus${r}Border2`]: G[n].tint20
	};
	return Object.assign(e, i);
}, {});
ol.colorStatusDangerBackground3Hover = G[Lc.danger].shade10, ol.colorStatusDangerBackground3Pressed = G[Lc.danger].shade20, ol.colorStatusDangerForeground3 = G[Lc.danger].tint40, ol.colorStatusDangerBorder2 = G[Lc.danger].tint30, ol.colorStatusSuccessForeground3 = G[Lc.success].tint40, ol.colorStatusSuccessBorder2 = G[Lc.success].tint40, ol.colorStatusWarningForegroundInverted = G[Lc.warning].shade20;
//#endregion
//#region node_modules/@fluentui/tokens/lib/themes/web/lightTheme.js
var sl = tl(nl), cl = (e) => ({
	colorNeutralForeground1: U,
	colorNeutralForeground1Hover: U,
	colorNeutralForeground1Pressed: U,
	colorNeutralForeground1Selected: U,
	colorNeutralForeground2: H[84],
	colorNeutralForeground2Hover: U,
	colorNeutralForeground2Pressed: U,
	colorNeutralForeground2Selected: U,
	colorNeutralForeground2BrandHover: e[100],
	colorNeutralForeground2BrandPressed: e[90],
	colorNeutralForeground2BrandSelected: e[100],
	colorNeutralForeground3: H[68],
	colorNeutralForeground3Hover: H[84],
	colorNeutralForeground3Pressed: H[84],
	colorNeutralForeground3Selected: H[84],
	colorNeutralForeground3BrandHover: e[100],
	colorNeutralForeground3BrandPressed: e[90],
	colorNeutralForeground3BrandSelected: e[100],
	colorNeutralForeground4: H[60],
	colorNeutralForeground5: H[68],
	colorNeutralForeground5Hover: U,
	colorNeutralForeground5Pressed: U,
	colorNeutralForeground5Selected: U,
	colorNeutralForegroundDisabled: H[36],
	colorNeutralForegroundInvertedDisabled: Ks[40],
	colorBrandForegroundLink: e[100],
	colorBrandForegroundLinkHover: e[110],
	colorBrandForegroundLinkPressed: e[90],
	colorBrandForegroundLinkSelected: e[100],
	colorNeutralForeground2Link: H[84],
	colorNeutralForeground2LinkHover: U,
	colorNeutralForeground2LinkPressed: U,
	colorNeutralForeground2LinkSelected: U,
	colorCompoundBrandForeground1: e[100],
	colorCompoundBrandForeground1Hover: e[110],
	colorCompoundBrandForeground1Pressed: e[90],
	colorBrandForeground1: e[100],
	colorBrandForeground2: e[110],
	colorBrandForeground2Hover: e[130],
	colorBrandForeground2Pressed: e[160],
	colorNeutralForeground1Static: H[14],
	colorNeutralForegroundStaticInverted: U,
	colorNeutralForegroundInverted: H[14],
	colorNeutralForegroundInvertedHover: H[14],
	colorNeutralForegroundInvertedPressed: H[14],
	colorNeutralForegroundInvertedSelected: H[14],
	colorNeutralForegroundInverted2: H[14],
	colorNeutralForegroundOnBrand: U,
	colorNeutralForegroundInvertedLink: U,
	colorNeutralForegroundInvertedLinkHover: U,
	colorNeutralForegroundInvertedLinkPressed: U,
	colorNeutralForegroundInvertedLinkSelected: U,
	colorBrandForegroundInverted: e[80],
	colorBrandForegroundInvertedHover: e[70],
	colorBrandForegroundInvertedPressed: e[60],
	colorBrandForegroundOnLight: e[80],
	colorBrandForegroundOnLightHover: e[70],
	colorBrandForegroundOnLightPressed: e[50],
	colorBrandForegroundOnLightSelected: e[60],
	colorNeutralBackground1: H[16],
	colorNeutralBackground1Hover: H[24],
	colorNeutralBackground1Pressed: H[12],
	colorNeutralBackground1Selected: H[22],
	colorNeutralBackground2: H[12],
	colorNeutralBackground2Hover: H[20],
	colorNeutralBackground2Pressed: H[8],
	colorNeutralBackground2Selected: H[18],
	colorNeutralBackground3: H[8],
	colorNeutralBackground3Hover: H[16],
	colorNeutralBackground3Pressed: H[4],
	colorNeutralBackground3Selected: H[14],
	colorNeutralBackground4: H[4],
	colorNeutralBackground4Hover: H[12],
	colorNeutralBackground4Pressed: Zs,
	colorNeutralBackground4Selected: H[10],
	colorNeutralBackground5: Zs,
	colorNeutralBackground5Hover: H[8],
	colorNeutralBackground5Pressed: H[2],
	colorNeutralBackground5Selected: H[6],
	colorNeutralBackground6: H[20],
	colorNeutralBackground7: "#00000000",
	colorNeutralBackground7Hover: H[10],
	colorNeutralBackground7Pressed: H[4],
	colorNeutralBackground7Selected: "#00000000",
	colorNeutralBackground8: H[16],
	colorNeutralBackgroundInverted: U,
	colorNeutralBackgroundInvertedHover: H[96],
	colorNeutralBackgroundInvertedPressed: H[88],
	colorNeutralBackgroundInvertedSelected: H[92],
	colorNeutralBackgroundStatic: H[24],
	colorNeutralBackgroundAlpha: Js[50],
	colorNeutralBackgroundAlpha2: Ys[70],
	colorSubtleBackground: "transparent",
	colorSubtleBackgroundHover: H[22],
	colorSubtleBackgroundPressed: H[18],
	colorSubtleBackgroundSelected: H[20],
	colorSubtleBackgroundLightAlphaHover: Xs[80],
	colorSubtleBackgroundLightAlphaPressed: Xs[50],
	colorSubtleBackgroundLightAlphaSelected: "transparent",
	colorSubtleBackgroundInverted: "transparent",
	colorSubtleBackgroundInvertedHover: qs[10],
	colorSubtleBackgroundInvertedPressed: qs[30],
	colorSubtleBackgroundInvertedSelected: qs[20],
	colorTransparentBackground: "transparent",
	colorTransparentBackgroundHover: "transparent",
	colorTransparentBackgroundPressed: "transparent",
	colorTransparentBackgroundSelected: "transparent",
	colorNeutralBackgroundDisabled: H[8],
	colorNeutralBackgroundDisabled2: H[16],
	colorNeutralBackgroundInvertedDisabled: Ks[10],
	colorNeutralStencil1: H[34],
	colorNeutralStencil2: H[20],
	colorNeutralStencil1Alpha: Ks[10],
	colorNeutralStencil2Alpha: Ks[5],
	colorBackgroundOverlay: qs[50],
	colorScrollbarOverlay: Ks[60],
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
	colorBrandBackgroundInverted: U,
	colorBrandBackgroundInvertedHover: e[160],
	colorBrandBackgroundInvertedPressed: e[140],
	colorBrandBackgroundInvertedSelected: e[150],
	colorNeutralCardBackground: H[20],
	colorNeutralCardBackgroundHover: H[24],
	colorNeutralCardBackgroundPressed: H[18],
	colorNeutralCardBackgroundSelected: H[22],
	colorNeutralCardBackgroundDisabled: H[8],
	colorNeutralStrokeAccessible: H[68],
	colorNeutralStrokeAccessibleHover: H[74],
	colorNeutralStrokeAccessiblePressed: H[70],
	colorNeutralStrokeAccessibleSelected: e[100],
	colorNeutralStroke1: H[40],
	colorNeutralStroke1Hover: H[46],
	colorNeutralStroke1Pressed: H[42],
	colorNeutralStroke1Selected: H[44],
	colorNeutralStroke2: H[32],
	colorNeutralStroke3: H[24],
	colorNeutralStroke4: H[24],
	colorNeutralStroke4Hover: H[18],
	colorNeutralStroke4Pressed: H[14],
	colorNeutralStroke4Selected: H[24],
	colorNeutralStrokeSubtle: H[4],
	colorNeutralStrokeOnBrand: H[16],
	colorNeutralStrokeOnBrand2: U,
	colorNeutralStrokeOnBrand2Hover: U,
	colorNeutralStrokeOnBrand2Pressed: U,
	colorNeutralStrokeOnBrand2Selected: U,
	colorBrandStroke1: e[100],
	colorBrandStroke2: e[50],
	colorBrandStroke2Hover: e[50],
	colorBrandStroke2Pressed: e[30],
	colorBrandStroke2Contrast: e[50],
	colorCompoundBrandStroke: e[100],
	colorCompoundBrandStrokeHover: e[110],
	colorCompoundBrandStrokePressed: e[90],
	colorNeutralStrokeDisabled: H[26],
	colorNeutralStrokeDisabled2: H[24],
	colorNeutralStrokeInvertedDisabled: Ks[40],
	colorTransparentStroke: "transparent",
	colorTransparentStrokeInteractive: "transparent",
	colorTransparentStrokeDisabled: "transparent",
	colorNeutralStrokeAlpha: Ks[10],
	colorNeutralStrokeAlpha2: Ks[20],
	colorStrokeFocus1: Zs,
	colorStrokeFocus2: U,
	colorNeutralShadowAmbient: "rgba(0,0,0,0.24)",
	colorNeutralShadowKey: "rgba(0,0,0,0.28)",
	colorNeutralShadowAmbientLighter: "rgba(0,0,0,0.12)",
	colorNeutralShadowKeyLighter: "rgba(0,0,0,0.14)",
	colorNeutralShadowAmbientDarker: "rgba(0,0,0,0.40)",
	colorNeutralShadowKeyDarker: "rgba(0,0,0,0.48)",
	colorBrandShadowAmbient: "rgba(0,0,0,0.30)",
	colorBrandShadowKey: "rgba(0,0,0,0.25)"
}), ll = ((e) => {
	let t = cl(e);
	return {
		...Uc,
		...Kc,
		...qc,
		...Yc,
		...Jc,
		...$c,
		...Zc,
		...Qc,
		...Gc,
		...Wc,
		...t,
		...al,
		...ol,
		...el(t.colorNeutralShadowAmbient, t.colorNeutralShadowKey),
		...el(t.colorBrandShadowAmbient, t.colorBrandShadowKey, "Brand")
	};
})(nl), ul = { root: "fui-FluentProvider" }, dl = /*#__PURE__*/ Fn({ root: {
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
] }), fl = (e) => {
	let t = Hn(), n = dl({
		dir: e.dir,
		renderer: t
	});
	return e.root.className = A(ul.root, e.themeClassName, n.root, e.root.className), e;
}, pl = P.useInsertionEffect ? P.useInsertionEffect : Si, ml = (e, t) => {
	if (!e?.head) return;
	let n = e.createElement("style");
	return Object.keys(t).forEach((e) => {
		n.setAttribute(e, t[e]);
	}), e.head.appendChild(n), n;
}, hl = (e, t) => {
	let n = e.sheet;
	n && (n.cssRules.length > 0 && n.deleteRule(0), n.insertRule(t, 0));
}, gl = (e) => {
	let { targetDocument: t, theme: n, rendererAttributes: r } = e, i = P.useRef(void 0), a = Di(ul.root), o = r, s = P.useMemo(() => Xn(`.${a}`, n), [n, a]);
	return _l(t, a), pl(() => {
		let e = t?.getElementById(a);
		return e ? i.current = e : (i.current = ml(t, {
			...o,
			id: a
		}), i.current && hl(i.current, s)), () => {
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
function _l(e, t) {
	P.useState(() => {
		if (!e) return;
		let n = e.getElementById(t);
		n && e.head.append(n);
	});
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/useFluentProvider.js
var vl = {}, yl = {}, bl = (e, t) => {
	let n = Qr(), r = Sl(), i = ti(), a = P.useContext(ni) || vl, { applyStylesToPortals: o = !0, customStyleHooks_unstable: s, dir: c = n.dir, targetDocument: l = n.targetDocument, theme: u, overrides_unstable: d = {} } = e, f = xl(r, u), p = xl(i, d), m = xl(a, s), h = Hn(), { styleTagId: g, rule: _ } = gl({
		theme: f,
		targetDocument: l,
		rendererAttributes: h.styleElementAttributes ?? yl
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
		root: er(Ir("div", {
			...e,
			dir: c,
			ref: Oi(t, Rs({ targetDocument: l }))
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
function xl(e, t) {
	return e && t ? {
		...e,
		...t
	} : e || t;
}
function Sl() {
	return P.useContext(zr);
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/useFluentProviderContextValues.js
function Cl(e) {
	let { applyStylesToPortals: t, customStyleHooks_unstable: n, dir: r, root: i, targetDocument: a, theme: o, themeClassName: s, overrides_unstable: c } = e, l = P.useMemo(() => ({
		dir: r,
		targetDocument: a
	}), [r, a]), [u] = P.useState(() => ({}));
	return {
		customStyleHooks_unstable: n,
		overrides_unstable: c,
		provider: l,
		textDirection: r,
		iconDirection: P.useMemo(() => ({ textDirection: r }), [r]),
		tooltip: u,
		theme: o,
		themeClassName: t ? i.className : s
	};
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/FluentProvider.js
var wl = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = bl(e, t);
	return fl(n), sa(n, Cl(n));
});
wl.displayName = "FluentProvider";
//#endregion
//#region node_modules/@fluentui/react-context-selector/lib/createContext.js
var Tl = d(), El = (e) => (t) => {
	let n = P.useRef(t.value), r = P.useRef(null);
	return r.current ||= {
		value: n,
		listeners: []
	}, Si(() => {
		n.current = t.value, (0, Tl.unstable_runWithPriority)(Tl.unstable_NormalPriority, () => {
			r.current.listeners.forEach((e) => {
				e(t.value);
			});
		});
	}, [t.value]), P.createElement(e, { value: r.current }, t.children);
}, Dl = (e) => {
	let t = P.createContext({
		value: { current: e },
		listeners: [],
		isDefault: !0
	});
	return t.Provider = El(t.Provider), delete t.Consumer, t;
}, Ol = (e, t) => {
	let { value: n, listeners: r } = P.useContext(e), i = t(n.current), [, a] = P.useReducer((e) => e + 1, 0), o = P.useRef(t), s = P.useRef(i);
	return Si(() => {
		o.current = t, s.current = i;
	}), Si(() => {
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
function kl(e) {
	return !P.useContext(e).isDefault;
}
//#endregion
//#region node_modules/@fluentui/react-accordion/lib/contexts/accordion.js
var Al = Dl(void 0), jl = {
	openItems: [],
	collapsible: !1,
	multiple: !1,
	navigation: void 0,
	requestToggle() {}
}, { Provider: Ml } = Al, Nl = (e) => Ol(Al, (t = jl) => e(t)), Pl = (e, t) => /*#__PURE__*/ R(e.root, { children: /*#__PURE__*/ R(Ml, {
	value: t.accordion,
	children: e.root.children
}) }), Fl = (e, t) => {
	let { navigation: n, ...r } = e, i = Il(r, t), a = hs({
		circular: n === "circular",
		tabbable: !0
	});
	return {
		navigation: n,
		...i,
		root: {
			...i.root,
			...n ? a : void 0
		}
	};
}, Il = (e, t) => {
	let { openItems: n, defaultOpenItems: r, multiple: i = !1, collapsible: a = !1, onToggle: o, ...s } = e, [c, l] = mi({
		state: P.useMemo(() => zl(n), [n]),
		defaultState: r && (() => Ll({
			defaultOpenItems: r,
			multiple: i
		})),
		initialState: []
	});
	return {
		collapsible: a,
		multiple: i,
		openItems: c,
		requestToggle: L((e) => {
			let t = Rl(e.value, c, i, a);
			o?.(e.event, {
				value: e.value,
				openItems: t
			}), l(t);
		}),
		components: { root: "div" },
		root: er({
			ref: t,
			...s
		}, { elementType: "div" })
	};
};
function Ll({ defaultOpenItems: e, multiple: t }) {
	return e === void 0 ? [] : Array.isArray(e) ? t ? e : [e[0]] : [e];
}
function Rl(e, t, n, r) {
	if (n) {
		if (t.includes(e)) {
			if (t.length > 1 || r) return t.filter((t) => t !== e);
		} else return [...t, e].sort();
	} else return t[0] === e && r ? [] : [e];
	return t;
}
function zl(e) {
	if (e !== void 0) return Array.isArray(e) ? e : [e];
}
//#endregion
//#region node_modules/@fluentui/react-accordion/lib/components/Accordion/useAccordionContextValues.js
function Bl(e) {
	let { navigation: t, openItems: n, requestToggle: r, multiple: i, collapsible: a } = e;
	return { accordion: P.useMemo(() => ({
		navigation: t,
		openItems: n,
		requestToggle: r,
		collapsible: a,
		multiple: i
	}), [
		t,
		n,
		r,
		a,
		i
	]) };
}
//#endregion
//#region node_modules/@fluentui/react-accordion/lib/components/Accordion/useAccordionStyles.styles.js
var Vl = { root: "fui-Accordion" }, Hl = (e) => (e.root.className = A(Vl.root, e.root.className), e), Ul = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = Fl(e, t), r = Bl(n);
	return Hl(n), ai("useAccordionStyles_unstable")(n), Pl(n, r);
});
Ul.displayName = "Accordion";
//#endregion
//#region node_modules/@fluentui/react-accordion/lib/components/AccordionItem/useAccordionItem.js
var Wl = (e, t) => {
	let { value: n, disabled: r = !1, ...i } = e, a = Nl((e) => e.requestToggle);
	return {
		open: Nl((e) => e.openItems.includes(n)),
		value: n,
		disabled: r,
		onHeaderClick: L((e) => a({
			event: e,
			value: n
		})),
		components: { root: "div" },
		root: er({
			disabled: r,
			ref: t,
			...i
		}, { elementType: "div" })
	};
};
//#endregion
//#region node_modules/@fluentui/react-accordion/lib/components/AccordionItem/useAccordionItemContextValues.js
function Gl(e) {
	let { disabled: t, open: n, value: r, onHeaderClick: i } = e;
	return { accordionItem: P.useMemo(() => ({
		disabled: t,
		open: n,
		value: r,
		onHeaderClick: i
	}), [
		t,
		n,
		r,
		i
	]) };
}
//#endregion
//#region node_modules/@fluentui/react-accordion/lib/contexts/accordionItem.js
var Kl = P.createContext(void 0), ql = {
	open: !1,
	disabled: !1,
	value: void 0,
	onHeaderClick() {}
}, { Provider: Jl } = Kl, Yl = () => P.useContext(Kl) ?? ql, Xl = (e, t) => /*#__PURE__*/ R(e.root, { children: /*#__PURE__*/ R(Jl, {
	value: t.accordionItem,
	children: e.root.children
}) }), Zl = { root: "fui-AccordionItem" }, Ql = (e) => (e.root.className = A(Zl.root, e.root.className), e), $l = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = Wl(e, t), r = Gl(n);
	return Ql(n), ai("useAccordionItemStyles_unstable")(n), Xl(n, r);
});
$l.displayName = "AccordionItem";
var eu = "ArrowLeft", tu = "ArrowRight";
//#endregion
//#region node_modules/@fluentui/react-aria/lib/button/useARIAButtonProps.js
function nu(e, t) {
	let { disabled: n, disabledFocusable: r = !1, "aria-disabled": i, onClick: a, onKeyDown: o, onKeyUp: s, ...c } = t ?? {}, l = typeof i == "string" ? i === "true" : i, u = n || r || l, d = L((e) => {
		u ? (e.preventDefault(), e.stopPropagation()) : a?.(e);
	}), f = L((e) => {
		if (o?.(e), e.isDefaultPrevented()) return;
		let t = e.key;
		u && (t === "Enter" || t === " ") ? (e.preventDefault(), e.stopPropagation()) : t === " " ? e.preventDefault() : t === "Enter" && (e.preventDefault(), e.currentTarget.click());
	}), p = L((e) => {
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
var ru = I({
	root: {
		mc9l5x: "f1w7gpdv",
		Bg96gwp: "fez10in"
	},
	rtl: { Bz10aip: "f13rod7r" }
}, { d: [
	".f1w7gpdv{display:inline;}",
	".fez10in{line-height:0;}",
	".f13rod7r{transform:scaleX(-1);}"
] }), iu = "fui-Icon", au = "fui-Icon-filled", ou = "fui-Icon-regular", su = "data-fui-icon", cu = (e, t) => {
	let { filled: n, idPrefix: r, title: i, primaryFill: a = "currentColor", ...o } = e, s = {
		...o,
		fill: a
	}, c = oa(), l = !!(t?.flipInRtl && c?.textDirection === "rtl");
	return i && (s["aria-label"] = i), !s["aria-label"] && !s["aria-labelledby"] ? s["aria-hidden"] = !0 : s.role = "img", s[su] = "", {
		state: s,
		isRtlFlip: l
	};
}, lu = (e, t) => {
	let n = ru(), { state: r, isRtlFlip: i } = cu(e, t);
	return r.className = A(n.root, i && n.rtl, r.className), r;
}, uu = I({ root: { B8gzw0y: "f1dd5bof" } }, { m: [["@media (forced-colors: active){.f1dd5bof{forced-color-adjust:auto;}}", { m: "(forced-colors: active)" }]] }), du = "url(#", fu = (e, t, n) => {
	let [r, i, ...a] = e, o = i;
	if (n && i) {
		let e = {};
		for (let t in i) {
			let r = i[t];
			if (typeof r != "string") e[t] = r;
			else if (t === "id") e[t] = n + r;
			else {
				let i = r.indexOf(du);
				e[t] = i < 0 ? r : r.slice(0, i + 5) + n + r.slice(i + 5);
			}
		}
		o = e;
	}
	return P.createElement(r, {
		...o,
		key: t
	}, ...a.map((e, t) => fu(e, t, n)));
}, pu = (e) => e === "1em" ? "20" : e, mu = (e, t, n) => typeof e != "string" && (t?.color || Array.isArray(e[0])) ? e.map((e, t) => fu(e, t, n)) : void 0, hu = () => void 0, gu = (e, t) => {
	let n = mu(e, t);
	return n ? function(r) {
		return P.useMemo(() => r ? mu(e, t, r) : n, [r]);
	} : hu;
}, _u = (e, t, n) => typeof t == "string" ? P.createElement("svg", {
	...e,
	dangerouslySetInnerHTML: { __html: t }
}) : n ? P.createElement("svg", e, ...n) : P.createElement("svg", e, ...t.map((t) => P.createElement("path", {
	d: t,
	fill: e.fill
}))), vu = (e, t, n, r) => {
	let i = pu(t), a = gu(n, r), o = P.forwardRef((e, o) => {
		let s = uu(), c = lu(e, { flipInRtl: r?.flipInRtl }), l = a(e.idPrefix);
		return _u({
			...c,
			className: A(iu, c.className, s.root),
			ref: o,
			width: t,
			height: t,
			viewBox: `0 0 ${i} ${i}`,
			xmlns: "http://www.w3.org/2000/svg"
		}, n, l);
	});
	return o.displayName = e, o;
}, yu = /*#__PURE__*/ vu("WarningFilled", "1em", ["M7.37 3.56a3 3 0 0 1 5.26 0l5.5 10A3 3 0 0 1 15.5 18h-11a3 3 0 0 1-2.63-4.44zM10 12.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5m0-6.25a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0V7a.5.5 0 0 0-.5-.5"]), bu = /*#__PURE__*/ vu("InfoFilled", "1em", ["M18 10a8 8 0 1 0-16 0 8 8 0 0 0 16 0M9.5 8.91a.5.5 0 0 1 1 0v4.69a.5.5 0 0 1-1 0V8.9m-.25-2.16a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0"]), xu = /*#__PURE__*/ vu("CheckmarkCircleFilled", "1em", ["M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16m3.36 5.65a.5.5 0 0 0-.64-.06l-.07.06L9 11.3 7.35 9.65l-.07-.06a.5.5 0 0 0-.7.7l.07.07 2 2 .07.06c.17.11.4.11.56 0l.07-.06 4-4 .07-.08a.5.5 0 0 0-.06-.63"]), Su = /*#__PURE__*/ vu("ChevronLeftFilled", "1em", ["M12.27 15.8a.75.75 0 0 1-1.06-.03l-5-5.25a.75.75 0 0 1 0-1.04l5-5.25a.75.75 0 1 1 1.08 1.04L7.8 10l4.5 4.73c.29.3.28.78-.02 1.06"]), Cu = /*#__PURE__*/ vu("ChevronLeftRegular", "1em", ["M12.35 15.85a.5.5 0 0 1-.7 0L6.16 10.4a.55.55 0 0 1 0-.78l5.49-5.46a.5.5 0 1 1 .7.7L7.2 10l5.16 5.15c.2.2.2.5 0 .7"]), wu = /*#__PURE__*/ vu("ChevronRightFilled", "1em", ["M7.73 4.2a.75.75 0 0 1 1.06.03l5 5.25c.28.3.28.75 0 1.04l-5 5.25a.75.75 0 1 1-1.08-1.04L12.2 10l-4.5-4.73a.75.75 0 0 1 .02-1.06"]), Tu = /*#__PURE__*/ vu("ChevronRightRegular", "1em", ["M7.65 4.15c.2-.2.5-.2.7 0l5.49 5.46c.21.22.21.57 0 .78l-5.49 5.47a.5.5 0 0 1-.7-.71L12.8 10 7.65 4.85a.5.5 0 0 1 0-.7"]), Eu = /*#__PURE__*/ vu("DiamondDismissFilled", "1em", ["M7.88 1.88a3 3 0 0 1 4.24 0l6 6a3 3 0 0 1 0 4.24l-6 6a3 3 0 0 1-4.24 0l-6-6a3 3 0 0 1 0-4.24zM13.1 6.9a.5.5 0 0 0-.7 0L10 9.3 7.6 6.9a.5.5 0 0 0-.7.7L9.3 10l-2.4 2.4a.5.5 0 0 0 .7.7l2.4-2.4 2.4 2.4a.5.5 0 0 0 .7-.7L10.7 10l2.4-2.4a.5.5 0 0 0 0-.7"]), Du = /*#__PURE__*/ vu("Search20Regular", "20", ["M13.73 14.44a6.5 6.5 0 1 1 .7-.7l3.42 3.4a.5.5 0 0 1-.63.77l-.07-.06zm-.71-.71A5.5 5.5 0 0 0 15 9.5a5.5 5.5 0 1 0-1.98 4.23"]), Ou = /*#__PURE__*/ vu("Water20Regular", "20", ["M15 4c.2 0 .4.13.47.32C15.9 5.5 16.74 6 17.5 6a.5.5 0 0 1 0 1c-.96 0-1.88-.5-2.5-1.41A3 3 0 0 1 12.5 7c-.96 0-1.88-.5-2.5-1.41A3 3 0 0 1 7.5 7C6.54 7 5.62 6.5 5 5.59A3 3 0 0 1 2.5 7a.5.5 0 1 1 0-1c.76 0 1.6-.5 2.03-1.67a.5.5 0 0 1 .94 0C5.9 5.5 6.74 6 7.5 6s1.6-.5 2.03-1.68a.5.5 0 0 1 .94 0C10.9 5.5 11.74 6 12.5 6s1.6-.5 2.03-1.68A.5.5 0 0 1 15 4m0 5c.2 0 .4.13.47.32C15.9 10.5 16.74 11 17.5 11a.5.5 0 0 1 0 1c-.96 0-1.88-.5-2.5-1.41A3 3 0 0 1 12.5 12c-.96 0-1.88-.5-2.5-1.41A3 3 0 0 1 7.5 12c-.96 0-1.88-.5-2.5-1.41A3 3 0 0 1 2.5 12a.5.5 0 0 1 0-1c.76 0 1.6-.5 2.03-1.67a.5.5 0 0 1 .94 0C5.9 10.5 6.74 11 7.5 11s1.6-.5 2.03-1.68a.5.5 0 0 1 .94 0C10.9 10.5 11.74 11 12.5 11s1.6-.5 2.03-1.68A.5.5 0 0 1 15 9m.47 5.32a.5.5 0 0 0-.94 0C14.1 15.5 13.26 16 12.5 16s-1.6-.5-2.03-1.68a.5.5 0 0 0-.94 0C9.1 15.5 8.26 16 7.5 16s-1.6-.5-2.03-1.68a.5.5 0 0 0-.94 0C4.1 15.5 3.26 16 2.5 16a.5.5 0 1 0 0 1c.96 0 1.88-.5 2.5-1.41A3 3 0 0 0 7.5 17c.96 0 1.88-.5 2.5-1.41A3 3 0 0 0 12.5 17c.96 0 1.88-.5 2.5-1.41A3 3 0 0 0 17.5 17a.5.5 0 0 0 0-1c-.76 0-1.6-.5-2.03-1.68"]), ku = /*#__PURE__*/ vu("Settings16Regular", "16", ["M8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4M7 8a1 1 0 1 1 2 0 1 1 0 0 1-2 0m3.62-3.6a.7.7 0 0 1-.83-.57l-.26-1.42a.4.4 0 0 0-.27-.28 6 6 0 0 0-2.52 0 .4.4 0 0 0-.27.29L6.2 3.83l-.03.11a.7.7 0 0 1-.9.43L3.9 3.88a.4.4 0 0 0-.38.1q-.86.96-1.26 2.17-.06.23.1.38l1.1.93a.7.7 0 0 1 0 1.08l-1.1.93q-.16.16-.1.38.4 1.21 1.26 2.17.17.16.38.1l1.36-.49.11-.03a.7.7 0 0 1 .83.57l.26 1.41q.05.23.27.29a6 6 0 0 0 2.52 0 .4.4 0 0 0 .27-.29l.26-1.41.03-.11a.7.7 0 0 1 .9-.43l1.37.49q.21.06.38-.1.86-.96 1.26-2.17a.4.4 0 0 0-.1-.38l-1.1-.93-.09-.08a.7.7 0 0 1 .08-1l1.1-.93q.18-.16.11-.38-.4-1.21-1.26-2.17a.4.4 0 0 0-.38-.1l-1.36.49zM4 4.98l.94.33a1.7 1.7 0 0 0 2.25-1.3l.18-.97a5 5 0 0 1 1.26 0l.18.97a1.7 1.7 0 0 0 2.25 1.3l.94-.33q.39.5.63 1.08l-.75.64a1.7 1.7 0 0 0 0 2.6l.75.64q-.24.59-.63 1.08l-.94-.33a1.7 1.7 0 0 0-2.25 1.3l-.18.97a5 5 0 0 1-1.26 0l-.18-.97a1.7 1.7 0 0 0-2.25-1.3l-.94.33q-.39-.5-.63-1.08l.75-.64a1.7 1.7 0 0 0 0-2.6l-.75-.64q.24-.58.63-1.08"]), Au = /*#__PURE__*/ vu("Settings20Regular", "20", ["M1.91 7.38A8.5 8.5 0 0 1 3.7 4.3a.5.5 0 0 1 .54-.13l1.92.68a1 1 0 0 0 1.32-.76l.36-2a.5.5 0 0 1 .4-.4 9 9 0 0 1 3.55 0q.32.08.38.4l.37 2a1 1 0 0 0 1.32.76l1.92-.68a.5.5 0 0 1 .54.13 8.5 8.5 0 0 1 1.78 3.08q.08.31-.15.54l-1.56 1.32a1 1 0 0 0 0 1.52l1.56 1.32a.5.5 0 0 1 .15.54 8.5 8.5 0 0 1-1.78 3.08.5.5 0 0 1-.54.13l-1.92-.68a1 1 0 0 0-1.32.76l-.37 2a.5.5 0 0 1-.38.4 8.5 8.5 0 0 1-3.56 0 .5.5 0 0 1-.39-.4l-.36-2a1 1 0 0 0-1.32-.76l-1.92.68a.5.5 0 0 1-.54-.13 8.5 8.5 0 0 1-1.78-3.08.5.5 0 0 1 .15-.54l1.56-1.32a1 1 0 0 0 0-1.52L2.06 7.92a.5.5 0 0 1-.15-.54m1.06 0 1.3 1.1a2 2 0 0 1 0 3.04l-1.3 1.1q.45 1.19 1.25 2.16l1.6-.58a2 2 0 0 1 2.63 1.53l.3 1.67a8 8 0 0 0 2.5 0l.3-1.67a2 2 0 0 1 2.64-1.53l1.6.58a8 8 0 0 0 1.24-2.16l-1.3-1.1a2 2 0 0 1 0-3.04l1.3-1.1a8 8 0 0 0-1.25-2.16l-1.6.58a2 2 0 0 1-2.63-1.53l-.3-1.67a8 8 0 0 0-2.5 0l-.3 1.67A2 2 0 0 1 5.81 5.8l-1.6-.58a8 8 0 0 0-1.24 2.16M7.5 10a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0m1 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"]), ju = /*#__PURE__*/ vu("WeatherSunny24Regular", "24", ["M12 2c.41 0 .75.34.75.75v1.5a.75.75 0 0 1-1.5 0v-1.5c0-.41.34-.75.75-.75m0 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10m0-1.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7m9.25-2.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5zM12 19c.41 0 .75.34.75.75v1.5a.75.75 0 0 1-1.5 0v-1.5c0-.41.34-.75.75-.75m-7.75-6.25a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5zm-.03-8.53c.3-.3.77-.3 1.06 0l1.5 1.5a.75.75 0 0 1-1.06 1.06l-1.5-1.5a.75.75 0 0 1 0-1.06m1.06 15.56a.75.75 0 1 1-1.06-1.06l1.5-1.5a.75.75 0 1 1 1.06 1.06zm14.5-15.56a.75.75 0 0 0-1.06 0l-1.5 1.5a.75.75 0 0 0 1.06 1.06l1.5-1.5c.3-.3.3-.77 0-1.06m-1.06 15.56a.75.75 0 1 0 1.06-1.06l-1.5-1.5a.75.75 0 1 0-1.06 1.06z"]), Mu = /*#__PURE__*/ vu("Location16Regular", "16", ["M8 1a6 6 0 0 1 6 6c0 2.87-3.1 6.02-4.84 7.56-.67.59-1.65.59-2.32 0C5.1 13.02 2 9.87 2 7a6 6 0 0 1 6-6m0 1a5 5 0 0 0-5 5c0 1.1.61 2.4 1.57 3.68a21 21 0 0 0 2.93 3.13c.3.25.7.25 1 0 .84-.75 2-1.87 2.93-3.13C12.4 9.4 13 8.11 13 7a5 5 0 0 0-5-5m0 2.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5m0 1a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5"]), Nu = /*#__PURE__*/ vu("Location20Regular", "20", ["M5.05 4.05a7 7 0 1 1 9.9 9.9l-1.13 1.12-2.43 2.37a2 2 0 0 1-2.64.12l-.14-.12-2.04-1.99-1.52-1.5a7 7 0 0 1 0-9.9m9.2.7a6 6 0 0 0-8.67 8.32l.17.18.58.57 2.98 2.9.09.08a1 1 0 0 0 1.2 0l.1-.08 2.22-2.17 1.32-1.3.18-.18a6 6 0 0 0-.18-8.31M10 6.26a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5m0 1a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5"]), Pu = /*#__PURE__*/ vu("ArrowClockwise20Regular", "20", ["M4 10a6 6 0 0 1 10.47-4H12.5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-1 0v1.6a7 7 0 1 0 1.98 4.36.5.5 0 1 0-1 .08L16 10a6 6 0 0 1-12 0"]), Fu = /*#__PURE__*/ vu("ArrowLeft24Regular", "24", ["M10.73 19.8a.75.75 0 0 0 1.04-1.1l-6.25-5.95h14.73a.75.75 0 0 0 0-1.5H5.52l6.25-5.95a.75.75 0 0 0-1.04-1.1l-7.42 7.08a1 1 0 0 0 0 1.44z"]), Iu = /*#__PURE__*/ vu("Key20Regular", "20", ["M15 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-2.5-4a5.45 5.45 0 0 0-5.38 6.67q.08.42-.14.64l-4.54 4.54A1.5 1.5 0 0 0 2 14.91v1.59c0 .83.67 1.5 1.5 1.5h2c.83 0 1.5-.67 1.5-1.5V16h1a1 1 0 0 0 1-1v-1h1a1 1 0 0 0 1-1v-.18q.75.19 1.5.18c3.08 0 5.5-2.42 5.5-5.5S15.58 2 12.5 2M8 7.5C8 4.98 9.98 3 12.5 3S17 4.98 17 7.5 15.02 12 12.5 12q-1 .01-1.78-.35a.5.5 0 0 0-.72.45v.9H9a1 1 0 0 0-1 1v1H7a1 1 0 0 0-1 1v.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.59a.5.5 0 0 1 .15-.35l4.54-4.54c.43-.43.52-1.04.4-1.56Q8 8 8 7.5"]), Lu = /*#__PURE__*/ vu("Checkmark16Filled", "16", ["M14.05 3.49c.28.3.27.77-.04 1.06l-7.93 7.47A.85.85 0 0 1 4.9 12L2.22 9.28a.75.75 0 1 1 1.06-1.06l2.24 2.27 7.47-7.04a.75.75 0 0 1 1.06.04"]), Ru = /*#__PURE__*/ vu("ChevronDown16Regular", "16", ["M3.15 5.65c.2-.2.5-.2.7 0L8 9.79l4.15-4.14a.5.5 0 0 1 .7.7l-4.5 4.5a.5.5 0 0 1-.7 0l-4.5-4.5a.5.5 0 0 1 0-.7"]), zu = /*#__PURE__*/ vu("Delete20Regular", "20", ["M8.5 4h3a1.5 1.5 0 0 0-3 0m-1 0a2.5 2.5 0 0 1 5 0h5a.5.5 0 0 1 0 1h-1.05l-1.2 10.34A3 3 0 0 1 12.27 18H7.73a3 3 0 0 1-2.98-2.66L3.55 5H2.5a.5.5 0 0 1 0-1zM5.74 15.23A2 2 0 0 0 7.73 17h4.54a2 2 0 0 0 1.99-1.77L15.44 5H4.56zM8.5 7.5c.28 0 .5.22.5.5v6a.5.5 0 0 1-1 0V8c0-.28.22-.5.5-.5M12 8a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"]), Bu = I({
	root: { mc9l5x: "fjseox" },
	visible: { mc9l5x: "f1w7gpdv" }
}, { d: [".fjseox{display:none;}", ".f1w7gpdv{display:inline;}"] }), Vu = (e, t) => {
	let n = (n) => {
		let { className: r, filled: i, ...a } = n, o = Bu();
		return P.createElement(P.Fragment, null, P.createElement(e, Object.assign({}, a, { className: A(o.root, i && o.visible, au, r) })), P.createElement(t, Object.assign({}, a, { className: A(o.root, !i && o.visible, ou, r) })));
	};
	return n.displayName = "CompoundIcon", n;
}, Hu = {
	durationUltraFast: 50,
	durationFaster: 100,
	durationFast: 150,
	durationNormal: 200,
	durationGentle: 250,
	durationSlow: 300,
	durationSlower: 400,
	durationUltraSlow: 500
}, Uu = {
	curveAccelerateMax: "cubic-bezier(0.9,0.1,1,0.2)",
	curveAccelerateMid: "cubic-bezier(1,0,1,1)",
	curveAccelerateMin: "cubic-bezier(0.8,0,0.78,1)",
	curveDecelerateMax: "cubic-bezier(0.1,0.9,0.2,1)",
	curveDecelerateMid: "cubic-bezier(0,0,0,1)",
	curveDecelerateMin: "cubic-bezier(0.33,0,0.1,1)",
	curveEasyEaseMax: "cubic-bezier(0.8,0,0.2,1)",
	curveEasyEase: "cubic-bezier(0.33,0,0.67,1)",
	curveLinear: "cubic-bezier(0,0,1,1)"
}, q = {
	...Hu,
	...Uu
};
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/isAnimationRunning.js
function Wu(e) {
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
var Gu = { fill: "forwards" }, Ku = { duration: 1 };
function qu(e) {
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
			return e.some((e) => Wu(e));
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
function Ju() {
	let e = typeof window < "u" && typeof window.Animation?.prototype.persist == "function";
	return P.useCallback((t, n, r) => {
		let i = Array.isArray(n) ? n : [n], { isReducedMotion: a } = r;
		return qu(i.map((n) => {
			let { keyframes: r, reducedMotion: i = Ku, ...o } = n, { keyframes: s = r, ...c } = i, l = a ? s : r, u = {
				...Gu,
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
function Yu() {
	return Ju();
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useMotionImperativeRef.js
function Xu(e) {
	let t = P.useRef(void 0);
	return P.useImperativeHandle(e, () => ({
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
var Zu = "screen and (prefers-reduced-motion: reduce)";
function Qu() {
	let { targetDocument: e } = Qr(), t = e?.defaultView ?? null, n = P.useRef(!1), r = P.useCallback(() => n.current, []);
	return Si(() => {
		if (t === null || typeof t.matchMedia != "function") return;
		let e = t.matchMedia(Zu);
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
var $u = [
	"@fluentui/react-motion: Invalid child element.",
	"\n",
	"Motion factories require a single child element to be passed. ",
	"That element element should support ref forwarding i.e. it should be either an intrinsic element (e.g. div) or a component that uses React.forwardRef()."
].join("");
function J(e, t = !0) {
	let n = P.useRef(null);
	P.useEffect(() => {}, [t]);
	try {
		let t = P.Children.only(e);
		if (P.isValidElement(t)) return [P.cloneElement(t, { ref: Oi(n, zi(t)) }), n];
	} catch {}
	throw Error($u);
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/contexts/MotionBehaviourContext.js
var Y = P.createContext(void 0);
Y.Provider;
var ed = () => P.useContext(Y) ?? "default", td = Symbol("MOTION_DEFINITION");
function nd(e) {
	return Object.assign((t) => {
		let { children: n, imperativeRef: r, onMotionFinish: i, onMotionStart: a, onMotionCancel: o, replayKey: s, ...c } = t, l = c, [u, d] = J(n), f = Xu(r), p = P.useRef(!0), m = ed() === "skip", h = P.useRef({
			skipMotions: m,
			params: l
		}), g = Yu(), _ = Qu(), v = L(() => {
			a?.(null);
		}), y = L(() => {
			i?.(null);
		}), b = L(() => {
			o?.(null);
		}), x = P.useCallback((e) => {
			v(), e.setMotionEndCallbacks(y, b), h.current.skipMotions && e.finish();
		}, [
			v,
			y,
			b
		]);
		return Si(() => {
			h.current = {
				skipMotions: m,
				params: l
			};
		}), Si(() => {
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
		]), Si(() => {
			if (p.current) return;
			let e = f.current;
			e && (e.cancel(), e.play(), x(e));
		}, [s]), Si(() => (p.current = !1, () => {
			p.current = !0;
		}), []), u;
	}, { [td]: typeof e == "function" ? e : () => e });
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/contexts/PresenceGroupChildContext.js
var rd = P.createContext(void 0);
rd.Provider;
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useMountedState.js
function id(e = !1, t = !1) {
	let n = P.useRef(!t || e), r = wi(), i = P.useCallback((e) => {
		n.current !== e && (n.current = e, r());
	}, [r]);
	return P.useEffect(() => {
		e && (n.current = e);
	}), [e || n.current, i];
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/factories/createPresenceComponent.js
var ad = Symbol("PRESENCE_MOTION_DEFINITION"), od = Symbol.for("interruptablePresence");
function sd(e) {
	return Object.assign((t) => {
		let n = {
			...P.useContext(rd),
			...t
		}, r = ed() === "skip", { appear: i, children: a, imperativeRef: o, onExit: s, onMotionFinish: c, onMotionStart: l, onMotionCancel: u, visible: d, unmountOnExit: f, ...p } = n, m = p, [h, g] = id(d, f), [_, v] = J(a, h), y = Xu(o), b = P.useRef({
			appear: i,
			params: m,
			skipMotions: r
		}), x = Yu(), S = Ci(), C = Qu(), w = L((e) => {
			l?.(null, { direction: e });
		}), T = L((e) => {
			c?.(null, { direction: e }), e === "exit" && f && (g(!1), s?.());
		}), E = L((e) => {
			u?.(null, { direction: e });
		});
		return Si(() => {
			b.current = {
				appear: i,
				params: m,
				skipMotions: r
			};
		}), Si(() => {
			let t = v.current;
			if (!t) return;
			let n;
			function r() {
				n && (a && n.isRunning() || (n.cancel(), y.current = void 0));
			}
			let i = typeof e == "function" ? e({
				element: t,
				...b.current.params
			}) : e, a = i[od];
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
		]), P.useEffect(() => {
			if (f && !h) {
				var e;
				(e = y.current) == null || e.dispose();
			}
		}, [
			y,
			f,
			h
		]), h ? _ : null;
	}, { [ad]: typeof e == "function" ? e : () => e }, {
		In: nd(typeof e == "function" ? (...t) => e(...t).enter : e.enter),
		Out: nd(typeof e == "function" ? (...t) => e(...t).exit : e.exit)
	});
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/factories/createPresenceComponentVariant.js
function cd(e, t) {
	return (n) => e({
		...t,
		...n
	});
}
function ld(e, t) {
	let n = e[ad];
	return sd(cd(n, t));
}
//#endregion
//#region node_modules/@swc/helpers/esm/_define_property.js
function ud(e, t, n) {
	return t in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/groups/mergeChildMappings.js
function dd(e, t) {
	function n(n) {
		return n in t ? t[n] : e[n];
	}
	let r = {}, i = [];
	for (let n in e) n in t ? i.length && (r[n] = i, i = []) : i.push(n);
	let a = {};
	for (let e in t) {
		if (r[e]) for (let t of r[e]) a[t] = n(t);
		a[e] = n(e);
	}
	for (let e of i) a[e] = n(e);
	return a;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/groups/getNextChildMapping.js
function fd(e, t) {
	let n = dd(e, t);
	return Object.entries(n).forEach(([r, i]) => {
		let a = r in e;
		if (r in t) {
			if (a) {
				n[r] = { ...i };
				return;
			}
			n[r] = {
				...i,
				appear: !0,
				visible: !0
			};
		} else n[r] = {
			...i,
			visible: !1
		};
	}), n;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/groups/getChildMapping.js
function pd(e) {
	let t = {};
	return e && P.Children.toArray(e).forEach((e) => {
		P.isValidElement(e) && (t[e.key ?? ""] = {
			appear: !1,
			element: e,
			visible: !0,
			unmountOnExit: !0
		});
	}), t;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/components/PresenceGroupItemProvider.js
var md = (e) => {
	let { appear: t, childKey: n, onExit: r, visible: i, unmountOnExit: a } = e, o = P.useMemo(() => ({
		appear: t,
		visible: i,
		onExit: () => r(n),
		unmountOnExit: a
	}), [
		t,
		n,
		r,
		i,
		a
	]);
	return /*#__PURE__*/ P.createElement(rd.Provider, { value: o }, e.children);
}, hd = class extends P.Component {
	static getDerivedStateFromProps(e, { childMapping: t, firstRender: n }) {
		let r = pd(e.children);
		return {
			childMapping: n ? r : fd(t, r),
			firstRender: !1
		};
	}
	componentDidMount() {
		this.mounted = !0;
	}
	componentWillUnmount() {
		this.mounted = !1;
	}
	render() {
		return /*#__PURE__*/ P.createElement(P.Fragment, null, Object.entries(this.state.childMapping).map(([e, t]) => /*#__PURE__*/ P.createElement(md, {
			...t,
			childKey: e,
			key: e,
			onExit: this.handleExit
		}, t.element)));
	}
	constructor(e, t) {
		super(e, t), ud(this, "mounted", !1), ud(this, "handleExit", (e) => {
			e in pd(this.props.children) || this.mounted && this.setState((t) => {
				let n = { ...t.childMapping };
				return delete n[e], { childMapping: n };
			});
		}), this.state = {
			childMapping: {},
			firstRender: !0
		};
	}
}, gd = /*#__PURE__*/ P.createContext(void 0);
function _d() {
	return P.useContext(gd);
}
var vd = /*#__PURE__*/ P.forwardRef((e, t) => /*#__PURE__*/ P.createElement(gd.Provider, { value: t }, e.children));
vd.displayName = "MotionRefForwarder";
//#endregion
//#region node_modules/@fluentui/react-motion/lib/slots/presenceMotionSlot.js
function yd(e, t) {
	let { as: n, children: r, ...i } = e ?? {};
	if (e === null) {
		let e = !t.defaultProps.visible && t.defaultProps.unmountOnExit, n = (t, n) => e ? null : /*#__PURE__*/ P.createElement(P.Fragment, null, n.children);
		return {
			[Zn]: n,
			[Qn]: t.elementType
		};
	}
	let a = {
		...t.defaultProps,
		...i,
		[Qn]: t.elementType
	};
	return typeof r == "function" && (a[Zn] = r), a;
}
//#endregion
//#region node_modules/@fluentui/react-accordion/lib/components/AccordionHeader/useAccordionHeader.js
var bd = (e, t) => {
	let { inline: n = !1, size: r = "medium", ...i } = e, a = xd(i, t), { dir: o } = Qr(), s;
	if (s = a.expandIconPosition === "end" ? a.open ? -90 : 90 : a.open ? 90 : o === "rtl" ? 180 : 0, a.expandIcon) {
		var c;
		(c = a.expandIcon).children ?? (c.children = /*#__PURE__*/ P.createElement(Tu, { style: {
			transform: `rotate(${s}deg)`,
			transition: `transform ${q.durationNormal}ms ease-out`
		} }));
	}
	return {
		...a,
		inline: n,
		size: r
	};
}, xd = (e, t) => {
	let { icon: n, button: r, expandIcon: i, expandIconPosition: a = "start", ...o } = e, { value: s, disabled: c, open: l } = Yl(), u = Nl((e) => e.requestToggle), d = er(r, {
		elementType: "button",
		defaultProps: {
			disabled: c,
			disabledFocusable: Nl((e) => !e.collapsible && e.openItems.length === 1 && l),
			"aria-expanded": l,
			type: "button"
		}
	});
	return d.onClick = L((e) => {
		if (ir(r)) {
			var t;
			(t = r.onClick) == null || t.call(r, e);
		}
		e.defaultPrevented || u({
			value: s,
			event: e
		});
	}), {
		disabled: c,
		open: l,
		expandIconPosition: a,
		components: {
			root: "div",
			button: "button",
			expandIcon: "span",
			icon: "div"
		},
		root: er({
			ref: t,
			...o
		}, { elementType: "div" }),
		icon: tr(n, { elementType: "div" }),
		expandIcon: tr(i, {
			renderByDefault: !0,
			defaultProps: { "aria-hidden": !0 },
			elementType: "span"
		}),
		button: nu(d.as, d)
	};
}, { Provider: Sd } = P.createContext(void 0), Cd = (e, t) => /*#__PURE__*/ R(Sd, {
	value: t.accordionHeader,
	children: /*#__PURE__*/ R(e.root, { children: /*#__PURE__*/ ra(e.button, { children: [
		e.expandIconPosition === "start" && e.expandIcon && /*#__PURE__*/ R(e.expandIcon, {}),
		e.icon && /*#__PURE__*/ R(e.icon, {}),
		e.root.children,
		e.expandIconPosition === "end" && e.expandIcon && /*#__PURE__*/ R(e.expandIcon, {})
	] }) })
}), wd = {
	root: "fui-AccordionHeader",
	button: "fui-AccordionHeader__button",
	expandIcon: "fui-AccordionHeader__expandIcon",
	icon: "fui-AccordionHeader__icon"
}, Td = /*#__PURE__*/ I({
	resetButton: {
		B7ck84d: "f1e4lqlz",
		De3pzq: "f1u2r49w",
		sj55zd: "f1ym3bx4",
		Bahqtrf: "f1mo0ibp",
		Be2twd7: "fjoy568",
		Bg96gwp: "fytdu2e",
		B68tc82: 0,
		Bmxbyg5: 0,
		Bpg54ce: "f1gl81tg",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1mk8lai",
		Bv0vk6g: "f37px4s",
		fsow6f: "fgusgyc"
	},
	focusIndicator: {
		Brovlpu: "ftqa4ok",
		B486eqv: "f2hkw1w",
		B8q5s1w: "f8hki3x",
		Bci5o5g: ["f1d2448m", "ffh67wi"],
		n8qw10: "f1bjia2o",
		Bdrgwmp: ["ffh67wi", "f1d2448m"],
		Bqhya38: "f1j6vpng",
		Bwxa6fj: ["f1pniga2", "f1ffjurs"],
		Bdhvstf: "f987i1v",
		B7zbvrb: ["f1ffjurs", "f1pniga2"],
		Bm4h7ae: "f15bsgw9",
		B7ys5i9: "f14e48fq",
		Busjfv9: "f18yb2kv",
		Bhk32uz: "fd6o370",
		f6g5ot: 0,
		Boxcth7: 0,
		Bhdgwq3: 0,
		hgwjuy: 0,
		Bshpdp8: 0,
		Bsom6fd: 0,
		Blkhhs4: 0,
		Bonggc9: 0,
		Ddfuxk: 0,
		i03rao: 0,
		kclons: 0,
		clg4pj: 0,
		Bpqj9nj: 0,
		B6dhp37: 0,
		Bf4ptjt: 0,
		Bqtpl0w: 0,
		i4rwgc: "ffwy5si",
		Dah5zi: 0,
		B1tsrr9: 0,
		qqdqy8: 0,
		Bkh64rk: 0,
		e3fwne: "f3znvyf",
		J0r882: "f57olzd",
		Bule8hv: ["f4stah7", "fs1por5"],
		Bjwuhne: "f480a47",
		Ghsupd: ["fs1por5", "f4stah7"]
	},
	root: {
		sj55zd: "f19n0e5",
		De3pzq: "f1c21dwh",
		jrapky: 0,
		Frg6f3: 0,
		t21cq0: 0,
		B6of3ja: 0,
		B74szlk: "f1s184ao",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "ft85np5"
	},
	rootDisabled: {
		Bcmaq0h: "fwrgwhw",
		sj55zd: "f1s2aq7o"
	},
	rootInline: { mc9l5x: "f14t3ns0" },
	button: {
		qhf8xq: "f10pi13n",
		a9b677: "fly5x3f",
		B4j52fo: "fre7gi1",
		Bekrc4i: ["f1358rze", "f1rvrf73"],
		Bn0qgzm: "fqdk4by",
		ibv6hh: ["f1rvrf73", "f1358rze"],
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: ["f1rmphuq", "f26yw9j"],
		sshi5w: "f5pgtk9",
		mc9l5x: "f22iagw",
		Bt984gj: "f122n59",
		Bceei9c: "f1k6fduh",
		Bahqtrf: "fk6fouc",
		Be2twd7: "fkhj508",
		Bhrd7zp: "figsok6",
		Bg96gwp: "f1i3iumi",
		B7ck84d: "f1ewtqcl"
	},
	buttonSmall: {
		sshi5w: "f1nxs5xn",
		Be2twd7: "fy9rknc"
	},
	buttonLarge: {
		Bg96gwp: "faaz57k",
		Be2twd7: "fod5ikn"
	},
	buttonExtraLarge: {
		Bg96gwp: "f106mvju",
		Be2twd7: "f1pp30po"
	},
	buttonInline: { mc9l5x: "ftuwxu6" },
	buttonExpandIconEndNoIcon: { uwmqm3: ["f1uw59to", "fw5db7e"] },
	buttonExpandIconEnd: { z189sj: ["f11gcy0p", "f1ng84yb"] },
	buttonDisabled: { Bceei9c: "fdrzuqr" },
	expandIcon: {
		Bqenvij: "f1l02sjl",
		mc9l5x: "f22iagw",
		Bt984gj: "f122n59",
		Bg96gwp: "f106mvju",
		Be2twd7: "f1pp30po"
	},
	expandIconStart: { z189sj: ["f1vdfbxk", "f1f5gg8d"] },
	expandIconEnd: {
		Bh6795r: "fqerorx",
		Bnnss6s: "f1neuvcm",
		xawz: "flqd7gy",
		mc9l5x: "f22iagw",
		Brf1p80: "f9c4gz4",
		uwmqm3: ["f1f5gg8d", "f1vdfbxk"]
	},
	icon: {
		Bqenvij: "f1l02sjl",
		mc9l5x: "f22iagw",
		Bt984gj: "f122n59",
		z189sj: ["f1vdfbxk", "f1f5gg8d"],
		Bg96gwp: "f106mvju",
		Be2twd7: "f1pp30po"
	}
}, {
	d: [
		".f1e4lqlz{box-sizing:content-box;}",
		".f1u2r49w{background-color:inherit;}",
		".f1ym3bx4{color:inherit;}",
		".f1mo0ibp{font-family:inherit;}",
		".fjoy568{font-size:inherit;}",
		".fytdu2e{line-height:normal;}",
		[".f1gl81tg{overflow:visible;}", { p: -1 }],
		[".f1mk8lai{padding:0;}", { p: -1 }],
		".f37px4s{-webkit-appearance:button;}",
		".fgusgyc{text-align:unset;}",
		".f8hki3x[data-fui-focus-visible]{border-top-color:transparent;}",
		".f1d2448m[data-fui-focus-visible]{border-right-color:transparent;}",
		".ffh67wi[data-fui-focus-visible]{border-left-color:transparent;}",
		".f1bjia2o[data-fui-focus-visible]{border-bottom-color:transparent;}",
		".f15bsgw9[data-fui-focus-visible]::after{content:\"\";}",
		".f14e48fq[data-fui-focus-visible]::after{position:absolute;}",
		".f18yb2kv[data-fui-focus-visible]::after{pointer-events:none;}",
		".fd6o370[data-fui-focus-visible]::after{z-index:1;}",
		[".ffwy5si[data-fui-focus-visible]::after{border:2px solid var(--colorStrokeFocus2);}", { p: -2 }],
		[".f3znvyf[data-fui-focus-visible]::after{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		".f57olzd[data-fui-focus-visible]::after{top:calc(2px * -1);}",
		".f4stah7[data-fui-focus-visible]::after{right:calc(2px * -1);}",
		".fs1por5[data-fui-focus-visible]::after{left:calc(2px * -1);}",
		".f480a47[data-fui-focus-visible]::after{bottom:calc(2px * -1);}",
		".f19n0e5{color:var(--colorNeutralForeground1);}",
		".f1c21dwh{background-color:var(--colorTransparentBackground);}",
		[".f1s184ao{margin:0;}", { p: -1 }],
		[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		".fwrgwhw{background-image:none;}",
		".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
		".f14t3ns0{display:inline-block;}",
		".f10pi13n{position:relative;}",
		".fly5x3f{width:100%;}",
		".fre7gi1{border-top-width:0;}",
		".f1358rze{border-right-width:0;}",
		".f1rvrf73{border-left-width:0;}",
		".fqdk4by{border-bottom-width:0;}",
		[".f1rmphuq{padding:0 var(--spacingHorizontalM) 0 var(--spacingHorizontalMNudge);}", { p: -1 }],
		[".f26yw9j{padding:0 var(--spacingHorizontalMNudge) 0 var(--spacingHorizontalM);}", { p: -1 }],
		".f5pgtk9{min-height:44px;}",
		".f22iagw{display:flex;}",
		".f122n59{align-items:center;}",
		".f1k6fduh{cursor:pointer;}",
		".fk6fouc{font-family:var(--fontFamilyBase);}",
		".fkhj508{font-size:var(--fontSizeBase300);}",
		".figsok6{font-weight:var(--fontWeightRegular);}",
		".f1i3iumi{line-height:var(--lineHeightBase300);}",
		".f1ewtqcl{box-sizing:border-box;}",
		".f1nxs5xn{min-height:32px;}",
		".fy9rknc{font-size:var(--fontSizeBase200);}",
		".faaz57k{line-height:var(--lineHeightBase400);}",
		".fod5ikn{font-size:var(--fontSizeBase400);}",
		".f106mvju{line-height:var(--lineHeightBase500);}",
		".f1pp30po{font-size:var(--fontSizeBase500);}",
		".ftuwxu6{display:inline-flex;}",
		".f1uw59to{padding-left:var(--spacingHorizontalM);}",
		".fw5db7e{padding-right:var(--spacingHorizontalM);}",
		".f11gcy0p{padding-right:var(--spacingHorizontalMNudge);}",
		".f1ng84yb{padding-left:var(--spacingHorizontalMNudge);}",
		".fdrzuqr{cursor:not-allowed;}",
		".f1l02sjl{height:100%;}",
		".f1vdfbxk{padding-right:var(--spacingHorizontalS);}",
		".f1f5gg8d{padding-left:var(--spacingHorizontalS);}",
		".fqerorx{flex-grow:1;}",
		".f1neuvcm{flex-shrink:1;}",
		".flqd7gy{flex-basis:0%;}",
		".f9c4gz4{justify-content:flex-end;}"
	],
	f: [".ftqa4ok:focus{outline-style:none;}"],
	i: [".f2hkw1w:focus-visible{outline-style:none;}"],
	m: [
		["@media (forced-colors: active){.f1j6vpng[data-fui-focus-visible]::after{border-top-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1ffjurs[data-fui-focus-visible]::after{border-left-color:Highlight;}.f1pniga2[data-fui-focus-visible]::after{border-right-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f987i1v[data-fui-focus-visible]::after{border-bottom-color:Highlight;}}", { m: "(forced-colors: active)" }]
	]
}), Ed = (e) => {
	let t = Td();
	return e.root.className = A(wd.root, t.root, e.inline && t.rootInline, e.disabled && t.rootDisabled, e.root.className), e.button.className = A(wd.button, t.resetButton, t.button, t.focusIndicator, e.expandIconPosition === "end" && !e.icon && t.buttonExpandIconEndNoIcon, e.expandIconPosition === "end" && t.buttonExpandIconEnd, e.inline && t.buttonInline, e.size === "small" && t.buttonSmall, e.size === "large" && t.buttonLarge, e.size === "extra-large" && t.buttonExtraLarge, e.disabled && t.buttonDisabled, e.button.className), e.expandIcon && (e.expandIcon.className = A(wd.expandIcon, t.expandIcon, e.expandIconPosition === "start" && t.expandIconStart, e.expandIconPosition === "end" && t.expandIconEnd, e.expandIcon.className)), e.icon && (e.icon.className = A(wd.icon, t.icon, e.icon.className)), e;
};
//#endregion
//#region node_modules/@fluentui/react-accordion/lib/components/AccordionHeader/useAccordionHeaderContextValues.js
function Dd(e) {
	let { disabled: t, expandIconPosition: n, open: r, size: i } = e;
	return { accordionHeader: P.useMemo(() => ({
		disabled: t,
		expandIconPosition: n,
		open: r,
		size: i
	}), [
		t,
		n,
		r,
		i
	]) };
}
//#endregion
//#region node_modules/@fluentui/react-accordion/lib/components/AccordionHeader/AccordionHeader.js
var Od = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = bd(e, t), r = Dd(n);
	return Ed(n), ai("useAccordionHeaderStyles_unstable")(n), Cd(n, r);
});
Od.displayName = "AccordionHeader";
//#endregion
//#region node_modules/@fluentui/react-motion-components-preview/lib/components/Collapse/collapse-atoms.js
var kd = (e, t) => ({
	sizeName: e === "horizontal" ? "maxWidth" : "maxHeight",
	overflowName: e === "horizontal" ? "overflowX" : "overflowY",
	toSize: `${e === "horizontal" ? t.scrollWidth : t.scrollHeight}px`
}), Ad = ({ orientation: e, duration: t, easing: n, element: r, outSize: i = "0", delay: a = 0 }) => {
	let { sizeName: o, overflowName: s, toSize: c } = kd(e, r);
	return {
		keyframes: [
			{
				[o]: i,
				[s]: "hidden"
			},
			{
				[o]: c,
				offset: .9999,
				[s]: "hidden"
			},
			{
				[o]: "unset",
				[s]: "unset"
			}
		],
		duration: t,
		easing: n,
		delay: a,
		fill: "both"
	};
}, jd = ({ orientation: e, duration: t, easing: n, element: r, delay: i = 0, outSize: a = "0" }) => {
	let { sizeName: o, overflowName: s, toSize: c } = kd(e, r);
	return {
		keyframes: [{
			[o]: c,
			[s]: "hidden"
		}, {
			[o]: a,
			[s]: "hidden"
		}],
		duration: t,
		easing: n,
		delay: i,
		fill: "both"
	};
}, Md = (e) => e === "horizontal" ? {
	paddingStart: "paddingInlineStart",
	paddingEnd: "paddingInlineEnd",
	marginStart: "marginInlineStart",
	marginEnd: "marginInlineEnd"
} : {
	paddingStart: "paddingBlockStart",
	paddingEnd: "paddingBlockEnd",
	marginStart: "marginBlockStart",
	marginEnd: "marginBlockEnd"
}, Nd = ({ direction: e, orientation: t, duration: n, easing: r, delay: i = 0 }) => {
	let { paddingStart: a, paddingEnd: o, marginStart: s, marginEnd: c } = Md(t), l = e === "enter" ? 0 : 1;
	return {
		keyframes: [{
			[a]: "0",
			[o]: "0",
			[s]: "0",
			[c]: "0",
			offset: l
		}],
		duration: n,
		easing: r,
		delay: i,
		fill: "both"
	};
}, Pd = ({ direction: e, duration: t, easing: n = q.curveLinear, delay: r = 0, outOpacity: i = 0, inOpacity: a = 1 }) => {
	let o = [{ opacity: i }, { opacity: a }];
	return e === "exit" && o.reverse(), {
		keyframes: o,
		duration: t,
		easing: n,
		delay: r,
		fill: "both"
	};
}, Fd = sd(({ element: e, duration: t = q.durationNormal, exitDuration: n = t, sizeDuration: r = t, opacityDuration: i = r, exitSizeDuration: a = n, exitOpacityDuration: o = a, easing: s = q.curveEasyEaseMax, delay: c = 0, exitEasing: l = s, exitDelay: u = c, staggerDelay: d = 0, exitStaggerDelay: f = d, animateOpacity: p = !0, orientation: m = "vertical", outSize: h = "0px" }) => {
	let g = [Ad({
		orientation: m,
		duration: r,
		easing: s,
		element: e,
		outSize: h,
		delay: c
	}), Nd({
		direction: "enter",
		orientation: m,
		duration: r,
		easing: s,
		delay: c
	})];
	p && g.push(Pd({
		direction: "enter",
		duration: i,
		easing: s,
		delay: c + d
	}));
	let _ = [];
	return p && _.push(Pd({
		direction: "exit",
		duration: o,
		easing: l,
		delay: u
	})), _.push(jd({
		orientation: m,
		duration: a,
		easing: l,
		element: e,
		delay: u + f,
		outSize: h
	}), Nd({
		direction: "exit",
		orientation: m,
		duration: a,
		easing: l,
		delay: u + f
	})), {
		enter: g,
		exit: _
	};
});
ld(Fd, { duration: q.durationFast }), ld(Fd, { duration: q.durationSlower }), ld(Fd, {
	sizeDuration: q.durationNormal,
	opacityDuration: q.durationSlower,
	staggerDelay: q.durationNormal,
	exitSizeDuration: q.durationNormal,
	exitOpacityDuration: q.durationSlower,
	exitStaggerDelay: q.durationSlower,
	easing: q.curveEasyEase,
	exitEasing: q.curveEasyEase
});
//#endregion
//#region node_modules/@fluentui/react-motion-components-preview/lib/atoms/slide-atom.js
var Id = ({ direction: e, duration: t, easing: n = q.curveLinear, delay: r = 0, outX: i = "0px", outY: a = "0px", inX: o = "0px", inY: s = "0px" }) => {
	let c = [{ translate: `${i} ${a}` }, { translate: `${o} ${s}` }];
	return e === "exit" && c.reverse(), {
		keyframes: c,
		duration: t,
		easing: n,
		delay: r
	};
}, Ld = (e, t) => {
	let { collapseMotion: n, ...r } = e, i = Rd(r, t), a = ms({ focusable: { excludeFromMover: !0 } }), o = Nl((e) => e.navigation);
	return {
		...i,
		components: {
			...i.components,
			collapseMotion: Fd
		},
		root: {
			...i.root,
			...o && a
		},
		collapseMotion: yd(e.collapseMotion, {
			elementType: Fd,
			defaultProps: {
				visible: i.open,
				unmountOnExit: !0
			}
		})
	};
}, Rd = (e, t) => {
	let { open: n } = Yl();
	return {
		open: n,
		components: { root: "div" },
		root: er({
			ref: t,
			...e,
			...n ? {} : {
				tabIndex: -1,
				inert: !0
			}
		}, { elementType: "div" })
	};
}, zd = (e) => e.collapseMotion ? /*#__PURE__*/ R(e.collapseMotion, { children: /*#__PURE__*/ R(e.root, {}) }) : /*#__PURE__*/ R(e.root, {}), Bd = { root: "fui-AccordionPanel" }, Vd = /*#__PURE__*/ I({ root: {
	jrapky: 0,
	Frg6f3: 0,
	t21cq0: 0,
	B6of3ja: 0,
	B74szlk: "f1axvtxu"
} }, { d: [[".f1axvtxu{margin:0 var(--spacingHorizontalM);}", { p: -1 }]] }), Hd = (e) => {
	let t = Vd();
	return e.root.className = A(Bd.root, t.root, e.root.className), e;
}, Ud = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = Ld(e, t);
	return Hd(n), ai("useAccordionPanelStyles_unstable")(n), zd(n);
});
Ud.displayName = "AccordionPanel";
//#endregion
//#region node_modules/@fluentui/react-badge/lib/components/Badge/useBadge.js
var Wd = (e, t) => {
	let { shape: n = "circular", size: r = "medium", appearance: i = "filled", color: a = "brand", ...o } = e;
	return {
		...Gd(o, t),
		shape: n,
		size: r,
		appearance: i,
		color: a
	};
}, Gd = (e, t) => {
	let { iconPosition: n = "before" } = e;
	return {
		iconPosition: n,
		components: {
			root: "div",
			icon: "span"
		},
		root: er(Ir("div", {
			ref: t,
			...e
		}), { elementType: "div" }),
		icon: tr(e.icon, { elementType: "span" })
	};
}, Kd = {
	root: "fui-Badge",
	icon: "fui-Badge__icon"
};
K.spacingHorizontalXXS;
var qd = /*#__PURE__*/ qn("r1iycov", "r115jdol", [
	".r1iycov{display:inline-flex;box-sizing:border-box;align-items:center;justify-content:center;position:relative;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightSemibold);line-height:var(--lineHeightBase200);height:20px;min-width:20px;padding:0 calc(var(--spacingHorizontalXS) + var(--spacingHorizontalXXS));border-radius:var(--borderRadiusCircular);border-color:var(--colorTransparentStroke);}",
	".r1iycov::after{content:\"\";position:absolute;top:0;left:0;bottom:0;right:0;border-style:solid;border-color:inherit;border-width:var(--strokeWidthThin);border-radius:inherit;}",
	".r115jdol{display:inline-flex;box-sizing:border-box;align-items:center;justify-content:center;position:relative;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightSemibold);line-height:var(--lineHeightBase200);height:20px;min-width:20px;padding:0 calc(var(--spacingHorizontalXS) + var(--spacingHorizontalXXS));border-radius:var(--borderRadiusCircular);border-color:var(--colorTransparentStroke);}",
	".r115jdol::after{content:\"\";position:absolute;top:0;right:0;bottom:0;left:0;border-style:solid;border-color:inherit;border-width:var(--strokeWidthThin);border-radius:inherit;}"
]), Jd = /*#__PURE__*/ I({
	fontSmallToTiny: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "f13mqy1h",
		Bhrd7zp: "fl43uef",
		Bg96gwp: "fcpl73t"
	},
	tiny: {
		a9b677: "f16dn6v3",
		Bqenvij: "f3mu39s",
		Be2twd7: "f130uwy9",
		Bg96gwp: "fod1mrr",
		Bf4jedk: "f18p0k4z",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f19jm9xf"
	},
	"extra-small": {
		a9b677: "fpd43o0",
		Bqenvij: "f30q22z",
		Be2twd7: "f1tccstq",
		Bg96gwp: "f1y3arg5",
		Bf4jedk: "f18p0k4z",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f19jm9xf"
	},
	small: {
		Bf4jedk: "fq2vo04",
		Bqenvij: "fd461yt",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "fupdldz"
	},
	medium: {},
	large: {
		Bf4jedk: "f17fgpbq",
		Bqenvij: "frvgh55",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1996nqw"
	},
	"extra-large": {
		Bf4jedk: "fwbmr0d",
		Bqenvij: "f1d2rq10",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "fty64o7"
	},
	square: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "f1fabniw"
	},
	rounded: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "ft85np5"
	},
	roundedSmallToTiny: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "fq9zq91"
	},
	circular: {},
	borderGhost: { ap17g6: "f10ludwy" },
	filled: {},
	"filled-brand": {
		De3pzq: "ffp7eso",
		sj55zd: "f1phragk"
	},
	"filled-danger": {
		De3pzq: "fdl5y0r",
		sj55zd: "f1phragk"
	},
	"filled-important": {
		De3pzq: "f1c73kur",
		sj55zd: "fr0bkrk"
	},
	"filled-informative": {
		De3pzq: "f3vzo32",
		sj55zd: "f11d4kpn"
	},
	"filled-severe": {
		De3pzq: "f1s438gw",
		sj55zd: "f1phragk"
	},
	"filled-subtle": {
		De3pzq: "fxugw4r",
		sj55zd: "f19n0e5"
	},
	"filled-success": {
		De3pzq: "flxk52p",
		sj55zd: "f1phragk"
	},
	"filled-warning": {
		De3pzq: "ffq97bm",
		sj55zd: "ff5vbop"
	},
	ghost: {},
	"ghost-brand": { sj55zd: "f16muhyy" },
	"ghost-danger": { sj55zd: "f1whyuy6" },
	"ghost-important": { sj55zd: "f19n0e5" },
	"ghost-informative": { sj55zd: "f11d4kpn" },
	"ghost-severe": { sj55zd: "f1l8vj45" },
	"ghost-subtle": { sj55zd: "fonrgv7" },
	"ghost-success": { sj55zd: "f1m7fhi8" },
	"ghost-warning": { sj55zd: "fpti2h4" },
	outline: {
		g2u3we: "f23ftbb",
		h3c5rm: ["f1gkuv52", "f1p1bl80"],
		B9xav0g: "fioka3i",
		zhjwy3: ["f1p1bl80", "f1gkuv52"]
	},
	"outline-brand": { sj55zd: "f16muhyy" },
	"outline-danger": {
		sj55zd: "f1whyuy6",
		g2u3we: "fyqpifd",
		h3c5rm: ["f3ukxca", "f1k7dugc"],
		B9xav0g: "f1njxb2b",
		zhjwy3: ["f1k7dugc", "f3ukxca"]
	},
	"outline-important": {
		sj55zd: "f11d4kpn",
		g2u3we: "fq0vr37",
		h3c5rm: ["f1byw159", "f11cr0be"],
		B9xav0g: "f1c1zstj",
		zhjwy3: ["f11cr0be", "f1byw159"]
	},
	"outline-informative": {
		sj55zd: "f11d4kpn",
		g2u3we: "f68mrw8",
		h3c5rm: ["f7pw515", "fw35ms5"],
		B9xav0g: "frpde29",
		zhjwy3: ["fw35ms5", "f7pw515"]
	},
	"outline-severe": { sj55zd: "f1l8vj45" },
	"outline-subtle": { sj55zd: "fonrgv7" },
	"outline-success": {
		sj55zd: "f1m7fhi8",
		g2u3we: "f1mmhl11",
		h3c5rm: ["f1tjpp2f", "f1ocn5n7"],
		B9xav0g: "f1gjv25d",
		zhjwy3: ["f1ocn5n7", "f1tjpp2f"]
	},
	"outline-warning": { sj55zd: "fpti2h4" },
	tint: {},
	"tint-brand": {
		De3pzq: "f16xkysk",
		sj55zd: "faj9fo0",
		g2u3we: "f161y7kd",
		h3c5rm: ["f1c8dzaj", "f1sl6hi9"],
		B9xav0g: "f1619yhw",
		zhjwy3: ["f1sl6hi9", "f1c8dzaj"]
	},
	"tint-danger": {
		De3pzq: "ff0poqj",
		sj55zd: "f1hcrxcs",
		g2u3we: "f1oqjm8o",
		h3c5rm: ["fkgrb8g", "frb5wm0"],
		B9xav0g: "f1iai1ph",
		zhjwy3: ["frb5wm0", "fkgrb8g"]
	},
	"tint-important": {
		De3pzq: "f945g0u",
		sj55zd: "fr0bkrk",
		g2u3we: "fghlq4f",
		h3c5rm: ["f1gn591s", "fjscplz"],
		B9xav0g: "fb073pr",
		zhjwy3: ["fjscplz", "f1gn591s"]
	},
	"tint-informative": {
		De3pzq: "f1ctqxl6",
		sj55zd: "f11d4kpn",
		g2u3we: "f68mrw8",
		h3c5rm: ["f7pw515", "fw35ms5"],
		B9xav0g: "frpde29",
		zhjwy3: ["fw35ms5", "f7pw515"]
	},
	"tint-severe": {
		De3pzq: "f1xzsg4",
		sj55zd: "f1k5f75o",
		g2u3we: "fxy9dsj",
		h3c5rm: ["f54u6j2", "fcm23ze"],
		B9xav0g: "f4vf0uq",
		zhjwy3: ["fcm23ze", "f54u6j2"]
	},
	"tint-subtle": {
		De3pzq: "fxugw4r",
		sj55zd: "f11d4kpn",
		g2u3we: "f68mrw8",
		h3c5rm: ["f7pw515", "fw35ms5"],
		B9xav0g: "frpde29",
		zhjwy3: ["fw35ms5", "f7pw515"]
	},
	"tint-success": {
		De3pzq: "f2vsrz6",
		sj55zd: "ffmvakt",
		g2u3we: "fdmic9h",
		h3c5rm: ["f196y6m", "fetptd8"],
		B9xav0g: "f1pev5xq",
		zhjwy3: ["fetptd8", "f196y6m"]
	},
	"tint-warning": {
		De3pzq: "f10s6hli",
		sj55zd: "f42v8de",
		g2u3we: "fn9i3n",
		h3c5rm: ["f1aw8cx4", "f51if14"],
		B9xav0g: "fvq8iai",
		zhjwy3: ["f51if14", "f1aw8cx4"]
	}
}, { d: [
	".fk6fouc{font-family:var(--fontFamilyBase);}",
	".f13mqy1h{font-size:var(--fontSizeBase100);}",
	".fl43uef{font-weight:var(--fontWeightSemibold);}",
	".fcpl73t{line-height:var(--lineHeightBase100);}",
	".f16dn6v3{width:6px;}",
	".f3mu39s{height:6px;}",
	".f130uwy9{font-size:4px;}",
	".fod1mrr{line-height:4px;}",
	".f18p0k4z{min-width:unset;}",
	[".f19jm9xf{padding:unset;}", { p: -1 }],
	".fpd43o0{width:10px;}",
	".f30q22z{height:10px;}",
	".f1tccstq{font-size:6px;}",
	".f1y3arg5{line-height:6px;}",
	[".f19jm9xf{padding:unset;}", { p: -1 }],
	".fq2vo04{min-width:16px;}",
	".fd461yt{height:16px;}",
	[".fupdldz{padding:0 calc(var(--spacingHorizontalXXS) + var(--spacingHorizontalXXS));}", { p: -1 }],
	".f17fgpbq{min-width:24px;}",
	".frvgh55{height:24px;}",
	[".f1996nqw{padding:0 calc(var(--spacingHorizontalXS) + var(--spacingHorizontalXXS));}", { p: -1 }],
	".fwbmr0d{min-width:32px;}",
	".f1d2rq10{height:32px;}",
	[".fty64o7{padding:0 calc(var(--spacingHorizontalSNudge) + var(--spacingHorizontalXXS));}", { p: -1 }],
	[".f1fabniw{border-radius:var(--borderRadiusNone);}", { p: -1 }],
	[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
	[".fq9zq91{border-radius:var(--borderRadiusSmall);}", { p: -1 }],
	".f10ludwy::after{display:none;}",
	".ffp7eso{background-color:var(--colorBrandBackground);}",
	".f1phragk{color:var(--colorNeutralForegroundOnBrand);}",
	".fdl5y0r{background-color:var(--colorPaletteRedBackground3);}",
	".f1c73kur{background-color:var(--colorNeutralForeground1);}",
	".fr0bkrk{color:var(--colorNeutralBackground1);}",
	".f3vzo32{background-color:var(--colorNeutralBackground5);}",
	".f11d4kpn{color:var(--colorNeutralForeground3);}",
	".f1s438gw{background-color:var(--colorPaletteDarkOrangeBackground3);}",
	".fxugw4r{background-color:var(--colorNeutralBackground1);}",
	".f19n0e5{color:var(--colorNeutralForeground1);}",
	".flxk52p{background-color:var(--colorPaletteGreenBackground3);}",
	".ffq97bm{background-color:var(--colorPaletteYellowBackground3);}",
	".ff5vbop{color:var(--colorNeutralForeground1Static);}",
	".f16muhyy{color:var(--colorBrandForeground1);}",
	".f1whyuy6{color:var(--colorPaletteRedForeground3);}",
	".f1l8vj45{color:var(--colorPaletteDarkOrangeForeground3);}",
	".fonrgv7{color:var(--colorNeutralForegroundStaticInverted);}",
	".f1m7fhi8{color:var(--colorPaletteGreenForeground3);}",
	".fpti2h4{color:var(--colorPaletteYellowForeground2);}",
	".f23ftbb{border-top-color:currentColor;}",
	".f1gkuv52{border-right-color:currentColor;}",
	".f1p1bl80{border-left-color:currentColor;}",
	".fioka3i{border-bottom-color:currentColor;}",
	".fyqpifd{border-top-color:var(--colorPaletteRedBorder2);}",
	".f3ukxca{border-right-color:var(--colorPaletteRedBorder2);}",
	".f1k7dugc{border-left-color:var(--colorPaletteRedBorder2);}",
	".f1njxb2b{border-bottom-color:var(--colorPaletteRedBorder2);}",
	".fq0vr37{border-top-color:var(--colorNeutralStrokeAccessible);}",
	".f1byw159{border-right-color:var(--colorNeutralStrokeAccessible);}",
	".f11cr0be{border-left-color:var(--colorNeutralStrokeAccessible);}",
	".f1c1zstj{border-bottom-color:var(--colorNeutralStrokeAccessible);}",
	".f68mrw8{border-top-color:var(--colorNeutralStroke2);}",
	".f7pw515{border-right-color:var(--colorNeutralStroke2);}",
	".fw35ms5{border-left-color:var(--colorNeutralStroke2);}",
	".frpde29{border-bottom-color:var(--colorNeutralStroke2);}",
	".f1mmhl11{border-top-color:var(--colorPaletteGreenBorder2);}",
	".f1tjpp2f{border-right-color:var(--colorPaletteGreenBorder2);}",
	".f1ocn5n7{border-left-color:var(--colorPaletteGreenBorder2);}",
	".f1gjv25d{border-bottom-color:var(--colorPaletteGreenBorder2);}",
	".f16xkysk{background-color:var(--colorBrandBackground2);}",
	".faj9fo0{color:var(--colorBrandForeground2);}",
	".f161y7kd{border-top-color:var(--colorBrandStroke2);}",
	".f1c8dzaj{border-right-color:var(--colorBrandStroke2);}",
	".f1sl6hi9{border-left-color:var(--colorBrandStroke2);}",
	".f1619yhw{border-bottom-color:var(--colorBrandStroke2);}",
	".ff0poqj{background-color:var(--colorPaletteRedBackground1);}",
	".f1hcrxcs{color:var(--colorPaletteRedForeground1);}",
	".f1oqjm8o{border-top-color:var(--colorPaletteRedBorder1);}",
	".fkgrb8g{border-right-color:var(--colorPaletteRedBorder1);}",
	".frb5wm0{border-left-color:var(--colorPaletteRedBorder1);}",
	".f1iai1ph{border-bottom-color:var(--colorPaletteRedBorder1);}",
	".f945g0u{background-color:var(--colorNeutralForeground3);}",
	".fghlq4f{border-top-color:var(--colorTransparentStroke);}",
	".f1gn591s{border-right-color:var(--colorTransparentStroke);}",
	".fjscplz{border-left-color:var(--colorTransparentStroke);}",
	".fb073pr{border-bottom-color:var(--colorTransparentStroke);}",
	".f1ctqxl6{background-color:var(--colorNeutralBackground4);}",
	".f1xzsg4{background-color:var(--colorPaletteDarkOrangeBackground1);}",
	".f1k5f75o{color:var(--colorPaletteDarkOrangeForeground1);}",
	".fxy9dsj{border-top-color:var(--colorPaletteDarkOrangeBorder1);}",
	".f54u6j2{border-right-color:var(--colorPaletteDarkOrangeBorder1);}",
	".fcm23ze{border-left-color:var(--colorPaletteDarkOrangeBorder1);}",
	".f4vf0uq{border-bottom-color:var(--colorPaletteDarkOrangeBorder1);}",
	".f2vsrz6{background-color:var(--colorPaletteGreenBackground1);}",
	".ffmvakt{color:var(--colorPaletteGreenForeground1);}",
	".fdmic9h{border-top-color:var(--colorPaletteGreenBorder1);}",
	".f196y6m{border-right-color:var(--colorPaletteGreenBorder1);}",
	".fetptd8{border-left-color:var(--colorPaletteGreenBorder1);}",
	".f1pev5xq{border-bottom-color:var(--colorPaletteGreenBorder1);}",
	".f10s6hli{background-color:var(--colorPaletteYellowBackground1);}",
	".f42v8de{color:var(--colorPaletteYellowForeground1);}",
	".fn9i3n{border-top-color:var(--colorPaletteYellowBorder1);}",
	".f1aw8cx4{border-right-color:var(--colorPaletteYellowBorder1);}",
	".f51if14{border-left-color:var(--colorPaletteYellowBorder1);}",
	".fvq8iai{border-bottom-color:var(--colorPaletteYellowBorder1);}"
] }), Yd = /*#__PURE__*/ qn("rttl5z0", null, [".rttl5z0{display:flex;line-height:1;margin:0 calc(-1 * var(--spacingHorizontalXXS));font-size:12px;}"]), Xd = /*#__PURE__*/ I({
	beforeText: { t21cq0: ["f1t8l4o1", "f11juvx6"] },
	afterText: { Frg6f3: ["f11juvx6", "f1t8l4o1"] },
	beforeTextXL: { t21cq0: ["f1rs9grm", "f1kwmkpi"] },
	afterTextXL: { Frg6f3: ["f1kwmkpi", "f1rs9grm"] },
	tiny: { Be2twd7: "f1tccstq" },
	"extra-small": { Be2twd7: "fnmn6fi" },
	small: { Be2twd7: "f1ugzwwg" },
	medium: {},
	large: { Be2twd7: "f4ybsrx" },
	"extra-large": { Be2twd7: "fe5j1ua" }
}, { d: [
	".f1t8l4o1{margin-right:calc(var(--spacingHorizontalXXS) + var(--spacingHorizontalXXS));}",
	".f11juvx6{margin-left:calc(var(--spacingHorizontalXXS) + var(--spacingHorizontalXXS));}",
	".f1rs9grm{margin-right:calc(var(--spacingHorizontalXS) + var(--spacingHorizontalXXS));}",
	".f1kwmkpi{margin-left:calc(var(--spacingHorizontalXS) + var(--spacingHorizontalXXS));}",
	".f1tccstq{font-size:6px;}",
	".fnmn6fi{font-size:10px;}",
	".f1ugzwwg{font-size:12px;}",
	".f4ybsrx{font-size:16px;}",
	".fe5j1ua{font-size:20px;}"
] }), Zd = (e) => {
	let t = qd(), n = Jd(), r = e.size === "small" || e.size === "extra-small" || e.size === "tiny";
	e.root.className = A(Kd.root, t, r && n.fontSmallToTiny, n[e.size], n[e.shape], e.shape === "rounded" && r && n.roundedSmallToTiny, e.appearance === "ghost" && n.borderGhost, n[e.appearance], n[`${e.appearance}-${e.color}`], e.root.className);
	let i = Yd(), a = Xd();
	if (e.icon) {
		let t;
		P.Children.toArray(e.root.children).length > 0 && (t = e.size === "extra-large" ? e.iconPosition === "after" ? a.afterTextXL : a.beforeTextXL : e.iconPosition === "after" ? a.afterText : a.beforeText), e.icon.className = A(Kd.icon, i, t, a[e.size], e.icon.className);
	}
	return e;
}, Qd = (e) => /*#__PURE__*/ ra(e.root, { children: [
	e.iconPosition === "before" && e.icon && /*#__PURE__*/ R(e.icon, {}),
	e.root.children,
	e.iconPosition === "after" && e.icon && /*#__PURE__*/ R(e.icon, {})
] }), $d = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = Wd(e, t);
	return Zd(n), ai("useBadgeStyles_unstable")(n), Qd(n);
});
$d.displayName = "Badge";
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/createVirtualElementFromClick.js
function ef(e) {
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
var tf = "data-popper-is-intersecting", nf = "data-popper-escaped", rf = "data-popper-reference-hidden", af = "data-popper-placement", of = "fui-positioningend", sf = "--fui-positioning-slide-direction-x", cf = "--fui-positioning-slide-direction-y";
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningSlideDirection.js
function lf(e) {
	let t = e.split("-")[0], n = 0, r = 1;
	return t === "right" ? (n = -1, r = 0) : t === "bottom" ? (n = 0, r = -1) : t === "left" && (n = 1, r = 0), {
		x: n,
		y: r
	};
}
function uf(e) {
	let { targetDocument: t, onPositioningEnd: n } = e, r = L((e) => {
		n?.(e);
		let t = e.target, r = e.detail.placement;
		if (!Vi(t)) return;
		let { x: i, y: a } = lf(r);
		t.style.setProperty(sf, `${i}px`), t.style.setProperty(cf, `${a}px`);
	});
	return P.useEffect(() => {
		var e;
		let n = (t == null || (e = t.defaultView) == null ? void 0 : e.CSS?.registerProperty) ?? (() => {});
		try {
			n({
				name: sf,
				syntax: "<length>",
				inherits: !1,
				initialValue: "0px"
			}), n({
				name: cf,
				syntax: "<length>",
				inherits: !1,
				initialValue: "0px"
			});
		} catch {}
	}, [t]), r;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/PositioningConfigurationContext.js
var df = ({ options: e }) => e, ff = P.createContext(void 0);
ff.Provider;
var pf = () => P.useContext(ff) ?? df, mf = [
	"top",
	"right",
	"bottom",
	"left"
], X = Math.min, hf = Math.max, gf = Math.round, _f = (e) => ({
	x: e,
	y: e
}), vf = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function yf(e, t, n) {
	return hf(e, X(t, n));
}
function bf(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function xf(e) {
	return e.split("-")[0];
}
function Sf(e) {
	return e.split("-")[1];
}
function Cf(e) {
	return e === "x" ? "y" : "x";
}
function wf(e) {
	return e === "y" ? "height" : "width";
}
function Tf(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Ef(e) {
	return Cf(Tf(e));
}
function Df(e, t, n) {
	n === void 0 && (n = !1);
	let r = Sf(e), i = Ef(e), a = wf(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = If(o)), [o, If(o)];
}
function Of(e) {
	let t = If(e);
	return [
		kf(e),
		t,
		kf(t)
	];
}
function kf(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var Af = ["left", "right"], jf = ["right", "left"], Mf = ["top", "bottom"], Nf = ["bottom", "top"];
function Pf(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? jf : Af : t ? Af : jf;
		case "left":
		case "right": return t ? Mf : Nf;
		default: return [];
	}
}
function Ff(e, t, n, r) {
	let i = Sf(e), a = Pf(xf(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(kf)))), a;
}
function If(e) {
	let t = xf(e);
	return vf[t] + e.slice(t.length);
}
function Lf(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function Rf(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : Lf(e);
}
function zf(e) {
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
function Bf(e, t, n) {
	let { reference: r, floating: i } = e, a = Tf(t), o = Ef(t), s = wf(o), c = xf(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	let m = Sf(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function Vf(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = bf(t, e), p = Rf(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = zf(await i.getClippingRect({
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
	}, y = zf(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var Hf = 50, Z = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: Vf
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = Bf(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < Hf && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = Bf(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Uf = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = bf(e, t) || {};
		if (l == null) return {};
		let d = Rf(u), f = {
			x: n,
			y: r
		}, p = Ef(i), m = wf(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = X(d[_], T), D = X(d[v], T), ee = C - h[m] - D, te = C / 2 - h[m] / 2 + w, O = yf(E, te, ee), k = !c.arrow && Sf(i) != null && te !== O && a.reference[m] / 2 - (te < E ? E : D) - h[m] / 2 < 0, ne = k ? te < E ? te - E : te - ee : 0;
		return {
			[p]: f[p] + ne,
			data: {
				[p]: O,
				centerOffset: te - O - ne,
				...k && { alignmentOffset: ne }
			},
			reset: k
		};
	}
}), Wf = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = bf(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = xf(r), _ = Tf(o), v = xf(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [If(o)] : Of(o)), x = p !== "none";
			!d && x && b.push(...Ff(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = Df(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === Tf(t) || T.every((e) => Tf(e.placement) !== _ || e.overflows[0] > 0))) return {
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
								let t = Tf(e.placement);
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
function Gf(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function Kf(e) {
	return mf.some((t) => e[t] >= 0);
}
var qf = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = bf(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = Gf(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: Kf(e)
					} };
				}
				case "escaped": {
					let e = Gf(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: Kf(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Jf = /*#__PURE__*/ new Set(["left", "top"]);
async function Yf(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = xf(n), s = Sf(n), c = Tf(n) === "y", l = Jf.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = bf(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var Xf = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Yf(t, e);
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
}, Zf = function(e) {
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
			} }, ...l } = bf(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = Tf(i), p = Cf(f), m = u[p], h = u[f], g = (e, t) => yf(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
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
}, Qf = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = bf(e, t), u = {
				x: n,
				y: r
			}, d = Tf(i), f = Cf(d), p = u[f], m = u[d], h = bf(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = Jf.has(xf(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, $f = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = bf(e, t), c = await i.detectOverflow(t, s), l = xf(n), u = Sf(n), d = Tf(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = X(p - c[m], g), y = X(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * hf(c.left, c.right) : S = p - 2 * hf(c.top, c.bottom)), await o({
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
function ep() {
	return typeof window < "u";
}
function tp(e) {
	return rp(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Q(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function np(e) {
	return ((rp(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function rp(e) {
	return ep() ? e instanceof Node || e instanceof Q(e).Node : !1;
}
function ip(e) {
	return ep() ? e instanceof Element || e instanceof Q(e).Element : !1;
}
function ap(e) {
	return ep() ? e instanceof HTMLElement || e instanceof Q(e).HTMLElement : !1;
}
function op(e) {
	return !ep() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Q(e).ShadowRoot;
}
function sp(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = vp(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function cp(e) {
	return /^(table|td|th)$/.test(tp(e));
}
function lp(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var up = /transform|translate|scale|rotate|perspective|filter/, dp = /paint|layout|strict|content/, fp = (e) => !!e && e !== "none", pp;
function mp(e) {
	let t = ip(e) ? vp(e) : e;
	return fp(t.transform) || fp(t.translate) || fp(t.scale) || fp(t.rotate) || fp(t.perspective) || !gp() && (fp(t.backdropFilter) || fp(t.filter)) || up.test(t.willChange || "") || dp.test(t.contain || "");
}
function hp(e) {
	let t = bp(e);
	for (; ap(t) && !_p(t);) {
		if (mp(t)) return t;
		if (lp(t)) return null;
		t = bp(t);
	}
	return null;
}
function gp() {
	return pp ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), pp;
}
function _p(e) {
	return /^(html|body|#document)$/.test(tp(e));
}
function vp(e) {
	return Q(e).getComputedStyle(e);
}
function yp(e) {
	return ip(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function bp(e) {
	if (tp(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || op(e) && e.host || np(e);
	return op(t) ? t.host : t;
}
function xp(e) {
	let t = bp(e);
	return _p(t) ? (e.ownerDocument || e).body : ap(t) && sp(t) ? t : xp(t);
}
function Sp(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = xp(e), i = r === e.ownerDocument?.body, a = Q(r);
	if (i) {
		let e = Cp(a);
		return t.concat(a, a.visualViewport || [], sp(r) ? r : [], e && n ? Sp(e) : []);
	}
	return t.concat(r, Sp(r, [], n));
}
function Cp(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function wp(e) {
	let t = vp(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = ap(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = gf(n) !== a || gf(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function Tp(e) {
	return ip(e) ? e : e.contextElement;
}
function Ep(e) {
	let t = Tp(e);
	if (!ap(t)) return _f(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = wp(t), o = (a ? gf(n.width) : n.width) / r, s = (a ? gf(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Dp = /*#__PURE__*/ _f(0);
function Op(e) {
	let t = Q(e);
	return !gp() || !t.visualViewport ? Dp : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function kp(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === Q(e);
}
function Ap(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = Tp(e), o = _f(1);
	t && (r ? ip(r) && (o = Ep(r)) : o = Ep(e));
	let s = kp(a, n, r) ? Op(a) : _f(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = Q(a), t = ip(r) ? Q(r) : r, n = e, i = Cp(n);
		for (; i && t !== n;) {
			let e = Ep(i), t = i.getBoundingClientRect(), r = vp(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Q(i), i = Cp(n);
		}
	}
	return zf({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function jp(e, t) {
	let n = yp(e).scrollLeft;
	return t ? t.left + n : Ap(np(e)).left + n;
}
function Mp(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - jp(e, n),
		y: n.top + t.scrollTop
	};
}
function Np(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = np(r), s = t ? lp(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = _f(1), u = _f(0), d = ap(r);
	if ((d || !a) && ((tp(r) !== "body" || sp(o)) && (c = yp(r)), d)) {
		let e = Ap(r);
		l = Ep(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Mp(o, c) : _f(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function Pp(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Fp(e) {
	let t = yp(e), n = e.ownerDocument.body, r = hf(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = hf(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + jp(e), o = -t.scrollTop;
	return vp(n).direction === "rtl" && (a += hf(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var Ip = 25;
function Lp(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = Q(e), a = np(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !gp() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (jp(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= Ip && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function Rp(e, t) {
	let n = Ap(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Ep(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function zp(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = Lp(e, n, t);
	else if (t === "document") r = Fp(np(e));
	else if (ip(t)) r = Rp(t, n);
	else {
		let n = Op(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return zf(r);
}
function Bp(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = Sp(e, [], !1).filter((e) => ip(e) && tp(e) !== "body"), i = null, a = vp(e).position === "fixed", o = a ? bp(e) : e;
	for (; ip(o) && !_p(o);) {
		let e = vp(o), t = mp(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = bp(o);
	}
	return t.set(e, r), r;
}
function Vp(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? lp(t) ? [] : Bp(t, this._c) : [].concat(n), r], o = zp(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = zp(t, a[e], i);
		s = hf(n.top, s), c = X(n.right, c), l = X(n.bottom, l), u = hf(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Hp(e) {
	let { width: t, height: n } = wp(e);
	return {
		width: t,
		height: n
	};
}
function Up(e, t, n) {
	let r = ap(t), i = np(t), a = n === "fixed", o = Ap(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = _f(0);
	if ((r || !a) && ((tp(t) !== "body" || sp(i)) && (s = yp(t)), r)) {
		let e = Ap(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = jp(i));
	let l = i && !r && !a ? Mp(i, s) : _f(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function Wp(e) {
	return vp(e).position === "static";
}
function Gp(e, t) {
	if (!ap(e) || vp(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return np(e) === n && (n = n.ownerDocument.body), n;
}
function Kp(e, t) {
	let n = Q(e);
	if (lp(e)) return n;
	if (!ap(e)) {
		let t = bp(e);
		for (; t && !_p(t);) {
			if (ip(t) && !Wp(t)) return t;
			t = bp(t);
		}
		return n;
	}
	let r = Gp(e, t);
	for (; r && cp(r) && Wp(r);) r = Gp(r, t);
	return r && _p(r) && Wp(r) && !mp(r) ? n : r || hp(e) || n;
}
var qp = async function(e) {
	let t = this.getOffsetParent || Kp, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: Up(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function Jp(e) {
	return vp(e).direction === "rtl";
}
var Yp = {
	convertOffsetParentRelativeRectToViewportRelativeRect: Np,
	getDocumentElement: np,
	getClippingRect: Vp,
	getOffsetParent: Kp,
	getElementRects: qp,
	getClientRects: Pp,
	getDimensions: Hp,
	getScale: Ep,
	isElement: ip,
	isRTL: Jp
}, Xp = Vf, Zp = Xf, Qp = Zf, $p = Wf, em = $f, tm = qf, nm = Uf, rm = Qf, im = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...Yp,
		...i.platform,
		_c: r
	};
	return Z(e, t, {
		...i,
		platform: a
	});
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/parseFloatingUIPlacement.js
function am(e) {
	let t = e.split("-");
	return {
		side: t[0],
		alignment: t[1]
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/getScrollParent.js
var om = (e) => e.nodeName === "HTML" ? e : e.parentNode || e.host, sm = (e) => {
	if (e.nodeType !== 1) return {};
	let t = e.ownerDocument?.defaultView;
	return t ? t.getComputedStyle(e, null) : {};
}, cm = (e) => {
	let t = e && om(e);
	if (!t) return document.body;
	switch (t.nodeName) {
		case "HTML":
		case "BODY": return t.ownerDocument.body;
		case "#document": return t.body;
	}
	let { overflow: n, overflowX: r, overflowY: i } = sm(t);
	return /(auto|scroll|overlay)/.test(n + i + r) ? t : cm(t);
}, lm = (e) => {
	let t = cm(e);
	return t ? t !== t.ownerDocument?.body : !1;
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/getBoundary.js
function um(e, t) {
	if (t === "window") return e?.ownerDocument.documentElement;
	if (t === "clippingParents") return "clippingAncestors";
	if (t === "scrollParent") {
		let t = cm(e);
		return t.nodeName === "BODY" && (t = e?.ownerDocument.documentElement), t;
	}
	return t;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/mergeArrowOffset.js
function dm(e, t) {
	return typeof e == "number" || typeof e == "object" && e ? fm(e, t) : typeof e == "function" ? (n) => fm(e(n), t) : { mainAxis: t };
}
var fm = (e, t) => typeof e == "number" ? { mainAxis: e + t } : {
	...e,
	mainAxis: (e.mainAxis ?? 0) + t
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/toFloatingUIPadding.js
function pm(e, t) {
	if (typeof e == "number") return e;
	let { start: n, end: r, ...i } = e, a = i, o = t ? "end" : "start", s = t ? "start" : "end";
	return e[o] && (a.left = e[o]), e[s] && (a.right = e[s]), a;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/toFloatingUIPlacement.js
var mm = (e) => ({
	above: "top",
	below: "bottom",
	before: e ? "right" : "left",
	after: e ? "left" : "right"
}), hm = () => ({
	start: "start",
	end: "end",
	top: "start",
	bottom: "end",
	center: void 0
}), gm = (e, t) => {
	let n = e === "above" || e === "below", r = t === "top" || t === "bottom";
	return n && r || !n && !r;
}, _m = (e, t, n) => {
	let r = gm(t, e) ? "center" : e, i = t && mm(n)[t], a = r && hm()[r];
	return i && a ? `${i}-${a}` : i;
}, vm = () => ({
	top: "above",
	bottom: "below",
	right: "after",
	left: "before"
}), ym = (e) => e === "above" || e === "below" ? {
	start: "start",
	end: "end"
} : {
	start: "top",
	end: "bottom"
}, bm = (e) => {
	let { side: t, alignment: n } = am(e), r = vm()[t];
	return {
		position: r,
		alignment: n && ym(r)[n]
	};
}, xm = {
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
function Sm(e) {
	return e == null ? {} : typeof e == "string" ? xm[e] : e;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/useCallbackRef.js
function Cm(e, t, n) {
	let r = P.useRef(!0), [i] = P.useState(() => ({
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
	return Si(() => {
		r.current = !1;
	}, []), i.callback = t, i.facade;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/debounce.js
function wm(e) {
	let t;
	return () => (t ||= new Promise((n) => {
		Promise.resolve().then(() => {
			t = void 0, n(e());
		});
	}), t);
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/writeArrowUpdates.js
function Tm(e) {
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
function Em(e) {
	let { container: t, placement: n, middlewareData: r, strategy: i, lowPPI: a, coordinates: o, useTransform: s = !0 } = e;
	if (!t) return;
	t.setAttribute(af, n), t.removeAttribute(tf), r.intersectionObserver.intersecting && t.setAttribute(tf, ""), t.removeAttribute(nf), r.hide?.escaped && t.setAttribute(nf, ""), t.removeAttribute(rf), r.hide?.referenceHidden && t.setAttribute(rf, "");
	let c = t.ownerDocument.defaultView?.devicePixelRatio || 1, l = Math.round(o.x * c) / c, u = Math.round(o.y * c) / c;
	Object.assign(t.style, { position: i }), s ? Object.assign(t.style, { transform: a ? `translate(${l}px, ${u}px)` : `translate3d(${l}px, ${u}px, 0)` }) : Object.assign(t.style, {
		left: `${l}px`,
		top: `${u}px`
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/normalizeAutoSize.js
var Dm = (e) => {
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
function Om(e) {
	let t = [], n = e;
	for (; n;) {
		let r = cm(n);
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
function km(e, t) {
	return new e.ResizeObserver(t);
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/createPositionManager.js
function Am(e) {
	let { clientWidth: t, clientHeight: n } = e.ownerDocument.documentElement;
	return t === 0 && n === 0;
}
function jm(e) {
	let t = !1, { container: n, target: r, arrow: i, strategy: a, middleware: o, placement: s, useTransform: c = !0, disableUpdateOnResize: l = !1 } = e, u = n.ownerDocument.defaultView;
	if (!r || !n || !u) return {
		updatePosition: () => void 0,
		dispose: () => void 0
	};
	let d = l ? null : km(u, (e) => {
		e.every((e) => e.contentRect.width > 0 && e.contentRect.height > 0) && h();
	}), f = !0, p = /* @__PURE__ */ new Set();
	Object.assign(n.style, {
		position: "fixed",
		left: 0,
		top: 0,
		margin: 0
	});
	let m = () => {
		t || (f &&= (Om(n).forEach((e) => p.add(e)), Vi(r) && Om(r).forEach((e) => p.add(e)), p.forEach((e) => {
			e.addEventListener("scroll", h, { passive: !0 });
		}), d?.observe(n), Vi(r) && d?.observe(r), !1), Object.assign(n.style, { position: a }), im(r, n, {
			placement: s,
			middleware: o,
			strategy: a
		}).then(({ x: e, y: r, middlewareData: o, placement: s }) => {
			if (t) return;
			let l = Am(n) ? {
				...o,
				hide: {
					...o.hide,
					escaped: !1,
					referenceHidden: !1
				}
			} : o;
			Tm({
				arrow: i,
				middlewareData: l
			}), Em({
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
			}), n.dispatchEvent(new CustomEvent(of, { detail: {
				placement: s,
				escaped: l.hide?.escaped ?? !1,
				referenceHidden: l.hide?.referenceHidden ?? !1
			} }));
		}).catch((e) => {}));
	}, h = wm(() => m());
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
function Mm() {
	return {
		name: "coverTarget",
		fn: (e) => {
			let { placement: t, rects: n, x: r, y: i } = e, a = am(t).side, o = {
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
function Nm(e) {
	let { hasScrollableElement: t, flipBoundary: n, container: r, fallbackPositions: i = [], isRtl: a } = e, o = i.reduce((e, t) => {
		let { position: n, align: r } = Sm(t), i = _m(r, n, a);
		return i && e.push(i), e;
	}, []);
	return $p({
		...t && { boundary: "clippingAncestors" },
		...n && {
			altBoundary: !0,
			boundary: um(r, n)
		},
		fallbackStrategy: "bestFit",
		...o.length && { fallbackPlacements: o }
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/intersecting.js
function Pm() {
	return {
		name: "intersectionObserver",
		fn: async (e) => {
			let t = e.rects.floating, n = await Xp(e, { altBoundary: !0 }), r = n.top < t.height && n.top > 0, i = n.bottom < t.height && n.bottom > 0;
			return { data: { intersecting: r || i } };
		}
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/maxSize.js
var Fm = (e) => ({
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
function Im(e, t) {
	let { container: n, overflowBoundary: r, overflowBoundaryPadding: i, isRtl: a } = t;
	return em({
		...i && { padding: pm(i, a) },
		...r && {
			altBoundary: !0,
			boundary: um(n, r)
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
function Lm(e) {
	return !e || typeof e == "number" || typeof e == "object" ? e : ({ rects: { floating: t, reference: n }, placement: r }) => {
		let { position: i, alignment: a } = bm(r);
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
function Rm(e) {
	return Zp(Lm(e));
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/shift.js
function zm(e) {
	let { hasScrollableElement: t, shiftToCoverTarget: n, disableTether: r, overflowBoundary: i, container: a, overflowBoundaryPadding: o, isRtl: s } = e;
	return Qp({
		...t && { boundary: "clippingAncestors" },
		...n && {
			crossAxis: !0,
			limiter: rm({
				crossAxis: !0,
				mainAxis: !1
			})
		},
		...r && {
			crossAxis: r === "all",
			limiter: rm({
				crossAxis: r !== "all",
				mainAxis: !1
			})
		},
		...o && { padding: pm(o, s) },
		...i && {
			altBoundary: !0,
			boundary: um(a, i)
		}
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/matchTargetSize.js
var Bm = "--fui-match-target-size";
function Vm() {
	return {
		name: "matchTargetSize",
		fn: async (e) => {
			let { rects: { reference: t, floating: n }, elements: { floating: r }, middlewareData: { matchTargetSize: { matchTargetSizeAttempt: i = !1 } = {} } } = e;
			if (t.width === n.width || i) return {};
			let { width: a } = t;
			return r.style.setProperty(Bm, `${a}px`), r.style.width || (r.style.width = `var(${Bm})`), {
				data: { matchTargetSizeAttempt: !0 },
				reset: { rects: !0 }
			};
		}
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningOptions.js
function Hm(e, t) {
	let { align: n, arrowPadding: r, autoSize: i, coverTarget: a, disableUpdateOnResize: o, flipBoundary: s, offset: c, overflowBoundary: l, pinned: u, position: d, unstable_disableTether: f, strategy: p, overflowBoundaryPadding: m, fallbackPositions: h, useTransform: g, matchTargetSize: _, shiftToCoverTarget: v } = t;
	return P.useCallback((t, y) => e({
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
function Um(e) {
	let { dir: t, targetDocument: n } = Qr(), r = t === "rtl", i = Hm(pf(), e), { positionFixed: a } = e;
	return P.useCallback((e, t) => {
		let n = lm(e), { autoSize: o, disableUpdateOnResize: s, matchTargetSize: c, offset: l, coverTarget: u, flipBoundary: d, overflowBoundary: f, useTransform: p, overflowBoundaryPadding: m, pinned: h, position: g, arrowPadding: _, strategy: v, align: y, fallbackPositions: b, shiftToCoverTarget: x, unstable_disableTether: S } = i(e, t), C = Dm(o), w = [
			C && Fm(C),
			c && Vm(),
			l && Rm(l),
			u && Mm(),
			!h && Nm({
				container: e,
				flipBoundary: d,
				hasScrollableElement: n,
				isRtl: r,
				fallbackPositions: b
			}),
			zm({
				container: e,
				hasScrollableElement: n,
				overflowBoundary: f,
				disableTether: S,
				overflowBoundaryPadding: m,
				isRtl: r,
				shiftToCoverTarget: x
			}),
			C && Im(C, {
				container: e,
				overflowBoundary: f,
				overflowBoundaryPadding: m,
				isRtl: r
			}),
			Pm(),
			t && nm({
				element: t,
				padding: _
			}),
			tm({ strategy: "referenceHidden" }),
			tm({ strategy: "escaped" }),
			!1
		].filter(Boolean);
		return {
			placement: _m(y, g, r),
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
function Wm(e) {
	let t = P.useRef(null), n = P.useRef(null), r = P.useRef(null), i = P.useRef(null), a = P.useRef(null), { enabled: o = !0 } = e, s = Um(e), c = P.useCallback(() => {
		t.current && t.current.dispose(), t.current = null;
		let e = r.current ?? n.current;
		o && _i() && e && i.current && (t.current = jm({
			container: i.current,
			target: e,
			arrow: a.current,
			...s(i.current, a.current)
		}));
	}, [o, s]), l = L((e) => {
		r.current = e, c();
	});
	P.useImperativeHandle(e.positioningRef, () => ({
		updatePosition: () => t.current?.updatePosition(),
		setTarget: (t) => {
			e.target, l(t);
		}
	}), [e.target, l]), Si(() => {
		l(e.target ?? null);
	}, [e.target, l]), Si(() => {
		c();
	}, [c]);
	let u = Cm(null, (e) => {
		n.current !== e && (n.current = e, c());
	}), d = L((t) => e.onPositioningEnd?.call(e, t));
	return {
		targetRef: u,
		containerRef: Cm(null, (e) => {
			if (i.current !== e) {
				var t;
				(t = i.current) == null || t.removeEventListener("fui-positioningend", d), e?.addEventListener("fui-positioningend", d), i.current = e, c();
			}
		}),
		arrowRef: Cm(null, (e) => {
			a.current !== e && (a.current = e, c());
		})
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningMouseTarget.js
var Gm = (e) => {
	let [t, n] = P.useState(e);
	return [t, (e) => {
		if (e == null) {
			n(void 0);
			return;
		}
		let t;
		t = e instanceof MouseEvent ? e : e.nativeEvent, t instanceof MouseEvent;
		let r = ef(t);
		n(r);
	}];
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/createSafeZoneAreaStateStore.js
function Km() {
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
var qm = /* @__PURE__ */ s(((e) => {
	var t = p();
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
	var d = typeof window > "u" || window.document === void 0 || window.document.createElement === void 0 ? u : c;
	e.useSyncExternalStore = t.useSyncExternalStore === void 0 ? d : t.useSyncExternalStore;
})), Jm = /* @__PURE__ */ s(((e, t) => {
	t.exports = qm();
}));
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getRectCorners.js
function Ym(e, t) {
	return {
		topLeft: [e.left - t[0], e.top - t[1]],
		topRight: [e.right - t[0], e.top - t[1]],
		bottomRight: [e.right - t[0], e.bottom - t[1]],
		bottomLeft: [e.left - t[0], e.bottom - t[1]]
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getMouseAnchor.js
var Xm = 20;
function Zm(e, t) {
	return Math.sqrt((e[0] - t[0]) ** 2 + (e[1] - t[1]) ** 2);
}
function Qm(e, t) {
	let n = Zm(e, t);
	return n === 0 ? [0, 0] : [(e[0] - t[0]) / n, (e[1] - t[1]) / n];
}
function $m(e, t, n) {
	let r = [(e[0] + t[0]) / 2, (e[1] + t[1]) / 2], i = Qm([n[0], n[1]], [r[0], r[1]]), a = Zm([r[0], r[1]], [n[0], n[1]]);
	return [r[0] + i[0] * (a + Xm), r[1] + i[1] * (a + Xm)];
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/pointsToSvgPath.js
function eh(e) {
	return `M ${e} z`;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/SafeZoneArea.styles.js
var th = /*#__PURE__*/ I({
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
function nh(e) {
	if (e.width <= 0 || e.height <= 0) return "";
	let t = "";
	return t += `M ${e.x},${e.y} `, t += `V ${e.y + e.height} `, t += `H ${e.x + e.width} `, t += `V ${e.y} `, t += `H ${e.x} `, t += "Z ", t;
}
function rh(e, t, n) {
	let r = `M 0,0 H ${e} V ${t} H 0 Z `;
	return r += nh(n), r;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getSafeZonePoints.js
function ih(e, t) {
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
var ah = Jm(), oh = /*#__PURE__*/ P.memo((e) => {
	let { debug: t, onMouseEnter: n, onMouseMove: r, onMouseLeave: i, stateStore: a } = e, o = Di(), s = th(), c = (0, ah.useSyncExternalStore)(a.subscribe, a.isActive), l = P.useRef(null), u = P.useRef(null), d = P.useRef(null), f = P.useRef(null);
	return P.useImperativeHandle(e.imperativeRef, () => ({ updateSVG({ containerRect: e, targetRect: t, mouseCoordinates: n }) {
		var r, i, a;
		let o = Math.min(t.top, e.top), s = Math.min(t.left, e.left), c = Math.max(t.bottom, e.bottom), p = Math.max(t.right, e.right), m = Ym(e, [s, o]), h = Ym(t, [s, o]), g = [n[0] - s, n[1] - o], _ = $m(m.topLeft, m.bottomRight, g), v = p - s, y = c - o, b = rh(v, y, {
			x: h.topLeft[0],
			y: h.topLeft[1],
			width: t.width,
			height: t.height
		});
		l.current && (l.current.style.width = `${v}px`, l.current.style.height = `${y}px`, l.current.style.transform = `translate(${s}px, ${o}px)`);
		let x = ih(_, m);
		(r = u.current) == null || r.setAttribute("d", x.length > 0 ? eh(x) : ""), (i = d.current) == null || i.setAttribute("d", b), (a = f.current) == null || a.setAttribute("d", b);
	} }), []), /*#__PURE__*/ P.createElement("div", {
		className: A(s.wrapper, c && s.wrapperActive),
		"data-safe-zone": ""
	}, /*#__PURE__*/ P.createElement("svg", {
		"aria-hidden": !0,
		className: s.svg,
		xmlns: "http://www.w3.org/2000/svg",
		ref: l,
		style: {
			width: 0,
			height: 0,
			transform: "translate(0px, 0px)"
		}
	}, /*#__PURE__*/ P.createElement("g", {
		className: A(s.safeZone, t && s.safeZoneDebug),
		clipPath: `url(#${o})`,
		onMouseEnter: n,
		onMouseMove: r,
		onMouseLeave: i
	}, /*#__PURE__*/ P.createElement("path", { ref: u })), /*#__PURE__*/ P.createElement("clipPath", { id: o }, /*#__PURE__*/ P.createElement("path", { ref: d })), t && /*#__PURE__*/ P.createElement("path", {
		ref: f,
		className: s.rectDebug
	})));
}), sh = 2e3;
function ch({ debug: e = !1, disabled: t = !1, onSafeZoneEnter: n, onSafeZoneMove: r, onSafeZoneLeave: i, onSafeZoneTimeout: a, timeout: o = 1500 } = {}) {
	let [s] = P.useState(Km), c = P.useRef(null), l = P.useRef(null), u = P.useRef(null), [d, f] = Li(), [p, m] = fi(), h = P.useRef({
		x: 0,
		y: 0
	}), g = P.useMemo(() => {
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
	]), _ = P.useMemo(() => {
		if (t) return () => {};
		let e = null;
		function n(e) {
			h.current = {
				x: e.clientX,
				y: e.clientY
			}, s.isActive() || s.toggleActive(!0), d(() => {
				s.toggleActive(!1);
			}, sh);
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
	]), v = L((e) => {
		n?.(e), d(() => {
			s.toggleActive(!1), a?.();
		}, o);
	}), y = L((e) => {
		d(() => {
			s.toggleActive(!1), a?.();
		}, o), r?.(e);
	}), b = L((e) => {
		i?.(e);
	});
	return P.useEffect(() => s.subscribe((e) => {
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
		containerRef: Oi(l, g),
		targetRef: Oi(u, _),
		elementToRender: P.useMemo(() => t ? null : /*#__PURE__*/ P.createElement(oh, {
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
function lh(e) {
	return Vi(e) ? { element: e } : typeof e == "object" ? e === null ? { element: null } : e : {};
}
//#endregion
//#region node_modules/@fluentui/react-portal/lib/components/Portal/usePortalMountNodeStyles.styles.js
var uh = /*#__PURE__*/ I({ root: {
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
] }), dh = P.useInsertionEffect, fh = (e) => {
	let { className: t, dir: n, focusVisibleRef: r, targetNode: i } = e, a = P.useMemo(() => {
		if (i === void 0 || e.disabled) return null;
		let t = i.ownerDocument.createElement("div");
		return i.appendChild(t), t;
	}, [i, e.disabled]);
	return P.useMemo(() => {
		a && (a.className = t, a.setAttribute("dir", n), a.setAttribute("data-portal-node", "true"), r.current = a);
	}, [
		t,
		n,
		a,
		r
	]), P.useEffect(() => () => {
		a?.remove();
	}, [a]), a;
}, ph = () => {
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
}, mh = dh ? (e) => {
	"use no memo";
	let { className: t, dir: n, focusVisibleRef: r, targetNode: i } = e, [a] = P.useState(ph), o = P.useMemo(() => i === void 0 || e.disabled ? null : new Proxy({}, {
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
	return dh(() => {
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
	]), P.useEffect(() => () => {
		o?.remove();
	}, [o]), o;
} : fh, hh = (e) => {
	"use no memo";
	let { targetDocument: t, dir: n } = Qr(), r = si(), i = Rs(), a = uh(), o = Wr();
	return mh({
		dir: n,
		disabled: e.disabled,
		focusVisibleRef: i,
		className: A(o, a.root, e.className),
		targetNode: r ?? t?.body
	});
}, gh = (e) => {
	let { element: t, className: n } = lh(e.mountNode), r = P.useRef(null), i = hh({
		disabled: !!t,
		className: n
	}), a = t ?? i, o = {
		children: e.children,
		mountNode: a,
		virtualParentRootRef: r
	};
	return P.useEffect(() => {
		if (!a) return;
		let e = r.current, t = a.contains(e);
		if (e && !t) return Xi(a, e), () => {
			Xi(a, void 0);
		};
	}, [r, a]), o;
}, _h = /* @__PURE__ */ l(h(), 1), vh = (e) => /*#__PURE__*/ P.createElement("span", {
	hidden: !0,
	ref: e.virtualParentRootRef
}, e.mountNode && /*#__PURE__*/ _h.createPortal(/*#__PURE__*/ P.createElement(P.Fragment, null, e.children, /*#__PURE__*/ P.createElement("span", { hidden: !0 })), e.mountNode)), yh = (e) => vh(gh(e));
yh.displayName = "Portal";
//#endregion
//#region node_modules/@fluentui/react-tooltip/lib/components/Tooltip/private/useTooltipTimeout.js
var bh = (e) => -1, xh = (e) => void 0;
function Sh(e) {
	let { targetDocument: t } = Qr(), n = t?.defaultView, r = n ? n.setTimeout : bh, i = n ? n.clearTimeout : xh, a = P.useRef(void 0), o = P.useCallback((e, t) => (a.current !== void 0 && i(a.current), a.current = r(e, t ?? 0), a.current), [i, r]), s = P.useCallback(() => {
		a.current !== void 0 && (i(a.current), a.current = void 0);
	}, [i]);
	return P.useEffect(() => {
		let t = e.current;
		return () => {
			(!t || !t.isConnected) && s();
		};
	}, [s, e]), [o, s];
}
//#endregion
//#region node_modules/@fluentui/react-tooltip/lib/components/Tooltip/useTooltipBase.js
var Ch = (e) => {
	let t = Jr(), n = xi(), { targetDocument: r } = Qr(), [i, a] = mi({
		state: e.visible,
		initialState: !1
	}), [o, s] = P.useState(!1), { children: c, content: l, withArrow: u = !1, positioning: d = "above", onVisibleChange: f, relationship: p, showDelay: m = 250, hideDelay: h = 250, mountNode: g } = e, _ = {
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
		content: er(l, {
			defaultProps: { role: "tooltip" },
			elementType: "div"
		})
	};
	_.content.id = Di("tooltip-", _.content.id);
	let v = Sm(_.positioning), y = L((e) => {
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
	_.withArrow && (b.offset = dm(b.offset, 6));
	let { targetRef: x, containerRef: S, arrowRef: C } = Wm(b), [w, T] = Sh(S), E = P.useCallback((e, t) => {
		T(), a((n) => (t.visible !== n && f?.(e, t), t.visible));
	}, [
		T,
		a,
		f
	]);
	_.content.ref = Oi(_.content.ref, S), _.arrowRef = C, Si(() => {
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
	let D = P.useRef(!1), ee = P.useCallback((e) => {
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
	]), te = Gs(), [O] = P.useState(() => {
		let e = (e) => {
			e.detail?.isFocusedProgrammatically && !te() && (D.current = !0);
		}, t = null;
		return (n) => {
			t?.removeEventListener("keyborg:focusin", e), n?.addEventListener("keyborg:focusin", e), t = n;
		};
	}), k = P.useCallback((e) => {
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
	_.content.onPointerEnter = Bi(_.content.onPointerEnter, T), _.content.onPointerLeave = Bi(_.content.onPointerLeave, k), _.content.onFocus = Bi(_.content.onFocus, T), _.content.onBlur = Bi(_.content.onBlur, k);
	let ne = Gi(c), A = {}, re = ne?.props?.["aria-haspopup"] && (ne?.props?.["aria-expanded"] === !0 || ne?.props?.["aria-expanded"] === "true");
	return p === "label" ? typeof _.content.children == "string" ? A["aria-label"] = _.content.children : (A["aria-labelledby"] = _.content.id, _.shouldRenderTooltip = !0) : p === "description" && (A["aria-describedby"] = _.content.id, _.shouldRenderTooltip = !0), (n || re) && (_.shouldRenderTooltip = !1), _.children = Ui(c, {
		...A,
		...ne?.props,
		ref: Oi(zi(ne), O, b.target === void 0 ? x : void 0),
		onPointerEnter: L(Bi(ne?.props?.onPointerEnter, ee)),
		onPointerLeave: L(Bi(ne?.props?.onPointerLeave, k)),
		onFocus: L(Bi(ne?.props?.onFocus, ee)),
		onBlur: L(Bi(ne?.props?.onBlur, k))
	}), _;
}, wh = (e) => {
	"use no memo";
	let { appearance: t = "normal", ...n } = e;
	return {
		appearance: t,
		...Ch(n)
	};
}, Th = (e) => /*#__PURE__*/ ra(P.Fragment, { children: [e.children, e.shouldRenderTooltip && /*#__PURE__*/ R(yh, {
	mountNode: e.mountNode,
	children: /*#__PURE__*/ ra(e.content, { children: [e.withArrow && /*#__PURE__*/ R("div", {
		ref: e.arrowRef,
		className: e.arrowClassName
	}), e.content.children] })
})] }), Eh = { content: "fui-Tooltip__content" }, Dh = /*#__PURE__*/ I({
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
] }), Oh = (e) => {
	let t = Dh();
	return e.content.className = A(Eh.content, t.root, e.appearance === "inverted" && t.inverted, e.visible && t.visible, e.hidden && t.hidden, e.content.className), e.arrowClassName = t.arrow, e;
}, kh = (e) => {
	let t = wh(e);
	return Oh(t), ai("useTooltipStyles_unstable")(t), Th(t);
};
kh.displayName = "Tooltip", kh.isFluentTriggerComponent = !0;
//#endregion
//#region node_modules/@fluentui/react-button/lib/components/Button/renderButton.js
var Ah = (e) => {
	let { iconOnly: t, iconPosition: n } = e;
	return /*#__PURE__*/ ra(e.root, { children: [
		n !== "after" && e.icon && /*#__PURE__*/ R(e.icon, {}),
		!t && e.root.children,
		n === "after" && e.icon && /*#__PURE__*/ R(e.icon, {})
	] });
}, jh = P.createContext(void 0), Mh = {}, Nh = jh.Provider, Ph = () => P.useContext(jh) ?? Mh, Fh = (e, t) => {
	let { size: n } = Ph(), { appearance: r = "secondary", shape: i = "rounded", size: a = n ?? "medium", ...o } = e;
	return {
		appearance: r,
		shape: i,
		size: a,
		...Ih(o, t)
	};
}, Ih = (e, t) => {
	let { icon: n, iconPosition: r = "before", ...i } = e, a = tr(n, { elementType: "span" });
	return {
		disabled: e.disabled ?? !1,
		disabledFocusable: e.disabledFocusable ?? !1,
		iconPosition: r,
		iconOnly: !(!a?.children || e.children),
		components: {
			root: "button",
			icon: "span"
		},
		root: er(nu(i.as, i), {
			elementType: "button",
			defaultProps: {
				ref: t,
				type: e.as === "a" ? void 0 : "button"
			}
		}),
		icon: a
	};
}, Lh = {
	root: "fui-Button",
	icon: "fui-Button__icon"
};
`${K.strokeWidthThin}`;
var Rh = /*#__PURE__*/ qn("r1f29ykk", null, {
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
}), zh = /*#__PURE__*/ qn("rywnvv2", null, [".rywnvv2{align-items:center;display:inline-flex;justify-content:center;font-size:20px;height:20px;width:20px;--fui-Button__icon--spacing:var(--spacingHorizontalSNudge);}"]), Bh = /*#__PURE__*/ I({
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
}), Vh = /*#__PURE__*/ I({
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
}), Hh = /*#__PURE__*/ I({
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
}), Uh = /*#__PURE__*/ I({
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
] }), Wh = /*#__PURE__*/ I({
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
] }), Gh = (e) => {
	let t = Rh(), n = zh(), r = Bh(), i = Vh(), a = Hh(), o = Uh(), s = Wh(), { appearance: c, disabled: l, disabledFocusable: u, icon: d, iconOnly: f, iconPosition: p, shape: m, size: h } = e;
	return e.root.className = A(Lh.root, t, c && r[c], r[h], d && h === "small" && r.smallWithIcon, d && h === "large" && r.largeWithIcon, r[m], (l || u) && i.base, (l || u) && i.highContrast, c && (l || u) && i[c], c === "primary" && a.primary, a[h], a[m], f && o[h], e.root.className), e.icon && (e.icon.className = A(Lh.icon, n, !!e.root.children && s[p], s[h], e.icon.className)), e;
}, Kh = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = Fh(e, t);
	return Gh(n), ai("useButtonStyles_unstable")(n), Ah(n);
});
Kh.displayName = "Button";
//#endregion
//#region node_modules/@fluentui/react-field/lib/contexts/FieldContext.js
var qh = P.createContext(void 0);
qh.Provider;
var Jh = () => P.useContext(qh);
//#endregion
//#region node_modules/@fluentui/react-field/lib/contexts/useFieldControlProps.js
function Yh(e, t) {
	return Xh(Jh(), e, t);
}
function Xh(e, t, n) {
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
//#region node_modules/@fluentui/react-label/lib/components/Label/useLabel.js
var Zh = (e, t) => {
	let { weight: n = "regular", size: r = "medium", ...i } = e;
	return {
		weight: n,
		size: r,
		...Qh(i, t)
	};
}, Qh = (e, t) => {
	let { disabled: n = !1, required: r = !1, ...i } = e;
	return {
		disabled: n,
		required: tr(r === !0 ? "*" : r || void 0, {
			defaultProps: { "aria-hidden": "true" },
			elementType: "span"
		}),
		components: {
			root: "label",
			required: "span"
		},
		root: er(Ir("label", {
			ref: t,
			...i
		}), { elementType: "label" })
	};
}, $h = (e) => /*#__PURE__*/ ra(e.root, { children: [e.root.children, e.required && /*#__PURE__*/ R(e.required, {})] }), eg = {
	root: "fui-Label",
	required: "fui-Label__required"
}, tg = /*#__PURE__*/ I({
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
}), ng = (e) => {
	let t = tg();
	return e.root.className = A(eg.root, t.root, e.disabled && t.disabled, t[e.size], e.weight === "semibold" && t.semibold, e.root.className), e.required && (e.required.className = A(eg.required, t.required, e.disabled && t.disabled, e.required.className)), e;
}, rg = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = Zh(e, t);
	return ng(n), ai("useLabelStyles_unstable")(n), $h(n);
});
rg.displayName = "Label";
//#endregion
//#region node_modules/@fluentui/react-input/lib/components/Input/useInput.js
var ig = (e, t) => {
	let n = ti(), r = Jh(), { size: i = r?.size ?? "medium", appearance: a = n.inputDefaultAppearance ?? "outline", ...o } = e;
	return {
		size: i,
		appearance: a,
		...ag(o, t)
	};
}, ag = (e, t) => {
	let n = Yh(e, {
		supportsLabelFor: !0,
		supportsRequired: !0
	}), [r, i] = mi({
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
		input: er(n.input, {
			defaultProps: {
				type: "text",
				ref: t,
				...a.primary
			},
			elementType: "input"
		}),
		contentAfter: tr(n.contentAfter, { elementType: "span" }),
		contentBefore: tr(n.contentBefore, { elementType: "span" }),
		root: er(n.root, {
			defaultProps: a.root,
			elementType: "span"
		})
	};
	return o.input.value = r, o.input.onChange = L((e) => {
		var t;
		let r = e.target.value;
		(t = n.onChange) == null || t.call(n, e, { value: r }), i(r);
	}), o;
}, og = (e) => /*#__PURE__*/ ra(e.root, { children: [
	e.contentBefore && /*#__PURE__*/ R(e.contentBefore, {}),
	/*#__PURE__*/ R(e.input, {}),
	e.contentAfter && /*#__PURE__*/ R(e.contentAfter, {})
] }), sg = {
	root: "fui-Input",
	input: "fui-Input__input",
	contentBefore: "fui-Input__contentBefore",
	contentAfter: "fui-Input__contentAfter"
};
K.spacingHorizontalSNudge, K.spacingHorizontalMNudge, K.spacingHorizontalM, K.spacingHorizontalXXS, K.spacingHorizontalXXS, K.spacingHorizontalSNudge, K.spacingHorizontalS, K.spacingHorizontalM, `${K.spacingHorizontalM}${K.spacingHorizontalSNudge}`;
var cg = /*#__PURE__*/ qn("r1oeeo9n", "r9sxh5", {
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
}), lg = /*#__PURE__*/ I({
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
}), ug = /*#__PURE__*/ qn("r12stul0", null, [
	".r12stul0{align-self:stretch;box-sizing:border-box;flex-grow:1;min-width:0;border-style:none;padding:0 var(--spacingHorizontalM);color:var(--colorNeutralForeground1);background-color:transparent;outline-style:none;font-family:inherit;font-size:inherit;font-weight:inherit;line-height:inherit;}",
	".r12stul0::-webkit-input-placeholder{color:var(--colorNeutralForeground4);opacity:1;}",
	".r12stul0::-moz-placeholder{color:var(--colorNeutralForeground4);opacity:1;}",
	".r12stul0::placeholder{color:var(--colorNeutralForeground4);opacity:1;}"
]), dg = /*#__PURE__*/ I({
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
] }), fg = /*#__PURE__*/ qn("r1572tok", null, [".r1572tok{box-sizing:border-box;color:var(--colorNeutralForeground3);display:flex;}", ".r1572tok>svg{font-size:20px;}"]), pg = /*#__PURE__*/ I({
	disabled: { sj55zd: "f1s2aq7o" },
	small: { Duoase: "f3qv9w" },
	medium: {},
	large: { Duoase: "f16u2scb" }
}, { d: [
	".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
	".f3qv9w>svg{font-size:16px;}",
	".f16u2scb>svg{font-size:24px;}"
] }), mg = (e) => {
	let { size: t, appearance: n } = e, r = e.input.disabled, i = `${e.input["aria-invalid"]}` == "true", a = n.startsWith("filled"), o = lg(), s = dg(), c = pg();
	e.root.className = A(sg.root, cg(), o[t], e.contentBefore && o[`${t}WithContentBefore`], e.contentAfter && o[`${t}WithContentAfter`], o[n], !r && n === "outline" && o.outlineInteractive, !r && n === "underline" && o.underlineInteractive, !r && a && o.filledInteractive, a && o.filled, !r && i && o.invalid, r && o.disabled, e.root.className), e.input.className = A(sg.input, ug(), s[t], e.contentBefore && s[`${t}WithContentBefore`], e.contentAfter && s[`${t}WithContentAfter`], r && s.disabled, e.input.className);
	let l = [
		fg(),
		r && c.disabled,
		c[t]
	];
	return e.contentBefore && (e.contentBefore.className = A(sg.contentBefore, ...l, e.contentBefore.className)), e.contentAfter && (e.contentAfter.className = A(sg.contentAfter, ...l, e.contentAfter.className)), e;
}, hg = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = ig(e, t);
	return mg(n), ai("useInputStyles_unstable")(n), og(n);
});
hg.displayName = "Input";
var gg = P.createContext(void 0).Provider, _g = Dl(void 0), vg = {
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
}, yg = _g.Provider, bg = (e) => Ol(_g, (t = vg) => e(t)), xg = P.createContext(void 0), Sg = !1, Cg = xg.Provider, wg = () => P.useContext(xg) ?? Sg, Tg = Dl(void 0), Eg = {
	checkedValues: {},
	setFocusByFirstCharacter: () => null,
	toggleCheckbox: () => null,
	selectRadio: () => null,
	hasIcons: !1,
	hasCheckmarks: !1
}, Dg = Tg.Provider, Og = (e) => Ol(Tg, (t = Eg) => e(t)), kg = "fuimenuenter", Ag = (e) => {
	let { refs: t, callback: n, element: r, disabled: i } = e, a = L((e) => {
		let r = t[0], a = e.target;
		!Yi(r.current ?? null, a) && !i && n(e);
	});
	P.useEffect(() => {
		if (r != null) return i || r.addEventListener(kg, a), () => {
			r.removeEventListener(kg, a);
		};
	}, [
		a,
		r,
		i
	]);
}, jg = (e, t) => {
	e.dispatchEvent(new CustomEvent(kg, {
		bubbles: !0,
		detail: { nativeEvent: t }
	}));
};
//#endregion
//#region node_modules/@fluentui/react-menu/lib/utils/useIsSubmenu.js
function Mg() {
	let e = bg((e) => e.isSubmenu), t = kl(Tg);
	return e || t;
}
//#endregion
//#region node_modules/@fluentui/react-menu/lib/utils/useValidateNesting.js
var Ng = (e) => {
	let { targetDocument: t } = Qr();
	return bg((e) => e.triggerRef), bg((e) => e.inline), P.useRef(null);
}, Pg = "fuimenusafezonetimeout", Fg = (e) => {
	let t = P.useRef(null);
	return P.useCallback((n) => {
		var r;
		(r = t.current) == null || r.removeEventListener("fuimenusafezonetimeout", e), n?.addEventListener("fuimenusafezonetimeout", e), t.current = n;
	}, [e]);
}, Ig = /*#__PURE__*/ I({
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
] }), Lg = (e) => {
	let t = Ig();
	e.checkmark && (e.checkmark.className = A(t.root, e.checked && t.rootChecked, e.checkmark.className));
}, Rg = {
	root: "fui-MenuItem",
	icon: "fui-MenuItem__icon",
	checkmark: "fui-MenuItem__checkmark",
	submenuIndicator: "fui-MenuItem__submenuIndicator",
	content: "fui-MenuItem__content",
	secondaryContent: "fui-MenuItem__secondaryContent",
	subText: "fui-MenuItem__subText"
}, zg = /*#__PURE__*/ qn("rfoezjv", "r8lt3v0", {
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
}), Bg = /*#__PURE__*/ qn("r1ls86vo", "rpbc5dr", [".r1ls86vo{padding-left:2px;padding-right:2px;background-color:transparent;flex-grow:1;}", ".rpbc5dr{padding-right:2px;padding-left:2px;background-color:transparent;flex-grow:1;}"]), Vg = /*#__PURE__*/ qn("r12mwwux", "r1ewgu5j", [
	".r12mwwux{padding-left:2px;padding-right:2px;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);color:var(--colorNeutralForeground3);}",
	".r12mwwux:hover{color:var(--colorNeutralForeground3Hover);}",
	".r12mwwux:focus{color:var(--colorNeutralForeground3Hover);}",
	".r1ewgu5j{padding-right:2px;padding-left:2px;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);color:var(--colorNeutralForeground3);}",
	".r1ewgu5j:hover{color:var(--colorNeutralForeground3Hover);}",
	".r1ewgu5j:focus{color:var(--colorNeutralForeground3Hover);}"
]), Hg = /*#__PURE__*/ qn("ro9koqv", null, [".ro9koqv{width:20px;height:20px;font-size:20px;line-height:0;align-items:center;display:inline-flex;justify-content:center;flex-shrink:0;}"]), Ug = /*#__PURE__*/ qn("r9c34qo", null, [".r9c34qo{width:20px;height:20px;font-size:20px;line-height:0;align-items:center;display:inline-flex;justify-content:center;}"]), Wg = /*#__PURE__*/ qn("rk2ppru", null, [".rk2ppru{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase100);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase100);color:var(--colorNeutralForeground3);}"]), Gg = /*#__PURE__*/ I({
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
}), Kg = /*#__PURE__*/ I({ disabled: {
	sj55zd: "f1s2aq7o",
	B7iucu3: "f1cyfu5x"
} }, {
	d: [".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}"],
	m: [["@media (forced-colors: active){.f1cyfu5x{color:GrayText;}}", { m: "(forced-colors: active)" }]]
}), qg = /*#__PURE__*/ I({
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
] }), Jg = (e) => {
	let t = Gg(), n = zg(), r = Bg(), i = Vg(), a = Hg(), o = Ug(), s = qg(), c = Wg(), l = Kg(), u = !!e.subText;
	return e.root.className = A(Rg.root, n, e.submenuOpen && t.submenuOpen, e.disabled && t.disabled, e.root.className), e.content && (e.content.className = A(Rg.content, r, e.content.className, u && s.content)), e.checkmark && (e.checkmark.className = A(Rg.checkmark, t.checkmark, e.checkmark.className)), e.secondaryContent && (e.secondaryContent.className = A(Rg.secondaryContent, i, e.disabled && t.disabled, e.secondaryContent.className, u && s.secondaryContent)), e.icon && (e.icon.className = A(Rg.icon, a, e.icon.className)), e.submenuIndicator && (e.submenuIndicator.className = A(Rg.submenuIndicator, o, e.submenuIndicator.className, u && s.submenuIndicator)), e.subText && (e.subText.className = A(Rg.subText, e.disabled && l.disabled, e.subText.className, c)), Lg(e), e;
}, Yg = q.durationSlower, Xg = q.curveDecelerateMid, Zg = sd(({ distance: e = 10 }) => ({
	enter: [Pd({
		duration: Yg,
		easing: Xg,
		direction: "enter"
	}), {
		...Id({
			duration: Yg,
			easing: Xg,
			direction: "enter",
			outX: `calc(var(${sf}, 0px) * ${e})`,
			outY: `calc(var(${cf}, 0px) * ${e})`
		}),
		composite: "accumulate"
	}],
	exit: []
})), Qg = [
	"after",
	"after-bottom",
	"before-top",
	"before",
	"before-bottom",
	"above"
], $g = (e) => {
	let { surfaceMotion: t, ...n } = e, r = e_(n);
	return {
		...r,
		components: { surfaceMotion: Zg },
		surfaceMotion: yd(t, {
			elementType: Zg,
			defaultProps: {
				visible: r.open,
				appear: !0,
				unmountOnExit: !0
			}
		})
	};
}, e_ = (e) => {
	let t = Mg(), { hoverDelay: n = 500, inline: r = !1, hasCheckmarks: i = !1, hasIcons: a = !1, closeOnScroll: o = !1, openOnContext: s = !1, persistOnItemClick: c = !1, openOnHover: l = t, defaultCheckedValues: u, mountNode: d = null, safeZone: f } = e, { targetDocument: p } = Qr(), m = Di("menu"), [h, g] = Gm(), _ = Sm(e.positioning), v = uf({
		targetDocument: p,
		onPositioningEnd: _.onPositioningEnd
	}), y = {
		position: t ? "after" : "below",
		align: t ? "top" : "start",
		target: e.openOnContext ? h : void 0,
		fallbackPositions: t ? Qg : void 0,
		..._,
		onPositioningEnd: v
	}, b = P.Children.toArray(e.children), x, S;
	b.length === 2 ? (x = b[0], S = b[1]) : b.length === 1 && (S = b[0]);
	let { targetRef: C, containerRef: w } = Wm(y), T = f && l, E = P.useRef({
		isInside: !1,
		mouseCoordinates: {
			x: 0,
			y: 0
		}
	}), D = ch({
		disabled: !T,
		timeout: typeof f == "object" ? f.timeout : 300,
		onSafeZoneEnter: (e) => {
			k(e, {
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
			let e = new CustomEvent(Pg);
			k(e, {
				open: !1,
				keyboard: !1,
				type: "menuSafeZoneTimeout",
				event: e
			}), E.current.isInside && p && p.elementsFromPoint(E.current.mouseCoordinates.x, E.current.mouseCoordinates.y).find((e) => e.classList.contains(Rg.root))?.dispatchEvent(e);
		}
	}), ee = Oi(C, D.targetRef), te = Oi(w, D.containerRef), [O, k] = n_({
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
	}), [ne, A] = t_({
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
		open: O,
		setOpen: k,
		checkedValues: ne,
		onCheckedValueChange: A,
		persistOnItemClick: c,
		safeZone: D.elementToRender
	};
}, t_ = (e) => {
	let [t, n] = mi({
		state: e.checkedValues,
		defaultState: e.defaultCheckedValues,
		initialState: {}
	});
	return [t, L((t, { name: r, checkedItems: i }) => {
		var a;
		(a = e.onCheckedValueChange) == null || a.call(e, t, {
			name: r,
			checkedItems: i
		}), n((e) => ({
			...e,
			[r]: i
		}));
	})];
}, n_ = (e) => {
	let { targetDocument: t } = Qr(), n = bg((e) => e.setOpen), r = L((t, n) => e.onOpenChange?.call(e, t, n)), i = P.useRef(!1), [a, o] = mi({
		state: e.open,
		defaultState: e.defaultOpen,
		initialState: !1
	}), s = L((t, i) => {
		let a = t instanceof CustomEvent && t.type === "fuimenuenter" ? t.detail.nativeEvent : t;
		r?.(a, { ...i }), i.open && t.type === "contextmenu" && e.setContextTarget(t), i.open || e.setContextTarget(void 0), i.bubble && n(t, { ...i }), o(i.open);
	}), [c, l] = Li(), u = L((t, n) => {
		l(), !(t instanceof Event) && t.persist && t.persist(), !n.ignoreHoverDelay && (t.type === "mouseleave" || t.type === "mouseover" || t.type === "mousemove" || t.type === "fuimenuenter") ? (e.triggerRef.current?.contains(t.target) && (i.current = t.type === "mouseover" || t.type === "mousemove"), c(() => s(t, n), e.hoverDelay)) : s(t, n);
	});
	Ai({
		contains: Yi,
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
	Pi({
		contains: Yi,
		element: t,
		callback: (e) => u(e, {
			open: !1,
			type: "scrollOutside",
			event: e
		}),
		refs: [e.menuPopoverRef, !e.openOnContext && e.triggerRef].filter(Boolean),
		disabled: !a || !d
	}), Ag({
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
	let { findFirstFocusable: f } = _s(), p = P.useCallback(() => {
		f(e.menuPopoverRef.current)?.focus();
	}, [f, e.menuPopoverRef]), m = Ci();
	return P.useEffect(() => {
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
function r_(e) {
	let { checkedValues: t, hasCheckmarks: n, hasIcons: r, inline: i, isSubmenu: a, menuPopoverRef: o, mountNode: s, onCheckedValueChange: c, open: l, openOnContext: u, openOnHover: d, persistOnItemClick: f, safeZone: p, setOpen: m, triggerId: h, triggerRef: g } = e;
	return { menu: P.useMemo(() => ({
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
var i_ = (e, t) => /*#__PURE__*/ ra(yg, {
	value: t.menu,
	children: [e.menuTrigger, e.menuPopover && /*#__PURE__*/ R(e.surfaceMotion, { children: /*#__PURE__*/ R(vd, { children: e.menuPopover }) })]
}), a_ = (e) => {
	let t = $g(e);
	return i_(t, r_(t));
};
a_.displayName = "Menu";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuDivider/useMenuDivider.js
var o_ = (e, t) => ({
	components: { root: "div" },
	root: er(Ir("div", {
		role: "presentation",
		"aria-hidden": !0,
		...e,
		ref: t
	}), { elementType: "div" })
}), s_ = { root: "fui-MenuDivider" }, c_ = /*#__PURE__*/ I({ root: {
	jrapky: 0,
	Frg6f3: 0,
	t21cq0: 0,
	B6of3ja: 0,
	B74szlk: "f8dz51a",
	a9b677: "f14z66ap",
	B9xav0g: 0,
	oivjwe: 0,
	Bn0qgzm: 0,
	Bgfg5da: "f1facbz3"
} }, { d: [
	[".f8dz51a{margin:4px -5px 4px -5px;}", { p: -1 }],
	".f14z66ap{width:auto;}",
	[".f1facbz3{border-bottom:var(--strokeWidthThin) solid var(--colorNeutralStroke2);}", { p: -1 }]
] }), l_ = (e) => {
	let t = c_();
	return e.root.className = A(s_.root, t.root, e.root.className), e;
}, u_ = (e) => /*#__PURE__*/ R(e.root, {}), d_ = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = o_(e, t);
	return l_(n), ai("useMenuDividerStyles_unstable")(n), u_(n);
});
d_.displayName = "MenuDivider";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuItem/useCharacterSearch.js
var f_ = (e, t) => {
	let n = Og((e) => e.setFocusByFirstCharacter), { onKeyDown: r } = e.root;
	return e.root.onKeyDown = (e) => {
		r?.(e), !(e.key?.length > 1) && t.current && n?.(e, t.current);
	}, e;
}, p_ = P.createContext(void 0), m_ = { setMultiline: () => null };
p_.Provider;
var h_ = () => P.useContext(p_) ?? m_, g_ = () => h_() !== m_, __ = (e, t) => {
	let n = wg(), r = bg((e) => e.persistOnItemClick), { as: i = "div", disabled: a = !1, hasSubmenu: o = n, persistOnClick: s = r, content: c, ...l } = e, { hasIcons: u, hasCheckmarks: d } = y_({ hasSubmenu: o }), f = bg((e) => e.setOpen), p = bg((e) => e.open);
	v_({
		multiline: !!e.subText,
		hasSubmenu: o
	});
	let m = P.useRef(null), h = P.useRef(!1), g = Ng(b_(e.role)), _ = {
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
		root: er(Ir(i, nu(i, {
			role: "menuitem",
			...l,
			disabled: !1,
			disabledFocusable: a,
			ref: Oi(t, m, g),
			onKeyDown: L((t) => {
				var n;
				(n = e.onKeyDown) == null || n.call(e, t), !t.isDefaultPrevented() && (t.key === " " || t.key === "Enter") && (h.current = !0);
			}),
			onMouseMove: L((t) => {
				var n;
				if (t.currentTarget.ownerDocument.activeElement !== t.currentTarget) {
					var r;
					(r = m.current) == null || r.focus();
				}
				(n = e.onMouseMove) == null || n.call(e, t);
			}),
			onClick: L((t) => {
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
		icon: tr(e.icon, {
			renderByDefault: u,
			elementType: "span"
		}),
		checkmark: tr(e.checkmark, {
			renderByDefault: d,
			elementType: "span"
		}),
		submenuIndicator: tr(e.submenuIndicator, {
			renderByDefault: o,
			elementType: "span"
		}),
		content: tr(e.content, {
			renderByDefault: !!e.children,
			defaultProps: { children: e.children },
			elementType: "span"
		}),
		secondaryContent: tr(e.secondaryContent, { elementType: "span" }),
		subText: tr(e.subText, { elementType: "span" })
	};
	return f_(_, m), _;
}, v_ = (e) => {
	let { hasSubmenu: t, multiline: n } = e, r = g_() && t, { setMultiline: i } = h_();
	Si(() => {
		r || i(n);
	}, [
		i,
		n,
		r
	]);
}, y_ = (e) => {
	let { hasSubmenu: t } = e, n = Og((e) => e.hasIcons), r = Og((e) => e.hasCheckmarks), i = g_() && t;
	return {
		hasIcons: n && !i,
		hasCheckmarks: r && !i
	};
}, b_ = (e) => {
	switch (e) {
		case "menuitemcheckbox": return "MenuItemCheckbox";
		case "menuitemradio": return "MenuItemRadio";
	}
	return "MenuItem";
}, x_ = Vu(wu, Tu), S_ = Vu(Su, Cu), C_ = (e, t) => {
	let { dir: n } = Qr(), r = __(e, t);
	if (r.submenuIndicator) {
		var i;
		(i = r.submenuIndicator).children ?? (i.children = n === "rtl" ? /*#__PURE__*/ P.createElement(S_, null) : /*#__PURE__*/ P.createElement(x_, null));
	}
	return r;
}, w_ = (e) => /*#__PURE__*/ ra(e.root, { children: [
	e.checkmark && /*#__PURE__*/ R(e.checkmark, {}),
	e.icon && /*#__PURE__*/ R(e.icon, {}),
	e.content && /*#__PURE__*/ ra(e.content, { children: [e.content.children, e.subText && /*#__PURE__*/ R(e.subText, {})] }),
	e.secondaryContent && /*#__PURE__*/ R(e.secondaryContent, {}),
	e.submenuIndicator && /*#__PURE__*/ R(e.submenuIndicator, {})
] }), T_ = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = C_(e, t);
	return Jg(n), ai("useMenuItemStyles_unstable")(n), w_(n);
});
T_.displayName = "MenuItem";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuList/useMenuList.js
var E_ = [
	"menuitem",
	"menuitemcheckbox",
	"menuitemradio"
], D_ = E_.map((e) => `[role="${e}"]`).join(","), O_ = (e, t) => {
	let n = j_(), r = kl(_g);
	M_(e, n, r) && console.warn("You are using both MenuList and Menu props, we recommend you to use Menu props when available");
	let i = P.useRef(null), { findAllFocusable: a } = _s(), { targetDocument: o } = Qr(), s = hs({ circular: !0 }), c = k_(e, t), l = Oi(c.root.ref, i);
	P.useEffect(() => {
		let e = i.current;
		if (!r || !o || !e) return;
		let t = (t) => {
			let n = t.detail.next;
			n && e.contains(o.activeElement) && !e.contains(n) && t.preventDefault();
		};
		return o.addEventListener(Ia, t), () => {
			o.removeEventListener(Ia, t);
		};
	}, [r, o]);
	let u = P.useCallback((e, t) => {
		i.current && A_(a(i.current, (e) => e.hasAttribute("role") && E_.indexOf(e.getAttribute("role")) !== -1), e.key, t);
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
}, k_ = (e, t) => {
	let n = bg((e) => e.triggerId), r = bg((e) => e.checkedValues), i = bg((e) => e.onCheckedValueChange), a = bg((e) => e.hasIcons), o = bg((e) => e.hasCheckmarks), s = kl(_g), c = P.useRef(null), l = Ng("MenuList"), u = P.useCallback((e, t) => {
		c.current && A_(Array.from(c.current.querySelectorAll(D_)), e.key, t);
	}, []), [d, f] = mi({
		state: e.checkedValues ?? (s ? r : void 0),
		defaultState: e.defaultCheckedValues,
		initialState: {}
	}), p = e.onCheckedValueChange ?? (s ? i : void 0), m = L((e, t, n, r) => {
		let i = [...d?.[t] || []];
		r ? i.splice(i.indexOf(n), 1) : i.push(n), p?.(e, {
			name: t,
			checkedItems: i
		}), f((e) => ({
			...e,
			[t]: i
		}));
	}), h = L((e, t, n) => {
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
		root: er(Ir("div", {
			ref: Oi(t, c, l),
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
}, A_ = (e, t, n) => {
	let r = e.indexOf(n) + 1;
	r === e.length && (r = 0);
	let i = e.map((e) => e.textContent?.charAt(0).toLowerCase()), a = t.toLowerCase(), o = (e) => {
		for (let t = e; t < i.length; t++) if (a === i[t]) return t;
		return -1;
	}, s = o(r);
	s === -1 && (s = o(0)), s > -1 && e[s].focus();
}, j_ = () => ({
	checkedValues: bg((e) => e.checkedValues),
	onCheckedValueChange: bg((e) => e.onCheckedValueChange),
	triggerId: bg((e) => e.triggerId),
	hasIcons: bg((e) => e.hasIcons),
	hasCheckmarks: bg((e) => e.hasCheckmarks)
}), M_ = (e, t, n) => {
	let r = !1;
	for (let n in t) e[n] && (r = !0);
	return n && r;
}, N_ = (e, t) => /*#__PURE__*/ R(Dg, {
	value: t.menuList,
	children: /*#__PURE__*/ R(e.root, {})
});
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuList/useMenuListContextValues.js
function P_(e) {
	let { checkedValues: t, hasCheckmarks: n, hasIcons: r, selectRadio: i, setFocusByFirstCharacter: a, toggleCheckbox: o } = e;
	return { menuList: P.useMemo(() => ({
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
var F_ = { root: "fui-MenuList" }, I_ = /*#__PURE__*/ I({
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
] }), L_ = (e) => {
	let t = I_();
	return e.root.className = A(F_.root, t.root, e.hasMenuContext && t.hasMenuContext, e.root.className), e;
}, R_ = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = O_(e, t), r = P_(n);
	return L_(n), ai("useMenuListStyles_unstable")(n), N_(n, r);
});
R_.displayName = "MenuList";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuPopover/useMenuPopover.js
var z_ = (e, t) => {
	"use no memo";
	let n = bg((e) => e.safeZone), r = bg((e) => e.menuPopoverRef), i = bg((e) => e.setOpen), a = bg((e) => e.open), o = bg((e) => e.openOnHover), s = bg((e) => e.triggerRef), c = Mg(), l = Og((e) => e.shouldCloseOnArrowLeft ?? !0), u = P.useRef(!0), [d, f] = Li(), { dir: p } = Qr(), m = p === "ltr" ? eu : tu, h = P.useCallback((e) => {
		e && e.addEventListener("mouseover", (e) => {
			u.current && (u.current = !1, jg(r.current, e), d(() => {
				u.current = !0;
			}, 250));
		});
	}, [r, d]);
	P.useEffect(() => () => f(), [f]);
	let g = bg((e) => e.inline) ?? !1, _ = bg((e) => e.mountNode), v = er(Ir("div", {
		role: "presentation",
		...e,
		ref: Oi(t, r, h)
	}), { elementType: "div" }), { onMouseEnter: y, onKeyDown: b } = v;
	return v.onMouseEnter = L((e) => {
		(o || c) && i(e, {
			open: !0,
			keyboard: !1,
			type: "menuPopoverMouseEnter",
			event: e
		}), y?.(e);
	}), v.onKeyDown = L((e) => {
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
}, B_ = (e, t) => {
	let n = Bs(Ws(), ms({ focusable: { ignoreKeydown: { Escape: !0 } } })), r = _d(), i = z_(e, t);
	return {
		...i,
		root: {
			...n,
			...i.root,
			ref: Oi(i.root.ref, r)
		}
	};
}, V_ = { root: "fui-MenuPopover" }, H_ = /*#__PURE__*/ I({ root: {
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
] }), U_ = (e) => {
	let t = H_();
	return e.root.className = A(V_.root, t.root, e.root.className), e;
}, W_ = (e) => e.inline ? /*#__PURE__*/ ra(P.Fragment, { children: [/*#__PURE__*/ R(e.root, {}), e.safeZone] }) : /*#__PURE__*/ ra(yh, {
	mountNode: e.mountNode,
	children: [/*#__PURE__*/ R(e.root, {}), e.safeZone]
}), G_ = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = B_(e, t);
	return U_(n), ai("useMenuPopoverStyles_unstable")(n), W_(n);
});
G_.displayName = "MenuPopover";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuTrigger/useMenuTrigger.js
function K_() {}
var q_ = (e) => {
	let t = bg((e) => e.menuPopoverRef), { findFirstFocusable: n } = _s(), r = P.useCallback(() => {
		n(t.current)?.focus();
	}, [n, t]);
	return J_({
		...e,
		focusFirst: r
	});
}, J_ = (e) => {
	let { children: t, disableButtonEnhancement: n = !1, focusFirst: r } = e, i = bg((e) => e.triggerRef), a = bg((e) => e.setOpen), o = bg((e) => e.open), s = bg((e) => e.triggerId), c = bg((e) => e.openOnHover), l = bg((e) => e.openOnContext), u = Mg(), d = Og((e) => e.shouldOpenOnArrowRight ?? !0), f = P.useRef(!1), p = P.useRef(!1), m = P.useRef(!1), { dir: h } = Qr(), g = h === "ltr" ? tu : eu, _ = Gi(t), v = Fg(L(() => {
		u && (p.current = !0);
	})), y = (e) => {
		Y_(e) || e.isDefaultPrevented() || l && (e.preventDefault(), a(e, {
			open: !0,
			keyboard: !1,
			type: "menuTriggerContextMenu",
			event: e
		}));
	}, b = (e) => {
		Y_(e) || l || (a(e, {
			open: !o,
			keyboard: f.current,
			type: "menuTriggerClick",
			event: e
		}), f.current = !1);
	}, x = (e) => {
		if (Y_(e) || e.isDefaultPrevented()) return;
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
		Y_(e) || c && (m.current ? a(e, {
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
		Y_(e) || c && !m.current && (a(e, {
			open: !0,
			keyboard: !1,
			type: "menuTriggerMouseMove",
			event: e
		}), m.current = !0);
	}, w = (e) => {
		Y_(e) || c && a(e, {
			open: !1,
			keyboard: !1,
			type: "menuTriggerMouseLeave",
			event: e
		});
	}, T = {
		id: s,
		..._?.props,
		ref: Oi(i, zi(_), v),
		onMouseEnter: L(_?.props.onMouseEnter ?? K_),
		onMouseLeave: L(Bi(_?.props.onMouseLeave, w)),
		onContextMenu: L(Bi(_?.props.onContextMenu, y)),
		onMouseMove: L(Bi(_?.props.onMouseMove, C)),
		onMouseOver: L(Bi(_?.props.onMouseOver, S))
	}, E = {
		"aria-haspopup": "menu",
		"aria-expanded": !o && !u ? void 0 : o,
		...T,
		onClick: L(Bi(_?.props.onClick, b)),
		onKeyDown: L(Bi(_?.props.onKeyDown, x))
	}, D = nu(_?.type === "button" || _?.type === "a" ? _.type : "div", E);
	return {
		isSubmenu: u,
		children: Ui(t, l ? T : n ? E : D)
	};
}, Y_ = (e) => {
	let t = (e) => e.hasAttribute("disabled") || e.hasAttribute("aria-disabled") && e.getAttribute("aria-disabled") === "true";
	return Vi(e.target) && t(e.target) ? !0 : Vi(e.currentTarget) && t(e.currentTarget);
}, X_ = (e) => /*#__PURE__*/ P.createElement(Cg, { value: e.isSubmenu }, e.children), Z_ = (e) => X_(q_(e));
Z_.displayName = "MenuTrigger", Z_.isFluentTriggerComponent = !0;
//#endregion
//#region node_modules/@fluentui/react-spinner/lib/contexts/SpinnerContext.js
var Q_ = P.createContext(void 0), $_ = {};
Q_.Provider;
var ev = () => P.useContext(Q_) ?? $_, tv = (e, t) => {
	let { size: n } = ev(), { appearance: r = "primary", size: i = n ?? "medium", ...a } = e, o = nv(a, t);
	return {
		...o,
		appearance: r,
		size: i,
		components: {
			...o.components,
			label: rg
		},
		label: tr(e.label, {
			defaultProps: o.label,
			elementType: rg
		})
	};
}, nv = (e, t) => {
	let { delay: n = 0, labelPosition: r = "after" } = e, i = Di("spinner"), { role: a = "progressbar", ...o } = e, s = er(Ir("div", {
		ref: t,
		role: a,
		...o
	}), { elementType: "div" }), [c, l] = P.useState(!1), [u, d] = Li();
	P.useEffect(() => {
		if (!(n <= 0)) return u(() => {
			l(!0);
		}, n), () => {
			d();
		};
	}, [
		u,
		d,
		n
	]);
	let f = tr(e.label, {
		defaultProps: { id: i },
		renderByDefault: !1,
		elementType: "label"
	}), p = tr(e.spinner, {
		renderByDefault: !0,
		elementType: "span"
	});
	return f && s && !s["aria-labelledby"] && (s["aria-labelledby"] = f.id), {
		delay: n,
		labelPosition: r,
		shouldRenderSpinner: !n || c,
		components: {
			root: "div",
			spinner: "span",
			spinnerTail: "span",
			label: "label"
		},
		root: s,
		spinner: p,
		spinnerTail: er(e.spinnerTail, { elementType: "span" }),
		label: f
	};
}, rv = (e) => {
	let { labelPosition: t, shouldRenderSpinner: n } = e;
	return /*#__PURE__*/ ra(e.root, { children: [
		e.label && n && (t === "above" || t === "before") && /*#__PURE__*/ R(e.label, {}),
		e.spinner && n && /*#__PURE__*/ R(e.spinner, { children: e.spinnerTail && /*#__PURE__*/ R(e.spinnerTail, {}) }),
		e.label && n && (t === "below" || t === "after") && /*#__PURE__*/ R(e.label, {})
	] });
}, iv = {
	root: "fui-Spinner",
	spinner: "fui-Spinner__spinner",
	spinnerTail: "fui-Spinner__spinnerTail",
	label: "fui-Spinner__label"
}, av = /*#__PURE__*/ qn("rpp59a7", null, [".rpp59a7{display:flex;align-items:center;justify-content:center;line-height:0;gap:8px;overflow:hidden;min-width:min-content;}"]), ov = /*#__PURE__*/ I({ vertical: { Beiy3e4: "f1vx9l62" } }, { d: [".f1vx9l62{flex-direction:column;}"] }), sv = /*#__PURE__*/ qn("rvgcg50", "r15nd2jo", {
	r: [
		".rvgcg50{position:relative;flex-shrink:0;-webkit-mask-image:radial-gradient(closest-side, transparent calc(100% - var(--fui-Spinner--strokeWidth) - 1px), white calc(100% - var(--fui-Spinner--strokeWidth)) calc(100% - 1px), transparent 100%);mask-image:radial-gradient(closest-side, transparent calc(100% - var(--fui-Spinner--strokeWidth) - 1px), white calc(100% - var(--fui-Spinner--strokeWidth)) calc(100% - 1px), transparent 100%);background-color:var(--colorBrandStroke2Contrast);color:var(--colorBrandStroke1);animation-duration:1.5s;animation-iteration-count:infinite;animation-timing-function:linear;animation-name:rb7n1on;}",
		"@keyframes rb7n1on{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}",
		".r15nd2jo{position:relative;flex-shrink:0;-webkit-mask-image:radial-gradient(closest-side, transparent calc(100% - var(--fui-Spinner--strokeWidth) - 1px), white calc(100% - var(--fui-Spinner--strokeWidth)) calc(100% - 1px), transparent 100%);mask-image:radial-gradient(closest-side, transparent calc(100% - var(--fui-Spinner--strokeWidth) - 1px), white calc(100% - var(--fui-Spinner--strokeWidth)) calc(100% - 1px), transparent 100%);background-color:var(--colorBrandStroke2Contrast);color:var(--colorBrandStroke1);animation-duration:1.5s;animation-iteration-count:infinite;animation-timing-function:linear;animation-name:r1gx3jof;}",
		"@keyframes r1gx3jof{0%{transform:rotate(0deg);}100%{transform:rotate(-360deg);}}"
	],
	s: [
		"@media screen and (forced-colors: active){.rvgcg50{background-color:HighlightText;color:Highlight;forced-color-adjust:none;}}",
		"@media screen and (prefers-reduced-motion: reduce){.rvgcg50{animation-duration:1.8s;}}",
		"@media screen and (forced-colors: active){.r15nd2jo{background-color:HighlightText;color:Highlight;forced-color-adjust:none;}}",
		"@media screen and (prefers-reduced-motion: reduce){.r15nd2jo{animation-duration:1.8s;}}"
	]
}), cv = /*#__PURE__*/ qn("rxov3xa", "r1o544mv", {
	r: [
		".rxov3xa{position:absolute;display:block;width:100%;height:100%;-webkit-mask-image:conic-gradient(transparent 105deg, white 105deg);mask-image:conic-gradient(transparent 105deg, white 105deg);animation-duration:1.5s;animation-iteration-count:infinite;animation-timing-function:var(--curveEasyEase);animation-name:r15mim6k;}",
		".rxov3xa::before,.rxov3xa::after{content:\"\";position:absolute;display:block;width:100%;height:100%;animation:inherit;background-image:conic-gradient(currentcolor 135deg, transparent 135deg);}",
		"@keyframes r15mim6k{0%{transform:rotate(-135deg);}50%{transform:rotate(0deg);}100%{transform:rotate(225deg);}}",
		".rxov3xa::before{animation-name:r18vhmn8;}",
		"@keyframes r18vhmn8{0%{transform:rotate(0deg);}50%{transform:rotate(105deg);}100%{transform:rotate(0deg);}}",
		".rxov3xa::after{animation-name:rkgrvoi;}",
		"@keyframes rkgrvoi{0%{transform:rotate(0deg);}50%{transform:rotate(225deg);}100%{transform:rotate(0deg);}}",
		".r1o544mv{position:absolute;display:block;width:100%;height:100%;-webkit-mask-image:conic-gradient(transparent 105deg, white 105deg);mask-image:conic-gradient(transparent 105deg, white 105deg);animation-duration:1.5s;animation-iteration-count:infinite;animation-timing-function:var(--curveEasyEase);animation-name:r109gmi5;}",
		".r1o544mv::before,.r1o544mv::after{content:\"\";position:absolute;display:block;width:100%;height:100%;animation:inherit;background-image:conic-gradient(currentcolor 135deg, transparent 135deg);}",
		"@keyframes r109gmi5{0%{transform:rotate(135deg);}50%{transform:rotate(0deg);}100%{transform:rotate(-225deg);}}",
		".r1o544mv::before{animation-name:r17whflh;}",
		"@keyframes r17whflh{0%{transform:rotate(0deg);}50%{transform:rotate(-105deg);}100%{transform:rotate(0deg);}}",
		".r1o544mv::after{animation-name:re4odhl;}",
		"@keyframes re4odhl{0%{transform:rotate(0deg);}50%{transform:rotate(-225deg);}100%{transform:rotate(0deg);}}"
	],
	s: ["@media screen and (prefers-reduced-motion: reduce){.rxov3xa{animation-iteration-count:0;background-image:conic-gradient(transparent 120deg, currentcolor 360deg);}.rxov3xa::before,.rxov3xa::after{content:none;}}", "@media screen and (prefers-reduced-motion: reduce){.r1o544mv{animation-iteration-count:0;background-image:conic-gradient(transparent 120deg, currentcolor 360deg);}.r1o544mv::before,.r1o544mv::after{content:none;}}"]
}), lv = /*#__PURE__*/ I({
	inverted: {
		De3pzq: "fr407j0",
		sj55zd: "f1f7voed"
	},
	rtlTail: {
		btxmck: "f179dep3",
		gb5jj2: "fbz9ihp",
		Bdya8wy: "f1pme1qz"
	},
	"extra-tiny": {
		Bqenvij: "fd461yt",
		a9b677: "fjw5fx7",
		qmp6fs: "f1v3ph3m"
	},
	tiny: {
		Bqenvij: "fjamq6b",
		a9b677: "f64fuq3",
		qmp6fs: "f1v3ph3m"
	},
	"extra-small": {
		Bqenvij: "frvgh55",
		a9b677: "fq4mcun",
		qmp6fs: "f1v3ph3m"
	},
	small: {
		Bqenvij: "fxldao9",
		a9b677: "f1w9dchk",
		qmp6fs: "f1v3ph3m"
	},
	medium: {
		Bqenvij: "f1d2rq10",
		a9b677: "f1szoe96",
		qmp6fs: "fb52u90"
	},
	large: {
		Bqenvij: "f8ljn23",
		a9b677: "fpdz1er",
		qmp6fs: "fb52u90"
	},
	"extra-large": {
		Bqenvij: "fbhnoac",
		a9b677: "feqmc2u",
		qmp6fs: "fb52u90"
	},
	huge: {
		Bqenvij: "f1ft4266",
		a9b677: "fksc0bp",
		qmp6fs: "fa3u9ii"
	}
}, {
	d: [
		".fr407j0{background-color:var(--colorNeutralStrokeAlpha2);}",
		".f1f7voed{color:var(--colorNeutralStrokeOnBrand2);}",
		".f179dep3{-webkit-mask-image:conic-gradient(white 255deg, transparent 255deg);mask-image:conic-gradient(white 255deg, transparent 255deg);}",
		".fbz9ihp::before,.fbz9ihp::after{background-image:conic-gradient(transparent 225deg, currentcolor 225deg);}",
		".fd461yt{height:16px;}",
		".fjw5fx7{width:16px;}",
		".f1v3ph3m{--fui-Spinner--strokeWidth:var(--strokeWidthThick);}",
		".fjamq6b{height:20px;}",
		".f64fuq3{width:20px;}",
		".frvgh55{height:24px;}",
		".fq4mcun{width:24px;}",
		".fxldao9{height:28px;}",
		".f1w9dchk{width:28px;}",
		".f1d2rq10{height:32px;}",
		".f1szoe96{width:32px;}",
		".fb52u90{--fui-Spinner--strokeWidth:var(--strokeWidthThicker);}",
		".f8ljn23{height:36px;}",
		".fpdz1er{width:36px;}",
		".fbhnoac{height:40px;}",
		".feqmc2u{width:40px;}",
		".f1ft4266{height:44px;}",
		".fksc0bp{width:44px;}",
		".fa3u9ii{--fui-Spinner--strokeWidth:var(--strokeWidthThickest);}"
	],
	m: [["@media screen and (prefers-reduced-motion: reduce){.f1pme1qz{background-image:conic-gradient(currentcolor 0deg, transparent 240deg);}}", { m: "screen and (prefers-reduced-motion: reduce)" }]]
}), uv = /*#__PURE__*/ I({
	inverted: { sj55zd: "fonrgv7" },
	"extra-tiny": {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fkhj508",
		Bhrd7zp: "figsok6",
		Bg96gwp: "f1i3iumi"
	},
	tiny: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fkhj508",
		Bhrd7zp: "figsok6",
		Bg96gwp: "f1i3iumi"
	},
	"extra-small": {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fkhj508",
		Bhrd7zp: "figsok6",
		Bg96gwp: "f1i3iumi"
	},
	small: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fkhj508",
		Bhrd7zp: "figsok6",
		Bg96gwp: "f1i3iumi"
	},
	medium: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fod5ikn",
		Bhrd7zp: "fl43uef",
		Bg96gwp: "faaz57k"
	},
	large: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fod5ikn",
		Bhrd7zp: "fl43uef",
		Bg96gwp: "faaz57k"
	},
	"extra-large": {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fod5ikn",
		Bhrd7zp: "fl43uef",
		Bg96gwp: "faaz57k"
	},
	huge: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "f1pp30po",
		Bhrd7zp: "fl43uef",
		Bg96gwp: "f106mvju"
	}
}, { d: [
	".fonrgv7{color:var(--colorNeutralForegroundStaticInverted);}",
	".fk6fouc{font-family:var(--fontFamilyBase);}",
	".fkhj508{font-size:var(--fontSizeBase300);}",
	".figsok6{font-weight:var(--fontWeightRegular);}",
	".f1i3iumi{line-height:var(--lineHeightBase300);}",
	".fod5ikn{font-size:var(--fontSizeBase400);}",
	".fl43uef{font-weight:var(--fontWeightSemibold);}",
	".faaz57k{line-height:var(--lineHeightBase400);}",
	".f1pp30po{font-size:var(--fontSizeBase500);}",
	".f106mvju{line-height:var(--lineHeightBase500);}"
] }), dv = (e) => {
	let { labelPosition: t, size: n, appearance: r } = e, { dir: i } = Qr(), a = av(), o = ov(), s = sv(), c = lv(), l = cv(), u = uv();
	return e.root.className = A(iv.root, a, (t === "above" || t === "below") && o.vertical, e.root.className), e.spinner && (e.spinner.className = A(iv.spinner, s, c[n], r === "inverted" && c.inverted, e.spinner.className)), e.spinnerTail && (e.spinnerTail.className = A(iv.spinnerTail, l, i === "rtl" && c.rtlTail, e.spinnerTail.className)), e.label && (e.label.className = A(iv.label, u[n], r === "inverted" && u.inverted, e.label.className)), e;
}, fv = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = tv(e, t);
	return dv(n), ai("useSpinnerStyles_unstable")(n), rv(n);
});
fv.displayName = "Spinner";
//#endregion
//#region node_modules/@fluentui/react-tabs/lib/components/TabList/useTabList.js
var pv = (e, t) => {
	let { appearance: n = "transparent", reserveSelectedTabSpace: r = !0, size: i = "medium" } = e, a = mv(e, t), o = hv({ vertical: a.vertical });
	return {
		...a,
		root: {
			...o,
			...a.root
		},
		appearance: n,
		reserveSelectedTabSpace: r,
		size: i
	};
}, mv = (e, t) => {
	let { disabled: n = !1, onTabSelect: r, selectTabOnFocus: i = !1, vertical: a = !1, selectedValue: o, defaultSelectedValue: s, ...c } = e, l = P.useRef(null), [u, d] = mi({
		state: o,
		defaultState: s,
		initialState: void 0
	}), f = P.useRef(void 0), p = P.useRef(void 0);
	P.useEffect(() => {
		p.current = f.current, f.current = u;
	}, [u]);
	let m = L((e, t) => {
		d(t.value), r?.(e, t);
	}), h = P.useRef({}), g = L((e) => {
		let t = JSON.stringify(e.value);
		h.current[t] = e;
	}), _ = L((e) => {
		delete h.current[JSON.stringify(e.value)];
	}), v = P.useCallback(() => ({
		selectedValue: f.current,
		previousSelectedValue: p.current,
		registeredTabs: h.current
	}), []);
	return {
		components: { root: "div" },
		root: er({
			ref: Oi(t, l),
			role: "tablist",
			"aria-orientation": a ? "vertical" : "horizontal",
			...c
		}, { elementType: "div" }),
		disabled: n,
		selectTabOnFocus: i,
		selectedValue: u,
		onRegister: g,
		onUnregister: _,
		onSelect: m,
		getRegisteredTabs: v,
		vertical: a
	};
}, hv = ({ vertical: e }) => hs({
	circular: !0,
	axis: e ? "vertical" : "horizontal",
	memorizeCurrent: !1,
	unstable_hasDefault: !0
}), gv = {
	appearance: "transparent",
	reserveSelectedTabSpace: !0,
	selectTabOnFocus: !1,
	disabled: !1,
	selectedValue: void 0,
	onRegister: () => {},
	onUnregister: () => {},
	onSelect: () => {},
	getRegisteredTabs: () => ({ registeredTabs: {} }),
	size: "medium",
	vertical: !1
}, _v = Dl(void 0), vv = _v.Provider, yv = (e) => Ol(_v, (t = gv) => e(t)), bv = (e, t) => /*#__PURE__*/ R(e.root, { children: /*#__PURE__*/ R(vv, {
	value: t.tabList,
	children: e.root.children
}) }), xv = { root: "fui-TabList" }, Sv = /*#__PURE__*/ I({
	root: {
		mc9l5x: "f22iagw",
		Beiy3e4: "f1063pyq",
		Bnnss6s: "fi64zpg",
		Eh141a: "flvyvdh",
		qhf8xq: "f10pi13n"
	},
	horizontal: {
		Bt984gj: "f1q9h2pe",
		Beiy3e4: "f1063pyq"
	},
	vertical: {
		Bt984gj: "f1q9h2pe",
		Beiy3e4: "f1vx9l62"
	},
	roundedSmall: {
		i8kkvl: 0,
		Belr9w4: 0,
		rmohyg: "f1eyhf9v"
	},
	rounded: {
		i8kkvl: 0,
		Belr9w4: 0,
		rmohyg: "faqewft"
	}
}, { d: [
	".f22iagw{display:flex;}",
	".f1063pyq{flex-direction:row;}",
	".fi64zpg{flex-shrink:0;}",
	".flvyvdh{flex-wrap:nowrap;}",
	".f10pi13n{position:relative;}",
	".f1q9h2pe{align-items:stretch;}",
	".f1vx9l62{flex-direction:column;}",
	[".f1eyhf9v{gap:var(--spacingHorizontalSNudge);}", { p: -1 }],
	[".faqewft{gap:var(--spacingHorizontalS);}", { p: -1 }]
] }), Cv = (e) => {
	let { appearance: t, vertical: n, size: r } = e, i = Sv(), a = t === "subtle-circular" || t === "filled-circular";
	return e.root.className = A(xv.root, i.root, n ? i.vertical : i.horizontal, a && (r === "small" ? i.roundedSmall : i.rounded), e.root.className), e;
};
//#endregion
//#region node_modules/@fluentui/react-tabs/lib/components/TabList/useTabListContextValues.js
function wv(e) {
	let { appearance: t, reserveSelectedTabSpace: n, disabled: r, selectTabOnFocus: i, selectedValue: a, onRegister: o, onUnregister: s, onSelect: c, getRegisteredTabs: l, size: u, vertical: d } = e;
	return { tabList: P.useMemo(() => ({
		appearance: t,
		reserveSelectedTabSpace: n,
		disabled: r,
		selectTabOnFocus: i,
		selectedValue: a,
		onSelect: c,
		onRegister: o,
		onUnregister: s,
		getRegisteredTabs: l,
		size: u,
		vertical: d
	}), [
		t,
		n,
		r,
		i,
		a,
		c,
		o,
		s,
		l,
		u,
		d
	]) };
}
//#endregion
//#region node_modules/@fluentui/react-tabs/lib/components/TabList/TabList.js
var Tv = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = pv(e, t), r = wv(n);
	return Cv(n), ai("useTabListStyles_unstable")(n), bv(n, r);
});
Tv.displayName = "TabList";
//#endregion
//#region node_modules/@fluentui/react-tabs/lib/components/Tab/useTab.js
var Ev = (e, t) => {
	let { content: n } = e, r = Dv(e, t), i = Ov(r), a = yv((e) => e.appearance), o = yv((e) => e.reserveSelectedTabSpace), s = yv((e) => e.size ?? "medium"), c = n && typeof n == "object" ? Lr(n, ["ref"]) : n;
	return {
		...r,
		components: {
			...r.components,
			contentReservedSpace: "span"
		},
		root: {
			...i,
			...r.root
		},
		contentReservedSpace: tr(c, {
			renderByDefault: !r.selected && !r.iconOnly && o,
			defaultProps: { children: e.children },
			elementType: "span"
		}),
		appearance: a,
		size: s
	};
}, Dv = (e, t) => {
	let { content: n, disabled: r = !1, icon: i, onClick: a, onFocus: o, value: s, ...c } = e, l = yv((e) => e.selectTabOnFocus), u = yv((e) => e.disabled), d = yv((e) => e.selectedValue === s), f = yv((e) => e.onRegister), p = yv((e) => e.onUnregister), m = yv((e) => e.onSelect), h = yv((e) => !!e.vertical), g = u || r, _ = P.useRef(null), v = (e) => m(e, { value: s }), y = L(Bi(a, v)), b = L(Bi(o, v));
	P.useEffect(() => (f({
		value: s,
		ref: _
	}), () => {
		p({
			value: s,
			ref: _
		});
	}), [
		f,
		p,
		_,
		s
	]);
	let x = tr(i, { elementType: "span" }), S = er(n, {
		defaultProps: { children: e.children },
		elementType: "span"
	}), C = !(!x?.children || S.children);
	return {
		components: {
			root: "button",
			icon: "span",
			content: "span",
			contentReservedSpace: "span"
		},
		root: er({
			ref: Oi(t, _),
			role: "tab",
			type: "button",
			"aria-selected": g ? void 0 : `${d}`,
			value: s,
			...c,
			disabled: g,
			onClick: y,
			onFocus: l ? b : o
		}, { elementType: "button" }),
		icon: x,
		iconOnly: C,
		content: S,
		disabled: g,
		selected: d,
		value: s,
		vertical: h
	};
}, Ov = ({ selected: e }) => ms({ focusable: { isDefault: e } }), kv = (e) => /*#__PURE__*/ ra(e.root, { children: [
	e.icon && /*#__PURE__*/ R(e.icon, {}),
	!e.iconOnly && /*#__PURE__*/ R(e.content, {}),
	e.contentReservedSpace && /*#__PURE__*/ R(e.contentReservedSpace, {})
] }), Av = {
	offsetVar: "--fui-Tab__indicator--offset",
	scaleVar: "--fui-Tab__indicator--scale"
}, jv = /*#__PURE__*/ I({
	base: {
		B68tc82: 0,
		Bmxbyg5: 0,
		Bpg54ce: "f1gl81tg"
	},
	animated: {
		Ba2ppi3: "fhwpy7i",
		F2fol1: "f6zz20j",
		B1dyfl9: "f1ai4sc1",
		Bu93a1u: "f1rnm8gg",
		Bdasjez: "f1x3cmqg"
	},
	horizontal: {
		sjv3b2: ["fug4aj8", "f1i5xzg7"],
		b1kco5: "f1q7ujh"
	},
	vertical: {
		sjv3b2: "f1hqboyk",
		b1kco5: "f1dxupa6"
	}
}, {
	d: [
		[".f1gl81tg{overflow:visible;}", { p: -1 }],
		".fhwpy7i::after{transition-property:transform;}",
		".f6zz20j::after{transition-duration:var(--durationSlow);}",
		".f1ai4sc1::after{transition-timing-function:var(--curveDecelerateMax);}",
		".fug4aj8::after{transform-origin:left;}",
		".f1i5xzg7::after{transform-origin:right;}",
		".f1q7ujh::after{transform:translateX(var(--fui-Tab__indicator--offset)) scaleX(var(--fui-Tab__indicator--scale));}",
		".f1hqboyk::after{transform-origin:top;}",
		".f1dxupa6::after{transform:translateY(var(--fui-Tab__indicator--offset)) scaleY(var(--fui-Tab__indicator--scale));}"
	],
	m: [["@media (prefers-reduced-motion: reduce){.f1rnm8gg::after{transition-property:none;}}", { m: "(prefers-reduced-motion: reduce)" }], ["@media (prefers-reduced-motion: reduce){.f1x3cmqg::after{transition-duration:0.01ms;}}", { m: "(prefers-reduced-motion: reduce)" }]]
}), Mv = (e) => {
	if (e) {
		let t = e.parentElement?.getBoundingClientRect() || {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		}, n = e.getBoundingClientRect();
		return {
			x: n.x - t.x,
			y: n.y - t.y,
			width: n.width,
			height: n.height
		};
	}
}, Nv = (e, t) => {
	let n = Pv(t) ? e[JSON.stringify(t)]?.ref.current : void 0;
	return n ? Mv(n) : void 0;
}, Pv = (e) => e != null, Fv = (e) => {
	let { disabled: t, selected: n, vertical: r } = e, i = jv(), [a, o] = P.useState(), [s, c] = P.useState({
		offset: 0,
		scale: 1
	}), l = yv((e) => e.getRegisteredTabs), [u] = fi();
	if (n) {
		let { previousSelectedValue: e, selectedValue: t, registeredTabs: n } = l();
		if (Pv(e) && a !== e) {
			let i = Nv(n, e), a = Nv(n, t);
			a && i && (c({
				offset: r ? i.y - a.y : i.x - a.x,
				scale: r ? i.height / a.height : i.width / a.width
			}), o(e), u(() => c({
				offset: 0,
				scale: 1
			})));
		}
	} else Pv(a) && o(void 0);
	if (t) return e;
	let d = s.offset === 0 && s.scale === 1;
	e.root.className = A(e.root.className, n && i.base, n && d && i.animated, n && (r ? i.vertical : i.horizontal));
	let f = {
		[Av.offsetVar]: `${s.offset}px`,
		[Av.scaleVar]: `${s.scale}`
	};
	return e.root.style = {
		...f,
		...e.root.style
	}, e;
}, Iv = {
	root: "fui-Tab",
	icon: "fui-Tab__icon",
	content: "fui-Tab__content"
}, Lv = { content: "fui-Tab__content--reserved-space" }, Rv = /*#__PURE__*/ I({
	root: {
		Bt984gj: "f122n59",
		mc9l5x: "f13qh94s",
		Bnnss6s: "fi64zpg",
		Bxotwcr: "f1u07yai",
		Budl1dq: "frn2hmy",
		wkccdc: "f1olsevy",
		oeaueh: "f1s6fcnf",
		qhf8xq: "f10pi13n"
	},
	button: {
		Bt984gj: "f122n59",
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
		irswps: "f3bhgqh",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "ft85np5",
		Bceei9c: "f1k6fduh",
		mc9l5x: "f13qh94s",
		Bnnss6s: "fi64zpg",
		Bxotwcr: "f1u07yai",
		Budl1dq: "frn2hmy",
		wkccdc: "f1olsevy",
		Bahqtrf: "fk6fouc",
		Bg96gwp: "f1i3iumi",
		oeaueh: "f1s6fcnf",
		qhf8xq: "f10pi13n",
		B68tc82: 0,
		Bmxbyg5: 0,
		Bpg54ce: "f1a3p1vp",
		B9bfxx9: "f1cxpek8"
	},
	horizontal: { Brf1p80: "f4d9j23" },
	vertical: { Brf1p80: "f1s9ku6b" },
	smallHorizontal: {
		i8kkvl: "f14mj54c",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1wmopi4"
	},
	smallVertical: {
		i8kkvl: "f14mj54c",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f12or63q"
	},
	mediumHorizontal: {
		i8kkvl: "f1rjii52",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1w08f2p"
	},
	mediumVertical: {
		i8kkvl: "f1rjii52",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "fymxs25"
	},
	largeHorizontal: {
		i8kkvl: "f1rjii52",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1ssfvub"
	},
	largeVertical: {
		i8kkvl: "f1rjii52",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "fwkd1rq"
	},
	transparent: {
		De3pzq: "f1c21dwh",
		B95qlz1: "f9rvdkv",
		B7xitij: "f1051ucx",
		Bptxc3x: "fmmjozx",
		Bwqhzpy: "fqhzt5g",
		iyk698: "f7l5cgy",
		cl4aha: "fpkze5g",
		B0q3jbp: "f1iywnoi",
		Be9ayug: "f9n45c4"
	},
	subtle: {
		De3pzq: "fhovq9v",
		B95qlz1: "f1bifk9c",
		B7xitij: "fo6hitd",
		Bptxc3x: "fmmjozx",
		Bwqhzpy: "fqhzt5g",
		iyk698: "f7l5cgy",
		cl4aha: "fpkze5g",
		B0q3jbp: "f1iywnoi",
		Be9ayug: "f9n45c4"
	},
	disabledCursor: { Bceei9c: "fdrzuqr" },
	disabled: {
		De3pzq: "f1c21dwh",
		Bptxc3x: "fato7r6",
		cl4aha: "fao1bnu"
	},
	selected: {
		Bptxc3x: "f1cadz5z",
		Bwqhzpy: "fwhdxxj",
		iyk698: "fintccb",
		cl4aha: "ffplhdr",
		B0q3jbp: "fjo17wb",
		Be9ayug: "f148789c"
	}
}, { d: [
	".f122n59{align-items:center;}",
	".f13qh94s{display:grid;}",
	".fi64zpg{flex-shrink:0;}",
	".f1u07yai{grid-auto-flow:column;}",
	".frn2hmy{grid-template-columns:auto;}",
	".f1olsevy{grid-template-rows:auto;}",
	".f1s6fcnf{outline-style:none;}",
	".f10pi13n{position:relative;}",
	[".f3bhgqh{border:none;}", { p: -2 }],
	[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
	".f1k6fduh{cursor:pointer;}",
	".fk6fouc{font-family:var(--fontFamilyBase);}",
	".f1i3iumi{line-height:var(--lineHeightBase300);}",
	[".f1a3p1vp{overflow:hidden;}", { p: -1 }],
	".f1cxpek8{text-transform:none;}",
	".f4d9j23{justify-content:center;}",
	".f1s9ku6b{justify-content:start;}",
	".f14mj54c{column-gap:var(--spacingHorizontalXXS);}",
	[".f1wmopi4{padding:var(--spacingVerticalSNudge) var(--spacingHorizontalSNudge);}", { p: -1 }],
	[".f12or63q{padding:var(--spacingVerticalXXS) var(--spacingHorizontalSNudge);}", { p: -1 }],
	".f1rjii52{column-gap:var(--spacingHorizontalSNudge);}",
	[".f1w08f2p{padding:var(--spacingVerticalM) var(--spacingHorizontalMNudge);}", { p: -1 }],
	[".fymxs25{padding:var(--spacingVerticalSNudge) var(--spacingHorizontalMNudge);}", { p: -1 }],
	[".f1ssfvub{padding:var(--spacingVerticalL) var(--spacingHorizontalMNudge);}", { p: -1 }],
	[".fwkd1rq{padding:var(--spacingVerticalS) var(--spacingHorizontalMNudge);}", { p: -1 }],
	".f1c21dwh{background-color:var(--colorTransparentBackground);}",
	".f9rvdkv:enabled:hover{background-color:var(--colorTransparentBackgroundHover);}",
	".f1051ucx:enabled:active{background-color:var(--colorTransparentBackgroundPressed);}",
	".fmmjozx .fui-Tab__icon{color:var(--colorNeutralForeground2);}",
	".fqhzt5g:enabled:hover .fui-Tab__icon{color:var(--colorNeutralForeground2Hover);}",
	".f7l5cgy:enabled:active .fui-Tab__icon{color:var(--colorNeutralForeground2Pressed);}",
	".fpkze5g .fui-Tab__content{color:var(--colorNeutralForeground2);}",
	".f1iywnoi:enabled:hover .fui-Tab__content{color:var(--colorNeutralForeground2Hover);}",
	".f9n45c4:enabled:active .fui-Tab__content{color:var(--colorNeutralForeground2Pressed);}",
	".fhovq9v{background-color:var(--colorSubtleBackground);}",
	".f1bifk9c:enabled:hover{background-color:var(--colorSubtleBackgroundHover);}",
	".fo6hitd:enabled:active{background-color:var(--colorSubtleBackgroundPressed);}",
	".fdrzuqr{cursor:not-allowed;}",
	".fato7r6 .fui-Tab__icon{color:var(--colorNeutralForegroundDisabled);}",
	".fao1bnu .fui-Tab__content{color:var(--colorNeutralForegroundDisabled);}",
	".f1cadz5z .fui-Tab__icon{color:var(--colorCompoundBrandForeground1);}",
	".fwhdxxj:enabled:hover .fui-Tab__icon{color:var(--colorCompoundBrandForeground1Hover);}",
	".fintccb:enabled:active .fui-Tab__icon{color:var(--colorCompoundBrandForeground1Pressed);}",
	".ffplhdr .fui-Tab__content{color:var(--colorNeutralForeground1);}",
	".fjo17wb:enabled:hover .fui-Tab__content{color:var(--colorNeutralForeground1Hover);}",
	".f148789c:enabled:active .fui-Tab__content{color:var(--colorNeutralForeground1Pressed);}"
] }), zv = /*#__PURE__*/ I({
	base: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "f44lkw9",
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
		irswps: "fp7rvkm",
		Bptxc3x: "ftorr8m",
		cl4aha: "f16lqpmv"
	},
	small: {
		Dbcxam: 0,
		rjzwhg: 0,
		Bblux5w: "fzklhed"
	},
	medium: {
		Dbcxam: 0,
		rjzwhg: 0,
		Bblux5w: "f1j721cc"
	},
	large: {
		Dbcxam: 0,
		rjzwhg: 0,
		Bblux5w: "frx9knr"
	},
	subtle: {
		De3pzq: "fhovq9v",
		sj55zd: "fkfq4zb",
		B95qlz1: "f1bifk9c",
		Eo63ln: 0,
		r9osk6: 0,
		Itrz8y: 0,
		zeg6vx: 0,
		l65xgk: 0,
		Bw4olcx: 0,
		Folb0i: 0,
		I2h8y4: 0,
		Bgxgoyi: 0,
		Bvlkotb: 0,
		Fwyncl: 0,
		Byh5edv: 0,
		Becqvjq: 0,
		uumbiq: 0,
		B73q3dg: 0,
		Bblwbaf: 0,
		B0ezav: "ft57sj0",
		r4wkhp: "f1fcoy83",
		B7xitij: "fo6hitd",
		d3wsvi: 0,
		Hdqn7s: 0,
		zu5y1p: 0,
		owqphb: 0,
		g9c53k: 0,
		Btmu08z: 0,
		Bthxvy6: 0,
		gluvuq: 0,
		tb88gp: 0,
		wns6jk: 0,
		kdfdk4: 0,
		Bbw008l: 0,
		Bayi1ib: 0,
		B1kkfu3: 0,
		J1oqyp: 0,
		kem6az: 0,
		goa3yj: "fhn220o",
		p743kt: "f15qf7sh",
		wmvzou: 0,
		sc4o1m: 0,
		wymq9i: 0,
		u9orzk: 0,
		puiv5t: 0,
		Bosien3: 0,
		b2z72d: 0,
		Beulxaw: 0,
		B57pkaw: 0,
		Jcjdmf: 0,
		B8qgbzl: 0,
		Bbmb0sr: 0,
		B14q8qp: 0,
		Bcq6wej: 0,
		Byz1pjr: 0,
		kr9cjb: 0,
		Ff9ifp: "f1mljprk"
	},
	subtleSelected: {
		De3pzq: "f16xkysk",
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
		irswps: "f1c2pc3t",
		sj55zd: "faj9fo0",
		B95qlz1: "fsm7zmf",
		Eo63ln: 0,
		r9osk6: 0,
		Itrz8y: 0,
		zeg6vx: 0,
		l65xgk: 0,
		Bw4olcx: 0,
		Folb0i: 0,
		I2h8y4: 0,
		Bgxgoyi: 0,
		Bvlkotb: 0,
		Fwyncl: 0,
		Byh5edv: 0,
		Becqvjq: 0,
		uumbiq: 0,
		B73q3dg: 0,
		Bblwbaf: 0,
		B0ezav: "f1wo0sfq",
		r4wkhp: "f1afuynh",
		B7xitij: "f94ddyl",
		d3wsvi: 0,
		Hdqn7s: 0,
		zu5y1p: 0,
		owqphb: 0,
		g9c53k: 0,
		Btmu08z: 0,
		Bthxvy6: 0,
		gluvuq: 0,
		tb88gp: 0,
		wns6jk: 0,
		kdfdk4: 0,
		Bbw008l: 0,
		Bayi1ib: 0,
		B1kkfu3: 0,
		J1oqyp: 0,
		kem6az: 0,
		goa3yj: "fmle6oo",
		p743kt: "f1d3itm4",
		wmvzou: 0,
		sc4o1m: 0,
		wymq9i: 0,
		u9orzk: 0,
		puiv5t: 0,
		Bosien3: 0,
		b2z72d: 0,
		Beulxaw: 0,
		B57pkaw: 0,
		Jcjdmf: 0,
		B8qgbzl: 0,
		Bbmb0sr: 0,
		B14q8qp: 0,
		Bcq6wej: 0,
		Byz1pjr: 0,
		kr9cjb: 0,
		Ff9ifp: "f1e9l2u"
	},
	subtleDisabled: {
		De3pzq: "fhovq9v",
		sj55zd: "f1s2aq7o"
	},
	subtleDisabledSelected: {
		De3pzq: "f1bg9a2p",
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
		irswps: "fegtqic",
		sj55zd: "f1s2aq7o"
	},
	filled: {
		De3pzq: "f16xq7d1",
		sj55zd: "fkfq4zb",
		B95qlz1: "fwwxidx",
		r4wkhp: "f1fcoy83",
		B7xitij: "f14i52sd",
		p743kt: "f15qf7sh",
		Hhssn: "f1cpi5f4",
		uaurb9: "f6pj1s0",
		B401qx7: "f12sz5kj",
		Buyp1jb: "f17588c3",
		gsp74p: "fnthgdt"
	},
	filledSelected: {
		De3pzq: "ffp7eso",
		sj55zd: "f1phragk",
		B95qlz1: "f1lm9dni",
		r4wkhp: "f1mn5ei1",
		B7xitij: "f1g6ncd0",
		p743kt: "fl71aob",
		Gedr8k: "f14zl92z",
		Bm69vlq: "f16zy3eu",
		Bodipah: "f1gdgb7p",
		B5kpen0: "f1tua9ng"
	},
	filledDisabled: {
		De3pzq: "f1bg9a2p",
		sj55zd: "f1s2aq7o"
	},
	filledDisabledSelected: {
		De3pzq: "f1bg9a2p",
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
		irswps: "fegtqic",
		sj55zd: "f1s2aq7o"
	}
}, {
	d: [
		[".f44lkw9{border-radius:var(--borderRadiusCircular);}", { p: -1 }],
		[".fp7rvkm{border:solid var(--strokeWidthThin) var(--colorTransparentStroke);}", { p: -2 }],
		".ftorr8m .fui-Tab__icon{color:inherit;}",
		".f16lqpmv .fui-Tab__content{color:inherit;}",
		[".fzklhed{padding-block:calc(var(--spacingVerticalXXS) - var(--strokeWidthThin));}", { p: -1 }],
		[".f1j721cc{padding-block:calc(var(--spacingVerticalSNudge) - var(--strokeWidthThin));}", { p: -1 }],
		[".frx9knr{padding-block:calc(var(--spacingVerticalS) - var(--strokeWidthThin));}", { p: -1 }],
		".fhovq9v{background-color:var(--colorSubtleBackground);}",
		".fkfq4zb{color:var(--colorNeutralForeground2);}",
		".f1bifk9c:enabled:hover{background-color:var(--colorSubtleBackgroundHover);}",
		[".ft57sj0:enabled:hover{border:solid var(--strokeWidthThin) var(--colorNeutralStroke1Hover);}", { p: -2 }],
		".f1fcoy83:enabled:hover{color:var(--colorNeutralForeground2Hover);}",
		".fo6hitd:enabled:active{background-color:var(--colorSubtleBackgroundPressed);}",
		[".fhn220o:enabled:active{border:solid var(--strokeWidthThin) var(--colorNeutralStroke1Pressed);}", { p: -2 }],
		".f15qf7sh:enabled:active{color:var(--colorNeutralForeground2Pressed);}",
		".f16xkysk{background-color:var(--colorBrandBackground2);}",
		[".f1c2pc3t{border:solid var(--strokeWidthThin) var(--colorCompoundBrandStroke);}", { p: -2 }],
		".faj9fo0{color:var(--colorBrandForeground2);}",
		".fsm7zmf:enabled:hover{background-color:var(--colorBrandBackground2Hover);}",
		[".f1wo0sfq:enabled:hover{border:solid var(--strokeWidthThin) var(--colorCompoundBrandStrokeHover);}", { p: -2 }],
		".f1afuynh:enabled:hover{color:var(--colorBrandForeground2Hover);}",
		".f94ddyl:enabled:active{background-color:var(--colorBrandBackground2Pressed);}",
		[".fmle6oo:enabled:active{border:solid var(--strokeWidthThin) var(--colorCompoundBrandStrokePressed);}", { p: -2 }],
		".f1d3itm4:enabled:active{color:var(--colorBrandForeground2Pressed);}",
		".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
		".f1bg9a2p{background-color:var(--colorNeutralBackgroundDisabled);}",
		[".fegtqic{border:solid var(--strokeWidthThin) var(--colorNeutralStrokeDisabled);}", { p: -2 }],
		".f16xq7d1{background-color:var(--colorNeutralBackground3);}",
		".fwwxidx:enabled:hover{background-color:var(--colorNeutralBackground3Hover);}",
		".f14i52sd:enabled:active{background-color:var(--colorNeutralBackground3Pressed);}",
		".ffp7eso{background-color:var(--colorBrandBackground);}",
		".f1phragk{color:var(--colorNeutralForegroundOnBrand);}",
		".f1lm9dni:enabled:hover{background-color:var(--colorBrandBackgroundHover);}",
		".f1mn5ei1:enabled:hover{color:var(--colorNeutralForegroundOnBrand);}",
		".f1g6ncd0:enabled:active{background-color:var(--colorBrandBackgroundPressed);}",
		".fl71aob:enabled:active{color:var(--colorNeutralForegroundOnBrand);}",
		[".fegtqic{border:solid var(--strokeWidthThin) var(--colorNeutralStrokeDisabled);}", { p: -2 }]
	],
	m: [
		["@media (forced-colors: active){.f1mljprk{border:solid var(--strokeWidthThin) Canvas;}}", {
			p: -2,
			m: "(forced-colors: active)"
		}],
		["@media (forced-colors: active){.f1e9l2u{border:solid var(--strokeWidthThin) Highlight;}}", {
			p: -2,
			m: "(forced-colors: active)"
		}],
		["@media (forced-colors: active){.f1cpi5f4:enabled:hover{background-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f6pj1s0:enabled:hover{forced-color-adjust:none;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f12sz5kj:enabled:hover .fui-Tab__content{color:HighlightText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f17588c3:enabled:hover .fui-Icon-filled{color:HighlightText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fnthgdt:enabled:hover .fui-Icon-regular{color:HighlightText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f14zl92z:enabled{background-color:ButtonText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f16zy3eu:enabled .fui-Tab__content{color:ButtonFace;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1gdgb7p:enabled .fui-Tab__content{forced-color-adjust:none;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1tua9ng:enabled .fui-Tab__icon{color:ButtonFace;}}", { m: "(forced-colors: active)" }]
	]
}), Bv = /*#__PURE__*/ I({
	base: {
		B8q5s1w: "f8hki3x",
		Bci5o5g: ["f1d2448m", "ffh67wi"],
		n8qw10: "f1bjia2o",
		Bdrgwmp: ["ffh67wi", "f1d2448m"],
		Bn4voq9: "f1p7hgxw",
		Bfpq7zp: "f1way5bb",
		g9k6zt: "f9znhxp",
		j6ew2k: ["fqa318h", "fqa318h"],
		Bhxq17a: "f1vjpng2"
	},
	circular: {
		B8q5s1w: "f8hki3x",
		Bci5o5g: ["f1d2448m", "ffh67wi"],
		n8qw10: "f1bjia2o",
		Bdrgwmp: ["ffh67wi", "f1d2448m"],
		Bn4voq9: "f1p7hgxw",
		Bfpq7zp: "f1way5bb",
		g9k6zt: "f9znhxp",
		j6ew2k: ["fzgyhws", "fqxug60"],
		Bhxq17a: "f1vjpng2"
	}
}, { d: [
	".f8hki3x[data-fui-focus-visible]{border-top-color:transparent;}",
	".f1d2448m[data-fui-focus-visible]{border-right-color:transparent;}",
	".ffh67wi[data-fui-focus-visible]{border-left-color:transparent;}",
	".f1bjia2o[data-fui-focus-visible]{border-bottom-color:transparent;}",
	".f1p7hgxw[data-fui-focus-visible]{outline-width:var(--strokeWidthThick);}",
	".f1way5bb[data-fui-focus-visible]{outline-color:transparent;}",
	".f9znhxp[data-fui-focus-visible]{outline-style:solid;}",
	".fqa318h[data-fui-focus-visible]{box-shadow:var(--shadow4),0 0 0 var(--strokeWidthThick) var(--colorStrokeFocus2);}",
	".f1vjpng2[data-fui-focus-visible]{z-index:1;}",
	".fzgyhws[data-fui-focus-visible]{box-shadow:var(--shadow4),0 0 0 var(--strokeWidthThick) var(--colorStrokeFocus2),0 0 0 var(--strokeWidthThin) var(--colorNeutralStrokeOnBrand) inset;}",
	".fqxug60[data-fui-focus-visible]{box-shadow:var(--shadow4),0 0 0 var(--strokeWidthThick) var(--colorStrokeFocus2),0 0 0 var(--strokeWidthThin) var(--colorNeutralStrokeOnBrand) inset;}"
] }), Vv = /*#__PURE__*/ I({
	base: {
		az7l2e: "fhw179n",
		vqofr: 0,
		Bv4n3vi: 0,
		Bgqb9hq: 0,
		B0uxbk8: 0,
		Bf3jju6: "fg9j5n4",
		amg5m6: "f1kmhr4c",
		zkfqfm: "fl1ydde",
		Bkydozb: "f1y7maxz",
		Bka2azo: 0,
		vzq8l0: 0,
		csmgbd: 0,
		Br4ovkg: 0,
		aelrif: "fceyvr4",
		y36c18: "f16cxu0",
		B1ctymy: "f1nwgacf",
		xzc5d: "fm6alxz",
		h5yqg8: "fhx32z1"
	},
	disabled: {
		az7l2e: "f1ut20fw",
		Bkydozb: "fhrzcfn",
		xzc5d: "fw15awd",
		h5yqg8: "faqmq51"
	},
	smallHorizontal: {
		lawp4y: "fchca7p",
		Baz25je: "f1r53b5e",
		Fbdkly: ["f1s6rxz5", "fo35v8s"],
		mdwyqc: ["fo35v8s", "f1s6rxz5"]
	},
	smallVertical: {
		lawp4y: "fze4zud",
		Fbdkly: ["f1fzr1x6", "f1f351id"],
		Bciustq: "fdp32p8",
		Ccq8qp: "f1aij3q"
	},
	mediumHorizontal: {
		lawp4y: "fchca7p",
		Baz25je: "f1s2r9ax",
		Fbdkly: ["f1o0nnkk", "fxb7rol"],
		mdwyqc: ["fxb7rol", "f1o0nnkk"]
	},
	mediumVertical: {
		lawp4y: "f17jracn",
		Fbdkly: ["f1fzr1x6", "f1f351id"],
		Bciustq: "f117lcb2",
		Ccq8qp: "f1aij3q"
	},
	largeHorizontal: {
		lawp4y: "fchca7p",
		Baz25je: "f1s2r9ax",
		Fbdkly: ["f1o0nnkk", "fxb7rol"],
		mdwyqc: ["fxb7rol", "f1o0nnkk"]
	},
	largeVertical: {
		lawp4y: "fel9d3z",
		Fbdkly: ["f1fzr1x6", "f1f351id"],
		Bciustq: "f6vqlre",
		Ccq8qp: "f1aij3q"
	}
}, {
	h: [
		".fhw179n:hover::before{background-color:var(--colorNeutralStroke1Hover);}",
		[".fg9j5n4:hover::before{border-radius:var(--borderRadiusCircular);}", { p: -1 }],
		".f1kmhr4c:hover::before{content:\"\";}",
		".fl1ydde:hover::before{position:absolute;}",
		".f1ut20fw:hover::before{background-color:var(--colorTransparentStroke);}"
	],
	a: [
		".f1y7maxz:active::before{background-color:var(--colorNeutralStroke1Pressed);}",
		[".fceyvr4:active::before{border-radius:var(--borderRadiusCircular);}", { p: -1 }],
		".f16cxu0:active::before{content:\"\";}",
		".f1nwgacf:active::before{position:absolute;}",
		".fhrzcfn:active::before{background-color:var(--colorTransparentStroke);}"
	],
	m: [
		["@media (forced-colors: active){.fm6alxz:hover::before{background-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fhx32z1:active::before{background-color:Highlight;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fw15awd:hover::before{background-color:transparent;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.faqmq51:active::before{background-color:transparent;}}", { m: "(forced-colors: active)" }]
	],
	d: [
		".fchca7p::before{bottom:0;}",
		".f1r53b5e::before{height:var(--strokeWidthThick);}",
		".f1s6rxz5::before{left:var(--spacingHorizontalSNudge);}",
		".fo35v8s::before{right:var(--spacingHorizontalSNudge);}",
		".fze4zud::before{bottom:var(--spacingVerticalXS);}",
		".f1fzr1x6::before{left:0;}",
		".f1f351id::before{right:0;}",
		".fdp32p8::before{top:var(--spacingVerticalXS);}",
		".f1aij3q::before{width:var(--strokeWidthThicker);}",
		".f1s2r9ax::before{height:var(--strokeWidthThicker);}",
		".f1o0nnkk::before{left:var(--spacingHorizontalM);}",
		".fxb7rol::before{right:var(--spacingHorizontalM);}",
		".f17jracn::before{bottom:var(--spacingVerticalS);}",
		".f117lcb2::before{top:var(--spacingVerticalS);}",
		".fel9d3z::before{bottom:var(--spacingVerticalMNudge);}",
		".f6vqlre::before{top:var(--spacingVerticalMNudge);}"
	]
}), Hv = /*#__PURE__*/ I({
	base: {
		Bjyk6c5: "f1rp0jgh",
		d9w3h3: 0,
		B3778ie: 0,
		B4j8arr: 0,
		Bl18szs: 0,
		Blrzh8d: "f3b9emi",
		Bsft5z2: "f13zj6fq",
		E3zdtr: "f1mdlcz9"
	},
	selected: {
		Bjyk6c5: "f1ksivud",
		Bej4dhw: "f1476jrx",
		B7wqxwa: "f18q216b",
		Hwb57: "f1wf6u82",
		Beg08s0: "f1xwit7m",
		Bo27r1v: "f1ksfgwi"
	},
	disabled: { Bjyk6c5: "f13lkzet" },
	smallHorizontal: {
		By385i5: "fo72kxq",
		Dlnsje: "f9bb2ob",
		Eqx8gd: ["f1q70ajw", "f18rbzdx"],
		B1piin3: ["f18rbzdx", "f1q70ajw"]
	},
	smallVertical: {
		By385i5: "fqbue9b",
		Eqx8gd: ["f1n6gb5g", "f15yvnhg"],
		bn5sak: "fk1klkt",
		a2br6o: "f1o25lip"
	},
	mediumHorizontal: {
		By385i5: "fo72kxq",
		Dlnsje: "f1vx7lu8",
		Eqx8gd: ["fna7m5n", "f1oxpfwv"],
		B1piin3: ["f1oxpfwv", "fna7m5n"]
	},
	mediumVertical: {
		By385i5: "fipylg0",
		Eqx8gd: ["f1n6gb5g", "f15yvnhg"],
		bn5sak: "fqchiol",
		a2br6o: "f1o25lip"
	},
	largeHorizontal: {
		By385i5: "fo72kxq",
		Dlnsje: "f1vx7lu8",
		Eqx8gd: ["fna7m5n", "f1oxpfwv"],
		B1piin3: ["f1oxpfwv", "fna7m5n"]
	},
	largeVertical: {
		By385i5: "f1w7dm5g",
		Eqx8gd: ["f1n6gb5g", "f15yvnhg"],
		bn5sak: "f1p6em4m",
		a2br6o: "f1o25lip"
	}
}, {
	d: [
		".f1rp0jgh::after{background-color:var(--colorTransparentStroke);}",
		[".f3b9emi::after{border-radius:var(--borderRadiusCircular);}", { p: -1 }],
		".f13zj6fq::after{content:\"\";}",
		".f1mdlcz9::after{position:absolute;}",
		".f1ksivud::after{background-color:var(--colorCompoundBrandStroke);}",
		".f1476jrx:enabled:hover::after{background-color:var(--colorCompoundBrandStrokeHover);}",
		".f18q216b:enabled:active::after{background-color:var(--colorCompoundBrandStrokePressed);}",
		".f13lkzet::after{background-color:var(--colorNeutralForegroundDisabled);}",
		".fo72kxq::after{bottom:0;}",
		".f9bb2ob::after{height:var(--strokeWidthThick);}",
		".f1q70ajw::after{left:var(--spacingHorizontalSNudge);}",
		".f18rbzdx::after{right:var(--spacingHorizontalSNudge);}",
		".fqbue9b::after{bottom:var(--spacingVerticalXS);}",
		".f1n6gb5g::after{left:0;}",
		".f15yvnhg::after{right:0;}",
		".fk1klkt::after{top:var(--spacingVerticalXS);}",
		".f1o25lip::after{width:var(--strokeWidthThicker);}",
		".f1vx7lu8::after{height:var(--strokeWidthThicker);}",
		".fna7m5n::after{left:var(--spacingHorizontalM);}",
		".f1oxpfwv::after{right:var(--spacingHorizontalM);}",
		".fipylg0::after{bottom:var(--spacingVerticalS);}",
		".fqchiol::after{top:var(--spacingVerticalS);}",
		".f1w7dm5g::after{bottom:var(--spacingVerticalMNudge);}",
		".f1p6em4m::after{top:var(--spacingVerticalMNudge);}"
	],
	m: [
		["@media (forced-colors: active){.f1wf6u82::after{background-color:ButtonText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1xwit7m:enabled:hover::after{background-color:ButtonText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f1ksfgwi:enabled:active::after{background-color:ButtonText;}}", { m: "(forced-colors: active)" }]
	]
}), Uv = /*#__PURE__*/ I({
	base: {
		Br312pm: "fwpfdsa",
		Ijaq50: "f16hsg94",
		Bt984gj: "f122n59",
		mc9l5x: "ftuwxu6",
		Brf1p80: "f4d9j23",
		B68tc82: 0,
		Bmxbyg5: 0,
		Bpg54ce: "f1a3p1vp",
		D0sxk3: "f16u1re",
		t6yez3: "f8bsbmo"
	},
	small: {
		Be2twd7: "fe5j1ua",
		Bqenvij: "fjamq6b",
		a9b677: "f64fuq3"
	},
	medium: {
		Be2twd7: "fe5j1ua",
		Bqenvij: "fjamq6b",
		a9b677: "f64fuq3"
	},
	large: {
		Be2twd7: "f1rt2boy",
		Bqenvij: "frvgh55",
		a9b677: "fq4mcun"
	},
	selected: {
		D0sxk3: "fxoiby5",
		t6yez3: "f15q0o9g"
	}
}, { d: [
	".fwpfdsa{grid-column-start:1;}",
	".f16hsg94{grid-row-start:1;}",
	".f122n59{align-items:center;}",
	".ftuwxu6{display:inline-flex;}",
	".f4d9j23{justify-content:center;}",
	[".f1a3p1vp{overflow:hidden;}", { p: -1 }],
	".f16u1re .fui-Icon-filled{display:none;}",
	".f8bsbmo .fui-Icon-regular{display:inline;}",
	".fe5j1ua{font-size:20px;}",
	".fjamq6b{height:20px;}",
	".f64fuq3{width:20px;}",
	".f1rt2boy{font-size:24px;}",
	".frvgh55{height:24px;}",
	".fq4mcun{width:24px;}",
	".fxoiby5 .fui-Icon-filled{display:inline;}",
	".f15q0o9g .fui-Icon-regular{display:none;}"
] }), Wv = /*#__PURE__*/ I({
	base: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fkhj508",
		Bhrd7zp: "figsok6",
		Bg96gwp: "f1i3iumi",
		B68tc82: 0,
		Bmxbyg5: 0,
		Bpg54ce: "f1a3p1vp",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1bwptpd"
	},
	selected: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fkhj508",
		Bhrd7zp: "fl43uef",
		Bg96gwp: "f1i3iumi"
	},
	large: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fod5ikn",
		Bhrd7zp: "figsok6",
		Bg96gwp: "faaz57k"
	},
	largeSelected: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fod5ikn",
		Bhrd7zp: "fl43uef",
		Bg96gwp: "faaz57k"
	},
	noIconBefore: {
		Br312pm: "fwpfdsa",
		Ijaq50: "f16hsg94"
	},
	iconBefore: {
		Br312pm: "fd46tj4",
		Ijaq50: "f16hsg94"
	},
	placeholder: { Bcdw1i0: "fd7fpy0" }
}, { d: [
	".fk6fouc{font-family:var(--fontFamilyBase);}",
	".fkhj508{font-size:var(--fontSizeBase300);}",
	".figsok6{font-weight:var(--fontWeightRegular);}",
	".f1i3iumi{line-height:var(--lineHeightBase300);}",
	[".f1a3p1vp{overflow:hidden;}", { p: -1 }],
	[".f1bwptpd{padding:var(--spacingVerticalNone) var(--spacingHorizontalXXS);}", { p: -1 }],
	".fl43uef{font-weight:var(--fontWeightSemibold);}",
	".fod5ikn{font-size:var(--fontSizeBase400);}",
	".faaz57k{line-height:var(--lineHeightBase400);}",
	".fwpfdsa{grid-column-start:1;}",
	".f16hsg94{grid-row-start:1;}",
	".fd46tj4{grid-column-start:2;}",
	".fd7fpy0{visibility:hidden;}"
] }), Gv = (e) => {
	"use no memo";
	return Kv(e), qv(e, e.root), Jv(e), e;
}, Kv = (e) => {
	let t = Rv(), n = Vv(), r = Hv(), { appearance: i, disabled: a, selected: o, size: s, vertical: c } = e, l = [Iv.root, t.root];
	return i !== "subtle-circular" && i !== "filled-circular" && l.push(n.base, s === "small" && (c ? n.smallVertical : n.smallHorizontal), s === "medium" && (c ? n.mediumVertical : n.mediumHorizontal), s === "large" && (c ? n.largeVertical : n.largeHorizontal), a && n.disabled, o && r.base, o && !a && r.selected, o && s === "small" && (c ? r.smallVertical : r.smallHorizontal), o && s === "medium" && (c ? r.mediumVertical : r.mediumHorizontal), o && s === "large" && (c ? r.largeVertical : r.largeHorizontal), o && a && r.disabled), e.root.className = A(...l, e.root.className), Fv(e), e;
}, qv = (e, t) => {
	let n = Rv(), r = Bv(), i = zv(), { appearance: a, disabled: o, selected: s, size: c, vertical: l } = e, u = a === "subtle-circular", d = a === "filled-circular", f = u || d, p = [
		i.base,
		r.circular,
		c === "small" && i.small,
		c === "medium" && i.medium,
		c === "large" && i.large,
		u && i.subtle,
		s && u && i.subtleSelected,
		o && u && i.subtleDisabled,
		s && o && u && i.subtleDisabledSelected,
		d && i.filled,
		s && d && i.filledSelected,
		o && d && i.filledDisabled,
		s && o && d && i.filledDisabledSelected
	], m = [
		r.base,
		!o && a === "subtle" && n.subtle,
		!o && a === "transparent" && n.transparent,
		!o && s && n.selected,
		o && n.disabled
	];
	return t.className = A(n.button, l ? n.vertical : n.horizontal, c === "small" && (l ? n.smallVertical : n.smallHorizontal), c === "medium" && (l ? n.mediumVertical : n.mediumHorizontal), c === "large" && (l ? n.largeVertical : n.largeHorizontal), ...f ? p : m, o && n.disabledCursor, t.className), e;
}, Jv = (e) => {
	let t = Uv(), n = Wv(), { selected: r, size: i } = e;
	return e.icon && (e.icon.className = A(Iv.icon, t.base, t[i], r && t.selected, e.icon.className)), e.contentReservedSpace && (e.contentReservedSpace.className = A(Lv.content, n.base, i === "large" ? n.largeSelected : n.selected, e.icon ? n.iconBefore : n.noIconBefore, n.placeholder, e.content.className), e.contentReservedSpaceClassName = e.contentReservedSpace.className), e.content.className = A(Iv.content, n.base, i === "large" && n.large, r && (i === "large" ? n.largeSelected : n.selected), e.icon ? n.iconBefore : n.noIconBefore, e.content.className), e;
}, Yv = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = Ev(e, t);
	return Gv(n), ai("useTabStyles_unstable")(n), kv(n);
});
Yv.displayName = "Tab";
//#endregion
//#region node_modules/@fluentui/react-text/lib/components/Text/useText.js
var Xv = (e, t) => {
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
		root: er(Ir("span", {
			ref: t,
			...e
		}), { elementType: "span" })
	};
}, Zv = (e) => /*#__PURE__*/ R(e.root, {}), Qv = { root: "fui-Text" }, $v = /*#__PURE__*/ I({
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
] }), ey = (e) => {
	let t = $v();
	return e.root.className = A(Qv.root, t.root, e.wrap === !1 && t.nowrap, e.truncate && t.truncate, e.block && t.block, e.italic && t.italic, e.underline && t.underline, e.strikethrough && t.strikethrough, e.underline && e.strikethrough && t.strikethroughUnderline, e.size === 100 && t.base100, e.size === 200 && t.base200, e.size === 400 && t.base400, e.size === 500 && t.base500, e.size === 600 && t.base600, e.size === 700 && t.hero700, e.size === 800 && t.hero800, e.size === 900 && t.hero900, e.size === 1e3 && t.hero1000, e.font === "monospace" && t.monospace, e.font === "numeric" && t.numeric, e.weight === "medium" && t.weightMedium, e.weight === "semibold" && t.weightSemibold, e.weight === "bold" && t.weightBold, e.align === "center" && t.alignCenter, e.align === "end" && t.alignEnd, e.align === "justify" && t.alignJustify, e.root.className), e;
}, $ = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = Xv(e, t);
	return ey(n), ai("useTextStyles_unstable")(n), Zv(n);
});
$.displayName = "Text";
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBar/getIntentIcon.js
function ty(e) {
	switch (e) {
		case "info": return /*#__PURE__*/ P.createElement(bu, null);
		case "warning": return /*#__PURE__*/ P.createElement(yu, null);
		case "error": return /*#__PURE__*/ P.createElement(Eu, null);
		case "success": return /*#__PURE__*/ P.createElement(xu, null);
		default: return null;
	}
}
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBar/useMessageBarReflow.js
function ny(e = !1) {
	let { targetDocument: t } = Qr(), n = P.useReducer(() => ({}), {})[1], r = P.useRef(!1), i = P.useRef(null), a = P.useRef(Infinity), o = P.useCallback((e) => {
		var t;
		let i = e[0], o = (i == null || (t = i.borderBoxSize) == null ? void 0 : t[0]?.inlineSize) ?? i?.target.getBoundingClientRect().width;
		if (o === void 0 || !i) return;
		let { target: s } = i;
		if (!Vi(s)) return;
		let c;
		if (r.current) o >= a.current && (c = !1);
		else {
			let e = s.scrollWidth;
			o < e && (c = !0, a.current = e);
		}
		c !== void 0 && r.current !== c && (r.current = c, n());
	}, [n]), s = P.useCallback((n) => {
		var r;
		if (!e || !n || !t?.defaultView) return;
		(r = i.current) == null || r.disconnect();
		let a = new t.defaultView.ResizeObserver(o);
		i.current = a, a.observe(n, { box: "border-box" });
	}, [
		t,
		o,
		e
	]);
	return P.useEffect(() => () => {
		var e;
		(e = i.current) == null || e.disconnect();
	}, []), {
		ref: s,
		reflowing: r.current
	};
}
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/contexts/messageBarTransitionContext.js
var ry = P.createContext(void 0), iy = {
	className: "",
	nodeRef: P.createRef()
};
ry.Provider;
var ay = () => P.useContext(ry) ?? iy, oy = (e, t) => {
	let { layout: n = "auto", intent: r = "info", politeness: i } = e, a = i ?? r === "info" ? "polite" : "assertive", o = n === "auto", { ref: s, reflowing: c } = ny(o), l = o ? c ? "multiline" : "singleline" : n, { className: u, nodeRef: d } = ay(), f = P.useRef(null), p = P.useRef(null), { announce: m } = li(), h = Di();
	return P.useEffect(() => {
		let e = [p.current?.textContent, f.current?.textContent].filter(Boolean).join(",");
		m(e, {
			polite: a === "polite",
			alert: a === "assertive"
		});
	}, [
		p,
		f,
		m,
		a
	]), {
		components: {
			root: "div",
			icon: "div",
			bottomReflowSpacer: "div"
		},
		root: er(Ir("div", {
			ref: Oi(t, s, d),
			role: "group",
			"aria-labelledby": h,
			...e
		}), { elementType: "div" }),
		icon: tr(e.icon, {
			renderByDefault: !0,
			elementType: "div"
		}),
		bottomReflowSpacer: tr(e.bottomReflowSpacer, {
			renderByDefault: l === "multiline",
			elementType: "div"
		}),
		layout: l,
		intent: r,
		transitionClassName: u,
		actionsRef: f,
		bodyRef: p,
		titleId: h
	};
}, sy = (e, t) => {
	let { shape: n = "rounded", ...r } = e, i = oy(r, Oi(t, _d()));
	return {
		...i,
		shape: n,
		icon: tr(e.icon, {
			defaultProps: { children: ty(i.intent) },
			renderByDefault: !0,
			elementType: "div"
		})
	};
}, cy = P.createContext(void 0), ly = {
	titleId: "",
	layout: "singleline",
	actionsRef: P.createRef(),
	bodyRef: P.createRef()
}, uy = cy.Provider, dy = () => P.useContext(cy) ?? ly, fy = (e, t) => /*#__PURE__*/ R(uy, {
	value: t.messageBar,
	children: /*#__PURE__*/ ra(e.root, { children: [
		e.icon && /*#__PURE__*/ R(e.icon, {}),
		e.root.children,
		e.bottomReflowSpacer && /*#__PURE__*/ R(e.bottomReflowSpacer, {})
	] })
}), py = {
	root: "fui-MessageBar",
	icon: "fui-MessageBar__icon",
	bottomReflowSpacer: "fui-MessageBar__bottomReflowSpacer"
}, my = /*#__PURE__*/ qn("r2oyxsj", "r1wuyrhw", [".r2oyxsj{white-space:nowrap;display:grid;grid-template-columns:auto 1fr auto auto;grid-template-rows:1fr;grid-template-areas:\"icon body secondaryActions actions\";padding-left:var(--spacingHorizontalM);border:var(--strokeWidthThin) solid var(--colorNeutralStroke1);border-radius:var(--borderRadiusMedium);align-items:center;min-height:36px;box-sizing:border-box;background-color:var(--colorNeutralBackground3);}", ".r1wuyrhw{white-space:nowrap;display:grid;grid-template-columns:auto 1fr auto auto;grid-template-rows:1fr;grid-template-areas:\"icon body secondaryActions actions\";padding-right:var(--spacingHorizontalM);border:var(--strokeWidthThin) solid var(--colorNeutralStroke1);border-radius:var(--borderRadiusMedium);align-items:center;min-height:36px;box-sizing:border-box;background-color:var(--colorNeutralBackground3);}"]), hy = /*#__PURE__*/ qn("r1df1z33", "rivnfjc", [".r1df1z33{grid-area:icon;font-size:var(--fontSizeBase500);margin-right:var(--spacingHorizontalS);color:var(--colorNeutralForeground3);display:flex;align-items:center;}", ".rivnfjc{grid-area:icon;font-size:var(--fontSizeBase500);margin-left:var(--spacingHorizontalS);color:var(--colorNeutralForeground3);display:flex;align-items:center;}"]), gy = /*#__PURE__*/ qn("r1vx593n", null, [".r1vx593n{margin-bottom:var(--spacingVerticalS);grid-area:secondaryActions;}"]), _y = /*#__PURE__*/ I({
	rootMultiline: {
		Huce71: "f6juhto",
		Bt984gj: "f1s2louj",
		z8tnut: "f1ngh7ph",
		Budl1dq: "f17g0uqy",
		zoa1oz: "f1w7oly7"
	},
	secondaryActionsMultiline: {
		Brf1p80: "f1e8xxv9",
		B6of3ja: "f1gaxbfw",
		jrapky: "fqcjy3b",
		t21cq0: ["fibjyge", "f9yszdx"]
	},
	square: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "fokr779"
	}
}, { d: [
	".f6juhto{white-space:normal;}",
	".f1s2louj{align-items:start;}",
	".f1ngh7ph{padding-top:var(--spacingVerticalMNudge);}",
	".f17g0uqy{grid-template-columns:auto 1fr auto;}",
	".f1w7oly7{grid-template-areas:\"icon body actions\" \"secondaryActions secondaryActions secondaryActions\";}",
	".f1e8xxv9{justify-content:end;}",
	".f1gaxbfw{margin-top:var(--spacingVerticalMNudge);}",
	".fqcjy3b{margin-bottom:var(--spacingVerticalS);}",
	".fibjyge{margin-right:0px;}",
	".f9yszdx{margin-left:0px;}",
	[".fokr779{border-radius:0;}", { p: -1 }]
] }), vy = /*#__PURE__*/ I({
	info: {},
	error: { sj55zd: "f1ca9wz" },
	warning: { sj55zd: "f14a4cve" },
	success: { sj55zd: "f36rra6" }
}, { d: [
	".f1ca9wz{color:var(--colorStatusDangerForeground1);}",
	".f14a4cve{color:var(--colorStatusWarningForeground3);}",
	".f36rra6{color:var(--colorStatusSuccessForeground1);}"
] }), yy = /*#__PURE__*/ I({
	info: {},
	error: {
		De3pzq: "f1eon7jj",
		g2u3we: "f1f8dvr7",
		h3c5rm: ["f1g1ijmo", "f1nxacbt"],
		B9xav0g: "fo25q1j",
		zhjwy3: ["f1nxacbt", "f1g1ijmo"]
	},
	warning: {
		De3pzq: "f13ftzij",
		g2u3we: "frd1ypx",
		h3c5rm: ["f1gyjrma", "f18qd5xz"],
		B9xav0g: "fqyqtrt",
		zhjwy3: ["f18qd5xz", "f1gyjrma"]
	},
	success: {
		De3pzq: "f64thcm",
		g2u3we: "f1b4u7v",
		h3c5rm: ["f1nyd2b1", "f70v3om"],
		B9xav0g: "fk173vo",
		zhjwy3: ["f70v3om", "f1nyd2b1"]
	}
}, { d: [
	".f1eon7jj{background-color:var(--colorStatusDangerBackground1);}",
	".f1f8dvr7{border-top-color:var(--colorStatusDangerBorder1);}",
	".f1g1ijmo{border-right-color:var(--colorStatusDangerBorder1);}",
	".f1nxacbt{border-left-color:var(--colorStatusDangerBorder1);}",
	".fo25q1j{border-bottom-color:var(--colorStatusDangerBorder1);}",
	".f13ftzij{background-color:var(--colorStatusWarningBackground1);}",
	".frd1ypx{border-top-color:var(--colorStatusWarningBorder1);}",
	".f1gyjrma{border-right-color:var(--colorStatusWarningBorder1);}",
	".f18qd5xz{border-left-color:var(--colorStatusWarningBorder1);}",
	".fqyqtrt{border-bottom-color:var(--colorStatusWarningBorder1);}",
	".f64thcm{background-color:var(--colorStatusSuccessBackground1);}",
	".f1b4u7v{border-top-color:var(--colorStatusSuccessBorder1);}",
	".f1nyd2b1{border-right-color:var(--colorStatusSuccessBorder1);}",
	".f70v3om{border-left-color:var(--colorStatusSuccessBorder1);}",
	".fk173vo{border-bottom-color:var(--colorStatusSuccessBorder1);}"
] }), by = (e) => {
	let t = my(), n = hy(), r = vy(), i = yy(), a = gy(), o = _y();
	return e.root.className = A(py.root, t, e.layout === "multiline" && o.rootMultiline, e.shape === "square" && o.square, i[e.intent], e.root.className), e.icon && (e.icon.className = A(py.icon, n, r[e.intent], e.icon.className)), e.bottomReflowSpacer && (e.bottomReflowSpacer.className = A(py.bottomReflowSpacer, a)), e;
};
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBar/useMessageBarContextValues.js
function xy(e) {
	let { layout: t, actionsRef: n, bodyRef: r, titleId: i } = e;
	return { messageBar: P.useMemo(() => ({
		layout: t,
		actionsRef: n,
		bodyRef: r,
		titleId: i
	}), [
		t,
		n,
		r,
		i
	]) };
}
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBar/MessageBar.js
var Sy = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = sy(e, t);
	return by(n), ai("useMessageBarStyles_unstable")(n), fy(n, xy(n));
});
Sy.displayName = "MessageBar";
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarActions/useMessageBarActions.js
var Cy = (e, t) => {
	let { layout: n = "singleline", actionsRef: r } = dy();
	return {
		components: {
			root: "div",
			containerAction: "div"
		},
		containerAction: tr(e.containerAction, {
			renderByDefault: !1,
			elementType: "div"
		}),
		root: er(Ir("div", {
			ref: Oi(t, r),
			...e
		}), { elementType: "div" }),
		layout: n,
		hasActions: !!e.children
	};
}, wy = (e, t) => /*#__PURE__*/ ra(Nh, {
	value: t.button,
	children: [
		e.layout === "multiline" && e.containerAction && /*#__PURE__*/ R(e.containerAction, {}, "containerAction"),
		/*#__PURE__*/ R(e.root, {}),
		e.layout !== "multiline" && e.containerAction && /*#__PURE__*/ R(e.containerAction, {}, "containerAction")
	]
}), Ty = {
	root: "fui-MessageBarActions",
	containerAction: "fui-MessageBarActions__containerAction"
}, Ey = /*#__PURE__*/ qn("r1t4x98y", "r15utzv5", [".r1t4x98y{grid-area:secondaryActions;display:flex;column-gap:var(--spacingHorizontalM);padding-right:var(--spacingHorizontalM);}", ".r15utzv5{grid-area:secondaryActions;display:flex;column-gap:var(--spacingHorizontalM);padding-left:var(--spacingHorizontalM);}"]), Dy = /*#__PURE__*/ qn("rgzw8nq", "r13ur29z", [".rgzw8nq{grid-area:actions;padding-right:var(--spacingHorizontalM);}", ".r13ur29z{grid-area:actions;padding-left:var(--spacingHorizontalM);}"]), Oy = /*#__PURE__*/ I({
	root: {
		Brf1p80: "f1e8xxv9",
		B6of3ja: "f1gaxbfw",
		jrapky: "fqcjy3b",
		t21cq0: ["fibjyge", "f9yszdx"],
		z189sj: ["f1p3vkop", "f8cewkv"]
	},
	noActions: { mc9l5x: "fjseox" }
}, { d: [
	".f1e8xxv9{justify-content:end;}",
	".f1gaxbfw{margin-top:var(--spacingVerticalMNudge);}",
	".fqcjy3b{margin-bottom:var(--spacingVerticalS);}",
	".fibjyge{margin-right:0px;}",
	".f9yszdx{margin-left:0px;}",
	".f1p3vkop{padding-right:var(--spacingVerticalM);}",
	".f8cewkv{padding-left:var(--spacingVerticalM);}",
	".fjseox{display:none;}"
] }), ky = (e) => {
	let t = Ey(), n = Dy(), r = Oy();
	return e.root.className = A(Ty.root, t, e.layout === "multiline" && r.root, !e.hasActions && r.noActions, e.root.className), e.containerAction && (e.containerAction.className = A(Ty.containerAction, n, e.containerAction.className)), e;
};
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarActions/useMessageBarActionsContextValues.js
function Ay() {
	return { button: P.useMemo(() => ({ size: "small" }), []) };
}
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarActions/MessageBarActions.js
var jy = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = Cy(e, t);
	return ky(n), ai("useMessageBarActionsStyles_unstable")(n), wy(n, Ay());
});
jy.displayName = "MessageBarActions";
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarBody/useMessageBarBody.js
var My = (e, t) => {
	let { bodyRef: n } = dy();
	return {
		components: { root: "div" },
		root: er(Ir("div", {
			ref: Oi(t, n),
			...e
		}), { elementType: "div" })
	};
}, Ny = (e, t) => /*#__PURE__*/ R(gg, {
	value: t.link,
	children: /*#__PURE__*/ R(e.root, {})
}), Py = { root: "fui-MessageBarBody" }, Fy = /*#__PURE__*/ qn("rtatq2b", "re2rary", [".rtatq2b{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase300);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);grid-area:body;padding-right:var(--spacingHorizontalM);}", ".re2rary{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase300);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);grid-area:body;padding-left:var(--spacingHorizontalM);}"]), Iy = (e) => {
	let t = Fy();
	return e.root.className = A(Py.root, t, e.root.className), e;
};
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarBody/useMessageBarBodyContextValues.js
function Ly(e) {
	return { link: P.useMemo(() => ({ inline: !0 }), []) };
}
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarBody/MessageBarBody.js
var Ry = /*#__PURE__*/ P.forwardRef((e, t) => {
	let n = My(e, t), r = Ly(n);
	return Iy(n), ai("useMessageBarBodyStyles_unstable")(n), Ny(n, r);
});
Ry.displayName = "MessageBarBody";
//#endregion
//#region public/plugins/_shared/theme.js
var zy = _(), By = {
	background: "colorNeutralBackground1",
	foreground: "colorNeutralForeground1",
	muted: "colorNeutralForeground2",
	accent: "colorBrandBackground"
};
function Vy() {
	return (typeof window < "u" && window.matchMedia?.("(prefers-color-scheme: light)"))?.matches ? "light" : "dark";
}
function Hy(e) {
	let t = e && typeof e == "object" ? e : {}, n = t.colorScheme === "light" ? "light" : t.colorScheme === "dark" ? "dark" : Vy(), r = n === "light" ? sl : ll, i = {};
	for (let [e, n] of Object.entries(t)) {
		if (typeof n != "string" || !n || e === "colorScheme") continue;
		let t = By[e];
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
function Uy(e) {
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
var Wy = {
	init: null,
	legacyTheme: null,
	started: !1
};
function Gy() {
	Wy.started || (Wy.started = !0, e.onInit((e) => {
		Wy.init ||= e;
	}), window.addEventListener("message", (e) => {
		let t = e.data;
		t && t.type === "wtsl:init" && t.theme && (Wy.legacyTheme ||= t.theme);
	}));
}
function Ky(e) {
	return Wy.init?.theme ? Wy.init.theme : Wy.legacyTheme && Uy(Wy.legacyTheme) || { colorScheme: e };
}
function qy(e) {
	let t = Wy.init?.config;
	if (t && typeof t == "object") return t[e];
}
var Jy = "(prefers-color-scheme: light)";
function Yy() {
	return typeof window > "u" || typeof window.matchMedia != "function" ? "dark" : window.matchMedia(Jy).matches ? "light" : "dark";
}
function Xy(t = "dark") {
	let [n, r] = (0, P.useState)(() => Ky(t)), [i, a] = (0, P.useState)(Yy);
	(0, P.useEffect)(() => {
		let t = e.onInit((e) => {
			e && typeof e == "object" && e.theme && typeof e.theme == "object" && r(e.theme);
		}), n = e.onTheme((e) => {
			e && typeof e == "object" && r(e);
		});
		return () => {
			t(), n();
		};
	}, []), (0, P.useEffect)(() => {
		if (e.inHost || typeof window.matchMedia != "function") return;
		let t = window.matchMedia(Jy), n = () => a(t.matches ? "light" : "dark");
		return typeof t.addEventListener == "function" ? (t.addEventListener("change", n), () => t.removeEventListener("change", n)) : (t.addListener(n), () => t.removeListener(n));
	}, []);
	let o = e.inHost ? n : {
		...n,
		colorScheme: i
	}, s = (0, P.useMemo)(() => Hy(o), [o]);
	return (0, P.useEffect)(() => {
		typeof document < "u" && (document.documentElement.style.colorScheme = s.scheme, document.body && (document.body.style.colorScheme = s.scheme));
	}, [s.scheme]), s;
}
function Zy(t, n) {
	let r = (0, P.useRef)(t);
	r.current = t;
	let [i, a] = (0, P.useState)(() => {
		let e = Wy.init?.size;
		return Array.isArray(e) ? r.current(e) : n;
	});
	return (0, P.useEffect)(() => {
		let t = (e) => {
			Array.isArray(e) && e.length === 2 && a(r.current(e));
		}, n = e.onInit((e) => t(e?.size)), i = e.onResize(t);
		return () => {
			n(), i();
		};
	}, []), i;
}
function Qy(t, n, r) {
	let i = (0, P.useRef)(r);
	i.current = r;
	let [a, o] = (0, P.useState)(() => {
		let e = qy(t);
		return i.current ? i.current(e) : e ?? n;
	}), [s, c] = (0, P.useState)(() => qy(t) !== void 0);
	(0, P.useEffect)(() => {
		let r = qy(t);
		if (r !== void 0) {
			o(i.current ? i.current(r) : r), c(!0);
			return;
		}
		let a = !0;
		return e.getConfig(t).then((e) => {
			a && (o(i.current ? i.current(e) : e ?? n), c(!0));
		}).catch(() => {
			a && c(!0);
		}), () => {
			a = !1;
		};
	}, [t]);
	let l = (0, P.useCallback)((n) => {
		o((r) => {
			let i = typeof n == "function" ? n(r) : n;
			return e.setConfig(t, i).catch(() => {}), i;
		});
	}, [t]);
	return (0, P.useEffect)(() => {
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
function $y() {
	let e = new URLSearchParams(location.search);
	return e.get("view") || (e.get("settings") === "1" ? "settings" : null);
}
function eb(e, t) {
	window.parent.postMessage({
		type: "plugin:request-overlay",
		payload: {
			view: e,
			title: t
		}
	}, "*");
}
function tb() {
	window.parent.postMessage({ type: "plugin:request-host-settings" }, "*");
}
var nb = 500, rb = 8, ib = [
	"button",
	"input",
	"textarea",
	"select",
	"a",
	"[role=\"button\"]",
	"[role=\"tab\"]",
	"[role=\"switch\"]",
	"[role=\"checkbox\"]",
	"[role=\"radio\"]",
	"[role=\"slider\"]",
	"[contenteditable]"
].join(",");
function ab(e, t) {
	if (!(t instanceof Element)) return !1;
	let n = t.closest(ib);
	return !!(n && n !== e && e.contains(n));
}
function ob() {
	let t = (0, P.useRef)(null);
	return (0, P.useEffect)(() => {
		let n = t.current;
		if (!n || !e.inHost || $y()) return;
		let r = null, i = 0, a = 0, o = 0, s = !1, c = !1, l = 0, u = !1, d = (e) => e === "mouse" || e === "pen", f = (e, t) => {
			window.parent.postMessage({
				type: "plugin:card-pointer",
				phase: e,
				pointerType: t
			}, "*");
		}, p = () => {
			o &&= (window.clearTimeout(o), 0);
		};
		function m(e) {
			e.preventDefault(), e.stopPropagation(), h();
		}
		function h() {
			u = !1, window.removeEventListener("click", m, !0), l &&= (window.clearTimeout(l), 0);
		}
		let g = () => {
			h(), u = !0, window.addEventListener("click", m, !0), l = window.setTimeout(h, 1e4);
		}, _ = () => {
			u && (l && window.clearTimeout(l), l = window.setTimeout(h, 1e3));
		}, v = (e) => {
			e.button === 0 && (ab(n, e.target) || r === null && (r = e.pointerId, i = e.clientX, a = e.clientY, s = !1, f("down", e.pointerType), o = window.setTimeout(() => {
				o = 0, s = !0, g(), window.parent.postMessage({ type: "plugin:request-edit-mode" }, "*");
			}, nb)));
		}, y = (e) => {
			if (d(e.pointerType)) {
				let t = !ab(n, e.target);
				t !== c && (c = t, f(t ? "hover-enter" : "hover-leave", e.pointerType));
			}
			r !== null && e.pointerId === r && (Math.hypot(e.clientX - i, e.clientY - a) <= rb || (p(), !s && (r = null, f("cancel", e.pointerType))));
		}, b = (e) => {
			r !== null && e.pointerId === r && (r = null, p(), f("up", e.pointerType), s && _());
		}, x = (e) => {
			r !== null && e.pointerId === r && (r = null, p(), f("cancel", e.pointerType), s && _());
		}, S = (e) => {
			d(e.pointerType) && c && (c = !1, f("hover-leave", e.pointerType)), r !== null && e.pointerId === r && (r = null, p(), s ? _() : f("cancel", e.pointerType));
		}, C = (e) => e.preventDefault();
		return n.addEventListener("pointerdown", v, !0), n.addEventListener("pointermove", y, !0), n.addEventListener("pointerleave", S), window.addEventListener("pointerup", b), window.addEventListener("pointercancel", x), document.addEventListener("contextmenu", C, !0), () => {
			n.removeEventListener("pointerdown", v, !0), n.removeEventListener("pointermove", y, !0), n.removeEventListener("pointerleave", S), window.removeEventListener("pointerup", b), window.removeEventListener("pointercancel", x), document.removeEventListener("contextmenu", C, !0), p(), h();
		};
	}, []), { ref: t };
}
typeof window < "u" && $y() && window.addEventListener("keydown", (e) => {
	e.key === "Escape" && (e.preventDefault(), window.parent.postMessage({ type: "plugin:request-overlay-close" }, "*"));
});
function sb(t, n) {
	let r = (0, P.useRef)(n);
	r.current = n;
	let i = (0, P.useRef)(t);
	(0, P.useEffect)(() => (e.ready(i.current), e.onToolCall(async (t) => {
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
//#region public/plugins/_shared/motion.js
var cb = "8px", lb = "4px", ub = "48px";
function db(e, t) {
	switch (e) {
		case "down": return `0px -${t}`;
		case "left": return `${t} 0px`;
		case "right": return `-${t} 0px`;
		default: return `0px ${t}`;
	}
}
function fb(e, t = q.durationFaster, n = q.curveAccelerateMin) {
	return ({ direction: r = "up" }) => ({
		enter: {
			keyframes: [{
				opacity: 0,
				translate: db(r, e)
			}, {
				opacity: 1,
				translate: "0px 0px"
			}],
			duration: q.durationNormal,
			easing: q.curveDecelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 0 }, { opacity: 1 }],
				duration: q.durationFaster,
				easing: q.curveDecelerateMid
			}
		},
		exit: {
			keyframes: [{
				opacity: 1,
				translate: "0px 0px"
			}, {
				opacity: 0,
				translate: "0px 0px"
			}],
			duration: t,
			easing: n,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 1 }, { opacity: 0 }],
				duration: q.durationFaster,
				easing: q.curveAccelerateMid
			}
		}
	});
}
sd(fb(cb));
var pb = sd(fb(lb, q.durationFast, q.curveAccelerateMid));
sd(({ element: e }) => {
	let t = `${e.scrollHeight}px`;
	return {
		enter: {
			keyframes: [
				{
					maxHeight: "0px",
					opacity: 0,
					overflow: "hidden"
				},
				{
					maxHeight: t,
					opacity: 1,
					overflow: "hidden",
					offset: .9999
				},
				{
					maxHeight: "unset",
					opacity: 1,
					overflow: "unset"
				}
			],
			duration: q.durationNormal,
			easing: q.curveDecelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 0 }, { opacity: 1 }],
				duration: q.durationFaster,
				easing: q.curveDecelerateMid
			}
		},
		exit: {
			keyframes: [{
				maxHeight: t,
				opacity: 1,
				overflow: "hidden"
			}, {
				maxHeight: "0px",
				opacity: 0,
				overflow: "hidden"
			}],
			duration: q.durationFast,
			easing: q.curveAccelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 1 }, { opacity: 0 }],
				duration: q.durationFaster,
				easing: q.curveAccelerateMid
			}
		}
	};
});
function mb({ value: e, direction: t = "up", children: n, className: r, style: i }) {
	let a = e == null ? "default" : String(e);
	return (0, P.createElement)("div", {
		className: r,
		style: {
			display: "grid",
			minWidth: 0,
			...i
		},
		"data-cross-fade": a
	}, (0, P.createElement)(hd, null, (0, P.createElement)(pb, {
		key: a,
		direction: t
	}, (0, P.createElement)("div", { style: {
		gridArea: "1 / 1",
		minWidth: 0
	} }, n))));
}
var hb = sd(({ direction: e = "forward" }) => {
	let t = e === "back", n = t ? `-${ub} 0px` : `${ub} 0px`, r = t ? `${ub} 0px` : `-${ub} 0px`;
	return {
		enter: {
			keyframes: [{
				opacity: 0,
				translate: n
			}, {
				opacity: 1,
				translate: "0px 0px"
			}],
			duration: q.durationGentle,
			easing: q.curveDecelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 0 }, { opacity: 1 }],
				duration: q.durationFaster,
				easing: q.curveDecelerateMid
			}
		},
		exit: {
			keyframes: [{
				opacity: 1,
				translate: "0px 0px"
			}, {
				opacity: 0,
				translate: r
			}],
			duration: q.durationNormal,
			easing: q.curveAccelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 1 }, { opacity: 0 }],
				duration: q.durationFaster,
				easing: q.curveAccelerateMid
			}
		}
	};
}), gb = {
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
function _b(e) {
	let t = gb[e];
	if (!t) throw Error(`Display XL 只定义了 48/80/96/112，收到 ${String(e)}`);
	return t;
}
var vb = { fontVariantNumeric: "tabular-nums" }, yb = 40, bb = 44, xb = 56, Sb = 48, Cb = 40, wb = 56, Tb = {
	minWidth: yb,
	minHeight: yb
}, Eb = [
	"button",
	"input",
	"textarea",
	"select",
	"a",
	"[role=\"button\"]",
	"[role=\"tab\"]",
	"[role=\"switch\"]",
	"[role=\"checkbox\"]",
	"[role=\"radio\"]",
	"[role=\"slider\"]",
	"[contenteditable]"
].join(",");
function Db(e, t) {
	if (!(t instanceof Element)) return !1;
	let n = t.closest(Eb);
	return !!(n && n !== e && e.contains(n));
}
var Ob = Kn({ root: {
	position: "relative",
	display: "flex",
	flexDirection: "column",
	width: "100%",
	height: "100%",
	minWidth: 0,
	minHeight: 0,
	overflow: "hidden",
	boxSizing: "border-box",
	color: K.colorNeutralForeground1,
	fontFamily: K.fontFamilyBase
} });
function kb({ onActivate: e, ariaLabel: t, className: n, style: r, children: i, ...a }) {
	let o = Ob(), s = ob(), c = (0, P.useCallback)((t) => {
		Db(t.currentTarget, t.target) || e?.(t);
	}, [e]), l = (0, P.useCallback)((t) => {
		(t.key === "Enter" || t.key === " ") && (Db(t.currentTarget, t.target) || (t.preventDefault(), e?.(t)));
	}, [e]);
	return /* @__PURE__ */ (0, F.jsx)("div", {
		...a,
		ref: s.ref,
		role: "button",
		tabIndex: 0,
		"aria-label": t,
		className: A(o.root, n),
		style: r,
		"data-card-root": "true",
		onClick: c,
		onKeyDown: l,
		children: i
	});
}
Kn({
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "space-between",
		gap: K.spacingHorizontalS,
		minHeight: K.lineHeightBase200,
		color: K.colorNeutralForeground3
	},
	title: {
		minWidth: 0,
		color: K.colorNeutralForeground3
	},
	trailing: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		gap: K.spacingHorizontalXS
	}
});
var Ab = Kn({
	root: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: K.spacingVerticalXXS,
		minWidth: 0
	},
	valueRow: {
		display: "flex",
		alignItems: "baseline",
		gap: K.spacingHorizontalXS,
		minWidth: 0
	},
	value: {
		...vb,
		fontWeight: "600",
		color: K.colorNeutralForeground1,
		whiteSpace: "nowrap"
	},
	size48: _b(48),
	size68: {
		fontSize: K.fontSizeHero1000,
		lineHeight: K.lineHeightHero1000
	},
	size80: _b(80),
	size96: _b(96),
	size112: _b(112),
	unit: { color: K.colorNeutralForeground2 },
	meta: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalXXS,
		minWidth: 0
	},
	label: { color: K.colorNeutralForeground2 },
	caption: { color: K.colorNeutralForeground3 }
}), jb = {
	48: "size48",
	68: "size68",
	80: "size80",
	96: "size96",
	112: "size112"
};
function Mb({ value: e, unit: t, label: n, caption: r, size: i = 48, className: a, style: o }) {
	let s = Ab(), c = s[jb[i] ?? "size48"];
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: A(s.root, a),
		style: o,
		children: [/* @__PURE__ */ (0, F.jsxs)("div", {
			className: s.valueRow,
			children: [/* @__PURE__ */ (0, F.jsx)("span", {
				className: A(s.value, c),
				children: e
			}), t ? /* @__PURE__ */ (0, F.jsx)($, {
				size: 300,
				className: s.unit,
				children: t
			}) : null]
		}), n || r ? /* @__PURE__ */ (0, F.jsxs)("div", {
			className: s.meta,
			children: [n ? /* @__PURE__ */ (0, F.jsx)($, {
				size: 300,
				className: s.label,
				children: n
			}) : null, r ? /* @__PURE__ */ (0, F.jsx)($, {
				size: 200,
				className: s.caption,
				children: r
			}) : null]
		}) : null]
	});
}
var Nb = Kn({
	row: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalS,
		width: "100%",
		minHeight: `${bb}px`,
		boxSizing: "border-box",
		paddingInline: 0,
		border: "none",
		background: "transparent",
		color: K.colorNeutralForeground1,
		fontFamily: K.fontFamilyBase,
		textAlign: "left",
		borderRadius: K.borderRadiusMedium
	},
	interactive: {
		cursor: "pointer",
		":hover": { backgroundColor: K.colorNeutralBackground1Hover },
		":active": { backgroundColor: K.colorNeutralBackground1Pressed }
	},
	selected: { backgroundColor: K.colorNeutralBackground1Selected },
	leading: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "center"
	},
	main: {
		display: "flex",
		flex: 1,
		flexDirection: "column",
		gap: K.spacingVerticalXXS,
		minWidth: 0
	},
	title: {
		minWidth: 0,
		color: K.colorNeutralForeground1
	},
	subtitle: {
		minWidth: 0,
		color: K.colorNeutralForeground3
	},
	trailing: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		gap: K.spacingHorizontalXS
	}
});
function Pb({ leading: e, title: t, subtitle: n, trailing: r, onClick: i, selected: a = !1, titleSize: o = 300, className: s, style: c, ...l }) {
	let u = Nb(), d = (e) => {
		i && (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && (e.preventDefault(), i(e));
	};
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		...l,
		role: i ? "button" : void 0,
		tabIndex: i ? 0 : void 0,
		"aria-current": a ? "true" : void 0,
		"aria-pressed": i ? !!a : void 0,
		className: A(u.row, i && u.interactive, a && u.selected, s),
		style: c,
		"data-list-row": "true",
		"data-selected": a ? "true" : void 0,
		onClick: i,
		onKeyDown: d,
		children: [
			e ? /* @__PURE__ */ (0, F.jsx)("div", {
				className: u.leading,
				children: e
			}) : null,
			/* @__PURE__ */ (0, F.jsxs)("div", {
				className: u.main,
				children: [t ? /* @__PURE__ */ (0, F.jsx)($, {
					size: o,
					truncate: !0,
					wrap: !1,
					className: u.title,
					children: t
				}) : null, n ? /* @__PURE__ */ (0, F.jsx)($, {
					size: 200,
					truncate: !0,
					wrap: !1,
					className: u.subtitle,
					children: n
				}) : null]
			}),
			r ? /* @__PURE__ */ (0, F.jsx)("div", {
				className: u.trailing,
				children: r
			}) : null
		]
	});
}
var Fb = Kn({
	root: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: K.spacingVerticalS,
		padding: K.spacingVerticalXXL,
		textAlign: "center"
	},
	icon: {
		display: "inline-flex",
		color: K.colorNeutralForeground3
	},
	title: { color: K.colorNeutralForeground1 },
	description: {
		maxWidth: "42ch",
		color: K.colorNeutralForeground3
	},
	action: { marginTop: K.spacingVerticalS }
});
function Ib({ icon: e, title: t, description: n, action: r, className: i, style: a }) {
	let o = Fb();
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: A(o.root, i),
		style: a,
		"data-empty-state": "true",
		children: [
			e ? /* @__PURE__ */ (0, F.jsx)("div", {
				className: o.icon,
				children: e
			}) : null,
			t ? /* @__PURE__ */ (0, F.jsx)($, {
				size: 400,
				weight: "semibold",
				className: o.title,
				children: t
			}) : null,
			n ? /* @__PURE__ */ (0, F.jsx)($, {
				size: 300,
				className: o.description,
				children: n
			}) : null,
			r ? /* @__PURE__ */ (0, F.jsx)("div", {
				className: o.action,
				children: r
			}) : null
		]
	});
}
var Lb = Kn({ button: {
	minWidth: `${yb}px`,
	minHeight: `${yb}px`
} }), Rb = (0, P.forwardRef)(function({ appearance: e = "secondary", className: t, style: n, children: r, ...i }, a) {
	let o = Lb();
	return /* @__PURE__ */ (0, F.jsx)(Kh, {
		...i,
		ref: a,
		type: "button",
		appearance: e,
		size: "large",
		className: A(o.button, t),
		style: n,
		children: r
	});
}), zb = Kn({ root: {
	position: "relative",
	display: "flex",
	flexDirection: "column",
	width: "100%",
	height: "100%",
	minWidth: 0,
	minHeight: 0,
	overflow: "hidden",
	boxSizing: "border-box",
	backgroundColor: "transparent",
	color: K.colorNeutralForeground1,
	fontFamily: K.fontFamilyBase
} });
function Bb({ children: e, className: t, style: n }) {
	let r = zb();
	return /* @__PURE__ */ (0, F.jsx)("div", {
		className: A(r.root, t),
		style: n,
		"data-detail-page": "true",
		children: e
	});
}
var Vb = Kn({
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "space-between",
		gap: K.spacingHorizontalM,
		minHeight: `${xb}px`,
		paddingInline: K.spacingHorizontalXXL,
		boxSizing: "border-box"
	},
	leading: {
		display: "flex",
		flex: 1,
		alignItems: "center",
		gap: K.spacingHorizontalM,
		minWidth: 0
	},
	trailing: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: K.spacingHorizontalS
	}
});
function Hb({ children: e, trailing: t, className: n, style: r }) {
	let i = Vb();
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: A(i.header, n),
		style: r,
		"data-detail-header": "true",
		children: [/* @__PURE__ */ (0, F.jsx)("div", {
			className: i.leading,
			children: e
		}), t ? /* @__PURE__ */ (0, F.jsx)("div", {
			className: i.trailing,
			children: t
		}) : null]
	});
}
Kn({ toolbar: {
	display: "flex",
	flexShrink: 0,
	alignItems: "center",
	gap: K.spacingHorizontalS,
	minHeight: `${Sb}px`,
	paddingInline: K.spacingHorizontalXXL,
	boxSizing: "border-box"
} });
var Ub = Kn({
	tabs: {
		flexShrink: 0,
		height: `${Cb}px`,
		minHeight: `${Cb}px`,
		paddingInline: K.spacingHorizontalXXL,
		boxSizing: "border-box",
		overflowX: "auto"
	},
	tab: {
		height: `${Cb}px`,
		minHeight: `${Cb}px`,
		paddingBlock: 0
	},
	badge: { marginInlineStart: K.spacingHorizontalXS }
});
function Wb({ items: e, value: t, onChange: n, ariaLabel: r, className: i, style: a }) {
	let o = Ub();
	return !e || e.length === 0 ? null : /* @__PURE__ */ (0, F.jsx)(Tv, {
		size: "medium",
		selectedValue: t,
		onTabSelect: (e, t) => n?.(t.value),
		"aria-label": r,
		className: A(o.tabs, i),
		style: a,
		"data-detail-tabs": "true",
		children: e.map((e) => /* @__PURE__ */ (0, F.jsxs)(Yv, {
			value: e.value,
			className: o.tab,
			children: [e.label, e.badge ? /* @__PURE__ */ (0, F.jsx)("span", {
				className: o.badge,
				children: (0, P.isValidElement)(e.badge) ? e.badge : /* @__PURE__ */ (0, F.jsx)($d, {
					appearance: "tint",
					size: "medium",
					children: e.badge
				})
			}) : null]
		}, e.value))
	});
}
var Gb = Kn({
	wrap: {
		position: "relative",
		display: "flex",
		flex: 1,
		flexDirection: "column",
		minHeight: 0
	},
	scroll: {
		flex: 1,
		minHeight: 0,
		overflowY: "auto",
		overflowX: "hidden",
		paddingBlock: K.spacingVerticalXXL,
		paddingInline: K.spacingHorizontalXXL,
		boxSizing: "border-box",
		overscrollBehavior: "contain",
		scrollbarWidth: "thin"
	},
	scrollShadow: {
		position: "absolute",
		right: 0,
		bottom: 0,
		left: 0,
		height: K.spacingVerticalXXL,
		pointerEvents: "none",
		background: `linear-gradient(to top, ${K.colorNeutralBackground1} 0%, color-mix(in srgb, ${K.colorNeutralBackground1} 72%, transparent) 55%, transparent 100%)`,
		opacity: 0
	},
	scrollShadowVisible: { opacity: 1 }
});
function Kb(e) {
	let [t, n] = (0, P.useState)(!1);
	return (0, P.useEffect)(() => {
		let t = e.current;
		if (!t) return;
		let r = 0, i = () => {
			r ||= window.requestAnimationFrame(() => {
				r = 0;
				let e = t.scrollHeight - t.scrollTop - t.clientHeight > 2;
				n((t) => t === e ? t : e);
			});
		};
		i(), t.addEventListener("scroll", i, { passive: !0 });
		let a = new ResizeObserver(i);
		a.observe(t);
		let o = new MutationObserver(i);
		return o.observe(t, {
			childList: !0,
			subtree: !0
		}), () => {
			window.cancelAnimationFrame(r), t.removeEventListener("scroll", i), a.disconnect(), o.disconnect();
		};
	}, [e]), t;
}
function qb({ children: e, className: t, style: n }) {
	let r = Gb(), i = (0, P.useRef)(null), a = Kb(i);
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: r.wrap,
		"data-scroll-more": a ? "true" : "false",
		children: [/* @__PURE__ */ (0, F.jsx)("div", {
			ref: i,
			className: A(r.scroll, t),
			style: n,
			"data-detail-scroll": "true",
			children: e
		}), /* @__PURE__ */ (0, F.jsx)("div", {
			"aria-hidden": "true",
			"data-scroll-shadow": a ? "visible" : "hidden",
			className: A(r.scrollShadow, a && r.scrollShadowVisible)
		})]
	});
}
var Jb = (0, P.createContext)(null);
function Yb() {
	return (0, P.useContext)(Jb);
}
var Xb = Kn({
	root: {
		position: "absolute",
		inset: 0,
		zIndex: 1,
		display: "flex",
		flexDirection: "column",
		minWidth: 0,
		minHeight: 0,
		overflow: "hidden",
		boxSizing: "border-box",
		backgroundColor: K.colorNeutralBackground1,
		color: K.colorNeutralForeground1,
		fontFamily: K.fontFamilyBase
	},
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: K.spacingHorizontalS,
		minHeight: `${wb}px`,
		paddingInline: K.spacingHorizontalXXL,
		boxSizing: "border-box"
	},
	title: {
		flex: 1,
		minWidth: 0,
		color: K.colorNeutralForeground1
	},
	trailing: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: K.spacingHorizontalS
	},
	contentWrap: {
		position: "relative",
		display: "flex",
		flex: 1,
		flexDirection: "column",
		minHeight: 0
	},
	content: {
		flex: 1,
		minHeight: 0,
		overflowY: "auto",
		overflowX: "hidden",
		paddingBlock: K.spacingVerticalXXL,
		paddingInline: K.spacingHorizontalXXL,
		boxSizing: "border-box",
		overscrollBehavior: "contain",
		scrollbarWidth: "thin"
	},
	scrollShadow: {
		position: "absolute",
		right: 0,
		bottom: 0,
		left: 0,
		height: K.spacingVerticalXXL,
		pointerEvents: "none",
		background: `linear-gradient(to top, ${K.colorNeutralBackground1} 0%, color-mix(in srgb, ${K.colorNeutralBackground1} 72%, transparent) 55%, transparent 100%)`,
		opacity: 0
	},
	scrollShadowVisible: { opacity: 1 },
	footer: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "flex-end",
		gap: K.spacingHorizontalS,
		paddingBlock: K.spacingVerticalM,
		paddingInline: K.spacingHorizontalXXL,
		boxSizing: "border-box"
	}
});
function Zb({ title: e, trailing: t, footer: n, children: r, onClosed: i, backLabel: a = "返回", className: o, style: s }) {
	let c = Xb(), l = (0, P.useRef)(null), u = Kb(l), [d, f] = (0, P.useState)(!0), [p, m] = (0, P.useState)("forward"), [h, g] = (0, P.useState)(!0), _ = (0, P.useRef)(!1), v = (0, P.useCallback)(() => {
		_.current || (_.current = !0, m("back"), f(!1));
	}, []), y = (0, P.useCallback)((e, t) => {
		t?.direction === "exit" && (g(!1), i?.());
	}, [i]);
	if (!h) return null;
	let b = typeof n == "function" ? n(v) : n;
	return /* @__PURE__ */ (0, F.jsx)(Jb.Provider, {
		value: v,
		children: /* @__PURE__ */ (0, F.jsx)(hb, {
			visible: d,
			appear: !0,
			direction: p,
			unmountOnExit: !0,
			onMotionFinish: y,
			children: /* @__PURE__ */ (0, F.jsxs)("div", {
				className: A(c.root, o),
				style: s,
				"data-subpage": "true",
				children: [
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: c.header,
						"data-subpage-header": "true",
						children: [
							/* @__PURE__ */ (0, F.jsx)(Kh, {
								appearance: "subtle",
								size: "large",
								icon: /* @__PURE__ */ (0, F.jsx)(Fu, {}),
								"aria-label": a,
								title: a,
								onClick: v,
								style: Tb
							}),
							/* @__PURE__ */ (0, F.jsx)($, {
								size: 400,
								weight: "semibold",
								truncate: !0,
								wrap: !1,
								className: c.title,
								children: e
							}),
							t ? /* @__PURE__ */ (0, F.jsx)("div", {
								className: c.trailing,
								children: t
							}) : null
						]
					}),
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: c.contentWrap,
						"data-subpage-scroll-more": u ? "true" : "false",
						children: [/* @__PURE__ */ (0, F.jsx)("div", {
							ref: l,
							className: c.content,
							children: r
						}), /* @__PURE__ */ (0, F.jsx)("div", {
							"aria-hidden": "true",
							"data-subpage-scroll-shadow": u ? "visible" : "hidden",
							className: A(c.scrollShadow, u && c.scrollShadowVisible)
						})]
					}),
					b ? /* @__PURE__ */ (0, F.jsx)("div", {
						className: c.footer,
						children: b
					}) : null
				]
			})
		})
	});
}
function Qb(e = 1e3) {
	let [t, n] = (0, P.useState)(() => Date.now()), [r, i] = (0, P.useState)(() => typeof document > "u" || !document.hidden);
	return (0, P.useEffect)(() => {
		if (typeof document > "u") return;
		let e = () => i(!document.hidden);
		return document.addEventListener("visibilitychange", e), () => document.removeEventListener("visibilitychange", e);
	}, []), (0, P.useEffect)(() => {
		if (!r) return;
		n(Date.now());
		let t = window.setInterval(() => n(Date.now()), Math.max(1, e));
		return () => window.clearInterval(t);
	}, [e, r]), t;
}
//#endregion
//#region public/plugins/weather/src/data/icons.js
var $b = {
	100: "150",
	101: "151",
	102: "152",
	103: "153"
}, ex = new Set([
	100,
	101,
	102,
	103,
	104,
	150,
	151,
	152,
	153,
	300,
	301,
	302,
	303,
	304,
	305,
	306,
	307,
	308,
	309,
	310,
	311,
	312,
	313,
	314,
	315,
	316,
	317,
	318,
	350,
	351,
	399,
	400,
	401,
	402,
	403,
	404,
	405,
	406,
	407,
	408,
	409,
	410,
	456,
	457,
	499,
	500,
	501,
	502,
	503,
	504,
	507,
	508,
	509,
	510,
	511,
	512,
	513,
	514,
	515,
	801,
	802,
	803,
	804,
	805,
	806,
	807,
	900,
	901,
	999
].map(String)), tx = {
	200: "302",
	201: "302",
	202: "303",
	203: "304",
	204: "305",
	205: "307",
	206: "308",
	207: "302",
	208: "302",
	209: "302",
	210: "304",
	211: "304",
	212: "303",
	213: "303",
	800: "999"
}, nx = {
	100: "晴",
	101: "多云",
	102: "少云",
	103: "晴间多云",
	104: "阴",
	150: "晴",
	151: "多云",
	152: "少云",
	153: "晴间多云",
	300: "阵雨",
	301: "强阵雨",
	302: "雷阵雨",
	303: "强雷阵雨",
	304: "雷阵雨伴有冰雹",
	305: "小雨",
	306: "中雨",
	307: "大雨",
	308: "极端降雨",
	309: "毛毛雨",
	310: "暴雨",
	311: "大暴雨",
	312: "特大暴雨",
	313: "冻雨",
	314: "小到中雨",
	315: "中到大雨",
	316: "大到暴雨",
	317: "暴雨到大暴雨",
	318: "大暴雨到特大暴雨",
	399: "雨",
	400: "小雪",
	401: "中雪",
	402: "大雪",
	403: "暴雪",
	404: "雨夹雪",
	405: "雨雪天气",
	406: "阵雨夹雪",
	407: "阵雪",
	408: "小到中雪",
	409: "中到大雪",
	410: "大到暴雪",
	499: "雪",
	500: "薄雾",
	501: "雾",
	502: "霾",
	503: "扬沙",
	504: "浮尘",
	507: "沙尘暴",
	508: "强沙尘暴",
	509: "浓雾",
	510: "强浓雾",
	511: "中度霾",
	512: "重度霾",
	513: "严重霾",
	514: "大雾",
	515: "特强浓雾",
	900: "热",
	901: "冷",
	999: "未知"
};
function rx(e, t) {
	let n = String(e ?? "").trim();
	if (!n) return "999";
	if (t && $b[n] && (n = $b[n]), ex.has(n)) return n;
	if (tx[n]) return tx[n];
	let r = n.slice(0, 1);
	return r === "2" ? "302" : r === "3" ? "399" : r === "4" ? "499" : r === "5" ? "502" : "999";
}
function ix(e, { night: t = !1, scheme: n = "dark" } = {}) {
	let r = rx(e, t);
	return `icons/${n === "light" ? "light" : "dark"}/${r}.svg`;
}
function ax(e, t) {
	return t || nx[String(e)] || "未知";
}
//#endregion
//#region public/plugins/weather/src/data/format.js
var ox = [
	"周日",
	"周一",
	"周二",
	"周三",
	"周四",
	"周五",
	"周六"
], sx = (e) => String(e).padStart(2, "0");
function cx(e) {
	if (!e) return null;
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? null : t;
}
function lx(e) {
	let t = cx(e);
	return t ? `${sx(t.getHours())}:00` : "--:--";
}
function ux(e, t = -1) {
	let n = px(e);
	if (!n) return e || "--";
	let r = hx(), i = Math.round((mx(n) - r) / 864e5);
	return i === 0 || t === 0 ? "今天" : i === 1 || t === 1 ? "明天" : ox[n.getDay()];
}
function dx(e) {
	let t = px(e);
	return t ? `${t.getMonth() + 1}/${t.getDate()}` : "";
}
function fx(e) {
	if (!e) return "";
	let t = /^(\d{4}-\d{2}-\d{2})/.exec(e);
	return t ? t[1] : e;
}
function px(e) {
	let t = /^(\d{4})-(\d{2})-(\d{2})/.exec(e || "");
	return t ? new Date(Number(t[1]), Number(t[2]) - 1, Number(t[3])) : null;
}
function mx(e) {
	return new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
}
function hx() {
	return mx(/* @__PURE__ */ new Date());
}
function gx(e, t) {
	if (e == null || Number.isNaN(Number(e))) return null;
	let n = Number(e);
	return t === "f" ? n * 1.8 + 32 : n;
}
function _x(e, t, n = {}) {
	let r = gx(e, t);
	return r == null ? "--°" : `${Math.round(r)}°`;
}
function vx(e, t = Date.now()) {
	if (!e) return "尚未更新";
	let n = Math.max(0, Math.round((t - e) / 6e4));
	if (n < 1) return "刚刚更新";
	if (n < 60) return `${n} 分钟前更新`;
	let r = Math.round(n / 60);
	return r < 24 ? `${r} 小时前更新` : `${Math.round(r / 24)} 天前更新`;
}
function yx(e, t = Date.now()) {
	return e ? Math.max(0, Math.round((t - e) / 6e4)) : null;
}
var bx = {
	n: "北风",
	nne: "东北偏北风",
	ne: "东北风",
	ene: "东北偏东风",
	e: "东风",
	ese: "东南偏东风",
	se: "东南风",
	sse: "东南偏南风",
	s: "南风",
	ssw: "西南偏南风",
	sw: "西南风",
	wsw: "西南偏西风",
	w: "西风",
	wnw: "西北偏西风",
	nw: "西北风",
	nnw: "西北偏北风",
	none: "无持续风向",
	vrb: "风向不定"
};
function xx(e) {
	return e ? bx[String(e).toLowerCase()] || String(e) : "";
}
function Sx(e, t, n) {
	let r = e || "";
	return t != null && t !== "" ? `${r}${t}级` : n == null ? r || "—" : `${r}${Math.round(n * 3.6)}km/h`;
}
function Cx(e) {
	return e == null || Number.isNaN(Number(e)) ? "—" : `${Math.round(Number(e))}%`;
}
function wx(e) {
	return e == null || Number.isNaN(Number(e)) ? "" : `降水 ${Math.round(Number(e))}%`;
}
function Tx(e) {
	if (e == null || Number.isNaN(Number(e))) return "—";
	let t = Number(e);
	return t >= 1e3 ? `${(t / 1e3).toFixed(t >= 1e4 ? 0 : 1)} km` : `${Math.round(t)} m`;
}
function Ex(e) {
	return e == null || Number.isNaN(Number(e)) ? "—" : `${Math.round(Number(e))} hPa`;
}
function Dx(e) {
	return e == null || Number.isNaN(Number(e)) ? "—" : String(Math.round(Number(e)));
}
var Ox = {
	Excellent: "优",
	Good: "良",
	Fair: "良",
	Moderate: "良",
	"Unhealthy for Sensitive Groups": "轻度污染",
	"Lightly Polluted": "轻度污染",
	Unhealthy: "中度污染",
	Moderately: "中度污染",
	"Very Unhealthy": "重度污染",
	"Heavily Polluted": "重度污染",
	Hazardous: "严重污染",
	Severe: "严重污染"
};
function kx(e, t) {
	return e ? Ox[e] || e : t ? `${t}级` : "—";
}
var Ax = {
	unknown: "未知",
	minor: "一般",
	moderate: "较重",
	severe: "严重",
	extreme: "特别严重"
};
function jx(e) {
	if (!e) return null;
	if (typeof e == "string") return e;
	let { red: t = 0, green: n = 0, blue: r = 0, alpha: i = 1 } = e;
	return `rgba(${t}, ${n}, ${r}, ${i})`;
}
function Mx(e) {
	let t = Number(e);
	return Number.isFinite(t) ? t <= 50 ? "rgb(0, 228, 0)" : t <= 100 ? "rgb(255, 255, 0)" : t <= 150 ? "rgb(255, 126, 0)" : t <= 200 ? "rgb(255, 0, 0)" : t <= 300 ? "rgb(143, 63, 151)" : "rgb(126, 0, 35)" : null;
}
var Nx = {
	pm2p5: "PM2.5",
	pm10: "PM10",
	no2: "NO₂",
	so2: "SO₂",
	co: "CO",
	o3: "O₃",
	no: "NO",
	nmhc: "NMHC"
}, Px = {
	"1x1": [1, 1],
	"2x1": [2, 1],
	"2x2": [2, 2],
	"3x2": [3, 2],
	"4x2": [4, 2]
};
function Fx(e) {
	if (!Array.isArray(e) || e.length < 2) return "3x2";
	let t = `${Number(e[0])}x${Number(e[1])}`;
	return Px[t] ? t : "3x2";
}
function Ix(e) {
	if (!e) return null;
	let t = /^(\d+)\s*[x×]\s*(\d+)$/i.exec(String(e).trim());
	if (!t) return null;
	let n = `${Number(t[1])}x${Number(t[2])}`;
	return Px[n] ? Px[n] : null;
}
function Lx(e, t, n = Date.now()) {
	if (!e) return !1;
	let r = Math.max(2, Number(t) || 30) * 2 * 60 * 1e3;
	return n - e > r;
}
function Rx() {
	let e = new URLSearchParams(location.search);
	return e.get("mock") === "1" || e.get("demo") === "1";
}
function zx() {
	return Ix(new URLSearchParams(location.search).get("size"));
}
//#endregion
//#region public/plugins/weather/src/components/atoms.jsx
var Bx = Kn({
	icon: {
		display: "block",
		objectFit: "contain",
		flexShrink: 0,
		userSelect: "none",
		pointerEvents: "none"
	},
	condition: {
		color: K.colorNeutralForeground1,
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis"
	},
	hilo: {
		color: K.colorNeutralForeground3,
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	status: {
		color: K.colorNeutralForeground3,
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis"
	},
	offline: { color: K.colorStatusWarningForeground1 },
	warningBadge: { flexShrink: 0 }
});
function Vx({ code: e, night: t = !1, scheme: n = "dark", size: r = 48, title: i }) {
	let a = Bx(), o = typeof r == "number" ? `${r}px` : r;
	return /* @__PURE__ */ (0, F.jsx)("img", {
		className: a.icon,
		style: {
			width: o,
			height: o
		},
		src: ix(e, {
			night: t,
			scheme: n
		}),
		alt: i || ax(e),
		draggable: !1
	});
}
function Hx({ code: e, text: t, size: n = 400, className: r }) {
	let i = Bx();
	return /* @__PURE__ */ (0, F.jsx)($, {
		size: n,
		className: A(i.condition, r),
		children: ax(e, t)
	});
}
function Ux({ max: e, min: t, unit: n, className: r, size: i = 300 }) {
	let a = Bx();
	return /* @__PURE__ */ (0, F.jsxs)($, {
		size: i,
		className: A(a.hilo, r),
		children: [
			_x(e, n),
			" / ",
			_x(t, n)
		]
	});
}
function Wx({ offline: e, fetchedAt: t, refreshMin: n, className: r, now: i = Date.now() }) {
	let a = Bx();
	if (!t) return null;
	let o = yx(t, i), s = Lx(t, n, i), c = `${e ? "离线 · " : ""}${o <= 0 ? "刚刚更新" : `${o} 分钟前更新`}${s ? " · 数据可能过期" : ""}`;
	return /* @__PURE__ */ (0, F.jsx)($, {
		size: 200,
		className: A(a.status, e && a.offline, r),
		children: c
	});
}
function Gx({ count: e, className: t }) {
	let n = Bx();
	return e ? /* @__PURE__ */ (0, F.jsx)($d, {
		appearance: "tint",
		color: "danger",
		size: "medium",
		className: A(n.warningBadge, t),
		"aria-label": `${e} 条天气预警`,
		title: `${e} 条天气预警`,
		children: e
	}) : null;
}
//#endregion
//#region public/plugins/weather/src/components/forecast.jsx
var Kx = Kn({
	hourlyStrip: {
		display: "grid",
		gridAutoFlow: "column",
		gridAutoColumns: "minmax(0, 1fr)",
		height: "100%",
		alignItems: "center",
		gap: K.spacingHorizontalXS,
		minWidth: 0
	},
	hourColumn: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: K.spacingVerticalXS,
		minWidth: 0
	},
	hourlyRows: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		gap: K.spacingVerticalXS,
		height: "100%",
		minWidth: 0
	},
	hourRow: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalS,
		minHeight: "40px",
		minWidth: 0
	},
	hourSpacer: {
		flex: 1,
		minWidth: 0
	},
	hourRowTime: {
		color: K.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	dailyColumns: {
		display: "grid",
		gridAutoFlow: "column",
		gridAutoColumns: "minmax(0, 1fr)",
		gap: K.spacingHorizontalS,
		height: "100%",
		alignItems: "center",
		minWidth: 0
	},
	dayColumn: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: K.spacingVerticalXS,
		minWidth: 0
	},
	muted: {
		color: K.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	temp: {
		color: K.colorNeutralForeground1,
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	high: {
		color: K.colorNeutralForeground1,
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	low: {
		color: K.colorNeutralForeground3,
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	ring: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: K.spacingVerticalXS,
		minWidth: 0
	},
	ringGraphic: {
		position: "relative",
		display: "grid",
		placeItems: "center",
		flexShrink: 0
	},
	ringSvg: {
		position: "absolute",
		inset: 0,
		width: "100%",
		height: "100%",
		transform: "rotate(-90deg)"
	},
	ringCenter: {
		position: "relative",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center"
	},
	aqiValue: {
		color: K.colorNeutralForeground1,
		fontVariantNumeric: "tabular-nums"
	},
	aqiLabel: {
		color: K.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	aqiCategory: {
		whiteSpace: "nowrap",
		color: K.colorNeutralForeground2
	}
});
function qx({ items: e, unit: t, scheme: n, sunrise: r, sunset: i, count: a = 6 }) {
	let o = Kx(), s = (e || []).slice(0, a);
	return /* @__PURE__ */ (0, F.jsx)("div", {
		className: o.hourlyStrip,
		children: s.map((e, a) => /* @__PURE__ */ (0, F.jsxs)("div", {
			className: o.hourColumn,
			children: [
				/* @__PURE__ */ (0, F.jsx)($, {
					size: 200,
					className: o.muted,
					children: a === 0 ? "现在" : lx(e.fxTime)
				}),
				/* @__PURE__ */ (0, F.jsx)(Vx, {
					code: e.icon,
					night: Zx(e.fxTime, r, i),
					scheme: n,
					size: 20,
					title: e.text
				}),
				/* @__PURE__ */ (0, F.jsx)($, {
					size: 300,
					weight: "semibold",
					className: o.temp,
					children: _x(e.temp, t)
				})
			]
		}, e.fxTime || a))
	});
}
function Jx({ items: e, unit: t, scheme: n, sunrise: r, sunset: i, count: a = 6 }) {
	let o = Kx(), s = (e || []).slice(0, a);
	return /* @__PURE__ */ (0, F.jsx)("div", {
		className: o.hourlyRows,
		children: s.map((e, a) => /* @__PURE__ */ (0, F.jsxs)("div", {
			className: o.hourRow,
			children: [
				/* @__PURE__ */ (0, F.jsx)($, {
					size: 200,
					className: o.hourRowTime,
					children: a === 0 ? "现在" : lx(e.fxTime)
				}),
				/* @__PURE__ */ (0, F.jsx)(Vx, {
					code: e.icon,
					night: Zx(e.fxTime, r, i),
					scheme: n,
					size: 20,
					title: e.text
				}),
				/* @__PURE__ */ (0, F.jsx)("span", { className: o.hourSpacer }),
				/* @__PURE__ */ (0, F.jsx)($, {
					size: 400,
					weight: "semibold",
					className: o.temp,
					children: _x(e.temp, t)
				})
			]
		}, e.fxTime || a))
	});
}
function Yx({ items: e, unit: t, scheme: n }) {
	let r = Kx(), i = (e || []).slice(0, 7);
	return /* @__PURE__ */ (0, F.jsx)("div", {
		className: r.dailyColumns,
		children: i.map((e, i) => /* @__PURE__ */ (0, F.jsxs)("div", {
			className: r.dayColumn,
			children: [
				/* @__PURE__ */ (0, F.jsx)($, {
					size: 200,
					className: r.muted,
					children: ux(e.fxDate, i)
				}),
				/* @__PURE__ */ (0, F.jsx)(Vx, {
					code: e.icon,
					scheme: n,
					size: 20,
					title: e.text
				}),
				/* @__PURE__ */ (0, F.jsx)($, {
					size: 400,
					weight: "semibold",
					className: r.high,
					children: _x(e.tempMax, t)
				}),
				/* @__PURE__ */ (0, F.jsx)($, {
					size: 200,
					className: r.low,
					children: _x(e.tempMin, t)
				})
			]
		}, e.fxDate || i))
	});
}
function Xx({ air: e, size: t = 88, className: n }) {
	let r = Kx();
	if (!e || e.aqi == null) return null;
	let i = Number(e.aqi), a = 2 * Math.PI * 44, o = a * Math.max(.02, Math.min(1, i / 300)), s = e.color || K.colorBrandForeground1;
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: A(r.ring, n),
		children: [/* @__PURE__ */ (0, F.jsxs)("div", {
			className: r.ringGraphic,
			style: {
				width: `${t}px`,
				height: `${t}px`
			},
			children: [/* @__PURE__ */ (0, F.jsxs)("svg", {
				className: r.ringSvg,
				viewBox: "0 0 100 100",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, F.jsx)("circle", {
					cx: "50",
					cy: "50",
					r: 44,
					fill: "none",
					stroke: K.colorNeutralStroke2,
					strokeWidth: "8"
				}), /* @__PURE__ */ (0, F.jsx)("circle", {
					cx: "50",
					cy: "50",
					r: 44,
					fill: "none",
					stroke: s,
					strokeWidth: "8",
					strokeLinecap: "round",
					strokeDasharray: `${o} ${a}`
				})]
			}), /* @__PURE__ */ (0, F.jsxs)("div", {
				className: r.ringCenter,
				children: [/* @__PURE__ */ (0, F.jsx)($, {
					size: 600,
					weight: "semibold",
					className: r.aqiValue,
					children: e.aqiDisplay || i
				}), /* @__PURE__ */ (0, F.jsx)($, {
					size: 200,
					className: r.aqiLabel,
					children: "AQI"
				})]
			})]
		}), /* @__PURE__ */ (0, F.jsx)($, {
			size: 300,
			weight: "semibold",
			className: r.aqiCategory,
			children: e.category || "—"
		})]
	});
}
function Zx(e, t, n) {
	if (!e) return !1;
	if (t && n) {
		let r = new Date(e).getTime(), i = new Date(t).getTime(), a = new Date(n).getTime();
		if (Number.isFinite(r) && Number.isFinite(i) && Number.isFinite(a)) return r < i || r >= a;
	}
	let r = new Date(e);
	if (Number.isNaN(r.getTime())) return !1;
	let i = r.getHours();
	return i < 6 || i >= 19;
}
//#endregion
//#region public/plugins/weather/src/components/Card.jsx
var Qx = Kn({
	pad1: { padding: K.spacingHorizontalS },
	pad21: { padding: `${K.spacingVerticalS} ${K.spacingHorizontalM}` },
	pad22: { padding: K.spacingVerticalM },
	padLarge: { padding: `${K.spacingVerticalM} ${K.spacingHorizontalL}` },
	body: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		minHeight: 0,
		minWidth: 0
	},
	body1: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: K.spacingVerticalXS,
		minHeight: 0,
		minWidth: 0
	},
	body21: {
		flex: 1,
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: K.spacingHorizontalM,
		minHeight: 0,
		minWidth: 0
	},
	left21: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalM,
		minWidth: 0
	},
	right21: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-end",
		justifyContent: "center",
		gap: K.spacingVerticalXS,
		minWidth: 0,
		flexShrink: 0
	},
	body22: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalS,
		minHeight: 0,
		minWidth: 0
	},
	top22: {
		flexBasis: "55%",
		flexGrow: 0,
		flexShrink: 0,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		gap: K.spacingVerticalXS,
		minHeight: 0,
		minWidth: 0
	},
	top22Row: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalS,
		minHeight: 0,
		minWidth: 0
	},
	meta22: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalXS,
		minWidth: 0,
		flexShrink: 1
	},
	hourly22: {
		flex: 1,
		minHeight: 0,
		minWidth: 0,
		paddingTop: K.spacingVerticalXS
	},
	body32: {
		flex: 1,
		display: "flex",
		flexDirection: "row",
		gap: K.spacingHorizontalL,
		minHeight: 0,
		minWidth: 0
	},
	current32: {
		flex: "46 1 0",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		gap: K.spacingVerticalXS,
		minWidth: 0
	},
	hourly32: {
		flex: "54 1 0",
		minWidth: 0,
		minHeight: 0
	},
	body42: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalL,
		minHeight: 0,
		minWidth: 0
	},
	top42: {
		flex: 1,
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: K.spacingHorizontalL,
		minHeight: 0,
		minWidth: 0
	},
	current42: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		gap: K.spacingVerticalXS,
		minWidth: 0,
		minHeight: 0
	},
	current42Row: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalM,
		minWidth: 0
	},
	meta42: {
		display: "flex",
		alignItems: "baseline",
		gap: K.spacingHorizontalM,
		minWidth: 0
	},
	air42: {
		flexShrink: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		minWidth: 0
	},
	daily42: {
		flex: "0 0 96px",
		minHeight: 0,
		minWidth: 0
	},
	cityRow: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalS,
		minWidth: 0
	},
	cityName: {
		color: K.colorNeutralForeground3,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		minWidth: 0
	},
	offline: {
		color: K.colorStatusWarningForeground1,
		whiteSpace: "nowrap",
		flexShrink: 0
	},
	state: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: K.spacingVerticalS,
		textAlign: "center",
		minHeight: 0,
		minWidth: 0
	},
	stateText: {
		color: K.colorNeutralForeground3,
		maxWidth: "30ch"
	},
	stateTitle: { color: K.colorNeutralForeground2 },
	stateIcon: { color: K.colorNeutralForeground3 },
	stateInline: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalS,
		color: K.colorNeutralForeground3
	}
});
function $x({ compact: e }) {
	let t = Qx();
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: t.state,
		children: [/* @__PURE__ */ (0, F.jsx)(Iu, { className: t.stateIcon }), e ? /* @__PURE__ */ (0, F.jsx)($, {
			size: 200,
			className: t.stateText,
			children: "配置 Key"
		}) : /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsx)($, {
			size: 400,
			weight: "semibold",
			className: t.stateTitle,
			children: "未配置和风天气 API Key"
		}), /* @__PURE__ */ (0, F.jsx)($, {
			size: 200,
			className: t.stateText,
			children: "在设置 → 插件 → 天气里填写 API Key 与 API Host"
		})] })]
	});
}
function eS({ compact: e, locating: t }) {
	let n = Qx();
	return t ? /* @__PURE__ */ (0, F.jsx)("div", {
		className: n.state,
		children: /* @__PURE__ */ (0, F.jsxs)("div", {
			className: n.stateInline,
			children: [/* @__PURE__ */ (0, F.jsx)(fv, { size: "tiny" }), /* @__PURE__ */ (0, F.jsx)($, {
				size: 200,
				children: "正在定位…"
			})]
		})
	}) : /* @__PURE__ */ (0, F.jsxs)("div", {
		className: n.state,
		children: [
			/* @__PURE__ */ (0, F.jsx)(Nu, { className: n.stateIcon }),
			/* @__PURE__ */ (0, F.jsx)($, {
				size: e ? 200 : 400,
				weight: "semibold",
				className: n.stateTitle,
				children: e ? "添加城市" : "还没有城市"
			}),
			e ? null : /* @__PURE__ */ (0, F.jsx)($, {
				size: 200,
				className: n.stateText,
				children: "打开详情搜索并添加城市"
			})
		]
	});
}
function tS({ compact: e }) {
	let t = Qx();
	return /* @__PURE__ */ (0, F.jsx)("div", {
		className: t.state,
		children: /* @__PURE__ */ (0, F.jsxs)("div", {
			className: t.stateInline,
			children: [/* @__PURE__ */ (0, F.jsx)(fv, { size: "tiny" }), /* @__PURE__ */ (0, F.jsx)($, {
				size: 200,
				children: e ? "加载中" : "正在获取天气…"
			})]
		})
	});
}
function nS({ compact: e }) {
	let t = Qx();
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: t.state,
		children: [/* @__PURE__ */ (0, F.jsx)($, {
			size: e ? 200 : 400,
			weight: "semibold",
			className: t.stateTitle,
			children: e ? "暂无数据" : "天气数据暂不可用"
		}), e ? null : /* @__PURE__ */ (0, F.jsx)($, {
			size: 200,
			className: t.stateText,
			children: "打开详情可重试；已缓存的数据会继续显示"
		})]
	});
}
function rS({ sizeKey: e, scheme: t, settings: n, place: r, data: i, status: a, locating: o, onOpenDetail: s }) {
	let c = Qx(), l = e || "3x2", u = l === "1x1", d = l === "3x2" || l === "4x2", f = i?.current || null, p = i?.daily?.[0] || null, m = f ? Zx(f.obsTime || (/* @__PURE__ */ new Date()).toISOString(), p?.sunrise, p?.sunset) : !1, h = n.showWarnings && i?.warnings || [], g = n.showAir ? i?.air : null, _ = !!(a.offline && i), v = null;
	v = !n.apiKey && !n.mock ? /* @__PURE__ */ (0, F.jsx)($x, { compact: u }) : r ? f ? /* @__PURE__ */ (0, F.jsxs)("div", {
		className: A(c.body),
		children: [
			l === "1x1" ? /* @__PURE__ */ (0, F.jsxs)("div", {
				className: c.body1,
				children: [/* @__PURE__ */ (0, F.jsx)(Vx, {
					code: f.icon,
					night: m,
					scheme: t,
					size: 40,
					title: f.text
				}), /* @__PURE__ */ (0, F.jsx)(Mb, {
					value: _x(f.temp, n.unit),
					size: 48
				})]
			}) : null,
			l === "2x1" ? /* @__PURE__ */ (0, F.jsxs)("div", {
				className: c.body21,
				children: [/* @__PURE__ */ (0, F.jsxs)("div", {
					className: c.left21,
					children: [/* @__PURE__ */ (0, F.jsx)(Vx, {
						code: f.icon,
						night: m,
						scheme: t,
						size: 48,
						title: f.text
					}), /* @__PURE__ */ (0, F.jsx)(Mb, {
						value: _x(f.temp, n.unit),
						size: 48
					})]
				}), /* @__PURE__ */ (0, F.jsxs)("div", {
					className: c.right21,
					children: [/* @__PURE__ */ (0, F.jsx)(Hx, {
						code: f.icon,
						text: f.text
					}), /* @__PURE__ */ (0, F.jsx)(Ux, {
						max: p?.tempMax,
						min: p?.tempMin,
						unit: n.unit,
						size: 300
					})]
				})]
			}) : null,
			l === "2x2" ? /* @__PURE__ */ (0, F.jsxs)("div", {
				className: c.body22,
				children: [/* @__PURE__ */ (0, F.jsxs)("div", {
					className: c.top22,
					children: [/* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: c.cityName,
						children: r.name
					}), /* @__PURE__ */ (0, F.jsxs)("div", {
						className: c.top22Row,
						children: [
							/* @__PURE__ */ (0, F.jsx)(Vx, {
								code: f.icon,
								night: m,
								scheme: t,
								size: 48,
								title: f.text
							}),
							/* @__PURE__ */ (0, F.jsx)(Mb, {
								value: _x(f.temp, n.unit),
								size: 48
							}),
							/* @__PURE__ */ (0, F.jsxs)("div", {
								className: c.meta22,
								children: [/* @__PURE__ */ (0, F.jsx)(Hx, {
									code: f.icon,
									text: f.text
								}), /* @__PURE__ */ (0, F.jsx)(Ux, {
									max: p?.tempMax,
									min: p?.tempMin,
									unit: n.unit,
									size: 300
								})]
							})
						]
					})]
				}), /* @__PURE__ */ (0, F.jsx)("div", {
					className: c.hourly22,
					children: /* @__PURE__ */ (0, F.jsx)(qx, {
						items: i.hourly,
						unit: n.unit,
						scheme: t,
						sunrise: p?.sunrise,
						sunset: p?.sunset,
						count: 6
					})
				})]
			}) : null,
			l === "3x2" ? /* @__PURE__ */ (0, F.jsxs)("div", {
				className: c.body32,
				children: [/* @__PURE__ */ (0, F.jsxs)("div", {
					className: c.current32,
					children: [
						/* @__PURE__ */ (0, F.jsxs)("div", {
							className: c.cityRow,
							children: [
								/* @__PURE__ */ (0, F.jsx)($, {
									size: 200,
									className: c.cityName,
									children: r.name
								}),
								/* @__PURE__ */ (0, F.jsx)(Gx, { count: h.length }),
								_ ? /* @__PURE__ */ (0, F.jsx)($, {
									size: 200,
									className: c.offline,
									children: "离线"
								}) : null
							]
						}),
						/* @__PURE__ */ (0, F.jsxs)("div", {
							className: c.cityRow,
							children: [/* @__PURE__ */ (0, F.jsx)(Vx, {
								code: f.icon,
								night: m,
								scheme: t,
								size: 56,
								title: f.text
							}), /* @__PURE__ */ (0, F.jsx)(Mb, {
								value: _x(f.temp, n.unit),
								size: 68
							})]
						}),
						/* @__PURE__ */ (0, F.jsx)(Hx, {
							code: f.icon,
							text: f.text,
							size: 300
						}),
						/* @__PURE__ */ (0, F.jsx)(Ux, {
							max: p?.tempMax,
							min: p?.tempMin,
							unit: n.unit,
							size: 300
						})
					]
				}), /* @__PURE__ */ (0, F.jsx)("div", {
					className: c.hourly32,
					children: /* @__PURE__ */ (0, F.jsx)(Jx, {
						items: i.hourly,
						unit: n.unit,
						scheme: t,
						sunrise: p?.sunrise,
						sunset: p?.sunset,
						count: 6
					})
				})]
			}) : null,
			l === "4x2" ? /* @__PURE__ */ (0, F.jsxs)("div", {
				className: c.body42,
				children: [/* @__PURE__ */ (0, F.jsxs)("div", {
					className: c.top42,
					children: [/* @__PURE__ */ (0, F.jsxs)("div", {
						className: c.current42,
						children: [
							/* @__PURE__ */ (0, F.jsxs)("div", {
								className: c.cityRow,
								children: [
									/* @__PURE__ */ (0, F.jsx)($, {
										size: 200,
										className: c.cityName,
										children: r.name
									}),
									/* @__PURE__ */ (0, F.jsx)(Gx, { count: h.length }),
									_ ? /* @__PURE__ */ (0, F.jsx)($, {
										size: 200,
										className: c.offline,
										children: "离线"
									}) : null
								]
							}),
							/* @__PURE__ */ (0, F.jsxs)("div", {
								className: c.current42Row,
								children: [/* @__PURE__ */ (0, F.jsx)(Vx, {
									code: f.icon,
									night: m,
									scheme: t,
									size: 56,
									title: f.text
								}), /* @__PURE__ */ (0, F.jsx)(Mb, {
									value: _x(f.temp, n.unit),
									size: 68
								})]
							}),
							/* @__PURE__ */ (0, F.jsxs)("div", {
								className: c.meta42,
								children: [/* @__PURE__ */ (0, F.jsx)(Hx, {
									code: f.icon,
									text: f.text,
									size: 300
								}), /* @__PURE__ */ (0, F.jsx)(Ux, {
									max: p?.tempMax,
									min: p?.tempMin,
									unit: n.unit,
									size: 300
								})]
							})
						]
					}), g && g.aqi != null ? /* @__PURE__ */ (0, F.jsx)("div", {
						className: c.air42,
						children: /* @__PURE__ */ (0, F.jsx)(Xx, {
							air: g,
							size: 72
						})
					}) : null]
				}), /* @__PURE__ */ (0, F.jsx)("div", {
					className: c.daily42,
					children: /* @__PURE__ */ (0, F.jsx)(Yx, {
						items: i.daily,
						unit: n.unit,
						scheme: t
					})
				})]
			}) : null
		]
	}) : a.loading || !a.error ? /* @__PURE__ */ (0, F.jsx)(tS, { compact: u }) : /* @__PURE__ */ (0, F.jsx)(nS, { compact: u }) : /* @__PURE__ */ (0, F.jsx)(eS, {
		compact: u,
		locating: o
	});
	let y = !n.apiKey && !n.mock ? "天气：尚未配置和风天气 API Key，点击打开详情" : r ? f ? `天气：${r.name}，${_x(f.temp, n.unit)}，${ax(f.icon, f.text)}${h.length > 0 ? `，${h.length} 条天气预警` : ""}，点击打开详情` : "天气：正在加载，点击打开详情" : `天气：还没有城市${o ? "，正在定位" : ""}，点击打开详情`;
	return /* @__PURE__ */ (0, F.jsx)(kb, {
		ariaLabel: y,
		onActivate: s,
		"data-size": l,
		className: A(u && c.pad1, l === "2x1" && c.pad21, l === "2x2" && c.pad22, d && c.padLarge),
		children: v
	});
}
//#endregion
//#region public/plugins/weather/src/data/store.js
var iS = "settings", aS = "places", oS = "cache", sS = "location", cS = {
	unit: "c",
	refreshMin: 30,
	autoLocate: !1,
	showAir: !0,
	showWarnings: !0,
	showMinutely: !1,
	apiKey: "",
	apiHost: ""
}, lS = [
	15,
	30,
	60
], uS = "Asia/Shanghai";
function dS(e) {
	let t = e && typeof e == "object" && !Array.isArray(e) ? e : {}, n = Number(t.refreshMin);
	return {
		unit: t.unit === "f" ? "f" : "c",
		refreshMin: lS.includes(n) ? n : cS.refreshMin,
		autoLocate: t.autoLocate === !0,
		showAir: t.showAir !== !1,
		showWarnings: t.showWarnings !== !1,
		showMinutely: t.showMinutely === !0,
		apiKey: typeof t.apiKey == "string" ? t.apiKey.trim() : "",
		apiHost: typeof t.apiHost == "string" ? t.apiHost.trim() : ""
	};
}
function fS(e) {
	if (!e || typeof e != "object") return null;
	let t = String(e.id || "").trim(), n = String(e.name || "").trim();
	if (!t || !n) return null;
	let r = Number(e.lat), i = Number(e.lon);
	return {
		id: t,
		name: n,
		adm1: e.adm1 || "",
		adm2: e.adm2 || "",
		country: e.country || "",
		tz: e.tz || uS,
		lat: Number.isFinite(r) ? r : 0,
		lon: Number.isFinite(i) ? i : 0,
		isCurrent: e.isCurrent === !0
	};
}
function pS(e) {
	if (!Array.isArray(e)) return [];
	let t = e.map(fS).filter(Boolean), n = !1;
	for (let e of t) e.isCurrent && !n ? n = !0 : e.isCurrent &&= !1;
	return t.length > 0 && !n && (t[0].isCurrent = !0), t;
}
function mS(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return {};
	let t = {};
	for (let [n, r] of Object.entries(e)) r && typeof r == "object" && !Array.isArray(r) && (t[n] = r);
	return t;
}
function hS(e) {
	if (!e || typeof e != "object") return null;
	let t = fS(e.place);
	if (!t) return null;
	let n = Number(e.at);
	return {
		place: t,
		source: typeof e.source == "string" ? e.source : "",
		at: Number.isFinite(n) ? n : 0
	};
}
function gS(e) {
	return !Array.isArray(e) || e.length === 0 ? null : e.find((e) => e.isCurrent) || e[0];
}
function _S(e, t) {
	return !Array.isArray(e) || !t ? null : e.find((e) => e.id === String(t)) || null;
}
var vS = (e) => String(e || "").replace(/省$|市$|自治区$|特别行政区$/, "");
function yS(e) {
	if (!e) return "";
	let t = vS(e.name) || e.name, n = [vS(e.adm2), vS(e.adm1)].filter((e) => e && e !== t && !t.includes(e));
	return n.length > 0 ? `${e.name} ${n[0]}` : e.name;
}
function bS(e, t) {
	let n = String(t || "");
	return (e || []).map((e) => ({
		...e,
		isCurrent: e.id === n
	}));
}
function xS(e, t) {
	let n = fS(t);
	if (!n) return e || [];
	let r = _S(e, n.id);
	return r ? bS(e, r.id) : [...(e || []).map((e) => ({
		...e,
		isCurrent: !1
	})), {
		...n,
		isCurrent: !0
	}];
}
function SS(e, t) {
	let n = String(t || ""), r = (e || []).filter((e) => e.id !== n);
	return r.length > 0 && !r.some((e) => e.isCurrent) && (r[0] = {
		...r[0],
		isCurrent: !0
	}), r;
}
async function CS(e) {
	let t = await e.getConfig(aS).catch(() => null);
	if (Array.isArray(t) && t.length > 0) return null;
	let n = await e.getConfig(iS).catch(() => null);
	if (!n || typeof n != "object" || Array.isArray(n)) return null;
	let r = pS(n.places), i = "places" in n || "mock" in n;
	return r.length > 0 ? (await e.setConfig(aS, r).catch(() => {}), i && await e.setConfig(iS, dS(n)).catch(() => {}), r) : (i && await e.setConfig(iS, dS(n)).catch(() => {}), null);
}
//#endregion
//#region public/plugins/weather/src/data/api.js
var wS = /* @__PURE__ */ new Set([
	"devapi.qweather.com",
	"api.qweather.com",
	"geoapi.qweather.com"
]), TS = 12e3, ES = class extends Error {
	constructor(e, { status: t = 0, code: n = "" } = {}) {
		super(e), this.name = "WeatherApiError", this.status = t, this.code = n;
	}
};
function DS(e) {
	return !!(e && String(e.apiKey || "").trim());
}
function OS(e) {
	let t = String(e?.apiHost || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, ""), n = t || "devapi.qweather.com", r = wS.has(n.toLowerCase());
	return {
		host: n,
		configured: !!t,
		legacy: r,
		baseUrl: `https://${n}`,
		geoBaseUrl: r ? "https://geoapi.qweather.com" : `https://${n}`,
		geoPath: r ? "/v2/city/lookup" : "/geo/v2/city/lookup"
	};
}
function kS(e) {
	return /^eyJ[\w-]*\.[\w-]+\.[\w-]+$/.test(e);
}
function AS(e) {
	let t = String(e?.apiKey || "").trim();
	if (!t) throw new ES("未配置和风天气 API Key", {
		status: 401,
		code: "NO_KEY"
	});
	return kS(t) ? { Authorization: `Bearer ${t}` } : { "X-QW-Api-Key": t };
}
var jS = {
	204: "该地区没有天气数据",
	400: "请求有误，请稍后再试",
	401: "天气服务认证失败，请检查 API Key",
	402: "今日请求次数已用完，请稍后再试",
	403: "天气服务暂时不可用，请检查帐号状态",
	404: "没有找到天气数据",
	429: "请求过于频繁，请稍后再试",
	500: "天气服务暂时不可用，请稍后再试"
};
function MS(e, t) {
	switch (e) {
		case 400: return t ? `请求有误：${t}` : "请求有误，请稍后再试";
		case 401: return "天气服务认证失败，请检查 API Key";
		case 403: return "天气服务暂时不可用，请检查数据地址与帐号状态";
		case 404: return "没有找到天气数据，请确认数据地址";
		case 429: return "请求过于频繁，暂时显示已缓存的数据";
		default: return e >= 500 ? "天气服务暂时不可用，请稍后再试" : `请求失败（${e}），请稍后再试`;
	}
}
function NS(e, t, n) {
	let r = new URL(t, e);
	for (let [e, t] of Object.entries(n || {})) t != null && t !== "" && r.searchParams.set(e, String(t));
	return r.toString();
}
async function PS(e, t, n, r) {
	let i = AS(e);
	if (!OS(e).configured) throw new ES("还没有设置天气数据地址：请在天气设置里填写和风天气控制台提供的 API Host", {
		status: 401,
		code: "NO_HOST"
	});
	let a = new AbortController(), o = setTimeout(() => a.abort(), TS), s;
	try {
		s = await fetch(NS(t, n, r), {
			method: "GET",
			headers: {
				Accept: "application/json",
				...i
			},
			signal: a.signal,
			cache: "no-store"
		});
	} catch (e) {
		throw clearTimeout(o), e?.name === "AbortError" ? new ES("请求超时，暂时显示已缓存的数据", {
			status: 0,
			code: "TIMEOUT"
		}) : new ES("网络连接失败，暂时显示已缓存的数据", {
			status: 0,
			code: "NETWORK"
		});
	}
	clearTimeout(o);
	let c = null;
	try {
		c = await s.json();
	} catch {
		c = null;
	}
	if (!s.ok) {
		let e = c?.error?.type || "", t = c?.error?.detail || c?.error?.title || "", n = MS(s.status, t);
		throw e.includes("invalid-host") ? n = "天气数据地址无效：请在天气设置里检查 API Host" : e.includes("unauthorized") ? n = "天气服务认证失败，请检查 API Key" : (e.includes("no-credit") || e.includes("overdue")) && (n = "天气帐号额度不足，请在和风天气控制台检查"), new ES(n, {
			status: s.status,
			code: e || String(s.status)
		});
	}
	if (c && typeof c.code == "string" && c.code !== "200") {
		let e = Number(c.code) || 0;
		throw new ES(jS[c.code] || `和风天气返回错误码 ${c.code}`, {
			status: e,
			code: c.code
		});
	}
	return c;
}
function FS(e) {
	return (e?.location || []).map((e) => ({
		id: String(e.id),
		name: e.name || "",
		lat: Number(e.lat),
		lon: Number(e.lon),
		adm1: e.adm1 || "",
		adm2: e.adm2 || "",
		country: e.country || "",
		tz: e.tz || "Asia/Shanghai"
	}));
}
async function IS(e, t) {
	let { geoBaseUrl: n, geoPath: r } = OS(e), i = FS(await PS(e, n, r, {
		location: t,
		number: 10,
		lang: "zh"
	}));
	if (i.length === 0) throw new ES(`没有找到“${t}”对应的城市`, { code: "NO_LOCATION" });
	return i;
}
async function LS(e, t, n) {
	return IS(e, `${Number(n).toFixed(2)},${Number(t).toFixed(2)}`);
}
var RS = (e) => xx(e).replace(/风$/, "");
function zS(e) {
	return {
		obsTime: null,
		temp: e?.temperature?.value ?? null,
		feelsLike: e?.feelsLike?.value ?? null,
		icon: e?.condition?.code ?? "999",
		text: e?.condition?.text ?? "",
		humidity: e?.humidity == null ? null : Math.round(e.humidity * 100),
		windDir: RS(e?.wind?.direction?.compass) || "",
		windScale: e?.wind?.scale ?? null,
		windSpeed: e?.wind?.speed?.value ?? null,
		precip: e?.precipitation?.amount?.value ?? 0,
		pressure: e?.pressure?.value ?? null,
		vis: e?.visibility?.value ?? null,
		cloud: e?.cloudCover == null ? null : Math.round(e.cloudCover * 100),
		dew: e?.dewPoint?.value ?? null,
		uvIndex: e?.uvIndex ?? null
	};
}
function BS(e) {
	let t = e?.now || {};
	return {
		obsTime: t.obsTime || null,
		temp: Number(t.temp),
		feelsLike: Number(t.feelsLike),
		icon: t.icon || "999",
		text: t.text || "",
		humidity: Number(t.humidity),
		windDir: t.windDir || "",
		windScale: t.windScale == null ? null : Number(t.windScale),
		windSpeed: t.windSpeed == null ? null : Number(t.windSpeed),
		precip: Number(t.precip || 0),
		pressure: Number(t.pressure),
		vis: Number(t.vis),
		cloud: t.cloud == null ? null : Number(t.cloud),
		dew: t.dew == null ? null : Number(t.dew),
		uvIndex: t.uvIndex == null ? null : Number(t.uvIndex)
	};
}
function VS(e) {
	return (e?.hours || []).map((e) => ({
		fxTime: e.forecastTime,
		temp: e.temperature?.value ?? null,
		icon: e.condition?.code ?? "999",
		text: e.condition?.text ?? "",
		pop: e.precipitation?.probability == null ? null : Math.round(e.precipitation.probability * 100),
		precip: e.precipitation?.amount?.value ?? 0,
		humidity: e.humidity == null ? null : Math.round(e.humidity * 100),
		windDir: RS(e.wind?.direction?.compass) || "",
		windScale: e.wind?.scale ?? null,
		windSpeed: e.wind?.speed?.value ?? null,
		pressure: e.pressure?.value ?? null,
		uvIndex: e.uvIndex ?? null,
		cloud: e.cloudCover == null ? null : Math.round(e.cloudCover * 100)
	}));
}
function HS(e) {
	return (e?.hourly || []).map((e) => ({
		fxTime: e.fxTime,
		temp: Number(e.temp),
		icon: e.icon || "999",
		text: e.text || "",
		pop: e.pop == null ? null : Number(e.pop),
		precip: Number(e.precip || 0),
		humidity: e.humidity == null ? null : Number(e.humidity),
		windDir: e.windDir || "",
		windScale: e.windScale == null ? null : Number(e.windScale),
		windSpeed: e.windSpeed == null ? null : Number(e.windSpeed),
		pressure: e.pressure == null ? null : Number(e.pressure),
		uvIndex: e.uvIndex == null ? null : Number(e.uvIndex),
		cloud: e.cloud == null ? null : Number(e.cloud)
	}));
}
function US(e) {
	return (e?.days || []).map((e) => ({
		fxDate: fx(e.forecastStartTime),
		icon: e.daytime?.condition?.code ?? "999",
		text: e.daytime?.condition?.text ?? "",
		iconNight: e.nighttime?.condition?.code ?? null,
		textNight: e.nighttime?.condition?.text ?? "",
		tempMax: e.temperatureMax?.value ?? null,
		tempMin: e.temperatureMin?.value ?? null,
		sunrise: e.astro?.sunrise ?? null,
		sunset: e.astro?.sunset ?? null,
		windDir: RS(e.daytime?.wind?.direction?.compass) || "",
		windScale: e.daytime?.wind?.scale ?? null,
		pop: e.daytime?.precipitation?.probability == null ? null : Math.round(e.daytime.precipitation.probability * 100),
		uvIndex: e.uvIndexMax ?? null,
		humidity: e.daytime?.humidity == null ? null : Math.round(e.daytime.humidity * 100),
		precip: e.daytime?.precipitation?.amount?.value ?? 0,
		pressure: null
	}));
}
function WS(e) {
	return (e?.daily || []).map((e) => ({
		fxDate: fx(e.fxDate),
		icon: e.iconDay || "999",
		text: e.textDay || "",
		iconNight: e.iconNight || null,
		textNight: e.textNight || "",
		tempMax: Number(e.tempMax),
		tempMin: Number(e.tempMin),
		sunrise: e.sunrise || null,
		sunset: e.sunset || null,
		windDir: (e.windDirDay || "").replace(/风$/, ""),
		windScale: e.windScaleDay == null ? null : Number(e.windScaleDay),
		pop: e.pop == null ? null : Number(e.pop),
		uvIndex: e.uvIndex == null ? null : Number(e.uvIndex),
		humidity: e.humidity == null ? null : Number(e.humidity),
		precip: e.precip == null ? 0 : Number(e.precip),
		pressure: e.pressure == null ? null : Number(e.pressure)
	}));
}
function GS(e) {
	return {
		code: e?.code || "",
		name: e?.name || "",
		aqi: e?.aqi ?? null,
		aqiDisplay: e?.aqiDisplay ?? (e?.aqi == null ? "—" : String(e.aqi)),
		level: e?.level || "",
		category: kx(e?.category, e?.level),
		color: jx(e?.color) || Mx(e?.aqi),
		primary: e?.primaryPollutant?.name || ""
	};
}
function KS(e) {
	let t = (e?.indexes || []).map(GS);
	if (t.length === 0) throw new ES("该地区暂无空气质量数据", { code: "NO_DATA" });
	let n = t.find((e) => e.code === "cn-mee") || t.find((e) => e.code === "us-epa") || t[0], r = {};
	for (let t of e?.pollutants || []) r[t.code] = {
		value: t?.concentration?.value ?? null,
		unit: t?.concentration?.unit || "μg/m³",
		name: Nx[t.code] || t.name || t.code
	};
	let i = qS(e, t, n), a = e?.indexes?.find((e) => e.code === n.code) || e?.indexes?.[0];
	return {
		aqi: n.aqi,
		aqiDisplay: n.aqiDisplay,
		level: n.level,
		category: n.category,
		color: n.color,
		primary: n.primary,
		pollutants: r,
		pm2p5: r.pm2p5?.value ?? null,
		pm10: r.pm10?.value ?? null,
		no2: r.no2?.value ?? null,
		so2: r.so2?.value ?? null,
		co: r.co?.value ?? null,
		o3: r.o3?.value ?? null,
		health: i,
		indexes: t,
		aqiStandard: n.code,
		rawIndex: a
	};
}
function qS(e, t, n) {
	let r = e?.indexes?.find((e) => e.code === n.code), i = r?.health?.advice || {};
	return {
		effect: r?.health?.effect || "",
		general: i.generalPopulation || "",
		sensitive: i.sensitivePopulation || ""
	};
}
function JS(e) {
	let t = e?.now || {}, n = t.aqi == null ? null : Number(t.aqi), r = Mx(n);
	return {
		aqi: n,
		aqiDisplay: n == null ? "—" : String(n),
		level: t.level || "",
		category: t.category || "",
		color: r,
		primary: t.primary || "",
		pollutants: {
			pm2p5: {
				value: t.pm2p5 == null ? null : Number(t.pm2p5),
				unit: "μg/m³",
				name: "PM2.5"
			},
			pm10: {
				value: t.pm10 == null ? null : Number(t.pm10),
				unit: "μg/m³",
				name: "PM10"
			},
			no2: {
				value: t.no2 == null ? null : Number(t.no2),
				unit: "μg/m³",
				name: "NO₂"
			},
			so2: {
				value: t.so2 == null ? null : Number(t.so2),
				unit: "μg/m³",
				name: "SO₂"
			},
			co: {
				value: t.co == null ? null : Number(t.co),
				unit: "mg/m³",
				name: "CO"
			},
			o3: {
				value: t.o3 == null ? null : Number(t.o3),
				unit: "μg/m³",
				name: "O₃"
			}
		},
		pm2p5: t.pm2p5 == null ? null : Number(t.pm2p5),
		pm10: t.pm10 == null ? null : Number(t.pm10),
		no2: t.no2 == null ? null : Number(t.no2),
		so2: t.so2 == null ? null : Number(t.so2),
		co: t.co == null ? null : Number(t.co),
		o3: t.o3 == null ? null : Number(t.o3),
		health: null,
		indexes: [],
		aqiStandard: "cn-mee",
		pubTime: t.pubTime || null
	};
}
var YS = {
	white: "rgb(240, 240, 240)",
	gray: "rgb(120, 120, 120)",
	green: "rgb(0, 150, 90)",
	blue: "rgb(30, 80, 200)",
	yellow: "rgb(230, 180, 0)",
	amber: "rgb(230, 150, 0)",
	orange: "rgb(230, 100, 20)",
	red: "rgb(200, 40, 40)",
	purple: "rgb(140, 60, 160)",
	black: "rgb(30, 30, 30)"
};
function XS(e) {
	return (e?.alerts || []).map((e) => ({
		id: e.id || `${e.issuedTime}:${e.headline}`,
		title: e.headline || e.description || "天气预警",
		typeName: e.eventType?.name || "",
		severity: e.severity || "unknown",
		severityText: Ax[e.severity] || e.severity || "未知",
		colorCode: e.color?.code || "",
		color: jx(e.color) || YS[e.color?.code] || "rgb(200, 140, 0)",
		startTime: e.effectiveTime || e.onsetTime || e.issuedTime || null,
		endTime: e.expireTime || null,
		issuedTime: e.issuedTime || null,
		sender: e.senderName || "",
		text: e.description || e.criteria || "",
		guide: e.instruction || ""
	}));
}
var ZS = {
	白色: "rgb(240, 240, 240)",
	蓝色: "rgb(30, 80, 200)",
	黄色: "rgb(230, 180, 0)",
	橙色: "rgb(230, 100, 20)",
	红色: "rgb(200, 40, 40)",
	黑色: "rgb(30, 30, 30)"
};
function QS(e) {
	return (e?.warning || []).map((e) => ({
		id: e.id || `${e.pubTime}:${e.title}`,
		title: e.title || e.typeName || "天气预警",
		typeName: e.typeName || e.type || "",
		severity: String(e.severity || "").toLowerCase(),
		severityText: e.level || Ax[String(e.severity || "").toLowerCase()] || "未知",
		colorCode: e.severityColor || "",
		color: ZS[e.level] || "rgb(200, 140, 0)",
		startTime: e.startTime || null,
		endTime: e.endTime || null,
		issuedTime: e.pubTime || null,
		sender: e.sender || "",
		text: e.text || "",
		guide: ""
	}));
}
function $S(e) {
	return (e?.daily || []).map((e) => ({
		date: fx(e.date),
		type: e.type,
		name: e.name || `指数 ${e.type}`,
		level: e.level || "",
		category: e.category || "",
		text: e.text || ""
	}));
}
function eC(e) {
	let t = (e?.minutely || []).map((e) => ({
		time: e.fxTime,
		precip: Number(e.precip || 0),
		type: e.type || "rain"
	}));
	return t.length === 0 && !e?.summary ? null : {
		summary: e?.summary || "",
		items: t
	};
}
function tC(e) {
	return e?.id ? e.id : `${Number(e.lon).toFixed(2)},${Number(e.lat).toFixed(2)}`;
}
function nC(e) {
	return `${Number(e.lat).toFixed(2)}/${Number(e.lon).toFixed(2)}`;
}
async function rC(e, t) {
	let n = OS(e);
	return n.legacy ? BS(await PS(e, n.baseUrl, "/v7/weather/now", {
		location: tC(t),
		lang: "zh"
	})) : zS(await PS(e, n.baseUrl, `/weather/v1/current/${nC(t)}`, {
		localTime: "true",
		lang: "zh"
	}));
}
async function iC(e, t, n = 24) {
	let r = OS(e);
	return r.legacy ? HS(await PS(e, r.baseUrl, "/v7/weather/24h", {
		location: tC(t),
		lang: "zh"
	})) : VS(await PS(e, r.baseUrl, `/weather/v1/hourly/${nC(t)}`, {
		hours: n,
		localTime: "true",
		lang: "zh"
	}));
}
async function aC(e, t, n = 7) {
	let r = OS(e);
	return r.legacy ? WS(await PS(e, r.baseUrl, "/v7/weather/7d", {
		location: tC(t),
		lang: "zh"
	})) : US(await PS(e, r.baseUrl, `/weather/v1/daily/${nC(t)}`, {
		days: n,
		localTime: "true",
		lang: "zh"
	}));
}
async function oC(e, t) {
	let n = OS(e);
	if (!n.legacy) try {
		return KS(await PS(e, n.baseUrl, `/airquality/v1/current/${nC(t)}`, { lang: "zh" }));
	} catch (e) {
		if (!(e instanceof ES) || e.status === 401 || e.status === 429) throw e;
	}
	return JS(await PS(e, n.baseUrl, "/v7/air/now", {
		location: tC(t),
		lang: "zh"
	}));
}
async function sC(e, t) {
	let n = OS(e);
	if (!n.legacy) try {
		return XS(await PS(e, n.baseUrl, `/weatheralert/v1/current/${nC(t)}`, {
			localTime: "true",
			lang: "zh"
		}));
	} catch (e) {
		if (!(e instanceof ES) || e.status === 401 || e.status === 429) throw e;
	}
	return QS(await PS(e, n.baseUrl, "/v7/warning/now", {
		location: tC(t),
		lang: "zh"
	}));
}
async function cC(e, t) {
	return $S(await PS(e, OS(e).baseUrl, "/v7/indices/1d", {
		type: "0",
		location: tC(t),
		lang: "zh"
	}));
}
async function lC(e, t) {
	return eC(await PS(e, OS(e).baseUrl, "/v7/minutely/5m", {
		location: `${Number(t.lon).toFixed(2)},${Number(t.lat).toFixed(2)}`,
		lang: "zh"
	}));
}
//#endregion
//#region public/plugins/weather/src/data/mock.js
var uC = [
	{
		id: "101010100",
		name: "北京",
		adm1: "北京市",
		adm2: "北京",
		lat: 39.92,
		lon: 116.41,
		country: "中国",
		tz: "Asia/Shanghai"
	},
	{
		id: "101020100",
		name: "上海",
		adm1: "上海市",
		adm2: "上海",
		lat: 31.23,
		lon: 121.47,
		country: "中国",
		tz: "Asia/Shanghai"
	},
	{
		id: "101210101",
		name: "杭州",
		adm1: "浙江省",
		adm2: "杭州",
		lat: 30.29,
		lon: 120.16,
		country: "中国",
		tz: "Asia/Shanghai"
	},
	{
		id: "101280101",
		name: "广州",
		adm1: "广东省",
		adm2: "广州",
		lat: 23.13,
		lon: 113.26,
		country: "中国",
		tz: "Asia/Shanghai"
	},
	{
		id: "101280601",
		name: "深圳",
		adm1: "广东省",
		adm2: "深圳",
		lat: 22.55,
		lon: 114.06,
		country: "中国",
		tz: "Asia/Shanghai"
	},
	{
		id: "101270101",
		name: "成都",
		adm1: "四川省",
		adm2: "成都",
		lat: 30.67,
		lon: 104.07,
		country: "中国",
		tz: "Asia/Shanghai"
	}
], dC = {
	101010100: 23,
	101020100: 25,
	101210101: 24,
	101280101: 29,
	101280601: 29,
	101270101: 20
};
function fC(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function pC(e) {
	let t = e >>> 0;
	return () => {
		t += 1831565813;
		let e = t;
		return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function mC(e) {
	return String(e).padStart(2, "0");
}
function hC(e) {
	let t = -e.getTimezoneOffset(), n = t >= 0 ? "+" : "-", r = Math.abs(t);
	return `${e.getFullYear()}-${mC(e.getMonth() + 1)}-${mC(e.getDate())}T${mC(e.getHours())}:${mC(e.getMinutes())}${n}${mC(Math.floor(r / 60))}:${mC(r % 60)}`;
}
function gC(e) {
	return `${e.getFullYear()}-${mC(e.getMonth() + 1)}-${mC(e.getDate())}`;
}
var _C = [
	{
		code: "100",
		text: "晴"
	},
	{
		code: "101",
		text: "多云"
	},
	{
		code: "103",
		text: "晴间多云"
	},
	{
		code: "102",
		text: "少云"
	},
	{
		code: "104",
		text: "阴"
	},
	{
		code: "305",
		text: "小雨"
	},
	{
		code: "300",
		text: "阵雨"
	},
	{
		code: "302",
		text: "雷阵雨"
	}
], vC = [
	{
		code: "150",
		text: "晴"
	},
	{
		code: "151",
		text: "多云"
	},
	{
		code: "153",
		text: "晴间多云"
	},
	{
		code: "152",
		text: "少云"
	}
];
function yC(e) {
	let t = String(e || "").trim().toLowerCase();
	return uC.filter((e) => !t || e.name.includes(t) || t.includes(e.name.toLowerCase()) || e.adm1.includes(t) || `${e.lat},${e.lon}`.includes(t)).map((e) => ({ ...e }));
}
function bC(e) {
	if (e.id !== "101010100") return [];
	let t = Date.now();
	return [{
		id: "mock-warning-wind",
		title: "北京市气象台发布大风蓝色预警信号",
		typeName: "大风",
		severity: "minor",
		severityText: "一般",
		colorCode: "blue",
		color: "rgb(30, 80, 200)",
		startTime: hC(/* @__PURE__ */ new Date(t - 24e5)),
		endTime: hC(new Date(t + 432e5)),
		text: "预计未来 12 小时内北京大部分地区将出现 6 级左右偏北风，阵风可达 7 到 8 级，请注意防范。",
		guide: "1. 关好门窗，加固围板、棚架、广告牌等易被风吹动的搭建物。\n2. 行人尽量少骑自行车，刮风时不要在广告牌、临时搭建物下面逗留。\n3. 相关水域水上作业和过往船舶采取积极的应对措施。"
	}, {
		id: "mock-warning-heat",
		title: "北京市气象台发布高温黄色预警信号",
		typeName: "高温",
		severity: "moderate",
		severityText: "较重",
		colorCode: "yellow",
		color: "rgb(230, 180, 0)",
		startTime: hC(/* @__PURE__ */ new Date(t - 18e6)),
		endTime: hC(new Date(t + 108e6)),
		text: "预计未来 3 天北京市最高气温将持续在 35℃ 以上，请注意防暑降温。",
		guide: "1. 尽量避免午后高温时段的户外活动。\n2. 注意补水，户外作业人员做好防晒措施。\n3. 注意防范用电高峰引发的火灾。"
	}];
}
function xC(e) {
	let t = 42 + Math.round(e() * 70), n = t <= 50 ? "优" : t <= 100 ? "良" : t <= 150 ? "轻度污染" : "中度污染", r = t <= 50 ? {
		red: 0,
		green: 228,
		blue: 0,
		alpha: 1
	} : t <= 100 ? {
		red: 255,
		green: 255,
		blue: 0,
		alpha: 1
	} : {
		red: 255,
		green: 126,
		blue: 0,
		alpha: 1
	}, i = Math.round(t * .55), a = Math.round(t * .8), o = 18 + Math.round(e() * 20), s = 3 + Math.round(e() * 5), c = .4, l = 40 + Math.round(e() * 60);
	return {
		aqi: t,
		aqiDisplay: String(t),
		level: t <= 50 ? "1" : t <= 100 ? "2" : t <= 150 ? "3" : "4",
		category: n,
		color: `rgb(${r.red}, ${r.green}, ${r.blue})`,
		primary: "PM2.5",
		pollutants: {
			pm2p5: {
				value: i,
				unit: "μg/m³",
				name: "PM2.5"
			},
			pm10: {
				value: a,
				unit: "μg/m³",
				name: "PM10"
			},
			no2: {
				value: o,
				unit: "μg/m³",
				name: "NO₂"
			},
			so2: {
				value: s,
				unit: "μg/m³",
				name: "SO₂"
			},
			co: {
				value: c,
				unit: "mg/m³",
				name: "CO"
			},
			o3: {
				value: l,
				unit: "μg/m³",
				name: "O₃"
			}
		},
		pm2p5: i,
		pm10: a,
		no2: o,
		so2: s,
		co: c,
		o3: l,
		health: {
			effect: t <= 100 ? "空气质量可接受，极少数敏感人群应减少户外活动。" : "易感人群症状有轻度加剧，健康人群出现刺激症状。",
			general: "可以正常进行户外活动。",
			sensitive: t <= 100 ? "极少数异常敏感人群应减少户外活动。" : "儿童、老年人及心脏病、呼吸系统疾病患者应减少长时间、高强度的户外锻炼。"
		},
		indexes: [{
			code: "cn-mee",
			name: "AQI (中国)",
			aqi: t,
			aqiDisplay: String(t),
			level: t <= 50 ? "1" : t <= 100 ? "2" : "3",
			category: n,
			color: `rgb(${r.red}, ${r.green}, ${r.blue})`,
			primary: "PM2.5"
		}, {
			code: "us-epa",
			name: "AQI (US)",
			aqi: Math.round(t * .7),
			aqiDisplay: String(Math.round(t * .7)),
			level: t <= 50 ? "1" : "2",
			category: t <= 50 ? "Good" : "Moderate",
			color: `rgb(${r.red}, ${r.green}, ${r.blue})`,
			primary: "PM2.5"
		}]
	};
}
function SC(e) {
	return [
		{
			type: "1",
			name: "运动指数",
			level: "2",
			category: "较适宜",
			text: "天气较好，但早晚温差较大，推荐进行室内运动，若户外运动请注意保暖。"
		},
		{
			type: "2",
			name: "洗车指数",
			level: "2",
			category: "较适宜",
			text: "未来一天无雨，风力较小，适合擦洗汽车。"
		},
		{
			type: "3",
			name: "穿衣指数",
			level: "4",
			category: "较舒适",
			text: "建议着薄外套、开衫牛仔衫裤等服装，年老体弱者应适当添加衣物。"
		},
		{
			type: "5",
			name: "紫外线指数",
			level: "3",
			category: "中等",
			text: "属中等强度紫外线辐射天气，外出时建议涂擦 SPF 高于 15、PA+ 的防晒护肤品。"
		},
		{
			type: "7",
			name: "花粉过敏指数",
			level: "2",
			category: "不易发",
			text: "天气条件较不易诱发过敏，可放心外出。"
		},
		{
			type: "8",
			name: "舒适度指数",
			level: "2",
			category: "较舒适",
			text: "白天天气晴好，早晚会感觉偏凉，午后舒适。"
		},
		{
			type: "9",
			name: "感冒指数",
			level: "2",
			category: "较易发",
			text: "昼夜温差较大，较易发生感冒，请适当增减衣物。"
		},
		{
			type: "14",
			name: "晾晒指数",
			level: "2",
			category: "适宜",
			text: "天气不错，适宜晾晒衣物。"
		}
	].map((e) => ({
		...e,
		date: gC(/* @__PURE__ */ new Date())
	}));
}
function CC() {
	let e = /* @__PURE__ */ new Date(), t = [], n = Math.floor(e.getTime() / 3e5) * 3e5;
	for (let e = 0; e < 24; e++) {
		let r = new Date(n + e * 3e5), i = Math.max(0, Math.sin((e - 3) / 24 * Math.PI * 2) * .6 + Math.sin(e / 3) * .15);
		t.push({
			time: hC(r),
			precip: Number(i.toFixed(2)),
			type: "rain"
		});
	}
	return {
		summary: "预计 18 分钟后开始下小雨，降雨将持续约 40 分钟",
		items: t
	};
}
function wC(e) {
	let t = pC(fC(`${e.id}:${gC(/* @__PURE__ */ new Date())}`)), n = /* @__PURE__ */ new Date(), r = dC[e.id] ?? 24, i = Math.floor(t() * _C.length), a = _C[i], o = n.getHours() < 6 || n.getHours() >= 19, s = {
		obsTime: hC(n),
		temp: r + Math.round((t() - .5) * 3),
		feelsLike: r + 1 + Math.round((t() - .5) * 3),
		icon: o ? vC[i % vC.length].code : a.code,
		text: a.text,
		humidity: 42 + Math.round(t() * 40),
		windDir: t() > .5 ? "东南风" : "北风",
		windScale: 1 + Math.round(t() * 3),
		windSpeed: 2 + Math.round(t() * 4),
		precip: 0,
		pressure: 1002 + Math.round(t() * 15),
		vis: 9e3 + Math.round(t() * 15e3),
		cloud: 10 + Math.round(t() * 60),
		dew: 10 + Math.round(t() * 10),
		uvIndex: o ? 0 : 1 + Math.round(t() * 5)
	}, c = [];
	for (let e = 0; e < 24; e++) {
		let i = new Date(n.getTime() + e * 36e5), a = i.getHours(), o = a < 6 || a >= 19, l = o ? vC[(Math.floor(t() * vC.length) + e) % vC.length] : _C[(e * 3 + Math.floor(t() * 3)) % _C.length], u = Math.sin((a - 9) / 24 * Math.PI * 2) * 4;
		c.push({
			fxTime: hC(i),
			temp: Math.round(r + u + (t() - .5) * 2),
			icon: l.code,
			text: l.text,
			pop: Math.round(t() * 30),
			precip: 0,
			humidity: 40 + Math.round(t() * 45),
			windDir: s.windDir,
			windScale: s.windScale,
			windSpeed: s.windSpeed,
			pressure: s.pressure,
			uvIndex: o ? 0 : 1 + Math.round(t() * 6),
			isNight: o
		});
	}
	let l = [];
	for (let e = 0; e < 7; e++) {
		let a = new Date(n.getTime() + e * 864e5), o = _C[(i + e * 2) % _C.length], c = vC[(i + e) % vC.length], u = r + 3 + Math.round(t() * 4), d = r - 8 + Math.round(t() * 3);
		l.push({
			fxDate: gC(a),
			icon: o.code,
			text: o.text,
			iconNight: c.code,
			textNight: c.text,
			tempMax: u,
			tempMin: d,
			sunrise: `${gC(a)}T05:${mC(20 + Math.round(t() * 15))}`,
			sunset: `${gC(a)}T18:${mC(10 + Math.round(t() * 20))}`,
			windDir: s.windDir,
			windScale: s.windScale,
			pop: Math.round(t() * 40),
			uvIndex: 2 + Math.round(t() * 5),
			humidity: 40 + Math.round(t() * 30),
			precip: 0,
			pressure: s.pressure
		});
	}
	return {
		fetchedAt: Date.now(),
		current: s,
		hourly: c,
		daily: l,
		air: xC(pC(fC(`${e.id}:air`))),
		warnings: bC(e),
		indices: SC(e),
		minutely: CC()
	};
}
//#endregion
//#region public/plugins/weather/src/data/locate.js
var TC = 18e5, EC = 8e3, DC = 2500, OC = 4e3, kC = 2500;
function AC(e) {
	return !!e?.mock || DS(e);
}
function jC(e, t = Date.now()) {
	return !e || !e.at ? !1 : t - e.at < TC;
}
async function MC(e, t) {
	let n = 0;
	try {
		let r = new Promise((e) => {
			n = setTimeout(() => e(null), Math.max(0, t));
		}), i = Promise.resolve().then(e).catch(() => null);
		return await Promise.race([i, r]);
	} finally {
		n && clearTimeout(n);
	}
}
function NC(e) {
	if (!e || typeof e != "object") return "";
	for (let t of [
		e.city,
		e.district,
		e.province
	]) if (typeof t == "string" && t.trim()) return t.trim();
	return "";
}
async function PC(t, { budgetMs: n = EC } = {}) {
	if (!AC(t)) return null;
	if (t.mock) return {
		place: { ...uC[0] },
		source: "mock"
	};
	let r = Date.now() + Math.max(1e3, n), i = (e) => Math.min(e, Math.max(0, r - Date.now())), a = await MC(() => e.getLocation(), i(DC));
	if (a && Number.isFinite(Number(a.lat)) && Number.isFinite(Number(a.lon))) {
		let e = await MC(() => LS(t, a.lat, a.lon), i(kC));
		if (e && e[0]) return {
			place: e[0],
			source: "system"
		};
	}
	if (i(1) <= 0) return null;
	let o = NC(await MC(() => e.ipLocate(), i(OC)));
	if (!o) return null;
	let s = await MC(() => IS(t, o), i(kC));
	return s && s[0] ? {
		place: s[0],
		source: "ip"
	} : null;
}
//#endregion
//#region public/plugins/weather/src/data/service.js
var FC = [
	"current",
	"hourly",
	"daily"
];
function IC(e) {
	return !!e?.mock;
}
function LC(e, t) {
	return t ? {
		...e,
		mock: !0
	} : e;
}
function RC(e) {
	return IC(e) || DS(e);
}
async function zC(e, t) {
	let n = String(t || "").trim();
	return n ? IC(e) ? yC(n) : IS(e, n) : [];
}
function BC(e) {
	let t = {
		current: (t) => rC(e, t),
		hourly: (t) => iC(e, t),
		daily: (t) => aC(e, t)
	};
	return e.showAir && (t.air = (t) => oC(e, t)), e.showWarnings && (t.warnings = (t) => sC(e, t)), t;
}
async function VC(e, t, n) {
	if (!t) throw new ES("还没有选择城市", { code: "NO_PLACE" });
	if (IC(e)) {
		let e = wC(t);
		return {
			data: e,
			offline: !1,
			failures: [],
			fetchedAt: e.fetchedAt
		};
	}
	if (!DS(e)) throw new ES("未配置和风天气 API Key：请在宿主「设置 → 插件 → 天气」填写 API Key 与 API Host", {
		status: 401,
		code: "NO_KEY"
	});
	let r = BC(e), i = Object.keys(r), a = await Promise.allSettled(i.map((e) => r[e](t))), o = { ...n || {} }, s = [], c = 0;
	a.forEach((e, t) => {
		let n = i[t];
		if (e.status === "fulfilled") o[n] = e.value, c += 1;
		else {
			let t = e.reason;
			s.push({
				section: n,
				message: t?.message || "请求失败",
				status: t?.status || 0,
				code: t?.code || ""
			});
		}
	});
	let l = s.some((e) => FC.includes(e.section)), u = o.current && o.hourly && o.daily;
	c > 0 && (o.fetchedAt = Date.now());
	let d = l || !u;
	if (d && !n) {
		let e = s.find((e) => FC.includes(e.section)) || s[0];
		throw new ES(e?.message || "天气数据加载失败", {
			status: e?.status || 0,
			code: e?.code || ""
		});
	}
	return {
		data: o,
		offline: d,
		failures: s,
		fetchedAt: o.fetchedAt,
		fromCache: l
	};
}
async function HC(e, t, n) {
	if (!t) throw new ES("还没有选择城市", { code: "NO_PLACE" });
	if (IC(e)) return wC(t)[n] ?? null;
	if (!DS(e)) throw new ES("未配置和风天气 API Key", {
		status: 401,
		code: "NO_KEY"
	});
	switch (n) {
		case "air": return oC(e, t);
		case "warnings": return sC(e, t);
		case "indices": return cC(e, t);
		case "minutely": return lC(e, t);
		default: return null;
	}
}
//#endregion
//#region public/plugins/weather/src/data/useWeather.js
function UC() {
	return {
		loading: !0,
		refreshing: !1,
		offline: !1,
		error: "",
		noKey: !1,
		failures: []
	};
}
function WC(e, t, n) {
	return JSON.stringify([
		n?.id || "",
		!!e.mock,
		e.apiKey,
		e.apiHost,
		e.showAir,
		e.showWarnings,
		e.showMinutely,
		e.refreshMin,
		t.map((e) => `${e.id}:${+!!e.isCurrent}`).join(",")
	]);
}
function GC({ mock: t = !1 } = {}) {
	let [n, r, i] = Qy(iS, cS, dS), [a, o, s] = Qy(aS, [], pS), [c, l, u] = Qy(oS, {}, mS), [d, f] = Qy(sS, null, hS), p = (0, P.useMemo)(() => t ? {
		...n,
		mock: !0
	} : n, [n, t]), m = a, h = gS(m), g = h && c[h.id] || null, [_, v] = (0, P.useState)(UC), [y, b] = (0, P.useState)(!1), [x, S] = (0, P.useState)({}), C = (0, P.useRef)(p), w = (0, P.useRef)(m), T = (0, P.useRef)(c), E = (0, P.useRef)(d), D = (0, P.useRef)(x), ee = (0, P.useRef)(0);
	(0, P.useEffect)(() => {
		C.current = p;
	}, [p]), (0, P.useEffect)(() => {
		w.current = m;
	}, [m]), (0, P.useEffect)(() => {
		T.current = c;
	}, [c]), (0, P.useEffect)(() => {
		E.current = d;
	}, [d]), (0, P.useEffect)(() => {
		D.current = x;
	}, [x]);
	let te = (0, P.useCallback)((e, t) => {
		let n = {
			...T.current,
			[e]: t
		};
		T.current = n, l(n);
	}, [l]), O = (0, P.useCallback)((e) => {
		let t = typeof e == "function" ? e(w.current) : e;
		w.current = t, o(t);
	}, [o]);
	(0, P.useEffect)(() => {
		if (!s) return;
		let t = !0;
		return CS(e).then((e) => {
			t && e && e.length !== 0 && o((t) => t.length > 0 ? t : e);
		}).catch(() => {}), () => {
			t = !1;
		};
	}, [s, o]);
	let k = (0, P.useCallback)(async ({ silent: e = !1 } = {}) => {
		let t = C.current, n = gS(w.current);
		if (!n) return v((e) => ({
			...e,
			loading: !1,
			refreshing: !1,
			noKey: !RC(t)
		})), null;
		if (!RC(t)) return v((e) => ({
			...e,
			loading: !1,
			refreshing: !1,
			noKey: !0,
			error: ""
		})), null;
		let r = ++ee.current, i = T.current[n.id] || null;
		v((t) => ({
			...t,
			loading: !e || !i,
			refreshing: !0,
			noKey: !1,
			error: ""
		}));
		try {
			let e = await VC(t, n, i);
			if (r !== ee.current) return null;
			let a = {
				...e.data,
				placeId: n.id
			};
			return te(n.id, a), v({
				loading: !1,
				refreshing: !1,
				offline: e.offline,
				error: "",
				noKey: !1,
				failures: e.failures || []
			}), a;
		} catch (e) {
			return r === ee.current && ((e?.code || "") === "NO_KEY" ? v((e) => ({
				...e,
				loading: !1,
				refreshing: !1,
				noKey: !0,
				error: ""
			})) : v((t) => ({
				...t,
				loading: !1,
				refreshing: !1,
				offline: !!i,
				error: e?.message || "天气数据加载失败"
			}))), null;
		}
	}, [te]);
	(0, P.useEffect)(() => {
		t && s && (w.current.length > 0 || O([{
			...uC[0],
			isCurrent: !0
		}]));
	}, [
		t,
		s,
		O
	]), (0, P.useEffect)(() => {
		if (!t || !s || E.current?.place?.id === uC[0].id) return;
		let e = {
			place: { ...uC[0] },
			source: "mock",
			at: Date.now()
		};
		E.current = e, f(e);
	}, [
		t,
		s,
		f
	]), (0, P.useEffect)(() => {
		if (t || !i || !s || !p.autoLocate || !AC(p) || jC(E.current)) return;
		let e = !1;
		return b(!0), PC(p).then((t) => {
			if (e || !t?.place) return;
			let n = {
				place: t.place,
				source: t.source,
				at: Date.now()
			};
			E.current = n, f(n), w.current.length === 0 && O([{
				...t.place,
				isCurrent: !0
			}]);
		}).finally(() => {
			e || b(!1);
		}), () => {
			e = !0;
		};
	}, [
		t,
		p.autoLocate,
		p.apiKey,
		p.apiHost,
		p.mock,
		i,
		s,
		f,
		O
	]);
	let ne = (0, P.useMemo)(() => WC(p, m, h), [
		p,
		m,
		h
	]);
	(0, P.useEffect)(() => {
		i && s && u && (h ? (v((e) => ({
			...e,
			loading: !T.current[h.id]
		})), k()) : v((e) => ({
			...e,
			loading: !1,
			refreshing: !1,
			noKey: !RC(C.current)
		})));
	}, [
		ne,
		i,
		s,
		u,
		h,
		k
	]), (0, P.useEffect)(() => {
		let e = Math.max(1, Number(p.refreshMin) || 30) * 60 * 1e3, t = window.setInterval(() => {
			document.visibilityState !== "hidden" && k({ silent: !0 });
		}, e), n = () => {
			document.visibilityState === "visible" && k({ silent: !0 });
		};
		return document.addEventListener("visibilitychange", n), () => {
			window.clearInterval(t), document.removeEventListener("visibilitychange", n);
		};
	}, [p.refreshMin, k]);
	let A = (0, P.useCallback)(async (e, { force: t = !1 } = {}) => {
		let n = C.current, r = gS(w.current);
		if (!e || !r || !RC(n)) return null;
		let i = D.current[e];
		if (!t && i?.loading || !t && i?.error) return null;
		let a = T.current[r.id]?.[e];
		if (!t && a != null) return a;
		S((t) => ({
			...t,
			[e]: {
				loading: !0,
				error: ""
			}
		}));
		try {
			let t = await HC(n, r, e), i = {
				...T.current[r.id] || {},
				[e]: t,
				placeId: r.id
			};
			return te(r.id, i), S((t) => ({
				...t,
				[e]: {
					loading: !1,
					error: ""
				}
			})), t;
		} catch (t) {
			return S((n) => ({
				...n,
				[e]: {
					loading: !1,
					error: t?.message || "请求失败"
				}
			})), null;
		}
	}, [te]), re = (0, P.useCallback)((e) => O(bS(w.current, e)), [O]), ie = (0, P.useCallback)((e) => O(xS(w.current, e)), [O]), ae = (0, P.useCallback)((e) => O(SS(w.current, e)), [O]);
	return {
		mock: t,
		settings: p,
		setSettings: r,
		settingsLoaded: i,
		places: m,
		place: h,
		data: g,
		status: _,
		sectionState: x,
		located: d?.place || null,
		locatedSource: d?.source || "",
		locating: y,
		refresh: k,
		ensureSection: A,
		updatePlaces: O,
		selectPlace: re,
		addPlace: ie,
		removePlace: ae,
		settingsRef: C,
		placesRef: w,
		cacheRef: T,
		putCache: te,
		setLocation: f,
		cacheLoaded: u,
		placesLoaded: s,
		configured: RC(p)
	};
}
//#endregion
//#region public/plugins/weather/src/data/tools.js
var KC = {
	type: "string",
	description: "城市名、和风 LocationID 或 \"current\"（默认当前城市）"
}, qC = [
	"unit",
	"refreshMin",
	"autoLocate",
	"showAir",
	"showWarnings",
	"showMinutely",
	"apiKey",
	"apiHost"
], JC = [
	{
		name: "weather.current",
		description: "获取指定城市的实时天气（温度、体感、天气现象、湿度、风、气压、能见度等）。不传 place 时用当前城市。",
		parameters: {
			type: "object",
			properties: { place: KC }
		}
	},
	{
		name: "weather.hourly",
		description: "获取指定城市未来逐小时天气预报，默认 12 小时，最多 24 小时。",
		parameters: {
			type: "object",
			properties: {
				place: KC,
				hours: {
					type: "number",
					description: "返回多少小时，默认 12，范围 1-24"
				}
			}
		}
	},
	{
		name: "weather.daily",
		description: "获取指定城市未来逐日天气预报，默认 7 天，最多 7 天。",
		parameters: {
			type: "object",
			properties: {
				place: KC,
				days: {
					type: "number",
					description: "返回多少天，默认 7，范围 1-7"
				}
			}
		}
	},
	{
		name: "weather.air",
		description: "获取指定城市的实时空气质量（AQI、等级、首要污染物、PM2.5 等浓度）。",
		parameters: {
			type: "object",
			properties: { place: KC }
		}
	},
	{
		name: "weather.warning",
		description: "获取指定城市当前生效的天气预警列表（标题、类型、严重程度、生效时间、防御指南）。",
		parameters: {
			type: "object",
			properties: { place: KC }
		}
	},
	{
		name: "weather.queryPlace",
		description: "查询任意地方（不必在用户城市列表里）的天气：先用 GeoAPI 按城市名搜索，再返回实时天气与今日最高/最低温。",
		parameters: {
			type: "object",
			properties: { city: {
				type: "string",
				description: "要查询的城市名，例如“杭州”或“Tokyo”"
			} },
			required: ["city"]
		}
	},
	{
		name: "weather.places",
		description: "列出用户天气卡片里保存的城市及当前城市。",
		parameters: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "weather.addPlace",
		description: "按城市名搜索并添加城市到天气卡片，添加后自动设为当前城市。",
		parameters: {
			type: "object",
			properties: { city: {
				type: "string",
				description: "城市名，例如“上海”"
			} },
			required: ["city"]
		}
	},
	{
		name: "weather.removePlace",
		description: "从天气卡片删除一个城市，参数是 LocationID。",
		parameters: {
			type: "object",
			properties: { id: {
				type: "string",
				description: "和风 LocationID，例如 101010100"
			} },
			required: ["id"]
		}
	},
	{
		name: "weather.setCurrentPlace",
		description: "把城市列表里已有的某个城市设为当前显示城市（不改变列表）。",
		parameters: {
			type: "object",
			properties: { id: {
				type: "string",
				description: "和风 LocationID"
			} },
			required: ["id"]
		}
	},
	{
		name: "weather.refresh",
		description: "立即刷新天气数据（默认当前城市），忽略缓存。",
		parameters: {
			type: "object",
			properties: { place: KC }
		}
	},
	{
		name: "weather.locate",
		description: "自动定位并返回定位城市：系统定位优先，失败用 ip.cn 网络归属地兜底，再由和风 GeoAPI 换成坐标。城市列表为空时自动加入并设为当前；已有城市时不自动切换。",
		parameters: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "weather.settings.get",
		description: "读取天气插件设置（温度单位、刷新间隔、显示项、自动定位、API Key 是否已配置）。",
		parameters: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "weather.settings.set",
		description: "修改天气插件设置。只传要改的字段：unit(c/f)、refreshMin(15/30/60)、autoLocate、showAir、showWarnings、showMinutely、apiKey、apiHost。",
		parameters: {
			type: "object",
			properties: {
				unit: {
					type: "string",
					enum: ["c", "f"],
					description: "温度单位"
				},
				refreshMin: {
					type: "number",
					enum: [
						15,
						30,
						60
					],
					description: "刷新间隔（分钟）"
				},
				autoLocate: {
					type: "boolean",
					description: "自动定位"
				},
				showAir: {
					type: "boolean",
					description: "显示空气质量"
				},
				showWarnings: {
					type: "boolean",
					description: "显示天气预警"
				},
				showMinutely: {
					type: "boolean",
					description: "显示分钟级降水"
				},
				apiKey: {
					type: "string",
					description: "和风天气 API Key"
				},
				apiHost: {
					type: "string",
					description: "和风天气 API Host"
				}
			}
		}
	}
], YC = 3e5;
function XC(e, t = 0) {
	if (e == null || Number.isNaN(Number(e))) return null;
	let n = 10 ** t;
	return Math.round(Number(e) * n) / n;
}
function ZC(e) {
	return {
		id: e.id,
		name: e.name,
		region: [e.adm2, e.adm1].filter(Boolean).join(" · ") || e.adm1 || "",
		lat: e.lat,
		lon: e.lon
	};
}
function QC(e) {
	return {
		unit: e.unit,
		refreshMin: e.refreshMin,
		autoLocate: e.autoLocate,
		showAir: e.showAir,
		showWarnings: e.showWarnings,
		showMinutely: e.showMinutely,
		apiHost: e.apiHost,
		hasApiKey: !!e.apiKey
	};
}
function $C(e, t, n) {
	let r = e || bx.none;
	return t == null ? n == null ? r : `${r}${Math.round(Number(n) * 3.6)}km/h` : `${r}${t}级`;
}
function ew(e, t) {
	let n = t.current || {};
	return {
		place: ZC(e),
		updated: vx(t.fetchedAt),
		current: {
			text: n.text || "",
			temperatureC: XC(n.temp, 1),
			feelsLikeC: XC(n.feelsLike, 1),
			humidityPercent: n.humidity,
			wind: $C(n.windDir, n.windScale, n.windSpeed),
			pressureHpa: XC(n.pressure),
			visibilityKm: n.vis == null ? null : XC(n.vis / 1e3, 1),
			precipitationMm: XC(n.precip, 1),
			uvIndex: n.uvIndex,
			observedAt: n.obsTime
		},
		today: t.daily?.[0] ? {
			text: t.daily[0].text,
			highC: XC(t.daily[0].tempMax, 1),
			lowC: XC(t.daily[0].tempMin, 1),
			precipitationProbabilityPercent: t.daily[0].pop,
			sunrise: t.daily[0].sunrise,
			sunset: t.daily[0].sunset
		} : null
	};
}
function tw(e) {
	if (!RC(e)) throw new ES("天气插件还没配置和风天气 API Key：请打开桌面「设置 → 插件 → 天气」填写 API Key 与 API Host。", {
		status: 401,
		code: "NO_KEY"
	});
}
async function nw(t) {
	let [n, r, i] = await Promise.all([
		e.getConfig(iS).catch(() => null),
		e.getConfig(aS).catch(() => null),
		e.getConfig(oS).catch(() => null)
	]), a = LC(dS(n), t.mock), o = pS(r);
	return o.length === 0 && n && typeof n == "object" && (o = pS(n.places)), {
		settings: a,
		places: o,
		cache: mS(i)
	};
}
async function rw(e, t) {
	let n = typeof t == "string" ? t.trim() : "";
	if (!n || n === "current" || n === "当前" || n === "当前城市") {
		let t = gS(e.places);
		if (!t) throw new ES("天气插件还没有任何城市", { code: "NO_PLACE" });
		return t;
	}
	let r = _S(e.places, n);
	if (r) return r;
	let i = e.places.find((e) => e.name === n || e.name.includes(n));
	if (i) return i;
	let a = await zC(e.settings, n);
	if (a.length === 0) throw new ES(`没有找到城市“${n}”`, { code: "NO_LOCATION" });
	return a[0];
}
async function iw(e, t, { force: n = !1 } = {}) {
	let r = await nw(e), i = r.cache[t.id] || null;
	if (!n && i && i.fetchedAt && Date.now() - i.fetchedAt < YC) return i;
	let a = {
		...(await VC(r.settings, t, i)).data,
		placeId: t.id
	};
	return e.weather.putCache(t.id, a), a;
}
function aw(e, t) {
	let n = _S(e.places, t);
	if (!n) throw new ES(`城市列表里没有 id 为 ${t} 的城市`, { code: "NO_PLACE" });
	return n;
}
function ow({ hadPlaces: e, alreadyCurrent: t }) {
	return e ? t ? "当前城市就是定位城市" : "已有城市，未自动切换；可在城市菜单一键切换" : "城市列表为空：定位城市已加入并设为当前城市";
}
function sw(e) {
	return {
		"weather.current": async (t = {}) => {
			let n = await rw(await nw(e), t.place);
			return ew(n, await iw(e, n));
		},
		"weather.hourly": async (t = {}) => {
			let n = await rw(await nw(e), t.place), r = await iw(e, n), i = Math.min(24, Math.max(1, Number(t.hours) || 12));
			return {
				place: ZC(n),
				hours: (r.hourly || []).slice(0, i).map((e) => ({
					time: e.fxTime,
					text: e.text,
					temperatureC: XC(e.temp, 1),
					precipitationProbabilityPercent: e.pop,
					wind: $C(e.windDir, e.windScale, e.windSpeed),
					humidityPercent: e.humidity,
					uvIndex: e.uvIndex
				}))
			};
		},
		"weather.daily": async (t = {}) => {
			let n = await rw(await nw(e), t.place), r = await iw(e, n), i = Math.min(7, Math.max(1, Number(t.days) || 7));
			return {
				place: ZC(n),
				days: (r.daily || []).slice(0, i).map((e) => ({
					date: e.fxDate,
					text: e.text,
					textNight: e.textNight,
					highC: XC(e.tempMax, 1),
					lowC: XC(e.tempMin, 1),
					precipitationProbabilityPercent: e.pop,
					uvIndex: e.uvIndex,
					sunrise: e.sunrise,
					sunset: e.sunset,
					wind: $C(e.windDir, e.windScale)
				}))
			};
		},
		"weather.air": async (t = {}) => {
			let n = await nw(e), r = await rw(n, t.place), i = await iw(e, r), a = i.air || await HC(n.settings, r, "air");
			return {
				place: ZC(r),
				aqi: a.aqi,
				category: a.category,
				level: a.level,
				standard: a.aqiStandard,
				primaryPollutant: a.primary,
				pollutants: {
					pm2p5: a.pm2p5,
					pm10: a.pm10,
					no2: a.no2,
					so2: a.so2,
					co: a.co,
					o3: a.o3
				},
				updated: vx(i.fetchedAt)
			};
		},
		"weather.warning": async (t = {}) => {
			let n = await nw(e), r = await rw(n, t.place), i = (await iw(e, r)).warnings || await HC(n.settings, r, "warnings") || [];
			return {
				place: ZC(r),
				count: i.length,
				warnings: i.map((e) => ({
					title: e.title,
					type: e.typeName,
					severity: e.severityText,
					color: e.colorCode,
					effectiveTime: e.startTime,
					expireTime: e.endTime,
					description: e.text,
					instruction: e.guide
				}))
			};
		},
		"weather.queryPlace": async (t = {}) => {
			let n = String(t.city || "").trim();
			if (!n) throw new ES("queryPlace 需要 city 参数");
			let r = await nw(e);
			tw(r.settings);
			let i = await zC(r.settings, n);
			if (i.length === 0) throw new ES(`没有找到城市“${n}”`);
			let a = i[0];
			return {
				...ew(a, await iw(e, a)),
				matchedLocation: {
					id: a.id,
					name: a.name,
					adm1: a.adm1,
					adm2: a.adm2,
					country: a.country
				}
			};
		},
		"weather.places": async () => {
			let t = await nw(e);
			return {
				currentPlaceId: gS(t.places)?.id || null,
				places: t.places.map((e) => ({
					id: e.id,
					name: e.name,
					region: [e.adm2, e.adm1].filter(Boolean).join(" · "),
					isCurrent: !!e.isCurrent
				}))
			};
		},
		"weather.addPlace": async (t = {}) => {
			let n = String(t.city || "").trim();
			if (!n) throw new ES("addPlace 需要 city 参数");
			let r = await nw(e);
			tw(r.settings);
			let i = await zC(r.settings, n);
			if (i.length === 0) throw new ES(`没有找到城市“${n}”`);
			let a = i[0], o = xS(r.places, a);
			return e.weather.updatePlaces(o), {
				added: ZC(a),
				currentPlaceId: a.id,
				places: o.map((e) => ({
					id: e.id,
					name: e.name,
					isCurrent: e.isCurrent
				}))
			};
		},
		"weather.removePlace": async (t = {}) => {
			let n = String(t.id || "").trim();
			if (!n) throw new ES("removePlace 需要 id 参数");
			let r = await nw(e);
			aw(r, n);
			let i = SS(r.places, n);
			return e.weather.updatePlaces(i), {
				removed: n,
				currentPlaceId: gS(i)?.id || null,
				places: i.map((e) => ({
					id: e.id,
					name: e.name,
					isCurrent: e.isCurrent
				}))
			};
		},
		"weather.setCurrentPlace": async (t = {}) => {
			let n = String(t.id || "").trim();
			if (!n) throw new ES("setCurrentPlace 需要 id 参数");
			let r = await nw(e);
			aw(r, n);
			let i = bS(r.places, n);
			return e.weather.updatePlaces(i), {
				currentPlaceId: n,
				current: ZC(_S(i, n))
			};
		},
		"weather.refresh": async (t = {}) => {
			let n = await nw(e);
			tw(n.settings);
			let r = await rw(n, t.place), i = gS(n.places);
			if (i && i.id === r.id) {
				let t = await e.weather.refresh();
				if (!t) throw new ES("刷新失败，暂时保留已缓存的数据");
				return ew(r, t);
			}
			return ew(r, await iw(e, r, { force: !0 }));
		},
		"weather.locate": async () => {
			let t = await nw(e);
			if (tw(t.settings), !t.settings.autoLocate) throw new ES("自动定位已关闭：请先在设置里打开「自动定位」", { code: "LOCATE_OFF" });
			let n = await PC(t.settings);
			if (!n?.place) throw new ES("定位失败：系统定位与 ip.cn 网络归属地都没有返回可用城市", { code: "LOCATE_FAILED" });
			let r = { ...n.place }, i = {
				place: r,
				source: n.source,
				at: Date.now()
			};
			e.weather.setLocation(i);
			let a = t.places.length > 0, o = !!_S(t.places, r.id)?.isCurrent, s = t.places, c = !1, l = !1;
			return a || (s = xS(t.places, r), e.weather.updatePlaces(s), c = !0, l = !0), {
				located: ZC(r),
				source: n.source,
				added: c,
				switched: l,
				alreadyCurrent: o,
				canSwitch: a && !o,
				currentPlaceId: gS(s)?.id || null,
				message: ow({
					hadPlaces: a,
					alreadyCurrent: o
				})
			};
		},
		"weather.settings.get": async () => {
			let t = await nw(e);
			return {
				settings: QC(t.settings),
				placesCount: t.places.length,
				currentPlaceId: gS(t.places)?.id || null
			};
		},
		"weather.settings.set": async (t = {}) => {
			let n = await nw(e), r = {};
			if ("unit" in t) {
				if (t.unit !== "c" && t.unit !== "f") throw new ES("unit 只能是 c 或 f");
				r.unit = t.unit;
			}
			if ("refreshMin" in t) {
				let e = Number(t.refreshMin);
				if (![
					15,
					30,
					60
				].includes(e)) throw new ES("refreshMin 只能是 15 / 30 / 60");
				r.refreshMin = e;
			}
			for (let e of [
				"autoLocate",
				"showAir",
				"showWarnings",
				"showMinutely"
			]) if (e in t) {
				if (typeof t[e] != "boolean") throw new ES(`${e} 需要是布尔值`);
				r[e] = t[e];
			}
			for (let e of ["apiKey", "apiHost"]) e in t && (r[e] = String(t[e] ?? ""));
			if (Object.keys(r).length === 0) throw new ES(`settings.set 至少需要一个字段：${qC.join(" / ")}`);
			let i = dS({
				...n.settings,
				...r
			});
			return e.weather.setSettings(i), {
				settings: QC(i),
				changed: Object.keys(r)
			};
		}
	};
}
//#endregion
//#region public/plugins/weather/src/WeatherApp.jsx
function cw() {
	let { scheme: t } = Xy(), n = (0, P.useMemo)(() => Rx(), []), r = (0, P.useMemo)(() => zx(), []), i = Zy(Fx, r ? Fx(r) : "3x2"), a = GC({ mock: n }), o = (0, P.useCallback)(() => eb("detail", "天气详情"), []);
	return sb(JC, (0, P.useMemo)(() => sw({
		mock: n,
		weather: a
	}), [n, a])), (0, P.useEffect)(() => {
		let t = e.onFocus?.(() => {
			document.querySelector("[data-card-root]")?.focus();
		});
		return () => t?.();
	}, []), (0, P.useEffect)(() => {
		let t = (t) => {
			t.key === "Escape" && e.exitFocus?.();
		};
		return window.addEventListener("keydown", t), () => window.removeEventListener("keydown", t);
	}, []), /* @__PURE__ */ (0, F.jsx)(rS, {
		sizeKey: i,
		scheme: t,
		settings: a.settings,
		place: a.place,
		data: a.data,
		status: a.status,
		locating: a.locating,
		onOpenDetail: o
	});
}
//#endregion
//#region public/plugins/weather/src/components/CityMenu.jsx
var lw = Kn({
	trigger: {
		minWidth: 0,
		maxWidth: "100%",
		minHeight: "40px",
		justifyContent: "flex-start",
		paddingInline: K.spacingHorizontalXS,
		gap: K.spacingHorizontalXS,
		color: K.colorNeutralForeground1
	},
	cityName: {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		minWidth: 0
	},
	itemText: {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		maxWidth: "260px"
	},
	itemHint: {
		color: K.colorNeutralForeground3,
		marginLeft: K.spacingHorizontalS,
		flexShrink: 0
	}
});
function uw({ places: e, currentPlace: t, located: n, onSelectPlace: r, onAddPlace: i, onManageCities: a, className: o }) {
	let s = lw(), c = Array.isArray(e) ? e : [], l = !!(n && c.some((e) => e.id === n.id)), u = !(!n || n.isCurrent);
	return /* @__PURE__ */ (0, F.jsxs)(a_, { children: [/* @__PURE__ */ (0, F.jsx)(Z_, {
		disableButtonEnhancement: !0,
		children: /* @__PURE__ */ (0, F.jsxs)(Kh, {
			appearance: "subtle",
			size: "large",
			className: A(s.trigger, o),
			"aria-label": t ? `当前城市 ${t.name}，切换城市` : "选择城市",
			title: "切换城市",
			children: [/* @__PURE__ */ (0, F.jsx)($, {
				size: 400,
				weight: "semibold",
				className: s.cityName,
				children: t?.name || "选择城市"
			}), /* @__PURE__ */ (0, F.jsx)(Ru, {})]
		})
	}), /* @__PURE__ */ (0, F.jsx)(G_, { children: /* @__PURE__ */ (0, F.jsxs)(R_, { children: [
		c.map((e) => /* @__PURE__ */ (0, F.jsx)(T_, {
			icon: e.isCurrent ? /* @__PURE__ */ (0, F.jsx)(Lu, {}) : /* @__PURE__ */ (0, F.jsx)(Mu, {}),
			onClick: () => r(e.id),
			children: /* @__PURE__ */ (0, F.jsx)("span", {
				className: s.itemText,
				children: yS(e)
			})
		}, e.id)),
		u ? /* @__PURE__ */ (0, F.jsxs)(T_, {
			icon: /* @__PURE__ */ (0, F.jsx)(Mu, {}),
			onClick: () => l ? r(n.id) : i(n),
			children: [/* @__PURE__ */ (0, F.jsxs)("span", {
				className: s.itemText,
				children: ["当前位置 · ", yS(n)]
			}), /* @__PURE__ */ (0, F.jsx)($, {
				size: 200,
				className: s.itemHint,
				children: l ? "切换" : "添加"
			})]
		}) : null,
		/* @__PURE__ */ (0, F.jsx)(d_, {}),
		/* @__PURE__ */ (0, F.jsx)(T_, {
			icon: /* @__PURE__ */ (0, F.jsx)(ku, {}),
			onClick: a,
			children: "管理城市…"
		})
	] }) })] });
}
//#endregion
//#region public/plugins/weather/src/views/panels.jsx
var dw = Kn({
	stack: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalL,
		minWidth: 0
	},
	list: {
		display: "flex",
		flexDirection: "column",
		minWidth: 0
	},
	hourlyRow: {
		display: "grid",
		gridTemplateColumns: "56px 24px 56px minmax(0, 1fr) 104px 80px",
		alignItems: "center",
		gap: K.spacingHorizontalM,
		minHeight: "44px",
		minWidth: 0
	},
	dailyRow: {
		display: "grid",
		gridTemplateColumns: "104px 24px minmax(0, 1fr) 112px 96px",
		alignItems: "center",
		gap: K.spacingHorizontalM,
		minHeight: "44px",
		minWidth: 0
	},
	dayCell: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalXXS,
		minWidth: 0
	},
	time: {
		color: K.colorNeutralForeground2,
		whiteSpace: "nowrap"
	},
	muted: {
		color: K.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	text: {
		color: K.colorNeutralForeground1,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		minWidth: 0
	},
	right: {
		justifySelf: "end",
		whiteSpace: "nowrap"
	},
	temp: {
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	high: {
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	low: {
		color: K.colorNeutralForeground3,
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	temps: {
		display: "inline-flex",
		alignItems: "baseline",
		justifyContent: "flex-end",
		gap: K.spacingHorizontalS,
		minWidth: 0
	},
	minutely: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalS,
		backgroundColor: K.colorNeutralBackground2,
		borderRadius: K.borderRadiusXLarge,
		padding: K.spacingVerticalM,
		minWidth: 0
	},
	minutelyHead: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalS,
		color: K.colorNeutralForeground2
	},
	minutelyBars: {
		display: "flex",
		alignItems: "flex-end",
		gap: K.spacingHorizontalXXS,
		height: "48px",
		minWidth: 0
	},
	minutelyBar: {
		flex: 1,
		minWidth: "2px",
		borderRadius: K.borderRadiusSmall,
		backgroundColor: K.colorBrandBackground
	},
	airTop: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalXXL,
		minWidth: 0,
		flexWrap: "wrap"
	},
	airMeta: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalXXS,
		minWidth: 0
	},
	airMetric: {
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr) auto 72px",
		alignItems: "center",
		gap: K.spacingHorizontalM,
		minHeight: "44px",
		minWidth: 0
	},
	airValue: {
		justifySelf: "end",
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	airUnit: {
		color: K.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	indexRow: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalXXS,
		minHeight: "48px",
		paddingBlock: K.spacingVerticalS,
		minWidth: 0
	},
	indexHead: {
		display: "flex",
		alignItems: "baseline",
		gap: K.spacingHorizontalS,
		minWidth: 0
	},
	indexAdvice: {
		color: K.colorNeutralForeground2,
		whiteSpace: "pre-wrap"
	},
	warningHeader: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalS,
		width: "100%",
		minWidth: 0,
		minHeight: "44px"
	},
	warningDot: {
		width: "10px",
		height: "10px",
		borderRadius: K.borderRadiusCircular,
		flexShrink: 0
	},
	warningTitle: {
		color: K.colorNeutralForeground1,
		minWidth: 0,
		flex: "1 1 auto"
	},
	warningMeta: {
		color: K.colorNeutralForeground3,
		whiteSpace: "nowrap",
		flexShrink: 0
	},
	warningBody: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalS,
		paddingBottom: K.spacingVerticalM,
		minWidth: 0
	},
	warningText: {
		color: K.colorNeutralForeground2,
		whiteSpace: "pre-wrap"
	},
	warningTime: { color: K.colorNeutralForeground3 },
	loading: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalS,
		color: K.colorNeutralForeground3,
		paddingBlock: K.spacingVerticalM
	},
	error: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: K.spacingVerticalS,
		color: K.colorStatusDangerForeground1,
		paddingBlock: K.spacingVerticalS
	}
});
function fw({ label: e }) {
	let t = dw();
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: t.loading,
		children: [/* @__PURE__ */ (0, F.jsx)(fv, { size: "tiny" }), /* @__PURE__ */ (0, F.jsx)($, {
			size: 300,
			children: e
		})]
	});
}
function pw({ message: e, onRetry: t }) {
	let n = dw();
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: n.error,
		children: [/* @__PURE__ */ (0, F.jsx)($, {
			size: 300,
			children: e
		}), t ? /* @__PURE__ */ (0, F.jsx)(Rb, {
			onClick: t,
			children: "重试"
		}) : null]
	});
}
function mw({ data: e, settings: t, scheme: n, minutelyState: r, onRetry: i }) {
	let a = dw(), o = e.daily?.[0], s = e.minutely, c = e.hourly || [];
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: a.stack,
		children: [
			t.showMinutely && s && s.items?.length > 0 ? /* @__PURE__ */ (0, F.jsxs)("div", {
				className: a.minutely,
				children: [
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: a.minutelyHead,
						children: [/* @__PURE__ */ (0, F.jsx)(Ou, {}), /* @__PURE__ */ (0, F.jsx)($, {
							size: 300,
							weight: "semibold",
							children: "分钟级降水"
						})]
					}),
					s.summary ? /* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: a.indexAdvice,
						children: s.summary
					}) : null,
					/* @__PURE__ */ (0, F.jsx)("div", {
						className: a.minutelyBars,
						"aria-hidden": "true",
						children: s.items.slice(0, 24).map((e, t) => {
							let n = Math.max(...s.items.map((e) => e.precip), .1);
							return /* @__PURE__ */ (0, F.jsx)("span", {
								className: a.minutelyBar,
								style: { height: `${Math.max(4, e.precip / n * 100)}%` },
								title: `${lx(e.time)} ${e.precip}mm`
							}, e.time || t);
						})
					})
				]
			}) : null,
			t.showMinutely && !s && r?.loading ? /* @__PURE__ */ (0, F.jsx)(fw, { label: "正在获取分钟级降水…" }) : null,
			c.length === 0 ? /* @__PURE__ */ (0, F.jsx)(pw, {
				message: "暂时没有逐时预报",
				onRetry: i
			}) : /* @__PURE__ */ (0, F.jsx)("div", {
				className: a.list,
				children: c.map((e, r) => /* @__PURE__ */ (0, F.jsxs)("div", {
					className: a.hourlyRow,
					"data-hourly-row": !0,
					children: [
						/* @__PURE__ */ (0, F.jsx)($, {
							size: 300,
							className: a.time,
							children: r === 0 ? "现在" : lx(e.fxTime)
						}),
						/* @__PURE__ */ (0, F.jsx)(Vx, {
							code: e.icon,
							night: Zx(e.fxTime, o?.sunrise, o?.sunset),
							scheme: n,
							size: 24,
							title: e.text
						}),
						/* @__PURE__ */ (0, F.jsx)($, {
							size: 400,
							weight: "semibold",
							className: a.temp,
							children: _x(e.temp, t.unit)
						}),
						/* @__PURE__ */ (0, F.jsx)($, {
							size: 300,
							className: a.text,
							children: e.text
						}),
						/* @__PURE__ */ (0, F.jsx)($, {
							size: 200,
							className: A(a.muted, a.right),
							children: Sx(e.windDir, e.windScale)
						}),
						/* @__PURE__ */ (0, F.jsx)($, {
							size: 200,
							className: A(a.muted, a.right),
							children: e.pop > 0 ? wx(e.pop) : ""
						})
					]
				}, e.fxTime || r))
			})
		]
	});
}
function hw({ data: e, settings: t, scheme: n }) {
	let r = dw(), i = (e.daily || []).slice(0, 7);
	return i.length === 0 ? /* @__PURE__ */ (0, F.jsx)(pw, { message: "暂时没有 7 天预报" }) : /* @__PURE__ */ (0, F.jsx)("div", {
		className: r.list,
		children: i.map((e, i) => /* @__PURE__ */ (0, F.jsxs)("div", {
			className: r.dailyRow,
			"data-daily-row": !0,
			children: [
				/* @__PURE__ */ (0, F.jsxs)("div", {
					className: r.dayCell,
					children: [/* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						children: ux(e.fxDate, i)
					}), /* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: r.muted,
						children: dx(e.fxDate)
					})]
				}),
				/* @__PURE__ */ (0, F.jsx)(Vx, {
					code: e.icon,
					scheme: n,
					size: 24,
					title: e.text
				}),
				/* @__PURE__ */ (0, F.jsx)($, {
					size: 300,
					className: r.text,
					children: e.text
				}),
				/* @__PURE__ */ (0, F.jsxs)("div", {
					className: r.temps,
					children: [/* @__PURE__ */ (0, F.jsx)($, {
						size: 500,
						weight: "semibold",
						className: r.high,
						children: _x(e.tempMax, t.unit)
					}), /* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: r.low,
						children: _x(e.tempMin, t.unit)
					})]
				}),
				/* @__PURE__ */ (0, F.jsx)($, {
					size: 200,
					className: A(r.muted, r.right),
					children: Sx(e.windDir, e.windScale)
				})
			]
		}, e.fxDate || i))
	});
}
function gw({ data: e, state: t, onRetry: n, showAir: r = !0 }) {
	let i = dw(), a = e.air;
	if (!r) return /* @__PURE__ */ (0, F.jsx)(Ib, {
		icon: /* @__PURE__ */ (0, F.jsx)(ju, {}),
		title: "已在设置里关闭空气质量",
		description: "打开「显示空气质量」后，这里会显示 AQI 与污染物浓度"
	});
	if (!a && t?.loading) return /* @__PURE__ */ (0, F.jsx)(fw, { label: "正在获取空气质量…" });
	if (!a && t?.error) return /* @__PURE__ */ (0, F.jsx)(pw, {
		message: t.error,
		onRetry: n
	});
	if (!a) return /* @__PURE__ */ (0, F.jsx)(Ib, {
		icon: /* @__PURE__ */ (0, F.jsx)(ju, {}),
		title: "暂无空气质量数据",
		description: "该城市当前没有返回空气质量数据",
		action: /* @__PURE__ */ (0, F.jsx)(Rb, {
			onClick: n,
			children: "重新获取"
		})
	});
	let o = Object.entries(a.pollutants || {}).filter(([, e]) => e && e.value != null);
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: i.stack,
		children: [/* @__PURE__ */ (0, F.jsxs)("div", {
			className: i.airTop,
			children: [/* @__PURE__ */ (0, F.jsx)(Xx, {
				air: a,
				size: 88
			}), /* @__PURE__ */ (0, F.jsxs)("div", {
				className: i.airMeta,
				children: [/* @__PURE__ */ (0, F.jsxs)($, {
					size: 200,
					className: i.muted,
					children: ["首要污染物 ", a.primary || "—"]
				}), /* @__PURE__ */ (0, F.jsx)($, {
					size: 200,
					className: i.muted,
					children: a.aqiStandard === "cn-mee" ? "中国 AQI 标准" : "AQI"
				})]
			})]
		}), /* @__PURE__ */ (0, F.jsx)("div", {
			className: i.list,
			children: o.map(([e, t]) => /* @__PURE__ */ (0, F.jsxs)("div", {
				className: i.airMetric,
				"data-air-row": !0,
				children: [
					/* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						children: t.name || e
					}),
					/* @__PURE__ */ (0, F.jsx)($, {
						size: 400,
						weight: "semibold",
						className: i.airValue,
						children: Math.round(Number(t.value) * 10) / 10
					}),
					/* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: i.airUnit,
						children: t.unit || "μg/m³"
					})
				]
			}, e))
		})]
	});
}
function _w({ data: e, state: t, onRetry: n }) {
	let r = dw(), i = e.indices;
	return !i && t?.loading ? /* @__PURE__ */ (0, F.jsx)(fw, { label: "正在获取生活指数…" }) : !i && t?.error ? /* @__PURE__ */ (0, F.jsx)(pw, {
		message: t.error,
		onRetry: n
	}) : !i || i.length === 0 ? /* @__PURE__ */ (0, F.jsx)(Ib, {
		icon: /* @__PURE__ */ (0, F.jsx)(ju, {}),
		title: "暂无生活指数",
		description: "该城市当前没有返回生活指数数据",
		action: /* @__PURE__ */ (0, F.jsx)(Rb, {
			onClick: n,
			children: "重新获取"
		})
	}) : /* @__PURE__ */ (0, F.jsx)("div", {
		className: r.list,
		children: i.map((e) => /* @__PURE__ */ (0, F.jsxs)("div", {
			className: r.indexRow,
			"data-index-row": !0,
			children: [/* @__PURE__ */ (0, F.jsxs)("div", {
				className: r.indexHead,
				children: [/* @__PURE__ */ (0, F.jsx)($, {
					size: 300,
					weight: "semibold",
					children: e.name
				}), /* @__PURE__ */ (0, F.jsx)($, {
					size: 300,
					className: r.muted,
					children: e.category
				})]
			}), /* @__PURE__ */ (0, F.jsx)($, {
				size: 300,
				className: r.indexAdvice,
				children: e.text
			})]
		}, `${e.type}-${e.date}`))
	});
}
function vw(e) {
	let t = (e) => {
		if (!e) return "";
		let t = new Date(e);
		return Number.isNaN(t.getTime()) ? e : t.toLocaleString("zh-CN", { hour12: !1 });
	}, n = t(e.startTime), r = t(e.endTime);
	return n && r ? `生效 ${n} → ${r}` : n || r || "";
}
function yw({ data: e, state: t, onRetry: n }) {
	let r = dw(), i = e.warnings;
	return !i && t?.loading ? /* @__PURE__ */ (0, F.jsx)(fw, { label: "正在获取天气预警…" }) : !i && t?.error ? /* @__PURE__ */ (0, F.jsx)(pw, {
		message: t.error,
		onRetry: n
	}) : !i || i.length === 0 ? /* @__PURE__ */ (0, F.jsx)(Ib, {
		icon: /* @__PURE__ */ (0, F.jsx)(ju, {}),
		title: "当前没有生效的天气预警",
		description: "有新的预警时，详情会默认打开这个 Tab",
		action: /* @__PURE__ */ (0, F.jsx)(Rb, {
			onClick: n,
			children: "重新获取"
		})
	}) : /* @__PURE__ */ (0, F.jsx)(Ul, {
		multiple: !0,
		collapsible: !0,
		children: i.map((e) => /* @__PURE__ */ (0, F.jsxs)($l, {
			value: e.id,
			children: [/* @__PURE__ */ (0, F.jsx)(Od, {
				expandIconPosition: "end",
				children: /* @__PURE__ */ (0, F.jsxs)("span", {
					className: r.warningHeader,
					"data-warning-head": !0,
					children: [
						/* @__PURE__ */ (0, F.jsx)("span", {
							className: r.warningDot,
							style: { backgroundColor: e.color }
						}),
						/* @__PURE__ */ (0, F.jsx)($, {
							size: 300,
							weight: "semibold",
							className: r.warningTitle,
							children: e.title
						}),
						/* @__PURE__ */ (0, F.jsx)($, {
							size: 200,
							className: r.warningMeta,
							children: [e.typeName, e.severityText].filter(Boolean).join(" · ")
						})
					]
				})
			}), /* @__PURE__ */ (0, F.jsx)(Ud, { children: /* @__PURE__ */ (0, F.jsxs)("div", {
				className: r.warningBody,
				children: [
					/* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: r.warningTime,
						children: vw(e)
					}),
					/* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: r.warningText,
						children: e.text
					}),
					e.guide ? /* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: r.warningText,
						children: e.guide
					}) : null
				]
			}) })]
		}, e.id))
	});
}
//#endregion
//#region public/plugins/weather/src/views/ManageCities.jsx
var bw = Kn({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalXL,
		minWidth: 0
	},
	section: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalS,
		minWidth: 0
	},
	sectionHead: {
		display: "flex",
		alignItems: "baseline",
		justifyContent: "space-between",
		gap: K.spacingHorizontalM,
		minWidth: 0
	},
	hint: { color: K.colorNeutralForeground3 },
	error: { color: K.colorStatusDangerForeground1 },
	empty: {
		color: K.colorNeutralForeground3,
		paddingBlock: K.spacingVerticalS
	},
	locatedSource: { color: K.colorNeutralForeground3 },
	rowActions: {
		display: "inline-flex",
		alignItems: "center",
		gap: K.spacingHorizontalXS,
		flexShrink: 0
	},
	confirmText: {
		color: K.colorStatusDangerForeground1,
		whiteSpace: "nowrap"
	}
}), xw = {
	system: "系统定位",
	ip: "网络定位（ip.cn）",
	mock: "演示定位"
};
function Sw(e) {
	return xw[e] || "定位结果";
}
function Cw({ settings: e, places: t, currentPlace: n, located: r, locatedSource: i, configured: a, onAdd: o, onRemove: s, onSelect: c }) {
	let l = bw(), u = Yb(), [d, f] = (0, P.useState)(""), [p, m] = (0, P.useState)([]), [h, g] = (0, P.useState)(!1), [_, v] = (0, P.useState)(""), [y, b] = (0, P.useState)(null), x = (0, P.useMemo)(() => new Set(t.map((e) => e.id)), [t]);
	(0, P.useEffect)(() => {
		let t = d.trim();
		if (!t) {
			m([]), v(""), g(!1);
			return;
		}
		let n = !0;
		g(!0), v("");
		let r = window.setTimeout(() => {
			zC(e, t).then((e) => {
				n && m(e.slice(0, 6));
			}).catch((e) => {
				n && (m([]), v(e?.message || "搜索失败，请稍后再试"));
			}).finally(() => {
				n && g(!1);
			});
		}, 300);
		return () => {
			n = !1, window.clearTimeout(r);
		};
	}, [
		d,
		e.apiKey,
		e.apiHost,
		e.mock
	]);
	let S = () => u?.(), C = (e) => {
		o(e), S();
	}, w = (e) => {
		c(e), S();
	}, T = (e) => {
		s(e), S();
	}, E = !!(r && x.has(r.id)), D = !!(r && n && r.id === n.id);
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: l.root,
		children: [
			r ? /* @__PURE__ */ (0, F.jsxs)("section", {
				className: l.section,
				"aria-label": "当前位置",
				children: [/* @__PURE__ */ (0, F.jsxs)("div", {
					className: l.sectionHead,
					children: [/* @__PURE__ */ (0, F.jsx)($, {
						size: 400,
						weight: "semibold",
						children: "当前位置"
					}), /* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: l.hint,
						children: Sw(i)
					})]
				}), /* @__PURE__ */ (0, F.jsx)(Pb, {
					leading: /* @__PURE__ */ (0, F.jsx)(Nu, {}),
					title: `当前位置 · ${yS(r)}`,
					subtitle: r.adm1 || r.country || "",
					trailing: D ? /* @__PURE__ */ (0, F.jsx)($d, {
						appearance: "tint",
						color: "brand",
						size: "medium",
						children: "当前"
					}) : /* @__PURE__ */ (0, F.jsx)(Rb, {
						onClick: () => E ? w(r.id) : C(r),
						children: E ? "设为当前" : "添加"
					})
				})]
			}) : null,
			/* @__PURE__ */ (0, F.jsxs)("section", {
				className: l.section,
				"aria-label": "搜索城市",
				children: [
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: l.sectionHead,
						children: [/* @__PURE__ */ (0, F.jsx)($, {
							size: 400,
							weight: "semibold",
							children: "搜索城市"
						}), h ? /* @__PURE__ */ (0, F.jsx)(fv, { size: "tiny" }) : null]
					}),
					/* @__PURE__ */ (0, F.jsx)(hg, {
						size: "large",
						value: d,
						placeholder: a ? "输入城市名，例如 杭州" : "配置 API Key 后才能搜索城市",
						"aria-label": "搜索城市",
						disabled: !a,
						contentBefore: /* @__PURE__ */ (0, F.jsx)(Du, {}),
						onChange: (e, t) => f(t.value)
					}),
					a ? /* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: l.hint,
						children: "搜索使用和风 GeoAPI；添加后自动设为当前城市"
					}) : /* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: l.hint,
						children: "当前没有和风天气 API Key：仍可切换或删除已保存的城市"
					}),
					_ ? /* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: l.error,
						children: _
					}) : null,
					d.trim() && !h && !_ && p.length === 0 ? /* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: l.empty,
						children: "没有找到城市，换个写法试试"
					}) : null,
					p.map((e) => {
						let t = x.has(e.id);
						return /* @__PURE__ */ (0, F.jsx)(Pb, {
							leading: /* @__PURE__ */ (0, F.jsx)(Nu, {}),
							title: e.name,
							subtitle: [
								e.adm2,
								e.adm1,
								e.country
							].filter(Boolean).join(" · "),
							trailing: t ? /* @__PURE__ */ (0, F.jsx)($, {
								size: 200,
								className: l.hint,
								children: "已添加"
							}) : /* @__PURE__ */ (0, F.jsx)(Rb, {
								appearance: "primary",
								onClick: () => C(e),
								children: "添加"
							})
						}, e.id);
					})
				]
			}),
			/* @__PURE__ */ (0, F.jsxs)("section", {
				className: l.section,
				"aria-label": "已添加城市",
				children: [
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: l.sectionHead,
						children: [/* @__PURE__ */ (0, F.jsx)($, {
							size: 400,
							weight: "semibold",
							children: "已添加城市"
						}), /* @__PURE__ */ (0, F.jsxs)($, {
							size: 200,
							className: l.hint,
							children: [t.length, " 个"]
						})]
					}),
					t.length === 0 ? /* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: l.empty,
						children: "还没有城市。搜索并添加一个，或使用上方「当前位置」"
					}) : null,
					t.map((e) => {
						let t = y === e.id;
						return /* @__PURE__ */ (0, F.jsx)(Pb, {
							leading: /* @__PURE__ */ (0, F.jsx)(Nu, {}),
							title: e.name,
							subtitle: yS(e),
							trailing: t ? /* @__PURE__ */ (0, F.jsxs)("span", {
								className: l.rowActions,
								children: [
									/* @__PURE__ */ (0, F.jsx)($, {
										size: 200,
										className: l.confirmText,
										children: "删除这个城市？"
									}),
									/* @__PURE__ */ (0, F.jsx)(Rb, {
										icon: /* @__PURE__ */ (0, F.jsx)(zu, {}),
										onClick: () => T(e.id),
										children: "删除"
									}),
									/* @__PURE__ */ (0, F.jsx)(Rb, {
										onClick: () => b(null),
										children: "取消"
									})
								]
							}) : /* @__PURE__ */ (0, F.jsxs)("span", {
								className: l.rowActions,
								children: [e.isCurrent ? /* @__PURE__ */ (0, F.jsx)($d, {
									appearance: "tint",
									color: "brand",
									size: "medium",
									children: "当前"
								}) : /* @__PURE__ */ (0, F.jsx)(Rb, {
									onClick: () => w(e.id),
									children: "设为当前"
								}), /* @__PURE__ */ (0, F.jsx)(Rb, {
									onClick: () => b(e.id),
									children: "删除"
								})]
							})
						}, e.id);
					})
				]
			})
		]
	});
}
//#endregion
//#region public/plugins/weather/src/views/DetailView.jsx
var ww = Kn({
	headerLeading: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		minWidth: 0
	},
	statusText: {
		color: K.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	actions: {
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalS
	},
	summary: {
		flexShrink: 0,
		display: "flex",
		alignItems: "center",
		gap: K.spacingHorizontalL,
		minHeight: "96px",
		paddingInline: K.spacingHorizontalXXL,
		boxSizing: "border-box",
		minWidth: 0
	},
	summaryMeta: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalXXS,
		minWidth: 0
	},
	summarySpacer: {
		flex: 1,
		minWidth: 0
	},
	aqiBadge: { flexShrink: 0 },
	aqiContent: {
		display: "inline-flex",
		alignItems: "center",
		gap: K.spacingHorizontalXS
	},
	aqiDot: {
		width: "8px",
		height: "8px",
		borderRadius: K.borderRadiusCircular,
		flexShrink: 0
	},
	env: {
		flexShrink: 0,
		display: "grid",
		gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
		gap: K.spacingHorizontalL,
		minHeight: "44px",
		alignItems: "center",
		paddingInline: K.spacingHorizontalXXL,
		boxSizing: "border-box",
		minWidth: 0,
		"@media (max-width: 700px)": {
			gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
			rowGap: K.spacingVerticalS,
			paddingBlock: K.spacingVerticalS
		}
	},
	envItem: {
		display: "flex",
		flexDirection: "column",
		gap: K.spacingVerticalXXS,
		minWidth: 0
	},
	envLabel: {
		color: K.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	envValue: {
		color: K.colorNeutralForeground1,
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis"
	},
	contentEmpty: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: K.spacingVerticalM,
		minHeight: "240px",
		textAlign: "center",
		color: K.colorNeutralForeground3
	},
	notice: { maxWidth: "640px" }
});
function Tw(e, t = 1e3) {
	let [n, r] = (0, P.useState)(!1);
	return (0, P.useEffect)(() => {
		if (!e) {
			r(!1);
			return;
		}
		let n = window.setTimeout(() => r(!0), t);
		return () => window.clearTimeout(n);
	}, [e, t]), n;
}
function Ew({ air: e }) {
	let t = ww();
	return !e || e.aqi == null ? null : /* @__PURE__ */ (0, F.jsx)("div", {
		className: t.aqiBadge,
		children: /* @__PURE__ */ (0, F.jsx)($d, {
			appearance: "tint",
			color: "informative",
			size: "large",
			children: /* @__PURE__ */ (0, F.jsxs)("span", {
				className: t.aqiContent,
				children: [
					/* @__PURE__ */ (0, F.jsx)("span", {
						className: t.aqiDot,
						style: { backgroundColor: e.color }
					}),
					/* @__PURE__ */ (0, F.jsx)($, {
						size: 400,
						weight: "semibold",
						children: e.aqiDisplay || e.aqi
					}),
					/* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						children: e.category || "—"
					})
				]
			})
		})
	});
}
function Dw() {
	let e = ww(), { scheme: t } = Xy(), n = Qb(3e4), { settings: r, places: i, place: a, data: o, status: s, sectionState: c, located: l, locatedSource: u, locating: d, refresh: f, ensureSection: p, addPlace: m, removePlace: h, selectPlace: g, configured: _ } = GC({ mock: (0, P.useMemo)(() => Rx(), []) }), [v, y] = (0, P.useState)(null), [b, x] = (0, P.useState)(!1), S = (0, P.useRef)(!1), C = Tw(!o && s.loading, 1e3), w = r.showWarnings && o?.warnings || [], T = (0, P.useMemo)(() => {
		let e = [{
			value: "hourly",
			label: "逐时"
		}, {
			value: "daily",
			label: "7 天"
		}];
		return r.showAir && e.push({
			value: "air",
			label: "空气"
		}), e.push({
			value: "indices",
			label: "生活指数"
		}), r.showWarnings && e.push({
			value: "warning",
			label: "预警",
			badge: w.length > 0 ? /* @__PURE__ */ (0, F.jsx)($d, {
				appearance: "tint",
				color: "danger",
				size: "medium",
				children: w.length
			}) : void 0
		}), e;
	}, [
		r.showAir,
		r.showWarnings,
		w.length
	]);
	(0, P.useEffect)(() => {
		!S.current && o && (S.current = !0, y(r.showWarnings && o.warnings?.length ? "warning" : "hourly"));
	}, [o, r.showWarnings]);
	let E = T.some((e) => e.value === v) ? v : "hourly", D = (0, P.useCallback)((e) => y(e), []);
	(0, P.useEffect)(() => {
		o && (E === "air" && o.air === void 0 ? p("air") : E === "indices" && o.indices === void 0 ? p("indices") : E === "warning" && o.warnings === void 0 ? p("warnings") : E === "hourly" && r.showMinutely && o.minutely === void 0 && p("minutely"));
	}, [
		E,
		o,
		r.showMinutely,
		p
	]);
	let ee = (0, P.useCallback)(() => {
		f();
	}, [f]), te = (0, P.useCallback)(() => tb(), []), O = o?.current || null, k = o?.daily?.[0] || null, ne = O ? Zx(O.obsTime || (/* @__PURE__ */ new Date()).toISOString(), k?.sunrise, k?.sunset) : !1, A = o?.fetchedAt ? null : s.loading ? "正在加载…" : s.error ? "加载失败" : _ ? "尚未更新" : "未配置数据源", re = /* @__PURE__ */ (0, F.jsx)(Hb, {
		trailing: /* @__PURE__ */ (0, F.jsxs)("div", {
			className: e.actions,
			children: [/* @__PURE__ */ (0, F.jsx)(kh, {
				content: "刷新天气",
				relationship: "label",
				children: /* @__PURE__ */ (0, F.jsx)(Kh, {
					appearance: "subtle",
					size: "large",
					"aria-label": "刷新天气",
					icon: s.refreshing ? /* @__PURE__ */ (0, F.jsx)(fv, { size: "tiny" }) : /* @__PURE__ */ (0, F.jsx)(Pu, {}),
					disabled: s.refreshing || !a,
					onClick: ee
				})
			}), /* @__PURE__ */ (0, F.jsx)(Rb, {
				icon: /* @__PURE__ */ (0, F.jsx)(Au, {}),
				onClick: te,
				children: "设置…"
			})]
		}),
		children: /* @__PURE__ */ (0, F.jsxs)("div", {
			className: e.headerLeading,
			children: [/* @__PURE__ */ (0, F.jsx)(uw, {
				places: i,
				currentPlace: a,
				located: l,
				onSelectPlace: g,
				onAddPlace: m,
				onManageCities: () => x(!0)
			}), o?.fetchedAt ? /* @__PURE__ */ (0, F.jsx)(Wx, {
				offline: s.offline,
				fetchedAt: o.fetchedAt,
				refreshMin: r.refreshMin,
				now: n
			}) : /* @__PURE__ */ (0, F.jsx)($, {
				size: 200,
				className: e.statusText,
				children: A
			})]
		})
	}), ie = b ? /* @__PURE__ */ (0, F.jsx)(Zb, {
		title: "管理城市",
		onClosed: () => x(!1),
		children: /* @__PURE__ */ (0, F.jsx)(Cw, {
			settings: r,
			places: i,
			currentPlace: a,
			located: l,
			locatedSource: u,
			configured: _,
			onAdd: m,
			onRemove: h,
			onSelect: g
		})
	}) : null;
	return _ ? a ? /* @__PURE__ */ (0, F.jsxs)(Bb, { children: [
		re,
		O ? /* @__PURE__ */ (0, F.jsxs)("section", {
			className: e.summary,
			"aria-label": "当前天气",
			"data-weather-summary": !0,
			children: [
				/* @__PURE__ */ (0, F.jsx)(Vx, {
					code: O.icon,
					night: ne,
					scheme: t,
					size: 56,
					title: O.text
				}),
				/* @__PURE__ */ (0, F.jsx)(Mb, {
					value: _x(O.temp, r.unit),
					size: 48
				}),
				/* @__PURE__ */ (0, F.jsxs)("div", {
					className: e.summaryMeta,
					children: [/* @__PURE__ */ (0, F.jsx)($, {
						size: 400,
						children: O.text
					}), /* @__PURE__ */ (0, F.jsx)(Ux, {
						max: k?.tempMax,
						min: k?.tempMin,
						unit: r.unit,
						size: 300
					})]
				}),
				/* @__PURE__ */ (0, F.jsx)("div", { className: e.summarySpacer }),
				r.showAir ? /* @__PURE__ */ (0, F.jsx)(Ew, { air: o.air }) : null
			]
		}) : null,
		O ? /* @__PURE__ */ (0, F.jsxs)("section", {
			className: e.env,
			"aria-label": "环境信息",
			"data-weather-env": !0,
			children: [
				/* @__PURE__ */ (0, F.jsxs)("div", {
					className: e.envItem,
					children: [/* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: e.envLabel,
						children: "体感"
					}), /* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: e.envValue,
						children: _x(O.feelsLike, r.unit)
					})]
				}),
				/* @__PURE__ */ (0, F.jsxs)("div", {
					className: e.envItem,
					children: [/* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: e.envLabel,
						children: "湿度"
					}), /* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: e.envValue,
						children: Cx(O.humidity)
					})]
				}),
				/* @__PURE__ */ (0, F.jsxs)("div", {
					className: e.envItem,
					children: [/* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: e.envLabel,
						children: "风"
					}), /* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: e.envValue,
						children: Sx(O.windDir, O.windScale)
					})]
				}),
				/* @__PURE__ */ (0, F.jsxs)("div", {
					className: e.envItem,
					children: [/* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: e.envLabel,
						children: "气压"
					}), /* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: e.envValue,
						children: Ex(O.pressure)
					})]
				}),
				/* @__PURE__ */ (0, F.jsxs)("div", {
					className: e.envItem,
					children: [/* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: e.envLabel,
						children: "能见度"
					}), /* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: e.envValue,
						children: Tx(O.vis)
					})]
				}),
				/* @__PURE__ */ (0, F.jsxs)("div", {
					className: e.envItem,
					children: [/* @__PURE__ */ (0, F.jsx)($, {
						size: 200,
						className: e.envLabel,
						children: "紫外线"
					}), /* @__PURE__ */ (0, F.jsx)($, {
						size: 300,
						className: e.envValue,
						children: Dx(O.uvIndex)
					})]
				})
			]
		}) : null,
		/* @__PURE__ */ (0, F.jsx)(Wb, {
			items: T,
			value: E,
			onChange: D,
			ariaLabel: "天气详情内容"
		}),
		/* @__PURE__ */ (0, F.jsx)(qb, { children: o ? /* @__PURE__ */ (0, F.jsx)(mb, {
			value: E,
			children: E === "hourly" ? /* @__PURE__ */ (0, F.jsx)(mw, {
				data: o,
				settings: r,
				scheme: t,
				minutelyState: c.minutely,
				onRetry: () => p("minutely", { force: !0 })
			}) : E === "daily" ? /* @__PURE__ */ (0, F.jsx)(hw, {
				data: o,
				settings: r,
				scheme: t
			}) : E === "air" ? /* @__PURE__ */ (0, F.jsx)(gw, {
				data: o,
				state: c.air,
				showAir: r.showAir,
				onRetry: () => p("air", { force: !0 })
			}) : E === "indices" ? /* @__PURE__ */ (0, F.jsx)(_w, {
				data: o,
				state: c.indices,
				onRetry: () => p("indices", { force: !0 })
			}) : /* @__PURE__ */ (0, F.jsx)(yw, {
				data: o,
				state: c.warnings,
				onRetry: () => p("warnings", { force: !0 })
			})
		}) : s.error ? /* @__PURE__ */ (0, F.jsxs)(Sy, {
			intent: "error",
			className: e.notice,
			children: [/* @__PURE__ */ (0, F.jsx)(Ry, { children: s.error }), /* @__PURE__ */ (0, F.jsx)(jy, { children: /* @__PURE__ */ (0, F.jsx)(Rb, {
				onClick: ee,
				children: "重试"
			}) })]
		}) : C ? /* @__PURE__ */ (0, F.jsxs)("div", {
			className: e.contentEmpty,
			children: [/* @__PURE__ */ (0, F.jsx)(fv, { size: "small" }), /* @__PURE__ */ (0, F.jsx)($, {
				size: 300,
				children: "正在加载天气数据…"
			})]
		}) : /* @__PURE__ */ (0, F.jsx)("div", { className: e.contentEmpty }) }),
		ie
	] }) : /* @__PURE__ */ (0, F.jsxs)(Bb, { children: [
		re,
		/* @__PURE__ */ (0, F.jsx)(qb, { children: d ? /* @__PURE__ */ (0, F.jsxs)("div", {
			className: e.contentEmpty,
			children: [/* @__PURE__ */ (0, F.jsx)(fv, { size: "small" }), /* @__PURE__ */ (0, F.jsx)($, {
				size: 300,
				children: "正在定位…"
			})]
		}) : /* @__PURE__ */ (0, F.jsx)(Ib, {
			icon: /* @__PURE__ */ (0, F.jsx)(Nu, {}),
			title: "还没有城市",
			description: "搜索并添加一个城市，卡片就会显示当前天气；打开自动定位会把当前位置作为候选",
			action: /* @__PURE__ */ (0, F.jsx)(Rb, {
				appearance: "primary",
				onClick: () => x(!0),
				children: "管理城市"
			})
		}) }),
		ie
	] }) : /* @__PURE__ */ (0, F.jsxs)(Bb, { children: [
		re,
		/* @__PURE__ */ (0, F.jsx)(qb, { children: /* @__PURE__ */ (0, F.jsx)(Ib, {
			icon: /* @__PURE__ */ (0, F.jsx)(Iu, {}),
			title: "还没有配置和风天气 API Key",
			description: "在宿主设置页的天气分区填写 API Key 与 API Host，卡片与详情就会显示实时天气",
			action: /* @__PURE__ */ (0, F.jsx)(Rb, {
				appearance: "primary",
				onClick: te,
				children: "打开设置"
			})
		}) }),
		ie
	] });
}
//#endregion
//#region public/plugins/weather/src/main.jsx
Gy();
function Ow() {
	let { theme: e } = Xy(), t = $y();
	return /* @__PURE__ */ (0, F.jsx)(wl, {
		theme: e,
		style: {
			width: "100%",
			height: "100%",
			background: "transparent",
			colorScheme: "normal"
		},
		children: t === "detail" ? /* @__PURE__ */ (0, F.jsx)(Dw, {}) : /* @__PURE__ */ (0, F.jsx)(cw, {})
	});
}
var kw = document.getElementById("root");
kw && (0, zy.createRoot)(kw).render(/* @__PURE__ */ (0, F.jsx)(Ow, {}));
//#endregion
