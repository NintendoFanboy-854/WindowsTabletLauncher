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
				if (be(r)) {
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
			if (jn = !1, (On !== null || kn !== null) && (Vd(), On && (t = On, e = kn, kn = On = null, An(t), e))) for (t = 0; t < e.length; t++) An(e[t]);
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
		On ? kn ? kn.push(r) : kn = [r] : On = r, t = Xf(t, "onChange"), 0 < t.length && (n = new Wn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var kr = null, Ar = null;
	function jr(e) {
		Uf(e, 0);
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
		}), ni && Kr(ni, r) || (ni = r, r = Xf(ti, "onSelect"), 0 < r.length && (t = new Wn("onSelect", "select", null, t, n), e.push({
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
	var bi = 0;
	function xi(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = Sd.identifierPrefix;
		var n = bi++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function Si(e) {
		if (e == null || typeof e == "string") return e;
		var t = null, n = Ad;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = e[n[r]];
			if (i != null) {
				if (i === "none") return "none";
				t = t == null ? i : t + (" " + i);
			}
		}
		return t ?? e.default;
	}
	function Ci(e, t) {
		return e = Si(e), t = Si(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
	}
	var I = typeof reportError == "function" ? reportError : function(e) {
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
		if (50 < jd) throw jd = 0, Md = null, Error(i(185));
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
		else if (typeof r == "string") s = Xm(e, n, Oe.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case de: return e = Fi(31, n, t, a), e.elementType = de, e.lanes = o, e;
			case ne: return Bi(n.children, a, o, t);
			case re:
				s = 8, a |= 24;
				break;
			case k: return e = Fi(12, n, t, a | 2), e.elementType = k, e.lanes = o, e;
			case se: return e = Fi(13, n, t, a), e.elementType = se, e.lanes = o, e;
			case ce: return e = Fi(19, n, t, a), e.elementType = ce, e.lanes = o, e;
			case fe:
			case me: return e = a | 32, e = Fi(30, n, t, e), e.elementType = me, e.lanes = o, e.stateNode = {
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
	function ta(e, t) {
		Ki[qi++] = Yi, Ki[qi++] = Ji, Ji = e, Yi = t;
	}
	function na(e, t, n) {
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
	function ra(e) {
		e.return !== null && (ta(e, 1), na(e, 1, 0));
	}
	function L(e) {
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
				X("cancel", t), X("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				X("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < Vf.length; n++) X(Vf[n], t);
				break;
			case "source":
				X("error", t);
				break;
			case "img":
			case "image":
			case "link":
				X("error", t), X("load", t);
				break;
			case "details":
				X("toggle", t);
				break;
			case "input":
				X("invalid", t), fn(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				X("invalid", t);
				break;
			case "textarea": X("invalid", t), gn(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || np(t.textContent, n) ? (r.popover != null && (X("beforetoggle", t), X("toggle", t)), r.onScroll != null && X("scroll", t), r.onScrollEnd != null && X("scrollend", t), r.onClick != null && (t.onclick = Tn), t = !0) : t = !1, t || ua(e, !0);
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
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || gp(e.type, e.memoizedProps)), n = !n), n && oa && ua(e), fa(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			oa = mm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			oa = mm(e);
		} else t === 27 ? (t = oa, Tp(e.type) ? (e = pm, pm = null, oa = e) : oa = t) : oa = aa ? fm(e.stateNode.nextSibling) : null;
		return !0;
	}
	function ma() {
		oa = aa = null, R = !1;
	}
	function ha() {
		var e = sa;
		return e !== null && (md === null ? md = e : md.push.apply(md, e), sa = null), e;
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
				s.memoizedState.memoizedState !== a.memoizedState.memoizedState && (e === null ? e = [uh] : e.push(uh));
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
		$$typeof: ae,
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
			Ba = 0, Va = If(), Ha = {
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
	var Ka = A.S;
	A.S = function(e, t) {
		if (_d = Je(), typeof t == "object" && t && typeof t.then == "function" && Ua(e, t), La !== null) for (var n = Sf; n !== null;) Ia(n, La), n = n.next;
		if (n = e.types, n !== null) {
			for (var r = Sf; r !== null;) Ia(r, n), r = r.next;
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
		return e === null ? td.pooledCache : e;
	}
	function Ya(e, t) {
		t === null ? De(qa, qa.current) : De(qa, t.pool);
	}
	function Xa() {
		var e = Ja();
		return e === null ? null : {
			parent: Na._currentValue,
			pool: e
		};
	}
	var Za = Error(i(460)), Qa = Error(i(474)), z = Error(i(542)), $a = { then: function() {} };
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
					if (e = td, e !== null && 100 < e.shellSuspendCounter) throw Error(i(482));
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
				throw ro = t, Za;
		}
	}
	function no(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (ro = e, Za) : e;
		}
	}
	var ro = null;
	function io() {
		if (ro === null) throw Error(i(459));
		var e = ro;
		return ro = null, e;
	}
	function ao(e) {
		if (e === Za || e === z) throw Error(i(483));
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
			return i === ne ? (e = d(e, t, n.props.children, r, n.key), lo(e, n), e) : t !== null && (t.elementType === i || typeof i == "object" && i && i.$$typeof === ue && no(i) === t.type) ? (t = a(t, n.props), lo(t, n), t.return = e, t) : (t = zi(n.type, n.key, n.props, null, e.mode, r), lo(t, n), t.return = e, t);
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
					case O: return n = zi(t.type, t.key, t.props, null, e.mode, n), lo(n, t), n.return = e, n;
					case te: return t = Ui(t, e.mode, n), t.return = e, t;
					case ue: return t = no(t), f(e, t, n);
				}
				if (be(t) || _e(t)) return t = Bi(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, co(t), n);
				if (t.$$typeof === ae) return f(e, Oa(e, t), n);
				uo(e, t);
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
					case ue: return n = no(n), p(e, t, n, r);
				}
				if (be(n) || _e(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, co(n), r);
				if (n.$$typeof === ae) return p(e, t, Oa(e, n), r);
				uo(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case O: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case te: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case ue: return r = no(r), m(e, t, n, r, i);
				}
				if (be(r) || _e(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, co(r), i);
				if (r.$$typeof === ae) return m(e, t, n, Oa(t, r), i);
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
			if (h === s.length) return n(i, d), R && ta(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return R && ta(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), R && ta(i, h), l;
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
			if (v.done) return n(a, h), R && ta(a, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(a, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return R && ta(a, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, a, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(a, e);
			}), R && ta(a, g), u;
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
											n(e, r.sibling), c = a(r, o.props.children), lo(c, o), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === ue && no(l) === r.type) {
										n(e, r.sibling), c = a(r, o.props), lo(c, o), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							o.type === ne ? (c = Bi(o.props.children, e.mode, c, o.key), lo(c, o), c.return = e, e = c) : (c = zi(o.type, o.key, o.props, null, e.mode, c), lo(c, o), c.return = e, e = c);
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
							c = Ui(o, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case ue: return o = no(o), _(e, r, o, c);
				}
				if (be(o)) return h(e, r, o, c);
				if (_e(o)) {
					if (l = _e(o), typeof l != "function") throw Error(i(150));
					return o = l.call(o), g(e, r, o, c);
				}
				if (typeof o.then == "function") return _(e, r, co(o), c);
				if (o.$$typeof === ae) return _(e, r, Oa(e, o), c);
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
				if (t === Za || t === z) throw t;
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
		if (r = r.shared, ed & 2) {
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
				if (p ? (q & f) === f : (r & f) === f) {
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
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), cd |= o, e.lanes = o, e.memoizedState = d;
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
		e = od, De(Oo, e), De(Do, t), od = e | t.baseLanes;
	}
	function Ao() {
		De(Oo, od), De(Do, Do.current);
	}
	function jo() {
		od = Oo.current, Ee(Do), Ee(Oo);
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
		return Uo = a, B = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, A.H = e === null || e.memoizedState === null ? gc : _c, Jo = !1, a = n(r, i), Jo = !1, qo && (a = rs(t, n, r, i)), ns(e), a;
	}
	function ns(e) {
		A.H = hc;
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
			A.H = vc, o = t(n, r);
		} while (qo);
		return o;
	}
	function is() {
		var e = A.H, t = e.useState()[0];
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
		return Xo += 1, Zo === null && (Zo = []), e = to(Zo, e, t), t = B, (Go === null ? t.memoizedState : Go.next) === null && (t = t.alternate, A.H = t === null || t.memoizedState === null ? gc : _c), e;
	}
	function fs(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return ds(e);
			if (e.$$typeof === he) return;
			if (e.$$typeof === ae) return Da(e);
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
		}, n === null && (n = us(), B.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = pe;
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
				if (f === u.lane ? (Uo & f) === f : (q & f) === f) {
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
					}, l === null ? (c = l = f, s = o) : l = l.next = f, B.lanes |= p, cd |= p;
					f = u.action, Jo && n(o, f), o = u.hasEagerState ? u.eagerState : n(o, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = o) : l = l.next = p, B.lanes |= f, cd |= f;
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
			if (r.flags |= 2048, td === null) throw Error(i(349));
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
		t !== null && Id(t, e, 2);
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
			A.T === null ? o.isTransition = !1 : n(!0), r(o), n = t.pending, n === null ? (o.next = t.pending = o, Ds(t, o)) : (o.next = n.next, t.pending = n.next = o);
		}
	}
	function Ds(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = A.T, o = {};
			o.types = a === null ? null : a.types, A.T = o;
			try {
				var s = n(i, r), c = A.S;
				c !== null && c(o, s), Os(e, t, s);
			} catch (n) {
				As(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), A.T = a;
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
			var n = td.formState;
			if (n !== null) {
				a: {
					var r = B;
					if (R) {
						if (oa) {
							b: {
								for (var i = oa, a = ca; i.nodeType !== 8;) if (!a || (i = fm(i.nextSibling), i === null)) {
									i = null;
									break b;
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								oa = fm(i.nextSibling), r = i.data === "F!";
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
			throw e === Za ? z : e;
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
			if (ed & 2) throw Error(i(440));
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
	function Xs() {}
	function Zs(e, t) {
		var n = ls();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && es(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Qs(e, t) {
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
	function $s(e, t, n) {
		return n === void 0 || Uo & 1073741824 && !(q & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Pd(), B.lanes |= e, cd |= e, n);
	}
	function ec(e, t, n, r) {
		return Gr(n, t) ? n : Do.current === null ? !(Uo & 106) || Uo & 1073741824 && !(q & 261930) ? (Pc = !0, e.memoizedState = n) : (e = Pd(), B.lanes |= e, cd |= e, t) : (e = $s(e, n, r), Gr(e, t) || (Pc = !0), e);
	}
	function V(e, t, n, r, i) {
		var a = xe.p;
		xe.p = a !== 0 && 8 > a ? a : 8;
		var o = A.T, s = {};
		s.types = o === null ? null : o.types, A.T = s, dc(e, !1, t, n);
		try {
			var c = i(), l = A.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? uc(e, t, Ga(c, r), Nd(e)) : uc(e, t, r, Nd(e));
		} catch (n) {
			uc(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, Nd());
		} finally {
			xe.p = a, o !== null && s.types !== null && (o.types = s.types), A.T = o;
		}
	}
	function tc() {}
	function nc(e, t, n, r) {
		if (e.tag !== 5) throw Error(i(476));
		var a = rc(e).queue;
		V(e, a, t, Se, n === null ? tc : function() {
			return ic(e), n(r);
		});
	}
	function rc(e) {
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
	function ic(e) {
		var t = rc(e);
		t.next === null && (t = e.alternate.memoizedState), uc(e, t.next.queue, {}, Nd());
	}
	function ac() {
		return Da(uh);
	}
	function H() {
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
					var n = Nd();
					e = vo(n);
					var r = yo(t, e, n);
					r !== null && (Id(r, t, n), bo(r, t, n)), t = { cache: Pa() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function cc(e, t, n) {
		var r = Nd();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, fc(e) ? pc(t, n) : (n = ki(e, t, n, r), n !== null && (Id(n, e, r), mc(n, t, r)));
	}
	function lc(e, t, n) {
		uc(e, t, n, Nd());
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
				if (i.hasEagerState = !0, i.eagerState = s, Gr(s, o)) return Oi(e, t, i, 0), td === null && Di(), !1;
			} catch {}
			if (n = ki(e, t, i, r), n !== null) return Id(n, e, r), mc(n, t, r), !0;
		}
		return !1;
	}
	function dc(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: If(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, fc(e)) {
			if (t) throw Error(i(479));
		} else t = ki(e, n, r, 2), t !== null && Id(t, e, 2);
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
		useDebugValue: Xs,
		useDeferredValue: function(e, t) {
			return $s(cs(), e, t);
		},
		useTransition: function() {
			var e = ws(!1);
			return e = V.bind(null, B, e.queue, !0, !1), cs().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = B, a = cs();
			if (R) {
				if (n === void 0) throw Error(i(407));
				n = n();
			} else {
				if (n = t(), td === null) throw Error(i(349));
				q & 127 || ys(r, t, n);
			}
			a.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return a.queue = o, Hs(xs.bind(null, r, o, e), [e]), r.flags |= 2048, Rs(9, { destroy: void 0 }, bs.bind(null, r, o, n, t), null), n;
		},
		useId: function() {
			var e = cs(), t = td.identifierPrefix;
			if (R) {
				var n = ea, r = $i;
				n = (r & ~(1 << 32 - ot(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Yo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = Qo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: ac,
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
				if (ed & 2) throw Error(i(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, _c = {
		readContext: Da,
		use: fs,
		useCallback: Zs,
		useContext: Da,
		useEffect: Us,
		useImperativeHandle: Ys,
		useInsertionEffect: Ks,
		useLayoutEffect: qs,
		useMemo: Qs,
		useReducer: hs,
		useRef: zs,
		useState: function() {
			return hs(ms);
		},
		useDebugValue: Xs,
		useDeferredValue: function(e, t) {
			return ec(ls(), Wo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = hs(ms)[0], t = ls().memoizedState;
			return [typeof e == "boolean" ? e : ds(e), t];
		},
		useSyncExternalStore: vs,
		useId: H,
		useHostTransitionStatus: ac,
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
		useCallback: Zs,
		useContext: Da,
		useEffect: Us,
		useImperativeHandle: Ys,
		useInsertionEffect: Ks,
		useLayoutEffect: qs,
		useMemo: Qs,
		useReducer: _s,
		useRef: zs,
		useState: function() {
			return _s(ms);
		},
		useDebugValue: Xs,
		useDeferredValue: function(e, t) {
			var n = ls();
			return Wo === null ? $s(n, e, t) : ec(n, Wo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = _s(ms)[0], t = ls().memoizedState;
			return [typeof e == "boolean" ? e : ds(e), t];
		},
		useSyncExternalStore: vs,
		useId: H,
		useHostTransitionStatus: ac,
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
			var r = Nd(), i = vo(r);
			i.payload = t, n != null && (i.callback = n), t = yo(e, i, r), t !== null && (Id(t, e, r), bo(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = Nd(), i = vo(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = yo(e, i, r), t !== null && (Id(t, e, r), bo(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = Nd(), r = vo(n);
			r.tag = 2, t != null && (r.callback = t), t = yo(e, r, n), t !== null && (Id(t, e, n), bo(t, e, n));
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
		I(e);
	}
	function Tc(e) {
		console.error(e);
	}
	function Ec(e) {
		I(e);
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
			Oc(t, n, r), typeof i != "function" && (bd === null ? bd = /* @__PURE__ */ new Set([this]) : bd.add(this));
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
					case 19: return No === null ? Jd() : n.alternate === null && sd === 0 && (sd = 3), n.flags &= -257, n.flags |= 65536, n.lanes = a, r === $a ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), gf(e, r, a)), !1;
					case 22: return n.flags |= 65536, r === $a ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), gf(e, r, a)), !1;
				}
				throw Error(i(435, n.tag));
			}
			return gf(e, r, a), Jd(), !1;
		}
		if (R) return t = Mo.current, t === null ? (r !== la && (t = Error(i(423), { cause: r }), ga(Gi(t, n))), e = e.current.alternate, e.flags |= 65536, a &= -a, e.lanes |= a, r = Gi(r, n), a = kc(e.stateNode, r, a), xo(e, a), sd !== 4 && (sd = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = a, r !== la && (e = Error(i(422), { cause: r }), ga(Gi(e, n)))), !1;
		var o = Error(i(520), { cause: r });
		if (o = Gi(o, n), pd === null ? pd = [o] : pd.push(o), sd !== 4 && (sd = 2), t === null) return !0;
		r = Gi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = a & -a, n.lanes |= e, e = kc(n.stateNode, r, e), xo(n, e), !1;
				case 1:
					if (t = n.type, o = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (bd === null || !bd.has(o)))) return n.flags |= 65536, a &= -a, n.lanes |= a, a = Ac(a), jc(a, e, n, r), xo(n, a), !1;
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
		return Ea(t), r = ts(e, t, n, o, a, i), s = as(), e !== null && !Pc ? (os(e, t, i), ll(e, t, i)) : (R && s && ra(t), t.flags |= 1, Fc(e, t, r, i), t.child);
	}
	function Lc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Ii(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, Rc(e, t, a, r, i)) : (e = zi(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !W(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Kr : n, n(o, r) && e.ref === t.ref) return ll(e, t, i);
		}
		return t.flags |= 1, e = Li(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Rc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Kr(a, r) && e.ref === t.ref) {
				if (Pc = !1, t.pendingProps = r = a, W(e, i)) e.flags & 131072 && (Pc = !0);
				else return t.lanes = e.lanes, ll(e, t, i);
			}
		}
		return Gc(e, t, n, r, i);
	}
	function zc(e, t, n, r) {
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
				return Vc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Ya(t, a === null ? null : a.cachePool), a === null ? Ao() : ko(t, a), Io(t);
			else return r = t.lanes = 536870912, Vc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Ya(t, null), Ao(), Lo()) : (Ya(t, a.cachePool), ko(t, a), Lo(), t.memoizedState = null);
		return Fc(e, t, i, n), t.child;
	}
	function Bc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function Vc(e, t, n, r, i) {
		var a = Ja();
		return a = a === null ? null : {
			parent: Na._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Ya(t, null), Ao(), Io(t), e !== null && wa(e, t, r, !0), t.childLanes = i, null;
	}
	function Hc(e, t) {
		return t = el({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Uc(e, t, n) {
		return po(t, e.child, null, n), e = Hc(t, t.pendingProps), e.flags |= 2, Ro(t), t.memoizedState = null, e;
	}
	function Wc(e, t, n) {
		var r = t.pendingProps, a = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (R) {
				if (r.mode === "hidden") return e = Hc(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, Bc(null, e);
				if (Fo(t), (e = oa) ? (e = cm(e, ca), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
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
			return Hc(t, r);
		}
		var o = e.memoizedState;
		if (o !== null) {
			var s = o.dehydrated;
			if (Fo(t), a) {
				if (t.flags & 256) t.flags &= -257, t = Uc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(i(558));
			} else if (Pc || wa(e, t, n, !1), a = (n & e.childLanes) !== 0, Pc || a) {
				if (Do.current === null) {
					if (r = td, r !== null && (s = wt(r, n), s !== 0 && s !== o.retryLane)) throw o.retryLane = s, Ai(e, s), Id(r, e, s), Nc;
					Jd();
				}
				t = Uc(e, t, n);
			} else e = o.treeContext, oa = fm(s.nextSibling), aa = t, R = !0, sa = null, ca = !1, e !== null && ia(t, e), t = Hc(t, r), t.flags |= 134221824;
			return t;
		}
		return e = Li(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function U(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(i(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function Gc(e, t, n, r, i) {
		return Ea(t), n = ts(e, t, n, r, void 0, i), r = as(), e !== null && !Pc ? (os(e, t, i), ll(e, t, i)) : (R && r && ra(t), t.flags |= 1, Fc(e, t, n, i), t.child);
	}
	function Kc(e, t, n, r, i, a) {
		return Ea(t), t.updateQueue = null, n = rs(t, r, n, i), ns(e), r = as(), e !== null && !Pc ? (os(e, t, a), ll(e, t, a)) : (R && r && ra(t), t.flags |= 1, Fc(e, t, n, a), t.child);
	}
	function qc(e, t, n, r, i) {
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
		return a = r, U(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = po(t, e.child, null, i), t.child = po(t, null, n, i)) : Fc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = ll(e, t, i), e;
	}
	function Jc(e, t, n, r) {
		return ma(), t.flags |= 256, Fc(e, t, n, r), t.child;
	}
	var Yc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Xc(e) {
		return {
			baseLanes: e,
			cachePool: Xa()
		};
	}
	function Zc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= dd), e;
	}
	function Qc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(zo.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (R) {
				if (i ? Po(t) : Lo(), (e = oa) ? (e = cm(e, ca), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Qi === null ? null : {
						id: $i,
						overflow: ea
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Hi(e), n.return = t, t.child = n, aa = t, oa = null)) : e = null, e === null) throw ua(t);
				return t.lanes = um(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (Lo(), i = t.mode, a = el({
				mode: "hidden",
				children: a
			}, i), r = Bi(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = Xc(n), r.childLanes = Zc(e, o, n), t.memoizedState = Yc, Bc(null, r)) : (Po(t), $c(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return nl(e, t, a, o, r, c, s, n);
		}
		return i ? (Lo(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = Li(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = Bi(i, a, n, null), i.flags |= 2) : i = Li(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, Bc(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = Xc(n) : (a = i.cachePool, a === null ? a = Xa() : (s = Na._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = Zc(e, o, n), t.memoizedState = Yc, Bc(e.child, r)) : (Po(t), n = e.child, e = n.sibling, n = Li(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function $c(e, t) {
		return t = el({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function el(e, t) {
		return e = Fi(22, e, null, t), e.lanes = 0, e;
	}
	function tl(e, t, n) {
		return po(t, e.child, null, n), e = $c(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function nl(e, t, n, r, a, o, s, c) {
		if (n) return t.flags & 256 ? (Po(t), t.flags &= -257, tl(e, t, c)) : t.memoizedState === null ? (Lo(), o = a.fallback, s = t.mode, a = el({
			mode: "visible",
			children: a.children
		}, s), o = Bi(o, s, c, null), o.flags |= 2, a.return = t, o.return = t, a.sibling = o, t.child = a, po(t, e.child, null, c), a = t.child, a.memoizedState = Xc(c), a.childLanes = Zc(e, r, c), t.memoizedState = Yc, Bc(null, a)) : (Lo(), t.child = e.child, t.flags |= 128, null);
		if (Po(t), um(o)) {
			if (r = o.nextSibling && o.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (a = Error(i(419)), a.stack = "", a.digest = r, ga({
				value: a,
				source: null,
				stack: null
			})), tl(e, t, c);
		}
		if (Pc || wa(e, t, c, !1), r = (c & e.childLanes) !== 0, Pc || r) {
			if (Do.current !== null) return tl(e, t, c);
			if (r = td, r !== null && (a = wt(r, c), a !== 0 && a !== s.retryLane)) throw s.retryLane = a, Ai(e, a), Id(r, e, a), Nc;
			return lm(o) || Jd(), tl(e, t, c);
		}
		return lm(o) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, oa = fm(o.nextSibling), aa = t, R = !0, sa = null, ca = !1, e !== null && ia(t, e), t = $c(t, a.children), t.flags |= 134221824, t);
	}
	function rl(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Sa(e.return, t, n);
	}
	function il(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && Ho(n) === null && (t = e), e = e.sibling;
		}
		return t;
	}
	function al(e, t, n, r, i, a) {
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
	function ol(e) {
		var t = e.child;
		for (e.child = null; t !== null;) {
			var n = t.sibling;
			t.sibling = e.child, e.child = t, t = n;
		}
	}
	function sl(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = zo.current;
		if (t.flags & 128) return Bo(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, Bo(t, o), i === "backwards" && e !== null ? (ol(e), Fc(e, t, r, n), ol(e)) : Fc(e, t, r, n), r = R ? Yi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && rl(e, n, t);
			else if (e.tag === 19) rl(e, n, t);
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
				n = il(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null, ol(t)), al(t, !0, i, null, a, r);
				break;
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && Ho(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				al(t, !0, n, null, a, r);
				break;
			case "together":
				al(t, !1, null, null, void 0, r);
				break;
			case "independent":
				t.memoizedState = null;
				break;
			default: n = il(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), al(t, !1, i, n, a, r);
		}
		return t.child;
	}
	function cl(e, t, n) {
		var r = t.pendingProps;
		return ba(t, t.type, r.value), Fc(e, t, r.children, n), t.child;
	}
	function ll(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), cd |= t.lanes, (n & t.childLanes) === 0) {
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
	function W(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && Ta(e)));
	}
	function ul(e, t, n) {
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
					return r || (n & i) !== 0 ? Qc(e, t, n) : (Po(t), e = ll(e, t, n), e === null ? null : e.sibling);
				}
				Po(t);
				break;
			case 19:
				if (t.flags & 128) return sl(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (wa(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return sl(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Bo(t, zo.current), r) break;
				return null;
			case 22: return t.lanes = 0, zc(e, t, n, t.pendingProps);
			case 24: ba(t, Na, e.memoizedState.cache);
		}
		return ll(e, t, n);
	}
	function dl(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) Pc = !0;
			else {
				if (!W(e, n) && !(t.flags & 128)) return Pc = !1, ul(e, t, n);
				Pc = !!(e.flags & 131072);
			}
		} else Pc = !1, R && t.flags & 1048576 && na(t, Yi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = no(t.elementType), t.type = e, typeof e == "function") Ii(e) ? (r = Cc(e, r), t.tag = 1, t = qc(null, t, e, r, n)) : (t.tag = 0, t = Gc(null, t, e, r, n));
					else {
						if (e != null) {
							var a = e.$$typeof;
							if (a === oe) {
								t.tag = 11, t = Ic(null, t, e, r, n);
								break a;
							}
							if (a === le) {
								t.tag = 14, t = Lc(null, t, e, r, n);
								break a;
							}
							if (a === ae) {
								t.tag = 10, t.type = e, t = cl(null, t, n);
								break a;
							}
						}
						throw t = ye(e) || e, Error(i(306, t, ""));
					}
				}
				return t;
			case 0: return Gc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, a = Cc(r, t.pendingProps), qc(e, t, r, a, n);
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
							t = Jc(e, t, r, n);
							break a;
						}
						if (r !== a) {
							a = Gi(Error(i(424)), t), ga(a), t = Jc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (oa = fm(e.firstChild), aa = t, R = !0, sa = null, ca = !0, n = mo(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (ma(), r === a) {
							t = ll(e, t, n);
							break a;
						}
						Fc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return U(e, t), e === null ? (n = Im(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : R || (t.stateNode = hp(t.type, t.pendingProps, Ae.current, t)) : t.memoizedState = Im(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return Pe(t), e === null && R && (r = t.stateNode = vm(t.type, t.pendingProps, Ae.current), aa = t, ca = !0, a = oa, Tp(t.type) ? (pm = a, oa = fm(r.firstChild)) : oa = a), Fc(e, t, t.pendingProps.children, n), U(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && R && ((a = r = oa) && (r = om(r, t.type, t.pendingProps, ca), r === null ? a = !1 : (t.stateNode = r, aa = t, oa = fm(r.firstChild), ca = !1, a = !0)), a || ua(t)), Pe(t), a = t.type, o = t.pendingProps, s = e === null ? null : e.memoizedProps, r = o.children, gp(a, o) ? r = null : s !== null && gp(a, s) && (t.flags |= 32), t.memoizedState !== null && (a = ts(e, t, is, null, null, n), uh._currentValue = a), U(e, t), Fc(e, t, r, n), t.child;
			case 6: return e === null && R && ((e = n = oa) && (n = sm(n, t.pendingProps, ca), n === null ? e = !1 : (t.stateNode = n, aa = t, oa = null, e = !0)), e || ua(t)), null;
			case 13: return Qc(e, t, n);
			case 4: return Me(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = po(t, null, r, n) : Fc(e, t, r, n), t.child;
			case 11: return Ic(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, U(e, t), Fc(e, t, r, n), t.child;
			case 8: return Fc(e, t, t.pendingProps.children, n), t.child;
			case 12: return Fc(e, t, t.pendingProps.children, n), t.child;
			case 10: return cl(e, t, n);
			case 9: return a = t.type._context, r = t.pendingProps.children, Ea(t), a = Da(a), r = r(a), t.flags |= 1, Fc(e, t, r, n), t.child;
			case 14: return Lc(e, t, t.type, t.pendingProps, n);
			case 15: return Rc(e, t, t.type, t.pendingProps, n);
			case 19: return sl(e, t, n);
			case 31: return Wc(e, t, n);
			case 22: return zc(e, t, n, t.pendingProps);
			case 24: return Ea(t), r = Da(Na), e === null ? (a = Ja(), a === null && (a = td, o = Pa(), a.pooledCache = o, o.refCount++, o !== null && (a.pooledCacheLanes |= n), a = o), t.memoizedState = {
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
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : R && ra(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : U(e, t), Fc(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(i(156, t.tag));
	}
	function fl(e) {
		e.flags |= 4;
	}
	function pl(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Zm(t, r) : Zm(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Gd()) e.flags |= 8192;
				else throw ro = $a, Qa;
			}
		} else e.flags &= -16777217;
	}
	function ml(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Qm(t)) {
			if (Gd()) e.flags |= 8192;
			else throw ro = $a, Qa;
		}
	}
	function hl(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : vt(), e.lanes |= t, fd |= t);
	}
	function gl(e, t) {
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
	function _l(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function vl(e, t, n) {
		var r = t.pendingProps;
		switch (L(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return _l(t), null;
			case 1: return _l(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), xa(Na), Ne(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (pa(t) ? fl(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, ha())), _l(t), null;
			case 26:
				var a = t.type, o = t.memoizedState;
				return e === null ? (fl(t), o === null ? (_l(t), pl(t, a, null, r, n)) : (_l(t), ml(t, o))) : o ? o === e.memoizedState ? (_l(t), t.flags &= -16777217) : (fl(t), _l(t), ml(t, o)) : (e = e.memoizedProps, e !== r && fl(t), _l(t), pl(t, a, e, r, n)), null;
			case 27:
				if (Fe(t), n = Ae.current, a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && fl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return _l(t), t.subtreeFlags &= -33554433, null;
					}
					e = Oe.current, pa(t) ? da(t, e) : (e = vm(a, r, n), t.stateNode = e, fl(t));
				}
				return _l(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (Fe(t), a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && fl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return _l(t), t.subtreeFlags &= -33554433, null;
					}
					if (o = Oe.current, pa(t)) da(t, o);
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
						r && fl(t);
					}
				}
				return _l(t), t.subtreeFlags &= -33554433, pl(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && fl(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(i(166));
					if (e = Ae.current, pa(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, a = aa, a !== null) switch (a.tag) {
							case 27:
							case 5: r = a.memoizedProps;
						}
						e[At] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || np(e.nodeValue, n)), e || ua(t, !0);
					} else e = fp(e).createTextNode(r), e[At] = t, t.stateNode = e;
				}
				return _l(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = pa(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(i(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(557));
							e[At] = t;
						} else ma(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						_l(t), e = !1;
					} else n = ha(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (Ro(t), t) : (Ro(t), null);
					if (t.flags & 128) throw Error(i(558));
				}
				return _l(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (a = pa(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!a) throw Error(i(318));
							if (a = t.memoizedState, a = a === null ? null : a.dehydrated, !a) throw Error(i(317));
							a[At] = t;
						} else ma(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						_l(t), a = !1;
					} else a = ha(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), a = !0;
					if (!a) return t.flags & 256 ? (Ro(t), t) : (Ro(t), null);
				}
				return Ro(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, a = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (a = r.alternate.memoizedState.cachePool.pool), o = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== a && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), hl(t, t.updateQueue), _l(t), null);
			case 4: return Ne(), e === null && Kf(t.stateNode.containerInfo), t.flags |= 67108864, _l(t), null;
			case 10: return xa(t.type), _l(t), null;
			case 19:
				if (Vo(t), r = t.memoizedState, r === null) return _l(t), null;
				if (a = !!(t.flags & 128), o = r.rendering, o === null) {
					if (a) gl(r, !1);
					else {
						if (sd !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (o = Ho(e), o !== null) {
								for (t.flags |= 128, gl(r, !1), e = o.updateQueue, t.updateQueue = e, hl(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) Ri(n, e), n = n.sibling;
								return Bo(t, zo.current & 1 | 2), R && ta(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Je() > vd && (t.flags |= 128, a = !0, gl(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!a) {
						if (e = Ho(o), e !== null) {
							if (t.flags |= 128, a = !0, e = e.updateQueue, t.updateQueue = e, hl(t, e), gl(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !o.alternate && !R) return _l(t), null;
						} else 2 * Je() - r.renderingStartTime > vd && n !== 536870912 && (t.flags |= 128, a = !0, gl(r, !1), t.lanes = 4194304);
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
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Je(), e.sibling = null, o = zo.current, o = a ? o & 1 | 2 : o & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || R ? Bo(t, o) : (n = o, De(Mo, t), De(zo, n), No === null && (No = t)), R && ta(t, r.treeForkCount), e;
				}
				return _l(t), null;
			case 22:
			case 23: return Ro(t), jo(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (_l(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : _l(t), n = t.updateQueue, n !== null && hl(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && Ee(qa), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), xa(Na), _l(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, _l(t), null;
		}
		throw Error(i(156, t.tag));
	}
	function yl(e, t) {
		switch (L(t), t.tag) {
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
	function bl(e, t) {
		switch (L(t), t.tag) {
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
	function xl(e, t) {
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
			Y(t, t.return, e);
		}
	}
	function Sl(e, t, n) {
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
								Y(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			Y(t, t.return, e);
		}
	}
	function Cl(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Eo(t, n);
			} catch (t) {
				Y(e, e.return, t);
			}
		}
	}
	function wl(e, t, n) {
		n.props = Cc(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Y(e, t, n);
		}
	}
	function Tl(e, t) {
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
						var i = e.stateNode, a = xi(e.memoizedProps, i);
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
			Y(e, t, n);
		}
	}
	function El(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				Y(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				Y(e, t, n);
			}
			else n.current = null;
		}
	}
	function Dl(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) rm(e.stateNode, t[n]);
	}
	function Ol(e) {
		for (var t = e.return; t !== null && (jl(t) && rm(e.stateNode, t.stateNode), !Al(t));) t = t.return;
	}
	function kl(e) {
		for (var t = e.return; t !== null && (jl(t) && im(e.stateNode, t.stateNode), !Al(t));) t = t.return;
	}
	function Al(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 27;
	}
	function jl(e) {
		return e && e.tag === 7 && e.stateNode !== null;
	}
	function Ml(e) {
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
			Y(e, e.return, t);
		}
	}
	function Nl(e, t, n) {
		try {
			var r = e.stateNode;
			sp(r, e.type, n, t), r[jt] = t;
		} catch (t) {
			Y(e, e.return, t);
		}
	}
	function Pl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Tp(e.type) || e.tag === 4;
	}
	function Fl(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Pl(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Tp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Il(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Tn)), Dl(e, r), M = !0;
		else if (i !== 4 && (i === 27 && (Dl(e, r), r = null, Tp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (Il(e, t, n, r), e = e.sibling; e !== null;) Il(e, t, n, r), e = e.sibling;
	}
	function Ll(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), Dl(e, r), M = !0;
		else if (i !== 4 && (i === 27 && (Dl(e, r), r = null, Tp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Ll(e, t, n, r), e = e.sibling; e !== null;) Ll(e, t, n, r), e = e.sibling;
	}
	function Rl(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			ap(t, r, n), t[At] = e, t[jt] = n;
		} catch (t) {
			Y(e, e.return, t);
		}
	}
	var zl = !1, Bl = null;
	function Vl(e) {
		(e.tag === 30 || e.subtreeFlags & 33554432) && (zl = !0);
	}
	var Hl = null;
	function Ul() {
		var e = Hl;
		return Hl = null, e;
	}
	var Wl = 0;
	function Gl(e, t, n, r, i) {
		return Wl = 0, Kl(e.child, t, n, r, i);
	}
	function Kl(e, t, n, r, i) {
		for (var a = !1; e !== null;) {
			if (e.tag === 5) {
				var o = e.stateNode;
				if (r !== null) {
					var s = jp(o);
					r.push(s), s.view && (a = !0);
				} else a || jp(o).view && (a = !0);
				zl = !0, Op(o, Wl === 0 ? t : t + "_" + Wl, n), Wl++;
			} else (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && i || Kl(e.child, t, n, r, i) && (a = !0));
			e = e.sibling;
		}
		return a;
	}
	function ql(e, t) {
		for (; e !== null;) e.tag === 5 ? kp(e.stateNode, e.memoizedProps) : (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && t || ql(e.child, t)), e = e.sibling;
	}
	function Jl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (Jl(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(i(544));
				var n = t.name;
				t = Ci(t.default, t.share), t !== "none" && (Gl(e, n, t, null, !1) || ql(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function Yl(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = xi(r, n), a = Ci(r.default, n.paired ? r.share : r.enter);
			a === "none" ? Jl(e) : Gl(e, i, a, null, !1) ? (Jl(e), n.paired || t || Fd(e, r.onEnter)) : ql(e.child, !1);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Yl(e, t), e = e.sibling;
		else Jl(e);
	}
	function Xl(e) {
		if (Bl !== null && Bl.size !== 0) {
			var t = Bl;
			if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
				if (e.tag !== 22 || e.memoizedState === null) {
					if (e.tag === 30 && e.flags & 18874368) {
						var n = e.memoizedProps, r = n.name;
						if (r != null && r !== "auto") {
							var i = t.get(r);
							if (i !== void 0) {
								var a = Ci(n.default, n.share);
								if (a !== "none" && (Gl(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, Fd(e, n.onShare)) : ql(e.child, !1)), t.delete(r), t.size === 0) break;
							}
						}
					}
					Xl(e);
				}
				e = e.sibling;
			}
		}
	}
	function Zl(e) {
		if (e.tag === 30) {
			var t = e.memoizedProps, n = xi(t, e.stateNode), r = Bl === null ? void 0 : Bl.get(n), i = Ci(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Gl(e, n, i, null, !1) ? r === void 0 ? Fd(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, Bl.delete(n), Fd(e, t.onShare)) : ql(e.child, !1)), Bl !== null && Xl(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Zl(e), e = e.sibling;
		else Bl !== null && Xl(e);
	}
	function Ql(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = xi(t, e.stateNode);
				t = Ci(t.default, t.update), e.flags &= -5, t !== "none" && Gl(e, n, t, e.memoizedState = [], !1);
			} else e.subtreeFlags & 33554432 && Ql(e);
			e = e.sibling;
		}
	}
	function $l(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if (e.tag !== 22 || e.memoizedState === null) {
				if (e.tag === 30 && e.flags & 18874368) {
					var t = e.stateNode;
					t.paired !== null && (t.paired = null, ql(e.child, !1));
				}
				$l(e);
			}
			e = e.sibling;
		}
	}
	function eu(e) {
		if (e.tag === 30) e.stateNode.paired = null, ql(e.child, !1), $l(e);
		else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) eu(e), e = e.sibling;
		else $l(e);
	}
	function tu(e) {
		for (e = e.child; e !== null;) e.tag === 30 ? ql(e.child, !1) : e.subtreeFlags & 33554432 && tu(e), e = e.sibling;
	}
	function nu(e, t, n, r, i, a, o) {
		for (var s = !1; t !== null;) {
			if (t.tag === 5) {
				var c = t.stateNode;
				if (a !== null && Wl < a.length) {
					var l = a[Wl], u = jp(c);
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
				e.flags & 4 && Op(c, Wl === 0 ? n : n + "_" + Wl, i), s && e.flags & 4 || (Hl === null && (Hl = []), Hl.push(c, Wl === 0 ? r : r + "_" + Wl, t.memoizedProps)), Wl++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : nu(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function ru(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = xi(n, r), a = Ci(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(Mp);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				Wl = 0, i = nu(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || Fd(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && ru(e, t);
			e = e.sibling;
		}
	}
	var iu = !1, au = !1, ou = !1, su = !1, cu = typeof WeakSet == "function" ? WeakSet : Set, lu = null, uu = !1, du = !1, fu = !1, pu = !1;
	function mu(e, t, n) {
		if (e = e.containerInfo, up = yh, e = Zr(e), Qr(e)) {
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
		}, yh = !1, n = (n & 335544064) === n, lu = t, t = n ? 9270 : 1024; lu !== null;) {
			if (e = lu, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && Zl(r[a]);
			if (e.alternate === null && e.flags & 2) n && Vl(e), hu(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && Zl(r), hu(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && Vl(e), hu(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, lu = r) : (n && Ql(e), hu(n));
			}
		}
		Bl = null;
	}
	function hu(e) {
		for (; lu !== null;) {
			var t = lu, n = e, r = t.alternate, a = t.flags;
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
							Y(t, t.return, e);
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
					n && r !== null && (n = xi(r.memoizedProps, r.stateNode), a = t.memoizedProps, a = Ci(a.default, a.update), a !== "none" && Gl(r, n, a, r.memoizedState = [], !0));
					break;
				default: if (a & 1024) throw Error(i(163));
			}
			if (r = t.sibling, r !== null) {
				r.return = t.return, lu = r;
				break;
			}
			lu = t.return;
		}
	}
	function gu(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				Fu(e, n), r & 4 && xl(5, n);
				break;
			case 1:
				if (Fu(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						Y(n, n.return, e);
					}
					else {
						var i = Cc(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							Y(n, n.return, e);
						}
					}
				}
				r & 64 && Cl(n), r & 512 && Tl(n, n.return);
				break;
			case 3:
				if (Fu(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
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
						Y(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Rl(n);
			case 26:
			case 5:
				Fu(e, n), t === null && r & 4 && Ml(n), r & 512 && Tl(n, n.return);
				break;
			case 12:
				Fu(e, n);
				break;
			case 31:
				Fu(e, n), r & 4 && wu(e, n);
				break;
			case 13:
				Fu(e, n), r & 4 && Tu(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = yf.bind(null, n), dm(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || iu, !r) {
					var a = t !== null && t.memoizedState !== null || au;
					t = iu, i = au, iu = r, (au = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), Lu(e, n, r)) : Fu(e, n), iu = t, au = i;
				}
				break;
			case 30:
				Fu(e, n), r & 512 && Tl(n, n.return);
				break;
			case 7: r & 512 && Tl(n, n.return);
			default: Fu(e, n);
		}
	}
	function _u(e, t) {
		for (e = e.child; e !== null;) vu(e, t), e = e.sibling;
	}
	function vu(e, t) {
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
					Y(e, e.return, t);
				}
				yu(e, t);
				break;
			case 6:
				try {
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, M = !0;
				} catch (t) {
					Y(e, e.return, t);
				}
				break;
			case 18:
				try {
					var s = e.stateNode;
					t ? Dp(s, !0) : Dp(e.stateNode, !1);
				} catch (t) {
					Y(e, e.return, t);
				}
				break;
			case 22:
			case 23:
				e.memoizedState === null && _u(e, t);
				break;
			default: _u(e, t);
		}
	}
	function yu(e, t) {
		if (e.subtreeFlags & 67108864) for (e = e.child; e !== null;) {
			a: {
				var n = e, r = t;
				switch (n.tag) {
					case 4:
						vu(n, r);
						break a;
					case 22:
						n.memoizedState === null && yu(n, r);
						break a;
					default: yu(n, r);
				}
			}
			e = e.sibling;
		}
	}
	function G(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, G(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Rt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var bu = null, xu = !1;
	function Su(e, t, n) {
		for (n = n.child; n !== null;) Cu(e, t, n), n = n.sibling;
	}
	function Cu(e, t, n) {
		if (it && typeof it.onCommitFiberUnmount == "function") try {
			it.onCommitFiberUnmount(rt, n);
		} catch {}
		switch (n.tag) {
			case 26:
				au || El(n, t), Su(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !au && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				au || El(n, t), kl(n);
				var r = bu, i = xu;
				Tp(n.type) && (bu = n.stateNode, xu = !1), Su(e, t, n), ym(n.stateNode, n.type, n.memoizedProps), bu = r, xu = i;
				break;
			case 5: au || El(n, t), kl(n);
			case 6:
				if (n.tag === 6 && kl(n), r = bu, i = xu, bu = null, Su(e, t, n), bu = r, xu = i, bu !== null) {
					if (xu) try {
						(bu.nodeType === 9 ? bu.body : bu.nodeName === "HTML" ? bu.ownerDocument.body : bu).removeChild(n.stateNode), M = !0;
					} catch (e) {
						Y(n, t, e);
					}
					else try {
						bu.removeChild(n.stateNode), M = !0;
					} catch (e) {
						Y(n, t, e);
					}
				}
				break;
			case 18:
				bu !== null && (xu ? (e = bu, Ep(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Gh(e)) : Ep(bu, n.stateNode));
				break;
			case 4:
				r = bu, i = xu, bu = n.stateNode.containerInfo, xu = !0, Su(e, t, n), bu = r, xu = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Sl(2, n, t), au || Sl(4, n, t), Su(e, t, n);
				break;
			case 1:
				au || (El(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && wl(n, t, r)), Su(e, t, n);
				break;
			case 21:
				Su(e, t, n);
				break;
			case 22:
				au = (r = au) || n.memoizedState !== null, Su(e, t, n), au = r;
				break;
			case 30:
				El(n, t), Su(e, t, n);
				break;
			case 7:
				au || El(n, t), Su(e, t, n);
				break;
			default: Su(e, t, n);
		}
	}
	function wu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Gh(e);
			} catch (e) {
				Y(t, t.return, e);
			}
		}
	}
	function Tu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Gh(e);
		} catch (e) {
			Y(t, t.return, e);
		}
	}
	function Eu(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new cu()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new cu()), t;
			default: throw Error(i(435, e.tag));
		}
	}
	function Du(e, t) {
		var n = Eu(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = bf.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function Ou(e, t, n) {
		var r = t.deletions;
		if (r !== null) for (var a = 0; a < r.length; a++) {
			var o = r[a], s = e, c = t, l = c;
			a: for (; l !== null;) {
				switch (l.tag) {
					case 27:
						if (Tp(l.type)) {
							bu = l.stateNode, xu = !1;
							break a;
						}
						break;
					case 5:
						bu = l.stateNode, xu = !1;
						break a;
					case 3:
					case 4:
						bu = l.stateNode.containerInfo, xu = !0;
						break a;
				}
				l = l.return;
			}
			if (bu === null) throw Error(i(160));
			Cu(s, c, o), bu = null, xu = !1, s = o.alternate, s !== null && (s.return = null), o.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) Au(t, e, n), t = t.sibling;
	}
	var ku = null;
	function Au(e, t, n) {
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
				Ou(t, e, n), ju(e), a & 4 && (Sl(3, e, e.return), xl(3, e), Sl(5, e, e.return));
				break;
			case 1:
				Ou(t, e, n), ju(e), a & 512 && (au || r === null || El(r, r.return)), a & 64 && iu && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (o = ku, Ou(t, e, n), ju(e), a & 512 && (au || r === null || El(r, r.return)), a & 4) {
					if (a = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if (iu) e.stateNode = hp(e.type, e.memoizedProps, t.containerInfo, e);
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
							} else iu || Ym(o, e.type, e.stateNode);
						} else e.stateNode = Um(o, n, e.memoizedProps);
					} else a === n ? n === null && e.stateNode !== null && Nl(e, e.memoizedProps, r.memoizedProps) : (a === null ? (t = r.stateNode, t === null || au || t.parentNode.removeChild(t)) : a.count--, n === null ? iu || Ym(o, e.type, e.stateNode) : Um(o, n, e.memoizedProps));
				}
				break;
			case 27:
				Ou(t, e, n), ju(e), a & 512 && (au || r === null || El(r, r.return)), r !== null && a & 4 && Nl(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (o = ou, ou = !1, Ou(t, e, n), ou = o, ju(e), a & 512 && (au || r === null || El(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						_n(t, ""), M = !0;
					} catch (t) {
						Y(e, e.return, t);
					}
				}
				a & 4 && e.stateNode != null && (t = e.memoizedProps, Nl(e, t, r === null ? t : r.memoizedProps)), a & 1024 && (su = !0);
				break;
			case 6:
				if (Ou(t, e, n), ju(e), a & 4) {
					if (e.stateNode === null) throw Error(i(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, M = !0;
					} catch (t) {
						Y(e, e.return, t);
					}
				}
				break;
			case 3:
				if (M = !1, qm = null, o = ku, ku = Cm(t.containerInfo), Ou(t, e, n), ku = o, ju(e), a & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Gh(t.containerInfo);
				} catch (t) {
					Y(e, e.return, t);
				}
				su && (su = !1, Mu(e)), M = !1;
				break;
			case 4:
				a = ou, ou = iu, r = $t(), o = ku, ku = Cm(e.stateNode.containerInfo), Ou(t, e, n), ju(e), ku = o, M && du && (fu = !0), M = r, ou = a;
				break;
			case 12:
				Ou(t, e, n), ju(e);
				break;
			case 31:
				Ou(t, e, n), ju(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Du(e, t)));
				break;
			case 13:
				Ou(t, e, n), ju(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (gd = Je()), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Du(e, t)));
				break;
			case 22:
				o = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = iu, l = au, u = ou;
				iu = c || o, ou = u || o, au = l || s, Ou(t, e, n), au = l, ou = u, iu = c, ju(e), a & 8192 && (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, !o || r === null || s || iu || au || (t = s || au, n = iu, r = au, iu = o || iu, au = t, Iu(e, 2), iu = n, au = r), !o && ou || _u(e, o)), a & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, Du(e, n))));
				break;
			case 19:
				Ou(t, e, n), ju(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Du(e, t)));
				break;
			case 30:
				a & 512 && (au || r === null || El(r, r.return)), a = $t(), o = du, s = (n & 335544064) === n, c = e.memoizedProps, du = s && Ci(c.default, c.update) !== "none", Ou(t, e, n), ju(e), s && r !== null && M && (e.flags |= 4), du = o, M = a;
				break;
			case 21: break;
			case 7: a & 512 && (au || r === null || El(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: Ou(t, e, n), ju(e);
		}
	}
	function ju(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Pl(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				r = null;
				for (var a = e.return; a !== null;) {
					if (jl(a)) {
						var o = a.stateNode;
						r === null ? r = [o] : r.push(o);
					}
					if (Al(a)) break;
					a = a.return;
				}
				var s = r;
				if (n == null) throw Error(i(160));
				switch (n.tag) {
					case 27:
						var c = n.stateNode;
						Ll(e, Fl(e), c, s);
						break;
					case 5:
						var l = n.stateNode;
						n.flags & 32 && (_n(l, ""), n.flags &= -33), Ll(e, Fl(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						Il(e, Fl(e), u, s);
						break;
					default: throw Error(i(161));
				}
			} catch (t) {
				Y(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function Mu(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			Mu(t), t.tag === 5 && t.flags & 1024 && (t = t.stateNode, yh = !0, t.reset(), yh = !1), e = e.sibling;
		}
	}
	function Nu(e, t) {
		if (t.subtreeFlags & 9270) for (t = t.child; t !== null;) Pu(t, e), t = t.sibling;
		else ru(t, !1);
	}
	function Pu(e, t) {
		var n = e.alternate;
		if (n === null) Yl(e, !1);
		else switch (e.tag) {
			case 3:
				if (pu = uu = !1, Ul(), Nu(t, e), !uu && !fu) {
					if (e = Hl, e !== null) for (var r = 0; r < e.length; r += 3) {
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
					})), pu = !0;
				}
				Hl = null;
				break;
			case 5:
				Nu(t, e);
				break;
			case 4:
				r = uu, uu = !1, Nu(t, e), uu && (fu = !0), uu = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? Nu(t, e) : Yl(e, !1));
				break;
			case 30:
				r = uu, i = Ul(), uu = !1, Nu(t, e), uu && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = xi(a, o), o = xi(n.memoizedProps, o);
				var s = Ci(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, Wl = 0, t = nu(e, n, t, o, s, a, !0), Wl !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (Fd(e, e.memoizedProps.onUpdate), Hl = i) : i !== null && (i.push.apply(i, Hl), Hl = i), uu = e.flags & 32 ? !0 : r;
				break;
			default: Nu(t, e);
		}
	}
	function Fu(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) gu(e, t.alternate, t), t = t.sibling;
	}
	function Iu(e, t) {
		for (e = e.child; e !== null;) {
			var n = e, r = t;
			switch (n.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Sl(4, n, n.return), Iu(n, r);
					break;
				case 1:
					El(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && wl(n, n.return, i), Iu(n, r);
					break;
				case 27: r & 2 && ym(n.stateNode, n.type, n.memoizedProps);
				case 5:
					El(n, n.return), n.tag !== 5 && n.tag !== 27 || kl(n), Iu(n, r);
					break;
				case 6:
					kl(n);
					break;
				case 26:
					El(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || au || i.parentNode.removeChild(i), Iu(n, r);
					break;
				case 22:
					n.memoizedState === null && Iu(n, r);
					break;
				case 30:
					El(n, n.return), Iu(n, r);
					break;
				case 7: El(n, n.return);
				default: Iu(n, r);
			}
			e = e.sibling;
		}
	}
	function Lu(e, t, n) {
		for (n = t.subtreeFlags & 8772 ? n : n & -2, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags, s = !!(n & 1);
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					Lu(i, a, n), xl(4, a);
					break;
				case 1:
					if (Lu(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Y(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var c = r.stateNode;
						try {
							var l = i.shared.hiddenCallbacks;
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) To(l[i], c);
						} catch (e) {
							Y(r, r.return, e);
						}
					}
					s && o & 64 && Cl(a), Tl(a, a.return);
					break;
				case 27: n & 2 && Rl(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || Ol(a), Lu(i, a, n), s && r === null && o & 4 && Ml(a), Tl(a, a.return);
					break;
				case 6:
					Ol(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || iu || Ym(Cm(c.ownerDocument), a.type, c), Lu(i, a, n), s && r === null && o & 4 && Ml(a), Tl(a, a.return);
					break;
				case 12:
					Lu(i, a, n);
					break;
				case 31:
					Lu(i, a, n), s && o & 4 && wu(i, a);
					break;
				case 13:
					Lu(i, a, n), s && o & 4 && Tu(i, a);
					break;
				case 22:
					a.memoizedState === null && Lu(i, a, n), Tl(a, a.return);
					break;
				case 30:
					Lu(i, a, n), Tl(a, a.return);
					break;
				case 7: Tl(a, a.return);
				default: Lu(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Ru(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Fa(n));
	}
	function zu(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Fa(e));
	}
	function Bu(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) Vu(e, t, n, r), t = t.sibling;
		else i && tu(t);
	}
	function Vu(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && eu(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Bu(e, t, n, r), a & 2048 && xl(9, t);
				break;
			case 1:
				Bu(e, t, n, r);
				break;
			case 3:
				Bu(e, t, n, r), i && pu && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && Fa(a)));
				break;
			case 12:
				if (a & 2048) {
					Bu(e, t, n, r), a = t.stateNode;
					try {
						var o = t.memoizedProps, s = o.id, c = o.onPostCommit;
						typeof c == "function" && c(s, t.alternate === null ? "mount" : "update", a.passiveEffectDuration, -0);
					} catch (e) {
						Y(t, t.return, e);
					}
				} else Bu(e, t, n, r);
				break;
			case 31:
				Bu(e, t, n, r);
				break;
			case 13:
				Bu(e, t, n, r);
				break;
			case 23: break;
			case 22:
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && eu(t), o._visibility & 2 ? Bu(e, t, n, r) : (o._visibility |= 2, Hu(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && eu(s), o._visibility & 2 ? Bu(e, t, n, r) : Uu(e, t)), a & 2048 && Ru(s, t);
				break;
			case 24:
				Bu(e, t, n, r), a & 2048 && zu(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (ql(a.child, !0), ql(t.child, !0))), Bu(e, t, n, r);
				break;
			default: Bu(e, t, n, r);
		}
	}
	function Hu(e, t, n, r, i) {
		for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Hu(a, o, s, c, i), xl(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Hu(a, o, s, c, i)) : u._visibility & 2 ? Hu(a, o, s, c, i) : Uu(a, o), i && l & 2048 && Ru(o.alternate, o);
					break;
				case 24:
					Hu(a, o, s, c, i), i && l & 2048 && zu(o.alternate, o);
					break;
				default: Hu(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Uu(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Uu(n, r), i & 2048 && Ru(r.alternate, r);
					break;
				case 24:
					Uu(n, r), i & 2048 && zu(r.alternate, r);
					break;
				default: Uu(n, r);
			}
			t = t.sibling;
		}
	}
	var Wu = 8192;
	function Gu(e, t, n) {
		if (e.subtreeFlags & Wu) for (e = e.child; e !== null;) Ku(e, t, n), e = e.sibling;
	}
	function Ku(e, t, n) {
		switch (e.tag) {
			case 26:
				Gu(e, t, n), e.flags & Wu && (e.memoizedState === null ? (e = e.stateNode, (t & 335544128) === t && eh(n, e)) : th(n, ku, e.memoizedState, e.memoizedProps));
				break;
			case 5:
				Gu(e, t, n), e.flags & Wu && (e = e.stateNode, (t & 335544128) === t && eh(n, e));
				break;
			case 3:
			case 4:
				var r = ku;
				ku = Cm(e.stateNode.containerInfo), Gu(e, t, n), ku = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Wu, Wu = 16777216, Gu(e, t, n), Wu = r) : Gu(e, t, n));
				break;
			case 30:
				if ((e.flags & Wu) !== 0 && (r = e.memoizedProps.name, r != null && r !== "auto")) {
					var i = e.stateNode;
					i.paired = null, Bl === null && (Bl = /* @__PURE__ */ new Map()), Bl.set(r, i);
				}
				Gu(e, t, n);
				break;
			default: Gu(e, t, n);
		}
	}
	function qu(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Ju(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				lu = r, Zu(r, e);
			}
			qu(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Yu(e), e = e.sibling;
	}
	function Yu(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Ju(e), e.flags & 2048 && Sl(9, e, e.return);
				break;
			case 3:
				Ju(e);
				break;
			case 12:
				Ju(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Xu(e)) : Ju(e);
				break;
			default: Ju(e);
		}
	}
	function Xu(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				lu = r, Zu(r, e);
			}
			qu(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Sl(8, t, t.return), Xu(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Xu(t));
					break;
				default: Xu(t);
			}
			e = e.sibling;
		}
	}
	function Zu(e, t) {
		for (; lu !== null;) {
			var n = lu;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					Sl(8, n, t);
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
			if (r = n.child, r !== null) r.return = n, lu = r;
			else a: for (n = e; lu !== null;) {
				r = lu;
				var i = r.sibling, a = r.return;
				if (G(r), r === n) {
					lu = null;
					break a;
				}
				if (i !== null) {
					i.return = a, lu = i;
					break a;
				}
				lu = a;
			}
		}
	}
	var Qu = {
		getCacheForType: function(e) {
			var t = Da(Na), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Da(Na).controller.signal;
		}
	}, $u = typeof WeakMap == "function" ? WeakMap : Map, ed = 0, td = null, K = null, q = 0, nd = 0, rd = null, J = !1, id = !1, ad = !1, od = 0, sd = 0, cd = 0, ld = 0, ud = 0, dd = 0, fd = 0, pd = null, md = null, hd = !1, gd = 0, _d = 0, vd = Infinity, yd = null, bd = null, xd = 0, Sd = null, Cd = null, wd = 0, Td = 0, Ed = null, Dd = null, Od = null, kd = null, Ad = null, jd = 0, Md = null;
	function Nd() {
		return ed & 2 && q !== 0 ? q & -q : A.T === null ? Dt() : If();
	}
	function Pd() {
		if (dd === 0) {
			if (!(q & 536870912) || R) {
				var e = dt;
				dt <<= 1, !(dt & 3932160) && (dt = 262144), dd = e;
			} else dd = 536870912;
		}
		return e = Mo.current, e !== null && (e.flags |= 32), dd;
	}
	function Fd(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Lp(xi(e.memoizedProps, n))), kd === null && (kd = []), kd.push(t.bind(null, r));
		}
	}
	function Id(e, t, n) {
		(e === td && (nd === 2 || nd === 9) || e.cancelPendingCommit !== null) && (Ud(e, 0), Bd(e, q, dd, !1)), bt(e, n), (!(ed & 2) || e !== td) && (e === td && (!(ed & 2) && (ld |= n), sd === 4 && Bd(e, q, dd, !1)), Of(e));
	}
	function Ld(e, t, n) {
		if (ed & 6) throw Error(i(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || ht(e, t), a = r ? Zd(e, t) : Yd(e, t, !0), o = r;
		do {
			if (a === 0) {
				id && !r && Bd(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, o && !zd(n)) a = Yd(e, t, !1), o = !1;
			else {
				if (a === 2) {
					if (o = t, e.errorRecoveryDisabledLanes & o) var s = 0;
					else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
					if (s !== 0) {
						t = s;
						a: {
							var c = e;
							a = pd;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (Ud(c, s).flags |= 256), s = Yd(c, s, !1), s !== 2 && s !== 6) {
								if (ad && !l) {
									c.errorRecoveryDisabledLanes |= o, ld |= o, a = 4;
									break a;
								}
								o = md, md = a, o !== null && (md === null ? md = o : md.push.apply(md, o));
							}
							a = s;
						}
						if (o = !1, a !== 2) continue;
					}
				}
				if (a === 1) {
					Ud(e, 0), Bd(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, o = a, o) {
						case 0:
						case 1: throw Error(i(345));
						case 4: if ((t & 4194048) !== t && (t & 62914560) !== t) break;
						case 6:
							Bd(r, t, dd, !J);
							break a;
						case 2:
							md = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(i(329));
					}
					if ((t & 62914560) === t && (a = gd + 300 - Je(), 10 < a)) {
						if (Bd(r, t, dd, !J), mt(r, 0, !0) !== 0) break a;
						wd = t, r.timeoutHandle = yp(Rd.bind(null, r, n, md, yd, hd, t, dd, ld, fd, J, o, "Throttled", -0, 0), a);
						break a;
					}
					Rd(r, n, md, yd, hd, t, dd, ld, fd, J, o, null, -0, 0);
				}
				break;
			}
		} while (1);
		Of(e);
	}
	function Rd(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
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
		}, Bl = null, Ku(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = ah.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? gd - Je() : (a & 4194048) === a ? _d - Je() : 0, m = rh(d, m), m !== null) ? (wd = a, e.cancelPendingCommit = m(af.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), Bd(e, a, o, !l)) : af(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function zd(e) {
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
	function Bd(e, t, n, r) {
		t = gt(e, t), t &= ~ud, t &= ~ld, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - ot(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && St(e, n, t);
	}
	function Vd() {
		return ed & 6 ? !0 : (kf(0, !1), !1);
	}
	function Hd() {
		if (K !== null) {
			if (nd === 0) var e = K.return;
			else e = K, ya = va = null, ss(e), oo = null, so = 0, e = K;
			for (; e !== null;) bl(e.alternate, e), e = e.return;
			K = null;
		}
	}
	function Ud(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, bp(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), wd = 0, Hd(), td = e, K = n = Li(e.current, null), q = t, nd = 0, rd = null, J = !1, id = ht(e, t), ad = !1, fd = dd = ud = ld = cd = sd = 0, md = pd = null, hd = !1, od = gt(e, t), Di(), n;
	}
	function Wd(e, t) {
		B = null, A.H = hc, t === Za || t === z ? (t = io(), nd = 3) : t === Qa ? (t = io(), nd = 4) : nd = t === Nc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, rd = t, K === null && (sd = 1, Dc(e, Gi(t, e.current)));
	}
	function Gd() {
		var e = Mo.current;
		return e === null ? !0 : (q & 4194048) === q ? No === null : (q & 62914560) === q || q & 536870912 ? e === No : !1;
	}
	function Kd() {
		var e = A.H;
		return A.H = hc, e === null ? hc : e;
	}
	function qd() {
		var e = A.A;
		return A.A = Qu, e;
	}
	function Jd() {
		sd = 4, J || (q & 4194048) !== q && Mo.current !== null || (id = !0), !(cd & 134217727) && !(ld & 134217727) || td === null || Bd(td, q, dd, !1);
	}
	function Yd(e, t, n) {
		var r = ed;
		ed |= 2;
		var i = Kd(), a = qd();
		(td !== e || q !== t) && (yd = null, Ud(e, t)), t = !1;
		var o = sd;
		a: do
			try {
				if (nd !== 0 && K !== null) {
					var s = K, c = rd;
					switch (nd) {
						case 8:
							Hd(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							Mo.current === null && (t = !0);
							var l = nd;
							if (nd = 0, rd = null, tf(e, s, c, l), n && id) {
								o = 0;
								break a;
							}
							break;
						default: l = nd, nd = 0, rd = null, tf(e, s, c, l);
					}
				}
				Xd(), o = sd;
				break;
			} catch (t) {
				Wd(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, ya = va = null, ed = r, A.H = i, A.A = a, K === null && (td = null, q = 0, Di()), o;
	}
	function Xd() {
		for (; K !== null;) $d(K);
	}
	function Zd(e, t) {
		var n = ed;
		ed |= 2;
		var r = Kd(), a = qd();
		td !== e || q !== t ? (yd = null, vd = Je() + 500, Ud(e, t)) : id = ht(e, t);
		a: do
			try {
				if (nd !== 0 && K !== null) {
					t = K;
					var o = rd;
					b: switch (nd) {
						case 1:
							nd = 0, rd = null, tf(e, t, o, 1);
							break;
						case 2:
						case 9:
							if (eo(o)) {
								nd = 0, rd = null, ef(t);
								break;
							}
							t = function() {
								nd !== 2 && nd !== 9 || td !== e || (nd = 7), Of(e);
							}, o.then(t, t);
							break a;
						case 3:
							nd = 7;
							break a;
						case 4:
							nd = 5;
							break a;
						case 7:
							eo(o) ? (nd = 0, rd = null, ef(t)) : (nd = 0, rd = null, tf(e, t, o, 7));
							break;
						case 5:
							var s = null;
							switch (K.tag) {
								case 26: s = K.memoizedState;
								case 5:
								case 27:
									var c = K;
									if (s ? Qm(s) : c.stateNode.complete) {
										nd = 0, rd = null;
										var l = c.sibling;
										if (l !== null) K = l;
										else {
											var u = c.return;
											u === null ? K = null : (K = u, nf(u));
										}
										break b;
									}
							}
							nd = 0, rd = null, tf(e, t, o, 5);
							break;
						case 6:
							nd = 0, rd = null, tf(e, t, o, 6);
							break;
						case 8:
							Hd(), sd = 6;
							break a;
						default: throw Error(i(462));
					}
				}
				Qd();
				break;
			} catch (t) {
				Wd(e, t);
			}
		while (1);
		return ya = va = null, A.H = r, A.A = a, ed = n, K === null ? (td = null, q = 0, Di(), sd) : 0;
	}
	function Qd() {
		for (; K !== null && !Ke();) $d(K);
	}
	function $d(e) {
		var t = dl(e.alternate, e, od);
		e.memoizedProps = e.pendingProps, t === null ? nf(e) : K = t;
	}
	function ef(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = Kc(n, t, t.pendingProps, t.type, void 0, q);
				break;
			case 11:
				t = Kc(n, t, t.pendingProps, t.type.render, t.ref, q);
				break;
			case 5:
				ss(t);
				var r = t;
				r === aa && (R ? (fa(r), r.tag === 5 && r.stateNode != null && (oa = r.stateNode)) : (fa(r), R = !0));
			default: bl(n, t), t = K = Ri(t, od), t = dl(n, t, od);
		}
		e.memoizedProps = e.pendingProps, t === null ? nf(e) : K = t;
	}
	function tf(e, t, n, r) {
		ya = va = null, ss(t), oo = null, so = 0;
		var i = t.return;
		try {
			if (Mc(e, i, t, n, q)) {
				sd = 1, Dc(e, Gi(n, e.current)), K = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw K = i, t;
			sd = 1, Dc(e, Gi(n, e.current)), K = null;
			return;
		}
		t.flags & 32768 ? (R || r === 1 ? e = !0 : id || q & 536870912 ? e = !1 : (J = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Mo.current, r !== null && r.tag === 13 && (r.flags |= 16384))), rf(t, e)) : nf(t);
	}
	function nf(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				rf(t, J);
				return;
			}
			e = t.return;
			var n = vl(t.alternate, t, od);
			if (n !== null) {
				K = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				K = t;
				return;
			}
			K = t = e;
		} while (t !== null);
		sd === 0 && (sd = 5);
	}
	function rf(e, t) {
		do {
			var n = yl(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, K = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				K = e;
				return;
			}
			K = e = n;
		} while (e !== null);
		sd = 6, K = null;
	}
	function af(e, t, n, r, a, o, s, c, l, u, d, f) {
		e.cancelPendingCommit = null;
		do
			pf();
		while (xd !== 0);
		if (ed & 6) throw Error(i(327));
		if (t !== null) {
			if (t === e.current) throw Error(i(177));
			e === td && (K = td = null, q = 0), Cd = t, Sd = e, wd = n, Ed = a, Dd = r, of(e, t, n, s, c, l, f);
		}
	}
	function of(e, t, n, r, i, a, o) {
		var s = t.lanes | t.childLanes;
		if (Td = s, s |= Ei, xt(e, n, s, r, i, a), kd = null, (n & 335544064) === n ? (Ad = Ra(e), r = 10262) : (Ad = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, xf(Qe, function() {
			return mf(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), zl = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = A.T, A.T = null, i = xe.p, xe.p = 2, a = ed, ed |= 4;
			try {
				mu(e, t, n);
			} finally {
				ed = a, xe.p = i, A.T = r;
			}
		}
		xd = 1, zl ? Od = Fp(o, e.containerInfo, Ad, lf, uf, cf, df, mf, sf, null, null) : (lf(), uf(), df());
	}
	function sf(e) {
		if (xd !== 0) {
			var t = Sd.onRecoverableError;
			t(e, { componentStack: null });
		}
	}
	function cf() {
		xd === 3 && (xd = 0, Pu(Cd, Sd), xd = 4);
	}
	function lf() {
		if (xd === 1) {
			xd = 0;
			var e = Sd, t = Cd, n = wd, r = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || r) {
				r = A.T, A.T = null;
				var i = xe.p;
				xe.p = 2;
				var a = ed;
				ed |= 4;
				try {
					du = fu = !1, Au(t, e, n), n = dp;
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
					yh = !!up, dp = up = null;
				} finally {
					ed = a, xe.p = i, A.T = r;
				}
			}
			e.current = t, xd = 2;
		}
	}
	function uf() {
		if (xd === 2) {
			xd = 0;
			var e = Sd, t = Cd, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = A.T, A.T = null;
				var r = xe.p;
				xe.p = 2;
				var i = ed;
				ed |= 4;
				try {
					gu(e, t.alternate, t);
				} finally {
					ed = i, xe.p = r, A.T = n;
				}
			}
			xd = 3;
		}
	}
	function df() {
		if (xd === 4 || xd === 3) {
			xd = 0;
			var e = Od;
			Od = null, qe();
			var t = Sd, n = Cd, r = wd, i = Dd, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? xd = 5 : (xd = 0, Cd = Sd = null, ff(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (bd = null), Et(r), n = n.stateNode, it && typeof it.onCommitFiberRoot == "function") try {
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
			if (i = kd, o = Ad, Ad = null, i !== null && (kd = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			wd & 3 && pf(), Of(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === Md ? jd++ : (jd = 0, Md = t) : (jd = 0, Md = null), kf(0, !1);
		}
	}
	function ff(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Fa(t)));
	}
	function pf() {
		return Od !== null && (Od.skipTransition(), Od = null), lf(), uf(), df(), mf();
	}
	function mf() {
		if (xd !== 5) return !1;
		var e = Sd, t = Td;
		Td = 0;
		var n = Et(wd), r = A.T, a = xe.p;
		try {
			xe.p = 32 > n ? 32 : n, A.T = null, n = Ed, Ed = null;
			var o = Sd, s = wd;
			if (xd = 0, Cd = Sd = null, wd = 0, ed & 6) throw Error(i(331));
			var c = ed;
			if (ed |= 4, Yu(o.current), Vu(o, o.current, s, n), ed = c, kf(0, !1), it && typeof it.onPostCommitFiberRoot == "function") try {
				it.onPostCommitFiberRoot(rt, o);
			} catch {}
			return !0;
		} finally {
			xe.p = a, A.T = r, ff(e, t);
		}
	}
	function hf(e, t, n) {
		t = Gi(n, t), t = kc(e.stateNode, t, 2), e = yo(e, t, 2), e !== null && (bt(e, 2), Of(e));
	}
	function Y(e, t, n) {
		if (e.tag === 3) hf(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				hf(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (bd === null || !bd.has(r))) {
					e = Gi(n, e), n = Ac(2), r = yo(t, n, 2), r !== null && (jc(n, r, t, e), bt(r, 2), Of(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function gf(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new $u();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (ad = !0, i.add(n), e = _f.bind(null, e, t, n), t.then(e, e));
	}
	function _f(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, td === e && (q & n) === n && (sd === 4 || sd === 3 && (q & 62914560) === q && 300 > Je() - gd ? ed & 2 ? ud |= n : Ud(e, 0) : ud |= n, fd === q && (fd = 0)), Of(e);
	}
	function vf(e, t) {
		t === 0 && (t = vt()), e = Ai(e, t), e !== null && (bt(e, t), Of(e));
	}
	function yf(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), vf(e, n);
	}
	function bf(e, t) {
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
		r !== null && r.delete(t), vf(e, n);
	}
	function xf(e, t) {
		return We(e, t);
	}
	var Sf = null, Cf = null, wf = !1, Tf = !1, Ef = !1, Df = 0;
	function Of(e) {
		e !== Cf && e.next === null && (Cf === null ? Sf = Cf = e : Cf = Cf.next = e), Tf = !0, wf || (wf = !0, Ff());
	}
	function kf(e, t) {
		if (!Ef && Tf) {
			Ef = !0;
			do
				for (var n = !1, r = Sf; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - ot(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, Pf(r, a));
						} else a = q, a = mt(r, r === td ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || ht(r, a) || (n = !0, Pf(r, a));
					}
					r = r.next;
				}
			while (n);
			Ef = !1;
		}
	}
	function Af() {
		jf();
	}
	function jf() {
		Tf = wf = !1;
		var e = 0;
		Df !== 0 && vp() && (e = Df);
		for (var t = Je(), n = null, r = Sf; r !== null;) {
			var i = r.next, a = Mf(r, t);
			a === 0 ? (r.next = null, n === null ? Sf = i : n.next = i, i === null && (Cf = n)) : (n = r, (e !== 0 || a & 3) && (Tf = !0)), r = i;
		}
		xd !== 0 && xd !== 5 || kf(e, !1), Df !== 0 && (Df = 0);
	}
	function Mf(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - ot(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = _t(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = td, n = q, n = mt(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (nd === 2 || nd === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Ge(r), e.callbackNode = null, e.callbackPriority = 0;
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
			return r = Nf.bind(null, e), n = We(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Ge(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function Nf(e, t) {
		if (xd !== 0 && xd !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (pf() && e.callbackNode !== n) return null;
		var r = q;
		return r = mt(e, e === td ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Ld(e, r, t), Mf(e, Je()), e.callbackNode != null && e.callbackNode === n ? Nf.bind(null, e) : null);
	}
	function Pf(e, t) {
		if (pf()) return null;
		Ld(e, t, !0);
	}
	function Ff() {
		Cp(function() {
			ed & 6 ? We(Xe, Af) : jf();
		});
	}
	function If() {
		if (Df === 0) {
			var e = Va;
			e === 0 && (e = ut, ut <<= 1, !(ut & 261888) && (ut = 256)), Df = e;
		}
		return Df;
	}
	function Lf(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : wn(e);
	}
	function Rf(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = Lf((i[jt] || null).action), o = r.submitter;
			o && (t = (t = o[jt] || null) ? Lf(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new Wn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (Df !== 0) {
								var e = new FormData(i, o);
								nc(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = new FormData(i, o), nc(n, {
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
	for (var zf = 0; zf < vi.length; zf++) {
		var Bf = vi[zf];
		yi(Bf.toLowerCase(), "on" + (Bf[0].toUpperCase() + Bf.slice(1)));
	}
	yi(ui, "onAnimationEnd"), yi(di, "onAnimationIteration"), yi(fi, "onAnimationStart"), yi("dblclick", "onDoubleClick"), yi("focusin", "onFocus"), yi("focusout", "onBlur"), yi(pi, "onTransitionRun"), yi(mi, "onTransitionStart"), yi(hi, "onTransitionCancel"), yi(gi, "onTransitionEnd"), Jt("onMouseEnter", ["mouseout", "mouseover"]), Jt("onMouseLeave", ["mouseout", "mouseover"]), Jt("onPointerEnter", ["pointerout", "pointerover"]), Jt("onPointerLeave", ["pointerout", "pointerover"]), qt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), qt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), qt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), qt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), qt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), qt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var Vf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Hf = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Vf));
	function Uf(e, t) {
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
						I(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						I(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function X(e, t) {
		var n = t[Nt];
		n === void 0 && (n = t[Nt] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (qf(t, e, 2, !1), n.add(r));
	}
	function Wf(e, t, n) {
		var r = 0;
		t && (r |= 4), qf(n, e, r, t);
	}
	var Gf = "_reactListening" + Math.random().toString(36).slice(2);
	function Kf(e) {
		if (!e[Gf]) {
			e[Gf] = !0, Gt.forEach(function(t) {
				t !== "selectionchange" && (Hf.has(t) || Wf(t, !1, e), Wf(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Gf] || (t[Gf] = !0, Wf("selectionchange", !1, t));
		}
	}
	function qf(e, t, n, r) {
		switch (Eh(t)) {
			case 2:
				var i = bh;
				break;
			case 8:
				i = xh;
				break;
			default: i = Sh;
		}
		n = i.bind(null, t, n, e), i = void 0, !Fn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function Jf(e, t, n, r, i) {
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
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = Nn(m, p), g != null && d.push(Yf(m, g, h))), f) break;
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
					(c || l) && (u = i.window === i ? i : (l = i.ownerDocument) ? l.defaultView || l.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? zt(l) : null, l !== null && (f = o(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l && (d = Xn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = cr, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? u : Vt(c), h = l == null ? u : Vt(l), u = new d(g, m + "leave", c, n, i), u.target = f, u.relatedTarget = h, g = null, zt(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = c && l ? E(c, l, Zf) : null, c !== null && Qf(s, u, c, d, !1), l !== null && f !== null && Qf(s, f, l, d, !0)));
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
				b && (vr && n.locale !== "ko" && (Cr || b !== "onCompositionStart" ? b === "onCompositionEnd" && Cr && (y = zn()) : (Ln = i, Rn = "value" in Ln ? Ln.value : Ln.textContent, Cr = !0)), v = Xf(r, b), 0 < v.length && (b = new tr(b, e, null, n, i), s.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = Sr(n), y !== null && (b.data = y)))), (y = _r ? wr(e, n) : Tr(e, n)) && (b = Xf(r, "onBeforeInput"), 0 < b.length && (v = new tr("onBeforeInput", "beforeinput", null, n, i), s.push({
					event: v,
					listeners: b
				}), v.data = y)), Rf(s, e, r, n, i);
			}
			Uf(s, t);
		});
	}
	function Yf(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Xf(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = Nn(e, n), i != null && r.unshift(Yf(e, i, a)), i = Nn(e, t), i != null && r.push(Yf(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Zf(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Qf(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = Nn(n, a), l != null && o.unshift(Yf(n, l, c))) : i || (l = Nn(n, a), l != null && o.push(Yf(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var $f = /\r\n?/g, ep = /\u0000|\uFFFD/g;
	function tp(e) {
		return (typeof e == "string" ? e : "" + e).replace($f, "\n").replace(ep, "");
	}
	function np(e, t) {
		return t = tp(t), tp(e) === t;
	}
	function rp(e, t, n, r, a, o) {
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
				if (typeof o == "function" && (n === "formAction" ? (t !== "input" && rp(e, t, "name", a.name, a, null), rp(e, t, "formEncType", a.formEncType, a, null), rp(e, t, "formMethod", a.formMethod, a, null), rp(e, t, "formTarget", a.formTarget, a, null)) : (rp(e, t, "encType", a.encType, a, null), rp(e, t, "method", a.method, a, null), rp(e, t, "target", a.target, a, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = wn(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = Tn);
				return;
			case "onScroll":
				r != null && X("scroll", e);
				return;
			case "onScrollEnd":
				r != null && X("scrollend", e);
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
				X("beforetoggle", e), X("toggle", e), en(e, "popover", r);
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
	function ip(e, t, n, r, a, o) {
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
				r != null && X("scroll", e);
				return;
			case "onScrollEnd":
				r != null && X("scrollend", e);
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
				X("error", e), X("load", e);
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
						default: rp(e, t, o, s, n, null);
					}
				}
				a && rp(e, t, "srcSet", n.srcSet, n, null), r && rp(e, t, "src", n.src, n, null);
				return;
			case "input":
				X("invalid", e);
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
						default: rp(e, t, r, d, n, null);
					}
				}
				fn(e, o, c, l, u, s, a, !1);
				return;
			case "select":
				for (a in X("invalid", e), r = s = o = null, n) if (n.hasOwnProperty(a) && (c = n[a], c != null)) switch (a) {
					case "value":
						o = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: rp(e, t, a, c, n, null);
				}
				t = o, n = s, e.multiple = !!r, t == null ? n != null && mn(e, !!r, n, !0) : mn(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in X("invalid", e), o = a = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
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
					default: rp(e, t, s, c, n, null);
				}
				gn(e, r, a, o);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: rp(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				X("beforetoggle", e), X("toggle", e), X("cancel", e), X("close", e);
				break;
			case "iframe":
			case "object":
				X("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < Vf.length; r++) X(Vf[r], e);
				break;
			case "image":
				X("error", e), X("load", e);
				break;
			case "details":
				X("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": X("error", e), X("load", e);
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
					default: rp(e, t, u, r, n, null);
				}
				return;
			default: if (xn(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && ip(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && rp(e, t, c, r, n, null));
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
						default: r.hasOwnProperty(m) || rp(e, t, m, null, r, f);
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
						default: m !== f && rp(e, t, p, m, r, f);
					}
				}
				dn(e, s, c, l, u, d, o, a);
				return;
			case "select":
				for (o in m = s = c = p = null, n) if (l = n[o], n.hasOwnProperty(o) && l != null) switch (o) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(o) || rp(e, t, o, null, r, l);
				}
				for (a in r) if (o = r[a], l = n[a], r.hasOwnProperty(a) && (o != null || l != null)) switch (a) {
					case "value":
						o !== l && (M = !0), p = o;
						break;
					case "defaultValue":
						o !== l && (M = !0), c = o;
						break;
					case "multiple": o !== l && (M = !0), s = o;
					default: o !== l && rp(e, t, a, o, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? mn(e, !!n, n ? [] : "", !1) : mn(e, !!n, t, !0)) : mn(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (a = n[c], n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: rp(e, t, c, null, r, a);
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
					default: a !== o && rp(e, t, s, a, r, o);
				}
				hn(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: rp(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						p !== m && (M = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: rp(e, t, l, p, r, m);
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
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && rp(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(i(137, t));
						break;
					default: rp(e, t, u, p, r, m);
				}
				return;
			default: if (xn(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && ip(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || ip(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && rp(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || rp(e, t, f, p, r, m);
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
			n.hasOwnProperty(r) && i != null && rp(e, t, r, null, op, i);
		}
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === Tn && (e.onclick = null), Rt(e);
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
		var e = wm.f(), t = Vd();
		return e || t;
	}
	function Em(e) {
		var t = Bt(e);
		t !== null && t.tag === 5 && t.type === "form" ? ic(t) : wm.r(e);
	}
	var Dm = typeof document > "u" ? null : document;
	function Om(e, t, n) {
		var r = Dm;
		if (r && typeof t == "string" && t) {
			var i = un(t);
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
			var i = "link[rel=\"preload\"][as=\"" + un(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + un(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + un(n.imageSizes) + "\"]")) : i += "[href=\"" + un(e) + "\"]";
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
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + un(r) + "\"][href=\"" + un(e) + "\"]", a = i;
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
		return "href=\"" + un(e) + "\"";
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
		return "[src=\"" + un(e) + "\"]";
	}
	function Hm(e) {
		return "script[async]" + e;
	}
	function Um(e, t, n) {
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
		return e = new dh(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = Fi(3, null, null, t), e.current = a, a.stateNode = e, t = Pa(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, go(a), e;
	}
	function ph(e) {
		return e ? (e = Ni, e) : Ni;
	}
	function mh(e, t, n, r, i, a) {
		i = ph(i), r.context === null ? r.context = i : r.pendingContext = i, r = vo(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = yo(e, r, t), n !== null && (Id(n, e, t), bo(n, e, t));
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
			var t = Ai(e, 67108864);
			t !== null && Id(t, e, 67108864), gh(e, 67108864);
		}
	}
	function vh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Nd();
			t = Tt(t);
			var n = Ai(e, t);
			n !== null && Id(n, e, t), gh(e, t);
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
			if (i === null) Jf(e, t, r, wh, n), Fh(e, r);
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
									Of(a), !(ed & 6) && (vd = Je() + 500, kf(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Ai(a, 2), s !== null && Id(s, a, 2), Vd(), gh(a, 2);
					}
					if (a = Ch(r), a === null && Jf(e, t, r, wh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Jf(e, t, r, null, n);
		}
	}
	function Ch(e) {
		return e = Dn(e), Th(e);
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
				En = r, n.target.dispatchEvent(r), En = null;
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
				a !== null && (e.splice(t, 3), t -= 3, nc(a, {
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
		mh(n, Nd(), e, t, null, null);
	}, Jh.prototype.unmount = qh.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			mh(e.current, 2, null, e, null, null), Vd(), t[Mt] = null;
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
		var n = !1, r = "", o = wc, s = Tc, c = Ec;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (c = t.onRecoverableError)), t = fh(e, 1, !1, null, null, n, r, null, o, s, c, Kh), e[Mt] = t.current, Kf(e), new qh(t);
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
		return l ? a === null && (a = ne(r, s)) : o === null && (o = ne(r, s)), n(c, i), l ? a : o;
	}
	return s;
}
//#endregion
//#region node_modules/@griffel/core/src/__styles.js
function In(e, t, n = yt) {
	let r = n(), i = null, a = null;
	function o(n) {
		let { dir: o, renderer: s } = n, c = o === "ltr";
		return c ? i === null && (i = ne(e, o)) : a === null && (a = ne(e, o)), r(s, t), c ? i : a;
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
})))(), 1), Hn = /*#__PURE__*/ (0, N.createContext)(/*#__PURE__*/ me());
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
//#region node_modules/@fluentui/react-utilities/lib/compose/isResolvedShorthand.js
function ar(e) {
	return typeof e == "object" && !!e && !Array.isArray(e) && !N.isValidElement(e);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/isSlot.js
function or(e) {
	return !!e?.hasOwnProperty($n);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/properties.js
var sr = (...e) => {
	let t = {};
	for (let n of e) {
		let e = Array.isArray(n) ? n : Object.keys(n);
		for (let n of e) t[n] = 1;
	}
	return t;
}, cr = sr(/* @__PURE__ */ "onAuxClick.onAnimationEnd.onAnimationStart.onCopy.onCut.onPaste.onCompositionEnd.onCompositionStart.onCompositionUpdate.onFocus.onFocusCapture.onBlur.onBlurCapture.onChange.onInput.onSubmit.onLoad.onError.onKeyDown.onKeyDownCapture.onKeyPress.onKeyUp.onAbort.onCanPlay.onCanPlayThrough.onDurationChange.onEmptied.onEncrypted.onEnded.onLoadedData.onLoadedMetadata.onLoadStart.onPause.onPlay.onPlaying.onProgress.onRateChange.onSeeked.onSeeking.onStalled.onSuspend.onTimeUpdate.onVolumeChange.onWaiting.onClick.onClickCapture.onContextMenu.onDoubleClick.onDrag.onDragEnd.onDragEnter.onDragExit.onDragLeave.onDragOver.onDragStart.onDrop.onMouseDown.onMouseDownCapture.onMouseEnter.onMouseLeave.onMouseMove.onMouseOut.onMouseOver.onMouseUp.onMouseUpCapture.onSelect.onTouchCancel.onTouchEnd.onTouchMove.onTouchStart.onScroll.onWheel.onPointerCancel.onPointerDown.onPointerEnter.onPointerLeave.onPointerMove.onPointerOut.onPointerOver.onPointerUp.onGotPointerCapture.onLostPointerCapture".split(".")), lr = sr(sr([
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
]), cr, sr([
	"itemID",
	"itemProp",
	"itemRef",
	"itemScope",
	"itemType"
])), ur = sr(lr, ["form"]), dr = sr(lr, [
	"height",
	"loop",
	"muted",
	"preload",
	"src",
	"width"
]), fr = sr(dr, ["poster"]), pr = sr(lr, ["start"]), mr = sr(lr, ["value"]), hr = sr(lr, [
	"download",
	"href",
	"hrefLang",
	"media",
	"referrerPolicy",
	"rel",
	"target",
	"type"
]), gr = sr(lr, ["dateTime"]), _r = sr(lr, [
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
]), vr = sr(_r, /* @__PURE__ */ "accept.alt.autoCorrect.autoCapitalize.autoComplete.checked.dirname.form.height.inputMode.list.max.maxLength.min.minLength.multiple.pattern.placeholder.readOnly.required.src.step.size.type.value.width".split(".")), yr = sr(_r, [
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
]), br = sr(_r, [
	"form",
	"multiple",
	"required"
]), xr = sr(lr, ["selected", "value"]), Sr = sr(lr, ["cellPadding", "cellSpacing"]), Cr = lr, wr = sr(lr, [
	"colSpan",
	"rowSpan",
	"scope"
]), Tr = sr(lr, [
	"colSpan",
	"headers",
	"rowSpan",
	"scope"
]), Er = sr(lr, ["span"]), Dr = sr(lr, ["span"]), Or = sr(lr, ["disabled", "form"]), kr = sr(lr, [
	"acceptCharset",
	"action",
	"encType",
	"encType",
	"method",
	"noValidate",
	"target"
]), Ar = sr(lr, [
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
]), jr = sr(lr, [
	"alt",
	"crossOrigin",
	"height",
	"loading",
	"src",
	"srcSet",
	"useMap",
	"width"
]), Mr = sr(lr, [
	"open",
	"onCancel",
	"onClose"
]);
function Nr(e, t, n) {
	let r = Array.isArray(t), i = {}, a = Object.keys(e);
	for (let o of a) (!r && t[o] || r && t.indexOf(o) >= 0 || o.indexOf("data-") === 0 || o.indexOf("aria-") === 0) && (!n || n?.indexOf(o) === -1) && (i[o] = e[o]);
	return i;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/getNativeElementProps.js
var Pr = {
	label: ur,
	audio: dr,
	video: fr,
	ol: pr,
	li: mr,
	a: hr,
	button: _r,
	input: vr,
	textarea: yr,
	select: br,
	option: xr,
	table: Sr,
	tr: Cr,
	th: wr,
	td: Tr,
	colGroup: Er,
	col: Dr,
	fieldset: Or,
	form: kr,
	iframe: Ar,
	img: jr,
	time: gr,
	dialog: Mr
};
function Fr(e, t, n) {
	let r = e && Pr[e] || lr;
	return r.as = 1, Nr(t, r, n);
}
var Ir = ({ primarySlotTagName: e, props: t, excludedPropNames: n }) => ({
	root: {
		style: t.style,
		className: t.className
	},
	primary: Fr(e, t, [
		...n || [],
		"style",
		"className"
	])
}), Lr = (e, t, n) => Fr(t.as ?? e, t, n);
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/omit.js
function Rr(e, t) {
	let n = {};
	for (let r in e) t.indexOf(r) === -1 && e.hasOwnProperty(r) && (n[r] = e[r]);
	return n;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useBrowserTimer.js
function zr(e, t) {
	let n = N.useRef(void 0), r = N.useCallback((r, i) => (n.current !== void 0 && t(n.current), n.current = e(r, i), n.current), [t, e]), i = N.useCallback(() => {
		n.current !== void 0 && (t(n.current), n.current = void 0);
	}, [t]);
	return N.useEffect(() => i, [i]), [r, i];
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/ThemeContext/ThemeContext.js
var Br = N.createContext(void 0), Vr = Br.Provider, Hr = N.createContext(void 0), Ur = "", Wr = Hr.Provider;
function Gr() {
	return N.useContext(Hr) ?? Ur;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/TooltipVisibilityContext/TooltipContext.js
var Kr = N.createContext(void 0), qr = {}, Jr = Kr.Provider;
function Yr() {
	return N.useContext(Kr) ?? qr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/ProviderContext/ProviderContext.js
var Xr = N.createContext(void 0), Zr = {
	targetDocument: typeof document == "object" ? document : void 0,
	dir: "ltr"
}, Qr = Xr.Provider;
function $r() {
	return N.useContext(Xr) ?? Zr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/OverridesContext/OverridesContext.js
var ei = N.createContext(void 0), ti = ei.Provider;
function ni() {
	return N.useContext(ei) ?? {};
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/CustomStyleHooksContext/CustomStyleHooksContext.js
var ri = N.createContext(void 0), ii = () => {}, ai = ri.Provider, oi = (e) => N.useContext(ri)?.[e] ?? ii, si = N.createContext(void 0);
si.Provider;
function ci() {
	return N.useContext(si);
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/AnnounceContext/AnnounceContext.js
var li = N.createContext(void 0);
li.Provider;
function ui() {
	return N.useContext(li) ?? { announce: () => void 0 };
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useAnimationFrame.js
var di = (e) => (e(0), 0), fi = (e) => e;
function pi() {
	let { targetDocument: e } = $r(), t = e?.defaultView;
	return zr(t ? t.requestAnimationFrame : di, t ? t.cancelAnimationFrame : fi);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useControllableState.js
function mi(e) {
	return typeof e == "function";
}
var hi = (e) => {
	"use no memo";
	let [t, n] = N.useState(() => e.defaultState === void 0 ? e.initialState : gi(e.defaultState) ? e.defaultState() : e.defaultState), r = N.useRef(e.state);
	N.useEffect(() => {
		r.current = e.state;
	}, [e.state]);
	let i = N.useCallback((e) => {
		mi(e) && e(r.current);
	}, []);
	return _i(e.state) ? [e.state, i] : [t, n];
};
function gi(e) {
	return typeof e == "function";
}
var _i = (e) => {
	let [t] = N.useState(() => e !== void 0);
	return t;
};
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/ssr/canUseDOM.js
function vi() {
	return typeof window < "u" && !!(window.document && window.document.createElement);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/ssr/SSRContext.js
var yi = { current: 0 }, bi = /*#__PURE__*/ N.createContext(void 0);
function xi() {
	return N.useContext(bi) ?? yi;
}
function Si() {
	let e = xi() !== yi, [t, n] = N.useState(e);
	return vi() && e && N.useLayoutEffect(() => {
		n(!1);
	}, []), t;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useIsomorphicLayoutEffect.js
var Ci = vi() ? N.useLayoutEffect : N.useEffect, I = (e) => {
	let t = N.useRef(() => {
		throw Error("Cannot call an event handler while rendering");
	});
	return Ci(() => {
		t.current = e;
	}, [e]), N.useCallback((...e) => {
		let n = t.current;
		return n(...e);
	}, [t]);
};
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useFirstMount.js
function wi() {
	let e = N.useRef(!0);
	return N.useEffect(() => {
		e.current &&= !1;
	}, []), e.current;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useForceUpdate.js
function Ti() {
	return N.useReducer((e) => e + 1, 0)[1];
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useId.js
var Ei = N.createContext(void 0);
Ei.Provider;
function Di() {
	return N.useContext(Ei) || "";
}
function Oi(e = "fui-", t) {
	let n = xi(), r = Di(), i = N.useId;
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
function ki(...e) {
	let t = N.useCallback((n) => {
		t.current = n;
		for (let t of e) typeof t == "function" ? t(n) : t && (t.current = n);
	}, [...e]);
	return t;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useOnClickOutside.js
var Ai = (e, t) => !!e?.contains(t), ji = (e) => {
	let { targetDocument: t } = $r(), n = t?.defaultView, { refs: r, callback: i, element: a, disabled: o, disabledFocusOnIframe: s, contains: c = Ai } = e, l = N.useRef(void 0);
	Pi({
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
		let e = Mi(n), t = (t) => {
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
}, Mi = (e) => {
	if (e) return typeof e.window == "object" && e.window === e ? e.event : e.ownerDocument?.defaultView?.event ?? void 0;
}, Ni = "fuiframefocus", Pi = (e) => {
	let { disabled: t, element: n, callback: r, contains: i = Ai, pollDuration: a = 100, refs: o } = e, s = N.useRef(void 0), c = I((e) => {
		o.every((t) => !i(t.current || null, e.target)) && !t && r(e);
	});
	N.useEffect(() => {
		if (!t) return n?.addEventListener(Ni, c, !0), () => {
			n?.removeEventListener(Ni, c, !0);
		};
	}, [
		n,
		t,
		c
	]), N.useEffect(() => {
		if (!t) return s.current = n?.defaultView?.setInterval(() => {
			let e = n?.activeElement;
			if (e?.tagName === "IFRAME" || e?.tagName === "WEBVIEW") {
				let t = new CustomEvent(Ni, { bubbles: !0 });
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
}, Fi = (e) => {
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
}, Ii = (e) => -1, Li = (e) => void 0;
function Ri() {
	let { targetDocument: e } = $r(), t = e?.defaultView;
	return zr(t ? t.setTimeout : Ii, t ? t.clearTimeout : Li);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/getReactElementRef.js
var zi = !0;
function Bi(e) {
	if (e) return zi ? e.props.ref : e.ref;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/mergeCallbacks.js
function Vi(e, t) {
	return (...n) => {
		e?.(...n), t?.(...n);
	};
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/isHTMLElement.js
function Hi(e, t) {
	let n = e;
	return !!(n != null && n.ownerDocument?.defaultView && n instanceof n.ownerDocument.defaultView[t?.constructorName ?? "HTMLElement"]);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/isFluentTrigger.js
function Ui(e) {
	return !!e.type.isFluentTriggerComponent;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/applyTriggerPropsToChildren.js
function Wi(e, t) {
	return typeof e == "function" ? e(t) : e ? Gi(e, t) : e || null;
}
function Gi(e, t) {
	if (!N.isValidElement(e) || e.type === N.Fragment) throw Error("A trigger element must be a single element for this component. Please ensure that you're not using React Fragments.");
	if (Ui(e)) {
		let n = Gi(e.props.children, t);
		return N.cloneElement(e, void 0, n);
	}
	return N.cloneElement(e, t);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/trigger/getTriggerChild.js
function Ki(e) {
	return N.isValidElement(e) ? Ui(e) ? Ki(e.props.children) : e : null;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/isVirtualElement.js
function qi(e) {
	return e && !!e._virtual;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/getParent.js
function Ji(e) {
	return qi(e) && e._virtual.parent || null;
}
function Yi(e, t = {}) {
	if (!e) return null;
	if (!t.skipVirtual) {
		let t = Ji(e);
		if (t) return t;
	}
	let n = e.parentNode;
	return n && n.nodeType === 11 ? n.host : n;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/elementContains.js
function Xi(e, t) {
	if (!e || !t) return !1;
	if (e === t) return !0;
	{
		let n = /* @__PURE__ */ new WeakSet();
		for (; t;) {
			let r = Yi(t, { skipVirtual: n.has(t) });
			if (n.add(t), r === e) return !0;
			t = r;
		}
	}
	return !1;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/virtualParent/setVirtualParent.js
function Zi(e, t) {
	e && Object.assign(e, { _virtual: { parent: t } });
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/createCompatSlotComponent.js
function Qi(e, t) {
	return {
		...t,
		[$n]: e
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/jsx/createJSX.js
function $i(e, t) {
	return function(n, r, i, a, o) {
		return or(r) ? t(Qi(n, r), null, i, a, o) : or(n) ? t(n, r, i, a, o) : e(n, r, i, a, o);
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/getMetadataFromSlotComponent.js
function ea(e) {
	let { as: t, [er]: n, [$n]: r, [Qn]: i, ...a } = e, o = a, s = typeof r == "string" ? t ?? r : r;
	return typeof s != "string" && t && (o.as = t), {
		elementType: s,
		props: o,
		renderFunction: i
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/Runtime.js
var ta = P, na = (e, t, n) => {
	let { elementType: r, renderFunction: i, props: a } = ea(e), o = {
		...a,
		...t
	};
	return i ? ta.jsx(N.Fragment, { children: i(r, o) }, n) : ta.jsx(r, o, n);
}, ra = (e, t, n) => {
	let { elementType: r, renderFunction: i, props: a } = ea(e), o = {
		...a,
		...t
	};
	return i ? ta.jsx(N.Fragment, { children: i(r, {
		...o,
		children: ta.jsxs(N.Fragment, { children: o.children }, void 0)
	}) }, n) : ta.jsxs(r, o, n);
}, L = $i(ta.jsx, na), ia = $i(ta.jsxs, ra), aa = N.createContext(void 0), oa = {}, R = aa.Provider, sa = () => N.useContext(aa) ?? oa, ca = (e, t) => /*#__PURE__*/ L(Qr, {
	value: t.provider,
	children: /*#__PURE__*/ L(Vr, {
		value: t.theme,
		children: /*#__PURE__*/ L(Wr, {
			value: t.themeClassName,
			children: /*#__PURE__*/ L(ai, {
				value: t.customStyleHooks_unstable,
				children: /*#__PURE__*/ L(Jr, {
					value: t.tooltip,
					children: /*#__PURE__*/ L(Gn, {
						dir: t.textDirection,
						children: /*#__PURE__*/ L(R, {
							value: t.iconDirection,
							children: /*#__PURE__*/ L(ti, {
								value: t.overrides_unstable,
								children: /*#__PURE__*/ ia(e.root, { children: [vi() ? null : /*#__PURE__*/ L("style", {
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
}), la = "data-tabster", ua = "data-tabster-dummy", da = `:is(${[
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
].join(", ")}):not(:disabled)`, fa = {
	EscapeGroupper: 1,
	Restorer: 2,
	Deloser: 3
}, pa = {
	Invisible: 0,
	PartiallyVisible: 1,
	Visible: 2
}, ma = {
	Source: 0,
	Target: 1
}, ha = {
	Both: 0,
	Vertical: 1,
	Horizontal: 2,
	Grid: 3,
	GridLinear: 4
}, ga = {
	ArrowUp: 1,
	ArrowDown: 2,
	ArrowLeft: 3,
	ArrowRight: 4,
	PageUp: 5,
	PageDown: 6,
	Home: 7,
	End: 8
}, _a = {
	Auto: 0,
	Inside: 1,
	Outside: 2
};
//#endregion
//#region node_modules/tabster/dist/esm/Instance.js
function va(e, t) {
	return e.storageEntry(t)?.tabster;
}
function ya(e, t, n) {
	let r = n || e._noop ? void 0 : t.getAttribute(la), i = e.storageEntry(t), a;
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
var ba = (e, t, n) => {
	e.addEventListener(t, n, !0);
}, xa = (e, t, n) => {
	e.removeEventListener(t, n, !0);
}, Sa = "keyborg:focusin", Ca = "keyborg:focusout", wa = 0, Ta = 1, Ea = 2, Da = 3;
function Oa(e) {
	let t = e.focus;
	t.__keyborgNativeFocus ? t.__keyborgNativeFocus.call(e) : e.focus();
}
function ka(e) {
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
		let n = new CustomEvent(Ca, {
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
			(!t || !r.has(t)) && (a.delete(e), t && (xa(t, "focusin", s), xa(t, "focusout", o)));
		}
		c(t, e.relatedTarget || void 0);
	}, c = (e, t, n) => {
		let r = e.shadowRoot;
		if (r) {
			for (let e of a) if (e.deref() === r) return;
			ba(r, "focusin", s), ba(r, "focusout", o), a.add(new WeakRef(r));
			return;
		}
		let i = {
			relatedTarget: t,
			originalEvent: n
		}, c = new CustomEvent(Sa, {
			cancelable: !0,
			bubbles: !0,
			composed: !0,
			detail: i
		});
		i.isFocusedProgrammatically = e === l[Da]?.deref(), l[Da] = void 0, e.dispatchEvent(c);
	}, l = [
		s,
		o,
		a
	];
	t.__keyborgData = l, ba(n, "focusin", s), ba(n, "focusout", o);
	function u() {
		let e = t.__keyborgData;
		return e && (e[Da] = new WeakRef(this)), d.apply(this, arguments);
	}
	function d() {
		let e = i?.get ? i.get.call(this) : i?.value;
		if (typeof e != "function") throw TypeError("HTMLElement.prototype.focus is not callable");
		return e.apply(this, arguments);
	}
	let f = n.activeElement;
	for (; f && f.shadowRoot;) c(f), f = f.shadowRoot.activeElement;
}
function Aa(e) {
	let t = e, n = t.HTMLElement.prototype, r = Object.getOwnPropertyDescriptor(n, "focus")?.value, i = r?.__keyborgFocusDescriptor, a = t.__keyborgData;
	if (a) {
		let e = t.document;
		xa(e, "focusin", a[wa]), xa(e, "focusout", a[Ta]);
		for (let e of a[Ea]) {
			let t = e.deref();
			t && (xa(t, "focusin", a[wa]), xa(t, "focusout", a[Ta]));
		}
		a[Ea].clear(), delete t.__keyborgData;
	}
	r?.__keyborgNativeFocus && (i ? Object.defineProperty(n, "focus", i) : delete n.focus);
}
var ja = 0;
function Ma(e) {
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
	return ba(d, Sa, s), ba(d, "mousedown", l), ba(e, "keydown", u), ba(d, "touchstart", c), ba(d, "touchend", c), ba(d, "touchcancel", c), ka(e), {
		dispose: () => {
			if (!t) return;
			r &&= (t.clearTimeout(r), void 0), Aa(t);
			let e = t.document;
			xa(e, Sa, s), xa(e, "mousedown", l), xa(t, "keydown", u), xa(e, "touchstart", c), xa(e, "touchend", c), xa(e, "touchcancel", c), t = void 0;
		},
		get isNavigatingWithKeyboard() {
			return n;
		},
		set isNavigatingWithKeyboard(e) {
			a(e);
		}
	};
}
function Na(e) {
	let t = e, n = "k" + ++ja, r = t, i, a = [], o = t.__keyborg;
	i = o ? o.core : Ma(t);
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
function Pa(e) {
	e.dispose();
}
//#endregion
//#region node_modules/tabster/dist/esm/Events.js
var Fa = "tabster:focusin", Ia = "tabster:focusout", La = "tabster:movefocus", Ra = "tabster:mover:state", za = "tabster:mover:movefocus", Ba = "tabster:mover:memorized-element", Va = "tabster:restorer:restore-focus", Ha = "tabster:root:focus", Ua = "tabster:root:blur", Wa = typeof CustomEvent < "u" ? CustomEvent : function() {}, Ga = class extends Wa {
	constructor(e, t) {
		super(e, {
			bubbles: !0,
			cancelable: !0,
			composed: !0,
			detail: t
		}), this.details = t;
	}
}, Ka = class extends Ga {
	constructor(e) {
		super(Fa, e);
	}
}, qa = class extends Ga {
	constructor(e) {
		super(Ia, e);
	}
}, Ja = class extends Ga {
	constructor(e) {
		super(La, e);
	}
}, Ya = class extends Ga {
	constructor(e) {
		super(Ra, e);
	}
}, Xa = class extends Ga {
	constructor() {
		super(Va);
	}
}, Za = class extends Ga {
	constructor(e) {
		super(Ha, e);
	}
}, Qa = class extends Ga {
	constructor(e) {
		super(Ua, e);
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
function $a(e) {
	for (let t of Object.keys(e)) z[t] = e[t];
}
//#endregion
//#region node_modules/tabster/dist/esm/Utils.js
var eo = 0;
function to(e) {
	let t = e();
	return t.__tabsterInstanceContext ??= {
		elementByUId: {},
		containerBoundingRectCache: {},
		lastContainerBoundingRectCacheId: 0
	};
}
function no(e) {
	let t = e, n = t.__tabsterInstanceContext;
	n && (n.elementByUId = {}, n.containerBoundingRectCache = {}, n.containerBoundingRectCacheTimer && e.clearTimeout(n.containerBoundingRectCacheTimer), delete t.__tabsterInstanceContext);
}
function ro(e) {
	return !!e.querySelector(da);
}
var io = class {
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
function ao(e, t, n) {
	if (t.nodeType === Node.ELEMENT_NODE) return z.createTreeWalker(e, t, NodeFilter.SHOW_ELEMENT, { acceptNode: n });
}
function oo(e, t) {
	let n = t.__tabsterCacheId, r = to(e), i = n ? r.containerBoundingRectCache[n] : void 0;
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
function so(e, t, n) {
	let r = lo(t);
	if (!r) return !1;
	let i = oo(e, r), a = t.getBoundingClientRect(), o = a.height * (1 - n), s = Math.max(0, i.top - a.top) + Math.max(0, a.bottom - i.bottom);
	return s === 0 || s <= o;
}
function co(e, t, n) {
	let r = lo(t);
	if (r) {
		let i = oo(e, r), a = t.getBoundingClientRect();
		n ? r.scrollTop += a.top - i.top : r.scrollTop += a.bottom - i.bottom;
	}
}
function lo(e) {
	let t = e.ownerDocument;
	if (t) {
		for (let t = z.getParentElement(e); t; t = z.getParentElement(t)) if (t.scrollWidth > t.clientWidth || t.scrollHeight > t.clientHeight) return t;
		return t.documentElement;
	}
	return null;
}
function uo(e) {
	e.__shouldIgnoreFocus = !0;
}
function fo(e) {
	return !!e.__shouldIgnoreFocus;
}
function po(e) {
	let t = /* @__PURE__ */ new Uint32Array(4);
	return e.crypto.getRandomValues(t), Array.from(t, (e) => e.toString(36)).join("") + "|" + (++eo).toString(36) + "|" + Date.now().toString(36);
}
function mo(e, t) {
	let n = to(e), r = t.__tabsterElementUID ??= po(e());
	return !n.elementByUId[r] && go(t.ownerDocument, t) && (n.elementByUId[r] = new io(t)), r;
}
function ho(e, t) {
	let n = to(e).elementByUId;
	for (let e of Object.keys(n)) {
		let r = n[e]?.get();
		t && r && !z.nodeContains(t, r) || delete n[e];
	}
}
function go(e, t) {
	return z.nodeContains(e?.body, t);
}
function _o(e, t) {
	return typeof e.matches == "function" && e.matches(t);
}
var vo = 0, yo = class {
	constructor(e, t, n) {
		this._tabster = e, this._element = new io(t), this._props = { ...n }, this.id = "i" + ++vo;
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
function bo(e) {
	let t = null;
	for (let n = z.getLastElementChild(e); n; n = z.getLastElementChild(n)) t = n;
	return t || void 0;
}
function xo(e) {
	let t = e.ownerDocument, n = t.defaultView?.getComputedStyle(e);
	return e.offsetParent === null && t.body !== e && n?.position !== "fixed" || n?.visibility === "hidden" || n?.position === "fixed" && (n.display === "none" || e.parentElement?.offsetParent === null && t.body !== e.parentElement);
}
function So(e) {
	return e.tagName === "INPUT" && !!e.name && e.type === "radio";
}
function Co(e) {
	if (!So(e)) return;
	let t = e.name, n = [], r;
	for (let i of z.getElementsByName(e, t)) if (So(i)) {
		let e = i;
		n.push(e), e.checked && (r = e);
	}
	return {
		name: t,
		buttons: new Set(n),
		checked: r
	};
}
function wo(e, t, n, r) {
	e?.addEventListener(t, n, r);
}
function To(e, t, n, r) {
	e?.removeEventListener(t, n, r);
}
function Eo(e, t) {
	return !!e && e.dispatchEvent(t);
}
//#endregion
//#region node_modules/tabster/dist/esm/DummyInput.js
var Do = 100, Oo = class {
	constructor(e, t, n, r, i) {
		this._focusIn = (e) => {
			if (this._fixedTarget) {
				let e = this._fixedTarget.get();
				e && Oa(e);
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
		o.tabIndex = 0, o.setAttribute("role", "none"), o.setAttribute(ua, ""), o.setAttribute("aria-hidden", "true");
		let s = o.style;
		s.position = "fixed", s.width = s.height = "1px", s.opacity = "0.001", s.zIndex = "-1", s.setProperty("content-visibility", "hidden"), uo(o), this.input = o, this.isFirst = n.isFirst, this.isOutside = t, this._isPhantom = n.isPhantom ?? !1, this._fixedTarget = i, wo(o, "focusin", this._focusIn), wo(o, "focusout", this._focusOut), o.__tabsterDummyContainer = r, this._isPhantom && (this._disposeTimer = a.setTimeout(() => {
			delete this._disposeTimer, this.dispose();
		}, 0), this._clearDisposeTimeout = () => {
			this._disposeTimer && (a.clearTimeout(this._disposeTimer), delete this._disposeTimer), delete this._clearDisposeTimeout;
		});
	}
	dispose() {
		this._clearDisposeTimeout && this._clearDisposeTimeout();
		let e = this.input;
		e && (delete this._fixedTarget, delete this.onFocusIn, delete this.onFocusOut, delete this.input, To(e, "focusin", this._focusIn), To(e, "focusout", this._focusOut), delete e.__tabsterDummyContainer, z.getParentNode(e)?.removeChild(e));
	}
	setTopLeft(e, t) {
		let n = this.input?.style;
		n && (n.top = `${e}px`, n.left = `${t}px`);
	}
	_isBackward(e, t, n) {
		return e && !n ? !this.isFirst : !!(n && t.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING);
	}
}, ko = {
	Root: 1,
	Modalizer: 2,
	Mover: 3,
	Groupper: 4
}, Ao = class {
	constructor(e, t, n, r, i, a) {
		this._element = t, this._instance = new Mo(e, t, this, n, r, i, a);
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
		let a = new Oo(e.getWindow, !0, {
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
					i = n && r || !n && !r ? z.getPreviousElementSibling(s) : s, a = No(i), a === t ? s = n && r || !n && !r ? i : z.getNextElementSibling(i) : a = null;
				while (a);
			}
			o && Eo(o, new Ja({
				by: "root",
				owner: o,
				next: null,
				relatedEvent: i
			})) && (z.insertBefore(o, a, s), Oa(a));
		}
	}
	static addPhantomDummyWithTarget(e, t, n, r) {
		let i = new Oo(e.getWindow, !0, {
			isPhantom: !0,
			isFirst: !0
		}, void 0, new io(r)).input;
		if (i) {
			let e, r;
			ro(t) && !n ? (e = t, r = z.getFirstElementChild(t)) : (e = z.getParentElement(t), r = n ? t : z.getNextElementSibling(t)), e && z.insertBefore(e, i, r);
		}
	}
}, jo = class {
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
			}, Do)));
		}, this._win = e;
	}
	add(e, t) {
		!this._dummyCallbacks.has(e) && this._win && (this._dummyElements.push(new io(e)), this._dummyCallbacks.set(e, t), this.domChanged = this._domChanged);
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
			if (delete this._updateTimer, this._lastUpdateQueueTime + Do <= Date.now()) {
				let e = /* @__PURE__ */ new Map(), t = [];
				for (let n of this._updateQueue) t.push(n(e));
				this._updateQueue.clear();
				for (let e of t) e();
				e.clear();
			} else this._scheduledUpdatePositions();
		}, Do);
	}
}, Mo = class {
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
					e ? (r.tabIndex = 0, t = r) : (i.tabIndex = 0, t = i), t && Oa(t);
				}
			}
		}, this.moveOutWithDefaultAction = (e, t) => {
			let n = this._firstDummy, r = this._lastDummy;
			if (n && r) {
				this._ensurePosition();
				let i = n.input, a = r.input, o = this._element?.get();
				if (i && a && o) {
					let s;
					e ? !n.isOutside && this._tabster.focusable.isFocusable(o, !0, !0, !0) ? s = o : (n.useDefaultAction = !0, i.tabIndex = 0, s = i) : (r.useDefaultAction = !0, a.tabIndex = 0, s = a), s && Eo(o, new Ja({
						by: "root",
						owner: o,
						next: null,
						relatedEvent: t
					})) && Oa(s);
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
				t && (r.add(s), n.has(s) || wo(s, "scroll", this._addTransformOffsets), i += t.scrollTop, a += t.scrollLeft);
			}
			for (let e of n) r.has(e) || To(e, "scroll", this._addTransformOffsets);
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
		this._isOutside = l ? l === _a.Outside : (a || u === "UL" || u === "OL" || u === "TABLE") && u !== "LI" && u !== "TD" && u !== "TH", this._firstDummy = new Oo(this._getWindow, this._isOutside, { isFirst: !0 }, t), this._lastDummy = new Oo(this._getWindow, this._isOutside, { isFirst: !1 }, t);
		let d = this._firstDummy.input;
		d && e._dummyObserver.add(d, this._addDummyInputs), this._firstDummy.onFocusIn = this._onFocusIn, this._firstDummy.onFocusOut = this._onFocusOut, this._lastDummy.onFocusIn = this._onFocusIn, this._lastDummy.onFocusOut = this._onFocusOut, this._element = t, this._addDummyInputs();
	}
	dispose(e, t) {
		if ((this._wrappers = this._wrappers.filter((n) => n.manager !== e && !t)).length === 0) {
			delete (this._element?.get()).__tabsterDummy;
			for (let e of this._transformElements) To(e, "scroll", this._addTransformOffsets);
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
function No(e) {
	return e?.__tabsterDummyContainer?.get() || null;
}
//#endregion
//#region node_modules/tabster/dist/esm/AttributeHelpers.js
function Po(e, t) {
	let n = JSON.stringify(e);
	return t === !0 ? n : { [la]: n };
}
function Fo(e, t) {
	for (let n of Object.keys(t)) {
		let r = t[n];
		r ? e[n] = r : delete e[n];
	}
}
function Io(e, t, n) {
	let r;
	if (n) {
		let t = e.getAttribute(la);
		if (t) try {
			r = JSON.parse(t);
		} catch {}
	}
	r ||= {}, Fo(r, t), Object.keys(r).length > 0 ? e.setAttribute(la, Po(r, !0)) : e.removeAttribute(la);
}
//#endregion
//#region node_modules/tabster/dist/esm/Root.js
var Lo = class extends Ao {
	constructor(e, t, n, r) {
		super(e, t, ko.Root, r, void 0, !0), this._onDummyInputFocus = (e) => {
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
						Oa(n);
						return;
					}
				}
				e.input?.blur();
			}
		}, this._setHandlers(this._onDummyInputFocus), this._tabster = e, this._setFocused = n;
	}
}, Ro = class extends yo {
	constructor(e, t, n, r, i) {
		super(e, t, r), this._isFocused = !1, this._setFocused = (e) => {
			if (this._setFocusedTimer && (this._tabster.getWindow().clearTimeout(this._setFocusedTimer), delete this._setFocusedTimer), this._isFocused === e) return;
			let t = this._element.get();
			t && (e ? (this._isFocused = !0, this._dummyManager?.setTabbable(!1), Eo(t, new Za({ element: t }))) : this._setFocusedTimer = this._tabster.getWindow().setTimeout(() => {
				delete this._setFocusedTimer, this._isFocused = !1, this._dummyManager?.setTabbable(!0), Eo(t, new Qa({ element: t }));
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
		this.uid = mo(a, t), this._sys = i, (e.controlTab || e.rootDummyInputs) && this.addDummyInputs();
		let o = a().document;
		wo(o, Sa, this._onFocusIn), wo(o, Ca, this._onFocusOut), this._add();
	}
	addDummyInputs() {
		this._dummyManager ||= new Lo(this._tabster, this._element, this._setFocused, this._sys);
	}
	dispose() {
		this._onDispose(this);
		let e = this._tabster.getWindow(), t = e.document;
		To(t, Sa, this._onFocusIn), To(t, Ca, this._onFocusOut), this._setFocusedTimer && (e.clearTimeout(this._setFocusedTimer), delete this._setFocusedTimer), this._dummyManager?.dispose(), this._remove();
	}
	moveOutWithDefaultAction(e, t) {
		let n = this._dummyManager;
		if (n) n.moveOutWithDefaultAction(e, t);
		else {
			let n = this.getElement();
			n && Lo.moveWithPhantomDummy(this._tabster, n, !0, e, t);
		}
	}
	_add() {}
	_remove() {}
}, zo = class {
	constructor(e, t) {
		this._autoRootWaiting = !1, this._roots = {}, this._forceDummy = !1, this.rootById = {}, this._autoRootCreate = () => {
			let e = this._win().document, t = e.body;
			if (t) {
				this._autoRootUnwait(e);
				let n = this._autoRoot;
				if (n) return Io(t, { root: n }, !0), ya(this._tabster, t), va(this._tabster, t)?.root;
			} else this._autoRootWaiting || (this._autoRootWaiting = !0, wo(e, "readystatechange", this._autoRootCreate));
		}, this._onRootDispose = (e) => {
			delete this._roots[e.id];
		}, this._tabster = e, this._win = e.getWindow, this._autoRoot = t, e.queueInit(() => {
			this._autoRoot && this._autoRootCreate();
		});
	}
	_autoRootUnwait(e) {
		To(e, "readystatechange", this._autoRootCreate), this._autoRootWaiting = !1;
	}
	dispose() {
		let e = this._win();
		this._autoRootUnwait(e.document), delete this._autoRoot, Object.keys(this._roots).forEach((e) => {
			this._roots[e] && (this._roots[e].dispose(), delete this._roots[e]);
		}), this.rootById = {};
	}
	createRoot(e, t, n) {
		let r = new Ro(this._tabster, e, this._onRootDispose, t, n);
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
			let n = va(e, h);
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
			let t = va(e, r)?.root;
			if (t) return t;
		}
	}
	onRoot(e, t) {
		t ? delete this.rootById[e.uid] : this.rootById[e.uid] = e;
	}
}, Bo = class {
	constructor(e) {
		this._tabster = e;
	}
	dispose() {}
	getProps(e) {
		let t = va(this._tabster, e);
		return t && t.focusable || {};
	}
	isFocusable(e, t, n, r) {
		return _o(e, da) && (t || e.tabIndex !== -1) ? (n || this.isVisible(e)) && (r || this.isAccessible(e)) : !1;
	}
	isVisible(e) {
		if (!e.ownerDocument || e.nodeType !== Node.ELEMENT_NODE || xo(e)) return !1;
		let t = e.ownerDocument.body.getBoundingClientRect();
		return t.width !== 0 || t.height !== 0;
	}
	isAccessible(e) {
		for (let t = e; t; t = z.getParentElement(t)) {
			let e = va(this._tabster, t);
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
			modalizerUserId: c === void 0 && o ? this._tabster.modalizer?.activeId : c || zo.getTabsterContext(this._tabster, r)?.modalizer?.userId,
			from: i || r,
			isBackward: l,
			isFindAll: e,
			acceptCondition: f,
			hasCustomCondition: p,
			includeProgrammaticallyFocusable: a,
			ignoreAccessibility: s,
			cachedGrouppers: {},
			cachedRadioGroups: {}
		}, h = ao(r.ownerDocument, r, (e) => this._acceptElement(e, m));
		if (!h) return null;
		let g = (t) => {
			let r = m.foundElement ?? m.foundBackward;
			return r && d.push(r), e ? r && (m.found = !1, delete m.foundElement, delete m.foundBackward, delete m.fromCtx, m.from = r, u && !u(r)) ? !1 : !!(r || t) : (r && n && (n.uncontrolled = zo.getTabsterContext(this._tabster, r)?.uncontrolled), !(!t || r));
		};
		if (i || (n.outOfDOMOrder = !0), i && z.nodeContains(r, i)) h.currentNode = i;
		else if (l) {
			let e = bo(r);
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
		if (!z.nodeContains(r, e) || No(e) || z.nodeContains(t.rejectElementsFrom, e)) return NodeFilter.FILTER_REJECT;
		let i = t.currentCtx = zo.getTabsterContext(this._tabster, e);
		if (!i) return NodeFilter.FILTER_SKIP;
		if (fo(e)) return this.isFocusable(e, void 0, !0, !0) && (t.skippedFocusable = !0), NodeFilter.FILTER_SKIP;
		if (!t.hasCustomCondition && (e.tagName === "IFRAME" || e.tagName === "WEBVIEW")) return this.isVisible(e) && i.modalizer?.userId === this._tabster.modalizer?.activeId ? (t.found = !0, t.rejectElementsFrom = t.foundElement = e, NodeFilter.FILTER_ACCEPT) : NodeFilter.FILTER_REJECT;
		if (!t.ignoreAccessibility && !this.isAccessible(e)) return this.isFocusable(e, !1, !0, !0) && (t.skippedFocusable = !0), NodeFilter.FILTER_REJECT;
		let a, o = t.fromCtx;
		o ||= t.fromCtx = zo.getTabsterContext(this._tabster, t.from);
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
			if (!t.isFindAll && So(e) && !e.checked) {
				let n = e.name, r = t.cachedRadioGroups[n];
				if (r || (r = Co(e), r && (t.cachedRadioGroups[n] = r)), r?.checked && r.checked !== e) return NodeFilter.FILTER_SKIP;
			}
			t.isBackward ? (t.foundBackward = e, a = NodeFilter.FILTER_SKIP) : (t.found = !0, t.foundElement = e);
		}
		return a;
	}
}, Vo = {
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
}, Ho = class {
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
function Uo(e, t) {
	let n = e.getParent, r = t;
	do {
		let t = va(e, r)?.uncontrolled;
		if (t && e.uncontrolled.isUncontrolledCompletely(r, !!t.completely)) return r;
		r = n(r);
	} while (r);
}
var B = {
	[fa.Restorer]: 0,
	[fa.Deloser]: 1,
	[fa.EscapeGroupper]: 2
}, Wo = class e extends Ho {
	static {
		this.isTabbing = !1;
	}
	constructor(t, n) {
		super(), this._init = () => {
			let e = this._win(), t = e.document;
			wo(t, Sa, this._onFocusIn, !0), wo(t, Ca, this._onFocusOut, !0), wo(e, "keydown", this._onKeyDown, !0);
			let n = z.getActiveElement(t);
			n && n !== t.body && this._setFocusedElement(n), this.subscribe(this._onChanged);
		}, this._onFocusIn = (e) => {
			let t = e.composedPath()[0];
			t && this._setFocusedElement(t, e.detail.relatedTarget, e.detail.isFocusedProgrammatically);
		}, this._onFocusOut = (e) => {
			this._setFocusedElement(void 0, e.detail?.originalEvent.relatedTarget);
		}, this._validateFocusedElement = (e) => {}, this._onKeyDown = (t) => {
			if (t.key !== Vo.Tab || t.ctrlKey) return;
			let n = this.getVal();
			if (!n || !n.ownerDocument || n.contentEditable === "true") return;
			let r = this._tabster, i = r.controlTab, a = zo.getTabsterContext(r, n);
			if (!a || a.ignoreKeydown(t)) return;
			let o = t.shiftKey, s = e.findNextTabbable(r, a, void 0, n, void 0, o, !0), c = a.root.getElement();
			if (!c) return;
			let l = s?.element, u = Uo(r, n);
			if (l) {
				let e = s.uncontrolled;
				if (a.uncontrolled || z.nodeContains(e, n)) {
					if (!s.outOfDOMOrder && e === a.uncontrolled || u && !z.nodeContains(u, l)) return;
					Ao.addPhantomDummyWithTarget(r, n, o, l);
					return;
				}
				if (e && r.focusable.isVisible(e) || l.tagName === "IFRAME" && r.focusable.isVisible(l)) {
					Eo(c, new Ja({
						by: "root",
						owner: c,
						next: l,
						relatedEvent: t
					})) && Ao.moveWithPhantomDummy(r, e ?? l, !1, o, t);
					return;
				}
				(i || s?.outOfDOMOrder) && Eo(c, new Ja({
					by: "root",
					owner: c,
					next: l,
					relatedEvent: t
				})) && (t.preventDefault(), t.stopImmediatePropagation(), Oa(l));
			} else !u && Eo(c, new Ja({
				by: "root",
				owner: c,
				next: null,
				relatedEvent: t
			})) && a.root.moveOutWithDefaultAction(o, t);
		}, this._onChanged = (e, t) => {
			if (e) Eo(e, new Ka(t));
			else {
				let e = this._lastVal?.get();
				if (e) {
					let n = { ...t }, r = zo.getTabsterContext(this._tabster, e)?.modalizer?.userId;
					r && (n.modalizerId = r), Eo(e, new qa(n));
				}
			}
		}, this._tabster = t, this._win = n, t.queueInit(this._init);
	}
	dispose() {
		super.dispose();
		let t = this._win(), n = t.document;
		To(n, Sa, this._onFocusIn, !0), To(n, Ca, this._onFocusOut, !0), To(t, "keydown", this._onKeyDown, !0), this.unsubscribe(this._onChanged);
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
		return (!e || e && !go(e.ownerDocument, e)) && (this._lastVal = e = void 0), e;
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
			let n = zo.getTabsterContext(this._tabster, r);
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
			t.tabIndex = -1, t.setAttribute("aria-hidden", "true"), e._lastResetElement = new io(t), this.focus(t, !0, !0), this._setOrRemoveAttribute(t, "tabindex", n), this._setOrRemoveAttribute(t, "aria-hidden", r);
		}
		return !0;
	}
	requestAsyncFocus(e, t, n) {
		let r = this._tabster.getWindow(), i = this._asyncFocus;
		if (i) {
			if (B[e] > B[i.source]) return;
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
			if (e._lastResetElement = void 0, n === t || fo(t)) return;
			i.isFocusedProgrammatically = r;
			let a = zo.getTabsterContext(this._tabster, t)?.modalizer?.userId;
			a && (i.modalizerId = a);
		}
		let a = this._nextVal = {
			element: t ? new io(t) : void 0,
			detail: i
		};
		t && t !== this._val && this._validateFocusedElement(t), this._nextVal === a && this.setVal(t, i), this._nextVal = void 0;
	}
	setVal(e, t) {
		super.setVal(e, t), e && (this._lastVal = new io(e));
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
					let c = zo.getTabsterContext(t, i, { referenceElement: a });
					if (c) {
						let i = n.getElement(), u = o ? i : i && bo(i) || i;
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
}, Go = class extends Ho {
	constructor(e) {
		super(), this._onChange = (e) => {
			this.setVal(e, void 0);
		}, this._keyborg = Na(e()), this._keyborg.subscribe(this._onChange);
	}
	dispose() {
		super.dispose(), this._keyborg && (this._keyborg.unsubscribe(this._onChange), Pa(this._keyborg), delete this._keyborg);
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
function Ko(e, t, n, r) {
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
		a ||= to(i).elementByUId, c(t, n);
		let r = ao(e, t, (e) => c(e, n));
		if (r) for (; r.nextNode(););
	}
	function c(e, r) {
		if (!e.getAttribute) return NodeFilter.FILTER_SKIP;
		let i = e.__tabsterElementUID;
		return i && a && (r ? delete a[i] : a[i] ??= new io(e)), (va(t, e) || e.hasAttribute("data-tabster")) && n(t, e, r), NodeFilter.FILTER_SKIP;
	}
	let l = z.createMutationObserver(o);
	return r && s(i().document.body), l.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: [la]
	}), () => {
		l.disconnect();
	};
}
//#endregion
//#region node_modules/tabster/dist/esm/Uncontrolled.js
var qo = class {
	constructor(e) {
		this._isUncontrolledCompletely = e;
	}
	isUncontrolledCompletely(e, t) {
		let n = this._isUncontrolledCompletely?.(e, t);
		return n === void 0 ? t : n;
	}
}, Jo = [
	"input",
	"textarea",
	"*[contenteditable]"
].join(", "), Yo = class extends Ao {
	constructor(e, t, n, r) {
		super(t, e, ko.Mover, r), this._onFocusDummyInput = (e) => {
			let t = this._element.get(), n = e.input;
			if (t && n) {
				let r = zo.getTabsterContext(this._tabster, t), i;
				r && (i = Wo.findNextTabbable(this._tabster, r, void 0, n, void 0, !e.isFirst, !0)?.element);
				let a = this._getMemorized()?.get();
				a && this._tabster.focusable.isFocusable(a) && (i = a), i && Oa(i);
			}
		}, this._tabster = t, this._getMemorized = n, this._setHandlers(this._onFocusDummyInput);
	}
}, Xo = 1, Zo = 2, Qo = 3, $o = class extends yo {
	constructor(e, t, n, r, i) {
		super(e, t, r), this._visible = {}, this._onIntersection = (e) => {
			for (let t of e) {
				let e = t.target, n = mo(this._win, e), r, i = this._fullyVisible;
				if (t.intersectionRatio >= .25 ? (r = t.intersectionRatio >= .75 ? pa.Visible : pa.PartiallyVisible, r === pa.Visible && (i = n)) : r = pa.Invisible, this._visible[n] !== r) {
					r === void 0 ? (delete this._visible[n], i === n && delete this._fullyVisible) : (this._visible[n] = r, this._fullyVisible = i);
					let t = this.getState(e);
					t && Eo(e, new Ya(t));
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
		e.controlTab || (this.dummyManager = new Yo(this._element, e, a, i));
	}
	dispose() {
		this._onDispose(this), this._intersectionObserver && (this._intersectionObserver.disconnect(), delete this._intersectionObserver), delete this._current, delete this._fullyVisible, delete this._allElements, delete this._updateQueue, this._unobserve && (this._unobserve(), delete this._unobserve);
		let e = this._win();
		this._setCurrentTimer && (e.clearTimeout(this._setCurrentTimer), delete this._setCurrentTimer), this._updateTimer && (e.clearTimeout(this._updateTimer), delete this._updateTimer), this.dummyManager?.dispose(), delete this.dummyManager;
	}
	setCurrent(e) {
		this._current = e ? new io(e) : void 0, (this._props.trackState || this._props.visibilityAware) && !this._setCurrentTimer && (this._setCurrentTimer = this._win().setTimeout(() => {
			delete this._setCurrentTimer;
			let e = [];
			this._current !== this._prevCurrent && (e.push(this._current), e.push(this._prevCurrent), this._prevCurrent = this._current);
			for (let t of e) {
				let e = t?.get();
				if (e && this._allElements?.get(e) === this) {
					let t = this._props;
					if (e && (t.visibilityAware !== void 0 || t.trackState)) {
						let t = this.getState(e);
						t && Eo(e, new Ya(t));
					}
				}
			}
		}));
	}
	getCurrent() {
		return this._current?.get() || null;
	}
	findNextTabbable(e, t, n, r) {
		let i = this.getElement(), a = i && No(e) === i;
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
		if (!Wo.isTabbing) return t.currentCtx?.excludedFromMover ? NodeFilter.FILTER_REJECT : void 0;
		let { memorizeCurrent: n, visibilityAware: r, hasDefault: i = !0 } = this._props, a = this.getElement();
		if (a && (n || r || i) && (!z.nodeContains(a, t.from) || No(t.from) === a)) {
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
					let n = mo(this._win, e), i = this._visible[n];
					return a !== e && !!this._allElements?.get(e) && t.acceptCondition(e) && (i === pa.Visible || i === pa.PartiallyVisible && (r === pa.PartiallyVisible || !this._fullyVisible));
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
					type: Zo
				});
				else {
					for (let e = 0; e < n.length; e++) i.push({
						element: n[e],
						type: Qo
					});
					for (let e = 0; e < r.length; e++) i.push({
						element: r[e],
						type: Xo
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
			let i = ao(t.document, e, (e) => {
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
					case Zo:
						s(e);
						break;
					case Xo:
						c(e);
						break;
					case Qo: l(e);
				}
				i = this._updateQueue = [];
			}, 0));
		}, d = (e) => {
			let t = {};
			for (let n = e; n; n = z.getParentElement(n)) {
				let e = va(this._tabster, n);
				if (e && (e.groupper && !t.groupper && (t.groupper = e.groupper), e.mover)) {
					t.mover = e.mover;
					break;
				}
			}
			return t;
		};
		i.push({
			element: e,
			type: Xo
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
		let t = mo(this._win, e);
		if (t in this._visible) {
			let n = this._visible[t] || pa.Invisible;
			return {
				isCurrent: this._current ? this._current.get() === e : void 0,
				visibility: n
			};
		}
	}
};
function es(e, t, n, r, i, a, o, s) {
	let c = n < i ? i - n : o < e ? e - o : 0, l = r < a ? a - r : s < t ? t - s : 0;
	return c === 0 ? l : l === 0 ? c : Math.sqrt(c * c + l * l);
}
var ts = class {
	constructor(e, t) {
		this._init = () => {
			let e = this._win();
			wo(e, "keydown", this._onKeyDown, !0), wo(e, za, this._onMoveFocus), wo(e, Ba, this._onMemorizedElement), this._tabster.focusedElement.subscribe(this._onFocus);
		}, this._onMoverDispose = (e) => {
			delete this._movers[e.id];
		}, this._onFocus = (e) => {
			let t = e, n = e;
			for (let r = z.getParentElement(e); r; r = z.getParentElement(r)) {
				let e = va(this._tabster, r)?.mover;
				e && (e.setCurrent(n), t = void 0), !t && this._tabster.focusable.isFocusable(r) && (t = n = r);
			}
		}, this._onKeyDown = async (e) => {
			if (this._ignoredInputTimer && (this._win().clearTimeout(this._ignoredInputTimer), delete this._ignoredInputTimer), this._ignoredInputResolve?.(!1), e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
			let t = e.key, n;
			if (t === Vo.ArrowDown ? n = ga.ArrowDown : t === Vo.ArrowRight ? n = ga.ArrowRight : t === Vo.ArrowUp ? n = ga.ArrowUp : t === Vo.ArrowLeft ? n = ga.ArrowLeft : t === Vo.PageDown ? n = ga.PageDown : t === Vo.PageUp ? n = ga.PageUp : t === Vo.Home ? n = ga.Home : t === Vo.End && (n = ga.End), !n) return;
			let r = this._tabster.focusedElement.getFocusedElement();
			r && !await this._isIgnoredInput(r, t) && this._moveFocus(r, n, e);
		}, this._onMoveFocus = (e) => {
			let t = e.composedPath()[0], n = e.detail?.key;
			t && n !== void 0 && !e.defaultPrevented && (this._moveFocus(t, n), e.stopImmediatePropagation());
		}, this._onMemorizedElement = (e) => {
			let t = e.composedPath()[0], n = e.detail?.memorizedElement;
			if (t) {
				let r = zo.getTabsterContext(this._tabster, t)?.mover;
				r && (n && !z.nodeContains(r.getElement(), n) && (n = void 0), r.setCurrent(n), e.stopImmediatePropagation());
			}
		}, this._tabster = e, this._win = t, this._movers = {}, e.queueInit(this._init);
	}
	dispose() {
		let e = this._win();
		this._tabster.focusedElement.unsubscribe(this._onFocus), this._ignoredInputResolve?.(!1), this._ignoredInputTimer && (e.clearTimeout(this._ignoredInputTimer), delete this._ignoredInputTimer), To(e, "keydown", this._onKeyDown, !0), To(e, za, this._onMoveFocus), To(e, Ba, this._onMemorizedElement), Object.keys(this._movers).forEach((e) => {
			this._movers[e] && (this._movers[e].dispose(), delete this._movers[e]);
		});
	}
	createMover(e, t, n) {
		let r = new $o(this._tabster, e, this._onMoverDispose, t, n);
		return this._movers[r.id] = r, r;
	}
	moveFocus(e, t) {
		return this._moveFocus(e, t);
	}
	_moveFocus(e, t, n) {
		let r = this._tabster, i = zo.getTabsterContext(r, e, { checkRtl: !0 });
		if (!i || !i.mover || i.excludedFromMover || n && i.ignoreKeydown(n)) return null;
		let a = i.mover, o = a.getElement();
		if (i.groupperBeforeMover) {
			let e = i.groupper;
			if (e && !e.isActive(!0)) {
				for (let t = z.getParentElement(e.getElement()); t && t !== o; t = z.getParentElement(t)) if (va(r, t)?.groupper?.isActive(!0)) return null;
			} else return null;
		}
		if (!o) return null;
		let s = r.focusable, c = a.getProps(), l = c.direction || ha.Both, u = l === ha.Both, d = u || l === ha.Vertical, f = u || l === ha.Horizontal, p = l === ha.GridLinear, m = p || l === ha.Grid, h = c.cyclic, g, _, v, y = 0, b = 0;
		if (m && (v = e.getBoundingClientRect(), y = Math.ceil(v.left), b = Math.floor(v.right)), i.rtl && (t === ga.ArrowRight ? t = ga.ArrowLeft : t === ga.ArrowLeft && (t = ga.ArrowRight)), t === ga.ArrowDown && d || t === ga.ArrowRight && (f || m)) {
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
		} else if (t === ga.ArrowUp && d || t === ga.ArrowLeft && (f || m)) {
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
		} else if (t === ga.Home) m ? s.findElement({
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
		else if (t === ga.End) m ? s.findElement({
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
		else if (t === ga.PageUp) {
			if (s.findElement({
				currentElement: e,
				container: o,
				useActiveModalizer: !0,
				isBackward: !0,
				acceptCondition: (e) => s.isFocusable(e) ? !so(this._win, e, a.visibilityTolerance) || (g = e, !1) : !1
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
		} else if (t === ga.PageDown) {
			if (s.findElement({
				currentElement: e,
				container: o,
				useActiveModalizer: !0,
				acceptCondition: (e) => s.isFocusable(e) ? !so(this._win, e, a.visibilityTolerance) || (g = e, !1) : !1
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
			let n = t === ga.ArrowUp, r = y, i = Math.ceil(v.top), a = b, c = Math.floor(v.bottom), l, u, d = 0;
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
						let t = es(r, i, a, c, o, s, f, p);
						(u === void 0 || t < u) && (u = t, l = e);
					} else if (d > 0) return !1;
					return !0;
				}
			}), g = l;
		}
		return g && (!n || n && Eo(o, new Ja({
			by: "mover",
			owner: o,
			next: g,
			relatedEvent: n
		}))) ? (_ !== void 0 && co(this._win, g, _), n && (n.preventDefault(), n.stopImmediatePropagation()), Oa(g), g) : null;
	}
	async _isIgnoredInput(e, t) {
		if (e.getAttribute("aria-expanded") === "true" && (e.hasAttribute("aria-activedescendant") || e.getAttribute("role") === "combobox")) return !0;
		if (_o(e, Jo)) {
			let n = 0, r = 0, i = 0, a;
			if (e.tagName === "INPUT" || e.tagName === "TEXTAREA") {
				let a = e.type;
				if (i = (e.value || "").length, a === "email" || a === "number") {
					if (i) {
						let n = z.getSelection(e);
						if (n) {
							let e = n.toString().length, r = t === Vo.ArrowLeft || t === Vo.ArrowUp;
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
			if (a && !await a || n !== r || n > 0 && (t === Vo.ArrowLeft || t === Vo.ArrowUp || t === Vo.Home) || n < i && (t === Vo.ArrowRight || t === Vo.ArrowDown || t === Vo.End)) return !0;
		}
		return !1;
	}
};
//#endregion
//#region node_modules/tabster/dist/esm/get/getMover.js
function ns(e) {
	let t = e.core;
	if (!t.mover) {
		let e = new ts(t, t.getWindow);
		t.mover = e, t.attrHandlers.set("mover", (t, n, r, i, a) => n ? (n.setProps(r), n) : e.createMover(t, r, a));
	}
	return t.mover;
}
//#endregion
//#region node_modules/tabster/dist/esm/Restorer.js
var rs = class extends yo {
	constructor(e, t, n) {
		if (super(e, t, n), this._hasFocus = !1, this._onFocusOut = (e) => {
			let t = this._element?.get();
			t && e.relatedTarget === null && Eo(t, new Xa()), t && !z.nodeContains(t, e.relatedTarget) && (this._hasFocus = !1);
		}, this._onFocusIn = () => {
			this._hasFocus = !0;
		}, this._props.type === ma.Source) {
			let e = this._element?.get();
			wo(e, "focusout", this._onFocusOut), wo(e, "focusin", this._onFocusIn), this._hasFocus = z.nodeContains(e, e && z.getActiveElement(e.ownerDocument));
		}
	}
	dispose() {
		if (this._props.type === ma.Source) {
			let e = this._element?.get();
			if (To(e, "focusout", this._onFocusOut), To(e, "focusin", this._onFocusIn), this._hasFocus) {
				let e = this._tabster.getWindow().document;
				Eo(e.body, new Xa());
			}
		}
	}
}, is = class e {
	static {
		this.DEPTH = 10;
	}
	constructor(e) {
		this._stack = [], this._getWindow = e;
	}
	push(t) {
		this._stack[this._stack.length - 1]?.get() !== t && (this._stack.length > e.DEPTH && this._stack.shift(), this._stack.push(new io(t)));
	}
	pop(e = () => !0) {
		let t = this._getWindow().document;
		for (let n = this._stack.length - 1; n >= 0; n--) {
			let n = this._stack.pop()?.get();
			if (n && z.nodeContains(t.body, z.getParentElement(n)) && e(n)) return n;
		}
	}
}, as = class {
	constructor(e) {
		this._onRestoreFocus = (e) => {
			this._focusedElementState.cancelAsyncFocus(fa.Restorer);
			let t = e.composedPath()[0];
			if (t) {
				let e = va(this._tabster, t)?.restorer?.getProps().id;
				this._focusedElementState.requestAsyncFocus(fa.Restorer, () => this._restoreFocus(t, e), 0);
			}
		}, this._onFocusIn = (e) => {
			e && va(this._tabster, e)?.restorer?.getProps().type === ma.Target && this._history.push(e);
		}, this._restoreFocus = (e, t) => {
			let n = this._getWindow().document;
			if (z.getActiveElement(n) !== n.body || !this._keyboardNavState.isNavigatingWithKeyboard() && z.nodeContains(n.body, e)) return;
			let r = (e) => {
				let t = va(this._tabster, e)?.restorer?.getProps();
				return t ? t.id : null;
			};
			this._history.pop((e) => t === r(e))?.focus();
		}, this._tabster = e, this._getWindow = e.getWindow, wo(this._getWindow(), Va, this._onRestoreFocus), this._history = new is(this._getWindow), this._keyboardNavState = e.keyboardNavigation, this._focusedElementState = e.focusedElement, this._focusedElementState.subscribe(this._onFocusIn);
	}
	dispose() {
		let e = this._getWindow();
		this._focusedElementState.unsubscribe(this._onFocusIn), this._focusedElementState.cancelAsyncFocus(fa.Restorer), To(e, Va, this._onRestoreFocus);
	}
	createRestorer(e, t) {
		let n = new rs(this._tabster, e, t);
		return t.type === ma.Target && z.getActiveElement(e.ownerDocument) === e && this._history.push(e), n;
	}
};
//#endregion
//#region node_modules/tabster/dist/esm/get/getRestorer.js
function os(e) {
	let t = e.core;
	if (!t.restorer) {
		let e = new as(t);
		t.restorer = e, t.attrHandlers.set("restorer", (t, n, r) => n ? (n.setProps(r), n) : e.createRestorer(t, r));
	}
	return t.restorer;
}
//#endregion
//#region node_modules/tabster/dist/esm/Tabster.js
var ss = class {
	constructor(e) {
		this.keyboardNavigation = e.keyboardNavigation, this.focusedElement = e.focusedElement, this.focusable = e.focusable, this.root = e.root, this.uncontrolled = e.uncontrolled, this.core = e;
	}
}, cs = class {
	constructor(e, t) {
		this._forgetMemorizedElements = [], this._wrappers = /* @__PURE__ */ new Set(), this._initQueue = [], this._version = "8.8.1", this._noop = !1, this.attrHandlers = /* @__PURE__ */ new Map(), this.getWindow = () => {
			if (!this._win) throw Error("Using disposed Tabster.");
			return this._win;
		}, this._storage = /* @__PURE__ */ new WeakMap(), this._win = e;
		let n = this.getWindow;
		t?.DOMAPI && $a({ ...t.DOMAPI }), this.keyboardNavigation = new Go(n), this.focusedElement = new Wo(this, n), this.focusable = new Bo(this), this.root = new zo(this, t?.autoRoot), this.uncontrolled = new qo(t?.checkUncontrolledCompletely || t?.checkUncontrolledTrappingFocus), this.controlTab = t?.controlTab ?? !0, this.rootDummyInputs = !!t?.rootDummyInputs, this._dummyObserver = new jo(n), this.getParent = t?.getParent ?? z.getParentNode, this.internal = {
			stopObserver: () => {
				this._unobserve && (this._unobserve(), delete this._unobserve);
			},
			resumeObserver: (e) => {
				if (!this._unobserve) {
					let t = n().document;
					this._unobserve = Ko(t, this, ya, e);
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
		let n = new ss(this);
		return e || this._wrappers.add(n), this._mergeProps(t), n;
	}
	disposeTabster(e, t) {
		t ? this._wrappers.clear() : this._wrappers.delete(e), this._wrappers.size === 0 && this.dispose();
	}
	dispose() {
		this.internal.stopObserver();
		let e = this._win;
		e?.clearTimeout(this._initTimer), delete this._initTimer, this._initQueue = [], this._forgetMemorizedElements = [], e && this._forgetMemorizedTimer && (e.clearTimeout(this._forgetMemorizedTimer), delete this._forgetMemorizedTimer), this.outline?.dispose(), this.crossOrigin?.dispose(), this.deloser?.dispose(), this.groupper?.dispose(), this.mover?.dispose(), this.modalizer?.dispose(), this.observedElement?.dispose(), this.restorer?.dispose(), this.keyboardNavigation.dispose(), this.focusable.dispose(), this.focusedElement.dispose(), this.root.dispose(), this._dummyObserver.dispose(), this.attrHandlers.clear(), ho(this.getWindow), this._storage = /* @__PURE__ */ new WeakMap(), this._wrappers.clear(), e && (no(e), delete e.__tabsterInstance, delete this._win);
	}
	storageEntry(e, t) {
		let n = this._storage, r = n.get(e);
		return r ? t === !1 && Object.keys(r).length === 0 && n.delete(e) : t === !0 && (r = {}, n.set(e, r)), r;
	}
	forceCleanup() {
		this._win && (this._forgetMemorizedElements.push(this._win.document.body), !this._forgetMemorizedTimer && (this._forgetMemorizedTimer = this._win.setTimeout(() => {
			delete this._forgetMemorizedTimer;
			for (let e = this._forgetMemorizedElements.shift(); e; e = this._forgetMemorizedElements.shift()) ho(this.getWindow, e), Wo.forgetMemorized(this.focusedElement, e);
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
function ls(e, t) {
	let n = ds(e);
	return n ? n.createTabster(!1, t) : (n = new cs(e, t), e.__tabsterInstance = n, n.createTabster());
}
function us(e, t) {
	e.core.disposeTabster(e, t);
}
function ds(e) {
	return e.__tabsterInstance;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useTabster.js
var fs = (e) => e;
function ps(e) {
	let t = e?.defaultView || void 0, n = t?.__tabsterShadowDOMAPI;
	if (t) return ls(t, {
		autoRoot: {},
		controlTab: !1,
		getParent: Yi,
		checkUncontrolledCompletely: (e) => e.firstElementChild?.hasAttribute("data-is-focus-trap-zone-bumper") === !0 || void 0,
		DOMAPI: n
	});
}
function ms(e = fs) {
	let { targetDocument: t } = $r(), n = N.useRef(null);
	return Ci(() => {
		let r = ps(t);
		if (r) return n.current = e(r), () => {
			us(r), n.current = null;
		};
	}, [t, e]), n;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useTabsterAttributes.js
var hs = (e) => {
	ms();
	let t = Po(e, !0);
	return N.useMemo(() => ({ [la]: t }), [t]);
}, gs = (e = {}) => {
	let { circular: t, axis: n, memorizeCurrent: r = !0, tabbable: i, ignoreDefaultKeydown: a, unstable_hasDefault: o } = e;
	return ms(ns), hs({
		mover: {
			cyclic: !!t,
			direction: _s(n ?? "vertical"),
			memorizeCurrent: r,
			tabbable: i,
			hasDefault: o
		},
		...a && { focusable: { ignoreKeydown: a } }
	});
};
function _s(e) {
	switch (e) {
		case "horizontal": return ha.Horizontal;
		case "grid": return ha.Grid;
		case "grid-linear": return ha.GridLinear;
		case "both": return ha.Both;
		default: return ha.Vertical;
	}
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusFinders.js
var vs = () => {
	let e = ms(), { targetDocument: t } = $r();
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
}, ys = (e, t, n) => {
	e.addEventListener(t, n, !0);
}, bs = (e, t, n) => {
	e.removeEventListener(t, n, !0);
}, xs = "keyborg:focusin", Ss = "keyborg:focusout", Cs = 0, ws = 1, Ts = 2, Es = 3;
function Ds(e) {
	let t = e.HTMLElement, n = t.prototype.focus, r = !1;
	return t.prototype.focus = function() {
		r = !0;
	}, e.document.createElement("button").focus(), t.prototype.focus = n, r;
}
var Os = !1;
function ks(e) {
	let t = e, n = t.document, r = t.HTMLElement.prototype;
	Os ||= Ds(t);
	let i = r.focus;
	if (i.__keyborgNativeFocus) return;
	r.focus = u;
	let a = /* @__PURE__ */ new Set(), o = (e) => {
		let t = e.target;
		if (!t) return;
		let n = new CustomEvent(Ss, {
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
			(!t || !r.has(t)) && (a.delete(e), t && (bs(t, "focusin", s), bs(t, "focusout", o)));
		}
		c(t, e.relatedTarget || void 0);
	}, c = (e, t, n) => {
		let r = e.shadowRoot;
		if (r) {
			for (let e of a) if (e.deref() === r) return;
			ys(r, "focusin", s), ys(r, "focusout", o), a.add(new WeakRef(r));
			return;
		}
		let i = {
			relatedTarget: t,
			originalEvent: n
		}, c = new CustomEvent(xs, {
			cancelable: !0,
			bubbles: !0,
			composed: !0,
			detail: i
		});
		c.details = i, (Os || l[Es]) && (i.isFocusedProgrammatically = e === l[Es]?.deref(), l[Es] = void 0), e.dispatchEvent(c);
	}, l = [
		s,
		o,
		a
	];
	t.__keyborgData = l, ys(n, "focusin", s), ys(n, "focusout", o);
	function u() {
		let e = t.__keyborgData;
		return e && (e[Es] = new WeakRef(this)), i.apply(this, arguments);
	}
	let d = n.activeElement;
	for (; d && d.shadowRoot;) c(d), d = d.shadowRoot.activeElement;
	u.__keyborgNativeFocus = i;
}
function As(e) {
	let t = e, n = t.HTMLElement.prototype, r = n.focus.__keyborgNativeFocus, i = t.__keyborgData;
	if (i) {
		let e = t.document;
		bs(e, "focusin", i[Cs]), bs(e, "focusout", i[ws]);
		for (let e of i[Ts]) {
			let t = e.deref();
			t && (bs(t, "focusin", i[Cs]), bs(t, "focusout", i[ws]));
		}
		i[Ts].clear(), delete t.__keyborgData;
	}
	r && (n.focus = r);
}
var js = 500, Ms = 0;
function Ns(e, t) {
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
		}, js);
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
	return ys(_, xs, p), ys(_, "mousedown", h), ys(e, "keydown", g), ys(_, "touchstart", m), ys(_, "touchend", m), ys(_, "touchcancel", m), ks(e), {
		dispose: () => {
			if (!n) return;
			i &&= (n.clearTimeout(i), void 0), a &&= (n.clearTimeout(a), void 0), As(n);
			let e = n.document;
			bs(e, xs, p), bs(e, "mousedown", h), bs(n, "keydown", g), bs(e, "touchstart", m), bs(e, "touchend", m), bs(e, "touchcancel", m), n = void 0;
		},
		get isNavigatingWithKeyboard() {
			return r;
		},
		set isNavigatingWithKeyboard(e) {
			l(e);
		}
	};
}
function Ps(e, t) {
	let n = e, r = "k" + ++Ms, i = n, a, o = [], s = n.__keyborg;
	a = s ? s.core : Ns(n, t);
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
function Fs(e) {
	e.dispose();
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/constants.js
var Is = "data-fui-focus-visible", Ls = "data-fui-focus-within";
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/focusVisiblePolyfill.js
function Rs(e, t) {
	if (zs(e)) return () => void 0;
	let n = { current: void 0 }, r = Ps(t);
	function i(e) {
		r.isNavigatingWithKeyboard() && Hi(e) && (n.current = e, e.setAttribute(Is, ""));
	}
	function a() {
		n.current &&= (n.current.removeAttribute(Is), void 0);
	}
	r.subscribe((e) => {
		e ? i(t.document.activeElement) : a();
	});
	let o = (e) => {
		a();
		let t = e.composedPath()[0];
		i(t);
	}, s = (t) => {
		(!t.relatedTarget || Hi(t.relatedTarget) && !e.contains(t.relatedTarget)) && a();
	};
	return e.addEventListener(xs, o), e.addEventListener("focusout", s), e.focusVisible = !0, e.contains(t.document.activeElement) && i(t.document.activeElement), () => {
		a(), e.removeEventListener(xs, o), e.removeEventListener("focusout", s), e.focusVisible = void 0, Fs(r);
	};
}
function zs(e) {
	return e ? e.focusVisible ? !0 : zs(e?.parentElement) : !1;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusVisible.js
function Bs(e = {}) {
	let t = $r(), n = N.useRef(null), r = e.targetDocument ?? t.targetDocument;
	return N.useEffect(() => {
		if (r?.defaultView && n.current) return Rs(n.current, r.defaultView);
	}, [n, r]), n;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/focusWithinPolyfill.js
function Vs(e, t) {
	let n = Ps(t);
	n.subscribe((t) => {
		t || Us(e);
	});
	let r = (t) => {
		n.isNavigatingWithKeyboard() && Ws(t.target) && Hs(e);
	}, i = (t) => {
		(!t.relatedTarget || Ws(t.relatedTarget) && !e.contains(t.relatedTarget)) && Us(e);
	};
	return e.addEventListener(xs, r), e.addEventListener("focusout", i), () => {
		e.removeEventListener(xs, r), e.removeEventListener("focusout", i), Fs(n);
	};
}
function Hs(e) {
	e.setAttribute(Ls, "");
}
function Us(e) {
	e.removeAttribute(Ls);
}
function Ws(e) {
	return e ? !!(e && typeof e == "object" && "classList" in e && "contains" in e) : !1;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusWithin.js
function Gs() {
	let { targetDocument: e } = $r(), t = N.useRef(null);
	return N.useEffect(() => {
		if (e?.defaultView && t.current) return Vs(t.current, e.defaultView);
	}, [t, e]), t;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useKeyborgRef.js
function Ks() {
	let { targetDocument: e } = $r(), t = N.useRef(null);
	return N.useEffect(() => {
		let n = e?.defaultView;
		if (n) {
			let e = Ps(n);
			return t.current = e, () => {
				Fs(e), t.current = null;
			};
		}
	}, [e]), t;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useOnKeyboardNavigationChange.js
function qs(e) {
	let t = Ks(), n = I(e);
	N.useEffect(() => {
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
var Js = (...e) => {
	let t = [], n = "";
	for (let r of e) {
		let e = r?.[la];
		e && (t.push(e), n += e + Ys);
	}
	return N.useMemo(() => ({ [la]: Xs(t) }), [n]);
}, Ys = "\0", Xs = (e) => {
	if (e.length !== 0) return e.length === 1 ? e[0] : JSON.stringify(Object.assign({}, ...e.map(Zs)));
}, Zs = (e) => {
	try {
		return JSON.parse(e);
	} catch {
		return {};
	}
};
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useRestoreFocus.js
function Qs() {
	return ms(os), Po({ restorer: { type: ma.Source } });
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useIsNavigatingWithKeyboard.js
function $s() {
	let e = Ks();
	return N.useCallback(() => e.current?.isNavigatingWithKeyboard() ?? !1, [e]);
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useSetKeyboardNavigation.js
function ec() {
	let e = Ks();
	return N.useCallback((t) => {
		var n;
		(n = e.current) == null || n.setVal(t);
	}, [e]);
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
}, tc = {
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
}, nc = {
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
}, rc = {
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
}, ic = {
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
}, ac = {
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
}, H = "#ffffff", oc = "#000000", sc = {
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
}, cc = {
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
}, lc = {
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
}, uc = {
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
}, dc = {
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
}, fc = {
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
}, pc = {
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
}, mc = {
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
}, hc = {
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
}, gc = {
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
}, _c = {
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
}, vc = {
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
}, yc = {
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
}, bc = {
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
}, xc = {
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
}, Sc = {
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
}, Cc = {
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
}, wc = {
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
}, Tc = {
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
}, Ec = {
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
}, Dc = {
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
}, Oc = {
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
}, kc = {
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
}, Ac = {
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
}, jc = {
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
}, Mc = {
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
}, Nc = {
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
}, Pc = {
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
}, Fc = {
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
}, Ic = {
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
}, Lc = {
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
}, Rc = {
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
}, zc = {
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
}, Bc = {
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
}, Vc = {
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
}, Hc = {
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
}, Uc = {
	red: lc,
	green: Sc,
	darkOrange: uc,
	yellow: hc,
	berry: Pc,
	lightGreen: xc,
	marigold: mc
}, Wc = {
	darkRed: sc,
	cranberry: cc,
	pumpkin: dc,
	peach: pc,
	gold: gc,
	brass: _c,
	brown: vc,
	forest: yc,
	seafoam: bc,
	darkGreen: Cc,
	lightTeal: wc,
	teal: Tc,
	steel: Ec,
	blue: Dc,
	royalBlue: Oc,
	cornflower: kc,
	navy: Ac,
	lavender: jc,
	purple: Mc,
	grape: Nc,
	lilac: Fc,
	pink: Ic,
	magenta: Lc,
	plum: Rc,
	beige: zc,
	mink: Bc,
	platinum: Vc,
	anchor: Hc
}, U = {
	cranberry: cc,
	green: Sc,
	orange: fc
}, Gc = [
	"red",
	"green",
	"darkOrange",
	"yellow",
	"berry",
	"lightGreen",
	"marigold"
], Kc = /* @__PURE__ */ "darkRed.cranberry.pumpkin.peach.gold.brass.brown.forest.seafoam.darkGreen.lightTeal.teal.steel.blue.royalBlue.cornflower.navy.lavender.purple.grape.lilac.pink.magenta.plum.beige.mink.platinum.anchor".split("."), qc = {
	success: "green",
	warning: "orange",
	danger: "cranberry"
}, Jc = Gc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background1`]: Uc[t].tint60,
		[`colorPalette${n}Background2`]: Uc[t].tint40,
		[`colorPalette${n}Background3`]: Uc[t].primary,
		[`colorPalette${n}Foreground1`]: Uc[t].shade10,
		[`colorPalette${n}Foreground2`]: Uc[t].shade30,
		[`colorPalette${n}Foreground3`]: Uc[t].primary,
		[`colorPalette${n}BorderActive`]: Uc[t].primary,
		[`colorPalette${n}Border1`]: Uc[t].tint40,
		[`colorPalette${n}Border2`]: Uc[t].primary
	};
	return Object.assign(e, r);
}, {});
Jc.colorPaletteYellowForeground1 = Uc.yellow.shade30, Jc.colorPaletteRedForegroundInverted = Uc.red.tint20, Jc.colorPaletteGreenForegroundInverted = Uc.green.tint20, Jc.colorPaletteYellowForegroundInverted = Uc.yellow.tint40;
var Yc = Kc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background2`]: Wc[t].tint40,
		[`colorPalette${n}Foreground2`]: Wc[t].shade30,
		[`colorPalette${n}BorderActive`]: Wc[t].primary
	};
	return Object.assign(e, r);
}, {}), Xc = {
	...Jc,
	...Yc
}, Zc = Object.entries(qc).reduce((e, [t, n]) => {
	let r = t.slice(0, 1).toUpperCase() + t.slice(1), i = {
		[`colorStatus${r}Background1`]: U[n].tint60,
		[`colorStatus${r}Background2`]: U[n].tint40,
		[`colorStatus${r}Background3`]: U[n].primary,
		[`colorStatus${r}Foreground1`]: U[n].shade10,
		[`colorStatus${r}Foreground2`]: U[n].shade30,
		[`colorStatus${r}Foreground3`]: U[n].primary,
		[`colorStatus${r}ForegroundInverted`]: U[n].tint30,
		[`colorStatus${r}BorderActive`]: U[n].primary,
		[`colorStatus${r}Border1`]: U[n].tint40,
		[`colorStatus${r}Border2`]: U[n].primary
	};
	return Object.assign(e, i);
}, {});
Zc.colorStatusDangerBackground3Hover = U[qc.danger].shade10, Zc.colorStatusDangerBackground3Pressed = U[qc.danger].shade20, Zc.colorStatusWarningForeground1 = U[qc.warning].shade20, Zc.colorStatusWarningForeground3 = U[qc.warning].shade20, Zc.colorStatusWarningBorder2 = U[qc.warning].shade20;
//#endregion
//#region node_modules/@fluentui/tokens/lib/alias/lightColor.js
var Qc = (e) => ({
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
	colorNeutralForegroundInvertedDisabled: tc[40],
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
	colorNeutralBackgroundAlpha: tc[50],
	colorNeutralBackgroundAlpha2: tc[80],
	colorSubtleBackground: "transparent",
	colorSubtleBackgroundHover: V[96],
	colorSubtleBackgroundPressed: V[88],
	colorSubtleBackgroundSelected: V[92],
	colorSubtleBackgroundLightAlphaHover: tc[70],
	colorSubtleBackgroundLightAlphaPressed: tc[50],
	colorSubtleBackgroundLightAlphaSelected: "transparent",
	colorSubtleBackgroundInverted: "transparent",
	colorSubtleBackgroundInvertedHover: nc[10],
	colorSubtleBackgroundInvertedPressed: nc[30],
	colorSubtleBackgroundInvertedSelected: nc[20],
	colorTransparentBackground: "transparent",
	colorTransparentBackgroundHover: "transparent",
	colorTransparentBackgroundPressed: "transparent",
	colorTransparentBackgroundSelected: "transparent",
	colorNeutralBackgroundDisabled: V[94],
	colorNeutralBackgroundDisabled2: H,
	colorNeutralBackgroundInvertedDisabled: tc[10],
	colorNeutralStencil1: V[90],
	colorNeutralStencil2: V[98],
	colorNeutralStencil1Alpha: nc[10],
	colorNeutralStencil2Alpha: nc[5],
	colorBackgroundOverlay: nc[40],
	colorScrollbarOverlay: nc[50],
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
	colorNeutralStrokeInvertedDisabled: tc[40],
	colorTransparentStroke: "transparent",
	colorTransparentStrokeInteractive: "transparent",
	colorTransparentStrokeDisabled: "transparent",
	colorNeutralStrokeAlpha: nc[5],
	colorNeutralStrokeAlpha2: tc[20],
	colorStrokeFocus1: H,
	colorStrokeFocus2: oc,
	colorNeutralShadowAmbient: "rgba(0,0,0,0.12)",
	colorNeutralShadowKey: "rgba(0,0,0,0.14)",
	colorNeutralShadowAmbientLighter: "rgba(0,0,0,0.06)",
	colorNeutralShadowKeyLighter: "rgba(0,0,0,0.07)",
	colorNeutralShadowAmbientDarker: "rgba(0,0,0,0.20)",
	colorNeutralShadowKeyDarker: "rgba(0,0,0,0.24)",
	colorBrandShadowAmbient: "rgba(0,0,0,0.30)",
	colorBrandShadowKey: "rgba(0,0,0,0.25)"
}), $c = {
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
}, el = {
	curveAccelerateMax: "cubic-bezier(0.9,0.1,1,0.2)",
	curveAccelerateMid: "cubic-bezier(1,0,1,1)",
	curveAccelerateMin: "cubic-bezier(0.8,0,0.78,1)",
	curveDecelerateMax: "cubic-bezier(0.1,0.9,0.2,1)",
	curveDecelerateMid: "cubic-bezier(0,0,0,1)",
	curveDecelerateMin: "cubic-bezier(0.33,0,0.1,1)",
	curveEasyEaseMax: "cubic-bezier(0.8,0,0.2,1)",
	curveEasyEase: "cubic-bezier(0.33,0,0.67,1)",
	curveLinear: "cubic-bezier(0,0,1,1)"
}, tl = {
	durationUltraFast: "50ms",
	durationFaster: "100ms",
	durationFast: "150ms",
	durationNormal: "200ms",
	durationGentle: "250ms",
	durationSlow: "300ms",
	durationSlower: "400ms",
	durationUltraSlow: "500ms"
}, nl = {
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
}, rl = {
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
}, il = {
	fontWeightRegular: 400,
	fontWeightMedium: 500,
	fontWeightSemibold: 600,
	fontWeightBold: 700
}, al = {
	fontFamilyBase: "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif",
	fontFamilyMonospace: "Consolas, 'Courier New', Courier, monospace",
	fontFamilyNumeric: "Bahnschrift, 'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif"
}, ol = {
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
}, sl = {
	spacingHorizontalNone: ol.none,
	spacingHorizontalXXS: ol.xxs,
	spacingHorizontalXS: ol.xs,
	spacingHorizontalSNudge: ol.sNudge,
	spacingHorizontalS: ol.s,
	spacingHorizontalMNudge: ol.mNudge,
	spacingHorizontalM: ol.m,
	spacingHorizontalL: ol.l,
	spacingHorizontalXL: ol.xl,
	spacingHorizontalXXL: ol.xxl,
	spacingHorizontalXXXL: ol.xxxl
}, cl = {
	spacingVerticalNone: ol.none,
	spacingVerticalXXS: ol.xxs,
	spacingVerticalXS: ol.xs,
	spacingVerticalSNudge: ol.sNudge,
	spacingVerticalS: ol.s,
	spacingVerticalMNudge: ol.mNudge,
	spacingVerticalM: ol.m,
	spacingVerticalL: ol.l,
	spacingVerticalXL: ol.xl,
	spacingVerticalXXL: ol.xxl,
	spacingVerticalXXXL: ol.xxxl
}, ll = {
	strokeWidthThin: "1px",
	strokeWidthThick: "2px",
	strokeWidthThicker: "3px",
	strokeWidthThickest: "4px"
}, W = {
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
function ul(e, t, n = "") {
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
var dl = (e) => {
	let t = Qc(e);
	return {
		...$c,
		...nl,
		...rl,
		...al,
		...il,
		...ll,
		...sl,
		...cl,
		...tl,
		...el,
		...t,
		...Xc,
		...Zc,
		...ul(t.colorNeutralShadowAmbient, t.colorNeutralShadowKey),
		...ul(t.colorBrandShadowAmbient, t.colorBrandShadowKey, "Brand")
	};
}, fl = {
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
}, pl = Gc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background1`]: Uc[t].shade40,
		[`colorPalette${n}Background2`]: Uc[t].shade30,
		[`colorPalette${n}Background3`]: Uc[t].primary,
		[`colorPalette${n}Foreground1`]: Uc[t].tint30,
		[`colorPalette${n}Foreground2`]: Uc[t].tint40,
		[`colorPalette${n}Foreground3`]: Uc[t].tint20,
		[`colorPalette${n}BorderActive`]: Uc[t].tint30,
		[`colorPalette${n}Border1`]: Uc[t].primary,
		[`colorPalette${n}Border2`]: Uc[t].tint20
	};
	return Object.assign(e, r);
}, {});
pl.colorPaletteRedForeground3 = Uc.red.tint30, pl.colorPaletteRedBorder2 = Uc.red.tint30, pl.colorPaletteGreenForeground3 = Uc.green.tint40, pl.colorPaletteGreenBorder2 = Uc.green.tint40, pl.colorPaletteDarkOrangeForeground3 = Uc.darkOrange.tint30, pl.colorPaletteDarkOrangeBorder2 = Uc.darkOrange.tint30, pl.colorPaletteRedForegroundInverted = Uc.red.primary, pl.colorPaletteGreenForegroundInverted = Uc.green.primary, pl.colorPaletteYellowForegroundInverted = Uc.yellow.shade30;
var ml = Kc.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background2`]: Wc[t].shade30,
		[`colorPalette${n}Foreground2`]: Wc[t].tint40,
		[`colorPalette${n}BorderActive`]: Wc[t].tint30
	};
	return Object.assign(e, r);
}, {});
ml.colorPaletteDarkRedBackground2 = Wc.darkRed.shade20, ml.colorPalettePlumBackground2 = Wc.plum.shade20;
var hl = {
	...pl,
	...ml
}, gl = Object.entries(qc).reduce((e, [t, n]) => {
	let r = t.slice(0, 1).toUpperCase() + t.slice(1), i = {
		[`colorStatus${r}Background1`]: U[n].shade40,
		[`colorStatus${r}Background2`]: U[n].shade30,
		[`colorStatus${r}Background3`]: U[n].primary,
		[`colorStatus${r}Foreground1`]: U[n].tint30,
		[`colorStatus${r}Foreground2`]: U[n].tint40,
		[`colorStatus${r}Foreground3`]: U[n].tint20,
		[`colorStatus${r}BorderActive`]: U[n].tint30,
		[`colorStatus${r}ForegroundInverted`]: U[n].shade10,
		[`colorStatus${r}Border1`]: U[n].primary,
		[`colorStatus${r}Border2`]: U[n].tint20
	};
	return Object.assign(e, i);
}, {});
gl.colorStatusDangerBackground3Hover = U[qc.danger].shade10, gl.colorStatusDangerBackground3Pressed = U[qc.danger].shade20, gl.colorStatusDangerForeground3 = U[qc.danger].tint40, gl.colorStatusDangerBorder2 = U[qc.danger].tint30, gl.colorStatusSuccessForeground3 = U[qc.success].tint40, gl.colorStatusSuccessBorder2 = U[qc.success].tint40, gl.colorStatusWarningForegroundInverted = U[qc.warning].shade20;
//#endregion
//#region node_modules/@fluentui/tokens/lib/themes/web/lightTheme.js
var _l = dl(fl), vl = (e) => ({
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
	colorNeutralForegroundInvertedDisabled: tc[40],
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
	colorNeutralBackground4Pressed: oc,
	colorNeutralBackground4Selected: V[10],
	colorNeutralBackground5: oc,
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
	colorNeutralBackgroundAlpha: rc[50],
	colorNeutralBackgroundAlpha2: ic[70],
	colorSubtleBackground: "transparent",
	colorSubtleBackgroundHover: V[22],
	colorSubtleBackgroundPressed: V[18],
	colorSubtleBackgroundSelected: V[20],
	colorSubtleBackgroundLightAlphaHover: ac[80],
	colorSubtleBackgroundLightAlphaPressed: ac[50],
	colorSubtleBackgroundLightAlphaSelected: "transparent",
	colorSubtleBackgroundInverted: "transparent",
	colorSubtleBackgroundInvertedHover: nc[10],
	colorSubtleBackgroundInvertedPressed: nc[30],
	colorSubtleBackgroundInvertedSelected: nc[20],
	colorTransparentBackground: "transparent",
	colorTransparentBackgroundHover: "transparent",
	colorTransparentBackgroundPressed: "transparent",
	colorTransparentBackgroundSelected: "transparent",
	colorNeutralBackgroundDisabled: V[8],
	colorNeutralBackgroundDisabled2: V[16],
	colorNeutralBackgroundInvertedDisabled: tc[10],
	colorNeutralStencil1: V[34],
	colorNeutralStencil2: V[20],
	colorNeutralStencil1Alpha: tc[10],
	colorNeutralStencil2Alpha: tc[5],
	colorBackgroundOverlay: nc[50],
	colorScrollbarOverlay: tc[60],
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
	colorNeutralStrokeInvertedDisabled: tc[40],
	colorTransparentStroke: "transparent",
	colorTransparentStrokeInteractive: "transparent",
	colorTransparentStrokeDisabled: "transparent",
	colorNeutralStrokeAlpha: tc[10],
	colorNeutralStrokeAlpha2: tc[20],
	colorStrokeFocus1: oc,
	colorStrokeFocus2: H,
	colorNeutralShadowAmbient: "rgba(0,0,0,0.24)",
	colorNeutralShadowKey: "rgba(0,0,0,0.28)",
	colorNeutralShadowAmbientLighter: "rgba(0,0,0,0.12)",
	colorNeutralShadowKeyLighter: "rgba(0,0,0,0.14)",
	colorNeutralShadowAmbientDarker: "rgba(0,0,0,0.40)",
	colorNeutralShadowKeyDarker: "rgba(0,0,0,0.48)",
	colorBrandShadowAmbient: "rgba(0,0,0,0.30)",
	colorBrandShadowKey: "rgba(0,0,0,0.25)"
}), yl = ((e) => {
	let t = vl(e);
	return {
		...$c,
		...nl,
		...rl,
		...al,
		...il,
		...ll,
		...sl,
		...cl,
		...tl,
		...el,
		...t,
		...hl,
		...gl,
		...ul(t.colorNeutralShadowAmbient, t.colorNeutralShadowKey),
		...ul(t.colorBrandShadowAmbient, t.colorBrandShadowKey, "Brand")
	};
})(fl), bl = { root: "fui-FluentProvider" }, xl = /*#__PURE__*/ In({ root: {
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
] }), Sl = (e) => {
	let t = Un(), n = xl({
		dir: e.dir,
		renderer: t
	});
	return e.root.className = k(bl.root, e.themeClassName, n.root, e.root.className), e;
}, Cl = N.useInsertionEffect ? N.useInsertionEffect : Ci, wl = (e, t) => {
	if (!e?.head) return;
	let n = e.createElement("style");
	return Object.keys(t).forEach((e) => {
		n.setAttribute(e, t[e]);
	}), e.head.appendChild(n), n;
}, Tl = (e, t) => {
	let n = e.sheet;
	n && (n.cssRules.length > 0 && n.deleteRule(0), n.insertRule(t, 0));
}, El = (e) => {
	let { targetDocument: t, theme: n, rendererAttributes: r } = e, i = N.useRef(void 0), a = Oi(bl.root), o = r, s = N.useMemo(() => Zn(`.${a}`, n), [n, a]);
	return Dl(t, a), Cl(() => {
		let e = t?.getElementById(a);
		return e ? i.current = e : (i.current = wl(t, {
			...o,
			id: a
		}), i.current && Tl(i.current, s)), () => {
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
function Dl(e, t) {
	N.useState(() => {
		if (!e) return;
		let n = e.getElementById(t);
		n && e.head.append(n);
	});
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/useFluentProvider.js
var Ol = {}, kl = {}, Al = (e, t) => {
	let n = $r(), r = Ml(), i = ni(), a = N.useContext(ri) || Ol, { applyStylesToPortals: o = !0, customStyleHooks_unstable: s, dir: c = n.dir, targetDocument: l = n.targetDocument, theme: u, overrides_unstable: d = {} } = e, f = jl(r, u), p = jl(i, d), m = jl(a, s), h = Un(), { styleTagId: g, rule: _ } = El({
		theme: f,
		targetDocument: l,
		rendererAttributes: h.styleElementAttributes ?? kl
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
		root: tr(Lr("div", {
			...e,
			dir: c,
			ref: ki(t, Bs({ targetDocument: l }))
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
function jl(e, t) {
	return e && t ? {
		...e,
		...t
	} : e || t;
}
function Ml() {
	return N.useContext(Br);
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/useFluentProviderContextValues.js
function Nl(e) {
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
var Pl = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Al(e, t);
	return Sl(n), ca(n, Nl(n));
});
Pl.displayName = "FluentProvider";
//#endregion
//#region node_modules/@fluentui/react-context-selector/lib/createContext.js
var Fl = p(), Il = (e) => (t) => {
	let n = N.useRef(t.value), r = N.useRef(null);
	return r.current ||= {
		value: n,
		listeners: []
	}, Ci(() => {
		n.current = t.value, (0, Fl.unstable_runWithPriority)(Fl.unstable_NormalPriority, () => {
			r.current.listeners.forEach((e) => {
				e(t.value);
			});
		});
	}, [t.value]), N.createElement(e, { value: r.current }, t.children);
}, Ll = (e) => {
	let t = N.createContext({
		value: { current: e },
		listeners: [],
		isDefault: !0
	});
	return t.Provider = Il(t.Provider), delete t.Consumer, t;
}, Rl = (e, t) => {
	let { value: n, listeners: r } = N.useContext(e), i = t(n.current), [, a] = N.useReducer((e) => e + 1, 0), o = N.useRef(t), s = N.useRef(i);
	return Ci(() => {
		o.current = t, s.current = i;
	}), Ci(() => {
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
function zl(e) {
	return !N.useContext(e).isDefault;
}
var Bl = "ArrowLeft", Vl = "ArrowRight";
//#endregion
//#region node_modules/@fluentui/react-aria/lib/button/useARIAButtonProps.js
function Hl(e, t) {
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
//#region node_modules/@fluentui/react-aria/lib/activedescendant/ActiveDescendantContext.js
var Ul = () => void 0, Wl = { controller: {
	active: Ul,
	blur: Ul,
	find: Ul,
	first: Ul,
	focus: Ul,
	focusLastActive: Ul,
	scrollActiveIntoView: Ul,
	last: Ul,
	next: Ul,
	prev: Ul,
	showAttributes: Ul,
	hideAttributes: Ul,
	showFocusVisibleAttributes: Ul,
	hideFocusVisibleAttributes: Ul
} }, Gl = N.createContext(void 0), Kl = Gl.Provider, ql = () => N.useContext(Gl) ?? Wl, Jl = () => !!N.useContext(Gl);
//#endregion
//#region node_modules/@fluentui/react-aria/lib/activedescendant/useOptionWalker.js
function Yl(e) {
	let { matchOption: t } = e, { targetDocument: n } = $r(), r = N.useRef(null), i = N.useRef(null), a = N.useCallback((e) => Hi(e) && t(e) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP, [t]), o = N.useCallback((e) => {
		e && n ? (i.current = e, r.current = n.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, a)) : (i.current = null, r.current = null);
	}, [n, a]);
	return {
		optionWalker: N.useMemo(() => ({
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
var Xl = "data-activedescendant", Zl = "data-activedescendant-focusvisible", Ql = (e) => {
	if (!e) return;
	let t = $l(e.parentElement);
	if (!t) return;
	let { offsetHeight: n } = e, r = eu(e, t), { scrollMarginTop: i, scrollMarginBottom: a } = tu(e), { offsetHeight: o, scrollTop: s } = t, c = r - i < s, l = r + n + a > s + o;
	c ? t.scrollTo(0, r - i - 2) : l && t.scrollTo(0, r + n + a - o + 2);
}, $l = (e) => e ? e.scrollHeight > e.offsetHeight ? e : $l(e.parentElement) : null, eu = (e, t) => !e || e === t ? 0 : e.contains(t) ? t.offsetTop * -1 : e.offsetTop + eu(e.offsetParent, t), tu = (e) => {
	let t = e.ownerDocument?.defaultView;
	if (!t) return {
		scrollMarginTop: 0,
		scrollMarginBottom: 0
	};
	let n = t.getComputedStyle(e);
	return {
		scrollMarginTop: nu(n.scrollMarginTop) ?? nu(n.scrollMarginBlockStart),
		scrollMarginBottom: nu(n.scrollMarginBottom) ?? nu(n.scrollMarginBlockEnd)
	};
}, nu = (e) => e ? parseInt(e, 10) : 0, ru = (e) => new CustomEvent("activedescendantchange", {
	bubbles: !0,
	cancelable: !1,
	composed: !0,
	detail: e
});
function iu(e) {
	let { imperativeRef: t, matchOption: n } = e, r = N.useRef(!1), i = N.useRef(!0), a = N.useRef(null), o = N.useRef(null), s = N.useRef(null), c = N.useRef(!0), l = N.useCallback(() => {
		var e;
		(e = s.current) == null || e.removeAttribute("aria-activedescendant");
	}, []), u = N.useCallback((e) => {
		if (e && (a.current = e), c.current && a.current) {
			var t;
			(t = s.current) == null || t.setAttribute("aria-activedescendant", a.current);
		}
	}, []);
	qs((e) => {
		r.current = e;
		let t = h();
		t && (e && i.current ? t.setAttribute(Zl, "") : t.removeAttribute(Zl));
	});
	let d = I(n), f = N.useRef(null), { optionWalker: p, listboxCallbackRef: m } = Yl({ matchOption: d }), h = N.useCallback(() => f.current?.querySelector(`#${a.current}`), [f]), g = N.useCallback((e) => {
		i.current = e;
		let t = h();
		t && (e && r.current ? t.setAttribute(Zl, "") : t.removeAttribute(Zl));
	}, [h]), _ = N.useCallback(() => {
		let e = h();
		return e && (e.removeAttribute(Xl), e.removeAttribute(Zl)), l(), o.current = a.current, a.current = null, e?.id ?? null;
	}, [h, l]), v = N.useCallback((e) => {
		if (!e) return;
		let t = _();
		Ql(e), u(e.id), e.setAttribute(Xl, ""), r.current && i.current && e.setAttribute(Zl, "");
		let n = ru({
			id: e.id,
			previousId: t
		});
		e.dispatchEvent(n);
	}, [_, u]), y = N.useMemo(() => ({
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
			e && Ql(e);
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
	return N.useImperativeHandle(t, () => y), {
		listboxRef: ki(f, m),
		activeParentRef: s,
		controller: y
	};
}
//#endregion
//#region node_modules/@fluentui/react-icons/lib/utils/useIconStyles.styles.js
var au = F({
	root: {
		mc9l5x: "f1w7gpdv",
		Bg96gwp: "fez10in"
	},
	rtl: { Bz10aip: "f13rod7r" }
}, { d: [
	".f1w7gpdv{display:inline;}",
	".fez10in{line-height:0;}",
	".f13rod7r{transform:scaleX(-1);}"
] }), ou = "fui-Icon", su = "fui-Icon-filled", cu = "fui-Icon-regular", lu = "data-fui-icon", uu = (e, t) => {
	let { filled: n, idPrefix: r, title: i, primaryFill: a = "currentColor", ...o } = e, s = {
		...o,
		fill: a
	}, c = sa(), l = !!(t?.flipInRtl && c?.textDirection === "rtl");
	return i && (s["aria-label"] = i), !s["aria-label"] && !s["aria-labelledby"] ? s["aria-hidden"] = !0 : s.role = "img", s[lu] = "", {
		state: s,
		isRtlFlip: l
	};
}, du = (e, t) => {
	let n = au(), { state: r, isRtlFlip: i } = uu(e, t);
	return r.className = k(n.root, i && n.rtl, r.className), r;
}, fu = F({ root: { B8gzw0y: "f1dd5bof" } }, { m: [["@media (forced-colors: active){.f1dd5bof{forced-color-adjust:auto;}}", { m: "(forced-colors: active)" }]] }), pu = "url(#", mu = (e, t, n) => {
	let [r, i, ...a] = e, o = i;
	if (n && i) {
		let e = {};
		for (let t in i) {
			let r = i[t];
			if (typeof r != "string") e[t] = r;
			else if (t === "id") e[t] = n + r;
			else {
				let i = r.indexOf(pu);
				e[t] = i < 0 ? r : r.slice(0, i + 5) + n + r.slice(i + 5);
			}
		}
		o = e;
	}
	return N.createElement(r, {
		...o,
		key: t
	}, ...a.map((e, t) => mu(e, t, n)));
}, hu = (e) => e === "1em" ? "20" : e, gu = (e, t, n) => typeof e != "string" && (t?.color || Array.isArray(e[0])) ? e.map((e, t) => mu(e, t, n)) : void 0, _u = () => void 0, vu = (e, t) => {
	let n = gu(e, t);
	return n ? function(r) {
		return N.useMemo(() => r ? gu(e, t, r) : n, [r]);
	} : _u;
}, yu = (e, t, n) => typeof t == "string" ? N.createElement("svg", {
	...e,
	dangerouslySetInnerHTML: { __html: t }
}) : n ? N.createElement("svg", e, ...n) : N.createElement("svg", e, ...t.map((t) => N.createElement("path", {
	d: t,
	fill: e.fill
}))), G = (e, t, n, r) => {
	let i = hu(t), a = vu(n, r), o = N.forwardRef((e, o) => {
		let s = fu(), c = du(e, { flipInRtl: r?.flipInRtl }), l = a(e.idPrefix);
		return yu({
			...c,
			className: k(ou, c.className, s.root),
			ref: o,
			width: t,
			height: t,
			viewBox: `0 0 ${i} ${i}`,
			xmlns: "http://www.w3.org/2000/svg"
		}, n, l);
	});
	return o.displayName = e, o;
}, bu = /*#__PURE__*/ G("WarningFilled", "1em", ["M7.37 3.56a3 3 0 0 1 5.26 0l5.5 10A3 3 0 0 1 15.5 18h-11a3 3 0 0 1-2.63-4.44zM10 12.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5m0-6.25a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0V7a.5.5 0 0 0-.5-.5"]), xu = /*#__PURE__*/ G("InfoFilled", "1em", ["M18 10a8 8 0 1 0-16 0 8 8 0 0 0 16 0M9.5 8.91a.5.5 0 0 1 1 0v4.69a.5.5 0 0 1-1 0V8.9m-.25-2.16a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0"]), Su = /*#__PURE__*/ G("CircleFilled", "1em", ["M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16"]), Cu = /*#__PURE__*/ G("CheckmarkFilled", "1em", ["M7.03 13.9 3.56 10a.75.75 0 0 0-1.12 1l4 4.5c.29.32.79.34 1.09.03l10.5-10.5a.75.75 0 0 0-1.06-1.06z"]), wu = /*#__PURE__*/ G("CheckmarkCircleFilled", "1em", ["M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16m3.36 5.65a.5.5 0 0 0-.64-.06l-.07.06L9 11.3 7.35 9.65l-.07-.06a.5.5 0 0 0-.7.7l.07.07 2 2 .07.06c.17.11.4.11.56 0l.07-.06 4-4 .07-.08a.5.5 0 0 0-.06-.63"]), Tu = /*#__PURE__*/ G("ChevronDownRegular", "1em", ["M15.85 7.65c.2.2.2.5 0 .7l-5.46 5.49a.55.55 0 0 1-.78 0L4.15 8.35a.5.5 0 1 1 .7-.7L10 12.8l5.15-5.16c.2-.2.5-.2.7 0"]), Eu = /*#__PURE__*/ G("ChevronLeftFilled", "1em", ["M12.27 15.8a.75.75 0 0 1-1.06-.03l-5-5.25a.75.75 0 0 1 0-1.04l5-5.25a.75.75 0 1 1 1.08 1.04L7.8 10l4.5 4.73c.29.3.28.78-.02 1.06"]), Du = /*#__PURE__*/ G("ChevronLeftRegular", "1em", ["M12.35 15.85a.5.5 0 0 1-.7 0L6.16 10.4a.55.55 0 0 1 0-.78l5.49-5.46a.5.5 0 1 1 .7.7L7.2 10l5.16 5.15c.2.2.2.5 0 .7"]), Ou = /*#__PURE__*/ G("ChevronRightFilled", "1em", ["M7.73 4.2a.75.75 0 0 1 1.06.03l5 5.25c.28.3.28.75 0 1.04l-5 5.25a.75.75 0 1 1-1.08-1.04L12.2 10l-4.5-4.73a.75.75 0 0 1 .02-1.06"]), ku = /*#__PURE__*/ G("ChevronRightRegular", "1em", ["M7.65 4.15c.2-.2.5-.2.7 0l5.49 5.46c.21.22.21.57 0 .78l-5.49 5.47a.5.5 0 0 1-.7-.71L12.8 10 7.65 4.85a.5.5 0 0 1 0-.7"]), Au = /*#__PURE__*/ G("DiamondDismissFilled", "1em", ["M7.88 1.88a3 3 0 0 1 4.24 0l6 6a3 3 0 0 1 0 4.24l-6 6a3 3 0 0 1-4.24 0l-6-6a3 3 0 0 1 0-4.24zM13.1 6.9a.5.5 0 0 0-.7 0L10 9.3 7.6 6.9a.5.5 0 0 0-.7.7L9.3 10l-2.4 2.4a.5.5 0 0 0 .7.7l2.4-2.4 2.4 2.4a.5.5 0 0 0 .7-.7L10.7 10l2.4-2.4a.5.5 0 0 0 0-.7"]), ju = /*#__PURE__*/ G("DismissRegular", "1em", ["m4.09 4.22.06-.07a.5.5 0 0 1 .63-.06l.07.06L10 9.29l5.15-5.14a.5.5 0 0 1 .63-.06l.07.06c.18.17.2.44.06.63l-.06.07L10.71 10l5.14 5.15c.18.17.2.44.06.63l-.06.07a.5.5 0 0 1-.63.06l-.07-.06L10 10.71l-5.15 5.14a.5.5 0 0 1-.63.06l-.07-.06a.5.5 0 0 1-.06-.63l.06-.07L9.29 10 4.15 4.85a.5.5 0 0 1-.06-.63l.06-.07z"]), Mu = /*#__PURE__*/ G("CalendarLtr20Regular", "20", ["M7 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2m4-5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5zM4 7h12v7.5c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5zm1.5-3h9c.83 0 1.5.67 1.5 1.5V6H4v-.5C4 4.67 4.67 4 5.5 4"]), Nu = /*#__PURE__*/ G("Search20Regular", "20", ["M13.73 14.44a6.5 6.5 0 1 1 .7-.7l3.42 3.4a.5.5 0 0 1-.63.77l-.07-.06zm-.71-.71A5.5 5.5 0 0 0 15 9.5a5.5 5.5 0 1 0-1.98 4.23"]), Pu = /*#__PURE__*/ G("MoreHorizontal20Regular", "20", ["M6.25 10a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0m5 0a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0M15 11.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5"]), Fu = /*#__PURE__*/ G("Settings20Regular", "20", ["M1.91 7.38A8.5 8.5 0 0 1 3.7 4.3a.5.5 0 0 1 .54-.13l1.92.68a1 1 0 0 0 1.32-.76l.36-2a.5.5 0 0 1 .4-.4 9 9 0 0 1 3.55 0q.32.08.38.4l.37 2a1 1 0 0 0 1.32.76l1.92-.68a.5.5 0 0 1 .54.13 8.5 8.5 0 0 1 1.78 3.08q.08.31-.15.54l-1.56 1.32a1 1 0 0 0 0 1.52l1.56 1.32a.5.5 0 0 1 .15.54 8.5 8.5 0 0 1-1.78 3.08.5.5 0 0 1-.54.13l-1.92-.68a1 1 0 0 0-1.32.76l-.37 2a.5.5 0 0 1-.38.4 8.5 8.5 0 0 1-3.56 0 .5.5 0 0 1-.39-.4l-.36-2a1 1 0 0 0-1.32-.76l-1.92.68a.5.5 0 0 1-.54-.13 8.5 8.5 0 0 1-1.78-3.08.5.5 0 0 1 .15-.54l1.56-1.32a1 1 0 0 0 0-1.52L2.06 7.92a.5.5 0 0 1-.15-.54m1.06 0 1.3 1.1a2 2 0 0 1 0 3.04l-1.3 1.1q.45 1.19 1.25 2.16l1.6-.58a2 2 0 0 1 2.63 1.53l.3 1.67a8 8 0 0 0 2.5 0l.3-1.67a2 2 0 0 1 2.64-1.53l1.6.58a8 8 0 0 0 1.24-2.16l-1.3-1.1a2 2 0 0 1 0-3.04l1.3-1.1a8 8 0 0 0-1.25-2.16l-1.6.58a2 2 0 0 1-2.63-1.53l-.3-1.67a8 8 0 0 0-2.5 0l-.3 1.67A2 2 0 0 1 5.81 5.8l-1.6-.58a8 8 0 0 0-1.24 2.16M7.5 10a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0m1 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"]), Iu = /*#__PURE__*/ G("Warning12Filled", "12", ["M4.28 1.97a2 2 0 0 1 3.43 0l3 5A2 2 0 0 1 9 10H3A2 2 0 0 1 1.3 6.98zM6 6.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5M6 3.5a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V4a.5.5 0 0 0-.5-.5"]), Lu = /*#__PURE__*/ G("Star16Filled", "16", ["M7.2 2.1a.9.9 0 0 1 1.6 0l1.53 3.08 3.4.5a.9.9 0 0 1 .5 1.53l-2.46 2.4.58 3.39a.9.9 0 0 1-1.3.95L8 12.35l-3.04 1.6a.9.9 0 0 1-1.3-.95l.57-3.39-2.46-2.4a.9.9 0 0 1 .5-1.53l3.4-.5z"]), Ru = /*#__PURE__*/ G("Star16Regular", "16", ["M7.2 2.1a.9.9 0 0 1 1.6 0l1.53 3.08 3.4.5a.9.9 0 0 1 .5 1.53l-2.46 2.4.58 3.39a.9.9 0 0 1-1.3.95L8 12.35l-3.04 1.6a.9.9 0 0 1-1.3-.95l.57-3.39-2.46-2.4a.9.9 0 0 1 .5-1.53l3.4-.5zm.8.63L6.55 5.67a.9.9 0 0 1-.68.5l-3.25.47 2.35 2.3c.21.2.3.5.26.79l-.56 3.24 2.91-1.53a.9.9 0 0 1 .84 0l2.9 1.53-.55-3.24a.9.9 0 0 1 .26-.8l2.36-2.3-3.26-.46a.9.9 0 0 1-.67-.5z"]), zu = /*#__PURE__*/ G("TaskListSquareLtr16Regular", "16", ["M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5zM4.5 3C3.67 3 3 3.67 3 4.5v7c0 .83.67 1.5 1.5 1.5h7c.83 0 1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm4 7.5c0-.28.22-.5.5-.5h2.25a.5.5 0 0 1 0 1H9a.5.5 0 0 1-.5-.5M9 6a.5.5 0 0 0 0 1h2.25a.5.5 0 0 0 0-1zM7.35 9.15c.2.2.2.5 0 .7l-1.5 1.5a.5.5 0 0 1-.7 0l-.75-.74a.5.5 0 1 1 .7-.71l.4.4 1.15-1.15c.2-.2.5-.2.7 0m0-3.3a.5.5 0 1 0-.7-.7L5.5 6.29l-.4-.4a.5.5 0 0 0-.7.72l.75.74c.2.2.5.2.7 0z"]), Bu = /*#__PURE__*/ G("TaskListSquareLtr24Regular", "24", ["M12.5 9.25c0-.41.34-.75.75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75m.75 4.75a.75.75 0 1 0 0 1.5h3.5a.75.75 0 1 0 0-1.5zm-2.47-5.22a.75.75 0 1 0-1.06-1.06L8.25 9.19l-.47-.47a.75.75 0 0 0-1.06 1.06l1 1c.3.3.77.3 1.06 0zm0 4.44c.3.3.3.77 0 1.06l-2 2c-.3.3-.77.3-1.06 0l-1-1a.75.75 0 1 1 1.06-1.06l.47.47 1.47-1.47c.3-.3.77-.3 1.06 0M6.25 3A3.25 3.25 0 0 0 3 6.25v11.5C3 19.55 4.46 21 6.25 21h11.5c1.8 0 3.25-1.46 3.25-3.25V6.25C21 4.45 19.54 3 17.75 3zM4.5 6.25c0-.97.78-1.75 1.75-1.75h11.5c.97 0 1.75.78 1.75 1.75v11.5c0 .97-.78 1.75-1.75 1.75H6.25c-.97 0-1.75-.78-1.75-1.75z"]), Vu = /*#__PURE__*/ G("Add20Regular", "20", ["M10 2.5c.28 0 .5.22.5.5v6.5H17a.5.5 0 0 1 0 1h-6.5V17a.5.5 0 0 1-1 0v-6.5H3a.5.5 0 0 1 0-1h6.5V3c0-.28.22-.5.5-.5"]), Hu = /*#__PURE__*/ G("Edit20Regular", "20", ["M17.18 2.93a2.97 2.97 0 0 0-4.26-.06l-9.37 9.38q-.5.5-.66 1.2l-.88 3.94a.5.5 0 0 0 .6.6l3.93-.87c.46-.1.9-.34 1.23-.68l9.36-9.36a2.97 2.97 0 0 0 .05-4.15m-3.55.65a1.97 1.97 0 1 1 2.8 2.8l-.68.66-2.8-2.79zm-1.38 1.38 2.8 2.8-7.99 7.97q-.31.31-.74.41l-3.16.7.7-3.18q.1-.41.4-.7z"]), Uu = /*#__PURE__*/ G("Flag16Filled", "16", ["M4 10h9a.5.5 0 0 0 .4-.8L11.12 6l2.3-3.2A.5.5 0 0 0 13 2H3.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 1 0z"]), Wu = /*#__PURE__*/ G("ArrowLeft24Regular", "24", ["M10.73 19.8a.75.75 0 0 0 1.04-1.1l-6.25-5.95h14.73a.75.75 0 0 0 0-1.5H5.52l6.25-5.95a.75.75 0 0 0-1.04-1.1l-7.42 7.08a1 1 0 0 0 0 1.44z"]), Gu = /*#__PURE__*/ G("Checkmark12Filled", "12", ["M9.76 3.2c.3.29.32.76.04 1.06l-4.25 4.5a.75.75 0 0 1-1.08.02L2.22 6.53a.75.75 0 0 1 1.06-1.06l1.7 1.7L8.7 3.24a.75.75 0 0 1 1.06-.04"]), Ku = /*#__PURE__*/ G("Checkmark16Filled", "16", ["M14.05 3.49c.28.3.27.77-.04 1.06l-7.93 7.47A.85.85 0 0 1 4.9 12L2.22 9.28a.75.75 0 1 1 1.06-1.06l2.24 2.27 7.47-7.04a.75.75 0 0 1 1.06.04"]), qu = /*#__PURE__*/ G("CheckmarkCircle12Filled", "12", ["M1 6a5 5 0 1 1 10 0A5 5 0 0 1 1 6m7.35-.9a.5.5 0 1 0-.7-.7L5.5 6.54 4.35 5.4a.5.5 0 1 0-.7.7l1.5 1.5c.2.2.5.2.7 0z"]), Ju = /*#__PURE__*/ G("ChevronLeft20Regular", "20", ["M12.35 15.85a.5.5 0 0 1-.7 0L6.16 10.4a.55.55 0 0 1 0-.78l5.49-5.46a.5.5 0 1 1 .7.7L7.2 10l5.16 5.15c.2.2.2.5 0 .7"]), Yu = /*#__PURE__*/ G("ChevronRight20Regular", "20", ["M7.65 4.15c.2-.2.5-.2.7 0l5.49 5.46c.21.22.21.57 0 .78l-5.49 5.47a.5.5 0 0 1-.7-.71L12.8 10 7.65 4.85a.5.5 0 0 1 0-.7"]), Xu = /*#__PURE__*/ G("Square12Filled", "12", ["M2 4c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"]), Zu = /*#__PURE__*/ G("Square16Filled", "16", ["M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5z"]), Qu = /*#__PURE__*/ G("Delete20Regular", "20", ["M8.5 4h3a1.5 1.5 0 0 0-3 0m-1 0a2.5 2.5 0 0 1 5 0h5a.5.5 0 0 1 0 1h-1.05l-1.2 10.34A3 3 0 0 1 12.27 18H7.73a3 3 0 0 1-2.98-2.66L3.55 5H2.5a.5.5 0 0 1 0-1zM5.74 15.23A2 2 0 0 0 7.73 17h4.54a2 2 0 0 0 1.99-1.77L15.44 5H4.56zM8.5 7.5c.28 0 .5.22.5.5v6a.5.5 0 0 1-1 0V8c0-.28.22-.5.5-.5M12 8a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"]), $u = /*#__PURE__*/ G("DiamondDismiss12Filled", "12", ["M4.59 1.09a2 2 0 0 1 2.82 0l3.5 3.5a2 2 0 0 1 0 2.82l-3.5 3.5a2 2 0 0 1-2.82 0l-3.5-3.5a2 2 0 0 1 0-2.83zm3.26 3.06a.5.5 0 0 0-.7 0L6 5.29 4.85 4.15a.5.5 0 0 0-.7.7L5.29 6 4.15 7.15a.5.5 0 0 0 .7.7L6 6.71l1.15 1.14a.5.5 0 1 0 .7-.7L6.71 6l1.14-1.15a.5.5 0 0 0 0-.7"]), ed = /*#__PURE__*/ G("Dismiss16Regular", "16", ["m2.59 2.72.06-.07a.5.5 0 0 1 .63-.06l.07.06L8 7.29l4.65-4.64a.5.5 0 0 1 .7.7L8.71 8l4.64 4.65c.18.17.2.44.06.63l-.06.07a.5.5 0 0 1-.63.06l-.07-.06L8 8.71l-4.65 4.64a.5.5 0 0 1-.7-.7L7.29 8 2.65 3.35a.5.5 0 0 1-.06-.63l.06-.07z"]), td = /*#__PURE__*/ G("Dismiss20Regular", "20", ["m4.09 4.22.06-.07a.5.5 0 0 1 .63-.06l.07.06L10 9.29l5.15-5.14a.5.5 0 0 1 .63-.06l.07.06c.18.17.2.44.06.63l-.06.07L10.71 10l5.14 5.15c.18.17.2.44.06.63l-.06.07a.5.5 0 0 1-.63.06l-.07-.06L10 10.71l-5.15 5.14a.5.5 0 0 1-.63.06l-.07-.06a.5.5 0 0 1-.06-.63l.06-.07L9.29 10 4.15 4.85a.5.5 0 0 1-.06-.63l.06-.07z"]), K = F({
	root: { mc9l5x: "fjseox" },
	visible: { mc9l5x: "f1w7gpdv" }
}, { d: [".fjseox{display:none;}", ".f1w7gpdv{display:inline;}"] }), q = (e, t) => {
	let n = (n) => {
		let { className: r, filled: i, ...a } = n, o = K();
		return N.createElement(N.Fragment, null, N.createElement(e, Object.assign({}, a, { className: k(o.root, i && o.visible, su, r) })), N.createElement(t, Object.assign({}, a, { className: k(o.root, !i && o.visible, cu, r) })));
	};
	return n.displayName = "CompoundIcon", n;
}, nd = {
	durationUltraFast: 50,
	durationFaster: 100,
	durationFast: 150,
	durationNormal: 200,
	durationGentle: 250,
	durationSlow: 300,
	durationSlower: 400,
	durationUltraSlow: 500
}, rd = {
	curveAccelerateMax: "cubic-bezier(0.9,0.1,1,0.2)",
	curveAccelerateMid: "cubic-bezier(1,0,1,1)",
	curveAccelerateMin: "cubic-bezier(0.8,0,0.78,1)",
	curveDecelerateMax: "cubic-bezier(0.1,0.9,0.2,1)",
	curveDecelerateMid: "cubic-bezier(0,0,0,1)",
	curveDecelerateMin: "cubic-bezier(0.33,0,0.1,1)",
	curveEasyEaseMax: "cubic-bezier(0.8,0,0.2,1)",
	curveEasyEase: "cubic-bezier(0.33,0,0.67,1)",
	curveLinear: "cubic-bezier(0,0,1,1)"
}, J = {
	...nd,
	...rd
};
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/isAnimationRunning.js
function id(e) {
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
var ad = { fill: "forwards" }, od = { duration: 1 };
function sd(e) {
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
			return e.some((e) => id(e));
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
function cd() {
	let e = typeof window < "u" && typeof window.Animation?.prototype.persist == "function";
	return N.useCallback((t, n, r) => {
		let i = Array.isArray(n) ? n : [n], { isReducedMotion: a } = r;
		return sd(i.map((n) => {
			let { keyframes: r, reducedMotion: i = od, ...o } = n, { keyframes: s = r, ...c } = i, l = a ? s : r, u = {
				...ad,
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
function ld() {
	return cd();
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useMotionImperativeRef.js
function ud(e) {
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
var dd = "screen and (prefers-reduced-motion: reduce)";
function fd() {
	let { targetDocument: e } = $r(), t = e?.defaultView ?? null, n = N.useRef(!1), r = N.useCallback(() => n.current, []);
	return Ci(() => {
		if (t === null || typeof t.matchMedia != "function") return;
		let e = t.matchMedia(dd);
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
var pd = [
	"@fluentui/react-motion: Invalid child element.",
	"\n",
	"Motion factories require a single child element to be passed. ",
	"That element element should support ref forwarding i.e. it should be either an intrinsic element (e.g. div) or a component that uses React.forwardRef()."
].join("");
function md(e, t = !0) {
	let n = N.useRef(null);
	N.useEffect(() => {}, [t]);
	try {
		let t = N.Children.only(e);
		if (N.isValidElement(t)) return [N.cloneElement(t, { ref: ki(n, Bi(t)) }), n];
	} catch {}
	throw Error(pd);
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/contexts/MotionBehaviourContext.js
var hd = N.createContext(void 0);
hd.Provider;
var gd = () => N.useContext(hd) ?? "default", _d = Symbol("MOTION_DEFINITION");
function vd(e) {
	return Object.assign((t) => {
		let { children: n, imperativeRef: r, onMotionFinish: i, onMotionStart: a, onMotionCancel: o, replayKey: s, ...c } = t, l = c, [u, d] = md(n), f = ud(r), p = N.useRef(!0), m = gd() === "skip", h = N.useRef({
			skipMotions: m,
			params: l
		}), g = ld(), _ = fd(), v = I(() => {
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
		return Ci(() => {
			h.current = {
				skipMotions: m,
				params: l
			};
		}), Ci(() => {
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
		]), Ci(() => {
			if (p.current) return;
			let e = f.current;
			e && (e.cancel(), e.play(), x(e));
		}, [s]), Ci(() => (p.current = !1, () => {
			p.current = !0;
		}), []), u;
	}, { [_d]: typeof e == "function" ? e : () => e });
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/contexts/PresenceGroupChildContext.js
var yd = N.createContext(void 0);
yd.Provider;
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useMountedState.js
function bd(e = !1, t = !1) {
	let n = N.useRef(!t || e), r = Ti(), i = N.useCallback((e) => {
		n.current !== e && (n.current = e, r());
	}, [r]);
	return N.useEffect(() => {
		e && (n.current = e);
	}), [e || n.current, i];
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/factories/createPresenceComponent.js
var xd = Symbol("PRESENCE_MOTION_DEFINITION"), Sd = Symbol.for("interruptablePresence");
function Cd(e) {
	return Object.assign((t) => {
		let n = {
			...N.useContext(yd),
			...t
		}, r = gd() === "skip", { appear: i, children: a, imperativeRef: o, onExit: s, onMotionFinish: c, onMotionStart: l, onMotionCancel: u, visible: d, unmountOnExit: f, ...p } = n, m = p, [h, g] = bd(d, f), [_, v] = md(a, h), y = ud(o), b = N.useRef({
			appear: i,
			params: m,
			skipMotions: r
		}), x = ld(), S = wi(), C = fd(), w = I((e) => {
			l?.(null, { direction: e });
		}), T = I((e) => {
			c?.(null, { direction: e }), e === "exit" && f && (g(!1), s?.());
		}), E = I((e) => {
			u?.(null, { direction: e });
		});
		return Ci(() => {
			b.current = {
				appear: i,
				params: m,
				skipMotions: r
			};
		}), Ci(() => {
			let t = v.current;
			if (!t) return;
			let n;
			function r() {
				n && (a && n.isRunning() || (n.cancel(), y.current = void 0));
			}
			let i = typeof e == "function" ? e({
				element: t,
				...b.current.params
			}) : e, a = i[Sd];
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
	}, { [xd]: typeof e == "function" ? e : () => e }, {
		In: vd(typeof e == "function" ? (...t) => e(...t).enter : e.enter),
		Out: vd(typeof e == "function" ? (...t) => e(...t).exit : e.exit)
	});
}
//#endregion
//#region node_modules/@swc/helpers/esm/_define_property.js
function wd(e, t, n) {
	return t in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/groups/mergeChildMappings.js
function Td(e, t) {
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
function Ed(e, t) {
	let n = Td(e, t);
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
function Dd(e) {
	let t = {};
	return e && N.Children.toArray(e).forEach((e) => {
		N.isValidElement(e) && (t[e.key ?? ""] = {
			appear: !1,
			element: e,
			visible: !0,
			unmountOnExit: !0
		});
	}), t;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/components/PresenceGroupItemProvider.js
var Od = (e) => {
	let { appear: t, childKey: n, onExit: r, visible: i, unmountOnExit: a } = e, o = N.useMemo(() => ({
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
	return /*#__PURE__*/ N.createElement(yd.Provider, { value: o }, e.children);
}, kd = class extends N.Component {
	static getDerivedStateFromProps(e, { childMapping: t, firstRender: n }) {
		let r = Dd(e.children);
		return {
			childMapping: n ? r : Ed(t, r),
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
		return /*#__PURE__*/ N.createElement(N.Fragment, null, Object.entries(this.state.childMapping).map(([e, t]) => /*#__PURE__*/ N.createElement(Od, {
			...t,
			childKey: e,
			key: e,
			onExit: this.handleExit
		}, t.element)));
	}
	constructor(e, t) {
		super(e, t), wd(this, "mounted", !1), wd(this, "handleExit", (e) => {
			e in Dd(this.props.children) || this.mounted && this.setState((t) => {
				let n = { ...t.childMapping };
				return delete n[e], { childMapping: n };
			});
		}), this.state = {
			childMapping: {},
			firstRender: !0
		};
	}
}, Ad = /*#__PURE__*/ N.createContext(void 0);
function jd() {
	return N.useContext(Ad);
}
var Md = /*#__PURE__*/ N.forwardRef((e, t) => /*#__PURE__*/ N.createElement(Ad.Provider, { value: t }, e.children));
Md.displayName = "MotionRefForwarder";
//#endregion
//#region node_modules/@fluentui/react-motion/lib/slots/motionSlot.js
function Nd(e, t) {
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
function Pd(e, t) {
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
var Fd = ({ direction: e, duration: t, easing: n = J.curveLinear, delay: r = 0, outOpacity: i = 0, inOpacity: a = 1 }) => {
	let o = [{ opacity: i }, { opacity: a }];
	return e === "exit" && o.reverse(), {
		keyframes: o,
		duration: t,
		easing: n,
		delay: r,
		fill: "both"
	};
}, Id = ({ direction: e, duration: t, easing: n = J.curveLinear, delay: r = 0, outX: i = "0px", outY: a = "0px", inX: o = "0px", inY: s = "0px" }) => {
	let c = [{ translate: `${i} ${a}` }, { translate: `${o} ${s}` }];
	return e === "exit" && c.reverse(), {
		keyframes: c,
		duration: t,
		easing: n,
		delay: r
	};
}, Ld = (e, t) => {
	let { shape: n = "circular", size: r = "medium", appearance: i = "filled", color: a = "brand", ...o } = e;
	return {
		...Rd(o, t),
		shape: n,
		size: r,
		appearance: i,
		color: a
	};
}, Rd = (e, t) => {
	let { iconPosition: n = "before" } = e;
	return {
		iconPosition: n,
		components: {
			root: "div",
			icon: "span"
		},
		root: tr(Lr("div", {
			ref: t,
			...e
		}), { elementType: "div" }),
		icon: nr(e.icon, { elementType: "span" })
	};
}, zd = {
	root: "fui-Badge",
	icon: "fui-Badge__icon"
};
W.spacingHorizontalXXS;
var Bd = /*#__PURE__*/ Jn("r1iycov", "r115jdol", [
	".r1iycov{display:inline-flex;box-sizing:border-box;align-items:center;justify-content:center;position:relative;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightSemibold);line-height:var(--lineHeightBase200);height:20px;min-width:20px;padding:0 calc(var(--spacingHorizontalXS) + var(--spacingHorizontalXXS));border-radius:var(--borderRadiusCircular);border-color:var(--colorTransparentStroke);}",
	".r1iycov::after{content:\"\";position:absolute;top:0;left:0;bottom:0;right:0;border-style:solid;border-color:inherit;border-width:var(--strokeWidthThin);border-radius:inherit;}",
	".r115jdol{display:inline-flex;box-sizing:border-box;align-items:center;justify-content:center;position:relative;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightSemibold);line-height:var(--lineHeightBase200);height:20px;min-width:20px;padding:0 calc(var(--spacingHorizontalXS) + var(--spacingHorizontalXXS));border-radius:var(--borderRadiusCircular);border-color:var(--colorTransparentStroke);}",
	".r115jdol::after{content:\"\";position:absolute;top:0;right:0;bottom:0;left:0;border-style:solid;border-color:inherit;border-width:var(--strokeWidthThin);border-radius:inherit;}"
]), Vd = /*#__PURE__*/ F({
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
] }), Hd = /*#__PURE__*/ Jn("rttl5z0", null, [".rttl5z0{display:flex;line-height:1;margin:0 calc(-1 * var(--spacingHorizontalXXS));font-size:12px;}"]), Ud = /*#__PURE__*/ F({
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
] }), Wd = (e) => {
	let t = Bd(), n = Vd(), r = e.size === "small" || e.size === "extra-small" || e.size === "tiny";
	e.root.className = k(zd.root, t, r && n.fontSmallToTiny, n[e.size], n[e.shape], e.shape === "rounded" && r && n.roundedSmallToTiny, e.appearance === "ghost" && n.borderGhost, n[e.appearance], n[`${e.appearance}-${e.color}`], e.root.className);
	let i = Hd(), a = Ud();
	if (e.icon) {
		let t;
		N.Children.toArray(e.root.children).length > 0 && (t = e.size === "extra-large" ? e.iconPosition === "after" ? a.afterTextXL : a.beforeTextXL : e.iconPosition === "after" ? a.afterText : a.beforeText), e.icon.className = k(zd.icon, i, t, a[e.size], e.icon.className);
	}
	return e;
}, Gd = (e) => /*#__PURE__*/ ia(e.root, { children: [
	e.iconPosition === "before" && e.icon && /*#__PURE__*/ L(e.icon, {}),
	e.root.children,
	e.iconPosition === "after" && e.icon && /*#__PURE__*/ L(e.icon, {})
] }), Kd = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Ld(e, t);
	return Wd(n), oi("useBadgeStyles_unstable")(n), Gd(n);
});
Kd.displayName = "Badge";
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/createVirtualElementFromClick.js
function qd(e) {
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
var Jd = "data-popper-is-intersecting", Yd = "data-popper-escaped", Xd = "data-popper-reference-hidden", Zd = "data-popper-placement", Qd = "fui-positioningend", $d = "--fui-positioning-slide-direction-x", ef = "--fui-positioning-slide-direction-y";
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningSlideDirection.js
function tf(e) {
	let t = e.split("-")[0], n = 0, r = 1;
	return t === "right" ? (n = -1, r = 0) : t === "bottom" ? (n = 0, r = -1) : t === "left" && (n = 1, r = 0), {
		x: n,
		y: r
	};
}
function nf(e) {
	let { targetDocument: t, onPositioningEnd: n } = e, r = I((e) => {
		n?.(e);
		let t = e.target, r = e.detail.placement;
		if (!Hi(t)) return;
		let { x: i, y: a } = tf(r);
		t.style.setProperty($d, `${i}px`), t.style.setProperty(ef, `${a}px`);
	});
	return N.useEffect(() => {
		var e;
		let n = (t == null || (e = t.defaultView) == null ? void 0 : e.CSS?.registerProperty) ?? (() => {});
		try {
			n({
				name: $d,
				syntax: "<length>",
				inherits: !1,
				initialValue: "0px"
			}), n({
				name: ef,
				syntax: "<length>",
				inherits: !1,
				initialValue: "0px"
			});
		} catch {}
	}, [t]), r;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/PositioningConfigurationContext.js
var rf = ({ options: e }) => e, af = N.createContext(void 0);
af.Provider;
var of = () => N.useContext(af) ?? rf, sf = [
	"top",
	"right",
	"bottom",
	"left"
], cf = Math.min, lf = Math.max, uf = Math.round, df = (e) => ({
	x: e,
	y: e
}), ff = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function pf(e, t, n) {
	return lf(e, cf(t, n));
}
function mf(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function hf(e) {
	return e.split("-")[0];
}
function Y(e) {
	return e.split("-")[1];
}
function gf(e) {
	return e === "x" ? "y" : "x";
}
function _f(e) {
	return e === "y" ? "height" : "width";
}
function vf(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function yf(e) {
	return gf(vf(e));
}
function bf(e, t, n) {
	n === void 0 && (n = !1);
	let r = Y(e), i = yf(e), a = _f(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = kf(o)), [o, kf(o)];
}
function xf(e) {
	let t = kf(e);
	return [
		Sf(e),
		t,
		Sf(t)
	];
}
function Sf(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var Cf = ["left", "right"], wf = ["right", "left"], Tf = ["top", "bottom"], Ef = ["bottom", "top"];
function Df(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? wf : Cf : t ? Cf : wf;
		case "left":
		case "right": return t ? Tf : Ef;
		default: return [];
	}
}
function Of(e, t, n, r) {
	let i = Y(e), a = Df(hf(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(Sf)))), a;
}
function kf(e) {
	let t = hf(e);
	return ff[t] + e.slice(t.length);
}
function Af(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function jf(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : Af(e);
}
function Mf(e) {
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
function Nf(e, t, n) {
	let { reference: r, floating: i } = e, a = vf(t), o = yf(t), s = _f(o), c = hf(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	let m = Y(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function Pf(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = mf(t, e), p = jf(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = Mf(await i.getClippingRect({
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
	}, y = Mf(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var Ff = 50, If = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: Pf
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = Nf(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < Ff && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = Nf(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Lf = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = mf(e, t) || {};
		if (l == null) return {};
		let d = jf(u), f = {
			x: n,
			y: r
		}, p = yf(i), m = _f(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = cf(d[_], T), D = cf(d[v], T), ee = C - h[m] - D, O = C / 2 - h[m] / 2 + w, te = pf(E, O, ee), ne = !c.arrow && Y(i) != null && O !== te && a.reference[m] / 2 - (O < E ? E : D) - h[m] / 2 < 0, re = ne ? O < E ? O - E : O - ee : 0;
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
}), Rf = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = mf(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = hf(r), _ = vf(o), v = hf(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [kf(o)] : xf(o)), x = p !== "none";
			!d && x && b.push(...Of(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = bf(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === vf(t) || T.every((e) => vf(e.placement) !== _ || e.overflows[0] > 0))) return {
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
								let t = vf(e.placement);
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
function zf(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function Bf(e) {
	return sf.some((t) => e[t] >= 0);
}
var Vf = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = mf(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = zf(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: Bf(e)
					} };
				}
				case "escaped": {
					let e = zf(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: Bf(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Hf = /*#__PURE__*/ new Set(["left", "top"]);
async function Uf(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = hf(n), s = Y(n), c = vf(n) === "y", l = Hf.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = mf(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var X = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Uf(t, e);
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
}, Wf = function(e) {
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
			} }, ...l } = mf(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = vf(i), p = gf(f), m = u[p], h = u[f], g = (e, t) => pf(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
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
}, Gf = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = mf(e, t), u = {
				x: n,
				y: r
			}, d = vf(i), f = gf(d), p = u[f], m = u[d], h = mf(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = Hf.has(hf(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Kf = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = mf(e, t), c = await i.detectOverflow(t, s), l = hf(n), u = Y(n), d = vf(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = cf(p - c[m], g), y = cf(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * lf(c.left, c.right) : S = p - 2 * lf(c.top, c.bottom)), await o({
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
function qf() {
	return typeof window < "u";
}
function Jf(e) {
	return Zf(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Yf(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Xf(e) {
	return ((Zf(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Zf(e) {
	return qf() ? e instanceof Node || e instanceof Yf(e).Node : !1;
}
function Qf(e) {
	return qf() ? e instanceof Element || e instanceof Yf(e).Element : !1;
}
function $f(e) {
	return qf() ? e instanceof HTMLElement || e instanceof Yf(e).HTMLElement : !1;
}
function ep(e) {
	return !qf() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Yf(e).ShadowRoot;
}
function tp(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = fp(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function np(e) {
	return /^(table|td|th)$/.test(Jf(e));
}
function rp(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var ip = /transform|translate|scale|rotate|perspective|filter/, ap = /paint|layout|strict|content/, op = (e) => !!e && e !== "none", sp;
function cp(e) {
	let t = Qf(e) ? fp(e) : e;
	return op(t.transform) || op(t.translate) || op(t.scale) || op(t.rotate) || op(t.perspective) || !up() && (op(t.backdropFilter) || op(t.filter)) || ip.test(t.willChange || "") || ap.test(t.contain || "");
}
function lp(e) {
	let t = mp(e);
	for (; $f(t) && !dp(t);) {
		if (cp(t)) return t;
		if (rp(t)) return null;
		t = mp(t);
	}
	return null;
}
function up() {
	return sp ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), sp;
}
function dp(e) {
	return /^(html|body|#document)$/.test(Jf(e));
}
function fp(e) {
	return Yf(e).getComputedStyle(e);
}
function pp(e) {
	return Qf(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function mp(e) {
	if (Jf(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || ep(e) && e.host || Xf(e);
	return ep(t) ? t.host : t;
}
function hp(e) {
	let t = mp(e);
	return dp(t) ? (e.ownerDocument || e).body : $f(t) && tp(t) ? t : hp(t);
}
function gp(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = hp(e), i = r === e.ownerDocument?.body, a = Yf(r);
	if (i) {
		let e = _p(a);
		return t.concat(a, a.visualViewport || [], tp(r) ? r : [], e && n ? gp(e) : []);
	}
	return t.concat(r, gp(r, [], n));
}
function _p(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function vp(e) {
	let t = fp(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = $f(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = uf(n) !== a || uf(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function yp(e) {
	return Qf(e) ? e : e.contextElement;
}
function bp(e) {
	let t = yp(e);
	if (!$f(t)) return df(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = vp(t), o = (a ? uf(n.width) : n.width) / r, s = (a ? uf(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var xp = /*#__PURE__*/ df(0);
function Sp(e) {
	let t = Yf(e);
	return !up() || !t.visualViewport ? xp : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Cp(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === Yf(e);
}
function wp(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = yp(e), o = df(1);
	t && (r ? Qf(r) && (o = bp(r)) : o = bp(e));
	let s = Cp(a, n, r) ? Sp(a) : df(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = Yf(a), t = Qf(r) ? Yf(r) : r, n = e, i = _p(n);
		for (; i && t !== n;) {
			let e = bp(i), t = i.getBoundingClientRect(), r = fp(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Yf(i), i = _p(n);
		}
	}
	return Mf({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function Tp(e, t) {
	let n = pp(e).scrollLeft;
	return t ? t.left + n : wp(Xf(e)).left + n;
}
function Ep(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - Tp(e, n),
		y: n.top + t.scrollTop
	};
}
function Dp(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Xf(r), s = t ? rp(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = df(1), u = df(0), d = $f(r);
	if ((d || !a) && ((Jf(r) !== "body" || tp(o)) && (c = pp(r)), d)) {
		let e = wp(r);
		l = bp(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Ep(o, c) : df(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function Op(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function kp(e) {
	let t = pp(e), n = e.ownerDocument.body, r = lf(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = lf(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + Tp(e), o = -t.scrollTop;
	return fp(n).direction === "rtl" && (a += lf(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var Ap = 25;
function jp(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = Yf(e), a = Xf(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !up() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (Tp(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= Ap && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function Mp(e, t) {
	let n = wp(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = bp(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function Np(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = jp(e, n, t);
	else if (t === "document") r = kp(Xf(e));
	else if (Qf(t)) r = Mp(t, n);
	else {
		let n = Sp(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return Mf(r);
}
function Pp(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = gp(e, [], !1).filter((e) => Qf(e) && Jf(e) !== "body"), i = null, a = fp(e).position === "fixed", o = a ? mp(e) : e;
	for (; Qf(o) && !dp(o);) {
		let e = fp(o), t = cp(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = mp(o);
	}
	return t.set(e, r), r;
}
function Fp(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? rp(t) ? [] : Pp(t, this._c) : [].concat(n), r], o = Np(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = Np(t, a[e], i);
		s = lf(n.top, s), c = cf(n.right, c), l = cf(n.bottom, l), u = lf(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Ip(e) {
	let { width: t, height: n } = vp(e);
	return {
		width: t,
		height: n
	};
}
function Lp(e, t, n) {
	let r = $f(t), i = Xf(t), a = n === "fixed", o = wp(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = df(0);
	if ((r || !a) && ((Jf(t) !== "body" || tp(i)) && (s = pp(t)), r)) {
		let e = wp(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = Tp(i));
	let l = i && !r && !a ? Ep(i, s) : df(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function Rp(e) {
	return fp(e).position === "static";
}
function zp(e, t) {
	if (!$f(e) || fp(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Xf(e) === n && (n = n.ownerDocument.body), n;
}
function Bp(e, t) {
	let n = Yf(e);
	if (rp(e)) return n;
	if (!$f(e)) {
		let t = mp(e);
		for (; t && !dp(t);) {
			if (Qf(t) && !Rp(t)) return t;
			t = mp(t);
		}
		return n;
	}
	let r = zp(e, t);
	for (; r && np(r) && Rp(r);) r = zp(r, t);
	return r && dp(r) && Rp(r) && !cp(r) ? n : r || lp(e) || n;
}
var Vp = async function(e) {
	let t = this.getOffsetParent || Bp, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: Lp(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function Hp(e) {
	return fp(e).direction === "rtl";
}
var Up = {
	convertOffsetParentRelativeRectToViewportRelativeRect: Dp,
	getDocumentElement: Xf,
	getClippingRect: Fp,
	getOffsetParent: Bp,
	getElementRects: Vp,
	getClientRects: Op,
	getDimensions: Ip,
	getScale: bp,
	isElement: Qf,
	isRTL: Hp
}, Wp = Pf, Gp = X, Kp = Wf, qp = Rf, Jp = Kf, Yp = Vf, Xp = Lf, Zp = Gf, Qp = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...Up,
		...i.platform,
		_c: r
	};
	return If(e, t, {
		...i,
		platform: a
	});
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/parseFloatingUIPlacement.js
function $p(e) {
	let t = e.split("-");
	return {
		side: t[0],
		alignment: t[1]
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/getScrollParent.js
var em = (e) => e.nodeName === "HTML" ? e : e.parentNode || e.host, tm = (e) => {
	if (e.nodeType !== 1) return {};
	let t = e.ownerDocument?.defaultView;
	return t ? t.getComputedStyle(e, null) : {};
}, nm = (e) => {
	let t = e && em(e);
	if (!t) return document.body;
	switch (t.nodeName) {
		case "HTML":
		case "BODY": return t.ownerDocument.body;
		case "#document": return t.body;
	}
	let { overflow: n, overflowX: r, overflowY: i } = tm(t);
	return /(auto|scroll|overlay)/.test(n + i + r) ? t : nm(t);
}, rm = (e) => {
	let t = nm(e);
	return t ? t !== t.ownerDocument?.body : !1;
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/getBoundary.js
function im(e, t) {
	if (t === "window") return e?.ownerDocument.documentElement;
	if (t === "clippingParents") return "clippingAncestors";
	if (t === "scrollParent") {
		let t = nm(e);
		return t.nodeName === "BODY" && (t = e?.ownerDocument.documentElement), t;
	}
	return t;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/mergeArrowOffset.js
function am(e, t) {
	return typeof e == "number" || typeof e == "object" && e ? om(e, t) : typeof e == "function" ? (n) => om(e(n), t) : { mainAxis: t };
}
var om = (e, t) => typeof e == "number" ? { mainAxis: e + t } : {
	...e,
	mainAxis: (e.mainAxis ?? 0) + t
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/toFloatingUIPadding.js
function sm(e, t) {
	if (typeof e == "number") return e;
	let { start: n, end: r, ...i } = e, a = i, o = t ? "end" : "start", s = t ? "start" : "end";
	return e[o] && (a.left = e[o]), e[s] && (a.right = e[s]), a;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/toFloatingUIPlacement.js
var cm = (e) => ({
	above: "top",
	below: "bottom",
	before: e ? "right" : "left",
	after: e ? "left" : "right"
}), lm = () => ({
	start: "start",
	end: "end",
	top: "start",
	bottom: "end",
	center: void 0
}), um = (e, t) => {
	let n = e === "above" || e === "below", r = t === "top" || t === "bottom";
	return n && r || !n && !r;
}, dm = (e, t, n) => {
	let r = um(t, e) ? "center" : e, i = t && cm(n)[t], a = r && lm()[r];
	return i && a ? `${i}-${a}` : i;
}, fm = () => ({
	top: "above",
	bottom: "below",
	right: "after",
	left: "before"
}), pm = (e) => e === "above" || e === "below" ? {
	start: "start",
	end: "end"
} : {
	start: "top",
	end: "bottom"
}, mm = (e) => {
	let { side: t, alignment: n } = $p(e), r = fm()[t];
	return {
		position: r,
		alignment: n && pm(r)[n]
	};
}, hm = {
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
function gm(e) {
	return e == null ? {} : typeof e == "string" ? hm[e] : e;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/useCallbackRef.js
function _m(e, t, n) {
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
	return Ci(() => {
		r.current = !1;
	}, []), i.callback = t, i.facade;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/debounce.js
function vm(e) {
	let t;
	return () => (t ||= new Promise((n) => {
		Promise.resolve().then(() => {
			t = void 0, n(e());
		});
	}), t);
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/writeArrowUpdates.js
function ym(e) {
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
function bm(e) {
	let { container: t, placement: n, middlewareData: r, strategy: i, lowPPI: a, coordinates: o, useTransform: s = !0 } = e;
	if (!t) return;
	t.setAttribute(Zd, n), t.removeAttribute(Jd), r.intersectionObserver.intersecting && t.setAttribute(Jd, ""), t.removeAttribute(Yd), r.hide?.escaped && t.setAttribute(Yd, ""), t.removeAttribute(Xd), r.hide?.referenceHidden && t.setAttribute(Xd, "");
	let c = t.ownerDocument.defaultView?.devicePixelRatio || 1, l = Math.round(o.x * c) / c, u = Math.round(o.y * c) / c;
	Object.assign(t.style, { position: i }), s ? Object.assign(t.style, { transform: a ? `translate(${l}px, ${u}px)` : `translate3d(${l}px, ${u}px, 0)` }) : Object.assign(t.style, {
		left: `${l}px`,
		top: `${u}px`
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/utils/normalizeAutoSize.js
var xm = (e) => {
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
function Sm(e) {
	let t = [], n = e;
	for (; n;) {
		let r = nm(n);
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
function Cm(e, t) {
	return new e.ResizeObserver(t);
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/createPositionManager.js
function wm(e) {
	let { clientWidth: t, clientHeight: n } = e.ownerDocument.documentElement;
	return t === 0 && n === 0;
}
function Tm(e) {
	let t = !1, { container: n, target: r, arrow: i, strategy: a, middleware: o, placement: s, useTransform: c = !0, disableUpdateOnResize: l = !1 } = e, u = n.ownerDocument.defaultView;
	if (!r || !n || !u) return {
		updatePosition: () => void 0,
		dispose: () => void 0
	};
	let d = l ? null : Cm(u, (e) => {
		e.every((e) => e.contentRect.width > 0 && e.contentRect.height > 0) && h();
	}), f = !0, p = /* @__PURE__ */ new Set();
	Object.assign(n.style, {
		position: "fixed",
		left: 0,
		top: 0,
		margin: 0
	});
	let m = () => {
		t || (f &&= (Sm(n).forEach((e) => p.add(e)), Hi(r) && Sm(r).forEach((e) => p.add(e)), p.forEach((e) => {
			e.addEventListener("scroll", h, { passive: !0 });
		}), d?.observe(n), Hi(r) && d?.observe(r), !1), Object.assign(n.style, { position: a }), Qp(r, n, {
			placement: s,
			middleware: o,
			strategy: a
		}).then(({ x: e, y: r, middlewareData: o, placement: s }) => {
			if (t) return;
			let l = wm(n) ? {
				...o,
				hide: {
					...o.hide,
					escaped: !1,
					referenceHidden: !1
				}
			} : o;
			ym({
				arrow: i,
				middlewareData: l
			}), bm({
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
			}), n.dispatchEvent(new CustomEvent(Qd, { detail: {
				placement: s,
				escaped: l.hide?.escaped ?? !1,
				referenceHidden: l.hide?.referenceHidden ?? !1
			} }));
		}).catch((e) => {}));
	}, h = vm(() => m());
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
function Em() {
	return {
		name: "coverTarget",
		fn: (e) => {
			let { placement: t, rects: n, x: r, y: i } = e, a = $p(t).side, o = {
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
function Dm(e) {
	let { hasScrollableElement: t, flipBoundary: n, container: r, fallbackPositions: i = [], isRtl: a } = e, o = i.reduce((e, t) => {
		let { position: n, align: r } = gm(t), i = dm(r, n, a);
		return i && e.push(i), e;
	}, []);
	return qp({
		...t && { boundary: "clippingAncestors" },
		...n && {
			altBoundary: !0,
			boundary: im(r, n)
		},
		fallbackStrategy: "bestFit",
		...o.length && { fallbackPlacements: o }
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/intersecting.js
function Om() {
	return {
		name: "intersectionObserver",
		fn: async (e) => {
			let t = e.rects.floating, n = await Wp(e, { altBoundary: !0 }), r = n.top < t.height && n.top > 0, i = n.bottom < t.height && n.bottom > 0;
			return { data: { intersecting: r || i } };
		}
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/maxSize.js
var km = (e) => ({
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
function Am(e, t) {
	let { container: n, overflowBoundary: r, overflowBoundaryPadding: i, isRtl: a } = t;
	return Jp({
		...i && { padding: sm(i, a) },
		...r && {
			altBoundary: !0,
			boundary: im(n, r)
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
function jm(e) {
	return !e || typeof e == "number" || typeof e == "object" ? e : ({ rects: { floating: t, reference: n }, placement: r }) => {
		let { position: i, alignment: a } = mm(r);
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
function Mm(e) {
	return Gp(jm(e));
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/shift.js
function Nm(e) {
	let { hasScrollableElement: t, shiftToCoverTarget: n, disableTether: r, overflowBoundary: i, container: a, overflowBoundaryPadding: o, isRtl: s } = e;
	return Kp({
		...t && { boundary: "clippingAncestors" },
		...n && {
			crossAxis: !0,
			limiter: Zp({
				crossAxis: !0,
				mainAxis: !1
			})
		},
		...r && {
			crossAxis: r === "all",
			limiter: Zp({
				crossAxis: r !== "all",
				mainAxis: !1
			})
		},
		...o && { padding: sm(o, s) },
		...i && {
			altBoundary: !0,
			boundary: im(a, i)
		}
	});
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/middleware/matchTargetSize.js
var Pm = "--fui-match-target-size";
function Fm() {
	return {
		name: "matchTargetSize",
		fn: async (e) => {
			let { rects: { reference: t, floating: n }, elements: { floating: r }, middlewareData: { matchTargetSize: { matchTargetSizeAttempt: i = !1 } = {} } } = e;
			if (t.width === n.width || i) return {};
			let { width: a } = t;
			return r.style.setProperty(Pm, `${a}px`), r.style.width || (r.style.width = `var(${Pm})`), {
				data: { matchTargetSizeAttempt: !0 },
				reset: { rects: !0 }
			};
		}
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningOptions.js
function Im(e, t) {
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
function Lm(e) {
	let { dir: t, targetDocument: n } = $r(), r = t === "rtl", i = Im(of(), e), { positionFixed: a } = e;
	return N.useCallback((e, t) => {
		let n = rm(e), { autoSize: o, disableUpdateOnResize: s, matchTargetSize: c, offset: l, coverTarget: u, flipBoundary: d, overflowBoundary: f, useTransform: p, overflowBoundaryPadding: m, pinned: h, position: g, arrowPadding: _, strategy: v, align: y, fallbackPositions: b, shiftToCoverTarget: x, unstable_disableTether: S } = i(e, t), C = xm(o), w = [
			C && km(C),
			c && Fm(),
			l && Mm(l),
			u && Em(),
			!h && Dm({
				container: e,
				flipBoundary: d,
				hasScrollableElement: n,
				isRtl: r,
				fallbackPositions: b
			}),
			Nm({
				container: e,
				hasScrollableElement: n,
				overflowBoundary: f,
				disableTether: S,
				overflowBoundaryPadding: m,
				isRtl: r,
				shiftToCoverTarget: x
			}),
			C && Am(C, {
				container: e,
				overflowBoundary: f,
				overflowBoundaryPadding: m,
				isRtl: r
			}),
			Om(),
			t && Xp({
				element: t,
				padding: _
			}),
			Yp({ strategy: "referenceHidden" }),
			Yp({ strategy: "escaped" }),
			!1
		].filter(Boolean);
		return {
			placement: dm(y, g, r),
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
function Rm(e) {
	let t = N.useRef(null), n = N.useRef(null), r = N.useRef(null), i = N.useRef(null), a = N.useRef(null), { enabled: o = !0 } = e, s = Lm(e), c = N.useCallback(() => {
		t.current && t.current.dispose(), t.current = null;
		let e = r.current ?? n.current;
		o && vi() && e && i.current && (t.current = Tm({
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
	}), [e.target, l]), Ci(() => {
		l(e.target ?? null);
	}, [e.target, l]), Ci(() => {
		c();
	}, [c]);
	let u = _m(null, (e) => {
		n.current !== e && (n.current = e, c());
	}), d = I((t) => e.onPositioningEnd?.call(e, t));
	return {
		targetRef: u,
		containerRef: _m(null, (e) => {
			if (i.current !== e) {
				var t;
				(t = i.current) == null || t.removeEventListener("fui-positioningend", d), e?.addEventListener("fui-positioningend", d), i.current = e, c();
			}
		}),
		arrowRef: _m(null, (e) => {
			a.current !== e && (a.current = e, c());
		})
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/usePositioningMouseTarget.js
var zm = (e) => {
	let [t, n] = N.useState(e);
	return [t, (e) => {
		if (e == null) {
			n(void 0);
			return;
		}
		let t;
		t = e instanceof MouseEvent ? e : e.nativeEvent, t instanceof MouseEvent;
		let r = qd(t);
		n(r);
	}];
};
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/createSafeZoneAreaStateStore.js
function Bm() {
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
var Vm = /* @__PURE__ */ s(((e) => {
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
})), Hm = /* @__PURE__ */ s(((e, t) => {
	t.exports = Vm();
}));
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getRectCorners.js
function Um(e, t) {
	return {
		topLeft: [e.left - t[0], e.top - t[1]],
		topRight: [e.right - t[0], e.top - t[1]],
		bottomRight: [e.right - t[0], e.bottom - t[1]],
		bottomLeft: [e.left - t[0], e.bottom - t[1]]
	};
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getMouseAnchor.js
var Wm = 20;
function Gm(e, t) {
	return Math.sqrt((e[0] - t[0]) ** 2 + (e[1] - t[1]) ** 2);
}
function Km(e, t) {
	let n = Gm(e, t);
	return n === 0 ? [0, 0] : [(e[0] - t[0]) / n, (e[1] - t[1]) / n];
}
function qm(e, t, n) {
	let r = [(e[0] + t[0]) / 2, (e[1] + t[1]) / 2], i = Km([n[0], n[1]], [r[0], r[1]]), a = Gm([r[0], r[1]], [n[0], n[1]]);
	return [r[0] + i[0] * (a + Wm), r[1] + i[1] * (a + Wm)];
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/pointsToSvgPath.js
function Jm(e) {
	return `M ${e} z`;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/SafeZoneArea.styles.js
var Ym = /*#__PURE__*/ F({
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
function Xm(e) {
	if (e.width <= 0 || e.height <= 0) return "";
	let t = "";
	return t += `M ${e.x},${e.y} `, t += `V ${e.y + e.height} `, t += `H ${e.x + e.width} `, t += `V ${e.y} `, t += `H ${e.x} `, t += "Z ", t;
}
function Zm(e, t, n) {
	let r = `M 0,0 H ${e} V ${t} H 0 Z `;
	return r += Xm(n), r;
}
//#endregion
//#region node_modules/@fluentui/react-positioning/lib/hooks/useSafeZoneArea/getSafeZonePoints.js
function Qm(e, t) {
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
var $m = Hm(), eh = /*#__PURE__*/ N.memo((e) => {
	let { debug: t, onMouseEnter: n, onMouseMove: r, onMouseLeave: i, stateStore: a } = e, o = Oi(), s = Ym(), c = (0, $m.useSyncExternalStore)(a.subscribe, a.isActive), l = N.useRef(null), u = N.useRef(null), d = N.useRef(null), f = N.useRef(null);
	return N.useImperativeHandle(e.imperativeRef, () => ({ updateSVG({ containerRect: e, targetRect: t, mouseCoordinates: n }) {
		var r, i, a;
		let o = Math.min(t.top, e.top), s = Math.min(t.left, e.left), c = Math.max(t.bottom, e.bottom), p = Math.max(t.right, e.right), m = Um(e, [s, o]), h = Um(t, [s, o]), g = [n[0] - s, n[1] - o], _ = qm(m.topLeft, m.bottomRight, g), v = p - s, y = c - o, b = Zm(v, y, {
			x: h.topLeft[0],
			y: h.topLeft[1],
			width: t.width,
			height: t.height
		});
		l.current && (l.current.style.width = `${v}px`, l.current.style.height = `${y}px`, l.current.style.transform = `translate(${s}px, ${o}px)`);
		let x = Qm(_, m);
		(r = u.current) == null || r.setAttribute("d", x.length > 0 ? Jm(x) : ""), (i = d.current) == null || i.setAttribute("d", b), (a = f.current) == null || a.setAttribute("d", b);
	} }), []), /*#__PURE__*/ N.createElement("div", {
		className: k(s.wrapper, c && s.wrapperActive),
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
		className: k(s.safeZone, t && s.safeZoneDebug),
		clipPath: `url(#${o})`,
		onMouseEnter: n,
		onMouseMove: r,
		onMouseLeave: i
	}, /*#__PURE__*/ N.createElement("path", { ref: u })), /*#__PURE__*/ N.createElement("clipPath", { id: o }, /*#__PURE__*/ N.createElement("path", { ref: d })), t && /*#__PURE__*/ N.createElement("path", {
		ref: f,
		className: s.rectDebug
	})));
}), th = 2e3;
function nh({ debug: e = !1, disabled: t = !1, onSafeZoneEnter: n, onSafeZoneMove: r, onSafeZoneLeave: i, onSafeZoneTimeout: a, timeout: o = 1500 } = {}) {
	let [s] = N.useState(Bm), c = N.useRef(null), l = N.useRef(null), u = N.useRef(null), [d, f] = Ri(), [p, m] = pi(), h = N.useRef({
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
			}, th);
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
		containerRef: ki(l, g),
		targetRef: ki(u, _),
		elementToRender: N.useMemo(() => t ? null : /*#__PURE__*/ N.createElement(eh, {
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
function rh(e) {
	return Hi(e) ? { element: e } : typeof e == "object" ? e === null ? { element: null } : e : {};
}
//#endregion
//#region node_modules/@fluentui/react-portal/lib/components/Portal/usePortalMountNodeStyles.styles.js
var ih = /*#__PURE__*/ F({ root: {
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
] }), ah = N.useInsertionEffect, oh = (e) => {
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
}, sh = () => {
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
}, ch = ah ? (e) => {
	"use no memo";
	let { className: t, dir: n, focusVisibleRef: r, targetNode: i } = e, [a] = N.useState(sh), o = N.useMemo(() => i === void 0 || e.disabled ? null : new Proxy({}, {
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
	return ah(() => {
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
} : oh, lh = (e) => {
	"use no memo";
	let { targetDocument: t, dir: n } = $r(), r = ci(), i = Bs(), a = ih(), o = Gr();
	return ch({
		dir: n,
		disabled: e.disabled,
		focusVisibleRef: i,
		className: k(o, a.root, e.className),
		targetNode: r ?? t?.body
	});
}, uh = (e) => {
	let { element: t, className: n } = rh(e.mountNode), r = N.useRef(null), i = lh({
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
		if (e && !t) return Zi(a, e), () => {
			Zi(a, void 0);
		};
	}, [r, a]), o;
}, dh = /* @__PURE__ */ l(h(), 1), fh = (e) => /*#__PURE__*/ N.createElement("span", {
	hidden: !0,
	ref: e.virtualParentRootRef
}, e.mountNode && /*#__PURE__*/ dh.createPortal(/*#__PURE__*/ N.createElement(N.Fragment, null, e.children, /*#__PURE__*/ N.createElement("span", { hidden: !0 })), e.mountNode)), ph = (e) => fh(uh(e));
ph.displayName = "Portal";
//#endregion
//#region node_modules/@fluentui/react-tooltip/lib/components/Tooltip/private/useTooltipTimeout.js
var mh = (e) => -1, hh = (e) => void 0;
function gh(e) {
	let { targetDocument: t } = $r(), n = t?.defaultView, r = n ? n.setTimeout : mh, i = n ? n.clearTimeout : hh, a = N.useRef(void 0), o = N.useCallback((e, t) => (a.current !== void 0 && i(a.current), a.current = r(e, t ?? 0), a.current), [i, r]), s = N.useCallback(() => {
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
var _h = (e) => {
	let t = Yr(), n = Si(), { targetDocument: r } = $r(), [i, a] = hi({
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
	_.content.id = Oi("tooltip-", _.content.id);
	let v = gm(_.positioning), y = I((e) => {
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
	_.withArrow && (b.offset = am(b.offset, 6));
	let { targetRef: x, containerRef: S, arrowRef: C } = Rm(b), [w, T] = gh(S), E = N.useCallback((e, t) => {
		T(), a((n) => (t.visible !== n && f?.(e, t), t.visible));
	}, [
		T,
		a,
		f
	]);
	_.content.ref = ki(_.content.ref, S), _.arrowRef = C, Ci(() => {
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
	]), O = $s(), [te] = N.useState(() => {
		let e = (e) => {
			e.detail?.isFocusedProgrammatically && !O() && (D.current = !0);
		}, t = null;
		return (n) => {
			t?.removeEventListener("keyborg:focusin", e), n?.addEventListener("keyborg:focusin", e), t = n;
		};
	}), ne = N.useCallback((e) => {
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
	_.content.onPointerEnter = Vi(_.content.onPointerEnter, T), _.content.onPointerLeave = Vi(_.content.onPointerLeave, ne), _.content.onFocus = Vi(_.content.onFocus, T), _.content.onBlur = Vi(_.content.onBlur, ne);
	let re = Ki(c), k = {}, ie = re?.props?.["aria-haspopup"] && (re?.props?.["aria-expanded"] === !0 || re?.props?.["aria-expanded"] === "true");
	return p === "label" ? typeof _.content.children == "string" ? k["aria-label"] = _.content.children : (k["aria-labelledby"] = _.content.id, _.shouldRenderTooltip = !0) : p === "description" && (k["aria-describedby"] = _.content.id, _.shouldRenderTooltip = !0), (n || ie) && (_.shouldRenderTooltip = !1), _.children = Wi(c, {
		...k,
		...re?.props,
		ref: ki(Bi(re), te, b.target === void 0 ? x : void 0),
		onPointerEnter: I(Vi(re?.props?.onPointerEnter, ee)),
		onPointerLeave: I(Vi(re?.props?.onPointerLeave, ne)),
		onFocus: I(Vi(re?.props?.onFocus, ee)),
		onBlur: I(Vi(re?.props?.onBlur, ne))
	}), _;
}, vh = (e) => {
	"use no memo";
	let { appearance: t = "normal", ...n } = e;
	return {
		appearance: t,
		..._h(n)
	};
}, yh = (e) => /*#__PURE__*/ ia(N.Fragment, { children: [e.children, e.shouldRenderTooltip && /*#__PURE__*/ L(ph, {
	mountNode: e.mountNode,
	children: /*#__PURE__*/ ia(e.content, { children: [e.withArrow && /*#__PURE__*/ L("div", {
		ref: e.arrowRef,
		className: e.arrowClassName
	}), e.content.children] })
})] }), bh = { content: "fui-Tooltip__content" }, xh = /*#__PURE__*/ F({
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
] }), Sh = (e) => {
	let t = xh();
	return e.content.className = k(bh.content, t.root, e.appearance === "inverted" && t.inverted, e.visible && t.visible, e.hidden && t.hidden, e.content.className), e.arrowClassName = t.arrow, e;
}, Ch = (e) => {
	let t = vh(e);
	return Sh(t), oi("useTooltipStyles_unstable")(t), yh(t);
};
Ch.displayName = "Tooltip", Ch.isFluentTriggerComponent = !0;
//#endregion
//#region node_modules/@fluentui/react-button/lib/components/Button/renderButton.js
var wh = (e) => {
	let { iconOnly: t, iconPosition: n } = e;
	return /*#__PURE__*/ ia(e.root, { children: [
		n !== "after" && e.icon && /*#__PURE__*/ L(e.icon, {}),
		!t && e.root.children,
		n === "after" && e.icon && /*#__PURE__*/ L(e.icon, {})
	] });
}, Th = N.createContext(void 0), Eh = {};
Th.Provider;
var Dh = () => N.useContext(Th) ?? Eh, Oh = (e, t) => {
	let { size: n } = Dh(), { appearance: r = "secondary", shape: i = "rounded", size: a = n ?? "medium", ...o } = e;
	return {
		appearance: r,
		shape: i,
		size: a,
		...kh(o, t)
	};
}, kh = (e, t) => {
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
		root: tr(Hl(i.as, i), {
			elementType: "button",
			defaultProps: {
				ref: t,
				type: e.as === "a" ? void 0 : "button"
			}
		}),
		icon: a
	};
}, Ah = {
	root: "fui-Button",
	icon: "fui-Button__icon"
};
`${W.strokeWidthThin}`;
var jh = /*#__PURE__*/ Jn("r1f29ykk", null, {
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
}), Mh = /*#__PURE__*/ Jn("rywnvv2", null, [".rywnvv2{align-items:center;display:inline-flex;justify-content:center;font-size:20px;height:20px;width:20px;--fui-Button__icon--spacing:var(--spacingHorizontalSNudge);}"]), Nh = /*#__PURE__*/ F({
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
}), Ph = /*#__PURE__*/ F({
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
}), Fh = /*#__PURE__*/ F({
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
}), Ih = /*#__PURE__*/ F({
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
] }), Lh = /*#__PURE__*/ F({
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
] }), Rh = (e) => {
	let t = jh(), n = Mh(), r = Nh(), i = Ph(), a = Fh(), o = Ih(), s = Lh(), { appearance: c, disabled: l, disabledFocusable: u, icon: d, iconOnly: f, iconPosition: p, shape: m, size: h } = e;
	return e.root.className = k(Ah.root, t, c && r[c], r[h], d && h === "small" && r.smallWithIcon, d && h === "large" && r.largeWithIcon, r[m], (l || u) && i.base, (l || u) && i.highContrast, c && (l || u) && i[c], c === "primary" && a.primary, a[h], a[m], f && o[h], e.root.className), e.icon && (e.icon.className = k(Ah.icon, n, !!e.root.children && s[p], s[h], e.icon.className)), e;
}, zh = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Oh(e, t);
	return Rh(n), oi("useButtonStyles_unstable")(n), wh(n);
});
zh.displayName = "Button";
//#endregion
//#region node_modules/@fluentui/react-field/lib/contexts/FieldContext.js
var Bh = N.createContext(void 0), Vh = Bh.Provider, Hh = () => N.useContext(Bh), Uh = (e) => {
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
function Wh(e, t) {
	return Gh(Hh(), e, t);
}
function Gh(e, t, n) {
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
var Kh = (e, t) => {
	let { children: n } = e;
	return typeof n == "function" && (n = n(Gh(t.field) || {})), /*#__PURE__*/ L(Vh, {
		value: t?.field,
		children: /*#__PURE__*/ ia(e.root, { children: [
			e.label && /*#__PURE__*/ L(e.label, {}),
			n,
			e.validationMessage && /*#__PURE__*/ ia(e.validationMessage, { children: [e.validationMessageIcon && /*#__PURE__*/ L(e.validationMessageIcon, {}), e.validationMessage.children] }),
			e.hint && /*#__PURE__*/ L(e.hint, {})
		] })
	});
}, qh = (e, t) => {
	let { weight: n = "regular", size: r = "medium", ...i } = e;
	return {
		weight: n,
		size: r,
		...Jh(i, t)
	};
}, Jh = (e, t) => {
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
		root: tr(Lr("label", {
			ref: t,
			...i
		}), { elementType: "label" })
	};
}, Yh = (e) => /*#__PURE__*/ ia(e.root, { children: [e.root.children, e.required && /*#__PURE__*/ L(e.required, {})] }), Xh = {
	root: "fui-Label",
	required: "fui-Label__required"
}, Zh = /*#__PURE__*/ F({
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
}), Qh = (e) => {
	let t = Zh();
	return e.root.className = k(Xh.root, t.root, e.disabled && t.disabled, t[e.size], e.weight === "semibold" && t.semibold, e.root.className), e.required && (e.required.className = k(Xh.required, t.required, e.disabled && t.disabled, e.required.className)), e;
}, $h = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = qh(e, t);
	return Qh(n), oi("useLabelStyles_unstable")(n), Yh(n);
});
$h.displayName = "Label";
//#endregion
//#region node_modules/@fluentui/react-field/lib/components/Field/useFieldBase.js
var eg = (e, t) => {
	let { children: n, required: r = !1, validationState: i = e.validationMessage ? "error" : "none" } = e, a = Oi("field-"), o = a + "__control", s = tr(Lr("div", {
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
}, tg = {
	error: /*#__PURE__*/ N.createElement($u, null),
	warning: /*#__PURE__*/ N.createElement(Iu, null),
	success: /*#__PURE__*/ N.createElement(qu, null),
	none: void 0
}, ng = (e, t) => {
	let { orientation: n = "vertical", size: r = "medium", ...i } = e, a = eg(i, t), o = tg[a.validationState];
	return {
		...a,
		components: {
			...a.components,
			label: $h
		},
		label: nr(e.label, {
			defaultProps: {
				size: r,
				...a.label
			},
			elementType: $h
		}),
		validationMessageIcon: nr(e.validationMessageIcon, {
			renderByDefault: !!o,
			defaultProps: { children: o },
			elementType: "span"
		}),
		orientation: n,
		size: r
	};
}, rg = {
	root: "fui-Field",
	label: "fui-Field__label",
	validationMessage: "fui-Field__validationMessage",
	validationMessageIcon: "fui-Field__validationMessageIcon",
	hint: "fui-Field__hint"
}, ig = /*#__PURE__*/ F({
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
] }), ag = /*#__PURE__*/ F({
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
] }), og = /*#__PURE__*/ Jn("r5c4z9l", null, [".r5c4z9l{margin-top:var(--spacingVerticalXXS);color:var(--colorNeutralForeground3);font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase200);}"]), sg = /*#__PURE__*/ F({
	error: { sj55zd: "f1hcrxcs" },
	withIcon: { uwmqm3: ["frawy03", "fg4c52"] }
}, { d: [
	".f1hcrxcs{color:var(--colorPaletteRedForeground1);}",
	".frawy03{padding-left:calc(12px + var(--spacingHorizontalXS));}",
	".fg4c52{padding-right:calc(12px + var(--spacingHorizontalXS));}"
] }), cg = /*#__PURE__*/ Jn("ra7h1uk", "r1rh6bd7", [".ra7h1uk{display:inline-block;font-size:12px;margin-left:calc(-12px - var(--spacingHorizontalXS));margin-right:var(--spacingHorizontalXS);line-height:0;vertical-align:-1px;}", ".r1rh6bd7{display:inline-block;font-size:12px;margin-right:calc(-12px - var(--spacingHorizontalXS));margin-left:var(--spacingHorizontalXS);line-height:0;vertical-align:-1px;}"]), lg = /*#__PURE__*/ F({
	error: { sj55zd: "f1hcrxcs" },
	warning: { sj55zd: "f1k5f75o" },
	success: { sj55zd: "ffmvakt" }
}, { d: [
	".f1hcrxcs{color:var(--colorPaletteRedForeground1);}",
	".f1k5f75o{color:var(--colorPaletteDarkOrangeForeground1);}",
	".ffmvakt{color:var(--colorPaletteGreenForeground1);}"
] }), ug = (e) => {
	let { validationState: t, size: n } = e, r = e.orientation === "horizontal", i = ig();
	e.root.className = k(rg.root, i.base, r && i.horizontal, r && !e.label && i.horizontalNoLabel, e.root.className);
	let a = ag();
	e.label && (e.label.className = k(rg.label, a.base, r && a.horizontal, r && n === "small" && a.horizontalSmall, r && n === "large" && a.horizontalLarge, !r && a.vertical, !r && n === "large" && a.verticalLarge, e.label.className));
	let o = cg(), s = lg();
	e.validationMessageIcon && (e.validationMessageIcon.className = k(rg.validationMessageIcon, o, t !== "none" && s[t], e.validationMessageIcon.className));
	let c = og(), l = sg();
	return e.validationMessage && (e.validationMessage.className = k(rg.validationMessage, c, t === "error" && l.error, !!e.validationMessageIcon && l.withIcon, e.validationMessage.className)), e.hint && (e.hint.className = k(rg.hint, c, e.hint.className)), e;
}, dg = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = ng(e, t);
	return ug(n), oi("useFieldStyles_unstable")(n), Kh(n, Uh(n));
});
dg.displayName = "Field";
//#endregion
//#region node_modules/@fluentui/react-checkbox/lib/components/Checkbox/useCheckbox.js
var fg = (e, t) => {
	let { shape: n = "square", size: r = "medium", ...i } = e, a = pg(i, t), o = a.checked === "mixed", s;
	if (o ? s = n === "circular" ? /*#__PURE__*/ N.createElement(Su, null) : r === "large" ? /*#__PURE__*/ N.createElement(Zu, null) : /*#__PURE__*/ N.createElement(Xu, null) : a.checked && (s = r === "large" ? /*#__PURE__*/ N.createElement(Ku, null) : /*#__PURE__*/ N.createElement(Gu, null)), a.indicator) {
		var c;
		(c = a.indicator).children ?? (c.children = s);
	}
	return {
		shape: n,
		size: r,
		...a,
		components: {
			...a.components,
			label: $h
		},
		label: nr(e.label, {
			defaultProps: {
				...a.label,
				size: "medium"
			},
			elementType: $h
		})
	};
}, pg = (e, t) => {
	"use no memo";
	e = Wh(e, {
		supportsLabelFor: !0,
		supportsRequired: !0
	});
	let { disabled: n = !1, required: r, labelPosition: i = "after", onChange: a } = e, [o, s] = hi({
		defaultState: e.defaultChecked,
		state: e.checked,
		initialState: !1
	}), c = Ir({
		props: e,
		primarySlotTagName: "input",
		excludedPropNames: [
			"checked",
			"defaultChecked",
			"onChange"
		]
	}), l = o === "mixed", u = Oi("checkbox-", c.primary.id), d = {
		checked: o,
		disabled: n,
		labelPosition: i,
		components: {
			root: "span",
			input: "input",
			indicator: "div",
			label: "label"
		},
		root: tr(e.root, {
			defaultProps: {
				ref: Gs(),
				...c.root
			},
			elementType: "span"
		}),
		input: tr(e.input, {
			defaultProps: {
				type: "checkbox",
				id: u,
				ref: t,
				checked: o === !0,
				...c.primary
			},
			elementType: "input"
		}),
		label: nr(e.label, {
			defaultProps: {
				htmlFor: u,
				disabled: n,
				required: r
			},
			elementType: "label"
		}),
		indicator: nr(e.indicator, {
			renderByDefault: !0,
			defaultProps: { "aria-hidden": !0 },
			elementType: "div"
		})
	};
	d.input.onChange = Vi(d.input.onChange, (e) => {
		let t = e.currentTarget.indeterminate ? "mixed" : e.currentTarget.checked;
		a?.(e, { checked: t }), s(t);
	});
	let f = ki(d.input.ref);
	return d.input.ref = f, Ci(() => {
		f.current && (f.current.indeterminate = l);
	}, [f, l]), d;
}, mg = (e) => /*#__PURE__*/ ia(e.root, { children: [
	/*#__PURE__*/ L(e.input, {}),
	e.labelPosition === "before" && e.label && /*#__PURE__*/ L(e.label, {}),
	e.indicator && /*#__PURE__*/ L(e.indicator, {}),
	e.labelPosition === "after" && e.label && /*#__PURE__*/ L(e.label, {})
] }), hg = {
	root: "fui-Checkbox",
	label: "fui-Checkbox__label",
	input: "fui-Checkbox__input",
	indicator: "fui-Checkbox__indicator"
}, gg = /*#__PURE__*/ Jn("r1nzur1d", "r128arqq", {
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
}), _g = /*#__PURE__*/ F({
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
}), vg = /*#__PURE__*/ Jn("ruo9svu", null, [".ruo9svu{box-sizing:border-box;cursor:inherit;height:100%;margin:0;opacity:0;position:absolute;top:0;width:calc(16px + 2 * var(--spacingHorizontalS));}"]), yg = /*#__PURE__*/ F({
	before: { j35jbq: ["f1e31b4d", "f1vgc2s3"] },
	after: { oyh7mz: ["f1vgc2s3", "f1e31b4d"] },
	large: { a9b677: "f1mq5jt6" }
}, { d: [
	".f1e31b4d{right:0;}",
	".f1vgc2s3{left:0;}",
	".f1mq5jt6{width:calc(20px + 2 * var(--spacingHorizontalS));}"
] }), bg = /*#__PURE__*/ Jn("rl7ci6d", null, [".rl7ci6d{align-self:flex-start;box-sizing:border-box;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;color:var(--fui-Checkbox__indicator--color);background-color:var(--fui-Checkbox__indicator--backgroundColor);border-color:var(--fui-Checkbox__indicator--borderColor, var(--colorNeutralStrokeAccessible));border-style:solid;border-width:var(--strokeWidthThin);border-radius:var(--borderRadiusSmall);margin:var(--spacingVerticalS) var(--spacingHorizontalS);fill:currentColor;pointer-events:none;font-size:12px;height:16px;width:16px;}"]), xg = /*#__PURE__*/ F({
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
] }), Sg = /*#__PURE__*/ F({
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
] }), Cg = (e) => {
	let { checked: t, disabled: n, labelPosition: r, shape: i, size: a } = e, o = gg(), s = _g();
	e.root.className = k(hg.root, o, n ? s.disabled : t === "mixed" ? s.mixed : t ? s.checked : s.unchecked, e.root.className);
	let c = vg(), l = yg();
	e.input.className = k(hg.input, c, a === "large" && l.large, l[r], e.input.className);
	let u = bg(), d = xg();
	e.indicator && (e.indicator.className = k(hg.indicator, u, a === "large" && d.large, i === "circular" && d.circular, e.indicator.className));
	let f = Sg();
	return e.label && (e.label.className = k(hg.label, f.base, f[a], f[r], e.label.className)), e;
}, wg = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = fg(e, t);
	return Cg(n), oi("useCheckboxStyles_unstable")(n), mg(n);
});
wg.displayName = "Checkbox";
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/contexts/ComboboxContext.js
var Tg = Ll({
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
Tg.Provider;
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/contexts/ListboxContext.js
var Eg = {
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
}, Dg = Ll(void 0), Og = (e) => Rl(Dg, (t = Eg) => e(t));
Dg.Provider;
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/contexts/useComboboxContextValues.js
function kg(e) {
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
		activeDescendant: N.useMemo(() => ({ controller: u }), [u]),
		listbox: m
	};
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/contexts/useListboxContextValues.js
function Ag(e) {
	let t = zl(Dg), { getOptionById: n, getOptionsMatchingValue: r, multiselect: i, registerOption: a, selectedOptions: o, selectOption: s, activeDescendantController: c } = e, l = Og((e) => e.registerOption), u = Og((e) => e.onOptionClick), d = Og((e) => e.onActiveDescendantChange);
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
		activeDescendant: N.useMemo(() => ({ controller: c }), [c])
	};
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/dropdownKeyActions.js
function jg(e, t = {}) {
	let { open: n = !0, multiselect: r = !1 } = t, i = e.key, { altKey: a, ctrlKey: o, key: s, metaKey: c } = e;
	return s.length === 1 && i !== " " && !a && !o && !c ? "Type" : n ? i === "ArrowUp" && a || i === "Enter" || !r && i === " " ? "CloseSelect" : r && i === " " ? "Select" : i === "Escape" ? "Close" : i === "ArrowDown" ? "Next" : i === "ArrowUp" ? "Previous" : i === "Home" ? "First" : i === "End" ? "Last" : i === "PageUp" ? "PageUp" : i === "PageDown" ? "PageDown" : i === "Tab" ? "Tab" : "None" : i === "ArrowDown" || i === "ArrowUp" || i === "Enter" || i === " " ? "Open" : "None";
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/useOptionCollection.js
var Mg = () => {
	let e = N.useRef(/* @__PURE__ */ new Map()), t = N.useMemo(() => ({
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
	}), []), n = N.useCallback((t) => (e.current.set(t.id, t), () => e.current.delete(t.id)), []);
	return {
		...t,
		options: Array.from(e.current.values()),
		registerOption: n
	};
}, Ng = (e) => {
	let { defaultSelectedOptions: t, multiselect: n, onOptionSelect: r } = e, [i, a] = hi({
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
		selectOption: N.useCallback((e, t) => {
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
function Pg(e) {
	return e.role === "option" || e.role === "menuitemcheckbox";
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/components/Listbox/useListbox.js
var Fg = {
	activeOption: void 0,
	focusVisible: !1,
	setActiveOption: () => null
}, Ig = (e, t) => {
	let { multiselect: n, disableAutoFocus: r = !1 } = e, i = Mg(), { listboxRef: a, activeParentRef: o, controller: s } = iu({ matchOption: Pg }), c = zl(Dg), l = Og((e) => e.onActiveDescendantChange), u = Og((e) => e.getOptionById), d = Og((e) => e.getOptionsMatchingValue), f = c ? u : i.getOptionById, p = c ? d : i.getOptionsMatchingValue, m = N.useMemo(() => {
		let e = null, t = (e) => {
			l?.(e);
		};
		return (n) => {
			n ? (e = n, e.addEventListener("activedescendantchange", t)) : e?.removeEventListener("activedescendantchange", t);
		};
	}, [l]), [h, g] = N.useState(!1);
	qs(g);
	let _ = ql(), v = Jl(), y = v ? _.controller : s, { clearSelection: b, selectedOptions: x, selectOption: S } = Ng(e), C = (e) => {
		let t = jg(e, { open: !0 }), n = y.active(), r = n ? f(n) : null;
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
	}, w = Og((e) => e.selectedOptions), T = Og((e) => e.selectOption), E = c ? {
		selectedOptions: w,
		selectOption: T,
		...Fg
	} : {
		selectedOptions: x,
		selectOption: S,
		...Fg
	};
	N.useEffect(() => {
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
	let D = N.useCallback(() => {
		v || (y.showFocusVisibleAttributes(), h && y.scrollActiveIntoView());
	}, [
		y,
		v,
		h
	]), ee = N.useCallback(() => {
		v || y.hideFocusVisibleAttributes();
	}, [y, v]), O = {
		components: { root: "div" },
		root: tr(Lr("div", {
			ref: ki(t, o, a, m),
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
	return O.root.onKeyDown = I(Vi(O.root.onKeyDown, C)), O.root.onFocus = I(Vi(O.root.onFocus, D)), O.root.onBlur = I(Vi(O.root.onBlur, ee)), O;
}, Lg = (e, t) => /*#__PURE__*/ L(Kl, {
	value: t.activeDescendant,
	children: /*#__PURE__*/ L(Dg.Provider, {
		value: t.listbox,
		children: /*#__PURE__*/ L(e.root, {})
	})
}), Rg = { root: "fui-Listbox" }, zg = /*#__PURE__*/ F({ root: {
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
] }), Bg = (e) => {
	let t = zg();
	return e.root.className = k(Rg.root, t.root, e.root.className), e;
}, Vg = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Ig(e, t), r = Ag(n);
	return Bg(n), oi("useListboxStyles_unstable")(n), Lg(n, r);
});
Vg.displayName = "Listbox";
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/components/Option/useOption.js
function Hg(e, t) {
	if (e !== void 0) return e;
	let n = "", r = !1;
	return N.Children.forEach(t, (e) => {
		typeof e == "string" ? n += e : r = !0;
	}), r && console.warn("Provide a `text` prop to Option components when they contain non-string children."), n;
}
var Ug = (e, t) => {
	let n = Wg(e, t), r = /*#__PURE__*/ N.createElement(Cu, null);
	if (n.multiselect && (r = n.selected ? /*#__PURE__*/ N.createElement(Gu, null) : ""), n.checkIcon) {
		var i;
		(i = n.checkIcon).children ?? (i.children = r);
	}
	return n;
}, Wg = (e, t) => {
	let { children: n, disabled: r, text: i, value: a } = e, o = N.useRef(null), s = Hg(i, n), c = a ?? s, l = Oi("fluent-option", e.id), u = N.useMemo(() => ({
		id: l,
		disabled: r,
		text: s,
		value: c
	}), [
		l,
		r,
		s,
		c
	]), { controller: d } = ql(), f = Og((e) => e.multiselect), p = Og((e) => e.registerOption), m = Og((e) => {
		let t = e.selectedOptions;
		return c !== void 0 && t.find((e) => e === c) !== void 0;
	}), h = Og((e) => e.selectOption), g = Og((e) => e.onOptionClick), _ = (t) => {
		var n;
		r ? t.preventDefault() : (d.focus(l), h(t, u), g(t), (n = e.onClick) == null || n.call(e, t));
	};
	N.useEffect(() => {
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
		root: tr(Lr("div", {
			ref: ki(t, o),
			"aria-disabled": r ? "true" : void 0,
			id: l,
			...v,
			...e,
			onClick: _
		}), { elementType: "div" }),
		checkIcon: nr(e.checkIcon, {
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
}, Gg = (e) => /*#__PURE__*/ ia(e.root, { children: [e.checkIcon && /*#__PURE__*/ L(e.checkIcon, {}), e.root.children] }), Kg = {
	root: "fui-Option",
	checkIcon: "fui-Option__checkIcon"
}, qg = /*#__PURE__*/ F({
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
}), Jg = (e) => {
	let { disabled: t, multiselect: n, selected: r } = e, i = qg();
	return e.root.className = k(Kg.root, i.root, !t && i.interactive, i.active, t && i.disabled, r && i.selected, e.root.className), e.checkIcon && (e.checkIcon.className = k(Kg.checkIcon, i.checkIcon, n && i.multiselectCheck, r && i.selectedCheck, r && n && i.selectedMultiselectCheck, t && i.checkDisabled, t && n && i.multiselectCheckDisabled, e.checkIcon.className)), e;
}, Yg = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Ug(e, t);
	return Jg(n), oi("useOptionStyles_unstable")(n), Gg(n);
});
Yg.displayName = "Option";
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/useComboboxBaseState.js
var Xg = (e) => {
	let { appearance: t = "outline", disableAutoFocus: n, children: r, clearable: i = !1, editable: a = !1, inlinePopup: o = !1, mountNode: s = void 0, multiselect: c, onOpenChange: l, size: u = "medium", activeDescendantController: d, freeform: f = !1, disabled: p = !1, onActiveOptionChange: m = null } = e, h = Mg(), { getOptionsMatchingValue: g } = h, { getOptionById: _ } = h, v = N.useCallback(() => {
		let e = d.active();
		return e ? _(e) : void 0;
	}, [d, _]), y = v(), b = N.useCallback((e) => {
		let t;
		typeof e == "function" && (t = e(v())), t ? d.focus(t.id) : d.blur();
	}, [d, v]), [x, S] = N.useState(!1), [C, w] = N.useState(!1), T = N.useRef(!1), E = wi(), [D, ee] = hi({
		state: e.value,
		initialState: void 0
	}), { selectedOptions: O, selectOption: te, clearSelection: ne } = Ng(e), re = N.useCallback((e, t) => {
		dh.unstable_batchedUpdates(() => {
			ee(void 0), te(e, t);
		});
	}, [ee, te]), k = N.useMemo(() => {
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
	]), [ie, ae] = hi({
		state: e.open,
		defaultState: e.defaultOpen,
		initialState: !1
	}), oe = N.useCallback((e, t) => {
		p || (l?.(e, { open: t }), dh.unstable_batchedUpdates(() => {
			!t && !f && ee(void 0), ae(t);
		}));
	}, [
		l,
		ae,
		ee,
		f,
		p
	]);
	N.useEffect(() => {
		if (ie) {
			if (!c && O.length > 0) {
				let e = g((e) => e === O[0]).pop();
				e?.id && d.focus(e.id);
			}
		} else d.blur();
	}, [ie, d]), N.useEffect(() => {
		ie && !n && !d.active() && d.first();
	}, [
		ie,
		r,
		n,
		d,
		_
	]);
	let se = I((e) => {
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
		onOptionClick: I((e) => {
			c || oe(e, !1);
		}),
		onActiveDescendantChange: se
	};
};
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/useComboboxPositioning.js
function Zg(e) {
	let { positioning: t } = e, { targetRef: n, containerRef: r } = Rm({
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
		...gm(t)
	});
	return [r, n];
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/useListboxSlot.js
function Qg(e, t, n) {
	let { state: { multiselect: r }, triggerRef: i, defaultProps: a } = n, o = Oi("fluent-listbox", ar(e) ? e.id : void 0), s = nr(e, {
		renderByDefault: !0,
		elementType: Vg,
		defaultProps: {
			id: o,
			multiselect: r,
			tabIndex: void 0,
			...a
		}
	}), c = Wh({ id: o }, { supportsLabelFor: !0 });
	s && !s["aria-label"] && !s["aria-labelledby"] && c["aria-labelledby"] && (s["aria-labelledby"] = c["aria-labelledby"]);
	let l = I(Vi((e) => {
		e.preventDefault();
	}, s?.onMouseDown)), u = I(Vi((e) => {
		var t;
		e.preventDefault(), (t = i.current) == null || t.focus();
	}, s?.onClick)), d = ki(s?.ref, t);
	return s && (s.ref = d, s.onMouseDown = l, s.onClick = u), s;
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/utils/useTriggerSlot.js
function $g(e, t, n) {
	let { state: { open: r, setOpen: i, setHasFocus: a }, defaultProps: o, elementType: s, activeDescendantController: c } = n, l = tr(e, {
		defaultProps: {
			type: "text",
			"aria-expanded": r,
			role: "combobox",
			...typeof o == "object" && o
		},
		elementType: s
	});
	return l.ref = ki(N.useRef(null), l.ref, t), l.onBlur = Vi((e) => {
		i(e, !1), a(!1);
	}, l.onBlur), l.onFocus = Vi((e) => {
		e.target === e.currentTarget && a(!0);
	}, l.onFocus), l.onClick = Vi((e) => {
		i(e, !r);
	}, l.onClick), l.onKeyDown = Vi(e_({
		activeDescendantController: c,
		...n.state
	}), l.onKeyDown), l;
}
function e_(e) {
	let { activeDescendantController: t, getOptionById: n, setOpen: r, selectOption: i, multiselect: a, open: o } = e, s = N.useCallback(() => {
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
	}, m = ec();
	return I((e) => {
		let t = jg(e, {
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
function t_(e, t) {
	return Js(hs({ focusable: { ignoreKeydown: { Escape: t } } }), typeof e == "object" ? e : {});
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/components/Dropdown/useButtonTriggerSlot.js
function n_(e, t, n) {
	let { state: { open: r, setOpen: i, getOptionById: a }, defaultProps: o, activeDescendantController: s } = n, c = N.useRef(""), [l, u] = Ri(), d = (e, t = { startFromNext: !1 }) => {
		let { startFromNext: n } = t, r = s.active();
		return s.find((t) => {
			let n = a(t);
			return !!n && e(n.text);
		}, { startFrom: n ? s.next({ passive: !0 }) : r }) || s.find((t) => {
			let n = a(t);
			return !!n && e(n.text);
		});
	}, f = () => {
		d((e) => e.toLocaleLowerCase().indexOf(c.current) === 0, { startFromNext: c.current.length === 1 }) || r_(c.current) && d((e) => e.toLocaleLowerCase().indexOf(c.current[0]) === 0, { startFromNext: !0 }) || s.blur();
	}, p = (e) => {
		u(), jg(e) === "Type" && (c.current += e.key.toLowerCase(), l(() => {
			c.current = "";
		}, 500), r && f(), !r && i(e, !0));
	}, m = $g(e, t, {
		state: n.state,
		defaultProps: o,
		elementType: "button",
		activeDescendantController: s
	});
	return m.onKeyDown = Vi(p, m.onKeyDown), m;
}
function r_(e) {
	for (let t = 1; t < e.length; t++) if (e[t] !== e[t - 1]) return !1;
	return !0;
}
//#endregion
//#region node_modules/@fluentui/react-combobox/lib/components/Dropdown/useDropdown.js
var i_ = (e, t) => {
	e = Wh(e, { supportsLabelFor: !0 });
	let { listboxRef: n, activeParentRef: r, controller: i } = iu({ matchOption: Pg }), a = Xg({
		...e,
		activeDescendantController: i,
		freeform: !1
	}), { appearance: o, size: s, freeform: c, ...l } = a, { clearable: u, clearSelection: d, disabled: f, hasFocus: p, multiselect: m, open: h, selectedOptions: g, setOpen: _ } = l, { primary: v, root: y } = Ir({
		props: e,
		primarySlotTagName: "button",
		excludedPropNames: ["children"]
	}), [b, x] = Zg(e), S = N.useRef(null), C = Qg(e.listbox, ki(b, n), {
		state: a,
		triggerRef: S,
		defaultProps: { children: e.children }
	}), { targetDocument: w } = $r();
	ji({
		element: w,
		callback: (e) => _(e, !1),
		refs: [
			S,
			b,
			x
		],
		disabled: !h
	});
	let T = n_(e.button ?? {}, ki(S, r, t), {
		state: a,
		defaultProps: {
			type: "button",
			tabIndex: v.disabled ? void 0 : 0,
			children: l.value || e.placeholder,
			"aria-controls": h ? C?.id : void 0,
			...v
		},
		activeDescendantController: i
	}), E = tr(e.root, {
		defaultProps: {
			"aria-owns": !e.inlinePopup && h ? C?.id : void 0,
			children: e.children,
			...y
		},
		elementType: "div"
	});
	E.ref = ki(E.ref, x);
	let D = g.length > 0 && !f && u && !m, ee = {
		components: {
			root: "div",
			button: "button",
			clearButton: "button",
			expandIcon: "span",
			listbox: Vg
		},
		root: E,
		button: T,
		listbox: h || p ? C : void 0,
		clearButton: nr(e.clearButton, {
			defaultProps: {
				"aria-label": "Clear selection",
				tabIndex: D ? 0 : void 0,
				type: "button"
			},
			elementType: "button",
			renderByDefault: !0
		}),
		expandIcon: nr(e.expandIcon, {
			renderByDefault: !0,
			elementType: "span"
		}),
		placeholderVisible: !l.value && !!e.placeholder,
		showClearButton: D,
		activeDescendantController: i,
		...l
	}, O = I(Vi(ee.clearButton?.onClick, (e) => {
		var t;
		d(e), (t = S.current) == null || t.focus();
	}));
	return ee.clearButton && (ee.clearButton.onClick = O), m && (ee.clearButton = void 0), ee;
}, a_ = (e, t) => {
	let n = Hh(), { appearance: r = "outline", size: i = n?.size ?? "medium", ...a } = e, o = i_(a, t);
	if (o.clearButton) {
		var s;
		(s = o.clearButton).children ?? (s.children = /*#__PURE__*/ N.createElement(ju, null));
	}
	if (o.expandIcon) {
		var c;
		(c = o.expandIcon).children ?? (c.children = /*#__PURE__*/ N.createElement(Tu, null));
	}
	return {
		...o,
		appearance: r,
		size: i,
		button: {
			...t_(o.button, o.open),
			...o.button
		}
	};
}, o_ = (e, t) => /*#__PURE__*/ L(e.root, { children: /*#__PURE__*/ L(Kl, {
	value: t.activeDescendant,
	children: /*#__PURE__*/ L(Dg.Provider, {
		value: t.listbox,
		children: /*#__PURE__*/ ia(Tg.Provider, {
			value: t.combobox,
			children: [
				/*#__PURE__*/ ia(e.button, { children: [e.button.children, e.expandIcon && /*#__PURE__*/ L(e.expandIcon, {})] }),
				e.clearButton && /*#__PURE__*/ L(e.clearButton, {}),
				e.listbox && (e.inlinePopup ? /*#__PURE__*/ L(e.listbox, {}) : /*#__PURE__*/ L(ph, {
					mountNode: e.mountNode,
					children: /*#__PURE__*/ L(e.listbox, {})
				}))
			]
		})
	})
}) }), s_ = {
	root: "fui-Dropdown",
	button: "fui-Dropdown__button",
	clearButton: "fui-Dropdown__clearButton",
	expandIcon: "fui-Dropdown__expandIcon",
	listbox: "fui-Dropdown__listbox"
}, c_ = /*#__PURE__*/ F({
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
}), l_ = /*#__PURE__*/ F({
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
] }), u_ = /*#__PURE__*/ Jn("rticfuj", "r1vp6jef", {
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
}), d_ = (e) => {
	let { appearance: t, open: n, placeholderVisible: r, showClearButton: i, size: a } = e, o = `${e.button["aria-invalid"]}` == "true", s = e.button.disabled, c = c_(), l = l_(), u = u_();
	return e.root.className = k(s_.root, c.root, c[t], !s && t === "outline" && c.outlineInteractive, o && t !== "underline" && c.invalid, o && t === "underline" && c.invalidUnderline, s && c.disabled, e.root.className), e.button.className = k(s_.button, c.button, c[a], r && c.placeholder, s && c.disabledText, e.button.className), e.listbox && (e.listbox.className = k(s_.listbox, c.listbox, e.inlinePopup && c.inlineListbox, !n && c.listboxCollapsed, e.listbox.className)), e.expandIcon && (e.expandIcon.className = k(s_.expandIcon, l.icon, l[a], s && l.disabled, i && c.hidden, e.expandIcon.className)), e.clearButton && (e.clearButton.className = k(s_.clearButton, u, l.icon, l[a], s && l.disabled, !i && c.hidden, e.clearButton.className)), e;
}, f_ = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = a_(e, t), r = kg(n);
	return d_(n), oi("useDropdownStyles_unstable")(n), o_(n, r);
});
f_.displayName = "Dropdown";
//#endregion
//#region node_modules/@fluentui/react-input/lib/components/Input/useInput.js
var p_ = (e, t) => {
	let n = ni(), r = Hh(), { size: i = r?.size ?? "medium", appearance: a = n.inputDefaultAppearance ?? "outline", ...o } = e;
	return {
		size: i,
		appearance: a,
		...m_(o, t)
	};
}, m_ = (e, t) => {
	let n = Wh(e, {
		supportsLabelFor: !0,
		supportsRequired: !0
	}), [r, i] = hi({
		state: n.value,
		defaultState: n.defaultValue,
		initialState: ""
	}), a = Ir({
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
}, h_ = (e) => /*#__PURE__*/ ia(e.root, { children: [
	e.contentBefore && /*#__PURE__*/ L(e.contentBefore, {}),
	/*#__PURE__*/ L(e.input, {}),
	e.contentAfter && /*#__PURE__*/ L(e.contentAfter, {})
] }), g_ = {
	root: "fui-Input",
	input: "fui-Input__input",
	contentBefore: "fui-Input__contentBefore",
	contentAfter: "fui-Input__contentAfter"
};
W.spacingHorizontalSNudge, W.spacingHorizontalMNudge, W.spacingHorizontalM, W.spacingHorizontalXXS, W.spacingHorizontalXXS, W.spacingHorizontalSNudge, W.spacingHorizontalS, W.spacingHorizontalM, `${W.spacingHorizontalM}${W.spacingHorizontalSNudge}`;
var __ = /*#__PURE__*/ Jn("r1oeeo9n", "r9sxh5", {
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
}), v_ = /*#__PURE__*/ F({
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
}), y_ = /*#__PURE__*/ Jn("r12stul0", null, [
	".r12stul0{align-self:stretch;box-sizing:border-box;flex-grow:1;min-width:0;border-style:none;padding:0 var(--spacingHorizontalM);color:var(--colorNeutralForeground1);background-color:transparent;outline-style:none;font-family:inherit;font-size:inherit;font-weight:inherit;line-height:inherit;}",
	".r12stul0::-webkit-input-placeholder{color:var(--colorNeutralForeground4);opacity:1;}",
	".r12stul0::-moz-placeholder{color:var(--colorNeutralForeground4);opacity:1;}",
	".r12stul0::placeholder{color:var(--colorNeutralForeground4);opacity:1;}"
]), b_ = /*#__PURE__*/ F({
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
] }), x_ = /*#__PURE__*/ Jn("r1572tok", null, [".r1572tok{box-sizing:border-box;color:var(--colorNeutralForeground3);display:flex;}", ".r1572tok>svg{font-size:20px;}"]), S_ = /*#__PURE__*/ F({
	disabled: { sj55zd: "f1s2aq7o" },
	small: { Duoase: "f3qv9w" },
	medium: {},
	large: { Duoase: "f16u2scb" }
}, { d: [
	".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}",
	".f3qv9w>svg{font-size:16px;}",
	".f16u2scb>svg{font-size:24px;}"
] }), C_ = (e) => {
	let { size: t, appearance: n } = e, r = e.input.disabled, i = `${e.input["aria-invalid"]}` == "true", a = n.startsWith("filled"), o = v_(), s = b_(), c = S_();
	e.root.className = k(g_.root, __(), o[t], e.contentBefore && o[`${t}WithContentBefore`], e.contentAfter && o[`${t}WithContentAfter`], o[n], !r && n === "outline" && o.outlineInteractive, !r && n === "underline" && o.underlineInteractive, !r && a && o.filledInteractive, a && o.filled, !r && i && o.invalid, r && o.disabled, e.root.className), e.input.className = k(g_.input, y_(), s[t], e.contentBefore && s[`${t}WithContentBefore`], e.contentAfter && s[`${t}WithContentAfter`], r && s.disabled, e.input.className);
	let l = [
		x_(),
		r && c.disabled,
		c[t]
	];
	return e.contentBefore && (e.contentBefore.className = k(g_.contentBefore, ...l, e.contentBefore.className)), e.contentAfter && (e.contentAfter.className = k(g_.contentAfter, ...l, e.contentAfter.className)), e;
}, w_ = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = p_(e, t);
	return C_(n), oi("useInputStyles_unstable")(n), h_(n);
});
w_.displayName = "Input";
var T_ = N.createContext(void 0).Provider, E_ = Ll(void 0), D_ = {
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
}, O_ = E_.Provider, k_ = (e) => Rl(E_, (t = D_) => e(t)), A_ = N.createContext(void 0), j_ = !1, M_ = A_.Provider, N_ = () => N.useContext(A_) ?? j_, P_ = Ll(void 0), F_ = {
	checkedValues: {},
	setFocusByFirstCharacter: () => null,
	toggleCheckbox: () => null,
	selectRadio: () => null,
	hasIcons: !1,
	hasCheckmarks: !1
}, I_ = P_.Provider, L_ = (e) => Rl(P_, (t = F_) => e(t)), R_ = "fuimenuenter", z_ = (e) => {
	let { refs: t, callback: n, element: r, disabled: i } = e, a = I((e) => {
		let r = t[0], a = e.target;
		!Xi(r.current ?? null, a) && !i && n(e);
	});
	N.useEffect(() => {
		if (r != null) return i || r.addEventListener(R_, a), () => {
			r.removeEventListener(R_, a);
		};
	}, [
		a,
		r,
		i
	]);
}, B_ = (e, t) => {
	e.dispatchEvent(new CustomEvent(R_, {
		bubbles: !0,
		detail: { nativeEvent: t }
	}));
};
//#endregion
//#region node_modules/@fluentui/react-menu/lib/utils/useIsSubmenu.js
function V_() {
	let e = k_((e) => e.isSubmenu), t = zl(P_);
	return e || t;
}
//#endregion
//#region node_modules/@fluentui/react-menu/lib/utils/useValidateNesting.js
var H_ = (e) => {
	let { targetDocument: t } = $r();
	return k_((e) => e.triggerRef), k_((e) => e.inline), N.useRef(null);
}, U_ = "fuimenusafezonetimeout", W_ = (e) => {
	let t = N.useRef(null);
	return N.useCallback((n) => {
		var r;
		(r = t.current) == null || r.removeEventListener("fuimenusafezonetimeout", e), n?.addEventListener("fuimenusafezonetimeout", e), t.current = n;
	}, [e]);
}, G_ = /*#__PURE__*/ F({
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
] }), K_ = (e) => {
	let t = G_();
	e.checkmark && (e.checkmark.className = k(t.root, e.checked && t.rootChecked, e.checkmark.className));
}, q_ = {
	root: "fui-MenuItem",
	icon: "fui-MenuItem__icon",
	checkmark: "fui-MenuItem__checkmark",
	submenuIndicator: "fui-MenuItem__submenuIndicator",
	content: "fui-MenuItem__content",
	secondaryContent: "fui-MenuItem__secondaryContent",
	subText: "fui-MenuItem__subText"
}, J_ = /*#__PURE__*/ Jn("rfoezjv", "r8lt3v0", {
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
}), Y_ = /*#__PURE__*/ Jn("r1ls86vo", "rpbc5dr", [".r1ls86vo{padding-left:2px;padding-right:2px;background-color:transparent;flex-grow:1;}", ".rpbc5dr{padding-right:2px;padding-left:2px;background-color:transparent;flex-grow:1;}"]), X_ = /*#__PURE__*/ Jn("r12mwwux", "r1ewgu5j", [
	".r12mwwux{padding-left:2px;padding-right:2px;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);color:var(--colorNeutralForeground3);}",
	".r12mwwux:hover{color:var(--colorNeutralForeground3Hover);}",
	".r12mwwux:focus{color:var(--colorNeutralForeground3Hover);}",
	".r1ewgu5j{padding-right:2px;padding-left:2px;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);color:var(--colorNeutralForeground3);}",
	".r1ewgu5j:hover{color:var(--colorNeutralForeground3Hover);}",
	".r1ewgu5j:focus{color:var(--colorNeutralForeground3Hover);}"
]), Z_ = /*#__PURE__*/ Jn("ro9koqv", null, [".ro9koqv{width:20px;height:20px;font-size:20px;line-height:0;align-items:center;display:inline-flex;justify-content:center;flex-shrink:0;}"]), Q_ = /*#__PURE__*/ Jn("r9c34qo", null, [".r9c34qo{width:20px;height:20px;font-size:20px;line-height:0;align-items:center;display:inline-flex;justify-content:center;}"]), $_ = /*#__PURE__*/ Jn("rk2ppru", null, [".rk2ppru{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase100);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase100);color:var(--colorNeutralForeground3);}"]), ev = /*#__PURE__*/ F({
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
}), tv = /*#__PURE__*/ F({ disabled: {
	sj55zd: "f1s2aq7o",
	B7iucu3: "f1cyfu5x"
} }, {
	d: [".f1s2aq7o{color:var(--colorNeutralForegroundDisabled);}"],
	m: [["@media (forced-colors: active){.f1cyfu5x{color:GrayText;}}", { m: "(forced-colors: active)" }]]
}), nv = /*#__PURE__*/ F({
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
] }), rv = (e) => {
	let t = ev(), n = J_(), r = Y_(), i = X_(), a = Z_(), o = Q_(), s = nv(), c = $_(), l = tv(), u = !!e.subText;
	return e.root.className = k(q_.root, n, e.submenuOpen && t.submenuOpen, e.disabled && t.disabled, e.root.className), e.content && (e.content.className = k(q_.content, r, e.content.className, u && s.content)), e.checkmark && (e.checkmark.className = k(q_.checkmark, t.checkmark, e.checkmark.className)), e.secondaryContent && (e.secondaryContent.className = k(q_.secondaryContent, i, e.disabled && t.disabled, e.secondaryContent.className, u && s.secondaryContent)), e.icon && (e.icon.className = k(q_.icon, a, e.icon.className)), e.submenuIndicator && (e.submenuIndicator.className = k(q_.submenuIndicator, o, e.submenuIndicator.className, u && s.submenuIndicator)), e.subText && (e.subText.className = k(q_.subText, e.disabled && l.disabled, e.subText.className, c)), K_(e), e;
}, iv = J.durationSlower, av = J.curveDecelerateMid, ov = Cd(({ distance: e = 10 }) => ({
	enter: [Fd({
		duration: iv,
		easing: av,
		direction: "enter"
	}), {
		...Id({
			duration: iv,
			easing: av,
			direction: "enter",
			outX: `calc(var(${$d}, 0px) * ${e})`,
			outY: `calc(var(${ef}, 0px) * ${e})`
		}),
		composite: "accumulate"
	}],
	exit: []
})), sv = [
	"after",
	"after-bottom",
	"before-top",
	"before",
	"before-bottom",
	"above"
], cv = (e) => {
	let { surfaceMotion: t, ...n } = e, r = lv(n);
	return {
		...r,
		components: { surfaceMotion: ov },
		surfaceMotion: Pd(t, {
			elementType: ov,
			defaultProps: {
				visible: r.open,
				appear: !0,
				unmountOnExit: !0
			}
		})
	};
}, lv = (e) => {
	let t = V_(), { hoverDelay: n = 500, inline: r = !1, hasCheckmarks: i = !1, hasIcons: a = !1, closeOnScroll: o = !1, openOnContext: s = !1, persistOnItemClick: c = !1, openOnHover: l = t, defaultCheckedValues: u, mountNode: d = null, safeZone: f } = e, { targetDocument: p } = $r(), m = Oi("menu"), [h, g] = zm(), _ = gm(e.positioning), v = nf({
		targetDocument: p,
		onPositioningEnd: _.onPositioningEnd
	}), y = {
		position: t ? "after" : "below",
		align: t ? "top" : "start",
		target: e.openOnContext ? h : void 0,
		fallbackPositions: t ? sv : void 0,
		..._,
		onPositioningEnd: v
	}, b = N.Children.toArray(e.children), x, S;
	b.length === 2 ? (x = b[0], S = b[1]) : b.length === 1 && (S = b[0]);
	let { targetRef: C, containerRef: w } = Rm(y), T = f && l, E = N.useRef({
		isInside: !1,
		mouseCoordinates: {
			x: 0,
			y: 0
		}
	}), D = nh({
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
			let e = new CustomEvent(U_);
			ne(e, {
				open: !1,
				keyboard: !1,
				type: "menuSafeZoneTimeout",
				event: e
			}), E.current.isInside && p && p.elementsFromPoint(E.current.mouseCoordinates.x, E.current.mouseCoordinates.y).find((e) => e.classList.contains(q_.root))?.dispatchEvent(e);
		}
	}), ee = ki(C, D.targetRef), O = ki(w, D.containerRef), [te, ne] = dv({
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
	}), [re, k] = uv({
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
}, uv = (e) => {
	let [t, n] = hi({
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
}, dv = (e) => {
	let { targetDocument: t } = $r(), n = k_((e) => e.setOpen), r = I((t, n) => e.onOpenChange?.call(e, t, n)), i = N.useRef(!1), [a, o] = hi({
		state: e.open,
		defaultState: e.defaultOpen,
		initialState: !1
	}), s = I((t, i) => {
		let a = t instanceof CustomEvent && t.type === "fuimenuenter" ? t.detail.nativeEvent : t;
		r?.(a, { ...i }), i.open && t.type === "contextmenu" && e.setContextTarget(t), i.open || e.setContextTarget(void 0), i.bubble && n(t, { ...i }), o(i.open);
	}), [c, l] = Ri(), u = I((t, n) => {
		l(), !(t instanceof Event) && t.persist && t.persist(), !n.ignoreHoverDelay && (t.type === "mouseleave" || t.type === "mouseover" || t.type === "mousemove" || t.type === "fuimenuenter") ? (e.triggerRef.current?.contains(t.target) && (i.current = t.type === "mouseover" || t.type === "mousemove"), c(() => s(t, n), e.hoverDelay)) : s(t, n);
	});
	ji({
		contains: Xi,
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
	Fi({
		contains: Xi,
		element: t,
		callback: (e) => u(e, {
			open: !1,
			type: "scrollOutside",
			event: e
		}),
		refs: [e.menuPopoverRef, !e.openOnContext && e.triggerRef].filter(Boolean),
		disabled: !a || !d
	}), z_({
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
	let { findFirstFocusable: f } = vs(), p = N.useCallback(() => {
		f(e.menuPopoverRef.current)?.focus();
	}, [f, e.menuPopoverRef]), m = wi();
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
function fv(e) {
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
var pv = (e, t) => /*#__PURE__*/ ia(O_, {
	value: t.menu,
	children: [e.menuTrigger, e.menuPopover && /*#__PURE__*/ L(e.surfaceMotion, { children: /*#__PURE__*/ L(Md, { children: e.menuPopover }) })]
}), mv = (e) => {
	let t = cv(e);
	return pv(t, fv(t));
};
mv.displayName = "Menu";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuItem/useCharacterSearch.js
var hv = (e, t) => {
	let n = L_((e) => e.setFocusByFirstCharacter), { onKeyDown: r } = e.root;
	return e.root.onKeyDown = (e) => {
		r?.(e), !(e.key?.length > 1) && t.current && n?.(e, t.current);
	}, e;
}, gv = N.createContext(void 0), _v = { setMultiline: () => null };
gv.Provider;
var vv = () => N.useContext(gv) ?? _v, yv = () => vv() !== _v, bv = (e, t) => {
	let n = N_(), r = k_((e) => e.persistOnItemClick), { as: i = "div", disabled: a = !1, hasSubmenu: o = n, persistOnClick: s = r, content: c, ...l } = e, { hasIcons: u, hasCheckmarks: d } = Sv({ hasSubmenu: o }), f = k_((e) => e.setOpen), p = k_((e) => e.open);
	xv({
		multiline: !!e.subText,
		hasSubmenu: o
	});
	let m = N.useRef(null), h = N.useRef(!1), g = H_(Cv(e.role)), _ = {
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
		root: tr(Lr(i, Hl(i, {
			role: "menuitem",
			...l,
			disabled: !1,
			disabledFocusable: a,
			ref: ki(t, m, g),
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
	return hv(_, m), _;
}, xv = (e) => {
	let { hasSubmenu: t, multiline: n } = e, r = yv() && t, { setMultiline: i } = vv();
	Ci(() => {
		r || i(n);
	}, [
		i,
		n,
		r
	]);
}, Sv = (e) => {
	let { hasSubmenu: t } = e, n = L_((e) => e.hasIcons), r = L_((e) => e.hasCheckmarks), i = yv() && t;
	return {
		hasIcons: n && !i,
		hasCheckmarks: r && !i
	};
}, Cv = (e) => {
	switch (e) {
		case "menuitemcheckbox": return "MenuItemCheckbox";
		case "menuitemradio": return "MenuItemRadio";
	}
	return "MenuItem";
}, wv = q(Ou, ku), Tv = q(Eu, Du), Ev = (e, t) => {
	let { dir: n } = $r(), r = bv(e, t);
	if (r.submenuIndicator) {
		var i;
		(i = r.submenuIndicator).children ?? (i.children = n === "rtl" ? /*#__PURE__*/ N.createElement(Tv, null) : /*#__PURE__*/ N.createElement(wv, null));
	}
	return r;
}, Dv = (e) => /*#__PURE__*/ ia(e.root, { children: [
	e.checkmark && /*#__PURE__*/ L(e.checkmark, {}),
	e.icon && /*#__PURE__*/ L(e.icon, {}),
	e.content && /*#__PURE__*/ ia(e.content, { children: [e.content.children, e.subText && /*#__PURE__*/ L(e.subText, {})] }),
	e.secondaryContent && /*#__PURE__*/ L(e.secondaryContent, {}),
	e.submenuIndicator && /*#__PURE__*/ L(e.submenuIndicator, {})
] }), Ov = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Ev(e, t);
	return rv(n), oi("useMenuItemStyles_unstable")(n), Dv(n);
});
Ov.displayName = "MenuItem";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuList/useMenuList.js
var kv = [
	"menuitem",
	"menuitemcheckbox",
	"menuitemradio"
], Av = kv.map((e) => `[role="${e}"]`).join(","), jv = (e, t) => {
	let n = Pv(), r = zl(E_);
	Fv(e, n, r) && console.warn("You are using both MenuList and Menu props, we recommend you to use Menu props when available");
	let i = N.useRef(null), { findAllFocusable: a } = vs(), { targetDocument: o } = $r(), s = gs({ circular: !0 }), c = Mv(e, t), l = ki(c.root.ref, i);
	N.useEffect(() => {
		let e = i.current;
		if (!r || !o || !e) return;
		let t = (t) => {
			let n = t.detail.next;
			n && e.contains(o.activeElement) && !e.contains(n) && t.preventDefault();
		};
		return o.addEventListener(La, t), () => {
			o.removeEventListener(La, t);
		};
	}, [r, o]);
	let u = N.useCallback((e, t) => {
		i.current && Nv(a(i.current, (e) => e.hasAttribute("role") && kv.indexOf(e.getAttribute("role")) !== -1), e.key, t);
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
}, Mv = (e, t) => {
	let n = k_((e) => e.triggerId), r = k_((e) => e.checkedValues), i = k_((e) => e.onCheckedValueChange), a = k_((e) => e.hasIcons), o = k_((e) => e.hasCheckmarks), s = zl(E_), c = N.useRef(null), l = H_("MenuList"), u = N.useCallback((e, t) => {
		c.current && Nv(Array.from(c.current.querySelectorAll(Av)), e.key, t);
	}, []), [d, f] = hi({
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
		root: tr(Lr("div", {
			ref: ki(t, c, l),
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
}, Nv = (e, t, n) => {
	let r = e.indexOf(n) + 1;
	r === e.length && (r = 0);
	let i = e.map((e) => e.textContent?.charAt(0).toLowerCase()), a = t.toLowerCase(), o = (e) => {
		for (let t = e; t < i.length; t++) if (a === i[t]) return t;
		return -1;
	}, s = o(r);
	s === -1 && (s = o(0)), s > -1 && e[s].focus();
}, Pv = () => ({
	checkedValues: k_((e) => e.checkedValues),
	onCheckedValueChange: k_((e) => e.onCheckedValueChange),
	triggerId: k_((e) => e.triggerId),
	hasIcons: k_((e) => e.hasIcons),
	hasCheckmarks: k_((e) => e.hasCheckmarks)
}), Fv = (e, t, n) => {
	let r = !1;
	for (let n in t) e[n] && (r = !0);
	return n && r;
}, Iv = (e, t) => /*#__PURE__*/ L(I_, {
	value: t.menuList,
	children: /*#__PURE__*/ L(e.root, {})
});
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuList/useMenuListContextValues.js
function Lv(e) {
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
var Rv = { root: "fui-MenuList" }, zv = /*#__PURE__*/ F({
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
] }), Bv = (e) => {
	let t = zv();
	return e.root.className = k(Rv.root, t.root, e.hasMenuContext && t.hasMenuContext, e.root.className), e;
}, Vv = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = jv(e, t), r = Lv(n);
	return Bv(n), oi("useMenuListStyles_unstable")(n), Iv(n, r);
});
Vv.displayName = "MenuList";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuPopover/useMenuPopover.js
var Hv = (e, t) => {
	"use no memo";
	let n = k_((e) => e.safeZone), r = k_((e) => e.menuPopoverRef), i = k_((e) => e.setOpen), a = k_((e) => e.open), o = k_((e) => e.openOnHover), s = k_((e) => e.triggerRef), c = V_(), l = L_((e) => e.shouldCloseOnArrowLeft ?? !0), u = N.useRef(!0), [d, f] = Ri(), { dir: p } = $r(), m = p === "ltr" ? Bl : Vl, h = N.useCallback((e) => {
		e && e.addEventListener("mouseover", (e) => {
			u.current && (u.current = !1, B_(r.current, e), d(() => {
				u.current = !0;
			}, 250));
		});
	}, [r, d]);
	N.useEffect(() => () => f(), [f]);
	let g = k_((e) => e.inline) ?? !1, _ = k_((e) => e.mountNode), v = tr(Lr("div", {
		role: "presentation",
		...e,
		ref: ki(t, r, h)
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
}, Uv = (e, t) => {
	let n = Js(Qs(), hs({ focusable: { ignoreKeydown: { Escape: !0 } } })), r = jd(), i = Hv(e, t);
	return {
		...i,
		root: {
			...n,
			...i.root,
			ref: ki(i.root.ref, r)
		}
	};
}, Wv = { root: "fui-MenuPopover" }, Gv = /*#__PURE__*/ F({ root: {
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
] }), Kv = (e) => {
	let t = Gv();
	return e.root.className = k(Wv.root, t.root, e.root.className), e;
}, qv = (e) => e.inline ? /*#__PURE__*/ ia(N.Fragment, { children: [/*#__PURE__*/ L(e.root, {}), e.safeZone] }) : /*#__PURE__*/ ia(ph, {
	mountNode: e.mountNode,
	children: [/*#__PURE__*/ L(e.root, {}), e.safeZone]
}), Jv = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Uv(e, t);
	return Kv(n), oi("useMenuPopoverStyles_unstable")(n), qv(n);
});
Jv.displayName = "MenuPopover";
//#endregion
//#region node_modules/@fluentui/react-menu/lib/components/MenuTrigger/useMenuTrigger.js
function Yv() {}
var Xv = (e) => {
	let t = k_((e) => e.menuPopoverRef), { findFirstFocusable: n } = vs(), r = N.useCallback(() => {
		n(t.current)?.focus();
	}, [n, t]);
	return Zv({
		...e,
		focusFirst: r
	});
}, Zv = (e) => {
	let { children: t, disableButtonEnhancement: n = !1, focusFirst: r } = e, i = k_((e) => e.triggerRef), a = k_((e) => e.setOpen), o = k_((e) => e.open), s = k_((e) => e.triggerId), c = k_((e) => e.openOnHover), l = k_((e) => e.openOnContext), u = V_(), d = L_((e) => e.shouldOpenOnArrowRight ?? !0), f = N.useRef(!1), p = N.useRef(!1), m = N.useRef(!1), { dir: h } = $r(), g = h === "ltr" ? Vl : Bl, _ = Ki(t), v = W_(I(() => {
		u && (p.current = !0);
	})), y = (e) => {
		Qv(e) || e.isDefaultPrevented() || l && (e.preventDefault(), a(e, {
			open: !0,
			keyboard: !1,
			type: "menuTriggerContextMenu",
			event: e
		}));
	}, b = (e) => {
		Qv(e) || l || (a(e, {
			open: !o,
			keyboard: f.current,
			type: "menuTriggerClick",
			event: e
		}), f.current = !1);
	}, x = (e) => {
		if (Qv(e) || e.isDefaultPrevented()) return;
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
		Qv(e) || c && (m.current ? a(e, {
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
		Qv(e) || c && !m.current && (a(e, {
			open: !0,
			keyboard: !1,
			type: "menuTriggerMouseMove",
			event: e
		}), m.current = !0);
	}, w = (e) => {
		Qv(e) || c && a(e, {
			open: !1,
			keyboard: !1,
			type: "menuTriggerMouseLeave",
			event: e
		});
	}, T = {
		id: s,
		..._?.props,
		ref: ki(i, Bi(_), v),
		onMouseEnter: I(_?.props.onMouseEnter ?? Yv),
		onMouseLeave: I(Vi(_?.props.onMouseLeave, w)),
		onContextMenu: I(Vi(_?.props.onContextMenu, y)),
		onMouseMove: I(Vi(_?.props.onMouseMove, C)),
		onMouseOver: I(Vi(_?.props.onMouseOver, S))
	}, E = {
		"aria-haspopup": "menu",
		"aria-expanded": !o && !u ? void 0 : o,
		...T,
		onClick: I(Vi(_?.props.onClick, b)),
		onKeyDown: I(Vi(_?.props.onKeyDown, x))
	}, D = Hl(_?.type === "button" || _?.type === "a" ? _.type : "div", E);
	return {
		isSubmenu: u,
		children: Wi(t, l ? T : n ? E : D)
	};
}, Qv = (e) => {
	let t = (e) => e.hasAttribute("disabled") || e.hasAttribute("aria-disabled") && e.getAttribute("aria-disabled") === "true";
	return Hi(e.target) && t(e.target) ? !0 : Hi(e.currentTarget) && t(e.currentTarget);
}, $v = (e) => /*#__PURE__*/ N.createElement(M_, { value: e.isSubmenu }, e.children), ey = (e) => $v(Xv(e));
ey.displayName = "MenuTrigger", ey.isFluentTriggerComponent = !0;
//#endregion
//#region node_modules/@fluentui/react-radio/lib/contexts/RadioGroupContext.js
var ty = N.createContext(void 0), ny = {};
ty.Provider;
var ry = () => N.useContext(ty) || ny, iy = (e, t) => /*#__PURE__*/ L(ty.Provider, {
	value: t.radioGroup,
	children: /*#__PURE__*/ L(e.root, {})
}), ay = (e, t) => {
	let { layout: n = "vertical", ...r } = e;
	return {
		layout: n,
		...oy(r, t)
	};
}, oy = (e, t) => {
	e = Wh(e);
	let n = Oi("radiogroup-"), { name: r = n, value: i, defaultValue: a, disabled: o, onChange: s, required: c } = e;
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
			...tr(Lr("div", e, ["onChange", "name"]), { elementType: "div" }),
			onChange: I((e) => {
				s && Hi(e.target, { constructorName: "HTMLInputElement" }) && e.target.type === "radio" && s(e, { value: e.target.value });
			})
		}
	};
}, sy = { root: "fui-RadioGroup" }, cy = /*#__PURE__*/ F({
	root: {
		mc9l5x: "f22iagw",
		Bt984gj: "f6jr5hl"
	},
	vertical: { Beiy3e4: "f1vx9l62" }
}, { d: [
	".f22iagw{display:flex;}",
	".f6jr5hl{align-items:flex-start;}",
	".f1vx9l62{flex-direction:column;}"
] }), ly = (e) => {
	let t = cy();
	return e.root.className = k(sy.root, t.root, e.layout === "vertical" && t.vertical, e.root.className), e;
}, uy = (e) => {
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
}, dy = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = ay(e, t), r = uy(n);
	return ly(n), oi("useRadioGroupStyles_unstable")(n), iy(n, r);
});
dy.displayName = "RadioGroup";
//#endregion
//#region node_modules/@fluentui/react-radio/lib/components/Radio/renderRadio.js
var fy = (e) => /*#__PURE__*/ ia(e.root, { children: [
	/*#__PURE__*/ L(e.input, {}),
	/*#__PURE__*/ L(e.indicator, {}),
	e.label && /*#__PURE__*/ L(e.label, {})
] }), py = (e, t) => {
	let n = my(e, t);
	return {
		...n,
		components: {
			...n.components,
			label: $h
		},
		label: nr(e.label, {
			defaultProps: { ...n.label },
			elementType: $h
		})
	};
}, my = (e, t) => {
	let n = ry(), { name: r = n.name, checked: i = n.value === void 0 ? void 0 : n.value === e.value, defaultChecked: a = n.defaultValue === void 0 ? void 0 : n.defaultValue === e.value, labelPosition: o = n.layout === "horizontal-stacked" ? "below" : "after", disabled: s = n.disabled, required: c = n.required, "aria-describedby": l = n["aria-describedby"], onChange: u } = e, d = Ir({
		props: e,
		primarySlotTagName: "input",
		excludedPropNames: [
			"checked",
			"defaultChecked",
			"onChange"
		]
	}), f = tr(e.root, {
		defaultProps: {
			ref: Gs(),
			...d.root
		},
		elementType: "span"
	}), p = tr(e.input, {
		defaultProps: {
			ref: t,
			type: "radio",
			id: Oi("radio-", d.primary.id),
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
	return p.onChange = Vi(p.onChange, (e) => u?.(e, { value: e.currentTarget.value })), {
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
}, hy = {
	root: "fui-Radio",
	indicator: "fui-Radio__indicator",
	input: "fui-Radio__input",
	label: "fui-Radio__label"
}, gy = /*#__PURE__*/ Jn("r1siqwd8", "rmnplyc", {
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
}), _y = /*#__PURE__*/ F({ vertical: {
	Beiy3e4: "f1vx9l62",
	Bt984gj: "f122n59"
} }, { d: [".f1vx9l62{flex-direction:column;}", ".f122n59{align-items:center;}"] }), vy = /*#__PURE__*/ Jn("rg1upok", "rzwdzb4", {
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
}), yy = /*#__PURE__*/ F({
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
] }), by = /*#__PURE__*/ Jn("rwtekvw", null, [".rwtekvw{position:relative;width:16px;height:16px;font-size:12px;box-sizing:border-box;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border:var(--strokeWidthThin) solid;border-radius:var(--borderRadiusCircular);margin:var(--spacingVerticalS) var(--spacingHorizontalS);fill:currentColor;pointer-events:none;}", ".rwtekvw::after{position:absolute;width:16px;height:16px;border-radius:var(--borderRadiusCircular);transform:scale(0.625);background-color:currentColor;}"]), xy = /*#__PURE__*/ F({
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
] }), Sy = (e) => {
	let { labelPosition: t } = e, n = gy(), r = _y();
	e.root.className = k(hy.root, n, t === "below" && r.vertical, e.root.className);
	let i = vy(), a = yy();
	e.input.className = k(hy.input, i, t === "below" && a.below, e.indicator.children ? a.customIndicator : a.defaultIndicator, e.input.className);
	let o = by();
	e.indicator.className = k(hy.indicator, o, e.indicator.className);
	let s = xy();
	return e.label && (e.label.className = k(hy.label, s.base, s[t], e.label.className)), e;
}, Cy = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = py(e, t);
	return Sy(n), oi("useRadioStyles_unstable")(n), fy(n);
});
Cy.displayName = "Radio";
//#endregion
//#region node_modules/@fluentui/react-tabs/lib/components/TabList/useTabList.js
var wy = (e, t) => {
	let { appearance: n = "transparent", reserveSelectedTabSpace: r = !0, size: i = "medium" } = e, a = Ty(e, t), o = Ey({ vertical: a.vertical });
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
}, Ty = (e, t) => {
	let { disabled: n = !1, onTabSelect: r, selectTabOnFocus: i = !1, vertical: a = !1, selectedValue: o, defaultSelectedValue: s, ...c } = e, l = N.useRef(null), [u, d] = hi({
		state: o,
		defaultState: s,
		initialState: void 0
	}), f = N.useRef(void 0), p = N.useRef(void 0);
	N.useEffect(() => {
		p.current = f.current, f.current = u;
	}, [u]);
	let m = I((e, t) => {
		d(t.value), r?.(e, t);
	}), h = N.useRef({}), g = I((e) => {
		let t = JSON.stringify(e.value);
		h.current[t] = e;
	}), _ = I((e) => {
		delete h.current[JSON.stringify(e.value)];
	}), v = N.useCallback(() => ({
		selectedValue: f.current,
		previousSelectedValue: p.current,
		registeredTabs: h.current
	}), []);
	return {
		components: { root: "div" },
		root: tr({
			ref: ki(t, l),
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
}, Ey = ({ vertical: e }) => gs({
	circular: !0,
	axis: e ? "vertical" : "horizontal",
	memorizeCurrent: !1,
	unstable_hasDefault: !0
}), Dy = {
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
}, Oy = Ll(void 0), ky = Oy.Provider, Ay = (e) => Rl(Oy, (t = Dy) => e(t)), jy = (e, t) => /*#__PURE__*/ L(e.root, { children: /*#__PURE__*/ L(ky, {
	value: t.tabList,
	children: e.root.children
}) }), My = { root: "fui-TabList" }, Ny = /*#__PURE__*/ F({
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
] }), Py = (e) => {
	let { appearance: t, vertical: n, size: r } = e, i = Ny(), a = t === "subtle-circular" || t === "filled-circular";
	return e.root.className = k(My.root, i.root, n ? i.vertical : i.horizontal, a && (r === "small" ? i.roundedSmall : i.rounded), e.root.className), e;
};
//#endregion
//#region node_modules/@fluentui/react-tabs/lib/components/TabList/useTabListContextValues.js
function Fy(e) {
	let { appearance: t, reserveSelectedTabSpace: n, disabled: r, selectTabOnFocus: i, selectedValue: a, onRegister: o, onUnregister: s, onSelect: c, getRegisteredTabs: l, size: u, vertical: d } = e;
	return { tabList: N.useMemo(() => ({
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
var Iy = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = wy(e, t), r = Fy(n);
	return Py(n), oi("useTabListStyles_unstable")(n), jy(n, r);
});
Iy.displayName = "TabList";
//#endregion
//#region node_modules/@fluentui/react-tabs/lib/components/Tab/useTab.js
var Ly = (e, t) => {
	let { content: n } = e, r = Ry(e, t), i = zy(r), a = Ay((e) => e.appearance), o = Ay((e) => e.reserveSelectedTabSpace), s = Ay((e) => e.size ?? "medium"), c = n && typeof n == "object" ? Rr(n, ["ref"]) : n;
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
		contentReservedSpace: nr(c, {
			renderByDefault: !r.selected && !r.iconOnly && o,
			defaultProps: { children: e.children },
			elementType: "span"
		}),
		appearance: a,
		size: s
	};
}, Ry = (e, t) => {
	let { content: n, disabled: r = !1, icon: i, onClick: a, onFocus: o, value: s, ...c } = e, l = Ay((e) => e.selectTabOnFocus), u = Ay((e) => e.disabled), d = Ay((e) => e.selectedValue === s), f = Ay((e) => e.onRegister), p = Ay((e) => e.onUnregister), m = Ay((e) => e.onSelect), h = Ay((e) => !!e.vertical), g = u || r, _ = N.useRef(null), v = (e) => m(e, { value: s }), y = I(Vi(a, v)), b = I(Vi(o, v));
	N.useEffect(() => (f({
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
	let x = nr(i, { elementType: "span" }), S = tr(n, {
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
		root: tr({
			ref: ki(t, _),
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
}, zy = ({ selected: e }) => hs({ focusable: { isDefault: e } }), By = (e) => /*#__PURE__*/ ia(e.root, { children: [
	e.icon && /*#__PURE__*/ L(e.icon, {}),
	!e.iconOnly && /*#__PURE__*/ L(e.content, {}),
	e.contentReservedSpace && /*#__PURE__*/ L(e.contentReservedSpace, {})
] }), Vy = {
	offsetVar: "--fui-Tab__indicator--offset",
	scaleVar: "--fui-Tab__indicator--scale"
}, Hy = /*#__PURE__*/ F({
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
}), Uy = (e) => {
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
}, Wy = (e, t) => {
	let n = Gy(t) ? e[JSON.stringify(t)]?.ref.current : void 0;
	return n ? Uy(n) : void 0;
}, Gy = (e) => e != null, Ky = (e) => {
	let { disabled: t, selected: n, vertical: r } = e, i = Hy(), [a, o] = N.useState(), [s, c] = N.useState({
		offset: 0,
		scale: 1
	}), l = Ay((e) => e.getRegisteredTabs), [u] = pi();
	if (n) {
		let { previousSelectedValue: e, selectedValue: t, registeredTabs: n } = l();
		if (Gy(e) && a !== e) {
			let i = Wy(n, e), a = Wy(n, t);
			a && i && (c({
				offset: r ? i.y - a.y : i.x - a.x,
				scale: r ? i.height / a.height : i.width / a.width
			}), o(e), u(() => c({
				offset: 0,
				scale: 1
			})));
		}
	} else Gy(a) && o(void 0);
	if (t) return e;
	let d = s.offset === 0 && s.scale === 1;
	e.root.className = k(e.root.className, n && i.base, n && d && i.animated, n && (r ? i.vertical : i.horizontal));
	let f = {
		[Vy.offsetVar]: `${s.offset}px`,
		[Vy.scaleVar]: `${s.scale}`
	};
	return e.root.style = {
		...f,
		...e.root.style
	}, e;
}, qy = {
	root: "fui-Tab",
	icon: "fui-Tab__icon",
	content: "fui-Tab__content"
}, Jy = { content: "fui-Tab__content--reserved-space" }, Yy = /*#__PURE__*/ F({
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
] }), Xy = /*#__PURE__*/ F({
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
}), Zy = /*#__PURE__*/ F({
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
] }), Qy = /*#__PURE__*/ F({
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
}), $y = /*#__PURE__*/ F({
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
}), eb = /*#__PURE__*/ F({
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
] }), tb = /*#__PURE__*/ F({
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
] }), nb = (e) => {
	"use no memo";
	return rb(e), ib(e, e.root), ab(e), e;
}, rb = (e) => {
	let t = Yy(), n = Qy(), r = $y(), { appearance: i, disabled: a, selected: o, size: s, vertical: c } = e, l = [qy.root, t.root];
	return i !== "subtle-circular" && i !== "filled-circular" && l.push(n.base, s === "small" && (c ? n.smallVertical : n.smallHorizontal), s === "medium" && (c ? n.mediumVertical : n.mediumHorizontal), s === "large" && (c ? n.largeVertical : n.largeHorizontal), a && n.disabled, o && r.base, o && !a && r.selected, o && s === "small" && (c ? r.smallVertical : r.smallHorizontal), o && s === "medium" && (c ? r.mediumVertical : r.mediumHorizontal), o && s === "large" && (c ? r.largeVertical : r.largeHorizontal), o && a && r.disabled), e.root.className = k(...l, e.root.className), Ky(e), e;
}, ib = (e, t) => {
	let n = Yy(), r = Zy(), i = Xy(), { appearance: a, disabled: o, selected: s, size: c, vertical: l } = e, u = a === "subtle-circular", d = a === "filled-circular", f = u || d, p = [
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
}, ab = (e) => {
	let t = eb(), n = tb(), { selected: r, size: i } = e;
	return e.icon && (e.icon.className = k(qy.icon, t.base, t[i], r && t.selected, e.icon.className)), e.contentReservedSpace && (e.contentReservedSpace.className = k(Jy.content, n.base, i === "large" ? n.largeSelected : n.selected, e.icon ? n.iconBefore : n.noIconBefore, n.placeholder, e.content.className), e.contentReservedSpaceClassName = e.contentReservedSpace.className), e.content.className = k(qy.content, n.base, i === "large" && n.large, r && (i === "large" ? n.largeSelected : n.selected), e.icon ? n.iconBefore : n.noIconBefore, e.content.className), e;
}, ob = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = Ly(e, t);
	return nb(n), oi("useTabStyles_unstable")(n), By(n);
});
ob.displayName = "Tab";
//#endregion
//#region node_modules/@fluentui/react-text/lib/components/Text/useText.js
var sb = (e, t) => {
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
		root: tr(Lr("span", {
			ref: t,
			...e
		}), { elementType: "span" })
	};
}, cb = (e) => /*#__PURE__*/ L(e.root, {}), lb = { root: "fui-Text" }, ub = /*#__PURE__*/ F({
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
] }), db = (e) => {
	let t = ub();
	return e.root.className = k(lb.root, t.root, e.wrap === !1 && t.nowrap, e.truncate && t.truncate, e.block && t.block, e.italic && t.italic, e.underline && t.underline, e.strikethrough && t.strikethrough, e.underline && e.strikethrough && t.strikethroughUnderline, e.size === 100 && t.base100, e.size === 200 && t.base200, e.size === 400 && t.base400, e.size === 500 && t.base500, e.size === 600 && t.base600, e.size === 700 && t.hero700, e.size === 800 && t.hero800, e.size === 900 && t.hero900, e.size === 1e3 && t.hero1000, e.font === "monospace" && t.monospace, e.font === "numeric" && t.numeric, e.weight === "medium" && t.weightMedium, e.weight === "semibold" && t.weightSemibold, e.weight === "bold" && t.weightBold, e.align === "center" && t.alignCenter, e.align === "end" && t.alignEnd, e.align === "justify" && t.alignJustify, e.root.className), e;
}, Z = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = sb(e, t);
	return db(n), oi("useTextStyles_unstable")(n), cb(n);
});
Z.displayName = "Text";
//#endregion
//#region node_modules/@fluentui/react-textarea/lib/components/Textarea/renderTextarea.js
var fb = (e) => /*#__PURE__*/ L(e.root, { children: /*#__PURE__*/ L(e.textarea, {}) }), pb = (e, t) => {
	let n = ni(), r = Hh(), { size: i = r?.size ?? "medium", appearance: a = n.inputDefaultAppearance ?? "outline", ...o } = e;
	return {
		...mb(o, t),
		size: i,
		appearance: a
	};
}, mb = (e, t) => {
	e = Wh(e, {
		supportsLabelFor: !0,
		supportsRequired: !0
	});
	let { resize: n = "none", onChange: r } = e, [i, a] = hi({
		state: e.value,
		defaultState: e.defaultValue,
		initialState: void 0
	}), o = Ir({
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
		textarea: tr(e.textarea, {
			defaultProps: {
				ref: t,
				...o.primary
			},
			elementType: "textarea"
		}),
		root: tr(e.root, {
			defaultProps: o.root,
			elementType: "span"
		})
	};
	return s.textarea.value = i, s.textarea.onChange = I((e) => {
		let t = e.target.value;
		r?.(e, { value: t }), a(t);
	}), s;
}, hb = {
	root: "fui-Textarea",
	textarea: "fui-Textarea__textarea"
}, gb = /*#__PURE__*/ F({
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
}), _b = /*#__PURE__*/ F({
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
] }), vb = /*#__PURE__*/ F({
	none: { B3rzk8w: "f1o1s39h" },
	both: { B3rzk8w: "f1pxm0xe" },
	horizontal: { B3rzk8w: "fq6nmtn" },
	vertical: { B3rzk8w: "f1f5ktr4" }
}, { d: [
	".f1o1s39h{resize:none;}",
	".f1pxm0xe{resize:both;}",
	".fq6nmtn{resize:horizontal;}",
	".f1f5ktr4{resize:vertical;}"
] }), yb = (e) => {
	let { size: t, appearance: n, resize: r } = e, i = e.textarea.disabled, a = `${e.textarea["aria-invalid"]}` == "true", o = n.startsWith("filled"), s = gb();
	e.root.className = k(hb.root, s.base, i && s.disabled, !i && o && s.filled, !i && s[n], !i && s.interactive, !i && n === "outline" && s.outlineInteractive, !i && a && s.invalid, e.root.className);
	let c = _b(), l = vb();
	return e.textarea.className = k(hb.textarea, c.base, c[t], l[r], i && c.disabled, e.textarea.className), e;
}, bb = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = pb(e, t);
	return yb(n), oi("useTextareaStyles_unstable")(n), fb(n);
});
bb.displayName = "Textarea";
//#endregion
//#region node_modules/@fluentui/react-progress/lib/utils/clampMax.js
var xb = (e) => e <= 0 ? 1 : e, Sb = (e, t) => e === void 0 ? e : e < 0 ? 0 : e > t ? t : e, Cb = vd({
	keyframes: [{ translate: "-100%" }, { translate: "300%" }],
	duration: 3e3,
	iterations: Infinity,
	easing: J.curveLinear,
	reducedMotion: {
		keyframes: [
			{ opacity: .2 },
			{ opacity: 1 },
			{ opacity: .2 }
		],
		duration: 3e3,
		iterations: Infinity
	}
}), wb = (e, t) => {
	let n = Hh()?.validationState, { color: r = n === "error" || n === "warning" || n === "success" ? n : "brand", shape: i = "rounded", thickness: a = "medium", indeterminateMotion: o, ...s } = e, c = Tb(s, t);
	return {
		...c,
		components: {
			...c.components,
			indeterminateMotion: Cb
		},
		color: r,
		shape: i,
		thickness: a,
		indeterminateMotion: c.value === void 0 ? Nd(o, {
			elementType: Cb,
			defaultProps: {}
		}) : void 0
	};
}, Tb = (e, t) => {
	let n = Hh(), r = xb(e.max ?? 1), i = Sb(e.value, r), a = tr(Lr("div", {
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
}, Eb = (e) => /*#__PURE__*/ L(e.root, { children: e.bar && (e.indeterminateMotion ? /*#__PURE__*/ L(e.indeterminateMotion, { children: /*#__PURE__*/ L(e.bar, {}) }) : /*#__PURE__*/ L(e.bar, {})) }), Db = {
	root: "fui-ProgressBar",
	bar: "fui-ProgressBar__bar"
}, Ob = .01, kb = /*#__PURE__*/ F({
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
}), Ab = /*#__PURE__*/ F({
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
}), jb = (e) => {
	let { color: t, max: n, shape: r, thickness: i, value: a } = e, o = kb(), s = Ab();
	return e.root.className = k(Db.root, o.root, o[r], o[i], e.root.className), e.bar && (e.bar.className = k(Db.bar, s.base, s.brand, a === void 0 && s.indeterminate, a !== void 0 && a > Ob && s.nonZeroDeterminate, t && a !== void 0 && s[t], e.bar.className)), e.bar && a !== void 0 && (e.bar.style = {
		width: Math.min(100, Math.max(0, a / n * 100)) + "%",
		...e.bar.style
	}), e;
}, Mb = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = wb(e, t);
	return jb(n), oi("useProgressBarStyles_unstable")(n), Eb(n);
});
Mb.displayName = "ProgressBar";
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBar/getIntentIcon.js
function Nb(e) {
	switch (e) {
		case "info": return /*#__PURE__*/ N.createElement(xu, null);
		case "warning": return /*#__PURE__*/ N.createElement(bu, null);
		case "error": return /*#__PURE__*/ N.createElement(Au, null);
		case "success": return /*#__PURE__*/ N.createElement(wu, null);
		default: return null;
	}
}
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBar/useMessageBarReflow.js
function Pb(e = !1) {
	let { targetDocument: t } = $r(), n = N.useReducer(() => ({}), {})[1], r = N.useRef(!1), i = N.useRef(null), a = N.useRef(Infinity), o = N.useCallback((e) => {
		var t;
		let i = e[0], o = (i == null || (t = i.borderBoxSize) == null ? void 0 : t[0]?.inlineSize) ?? i?.target.getBoundingClientRect().width;
		if (o === void 0 || !i) return;
		let { target: s } = i;
		if (!Hi(s)) return;
		let c;
		if (r.current) o >= a.current && (c = !1);
		else {
			let e = s.scrollWidth;
			o < e && (c = !0, a.current = e);
		}
		c !== void 0 && r.current !== c && (r.current = c, n());
	}, [n]), s = N.useCallback((n) => {
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
	return N.useEffect(() => () => {
		var e;
		(e = i.current) == null || e.disconnect();
	}, []), {
		ref: s,
		reflowing: r.current
	};
}
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/contexts/messageBarTransitionContext.js
var Fb = N.createContext(void 0), Ib = {
	className: "",
	nodeRef: N.createRef()
};
Fb.Provider;
var Lb = () => N.useContext(Fb) ?? Ib, Rb = (e, t) => {
	let { layout: n = "auto", intent: r = "info", politeness: i } = e, a = i ?? r === "info" ? "polite" : "assertive", o = n === "auto", { ref: s, reflowing: c } = Pb(o), l = o ? c ? "multiline" : "singleline" : n, { className: u, nodeRef: d } = Lb(), f = N.useRef(null), p = N.useRef(null), { announce: m } = ui(), h = Oi();
	return N.useEffect(() => {
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
		root: tr(Lr("div", {
			ref: ki(t, s, d),
			role: "group",
			"aria-labelledby": h,
			...e
		}), { elementType: "div" }),
		icon: nr(e.icon, {
			renderByDefault: !0,
			elementType: "div"
		}),
		bottomReflowSpacer: nr(e.bottomReflowSpacer, {
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
}, zb = (e, t) => {
	let { shape: n = "rounded", ...r } = e, i = Rb(r, ki(t, jd()));
	return {
		...i,
		shape: n,
		icon: nr(e.icon, {
			defaultProps: { children: Nb(i.intent) },
			renderByDefault: !0,
			elementType: "div"
		})
	};
}, Bb = N.createContext(void 0), Vb = {
	titleId: "",
	layout: "singleline",
	actionsRef: N.createRef(),
	bodyRef: N.createRef()
}, Hb = Bb.Provider, Ub = () => N.useContext(Bb) ?? Vb, Wb = (e, t) => /*#__PURE__*/ L(Hb, {
	value: t.messageBar,
	children: /*#__PURE__*/ ia(e.root, { children: [
		e.icon && /*#__PURE__*/ L(e.icon, {}),
		e.root.children,
		e.bottomReflowSpacer && /*#__PURE__*/ L(e.bottomReflowSpacer, {})
	] })
}), Gb = {
	root: "fui-MessageBar",
	icon: "fui-MessageBar__icon",
	bottomReflowSpacer: "fui-MessageBar__bottomReflowSpacer"
}, Kb = /*#__PURE__*/ Jn("r2oyxsj", "r1wuyrhw", [".r2oyxsj{white-space:nowrap;display:grid;grid-template-columns:auto 1fr auto auto;grid-template-rows:1fr;grid-template-areas:\"icon body secondaryActions actions\";padding-left:var(--spacingHorizontalM);border:var(--strokeWidthThin) solid var(--colorNeutralStroke1);border-radius:var(--borderRadiusMedium);align-items:center;min-height:36px;box-sizing:border-box;background-color:var(--colorNeutralBackground3);}", ".r1wuyrhw{white-space:nowrap;display:grid;grid-template-columns:auto 1fr auto auto;grid-template-rows:1fr;grid-template-areas:\"icon body secondaryActions actions\";padding-right:var(--spacingHorizontalM);border:var(--strokeWidthThin) solid var(--colorNeutralStroke1);border-radius:var(--borderRadiusMedium);align-items:center;min-height:36px;box-sizing:border-box;background-color:var(--colorNeutralBackground3);}"]), qb = /*#__PURE__*/ Jn("r1df1z33", "rivnfjc", [".r1df1z33{grid-area:icon;font-size:var(--fontSizeBase500);margin-right:var(--spacingHorizontalS);color:var(--colorNeutralForeground3);display:flex;align-items:center;}", ".rivnfjc{grid-area:icon;font-size:var(--fontSizeBase500);margin-left:var(--spacingHorizontalS);color:var(--colorNeutralForeground3);display:flex;align-items:center;}"]), Jb = /*#__PURE__*/ Jn("r1vx593n", null, [".r1vx593n{margin-bottom:var(--spacingVerticalS);grid-area:secondaryActions;}"]), Yb = /*#__PURE__*/ F({
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
] }), Xb = /*#__PURE__*/ F({
	info: {},
	error: { sj55zd: "f1ca9wz" },
	warning: { sj55zd: "f14a4cve" },
	success: { sj55zd: "f36rra6" }
}, { d: [
	".f1ca9wz{color:var(--colorStatusDangerForeground1);}",
	".f14a4cve{color:var(--colorStatusWarningForeground3);}",
	".f36rra6{color:var(--colorStatusSuccessForeground1);}"
] }), Zb = /*#__PURE__*/ F({
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
] }), Qb = (e) => {
	let t = Kb(), n = qb(), r = Xb(), i = Zb(), a = Jb(), o = Yb();
	return e.root.className = k(Gb.root, t, e.layout === "multiline" && o.rootMultiline, e.shape === "square" && o.square, i[e.intent], e.root.className), e.icon && (e.icon.className = k(Gb.icon, n, r[e.intent], e.icon.className)), e.bottomReflowSpacer && (e.bottomReflowSpacer.className = k(Gb.bottomReflowSpacer, a)), e;
};
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBar/useMessageBarContextValues.js
function $b(e) {
	let { layout: t, actionsRef: n, bodyRef: r, titleId: i } = e;
	return { messageBar: N.useMemo(() => ({
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
var ex = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = zb(e, t);
	return Qb(n), oi("useMessageBarStyles_unstable")(n), Wb(n, $b(n));
});
ex.displayName = "MessageBar";
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarTitle/useMessageBarTitle.js
var tx = (e, t) => {
	let { titleId: n } = Ub();
	return {
		components: { root: "span" },
		root: tr(Lr("span", {
			ref: t,
			id: n,
			...e
		}), { elementType: "span" })
	};
}, nx = (e) => /*#__PURE__*/ L(e.root, {}), rx = { root: "fui-MessageBarTitle" }, ix = /*#__PURE__*/ Jn("r168xkm9", null, [".r168xkm9{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase300);font-weight:var(--fontWeightSemibold);line-height:var(--lineHeightBase300);}", ".r168xkm9::after{content:\" \";}"]), ax = (e) => {
	let t = ix();
	return e.root.className = k(rx.root, t, e.root.className), e;
}, ox = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = tx(e, t);
	return ax(n), oi("useMessageBarTitleStyles_unstable")(n), nx(n);
});
ox.displayName = "MessageBarTitle";
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarBody/useMessageBarBody.js
var sx = (e, t) => {
	let { bodyRef: n } = Ub();
	return {
		components: { root: "div" },
		root: tr(Lr("div", {
			ref: ki(t, n),
			...e
		}), { elementType: "div" })
	};
}, cx = (e, t) => /*#__PURE__*/ L(T_, {
	value: t.link,
	children: /*#__PURE__*/ L(e.root, {})
}), lx = { root: "fui-MessageBarBody" }, ux = /*#__PURE__*/ Jn("rtatq2b", "re2rary", [".rtatq2b{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase300);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);grid-area:body;padding-right:var(--spacingHorizontalM);}", ".re2rary{font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase300);font-weight:var(--fontWeightRegular);line-height:var(--lineHeightBase300);grid-area:body;padding-left:var(--spacingHorizontalM);}"]), dx = (e) => {
	let t = ux();
	return e.root.className = k(lx.root, t, e.root.className), e;
};
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarBody/useMessageBarBodyContextValues.js
function fx(e) {
	return { link: N.useMemo(() => ({ inline: !0 }), []) };
}
//#endregion
//#region node_modules/@fluentui/react-message-bar/lib/components/MessageBarBody/MessageBarBody.js
var px = /*#__PURE__*/ N.forwardRef((e, t) => {
	let n = sx(e, t), r = fx(n);
	return dx(n), oi("useMessageBarBodyStyles_unstable")(n), cx(n, r);
});
px.displayName = "MessageBarBody";
//#endregion
//#region public/plugins/_shared/theme.js
var mx = _(), hx = {
	background: "colorNeutralBackground1",
	foreground: "colorNeutralForeground1",
	muted: "colorNeutralForeground2",
	accent: "colorBrandBackground"
};
function gx() {
	return (typeof window < "u" && window.matchMedia?.("(prefers-color-scheme: light)"))?.matches ? "light" : "dark";
}
function _x(e) {
	let t = e && typeof e == "object" ? e : {}, n = t.colorScheme === "light" ? "light" : t.colorScheme === "dark" ? "dark" : gx(), r = n === "light" ? _l : yl, i = {};
	for (let [e, n] of Object.entries(t)) {
		if (typeof n != "string" || !n || e === "colorScheme") continue;
		let t = hx[e];
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
function vx(e) {
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
var yx = {
	init: null,
	legacyTheme: null,
	started: !1
};
function bx() {
	yx.started || (yx.started = !0, e.onInit((e) => {
		yx.init ||= e;
	}), window.addEventListener("message", (e) => {
		let t = e.data;
		t && t.type === "wtsl:init" && t.theme && (yx.legacyTheme ||= t.theme);
	}));
}
function xx(e) {
	return yx.init?.theme ? yx.init.theme : yx.legacyTheme && vx(yx.legacyTheme) || { colorScheme: e };
}
function Sx(e) {
	let t = yx.init?.config;
	if (t && typeof t == "object") return t[e];
}
var Cx = "(prefers-color-scheme: light)";
function wx() {
	return typeof window > "u" || typeof window.matchMedia != "function" ? "dark" : window.matchMedia(Cx).matches ? "light" : "dark";
}
function Tx(t = "dark") {
	let [n, r] = (0, N.useState)(() => xx(t)), [i, a] = (0, N.useState)(wx);
	(0, N.useEffect)(() => {
		let t = e.onInit((e) => {
			e && typeof e == "object" && e.theme && typeof e.theme == "object" && r(e.theme);
		}), n = e.onTheme((e) => {
			e && typeof e == "object" && r(e);
		});
		return () => {
			t(), n();
		};
	}, []), (0, N.useEffect)(() => {
		if (e.inHost || typeof window.matchMedia != "function") return;
		let t = window.matchMedia(Cx), n = () => a(t.matches ? "light" : "dark");
		return typeof t.addEventListener == "function" ? (t.addEventListener("change", n), () => t.removeEventListener("change", n)) : (t.addListener(n), () => t.removeListener(n));
	}, []);
	let o = e.inHost ? n : {
		...n,
		colorScheme: i
	}, s = (0, N.useMemo)(() => _x(o), [o]);
	return (0, N.useEffect)(() => {
		typeof document < "u" && (document.documentElement.style.colorScheme = s.scheme, document.body && (document.body.style.colorScheme = s.scheme));
	}, [s.scheme]), s;
}
function Ex(t, n) {
	let r = (0, N.useRef)(t);
	r.current = t;
	let [i, a] = (0, N.useState)(() => {
		let e = yx.init?.size;
		return Array.isArray(e) ? r.current(e) : n;
	});
	return (0, N.useEffect)(() => {
		let t = (e) => {
			Array.isArray(e) && e.length === 2 && a(r.current(e));
		}, n = e.onInit((e) => t(e?.size)), i = e.onResize(t);
		return () => {
			n(), i();
		};
	}, []), i;
}
function Dx(e, t) {
	if (e === t) return !0;
	try {
		return JSON.stringify(e) === JSON.stringify(t);
	} catch {
		return !1;
	}
}
function Ox(t, n, r) {
	let i = (0, N.useRef)(r);
	i.current = r;
	let a = (0, N.useRef)(n);
	a.current = n;
	let [o, s] = (0, N.useState)(() => {
		let e = Sx(t);
		return i.current ? i.current(e) : e ?? n;
	}), [c, l] = (0, N.useState)(() => Sx(t) !== void 0), u = (0, N.useRef)(o);
	u.current = o;
	let d = (0, N.useRef)(0), f = (0, N.useRef)(!0);
	(0, N.useEffect)(() => () => {
		f.current = !1;
	}, []);
	let p = (0, N.useCallback)((e) => {
		s(i.current ? i.current(e) : e ?? a.current);
	}, []), m = (0, N.useCallback)(() => {
		let n = ++d.current;
		e.getConfig(t).then((e) => {
			f.current && n === d.current && (p(e), l(!0));
		}).catch(() => {
			f.current && n === d.current && l(!0);
		});
	}, [p, t]);
	return (0, N.useEffect)(() => {
		m();
	}, [m]), (0, N.useEffect)(() => {
		let n = !0, r = e.onConfig?.((e, r) => {
			e === t && (n || (d.current += 1), l(!0), !Dx(r, u.current) && p(r));
		});
		return n = !1, () => {
			r?.();
		};
	}, [p, t]), (0, N.useEffect)(() => {
		let n = `plugin.${e.pluginId}.${t}`, r = (e) => {
			(e.key === null || e.key === n) && m();
		};
		return window.addEventListener("storage", r), () => window.removeEventListener("storage", r);
	}, [t, m]), [
		o,
		(0, N.useCallback)((n) => {
			let r = typeof n == "function" ? n(u.current) : n;
			d.current += 1, u.current = r, s(r), e.setConfig(t, r).catch(() => {});
		}, [t]),
		c
	];
}
function kx() {
	let e = new URLSearchParams(location.search);
	return e.get("view") || (e.get("settings") === "1" ? "settings" : null);
}
function Ax(e, t) {
	window.parent.postMessage({
		type: "plugin:request-overlay",
		payload: {
			view: e,
			title: t
		}
	}, "*");
}
function jx() {
	window.parent.postMessage({ type: "plugin:request-host-settings" }, "*");
}
var Mx = 500, Nx = 8, Px = [
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
function Fx(e, t) {
	if (!(t instanceof Element)) return !1;
	let n = t.closest(Px);
	return !!(n && n !== e && e.contains(n));
}
function Ix() {
	let t = (0, N.useRef)(null);
	return (0, N.useEffect)(() => {
		let n = t.current;
		if (!n || !e.inHost || kx()) return;
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
			e.button === 0 && (Fx(n, e.target) || r === null && (r = e.pointerId, i = e.clientX, a = e.clientY, s = !1, f("down", e.pointerType), o = window.setTimeout(() => {
				o = 0, s = !0, g(), window.parent.postMessage({ type: "plugin:request-edit-mode" }, "*");
			}, Mx)));
		}, y = (e) => {
			if (d(e.pointerType)) {
				let t = !Fx(n, e.target);
				t !== c && (c = t, f(t ? "hover-enter" : "hover-leave", e.pointerType));
			}
			r !== null && e.pointerId === r && (Math.hypot(e.clientX - i, e.clientY - a) <= Nx || (p(), !s && (r = null, f("cancel", e.pointerType))));
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
typeof window < "u" && kx() && window.addEventListener("keydown", (e) => {
	e.key === "Escape" && (e.preventDefault(), window.parent.postMessage({ type: "plugin:request-overlay-close" }, "*"));
});
function Lx(t, n) {
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
function Rx() {
	e.exitFocus();
}
var zx = 864e5;
function Q(e) {
	if (e instanceof Date) return Number.isNaN(e.getTime()) ? null : e;
	if (typeof e == "string" && e.trim()) {
		let t = new Date(e);
		return Number.isNaN(t.getTime()) ? null : t;
	}
	return typeof e == "number" && Number.isFinite(e) ? new Date(e) : null;
}
function Bx(e) {
	return String(e).padStart(2, "0");
}
function Vx(e) {
	let t = Q(e);
	return t ? `${t.getFullYear()}-${Bx(t.getMonth() + 1)}-${Bx(t.getDate())}` : "";
}
function Hx(e) {
	let t = Q(e) || /* @__PURE__ */ new Date();
	return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0);
}
function Ux(e, t) {
	let n = Q(e) || /* @__PURE__ */ new Date(), r = new Date(n);
	return r.setDate(r.getDate() + t), r;
}
function Wx(e, t) {
	let n = Q(e) || /* @__PURE__ */ new Date(), r = n.getDate(), i = new Date(n);
	i.setDate(1), i.setMonth(i.getMonth() + t);
	let a = new Date(i.getFullYear(), i.getMonth() + 1, 0).getDate();
	return i.setDate(Math.min(r, a)), i;
}
function Gx(e, t) {
	let n = Q(e) || /* @__PURE__ */ new Date(), r = n.getDate(), i = new Date(n);
	i.setDate(1), i.setFullYear(i.getFullYear() + t);
	let a = new Date(i.getFullYear(), i.getMonth() + 1, 0).getDate();
	return i.setDate(Math.min(r, a)), i;
}
function Kx(e, t = 1) {
	let n = Hx(e);
	return Ux(n, -((n.getDay() - t + 7) % 7));
}
function qx(e) {
	let t = Q(e) || /* @__PURE__ */ new Date();
	return new Date(t.getFullYear(), t.getMonth(), 1, 0, 0, 0, 0);
}
function Jx(e, t) {
	let n = Q(e), r = Q(t);
	return !n || !r ? !1 : n.getFullYear() === r.getFullYear() && n.getMonth() === r.getMonth() && n.getDate() === r.getDate();
}
function Yx(e, t) {
	let n = Hx(e), r = Hx(t);
	return Math.round((r.getTime() - n.getTime()) / zx);
}
function Xx(e) {
	let t = Q(e);
	return t ? `${Bx(t.getHours())}:${Bx(t.getMinutes())}` : "";
}
function Zx(e) {
	let t = Q(e);
	return t ? `${t.getFullYear()}-${Bx(t.getMonth() + 1)}-${Bx(t.getDate())}T${Bx(t.getHours())}:${Bx(t.getMinutes())}` : "";
}
function Qx(e, t) {
	if (!e) return null;
	let [n, r, i] = e.split("-").map(Number), a = 23, o = 59;
	if (t) {
		let [e, n] = t.split(":").map(Number);
		Number.isFinite(e) && Number.isFinite(n) && (a = e, o = n);
	}
	return new Date(n, r - 1, i, a, o, 0, 0).toISOString();
}
function $x(e, t = /* @__PURE__ */ new Date()) {
	let n = Q(e);
	if (!n) return "";
	let r = Yx(t, n);
	return r === 0 ? "今天" : r === 1 ? "明天" : r === 2 ? "后天" : r === -1 ? "昨天" : n.getFullYear() === t.getFullYear() ? `${n.getMonth() + 1}月${n.getDate()}日` : `${n.getFullYear()}年${n.getMonth() + 1}月${n.getDate()}日`;
}
function eS(e, t = /* @__PURE__ */ new Date()) {
	let n = Q(e);
	if (!n) return "";
	let r = Vx(n), i = Vx(t), a = Vx(Ux(t, 1)), o = n.getHours() !== 23 || n.getMinutes() !== 59;
	if (r < i) {
		let e = Yx(n, t);
		return e <= 1 ? "已逾期" : `逾期 ${e} 天`;
	}
	if (r === i) return o ? `今天 ${Xx(n)}` : "今天";
	if (r === a) return o ? `明天 ${Xx(n)}` : "明天";
	let s = $x(n, t);
	return o ? `${s} ${Xx(n)}` : s;
}
var tS = [
	"日",
	"一",
	"二",
	"三",
	"四",
	"五",
	"六"
];
function nS(e = 1) {
	return Array.from({ length: 7 }, (t, n) => tS[(e + n) % 7]);
}
function rS(e) {
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
var iS = [
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
function aS(e, t) {
	let n = Q(e) || /* @__PURE__ */ new Date();
	switch (t) {
		case "daily": return Ux(n, 1);
		case "weekly": return Ux(n, 7);
		case "monthly": return Wx(n, 1);
		case "yearly": return Gx(n, 1);
		default: return null;
	}
}
var oS = [
	{
		value: 0,
		label: "无",
		short: "无",
		color: "var(--colorNeutralForeground3)"
	},
	{
		value: 1,
		label: "低",
		short: "低",
		color: "var(--colorPaletteBlueForeground2)"
	},
	{
		value: 2,
		label: "中",
		short: "中",
		color: "var(--colorPaletteMarigoldForeground2)"
	},
	{
		value: 3,
		label: "高",
		short: "高",
		color: "var(--colorPaletteRedForeground2)"
	}
];
function sS(e) {
	return oS.find((t) => t.value === e) || oS[0];
}
//#endregion
//#region public/plugins/todo/js/store.js
var cS = {
	lists: "todo.lists",
	tasks: "todo.tasks",
	tags: "todo.tags",
	settings: "todo.settings"
}, lS = [
	"colorPaletteBlueForeground2",
	"colorPaletteGreenForeground2",
	"colorPaletteMarigoldForeground2",
	"colorPaletteBerryForeground2",
	"colorPaletteTealForeground2",
	"colorPalettePurpleForeground2",
	"colorPaletteDarkOrangeForeground2",
	"colorPaletteCranberryForeground2"
], uS = [
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
], dS = {
	defaultListId: null,
	showCompleted: !0,
	defaultSort: "manual",
	fontSize: "default",
	weekStart: 1,
	reminders: {}
};
function fS() {
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}
function pS(e, t) {
	let n = fS();
	if (!n) return t;
	try {
		let r = n.getItem(e);
		return r === null ? t : JSON.parse(r) ?? t;
	} catch {
		return t;
	}
}
function mS(e, t) {
	let n = fS();
	if (n) try {
		n.setItem(e, JSON.stringify(t));
	} catch (t) {
		console.error("[todo] 保存失败", e, t);
	}
}
function hS() {
	let e = pS(cS.settings, null);
	if (!e || typeof e != "object") return {};
	let t = e.reminders;
	return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : {};
}
function gS(e) {
	let t = Q(e);
	return t ? Math.floor(t.getTime() / 6e4) : null;
}
function _S(e, t) {
	let n = gS(e);
	return n !== null && n === gS(t);
}
function vS() {
	return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
function yS() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
function bS(e) {
	return Number.isInteger(e) && e >= 0 && e <= 3;
}
function xS(e, t) {
	if (!e || typeof e != "object" || typeof e.title != "string") return null;
	let n = Q(e.createdAt)?.toISOString() || yS();
	return {
		id: typeof e.id == "string" && e.id ? e.id : vS(),
		listId: typeof e.listId == "string" && e.listId ? e.listId : t,
		title: e.title,
		note: typeof e.note == "string" && e.note ? e.note : void 0,
		done: !!e.done,
		doneAt: Q(e.doneAt)?.toISOString() || void 0,
		createdAt: n,
		updatedAt: Q(e.updatedAt)?.toISOString() || n,
		order: Number.isFinite(e.order) ? e.order : 0,
		priority: bS(e.priority) ? e.priority : 0,
		dueAt: Q(e.dueAt)?.toISOString() || void 0,
		remindAt: Q(e.remindAt)?.toISOString() || void 0,
		recurrence: iS.some((t) => t.value === e.recurrence) ? e.recurrence : void 0,
		tags: Array.isArray(e.tags) ? e.tags.filter((e) => typeof e == "string" && e.trim()).map((e) => e.trim()) : [],
		subtasks: Array.isArray(e.subtasks) ? e.subtasks.filter((e) => e && typeof e.title == "string").map((e, t) => ({
			id: typeof e.id == "string" && e.id ? e.id : vS(),
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
				...dS,
				reminders: {}
			}
		}, this.listeners = /* @__PURE__ */ new Set(), this.storageBound = !1;
	}
	load() {
		let e = pS(cS.lists, null), t = Array.isArray(e) && e.length ? e.filter((e) => e && typeof e.name == "string").map((e, t) => ({
			id: typeof e.id == "string" && e.id ? e.id : vS(),
			name: e.name,
			color: typeof e.color == "string" && e.color ? e.color : lS[t % lS.length],
			order: Number.isFinite(e.order) ? e.order : t
		})).sort((e, t) => e.order - t.order) : [];
		t.length || t.push({
			id: vS(),
			name: "我的待办",
			color: lS[0],
			order: 0
		});
		let n = new Set(t.map((e) => e.id)), r = t[0].id, i = pS(cS.tasks, []), a = (Array.isArray(i) ? i : []).map((e) => xS(e, r)).filter(Boolean).map((e) => n.has(e.listId) ? e : {
			...e,
			listId: r
		}), o = pS(cS.tags, []), s = Array.isArray(o) ? o.filter((e) => typeof e == "string") : [], c = pS(cS.settings, {}), l = {
			...dS,
			...c && typeof c == "object" ? c : {}
		};
		return (!l.reminders || typeof l.reminders != "object") && (l.reminders = {}), uS.some((e) => e.value === l.defaultSort) || (l.defaultSort = "manual"), l.weekStart !== 0 && l.weekStart !== 1 && (l.weekStart = 1), t.some((e) => e.id === l.defaultListId) || (l.defaultListId = r), this.state = {
			lists: t,
			tasks: a,
			tags: s,
			settings: l
		}, this.persistAll(), this.state;
	}
	bindStorageSync() {
		this.storageBound || typeof window > "u" || (this.storageBound = !0, window.addEventListener("storage", (e) => {
			e.key && Object.values(cS).includes(e.key) && (this.load(), this.emit());
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
			...hS(),
			...this.state.settings.reminders || {}
		}, mS(cS.lists, this.state.lists), mS(cS.tasks, this.state.tasks), mS(cS.tags, this.state.tags), mS(cS.settings, this.state.settings);
	}
	persistTasks() {
		mS(cS.tasks, this.state.tasks);
	}
	persistLists() {
		mS(cS.lists, this.state.lists);
	}
	persistTags() {
		mS(cS.tags, this.state.tags);
	}
	persistSettings() {
		mS(cS.settings, this.state.settings);
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
	listColor(e) {
		return this.listById(e)?.color || lS[0];
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
			return Jx(r, n) ? !0 : t && r < Hx(n);
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
		let n = Hx(/* @__PURE__ */ new Date()), r = Ux(n, -(e - 1)), i = /* @__PURE__ */ new Map();
		for (let t = 0; t < e; t++) i.set(Vx(Ux(r, t)), {
			count: 0,
			weight: 0
		});
		let a = 0, o = 0;
		for (let e of this.state.tasks) {
			if (!e.done || !e.doneAt) continue;
			let t = Q(e.doneAt);
			if (!t || t < r) continue;
			let n = i.get(Vx(t));
			n && (n.count += 1, n.weight += e.priority === 3 ? 3 : e.priority === 2 ? 2 : 1, a += 1, o += e.priority === 3 ? 3 : e.priority === 2 ? 2 : 1);
		}
		let s = (() => {
			let e = n;
			(i.get(Vx(n))?.count || 0) === 0 && (e = Ux(n, -1));
			let t = 0;
			for (; i.has(Vx(e)) && (i.get(Vx(e))?.count || 0) > 0;) t += 1, e = Ux(e, -1);
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
		e.updatedAt = yS();
	}
	addTask(e = {}) {
		let t = typeof e.title == "string" ? e.title.trim() : "";
		if (!t) throw Error("title 不能为空");
		if (e.listId !== void 0 && e.listId !== null && !this.state.lists.some((t) => t.id === e.listId)) throw Error(`找不到清单 ${e.listId}`);
		let n = e.listId || this.settings.defaultListId || this.state.lists[0].id;
		if (e.priority !== void 0 && e.priority !== null && !bS(e.priority)) throw Error("priority 必须是 0–3");
		let r = e.recurrence ?? void 0;
		if (r && !iS.some((e) => e.value === r)) throw Error("recurrence 必须是 daily / weekly / monthly / yearly");
		let i = yS(), a = {
			id: vS(),
			listId: n,
			title: t,
			note: typeof e.note == "string" && e.note.trim() ? e.note.trim() : void 0,
			done: !1,
			createdAt: i,
			updatedAt: i,
			order: this.nextOrder(n),
			priority: bS(e.priority) ? e.priority : 0,
			dueAt: rS(e.dueAt) || void 0,
			remindAt: rS(e.remindAt) || void 0,
			recurrence: r || void 0,
			tags: Array.isArray(e.tags) ? e.tags.filter((e) => typeof e == "string" && e.trim()).map((e) => e.trim()) : [],
			subtasks: Array.isArray(e.subtasks) ? e.subtasks.filter((e) => e && typeof (e.title ?? e) == "string" && String(e.title ?? e).trim()).map((e, t) => ({
				id: vS(),
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
			if (!bS(r.priority)) throw Error("priority 必须是 0–3");
			n.priority = r.priority;
		}
		if (r.dueAt !== void 0 && (n.dueAt = rS(r.dueAt) || void 0), r.remindAt !== void 0) {
			let e = n.remindAt, t = rS(r.remindAt) || void 0;
			n.remindAt = t, _S(e, t) || this.clearFiredReminder(n);
		}
		if (r.recurrence !== void 0) {
			if (r.recurrence && !iS.some((e) => e.value === r.recurrence)) throw Error("recurrence 必须是 daily / weekly / monthly / yearly");
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
		e.done !== t && (e.done = t, e.doneAt = t ? yS() : void 0, t && e.recurrence && this.spawnNextOccurrence(e));
	}
	spawnNextOccurrence(e) {
		let t = Q(e.dueAt) || /* @__PURE__ */ new Date(), n = aS(t, e.recurrence);
		if (!n) return null;
		let r = /* @__PURE__ */ new Date(), i = 0;
		for (; n <= r && i < 1e3;) n = aS(n, e.recurrence), i += 1;
		let a = n.getTime() - t.getTime(), o = yS(), s = {
			id: vS(),
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
				id: vS(),
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
			...hS(),
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
			...hS(),
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
	addList(e, t) {
		let n = String(e ?? "").trim();
		if (!n) throw Error("清单名不能为空");
		let r = {
			id: vS(),
			name: n,
			color: t || lS[this.state.lists.length % lS.length],
			order: this.nextListOrder()
		};
		return this.state.lists.push(r), this.persistLists(), this.emit(), r;
	}
	updateList(e, t = {}) {
		let n = this.listById(e);
		if (!n) throw Error(`找不到清单 ${e}`);
		return typeof t.name == "string" && t.name.trim() && (n.name = t.name.trim()), typeof t.color == "string" && t.color && (n.color = t.color), this.persistLists(), this.emit(), n;
	}
	removeList(e) {
		let t = this.listById(e);
		if (!t) throw Error(`找不到清单 ${e}`);
		if (this.state.lists.length <= 1) throw Error("至少保留一个清单");
		this.state.lists = this.state.lists.filter((t) => t.id !== e);
		let n = this.state.tasks.filter((t) => t.listId === e).map((e) => e.id);
		this.state.tasks = this.state.tasks.filter((t) => t.listId !== e);
		let r = {
			...hS(),
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
			id: vS(),
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
			...hS(),
			...this.state.settings.reminders || {}
		}, this.state.lists.some((e) => e.id === this.state.settings.defaultListId) || (this.state.settings.defaultListId = this.state.lists[0]?.id ?? null), this.persistSettings(), this.emit(), this.state.settings;
	}
	claimDueReminders(e = /* @__PURE__ */ new Date()) {
		let t = [], n = pS(cS.settings, null), r = n && typeof n == "object" ? n : {}, i = hS();
		for (let n of this.state.tasks) {
			if (n.done || !n.remindAt) continue;
			let r = Q(n.remindAt);
			!r || r > e || i[n.id] !== void 0 && _S(i[n.id], n.remindAt) || (i[n.id] = n.remindAt, t.push(n));
		}
		if (t.length) {
			let e = {
				...r,
				reminders: i
			};
			mS(cS.settings, e), this.state.settings = {
				...this.state.settings,
				...e,
				reminders: i
			};
		}
		return t;
	}
	clearFiredReminder(e) {
		let t = {
			...hS(),
			...this.state.settings.reminders || {}
		};
		e.id in t && (delete t[e.id], this.state.settings.reminders = t, this.persistSettings());
	}
	snoozeReminder(e, t = 6e5) {
		let n = this.taskById(e);
		if (!n) return null;
		n.remindAt = new Date(Date.now() + t).toISOString();
		let r = {
			...hS(),
			...this.state.settings.reminders || {}
		};
		return delete r[n.id], this.state.settings.reminders = r, this.persistSettings(), this.persistTasks(), this.emit(), n;
	}
	statsRange({ from: e, to: t } = {}) {
		let n = Q(e) || Ux(Hx(/* @__PURE__ */ new Date()), -30), r = Q(t) || /* @__PURE__ */ new Date(), i = this.state.tasks.filter((e) => {
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
			let t = Vx(e.doneAt);
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
function SS(e) {
	let t = e >>> 0;
	return () => {
		t = t + 1831565813 >>> 0;
		let e = t;
		return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function CS(e, t, n = 0) {
	let r = Ux(Hx(/* @__PURE__ */ new Date()), e);
	return new Date(r.getFullYear(), r.getMonth(), r.getDate(), t, n, 0, 0).toISOString();
}
function wS() {
	return new URLSearchParams(location.search).get("demo") === "1" && $.state.tasks.length === 0;
}
function TS() {
	let e = SS(20261018), [t, n, r] = [
		{
			name: "工作",
			color: "colorPaletteBlueForeground2"
		},
		{
			name: "生活",
			color: "colorPaletteGreenForeground2"
		},
		{
			name: "学习",
			color: "colorPaletteBerryForeground2"
		}
	].map((e) => $.addList(e.name, e.color)), i = {
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
		dueAt: CS(0, 17, 0),
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
	o && ($.completeSubtask(o.id, o.subtasks[0].id, !0), $.updateTask(o.id, { remindAt: CS(1, 9, 30) })), a({
		title: "和设计评审 Fluent 动效 token",
		listId: i.工作,
		priority: 2,
		dueAt: CS(0, 10, 30),
		tags: ["工作"],
		subtasks: ["准备动效示例", "确认 duration 档位"]
	}), a({
		title: "提交上周差旅报销单",
		listId: i.工作,
		priority: 2,
		dueAt: CS(-1, 23, 59),
		tags: ["工作"]
	}), a({
		title: "买牛奶和面包",
		listId: i.生活,
		priority: 1,
		dueAt: CS(0, 20, 0),
		tags: ["生活"]
	}), a({
		title: "背单词 20 个（每日）",
		listId: i.学习,
		priority: 1,
		dueAt: CS(0, 22, 0),
		recurrence: "daily",
		tags: ["学习", "健康"]
	}), a({
		title: "给妈妈打电话",
		listId: i.生活,
		priority: 0,
		dueAt: CS(0, 19, 30),
		tags: ["生活"]
	}), a({
		title: "准备下周一的方案初稿",
		listId: i.工作,
		priority: 3,
		dueAt: CS(1, 11, 0),
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
		dueAt: CS(1, 18, 30),
		tags: ["健康"]
	}), a({
		title: "读完《设计中的设计》第三章",
		listId: i.学习,
		priority: 0,
		dueAt: CS(1, 21, 0),
		tags: ["学习"]
	}), a({
		title: "每周复盘（每周）",
		listId: i.工作,
		priority: 2,
		dueAt: CS(1, 20, 0),
		recurrence: "weekly",
		tags: ["工作"]
	}), a({
		title: "预约牙医",
		listId: i.生活,
		priority: 1,
		dueAt: CS(3, 9, 0),
		tags: ["健康"]
	}), a({
		title: "季度目标对齐会",
		listId: i.工作,
		priority: 2,
		dueAt: CS(4, 14, 0),
		tags: ["工作"]
	}), a({
		title: "整理书桌和文件",
		listId: i.生活,
		priority: 0,
		dueAt: CS(6, 10, 0),
		tags: ["生活"]
	}), a({
		title: "学习 CSS Container Queries",
		listId: i.学习,
		priority: 1,
		dueAt: CS(8, 20, 0),
		tags: ["学习"]
	}), a({
		title: "给桌面插件写使用说明",
		listId: i.工作,
		priority: 2,
		dueAt: CS(12, 16, 0),
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
		let n = Ux(Hx(/* @__PURE__ */ new Date()), t), r = e(), o = 0;
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
				dueAt: CS(t, 9 + Math.floor(e() * 10), 0)
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
	}), $.emit(), console.info("[todo] 演示数据已注入：", $.state.tasks.length, "条任务，", Vx(/* @__PURE__ */ new Date()));
}
//#endregion
//#region public/plugins/todo/js/reminders.js
var ES = 5e3, DS = "wtsl.todo.reminders.claim", OS = /* @__PURE__ */ new Set();
function kS(e) {
	return `${e.id}@${gS(e.remindAt)}`;
}
async function AS() {
	let e = typeof navigator < "u" ? navigator.locks : null;
	if (!e || typeof e.request != "function") return $.claimDueReminders(/* @__PURE__ */ new Date());
	try {
		return await e.request(DS, { ifAvailable: !0 }, async (e) => e ? $.claimDueReminders(/* @__PURE__ */ new Date()) : null) ?? [];
	} catch (e) {
		return console.warn("[todo] 提醒锁不可用，回退到 localStorage 标记", e), $.claimDueReminders(/* @__PURE__ */ new Date());
	}
}
function jS() {
	let e = !1, t = !1, n = async () => {
		let e = [];
		try {
			e = await AS();
		} catch (e) {
			console.error("[todo] 提醒检查失败", e);
			return;
		}
		for (let t of e) {
			let e = kS(t);
			if (!OS.has(e)) {
				OS.add(e);
				try {
					await MS(t);
				} catch (e) {
					console.error("[todo] 提醒弹出失败", e);
				} finally {
					OS.delete(e);
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
	let a = setInterval(r, ES);
	return document.addEventListener("visibilitychange", i), window.addEventListener("focus", i), () => {
		e = !0, clearInterval(a), document.removeEventListener("visibilitychange", i), window.removeEventListener("focus", i);
	};
}
async function MS(t) {
	let n = $.listById(t.listId), r = n ? `待办提醒 · ${n.name}` : "待办提醒", i = `${t.title}${t.dueAt ? `（${eS(t.dueAt)}）` : ""}`, a = await e.showReminder({
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
var NS = "settings", PS = {
	showCompleted: !0,
	defaultSort: "manual",
	fontSize: "default",
	weekStart: 1
}, FS = uS.map((e) => ({
	value: e.value,
	label: e.label
})), IS = new Set(FS.map((e) => e.value));
function LS(e) {
	let t = e && typeof e == "object" && !Array.isArray(e) ? e : {};
	return {
		showCompleted: typeof t.showCompleted == "boolean" ? t.showCompleted : PS.showCompleted,
		defaultSort: IS.has(t.defaultSort) ? t.defaultSort : PS.defaultSort,
		fontSize: t.fontSize === "large" ? "large" : "default",
		weekStart: t.weekStart === 0 ? 0 : 1
	};
}
function RS(e, t) {
	switch (e) {
		case "showCompleted": return typeof t == "boolean" ? null : "showCompleted 需要是布尔值";
		case "defaultSort": return IS.has(t) ? null : `defaultSort 只能是 ${[...IS].join(" / ")}`;
		case "fontSize": return t === "default" || t === "large" ? null : "fontSize 只能是 default / large";
		case "weekStart": return t === 0 || t === 1 ? null : "weekStart 只能是 0（周日）或 1（周一）";
		default: return `未知设置项 ${e}`;
	}
}
function zS(e, t) {
	let n = e?.fontSize === "large" ? 100 : 0;
	return Math.min(600, t + n);
}
async function BS() {
	let t;
	try {
		t = await e.getConfig(NS);
	} catch {
		t = void 0;
	}
	return LS(t);
}
async function VS(t) {
	if (!t || typeof t != "object" || Array.isArray(t)) throw Error("settings.set 需要对象参数");
	let n = Object.keys(t);
	if (n.length === 0) throw Error("没有要修改的设置项");
	for (let e of n) {
		let n = RS(e, t[e]);
		if (n) throw Error(n);
	}
	let r = {};
	try {
		let t = await e.getConfig(NS);
		t && typeof t == "object" && !Array.isArray(t) && (r = t);
	} catch {
		r = {};
	}
	let i = {
		...r,
		...t
	};
	return await e.setConfig(NS, i), LS(i);
}
//#endregion
//#region public/plugins/todo/js/tools.js
function HS(e) {
	if (e !== void 0) return e === null || e === "" ? null : String(e);
}
function US(e) {
	let t = $.state.tasks.filter((t) => t.listId === e.id), n = t.filter((e) => e.done).length;
	return {
		...e,
		isDefault: $.settings.defaultListId === e.id,
		total: t.length,
		undone: t.length - n,
		done: n
	};
}
function WS(e) {
	if (!e) return null;
	let t = $.listById(e.listId);
	return {
		...e,
		listName: t?.name,
		listColor: t?.color
	};
}
function GS(e = {}) {
	if (e.patch && typeof e.patch == "object" && !Array.isArray(e.patch)) return e.patch;
	let t = {};
	for (let n of [
		"showCompleted",
		"defaultSort",
		"fontSize",
		"weekStart"
	]) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
	return t;
}
var KS = [
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
		description: "新建清单（可选 color：Fluent palette token 名）",
		parameters: {
			type: "object",
			properties: {
				name: { type: "string" },
				color: { type: "string" }
			},
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
		description: "读取待办设置（显示已完成 / 默认排序 / 字号 / 一周起始日）",
		parameters: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "todo.settings.set",
		description: "修改待办设置。patch 可含 showCompleted(boolean) / defaultSort(manual|due|priority|created) / fontSize(default|large) / weekStart(0=周日,1=周一)。",
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
					fontSize: {
						type: "string",
						enum: ["default", "large"]
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
async function qS(e, t = {}) {
	switch (e) {
		case "todo.lists": return $.lists.map(US);
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
			return t.tag && (e = e.filter((e) => e.tags.includes(t.tag))), t.query && (e = e.filter((e) => $.matchesQuery(e, t.query))), $.sortTasks(e, "due").map(WS);
		}
		case "todo.add":
			if (!t.title || !String(t.title).trim()) throw Error("title 不能为空");
			return WS($.addTask({
				title: t.title,
				listId: t.listId,
				priority: t.priority,
				dueAt: HS(t.dueAt),
				note: t.note,
				remindAt: HS(t.remindAt),
				recurrence: t.recurrence,
				tags: t.tags,
				subtasks: t.subtasks
			}));
		case "todo.update": {
			let e = { ...t };
			return delete e.id, "dueAt" in e && (e.dueAt = HS(e.dueAt)), "remindAt" in e && (e.remindAt = HS(e.remindAt)), WS($.updateTask(t.id, e));
		}
		case "todo.remove": return $.removeTask(t.id);
		case "todo.complete": return WS($.setDone(t.id, typeof t.done != "boolean" || t.done));
		case "todo.search": return $.searchTasks(t.query).map(WS);
		case "todo.addSubtask": return WS($.addSubtask(t.taskId, t.title));
		case "todo.completeSubtask": return WS($.completeSubtask(t.taskId, t.subtaskId, typeof t.done != "boolean" || t.done));
		case "todo.removeSubtask": return WS($.removeSubtask(t.taskId, t.subtaskId));
		case "todo.addList": return US($.addList(t.name, t.color));
		case "todo.renameList":
			if (!t.name || !String(t.name).trim()) throw Error("清单名不能为空");
			return US($.updateList(t.id, { name: t.name }));
		case "todo.removeList": return $.removeList(t.id);
		case "todo.setDefaultList": {
			let e = $.listById(t.id);
			if (!e) throw Error(`找不到清单 ${t.id}`);
			return $.updateSettings({ defaultListId: e.id }), US(e);
		}
		case "todo.clearCompleted": return { removed: $.clearCompleted({ listId: t.listId }) };
		case "todo.stats": return $.statsRange({
			from: t.from,
			to: t.to
		});
		case "todo.settings.get": return BS();
		case "todo.settings.set": {
			let e = GS(t);
			if (Object.keys(e).length === 0) throw Error("没有要修改的设置项");
			return VS(e);
		}
		default: throw Error(`未知工具 ${e}`);
	}
}
async function JS(e, t) {
	try {
		return {
			ok: !0,
			result: await qS(e, t || {})
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
var YS = !1, XS = 0;
$.subscribe(() => {
	XS += 1;
});
function ZS({ startReminders: e = !0 } = {}) {
	if (YS) return $;
	YS = !0, $.load();
	try {
		wS() && TS();
	} catch (e) {
		console.warn("[todo] 演示数据注入失败", e);
	}
	return $.bindStorageSync(), e && jS(), $;
}
function QS() {
	return (0, N.useSyncExternalStore)((e) => $.subscribe(e), () => XS, () => XS), $;
}
function $S() {
	Ax("detail", "待办详情");
}
function eC() {
	jx();
}
function tC() {
	let e = {};
	for (let t of KS) e[t.name] = async (e) => {
		let { ok: n, result: r, error: i } = await JS(t.name, e);
		if (!n) throw Error(i);
		return r;
	};
	return e;
}
//#endregion
//#region public/plugins/todo/src/sizes.js
var nC = {
	"1x1": [1, 1],
	"2x2": [2, 2],
	"3x2": [3, 2],
	"3x3": [3, 3],
	"4x2": [4, 2]
};
function rC(e) {
	switch (e) {
		case "1x1": return "summary";
		case "2x2": return "mini";
		case "3x2": return "medium";
		case "4x2": return "wide";
		default: return "full";
	}
}
function iC(e) {
	switch (e) {
		case "2x2": return 4;
		case "3x2": return 5;
		case "3x3": return 8;
		case "4x2": return 5;
		default: return 0;
	}
}
function aC(e) {
	if (!e) return null;
	let t = /^(\d+)\s*[x×,]\s*(\d+)$/i.exec(String(e).trim());
	return t ? [Number(t[1]), Number(t[2])] : null;
}
function oC(e) {
	if (!Array.isArray(e) || e.length < 2) return "3x3";
	let t = `${Number(e[0])}x${Number(e[1])}`;
	if (nC[t]) return t;
	let n = Number(e[0]), r = Number(e[1]);
	return n <= 1 && r <= 1 ? "1x1" : r >= 3 ? "3x3" : n >= 4 ? "4x2" : n >= 3 ? "3x2" : "2x2";
}
function sC(e) {
	let t = nC[e] || nC["3x3"];
	return {
		width: t[0] * 180,
		height: t[1] * 180
	};
}
//#endregion
//#region public/plugins/_shared/motion.js
var cC = "(prefers-reduced-motion: reduce)", lC = "8px", uC = "4px", dC = "48px";
function fC() {
	return typeof window > "u" || typeof window.matchMedia != "function" ? null : window.matchMedia(cC);
}
function pC() {
	let [e, t] = (0, N.useState)(() => !!fC()?.matches);
	return (0, N.useEffect)(() => {
		let e = fC();
		if (!e) return;
		let n = () => t(e.matches);
		return n(), typeof e.addEventListener == "function" ? (e.addEventListener("change", n), () => e.removeEventListener("change", n)) : (e.addListener(n), () => e.removeListener(n));
	}, []), e;
}
function mC(e, t) {
	switch (e) {
		case "down": return `0px -${t}`;
		case "left": return `${t} 0px`;
		case "right": return `-${t} 0px`;
		default: return `0px ${t}`;
	}
}
function hC(e, t = J.durationFaster, n = J.curveAccelerateMin) {
	return ({ direction: r = "up" }) => ({
		enter: {
			keyframes: [{
				opacity: 0,
				translate: mC(r, e)
			}, {
				opacity: 1,
				translate: "0px 0px"
			}],
			duration: J.durationNormal,
			easing: J.curveDecelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 0 }, { opacity: 1 }],
				duration: J.durationFaster,
				easing: J.curveDecelerateMid
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
				duration: J.durationFaster,
				easing: J.curveAccelerateMid
			}
		}
	});
}
var gC = Cd(hC(lC)), _C = Cd(hC(uC, J.durationFast, J.curveAccelerateMid)), vC = Cd(({ element: e }) => {
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
			duration: J.durationNormal,
			easing: J.curveDecelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 0 }, { opacity: 1 }],
				duration: J.durationFaster,
				easing: J.curveDecelerateMid
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
			duration: J.durationFast,
			easing: J.curveAccelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 1 }, { opacity: 0 }],
				duration: J.durationFaster,
				easing: J.curveAccelerateMid
			}
		}
	};
});
function yC({ value: e, direction: t = "up", children: n, className: r, style: i }) {
	let a = e == null ? "default" : String(e);
	return (0, N.createElement)("div", {
		className: r,
		style: {
			display: "grid",
			minWidth: 0,
			...i
		},
		"data-cross-fade": a
	}, (0, N.createElement)(kd, null, (0, N.createElement)(_C, {
		key: a,
		direction: t
	}, (0, N.createElement)("div", { style: {
		gridArea: "1 / 1",
		minWidth: 0
	} }, n))));
}
var bC = Cd(({ direction: e = "forward" }) => {
	let t = e === "back", n = t ? `-${dC} 0px` : `${dC} 0px`, r = t ? `${dC} 0px` : `-${dC} 0px`;
	return {
		enter: {
			keyframes: [{
				opacity: 0,
				translate: n
			}, {
				opacity: 1,
				translate: "0px 0px"
			}],
			duration: J.durationGentle,
			easing: J.curveDecelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 0 }, { opacity: 1 }],
				duration: J.durationFaster,
				easing: J.curveDecelerateMid
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
			duration: J.durationNormal,
			easing: J.curveAccelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 1 }, { opacity: 0 }],
				duration: J.durationFaster,
				easing: J.curveAccelerateMid
			}
		}
	};
}), xC = {
	press: ["durationUltraFast", "curveAccelerateMin"],
	hoverEnter: ["durationFaster", "curveDecelerateMin"],
	hoverLeave: ["durationFaster", "curveAccelerateMin"],
	exit: ["durationFast", "curveAccelerateMid"],
	normal: ["durationNormal", "curveDecelerateMid"],
	gentle: ["durationGentle", "curveDecelerateMid"],
	slow: ["durationSlow", "curveDecelerateMid"],
	longPress: ["durationUltraSlow", "curveLinear"]
};
function SC(e = "normal") {
	let [t, n] = xC[e] ?? xC.normal;
	return {
		transitionDuration: `${J[t]}ms`,
		transitionTimingFunction: J[n]
	};
}
function CC(e = "normal") {
	let t = pC();
	return (0, N.useMemo)(() => t ? {
		transitionDuration: `${J.durationFaster}ms`,
		transitionTimingFunction: J.curveDecelerateMin
	} : SC(e), [e, t]);
}
//#endregion
//#region public/plugins/_shared/typography.js
var wC = {
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
function TC(e) {
	let t = wC[e];
	if (!t) throw Error(`Display XL 只定义了 48/80/96/112，收到 ${String(e)}`);
	return t;
}
var EC = { fontVariantNumeric: "tabular-nums" }, DC = 40, OC = 44, kC = 56, AC = 48, jC = 40, MC = 56, NC = {
	minWidth: DC,
	minHeight: DC
}, PC = [
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
function FC(e, t) {
	if (!(t instanceof Element)) return !1;
	let n = t.closest(PC);
	return !!(n && n !== e && e.contains(n));
}
var IC = qn({ root: {
	position: "relative",
	display: "flex",
	flexDirection: "column",
	width: "100%",
	height: "100%",
	minWidth: 0,
	minHeight: 0,
	overflow: "hidden",
	boxSizing: "border-box",
	color: W.colorNeutralForeground1,
	fontFamily: W.fontFamilyBase
} });
function LC({ onActivate: e, ariaLabel: t, className: n, style: r, children: i, ...a }) {
	let o = IC(), s = Ix(), c = (0, N.useCallback)((t) => {
		FC(t.currentTarget, t.target) || e?.(t);
	}, [e]), l = (0, N.useCallback)((t) => {
		(t.key === "Enter" || t.key === " ") && (FC(t.currentTarget, t.target) || (t.preventDefault(), e?.(t)));
	}, [e]);
	return /* @__PURE__ */ (0, P.jsx)("div", {
		...a,
		ref: s.ref,
		role: "button",
		tabIndex: 0,
		"aria-label": t,
		className: k(o.root, n),
		style: r,
		"data-card-root": "true",
		onClick: c,
		onKeyDown: l,
		children: i
	});
}
qn({
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "space-between",
		gap: W.spacingHorizontalS,
		minHeight: W.lineHeightBase200,
		color: W.colorNeutralForeground3
	},
	title: {
		minWidth: 0,
		color: W.colorNeutralForeground3
	},
	trailing: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		gap: W.spacingHorizontalXS
	}
});
var RC = {
	blue: {
		foreground: "colorPaletteBlueForeground2",
		background: "colorPaletteBlueBackground2"
	},
	pink: {
		foreground: "colorPalettePinkForeground2",
		background: "colorPalettePinkBackground2"
	},
	orange: {
		foreground: "colorPaletteOrangeForeground2",
		background: "colorPaletteOrangeBackground2"
	},
	green: {
		foreground: "colorPaletteGreenForeground2",
		background: "colorPaletteGreenBackground2"
	},
	purple: {
		foreground: "colorPalettePurpleForeground2",
		background: "colorPalettePurpleBackground2"
	},
	teal: {
		foreground: "colorPaletteTealForeground2",
		background: "colorPaletteTealBackground2"
	}
}, zC = qn({
	root: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: W.spacingHorizontalXS,
		minWidth: 0
	},
	chip: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "center",
		width: "24px",
		height: "24px",
		borderRadius: W.borderRadiusSmall
	},
	label: {
		minWidth: 0,
		color: W.colorNeutralForeground3
	},
	trailing: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		gap: W.spacingHorizontalXS,
		marginInlineStart: "auto",
		color: W.colorNeutralForeground3
	}
});
function BC({ icon: e, label: t, accent: n = "blue", trailing: r, compact: i = !1, className: a, style: o }) {
	let s = zC(), c = RC[n] ?? RC.blue;
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: k(s.root, a),
		style: o,
		"data-card-identity": n,
		children: [
			/* @__PURE__ */ (0, P.jsx)("span", {
				className: s.chip,
				style: {
					color: `var(--${c.foreground})`,
					backgroundColor: `var(--${c.background})`
				},
				"aria-hidden": "true",
				children: e
			}),
			!i && t ? /* @__PURE__ */ (0, P.jsx)(Z, {
				size: 200,
				weight: "semibold",
				truncate: !0,
				wrap: !1,
				className: s.label,
				children: t
			}) : null,
			r ? /* @__PURE__ */ (0, P.jsx)("div", {
				className: s.trailing,
				children: r
			}) : null
		]
	});
}
var VC = qn({
	root: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: W.spacingVerticalXXS,
		minWidth: 0
	},
	valueRow: {
		display: "flex",
		alignItems: "baseline",
		gap: W.spacingHorizontalXS,
		minWidth: 0
	},
	value: {
		...EC,
		fontWeight: "600",
		color: W.colorNeutralForeground1,
		whiteSpace: "nowrap"
	},
	size48: TC(48),
	size68: {
		fontSize: W.fontSizeHero1000,
		lineHeight: W.lineHeightHero1000
	},
	size80: TC(80),
	size96: TC(96),
	size112: TC(112),
	unit: { color: W.colorNeutralForeground2 },
	meta: {
		display: "flex",
		flexDirection: "column",
		gap: W.spacingVerticalXXS,
		minWidth: 0
	},
	label: { color: W.colorNeutralForeground2 },
	caption: { color: W.colorNeutralForeground3 }
}), HC = {
	48: "size48",
	68: "size68",
	80: "size80",
	96: "size96",
	112: "size112"
};
function UC({ value: e, unit: t, label: n, caption: r, size: i = 48, className: a, style: o }) {
	let s = VC(), c = s[HC[i] ?? "size48"];
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: k(s.root, a),
		style: o,
		children: [/* @__PURE__ */ (0, P.jsxs)("div", {
			className: s.valueRow,
			children: [/* @__PURE__ */ (0, P.jsx)("span", {
				className: k(s.value, c),
				children: e
			}), t ? /* @__PURE__ */ (0, P.jsx)(Z, {
				size: 300,
				className: s.unit,
				children: t
			}) : null]
		}), n || r ? /* @__PURE__ */ (0, P.jsxs)("div", {
			className: s.meta,
			children: [n ? /* @__PURE__ */ (0, P.jsx)(Z, {
				size: 300,
				className: s.label,
				children: n
			}) : null, r ? /* @__PURE__ */ (0, P.jsx)(Z, {
				size: 200,
				className: s.caption,
				children: r
			}) : null]
		}) : null]
	});
}
var WC = qn({
	row: {
		display: "flex",
		alignItems: "center",
		gap: W.spacingHorizontalS,
		width: "100%",
		minHeight: `${OC}px`,
		boxSizing: "border-box",
		paddingInline: 0,
		border: "none",
		background: "transparent",
		color: W.colorNeutralForeground1,
		fontFamily: W.fontFamilyBase,
		textAlign: "left",
		borderRadius: W.borderRadiusMedium
	},
	interactive: {
		cursor: "pointer",
		":hover": { backgroundColor: W.colorNeutralBackground1Hover },
		":active": { backgroundColor: W.colorNeutralBackground1Pressed }
	},
	selected: { backgroundColor: W.colorNeutralBackground1Selected },
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
		gap: W.spacingVerticalXXS,
		minWidth: 0
	},
	title: {
		minWidth: 0,
		color: W.colorNeutralForeground1
	},
	subtitle: {
		minWidth: 0,
		color: W.colorNeutralForeground3
	},
	trailing: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		gap: W.spacingHorizontalXS
	}
});
function GC({ leading: e, title: t, subtitle: n, trailing: r, onClick: i, selected: a = !1, titleSize: o = 300, className: s, style: c, ...l }) {
	let u = WC(), d = (e) => {
		i && (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && (e.preventDefault(), i(e));
	};
	return /* @__PURE__ */ (0, P.jsxs)("div", {
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
			e ? /* @__PURE__ */ (0, P.jsx)("div", {
				className: u.leading,
				children: e
			}) : null,
			/* @__PURE__ */ (0, P.jsxs)("div", {
				className: u.main,
				children: [t ? /* @__PURE__ */ (0, P.jsx)(Z, {
					size: o,
					truncate: !0,
					wrap: !1,
					className: u.title,
					children: t
				}) : null, n ? /* @__PURE__ */ (0, P.jsx)(Z, {
					size: 200,
					truncate: !0,
					wrap: !1,
					className: u.subtitle,
					children: n
				}) : null]
			}),
			r ? /* @__PURE__ */ (0, P.jsx)("div", {
				className: u.trailing,
				children: r
			}) : null
		]
	});
}
var KC = qn({
	root: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: W.spacingVerticalS,
		padding: W.spacingVerticalXXL,
		textAlign: "center"
	},
	icon: {
		display: "inline-flex",
		color: W.colorNeutralForeground3
	},
	iconChip: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: "48px",
		height: "48px",
		borderRadius: W.borderRadiusLarge
	},
	title: { color: W.colorNeutralForeground1 },
	description: {
		maxWidth: "42ch",
		color: W.colorNeutralForeground3
	},
	action: { marginTop: W.spacingVerticalS }
});
function qC({ icon: e, iconAccent: t, title: n, description: r, action: i, className: a, style: o }) {
	let s = KC(), c = t ? RC[t] ?? RC.blue : null;
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: k(s.root, a),
		style: o,
		"data-empty-state": "true",
		children: [
			e ? /* @__PURE__ */ (0, P.jsx)("div", {
				className: c ? s.iconChip : s.icon,
				style: c ? {
					color: `var(--${c.foreground})`,
					backgroundColor: `var(--${c.background})`
				} : void 0,
				children: e
			}) : null,
			n ? /* @__PURE__ */ (0, P.jsx)(Z, {
				size: 400,
				weight: "semibold",
				className: s.title,
				children: n
			}) : null,
			r ? /* @__PURE__ */ (0, P.jsx)(Z, {
				size: 300,
				className: s.description,
				children: r
			}) : null,
			i ? /* @__PURE__ */ (0, P.jsx)("div", {
				className: s.action,
				children: i
			}) : null
		]
	});
}
var JC = qn({ button: {
	minWidth: `${DC}px`,
	minHeight: `${DC}px`
} }), YC = (0, N.forwardRef)(function({ appearance: e = "secondary", className: t, style: n, children: r, ...i }, a) {
	let o = JC();
	return /* @__PURE__ */ (0, P.jsx)(zh, {
		...i,
		ref: a,
		type: "button",
		appearance: e,
		size: "large",
		className: k(o.button, t),
		style: n,
		children: r
	});
}), XC = YC, ZC = qn({ root: {
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
	color: W.colorNeutralForeground1,
	fontFamily: W.fontFamilyBase
} });
function QC({ children: e, className: t, style: n }) {
	let r = ZC();
	return /* @__PURE__ */ (0, P.jsx)("div", {
		className: k(r.root, t),
		style: n,
		"data-detail-page": "true",
		children: e
	});
}
var $C = qn({
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "space-between",
		gap: W.spacingHorizontalM,
		minHeight: `${kC}px`,
		paddingInline: W.spacingHorizontalXXL,
		boxSizing: "border-box"
	},
	leading: {
		display: "flex",
		flex: 1,
		alignItems: "center",
		gap: W.spacingHorizontalM,
		minWidth: 0
	},
	trailing: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: W.spacingHorizontalS
	}
});
function ew({ children: e, trailing: t, className: n, style: r }) {
	let i = $C();
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: k(i.header, n),
		style: r,
		"data-detail-header": "true",
		children: [/* @__PURE__ */ (0, P.jsx)("div", {
			className: i.leading,
			children: e
		}), t ? /* @__PURE__ */ (0, P.jsx)("div", {
			className: i.trailing,
			children: t
		}) : null]
	});
}
var tw = qn({ toolbar: {
	display: "flex",
	flexShrink: 0,
	alignItems: "center",
	gap: W.spacingHorizontalS,
	minHeight: `${AC}px`,
	paddingInline: W.spacingHorizontalXXL,
	boxSizing: "border-box"
} });
function nw({ children: e, className: t, style: n }) {
	let r = tw();
	return /* @__PURE__ */ (0, P.jsx)("div", {
		className: k(r.toolbar, t),
		style: n,
		"data-detail-toolbar": "true",
		children: e
	});
}
var rw = qn({
	tabs: {
		flexShrink: 0,
		height: `${jC}px`,
		minHeight: `${jC}px`,
		paddingInline: W.spacingHorizontalXXL,
		boxSizing: "border-box",
		overflowX: "auto"
	},
	tab: {
		height: `${jC}px`,
		minHeight: `${jC}px`,
		paddingBlock: 0
	},
	badge: { marginInlineStart: W.spacingHorizontalXS }
});
function iw({ items: e, value: t, onChange: n, ariaLabel: r, className: i, style: a }) {
	let o = rw();
	return !e || e.length === 0 ? null : /* @__PURE__ */ (0, P.jsx)(Iy, {
		size: "medium",
		selectedValue: t,
		onTabSelect: (e, t) => n?.(t.value),
		"aria-label": r,
		className: k(o.tabs, i),
		style: a,
		"data-detail-tabs": "true",
		children: e.map((e) => /* @__PURE__ */ (0, P.jsxs)(ob, {
			value: e.value,
			className: o.tab,
			children: [e.label, e.badge ? /* @__PURE__ */ (0, P.jsx)("span", {
				className: o.badge,
				children: (0, N.isValidElement)(e.badge) ? e.badge : /* @__PURE__ */ (0, P.jsx)(Kd, {
					appearance: "tint",
					size: "medium",
					children: e.badge
				})
			}) : null]
		}, e.value))
	});
}
var aw = qn({
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
		paddingBlock: W.spacingVerticalXXL,
		paddingInline: W.spacingHorizontalXXL,
		boxSizing: "border-box",
		overscrollBehavior: "contain",
		scrollbarWidth: "thin"
	},
	scrollShadow: {
		position: "absolute",
		right: 0,
		bottom: 0,
		left: 0,
		height: W.spacingVerticalXXL,
		pointerEvents: "none",
		background: `linear-gradient(to top, ${W.colorNeutralBackground1} 0%, color-mix(in srgb, ${W.colorNeutralBackground1} 72%, transparent) 55%, transparent 100%)`,
		opacity: 0
	},
	scrollShadowVisible: { opacity: 1 }
});
function ow(e) {
	let [t, n] = (0, N.useState)(!1);
	return (0, N.useEffect)(() => {
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
function sw({ children: e, className: t, style: n }) {
	let r = aw(), i = (0, N.useRef)(null), a = ow(i);
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: r.wrap,
		"data-scroll-more": a ? "true" : "false",
		children: [/* @__PURE__ */ (0, P.jsx)("div", {
			ref: i,
			className: k(r.scroll, t),
			style: n,
			"data-detail-scroll": "true",
			children: e
		}), /* @__PURE__ */ (0, P.jsx)("div", {
			"aria-hidden": "true",
			"data-scroll-shadow": a ? "visible" : "hidden",
			className: k(r.scrollShadow, a && r.scrollShadowVisible)
		})]
	});
}
var cw = (0, N.createContext)(null), lw = qn({
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
		backgroundColor: W.colorNeutralBackground1,
		color: W.colorNeutralForeground1,
		fontFamily: W.fontFamilyBase
	},
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: W.spacingHorizontalS,
		minHeight: `${MC}px`,
		paddingInline: W.spacingHorizontalXXL,
		boxSizing: "border-box"
	},
	title: {
		flex: 1,
		minWidth: 0,
		color: W.colorNeutralForeground1
	},
	trailing: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: W.spacingHorizontalS
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
		paddingBlock: W.spacingVerticalXXL,
		paddingInline: W.spacingHorizontalXXL,
		boxSizing: "border-box",
		overscrollBehavior: "contain",
		scrollbarWidth: "thin"
	},
	scrollShadow: {
		position: "absolute",
		right: 0,
		bottom: 0,
		left: 0,
		height: W.spacingVerticalXXL,
		pointerEvents: "none",
		background: `linear-gradient(to top, ${W.colorNeutralBackground1} 0%, color-mix(in srgb, ${W.colorNeutralBackground1} 72%, transparent) 55%, transparent 100%)`,
		opacity: 0
	},
	scrollShadowVisible: { opacity: 1 },
	footer: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "flex-end",
		gap: W.spacingHorizontalS,
		paddingBlock: W.spacingVerticalM,
		paddingInline: W.spacingHorizontalXXL,
		boxSizing: "border-box"
	}
});
function uw({ title: e, trailing: t, footer: n, children: r, onClosed: i, backLabel: a = "返回", className: o, style: s }) {
	let c = lw(), l = (0, N.useRef)(null), u = ow(l), [d, f] = (0, N.useState)(!0), [p, m] = (0, N.useState)("forward"), [h, g] = (0, N.useState)(!0), _ = (0, N.useRef)(!1), v = (0, N.useCallback)(() => {
		_.current || (_.current = !0, m("back"), f(!1));
	}, []), y = (0, N.useCallback)((e, t) => {
		t?.direction === "exit" && (g(!1), i?.());
	}, [i]);
	if (!h) return null;
	let b = typeof n == "function" ? n(v) : n;
	return /* @__PURE__ */ (0, P.jsx)(cw.Provider, {
		value: v,
		children: /* @__PURE__ */ (0, P.jsx)(bC, {
			visible: d,
			appear: !0,
			direction: p,
			unmountOnExit: !0,
			onMotionFinish: y,
			children: /* @__PURE__ */ (0, P.jsxs)("div", {
				className: k(c.root, o),
				style: s,
				"data-subpage": "true",
				children: [
					/* @__PURE__ */ (0, P.jsxs)("div", {
						className: c.header,
						"data-subpage-header": "true",
						children: [
							/* @__PURE__ */ (0, P.jsx)(zh, {
								appearance: "subtle",
								size: "large",
								icon: /* @__PURE__ */ (0, P.jsx)(Wu, {}),
								"aria-label": a,
								title: a,
								onClick: v,
								style: NC
							}),
							/* @__PURE__ */ (0, P.jsx)(Z, {
								size: 400,
								weight: "semibold",
								truncate: !0,
								wrap: !1,
								className: c.title,
								children: e
							}),
							t ? /* @__PURE__ */ (0, P.jsx)("div", {
								className: c.trailing,
								children: t
							}) : null
						]
					}),
					/* @__PURE__ */ (0, P.jsxs)("div", {
						className: c.contentWrap,
						"data-subpage-scroll-more": u ? "true" : "false",
						children: [/* @__PURE__ */ (0, P.jsx)("div", {
							ref: l,
							className: c.content,
							children: r
						}), /* @__PURE__ */ (0, P.jsx)("div", {
							"aria-hidden": "true",
							"data-subpage-scroll-shadow": u ? "visible" : "hidden",
							className: k(c.scrollShadow, u && c.scrollShadowVisible)
						})]
					}),
					b ? /* @__PURE__ */ (0, P.jsx)("div", {
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
var dw = 40, fw = qn({
	ellipsis: {
		display: "block",
		minWidth: 0,
		maxWidth: "100%",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap"
	},
	groupHead: {
		display: "flex",
		alignItems: "center",
		gap: W.spacingHorizontalS,
		minHeight: W.lineHeightBase300,
		paddingBlock: W.spacingVerticalXS,
		minWidth: 0
	},
	groupLabel: {
		color: W.colorNeutralForeground2,
		whiteSpace: "nowrap"
	},
	groupCount: {
		color: W.colorNeutralForeground3,
		fontVariantNumeric: "tabular-nums"
	},
	spacer: {
		flex: 1,
		minWidth: 0
	},
	groupActions: {
		display: "inline-flex",
		alignItems: "center",
		gap: W.spacingHorizontalXS,
		flexShrink: 0
	},
	row: { minWidth: 0 },
	leading: {
		display: "inline-flex",
		alignItems: "center",
		gap: W.spacingHorizontalXS
	},
	checkCell: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		minWidth: `${dw}px`,
		minHeight: `${dw}px`
	},
	flag: { flexShrink: 0 },
	flagHigh: { color: W.colorPaletteRedForeground1 },
	flagMedium: { color: W.colorPaletteMarigoldForeground1 },
	flagLow: { color: W.colorPaletteBlueForeground2 },
	meta: {
		color: W.colorNeutralForeground3,
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	metaAlert: { color: W.colorPaletteRedForeground2 },
	rowTrailing: {
		display: "inline-flex",
		alignItems: "center",
		gap: W.spacingHorizontalXS
	},
	iconButton: {
		minWidth: `${dw}px`,
		minHeight: `${dw}px`
	},
	confirmRow: {
		display: "flex",
		alignItems: "center",
		gap: W.spacingHorizontalS,
		minHeight: W.spacingVerticalXXXL,
		paddingBlock: W.spacingVerticalXXS,
		minWidth: 0
	},
	confirmText: {
		flex: 1,
		minWidth: 0,
		color: W.colorNeutralForeground2
	},
	miniRow: {
		display: "flex",
		alignItems: "center",
		gap: W.spacingHorizontalXXS,
		minHeight: "44px",
		minWidth: 0,
		borderRadius: W.borderRadiusMedium,
		cursor: "pointer",
		":hover": { backgroundColor: W.colorNeutralBackground1Hover }
	},
	miniTitle: {
		flex: 1,
		minWidth: 0,
		color: W.colorNeutralForeground1
	},
	dot: {
		width: W.spacingHorizontalM,
		height: W.spacingHorizontalM,
		borderRadius: W.borderRadiusCircular,
		flexShrink: 0
	}
});
function pw(e) {
	return `var(--${e || "colorPaletteBlueForeground2"})`;
}
function mw({ children: e }) {
	let t = fw();
	return /* @__PURE__ */ (0, P.jsx)("span", {
		className: t.ellipsis,
		children: e
	});
}
function hw({ priority: e, className: t }) {
	let n = fw();
	if (!e) return null;
	let r = sS(e), i = e >= 3 ? n.flagHigh : e === 2 ? n.flagMedium : n.flagLow;
	return /* @__PURE__ */ (0, P.jsx)(Uu, {
		"aria-label": `优先级：${r.label}`,
		className: k(n.flag, i, t)
	});
}
function gw({ task: e, now: t, className: n }) {
	let r = fw(), i = Q(e.dueAt);
	if (!i) return null;
	let a = i < Hx(t), o = a ? `已逾期 · ${$x(i, t)}` : eS(i, t);
	return /* @__PURE__ */ (0, P.jsx)(Z, {
		size: 200,
		truncate: !0,
		className: k(r.meta, a && r.metaAlert, n),
		children: o
	});
}
function _w({ task: e, onToggle: t }) {
	let n = fw();
	return /* @__PURE__ */ (0, P.jsx)("span", {
		className: n.checkCell,
		children: /* @__PURE__ */ (0, P.jsx)(wg, {
			checked: e.done,
			"aria-label": e.done ? `取消完成：${e.title}` : `完成：${e.title}`,
			onChange: () => t(e.id),
			onClick: (e) => e.stopPropagation(),
			onPointerDown: (e) => e.stopPropagation()
		})
	});
}
function vw({ label: e, count: t, trailing: n }) {
	let r = fw();
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: r.groupHead,
		children: [
			/* @__PURE__ */ (0, P.jsx)(Z, {
				size: 300,
				weight: "semibold",
				className: r.groupLabel,
				children: e
			}),
			typeof t == "number" ? /* @__PURE__ */ (0, P.jsx)(Z, {
				size: 200,
				className: r.groupCount,
				children: t
			}) : null,
			/* @__PURE__ */ (0, P.jsx)("span", { className: r.spacer }),
			n ? /* @__PURE__ */ (0, P.jsx)("div", {
				className: r.groupActions,
				children: n
			}) : null
		]
	});
}
function yw({ task: e, now: t, settings: n, onOpen: r, onToggle: i, onRemove: a }) {
	let o = fw(), [s, c] = (0, N.useState)(!1), l = CC("normal"), u = e.done ? .55 : 1;
	return s ? /* @__PURE__ */ (0, P.jsxs)("div", {
		className: o.confirmRow,
		role: "group",
		"aria-label": `确认删除任务 ${e.title}`,
		children: [
			/* @__PURE__ */ (0, P.jsx)(Z, {
				size: 300,
				className: o.confirmText,
				children: /* @__PURE__ */ (0, P.jsxs)(mw, { children: [
					"删除「",
					e.title,
					"」？删除后不可恢复"
				] })
			}),
			/* @__PURE__ */ (0, P.jsx)(YC, {
				appearance: "secondary",
				onClick: () => c(!1),
				children: "取消"
			}),
			/* @__PURE__ */ (0, P.jsx)(YC, {
				appearance: "primary",
				onClick: () => {
					c(!1), a?.(e.id);
				},
				children: "删除"
			})
		]
	}) : /* @__PURE__ */ (0, P.jsx)(GC, {
		className: o.row,
		leading: /* @__PURE__ */ (0, P.jsxs)("span", {
			className: o.leading,
			children: [/* @__PURE__ */ (0, P.jsx)(_w, {
				task: e,
				onToggle: i
			}), /* @__PURE__ */ (0, P.jsx)(hw, { priority: e.priority })]
		}),
		title: /* @__PURE__ */ (0, P.jsx)(mw, { children: e.title }),
		titleSize: zS(n, 400),
		trailing: /* @__PURE__ */ (0, P.jsxs)("span", {
			className: o.rowTrailing,
			children: [/* @__PURE__ */ (0, P.jsx)(gw, {
				task: e,
				now: t
			}), /* @__PURE__ */ (0, P.jsxs)(mv, { children: [/* @__PURE__ */ (0, P.jsx)(ey, {
				disableButtonEnhancement: !0,
				children: /* @__PURE__ */ (0, P.jsx)(Ch, {
					content: "任务操作",
					relationship: "label",
					children: /* @__PURE__ */ (0, P.jsx)(zh, {
						appearance: "subtle",
						size: "large",
						className: o.iconButton,
						icon: /* @__PURE__ */ (0, P.jsx)(Pu, {}),
						"aria-label": `任务操作：${e.title}`,
						onClick: (e) => e.stopPropagation()
					})
				})
			}), /* @__PURE__ */ (0, P.jsx)(Jv, { children: /* @__PURE__ */ (0, P.jsx)("div", {
				onClick: (e) => e.stopPropagation(),
				children: /* @__PURE__ */ (0, P.jsxs)(Vv, { children: [/* @__PURE__ */ (0, P.jsx)(Ov, {
					icon: /* @__PURE__ */ (0, P.jsx)(Hu, {}),
					onClick: () => r?.(e.id),
					children: "编辑"
				}), /* @__PURE__ */ (0, P.jsx)(Ov, {
					icon: /* @__PURE__ */ (0, P.jsx)(Qu, {}),
					onClick: () => c(!0),
					children: "删除"
				})] })
			}) })] })]
		}),
		onClick: () => r?.(e.id),
		style: {
			opacity: u,
			transitionProperty: "opacity",
			...l
		}
	});
}
function bw({ task: e, onOpen: t, onToggle: n }) {
	let r = fw();
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: r.miniRow,
		role: "button",
		tabIndex: 0,
		"aria-label": `${e.title}${e.done ? "（已完成）" : ""}`,
		onClick: () => t?.(e.id),
		onKeyDown: (n) => {
			n.target === n.currentTarget && (n.key === "Enter" || n.key === " ") && (n.preventDefault(), t?.(e.id));
		},
		children: [/* @__PURE__ */ (0, P.jsx)(_w, {
			task: e,
			onToggle: n
		}), /* @__PURE__ */ (0, P.jsx)(Z, {
			size: 200,
			className: r.miniTitle,
			children: /* @__PURE__ */ (0, P.jsx)(mw, { children: e.title })
		})]
	});
}
function xw({ color: e }) {
	let t = fw();
	return /* @__PURE__ */ (0, P.jsx)("span", {
		className: t.dot,
		style: { backgroundColor: pw(e) },
		"aria-hidden": "true"
	});
}
function Sw(e) {
	let t = (0, N.useRef)(null), n = e.join("|"), r = (0, N.useMemo)(() => {
		if (t.current === null) return /* @__PURE__ */ new Set();
		let n = t.current;
		return new Set(e.filter((e) => !n.has(e)));
	}, [n]);
	return (0, N.useEffect)(() => {
		t.current = new Set(e);
	}, [n]), r;
}
//#endregion
//#region public/plugins/todo/src/TodoCard.jsx
var Cw = qn({
	summary: {
		padding: W.spacingVerticalS,
		gap: W.spacingVerticalXS,
		justifyContent: "center",
		alignItems: "center"
	},
	metricCentered: {
		alignItems: "center",
		textAlign: "center"
	},
	danger: {
		color: W.colorPaletteRedForeground2,
		fontVariantNumeric: "tabular-nums"
	},
	mini: {
		padding: W.spacingVerticalM,
		gap: W.spacingVerticalS
	},
	medium: {
		paddingBlock: W.spacingVerticalM,
		paddingInline: W.spacingHorizontalL,
		gap: W.spacingVerticalS
	},
	full: {
		padding: W.spacingVerticalL,
		gap: W.spacingVerticalS
	},
	headerRow: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: W.spacingHorizontalXS,
		minWidth: 0
	},
	headerCount: {
		order: 2,
		marginInlineStart: "auto",
		flexShrink: 0,
		color: W.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	rows: {
		display: "flex",
		flexDirection: "column",
		gap: W.spacingVerticalXS,
		minWidth: 0,
		minHeight: 0
	},
	leading: {
		display: "inline-flex",
		alignItems: "center",
		gap: W.spacingHorizontalXS
	},
	checkCell: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		minWidth: "40px",
		minHeight: "40px"
	},
	emptyState: {
		flex: 1,
		minHeight: 0
	},
	emptyStateCompact: {
		padding: 0,
		gap: W.spacingVerticalXS
	},
	row: { minWidth: 0 }
});
function ww(e) {
	let t = Ux(Hx(e), 1);
	return $.state.tasks.filter((n) => {
		if (n.done || !n.dueAt) return !1;
		let r = Q(n.dueAt);
		return r ? r < t || Jx(r, e) : !1;
	});
}
function Tw({ task: e, onToggle: t }) {
	let n = Cw();
	return /* @__PURE__ */ (0, P.jsx)("span", {
		className: n.checkCell,
		children: /* @__PURE__ */ (0, P.jsx)(wg, {
			checked: e.done,
			"aria-label": `完成：${e.title}`,
			onChange: () => t(e.id),
			onClick: (e) => e.stopPropagation(),
			onPointerDown: (e) => e.stopPropagation()
		})
	});
}
function Ew({ styles: e, count: t }) {
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: e.headerRow,
		children: [/* @__PURE__ */ (0, P.jsxs)(Z, {
			size: 200,
			weight: "semibold",
			className: e.headerCount,
			children: ["今日 · ", t]
		}), /* @__PURE__ */ (0, P.jsx)(BC, {
			icon: /* @__PURE__ */ (0, P.jsx)(zu, {}),
			label: "待办",
			accent: "purple"
		})]
	});
}
function Dw({ defaultSizeKey: t = "3x3" }) {
	let n = Cw();
	QS();
	let r = Ex(oC, t), i = rC(r), a = iC(r), [o] = Ox(NS, PS, LS), s = /* @__PURE__ */ new Date(), c = $.sortTasks(ww(s), o.defaultSort), l = c.filter((e) => Q(e.dueAt) < Hx(s)).length, u = a > 0 ? c.slice(0, a) : [];
	Lx(KS, (0, N.useMemo)(() => tC(), [])), (0, N.useEffect)(() => e.onFocus(() => {
		let e = document.querySelector("[data-card-root]");
		(e?.querySelector("input[type=\"checkbox\"], button") || e)?.focus?.();
	}), []), (0, N.useEffect)(() => {
		let e = (e) => {
			e.key === "Escape" && (e.preventDefault(), Rx());
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, []);
	let d = (e) => {
		let t = $.taskById(e);
		t && $.setDone(e, !t.done);
	}, f = `今日待办 ${c.length} 项${l ? `，已逾期 ${l} 项` : ""}，点击打开详情`, p = /* @__PURE__ */ (0, P.jsx)(YC, {
		appearance: "primary",
		onClick: $S,
		children: "添加待办"
	});
	if (i === "summary") return c.length === 0 ? /* @__PURE__ */ (0, P.jsx)(LC, {
		ariaLabel: "今日没有待办，点击打开详情",
		onActivate: $S,
		className: n.summary,
		children: /* @__PURE__ */ (0, P.jsx)(qC, {
			className: n.emptyStateCompact,
			icon: /* @__PURE__ */ (0, P.jsx)(Bu, {}),
			iconAccent: "purple",
			title: "今日没有待办",
			action: p
		})
	}) : /* @__PURE__ */ (0, P.jsxs)(LC, {
		ariaLabel: f,
		onActivate: $S,
		className: n.summary,
		children: [
			/* @__PURE__ */ (0, P.jsx)(BC, {
				icon: /* @__PURE__ */ (0, P.jsx)(zu, {}),
				accent: "purple",
				compact: !0
			}),
			/* @__PURE__ */ (0, P.jsx)(UC, {
				value: c.length,
				label: "今日待办",
				size: 48,
				className: n.metricCentered
			}),
			l > 0 ? /* @__PURE__ */ (0, P.jsxs)(Z, {
				size: 200,
				className: n.danger,
				children: ["已逾期 ", l]
			}) : null
		]
	});
	let m = i === "mini" ? n.mini : i === "full" ? n.full : n.medium;
	return u.length === 0 ? /* @__PURE__ */ (0, P.jsxs)(LC, {
		ariaLabel: f,
		onActivate: $S,
		className: m,
		children: [/* @__PURE__ */ (0, P.jsx)(Ew, {
			styles: n,
			count: c.length
		}), /* @__PURE__ */ (0, P.jsx)(qC, {
			className: n.emptyState,
			icon: /* @__PURE__ */ (0, P.jsx)(Bu, {}),
			iconAccent: "purple",
			title: "今日没有待办",
			description: "添加任务后，卡片会按截止时间显示今日待办",
			action: p
		})]
	}) : /* @__PURE__ */ (0, P.jsxs)(LC, {
		ariaLabel: f,
		onActivate: $S,
		className: m,
		children: [/* @__PURE__ */ (0, P.jsx)(Ew, {
			styles: n,
			count: c.length
		}), /* @__PURE__ */ (0, P.jsx)("div", {
			className: n.rows,
			children: u.map((e) => /* @__PURE__ */ (0, P.jsx)(GC, {
				className: n.row,
				leading: /* @__PURE__ */ (0, P.jsxs)("span", {
					className: n.leading,
					children: [/* @__PURE__ */ (0, P.jsx)(Tw, {
						task: e,
						onToggle: d
					}), /* @__PURE__ */ (0, P.jsx)(hw, { priority: e.priority })]
				}),
				title: /* @__PURE__ */ (0, P.jsx)(mw, { children: e.title }),
				titleSize: zS(o, 400),
				trailing: /* @__PURE__ */ (0, P.jsx)(gw, {
					task: e,
					now: s
				})
			}, e.id))
		})]
	});
}
//#endregion
//#region public/plugins/todo/src/ListView.jsx
var Ow = qn({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: W.spacingVerticalXL,
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
		color: W.colorNeutralForeground3,
		paddingBlock: W.spacingVerticalS
	},
	clearConfirm: {
		display: "inline-flex",
		alignItems: "center",
		gap: W.spacingHorizontalXS
	},
	confirmText: { color: W.colorNeutralForeground3 }
});
function kw(e, t) {
	return $.sortTasks(e, t.defaultSort);
}
function Aw({ tasks: e, settings: t, now: n, newIds: r, removingId: i, onOpen: a, onToggle: o, onRequestRemove: s, onRemoved: c }) {
	let l = Ow();
	return e.map((e) => /* @__PURE__ */ (0, P.jsx)(gC, {
		visible: i !== e.id,
		appear: r.has(e.id),
		unmountOnExit: !0,
		onMotionFinish: (t, n) => {
			n?.direction === "exit" && i === e.id && ($.removeTask(e.id), c());
		},
		children: /* @__PURE__ */ (0, P.jsx)("div", {
			className: l.rowWrap,
			"data-task-id": e.id,
			"data-removing": i === e.id ? "true" : "false",
			children: /* @__PURE__ */ (0, P.jsx)(yw, {
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
function jw({ tasks: e, query: t, settings: n, now: r, listId: i, onOpenTask: a, onToggleTask: o, onAddTask: s, onClearSearch: c }) {
	let l = Ow(), [u, d] = (0, N.useState)(null), [f, p] = (0, N.useState)(!1), [m, h] = (0, N.useState)(!1), g = t.trim(), _ = g ? $.searchTasks(g).filter((e) => i === "all" || e.listId === i) : [], v = Hx(r), y = Ux(v, 1), b = e.filter((e) => !e.done), x = e.filter((e) => e.done), S = [
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
		t ? t < v ? C.overdue.tasks.push(e) : Jx(t, r) ? C.today.tasks.push(e) : Jx(t, y) ? C.tomorrow.tasks.push(e) : C.later.tasks.push(e) : C.nodate.tasks.push(e);
	}
	for (let e of S) e.tasks = kw(e.tasks, n);
	let w = $.sortTasks(x, "created").slice().sort((e, t) => (Q(t.doneAt)?.getTime() || 0) - (Q(e.doneAt)?.getTime() || 0)), T = S.filter((e) => e.tasks.length > 0), E = Sw(g ? _.map((e) => e.id) : T.flatMap((e) => e.tasks.map((e) => e.id)).concat(w.map((e) => e.id)));
	return g ? /* @__PURE__ */ (0, P.jsxs)("div", {
		className: l.root,
		children: [/* @__PURE__ */ (0, P.jsx)(vw, { label: `搜索结果 · ${_.length}` }), _.length === 0 ? /* @__PURE__ */ (0, P.jsx)(qC, {
			title: "没有匹配的任务",
			description: "换个关键词，或清除搜索回到全部任务",
			action: /* @__PURE__ */ (0, P.jsx)(XC, {
				onClick: c,
				children: "清除搜索"
			})
		}) : /* @__PURE__ */ (0, P.jsx)("div", {
			className: l.rows,
			children: /* @__PURE__ */ (0, P.jsx)(Aw, {
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
	}) : b.length === 0 && w.length === 0 ? /* @__PURE__ */ (0, P.jsx)(qC, {
		title: "还没有任务",
		description: "先加一条今天要做的事，完成后会自动收进已完成",
		action: /* @__PURE__ */ (0, P.jsx)(XC, {
			appearance: "primary",
			onClick: s,
			children: "添加任务"
		})
	}) : /* @__PURE__ */ (0, P.jsxs)("div", {
		className: l.root,
		children: [
			b.length === 0 ? /* @__PURE__ */ (0, P.jsx)(Z, {
				size: 300,
				className: l.muted,
				children: "没有未完成任务"
			}) : null,
			T.map((e) => /* @__PURE__ */ (0, P.jsxs)("section", {
				className: l.group,
				"aria-label": `${e.label}（${e.tasks.length}）`,
				children: [/* @__PURE__ */ (0, P.jsx)(vw, {
					label: e.label,
					count: e.tasks.length
				}), /* @__PURE__ */ (0, P.jsx)("div", {
					className: l.rows,
					children: /* @__PURE__ */ (0, P.jsx)(Aw, {
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
			n.showCompleted && w.length > 0 ? /* @__PURE__ */ (0, P.jsxs)("section", {
				className: l.group,
				"aria-label": `已完成（${w.length}）`,
				children: [/* @__PURE__ */ (0, P.jsx)(vw, {
					label: "已完成",
					count: w.length,
					trailing: m ? /* @__PURE__ */ (0, P.jsxs)("span", {
						className: l.clearConfirm,
						children: [
							/* @__PURE__ */ (0, P.jsxs)(Z, {
								size: 200,
								className: l.confirmText,
								children: [
									"清空 ",
									w.length,
									" 条？"
								]
							}),
							/* @__PURE__ */ (0, P.jsx)(XC, {
								appearance: "secondary",
								onClick: () => h(!1),
								children: "取消"
							}),
							/* @__PURE__ */ (0, P.jsx)(XC, {
								appearance: "primary",
								onClick: () => {
									$.clearCompleted({ listId: i === "all" ? void 0 : i }), h(!1);
								},
								children: "清空"
							})
						]
					}) : /* @__PURE__ */ (0, P.jsxs)(P.Fragment, { children: [/* @__PURE__ */ (0, P.jsx)(XC, {
						appearance: "subtle",
						onClick: () => p((e) => !e),
						"aria-expanded": f,
						children: f ? "收起" : "展开"
					}), /* @__PURE__ */ (0, P.jsx)(XC, {
						appearance: "subtle",
						onClick: () => h(!0),
						children: "清空"
					})] })
				}), /* @__PURE__ */ (0, P.jsx)(vC, {
					visible: f,
					unmountOnExit: !0,
					children: /* @__PURE__ */ (0, P.jsx)("div", {
						className: l.rows,
						children: /* @__PURE__ */ (0, P.jsx)(Aw, {
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
var Mw = qn({
	view: {
		display: "flex",
		flexDirection: "column",
		gap: W.spacingVerticalM,
		minWidth: 0
	},
	toolbar: {
		display: "flex",
		alignItems: "center",
		gap: W.spacingHorizontalXS,
		minHeight: W.spacingVerticalXXXL,
		flexWrap: "wrap"
	},
	toolbarTitle: {
		color: W.colorNeutralForeground1,
		whiteSpace: "nowrap"
	},
	spacer: {
		flex: 1,
		minWidth: 0
	},
	weekdays: {
		display: "grid",
		gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
		gap: W.spacingHorizontalXXS
	},
	weekday: {
		textAlign: "center",
		color: W.colorNeutralForeground3,
		paddingBlock: W.spacingVerticalXXS
	},
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
		gap: W.spacingHorizontalXXS
	},
	dayCell: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: W.spacingVerticalXXS,
		minWidth: 0,
		minHeight: "44px",
		padding: 0,
		borderRadius: W.borderRadiusMedium
	},
	daySelected: { backgroundColor: W.colorNeutralBackground1Selected },
	dayToday: { boxShadow: `inset 0 0 0 ${W.strokeWidthThin} ${W.colorBrandStroke1}` },
	dayOther: { color: W.colorNeutralForeground3 },
	dayCount: {
		color: W.colorNeutralForeground3,
		fontVariantNumeric: "tabular-nums"
	},
	dots: {
		display: "flex",
		alignItems: "center",
		gap: "2px",
		height: "6px"
	},
	dot: {
		width: "6px",
		height: "6px",
		borderRadius: W.borderRadiusCircular,
		backgroundColor: W.colorNeutralForeground3
	},
	dotHigh: { backgroundColor: W.colorPaletteRedForeground1 },
	dotMedium: { backgroundColor: W.colorPaletteMarigoldForeground1 },
	dotLow: { backgroundColor: W.colorPaletteBlueForeground2 },
	dayHead: {
		display: "flex",
		alignItems: "center",
		gap: W.spacingHorizontalS,
		minHeight: W.spacingVerticalXXXL
	},
	rows: {
		display: "flex",
		flexDirection: "column",
		minWidth: 0
	},
	muted: { color: W.colorNeutralForeground3 },
	weekGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
		gap: W.spacingHorizontalS,
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
		gap: W.spacingHorizontalXS,
		paddingBlock: W.spacingVerticalXS,
		color: W.colorNeutralForeground3
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
		gap: W.spacingHorizontalXXS
	},
	heatStats: {
		display: "flex",
		alignItems: "baseline",
		gap: W.spacingHorizontalXS,
		flexWrap: "wrap",
		minHeight: W.spacingVerticalXXXL
	},
	heatValue: {
		color: W.colorNeutralForeground1,
		fontVariantNumeric: "tabular-nums"
	},
	heatLabel: { color: W.colorNeutralForeground3 },
	heatGrid: {
		display: "grid",
		gridAutoFlow: "column",
		gridTemplateRows: "repeat(7, 32px)",
		gridAutoColumns: "32px",
		justifyContent: "center",
		gap: "2px"
	},
	heatCell: {
		width: "32px",
		height: "32px",
		borderRadius: W.borderRadiusSmall
	},
	heat0: { backgroundColor: W.colorNeutralBackground4 },
	heat1: { backgroundColor: W.colorPaletteGreenBackground1 },
	heat2: { backgroundColor: W.colorPaletteGreenBackground2 },
	heat3: { backgroundColor: W.colorPaletteGreenBackground3 },
	heat4: { backgroundColor: W.colorPaletteGreenForeground1 },
	legend: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end",
		gap: W.spacingHorizontalXS,
		color: W.colorNeutralForeground3
	},
	legendSwatch: {
		width: W.spacingHorizontalM,
		height: W.spacingHorizontalM,
		borderRadius: W.borderRadiusSmall
	}
});
function Nw(e) {
	let t = Q(e);
	return t ? `${t.getMonth() + 1}月${t.getDate()}日` : "";
}
function Pw(e) {
	let t = Q(e) || /* @__PURE__ */ new Date();
	return `${t.getFullYear()}年${t.getMonth() + 1}月`;
}
function Fw(e, t) {
	let n = new Date(e.getFullYear(), e.getMonth(), 1), r = Ux(n, -((n.getDay() - t + 7) % 7));
	return Array.from({ length: 42 }, (e, t) => Ux(r, t));
}
function Iw(e, t) {
	return t >= 3 ? e.dotHigh : t === 2 ? e.dotMedium : t === 1 ? e.dotLow : e.dot;
}
function Lw(e, t) {
	return e.filter((e) => e.dueAt && Vx(e.dueAt) === t);
}
function Rw({ tasks: e, now: t, settings: n, onOpenTask: r, onToggleTask: i, onAddDay: a }) {
	let o = Mw(), s = $.sortTasks(e, "due");
	return s.length === 0 ? /* @__PURE__ */ (0, P.jsx)(qC, {
		title: "这天还没有任务",
		description: "把要做的事安排到这一天",
		action: /* @__PURE__ */ (0, P.jsx)(XC, {
			onClick: a,
			children: "添加任务"
		})
	}) : /* @__PURE__ */ (0, P.jsx)("div", {
		className: o.rows,
		children: s.map((e) => /* @__PURE__ */ (0, P.jsx)(yw, {
			task: e,
			now: t,
			settings: n,
			onOpen: r,
			onToggle: i,
			onRemove: (e) => $.removeTask(e)
		}, e.id))
	});
}
function zw({ tasks: e, now: t, settings: n, onOpenTask: r, onToggleTask: i, onAddDay: a }) {
	let o = Mw(), [s, c] = (0, N.useState)(() => qx(t)), [l, u] = (0, N.useState)(() => Vx(t)), d = n.weekStart, f = nS(d), p = Fw(s, d), m = /* @__PURE__ */ new Date(`${l}T00:00:00`), h = Lw(e, l), g = h.filter((e) => !e.done).length;
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: o.view,
		children: [
			/* @__PURE__ */ (0, P.jsxs)("div", {
				className: o.toolbar,
				children: [
					/* @__PURE__ */ (0, P.jsx)(zh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, P.jsx)(Ju, {}),
						"aria-label": "上个月",
						onClick: () => c(new Date(s.getFullYear(), s.getMonth() - 1, 1))
					}),
					/* @__PURE__ */ (0, P.jsx)(Z, {
						size: 300,
						weight: "semibold",
						className: o.toolbarTitle,
						"aria-live": "polite",
						children: Pw(s)
					}),
					/* @__PURE__ */ (0, P.jsx)(zh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, P.jsx)(Yu, {}),
						"aria-label": "下个月",
						onClick: () => c(new Date(s.getFullYear(), s.getMonth() + 1, 1))
					}),
					/* @__PURE__ */ (0, P.jsx)("span", { className: o.spacer }),
					/* @__PURE__ */ (0, P.jsx)(XC, {
						appearance: "subtle",
						icon: /* @__PURE__ */ (0, P.jsx)(Mu, {}),
						onClick: () => {
							c(qx(t)), u(Vx(t));
						},
						children: "今天"
					})
				]
			}),
			/* @__PURE__ */ (0, P.jsx)("div", {
				className: o.weekdays,
				"aria-hidden": "true",
				children: f.map((e) => /* @__PURE__ */ (0, P.jsx)(Z, {
					size: 200,
					className: o.weekday,
					children: e
				}, e))
			}),
			/* @__PURE__ */ (0, P.jsx)("div", {
				className: o.grid,
				role: "grid",
				"aria-label": "日历",
				children: p.map((n) => {
					let r = Vx(n), i = e.filter((e) => !e.done && e.dueAt && Vx(e.dueAt) === r).length, a = n.getMonth() !== s.getMonth(), c = Jx(n, t), d = r === l;
					return /* @__PURE__ */ (0, P.jsxs)(zh, {
						appearance: "transparent",
						className: k(o.dayCell, d && o.daySelected, c && o.dayToday, a && o.dayOther),
						"aria-label": `${n.getMonth() + 1}月${n.getDate()}日，${i} 项未完成`,
						"aria-pressed": d,
						onClick: () => u(r),
						children: [/* @__PURE__ */ (0, P.jsx)(Z, {
							size: 300,
							children: n.getDate()
						}), i > 0 ? /* @__PURE__ */ (0, P.jsx)(Z, {
							size: 200,
							className: o.dayCount,
							children: i
						}) : null]
					}, r);
				})
			}),
			/* @__PURE__ */ (0, P.jsx)("div", {
				className: o.dayHead,
				children: /* @__PURE__ */ (0, P.jsxs)(Z, {
					size: 300,
					weight: "semibold",
					children: [
						Nw(m),
						" · ",
						g,
						" 项"
					]
				})
			}),
			/* @__PURE__ */ (0, P.jsx)(Rw, {
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
function Bw({ tasks: e, now: t, settings: n, onOpenTask: r, onToggleTask: i }) {
	let a = Mw(), o = n.weekStart, [s, c] = (0, N.useState)(() => Kx(t, o)), l = nS(o), u = Array.from({ length: 7 }, (e, t) => Ux(s, t)), d = u.reduce((t, n) => t + Lw(e, Vx(n)).length, 0);
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: a.view,
		children: [
			/* @__PURE__ */ (0, P.jsxs)("div", {
				className: a.toolbar,
				children: [
					/* @__PURE__ */ (0, P.jsx)(zh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, P.jsx)(Ju, {}),
						"aria-label": "上一周",
						onClick: () => c(Ux(s, -7))
					}),
					/* @__PURE__ */ (0, P.jsxs)(Z, {
						size: 300,
						weight: "semibold",
						className: a.toolbarTitle,
						"aria-live": "polite",
						children: [
							Nw(u[0]),
							" – ",
							Nw(u[6])
						]
					}),
					/* @__PURE__ */ (0, P.jsx)(zh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, P.jsx)(Yu, {}),
						"aria-label": "下一周",
						onClick: () => c(Ux(s, 7))
					}),
					/* @__PURE__ */ (0, P.jsx)("span", { className: a.spacer }),
					/* @__PURE__ */ (0, P.jsx)(XC, {
						appearance: "subtle",
						icon: /* @__PURE__ */ (0, P.jsx)(Mu, {}),
						onClick: () => c(Kx(t, o)),
						children: "今天"
					})
				]
			}),
			/* @__PURE__ */ (0, P.jsx)("div", {
				className: a.weekGrid,
				children: u.map((n, o) => {
					let s = Vx(n), c = Lw(e, s).sort((e, t) => Number(e.done) - Number(t.done) || (Q(e.dueAt)?.getTime() || 0) - (Q(t.dueAt)?.getTime() || 0));
					return /* @__PURE__ */ (0, P.jsxs)("div", {
						className: a.weekCol,
						children: [/* @__PURE__ */ (0, P.jsxs)("div", {
							className: k(a.weekHead, Jx(n, t) && a.dayToday),
							children: [/* @__PURE__ */ (0, P.jsx)(Z, {
								size: 200,
								children: l[o]
							}), /* @__PURE__ */ (0, P.jsx)(Z, {
								size: 300,
								weight: Jx(n, t) ? "semibold" : "regular",
								children: n.getDate()
							})]
						}), /* @__PURE__ */ (0, P.jsx)("div", {
							className: a.weekTasks,
							children: c.map((e) => /* @__PURE__ */ (0, P.jsx)(bw, {
								task: e,
								onOpen: r,
								onToggle: i
							}, e.id))
						})]
					}, s);
				})
			}),
			d === 0 ? /* @__PURE__ */ (0, P.jsx)(Z, {
				size: 300,
				className: a.muted,
				children: "这一周还没有任务"
			}) : null
		]
	});
}
function Vw({ tasks: e, now: t, settings: n, onOpenTask: r, onToggleTask: i, onAddDay: a }) {
	let o = Mw(), s = n.weekStart, [c, l] = (0, N.useState)(() => qx(t)), [u, d] = (0, N.useState)(() => Vx(t)), f = nS(s), p = Fw(c, s), m = Lw(e, u), h = m.filter((e) => !e.done).length;
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: o.view,
		children: [
			/* @__PURE__ */ (0, P.jsxs)("div", {
				className: o.toolbar,
				children: [
					/* @__PURE__ */ (0, P.jsx)(zh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, P.jsx)(Ju, {}),
						"aria-label": "上个月",
						onClick: () => l(new Date(c.getFullYear(), c.getMonth() - 1, 1))
					}),
					/* @__PURE__ */ (0, P.jsx)(Z, {
						size: 300,
						weight: "semibold",
						className: o.toolbarTitle,
						"aria-live": "polite",
						children: Pw(c)
					}),
					/* @__PURE__ */ (0, P.jsx)(zh, {
						appearance: "subtle",
						size: "large",
						icon: /* @__PURE__ */ (0, P.jsx)(Yu, {}),
						"aria-label": "下个月",
						onClick: () => l(new Date(c.getFullYear(), c.getMonth() + 1, 1))
					}),
					/* @__PURE__ */ (0, P.jsx)("span", { className: o.spacer }),
					/* @__PURE__ */ (0, P.jsx)(XC, {
						appearance: "subtle",
						icon: /* @__PURE__ */ (0, P.jsx)(Mu, {}),
						onClick: () => {
							l(qx(t)), d(Vx(t));
						},
						children: "今天"
					})
				]
			}),
			/* @__PURE__ */ (0, P.jsx)("div", {
				className: o.weekdays,
				"aria-hidden": "true",
				children: f.map((e) => /* @__PURE__ */ (0, P.jsx)(Z, {
					size: 200,
					className: o.weekday,
					children: e
				}, e))
			}),
			/* @__PURE__ */ (0, P.jsx)("div", {
				className: o.monthGrid,
				role: "grid",
				"aria-label": "月视图",
				children: p.map((n) => {
					let r = Vx(n), i = e.filter((e) => !e.done && e.dueAt && Vx(e.dueAt) === r).slice(0, 2), a = n.getMonth() !== c.getMonth(), s = r === u;
					return /* @__PURE__ */ (0, P.jsxs)(zh, {
						appearance: "transparent",
						className: k(o.dayCell, s && o.daySelected, Jx(n, t) && o.dayToday, a && o.dayOther),
						"aria-label": `${n.getMonth() + 1}月${n.getDate()}日`,
						"aria-pressed": s,
						onClick: () => d(r),
						children: [/* @__PURE__ */ (0, P.jsx)(Z, {
							size: 300,
							children: n.getDate()
						}), i.length > 0 ? /* @__PURE__ */ (0, P.jsx)("span", {
							className: o.dots,
							"aria-hidden": "true",
							children: i.map((e) => /* @__PURE__ */ (0, P.jsx)("span", { className: k(o.dot, Iw(o, e.priority)) }, e.id))
						}) : null]
					}, r);
				})
			}),
			/* @__PURE__ */ (0, P.jsx)("div", {
				className: o.dayHead,
				children: /* @__PURE__ */ (0, P.jsxs)(Z, {
					size: 300,
					weight: "semibold",
					children: [
						Nw(/* @__PURE__ */ new Date(`${u}T00:00:00`)),
						" · ",
						h,
						" 项"
					]
				})
			}),
			/* @__PURE__ */ (0, P.jsx)(Rw, {
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
function Hw({ now: e, settings: t }) {
	let n = Mw(), r = t.weekStart, i = Hx(e), a = Ux(Kx(i, r), -105), o = Array.from({ length: 112 }, (e, t) => Vx(Ux(a, t))), s = new Map(o.map((e) => [e, 0])), c = $.state.tasks;
	for (let e of c) {
		if (!e.done || !e.doneAt) continue;
		let t = Vx(e.doneAt);
		s.has(t) && s.set(t, s.get(t) + 1);
	}
	let l = o.map((e) => s.get(e)), u = l.reduce((e, t) => e + t, 0), d = 1;
	for (let e of l) d = Math.max(d, e);
	let f = (e) => e <= 0 ? 0 : Math.min(4, Math.ceil(e / d * 4)), p = 0, m = s.get(Vx(i)) > 0 ? i : Ux(i, -1);
	for (; s.has(Vx(m)) && s.get(Vx(m)) > 0;) p += 1, m = Ux(m, -1);
	let h = nS(r);
	return /* @__PURE__ */ (0, P.jsxs)("div", {
		className: n.view,
		children: [
			/* @__PURE__ */ (0, P.jsxs)("div", {
				className: n.heatStats,
				children: [
					/* @__PURE__ */ (0, P.jsx)(Z, {
						size: 500,
						weight: "semibold",
						className: n.heatValue,
						children: u
					}),
					/* @__PURE__ */ (0, P.jsx)(Z, {
						size: 300,
						className: n.heatLabel,
						children: "项完成 · 近 16 周"
					}),
					/* @__PURE__ */ (0, P.jsx)(Z, {
						size: 500,
						weight: "semibold",
						className: n.heatValue,
						children: p
					}),
					/* @__PURE__ */ (0, P.jsx)(Z, {
						size: 300,
						className: n.heatLabel,
						children: "天连续完成"
					})
				]
			}),
			/* @__PURE__ */ (0, P.jsx)("div", {
				className: n.heatGrid,
				role: "img",
				"aria-label": "近 16 周每日完成量",
				children: o.map((e, t) => {
					let r = /* @__PURE__ */ new Date(`${e}T00:00:00`), i = s.get(e), a = f(i);
					return /* @__PURE__ */ (0, P.jsx)("span", {
						className: k(n.heatCell, n[`heat${a}`]),
						title: `${r.getMonth() + 1}月${r.getDate()}日 ${h[t % 7]}：完成 ${i} 项`
					}, e);
				})
			}),
			/* @__PURE__ */ (0, P.jsxs)("div", {
				className: n.legend,
				children: [
					/* @__PURE__ */ (0, P.jsx)(Z, {
						size: 200,
						children: "少"
					}),
					[
						0,
						1,
						2,
						3,
						4
					].map((e) => /* @__PURE__ */ (0, P.jsx)("span", {
						className: k(n.legendSwatch, n[`heat${e}`]),
						"aria-hidden": "true"
					}, e)),
					/* @__PURE__ */ (0, P.jsx)(Z, {
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
var Uw = [
	0,
	1,
	2,
	3
].map((e) => ({
	value: e,
	label: sS(e).label
})), Ww = [{
	value: "",
	label: "不重复"
}, ...iS], Gw = qn({
	form: {
		width: "100%",
		maxWidth: "720px",
		marginInline: "auto",
		display: "flex",
		flexDirection: "column",
		gap: W.spacingVerticalL,
		minWidth: 0
	},
	row: {
		display: "flex",
		alignItems: "center",
		gap: W.spacingHorizontalS,
		flexWrap: "wrap",
		minHeight: "40px"
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
		gap: W.spacingHorizontalXS,
		flexWrap: "wrap"
	},
	subtaskRow: {
		display: "flex",
		alignItems: "center",
		gap: W.spacingHorizontalS,
		minHeight: "44px",
		minWidth: 0
	},
	subtaskTitle: {
		flex: 1,
		minWidth: 0,
		color: W.colorNeutralForeground2
	},
	subtaskDone: {
		color: W.colorNeutralForeground3,
		textDecorationLine: "line-through"
	},
	iconButton: {
		minWidth: "40px",
		minHeight: "40px"
	},
	muted: { color: W.colorNeutralForeground3 },
	footer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: W.spacingHorizontalS,
		width: "100%",
		minWidth: 0,
		flexWrap: "wrap"
	},
	footerGroup: {
		display: "inline-flex",
		alignItems: "center",
		gap: W.spacingHorizontalS,
		minWidth: 0
	},
	danger: { color: W.colorPaletteRedForeground1 },
	confirmText: { color: W.colorNeutralForeground3 },
	progress: { marginBottom: W.spacingVerticalXS }
});
function Kw(e, { dateOnly: t = !1 } = {}) {
	let [n, r] = (Zx(e) || "").split("T");
	return {
		date: n || "",
		time: t && r === "23:59" ? "" : r || ""
	};
}
function qw(e, t) {
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
function Jw({ mode: e, taskId: t, initialListId: n, initialDueDate: r, settings: i, onClosed: a }) {
	let o = Gw(), s = e === "edit", c = s ? $.taskById(t) : null, l = n && $.listById(n) ? n : $.settings.defaultListId && $.listById($.settings.defaultListId) ? $.settings.defaultListId : $.lists[0]?.id, [u, d] = (0, N.useState)(() => c?.title || ""), [f, p] = (0, N.useState)(() => c?.note || ""), [m, h] = (0, N.useState)(() => c?.listId || l), [g, _] = (0, N.useState)(() => String(c?.priority ?? 0)), [v, y] = (0, N.useState)(() => c ? Kw(c.dueAt, { dateOnly: !0 }) : {
		date: r || "",
		time: ""
	}), [b, x] = (0, N.useState)(() => c ? Kw(c.remindAt) : {
		date: "",
		time: ""
	}), [S, C] = (0, N.useState)(() => c?.recurrence || ""), [w, T] = (0, N.useState)(() => [...c?.tags || []]), [E, D] = (0, N.useState)(""), [ee, O] = (0, N.useState)(() => (c?.subtasks || []).slice().sort((e, t) => e.order - t.order).map((e) => ({ ...e }))), [te, ne] = (0, N.useState)(""), [re, k] = (0, N.useState)(null), [ie, ae] = (0, N.useState)(!1), oe = CC("normal"), se = $.listById(m) || $.lists[0], ce = ee.filter((e) => e.done).length, le = ee.length ? ce / ee.length : 0, ue = zS(i, 400), de = () => {
		let e = E.trim();
		e && (T((t) => t.includes(e) ? t : [...t, e]), D(""));
	}, fe = () => {
		let e = te.trim();
		e && (O((t) => [...t, {
			id: null,
			title: e,
			done: !1,
			order: t.length
		}]), ne(""));
	}, pe = (e) => {
		let t = u.trim();
		if (!t) {
			k("标题不能为空");
			return;
		}
		let n = v.date ? Qx(v.date, v.time || null) : null, r = b.date ? Qx(b.date, b.time || "09:00") : null, i = {
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
				$.updateTask(c.id, i), qw(c.id, ee);
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
	}, me = (e) => {
		try {
			if (!c) throw Error("任务不存在或已被删除");
			$.removeTask(c.id), e();
		} catch (e) {
			k(e instanceof Error ? e.message : String(e));
		}
	};
	return /* @__PURE__ */ (0, P.jsx)(uw, {
		title: s ? "编辑任务" : "新建任务",
		footer: (e) => /* @__PURE__ */ (0, P.jsxs)("div", {
			className: o.footer,
			children: [/* @__PURE__ */ (0, P.jsxs)("div", {
				className: o.footerGroup,
				children: [s && c && !ie ? /* @__PURE__ */ (0, P.jsx)(XC, {
					appearance: "subtle",
					className: o.danger,
					icon: /* @__PURE__ */ (0, P.jsx)(Qu, {}),
					onClick: () => ae(!0),
					children: "删除"
				}) : null, ie ? /* @__PURE__ */ (0, P.jsxs)(P.Fragment, { children: [
					/* @__PURE__ */ (0, P.jsx)(Z, {
						size: 200,
						className: o.confirmText,
						children: "删除后不可恢复"
					}),
					/* @__PURE__ */ (0, P.jsx)(XC, {
						appearance: "primary",
						onClick: () => me(e),
						children: "确认删除"
					}),
					/* @__PURE__ */ (0, P.jsx)(XC, {
						onClick: () => ae(!1),
						children: "取消"
					})
				] }) : null]
			}), ie ? null : /* @__PURE__ */ (0, P.jsxs)("div", {
				className: o.footerGroup,
				children: [/* @__PURE__ */ (0, P.jsx)(XC, {
					onClick: e,
					children: "取消"
				}), /* @__PURE__ */ (0, P.jsx)(XC, {
					appearance: "primary",
					onClick: () => pe(e),
					children: "保存"
				})]
			})]
		}),
		onClosed: a,
		children: /* @__PURE__ */ (0, P.jsxs)("div", {
			className: o.form,
			children: [
				re ? /* @__PURE__ */ (0, P.jsx)(ex, {
					intent: "error",
					onDismiss: () => k(null),
					children: /* @__PURE__ */ (0, P.jsx)(px, { children: re })
				}) : null,
				/* @__PURE__ */ (0, P.jsx)(dg, {
					label: "标题",
					required: !0,
					children: /* @__PURE__ */ (0, P.jsx)(w_, {
						size: "large",
						value: u,
						placeholder: "要做什么",
						"aria-label": "任务标题",
						onChange: (e, t) => d(t.value)
					})
				}),
				/* @__PURE__ */ (0, P.jsx)(dg, {
					label: "备注",
					hint: "可留空",
					children: /* @__PURE__ */ (0, P.jsx)(bb, {
						value: f,
						rows: 3,
						resize: "vertical",
						"aria-label": "任务备注",
						onChange: (e, t) => p(t.value)
					})
				}),
				/* @__PURE__ */ (0, P.jsx)(dg, {
					label: "清单",
					children: /* @__PURE__ */ (0, P.jsx)(f_, {
						size: "large",
						value: se?.name || "",
						selectedOptions: m ? [m] : [],
						"aria-label": "任务清单",
						onOptionSelect: (e, t) => h(t.optionValue),
						children: $.lists.map((e) => /* @__PURE__ */ (0, P.jsx)(Yg, {
							value: e.id,
							children: e.name
						}, e.id))
					})
				}),
				/* @__PURE__ */ (0, P.jsx)(dg, {
					label: "优先级",
					children: /* @__PURE__ */ (0, P.jsx)(dy, {
						layout: "horizontal",
						value: g,
						"aria-label": "优先级",
						onChange: (e, t) => _(t.value),
						children: Uw.map((e) => /* @__PURE__ */ (0, P.jsx)(Cy, {
							value: String(e.value),
							label: e.label
						}, e.value))
					})
				}),
				/* @__PURE__ */ (0, P.jsx)(dg, {
					label: "截止时间",
					hint: "只选日期时按当天 23:59 到期",
					children: /* @__PURE__ */ (0, P.jsxs)("div", {
						className: o.row,
						children: [
							/* @__PURE__ */ (0, P.jsx)(w_, {
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
							/* @__PURE__ */ (0, P.jsx)(w_, {
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
							/* @__PURE__ */ (0, P.jsx)(XC, {
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
				/* @__PURE__ */ (0, P.jsx)(dg, {
					label: "提醒",
					hint: "到点后在桌面提示；只改其他字段不会重复弹出已触发的提醒",
					children: /* @__PURE__ */ (0, P.jsxs)("div", {
						className: o.row,
						children: [
							/* @__PURE__ */ (0, P.jsx)(w_, {
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
							/* @__PURE__ */ (0, P.jsx)(w_, {
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
							/* @__PURE__ */ (0, P.jsx)(XC, {
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
				/* @__PURE__ */ (0, P.jsx)(dg, {
					label: "重复",
					children: /* @__PURE__ */ (0, P.jsx)(f_, {
						size: "large",
						value: Ww.find((e) => e.value === S)?.label || "不重复",
						selectedOptions: S ? [S] : [],
						"aria-label": "重复规则",
						onOptionSelect: (e, t) => C(t.optionValue),
						children: Ww.map((e) => /* @__PURE__ */ (0, P.jsx)(Yg, {
							value: e.value,
							children: e.label
						}, e.value))
					})
				}),
				/* @__PURE__ */ (0, P.jsxs)(dg, {
					label: "标签",
					children: [w.length > 0 ? /* @__PURE__ */ (0, P.jsx)("div", {
						className: o.chips,
						children: w.map((e) => /* @__PURE__ */ (0, P.jsx)(XC, {
							appearance: "outline",
							icon: /* @__PURE__ */ (0, P.jsx)(ed, {}),
							iconPosition: "after",
							"aria-label": `移除标签 ${e}`,
							onClick: () => T((t) => t.filter((t) => t !== e)),
							children: e
						}, e))
					}) : null, /* @__PURE__ */ (0, P.jsxs)("div", {
						className: o.row,
						children: [/* @__PURE__ */ (0, P.jsx)(w_, {
							className: o.grow,
							size: "large",
							value: E,
							placeholder: "输入标签后回车",
							"aria-label": "新标签",
							onChange: (e, t) => D(t.value),
							onKeyDown: (e) => {
								e.key === "Enter" && (e.preventDefault(), de());
							}
						}), /* @__PURE__ */ (0, P.jsx)(XC, {
							appearance: "secondary",
							icon: /* @__PURE__ */ (0, P.jsx)(Vu, {}),
							onClick: de,
							children: "添加标签"
						})]
					})]
				}),
				/* @__PURE__ */ (0, P.jsxs)(dg, {
					label: ee.length ? `子任务（${ce}/${ee.length}）` : "子任务",
					children: [
						ee.length > 0 ? /* @__PURE__ */ (0, P.jsx)(Mb, {
							className: o.progress,
							value: le,
							"aria-label": "子任务完成度"
						}) : null,
						ee.map((e, t) => /* @__PURE__ */ (0, P.jsxs)("div", {
							className: o.subtaskRow,
							children: [
								/* @__PURE__ */ (0, P.jsx)(wg, {
									checked: e.done,
									"aria-label": e.title,
									onChange: () => O((e) => e.map((e, n) => n === t ? {
										...e,
										done: !e.done
									} : e))
								}),
								/* @__PURE__ */ (0, P.jsx)(Z, {
									size: ue,
									className: e.done ? `${o.subtaskTitle} ${o.subtaskDone}` : o.subtaskTitle,
									style: {
										opacity: e.done ? .55 : 1,
										transitionProperty: "opacity",
										...oe
									},
									children: /* @__PURE__ */ (0, P.jsx)(mw, { children: e.title })
								}),
								/* @__PURE__ */ (0, P.jsx)(XC, {
									appearance: "subtle",
									className: o.iconButton,
									icon: /* @__PURE__ */ (0, P.jsx)(Qu, {}),
									"aria-label": `删除子任务 ${e.title}`,
									onClick: () => O((e) => e.filter((e, n) => n !== t))
								})
							]
						}, `${e.id || "new"}-${t}`)),
						/* @__PURE__ */ (0, P.jsxs)("div", {
							className: o.row,
							children: [/* @__PURE__ */ (0, P.jsx)(w_, {
								className: o.grow,
								size: "large",
								value: te,
								placeholder: "输入子任务后回车",
								"aria-label": "新子任务",
								onChange: (e, t) => ne(t.value),
								onKeyDown: (e) => {
									e.key === "Enter" && (e.preventDefault(), fe());
								}
							}), /* @__PURE__ */ (0, P.jsx)(XC, {
								appearance: "secondary",
								icon: /* @__PURE__ */ (0, P.jsx)(Vu, {}),
								onClick: fe,
								children: "添加子任务"
							})]
						})
					]
				}),
				s ? /* @__PURE__ */ (0, P.jsx)(Z, {
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
var Yw = qn({
	list: {
		display: "flex",
		flexDirection: "column",
		gap: W.spacingVerticalXS,
		minWidth: 0
	},
	row: {
		display: "flex",
		alignItems: "center",
		gap: W.spacingHorizontalS,
		minHeight: "44px",
		minWidth: 0
	},
	main: {
		display: "flex",
		flex: 1,
		flexDirection: "column",
		gap: W.spacingVerticalXXS,
		minWidth: 0
	},
	name: {
		color: W.colorNeutralForeground1,
		minWidth: 0
	},
	count: {
		color: W.colorNeutralForeground3,
		fontVariantNumeric: "tabular-nums"
	},
	actions: {
		display: "inline-flex",
		alignItems: "center",
		gap: W.spacingHorizontalXXS,
		flexShrink: 0
	},
	iconButton: {
		minWidth: "40px",
		minHeight: "40px"
	},
	star: { color: W.colorBrandForeground1 },
	starIdle: { color: W.colorNeutralForeground3 },
	danger: { color: W.colorPaletteRedForeground1 },
	confirm: {
		display: "flex",
		alignItems: "center",
		gap: W.spacingHorizontalXS,
		flex: 1,
		minWidth: 0
	},
	confirmText: {
		flex: 1,
		minWidth: 0,
		color: W.colorNeutralForeground3
	},
	renameInput: {
		flex: 1,
		minWidth: 0
	},
	addRow: {
		display: "flex",
		alignItems: "center",
		gap: W.spacingHorizontalS,
		minWidth: 0
	},
	addInput: { minWidth: "140px" },
	muted: { color: W.colorNeutralForeground3 },
	empty: {
		color: W.colorNeutralForeground3,
		paddingBlock: W.spacingVerticalM
	}
});
function Xw({ onClosed: e }) {
	let t = Yw(), n = QS(), [r, i] = (0, N.useState)(""), [a, o] = (0, N.useState)(null), [s, c] = (0, N.useState)(null), [l, u] = (0, N.useState)(null), [d, f] = (0, N.useState)(null), p = n.lists, m = n.settings.defaultListId, h = (e) => n.state.tasks.filter((t) => t.listId === e).length, g = Sw(p.map((e) => e.id)), _ = () => {
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
	return /* @__PURE__ */ (0, P.jsx)(uw, {
		title: "清单管理",
		trailing: /* @__PURE__ */ (0, P.jsxs)("div", {
			className: t.addRow,
			children: [/* @__PURE__ */ (0, P.jsx)(w_, {
				size: "large",
				className: t.addInput,
				value: r,
				placeholder: "新清单名称",
				"aria-label": "新清单名称",
				onChange: (e, t) => i(t.value),
				onKeyDown: (e) => {
					e.key === "Enter" && (e.preventDefault(), _());
				}
			}), /* @__PURE__ */ (0, P.jsx)(XC, {
				appearance: "primary",
				icon: /* @__PURE__ */ (0, P.jsx)(Vu, {}),
				onClick: _,
				children: "新建"
			})]
		}),
		onClosed: e,
		children: /* @__PURE__ */ (0, P.jsxs)("div", {
			className: t.list,
			children: [
				l ? /* @__PURE__ */ (0, P.jsx)(ex, {
					intent: "error",
					onDismiss: () => u(null),
					children: /* @__PURE__ */ (0, P.jsx)(px, { children: l })
				}) : null,
				p.length === 0 ? /* @__PURE__ */ (0, P.jsx)(Z, {
					size: 300,
					className: t.empty,
					children: "还没有清单"
				}) : null,
				p.map((e) => {
					let n = h(e.id), r = e.id === m;
					return /* @__PURE__ */ (0, P.jsx)(gC, {
						visible: d !== e.id,
						appear: g.has(e.id),
						unmountOnExit: !0,
						onMotionFinish: (t, n) => {
							n?.direction === "exit" && d === e.id && b(e);
						},
						children: a?.id === e.id ? /* @__PURE__ */ (0, P.jsxs)("div", {
							className: t.row,
							children: [
								/* @__PURE__ */ (0, P.jsx)(w_, {
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
								/* @__PURE__ */ (0, P.jsx)(XC, {
									appearance: "primary",
									onClick: v,
									children: "保存"
								}),
								/* @__PURE__ */ (0, P.jsx)(XC, {
									appearance: "secondary",
									onClick: () => o(null),
									children: "取消"
								})
							]
						}) : s === e.id ? /* @__PURE__ */ (0, P.jsxs)("div", {
							className: t.row,
							children: [
								/* @__PURE__ */ (0, P.jsx)("div", {
									className: t.confirm,
									children: /* @__PURE__ */ (0, P.jsx)(Z, {
										size: 200,
										className: t.confirmText,
										children: /* @__PURE__ */ (0, P.jsxs)(mw, { children: [
											"删除「",
											e.name,
											"」？同时删除其中的 ",
											n,
											" 个任务"
										] })
									})
								}),
								/* @__PURE__ */ (0, P.jsx)(XC, {
									appearance: "primary",
									onClick: () => y(e),
									children: "确认删除"
								}),
								/* @__PURE__ */ (0, P.jsx)(XC, {
									appearance: "secondary",
									onClick: () => c(null),
									children: "取消"
								})
							]
						}) : /* @__PURE__ */ (0, P.jsxs)("div", {
							className: t.row,
							children: [
								/* @__PURE__ */ (0, P.jsx)(xw, { color: e.color }),
								/* @__PURE__ */ (0, P.jsxs)("div", {
									className: t.main,
									children: [/* @__PURE__ */ (0, P.jsx)(Z, {
										size: 300,
										className: t.name,
										title: e.name,
										children: /* @__PURE__ */ (0, P.jsx)(mw, { children: e.name })
									}), /* @__PURE__ */ (0, P.jsxs)(Z, {
										size: 200,
										className: t.count,
										children: [
											n,
											" 个任务",
											r ? " · 默认清单" : ""
										]
									})]
								}),
								/* @__PURE__ */ (0, P.jsxs)("div", {
									className: t.actions,
									children: [
										/* @__PURE__ */ (0, P.jsx)(XC, {
											appearance: "subtle",
											className: t.iconButton,
											icon: r ? /* @__PURE__ */ (0, P.jsx)(Lu, {}) : /* @__PURE__ */ (0, P.jsx)(Ru, {}),
											"aria-label": r ? `默认清单 ${e.name}` : `设为默认清单 ${e.name}`,
											title: r ? "默认清单" : "设为默认",
											disabled: r,
											onClick: () => $.updateSettings({ defaultListId: e.id })
										}),
										/* @__PURE__ */ (0, P.jsx)(XC, {
											appearance: "subtle",
											className: t.iconButton,
											icon: /* @__PURE__ */ (0, P.jsx)(Hu, {}),
											"aria-label": `重命名清单 ${e.name}`,
											title: "重命名",
											onClick: () => o({
												id: e.id,
												name: e.name
											})
										}),
										/* @__PURE__ */ (0, P.jsx)(XC, {
											appearance: "subtle",
											className: t.iconButton,
											icon: /* @__PURE__ */ (0, P.jsx)(Qu, {}),
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
var Zw = [
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
], Qw = "__manage-lists", $w = qn({
	listDropdown: {
		minWidth: "140px",
		maxWidth: "180px",
		flexShrink: 0
	},
	search: {
		flex: 1,
		minWidth: 0
	},
	scopeHint: {
		color: W.colorNeutralForeground3,
		whiteSpace: "nowrap"
	},
	spacer: {
		flex: 1,
		minWidth: 0
	}
});
function eT() {
	let e = $.settings.defaultListId;
	return e && $.listById(e) ? e : "all";
}
function tT() {
	let e = $w();
	QS();
	let [t] = Ox(NS, PS, LS), [n, r] = (0, N.useState)("list"), [i, a] = (0, N.useState)(eT), [o, s] = (0, N.useState)(""), [c, l] = (0, N.useState)(null), u = /* @__PURE__ */ new Date();
	(0, N.useEffect)(() => {
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
	return /* @__PURE__ */ (0, P.jsxs)(QC, { children: [
		/* @__PURE__ */ (0, P.jsxs)(ew, {
			trailing: /* @__PURE__ */ (0, P.jsx)(XC, {
				appearance: "primary",
				icon: /* @__PURE__ */ (0, P.jsx)(Vu, {}),
				onClick: () => _(null),
				children: "添加任务"
			}),
			children: [/* @__PURE__ */ (0, P.jsxs)(f_, {
				size: "large",
				className: e.listDropdown,
				value: d,
				selectedOptions: [i],
				"aria-label": "筛选清单",
				onOptionSelect: (e, t) => {
					let n = t.optionValue;
					n === Qw ? l({ kind: "lists" }) : a(n);
				},
				children: [
					/* @__PURE__ */ (0, P.jsx)(Yg, {
						value: "all",
						children: "全部清单"
					}),
					$.lists.map((e) => /* @__PURE__ */ (0, P.jsx)(Yg, {
						value: e.id,
						children: e.name
					}, e.id)),
					/* @__PURE__ */ (0, P.jsx)(Yg, {
						value: Qw,
						children: "管理清单…"
					})
				]
			}), /* @__PURE__ */ (0, P.jsx)(w_, {
				size: "large",
				className: e.search,
				appearance: "outline",
				contentBefore: /* @__PURE__ */ (0, P.jsx)(Nu, {}),
				contentAfter: o ? /* @__PURE__ */ (0, P.jsx)(XC, {
					appearance: "transparent",
					icon: /* @__PURE__ */ (0, P.jsx)(td, {}),
					"aria-label": "清除搜索",
					onClick: () => s("")
				}) : void 0,
				placeholder: "搜索标题、备注、标签、子任务",
				"aria-label": "搜索任务",
				value: o,
				onChange: (e, t) => s(t.value)
			})]
		}),
		/* @__PURE__ */ (0, P.jsxs)(nw, { children: [
			/* @__PURE__ */ (0, P.jsxs)(Z, {
				size: 200,
				className: e.scopeHint,
				children: [
					d,
					" · ",
					p,
					" 项未完成"
				]
			}),
			/* @__PURE__ */ (0, P.jsx)("span", { className: e.spacer }),
			/* @__PURE__ */ (0, P.jsx)(XC, {
				appearance: "subtle",
				icon: /* @__PURE__ */ (0, P.jsx)(Fu, {}),
				onClick: eC,
				children: "设置…"
			})
		] }),
		/* @__PURE__ */ (0, P.jsx)(iw, {
			items: Zw,
			value: n,
			onChange: r,
			ariaLabel: "待办视图"
		}),
		/* @__PURE__ */ (0, P.jsx)(sw, { children: /* @__PURE__ */ (0, P.jsx)(yC, {
			value: n,
			children: n === "list" ? /* @__PURE__ */ (0, P.jsx)(jw, {
				tasks: f,
				query: o,
				settings: t,
				now: u,
				listId: i,
				onOpenTask: m,
				onToggleTask: h,
				onAddTask: () => _(null),
				onClearSearch: () => s("")
			}) : n === "calendar" ? /* @__PURE__ */ (0, P.jsx)(zw, {
				tasks: f,
				now: u,
				settings: t,
				onOpenTask: m,
				onToggleTask: h,
				onAddDay: _
			}) : n === "week" ? /* @__PURE__ */ (0, P.jsx)(Bw, {
				tasks: f,
				now: u,
				settings: t,
				onOpenTask: m,
				onToggleTask: h
			}) : n === "month" ? /* @__PURE__ */ (0, P.jsx)(Vw, {
				tasks: f,
				now: u,
				settings: t,
				onOpenTask: m,
				onToggleTask: h,
				onAddDay: _
			}) : /* @__PURE__ */ (0, P.jsx)(Hw, {
				now: u,
				settings: t
			})
		}) }),
		y ? /* @__PURE__ */ (0, P.jsx)(Jw, {
			mode: y.kind === "task" ? "edit" : "new",
			taskId: y.taskId,
			initialListId: y.listId,
			initialDueDate: y.dueDate,
			settings: t,
			onClosed: v
		}, y.kind === "task" ? y.taskId : `new-${y.dueDate || "none"}`) : null,
		c?.kind === "lists" ? /* @__PURE__ */ (0, P.jsx)(Xw, { onClosed: v }) : null
	] });
}
//#endregion
//#region public/plugins/todo/src/main.jsx
bx();
var nT = new URLSearchParams(location.search), rT = nT.get("background") === "1" || nT.get("mode") === "background" || /background\.html$/.test(location.pathname), iT = qn({
	page: {
		width: "100%",
		height: "100%",
		display: "grid",
		placeItems: "center",
		backgroundColor: W.colorNeutralBackground1,
		overflow: "hidden"
	},
	pageOverlay: {
		width: "100%",
		height: "100%",
		padding: W.spacingVerticalXL,
		display: "flex",
		alignItems: "stretch",
		justifyContent: "center",
		backgroundColor: W.colorNeutralBackground2,
		overflow: "hidden"
	},
	card: {
		overflow: "hidden",
		borderRadius: W.borderRadius2XLarge,
		backgroundColor: W.colorNeutralBackground1,
		boxShadow: W.shadow16
	},
	dialog: {
		width: "100%",
		height: "100%",
		overflow: "hidden",
		borderRadius: W.borderRadiusXLarge,
		backgroundColor: W.colorNeutralBackground1,
		boxShadow: W.shadow16
	}
});
function aT({ overlayView: e, defaultSizeKey: t, children: n }) {
	let r = iT();
	if (e) return /* @__PURE__ */ (0, P.jsx)("div", {
		className: r.pageOverlay,
		children: /* @__PURE__ */ (0, P.jsx)("div", {
			className: r.dialog,
			children: n
		})
	});
	let i = sC(t);
	return /* @__PURE__ */ (0, P.jsx)("div", {
		className: r.page,
		children: /* @__PURE__ */ (0, P.jsx)("div", {
			className: r.card,
			style: {
				width: i.width,
				height: i.height
			},
			children: n
		})
	});
}
var oT = class extends N.Component {
	constructor(e) {
		super(e), this.state = { error: null };
	}
	static getDerivedStateFromError(e) {
		return { error: e };
	}
	render() {
		return this.state.error ? /* @__PURE__ */ (0, P.jsx)("div", {
			style: { padding: W.spacingVerticalL },
			children: /* @__PURE__ */ (0, P.jsx)(ex, {
				intent: "error",
				children: /* @__PURE__ */ (0, P.jsxs)(px, { children: [/* @__PURE__ */ (0, P.jsx)(ox, { children: "待办加载出错" }), String(this.state.error?.message || this.state.error)] })
			})
		}) : this.props.children;
	}
};
function sT() {
	let { theme: t } = Tx(), n = kx(), r = aC(nT.get("size")), i = r ? oC(r) : "3x3", a = !e.inHost, o = nT.get("raw") === "1" || nT.has("plugin") && nT.has("widget"), s = n === "detail" ? /* @__PURE__ */ (0, P.jsx)(tT, {}) : /* @__PURE__ */ (0, P.jsx)(Dw, { defaultSizeKey: i });
	return /* @__PURE__ */ (0, P.jsx)(Pl, {
		theme: t,
		style: {
			width: "100%",
			height: "100%",
			background: "transparent",
			colorScheme: "normal"
		},
		children: /* @__PURE__ */ (0, P.jsx)(oT, { children: a && !o ? /* @__PURE__ */ (0, P.jsx)(aT, {
			overlayView: n,
			defaultSizeKey: i,
			children: s
		}) : s })
	});
}
if (rT) {
	ZS();
	let t = tC();
	e.ready(KS), e.onToolCall(async (n) => {
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
	ZS({ startReminders: !e.inHost });
	let t = document.getElementById("root");
	t && (0, mx.createRoot)(t).render(/* @__PURE__ */ (0, P.jsx)(sT, {}));
}
//#endregion
