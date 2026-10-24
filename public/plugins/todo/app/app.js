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
	function O(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function te(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var ne = /\/+/g;
	function re(e, t) {
		return typeof e == "object" && e && e.key != null ? te("" + e.key) : t.toString(36);
	}
	function k(e) {
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
	function ie(e, r, i, a, o) {
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
				case d: return c = e._init, ie(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + re(e, 0) : a, C(o) ? (i = "", c != null && (i = c.replace(ne, "$&/") + "/"), ie(o, r, i, "", function(e) {
			return e;
		})) : o != null && (O(o) && (o = ee(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ne, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (C(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + re(a, u), c += ie(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + re(a, u++), c += ie(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ie(k(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function ae(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ie(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function oe(e) {
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
	var se = typeof reportError == "function" ? reportError : function(e) {
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
	function ce(e) {
		var t = T.T, n = {};
		n.types = t === null ? null : t.types, T.T = n;
		try {
			var r = e(), i = T.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(w, se);
		} catch (e) {
			se(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), T.T = t;
		}
	}
	function le(e) {
		var t = T.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else ce(le.bind(null, e));
	}
	var ue = {
		map: ae,
		forEach: function(e, t, n) {
			ae(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ae(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ae(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!O(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = ue, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = x, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = T, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return T.H.useMemoCache(e);
		}
	}, e.addTransitionType = le, e.cache = function(e) {
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
	}, e.isValidElement = O, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: oe
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = ce, e.unstable_useCacheRefresh = function() {
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
				t !== null && ne(x, t.startTime - e);
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
								u !== null && ne(x, u.startTime - t), i = !1;
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
		var O = new MessageChannel(), te = O.port2;
		O.port1.onmessage = D, ee = function() {
			te.postMessage(null);
		};
	} else ee = function() {
		_(D, 0);
	};
	function ne(t, n) {
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
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, ne(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, ee()))), r;
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
	var D = Object.assign, ee = Symbol.for("react.element"), O = Symbol.for("react.transitional.element"), te = Symbol.for("react.portal"), ne = Symbol.for("react.fragment"), re = Symbol.for("react.strict_mode"), k = Symbol.for("react.profiler"), ie = Symbol.for("react.consumer"), ae = Symbol.for("react.context"), oe = Symbol.for("react.forward_ref"), se = Symbol.for("react.suspense"), ce = Symbol.for("react.suspense_list"), le = Symbol.for("react.memo"), ue = Symbol.for("react.lazy"), de = Symbol.for("react.activity"), fe = Symbol.for("react.legacy_hidden"), pe = Symbol.for("react.memo_cache_sentinel"), me = Symbol.for("react.view_transition"), he = Symbol.for("react.recoverable"), ge = Symbol.iterator;
	function _e(e) {
		return typeof e != "object" || !e ? null : (e = ge && e[ge] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var ve = Symbol.for("react.client.reference");
	function ye(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === ve ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case ne: return "Fragment";
			case k: return "Profiler";
			case re: return "StrictMode";
			case se: return "Suspense";
			case ce: return "SuspenseList";
			case de: return "Activity";
			case me: return "ViewTransition";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case te: return "Portal";
			case ae: return e.displayName || "Context";
			case ie: return (e._context.displayName || "Context") + ".Consumer";
			case oe:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case le: return t = e.displayName || null, t === null ? ye(e.type) || "Memo" : t;
			case ue:
				t = e._payload, e = e._init;
				try {
					return ye(e(t));
				} catch {}
		}
		return null;
	}
	var be = Array.isArray, A = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, xe = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Se = {
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
				e = (e = t.documentElement) && (e = e.namespaceURI) ? pp(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = pp(t), e = mp(t, e);
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
		t !== null && (uh._currentValue = t.memoizedState, De(je, e)), t = Oe.current;
		var n = mp(t, e.type);
		t !== n && (De(ke, e), De(Oe, n));
	}
	function Fe(e) {
		ke.current === e && (Ee(Oe), Ee(ke)), je.current === e && (Ee(je), uh._currentValue = Se);
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
		var e = xe.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : Eh(e.type)) : e;
	}
	function Ot(e, t) {
		var n = xe.p;
		try {
			return xe.p = e, t();
		} finally {
			xe.p = n;
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
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = hm(e); e !== null;) {
					if (n = e[At]) return n;
					e = hm(e);
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
	var $t = !1;
	function en() {
		var e = $t;
		return $t = !1, e;
	}
	function tn(e, t, n) {
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
	function nn(e, t, n) {
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
	function rn(e, t, n, r) {
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
	function an(e) {
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
	function on(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function sn(e, t, n) {
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
	function cn(e) {
		if (!e._valueTracker) {
			var t = on(e) ? "checked" : "value";
			e._valueTracker = sn(e, t, "" + e[t]);
		}
	}
	function ln(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = on(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	var un = /[\n"\\]/g;
	function dn(e) {
		return e.replace(un, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function fn(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + an(t)) : e.value !== "" + an(t) && (e.value = "" + an(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : mn(e, an(n)) : o === "number" && e.value == t ? mn(e, an(e.value)) : mn(e, an(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + an(s) : e.removeAttribute("name");
	}
	function pn(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				cn(e);
				return;
			}
			n = n == null ? "" : "" + an(n), t = t == null ? n : "" + an(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), cn(e);
	}
	function mn(e, t) {
		e.defaultValue !== "" + t && (e.defaultValue = "" + t);
	}
	function hn(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + an(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function gn(e, t, n) {
		t != null && (t = "" + an(t), t !== e.value && (e.value = t), n == null) ? e.defaultValue !== t && (e.defaultValue = t) : e.defaultValue = n == null ? "" : "" + an(n);
	}
	function _n(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(i(92));
				if (be(r)) {
					if (1 < r.length) throw Error(i(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = an(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), cn(e);
	}
	function vn(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var yn = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function bn(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || yn.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function xn(e, t, n) {
		if (t != null && typeof t != "object") throw Error(i(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "", $t = !0);
			for (var a in t) r = t[a], t.hasOwnProperty(a) && n[a] !== r && (bn(e, a, r), $t = !0);
		} else for (var o in t) t.hasOwnProperty(o) && bn(e, o, t[o]);
	}
	function Sn(e) {
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
	var Cn = /* @__PURE__ */ new Map([
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
	]), wn = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function Tn(e) {
		return wn.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function En() {}
	var Dn = null;
	function On(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var kn = null, An = null;
	function jn(e) {
		var t = Bt(e);
		if (t && (e = t.stateNode)) {
			var n = e[jt] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (fn(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + dn("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var a = r[jt] || null;
								if (!a) throw Error(i(90));
								fn(r, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && ln(r);
					}
					break a;
				case "textarea":
					gn(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && hn(e, !!n.multiple, t, !1);
			}
		}
	}
	var Mn = !1;
	function Nn(e, t, n) {
		if (Mn) return e(t, n);
		Mn = !0;
		try {
			return e(t);
		} finally {
			if (Mn = !1, (kn !== null || An !== null) && (Hd(), kn && (t = kn, e = An, An = kn = null, jn(t), e))) for (t = 0; t < e.length; t++) jn(e[t]);
		}
	}
	function Pn(e, t) {
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
	var Fn = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, In = !1;
	if (Fn) try {
		var Ln = {};
		Object.defineProperty(Ln, "passive", { get: function() {
			In = !0;
		} }), window.addEventListener("test", Ln, Ln), window.removeEventListener("test", Ln, Ln);
	} catch {
		In = !1;
	}
	var Rn = null, zn = null, M = null;
	function Bn() {
		if (M) return M;
		var e, t = zn, n = t.length, r, i = "value" in Rn ? Rn.value : Rn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return M = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Vn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Hn() {
		return !0;
	}
	function N() {
		return !1;
	}
	function Un(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Hn : N, this.isPropagationStopped = N, this;
		}
		return D(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Hn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Hn);
			},
			persist: function() {},
			isPersistent: Hn
		}), t;
	}
	var Wn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Gn = Un(Wn), Kn = D({}, Wn, {
		view: 0,
		detail: 0
	}), qn = Un(Kn), Jn, P, Yn, Xn = D({}, Kn, {
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
		getModifierState: sr,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Yn && (Yn && e.type === "mousemove" ? (Jn = e.screenX - Yn.screenX, P = e.screenY - Yn.screenY) : P = Jn = 0, Yn = e), Jn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : P;
		}
	}), Zn = Un(Xn), Qn = Un(D({}, Xn, { dataTransfer: 0 })), $n = Un(D({}, Kn, { relatedTarget: 0 })), er = Un(D({}, Wn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), tr = Un(D({}, Wn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), nr = Un(D({}, Wn, { data: 0 })), rr = {
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
	}, ir = {
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
	}, ar = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function or(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = ar[e]) ? !!t[e] : !1;
	}
	function sr() {
		return or;
	}
	var cr = Un(D({}, Kn, {
		key: function(e) {
			if (e.key) {
				var t = rr[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Vn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? ir[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: sr,
		charCode: function(e) {
			return e.type === "keypress" ? Vn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Vn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), lr = Un(D({}, Xn, {
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
	})), ur = Un(D({}, Wn, { submitter: 0 })), dr = Un(D({}, Kn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: sr
	})), fr = Un(D({}, Wn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), pr = Un(D({}, Xn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), mr = Un(D({}, Wn, {
		newState: 0,
		oldState: 0,
		source: 0
	})), hr = [
		9,
		13,
		27,
		32
	], gr = Fn && "CompositionEvent" in window, _r = null;
	Fn && "documentMode" in document && (_r = document.documentMode);
	var vr = Fn && "TextEvent" in window && !_r, yr = Fn && (!gr || _r && 8 < _r && 11 >= _r), br = " ", xr = !1;
	function Sr(e, t) {
		switch (e) {
			case "keyup": return hr.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function Cr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var wr = !1;
	function Tr(e, t) {
		switch (e) {
			case "compositionend": return Cr(t);
			case "keypress": return t.which === 32 ? (xr = !0, br) : null;
			case "textInput": return e = t.data, e === br && xr ? null : e;
			default: return null;
		}
	}
	function Er(e, t) {
		if (wr) return e === "compositionend" || !gr && Sr(e, t) ? (e = Bn(), M = zn = Rn = null, wr = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return yr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var Dr = {
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
	function Or(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!Dr[e.type] : t === "textarea";
	}
	function kr(e, t, n, r) {
		kn ? An ? An.push(r) : An = [r] : kn = r, t = Zf(t, "onChange"), 0 < t.length && (n = new Gn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var Ar = null, jr = null;
	function Mr(e) {
		Wf(e, 0);
	}
	function Nr(e) {
		if (ln(Vt(e))) return e;
	}
	function Pr(e, t) {
		if (e === "change") return t;
	}
	var Fr = !1;
	if (Fn) {
		var Ir;
		if (Fn) {
			var Lr = "oninput" in document;
			if (!Lr) {
				var Rr = document.createElement("div");
				Rr.setAttribute("oninput", "return;"), Lr = typeof Rr.oninput == "function";
			}
			Ir = Lr;
		} else Ir = !1;
		Fr = Ir && (!document.documentMode || 9 < document.documentMode);
	}
	function zr() {
		Ar && (Ar.detachEvent("onpropertychange", Br), jr = Ar = null);
	}
	function Br(e) {
		if (e.propertyName === "value" && Nr(jr)) {
			var t = [];
			kr(t, jr, e, On(e)), Nn(Mr, t);
		}
	}
	function Vr(e, t, n) {
		e === "focusin" ? (zr(), Ar = t, jr = n, Ar.attachEvent("onpropertychange", Br)) : e === "focusout" && zr();
	}
	function Hr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return Nr(jr);
	}
	function Ur(e, t) {
		if (e === "click") return Nr(t);
	}
	function Wr(e, t) {
		if (e === "input" || e === "change") return Nr(t);
	}
	function Gr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Kr = typeof Object.is == "function" ? Object.is : Gr;
	function qr(e, t) {
		if (Kr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Ue.call(t, i) || !Kr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Jr(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function Yr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Xr(e, t) {
		var n = Yr(e);
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
			n = Yr(n);
		}
	}
	function Zr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Zr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Qr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Jr(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Jr(e.document);
		}
		return t;
	}
	function $r(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var ei = Fn && "documentMode" in document && 11 >= document.documentMode, ti = null, ni = null, ri = null, ii = !1;
	function ai(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		ii || ti == null || ti !== Jr(r) || (r = ti, "selectionStart" in r && $r(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), ri && qr(ri, r) || (ri = r, r = Zf(ni, "onSelect"), 0 < r.length && (t = new Gn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = ti)));
	}
	function oi(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var si = {
		animationend: oi("Animation", "AnimationEnd"),
		animationiteration: oi("Animation", "AnimationIteration"),
		animationstart: oi("Animation", "AnimationStart"),
		transitionrun: oi("Transition", "TransitionRun"),
		transitionstart: oi("Transition", "TransitionStart"),
		transitioncancel: oi("Transition", "TransitionCancel"),
		transitionend: oi("Transition", "TransitionEnd")
	}, ci = {}, li = {};
	Fn && (li = document.createElement("div").style, "AnimationEvent" in window || (delete si.animationend.animation, delete si.animationiteration.animation, delete si.animationstart.animation), "TransitionEvent" in window || delete si.transitionend.transition);
	function ui(e) {
		if (ci[e]) return ci[e];
		if (!si[e]) return e;
		var t = si[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in li) return ci[e] = t[n];
		return e;
	}
	var di = ui("animationend"), fi = ui("animationiteration"), pi = ui("animationstart"), mi = ui("transitionrun"), hi = ui("transitionstart"), gi = ui("transitioncancel"), _i = ui("transitionend"), vi = /* @__PURE__ */ new Map(), yi = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	yi.push("scrollEnd");
	function bi(e, t) {
		vi.set(e, t), qt(t, [e]);
	}
	var xi = 0;
	function Si(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = Cd.identifierPrefix;
		var n = xi++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function Ci(e) {
		if (e == null || typeof e == "string") return e;
		var t = null, n = jd;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = e[n[r]];
			if (i != null) {
				if (i === "none") return "none";
				t = t == null ? i : t + (" " + i);
			}
		}
		return t ?? e.default;
	}
	function wi(e, t) {
		return e = Ci(e), t = Ci(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
	}
	var F = typeof reportError == "function" ? reportError : function(e) {
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
	}, Ti = [], Ei = 0, Di = 0;
	function Oi() {
		for (var e = Ei, t = Di = Ei = 0; t < e;) {
			var n = Ti[t];
			Ti[t++] = null;
			var r = Ti[t];
			Ti[t++] = null;
			var i = Ti[t];
			Ti[t++] = null;
			var a = Ti[t];
			if (Ti[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Mi(n, i, a);
		}
	}
	function ki(e, t, n, r) {
		Ti[Ei++] = e, Ti[Ei++] = t, Ti[Ei++] = n, Ti[Ei++] = r, Di |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function Ai(e, t, n, r) {
		return ki(e, t, n, r), Ni(e);
	}
	function ji(e, t) {
		return ki(e, null, null, t), Ni(e);
	}
	function Mi(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - ot(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function Ni(e) {
		if (50 < Md) throw Md = 0, Nd = null, Error(i(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var Pi = {};
	function Fi(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function Ii(e, t, n, r) {
		return new Fi(e, t, n, r);
	}
	function Li(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Ri(e, t) {
		var n = e.alternate;
		return n === null ? (n = Ii(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 1206910976, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function zi(e, t) {
		e.flags &= 1206910978;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function Bi(e, t, n, r, a, o) {
		var s = 0;
		if (r = e, typeof r == "function") Li(r) && (s = 1);
		else if (typeof r == "string") s = Xm(e, n, Oe.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case de: return e = Ii(31, n, t, a), e.elementType = de, e.lanes = o, e;
			case ne: return Vi(n.children, a, o, t);
			case re:
				s = 8, a |= 24;
				break;
			case k: return e = Ii(12, n, t, a | 2), e.elementType = k, e.lanes = o, e;
			case se: return e = Ii(13, n, t, a), e.elementType = se, e.lanes = o, e;
			case ce: return e = Ii(19, n, t, a), e.elementType = ce, e.lanes = o, e;
			case fe:
			case me: return e = a | 32, e = Ii(30, n, t, e), e.elementType = me, e.lanes = o, e.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, e;
			default:
				if (typeof r == "object" && r) switch (r.$$typeof) {
					case ae:
						s = 10;
						break a;
					case ie:
						s = 9;
						break a;
					case oe:
						s = 11;
						break a;
					case le:
						s = 14;
						break a;
					case ue:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(i(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = Ii(s, n, t, a), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function Vi(e, t, n, r) {
		return e = Ii(7, e, r, t), e.lanes = n, e;
	}
	function Hi(e, t, n) {
		return e = Ii(6, e, null, t), e.lanes = n, e;
	}
	function Ui(e) {
		var t = Ii(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function Wi(e, t, n) {
		return t = Ii(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Gi = /* @__PURE__ */ new WeakMap();
	function Ki(e, t) {
		if (typeof e == "object" && e) {
			var n = Gi.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: He(t)
			}, Gi.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: He(t)
		};
	}
	var qi = [], Ji = 0, Yi = null, Xi = 0, Zi = [], Qi = 0, $i = null, ea = 1, ta = "";
	function na(e, t) {
		qi[Ji++] = Xi, qi[Ji++] = Yi, Yi = e, Xi = t;
	}
	function ra(e, t, n) {
		Zi[Qi++] = ea, Zi[Qi++] = ta, Zi[Qi++] = $i, $i = e;
		var r = ea;
		e = ta;
		var i = 32 - ot(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - ot(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, ea = 1 << 32 - ot(t) + i | n << i | r, ta = a + e;
		} else ea = 1 << a | n << i | r, ta = e;
	}
	function ia(e) {
		e.return !== null && (na(e, 1), ra(e, 1, 0));
	}
	function I(e) {
		for (; e === Yi;) Yi = qi[--Ji], qi[Ji] = null, Xi = qi[--Ji], qi[Ji] = null;
		for (; e === $i;) $i = Zi[--Qi], Zi[Qi] = null, ta = Zi[--Qi], Zi[Qi] = null, ea = Zi[--Qi], Zi[Qi] = null;
	}
	function aa(e, t) {
		Zi[Qi++] = ea, Zi[Qi++] = ta, Zi[Qi++] = $i, ea = t.id, ta = t.overflow, $i = e;
	}
	var oa = null, sa = null, L = !1, ca = null, la = !1, ua = Error(i(519));
	function da(e) {
		throw _a(Ki(Error(i(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), ua;
	}
	function fa(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[At] = e, t[jt] = r, n) {
			case "dialog":
				Y("cancel", t), Y("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				Y("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < Hf.length; n++) Y(Hf[n], t);
				break;
			case "source":
				Y("error", t);
				break;
			case "img":
			case "image":
			case "link":
				Y("error", t), Y("load", t);
				break;
			case "details":
				Y("toggle", t);
				break;
			case "input":
				Y("invalid", t), pn(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Y("invalid", t);
				break;
			case "textarea": Y("invalid", t), _n(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || rp(t.textContent, n) ? (r.popover != null && (Y("beforetoggle", t), Y("toggle", t)), r.onScroll != null && Y("scroll", t), r.onScrollEnd != null && Y("scrollend", t), r.onClick != null && (t.onclick = En), t = !0) : t = !1, t || da(e, !0);
	}
	function pa(e) {
		for (oa = e.return; oa;) switch (oa.tag) {
			case 5:
			case 31:
			case 13:
				la = !1;
				return;
			case 27:
			case 3:
				la = !0;
				return;
			default: oa = oa.return;
		}
	}
	function ma(e) {
		if (e !== oa) return !1;
		if (!L) return pa(e), L = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || gp(e.type, e.memoizedProps)), n = !n), n && sa && da(e), pa(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			sa = mm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			sa = mm(e);
		} else t === 27 ? (t = sa, Tp(e.type) ? (e = pm, pm = null, sa = e) : sa = t) : sa = oa ? fm(e.stateNode.nextSibling) : null;
		return !0;
	}
	function ha() {
		sa = oa = null, L = !1;
	}
	function ga() {
		var e = ca;
		return e !== null && (hd === null ? hd = e : hd.push.apply(hd, e), ca = null), e;
	}
	function _a(e) {
		ca === null ? ca = [e] : ca.push(e);
	}
	var va = Te(null), ya = null, ba = null;
	function xa(e, t, n) {
		De(va, t._currentValue), t._currentValue = n;
	}
	function Sa(e) {
		e._currentValue = va.current, Ee(va);
	}
	function Ca(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function wa(e, t, n, r) {
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
						o.lanes |= n, c = o.alternate, c !== null && (c.lanes |= n), Ca(o.return, n, e), r || (s = null);
						break a;
					}
					o = c.next;
				}
			} else if (a.tag === 18) {
				if (s = a.return, s === null) throw Error(i(341));
				s.lanes |= n, o = s.alternate, o !== null && (o.lanes |= n), Ca(s, n, e), s = null;
			} else a.tag === 13 && a.memoizedState !== null && a.memoizedState.dehydrated === null ? (a.lanes |= n, s = a.alternate, s !== null && (s.lanes |= n), Ca(a.return, n, e), s = a.child, s = s === null ? null : s.sibling) : s = a.child;
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
	function Ta(e, t, n, r) {
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
					Kr(a.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (a === je.current) {
				if (s = a.alternate, s === null) throw Error(i(387));
				s.memoizedState.memoizedState !== a.memoizedState.memoizedState && (e === null ? e = [uh] : e.push(uh));
			}
			a = a.return;
		}
		return e !== null && wa(t, e, n, r), t.flags |= 262144, e !== null;
	}
	function Ea(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Kr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function Da(e) {
		ya = e, ba = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function Oa(e) {
		return Aa(ya, e);
	}
	function ka(e, t) {
		return ya === null && Da(e), Aa(e, t);
	}
	function Aa(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, ba === null) {
			if (e === null) throw Error(i(308));
			ba = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else ba = ba.next = t;
		return n;
	}
	var ja = typeof AbortController < "u" ? AbortController : function() {
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
	}, Ma = t.unstable_scheduleCallback, Na = t.unstable_NormalPriority, Pa = {
		$$typeof: ae,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function Fa() {
		return {
			controller: new ja(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function Ia(e) {
		e.refCount--, e.refCount === 0 && Ma(Na, function() {
			e.controller.abort();
		});
	}
	function La(e, t) {
		if (e.pendingLanes & 4194048) {
			var n = e.transitionTypes;
			for (n === null && (n = e.transitionTypes = []), e = 0; e < t.length; e++) {
				var r = t[e];
				n.indexOf(r) === -1 && n.push(r);
			}
		}
	}
	var Ra = null;
	function za(e) {
		var t = e.transitionTypes;
		return e.transitionTypes = null, t;
	}
	var Ba = null, Va = 0, Ha = 0, Ua = null;
	function Wa(e, t) {
		if (Ba === null) {
			var n = Ba = [];
			Va = 0, Ha = Lf(), Ua = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return Va++, t.then(Ga, Ga), t;
	}
	function Ga() {
		if (--Va === 0 && (Ra = null, Ba !== null)) {
			Ua !== null && (Ua.status = "fulfilled");
			var e = Ba;
			Ba = null, Ha = 0, Ua = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function Ka(e, t) {
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
	var qa = A.S;
	A.S = function(e, t) {
		if (vd = Je(), typeof t == "object" && t && typeof t.then == "function" && Wa(e, t), Ra !== null) for (var n = Cf; n !== null;) La(n, Ra), n = n.next;
		if (n = e.types, n !== null) {
			for (var r = Cf; r !== null;) La(r, n), r = r.next;
			if (Ha !== 0) {
				r = Ra, r === null && (r = Ra = []);
				for (var i = 0; i < n.length; i++) {
					var a = n[i];
					r.indexOf(a) === -1 && r.push(a);
				}
			}
		}
		qa !== null && qa(e, t);
	};
	var Ja = Te(null);
	function Ya() {
		var e = Ja.current;
		return e === null ? nd.pooledCache : e;
	}
	function Xa(e, t) {
		t === null ? De(Ja, Ja.current) : De(Ja, t.pool);
	}
	function Za() {
		var e = Ya();
		return e === null ? null : {
			parent: Pa._currentValue,
			pool: e
		};
	}
	var Qa = Error(i(460)), $a = Error(i(474)), R = Error(i(542)), eo = { then: function() {} };
	function to(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function no(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(En, En), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, oo(e), e === void 0 && !("reason" in t) ? Error(i(600)) : e;
			default:
				if (typeof t.status == "string") t.then(En, En);
				else {
					if (e = nd, e !== null && 100 < e.shellSuspendCounter) throw Error(i(482));
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
					case "rejected": throw e = t.reason, oo(e), e;
				}
				throw io = t, Qa;
		}
	}
	function ro(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (io = e, Qa) : e;
		}
	}
	var io = null;
	function ao() {
		if (io === null) throw Error(i(459));
		var e = io;
		return io = null, e;
	}
	function oo(e) {
		if (e === Qa || e === R) throw Error(i(483));
	}
	var so = null, co = 0;
	function lo(e) {
		var t = co;
		return co += 1, so === null && (so = []), no(so, e, t);
	}
	function uo(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function fo(e, t) {
		throw t.$$typeof === ee ? Error(i(525)) : (e = Object.prototype.toString.call(t), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function po(e) {
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
			return e = Ri(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 134217730, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 134217730), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Hi(n, e.mode, r), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var i = n.type;
			return i === ne ? (e = d(e, t, n.props.children, r, n.key), uo(e, n), e) : t !== null && (t.elementType === i || typeof i == "object" && i && i.$$typeof === ue && ro(i) === t.type) ? (t = a(t, n.props), uo(t, n), t.return = e, t) : (t = Bi(n.type, n.key, n.props, null, e.mode, r), uo(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = Wi(n, e.mode, r), t.return = e, t) : (t = a(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, i) {
			return t === null || t.tag !== 7 ? (t = Vi(n, e.mode, r, i), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Hi("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case O: return n = Bi(t.type, t.key, t.props, null, e.mode, n), uo(n, t), n.return = e, n;
					case te: return t = Wi(t, e.mode, n), t.return = e, t;
					case ue: return t = ro(t), f(e, t, n);
				}
				if (be(t) || _e(t)) return t = Vi(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, lo(t), n);
				if (t.$$typeof === ae) return f(e, ka(e, t), n);
				fo(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case O: return n.key === i ? l(e, t, n, r) : null;
					case te: return n.key === i ? u(e, t, n, r) : null;
					case ue: return n = ro(n), p(e, t, n, r);
				}
				if (be(n) || _e(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, lo(n), r);
				if (n.$$typeof === ae) return p(e, t, ka(e, n), r);
				fo(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case O: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case te: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case ue: return r = ro(r), m(e, t, n, r, i);
				}
				if (be(r) || _e(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, lo(r), i);
				if (r.$$typeof === ae) return m(e, t, n, ka(t, r), i);
				fo(t, r);
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
			if (h === s.length) return n(i, d), L && na(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return L && na(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), L && na(i, h), l;
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
			if (v.done) return n(a, h), L && na(a, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(a, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return L && na(a, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, a, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(a, e);
			}), L && na(a, g), u;
		}
		function _(e, r, o, c) {
			if (typeof o == "object" && o && o.type === ne && o.key === null && o.props.ref === void 0 && (o = o.props.children), typeof o == "object" && o) {
				switch (o.$$typeof) {
					case O:
						a: {
							for (var l = o.key; r !== null;) {
								if (r.key === l) {
									if (l = o.type, l === ne) {
										if (r.tag === 7) {
											n(e, r.sibling), c = a(r, o.props.children), uo(c, o), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === ue && ro(l) === r.type) {
										n(e, r.sibling), c = a(r, o.props), uo(c, o), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							o.type === ne ? (c = Vi(o.props.children, e.mode, c, o.key), uo(c, o), c.return = e, e = c) : (c = Bi(o.type, o.key, o.props, null, e.mode, c), uo(c, o), c.return = e, e = c);
						}
						return s(e);
					case te:
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
							c = Wi(o, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case ue: return o = ro(o), _(e, r, o, c);
				}
				if (be(o)) return h(e, r, o, c);
				if (_e(o)) {
					if (l = _e(o), typeof l != "function") throw Error(i(150));
					return o = l.call(o), g(e, r, o, c);
				}
				if (typeof o.then == "function") return _(e, r, lo(o), c);
				if (o.$$typeof === ae) return _(e, r, ka(e, o), c);
				fo(e, o);
			}
			return typeof o == "string" && o !== "" || typeof o == "number" || typeof o == "bigint" ? (o = "" + o, r !== null && r.tag === 6 ? (n(e, r.sibling), c = a(r, o), c.return = e, e = c) : (n(e, r), c = Hi(o, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				co = 0;
				var i = _(e, t, n, r);
				return so = null, i;
			} catch (t) {
				if (t === Qa || t === R) throw t;
				var a = Ii(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var mo = po(!0), ho = po(!1), go = !1;
	function _o(e) {
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
	function vo(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function yo(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function bo(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, td & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = Ni(e), Mi(e, null, n), t;
		}
		return ki(e, r, t, n), Ni(e);
	}
	function xo(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Ct(e, n);
		}
	}
	function So(e, t) {
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
	var Co = !1;
	function wo() {
		if (Co) {
			var e = Ua;
			if (e !== null) throw e;
		}
	}
	function To(e, t, n, r) {
		Co = !1;
		var i = e.updateQueue;
		go = !1;
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
				if (p ? (K & f) === f : (r & f) === f) {
					f !== 0 && f === Ha && (Co = !0), u !== null && (u = u.next = {
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
							case 2: go = !0;
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
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), q |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function Eo(e, t) {
		if (typeof e != "function") throw Error(i(191, e));
		e.call(t);
	}
	function Do(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) Eo(n[e], t);
	}
	var Oo = Te(null), ko = Te(0);
	function Ao(e, t) {
		e = cd, De(ko, e), De(Oo, t), cd = e | t.baseLanes;
	}
	function jo() {
		De(ko, cd), De(Oo, Oo.current);
	}
	function Mo() {
		cd = ko.current, Ee(Oo), Ee(ko);
	}
	var No = Te(null), Po = null;
	function Fo(e) {
		var t = e.alternate;
		De(Bo, Bo.current & 1), De(No, e), Po === null && (t === null || Oo.current !== null || t.memoizedState !== null) && (Po = e);
	}
	function Io(e) {
		De(Bo, Bo.current), De(No, e), Po === null && (Po = e);
	}
	function Lo(e) {
		e.tag === 22 ? (De(Bo, Bo.current), De(No, e), Po === null && (Po = e)) : Ro();
	}
	function Ro() {
		De(Bo, Bo.current), De(No, No.current);
	}
	function zo(e) {
		Ee(No), Po === e && (Po = null), Ee(Bo);
	}
	var Bo = Te(0);
	function Vo(e, t) {
		De(No, No.current), De(Bo, t);
	}
	function Ho(e) {
		Ee(Bo), Ee(No), Po === e && (Po = null);
	}
	function Uo(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || lm(n) || um(n))) return t;
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
	var Wo = 0, z = null, Go = null, Ko = null, qo = !1, Jo = !1, Yo = !1, Xo = 0, Zo = 0, Qo = null, $o = 0;
	function es() {
		throw Error(i(321));
	}
	function ts(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Kr(e[n], t[n])) return !1;
		return !0;
	}
	function ns(e, t, n, r, i, a) {
		return Wo = a, z = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, A.H = e === null || e.memoizedState === null ? _c : vc, Yo = !1, a = n(r, i), Yo = !1, Jo && (a = is(t, n, r, i)), rs(e), a;
	}
	function rs(e) {
		A.H = gc;
		var t = Go !== null && Go.next !== null;
		if (Wo = 0, Ko = Go = z = null, qo = !1, Zo = 0, Qo = null, t) throw Error(i(300));
		e === null || Fc || (e = e.dependencies, e !== null && Ea(e) && (Fc = !0));
	}
	function is(e, t, n, r) {
		z = e;
		var a = 0;
		do {
			if (Jo && (Qo = null), Zo = 0, Jo = !1, 25 <= a) throw Error(i(301));
			if (a += 1, Ko = Go = null, e.updateQueue != null) {
				var o = e.updateQueue;
				o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
			}
			A.H = yc, o = t(n, r);
		} while (Jo);
		return o;
	}
	function as() {
		var e = A.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? fs(t) : t, e = e.useState()[0], (Go === null ? null : Go.memoizedState) !== e && (z.flags |= 1024), t;
	}
	function os() {
		var e = Xo !== 0;
		return Xo = 0, e;
	}
	function ss(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function cs(e) {
		if (qo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			qo = !1;
		}
		Wo = 0, Ko = Go = z = null, Jo = !1, Zo = Xo = 0, Qo = null;
	}
	function ls() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return Ko === null ? z.memoizedState = Ko = e : Ko = Ko.next = e, Ko;
	}
	function us() {
		if (Go === null) {
			var e = z.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = Go.next;
		var t = Ko === null ? z.memoizedState : Ko.next;
		if (t !== null) Ko = t, Go = e;
		else {
			if (e === null) throw z.alternate === null ? Error(i(467)) : Error(i(310));
			Go = e, e = {
				memoizedState: Go.memoizedState,
				baseState: Go.baseState,
				baseQueue: Go.baseQueue,
				queue: Go.queue,
				next: null
			}, Ko === null ? z.memoizedState = Ko = e : Ko = Ko.next = e;
		}
		return Ko;
	}
	function ds() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function fs(e) {
		var t = Zo;
		return Zo += 1, Qo === null && (Qo = []), e = no(Qo, e, t), t = z, (Ko === null ? t.memoizedState : Ko.next) === null && (t = t.alternate, A.H = t === null || t.memoizedState === null ? _c : vc), e;
	}
	function ps(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return fs(e);
			if (e.$$typeof === he) return;
			if (e.$$typeof === ae) return Oa(e);
		}
		throw Error(i(438, String(e)));
	}
	function ms(e) {
		var t = null, n = z.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = z.alternate;
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
		}, n === null && (n = ds(), z.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = pe;
		return t.index++, n;
	}
	function hs(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function gs(e) {
		return _s(us(), Go, e);
	}
	function _s(e, t, n) {
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
				if (f === u.lane ? (Wo & f) === f : (K & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === Ha && (d = !0);
					else if ((Wo & p) === p) {
						u = u.next, p === Ha && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = o) : l = l.next = f, z.lanes |= p, q |= p;
					f = u.action, Yo && n(o, f), o = u.hasEagerState ? u.eagerState : n(o, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = o) : l = l.next = p, z.lanes |= f, q |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = o : l.next = c, !Kr(o, e.memoizedState) && (Fc = !0, d && (n = Ua, n !== null))) throw n;
			e.memoizedState = o, e.baseState = s, e.baseQueue = l, r.lastRenderedState = o;
		}
		return a === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function vs(e) {
		var t = us(), n = t.queue;
		if (n === null) throw Error(i(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, a = n.pending, o = t.memoizedState;
		if (a !== null) {
			n.pending = null;
			var s = a = a.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== a);
			Kr(o, t.memoizedState) || (Fc = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function ys(e, t, n) {
		var r = z, a = us(), o = L;
		if (o) {
			if (n === void 0) throw Error(i(407));
			n = n();
		} else n = t();
		var s = !Kr((Go || a).memoizedState, n);
		if (s && (a.memoizedState = n, Fc = !0), a = a.queue, Ws(Ss.bind(null, r, a, e), [e]), e = a.getSnapshot !== t || s || Ko !== null && !!(Ko.memoizedState.tag & 1), zs(e ? 9 : 8, { destroy: void 0 }, xs.bind(null, r, a, n, t), null), e) {
			if (r.flags |= 2048, nd === null) throw Error(i(349));
			o || Wo & 127 || bs(r, t, n);
		}
		return n;
	}
	function bs(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = z.updateQueue, t === null ? (t = ds(), z.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function xs(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Cs(t) && ws(e);
	}
	function Ss(e, t, n) {
		return n(function() {
			Cs(t) && ws(e);
		});
	}
	function Cs(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Kr(e, n);
		} catch {
			return !0;
		}
	}
	function ws(e) {
		var t = ji(e, 2);
		t !== null && Ld(t, e, 2);
	}
	function Ts(e) {
		var t = ls();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), Yo) {
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
			lastRenderedReducer: hs,
			lastRenderedState: e
		}, t;
	}
	function Es(e, t, n, r) {
		return e.baseState = n, _s(e, Go, typeof r == "function" ? r : hs);
	}
	function Ds(e, t, n, r, a) {
		if (pc(e)) throw Error(i(485));
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
			A.T === null ? o.isTransition = !1 : n(!0), r(o), n = t.pending, n === null ? (o.next = t.pending = o, Os(t, o)) : (o.next = n.next, t.pending = n.next = o);
		}
	}
	function Os(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = A.T, o = {};
			o.types = a === null ? null : a.types, A.T = o;
			try {
				var s = n(i, r), c = A.S;
				c !== null && c(o, s), ks(e, t, s);
			} catch (n) {
				js(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), A.T = a;
			}
		} else try {
			a = n(i, r), ks(e, t, a);
		} catch (n) {
			js(e, t, n);
		}
	}
	function ks(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			As(e, t, n);
		}, function(n) {
			return js(e, t, n);
		}) : As(e, t, n);
	}
	function As(e, t, n) {
		t.status = "fulfilled", t.value = n, Ms(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Os(e, n)));
	}
	function js(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, Ms(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function Ms(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function Ns(e, t) {
		return t;
	}
	function Ps(e, t) {
		if (L) {
			var n = nd.formState;
			if (n !== null) {
				a: {
					var r = z;
					if (L) {
						if (sa) {
							b: {
								for (var i = sa, a = la; i.nodeType !== 8;) if (!a || (i = fm(i.nextSibling), i === null)) {
									i = null;
									break b;
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								sa = fm(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						da(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = ls(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Ns,
			lastRenderedState: t
		}, n.queue = r, n = uc.bind(null, z, r), r.dispatch = n, r = Ts(!1), a = fc.bind(null, z, !1, r.queue), r = ls(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Ds.bind(null, z, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function Fs(e) {
		return Is(us(), Go, e);
	}
	function Is(e, t, n) {
		if (t = _s(e, t, Ns)[0], e = gs(hs)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = fs(t);
		} catch (e) {
			throw e === Qa ? R : e;
		}
		else r = t;
		t = us();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (z.flags |= 2048, zs(9, { destroy: void 0 }, Ls.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Ls(e, t) {
		e.action = t;
	}
	function Rs(e) {
		var t = us(), n = Go;
		if (n !== null) return Is(t, n, e);
		us(), t = t.memoizedState, n = us();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function zs(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = z.updateQueue, t === null && (t = ds(), z.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function Bs() {
		return us().memoizedState;
	}
	function Vs(e, t, n, r) {
		var i = ls();
		z.flags |= e, i.memoizedState = zs(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function Hs(e, t, n, r) {
		var i = us();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		Go !== null && r !== null && ts(r, Go.memoizedState.deps) ? i.memoizedState = zs(t, a, n, r) : (z.flags |= e, i.memoizedState = zs(1 | t, a, n, r));
	}
	function Us(e, t) {
		Vs(8390656, 8, e, t);
	}
	function Ws(e, t) {
		Hs(2048, 8, e, t);
	}
	function Gs(e) {
		z.flags |= 4;
		var t = z.updateQueue;
		if (t === null) t = ds(), z.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function Ks(e) {
		var t = us().memoizedState;
		return Gs({
			ref: t,
			nextImpl: e
		}), function() {
			if (td & 2) throw Error(i(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function qs(e, t) {
		return Hs(4, 2, e, t);
	}
	function Js(e, t) {
		return Hs(4, 4, e, t);
	}
	function Ys(e, t) {
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
	function Xs(e, t, n) {
		n = n == null ? null : n.concat([e]), Hs(4, 4, Ys.bind(null, t, e), n);
	}
	function Zs() {}
	function Qs(e, t) {
		var n = us();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && ts(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function $s(e, t) {
		var n = us();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && ts(t, r[1])) return r[0];
		if (r = e(), Yo) {
			at(!0);
			try {
				e();
			} finally {
				at(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function ec(e, t, n) {
		return n === void 0 || Wo & 1073741824 && !(K & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Fd(), z.lanes |= e, q |= e, n);
	}
	function tc(e, t, n, r) {
		return Kr(n, t) ? n : Oo.current === null ? !(Wo & 106) || Wo & 1073741824 && !(K & 261930) ? (Fc = !0, e.memoizedState = n) : (e = Fd(), z.lanes |= e, q |= e, t) : (e = ec(e, n, r), Kr(e, t) || (Fc = !0), e);
	}
	function B(e, t, n, r, i) {
		var a = xe.p;
		xe.p = a !== 0 && 8 > a ? a : 8;
		var o = A.T, s = {};
		s.types = o === null ? null : o.types, A.T = s, fc(e, !1, t, n);
		try {
			var c = i(), l = A.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? dc(e, t, Ka(c, r), Pd(e)) : dc(e, t, r, Pd(e));
		} catch (n) {
			dc(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, Pd());
		} finally {
			xe.p = a, o !== null && s.types !== null && (o.types = s.types), A.T = o;
		}
	}
	function nc() {}
	function rc(e, t, n, r) {
		if (e.tag !== 5) throw Error(i(476));
		var a = ic(e).queue;
		B(e, a, t, Se, n === null ? nc : function() {
			return ac(e), n(r);
		});
	}
	function ic(e) {
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
				lastRenderedReducer: hs,
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
				lastRenderedReducer: hs,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function ac(e) {
		var t = ic(e);
		t.next === null && (t = e.alternate.memoizedState), dc(e, t.next.queue, {}, Pd());
	}
	function oc() {
		return Oa(uh);
	}
	function V() {
		return us().memoizedState;
	}
	function sc() {
		return us().memoizedState;
	}
	function cc(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = Pd();
					e = yo(n);
					var r = bo(t, e, n);
					r !== null && (Ld(r, t, n), xo(r, t, n)), t = { cache: Fa() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function lc(e, t, n) {
		var r = Pd();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, pc(e) ? mc(t, n) : (n = Ai(e, t, n, r), n !== null && (Ld(n, e, r), hc(n, t, r)));
	}
	function uc(e, t, n) {
		dc(e, t, n, Pd());
	}
	function dc(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (pc(e)) mc(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Kr(s, o)) return ki(e, t, i, 0), nd === null && Oi(), !1;
			} catch {}
			if (n = Ai(e, t, i, r), n !== null) return Ld(n, e, r), hc(n, t, r), !0;
		}
		return !1;
	}
	function fc(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: Lf(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, pc(e)) {
			if (t) throw Error(i(479));
		} else t = Ai(e, n, r, 2), t !== null && Ld(t, e, 2);
	}
	function pc(e) {
		var t = e.alternate;
		return e === z || t !== null && t === z;
	}
	function mc(e, t) {
		Jo = qo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function hc(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Ct(e, n);
		}
	}
	var gc = {
		readContext: Oa,
		use: ps,
		useCallback: es,
		useContext: es,
		useEffect: es,
		useImperativeHandle: es,
		useLayoutEffect: es,
		useInsertionEffect: es,
		useMemo: es,
		useReducer: es,
		useRef: es,
		useState: es,
		useDebugValue: es,
		useDeferredValue: es,
		useTransition: es,
		useSyncExternalStore: es,
		useId: es,
		useHostTransitionStatus: es,
		useFormState: es,
		useActionState: es,
		useOptimistic: es,
		useMemoCache: es,
		useCacheRefresh: es,
		useEffectEvent: es
	}, _c = {
		readContext: Oa,
		use: ps,
		useCallback: function(e, t) {
			return ls().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Oa,
		useEffect: Us,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), Vs(4194308, 4, Ys.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return Vs(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			Vs(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = ls();
			t = t === void 0 ? null : t;
			var r = e();
			if (Yo) {
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
			var r = ls();
			if (n !== void 0) {
				var i = n(t);
				if (Yo) {
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
			}, r.queue = e, e = e.dispatch = lc.bind(null, z, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = ls();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = Ts(e);
			var t = e.queue, n = uc.bind(null, z, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: Zs,
		useDeferredValue: function(e, t) {
			return ec(ls(), e, t);
		},
		useTransition: function() {
			var e = Ts(!1);
			return e = B.bind(null, z, e.queue, !0, !1), ls().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = z, a = ls();
			if (L) {
				if (n === void 0) throw Error(i(407));
				n = n();
			} else {
				if (n = t(), nd === null) throw Error(i(349));
				K & 127 || bs(r, t, n);
			}
			a.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return a.queue = o, Us(Ss.bind(null, r, o, e), [e]), r.flags |= 2048, zs(9, { destroy: void 0 }, xs.bind(null, r, o, n, t), null), n;
		},
		useId: function() {
			var e = ls(), t = nd.identifierPrefix;
			if (L) {
				var n = ta, r = ea;
				n = (r & ~(1 << 32 - ot(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Xo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = $o++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: oc,
		useFormState: Ps,
		useActionState: Ps,
		useOptimistic: function(e) {
			var t = ls();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = fc.bind(null, z, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: ms,
		useCacheRefresh: function() {
			return ls().memoizedState = cc.bind(null, z);
		},
		useEffectEvent: function(e) {
			var t = ls(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (td & 2) throw Error(i(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, vc = {
		readContext: Oa,
		use: ps,
		useCallback: Qs,
		useContext: Oa,
		useEffect: Ws,
		useImperativeHandle: Xs,
		useInsertionEffect: qs,
		useLayoutEffect: Js,
		useMemo: $s,
		useReducer: gs,
		useRef: Bs,
		useState: function() {
			return gs(hs);
		},
		useDebugValue: Zs,
		useDeferredValue: function(e, t) {
			return tc(us(), Go.memoizedState, e, t);
		},
		useTransition: function() {
			var e = gs(hs)[0], t = us().memoizedState;
			return [typeof e == "boolean" ? e : fs(e), t];
		},
		useSyncExternalStore: ys,
		useId: V,
		useHostTransitionStatus: oc,
		useFormState: Fs,
		useActionState: Fs,
		useOptimistic: function(e, t) {
			return Es(us(), Go, e, t);
		},
		useMemoCache: ms,
		useCacheRefresh: sc,
		useEffectEvent: Ks
	}, yc = {
		readContext: Oa,
		use: ps,
		useCallback: Qs,
		useContext: Oa,
		useEffect: Ws,
		useImperativeHandle: Xs,
		useInsertionEffect: qs,
		useLayoutEffect: Js,
		useMemo: $s,
		useReducer: vs,
		useRef: Bs,
		useState: function() {
			return vs(hs);
		},
		useDebugValue: Zs,
		useDeferredValue: function(e, t) {
			var n = us();
			return Go === null ? ec(n, e, t) : tc(n, Go.memoizedState, e, t);
		},
		useTransition: function() {
			var e = vs(hs)[0], t = us().memoizedState;
			return [typeof e == "boolean" ? e : fs(e), t];
		},
		useSyncExternalStore: ys,
		useId: V,
		useHostTransitionStatus: oc,
		useFormState: Rs,
		useActionState: Rs,
		useOptimistic: function(e, t) {
			var n = us();
			return Go === null ? (n.baseState = e, [e, n.queue.dispatch]) : Es(n, Go, e, t);
		},
		useMemoCache: ms,
		useCacheRefresh: sc,
		useEffectEvent: Ks
	};
	function bc(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : D({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var xc = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = Pd(), i = yo(r);
			i.payload = t, n != null && (i.callback = n), t = bo(e, i, r), t !== null && (Ld(t, e, r), xo(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = Pd(), i = yo(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = bo(e, i, r), t !== null && (Ld(t, e, r), xo(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = Pd(), r = yo(n);
			r.tag = 2, t != null && (r.callback = t), t = bo(e, r, n), t !== null && (Ld(t, e, n), xo(t, e, n));
		}
	};
	function Sc(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !qr(n, r) || !qr(i, a) : !0;
	}
	function Cc(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && xc.enqueueReplaceState(t, t.state, null);
	}
	function wc(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = D({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Tc(e) {
		F(e);
	}
	function Ec(e) {
		console.error(e);
	}
	function Dc(e) {
		F(e);
	}
	function Oc(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function kc(e, t, n) {
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
	function Ac(e, t, n) {
		return n = yo(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Oc(e, t);
		}, n;
	}
	function jc(e) {
		return e = yo(e), e.tag = 3, e;
	}
	function Mc(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				kc(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			kc(t, n, r), typeof i != "function" && (xd === null ? xd = /* @__PURE__ */ new Set([this]) : xd.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Nc(e, t, n, r, a) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Ta(t, n, a, !0), n = No.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13:
					case 19: return Po === null ? Yd() : n.alternate === null && ld === 0 && (ld = 3), n.flags &= -257, n.flags |= 65536, n.lanes = a, r === eo ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), _f(e, r, a)), !1;
					case 22: return n.flags |= 65536, r === eo ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), _f(e, r, a)), !1;
				}
				throw Error(i(435, n.tag));
			}
			return _f(e, r, a), Yd(), !1;
		}
		if (L) return t = No.current, t === null ? (r !== ua && (t = Error(i(423), { cause: r }), _a(Ki(t, n))), e = e.current.alternate, e.flags |= 65536, a &= -a, e.lanes |= a, r = Ki(r, n), a = Ac(e.stateNode, r, a), So(e, a), ld !== 4 && (ld = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = a, r !== ua && (e = Error(i(422), { cause: r }), _a(Ki(e, n)))), !1;
		var o = Error(i(520), { cause: r });
		if (o = Ki(o, n), md === null ? md = [o] : md.push(o), ld !== 4 && (ld = 2), t === null) return !0;
		r = Ki(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = a & -a, n.lanes |= e, e = Ac(n.stateNode, r, e), So(n, e), !1;
				case 1:
					if (t = n.type, o = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (xd === null || !xd.has(o)))) return n.flags |= 65536, a &= -a, n.lanes |= a, a = jc(a), Mc(a, e, n, r), So(n, a), !1;
					break;
				case 22: if (n.memoizedState !== null) return n.flags |= 65536, !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Pc = Error(i(461)), Fc = !1;
	function Ic(e, t, n, r) {
		t.child = e === null ? ho(t, null, n, r) : mo(t, e.child, n, r);
	}
	function Lc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Da(t), r = ns(e, t, n, o, a, i), s = os(), e !== null && !Fc ? (ss(e, t, i), ul(e, t, i)) : (L && s && ia(t), t.flags |= 1, Ic(e, t, r, i), t.child);
	}
	function Rc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Li(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, zc(e, t, a, r, i)) : (e = Bi(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !U(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? qr : n, n(o, r) && e.ref === t.ref) return ul(e, t, i);
		}
		return t.flags |= 1, e = Ri(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function zc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (qr(a, r) && e.ref === t.ref) {
				if (Fc = !1, t.pendingProps = r = a, U(e, i)) e.flags & 131072 && (Fc = !0);
				else return t.lanes = e.lanes, ul(e, t, i);
			}
		}
		return Kc(e, t, n, r, i);
	}
	function Bc(e, t, n, r) {
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
				return Hc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Xa(t, a === null ? null : a.cachePool), a === null ? jo() : Ao(t, a), Lo(t);
			else return r = t.lanes = 536870912, Hc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Xa(t, null), jo(), Ro()) : (Xa(t, a.cachePool), Ao(t, a), Ro(), t.memoizedState = null);
		return Ic(e, t, i, n), t.child;
	}
	function Vc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function Hc(e, t, n, r, i) {
		var a = Ya();
		return a = a === null ? null : {
			parent: Pa._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Xa(t, null), jo(), Lo(t), e !== null && Ta(e, t, r, !0), t.childLanes = i, null;
	}
	function Uc(e, t) {
		return t = tl({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Wc(e, t, n) {
		return mo(t, e.child, null, n), e = Uc(t, t.pendingProps), e.flags |= 2, zo(t), t.memoizedState = null, e;
	}
	function Gc(e, t, n) {
		var r = t.pendingProps, a = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (L) {
				if (r.mode === "hidden") return e = Uc(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, Vc(null, e);
				if (Io(t), (e = sa) ? (e = cm(e, la), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: $i === null ? null : {
						id: ea,
						overflow: ta
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ui(e), n.return = t, t.child = n, oa = t, sa = null)) : e = null, e === null) throw da(t);
				return t.lanes = 536870912, null;
			}
			return Uc(t, r);
		}
		var o = e.memoizedState;
		if (o !== null) {
			var s = o.dehydrated;
			if (Io(t), a) {
				if (t.flags & 256) t.flags &= -257, t = Wc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(i(558));
			} else if (Fc || Ta(e, t, n, !1), a = (n & e.childLanes) !== 0, Fc || a) {
				if (Oo.current === null) {
					if (r = nd, r !== null && (s = wt(r, n), s !== 0 && s !== o.retryLane)) throw o.retryLane = s, ji(e, s), Ld(r, e, s), Pc;
					Yd();
				}
				t = Wc(e, t, n);
			} else e = o.treeContext, sa = fm(s.nextSibling), oa = t, L = !0, ca = null, la = !1, e !== null && aa(t, e), t = Uc(t, r), t.flags |= 134221824;
			return t;
		}
		return e = Ri(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function H(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(i(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function Kc(e, t, n, r, i) {
		return Da(t), n = ns(e, t, n, r, void 0, i), r = os(), e !== null && !Fc ? (ss(e, t, i), ul(e, t, i)) : (L && r && ia(t), t.flags |= 1, Ic(e, t, n, i), t.child);
	}
	function qc(e, t, n, r, i, a) {
		return Da(t), t.updateQueue = null, n = is(t, r, n, i), rs(e), r = os(), e !== null && !Fc ? (ss(e, t, a), ul(e, t, a)) : (L && r && ia(t), t.flags |= 1, Ic(e, t, n, a), t.child);
	}
	function Jc(e, t, n, r, i) {
		if (Da(t), t.stateNode === null) {
			var a = Pi, o = n.contextType;
			typeof o == "object" && o && (a = Oa(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = xc, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, _o(t), o = n.contextType, a.context = typeof o == "object" && o ? Oa(o) : Pi, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (bc(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && xc.enqueueReplaceState(a, a.state, null), To(t, r, a, i), wo(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = wc(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = Pi, typeof u == "object" && u && (o = Oa(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && Cc(t, a, r, o), go = !1;
			var f = t.memoizedState;
			a.state = f, To(t, r, a, i), wo(), l = t.memoizedState, s || f !== l || go ? (typeof d == "function" && (bc(t, n, d, r), l = t.memoizedState), (c = go || Sc(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, vo(e, t), o = t.memoizedProps, u = wc(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = Pi, typeof l == "object" && l && (c = Oa(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && Cc(t, a, r, c), go = !1, f = t.memoizedState, a.state = f, To(t, r, a, i), wo();
			var p = t.memoizedState;
			o !== d || f !== p || go || e !== null && e.dependencies !== null && Ea(e.dependencies) ? (typeof s == "function" && (bc(t, n, s, r), p = t.memoizedState), (u = go || Sc(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Ea(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, H(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = mo(t, e.child, null, i), t.child = mo(t, null, n, i)) : Ic(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = ul(e, t, i), e;
	}
	function Yc(e, t, n, r) {
		return ha(), t.flags |= 256, Ic(e, t, n, r), t.child;
	}
	var Xc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Zc(e) {
		return {
			baseLanes: e,
			cachePool: Za()
		};
	}
	function Qc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= fd), e;
	}
	function $c(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(Bo.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (L) {
				if (i ? Fo(t) : Ro(), (e = sa) ? (e = cm(e, la), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: $i === null ? null : {
						id: ea,
						overflow: ta
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ui(e), n.return = t, t.child = n, oa = t, sa = null)) : e = null, e === null) throw da(t);
				return t.lanes = um(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (Ro(), i = t.mode, a = tl({
				mode: "hidden",
				children: a
			}, i), r = Vi(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = Zc(n), r.childLanes = Qc(e, o, n), t.memoizedState = Xc, Vc(null, r)) : (Fo(t), el(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return rl(e, t, a, o, r, c, s, n);
		}
		return i ? (Ro(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = Ri(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = Vi(i, a, n, null), i.flags |= 2) : i = Ri(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, Vc(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = Zc(n) : (a = i.cachePool, a === null ? a = Za() : (s = Pa._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = Qc(e, o, n), t.memoizedState = Xc, Vc(e.child, r)) : (Fo(t), n = e.child, e = n.sibling, n = Ri(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function el(e, t) {
		return t = tl({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function tl(e, t) {
		return e = Ii(22, e, null, t), e.lanes = 0, e;
	}
	function nl(e, t, n) {
		return mo(t, e.child, null, n), e = el(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function rl(e, t, n, r, a, o, s, c) {
		if (n) return t.flags & 256 ? (Fo(t), t.flags &= -257, nl(e, t, c)) : t.memoizedState === null ? (Ro(), o = a.fallback, s = t.mode, a = tl({
			mode: "visible",
			children: a.children
		}, s), o = Vi(o, s, c, null), o.flags |= 2, a.return = t, o.return = t, a.sibling = o, t.child = a, mo(t, e.child, null, c), a = t.child, a.memoizedState = Zc(c), a.childLanes = Qc(e, r, c), t.memoizedState = Xc, Vc(null, a)) : (Ro(), t.child = e.child, t.flags |= 128, null);
		if (Fo(t), um(o)) {
			if (r = o.nextSibling && o.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (a = Error(i(419)), a.stack = "", a.digest = r, _a({
				value: a,
				source: null,
				stack: null
			})), nl(e, t, c);
		}
		if (Fc || Ta(e, t, c, !1), r = (c & e.childLanes) !== 0, Fc || r) {
			if (Oo.current !== null) return nl(e, t, c);
			if (r = nd, r !== null && (a = wt(r, c), a !== 0 && a !== s.retryLane)) throw s.retryLane = a, ji(e, a), Ld(r, e, a), Pc;
			return lm(o) || Yd(), nl(e, t, c);
		}
		return lm(o) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, sa = fm(o.nextSibling), oa = t, L = !0, ca = null, la = !1, e !== null && aa(t, e), t = el(t, a.children), t.flags |= 134221824, t);
	}
	function il(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Ca(e.return, t, n);
	}
	function al(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && Uo(n) === null && (t = e), e = e.sibling;
		}
		return t;
	}
	function ol(e, t, n, r, i, a) {
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
	function sl(e) {
		var t = e.child;
		for (e.child = null; t !== null;) {
			var n = t.sibling;
			t.sibling = e.child, e.child = t, t = n;
		}
	}
	function cl(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = Bo.current;
		if (t.flags & 128) return Vo(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, Vo(t, o), i === "backwards" && e !== null ? (sl(e), Ic(e, t, r, n), sl(e)) : Ic(e, t, r, n), r = L ? Xi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && il(e, n, t);
			else if (e.tag === 19) il(e, n, t);
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
				n = al(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null, sl(t)), ol(t, !0, i, null, a, r);
				break;
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && Uo(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				ol(t, !0, n, null, a, r);
				break;
			case "together":
				ol(t, !1, null, null, void 0, r);
				break;
			case "independent":
				t.memoizedState = null;
				break;
			default: n = al(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), ol(t, !1, i, n, a, r);
		}
		return t.child;
	}
	function ll(e, t, n) {
		var r = t.pendingProps;
		return xa(t, t.type, r.value), Ic(e, t, r.children, n), t.child;
	}
	function ul(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), q |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (Ta(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(i(153));
		if (t.child !== null) {
			for (e = t.child, n = Ri(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Ri(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function U(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && Ea(e)));
	}
	function dl(e, t, n) {
		switch (t.tag) {
			case 3:
				Me(t, t.stateNode.containerInfo), xa(t, Pa, e.memoizedState.cache), ha();
				break;
			case 27:
			case 5:
				Pe(t);
				break;
			case 4:
				Me(t, t.stateNode.containerInfo);
				break;
			case 10:
				xa(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, Io(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) {
					if (r.dehydrated !== null) return Fo(t), t.flags |= 128, null;
					r = Ta(e, t, n, !1);
					var i = t.child.childLanes;
					return r || (n & i) !== 0 ? $c(e, t, n) : (Fo(t), e = ul(e, t, n), e === null ? null : e.sibling);
				}
				Fo(t);
				break;
			case 19:
				if (t.flags & 128) return cl(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (Ta(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return cl(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Vo(t, Bo.current), r) break;
				return null;
			case 22: return t.lanes = 0, Bc(e, t, n, t.pendingProps);
			case 24: xa(t, Pa, e.memoizedState.cache);
		}
		return ul(e, t, n);
	}
	function fl(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) Fc = !0;
			else {
				if (!U(e, n) && !(t.flags & 128)) return Fc = !1, dl(e, t, n);
				Fc = !!(e.flags & 131072);
			}
		} else Fc = !1, L && t.flags & 1048576 && ra(t, Xi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = ro(t.elementType), t.type = e, typeof e == "function") Li(e) ? (r = wc(e, r), t.tag = 1, t = Jc(null, t, e, r, n)) : (t.tag = 0, t = Kc(null, t, e, r, n));
					else {
						if (e != null) {
							var a = e.$$typeof;
							if (a === oe) {
								t.tag = 11, t = Lc(null, t, e, r, n);
								break a;
							}
							if (a === le) {
								t.tag = 14, t = Rc(null, t, e, r, n);
								break a;
							}
							if (a === ae) {
								t.tag = 10, t.type = e, t = ll(null, t, n);
								break a;
							}
						}
						throw t = ye(e) || e, Error(i(306, t, ""));
					}
				}
				return t;
			case 0: return Kc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, a = wc(r, t.pendingProps), Jc(e, t, r, a, n);
			case 3:
				a: {
					if (Me(t, t.stateNode.containerInfo), e === null) throw Error(i(387));
					r = t.pendingProps;
					var o = t.memoizedState;
					a = o.element, vo(e, t), To(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, xa(t, Pa, r), r !== o.cache && wa(t, [Pa], n, !0), wo(), r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							t = Yc(e, t, r, n);
							break a;
						}
						if (r !== a) {
							a = Ki(Error(i(424)), t), _a(a), t = Yc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (sa = fm(e.firstChild), oa = t, L = !0, ca = null, la = !0, n = ho(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (ha(), r === a) {
							t = ul(e, t, n);
							break a;
						}
						Ic(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return H(e, t), e === null ? (n = Im(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : L || (t.stateNode = hp(t.type, t.pendingProps, Ae.current, t)) : t.memoizedState = Im(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return Pe(t), e === null && L && (r = t.stateNode = vm(t.type, t.pendingProps, Ae.current), oa = t, la = !0, a = sa, Tp(t.type) ? (pm = a, sa = fm(r.firstChild)) : sa = a), Ic(e, t, t.pendingProps.children, n), H(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && L && ((a = r = sa) && (r = om(r, t.type, t.pendingProps, la), r === null ? a = !1 : (t.stateNode = r, oa = t, sa = fm(r.firstChild), la = !1, a = !0)), a || da(t)), Pe(t), a = t.type, o = t.pendingProps, s = e === null ? null : e.memoizedProps, r = o.children, gp(a, o) ? r = null : s !== null && gp(a, s) && (t.flags |= 32), t.memoizedState !== null && (a = ns(e, t, as, null, null, n), uh._currentValue = a), H(e, t), Ic(e, t, r, n), t.child;
			case 6: return e === null && L && ((e = n = sa) && (n = sm(n, t.pendingProps, la), n === null ? e = !1 : (t.stateNode = n, oa = t, sa = null, e = !0)), e || da(t)), null;
			case 13: return $c(e, t, n);
			case 4: return Me(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = mo(t, null, r, n) : Ic(e, t, r, n), t.child;
			case 11: return Lc(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, H(e, t), Ic(e, t, r, n), t.child;
			case 8: return Ic(e, t, t.pendingProps.children, n), t.child;
			case 12: return Ic(e, t, t.pendingProps.children, n), t.child;
			case 10: return ll(e, t, n);
			case 9: return a = t.type._context, r = t.pendingProps.children, Da(t), a = Oa(a), r = r(a), t.flags |= 1, Ic(e, t, r, n), t.child;
			case 14: return Rc(e, t, t.type, t.pendingProps, n);
			case 15: return zc(e, t, t.type, t.pendingProps, n);
			case 19: return cl(e, t, n);
			case 31: return Gc(e, t, n);
			case 22: return Bc(e, t, n, t.pendingProps);
			case 24: return Da(t), r = Oa(Pa), e === null ? (a = Ya(), a === null && (a = nd, o = Fa(), a.pooledCache = o, o.refCount++, o !== null && (a.pooledCacheLanes |= n), a = o), t.memoizedState = {
				parent: r,
				cache: a
			}, _o(t), xa(t, Pa, a)) : ((e.lanes & n) !== 0 && (vo(e, t), To(t, null, null, n), wo()), a = e.memoizedState, o = t.memoizedState, a.parent === r ? (r = o.cache, xa(t, Pa, r), r !== a.cache && wa(t, [Pa], n, !0)) : (a = {
				parent: r,
				cache: r
			}, t.memoizedState = a, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = a), xa(t, Pa, r))), Ic(e, t, t.pendingProps.children, n), t.child;
			case 30: return t.stateNode === null && (t.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : L && ia(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : H(e, t), Ic(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(i(156, t.tag));
	}
	function pl(e) {
		e.flags |= 4;
	}
	function ml(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Zm(t, r) : Zm(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Kd()) e.flags |= 8192;
				else throw io = eo, $a;
			}
		} else e.flags &= -16777217;
	}
	function hl(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Qm(t)) {
			if (Kd()) e.flags |= 8192;
			else throw io = eo, $a;
		}
	}
	function gl(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : vt(), e.lanes |= t, pd |= t);
	}
	function _l(e, t) {
		if (!L) switch (e.tailMode) {
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
	function vl(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function yl(e, t, n) {
		var r = t.pendingProps;
		switch (I(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return vl(t), null;
			case 1: return vl(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Sa(Pa), Ne(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (ma(t) ? pl(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, ga())), vl(t), null;
			case 26:
				var a = t.type, o = t.memoizedState;
				return e === null ? (pl(t), o === null ? (vl(t), ml(t, a, null, r, n)) : (vl(t), hl(t, o))) : o ? o === e.memoizedState ? (vl(t), t.flags &= -16777217) : (pl(t), vl(t), hl(t, o)) : (e = e.memoizedProps, e !== r && pl(t), vl(t), ml(t, a, e, r, n)), null;
			case 27:
				if (Fe(t), n = Ae.current, a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && pl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return vl(t), t.subtreeFlags &= -33554433, null;
					}
					e = Oe.current, ma(t) ? fa(t, e) : (e = vm(a, r, n), t.stateNode = e, pl(t));
				}
				return vl(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (Fe(t), a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && pl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return vl(t), t.subtreeFlags &= -33554433, null;
					}
					if (o = Oe.current, ma(t)) fa(t, o);
					else {
						var s = fp(Ae.current);
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
						a: switch (ap(o, a, r), a) {
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
						r && pl(t);
					}
				}
				return vl(t), t.subtreeFlags &= -33554433, ml(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && pl(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(i(166));
					if (e = Ae.current, ma(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, a = oa, a !== null) switch (a.tag) {
							case 27:
							case 5: r = a.memoizedProps;
						}
						e[At] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || rp(e.nodeValue, n)), e || da(t, !0);
					} else e = fp(e).createTextNode(r), e[At] = t, t.stateNode = e;
				}
				return vl(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = ma(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(i(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(557));
							e[At] = t;
						} else ha(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						vl(t), e = !1;
					} else n = ga(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (zo(t), t) : (zo(t), null);
					if (t.flags & 128) throw Error(i(558));
				}
				return vl(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (a = ma(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!a) throw Error(i(318));
							if (a = t.memoizedState, a = a === null ? null : a.dehydrated, !a) throw Error(i(317));
							a[At] = t;
						} else ha(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						vl(t), a = !1;
					} else a = ga(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), a = !0;
					if (!a) return t.flags & 256 ? (zo(t), t) : (zo(t), null);
				}
				return zo(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, a = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (a = r.alternate.memoizedState.cachePool.pool), o = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== a && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), gl(t, t.updateQueue), vl(t), null);
			case 4: return Ne(), e === null && qf(t.stateNode.containerInfo), t.flags |= 67108864, vl(t), null;
			case 10: return Sa(t.type), vl(t), null;
			case 19:
				if (Ho(t), r = t.memoizedState, r === null) return vl(t), null;
				if (a = !!(t.flags & 128), o = r.rendering, o === null) {
					if (a) _l(r, !1);
					else {
						if (ld !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (o = Uo(e), o !== null) {
								for (t.flags |= 128, _l(r, !1), e = o.updateQueue, t.updateQueue = e, gl(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) zi(n, e), n = n.sibling;
								return Vo(t, Bo.current & 1 | 2), L && na(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Je() > yd && (t.flags |= 128, a = !0, _l(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!a) {
						if (e = Uo(o), e !== null) {
							if (t.flags |= 128, a = !0, e = e.updateQueue, t.updateQueue = e, gl(t, e), _l(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !o.alternate && !L) return vl(t), null;
						} else 2 * Je() - r.renderingStartTime > yd && n !== 536870912 && (t.flags |= 128, a = !0, _l(r, !1), t.lanes = 4194304);
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
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Je(), e.sibling = null, o = Bo.current, o = a ? o & 1 | 2 : o & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || L ? Vo(t, o) : (n = o, De(No, t), De(Bo, n), Po === null && (Po = t)), L && na(t, r.treeForkCount), e;
				}
				return vl(t), null;
			case 22:
			case 23: return zo(t), Mo(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (vl(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : vl(t), n = t.updateQueue, n !== null && gl(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && Ee(Ja), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Sa(Pa), vl(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, vl(t), null;
		}
		throw Error(i(156, t.tag));
	}
	function bl(e, t) {
		switch (I(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Sa(Pa), Ne(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return Fe(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (zo(t), t.alternate === null) throw Error(i(340));
					ha();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (zo(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(i(340));
					ha();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return Ho(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
			case 4: return Ne(), null;
			case 10: return Sa(t.type), null;
			case 22:
			case 23: return zo(t), Mo(), e !== null && Ee(Ja), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Sa(Pa), null;
			case 25: return null;
			default: return null;
		}
	}
	function xl(e, t) {
		switch (I(t), t.tag) {
			case 3:
				Sa(Pa), Ne();
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
				t.memoizedState !== null && zo(t);
				break;
			case 13:
				zo(t);
				break;
			case 19:
				Ho(t);
				break;
			case 10:
				Sa(t.type);
				break;
			case 22:
			case 23:
				zo(t), Mo(), e !== null && Ee(Ja);
				break;
			case 24: Sa(Pa);
		}
	}
	function Sl(e, t) {
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
			J(t, t.return, e);
		}
	}
	function Cl(e, t, n) {
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
								J(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			J(t, t.return, e);
		}
	}
	function wl(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Do(t, n);
			} catch (t) {
				J(e, e.return, t);
			}
		}
	}
	function Tl(e, t, n) {
		n.props = wc(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			J(e, t, n);
		}
	}
	function El(e, t) {
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
						var i = e.stateNode, a = Si(e.memoizedProps, i);
						(i.ref === null || i.ref.name !== a) && (i.ref = Lp(a)), r = i.ref;
						break;
					case 7:
						if (e.stateNode === null) {
							var o = new Rp(e);
							m(e.child, !1, tm, o, void 0, void 0), e.stateNode = o;
						}
						r = e.stateNode;
						break;
					default: r = e.stateNode;
				}
				typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
			}
		} catch (n) {
			J(e, t, n);
		}
	}
	function Dl(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				J(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				J(e, t, n);
			}
			else n.current = null;
		}
	}
	function Ol(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) rm(e.stateNode, t[n]);
	}
	function kl(e) {
		for (var t = e.return; t !== null && (Ml(t) && rm(e.stateNode, t.stateNode), !jl(t));) t = t.return;
	}
	function Al(e) {
		for (var t = e.return; t !== null && (Ml(t) && im(e.stateNode, t.stateNode), !jl(t));) t = t.return;
	}
	function jl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 27;
	}
	function Ml(e) {
		return e && e.tag === 7 && e.stateNode !== null;
	}
	function Nl(e) {
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
			J(e, e.return, t);
		}
	}
	function Pl(e, t, n) {
		try {
			var r = e.stateNode;
			sp(r, e.type, n, t), r[jt] = t;
		} catch (t) {
			J(e, e.return, t);
		}
	}
	function Fl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Tp(e.type) || e.tag === 4;
	}
	function Il(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Fl(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Tp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Ll(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = En)), Ol(e, r), $t = !0;
		else if (i !== 4 && (i === 27 && (Ol(e, r), r = null, Tp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (Ll(e, t, n, r), e = e.sibling; e !== null;) Ll(e, t, n, r), e = e.sibling;
	}
	function Rl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), Ol(e, r), $t = !0;
		else if (i !== 4 && (i === 27 && (Ol(e, r), r = null, Tp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Rl(e, t, n, r), e = e.sibling; e !== null;) Rl(e, t, n, r), e = e.sibling;
	}
	function zl(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			ap(t, r, n), t[At] = e, t[jt] = n;
		} catch (t) {
			J(e, e.return, t);
		}
	}
	var Bl = !1, Vl = null;
	function Hl(e) {
		(e.tag === 30 || e.subtreeFlags & 33554432) && (Bl = !0);
	}
	var Ul = null;
	function Wl() {
		var e = Ul;
		return Ul = null, e;
	}
	var Gl = 0;
	function Kl(e, t, n, r, i) {
		return Gl = 0, ql(e.child, t, n, r, i);
	}
	function ql(e, t, n, r, i) {
		for (var a = !1; e !== null;) {
			if (e.tag === 5) {
				var o = e.stateNode;
				if (r !== null) {
					var s = jp(o);
					r.push(s), s.view && (a = !0);
				} else a || jp(o).view && (a = !0);
				Bl = !0, Op(o, Gl === 0 ? t : t + "_" + Gl, n), Gl++;
			} else (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && i || ql(e.child, t, n, r, i) && (a = !0));
			e = e.sibling;
		}
		return a;
	}
	function Jl(e, t) {
		for (; e !== null;) e.tag === 5 ? kp(e.stateNode, e.memoizedProps) : (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && t || Jl(e.child, t)), e = e.sibling;
	}
	function Yl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (Yl(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(i(544));
				var n = t.name;
				t = wi(t.default, t.share), t !== "none" && (Kl(e, n, t, null, !1) || Jl(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function Xl(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = Si(r, n), a = wi(r.default, n.paired ? r.share : r.enter);
			a === "none" ? Yl(e) : Kl(e, i, a, null, !1) ? (Yl(e), n.paired || t || Id(e, r.onEnter)) : Jl(e.child, !1);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Xl(e, t), e = e.sibling;
		else Yl(e);
	}
	function Zl(e) {
		if (Vl !== null && Vl.size !== 0) {
			var t = Vl;
			if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
				if (e.tag !== 22 || e.memoizedState === null) {
					if (e.tag === 30 && e.flags & 18874368) {
						var n = e.memoizedProps, r = n.name;
						if (r != null && r !== "auto") {
							var i = t.get(r);
							if (i !== void 0) {
								var a = wi(n.default, n.share);
								if (a !== "none" && (Kl(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, Id(e, n.onShare)) : Jl(e.child, !1)), t.delete(r), t.size === 0) break;
							}
						}
					}
					Zl(e);
				}
				e = e.sibling;
			}
		}
	}
	function Ql(e) {
		if (e.tag === 30) {
			var t = e.memoizedProps, n = Si(t, e.stateNode), r = Vl === null ? void 0 : Vl.get(n), i = wi(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Kl(e, n, i, null, !1) ? r === void 0 ? Id(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, Vl.delete(n), Id(e, t.onShare)) : Jl(e.child, !1)), Vl !== null && Zl(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Ql(e), e = e.sibling;
		else Vl !== null && Zl(e);
	}
	function $l(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = Si(t, e.stateNode);
				t = wi(t.default, t.update), e.flags &= -5, t !== "none" && Kl(e, n, t, e.memoizedState = [], !1);
			} else e.subtreeFlags & 33554432 && $l(e);
			e = e.sibling;
		}
	}
	function eu(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if (e.tag !== 22 || e.memoizedState === null) {
				if (e.tag === 30 && e.flags & 18874368) {
					var t = e.stateNode;
					t.paired !== null && (t.paired = null, Jl(e.child, !1));
				}
				eu(e);
			}
			e = e.sibling;
		}
	}
	function tu(e) {
		if (e.tag === 30) e.stateNode.paired = null, Jl(e.child, !1), eu(e);
		else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) tu(e), e = e.sibling;
		else eu(e);
	}
	function nu(e) {
		for (e = e.child; e !== null;) e.tag === 30 ? Jl(e.child, !1) : e.subtreeFlags & 33554432 && nu(e), e = e.sibling;
	}
	function ru(e, t, n, r, i, a, o) {
		for (var s = !1; t !== null;) {
			if (t.tag === 5) {
				var c = t.stateNode;
				if (a !== null && Gl < a.length) {
					var l = a[Gl], u = jp(c);
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
				e.flags & 4 && Op(c, Gl === 0 ? n : n + "_" + Gl, i), s && e.flags & 4 || (Ul === null && (Ul = []), Ul.push(c, Gl === 0 ? r : r + "_" + Gl, t.memoizedProps)), Gl++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : ru(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function iu(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = Si(n, r), a = wi(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(Mp);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				Gl = 0, i = ru(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || Id(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && iu(e, t);
			e = e.sibling;
		}
	}
	var au = !1, ou = !1, su = !1, cu = !1, lu = typeof WeakSet == "function" ? WeakSet : Set, uu = null, du = !1, fu = !1, pu = !1, mu = !1;
	function hu(e, t, n) {
		if (e = e.containerInfo, up = yh, e = Qr(e), $r(e)) {
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
		for (dp = {
			focusedElem: e,
			selectionRange: r
		}, yh = !1, n = (n & 335544064) === n, uu = t, t = n ? 9270 : 1024; uu !== null;) {
			if (e = uu, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && Ql(r[a]);
			if (e.alternate === null && e.flags & 2) n && Hl(e), gu(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && Ql(r), gu(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && Hl(e), gu(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, uu = r) : (n && $l(e), gu(n));
			}
		}
		Vl = null;
	}
	function gu(e) {
		for (; uu !== null;) {
			var t = uu, n = e, r = t.alternate, a = t.flags;
			switch (t.tag) {
				case 0:
				case 11:
				case 15: break;
				case 1:
					if (a & 1024 && r !== null) {
						n = void 0, a = r.memoizedProps, r = r.memoizedState;
						var o = t.stateNode;
						try {
							var s = wc(t.type, a);
							n = o.getSnapshotBeforeUpdate(s, r), o.__reactInternalSnapshotBeforeUpdate = n;
						} catch (e) {
							J(t, t.return, e);
						}
					}
					break;
				case 3:
					if (a & 1024) {
						if (r = t.stateNode.containerInfo, n = r.nodeType, n === 9) am(r);
						else if (n === 1) switch (r.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								am(r);
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
					n && r !== null && (n = Si(r.memoizedProps, r.stateNode), a = t.memoizedProps, a = wi(a.default, a.update), a !== "none" && Kl(r, n, a, r.memoizedState = [], !0));
					break;
				default: if (a & 1024) throw Error(i(163));
			}
			if (r = t.sibling, r !== null) {
				r.return = t.return, uu = r;
				break;
			}
			uu = t.return;
		}
	}
	function _u(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				Iu(e, n), r & 4 && Sl(5, n);
				break;
			case 1:
				if (Iu(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						J(n, n.return, e);
					}
					else {
						var i = wc(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							J(n, n.return, e);
						}
					}
				}
				r & 64 && wl(n), r & 512 && El(n, n.return);
				break;
			case 3:
				if (Iu(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						Do(e, t);
					} catch (e) {
						J(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && zl(n);
			case 26:
			case 5:
				Iu(e, n), t === null && r & 4 && Nl(n), r & 512 && El(n, n.return);
				break;
			case 12:
				Iu(e, n);
				break;
			case 31:
				Iu(e, n), r & 4 && Tu(e, n);
				break;
			case 13:
				Iu(e, n), r & 4 && Eu(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = bf.bind(null, n), dm(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || au, !r) {
					var a = t !== null && t.memoizedState !== null || ou;
					t = au, i = ou, au = r, (ou = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), Ru(e, n, r)) : Iu(e, n), au = t, ou = i;
				}
				break;
			case 30:
				Iu(e, n), r & 512 && El(n, n.return);
				break;
			case 7: r & 512 && El(n, n.return);
			default: Iu(e, n);
		}
	}
	function vu(e, t) {
		for (e = e.child; e !== null;) yu(e, t), e = e.sibling;
	}
	function yu(e, t) {
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
					J(e, e.return, t);
				}
				bu(e, t);
				break;
			case 6:
				try {
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, $t = !0;
				} catch (t) {
					J(e, e.return, t);
				}
				break;
			case 18:
				try {
					var s = e.stateNode;
					t ? Dp(s, !0) : Dp(e.stateNode, !1);
				} catch (t) {
					J(e, e.return, t);
				}
				break;
			case 22:
			case 23:
				e.memoizedState === null && vu(e, t);
				break;
			default: vu(e, t);
		}
	}
	function bu(e, t) {
		if (e.subtreeFlags & 67108864) for (e = e.child; e !== null;) {
			a: {
				var n = e, r = t;
				switch (n.tag) {
					case 4:
						yu(n, r);
						break a;
					case 22:
						n.memoizedState === null && bu(n, r);
						break a;
					default: bu(n, r);
				}
			}
			e = e.sibling;
		}
	}
	function W(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, W(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Rt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var xu = null, Su = !1;
	function Cu(e, t, n) {
		for (n = n.child; n !== null;) wu(e, t, n), n = n.sibling;
	}
	function wu(e, t, n) {
		if (it && typeof it.onCommitFiberUnmount == "function") try {
			it.onCommitFiberUnmount(rt, n);
		} catch {}
		switch (n.tag) {
			case 26:
				ou || Dl(n, t), Cu(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !ou && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				ou || Dl(n, t), Al(n);
				var r = xu, i = Su;
				Tp(n.type) && (xu = n.stateNode, Su = !1), Cu(e, t, n), ym(n.stateNode, n.type, n.memoizedProps), xu = r, Su = i;
				break;
			case 5: ou || Dl(n, t), Al(n);
			case 6:
				if (n.tag === 6 && Al(n), r = xu, i = Su, xu = null, Cu(e, t, n), xu = r, Su = i, xu !== null) {
					if (Su) try {
						(xu.nodeType === 9 ? xu.body : xu.nodeName === "HTML" ? xu.ownerDocument.body : xu).removeChild(n.stateNode), $t = !0;
					} catch (e) {
						J(n, t, e);
					}
					else try {
						xu.removeChild(n.stateNode), $t = !0;
					} catch (e) {
						J(n, t, e);
					}
				}
				break;
			case 18:
				xu !== null && (Su ? (e = xu, Ep(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Gh(e)) : Ep(xu, n.stateNode));
				break;
			case 4:
				r = xu, i = Su, xu = n.stateNode.containerInfo, Su = !0, Cu(e, t, n), xu = r, Su = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Cl(2, n, t), ou || Cl(4, n, t), Cu(e, t, n);
				break;
			case 1:
				ou || (Dl(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Tl(n, t, r)), Cu(e, t, n);
				break;
			case 21:
				Cu(e, t, n);
				break;
			case 22:
				ou = (r = ou) || n.memoizedState !== null, Cu(e, t, n), ou = r;
				break;
			case 30:
				Dl(n, t), Cu(e, t, n);
				break;
			case 7:
				ou || Dl(n, t), Cu(e, t, n);
				break;
			default: Cu(e, t, n);
		}
	}
	function Tu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Gh(e);
			} catch (e) {
				J(t, t.return, e);
			}
		}
	}
	function Eu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Gh(e);
		} catch (e) {
			J(t, t.return, e);
		}
	}
	function Du(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new lu()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new lu()), t;
			default: throw Error(i(435, e.tag));
		}
	}
	function Ou(e, t) {
		var n = Du(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = xf.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function ku(e, t, n) {
		var r = t.deletions;
		if (r !== null) for (var a = 0; a < r.length; a++) {
			var o = r[a], s = e, c = t, l = c;
			a: for (; l !== null;) {
				switch (l.tag) {
					case 27:
						if (Tp(l.type)) {
							xu = l.stateNode, Su = !1;
							break a;
						}
						break;
					case 5:
						xu = l.stateNode, Su = !1;
						break a;
					case 3:
					case 4:
						xu = l.stateNode.containerInfo, Su = !0;
						break a;
				}
				l = l.return;
			}
			if (xu === null) throw Error(i(160));
			wu(s, c, o), xu = null, Su = !1, s = o.alternate, s !== null && (s.return = null), o.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) ju(t, e, n), t = t.sibling;
	}
	var Au = null;
	function ju(e, t, n) {
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
				ku(t, e, n), Mu(e), a & 4 && (Cl(3, e, e.return), Sl(3, e), Cl(5, e, e.return));
				break;
			case 1:
				ku(t, e, n), Mu(e), a & 512 && (ou || r === null || Dl(r, r.return)), a & 64 && au && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (o = Au, ku(t, e, n), Mu(e), a & 512 && (ou || r === null || Dl(r, r.return)), a & 4) {
					if (a = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if (au) e.stateNode = hp(e.type, e.memoizedProps, t.containerInfo, e);
								else {
									a: {
										t = e.type, n = e.memoizedProps, a = o.ownerDocument || o;
										b: switch (t) {
											case "title":
												r = a.getElementsByTagName("title")[0], (!r || r[It] || r[At] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = a.createElement(t), a.head.insertBefore(r, a.querySelector("head > title"))), ap(r, t, n), r[At] = e, Ut(r), t = r;
												break a;
											case "link":
												if (o = Jm("link", "href", a).get(t + (n.href || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && r.getAttribute("rel") === (n.rel == null ? null : n.rel) && r.getAttribute("title") === (n.title == null ? null : n.title) && r.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), ap(r, t, n), a.head.appendChild(r);
												break;
											case "meta":
												if (o = Jm("meta", "content", a).get(t + (n.content || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("content") === (n.content == null ? null : "" + n.content) && r.getAttribute("name") === (n.name == null ? null : n.name) && r.getAttribute("property") === (n.property == null ? null : n.property) && r.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && r.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), ap(r, t, n), a.head.appendChild(r);
												break;
											default: throw Error(i(468, t));
										}
										r[At] = e, Ut(r), t = r;
									}
									e.stateNode = t;
								}
							} else au || Ym(o, e.type, e.stateNode);
						} else e.stateNode = Um(o, n, e.memoizedProps);
					} else a === n ? n === null && e.stateNode !== null && Pl(e, e.memoizedProps, r.memoizedProps) : (a === null ? (t = r.stateNode, t === null || ou || t.parentNode.removeChild(t)) : a.count--, n === null ? au || Ym(o, e.type, e.stateNode) : Um(o, n, e.memoizedProps));
				}
				break;
			case 27:
				ku(t, e, n), Mu(e), a & 512 && (ou || r === null || Dl(r, r.return)), r !== null && a & 4 && Pl(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (o = su, su = !1, ku(t, e, n), su = o, Mu(e), a & 512 && (ou || r === null || Dl(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						vn(t, ""), $t = !0;
					} catch (t) {
						J(e, e.return, t);
					}
				}
				a & 4 && e.stateNode != null && (t = e.memoizedProps, Pl(e, t, r === null ? t : r.memoizedProps)), a & 1024 && (cu = !0);
				break;
			case 6:
				if (ku(t, e, n), Mu(e), a & 4) {
					if (e.stateNode === null) throw Error(i(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, $t = !0;
					} catch (t) {
						J(e, e.return, t);
					}
				}
				break;
			case 3:
				if ($t = !1, qm = null, o = Au, Au = Cm(t.containerInfo), ku(t, e, n), Au = o, Mu(e), a & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Gh(t.containerInfo);
				} catch (t) {
					J(e, e.return, t);
				}
				cu && (cu = !1, Nu(e)), $t = !1;
				break;
			case 4:
				a = su, su = au, r = en(), o = Au, Au = Cm(e.stateNode.containerInfo), ku(t, e, n), Mu(e), Au = o, $t && fu && (pu = !0), $t = r, su = a;
				break;
			case 12:
				ku(t, e, n), Mu(e);
				break;
			case 31:
				ku(t, e, n), Mu(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Ou(e, t)));
				break;
			case 13:
				ku(t, e, n), Mu(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (_d = Je()), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Ou(e, t)));
				break;
			case 22:
				o = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = au, l = ou, u = su;
				au = c || o, su = u || o, ou = l || s, ku(t, e, n), ou = l, su = u, au = c, Mu(e), a & 8192 && (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, !o || r === null || s || au || ou || (t = s || ou, n = au, r = ou, au = o || au, ou = t, Lu(e, 2), au = n, ou = r), !o && su || vu(e, o)), a & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, Ou(e, n))));
				break;
			case 19:
				ku(t, e, n), Mu(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Ou(e, t)));
				break;
			case 30:
				a & 512 && (ou || r === null || Dl(r, r.return)), a = en(), o = fu, s = (n & 335544064) === n, c = e.memoizedProps, fu = s && wi(c.default, c.update) !== "none", ku(t, e, n), Mu(e), s && r !== null && $t && (e.flags |= 4), fu = o, $t = a;
				break;
			case 21: break;
			case 7: a & 512 && (ou || r === null || Dl(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: ku(t, e, n), Mu(e);
		}
	}
	function Mu(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Fl(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				r = null;
				for (var a = e.return; a !== null;) {
					if (Ml(a)) {
						var o = a.stateNode;
						r === null ? r = [o] : r.push(o);
					}
					if (jl(a)) break;
					a = a.return;
				}
				var s = r;
				if (n == null) throw Error(i(160));
				switch (n.tag) {
					case 27:
						var c = n.stateNode;
						Rl(e, Il(e), c, s);
						break;
					case 5:
						var l = n.stateNode;
						n.flags & 32 && (vn(l, ""), n.flags &= -33), Rl(e, Il(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						Ll(e, Il(e), u, s);
						break;
					default: throw Error(i(161));
				}
			} catch (t) {
				J(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function Nu(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			Nu(t), t.tag === 5 && t.flags & 1024 && (t = t.stateNode, yh = !0, t.reset(), yh = !1), e = e.sibling;
		}
	}
	function Pu(e, t) {
		if (t.subtreeFlags & 9270) for (t = t.child; t !== null;) Fu(t, e), t = t.sibling;
		else iu(t, !1);
	}
	function Fu(e, t) {
		var n = e.alternate;
		if (n === null) Xl(e, !1);
		else switch (e.tag) {
			case 3:
				if (mu = du = !1, Wl(), Pu(t, e), !du && !pu) {
					if (e = Ul, e !== null) for (var r = 0; r < e.length; r += 3) {
						n = e[r];
						var i = e[r + 1];
						kp(n, e[r + 2]), n = n.ownerDocument.documentElement, n !== null && n.animate({
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
					})), mu = !0;
				}
				Ul = null;
				break;
			case 5:
				Pu(t, e);
				break;
			case 4:
				r = du, du = !1, Pu(t, e), du && (pu = !0), du = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? Pu(t, e) : Xl(e, !1));
				break;
			case 30:
				r = du, i = Wl(), du = !1, Pu(t, e), du && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = Si(a, o), o = Si(n.memoizedProps, o);
				var s = wi(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, Gl = 0, t = ru(e, n, t, o, s, a, !0), Gl !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (Id(e, e.memoizedProps.onUpdate), Ul = i) : i !== null && (i.push.apply(i, Ul), Ul = i), du = e.flags & 32 ? !0 : r;
				break;
			default: Pu(t, e);
		}
	}
	function Iu(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) _u(e, t.alternate, t), t = t.sibling;
	}
	function Lu(e, t) {
		for (e = e.child; e !== null;) {
			var n = e, r = t;
			switch (n.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Cl(4, n, n.return), Lu(n, r);
					break;
				case 1:
					Dl(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && Tl(n, n.return, i), Lu(n, r);
					break;
				case 27: r & 2 && ym(n.stateNode, n.type, n.memoizedProps);
				case 5:
					Dl(n, n.return), n.tag !== 5 && n.tag !== 27 || Al(n), Lu(n, r);
					break;
				case 6:
					Al(n);
					break;
				case 26:
					Dl(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || ou || i.parentNode.removeChild(i), Lu(n, r);
					break;
				case 22:
					n.memoizedState === null && Lu(n, r);
					break;
				case 30:
					Dl(n, n.return), Lu(n, r);
					break;
				case 7: Dl(n, n.return);
				default: Lu(n, r);
			}
			e = e.sibling;
		}
	}
	function Ru(e, t, n) {
		for (n = t.subtreeFlags & 8772 ? n : n & -2, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags, s = !!(n & 1);
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					Ru(i, a, n), Sl(4, a);
					break;
				case 1:
					if (Ru(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						J(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var c = r.stateNode;
						try {
							var l = i.shared.hiddenCallbacks;
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) Eo(l[i], c);
						} catch (e) {
							J(r, r.return, e);
						}
					}
					s && o & 64 && wl(a), El(a, a.return);
					break;
				case 27: n & 2 && zl(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || kl(a), Ru(i, a, n), s && r === null && o & 4 && Nl(a), El(a, a.return);
					break;
				case 6:
					kl(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || au || Ym(Cm(c.ownerDocument), a.type, c), Ru(i, a, n), s && r === null && o & 4 && Nl(a), El(a, a.return);
					break;
				case 12:
					Ru(i, a, n);
					break;
				case 31:
					Ru(i, a, n), s && o & 4 && Tu(i, a);
					break;
				case 13:
					Ru(i, a, n), s && o & 4 && Eu(i, a);
					break;
				case 22:
					a.memoizedState === null && Ru(i, a, n), El(a, a.return);
					break;
				case 30:
					Ru(i, a, n), El(a, a.return);
					break;
				case 7: El(a, a.return);
				default: Ru(i, a, n);
			}
			t = t.sibling;
		}
	}
	function zu(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Ia(n));
	}
	function Bu(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Ia(e));
	}
	function Vu(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) Hu(e, t, n, r), t = t.sibling;
		else i && nu(t);
	}
	function Hu(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && tu(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Vu(e, t, n, r), a & 2048 && Sl(9, t);
				break;
			case 1:
				Vu(e, t, n, r);
				break;
			case 3:
				Vu(e, t, n, r), i && mu && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && Ia(a)));
				break;
			case 12:
				if (a & 2048) {
					Vu(e, t, n, r), a = t.stateNode;
					try {
						var o = t.memoizedProps, s = o.id, c = o.onPostCommit;
						typeof c == "function" && c(s, t.alternate === null ? "mount" : "update", a.passiveEffectDuration, -0);
					} catch (e) {
						J(t, t.return, e);
					}
				} else Vu(e, t, n, r);
				break;
			case 31:
				Vu(e, t, n, r);
				break;
			case 13:
				Vu(e, t, n, r);
				break;
			case 23: break;
			case 22:
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && tu(t), o._visibility & 2 ? Vu(e, t, n, r) : (o._visibility |= 2, Uu(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && tu(s), o._visibility & 2 ? Vu(e, t, n, r) : Wu(e, t)), a & 2048 && zu(s, t);
				break;
			case 24:
				Vu(e, t, n, r), a & 2048 && Bu(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (Jl(a.child, !0), Jl(t.child, !0))), Vu(e, t, n, r);
				break;
			default: Vu(e, t, n, r);
		}
	}
	function Uu(e, t, n, r, i) {
		for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Uu(a, o, s, c, i), Sl(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Uu(a, o, s, c, i)) : u._visibility & 2 ? Uu(a, o, s, c, i) : Wu(a, o), i && l & 2048 && zu(o.alternate, o);
					break;
				case 24:
					Uu(a, o, s, c, i), i && l & 2048 && Bu(o.alternate, o);
					break;
				default: Uu(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Wu(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Wu(n, r), i & 2048 && zu(r.alternate, r);
					break;
				case 24:
					Wu(n, r), i & 2048 && Bu(r.alternate, r);
					break;
				default: Wu(n, r);
			}
			t = t.sibling;
		}
	}
	var Gu = 8192;
	function Ku(e, t, n) {
		if (e.subtreeFlags & Gu) for (e = e.child; e !== null;) qu(e, t, n), e = e.sibling;
	}
	function qu(e, t, n) {
		switch (e.tag) {
			case 26:
				Ku(e, t, n), e.flags & Gu && (e.memoizedState === null ? (e = e.stateNode, (t & 335544128) === t && eh(n, e)) : th(n, Au, e.memoizedState, e.memoizedProps));
				break;
			case 5:
				Ku(e, t, n), e.flags & Gu && (e = e.stateNode, (t & 335544128) === t && eh(n, e));
				break;
			case 3:
			case 4:
				var r = Au;
				Au = Cm(e.stateNode.containerInfo), Ku(e, t, n), Au = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Gu, Gu = 16777216, Ku(e, t, n), Gu = r) : Ku(e, t, n));
				break;
			case 30:
				if ((e.flags & Gu) !== 0 && (r = e.memoizedProps.name, r != null && r !== "auto")) {
					var i = e.stateNode;
					i.paired = null, Vl === null && (Vl = /* @__PURE__ */ new Map()), Vl.set(r, i);
				}
				Ku(e, t, n);
				break;
			default: Ku(e, t, n);
		}
	}
	function Ju(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Yu(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				uu = r, Qu(r, e);
			}
			Ju(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Xu(e), e = e.sibling;
	}
	function Xu(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Yu(e), e.flags & 2048 && Cl(9, e, e.return);
				break;
			case 3:
				Yu(e);
				break;
			case 12:
				Yu(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Zu(e)) : Yu(e);
				break;
			default: Yu(e);
		}
	}
	function Zu(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				uu = r, Qu(r, e);
			}
			Ju(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Cl(8, t, t.return), Zu(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Zu(t));
					break;
				default: Zu(t);
			}
			e = e.sibling;
		}
	}
	function Qu(e, t) {
		for (; uu !== null;) {
			var n = uu;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					Cl(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: Ia(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, uu = r;
			else a: for (n = e; uu !== null;) {
				r = uu;
				var i = r.sibling, a = r.return;
				if (W(r), r === n) {
					uu = null;
					break a;
				}
				if (i !== null) {
					i.return = a, uu = i;
					break a;
				}
				uu = a;
			}
		}
	}
	var $u = {
		getCacheForType: function(e) {
			var t = Oa(Pa), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Oa(Pa).controller.signal;
		}
	}, ed = typeof WeakMap == "function" ? WeakMap : Map, td = 0, nd = null, G = null, K = 0, rd = 0, id = null, ad = !1, od = !1, sd = !1, cd = 0, ld = 0, q = 0, ud = 0, dd = 0, fd = 0, pd = 0, md = null, hd = null, gd = !1, _d = 0, vd = 0, yd = Infinity, bd = null, xd = null, Sd = 0, Cd = null, wd = null, Td = 0, Ed = 0, Dd = null, Od = null, kd = null, Ad = null, jd = null, Md = 0, Nd = null;
	function Pd() {
		return td & 2 && K !== 0 ? K & -K : A.T === null ? Dt() : Lf();
	}
	function Fd() {
		if (fd === 0) {
			if (!(K & 536870912) || L) {
				var e = dt;
				dt <<= 1, !(dt & 3932160) && (dt = 262144), fd = e;
			} else fd = 536870912;
		}
		return e = No.current, e !== null && (e.flags |= 32), fd;
	}
	function Id(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Lp(Si(e.memoizedProps, n))), Ad === null && (Ad = []), Ad.push(t.bind(null, r));
		}
	}
	function Ld(e, t, n) {
		(e === nd && (rd === 2 || rd === 9) || e.cancelPendingCommit !== null) && (Wd(e, 0), Vd(e, K, fd, !1)), bt(e, n), (!(td & 2) || e !== nd) && (e === nd && (!(td & 2) && (ud |= n), ld === 4 && Vd(e, K, fd, !1)), kf(e));
	}
	function Rd(e, t, n) {
		if (td & 6) throw Error(i(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || ht(e, t), a = r ? Qd(e, t) : Xd(e, t, !0), o = r;
		do {
			if (a === 0) {
				od && !r && Vd(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, o && !Bd(n)) a = Xd(e, t, !1), o = !1;
			else {
				if (a === 2) {
					if (o = t, e.errorRecoveryDisabledLanes & o) var s = 0;
					else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
					if (s !== 0) {
						t = s;
						a: {
							var c = e;
							a = md;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (Wd(c, s).flags |= 256), s = Xd(c, s, !1), s !== 2 && s !== 6) {
								if (sd && !l) {
									c.errorRecoveryDisabledLanes |= o, ud |= o, a = 4;
									break a;
								}
								o = hd, hd = a, o !== null && (hd === null ? hd = o : hd.push.apply(hd, o));
							}
							a = s;
						}
						if (o = !1, a !== 2) continue;
					}
				}
				if (a === 1) {
					Wd(e, 0), Vd(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, o = a, o) {
						case 0:
						case 1: throw Error(i(345));
						case 4: if ((t & 4194048) !== t && (t & 62914560) !== t) break;
						case 6:
							Vd(r, t, fd, !ad);
							break a;
						case 2:
							hd = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(i(329));
					}
					if ((t & 62914560) === t && (a = _d + 300 - Je(), 10 < a)) {
						if (Vd(r, t, fd, !ad), mt(r, 0, !0) !== 0) break a;
						Td = t, r.timeoutHandle = yp(zd.bind(null, r, n, hd, bd, gd, t, fd, ud, pd, ad, o, "Throttled", -0, 0), a);
						break a;
					}
					zd(r, n, hd, bd, gd, t, fd, ud, pd, ad, o, null, -0, 0);
				}
				break;
			}
		} while (1);
		kf(e);
	}
	function zd(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
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
			unsuspend: En
		}, Vl = null, qu(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = ah.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? _d - Je() : (a & 4194048) === a ? vd - Je() : 0, m = rh(d, m), m !== null) ? (Td = a, e.cancelPendingCommit = m(of.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), Vd(e, a, o, !l)) : of(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function Bd(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!Kr(a(), i)) return !1;
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
	function Vd(e, t, n, r) {
		t = gt(e, t), t &= ~dd, t &= ~ud, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - ot(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && St(e, n, t);
	}
	function Hd() {
		return td & 6 ? !0 : (Af(0, !1), !1);
	}
	function Ud() {
		if (G !== null) {
			if (rd === 0) var e = G.return;
			else e = G, ba = ya = null, cs(e), so = null, co = 0, e = G;
			for (; e !== null;) xl(e.alternate, e), e = e.return;
			G = null;
		}
	}
	function Wd(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, bp(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), Td = 0, Ud(), nd = e, G = n = Ri(e.current, null), K = t, rd = 0, id = null, ad = !1, od = ht(e, t), sd = !1, pd = fd = dd = ud = q = ld = 0, hd = md = null, gd = !1, cd = gt(e, t), Oi(), n;
	}
	function Gd(e, t) {
		z = null, A.H = gc, t === Qa || t === R ? (t = ao(), rd = 3) : t === $a ? (t = ao(), rd = 4) : rd = t === Pc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, id = t, G === null && (ld = 1, Oc(e, Ki(t, e.current)));
	}
	function Kd() {
		var e = No.current;
		return e === null ? !0 : (K & 4194048) === K ? Po === null : (K & 62914560) === K || K & 536870912 ? e === Po : !1;
	}
	function qd() {
		var e = A.H;
		return A.H = gc, e === null ? gc : e;
	}
	function Jd() {
		var e = A.A;
		return A.A = $u, e;
	}
	function Yd() {
		ld = 4, ad || (K & 4194048) !== K && No.current !== null || (od = !0), !(q & 134217727) && !(ud & 134217727) || nd === null || Vd(nd, K, fd, !1);
	}
	function Xd(e, t, n) {
		var r = td;
		td |= 2;
		var i = qd(), a = Jd();
		(nd !== e || K !== t) && (bd = null, Wd(e, t)), t = !1;
		var o = ld;
		a: do
			try {
				if (rd !== 0 && G !== null) {
					var s = G, c = id;
					switch (rd) {
						case 8:
							Ud(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							No.current === null && (t = !0);
							var l = rd;
							if (rd = 0, id = null, nf(e, s, c, l), n && od) {
								o = 0;
								break a;
							}
							break;
						default: l = rd, rd = 0, id = null, nf(e, s, c, l);
					}
				}
				Zd(), o = ld;
				break;
			} catch (t) {
				Gd(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, ba = ya = null, td = r, A.H = i, A.A = a, G === null && (nd = null, K = 0, Oi()), o;
	}
	function Zd() {
		for (; G !== null;) ef(G);
	}
	function Qd(e, t) {
		var n = td;
		td |= 2;
		var r = qd(), a = Jd();
		nd !== e || K !== t ? (bd = null, yd = Je() + 500, Wd(e, t)) : od = ht(e, t);
		a: do
			try {
				if (rd !== 0 && G !== null) {
					t = G;
					var o = id;
					b: switch (rd) {
						case 1:
							rd = 0, id = null, nf(e, t, o, 1);
							break;
						case 2:
						case 9:
							if (to(o)) {
								rd = 0, id = null, tf(t);
								break;
							}
							t = function() {
								rd !== 2 && rd !== 9 || nd !== e || (rd = 7), kf(e);
							}, o.then(t, t);
							break a;
						case 3:
							rd = 7;
							break a;
						case 4:
							rd = 5;
							break a;
						case 7:
							to(o) ? (rd = 0, id = null, tf(t)) : (rd = 0, id = null, nf(e, t, o, 7));
							break;
						case 5:
							var s = null;
							switch (G.tag) {
								case 26: s = G.memoizedState;
								case 5:
								case 27:
									var c = G;
									if (s ? Qm(s) : c.stateNode.complete) {
										rd = 0, id = null;
										var l = c.sibling;
										if (l !== null) G = l;
										else {
											var u = c.return;
											u === null ? G = null : (G = u, rf(u));
										}
										break b;
									}
							}
							rd = 0, id = null, nf(e, t, o, 5);
							break;
						case 6:
							rd = 0, id = null, nf(e, t, o, 6);
							break;
						case 8:
							Ud(), ld = 6;
							break a;
						default: throw Error(i(462));
					}
				}
				$d();
				break;
			} catch (t) {
				Gd(e, t);
			}
		while (1);
		return ba = ya = null, A.H = r, A.A = a, td = n, G === null ? (nd = null, K = 0, Oi(), ld) : 0;
	}
	function $d() {
		for (; G !== null && !Ke();) ef(G);
	}
	function ef(e) {
		var t = fl(e.alternate, e, cd);
		e.memoizedProps = e.pendingProps, t === null ? rf(e) : G = t;
	}
	function tf(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = qc(n, t, t.pendingProps, t.type, void 0, K);
				break;
			case 11:
				t = qc(n, t, t.pendingProps, t.type.render, t.ref, K);
				break;
			case 5:
				cs(t);
				var r = t;
				r === oa && (L ? (pa(r), r.tag === 5 && r.stateNode != null && (sa = r.stateNode)) : (pa(r), L = !0));
			default: xl(n, t), t = G = zi(t, cd), t = fl(n, t, cd);
		}
		e.memoizedProps = e.pendingProps, t === null ? rf(e) : G = t;
	}
	function nf(e, t, n, r) {
		ba = ya = null, cs(t), so = null, co = 0;
		var i = t.return;
		try {
			if (Nc(e, i, t, n, K)) {
				ld = 1, Oc(e, Ki(n, e.current)), G = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw G = i, t;
			ld = 1, Oc(e, Ki(n, e.current)), G = null;
			return;
		}
		t.flags & 32768 ? (L || r === 1 ? e = !0 : od || K & 536870912 ? e = !1 : (ad = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = No.current, r !== null && r.tag === 13 && (r.flags |= 16384))), af(t, e)) : rf(t);
	}
	function rf(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				af(t, ad);
				return;
			}
			e = t.return;
			var n = yl(t.alternate, t, cd);
			if (n !== null) {
				G = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				G = t;
				return;
			}
			G = t = e;
		} while (t !== null);
		ld === 0 && (ld = 5);
	}
	function af(e, t) {
		do {
			var n = bl(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, G = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				G = e;
				return;
			}
			G = e = n;
		} while (e !== null);
		ld = 6, G = null;
	}
	function of(e, t, n, r, a, o, s, c, l, u, d, f) {
		e.cancelPendingCommit = null;
		do
			mf();
		while (Sd !== 0);
		if (td & 6) throw Error(i(327));
		if (t !== null) {
			if (t === e.current) throw Error(i(177));
			e === nd && (G = nd = null, K = 0), wd = t, Cd = e, Td = n, Dd = a, Od = r, sf(e, t, n, s, c, l, f);
		}
	}
	function sf(e, t, n, r, i, a, o) {
		var s = t.lanes | t.childLanes;
		if (Ed = s, s |= Di, xt(e, n, s, r, i, a), Ad = null, (n & 335544064) === n ? (jd = za(e), r = 10262) : (jd = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, Sf(Qe, function() {
			return hf(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), Bl = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = A.T, A.T = null, i = xe.p, xe.p = 2, a = td, td |= 4;
			try {
				hu(e, t, n);
			} finally {
				td = a, xe.p = i, A.T = r;
			}
		}
		Sd = 1, Bl ? kd = Fp(o, e.containerInfo, jd, uf, df, lf, ff, hf, cf, null, null) : (uf(), df(), ff());
	}
	function cf(e) {
		if (Sd !== 0) {
			var t = Cd.onRecoverableError;
			t(e, { componentStack: null });
		}
	}
	function lf() {
		Sd === 3 && (Sd = 0, Fu(wd, Cd), Sd = 4);
	}
	function uf() {
		if (Sd === 1) {
			Sd = 0;
			var e = Cd, t = wd, n = Td, r = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || r) {
				r = A.T, A.T = null;
				var i = xe.p;
				xe.p = 2;
				var a = td;
				td |= 4;
				try {
					fu = pu = !1, ju(t, e, n), n = dp;
					var o = Qr(e.containerInfo), s = n.focusedElem, c = n.selectionRange;
					if (o !== s && s && s.ownerDocument && Zr(s.ownerDocument.documentElement, s)) {
						if (c !== null && $r(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Xr(s, h), v = Xr(s, g);
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
					yh = !!up, dp = up = null;
				} finally {
					td = a, xe.p = i, A.T = r;
				}
			}
			e.current = t, Sd = 2;
		}
	}
	function df() {
		if (Sd === 2) {
			Sd = 0;
			var e = Cd, t = wd, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = A.T, A.T = null;
				var r = xe.p;
				xe.p = 2;
				var i = td;
				td |= 4;
				try {
					_u(e, t.alternate, t);
				} finally {
					td = i, xe.p = r, A.T = n;
				}
			}
			Sd = 3;
		}
	}
	function ff() {
		if (Sd === 4 || Sd === 3) {
			Sd = 0;
			var e = kd;
			kd = null, qe();
			var t = Cd, n = wd, r = Td, i = Od, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? Sd = 5 : (Sd = 0, wd = Cd = null, pf(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (xd = null), Et(r), n = n.stateNode, it && typeof it.onCommitFiberRoot == "function") try {
				it.onCommitFiberRoot(rt, n, void 0, (n.current.flags & 128) == 128);
			} catch {}
			if (i !== null) {
				n = A.T, a = xe.p, xe.p = 2, A.T = null;
				try {
					for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
						var c = i[s];
						o(c.value, { componentStack: c.stack });
					}
				} finally {
					A.T = n, xe.p = a;
				}
			}
			if (i = Ad, o = jd, jd = null, i !== null && (Ad = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			Td & 3 && mf(), kf(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === Nd ? Md++ : (Md = 0, Nd = t) : (Md = 0, Nd = null), Af(0, !1);
		}
	}
	function pf(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Ia(t)));
	}
	function mf() {
		return kd !== null && (kd.skipTransition(), kd = null), uf(), df(), ff(), hf();
	}
	function hf() {
		if (Sd !== 5) return !1;
		var e = Cd, t = Ed;
		Ed = 0;
		var n = Et(Td), r = A.T, a = xe.p;
		try {
			xe.p = 32 > n ? 32 : n, A.T = null, n = Dd, Dd = null;
			var o = Cd, s = Td;
			if (Sd = 0, wd = Cd = null, Td = 0, td & 6) throw Error(i(331));
			var c = td;
			if (td |= 4, Xu(o.current), Hu(o, o.current, s, n), td = c, Af(0, !1), it && typeof it.onPostCommitFiberRoot == "function") try {
				it.onPostCommitFiberRoot(rt, o);
			} catch {}
			return !0;
		} finally {
			xe.p = a, A.T = r, pf(e, t);
		}
	}
	function gf(e, t, n) {
		t = Ki(n, t), t = Ac(e.stateNode, t, 2), e = bo(e, t, 2), e !== null && (bt(e, 2), kf(e));
	}
	function J(e, t, n) {
		if (e.tag === 3) gf(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				gf(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (xd === null || !xd.has(r))) {
					e = Ki(n, e), n = jc(2), r = bo(t, n, 2), r !== null && (Mc(n, r, t, e), bt(r, 2), kf(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function _f(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new ed();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (sd = !0, i.add(n), e = vf.bind(null, e, t, n), t.then(e, e));
	}
	function vf(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, nd === e && (K & n) === n && (ld === 4 || ld === 3 && (K & 62914560) === K && 300 > Je() - _d ? td & 2 ? dd |= n : Wd(e, 0) : dd |= n, pd === K && (pd = 0)), kf(e);
	}
	function yf(e, t) {
		t === 0 && (t = vt()), e = ji(e, t), e !== null && (bt(e, t), kf(e));
	}
	function bf(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), yf(e, n);
	}
	function xf(e, t) {
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
		r !== null && r.delete(t), yf(e, n);
	}
	function Sf(e, t) {
		return We(e, t);
	}
	var Cf = null, wf = null, Tf = !1, Ef = !1, Df = !1, Of = 0;
	function kf(e) {
		e !== wf && e.next === null && (wf === null ? Cf = wf = e : wf = wf.next = e), Ef = !0, Tf || (Tf = !0, If());
	}
	function Af(e, t) {
		if (!Df && Ef) {
			Df = !0;
			do
				for (var n = !1, r = Cf; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - ot(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, Ff(r, a));
						} else a = K, a = mt(r, r === nd ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || ht(r, a) || (n = !0, Ff(r, a));
					}
					r = r.next;
				}
			while (n);
			Df = !1;
		}
	}
	function jf() {
		Mf();
	}
	function Mf() {
		Ef = Tf = !1;
		var e = 0;
		Of !== 0 && vp() && (e = Of);
		for (var t = Je(), n = null, r = Cf; r !== null;) {
			var i = r.next, a = Nf(r, t);
			a === 0 ? (r.next = null, n === null ? Cf = i : n.next = i, i === null && (wf = n)) : (n = r, (e !== 0 || a & 3) && (Ef = !0)), r = i;
		}
		Sd !== 0 && Sd !== 5 || Af(e, !1), Of !== 0 && (Of = 0);
	}
	function Nf(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - ot(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = _t(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = nd, n = K, n = mt(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (rd === 2 || rd === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Ge(r), e.callbackNode = null, e.callbackPriority = 0;
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
			return r = Pf.bind(null, e), n = We(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Ge(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function Pf(e, t) {
		if (Sd !== 0 && Sd !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (mf() && e.callbackNode !== n) return null;
		var r = K;
		return r = mt(e, e === nd ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Rd(e, r, t), Nf(e, Je()), e.callbackNode != null && e.callbackNode === n ? Pf.bind(null, e) : null);
	}
	function Ff(e, t) {
		if (mf()) return null;
		Rd(e, t, !0);
	}
	function If() {
		Cp(function() {
			td & 6 ? We(Xe, jf) : Mf();
		});
	}
	function Lf() {
		if (Of === 0) {
			var e = Ha;
			e === 0 && (e = ut, ut <<= 1, !(ut & 261888) && (ut = 256)), Of = e;
		}
		return Of;
	}
	function Rf(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Tn(e);
	}
	function zf(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = Rf((i[jt] || null).action), o = r.submitter;
			o && (t = (t = o[jt] || null) ? Rf(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new Gn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (Of !== 0) {
								var e = new FormData(i, o);
								rc(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = new FormData(i, o), rc(n, {
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
	for (var Bf = 0; Bf < yi.length; Bf++) {
		var Vf = yi[Bf];
		bi(Vf.toLowerCase(), "on" + (Vf[0].toUpperCase() + Vf.slice(1)));
	}
	bi(di, "onAnimationEnd"), bi(fi, "onAnimationIteration"), bi(pi, "onAnimationStart"), bi("dblclick", "onDoubleClick"), bi("focusin", "onFocus"), bi("focusout", "onBlur"), bi(mi, "onTransitionRun"), bi(hi, "onTransitionStart"), bi(gi, "onTransitionCancel"), bi(_i, "onTransitionEnd"), Jt("onMouseEnter", ["mouseout", "mouseover"]), Jt("onMouseLeave", ["mouseout", "mouseover"]), Jt("onPointerEnter", ["pointerout", "pointerover"]), Jt("onPointerLeave", ["pointerout", "pointerover"]), qt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), qt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), qt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), qt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), qt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), qt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var Hf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Uf = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Hf));
	function Wf(e, t) {
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
						F(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						F(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Y(e, t) {
		var n = t[Nt];
		n === void 0 && (n = t[Nt] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Jf(t, e, 2, !1), n.add(r));
	}
	function Gf(e, t, n) {
		var r = 0;
		t && (r |= 4), Jf(n, e, r, t);
	}
	var Kf = "_reactListening" + Math.random().toString(36).slice(2);
	function qf(e) {
		if (!e[Kf]) {
			e[Kf] = !0, Gt.forEach(function(t) {
				t !== "selectionchange" && (Uf.has(t) || Gf(t, !1, e), Gf(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Kf] || (t[Kf] = !0, Gf("selectionchange", !1, t));
		}
	}
	function Jf(e, t, n, r) {
		switch (Eh(t)) {
			case 2:
				var i = bh;
				break;
			case 8:
				i = xh;
				break;
			default: i = Sh;
		}
		n = i.bind(null, t, n, e), i = void 0, !In || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function Yf(e, t, n, r, i) {
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
		Nn(function() {
			var r = a, i = On(n), s = [];
			a: {
				var c = vi.get(e);
				if (c !== void 0) {
					var l = Gn, u = e;
					switch (e) {
						case "keypress": if (Vn(n) === 0) break a;
						case "keydown":
						case "keyup":
							l = cr;
							break;
						case "focusin":
							u = "focus", l = $n;
							break;
						case "focusout":
							u = "blur", l = $n;
							break;
						case "beforeblur":
						case "afterblur":
							l = $n;
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
							l = Zn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							l = Qn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							l = dr;
							break;
						case di:
						case fi:
						case pi:
							l = er;
							break;
						case _i:
							l = fr;
							break;
						case "scroll":
						case "scrollend":
							l = qn;
							break;
						case "wheel":
							l = pr;
							break;
						case "copy":
						case "cut":
						case "paste":
							l = tr;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							l = lr;
							break;
						case "submit":
							l = ur;
							break;
						case "toggle":
						case "beforetoggle": l = mr;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? c === null ? null : c + "Capture" : c;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = Pn(m, p), g != null && d.push(Xf(m, g, h))), f) break;
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
					if (l = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", l && n !== Dn && (u = n.relatedTarget || n.fromElement) && (zt(u) || u[Mt])) break a;
					(c || l) && (u = i.window === i ? i : (l = i.ownerDocument) ? l.defaultView || l.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? zt(l) : null, l !== null && (f = o(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l && (d = Zn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = lr, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? u : Vt(c), h = l == null ? u : Vt(l), u = new d(g, m + "leave", c, n, i), u.target = f, u.relatedTarget = h, g = null, zt(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = c && l ? E(c, l, Qf) : null, c !== null && $f(s, u, c, d, !1), l !== null && f !== null && $f(s, f, l, d, !0)));
				}
				a: {
					if (c = r ? Vt(r) : window, l = c.nodeName && c.nodeName.toLowerCase(), l === "select" || l === "input" && c.type === "file") var _ = Pr;
					else if (Or(c)) {
						if (Fr) _ = Wr;
						else {
							_ = Hr;
							var v = Vr;
						}
					} else l = c.nodeName, !l || l.toLowerCase() !== "input" || c.type !== "checkbox" && c.type !== "radio" ? r && Sn(r.elementType) && (_ = Pr) : _ = Ur;
					if (_ &&= _(e, r)) {
						kr(s, _, n, i);
						break a;
					}
					v && v(e, c, r);
				}
				switch (v = r ? Vt(r) : window, e) {
					case "focusin":
						(Or(v) || v.contentEditable === "true") && (ti = v, ni = r, ri = null);
						break;
					case "focusout":
						ri = ni = ti = null;
						break;
					case "mousedown":
						ii = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						ii = !1, ai(s, n, i);
						break;
					case "selectionchange": if (ei) break;
					case "keydown":
					case "keyup": ai(s, n, i);
				}
				var y;
				if (gr) b: {
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
				else wr ? Sr(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
				b && (yr && n.locale !== "ko" && (wr || b !== "onCompositionStart" ? b === "onCompositionEnd" && wr && (y = Bn()) : (Rn = i, zn = "value" in Rn ? Rn.value : Rn.textContent, wr = !0)), v = Zf(r, b), 0 < v.length && (b = new nr(b, e, null, n, i), s.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = Cr(n), y !== null && (b.data = y)))), (y = vr ? Tr(e, n) : Er(e, n)) && (b = Zf(r, "onBeforeInput"), 0 < b.length && (v = new nr("onBeforeInput", "beforeinput", null, n, i), s.push({
					event: v,
					listeners: b
				}), v.data = y)), zf(s, e, r, n, i);
			}
			Wf(s, t);
		});
	}
	function Xf(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Zf(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = Pn(e, n), i != null && r.unshift(Xf(e, i, a)), i = Pn(e, t), i != null && r.push(Xf(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Qf(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function $f(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = Pn(n, a), l != null && o.unshift(Xf(n, l, c))) : i || (l = Pn(n, a), l != null && o.push(Xf(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var ep = /\r\n?/g, tp = /\u0000|\uFFFD/g;
	function np(e) {
		return (typeof e == "string" ? e : "" + e).replace(ep, "\n").replace(tp, "");
	}
	function rp(e, t) {
		return t = np(t), np(e) === t;
	}
	function X(e, t, n, r, a, o) {
		switch (n) {
			case "children":
				if (typeof r == "string") t === "body" || t === "textarea" && r === "" || vn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") t !== "body" && vn(e, "" + r);
				else return;
				break;
			case "className":
				nn(e, "class", r);
				break;
			case "tabIndex":
				nn(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				nn(e, n, r);
				break;
			case "style":
				xn(e, r, o);
				return;
			case "data": if (t !== "object") {
				nn(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href") || r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Tn(r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof o == "function" && (n === "formAction" ? (t !== "input" && X(e, t, "name", a.name, a, null), X(e, t, "formEncType", a.formEncType, a, null), X(e, t, "formMethod", a.formMethod, a, null), X(e, t, "formTarget", a.formTarget, a, null)) : (X(e, t, "encType", a.encType, a, null), X(e, t, "method", a.method, a, null), X(e, t, "target", a.target, a, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Tn(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = En);
				return;
			case "onScroll":
				r != null && Y("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Y("scrollend", e);
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
				n = Tn(r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
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
				Y("beforetoggle", e), Y("toggle", e), tn(e, "popover", r);
				break;
			case "xlinkActuate":
				rn(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				rn(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				rn(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				rn(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				rn(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				rn(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				rn(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				rn(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				rn(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				tn(e, "is", r);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") n = Cn.get(n) || n, tn(e, n, r);
			else return;
		}
		$t = !0;
	}
	function ip(e, t, n, r, a, o) {
		switch (n) {
			case "style":
				xn(e, r, o);
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
				if (typeof r == "string") vn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") vn(e, "" + r);
				else return;
				break;
			case "onScroll":
				r != null && Y("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Y("scrollend", e);
				return;
			case "onClick":
				r != null && (e.onclick = En);
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
					$t = !0, n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : tn(e, n, r);
				}
				return;
		}
		$t = !0;
	}
	function ap(e, t, n) {
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
				Y("error", e), Y("load", e);
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
						default: X(e, t, o, s, n, null);
					}
				}
				a && X(e, t, "srcSet", n.srcSet, n, null), r && X(e, t, "src", n.src, n, null);
				return;
			case "input":
				Y("invalid", e);
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
						default: X(e, t, r, d, n, null);
					}
				}
				pn(e, o, c, l, u, s, a, !1);
				return;
			case "select":
				for (a in Y("invalid", e), r = s = o = null, n) if (n.hasOwnProperty(a) && (c = n[a], c != null)) switch (a) {
					case "value":
						o = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: X(e, t, a, c, n, null);
				}
				t = o, n = s, e.multiple = !!r, t == null ? n != null && hn(e, !!r, n, !0) : hn(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in Y("invalid", e), o = a = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
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
					default: X(e, t, s, c, n, null);
				}
				_n(e, r, a, o);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: X(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				Y("beforetoggle", e), Y("toggle", e), Y("cancel", e), Y("close", e);
				break;
			case "iframe":
			case "object":
				Y("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < Hf.length; r++) Y(Hf[r], e);
				break;
			case "image":
				Y("error", e), Y("load", e);
				break;
			case "details":
				Y("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": Y("error", e), Y("load", e);
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
					default: X(e, t, u, r, n, null);
				}
				return;
			default: if (Sn(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && ip(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && X(e, t, c, r, n, null));
	}
	var op = {};
	function sp(e, t, n, r) {
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
						default: r.hasOwnProperty(m) || X(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							m !== f && ($t = !0), o = m;
							break;
						case "name":
							m !== f && ($t = !0), a = m;
							break;
						case "checked":
							m !== f && ($t = !0), u = m;
							break;
						case "defaultChecked":
							m !== f && ($t = !0), d = m;
							break;
						case "value":
							m !== f && ($t = !0), s = m;
							break;
						case "defaultValue":
							m !== f && ($t = !0), c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(i(137, t));
							break;
						default: m !== f && X(e, t, p, m, r, f);
					}
				}
				fn(e, s, c, l, u, d, o, a);
				return;
			case "select":
				for (o in m = s = c = p = null, n) if (l = n[o], n.hasOwnProperty(o) && l != null) switch (o) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(o) || X(e, t, o, null, r, l);
				}
				for (a in r) if (o = r[a], l = n[a], r.hasOwnProperty(a) && (o != null || l != null)) switch (a) {
					case "value":
						o !== l && ($t = !0), p = o;
						break;
					case "defaultValue":
						o !== l && ($t = !0), c = o;
						break;
					case "multiple": o !== l && ($t = !0), s = o;
					default: o !== l && X(e, t, a, o, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? hn(e, !!n, n ? [] : "", !1) : hn(e, !!n, t, !0)) : hn(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (a = n[c], n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: X(e, t, c, null, r, a);
				}
				for (s in r) if (a = r[s], o = n[s], r.hasOwnProperty(s) && (a != null || o != null)) switch (s) {
					case "value":
						a !== o && ($t = !0), p = a;
						break;
					case "defaultValue":
						a !== o && ($t = !0), m = a;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (a != null) throw Error(i(91));
						break;
					default: a !== o && X(e, t, s, a, r, o);
				}
				gn(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: X(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						p !== m && ($t = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: X(e, t, l, p, r, m);
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
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && X(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(i(137, t));
						break;
					default: X(e, t, u, p, r, m);
				}
				return;
			default: if (Sn(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && ip(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || ip(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && X(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || X(e, t, f, p, r, m);
	}
	function cp(e) {
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
	function lp() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && cp(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && cp(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var up = null, dp = null;
	function fp(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function pp(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function mp(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function hp(e, t, n, r) {
		return n = fp(n).createElement(e), n[At] = r, n[jt] = t, ap(n, e, t), Ut(n), n;
	}
	function gp(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var _p = null;
	function vp() {
		var e = window.event;
		return e && e.type === "popstate" ? e !== _p && (_p = e, !0) : (_p = null, !1);
	}
	var yp = typeof setTimeout == "function" ? setTimeout : void 0, bp = typeof clearTimeout == "function" ? clearTimeout : void 0, xp = typeof Promise == "function" ? Promise : void 0, Sp = typeof requestAnimationFrame == "function" ? requestAnimationFrame : yp, Cp = typeof queueMicrotask == "function" ? queueMicrotask : xp === void 0 ? yp : function(e) {
		return xp.resolve(null).then(e).catch(wp);
	};
	function wp(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Tp(e) {
		return e === "head";
	}
	function Ep(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$" || n === "/&") {
					if (r === 0) {
						e.removeChild(i), Gh(t);
						return;
					}
					r--;
				} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
				else if (n === "html") bm(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, bm(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[It] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && bm(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Gh(t);
	}
	function Dp(e, t) {
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
	function Op(e, t, n) {
		if (t = CSS.escape(t) === t ? t : "r-" + btoa(t).replace(/=/g, ""), e.style.viewTransitionName = t, n != null && (e.style.viewTransitionClass = n), n = getComputedStyle(e), n.display === "inline") {
			if (t = e.getClientRects(), t.length === 1) var r = 1;
			else for (var i = r = 0; i < t.length; i++) {
				var a = t[i];
				0 < a.width && 0 < a.height && r++;
			}
			r === 1 && (e = e.style, e.display = t.length === 1 ? "inline-block" : "block", e.marginTop = "-" + n.paddingTop, e.marginBottom = "-" + n.paddingBottom);
		}
	}
	function kp(e, t) {
		e = e.style, t = t.style;
		var n = t == null ? null : t.hasOwnProperty("viewTransitionName") ? t.viewTransitionName : t.hasOwnProperty("view-transition-name") ? t["view-transition-name"] : null;
		e.viewTransitionName = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), n = t == null ? null : t.hasOwnProperty("viewTransitionClass") ? t.viewTransitionClass : t.hasOwnProperty("view-transition-class") ? t["view-transition-class"] : null, e.viewTransitionClass = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), e.display === "inline-block" && (t == null ? e.display = e.margin = "" : (n = t.display, e.display = n == null || typeof n == "boolean" ? "" : n, n = t.margin, n == null ? (n = t.hasOwnProperty("marginTop") ? t.marginTop : t["margin-top"], e.marginTop = n == null || typeof n == "boolean" ? "" : n, t = t.hasOwnProperty("marginBottom") ? t.marginBottom : t["margin-bottom"], e.marginBottom = t == null || typeof t == "boolean" ? "" : t) : e.margin = n));
	}
	function Ap(e, t, n) {
		return n = n.ownerDocument.defaultView, {
			rect: e,
			abs: t.position === "absolute" || t.position === "fixed",
			clip: t.clipPath !== "none" || t.overflow !== "visible" || t.filter !== "none" || t.mask !== "none" || t.mask !== "none" || t.borderRadius !== "0px",
			view: 0 <= e.bottom && 0 <= e.right && e.top <= n.innerHeight && e.left <= n.innerWidth
		};
	}
	function jp(e) {
		return Ap(e.getBoundingClientRect(), getComputedStyle(e), e);
	}
	function Mp(e) {
		var t = e.getBoundingClientRect();
		t = new DOMRect(t.x + 2e4, t.y + 2e4, t.width, t.height);
		var n = getComputedStyle(e);
		return Ap(t, n, e);
	}
	function Np(e) {
		return e.documentElement.clientHeight;
	}
	function Pp(e) {
		this.addEventListener("load", e), this.addEventListener("error", e);
	}
	function Fp(e, t, n, r, i, a, o, s, c) {
		var l = t.nodeType === 9 ? t : t.ownerDocument;
		try {
			var u = l.startViewTransition({
				update: function() {
					var t = l.defaultView, n = t.navigation && t.navigation.transition, o = l.fonts.status;
					r();
					var s = [];
					if (o === "loaded" && (Np(l), l.fonts.status === "loading" && s.push(l.fonts.ready)), o = s.length, e !== null) for (var c = e.suspenseyImages, u = 0, d = 0; d < c.length; d++) {
						var f = c[d];
						if (!f.complete) {
							var p = f.getBoundingClientRect();
							if (0 < p.bottom && 0 < p.right && p.top < t.innerHeight && p.left < t.innerWidth) {
								if (u += $m(f), u > nh) {
									s.length = o;
									break;
								}
								f = new Promise(Pp.bind(f)), s.push(f);
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
	function Ip(e, t) {
		this._scope = document.documentElement, this._selector = "::view-transition-" + e + "(" + t + ")";
	}
	Ip.prototype.animate = function(e, t) {
		return t = typeof t == "number" ? { duration: t } : D({}, t), t.pseudoElement = this._selector, this._scope.animate(e, t);
	}, Ip.prototype.getAnimations = function() {
		for (var e = this._scope, t = this._selector, n = e.getAnimations({ subtree: !0 }), r = [], i = 0; i < n.length; i++) {
			var a = n[i].effect;
			a !== null && a.target === e && a.pseudoElement === t && r.push(n[i]);
		}
		return r;
	}, Ip.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function Lp(e) {
		return {
			name: e,
			group: new Ip("group", e),
			imagePair: new Ip("image-pair", e),
			old: new Ip("old", e),
			new: new Ip("new", e)
		};
	}
	function Rp(e) {
		this._fragmentFiber = e, this._observers = this._eventListeners = null;
	}
	Rp.prototype.addEventListener = function(e, t, n) {
		var r = null, i = null;
		if (!(n != null && typeof n != "boolean" && (r = n.signal || null, r !== null && r.aborted))) {
			this._eventListeners === null && (this._eventListeners = []);
			var a = this._eventListeners;
			if (Up(a, e, t, n) === -1) {
				var o = this, s = t;
				n != null && typeof n != "boolean" && !0 === n.once && (s = function(r) {
					o.removeEventListener(e, t, n), typeof t == "function" ? t.call(this, r) : t.handleEvent(r);
				}), r !== null && (i = o.removeEventListener.bind(o, e, t, n), r.addEventListener("abort", i, { once: !0 }), i = r.removeEventListener.bind(r, "abort", i)), r = Vp(n), a.push({
					type: e,
					listener: t,
					optionsOrUseCapture: n,
					attachedListener: s,
					cleanup: i
				}), m(this._fragmentFiber.child, !1, zp, e, s, r);
			}
			this._eventListeners = a;
		}
	};
	function zp(e, t, n, r) {
		return b(e).addEventListener(t, n, r), !1;
	}
	Rp.prototype.removeEventListener = function(e, t, n) {
		var r = this._eventListeners;
		if (r !== null && (t = Up(r, e, t, n), t !== -1)) {
			var i = r[t];
			n = i.attachedListener;
			var a = i.cleanup;
			i = Vp(i.optionsOrUseCapture), m(this._fragmentFiber.child, !1, Bp, e, n, i), r.splice(t, 1), a !== null && a();
		}
	};
	function Bp(e, t, n, r) {
		return b(e).removeEventListener(t, n, r), !1;
	}
	function Vp(e) {
		return e != null && typeof e != "boolean" && (!0 === e.once || e.signal instanceof AbortSignal) ? {
			capture: e.capture,
			passive: e.passive
		} : e;
	}
	function Hp(e) {
		return e == null ? "c=0" : typeof e == "boolean" ? "c=" + (e ? "1" : "0") : "c=" + (e.capture ? "1" : "0");
	}
	function Up(e, t, n, r) {
		if (e.length === 0) return -1;
		r = Hp(r);
		for (var i = 0; i < e.length; i++) {
			var a = e[i];
			if (a.type === t && a.listener === n && Hp(a.optionsOrUseCapture) === r) return i;
		}
		return -1;
	}
	Rp.prototype.dispatchEvent = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return !0;
		t = b(t);
		var n = this._eventListeners;
		if (n !== null && 0 < n.length || !e.bubbles) {
			var r = t.nodeType === 9 ? t.createComment("") : document.createTextNode("");
			if (n) for (var i = 0; i < n.length; i++) {
				var a = n[i];
				r.addEventListener(a.type, a.attachedListener, Vp(a.optionsOrUseCapture));
			}
			if (t.appendChild(r), e = r.dispatchEvent(e), n) for (i = 0; i < n.length; i++) a = n[i], r.removeEventListener(a.type, a.attachedListener, Vp(a.optionsOrUseCapture));
			return t.removeChild(r), e;
		}
		return t.dispatchEvent(e);
	}, Rp.prototype.focus = function(e) {
		m(this._fragmentFiber.child, !0, Wp, e, void 0, void 0);
	};
	function Wp(e, t) {
		return e.tag !== 6 && (e = b(e), gm(e, t));
	}
	Rp.prototype.focusLast = function(e) {
		var t = [];
		m(this._fragmentFiber.child, !0, Gp, t, void 0, void 0);
		for (var n = t.length - 1; 0 <= n && !Wp(t[n], e); n--);
	};
	function Gp(e, t) {
		return t.push(e), !1;
	}
	Rp.prototype.blur = function() {
		var e = g(this._fragmentFiber);
		e !== null && (e = b(e), e = fp(e).activeElement, e !== null && m(this._fragmentFiber.child, !1, Kp, e, void 0, void 0));
	};
	function Kp(e, t) {
		return e.tag !== 6 && (e = b(e), e === t || e.contains(t) ? (t.blur(), !0) : !1);
	}
	Rp.prototype.observeUsing = function(e) {
		this._observers === null && (this._observers = /* @__PURE__ */ new Set()), this._observers.add(e), m(this._fragmentFiber.child, !1, qp, e, void 0, void 0);
	};
	function qp(e, t) {
		return e.tag === 6 || (e = b(e), t.observe(e)), !1;
	}
	Rp.prototype.unobserveUsing = function(e) {
		var t = this._observers;
		if (t !== null && t.has(e)) {
			t.delete(e), m(this._fragmentFiber.child, !1, Jp, e, void 0, void 0);
			for (var n = t = 0; n < Yp.length; n++) {
				var r = Yp[n];
				r.fragmentInstance === this && r.observer === e ? e.unobserve(r.instance) : Yp[t++] = r;
			}
			Yp.length = t;
		}
	};
	function Jp(e, t) {
		return e.tag === 6 || (e = b(e), t.unobserve(e)), !1;
	}
	var Yp = [], Xp = !1;
	function Zp(e, t, n) {
		Yp.push({
			fragmentInstance: e,
			observer: t,
			instance: n
		}), Xp || (Xp = !0, _m(function() {
			Xp = !1;
			var e = Yp;
			Yp = [];
			for (var t = 0; t < e.length; t++) {
				var n = e[t];
				n.observer.unobserve(n.instance);
			}
		}));
	}
	Rp.prototype.getClientRects = function() {
		var e = [];
		return m(this._fragmentFiber.child, !1, Qp, e, void 0, void 0), e;
	};
	function Qp(e, t) {
		if (e.tag === 6) {
			e = e.stateNode;
			var n = e.ownerDocument.createRange();
			n.selectNodeContents(e), t.push.apply(t, n.getClientRects());
		} else e = b(e), t.push.apply(t, e.getClientRects());
		return !1;
	}
	Rp.prototype.getRootNode = function(e) {
		var t = g(this._fragmentFiber);
		return t === null ? this : b(t).getRootNode(e);
	}, Rp.prototype.compareDocumentPosition = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var n = [];
		m(this._fragmentFiber.child, !1, Gp, n, void 0, void 0);
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
		return s = r && a && o & Node.DOCUMENT_POSITION_FOLLOWING && s & Node.DOCUMENT_POSITION_PRECEDING, t = r && t === e || a && i === e || c || s ? Node.DOCUMENT_POSITION_CONTAINED_BY : !r && t === e || !a && i === e ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : o, t & Node.DOCUMENT_POSITION_DISCONNECTED || t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || $p(t, this._fragmentFiber, n[0], n[n.length - 1], e) ? t : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function $p(e, t, n, r, i) {
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
	function em(e, t) {
		var n = e.ownerDocument.createRange();
		n.selectNodeContents(e), e = n.getBoundingClientRect(), window.scrollTo(window.scrollX + e.left, t ? window.scrollY + e.top : window.scrollY + e.bottom - window.innerHeight);
	}
	Rp.prototype.scrollIntoView = function(e) {
		if (typeof e == "object") throw Error(i(566));
		var t = [];
		m(this._fragmentFiber.child, !1, Gp, t, void 0, void 0);
		var n = !1 !== e;
		if (t.length === 0) {
			var r = v(this._fragmentFiber);
			if (r = n ? r[1] || r[0] || g(this._fragmentFiber) : r[0] || r[1], r === null) return;
			if (r.tag === 6) {
				e = b(r), em(e, n);
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
			a.tag === 6 ? (a = b(a), em(a, n)) : b(a).scrollIntoView(e), r += n ? -1 : 1;
		}
	};
	function tm(e, t) {
		return e = b(e), nm(e, t), !1;
	}
	function nm(e, t) {
		e.reactFragments ??= /* @__PURE__ */ new Set(), e.reactFragments.add(t);
	}
	function rm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.addEventListener(i.type, i.attachedListener, Vp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			for (var r = 0, i = 0; i < Yp.length; i++) {
				var a = Yp[i];
				(a.fragmentInstance !== t || a.observer !== n || a.instance !== e) && (Yp[r++] = a);
			}
			Yp.length = r, n.observe(e);
		}), nm(e, t));
	}
	function im(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.removeEventListener(i.type, i.attachedListener, Vp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			typeof n.rootMargin == "string" ? Zp(t, n, e) : n.unobserve(e);
		}), e.reactFragments != null && e.reactFragments.delete(t));
	}
	function am(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					am(n), Rt(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function om(e, t, n, r) {
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
			if (e = fm(e.nextSibling), e === null) break;
		}
		return null;
	}
	function sm(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = fm(e.nextSibling), e === null)) return null;
		return e;
	}
	function cm(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = fm(e.nextSibling), e === null)) return null;
		return e;
	}
	function lm(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function um(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function dm(e, t) {
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
	function fm(e) {
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
	var pm = null;
	function mm(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return fm(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function hm(e) {
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
	function gm(e, t) {
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
	function _m(e) {
		Sp(function() {
			Sp(function(t) {
				return e(t);
			});
		});
	}
	function vm(e, t, n) {
		switch (t = fp(n), e) {
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
	function ym(e, t, n) {
		for (var r in n) {
			var i = n[r];
			n.hasOwnProperty(r) && i != null && X(e, t, r, null, op, i);
		}
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === En && (e.onclick = null), Rt(e);
	}
	function bm(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		Rt(e);
	}
	var xm = /* @__PURE__ */ new Map(), Sm = /* @__PURE__ */ new Set();
	function Cm(e) {
		if (typeof e.getRootNode == "function") {
			var t = e.getRootNode();
			if (t.nodeType === 9 || t.nodeType === 11) return t;
		}
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	var wm = xe.d;
	xe.d = {
		f: Tm,
		r: Em,
		D: km,
		C: Am,
		L: jm,
		m: Mm,
		X: Pm,
		S: Nm,
		M: Fm
	};
	function Tm() {
		var e = wm.f(), t = Hd();
		return e || t;
	}
	function Em(e) {
		var t = Bt(e);
		t !== null && t.tag === 5 && t.type === "form" ? ac(t) : wm.r(e);
	}
	var Dm = typeof document > "u" ? null : document;
	function Om(e, t, n) {
		var r = Dm;
		if (r && typeof t == "string" && t) {
			var i = dn(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), Sm.has(i) || (Sm.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), ap(t, "link", e), Ut(t), r.head.appendChild(t)));
		}
	}
	function km(e) {
		wm.D(e), Om("dns-prefetch", e, null);
	}
	function Am(e, t) {
		wm.C(e, t), Om("preconnect", e, t);
	}
	function jm(e, t, n) {
		wm.L(e, t, n);
		var r = Dm;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + dn(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + dn(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + dn(n.imageSizes) + "\"]")) : i += "[href=\"" + dn(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = Lm(e);
					break;
				case "script": a = Vm(e);
			}
			if (!(xm.has(a) || (e = D({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), xm.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Rm(a)) || t === "script" && r.querySelector(Hm(a))))) {
				var o = r.createElement("link");
				ap(o, "link", e), t === "style" && (o[Lt] = !0, o.onload = o.onerror = function() {
					Wt(o);
				}), Ut(o), r.head.appendChild(o);
			}
		}
	}
	function Mm(e, t) {
		wm.m(e, t);
		var n = Dm;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + dn(r) + "\"][href=\"" + dn(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = Vm(e);
			}
			if (!xm.has(a) && (e = D({
				rel: "modulepreload",
				href: e
			}, t), xm.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(Hm(a))) return;
				}
				r = n.createElement("link"), ap(r, "link", e), Ut(r), n.head.appendChild(r);
			}
		}
	}
	function Nm(e, t, n) {
		wm.S(e, t, n);
		var r = Dm;
		if (r && e) {
			var i = Ht(r).hoistableStyles, a = Lm(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(Rm(a))) s.loading = 5;
				else {
					e = D({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = xm.get(a)) && Gm(e, n);
					var c = o = r.createElement("link");
					Ut(c), ap(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Wm(o, t, r);
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
	function Pm(e, t) {
		wm.X(e, t);
		var n = Dm;
		if (n && e) {
			var r = Ht(n).hoistableScripts, i = Vm(e), a = r.get(i);
			a || (a = n.querySelector(Hm(i)), a || (e = D({
				src: e,
				async: !0
			}, t), (t = xm.get(i)) && Km(e, t), a = n.createElement("script"), Ut(a), ap(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Fm(e, t) {
		wm.M(e, t);
		var n = Dm;
		if (n && e) {
			var r = Ht(n).hoistableScripts, i = Vm(e), a = r.get(i);
			a || (a = n.querySelector(Hm(i)), a || (e = D({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = xm.get(i)) && Km(e, t), a = n.createElement("script"), Ut(a), ap(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Im(e, t, n, r) {
		var a = (a = Ae.current) ? Cm(a) : null;
		if (!a) throw Error(i(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (n = Lm(n.href), t = Ht(a).hoistableStyles, r = t.get(n), r || (r = {
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
					e = Lm(n.href);
					var o = Ht(a).hoistableStyles, s = o.get(e);
					if (s || (a = a.ownerDocument || a, s = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, o.set(e, s), (o = a.querySelector(Rm(e))) ? o._p || (s.instance = o, s.state.loading = 5) : (o = xm.get(e), o || (o = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, xm.set(e, o)), Bm(a, e, o, s.state))), t && r === null) throw Error(i(528, ""));
					return s;
				}
				if (t && r !== null) throw Error(i(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = Vm(n), t = Ht(a).hoistableScripts, r = t.get(n), r || (r = {
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
	function Lm(e) {
		return "href=\"" + dn(e) + "\"";
	}
	function Rm(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function zm(e) {
		return D({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Bm(e, t, n, r) {
		if (t = e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]")) {
			if (!0 !== t[Lt]) {
				r.loading = 1;
				return;
			}
		} else t = e.createElement("link"), t[Lt] = !0, t.onload = t.onerror = Wt.bind(null, t), ap(t, "link", n), Ut(t), e.head.appendChild(t);
		r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		});
	}
	function Vm(e) {
		return "[src=\"" + dn(e) + "\"]";
	}
	function Hm(e) {
		return "script[async]" + e;
	}
	function Um(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + dn(n.href) + "\"]");
				if (r) return t.instance = r, Ut(r), r;
				var a = D({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), Ut(r), ap(r, "style", a), Wm(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				a = Lm(n.href);
				var o = e.querySelector(Rm(a));
				if (o) return t.state.loading |= 4, t.instance = o, Ut(o), o;
				r = zm(n), (a = xm.get(a)) && Gm(r, a), o = (e.ownerDocument || e).createElement("link"), Ut(o);
				var s = o;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), ap(o, "link", r), t.state.loading |= 4, Wm(o, n.precedence, e), t.instance = o;
			case "script": return o = Vm(n.src), (a = e.querySelector(Hm(o))) ? (t.instance = a, Ut(a), a) : (r = n, (a = xm.get(o)) && (r = D({}, n), Km(r, a)), e = e.ownerDocument || e, a = e.createElement("script"), Ut(a), ap(a, "link", r), e.head.appendChild(a), t.instance = a);
			case "void": return null;
			default: throw Error(i(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Wm(r, n.precedence, e));
		return t.instance;
	}
	function Wm(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function Gm(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function Km(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var qm = null;
	function Jm(e, t, n) {
		if (qm === null) {
			var r = /* @__PURE__ */ new Map(), i = qm = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = qm, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
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
	function Ym(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function Xm(e, t, n) {
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
	function Zm(e, t) {
		return e === "img" && t.src != null && t.src !== "" && t.onLoad == null && t.loading !== "lazy";
	}
	function Qm(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function $m(e) {
		return (e.width || 100) * (e.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * .25;
	}
	function eh(e, t) {
		typeof t.decode == "function" && (e.imgCount++, t.complete || (e.imgBytes += $m(t), e.suspenseyImages.push(t)), e = oh.bind(e), t.decode().then(e, e));
	}
	function th(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = Lm(r.href), a = t.querySelector(Rm(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = ah.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, Ut(a);
					return;
				}
				a = t.ownerDocument || t, r = zm(r), (i = xm.get(i)) && Gm(r, i), a = a.createElement("link"), Ut(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), ap(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = ah.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var nh = 0;
	function rh(e, t) {
		return e.stylesheets && e.count === 0 && ch(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && ch(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && nh === 0 && (nh = 62500 * lp());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && ch(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > nh ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function ih(e) {
		if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
			if (e.stylesheets) ch(e, e.stylesheets);
			else if (e.unsuspend) {
				var t = e.unsuspend;
				e.unsuspend = null, t();
			}
		}
	}
	function ah() {
		this.count--, ih(this);
	}
	function oh() {
		this.imgCount--, ih(this);
	}
	var sh = null;
	function ch(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, sh = /* @__PURE__ */ new Map(), t.forEach(lh, e), sh = null, ah.call(e));
	}
	function lh(e, t) {
		if (!(t.state.loading & 4)) {
			var n = sh.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), sh.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = ah.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var uh = {
		$$typeof: ae,
		Provider: null,
		Consumer: null,
		_currentValue: Se,
		_currentValue2: Se,
		_threadCount: 0
	};
	function dh(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = yt(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = yt(0), this.hiddenUpdates = yt(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function fh(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new dh(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = Ii(3, null, null, t), e.current = a, a.stateNode = e, t = Fa(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, _o(a), e;
	}
	function ph(e) {
		return e ? (e = Pi, e) : Pi;
	}
	function mh(e, t, n, r, i, a) {
		i = ph(i), r.context === null ? r.context = i : r.pendingContext = i, r = yo(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = bo(e, r, t), n !== null && (Ld(n, e, t), xo(n, e, t));
	}
	function hh(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function gh(e, t) {
		hh(e, t), (e = e.alternate) && hh(e, t);
	}
	function _h(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = ji(e, 67108864);
			t !== null && Ld(t, e, 67108864), gh(e, 67108864);
		}
	}
	function vh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Pd();
			t = Tt(t);
			var n = ji(e, t);
			n !== null && Ld(n, e, t), gh(e, t);
		}
	}
	var yh = !0;
	function bh(e, t, n, r) {
		var i = A.T;
		A.T = null;
		var a = xe.p;
		try {
			xe.p = 2, Sh(e, t, n, r);
		} finally {
			xe.p = a, A.T = i;
		}
	}
	function xh(e, t, n, r) {
		var i = A.T;
		A.T = null;
		var a = xe.p;
		try {
			xe.p = 8, Sh(e, t, n, r);
		} finally {
			xe.p = a, A.T = i;
		}
	}
	function Sh(e, t, n, r) {
		if (yh) {
			var i = Ch(r);
			if (i === null) Yf(e, t, r, wh, n), Fh(e, r);
			else if (Lh(i, e, t, n, r)) r.stopPropagation();
			else if (Fh(e, r), t & 4 && -1 < Ph.indexOf(e)) {
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
									kf(a), !(td & 6) && (yd = Je() + 500, Af(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = ji(a, 2), s !== null && Ld(s, a, 2), Hd(), gh(a, 2);
					}
					if (a = Ch(r), a === null && Yf(e, t, r, wh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Yf(e, t, r, null, n);
		}
	}
	function Ch(e) {
		return e = On(e), Th(e);
	}
	var wh = null;
	function Th(e) {
		if (wh = null, e = zt(e), e !== null) {
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
		return wh = e, null;
	}
	function Eh(e) {
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
	var Dh = !1, Oh = null, kh = null, Ah = null, jh = /* @__PURE__ */ new Map(), Mh = /* @__PURE__ */ new Map(), Nh = [], Ph = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Fh(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				Oh = null;
				break;
			case "dragenter":
			case "dragleave":
				kh = null;
				break;
			case "mouseover":
			case "mouseout":
				Ah = null;
				break;
			case "pointerover":
			case "pointerout":
				jh.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": Mh.delete(t.pointerId);
		}
	}
	function Ih(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = Bt(t), t !== null && _h(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Lh(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Oh = Ih(Oh, e, t, n, r, i), !0;
			case "dragenter": return kh = Ih(kh, e, t, n, r, i), !0;
			case "mouseover": return Ah = Ih(Ah, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return jh.set(a, Ih(jh.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, Mh.set(a, Ih(Mh.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Rh(e) {
		var t = zt(e.target);
		if (t !== null) {
			var n = o(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = s(n), t !== null) {
						e.blockedOn = t, Ot(e.priority, function() {
							vh(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = c(n), t !== null) {
						e.blockedOn = t, Ot(e.priority, function() {
							vh(n);
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
	function zh(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = Ch(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				Dn = r, n.target.dispatchEvent(r), Dn = null;
			} else return t = Bt(n), t !== null && _h(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Bh(e, t, n) {
		zh(e) && n.delete(t);
	}
	function Vh() {
		Dh = !1, Oh !== null && zh(Oh) && (Oh = null), kh !== null && zh(kh) && (kh = null), Ah !== null && zh(Ah) && (Ah = null), jh.forEach(Bh), Mh.forEach(Bh);
	}
	function Hh(e, n) {
		e.blockedOn === n && (e.blockedOn = null, Dh || (Dh = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, Vh)));
	}
	var Uh = null;
	function Wh(e) {
		Uh !== e && (Uh = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			Uh === e && (Uh = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (Th(r || n) === null) continue;
					break;
				}
				var a = Bt(n);
				a !== null && (e.splice(t, 3), t -= 3, rc(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Gh(e) {
		function t(t) {
			return Hh(t, e);
		}
		Oh !== null && Hh(Oh, e), kh !== null && Hh(kh, e), Ah !== null && Hh(Ah, e), jh.forEach(t), Mh.forEach(t);
		for (var n = 0; n < Nh.length; n++) {
			var r = Nh[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < Nh.length && (n = Nh[0], n.blockedOn === null);) Rh(n), n.blockedOn === null && Nh.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[jt] || null;
			if (typeof a == "function") o || Wh(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[jt] || null) s = o.formAction;
					else if (Th(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Wh(n);
			}
		}
	}
	function Kh() {
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
	function qh(e) {
		this._internalRoot = e;
	}
	Jh.prototype.render = qh.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(i(409));
		var n = t.current;
		mh(n, Pd(), e, t, null, null);
	}, Jh.prototype.unmount = qh.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			mh(e.current, 2, null, e, null, null), Hd(), t[Mt] = null;
		}
	};
	function Jh(e) {
		this._internalRoot = e;
	}
	Jh.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = Dt();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < Nh.length && t !== 0 && t < Nh[n].priority; n++);
			Nh.splice(n, 0, e), n === 0 && Rh(e);
		}
	};
	var Yh = n.version;
	if (Yh !== "19.3.1") throw Error(i(527, Yh, "19.3.1"));
	xe.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
		return e = u(t), e = e === null ? null : f(e), e = e === null ? null : e.stateNode, e;
	};
	var Xh = {
		bundleType: 0,
		version: "19.3.1",
		rendererPackageName: "react-dom",
		currentDispatcherRef: A,
		reconcilerVersion: "19.3.1"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Zh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Zh.isDisabled && Zh.supportsFiber) try {
			rt = Zh.inject(Xh), it = Zh;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!a(e)) throw Error(i(299));
		var n = !1, r = "", o = Tc, s = Ec, c = Dc;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (c = t.onRecoverableError)), t = fh(e, 1, !1, null, null, n, r, null, o, s, c, Kh), e[Mt] = t.current, qf(e), new qh(t);
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
function O(e, t, n = []) {
	return "___" + ee(D(e + t));
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/reduceToClassNameForSlots.js
function te(e, t) {
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
function ne(e, t) {
	let n = {};
	for (let r in e) {
		let [i, a] = te(e[r], t);
		if (a === "") {
			n[r] = "";
			continue;
		}
		let o = O(a, t), s = o + (i === "" ? "" : " " + i);
		x[o] = [e[r], t], n[r] = s;
	}
	return n;
}
//#endregion
//#region node_modules/@griffel/core/src/mergeClasses.js
var re = {};
function k() {
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
	let i = re[n];
	if (i !== void 0) return t + i;
	let a = [];
	for (let t = 0; t < arguments.length; t++) {
		let n = r[t];
		if (n) {
			let t = x[n];
			t && (a.push(t[0]), e = t[1]);
		}
	}
	let o = Object.assign.apply(Object, [{}].concat(a)), [s, c] = te(o, e), l = O(c, e, r), u = l + " " + s;
	return re[n] = u, x[l] = [o, e], t + u;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/normalizeCSSBucketEntry.js
function ie(e) {
	return Array.isArray(e) ? e : [e];
}
//#endregion
//#region node_modules/@griffel/core/src/renderer/createIsomorphicStyleSheet.js
function ae(e, t, n, r) {
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
var oe = /*#__PURE__*/ [
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
function se(e, t, n) {
	return e === "m" || e === "x" ? e + t + n : e + n;
}
function ce(e, t, n, r, i = {}) {
	let a = e === "m", o = e === "x", s = i.m, c = i.x, l = i.p ?? 0, u = se(e, c ?? s ?? "0", l);
	if (!r.stylesheets[u]) {
		let d = t && t.createElement("style"), f = ae(d, e, l, {
			...r.styleElementAttributes,
			...a && { media: s },
			...o && { "data-container": c }
		});
		r.stylesheets[u] = f, t?.head && d && t.head.insertBefore(d, ue(t, n, e, r, i));
	}
	return r.stylesheets[u];
}
function le(e, t, n) {
	return e.getAttribute("data-make-styles-bucket") === t ? t === "m" ? n.m === e.media : t !== "x" || n.x === e.getAttribute(w) : !1;
}
function ue(e, t, n, r, i = {}) {
	let a = oe[n], o = i.m ?? "", s = i.x ?? "", c = i.p ?? 0, l = (e) => a - oe[e.getAttribute(S)], u = e.head.querySelectorAll(`[${S}]`);
	if (n === "m" || n === "x") {
		let t = e.head.querySelectorAll(`[${S}="${n}"]`);
		t.length && (u = t, l = n === "m" ? (e) => r.compareMediaQueries(o, e.media) : (e) => r.compareContainerQueries(s, e.getAttribute("data-container") ?? ""));
	}
	let d = (e) => le(e, n, i) ? c - Number(e.getAttribute(C)) : l(e), f = u.length, p = f - 1;
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
function de(e, t) {
	try {
		e.insertRule(t);
	} catch {}
}
//#endregion
//#region node_modules/@griffel/core/src/renderer/createDOMRenderer.js
var fe = 0, pe = (e, t) => e < t ? -1 : +(e > t);
function me(e = typeof document > "u" ? void 0 : document, t = {}) {
	let { classNameHashSalt: n, unstable_filterCSSRule: r, insertionPoint: i, styleElementAttributes: a, compareMediaQueries: o = pe, compareContainerQueries: s = o } = t, c = {
		classNameHashSalt: n,
		insertionCache: {},
		stylesheets: {},
		styleElementAttributes: Object.freeze(a),
		compareMediaQueries: o,
		compareContainerQueries: s,
		id: `d${fe++}`,
		insertCSSRules(t) {
			for (let n in t) {
				let a = t[n];
				for (let t = 0, o = a.length; t < o; t++) {
					let [o, s] = ie(a[t]), l = ce(n, e, i || null, c, s);
					c.insertionCache[o] || (c.insertionCache[o] = n, r ? r(o) && de(l, o) : de(l, o));
				}
			}
		}
	};
	return c;
}
//#endregion
//#region node_modules/stylis/src/Enum.js
var he = "-moz-", ge = "-webkit-", _e = "comm", ve = "rule", ye = "decl", be = "@media", A = "@import", xe = "@supports", Se = "@namespace", Ce = "@keyframes", we = "@layer", Te = Math.abs, Ee = String.fromCharCode, De = Object.assign;
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
	return Ge(e, t, n, i === 0 ? ve : s, c, l, u, d);
}
function pt(e, t, n, r) {
	return Ge(e, t, n, _e, Ee(qe()), Pe(e, 2, -2), 0, r);
}
function mt(e, t, n, r, i) {
	return Ge(e, t, n, ye, Pe(e, 0, r), Pe(e, r + 1, -1), r, i);
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
		case A:
		case Se:
		case ye: return e.return = e.return || e.value;
		case _e: return "";
		case Ce: return e.return = e.value + "{" + ht(e.children, r) + "}";
		case ve: if (!Fe(e.value = e.props.join(","))) return "";
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
		case ve:
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
		case 5103: return ge + "print-" + e + e;
		case 3191:
		case 6645:
		case 3005:
		case 6391:
		case 5879:
		case 5623:
		case 6135:
		case 4599:
		case 4855: return ge + e + e;
		case 4215:
			if (Ne(e, 9) === 102 || Ne(e, t + 1) === 116) return ge + e + e;
			break;
		case 4789: return he + e + e;
		case 5349:
		case 4246:
		case 6968: return ge + e + he + e + e;
		case 6187: if (!Ae(e, /grab/)) return je(je(je(e, /(zoom-|grab)/, ge + "$1"), /(image-set)/, ge + "$1"), e, "") + e;
		case 5495:
		case 3959: return je(e, /(image-set\([^]*)/, ge + "$1$`$1");
		case 4095:
		case 3583:
		case 4068:
		case 2532: return je(e, /(.+)-inline(.+)/, ge + "$1$2") + e;
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
			case 102: if (Ne(e, t + 3) === 108) return je(e, /(.+:)(.+)-([^]+)/, "$1" + ge + "$2-$3$1" + he + (Ne(e, t + 3) == 108 ? "$3" : "$2-$3")) + e;
			case 115: return ~Me(e, "stretch") ? Gt(je(e, "stretch", "fill-available"), t, n) + e : e;
		}
	}
	return e;
}
function Kt(e, t, n, r) {
	if (e.length > -1 && !e.return) switch (e.type) {
		case ye:
			e.return = Gt(e.value, e.length, n);
			return;
		case ve: if (e.length) return Re(e.props, function(t) {
			switch (Ae(t, /(::plac\w+|:read-\w+)/)) {
				case ":read-only":
				case ":read-write": return ht([Ke(e, { props: [je(t, /:(read-\w+)/, ":" + he + "$1")] })], r);
				case "::placeholder": return ht([Ke(e, { props: [je(t, /:(plac\w+)/, ":" + ge + "input-$1")] }), Ke(e, { props: [je(t, /:(plac\w+)/, ":" + he + "$1")] })], r);
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
		case be:
		case xe:
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
var Zt = /[A-Z]/g, Qt = /^ms-/, $t = {};
function en(e) {
	return "-" + e.toLowerCase();
}
function tn(e) {
	if (Object.prototype.hasOwnProperty.call($t, e)) return $t[e];
	if (e.substr(0, 2) === "--") return e;
	let t = e.replace(Zt, en);
	return $t[e] = Qt.test(t) ? "-" + t : t;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/normalizeNestedProperty.js
function nn(e) {
	return e.charAt(0) === "&" ? e.slice(1) : e;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/compileAtomicCSSRule.js
var rn = /,( *[^ &])/g;
function an(e) {
	return "&" + nn(e.replace(rn, ",&$1"));
}
function on(e, t) {
	return t.reduceRight((e, t) => `${an(t)} { ${e} }`, e);
}
function sn(e, t) {
	let { className: n, selectors: r, property: i, rtlClassName: a, rtlProperty: o, rtlValue: s, value: c } = e, { container: l, layer: u, media: d, scope: f, supports: p } = t, m = `.${n}`, h = on(Array.isArray(c) ? `${c.map((e) => `${tn(i)}: ${e}`).join(";")};` : `${tn(i)}: ${c};`, r), g = f ? `@scope (${m}) ${f} { :scope{${h}} }` : `${m}{${h}}`;
	if (o && a) {
		let e = `.${a}`, t = on(Array.isArray(s) ? `${s.map((e) => `${tn(o)}: ${e}`).join(";")};` : `${tn(o)}: ${s};`, r);
		g += f ? `@scope (${e}) ${f} { :scope{${t}} }` : `${e}{${t}}`;
	}
	return d && (g = `@media ${d} { ${g} }`), u && (g = `@layer ${u} { ${g} }`), p && (g = `@supports ${p} { ${g} }`), l && (g = `@container ${l} { ${g} }`), Xt(g, !0);
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/cssifyObject.js
function cn(e) {
	let t = "";
	for (let n in e) {
		let r = e[n];
		if (typeof r == "string" || typeof r == "number") t += tn(n) + ":" + r + ";";
		else if (Array.isArray(r)) for (let e of r) t += tn(n) + ":" + e + ";";
	}
	return t;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/compileKeyframeCSS.js
function ln(e) {
	let t = "";
	for (let n in e) t += `${n}{${cn(e[n])}}`;
	return t;
}
function un(e, t) {
	let n = `@keyframes ${e} {${t}}`, r = [];
	return ht(ut(n), _t([
		gt,
		Kt,
		vt((e) => r.push(e))
	])), r;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/getStyleBucketName.js
var dn = {
	"us-w": "w",
	"us-v": "i",
	nk: "l",
	si: "v",
	cu: "f",
	ve: "h",
	ti: "a"
};
function fn(e, t) {
	if (t.media) return "m";
	if (t.layer || t.supports) return "t";
	if (t.container) return "x";
	if (e.length > 0) {
		let t = e[0].trim();
		if (t.charCodeAt(0) === 58) return dn[t.slice(4, 8)] || dn[t.slice(3, 5)] || "d";
	}
	return "d";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/shorthands.js
var pn = {
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
function mn(e, t) {
	return e.length === 0 ? t : `${e} and ${t}`;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hashPropertyKey.js
function hn(e, t) {
	return e && t + e;
}
function gn(e) {
	return hn(e.container, "c") + hn(e.media, "m") + hn(e.layer, "l") + hn(e.supports, "s") + hn(e.scope, "o");
}
function _n(e, t, n) {
	let r = D(e + gn(n) + t), i = r.charCodeAt(0);
	return i >= 48 && i <= 57 ? String.fromCharCode(i + 17) + r.slice(1) : r;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hashClassName.js
function vn({ property: e, selector: t, salt: n, value: r }, i) {
	return "f" + D(n + t + gn(i) + e + r.trim());
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isContainerQuerySelector.js
function yn(e) {
	return e.substring(0, 10) === "@container";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isLayerSelector.js
function bn(e) {
	return e.substr(0, 6) === "@layer";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isMediaQuerySelector.js
function xn(e) {
	return e.substr(0, 6) === "@media";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isNestedSelector.js
var Sn = /^(:|\[|>|&)/;
function Cn(e) {
	return Sn.test(e);
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isObject.js
function wn(e) {
	return typeof e == "object" && !!e && Array.isArray(e) === !1;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isResetValue.js
function Tn(e) {
	return e === E;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isScopeSelector.js
function En(e) {
	return e.substring(0, 6) === "@scope";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isSupportQuerySelector.js
function Dn(e) {
	return e.substr(0, 9) === "@supports";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/trimSelector.js
function On(e) {
	return e.replace(/>\s+/g, ">");
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/resolveStyleRules.js
function kn(e) {
	return pn[e];
}
function An(e) {
	return e?.[0] ?? 0;
}
function jn(e, t, n, r) {
	e[t] = r ? [n, r] : n;
}
function Mn(e, t) {
	return t.length > 0 ? [e, Object.fromEntries(t)] : e;
}
function Nn(e, t, n, r, i, a, o) {
	let s = [];
	o !== 0 && s.push(["p", o]), t === "m" && i && s.push(["m", i]), t === "x" && a && s.push(["x", a]), e[t] ?? (e[t] = []), n && e[t].push(Mn(n, s)), r && e[t].push(Mn(r, s));
}
function Pn(e, t = "", n = [], r = {
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
			if (Tn(c)) jn(i, _n(On(n.join("")), s, r), 0, void 0);
			else if (typeof c == "string" || typeof c == "number") {
				let e = On(n.join("")), l = kn(s);
				if (l) {
					let e = l[1];
					Pn(Object.fromEntries(e.map((e) => [e, E])), t, n, r, i, a);
				}
				let u = _n(e, s, r), d = vn({
					value: c.toString(),
					salt: t,
					selector: e,
					property: s
				}, r), f = o && {
					key: s,
					value: o
				} || Vt(s, c), p = f.key !== s || f.value !== c, m = p ? vn({
					value: f.value.toString(),
					property: f.key,
					salt: t,
					selector: e
				}, r) : void 0, h = p ? {
					rtlClassName: m,
					rtlProperty: f.key,
					rtlValue: f.value
				} : void 0, g = fn(n, r), [_, v] = sn({
					className: d,
					selectors: n,
					property: s,
					value: c,
					...h
				}, r);
				jn(i, u, d, m), Nn(a, g, _, v, r.media, r.container, An(l));
			} else if (s === "animationName") {
				let e = Array.isArray(c) ? c : [c], o = [], s = [];
				for (let t of e) {
					let e = ln(t), n = ln(Bt(t)), i = "f" + D(e), c, l = un(i, e), u = [];
					e === n ? c = i : (c = "f" + D(n), u = un(c, n));
					for (let e = 0; e < l.length; e++) Nn(a, "k", l[e], u[e], r.media, r.container, 0);
					o.push(i), s.push(c);
				}
				Pn({ animationName: o.join(", ") }, t, n, r, i, a, s.join(", "));
			} else if (Array.isArray(c)) {
				if (c.length === 0) continue;
				let e = On(n.join("")), o = kn(s);
				if (o) {
					let e = o[1];
					Pn(Object.fromEntries(e.map((e) => [e, E])), t, n, r, i, a);
				}
				let l = _n(e, s, r), u = vn({
					value: c.map((e) => (e ?? "").toString()).join(";"),
					salt: t,
					selector: e,
					property: s
				}, r), d = c.map((e) => Vt(s, e));
				if (d.some((e) => e.key !== d[0].key)) continue;
				let f = d[0].key !== s || d.some((e, t) => e.value !== c[t]), p = f ? vn({
					value: d.map((e) => (e?.value ?? "").toString()).join(";"),
					salt: t,
					property: d[0].key,
					selector: e
				}, r) : void 0, m = f ? {
					rtlClassName: p,
					rtlProperty: d[0].key,
					rtlValue: d.map((e) => e.value)
				} : void 0, h = fn(n, r), [g, _] = sn({
					className: u,
					selectors: n,
					property: s,
					value: c,
					...m
				}, r);
				jn(i, l, u, p), Nn(a, h, g, _, r.media, r.container, An(o));
			} else if (wn(c)) {
				if (Cn(s)) Pn(c, t, n.concat(nn(s)), r, i, a);
				else if (xn(s)) {
					let e = mn(r.media, s.slice(6).trim());
					Pn(c, t, n, {
						...r,
						media: e
					}, i, a);
				} else if (bn(s)) {
					let e = (r.layer ? `${r.layer}.` : "") + s.slice(6).trim();
					Pn(c, t, n, {
						...r,
						layer: e
					}, i, a);
				} else if (Dn(s)) {
					let e = mn(r.supports, s.slice(9).trim());
					Pn(c, t, n, {
						...r,
						supports: e
					}, i, a);
				} else if (yn(s)) {
					let e = s.slice(10).trim();
					Pn(c, t, n, {
						...r,
						container: e
					}, i, a);
				} else if (En(s)) {
					if (r.scope) continue;
					let e = s.slice(6).trim();
					if (e === "" || !e.startsWith("to ")) continue;
					Pn(c, t, n, {
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
function Fn(e, t = "") {
	let n = {}, r = {};
	for (let i in e) {
		let a = e[i], [o, s] = Pn(a, t);
		n[i] = o, Object.keys(s).forEach((e) => {
			r[e] = (r[e] || []).concat(s[e]);
		});
	}
	return [n, r];
}
//#endregion
//#region node_modules/@griffel/core/src/makeStyles.js
function In(e, t = yt) {
	let n = t(), r = null, i = null, a = null, o = null;
	function s(t) {
		let { dir: s, renderer: c } = t;
		r === null && ([r, i] = Fn(e, c.classNameHashSalt));
		let l = s === "ltr";
		return l ? a === null && (a = ne(r, s)) : o === null && (o = ne(r, s)), n(c, i), l ? a : o;
	}
	return s;
}
//#endregion
//#region node_modules/@griffel/core/src/__styles.js
function Ln(e, t, n = yt) {
	let r = n(), i = null, a = null;
	function o(n) {
		let { dir: o, renderer: s } = n, c = o === "ltr";
		return c ? i === null && (i = ne(e, o)) : a === null && (a = ne(e, o)), r(s, t), c ? i : a;
	}
	return o;
}
//#endregion
//#region node_modules/@griffel/core/src/__resetStyles.js
function Rn(e, t, n, r = yt) {
	let i = r();
	function a(r) {
		let { dir: a, renderer: o } = r, s = a === "ltr" ? e : t || e;
		return i(o, Array.isArray(n) ? { r: n } : n), s;
	}
	return a;
}
//#endregion
//#region node_modules/@griffel/react/src/utils/canUseDOM.js
function zn() {
	return typeof window < "u" && !!(window.document && window.document.createElement);
}
//#endregion
//#region node_modules/@griffel/react/src/useInsertionEffect.js
var M = /* @__PURE__ */ l(d(), 1), Bn = M.useInsertionEffect ? M.useInsertionEffect : void 0, Vn = () => {
	let e = {};
	return function(t, n) {
		Bn && zn() ? Bn(() => {
			t.insertCSSRules(n);
		}, [t, n]) : e[t.id] === void 0 && (t.insertCSSRules(n), e[t.id] = !0);
	};
}, Hn = /* @__PURE__ */ s(((e) => {
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
})), N = /* @__PURE__ */ l((/* @__PURE__ */ s(((e, t) => {
	t.exports = Hn();
})))(), 1), Un = /*#__PURE__*/ (0, M.createContext)(/*#__PURE__*/ me());
function Wn() {
	return (0, M.useContext)(Un);
}
//#endregion
//#region node_modules/@griffel/react/src/TextDirectionContext.js
var Gn = /*#__PURE__*/ (0, M.createContext)("ltr"), Kn = ({ children: e, dir: t }) => (0, N.jsx)(Gn.Provider, {
	value: t,
	children: e
});
function qn() {
	return (0, M.useContext)(Gn);
}
//#endregion
//#region node_modules/@griffel/react/src/makeStyles.js
function Jn(e) {
	let t = In(e, Vn);
	return function() {
		let e = qn(), n = Wn();
		return t({
			dir: e,
			renderer: n
		});
	};
}
//#endregion
//#region node_modules/@griffel/react/src/__styles.js
function P(e, t) {
	let n = Ln(e, t, Vn);
	return function() {
		let e = qn(), t = Wn();
		return n({
			dir: e,
			renderer: t
		});
	};
}
//#endregion
//#region node_modules/@griffel/react/src/__resetStyles.js
function Yn(e, t, n) {
	let r = Rn(e, t, n, Vn);
	return function() {
		let e = qn(), t = Wn();
		return r({
			dir: e,
			renderer: t
		});
	};
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/createCSSRuleFromTheme.js
var Xn = {
	"<": "\\3C ",
	">": "\\3E "
};
function Zn(e) {
	return e.replace(/[<>]/g, (e) => Xn[e]);
}
function Qn(e, t) {
	let n = Zn(e);
	return t ? `${n} { ${Zn(Object.keys(t).reduce((e, n) => `${e}--${n}: ${t[n]}; `, ""))} }` : `${n} {}`;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/constants.js
var $n = Symbol.for("fui.slotRenderFunction"), er = Symbol.for("fui.slotElementType"), tr = Symbol.for("fui.slotClassNameProp");
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/slot.js
function nr(e, t) {
	let { defaultProps: n, elementType: r } = t, i = ir(e), a = {
		...n,
		...i,
		[er]: r,
		[tr]: i?.className || n?.className
	};
	return i && typeof i.children == "function" && (a[$n] = i.children, a.children = n?.children), a;
}
function rr(e, t) {
	if (!(e === null || e === void 0 && !t.renderByDefault)) return nr(e, t);
}
function ir(e) {
	return typeof e == "string" || typeof e == "number" || ar(e) || M.isValidElement(e) ? { children: e } : e;
}
var ar = (e) => typeof e == "object" && !!e && Symbol.iterator in e;
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/isResolvedShorthand.js
function or(e) {
	return typeof e == "object" && !!e && !Array.isArray(e) && !M.isValidElement(e);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/isSlot.js
function sr(e) {
	return !!e?.hasOwnProperty(er);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/properties.js
var cr = (...e) => {
	let t = {};
	for (let n of e) {
		let e = Array.isArray(n) ? n : Object.keys(n);
		for (let n of e) t[n] = 1;
	}
	return t;
}, lr = cr(/* @__PURE__ */ "onAuxClick.onAnimationEnd.onAnimationStart.onCopy.onCut.onPaste.onCompositionEnd.onCompositionStart.onCompositionUpdate.onFocus.onFocusCapture.onBlur.onBlurCapture.onChange.onInput.onSubmit.onLoad.onError.onKeyDown.onKeyDownCapture.onKeyPress.onKeyUp.onAbort.onCanPlay.onCanPlayThrough.onDurationChange.onEmptied.onEncrypted.onEnded.onLoadedData.onLoadedMetadata.onLoadStart.onPause.onPlay.onPlaying.onProgress.onRateChange.onSeeked.onSeeking.onStalled.onSuspend.onTimeUpdate.onVolumeChange.onWaiting.onClick.onClickCapture.onContextMenu.onDoubleClick.onDrag.onDragEnd.onDragEnter.onDragExit.onDragLeave.onDragOver.onDragStart.onDrop.onMouseDown.onMouseDownCapture.onMouseEnter.onMouseLeave.onMouseMove.onMouseOut.onMouseOver.onMouseUp.onMouseUpCapture.onSelect.onTouchCancel.onTouchEnd.onTouchMove.onTouchStart.onScroll.onWheel.onPointerCancel.onPointerDown.onPointerEnter.onPointerLeave.onPointerMove.onPointerOut.onPointerOver.onPointerUp.onGotPointerCapture.onLostPointerCapture".split(".")), ur = cr(cr([
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
]), lr, cr([
	"itemID",
	"itemProp",
	"itemRef",
	"itemScope",
	"itemType"
])), dr = cr(ur, ["form"]), fr = cr(ur, [
	"height",
	"loop",
	"muted",
	"preload",
	"src",
	"width"
]), pr = cr(fr, ["poster"]), mr = cr(ur, ["start"]), hr = cr(ur, ["value"]), gr = cr(ur, [
	"download",
	"href",
	"hrefLang",
	"media",
	"referrerPolicy",
	"rel",
	"target",
	"type"
]), _r = cr(ur, ["dateTime"]), vr = cr(ur, [
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
]), yr = cr(vr, /* @__PURE__ */ "accept.alt.autoCorrect.autoCapitalize.autoComplete.checked.dirname.form.height.inputMode.list.max.maxLength.min.minLength.multiple.pattern.placeholder.readOnly.required.src.step.size.type.value.width".split(".")), br = cr(vr, [
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
]), xr = cr(vr, [
	"form",
	"multiple",
	"required"
]), Sr = cr(ur, ["selected", "value"]), Cr = cr(ur, ["cellPadding", "cellSpacing"]), wr = ur, Tr = cr(ur, [
	"colSpan",
	"rowSpan",
	"scope"
]), Er = cr(ur, [
	"colSpan",
	"headers",
	"rowSpan",
	"scope"
]), Dr = cr(ur, ["span"]), Or = cr(ur, ["span"]), kr = cr(ur, ["disabled", "form"]), Ar = cr(ur, [
	"acceptCharset",
	"action",
	"encType",
	"encType",
	"method",
	"noValidate",
	"target"
]), jr = cr(ur, [
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
]), Mr = cr(ur, [
	"alt",
	"crossOrigin",
	"height",
	"loading",
	"src",
	"srcSet",
	"useMap",
	"width"
]), Nr = cr(ur, [
	"open",
	"onCancel",
	"onClose"
]);
function Pr(e, t, n) {
	let r = Array.isArray(t), i = {}, a = Object.keys(e);
	for (let o of a) (!r && t[o] || r && t.indexOf(o) >= 0 || o.indexOf("data-") === 0 || o.indexOf("aria-") === 0) && (!n || n?.indexOf(o) === -1) && (i[o] = e[o]);
	return i;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/getNativeElementProps.js
var Fr = {
	label: dr,
	audio: fr,
	video: pr,
	ol: mr,
	li: hr,
	a: gr,
	button: vr,
	input: yr,
	textarea: br,
	select: xr,
	option: Sr,
	table: Cr,
	tr: wr,
	th: Tr,
	td: Er,
	colGroup: Dr,
	col: Or,
	fieldset: kr,
	form: Ar,
	iframe: jr,
	img: Mr,
	time: _r,
	dialog: Nr
};
function Ir(e, t, n) {
	let r = e && Fr[e] || ur;
	return r.as = 1, Pr(t, r, n);
}
var Lr = ({ primarySlotTagName: e, props: t, excludedPropNames: n }) => ({
	root: {
		style: t.style,
		className: t.className
	},
	primary: Ir(e, t, [
		...n || [],
		"style",
		"className"
	])
}), Rr = (e, t, n) => Ir(t.as ?? e, t, n);
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/omit.js
function zr(e, t) {
	let n = {};
	for (let r in e) t.indexOf(r) === -1 && e.hasOwnProperty(r) && (n[r] = e[r]);
	return n;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useBrowserTimer.js
function Br(e, t) {
	let n = M.useRef(void 0), r = M.useCallback((r, i) => (n.current !== void 0 && t(n.current), n.current = e(r, i), n.current), [t, e]), i = M.useCallback(() => {
		n.current !== void 0 && (t(n.current), n.current = void 0);
	}, [t]);
	return M.useEffect(() => i, [i]), [r, i];
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/ThemeContext/ThemeContext.js
var Vr = M.createContext(void 0), Hr = Vr.Provider, Ur = M.createContext(void 0), Wr = "", Gr = Ur.Provider;
function Kr() {
	return M.useContext(Ur) ?? Wr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/TooltipVisibilityContext/TooltipContext.js
var qr = M.createContext(void 0), Jr = {}, Yr = qr.Provider;
function Xr() {
	return M.useContext(qr) ?? Jr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/ProviderContext/ProviderContext.js
var Zr = M.createContext(void 0), Qr = {
	targetDocument: typeof document == "object" ? document : void 0,
	dir: "ltr"
}, $r = Zr.Provider;
function ei() {
	return M.useContext(Zr) ?? Qr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/OverridesContext/OverridesContext.js
var ti = M.createContext(void 0), ni = ti.Provider;
function ri() {
	return M.useContext(ti) ?? {};
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/CustomStyleHooksContext/CustomStyleHooksContext.js
var ii = M.createContext(void 0), ai = () => {}, oi = ii.Provider, si = (e) => M.useContext(ii)?.[e] ?? ai, ci = M.createContext(void 0);
ci.Provider;
function li() {
	return M.useContext(ci);
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/AnnounceContext/AnnounceContext.js
var ui = M.createContext(void 0);
ui.Provider;
function di() {
	return M.useContext(ui) ?? { announce: () => void 0 };
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useAnimationFrame.js
var fi = (e) => (e(0), 0), pi = (e) => e;
function mi() {
	let { targetDocument: e } = ei(), t = e?.defaultView;
	return Br(t ? t.requestAnimationFrame : fi, t ? t.cancelAnimationFrame : pi);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useControllableState.js
function hi(e) {
	return typeof e == "function";
}
var gi = (e) => {
	"use no memo";
	let [t, n] = M.useState(() => e.defaultState === void 0 ? e.initialState : _i(e.defaultState) ? e.defaultState() : e.defaultState), r = M.useRef(e.state);
	M.useEffect(() => {
		r.current = e.state;
	}, [e.state]);
	let i = M.useCallback((e) => {
		hi(e) && e(r.current);
	}, []);
	return vi(e.state) ? [e.state, i] : [t, n];
};
function _i(e) {
	return typeof e == "function";
}
var vi = (e) => {
	let [t] = M.useState(() => e !== void 0);
	return t;
};
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/ssr/canUseDOM.js
function yi() {
	return typeof window < "u" && !!(window.document && window.document.createElement);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/ssr/SSRContext.js
var bi = { current: 0 }, xi = /*#__PURE__*/ M.createContext(void 0);
function Si() {
	return M.useContext(xi) ?? bi;
}
function Ci() {
	let e = Si() !== bi, [t, n] = M.useState(e);
	return yi() && e && M.useLayoutEffect(() => {
		n(!1);
	}, []), t;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useIsomorphicLayoutEffect.js
var wi = yi() ? M.useLayoutEffect : M.useEffect, F = (e) => {
	let t = M.useRef(() => {
		throw Error("Cannot call an event handler while rendering");
	});
	return wi(() => {
		t.current = e;
	}, [e]), M.useCallback((...e) => {
		let n = t.current;
		return n(...e);
	}, [t]);
};
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useFirstMount.js
function Ti() {
	let e = M.useRef(!0);
	return M.useEffect(() => {
		e.current &&= !1;
	}, []), e.current;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useForceUpdate.js
function Ei() {
	return M.useReducer((e) => e + 1, 0)[1];
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useId.js
var Di = M.createContext(void 0);
Di.Provider;
function Oi() {
	return M.useContext(Di) || "";
}
function ki(e = "fui-", t) {
	let n = Si(), r = Oi(), i = M.useId;
	if (i) {
		let n = i(), a = M.useMemo(() => n.replace(/:/g, ""), [n]);
		return t || `${r}${e}${a}`;
	}
	return M.useMemo(() => t || `${r}${e}${++n.current}`, [
		r,
		e,
		t,
		n
	]);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useMergedRefs.js
function Ai(...e) {
	let t = M.useCallback((n) => {
		t.current = n;
		for (let t of e) typeof t == "function" ? t(n) : t && (t.current = n);
	}, [...e]);
	return t;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useOnClickOutside.js
var ji = (e, t) => !!e?.contains(t), Mi = (e) => {
	let { targetDocument: t } = ei(), n = t?.defaultView, { refs: r, callback: i, element: a, disabled: o, disabledFocusOnIframe: s, contains: c = ji } = e, l = M.useRef(void 0);
	Fi({
		element: a,
		disabled: s || o,
		callback: i,
		refs: r,
		contains: c
	});
	let u = M.useRef(!1), d = F((e) => {
		if (u.current) {
			u.current = !1;
			return;
		}
		let t = e.composedPath()[0];
		r.every((e) => !c(e.current || null, t)) && !o && i(e);
	}), f = F((e) => {
		u.current = r.some((t) => c(t.current || null, e.target));
	});
	M.useEffect(() => {
		if (o) return;
		let e = Ni(n), t = (t) => {
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
}, Ni = (e) => {
	if (e) return typeof e.window == "object" && e.window === e ? e.event : e.ownerDocument?.defaultView?.event ?? void 0;
}, Pi = "fuiframefocus", Fi = (e) => {
	let { disabled: t, element: n, callback: r, contains: i = ji, pollDuration: a = 100, refs: o } = e, s = M.useRef(void 0), c = F((e) => {
		o.every((t) => !i(t.current || null, e.target)) && !t && r(e);
	});
	M.useEffect(() => {
		if (!t) return n?.addEventListener(Pi, c, !0), () => {
			n?.removeEventListener(Pi, c, !0);
		};
	}, [
		n,
		t,
		c
	]), M.useEffect(() => {
		if (!t) return s.current = n?.defaultView?.setInterval(() => {
			let e = n?.activeElement;
			if (e?.tagName === "IFRAME" || e?.tagName === "WEBVIEW") {
				let t = new CustomEvent(Pi, { bubbles: !0 });
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
}, Ii = (e) => {
	let { refs: t, callback: n, element: r, disabled: i, contains: a } = e, o = F((e) => {
		let r = a || ((e, t) => !!e?.contains(t)), o = e.composedPath()[0];
		t.every((e) => !r(e.current || null, o)) && !i && n(e);
	});
	M.useEffect(() => {
		if (!i) return r?.addEventListener("wheel", o), r?.addEventListener("touchmove", o), () => {
			r?.removeEventListener("wheel", o), r?.removeEventListener("touchmove", o);
		};
	}, [
		o,
		r,
		i
	]);
}, Li = (e) => -1, Ri = (e) => void 0;
function zi() {
	let { targetDocument: e } = ei(), t = e?.defaultView;
	return Br(t ? t.setTimeout : Li, t ? t.clearTimeout : Ri);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/getReactElementRef.js
var Bi = !0;
function Vi(e) {
	if (e) return Bi ? e.props.ref : e.ref;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/mergeCallbacks.js
function Hi(e, t) {
	return (...n) => {
		e?.(...n), t?.(...n);
	};
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/isHTMLElement.js
function Ui(e, t) {
	let n = e;
	return !!(n != null && n.ownerDocument?.defaultView && n instanceof n.ownerDocument.defaultView[t?.constructorName ?? "HTMLElement"]);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/isFluentTrigger.js
function Wi(e) {
	return !!e.type.isFluentTriggerComponent;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/applyTriggerPropsToChildren.js
function Gi(e, t) {
	return typeof e == "function" ? e(t) : e ? Ki(e, t) : e || null;
}
function Ki(e, t) {
	if (!M.isValidElement(e) || e.type === M.Fragment) throw Error("A trigger element must be a single element for this component. Please ensure that you're not using React Fragments.");
	if (Wi(e)) {
		let n = Ki(e.props.children, t);
		return M.cloneElement(e, void 0, n);
	}
	return M.cloneElement(e, t);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/getTriggerChild.js
function qi(e) {
	return M.isValidElement(e) ? Wi(e) ? qi(e.props.children) : e : null;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/isVirtualElement.js
function Ji(e) {
	return e && !!e._virtual;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/getParent.js
function Yi(e) {
	return Ji(e) && e._virtual.parent || null;
}
function Xi(e, t = {}) {
	if (!e) return null;
	if (!t.skipVirtual) {
		let t = Yi(e);
		if (t) return t;
	}
	let n = e.parentNode;
	return n && n.nodeType === 11 ? n.host : n;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/elementContains.js
function Zi(e, t) {
	if (!e || !t) return !1;
	if (e === t) return !0;
	{
		let n = /* @__PURE__ */ new WeakSet();
		for (; t;) {
			let r = Xi(t, { skipVirtual: n.has(t) });
			if (n.add(t), r === e) return !0;
			t = r;
		}
	}
	return !1;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/setVirtualParent.js
function Qi(e, t) {
	e && Object.assign(e, { _virtual: { parent: t } });
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/createCompatSlotComponent.js
function $i(e, t) {
	return {
		...t,
		[er]: e
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/jsx/createJSX.js
function ea(e, t) {
	return function(n, r, i, a, o) {
		return sr(r) ? t($i(n, r), null, i, a, o) : sr(n) ? t(n, r, i, a, o) : e(n, r, i, a, o);
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/getMetadataFromSlotComponent.js
function ta(e) {
	let { as: t, [tr]: n, [er]: r, [$n]: i, ...a } = e, o = a, s = typeof r == "string" ? t ?? r : r;
	return typeof s != "string" && t && (o.as = t), {
		elementType: s,
		props: o,
		renderFunction: i
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/Runtime.js
var na = N, ra = (e, t, n) => {
	let { elementType: r, renderFunction: i, props: a } = ta(e), o = {
		...a,
		...t
	};
	return i ? na.jsx(M.Fragment, { children: i(r, o) }, n) : na.jsx(r, o, n);
}, ia = (e, t, n) => {
	let { elementType: r, renderFunction: i, props: a } = ta(e), o = {
		...a,
		...t
	};
	return i ? na.jsx(M.Fragment, { children: i(r, {
		...o,
		children: na.jsxs(M.Fragment, { children: o.children }, void 0)
	}) }, n) : na.jsxs(r, o, n);
}, I = ea(na.jsx, ra), aa = ea(na.jsxs, ia), oa = M.createContext(void 0), sa = {}, L = oa.Provider, ca = () => M.useContext(oa) ?? sa, la = (e, t) => /*#__PURE__*/ I($r, {
	value: t.provider,
	children: /*#__PURE__*/ I(Hr, {
		value: t.theme,
		children: /*#__PURE__*/ I(Gr, {
			value: t.themeClassName,
			children: /*#__PURE__*/ I(oi, {
				value: t.customStyleHooks_unstable,
				children: /*#__PURE__*/ I(Yr, {
					value: t.tooltip,
					children: /*#__PURE__*/ I(Kn, {
						dir: t.textDirection,
						children: /*#__PURE__*/ I(L, {
							value: t.iconDirection,
							children: /*#__PURE__*/ I(ni, {
								value: t.overrides_unstable,
								children: /*#__PURE__*/ aa(e.root, { children: [yi() ? null : /*#__PURE__*/ I("style", {
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
}), ua = "data-tabster", da = "data-tabster-dummy", fa = `:is(${[
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
].join(", ")}):not(:disabled)`, pa = {
	EscapeGroupper: 1,
	Restorer: 2,
	Deloser: 3
}, ma = {
	Invisible: 0,
	PartiallyVisible: 1,
	Visible: 2
}, ha = {
	Source: 0,
	Target: 1
}, ga = {
	Both: 0,
	Vertical: 1,
	Horizontal: 2,
	Grid: 3,
	GridLinear: 4
}, _a = {
	ArrowUp: 1,
	ArrowDown: 2,
	ArrowLeft: 3,
	ArrowRight: 4,
	PageUp: 5,
	PageDown: 6,
	Home: 7,
	End: 8
}, va = {
	Auto: 0,
	Inside: 1,
	Outside: 2
};
//#endregion
//#region node_modules/tabster/dist/esm/Instance.js
function ya(e, t) {
	return e.storageEntry(t)?.tabster;
}
function ba(e, t, n) {
	let r = n || e._noop ? void 0 : t.getAttribute(ua), i = e.storageEntry(t), a;
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
var xa = (e, t, n) => {
	e.addEventListener(t, n, !0);
}, Sa = (e, t, n) => {
	e.removeEventListener(t, n, !0);
}, Ca = "keyborg:focusin", wa = "keyborg:focusout", Ta = 0, Ea = 1, Da = 2, Oa = 3;
function ka(e) {
	let t = e.focus;
	t.__keyborgNativeFocus ? t.__keyborgNativeFocus.call(e) : e.focus();
}
function Aa(e) {
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
		let n = new CustomEvent(wa, {
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
			(!t || !r.has(t)) && (a.delete(e), t && (Sa(t, "focusin", s), Sa(t, "focusout", o)));
		}
		c(t, e.relatedTarget || void 0);
	}, c = (e, t, n) => {
		let r = e.shadowRoot;
		if (r) {
			for (let e of a) if (e.deref() === r) return;
			xa(r, "focusin", s), xa(r, "focusout", o), a.add(new WeakRef(r));
			return;
		}
		let i = {
			relatedTarget: t,
			originalEvent: n
		}, c = new CustomEvent(Ca, {
			cancelable: !0,
			bubbles: !0,
			composed: !0,
			detail: i
		});
		i.isFocusedProgrammatically = e === l[Oa]?.deref(), l[Oa] = void 0, e.dispatchEvent(c);
	}, l = [
		s,
		o,
		a
	];
	t.__keyborgData = l, xa(n, "focusin", s), xa(n, "focusout", o);
	function u() {
		let e = t.__keyborgData;
		return e && (e[Oa] = new WeakRef(this)), d.apply(this, arguments);
	}
	function d() {
		let e = i?.get ? i.get.call(this) : i?.value;
		if (typeof e != "function") throw TypeError("HTMLElement.prototype.focus is not callable");
		return e.apply(this, arguments);
	}
	let f = n.activeElement;
	for (; f && f.shadowRoot;) c(f), f = f.shadowRoot.activeElement;
}
function ja(e) {
	let t = e, n = t.HTMLElement.prototype, r = Object.getOwnPropertyDescriptor(n, "focus")?.value, i = r?.__keyborgFocusDescriptor, a = t.__keyborgData;
	if (a) {
		let e = t.document;
		Sa(e, "focusin", a[Ta]), Sa(e, "focusout", a[Ea]);
		for (let e of a[Da]) {
			let t = e.deref();
			t && (Sa(t, "focusin", a[Ta]), Sa(t, "focusout", a[Ea]));
		}
		a[Da].clear(), delete t.__keyborgData;
	}
	r?.__keyborgNativeFocus && (i ? Object.defineProperty(n, "focus", i) : delete n.focus);
}
var Ma = 0;
function Na(e) {
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
	return xa(d, Ca, s), xa(d, "mousedown", l), xa(e, "keydown", u), xa(d, "touchstart", c), xa(d, "touchend", c), xa(d, "touchcancel", c), Aa(e), {
		dispose: () => {
			if (!t) return;
			r &&= (t.clearTimeout(r), void 0), ja(t);
			let e = t.document;
			Sa(e, Ca, s), Sa(e, "mousedown", l), Sa(t, "keydown", u), Sa(e, "touchstart", c), Sa(e, "touchend", c), Sa(e, "touchcancel", c), t = void 0;
		},
		get isNavigatingWithKeyboard() {
			return n;
		},
		set isNavigatingWithKeyboard(e) {
			a(e);
		}
	};
}
function Pa(e) {
	let t = e, n = "k" + ++Ma, r = t, i, a = [], o = t.__keyborg;
	i = o ? o.core : Na(t);
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
function Fa(e) {
	e.dispose();
}
//#endregion
//#region node_modules/tabster/dist/esm/Events.js
var Ia = "tabster:focusin", La = "tabster:focusout", Ra = "tabster:movefocus", za = "tabster:mover:state", Ba = "tabster:mover:movefocus", Va = "tabster:mover:memorized-element", Ha = "tabster:restorer:restore-focus", Ua = "tabster:root:focus", Wa = "tabster:root:blur", Ga = typeof CustomEvent < "u" ? CustomEvent : function() {}, Ka = class extends Ga {
	constructor(e, t) {
		super(e, {
			bubbles: !0,
			cancelable: !0,
			composed: !0,
			detail: t
		}), this.details = t;
	}
}, qa = class extends Ka {
	constructor(e) {
		super(Ia, e);
	}
}, Ja = class extends Ka {
	constructor(e) {
		super(La, e);
	}
}, Ya = class extends Ka {
	constructor(e) {
		super(Ra, e);
	}
}, Xa = class extends Ka {
	constructor(e) {
		super(za, e);
	}
}, Za = class extends Ka {
	constructor() {
		super(Ha);
	}
}, Qa = class extends Ka {
	constructor(e) {
		super(Ua, e);
	}
}, $a = class extends Ka {
	constructor(e) {
		super(Wa, e);
	}
}, R = {
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
function eo(e) {
	for (let t of Object.keys(e)) R[t] = e[t];
}
//#endregion
//#region node_modules/tabster/dist/esm/Utils.js
var to = 0;
function no(e) {
	let t = e();
	return t.__tabsterInstanceContext ??= {
		elementByUId: {},
		containerBoundingRectCache: {},
		lastContainerBoundingRectCacheId: 0
	};
}
function ro(e) {
	let t = e, n = t.__tabsterInstanceContext;
	n && (n.elementByUId = {}, n.containerBoundingRectCache = {}, n.containerBoundingRectCacheTimer && e.clearTimeout(n.containerBoundingRectCacheTimer), delete t.__tabsterInstanceContext);
}
function io(e) {
	return !!e.querySelector(fa);
}
var ao = class {
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
function oo(e, t, n) {
	if (t.nodeType === Node.ELEMENT_NODE) return R.createTreeWalker(e, t, NodeFilter.SHOW_ELEMENT, { acceptNode: n });
}
function so(e, t) {
	let n = t.__tabsterCacheId, r = no(e), i = n ? r.containerBoundingRectCache[n] : void 0;
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
function co(e, t, n) {
	let r = uo(t);
	if (!r) return !1;
	let i = so(e, r), a = t.getBoundingClientRect(), o = a.height * (1 - n), s = Math.max(0, i.top - a.top) + Math.max(0, a.bottom - i.bottom);
	return s === 0 || s <= o;
}
function lo(e, t, n) {
	let r = uo(t);
	if (r) {
		let i = so(e, r), a = t.getBoundingClientRect();
		n ? r.scrollTop += a.top - i.top : r.scrollTop += a.bottom - i.bottom;
	}
}
function uo(e) {
	let t = e.ownerDocument;
	if (t) {
		for (let t = R.getParentElement(e); t; t = R.getParentElement(t)) if (t.scrollWidth > t.clientWidth || t.scrollHeight > t.clientHeight) return t;
		return t.documentElement;
	}
	return null;
}
function fo(e) {
	e.__shouldIgnoreFocus = !0;
}
function po(e) {
	return !!e.__shouldIgnoreFocus;
}
function mo(e) {
	let t = /* @__PURE__ */ new Uint32Array(4);
	return e.crypto.getRandomValues(t), Array.from(t, (e) => e.toString(36)).join("") + "|" + (++to).toString(36) + "|" + Date.now().toString(36);
}
function ho(e, t) {
	let n = no(e), r = t.__tabsterElementUID ??= mo(e());
	return !n.elementByUId[r] && _o(t.ownerDocument, t) && (n.elementByUId[r] = new ao(t)), r;
}
function go(e, t) {
	let n = no(e).elementByUId;
	for (let e of Object.keys(n)) {
		let r = n[e]?.get();
		t && r && !R.nodeContains(t, r) || delete n[e];
	}
}
function _o(e, t) {
	return R.nodeContains(e?.body, t);
}
function vo(e, t) {
	return typeof e.matches == "function" && e.matches(t);
}
var yo = 0, bo = class {
	constructor(e, t, n) {
		this._tabster = e, this._element = new ao(t), this._props = { ...n }, this.id = "i" + ++yo;
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
function xo(e) {
	let t = null;
	for (let n = R.getLastElementChild(e); n; n = R.getLastElementChild(n)) t = n;
	return t || void 0;
}
function So(e) {
	let t = e.ownerDocument, n = t.defaultView?.getComputedStyle(e);
	return e.offsetParent === null && t.body !== e && n?.position !== "fixed" || n?.visibility === "hidden" || n?.position === "fixed" && (n.display === "none" || e.parentElement?.offsetParent === null && t.body !== e.parentElement);
}
function Co(e) {
	return e.tagName === "INPUT" && !!e.name && e.type === "radio";
}
function wo(e) {
	if (!Co(e)) return;
	let t = e.name, n = [], r;
	for (let i of R.getElementsByName(e, t)) if (Co(i)) {
		let e = i;
		n.push(e), e.checked && (r = e);
	}
	return {
		name: t,
		buttons: new Set(n),
		checked: r
	};
}
function To(e, t, n, r) {
	e?.addEventListener(t, n, r);
}
function Eo(e, t, n, r) {
	e?.removeEventListener(t, n, r);
}
function Do(e, t) {
	return !!e && e.dispatchEvent(t);
}
//#endregion
//#region node_modules/tabster/dist/esm/DummyInput.js
var Oo = 100, ko = class {
	constructor(e, t, n, r, i) {
		this._focusIn = (e) => {
			if (this._fixedTarget) {
				let e = this._fixedTarget.get();
				e && ka(e);
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
		o.tabIndex = 0, o.setAttribute("role", "none"), o.setAttribute(da, ""), o.setAttribute("aria-hidden", "true");
		let s = o.style;
		s.position = "fixed", s.width = s.height = "1px", s.opacity = "0.001", s.zIndex = "-1", s.setProperty("content-visibility", "hidden"), fo(o), this.input = o, this.isFirst = n.isFirst, this.isOutside = t, this._isPhantom = n.isPhantom ?? !1, this._fixedTarget = i, To(o, "focusin", this._focusIn), To(o, "focusout", this._focusOut), o.__tabsterDummyContainer = r, this._isPhantom && (this._disposeTimer = a.setTimeout(() => {
			delete this._disposeTimer, this.dispose();
		}, 0), this._clearDisposeTimeout = () => {
			this._disposeTimer && (a.clearTimeout(this._disposeTimer), delete this._disposeTimer), delete this._clearDisposeTimeout;
		});
	}
	dispose() {
		this._clearDisposeTimeout && this._clearDisposeTimeout();
		let e = this.input;
		e && (delete this._fixedTarget, delete this.onFocusIn, delete this.onFocusOut, delete this.input, Eo(e, "focusin", this._focusIn), Eo(e, "focusout", this._focusOut), delete e.__tabsterDummyContainer, R.getParentNode(e)?.removeChild(e));
	}
	setTopLeft(e, t) {
		let n = this.input?.style;
		n && (n.top = `${e}px`, n.left = `${t}px`);
	}
	_isBackward(e, t, n) {
		return e && !n ? !this.isFirst : !!(n && t.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING);
	}
}, Ao = {
	Root: 1,
	Modalizer: 2,
	Mover: 3,
	Groupper: 4
}, jo = class {
	constructor(e, t, n, r, i, a) {
		this._element = t, this._instance = new No(e, t, this, n, r, i, a);
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
		let a = new ko(e.getWindow, !0, {
			isPhantom: !0,
			isFirst: !0
		}).input;
		if (a) {
			let o, s;
			if (t.tagName === "BODY") o = t, s = n && r || !n && !r ? R.getFirstElementChild(t) : null;
			else {
				n && (!r || r && !e.focusable.isFocusable(t, !1, !0, !0)) ? (o = t, s = r ? t.firstElementChild : null) : (o = R.getParentElement(t), s = n && r || !n && !r ? t : R.getNextElementSibling(t));
				let i, a;
				do
					i = n && r || !n && !r ? R.getPreviousElementSibling(s) : s, a = Po(i), a === t ? s = n && r || !n && !r ? i : R.getNextElementSibling(i) : a = null;
				while (a);
			}
			o && Do(o, new Ya({
				by: "root",
				owner: o,
				next: null,
				relatedEvent: i
			})) && (R.insertBefore(o, a, s), ka(a));
		}
	}
	static addPhantomDummyWithTarget(e, t, n, r) {
		let i = new ko(e.getWindow, !0, {
			isPhantom: !0,
			isFirst: !0
		}, void 0, new ao(r)).input;
		if (i) {
			let e, r;
			io(t) && !n ? (e = t, r = R.getFirstElementChild(t)) : (e = R.getParentElement(t), r = n ? t : R.getNextElementSibling(t)), e && R.insertBefore(e, i, r);
		}
	}
}, Mo = class {
	constructor(e) {
		this._updateQueue = /* @__PURE__ */ new Set(), this._lastUpdateQueueTime = 0, this._changedParents = /* @__PURE__ */ new WeakSet(), this._dummyElements = [], this._dummyCallbacks = /* @__PURE__ */ new WeakMap(), this._domChanged = (e) => {
			this._changedParents.has(e) || (this._changedParents.add(e), !this._updateDummyInputsTimer && (this._updateDummyInputsTimer = this._win?.().setTimeout(() => {
				delete this._updateDummyInputsTimer;
				for (let e of this._dummyElements) {
					let t = e.get();
					if (t) {
						let e = this._dummyCallbacks.get(t);
						if (e) {
							let n = R.getParentNode(t);
							(!n || this._changedParents.has(n)) && e();
						}
					}
				}
				this._changedParents = /* @__PURE__ */ new WeakSet();
			}, Oo)));
		}, this._win = e;
	}
	add(e, t) {
		!this._dummyCallbacks.has(e) && this._win && (this._dummyElements.push(new ao(e)), this._dummyCallbacks.set(e, t), this.domChanged = this._domChanged);
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
			if (delete this._updateTimer, this._lastUpdateQueueTime + Oo <= Date.now()) {
				let e = /* @__PURE__ */ new Map(), t = [];
				for (let n of this._updateQueue) t.push(n(e));
				this._updateQueue.clear();
				for (let e of t) e();
				e.clear();
			} else this._scheduledUpdatePositions();
		}, Oo);
	}
}, No = class {
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
					e ? (r.tabIndex = 0, t = r) : (i.tabIndex = 0, t = i), t && ka(t);
				}
			}
		}, this.moveOutWithDefaultAction = (e, t) => {
			let n = this._firstDummy, r = this._lastDummy;
			if (n && r) {
				this._ensurePosition();
				let i = n.input, a = r.input, o = this._element?.get();
				if (i && a && o) {
					let s;
					e ? !n.isOutside && this._tabster.focusable.isFocusable(o, !0, !0, !0) ? s = o : (n.useDefaultAction = !0, i.tabIndex = 0, s = i) : (r.useDefaultAction = !0, a.tabIndex = 0, s = a), s && Do(o, new Ya({
						by: "root",
						owner: o,
						next: null,
						relatedEvent: t
					})) && ka(s);
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
			for (let s = t; s && s.nodeType === Node.ELEMENT_NODE; s = R.getParentElement(s)) {
				let t = e.get(s);
				if (t === void 0) {
					let n = o.getComputedStyle(s).transform;
					n && n !== "none" && (t = {
						scrollTop: s.scrollTop,
						scrollLeft: s.scrollLeft
					}), e.set(s, t || null);
				}
				t && (r.add(s), n.has(s) || To(s, "scroll", this._addTransformOffsets), i += t.scrollTop, a += t.scrollLeft);
			}
			for (let e of n) r.has(e) || Eo(e, "scroll", this._addTransformOffsets);
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
		this._isOutside = l ? l === va.Outside : (a || u === "UL" || u === "OL" || u === "TABLE") && u !== "LI" && u !== "TD" && u !== "TH", this._firstDummy = new ko(this._getWindow, this._isOutside, { isFirst: !0 }, t), this._lastDummy = new ko(this._getWindow, this._isOutside, { isFirst: !1 }, t);
		let d = this._firstDummy.input;
		d && e._dummyObserver.add(d, this._addDummyInputs), this._firstDummy.onFocusIn = this._onFocusIn, this._firstDummy.onFocusOut = this._onFocusOut, this._lastDummy.onFocusIn = this._onFocusIn, this._lastDummy.onFocusOut = this._onFocusOut, this._element = t, this._addDummyInputs();
	}
	dispose(e, t) {
		if ((this._wrappers = this._wrappers.filter((n) => n.manager !== e && !t)).length === 0) {
			delete (this._element?.get()).__tabsterDummy;
			for (let e of this._transformElements) Eo(e, "scroll", this._addTransformOffsets);
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
				let r = R.getParentNode(e);
				if (r) {
					let i = R.getNextSibling(e);
					i !== n && R.insertBefore(r, n, i), R.getPreviousElementSibling(e) !== t && R.insertBefore(r, t, e);
				}
			} else {
				R.getLastElementChild(e) !== n && R.appendChild(e, n);
				let r = R.getFirstElementChild(e);
				r && r !== t && r.parentNode && R.insertBefore(r.parentNode, t, r);
			}
		}
	}
};
function Po(e) {
	return e?.__tabsterDummyContainer?.get() || null;
}
//#endregion
//#region node_modules/tabster/dist/esm/AttributeHelpers.js
function Fo(e, t) {
	let n = JSON.stringify(e);
	return t === !0 ? n : { [ua]: n };
}
function Io(e, t) {
	for (let n of Object.keys(t)) {
		let r = t[n];
		r ? e[n] = r : delete e[n];
	}
}
function Lo(e, t, n) {
	let r;
	if (n) {
		let t = e.getAttribute(ua);
		if (t) try {
			r = JSON.parse(t);
		} catch {}
	}
	r ||= {}, Io(r, t), Object.keys(r).length > 0 ? e.setAttribute(ua, Fo(r, !0)) : e.removeAttribute(ua);
}
//#endregion
//#region node_modules/tabster/dist/esm/Root.js
var Ro = class extends jo {
	constructor(e, t, n, r) {
		super(e, t, Ao.Root, r, void 0, !0), this._onDummyInputFocus = (e) => {
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
						ka(n);
						return;
					}
				}
				e.input?.blur();
			}
		}, this._setHandlers(this._onDummyInputFocus), this._tabster = e, this._setFocused = n;
	}
}, zo = class extends bo {
	constructor(e, t, n, r, i) {
		super(e, t, r), this._isFocused = !1, this._setFocused = (e) => {
			if (this._setFocusedTimer && (this._tabster.getWindow().clearTimeout(this._setFocusedTimer), delete this._setFocusedTimer), this._isFocused === e) return;
			let t = this._element.get();
			t && (e ? (this._isFocused = !0, this._dummyManager?.setTabbable(!1), Do(t, new Qa({ element: t }))) : this._setFocusedTimer = this._tabster.getWindow().setTimeout(() => {
				delete this._setFocusedTimer, this._isFocused = !1, this._dummyManager?.setTabbable(!0), Do(t, new $a({ element: t }));
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
		this.uid = ho(a, t), this._sys = i, (e.controlTab || e.rootDummyInputs) && this.addDummyInputs();
		let o = a().document;
		To(o, Ca, this._onFocusIn), To(o, wa, this._onFocusOut), this._add();
	}
	addDummyInputs() {
		this._dummyManager ||= new Ro(this._tabster, this._element, this._setFocused, this._sys);
	}
	dispose() {
		this._onDispose(this);
		let e = this._tabster.getWindow(), t = e.document;
		Eo(t, Ca, this._onFocusIn), Eo(t, wa, this._onFocusOut), this._setFocusedTimer && (e.clearTimeout(this._setFocusedTimer), delete this._setFocusedTimer), this._dummyManager?.dispose(), this._remove();
	}
	moveOutWithDefaultAction(e, t) {
		let n = this._dummyManager;
		if (n) n.moveOutWithDefaultAction(e, t);
		else {
			let n = this.getElement();
			n && Ro.moveWithPhantomDummy(this._tabster, n, !0, e, t);
		}
	}
	_add() {}
	_remove() {}
}, Bo = class {
	constructor(e, t) {
		this._autoRootWaiting = !1, this._roots = {}, this._forceDummy = !1, this.rootById = {}, this._autoRootCreate = () => {
			let e = this._win().document, t = e.body;
			if (t) {
				this._autoRootUnwait(e);
				let n = this._autoRoot;
				if (n) return Lo(t, { root: n }, !0), ba(this._tabster, t), ya(this._tabster, t)?.root;
			} else this._autoRootWaiting || (this._autoRootWaiting = !0, To(e, "readystatechange", this._autoRootCreate));
		}, this._onRootDispose = (e) => {
			delete this._roots[e.id];
		}, this._tabster = e, this._win = e.getWindow, this._autoRoot = t, e.queueInit(() => {
			this._autoRoot && this._autoRootCreate();
		});
	}
	_autoRootUnwait(e) {
		Eo(e, "readystatechange", this._autoRootCreate), this._autoRootWaiting = !1;
	}
	dispose() {
		let e = this._win();
		this._autoRootUnwait(e.document), delete this._autoRoot, Object.keys(this._roots).forEach((e) => {
			this._roots[e] && (this._roots[e].dispose(), delete this._roots[e]);
		}), this.rootById = {};
	}
	createRoot(e, t, n) {
		let r = new zo(this._tabster, e, this._onRootDispose, t, n);
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
			let n = ya(e, h);
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
			let t = ya(e, r)?.root;
			if (t) return t;
		}
	}
	onRoot(e, t) {
		t ? delete this.rootById[e.uid] : this.rootById[e.uid] = e;
	}
}, Vo = class {
	constructor(e) {
		this._tabster = e;
	}
	dispose() {}
	getProps(e) {
		let t = ya(this._tabster, e);
		return t && t.focusable || {};
	}
	isFocusable(e, t, n, r) {
		return vo(e, fa) && (t || e.tabIndex !== -1) ? (n || this.isVisible(e)) && (r || this.isAccessible(e)) : !1;
	}
	isVisible(e) {
		if (!e.ownerDocument || e.nodeType !== Node.ELEMENT_NODE || So(e)) return !1;
		let t = e.ownerDocument.body.getBoundingClientRect();
		return t.width !== 0 || t.height !== 0;
	}
	isAccessible(e) {
		for (let t = e; t; t = R.getParentElement(t)) {
			let e = ya(this._tabster, t);
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
			modalizerUserId: c === void 0 && o ? this._tabster.modalizer?.activeId : c || Bo.getTabsterContext(this._tabster, r)?.modalizer?.userId,
			from: i || r,
			isBackward: l,
			isFindAll: e,
			acceptCondition: f,
			hasCustomCondition: p,
			includeProgrammaticallyFocusable: a,
			ignoreAccessibility: s,
			cachedGrouppers: {},
			cachedRadioGroups: {}
		}, h = oo(r.ownerDocument, r, (e) => this._acceptElement(e, m));
		if (!h) return null;
		let g = (t) => {
			let r = m.foundElement ?? m.foundBackward;
			return r && d.push(r), e ? r && (m.found = !1, delete m.foundElement, delete m.foundBackward, delete m.fromCtx, m.from = r, u && !u(r)) ? !1 : !!(r || t) : (r && n && (n.uncontrolled = Bo.getTabsterContext(this._tabster, r)?.uncontrolled), !(!t || r));
		};
		if (i || (n.outOfDOMOrder = !0), i && R.nodeContains(r, i)) h.currentNode = i;
		else if (l) {
			let e = xo(r);
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
		if (n && (e === n || !R.nodeContains(n, e))) return t.found = !0, t.foundElement = n, NodeFilter.FILTER_ACCEPT;
		let r = t.container;
		if (e === r) return NodeFilter.FILTER_SKIP;
		if (!R.nodeContains(r, e) || Po(e) || R.nodeContains(t.rejectElementsFrom, e)) return NodeFilter.FILTER_REJECT;
		let i = t.currentCtx = Bo.getTabsterContext(this._tabster, e);
		if (!i) return NodeFilter.FILTER_SKIP;
		if (po(e)) return this.isFocusable(e, void 0, !0, !0) && (t.skippedFocusable = !0), NodeFilter.FILTER_SKIP;
		if (!t.hasCustomCondition && (e.tagName === "IFRAME" || e.tagName === "WEBVIEW")) return this.isVisible(e) && i.modalizer?.userId === this._tabster.modalizer?.activeId ? (t.found = !0, t.rejectElementsFrom = t.foundElement = e, NodeFilter.FILTER_ACCEPT) : NodeFilter.FILTER_REJECT;
		if (!t.ignoreAccessibility && !this.isAccessible(e)) return this.isFocusable(e, !1, !0, !0) && (t.skippedFocusable = !0), NodeFilter.FILTER_REJECT;
		let a, o = t.fromCtx;
		o ||= t.fromCtx = Bo.getTabsterContext(this._tabster, t.from);
		let s = o?.mover, c = i.groupper, l = i.mover;
		if (a = this._tabster.modalizer?.acceptElement(e, t), a !== void 0 && (t.skippedFocusable = !0), a === void 0 && (c || l || s)) {
			let n = c?.getElement(), i = s?.getElement(), o = l?.getElement();
			if (o && R.nodeContains(i, o) && R.nodeContains(r, i) && (!n || !l || R.nodeContains(i, n)) && (l = s, o = i), n) {
				if (n === r || !R.nodeContains(r, n)) c = void 0;
				else if (!R.nodeContains(n, e)) return NodeFilter.FILTER_REJECT;
			}
			if (o) {
				if (!R.nodeContains(r, o)) l = void 0;
				else if (!R.nodeContains(o, e)) return NodeFilter.FILTER_REJECT;
			}
			c && l && (o && n && !R.nodeContains(n, o) ? l = void 0 : c = void 0), c && (a = c.acceptElement(e, t)), l && (a = l.acceptElement(e, t));
		}
		if (a === void 0 && (a = t.acceptCondition(e) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP, a === NodeFilter.FILTER_SKIP && this.isFocusable(e, !1, !0, !0) && (t.skippedFocusable = !0)), a === NodeFilter.FILTER_ACCEPT && !t.found) {
			if (!t.isFindAll && Co(e) && !e.checked) {
				let n = e.name, r = t.cachedRadioGroups[n];
				if (r || (r = wo(e), r && (t.cachedRadioGroups[n] = r)), r?.checked && r.checked !== e) return NodeFilter.FILTER_SKIP;
			}
			t.isBackward ? (t.foundBackward = e, a = NodeFilter.FILTER_SKIP) : (t.found = !0, t.foundElement = e);
		}
		return a;
	}
}, Ho = {
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
}, Uo = class {
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
function Wo(e, t) {
	let n = e.getParent, r = t;
	do {
		let t = ya(e, r)?.uncontrolled;
		if (t && e.uncontrolled.isUncontrolledCompletely(r, !!t.completely)) return r;
		r = n(r);
	} while (r);
}
var z = {
	[pa.Restorer]: 0,
	[pa.Deloser]: 1,
	[pa.EscapeGroupper]: 2
}, Go = class e extends Uo {
	static {
		this.isTabbing = !1;
	}
	constructor(t, n) {
		super(), this._init = () => {
			let e = this._win(), t = e.document;
			To(t, Ca, this._onFocusIn, !0), To(t, wa, this._onFocusOut, !0), To(e, "keydown", this._onKeyDown, !0);
			let n = R.getActiveElement(t);
			n && n !== t.body && this._setFocusedElement(n), this.subscribe(this._onChanged);
		}, this._onFocusIn = (e) => {
			let t = e.composedPath()[0];
			t && this._setFocusedElement(t, e.detail.relatedTarget, e.detail.isFocusedProgrammatically);
		}, this._onFocusOut = (e) => {
			this._setFocusedElement(void 0, e.detail?.originalEvent.relatedTarget);
		}, this._validateFocusedElement = (e) => {}, this._onKeyDown = (t) => {
			if (t.key !== Ho.Tab || t.ctrlKey) return;
			let n = this.getVal();
			if (!n || !n.ownerDocument || n.contentEditable === "true") return;
			let r = this._tabster, i = r.controlTab, a = Bo.getTabsterContext(r, n);
			if (!a || a.ignoreKeydown(t)) return;
			let o = t.shiftKey, s = e.findNextTabbable(r, a, void 0, n, void 0, o, !0), c = a.root.getElement();
			if (!c) return;
			let l = s?.element, u = Wo(r, n);
			if (l) {
				let e = s.uncontrolled;
				if (a.uncontrolled || R.nodeContains(e, n)) {
					if (!s.outOfDOMOrder && e === a.uncontrolled || u && !R.nodeContains(u, l)) return;
					jo.addPhantomDummyWithTarget(r, n, o, l);
					return;
				}
				if (e && r.focusable.isVisible(e) || l.tagName === "IFRAME" && r.focusable.isVisible(l)) {
					Do(c, new Ya({
						by: "root",
						owner: c,
						next: l,
						relatedEvent: t
					})) && jo.moveWithPhantomDummy(r, e ?? l, !1, o, t);
					return;
				}
				(i || s?.outOfDOMOrder) && Do(c, new Ya({
					by: "root",
					owner: c,
					next: l,
					relatedEvent: t
				})) && (t.preventDefault(), t.stopImmediatePropagation(), ka(l));
			} else !u && Do(c, new Ya({
				by: "root",
				owner: c,
				next: null,
				relatedEvent: t
			})) && a.root.moveOutWithDefaultAction(o, t);
		}, this._onChanged = (e, t) => {
			if (e) Do(e, new qa(t));
			else {
				let e = this._lastVal?.get();
				if (e) {
					let n = { ...t }, r = Bo.getTabsterContext(this._tabster, e)?.modalizer?.userId;
					r && (n.modalizerId = r), Do(e, new Ja(n));
				}
			}
		}, this._tabster = t, this._win = n, t.queueInit(this._init);
	}
	dispose() {
		super.dispose();
		let t = this._win(), n = t.document;
		Eo(n, Ca, this._onFocusIn, !0), Eo(n, wa, this._onFocusOut, !0), Eo(t, "keydown", this._onKeyDown, !0), this.unsubscribe(this._onChanged);
		let r = this._asyncFocus;
		r && (t.clearTimeout(r.timeout), delete this._asyncFocus), delete e._lastResetElement, delete this._nextVal, delete this._lastVal;
	}
	static forgetMemorized(t, n) {
		let r = e._lastResetElement, i = r && r.get();
		i && R.nodeContains(n, i) && delete e._lastResetElement, i = t._nextVal?.element?.get(), i && R.nodeContains(n, i) && delete t._nextVal, r = t._lastVal, i = r && r.get(), i && R.nodeContains(n, i) && delete t._lastVal;
	}
	getFocusedElement() {
		return this.getVal();
	}
	getLastFocusedElement() {
		let e = this._lastVal?.get();
		return (!e || e && !_o(e.ownerDocument, e)) && (this._lastVal = e = void 0), e;
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
			let n = Bo.getTabsterContext(this._tabster, r);
			n && (a = e.findNextTabbable(this._tabster, n, r, void 0, void 0, !t, i)?.element);
		}
		return a && !R.nodeContains(r, a) && (a = void 0), a || void 0;
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
			t.tabIndex = -1, t.setAttribute("aria-hidden", "true"), e._lastResetElement = new ao(t), this.focus(t, !0, !0), this._setOrRemoveAttribute(t, "tabindex", n), this._setOrRemoveAttribute(t, "aria-hidden", r);
		}
		return !0;
	}
	requestAsyncFocus(e, t, n) {
		let r = this._tabster.getWindow(), i = this._asyncFocus;
		if (i) {
			if (z[e] > z[i.source]) return;
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
			if (e._lastResetElement = void 0, n === t || po(t)) return;
			i.isFocusedProgrammatically = r;
			let a = Bo.getTabsterContext(this._tabster, t)?.modalizer?.userId;
			a && (i.modalizerId = a);
		}
		let a = this._nextVal = {
			element: t ? new ao(t) : void 0,
			detail: i
		};
		t && t !== this._val && this._validateFocusedElement(t), this._nextVal === a && this.setVal(t, i), this._nextVal = void 0;
	}
	setVal(e, t) {
		super.setVal(e, t), e && (this._lastVal = new ao(e));
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
				let a = n !== f && R.getParentElement(n.getElement());
				if (a) {
					let c = Bo.getTabsterContext(t, i, { referenceElement: a });
					if (c) {
						let i = n.getElement(), u = o ? i : i && xo(i) || i;
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
}, Ko = class extends Uo {
	constructor(e) {
		super(), this._onChange = (e) => {
			this.setVal(e, void 0);
		}, this._keyborg = Pa(e()), this._keyborg.subscribe(this._onChange);
	}
	dispose() {
		super.dispose(), this._keyborg && (this._keyborg.unsubscribe(this._onChange), Fa(this._keyborg), delete this._keyborg);
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
function qo(e, t, n, r) {
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
		a ||= no(i).elementByUId, c(t, n);
		let r = oo(e, t, (e) => c(e, n));
		if (r) for (; r.nextNode(););
	}
	function c(e, r) {
		if (!e.getAttribute) return NodeFilter.FILTER_SKIP;
		let i = e.__tabsterElementUID;
		return i && a && (r ? delete a[i] : a[i] ??= new ao(e)), (ya(t, e) || e.hasAttribute("data-tabster")) && n(t, e, r), NodeFilter.FILTER_SKIP;
	}
	let l = R.createMutationObserver(o);
	return r && s(i().document.body), l.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: [ua]
	}), () => {
		l.disconnect();
	};
}
//#endregion
//#region node_modules/tabster/dist/esm/Uncontrolled.js
var Jo = class {
	constructor(e) {
		this._isUncontrolledCompletely = e;
	}
	isUncontrolledCompletely(e, t) {
		let n = this._isUncontrolledCompletely?.(e, t);
		return n === void 0 ? t : n;
	}
}, Yo = [
	"input",
	"textarea",
	"*[contenteditable]"
].join(", "), Xo = class extends jo {
	constructor(e, t, n, r) {
		super(t, e, Ao.Mover, r), this._onFocusDummyInput = (e) => {
			let t = this._element.get(), n = e.input;
			if (t && n) {
				let r = Bo.getTabsterContext(this._tabster, t), i;
				r && (i = Go.findNextTabbable(this._tabster, r, void 0, n, void 0, !e.isFirst, !0)?.element);
				let a = this._getMemorized()?.get();
				a && this._tabster.focusable.isFocusable(a) && (i = a), i && ka(i);
			}
		}, this._tabster = t, this._getMemorized = n, this._setHandlers(this._onFocusDummyInput);
	}
}, Zo = 1, Qo = 2, $o = 3, es = class extends bo {
	constructor(e, t, n, r, i) {
		super(e, t, r), this._visible = {}, this._onIntersection = (e) => {
			for (let t of e) {
				let e = t.target, n = ho(this._win, e), r, i = this._fullyVisible;
				if (t.intersectionRatio >= .25 ? (r = t.intersectionRatio >= .75 ? ma.Visible : ma.PartiallyVisible, r === ma.Visible && (i = n)) : r = ma.Invisible, this._visible[n] !== r) {
					r === void 0 ? (delete this._visible[n], i === n && delete this._fullyVisible) : (this._visible[n] = r, this._fullyVisible = i);
					let t = this.getState(e);
					t && Do(e, new Xa(t));
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
		e.controlTab || (this.dummyManager = new Xo(this._element, e, a, i));
	}
	dispose() {
		this._onDispose(this), this._intersectionObserver && (this._intersectionObserver.disconnect(), delete this._intersectionObserver), delete this._current, delete this._fullyVisible, delete this._allElements, delete this._updateQueue, this._unobserve && (this._unobserve(), delete this._unobserve);
		let e = this._win();
		this._setCurrentTimer && (e.clearTimeout(this._setCurrentTimer), delete this._setCurrentTimer), this._updateTimer && (e.clearTimeout(this._updateTimer), delete this._updateTimer), this.dummyManager?.dispose(), delete this.dummyManager;
	}
	setCurrent(e) {
		this._current = e ? new ao(e) : void 0, (this._props.trackState || this._props.visibilityAware) && !this._setCurrentTimer && (this._setCurrentTimer = this._win().setTimeout(() => {
			delete this._setCurrentTimer;
			let e = [];
			this._current !== this._prevCurrent && (e.push(this._current), e.push(this._prevCurrent), this._prevCurrent = this._current);
			for (let t of e) {
				let e = t?.get();
				if (e && this._allElements?.get(e) === this) {
					let t = this._props;
					if (e && (t.visibilityAware !== void 0 || t.trackState)) {
						let t = this.getState(e);
						t && Do(e, new Xa(t));
					}
				}
			}
		}));
	}
	getCurrent() {
		return this._current?.get() || null;
	}
	findNextTabbable(e, t, n, r) {
		let i = this.getElement(), a = i && Po(e) === i;
		if (!i) return null;
		let o = null, s = !1, c;
		if (this._props.tabbable || a || e && !R.nodeContains(i, e)) {
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
		if (!Go.isTabbing) return t.currentCtx?.excludedFromMover ? NodeFilter.FILTER_REJECT : void 0;
		let { memorizeCurrent: n, visibilityAware: r, hasDefault: i = !0 } = this._props, a = this.getElement();
		if (a && (n || r || i) && (!R.nodeContains(a, t.from) || Po(t.from) === a)) {
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
					let n = ho(this._win, e), i = this._visible[n];
					return a !== e && !!this._allElements?.get(e) && t.acceptCondition(e) && (i === ma.Visible || i === ma.PartiallyVisible && (r === ma.PartiallyVisible || !this._fullyVisible));
				}
			})), e) return t.found = !0, t.foundElement = e, t.rejectElementsFrom = a, t.skippedFocusable = !0, NodeFilter.FILTER_ACCEPT;
		}
	}
	_observeState() {
		let e = this.getElement();
		if (this._unobserve || !e || typeof MutationObserver > "u") return;
		let t = this._win(), n = this._allElements = /* @__PURE__ */ new WeakMap(), r = this._tabster.focusable, i = this._updateQueue = [], a = R.createMutationObserver((e) => {
			for (let t of e) {
				let e = t.target, n = t.removedNodes, r = t.addedNodes;
				if (t.type === "attributes") t.attributeName === "tabindex" && i.push({
					element: e,
					type: Qo
				});
				else {
					for (let e = 0; e < n.length; e++) i.push({
						element: n[e],
						type: $o
					});
					for (let e = 0; e < r.length; e++) i.push({
						element: r[e],
						type: Zo
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
			let i = oo(t.document, e, (e) => {
				let { mover: t, groupper: n } = d(e);
				if (t && t !== this) return NodeFilter.FILTER_REJECT;
				let i = n?.getFirst(!0);
				return n && n.getElement() !== e && i && i !== e ? NodeFilter.FILTER_REJECT : (r.isFocusable(e) && o(e), NodeFilter.FILTER_SKIP);
			});
			if (i) for (i.currentNode = e; i.nextNode(););
		}, l = (e) => {
			n.get(e) && o(e, !0);
			for (let t = R.getFirstElementChild(e); t; t = R.getNextElementSibling(t)) l(t);
		}, u = () => {
			!this._updateTimer && i.length && (this._updateTimer = t.setTimeout(() => {
				delete this._updateTimer;
				for (let { element: e, type: t } of i) switch (t) {
					case Qo:
						s(e);
						break;
					case Zo:
						c(e);
						break;
					case $o: l(e);
				}
				i = this._updateQueue = [];
			}, 0));
		}, d = (e) => {
			let t = {};
			for (let n = e; n; n = R.getParentElement(n)) {
				let e = ya(this._tabster, n);
				if (e && (e.groupper && !t.groupper && (t.groupper = e.groupper), e.mover)) {
					t.mover = e.mover;
					break;
				}
			}
			return t;
		};
		i.push({
			element: e,
			type: Zo
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
		let t = ho(this._win, e);
		if (t in this._visible) {
			let n = this._visible[t] || ma.Invisible;
			return {
				isCurrent: this._current ? this._current.get() === e : void 0,
				visibility: n
			};
		}
	}
};
function ts(e, t, n, r, i, a, o, s) {
	let c = n < i ? i - n : o < e ? e - o : 0, l = r < a ? a - r : s < t ? t - s : 0;
	return c === 0 ? l : l === 0 ? c : Math.sqrt(c * c + l * l);
}
var ns = class {
	constructor(e, t) {
		this._init = () => {
			let e = this._win();
			To(e, "keydown", this._onKeyDown, !0), To(e, Ba, this._onMoveFocus), To(e, Va, this._onMemorizedElement), this._tabster.focusedElement.subscribe(this._onFocus);
		}, this._onMoverDispose = (e) => {
			delete this._movers[e.id];
		}, this._onFocus = (e) => {
			let t = e, n = e;
			for (let r = R.getParentElement(e); r; r = R.getParentElement(r)) {
				let e = ya(this._tabster, r)?.mover;
				e && (e.setCurrent(n), t = void 0), !t && this._tabster.focusable.isFocusable(r) && (t = n = r);
			}
		}, this._onKeyDown = async (e) => {
			if (this._ignoredInputTimer && (this._win().clearTimeout(this._ignoredInputTimer), delete this._ignoredInputTimer), this._ignoredInputResolve?.(!1), e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
			let t = e.key, n;
			if (t === Ho.ArrowDown ? n = _a.ArrowDown : t === Ho.ArrowRight ? n = _a.ArrowRight : t === Ho.ArrowUp ? n = _a.ArrowUp : t === Ho.ArrowLeft ? n = _a.ArrowLeft : t === Ho.PageDown ? n = _a.PageDown : t === Ho.PageUp ? n = _a.PageUp : t === Ho.Home ? n = _a.Home : t === Ho.End && (n = _a.End), !n) return;
			let r = this._tabster.focusedElement.getFocusedElement();
			r && !await this._isIgnoredInput(r, t) && this._moveFocus(r, n, e);
		}, this._onMoveFocus = (e) => {
			let t = e.composedPath()[0], n = e.detail?.key;
			t && n !== void 0 && !e.defaultPrevented && (this._moveFocus(t, n), e.stopImmediatePropagation());
		}, this._onMemorizedElement = (e) => {
			let t = e.composedPath()[0], n = e.detail?.memorizedElement;
			if (t) {
				let r = Bo.getTabsterContext(this._tabster, t)?.mover;
				r && (n && !R.nodeContains(r.getElement(), n) && (n = void 0), r.setCurrent(n), e.stopImmediatePropagation());
			}
		}, this._tabster = e, this._win = t, this._movers = {}, e.queueInit(this._init);
	}
	dispose() {
		let e = this._win();
		this._tabster.focusedElement.unsubscribe(this._onFocus), this._ignoredInputResolve?.(!1), this._ignoredInputTimer && (e.clearTimeout(this._ignoredInputTimer), delete this._ignoredInputTimer), Eo(e, "keydown", this._onKeyDown, !0), Eo(e, Ba, this._onMoveFocus), Eo(e, Va, this._onMemorizedElement), Object.keys(this._movers).forEach((e) => {
			this._movers[e] && (this._movers[e].dispose(), delete this._movers[e]);
		});
	}
	createMover(e, t, n) {
		let r = new es(this._tabster, e, this._onMoverDispose, t, n);
		return this._movers[r.id] = r, r;
	}
	moveFocus(e, t) {
		return this._moveFocus(e, t);
	}
	_moveFocus(e, t, n) {
		let r = this._tabster, i = Bo.getTabsterContext(r, e, { checkRtl: !0 });
		if (!i || !i.mover || i.excludedFromMover || n && i.ignoreKeydown(n)) return null;
		let a = i.mover, o = a.getElement();
		if (i.groupperBeforeMover) {
			let e = i.groupper;
			if (e && !e.isActive(!0)) {
				for (let t = R.getParentElement(e.getElement()); t && t !== o; t = R.getParentElement(t)) if (ya(r, t)?.groupper?.isActive(!0)) return null;
			} else return null;
		}
		if (!o) return null;
		let s = r.focusable, c = a.getProps(), l = c.direction || ga.Both, u = l === ga.Both, d = u || l === ga.Vertical, f = u || l === ga.Horizontal, p = l === ga.GridLinear, m = p || l === ga.Grid, h = c.cyclic, g, _, v, y = 0, b = 0;
		if (m && (v = e.getBoundingClientRect(), y = Math.ceil(v.left), b = Math.floor(v.right)), i.rtl && (t === _a.ArrowRight ? t = _a.ArrowLeft : t === _a.ArrowLeft && (t = _a.ArrowRight)), t === _a.ArrowDown && d || t === _a.ArrowRight && (f || m)) {
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
		} else if (t === _a.ArrowUp && d || t === _a.ArrowLeft && (f || m)) {
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
		} else if (t === _a.Home) m ? s.findElement({
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
		else if (t === _a.End) m ? s.findElement({
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
		else if (t === _a.PageUp) {
			if (s.findElement({
				currentElement: e,
				container: o,
				useActiveModalizer: !0,
				isBackward: !0,
				acceptCondition: (e) => s.isFocusable(e) ? !co(this._win, e, a.visibilityTolerance) || (g = e, !1) : !1
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
		} else if (t === _a.PageDown) {
			if (s.findElement({
				currentElement: e,
				container: o,
				useActiveModalizer: !0,
				acceptCondition: (e) => s.isFocusable(e) ? !co(this._win, e, a.visibilityTolerance) || (g = e, !1) : !1
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
			let n = t === _a.ArrowUp, r = y, i = Math.ceil(v.top), a = b, c = Math.floor(v.bottom), l, u, d = 0;
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
						let t = ts(r, i, a, c, o, s, f, p);
						(u === void 0 || t < u) && (u = t, l = e);
					} else if (d > 0) return !1;
					return !0;
				}
			}), g = l;
		}
		return g && (!n || n && Do(o, new Ya({
			by: "mover",
			owner: o,
			next: g,
			relatedEvent: n
		}))) ? (_ !== void 0 && lo(this._win, g, _), n && (n.preventDefault(), n.stopImmediatePropagation()), ka(g), g) : null;
	}
	async _isIgnoredInput(e, t) {
		if (e.getAttribute("aria-expanded") === "true" && (e.hasAttribute("aria-activedescendant") || e.getAttribute("role") === "combobox")) return !0;
		if (vo(e, Yo)) {
			let n = 0, r = 0, i = 0, a;
			if (e.tagName === "INPUT" || e.tagName === "TEXTAREA") {
				let a = e.type;
				if (i = (e.value || "").length, a === "email" || a === "number") {
					if (i) {
						let n = R.getSelection(e);
						if (n) {
							let e = n.toString().length, r = t === Ho.ArrowLeft || t === Ho.ArrowUp;
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
				let { anchorNode: o, focusNode: s, anchorOffset: c, focusOffset: l } = R.getSelection(e) || {};
				this._ignoredInputTimer = a.setTimeout(() => {
					delete this._ignoredInputTimer;
					let { anchorNode: t, focusNode: a, anchorOffset: u, focusOffset: d } = R.getSelection(e) || {};
					if (t !== o || a !== s || u !== c || d !== l) this._ignoredInputResolve?.(!1);
					else {
						if (n = u || 0, r = d || 0, i = e.textContent?.length || 0, t && a && R.nodeContains(e, t) && R.nodeContains(e, a) && t !== e) {
							let i = !1, o = (e) => {
								if (e === t) i = !0;
								else if (e === a) return !0;
								let s = e.textContent;
								if (s && !R.getFirstChild(e)) {
									let e = s.length;
									i ? a !== t && (r += e) : (n += e, r += e);
								}
								let c = !1;
								for (let t = R.getFirstChild(e); t && !c; t = t.nextSibling) c = o(t);
								return c;
							};
							o(e);
						}
						this._ignoredInputResolve?.(!0);
					}
				}, 0);
			}));
			if (a && !await a || n !== r || n > 0 && (t === Ho.ArrowLeft || t === Ho.ArrowUp || t === Ho.Home) || n < i && (t === Ho.ArrowRight || t === Ho.ArrowDown || t === Ho.End)) return !0;
		}
		return !1;
	}
};
//#endregion
//#region node_modules/tabster/dist/esm/get/getMover.js
function rs(e) {
	let t = e.core;
	if (!t.mover) {
		let e = new ns(t, t.getWindow);
		t.mover = e, t.attrHandlers.set("mover", (t, n, r, i, a) => n ? (n.setProps(r), n) : e.createMover(t, r, a));
	}
	return t.mover;
}
//#endregion
//#region node_modules/tabster/dist/esm/Restorer.js
var is = class extends bo {
	constructor(e, t, n) {
		if (super(e, t, n), this._hasFocus = !1, this._onFocusOut = (e) => {
			let t = this._element?.get();
			t && e.relatedTarget === null && Do(t, new Za()), t && !R.nodeContains(t, e.relatedTarget) && (this._hasFocus = !1);
		}, this._onFocusIn = () => {
			this._hasFocus = !0;
		}, this._props.type === ha.Source) {
			let e = this._element?.get();
			To(e, "focusout", this._onFocusOut), To(e, "focusin", this._onFocusIn), this._hasFocus = R.nodeContains(e, e && R.getActiveElement(e.ownerDocument));
		}
	}
	dispose() {
		if (this._props.type === ha.Source) {
			let e = this._element?.get();
			if (Eo(e, "focusout", this._onFocusOut), Eo(e, "focusin", this._onFocusIn), this._hasFocus) {
				let e = this._tabster.getWindow().document;
				Do(e.body, new Za());
			}
		}
	}
}, as = class e {
	static {
		this.DEPTH = 10;
	}
	constructor(e) {
		this._stack = [], this._getWindow = e;
	}
	push(t) {
		this._stack[this._stack.length - 1]?.get() !== t && (this._stack.length > e.DEPTH && this._stack.shift(), this._stack.push(new ao(t)));
	}
	pop(e = () => !0) {
		let t = this._getWindow().document;
		for (let n = this._stack.length - 1; n >= 0; n--) {
			let n = this._stack.pop()?.get();
			if (n && R.nodeContains(t.body, R.getParentElement(n)) && e(n)) return n;
		}
	}
}, os = class {
	constructor(e) {
		this._onRestoreFocus = (e) => {
			this._focusedElementState.cancelAsyncFocus(pa.Restorer);
			let t = e.composedPath()[0];
			if (t) {
				let e = ya(this._tabster, t)?.restorer?.getProps().id;
				this._focusedElementState.requestAsyncFocus(pa.Restorer, () => this._restoreFocus(t, e), 0);
			}
		}, this._onFocusIn = (e) => {
			e && ya(this._tabster, e)?.restorer?.getProps().type === ha.Target && this._history.push(e);
		}, this._restoreFocus = (e, t) => {
			let n = this._getWindow().document;
			if (R.getActiveElement(n) !== n.body || !this._keyboardNavState.isNavigatingWithKeyboard() && R.nodeContains(n.body, e)) return;
			let r = (e) => {
				let t = ya(this._tabster, e)?.restorer?.getProps();
				return t ? t.id : null;
			};
			this._history.pop((e) => t === r(e))?.focus();
		}, this._tabster = e, this._getWindow = e.getWindow, To(this._getWindow(), Ha, this._onRestoreFocus), this._history = new as(this._getWindow), this._keyboardNavState = e.keyboardNavigation, this._focusedElementState = e.focusedElement, this._focusedElementState.subscribe(this._onFocusIn);
	}
	dispose() {
		let e = this._getWindow();
		this._focusedElementState.unsubscribe(this._onFocusIn), this._focusedElementState.cancelAsyncFocus(pa.Restorer), Eo(e, Ha, this._onRestoreFocus);
	}
	createRestorer(e, t) {
		let n = new is(this._tabster, e, t);
		return t.type === ha.Target && R.getActiveElement(e.ownerDocument) === e && this._history.push(e), n;
	}
};
//#endregion
//#region node_modules/tabster/dist/esm/get/getRestorer.js
function ss(e) {
	let t = e.core;
	if (!t.restorer) {
		let e = new os(t);
		t.restorer = e, t.attrHandlers.set("restorer", (t, n, r) => n ? (n.setProps(r), n) : e.createRestorer(t, r));
	}
	return t.restorer;
}
//#endregion
//#region node_modules/tabster/dist/esm/Tabster.js
var cs = class {
	constructor(e) {
		this.keyboardNavigation = e.keyboardNavigation, this.focusedElement = e.focusedElement, this.focusable = e.focusable, this.root = e.root, this.uncontrolled = e.uncontrolled, this.core = e;
	}
}, ls = class {
	constructor(e, t) {
		this._forgetMemorizedElements = [], this._wrappers = /* @__PURE__ */ new Set(), this._initQueue = [], this._version = "8.8.1", this._noop = !1, this.attrHandlers = /* @__PURE__ */ new Map(), this.getWindow = () => {
			if (!this._win) throw Error("Using disposed Tabster.");
			return this._win;
		}, this._storage = /* @__PURE__ */ new WeakMap(), this._win = e;
		let n = this.getWindow;
		t?.DOMAPI && eo({ ...t.DOMAPI }), this.keyboardNavigation = new Ko(n), this.focusedElement = new Go(this, n), this.focusable = new Vo(this), this.root = new Bo(this, t?.autoRoot), this.uncontrolled = new Jo(t?.checkUncontrolledCompletely || t?.checkUncontrolledTrappingFocus), this.controlTab = t?.controlTab ?? !0, this.rootDummyInputs = !!t?.rootDummyInputs, this._dummyObserver = new Mo(n), this.getParent = t?.getParent ?? R.getParentNode, this.internal = {
			stopObserver: () => {
				this._unobserve && (this._unobserve(), delete this._unobserve);
			},
			resumeObserver: (e) => {
				if (!this._unobserve) {
					let t = n().document;
					this._unobserve = qo(t, this, ba, e);
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
		let n = new cs(this);
		return e || this._wrappers.add(n), this._mergeProps(t), n;
	}
	disposeTabster(e, t) {
		t ? this._wrappers.clear() : this._wrappers.delete(e), this._wrappers.size === 0 && this.dispose();
	}
	dispose() {
		this.internal.stopObserver();
		let e = this._win;
		e?.clearTimeout(this._initTimer), delete this._initTimer, this._initQueue = [], this._forgetMemorizedElements = [], e && this._forgetMemorizedTimer && (e.clearTimeout(this._forgetMemorizedTimer), delete this._forgetMemorizedTimer), this.outline?.dispose(), this.crossOrigin?.dispose(), this.deloser?.dispose(), this.groupper?.dispose(), this.mover?.dispose(), this.modalizer?.dispose(), this.observedElement?.dispose(), this.restorer?.dispose(), this.keyboardNavigation.dispose(), this.focusable.dispose(), this.focusedElement.dispose(), this.root.dispose(), this._dummyObserver.dispose(), this.attrHandlers.clear(), go(this.getWindow), this._storage = /* @__PURE__ */ new WeakMap(), this._wrappers.clear(), e && (ro(e), delete e.__tabsterInstance, delete this._win);
	}
	storageEntry(e, t) {
		let n = this._storage, r = n.get(e);
		return r ? t === !1 && Object.keys(r).length === 0 && n.delete(e) : t === !0 && (r = {}, n.set(e, r)), r;
	}
	forceCleanup() {
		this._win && (this._forgetMemorizedElements.push(this._win.document.body), !this._forgetMemorizedTimer && (this._forgetMemorizedTimer = this._win.setTimeout(() => {
			delete this._forgetMemorizedTimer;
			for (let e = this._forgetMemorizedElements.shift(); e; e = this._forgetMemorizedElements.shift()) go(this.getWindow, e), Go.forgetMemorized(this.focusedElement, e);
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
function us(e, t) {
	let n = fs(e);
	return n ? n.createTabster(!1, t) : (n = new ls(e, t), e.__tabsterInstance = n, n.createTabster());
}
function ds(e, t) {
	e.core.disposeTabster(e, t);
}
function fs(e) {
	return e.__tabsterInstance;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useTabster.js
var ps = (e) => e;
function ms(e) {
	let t = e?.defaultView || void 0, n = t?.__tabsterShadowDOMAPI;
	if (t) return us(t, {
		autoRoot: {},
		controlTab: !1,
		getParent: Xi,
		checkUncontrolledCompletely: (e) => e.firstElementChild?.hasAttribute("data-is-focus-trap-zone-bumper") === !0 || void 0,
		DOMAPI: n
	});
}
function hs(e = ps) {
	let { targetDocument: t } = ei(), n = M.useRef(null);
	return wi(() => {
		let r = ms(t);
		if (r) return n.current = e(r), () => {
			ds(r), n.current = null;
		};
	}, [t, e]), n;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useTabsterAttributes.js
var gs = (e) => {
	hs();
	let t = Fo(e, !0);
	return M.useMemo(() => ({ [ua]: t }), [t]);
}, _s = (e = {}) => {
	let { circular: t, axis: n, memorizeCurrent: r = !0, tabbable: i, ignoreDefaultKeydown: a, unstable_hasDefault: o } = e;
	return hs(rs), gs({
		mover: {
			cyclic: !!t,
			direction: vs(n ?? "vertical"),
			memorizeCurrent: r,
			tabbable: i,
			hasDefault: o
		},
		...a && { focusable: { ignoreKeydown: a } }
	});
};
function vs(e) {
	switch (e) {
		case "horizontal": return ga.Horizontal;
		case "grid": return ga.Grid;
		case "grid-linear": return ga.GridLinear;
		case "both": return ga.Both;
		default: return ga.Vertical;
	}
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusFinders.js
var ys = () => {
	let e = hs(), { targetDocument: t } = ei();
	return {
		findAllFocusable: M.useCallback((t, n) => t && e.current?.focusable.findAll({
			container: t,
			acceptCondition: n
		}) || [], [e]),
		findFirstFocusable: M.useCallback((t) => t && e.current?.focusable.findFirst({ container: t }), [e]),
		findLastFocusable: M.useCallback((t) => t && e.current?.focusable.findLast({ container: t }), [e]),
		findNextFocusable: M.useCallback((n, r = {}) => {
			if (!e.current || !t || !n) return null;
			let { container: i = t.body } = r;
			return e.current.focusable.findNext({
				currentElement: n,
				container: i
			});
		}, [e, t]),
		findPrevFocusable: M.useCallback((n, r = {}) => {
			if (!e.current || !t || !n) return null;
			let { container: i = t.body } = r;
			return e.current.focusable.findPrev({
				currentElement: n,
				container: i
			});
		}, [e, t])
	};
}, bs = (e, t, n) => {
	e.addEventListener(t, n, !0);
}, xs = (e, t, n) => {
	e.removeEventListener(t, n, !0);
}, Ss = "keyborg:focusin", Cs = "keyborg:focusout", ws = 0, Ts = 1, Es = 2, Ds = 3;
function Os(e) {
	let t = e.HTMLElement, n = t.prototype.focus, r = !1;
	return t.prototype.focus = function() {
		r = !0;
	}, e.document.createElement("button").focus(), t.prototype.focus = n, r;
}
var ks = !1;
function As(e) {
	let t = e, n = t.document, r = t.HTMLElement.prototype;
	ks ||= Os(t);
	let i = r.focus;
	if (i.__keyborgNativeFocus) return;
	r.focus = u;
	let a = /* @__PURE__ */ new Set(), o = (e) => {
		let t = e.target;
		if (!t) return;
		let n = new CustomEvent(Cs, {
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
			(!t || !r.has(t)) && (a.delete(e), t && (xs(t, "focusin", s), xs(t, "focusout", o)));
		}
		c(t, e.relatedTarget || void 0);
	}, c = (e, t, n) => {
		let r = e.shadowRoot;
		if (r) {
			for (let e of a) if (e.deref() === r) return;
			bs(r, "focusin", s), bs(r, "focusout", o), a.add(new WeakRef(r));
			return;
		}
		let i = {
			relatedTarget: t,
			originalEvent: n
		}, c = new CustomEvent(Ss, {
			cancelable: !0,
			bubbles: !0,
			composed: !0,
			detail: i
		});
		c.details = i, (ks || l[Ds]) && (i.isFocusedProgrammatically = e === l[Ds]?.deref(), l[Ds] = void 0), e.dispatchEvent(c);
	}, l = [
		s,
		o,
		a
	];
	t.__keyborgData = l, bs(n, "focusin", s), bs(n, "focusout", o);
	function u() {
		let e = t.__keyborgData;
		return e && (e[Ds] = new WeakRef(this)), i.apply(this, arguments);
	}
	let d = n.activeElement;
	for (; d && d.shadowRoot;) c(d), d = d.shadowRoot.activeElement;
	u.__keyborgNativeFocus = i;
}
function js(e) {
	let t = e, n = t.HTMLElement.prototype, r = n.focus.__keyborgNativeFocus, i = t.__keyborgData;
	if (i) {
		let e = t.document;
		xs(e, "focusin", i[ws]), xs(e, "focusout", i[Ts]);
		for (let e of i[Es]) {
			let t = e.deref();
			t && (xs(t, "focusin", i[ws]), xs(t, "focusout", i[Ts]));
		}
		i[Es].clear(), delete t.__keyborgData;
	}
	r && (n.focus = r);
}
var Ms = 500, Ns = 0;
function Ps(e, t) {
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
		}, Ms);
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
	return bs(_, Ss, p), bs(_, "mousedown", h), bs(e, "keydown", g), bs(_, "touchstart", m), bs(_, "touchend", m), bs(_, "touchcancel", m), As(e), {
		dispose: () => {
			if (!n) return;
			i &&= (n.clearTimeout(i), void 0), a &&= (n.clearTimeout(a), void 0), js(n);
			let e = n.document;
			xs(e, Ss, p), xs(e, "mousedown", h), xs(n, "keydown", g), xs(e, "touchstart", m), xs(e, "touchend", m), xs(e, "touchcancel", m), n = void 0;
		},
		get isNavigatingWithKeyboard() {
			return r;
		},
		set isNavigatingWithKeyboard(e) {
			l(e);
		}
	};
}
function Fs(e, t) {
	let n = e, r = "k" + ++Ns, i = n, a, o = [], s = n.__keyborg;
	a = s ? s.core : Ps(n, t);
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
function Is(e) {
	e.dispose();
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/constants.js
var Ls = "data-fui-focus-visible", Rs = "data-fui-focus-within";
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/focusVisiblePolyfill.js
function zs(e, t) {
	if (Bs(e)) return () => void 0;
	let n = { current: void 0 }, r = Fs(t);
	function i(e) {
		r.isNavigatingWithKeyboard() && Ui(e) && (n.current = e, e.setAttribute(Ls, ""));
	}
	function a() {
		n.current &&= (n.current.removeAttribute(Ls), void 0);
	}
	r.subscribe((e) => {
		e ? i(t.document.activeElement) : a();
	});
	let o = (e) => {
		a();
		let t = e.composedPath()[0];
		i(t);
	}, s = (t) => {
		(!t.relatedTarget || Ui(t.relatedTarget) && !e.contains(t.relatedTarget)) && a();
	};
	return e.addEventListener(Ss, o), e.addEventListener("focusout", s), e.focusVisible = !0, e.contains(t.document.activeElement) && i(t.document.activeElement), () => {
		a(), e.removeEventListener(Ss, o), e.removeEventListener("focusout", s), e.focusVisible = void 0, Is(r);
	};
}
function Bs(e) {
	return e ? e.focusVisible ? !0 : Bs(e?.parentElement) : !1;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusVisible.js
function Vs(e = {}) {
	let t = ei(), n = M.useRef(null), r = e.targetDocument ?? t.targetDocument;
	return M.useEffect(() => {
		if (r?.defaultView && n.current) return zs(n.current, r.defaultView);
	}, [n, r]), n;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/focusWithinPolyfill.js
function Hs(e, t) {
	let n = Fs(t);
	n.subscribe((t) => {
		t || Ws(e);
	});
	let r = (t) => {
		n.isNavigatingWithKeyboard() && Gs(t.target) && Us(e);
	}, i = (t) => {
		(!t.relatedTarget || Gs(t.relatedTarget) && !e.contains(t.relatedTarget)) && Ws(e);
	};
	return e.addEventListener(Ss, r), e.addEventListener("focusout", i), () => {
		e.removeEventListener(Ss, r), e.removeEventListener("focusout", i), Is(n);
	};
}
function Us(e) {
	e.setAttribute(Rs, "");
}
function Ws(e) {
	e.removeAttribute(Rs);
}
function Gs(e) {
	return e ? !!(e && typeof e == "object" && "classList" in e && "contains" in e) : !1;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusWithin.js
function Ks() {
	let { targetDocument: e } = ei(), t = M.useRef(null);
	return M.useEffect(() => {
		if (e?.defaultView && t.current) return Hs(t.current, e.defaultView);
	}, [t, e]), t;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useKeyborgRef.js
function qs() {
	let { targetDocument: e } = ei(), t = M.useRef(null);
	return M.useEffect(() => {
		let n = e?.defaultView;
		if (n) {
			let e = Fs(n);
			return t.current = e, () => {
				Is(e), t.current = null;
			};
		}
	}, [e]), t;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useOnKeyboardNavigationChange.js
function Js(e) {
	let t = qs(), n = F(e);
	M.useEffect(() => {
		let e = t.current;
		if (e) {
			let t = (e) => {
				n(e);
			};
			return e.subscribe(t), t(e.isNavigatingWithKeyboard()), () => {
				e.unsubscribe(t);
			};
		}
	}, [t, n]);
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useMergeTabsterAttributes.js
var Ys = (...e) => {
	let t = [], n = "";
	for (let r of e) {
		let e = r?.[ua];
		e && (t.push(e), n += e + Xs);
	}
	return M.useMemo(() => ({ [ua]: Zs(t) }), [n]);
}, Xs = "\0", Zs = (e) => {
	if (e.length !== 0) return e.length === 1 ? e[0] : JSON.stringify(Object.assign({}, ...e.map(Qs)));
}, Qs = (e) => {
	try {
		return JSON.parse(e);
	} catch {
		return {};
	}
};
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useRestoreFocus.js
function $s() {
	return hs(ss), Fo({ restorer: { type: ha.Source } });
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useIsNavigatingWithKeyboard.js
function ec() {
	let e = qs();
	return M.useCallback(() => e.current?.isNavigatingWithKeyboard() ?? !1, [e]);
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useSetKeyboardNavigation.js
function tc() {
	let e = qs();
	return M.useCallback((t) => {
		var n;
		(n = e.current) == null || n.setVal(t);
	}, [e]);
}
//#endregion
//#region node_modules/@fluentui/tokens/lib/global/colors.js
var B = {
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
}, nc = {
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
}, rc = {
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
}, ic = {
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
}, ac = {
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
}, oc = {
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
}, V = "#ffffff", sc = "#000000", cc = {
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
}, lc = {
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
}, uc = {
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
}, dc = {
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
}, fc = {
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
}, pc = {
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
}, mc = {
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
}, hc = {
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
}, gc = {
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
}, _c = {
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
}, vc = {
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
}, yc = {
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
}, bc = {
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
}, xc = {
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
}, Sc = {
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
}, Cc = {
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
}, wc = {
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
}, Tc = {
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
}, Ec = {
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
}, Dc = {
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
}, Oc = {
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
}, kc = {
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
}, Ac = {
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
}, jc = {
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
}, Mc = {
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
}, Nc = {
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
}, Pc = {
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
}, Fc = {
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
}, Ic = {
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
}, Lc = {
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
}, Rc = {
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
}, zc = {
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
}, Bc = {
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
}, Vc = {
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
}, Hc = {
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
}, Uc = {
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
}, Wc = {
	red: uc,
	green: Cc,
	darkOrange: dc,
	yellow: gc,
	berry: Fc,
	lightGreen: Sc,
	marigold: hc
}, Gc = {
	darkRed: cc,
	cranberry: lc,
	pumpkin: fc,
	peach: mc,
	gold: _c,
	brass: vc,
	brown: yc,
	forest: bc,
	seafoam: xc,
	darkGreen: wc,
	lightTeal: Tc,
	teal: Ec,
	steel: Dc,
	blue: Oc,
	royalBlue: kc,
	cornflower: Ac,
	navy: jc,
	lavender: Mc,
	purple: Nc,
	grape: Pc,
	lilac: Ic,
	pink: Lc,
	magenta: Rc,
	plum: zc,
	beige: Bc,
	mink: Vc,
	platinum: Hc,
	anchor: Uc
}, H = {
	cranberry: lc,
	green: Cc,
	orange: pc
}, Kc = [
	"red",
	"green",
	"darkOrange",
	"yellow",
	"berry",
	"lightGreen",
	"marigold"
], qc = /* @__PURE__ */ "darkRed.cranberry.pumpkin.peach.gold.brass.brown.forest.seafoam.darkGreen.lightTeal.teal.steel.blue.royalBlue.cornflower.navy.lavender.purple.grape.lilac.pink.magenta.plum.beige.mink.platinum.anchor".split("."), Jc = {
	success: "green",
	warning: "orange",
	danger: "cranberry"
}, Yc = Kc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background1`]: Wc[t].tint60,
		[`colorPalette${n}Background2`]: Wc[t].tint40,
		[`colorPalette${n}Background3`]: Wc[t].primary,
		[`colorPalette${n}Foreground1`]: Wc[t].shade10,
		[`colorPalette${n}Foreground2`]: Wc[t].shade30,
		[`colorPalette${n}Foreground3`]: Wc[t].primary,
		[`colorPalette${n}BorderActive`]: Wc[t].primary,
		[`colorPalette${n}Border1`]: Wc[t].tint40,
		[`colorPalette${n}Border2`]: Wc[t].primary
	};
	return Object.assign(e, r);
}, {});
Yc.colorPaletteYellowForeground1 = Wc.yellow.shade30, Yc.colorPaletteRedForegroundInverted = Wc.red.tint20, Yc.colorPaletteGreenForegroundInverted = Wc.green.tint20, Yc.colorPaletteYellowForegroundInverted = Wc.yellow.tint40;
var Xc = qc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background2`]: Gc[t].tint40,
		[`colorPalette${n}Foreground2`]: Gc[t].shade30,
		[`colorPalette${n}BorderActive`]: Gc[t].primary
	};
	return Object.assign(e, r);
}, {}), Zc = {
	...Yc,
	...Xc
}, Qc = Object.entries(Jc).reduce((e, [t, n]) => {
	let r = t.slice(0, 1).toUpperCase() + t.slice(1), i = {
		[`colorStatus${r}Background1`]: H[n].tint60,
		[`colorStatus${r}Background2`]: H[n].tint40,
		[`colorStatus${r}Background3`]: H[n].primary,
		[`colorStatus${r}Foreground1`]: H[n].shade10,
		[`colorStatus${r}Foreground2`]: H[n].shade30,
		[`colorStatus${r}Foreground3`]: H[n].primary,
		[`colorStatus${r}ForegroundInverted`]: H[n].tint30,
		[`colorStatus${r}BorderActive`]: H[n].primary,
		[`colorStatus${r}Border1`]: H[n].tint40,
		[`colorStatus${r}Border2`]: H[n].primary
	};
	return Object.assign(e, i);
}, {});
Qc.colorStatusDangerBackground3Hover = H[Jc.danger].shade10, Qc.colorStatusDangerBackground3Pressed = H[Jc.danger].shade20, Qc.colorStatusWarningForeground1 = H[Jc.warning].shade20, Qc.colorStatusWarningForeground3 = H[Jc.warning].shade20, Qc.colorStatusWarningBorder2 = H[Jc.warning].shade20;
//#endregion
//#region node_modules/@fluentui/tokens/lib/alias/lightColor.js
var $c = (e) => ({
	colorNeutralForeground1: B[14],
	colorNeutralForeground1Hover: B[14],
	colorNeutralForeground1Pressed: B[14],
	colorNeutralForeground1Selected: B[14],
	colorNeutralForeground2: B[26],
	colorNeutralForeground2Hover: B[14],
	colorNeutralForeground2Pressed: B[14],
	colorNeutralForeground2Selected: B[14],
	colorNeutralForeground2BrandHover: e[80],
	colorNeutralForeground2BrandPressed: e[70],
	colorNeutralForeground2BrandSelected: e[80],
	colorNeutralForeground3: B[38],
	colorNeutralForeground3Hover: B[26],
	colorNeutralForeground3Pressed: B[26],
	colorNeutralForeground3Selected: B[26],
	colorNeutralForeground3BrandHover: e[80],
	colorNeutralForeground3BrandPressed: e[70],
	colorNeutralForeground3BrandSelected: e[80],
	colorNeutralForeground4: B[44],
	colorNeutralForeground5: B[38],
	colorNeutralForeground5Hover: B[14],
	colorNeutralForeground5Pressed: B[14],
	colorNeutralForeground5Selected: B[14],
	colorNeutralForegroundDisabled: B[74],
	colorNeutralForegroundInvertedDisabled: nc[40],
	colorBrandForegroundLink: e[70],
	colorBrandForegroundLinkHover: e[60],
	colorBrandForegroundLinkPressed: e[40],
	colorBrandForegroundLinkSelected: e[70],
	colorNeutralForeground2Link: B[26],
	colorNeutralForeground2LinkHover: B[14],
	colorNeutralForeground2LinkPressed: B[14],
	colorNeutralForeground2LinkSelected: B[14],
	colorCompoundBrandForeground1: e[80],
	colorCompoundBrandForeground1Hover: e[70],
	colorCompoundBrandForeground1Pressed: e[60],
	colorBrandForeground1: e[80],
	colorBrandForeground2: e[70],
	colorBrandForeground2Hover: e[60],
	colorBrandForeground2Pressed: e[30],
	colorNeutralForeground1Static: B[14],
	colorNeutralForegroundStaticInverted: V,
	colorNeutralForegroundInverted: V,
	colorNeutralForegroundInvertedHover: V,
	colorNeutralForegroundInvertedPressed: V,
	colorNeutralForegroundInvertedSelected: V,
	colorNeutralForegroundInverted2: V,
	colorNeutralForegroundOnBrand: V,
	colorNeutralForegroundInvertedLink: V,
	colorNeutralForegroundInvertedLinkHover: V,
	colorNeutralForegroundInvertedLinkPressed: V,
	colorNeutralForegroundInvertedLinkSelected: V,
	colorBrandForegroundInverted: e[100],
	colorBrandForegroundInvertedHover: e[110],
	colorBrandForegroundInvertedPressed: e[100],
	colorBrandForegroundOnLight: e[80],
	colorBrandForegroundOnLightHover: e[70],
	colorBrandForegroundOnLightPressed: e[50],
	colorBrandForegroundOnLightSelected: e[60],
	colorNeutralBackground1: V,
	colorNeutralBackground1Hover: B[96],
	colorNeutralBackground1Pressed: B[88],
	colorNeutralBackground1Selected: B[92],
	colorNeutralBackground2: B[98],
	colorNeutralBackground2Hover: B[94],
	colorNeutralBackground2Pressed: B[86],
	colorNeutralBackground2Selected: B[90],
	colorNeutralBackground3: B[96],
	colorNeutralBackground3Hover: B[92],
	colorNeutralBackground3Pressed: B[84],
	colorNeutralBackground3Selected: B[88],
	colorNeutralBackground4: B[94],
	colorNeutralBackground4Hover: B[98],
	colorNeutralBackground4Pressed: B[96],
	colorNeutralBackground4Selected: V,
	colorNeutralBackground5: B[92],
	colorNeutralBackground5Hover: B[96],
	colorNeutralBackground5Pressed: B[94],
	colorNeutralBackground5Selected: B[98],
	colorNeutralBackground6: B[90],
	colorNeutralBackground7: "#00000000",
	colorNeutralBackground7Hover: B[92],
	colorNeutralBackground7Pressed: B[84],
	colorNeutralBackground7Selected: "#00000000",
	colorNeutralBackground8: B[99],
	colorNeutralBackgroundInverted: B[16],
	colorNeutralBackgroundInvertedHover: B[24],
	colorNeutralBackgroundInvertedPressed: B[12],
	colorNeutralBackgroundInvertedSelected: B[22],
	colorNeutralBackgroundStatic: B[20],
	colorNeutralBackgroundAlpha: nc[50],
	colorNeutralBackgroundAlpha2: nc[80],
	colorSubtleBackground: "transparent",
	colorSubtleBackgroundHover: B[96],
	colorSubtleBackgroundPressed: B[88],
	colorSubtleBackgroundSelected: B[92],
	colorSubtleBackgroundLightAlphaHover: nc[70],
	colorSubtleBackgroundLightAlphaPressed: nc[50],
	colorSubtleBackgroundLightAlphaSelected: "transparent",
	colorSubtleBackgroundInverted: "transparent",
	colorSubtleBackgroundInvertedHover: rc[10],
	colorSubtleBackgroundInvertedPressed: rc[30],
	colorSubtleBackgroundInvertedSelected: rc[20],
	colorTransparentBackground: "transparent",
	colorTransparentBackgroundHover: "transparent",
	colorTransparentBackgroundPressed: "transparent",
	colorTransparentBackgroundSelected: "transparent",
	colorNeutralBackgroundDisabled: B[94],
	colorNeutralBackgroundDisabled2: V,
	colorNeutralBackgroundInvertedDisabled: nc[10],
	colorNeutralStencil1: B[90],
	colorNeutralStencil2: B[98],
	colorNeutralStencil1Alpha: rc[10],
	colorNeutralStencil2Alpha: rc[5],
	colorBackgroundOverlay: rc[40],
	colorScrollbarOverlay: rc[50],
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
	colorBrandBackgroundInverted: V,
	colorBrandBackgroundInvertedHover: e[160],
	colorBrandBackgroundInvertedPressed: e[140],
	colorBrandBackgroundInvertedSelected: e[150],
	colorNeutralCardBackground: B[98],
	colorNeutralCardBackgroundHover: V,
	colorNeutralCardBackgroundPressed: B[96],
	colorNeutralCardBackgroundSelected: B[92],
	colorNeutralCardBackgroundDisabled: B[94],
	colorNeutralStrokeAccessible: B[38],
	colorNeutralStrokeAccessibleHover: B[34],
	colorNeutralStrokeAccessiblePressed: B[30],
	colorNeutralStrokeAccessibleSelected: e[80],
	colorNeutralStroke1: B[82],
	colorNeutralStroke1Hover: B[78],
	colorNeutralStroke1Pressed: B[70],
	colorNeutralStroke1Selected: B[74],
	colorNeutralStroke2: B[88],
	colorNeutralStroke3: B[94],
	colorNeutralStroke4: B[92],
	colorNeutralStroke4Hover: B[88],
	colorNeutralStroke4Pressed: B[84],
	colorNeutralStroke4Selected: B[92],
	colorNeutralStrokeSubtle: B[88],
	colorNeutralStrokeOnBrand: V,
	colorNeutralStrokeOnBrand2: V,
	colorNeutralStrokeOnBrand2Hover: V,
	colorNeutralStrokeOnBrand2Pressed: V,
	colorNeutralStrokeOnBrand2Selected: V,
	colorBrandStroke1: e[80],
	colorBrandStroke2: e[140],
	colorBrandStroke2Hover: e[120],
	colorBrandStroke2Pressed: e[80],
	colorBrandStroke2Contrast: e[140],
	colorCompoundBrandStroke: e[80],
	colorCompoundBrandStrokeHover: e[70],
	colorCompoundBrandStrokePressed: e[60],
	colorNeutralStrokeDisabled: B[88],
	colorNeutralStrokeDisabled2: B[92],
	colorNeutralStrokeInvertedDisabled: nc[40],
	colorTransparentStroke: "transparent",
	colorTransparentStrokeInteractive: "transparent",
	colorTransparentStrokeDisabled: "transparent",
	colorNeutralStrokeAlpha: rc[5],
	colorNeutralStrokeAlpha2: nc[20],
	colorStrokeFocus1: V,
	colorStrokeFocus2: sc,
	colorNeutralShadowAmbient: "rgba(0,0,0,0.12)",
	colorNeutralShadowKey: "rgba(0,0,0,0.14)",
	colorNeutralShadowAmbientLighter: "rgba(0,0,0,0.06)",
	colorNeutralShadowKeyLighter: "rgba(0,0,0,0.07)",
	colorNeutralShadowAmbientDarker: "rgba(0,0,0,0.20)",
	colorNeutralShadowKeyDarker: "rgba(0,0,0,0.24)",
	colorBrandShadowAmbient: "rgba(0,0,0,0.30)",
	colorBrandShadowKey: "rgba(0,0,0,0.25)"
}), el = {
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
}, tl = {
	curveAccelerateMax: "cubic-bezier(0.9,0.1,1,0.2)",
	curveAccelerateMid: "cubic-bezier(1,0,1,1)",
	curveAccelerateMin: "cubic-bezier(0.8,0,0.78,1)",
	curveDecelerateMax: "cubic-bezier(0.1,0.9,0.2,1)",
	curveDecelerateMid: "cubic-bezier(0,0,0,1)",
	curveDecelerateMin: "cubic-bezier(0.33,0,0.1,1)",
	curveEasyEaseMax: "cubic-bezier(0.8,0,0.2,1)",
	curveEasyEase: "cubic-bezier(0.33,0,0.67,1)",
	curveLinear: "cubic-bezier(0,0,1,1)"
}, nl = {
	durationUltraFast: "50ms",
	durationFaster: "100ms",
	durationFast: "150ms",
	durationNormal: "200ms",
	durationGentle: "250ms",
	durationSlow: "300ms",
	durationSlower: "400ms",
	durationUltraSlow: "500ms"
}, rl = {
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
}, il = {
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
}, al = {
	fontWeightRegular: 400,
	fontWeightMedium: 500,
	fontWeightSemibold: 600,
	fontWeightBold: 700
}, ol = {
	fontFamilyBase: "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif",
	fontFamilyMonospace: "Consolas, 'Courier New', Courier, monospace",
	fontFamilyNumeric: "Bahnschrift, 'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif"
}, sl = {
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
}, cl = {
	spacingHorizontalNone: sl.none,
	spacingHorizontalXXS: sl.xxs,
	spacingHorizontalXS: sl.xs,
	spacingHorizontalSNudge: sl.sNudge,
	spacingHorizontalS: sl.s,
	spacingHorizontalMNudge: sl.mNudge,
	spacingHorizontalM: sl.m,
	spacingHorizontalL: sl.l,
	spacingHorizontalXL: sl.xl,
	spacingHorizontalXXL: sl.xxl,
	spacingHorizontalXXXL: sl.xxxl
}, ll = {
	spacingVerticalNone: sl.none,
	spacingVerticalXXS: sl.xxs,
	spacingVerticalXS: sl.xs,
	spacingVerticalSNudge: sl.sNudge,
	spacingVerticalS: sl.s,
	spacingVerticalMNudge: sl.mNudge,
	spacingVerticalM: sl.m,
	spacingVerticalL: sl.l,
	spacingVerticalXL: sl.xl,
	spacingVerticalXXL: sl.xxl,
	spacingVerticalXXXL: sl.xxxl
}, ul = {
	strokeWidthThin: "1px",
	strokeWidthThick: "2px",
	strokeWidthThicker: "3px",
	strokeWidthThickest: "4px"
}, U = {
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
function dl(e, t, n = "") {
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
var fl = (e) => {
	let t = $c(e);
	return {
		...el,
		...rl,
		...il,
		...ol,
		...al,
		...ul,
		...cl,
		...ll,
		...nl,
		...tl,
		...t,
		...Zc,
		...Qc,
		...dl(t.colorNeutralShadowAmbient, t.colorNeutralShadowKey),
		...dl(t.colorBrandShadowAmbient, t.colorBrandShadowKey, "Brand")
	};
}, pl = {
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
}, ml = Kc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background1`]: Wc[t].shade40,
		[`colorPalette${n}Background2`]: Wc[t].shade30,
		[`colorPalette${n}Background3`]: Wc[t].primary,
		[`colorPalette${n}Foreground1`]: Wc[t].tint30,
		[`colorPalette${n}Foreground2`]: Wc[t].tint40,
		[`colorPalette${n}Foreground3`]: Wc[t].tint20,
		[`colorPalette${n}BorderActive`]: Wc[t].tint30,
		[`colorPalette${n}Border1`]: Wc[t].primary,
		[`colorPalette${n}Border2`]: Wc[t].tint20
	};
	return Object.assign(e, r);
}, {});
ml.colorPaletteRedForeground3 = Wc.red.tint30, ml.colorPaletteRedBorder2 = Wc.red.tint30, ml.colorPaletteGreenForeground3 = Wc.green.tint40, ml.colorPaletteGreenBorder2 = Wc.green.tint40, ml.colorPaletteDarkOrangeForeground3 = Wc.darkOrange.tint30, ml.colorPaletteDarkOrangeBorder2 = Wc.darkOrange.tint30, ml.colorPaletteRedForegroundInverted = Wc.red.primary, ml.colorPaletteGreenForegroundInverted = Wc.green.primary, ml.colorPaletteYellowForegroundInverted = Wc.yellow.shade30;
var hl = qc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background2`]: Gc[t].shade30,
		[`colorPalette${n}Foreground2`]: Gc[t].tint40,
		[`colorPalette${n}BorderActive`]: Gc[t].tint30
	};
	return Object.assign(e, r);
}, {});
hl.colorPaletteDarkRedBackground2 = Gc.darkRed.shade20, hl.colorPalettePlumBackground2 = Gc.plum.shade20;
var gl = {
	...ml,
	...hl
}, _l = Object.entries(Jc).reduce((e, [t, n]) => {
	let r = t.slice(0, 1).toUpperCase() + t.slice(1), i = {
		[`colorStatus${r}Background1`]: H[n].shade40,
		[`colorStatus${r}Background2`]: H[n].shade30,
		[`colorStatus${r}Background3`]: H[n].primary,
		[`colorStatus${r}Foreground1`]: H[n].tint30,
		[`colorStatus${r}Foreground2`]: H[n].tint40,
		[`colorStatus${r}Foreground3`]: H[n].tint20,
		[`colorStatus${r}BorderActive`]: H[n].tint30,
		[`colorStatus${r}ForegroundInverted`]: H[n].shade10,
		[`colorStatus${r}Border1`]: H[n].primary,
		[`colorStatus${r}Border2`]: H[n].tint20
	};
	return Object.assign(e, i);
}, {});
_l.colorStatusDangerBackground3Hover = H[Jc.danger].shade10, _l.colorStatusDangerBackground3Pressed = H[Jc.danger].shade20, _l.colorStatusDangerForeground3 = H[Jc.danger].tint40, _l.colorStatusDangerBorder2 = H[Jc.danger].tint30, _l.colorStatusSuccessForeground3 = H[Jc.success].tint40, _l.colorStatusSuccessBorder2 = H[Jc.success].tint40, _l.colorStatusWarningForegroundInverted = H[Jc.warning].shade20;
//#endregion
//#region node_modules/@fluentui/tokens/lib/themes/web/lightTheme.js
var vl = fl(pl), yl = (e) => ({
	colorNeutralForeground1: V,
	colorNeutralForeground1Hover: V,
	colorNeutralForeground1Pressed: V,
	colorNeutralForeground1Selected: V,
	colorNeutralForeground2: B[84],
	colorNeutralForeground2Hover: V,
	colorNeutralForeground2Pressed: V,
	colorNeutralForeground2Selected: V,
	colorNeutralForeground2BrandHover: e[100],
	colorNeutralForeground2BrandPressed: e[90],
	colorNeutralForeground2BrandSelected: e[100],
	colorNeutralForeground3: B[68],
	colorNeutralForeground3Hover: B[84],
	colorNeutralForeground3Pressed: B[84],
	colorNeutralForeground3Selected: B[84],
	colorNeutralForeground3BrandHover: e[100],
	colorNeutralForeground3BrandPressed: e[90],
	colorNeutralForeground3BrandSelected: e[100],
	colorNeutralForeground4: B[60],
	colorNeutralForeground5: B[68],
	colorNeutralForeground5Hover: V,
	colorNeutralForeground5Pressed: V,
	colorNeutralForeground5Selected: V,
	colorNeutralForegroundDisabled: B[36],
	colorNeutralForegroundInvertedDisabled: nc[40],
	colorBrandForegroundLink: e[100],
	colorBrandForegroundLinkHover: e[110],
	colorBrandForegroundLinkPressed: e[90],
	colorBrandForegroundLinkSelected: e[100],
	colorNeutralForeground2Link: B[84],
	colorNeutralForeground2LinkHover: V,
	colorNeutralForeground2LinkPressed: V,
	colorNeutralForeground2LinkSelected: V,
	colorCompoundBrandForeground1: e[100],
	colorCompoundBrandForeground1Hover: e[110],
	colorCompoundBrandForeground1Pressed: e[90],
	colorBrandForeground1: e[100],
	colorBrandForeground2: e[110],
	colorBrandForeground2Hover: e[130],
	colorBrandForeground2Pressed: e[160],
	colorNeutralForeground1Static: B[14],
	colorNeutralForegroundStaticInverted: V,
	colorNeutralForegroundInverted: B[14],
	colorNeutralForegroundInvertedHover: B[14],
	colorNeutralForegroundInvertedPressed: B[14],
	colorNeutralForegroundInvertedSelected: B[14],
	colorNeutralForegroundInverted2: B[14],
	colorNeutralForegroundOnBrand: V,
	colorNeutralForegroundInvertedLink: V,
	colorNeutralForegroundInvertedLinkHover: V,
	colorNeutralForegroundInvertedLinkPressed: V,
	colorNeutralForegroundInvertedLinkSelected: V,
	colorBrandForegroundInverted: e[80],
	colorBrandForegroundInvertedHover: e[70],
	colorBrandForegroundInvertedPressed: e[60],
	colorBrandForegroundOnLight: e[80],
	colorBrandForegroundOnLightHover: e[70],
	colorBrandForegroundOnLightPressed: e[50],
	colorBrandForegroundOnLightSelected: e[60],
	colorNeutralBackground1: B[16],
	colorNeutralBackground1Hover: B[24],
	colorNeutralBackground1Pressed: B[12],
	colorNeutralBackground1Selected: B[22],
	colorNeutralBackground2: B[12],
	colorNeutralBackground2Hover: B[20],
	colorNeutralBackground2Pressed: B[8],
	colorNeutralBackground2Selected: B[18],
	colorNeutralBackground3: B[8],
	colorNeutralBackground3Hover: B[16],
	colorNeutralBackground3Pressed: B[4],
	colorNeutralBackground3Selected: B[14],
	colorNeutralBackground4: B[4],
	colorNeutralBackground4Hover: B[12],
	colorNeutralBackground4Pressed: sc,
	colorNeutralBackground4Selected: B[10],
	colorNeutralBackground5: sc,
	colorNeutralBackground5Hover: B[8],
	colorNeutralBackground5Pressed: B[2],
	colorNeutralBackground5Selected: B[6],
	colorNeutralBackground6: B[20],
	colorNeutralBackground7: "#00000000",
	colorNeutralBackground7Hover: B[10],
	colorNeutralBackground7Pressed: B[4],
	colorNeutralBackground7Selected: "#00000000",
	colorNeutralBackground8: B[16],
	colorNeutralBackgroundInverted: V,
	colorNeutralBackgroundInvertedHover: B[96],
	colorNeutralBackgroundInvertedPressed: B[88],
	colorNeutralBackgroundInvertedSelected: B[92],
	colorNeutralBackgroundStatic: B[24],
	colorNeutralBackgroundAlpha: ic[50],
	colorNeutralBackgroundAlpha2: ac[70],
	colorSubtleBackground: "transparent",
	colorSubtleBackgroundHover: B[22],
	colorSubtleBackgroundPressed: B[18],
	colorSubtleBackgroundSelected: B[20],
	colorSubtleBackgroundLightAlphaHover: oc[80],
	colorSubtleBackgroundLightAlphaPressed: oc[50],
	colorSubtleBackgroundLightAlphaSelected: "transparent",
	colorSubtleBackgroundInverted: "transparent",
	colorSubtleBackgroundInvertedHover: rc[10],
	colorSubtleBackgroundInvertedPressed: rc[30],
	colorSubtleBackgroundInvertedSelected: rc[20],
	colorTransparentBackground: "transparent",
	colorTransparentBackgroundHover: "transparent",
	colorTransparentBackgroundPressed: "transparent",
	colorTransparentBackgroundSelected: "transparent",
	colorNeutralBackgroundDisabled: B[8],
	colorNeutralBackgroundDisabled2: B[16],
	colorNeutralBackgroundInvertedDisabled: nc[10],
	colorNeutralStencil1: B[34],
	colorNeutralStencil2: B[20],
	colorNeutralStencil1Alpha: nc[10],
	colorNeutralStencil2Alpha: nc[5],
	colorBackgroundOverlay: rc[50],
	colorScrollbarOverlay: nc[60],
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
	colorBrandBackgroundInverted: V,
	colorBrandBackgroundInvertedHover: e[160],
	colorBrandBackgroundInvertedPressed: e[140],
	colorBrandBackgroundInvertedSelected: e[150],
	colorNeutralCardBackground: B[20],
	colorNeutralCardBackgroundHover: B[24],
	colorNeutralCardBackgroundPressed: B[18],
	colorNeutralCardBackgroundSelected: B[22],
	colorNeutralCardBackgroundDisabled: B[8],
	colorNeutralStrokeAccessible: B[68],
	colorNeutralStrokeAccessibleHover: B[74],
	colorNeutralStrokeAccessiblePressed: B[70],
	colorNeutralStrokeAccessibleSelected: e[100],
	colorNeutralStroke1: B[40],
	colorNeutralStroke1Hover: B[46],
	colorNeutralStroke1Pressed: B[42],
	colorNeutralStroke1Selected: B[44],
	colorNeutralStroke2: B[32],
	colorNeutralStroke3: B[24],
	colorNeutralStroke4: B[24],
	colorNeutralStroke4Hover: B[18],
	colorNeutralStroke4Pressed: B[14],
	colorNeutralStroke4Selected: B[24],
	colorNeutralStrokeSubtle: B[4],
	colorNeutralStrokeOnBrand: B[16],
	colorNeutralStrokeOnBrand2: V,
	colorNeutralStrokeOnBrand2Hover: V,
	colorNeutralStrokeOnBrand2Pressed: V,
	colorNeutralStrokeOnBrand2Selected: V,
	colorBrandStroke1: e[100],
	colorBrandStroke2: e[50],
	colorBrandStroke2Hover: e[50],
	colorBrandStroke2Pressed: e[30],
	colorBrandStroke2Contrast: e[50],
	colorCompoundBrandStroke: e[100],
	colorCompoundBrandStrokeHover: e[110],
	colorCompoundBrandStrokePressed: e[90],
	colorNeutralStrokeDisabled: B[26],
	colorNeutralStrokeDisabled2: B[24],
	colorNeutralStrokeInvertedDisabled: nc[40],
	colorTransparentStroke: "transparent",
	colorTransparentStrokeInteractive: "transparent",
	colorTransparentStrokeDisabled: "transparent",
	colorNeutralStrokeAlpha: nc[10],
	colorNeutralStrokeAlpha2: nc[20],
	colorStrokeFocus1: sc,
	colorStrokeFocus2: V,
	colorNeutralShadowAmbient: "rgba(0,0,0,0.24)",
	colorNeutralShadowKey: "rgba(0,0,0,0.28)",
	colorNeutralShadowAmbientLighter: "rgba(0,0,0,0.12)",
	colorNeutralShadowKeyLighter: "rgba(0,0,0,0.14)",
	colorNeutralShadowAmbientDarker: "rgba(0,0,0,0.40)",
	colorNeutralShadowKeyDarker: "rgba(0,0,0,0.48)",
	colorBrandShadowAmbient: "rgba(0,0,0,0.30)",
	colorBrandShadowKey: "rgba(0,0,0,0.25)"
}), bl = ((e) => {
	let t = yl(e);
	return {
		...el,
		...rl,
		...il,
		...ol,
		...al,
		...ul,
		...cl,
		...ll,
		...nl,
		...tl,
		...t,
		...gl,
		..._l,
		...dl(t.colorNeutralShadowAmbient, t.colorNeutralShadowKey),
		...dl(t.colorBrandShadowAmbient, t.colorBrandShadowKey, "Brand")
	};
})(pl), xl = { root: "fui-FluentProvider" }, Sl = /*#__PURE__*/ Ln({ root: {
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
] }), Cl = (e) => {
	let t = Wn(), n = Sl({
		dir: e.dir,
		renderer: t
	});
	return e.root.className = k(xl.root, e.themeClassName, n.root, e.root.className), e;
}, wl = M.useInsertionEffect ? M.useInsertionEffect : wi, Tl = (e, t) => {
	if (!e?.head) return;
	let n = e.createElement("style");
	return Object.keys(t).forEach((e) => {
		n.setAttribute(e, t[e]);
	}), e.head.appendChild(n), n;
}, El = (e, t) => {
	let n = e.sheet;
	n && (n.cssRules.length > 0 && n.deleteRule(0), n.insertRule(t, 0));
}, Dl = (e) => {
	let { targetDocument: t, theme: n, rendererAttributes: r } = e, i = M.useRef(void 0), a = ki(xl.root), o = r, s = M.useMemo(() => Qn(`.${a}`, n), [n, a]);
	return Ol(t, a), wl(() => {
		let e = t?.getElementById(a);
		return e ? i.current = e : (i.current = Tl(t, {
			...o,
			id: a
		}), i.current && El(i.current, s)), () => {
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
function Ol(e, t) {
	M.useState(() => {
		if (!e) return;
		let n = e.getElementById(t);
		n && e.head.append(n);
	});
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/useFluentProvider.js
var kl = {}, Al = {}, jl = (e, t) => {
	let n = ei(), r = Nl(), i = ri(), a = M.useContext(ii) || kl, { applyStylesToPortals: o = !0, customStyleHooks_unstable: s, dir: c = n.dir, targetDocument: l = n.targetDocument, theme: u, overrides_unstable: d = {} } = e, f = Ml(r, u), p = Ml(i, d), m = Ml(a, s), h = Wn(), { styleTagId: g, rule: _ } = Dl({
		theme: f,
		targetDocument: l,
		rendererAttributes: h.styleElementAttributes ?? Al
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
		root: nr(Rr("div", {
			...e,
			dir: c,
			ref: Ai(t, Vs({ targetDocument: l }))
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
function Ml(e, t) {
	return e && t ? {
		...e,
		...t
	} : e || t;
}
function Nl() {
	return M.useContext(Vr);
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/useFluentProviderContextValues.js
function Pl(e) {
	let { applyStylesToPortals: t, customStyleHooks_unstable: n, dir: r, root: i, targetDocument: a, theme: o, themeClassName: s, overrides_unstable: c } = e, l = M.useMemo(() => ({
		dir: r,
		targetDocument: a
	}), [r, a]), [u] = M.useState(() => ({}));
	return {
		customStyleHooks_unstable: n,
		overrides_unstable: c,
		provider: l,
		textDirection: r,
		iconDirection: M.useMemo(() => ({ textDirection: r }), [r]),
		tooltip: u,
		theme: o,
		themeClassName: t ? i.className : s
	};
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/FluentProvider.js
var Fl = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = jl(e, t);
	return Cl(n), la(n, Pl(n));
});
Fl.displayName = "FluentProvider";
//#endregion
//#region node_modules/@fluentui/react-context-selector/lib/createContext.js
var Il = p(), Ll = (e) => (t) => {
	let n = M.useRef(t.value), r = M.useRef(null);
	return r.current ||= {
		value: n,
		listeners: []
	}, wi(() => {
		n.current = t.value, (0, Il.unstable_runWithPriority)(Il.unstable_NormalPriority, () => {
			r.current.listeners.forEach((e) => {
				e(t.value);
			});
		});
	}, [t.value]), M.createElement(e, { value: r.current }, t.children);
}, Rl = (e) => {
	let t = M.createContext({
		value: { current: e },
		listeners: [],
		isDefault: !0
	});
	return t.Provider = Ll(t.Provider), delete t.Consumer, t;
}, zl = (e, t) => {
	let { value: n, listeners: r } = M.useContext(e), i = t(n.current), [, a] = M.useReducer((e) => e + 1, 0), o = M.useRef(t), s = M.useRef(i);
	return wi(() => {
		o.current = t, s.current = i;
	}), wi(() => {
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
function Bl(e) {
	return !M.useContext(e).isDefault;
}
var Vl = "ArrowLeft", Hl = "ArrowRight";
//#endregion
//#region node_modules/@fluentui/react-aria/lib/button/useARIAButtonProps.js
function Ul(e, t) {
	let { disabled: n, disabledFocusable: r = !1, "aria-disabled": i, onClick: a, onKeyDown: o, onKeyUp: s, ...c } = t ?? {}, l = typeof i == "string" ? i === "true" : i, u = n || r || l, d = F((e) => {
		u ? (e.preventDefault(), e.stopPropagation()) : a?.(e);
	}), f = F((e) => {
		if (o?.(e), e.isDefaultPrevented()) return;
		let t = e.key;
		u && (t === "Enter" || t === " ") ? (e.preventDefault(), e.stopPropagation()) : t === " " ? e.preventDefault() : t === "Enter" && (e.preventDefault(), e.currentTarget.click());
	}), p = F((e) => {
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
//#region node_modules/@fluentui/react-aria/lib/activedescendant/ActiveDescendantContext.js
var Wl = () => void 0, Gl = { controller: {
	active: Wl,
	blur: Wl,
	find: Wl,
	first: Wl,
	focus: Wl,
	focusLastActive: Wl,
	scrollActiveIntoView: Wl,
	last: Wl,
	next: Wl,
	prev: Wl,
	showAttributes: Wl,
	hideAttributes: Wl,
	showFocusVisibleAttributes: Wl,
	hideFocusVisibleAttributes: Wl
} }, Kl = M.createContext(void 0), ql = Kl.Provider, Jl = () => M.useContext(Kl) ?? Gl, Yl = () => !!M.useContext(Kl);
//#endregion
//#region node_modules/@fluentui/react-aria/lib/activedescendant/useOptionWalker.js
function Xl(e) {
	let { matchOption: t } = e, { targetDocument: n } = ei(), r = M.useRef(null), i = M.useRef(null), a = M.useCallback((e) => Ui(e) && t(e) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP, [t]), o = M.useCallback((e) => {
		e && n ? (i.current = e, r.current = n.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, a)) : (i.current = null, r.current = null);
	}, [n, a]);
	return {
		optionWalker: M.useMemo(() => ({
			first: () => !r.current || !i.current ? null : (r.current.currentNode = i.current, r.current.firstChild()),
			last: () => !r.current || !i.current ? null : (r.current.currentNode = i.current, r.current.lastChild()),
			next: () => r.current ? r.current.nextNode() : null,
			prev: () => r.current ? r.current.previousNode() : null,
			find: (e, t) => {
				if (!r.current || !i.current) return null;
				let a = t ? n?.getElementById(t) : null;
				r.current.currentNode = a ?? i.current;
				let o = r.current.currentNode;
				for (; o && !e(o.id);) o = r.current.nextNode();
				return o;
			},
			setCurrent: (e) => {
				r.current && (r.current.currentNode = e);
			}
		}), [n]),
		listboxCallbackRef: o
	};
}
//#endregion
//#region node_modules/@fluentui/react-aria/lib/activedescendant/constants.js
var Zl = "data-activedescendant", Ql = "data-activedescendant-focusvisible", $l = (e) => {
	if (!e) return;
	let t = eu(e.parentElement);
	if (!t) return;
	let { offsetHeight: n } = e, r = tu(e, t), { scrollMarginTop: i, scrollMarginBottom: a } = nu(e), { offsetHeight: o, scrollTop: s } = t, c = r - i < s, l = r + n + a > s + o;
	c ? t.scrollTo(0, r - i - 2) : l && t.scrollTo(0, r + n + a - o + 2);
}, eu = (e) => e ? e.scrollHeight > e.offsetHeight ? e : eu(e.parentElement) : null, tu = (e, t) => !e || e === t ? 0 : e.contains(t) ? t.offsetTop * -1 : e.offsetTop + tu(e.offsetParent, t), nu = (e) => {
	let t = e.ownerDocument?.defaultView;
	if (!t) return {
		scrollMarginTop: 0,
		scrollMarginBottom: 0
	};
	let n = t.getComputedStyle(e);
	return {
		scrollMarginTop: ru(n.scrollMarginTop) ?? ru(n.scrollMarginBlockStart),
		scrollMarginBottom: ru(n.scrollMarginBottom) ?? ru(n.scrollMarginBlockEnd)
	};
}, ru = (e) => e ? parseInt(e, 10) : 0, iu = (e) => new CustomEvent("activedescendantchange", {
	bubbles: !0,
	cancelable: !1,
	composed: !0,
	detail: e
});
function au(e) {
	let { imperativeRef: t, matchOption: n } = e, r = M.useRef(!1), i = M.useRef(!0), a = M.useRef(null), o = M.useRef(null), s = M.useRef(null), c = M.useRef(!0), l = M.useCallback(() => {
		var e;
		(e = s.current) == null || e.removeAttribute("aria-activedescendant");
	}, []), u = M.useCallback((e) => {
		if (e && (a.current = e), c.current && a.current) {
			var t;
			(t = s.current) == null || t.setAttribute("aria-activedescendant", a.current);
		}
	}, []);
	Js((e) => {
		r.current = e;
		let t = h();
		t && (e && i.current ? t.setAttribute(Ql, "") : t.removeAttribute(Ql));
	});
	let d = F(n), f = M.useRef(null), { optionWalker: p, listboxCallbackRef: m } = Xl({ matchOption: d }), h = M.useCallback(() => f.current?.querySelector(`#${a.current}`), [f]), g = M.useCallback((e) => {
		i.current = e;
		let t = h();
		t && (e && r.current ? t.setAttribute(Ql, "") : t.removeAttribute(Ql));
	}, [h]), _ = M.useCallback(() => {
		let e = h();
		return e && (e.removeAttribute(Zl), e.removeAttribute(Ql)), l(), o.current = a.current, a.current = null, e?.id ?? null;
	}, [h, l]), v = M.useCallback((e) => {
		if (!e) return;
		let t = _();
		$l(e), u(e.id), e.setAttribute(Zl, ""), r.current && i.current && e.setAttribute(Ql, "");
		let n = iu({
			id: e.id,
			previousId: t
		});
		e.dispatchEvent(n);
	}, [_, u]), y = M.useMemo(() => ({
		first: ({ passive: e } = {}) => {
			let t = p.first();
			return e || v(t), t?.id;
		},
		last: ({ passive: e } = {}) => {
			let t = p.last();
			return e || v(t), t?.id;
		},
		next: ({ passive: e } = {}) => {
			let t = h();
			if (!t) return;
			p.setCurrent(t);
			let n = p.next();
			return e || v(n), n?.id;
		},
		prev: ({ passive: e } = {}) => {
			let t = h();
			if (!t) return;
			p.setCurrent(t);
			let n = p.prev();
			return e || v(n), n?.id;
		},
		blur: () => {
			_();
		},
		active: () => h()?.id,
		focus: (e) => {
			if (!f.current) return;
			let t = f.current.querySelector(`#${e}`);
			t && v(t);
		},
		focusLastActive: () => {
			if (!f.current || !o.current) return;
			let e = f.current.querySelector(`#${o.current}`);
			if (e) return v(e), !0;
		},
		find(e, { passive: t, startFrom: n } = {}) {
			let r = p.find(e, n);
			return t || v(r), r?.id;
		},
		scrollActiveIntoView: () => {
			if (!f.current) return;
			let e = h();
			e && $l(e);
		},
		showAttributes() {
			c.current = !0, u();
		},
		hideAttributes() {
			c.current = !1, l();
		},
		showFocusVisibleAttributes() {
			g(!0);
		},
		hideFocusVisibleAttributes() {
			g(!1);
		}
	}), [
		p,
		f,
		u,
		l,
		v,
		_,
		h,
		g
	]);
	return M.useImperativeHandle(t, () => y), {
		listboxRef: Ai(f, m),
		activeParentRef: s,
		controller: y
	};
}
//#endregion
//#region node_modules/@fluentui/react-icons/lib/utils/useIconStyles.styles.js
var ou = P({
	root: {
		mc9l5x: "f1w7gpdv",
		Bg96gwp: "fez10in"
	},
	rtl: { Bz10aip: "f13rod7r" }
}, { d: [
	".f1w7gpdv{display:inline;}",
	".fez10in{line-height:0;}",
	".f13rod7r{transform:scaleX(-1);}"
] }), su = "fui-Icon", cu = "fui-Icon-filled", lu = "fui-Icon-regular", uu = "data-fui-icon", du = (e, t) => {
	let { filled: n, idPrefix: r, title: i, primaryFill: a = "currentColor", ...o } = e, s = {
		...o,
		fill: a
	}, c = ca(), l = !!(t?.flipInRtl && c?.textDirection === "rtl");
	return i && (s["aria-label"] = i), !s["aria-label"] && !s["aria-labelledby"] ? s["aria-hidden"] = !0 : s.role = "img", s[uu] = "", {
		state: s,
		isRtlFlip: l
	};
}, fu = (e, t) => {
	let n = ou(), { state: r, isRtlFlip: i } = du(e, t);
	return r.className = k(n.root, i && n.rtl, r.className), r;
}, pu = P({ root: { B8gzw0y: "f1dd5bof" } }, { m: [["@media (forced-colors: active){.f1dd5bof{forced-color-adjust:auto;}}", { m: "(forced-colors: active)" }]] }), mu = "url(#", hu = (e, t, n) => {
	let [r, i, ...a] = e, o = i;
	if (n && i) {
		let e = {};
		for (let t in i) {
			let r = i[t];
			if (typeof r != "string") e[t] = r;
			else if (t === "id") e[t] = n + r;
			else {
				let i = r.indexOf(mu);
				e[t] = i < 0 ? r : r.slice(0, i + 5) + n + r.slice(i + 5);
			}
		}
		o = e;
	}
	return M.createElement(r, {
		...o,
		key: t
	}, ...a.map((e, t) => hu(e, t, n)));
}, gu = (e) => e === "1em" ? "20" : e, _u = (e, t, n) => typeof e != "string" && (t?.color || Array.isArray(e[0])) ? e.map((e, t) => hu(e, t, n)) : void 0, vu = () => void 0, yu = (e, t) => {
	let n = _u(e, t);
	return n ? function(r) {
		return M.useMemo(() => r ? _u(e, t, r) : n, [r]);
	} : vu;
}, bu = (e, t, n) => typeof t == "string" ? M.createElement("svg", {
	...e,
	dangerouslySetInnerHTML: { __html: t }
}) : n ? M.createElement("svg", e, ...n) : M.createElement("svg", e, ...t.map((t) => M.createElement("path", {
	d: t,
	fill: e.fill
}))), W = (e, t, n, r) => {
	let i = gu(t), a = yu(n, r), o = M.forwardRef((e, o) => {
		let s = pu(), c = fu(e, { flipInRtl: r?.flipInRtl }), l = a(e.idPrefix);
		return bu({
			...c,
			className: k(su, c.className, s.root),
			ref: o,
			width: t,
			height: t,
			viewBox: `0 0 ${i} ${i}`,
			xmlns: "http://www.w3.org/2000/svg"
		}, n, l);
	});
	return o.displayName = e, o;
}, xu = /*#__PURE__*/ W("WarningFilled", "1em", ["M7.37 3.56a3 3 0 0 1 5.26 0l5.5 10A3 3 0 0 1 15.5 18h-11a3 3 0 0 1-2.63-4.44zM10 12.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5m0-6.25a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0V7a.5.5 0 0 0-.5-.5"]), Su = /*#__PURE__*/ W("InfoFilled", "1em", ["M18 10a8 8 0 1 0-16 0 8 8 0 0 0 16 0M9.5 8.91a.5.5 0 0 1 1 0v4.69a.5.5 0 0 1-1 0V8.9m-.25-2.16a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0"]), Cu = /*#__PURE__*/ W("CircleFilled", "1em", ["M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16"]), wu = /*#__PURE__*/ W("CheckmarkFilled", "1em", ["M7.03 13.9 3.56 10a.75.75 0 0 0-1.12 1l4 4.5c.29.32.79.34 1.09.03l10.5-10.5a.75.75 0 0 0-1.06-1.06z"]), Tu = /*#__PURE__*/ W("CheckmarkCircleFilled", "1em", ["M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16m3.36 5.65a.5.5 0 0 0-.64-.06l-.07.06L9 11.3 7.35 9.65l-.07-.06a.5.5 0 0 0-.7.7l.07.07 2 2 .07.06c.17.11.4.11.56 0l.07-.06 4-4 .07-.08a.5.5 0 0 0-.06-.63"]), Eu = /*#__PURE__*/ W("ChevronDownRegular", "1em", ["M15.85 7.65c.2.2.2.5 0 .7l-5.46 5.49a.55.55 0 0 1-.78 0L4.15 8.35a.5.5 0 1 1 .7-.7L10 12.8l5.15-5.16c.2-.2.5-.2.7 0"]), Du = /*#__PURE__*/ W("ChevronLeftFilled", "1em", ["M12.27 15.8a.75.75 0 0 1-1.06-.03l-5-5.25a.75.75 0 0 1 0-1.04l5-5.25a.75.75 0 1 1 1.08 1.04L7.8 10l4.5 4.73c.29.3.28.78-.02 1.06"]), Ou = /*#__PURE__*/ W("ChevronLeftRegular", "1em", ["M12.35 15.85a.5.5 0 0 1-.7 0L6.16 10.4a.55.55 0 0 1 0-.78l5.49-5.46a.5.5 0 1 1 .7.7L7.2 10l5.16 5.15c.2.2.2.5 0 .7"]), ku = /*#__PURE__*/ W("ChevronRightFilled", "1em", ["M7.73 4.2a.75.75 0 0 1 1.06.03l5 5.25c.28.3.28.75 0 1.04l-5 5.25a.75.75 0 1 1-1.08-1.04L12.2 10l-4.5-4.73a.75.75 0 0 1 .02-1.06"]), Au = /*#__PURE__*/ W("ChevronRightRegular", "1em", ["M7.65 4.15c.2-.2.5-.2.7 0l5.49 5.46c.21.22.21.57 0 .78l-5.49 5.47a.5.5 0 0 1-.7-.71L12.8 10 7.65 4.85a.5.5 0 0 1 0-.7"]), ju = /*#__PURE__*/ W("DiamondDismissFilled", "1em", ["M7.88 1.88a3 3 0 0 1 4.24 0l6 6a3 3 0 0 1 0 4.24l-6 6a3 3 0 0 1-4.24 0l-6-6a3 3 0 0 1 0-4.24zM13.1 6.9a.5.5 0 0 0-.7 0L10 9.3 7.6 6.9a.5.5 0 0 0-.7.7L9.3 10l-2.4 2.4a.5.5 0 0 0 .7.7l2.4-2.4 2.4 2.4a.5.5 0 0 0 .7-.7L10.7 10l2.4-2.4a.5.5 0 0 0 0-.7"]), Mu = /*#__PURE__*/ W("DismissRegular", "1em", ["m4.09 4.22.06-.07a.5.5 0 0 1 .63-.06l.07.06L10 9.29l5.15-5.14a.5.5 0 0 1 .63-.06l.07.06c.18.17.2.44.06.63l-.06.07L10.71 10l5.14 5.15c.18.17.2.44.06.63l-.06.07a.5.5 0 0 1-.63.06l-.07-.06L10 10.71l-5.15 5.14a.5.5 0 0 1-.63.06l-.07-.06a.5.5 0 0 1-.06-.63l.06-.07L9.29 10 4.15 4.85a.5.5 0 0 1-.06-.63l.06-.07z"]), Nu = /*#__PURE__*/ W("CalendarLtr20Regular", "20", ["M7 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2m4-5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5zM4 7h12v7.5c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5zm1.5-3h9c.83 0 1.5.67 1.5 1.5V6H4v-.5C4 4.67 4.67 4 5.5 4"]), Pu = /*#__PURE__*/ W("CalendarLtr24Regular", "24", ["M17.75 3C19.55 3 21 4.46 21 6.25v11.5c0 1.8-1.46 3.25-3.25 3.25H6.25A3.25 3.25 0 0 1 3 17.75V6.25C3 4.45 4.46 3 6.25 3zm1.75 5.5h-15v9.25c0 .97.78 1.75 1.75 1.75h11.5c.97 0 1.75-.78 1.75-1.75zm-11.75 6a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m4.25 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m-4.25-4a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m4.25 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m4.25 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m1.5-6H6.25c-.97 0-1.75.78-1.75 1.75V7h15v-.75c0-.97-.78-1.75-1.75-1.75"]), Fu = /*#__PURE__*/ W("Search20Regular", "20", ["M13.73 14.44a6.5 6.5 0 1 1 .7-.7l3.42 3.4a.5.5 0 0 1-.63.77l-.07-.06zm-.71-.71A5.5 5.5 0 0 0 15 9.5a5.5 5.5 0 1 0-1.98 4.23"]), Iu = /*#__PURE__*/ W("Search24Regular", "24", ["M16.1 17.16a8 8 0 1 1 1.06-1.06l4.62 4.62a.75.75 0 1 1-1.06 1.06zM17.5 11a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0"]), Lu = /*#__PURE__*/ W("MoreHorizontal20Regular", "20", ["M6.25 10a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0m5 0a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0M15 11.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5"]), Ru = /*#__PURE__*/ W("Settings20Regular", "20", ["M1.91 7.38A8.5 8.5 0 0 1 3.7 4.3a.5.5 0 0 1 .54-.13l1.92.68a1 1 0 0 0 1.32-.76l.36-2a.5.5 0 0 1 .4-.4 9 9 0 0 1 3.55 0q.32.08.38.4l.37 2a1 1 0 0 0 1.32.76l1.92-.68a.5.5 0 0 1 .54.13 8.5 8.5 0 0 1 1.78 3.08q.08.31-.15.54l-1.56 1.32a1 1 0 0 0 0 1.52l1.56 1.32a.5.5 0 0 1 .15.54 8.5 8.5 0 0 1-1.78 3.08.5.5 0 0 1-.54.13l-1.92-.68a1 1 0 0 0-1.32.76l-.37 2a.5.5 0 0 1-.38.4 8.5 8.5 0 0 1-3.56 0 .5.5 0 0 1-.39-.4l-.36-2a1 1 0 0 0-1.32-.76l-1.92.68a.5.5 0 0 1-.54-.13 8.5 8.5 0 0 1-1.78-3.08.5.5 0 0 1 .15-.54l1.56-1.32a1 1 0 0 0 0-1.52L2.06 7.92a.5.5 0 0 1-.15-.54m1.06 0 1.3 1.1a2 2 0 0 1 0 3.04l-1.3 1.1q.45 1.19 1.25 2.16l1.6-.58a2 2 0 0 1 2.63 1.53l.3 1.67a8 8 0 0 0 2.5 0l.3-1.67a2 2 0 0 1 2.64-1.53l1.6.58a8 8 0 0 0 1.24-2.16l-1.3-1.1a2 2 0 0 1 0-3.04l1.3-1.1a8 8 0 0 0-1.25-2.16l-1.6.58a2 2 0 0 1-2.63-1.53l-.3-1.67a8 8 0 0 0-2.5 0l-.3 1.67A2 2 0 0 1 5.81 5.8l-1.6-.58a8 8 0 0 0-1.24 2.16M7.5 10a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0m1 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"]), zu = /*#__PURE__*/ W("Warning12Filled", "12", ["M4.28 1.97a2 2 0 0 1 3.43 0l3 5A2 2 0 0 1 9 10H3A2 2 0 0 1 1.3 6.98zM6 6.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5M6 3.5a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V4a.5.5 0 0 0-.5-.5"]), Bu = /*#__PURE__*/ W("Star16Filled", "16", ["M7.2 2.1a.9.9 0 0 1 1.6 0l1.53 3.08 3.4.5a.9.9 0 0 1 .5 1.53l-2.46 2.4.58 3.39a.9.9 0 0 1-1.3.95L8 12.35l-3.04 1.6a.9.9 0 0 1-1.3-.95l.57-3.39-2.46-2.4a.9.9 0 0 1 .5-1.53l3.4-.5z"]), Vu = /*#__PURE__*/ W("Star16Regular", "16", ["M7.2 2.1a.9.9 0 0 1 1.6 0l1.53 3.08 3.4.5a.9.9 0 0 1 .5 1.53l-2.46 2.4.58 3.39a.9.9 0 0 1-1.3.95L8 12.35l-3.04 1.6a.9.9 0 0 1-1.3-.95l.57-3.39-2.46-2.4a.9.9 0 0 1 .5-1.53l3.4-.5zm.8.63L6.55 5.67a.9.9 0 0 1-.68.5l-3.25.47 2.35 2.3c.21.2.3.5.26.79l-.56 3.24 2.91-1.53a.9.9 0 0 1 .84 0l2.9 1.53-.55-3.24a.9.9 0 0 1 .26-.8l2.36-2.3-3.26-.46a.9.9 0 0 1-.67-.5z"]), Hu = /*#__PURE__*/ W("TaskListSquareLtr20Regular", "20", ["M9.35 7.1a.5.5 0 0 0-.7-.7L7.23 7.8l-.4-.35a.5.5 0 0 0-.67.73l.75.69c.2.18.5.17.7-.02zm0 4.3c.2.2.2.5 0 .7L7.6 13.85a.5.5 0 0 1-.69.02l-.75-.69a.5.5 0 0 1 .68-.73l.4.36 1.4-1.41c.2-.2.52-.2.71 0M11 12a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 0-1zm-.5-4.5c0-.28.22-.5.5-.5h2.5a.5.5 0 0 1 0 1H11a.5.5 0 0 1-.5-.5M6 3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zM4 6c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"]), Uu = /*#__PURE__*/ W("TaskListSquareLtr24Regular", "24", ["M12.5 9.25c0-.41.34-.75.75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75m.75 4.75a.75.75 0 1 0 0 1.5h3.5a.75.75 0 1 0 0-1.5zm-2.47-5.22a.75.75 0 1 0-1.06-1.06L8.25 9.19l-.47-.47a.75.75 0 0 0-1.06 1.06l1 1c.3.3.77.3 1.06 0zm0 4.44c.3.3.3.77 0 1.06l-2 2c-.3.3-.77.3-1.06 0l-1-1a.75.75 0 1 1 1.06-1.06l.47.47 1.47-1.47c.3-.3.77-.3 1.06 0M6.25 3A3.25 3.25 0 0 0 3 6.25v11.5C3 19.55 4.46 21 6.25 21h11.5c1.8 0 3.25-1.46 3.25-3.25V6.25C21 4.45 19.54 3 17.75 3zM4.5 6.25c0-.97.78-1.75 1.75-1.75h11.5c.97 0 1.75.78 1.75 1.75v11.5c0 .97-.78 1.75-1.75 1.75H6.25c-.97 0-1.75-.78-1.75-1.75z"]), Wu = /*#__PURE__*/ W("Add20Regular", "20", ["M10 2.5c.28 0 .5.22.5.5v6.5H17a.5.5 0 0 1 0 1h-6.5V17a.5.5 0 0 1-1 0v-6.5H3a.5.5 0 0 1 0-1h6.5V3c0-.28.22-.5.5-.5"]), Gu = /*#__PURE__*/ W("Edit20Regular", "20", ["M17.18 2.93a2.97 2.97 0 0 0-4.26-.06l-9.37 9.38q-.5.5-.66 1.2l-.88 3.94a.5.5 0 0 0 .6.6l3.93-.87c.46-.1.9-.34 1.23-.68l9.36-9.36a2.97 2.97 0 0 0 .05-4.15m-3.55.65a1.97 1.97 0 1 1 2.8 2.8l-.68.66-2.8-2.79zm-1.38 1.38 2.8 2.8-7.99 7.97q-.31.31-.74.41l-3.16.7.7-3.18q.1-.41.4-.7z"]), Ku = /*#__PURE__*/ W("Flag16Filled", "16", ["M4 10h9a.5.5 0 0 0 .4-.8L11.12 6l2.3-3.2A.5.5 0 0 0 13 2H3.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 1 0z"]), qu = /*#__PURE__*/ W("Flag16Regular", "16", ["M4 9V3h8.03l-1.94 2.7a.5.5 0 0 0 0 .6L12.03 9zm0 1h9a.5.5 0 0 0 .4-.8L11.12 6l2.3-3.2A.5.5 0 0 0 13 2H3.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 1 0z"]), Ju = /*#__PURE__*/ W("List20Regular", "20", ["M2 4.5c0-.28.22-.5.5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0 10c0-.28.22-.5.5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5M2.5 9a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1z"]), Yu = /*#__PURE__*/ W("ArrowLeft24Regular", "24", ["M10.73 19.8a.75.75 0 0 0 1.04-1.1l-6.25-5.95h14.73a.75.75 0 0 0 0-1.5H5.52l6.25-5.95a.75.75 0 0 0-1.04-1.1l-7.42 7.08a1 1 0 0 0 0 1.44z"]), Xu = /*#__PURE__*/ W("Checkmark12Filled", "12", ["M9.76 3.2c.3.29.32.76.04 1.06l-4.25 4.5a.75.75 0 0 1-1.08.02L2.22 6.53a.75.75 0 0 1 1.06-1.06l1.7 1.7L8.7 3.24a.75.75 0 0 1 1.06-.04"]), Zu = /*#__PURE__*/ W("Checkmark16Filled", "16", ["M14.05 3.49c.28.3.27.77-.04 1.06l-7.93 7.47A.85.85 0 0 1 4.9 12L2.22 9.28a.75.75 0 1 1 1.06-1.06l2.24 2.27 7.47-7.04a.75.75 0 0 1 1.06.04"]), Qu = /*#__PURE__*/ W("CheckmarkCircle12Filled", "12", ["M1 6a5 5 0 1 1 10 0A5 5 0 0 1 1 6m7.35-.9a.5.5 0 1 0-.7-.7L5.5 6.54 4.35 5.4a.5.5 0 1 0-.7.7l1.5 1.5c.2.2.5.2.7 0z"]), $u = /*#__PURE__*/ W("ChevronLeft20Regular", "20", ["M12.35 15.85a.5.5 0 0 1-.7 0L6.16 10.4a.55.55 0 0 1 0-.78l5.49-5.46a.5.5 0 1 1 .7.7L7.2 10l5.16 5.15c.2.2.2.5 0 .7"]), ed = /*#__PURE__*/ W("ChevronRight16Regular", "16", ["M5.65 3.15a.5.5 0 0 0 0 .7L9.79 8l-4.14 4.15a.5.5 0 0 0 .7.7l4.5-4.5a.5.5 0 0 0 0-.7l-4.5-4.5a.5.5 0 0 0-.7 0"]), td = /*#__PURE__*/ W("ChevronRight20Regular", "20", ["M7.65 4.15c.2-.2.5-.2.7 0l5.49 5.46c.21.22.21.57 0 .78l-5.49 5.47a.5.5 0 0 1-.7-.71L12.8 10 7.65 4.85a.5.5 0 0 1 0-.7"]), nd = /*#__PURE__*/ W("Square12Filled", "12", ["M2 4c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"]), G = /*#__PURE__*/ W("Square16Filled", "16", ["M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5z"]), K = /*#__PURE__*/ W("Delete20Regular", "20", ["M8.5 4h3a1.5 1.5 0 0 0-3 0m-1 0a2.5 2.5 0 0 1 5 0h5a.5.5 0 0 1 0 1h-1.05l-1.2 10.34A3 3 0 0 1 12.27 18H7.73a3 3 0 0 1-2.98-2.66L3.55 5H2.5a.5.5 0 0 1 0-1zM5.74 15.23A2 2 0 0 0 7.73 17h4.54a2 2 0 0 0 1.99-1.77L15.44 5H4.56zM8.5 7.5c.28 0 .5.22.5.5v6a.5.5 0 0 1-1 0V8c0-.28.22-.5.5-.5M12 8a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"]), rd = /*#__PURE__*/ W("DiamondDismiss12Filled", "12", ["M4.59 1.09a2 2 0 0 1 2.82 0l3.5 3.5a2 2 0 0 1 0 2.82l-3.5 3.5a2 2 0 0 1-2.82 0l-3.5-3.5a2 2 0 0 1 0-2.83zm3.26 3.06a.5.5 0 0 0-.7 0L6 5.29 4.85 4.15a.5.5 0 0 0-.7.7L5.29 6 4.15 7.15a.5.5 0 0 0 .7.7L6 6.71l1.15 1.14a.5.5 0 1 0 .7-.7L6.71 6l1.14-1.15a.5.5 0 0 0 0-.7"]), id = /*#__PURE__*/ W("Dismiss16Regular", "16", ["m2.59 2.72.06-.07a.5.5 0 0 1 .63-.06l.07.06L8 7.29l4.65-4.64a.5.5 0 0 1 .7.7L8.71 8l4.64 4.65c.18.17.2.44.06.63l-.06.07a.5.5 0 0 1-.63.06l-.07-.06L8 8.71l-4.65 4.64a.5.5 0 0 1-.7-.7L7.29 8 2.65 3.35a.5.5 0 0 1-.06-.63l.06-.07z"]), ad = /*#__PURE__*/ W("Dismiss20Regular", "20", ["m4.09 4.22.06-.07a.5.5 0 0 1 .63-.06l.07.06L10 9.29l5.15-5.14a.5.5 0 0 1 .63-.06l.07.06c.18.17.2.44.06.63l-.06.07L10.71 10l5.14 5.15c.18.17.2.44.06.63l-.06.07a.5.5 0 0 1-.63.06l-.07-.06L10 10.71l-5.15 5.14a.5.5 0 0 1-.63.06l-.07-.06a.5.5 0 0 1-.06-.63l.06-.07L9.29 10 4.15 4.85a.5.5 0 0 1-.06-.63l.06-.07z"]), od = P({
	root: { mc9l5x: "fjseox" },
	visible: { mc9l5x: "f1w7gpdv" }
}, { d: [".fjseox{display:none;}", ".f1w7gpdv{display:inline;}"] }), sd = (e, t) => {
	let n = (n) => {
		let { className: r, filled: i, ...a } = n, o = od();
		return M.createElement(M.Fragment, null, M.createElement(e, Object.assign({}, a, { className: k(o.root, i && o.visible, cu, r) })), M.createElement(t, Object.assign({}, a, { className: k(o.root, !i && o.visible, lu, r) })));
	};
	return n.displayName = "CompoundIcon", n;
}, cd = {
	durationUltraFast: 50,
	durationFaster: 100,
	durationFast: 150,
	durationNormal: 200,
	durationGentle: 250,
	durationSlow: 300,
	durationSlower: 400,
	durationUltraSlow: 500
}, ld = {
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
	...cd,
	...ld
};
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/isAnimationRunning.js
function ud(e) {
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
var dd = { fill: "forwards" }, fd = { duration: 1 };
function pd(e) {
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
			return e.some((e) => ud(e));
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
function md() {
	let e = typeof window < "u" && typeof window.Animation?.prototype.persist == "function";
	return M.useCallback((t, n, r) => {
		let i = Array.isArray(n) ? n : [n], { isReducedMotion: a } = r;
		return pd(i.map((n) => {
			let { keyframes: r, reducedMotion: i = fd, ...o } = n, { keyframes: s = r, ...c } = i, l = a ? s : r, u = {
				...dd,
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
function hd() {
	return md();
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useMotionImperativeRef.js
function gd(e) {
	let t = M.useRef(void 0);
	return M.useImperativeHandle(e, () => ({
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
var _d = "screen and (prefers-reduced-motion: reduce)";
function vd() {
	let { targetDocument: e } = ei(), t = e?.defaultView ?? null, n = M.useRef(!1), r = M.useCallback(() => n.current, []);
	return wi(() => {
		if (t === null || typeof t.matchMedia != "function") return;
		let e = t.matchMedia(_d);
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
var yd = [
	"@fluentui/react-motion: Invalid child element.",
	"\n",
	"Motion factories require a single child element to be passed. ",
	"That element element should support ref forwarding i.e. it should be either an intrinsic element (e.g. div) or a component that uses React.forwardRef()."
].join("");
function bd(e, t = !0) {
	let n = M.useRef(null);
	M.useEffect(() => {}, [t]);
	try {
		let t = M.Children.only(e);
		if (M.isValidElement(t)) return [M.cloneElement(t, { ref: Ai(n, Vi(t)) }), n];
	} catch {}
	throw Error(yd);
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/contexts/MotionBehaviourContext.js
var xd = M.createContext(void 0);
xd.Provider;
var Sd = () => M.useContext(xd) ?? "default", Cd = Symbol("MOTION_DEFINITION");
function wd(e) {
	return Object.assign((t) => {
		let { children: n, imperativeRef: r, onMotionFinish: i, onMotionStart: a, onMotionCancel: o, replayKey: s, ...c } = t, l = c, [u, d] = bd(n), f = gd(r), p = M.useRef(!0), m = Sd() === "skip", h = M.useRef({
			skipMotions: m,
			params: l
		}), g = hd(), _ = vd(), v = F(() => {
			a?.(null);
		}), y = F(() => {
			i?.(null);
		}), b = F(() => {
			o?.(null);
		}), x = M.useCallback((e) => {
			v(), e.setMotionEndCallbacks(y, b), h.current.skipMotions && e.finish();
		}, [
			v,
			y,
			b
		]);
		return wi(() => {
			h.current = {
				skipMotions: m,
				params: l
			};
		}), wi(() => {
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
		]), wi(() => {
			if (p.current) return;
			let e = f.current;
			e && (e.cancel(), e.play(), x(e));
		}, [s]), wi(() => (p.current = !1, () => {
			p.current = !0;
		}), []), u;
	}, { [Cd]: typeof e == "function" ? e : () => e });
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/contexts/PresenceGroupChildContext.js
var Td = M.createContext(void 0);
Td.Provider;
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useMountedState.js
function Ed(e = !1, t = !1) {
	let n = M.useRef(!t || e), r = Ei(), i = M.useCallback((e) => {
		n.current !== e && (n.current = e, r());
	}, [r]);
	return M.useEffect(() => {
		e && (n.current = e);
	}), [e || n.current, i];
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/factories/createPresenceComponent.js
var Dd = Symbol("PRESENCE_MOTION_DEFINITION"), Od = Symbol.for("interruptablePresence");
function kd(e) {
	return Object.assign((t) => {
		let n = {
			...M.useContext(Td),
			...t
		}, r = Sd() === "skip", { appear: i, children: a, imperativeRef: o, onExit: s, onMotionFinish: c, onMotionStart: l, onMotionCancel: u, visible: d, unmountOnExit: f, ...p } = n, m = p, [h, g] = Ed(d, f), [_, v] = bd(a, h), y = gd(o), b = M.useRef({
			appear: i,
			params: m,
			skipMotions: r
		}), x = hd(), S = Ti(), C = vd(), w = F((e) => {
			l?.(null, { direction: e });
		}), T = F((e) => {
			c?.(null, { direction: e }), e === "exit" && f && (g(!1), s?.());
		}), E = F((e) => {
			u?.(null, { direction: e });
		});
		return wi(() => {
			b.current = {
				appear: i,
				params: m,
				skipMotions: r
			};
		}), wi(() => {
			let t = v.current;
			if (!t) return;
			let n;
			function r() {
				n && (a && n.isRunning() || (n.cancel(), y.current = void 0));
			}
			let i = typeof e == "function" ? e({
				element: t,
				...b.current.params
			}) : e, a = i[Od];
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
		]), M.useEffect(() => {
			if (f && !h) {
				var e;
				(e = y.current) == null || e.dispose();
			}
		}, [
			y,
			f,
			h
		]), h ? _ : null;
	}, { [Dd]: typeof e == "function" ? e : () => e }, {
		In: wd(typeof e == "function" ? (...t) => e(...t).enter : e.enter),
		Out: wd(typeof e == "function" ? (...t) => e(...t).exit : e.exit)
	});
}
//#endregion
//#region node_modules/@swc/helpers/esm/_define_property.js
function Ad(e, t, n) {
	return t in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/groups/mergeChildMappings.js
function jd(e, t) {
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
function Md(e, t) {
	let n = jd(e, t);
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
function Nd(e) {
	let t = {};
	return e && M.Children.toArray(e).forEach((e) => {
		M.isValidElement(e) && (t[e.key ?? ""] = {
			appear: !1,
			element: e,
			visible: !0,
			unmountOnExit: !0
		});
	}), t;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/components/PresenceGroupItemProvider.js
var Pd = (e) => {
	let { appear: t, childKey: n, onExit: r, visible: i, unmountOnExit: a } = e, o = M.useMemo(() => ({
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
	return /*#__PURE__*/ M.createElement(Td.Provider, { value: o }, e.children);
}, Fd = class extends M.Component {
	static getDerivedStateFromProps(e, { childMapping: t, firstRender: n }) {
		let r = Nd(e.children);
		return {
			childMapping: n ? r : Md(t, r),
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
		return /*#__PURE__*/ M.createElement(M.Fragment, null, Object.entries(this.state.childMapping).map(([e, t]) => /*#__PURE__*/ M.createElement(Pd, {
			...t,
			childKey: e,
			key: e,
			onExit: this.handleExit
		}, t.element)));
	}
	constructor(e, t) {
		super(e, t), Ad(this, "mounted", !1), Ad(this, "handleExit", (e) => {
			e in Nd(this.props.children) || this.mounted && this.setState((t) => {
				let n = { ...t.childMapping };
				return delete n[e], { childMapping: n };
			});
		}), this.state = {
			childMapping: {},
			firstRender: !0
		};
	}
}, Id = /*#__PURE__*/ M.createContext(void 0);
function Ld() {
	return M.useContext(Id);
}
var Rd = /*#__PURE__*/ M.forwardRef((e, t) => /*#__PURE__*/ M.createElement(Id.Provider, { value: t }, e.children));
Rd.displayName = "MotionRefForwarder";
//#endregion
//#region node_modules/@fluentui/react-motion/lib/slots/motionSlot.js
function zd(e, t) {
	let { as: n, children: r, ...i } = e ?? {};
	if (e === null) {
		let e = (e, t) => /*#__PURE__*/ M.createElement(M.Fragment, null, t.children);
		return {
			[$n]: e,
			[er]: t.elementType
		};
	}
	let a = {
		...t.defaultProps,
		...i,
		[er]: t.elementType
	};
	return typeof r == "function" && (a[$n] = r), a;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/slots/presenceMotionSlot.js
function Bd(e, t) {
	let { as: n, children: r, ...i } = e ?? {};
	if (e === null) {
		let e = !t.defaultProps.visible && t.defaultProps.unmountOnExit, n = (t, n) => e ? null : /*#__PURE__*/ M.createElement(M.Fragment, null, n.children);
		return {
			[$n]: n,
			[er]: t.elementType
		};
	}
	let a = {
		...t.defaultProps,
		...i,
		[er]: t.elementType
	};
	return typeof r == "function" && (a[$n] = r), a;
}
//#endregion
//#region node_modules/@fluentui/react-motion-components-preview/lib/atoms/fade-atom.js
var Vd = ({ direction: e, duration: t, easing: n = q.curveLinear, delay: r = 0, outOpacity: i = 0, inOpacity: a = 1 }) => {
	let o = [{ opacity: i }, { opacity: a }];
	return e === "exit" && o.reverse(), {
		keyframes: o,
		duration: t,
		easing: n,
		delay: r,
		fill: "both"
	};
}, Hd = ({ direction: e, duration: t, easing: n = q.curveLinear, delay: r = 0, outX: i = "0px", outY: a = "0px", inX: o = "0px", inY: s = "0px" }) => {
	let c = [{ translate: `${i} ${a}` }, { translate: `${o} ${s}` }];
	return e === "exit" && c.reverse(), {
		keyframes: c,
		duration: t,
		easing: n,
		delay: r
	};
}, Ud = (e, t) => {
	let { shape: n = "circular", size: r = "medium", appearance: i = "filled", color: a = "brand", ...o } = e;
	return {
		...Wd(o, t),
		shape: n,
		size: r,
		appearance: i,
		color: a
	};
}, Wd = (e, t) => {
	let { iconPosition: n = "before" } = e;
	return {
		iconPosition: n,
		components: {
			root: "div",
			icon: "span"
		},
		root: nr(Rr("div", {
			ref: t,
			...e
		}), { elementType: "div" }),
		icon: rr(e.icon, { elementType: "span" })
	};
}, Gd = {
	root: "fui-Badge",
	icon: "fui-Badge__icon"
};
U.spacingHorizontalXXS;
var Kd = /*#__PURE__*/ Yn("r1iycov", "r115jdol", [
	".r1iycov{display:inline-flex;box-sizing:border-box;align-items:center;justify-content:center;position:relative;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightSemibold);line-height:var(--lineHeightBase200);height:20px;min-width:20px;padding:0 calc(var(--spacingHorizontalXS) + var(--spacingHorizontalXXS));border-radius:var(--borderRadiusCircular);border-color:var(--colorTransparentStroke);}",
	".r1iycov::after{content:\"\";position:absolute;top:0;left:0;bottom:0;right:0;border-style:solid;border-color:inherit;border-width:var(--strokeWidthThin);border-radius:inherit;}",
	".r115jdol{display:inline-flex;box-sizing:border-box;align-items:center;justify-content:center;position:relative;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightSemibold);line-height:var(--lineHeightBase200);height:20px;min-width:20px;padding:0 calc(var(--spacingHorizontalXS) + var(--spacingHorizontalXXS));border-radius:var(--borderRadiusCircular);border-color:var(--colorTransparentStroke);}",
	".r115jdol::after{content:\"\";position:absolute;top:0;right:0;bottom:0;left:0;border-style:solid;border-color:inherit;border-width:var(--strokeWidthThin);border-radius:inherit;}"
]), qd = /*#__PURE__*/ P({
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
] }), Jd = /*#__PURE__*/ Yn("rttl5z0", null, [".rttl5z0{display:flex;line-height:1;margin:0 calc(-1 * var(--spacingHorizontalXXS));font-size:12px;}"]), Yd = /*#__PURE__*/ P({
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
] }), Xd = (e) => {
	let t = Kd(), n = qd(), r = e.size === "small" || e.size === "extra-small" || e.size === "tiny";
	e.root.className = k(Gd.root, t, r && n.fontSmallToTiny, n[e.size], n[e.shape], e.shape === "rounded" && r && n.roundedSmallToTiny, e.appearance === "ghost" && n.borderGhost, n[e.appearance], n[`${e.appearance}-${e.color}`], e.root.className);
	let i = Jd(), a = Yd();
	if (e.icon) {
		let t;
		M.Children.toArray(e.root.children).length > 0 && (t = e.size === "extra-large" ? e.iconPosition === "after" ? a.afterTextXL : a.beforeTextXL : e.iconPosition === "after" ? a.afterText : a.beforeText), e.icon.className = k(Gd.icon, i, t, a[e.size], e.icon.className);
	}
	return e;
}, Zd = (e) => /*#__PURE__*/ aa(e.root, { children: [
	e.iconPosition === "before" && e.icon && /*#__PURE__*/ I(e.icon, {}),
	e.root.children,
	e.iconPosition === "after" && e.icon && /*#__PURE__*/ I(e.icon, {})
] }), Qd = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = Ud(e, t);
	return Xd(n), si("useBadgeStyles_unstable")(n), Zd(n);
});
Qd.displayName = "Badge";
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/createVirtualElementFromClick.js
function $d(e) {
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
var ef = "data-popper-is-intersecting", tf = "data-popper-escaped", nf = "data-popper-reference-hidden", rf = "data-popper-placement", af = "fui-positioningend", of = "--fui-positioning-slide-direction-x", sf = "--fui-positioning-slide-direction-y";
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningSlideDirection.js
function cf(e) {
	let t = e.split("-")[0], n = 0, r = 1;
	return t === "right" ? (n = -1, r = 0) : t === "bottom" ? (n = 0, r = -1) : t === "left" && (n = 1, r = 0), {
		x: n,
		y: r
	};
}
function lf(e) {
	let { targetDocument: t, onPositioningEnd: n } = e, r = F((e) => {
		n?.(e);
		let t = e.target, r = e.detail.placement;
		if (!Ui(t)) return;
		let { x: i, y: a } = cf(r);
		t.style.setProperty(of, `${i}px`), t.style.setProperty(sf, `${a}px`);
	});
	return M.useEffect(() => {
		var e;
		let n = (t == null || (e = t.defaultView) == null ? void 0 : e.CSS?.registerProperty) ?? (() => {});
		try {
			n({
				name: of,
				syntax: "<length>",
				inherits: !1,
				initialValue: "0px"
			}), n({
				name: sf,
				syntax: "<length>",
				inherits: !1,
				initialValue: "0px"
			});
		} catch {}
	}, [t]), r;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/PositioningConfigurationContext.js
var uf = ({ options: e }) => e, df = M.createContext(void 0);
df.Provider;
var ff = () => M.useContext(df) ?? uf, pf = [
	"top",
	"right",
	"bottom",
	"left"
], mf = Math.min, hf = Math.max, gf = Math.round, J = (e) => ({
	x: e,
	y: e
}), _f = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function vf(e, t, n) {
	return hf(e, mf(t, n));
}
function yf(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function bf(e) {
	return e.split("-")[0];
}
function xf(e) {
	return e.split("-")[1];
}
function Sf(e) {
	return e === "x" ? "y" : "x";
}
function Cf(e) {
	return e === "y" ? "height" : "width";
}
function wf(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Tf(e) {
	return Sf(wf(e));
}
function Ef(e, t, n) {
	n === void 0 && (n = !1);
	let r = xf(e), i = Tf(e), a = Cf(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = Ff(o)), [o, Ff(o)];
}
function Df(e) {
	let t = Ff(e);
	return [
		Of(e),
		t,
		Of(t)
	];
}
function Of(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var kf = ["left", "right"], Af = ["right", "left"], jf = ["top", "bottom"], Mf = ["bottom", "top"];
function Nf(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? Af : kf : t ? kf : Af;
		case "left":
		case "right": return t ? jf : Mf;
		default: return [];
	}
}
function Pf(e, t, n, r) {
	let i = xf(e), a = Nf(bf(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(Of)))), a;
}
function Ff(e) {
	let t = bf(e);
	return _f[t] + e.slice(t.length);
}
function If(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function Lf(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : If(e);
}
function Rf(e) {
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
function zf(e, t, n) {
	let { reference: r, floating: i } = e, a = wf(t), o = Tf(t), s = Cf(o), c = bf(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	let m = xf(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function Bf(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = yf(t, e), p = Lf(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = Rf(await i.getClippingRect({
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
	}, y = Rf(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var Vf = 50, Hf = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: Bf
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = zf(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < Vf && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = zf(l, f, c)), n = -1);
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
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = yf(e, t) || {};
		if (l == null) return {};
		let d = Lf(u), f = {
			x: n,
			y: r
		}, p = Tf(i), m = Cf(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = mf(d[_], T), D = mf(d[v], T), ee = C - h[m] - D, O = C / 2 - h[m] / 2 + w, te = vf(E, O, ee), ne = !c.arrow && xf(i) != null && O !== te && a.reference[m] / 2 - (O < E ? E : D) - h[m] / 2 < 0, re = ne ? O < E ? O - E : O - ee : 0;
		return {
			[p]: f[p] + re,
			data: {
				[p]: te,
				centerOffset: O - te - re,
				...ne && { alignmentOffset: re }
			},
			reset: ne
		};
	}
}), Wf = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = yf(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = bf(r), _ = wf(o), v = bf(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [Ff(o)] : Df(o)), x = p !== "none";
			!d && x && b.push(...Pf(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = Ef(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === wf(t) || T.every((e) => wf(e.placement) !== _ || e.overflows[0] > 0))) return {
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
								let t = wf(e.placement);
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
function Y(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function Gf(e) {
	return pf.some((t) => e[t] >= 0);
}
var Kf = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = yf(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = Y(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: Gf(e)
					} };
				}
				case "escaped": {
					let e = Y(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: Gf(e)
					} };
				}
				default: return {};
			}
		}
	};
}, qf = /*#__PURE__*/ new Set(["left", "top"]);
async function Jf(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = bf(n), s = xf(n), c = wf(n) === "y", l = qf.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = yf(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var Yf = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Jf(t, e);
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
}, Xf = function(e) {
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
			} }, ...l } = yf(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = wf(i), p = Sf(f), m = u[p], h = u[f], g = (e, t) => vf(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
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
}, Zf = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = yf(e, t), u = {
				x: n,
				y: r
			}, d = wf(i), f = Sf(d), p = u[f], m = u[d], h = yf(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = qf.has(bf(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Qf = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = yf(e, t), c = await i.detectOverflow(t, s), l = bf(n), u = xf(n), d = wf(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = mf(p - c[m], g), y = mf(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
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
function $f() {
	return typeof window < "u";
}
function ep(e) {
	return rp(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function tp(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function np(e) {
	return ((rp(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function rp(e) {
	return $f() ? e instanceof Node || e instanceof tp(e).Node : !1;
}
function X(e) {
	return $f() ? e instanceof Element || e instanceof tp(e).Element : !1;
}
function ip(e) {
	return $f() ? e instanceof HTMLElement || e instanceof tp(e).HTMLElement : !1;
}
function ap(e) {
	return !$f() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof tp(e).ShadowRoot;
}
function op(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = _p(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function sp(e) {
	return /^(table|td|th)$/.test(ep(e));
}
function cp(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var lp = /transform|translate|scale|rotate|perspective|filter/, up = /paint|layout|strict|content/, dp = (e) => !!e && e !== "none", fp;
function pp(e) {
	let t = X(e) ? _p(e) : e;
	return dp(t.transform) || dp(t.translate) || dp(t.scale) || dp(t.rotate) || dp(t.perspective) || !hp() && (dp(t.backdropFilter) || dp(t.filter)) || lp.test(t.willChange || "") || up.test(t.contain || "");
}
function mp(e) {
	let t = yp(e);
	for (; ip(t) && !gp(t);) {
		if (pp(t)) return t;
		if (cp(t)) return null;
		t = yp(t);
	}
	return null;
}
function hp() {
	return fp ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), fp;
}
function gp(e) {
	return /^(html|body|#document)$/.test(ep(e));
}
function _p(e) {
	return tp(e).getComputedStyle(e);
}
function vp(e) {
	return X(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function yp(e) {
	if (ep(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || ap(e) && e.host || np(e);
	return ap(t) ? t.host : t;
}
function bp(e) {
	let t = yp(e);
	return gp(t) ? (e.ownerDocument || e).body : ip(t) && op(t) ? t : bp(t);
}
function xp(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = bp(e), i = r === e.ownerDocument?.body, a = tp(r);
	if (i) {
		let e = Sp(a);
		return t.concat(a, a.visualViewport || [], op(r) ? r : [], e && n ? xp(e) : []);
	}
	return t.concat(r, xp(r, [], n));
}
function Sp(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Cp(e) {
	let t = _p(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = ip(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = gf(n) !== a || gf(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function wp(e) {
	return X(e) ? e : e.contextElement;
}
function Tp(e) {
	let t = wp(e);
	if (!ip(t)) return J(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Cp(t), o = (a ? gf(n.width) : n.width) / r, s = (a ? gf(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Ep = /*#__PURE__*/ J(0);
function Dp(e) {
	let t = tp(e);
	return !hp() || !t.visualViewport ? Ep : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Op(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === tp(e);
}
function kp(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = wp(e), o = J(1);
	t && (r ? X(r) && (o = Tp(r)) : o = Tp(e));
	let s = Op(a, n, r) ? Dp(a) : J(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = tp(a), t = X(r) ? tp(r) : r, n = e, i = Sp(n);
		for (; i && t !== n;) {
			let e = Tp(i), t = i.getBoundingClientRect(), r = _p(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = tp(i), i = Sp(n);
		}
	}
	return Rf({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function Ap(e, t) {
	let n = vp(e).scrollLeft;
	return t ? t.left + n : kp(np(e)).left + n;
}
function jp(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - Ap(e, n),
		y: n.top + t.scrollTop
	};
}
function Mp(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = np(r), s = t ? cp(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = J(1), u = J(0), d = ip(r);
	if ((d || !a) && ((ep(r) !== "body" || op(o)) && (c = vp(r)), d)) {
		let e = kp(r);
		l = Tp(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? jp(o, c) : J(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function Np(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Pp(e) {
	let t = vp(e), n = e.ownerDocument.body, r = hf(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = hf(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + Ap(e), o = -t.scrollTop;
	return _p(n).direction === "rtl" && (a += hf(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var Fp = 25;
function Ip(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = tp(e), a = np(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !hp() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (Ap(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= Fp && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function Lp(e, t) {
	let n = kp(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Tp(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function Rp(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = Ip(e, n, t);
	else if (t === "document") r = Pp(np(e));
	else if (X(t)) r = Lp(t, n);
	else {
		let n = Dp(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return Rf(r);
}
function zp(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = xp(e, [], !1).filter((e) => X(e) && ep(e) !== "body"), i = null, a = _p(e).position === "fixed", o = a ? yp(e) : e;
	for (; X(o) && !gp(o);) {
		let e = _p(o), t = pp(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = yp(o);
	}
	return t.set(e, r), r;
}
function Bp(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? cp(t) ? [] : zp(t, this._c) : [].concat(n), r], o = Rp(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = Rp(t, a[e], i);
		s = hf(n.top, s), c = mf(n.right, c), l = mf(n.bottom, l), u = hf(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Vp(e) {
	let { width: t, height: n } = Cp(e);
	return {
		width: t,
		height: n
	};
}
function Hp(e, t, n) {
	let r = ip(t), i = np(t), a = n === "fixed", o = kp(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = J(0);
	if ((r || !a) && ((ep(t) !== "body" || op(i)) && (s = vp(t)), r)) {
		let e = kp(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = Ap(i));
	let l = i && !r && !a ? jp(i, s) : J(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function Up(e) {
	return _p(e).position === "static";
}
function Wp(e, t) {
	if (!ip(e) || _p(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return np(e) === n && (n = n.ownerDocument.body), n;
}
function Gp(e, t) {
	let n = tp(e);
	if (cp(e)) return n;
	if (!ip(e)) {
		let t = yp(e);
		for (; t && !gp(t);) {
			if (X(t) && !Up(t)) return t;
			t = yp(t);
		}
		return n;
	}
	let r = Wp(e, t);
	for (; r && sp(r) && Up(r);) r = Wp(r, t);
	return r && gp(r) && Up(r) && !pp(r) ? n : r || mp(e) || n;
}
var Kp = async function(e) {
	let t = this.getOffsetParent || Gp, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: Hp(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function qp(e) {
	return _p(e).direction === "rtl";
}
var Jp = {
	convertOffsetParentRelativeRectToViewportRelativeRect: Mp,
	getDocumentElement: np,
	getClippingRect: Bp,
	getOffsetParent: Gp,
	getElementRects: Kp,
	getClientRects: Np,
	getDimensions: Vp,
	getScale: Tp,
	isElement: X,
	isRTL: qp
}, Yp = Bf, Xp = Yf, Zp = Xf, Qp = Wf, $p = Qf, em = Kf, tm = Uf, nm = Zf, rm = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...Jp,
		...i.platform,
		_c: r
	};
	return Hf(e, t, {
		...i,
		platform: a
	});
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/parseFloatingUIPlacement.js
function im(e) {
	let t = e.split("-");
	return {
		side: t[0],
		alignment: t[1]
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/getScrollParent.js
var am = (e) => e.nodeName === "HTML" ? e : e.parentNode || e.host, om = (e) => {
	if (e.nodeType !== 1) return {};
	let t = e.ownerDocument?.defaultView;
	return t ? t.getComputedStyle(e, null) : {};
}, sm = (e) => {
	let t = e && am(e);
	if (!t) return document.body;
	switch (t.nodeName) {
		case "HTML":
		case "BODY": return t.ownerDocument.body;
		case "#document": return t.body;
	}
	let { overflow: n, overflowX: r, overflowY: i } = om(t);
	return /(auto|scroll|overlay)/.test(n + i + r) ? t : sm(t);
}, cm = (e) => {
	let t = sm(e);
	return t ? t !== t.ownerDocument?.body : !1;
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/getBoundary.js
function lm(e, t) {
	if (t === "window") return e?.ownerDocument.documentElement;
	if (t === "clippingParents") return "clippingAncestors";
	if (t === "scrollParent") {
		let t = sm(e);
		return t.nodeName === "BODY" && (t = e?.ownerDocument.documentElement), t;
	}
	return t;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/mergeArrowOffset.js
function um(e, t) {
	return typeof e == "number" || typeof e == "object" && e ? dm(e, t) : typeof e == "function" ? (n) => dm(e(n), t) : { mainAxis: t };
}
var dm = (e, t) => typeof e == "number" ? { mainAxis: e + t } : {
	...e,
	mainAxis: (e.mainAxis ?? 0) + t
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/toFloatingUIPadding.js
function fm(e, t) {
	if (typeof e == "number") return e;
	let { start: n, end: r, ...i } = e, a = i, o = t ? "end" : "start", s = t ? "start" : "end";
	return e[o] && (a.left = e[o]), e[s] && (a.right = e[s]), a;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/toFloatingUIPlacement.js
var pm = (e) => ({
	above: "top",
	below: "bottom",
	before: e ? "right" : "left",
	after: e ? "left" : "right"
}), mm = () => ({
	start: "start",
	end: "end",
	top: "start",
	bottom: "end",
	center: void 0
}), hm = (e, t) => {
	let n = e === "above" || e === "below", r = t === "top" || t === "bottom";
	return n && r || !n && !r;
}, gm = (e, t, n) => {
	let r = hm(t, e) ? "center" : e, i = t && pm(n)[t], a = r && mm()[r];
	return i && a ? `${i}-${a}` : i;
}, _m = () => ({
	top: "above",
	bottom: "below",
	right: "after",
	left: "before"
}), vm = (e) => e === "above" || e === "below" ? {
	start: "start",
	end: "end"
} : {
	start: "top",
	end: "bottom"
}, ym = (e) => {
	let { side: t, alignment: n } = im(e), r = _m()[t];
	return {
		position: r,
		alignment: n && vm(r)[n]
	};
}, bm = {
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
function xm(e) {
	return e == null ? {} : typeof e == "string" ? bm[e] : e;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/useCallbackRef.js
function Sm(e, t, n) {
	let r = M.useRef(!0), [i] = M.useState(() => ({
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
	return wi(() => {
		r.current = !1;
	}, []), i.callback = t, i.facade;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/debounce.js
function Cm(e) {
	let t;
	return () => (t ||= new Promise((n) => {
		Promise.resolve().then(() => {
			t = void 0, n(e());
		});
	}), t);
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/writeArrowUpdates.js
function wm(e) {
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
function Tm(e) {
	let { container: t, placement: n, middlewareData: r, strategy: i, lowPPI: a, coordinates: o, useTransform: s = !0 } = e;
	if (!t) return;
	t.setAttribute(rf, n), t.removeAttribute(ef), r.intersectionObserver.intersecting && t.setAttribute(ef, ""), t.removeAttribute(tf), r.hide?.escaped && t.setAttribute(tf, ""), t.removeAttribute(nf), r.hide?.referenceHidden && t.setAttribute(nf, "");
	let c = t.ownerDocument.defaultView?.devicePixelRatio || 1, l = Math.round(o.x * c) / c, u = Math.round(o.y * c) / c;
	Object.assign(t.style, { position: i }), s ? Object.assign(t.style, { transform: a ? `translate(${l}px, ${u}px)` : `translate3d(${l}px, ${u}px, 0)` }) : Object.assign(t.style, {
		left: `${l}px`,
		top: `${u}px`
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/normalizeAutoSize.js
var Em = (e) => {
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
function Dm(e) {
	let t = [], n = e;
	for (; n;) {
		let r = sm(n);
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
function Om(e, t) {
	return new e.ResizeObserver(t);
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/createPositionManager.js
function km(e) {
	let { clientWidth: t, clientHeight: n } = e.ownerDocument.documentElement;
	return t === 0 && n === 0;
}
function Am(e) {
	let t = !1, { container: n, target: r, arrow: i, strategy: a, middleware: o, placement: s, useTransform: c = !0, disableUpdateOnResize: l = !1 } = e, u = n.ownerDocument.defaultView;
	if (!r || !n || !u) return {
		updatePosition: () => void 0,
		dispose: () => void 0
	};
	let d = l ? null : Om(u, (e) => {
		e.every((e) => e.contentRect.width > 0 && e.contentRect.height > 0) && h();
	}), f = !0, p = /* @__PURE__ */ new Set();
	Object.assign(n.style, {
		position: "fixed",
		left: 0,
		top: 0,
		margin: 0
	});
	let m = () => {
		t || (f &&= (Dm(n).forEach((e) => p.add(e)), Ui(r) && Dm(r).forEach((e) => p.add(e)), p.forEach((e) => {
			e.addEventListener("scroll", h, { passive: !0 });
		}), d?.observe(n), Ui(r) && d?.observe(r), !1), Object.assign(n.style, { position: a }), rm(r, n, {
			placement: s,
			middleware: o,
			strategy: a
		}).then(({ x: e, y: r, middlewareData: o, placement: s }) => {
			if (t) return;
			let l = km(n) ? {
				...o,
				hide: {
					...o.hide,
					escaped: !1,
					referenceHidden: !1
				}
			} : o;
			wm({
				arrow: i,
				middlewareData: l
			}), Tm({
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
			}), n.dispatchEvent(new CustomEvent(af, { detail: {
				placement: s,
				escaped: l.hide?.escaped ?? !1,
				referenceHidden: l.hide?.referenceHidden ?? !1
			} }));
		}).catch((e) => {}));
	}, h = Cm(() => m());
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
function jm() {
	return {
		name: "coverTarget",
		fn: (e) => {
			let { placement: t, rects: n, x: r, y: i } = e, a = im(t).side, o = {
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
function Mm(e) {
	let { hasScrollableElement: t, flipBoundary: n, container: r, fallbackPositions: i = [], isRtl: a } = e, o = i.reduce((e, t) => {
		let { position: n, align: r } = xm(t), i = gm(r, n, a);
		return i && e.push(i), e;
	}, []);
	return Qp({
		...t && { boundary: "clippingAncestors" },
		...n && {
			altBoundary: !0,
			boundary: lm(r, n)
		},
		fallbackStrategy: "bestFit",
		...o.length && { fallbackPlacements: o }
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/intersecting.js
function Nm() {
	return {
		name: "intersectionObserver",
		fn: async (e) => {
			let t = e.rects.floating, n = await Yp(e, { altBoundary: !0 }), r = n.top < t.height && n.top > 0, i = n.bottom < t.height && n.bottom > 0;
			return { data: { intersecting: r || i } };
		}
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/maxSize.js
var Pm = (e) => ({
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
function Fm(e, t) {
	let { container: n, overflowBoundary: r, overflowBoundaryPadding: i, isRtl: a } = t;
	return $p({
		...i && { padding: fm(i, a) },
		...r && {
			altBoundary: !0,
			boundary: lm(n, r)
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
function Im(e) {
	return !e || typeof e == "number" || typeof e == "object" ? e : ({ rects: { floating: t, reference: n }, placement: r }) => {
		let { position: i, alignment: a } = ym(r);
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
function Lm(e) {
	return Xp(Im(e));
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/shift.js
function Rm(e) {
	let { hasScrollableElement: t, shiftToCoverTarget: n, disableTether: r, overflowBoundary: i, container: a, overflowBoundaryPadding: o, isRtl: s } = e;
	return Zp({
		...t && { boundary: "clippingAncestors" },
		...n && {
			crossAxis: !0,
			limiter: nm({
				crossAxis: !0,
				mainAxis: !1
			})
		},
		...r && {
			crossAxis: r === "all",
			limiter: nm({
				crossAxis: r !== "all",
				mainAxis: !1
			})
		},
		...o && { padding: fm(o, s) },
		...i && {
			altBoundary: !0,
			boundary: lm(a, i)
		}
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/matchTargetSize.js
var zm = "--fui-match-target-size";
function Bm() {
	return {
		name: "matchTargetSize",
		fn: async (e) => {
			let { rects: { reference: t, floating: n }, elements: { floating: r }, middlewareData: { matchTargetSize: { matchTargetSizeAttempt: i = !1 } = {} } } = e;
			if (t.width === n.width || i) return {};
			let { width: a } = t;
			return r.style.setProperty(zm, `${a}px`), r.style.width || (r.style.width = `var(${zm})`), {
				data: { matchTargetSizeAttempt: !0 },
				reset: { rects: !0 }
			};
		}
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningOptions.js
function Vm(e, t) {
	let { align: n, arrowPadding: r, autoSize: i, coverTarget: a, disableUpdateOnResize: o, flipBoundary: s, offset: c, overflowBoundary: l, pinned: u, position: d, unstable_disableTether: f, strategy: p, overflowBoundaryPadding: m, fallbackPositions: h, useTransform: g, matchTargetSize: _, shiftToCoverTarget: v } = t;
	return M.useCallback((t, y) => e({
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
function Hm(e) {
	let { dir: t, targetDocument: n } = ei(), r = t === "rtl", i = Vm(ff(), e), { positionFixed: a } = e;
	return M.useCallback((e, t) => {
		let n = cm(e), { autoSize: o, disableUpdateOnResize: s, matchTargetSize: c, offset: l, coverTarget: u, flipBoundary: d, overflowBoundary: f, useTransform: p, overflowBoundaryPadding: m, pinned: h, position: g, arrowPadding: _, strategy: v, align: y, fallbackPositions: b, shiftToCoverTarget: x, unstable_disableTether: S } = i(e, t), C = Em(o), w = [
			C && Pm(C),
			c && Bm(),
			l && Lm(l),
			u && jm(),
			!h && Mm({
				container: e,
				flipBoundary: d,
				hasScrollableElement: n,
				isRtl: r,
				fallbackPositions: b
			}),
			Rm({
				container: e,
				hasScrollableElement: n,
				overflowBoundary: f,
				disableTether: S,
				overflowBoundaryPadding: m,
				isRtl: r,
				shiftToCoverTarget: x
			}),
			C && Fm(C, {
				container: e,
				overflowBoundary: f,
				overflowBoundaryPadding: m,
				isRtl: r
			}),
			Nm(),
			t && tm({
				element: t,
				padding: _
			}),
			em({ strategy: "referenceHidden" }),
			em({ strategy: "escaped" }),
			!1
		].filter(Boolean);
		return {
			placement: gm(y, g, r),
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
function Um(e) {
	let t = M.useRef(null), n = M.useRef(null), r = M.useRef(null), i = M.useRef(null), a = M.useRef(null), { enabled: o = !0 } = e, s = Hm(e), c = M.useCallback(() => {
		t.current && t.current.dispose(), t.current = null;
		let e = r.current ?? n.current;
		o && yi() && e && i.current && (t.current = Am({
			container: i.current,
			target: e,
			arrow: a.current,
			...s(i.current, a.current)
		}));
	}, [o, s]), l = F((e) => {
		r.current = e, c();
	});
	M.useImperativeHandle(e.positioningRef, () => ({
		updatePosition: () => t.current?.updatePosition(),
		setTarget: (t) => {
			e.target, l(t);
		}
	}), [e.target, l]), wi(() => {
		l(e.target ?? null);
	}, [e.target, l]), wi(() => {
		c();
	}, [c]);
	let u = Sm(null, (e) => {
		n.current !== e && (n.current = e, c());
	}), d = F((t) => e.onPositioningEnd?.call(e, t));
	return {
		targetRef: u,
		containerRef: Sm(null, (e) => {
			if (i.current !== e) {
				var t;
				(t = i.current) == null || t.removeEventListener("fui-positioningend", d), e?.addEventListener("fui-positioningend", d), i.current = e, c();
			}
		}),
		arrowRef: Sm(null, (e) => {
			a.current !== e && (a.current = e, c());
		})
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningMouseTarget.js
var Wm = (e) => {
	let [t, n] = M.useState(e);
	return [t, (e) => {
		if (e == null) {
			n(void 0);
			return;
		}
		let t;
		t = e instanceof MouseEvent ? e : e.nativeEvent, t instanceof MouseEvent;
		let r = $d(t);
		n(r);
	}];
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/createSafeZoneAreaStateStore.js
function Gm() {
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
var Km = /* @__PURE__ */ s(((e) => {
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
})), qm = /* @__PURE__ */ s(((e, t) => {
	t.exports = Km();
}));
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getRectCorners.js
function Jm(e, t) {
	return {
		topLeft: [e.left - t[0], e.top - t[1]],
		topRight: [e.right - t[0], e.top - t[1]],
		bottomRight: [e.right - t[0], e.bottom - t[1]],
		bottomLeft: [e.left - t[0], e.bottom - t[1]]
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getMouseAnchor.js
var Ym = 20;
function Xm(e, t) {
	return Math.sqrt((e[0] - t[0]) ** 2 + (e[1] - t[1]) ** 2);
}
function Zm(e, t) {
	let n = Xm(e, t);
	return n === 0 ? [0, 0] : [(e[0] - t[0]) / n, (e[1] - t[1]) / n];
}
function Qm(e, t, n) {
	let r = [(e[0] + t[0]) / 2, (e[1] + t[1]) / 2], i = Zm([n[0], n[1]], [r[0], r[1]]), a = Xm([r[0], r[1]], [n[0], n[1]]);
	return [r[0] + i[0] * (a + Ym), r[1] + i[1] * (a + Ym)];
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/pointsToSvgPath.js
function $m(e) {
	return `M ${e} z`;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/SafeZoneArea.styles.js
var eh = /*#__PURE__*/ P({
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
function th(e) {
	if (e.width <= 0 || e.height <= 0) return "";
	let t = "";
	return t += `M ${e.x},${e.y} `, t += `V ${e.y + e.height} `, t += `H ${e.x + e.width} `, t += `V ${e.y} `, t += `H ${e.x} `, t += "Z ", t;
}
function nh(e, t, n) {
	let r = `M 0,0 H ${e} V ${t} H 0 Z `;
	return r += th(n), r;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getSafeZonePoints.js
function rh(e, t) {
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
var ih = qm(), ah = /*#__PURE__*/ M.memo((e) => {
	let { debug: t, onMouseEnter: n, onMouseMove: r, onMouseLeave: i, stateStore: a } = e, o = ki(), s = eh(), c = (0, ih.useSyncExternalStore)(a.subscribe, a.isActive), l = M.useRef(null), u = M.useRef(null), d = M.useRef(null), f = M.useRef(null);
	return M.useImperativeHandle(e.imperativeRef, () => ({ updateSVG({ containerRect: e, targetRect: t, mouseCoordinates: n }) {
		var r, i, a;
		let o = Math.min(t.top, e.top), s = Math.min(t.left, e.left), c = Math.max(t.bottom, e.bottom), p = Math.max(t.right, e.right), m = Jm(e, [s, o]), h = Jm(t, [s, o]), g = [n[0] - s, n[1] - o], _ = Qm(m.topLeft, m.bottomRight, g), v = p - s, y = c - o, b = nh(v, y, {
			x: h.topLeft[0],
			y: h.topLeft[1],
			width: t.width,
			height: t.height
		});
		l.current && (l.current.style.width = `${v}px`, l.current.style.height = `${y}px`, l.current.style.transform = `translate(${s}px, ${o}px)`);
		let x = rh(_, m);
		(r = u.current) == null || r.setAttribute("d", x.length > 0 ? $m(x) : ""), (i = d.current) == null || i.setAttribute("d", b), (a = f.current) == null || a.setAttribute("d", b);
	} }), []), /*#__PURE__*/ M.createElement("div", {
		className: k(s.wrapper, c && s.wrapperActive),
		"data-safe-zone": ""
	}, /*#__PURE__*/ M.createElement("svg", {
		"aria-hidden": !0,
		className: s.svg,
		xmlns: "http://www.w3.org/2000/svg",
		ref: l,
		style: {
			width: 0,
			height: 0,
			transform: "translate(0px, 0px)"
		}
	}, /*#__PURE__*/ M.createElement("g", {
		className: k(s.safeZone, t && s.safeZoneDebug),
		clipPath: `url(#${o})`,
		onMouseEnter: n,
		onMouseMove: r,
		onMouseLeave: i
	}, /*#__PURE__*/ M.createElement("path", { ref: u })), /*#__PURE__*/ M.createElement("clipPath", { id: o }, /*#__PURE__*/ M.createElement("path", { ref: d })), t && /*#__PURE__*/ M.createElement("path", {
		ref: f,
		className: s.rectDebug
	})));
}), oh = 2e3;
function sh({ debug: e = !1, disabled: t = !1, onSafeZoneEnter: n, onSafeZoneMove: r, onSafeZoneLeave: i, onSafeZoneTimeout: a, timeout: o = 1500 } = {}) {
	let [s] = M.useState(Gm), c = M.useRef(null), l = M.useRef(null), u = M.useRef(null), [d, f] = zi(), [p, m] = mi(), h = M.useRef({
		x: 0,
		y: 0
	}), g = M.useMemo(() => {
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
	]), _ = M.useMemo(() => {
		if (t) return () => {};
		let e = null;
		function n(e) {
			h.current = {
				x: e.clientX,
				y: e.clientY
			}, s.isActive() || s.toggleActive(!0), d(() => {
				s.toggleActive(!1);
			}, oh);
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
	]), v = F((e) => {
		n?.(e), d(() => {
			s.toggleActive(!1), a?.();
		}, o);
	}), y = F((e) => {
		d(() => {
			s.toggleActive(!1), a?.();
		}, o), r?.(e);
	}), b = F((e) => {
		i?.(e);
	});
	return M.useEffect(() => s.subscribe((e) => {
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
		containerRef: Ai(l, g),
		targetRef: Ai(u, _),
		elementToRender: M.useMemo(() => t ? null : /*#__PURE__*/ M.createElement(ah, {
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
function ch(e) {
	return Ui(e) ? { element: e } : typeof e == "object" ? e === null ? { element: null } : e : {};
}
//#endregion
//#region node_modules/@fluentui/react-portal/lib/components/Portal/usePortalMountNodeStyles.styles.js
var lh = /*#__PURE__*/ P({ root: {
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
] }), uh = M.useInsertionEffect, dh = (e) => {
	let { className: t, dir: n, focusVisibleRef: r, targetNode: i } = e, a = M.useMemo(() => {
		if (i === void 0 || e.disabled) return null;
		let t = i.ownerDocument.createElement("div");
		return i.appendChild(t), t;
	}, [i, e.disabled]);
	return M.useMemo(() => {
		a && (a.className = t, a.setAttribute("dir", n), a.setAttribute("data-portal-node", "true"), r.current = a);
	}, [
		t,
		n,
		a,
		r
	]), M.useEffect(() => () => {
		a?.remove();
	}, [a]), a;
}, fh = () => {
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
}, ph = uh ? (e) => {
	"use no memo";
	let { className: t, dir: n, focusVisibleRef: r, targetNode: i } = e, [a] = M.useState(fh), o = M.useMemo(() => i === void 0 || e.disabled ? null : new Proxy({}, {
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
	return uh(() => {
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
	]), M.useEffect(() => () => {
		o?.remove();
	}, [o]), o;
} : dh, mh = (e) => {
	"use no memo";
	let { targetDocument: t, dir: n } = ei(), r = li(), i = Vs(), a = lh(), o = Kr();
	return ph({
		dir: n,
		disabled: e.disabled,
		focusVisibleRef: i,
		className: k(o, a.root, e.className),
		targetNode: r ?? t?.body
	});
}, hh = (e) => {
	let { element: t, className: n } = ch(e.mountNode), r = M.useRef(null), i = mh({
		disabled: !!t,
		className: n
	}), a = t ?? i, o = {
		children: e.children,
		mountNode: a,
		virtualParentRootRef: r
	};
	return M.useEffect(() => {
		if (!a) return;
		let e = r.current, t = a.contains(e);
		if (e && !t) return Qi(a, e), () => {
			Qi(a, void 0);
		};
	}, [r, a]), o;
}, gh = /* @__PURE__ */ l(h(), 1), _h = (e) => /*#__PURE__*/ M.createElement("span", {
	hidden: !0,
	ref: e.virtualParentRootRef
}, e.mountNode && /*#__PURE__*/ gh.createPortal(/*#__PURE__*/ M.createElement(M.Fragment, null, e.children, /*#__PURE__*/ M.createElement("span", { hidden: !0 })), e.mountNode)), vh = (e) => _h(hh(e));
vh.displayName = "Portal";
//#endregion
//#region node_modules/@fluentui/react-tooltip/lib/components/Tooltip/private/useTooltipTimeout.js
var yh = (e) => -1, bh = (e) => void 0;
function xh(e) {
	let { targetDocument: t } = ei(), n = t?.defaultView, r = n ? n.setTimeout : yh, i = n ? n.clearTimeout : bh, a = M.useRef(void 0), o = M.useCallback((e, t) => (a.current !== void 0 && i(a.current), a.current = r(e, t ?? 0), a.current), [i, r]), s = M.useCallback(() => {
		a.current !== void 0 && (i(a.current), a.current = void 0);
	}, [i]);
	return M.useEffect(() => {
		let t = e.current;
		return () => {
			(!t || !t.isConnected) && s();
		};
	}, [s, e]), [o, s];
}
//#endregion
//#region node_modules/@fluentui/react-tooltip/lib/components/Tooltip/useTooltipBase.js
var Sh = (e) => {
	let t = Xr(), n = Ci(), { targetDocument: r } = ei(), [i, a] = gi({
		state: e.visible,
		initialState: !1
	}), [o, s] = M.useState(!1), { children: c, content: l, withArrow: u = !1, positioning: d = "above", onVisibleChange: f, relationship: p, showDelay: m = 250, hideDelay: h = 250, mountNode: g } = e, _ = {
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
		content: nr(l, {
			defaultProps: { role: "tooltip" },
			elementType: "div"
		})
	};
	_.content.id = ki("tooltip-", _.content.id);
	let v = xm(_.positioning), y = F((e) => {
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
	_.withArrow && (b.offset = um(b.offset, 6));
	let { targetRef: x, containerRef: S, arrowRef: C } = Um(b), [w, T] = xh(S), E = M.useCallback((e, t) => {
		T(), a((n) => (t.visible !== n && f?.(e, t), t.visible));
	}, [
		T,
		a,
		f
	]);
	_.content.ref = Ai(_.content.ref, S), _.arrowRef = C, wi(() => {
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
	let D = M.useRef(!1), ee = M.useCallback((e) => {
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
	]), O = ec(), [te] = M.useState(() => {
		let e = (e) => {
			e.detail?.isFocusedProgrammatically && !O() && (D.current = !0);
		}, t = null;
		return (n) => {
			t?.removeEventListener("keyborg:focusin", e), n?.addEventListener("keyborg:focusin", e), t = n;
		};
	}), ne = M.useCallback((e) => {
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
	_.content.onPointerEnter = Hi(_.content.onPointerEnter, T), _.content.onPointerLeave = Hi(_.content.onPointerLeave, ne), _.content.onFocus = Hi(_.content.onFocus, T), _.content.onBlur = Hi(_.content.onBlur, ne);
	let re = qi(c), k = {}, ie = re?.props?.["aria-haspopup"] && (re?.props?.["aria-expanded"] === !0 || re?.props?.["aria-expanded"] === "true");
	return p === "label" ? typeof _.content.children == "string" ? k["aria-label"] = _.content.children : (k["aria-labelledby"] = _.content.id, _.shouldRenderTooltip = !0) : p === "description" && (k["aria-describedby"] = _.content.id, _.shouldRenderTooltip = !0), (n || ie) && (_.shouldRenderTooltip = !1), _.children = Gi(c, {
		...k,
		...re?.props,
		ref: Ai(Vi(re), te, b.target === void 0 ? x : void 0),
		onPointerEnter: F(Hi(re?.props?.onPointerEnter, ee)),
		onPointerLeave: F(Hi(re?.props?.onPointerLeave, ne)),
		onFocus: F(Hi(re?.props?.onFocus, ee)),
		onBlur: F(Hi(re?.props?.onBlur, ne))
	}), _;
}, Ch = (e) => {
	"use no memo";
	let { appearance: t = "normal", ...n } = e;
	return {
		appearance: t,
		...Sh(n)
	};
}, wh = (e) => /*#__PURE__*/ aa(M.Fragment, { children: [e.children, e.shouldRenderTooltip && /*#__PURE__*/ I(vh, {
	mountNode: e.mountNode,
	children: /*#__PURE__*/ aa(e.content, { children: [e.withArrow && /*#__PURE__*/ I("div", {
		ref: e.arrowRef,
		className: e.arrowClassName
	}), e.content.children] })
})] }), Th = { content: "fui-Tooltip__content" }, Eh = /*#__PURE__*/ P({
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
] }), Dh = (e) => {
	let t = Eh();
	return e.content.className = k(Th.content, t.root, e.appearance === "inverted" && t.inverted, e.visible && t.visible, e.hidden && t.hidden, e.content.className), e.arrowClassName = t.arrow, e;
}, Oh = (e) => {
	let t = Ch(e);
	return Dh(t), si("useTooltipStyles_unstable")(t), wh(t);
};
Oh.displayName = "Tooltip", Oh.isFluentTriggerComponent = !0;
//#endregion
//#region node_modules/@fluentui/react-button/lib/components/Button/renderButton.js
var kh = (e) => {
	let { iconOnly: t, iconPosition: n } = e;
	return /*#__PURE__*/ aa(e.root, { children: [
		n !== "after" && e.icon && /*#__PURE__*/ I(e.icon, {}),
		!t && e.root.children,
		n === "after" && e.icon && /*#__PURE__*/ I(e.icon, {})
	] });
}, Ah = M.createContext(void 0), jh = {};
Ah.Provider;
var Mh = () => M.useContext(Ah) ?? jh, Nh = (e, t) => {
	let { size: n } = Mh(), { appearance: r = "secondary", shape: i = "rounded", size: a = n ?? "medium", ...o } = e;
	return {
		appearance: r,
		shape: i,
		size: a,
		...Ph(o, t)
	};
}, Ph = (e, t) => {
	let { icon: n, iconPosition: r = "before", ...i } = e, a = rr(n, { elementType: "span" });
	return {
		disabled: e.disabled ?? !1,
		disabledFocusable: e.disabledFocusable ?? !1,
		iconPosition: r,
		iconOnly: !(!a?.children || e.children),
		components: {
			root: "button",
			icon: "span"
		},
		root: nr(Ul(i.as, i), {
			elementType: "button",
			defaultProps: {
				ref: t,
				type: e.as === "a" ? void 0 : "button"
			}
		}),
		icon: a
	};
}, Fh = {
	root: "fui-Button",
	icon: "fui-Button__icon"
};
`${U.strokeWidthThin}`;
var Ih = /*#__PURE__*/ Yn("r1f29ykk", null, {
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
}), Lh = /*#__PURE__*/ Yn("rywnvv2", null, [".rywnvv2{align-items:center;display:inline-flex;justify-content:center;font-size:20px;height:20px;width:20px;--fui-Button__icon--spacing:var(--spacingHorizontalSNudge);}"]), Rh = /*#__PURE__*/ P({
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
}), zh = /*#__PURE__*/ P({
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
}), Bh = /*#__PURE__*/ P({
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
}), Vh = /*#__PURE__*/ P({
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
] }), Hh = /*#__PURE__*/ P({
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
] }), Uh = (e) => {
	let t = Ih(), n = Lh(), r = Rh(), i = zh(), a = Bh(), o = Vh(), s = Hh(), { appearance: c, disabled: l, disabledFocusable: u, icon: d, iconOnly: f, iconPosition: p, shape: m, size: h } = e;
	return e.root.className = k(Fh.root, t, c && r[c], r[h], d && h === "small" && r.smallWithIcon, d && h === "large" && r.largeWithIcon, r[m], (l || u) && i.base, (l || u) && i.highContrast, c && (l || u) && i[c], c === "primary" && a.primary, a[h], a[m], f && o[h], e.root.className), e.icon && (e.icon.className = k(Fh.icon, n, !!e.root.children && s[p], s[h], e.icon.className)), e;
}, Wh = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = Nh(e, t);
	return Uh(n), si("useButtonStyles_unstable")(n), kh(n);
});
Wh.displayName = "Button";
//#endregion
//#region node_modules/@fluentui/react-field/lib/contexts/FieldContext.js
var Gh = M.createContext(void 0), Kh = Gh.Provider, qh = () => M.useContext(Gh), Jh = (e) => {
	let { generatedControlId: t, orientation: n, required: r, size: i, validationState: a } = e, o = e.label?.htmlFor, s = e.label?.id, c = e.validationMessage?.id, l = e.hint?.id;
	return { field: M.useMemo(() => ({
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
function Yh(e, t) {
	return Xh(qh(), e, t);
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
//#region node_modules/@fluentui/react-field/lib/components/Field/renderField.js
var Zh = (e, t) => {
	let { children: n } = e;
	return typeof n == "function" && (n = n(Xh(t.field) || {})), /*#__PURE__*/ I(Kh, {
		value: t?.field,
		children: /*#__PURE__*/ aa(e.root, { children: [
			e.label && /*#__PURE__*/ I(e.label, {}),
			n,
			e.validationMessage && /*#__PURE__*/ aa(e.validationMessage, { children: [e.validationMessageIcon && /*#__PURE__*/ I(e.validationMessageIcon, {}), e.validationMessage.children] }),
			e.hint && /*#__PURE__*/ I(e.hint, {})
		] })
	});
}, Qh = (e, t) => {
	let { weight: n = "regular", size: r = "medium", ...i } = e;
	return {
		weight: n,
		size: r,
		...$h(i, t)
	};
}, $h = (e, t) => {
	let { disabled: n = !1, required: r = !1, ...i } = e;
	return {
		disabled: n,
		required: rr(r === !0 ? "*" : r || void 0, {
			defaultProps: { "aria-hidden": "true" },
			elementType: "span"
		}),
		components: {
			root: "label",
			required: "span"
		},
		root: nr(Rr("label", {
			ref: t,
			...i
		}), { elementType: "label" })
	};
}, eg = (e) => /*#__PURE__*/ aa(e.root, { children: [e.root.children, e.required && /*#__PURE__*/ I(e.required, {})] }), tg = {
	root: "fui-Label",
	required: "fui-Label__required"
}, ng = /*#__PURE__*/ P({
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
}), rg = (e) => {
	let t = ng();
	return e.root.className = k(tg.root, t.root, e.disabled && t.disabled, t[e.size], e.weight === "semibold" && t.semibold, e.root.className), e.required && (e.required.className = k(tg.required, t.required, e.disabled && t.disabled, e.required.className)), e;
}, ig = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = Qh(e, t);
	return rg(n), si("useLabelStyles_unstable")(n), eg(n);
});
ig.displayName = "Label";
//#endregion
//#region node_modules/@fluentui/react-field/lib/components/Field/useFieldBase.js
var ag = (e, t) => {
	let { children: n, required: r = !1, validationState: i = e.validationMessage ? "error" : "none" } = e, a = ki("field-"), o = a + "__control", s = nr(Rr("div", {
		...e,
		ref: t
	}, ["children"]), { elementType: "div" }), c = rr(e.label, {
		defaultProps: {
			htmlFor: o,
			id: a + "__label",
			required: r
		},
		elementType: "label"
	}), l = rr(e.validationMessage, {
		defaultProps: {
			id: a + "__validationMessage",
			role: i === "error" || i === "warning" ? "alert" : void 0
		},
		elementType: "div"
	}), u = rr(e.hint, {
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
		validationMessageIcon: rr(e.validationMessageIcon, {
			renderByDefault: !1,
			elementType: "span"
		}),
		validationMessage: l,
		hint: u
	};
}, og = {
	error: /*#__PURE__*/ M.createElement(rd, null),
	warning: /*#__PURE__*/ M.createElement(zu, null),
	success: /*#__PURE__*/ M.createElement(Qu, null),
	none: void 0
}, sg = (e, t) => {
	let { orientation: n = "vertical", size: r = "medium", ...i } = e, a = ag(i, t), o = og[a.validationState];
	return {
		...a,
		components: {
			...a.components,
			label: ig
		},
		label: rr(e.label, {
			defaultProps: {
				size: r,
				...a.label
			},
			elementType: ig
		}),
		validationMessageIcon: rr(e.validationMessageIcon, {
			renderByDefault: !!o,
			defaultProps: { children: o },
			elementType: "span"
		}),
		orientation: n,
		size: r
	};
}, cg = {
	root: "fui-Field",
	label: "fui-Field__label",
	validationMessage: "fui-Field__validationMessage",
	validationMessageIcon: "fui-Field__validationMessageIcon",
	hint: "fui-Field__hint"
}, lg = /*#__PURE__*/ P({
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
] }), ug = /*#__PURE__*/ P({
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
] }), dg = /*#__PURE__*/ Yn("r5c4z9l", null, [".r5c4z9l{margin-top:var(--spacingVerticalXXS);color:var(--colorNeutralForeground3);font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase200);}"]), fg = /*#__PURE__*/ P({
	error: { sj55zd: "f1hcrxcs" },
	withIcon: { uwmqm3: ["frawy03", "fg4c52"] }
}, { d: [
	".f1hcrxcs{color:var(--colorPaletteRedForeground1);}",
	".frawy03{padding-left:calc(12px + var(--spacingHorizontalXS));}",
	".fg4c52{padding-right:calc(12px + var(--spacingHorizontalXS));}"
] }), pg = /*#__PURE__*/ Yn("ra7h1uk", "r1rh6bd7", [".ra7h1uk{display:inline-block;font-size:12px;margin-left:calc(-12px - var(--spacingHorizontalXS));margin-right:var(--spacingHorizontalXS);line-height:0;vertical-align:-1px;}", ".r1rh6bd7{display:inline-block;font-size:12px;margin-right:calc(-12px - var(--spacingHorizontalXS));margin-left:var(--spacingHorizontalXS);line-height:0;vertical-align:-1px;}"]), mg = /*#__PURE__*/ P({
	error: { sj55zd: "f1hcrxcs" },
	warning: { sj55zd: "f1k5f75o" },
	success: { sj55zd: "ffmvakt" }
}, { d: [
	".f1hcrxcs{color:var(--colorPaletteRedForeground1);}",
	".f1k5f75o{color:var(--colorPaletteDarkOrangeForeground1);}",
	".ffmvakt{color:var(--colorPaletteGreenForeground1);}"
] }), hg = (e) => {
	let { validationState: t, size: n } = e, r = e.orientation === "horizontal", i = lg();
	e.root.className = k(cg.root, i.base, r && i.horizontal, r && !e.label && i.horizontalNoLabel, e.root.className);
	let a = ug();
	e.label && (e.label.className = k(cg.label, a.base, r && a.horizontal, r && n === "small" && a.horizontalSmall, r && n === "large" && a.horizontalLarge, !r && a.vertical, !r && n === "large" && a.verticalLarge, e.label.className));
	let o = pg(), s = mg();
	e.validationMessageIcon && (e.validationMessageIcon.className = k(cg.validationMessageIcon, o, t !== "none" && s[t], e.validationMessageIcon.className));
	let c = dg(), l = fg();
	return e.validationMessage && (e.validationMessage.className = k(cg.validationMessage, c, t === "error" && l.error, !!e.validationMessageIcon && l.withIcon, e.validationMessage.className)), e.hint && (e.hint.className = k(cg.hint, c, e.hint.className)), e;
}, gg = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = sg(e, t);
	return hg(n), si("useFieldStyles_unstable")(n), Zh(n, Jh(n));
});
gg.displayName = "Field";
//#endregion
//#region node_modules/@fluentui/react-checkbox/lib/components/Checkbox/useCheckbox.js
var _g = (e, t) => {
	let { shape: n = "square", size: r = "medium", ...i } = e, a = vg(i, t), o = a.checked === "mixed", s;
	if (o ? s = n === "circular" ? /*#__PURE__*/ M.createElement(Cu, null) : r === "large" ? /*#__PURE__*/ M.createElement(G, null) : /*#__PURE__*/ M.createElement(nd, null) : a.checked && (s = r === "large" ? /*#__PURE__*/ M.createElement(Zu, null) : /*#__PURE__*/ M.createElement(Xu, null)), a.indicator) {
		var c;
		(c = a.indicator).children ?? (c.children = s);
	}
	return {
		shape: n,
		size: r,
		...a,
		components: {
			...a.components,
			label: ig
		},
		label: rr(e.label, {
			defaultProps: {
				...a.label,
				size: "medium"
			},
			elementType: ig
		})
	};
}, vg = (e, t) => {
	"use no memo";
	e = Yh(e, {
		supportsLabelFor: !0,
		supportsRequired: !0
	});
	let { disabled: n = !1, required: r, labelPosition: i = "after", onChange: a } = e, [o, s] = gi({
		defaultState: e.defaultChecked,
		state: e.checked,
		initialState: !1
	}), c = Lr({
		props: e,
		primarySlotTagName: "input",
		excludedPropNames: [
			"checked",
			"defaultChecked",
			"onChange"
		]
	}), l = o === "mixed", u = ki("checkbox-", c.primary.id), d = {
		checked: o,
		disabled: n,
		labelPosition: i,
		components: {
			root: "span",
			input: "input",
			indicator: "div",
			label: "label"
		},
		root: nr(e.root, {
			defaultProps: {
				ref: Ks(),
				...c.root
			},
			elementType: "span"
		}),
		input: nr(e.input, {
			defaultProps: {
				type: "checkbox",
				id: u,
				ref: t,
				checked: o === !0,
				...c.primary
			},
			elementType: "input"
		}),
		label: rr(e.label, {
			defaultProps: {
				htmlFor: u,
				disabled: n,
				required: r
			},
			elementType: "label"
		}),
		indicator: rr(e.indicator, {
			renderByDefault: !0,
			defaultProps: { "aria-hidden": !0 },
			elementType: "div"
		})
	};
	d.input.onChange = Hi(d.input.onChange, (e) => {
		let t = e.currentTarget.indeterminate ? "mixed" : e.currentTarget.checked;
		a?.(e, { checked: t }), s(t);
	});
	let f = Ai(d.input.ref);
	return d.input.ref = f, wi(() => {
		f.current && (f.current.indeterminate = l);
	}, [f, l]), d;
}, yg = (e) => /*#__PURE__*/ aa(e.root, { children: [
	/*#__PURE__*/ I(e.input, {}),
	e.labelPosition === "before" && e.label && /*#__PURE__*/ I(e.label, {}),
	e.indicator && /*#__PURE__*/ I(e.indicator, {}),
	e.labelPosition === "after" && e.label && /*#__PURE__*/ I(e.label, {})
] }), bg = {
	root: "fui-Checkbox",
	label: "fui-Checkbox__label",
	input: "fui-Checkbox__input",
	indicator: "fui-Checkbox__indicator"
}, xg = /*#__PURE__*/ Yn("r1nzur1d", "r128arqq", {
	r: [
		".r1nzur1d{position:relative;display:inline-flex;cursor:pointer;max-width:fit-content;vertical-align:middle;color:var(--colorNeutralForeground3);}",
		".r1nzur1d:focus{outline-style:none;}",
		".r1nzur1d:focus-visible{outline-style:none;}",
		".r1nzur1d[data-fui-focus-within]:focus-within{border-top-color:transparent;border-right-color:transparent;border-bottom-color:transparent;border-left-color:transparent;}",
		".r1nzur1d[data-fui-focus-within]:focus-within::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid var(--colorStrokeFocus2);border-radius:var(--borderRadiusMedium);top:calc(2px * -1);right:calc(2px * -1);bottom:calc(2px * -1);left:calc(2px * -1);}",
		".r128arqq{position:relative;display:inline-flex;cursor:pointer;max-width:fit-content;vertical-align:middle;color:var(--colorNeutralForeground3);}",
		".r128arqq:focus{outline-style:none;}",
		".r128arqq:focus-visible{outline-style:none;}",
		".r128arqq[data-fui-focus-within]:focus-within{border-top-color:transparent;border-left-color:transparent;border-bottom-color:transparent;border-right-color:transparent;}",
		".r128arqq[data-fui-focus-within]:focus-within::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid var(--colorStrokeFocus2);border-radius:var(--borderRadiusMedium);top:calc(2px * -1);left:calc(2px * -1);bottom:calc(2px * -1);right:calc(2px * -1);}"
	],
	s: ["@media (forced-colors: active){.r1nzur1d[data-fui-focus-within]:focus-within::after{border-top-color:Highlight;border-right-color:Highlight;border-bottom-color:Highlight;border-left-color:Highlight;}}", "@media (forced-colors: active){.r128arqq[data-fui-focus-within]:focus-within::after{border-top-color:Highlight;border-left-color:Highlight;border-bottom-color:Highlight;border-right-color:Highlight;}}"]
}), Sg = /*#__PURE__*/ P({
	unchecked: {
		Bi91k9c: "f3p8bqa",
		pv5h1i: "fium13f",
		lj723h: "f1r2dosr",
		Hnthvo: "f1729es6"
	},
	checked: {
		sj55zd: "f19n0e5",
		wkncrt: "f35ds98",
		zxk7z7: "f12mnkne",
		Hmsnfy: "fei9a8h",
		e6czan: "fix56y3",
		pv5h1i: "f1bcv2js",
		qbydtz: "f7dr4go",
		Hnthvo: "f1r5cpua"
	},
	mixed: {
		sj55zd: "f19n0e5",
		Hmsnfy: "f1l27tf0",
		zxk7z7: "fcilktj",
		pv5h1i: "f1lphd54",
		Bunfa6h: "f1obkvq7",
		Hnthvo: "f2gmbuh",
		B15ykmv: "f1oy4fa1"
	},
	disabled: {
		Bceei9c: "f158kwzp",
		sj55zd: "f1s2aq7o",
		Hmsnfy: "f1w7mfl5",
		zxk7z7: "fcoafq6",
		B7iucu3: "f1cyfu5x",
		Bptavk6: "f1lwde8o"
	}
}, {
	h: [
		".f3p8bqa:hover{color:var(--colorNeutralForeground2);}",
		".fium13f:hover{--fui-Checkbox__indicator--borderColor:var(--colorNeutralStrokeAccessibleHover);}",
		".fix56y3:hover{--fui-Checkbox__indicator--backgroundColor:var(--colorCompoundBrandBackgroundHover);}",
		".f1bcv2js:hover{--fui-Checkbox__indicator--borderColor:var(--colorCompoundBrandBackgroundHover);}",
		".f1lphd54:hover{--fui-Checkbox__indicator--borderColor:var(--colorCompoundBrandStrokeHover);}",
		".f1obkvq7:hover{--fui-Checkbox__indicator--color:var(--colorCompoundBrandForeground1Hover);}"
	],
	a: [
		".f1r2dosr:active{color:var(--colorNeutralForeground1);}",
		".f1729es6:active{--fui-Checkbox__indicator--borderColor:var(--colorNeutralStrokeAccessiblePressed);}",
		".f7dr4go:active{--fui-Checkbox__indicator--backgroundColor:var(--colorCompoundBrandBackgroundPressed);}",
		".f1r5cpua:active{--fui-Checkbox__indicator--borderColor:var(--colorCompoundBrandBackgroundPressed);}",
		".f2gmbuh:active{--fui-Checkbox__indicator--borderColor:var(--colorCompoundBrandStrokePressed);}",
		".f1oy4fa1:active{--fui-Checkbox__indicator--color:var(--colorCompoundBrandForeground1Pressed);}"
	],
	d: [
		".f19n0e5{color:var(--colorNeutralForeground1);}",
		".f35ds98{--fui-Checkbox__indicator--backgroundColor:var(--colorCompoundBrandBackground);}",
		".f12mnkne{--fui-Checkbox__indicator--color:var(--colorNeutralForegroundInverted);}",
		".fei9a8h{--fui-Checkbox__indicator--borderColor:var(--colorCompoundBrandBackground);}",
		".f1l27tf0{--fui-Checkbox__indicator--borderColor:var(--colorCompoundBrandStroke);}",
		".fcilktj{--fui-Checkbox__indicator--color:var(--colorCompoundBrandForeground1);}",
		".f158kwzp{cursor:default;}",
		".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
		".f1w7mfl5{--fui-Checkbox__indicator--borderColor:var(--colorNeutralStrokeDisabled);}",
		".fcoafq6{--fui-Checkbox__indicator--color:var(--colorNeutralForegroundDisabled);}"
	],
	m: [["@media (forced-colors: active){.f1cyfu5x{color:GrayText;}}", { m: "(forced-colors: active)" }], ["@media (forced-colors: active){.f1lwde8o{--fui-Checkbox__indicator--color:GrayText;}}", { m: "(forced-colors: active)" }]]
}), Cg = /*#__PURE__*/ Yn("ruo9svu", null, [".ruo9svu{box-sizing:border-box;cursor:inherit;height:100%;margin:0;opacity:0;position:absolute;top:0;width:calc(16px + 2 * var(--spacingHorizontalS));}"]), wg = /*#__PURE__*/ P({
	before: { j35jbq: ["f1e31b4d", "f1vgc2s3"] },
	after: { oyh7mz: ["f1vgc2s3", "f1e31b4d"] },
	large: { a9b677: "f1mq5jt6" }
}, { d: [
	".f1e31b4d{right:0;}",
	".f1vgc2s3{left:0;}",
	".f1mq5jt6{width:calc(20px + 2 * var(--spacingHorizontalS));}"
] }), Tg = /*#__PURE__*/ Yn("rl7ci6d", null, [".rl7ci6d{align-self:flex-start;box-sizing:border-box;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;color:var(--fui-Checkbox__indicator--color);background-color:var(--fui-Checkbox__indicator--backgroundColor);border-color:var(--fui-Checkbox__indicator--borderColor, var(--colorNeutralStrokeAccessible));border-style:solid;border-width:var(--strokeWidthThin);border-radius:var(--borderRadiusSmall);margin:var(--spacingVerticalS) var(--spacingHorizontalS);fill:currentColor;pointer-events:none;font-size:12px;height:16px;width:16px;}"]), Eg = /*#__PURE__*/ P({
	large: {
		Be2twd7: "f4ybsrx",
		Bqenvij: "fjamq6b",
		a9b677: "f64fuq3"
	},
	circular: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "f44lkw9"
	}
}, { d: [
	".f4ybsrx{font-size:16px;}",
	".fjamq6b{height:20px;}",
	".f64fuq3{width:20px;}",
	[".f44lkw9{border-radius:var(--borderRadiusCircular);}", { p: -1 }]
] }), Dg = /*#__PURE__*/ P({
	base: {
		qb2dma: "f7nlbp4",
		sj55zd: "f1ym3bx4",
		Bceei9c: "fpo1scq",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1f5q0n8"
	},
	before: { z189sj: ["f7x41pl", "fruq291"] },
	after: { uwmqm3: ["fruq291", "f7x41pl"] },
	medium: {
		B6of3ja: "fjzwpt6",
		jrapky: "fh6j2fo"
	},
	large: {
		B6of3ja: "f1xlvstr",
		jrapky: "f49ad5g"
	}
}, { d: [
	".f7nlbp4{align-self:center;}",
	".f1ym3bx4{color:inherit;}",
	".fpo1scq{cursor:inherit;}",
	[".f1f5q0n8{padding:var(--spacingVerticalS) var(--spacingHorizontalS);}", { p: -1 }],
	".f7x41pl{padding-right:var(--spacingHorizontalXS);}",
	".fruq291{padding-left:var(--spacingHorizontalXS);}",
	".fjzwpt6{margin-top:calc((16px - var(--lineHeightBase300)) / 2);}",
	".fh6j2fo{margin-bottom:calc((16px - var(--lineHeightBase300)) / 2);}",
	".f1xlvstr{margin-top:calc((20px - var(--lineHeightBase300)) / 2);}",
	".f49ad5g{margin-bottom:calc((20px - var(--lineHeightBase300)) / 2);}"
] }), Og = (e) => {
	let { checked: t, disabled: n, labelPosition: r, shape: i, size: a } = e, o = xg(), s = Sg();
	e.root.className = k(bg.root, o, n ? s.disabled : t === "mixed" ? s.mixed : t ? s.checked : s.unchecked, e.root.className);
	let c = Cg(), l = wg();
	e.input.className = k(bg.input, c, a === "large" && l.large, l[r], e.input.className);
	let u = Tg(), d = Eg();
	e.indicator && (e.indicator.className = k(bg.indicator, u, a === "large" && d.large, i === "circular" && d.circular, e.indicator.className));
	let f = Dg();
	return e.label && (e.label.className = k(bg.label, f.base, f[a], f[r], e.label.className)), e;
}, kg = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = _g(e, t);
	return Og(n), si("useCheckboxStyles_unstable")(n), yg(n);
});
kg.displayName = "Checkbox";
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/contexts/ComboboxContext.js
var Ag = Rl({
	activeOption: void 0,
	appearance: "outline",
	focusVisible: !1,
	open: !1,
	registerOption() {
		return () => void 0;
	},
	selectedOptions: [],
	selectOption() {},
	setActiveOption() {},
	setOpen() {},
	size: "medium"
});
Ag.Provider;
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/contexts/ListboxContext.js
var jg = {
	activeOption: void 0,
	focusVisible: !1,
	multiselect: !1,
	getOptionById() {},
	getOptionsMatchingValue() {
		return [];
	},
	registerOption() {
		return () => void 0;
	},
	selectedOptions: [],
	onOptionClick() {},
	onActiveDescendantChange() {},
	selectOption() {},
	setActiveOption() {}
}, Mg = Rl(void 0), Ng = (e) => zl(Mg, (t = jg) => e(t));
Mg.Provider;
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/contexts/useComboboxContextValues.js
function Pg(e) {
	let { appearance: t, open: n, getOptionById: r, getOptionsMatchingValue: i, registerOption: a, selectedOptions: o, selectOption: s, setOpen: c, size: l, activeDescendantController: u, onOptionClick: d, onActiveDescendantChange: f } = e, p = {
		activeOption: void 0,
		appearance: t,
		focusVisible: !1,
		open: n,
		registerOption: a,
		selectedOptions: o,
		selectOption: s,
		setActiveOption: () => null,
		setOpen: c,
		size: l
	}, m = {
		activeOption: void 0,
		focusVisible: !1,
		getOptionById: r,
		getOptionsMatchingValue: i,
		registerOption: a,
		selectedOptions: o,
		selectOption: s,
		setActiveOption: () => null,
		onOptionClick: d,
		onActiveDescendantChange: f
	};
	return {
		combobox: p,
		activeDescendant: M.useMemo(() => ({ controller: u }), [u]),
		listbox: m
	};
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/contexts/useListboxContextValues.js
function Fg(e) {
	let t = Bl(Mg), { getOptionById: n, getOptionsMatchingValue: r, multiselect: i, registerOption: a, selectedOptions: o, selectOption: s, activeDescendantController: c } = e, l = Ng((e) => e.registerOption), u = Ng((e) => e.onOptionClick), d = Ng((e) => e.onActiveDescendantChange);
	return {
		listbox: {
			activeOption: void 0,
			focusVisible: !1,
			getOptionById: n,
			getOptionsMatchingValue: r,
			multiselect: i,
			registerOption: t ? l : a,
			selectedOptions: o,
			selectOption: s,
			setActiveOption: () => void 0,
			onOptionClick: u,
			onActiveDescendantChange: d
		},
		activeDescendant: M.useMemo(() => ({ controller: c }), [c])
	};
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/dropdownKeyActions.js
function Ig(e, t = {}) {
	let { open: n = !0, multiselect: r = !1 } = t, i = e.key, { altKey: a, ctrlKey: o, key: s, metaKey: c } = e;
	return s.length === 1 && i !== " " && !a && !o && !c ? "Type" : n ? i === "ArrowUp" && a || i === "Enter" || !r && i === " " ? "CloseSelect" : r && i === " " ? "Select" : i === "Escape" ? "Close" : i === "ArrowDown" ? "Next" : i === "ArrowUp" ? "Previous" : i === "Home" ? "First" : i === "End" ? "Last" : i === "PageUp" ? "PageUp" : i === "PageDown" ? "PageDown" : i === "Tab" ? "Tab" : "None" : i === "ArrowDown" || i === "ArrowUp" || i === "Enter" || i === " " ? "Open" : "None";
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/useOptionCollection.js
var Lg = () => {
	let e = M.useRef(/* @__PURE__ */ new Map()), t = M.useMemo(() => ({
		getCount: () => e.current.size,
		getOptionAtIndex: () => void 0,
		getIndexOfId: () => -1,
		getOptionById: (t) => e.current.get(t),
		getOptionsMatchingText: (t) => Array.from(e.current.values()).filter(({ text: e }) => t(e)),
		getOptionsMatchingValue: (t) => {
			let n = [];
			for (let r of e.current.values()) t(r.value) && n.push(r);
			return n;
		}
	}), []), n = M.useCallback((t) => (e.current.set(t.id, t), () => e.current.delete(t.id)), []);
	return {
		...t,
		options: Array.from(e.current.values()),
		registerOption: n
	};
}, Rg = (e) => {
	let { defaultSelectedOptions: t, multiselect: n, onOptionSelect: r } = e, [i, a] = gi({
		state: e.selectedOptions,
		defaultState: t,
		initialState: []
	});
	return {
		clearSelection: (e) => {
			a([]), r?.(e, {
				optionValue: void 0,
				optionText: void 0,
				selectedOptions: []
			});
		},
		selectOption: M.useCallback((e, t) => {
			if (t.disabled) return;
			let o = [t.value];
			if (n) {
				let e = i.findIndex((e) => e === t.value);
				o = e > -1 ? [...i.slice(0, e), ...i.slice(e + 1)] : [...i, t.value];
			}
			a(o), r?.(e, {
				optionValue: t.value,
				optionText: t.text,
				selectedOptions: o
			});
		}, [
			r,
			n,
			i,
			a
		]),
		selectedOptions: i
	};
};
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/isComboboxOptionElement.js
function zg(e) {
	return e.role === "option" || e.role === "menuitemcheckbox";
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/components/Listbox/useListbox.js
var Bg = {
	activeOption: void 0,
	focusVisible: !1,
	setActiveOption: () => null
}, Vg = (e, t) => {
	let { multiselect: n, disableAutoFocus: r = !1 } = e, i = Lg(), { listboxRef: a, activeParentRef: o, controller: s } = au({ matchOption: zg }), c = Bl(Mg), l = Ng((e) => e.onActiveDescendantChange), u = Ng((e) => e.getOptionById), d = Ng((e) => e.getOptionsMatchingValue), f = c ? u : i.getOptionById, p = c ? d : i.getOptionsMatchingValue, m = M.useMemo(() => {
		let e = null, t = (e) => {
			l?.(e);
		};
		return (n) => {
			n ? (e = n, e.addEventListener("activedescendantchange", t)) : e?.removeEventListener("activedescendantchange", t);
		};
	}, [l]), [h, g] = M.useState(!1);
	Js(g);
	let _ = Jl(), v = Yl(), y = v ? _.controller : s, { clearSelection: b, selectedOptions: x, selectOption: S } = Rg(e), C = (e) => {
		let t = Ig(e, { open: !0 }), n = y.active(), r = n ? f(n) : null;
		switch (t) {
			case "First":
			case "Last":
			case "Next":
			case "Previous":
			case "PageDown":
			case "PageUp":
			case "CloseSelect":
			case "Select": e.preventDefault();
		}
		switch (t) {
			case "Next":
				r ? y.next() : y.first();
				break;
			case "Previous":
				r ? y.prev() : y.first();
				break;
			case "PageUp":
			case "First":
				y.first();
				break;
			case "PageDown":
			case "Last":
				y.last();
				break;
			case "Select":
			case "CloseSelect": r && S(e, r);
		}
	}, w = Ng((e) => e.selectedOptions), T = Ng((e) => e.selectOption), E = c ? {
		selectedOptions: w,
		selectOption: T,
		...Bg
	} : {
		selectedOptions: x,
		selectOption: S,
		...Bg
	};
	M.useEffect(() => {
		if (!v) {
			if (y.hideFocusVisibleAttributes(), !r) {
				if (!n && E.selectedOptions.length > 0) {
					let e = p((e) => e === E.selectedOptions[0]).pop();
					e?.id && y.focus(e.id);
				} else y.first();
			}
			return () => {
				y.blur();
			};
		}
	}, []);
	let D = M.useCallback(() => {
		v || (y.showFocusVisibleAttributes(), h && y.scrollActiveIntoView());
	}, [
		y,
		v,
		h
	]), ee = M.useCallback(() => {
		v || y.hideFocusVisibleAttributes();
	}, [y, v]), O = {
		components: { root: "div" },
		root: nr(Rr("div", {
			ref: Ai(t, o, a, m),
			role: n ? "menu" : "listbox",
			tabIndex: 0,
			...e
		}), { elementType: "div" }),
		standalone: !c,
		multiselect: n,
		clearSelection: b,
		activeDescendantController: y,
		onActiveDescendantChange: l,
		...i,
		...E
	};
	return O.root.onKeyDown = F(Hi(O.root.onKeyDown, C)), O.root.onFocus = F(Hi(O.root.onFocus, D)), O.root.onBlur = F(Hi(O.root.onBlur, ee)), O;
}, Hg = (e, t) => /*#__PURE__*/ I(ql, {
	value: t.activeDescendant,
	children: /*#__PURE__*/ I(Mg.Provider, {
		value: t.listbox,
		children: /*#__PURE__*/ I(e.root, {})
	})
}), Ug = { root: "fui-Listbox" }, Wg = /*#__PURE__*/ P({ root: {
	De3pzq: "fxugw4r",
	B7ck84d: "f1ewtqcl",
	mc9l5x: "f22iagw",
	Beiy3e4: "f1vx9l62",
	Bf4jedk: "f3hsy1e",
	Bmxbyg5: "f5zp4f",
	Bw0xxkn: 0,
	oeaueh: 0,
	Bpd4iqm: 0,
	Befb4lg: "f1iepc6i",
	Byoj8tv: 0,
	uwmqm3: 0,
	z189sj: 0,
	z8tnut: 0,
	B0ocmuz: "f1t35pdg",
	Belr9w4: "fiut8dr"
} }, { d: [
	".fxugw4r{background-color:var(--colorNeutralBackground1);}",
	".f1ewtqcl{box-sizing:border-box;}",
	".f22iagw{display:flex;}",
	".f1vx9l62{flex-direction:column;}",
	".f3hsy1e{min-width:160px;}",
	".f5zp4f{overflow-y:auto;}",
	[".f1iepc6i{outline:1px solid var(--colorTransparentStroke);}", { p: -1 }],
	[".f1t35pdg{padding:var(--spacingHorizontalXS);}", { p: -1 }],
	".fiut8dr{row-gap:var(--spacingHorizontalXXS);}"
] }), Gg = (e) => {
	let t = Wg();
	return e.root.className = k(Ug.root, t.root, e.root.className), e;
}, Kg = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = Vg(e, t), r = Fg(n);
	return Gg(n), si("useListboxStyles_unstable")(n), Hg(n, r);
});
Kg.displayName = "Listbox";
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/components/Option/useOption.js
function qg(e, t) {
	if (e !== void 0) return e;
	let n = "", r = !1;
	return M.Children.forEach(t, (e) => {
		typeof e == "string" ? n += e : r = !0;
	}), r && console.warn("Provide a `text` prop to Option components when they contain non-string children."), n;
}
var Jg = (e, t) => {
	let n = Yg(e, t), r = /*#__PURE__*/ M.createElement(wu, null);
	if (n.multiselect && (r = n.selected ? /*#__PURE__*/ M.createElement(Xu, null) : ""), n.checkIcon) {
		var i;
		(i = n.checkIcon).children ?? (i.children = r);
	}
	return n;
}, Yg = (e, t) => {
	let { children: n, disabled: r, text: i, value: a } = e, o = M.useRef(null), s = qg(i, n), c = a ?? s, l = ki("fluent-option", e.id), u = M.useMemo(() => ({
		id: l,
		disabled: r,
		text: s,
		value: c
	}), [
		l,
		r,
		s,
		c
	]), { controller: d } = Jl(), f = Ng((e) => e.multiselect), p = Ng((e) => e.registerOption), m = Ng((e) => {
		let t = e.selectedOptions;
		return c !== void 0 && t.find((e) => e === c) !== void 0;
	}), h = Ng((e) => e.selectOption), g = Ng((e) => e.onOptionClick), _ = (t) => {
		var n;
		r ? t.preventDefault() : (d.focus(l), h(t, u), g(t), (n = e.onClick) == null || n.call(e, t));
	};
	M.useEffect(() => {
		if (l && o.current) return p(u, o.current);
	}, [
		l,
		u,
		p
	]);
	let v = f ? {
		role: "menuitemcheckbox",
		"aria-checked": m
	} : {
		role: "option",
		"aria-selected": m
	};
	return {
		components: {
			root: "div",
			checkIcon: "span"
		},
		root: nr(Rr("div", {
			ref: Ai(t, o),
			"aria-disabled": r ? "true" : void 0,
			id: l,
			...v,
			...e,
			onClick: _
		}), { elementType: "div" }),
		checkIcon: rr(e.checkIcon, {
			renderByDefault: !0,
			defaultProps: { "aria-hidden": "true" },
			elementType: "span"
		}),
		disabled: r,
		multiselect: f,
		selected: m,
		focusVisible: !1,
		active: !1
	};
}, Xg = (e) => /*#__PURE__*/ aa(e.root, { children: [e.checkIcon && /*#__PURE__*/ I(e.checkIcon, {}), e.root.children] }), Zg = {
	root: "fui-Option",
	checkIcon: "fui-Option__checkIcon"
}, Qg = /*#__PURE__*/ P({
	root: {
		Bt984gj: "f122n59",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "ft85np5",
		sj55zd: "f19n0e5",
		i8kkvl: "f1ufnopg",
		Bceei9c: "f1k6fduh",
		mc9l5x: "f22iagw",
		Bahqtrf: "fk6fouc",
		Be2twd7: "fkhj508",
		Bg96gwp: "f1i3iumi",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "fm5eomj",
		qhf8xq: "f10pi13n"
	},
	interactive: {
		Jwef8y: "f1knas48",
		Bi91k9c: "feu1g3u",
		zqbkvg: "fo79ri9",
		h82x05: ["f1osiabc", "f1e8le25"],
		cqj998: "f1yusjty",
		j3hlsh: ["f1e8le25", "f1osiabc"],
		ecr2s2: "fb40n2d",
		lj723h: "f1g4hkjv",
		Btxx2vb: "f1lnr2zp",
		sltcwy: ["f1ogfk9z", "f1g7j8ec"],
		dnwvvm: "fiuf46r",
		Blyvkvs: ["f1g7j8ec", "f1ogfk9z"]
	},
	active: {
		Bowz1zl: "f11vrvdw",
		oxogb1: "f17hxjb7",
		Ix2sn8: "f1dha69c",
		q7v32p: "f1lm7500",
		B7cbj04: 0,
		Bewtojm: 0,
		b50fsz: 0,
		B1wzb3v: 0,
		Bqwk70n: 0,
		B37u8z8: 0,
		avt0cx: 0,
		f0sref: 0,
		B9fkznv: 0,
		Be3o27t: 0,
		Bertapg: 0,
		B53xpsf: 0,
		Bsv72rj: 0,
		B39dzdd: 0,
		Btq9bd3: 0,
		Bqfxd14: 0,
		atup0s: "fo7xqb",
		Fffuxt: 0,
		Bttcd12: 0,
		Beitzug: 0,
		Bqougee: 0,
		B86i8pi: "f1kurthe",
		Bhijsxg: "fwq15dy",
		kktds4: "f1pb3wry",
		Bmau3bo: ["ftjv2f4", "f1flhb1f"],
		npektv: ["f1flhb1f", "ftjv2f4"]
	},
	disabled: {
		sj55zd: "f1s2aq7o",
		Bceei9c: "f158kwzp",
		B7iucu3: "f1cyfu5x"
	},
	selected: {},
	checkIcon: {
		Bnnss6s: "fi64zpg",
		Be2twd7: "fod5ikn",
		Frg6f3: ["f18b9hdq", "fn6qj8t"],
		t21cq0: ["f1xk557c", "f1h9en5y"],
		Bcdw1i0: "fd7fpy0",
		Bo70h7d: "fvc9v3g"
	},
	selectedCheck: { Bcdw1i0: "f1022m68" },
	multiselectCheck: {
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
		irswps: "f1l3cf7o",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "fq9zq91",
		B7ck84d: "f1ewtqcl",
		mc9l5x: "f22iagw",
		Bt984gj: "f122n59",
		Brf1p80: "f4d9j23",
		Bkfmm31: "f1w9h62z",
		Be2twd7: "f1ugzwwg",
		Bqenvij: "fd461yt",
		a9b677: "fjw5fx7",
		Bcdw1i0: "f1022m68"
	},
	selectedMultiselectCheck: {
		De3pzq: "ftywsgz",
		sj55zd: "fqpbvvt",
		g2u3we: "f3xi7mh",
		h3c5rm: ["ftovhe4", "f1wczvin"],
		B9xav0g: "f68vbr6",
		zhjwy3: ["f1wczvin", "ftovhe4"]
	},
	checkDisabled: {
		sj55zd: "f1s2aq7o",
		B7iucu3: "f1cyfu5x"
	},
	multiselectCheckDisabled: {
		g2u3we: "f1r1t4y1",
		h3c5rm: ["fmj8ijw", "figx54m"],
		B9xav0g: "f360ss8",
		zhjwy3: ["figx54m", "fmj8ijw"]
	}
}, {
	d: [
		".f122n59{align-items:center;}",
		[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		".f19n0e5{color:var(--colorNeutralForeground1);}",
		".f1ufnopg{column-gap:var(--spacingHorizontalXS);}",
		".f1k6fduh{cursor:pointer;}",
		".f22iagw{display:flex;}",
		".fk6fouc{font-family:var(--fontFamilyBase);}",
		".fkhj508{font-size:var(--fontSizeBase300);}",
		".f1i3iumi{line-height:var(--lineHeightBase300);}",
		[".fm5eomj{padding:var(--spacingVerticalSNudge) var(--spacingHorizontalS);}", { p: -1 }],
		".f10pi13n{position:relative;}",
		".f11vrvdw[data-activedescendant-focusvisible]::after{content:\"\";}",
		".f17hxjb7[data-activedescendant-focusvisible]::after{position:absolute;}",
		".f1dha69c[data-activedescendant-focusvisible]::after{pointer-events:none;}",
		".f1lm7500[data-activedescendant-focusvisible]::after{z-index:1;}",
		[".fo7xqb[data-activedescendant-focusvisible]::after{border:2px solid var(--colorStrokeFocus2);}", { p: -2 }],
		[".f1kurthe[data-activedescendant-focusvisible]::after{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		".fwq15dy[data-activedescendant-focusvisible]::after{top:-2px;}",
		".f1pb3wry[data-activedescendant-focusvisible]::after{bottom:-2px;}",
		".ftjv2f4[data-activedescendant-focusvisible]::after{left:-2px;}",
		".f1flhb1f[data-activedescendant-focusvisible]::after{right:-2px;}",
		".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
		".f158kwzp{cursor:default;}",
		".fi64zpg{flex-shrink:0;}",
		".fod5ikn{font-size:var(--fontSizeBase400);}",
		".f18b9hdq{margin-left:calc(var(--spacingHorizontalXXS) * -1);}",
		".fn6qj8t{margin-right:calc(var(--spacingHorizontalXXS) * -1);}",
		".f1xk557c{margin-right:var(--spacingHorizontalXXS);}",
		".f1h9en5y{margin-left:var(--spacingHorizontalXXS);}",
		".fd7fpy0{visibility:hidden;}",
		".fvc9v3g svg{display:block;}",
		".f1022m68{visibility:visible;}",
		[".f1l3cf7o{border:var(--strokeWidthThin) solid var(--colorNeutralStrokeAccessible);}", { p: -2 }],
		[".fq9zq91{border-radius:var(--borderRadiusSmall);}", { p: -1 }],
		".f1ewtqcl{box-sizing:border-box;}",
		".f4d9j23{justify-content:center;}",
		".f1w9h62z{fill:currentColor;}",
		".f1ugzwwg{font-size:12px;}",
		".fd461yt{height:16px;}",
		".fjw5fx7{width:16px;}",
		".ftywsgz{background-color:var(--colorCompoundBrandBackground);}",
		".fqpbvvt{color:var(--colorNeutralForegroundInverted);}",
		".f3xi7mh{border-top-color:var(--colorCompoundBrandBackground);}",
		".ftovhe4{border-right-color:var(--colorCompoundBrandBackground);}",
		".f1wczvin{border-left-color:var(--colorCompoundBrandBackground);}",
		".f68vbr6{border-bottom-color:var(--colorCompoundBrandBackground);}",
		".f1r1t4y1{border-top-color:var(--colorNeutralForegroundDisabled);}",
		".fmj8ijw{border-right-color:var(--colorNeutralForegroundDisabled);}",
		".figx54m{border-left-color:var(--colorNeutralForegroundDisabled);}",
		".f360ss8{border-bottom-color:var(--colorNeutralForegroundDisabled);}"
	],
	h: [
		".f1knas48:hover{background-color:var(--colorNeutralBackground1Hover);}",
		".feu1g3u:hover{color:var(--colorNeutralForeground1Hover);}",
		".fo79ri9:hover .fui-Option__checkIcon{border-top-color:var(--colorNeutralForeground1Hover);}",
		".f1osiabc:hover .fui-Option__checkIcon{border-right-color:var(--colorNeutralForeground1Hover);}",
		".f1e8le25:hover .fui-Option__checkIcon{border-left-color:var(--colorNeutralForeground1Hover);}",
		".f1yusjty:hover .fui-Option__checkIcon{border-bottom-color:var(--colorNeutralForeground1Hover);}"
	],
	a: [
		".fb40n2d:active{background-color:var(--colorNeutralBackground1Pressed);}",
		".f1g4hkjv:active{color:var(--colorNeutralForeground1Pressed);}",
		".f1lnr2zp:active .fui-Option__checkIcon{border-top-color:var(--colorNeutralForeground1Hover);}",
		".f1ogfk9z:active .fui-Option__checkIcon{border-right-color:var(--colorNeutralForeground1Hover);}",
		".f1g7j8ec:active .fui-Option__checkIcon{border-left-color:var(--colorNeutralForeground1Hover);}",
		".fiuf46r:active .fui-Option__checkIcon{border-bottom-color:var(--colorNeutralForeground1Hover);}"
	],
	m: [["@media (forced-colors: active){.f1cyfu5x{color:GrayText;}}", { m: "(forced-colors: active)" }]]
}), $g = (e) => {
	let { disabled: t, multiselect: n, selected: r } = e, i = Qg();
	return e.root.className = k(Zg.root, i.root, !t && i.interactive, i.active, t && i.disabled, r && i.selected, e.root.className), e.checkIcon && (e.checkIcon.className = k(Zg.checkIcon, i.checkIcon, n && i.multiselectCheck, r && i.selectedCheck, r && n && i.selectedMultiselectCheck, t && i.checkDisabled, t && n && i.multiselectCheckDisabled, e.checkIcon.className)), e;
}, e_ = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = Jg(e, t);
	return $g(n), si("useOptionStyles_unstable")(n), Xg(n);
});
e_.displayName = "Option";
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/useComboboxBaseState.js
var t_ = (e) => {
	let { appearance: t = "outline", disableAutoFocus: n, children: r, clearable: i = !1, editable: a = !1, inlinePopup: o = !1, mountNode: s = void 0, multiselect: c, onOpenChange: l, size: u = "medium", activeDescendantController: d, freeform: f = !1, disabled: p = !1, onActiveOptionChange: m = null } = e, h = Lg(), { getOptionsMatchingValue: g } = h, { getOptionById: _ } = h, v = M.useCallback(() => {
		let e = d.active();
		return e ? _(e) : void 0;
	}, [d, _]), y = v(), b = M.useCallback((e) => {
		let t;
		typeof e == "function" && (t = e(v())), t ? d.focus(t.id) : d.blur();
	}, [d, v]), [x, S] = M.useState(!1), [C, w] = M.useState(!1), T = M.useRef(!1), E = Ti(), [D, ee] = gi({
		state: e.value,
		initialState: void 0
	}), { selectedOptions: O, selectOption: te, clearSelection: ne } = Rg(e), re = M.useCallback((e, t) => {
		gh.unstable_batchedUpdates(() => {
			ee(void 0), te(e, t);
		});
	}, [ee, te]), k = M.useMemo(() => {
		if (D !== void 0) return D;
		if (E && e.defaultValue !== void 0) return e.defaultValue;
		let t = g((e) => O.includes(e)).map((e) => e.text);
		return c ? a ? "" : t.join(", ") : t[0];
	}, [
		D,
		a,
		g,
		c,
		O
	]), [ie, ae] = gi({
		state: e.open,
		defaultState: e.defaultOpen,
		initialState: !1
	}), oe = M.useCallback((e, t) => {
		p || (l?.(e, { open: t }), gh.unstable_batchedUpdates(() => {
			!t && !f && ee(void 0), ae(t);
		}));
	}, [
		l,
		ae,
		ee,
		f,
		p
	]);
	M.useEffect(() => {
		if (ie) {
			if (!c && O.length > 0) {
				let e = g((e) => e === O[0]).pop();
				e?.id && d.focus(e.id);
			}
		} else d.blur();
	}, [ie, d]), M.useEffect(() => {
		ie && !n && !d.active() && d.first();
	}, [
		ie,
		r,
		n,
		d,
		_
	]);
	let se = F((e) => {
		let t = e.detail.previousId ? h.getOptionById(e.detail.previousId) : null, n = h.getOptionById(e.detail.id);
		m?.(e, {
			event: e,
			type: "change",
			previousOption: t,
			nextOption: n
		});
	});
	return {
		...h,
		freeform: f,
		disabled: p,
		selectOption: re,
		clearSelection: ne,
		selectedOptions: O,
		activeOption: y,
		appearance: t,
		clearable: i,
		focusVisible: x,
		ignoreNextBlur: T,
		inlinePopup: o,
		mountNode: s,
		open: ie,
		hasFocus: C,
		setActiveOption: b,
		setFocusVisible: S,
		setHasFocus: w,
		setOpen: oe,
		setValue: ee,
		size: u,
		value: k,
		multiselect: c,
		onOptionClick: F((e) => {
			c || oe(e, !1);
		}),
		onActiveDescendantChange: se
	};
};
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/useComboboxPositioning.js
function n_(e) {
	let { positioning: t } = e, { targetRef: n, containerRef: r } = Um({
		position: "below",
		align: "start",
		offset: {
			crossAxis: 0,
			mainAxis: 2
		},
		fallbackPositions: [
			"above",
			"after",
			"after-top",
			"before",
			"before-top"
		],
		matchTargetSize: "width",
		autoSize: !0,
		...xm(t)
	});
	return [r, n];
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/useListboxSlot.js
function r_(e, t, n) {
	let { state: { multiselect: r }, triggerRef: i, defaultProps: a } = n, o = ki("fluent-listbox", or(e) ? e.id : void 0), s = rr(e, {
		renderByDefault: !0,
		elementType: Kg,
		defaultProps: {
			id: o,
			multiselect: r,
			tabIndex: void 0,
			...a
		}
	}), c = Yh({ id: o }, { supportsLabelFor: !0 });
	s && !s["aria-label"] && !s["aria-labelledby"] && c["aria-labelledby"] && (s["aria-labelledby"] = c["aria-labelledby"]);
	let l = F(Hi((e) => {
		e.preventDefault();
	}, s?.onMouseDown)), u = F(Hi((e) => {
		var t;
		e.preventDefault(), (t = i.current) == null || t.focus();
	}, s?.onClick)), d = Ai(s?.ref, t);
	return s && (s.ref = d, s.onMouseDown = l, s.onClick = u), s;
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/useTriggerSlot.js
function i_(e, t, n) {
	let { state: { open: r, setOpen: i, setHasFocus: a }, defaultProps: o, elementType: s, activeDescendantController: c } = n, l = nr(e, {
		defaultProps: {
			type: "text",
			"aria-expanded": r,
			role: "combobox",
			...typeof o == "object" && o
		},
		elementType: s
	});
	return l.ref = Ai(M.useRef(null), l.ref, t), l.onBlur = Hi((e) => {
		i(e, !1), a(!1);
	}, l.onBlur), l.onFocus = Hi((e) => {
		e.target === e.currentTarget && a(!0);
	}, l.onFocus), l.onClick = Hi((e) => {
		i(e, !r);
	}, l.onClick), l.onKeyDown = Hi(a_({
		activeDescendantController: c,
		...n.state
	}), l.onKeyDown), l;
}
function a_(e) {
	let { activeDescendantController: t, getOptionById: n, setOpen: r, selectOption: i, multiselect: a, open: o } = e, s = M.useCallback(() => {
		let e = t.active();
		return e ? n(e) : void 0;
	}, [t, n]), c = () => {
		t.first();
	}, l = () => {
		t.last();
	}, u = (e) => {
		e ? t.next() : t.first();
	}, d = (e) => {
		e ? t.prev() : t.first();
	}, f = () => {
		for (let e = 0; e < 10; e++) t.prev();
	}, p = () => {
		for (let e = 0; e < 10; e++) t.next();
	}, m = tc();
	return F((e) => {
		let t = Ig(e, {
			open: o,
			multiselect: a
		}), n = s();
		switch (t) {
			case "First":
			case "Last":
			case "Next":
			case "Previous":
			case "PageDown":
			case "PageUp":
			case "Open":
			case "Close":
			case "CloseSelect":
			case "Select": e.preventDefault();
		}
		switch (m(!0), t) {
			case "First":
				c();
				break;
			case "Last":
				l();
				break;
			case "Next":
				u(n);
				break;
			case "Previous":
				d(n);
				break;
			case "PageDown":
				p();
				break;
			case "PageUp":
				f();
				break;
			case "Open":
				r(e, !0);
				break;
			case "Close":
				e.stopPropagation(), r(e, !1);
				break;
			case "CloseSelect": !a && !(n != null && n.disabled) && r(e, !1);
			case "Select":
				n && i(e, n);
				break;
			case "Tab": !a && n && i(e, n);
		}
	});
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/hooks/useTabsterEscapeIgnore.js
function o_(e, t) {
	return Ys(gs({ focusable: { ignoreKeydown: { Escape: t } } }), typeof e == "object" ? e : {});
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/components/Dropdown/useButtonTriggerSlot.js
function s_(e, t, n) {
	let { state: { open: r, setOpen: i, getOptionById: a }, defaultProps: o, activeDescendantController: s } = n, c = M.useRef(""), [l, u] = zi(), d = (e, t = { startFromNext: !1 }) => {
		let { startFromNext: n } = t, r = s.active();
		return s.find((t) => {
			let n = a(t);
			return !!n && e(n.text);
		}, { startFrom: n ? s.next({ passive: !0 }) : r }) || s.find((t) => {
			let n = a(t);
			return !!n && e(n.text);
		});
	}, f = () => {
		d((e) => e.toLocaleLowerCase().indexOf(c.current) === 0, { startFromNext: c.current.length === 1 }) || c_(c.current) && d((e) => e.toLocaleLowerCase().indexOf(c.current[0]) === 0, { startFromNext: !0 }) || s.blur();
	}, p = (e) => {
		u(), Ig(e) === "Type" && (c.current += e.key.toLowerCase(), l(() => {
			c.current = "";
		}, 500), r && f(), !r && i(e, !0));
	}, m = i_(e, t, {
		state: n.state,
		defaultProps: o,
		elementType: "button",
		activeDescendantController: s
	});
	return m.onKeyDown = Hi(p, m.onKeyDown), m;
}
function c_(e) {
	for (let t = 1; t < e.length; t++) if (e[t] !== e[t - 1]) return !1;
	return !0;
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/components/Dropdown/useDropdown.js
var l_ = (e, t) => {
	e = Yh(e, { supportsLabelFor: !0 });
	let { listboxRef: n, activeParentRef: r, controller: i } = au({ matchOption: zg }), a = t_({
		...e,
		activeDescendantController: i,
		freeform: !1
	}), { appearance: o, size: s, freeform: c, ...l } = a, { clearable: u, clearSelection: d, disabled: f, hasFocus: p, multiselect: m, open: h, selectedOptions: g, setOpen: _ } = l, { primary: v, root: y } = Lr({
		props: e,
		primarySlotTagName: "button",
		excludedPropNames: ["children"]
	}), [b, x] = n_(e), S = M.useRef(null), C = r_(e.listbox, Ai(b, n), {
		state: a,
		triggerRef: S,
		defaultProps: { children: e.children }
	}), { targetDocument: w } = ei();
	Mi({
		element: w,
		callback: (e) => _(e, !1),
		refs: [
			S,
			b,
			x
		],
		disabled: !h
	});
	let T = s_(e.button ?? {}, Ai(S, r, t), {
		state: a,
		defaultProps: {
			type: "button",
			tabIndex: v.disabled ? void 0 : 0,
			children: l.value || e.placeholder,
			"aria-controls": h ? C?.id : void 0,
			...v
		},
		activeDescendantController: i
	}), E = nr(e.root, {
		defaultProps: {
			"aria-owns": !e.inlinePopup && h ? C?.id : void 0,
			children: e.children,
			...y
		},
		elementType: "div"
	});
	E.ref = Ai(E.ref, x);
	let D = g.length > 0 && !f && u && !m, ee = {
		components: {
			root: "div",
			button: "button",
			clearButton: "button",
			expandIcon: "span",
			listbox: Kg
		},
		root: E,
		button: T,
		listbox: h || p ? C : void 0,
		clearButton: rr(e.clearButton, {
			defaultProps: {
				"aria-label": "Clear selection",
				tabIndex: D ? 0 : void 0,
				type: "button"
			},
			elementType: "button",
			renderByDefault: !0
		}),
		expandIcon: rr(e.expandIcon, {
			renderByDefault: !0,
			elementType: "span"
		}),
		placeholderVisible: !l.value && !!e.placeholder,
		showClearButton: D,
		activeDescendantController: i,
		...l
	}, O = F(Hi(ee.clearButton?.onClick, (e) => {
		var t;
		d(e), (t = S.current) == null || t.focus();
	}));
	return ee.clearButton && (ee.clearButton.onClick = O), m && (ee.clearButton = void 0), ee;
}, u_ = (e, t) => {
	let n = qh(), { appearance: r = "outline", size: i = n?.size ?? "medium", ...a } = e, o = l_(a, t);
	if (o.clearButton) {
		var s;
		(s = o.clearButton).children ?? (s.children = /*#__PURE__*/ M.createElement(Mu, null));
	}
	if (o.expandIcon) {
		var c;
		(c = o.expandIcon).children ?? (c.children = /*#__PURE__*/ M.createElement(Eu, null));
	}
	return {
		...o,
		appearance: r,
		size: i,
		button: {
			...o_(o.button, o.open),
			...o.button
		}
	};
}, d_ = (e, t) => /*#__PURE__*/ I(e.root, { children: /*#__PURE__*/ I(ql, {
	value: t.activeDescendant,
	children: /*#__PURE__*/ I(Mg.Provider, {
		value: t.listbox,
		children: /*#__PURE__*/ aa(Ag.Provider, {
			value: t.combobox,
			children: [
				/*#__PURE__*/ aa(e.button, { children: [e.button.children, e.expandIcon && /*#__PURE__*/ I(e.expandIcon, {})] }),
				e.clearButton && /*#__PURE__*/ I(e.clearButton, {}),
				e.listbox && (e.inlinePopup ? /*#__PURE__*/ I(e.listbox, {}) : /*#__PURE__*/ I(vh, {
					mountNode: e.mountNode,
					children: /*#__PURE__*/ I(e.listbox, {})
				}))
			]
		})
	})
}) }), f_ = {
	root: "fui-Dropdown",
	button: "fui-Dropdown__button",
	clearButton: "fui-Dropdown__clearButton",
	expandIcon: "fui-Dropdown__expandIcon",
	listbox: "fui-Dropdown__listbox"
}, p_ = /*#__PURE__*/ P({
	root: {
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "ft85np5",
		B7ck84d: "f1ewtqcl",
		mc9l5x: "ftuwxu6",
		Bf4jedk: "f1exfvgq",
		qhf8xq: "f10pi13n",
		ha4doy: "fmrv4ls",
		Bbr2w1p: "f14a1fxs",
		Bduesf4: "f3e99gv",
		Bpq79vn: "fhljsf7",
		li1rpt: "f1gw3sf2",
		Bsft5z2: "f13zj6fq",
		E3zdtr: "f1mdlcz9",
		Eqx8gd: ["f1a7op3", "f1cjjd47"],
		By385i5: "f1gboi2j",
		B1piin3: ["f1cjjd47", "f1a7op3"],
		Dlnsje: "ffyw7fx",
		d9w3h3: ["f1kp91vd", "f1ibwz09"],
		B3778ie: ["f1ibwz09", "f1kp91vd"],
		B1q35kw: 0,
		Bw17bha: 0,
		Bcgy8vk: 0,
		Bjuhk93: "f1mnjydx",
		Gjdm7m: "f13evtba",
		b1kco5: "f1yk9hq",
		Ba2ppi3: "fhwpy7i",
		F2fol1: "f14ee0xe",
		lck23g: "f1xhbsuh",
		wi16st: "fsrmcvb",
		ywj3b2: "f1t3k7v9",
		umuwi5: "fjw5xc1",
		Blcqepd: "f1xdyd5c",
		nplu4u: "fatpbeo",
		Bioka5o: "fb7uyps",
		Bnupc0a: "fx04xgm",
		bing71: "f1c7in40",
		Bercvud: "f1ibeo51",
		Br277j9: "f18qfb8s",
		Btis473: "f1m082s7"
	},
	listbox: {
		B7ck84d: "f1ewtqcl",
		E5pizo: "f1hg901r",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "ft85np5",
		Bxyxcbc: "fmmk62d"
	},
	listboxCollapsed: { mc9l5x: "fjseox" },
	inlineListbox: { Bj3rh1h: "f19g0ac" },
	button: {
		Bt984gj: "f122n59",
		De3pzq: "f1c21dwh",
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
		B7ck84d: "f1ewtqcl",
		sj55zd: "f19n0e5",
		i8kkvl: "f14mj54c",
		Bceei9c: "f1k6fduh",
		mc9l5x: "f13qh94s",
		Bahqtrf: "fk6fouc",
		Budl1dq: "f12nh0o2",
		Brf1p80: "f1869bpl",
		fsow6f: ["f1o700av", "fes3tcz"],
		a9b677: "fly5x3f",
		Brovlpu: "ftqa4ok"
	},
	placeholder: { sj55zd: "fxc4j92" },
	small: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fy9rknc",
		Bhrd7zp: "figsok6",
		Bg96gwp: "fwrc4pm",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: ["fye6m5k", "f3cq2dl"]
	},
	medium: {
		Bahqtrf: "fk6fouc",
		Be2twd7: "fkhj508",
		Bhrd7zp: "figsok6",
		Bg96gwp: "f1i3iumi",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: ["f14ev680", "f58uxzw"]
	},
	large: {
		i8kkvl: "f1rjii52",
		Bahqtrf: "fk6fouc",
		Be2twd7: "fod5ikn",
		Bhrd7zp: "figsok6",
		Bg96gwp: "faaz57k",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: ["f139mn7i", "f1v3q0m"]
	},
	outline: {
		De3pzq: "fxugw4r",
		Bgfg5da: 0,
		B9xav0g: "f1c1zstj",
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
		irswps: "fhz96rm"
	},
	outlineInteractive: {
		Bgoe8wy: "fvcxoqz",
		Bwzppfd: ["f1ub3y4t", "f1m52nbi"],
		oetu4i: "f1l4zc64",
		gg5e9n: ["f1m52nbi", "f1ub3y4t"],
		B6oc9vd: "fvs00aa",
		ak43y8: ["f1assf6x", "f4ruux4"],
		wmxk5l: "f1z0osm6",
		B50zh58: ["f4ruux4", "f1assf6x"],
		Bvq3b66: "f1b473iu",
		Brahy3i: ["f381qr8", "ft4skwv"],
		zoxjo1: "f1qzcrsd",
		an54nd: ["ft4skwv", "f381qr8"]
	},
	underline: {
		De3pzq: "f1c21dwh",
		B9xav0g: 0,
		oivjwe: 0,
		Bn0qgzm: 0,
		Bgfg5da: "f9ez7ne",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "fokr779"
	},
	"filled-lighter": {
		De3pzq: "fxugw4r",
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
		irswps: "f88035w"
	},
	"filled-darker": {
		De3pzq: "f16xq7d1",
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
		irswps: "f88035w"
	},
	invalid: {
		tvckwq: "fs4k3qj",
		gk2u95: ["fcee079", "fmyw78r"],
		hhx65j: "f1fgmyf4",
		Bxowmz0: ["fmyw78r", "fcee079"]
	},
	invalidUnderline: { hhx65j: "f1fgmyf4" },
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
		Bosien3: ["f5u9ap2", "f3qs60o"]
	},
	disabledText: {
		sj55zd: "f1s2aq7o",
		Bceei9c: "fdrzuqr"
	},
	hidden: { mc9l5x: "fjseox" }
}, {
	d: [
		[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		".f1ewtqcl{box-sizing:border-box;}",
		".ftuwxu6{display:inline-flex;}",
		".f1exfvgq{min-width:250px;}",
		".f10pi13n{position:relative;}",
		".fmrv4ls{vertical-align:middle;}",
		".f1gw3sf2::after{box-sizing:border-box;}",
		".f13zj6fq::after{content:\"\";}",
		".f1mdlcz9::after{position:absolute;}",
		".f1a7op3::after{left:-1px;}",
		".f1cjjd47::after{right:-1px;}",
		".f1gboi2j::after{bottom:-1px;}",
		".ffyw7fx::after{height:max(var(--strokeWidthThick), var(--borderRadiusMedium));}",
		".f1kp91vd::after{border-bottom-left-radius:var(--borderRadiusMedium);}",
		".f1ibwz09::after{border-bottom-right-radius:var(--borderRadiusMedium);}",
		[".f1mnjydx::after{border-bottom:var(--strokeWidthThick) solid var(--colorCompoundBrandStroke);}", { p: -1 }],
		".f13evtba::after{clip-path:inset(calc(100% - 2px) 0 0 0);}",
		".f1yk9hq::after{transform:scaleX(0);}",
		".fhwpy7i::after{transition-property:transform;}",
		".f14ee0xe::after{transition-duration:var(--durationUltraFast);}",
		".f1xhbsuh::after{transition-delay:var(--curveAccelerateMid);}",
		".f1hg901r{box-shadow:var(--shadow16);}",
		[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		".fmmk62d{max-height:80vh;}",
		".fjseox{display:none;}",
		".f19g0ac{z-index:1;}",
		".f122n59{align-items:center;}",
		".f1c21dwh{background-color:var(--colorTransparentBackground);}",
		[".f3bhgqh{border:none;}", { p: -2 }],
		".f19n0e5{color:var(--colorNeutralForeground1);}",
		".f14mj54c{column-gap:var(--spacingHorizontalXXS);}",
		".f1k6fduh{cursor:pointer;}",
		".f13qh94s{display:grid;}",
		".fk6fouc{font-family:var(--fontFamilyBase);}",
		".f12nh0o2{grid-template-columns:[content] 1fr [icon] auto [end];}",
		".f1869bpl{justify-content:space-between;}",
		".f1o700av{text-align:left;}",
		".fes3tcz{text-align:right;}",
		".fly5x3f{width:100%;}",
		".fxc4j92{color:var(--colorNeutralForeground4);}",
		".fy9rknc{font-size:var(--fontSizeBase200);}",
		".figsok6{font-weight:var(--fontWeightRegular);}",
		".fwrc4pm{line-height:var(--lineHeightBase200);}",
		[".fye6m5k{padding:3px var(--spacingHorizontalSNudge) 3px calc(var(--spacingHorizontalSNudge) + var(--spacingHorizontalXXS));}", { p: -1 }],
		[".f3cq2dl{padding:3px calc(var(--spacingHorizontalSNudge) + var(--spacingHorizontalXXS)) 3px var(--spacingHorizontalSNudge);}", { p: -1 }],
		".fkhj508{font-size:var(--fontSizeBase300);}",
		".f1i3iumi{line-height:var(--lineHeightBase300);}",
		[".f14ev680{padding:5px var(--spacingHorizontalMNudge) 5px calc(var(--spacingHorizontalMNudge) + var(--spacingHorizontalXXS));}", { p: -1 }],
		[".f58uxzw{padding:5px calc(var(--spacingHorizontalMNudge) + var(--spacingHorizontalXXS)) 5px var(--spacingHorizontalMNudge);}", { p: -1 }],
		".f1rjii52{column-gap:var(--spacingHorizontalSNudge);}",
		".fod5ikn{font-size:var(--fontSizeBase400);}",
		".faaz57k{line-height:var(--lineHeightBase400);}",
		[".f139mn7i{padding:7px var(--spacingHorizontalM) 7px calc(var(--spacingHorizontalM) + var(--spacingHorizontalSNudge));}", { p: -1 }],
		[".f1v3q0m{padding:7px calc(var(--spacingHorizontalM) + var(--spacingHorizontalSNudge)) 7px var(--spacingHorizontalM);}", { p: -1 }],
		".fxugw4r{background-color:var(--colorNeutralBackground1);}",
		[".fhz96rm{border:var(--strokeWidthThin) solid var(--colorNeutralStroke1);}", { p: -2 }],
		".f1c1zstj{border-bottom-color:var(--colorNeutralStrokeAccessible);}",
		[".f9ez7ne{border-bottom:var(--strokeWidthThin) solid var(--colorNeutralStrokeAccessible);}", { p: -1 }],
		[".fokr779{border-radius:0;}", { p: -1 }],
		[".f88035w{border:var(--strokeWidthThin) solid var(--colorTransparentStroke);}", { p: -2 }],
		".f16xq7d1{background-color:var(--colorNeutralBackground3);}",
		[".f88035w{border:var(--strokeWidthThin) solid var(--colorTransparentStroke);}", { p: -2 }],
		".fs4k3qj:not(:focus-within),.fs4k3qj:hover:not(:focus-within){border-top-color:var(--colorPaletteRedBorder2);}",
		".fcee079:not(:focus-within),.fcee079:hover:not(:focus-within){border-right-color:var(--colorPaletteRedBorder2);}",
		".fmyw78r:not(:focus-within),.fmyw78r:hover:not(:focus-within){border-left-color:var(--colorPaletteRedBorder2);}",
		".f1fgmyf4:not(:focus-within),.f1fgmyf4:hover:not(:focus-within){border-bottom-color:var(--colorPaletteRedBorder2);}",
		".fdrzuqr{cursor:not-allowed;}",
		".f1jj8ep1{border-top-color:var(--colorNeutralStrokeDisabled);}",
		".f15xbau{border-right-color:var(--colorNeutralStrokeDisabled);}",
		".fy0fskl{border-left-color:var(--colorNeutralStrokeDisabled);}",
		".f4ikngz{border-bottom-color:var(--colorNeutralStrokeDisabled);}",
		".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}"
	],
	w: [
		".f14a1fxs:focus-within{outline-width:2px;}",
		".f3e99gv:focus-within{outline-style:solid;}",
		".fhljsf7:focus-within{outline-color:transparent;}",
		".fjw5xc1:focus-within::after{transform:scaleX(1);}",
		".f1xdyd5c:focus-within::after{transition-property:transform;}",
		".fatpbeo:focus-within::after{transition-duration:var(--durationNormal);}",
		".fb7uyps:focus-within::after{transition-delay:var(--curveDecelerateMid);}",
		".f1ibeo51:focus-within:active::after{border-bottom-color:var(--colorCompoundBrandStrokePressed);}",
		".f1b473iu:focus-within{border-top-color:var(--colorNeutralStroke1Pressed);}",
		".f381qr8:focus-within{border-right-color:var(--colorNeutralStroke1Pressed);}",
		".ft4skwv:focus-within{border-left-color:var(--colorNeutralStroke1Pressed);}",
		".f1qzcrsd:focus-within{border-bottom-color:var(--colorNeutralStrokeAccessiblePressed);}"
	],
	m: [
		["@media screen and (prefers-reduced-motion: reduce){.fsrmcvb::after{transition-duration:0.01ms;}}", { m: "screen and (prefers-reduced-motion: reduce)" }],
		["@media screen and (prefers-reduced-motion: reduce){.f1t3k7v9::after{transition-delay:0.01ms;}}", { m: "screen and (prefers-reduced-motion: reduce)" }],
		["@media screen and (prefers-reduced-motion: reduce){.fx04xgm:focus-within::after{transition-duration:0.01ms;}}", { m: "screen and (prefers-reduced-motion: reduce)" }],
		["@media screen and (prefers-reduced-motion: reduce){.f1c7in40:focus-within::after{transition-delay:0.01ms;}}", { m: "screen and (prefers-reduced-motion: reduce)" }],
		["@media (forced-colors: active){.f9dbb4x{border-top-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f3qs60o{border-right-color:GrayText;}.f5u9ap2{border-left-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fwd1oij{border-bottom-color:GrayText;}}", { m: "(forced-colors: active)" }]
	],
	t: ["@supports selector(:has(*)){.f18qfb8s:has(.fui-Dropdown__clearButton:focus)::after{border-bottom-color:initial;}}", "@supports selector(:has(*)){.f1m082s7:has(.fui-Dropdown__clearButton:focus)::after{transform:scaleX(0);}}"],
	f: [".ftqa4ok:focus{outline-style:none;}"],
	h: [
		".fvcxoqz:hover{border-top-color:var(--colorNeutralStroke1Hover);}",
		".f1ub3y4t:hover{border-right-color:var(--colorNeutralStroke1Hover);}",
		".f1m52nbi:hover{border-left-color:var(--colorNeutralStroke1Hover);}",
		".f1l4zc64:hover{border-bottom-color:var(--colorNeutralStrokeAccessibleHover);}"
	],
	a: [
		".fvs00aa:active{border-top-color:var(--colorNeutralStroke1Pressed);}",
		".f1assf6x:active{border-right-color:var(--colorNeutralStroke1Pressed);}",
		".f4ruux4:active{border-left-color:var(--colorNeutralStroke1Pressed);}",
		".f1z0osm6:active{border-bottom-color:var(--colorNeutralStrokeAccessiblePressed);}"
	]
}), m_ = /*#__PURE__*/ P({
	icon: {
		B7ck84d: "f1ewtqcl",
		sj55zd: "fxkbij4",
		mc9l5x: "ftgm304",
		Be2twd7: "f1pp30po",
		Br312pm: "f12w6cgp",
		Bw0ie65: "f8bv1bt",
		Bo70h7d: "fvc9v3g"
	},
	small: {
		Be2twd7: "f4ybsrx",
		Frg6f3: ["f1h9en5y", "f1xk557c"]
	},
	medium: {
		Be2twd7: "fe5j1ua",
		Frg6f3: ["f1h9en5y", "f1xk557c"]
	},
	large: {
		Be2twd7: "f1rt2boy",
		Frg6f3: ["f1t5qyk5", "f1ikr372"]
	},
	disabled: { sj55zd: "f1s2aq7o" }
}, { d: [
	".f1ewtqcl{box-sizing:border-box;}",
	".fxkbij4{color:var(--colorNeutralStrokeAccessible);}",
	".ftgm304{display:block;}",
	".f1pp30po{font-size:var(--fontSizeBase500);}",
	".f12w6cgp{grid-column-start:icon;}",
	".f8bv1bt{grid-column-end:end;}",
	".fvc9v3g svg{display:block;}",
	".f4ybsrx{font-size:16px;}",
	".f1h9en5y{margin-left:var(--spacingHorizontalXXS);}",
	".f1xk557c{margin-right:var(--spacingHorizontalXXS);}",
	".fe5j1ua{font-size:20px;}",
	".f1rt2boy{font-size:24px;}",
	".f1t5qyk5{margin-left:var(--spacingHorizontalSNudge);}",
	".f1ikr372{margin-right:var(--spacingHorizontalSNudge);}",
	".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}"
] }), h_ = /*#__PURE__*/ Yn("rticfuj", "r1vp6jef", {
	r: [
		".rticfuj{align-self:center;background-color:var(--colorTransparentBackground);border:none;cursor:pointer;height:fit-content;margin:0;margin-right:var(--spacingHorizontalMNudge);padding:0;position:relative;}",
		".rticfuj:focus{outline-style:none;}",
		".rticfuj:focus-visible{outline-style:none;}",
		".rticfuj[data-fui-focus-visible]{border-top-color:transparent;border-right-color:transparent;border-bottom-color:transparent;border-left-color:transparent;}",
		".rticfuj[data-fui-focus-visible]::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid var(--colorStrokeFocus2);border-radius:var(--borderRadiusMedium);top:calc(2px * -1);right:calc(2px * -1);bottom:calc(2px * -1);left:calc(2px * -1);}",
		".r1vp6jef{align-self:center;background-color:var(--colorTransparentBackground);border:none;cursor:pointer;height:fit-content;margin:0;margin-left:var(--spacingHorizontalMNudge);padding:0;position:relative;}",
		".r1vp6jef:focus{outline-style:none;}",
		".r1vp6jef:focus-visible{outline-style:none;}",
		".r1vp6jef[data-fui-focus-visible]{border-top-color:transparent;border-left-color:transparent;border-bottom-color:transparent;border-right-color:transparent;}",
		".r1vp6jef[data-fui-focus-visible]::after{content:\"\";position:absolute;pointer-events:none;z-index:1;border:2px solid var(--colorStrokeFocus2);border-radius:var(--borderRadiusMedium);top:calc(2px * -1);left:calc(2px * -1);bottom:calc(2px * -1);right:calc(2px * -1);}"
	],
	s: ["@media (forced-colors: active){.rticfuj[data-fui-focus-visible]::after{border-top-color:Highlight;border-right-color:Highlight;border-bottom-color:Highlight;border-left-color:Highlight;}}", "@media (forced-colors: active){.r1vp6jef[data-fui-focus-visible]::after{border-top-color:Highlight;border-left-color:Highlight;border-bottom-color:Highlight;border-right-color:Highlight;}}"]
}), g_ = (e) => {
	let { appearance: t, open: n, placeholderVisible: r, showClearButton: i, size: a } = e, o = `${e.button["aria-invalid"]}` == "true", s = e.button.disabled, c = p_(), l = m_(), u = h_();
	return e.root.className = k(f_.root, c.root, c[t], !s && t === "outline" && c.outlineInteractive, o && t !== "underline" && c.invalid, o && t === "underline" && c.invalidUnderline, s && c.disabled, e.root.className), e.button.className = k(f_.button, c.button, c[a], r && c.placeholder, s && c.disabledText, e.button.className), e.listbox && (e.listbox.className = k(f_.listbox, c.listbox, e.inlinePopup && c.inlineListbox, !n && c.listboxCollapsed, e.listbox.className)), e.expandIcon && (e.expandIcon.className = k(f_.expandIcon, l.icon, l[a], s && l.disabled, i && c.hidden, e.expandIcon.className)), e.clearButton && (e.clearButton.className = k(f_.clearButton, u, l.icon, l[a], s && l.disabled, !i && c.hidden, e.clearButton.className)), e;
}, __ = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = u_(e, t), r = Pg(n);
	return g_(n), si("useDropdownStyles_unstable")(n), d_(n, r);
});
__.displayName = "Dropdown";
//#endregion
//#region node_modules/@fluentui/react-input/lib/components/Input/useInput.js
var v_ = (e, t) => {
	let n = ri(), r = qh(), { size: i = r?.size ?? "medium", appearance: a = n.inputDefaultAppearance ?? "outline", ...o } = e;
	return {
		size: i,
		appearance: a,
		...y_(o, t)
	};
}, y_ = (e, t) => {
	let n = Yh(e, {
		supportsLabelFor: !0,
		supportsRequired: !0
	}), [r, i] = gi({
		state: n.value,
		defaultState: n.defaultValue,
		initialState: ""
	}), a = Lr({
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
		input: nr(n.input, {
			defaultProps: {
				type: "text",
				ref: t,
				...a.primary
			},
			elementType: "input"
		}),
		contentAfter: rr(n.contentAfter, { elementType: "span" }),
		contentBefore: rr(n.contentBefore, { elementType: "span" }),
		root: nr(n.root, {
			defaultProps: a.root,
			elementType: "span"
		})
	};
	return o.input.value = r, o.input.onChange = F((e) => {
		var t;
		let r = e.target.value;
		(t = n.onChange) == null || t.call(n, e, { value: r }), i(r);
	}), o;
}, b_ = (e) => /*#__PURE__*/ aa(e.root, { children: [
	e.contentBefore && /*#__PURE__*/ I(e.contentBefore, {}),
	/*#__PURE__*/ I(e.input, {}),
	e.contentAfter && /*#__PURE__*/ I(e.contentAfter, {})
] }), x_ = {
	root: "fui-Input",
	input: "fui-Input__input",
	contentBefore: "fui-Input__contentBefore",
	contentAfter: "fui-Input__contentAfter"
};
U.spacingHorizontalSNudge, U.spacingHorizontalMNudge, U.spacingHorizontalM, U.spacingHorizontalXXS, U.spacingHorizontalXXS, U.spacingHorizontalSNudge, U.spacingHorizontalS, U.spacingHorizontalM, `${U.spacingHorizontalM}${U.spacingHorizontalSNudge}`;
var S_ = /*#__PURE__*/ Yn("r1oeeo9n", "r9sxh5", {
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
}), C_ = /*#__PURE__*/ P({
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
}), w_ = /*#__PURE__*/ Yn("r12stul0", null, [
	".r12stul0{align-self:stretch;box-sizing:border-box;flex-grow:1;min-width:0;border-style:none;padding:0 var(--spacingHorizontalM);color:var(--colorNeutralForeground1);background-color:transparent;outline-style:none;font-family:inherit;font-size:inherit;font-weight:inherit;line-height:inherit;}",
	".r12stul0::-webkit-input-placeholder{color:var(--colorNeutralForeground4);opacity:1;}",
	".r12stul0::-moz-placeholder{color:var(--colorNeutralForeground4);opacity:1;}",
	".r12stul0::placeholder{color:var(--colorNeutralForeground4);opacity:1;}"
]), T_ = /*#__PURE__*/ P({
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
] }), E_ = /*#__PURE__*/ Yn("r1572tok", null, [".r1572tok{box-sizing:border-box;color:var(--colorNeutralForeground3);display:flex;}", ".r1572tok>svg{font-size:20px;}"]), D_ = /*#__PURE__*/ P({
	disabled: { sj55zd: "f1s2aq7o" },
	small: { Duoase: "f3qv9w" },
	medium: {},
	large: { Duoase: "f16u2scb" }
}, { d: [
	".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
	".f3qv9w>svg{font-size:16px;}",
	".f16u2scb>svg{font-size:24px;}"
] }), O_ = (e) => {
	let { size: t, appearance: n } = e, r = e.input.disabled, i = `${e.input["aria-invalid"]}` == "true", a = n.startsWith("filled"), o = C_(), s = T_(), c = D_();
	e.root.className = k(x_.root, S_(), o[t], e.contentBefore && o[`${t}WithContentBefore`], e.contentAfter && o[`${t}WithContentAfter`], o[n], !r && n === "outline" && o.outlineInteractive, !r && n === "underline" && o.underlineInteractive, !r && a && o.filledInteractive, a && o.filled, !r && i && o.invalid, r && o.disabled, e.root.className), e.input.className = k(x_.input, w_(), s[t], e.contentBefore && s[`${t}WithContentBefore`], e.contentAfter && s[`${t}WithContentAfter`], r && s.disabled, e.input.className);
	let l = [
		E_(),
		r && c.disabled,
		c[t]
	];
	return e.contentBefore && (e.contentBefore.className = k(x_.contentBefore, ...l, e.contentBefore.className)), e.contentAfter && (e.contentAfter.className = k(x_.contentAfter, ...l, e.contentAfter.className)), e;
}, k_ = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = v_(e, t);
	return O_(n), si("useInputStyles_unstable")(n), b_(n);
});
k_.displayName = "Input";
var A_ = M.createContext(void 0).Provider, j_ = Rl(void 0), M_ = {
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
}, N_ = j_.Provider, P_ = (e) => zl(j_, (t = M_) => e(t)), F_ = M.createContext(void 0), I_ = !1, L_ = F_.Provider, R_ = () => M.useContext(F_) ?? I_, z_ = Rl(void 0), B_ = {
	checkedValues: {},
	setFocusByFirstCharacter: () => null,
	toggleCheckbox: () => null,
	selectRadio: () => null,
	hasIcons: !1,
	hasCheckmarks: !1
}, V_ = z_.Provider, H_ = (e) => zl(z_, (t = B_) => e(t)), U_ = "fuimenuenter", W_ = (e) => {
	let { refs: t, callback: n, element: r, disabled: i } = e, a = F((e) => {
		let r = t[0], a = e.target;
		!Zi(r.current ?? null, a) && !i && n(e);
	});
	M.useEffect(() => {
		if (r != null) return i || r.addEventListener(U_, a), () => {
			r.removeEventListener(U_, a);
		};
	}, [
		a,
		r,
		i
	]);
}, G_ = (e, t) => {
	e.dispatchEvent(new CustomEvent(U_, {
		bubbles: !0,
		detail: { nativeEvent: t }
	}));
};
//#endregion
//#region node_modules/@fluentui/react-menu/lib/utils/useIsSubmenu.js
function K_() {
	let e = P_((e) => e.isSubmenu), t = Bl(z_);
	return e || t;
}
//#endregion
//#region node_modules/@fluentui/react-menu/lib/utils/useValidateNesting.js
var q_ = (e) => {
	let { targetDocument: t } = ei();
	return P_((e) => e.triggerRef), P_((e) => e.inline), M.useRef(null);
}, J_ = "fuimenusafezonetimeout", Y_ = (e) => {
	let t = M.useRef(null);
	return M.useCallback((n) => {
		var r;
		(r = t.current) == null || r.removeEventListener("fuimenusafezonetimeout", e), n?.addEventListener("fuimenusafezonetimeout", e), t.current = n;
	}, [e]);
}, X_ = /*#__PURE__*/ P({
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
] }), Z_ = (e) => {
	let t = X_();
	e.checkmark && (e.checkmark.className = k(t.root, e.checked && t.rootChecked, e.checkmark.className));
}, Q_ = {
	root: "fui-MenuItem",
	icon: "fui-MenuItem__icon",
	checkmark: "fui-MenuItem__checkmark",
	submenuIndicator: "fui-MenuItem__submenuIndicator",
	content: "fui-MenuItem__content",
	secondaryContent: "fui-MenuItem__secondaryContent",
	subText: "fui-MenuItem__subText"
}, $_ = /*#__PURE__*/ Yn("rfoezjv", "r8lt3v0", {
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
}), ev = /*#__PURE__*/ Yn("r1ls86vo", "rpbc5dr", [".r1ls86vo{padding-left:2px;padding-right:2px;background-color:transparent;flex-grow:1;}", ".rpbc5dr{padding-right:2px;padding-left:2px;background-color:transparent;flex-grow:1;}"]), tv = /*#__PURE__*/ Yn("r12mwwux", "r1ewgu5j", [
	".r12mwwux{padding-left:2px;padding-right:2px;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);color:var(--colorNeutralForeground3);}",
	".r12mwwux:hover{color:var(--colorNeutralForeground3Hover);}",
	".r12mwwux:focus{color:var(--colorNeutralForeground3Hover);}",
	".r1ewgu5j{padding-right:2px;padding-left:2px;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);color:var(--colorNeutralForeground3);}",
	".r1ewgu5j:hover{color:var(--colorNeutralForeground3Hover);}",
	".r1ewgu5j:focus{color:var(--colorNeutralForeground3Hover);}"
]), nv = /*#__PURE__*/ Yn("ro9koqv", null, [".ro9koqv{width:20px;height:20px;font-size:20px;line-height:0;align-items:center;display:inline-flex;justify-content:center;flex-shrink:0;}"]), rv = /*#__PURE__*/ Yn("r9c34qo", null, [".r9c34qo{width:20px;height:20px;font-size:20px;line-height:0;align-items:center;display:inline-flex;justify-content:center;}"]), iv = /*#__PURE__*/ Yn("rk2ppru", null, [".rk2ppru{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase100);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase100);color:var(--colorNeutralForeground3);}"]), av = /*#__PURE__*/ P({
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
}), ov = /*#__PURE__*/ P({ disabled: {
	sj55zd: "f1s2aq7o",
	B7iucu3: "f1cyfu5x"
} }, {
	d: [".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}"],
	m: [["@media (forced-colors: active){.f1cyfu5x{color:GrayText;}}", { m: "(forced-colors: active)" }]]
}), sv = /*#__PURE__*/ P({
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
] }), cv = (e) => {
	let t = av(), n = $_(), r = ev(), i = tv(), a = nv(), o = rv(), s = sv(), c = iv(), l = ov(), u = !!e.subText;
	return e.root.className = k(Q_.root, n, e.submenuOpen && t.submenuOpen, e.disabled && t.disabled, e.root.className), e.content && (e.content.className = k(Q_.content, r, e.content.className, u && s.content)), e.checkmark && (e.checkmark.className = k(Q_.checkmark, t.checkmark, e.checkmark.className)), e.secondaryContent && (e.secondaryContent.className = k(Q_.secondaryContent, i, e.disabled && t.disabled, e.secondaryContent.className, u && s.secondaryContent)), e.icon && (e.icon.className = k(Q_.icon, a, e.icon.className)), e.submenuIndicator && (e.submenuIndicator.className = k(Q_.submenuIndicator, o, e.submenuIndicator.className, u && s.submenuIndicator)), e.subText && (e.subText.className = k(Q_.subText, e.disabled && l.disabled, e.subText.className, c)), Z_(e), e;
}, lv = q.durationSlower, uv = q.curveDecelerateMid, dv = kd(({ distance: e = 10 }) => ({
	enter: [Vd({
		duration: lv,
		easing: uv,
		direction: "enter"
	}), {
		...Hd({
			duration: lv,
			easing: uv,
			direction: "enter",
			outX: `calc(var(${of}, 0px) * ${e})`,
			outY: `calc(var(${sf}, 0px) * ${e})`
		}),
		composite: "accumulate"
	}],
	exit: []
})), fv = [
	"after",
	"after-bottom",
	"before-top",
	"before",
	"before-bottom",
	"above"
], pv = (e) => {
	let { surfaceMotion: t, ...n } = e, r = mv(n);
	return {
		...r,
		components: { surfaceMotion: dv },
		surfaceMotion: Bd(t, {
			elementType: dv,
			defaultProps: {
				visible: r.open,
				appear: !0,
				unmountOnExit: !0
			}
		})
	};
}, mv = (e) => {
	let t = K_(), { hoverDelay: n = 500, inline: r = !1, hasCheckmarks: i = !1, hasIcons: a = !1, closeOnScroll: o = !1, openOnContext: s = !1, persistOnItemClick: c = !1, openOnHover: l = t, defaultCheckedValues: u, mountNode: d = null, safeZone: f } = e, { targetDocument: p } = ei(), m = ki("menu"), [h, g] = Wm(), _ = xm(e.positioning), v = lf({
		targetDocument: p,
		onPositioningEnd: _.onPositioningEnd
	}), y = {
		position: t ? "after" : "below",
		align: t ? "top" : "start",
		target: e.openOnContext ? h : void 0,
		fallbackPositions: t ? fv : void 0,
		..._,
		onPositioningEnd: v
	}, b = M.Children.toArray(e.children), x, S;
	b.length === 2 ? (x = b[0], S = b[1]) : b.length === 1 && (S = b[0]);
	let { targetRef: C, containerRef: w } = Um(y), T = f && l, E = M.useRef({
		isInside: !1,
		mouseCoordinates: {
			x: 0,
			y: 0
		}
	}), D = sh({
		disabled: !T,
		timeout: typeof f == "object" ? f.timeout : 300,
		onSafeZoneEnter: (e) => {
			ne(e, {
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
			let e = new CustomEvent(J_);
			ne(e, {
				open: !1,
				keyboard: !1,
				type: "menuSafeZoneTimeout",
				event: e
			}), E.current.isInside && p && p.elementsFromPoint(E.current.mouseCoordinates.x, E.current.mouseCoordinates.y).find((e) => e.classList.contains(Q_.root))?.dispatchEvent(e);
		}
	}), ee = Ai(C, D.targetRef), O = Ai(w, D.containerRef), [te, ne] = gv({
		hoverDelay: n,
		isSubmenu: t,
		setContextTarget: g,
		closeOnScroll: o,
		menuPopoverRef: O,
		triggerRef: ee,
		open: e.open,
		defaultOpen: e.defaultOpen,
		onOpenChange: e.onOpenChange,
		openOnContext: s
	}), [re, k] = hv({
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
		menuPopoverRef: O,
		openOnContext: s,
		open: te,
		setOpen: ne,
		checkedValues: re,
		onCheckedValueChange: k,
		persistOnItemClick: c,
		safeZone: D.elementToRender
	};
}, hv = (e) => {
	let [t, n] = gi({
		state: e.checkedValues,
		defaultState: e.defaultCheckedValues,
		initialState: {}
	});
	return [t, F((t, { name: r, checkedItems: i }) => {
		var a;
		(a = e.onCheckedValueChange) == null || a.call(e, t, {
			name: r,
			checkedItems: i
		}), n((e) => ({
			...e,
			[r]: i
		}));
	})];
}, gv = (e) => {
	let { targetDocument: t } = ei(), n = P_((e) => e.setOpen), r = F((t, n) => e.onOpenChange?.call(e, t, n)), i = M.useRef(!1), [a, o] = gi({
		state: e.open,
		defaultState: e.defaultOpen,
		initialState: !1
	}), s = F((t, i) => {
		let a = t instanceof CustomEvent && t.type === "fuimenuenter" ? t.detail.nativeEvent : t;
		r?.(a, { ...i }), i.open && t.type === "contextmenu" && e.setContextTarget(t), i.open || e.setContextTarget(void 0), i.bubble && n(t, { ...i }), o(i.open);
	}), [c, l] = zi(), u = F((t, n) => {
		l(), !(t instanceof Event) && t.persist && t.persist(), !n.ignoreHoverDelay && (t.type === "mouseleave" || t.type === "mouseover" || t.type === "mousemove" || t.type === "fuimenuenter") ? (e.triggerRef.current?.contains(t.target) && (i.current = t.type === "mouseover" || t.type === "mousemove"), c(() => s(t, n), e.hoverDelay)) : s(t, n);
	});
	Mi({
		contains: Zi,
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
	Ii({
		contains: Zi,
		element: t,
		callback: (e) => u(e, {
			open: !1,
			type: "scrollOutside",
			event: e
		}),
		refs: [e.menuPopoverRef, !e.openOnContext && e.triggerRef].filter(Boolean),
		disabled: !a || !d
	}), W_({
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
	let { findFirstFocusable: f } = ys(), p = M.useCallback(() => {
		f(e.menuPopoverRef.current)?.focus();
	}, [f, e.menuPopoverRef]), m = Ti();
	return M.useEffect(() => {
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
function _v(e) {
	let { checkedValues: t, hasCheckmarks: n, hasIcons: r, inline: i, isSubmenu: a, menuPopoverRef: o, mountNode: s, onCheckedValueChange: c, open: l, openOnContext: u, openOnHover: d, persistOnItemClick: f, safeZone: p, setOpen: m, triggerId: h, triggerRef: g } = e;
	return { menu: M.useMemo(() => ({
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
var vv = (e, t) => /*#__PURE__*/ aa(N_, {
	value: t.menu,
	children: [e.menuTrigger, e.menuPopover && /*#__PURE__*/ I(e.surfaceMotion, { children: /*#__PURE__*/ I(Rd, { children: e.menuPopover }) })]
}), yv = (e) => {
	let t = pv(e);
	return vv(t, _v(t));
};
yv.displayName = "Menu";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuItem/useCharacterSearch.js
var bv = (e, t) => {
	let n = H_((e) => e.setFocusByFirstCharacter), { onKeyDown: r } = e.root;
	return e.root.onKeyDown = (e) => {
		r?.(e), !(e.key?.length > 1) && t.current && n?.(e, t.current);
	}, e;
}, xv = M.createContext(void 0), Sv = { setMultiline: () => null };
xv.Provider;
var Cv = () => M.useContext(xv) ?? Sv, wv = () => Cv() !== Sv, Tv = (e, t) => {
	let n = R_(), r = P_((e) => e.persistOnItemClick), { as: i = "div", disabled: a = !1, hasSubmenu: o = n, persistOnClick: s = r, content: c, ...l } = e, { hasIcons: u, hasCheckmarks: d } = Dv({ hasSubmenu: o }), f = P_((e) => e.setOpen), p = P_((e) => e.open);
	Ev({
		multiline: !!e.subText,
		hasSubmenu: o
	});
	let m = M.useRef(null), h = M.useRef(!1), g = q_(Ov(e.role)), _ = {
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
		root: nr(Rr(i, Ul(i, {
			role: "menuitem",
			...l,
			disabled: !1,
			disabledFocusable: a,
			ref: Ai(t, m, g),
			onKeyDown: F((t) => {
				var n;
				(n = e.onKeyDown) == null || n.call(e, t), !t.isDefaultPrevented() && (t.key === " " || t.key === "Enter") && (h.current = !0);
			}),
			onMouseMove: F((t) => {
				var n;
				if (t.currentTarget.ownerDocument.activeElement !== t.currentTarget) {
					var r;
					(r = m.current) == null || r.focus();
				}
				(n = e.onMouseMove) == null || n.call(e, t);
			}),
			onClick: F((t) => {
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
		icon: rr(e.icon, {
			renderByDefault: u,
			elementType: "span"
		}),
		checkmark: rr(e.checkmark, {
			renderByDefault: d,
			elementType: "span"
		}),
		submenuIndicator: rr(e.submenuIndicator, {
			renderByDefault: o,
			elementType: "span"
		}),
		content: rr(e.content, {
			renderByDefault: !!e.children,
			defaultProps: { children: e.children },
			elementType: "span"
		}),
		secondaryContent: rr(e.secondaryContent, { elementType: "span" }),
		subText: rr(e.subText, { elementType: "span" })
	};
	return bv(_, m), _;
}, Ev = (e) => {
	let { hasSubmenu: t, multiline: n } = e, r = wv() && t, { setMultiline: i } = Cv();
	wi(() => {
		r || i(n);
	}, [
		i,
		n,
		r
	]);
}, Dv = (e) => {
	let { hasSubmenu: t } = e, n = H_((e) => e.hasIcons), r = H_((e) => e.hasCheckmarks), i = wv() && t;
	return {
		hasIcons: n && !i,
		hasCheckmarks: r && !i
	};
}, Ov = (e) => {
	switch (e) {
		case "menuitemcheckbox": return "MenuItemCheckbox";
		case "menuitemradio": return "MenuItemRadio";
	}
	return "MenuItem";
}, kv = sd(ku, Au), Av = sd(Du, Ou), jv = (e, t) => {
	let { dir: n } = ei(), r = Tv(e, t);
	if (r.submenuIndicator) {
		var i;
		(i = r.submenuIndicator).children ?? (i.children = n === "rtl" ? /*#__PURE__*/ M.createElement(Av, null) : /*#__PURE__*/ M.createElement(kv, null));
	}
	return r;
}, Mv = (e) => /*#__PURE__*/ aa(e.root, { children: [
	e.checkmark && /*#__PURE__*/ I(e.checkmark, {}),
	e.icon && /*#__PURE__*/ I(e.icon, {}),
	e.content && /*#__PURE__*/ aa(e.content, { children: [e.content.children, e.subText && /*#__PURE__*/ I(e.subText, {})] }),
	e.secondaryContent && /*#__PURE__*/ I(e.secondaryContent, {}),
	e.submenuIndicator && /*#__PURE__*/ I(e.submenuIndicator, {})
] }), Nv = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = jv(e, t);
	return cv(n), si("useMenuItemStyles_unstable")(n), Mv(n);
});
Nv.displayName = "MenuItem";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuList/useMenuList.js
var Pv = [
	"menuitem",
	"menuitemcheckbox",
	"menuitemradio"
], Fv = Pv.map((e) => `[role="${e}"]`).join(","), Iv = (e, t) => {
	let n = zv(), r = Bl(j_);
	Bv(e, n, r) && console.warn("You are using both MenuList and Menu props, we recommend you to use Menu props when available");
	let i = M.useRef(null), { findAllFocusable: a } = ys(), { targetDocument: o } = ei(), s = _s({ circular: !0 }), c = Lv(e, t), l = Ai(c.root.ref, i);
	M.useEffect(() => {
		let e = i.current;
		if (!r || !o || !e) return;
		let t = (t) => {
			let n = t.detail.next;
			n && e.contains(o.activeElement) && !e.contains(n) && t.preventDefault();
		};
		return o.addEventListener(Ra, t), () => {
			o.removeEventListener(Ra, t);
		};
	}, [r, o]);
	let u = M.useCallback((e, t) => {
		i.current && Rv(a(i.current, (e) => e.hasAttribute("role") && Pv.indexOf(e.getAttribute("role")) !== -1), e.key, t);
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
}, Lv = (e, t) => {
	let n = P_((e) => e.triggerId), r = P_((e) => e.checkedValues), i = P_((e) => e.onCheckedValueChange), a = P_((e) => e.hasIcons), o = P_((e) => e.hasCheckmarks), s = Bl(j_), c = M.useRef(null), l = q_("MenuList"), u = M.useCallback((e, t) => {
		c.current && Rv(Array.from(c.current.querySelectorAll(Fv)), e.key, t);
	}, []), [d, f] = gi({
		state: e.checkedValues ?? (s ? r : void 0),
		defaultState: e.defaultCheckedValues,
		initialState: {}
	}), p = e.onCheckedValueChange ?? (s ? i : void 0), m = F((e, t, n, r) => {
		let i = [...d?.[t] || []];
		r ? i.splice(i.indexOf(n), 1) : i.push(n), p?.(e, {
			name: t,
			checkedItems: i
		}), f((e) => ({
			...e,
			[t]: i
		}));
	}), h = F((e, t, n) => {
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
		root: nr(Rr("div", {
			ref: Ai(t, c, l),
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
}, Rv = (e, t, n) => {
	let r = e.indexOf(n) + 1;
	r === e.length && (r = 0);
	let i = e.map((e) => e.textContent?.charAt(0).toLowerCase()), a = t.toLowerCase(), o = (e) => {
		for (let t = e; t < i.length; t++) if (a === i[t]) return t;
		return -1;
	}, s = o(r);
	s === -1 && (s = o(0)), s > -1 && e[s].focus();
}, zv = () => ({
	checkedValues: P_((e) => e.checkedValues),
	onCheckedValueChange: P_((e) => e.onCheckedValueChange),
	triggerId: P_((e) => e.triggerId),
	hasIcons: P_((e) => e.hasIcons),
	hasCheckmarks: P_((e) => e.hasCheckmarks)
}), Bv = (e, t, n) => {
	let r = !1;
	for (let n in t) e[n] && (r = !0);
	return n && r;
}, Vv = (e, t) => /*#__PURE__*/ I(V_, {
	value: t.menuList,
	children: /*#__PURE__*/ I(e.root, {})
});
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuList/useMenuListContextValues.js
function Hv(e) {
	let { checkedValues: t, hasCheckmarks: n, hasIcons: r, selectRadio: i, setFocusByFirstCharacter: a, toggleCheckbox: o } = e;
	return { menuList: M.useMemo(() => ({
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
var Uv = { root: "fui-MenuList" }, Wv = /*#__PURE__*/ P({
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
] }), Gv = (e) => {
	let t = Wv();
	return e.root.className = k(Uv.root, t.root, e.hasMenuContext && t.hasMenuContext, e.root.className), e;
}, Kv = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = Iv(e, t), r = Hv(n);
	return Gv(n), si("useMenuListStyles_unstable")(n), Vv(n, r);
});
Kv.displayName = "MenuList";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuPopover/useMenuPopover.js
var qv = (e, t) => {
	"use no memo";
	let n = P_((e) => e.safeZone), r = P_((e) => e.menuPopoverRef), i = P_((e) => e.setOpen), a = P_((e) => e.open), o = P_((e) => e.openOnHover), s = P_((e) => e.triggerRef), c = K_(), l = H_((e) => e.shouldCloseOnArrowLeft ?? !0), u = M.useRef(!0), [d, f] = zi(), { dir: p } = ei(), m = p === "ltr" ? Vl : Hl, h = M.useCallback((e) => {
		e && e.addEventListener("mouseover", (e) => {
			u.current && (u.current = !1, G_(r.current, e), d(() => {
				u.current = !0;
			}, 250));
		});
	}, [r, d]);
	M.useEffect(() => () => f(), [f]);
	let g = P_((e) => e.inline) ?? !1, _ = P_((e) => e.mountNode), v = nr(Rr("div", {
		role: "presentation",
		...e,
		ref: Ai(t, r, h)
	}), { elementType: "div" }), { onMouseEnter: y, onKeyDown: b } = v;
	return v.onMouseEnter = F((e) => {
		(o || c) && i(e, {
			open: !0,
			keyboard: !1,
			type: "menuPopoverMouseEnter",
			event: e
		}), y?.(e);
	}), v.onKeyDown = F((e) => {
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
}, Jv = (e, t) => {
	let n = Ys($s(), gs({ focusable: { ignoreKeydown: { Escape: !0 } } })), r = Ld(), i = qv(e, t);
	return {
		...i,
		root: {
			...n,
			...i.root,
			ref: Ai(i.root.ref, r)
		}
	};
}, Yv = { root: "fui-MenuPopover" }, Xv = /*#__PURE__*/ P({ root: {
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
] }), Zv = (e) => {
	let t = Xv();
	return e.root.className = k(Yv.root, t.root, e.root.className), e;
}, Qv = (e) => e.inline ? /*#__PURE__*/ aa(M.Fragment, { children: [/*#__PURE__*/ I(e.root, {}), e.safeZone] }) : /*#__PURE__*/ aa(vh, {
	mountNode: e.mountNode,
	children: [/*#__PURE__*/ I(e.root, {}), e.safeZone]
}), $v = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = Jv(e, t);
	return Zv(n), si("useMenuPopoverStyles_unstable")(n), Qv(n);
});
$v.displayName = "MenuPopover";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuTrigger/useMenuTrigger.js
function ey() {}
var ty = (e) => {
	let t = P_((e) => e.menuPopoverRef), { findFirstFocusable: n } = ys(), r = M.useCallback(() => {
		n(t.current)?.focus();
	}, [n, t]);
	return ny({
		...e,
		focusFirst: r
	});
}, ny = (e) => {
	let { children: t, disableButtonEnhancement: n = !1, focusFirst: r } = e, i = P_((e) => e.triggerRef), a = P_((e) => e.setOpen), o = P_((e) => e.open), s = P_((e) => e.triggerId), c = P_((e) => e.openOnHover), l = P_((e) => e.openOnContext), u = K_(), d = H_((e) => e.shouldOpenOnArrowRight ?? !0), f = M.useRef(!1), p = M.useRef(!1), m = M.useRef(!1), { dir: h } = ei(), g = h === "ltr" ? Hl : Vl, _ = qi(t), v = Y_(F(() => {
		u && (p.current = !0);
	})), y = (e) => {
		ry(e) || e.isDefaultPrevented() || l && (e.preventDefault(), a(e, {
			open: !0,
			keyboard: !1,
			type: "menuTriggerContextMenu",
			event: e
		}));
	}, b = (e) => {
		ry(e) || l || (a(e, {
			open: !o,
			keyboard: f.current,
			type: "menuTriggerClick",
			event: e
		}), f.current = !1);
	}, x = (e) => {
		if (ry(e) || e.isDefaultPrevented()) return;
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
		ry(e) || c && (m.current ? a(e, {
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
		ry(e) || c && !m.current && (a(e, {
			open: !0,
			keyboard: !1,
			type: "menuTriggerMouseMove",
			event: e
		}), m.current = !0);
	}, w = (e) => {
		ry(e) || c && a(e, {
			open: !1,
			keyboard: !1,
			type: "menuTriggerMouseLeave",
			event: e
		});
	}, T = {
		id: s,
		..._?.props,
		ref: Ai(i, Vi(_), v),
		onMouseEnter: F(_?.props.onMouseEnter ?? ey),
		onMouseLeave: F(Hi(_?.props.onMouseLeave, w)),
		onContextMenu: F(Hi(_?.props.onContextMenu, y)),
		onMouseMove: F(Hi(_?.props.onMouseMove, C)),
		onMouseOver: F(Hi(_?.props.onMouseOver, S))
	}, E = {
		"aria-haspopup": "menu",
		"aria-expanded": !o && !u ? void 0 : o,
		...T,
		onClick: F(Hi(_?.props.onClick, b)),
		onKeyDown: F(Hi(_?.props.onKeyDown, x))
	}, D = Ul(_?.type === "button" || _?.type === "a" ? _.type : "div", E);
	return {
		isSubmenu: u,
		children: Gi(t, l ? T : n ? E : D)
	};
}, ry = (e) => {
	let t = (e) => e.hasAttribute("disabled") || e.hasAttribute("aria-disabled") && e.getAttribute("aria-disabled") === "true";
	return Ui(e.target) && t(e.target) ? !0 : Ui(e.currentTarget) && t(e.currentTarget);
}, iy = (e) => /*#__PURE__*/ M.createElement(L_, { value: e.isSubmenu }, e.children), ay = (e) => iy(ty(e));
ay.displayName = "MenuTrigger", ay.isFluentTriggerComponent = !0;
//#endregion
//#region node_modules/@fluentui/react-radio/lib/contexts/RadioGroupContext.js
var oy = M.createContext(void 0), sy = {};
oy.Provider;
var cy = () => M.useContext(oy) || sy, ly = (e, t) => /*#__PURE__*/ I(oy.Provider, {
	value: t.radioGroup,
	children: /*#__PURE__*/ I(e.root, {})
}), uy = (e, t) => {
	let { layout: n = "vertical", ...r } = e;
	return {
		layout: n,
		...dy(r, t)
	};
}, dy = (e, t) => {
	e = Yh(e);
	let n = ki("radiogroup-"), { name: r = n, value: i, defaultValue: a, disabled: o, onChange: s, required: c } = e;
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
			...nr(Rr("div", e, ["onChange", "name"]), { elementType: "div" }),
			onChange: F((e) => {
				s && Ui(e.target, { constructorName: "HTMLInputElement" }) && e.target.type === "radio" && s(e, { value: e.target.value });
			})
		}
	};
}, fy = { root: "fui-RadioGroup" }, py = /*#__PURE__*/ P({
	root: {
		mc9l5x: "f22iagw",
		Bt984gj: "f6jr5hl"
	},
	vertical: { Beiy3e4: "f1vx9l62" }
}, { d: [
	".f22iagw{display:flex;}",
	".f6jr5hl{align-items:flex-start;}",
	".f1vx9l62{flex-direction:column;}"
] }), my = (e) => {
	let t = py();
	return e.root.className = k(fy.root, t.root, e.layout === "vertical" && t.vertical, e.root.className), e;
}, hy = (e) => {
	let { name: t, value: n, defaultValue: r, disabled: i, layout: a, required: o } = e, s = e.root["aria-describedby"];
	return { radioGroup: M.useMemo(() => ({
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
}, gy = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = uy(e, t), r = hy(n);
	return my(n), si("useRadioGroupStyles_unstable")(n), ly(n, r);
});
gy.displayName = "RadioGroup";
//#endregion
//#region node_modules/@fluentui/react-radio/lib/components/Radio/renderRadio.js
var _y = (e) => /*#__PURE__*/ aa(e.root, { children: [
	/*#__PURE__*/ I(e.input, {}),
	/*#__PURE__*/ I(e.indicator, {}),
	e.label && /*#__PURE__*/ I(e.label, {})
] }), vy = (e, t) => {
	let n = yy(e, t);
	return {
		...n,
		components: {
			...n.components,
			label: ig
		},
		label: rr(e.label, {
			defaultProps: { ...n.label },
			elementType: ig
		})
	};
}, yy = (e, t) => {
	let n = cy(), { name: r = n.name, checked: i = n.value === void 0 ? void 0 : n.value === e.value, defaultChecked: a = n.defaultValue === void 0 ? void 0 : n.defaultValue === e.value, labelPosition: o = n.layout === "horizontal-stacked" ? "below" : "after", disabled: s = n.disabled, required: c = n.required, "aria-describedby": l = n["aria-describedby"], onChange: u } = e, d = Lr({
		props: e,
		primarySlotTagName: "input",
		excludedPropNames: [
			"checked",
			"defaultChecked",
			"onChange"
		]
	}), f = nr(e.root, {
		defaultProps: {
			ref: Ks(),
			...d.root
		},
		elementType: "span"
	}), p = nr(e.input, {
		defaultProps: {
			ref: t,
			type: "radio",
			id: ki("radio-", d.primary.id),
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
	return p.onChange = Hi(p.onChange, (e) => u?.(e, { value: e.currentTarget.value })), {
		labelPosition: o,
		components: {
			root: "span",
			input: "input",
			label: "label",
			indicator: "div"
		},
		root: f,
		input: p,
		label: rr(e.label, {
			defaultProps: {
				htmlFor: p.id,
				disabled: p.disabled
			},
			elementType: "label"
		}),
		indicator: nr(e.indicator, {
			defaultProps: { "aria-hidden": !0 },
			elementType: "div"
		})
	};
}, by = {
	root: "fui-Radio",
	indicator: "fui-Radio__indicator",
	input: "fui-Radio__input",
	label: "fui-Radio__label"
}, xy = /*#__PURE__*/ Yn("r1siqwd8", "rmnplyc", {
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
}), Sy = /*#__PURE__*/ P({ vertical: {
	Beiy3e4: "f1vx9l62",
	Bt984gj: "f122n59"
} }, { d: [".f1vx9l62{flex-direction:column;}", ".f122n59{align-items:center;}"] }), Cy = /*#__PURE__*/ Yn("rg1upok", "rzwdzb4", {
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
}), wy = /*#__PURE__*/ P({
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
] }), Ty = /*#__PURE__*/ Yn("rwtekvw", null, [".rwtekvw{position:relative;width:16px;height:16px;font-size:12px;box-sizing:border-box;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border:var(--strokeWidthThin) solid;border-radius:var(--borderRadiusCircular);margin:var(--spacingVerticalS) var(--spacingHorizontalS);fill:currentColor;pointer-events:none;}", ".rwtekvw::after{position:absolute;width:16px;height:16px;border-radius:var(--borderRadiusCircular);transform:scale(0.625);background-color:currentColor;}"]), Ey = /*#__PURE__*/ P({
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
] }), Dy = (e) => {
	let { labelPosition: t } = e, n = xy(), r = Sy();
	e.root.className = k(by.root, n, t === "below" && r.vertical, e.root.className);
	let i = Cy(), a = wy();
	e.input.className = k(by.input, i, t === "below" && a.below, e.indicator.children ? a.customIndicator : a.defaultIndicator, e.input.className);
	let o = Ty();
	e.indicator.className = k(by.indicator, o, e.indicator.className);
	let s = Ey();
	return e.label && (e.label.className = k(by.label, s.base, s[t], e.label.className)), e;
}, Oy = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = vy(e, t);
	return Dy(n), si("useRadioStyles_unstable")(n), _y(n);
});
Oy.displayName = "Radio";
//#endregion
//#region node_modules/@fluentui/react-tabs/lib/components/TabList/useTabList.js
var ky = (e, t) => {
	let { appearance: n = "transparent", reserveSelectedTabSpace: r = !0, size: i = "medium" } = e, a = Ay(e, t), o = jy({ vertical: a.vertical });
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
}, Ay = (e, t) => {
	let { disabled: n = !1, onTabSelect: r, selectTabOnFocus: i = !1, vertical: a = !1, selectedValue: o, defaultSelectedValue: s, ...c } = e, l = M.useRef(null), [u, d] = gi({
		state: o,
		defaultState: s,
		initialState: void 0
	}), f = M.useRef(void 0), p = M.useRef(void 0);
	M.useEffect(() => {
		p.current = f.current, f.current = u;
	}, [u]);
	let m = F((e, t) => {
		d(t.value), r?.(e, t);
	}), h = M.useRef({}), g = F((e) => {
		let t = JSON.stringify(e.value);
		h.current[t] = e;
	}), _ = F((e) => {
		delete h.current[JSON.stringify(e.value)];
	}), v = M.useCallback(() => ({
		selectedValue: f.current,
		previousSelectedValue: p.current,
		registeredTabs: h.current
	}), []);
	return {
		components: { root: "div" },
		root: nr({
			ref: Ai(t, l),
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
}, jy = ({ vertical: e }) => _s({
	circular: !0,
	axis: e ? "vertical" : "horizontal",
	memorizeCurrent: !1,
	unstable_hasDefault: !0
}), My = {
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
}, Ny = Rl(void 0), Py = Ny.Provider, Fy = (e) => zl(Ny, (t = My) => e(t)), Iy = (e, t) => /*#__PURE__*/ I(e.root, { children: /*#__PURE__*/ I(Py, {
	value: t.tabList,
	children: e.root.children
}) }), Ly = { root: "fui-TabList" }, Ry = /*#__PURE__*/ P({
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
] }), zy = (e) => {
	let { appearance: t, vertical: n, size: r } = e, i = Ry(), a = t === "subtle-circular" || t === "filled-circular";
	return e.root.className = k(Ly.root, i.root, n ? i.vertical : i.horizontal, a && (r === "small" ? i.roundedSmall : i.rounded), e.root.className), e;
};
//#endregion
//#region node_modules/@fluentui/react-tabs/lib/components/TabList/useTabListContextValues.js
function By(e) {
	let { appearance: t, reserveSelectedTabSpace: n, disabled: r, selectTabOnFocus: i, selectedValue: a, onRegister: o, onUnregister: s, onSelect: c, getRegisteredTabs: l, size: u, vertical: d } = e;
	return { tabList: M.useMemo(() => ({
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
var Vy = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = ky(e, t), r = By(n);
	return zy(n), si("useTabListStyles_unstable")(n), Iy(n, r);
});
Vy.displayName = "TabList";
//#endregion
//#region node_modules/@fluentui/react-tabs/lib/components/Tab/useTab.js
var Hy = (e, t) => {
	let { content: n } = e, r = Uy(e, t), i = Wy(r), a = Fy((e) => e.appearance), o = Fy((e) => e.reserveSelectedTabSpace), s = Fy((e) => e.size ?? "medium"), c = n && typeof n == "object" ? zr(n, ["ref"]) : n;
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
		contentReservedSpace: rr(c, {
			renderByDefault: !r.selected && !r.iconOnly && o,
			defaultProps: { children: e.children },
			elementType: "span"
		}),
		appearance: a,
		size: s
	};
}, Uy = (e, t) => {
	let { content: n, disabled: r = !1, icon: i, onClick: a, onFocus: o, value: s, ...c } = e, l = Fy((e) => e.selectTabOnFocus), u = Fy((e) => e.disabled), d = Fy((e) => e.selectedValue === s), f = Fy((e) => e.onRegister), p = Fy((e) => e.onUnregister), m = Fy((e) => e.onSelect), h = Fy((e) => !!e.vertical), g = u || r, _ = M.useRef(null), v = (e) => m(e, { value: s }), y = F(Hi(a, v)), b = F(Hi(o, v));
	M.useEffect(() => (f({
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
	let x = rr(i, { elementType: "span" }), S = nr(n, {
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
		root: nr({
			ref: Ai(t, _),
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
}, Wy = ({ selected: e }) => gs({ focusable: { isDefault: e } }), Gy = (e) => /*#__PURE__*/ aa(e.root, { children: [
	e.icon && /*#__PURE__*/ I(e.icon, {}),
	!e.iconOnly && /*#__PURE__*/ I(e.content, {}),
	e.contentReservedSpace && /*#__PURE__*/ I(e.contentReservedSpace, {})
] }), Ky = {
	offsetVar: "--fui-Tab__indicator--offset",
	scaleVar: "--fui-Tab__indicator--scale"
}, qy = /*#__PURE__*/ P({
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
}), Jy = (e) => {
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
}, Yy = (e, t) => {
	let n = Xy(t) ? e[JSON.stringify(t)]?.ref.current : void 0;
	return n ? Jy(n) : void 0;
}, Xy = (e) => e != null, Zy = (e) => {
	let { disabled: t, selected: n, vertical: r } = e, i = qy(), [a, o] = M.useState(), [s, c] = M.useState({
		offset: 0,
		scale: 1
	}), l = Fy((e) => e.getRegisteredTabs), [u] = mi();
	if (n) {
		let { previousSelectedValue: e, selectedValue: t, registeredTabs: n } = l();
		if (Xy(e) && a !== e) {
			let i = Yy(n, e), a = Yy(n, t);
			a && i && (c({
				offset: r ? i.y - a.y : i.x - a.x,
				scale: r ? i.height / a.height : i.width / a.width
			}), o(e), u(() => c({
				offset: 0,
				scale: 1
			})));
		}
	} else Xy(a) && o(void 0);
	if (t) return e;
	let d = s.offset === 0 && s.scale === 1;
	e.root.className = k(e.root.className, n && i.base, n && d && i.animated, n && (r ? i.vertical : i.horizontal));
	let f = {
		[Ky.offsetVar]: `${s.offset}px`,
		[Ky.scaleVar]: `${s.scale}`
	};
	return e.root.style = {
		...f,
		...e.root.style
	}, e;
}, Qy = {
	root: "fui-Tab",
	icon: "fui-Tab__icon",
	content: "fui-Tab__content"
}, $y = { content: "fui-Tab__content--reserved-space" }, eb = /*#__PURE__*/ P({
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
] }), tb = /*#__PURE__*/ P({
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
}), nb = /*#__PURE__*/ P({
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
] }), rb = /*#__PURE__*/ P({
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
}), ib = /*#__PURE__*/ P({
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
}), ab = /*#__PURE__*/ P({
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
] }), ob = /*#__PURE__*/ P({
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
] }), sb = (e) => {
	"use no memo";
	return cb(e), lb(e, e.root), ub(e), e;
}, cb = (e) => {
	let t = eb(), n = rb(), r = ib(), { appearance: i, disabled: a, selected: o, size: s, vertical: c } = e, l = [Qy.root, t.root];
	return i !== "subtle-circular" && i !== "filled-circular" && l.push(n.base, s === "small" && (c ? n.smallVertical : n.smallHorizontal), s === "medium" && (c ? n.mediumVertical : n.mediumHorizontal), s === "large" && (c ? n.largeVertical : n.largeHorizontal), a && n.disabled, o && r.base, o && !a && r.selected, o && s === "small" && (c ? r.smallVertical : r.smallHorizontal), o && s === "medium" && (c ? r.mediumVertical : r.mediumHorizontal), o && s === "large" && (c ? r.largeVertical : r.largeHorizontal), o && a && r.disabled), e.root.className = k(...l, e.root.className), Zy(e), e;
}, lb = (e, t) => {
	let n = eb(), r = nb(), i = tb(), { appearance: a, disabled: o, selected: s, size: c, vertical: l } = e, u = a === "subtle-circular", d = a === "filled-circular", f = u || d, p = [
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
	return t.className = k(n.button, l ? n.vertical : n.horizontal, c === "small" && (l ? n.smallVertical : n.smallHorizontal), c === "medium" && (l ? n.mediumVertical : n.mediumHorizontal), c === "large" && (l ? n.largeVertical : n.largeHorizontal), ...f ? p : m, o && n.disabledCursor, t.className), e;
}, ub = (e) => {
	let t = ab(), n = ob(), { selected: r, size: i } = e;
	return e.icon && (e.icon.className = k(Qy.icon, t.base, t[i], r && t.selected, e.icon.className)), e.contentReservedSpace && (e.contentReservedSpace.className = k($y.content, n.base, i === "large" ? n.largeSelected : n.selected, e.icon ? n.iconBefore : n.noIconBefore, n.placeholder, e.content.className), e.contentReservedSpaceClassName = e.contentReservedSpace.className), e.content.className = k(Qy.content, n.base, i === "large" && n.large, r && (i === "large" ? n.largeSelected : n.selected), e.icon ? n.iconBefore : n.noIconBefore, e.content.className), e;
}, db = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = Hy(e, t);
	return sb(n), si("useTabStyles_unstable")(n), Gy(n);
});
db.displayName = "Tab";
//#endregion
//#region node_modules/@fluentui/react-text/lib/components/Text/useText.js
var fb = (e, t) => {
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
		root: nr(Rr("span", {
			ref: t,
			...e
		}), { elementType: "span" })
	};
}, pb = (e) => /*#__PURE__*/ I(e.root, {}), mb = { root: "fui-Text" }, hb = /*#__PURE__*/ P({
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
] }), gb = (e) => {
	let t = hb();
	return e.root.className = k(mb.root, t.root, e.wrap === !1 && t.nowrap, e.truncate && t.truncate, e.block && t.block, e.italic && t.italic, e.underline && t.underline, e.strikethrough && t.strikethrough, e.underline && e.strikethrough && t.strikethroughUnderline, e.size === 100 && t.base100, e.size === 200 && t.base200, e.size === 400 && t.base400, e.size === 500 && t.base500, e.size === 600 && t.base600, e.size === 700 && t.hero700, e.size === 800 && t.hero800, e.size === 900 && t.hero900, e.size === 1e3 && t.hero1000, e.font === "monospace" && t.monospace, e.font === "numeric" && t.numeric, e.weight === "medium" && t.weightMedium, e.weight === "semibold" && t.weightSemibold, e.weight === "bold" && t.weightBold, e.align === "center" && t.alignCenter, e.align === "end" && t.alignEnd, e.align === "justify" && t.alignJustify, e.root.className), e;
}, Z = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = fb(e, t);
	return gb(n), si("useTextStyles_unstable")(n), pb(n);
});
Z.displayName = "Text";
//#endregion
//#region node_modules/@fluentui/react-textarea/lib/components/Textarea/renderTextarea.js
var _b = (e) => /*#__PURE__*/ I(e.root, { children: /*#__PURE__*/ I(e.textarea, {}) }), vb = (e, t) => {
	let n = ri(), r = qh(), { size: i = r?.size ?? "medium", appearance: a = n.inputDefaultAppearance ?? "outline", ...o } = e;
	return {
		...yb(o, t),
		size: i,
		appearance: a
	};
}, yb = (e, t) => {
	e = Yh(e, {
		supportsLabelFor: !0,
		supportsRequired: !0
	});
	let { resize: n = "none", onChange: r } = e, [i, a] = gi({
		state: e.value,
		defaultState: e.defaultValue,
		initialState: void 0
	}), o = Lr({
		props: e,
		primarySlotTagName: "textarea",
		excludedPropNames: [
			"onChange",
			"value",
			"defaultValue"
		]
	}), s = {
		resize: n,
		components: {
			root: "span",
			textarea: "textarea"
		},
		textarea: nr(e.textarea, {
			defaultProps: {
				ref: t,
				...o.primary
			},
			elementType: "textarea"
		}),
		root: nr(e.root, {
			defaultProps: o.root,
			elementType: "span"
		})
	};
	return s.textarea.value = i, s.textarea.onChange = F((e) => {
		let t = e.target.value;
		r?.(e, { value: t }), a(t);
	}), s;
}, bb = {
	root: "fui-Textarea",
	textarea: "fui-Textarea__textarea"
}, xb = /*#__PURE__*/ P({
	base: {
		mc9l5x: "ftuwxu6",
		B7ck84d: "f1ewtqcl",
		qhf8xq: "f10pi13n",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1yiegib",
		jrapky: 0,
		Frg6f3: 0,
		t21cq0: 0,
		B6of3ja: 0,
		B74szlk: "f1s184ao",
		Beyfa6y: 0,
		Bbmb7ep: 0,
		Btl43ni: 0,
		B7oj6ja: 0,
		Dimara: "ft85np5",
		ha4doy: "f12kltsn"
	},
	disabled: {
		De3pzq: "f1c21dwh",
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
		irswps: "ff3nzm7",
		Bcq6wej: "f9dbb4x",
		Jcjdmf: ["f3qs60o", "f5u9ap2"],
		sc4o1m: "fwd1oij",
		Bosien3: ["f5u9ap2", "f3qs60o"]
	},
	interactive: {
		li1rpt: "f1gw3sf2",
		Bsft5z2: "f13zj6fq",
		E3zdtr: "f1mdlcz9",
		Eqx8gd: ["f1a7op3", "f1cjjd47"],
		By385i5: "f1gboi2j",
		B1piin3: ["f1cjjd47", "f1a7op3"],
		Dlnsje: "ffyw7fx",
		d9w3h3: ["f1kp91vd", "f1ibwz09"],
		B3778ie: ["f1ibwz09", "f1kp91vd"],
		B1q35kw: 0,
		Bw17bha: 0,
		Bcgy8vk: 0,
		Bjuhk93: "f1mnjydx",
		Gjdm7m: "fj2g8qd",
		b1kco5: "f1yk9hq",
		Ba2ppi3: "fhwpy7i",
		F2fol1: "f14ee0xe",
		lck23g: "f1xhbsuh",
		wi16st: "fsrmcvb",
		ywj3b2: "f1t3k7v9",
		umuwi5: "fjw5xc1",
		Blcqepd: "f1xdyd5c",
		nplu4u: "fatpbeo",
		Bioka5o: "fb7uyps",
		Bnupc0a: "fx04xgm",
		bing71: "f1c7in40",
		Bercvud: "f1ibeo51",
		Bbr2w1p: "f1vnc8sk",
		Bduesf4: "f3e99gv",
		Bpq79vn: "fhljsf7"
	},
	filled: {
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
		irswps: "f88035w",
		q7v0qe: "ftmjh5b",
		kmh5ft: ["f17blpuu", "fsrcdbj"],
		nagaa4: "f1tpwn32",
		B1yhkcb: ["fsrcdbj", "f17blpuu"]
	},
	"filled-darker": { De3pzq: "f16xq7d1" },
	"filled-lighter": { De3pzq: "fxugw4r" },
	"filled-darker-shadow": {
		De3pzq: "f16xq7d1",
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
		irswps: "f1gmd7mu",
		E5pizo: "fyed02w"
	},
	"filled-lighter-shadow": {
		De3pzq: "fxugw4r",
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
		irswps: "f1gmd7mu",
		E5pizo: "fyed02w"
	},
	outline: {
		De3pzq: "fxugw4r",
		Bgfg5da: 0,
		B9xav0g: "f1c1zstj",
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
		irswps: "fhz96rm"
	},
	outlineInteractive: {
		kzujx5: 0,
		oetu4i: "f1l4zc64",
		gvrnp0: 0,
		xv9156: 0,
		jek2p4: 0,
		gg5e9n: 0,
		Beu9t3s: 0,
		dt87k2: 0,
		Bt1vbvt: 0,
		Bwzppfd: 0,
		Bop6t4b: 0,
		B2zwrfe: 0,
		Bwp2tzp: 0,
		Bgoe8wy: 0,
		Bf40cpq: 0,
		ckks6v: 0,
		Baalond: "f9mts5e",
		v2iqwr: 0,
		wmxk5l: "f1z0osm6",
		Bj33j0h: 0,
		Bs0cc2w: 0,
		qwjtx1: 0,
		B50zh58: 0,
		f7epvg: 0,
		e1hlit: 0,
		B7mkhst: 0,
		ak43y8: 0,
		Bbcopvn: 0,
		Bvecx4l: 0,
		lwioe0: 0,
		B6oc9vd: 0,
		e2sjt0: 0,
		uqwnxt: 0,
		asj8p9: "f1acnei2",
		Br8fjdy: 0,
		zoxjo1: "f1so894s",
		Bt3ojkv: 0,
		B7pmvfx: 0,
		Bfht2n1: 0,
		an54nd: 0,
		t1ykpo: 0,
		Belqbek: 0,
		bbt1vd: 0,
		Brahy3i: 0,
		r7b1zc: 0,
		rexu52: 0,
		ovtnii: 0,
		Bvq3b66: 0,
		Bawrxx6: 0,
		Bbs6y8j: 0,
		B2qpgjt: "f19ezbcq"
	},
	invalid: {
		tvckwq: "fs4k3qj",
		gk2u95: ["fcee079", "fmyw78r"],
		hhx65j: "f1fgmyf4",
		Bxowmz0: ["fmyw78r", "fcee079"]
	}
}, {
	d: [
		".ftuwxu6{display:inline-flex;}",
		".f1ewtqcl{box-sizing:border-box;}",
		".f10pi13n{position:relative;}",
		[".f1yiegib{padding:0 0 var(--strokeWidthThick) 0;}", { p: -1 }],
		[".f1s184ao{margin:0;}", { p: -1 }],
		[".ft85np5{border-radius:var(--borderRadiusMedium);}", { p: -1 }],
		".f12kltsn{vertical-align:top;}",
		".f1c21dwh{background-color:var(--colorTransparentBackground);}",
		[".ff3nzm7{border:var(--strokeWidthThin) solid var(--colorNeutralStrokeDisabled);}", { p: -2 }],
		".f1gw3sf2::after{box-sizing:border-box;}",
		".f13zj6fq::after{content:\"\";}",
		".f1mdlcz9::after{position:absolute;}",
		".f1a7op3::after{left:-1px;}",
		".f1cjjd47::after{right:-1px;}",
		".f1gboi2j::after{bottom:-1px;}",
		".ffyw7fx::after{height:max(var(--strokeWidthThick), var(--borderRadiusMedium));}",
		".f1kp91vd::after{border-bottom-left-radius:var(--borderRadiusMedium);}",
		".f1ibwz09::after{border-bottom-right-radius:var(--borderRadiusMedium);}",
		[".f1mnjydx::after{border-bottom:var(--strokeWidthThick) solid var(--colorCompoundBrandStroke);}", { p: -1 }],
		".fj2g8qd::after{clip-path:inset(calc(100% - var(--strokeWidthThick)) 0 0 0);}",
		".f1yk9hq::after{transform:scaleX(0);}",
		".fhwpy7i::after{transition-property:transform;}",
		".f14ee0xe::after{transition-duration:var(--durationUltraFast);}",
		".f1xhbsuh::after{transition-delay:var(--curveAccelerateMid);}",
		[".f88035w{border:var(--strokeWidthThin) solid var(--colorTransparentStroke);}", { p: -2 }],
		".f16xq7d1{background-color:var(--colorNeutralBackground3);}",
		".fxugw4r{background-color:var(--colorNeutralBackground1);}",
		[".f1gmd7mu{border:var(--strokeWidthThin) solid var(--colorTransparentStrokeInteractive);}", { p: -2 }],
		".fyed02w{box-shadow:var(--shadow2);}",
		[".f1gmd7mu{border:var(--strokeWidthThin) solid var(--colorTransparentStrokeInteractive);}", { p: -2 }],
		[".fhz96rm{border:var(--strokeWidthThin) solid var(--colorNeutralStroke1);}", { p: -2 }],
		".f1c1zstj{border-bottom-color:var(--colorNeutralStrokeAccessible);}",
		".fs4k3qj:not(:focus-within),.fs4k3qj:hover:not(:focus-within){border-top-color:var(--colorPaletteRedBorder2);}",
		".fcee079:not(:focus-within),.fcee079:hover:not(:focus-within){border-right-color:var(--colorPaletteRedBorder2);}",
		".fmyw78r:not(:focus-within),.fmyw78r:hover:not(:focus-within){border-left-color:var(--colorPaletteRedBorder2);}",
		".f1fgmyf4:not(:focus-within),.f1fgmyf4:hover:not(:focus-within){border-bottom-color:var(--colorPaletteRedBorder2);}"
	],
	m: [
		["@media (forced-colors: active){.f9dbb4x{border-top-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.f3qs60o{border-right-color:GrayText;}.f5u9ap2{border-left-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media (forced-colors: active){.fwd1oij{border-bottom-color:GrayText;}}", { m: "(forced-colors: active)" }],
		["@media screen and (prefers-reduced-motion: reduce){.fsrmcvb::after{transition-duration:0.01ms;}}", { m: "screen and (prefers-reduced-motion: reduce)" }],
		["@media screen and (prefers-reduced-motion: reduce){.f1t3k7v9::after{transition-delay:0.01ms;}}", { m: "screen and (prefers-reduced-motion: reduce)" }],
		["@media screen and (prefers-reduced-motion: reduce){.fx04xgm:focus-within::after{transition-duration:0.01ms;}}", { m: "screen and (prefers-reduced-motion: reduce)" }],
		["@media screen and (prefers-reduced-motion: reduce){.f1c7in40:focus-within::after{transition-delay:0.01ms;}}", { m: "screen and (prefers-reduced-motion: reduce)" }]
	],
	w: [
		".fjw5xc1:focus-within::after{transform:scaleX(1);}",
		".f1xdyd5c:focus-within::after{transition-property:transform;}",
		".fatpbeo:focus-within::after{transition-duration:var(--durationNormal);}",
		".fb7uyps:focus-within::after{transition-delay:var(--curveDecelerateMid);}",
		".f1ibeo51:focus-within:active::after{border-bottom-color:var(--colorCompoundBrandStrokePressed);}",
		".f1vnc8sk:focus-within{outline-width:var(--strokeWidthThick);}",
		".f3e99gv:focus-within{outline-style:solid;}",
		".fhljsf7:focus-within{outline-color:transparent;}",
		[".f19ezbcq:focus-within{border:var(--strokeWidthThin) solid var(--colorNeutralStroke1Pressed);}", { p: -2 }],
		".f1so894s:focus-within{border-bottom-color:var(--colorCompoundBrandStroke);}"
	],
	h: [
		".ftmjh5b:hover,.ftmjh5b:focus-within{border-top-color:var(--colorTransparentStrokeInteractive);}",
		".f17blpuu:hover,.f17blpuu:focus-within{border-right-color:var(--colorTransparentStrokeInteractive);}",
		".fsrcdbj:hover,.fsrcdbj:focus-within{border-left-color:var(--colorTransparentStrokeInteractive);}",
		".f1tpwn32:hover,.f1tpwn32:focus-within{border-bottom-color:var(--colorTransparentStrokeInteractive);}",
		[".f9mts5e:hover{border:var(--strokeWidthThin) solid var(--colorNeutralStroke1Hover);}", { p: -2 }],
		".f1l4zc64:hover{border-bottom-color:var(--colorNeutralStrokeAccessibleHover);}"
	],
	a: [[".f1acnei2:active{border:var(--strokeWidthThin) solid var(--colorNeutralStroke1Pressed);}", { p: -2 }], ".f1z0osm6:active{border-bottom-color:var(--colorNeutralStrokeAccessiblePressed);}"]
}), Sb = /*#__PURE__*/ P({
	base: {
		icvyot: "f1ern45e",
		vrafjx: ["f1n71otn", "f1deefiw"],
		oivjwe: "f1h8hb77",
		wvpqe5: ["f1deefiw", "f1n71otn"],
		jrapky: 0,
		Frg6f3: 0,
		t21cq0: 0,
		B6of3ja: 0,
		B74szlk: "f1s184ao",
		De3pzq: "f3rmtva",
		B7ck84d: "f1ewtqcl",
		sj55zd: "f19n0e5",
		Bh6795r: "fqerorx",
		Bahqtrf: "fk6fouc",
		Bqenvij: "f1l02sjl",
		yvdlaj: "fwyc1cq",
		B3o7kgh: "f13ta7ih",
		oeaueh: "f1s6fcnf"
	},
	disabled: {
		sj55zd: "f1s2aq7o",
		Bceei9c: "fdrzuqr",
		yvdlaj: "fahhnxm"
	},
	small: {
		sshi5w: "f1w5jphr",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1pnffij",
		Bxyxcbc: "f192z54u",
		Bahqtrf: "fk6fouc",
		Be2twd7: "fy9rknc",
		Bhrd7zp: "figsok6",
		Bg96gwp: "fwrc4pm"
	},
	medium: {
		sshi5w: "fvmd9f",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f1ww82xo",
		Bxyxcbc: "f1if7ixc",
		Bahqtrf: "fk6fouc",
		Be2twd7: "fkhj508",
		Bhrd7zp: "figsok6",
		Bg96gwp: "f1i3iumi"
	},
	large: {
		sshi5w: "f1kfson",
		Byoj8tv: 0,
		uwmqm3: 0,
		z189sj: 0,
		z8tnut: 0,
		B0ocmuz: "f15hvtkj",
		Bxyxcbc: "f3kip1f",
		Bahqtrf: "fk6fouc",
		Be2twd7: "fod5ikn",
		Bhrd7zp: "figsok6",
		Bg96gwp: "faaz57k"
	}
}, { d: [
	".f1ern45e{border-top-style:none;}",
	".f1n71otn{border-right-style:none;}",
	".f1deefiw{border-left-style:none;}",
	".f1h8hb77{border-bottom-style:none;}",
	[".f1s184ao{margin:0;}", { p: -1 }],
	".f3rmtva{background-color:transparent;}",
	".f1ewtqcl{box-sizing:border-box;}",
	".f19n0e5{color:var(--colorNeutralForeground1);}",
	".fqerorx{flex-grow:1;}",
	".fk6fouc{font-family:var(--fontFamilyBase);}",
	".f1l02sjl{height:100%;}",
	".fwyc1cq::-webkit-input-placeholder{color:var(--colorNeutralForeground4);}",
	".fwyc1cq::-moz-placeholder{color:var(--colorNeutralForeground4);}",
	".f13ta7ih::-webkit-input-placeholder{opacity:1;}",
	".f13ta7ih::-moz-placeholder{opacity:1;}",
	".f1s6fcnf{outline-style:none;}",
	".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
	".fdrzuqr{cursor:not-allowed;}",
	".fahhnxm::-webkit-input-placeholder{color:var(--colorNeutralForegroundDisabled);}",
	".fahhnxm::-moz-placeholder{color:var(--colorNeutralForegroundDisabled);}",
	".f1w5jphr{min-height:40px;}",
	[".f1pnffij{padding:var(--spacingVerticalXS) calc(var(--spacingHorizontalSNudge) + var(--spacingHorizontalXXS));}", { p: -1 }],
	".f192z54u{max-height:200px;}",
	".fy9rknc{font-size:var(--fontSizeBase200);}",
	".figsok6{font-weight:var(--fontWeightRegular);}",
	".fwrc4pm{line-height:var(--lineHeightBase200);}",
	".fvmd9f{min-height:52px;}",
	[".f1ww82xo{padding:var(--spacingVerticalSNudge) calc(var(--spacingHorizontalMNudge) + var(--spacingHorizontalXXS));}", { p: -1 }],
	".f1if7ixc{max-height:260px;}",
	".fkhj508{font-size:var(--fontSizeBase300);}",
	".f1i3iumi{line-height:var(--lineHeightBase300);}",
	".f1kfson{min-height:64px;}",
	[".f15hvtkj{padding:var(--spacingVerticalS) calc(var(--spacingHorizontalM) + var(--spacingHorizontalXXS));}", { p: -1 }],
	".f3kip1f{max-height:320px;}",
	".fod5ikn{font-size:var(--fontSizeBase400);}",
	".faaz57k{line-height:var(--lineHeightBase400);}"
] }), Cb = /*#__PURE__*/ P({
	none: { B3rzk8w: "f1o1s39h" },
	both: { B3rzk8w: "f1pxm0xe" },
	horizontal: { B3rzk8w: "fq6nmtn" },
	vertical: { B3rzk8w: "f1f5ktr4" }
}, { d: [
	".f1o1s39h{resize:none;}",
	".f1pxm0xe{resize:both;}",
	".fq6nmtn{resize:horizontal;}",
	".f1f5ktr4{resize:vertical;}"
] }), wb = (e) => {
	let { size: t, appearance: n, resize: r } = e, i = e.textarea.disabled, a = `${e.textarea["aria-invalid"]}` == "true", o = n.startsWith("filled"), s = xb();
	e.root.className = k(bb.root, s.base, i && s.disabled, !i && o && s.filled, !i && s[n], !i && s.interactive, !i && n === "outline" && s.outlineInteractive, !i && a && s.invalid, e.root.className);
	let c = Sb(), l = Cb();
	return e.textarea.className = k(bb.textarea, c.base, c[t], l[r], i && c.disabled, e.textarea.className), e;
}, Tb = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = vb(e, t);
	return wb(n), si("useTextareaStyles_unstable")(n), _b(n);
});
Tb.displayName = "Textarea";
//#endregion
//#region node_modules/@fluentui/react-progress/lib/utils/clampMax.js
var Eb = (e) => e <= 0 ? 1 : e, Db = (e, t) => e === void 0 ? e : e < 0 ? 0 : e > t ? t : e, Ob = wd({
	keyframes: [{ translate: "-100%" }, { translate: "300%" }],
	duration: 3e3,
	iterations: Infinity,
	easing: q.curveLinear,
	reducedMotion: {
		keyframes: [
			{ opacity: .2 },
			{ opacity: 1 },
			{ opacity: .2 }
		],
		duration: 3e3,
		iterations: Infinity
	}
}), kb = (e, t) => {
	let n = qh()?.validationState, { color: r = n === "error" || n === "warning" || n === "success" ? n : "brand", shape: i = "rounded", thickness: a = "medium", indeterminateMotion: o, ...s } = e, c = Ab(s, t);
	return {
		...c,
		components: {
			...c.components,
			indeterminateMotion: Ob
		},
		color: r,
		shape: i,
		thickness: a,
		indeterminateMotion: c.value === void 0 ? zd(o, {
			elementType: Ob,
			defaultProps: {}
		}) : void 0
	};
}, Ab = (e, t) => {
	let n = qh(), r = Eb(e.max ?? 1), i = Db(e.value, r), a = nr(Rr("div", {
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
		bar: nr(e.bar, { elementType: "div" })
	};
}, jb = (e) => /*#__PURE__*/ I(e.root, { children: e.bar && (e.indeterminateMotion ? /*#__PURE__*/ I(e.indeterminateMotion, { children: /*#__PURE__*/ I(e.bar, {}) }) : /*#__PURE__*/ I(e.bar, {})) }), Mb = {
	root: "fui-ProgressBar",
	bar: "fui-ProgressBar__bar"
}, Nb = .01, Pb = /*#__PURE__*/ P({
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
}), Fb = /*#__PURE__*/ P({
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
}), Ib = (e) => {
	let { color: t, max: n, shape: r, thickness: i, value: a } = e, o = Pb(), s = Fb();
	return e.root.className = k(Mb.root, o.root, o[r], o[i], e.root.className), e.bar && (e.bar.className = k(Mb.bar, s.base, s.brand, a === void 0 && s.indeterminate, a !== void 0 && a > Nb && s.nonZeroDeterminate, t && a !== void 0 && s[t], e.bar.className)), e.bar && a !== void 0 && (e.bar.style = {
		width: Math.min(100, Math.max(0, a / n * 100)) + "%",
		...e.bar.style
	}), e;
}, Lb = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = kb(e, t);
	return Ib(n), si("useProgressBarStyles_unstable")(n), jb(n);
});
Lb.displayName = "ProgressBar";
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBar/getIntentIcon.js
function Rb(e) {
	switch (e) {
		case "info": return /*#__PURE__*/ M.createElement(Su, null);
		case "warning": return /*#__PURE__*/ M.createElement(xu, null);
		case "error": return /*#__PURE__*/ M.createElement(ju, null);
		case "success": return /*#__PURE__*/ M.createElement(Tu, null);
		default: return null;
	}
}
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBar/useMessageBarReflow.js
function zb(e = !1) {
	let { targetDocument: t } = ei(), n = M.useReducer(() => ({}), {})[1], r = M.useRef(!1), i = M.useRef(null), a = M.useRef(Infinity), o = M.useCallback((e) => {
		var t;
		let i = e[0], o = (i == null || (t = i.borderBoxSize) == null ? void 0 : t[0]?.inlineSize) ?? i?.target.getBoundingClientRect().width;
		if (o === void 0 || !i) return;
		let { target: s } = i;
		if (!Ui(s)) return;
		let c;
		if (r.current) o >= a.current && (c = !1);
		else {
			let e = s.scrollWidth;
			o < e && (c = !0, a.current = e);
		}
		c !== void 0 && r.current !== c && (r.current = c, n());
	}, [n]), s = M.useCallback((n) => {
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
	return M.useEffect(() => () => {
		var e;
		(e = i.current) == null || e.disconnect();
	}, []), {
		ref: s,
		reflowing: r.current
	};
}
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/contexts/messageBarTransitionContext.js
var Bb = M.createContext(void 0), Vb = {
	className: "",
	nodeRef: M.createRef()
};
Bb.Provider;
var Hb = () => M.useContext(Bb) ?? Vb, Ub = (e, t) => {
	let { layout: n = "auto", intent: r = "info", politeness: i } = e, a = i ?? r === "info" ? "polite" : "assertive", o = n === "auto", { ref: s, reflowing: c } = zb(o), l = o ? c ? "multiline" : "singleline" : n, { className: u, nodeRef: d } = Hb(), f = M.useRef(null), p = M.useRef(null), { announce: m } = di(), h = ki();
	return M.useEffect(() => {
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
		root: nr(Rr("div", {
			ref: Ai(t, s, d),
			role: "group",
			"aria-labelledby": h,
			...e
		}), { elementType: "div" }),
		icon: rr(e.icon, {
			renderByDefault: !0,
			elementType: "div"
		}),
		bottomReflowSpacer: rr(e.bottomReflowSpacer, {
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
}, Wb = (e, t) => {
	let { shape: n = "rounded", ...r } = e, i = Ub(r, Ai(t, Ld()));
	return {
		...i,
		shape: n,
		icon: rr(e.icon, {
			defaultProps: { children: Rb(i.intent) },
			renderByDefault: !0,
			elementType: "div"
		})
	};
}, Gb = M.createContext(void 0), Kb = {
	titleId: "",
	layout: "singleline",
	actionsRef: M.createRef(),
	bodyRef: M.createRef()
}, qb = Gb.Provider, Jb = () => M.useContext(Gb) ?? Kb, Yb = (e, t) => /*#__PURE__*/ I(qb, {
	value: t.messageBar,
	children: /*#__PURE__*/ aa(e.root, { children: [
		e.icon && /*#__PURE__*/ I(e.icon, {}),
		e.root.children,
		e.bottomReflowSpacer && /*#__PURE__*/ I(e.bottomReflowSpacer, {})
	] })
}), Xb = {
	root: "fui-MessageBar",
	icon: "fui-MessageBar__icon",
	bottomReflowSpacer: "fui-MessageBar__bottomReflowSpacer"
}, Zb = /*#__PURE__*/ Yn("r2oyxsj", "r1wuyrhw", [".r2oyxsj{white-space:nowrap;display:grid;grid-template-columns:auto 1fr auto auto;grid-template-rows:1fr;grid-template-areas:\"icon body secondaryActions actions\";padding-left:var(--spacingHorizontalM);border:var(--strokeWidthThin) solid var(--colorNeutralStroke1);border-radius:var(--borderRadiusMedium);align-items:center;min-height:36px;box-sizing:border-box;background-color:var(--colorNeutralBackground3);}", ".r1wuyrhw{white-space:nowrap;display:grid;grid-template-columns:auto 1fr auto auto;grid-template-rows:1fr;grid-template-areas:\"icon body secondaryActions actions\";padding-right:var(--spacingHorizontalM);border:var(--strokeWidthThin) solid var(--colorNeutralStroke1);border-radius:var(--borderRadiusMedium);align-items:center;min-height:36px;box-sizing:border-box;background-color:var(--colorNeutralBackground3);}"]), Qb = /*#__PURE__*/ Yn("r1df1z33", "rivnfjc", [".r1df1z33{grid-area:icon;font-size:var(--fontSizeBase500);margin-right:var(--spacingHorizontalS);color:var(--colorNeutralForeground3);display:flex;align-items:center;}", ".rivnfjc{grid-area:icon;font-size:var(--fontSizeBase500);margin-left:var(--spacingHorizontalS);color:var(--colorNeutralForeground3);display:flex;align-items:center;}"]), $b = /*#__PURE__*/ Yn("r1vx593n", null, [".r1vx593n{margin-bottom:var(--spacingVerticalS);grid-area:secondaryActions;}"]), ex = /*#__PURE__*/ P({
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
] }), tx = /*#__PURE__*/ P({
	info: {},
	error: { sj55zd: "f1ca9wz" },
	warning: { sj55zd: "f14a4cve" },
	success: { sj55zd: "f36rra6" }
}, { d: [
	".f1ca9wz{color:var(--colorStatusDangerForeground1);}",
	".f14a4cve{color:var(--colorStatusWarningForeground3);}",
	".f36rra6{color:var(--colorStatusSuccessForeground1);}"
] }), nx = /*#__PURE__*/ P({
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
] }), rx = (e) => {
	let t = Zb(), n = Qb(), r = tx(), i = nx(), a = $b(), o = ex();
	return e.root.className = k(Xb.root, t, e.layout === "multiline" && o.rootMultiline, e.shape === "square" && o.square, i[e.intent], e.root.className), e.icon && (e.icon.className = k(Xb.icon, n, r[e.intent], e.icon.className)), e.bottomReflowSpacer && (e.bottomReflowSpacer.className = k(Xb.bottomReflowSpacer, a)), e;
};
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBar/useMessageBarContextValues.js
function ix(e) {
	let { layout: t, actionsRef: n, bodyRef: r, titleId: i } = e;
	return { messageBar: M.useMemo(() => ({
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
var ax = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = Wb(e, t);
	return rx(n), si("useMessageBarStyles_unstable")(n), Yb(n, ix(n));
});
ax.displayName = "MessageBar";
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarTitle/useMessageBarTitle.js
var ox = (e, t) => {
	let { titleId: n } = Jb();
	return {
		components: { root: "span" },
		root: nr(Rr("span", {
			ref: t,
			id: n,
			...e
		}), { elementType: "span" })
	};
}, sx = (e) => /*#__PURE__*/ I(e.root, {}), cx = { root: "fui-MessageBarTitle" }, lx = /*#__PURE__*/ Yn("r168xkm9", null, [".r168xkm9{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase300);font-weight:var(--fontWeightSemibold);line-height:var(--lineHeightBase300);}", ".r168xkm9::after{content:\" \";}"]), ux = (e) => {
	let t = lx();
	return e.root.className = k(cx.root, t, e.root.className), e;
}, dx = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = ox(e, t);
	return ux(n), si("useMessageBarTitleStyles_unstable")(n), sx(n);
});
dx.displayName = "MessageBarTitle";
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarBody/useMessageBarBody.js
var fx = (e, t) => {
	let { bodyRef: n } = Jb();
	return {
		components: { root: "div" },
		root: nr(Rr("div", {
			ref: Ai(t, n),
			...e
		}), { elementType: "div" })
	};
}, px = (e, t) => /*#__PURE__*/ I(A_, {
	value: t.link,
	children: /*#__PURE__*/ I(e.root, {})
}), mx = { root: "fui-MessageBarBody" }, hx = /*#__PURE__*/ Yn("rtatq2b", "re2rary", [".rtatq2b{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase300);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);grid-area:body;padding-right:var(--spacingHorizontalM);}", ".re2rary{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase300);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);grid-area:body;padding-left:var(--spacingHorizontalM);}"]), gx = (e) => {
	let t = hx();
	return e.root.className = k(mx.root, t, e.root.className), e;
};
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarBody/useMessageBarBodyContextValues.js
function _x(e) {
	return { link: M.useMemo(() => ({ inline: !0 }), []) };
}
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarBody/MessageBarBody.js
var vx = /*#__PURE__*/ M.forwardRef((e, t) => {
	let n = fx(e, t), r = _x(n);
	return gx(n), si("useMessageBarBodyStyles_unstable")(n), px(n, r);
});
vx.displayName = "MessageBarBody";
//#endregion
//#region public/plugins/_shared/theme.js
var yx = _(), bx = {
	background: "colorNeutralBackground1",
	foreground: "colorNeutralForeground1",
	muted: "colorNeutralForeground2",
	accent: "colorBrandBackground"
};
function xx() {
	return (typeof window < "u" && window.matchMedia?.("(prefers-color-scheme: light)"))?.matches ? "light" : "dark";
}
function Sx(e) {
	let t = e && typeof e == "object" ? e : {}, n = t.colorScheme === "light" ? "light" : t.colorScheme === "dark" ? "dark" : xx(), r = n === "light" ? vl : bl, i = {};
	for (let [e, n] of Object.entries(t)) {
		if (typeof n != "string" || !n || e === "colorScheme") continue;
		let t = bx[e];
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
function Cx(e) {
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
var wx = {
	init: null,
	legacyTheme: null,
	started: !1
};
function Tx() {
	wx.started || (wx.started = !0, e.onInit((e) => {
		wx.init ||= e;
	}), window.addEventListener("message", (e) => {
		let t = e.data;
		t && t.type === "wtsl:init" && t.theme && (wx.legacyTheme ||= t.theme);
	}));
}
function Ex(e) {
	return wx.init?.theme ? wx.init.theme : wx.legacyTheme && Cx(wx.legacyTheme) || { colorScheme: e };
}
function Dx(e) {
	let t = wx.init?.config;
	if (t && typeof t == "object") return t[e];
}
var Ox = "(prefers-color-scheme: light)";
function kx() {
	return typeof window > "u" || typeof window.matchMedia != "function" ? "dark" : window.matchMedia(Ox).matches ? "light" : "dark";
}
function Ax(t = "dark") {
	let [n, r] = (0, M.useState)(() => Ex(t)), [i, a] = (0, M.useState)(kx);
	(0, M.useEffect)(() => {
		let t = e.onInit((e) => {
			e && typeof e == "object" && e.theme && typeof e.theme == "object" && r(e.theme);
		}), n = e.onTheme((e) => {
			e && typeof e == "object" && r(e);
		});
		return () => {
			t(), n();
		};
	}, []), (0, M.useEffect)(() => {
		if (e.inHost || typeof window.matchMedia != "function") return;
		let t = window.matchMedia(Ox), n = () => a(t.matches ? "light" : "dark");
		return typeof t.addEventListener == "function" ? (t.addEventListener("change", n), () => t.removeEventListener("change", n)) : (t.addListener(n), () => t.removeListener(n));
	}, []);
	let o = e.inHost ? n : {
		...n,
		colorScheme: i
	}, s = (0, M.useMemo)(() => Sx(o), [o]);
	return (0, M.useEffect)(() => {
		typeof document < "u" && (document.documentElement.style.colorScheme = s.scheme, document.body && (document.body.style.colorScheme = s.scheme));
	}, [s.scheme]), (0, M.useEffect)(() => {
		if (typeof document > "u") return;
		let e = document.documentElement, t = {
			"--wtsl-identity": o.wtslIdentity,
			"--wtsl-identity-border": o.wtslIdentityBorder,
			"--wtsl-identity-surface": o.wtslIdentitySurface
		};
		for (let [n, r] of Object.entries(t)) typeof r == "string" && r ? e.style.setProperty(n, r) : e.style.removeProperty(n);
	}, [
		o.wtslIdentity,
		o.wtslIdentityBorder,
		o.wtslIdentitySurface
	]), s;
}
function jx(t, n) {
	let r = (0, M.useRef)(t);
	r.current = t;
	let [i, a] = (0, M.useState)(() => {
		let e = wx.init?.size;
		return Array.isArray(e) ? r.current(e) : n;
	});
	return (0, M.useEffect)(() => {
		let t = (e) => {
			Array.isArray(e) && e.length === 2 && a(r.current(e));
		}, n = e.onInit((e) => t(e?.size)), i = e.onResize(t);
		return () => {
			n(), i();
		};
	}, []), i;
}
function Mx(e, t) {
	if (e === t) return !0;
	try {
		return JSON.stringify(e) === JSON.stringify(t);
	} catch {
		return !1;
	}
}
function Nx(t, n, r) {
	let i = (0, M.useRef)(r);
	i.current = r;
	let a = (0, M.useRef)(n);
	a.current = n;
	let [o, s] = (0, M.useState)(() => {
		let e = Dx(t);
		return i.current ? i.current(e) : e ?? n;
	}), [c, l] = (0, M.useState)(() => Dx(t) !== void 0), u = (0, M.useRef)(o);
	u.current = o;
	let d = (0, M.useRef)(0), f = (0, M.useRef)(!0);
	(0, M.useEffect)(() => () => {
		f.current = !1;
	}, []);
	let p = (0, M.useCallback)((e) => {
		s(i.current ? i.current(e) : e ?? a.current);
	}, []), m = (0, M.useCallback)(() => {
		let n = ++d.current;
		e.getConfig(t).then((e) => {
			f.current && n === d.current && (p(e), l(!0));
		}).catch(() => {
			f.current && n === d.current && l(!0);
		});
	}, [p, t]);
	return (0, M.useEffect)(() => {
		m();
	}, [m]), (0, M.useEffect)(() => {
		let n = !0, r = e.onConfig?.((e, r) => {
			e === t && (n || (d.current += 1), l(!0), !Mx(r, u.current) && p(r));
		});
		return n = !1, () => {
			r?.();
		};
	}, [p, t]), (0, M.useEffect)(() => {
		let n = `plugin.${e.pluginId}.${t}`, r = (e) => {
			(e.key === null || e.key === n) && m();
		};
		return window.addEventListener("storage", r), () => window.removeEventListener("storage", r);
	}, [t, m]), [
		o,
		(0, M.useCallback)((n) => {
			let r = typeof n == "function" ? n(u.current) : n;
			d.current += 1, u.current = r, s(r), e.setConfig(t, r).catch(() => {});
		}, [t]),
		c
	];
}
function Px() {
	let e = new URLSearchParams(location.search);
	return e.get("view") || (e.get("settings") === "1" ? "settings" : null);
}
function Fx(e, t) {
	window.parent.postMessage({
		type: "plugin:request-overlay",
		payload: {
			view: e,
			title: t
		}
	}, "*");
}
function Ix() {
	window.parent.postMessage({ type: "plugin:request-host-settings" }, "*");
}
var Lx = 500, Rx = 8, zx = [
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
function Bx(e, t) {
	if (!(t instanceof Element)) return !1;
	let n = t.closest(zx);
	return !!(n && n !== e && e.contains(n));
}
function Vx() {
	let t = (0, M.useRef)(null);
	return (0, M.useEffect)(() => {
		let n = t.current;
		if (!n || !e.inHost || Px()) return;
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
			e.button === 0 && (Bx(n, e.target) || r === null && (r = e.pointerId, i = e.clientX, a = e.clientY, s = !1, f("down", e.pointerType), o = window.setTimeout(() => {
				o = 0, s = !0, g(), window.parent.postMessage({ type: "plugin:request-edit-mode" }, "*");
			}, Lx)));
		}, y = (e) => {
			if (d(e.pointerType)) {
				let t = !Bx(n, e.target);
				t !== c && (c = t, f(t ? "hover-enter" : "hover-leave", e.pointerType));
			}
			r !== null && e.pointerId === r && (Math.hypot(e.clientX - i, e.clientY - a) <= Rx || (p(), !s && (r = null, f("cancel", e.pointerType))));
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
typeof window < "u" && Px() && window.addEventListener("keydown", (e) => {
	e.key === "Escape" && (e.preventDefault(), window.parent.postMessage({ type: "plugin:request-overlay-close" }, "*"));
});
function Hx(t, n) {
	let r = (0, M.useRef)(n);
	r.current = n;
	let i = (0, M.useRef)(t);
	(0, M.useEffect)(() => (e.ready(i.current), e.onToolCall(async (t) => {
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
function Ux() {
	e.exitFocus();
}
var Wx = 864e5;
function Q(e) {
	if (e instanceof Date) return Number.isNaN(e.getTime()) ? null : e;
	if (typeof e == "string" && e.trim()) {
		let t = new Date(e);
		return Number.isNaN(t.getTime()) ? null : t;
	}
	return typeof e == "number" && Number.isFinite(e) ? new Date(e) : null;
}
function Gx(e) {
	return String(e).padStart(2, "0");
}
function Kx(e) {
	let t = Q(e);
	return t ? `${t.getFullYear()}-${Gx(t.getMonth() + 1)}-${Gx(t.getDate())}` : "";
}
function qx(e) {
	let t = Q(e) || /* @__PURE__ */ new Date();
	return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0);
}
function Jx(e, t) {
	let n = Q(e) || /* @__PURE__ */ new Date(), r = new Date(n);
	return r.setDate(r.getDate() + t), r;
}
function Yx(e, t) {
	let n = Q(e) || /* @__PURE__ */ new Date(), r = n.getDate(), i = new Date(n);
	i.setDate(1), i.setMonth(i.getMonth() + t);
	let a = new Date(i.getFullYear(), i.getMonth() + 1, 0).getDate();
	return i.setDate(Math.min(r, a)), i;
}
function Xx(e, t) {
	let n = Q(e) || /* @__PURE__ */ new Date(), r = n.getDate(), i = new Date(n);
	i.setDate(1), i.setFullYear(i.getFullYear() + t);
	let a = new Date(i.getFullYear(), i.getMonth() + 1, 0).getDate();
	return i.setDate(Math.min(r, a)), i;
}
function Zx(e, t = 1) {
	let n = qx(e);
	return Jx(n, -((n.getDay() - t + 7) % 7));
}
function Qx(e) {
	let t = Q(e) || /* @__PURE__ */ new Date();
	return new Date(t.getFullYear(), t.getMonth(), 1, 0, 0, 0, 0);
}
function $x(e, t) {
	let n = Q(e), r = Q(t);
	return !n || !r ? !1 : n.getFullYear() === r.getFullYear() && n.getMonth() === r.getMonth() && n.getDate() === r.getDate();
}
function eS(e, t) {
	let n = qx(e), r = qx(t);
	return Math.round((r.getTime() - n.getTime()) / Wx);
}
function tS(e) {
	let t = Q(e);
	return t ? `${Gx(t.getHours())}:${Gx(t.getMinutes())}` : "";
}
function nS(e) {
	let t = Q(e);
	return t ? `${t.getFullYear()}-${Gx(t.getMonth() + 1)}-${Gx(t.getDate())}T${Gx(t.getHours())}:${Gx(t.getMinutes())}` : "";
}
function rS(e, t) {
	if (!e) return null;
	let [n, r, i] = e.split("-").map(Number), a = 23, o = 59;
	if (t) {
		let [e, n] = t.split(":").map(Number);
		Number.isFinite(e) && Number.isFinite(n) && (a = e, o = n);
	}
	return new Date(n, r - 1, i, a, o, 0, 0).toISOString();
}
function iS(e, t = /* @__PURE__ */ new Date()) {
	let n = Q(e);
	if (!n) return "";
	let r = eS(t, n);
	return r === 0 ? "今天" : r === 1 ? "明天" : r === 2 ? "后天" : r === -1 ? "昨天" : n.getFullYear() === t.getFullYear() ? `${n.getMonth() + 1}月${n.getDate()}日` : `${n.getFullYear()}年${n.getMonth() + 1}月${n.getDate()}日`;
}
function aS(e, t = /* @__PURE__ */ new Date()) {
	let n = Q(e);
	if (!n) return "";
	let r = Kx(n), i = Kx(t), a = Kx(Jx(t, 1)), o = n.getHours() !== 23 || n.getMinutes() !== 59;
	if (r < i) {
		let e = eS(n, t);
		return e <= 1 ? "已逾期" : `逾期 ${e} 天`;
	}
	if (r === i) return o ? `今天 ${tS(n)}` : "今天";
	if (r === a) return o ? `明天 ${tS(n)}` : "明天";
	let s = iS(n, t);
	return o ? `${s} ${tS(n)}` : s;
}
var oS = [
	"日",
	"一",
	"二",
	"三",
	"四",
	"五",
	"六"
];
function sS(e = 1) {
	return Array.from({ length: 7 }, (t, n) => oS[(e + n) % 7]);
}
function cS(e) {
	if (e == null || e === "") return null;
	if (typeof e == "string") {
		let t = e.trim();
		if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
			let [e, n, r] = t.split("-").map(Number);
			return new Date(e, n - 1, r, 23, 59, 0, 0).toISOString();
		}
	}
	let t = Q(e);
	return t ? t.toISOString() : null;
}
var lS = [
	{
		value: "daily",
		label: "每天"
	},
	{
		value: "weekly",
		label: "每周"
	},
	{
		value: "monthly",
		label: "每月"
	},
	{
		value: "yearly",
		label: "每年"
	}
];
function uS(e, t) {
	let n = Q(e) || /* @__PURE__ */ new Date();
	switch (t) {
		case "daily": return Jx(n, 1);
		case "weekly": return Jx(n, 7);
		case "monthly": return Yx(n, 1);
		case "yearly": return Xx(n, 1);
		default: return null;
	}
}
var dS = [
	{
		value: 0,
		label: "无",
		short: "无"
	},
	{
		value: 1,
		label: "低",
		short: "低"
	},
	{
		value: 2,
		label: "中",
		short: "中"
	},
	{
		value: 3,
		label: "高",
		short: "高"
	}
];
function fS(e) {
	return dS.find((t) => t.value === e) || dS[0];
}
//#endregion
//#region public/plugins/todo/js/store.js
var pS = {
	lists: "todo.lists",
	tasks: "todo.tasks",
	tags: "todo.tags",
	settings: "todo.settings"
}, mS = [
	{
		value: "manual",
		label: "手动"
	},
	{
		value: "due",
		label: "截止"
	},
	{
		value: "priority",
		label: "优先级"
	},
	{
		value: "created",
		label: "创建时间"
	}
], hS = {
	defaultListId: null,
	showCompleted: !0,
	defaultSort: "manual",
	weekStart: 1,
	reminders: {}
};
function gS() {
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}
function _S(e, t) {
	let n = gS();
	if (!n) return t;
	try {
		let r = n.getItem(e);
		return r === null ? t : JSON.parse(r) ?? t;
	} catch {
		return t;
	}
}
function vS(e, t) {
	let n = gS();
	if (n) try {
		n.setItem(e, JSON.stringify(t));
	} catch (t) {
		console.error("[todo] 保存失败", e, t);
	}
}
function yS() {
	let e = _S(pS.settings, null);
	if (!e || typeof e != "object") return {};
	let t = e.reminders;
	return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : {};
}
function bS(e) {
	let t = Q(e);
	return t ? Math.floor(t.getTime() / 6e4) : null;
}
function xS(e, t) {
	let n = bS(e);
	return n !== null && n === bS(t);
}
function SS() {
	return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
function CS() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
function wS(e) {
	return Number.isInteger(e) && e >= 0 && e <= 3;
}
function TS(e, t) {
	if (!e || typeof e != "object" || typeof e.title != "string") return null;
	let n = Q(e.createdAt)?.toISOString() || CS();
	return {
		id: typeof e.id == "string" && e.id ? e.id : SS(),
		listId: typeof e.listId == "string" && e.listId ? e.listId : t,
		title: e.title,
		note: typeof e.note == "string" && e.note ? e.note : void 0,
		done: !!e.done,
		doneAt: Q(e.doneAt)?.toISOString() || void 0,
		createdAt: n,
		updatedAt: Q(e.updatedAt)?.toISOString() || n,
		order: Number.isFinite(e.order) ? e.order : 0,
		priority: wS(e.priority) ? e.priority : 0,
		dueAt: Q(e.dueAt)?.toISOString() || void 0,
		remindAt: Q(e.remindAt)?.toISOString() || void 0,
		recurrence: lS.some((t) => t.value === e.recurrence) ? e.recurrence : void 0,
		tags: Array.isArray(e.tags) ? e.tags.filter((e) => typeof e == "string" && e.trim()).map((e) => e.trim()) : [],
		subtasks: Array.isArray(e.subtasks) ? e.subtasks.filter((e) => e && typeof e.title == "string").map((e, t) => ({
			id: typeof e.id == "string" && e.id ? e.id : SS(),
			title: e.title,
			done: !!e.done,
			order: Number.isFinite(e.order) ? e.order : t
		})) : []
	};
}
var $ = new class {
	constructor() {
		this.state = {
			lists: [],
			tasks: [],
			tags: [],
			settings: {
				...hS,
				reminders: {}
			}
		}, this.listeners = /* @__PURE__ */ new Set(), this.storageBound = !1;
	}
	load() {
		let e = _S(pS.lists, null), t = Array.isArray(e) && e.length ? e.filter((e) => e && typeof e.name == "string").map((e, t) => ({
			id: typeof e.id == "string" && e.id ? e.id : SS(),
			name: e.name,
			order: Number.isFinite(e.order) ? e.order : t
		})).sort((e, t) => e.order - t.order) : [];
		t.length || t.push({
			id: SS(),
			name: "我的待办",
			order: 0
		});
		let n = new Set(t.map((e) => e.id)), r = t[0].id, i = _S(pS.tasks, []), a = (Array.isArray(i) ? i : []).map((e) => TS(e, r)).filter(Boolean).map((e) => n.has(e.listId) ? e : {
			...e,
			listId: r
		}), o = _S(pS.tags, []), s = Array.isArray(o) ? o.filter((e) => typeof e == "string") : [], c = _S(pS.settings, {}), l = {
			...hS,
			...c && typeof c == "object" ? c : {}
		};
		return (!l.reminders || typeof l.reminders != "object") && (l.reminders = {}), mS.some((e) => e.value === l.defaultSort) || (l.defaultSort = "manual"), l.weekStart !== 0 && l.weekStart !== 1 && (l.weekStart = 1), t.some((e) => e.id === l.defaultListId) || (l.defaultListId = r), this.state = {
			lists: t,
			tasks: a,
			tags: s,
			settings: l
		}, this.persistAll(), this.state;
	}
	bindStorageSync() {
		this.storageBound || typeof window > "u" || (this.storageBound = !0, window.addEventListener("storage", (e) => {
			e.key && Object.values(pS).includes(e.key) && (this.load(), this.emit());
		}));
	}
	subscribe(e) {
		return this.listeners.add(e), () => this.listeners.delete(e);
	}
	emit() {
		for (let e of [...this.listeners]) try {
			e(this.state);
		} catch (e) {
			console.error("[todo] listener error", e);
		}
	}
	persistAll() {
		this.state.settings.reminders = {
			...yS(),
			...this.state.settings.reminders || {}
		}, vS(pS.lists, this.state.lists), vS(pS.tasks, this.state.tasks), vS(pS.tags, this.state.tags), vS(pS.settings, this.state.settings);
	}
	persistTasks() {
		vS(pS.tasks, this.state.tasks);
	}
	persistLists() {
		vS(pS.lists, this.state.lists);
	}
	persistTags() {
		vS(pS.tags, this.state.tags);
	}
	persistSettings() {
		vS(pS.settings, this.state.settings);
	}
	get lists() {
		return [...this.state.lists].sort((e, t) => e.order - t.order);
	}
	get tasks() {
		return this.state.tasks;
	}
	get settings() {
		return this.state.settings;
	}
	listById(e) {
		return this.state.lists.find((t) => t.id === e) || null;
	}
	taskById(e) {
		return this.state.tasks.find((t) => t.id === e) || null;
	}
	nextOrder(e) {
		let t = this.state.tasks.filter((t) => t.listId === e);
		return t.length ? Math.max(...t.map((e) => Number.isFinite(e.order) ? e.order : 0)) + 1 : 0;
	}
	nextListOrder() {
		return this.state.lists.length ? Math.max(...this.state.lists.map((e) => e.order)) + 1 : 0;
	}
	allTags() {
		let e = new Set(this.state.tags);
		for (let t of this.state.tasks) for (let n of t.tags) e.add(n);
		return [...e].sort((e, t) => e.localeCompare(t, "zh-CN"));
	}
	sortTasks(e, t = this.settings.defaultSort) {
		let n = [...e], r = (e, t) => {
			let n = Q(e.dueAt), r = Q(t.dueAt);
			return n && r ? n.getTime() - r.getTime() : n ? -1 : r ? 1 : e.order - t.order;
		};
		switch (t) {
			case "due": return n.sort(r);
			case "priority": return n.sort((e, t) => t.priority - e.priority || r(e, t));
			case "created": return n.sort((e, t) => (Q(t.createdAt)?.getTime() || 0) - (Q(e.createdAt)?.getTime() || 0));
			default: return n.sort((e, t) => e.order - t.order || (Q(e.createdAt)?.getTime() || 0) - (Q(t.createdAt)?.getTime() || 0));
		}
	}
	listTasks(e, { done: t = !1, sort: n } = {}) {
		return this.sortTasks(this.state.tasks.filter((n) => n.listId === e && n.done === t), n);
	}
	undoneTasks() {
		return this.state.tasks.filter((e) => !e.done);
	}
	doneTasks() {
		return this.state.tasks.filter((e) => e.done);
	}
	tasksDueOn(e, { includeOverdue: t = !1 } = {}) {
		let n = Q(e) || /* @__PURE__ */ new Date();
		return this.state.tasks.filter((e) => {
			if (e.done || !e.dueAt) return !1;
			let r = Q(e.dueAt);
			return $x(r, n) ? !0 : t && r < qx(n);
		});
	}
	dueCountOn(e) {
		return this.tasksDueOn(e).length;
	}
	matchesQuery(e, t) {
		let n = String(t || "").trim().toLowerCase();
		return !!(!n || e.title.toLowerCase().includes(n) || e.note && e.note.toLowerCase().includes(n) || e.tags.some((e) => e.toLowerCase().includes(n)) || e.subtasks.some((e) => e.title.toLowerCase().includes(n)));
	}
	searchTasks(e, { done: t } = {}) {
		let n = String(e || "").trim();
		if (!n) return [];
		let r = this.state.tasks.filter((e) => this.matchesQuery(e, n)), i = t === void 0 ? r : r.filter((e) => e.done === t);
		return this.sortTasks(i, "due");
	}
	completionStats(e = 84, { weighted: t = !1 } = {}) {
		let n = qx(/* @__PURE__ */ new Date()), r = Jx(n, -(e - 1)), i = /* @__PURE__ */ new Map();
		for (let t = 0; t < e; t++) i.set(Kx(Jx(r, t)), {
			count: 0,
			weight: 0
		});
		let a = 0, o = 0;
		for (let e of this.state.tasks) {
			if (!e.done || !e.doneAt) continue;
			let t = Q(e.doneAt);
			if (!t || t < r) continue;
			let n = i.get(Kx(t));
			n && (n.count += 1, n.weight += e.priority === 3 ? 3 : e.priority === 2 ? 2 : 1, a += 1, o += e.priority === 3 ? 3 : e.priority === 2 ? 2 : 1);
		}
		let s = (() => {
			let e = n;
			(i.get(Kx(n))?.count || 0) === 0 && (e = Jx(n, -1));
			let t = 0;
			for (; i.has(Kx(e)) && (i.get(Kx(e))?.count || 0) > 0;) t += 1, e = Jx(e, -1);
			return t;
		})();
		return {
			byDay: i,
			from: r,
			to: n,
			total: a,
			weightedTotal: o,
			streak: s,
			weighted: t,
			days: e
		};
	}
	touch(e) {
		e.updatedAt = CS();
	}
	addTask(e = {}) {
		let t = typeof e.title == "string" ? e.title.trim() : "";
		if (!t) throw Error("title 不能为空");
		if (e.listId !== void 0 && e.listId !== null && !this.state.lists.some((t) => t.id === e.listId)) throw Error(`找不到清单 ${e.listId}`);
		let n = e.listId || this.settings.defaultListId || this.state.lists[0].id;
		if (e.priority !== void 0 && e.priority !== null && !wS(e.priority)) throw Error("priority 必须是 0–3");
		let r = e.recurrence ?? void 0;
		if (r && !lS.some((e) => e.value === r)) throw Error("recurrence 必须是 daily / weekly / monthly / yearly");
		let i = CS(), a = {
			id: SS(),
			listId: n,
			title: t,
			note: typeof e.note == "string" && e.note.trim() ? e.note.trim() : void 0,
			done: !1,
			createdAt: i,
			updatedAt: i,
			order: this.nextOrder(n),
			priority: wS(e.priority) ? e.priority : 0,
			dueAt: cS(e.dueAt) || void 0,
			remindAt: cS(e.remindAt) || void 0,
			recurrence: r || void 0,
			tags: Array.isArray(e.tags) ? e.tags.filter((e) => typeof e == "string" && e.trim()).map((e) => e.trim()) : [],
			subtasks: Array.isArray(e.subtasks) ? e.subtasks.filter((e) => e && typeof (e.title ?? e) == "string" && String(e.title ?? e).trim()).map((e, t) => ({
				id: SS(),
				title: String(e.title ?? e).trim(),
				done: !!e.done,
				order: t
			})) : []
		};
		return this.state.tasks.push(a), this.rememberTags(a.tags), this.persistTasks(), this.emit(), a;
	}
	updateTask(e, t = {}) {
		let n = this.taskById(e);
		if (!n) throw Error(`找不到任务 ${e}`);
		let r = { ...t };
		if (r.title !== void 0) {
			let e = String(r.title ?? "").trim();
			if (!e) throw Error("title 不能为空");
			n.title = e;
		}
		if (r.note !== void 0 && (n.note = (typeof r.note == "string" ? r.note.trim() : "") || void 0), r.priority !== void 0) {
			if (!wS(r.priority)) throw Error("priority 必须是 0–3");
			n.priority = r.priority;
		}
		if (r.dueAt !== void 0 && (n.dueAt = cS(r.dueAt) || void 0), r.remindAt !== void 0) {
			let e = n.remindAt, t = cS(r.remindAt) || void 0;
			n.remindAt = t, xS(e, t) || this.clearFiredReminder(n);
		}
		if (r.recurrence !== void 0) {
			if (r.recurrence && !lS.some((e) => e.value === r.recurrence)) throw Error("recurrence 必须是 daily / weekly / monthly / yearly");
			n.recurrence = r.recurrence || void 0;
		}
		if (r.tags !== void 0) {
			if (!Array.isArray(r.tags)) throw Error("tags 必须是字符串数组");
			n.tags = [...new Set(r.tags.filter((e) => typeof e == "string" && e.trim()).map((e) => e.trim()))], this.rememberTags(n.tags);
		}
		if (r.listId !== void 0) {
			if (!this.state.lists.some((e) => e.id === r.listId)) throw Error(`找不到清单 ${r.listId}`);
			n.listId !== r.listId && (n.listId = r.listId, n.order = this.nextOrder(r.listId));
		}
		return r.done !== void 0 && this.setDoneInternal(n, !!r.done), r.order !== void 0 && Number.isFinite(r.order) && (n.order = r.order), this.touch(n), this.persistTasks(), this.emit(), n;
	}
	setDone(e, t = !0) {
		let n = this.taskById(e);
		if (!n) throw Error(`找不到任务 ${e}`);
		return this.setDoneInternal(n, !!t), this.touch(n), this.persistTasks(), this.emit(), n;
	}
	setDoneInternal(e, t) {
		e.done !== t && (e.done = t, e.doneAt = t ? CS() : void 0, t && e.recurrence && this.spawnNextOccurrence(e));
	}
	spawnNextOccurrence(e) {
		let t = Q(e.dueAt) || /* @__PURE__ */ new Date(), n = uS(t, e.recurrence);
		if (!n) return null;
		let r = /* @__PURE__ */ new Date(), i = 0;
		for (; n <= r && i < 1e3;) n = uS(n, e.recurrence), i += 1;
		let a = n.getTime() - t.getTime(), o = CS(), s = {
			id: SS(),
			listId: e.listId,
			title: e.title,
			note: e.note,
			done: !1,
			createdAt: o,
			updatedAt: o,
			order: this.nextOrder(e.listId),
			priority: e.priority,
			dueAt: n.toISOString(),
			remindAt: e.remindAt ? new Date(Q(e.remindAt).getTime() + a).toISOString() : void 0,
			recurrence: e.recurrence,
			tags: [...e.tags],
			subtasks: e.subtasks.map((e, t) => ({
				id: SS(),
				title: e.title,
				done: !1,
				order: t
			}))
		};
		return this.state.tasks.push(s), s;
	}
	removeTask(e) {
		let t = this.state.tasks.findIndex((t) => t.id === e);
		if (t < 0) throw Error(`找不到任务 ${e}`);
		let [n] = this.state.tasks.splice(t, 1), r = {
			...yS(),
			...this.state.settings.reminders || {}
		};
		return delete r[e], this.state.settings.reminders = r, this.persistTasks(), this.persistSettings(), this.emit(), {
			ok: !0,
			id: e,
			removed: n
		};
	}
	clearCompleted({ listId: e } = {}) {
		let t = this.state.tasks.filter((t) => t.done && (!e || t.listId === e)).map((e) => e.id);
		if (t.length === 0) return 0;
		this.state.tasks = this.state.tasks.filter((e) => !t.includes(e.id));
		let n = {
			...yS(),
			...this.state.settings.reminders || {}
		};
		for (let e of t) delete n[e];
		return this.state.settings.reminders = n, this.persistTasks(), this.persistSettings(), this.emit(), t.length;
	}
	reorderTasks(e, t) {
		let n = new Set(t), r = this.state.tasks.filter((t) => t.listId === e && n.has(t.id));
		t.forEach((e, t) => {
			let n = r.find((t) => t.id === e);
			n && (n.order = t);
		}), this.persistTasks(), this.emit();
	}
	addList(e) {
		let t = String(e ?? "").trim();
		if (!t) throw Error("清单名不能为空");
		let n = {
			id: SS(),
			name: t,
			order: this.nextListOrder()
		};
		return this.state.lists.push(n), this.persistLists(), this.emit(), n;
	}
	updateList(e, t = {}) {
		let n = this.listById(e);
		if (!n) throw Error(`找不到清单 ${e}`);
		return typeof t.name == "string" && t.name.trim() && (n.name = t.name.trim()), this.persistLists(), this.emit(), n;
	}
	removeList(e) {
		let t = this.listById(e);
		if (!t) throw Error(`找不到清单 ${e}`);
		if (this.state.lists.length <= 1) throw Error("至少保留一个清单");
		this.state.lists = this.state.lists.filter((t) => t.id !== e);
		let n = this.state.tasks.filter((t) => t.listId === e).map((e) => e.id);
		this.state.tasks = this.state.tasks.filter((t) => t.listId !== e);
		let r = {
			...yS(),
			...this.state.settings.reminders || {}
		};
		for (let e of n) delete r[e];
		return this.state.settings.reminders = r, this.state.settings.defaultListId === e && (this.state.settings.defaultListId = this.state.lists[0].id), this.persistLists(), this.persistTasks(), this.persistSettings(), this.emit(), {
			ok: !0,
			id: e,
			name: t.name,
			removedTasks: n.length
		};
	}
	addSubtask(e, t) {
		let n = this.taskById(e);
		if (!n) throw Error(`找不到任务 ${e}`);
		let r = String(t ?? "").trim();
		if (!r) throw Error("子任务标题不能为空");
		let i = n.subtasks.length ? Math.max(...n.subtasks.map((e) => e.order)) + 1 : 0;
		return n.subtasks.push({
			id: SS(),
			title: r,
			done: !1,
			order: i
		}), this.touch(n), this.persistTasks(), this.emit(), n;
	}
	completeSubtask(e, t, n = !0) {
		let r = this.taskById(e);
		if (!r) throw Error(`找不到任务 ${e}`);
		let i = r.subtasks.find((e) => e.id === t);
		if (!i) throw Error(`找不到子任务 ${t}`);
		return i.done = !!n, this.touch(r), this.persistTasks(), this.emit(), r;
	}
	removeSubtask(e, t) {
		let n = this.taskById(e);
		if (!n) throw Error(`找不到任务 ${e}`);
		return n.subtasks = n.subtasks.filter((e) => e.id !== t), this.touch(n), this.persistTasks(), this.emit(), n;
	}
	rememberTags(e) {
		if (!Array.isArray(e) || !e.length) return;
		let t = !1;
		for (let n of e) this.state.tags.includes(n) || (this.state.tags.push(n), t = !0);
		t && this.persistTags();
	}
	updateSettings(e = {}) {
		return Object.assign(this.state.settings, e), this.state.settings.reminders = {
			...yS(),
			...this.state.settings.reminders || {}
		}, this.state.lists.some((e) => e.id === this.state.settings.defaultListId) || (this.state.settings.defaultListId = this.state.lists[0]?.id ?? null), this.persistSettings(), this.emit(), this.state.settings;
	}
	claimDueReminders(e = /* @__PURE__ */ new Date()) {
		let t = [], n = _S(pS.settings, null), r = n && typeof n == "object" ? n : {}, i = yS();
		for (let n of this.state.tasks) {
			if (n.done || !n.remindAt) continue;
			let r = Q(n.remindAt);
			!r || r > e || i[n.id] !== void 0 && xS(i[n.id], n.remindAt) || (i[n.id] = n.remindAt, t.push(n));
		}
		if (t.length) {
			let e = {
				...r,
				reminders: i
			};
			vS(pS.settings, e), this.state.settings = {
				...this.state.settings,
				...e,
				reminders: i
			};
		}
		return t;
	}
	clearFiredReminder(e) {
		let t = {
			...yS(),
			...this.state.settings.reminders || {}
		};
		e.id in t && (delete t[e.id], this.state.settings.reminders = t, this.persistSettings());
	}
	snoozeReminder(e, t = 6e5) {
		let n = this.taskById(e);
		if (!n) return null;
		n.remindAt = new Date(Date.now() + t).toISOString();
		let r = {
			...yS(),
			...this.state.settings.reminders || {}
		};
		return delete r[n.id], this.state.settings.reminders = r, this.persistSettings(), this.persistTasks(), this.emit(), n;
	}
	statsRange({ from: e, to: t } = {}) {
		let n = Q(e) || Jx(qx(/* @__PURE__ */ new Date()), -30), r = Q(t) || /* @__PURE__ */ new Date(), i = this.state.tasks.filter((e) => {
			if (!e.done || !e.doneAt) return !1;
			let t = Q(e.doneAt);
			return t >= n && t <= r;
		}), a = {}, o = {}, s = {
			0: 0,
			1: 0,
			2: 0,
			3: 0
		};
		for (let e of i) {
			let t = Kx(e.doneAt);
			a[t] = (a[t] || 0) + 1, o[e.listId] = (o[e.listId] || 0) + 1, s[e.priority] += 1;
		}
		return {
			from: n.toISOString(),
			to: r.toISOString(),
			completed: i.length,
			created: this.state.tasks.filter((e) => {
				let t = Q(e.createdAt);
				return t && t >= n && t <= r;
			}).length,
			byDay: a,
			byList: o,
			byPriority: s,
			listNames: Object.fromEntries(this.state.lists.map((e) => [e.id, e.name]))
		};
	}
}();
//#endregion
//#region public/plugins/todo/js/demo.js
function ES(e) {
	let t = e >>> 0;
	return () => {
		t = t + 1831565813 >>> 0;
		let e = t;
		return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function DS(e, t, n = 0) {
	let r = Jx(qx(/* @__PURE__ */ new Date()), e);
	return new Date(r.getFullYear(), r.getMonth(), r.getDate(), t, n, 0, 0).toISOString();
}
function OS() {
	return new URLSearchParams(location.search).get("demo") === "1" && $.state.tasks.length === 0;
}
function kS() {
	let e = ES(20261018), [t, n, r] = [
		{ name: "工作" },
		{ name: "生活" },
		{ name: "学习" }
	].map((e) => $.addList(e.name)), i = {
		工作: t.id,
		生活: n.id,
		学习: r.id
	}, a = (e) => {
		try {
			return $.addTask(e);
		} catch (e) {
			return console.warn("[todo demo] 跳过一条演示任务", e.message), null;
		}
	};
	a({
		title: "整理产品周报，把本周评审结论同步给设计组",
		listId: i.工作,
		priority: 3,
		dueAt: DS(0, 17, 0),
		status: "todo",
		tags: ["工作", "重要"],
		subtasks: [
			"汇总本周数据",
			"整理评审结论",
			"发送给设计组"
		],
		note: "周五 17:00 前发出，抄送产品负责人。"
	});
	let o = $.state.tasks[$.state.tasks.length - 1];
	o && ($.completeSubtask(o.id, o.subtasks[0].id, !0), $.updateTask(o.id, { remindAt: DS(1, 9, 30) })), a({
		title: "和设计评审 Fluent 动效 token",
		listId: i.工作,
		priority: 2,
		dueAt: DS(0, 10, 30),
		tags: ["工作"],
		subtasks: ["准备动效示例", "确认 duration 档位"]
	}), a({
		title: "提交上周差旅报销单",
		listId: i.工作,
		priority: 2,
		dueAt: DS(-1, 23, 59),
		tags: ["工作"]
	}), a({
		title: "买牛奶和面包",
		listId: i.生活,
		priority: 1,
		dueAt: DS(0, 20, 0),
		tags: ["生活"]
	}), a({
		title: "背单词 20 个（每日）",
		listId: i.学习,
		priority: 1,
		dueAt: DS(0, 22, 0),
		recurrence: "daily",
		tags: ["学习", "健康"]
	}), a({
		title: "给妈妈打电话",
		listId: i.生活,
		priority: 0,
		dueAt: DS(0, 19, 30),
		tags: ["生活"]
	}), a({
		title: "准备下周一的方案初稿",
		listId: i.工作,
		priority: 3,
		dueAt: DS(1, 11, 0),
		tags: ["工作", "重要"],
		subtasks: [
			"列大纲",
			"补竞品截图",
			"写结论"
		]
	}), a({
		title: "健身房练腿",
		listId: i.生活,
		priority: 1,
		dueAt: DS(1, 18, 30),
		tags: ["健康"]
	}), a({
		title: "读完《设计中的设计》第三章",
		listId: i.学习,
		priority: 0,
		dueAt: DS(1, 21, 0),
		tags: ["学习"]
	}), a({
		title: "每周复盘（每周）",
		listId: i.工作,
		priority: 2,
		dueAt: DS(1, 20, 0),
		recurrence: "weekly",
		tags: ["工作"]
	}), a({
		title: "预约牙医",
		listId: i.生活,
		priority: 1,
		dueAt: DS(3, 9, 0),
		tags: ["健康"]
	}), a({
		title: "季度目标对齐会",
		listId: i.工作,
		priority: 2,
		dueAt: DS(4, 14, 0),
		tags: ["工作"]
	}), a({
		title: "整理书桌和文件",
		listId: i.生活,
		priority: 0,
		dueAt: DS(6, 10, 0),
		tags: ["生活"]
	}), a({
		title: "学习 CSS Container Queries",
		listId: i.学习,
		priority: 1,
		dueAt: DS(8, 20, 0),
		tags: ["学习"]
	}), a({
		title: "给桌面插件写使用说明",
		listId: i.工作,
		priority: 2,
		dueAt: DS(12, 16, 0),
		tags: ["工作"]
	}), a({
		title: "整理插件截图，更新 README",
		listId: i.工作,
		priority: 1,
		tags: ["工作"]
	}), a({
		title: "想一个周末短途目的地",
		listId: i.生活,
		priority: 0,
		tags: ["生活"]
	}), a({
		title: "把 Fluent token 表补齐",
		listId: i.学习,
		priority: 2,
		tags: ["学习"]
	});
	let s = [
		"清理收件箱",
		"写日报",
		"快走 30 分钟",
		"阅读 20 页",
		"复盘昨日计划",
		"联系客户确认需求",
		"整理会议纪要",
		"采购日用品",
		"拉伸放松",
		"记 10 个单词",
		"检查部署日志",
		"给团队写同步说明",
		"冥想 10 分钟",
		"整理待办清单"
	];
	for (let t = -83; t <= 0; t += 1) {
		let n = Jx(qx(/* @__PURE__ */ new Date()), t), r = e(), o = 0;
		r > .4 && (o = 1), r > .75 && (o = 2), r > .92 && (o = 3), r > .985 && (o = 4);
		for (let r = 0; r < o; r += 1) {
			let r = s[Math.floor(e() * s.length)], o = [
				"工作",
				"生活",
				"学习"
			], c = o[Math.floor(e() * o.length)], l = [c === "工作" ? "工作" : c === "生活" ? "生活" : "学习"], u = a({
				title: r,
				listId: i[c],
				priority: e() > .82 ? 3 : e() > .55 ? 2 : +(e() > .4),
				tags: l,
				dueAt: DS(t, 9 + Math.floor(e() * 10), 0)
			});
			if (u) {
				let t = 8 + Math.floor(e() * 14), r = Math.floor(e() * 60);
				u.done = !0, u.doneAt = new Date(n.getFullYear(), n.getMonth(), n.getDate(), t, r, 0, 0).toISOString(), u.updatedAt = u.doneAt;
			}
		}
	}
	$.persistTasks();
	let c = $.lists.find((e) => e.name === "我的待办" && !$.state.tasks.some((t) => t.listId === e.id));
	if (c && $.lists.length > 1) try {
		$.removeList(c.id);
	} catch (e) {
		console.warn("[todo demo] 删除占位清单失败", e.message);
	}
	$.updateSettings({
		defaultListId: t.id,
		weekStart: 1
	}), $.emit(), console.info("[todo] 演示数据已注入：", $.state.tasks.length, "条任务，", Kx(/* @__PURE__ */ new Date()));
}
//#endregion
//#region public/plugins/todo/js/reminders.js
var AS = 5e3, jS = "wtsl.todo.reminders.claim", MS = /* @__PURE__ */ new Set();
function NS(e) {
	return `${e.id}@${bS(e.remindAt)}`;
}
async function PS() {
	let e = typeof navigator < "u" ? navigator.locks : null;
	if (!e || typeof e.request != "function") return $.claimDueReminders(/* @__PURE__ */ new Date());
	try {
		return await e.request(jS, { ifAvailable: !0 }, async (e) => e ? $.claimDueReminders(/* @__PURE__ */ new Date()) : null) ?? [];
	} catch (e) {
		return console.warn("[todo] 提醒锁不可用，回退到 localStorage 标记", e), $.claimDueReminders(/* @__PURE__ */ new Date());
	}
}
function FS() {
	let e = !1, t = !1, n = async () => {
		let e = [];
		try {
			e = await PS();
		} catch (e) {
			console.error("[todo] 提醒检查失败", e);
			return;
		}
		for (let t of e) {
			let e = NS(t);
			if (!MS.has(e)) {
				MS.add(e);
				try {
					await IS(t);
				} catch (e) {
					console.error("[todo] 提醒弹出失败", e);
				} finally {
					MS.delete(e);
				}
			}
		}
	}, r = async () => {
		if (!(e || t)) {
			t = !0;
			try {
				await n();
			} finally {
				t = !1;
			}
		}
	}, i = () => {
		document.hidden || r();
	};
	r();
	let a = setInterval(r, AS);
	return document.addEventListener("visibilitychange", i), window.addEventListener("focus", i), () => {
		e = !0, clearInterval(a), document.removeEventListener("visibilitychange", i), window.removeEventListener("focus", i);
	};
}
async function IS(t) {
	let n = $.listById(t.listId), r = n ? `待办提醒 · ${n.name}` : "待办提醒", i = `${t.title}${t.dueAt ? `（${aS(t.dueAt)}）` : ""}`, a = await e.showReminder({
		title: r,
		message: i,
		actions: [{
			id: "done",
			text: "标记完成",
			kind: "primary"
		}, {
			id: "later",
			text: "10 分钟后再提醒"
		}],
		autoDismissSec: 30
	});
	if (!e.inHost) return;
	let o = a && typeof a == "object" ? a.actionId : void 0;
	o === "done" ? $.setDone(t.id, !0) : o === "later" && $.snoozeReminder(t.id, 6e5);
}
//#endregion
//#region public/plugins/todo/js/config.js
var LS = "settings", RS = {
	showCompleted: !0,
	defaultSort: "manual",
	weekStart: 1
}, zS = mS.map((e) => ({
	value: e.value,
	label: e.label
})), BS = new Set(zS.map((e) => e.value));
function VS(e) {
	let t = e && typeof e == "object" && !Array.isArray(e) ? e : {};
	return {
		showCompleted: typeof t.showCompleted == "boolean" ? t.showCompleted : RS.showCompleted,
		defaultSort: BS.has(t.defaultSort) ? t.defaultSort : RS.defaultSort,
		weekStart: t.weekStart === 0 ? 0 : 1
	};
}
function HS(e, t) {
	switch (e) {
		case "showCompleted": return typeof t == "boolean" ? null : "showCompleted 需要是布尔值";
		case "defaultSort": return BS.has(t) ? null : `defaultSort 只能是 ${[...BS].join(" / ")}`;
		case "weekStart": return t === 0 || t === 1 ? null : "weekStart 只能是 0（周日）或 1（周一）";
		default: return `未知设置项 ${e}`;
	}
}
async function US() {
	let t;
	try {
		t = await e.getConfig(LS);
	} catch {
		t = void 0;
	}
	return VS(t);
}
async function WS(t) {
	if (!t || typeof t != "object" || Array.isArray(t)) throw Error("settings.set 需要对象参数");
	let n = Object.keys(t);
	if (n.length === 0) throw Error("没有要修改的设置项");
	for (let e of n) {
		let n = HS(e, t[e]);
		if (n) throw Error(n);
	}
	let r = {};
	try {
		let t = await e.getConfig(LS);
		t && typeof t == "object" && !Array.isArray(t) && (r = t);
	} catch {
		r = {};
	}
	let i = {
		...r,
		...t
	};
	return await e.setConfig(LS, i), VS(i);
}
//#endregion
//#region public/plugins/todo/js/tools.js
function GS(e) {
	if (e !== void 0) return e === null || e === "" ? null : String(e);
}
function KS(e) {
	let t = $.state.tasks.filter((t) => t.listId === e.id), n = t.filter((e) => e.done).length;
	return {
		...e,
		isDefault: $.settings.defaultListId === e.id,
		total: t.length,
		undone: t.length - n,
		done: n
	};
}
function qS(e) {
	if (!e) return null;
	let t = $.listById(e.listId);
	return {
		...e,
		listName: t?.name
	};
}
function JS(e = {}) {
	if (e.patch && typeof e.patch == "object" && !Array.isArray(e.patch)) return e.patch;
	let t = {};
	for (let n of [
		"showCompleted",
		"defaultSort",
		"weekStart"
	]) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
	return t;
}
var YS = [
	{
		name: "todo.lists",
		description: "列出所有待办清单（含未完成/已完成数量、哪个是默认清单）",
		parameters: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "todo.list",
		description: "查询任务；默认只返回未完成任务。可用 listId / done / dueBefore / tag / query 过滤。",
		parameters: {
			type: "object",
			properties: {
				listId: {
					type: "string",
					description: "只看某个清单"
				},
				done: {
					type: "boolean",
					description: "true 只看已完成，false 只看未完成，不传默认未完成"
				},
				dueBefore: {
					type: "string",
					description: "ISO 时间或 YYYY-MM-DD，只看该时间前到期的任务"
				},
				tag: { type: "string" },
				query: { type: "string" }
			}
		}
	},
	{
		name: "todo.add",
		description: "新建任务。title 必填；可带 listId / priority(0-3) / dueAt / remindAt / recurrence / tags / subtasks。",
		parameters: {
			type: "object",
			properties: {
				title: { type: "string" },
				listId: { type: "string" },
				priority: {
					type: "number",
					enum: [
						0,
						1,
						2,
						3
					]
				},
				dueAt: {
					type: "string",
					description: "ISO 时间；只有日期时按当天 23:59 到期"
				},
				note: { type: "string" },
				remindAt: { type: "string" },
				recurrence: {
					type: "string",
					enum: [
						"daily",
						"weekly",
						"monthly",
						"yearly"
					]
				},
				tags: {
					type: "array",
					items: { type: "string" }
				},
				subtasks: {
					type: "array",
					items: { oneOf: [{ type: "string" }, { type: "object" }] }
				}
			},
			required: ["title"]
		}
	},
	{
		name: "todo.update",
		description: "更新任务字段：标题、备注、优先级、截止、提醒、重复、标签、移动清单。",
		parameters: {
			type: "object",
			properties: {
				id: { type: "string" },
				title: { type: "string" },
				note: { type: "string" },
				priority: {
					type: "number",
					enum: [
						0,
						1,
						2,
						3
					]
				},
				dueAt: { type: ["string", "null"] },
				remindAt: { type: ["string", "null"] },
				recurrence: {
					type: ["string", "null"],
					enum: [
						"daily",
						"weekly",
						"monthly",
						"yearly",
						null
					]
				},
				tags: {
					type: "array",
					items: { type: "string" }
				},
				listId: { type: "string" }
			},
			required: ["id"]
		}
	},
	{
		name: "todo.remove",
		description: "删除任务",
		parameters: {
			type: "object",
			properties: { id: { type: "string" } },
			required: ["id"]
		}
	},
	{
		name: "todo.complete",
		description: "勾选 / 取消勾选任务（done 默认 true）。重复任务完成时会自动生成下一次。",
		parameters: {
			type: "object",
			properties: {
				id: { type: "string" },
				done: { type: "boolean" }
			},
			required: ["id"]
		}
	},
	{
		name: "todo.search",
		description: "在标题、备注、标签、子任务标题里搜索任务",
		parameters: {
			type: "object",
			properties: { query: { type: "string" } },
			required: ["query"]
		}
	},
	{
		name: "todo.addSubtask",
		description: "给任务加子任务",
		parameters: {
			type: "object",
			properties: {
				taskId: { type: "string" },
				title: { type: "string" }
			},
			required: ["taskId", "title"]
		}
	},
	{
		name: "todo.completeSubtask",
		description: "勾选 / 取消勾选子任务（done 默认 true）",
		parameters: {
			type: "object",
			properties: {
				taskId: { type: "string" },
				subtaskId: { type: "string" },
				done: { type: "boolean" }
			},
			required: ["taskId", "subtaskId"]
		}
	},
	{
		name: "todo.removeSubtask",
		description: "删除任务下的一个子任务",
		parameters: {
			type: "object",
			properties: {
				taskId: { type: "string" },
				subtaskId: { type: "string" }
			},
			required: ["taskId", "subtaskId"]
		}
	},
	{
		name: "todo.addList",
		description: "新建清单（不再接受颜色：色相只由 manifest.identityHue 决定）",
		parameters: {
			type: "object",
			properties: { name: { type: "string" } },
			required: ["name"]
		}
	},
	{
		name: "todo.renameList",
		description: "重命名清单",
		parameters: {
			type: "object",
			properties: {
				id: { type: "string" },
				name: { type: "string" }
			},
			required: ["id", "name"]
		}
	},
	{
		name: "todo.removeList",
		description: "删除清单；同时删除其中的任务（至少保留一个清单）",
		parameters: {
			type: "object",
			properties: { id: { type: "string" } },
			required: ["id"]
		}
	},
	{
		name: "todo.setDefaultList",
		description: "设置默认清单（决定详情页初始筛选，不影响卡片）",
		parameters: {
			type: "object",
			properties: { id: { type: "string" } },
			required: ["id"]
		}
	},
	{
		name: "todo.clearCompleted",
		description: "清空已完成任务；传 listId 只清某个清单，不传清全部",
		parameters: {
			type: "object",
			properties: { listId: { type: "string" } }
		}
	},
	{
		name: "todo.stats",
		description: "任务的完成统计（按天/清单/优先级），用于复盘页与热力图；from/to 省略时默认近 30 天。",
		parameters: {
			type: "object",
			properties: {
				from: { type: "string" },
				to: { type: "string" }
			}
		}
	},
	{
		name: "todo.settings.get",
		description: "读取待办设置（显示已完成 / 默认排序 / 一周起始日）",
		parameters: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "todo.settings.set",
		description: "修改待办设置。patch 可含 showCompleted(boolean) / defaultSort(manual|due|priority|created) / weekStart(0=周日,1=周一)。",
		parameters: {
			type: "object",
			properties: { patch: {
				type: "object",
				properties: {
					showCompleted: { type: "boolean" },
					defaultSort: {
						type: "string",
						enum: [
							"manual",
							"due",
							"priority",
							"created"
						]
					},
					weekStart: {
						type: "number",
						enum: [0, 1]
					}
				}
			} },
			required: ["patch"]
		}
	}
];
async function XS(e, t = {}) {
	switch (e) {
		case "todo.lists": return $.lists.map(KS);
		case "todo.list": {
			let e = $.state.tasks;
			if (t.listId) {
				if (!$.listById(t.listId)) throw Error(`找不到清单 ${t.listId}`);
				e = e.filter((e) => e.listId === t.listId);
			}
			if (e = typeof t.done == "boolean" ? e.filter((e) => e.done === t.done) : e.filter((e) => !e.done), t.dueBefore) {
				let n = new Date(t.dueBefore);
				if (Number.isNaN(n.getTime())) throw Error("dueBefore 不是合法时间");
				let r = /^\d{4}-\d{2}-\d{2}$/.test(t.dueBefore) ? new Date(n.getFullYear(), n.getMonth(), n.getDate(), 23, 59, 59) : n;
				e = e.filter((e) => e.dueAt && new Date(e.dueAt) <= r);
			}
			return t.tag && (e = e.filter((e) => e.tags.includes(t.tag))), t.query && (e = e.filter((e) => $.matchesQuery(e, t.query))), $.sortTasks(e, "due").map(qS);
		}
		case "todo.add":
			if (!t.title || !String(t.title).trim()) throw Error("title 不能为空");
			return qS($.addTask({
				title: t.title,
				listId: t.listId,
				priority: t.priority,
				dueAt: GS(t.dueAt),
				note: t.note,
				remindAt: GS(t.remindAt),
				recurrence: t.recurrence,
				tags: t.tags,
				subtasks: t.subtasks
			}));
		case "todo.update": {
			let e = { ...t };
			return delete e.id, "dueAt" in e && (e.dueAt = GS(e.dueAt)), "remindAt" in e && (e.remindAt = GS(e.remindAt)), qS($.updateTask(t.id, e));
		}
		case "todo.remove": return $.removeTask(t.id);
		case "todo.complete": return qS($.setDone(t.id, typeof t.done != "boolean" || t.done));
		case "todo.search": return $.searchTasks(t.query).map(qS);
		case "todo.addSubtask": return qS($.addSubtask(t.taskId, t.title));
		case "todo.completeSubtask": return qS($.completeSubtask(t.taskId, t.subtaskId, typeof t.done != "boolean" || t.done));
		case "todo.removeSubtask": return qS($.removeSubtask(t.taskId, t.subtaskId));
		case "todo.addList": return KS($.addList(t.name));
		case "todo.renameList":
			if (!t.name || !String(t.name).trim()) throw Error("清单名不能为空");
			return KS($.updateList(t.id, { name: t.name }));
		case "todo.removeList": return $.removeList(t.id);
		case "todo.setDefaultList": {
			let e = $.listById(t.id);
			if (!e) throw Error(`找不到清单 ${t.id}`);
			return $.updateSettings({ defaultListId: e.id }), KS(e);
		}
		case "todo.clearCompleted": return { removed: $.clearCompleted({ listId: t.listId }) };
		case "todo.stats": return $.statsRange({
			from: t.from,
			to: t.to
		});
		case "todo.settings.get": return US();
		case "todo.settings.set": {
			let e = JS(t);
			if (Object.keys(e).length === 0) throw Error("没有要修改的设置项");
			return WS(e);
		}
		default: throw Error(`未知工具 ${e}`);
	}
}
async function ZS(e, t) {
	try {
		return {
			ok: !0,
			result: await XS(e, t || {})
		};
	} catch (e) {
		return {
			ok: !1,
			error: e?.message || String(e)
		};
	}
}
//#endregion
//#region public/plugins/todo/src/todoData.js
var QS = !1, $S = 0;
$.subscribe(() => {
	$S += 1;
});
function eC({ startReminders: e = !0 } = {}) {
	if (QS) return $;
	QS = !0, $.load();
	try {
		OS() && kS();
	} catch (e) {
		console.warn("[todo] 演示数据注入失败", e);
	}
	return $.bindStorageSync(), e && FS(), $;
}
function tC() {
	return (0, M.useSyncExternalStore)((e) => $.subscribe(e), () => $S, () => $S), $;
}
function nC() {
	Fx("detail", "待办详情");
}
function rC() {
	Ix();
}
function iC() {
	let e = {};
	for (let t of YS) e[t.name] = async (e) => {
		let { ok: n, result: r, error: i } = await ZS(t.name, e);
		if (!n) throw Error(i);
		return r;
	};
	return e;
}
//#endregion
//#region public/plugins/todo/src/sizes.js
var aC = {
	"1x1": [1, 1],
	"2x2": [2, 2],
	"3x2": [3, 2],
	"3x3": [3, 3],
	"4x2": [4, 2]
};
function oC(e) {
	switch (e) {
		case "1x1": return "summary";
		case "2x2": return "mini";
		case "3x2": return "medium";
		case "4x2": return "wide";
		default: return "full";
	}
}
function sC(e) {
	switch (e) {
		case "2x2": return 5;
		case "3x2": return 5;
		case "3x3": return 8;
		case "4x2": return 5;
		default: return 0;
	}
}
function cC(e) {
	if (!e) return null;
	let t = /^(\d+)\s*[x×,]\s*(\d+)$/i.exec(String(e).trim());
	return t ? [Number(t[1]), Number(t[2])] : null;
}
function lC(e) {
	if (!Array.isArray(e) || e.length < 2) return "3x3";
	let t = `${Number(e[0])}x${Number(e[1])}`;
	if (aC[t]) return t;
	let n = Number(e[0]), r = Number(e[1]);
	return n <= 1 && r <= 1 ? "1x1" : r >= 3 ? "3x3" : n >= 4 ? "4x2" : n >= 3 ? "3x2" : "2x2";
}
function uC(e) {
	let t = aC[e] || aC["3x3"];
	return {
		width: t[0] * 180,
		height: t[1] * 180
	};
}
Object.freeze([
	"1x1",
	"2x1",
	"1x2",
	"2x2",
	"3x2",
	"3x3",
	"4x2"
]);
var dC = /^[1-4]x[1-3]$/;
function fC(e, t = "2x1") {
	if (typeof e == "string") {
		let n = e.trim().toLowerCase().replace("×", "x");
		return dC.test(n) ? n : t;
	}
	let n, r;
	Array.isArray(e) ? [n, r] = e : e && typeof e == "object" && (n = e.columns ?? e.cols ?? e.width ?? e.w, r = e.rows ?? e.row ?? e.height ?? e.h);
	let i = Number(n), a = Number(r);
	if (!Number.isInteger(i) || !Number.isInteger(a)) return t;
	let o = `${i}x${a}`;
	return dC.test(o) ? o : t;
}
//#endregion
//#region public/plugins/_shared/motion.js
var pC = "8px", mC = "4px", hC = "48px";
function gC(e, t) {
	switch (e) {
		case "down": return `0px -${t}`;
		case "left": return `${t} 0px`;
		case "right": return `-${t} 0px`;
		default: return `0px ${t}`;
	}
}
function _C(e, t = q.durationFaster, n = q.curveAccelerateMin) {
	return ({ direction: r = "up" }) => ({
		enter: {
			keyframes: [{
				opacity: 0,
				translate: gC(r, e)
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
var vC = kd(_C(pC)), yC = kd(_C(mC, q.durationFast, q.curveAccelerateMid)), bC = kd(({ element: e }) => {
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
function xC({ value: e, direction: t = "up", children: n, className: r, style: i }) {
	let a = e == null ? "default" : String(e);
	return (0, M.createElement)("div", {
		className: r,
		style: {
			display: "grid",
			minWidth: 0,
			...i
		},
		"data-cross-fade": a
	}, (0, M.createElement)(Fd, null, (0, M.createElement)(yC, {
		key: a,
		direction: t
	}, (0, M.createElement)("div", { style: {
		gridArea: "1 / 1",
		minWidth: 0
	} }, n))));
}
var SC = kd(({ direction: e = "forward" }) => {
	let t = e === "back", n = t ? `-${hC} 0px` : `${hC} 0px`, r = t ? `${hC} 0px` : `-${hC} 0px`;
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
}), CC = {
	fontSize: U.fontSizeHero900,
	lineHeight: U.lineHeightHero900
}, wC = U.fontWeightSemibold, TC = { fontVariantNumeric: "tabular-nums" }, EC = (e) => Number.parseFloat(e), DC = EC(vl.spacingVerticalL), OC = EC(vl.spacingVerticalS);
vl.lineHeightHero900, vl.spacingVerticalXXL, `${U.spacingHorizontalSNudge}${U.spacingHorizontalL}`;
var kC = EC(vl.spacingHorizontalSNudge) + EC(vl.spacingHorizontalL), AC = Object.freeze({
	XS: 16,
	S: 20,
	M: 24,
	L: 32,
	XL: 48
});
AC.S;
var jC = AC.M;
vl.strokeWidthThickest;
var MC = 56, NC = 48, PC = 44, FC = 56, IC = {
	minWidth: 44,
	minHeight: 44
}, LC = [
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
function RC(e, t) {
	if (!(t instanceof Element)) return !1;
	let n = t.closest(LC);
	return !!(n && n !== e && e.contains(n));
}
var zC = Jn({ root: {
	position: "relative",
	display: "flex",
	flexDirection: "column",
	width: "100%",
	height: "100%",
	minWidth: 0,
	minHeight: 0,
	overflow: "hidden",
	boxSizing: "border-box",
	paddingTop: U.spacingVerticalL,
	paddingBottom: U.spacingVerticalL,
	paddingLeft: U.spacingHorizontalL,
	paddingRight: U.spacingHorizontalL,
	gap: U.spacingVerticalS,
	color: U.colorNeutralForeground1,
	fontFamily: U.fontFamilyBase
} });
function BC({ onActivate: e, ariaLabel: t, className: n, style: r, children: i, ...a }) {
	let o = zC(), s = Vx(), c = {
		...r,
		paddingTop: U.spacingVerticalL,
		paddingBottom: U.spacingVerticalL,
		paddingLeft: U.spacingHorizontalL,
		paddingRight: U.spacingHorizontalL,
		gap: U.spacingVerticalS
	}, l = (0, M.useCallback)((t) => {
		RC(t.currentTarget, t.target) || e?.(t);
	}, [e]), u = (0, M.useCallback)((t) => {
		(t.key === "Enter" || t.key === " ") && (RC(t.currentTarget, t.target) || (t.preventDefault(), e?.(t)));
	}, [e]);
	return /* @__PURE__ */ (0, N.jsx)("div", {
		...a,
		ref: s.ref,
		role: "button",
		tabIndex: 0,
		"aria-label": t,
		className: k(o.root, n),
		style: c,
		"data-card-root": "true",
		"data-card-content-inset": String(DC),
		"data-card-content-inset-total": String(kC),
		onClick: l,
		onKeyDown: u,
		children: i
	});
}
Jn({
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "space-between",
		gap: U.spacingHorizontalS,
		minHeight: U.lineHeightBase200,
		color: U.colorNeutralForeground3
	},
	title: {
		minWidth: 0,
		color: U.colorNeutralForeground3
	},
	trailing: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		gap: U.spacingHorizontalXS
	}
});
var VC = Jn({
	root: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: U.spacingHorizontalS,
		minWidth: 0,
		minHeight: U.spacingVerticalXXL
	},
	icon: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "center",
		color: "var(--wtsl-identity, currentColor)"
	},
	iconPlaceholder: {
		display: "inline-block",
		flexShrink: 0,
		width: U.spacingHorizontalXL,
		height: U.spacingVerticalXL
	},
	label: {
		minWidth: 0,
		color: U.colorNeutralForeground3
	},
	trailing: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		gap: U.spacingHorizontalS,
		marginInlineStart: "auto",
		maxHeight: U.spacingVerticalXXL,
		overflow: "hidden",
		whiteSpace: "nowrap",
		color: U.colorNeutralForeground3
	},
	disclosure: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		color: U.colorNeutralForeground3
	}
});
function HC({ className: e, style: t }) {
	let n = VC();
	return /* @__PURE__ */ (0, N.jsx)("span", {
		className: k(n.disclosure, e),
		style: t,
		"aria-hidden": "true",
		"data-card-disclosure": "true",
		children: /* @__PURE__ */ (0, N.jsx)(ed, {})
	});
}
function UC({ icon: e, label: t, trailing: n, compact: r = !1, placeholder: i = !1, disclosure: a = !1, className: o, style: s, ...c }) {
	let l = VC(), u = !i && !!e;
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		...c,
		className: k(l.root, o),
		style: s,
		"data-card-identity": "true",
		"data-card-identity-empty": u ? void 0 : "true",
		children: [
			u ? /* @__PURE__ */ (0, N.jsx)("span", {
				className: l.icon,
				"aria-hidden": "true",
				children: e
			}) : /* @__PURE__ */ (0, N.jsx)("span", {
				className: l.iconPlaceholder,
				"aria-hidden": "true"
			}),
			!i && !r && t ? /* @__PURE__ */ (0, N.jsx)(Z, {
				size: 200,
				weight: "semibold",
				truncate: !0,
				wrap: !1,
				className: l.label,
				children: t
			}) : null,
			n ? /* @__PURE__ */ (0, N.jsx)("div", {
				className: l.trailing,
				children: n
			}) : null,
			a ? /* @__PURE__ */ (0, N.jsx)(HC, { style: n ? void 0 : { marginInlineStart: "auto" } }) : null
		]
	});
}
var WC = Jn({ hero: {
	...TC,
	...CC,
	fontWeight: wC,
	color: U.colorNeutralForeground1,
	whiteSpace: "nowrap"
} });
function GC({ children: e, className: t, ...n }) {
	let r = WC();
	return /* @__PURE__ */ (0, N.jsx)("span", {
		...n,
		className: k(r.hero, t),
		"data-wtsl-hero": "true",
		children: e
	});
}
Jn({
	root: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: U.spacingVerticalXXS,
		minWidth: 0
	},
	valueRow: {
		display: "flex",
		alignItems: "baseline",
		gap: U.spacingHorizontalXS,
		minWidth: 0
	},
	unit: { color: U.colorNeutralForeground2 },
	meta: {
		display: "flex",
		flexDirection: "column",
		gap: U.spacingVerticalXXS,
		minWidth: 0
	},
	metaReserved: { minHeight: `calc(${U.lineHeightBase300} + ${U.spacingVerticalXXS} + ${U.lineHeightBase200})` },
	label: { color: U.colorNeutralForeground2 },
	caption: { color: U.colorNeutralForeground3 }
}), Jn({
	row: {
		display: "flex",
		alignItems: "baseline",
		justifyContent: "space-between",
		gap: U.spacingHorizontalS,
		width: "100%",
		minWidth: 0
	},
	label: {
		minWidth: 0,
		color: U.colorNeutralForeground3,
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis"
	},
	valueGroup: {
		display: "inline-flex",
		alignItems: "baseline",
		justifyContent: "flex-end",
		gap: U.spacingHorizontalXXS,
		flexShrink: 0,
		marginInlineStart: "auto",
		textAlign: "end"
	},
	value: {
		...TC,
		color: U.colorNeutralForeground1,
		whiteSpace: "nowrap"
	},
	unit: {
		color: U.colorNeutralForeground3,
		whiteSpace: "nowrap"
	}
});
var KC = Jn({
	root: {
		display: "grid",
		gap: U.spacingVerticalXS,
		minHeight: 0,
		alignContent: "start"
	},
	inset: { paddingBlock: U.spacingVerticalL }
});
function qC({ inset: e = !1, className: t, style: n, children: r, ...i }) {
	let a = KC();
	return /* @__PURE__ */ (0, N.jsx)("div", {
		...i,
		className: k(a.root, e && a.inset, t),
		style: n,
		"data-list-stack": "true",
		children: r
	});
}
var JC = Jn({
	row: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalS,
		width: "100%",
		minHeight: `calc(${U.spacingVerticalXL} * 2 + ${U.spacingVerticalXS})`,
		boxSizing: "border-box",
		paddingInline: 0,
		border: "none",
		background: "transparent",
		color: U.colorNeutralForeground1,
		fontFamily: U.fontFamilyBase,
		textAlign: "left",
		borderRadius: U.borderRadiusMedium
	},
	interactive: {
		cursor: "pointer",
		":hover": { backgroundColor: U.colorNeutralBackground1Hover },
		":active": { backgroundColor: U.colorNeutralBackground1Pressed }
	},
	selected: { backgroundColor: U.colorNeutralBackground1Selected },
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
		gap: U.spacingVerticalXXS,
		minWidth: 0
	},
	title: {
		minWidth: 0,
		color: U.colorNeutralForeground1
	},
	subtitle: {
		minWidth: 0,
		color: U.colorNeutralForeground3
	},
	trailing: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		gap: U.spacingHorizontalXS
	}
});
function YC({ leading: e, title: t, subtitle: n, trailing: r, onClick: i, selected: a = !1, titleSize: o = 300, className: s, style: c, ...l }) {
	let u = JC(), d = (e) => {
		i && (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && (e.preventDefault(), i(e));
	};
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		...l,
		role: i ? "button" : void 0,
		tabIndex: i ? 0 : void 0,
		"aria-current": a ? "true" : void 0,
		"aria-pressed": i ? !!a : void 0,
		className: k(u.row, i && u.interactive, a && u.selected, s),
		style: c,
		"data-list-row": "true",
		"data-selected": a ? "true" : void 0,
		onClick: i,
		onKeyDown: d,
		children: [
			e ? /* @__PURE__ */ (0, N.jsx)("div", {
				className: u.leading,
				children: e
			}) : null,
			/* @__PURE__ */ (0, N.jsxs)("div", {
				className: u.main,
				children: [t ? /* @__PURE__ */ (0, N.jsx)(Z, {
					size: o,
					truncate: !0,
					wrap: !1,
					className: u.title,
					children: t
				}) : null, n ? /* @__PURE__ */ (0, N.jsx)(Z, {
					size: 200,
					truncate: !0,
					wrap: !1,
					className: u.subtitle,
					children: n
				}) : null]
			}),
			r ? /* @__PURE__ */ (0, N.jsx)("div", {
				className: u.trailing,
				children: r
			}) : null
		]
	});
}
var XC = Object.freeze({
	[AC.XS]: {
		width: U.spacingHorizontalL,
		height: U.spacingVerticalL
	},
	[AC.S]: {
		width: U.spacingHorizontalXL,
		height: U.spacingVerticalXL
	},
	[jC]: {
		width: U.spacingHorizontalXXL,
		height: U.spacingVerticalXXL
	},
	[AC.L]: {
		width: U.spacingHorizontalXXXL,
		height: U.spacingVerticalXXXL
	},
	40: {
		width: `calc(${U.spacingHorizontalXXXL} + ${U.spacingHorizontalS})`,
		height: `calc(${U.spacingVerticalXXXL} + ${U.spacingVerticalS})`
	},
	[AC.XL]: {
		width: `calc(${U.spacingHorizontalXXXL} + ${U.spacingHorizontalL})`,
		height: `calc(${U.spacingVerticalXXXL} + ${U.spacingVerticalL})`
	}
}), ZC = Jn({
	root: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: U.spacingVerticalXXL,
		padding: 0,
		textAlign: "center"
	},
	start: {
		alignItems: "flex-start",
		textAlign: "left"
	},
	compact: { gap: U.spacingVerticalXS },
	icon: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "center",
		color: U.colorNeutralForeground3
	},
	iconLarge: { "& svg": {
		width: "40px",
		height: "40px"
	} },
	title: { color: U.colorNeutralForeground1 },
	action: { marginTop: 0 }
});
function QC({ icon: e, title: t, action: n, align: r = "center", compact: i = !1, iconSize: a = jC, className: o, style: s, ...c }) {
	let l = ZC(), u = jx(fC, "2x1"), d = !i && u === "3x3", f = d ? 40 : a, p = XC[f] || XC[jC];
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		...c,
		className: k(l.root, r === "start" && l.start, i && l.compact, o),
		style: s,
		"data-empty-state": "true",
		"data-align": r,
		"data-compact": i ? "true" : void 0,
		"data-emphasized": d ? "true" : void 0,
		children: [
			e ? /* @__PURE__ */ (0, N.jsx)("div", {
				className: k(l.icon, d && l.iconLarge),
				style: p,
				"data-empty-state-icon-slot": f,
				"aria-hidden": "true",
				children: e
			}) : null,
			t ? /* @__PURE__ */ (0, N.jsx)(Z, {
				size: 400,
				weight: "semibold",
				className: l.title,
				children: t
			}) : null,
			n ? /* @__PURE__ */ (0, N.jsx)("div", {
				className: l.action,
				children: n
			}) : null
		]
	});
}
Jn({
	dot: {
		display: "inline-block",
		flexShrink: 0,
		width: U.spacingHorizontalS,
		height: U.spacingHorizontalS,
		borderRadius: U.borderRadiusCircular
	},
	success: { backgroundColor: U.colorStatusSuccessForeground1 },
	warning: { backgroundColor: U.colorStatusWarningForeground1 },
	danger: { backgroundColor: U.colorStatusDangerForeground1 },
	info: { backgroundColor: U.colorStatusInfoForeground1 },
	neutral: { backgroundColor: U.colorNeutralForeground3 },
	line: {
		display: "inline-flex",
		alignItems: "center",
		gap: U.spacingHorizontalXS,
		minWidth: 0,
		color: U.colorNeutralForeground3
	}
});
var $C = Jn({ count: {
	...TC,
	color: U.colorNeutralForeground3,
	whiteSpace: "nowrap"
} });
function ew({ total: e, shown: t, className: n, style: r, ...i }) {
	let a = $C(), o = typeof t == "number" && t < e, s = o ? `共 ${e} · 显示 ${t}` : `共 ${e}`;
	return /* @__PURE__ */ (0, N.jsx)(Z, {
		...i,
		size: 200,
		className: k(a.count, n),
		style: r,
		"aria-label": o ? `共 ${e} 项，显示 ${t} 项` : `共 ${e} 项`,
		"data-trailing-count": "true",
		children: s
	});
}
Jn({
	root: {
		display: "grid",
		columnGap: U.spacingHorizontalXS,
		alignItems: "end",
		width: "100%",
		minWidth: 0
	},
	column: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: U.spacingVerticalXXS,
		minWidth: 0
	},
	track: {
		display: "flex",
		alignItems: "flex-end",
		width: "100%",
		maxWidth: U.spacingHorizontalXXXL,
		height: U.spacingVerticalXXL,
		marginInline: "auto",
		backgroundColor: U.colorNeutralBackground3,
		borderRadius: U.borderRadiusSmall,
		overflow: "hidden"
	},
	trackTall: { height: U.spacingVerticalXXXL },
	fill: {
		display: "block",
		width: "100%",
		backgroundColor: U.colorNeutralForeground3,
		borderRadius: U.borderRadiusSmall
	},
	fillToday: { backgroundColor: U.colorNeutralForeground1 },
	label: {
		...TC,
		color: U.colorNeutralForeground3
	}
}), Jn({
	root: {
		position: "relative",
		flexShrink: 0,
		width: "100%",
		height: U.strokeWidthThickest,
		borderRadius: U.borderRadiusCircular,
		backgroundColor: U.colorNeutralBackground3,
		overflow: "hidden"
	},
	fill: {
		display: "block",
		height: "100%",
		borderRadius: U.borderRadiusCircular,
		backgroundColor: U.colorBrandBackground
	}
});
var tw = Jn({ button: {
	minWidth: "44px",
	minHeight: "44px"
} }), nw = (0, M.forwardRef)(function({ appearance: e = "secondary", className: t, style: n, children: r, ...i }, a) {
	let o = tw();
	return /* @__PURE__ */ (0, N.jsx)(Wh, {
		...i,
		ref: a,
		type: "button",
		appearance: e,
		size: "large",
		className: k(o.button, t),
		style: n,
		children: r
	});
}), rw = nw, iw = Jn({ root: {
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
	color: U.colorNeutralForeground1,
	fontFamily: U.fontFamilyBase
} });
function aw({ children: e, className: t, style: n }) {
	let r = iw();
	return /* @__PURE__ */ (0, N.jsx)("div", {
		className: k(r.root, t),
		style: n,
		"data-detail-page": "true",
		children: e
	});
}
var ow = Jn({
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "space-between",
		gap: U.spacingHorizontalM,
		minHeight: `${MC}px`,
		paddingInline: 0,
		boxSizing: "border-box"
	},
	leading: {
		display: "flex",
		flex: 1,
		alignItems: "center",
		gap: U.spacingHorizontalM,
		minWidth: 0
	},
	trailing: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: U.spacingHorizontalS
	}
});
function sw({ children: e, trailing: t, className: n, style: r }) {
	let i = ow();
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: k(i.header, n),
		style: r,
		"data-detail-header": "true",
		children: [/* @__PURE__ */ (0, N.jsx)("div", {
			className: i.leading,
			children: e
		}), t ? /* @__PURE__ */ (0, N.jsx)("div", {
			className: i.trailing,
			children: t
		}) : null]
	});
}
var cw = Jn({ toolbar: {
	display: "flex",
	flexShrink: 0,
	alignItems: "center",
	gap: U.spacingHorizontalS,
	minHeight: `${NC}px`,
	paddingInline: 0,
	boxSizing: "border-box"
} });
function lw({ children: e, className: t, style: n }) {
	let r = cw();
	return /* @__PURE__ */ (0, N.jsx)("div", {
		className: k(r.toolbar, t),
		style: n,
		"data-detail-toolbar": "true",
		children: e
	});
}
var uw = Jn({
	tabs: {
		flexShrink: 0,
		height: `${PC}px`,
		minHeight: `${PC}px`,
		paddingInline: 0,
		boxSizing: "border-box",
		overflowX: "auto"
	},
	tab: {
		height: `${PC}px`,
		minHeight: `${PC}px`,
		paddingBlock: 0
	},
	badge: { marginInlineStart: U.spacingHorizontalXS }
});
function dw({ items: e, value: t, onChange: n, ariaLabel: r, className: i, style: a }) {
	let o = uw();
	return !e || e.length === 0 ? null : /* @__PURE__ */ (0, N.jsx)(Vy, {
		size: "medium",
		selectedValue: t,
		onTabSelect: (e, t) => n?.(t.value),
		"aria-label": r,
		className: k(o.tabs, i),
		style: a,
		"data-detail-tabs": "true",
		children: e.map((e) => /* @__PURE__ */ (0, N.jsxs)(db, {
			value: e.value,
			className: o.tab,
			children: [e.label, e.badge ? /* @__PURE__ */ (0, N.jsx)("span", {
				className: o.badge,
				children: (0, M.isValidElement)(e.badge) ? e.badge : /* @__PURE__ */ (0, N.jsx)(Qd, {
					appearance: "tint",
					size: "medium",
					children: e.badge
				})
			}) : null]
		}, e.value))
	});
}
var fw = Jn({
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
		paddingBlock: U.spacingVerticalXXL,
		paddingInline: 0,
		boxSizing: "border-box",
		overscrollBehavior: "contain",
		scrollbarWidth: "thin"
	},
	scrollShadow: {
		position: "absolute",
		right: 0,
		bottom: 0,
		left: 0,
		height: U.spacingVerticalXXL,
		pointerEvents: "none",
		background: `linear-gradient(to top, ${U.colorNeutralBackground1} 0%, color-mix(in srgb, ${U.colorNeutralBackground1} 72%, transparent) 55%, transparent 100%)`,
		opacity: 0
	},
	scrollShadowVisible: { opacity: 1 }
});
function pw(e) {
	let [t, n] = (0, M.useState)(!1);
	return (0, M.useEffect)(() => {
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
function mw({ children: e, className: t, style: n }) {
	let r = fw(), i = (0, M.useRef)(null), a = pw(i);
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: r.wrap,
		"data-scroll-more": a ? "true" : "false",
		children: [/* @__PURE__ */ (0, N.jsx)("div", {
			ref: i,
			className: k(r.scroll, t),
			style: n,
			"data-detail-scroll": "true",
			children: e
		}), /* @__PURE__ */ (0, N.jsx)("div", {
			"aria-hidden": "true",
			"data-scroll-shadow": a ? "visible" : "hidden",
			className: k(r.scrollShadow, a && r.scrollShadowVisible)
		})]
	});
}
var hw = (0, M.createContext)(null), gw = Jn({
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
		backgroundColor: U.colorNeutralBackground1,
		color: U.colorNeutralForeground1,
		fontFamily: U.fontFamilyBase
	},
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: U.spacingHorizontalS,
		minHeight: `${FC}px`,
		paddingInline: 0,
		boxSizing: "border-box"
	},
	title: {
		flex: 1,
		minWidth: 0,
		color: U.colorNeutralForeground1
	},
	trailing: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: U.spacingHorizontalS
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
		paddingBlock: U.spacingVerticalXXL,
		paddingInline: 0,
		boxSizing: "border-box",
		overscrollBehavior: "contain",
		scrollbarWidth: "thin"
	},
	scrollShadow: {
		position: "absolute",
		right: 0,
		bottom: 0,
		left: 0,
		height: U.spacingVerticalXXL,
		pointerEvents: "none",
		background: `linear-gradient(to top, ${U.colorNeutralBackground1} 0%, color-mix(in srgb, ${U.colorNeutralBackground1} 72%, transparent) 55%, transparent 100%)`,
		opacity: 0
	},
	scrollShadowVisible: { opacity: 1 },
	footer: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "flex-end",
		gap: U.spacingHorizontalS,
		paddingBlock: U.spacingVerticalM,
		paddingInline: 0,
		boxSizing: "border-box"
	}
});
function _w({ title: e, trailing: t, footer: n, children: r, onClosed: i, backLabel: a = "返回", className: o, style: s }) {
	let c = gw(), l = (0, M.useRef)(null), u = pw(l), [d, f] = (0, M.useState)(!0), [p, m] = (0, M.useState)("forward"), [h, g] = (0, M.useState)(!0), _ = (0, M.useRef)(!1), v = (0, M.useCallback)(() => {
		_.current || (_.current = !0, m("back"), f(!1));
	}, []), y = (0, M.useCallback)((e, t) => {
		t?.direction === "exit" && (g(!1), i?.());
	}, [i]);
	if (!h) return null;
	let b = typeof n == "function" ? n(v) : n;
	return /* @__PURE__ */ (0, N.jsx)(hw.Provider, {
		value: v,
		children: /* @__PURE__ */ (0, N.jsx)(SC, {
			visible: d,
			appear: !0,
			direction: p,
			unmountOnExit: !0,
			onMotionFinish: y,
			children: /* @__PURE__ */ (0, N.jsxs)("div", {
				className: k(c.root, o),
				style: s,
				"data-subpage": "true",
				children: [
					/* @__PURE__ */ (0, N.jsxs)("div", {
						className: c.header,
						"data-subpage-header": "true",
						children: [
							/* @__PURE__ */ (0, N.jsx)(Wh, {
								appearance: "subtle",
								size: "large",
								icon: /* @__PURE__ */ (0, N.jsx)(Yu, {}),
								"aria-label": a,
								title: a,
								onClick: v,
								style: IC
							}),
							/* @__PURE__ */ (0, N.jsx)(Z, {
								size: 400,
								weight: "semibold",
								truncate: !0,
								wrap: !1,
								className: c.title,
								children: e
							}),
							t ? /* @__PURE__ */ (0, N.jsx)("div", {
								className: c.trailing,
								children: t
							}) : null
						]
					}),
					/* @__PURE__ */ (0, N.jsxs)("div", {
						className: c.contentWrap,
						"data-subpage-scroll-more": u ? "true" : "false",
						children: [/* @__PURE__ */ (0, N.jsx)("div", {
							ref: l,
							className: c.content,
							children: r
						}), /* @__PURE__ */ (0, N.jsx)("div", {
							"aria-hidden": "true",
							"data-subpage-scroll-shadow": u ? "visible" : "hidden",
							className: k(c.scrollShadow, u && c.scrollShadowVisible)
						})]
					}),
					b ? /* @__PURE__ */ (0, N.jsx)("div", {
						className: c.footer,
						children: b
					}) : null
				]
			})
		})
	});
}
//#endregion
//#region public/plugins/todo/src/parts.jsx
var vw = Jn({
	ellipsis: {
		display: "block",
		minWidth: 0,
		maxWidth: "100%",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap"
	},
	ellipsisMuted: { color: U.colorNeutralForeground3 },
	groupHead: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalS,
		minHeight: U.lineHeightBase300,
		paddingBlock: U.spacingVerticalXS,
		minWidth: 0
	},
	groupLabel: {
		color: U.colorNeutralForeground2,
		whiteSpace: "nowrap"
	},
	groupCount: {
		color: U.colorNeutralForeground3,
		fontVariantNumeric: "tabular-nums"
	},
	spacer: {
		flex: 1,
		minWidth: 0
	},
	groupActions: {
		display: "inline-flex",
		alignItems: "center",
		gap: U.spacingHorizontalXS,
		flexShrink: 0
	},
	row: { minWidth: 0 },
	leading: {
		display: "inline-flex",
		alignItems: "center",
		gap: U.spacingHorizontalXS
	},
	checkCell: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		minWidth: "44px",
		minHeight: "44px"
	},
	flag: {
		flexShrink: 0,
		color: U.colorNeutralForeground3
	},
	meta: {
		color: U.colorNeutralForeground3,
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	metaAlert: { color: U.colorStatusDangerForeground1 },
	metaToday: {
		color: U.colorNeutralForeground1,
		fontWeight: U.fontWeightSemibold
	},
	rowTrailing: {
		display: "inline-flex",
		alignItems: "center",
		gap: U.spacingHorizontalXS
	},
	iconButton: {
		minWidth: "44px",
		minHeight: "44px"
	},
	confirmRow: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalS,
		minHeight: U.spacingVerticalXXXL,
		paddingBlock: U.spacingVerticalXXS,
		minWidth: 0
	},
	confirmText: {
		flex: 1,
		minWidth: 0,
		color: U.colorNeutralForeground2
	},
	miniRow: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalXXS,
		minHeight: "44px",
		minWidth: 0,
		borderRadius: U.borderRadiusMedium,
		cursor: "pointer",
		":hover": { backgroundColor: U.colorNeutralBackground1Hover }
	},
	miniTitle: {
		flex: 1,
		minWidth: 0,
		color: U.colorNeutralForeground1
	},
	listGlyph: {
		flexShrink: 0,
		color: U.colorNeutralForeground3
	}
});
function yw({ children: e, muted: t = !1 }) {
	let n = vw();
	return /* @__PURE__ */ (0, N.jsx)("span", {
		className: k(n.ellipsis, t && n.ellipsisMuted),
		children: e
	});
}
function bw({ priority: e, className: t }) {
	let n = vw(), r = fS(e);
	return /* @__PURE__ */ (0, N.jsx)(e > 0 ? Ku : qu, {
		"aria-label": e > 0 ? `优先级：${r.label}` : "无优先级",
		className: k(n.flag, t)
	});
}
function xw({ task: e, now: t, className: n }) {
	let r = vw(), i = Q(e.dueAt);
	if (!i) return null;
	let a = i < qx(t), o = !a && $x(i, t), s = a ? `已逾期 · ${iS(i, t)}` : aS(i, t);
	return /* @__PURE__ */ (0, N.jsx)(Z, {
		size: 200,
		truncate: !0,
		className: k(r.meta, a && r.metaAlert, o && r.metaToday, n),
		children: s
	});
}
function Sw({ task: e, onToggle: t }) {
	let n = vw();
	return /* @__PURE__ */ (0, N.jsx)("span", {
		className: n.checkCell,
		children: /* @__PURE__ */ (0, N.jsx)(kg, {
			checked: e.done,
			"aria-label": e.done ? `取消完成：${e.title}` : `完成：${e.title}`,
			onChange: () => t(e.id),
			onClick: (e) => e.stopPropagation(),
			onPointerDown: (e) => e.stopPropagation()
		})
	});
}
function Cw({ label: e, count: t, trailing: n }) {
	let r = vw();
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: r.groupHead,
		children: [
			/* @__PURE__ */ (0, N.jsx)(Z, {
				size: 300,
				weight: "semibold",
				className: r.groupLabel,
				children: e
			}),
			typeof t == "number" ? /* @__PURE__ */ (0, N.jsx)(Z, {
				size: 200,
				className: r.groupCount,
				children: t
			}) : null,
			/* @__PURE__ */ (0, N.jsx)("span", { className: r.spacer }),
			n ? /* @__PURE__ */ (0, N.jsx)("div", {
				className: r.groupActions,
				children: n
			}) : null
		]
	});
}
function ww({ task: e, now: t, onOpen: n, onToggle: r, onRemove: i }) {
	let a = vw(), [o, s] = (0, M.useState)(!1);
	return o ? /* @__PURE__ */ (0, N.jsxs)("div", {
		className: a.confirmRow,
		role: "group",
		"aria-label": `确认删除任务 ${e.title}`,
		children: [
			/* @__PURE__ */ (0, N.jsx)(Z, {
				size: 300,
				className: a.confirmText,
				children: /* @__PURE__ */ (0, N.jsxs)(yw, { children: [
					"删除「",
					e.title,
					"」？删除后不可恢复"
				] })
			}),
			/* @__PURE__ */ (0, N.jsx)(nw, {
				appearance: "secondary",
				onClick: () => s(!1),
				children: "取消"
			}),
			/* @__PURE__ */ (0, N.jsx)(nw, {
				appearance: "secondary",
				onClick: () => {
					s(!1), i?.(e.id);
				},
				children: "删除"
			})
		]
	}) : /* @__PURE__ */ (0, N.jsx)(YC, {
		className: a.row,
		leading: /* @__PURE__ */ (0, N.jsxs)("span", {
			className: a.leading,
			children: [/* @__PURE__ */ (0, N.jsx)(Sw, {
				task: e,
				onToggle: r
			}), /* @__PURE__ */ (0, N.jsx)(bw, { priority: e.priority })]
		}),
		title: /* @__PURE__ */ (0, N.jsx)(yw, {
			muted: e.done,
			children: e.title
		}),
		titleSize: 400,
		trailing: /* @__PURE__ */ (0, N.jsxs)("span", {
			className: a.rowTrailing,
			children: [/* @__PURE__ */ (0, N.jsx)(xw, {
				task: e,
				now: t
			}), /* @__PURE__ */ (0, N.jsxs)(yv, { children: [/* @__PURE__ */ (0, N.jsx)(ay, {
				disableButtonEnhancement: !0,
				children: /* @__PURE__ */ (0, N.jsx)(Oh, {
					content: "任务操作",
					relationship: "label",
					children: /* @__PURE__ */ (0, N.jsx)(Wh, {
						appearance: "subtle",
						size: "large",
						className: a.iconButton,
						icon: /* @__PURE__ */ (0, N.jsx)(Lu, {}),
						"aria-label": `任务操作：${e.title}`,
						onClick: (e) => e.stopPropagation()
					})
				})
			}), /* @__PURE__ */ (0, N.jsx)($v, { children: /* @__PURE__ */ (0, N.jsx)("div", {
				onClick: (e) => e.stopPropagation(),
				children: /* @__PURE__ */ (0, N.jsxs)(Kv, { children: [/* @__PURE__ */ (0, N.jsx)(Nv, {
					icon: /* @__PURE__ */ (0, N.jsx)(Gu, {}),
					onClick: () => n?.(e.id),
					children: "编辑"
				}), /* @__PURE__ */ (0, N.jsx)(Nv, {
					icon: /* @__PURE__ */ (0, N.jsx)(K, {}),
					onClick: () => s(!0),
					children: "删除"
				})] })
			}) })] })]
		}),
		onClick: () => n?.(e.id)
	});
}
function Tw({ task: e, onOpen: t, onToggle: n }) {
	let r = vw();
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: r.miniRow,
		role: "button",
		tabIndex: 0,
		"aria-label": `${e.title}${e.done ? "（已完成）" : ""}`,
		onClick: () => t?.(e.id),
		onKeyDown: (n) => {
			n.target === n.currentTarget && (n.key === "Enter" || n.key === " ") && (n.preventDefault(), t?.(e.id));
		},
		children: [/* @__PURE__ */ (0, N.jsx)(Sw, {
			task: e,
			onToggle: n
		}), /* @__PURE__ */ (0, N.jsx)(Z, {
			size: 200,
			className: r.miniTitle,
			children: /* @__PURE__ */ (0, N.jsx)(yw, {
				muted: e.done,
				children: e.title
			})
		})]
	});
}
function Ew() {
	let e = vw();
	return /* @__PURE__ */ (0, N.jsx)(Ju, {
		className: e.listGlyph,
		"aria-hidden": "true"
	});
}
function Dw(e) {
	let t = (0, M.useRef)(null), n = e.join("|"), r = (0, M.useMemo)(() => {
		if (t.current === null) return /* @__PURE__ */ new Set();
		let n = t.current;
		return new Set(e.filter((e) => !n.has(e)));
	}, [n]);
	return (0, M.useEffect)(() => {
		t.current = new Set(e);
	}, [n]), r;
}
//#endregion
//#region public/plugins/todo/src/TodoCard.jsx
var Ow = Number.parseFloat(vl.spacingVerticalXXL), kw = Jn({
	root: {
		boxSizing: "border-box",
		color: U.colorNeutralForeground1
	},
	summaryContent: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: U.spacingVerticalXXS,
		minWidth: 0
	},
	summaryLabels: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: U.spacingHorizontalS,
		width: "100%",
		minWidth: 0,
		minHeight: U.lineHeightBase300
	},
	summaryLabel: {
		color: U.colorNeutralForeground2,
		whiteSpace: "nowrap"
	},
	danger: {
		color: U.colorStatusDangerForeground1,
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	rowTrailing: {
		display: "inline-flex",
		alignItems: "baseline",
		gap: U.spacingHorizontalXS,
		minWidth: 0
	},
	rowSecondary: {
		color: U.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	rows: {
		minWidth: 0,
		minHeight: 0
	},
	emptyFill: {
		flex: 1,
		minHeight: 0
	},
	emptyCompact: {
		flex: 1,
		minHeight: 0
	},
	leading: {
		display: "inline-flex",
		alignItems: "center",
		gap: U.spacingHorizontalXS
	},
	checkCell: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		minWidth: "44px",
		minHeight: "44px"
	},
	row: { minWidth: 0 }
});
function Aw(e) {
	let t = Jx(qx(e), 1);
	return $.state.tasks.filter((n) => {
		if (n.done || !n.dueAt) return !1;
		let r = Q(n.dueAt);
		return r ? r < t || $x(r, e) : !1;
	});
}
function jw() {
	let [e, t] = (0, M.useState)(() => typeof window > "u" ? 0 : window.innerHeight);
	return (0, M.useEffect)(() => {
		let e = () => t(window.innerHeight);
		return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
	}, []), e;
}
function Mw(e, t) {
	let n = Math.max(0, e - DC * 2), r = Math.max(0, n - Ow - OC);
	return Math.max(0, Math.min(t, Math.floor((r + 4) / 48)));
}
function Nw({ task: e, onToggle: t }) {
	let n = kw();
	return /* @__PURE__ */ (0, N.jsx)("span", {
		className: n.checkCell,
		children: /* @__PURE__ */ (0, N.jsx)(kg, {
			checked: e.done,
			"aria-label": `完成：${e.title}`,
			onChange: () => t(e.id),
			onClick: (e) => e.stopPropagation(),
			onPointerDown: (e) => e.stopPropagation()
		})
	});
}
function Pw({ task: e, kind: t }) {
	let n = kw(), r = [];
	if (t === "medium" || t === "wide" || t === "full") {
		let t = $.listById(e.listId);
		t?.name && r.push(t.name);
	}
	if (t === "full" && e.subtasks?.length) {
		let t = e.subtasks.filter((e) => e.done).length;
		r.push(`子任务 ${t}/${e.subtasks.length}`);
	}
	return r.length ? /* @__PURE__ */ (0, N.jsx)(Z, {
		size: 200,
		className: n.rowSecondary,
		children: r.join(" · ")
	}) : null;
}
function Fw({ total: e, shown: t }) {
	return /* @__PURE__ */ (0, N.jsx)(UC, {
		icon: /* @__PURE__ */ (0, N.jsx)(Hu, {}),
		label: "待办",
		disclosure: !0,
		trailing: /* @__PURE__ */ (0, N.jsx)(ew, {
			total: e,
			shown: t
		})
	});
}
function Iw({ defaultSizeKey: t = "3x3" }) {
	let n = kw();
	tC();
	let r = jx(lC, t), i = oC(r), a = jw(), [o] = Nx(LS, RS, VS), s = /* @__PURE__ */ new Date(), c = $.sortTasks(Aw(s), o.defaultSort), l = c.filter((e) => Q(e.dueAt) < qx(s)).length, u = $.state.tasks.length > 0, d = Mw(a, sC(r)), f = d > 0 ? c.slice(0, d) : [];
	Hx(YS, (0, M.useMemo)(() => iC(), [])), (0, M.useEffect)(() => e.onFocus(() => {
		let e = document.querySelector("[data-card-root]");
		(e?.querySelector("input[type=\"checkbox\"], button") || e)?.focus?.();
	}), []), (0, M.useEffect)(() => {
		let e = (e) => {
			e.key === "Escape" && (e.preventDefault(), Ux());
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, []);
	let p = (e) => {
		let t = $.taskById(e);
		t && $.setDone(e, !t.done);
	}, m = `今日待办 ${c.length} 项${l ? `，已逾期 ${l} 项` : ""}，显示 ${f.length} 项，点击打开详情`;
	return i === "summary" ? c.length === 0 ? /* @__PURE__ */ (0, N.jsx)(BC, {
		ariaLabel: `${u ? "今日没有待办" : "还没有待办"}，点击打开详情`,
		onActivate: nC,
		className: n.root,
		children: /* @__PURE__ */ (0, N.jsx)(QC, {
			className: n.emptyCompact,
			align: "center",
			compact: !0,
			icon: /* @__PURE__ */ (0, N.jsx)(Uu, {}),
			title: u ? "今日没有待办" : "还没有待办",
			action: /* @__PURE__ */ (0, N.jsx)(nw, {
				appearance: "secondary",
				icon: u ? /* @__PURE__ */ (0, N.jsx)(td, {}) : /* @__PURE__ */ (0, N.jsx)(Wu, {}),
				onClick: nC,
				children: u ? "查看全部" : "添加待办"
			})
		})
	}) : /* @__PURE__ */ (0, N.jsxs)(BC, {
		ariaLabel: m,
		onActivate: nC,
		className: n.root,
		children: [/* @__PURE__ */ (0, N.jsx)(UC, {
			icon: /* @__PURE__ */ (0, N.jsx)(Hu, {}),
			compact: !0
		}), /* @__PURE__ */ (0, N.jsxs)("div", {
			className: n.summaryContent,
			children: [/* @__PURE__ */ (0, N.jsx)(GC, { children: c.length }), /* @__PURE__ */ (0, N.jsxs)("div", {
				className: n.summaryLabels,
				children: [/* @__PURE__ */ (0, N.jsx)(Z, {
					size: 300,
					className: n.summaryLabel,
					children: "今日待办"
				}), l > 0 ? /* @__PURE__ */ (0, N.jsxs)(Z, {
					size: 200,
					className: n.danger,
					children: ["逾期 ", l]
				}) : null]
			})]
		})]
	}) : f.length === 0 ? /* @__PURE__ */ (0, N.jsxs)(BC, {
		ariaLabel: m,
		onActivate: nC,
		className: n.root,
		children: [/* @__PURE__ */ (0, N.jsx)(Fw, {
			total: c.length,
			shown: 0
		}), /* @__PURE__ */ (0, N.jsx)(QC, {
			className: n.emptyFill,
			align: "start",
			icon: /* @__PURE__ */ (0, N.jsx)(Uu, {}),
			title: u ? "今日没有待办" : "还没有待办",
			action: /* @__PURE__ */ (0, N.jsx)(nw, {
				appearance: "secondary",
				icon: u ? /* @__PURE__ */ (0, N.jsx)(td, {}) : /* @__PURE__ */ (0, N.jsx)(Wu, {}),
				onClick: nC,
				children: u ? "查看全部" : "添加待办"
			})
		})]
	}) : /* @__PURE__ */ (0, N.jsxs)(BC, {
		ariaLabel: m,
		onActivate: nC,
		className: n.root,
		children: [/* @__PURE__ */ (0, N.jsx)(Fw, {
			total: c.length,
			shown: f.length
		}), /* @__PURE__ */ (0, N.jsx)(qC, {
			className: n.rows,
			children: f.map((e) => /* @__PURE__ */ (0, N.jsx)(YC, {
				className: n.row,
				leading: /* @__PURE__ */ (0, N.jsxs)("span", {
					className: n.leading,
					children: [/* @__PURE__ */ (0, N.jsx)(Nw, {
						task: e,
						onToggle: p
					}), /* @__PURE__ */ (0, N.jsx)(bw, { priority: e.priority })]
				}),
				title: /* @__PURE__ */ (0, N.jsx)(yw, { children: e.title }),
				titleSize: 400,
				trailing: /* @__PURE__ */ (0, N.jsxs)("span", {
					className: n.rowTrailing,
					children: [/* @__PURE__ */ (0, N.jsx)(Pw, {
						task: e,
						kind: i
					}), /* @__PURE__ */ (0, N.jsx)(xw, {
						task: e,
						now: s
					})]
				})
			}, e.id))
		})]
	});
}
//#endregion
//#region public/plugins/todo/src/ListView.jsx
var Lw = Jn({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: U.spacingVerticalXL,
		minWidth: 0
	},
	group: {
		display: "flex",
		flexDirection: "column",
		minWidth: 0
	},
	rows: {
		display: "flex",
		flexDirection: "column",
		minWidth: 0
	},
	rowWrap: { minWidth: 0 },
	muted: {
		color: U.colorNeutralForeground3,
		paddingBlock: U.spacingVerticalS
	},
	clearConfirm: {
		display: "inline-flex",
		alignItems: "center",
		gap: U.spacingHorizontalXS
	},
	confirmText: { color: U.colorNeutralForeground3 }
});
function Rw(e, t) {
	return $.sortTasks(e, t.defaultSort);
}
function zw({ tasks: e, settings: t, now: n, newIds: r, removingId: i, onOpen: a, onToggle: o, onRequestRemove: s, onRemoved: c }) {
	let l = Lw();
	return e.map((e) => /* @__PURE__ */ (0, N.jsx)(vC, {
		visible: i !== e.id,
		appear: r.has(e.id),
		unmountOnExit: !0,
		onMotionFinish: (t, n) => {
			n?.direction === "exit" && i === e.id && ($.removeTask(e.id), c());
		},
		children: /* @__PURE__ */ (0, N.jsx)("div", {
			className: l.rowWrap,
			"data-task-id": e.id,
			"data-removing": i === e.id ? "true" : "false",
			children: /* @__PURE__ */ (0, N.jsx)(ww, {
				task: e,
				now: n,
				settings: t,
				onOpen: a,
				onToggle: o,
				onRemove: s
			})
		})
	}, e.id));
}
function Bw({ tasks: e, query: t, settings: n, now: r, listId: i, onOpenTask: a, onToggleTask: o, onAddTask: s, onClearSearch: c }) {
	let l = Lw(), [u, d] = (0, M.useState)(null), [f, p] = (0, M.useState)(!1), [m, h] = (0, M.useState)(!1), g = t.trim(), _ = g ? $.searchTasks(g).filter((e) => i === "all" || e.listId === i) : [], v = qx(r), y = Jx(v, 1), b = e.filter((e) => !e.done), x = e.filter((e) => e.done), S = [
		{
			key: "overdue",
			label: "已逾期",
			tasks: []
		},
		{
			key: "today",
			label: "今天",
			tasks: []
		},
		{
			key: "tomorrow",
			label: "明天",
			tasks: []
		},
		{
			key: "later",
			label: "以后",
			tasks: []
		},
		{
			key: "nodate",
			label: "无日期",
			tasks: []
		}
	], C = Object.fromEntries(S.map((e) => [e.key, e]));
	for (let e of b) {
		let t = Q(e.dueAt);
		t ? t < v ? C.overdue.tasks.push(e) : $x(t, r) ? C.today.tasks.push(e) : $x(t, y) ? C.tomorrow.tasks.push(e) : C.later.tasks.push(e) : C.nodate.tasks.push(e);
	}
	for (let e of S) e.tasks = Rw(e.tasks, n);
	let w = $.sortTasks(x, "created").slice().sort((e, t) => (Q(t.doneAt)?.getTime() || 0) - (Q(e.doneAt)?.getTime() || 0)), T = S.filter((e) => e.tasks.length > 0), E = Dw(g ? _.map((e) => e.id) : T.flatMap((e) => e.tasks.map((e) => e.id)).concat(w.map((e) => e.id)));
	return g ? /* @__PURE__ */ (0, N.jsxs)("div", {
		className: l.root,
		children: [/* @__PURE__ */ (0, N.jsx)(Cw, { label: `搜索结果 · ${_.length}` }), _.length === 0 ? /* @__PURE__ */ (0, N.jsx)(QC, {
			icon: /* @__PURE__ */ (0, N.jsx)(Iu, {}),
			title: "没有匹配的任务",
			action: /* @__PURE__ */ (0, N.jsx)(rw, {
				icon: /* @__PURE__ */ (0, N.jsx)(ad, {}),
				onClick: c,
				children: "清除搜索"
			})
		}) : /* @__PURE__ */ (0, N.jsx)("div", {
			className: l.rows,
			children: /* @__PURE__ */ (0, N.jsx)(zw, {
				tasks: _,
				settings: n,
				now: r,
				newIds: E,
				removingId: u,
				onOpen: a,
				onToggle: o,
				onRequestRemove: d,
				onRemoved: () => d(null)
			})
		})]
	}) : b.length === 0 && w.length === 0 ? /* @__PURE__ */ (0, N.jsx)(QC, {
		icon: /* @__PURE__ */ (0, N.jsx)(Uu, {}),
		title: "还没有任务",
		action: /* @__PURE__ */ (0, N.jsx)(rw, {
			appearance: "secondary",
			icon: /* @__PURE__ */ (0, N.jsx)(Wu, {}),
			onClick: s,
			children: "添加任务"
		})
	}) : /* @__PURE__ */ (0, N.jsxs)("div", {
		className: l.root,
		children: [
			b.length === 0 ? /* @__PURE__ */ (0, N.jsx)(Z, {
				size: 300,
				className: l.muted,
				children: "没有未完成任务"
			}) : null,
			T.map((e) => /* @__PURE__ */ (0, N.jsxs)("section", {
				className: l.group,
				"aria-label": `${e.label}（${e.tasks.length}）`,
				children: [/* @__PURE__ */ (0, N.jsx)(Cw, {
					label: e.label,
					count: e.tasks.length
				}), /* @__PURE__ */ (0, N.jsx)("div", {
					className: l.rows,
					children: /* @__PURE__ */ (0, N.jsx)(zw, {
						tasks: e.tasks,
						settings: n,
						now: r,
						newIds: E,
						removingId: u,
						onOpen: a,
						onToggle: o,
						onRequestRemove: d,
						onRemoved: () => d(null)
					})
				})]
			}, e.key)),
			n.showCompleted && w.length > 0 ? /* @__PURE__ */ (0, N.jsxs)("section", {
				className: l.group,
				"aria-label": `已完成（${w.length}）`,
				children: [/* @__PURE__ */ (0, N.jsx)(Cw, {
					label: "已完成",
					count: w.length,
					trailing: m ? /* @__PURE__ */ (0, N.jsxs)("span", {
						className: l.clearConfirm,
						children: [
							/* @__PURE__ */ (0, N.jsxs)(Z, {
								size: 200,
								className: l.confirmText,
								children: [
									"清空 ",
									w.length,
									" 条？"
								]
							}),
							/* @__PURE__ */ (0, N.jsx)(rw, {
								appearance: "secondary",
								onClick: () => h(!1),
								children: "取消"
							}),
							/* @__PURE__ */ (0, N.jsx)(rw, {
								appearance: "secondary",
								onClick: () => {
									$.clearCompleted({ listId: i === "all" ? void 0 : i }), h(!1);
								},
								children: "清空"
							})
						]
					}) : /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [/* @__PURE__ */ (0, N.jsx)(rw, {
						appearance: "subtle",
						onClick: () => p((e) => !e),
						"aria-expanded": f,
						children: f ? "收起" : "展开"
					}), /* @__PURE__ */ (0, N.jsx)(rw, {
						appearance: "subtle",
						onClick: () => h(!0),
						children: "清空"
					})] })
				}), /* @__PURE__ */ (0, N.jsx)(bC, {
					visible: f,
					unmountOnExit: !0,
					children: /* @__PURE__ */ (0, N.jsx)("div", {
						className: l.rows,
						children: /* @__PURE__ */ (0, N.jsx)(zw, {
							tasks: w,
							settings: n,
							now: r,
							newIds: E,
							removingId: u,
							onOpen: a,
							onToggle: o,
							onRequestRemove: d,
							onRemoved: () => d(null)
						})
					})
				})]
			}) : null
		]
	});
}
//#endregion
//#region public/plugins/todo/src/TimeViews.jsx
var Vw = Jn({
	view: {
		display: "flex",
		flexDirection: "column",
		gap: U.spacingVerticalM,
		minWidth: 0
	},
	toolbar: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalXS,
		minHeight: U.spacingVerticalXXXL,
		flexWrap: "wrap"
	},
	toolbarTitle: {
		color: U.colorNeutralForeground1,
		whiteSpace: "nowrap"
	},
	spacer: {
		flex: 1,
		minWidth: 0
	},
	weekdays: {
		display: "grid",
		gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
		gap: U.spacingHorizontalXXS
	},
	weekday: {
		textAlign: "center",
		color: U.colorNeutralForeground3,
		paddingBlock: U.spacingVerticalXXS
	},
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
		gap: U.spacingHorizontalXXS
	},
	dayCell: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: U.spacingVerticalXXS,
		minWidth: 0,
		minHeight: "44px",
		padding: 0,
		borderRadius: U.borderRadiusMedium
	},
	daySelected: { backgroundColor: U.colorNeutralBackground1Selected },
	dayToday: {
		boxShadow: `inset 0 0 0 ${U.strokeWidthThin} ${U.colorNeutralStroke1}`,
		color: U.colorNeutralForeground1,
		fontWeight: U.fontWeightSemibold
	},
	dayOther: { color: U.colorNeutralForeground3 },
	dayCount: {
		color: U.colorNeutralForeground3,
		fontVariantNumeric: "tabular-nums"
	},
	dots: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalXXS,
		height: U.spacingHorizontalSNudge
	},
	dot: {
		width: U.spacingHorizontalSNudge,
		height: U.spacingHorizontalSNudge,
		borderRadius: U.borderRadiusCircular,
		backgroundColor: U.colorNeutralForeground3
	},
	dayHead: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalS,
		minHeight: U.spacingVerticalXXXL
	},
	rows: {
		display: "flex",
		flexDirection: "column",
		minWidth: 0
	},
	muted: { color: U.colorNeutralForeground3 },
	weekGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
		gap: U.spacingHorizontalS,
		alignItems: "start",
		minWidth: 0
	},
	weekCol: {
		display: "flex",
		flexDirection: "column",
		minWidth: 0,
		minHeight: "44px"
	},
	weekHead: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: U.spacingHorizontalXS,
		paddingBlock: U.spacingVerticalXS,
		color: U.colorNeutralForeground3
	},
	weekTasks: {
		display: "flex",
		flexDirection: "column",
		minWidth: 0
	},
	monthGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
		gridTemplateRows: "repeat(6, minmax(44px, auto))",
		gap: U.spacingHorizontalXXS
	},
	heatStats: {
		display: "flex",
		alignItems: "baseline",
		gap: U.spacingHorizontalXS,
		flexWrap: "wrap",
		minHeight: U.spacingVerticalXXXL
	},
	heatValue: {
		color: U.colorNeutralForeground1,
		fontVariantNumeric: "tabular-nums"
	},
	heatLabel: { color: U.colorNeutralForeground3 },
	heatGrid: {
		display: "grid",
		gridAutoFlow: "column",
		gridTemplateRows: `repeat(7, ${U.spacingHorizontalXXXL})`,
		gridAutoColumns: U.spacingHorizontalXXXL,
		justifyContent: "center",
		gap: U.spacingHorizontalXXS
	},
	heatCell: {
		width: U.spacingHorizontalXXXL,
		height: U.spacingHorizontalXXXL,
		borderRadius: U.borderRadiusSmall
	},
	heat0: { backgroundColor: U.colorNeutralBackground2 },
	heat1: { backgroundColor: U.colorNeutralBackground4 },
	heat2: { backgroundColor: U.colorNeutralForeground4 },
	heat3: { backgroundColor: U.colorNeutralForeground3 },
	heat4: { backgroundColor: U.colorNeutralForeground2 },
	legend: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end",
		gap: U.spacingHorizontalXS,
		color: U.colorNeutralForeground3
	},
	legendSwatch: {
		width: U.spacingHorizontalM,
		height: U.spacingHorizontalM,
		borderRadius: U.borderRadiusSmall
	}
});
function Hw(e) {
	let t = Q(e);
	return t ? `${t.getMonth() + 1}月${t.getDate()}日` : "";
}
function Uw(e) {
	let t = Q(e) || /* @__PURE__ */ new Date();
	return `${t.getFullYear()}年${t.getMonth() + 1}月`;
}
function Ww(e, t) {
	let n = new Date(e.getFullYear(), e.getMonth(), 1), r = Jx(n, -((n.getDay() - t + 7) % 7));
	return Array.from({ length: 42 }, (e, t) => Jx(r, t));
}
function Gw(e, t) {
	return e.filter((e) => e.dueAt && Kx(e.dueAt) === t);
}
function Kw({ tasks: e, now: t, settings: n, onOpenTask: r, onToggleTask: i, onAddDay: a }) {
	let o = Vw(), s = $.sortTasks(e, "due");
	return s.length === 0 ? /* @__PURE__ */ (0, N.jsx)(QC, {
		icon: /* @__PURE__ */ (0, N.jsx)(Pu, {}),
		title: "这天没有任务",
		action: /* @__PURE__ */ (0, N.jsx)(rw, {
			icon: /* @__PURE__ */ (0, N.jsx)(Wu, {}),
			onClick: a,
			children: "添加任务"
		})
	}) : /* @__PURE__ */ (0, N.jsx)("div", {
		className: o.rows,
		children: s.map((e) => /* @__PURE__ */ (0, N.jsx)(ww, {
			task: e,
			now: t,
			settings: n,
			onOpen: r,
			onToggle: i,
			onRemove: (e) => $.removeTask(e)
		}, e.id))
	});
}
function qw({ tasks: e, now: t, settings: n, onOpenTask: r, onToggleTask: i, onAddDay: a }) {
	let o = Vw(), [s, c] = (0, M.useState)(() => Qx(t)), [l, u] = (0, M.useState)(() => Kx(t)), d = n.weekStart, f = sS(d), p = Ww(s, d), m = /* @__PURE__ */ new Date(`${l}T00:00:00`), h = Gw(e, l), g = h.filter((e) => !e.done).length;
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: o.view,
		children: [
			/* @__PURE__ */ (0, N.jsxs)("div", {
				className: o.toolbar,
				children: [
					/* @__PURE__ */ (0, N.jsx)(Wh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, N.jsx)($u, {}),
						"aria-label": "上个月",
						onClick: () => c(new Date(s.getFullYear(), s.getMonth() - 1, 1))
					}),
					/* @__PURE__ */ (0, N.jsx)(Z, {
						size: 300,
						weight: "semibold",
						className: o.toolbarTitle,
						"aria-live": "polite",
						children: Uw(s)
					}),
					/* @__PURE__ */ (0, N.jsx)(Wh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, N.jsx)(td, {}),
						"aria-label": "下个月",
						onClick: () => c(new Date(s.getFullYear(), s.getMonth() + 1, 1))
					}),
					/* @__PURE__ */ (0, N.jsx)("span", { className: o.spacer }),
					/* @__PURE__ */ (0, N.jsx)(rw, {
						appearance: "subtle",
						icon: /* @__PURE__ */ (0, N.jsx)(Nu, {}),
						onClick: () => {
							c(Qx(t)), u(Kx(t));
						},
						children: "今天"
					})
				]
			}),
			/* @__PURE__ */ (0, N.jsx)("div", {
				className: o.weekdays,
				"aria-hidden": "true",
				children: f.map((e) => /* @__PURE__ */ (0, N.jsx)(Z, {
					size: 200,
					className: o.weekday,
					children: e
				}, e))
			}),
			/* @__PURE__ */ (0, N.jsx)("div", {
				className: o.grid,
				role: "grid",
				"aria-label": "日历",
				children: p.map((n) => {
					let r = Kx(n), i = e.filter((e) => !e.done && e.dueAt && Kx(e.dueAt) === r).length, a = n.getMonth() !== s.getMonth(), c = $x(n, t), d = r === l;
					return /* @__PURE__ */ (0, N.jsxs)(Wh, {
						appearance: "transparent",
						className: k(o.dayCell, d && o.daySelected, c && o.dayToday, a && o.dayOther),
						"aria-label": `${n.getMonth() + 1}月${n.getDate()}日，${i} 项未完成`,
						"aria-pressed": d,
						onClick: () => u(r),
						children: [/* @__PURE__ */ (0, N.jsx)(Z, {
							size: 300,
							children: n.getDate()
						}), i > 0 ? /* @__PURE__ */ (0, N.jsx)(Z, {
							size: 200,
							className: o.dayCount,
							children: i
						}) : null]
					}, r);
				})
			}),
			/* @__PURE__ */ (0, N.jsx)("div", {
				className: o.dayHead,
				children: /* @__PURE__ */ (0, N.jsxs)(Z, {
					size: 300,
					weight: "semibold",
					children: [
						Hw(m),
						" · ",
						g,
						" 项"
					]
				})
			}),
			/* @__PURE__ */ (0, N.jsx)(Kw, {
				tasks: h,
				now: t,
				settings: n,
				onOpenTask: r,
				onToggleTask: i,
				onAddDay: () => a(l)
			})
		]
	});
}
function Jw({ tasks: e, now: t, settings: n, onOpenTask: r, onToggleTask: i }) {
	let a = Vw(), o = n.weekStart, [s, c] = (0, M.useState)(() => Zx(t, o)), l = sS(o), u = Array.from({ length: 7 }, (e, t) => Jx(s, t)), d = u.reduce((t, n) => t + Gw(e, Kx(n)).length, 0);
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: a.view,
		children: [
			/* @__PURE__ */ (0, N.jsxs)("div", {
				className: a.toolbar,
				children: [
					/* @__PURE__ */ (0, N.jsx)(Wh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, N.jsx)($u, {}),
						"aria-label": "上一周",
						onClick: () => c(Jx(s, -7))
					}),
					/* @__PURE__ */ (0, N.jsxs)(Z, {
						size: 300,
						weight: "semibold",
						className: a.toolbarTitle,
						"aria-live": "polite",
						children: [
							Hw(u[0]),
							" – ",
							Hw(u[6])
						]
					}),
					/* @__PURE__ */ (0, N.jsx)(Wh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, N.jsx)(td, {}),
						"aria-label": "下一周",
						onClick: () => c(Jx(s, 7))
					}),
					/* @__PURE__ */ (0, N.jsx)("span", { className: a.spacer }),
					/* @__PURE__ */ (0, N.jsx)(rw, {
						appearance: "subtle",
						icon: /* @__PURE__ */ (0, N.jsx)(Nu, {}),
						onClick: () => c(Zx(t, o)),
						children: "今天"
					})
				]
			}),
			/* @__PURE__ */ (0, N.jsx)("div", {
				className: a.weekGrid,
				children: u.map((n, o) => {
					let s = Kx(n), c = Gw(e, s).sort((e, t) => Number(e.done) - Number(t.done) || (Q(e.dueAt)?.getTime() || 0) - (Q(t.dueAt)?.getTime() || 0));
					return /* @__PURE__ */ (0, N.jsxs)("div", {
						className: a.weekCol,
						children: [/* @__PURE__ */ (0, N.jsxs)("div", {
							className: k(a.weekHead, $x(n, t) && a.dayToday),
							children: [/* @__PURE__ */ (0, N.jsx)(Z, {
								size: 200,
								children: l[o]
							}), /* @__PURE__ */ (0, N.jsx)(Z, {
								size: 300,
								weight: $x(n, t) ? "semibold" : "regular",
								children: n.getDate()
							})]
						}), /* @__PURE__ */ (0, N.jsx)("div", {
							className: a.weekTasks,
							children: c.map((e) => /* @__PURE__ */ (0, N.jsx)(Tw, {
								task: e,
								onOpen: r,
								onToggle: i
							}, e.id))
						})]
					}, s);
				})
			}),
			d === 0 ? /* @__PURE__ */ (0, N.jsx)(Z, {
				size: 300,
				className: a.muted,
				children: "这一周还没有任务"
			}) : null
		]
	});
}
function Yw({ tasks: e, now: t, settings: n, onOpenTask: r, onToggleTask: i, onAddDay: a }) {
	let o = Vw(), s = n.weekStart, [c, l] = (0, M.useState)(() => Qx(t)), [u, d] = (0, M.useState)(() => Kx(t)), f = sS(s), p = Ww(c, s), m = Gw(e, u), h = m.filter((e) => !e.done).length;
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: o.view,
		children: [
			/* @__PURE__ */ (0, N.jsxs)("div", {
				className: o.toolbar,
				children: [
					/* @__PURE__ */ (0, N.jsx)(Wh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, N.jsx)($u, {}),
						"aria-label": "上个月",
						onClick: () => l(new Date(c.getFullYear(), c.getMonth() - 1, 1))
					}),
					/* @__PURE__ */ (0, N.jsx)(Z, {
						size: 300,
						weight: "semibold",
						className: o.toolbarTitle,
						"aria-live": "polite",
						children: Uw(c)
					}),
					/* @__PURE__ */ (0, N.jsx)(Wh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, N.jsx)(td, {}),
						"aria-label": "下个月",
						onClick: () => l(new Date(c.getFullYear(), c.getMonth() + 1, 1))
					}),
					/* @__PURE__ */ (0, N.jsx)("span", { className: o.spacer }),
					/* @__PURE__ */ (0, N.jsx)(rw, {
						appearance: "subtle",
						icon: /* @__PURE__ */ (0, N.jsx)(Nu, {}),
						onClick: () => {
							l(Qx(t)), d(Kx(t));
						},
						children: "今天"
					})
				]
			}),
			/* @__PURE__ */ (0, N.jsx)("div", {
				className: o.weekdays,
				"aria-hidden": "true",
				children: f.map((e) => /* @__PURE__ */ (0, N.jsx)(Z, {
					size: 200,
					className: o.weekday,
					children: e
				}, e))
			}),
			/* @__PURE__ */ (0, N.jsx)("div", {
				className: o.monthGrid,
				role: "grid",
				"aria-label": "月视图",
				children: p.map((n) => {
					let r = Kx(n), i = e.filter((e) => !e.done && e.dueAt && Kx(e.dueAt) === r).slice(0, 2), a = n.getMonth() !== c.getMonth(), s = r === u;
					return /* @__PURE__ */ (0, N.jsxs)(Wh, {
						appearance: "transparent",
						className: k(o.dayCell, s && o.daySelected, $x(n, t) && o.dayToday, a && o.dayOther),
						"aria-label": `${n.getMonth() + 1}月${n.getDate()}日`,
						"aria-pressed": s,
						onClick: () => d(r),
						children: [/* @__PURE__ */ (0, N.jsx)(Z, {
							size: 300,
							children: n.getDate()
						}), i.length > 0 ? /* @__PURE__ */ (0, N.jsx)("span", {
							className: o.dots,
							"aria-hidden": "true",
							children: i.map((e) => /* @__PURE__ */ (0, N.jsx)("span", { className: o.dot }, e.id))
						}) : null]
					}, r);
				})
			}),
			/* @__PURE__ */ (0, N.jsx)("div", {
				className: o.dayHead,
				children: /* @__PURE__ */ (0, N.jsxs)(Z, {
					size: 300,
					weight: "semibold",
					children: [
						Hw(/* @__PURE__ */ new Date(`${u}T00:00:00`)),
						" · ",
						h,
						" 项"
					]
				})
			}),
			/* @__PURE__ */ (0, N.jsx)(Kw, {
				tasks: m,
				now: t,
				settings: n,
				onOpenTask: r,
				onToggleTask: i,
				onAddDay: () => a(u)
			})
		]
	});
}
function Xw({ now: e, settings: t }) {
	let n = Vw(), r = t.weekStart, i = qx(e), a = Jx(Zx(i, r), -105), o = Array.from({ length: 112 }, (e, t) => Kx(Jx(a, t))), s = new Map(o.map((e) => [e, 0])), c = $.state.tasks;
	for (let e of c) {
		if (!e.done || !e.doneAt) continue;
		let t = Kx(e.doneAt);
		s.has(t) && s.set(t, s.get(t) + 1);
	}
	let l = o.map((e) => s.get(e)), u = l.reduce((e, t) => e + t, 0), d = 1;
	for (let e of l) d = Math.max(d, e);
	let f = (e) => e <= 0 ? 0 : Math.min(4, Math.ceil(e / d * 4)), p = 0, m = s.get(Kx(i)) > 0 ? i : Jx(i, -1);
	for (; s.has(Kx(m)) && s.get(Kx(m)) > 0;) p += 1, m = Jx(m, -1);
	let h = sS(r);
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: n.view,
		children: [
			/* @__PURE__ */ (0, N.jsxs)("div", {
				className: n.heatStats,
				children: [
					/* @__PURE__ */ (0, N.jsx)(Z, {
						size: 500,
						weight: "semibold",
						className: n.heatValue,
						children: u
					}),
					/* @__PURE__ */ (0, N.jsx)(Z, {
						size: 300,
						className: n.heatLabel,
						children: "项完成 · 近 16 周"
					}),
					/* @__PURE__ */ (0, N.jsx)(Z, {
						size: 500,
						weight: "semibold",
						className: n.heatValue,
						children: p
					}),
					/* @__PURE__ */ (0, N.jsx)(Z, {
						size: 300,
						className: n.heatLabel,
						children: "天连续完成"
					})
				]
			}),
			/* @__PURE__ */ (0, N.jsx)("div", {
				className: n.heatGrid,
				role: "img",
				"aria-label": "近 16 周每日完成量",
				children: o.map((e, t) => {
					let r = /* @__PURE__ */ new Date(`${e}T00:00:00`), i = s.get(e), a = f(i);
					return /* @__PURE__ */ (0, N.jsx)("span", {
						className: k(n.heatCell, n[`heat${a}`]),
						title: `${r.getMonth() + 1}月${r.getDate()}日 ${h[t % 7]}：完成 ${i} 项`
					}, e);
				})
			}),
			/* @__PURE__ */ (0, N.jsxs)("div", {
				className: n.legend,
				children: [
					/* @__PURE__ */ (0, N.jsx)(Z, {
						size: 200,
						children: "少"
					}),
					[
						0,
						1,
						2,
						3,
						4
					].map((e) => /* @__PURE__ */ (0, N.jsx)("span", {
						className: k(n.legendSwatch, n[`heat${e}`]),
						"aria-hidden": "true"
					}, e)),
					/* @__PURE__ */ (0, N.jsx)(Z, {
						size: 200,
						children: "多"
					})
				]
			})
		]
	});
}
//#endregion
//#region public/plugins/todo/src/TaskEditor.jsx
var Zw = [
	0,
	1,
	2,
	3
].map((e) => ({
	value: e,
	label: fS(e).label
})), Qw = [{
	value: "",
	label: "不重复"
}, ...lS], $w = Jn({
	form: {
		width: "100%",
		maxWidth: "720px",
		marginInline: "auto",
		display: "flex",
		flexDirection: "column",
		gap: U.spacingVerticalL,
		minWidth: 0
	},
	row: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalS,
		flexWrap: "wrap",
		minHeight: "44px"
	},
	dateInput: {
		flex: 1,
		minWidth: "160px"
	},
	timeInput: { width: "120px" },
	grow: {
		flex: 1,
		minWidth: 0
	},
	chips: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalXS,
		flexWrap: "wrap"
	},
	subtaskRow: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalS,
		minHeight: "44px",
		minWidth: 0
	},
	subtaskTitle: {
		flex: 1,
		minWidth: 0,
		color: U.colorNeutralForeground2
	},
	subtaskDone: { color: U.colorNeutralForeground3 },
	iconButton: {
		minWidth: "44px",
		minHeight: "44px"
	},
	muted: { color: U.colorNeutralForeground3 },
	footer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: U.spacingHorizontalS,
		width: "100%",
		minWidth: 0,
		flexWrap: "wrap"
	},
	footerGroup: {
		display: "inline-flex",
		alignItems: "center",
		gap: U.spacingHorizontalS,
		minWidth: 0
	},
	danger: { color: U.colorStatusDangerForeground1 },
	confirmText: { color: U.colorNeutralForeground3 },
	progress: { marginBottom: U.spacingVerticalXS }
});
function eT(e, { dateOnly: t = !1 } = {}) {
	let [n, r] = (nS(e) || "").split("T");
	return {
		date: n || "",
		time: t && r === "23:59" ? "" : r || ""
	};
}
function tT(e, t) {
	let n = $.taskById(e);
	if (!n) return;
	let r = new Map(t.filter((e) => e.id).map((e) => [e.id, e]));
	for (let t of [...n.subtasks]) r.has(t.id) || $.removeSubtask(e, t.id);
	for (let n of t) {
		if (!n.id) {
			$.addSubtask(e, n.title);
			continue;
		}
		let t = $.taskById(e)?.subtasks.find((e) => e.id === n.id);
		t && t.done !== n.done && $.completeSubtask(e, n.id, n.done);
	}
}
function nT({ mode: e, taskId: t, initialListId: n, initialDueDate: r, settings: i, onClosed: a }) {
	let o = $w(), s = e === "edit", c = s ? $.taskById(t) : null, l = n && $.listById(n) ? n : $.settings.defaultListId && $.listById($.settings.defaultListId) ? $.settings.defaultListId : $.lists[0]?.id, [u, d] = (0, M.useState)(() => c?.title || ""), [f, p] = (0, M.useState)(() => c?.note || ""), [m, h] = (0, M.useState)(() => c?.listId || l), [g, _] = (0, M.useState)(() => String(c?.priority ?? 0)), [v, y] = (0, M.useState)(() => c ? eT(c.dueAt, { dateOnly: !0 }) : {
		date: r || "",
		time: ""
	}), [b, x] = (0, M.useState)(() => c ? eT(c.remindAt) : {
		date: "",
		time: ""
	}), [S, C] = (0, M.useState)(() => c?.recurrence || ""), [w, T] = (0, M.useState)(() => [...c?.tags || []]), [E, D] = (0, M.useState)(""), [ee, O] = (0, M.useState)(() => (c?.subtasks || []).slice().sort((e, t) => e.order - t.order).map((e) => ({ ...e }))), [te, ne] = (0, M.useState)(""), [re, k] = (0, M.useState)(null), [ie, ae] = (0, M.useState)(!1), oe = $.listById(m) || $.lists[0], se = ee.filter((e) => e.done).length, ce = ee.length ? se / ee.length : 0, le = () => {
		let e = E.trim();
		e && (T((t) => t.includes(e) ? t : [...t, e]), D(""));
	}, ue = () => {
		let e = te.trim();
		e && (O((t) => [...t, {
			id: null,
			title: e,
			done: !1,
			order: t.length
		}]), ne(""));
	}, de = (e) => {
		let t = u.trim();
		if (!t) {
			k("标题不能为空");
			return;
		}
		let n = v.date ? rS(v.date, v.time || null) : null, r = b.date ? rS(b.date, b.time || "09:00") : null, i = {
			title: t,
			note: f.trim(),
			priority: Number(g),
			dueAt: n,
			remindAt: r,
			recurrence: S || null,
			tags: w,
			listId: m
		};
		try {
			if (s) {
				if (!c) throw Error("任务不存在或已被删除");
				$.updateTask(c.id, i), tT(c.id, ee);
			} else $.addTask({
				...i,
				subtasks: ee.map((e) => ({
					title: e.title,
					done: e.done
				}))
			});
			e();
		} catch (e) {
			k(e instanceof Error ? e.message : String(e));
		}
	}, fe = (e) => {
		try {
			if (!c) throw Error("任务不存在或已被删除");
			$.removeTask(c.id), e();
		} catch (e) {
			k(e instanceof Error ? e.message : String(e));
		}
	};
	return /* @__PURE__ */ (0, N.jsx)(_w, {
		title: s ? "编辑任务" : "新建任务",
		footer: (e) => /* @__PURE__ */ (0, N.jsxs)("div", {
			className: o.footer,
			children: [/* @__PURE__ */ (0, N.jsxs)("div", {
				className: o.footerGroup,
				children: [s && c && !ie ? /* @__PURE__ */ (0, N.jsx)(rw, {
					appearance: "subtle",
					className: o.danger,
					icon: /* @__PURE__ */ (0, N.jsx)(K, {}),
					onClick: () => ae(!0),
					children: "删除"
				}) : null, ie ? /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [
					/* @__PURE__ */ (0, N.jsx)(Z, {
						size: 200,
						className: o.confirmText,
						children: "删除后不可恢复"
					}),
					/* @__PURE__ */ (0, N.jsx)(rw, {
						appearance: "secondary",
						onClick: () => fe(e),
						children: "确认删除"
					}),
					/* @__PURE__ */ (0, N.jsx)(rw, {
						onClick: () => ae(!1),
						children: "取消"
					})
				] }) : null]
			}), ie ? null : /* @__PURE__ */ (0, N.jsxs)("div", {
				className: o.footerGroup,
				children: [/* @__PURE__ */ (0, N.jsx)(rw, {
					onClick: e,
					children: "取消"
				}), /* @__PURE__ */ (0, N.jsx)(rw, {
					appearance: "secondary",
					onClick: () => de(e),
					children: "保存"
				})]
			})]
		}),
		onClosed: a,
		children: /* @__PURE__ */ (0, N.jsxs)("div", {
			className: o.form,
			children: [
				re ? /* @__PURE__ */ (0, N.jsx)(ax, {
					intent: "error",
					onDismiss: () => k(null),
					children: /* @__PURE__ */ (0, N.jsx)(vx, { children: re })
				}) : null,
				/* @__PURE__ */ (0, N.jsx)(gg, {
					label: "标题",
					required: !0,
					children: /* @__PURE__ */ (0, N.jsx)(k_, {
						size: "large",
						value: u,
						placeholder: "要做什么",
						"aria-label": "任务标题",
						onChange: (e, t) => d(t.value)
					})
				}),
				/* @__PURE__ */ (0, N.jsx)(gg, {
					label: "备注",
					hint: "可留空",
					children: /* @__PURE__ */ (0, N.jsx)(Tb, {
						value: f,
						rows: 3,
						resize: "vertical",
						"aria-label": "任务备注",
						onChange: (e, t) => p(t.value)
					})
				}),
				/* @__PURE__ */ (0, N.jsx)(gg, {
					label: "清单",
					children: /* @__PURE__ */ (0, N.jsx)(__, {
						size: "large",
						value: oe?.name || "",
						selectedOptions: m ? [m] : [],
						"aria-label": "任务清单",
						onOptionSelect: (e, t) => h(t.optionValue),
						children: $.lists.map((e) => /* @__PURE__ */ (0, N.jsx)(e_, {
							value: e.id,
							children: e.name
						}, e.id))
					})
				}),
				/* @__PURE__ */ (0, N.jsx)(gg, {
					label: "优先级",
					children: /* @__PURE__ */ (0, N.jsx)(gy, {
						layout: "horizontal",
						value: g,
						"aria-label": "优先级",
						onChange: (e, t) => _(t.value),
						children: Zw.map((e) => /* @__PURE__ */ (0, N.jsx)(Oy, {
							value: String(e.value),
							label: e.label
						}, e.value))
					})
				}),
				/* @__PURE__ */ (0, N.jsx)(gg, {
					label: "截止时间",
					hint: "只选日期时按当天 23:59 到期",
					children: /* @__PURE__ */ (0, N.jsxs)("div", {
						className: o.row,
						children: [
							/* @__PURE__ */ (0, N.jsx)(k_, {
								type: "date",
								size: "large",
								className: o.dateInput,
								value: v.date,
								"aria-label": "截止日期",
								onChange: (e, t) => y((e) => ({
									...e,
									date: t.value
								}))
							}),
							/* @__PURE__ */ (0, N.jsx)(k_, {
								type: "time",
								size: "large",
								className: o.timeInput,
								value: v.time,
								"aria-label": "截止时间",
								onChange: (e, t) => y((e) => ({
									...e,
									time: t.value
								}))
							}),
							/* @__PURE__ */ (0, N.jsx)(rw, {
								appearance: "secondary",
								onClick: () => y({
									date: "",
									time: ""
								}),
								"aria-label": "清除截止时间",
								children: "清除"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, N.jsx)(gg, {
					label: "提醒",
					hint: "到点后在桌面提示",
					children: /* @__PURE__ */ (0, N.jsxs)("div", {
						className: o.row,
						children: [
							/* @__PURE__ */ (0, N.jsx)(k_, {
								type: "date",
								size: "large",
								className: o.dateInput,
								value: b.date,
								"aria-label": "提醒日期",
								onChange: (e, t) => x((e) => ({
									...e,
									date: t.value
								}))
							}),
							/* @__PURE__ */ (0, N.jsx)(k_, {
								type: "time",
								size: "large",
								className: o.timeInput,
								value: b.time,
								"aria-label": "提醒时间",
								onChange: (e, t) => x((e) => ({
									...e,
									time: t.value
								}))
							}),
							/* @__PURE__ */ (0, N.jsx)(rw, {
								appearance: "secondary",
								onClick: () => x({
									date: "",
									time: ""
								}),
								"aria-label": "清除提醒",
								children: "清除"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, N.jsx)(gg, {
					label: "重复",
					children: /* @__PURE__ */ (0, N.jsx)(__, {
						size: "large",
						value: Qw.find((e) => e.value === S)?.label || "不重复",
						selectedOptions: S ? [S] : [],
						"aria-label": "重复规则",
						onOptionSelect: (e, t) => C(t.optionValue),
						children: Qw.map((e) => /* @__PURE__ */ (0, N.jsx)(e_, {
							value: e.value,
							children: e.label
						}, e.value))
					})
				}),
				/* @__PURE__ */ (0, N.jsxs)(gg, {
					label: "标签",
					children: [w.length > 0 ? /* @__PURE__ */ (0, N.jsx)("div", {
						className: o.chips,
						children: w.map((e) => /* @__PURE__ */ (0, N.jsx)(rw, {
							appearance: "outline",
							icon: /* @__PURE__ */ (0, N.jsx)(id, {}),
							iconPosition: "after",
							"aria-label": `移除标签 ${e}`,
							onClick: () => T((t) => t.filter((t) => t !== e)),
							children: e
						}, e))
					}) : null, /* @__PURE__ */ (0, N.jsxs)("div", {
						className: o.row,
						children: [/* @__PURE__ */ (0, N.jsx)(k_, {
							className: o.grow,
							size: "large",
							value: E,
							placeholder: "输入标签后回车",
							"aria-label": "新标签",
							onChange: (e, t) => D(t.value),
							onKeyDown: (e) => {
								e.key === "Enter" && (e.preventDefault(), le());
							}
						}), /* @__PURE__ */ (0, N.jsx)(rw, {
							appearance: "secondary",
							icon: /* @__PURE__ */ (0, N.jsx)(Wu, {}),
							onClick: le,
							children: "添加标签"
						})]
					})]
				}),
				/* @__PURE__ */ (0, N.jsxs)(gg, {
					label: ee.length ? `子任务（${se}/${ee.length}）` : "子任务",
					children: [
						ee.length > 0 ? /* @__PURE__ */ (0, N.jsx)(Lb, {
							className: o.progress,
							value: ce,
							"aria-label": "子任务完成度"
						}) : null,
						ee.map((e, t) => /* @__PURE__ */ (0, N.jsxs)("div", {
							className: o.subtaskRow,
							children: [
								/* @__PURE__ */ (0, N.jsx)(kg, {
									checked: e.done,
									"aria-label": e.title,
									onChange: () => O((e) => e.map((e, n) => n === t ? {
										...e,
										done: !e.done
									} : e))
								}),
								/* @__PURE__ */ (0, N.jsx)(Z, {
									size: 400,
									className: e.done ? `${o.subtaskTitle} ${o.subtaskDone}` : o.subtaskTitle,
									children: /* @__PURE__ */ (0, N.jsx)(yw, { children: e.title })
								}),
								/* @__PURE__ */ (0, N.jsx)(rw, {
									appearance: "subtle",
									className: o.iconButton,
									icon: /* @__PURE__ */ (0, N.jsx)(K, {}),
									"aria-label": `删除子任务 ${e.title}`,
									onClick: () => O((e) => e.filter((e, n) => n !== t))
								})
							]
						}, `${e.id || "new"}-${t}`)),
						/* @__PURE__ */ (0, N.jsxs)("div", {
							className: o.row,
							children: [/* @__PURE__ */ (0, N.jsx)(k_, {
								className: o.grow,
								size: "large",
								value: te,
								placeholder: "输入子任务后回车",
								"aria-label": "新子任务",
								onChange: (e, t) => ne(t.value),
								onKeyDown: (e) => {
									e.key === "Enter" && (e.preventDefault(), ue());
								}
							}), /* @__PURE__ */ (0, N.jsx)(rw, {
								appearance: "secondary",
								icon: /* @__PURE__ */ (0, N.jsx)(Wu, {}),
								onClick: ue,
								children: "添加子任务"
							})]
						})
					]
				}),
				s ? /* @__PURE__ */ (0, N.jsx)(Z, {
					size: 200,
					className: o.muted,
					children: "保存只更新这条任务；X / Esc / 点遮罩会关闭整个详情浮层。"
				}) : null
			]
		})
	});
}
//#endregion
//#region public/plugins/todo/src/ListManager.jsx
var rT = Jn({
	list: {
		display: "flex",
		flexDirection: "column",
		gap: U.spacingVerticalXS,
		minWidth: 0
	},
	row: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalS,
		minHeight: "44px",
		minWidth: 0
	},
	main: {
		display: "flex",
		flex: 1,
		flexDirection: "column",
		gap: U.spacingVerticalXXS,
		minWidth: 0
	},
	name: {
		color: U.colorNeutralForeground1,
		minWidth: 0
	},
	count: {
		color: U.colorNeutralForeground3,
		fontVariantNumeric: "tabular-nums"
	},
	actions: {
		display: "inline-flex",
		alignItems: "center",
		gap: U.spacingHorizontalXXS,
		flexShrink: 0
	},
	iconButton: {
		minWidth: "44px",
		minHeight: "44px"
	},
	starIdle: { color: U.colorNeutralForeground3 },
	danger: { color: U.colorStatusDangerForeground1 },
	confirm: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalXS,
		flex: 1,
		minWidth: 0
	},
	confirmText: {
		flex: 1,
		minWidth: 0,
		color: U.colorNeutralForeground3
	},
	renameInput: {
		flex: 1,
		minWidth: 0
	},
	addRow: {
		display: "flex",
		alignItems: "center",
		gap: U.spacingHorizontalS,
		minWidth: 0
	},
	addInput: { minWidth: "140px" },
	muted: { color: U.colorNeutralForeground3 },
	empty: {
		color: U.colorNeutralForeground3,
		paddingBlock: U.spacingVerticalM
	}
});
function iT({ onClosed: e }) {
	let t = rT(), n = tC(), [r, i] = (0, M.useState)(""), [a, o] = (0, M.useState)(null), [s, c] = (0, M.useState)(null), [l, u] = (0, M.useState)(null), [d, f] = (0, M.useState)(null), p = n.lists, m = n.settings.defaultListId, h = (e) => n.state.tasks.filter((t) => t.listId === e).length, g = Dw(p.map((e) => e.id)), _ = () => {
		let e = r.trim();
		if (e) try {
			$.addList(e), i(""), u(null);
		} catch (e) {
			u(e instanceof Error ? e.message : String(e));
		}
	}, v = () => {
		if (!a) return;
		let e = a.name.trim();
		if (e) try {
			$.updateList(a.id, { name: e }), o(null), u(null);
		} catch (e) {
			u(e instanceof Error ? e.message : String(e));
		}
	}, y = (e) => {
		c(e.id), f(e.id);
	}, b = (e) => {
		try {
			$.removeList(e.id), c(null), f(null), u(null);
		} catch (e) {
			u(e instanceof Error ? e.message : String(e));
		}
	};
	return /* @__PURE__ */ (0, N.jsx)(_w, {
		title: "清单管理",
		trailing: /* @__PURE__ */ (0, N.jsxs)("div", {
			className: t.addRow,
			children: [/* @__PURE__ */ (0, N.jsx)(k_, {
				size: "large",
				className: t.addInput,
				value: r,
				placeholder: "新清单名称",
				"aria-label": "新清单名称",
				onChange: (e, t) => i(t.value),
				onKeyDown: (e) => {
					e.key === "Enter" && (e.preventDefault(), _());
				}
			}), /* @__PURE__ */ (0, N.jsx)(rw, {
				appearance: "secondary",
				icon: /* @__PURE__ */ (0, N.jsx)(Wu, {}),
				onClick: _,
				children: "新建"
			})]
		}),
		onClosed: e,
		children: /* @__PURE__ */ (0, N.jsxs)("div", {
			className: t.list,
			children: [
				l ? /* @__PURE__ */ (0, N.jsx)(ax, {
					intent: "error",
					onDismiss: () => u(null),
					children: /* @__PURE__ */ (0, N.jsx)(vx, { children: l })
				}) : null,
				p.length === 0 ? /* @__PURE__ */ (0, N.jsx)(Z, {
					size: 300,
					className: t.empty,
					children: "还没有清单"
				}) : null,
				p.map((e) => {
					let n = h(e.id), r = e.id === m;
					return /* @__PURE__ */ (0, N.jsx)(vC, {
						visible: d !== e.id,
						appear: g.has(e.id),
						unmountOnExit: !0,
						onMotionFinish: (t, n) => {
							n?.direction === "exit" && d === e.id && b(e);
						},
						children: a?.id === e.id ? /* @__PURE__ */ (0, N.jsxs)("div", {
							className: t.row,
							children: [
								/* @__PURE__ */ (0, N.jsx)(k_, {
									size: "large",
									className: t.renameInput,
									value: a.name,
									"aria-label": "清单名称",
									autoFocus: !0,
									onChange: (e, t) => o({
										...a,
										name: t.value
									}),
									onKeyDown: (e) => {
										e.key === "Enter" && (e.preventDefault(), v());
									}
								}),
								/* @__PURE__ */ (0, N.jsx)(rw, {
									appearance: "secondary",
									onClick: v,
									children: "保存"
								}),
								/* @__PURE__ */ (0, N.jsx)(rw, {
									appearance: "secondary",
									onClick: () => o(null),
									children: "取消"
								})
							]
						}) : s === e.id ? /* @__PURE__ */ (0, N.jsxs)("div", {
							className: t.row,
							children: [
								/* @__PURE__ */ (0, N.jsx)("div", {
									className: t.confirm,
									children: /* @__PURE__ */ (0, N.jsx)(Z, {
										size: 200,
										className: t.confirmText,
										children: /* @__PURE__ */ (0, N.jsxs)(yw, { children: [
											"删除「",
											e.name,
											"」？同时删除其中的 ",
											n,
											" 个任务"
										] })
									})
								}),
								/* @__PURE__ */ (0, N.jsx)(rw, {
									appearance: "secondary",
									onClick: () => y(e),
									children: "确认删除"
								}),
								/* @__PURE__ */ (0, N.jsx)(rw, {
									appearance: "secondary",
									onClick: () => c(null),
									children: "取消"
								})
							]
						}) : /* @__PURE__ */ (0, N.jsxs)("div", {
							className: t.row,
							children: [
								/* @__PURE__ */ (0, N.jsx)(Ew, {}),
								/* @__PURE__ */ (0, N.jsxs)("div", {
									className: t.main,
									children: [/* @__PURE__ */ (0, N.jsx)(Z, {
										size: 300,
										className: t.name,
										title: e.name,
										children: /* @__PURE__ */ (0, N.jsx)(yw, { children: e.name })
									}), /* @__PURE__ */ (0, N.jsxs)(Z, {
										size: 200,
										className: t.count,
										children: [
											n,
											" 个任务",
											r ? " · 默认清单" : ""
										]
									})]
								}),
								/* @__PURE__ */ (0, N.jsxs)("div", {
									className: t.actions,
									children: [
										/* @__PURE__ */ (0, N.jsx)(rw, {
											appearance: "subtle",
											className: t.iconButton,
											icon: r ? /* @__PURE__ */ (0, N.jsx)(Bu, {}) : /* @__PURE__ */ (0, N.jsx)(Vu, {}),
											"aria-label": r ? `默认清单 ${e.name}` : `设为默认清单 ${e.name}`,
											title: r ? "默认清单" : "设为默认",
											disabled: r,
											onClick: () => $.updateSettings({ defaultListId: e.id })
										}),
										/* @__PURE__ */ (0, N.jsx)(rw, {
											appearance: "subtle",
											className: t.iconButton,
											icon: /* @__PURE__ */ (0, N.jsx)(Gu, {}),
											"aria-label": `重命名清单 ${e.name}`,
											title: "重命名",
											onClick: () => o({
												id: e.id,
												name: e.name
											})
										}),
										/* @__PURE__ */ (0, N.jsx)(rw, {
											appearance: "subtle",
											className: t.iconButton,
											icon: /* @__PURE__ */ (0, N.jsx)(K, {}),
											"aria-label": `删除清单 ${e.name}`,
											title: "删除",
											disabled: p.length <= 1,
											onClick: () => c(e.id)
										})
									]
								})
							]
						})
					}, e.id);
				})
			]
		})
	});
}
//#endregion
//#region public/plugins/todo/src/TodoDetail.jsx
var aT = [
	{
		value: "list",
		label: "列表"
	},
	{
		value: "calendar",
		label: "日历"
	},
	{
		value: "week",
		label: "周视图"
	},
	{
		value: "month",
		label: "月视图"
	},
	{
		value: "heatmap",
		label: "热力图"
	}
], oT = "__manage-lists", sT = Jn({
	listDropdown: {
		minWidth: "140px",
		maxWidth: "180px",
		minHeight: "44px",
		flexShrink: 0
	},
	search: {
		flex: 1,
		minWidth: 0
	},
	scopeHint: {
		color: U.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	spacer: {
		flex: 1,
		minWidth: 0
	}
});
function cT() {
	let e = $.settings.defaultListId;
	return e && $.listById(e) ? e : "all";
}
function lT() {
	let e = sT();
	tC();
	let [t] = Nx(LS, RS, VS), [n, r] = (0, M.useState)("list"), [i, a] = (0, M.useState)(cT), [o, s] = (0, M.useState)(""), [c, l] = (0, M.useState)(null), u = /* @__PURE__ */ new Date();
	(0, M.useEffect)(() => {
		if (i !== "all" && !$.listById(i)) {
			let e = $.settings.defaultListId;
			a(e && $.listById(e) ? e : "all");
		}
	}, [i, $.state.lists]);
	let d = i === "all" ? "全部清单" : $.listById(i)?.name || "全部清单", f = i === "all" ? $.state.tasks : $.state.tasks.filter((e) => e.listId === i), p = f.filter((e) => !e.done).length, m = (e) => l({
		kind: "task",
		taskId: e
	}), h = (e) => {
		let t = $.taskById(e);
		t && $.setDone(e, !t.done);
	}, g = i === "all" ? void 0 : i, _ = (e) => l({
		kind: "new",
		listId: g,
		dueDate: e || null
	}), v = () => l(null), y = c && (c.kind === "task" || c.kind === "new") ? c : null;
	return /* @__PURE__ */ (0, N.jsxs)(aw, { children: [
		/* @__PURE__ */ (0, N.jsxs)(sw, {
			trailing: /* @__PURE__ */ (0, N.jsx)(rw, {
				appearance: "secondary",
				icon: /* @__PURE__ */ (0, N.jsx)(Wu, {}),
				onClick: () => _(null),
				children: "添加任务"
			}),
			children: [/* @__PURE__ */ (0, N.jsxs)(__, {
				size: "large",
				className: e.listDropdown,
				style: { minHeight: "44px" },
				value: d,
				selectedOptions: [i],
				"aria-label": "筛选清单",
				onOptionSelect: (e, t) => {
					let n = t.optionValue;
					n === oT ? l({ kind: "lists" }) : a(n);
				},
				children: [
					/* @__PURE__ */ (0, N.jsx)(e_, {
						value: "all",
						children: "全部清单"
					}),
					$.lists.map((e) => /* @__PURE__ */ (0, N.jsx)(e_, {
						value: e.id,
						children: e.name
					}, e.id)),
					/* @__PURE__ */ (0, N.jsx)(e_, {
						value: oT,
						children: "管理清单…"
					})
				]
			}), /* @__PURE__ */ (0, N.jsx)(k_, {
				size: "large",
				className: e.search,
				style: { minHeight: "44px" },
				appearance: "outline",
				contentBefore: /* @__PURE__ */ (0, N.jsx)(Fu, {}),
				contentAfter: o ? /* @__PURE__ */ (0, N.jsx)(rw, {
					appearance: "transparent",
					icon: /* @__PURE__ */ (0, N.jsx)(ad, {}),
					"aria-label": "清除搜索",
					onClick: () => s("")
				}) : void 0,
				placeholder: "搜索标题、备注、标签、子任务",
				"aria-label": "搜索任务",
				value: o,
				onChange: (e, t) => s(t.value)
			})]
		}),
		/* @__PURE__ */ (0, N.jsxs)(lw, { children: [
			/* @__PURE__ */ (0, N.jsxs)(Z, {
				size: 200,
				className: e.scopeHint,
				children: [
					d,
					" · ",
					p,
					" 项未完成"
				]
			}),
			/* @__PURE__ */ (0, N.jsx)("span", { className: e.spacer }),
			/* @__PURE__ */ (0, N.jsx)(rw, {
				appearance: "subtle",
				icon: /* @__PURE__ */ (0, N.jsx)(Ru, {}),
				onClick: rC,
				children: "设置…"
			})
		] }),
		/* @__PURE__ */ (0, N.jsx)(dw, {
			items: aT,
			value: n,
			onChange: r,
			ariaLabel: "待办视图"
		}),
		/* @__PURE__ */ (0, N.jsx)(mw, { children: /* @__PURE__ */ (0, N.jsx)(xC, {
			value: n,
			children: n === "list" ? /* @__PURE__ */ (0, N.jsx)(Bw, {
				tasks: f,
				query: o,
				settings: t,
				now: u,
				listId: i,
				onOpenTask: m,
				onToggleTask: h,
				onAddTask: () => _(null),
				onClearSearch: () => s("")
			}) : n === "calendar" ? /* @__PURE__ */ (0, N.jsx)(qw, {
				tasks: f,
				now: u,
				settings: t,
				onOpenTask: m,
				onToggleTask: h,
				onAddDay: _
			}) : n === "week" ? /* @__PURE__ */ (0, N.jsx)(Jw, {
				tasks: f,
				now: u,
				settings: t,
				onOpenTask: m,
				onToggleTask: h
			}) : n === "month" ? /* @__PURE__ */ (0, N.jsx)(Yw, {
				tasks: f,
				now: u,
				settings: t,
				onOpenTask: m,
				onToggleTask: h,
				onAddDay: _
			}) : /* @__PURE__ */ (0, N.jsx)(Xw, {
				now: u,
				settings: t
			})
		}) }),
		y ? /* @__PURE__ */ (0, N.jsx)(nT, {
			mode: y.kind === "task" ? "edit" : "new",
			taskId: y.taskId,
			initialListId: y.listId,
			initialDueDate: y.dueDate,
			settings: t,
			onClosed: v
		}, y.kind === "task" ? y.taskId : `new-${y.dueDate || "none"}`) : null,
		c?.kind === "lists" ? /* @__PURE__ */ (0, N.jsx)(iT, { onClosed: v }) : null
	] });
}
//#endregion
//#region public/plugins/todo/src/main.jsx
Tx();
var uT = new URLSearchParams(location.search), dT = uT.get("background") === "1" || uT.get("mode") === "background" || /background\.html$/.test(location.pathname), fT = Jn({
	page: {
		width: "100%",
		height: "100%",
		display: "grid",
		placeItems: "center",
		backgroundColor: U.colorNeutralBackground1,
		overflow: "hidden"
	},
	pageOverlay: {
		width: "100%",
		height: "100%",
		padding: U.spacingVerticalXL,
		display: "flex",
		alignItems: "stretch",
		justifyContent: "center",
		backgroundColor: U.colorNeutralBackground2,
		overflow: "hidden"
	},
	card: {
		overflow: "hidden",
		borderRadius: U.borderRadius2XLarge,
		backgroundColor: U.colorNeutralBackground1,
		boxShadow: U.shadow16
	},
	dialog: {
		width: "100%",
		height: "100%",
		overflow: "hidden",
		borderRadius: U.borderRadiusXLarge,
		backgroundColor: U.colorNeutralBackground1,
		boxShadow: U.shadow16
	}
});
function pT({ overlayView: e, defaultSizeKey: t, children: n }) {
	let r = fT();
	if (e) return /* @__PURE__ */ (0, N.jsx)("div", {
		className: r.pageOverlay,
		children: /* @__PURE__ */ (0, N.jsx)("div", {
			className: r.dialog,
			children: n
		})
	});
	let i = uC(t);
	return /* @__PURE__ */ (0, N.jsx)("div", {
		className: r.page,
		children: /* @__PURE__ */ (0, N.jsx)("div", {
			className: r.card,
			style: {
				width: i.width,
				height: i.height
			},
			children: n
		})
	});
}
var mT = class extends M.Component {
	constructor(e) {
		super(e), this.state = { error: null };
	}
	static getDerivedStateFromError(e) {
		return { error: e };
	}
	render() {
		return this.state.error ? /* @__PURE__ */ (0, N.jsx)("div", {
			style: { padding: U.spacingVerticalL },
			children: /* @__PURE__ */ (0, N.jsx)(ax, {
				intent: "error",
				children: /* @__PURE__ */ (0, N.jsxs)(vx, { children: [/* @__PURE__ */ (0, N.jsx)(dx, { children: "待办加载出错" }), String(this.state.error?.message || this.state.error)] })
			})
		}) : this.props.children;
	}
};
function hT() {
	let { theme: t } = Ax(), n = Px(), r = cC(uT.get("size")), i = r ? lC(r) : "3x3", a = !e.inHost, o = uT.get("raw") === "1" || uT.has("plugin") && uT.has("widget"), s = n === "detail" ? /* @__PURE__ */ (0, N.jsx)(lT, {}) : /* @__PURE__ */ (0, N.jsx)(Iw, { defaultSizeKey: i });
	return /* @__PURE__ */ (0, N.jsx)(Fl, {
		theme: t,
		style: {
			width: "100%",
			height: "100%",
			background: "transparent",
			colorScheme: "normal"
		},
		children: /* @__PURE__ */ (0, N.jsx)(mT, { children: a && !o ? /* @__PURE__ */ (0, N.jsx)(pT, {
			overlayView: n,
			defaultSizeKey: i,
			children: s
		}) : s })
	});
}
if (dT) {
	eC();
	let t = iC();
	e.ready(YS), e.onToolCall(async (n) => {
		if (!n || typeof n.name != "string") return;
		let r = t[n.name];
		try {
			if (!r) {
				e.toolResult(n.id, !1, `未知工具：${n.name}`);
				return;
			}
			e.toolResult(n.id, !0, await r(n.args));
		} catch (t) {
			e.toolResult(n.id, !1, t instanceof Error ? t.message : String(t));
		}
	});
} else {
	eC({ startReminders: !e.inHost });
	let t = document.getElementById("root");
	t && (0, yx.createRoot)(t).render(/* @__PURE__ */ (0, N.jsx)(hT, {}));
}
//#endregion
