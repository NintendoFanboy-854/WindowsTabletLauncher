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
	function ee(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var x = ee.prototype = new b();
	x.constructor = ee, _(x, y.prototype), x.isPureReactComponent = !0;
	var te = Array.isArray;
	function S() {}
	var C = {
		H: null,
		A: null,
		T: null,
		S: null
	}, ne = Object.prototype.hasOwnProperty;
	function w(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function re(e, t) {
		return w(e.type, t, e.props);
	}
	function ie(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function ae(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var oe = /\/+/g;
	function se(e, t) {
		return typeof e == "object" && e && e.key != null ? ae("" + e.key) : t.toString(36);
	}
	function T(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(S, S) : (e.status = "pending", e.then(function(t) {
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
	function ce(e, r, i, a, o) {
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
				case d: return c = e._init, ce(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + se(e, 0) : a, te(o) ? (i = "", c != null && (i = c.replace(oe, "$&/") + "/"), ce(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ie(o) && (o = re(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(oe, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (te(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + se(a, u), c += ce(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + se(a, u++), c += ce(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ce(T(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function le(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ce(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function ue(e) {
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
	var de = typeof reportError == "function" ? reportError : function(e) {
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
	function fe(e) {
		var t = C.T, n = {};
		n.types = t === null ? null : t.types, C.T = n;
		try {
			var r = e(), i = C.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(S, de);
		} catch (e) {
			de(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), C.T = t;
		}
	}
	function pe(e) {
		var t = C.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else fe(pe.bind(null, e));
	}
	var me = {
		map: le,
		forEach: function(e, t, n) {
			le(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return le(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return le(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!ie(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = me, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = ee, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = C, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return C.H.useMemoCache(e);
		}
	}, e.addTransitionType = pe, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !ne.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return w(e.type, i, r);
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
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) ne.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return w(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = ie, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: ue
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = fe, e.unstable_useCacheRefresh = function() {
		return C.H.useCacheRefresh();
	}, e.use = function(e) {
		return C.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return C.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return C.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return C.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return C.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return C.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return C.H.useEffectEvent(e);
	}, e.useId = function() {
		return C.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return C.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return C.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return C.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return C.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return C.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return C.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return C.H.useRef(e);
	}, e.useState = function(e) {
		return C.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return C.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return C.H.useTransition();
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
	function ee(e) {
		if (h = !1, b(e), !m) {
			if (n(c) !== null) m = !0, x || (x = !0, re());
			else {
				var t = n(l);
				t !== null && oe(ee, t.startTime - e);
			}
		}
	}
	var x = !1, te = -1, S = 5, C = -1;
	function ne() {
		return g ? !0 : !(e.unstable_now() - C < S);
	}
	function w() {
		if (g = !1, x) {
			var t = e.unstable_now();
			C = t;
			var i = !0;
			try {
				a: {
					m = !1, h && (h = !1, v(te), te = -1), p = !0;
					var a = f;
					try {
						b: {
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && ne());) {
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
								u !== null && oe(ee, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
					i = void 0;
				}
			} finally {
				i ? re() : x = !1;
			}
		}
	}
	var re;
	if (typeof y == "function") re = function() {
		y(w);
	};
	else if (typeof MessageChannel < "u") {
		var ie = new MessageChannel(), ae = ie.port2;
		ie.port1.onmessage = w, re = function() {
			ae.postMessage(null);
		};
	} else re = function() {
		_(w, 0);
	};
	function oe(t, n) {
		te = _(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : S = 0 < e ? Math.floor(1e3 / e) : 5;
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
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(te), te = -1) : h = !0, oe(ee, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, x || (x = !0, re()))), r;
	}, e.unstable_shouldYield = ne, e.unstable_wrapCallback = function(e) {
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
	var ee = null, x = null;
	function te(e, t, n) {
		return e === n || e === t && (ee = e, !0);
	}
	function S(e, t, n) {
		return e === n ? (x = e, !1) : e === t && (x !== null && (ee = e), !0);
	}
	function C(e) {
		if (e === null) return null;
		do
			e = e === null ? null : e.return;
		while (e && e.tag !== 5 && e.tag !== 27 && e.tag !== 3);
		return e || null;
	}
	function ne(e, t, n) {
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
	var w = Object.assign, re = Symbol.for("react.element"), ie = Symbol.for("react.transitional.element"), ae = Symbol.for("react.portal"), oe = Symbol.for("react.fragment"), se = Symbol.for("react.strict_mode"), T = Symbol.for("react.profiler"), ce = Symbol.for("react.consumer"), le = Symbol.for("react.context"), ue = Symbol.for("react.forward_ref"), de = Symbol.for("react.suspense"), fe = Symbol.for("react.suspense_list"), pe = Symbol.for("react.memo"), me = Symbol.for("react.lazy"), he = Symbol.for("react.activity"), ge = Symbol.for("react.legacy_hidden"), _e = Symbol.for("react.memo_cache_sentinel"), ve = Symbol.for("react.view_transition"), ye = Symbol.for("react.recoverable"), be = Symbol.iterator;
	function xe(e) {
		return typeof e != "object" || !e ? null : (e = be && e[be] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var Se = Symbol.for("react.client.reference");
	function Ce(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === Se ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case oe: return "Fragment";
			case T: return "Profiler";
			case se: return "StrictMode";
			case de: return "Suspense";
			case fe: return "SuspenseList";
			case he: return "Activity";
			case ve: return "ViewTransition";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case ae: return "Portal";
			case le: return e.displayName || "Context";
			case ce: return (e._context.displayName || "Context") + ".Consumer";
			case ue:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case pe: return t = e.displayName || null, t === null ? Ce(e.type) || "Memo" : t;
			case me:
				t = e._payload, e = e._init;
				try {
					return Ce(e(t));
				} catch {}
		}
		return null;
	}
	var we = Array.isArray, E = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, D = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Te = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, Ee = [], De = -1;
	function Oe(e) {
		return { current: e };
	}
	function ke(e) {
		0 > De || (e.current = Ee[De], Ee[De] = null, De--);
	}
	function Ae(e, t) {
		De++, Ee[De] = e.current, e.current = t;
	}
	var je = Oe(null), Me = Oe(null), Ne = Oe(null), Pe = Oe(null);
	function Fe(e, t) {
		switch (Ae(Ne, t), Ae(Me, e), Ae(je, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? up(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = up(t), e = dp(t, e);
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
		ke(je), Ae(je, e);
	}
	function Ie() {
		ke(je), ke(Me), ke(Ne);
	}
	function Le(e) {
		var t = e.memoizedState;
		t !== null && (sh._currentValue = t.memoizedState, Ae(Pe, e)), t = je.current;
		var n = dp(t, e.type);
		t !== n && (Ae(Me, e), Ae(je, n));
	}
	function Re(e) {
		Me.current === e && (ke(je), ke(Me)), Pe.current === e && (ke(Pe), sh._currentValue = Te);
	}
	var ze, Be;
	function Ve(e) {
		if (ze === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			ze = t && t[1] || "", Be = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + ze + e + Be;
	}
	var He = !1;
	function Ue(e, t) {
		if (!e || He) return "";
		He = !0;
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
			He = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? Ve(n) : "";
	}
	function We(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return Ve(e.type);
			case 16: return Ve("Lazy");
			case 13: return e.child !== t && t !== null ? Ve("Suspense Fallback") : Ve("Suspense");
			case 19: return Ve("SuspenseList");
			case 0:
			case 15: return Ue(e.type, !1);
			case 11: return Ue(e.type.render, !1);
			case 1: return Ue(e.type, !0);
			case 31: return Ve("Activity");
			case 30: return Ve("ViewTransition");
			default: return "";
		}
	}
	function Ge(e) {
		try {
			var t = "", n = null;
			do
				t += We(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var Ke = Object.prototype.hasOwnProperty, qe = t.unstable_scheduleCallback, Je = t.unstable_cancelCallback, Ye = t.unstable_shouldYield, Xe = t.unstable_requestPaint, Ze = t.unstable_now, Qe = t.unstable_getCurrentPriorityLevel, $e = t.unstable_ImmediatePriority, et = t.unstable_UserBlockingPriority, tt = t.unstable_NormalPriority, nt = t.unstable_LowPriority, rt = t.unstable_IdlePriority, it = t.log, at = t.unstable_setDisableYieldValue, ot = null, st = null;
	function ct(e) {
		if (typeof it == "function" && at(e), st && typeof st.setStrictMode == "function") try {
			st.setStrictMode(ot, e);
		} catch {}
	}
	var lt = Math.clz32 ? Math.clz32 : ft, ut = Math.log, dt = Math.LN2;
	function ft(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (ut(e) / dt | 0) | 0;
	}
	var pt = 256, mt = 262144, ht = 4194304;
	function gt(e) {
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
	function _t(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = gt(n))) : i = gt(o) : i = gt(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = gt(n))) : i = gt(o)) : i = gt(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function vt(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function yt(e, t) {
		t & 8 && (t |= t & 32);
		var n = e.entangledLanes;
		if (n !== 0) for (e = e.entanglements, n &= t; 0 < n;) {
			var r = 31 - lt(n), i = 1 << r;
			t |= e[r], n &= ~i;
		}
		return t;
	}
	function bt(e, t) {
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
	function xt() {
		var e = ht;
		return ht <<= 1, !(ht & 62914560) && (ht = 4194304), e;
	}
	function St(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function Ct(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function wt(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - lt(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && Tt(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function Tt(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - lt(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function Et(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - lt(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function Dt(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : Ot(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function Ot(e) {
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
	function kt(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function At() {
		var e = D.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : Ch(e.type)) : e;
	}
	function jt(e, t) {
		var n = D.p;
		try {
			return D.p = e, t();
		} finally {
			D.p = n;
		}
	}
	var Mt = Math.random().toString(36).slice(2), Nt = "__reactFiber$" + Mt, Pt = "__reactProps$" + Mt, Ft = "__reactContainer$" + Mt, It = "__reactEvents$" + Mt, Lt = "__reactListeners$" + Mt, O = "__reactHandles$" + Mt, Rt = "__reactResources$" + Mt, zt = "__reactMarker$" + Mt, Bt = "__reactLoad$" + Mt;
	function Vt(e) {
		delete e[Nt], delete e[Pt], delete e[Lt], delete e[O];
	}
	function Ht(e) {
		var t;
		if (t = e[Nt]) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[Ft] || n[Nt]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = fm(e); e !== null;) {
					if (n = e[Nt]) return n;
					e = fm(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function Ut(e) {
		if (e = e[Nt] || e[Ft]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function Wt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(i(33));
	}
	function Gt(e) {
		var t = e[Rt];
		return t ||= e[Rt] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function Kt(e) {
		e[zt] = !0;
	}
	function qt(e) {
		e[Bt] = void 0;
	}
	var Jt = /* @__PURE__ */ new Set(), Yt = {};
	function Xt(e, t) {
		Zt(e, t), Zt(e + "Capture", t);
	}
	function Zt(e, t) {
		for (Yt[e] = t, e = 0; e < t.length; e++) Jt.add(t[e]);
	}
	var Qt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), $t = {}, en = {};
	function tn(e) {
		return Ke.call(en, e) ? !0 : Ke.call($t, e) ? !1 : Qt.test(e) ? en[e] = !0 : ($t[e] = !0, !1);
	}
	var k = !1;
	function nn() {
		var e = k;
		return k = !1, e;
	}
	function rn(e, t, n) {
		if (tn(t)) {
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
	function an(e, t, n) {
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
	function on(e, t, n, r) {
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
	function sn(e) {
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
	function cn(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function ln(e, t, n) {
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
	function un(e) {
		if (!e._valueTracker) {
			var t = cn(e) ? "checked" : "value";
			e._valueTracker = ln(e, t, "" + e[t]);
		}
	}
	function dn(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = cn(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	var fn = /[\n"\\]/g;
	function pn(e) {
		return e.replace(fn, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function mn(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + sn(t)) : e.value !== "" + sn(t) && (e.value = "" + sn(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : gn(e, sn(n)) : o === "number" && e.value == t ? gn(e, sn(e.value)) : gn(e, sn(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + sn(s) : e.removeAttribute("name");
	}
	function hn(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				un(e);
				return;
			}
			n = n == null ? "" : "" + sn(n), t = t == null ? n : "" + sn(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), un(e);
	}
	function gn(e, t) {
		e.defaultValue !== "" + t && (e.defaultValue = "" + t);
	}
	function _n(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + sn(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function vn(e, t, n) {
		t != null && (t = "" + sn(t), t !== e.value && (e.value = t), n == null) ? e.defaultValue !== t && (e.defaultValue = t) : e.defaultValue = n == null ? "" : "" + sn(n);
	}
	function yn(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(i(92));
				if (we(r)) {
					if (1 < r.length) throw Error(i(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = sn(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), un(e);
	}
	function bn(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var xn = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function Sn(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || xn.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function Cn(e, t, n) {
		if (t != null && typeof t != "object") throw Error(i(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "", k = !0);
			for (var a in t) r = t[a], t.hasOwnProperty(a) && n[a] !== r && (Sn(e, a, r), k = !0);
		} else for (var o in t) t.hasOwnProperty(o) && Sn(e, o, t[o]);
	}
	function wn(e) {
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
	var Tn = /* @__PURE__ */ new Map([
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
	]), En = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function Dn(e) {
		return En.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function On() {}
	var kn = null;
	function An(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var jn = null, Mn = null;
	function Nn(e) {
		var t = Ut(e);
		if (t && (e = t.stateNode)) {
			var n = e[Pt] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (mn(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + pn("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var a = r[Pt] || null;
								if (!a) throw Error(i(90));
								mn(r, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && dn(r);
					}
					break a;
				case "textarea":
					vn(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && _n(e, !!n.multiple, t, !1);
			}
		}
	}
	var Pn = !1;
	function Fn(e, t, n) {
		if (Pn) return e(t, n);
		Pn = !0;
		try {
			return e(t);
		} finally {
			if (Pn = !1, (jn !== null || Mn !== null) && (zd(), jn && (t = jn, e = Mn, Mn = jn = null, Nn(t), e))) for (t = 0; t < e.length; t++) Nn(e[t]);
		}
	}
	function In(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[Pt] || null;
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
	var Ln = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, Rn = !1;
	if (Ln) try {
		var zn = {};
		Object.defineProperty(zn, "passive", { get: function() {
			Rn = !0;
		} }), window.addEventListener("test", zn, zn), window.removeEventListener("test", zn, zn);
	} catch {
		Rn = !1;
	}
	var Bn = null, Vn = null, A = null;
	function Hn() {
		if (A) return A;
		var e, t = Vn, n = t.length, r, i = "value" in Bn ? Bn.value : Bn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return A = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Un(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Wn() {
		return !0;
	}
	function j() {
		return !1;
	}
	function Gn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Wn : j, this.isPropagationStopped = j, this;
		}
		return w(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Wn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Wn);
			},
			persist: function() {},
			isPersistent: Wn
		}), t;
	}
	var Kn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, qn = Gn(Kn), Jn = w({}, Kn, {
		view: 0,
		detail: 0
	}), Yn = Gn(Jn), Xn, Zn, Qn, $n = w({}, Jn, {
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
		getModifierState: M,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Qn && (Qn && e.type === "mousemove" ? (Xn = e.screenX - Qn.screenX, Zn = e.screenY - Qn.screenY) : Zn = Xn = 0, Qn = e), Xn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Zn;
		}
	}), er = Gn($n), tr = Gn(w({}, $n, { dataTransfer: 0 })), nr = Gn(w({}, Jn, { relatedTarget: 0 })), rr = Gn(w({}, Kn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), ir = Gn(w({}, Kn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), ar = Gn(w({}, Kn, { data: 0 })), or = {
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
	}, sr = {
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
	}, cr = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function lr(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = cr[e]) ? !!t[e] : !1;
	}
	function M() {
		return lr;
	}
	var ur = Gn(w({}, Jn, {
		key: function(e) {
			if (e.key) {
				var t = or[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Un(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? sr[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: M,
		charCode: function(e) {
			return e.type === "keypress" ? Un(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Un(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), dr = Gn(w({}, $n, {
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
	})), fr = Gn(w({}, Kn, { submitter: 0 })), pr = Gn(w({}, Jn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: M
	})), mr = Gn(w({}, Kn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), hr = Gn(w({}, $n, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), gr = Gn(w({}, Kn, {
		newState: 0,
		oldState: 0,
		source: 0
	})), _r = [
		9,
		13,
		27,
		32
	], vr = Ln && "CompositionEvent" in window, yr = null;
	Ln && "documentMode" in document && (yr = document.documentMode);
	var br = Ln && "TextEvent" in window && !yr, xr = Ln && (!vr || yr && 8 < yr && 11 >= yr), Sr = " ", Cr = !1;
	function wr(e, t) {
		switch (e) {
			case "keyup": return _r.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function Tr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var Er = !1;
	function Dr(e, t) {
		switch (e) {
			case "compositionend": return Tr(t);
			case "keypress": return t.which === 32 ? (Cr = !0, Sr) : null;
			case "textInput": return e = t.data, e === Sr && Cr ? null : e;
			default: return null;
		}
	}
	function Or(e, t) {
		if (Er) return e === "compositionend" || !vr && wr(e, t) ? (e = Hn(), A = Vn = Bn = null, Er = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return xr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var kr = {
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
	function Ar(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!kr[e.type] : t === "textarea";
	}
	function jr(e, t, n, r) {
		jn ? Mn ? Mn.push(r) : Mn = [r] : jn = r, t = Jf(t, "onChange"), 0 < t.length && (n = new qn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var Mr = null, Nr = null;
	function Pr(e) {
		Vf(e, 0);
	}
	function Fr(e) {
		if (dn(Wt(e))) return e;
	}
	function Ir(e, t) {
		if (e === "change") return t;
	}
	var Lr = !1;
	if (Ln) {
		var Rr;
		if (Ln) {
			var zr = "oninput" in document;
			if (!zr) {
				var Br = document.createElement("div");
				Br.setAttribute("oninput", "return;"), zr = typeof Br.oninput == "function";
			}
			Rr = zr;
		} else Rr = !1;
		Lr = Rr && (!document.documentMode || 9 < document.documentMode);
	}
	function Vr() {
		Mr && (Mr.detachEvent("onpropertychange", Hr), Nr = Mr = null);
	}
	function Hr(e) {
		if (e.propertyName === "value" && Fr(Nr)) {
			var t = [];
			jr(t, Nr, e, An(e)), Fn(Pr, t);
		}
	}
	function Ur(e, t, n) {
		e === "focusin" ? (Vr(), Mr = t, Nr = n, Mr.attachEvent("onpropertychange", Hr)) : e === "focusout" && Vr();
	}
	function Wr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return Fr(Nr);
	}
	function Gr(e, t) {
		if (e === "click") return Fr(t);
	}
	function Kr(e, t) {
		if (e === "input" || e === "change") return Fr(t);
	}
	function qr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Jr = typeof Object.is == "function" ? Object.is : qr;
	function Yr(e, t) {
		if (Jr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Ke.call(t, i) || !Jr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Xr(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function Zr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Qr(e, t) {
		var n = Zr(e);
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
			n = Zr(n);
		}
	}
	function $r(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? $r(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function ei(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Xr(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Xr(e.document);
		}
		return t;
	}
	function ti(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var ni = Ln && "documentMode" in document && 11 >= document.documentMode, ri = null, ii = null, ai = null, oi = !1;
	function si(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		oi || ri == null || ri !== Xr(r) || (r = ri, "selectionStart" in r && ti(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), ai && Yr(ai, r) || (ai = r, r = Jf(ii, "onSelect"), 0 < r.length && (t = new qn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = ri)));
	}
	function ci(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var li = {
		animationend: ci("Animation", "AnimationEnd"),
		animationiteration: ci("Animation", "AnimationIteration"),
		animationstart: ci("Animation", "AnimationStart"),
		transitionrun: ci("Transition", "TransitionRun"),
		transitionstart: ci("Transition", "TransitionStart"),
		transitioncancel: ci("Transition", "TransitionCancel"),
		transitionend: ci("Transition", "TransitionEnd")
	}, ui = {}, di = {};
	Ln && (di = document.createElement("div").style, "AnimationEvent" in window || (delete li.animationend.animation, delete li.animationiteration.animation, delete li.animationstart.animation), "TransitionEvent" in window || delete li.transitionend.transition);
	function fi(e) {
		if (ui[e]) return ui[e];
		if (!li[e]) return e;
		var t = li[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in di) return ui[e] = t[n];
		return e;
	}
	var pi = fi("animationend"), mi = fi("animationiteration"), hi = fi("animationstart"), gi = fi("transitionrun"), _i = fi("transitionstart"), vi = fi("transitioncancel"), yi = fi("transitionend"), bi = /* @__PURE__ */ new Map(), xi = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	xi.push("scrollEnd");
	function Si(e, t) {
		bi.set(e, t), Xt(t, [e]);
	}
	var Ci = 0;
	function wi(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = bd.identifierPrefix;
		var n = Ci++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function Ti(e) {
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
	function Ei(e, t) {
		return e = Ti(e), t = Ti(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
	}
	var Di = typeof reportError == "function" ? reportError : function(e) {
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
	}, Oi = [], ki = 0, Ai = 0;
	function ji() {
		for (var e = ki, t = Ai = ki = 0; t < e;) {
			var n = Oi[t];
			Oi[t++] = null;
			var r = Oi[t];
			Oi[t++] = null;
			var i = Oi[t];
			Oi[t++] = null;
			var a = Oi[t];
			if (Oi[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Fi(n, i, a);
		}
	}
	function Mi(e, t, n, r) {
		Oi[ki++] = e, Oi[ki++] = t, Oi[ki++] = n, Oi[ki++] = r, Ai |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function Ni(e, t, n, r) {
		return Mi(e, t, n, r), Ii(e);
	}
	function Pi(e, t) {
		return Mi(e, null, null, t), Ii(e);
	}
	function Fi(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - lt(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function Ii(e) {
		if (50 < kd) throw kd = 0, Ad = null, Error(i(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var Li = {};
	function Ri(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function zi(e, t, n, r) {
		return new Ri(e, t, n, r);
	}
	function Bi(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Vi(e, t) {
		var n = e.alternate;
		return n === null ? (n = zi(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 1206910976, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function Hi(e, t) {
		e.flags &= 1206910978;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function Ui(e, t, n, r, a, o) {
		var s = 0;
		if (r = e, typeof r == "function") Bi(r) && (s = 1);
		else if (typeof r == "string") s = qm(e, n, je.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case he: return e = zi(31, n, t, a), e.elementType = he, e.lanes = o, e;
			case oe: return Wi(n.children, a, o, t);
			case se:
				s = 8, a |= 24;
				break;
			case T: return e = zi(12, n, t, a | 2), e.elementType = T, e.lanes = o, e;
			case de: return e = zi(13, n, t, a), e.elementType = de, e.lanes = o, e;
			case fe: return e = zi(19, n, t, a), e.elementType = fe, e.lanes = o, e;
			case ge:
			case ve: return e = a | 32, e = zi(30, n, t, e), e.elementType = ve, e.lanes = o, e.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, e;
			default:
				if (typeof r == "object" && r) switch (r.$$typeof) {
					case le:
						s = 10;
						break a;
					case ce:
						s = 9;
						break a;
					case ue:
						s = 11;
						break a;
					case pe:
						s = 14;
						break a;
					case me:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(i(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = zi(s, n, t, a), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function Wi(e, t, n, r) {
		return e = zi(7, e, r, t), e.lanes = n, e;
	}
	function Gi(e, t, n) {
		return e = zi(6, e, null, t), e.lanes = n, e;
	}
	function Ki(e) {
		var t = zi(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function qi(e, t, n) {
		return t = zi(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Ji = /* @__PURE__ */ new WeakMap();
	function N(e, t) {
		if (typeof e == "object" && e) {
			var n = Ji.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: Ge(t)
			}, Ji.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: Ge(t)
		};
	}
	var Yi = [], Xi = 0, Zi = null, Qi = 0, $i = [], P = 0, ea = null, ta = 1, na = "";
	function ra(e, t) {
		Yi[Xi++] = Qi, Yi[Xi++] = Zi, Zi = e, Qi = t;
	}
	function ia(e, t, n) {
		$i[P++] = ta, $i[P++] = na, $i[P++] = ea, ea = e;
		var r = ta;
		e = na;
		var i = 32 - lt(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - lt(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, ta = 1 << 32 - lt(t) + i | n << i | r, na = a + e;
		} else ta = 1 << a | n << i | r, na = e;
	}
	function aa(e) {
		e.return !== null && (ra(e, 1), ia(e, 1, 0));
	}
	function oa(e) {
		for (; e === Zi;) Zi = Yi[--Xi], Yi[Xi] = null, Qi = Yi[--Xi], Yi[Xi] = null;
		for (; e === ea;) ea = $i[--P], $i[P] = null, na = $i[--P], $i[P] = null, ta = $i[--P], $i[P] = null;
	}
	function sa(e, t) {
		$i[P++] = ta, $i[P++] = na, $i[P++] = ea, ta = t.id, na = t.overflow, ea = e;
	}
	var ca = null, F = null, I = !1, la = null, ua = !1, da = Error(i(519));
	function fa(e) {
		throw va(N(Error(i(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), da;
	}
	function pa(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[Nt] = e, t[Pt] = r, n) {
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
				Q("invalid", t), hn(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), yn(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || ep(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = On), t = !0) : t = !1, t || fa(e, !0);
	}
	function ma(e) {
		for (ca = e.return; ca;) switch (ca.tag) {
			case 5:
			case 31:
			case 13:
				ua = !1;
				return;
			case 27:
			case 3:
				ua = !0;
				return;
			default: ca = ca.return;
		}
	}
	function ha(e) {
		if (e !== ca) return !1;
		if (!I) return ma(e), I = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || pp(e.type, e.memoizedProps)), n = !n), n && F && fa(e), ma(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			F = dm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			F = dm(e);
		} else t === 27 ? (t = F, Sp(e.type) ? (e = um, um = null, F = e) : F = t) : F = ca ? lm(e.stateNode.nextSibling) : null;
		return !0;
	}
	function ga() {
		F = ca = null, I = !1;
	}
	function _a() {
		var e = la;
		return e !== null && (fd === null ? fd = e : fd.push.apply(fd, e), la = null), e;
	}
	function va(e) {
		la === null ? la = [e] : la.push(e);
	}
	var ya = Oe(null), ba = null, xa = null;
	function Sa(e, t, n) {
		Ae(ya, t._currentValue), t._currentValue = n;
	}
	function Ca(e) {
		e._currentValue = ya.current, ke(ya);
	}
	function wa(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Ta(e, t, n, r) {
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
						o.lanes |= n, c = o.alternate, c !== null && (c.lanes |= n), wa(o.return, n, e), r || (s = null);
						break a;
					}
					o = c.next;
				}
			} else if (a.tag === 18) {
				if (s = a.return, s === null) throw Error(i(341));
				s.lanes |= n, o = s.alternate, o !== null && (o.lanes |= n), wa(s, n, e), s = null;
			} else a.tag === 13 && a.memoizedState !== null && a.memoizedState.dehydrated === null ? (a.lanes |= n, s = a.alternate, s !== null && (s.lanes |= n), wa(a.return, n, e), s = a.child, s = s === null ? null : s.sibling) : s = a.child;
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
	function Ea(e, t, n, r) {
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
					Jr(a.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (a === Pe.current) {
				if (s = a.alternate, s === null) throw Error(i(387));
				s.memoizedState.memoizedState !== a.memoizedState.memoizedState && (e === null ? e = [sh] : e.push(sh));
			}
			a = a.return;
		}
		return e !== null && Ta(t, e, n, r), t.flags |= 262144, e !== null;
	}
	function Da(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Jr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function Oa(e) {
		ba = e, xa = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function ka(e) {
		return ja(ba, e);
	}
	function Aa(e, t) {
		return ba === null && Oa(e), ja(e, t);
	}
	function ja(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, xa === null) {
			if (e === null) throw Error(i(308));
			xa = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else xa = xa.next = t;
		return n;
	}
	var Ma = typeof AbortController < "u" ? AbortController : function() {
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
	}, Na = t.unstable_scheduleCallback, Pa = t.unstable_NormalPriority, L = {
		$$typeof: le,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function Fa() {
		return {
			controller: new Ma(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function R(e) {
		e.refCount--, e.refCount === 0 && Na(Pa, function() {
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
	var Ka = E.S;
	E.S = function(e, t) {
		if (hd = Ze(), typeof t == "object" && t && typeof t.then == "function" && Ua(e, t), La !== null) for (var n = bf; n !== null;) Ia(n, La), n = n.next;
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
	var qa = Oe(null);
	function Ja() {
		var e = qa.current;
		return e === null ? $u.pooledCache : e;
	}
	function Ya(e, t) {
		t === null ? Ae(qa, qa.current) : Ae(qa, t.pool);
	}
	function Xa() {
		var e = Ja();
		return e === null ? null : {
			parent: L._currentValue,
			pool: e
		};
	}
	var z = Error(i(460)), Za = Error(i(474)), Qa = Error(i(542)), $a = { then: function() {} };
	function B(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function eo(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(On, On), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, io(e), e === void 0 && !("reason" in t) ? Error(i(600)) : e;
			default:
				if (typeof t.status == "string") t.then(On, On);
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
				throw no = t, z;
		}
	}
	function to(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (no = e, z) : e;
		}
	}
	var no = null;
	function ro() {
		if (no === null) throw Error(i(459));
		var e = no;
		return no = null, e;
	}
	function io(e) {
		if (e === z || e === Qa) throw Error(i(483));
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
		throw t.$$typeof === re ? Error(i(525)) : (e = Object.prototype.toString.call(t), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
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
			return e = Vi(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 134217730, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 134217730), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Gi(n, e.mode, r), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var i = n.type;
			return i === oe ? (e = d(e, t, n.props.children, r, n.key), co(e, n), e) : t !== null && (t.elementType === i || typeof i == "object" && i && i.$$typeof === me && to(i) === t.type) ? (t = a(t, n.props), co(t, n), t.return = e, t) : (t = Ui(n.type, n.key, n.props, null, e.mode, r), co(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = qi(n, e.mode, r), t.return = e, t) : (t = a(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, i) {
			return t === null || t.tag !== 7 ? (t = Wi(n, e.mode, r, i), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Gi("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case ie: return n = Ui(t.type, t.key, t.props, null, e.mode, n), co(n, t), n.return = e, n;
					case ae: return t = qi(t, e.mode, n), t.return = e, t;
					case me: return t = to(t), f(e, t, n);
				}
				if (we(t) || xe(t)) return t = Wi(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, so(t), n);
				if (t.$$typeof === le) return f(e, Aa(e, t), n);
				lo(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case ie: return n.key === i ? l(e, t, n, r) : null;
					case ae: return n.key === i ? u(e, t, n, r) : null;
					case me: return n = to(n), p(e, t, n, r);
				}
				if (we(n) || xe(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, so(n), r);
				if (n.$$typeof === le) return p(e, t, Aa(e, n), r);
				lo(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case ie: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case ae: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case me: return r = to(r), m(e, t, n, r, i);
				}
				if (we(r) || xe(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, so(r), i);
				if (r.$$typeof === le) return m(e, t, n, Aa(t, r), i);
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
			if (h === s.length) return n(i, d), I && ra(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return I && ra(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), I && ra(i, h), l;
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
			if (v.done) return n(a, h), I && ra(a, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(a, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return I && ra(a, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, a, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(a, e);
			}), I && ra(a, g), u;
		}
		function _(e, r, o, c) {
			if (typeof o == "object" && o && o.type === oe && o.key === null && o.props.ref === void 0 && (o = o.props.children), typeof o == "object" && o) {
				switch (o.$$typeof) {
					case ie:
						a: {
							for (var l = o.key; r !== null;) {
								if (r.key === l) {
									if (l = o.type, l === oe) {
										if (r.tag === 7) {
											n(e, r.sibling), c = a(r, o.props.children), co(c, o), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === me && to(l) === r.type) {
										n(e, r.sibling), c = a(r, o.props), co(c, o), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							o.type === oe ? (c = Wi(o.props.children, e.mode, c, o.key), co(c, o), c.return = e, e = c) : (c = Ui(o.type, o.key, o.props, null, e.mode, c), co(c, o), c.return = e, e = c);
						}
						return s(e);
					case ae:
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
							c = qi(o, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case me: return o = to(o), _(e, r, o, c);
				}
				if (we(o)) return h(e, r, o, c);
				if (xe(o)) {
					if (l = xe(o), typeof l != "function") throw Error(i(150));
					return o = l.call(o), g(e, r, o, c);
				}
				if (typeof o.then == "function") return _(e, r, so(o), c);
				if (o.$$typeof === le) return _(e, r, Aa(e, o), c);
				lo(e, o);
			}
			return typeof o == "string" && o !== "" || typeof o == "number" || typeof o == "bigint" ? (o = "" + o, r !== null && r.tag === 6 ? (n(e, r.sibling), c = a(r, o), c.return = e, e = c) : (n(e, r), c = Gi(o, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				oo = 0;
				var i = _(e, t, n, r);
				return ao = null, i;
			} catch (t) {
				if (t === z || t === Qa) throw t;
				var a = zi(29, t, null, e.mode);
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
		if (r = r.shared, q & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = Ii(e), Fi(e, null, n), t;
		}
		return Mi(e, r, t, n), Ii(e);
	}
	function yo(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Et(e, n);
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
			var e = Ha;
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
					f !== 0 && f === Va && (xo = !0), u !== null && (u = u.next = {
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
								d = w({}, d, f);
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
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), od |= o, e.lanes = o, e.memoizedState = d;
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
	var Eo = Oe(null), Do = Oe(0);
	function Oo(e, t) {
		e = id, Ae(Do, e), Ae(Eo, t), id = e | t.baseLanes;
	}
	function ko() {
		Ae(Do, id), Ae(Eo, Eo.current);
	}
	function Ao() {
		id = Do.current, ke(Eo), ke(Do);
	}
	var jo = Oe(null), Mo = null;
	function No(e) {
		var t = e.alternate;
		Ae(Ro, Ro.current & 1), Ae(jo, e), Mo === null && (t === null || Eo.current !== null || t.memoizedState !== null) && (Mo = e);
	}
	function Po(e) {
		Ae(Ro, Ro.current), Ae(jo, e), Mo === null && (Mo = e);
	}
	function Fo(e) {
		e.tag === 22 ? (Ae(Ro, Ro.current), Ae(jo, e), Mo === null && (Mo = e)) : Io();
	}
	function Io() {
		Ae(Ro, Ro.current), Ae(jo, jo.current);
	}
	function Lo(e) {
		ke(jo), Mo === e && (Mo = null), ke(Ro);
	}
	var Ro = Oe(0);
	function zo(e, t) {
		Ae(jo, jo.current), Ae(Ro, t);
	}
	function Bo(e) {
		ke(Ro), ke(jo), Mo === e && (Mo = null);
	}
	function Vo(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || om(n) || sm(n))) return t;
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
	var Ho = 0, V = null, H = null, Uo = null, U = !1, Wo = !1, Go = !1, Ko = 0, qo = 0, Jo = null, Yo = 0;
	function Xo() {
		throw Error(i(321));
	}
	function Zo(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Jr(e[n], t[n])) return !1;
		return !0;
	}
	function Qo(e, t, n, r, i, a) {
		return Ho = a, V = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, E.H = e === null || e.memoizedState === null ? hc : gc, Go = !1, a = n(r, i), Go = !1, Wo && (a = es(t, n, r, i)), $o(e), a;
	}
	function $o(e) {
		E.H = mc;
		var t = H !== null && H.next !== null;
		if (Ho = 0, Uo = H = V = null, U = !1, qo = 0, Jo = null, t) throw Error(i(300));
		e === null || Nc || (e = e.dependencies, e !== null && Da(e) && (Nc = !0));
	}
	function es(e, t, n, r) {
		V = e;
		var a = 0;
		do {
			if (Wo && (Jo = null), qo = 0, Wo = !1, 25 <= a) throw Error(i(301));
			if (a += 1, Uo = H = null, e.updateQueue != null) {
				var o = e.updateQueue;
				o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
			}
			E.H = _c, o = t(n, r);
		} while (Wo);
		return o;
	}
	function ts() {
		var e = E.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? cs(t) : t, e = e.useState()[0], (H === null ? null : H.memoizedState) !== e && (V.flags |= 1024), t;
	}
	function ns() {
		var e = Ko !== 0;
		return Ko = 0, e;
	}
	function rs(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function is(e) {
		if (U) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			U = !1;
		}
		Ho = 0, Uo = H = V = null, Wo = !1, qo = Ko = 0, Jo = null;
	}
	function as() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return Uo === null ? V.memoizedState = Uo = e : Uo = Uo.next = e, Uo;
	}
	function os() {
		if (H === null) {
			var e = V.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = H.next;
		var t = Uo === null ? V.memoizedState : Uo.next;
		if (t !== null) Uo = t, H = e;
		else {
			if (e === null) throw V.alternate === null ? Error(i(467)) : Error(i(310));
			H = e, e = {
				memoizedState: H.memoizedState,
				baseState: H.baseState,
				baseQueue: H.baseQueue,
				queue: H.queue,
				next: null
			}, Uo === null ? V.memoizedState = Uo = e : Uo = Uo.next = e;
		}
		return Uo;
	}
	function ss() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function cs(e) {
		var t = qo;
		return qo += 1, Jo === null && (Jo = []), e = eo(Jo, e, t), t = V, (Uo === null ? t.memoizedState : Uo.next) === null && (t = t.alternate, E.H = t === null || t.memoizedState === null ? hc : gc), e;
	}
	function ls(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return cs(e);
			if (e.$$typeof === ye) return;
			if (e.$$typeof === le) return ka(e);
		}
		throw Error(i(438, String(e)));
	}
	function us(e) {
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
		}, n === null && (n = ss(), V.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = _e;
		return t.index++, n;
	}
	function ds(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function fs(e) {
		return ps(os(), H, e);
	}
	function ps(e, t, n) {
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
					}), f === Va && (d = !0);
					else if ((Ho & p) === p) {
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
					}, l === null ? (c = l = f, s = o) : l = l.next = f, V.lanes |= p, od |= p;
					f = u.action, Go && n(o, f), o = u.hasEagerState ? u.eagerState : n(o, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = o) : l = l.next = p, V.lanes |= f, od |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = o : l.next = c, !Jr(o, e.memoizedState) && (Nc = !0, d && (n = Ha, n !== null))) throw n;
			e.memoizedState = o, e.baseState = s, e.baseQueue = l, r.lastRenderedState = o;
		}
		return a === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function ms(e) {
		var t = os(), n = t.queue;
		if (n === null) throw Error(i(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, a = n.pending, o = t.memoizedState;
		if (a !== null) {
			n.pending = null;
			var s = a = a.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== a);
			Jr(o, t.memoizedState) || (Nc = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function hs(e, t, n) {
		var r = V, a = os(), o = I;
		if (o) {
			if (n === void 0) throw Error(i(407));
			n = n();
		} else n = t();
		var s = !Jr((H || a).memoizedState, n);
		if (s && (a.memoizedState = n, Nc = !0), a = a.queue, Bs(vs.bind(null, r, a, e), [e]), e = a.getSnapshot !== t || s || Uo !== null && !!(Uo.memoizedState.tag & 1), Fs(e ? 9 : 8, { destroy: void 0 }, _s.bind(null, r, a, n, t), null), e) {
			if (r.flags |= 2048, $u === null) throw Error(i(349));
			o || Ho & 127 || gs(r, t, n);
		}
		return n;
	}
	function gs(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = V.updateQueue, t === null ? (t = ss(), V.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function _s(e, t, n, r) {
		t.value = n, t.getSnapshot = r, ys(t) && bs(e);
	}
	function vs(e, t, n) {
		return n(function() {
			ys(t) && bs(e);
		});
	}
	function ys(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Jr(e, n);
		} catch {
			return !0;
		}
	}
	function bs(e) {
		var t = Pi(e, 2);
		t !== null && Pd(t, e, 2);
	}
	function xs(e) {
		var t = as();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), Go) {
				ct(!0);
				try {
					n();
				} finally {
					ct(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ds,
			lastRenderedState: e
		}, t;
	}
	function Ss(e, t, n, r) {
		return e.baseState = n, ps(e, H, typeof r == "function" ? r : ds);
	}
	function Cs(e, t, n, r, a) {
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
			E.T === null ? o.isTransition = !1 : n(!0), r(o), n = t.pending, n === null ? (o.next = t.pending = o, ws(t, o)) : (o.next = n.next, t.pending = n.next = o);
		}
	}
	function ws(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = E.T, o = {};
			o.types = a === null ? null : a.types, E.T = o;
			try {
				var s = n(i, r), c = E.S;
				c !== null && c(o, s), Ts(e, t, s);
			} catch (n) {
				Ds(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), E.T = a;
			}
		} else try {
			a = n(i, r), Ts(e, t, a);
		} catch (n) {
			Ds(e, t, n);
		}
	}
	function Ts(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Es(e, t, n);
		}, function(n) {
			return Ds(e, t, n);
		}) : Es(e, t, n);
	}
	function Es(e, t, n) {
		t.status = "fulfilled", t.value = n, Os(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, ws(e, n)));
	}
	function Ds(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, Os(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function Os(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function ks(e, t) {
		return t;
	}
	function As(e, t) {
		if (I) {
			var n = $u.formState;
			if (n !== null) {
				a: {
					var r = V;
					if (I) {
						if (F) {
							b: {
								for (var i = F, a = ua; i.nodeType !== 8;) if (!a || (i = lm(i.nextSibling), i === null)) {
									i = null;
									break b;
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								F = lm(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						fa(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = as(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ks,
			lastRenderedState: t
		}, n.queue = r, n = cc.bind(null, V, r), r.dispatch = n, r = xs(!1), a = uc.bind(null, V, !1, r.queue), r = as(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Cs.bind(null, V, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function js(e) {
		return Ms(os(), H, e);
	}
	function Ms(e, t, n) {
		if (t = ps(e, t, ks)[0], e = fs(ds)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = cs(t);
		} catch (e) {
			throw e === z ? Qa : e;
		}
		else r = t;
		t = os();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (V.flags |= 2048, Fs(9, { destroy: void 0 }, Ns.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Ns(e, t) {
		e.action = t;
	}
	function Ps(e) {
		var t = os(), n = H;
		if (n !== null) return Ms(t, n, e);
		os(), t = t.memoizedState, n = os();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function Fs(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = V.updateQueue, t === null && (t = ss(), V.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function Is() {
		return os().memoizedState;
	}
	function Ls(e, t, n, r) {
		var i = as();
		V.flags |= e, i.memoizedState = Fs(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function Rs(e, t, n, r) {
		var i = os();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		H !== null && r !== null && Zo(r, H.memoizedState.deps) ? i.memoizedState = Fs(t, a, n, r) : (V.flags |= e, i.memoizedState = Fs(1 | t, a, n, r));
	}
	function zs(e, t) {
		Ls(8390656, 8, e, t);
	}
	function Bs(e, t) {
		Rs(2048, 8, e, t);
	}
	function Vs(e) {
		V.flags |= 4;
		var t = V.updateQueue;
		if (t === null) t = ss(), V.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function Hs(e) {
		var t = os().memoizedState;
		return Vs({
			ref: t,
			nextImpl: e
		}), function() {
			if (q & 2) throw Error(i(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function Us(e, t) {
		return Rs(4, 2, e, t);
	}
	function Ws(e, t) {
		return Rs(4, 4, e, t);
	}
	function Gs(e, t) {
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
	function Ks(e, t, n) {
		n = n == null ? null : n.concat([e]), Rs(4, 4, Gs.bind(null, t, e), n);
	}
	function qs() {}
	function Js(e, t) {
		var n = os();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && Zo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Ys(e, t) {
		var n = os();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && Zo(t, r[1])) return r[0];
		if (r = e(), Go) {
			ct(!0);
			try {
				e();
			} finally {
				ct(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function Xs(e, t, n) {
		return n === void 0 || Ho & 1073741824 && !(Y & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Md(), V.lanes |= e, od |= e, n);
	}
	function Zs(e, t, n, r) {
		return Jr(n, t) ? n : Eo.current === null ? !(Ho & 106) || Ho & 1073741824 && !(Y & 261930) ? (Nc = !0, e.memoizedState = n) : (e = Md(), V.lanes |= e, od |= e, t) : (e = Xs(e, n, r), Jr(e, t) || (Nc = !0), e);
	}
	function Qs(e, t, n, r, i) {
		var a = D.p;
		D.p = a !== 0 && 8 > a ? a : 8;
		var o = E.T, s = {};
		s.types = o === null ? null : o.types, E.T = s, uc(e, !1, t, n);
		try {
			var c = i(), l = E.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? lc(e, t, Ga(c, r), jd(e)) : lc(e, t, r, jd(e));
		} catch (n) {
			lc(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, jd());
		} finally {
			D.p = a, o !== null && s.types !== null && (o.types = s.types), E.T = o;
		}
	}
	function $s() {}
	function ec(e, t, n, r) {
		if (e.tag !== 5) throw Error(i(476));
		var a = tc(e).queue;
		Qs(e, a, t, Te, n === null ? $s : function() {
			return nc(e), n(r);
		});
	}
	function tc(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: Te,
			baseState: Te,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ds,
				lastRenderedState: Te
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
				lastRenderedReducer: ds,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function nc(e) {
		var t = tc(e);
		t.next === null && (t = e.alternate.memoizedState), lc(e, t.next.queue, {}, jd());
	}
	function rc() {
		return ka(sh);
	}
	function ic() {
		return os().memoizedState;
	}
	function ac() {
		return os().memoizedState;
	}
	function oc(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = jd();
					e = _o(n);
					var r = vo(t, e, n);
					r !== null && (Pd(r, t, n), yo(r, t, n)), t = { cache: Fa() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function sc(e, t, n) {
		var r = jd();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, dc(e) ? fc(t, n) : (n = Ni(e, t, n, r), n !== null && (Pd(n, e, r), pc(n, t, r)));
	}
	function cc(e, t, n) {
		lc(e, t, n, jd());
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
				if (i.hasEagerState = !0, i.eagerState = s, Jr(s, o)) return Mi(e, t, i, 0), $u === null && ji(), !1;
			} catch {}
			if (n = Ni(e, t, i, r), n !== null) return Pd(n, e, r), pc(n, t, r), !0;
		}
		return !1;
	}
	function uc(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: Pf(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, dc(e)) {
			if (t) throw Error(i(479));
		} else t = Ni(e, n, r, 2), t !== null && Pd(t, e, 2);
	}
	function dc(e) {
		var t = e.alternate;
		return e === V || t !== null && t === V;
	}
	function fc(e, t) {
		Wo = U = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function pc(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Et(e, n);
		}
	}
	var mc = {
		readContext: ka,
		use: ls,
		useCallback: Xo,
		useContext: Xo,
		useEffect: Xo,
		useImperativeHandle: Xo,
		useLayoutEffect: Xo,
		useInsertionEffect: Xo,
		useMemo: Xo,
		useReducer: Xo,
		useRef: Xo,
		useState: Xo,
		useDebugValue: Xo,
		useDeferredValue: Xo,
		useTransition: Xo,
		useSyncExternalStore: Xo,
		useId: Xo,
		useHostTransitionStatus: Xo,
		useFormState: Xo,
		useActionState: Xo,
		useOptimistic: Xo,
		useMemoCache: Xo,
		useCacheRefresh: Xo,
		useEffectEvent: Xo
	}, hc = {
		readContext: ka,
		use: ls,
		useCallback: function(e, t) {
			return as().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: ka,
		useEffect: zs,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), Ls(4194308, 4, Gs.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return Ls(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			Ls(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = as();
			t = t === void 0 ? null : t;
			var r = e();
			if (Go) {
				ct(!0);
				try {
					e();
				} finally {
					ct(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = as();
			if (n !== void 0) {
				var i = n(t);
				if (Go) {
					ct(!0);
					try {
						n(t);
					} finally {
						ct(!1);
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
			var t = as();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = xs(e);
			var t = e.queue, n = cc.bind(null, V, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: qs,
		useDeferredValue: function(e, t) {
			return Xs(as(), e, t);
		},
		useTransition: function() {
			var e = xs(!1);
			return e = Qs.bind(null, V, e.queue, !0, !1), as().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = V, a = as();
			if (I) {
				if (n === void 0) throw Error(i(407));
				n = n();
			} else {
				if (n = t(), $u === null) throw Error(i(349));
				Y & 127 || gs(r, t, n);
			}
			a.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return a.queue = o, zs(vs.bind(null, r, o, e), [e]), r.flags |= 2048, Fs(9, { destroy: void 0 }, _s.bind(null, r, o, n, t), null), n;
		},
		useId: function() {
			var e = as(), t = $u.identifierPrefix;
			if (I) {
				var n = na, r = ta;
				n = (r & ~(1 << 32 - lt(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Ko++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = Yo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: rc,
		useFormState: As,
		useActionState: As,
		useOptimistic: function(e) {
			var t = as();
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
		useMemoCache: us,
		useCacheRefresh: function() {
			return as().memoizedState = oc.bind(null, V);
		},
		useEffectEvent: function(e) {
			var t = as(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (q & 2) throw Error(i(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, gc = {
		readContext: ka,
		use: ls,
		useCallback: Js,
		useContext: ka,
		useEffect: Bs,
		useImperativeHandle: Ks,
		useInsertionEffect: Us,
		useLayoutEffect: Ws,
		useMemo: Ys,
		useReducer: fs,
		useRef: Is,
		useState: function() {
			return fs(ds);
		},
		useDebugValue: qs,
		useDeferredValue: function(e, t) {
			return Zs(os(), H.memoizedState, e, t);
		},
		useTransition: function() {
			var e = fs(ds)[0], t = os().memoizedState;
			return [typeof e == "boolean" ? e : cs(e), t];
		},
		useSyncExternalStore: hs,
		useId: ic,
		useHostTransitionStatus: rc,
		useFormState: js,
		useActionState: js,
		useOptimistic: function(e, t) {
			return Ss(os(), H, e, t);
		},
		useMemoCache: us,
		useCacheRefresh: ac,
		useEffectEvent: Hs
	}, _c = {
		readContext: ka,
		use: ls,
		useCallback: Js,
		useContext: ka,
		useEffect: Bs,
		useImperativeHandle: Ks,
		useInsertionEffect: Us,
		useLayoutEffect: Ws,
		useMemo: Ys,
		useReducer: ms,
		useRef: Is,
		useState: function() {
			return ms(ds);
		},
		useDebugValue: qs,
		useDeferredValue: function(e, t) {
			var n = os();
			return H === null ? Xs(n, e, t) : Zs(n, H.memoizedState, e, t);
		},
		useTransition: function() {
			var e = ms(ds)[0], t = os().memoizedState;
			return [typeof e == "boolean" ? e : cs(e), t];
		},
		useSyncExternalStore: hs,
		useId: ic,
		useHostTransitionStatus: rc,
		useFormState: Ps,
		useActionState: Ps,
		useOptimistic: function(e, t) {
			var n = os();
			return H === null ? (n.baseState = e, [e, n.queue.dispatch]) : Ss(n, H, e, t);
		},
		useMemoCache: us,
		useCacheRefresh: ac,
		useEffectEvent: Hs
	};
	function vc(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : w({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var yc = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = jd(), i = _o(r);
			i.payload = t, n != null && (i.callback = n), t = vo(e, i, r), t !== null && (Pd(t, e, r), yo(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = jd(), i = _o(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = vo(e, i, r), t !== null && (Pd(t, e, r), yo(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = jd(), r = _o(n);
			r.tag = 2, t != null && (r.callback = t), t = vo(e, r, n), t !== null && (Pd(t, e, n), yo(t, e, n));
		}
	};
	function bc(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Yr(n, r) || !Yr(i, a) : !0;
	}
	function xc(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && yc.enqueueReplaceState(t, t.state, null);
	}
	function Sc(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = w({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Cc(e) {
		Di(e);
	}
	function wc(e) {
		console.error(e);
	}
	function Tc(e) {
		Di(e);
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
			Dc(t, n, r), typeof i != "function" && (vd === null ? vd = /* @__PURE__ */ new Set([this]) : vd.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function jc(e, t, n, r, a) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Ea(t, n, a, !0), n = jo.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13:
					case 19: return Mo === null ? Kd() : n.alternate === null && ad === 0 && (ad = 3), n.flags &= -257, n.flags |= 65536, n.lanes = a, r === $a ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), mf(e, r, a)), !1;
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
		if (I) return t = jo.current, t === null ? (r !== da && (t = Error(i(423), { cause: r }), va(N(t, n))), e = e.current.alternate, e.flags |= 65536, a &= -a, e.lanes |= a, r = N(r, n), a = Oc(e.stateNode, r, a), bo(e, a), ad !== 4 && (ad = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = a, r !== da && (e = Error(i(422), { cause: r }), va(N(e, n)))), !1;
		var o = Error(i(520), { cause: r });
		if (o = N(o, n), dd === null ? dd = [o] : dd.push(o), ad !== 4 && (ad = 2), t === null) return !0;
		r = N(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = a & -a, n.lanes |= e, e = Oc(n.stateNode, r, e), bo(n, e), !1;
				case 1:
					if (t = n.type, o = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (vd === null || !vd.has(o)))) return n.flags |= 65536, a &= -a, n.lanes |= a, a = kc(a), Ac(a, e, n, r), bo(n, a), !1;
					break;
				case 22: if (n.memoizedState !== null) return n.flags |= 65536, !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Mc = Error(i(461)), Nc = !1;
	function Pc(e, t, n, r) {
		t.child = e === null ? po(t, null, n, r) : fo(t, e.child, n, r);
	}
	function Fc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Oa(t), r = Qo(e, t, n, o, a, i), s = ns(), e !== null && !Nc ? (rs(e, t, i), ll(e, t, i)) : (I && s && aa(t), t.flags |= 1, Pc(e, t, r, i), t.child);
	}
	function Ic(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Bi(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, Lc(e, t, a, r, i)) : (e = Ui(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !ul(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Yr : n, n(o, r) && e.ref === t.ref) return ll(e, t, i);
		}
		return t.flags |= 1, e = Vi(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Lc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Yr(a, r) && e.ref === t.ref) {
				if (Nc = !1, t.pendingProps = r = a, ul(e, i)) e.flags & 131072 && (Nc = !0);
				else return t.lanes = e.lanes, ll(e, t, i);
			}
		}
		return Gc(e, t, n, r, i);
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
				return Bc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Ya(t, a === null ? null : a.cachePool), a === null ? ko() : Oo(t, a), Fo(t);
			else return r = t.lanes = 536870912, Bc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Ya(t, null), ko(), Io()) : (Ya(t, a.cachePool), Oo(t, a), Io(), t.memoizedState = null);
		return Pc(e, t, i, n), t.child;
	}
	function zc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function Bc(e, t, n, r, i) {
		var a = Ja();
		return a = a === null ? null : {
			parent: L._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Ya(t, null), ko(), Fo(t), e !== null && Ea(e, t, r, !0), t.childLanes = i, null;
	}
	function Vc(e, t) {
		return t = el({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Hc(e, t, n) {
		return fo(t, e.child, null, n), e = Vc(t, t.pendingProps), e.flags |= 2, Lo(t), t.memoizedState = null, e;
	}
	function Uc(e, t, n) {
		var r = t.pendingProps, a = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (I) {
				if (r.mode === "hidden") return e = Vc(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, zc(null, e);
				if (Po(t), (e = F) ? (e = am(e, ua), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: ea === null ? null : {
						id: ta,
						overflow: na
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ki(e), n.return = t, t.child = n, ca = t, F = null)) : e = null, e === null) throw fa(t);
				return t.lanes = 536870912, null;
			}
			return Vc(t, r);
		}
		var o = e.memoizedState;
		if (o !== null) {
			var s = o.dehydrated;
			if (Po(t), a) {
				if (t.flags & 256) t.flags &= -257, t = Hc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(i(558));
			} else if (Nc || Ea(e, t, n, !1), a = (n & e.childLanes) !== 0, Nc || a) {
				if (Eo.current === null) {
					if (r = $u, r !== null && (s = Dt(r, n), s !== 0 && s !== o.retryLane)) throw o.retryLane = s, Pi(e, s), Pd(r, e, s), Mc;
					Kd();
				}
				t = Hc(e, t, n);
			} else e = o.treeContext, F = lm(s.nextSibling), ca = t, I = !0, la = null, ua = !1, e !== null && sa(t, e), t = Vc(t, r), t.flags |= 134221824;
			return t;
		}
		return e = Vi(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function Wc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(i(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function Gc(e, t, n, r, i) {
		return Oa(t), n = Qo(e, t, n, r, void 0, i), r = ns(), e !== null && !Nc ? (rs(e, t, i), ll(e, t, i)) : (I && r && aa(t), t.flags |= 1, Pc(e, t, n, i), t.child);
	}
	function Kc(e, t, n, r, i, a) {
		return Oa(t), t.updateQueue = null, n = es(t, r, n, i), $o(e), r = ns(), e !== null && !Nc ? (rs(e, t, a), ll(e, t, a)) : (I && r && aa(t), t.flags |= 1, Pc(e, t, n, a), t.child);
	}
	function qc(e, t, n, r, i) {
		if (Oa(t), t.stateNode === null) {
			var a = Li, o = n.contextType;
			typeof o == "object" && o && (a = ka(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = yc, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, ho(t), o = n.contextType, a.context = typeof o == "object" && o ? ka(o) : Li, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (vc(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && yc.enqueueReplaceState(a, a.state, null), Co(t, r, a, i), So(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Sc(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = Li, typeof u == "object" && u && (o = ka(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && xc(t, a, r, o), mo = !1;
			var f = t.memoizedState;
			a.state = f, Co(t, r, a, i), So(), l = t.memoizedState, s || f !== l || mo ? (typeof d == "function" && (vc(t, n, d, r), l = t.memoizedState), (c = mo || bc(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, go(e, t), o = t.memoizedProps, u = Sc(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = Li, typeof l == "object" && l && (c = ka(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && xc(t, a, r, c), mo = !1, f = t.memoizedState, a.state = f, Co(t, r, a, i), So();
			var p = t.memoizedState;
			o !== d || f !== p || mo || e !== null && e.dependencies !== null && Da(e.dependencies) ? (typeof s == "function" && (vc(t, n, s, r), p = t.memoizedState), (u = mo || bc(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Da(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, Wc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = fo(t, e.child, null, i), t.child = fo(t, null, n, i)) : Pc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = ll(e, t, i), e;
	}
	function Jc(e, t, n, r) {
		return ga(), t.flags |= 256, Pc(e, t, n, r), t.child;
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
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ld), e;
	}
	function Qc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(Ro.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (I) {
				if (i ? No(t) : Io(), (e = F) ? (e = am(e, ua), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: ea === null ? null : {
						id: ta,
						overflow: na
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ki(e), n.return = t, t.child = n, ca = t, F = null)) : e = null, e === null) throw fa(t);
				return t.lanes = sm(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (Io(), i = t.mode, a = el({
				mode: "hidden",
				children: a
			}, i), r = Wi(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = Xc(n), r.childLanes = Zc(e, o, n), t.memoizedState = Yc, zc(null, r)) : (No(t), $c(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return nl(e, t, a, o, r, c, s, n);
		}
		return i ? (Io(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = Vi(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = Wi(i, a, n, null), i.flags |= 2) : i = Vi(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, zc(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = Xc(n) : (a = i.cachePool, a === null ? a = Xa() : (s = L._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = Zc(e, o, n), t.memoizedState = Yc, zc(e.child, r)) : (No(t), n = e.child, e = n.sibling, n = Vi(n, {
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
		return e = zi(22, e, null, t), e.lanes = 0, e;
	}
	function tl(e, t, n) {
		return fo(t, e.child, null, n), e = $c(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function nl(e, t, n, r, a, o, s, c) {
		if (n) return t.flags & 256 ? (No(t), t.flags &= -257, tl(e, t, c)) : t.memoizedState === null ? (Io(), o = a.fallback, s = t.mode, a = el({
			mode: "visible",
			children: a.children
		}, s), o = Wi(o, s, c, null), o.flags |= 2, a.return = t, o.return = t, a.sibling = o, t.child = a, fo(t, e.child, null, c), a = t.child, a.memoizedState = Xc(c), a.childLanes = Zc(e, r, c), t.memoizedState = Yc, zc(null, a)) : (Io(), t.child = e.child, t.flags |= 128, null);
		if (No(t), sm(o)) {
			if (r = o.nextSibling && o.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (a = Error(i(419)), a.stack = "", a.digest = r, va({
				value: a,
				source: null,
				stack: null
			})), tl(e, t, c);
		}
		if (Nc || Ea(e, t, c, !1), r = (c & e.childLanes) !== 0, Nc || r) {
			if (Eo.current !== null) return tl(e, t, c);
			if (r = $u, r !== null && (a = Dt(r, c), a !== 0 && a !== s.retryLane)) throw s.retryLane = a, Pi(e, a), Pd(r, e, a), Mc;
			return om(o) || Kd(), tl(e, t, c);
		}
		return om(o) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, F = lm(o.nextSibling), ca = t, I = !0, la = null, ua = !1, e !== null && sa(t, e), t = $c(t, a.children), t.flags |= 134221824, t);
	}
	function rl(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), wa(e.return, t, n);
	}
	function il(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && Vo(n) === null && (t = e), e = e.sibling;
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
		var o = Ro.current;
		if (t.flags & 128) return zo(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, zo(t, o), i === "backwards" && e !== null ? (ol(e), Pc(e, t, r, n), ol(e)) : Pc(e, t, r, n), r = I ? Qi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
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
					if (e = i.alternate, e !== null && Vo(e) === null) {
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
		return Sa(t, t.type, r.value), Pc(e, t, r.children, n), t.child;
	}
	function ll(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), od |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (Ea(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(i(153));
		if (t.child !== null) {
			for (e = t.child, n = Vi(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Vi(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function ul(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && Da(e)));
	}
	function dl(e, t, n) {
		switch (t.tag) {
			case 3:
				Fe(t, t.stateNode.containerInfo), Sa(t, L, e.memoizedState.cache), ga();
				break;
			case 27:
			case 5:
				Le(t);
				break;
			case 4:
				Fe(t, t.stateNode.containerInfo);
				break;
			case 10:
				Sa(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, Po(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) {
					if (r.dehydrated !== null) return No(t), t.flags |= 128, null;
					r = Ea(e, t, n, !1);
					var i = t.child.childLanes;
					return r || (n & i) !== 0 ? Qc(e, t, n) : (No(t), e = ll(e, t, n), e === null ? null : e.sibling);
				}
				No(t);
				break;
			case 19:
				if (t.flags & 128) return sl(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (Ea(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return sl(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), zo(t, Ro.current), r) break;
				return null;
			case 22: return t.lanes = 0, Rc(e, t, n, t.pendingProps);
			case 24: Sa(t, L, e.memoizedState.cache);
		}
		return ll(e, t, n);
	}
	function fl(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) Nc = !0;
			else {
				if (!ul(e, n) && !(t.flags & 128)) return Nc = !1, dl(e, t, n);
				Nc = !!(e.flags & 131072);
			}
		} else Nc = !1, I && t.flags & 1048576 && ia(t, Qi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = to(t.elementType), t.type = e, typeof e == "function") Bi(e) ? (r = Sc(e, r), t.tag = 1, t = qc(null, t, e, r, n)) : (t.tag = 0, t = Gc(null, t, e, r, n));
					else {
						if (e != null) {
							var a = e.$$typeof;
							if (a === ue) {
								t.tag = 11, t = Fc(null, t, e, r, n);
								break a;
							}
							if (a === pe) {
								t.tag = 14, t = Ic(null, t, e, r, n);
								break a;
							}
							if (a === le) {
								t.tag = 10, t.type = e, t = cl(null, t, n);
								break a;
							}
						}
						throw t = Ce(e) || e, Error(i(306, t, ""));
					}
				}
				return t;
			case 0: return Gc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, a = Sc(r, t.pendingProps), qc(e, t, r, a, n);
			case 3:
				a: {
					if (Fe(t, t.stateNode.containerInfo), e === null) throw Error(i(387));
					r = t.pendingProps;
					var o = t.memoizedState;
					a = o.element, go(e, t), Co(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, Sa(t, L, r), r !== o.cache && Ta(t, [L], n, !0), So(), r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							t = Jc(e, t, r, n);
							break a;
						}
						if (r !== a) {
							a = N(Error(i(424)), t), va(a), t = Jc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (F = lm(e.firstChild), ca = t, I = !0, la = null, ua = !0, n = po(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (ga(), r === a) {
							t = ll(e, t, n);
							break a;
						}
						Pc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return Wc(e, t), e === null ? (n = Nm(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : I || (t.stateNode = fp(t.type, t.pendingProps, Ne.current, t)) : t.memoizedState = Nm(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return Le(t), e === null && I && (r = t.stateNode = hm(t.type, t.pendingProps, Ne.current), ca = t, ua = !0, a = F, Sp(t.type) ? (um = a, F = lm(r.firstChild)) : F = a), Pc(e, t, t.pendingProps.children, n), Wc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && I && ((a = r = F) && (r = rm(r, t.type, t.pendingProps, ua), r === null ? a = !1 : (t.stateNode = r, ca = t, F = lm(r.firstChild), ua = !1, a = !0)), a || fa(t)), Le(t), a = t.type, o = t.pendingProps, s = e === null ? null : e.memoizedProps, r = o.children, pp(a, o) ? r = null : s !== null && pp(a, s) && (t.flags |= 32), t.memoizedState !== null && (a = Qo(e, t, ts, null, null, n), sh._currentValue = a), Wc(e, t), Pc(e, t, r, n), t.child;
			case 6: return e === null && I && ((e = n = F) && (n = im(n, t.pendingProps, ua), n === null ? e = !1 : (t.stateNode = n, ca = t, F = null, e = !0)), e || fa(t)), null;
			case 13: return Qc(e, t, n);
			case 4: return Fe(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = fo(t, null, r, n) : Pc(e, t, r, n), t.child;
			case 11: return Fc(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, Wc(e, t), Pc(e, t, r, n), t.child;
			case 8: return Pc(e, t, t.pendingProps.children, n), t.child;
			case 12: return Pc(e, t, t.pendingProps.children, n), t.child;
			case 10: return cl(e, t, n);
			case 9: return a = t.type._context, r = t.pendingProps.children, Oa(t), a = ka(a), r = r(a), t.flags |= 1, Pc(e, t, r, n), t.child;
			case 14: return Ic(e, t, t.type, t.pendingProps, n);
			case 15: return Lc(e, t, t.type, t.pendingProps, n);
			case 19: return sl(e, t, n);
			case 31: return Uc(e, t, n);
			case 22: return Rc(e, t, n, t.pendingProps);
			case 24: return Oa(t), r = ka(L), e === null ? (a = Ja(), a === null && (a = $u, o = Fa(), a.pooledCache = o, o.refCount++, o !== null && (a.pooledCacheLanes |= n), a = o), t.memoizedState = {
				parent: r,
				cache: a
			}, ho(t), Sa(t, L, a)) : ((e.lanes & n) !== 0 && (go(e, t), Co(t, null, null, n), So()), a = e.memoizedState, o = t.memoizedState, a.parent === r ? (r = o.cache, Sa(t, L, r), r !== a.cache && Ta(t, [L], n, !0)) : (a = {
				parent: r,
				cache: r
			}, t.memoizedState = a, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = a), Sa(t, L, r))), Pc(e, t, t.pendingProps.children, n), t.child;
			case 30: return t.stateNode === null && (t.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : I && aa(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : Wc(e, t), Pc(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(i(156, t.tag));
	}
	function pl(e) {
		e.flags |= 4;
	}
	function ml(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Jm(t, r) : Jm(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Ud()) e.flags |= 8192;
				else throw no = $a, Za;
			}
		} else e.flags &= -16777217;
	}
	function hl(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Ym(t)) {
			if (Ud()) e.flags |= 8192;
			else throw no = $a, Za;
		}
	}
	function gl(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : xt(), e.lanes |= t, ud |= t);
	}
	function _l(e, t) {
		if (!I) switch (e.tailMode) {
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
	function W(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function vl(e, t, n) {
		var r = t.pendingProps;
		switch (oa(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return W(t), null;
			case 1: return W(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Ca(L), Ie(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (ha(t) ? pl(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, _a())), W(t), null;
			case 26:
				var a = t.type, o = t.memoizedState;
				return e === null ? (pl(t), o === null ? (W(t), ml(t, a, null, r, n)) : (W(t), hl(t, o))) : o ? o === e.memoizedState ? (W(t), t.flags &= -16777217) : (pl(t), W(t), hl(t, o)) : (e = e.memoizedProps, e !== r && pl(t), W(t), ml(t, a, e, r, n)), null;
			case 27:
				if (Re(t), n = Ne.current, a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && pl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return W(t), t.subtreeFlags &= -33554433, null;
					}
					e = je.current, ha(t) ? pa(t, e) : (e = hm(a, r, n), t.stateNode = e, pl(t));
				}
				return W(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (Re(t), a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && pl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return W(t), t.subtreeFlags &= -33554433, null;
					}
					if (o = je.current, ha(t)) pa(t, o);
					else {
						var s = lp(Ne.current);
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
						o[Nt] = t, o[Pt] = r;
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
						a: switch (np(o, a, r), a) {
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
				return W(t), t.subtreeFlags &= -33554433, ml(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && pl(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(i(166));
					if (e = Ne.current, ha(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, a = ca, a !== null) switch (a.tag) {
							case 27:
							case 5: r = a.memoizedProps;
						}
						e[Nt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || ep(e.nodeValue, n)), e || fa(t, !0);
					} else e = lp(e).createTextNode(r), e[Nt] = t, t.stateNode = e;
				}
				return W(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = ha(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(i(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(557));
							e[Nt] = t;
						} else ga(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						W(t), e = !1;
					} else n = _a(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (Lo(t), t) : (Lo(t), null);
					if (t.flags & 128) throw Error(i(558));
				}
				return W(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (a = ha(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!a) throw Error(i(318));
							if (a = t.memoizedState, a = a === null ? null : a.dehydrated, !a) throw Error(i(317));
							a[Nt] = t;
						} else ga(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						W(t), a = !1;
					} else a = _a(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), a = !0;
					if (!a) return t.flags & 256 ? (Lo(t), t) : (Lo(t), null);
				}
				return Lo(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, a = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (a = r.alternate.memoizedState.cachePool.pool), o = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== a && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), gl(t, t.updateQueue), W(t), null);
			case 4: return Ie(), e === null && Wf(t.stateNode.containerInfo), t.flags |= 67108864, W(t), null;
			case 10: return Ca(t.type), W(t), null;
			case 19:
				if (Bo(t), r = t.memoizedState, r === null) return W(t), null;
				if (a = !!(t.flags & 128), o = r.rendering, o === null) {
					if (a) _l(r, !1);
					else {
						if (ad !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (o = Vo(e), o !== null) {
								for (t.flags |= 128, _l(r, !1), e = o.updateQueue, t.updateQueue = e, gl(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) Hi(n, e), n = n.sibling;
								return zo(t, Ro.current & 1 | 2), I && ra(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Ze() > gd && (t.flags |= 128, a = !0, _l(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!a) {
						if (e = Vo(o), e !== null) {
							if (t.flags |= 128, a = !0, e = e.updateQueue, t.updateQueue = e, gl(t, e), _l(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !o.alternate && !I) return W(t), null;
						} else 2 * Ze() - r.renderingStartTime > gd && n !== 536870912 && (t.flags |= 128, a = !0, _l(r, !1), t.lanes = 4194304);
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
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Ze(), e.sibling = null, o = Ro.current, o = a ? o & 1 | 2 : o & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || I ? zo(t, o) : (n = o, Ae(jo, t), Ae(Ro, n), Mo === null && (Mo = t)), I && ra(t, r.treeForkCount), e;
				}
				return W(t), null;
			case 22:
			case 23: return Lo(t), Ao(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (W(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : W(t), n = t.updateQueue, n !== null && gl(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && ke(qa), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Ca(L), W(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, W(t), null;
		}
		throw Error(i(156, t.tag));
	}
	function yl(e, t) {
		switch (oa(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Ca(L), Ie(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return Re(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (Lo(t), t.alternate === null) throw Error(i(340));
					ga();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (Lo(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(i(340));
					ga();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return Bo(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
			case 4: return Ie(), null;
			case 10: return Ca(t.type), null;
			case 22:
			case 23: return Lo(t), Ao(), e !== null && ke(qa), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Ca(L), null;
			case 25: return null;
			default: return null;
		}
	}
	function bl(e, t) {
		switch (oa(t), t.tag) {
			case 3:
				Ca(L), Ie();
				break;
			case 26:
			case 27:
			case 5:
				Re(t);
				break;
			case 4:
				Ie();
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
				Ca(t.type);
				break;
			case 22:
			case 23:
				Lo(t), Ao(), e !== null && ke(qa);
				break;
			case 24: Ca(L);
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
			Z(t, t.return, e);
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
	function Cl(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				To(t, n);
			} catch (t) {
				Z(e, e.return, t);
			}
		}
	}
	function wl(e, t, n) {
		n.props = Sc(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Z(e, t, n);
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
						var i = e.stateNode, a = wi(e.memoizedProps, i);
						(i.ref === null || i.ref.name !== a) && (i.ref = Pp(a)), r = i.ref;
						break;
					case 7:
						if (e.stateNode === null) {
							var o = new Fp(e);
							m(e.child, !1, Qp, o, void 0, void 0), e.stateNode = o;
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
	function El(e, t) {
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
	function Dl(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) em(e.stateNode, t[n]);
	}
	function Ol(e) {
		for (var t = e.return; t !== null && (jl(t) && em(e.stateNode, t.stateNode), !Al(t));) t = t.return;
	}
	function kl(e) {
		for (var t = e.return; t !== null && (jl(t) && tm(e.stateNode, t.stateNode), !Al(t));) t = t.return;
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
			Z(e, e.return, t);
		}
	}
	function Nl(e, t, n) {
		try {
			var r = e.stateNode;
			ip(r, e.type, n, t), r[Pt] = t;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Pl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Sp(e.type) || e.tag === 4;
	}
	function Fl(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Pl(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Sp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Il(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = On)), Dl(e, r), k = !0;
		else if (i !== 4 && (i === 27 && (Dl(e, r), r = null, Sp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (Il(e, t, n, r), e = e.sibling; e !== null;) Il(e, t, n, r), e = e.sibling;
	}
	function Ll(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), Dl(e, r), k = !0;
		else if (i !== 4 && (i === 27 && (Dl(e, r), r = null, Sp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Ll(e, t, n, r), e = e.sibling; e !== null;) Ll(e, t, n, r), e = e.sibling;
	}
	function Rl(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			np(t, r, n), t[Nt] = e, t[Pt] = n;
		} catch (t) {
			Z(e, e.return, t);
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
					var s = Op(o);
					r.push(s), s.view && (a = !0);
				} else a || Op(o).view && (a = !0);
				zl = !0, Tp(o, Wl === 0 ? t : t + "_" + Wl, n), Wl++;
			} else (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && i || Kl(e.child, t, n, r, i) && (a = !0));
			e = e.sibling;
		}
		return a;
	}
	function ql(e, t) {
		for (; e !== null;) e.tag === 5 ? Ep(e.stateNode, e.memoizedProps) : (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && t || ql(e.child, t)), e = e.sibling;
	}
	function Jl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (Jl(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(i(544));
				var n = t.name;
				t = Ei(t.default, t.share), t !== "none" && (Gl(e, n, t, null, !1) || ql(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function Yl(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = wi(r, n), a = Ei(r.default, n.paired ? r.share : r.enter);
			a === "none" ? Jl(e) : Gl(e, i, a, null, !1) ? (Jl(e), n.paired || t || Nd(e, r.onEnter)) : ql(e.child, !1);
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
								var a = Ei(n.default, n.share);
								if (a !== "none" && (Gl(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, Nd(e, n.onShare)) : ql(e.child, !1)), t.delete(r), t.size === 0) break;
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
			var t = e.memoizedProps, n = wi(t, e.stateNode), r = Bl === null ? void 0 : Bl.get(n), i = Ei(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Gl(e, n, i, null, !1) ? r === void 0 ? Nd(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, Bl.delete(n), Nd(e, t.onShare)) : ql(e.child, !1)), Bl !== null && Xl(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Zl(e), e = e.sibling;
		else Bl !== null && Xl(e);
	}
	function Ql(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = wi(t, e.stateNode);
				t = Ei(t.default, t.update), e.flags &= -5, t !== "none" && Gl(e, n, t, e.memoizedState = [], !1);
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
					var l = a[Wl], u = Op(c);
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
				e.flags & 4 && Tp(c, Wl === 0 ? n : n + "_" + Wl, i), s && e.flags & 4 || (Hl === null && (Hl = []), Hl.push(c, Wl === 0 ? r : r + "_" + Wl, t.memoizedProps)), Wl++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : nu(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function ru(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = wi(n, r), a = Ei(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(kp);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				Wl = 0, i = nu(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || Nd(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && ru(e, t);
			e = e.sibling;
		}
	}
	var iu = !1, G = !1, au = !1, ou = !1, su = typeof WeakSet == "function" ? WeakSet : Set, cu = null, lu = !1, uu = !1, du = !1, fu = !1;
	function pu(e, t, n) {
		if (e = e.containerInfo, sp = gh, e = ei(e), ti(e)) {
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
		for (cp = {
			focusedElem: e,
			selectionRange: r
		}, gh = !1, n = (n & 335544064) === n, cu = t, t = n ? 9270 : 1024; cu !== null;) {
			if (e = cu, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && Zl(r[a]);
			if (e.alternate === null && e.flags & 2) n && Vl(e), mu(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && Zl(r), mu(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && Vl(e), mu(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, cu = r) : (n && Ql(e), mu(n));
			}
		}
		Bl = null;
	}
	function mu(e) {
		for (; cu !== null;) {
			var t = cu, n = e, r = t.alternate, a = t.flags;
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
							Z(t, t.return, e);
						}
					}
					break;
				case 3:
					if (a & 1024) {
						if (r = t.stateNode.containerInfo, n = r.nodeType, n === 9) nm(r);
						else if (n === 1) switch (r.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								nm(r);
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
					n && r !== null && (n = wi(r.memoizedProps, r.stateNode), a = t.memoizedProps, a = Ei(a.default, a.update), a !== "none" && Gl(r, n, a, r.memoizedState = [], !0));
					break;
				default: if (a & 1024) throw Error(i(163));
			}
			if (r = t.sibling, r !== null) {
				r.return = t.return, cu = r;
				break;
			}
			cu = t.return;
		}
	}
	function hu(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				Pu(e, n), r & 4 && xl(5, n);
				break;
			case 1:
				if (Pu(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						Z(n, n.return, e);
					}
					else {
						var i = Sc(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							Z(n, n.return, e);
						}
					}
				}
				r & 64 && Cl(n), r & 512 && Tl(n, n.return);
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
						Z(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Rl(n);
			case 26:
			case 5:
				Pu(e, n), t === null && r & 4 && Ml(n), r & 512 && Tl(n, n.return);
				break;
			case 12:
				Pu(e, n);
				break;
			case 31:
				Pu(e, n), r & 4 && Cu(e, n);
				break;
			case 13:
				Pu(e, n), r & 4 && wu(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = _f.bind(null, n), cm(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || iu, !r) {
					var a = t !== null && t.memoizedState !== null || G;
					t = iu, i = G, iu = r, (G = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), Iu(e, n, r)) : Pu(e, n), iu = t, G = i;
				}
				break;
			case 30:
				Pu(e, n), r & 512 && Tl(n, n.return);
				break;
			case 7: r & 512 && Tl(n, n.return);
			default: Pu(e, n);
		}
	}
	function gu(e, t) {
		for (e = e.child; e !== null;) _u(e, t), e = e.sibling;
	}
	function _u(e, t) {
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
				vu(e, t);
				break;
			case 6:
				try {
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, k = !0;
				} catch (t) {
					Z(e, e.return, t);
				}
				break;
			case 18:
				try {
					var s = e.stateNode;
					t ? wp(s, !0) : wp(e.stateNode, !1);
				} catch (t) {
					Z(e, e.return, t);
				}
				break;
			case 22:
			case 23:
				e.memoizedState === null && gu(e, t);
				break;
			default: gu(e, t);
		}
	}
	function vu(e, t) {
		if (e.subtreeFlags & 67108864) for (e = e.child; e !== null;) {
			a: {
				var n = e, r = t;
				switch (n.tag) {
					case 4:
						_u(n, r);
						break a;
					case 22:
						n.memoizedState === null && vu(n, r);
						break a;
					default: vu(n, r);
				}
			}
			e = e.sibling;
		}
	}
	function yu(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, yu(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Vt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var K = null, bu = !1;
	function xu(e, t, n) {
		for (n = n.child; n !== null;) Su(e, t, n), n = n.sibling;
	}
	function Su(e, t, n) {
		if (st && typeof st.onCommitFiberUnmount == "function") try {
			st.onCommitFiberUnmount(ot, n);
		} catch {}
		switch (n.tag) {
			case 26:
				G || El(n, t), xu(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !G && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				G || El(n, t), kl(n);
				var r = K, i = bu;
				Sp(n.type) && (K = n.stateNode, bu = !1), xu(e, t, n), gm(n.stateNode, n.type, n.memoizedProps), K = r, bu = i;
				break;
			case 5: G || El(n, t), kl(n);
			case 6:
				if (n.tag === 6 && kl(n), r = K, i = bu, K = null, xu(e, t, n), K = r, bu = i, K !== null) {
					if (bu) try {
						(K.nodeType === 9 ? K.body : K.nodeName === "HTML" ? K.ownerDocument.body : K).removeChild(n.stateNode), k = !0;
					} catch (e) {
						Z(n, t, e);
					}
					else try {
						K.removeChild(n.stateNode), k = !0;
					} catch (e) {
						Z(n, t, e);
					}
				}
				break;
			case 18:
				K !== null && (bu ? (e = K, Cp(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Hh(e)) : Cp(K, n.stateNode));
				break;
			case 4:
				r = K, i = bu, K = n.stateNode.containerInfo, bu = !0, xu(e, t, n), K = r, bu = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Sl(2, n, t), G || Sl(4, n, t), xu(e, t, n);
				break;
			case 1:
				G || (El(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && wl(n, t, r)), xu(e, t, n);
				break;
			case 21:
				xu(e, t, n);
				break;
			case 22:
				G = (r = G) || n.memoizedState !== null, xu(e, t, n), G = r;
				break;
			case 30:
				El(n, t), xu(e, t, n);
				break;
			case 7:
				G || El(n, t), xu(e, t, n);
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
				return t === null && (t = e.stateNode = new su()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new su()), t;
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
						if (Sp(l.type)) {
							K = l.stateNode, bu = !1;
							break a;
						}
						break;
					case 5:
						K = l.stateNode, bu = !1;
						break a;
					case 3:
					case 4:
						K = l.stateNode.containerInfo, bu = !0;
						break a;
				}
				l = l.return;
			}
			if (K === null) throw Error(i(160));
			Su(s, c, o), K = null, bu = !1, s = o.alternate, s !== null && (s.return = null), o.return = null;
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
				Du(t, e, n), Au(e), a & 4 && (Sl(3, e, e.return), xl(3, e), Sl(5, e, e.return));
				break;
			case 1:
				Du(t, e, n), Au(e), a & 512 && (G || r === null || El(r, r.return)), a & 64 && iu && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (o = Ou, Du(t, e, n), Au(e), a & 512 && (G || r === null || El(r, r.return)), a & 4) {
					if (a = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if (iu) e.stateNode = fp(e.type, e.memoizedProps, t.containerInfo, e);
								else {
									a: {
										t = e.type, n = e.memoizedProps, a = o.ownerDocument || o;
										b: switch (t) {
											case "title":
												r = a.getElementsByTagName("title")[0], (!r || r[zt] || r[Nt] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = a.createElement(t), a.head.insertBefore(r, a.querySelector("head > title"))), np(r, t, n), r[Nt] = e, Kt(r), t = r;
												break a;
											case "link":
												if (o = Gm("link", "href", a).get(t + (n.href || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && r.getAttribute("rel") === (n.rel == null ? null : n.rel) && r.getAttribute("title") === (n.title == null ? null : n.title) && r.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), np(r, t, n), a.head.appendChild(r);
												break;
											case "meta":
												if (o = Gm("meta", "content", a).get(t + (n.content || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("content") === (n.content == null ? null : "" + n.content) && r.getAttribute("name") === (n.name == null ? null : n.name) && r.getAttribute("property") === (n.property == null ? null : n.property) && r.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && r.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), np(r, t, n), a.head.appendChild(r);
												break;
											default: throw Error(i(468, t));
										}
										r[Nt] = e, Kt(r), t = r;
									}
									e.stateNode = t;
								}
							} else iu || Km(o, e.type, e.stateNode);
						} else e.stateNode = Bm(o, n, e.memoizedProps);
					} else a === n ? n === null && e.stateNode !== null && Nl(e, e.memoizedProps, r.memoizedProps) : (a === null ? (t = r.stateNode, t === null || G || t.parentNode.removeChild(t)) : a.count--, n === null ? iu || Km(o, e.type, e.stateNode) : Bm(o, n, e.memoizedProps));
				}
				break;
			case 27:
				Du(t, e, n), Au(e), a & 512 && (G || r === null || El(r, r.return)), r !== null && a & 4 && Nl(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (o = au, au = !1, Du(t, e, n), au = o, Au(e), a & 512 && (G || r === null || El(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						bn(t, ""), k = !0;
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				a & 4 && e.stateNode != null && (t = e.memoizedProps, Nl(e, t, r === null ? t : r.memoizedProps)), a & 1024 && (ou = !0);
				break;
			case 6:
				if (Du(t, e, n), Au(e), a & 4) {
					if (e.stateNode === null) throw Error(i(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, k = !0;
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				break;
			case 3:
				if (k = !1, Wm = null, o = Ou, Ou = bm(t.containerInfo), Du(t, e, n), Ou = o, Au(e), a & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Hh(t.containerInfo);
				} catch (t) {
					Z(e, e.return, t);
				}
				ou && (ou = !1, ju(e)), k = !1;
				break;
			case 4:
				a = au, au = iu, r = nn(), o = Ou, Ou = bm(e.stateNode.containerInfo), Du(t, e, n), Au(e), Ou = o, k && uu && (du = !0), k = r, au = a;
				break;
			case 12:
				Du(t, e, n), Au(e);
				break;
			case 31:
				Du(t, e, n), Au(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 13:
				Du(t, e, n), Au(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (md = Ze()), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 22:
				o = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = iu, l = G, u = au;
				iu = c || o, au = u || o, G = l || s, Du(t, e, n), G = l, au = u, iu = c, Au(e), a & 8192 && (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, !o || r === null || s || iu || G || (t = s || G, n = iu, r = G, iu = o || iu, G = t, Fu(e, 2), iu = n, G = r), !o && au || gu(e, o)), a & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, Eu(e, n))));
				break;
			case 19:
				Du(t, e, n), Au(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Eu(e, t)));
				break;
			case 30:
				a & 512 && (G || r === null || El(r, r.return)), a = nn(), o = uu, s = (n & 335544064) === n, c = e.memoizedProps, uu = s && Ei(c.default, c.update) !== "none", Du(t, e, n), Au(e), s && r !== null && k && (e.flags |= 4), uu = o, k = a;
				break;
			case 21: break;
			case 7: a & 512 && (G || r === null || El(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: Du(t, e, n), Au(e);
		}
	}
	function Au(e) {
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
						n.flags & 32 && (bn(l, ""), n.flags &= -33), Ll(e, Fl(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						Il(e, Fl(e), u, s);
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
			ju(t), t.tag === 5 && t.flags & 1024 && (t = t.stateNode, gh = !0, t.reset(), gh = !1), e = e.sibling;
		}
	}
	function Mu(e, t) {
		if (t.subtreeFlags & 9270) for (t = t.child; t !== null;) Nu(t, e), t = t.sibling;
		else ru(t, !1);
	}
	function Nu(e, t) {
		var n = e.alternate;
		if (n === null) Yl(e, !1);
		else switch (e.tag) {
			case 3:
				if (fu = lu = !1, Ul(), Mu(t, e), !lu && !du) {
					if (e = Hl, e !== null) for (var r = 0; r < e.length; r += 3) {
						n = e[r];
						var i = e[r + 1];
						Ep(n, e[r + 2]), n = n.ownerDocument.documentElement, n !== null && n.animate({
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
					})), fu = !0;
				}
				Hl = null;
				break;
			case 5:
				Mu(t, e);
				break;
			case 4:
				r = lu, lu = !1, Mu(t, e), lu && (du = !0), lu = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? Mu(t, e) : Yl(e, !1));
				break;
			case 30:
				r = lu, i = Ul(), lu = !1, Mu(t, e), lu && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = wi(a, o), o = wi(n.memoizedProps, o);
				var s = Ei(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, Wl = 0, t = nu(e, n, t, o, s, a, !0), Wl !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (Nd(e, e.memoizedProps.onUpdate), Hl = i) : i !== null && (i.push.apply(i, Hl), Hl = i), lu = e.flags & 32 ? !0 : r;
				break;
			default: Mu(t, e);
		}
	}
	function Pu(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) hu(e, t.alternate, t), t = t.sibling;
	}
	function Fu(e, t) {
		for (e = e.child; e !== null;) {
			var n = e, r = t;
			switch (n.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Sl(4, n, n.return), Fu(n, r);
					break;
				case 1:
					El(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && wl(n, n.return, i), Fu(n, r);
					break;
				case 27: r & 2 && gm(n.stateNode, n.type, n.memoizedProps);
				case 5:
					El(n, n.return), n.tag !== 5 && n.tag !== 27 || kl(n), Fu(n, r);
					break;
				case 6:
					kl(n);
					break;
				case 26:
					El(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || G || i.parentNode.removeChild(i), Fu(n, r);
					break;
				case 22:
					n.memoizedState === null && Fu(n, r);
					break;
				case 30:
					El(n, n.return), Fu(n, r);
					break;
				case 7: El(n, n.return);
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
					Iu(i, a, n), xl(4, a);
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
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) wo(l[i], c);
						} catch (e) {
							Z(r, r.return, e);
						}
					}
					s && o & 64 && Cl(a), Tl(a, a.return);
					break;
				case 27: n & 2 && Rl(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || Ol(a), Iu(i, a, n), s && r === null && o & 4 && Ml(a), Tl(a, a.return);
					break;
				case 6:
					Ol(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || iu || Km(bm(c.ownerDocument), a.type, c), Iu(i, a, n), s && r === null && o & 4 && Ml(a), Tl(a, a.return);
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
					a.memoizedState === null && Iu(i, a, n), Tl(a, a.return);
					break;
				case 30:
					Iu(i, a, n), Tl(a, a.return);
					break;
				case 7: Tl(a, a.return);
				default: Iu(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Lu(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && R(n));
	}
	function Ru(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && R(e));
	}
	function zu(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) Bu(e, t, n, r), t = t.sibling;
		else i && tu(t);
	}
	function Bu(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && eu(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				zu(e, t, n, r), a & 2048 && xl(9, t);
				break;
			case 1:
				zu(e, t, n, r);
				break;
			case 3:
				zu(e, t, n, r), i && fu && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && R(a)));
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
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && eu(t), o._visibility & 2 ? zu(e, t, n, r) : (o._visibility |= 2, Vu(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && eu(s), o._visibility & 2 ? zu(e, t, n, r) : Hu(e, t)), a & 2048 && Lu(s, t);
				break;
			case 24:
				zu(e, t, n, r), a & 2048 && Ru(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (ql(a.child, !0), ql(t.child, !0))), zu(e, t, n, r);
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
					Vu(a, o, s, c, i), xl(8, o);
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
				Wu(e, t, n), e.flags & Uu && (e.memoizedState === null ? (e = e.stateNode, (t & 335544128) === t && Zm(n, e)) : Qm(n, Ou, e.memoizedState, e.memoizedProps));
				break;
			case 5:
				Wu(e, t, n), e.flags & Uu && (e = e.stateNode, (t & 335544128) === t && Zm(n, e));
				break;
			case 3:
			case 4:
				var r = Ou;
				Ou = bm(e.stateNode.containerInfo), Wu(e, t, n), Ou = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Uu, Uu = 16777216, Wu(e, t, n), Uu = r) : Wu(e, t, n));
				break;
			case 30:
				if ((e.flags & Uu) !== 0 && (r = e.memoizedProps.name, r != null && r !== "auto")) {
					var i = e.stateNode;
					i.paired = null, Bl === null && (Bl = /* @__PURE__ */ new Map()), Bl.set(r, i);
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
				cu = r, Xu(r, e);
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
				qu(e), e.flags & 2048 && Sl(9, e, e.return);
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
				cu = r, Xu(r, e);
			}
			Ku(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Sl(8, t, t.return), Yu(t);
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
		for (; cu !== null;) {
			var n = cu;
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
				case 24: R(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, cu = r;
			else a: for (n = e; cu !== null;) {
				r = cu;
				var i = r.sibling, a = r.return;
				if (yu(r), r === n) {
					cu = null;
					break a;
				}
				if (i !== null) {
					i.return = a, cu = i;
					break a;
				}
				cu = a;
			}
		}
	}
	var Zu = {
		getCacheForType: function(e) {
			var t = ka(L), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return ka(L).controller.signal;
		}
	}, Qu = typeof WeakMap == "function" ? WeakMap : Map, q = 0, $u = null, J = null, Y = 0, X = 0, ed = null, td = !1, nd = !1, rd = !1, id = 0, ad = 0, od = 0, sd = 0, cd = 0, ld = 0, ud = 0, dd = null, fd = null, pd = !1, md = 0, hd = 0, gd = Infinity, _d = null, vd = null, yd = 0, bd = null, xd = null, Sd = 0, Cd = 0, wd = null, Td = null, Ed = null, Dd = null, Od = null, kd = 0, Ad = null;
	function jd() {
		return q & 2 && Y !== 0 ? Y & -Y : E.T === null ? At() : Pf();
	}
	function Md() {
		if (ld === 0) {
			if (!(Y & 536870912) || I) {
				var e = mt;
				mt <<= 1, !(mt & 3932160) && (mt = 262144), ld = e;
			} else ld = 536870912;
		}
		return e = jo.current, e !== null && (e.flags |= 32), ld;
	}
	function Nd(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Pp(wi(e.memoizedProps, n))), Dd === null && (Dd = []), Dd.push(t.bind(null, r));
		}
	}
	function Pd(e, t, n) {
		(e === $u && (X === 2 || X === 9) || e.cancelPendingCommit !== null) && (Vd(e, 0), Rd(e, Y, ld, !1)), Ct(e, n), (!(q & 2) || e !== $u) && (e === $u && (!(q & 2) && (sd |= n), ad === 4 && Rd(e, Y, ld, !1)), Ef(e));
	}
	function Fd(e, t, n) {
		if (q & 6) throw Error(i(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || vt(e, t), a = r ? Yd(e, t) : qd(e, t, !0), o = r;
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
					if ((t & 62914560) === t && (a = md + 300 - Ze(), 10 < a)) {
						if (Rd(r, t, ld, !td), _t(r, 0, !0) !== 0) break a;
						Sd = t, r.timeoutHandle = gp(Id.bind(null, r, n, fd, _d, pd, t, ld, sd, ud, td, o, "Throttled", -0, 0), a);
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
			unsuspend: On
		}, Bl = null, Gu(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = nh.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? md - Ze() : (a & 4194048) === a ? hd - Ze() : 0, m = eh(d, m), m !== null) ? (Sd = a, e.cancelPendingCommit = m(nf.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), Rd(e, a, o, !l)) : nf(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function Ld(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!Jr(a(), i)) return !1;
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
		t = yt(e, t), t &= ~cd, t &= ~sd, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - lt(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && Tt(e, n, t);
	}
	function zd() {
		return q & 6 ? !0 : (Df(0, !1), !1);
	}
	function Bd() {
		if (J !== null) {
			if (X === 0) var e = J.return;
			else e = J, xa = ba = null, is(e), ao = null, oo = 0, e = J;
			for (; e !== null;) bl(e.alternate, e), e = e.return;
			J = null;
		}
	}
	function Vd(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, _p(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), Sd = 0, Bd(), $u = e, J = n = Vi(e.current, null), Y = t, X = 0, ed = null, td = !1, nd = vt(e, t), rd = !1, ud = ld = cd = sd = od = ad = 0, fd = dd = null, pd = !1, id = yt(e, t), ji(), n;
	}
	function Hd(e, t) {
		V = null, E.H = mc, t === z || t === Qa ? (t = ro(), X = 3) : t === Za ? (t = ro(), X = 4) : X = t === Mc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, ed = t, J === null && (ad = 1, Ec(e, N(t, e.current)));
	}
	function Ud() {
		var e = jo.current;
		return e === null ? !0 : (Y & 4194048) === Y ? Mo === null : (Y & 62914560) === Y || Y & 536870912 ? e === Mo : !1;
	}
	function Wd() {
		var e = E.H;
		return E.H = mc, e === null ? mc : e;
	}
	function Gd() {
		var e = E.A;
		return E.A = Zu, e;
	}
	function Kd() {
		ad = 4, td || (Y & 4194048) !== Y && jo.current !== null || (nd = !0), !(od & 134217727) && !(sd & 134217727) || $u === null || Rd($u, Y, ld, !1);
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
							jo.current === null && (t = !0);
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
		return t && e.shellSuspendCounter++, xa = ba = null, q = r, E.H = i, E.A = a, J === null && ($u = null, Y = 0, ji()), o;
	}
	function Jd() {
		for (; J !== null;) Zd(J);
	}
	function Yd(e, t) {
		var n = q;
		q |= 2;
		var r = Wd(), a = Gd();
		$u !== e || Y !== t ? (_d = null, gd = Ze() + 500, Vd(e, t)) : nd = vt(e, t);
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
							if (B(o)) {
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
							B(o) ? (X = 0, ed = null, Qd(t)) : (X = 0, ed = null, $d(e, t, o, 7));
							break;
						case 5:
							var s = null;
							switch (J.tag) {
								case 26: s = J.memoizedState;
								case 5:
								case 27:
									var c = J;
									if (s ? Ym(s) : c.stateNode.complete) {
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
		return xa = ba = null, E.H = r, E.A = a, q = n, J === null ? ($u = null, Y = 0, ji(), ad) : 0;
	}
	function Xd() {
		for (; J !== null && !Ye();) Zd(J);
	}
	function Zd(e) {
		var t = fl(e.alternate, e, id);
		e.memoizedProps = e.pendingProps, t === null ? ef(e) : J = t;
	}
	function Qd(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = Kc(n, t, t.pendingProps, t.type, void 0, Y);
				break;
			case 11:
				t = Kc(n, t, t.pendingProps, t.type.render, t.ref, Y);
				break;
			case 5:
				is(t);
				var r = t;
				r === ca && (I ? (ma(r), r.tag === 5 && r.stateNode != null && (F = r.stateNode)) : (ma(r), I = !0));
			default: bl(n, t), t = J = Hi(t, id), t = fl(n, t, id);
		}
		e.memoizedProps = e.pendingProps, t === null ? ef(e) : J = t;
	}
	function $d(e, t, n, r) {
		xa = ba = null, is(t), ao = null, oo = 0;
		var i = t.return;
		try {
			if (jc(e, i, t, n, Y)) {
				ad = 1, Ec(e, N(n, e.current)), J = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw J = i, t;
			ad = 1, Ec(e, N(n, e.current)), J = null;
			return;
		}
		t.flags & 32768 ? (I || r === 1 ? e = !0 : nd || Y & 536870912 ? e = !1 : (td = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = jo.current, r !== null && r.tag === 13 && (r.flags |= 16384))), tf(t, e)) : ef(t);
	}
	function ef(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				tf(t, td);
				return;
			}
			e = t.return;
			var n = vl(t.alternate, t, id);
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
			var n = yl(e.alternate, e);
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
		if (Cd = s, s |= Ai, wt(e, n, s, r, i, a), Dd = null, (n & 335544064) === n ? (Od = Ra(e), r = 10262) : (Od = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, yf(tt, function() {
			return ff(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), zl = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = E.T, E.T = null, i = D.p, D.p = 2, a = q, q |= 4;
			try {
				pu(e, t, n);
			} finally {
				q = a, D.p = i, E.T = r;
			}
		}
		yd = 1, zl ? Ed = Mp(o, e.containerInfo, Od, sf, cf, of, lf, ff, af, null, null) : (sf(), cf(), lf());
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
				r = E.T, E.T = null;
				var i = D.p;
				D.p = 2;
				var a = q;
				q |= 4;
				try {
					uu = du = !1, ku(t, e, n), n = cp;
					var o = ei(e.containerInfo), s = n.focusedElem, c = n.selectionRange;
					if (o !== s && s && s.ownerDocument && $r(s.ownerDocument.documentElement, s)) {
						if (c !== null && ti(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Qr(s, h), v = Qr(s, g);
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
					gh = !!sp, cp = sp = null;
				} finally {
					q = a, D.p = i, E.T = r;
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
				n = E.T, E.T = null;
				var r = D.p;
				D.p = 2;
				var i = q;
				q |= 4;
				try {
					hu(e, t.alternate, t);
				} finally {
					q = i, D.p = r, E.T = n;
				}
			}
			yd = 3;
		}
	}
	function lf() {
		if (yd === 4 || yd === 3) {
			yd = 0;
			var e = Ed;
			Ed = null, Xe();
			var t = bd, n = xd, r = Sd, i = Td, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? yd = 5 : (yd = 0, xd = bd = null, uf(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (vd = null), kt(r), n = n.stateNode, st && typeof st.onCommitFiberRoot == "function") try {
				st.onCommitFiberRoot(ot, n, void 0, (n.current.flags & 128) == 128);
			} catch {}
			if (i !== null) {
				n = E.T, a = D.p, D.p = 2, E.T = null;
				try {
					for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
						var c = i[s];
						o(c.value, { componentStack: c.stack });
					}
				} finally {
					E.T = n, D.p = a;
				}
			}
			if (i = Dd, o = Od, Od = null, i !== null && (Dd = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			Sd & 3 && df(), Ef(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === Ad ? kd++ : (kd = 0, Ad = t) : (kd = 0, Ad = null), Df(0, !1);
		}
	}
	function uf(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, R(t)));
	}
	function df() {
		return Ed !== null && (Ed.skipTransition(), Ed = null), sf(), cf(), lf(), ff();
	}
	function ff() {
		if (yd !== 5) return !1;
		var e = bd, t = Cd;
		Cd = 0;
		var n = kt(Sd), r = E.T, a = D.p;
		try {
			D.p = 32 > n ? 32 : n, E.T = null, n = wd, wd = null;
			var o = bd, s = Sd;
			if (yd = 0, xd = bd = null, Sd = 0, q & 6) throw Error(i(331));
			var c = q;
			if (q |= 4, Ju(o.current), Bu(o, o.current, s, n), q = c, Df(0, !1), st && typeof st.onPostCommitFiberRoot == "function") try {
				st.onPostCommitFiberRoot(ot, o);
			} catch {}
			return !0;
		} finally {
			D.p = a, E.T = r, uf(e, t);
		}
	}
	function pf(e, t, n) {
		t = N(n, t), t = Oc(e.stateNode, t, 2), e = vo(e, t, 2), e !== null && (Ct(e, 2), Ef(e));
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
					e = N(n, e), n = kc(2), r = vo(t, n, 2), r !== null && (Ac(n, r, t, e), Ct(r, 2), Ef(r));
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
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, $u === e && (Y & n) === n && (ad === 4 || ad === 3 && (Y & 62914560) === Y && 300 > Ze() - md ? q & 2 ? cd |= n : Vd(e, 0) : cd |= n, ud === Y && (ud = 0)), Ef(e);
	}
	function gf(e, t) {
		t === 0 && (t = xt()), e = Pi(e, t), e !== null && (Ct(e, t), Ef(e));
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
		return qe(e, t);
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
								a = (1 << 31 - lt(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, Mf(r, a));
						} else a = Y, a = _t(r, r === $u ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || vt(r, a) || (n = !0, Mf(r, a));
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
		Tf !== 0 && hp() && (e = Tf);
		for (var t = Ze(), n = null, r = bf; r !== null;) {
			var i = r.next, a = Af(r, t);
			a === 0 ? (r.next = null, n === null ? bf = i : n.next = i, i === null && (xf = n)) : (n = r, (e !== 0 || a & 3) && (Cf = !0)), r = i;
		}
		yd !== 0 && yd !== 5 || Df(e, !1), Tf !== 0 && (Tf = 0);
	}
	function Af(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - lt(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = bt(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = $u, n = Y, n = _t(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (X === 2 || X === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Je(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || vt(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Je(r), kt(n)) {
				case 2:
				case 8:
					n = et;
					break;
				case 32:
					n = tt;
					break;
				case 268435456:
					n = rt;
					break;
				default: n = tt;
			}
			return r = jf.bind(null, e), n = qe(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Je(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function jf(e, t) {
		if (yd !== 0 && yd !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (df() && e.callbackNode !== n) return null;
		var r = Y;
		return r = _t(e, e === $u ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Fd(e, r, t), Af(e, Ze()), e.callbackNode != null && e.callbackNode === n ? jf.bind(null, e) : null);
	}
	function Mf(e, t) {
		if (df()) return null;
		Fd(e, t, !0);
	}
	function Nf() {
		bp(function() {
			q & 6 ? qe($e, Of) : kf();
		});
	}
	function Pf() {
		if (Tf === 0) {
			var e = Va;
			e === 0 && (e = pt, pt <<= 1, !(pt & 261888) && (pt = 256)), Tf = e;
		}
		return Tf;
	}
	function Ff(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Dn(e);
	}
	function If(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = Ff((i[Pt] || null).action), o = r.submitter;
			o && (t = (t = o[Pt] || null) ? Ff(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new qn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (Tf !== 0) {
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
	for (var Lf = 0; Lf < xi.length; Lf++) {
		var Rf = xi[Lf];
		Si(Rf.toLowerCase(), "on" + (Rf[0].toUpperCase() + Rf.slice(1)));
	}
	Si(pi, "onAnimationEnd"), Si(mi, "onAnimationIteration"), Si(hi, "onAnimationStart"), Si("dblclick", "onDoubleClick"), Si("focusin", "onFocus"), Si("focusout", "onBlur"), Si(gi, "onTransitionRun"), Si(_i, "onTransitionStart"), Si(vi, "onTransitionCancel"), Si(yi, "onTransitionEnd"), Zt("onMouseEnter", ["mouseout", "mouseover"]), Zt("onMouseLeave", ["mouseout", "mouseover"]), Zt("onPointerEnter", ["pointerout", "pointerover"]), Zt("onPointerLeave", ["pointerout", "pointerover"]), Xt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Xt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Xt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), Xt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Xt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Xt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
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
						Di(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Di(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Q(e, t) {
		var n = t[It];
		n === void 0 && (n = t[It] = /* @__PURE__ */ new Set());
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
			e[Uf] = !0, Jt.forEach(function(t) {
				t !== "selectionchange" && (Bf.has(t) || Hf(t, !1, e), Hf(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Uf] || (t[Uf] = !0, Hf("selectionchange", !1, t));
		}
	}
	function Gf(e, t, n, r) {
		switch (Ch(t)) {
			case 2:
				var i = _h;
				break;
			case 8:
				i = vh;
				break;
			default: i = yh;
		}
		n = i.bind(null, t, n, e), i = void 0, !Rn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
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
					if (s = Ht(c), s === null) return;
					if (l = s.tag, l === 5 || l === 6 || l === 26 || l === 27) {
						r = a = s;
						continue a;
					}
					c = c.parentNode;
				}
			}
			r = r.return;
		}
		Fn(function() {
			var r = a, i = An(n), s = [];
			a: {
				var c = bi.get(e);
				if (c !== void 0) {
					var l = qn, u = e;
					switch (e) {
						case "keypress": if (Un(n) === 0) break a;
						case "keydown":
						case "keyup":
							l = ur;
							break;
						case "focusin":
							u = "focus", l = nr;
							break;
						case "focusout":
							u = "blur", l = nr;
							break;
						case "beforeblur":
						case "afterblur":
							l = nr;
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
							l = er;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							l = tr;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							l = pr;
							break;
						case pi:
						case mi:
						case hi:
							l = rr;
							break;
						case yi:
							l = mr;
							break;
						case "scroll":
						case "scrollend":
							l = Yn;
							break;
						case "wheel":
							l = hr;
							break;
						case "copy":
						case "cut":
						case "paste":
							l = ir;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							l = dr;
							break;
						case "submit":
							l = fr;
							break;
						case "toggle":
						case "beforetoggle": l = gr;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? c === null ? null : c + "Capture" : c;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = In(m, p), g != null && d.push(qf(m, g, h))), f) break;
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
					if (l = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", l && n !== kn && (u = n.relatedTarget || n.fromElement) && (Ht(u) || u[Ft])) break a;
					(c || l) && (u = i.window === i ? i : (l = i.ownerDocument) ? l.defaultView || l.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? Ht(l) : null, l !== null && (f = o(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l && (d = er, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = dr, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? u : Wt(c), h = l == null ? u : Wt(l), u = new d(g, m + "leave", c, n, i), u.target = f, u.relatedTarget = h, g = null, Ht(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = c && l ? ne(c, l, Yf) : null, c !== null && Xf(s, u, c, d, !1), l !== null && f !== null && Xf(s, f, l, d, !0)));
				}
				a: {
					if (c = r ? Wt(r) : window, l = c.nodeName && c.nodeName.toLowerCase(), l === "select" || l === "input" && c.type === "file") var _ = Ir;
					else if (Ar(c)) {
						if (Lr) _ = Kr;
						else {
							_ = Wr;
							var v = Ur;
						}
					} else l = c.nodeName, !l || l.toLowerCase() !== "input" || c.type !== "checkbox" && c.type !== "radio" ? r && wn(r.elementType) && (_ = Ir) : _ = Gr;
					if (_ &&= _(e, r)) {
						jr(s, _, n, i);
						break a;
					}
					v && v(e, c, r);
				}
				switch (v = r ? Wt(r) : window, e) {
					case "focusin":
						(Ar(v) || v.contentEditable === "true") && (ri = v, ii = r, ai = null);
						break;
					case "focusout":
						ai = ii = ri = null;
						break;
					case "mousedown":
						oi = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						oi = !1, si(s, n, i);
						break;
					case "selectionchange": if (ni) break;
					case "keydown":
					case "keyup": si(s, n, i);
				}
				var y;
				if (vr) b: {
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
				else Er ? wr(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
				b && (xr && n.locale !== "ko" && (Er || b !== "onCompositionStart" ? b === "onCompositionEnd" && Er && (y = Hn()) : (Bn = i, Vn = "value" in Bn ? Bn.value : Bn.textContent, Er = !0)), v = Jf(r, b), 0 < v.length && (b = new ar(b, e, null, n, i), s.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = Tr(n), y !== null && (b.data = y)))), (y = br ? Dr(e, n) : Or(e, n)) && (b = Jf(r, "onBeforeInput"), 0 < b.length && (v = new ar("onBeforeInput", "beforeinput", null, n, i), s.push({
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
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = In(e, n), i != null && r.unshift(qf(e, i, a)), i = In(e, t), i != null && r.push(qf(e, i, a))), e.tag === 3) return r;
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
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = In(n, a), l != null && o.unshift(qf(n, l, c))) : i || (l = In(n, a), l != null && o.push(qf(n, l, c)))), n = n.return;
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
	function $(e, t, n, r, a, o) {
		switch (n) {
			case "children":
				if (typeof r == "string") t === "body" || t === "textarea" && r === "" || bn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") t !== "body" && bn(e, "" + r);
				else return;
				break;
			case "className":
				an(e, "class", r);
				break;
			case "tabIndex":
				an(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				an(e, n, r);
				break;
			case "style":
				Cn(e, r, o);
				return;
			case "data": if (t !== "object") {
				an(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href") || r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Dn(r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof o == "function" && (n === "formAction" ? (t !== "input" && $(e, t, "name", a.name, a, null), $(e, t, "formEncType", a.formEncType, a, null), $(e, t, "formMethod", a.formMethod, a, null), $(e, t, "formTarget", a.formTarget, a, null)) : ($(e, t, "encType", a.encType, a, null), $(e, t, "method", a.method, a, null), $(e, t, "target", a.target, a, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Dn(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = On);
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
				n = Dn(r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
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
				Q("beforetoggle", e), Q("toggle", e), rn(e, "popover", r);
				break;
			case "xlinkActuate":
				on(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				on(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				on(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				on(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				on(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				on(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				on(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				on(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				on(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				rn(e, "is", r);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") n = Tn.get(n) || n, rn(e, n, r);
			else return;
		}
		k = !0;
	}
	function tp(e, t, n, r, a, o) {
		switch (n) {
			case "style":
				Cn(e, r, o);
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
				if (typeof r == "string") bn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") bn(e, "" + r);
				else return;
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				return;
			case "onClick":
				r != null && (e.onclick = On);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!Yt.hasOwnProperty(n)) a: {
					if (n[0] === "o" && n[1] === "n" && (a = n.endsWith("Capture"), o = n.slice(2, a ? n.length - 7 : void 0), t = e[Pt] || null, t = t == null ? null : t[n], typeof t == "function" && e.removeEventListener(o, t, a), typeof r == "function")) {
						typeof t != "function" && t !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(o, r, a);
						break a;
					}
					k = !0, n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : rn(e, n, r);
				}
				return;
		}
		k = !0;
	}
	function np(e, t, n) {
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
						default: $(e, t, o, s, n, null);
					}
				}
				a && $(e, t, "srcSet", n.srcSet, n, null), r && $(e, t, "src", n.src, n, null);
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
						default: $(e, t, r, d, n, null);
					}
				}
				hn(e, o, c, l, u, s, a, !1);
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
					default: $(e, t, a, c, n, null);
				}
				t = o, n = s, e.multiple = !!r, t == null ? n != null && _n(e, !!r, n, !0) : _n(e, !!r, t, !1);
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
					default: $(e, t, s, c, n, null);
				}
				yn(e, r, a, o);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: $(e, t, l, r, n, null);
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
					default: $(e, t, u, r, n, null);
				}
				return;
			default: if (wn(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && tp(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && $(e, t, c, r, n, null));
	}
	var rp = {};
	function ip(e, t, n, r) {
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
						default: r.hasOwnProperty(m) || $(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							m !== f && (k = !0), o = m;
							break;
						case "name":
							m !== f && (k = !0), a = m;
							break;
						case "checked":
							m !== f && (k = !0), u = m;
							break;
						case "defaultChecked":
							m !== f && (k = !0), d = m;
							break;
						case "value":
							m !== f && (k = !0), s = m;
							break;
						case "defaultValue":
							m !== f && (k = !0), c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(i(137, t));
							break;
						default: m !== f && $(e, t, p, m, r, f);
					}
				}
				mn(e, s, c, l, u, d, o, a);
				return;
			case "select":
				for (o in m = s = c = p = null, n) if (l = n[o], n.hasOwnProperty(o) && l != null) switch (o) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(o) || $(e, t, o, null, r, l);
				}
				for (a in r) if (o = r[a], l = n[a], r.hasOwnProperty(a) && (o != null || l != null)) switch (a) {
					case "value":
						o !== l && (k = !0), p = o;
						break;
					case "defaultValue":
						o !== l && (k = !0), c = o;
						break;
					case "multiple": o !== l && (k = !0), s = o;
					default: o !== l && $(e, t, a, o, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? _n(e, !!n, n ? [] : "", !1) : _n(e, !!n, t, !0)) : _n(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (a = n[c], n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: $(e, t, c, null, r, a);
				}
				for (s in r) if (a = r[s], o = n[s], r.hasOwnProperty(s) && (a != null || o != null)) switch (s) {
					case "value":
						a !== o && (k = !0), p = a;
						break;
					case "defaultValue":
						a !== o && (k = !0), m = a;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (a != null) throw Error(i(91));
						break;
					default: a !== o && $(e, t, s, a, r, o);
				}
				vn(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: $(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						p !== m && (k = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: $(e, t, l, p, r, m);
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
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && $(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(i(137, t));
						break;
					default: $(e, t, u, p, r, m);
				}
				return;
			default: if (wn(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && tp(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || tp(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && $(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || $(e, t, f, p, r, m);
	}
	function ap(e) {
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
	function op() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && ap(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && ap(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var sp = null, cp = null;
	function lp(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function up(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function dp(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function fp(e, t, n, r) {
		return n = lp(n).createElement(e), n[Nt] = r, n[Pt] = t, np(n, e, t), Kt(n), n;
	}
	function pp(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var mp = null;
	function hp() {
		var e = window.event;
		return e && e.type === "popstate" ? e !== mp && (mp = e, !0) : (mp = null, !1);
	}
	var gp = typeof setTimeout == "function" ? setTimeout : void 0, _p = typeof clearTimeout == "function" ? clearTimeout : void 0, vp = typeof Promise == "function" ? Promise : void 0, yp = typeof requestAnimationFrame == "function" ? requestAnimationFrame : gp, bp = typeof queueMicrotask == "function" ? queueMicrotask : vp === void 0 ? gp : function(e) {
		return vp.resolve(null).then(e).catch(xp);
	};
	function xp(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Sp(e) {
		return e === "head";
	}
	function Cp(e, t) {
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
				else if (n === "html") _m(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, _m(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[zt] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && _m(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Hh(t);
	}
	function wp(e, t) {
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
	function Tp(e, t, n) {
		if (t = CSS.escape(t) === t ? t : "r-" + btoa(t).replace(/=/g, ""), e.style.viewTransitionName = t, n != null && (e.style.viewTransitionClass = n), n = getComputedStyle(e), n.display === "inline") {
			if (t = e.getClientRects(), t.length === 1) var r = 1;
			else for (var i = r = 0; i < t.length; i++) {
				var a = t[i];
				0 < a.width && 0 < a.height && r++;
			}
			r === 1 && (e = e.style, e.display = t.length === 1 ? "inline-block" : "block", e.marginTop = "-" + n.paddingTop, e.marginBottom = "-" + n.paddingBottom);
		}
	}
	function Ep(e, t) {
		e = e.style, t = t.style;
		var n = t == null ? null : t.hasOwnProperty("viewTransitionName") ? t.viewTransitionName : t.hasOwnProperty("view-transition-name") ? t["view-transition-name"] : null;
		e.viewTransitionName = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), n = t == null ? null : t.hasOwnProperty("viewTransitionClass") ? t.viewTransitionClass : t.hasOwnProperty("view-transition-class") ? t["view-transition-class"] : null, e.viewTransitionClass = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), e.display === "inline-block" && (t == null ? e.display = e.margin = "" : (n = t.display, e.display = n == null || typeof n == "boolean" ? "" : n, n = t.margin, n == null ? (n = t.hasOwnProperty("marginTop") ? t.marginTop : t["margin-top"], e.marginTop = n == null || typeof n == "boolean" ? "" : n, t = t.hasOwnProperty("marginBottom") ? t.marginBottom : t["margin-bottom"], e.marginBottom = t == null || typeof t == "boolean" ? "" : t) : e.margin = n));
	}
	function Dp(e, t, n) {
		return n = n.ownerDocument.defaultView, {
			rect: e,
			abs: t.position === "absolute" || t.position === "fixed",
			clip: t.clipPath !== "none" || t.overflow !== "visible" || t.filter !== "none" || t.mask !== "none" || t.mask !== "none" || t.borderRadius !== "0px",
			view: 0 <= e.bottom && 0 <= e.right && e.top <= n.innerHeight && e.left <= n.innerWidth
		};
	}
	function Op(e) {
		return Dp(e.getBoundingClientRect(), getComputedStyle(e), e);
	}
	function kp(e) {
		var t = e.getBoundingClientRect();
		t = new DOMRect(t.x + 2e4, t.y + 2e4, t.width, t.height);
		var n = getComputedStyle(e);
		return Dp(t, n, e);
	}
	function Ap(e) {
		return e.documentElement.clientHeight;
	}
	function jp(e) {
		this.addEventListener("load", e), this.addEventListener("error", e);
	}
	function Mp(e, t, n, r, i, a, o, s, c) {
		var l = t.nodeType === 9 ? t : t.ownerDocument;
		try {
			var u = l.startViewTransition({
				update: function() {
					var t = l.defaultView, n = t.navigation && t.navigation.transition, o = l.fonts.status;
					r();
					var s = [];
					if (o === "loaded" && (Ap(l), l.fonts.status === "loading" && s.push(l.fonts.ready)), o = s.length, e !== null) for (var c = e.suspenseyImages, u = 0, d = 0; d < c.length; d++) {
						var f = c[d];
						if (!f.complete) {
							var p = f.getBoundingClientRect();
							if (0 < p.bottom && 0 < p.right && p.top < t.innerHeight && p.left < t.innerWidth) {
								if (u += Xm(f), u > $m) {
									s.length = o;
									break;
								}
								f = new Promise(jp.bind(f)), s.push(f);
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
	function Np(e, t) {
		this._scope = document.documentElement, this._selector = "::view-transition-" + e + "(" + t + ")";
	}
	Np.prototype.animate = function(e, t) {
		return t = typeof t == "number" ? { duration: t } : w({}, t), t.pseudoElement = this._selector, this._scope.animate(e, t);
	}, Np.prototype.getAnimations = function() {
		for (var e = this._scope, t = this._selector, n = e.getAnimations({ subtree: !0 }), r = [], i = 0; i < n.length; i++) {
			var a = n[i].effect;
			a !== null && a.target === e && a.pseudoElement === t && r.push(n[i]);
		}
		return r;
	}, Np.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function Pp(e) {
		return {
			name: e,
			group: new Np("group", e),
			imagePair: new Np("image-pair", e),
			old: new Np("old", e),
			new: new Np("new", e)
		};
	}
	function Fp(e) {
		this._fragmentFiber = e, this._observers = this._eventListeners = null;
	}
	Fp.prototype.addEventListener = function(e, t, n) {
		var r = null, i = null;
		if (!(n != null && typeof n != "boolean" && (r = n.signal || null, r !== null && r.aborted))) {
			this._eventListeners === null && (this._eventListeners = []);
			var a = this._eventListeners;
			if (Bp(a, e, t, n) === -1) {
				var o = this, s = t;
				n != null && typeof n != "boolean" && !0 === n.once && (s = function(r) {
					o.removeEventListener(e, t, n), typeof t == "function" ? t.call(this, r) : t.handleEvent(r);
				}), r !== null && (i = o.removeEventListener.bind(o, e, t, n), r.addEventListener("abort", i, { once: !0 }), i = r.removeEventListener.bind(r, "abort", i)), r = Rp(n), a.push({
					type: e,
					listener: t,
					optionsOrUseCapture: n,
					attachedListener: s,
					cleanup: i
				}), m(this._fragmentFiber.child, !1, Ip, e, s, r);
			}
			this._eventListeners = a;
		}
	};
	function Ip(e, t, n, r) {
		return b(e).addEventListener(t, n, r), !1;
	}
	Fp.prototype.removeEventListener = function(e, t, n) {
		var r = this._eventListeners;
		if (r !== null && (t = Bp(r, e, t, n), t !== -1)) {
			var i = r[t];
			n = i.attachedListener;
			var a = i.cleanup;
			i = Rp(i.optionsOrUseCapture), m(this._fragmentFiber.child, !1, Lp, e, n, i), r.splice(t, 1), a !== null && a();
		}
	};
	function Lp(e, t, n, r) {
		return b(e).removeEventListener(t, n, r), !1;
	}
	function Rp(e) {
		return e != null && typeof e != "boolean" && (!0 === e.once || e.signal instanceof AbortSignal) ? {
			capture: e.capture,
			passive: e.passive
		} : e;
	}
	function zp(e) {
		return e == null ? "c=0" : typeof e == "boolean" ? "c=" + (e ? "1" : "0") : "c=" + (e.capture ? "1" : "0");
	}
	function Bp(e, t, n, r) {
		if (e.length === 0) return -1;
		r = zp(r);
		for (var i = 0; i < e.length; i++) {
			var a = e[i];
			if (a.type === t && a.listener === n && zp(a.optionsOrUseCapture) === r) return i;
		}
		return -1;
	}
	Fp.prototype.dispatchEvent = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return !0;
		t = b(t);
		var n = this._eventListeners;
		if (n !== null && 0 < n.length || !e.bubbles) {
			var r = t.nodeType === 9 ? t.createComment("") : document.createTextNode("");
			if (n) for (var i = 0; i < n.length; i++) {
				var a = n[i];
				r.addEventListener(a.type, a.attachedListener, Rp(a.optionsOrUseCapture));
			}
			if (t.appendChild(r), e = r.dispatchEvent(e), n) for (i = 0; i < n.length; i++) a = n[i], r.removeEventListener(a.type, a.attachedListener, Rp(a.optionsOrUseCapture));
			return t.removeChild(r), e;
		}
		return t.dispatchEvent(e);
	}, Fp.prototype.focus = function(e) {
		m(this._fragmentFiber.child, !0, Vp, e, void 0, void 0);
	};
	function Vp(e, t) {
		return e.tag !== 6 && (e = b(e), pm(e, t));
	}
	Fp.prototype.focusLast = function(e) {
		var t = [];
		m(this._fragmentFiber.child, !0, Hp, t, void 0, void 0);
		for (var n = t.length - 1; 0 <= n && !Vp(t[n], e); n--);
	};
	function Hp(e, t) {
		return t.push(e), !1;
	}
	Fp.prototype.blur = function() {
		var e = g(this._fragmentFiber);
		e !== null && (e = b(e), e = lp(e).activeElement, e !== null && m(this._fragmentFiber.child, !1, Up, e, void 0, void 0));
	};
	function Up(e, t) {
		return e.tag !== 6 && (e = b(e), e === t || e.contains(t) ? (t.blur(), !0) : !1);
	}
	Fp.prototype.observeUsing = function(e) {
		this._observers === null && (this._observers = /* @__PURE__ */ new Set()), this._observers.add(e), m(this._fragmentFiber.child, !1, Wp, e, void 0, void 0);
	};
	function Wp(e, t) {
		return e.tag === 6 || (e = b(e), t.observe(e)), !1;
	}
	Fp.prototype.unobserveUsing = function(e) {
		var t = this._observers;
		if (t !== null && t.has(e)) {
			t.delete(e), m(this._fragmentFiber.child, !1, Gp, e, void 0, void 0);
			for (var n = t = 0; n < Kp.length; n++) {
				var r = Kp[n];
				r.fragmentInstance === this && r.observer === e ? e.unobserve(r.instance) : Kp[t++] = r;
			}
			Kp.length = t;
		}
	};
	function Gp(e, t) {
		return e.tag === 6 || (e = b(e), t.unobserve(e)), !1;
	}
	var Kp = [], qp = !1;
	function Jp(e, t, n) {
		Kp.push({
			fragmentInstance: e,
			observer: t,
			instance: n
		}), qp || (qp = !0, mm(function() {
			qp = !1;
			var e = Kp;
			Kp = [];
			for (var t = 0; t < e.length; t++) {
				var n = e[t];
				n.observer.unobserve(n.instance);
			}
		}));
	}
	Fp.prototype.getClientRects = function() {
		var e = [];
		return m(this._fragmentFiber.child, !1, Yp, e, void 0, void 0), e;
	};
	function Yp(e, t) {
		if (e.tag === 6) {
			e = e.stateNode;
			var n = e.ownerDocument.createRange();
			n.selectNodeContents(e), t.push.apply(t, n.getClientRects());
		} else e = b(e), t.push.apply(t, e.getClientRects());
		return !1;
	}
	Fp.prototype.getRootNode = function(e) {
		var t = g(this._fragmentFiber);
		return t === null ? this : b(t).getRootNode(e);
	}, Fp.prototype.compareDocumentPosition = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var n = [];
		m(this._fragmentFiber.child, !1, Hp, n, void 0, void 0);
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
		return s = r && a && o & Node.DOCUMENT_POSITION_FOLLOWING && s & Node.DOCUMENT_POSITION_PRECEDING, t = r && t === e || a && i === e || c || s ? Node.DOCUMENT_POSITION_CONTAINED_BY : !r && t === e || !a && i === e ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : o, t & Node.DOCUMENT_POSITION_DISCONNECTED || t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || Xp(t, this._fragmentFiber, n[0], n[n.length - 1], e) ? t : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function Xp(e, t, n, r, i) {
		var a = Ht(i);
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
		return e & Node.DOCUMENT_POSITION_PRECEDING ? ((t = !!a) && !(t = a === n) && (t = ne(n, a, C), t === null ? t = !1 : (m(t, !0, te, a, n), a = ee, ee = null, t = a !== null)), t) : e & Node.DOCUMENT_POSITION_FOLLOWING ? ((t = !!a) && !(t = a === r) && (t = ne(r, a, C), t === null ? t = !1 : (m(t, !0, S, a, r), a = ee, x = ee = null, t = a !== null)), t) : !1;
	}
	function Zp(e, t) {
		var n = e.ownerDocument.createRange();
		n.selectNodeContents(e), e = n.getBoundingClientRect(), window.scrollTo(window.scrollX + e.left, t ? window.scrollY + e.top : window.scrollY + e.bottom - window.innerHeight);
	}
	Fp.prototype.scrollIntoView = function(e) {
		if (typeof e == "object") throw Error(i(566));
		var t = [];
		m(this._fragmentFiber.child, !1, Hp, t, void 0, void 0);
		var n = !1 !== e;
		if (t.length === 0) {
			var r = v(this._fragmentFiber);
			if (r = n ? r[1] || r[0] || g(this._fragmentFiber) : r[0] || r[1], r === null) return;
			if (r.tag === 6) {
				e = b(r), Zp(e, n);
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
			a.tag === 6 ? (a = b(a), Zp(a, n)) : b(a).scrollIntoView(e), r += n ? -1 : 1;
		}
	};
	function Qp(e, t) {
		return e = b(e), $p(e, t), !1;
	}
	function $p(e, t) {
		e.reactFragments ??= /* @__PURE__ */ new Set(), e.reactFragments.add(t);
	}
	function em(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.addEventListener(i.type, i.attachedListener, Rp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			for (var r = 0, i = 0; i < Kp.length; i++) {
				var a = Kp[i];
				(a.fragmentInstance !== t || a.observer !== n || a.instance !== e) && (Kp[r++] = a);
			}
			Kp.length = r, n.observe(e);
		}), $p(e, t));
	}
	function tm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.removeEventListener(i.type, i.attachedListener, Rp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			typeof n.rootMargin == "string" ? Jp(t, n, e) : n.unobserve(e);
		}), e.reactFragments != null && e.reactFragments.delete(t));
	}
	function nm(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					nm(n), Vt(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function rm(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) {
				if (t === "input" && e.type === "hidden") {
					var a = i.name == null ? null : "" + i.name;
					if (i.type === "hidden" && e.getAttribute("name") === a) return e;
				} else return e;
			} else if (!e[zt]) switch (t) {
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
			if (e = lm(e.nextSibling), e === null) break;
		}
		return null;
	}
	function im(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = lm(e.nextSibling), e === null)) return null;
		return e;
	}
	function am(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = lm(e.nextSibling), e === null)) return null;
		return e;
	}
	function om(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function sm(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function cm(e, t) {
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
	function lm(e) {
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
	var um = null;
	function dm(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return lm(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function fm(e) {
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
	function pm(e, t) {
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
	function mm(e) {
		yp(function() {
			yp(function(t) {
				return e(t);
			});
		});
	}
	function hm(e, t, n) {
		switch (t = lp(n), e) {
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
	function gm(e, t, n) {
		for (var r in n) {
			var i = n[r];
			n.hasOwnProperty(r) && i != null && $(e, t, r, null, rp, i);
		}
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === On && (e.onclick = null), Vt(e);
	}
	function _m(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		Vt(e);
	}
	var vm = /* @__PURE__ */ new Map(), ym = /* @__PURE__ */ new Set();
	function bm(e) {
		if (typeof e.getRootNode == "function") {
			var t = e.getRootNode();
			if (t.nodeType === 9 || t.nodeType === 11) return t;
		}
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	var xm = D.d;
	D.d = {
		f: Sm,
		r: Cm,
		D: Em,
		C: Dm,
		L: Om,
		m: km,
		X: jm,
		S: Am,
		M: Mm
	};
	function Sm() {
		var e = xm.f(), t = zd();
		return e || t;
	}
	function Cm(e) {
		var t = Ut(e);
		t !== null && t.tag === 5 && t.type === "form" ? nc(t) : xm.r(e);
	}
	var wm = typeof document > "u" ? null : document;
	function Tm(e, t, n) {
		var r = wm;
		if (r && typeof t == "string" && t) {
			var i = pn(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), ym.has(i) || (ym.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), np(t, "link", e), Kt(t), r.head.appendChild(t)));
		}
	}
	function Em(e) {
		xm.D(e), Tm("dns-prefetch", e, null);
	}
	function Dm(e, t) {
		xm.C(e, t), Tm("preconnect", e, t);
	}
	function Om(e, t, n) {
		xm.L(e, t, n);
		var r = wm;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + pn(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + pn(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + pn(n.imageSizes) + "\"]")) : i += "[href=\"" + pn(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = Pm(e);
					break;
				case "script": a = Rm(e);
			}
			if (!(vm.has(a) || (e = w({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), vm.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Fm(a)) || t === "script" && r.querySelector(zm(a))))) {
				var o = r.createElement("link");
				np(o, "link", e), t === "style" && (o[Bt] = !0, o.onload = o.onerror = function() {
					qt(o);
				}), Kt(o), r.head.appendChild(o);
			}
		}
	}
	function km(e, t) {
		xm.m(e, t);
		var n = wm;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + pn(r) + "\"][href=\"" + pn(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = Rm(e);
			}
			if (!vm.has(a) && (e = w({
				rel: "modulepreload",
				href: e
			}, t), vm.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(zm(a))) return;
				}
				r = n.createElement("link"), np(r, "link", e), Kt(r), n.head.appendChild(r);
			}
		}
	}
	function Am(e, t, n) {
		xm.S(e, t, n);
		var r = wm;
		if (r && e) {
			var i = Gt(r).hoistableStyles, a = Pm(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(Fm(a))) s.loading = 5;
				else {
					e = w({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = vm.get(a)) && Hm(e, n);
					var c = o = r.createElement("link");
					Kt(c), np(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Vm(o, t, r);
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
	function jm(e, t) {
		xm.X(e, t);
		var n = wm;
		if (n && e) {
			var r = Gt(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = w({
				src: e,
				async: !0
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), Kt(a), np(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Mm(e, t) {
		xm.M(e, t);
		var n = wm;
		if (n && e) {
			var r = Gt(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = w({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), Kt(a), np(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Nm(e, t, n, r) {
		var a = (a = Ne.current) ? bm(a) : null;
		if (!a) throw Error(i(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (n = Pm(n.href), t = Gt(a).hoistableStyles, r = t.get(n), r || (r = {
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
					e = Pm(n.href);
					var o = Gt(a).hoistableStyles, s = o.get(e);
					if (s || (a = a.ownerDocument || a, s = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, o.set(e, s), (o = a.querySelector(Fm(e))) ? o._p || (s.instance = o, s.state.loading = 5) : (o = vm.get(e), o || (o = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, vm.set(e, o)), Lm(a, e, o, s.state))), t && r === null) throw Error(i(528, ""));
					return s;
				}
				if (t && r !== null) throw Error(i(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = Rm(n), t = Gt(a).hoistableScripts, r = t.get(n), r || (r = {
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
	function Pm(e) {
		return "href=\"" + pn(e) + "\"";
	}
	function Fm(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Im(e) {
		return w({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Lm(e, t, n, r) {
		if (t = e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]")) {
			if (!0 !== t[Bt]) {
				r.loading = 1;
				return;
			}
		} else t = e.createElement("link"), t[Bt] = !0, t.onload = t.onerror = qt.bind(null, t), np(t, "link", n), Kt(t), e.head.appendChild(t);
		r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		});
	}
	function Rm(e) {
		return "[src=\"" + pn(e) + "\"]";
	}
	function zm(e) {
		return "script[async]" + e;
	}
	function Bm(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + pn(n.href) + "\"]");
				if (r) return t.instance = r, Kt(r), r;
				var a = w({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), Kt(r), np(r, "style", a), Vm(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				a = Pm(n.href);
				var o = e.querySelector(Fm(a));
				if (o) return t.state.loading |= 4, t.instance = o, Kt(o), o;
				r = Im(n), (a = vm.get(a)) && Hm(r, a), o = (e.ownerDocument || e).createElement("link"), Kt(o);
				var s = o;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), np(o, "link", r), t.state.loading |= 4, Vm(o, n.precedence, e), t.instance = o;
			case "script": return o = Rm(n.src), (a = e.querySelector(zm(o))) ? (t.instance = a, Kt(a), a) : (r = n, (a = vm.get(o)) && (r = w({}, n), Um(r, a)), e = e.ownerDocument || e, a = e.createElement("script"), Kt(a), np(a, "link", r), e.head.appendChild(a), t.instance = a);
			case "void": return null;
			default: throw Error(i(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Vm(r, n.precedence, e));
		return t.instance;
	}
	function Vm(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function Hm(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function Um(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Wm = null;
	function Gm(e, t, n) {
		if (Wm === null) {
			var r = /* @__PURE__ */ new Map(), i = Wm = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Wm, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[zt] || a[Nt] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function Km(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function qm(e, t, n) {
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
	function Jm(e, t) {
		return e === "img" && t.src != null && t.src !== "" && t.onLoad == null && t.loading !== "lazy";
	}
	function Ym(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Xm(e) {
		return (e.width || 100) * (e.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * .25;
	}
	function Zm(e, t) {
		typeof t.decode == "function" && (e.imgCount++, t.complete || (e.imgBytes += Xm(t), e.suspenseyImages.push(t)), e = rh.bind(e), t.decode().then(e, e));
	}
	function Qm(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = Pm(r.href), a = t.querySelector(Fm(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = nh.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, Kt(a);
					return;
				}
				a = t.ownerDocument || t, r = Im(r), (i = vm.get(i)) && Hm(r, i), a = a.createElement("link"), Kt(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), np(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = nh.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var $m = 0;
	function eh(e, t) {
		return e.stylesheets && e.count === 0 && ah(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && ah(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && $m === 0 && ($m = 62500 * op());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && ah(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > $m ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function th(e) {
		if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
			if (e.stylesheets) ah(e, e.stylesheets);
			else if (e.unsuspend) {
				var t = e.unsuspend;
				e.unsuspend = null, t();
			}
		}
	}
	function nh() {
		this.count--, th(this);
	}
	function rh() {
		this.imgCount--, th(this);
	}
	var ih = null;
	function ah(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, ih = /* @__PURE__ */ new Map(), t.forEach(oh, e), ih = null, nh.call(e));
	}
	function oh(e, t) {
		if (!(t.state.loading & 4)) {
			var n = ih.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), ih.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = nh.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var sh = {
		$$typeof: le,
		Provider: null,
		Consumer: null,
		_currentValue: Te,
		_currentValue2: Te,
		_threadCount: 0
	};
	function ch(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = St(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = St(0), this.hiddenUpdates = St(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function lh(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new ch(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = zi(3, null, null, t), e.current = a, a.stateNode = e, t = Fa(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, ho(a), e;
	}
	function uh(e) {
		return e ? (e = Li, e) : Li;
	}
	function dh(e, t, n, r, i, a) {
		i = uh(i), r.context === null ? r.context = i : r.pendingContext = i, r = _o(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = vo(e, r, t), n !== null && (Pd(n, e, t), yo(n, e, t));
	}
	function fh(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function ph(e, t) {
		fh(e, t), (e = e.alternate) && fh(e, t);
	}
	function mh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Pi(e, 67108864);
			t !== null && Pd(t, e, 67108864), ph(e, 67108864);
		}
	}
	function hh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = jd();
			t = Ot(t);
			var n = Pi(e, t);
			n !== null && Pd(n, e, t), ph(e, t);
		}
	}
	var gh = !0;
	function _h(e, t, n, r) {
		var i = E.T;
		E.T = null;
		var a = D.p;
		try {
			D.p = 2, yh(e, t, n, r);
		} finally {
			D.p = a, E.T = i;
		}
	}
	function vh(e, t, n, r) {
		var i = E.T;
		E.T = null;
		var a = D.p;
		try {
			D.p = 8, yh(e, t, n, r);
		} finally {
			D.p = a, E.T = i;
		}
	}
	function yh(e, t, n, r) {
		if (gh) {
			var i = bh(r);
			if (i === null) Kf(e, t, r, xh, n), Mh(e, r);
			else if (Ph(i, e, t, n, r)) r.stopPropagation();
			else if (Mh(e, r), t & 4 && -1 < jh.indexOf(e)) {
				for (; i !== null;) {
					var a = Ut(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = gt(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - lt(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									Ef(a), !(q & 6) && (gd = Ze() + 500, Df(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Pi(a, 2), s !== null && Pd(s, a, 2), zd(), ph(a, 2);
					}
					if (a = bh(r), a === null && Kf(e, t, r, xh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Kf(e, t, r, null, n);
		}
	}
	function bh(e) {
		return e = An(e), Sh(e);
	}
	var xh = null;
	function Sh(e) {
		if (xh = null, e = Ht(e), e !== null) {
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
		return xh = e, null;
	}
	function Ch(e) {
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
			case "message": switch (Qe()) {
				case $e: return 2;
				case et: return 8;
				case tt:
				case nt: return 32;
				case rt: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var wh = !1, Th = null, Eh = null, Dh = null, Oh = /* @__PURE__ */ new Map(), kh = /* @__PURE__ */ new Map(), Ah = [], jh = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Mh(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				Th = null;
				break;
			case "dragenter":
			case "dragleave":
				Eh = null;
				break;
			case "mouseover":
			case "mouseout":
				Dh = null;
				break;
			case "pointerover":
			case "pointerout":
				Oh.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": kh.delete(t.pointerId);
		}
	}
	function Nh(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = Ut(t), t !== null && mh(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Ph(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Th = Nh(Th, e, t, n, r, i), !0;
			case "dragenter": return Eh = Nh(Eh, e, t, n, r, i), !0;
			case "mouseover": return Dh = Nh(Dh, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return Oh.set(a, Nh(Oh.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, kh.set(a, Nh(kh.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Fh(e) {
		var t = Ht(e.target);
		if (t !== null) {
			var n = o(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = s(n), t !== null) {
						e.blockedOn = t, jt(e.priority, function() {
							hh(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = c(n), t !== null) {
						e.blockedOn = t, jt(e.priority, function() {
							hh(n);
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
			var n = bh(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				kn = r, n.target.dispatchEvent(r), kn = null;
			} else return t = Ut(n), t !== null && mh(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Lh(e, t, n) {
		Ih(e) && n.delete(t);
	}
	function Rh() {
		wh = !1, Th !== null && Ih(Th) && (Th = null), Eh !== null && Ih(Eh) && (Eh = null), Dh !== null && Ih(Dh) && (Dh = null), Oh.forEach(Lh), kh.forEach(Lh);
	}
	function zh(e, n) {
		e.blockedOn === n && (e.blockedOn = null, wh || (wh = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, Rh)));
	}
	var Bh = null;
	function Vh(e) {
		Bh !== e && (Bh = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			Bh === e && (Bh = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (Sh(r || n) === null) continue;
					break;
				}
				var a = Ut(n);
				a !== null && (e.splice(t, 3), t -= 3, ec(a, {
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
		Th !== null && zh(Th, e), Eh !== null && zh(Eh, e), Dh !== null && zh(Dh, e), Oh.forEach(t), kh.forEach(t);
		for (var n = 0; n < Ah.length; n++) {
			var r = Ah[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < Ah.length && (n = Ah[0], n.blockedOn === null);) Fh(n), n.blockedOn === null && Ah.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[Pt] || null;
			if (typeof a == "function") o || Vh(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[Pt] || null) s = o.formAction;
					else if (Sh(i) !== null) continue;
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
		dh(n, jd(), e, t, null, null);
	}, Gh.prototype.unmount = Wh.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			dh(e.current, 2, null, e, null, null), zd(), t[Ft] = null;
		}
	};
	function Gh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = At();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < Ah.length && t !== 0 && t < Ah[n].priority; n++);
			Ah.splice(n, 0, e), n === 0 && Fh(e);
		}
	};
	var Kh = n.version;
	if (Kh !== "19.3.1") throw Error(i(527, Kh, "19.3.1"));
	D.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
		return e = u(t), e = e === null ? null : f(e), e = e === null ? null : e.stateNode, e;
	};
	var qh = {
		bundleType: 0,
		version: "19.3.1",
		rendererPackageName: "react-dom",
		currentDispatcherRef: E,
		reconcilerVersion: "19.3.1"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Jh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Jh.isDisabled && Jh.supportsFiber) try {
			ot = Jh.inject(qh), st = Jh;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!a(e)) throw Error(i(299));
		var n = !1, r = "", o = Cc, s = wc, c = Tc;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (c = t.onRecoverableError)), t = lh(e, 1, !1, null, null, n, r, null, o, s, c, Uh), e[Ft] = t.current, Wf(e), new Wh(t);
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
var ee = /*#__PURE__*/ b("DEFINITION_LOOKUP_TABLE", {}), x = "data-make-styles-bucket", te = "data-priority", S = "data-container", C = {
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
}, ne = "DO_NOT_USE_DIRECTLY: @griffel/reset-value";
//#endregion
//#region node_modules/@emotion/hash/dist/emotion-hash.esm.js
function w(e) {
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
function re(e) {
	let t = e.length;
	if (t === 7) return e;
	for (let n = t; n < 7; n++) e += "0";
	return e;
}
function ie(e, t, n = []) {
	return "___" + re(w(e + t));
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/reduceToClassNameForSlots.js
function ae(e, t) {
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
function oe(e, t) {
	let n = {};
	for (let r in e) {
		let [i, a] = ae(e[r], t);
		if (a === "") {
			n[r] = "";
			continue;
		}
		let o = ie(a, t), s = o + (i === "" ? "" : " " + i);
		ee[o] = [e[r], t], n[r] = s;
	}
	return n;
}
//#endregion
//#region node_modules/@griffel/core/src/mergeClasses.js
var se = {};
function T() {
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
	let i = se[n];
	if (i !== void 0) return t + i;
	let a = [];
	for (let t = 0; t < arguments.length; t++) {
		let n = r[t];
		if (n) {
			let t = ee[n];
			t && (a.push(t[0]), e = t[1]);
		}
	}
	let o = Object.assign.apply(Object, [{}].concat(a)), [s, c] = ae(o, e), l = ie(c, e, r), u = l + " " + s;
	return se[n] = u, ee[l] = [o, e], t + u;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/normalizeCSSBucketEntry.js
function ce(e) {
	return Array.isArray(e) ? e : [e];
}
//#endregion
//#region node_modules/@griffel/core/src/renderer/createIsomorphicStyleSheet.js
function le(e, t, n, r) {
	let i = [];
	if (r[x] = t, r[te] = String(n), e) for (let t in r) e.setAttribute(t, r[t]);
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
var ue = /*#__PURE__*/ [
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
function de(e, t, n) {
	return e === "m" || e === "x" ? e + t + n : e + n;
}
function fe(e, t, n, r, i = {}) {
	let a = e === "m", o = e === "x", s = i.m, c = i.x, l = i.p ?? 0, u = de(e, c ?? s ?? "0", l);
	if (!r.stylesheets[u]) {
		let d = t && t.createElement("style"), f = le(d, e, l, {
			...r.styleElementAttributes,
			...a && { media: s },
			...o && { "data-container": c }
		});
		r.stylesheets[u] = f, t?.head && d && t.head.insertBefore(d, me(t, n, e, r, i));
	}
	return r.stylesheets[u];
}
function pe(e, t, n) {
	return e.getAttribute("data-make-styles-bucket") === t ? t === "m" ? n.m === e.media : t !== "x" || n.x === e.getAttribute(S) : !1;
}
function me(e, t, n, r, i = {}) {
	let a = ue[n], o = i.m ?? "", s = i.x ?? "", c = i.p ?? 0, l = (e) => a - ue[e.getAttribute(x)], u = e.head.querySelectorAll(`[${x}]`);
	if (n === "m" || n === "x") {
		let t = e.head.querySelectorAll(`[${x}="${n}"]`);
		t.length && (u = t, l = n === "m" ? (e) => r.compareMediaQueries(o, e.media) : (e) => r.compareContainerQueries(s, e.getAttribute("data-container") ?? ""));
	}
	let d = (e) => pe(e, n, i) ? c - Number(e.getAttribute(te)) : l(e), f = u.length, p = f - 1;
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
function he(e, t) {
	try {
		e.insertRule(t);
	} catch {}
}
//#endregion
//#region node_modules/@griffel/core/src/renderer/createDOMRenderer.js
var ge = 0, _e = (e, t) => e < t ? -1 : +(e > t);
function ve(e = typeof document > "u" ? void 0 : document, t = {}) {
	let { classNameHashSalt: n, unstable_filterCSSRule: r, insertionPoint: i, styleElementAttributes: a, compareMediaQueries: o = _e, compareContainerQueries: s = o } = t, c = {
		classNameHashSalt: n,
		insertionCache: {},
		stylesheets: {},
		styleElementAttributes: Object.freeze(a),
		compareMediaQueries: o,
		compareContainerQueries: s,
		id: `d${ge++}`,
		insertCSSRules(t) {
			for (let n in t) {
				let a = t[n];
				for (let t = 0, o = a.length; t < o; t++) {
					let [o, s] = ce(a[t]), l = fe(n, e, i || null, c, s);
					c.insertionCache[o] || (c.insertionCache[o] = n, r ? r(o) && he(l, o) : he(l, o));
				}
			}
		}
	};
	return c;
}
//#endregion
//#region node_modules/stylis/src/Enum.js
var ye = "-moz-", be = "-webkit-", xe = "comm", Se = "rule", Ce = "decl", we = "@media", E = "@import", D = "@supports", Te = "@namespace", Ee = "@keyframes", De = "@layer", Oe = Math.abs, ke = String.fromCharCode, Ae = Object.assign;
function je(e, t) {
	return Ie(e, 0) ^ 45 ? (((t << 2 ^ Ie(e, 0)) << 2 ^ Ie(e, 1)) << 2 ^ Ie(e, 2)) << 2 ^ Ie(e, 3) : 0;
}
function Me(e) {
	return e.trim();
}
function Ne(e, t) {
	return (e = t.exec(e)) ? e[0] : e;
}
function Pe(e, t, n) {
	return e.replace(t, n);
}
function Fe(e, t) {
	return e.indexOf(t);
}
function Ie(e, t) {
	return e.charCodeAt(t) | 0;
}
function Le(e, t, n) {
	return e.slice(t, n);
}
function Re(e) {
	return e.length;
}
function ze(e) {
	return e.length;
}
function Be(e, t) {
	return t.push(e), e;
}
function Ve(e, t) {
	return e.map(t).join("");
}
//#endregion
//#region node_modules/stylis/src/Tokenizer.js
var He = 1, Ue = 1, We = 0, Ge = 0, Ke = 0, qe = "";
function Je(e, t, n, r, i, a, o, s) {
	return {
		value: e,
		root: t,
		parent: n,
		type: r,
		props: i,
		children: a,
		line: He,
		column: Ue,
		length: o,
		return: "",
		siblings: s
	};
}
function Ye(e, t) {
	return Ae(Je("", null, null, "", null, null, 0, e.siblings), e, { length: -e.length }, t);
}
function Xe() {
	return Ke;
}
function Ze() {
	return Ke = Ge > 0 ? Ie(qe, --Ge) : 0, Ue--, Ke === 10 && (Ue = 1, He--), Ke;
}
function Qe() {
	return Ke = Ge < We ? Ie(qe, Ge++) : 0, Ue++, Ke === 10 && (Ue = 1, He++), Ke;
}
function $e() {
	return Ie(qe, Ge);
}
function et() {
	return Ge;
}
function tt(e, t) {
	return Le(qe, e, t);
}
function nt(e) {
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
function rt(e) {
	return He = Ue = 1, We = Re(qe = e), Ge = 0, [];
}
function it(e) {
	return qe = "", e;
}
function at(e) {
	return Me(tt(Ge - 1, ut(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function ot(e) {
	return it(ct(rt(e)));
}
function st(e) {
	for (; (Ke = $e()) && Ke < 33;) Qe();
	return nt(e) > 2 || nt(Ke) > 3 ? "" : " ";
}
function ct(e) {
	for (; Qe();) switch (nt(Ke)) {
		case 0:
			Be(ft(Ge - 1), e);
			break;
		case 2:
			Be(at(Ke), e);
			break;
		default: Be(ke(Ke), e);
	}
	return e;
}
function lt(e, t) {
	for (; --t && Qe() && !(Ke < 48 || Ke > 102 || Ke > 57 && Ke < 65 || Ke > 70 && Ke < 97););
	return tt(e, et() + (t < 6 && $e() == 32 && Qe() == 32));
}
function ut(e) {
	for (; Qe();) switch (Ke) {
		case e: return Ge;
		case 34:
		case 39:
			e !== 34 && e !== 39 && ut(Ke);
			break;
		case 40:
			e === 41 && ut(e);
			break;
		case 92: Qe();
	}
	return Ge;
}
function dt(e, t) {
	for (; Qe() && e + Ke !== 57 && (e + Ke !== 84 || $e() !== 47););
	return "/*" + tt(t, Ge - 1) + "*" + ke(e === 47 ? e : Qe());
}
function ft(e) {
	for (; !nt($e());) Qe();
	return tt(e, Ge);
}
//#endregion
//#region node_modules/stylis/src/Parser.js
function pt(e) {
	return it(mt("", null, null, null, [""], e = rt(e), 0, [0], e));
}
function mt(e, t, n, r, i, a, o, s, c) {
	for (var l = 0, u = 0, d = o, f = 0, p = 0, m = 0, h = 1, g = 1, _ = 1, v = 0, y = 0, b = "", ee = i, x = a, te = r, S = b; g;) switch (m = y, y = Qe()) {
		case 40:
			m != 108 && Ie(S, d - 1) == 58 ? (v++, S += "(") : S += at(y);
			break;
		case 41:
			v--, S += ")";
			break;
		case 34:
		case 39:
		case 91:
			S += at(y);
			break;
		case 9:
		case 10:
		case 13:
		case 32:
			if (v > 0) {
				S += ke(y);
				break;
			}
			S += st(m);
			break;
		case 92:
			S += lt(et() - 1, 7);
			continue;
		case 47:
			switch ($e()) {
				case 42:
				case 47:
					Be(gt(dt(Qe(), et()), t, n, c), c), (nt(m || 1) == 5 || nt($e() || 1) == 5) && Re(S) && Le(S, -1, void 0) !== " " && (S += " ");
					break;
				default: S += "/";
			}
			break;
		case 123 * h: s[l++] = Re(S) * _;
		case 125 * h:
		case 59:
		case 0:
			if (v > 0 && y) {
				S += ke(y);
				break;
			}
			switch (y) {
				case 0:
				case 125: g = 0;
				case 59 + u:
					_ == -1 && (S = Pe(S, /\f/g, "")), p > 0 && (Re(S) - d || h === 0) && Be(p > 32 ? _t(S + ";", r, n, d - 1, c) : _t(Pe(S, " ", "") + ";", r, n, d - 2, c), c);
					break;
				case 59: S += ";";
				default: if (Be(te = ht(S, t, n, l, u, i, s, b, ee = [], x = [], d, a), a), y === 123) {
					if (u === 0) mt(S, t, te, te, ee, a, d, s, x);
					else {
						switch (f) {
							case 99: if (Ie(S, 3) === 110) break;
							case 108: if (Ie(S, 2) === 97) break;
							default: u = 0;
							case 100:
							case 109:
							case 115:
						}
						u ? mt(e, te, te, r && Be(ht(e, te, te, 0, 0, i, s, b, i, ee = [], d, x), x), i, x, d, s, r ? ee : x) : mt(S, te, te, te, [""], x, 0, s, x);
					}
				}
			}
			l = u = p = 0, h = _ = 1, b = S = "", d = o;
			break;
		case 58: d = 1 + Re(S), p = m;
		default:
			if (h < 1) {
				if (y == 123) --h;
				else if (y == 125 && h++ == 0 && Ze() == 125) continue;
			}
			switch (S += ke(y), y * h) {
				case 38:
					_ = u > 0 ? 1 : (S += "\f", -1);
					break;
				case 44:
					if (v > 0) break;
					s[l++] = (Re(S) - 1) * _, _ = 1;
					break;
				case 64:
					$e() === 45 && (S += at(Qe())), f = $e(), u = d = Re(b = S += ft(et())), y++;
					break;
				case 45: m === 45 && Re(S) == 2 && (h = 0);
			}
	}
	return a;
}
function ht(e, t, n, r, i, a, o, s, c, l, u, d) {
	for (var f = i - 1, p = i === 0 ? a : [""], m = ze(p), h = 0, g = 0, _ = 0; h < r; ++h) for (var v = 0, y = Le(e, f + 1, f = Oe(g = o[h])), b = e; v < m; ++v) (b = Me(g > 0 ? p[v] + " " + y : Pe(y, /&\f/g, p[v]))) && (c[_++] = b);
	return Je(e, t, n, i === 0 ? Se : s, c, l, u, d);
}
function gt(e, t, n, r) {
	return Je(e, t, n, xe, ke(Xe()), Le(e, 2, -2), 0, r);
}
function _t(e, t, n, r, i) {
	return Je(e, t, n, Ce, Le(e, 0, r), Le(e, r + 1, -1), r, i);
}
//#endregion
//#region node_modules/stylis/src/Serializer.js
function vt(e, t) {
	for (var n = "", r = 0; r < e.length; r++) n += t(e[r], r, e, t) || "";
	return n;
}
function yt(e, t, n, r) {
	switch (e.type) {
		case De: if (e.children.length) break;
		case E:
		case Te:
		case Ce: return e.return = e.return || e.value;
		case xe: return "";
		case Ee: return e.return = e.value + "{" + vt(e.children, r) + "}";
		case Se: if (!Re(e.value = e.props.join(","))) return "";
	}
	return Re(n = vt(e.children, r)) ? e.return = e.value + "{" + n + "}" : "";
}
//#endregion
//#region node_modules/stylis/src/Middleware.js
function bt(e) {
	var t = ze(e);
	return function(n, r, i, a) {
		for (var o = "", s = 0; s < t; s++) o += e[s](n, r, i, a) || "";
		return o;
	};
}
function xt(e) {
	return function(t) {
		t.root || (t = t.return) && e(t);
	};
}
//#endregion
//#region node_modules/@griffel/core/src/insertionFactory.js
var St = () => {
	let e = {};
	return function(t, n) {
		e[t.id] === void 0 && (t.insertCSSRules(n), e[t.id] = !0);
	};
};
//#endregion
//#region node_modules/rtl-css-js/dist/esm/convert-9768a965.js
function Ct(e) {
	return e.reduce(function(e, t) {
		var n = t[0], r = t[1];
		return e[n] = r, e[r] = n, e;
	}, {});
}
function wt(e) {
	return typeof e == "boolean";
}
function Tt(e) {
	return typeof e == "function";
}
function Et(e) {
	return typeof e == "number";
}
function Dt(e) {
	return e == null;
}
function Ot(e) {
	return e && typeof e == "object";
}
function kt(e) {
	return typeof e == "string";
}
function At(e, t) {
	return e.indexOf(t) !== -1;
}
function jt(e) {
	return parseFloat(e) === 0 ? e : e[0] === "-" ? e.slice(1) : "-" + e;
}
function Mt(e, t, n, r) {
	return t + jt(n) + r;
}
function Nt(e) {
	var t = e.indexOf(".");
	if (t === -1) e = 100 - parseFloat(e) + "%";
	else {
		var n = e.length - t - 2;
		e = 100 - parseFloat(e), e = e.toFixed(n) + "%";
	}
	return e;
}
function Pt(e) {
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
function Ft(e) {
	var t = Pt(e);
	if (t.length <= 3 || t.length > 4) return e;
	var n = t[0], r = t[1], i = t[2];
	return [
		n,
		t[3],
		i,
		r
	].join(" ");
}
function It(e) {
	return !wt(e) && !Dt(e);
}
function Lt(e) {
	for (var t = [], n = 0, r = 0, i = !1; r < e.length;) !i && e[r] === "," ? (t.push(e.substring(n, r).trim()), r++, n = r) : e[r] === "(" ? (i = !0, r++) : (e[r] === ")" && (i = !1), r++);
	return n != r && t.push(e.substring(n, r + 1)), t;
}
var O = {
	padding: function(e) {
		var t = e.value;
		return Et(t) ? t : Ft(t);
	},
	textShadow: function(e) {
		var t = e.value;
		return Lt(t).map(function(e) {
			return e.replace(/(^|\s)(-*)([.|\d]+)/, function(e, t, n, r) {
				if (r === "0") return e;
				var i = n === "" ? "-" : "";
				return "" + t + i + r;
			});
		}).join(",");
	},
	borderColor: function(e) {
		var t = e.value;
		return Ft(t);
	},
	borderRadius: function(e) {
		var t = e.value;
		if (Et(t)) return t;
		if (At(t, "/")) {
			var n = t.split("/"), r = n[0], i = n[1], a = O.borderRadius({ value: r.trim() }), o = O.borderRadius({ value: i.trim() });
			return a + " / " + o;
		}
		var s = Pt(t);
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
		if (Et(t)) return t;
		var o = t.replace(/(url\(.*?\))|(rgba?\(.*?\))|(hsl\(.*?\))|(#[a-fA-F0-9]+)|((^| )(\D)+( |$))/g, "").trim();
		return t = t.replace(o, O.backgroundPosition({
			value: o,
			valuesToConvert: n,
			isRtl: r,
			bgPosDirectionRegex: a
		})), O.backgroundImage({
			value: t,
			valuesToConvert: n,
			bgImgDirectionRegex: i
		});
	},
	backgroundImage: function(e) {
		var t = e.value, n = e.valuesToConvert, r = e.bgImgDirectionRegex;
		return !At(t, "url(") && !At(t, "linear-gradient(") ? t : t.replace(r, function(e, t, r) {
			return e.replace(r, n[r]);
		});
	},
	backgroundPosition: function(e) {
		var t = e.value, n = e.valuesToConvert, r = e.isRtl, i = e.bgPosDirectionRegex;
		return t.replace(r ? /^((-|\d|\.)+%)/ : null, function(e, t) {
			return Nt(t);
		}).replace(i, function(e) {
			return n[e];
		});
	},
	backgroundPositionX: function(e) {
		var t = e.value, n = e.valuesToConvert, r = e.isRtl, i = e.bgPosDirectionRegex;
		return Et(t) ? t : O.backgroundPosition({
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
		return t.replace(a, Mt).replace(o, Mt).replace(s, Mt).replace(c, Mt);
	}
};
O.objectPosition = O.backgroundPosition, O.margin = O.padding, O.borderWidth = O.padding, O.boxShadow = O.textShadow, O.webkitBoxShadow = O.boxShadow, O.mozBoxShadow = O.boxShadow, O.WebkitBoxShadow = O.boxShadow, O.MozBoxShadow = O.boxShadow, O.borderStyle = O.borderColor, O.webkitTransform = O.transform, O.mozTransform = O.transform, O.WebkitTransform = O.transform, O.MozTransform = O.transform, O.transformOrigin = O.backgroundPosition, O.webkitTransformOrigin = O.transformOrigin, O.mozTransformOrigin = O.transformOrigin, O.WebkitTransformOrigin = O.transformOrigin, O.MozTransformOrigin = O.transformOrigin, O.webkitTransition = O.transition, O.mozTransition = O.transition, O.WebkitTransition = O.transition, O.MozTransition = O.transition, O.webkitTransitionProperty = O.transitionProperty, O.mozTransitionProperty = O.transitionProperty, O.WebkitTransitionProperty = O.transitionProperty, O.MozTransitionProperty = O.transitionProperty, O["text-shadow"] = O.textShadow, O["border-color"] = O.borderColor, O["border-radius"] = O.borderRadius, O["background-image"] = O.backgroundImage, O["background-position"] = O.backgroundPosition, O["background-position-x"] = O.backgroundPositionX, O["object-position"] = O.objectPosition, O["border-width"] = O.padding, O["box-shadow"] = O.textShadow, O["-webkit-box-shadow"] = O.textShadow, O["-moz-box-shadow"] = O.textShadow, O["border-style"] = O.borderColor, O["-webkit-transform"] = O.transform, O["-moz-transform"] = O.transform, O["transform-origin"] = O.transformOrigin, O["-webkit-transform-origin"] = O.transformOrigin, O["-moz-transform-origin"] = O.transformOrigin, O["-webkit-transition"] = O.transition, O["-moz-transition"] = O.transition, O["transition-property"] = O.transitionProperty, O["-webkit-transition-property"] = O.transitionProperty, O["-moz-transition-property"] = O.transitionProperty;
var Rt = Ct([
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
]), zt = ["content"], Bt = Ct([
	["ltr", "rtl"],
	["left", "right"],
	["w-resize", "e-resize"],
	["sw-resize", "se-resize"],
	["nw-resize", "ne-resize"]
]), Vt = /* @__PURE__ */ RegExp("(^|\\W|_)((ltr)|(rtl)|(left)|(right))(\\W|_|$)", "g"), Ht = /* @__PURE__ */ RegExp("(left)|(right)");
function Ut(e) {
	return Object.keys(e).reduce(function(t, n) {
		var r = e[n];
		if (kt(r) && (r = r.trim()), At(zt, n)) return t[n] = r, t;
		var i = Wt(n, r), a = i.key;
		return t[a] = i.value, t;
	}, Array.isArray(e) ? [] : {});
}
function Wt(e, t) {
	var n = /\/\*\s?@noflip\s?\*\//.test(t), r = n ? e : Gt(e);
	return {
		key: r,
		value: n ? t : Kt(r, t)
	};
}
function Gt(e) {
	return Rt[e] || e;
}
function Kt(e, t) {
	if (!It(t)) return t;
	if (Ot(t)) return Ut(t);
	var n = Et(t), r = Tt(t), i = n || r ? t : t.replace(/ !important.*?$/, ""), a = !n && i.length !== t.length, o = O[e], s = o ? o({
		value: i,
		valuesToConvert: Bt,
		propertiesToConvert: Rt,
		isRtl: !0,
		bgImgDirectionRegex: Vt,
		bgPosDirectionRegex: Ht
	}) : Bt[i] || i;
	return a ? s + " !important" : s;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/stylis/globalPlugin.js
var qt = (e) => {
	switch (e.type) {
		case Se:
			if (typeof e.props == "string") return;
			e.props = e.props.map((e) => e.indexOf(":global(") === -1 ? e : ot(e).reduce((e, t, n, r) => {
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
function Jt(e, t, n) {
	switch (je(e, t)) {
		case 5103: return be + "print-" + e + e;
		case 3191:
		case 6645:
		case 3005:
		case 6391:
		case 5879:
		case 5623:
		case 6135:
		case 4599:
		case 4855: return be + e + e;
		case 4215:
			if (Ie(e, 9) === 102 || Ie(e, t + 1) === 116) return be + e + e;
			break;
		case 4789: return ye + e + e;
		case 5349:
		case 4246:
		case 6968: return be + e + ye + e + e;
		case 6187: if (!Ne(e, /grab/)) return Pe(Pe(Pe(e, /(zoom-|grab)/, be + "$1"), /(image-set)/, be + "$1"), e, "") + e;
		case 5495:
		case 3959: return Pe(e, /(image-set\([^]*)/, be + "$1$`$1");
		case 4095:
		case 3583:
		case 4068:
		case 2532: return Pe(e, /(.+)-inline(.+)/, be + "$1$2") + e;
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
		case 4765: if (Re(e) - 1 - t > 6) switch (Ie(e, t + 1)) {
			case 102: if (Ie(e, t + 3) === 108) return Pe(e, /(.+:)(.+)-([^]+)/, "$1" + be + "$2-$3$1" + ye + (Ie(e, t + 3) == 108 ? "$3" : "$2-$3")) + e;
			case 115: return ~Fe(e, "stretch") ? Jt(Pe(e, "stretch", "fill-available"), t, n) + e : e;
		}
	}
	return e;
}
function Yt(e, t, n, r) {
	if (e.length > -1 && !e.return) switch (e.type) {
		case Ce:
			e.return = Jt(e.value, e.length, n);
			return;
		case Se: if (e.length) return Ve(e.props, function(t) {
			switch (Ne(t, /(::plac\w+|:read-\w+)/)) {
				case ":read-only":
				case ":read-write": return vt([Ye(e, { props: [Pe(t, /:(read-\w+)/, ":" + ye + "$1")] })], r);
				case "::placeholder": return vt([Ye(e, { props: [Pe(t, /:(plac\w+)/, ":" + be + "input-$1")] }), Ye(e, { props: [Pe(t, /:(plac\w+)/, ":" + ye + "$1")] })], r);
			}
			return "";
		});
	}
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/stylis/isAtRuleElement.js
function Xt(e) {
	switch (e.type) {
		case "@container":
		case we:
		case D:
		case De: return !0;
	}
	return !1;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/stylis/sortClassesInAtRulesPlugin.js
var Zt = (e) => {
	Xt(e) && Array.isArray(e.children) && e.children.sort((e, t) => e.props[0] > t.props[0] ? 1 : -1);
};
//#endregion
//#region node_modules/@griffel/core/src/runtime/compileCSSRules.js
function Qt() {}
function $t(e, t) {
	let n = [];
	return vt(pt(e), bt([
		qt,
		t ? Zt : Qt,
		Yt,
		yt,
		xt((e) => n.push(e))
	])), n;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hyphenateProperty.js
var en = /[A-Z]/g, tn = /^ms-/, k = {};
function nn(e) {
	return "-" + e.toLowerCase();
}
function rn(e) {
	if (Object.prototype.hasOwnProperty.call(k, e)) return k[e];
	if (e.substr(0, 2) === "--") return e;
	let t = e.replace(en, nn);
	return k[e] = tn.test(t) ? "-" + t : t;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/normalizeNestedProperty.js
function an(e) {
	return e.charAt(0) === "&" ? e.slice(1) : e;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/compileAtomicCSSRule.js
var on = /,( *[^ &])/g;
function sn(e) {
	return "&" + an(e.replace(on, ",&$1"));
}
function cn(e, t) {
	return t.reduceRight((e, t) => `${sn(t)} { ${e} }`, e);
}
function ln(e, t) {
	let { className: n, selectors: r, property: i, rtlClassName: a, rtlProperty: o, rtlValue: s, value: c } = e, { container: l, layer: u, media: d, scope: f, supports: p } = t, m = `.${n}`, h = cn(Array.isArray(c) ? `${c.map((e) => `${rn(i)}: ${e}`).join(";")};` : `${rn(i)}: ${c};`, r), g = f ? `@scope (${m}) ${f} { :scope{${h}} }` : `${m}{${h}}`;
	if (o && a) {
		let e = `.${a}`, t = cn(Array.isArray(s) ? `${s.map((e) => `${rn(o)}: ${e}`).join(";")};` : `${rn(o)}: ${s};`, r);
		g += f ? `@scope (${e}) ${f} { :scope{${t}} }` : `${e}{${t}}`;
	}
	return d && (g = `@media ${d} { ${g} }`), u && (g = `@layer ${u} { ${g} }`), p && (g = `@supports ${p} { ${g} }`), l && (g = `@container ${l} { ${g} }`), $t(g, !0);
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/cssifyObject.js
function un(e) {
	let t = "";
	for (let n in e) {
		let r = e[n];
		if (typeof r == "string" || typeof r == "number") t += rn(n) + ":" + r + ";";
		else if (Array.isArray(r)) for (let e of r) t += rn(n) + ":" + e + ";";
	}
	return t;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/compileKeyframeCSS.js
function dn(e) {
	let t = "";
	for (let n in e) t += `${n}{${un(e[n])}}`;
	return t;
}
function fn(e, t) {
	let n = `@keyframes ${e} {${t}}`, r = [];
	return vt(pt(n), bt([
		yt,
		Yt,
		xt((e) => r.push(e))
	])), r;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/getStyleBucketName.js
var pn = {
	"us-w": "w",
	"us-v": "i",
	nk: "l",
	si: "v",
	cu: "f",
	ve: "h",
	ti: "a"
};
function mn(e, t) {
	if (t.media) return "m";
	if (t.layer || t.supports) return "t";
	if (t.container) return "x";
	if (e.length > 0) {
		let t = e[0].trim();
		if (t.charCodeAt(0) === 58) return pn[t.slice(4, 8)] || pn[t.slice(3, 5)] || "d";
	}
	return "d";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/shorthands.js
var hn = {
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
function gn(e, t) {
	return e.length === 0 ? t : `${e} and ${t}`;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hashPropertyKey.js
function _n(e, t) {
	return e && t + e;
}
function vn(e) {
	return _n(e.container, "c") + _n(e.media, "m") + _n(e.layer, "l") + _n(e.supports, "s") + _n(e.scope, "o");
}
function yn(e, t, n) {
	let r = w(e + vn(n) + t), i = r.charCodeAt(0);
	return i >= 48 && i <= 57 ? String.fromCharCode(i + 17) + r.slice(1) : r;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/hashClassName.js
function bn({ property: e, selector: t, salt: n, value: r }, i) {
	return "f" + w(n + t + vn(i) + e + r.trim());
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isContainerQuerySelector.js
function xn(e) {
	return e.substring(0, 10) === "@container";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isLayerSelector.js
function Sn(e) {
	return e.substr(0, 6) === "@layer";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isMediaQuerySelector.js
function Cn(e) {
	return e.substr(0, 6) === "@media";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isNestedSelector.js
var wn = /^(:|\[|>|&)/;
function Tn(e) {
	return wn.test(e);
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isObject.js
function En(e) {
	return typeof e == "object" && !!e && Array.isArray(e) === !1;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isResetValue.js
function Dn(e) {
	return e === ne;
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isScopeSelector.js
function On(e) {
	return e.substring(0, 6) === "@scope";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/isSupportQuerySelector.js
function kn(e) {
	return e.substr(0, 9) === "@supports";
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/utils/trimSelector.js
function An(e) {
	return e.replace(/>\s+/g, ">");
}
//#endregion
//#region node_modules/@griffel/core/src/runtime/resolveStyleRules.js
function jn(e) {
	return hn[e];
}
function Mn(e) {
	return e?.[0] ?? 0;
}
function Nn(e, t, n, r) {
	e[t] = r ? [n, r] : n;
}
function Pn(e, t) {
	return t.length > 0 ? [e, Object.fromEntries(t)] : e;
}
function Fn(e, t, n, r, i, a, o) {
	let s = [];
	o !== 0 && s.push(["p", o]), t === "m" && i && s.push(["m", i]), t === "x" && a && s.push(["x", a]), e[t] ?? (e[t] = []), n && e[t].push(Pn(n, s)), r && e[t].push(Pn(r, s));
}
function In(e, t = "", n = [], r = {
	container: "",
	layer: "",
	media: "",
	supports: "",
	scope: ""
}, i = {}, a = {}, o) {
	for (let s in e) {
		if (C.hasOwnProperty(s)) {
			e[s];
			continue;
		}
		let c = e[s];
		if (c != null) {
			if (Dn(c)) Nn(i, yn(An(n.join("")), s, r), 0, void 0);
			else if (typeof c == "string" || typeof c == "number") {
				let e = An(n.join("")), l = jn(s);
				if (l) {
					let e = l[1];
					In(Object.fromEntries(e.map((e) => [e, ne])), t, n, r, i, a);
				}
				let u = yn(e, s, r), d = bn({
					value: c.toString(),
					salt: t,
					selector: e,
					property: s
				}, r), f = o && {
					key: s,
					value: o
				} || Wt(s, c), p = f.key !== s || f.value !== c, m = p ? bn({
					value: f.value.toString(),
					property: f.key,
					salt: t,
					selector: e
				}, r) : void 0, h = p ? {
					rtlClassName: m,
					rtlProperty: f.key,
					rtlValue: f.value
				} : void 0, g = mn(n, r), [_, v] = ln({
					className: d,
					selectors: n,
					property: s,
					value: c,
					...h
				}, r);
				Nn(i, u, d, m), Fn(a, g, _, v, r.media, r.container, Mn(l));
			} else if (s === "animationName") {
				let e = Array.isArray(c) ? c : [c], o = [], s = [];
				for (let t of e) {
					let e = dn(t), n = dn(Ut(t)), i = "f" + w(e), c, l = fn(i, e), u = [];
					e === n ? c = i : (c = "f" + w(n), u = fn(c, n));
					for (let e = 0; e < l.length; e++) Fn(a, "k", l[e], u[e], r.media, r.container, 0);
					o.push(i), s.push(c);
				}
				In({ animationName: o.join(", ") }, t, n, r, i, a, s.join(", "));
			} else if (Array.isArray(c)) {
				if (c.length === 0) continue;
				let e = An(n.join("")), o = jn(s);
				if (o) {
					let e = o[1];
					In(Object.fromEntries(e.map((e) => [e, ne])), t, n, r, i, a);
				}
				let l = yn(e, s, r), u = bn({
					value: c.map((e) => (e ?? "").toString()).join(";"),
					salt: t,
					selector: e,
					property: s
				}, r), d = c.map((e) => Wt(s, e));
				if (d.some((e) => e.key !== d[0].key)) continue;
				let f = d[0].key !== s || d.some((e, t) => e.value !== c[t]), p = f ? bn({
					value: d.map((e) => (e?.value ?? "").toString()).join(";"),
					salt: t,
					property: d[0].key,
					selector: e
				}, r) : void 0, m = f ? {
					rtlClassName: p,
					rtlProperty: d[0].key,
					rtlValue: d.map((e) => e.value)
				} : void 0, h = mn(n, r), [g, _] = ln({
					className: u,
					selectors: n,
					property: s,
					value: c,
					...m
				}, r);
				Nn(i, l, u, p), Fn(a, h, g, _, r.media, r.container, Mn(o));
			} else if (En(c)) {
				if (Tn(s)) In(c, t, n.concat(an(s)), r, i, a);
				else if (Cn(s)) {
					let e = gn(r.media, s.slice(6).trim());
					In(c, t, n, {
						...r,
						media: e
					}, i, a);
				} else if (Sn(s)) {
					let e = (r.layer ? `${r.layer}.` : "") + s.slice(6).trim();
					In(c, t, n, {
						...r,
						layer: e
					}, i, a);
				} else if (kn(s)) {
					let e = gn(r.supports, s.slice(9).trim());
					In(c, t, n, {
						...r,
						supports: e
					}, i, a);
				} else if (xn(s)) {
					let e = s.slice(10).trim();
					In(c, t, n, {
						...r,
						container: e
					}, i, a);
				} else if (On(s)) {
					if (r.scope) continue;
					let e = s.slice(6).trim();
					if (e === "" || !e.startsWith("to ")) continue;
					In(c, t, n, {
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
function Ln(e, t = "") {
	let n = {}, r = {};
	for (let i in e) {
		let a = e[i], [o, s] = In(a, t);
		n[i] = o, Object.keys(s).forEach((e) => {
			r[e] = (r[e] || []).concat(s[e]);
		});
	}
	return [n, r];
}
//#endregion
//#region node_modules/@griffel/core/src/makeStyles.js
function Rn(e, t = St) {
	let n = t(), r = null, i = null, a = null, o = null;
	function s(t) {
		let { dir: s, renderer: c } = t;
		r === null && ([r, i] = Ln(e, c.classNameHashSalt));
		let l = s === "ltr";
		return l ? a === null && (a = oe(r, s)) : o === null && (o = oe(r, s)), n(c, i), l ? a : o;
	}
	return s;
}
//#endregion
//#region node_modules/@griffel/core/src/__styles.js
function zn(e, t, n = St) {
	let r = n(), i = null, a = null;
	function o(n) {
		let { dir: o, renderer: s } = n, c = o === "ltr";
		return c ? i === null && (i = oe(e, o)) : a === null && (a = oe(e, o)), r(s, t), c ? i : a;
	}
	return o;
}
//#endregion
//#region node_modules/@griffel/core/src/__resetStyles.js
function Bn(e, t, n, r = St) {
	let i = r();
	function a(r) {
		let { dir: a, renderer: o } = r, s = a === "ltr" ? e : t || e;
		return i(o, Array.isArray(n) ? { r: n } : n), s;
	}
	return a;
}
//#endregion
//#region node_modules/@griffel/react/src/utils/canUseDOM.js
function Vn() {
	return typeof window < "u" && !!(window.document && window.document.createElement);
}
//#endregion
//#region node_modules/@griffel/react/src/useInsertionEffect.js
var A = /* @__PURE__ */ l(d(), 1), Hn = A.useInsertionEffect ? A.useInsertionEffect : void 0, Un = () => {
	let e = {};
	return function(t, n) {
		Hn && Vn() ? Hn(() => {
			t.insertCSSRules(n);
		}, [t, n]) : e[t.id] === void 0 && (t.insertCSSRules(n), e[t.id] = !0);
	};
}, Wn = /* @__PURE__ */ s(((e) => {
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
})), j = /* @__PURE__ */ l((/* @__PURE__ */ s(((e, t) => {
	t.exports = Wn();
})))(), 1), Gn = /*#__PURE__*/ (0, A.createContext)(/*#__PURE__*/ ve());
function Kn() {
	return (0, A.useContext)(Gn);
}
//#endregion
//#region node_modules/@griffel/react/src/TextDirectionContext.js
var qn = /*#__PURE__*/ (0, A.createContext)("ltr"), Jn = ({ children: e, dir: t }) => (0, j.jsx)(qn.Provider, {
	value: t,
	children: e
});
function Yn() {
	return (0, A.useContext)(qn);
}
//#endregion
//#region node_modules/@griffel/react/src/makeStyles.js
function Xn(e) {
	let t = Rn(e, Un);
	return function() {
		let e = Yn(), n = Kn();
		return t({
			dir: e,
			renderer: n
		});
	};
}
//#endregion
//#region node_modules/@griffel/react/src/__styles.js
function Zn(e, t) {
	let n = zn(e, t, Un);
	return function() {
		let e = Yn(), t = Kn();
		return n({
			dir: e,
			renderer: t
		});
	};
}
//#endregion
//#region node_modules/@griffel/react/src/__resetStyles.js
function Qn(e, t, n) {
	let r = Bn(e, t, n, Un);
	return function() {
		let e = Yn(), t = Kn();
		return r({
			dir: e,
			renderer: t
		});
	};
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/createCSSRuleFromTheme.js
var $n = {
	"<": "\\3C ",
	">": "\\3E "
};
function er(e) {
	return e.replace(/[<>]/g, (e) => $n[e]);
}
function tr(e, t) {
	let n = er(e);
	return t ? `${n} { ${er(Object.keys(t).reduce((e, n) => `${e}--${n}: ${t[n]}; `, ""))} }` : `${n} {}`;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/constants.js
var nr = Symbol.for("fui.slotRenderFunction"), rr = Symbol.for("fui.slotElementType"), ir = Symbol.for("fui.slotClassNameProp");
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/slot.js
function ar(e, t) {
	let { defaultProps: n, elementType: r } = t, i = sr(e), a = {
		...n,
		...i,
		[rr]: r,
		[ir]: i?.className || n?.className
	};
	return i && typeof i.children == "function" && (a[nr] = i.children, a.children = n?.children), a;
}
function or(e, t) {
	if (!(e === null || e === void 0 && !t.renderByDefault)) return ar(e, t);
}
function sr(e) {
	return typeof e == "string" || typeof e == "number" || cr(e) || A.isValidElement(e) ? { children: e } : e;
}
var cr = (e) => typeof e == "object" && !!e && Symbol.iterator in e;
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/isSlot.js
function lr(e) {
	return !!e?.hasOwnProperty(rr);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/properties.js
var M = (...e) => {
	let t = {};
	for (let n of e) {
		let e = Array.isArray(n) ? n : Object.keys(n);
		for (let n of e) t[n] = 1;
	}
	return t;
}, ur = M(/* @__PURE__ */ "onAuxClick.onAnimationEnd.onAnimationStart.onCopy.onCut.onPaste.onCompositionEnd.onCompositionStart.onCompositionUpdate.onFocus.onFocusCapture.onBlur.onBlurCapture.onChange.onInput.onSubmit.onLoad.onError.onKeyDown.onKeyDownCapture.onKeyPress.onKeyUp.onAbort.onCanPlay.onCanPlayThrough.onDurationChange.onEmptied.onEncrypted.onEnded.onLoadedData.onLoadedMetadata.onLoadStart.onPause.onPlay.onPlaying.onProgress.onRateChange.onSeeked.onSeeking.onStalled.onSuspend.onTimeUpdate.onVolumeChange.onWaiting.onClick.onClickCapture.onContextMenu.onDoubleClick.onDrag.onDragEnd.onDragEnter.onDragExit.onDragLeave.onDragOver.onDragStart.onDrop.onMouseDown.onMouseDownCapture.onMouseEnter.onMouseLeave.onMouseMove.onMouseOut.onMouseOver.onMouseUp.onMouseUpCapture.onSelect.onTouchCancel.onTouchEnd.onTouchMove.onTouchStart.onScroll.onWheel.onPointerCancel.onPointerDown.onPointerEnter.onPointerLeave.onPointerMove.onPointerOut.onPointerOver.onPointerUp.onGotPointerCapture.onLostPointerCapture".split(".")), dr = M(M([
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
]), ur, M([
	"itemID",
	"itemProp",
	"itemRef",
	"itemScope",
	"itemType"
])), fr = M(dr, ["form"]), pr = M(dr, [
	"height",
	"loop",
	"muted",
	"preload",
	"src",
	"width"
]), mr = M(pr, ["poster"]), hr = M(dr, ["start"]), gr = M(dr, ["value"]), _r = M(dr, [
	"download",
	"href",
	"hrefLang",
	"media",
	"referrerPolicy",
	"rel",
	"target",
	"type"
]), vr = M(dr, ["dateTime"]), yr = M(dr, [
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
]), br = M(yr, /* @__PURE__ */ "accept.alt.autoCorrect.autoCapitalize.autoComplete.checked.dirname.form.height.inputMode.list.max.maxLength.min.minLength.multiple.pattern.placeholder.readOnly.required.src.step.size.type.value.width".split(".")), xr = M(yr, [
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
]), Sr = M(yr, [
	"form",
	"multiple",
	"required"
]), Cr = M(dr, ["selected", "value"]), wr = M(dr, ["cellPadding", "cellSpacing"]), Tr = dr, Er = M(dr, [
	"colSpan",
	"rowSpan",
	"scope"
]), Dr = M(dr, [
	"colSpan",
	"headers",
	"rowSpan",
	"scope"
]), Or = M(dr, ["span"]), kr = M(dr, ["span"]), Ar = M(dr, ["disabled", "form"]), jr = M(dr, [
	"acceptCharset",
	"action",
	"encType",
	"encType",
	"method",
	"noValidate",
	"target"
]), Mr = M(dr, [
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
]), Nr = M(dr, [
	"alt",
	"crossOrigin",
	"height",
	"loading",
	"src",
	"srcSet",
	"useMap",
	"width"
]), Pr = M(dr, [
	"open",
	"onCancel",
	"onClose"
]);
function Fr(e, t, n) {
	let r = Array.isArray(t), i = {}, a = Object.keys(e);
	for (let o of a) (!r && t[o] || r && t.indexOf(o) >= 0 || o.indexOf("data-") === 0 || o.indexOf("aria-") === 0) && (!n || n?.indexOf(o) === -1) && (i[o] = e[o]);
	return i;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/getNativeElementProps.js
var Ir = {
	label: fr,
	audio: pr,
	video: mr,
	ol: hr,
	li: gr,
	a: _r,
	button: yr,
	input: br,
	textarea: xr,
	select: Sr,
	option: Cr,
	table: wr,
	tr: Tr,
	th: Er,
	td: Dr,
	colGroup: Or,
	col: kr,
	fieldset: Ar,
	form: jr,
	iframe: Mr,
	img: Nr,
	time: vr,
	dialog: Pr
};
function Lr(e, t, n) {
	let r = e && Ir[e] || dr;
	return r.as = 1, Fr(t, r, n);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/compose/getIntrinsicElementProps.js
var Rr = (e, t, n) => Lr(t.as ?? e, t, n), zr = A.createContext(void 0), Br = zr.Provider, Vr = A.createContext(void 0).Provider, Hr = A.createContext(void 0).Provider, Ur = A.createContext(void 0), Wr = {
	targetDocument: typeof document == "object" ? document : void 0,
	dir: "ltr"
}, Gr = Ur.Provider;
function Kr() {
	return A.useContext(Ur) ?? Wr;
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/OverridesContext/OverridesContext.js
var qr = A.createContext(void 0), Jr = qr.Provider;
function Yr() {
	return A.useContext(qr) ?? {};
}
//#endregion
//#region node_modules/@fluentui/react-shared-contexts/lib/CustomStyleHooksContext/CustomStyleHooksContext.js
var Xr = A.createContext(void 0), Zr = () => {}, Qr = Xr.Provider, $r = (e) => A.useContext(Xr)?.[e] ?? Zr;
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/ssr/canUseDOM.js
function ei() {
	return typeof window < "u" && !!(window.document && window.document.createElement);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/ssr/SSRContext.js
var ti = { current: 0 }, ni = /*#__PURE__*/ A.createContext(void 0);
function ri() {
	return A.useContext(ni) ?? ti;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useIsomorphicLayoutEffect.js
var ii = ei() ? A.useLayoutEffect : A.useEffect, ai = (e) => {
	let t = A.useRef(() => {
		throw Error("Cannot call an event handler while rendering");
	});
	return ii(() => {
		t.current = e;
	}, [e]), A.useCallback((...e) => {
		let n = t.current;
		return n(...e);
	}, [t]);
};
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useFirstMount.js
function oi() {
	let e = A.useRef(!0);
	return A.useEffect(() => {
		e.current &&= !1;
	}, []), e.current;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useForceUpdate.js
function si() {
	return A.useReducer((e) => e + 1, 0)[1];
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useId.js
var ci = A.createContext(void 0);
ci.Provider;
function li() {
	return A.useContext(ci) || "";
}
function ui(e = "fui-", t) {
	let n = ri(), r = li(), i = A.useId;
	if (i) {
		let n = i(), a = A.useMemo(() => n.replace(/:/g, ""), [n]);
		return t || `${r}${e}${a}`;
	}
	return A.useMemo(() => t || `${r}${e}${++n.current}`, [
		r,
		e,
		t,
		n
	]);
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/hooks/useMergedRefs.js
function di(...e) {
	let t = A.useCallback((n) => {
		t.current = n;
		for (let t of e) typeof t == "function" ? t(n) : t && (t.current = n);
	}, [...e]);
	return t;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/getReactElementRef.js
var fi = !0;
function pi(e) {
	if (e) return fi ? e.props.ref : e.ref;
}
//#endregion
//#region node_modules/@fluentui/react-utilities/lib/utils/isHTMLElement.js
function mi(e, t) {
	let n = e;
	return !!(n != null && n.ownerDocument?.defaultView && n instanceof n.ownerDocument.defaultView[t?.constructorName ?? "HTMLElement"]);
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/createCompatSlotComponent.js
function hi(e, t) {
	return {
		...t,
		[rr]: e
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/jsx/createJSX.js
function gi(e, t) {
	return function(n, r, i, a, o) {
		return lr(r) ? t(hi(n, r), null, i, a, o) : lr(n) ? t(n, r, i, a, o) : e(n, r, i, a, o);
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/getMetadataFromSlotComponent.js
function _i(e) {
	let { as: t, [ir]: n, [rr]: r, [nr]: i, ...a } = e, o = a, s = typeof r == "string" ? t ?? r : r;
	return typeof s != "string" && t && (o.as = t), {
		elementType: s,
		props: o,
		renderFunction: i
	};
}
//#endregion
//#region node_modules/@fluentui/react-jsx-runtime/lib/utils/Runtime.js
var vi = j, yi = (e, t, n) => {
	let { elementType: r, renderFunction: i, props: a } = _i(e), o = {
		...a,
		...t
	};
	return i ? vi.jsx(A.Fragment, { children: i(r, o) }, n) : vi.jsx(r, o, n);
}, bi = (e, t, n) => {
	let { elementType: r, renderFunction: i, props: a } = _i(e), o = {
		...a,
		...t
	};
	return i ? vi.jsx(A.Fragment, { children: i(r, {
		...o,
		children: vi.jsxs(A.Fragment, { children: o.children }, void 0)
	}) }, n) : vi.jsxs(r, o, n);
}, xi = gi(vi.jsx, yi), Si = gi(vi.jsxs, bi), Ci = A.createContext(void 0), wi = {}, Ti = Ci.Provider, Ei = () => A.useContext(Ci) ?? wi, Di = (e, t) => /*#__PURE__*/ xi(Gr, {
	value: t.provider,
	children: /*#__PURE__*/ xi(Br, {
		value: t.theme,
		children: /*#__PURE__*/ xi(Vr, {
			value: t.themeClassName,
			children: /*#__PURE__*/ xi(Qr, {
				value: t.customStyleHooks_unstable,
				children: /*#__PURE__*/ xi(Hr, {
					value: t.tooltip,
					children: /*#__PURE__*/ xi(Jn, {
						dir: t.textDirection,
						children: /*#__PURE__*/ xi(Ti, {
							value: t.iconDirection,
							children: /*#__PURE__*/ xi(Jr, {
								value: t.overrides_unstable,
								children: /*#__PURE__*/ Si(e.root, { children: [ei() ? null : /*#__PURE__*/ xi("style", {
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
}), Oi = (e, t, n) => {
	e.addEventListener(t, n, !0);
}, ki = (e, t, n) => {
	e.removeEventListener(t, n, !0);
}, Ai = "keyborg:focusin", ji = "keyborg:focusout", Mi = 0, Ni = 1, Pi = 2, Fi = 3;
function Ii(e) {
	let t = e.HTMLElement, n = t.prototype.focus, r = !1;
	return t.prototype.focus = function() {
		r = !0;
	}, e.document.createElement("button").focus(), t.prototype.focus = n, r;
}
var Li = !1;
function Ri(e) {
	let t = e, n = t.document, r = t.HTMLElement.prototype;
	Li ||= Ii(t);
	let i = r.focus;
	if (i.__keyborgNativeFocus) return;
	r.focus = u;
	let a = /* @__PURE__ */ new Set(), o = (e) => {
		let t = e.target;
		if (!t) return;
		let n = new CustomEvent(ji, {
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
			(!t || !r.has(t)) && (a.delete(e), t && (ki(t, "focusin", s), ki(t, "focusout", o)));
		}
		c(t, e.relatedTarget || void 0);
	}, c = (e, t, n) => {
		let r = e.shadowRoot;
		if (r) {
			for (let e of a) if (e.deref() === r) return;
			Oi(r, "focusin", s), Oi(r, "focusout", o), a.add(new WeakRef(r));
			return;
		}
		let i = {
			relatedTarget: t,
			originalEvent: n
		}, c = new CustomEvent(Ai, {
			cancelable: !0,
			bubbles: !0,
			composed: !0,
			detail: i
		});
		c.details = i, (Li || l[Fi]) && (i.isFocusedProgrammatically = e === l[Fi]?.deref(), l[Fi] = void 0), e.dispatchEvent(c);
	}, l = [
		s,
		o,
		a
	];
	t.__keyborgData = l, Oi(n, "focusin", s), Oi(n, "focusout", o);
	function u() {
		let e = t.__keyborgData;
		return e && (e[Fi] = new WeakRef(this)), i.apply(this, arguments);
	}
	let d = n.activeElement;
	for (; d && d.shadowRoot;) c(d), d = d.shadowRoot.activeElement;
	u.__keyborgNativeFocus = i;
}
function zi(e) {
	let t = e, n = t.HTMLElement.prototype, r = n.focus.__keyborgNativeFocus, i = t.__keyborgData;
	if (i) {
		let e = t.document;
		ki(e, "focusin", i[Mi]), ki(e, "focusout", i[Ni]);
		for (let e of i[Pi]) {
			let t = e.deref();
			t && (ki(t, "focusin", i[Mi]), ki(t, "focusout", i[Ni]));
		}
		i[Pi].clear(), delete t.__keyborgData;
	}
	r && (n.focus = r);
}
var Bi = 500, Vi = 0;
function Hi(e, t) {
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
		}, Bi);
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
	return Oi(_, Ai, p), Oi(_, "mousedown", h), Oi(e, "keydown", g), Oi(_, "touchstart", m), Oi(_, "touchend", m), Oi(_, "touchcancel", m), Ri(e), {
		dispose: () => {
			if (!n) return;
			i &&= (n.clearTimeout(i), void 0), a &&= (n.clearTimeout(a), void 0), zi(n);
			let e = n.document;
			ki(e, Ai, p), ki(e, "mousedown", h), ki(n, "keydown", g), ki(e, "touchstart", m), ki(e, "touchend", m), ki(e, "touchcancel", m), n = void 0;
		},
		get isNavigatingWithKeyboard() {
			return r;
		},
		set isNavigatingWithKeyboard(e) {
			l(e);
		}
	};
}
function Ui(e, t) {
	let n = e, r = "k" + ++Vi, i = n, a, o = [], s = n.__keyborg;
	a = s ? s.core : Hi(n, t);
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
function Wi(e) {
	e.dispose();
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/constants.js
var Gi = "data-fui-focus-visible";
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/focus/focusVisiblePolyfill.js
function Ki(e, t) {
	if (qi(e)) return () => void 0;
	let n = { current: void 0 }, r = Ui(t);
	function i(e) {
		r.isNavigatingWithKeyboard() && mi(e) && (n.current = e, e.setAttribute(Gi, ""));
	}
	function a() {
		n.current &&= (n.current.removeAttribute(Gi), void 0);
	}
	r.subscribe((e) => {
		e ? i(t.document.activeElement) : a();
	});
	let o = (e) => {
		a();
		let t = e.composedPath()[0];
		i(t);
	}, s = (t) => {
		(!t.relatedTarget || mi(t.relatedTarget) && !e.contains(t.relatedTarget)) && a();
	};
	return e.addEventListener(Ai, o), e.addEventListener("focusout", s), e.focusVisible = !0, e.contains(t.document.activeElement) && i(t.document.activeElement), () => {
		a(), e.removeEventListener(Ai, o), e.removeEventListener("focusout", s), e.focusVisible = void 0, Wi(r);
	};
}
function qi(e) {
	return e ? e.focusVisible ? !0 : qi(e?.parentElement) : !1;
}
//#endregion
//#region node_modules/@fluentui/react-tabster/lib/hooks/useFocusVisible.js
function Ji(e = {}) {
	let t = Kr(), n = A.useRef(null), r = e.targetDocument ?? t.targetDocument;
	return A.useEffect(() => {
		if (r?.defaultView && n.current) return Ki(n.current, r.defaultView);
	}, [n, r]), n;
}
//#endregion
//#region node_modules/@fluentui/tokens/lib/global/colors.js
var N = {
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
}, Yi = {
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
}, Xi = {
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
}, Zi = {
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
}, Qi = {
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
}, $i = {
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
}, P = "#ffffff", ea = "#000000", ta = {
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
}, na = {
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
}, ra = {
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
}, ia = {
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
}, aa = {
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
}, oa = {
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
}, sa = {
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
}, ca = {
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
}, F = {
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
}, I = {
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
}, la = {
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
}, ua = {
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
}, da = {
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
}, fa = {
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
}, pa = {
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
}, ma = {
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
}, ha = {
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
}, ga = {
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
}, _a = {
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
}, va = {
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
}, ya = {
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
}, ba = {
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
}, xa = {
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
}, Sa = {
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
}, Ca = {
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
}, wa = {
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
}, Ta = {
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
}, Ea = {
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
}, Da = {
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
}, Oa = {
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
}, ka = {
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
}, Aa = {
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
}, ja = {
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
}, Ma = {
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
}, Na = {
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
}, Pa = {
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
}, L = {
	red: ra,
	green: ma,
	darkOrange: ia,
	yellow: F,
	berry: Ea,
	lightGreen: pa,
	marigold: ca
}, Fa = {
	darkRed: ta,
	cranberry: na,
	pumpkin: aa,
	peach: sa,
	gold: I,
	brass: la,
	brown: ua,
	forest: da,
	seafoam: fa,
	darkGreen: ha,
	lightTeal: ga,
	teal: _a,
	steel: va,
	blue: ya,
	royalBlue: ba,
	cornflower: xa,
	navy: Sa,
	lavender: Ca,
	purple: wa,
	grape: Ta,
	lilac: Da,
	pink: Oa,
	magenta: ka,
	plum: Aa,
	beige: ja,
	mink: Ma,
	platinum: Na,
	anchor: Pa
}, R = {
	cranberry: na,
	green: ma,
	orange: oa
}, Ia = [
	"red",
	"green",
	"darkOrange",
	"yellow",
	"berry",
	"lightGreen",
	"marigold"
], La = /* @__PURE__ */ "darkRed.cranberry.pumpkin.peach.gold.brass.brown.forest.seafoam.darkGreen.lightTeal.teal.steel.blue.royalBlue.cornflower.navy.lavender.purple.grape.lilac.pink.magenta.plum.beige.mink.platinum.anchor".split("."), Ra = {
	success: "green",
	warning: "orange",
	danger: "cranberry"
}, za = Ia.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background1`]: L[t].tint60,
		[`colorPalette${n}Background2`]: L[t].tint40,
		[`colorPalette${n}Background3`]: L[t].primary,
		[`colorPalette${n}Foreground1`]: L[t].shade10,
		[`colorPalette${n}Foreground2`]: L[t].shade30,
		[`colorPalette${n}Foreground3`]: L[t].primary,
		[`colorPalette${n}BorderActive`]: L[t].primary,
		[`colorPalette${n}Border1`]: L[t].tint40,
		[`colorPalette${n}Border2`]: L[t].primary
	};
	return Object.assign(e, r);
}, {});
za.colorPaletteYellowForeground1 = L.yellow.shade30, za.colorPaletteRedForegroundInverted = L.red.tint20, za.colorPaletteGreenForegroundInverted = L.green.tint20, za.colorPaletteYellowForegroundInverted = L.yellow.tint40;
var Ba = La.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background2`]: Fa[t].tint40,
		[`colorPalette${n}Foreground2`]: Fa[t].shade30,
		[`colorPalette${n}BorderActive`]: Fa[t].primary
	};
	return Object.assign(e, r);
}, {}), Va = {
	...za,
	...Ba
}, Ha = Object.entries(Ra).reduce((e, [t, n]) => {
	let r = t.slice(0, 1).toUpperCase() + t.slice(1), i = {
		[`colorStatus${r}Background1`]: R[n].tint60,
		[`colorStatus${r}Background2`]: R[n].tint40,
		[`colorStatus${r}Background3`]: R[n].primary,
		[`colorStatus${r}Foreground1`]: R[n].shade10,
		[`colorStatus${r}Foreground2`]: R[n].shade30,
		[`colorStatus${r}Foreground3`]: R[n].primary,
		[`colorStatus${r}ForegroundInverted`]: R[n].tint30,
		[`colorStatus${r}BorderActive`]: R[n].primary,
		[`colorStatus${r}Border1`]: R[n].tint40,
		[`colorStatus${r}Border2`]: R[n].primary
	};
	return Object.assign(e, i);
}, {});
Ha.colorStatusDangerBackground3Hover = R[Ra.danger].shade10, Ha.colorStatusDangerBackground3Pressed = R[Ra.danger].shade20, Ha.colorStatusWarningForeground1 = R[Ra.warning].shade20, Ha.colorStatusWarningForeground3 = R[Ra.warning].shade20, Ha.colorStatusWarningBorder2 = R[Ra.warning].shade20;
//#endregion
//#region node_modules/@fluentui/tokens/lib/alias/lightColor.js
var Ua = (e) => ({
	colorNeutralForeground1: N[14],
	colorNeutralForeground1Hover: N[14],
	colorNeutralForeground1Pressed: N[14],
	colorNeutralForeground1Selected: N[14],
	colorNeutralForeground2: N[26],
	colorNeutralForeground2Hover: N[14],
	colorNeutralForeground2Pressed: N[14],
	colorNeutralForeground2Selected: N[14],
	colorNeutralForeground2BrandHover: e[80],
	colorNeutralForeground2BrandPressed: e[70],
	colorNeutralForeground2BrandSelected: e[80],
	colorNeutralForeground3: N[38],
	colorNeutralForeground3Hover: N[26],
	colorNeutralForeground3Pressed: N[26],
	colorNeutralForeground3Selected: N[26],
	colorNeutralForeground3BrandHover: e[80],
	colorNeutralForeground3BrandPressed: e[70],
	colorNeutralForeground3BrandSelected: e[80],
	colorNeutralForeground4: N[44],
	colorNeutralForeground5: N[38],
	colorNeutralForeground5Hover: N[14],
	colorNeutralForeground5Pressed: N[14],
	colorNeutralForeground5Selected: N[14],
	colorNeutralForegroundDisabled: N[74],
	colorNeutralForegroundInvertedDisabled: Yi[40],
	colorBrandForegroundLink: e[70],
	colorBrandForegroundLinkHover: e[60],
	colorBrandForegroundLinkPressed: e[40],
	colorBrandForegroundLinkSelected: e[70],
	colorNeutralForeground2Link: N[26],
	colorNeutralForeground2LinkHover: N[14],
	colorNeutralForeground2LinkPressed: N[14],
	colorNeutralForeground2LinkSelected: N[14],
	colorCompoundBrandForeground1: e[80],
	colorCompoundBrandForeground1Hover: e[70],
	colorCompoundBrandForeground1Pressed: e[60],
	colorBrandForeground1: e[80],
	colorBrandForeground2: e[70],
	colorBrandForeground2Hover: e[60],
	colorBrandForeground2Pressed: e[30],
	colorNeutralForeground1Static: N[14],
	colorNeutralForegroundStaticInverted: P,
	colorNeutralForegroundInverted: P,
	colorNeutralForegroundInvertedHover: P,
	colorNeutralForegroundInvertedPressed: P,
	colorNeutralForegroundInvertedSelected: P,
	colorNeutralForegroundInverted2: P,
	colorNeutralForegroundOnBrand: P,
	colorNeutralForegroundInvertedLink: P,
	colorNeutralForegroundInvertedLinkHover: P,
	colorNeutralForegroundInvertedLinkPressed: P,
	colorNeutralForegroundInvertedLinkSelected: P,
	colorBrandForegroundInverted: e[100],
	colorBrandForegroundInvertedHover: e[110],
	colorBrandForegroundInvertedPressed: e[100],
	colorBrandForegroundOnLight: e[80],
	colorBrandForegroundOnLightHover: e[70],
	colorBrandForegroundOnLightPressed: e[50],
	colorBrandForegroundOnLightSelected: e[60],
	colorNeutralBackground1: P,
	colorNeutralBackground1Hover: N[96],
	colorNeutralBackground1Pressed: N[88],
	colorNeutralBackground1Selected: N[92],
	colorNeutralBackground2: N[98],
	colorNeutralBackground2Hover: N[94],
	colorNeutralBackground2Pressed: N[86],
	colorNeutralBackground2Selected: N[90],
	colorNeutralBackground3: N[96],
	colorNeutralBackground3Hover: N[92],
	colorNeutralBackground3Pressed: N[84],
	colorNeutralBackground3Selected: N[88],
	colorNeutralBackground4: N[94],
	colorNeutralBackground4Hover: N[98],
	colorNeutralBackground4Pressed: N[96],
	colorNeutralBackground4Selected: P,
	colorNeutralBackground5: N[92],
	colorNeutralBackground5Hover: N[96],
	colorNeutralBackground5Pressed: N[94],
	colorNeutralBackground5Selected: N[98],
	colorNeutralBackground6: N[90],
	colorNeutralBackground7: "#00000000",
	colorNeutralBackground7Hover: N[92],
	colorNeutralBackground7Pressed: N[84],
	colorNeutralBackground7Selected: "#00000000",
	colorNeutralBackground8: N[99],
	colorNeutralBackgroundInverted: N[16],
	colorNeutralBackgroundInvertedHover: N[24],
	colorNeutralBackgroundInvertedPressed: N[12],
	colorNeutralBackgroundInvertedSelected: N[22],
	colorNeutralBackgroundStatic: N[20],
	colorNeutralBackgroundAlpha: Yi[50],
	colorNeutralBackgroundAlpha2: Yi[80],
	colorSubtleBackground: "transparent",
	colorSubtleBackgroundHover: N[96],
	colorSubtleBackgroundPressed: N[88],
	colorSubtleBackgroundSelected: N[92],
	colorSubtleBackgroundLightAlphaHover: Yi[70],
	colorSubtleBackgroundLightAlphaPressed: Yi[50],
	colorSubtleBackgroundLightAlphaSelected: "transparent",
	colorSubtleBackgroundInverted: "transparent",
	colorSubtleBackgroundInvertedHover: Xi[10],
	colorSubtleBackgroundInvertedPressed: Xi[30],
	colorSubtleBackgroundInvertedSelected: Xi[20],
	colorTransparentBackground: "transparent",
	colorTransparentBackgroundHover: "transparent",
	colorTransparentBackgroundPressed: "transparent",
	colorTransparentBackgroundSelected: "transparent",
	colorNeutralBackgroundDisabled: N[94],
	colorNeutralBackgroundDisabled2: P,
	colorNeutralBackgroundInvertedDisabled: Yi[10],
	colorNeutralStencil1: N[90],
	colorNeutralStencil2: N[98],
	colorNeutralStencil1Alpha: Xi[10],
	colorNeutralStencil2Alpha: Xi[5],
	colorBackgroundOverlay: Xi[40],
	colorScrollbarOverlay: Xi[50],
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
	colorBrandBackgroundInverted: P,
	colorBrandBackgroundInvertedHover: e[160],
	colorBrandBackgroundInvertedPressed: e[140],
	colorBrandBackgroundInvertedSelected: e[150],
	colorNeutralCardBackground: N[98],
	colorNeutralCardBackgroundHover: P,
	colorNeutralCardBackgroundPressed: N[96],
	colorNeutralCardBackgroundSelected: N[92],
	colorNeutralCardBackgroundDisabled: N[94],
	colorNeutralStrokeAccessible: N[38],
	colorNeutralStrokeAccessibleHover: N[34],
	colorNeutralStrokeAccessiblePressed: N[30],
	colorNeutralStrokeAccessibleSelected: e[80],
	colorNeutralStroke1: N[82],
	colorNeutralStroke1Hover: N[78],
	colorNeutralStroke1Pressed: N[70],
	colorNeutralStroke1Selected: N[74],
	colorNeutralStroke2: N[88],
	colorNeutralStroke3: N[94],
	colorNeutralStroke4: N[92],
	colorNeutralStroke4Hover: N[88],
	colorNeutralStroke4Pressed: N[84],
	colorNeutralStroke4Selected: N[92],
	colorNeutralStrokeSubtle: N[88],
	colorNeutralStrokeOnBrand: P,
	colorNeutralStrokeOnBrand2: P,
	colorNeutralStrokeOnBrand2Hover: P,
	colorNeutralStrokeOnBrand2Pressed: P,
	colorNeutralStrokeOnBrand2Selected: P,
	colorBrandStroke1: e[80],
	colorBrandStroke2: e[140],
	colorBrandStroke2Hover: e[120],
	colorBrandStroke2Pressed: e[80],
	colorBrandStroke2Contrast: e[140],
	colorCompoundBrandStroke: e[80],
	colorCompoundBrandStrokeHover: e[70],
	colorCompoundBrandStrokePressed: e[60],
	colorNeutralStrokeDisabled: N[88],
	colorNeutralStrokeDisabled2: N[92],
	colorNeutralStrokeInvertedDisabled: Yi[40],
	colorTransparentStroke: "transparent",
	colorTransparentStrokeInteractive: "transparent",
	colorTransparentStrokeDisabled: "transparent",
	colorNeutralStrokeAlpha: Xi[5],
	colorNeutralStrokeAlpha2: Yi[20],
	colorStrokeFocus1: P,
	colorStrokeFocus2: ea,
	colorNeutralShadowAmbient: "rgba(0,0,0,0.12)",
	colorNeutralShadowKey: "rgba(0,0,0,0.14)",
	colorNeutralShadowAmbientLighter: "rgba(0,0,0,0.06)",
	colorNeutralShadowKeyLighter: "rgba(0,0,0,0.07)",
	colorNeutralShadowAmbientDarker: "rgba(0,0,0,0.20)",
	colorNeutralShadowKeyDarker: "rgba(0,0,0,0.24)",
	colorBrandShadowAmbient: "rgba(0,0,0,0.30)",
	colorBrandShadowKey: "rgba(0,0,0,0.25)"
}), Wa = {
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
}, Ga = {
	curveAccelerateMax: "cubic-bezier(0.9,0.1,1,0.2)",
	curveAccelerateMid: "cubic-bezier(1,0,1,1)",
	curveAccelerateMin: "cubic-bezier(0.8,0,0.78,1)",
	curveDecelerateMax: "cubic-bezier(0.1,0.9,0.2,1)",
	curveDecelerateMid: "cubic-bezier(0,0,0,1)",
	curveDecelerateMin: "cubic-bezier(0.33,0,0.1,1)",
	curveEasyEaseMax: "cubic-bezier(0.8,0,0.2,1)",
	curveEasyEase: "cubic-bezier(0.33,0,0.67,1)",
	curveLinear: "cubic-bezier(0,0,1,1)"
}, Ka = {
	durationUltraFast: "50ms",
	durationFaster: "100ms",
	durationFast: "150ms",
	durationNormal: "200ms",
	durationGentle: "250ms",
	durationSlow: "300ms",
	durationSlower: "400ms",
	durationUltraSlow: "500ms"
}, qa = {
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
}, Ja = {
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
}, Ya = {
	fontWeightRegular: 400,
	fontWeightMedium: 500,
	fontWeightSemibold: 600,
	fontWeightBold: 700
}, Xa = {
	fontFamilyBase: "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif",
	fontFamilyMonospace: "Consolas, 'Courier New', Courier, monospace",
	fontFamilyNumeric: "Bahnschrift, 'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif"
}, z = {
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
}, Za = {
	spacingHorizontalNone: z.none,
	spacingHorizontalXXS: z.xxs,
	spacingHorizontalXS: z.xs,
	spacingHorizontalSNudge: z.sNudge,
	spacingHorizontalS: z.s,
	spacingHorizontalMNudge: z.mNudge,
	spacingHorizontalM: z.m,
	spacingHorizontalL: z.l,
	spacingHorizontalXL: z.xl,
	spacingHorizontalXXL: z.xxl,
	spacingHorizontalXXXL: z.xxxl
}, Qa = {
	spacingVerticalNone: z.none,
	spacingVerticalXXS: z.xxs,
	spacingVerticalXS: z.xs,
	spacingVerticalSNudge: z.sNudge,
	spacingVerticalS: z.s,
	spacingVerticalMNudge: z.mNudge,
	spacingVerticalM: z.m,
	spacingVerticalL: z.l,
	spacingVerticalXL: z.xl,
	spacingVerticalXXL: z.xxl,
	spacingVerticalXXXL: z.xxxl
}, $a = {
	strokeWidthThin: "1px",
	strokeWidthThick: "2px",
	strokeWidthThicker: "3px",
	strokeWidthThickest: "4px"
}, B = {
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
function eo(e, t, n = "") {
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
var to = (e) => {
	let t = Ua(e);
	return {
		...Wa,
		...qa,
		...Ja,
		...Xa,
		...Ya,
		...$a,
		...Za,
		...Qa,
		...Ka,
		...Ga,
		...t,
		...Va,
		...Ha,
		...eo(t.colorNeutralShadowAmbient, t.colorNeutralShadowKey),
		...eo(t.colorBrandShadowAmbient, t.colorBrandShadowKey, "Brand")
	};
}, no = {
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
}, ro = Ia.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background1`]: L[t].shade40,
		[`colorPalette${n}Background2`]: L[t].shade30,
		[`colorPalette${n}Background3`]: L[t].primary,
		[`colorPalette${n}Foreground1`]: L[t].tint30,
		[`colorPalette${n}Foreground2`]: L[t].tint40,
		[`colorPalette${n}Foreground3`]: L[t].tint20,
		[`colorPalette${n}BorderActive`]: L[t].tint30,
		[`colorPalette${n}Border1`]: L[t].primary,
		[`colorPalette${n}Border2`]: L[t].tint20
	};
	return Object.assign(e, r);
}, {});
ro.colorPaletteRedForeground3 = L.red.tint30, ro.colorPaletteRedBorder2 = L.red.tint30, ro.colorPaletteGreenForeground3 = L.green.tint40, ro.colorPaletteGreenBorder2 = L.green.tint40, ro.colorPaletteDarkOrangeForeground3 = L.darkOrange.tint30, ro.colorPaletteDarkOrangeBorder2 = L.darkOrange.tint30, ro.colorPaletteRedForegroundInverted = L.red.primary, ro.colorPaletteGreenForegroundInverted = L.green.primary, ro.colorPaletteYellowForegroundInverted = L.yellow.shade30;
var io = La.reduce((e, t) => {
	let n = t.slice(0, 1).toUpperCase() + t.slice(1), r = {
		[`colorPalette${n}Background2`]: Fa[t].shade30,
		[`colorPalette${n}Foreground2`]: Fa[t].tint40,
		[`colorPalette${n}BorderActive`]: Fa[t].tint30
	};
	return Object.assign(e, r);
}, {});
io.colorPaletteDarkRedBackground2 = Fa.darkRed.shade20, io.colorPalettePlumBackground2 = Fa.plum.shade20;
var ao = {
	...ro,
	...io
}, oo = Object.entries(Ra).reduce((e, [t, n]) => {
	let r = t.slice(0, 1).toUpperCase() + t.slice(1), i = {
		[`colorStatus${r}Background1`]: R[n].shade40,
		[`colorStatus${r}Background2`]: R[n].shade30,
		[`colorStatus${r}Background3`]: R[n].primary,
		[`colorStatus${r}Foreground1`]: R[n].tint30,
		[`colorStatus${r}Foreground2`]: R[n].tint40,
		[`colorStatus${r}Foreground3`]: R[n].tint20,
		[`colorStatus${r}BorderActive`]: R[n].tint30,
		[`colorStatus${r}ForegroundInverted`]: R[n].shade10,
		[`colorStatus${r}Border1`]: R[n].primary,
		[`colorStatus${r}Border2`]: R[n].tint20
	};
	return Object.assign(e, i);
}, {});
oo.colorStatusDangerBackground3Hover = R[Ra.danger].shade10, oo.colorStatusDangerBackground3Pressed = R[Ra.danger].shade20, oo.colorStatusDangerForeground3 = R[Ra.danger].tint40, oo.colorStatusDangerBorder2 = R[Ra.danger].tint30, oo.colorStatusSuccessForeground3 = R[Ra.success].tint40, oo.colorStatusSuccessBorder2 = R[Ra.success].tint40, oo.colorStatusWarningForegroundInverted = R[Ra.warning].shade20;
//#endregion
//#region node_modules/@fluentui/tokens/lib/themes/web/lightTheme.js
var so = to(no), co = (e) => ({
	colorNeutralForeground1: P,
	colorNeutralForeground1Hover: P,
	colorNeutralForeground1Pressed: P,
	colorNeutralForeground1Selected: P,
	colorNeutralForeground2: N[84],
	colorNeutralForeground2Hover: P,
	colorNeutralForeground2Pressed: P,
	colorNeutralForeground2Selected: P,
	colorNeutralForeground2BrandHover: e[100],
	colorNeutralForeground2BrandPressed: e[90],
	colorNeutralForeground2BrandSelected: e[100],
	colorNeutralForeground3: N[68],
	colorNeutralForeground3Hover: N[84],
	colorNeutralForeground3Pressed: N[84],
	colorNeutralForeground3Selected: N[84],
	colorNeutralForeground3BrandHover: e[100],
	colorNeutralForeground3BrandPressed: e[90],
	colorNeutralForeground3BrandSelected: e[100],
	colorNeutralForeground4: N[60],
	colorNeutralForeground5: N[68],
	colorNeutralForeground5Hover: P,
	colorNeutralForeground5Pressed: P,
	colorNeutralForeground5Selected: P,
	colorNeutralForegroundDisabled: N[36],
	colorNeutralForegroundInvertedDisabled: Yi[40],
	colorBrandForegroundLink: e[100],
	colorBrandForegroundLinkHover: e[110],
	colorBrandForegroundLinkPressed: e[90],
	colorBrandForegroundLinkSelected: e[100],
	colorNeutralForeground2Link: N[84],
	colorNeutralForeground2LinkHover: P,
	colorNeutralForeground2LinkPressed: P,
	colorNeutralForeground2LinkSelected: P,
	colorCompoundBrandForeground1: e[100],
	colorCompoundBrandForeground1Hover: e[110],
	colorCompoundBrandForeground1Pressed: e[90],
	colorBrandForeground1: e[100],
	colorBrandForeground2: e[110],
	colorBrandForeground2Hover: e[130],
	colorBrandForeground2Pressed: e[160],
	colorNeutralForeground1Static: N[14],
	colorNeutralForegroundStaticInverted: P,
	colorNeutralForegroundInverted: N[14],
	colorNeutralForegroundInvertedHover: N[14],
	colorNeutralForegroundInvertedPressed: N[14],
	colorNeutralForegroundInvertedSelected: N[14],
	colorNeutralForegroundInverted2: N[14],
	colorNeutralForegroundOnBrand: P,
	colorNeutralForegroundInvertedLink: P,
	colorNeutralForegroundInvertedLinkHover: P,
	colorNeutralForegroundInvertedLinkPressed: P,
	colorNeutralForegroundInvertedLinkSelected: P,
	colorBrandForegroundInverted: e[80],
	colorBrandForegroundInvertedHover: e[70],
	colorBrandForegroundInvertedPressed: e[60],
	colorBrandForegroundOnLight: e[80],
	colorBrandForegroundOnLightHover: e[70],
	colorBrandForegroundOnLightPressed: e[50],
	colorBrandForegroundOnLightSelected: e[60],
	colorNeutralBackground1: N[16],
	colorNeutralBackground1Hover: N[24],
	colorNeutralBackground1Pressed: N[12],
	colorNeutralBackground1Selected: N[22],
	colorNeutralBackground2: N[12],
	colorNeutralBackground2Hover: N[20],
	colorNeutralBackground2Pressed: N[8],
	colorNeutralBackground2Selected: N[18],
	colorNeutralBackground3: N[8],
	colorNeutralBackground3Hover: N[16],
	colorNeutralBackground3Pressed: N[4],
	colorNeutralBackground3Selected: N[14],
	colorNeutralBackground4: N[4],
	colorNeutralBackground4Hover: N[12],
	colorNeutralBackground4Pressed: ea,
	colorNeutralBackground4Selected: N[10],
	colorNeutralBackground5: ea,
	colorNeutralBackground5Hover: N[8],
	colorNeutralBackground5Pressed: N[2],
	colorNeutralBackground5Selected: N[6],
	colorNeutralBackground6: N[20],
	colorNeutralBackground7: "#00000000",
	colorNeutralBackground7Hover: N[10],
	colorNeutralBackground7Pressed: N[4],
	colorNeutralBackground7Selected: "#00000000",
	colorNeutralBackground8: N[16],
	colorNeutralBackgroundInverted: P,
	colorNeutralBackgroundInvertedHover: N[96],
	colorNeutralBackgroundInvertedPressed: N[88],
	colorNeutralBackgroundInvertedSelected: N[92],
	colorNeutralBackgroundStatic: N[24],
	colorNeutralBackgroundAlpha: Zi[50],
	colorNeutralBackgroundAlpha2: Qi[70],
	colorSubtleBackground: "transparent",
	colorSubtleBackgroundHover: N[22],
	colorSubtleBackgroundPressed: N[18],
	colorSubtleBackgroundSelected: N[20],
	colorSubtleBackgroundLightAlphaHover: $i[80],
	colorSubtleBackgroundLightAlphaPressed: $i[50],
	colorSubtleBackgroundLightAlphaSelected: "transparent",
	colorSubtleBackgroundInverted: "transparent",
	colorSubtleBackgroundInvertedHover: Xi[10],
	colorSubtleBackgroundInvertedPressed: Xi[30],
	colorSubtleBackgroundInvertedSelected: Xi[20],
	colorTransparentBackground: "transparent",
	colorTransparentBackgroundHover: "transparent",
	colorTransparentBackgroundPressed: "transparent",
	colorTransparentBackgroundSelected: "transparent",
	colorNeutralBackgroundDisabled: N[8],
	colorNeutralBackgroundDisabled2: N[16],
	colorNeutralBackgroundInvertedDisabled: Yi[10],
	colorNeutralStencil1: N[34],
	colorNeutralStencil2: N[20],
	colorNeutralStencil1Alpha: Yi[10],
	colorNeutralStencil2Alpha: Yi[5],
	colorBackgroundOverlay: Xi[50],
	colorScrollbarOverlay: Yi[60],
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
	colorBrandBackgroundInverted: P,
	colorBrandBackgroundInvertedHover: e[160],
	colorBrandBackgroundInvertedPressed: e[140],
	colorBrandBackgroundInvertedSelected: e[150],
	colorNeutralCardBackground: N[20],
	colorNeutralCardBackgroundHover: N[24],
	colorNeutralCardBackgroundPressed: N[18],
	colorNeutralCardBackgroundSelected: N[22],
	colorNeutralCardBackgroundDisabled: N[8],
	colorNeutralStrokeAccessible: N[68],
	colorNeutralStrokeAccessibleHover: N[74],
	colorNeutralStrokeAccessiblePressed: N[70],
	colorNeutralStrokeAccessibleSelected: e[100],
	colorNeutralStroke1: N[40],
	colorNeutralStroke1Hover: N[46],
	colorNeutralStroke1Pressed: N[42],
	colorNeutralStroke1Selected: N[44],
	colorNeutralStroke2: N[32],
	colorNeutralStroke3: N[24],
	colorNeutralStroke4: N[24],
	colorNeutralStroke4Hover: N[18],
	colorNeutralStroke4Pressed: N[14],
	colorNeutralStroke4Selected: N[24],
	colorNeutralStrokeSubtle: N[4],
	colorNeutralStrokeOnBrand: N[16],
	colorNeutralStrokeOnBrand2: P,
	colorNeutralStrokeOnBrand2Hover: P,
	colorNeutralStrokeOnBrand2Pressed: P,
	colorNeutralStrokeOnBrand2Selected: P,
	colorBrandStroke1: e[100],
	colorBrandStroke2: e[50],
	colorBrandStroke2Hover: e[50],
	colorBrandStroke2Pressed: e[30],
	colorBrandStroke2Contrast: e[50],
	colorCompoundBrandStroke: e[100],
	colorCompoundBrandStrokeHover: e[110],
	colorCompoundBrandStrokePressed: e[90],
	colorNeutralStrokeDisabled: N[26],
	colorNeutralStrokeDisabled2: N[24],
	colorNeutralStrokeInvertedDisabled: Yi[40],
	colorTransparentStroke: "transparent",
	colorTransparentStrokeInteractive: "transparent",
	colorTransparentStrokeDisabled: "transparent",
	colorNeutralStrokeAlpha: Yi[10],
	colorNeutralStrokeAlpha2: Yi[20],
	colorStrokeFocus1: ea,
	colorStrokeFocus2: P,
	colorNeutralShadowAmbient: "rgba(0,0,0,0.24)",
	colorNeutralShadowKey: "rgba(0,0,0,0.28)",
	colorNeutralShadowAmbientLighter: "rgba(0,0,0,0.12)",
	colorNeutralShadowKeyLighter: "rgba(0,0,0,0.14)",
	colorNeutralShadowAmbientDarker: "rgba(0,0,0,0.40)",
	colorNeutralShadowKeyDarker: "rgba(0,0,0,0.48)",
	colorBrandShadowAmbient: "rgba(0,0,0,0.30)",
	colorBrandShadowKey: "rgba(0,0,0,0.25)"
}), lo = ((e) => {
	let t = co(e);
	return {
		...Wa,
		...qa,
		...Ja,
		...Xa,
		...Ya,
		...$a,
		...Za,
		...Qa,
		...Ka,
		...Ga,
		...t,
		...ao,
		...oo,
		...eo(t.colorNeutralShadowAmbient, t.colorNeutralShadowKey),
		...eo(t.colorBrandShadowAmbient, t.colorBrandShadowKey, "Brand")
	};
})(no), uo = { root: "fui-FluentProvider" }, fo = /*#__PURE__*/ zn({ root: {
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
] }), po = (e) => {
	let t = Kn(), n = fo({
		dir: e.dir,
		renderer: t
	});
	return e.root.className = T(uo.root, e.themeClassName, n.root, e.root.className), e;
}, mo = A.useInsertionEffect ? A.useInsertionEffect : ii, ho = (e, t) => {
	if (!e?.head) return;
	let n = e.createElement("style");
	return Object.keys(t).forEach((e) => {
		n.setAttribute(e, t[e]);
	}), e.head.appendChild(n), n;
}, go = (e, t) => {
	let n = e.sheet;
	n && (n.cssRules.length > 0 && n.deleteRule(0), n.insertRule(t, 0));
}, _o = (e) => {
	let { targetDocument: t, theme: n, rendererAttributes: r } = e, i = A.useRef(void 0), a = ui(uo.root), o = r, s = A.useMemo(() => tr(`.${a}`, n), [n, a]);
	return vo(t, a), mo(() => {
		let e = t?.getElementById(a);
		return e ? i.current = e : (i.current = ho(t, {
			...o,
			id: a
		}), i.current && go(i.current, s)), () => {
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
function vo(e, t) {
	A.useState(() => {
		if (!e) return;
		let n = e.getElementById(t);
		n && e.head.append(n);
	});
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/useFluentProvider.js
var yo = {}, bo = {}, xo = (e, t) => {
	let n = Kr(), r = Co(), i = Yr(), a = A.useContext(Xr) || yo, { applyStylesToPortals: o = !0, customStyleHooks_unstable: s, dir: c = n.dir, targetDocument: l = n.targetDocument, theme: u, overrides_unstable: d = {} } = e, f = So(r, u), p = So(i, d), m = So(a, s), h = Kn(), { styleTagId: g, rule: _ } = _o({
		theme: f,
		targetDocument: l,
		rendererAttributes: h.styleElementAttributes ?? bo
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
		root: ar(Rr("div", {
			...e,
			dir: c,
			ref: di(t, Ji({ targetDocument: l }))
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
function So(e, t) {
	return e && t ? {
		...e,
		...t
	} : e || t;
}
function Co() {
	return A.useContext(zr);
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/useFluentProviderContextValues.js
function wo(e) {
	let { applyStylesToPortals: t, customStyleHooks_unstable: n, dir: r, root: i, targetDocument: a, theme: o, themeClassName: s, overrides_unstable: c } = e, l = A.useMemo(() => ({
		dir: r,
		targetDocument: a
	}), [r, a]), [u] = A.useState(() => ({}));
	return {
		customStyleHooks_unstable: n,
		overrides_unstable: c,
		provider: l,
		textDirection: r,
		iconDirection: A.useMemo(() => ({ textDirection: r }), [r]),
		tooltip: u,
		theme: o,
		themeClassName: t ? i.className : s
	};
}
//#endregion
//#region node_modules/@fluentui/react-provider/lib/components/FluentProvider/FluentProvider.js
var To = /*#__PURE__*/ A.forwardRef((e, t) => {
	let n = xo(e, t);
	return po(n), Di(n, wo(n));
});
To.displayName = "FluentProvider";
//#endregion
//#region node_modules/@fluentui/react-aria/lib/button/useARIAButtonProps.js
function Eo(e, t) {
	let { disabled: n, disabledFocusable: r = !1, "aria-disabled": i, onClick: a, onKeyDown: o, onKeyUp: s, ...c } = t ?? {}, l = typeof i == "string" ? i === "true" : i, u = n || r || l, d = ai((e) => {
		u ? (e.preventDefault(), e.stopPropagation()) : a?.(e);
	}), f = ai((e) => {
		if (o?.(e), e.isDefaultPrevented()) return;
		let t = e.key;
		u && (t === "Enter" || t === " ") ? (e.preventDefault(), e.stopPropagation()) : t === " " ? e.preventDefault() : t === "Enter" && (e.preventDefault(), e.currentTarget.click());
	}), p = ai((e) => {
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
var Do = Zn({
	root: {
		mc9l5x: "f1w7gpdv",
		Bg96gwp: "fez10in"
	},
	rtl: { Bz10aip: "f13rod7r" }
}, { d: [
	".f1w7gpdv{display:inline;}",
	".fez10in{line-height:0;}",
	".f13rod7r{transform:scaleX(-1);}"
] }), Oo = "fui-Icon", ko = "data-fui-icon", Ao = (e, t) => {
	let { filled: n, idPrefix: r, title: i, primaryFill: a = "currentColor", ...o } = e, s = {
		...o,
		fill: a
	}, c = Ei(), l = !!(t?.flipInRtl && c?.textDirection === "rtl");
	return i && (s["aria-label"] = i), !s["aria-label"] && !s["aria-labelledby"] ? s["aria-hidden"] = !0 : s.role = "img", s[ko] = "", {
		state: s,
		isRtlFlip: l
	};
}, jo = (e, t) => {
	let n = Do(), { state: r, isRtlFlip: i } = Ao(e, t);
	return r.className = T(n.root, i && n.rtl, r.className), r;
}, Mo = Zn({ root: { B8gzw0y: "f1dd5bof" } }, { m: [["@media (forced-colors: active){.f1dd5bof{forced-color-adjust:auto;}}", { m: "(forced-colors: active)" }]] }), No = "url(#", Po = (e, t, n) => {
	let [r, i, ...a] = e, o = i;
	if (n && i) {
		let e = {};
		for (let t in i) {
			let r = i[t];
			if (typeof r != "string") e[t] = r;
			else if (t === "id") e[t] = n + r;
			else {
				let i = r.indexOf(No);
				e[t] = i < 0 ? r : r.slice(0, i + 5) + n + r.slice(i + 5);
			}
		}
		o = e;
	}
	return A.createElement(r, {
		...o,
		key: t
	}, ...a.map((e, t) => Po(e, t, n)));
}, Fo = (e) => e === "1em" ? "20" : e, Io = (e, t, n) => typeof e != "string" && (t?.color || Array.isArray(e[0])) ? e.map((e, t) => Po(e, t, n)) : void 0, Lo = () => void 0, Ro = (e, t) => {
	let n = Io(e, t);
	return n ? function(r) {
		return A.useMemo(() => r ? Io(e, t, r) : n, [r]);
	} : Lo;
}, zo = (e, t, n) => typeof t == "string" ? A.createElement("svg", {
	...e,
	dangerouslySetInnerHTML: { __html: t }
}) : n ? A.createElement("svg", e, ...n) : A.createElement("svg", e, ...t.map((t) => A.createElement("path", {
	d: t,
	fill: e.fill
}))), Bo = (e, t, n, r) => {
	let i = Fo(t), a = Ro(n, r), o = A.forwardRef((e, o) => {
		let s = Mo(), c = jo(e, { flipInRtl: r?.flipInRtl }), l = a(e.idPrefix);
		return zo({
			...c,
			className: T(Oo, c.className, s.root),
			ref: o,
			width: t,
			height: t,
			viewBox: `0 0 ${i} ${i}`,
			xmlns: "http://www.w3.org/2000/svg"
		}, n, l);
	});
	return o.displayName = e, o;
}, Vo = /*#__PURE__*/ Bo("ArrowDownRegular", "1em", ["M16.87 10.84a.5.5 0 1 0-.74-.68l-5.63 6.17V2.5a.5.5 0 0 0-1 0v13.83l-5.63-6.17a.5.5 0 0 0-.74.68l6.31 6.91a.75.75 0 0 0 1.11 0z"]), Ho = /*#__PURE__*/ Bo("ArrowUpRegular", "1em", ["M3.13 9.16a.5.5 0 1 0 .74.68L9.5 3.67V17.5a.5.5 0 1 0 1 0V3.67l5.63 6.17a.5.5 0 0 0 .74-.68l-6.32-6.92a.75.75 0 0 0-1.1 0z"], { flipInRtl: !0 }), V = /*#__PURE__*/ Bo("Timer20Regular", "20", ["M7.5 2a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm7.66 1.93a.5.5 0 1 0-.71.7l1.41 1.42a.5.5 0 1 0 .71-.7zM9.5 6a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5m0 12a7 7 0 1 0 0-14 7 7 0 0 0 0 14m0-1a6 6 0 1 1 0-12 6 6 0 0 1 0 12"]), H = {
	durationUltraFast: 50,
	durationFaster: 100,
	durationFast: 150,
	durationNormal: 200,
	durationGentle: 250,
	durationSlow: 300,
	durationSlower: 400,
	durationUltraSlow: 500
}, Uo = {
	curveAccelerateMax: "cubic-bezier(0.9,0.1,1,0.2)",
	curveAccelerateMid: "cubic-bezier(1,0,1,1)",
	curveAccelerateMin: "cubic-bezier(0.8,0,0.78,1)",
	curveDecelerateMax: "cubic-bezier(0.1,0.9,0.2,1)",
	curveDecelerateMid: "cubic-bezier(0,0,0,1)",
	curveDecelerateMin: "cubic-bezier(0.33,0,0.1,1)",
	curveEasyEaseMax: "cubic-bezier(0.8,0,0.2,1)",
	curveEasyEase: "cubic-bezier(0.33,0,0.67,1)",
	curveLinear: "cubic-bezier(0,0,1,1)"
}, U = {
	...H,
	...Uo
};
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/isAnimationRunning.js
function Wo(e) {
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
var Go = { fill: "forwards" }, Ko = { duration: 1 };
function qo(e) {
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
			return e.some((e) => Wo(e));
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
function Jo() {
	let e = typeof window < "u" && typeof window.Animation?.prototype.persist == "function";
	return A.useCallback((t, n, r) => {
		let i = Array.isArray(n) ? n : [n], { isReducedMotion: a } = r;
		return qo(i.map((n) => {
			let { keyframes: r, reducedMotion: i = Ko, ...o } = n, { keyframes: s = r, ...c } = i, l = a ? s : r, u = {
				...Go,
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
function Yo() {
	return Jo();
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useMotionImperativeRef.js
function Xo(e) {
	let t = A.useRef(void 0);
	return A.useImperativeHandle(e, () => ({
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
var Zo = "screen and (prefers-reduced-motion: reduce)";
function Qo() {
	let { targetDocument: e } = Kr(), t = e?.defaultView ?? null, n = A.useRef(!1), r = A.useCallback(() => n.current, []);
	return ii(() => {
		if (t === null || typeof t.matchMedia != "function") return;
		let e = t.matchMedia(Zo);
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
var $o = [
	"@fluentui/react-motion: Invalid child element.",
	"\n",
	"Motion factories require a single child element to be passed. ",
	"That element element should support ref forwarding i.e. it should be either an intrinsic element (e.g. div) or a component that uses React.forwardRef()."
].join("");
function es(e, t = !0) {
	let n = A.useRef(null);
	A.useEffect(() => {}, [t]);
	try {
		let t = A.Children.only(e);
		if (A.isValidElement(t)) return [A.cloneElement(t, { ref: di(n, pi(t)) }), n];
	} catch {}
	throw Error($o);
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/contexts/MotionBehaviourContext.js
var ts = A.createContext(void 0);
ts.Provider;
var ns = () => A.useContext(ts) ?? "default", rs = Symbol("MOTION_DEFINITION");
function is(e) {
	return Object.assign((t) => {
		let { children: n, imperativeRef: r, onMotionFinish: i, onMotionStart: a, onMotionCancel: o, replayKey: s, ...c } = t, l = c, [u, d] = es(n), f = Xo(r), p = A.useRef(!0), m = ns() === "skip", h = A.useRef({
			skipMotions: m,
			params: l
		}), g = Yo(), _ = Qo(), v = ai(() => {
			a?.(null);
		}), y = ai(() => {
			i?.(null);
		}), b = ai(() => {
			o?.(null);
		}), ee = A.useCallback((e) => {
			v(), e.setMotionEndCallbacks(y, b), h.current.skipMotions && e.finish();
		}, [
			v,
			y,
			b
		]);
		return ii(() => {
			h.current = {
				skipMotions: m,
				params: l
			};
		}), ii(() => {
			let t = d.current;
			if (t) {
				let n = typeof e == "function" ? e({
					element: t,
					...h.current.params
				}) : e, r = g(t, n, { isReducedMotion: _() });
				return f.current = r, ee(r), () => {
					r.cancel();
				};
			}
		}, [
			g,
			d,
			f,
			_,
			ee
		]), ii(() => {
			if (p.current) return;
			let e = f.current;
			e && (e.cancel(), e.play(), ee(e));
		}, [s]), ii(() => (p.current = !1, () => {
			p.current = !0;
		}), []), u;
	}, { [rs]: typeof e == "function" ? e : () => e });
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/contexts/PresenceGroupChildContext.js
var as = A.createContext(void 0);
as.Provider;
//#endregion
//#region node_modules/@fluentui/react-motion/lib/hooks/useMountedState.js
function os(e = !1, t = !1) {
	let n = A.useRef(!t || e), r = si(), i = A.useCallback((e) => {
		n.current !== e && (n.current = e, r());
	}, [r]);
	return A.useEffect(() => {
		e && (n.current = e);
	}), [e || n.current, i];
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/factories/createPresenceComponent.js
var ss = Symbol("PRESENCE_MOTION_DEFINITION"), cs = Symbol.for("interruptablePresence");
function ls(e) {
	return Object.assign((t) => {
		let n = {
			...A.useContext(as),
			...t
		}, r = ns() === "skip", { appear: i, children: a, imperativeRef: o, onExit: s, onMotionFinish: c, onMotionStart: l, onMotionCancel: u, visible: d, unmountOnExit: f, ...p } = n, m = p, [h, g] = os(d, f), [_, v] = es(a, h), y = Xo(o), b = A.useRef({
			appear: i,
			params: m,
			skipMotions: r
		}), ee = Yo(), x = oi(), te = Qo(), S = ai((e) => {
			l?.(null, { direction: e });
		}), C = ai((e) => {
			c?.(null, { direction: e }), e === "exit" && f && (g(!1), s?.());
		}), ne = ai((e) => {
			u?.(null, { direction: e });
		});
		return ii(() => {
			b.current = {
				appear: i,
				params: m,
				skipMotions: r
			};
		}), ii(() => {
			let t = v.current;
			if (!t) return;
			let n;
			function r() {
				n && (a && n.isRunning() || (n.cancel(), y.current = void 0));
			}
			let i = typeof e == "function" ? e({
				element: t,
				...b.current.params
			}) : e, a = i[cs];
			if (a && (n = y.current, n && n.isRunning())) return n.reverse(), r;
			let o = d ? i.enter : i.exit, s = d ? "enter" : "exit", c = !b.current.appear && x, l = b.current.skipMotions;
			return c || S(s), n = ee(t, o, { isReducedMotion: te() }), c ? (n.finish(), r) : (y.current = n, n.setMotionEndCallbacks(() => C(s), () => ne(s)), l && n.finish(), r);
		}, [
			ee,
			v,
			y,
			te,
			C,
			S,
			ne,
			d
		]), A.useEffect(() => {
			if (f && !h) {
				var e;
				(e = y.current) == null || e.dispose();
			}
		}, [
			y,
			f,
			h
		]), h ? _ : null;
	}, { [ss]: typeof e == "function" ? e : () => e }, {
		In: is(typeof e == "function" ? (...t) => e(...t).enter : e.enter),
		Out: is(typeof e == "function" ? (...t) => e(...t).exit : e.exit)
	});
}
//#endregion
//#region node_modules/@swc/helpers/esm/_define_property.js
function us(e, t, n) {
	return t in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/utils/groups/mergeChildMappings.js
function ds(e, t) {
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
function fs(e, t) {
	let n = ds(e, t);
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
function ps(e) {
	let t = {};
	return e && A.Children.toArray(e).forEach((e) => {
		A.isValidElement(e) && (t[e.key ?? ""] = {
			appear: !1,
			element: e,
			visible: !0,
			unmountOnExit: !0
		});
	}), t;
}
//#endregion
//#region node_modules/@fluentui/react-motion/lib/components/PresenceGroupItemProvider.js
var ms = (e) => {
	let { appear: t, childKey: n, onExit: r, visible: i, unmountOnExit: a } = e, o = A.useMemo(() => ({
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
	return /*#__PURE__*/ A.createElement(as.Provider, { value: o }, e.children);
}, hs = class extends A.Component {
	static getDerivedStateFromProps(e, { childMapping: t, firstRender: n }) {
		let r = ps(e.children);
		return {
			childMapping: n ? r : fs(t, r),
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
		return /*#__PURE__*/ A.createElement(A.Fragment, null, Object.entries(this.state.childMapping).map(([e, t]) => /*#__PURE__*/ A.createElement(ms, {
			...t,
			childKey: e,
			key: e,
			onExit: this.handleExit
		}, t.element)));
	}
	constructor(e, t) {
		super(e, t), us(this, "mounted", !1), us(this, "handleExit", (e) => {
			e in ps(this.props.children) || this.mounted && this.setState((t) => {
				let n = { ...t.childMapping };
				return delete n[e], { childMapping: n };
			});
		}), this.state = {
			childMapping: {},
			firstRender: !0
		};
	}
}, gs = (e, t) => {
	let { shape: n = "circular", size: r = "medium", appearance: i = "filled", color: a = "brand", ...o } = e;
	return {
		..._s(o, t),
		shape: n,
		size: r,
		appearance: i,
		color: a
	};
}, _s = (e, t) => {
	let { iconPosition: n = "before" } = e;
	return {
		iconPosition: n,
		components: {
			root: "div",
			icon: "span"
		},
		root: ar(Rr("div", {
			ref: t,
			...e
		}), { elementType: "div" }),
		icon: or(e.icon, { elementType: "span" })
	};
}, vs = {
	root: "fui-Badge",
	icon: "fui-Badge__icon"
};
B.spacingHorizontalXXS;
var ys = /*#__PURE__*/ Qn("r1iycov", "r115jdol", [
	".r1iycov{display:inline-flex;box-sizing:border-box;align-items:center;justify-content:center;position:relative;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightSemibold);line-height:var(--lineHeightBase200);height:20px;min-width:20px;padding:0 calc(var(--spacingHorizontalXS) + var(--spacingHorizontalXXS));border-radius:var(--borderRadiusCircular);border-color:var(--colorTransparentStroke);}",
	".r1iycov::after{content:\"\";position:absolute;top:0;left:0;bottom:0;right:0;border-style:solid;border-color:inherit;border-width:var(--strokeWidthThin);border-radius:inherit;}",
	".r115jdol{display:inline-flex;box-sizing:border-box;align-items:center;justify-content:center;position:relative;font-family:var(--fontFamilyBase);font-size:var(--fontSizeBase200);font-weight:var(--fontWeightSemibold);line-height:var(--lineHeightBase200);height:20px;min-width:20px;padding:0 calc(var(--spacingHorizontalXS) + var(--spacingHorizontalXXS));border-radius:var(--borderRadiusCircular);border-color:var(--colorTransparentStroke);}",
	".r115jdol::after{content:\"\";position:absolute;top:0;right:0;bottom:0;left:0;border-style:solid;border-color:inherit;border-width:var(--strokeWidthThin);border-radius:inherit;}"
]), bs = /*#__PURE__*/ Zn({
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
] }), xs = /*#__PURE__*/ Qn("rttl5z0", null, [".rttl5z0{display:flex;line-height:1;margin:0 calc(-1 * var(--spacingHorizontalXXS));font-size:12px;}"]), Ss = /*#__PURE__*/ Zn({
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
] }), Cs = (e) => {
	let t = ys(), n = bs(), r = e.size === "small" || e.size === "extra-small" || e.size === "tiny";
	e.root.className = T(vs.root, t, r && n.fontSmallToTiny, n[e.size], n[e.shape], e.shape === "rounded" && r && n.roundedSmallToTiny, e.appearance === "ghost" && n.borderGhost, n[e.appearance], n[`${e.appearance}-${e.color}`], e.root.className);
	let i = xs(), a = Ss();
	if (e.icon) {
		let t;
		A.Children.toArray(e.root.children).length > 0 && (t = e.size === "extra-large" ? e.iconPosition === "after" ? a.afterTextXL : a.beforeTextXL : e.iconPosition === "after" ? a.afterText : a.beforeText), e.icon.className = T(vs.icon, i, t, a[e.size], e.icon.className);
	}
	return e;
}, ws = (e) => /*#__PURE__*/ Si(e.root, { children: [
	e.iconPosition === "before" && e.icon && /*#__PURE__*/ xi(e.icon, {}),
	e.root.children,
	e.iconPosition === "after" && e.icon && /*#__PURE__*/ xi(e.icon, {})
] }), Ts = /*#__PURE__*/ A.forwardRef((e, t) => {
	let n = gs(e, t);
	return Cs(n), $r("useBadgeStyles_unstable")(n), ws(n);
});
Ts.displayName = "Badge";
//#endregion
//#region node_modules/@fluentui/react-button/lib/components/Button/renderButton.js
var Es = (e) => {
	let { iconOnly: t, iconPosition: n } = e;
	return /*#__PURE__*/ Si(e.root, { children: [
		n !== "after" && e.icon && /*#__PURE__*/ xi(e.icon, {}),
		!t && e.root.children,
		n === "after" && e.icon && /*#__PURE__*/ xi(e.icon, {})
	] });
}, Ds = A.createContext(void 0), Os = {};
Ds.Provider;
var ks = () => A.useContext(Ds) ?? Os, As = (e, t) => {
	let { size: n } = ks(), { appearance: r = "secondary", shape: i = "rounded", size: a = n ?? "medium", ...o } = e;
	return {
		appearance: r,
		shape: i,
		size: a,
		...js(o, t)
	};
}, js = (e, t) => {
	let { icon: n, iconPosition: r = "before", ...i } = e, a = or(n, { elementType: "span" });
	return {
		disabled: e.disabled ?? !1,
		disabledFocusable: e.disabledFocusable ?? !1,
		iconPosition: r,
		iconOnly: !(!a?.children || e.children),
		components: {
			root: "button",
			icon: "span"
		},
		root: ar(Eo(i.as, i), {
			elementType: "button",
			defaultProps: {
				ref: t,
				type: e.as === "a" ? void 0 : "button"
			}
		}),
		icon: a
	};
}, Ms = {
	root: "fui-Button",
	icon: "fui-Button__icon"
};
`${B.strokeWidthThin}`;
var Ns = /*#__PURE__*/ Qn("r1f29ykk", null, {
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
}), Ps = /*#__PURE__*/ Qn("rywnvv2", null, [".rywnvv2{align-items:center;display:inline-flex;justify-content:center;font-size:20px;height:20px;width:20px;--fui-Button__icon--spacing:var(--spacingHorizontalSNudge);}"]), Fs = /*#__PURE__*/ Zn({
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
}), Is = /*#__PURE__*/ Zn({
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
}), Ls = /*#__PURE__*/ Zn({
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
}), Rs = /*#__PURE__*/ Zn({
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
] }), zs = /*#__PURE__*/ Zn({
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
] }), Bs = (e) => {
	let t = Ns(), n = Ps(), r = Fs(), i = Is(), a = Ls(), o = Rs(), s = zs(), { appearance: c, disabled: l, disabledFocusable: u, icon: d, iconOnly: f, iconPosition: p, shape: m, size: h } = e;
	return e.root.className = T(Ms.root, t, c && r[c], r[h], d && h === "small" && r.smallWithIcon, d && h === "large" && r.largeWithIcon, r[m], (l || u) && i.base, (l || u) && i.highContrast, c && (l || u) && i[c], c === "primary" && a.primary, a[h], a[m], f && o[h], e.root.className), e.icon && (e.icon.className = T(Ms.icon, n, !!e.root.children && s[p], s[h], e.icon.className)), e;
}, Vs = /*#__PURE__*/ A.forwardRef((e, t) => {
	let n = As(e, t);
	return Bs(n), $r("useButtonStyles_unstable")(n), Es(n);
});
Vs.displayName = "Button";
//#endregion
//#region node_modules/@fluentui/react-text/lib/components/Text/useText.js
var Hs = (e, t) => {
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
		root: ar(Rr("span", {
			ref: t,
			...e
		}), { elementType: "span" })
	};
}, Us = (e) => /*#__PURE__*/ xi(e.root, {}), Ws = { root: "fui-Text" }, Gs = /*#__PURE__*/ Zn({
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
] }), Ks = (e) => {
	let t = Gs();
	return e.root.className = T(Ws.root, t.root, e.wrap === !1 && t.nowrap, e.truncate && t.truncate, e.block && t.block, e.italic && t.italic, e.underline && t.underline, e.strikethrough && t.strikethrough, e.underline && e.strikethrough && t.strikethroughUnderline, e.size === 100 && t.base100, e.size === 200 && t.base200, e.size === 400 && t.base400, e.size === 500 && t.base500, e.size === 600 && t.base600, e.size === 700 && t.hero700, e.size === 800 && t.hero800, e.size === 900 && t.hero900, e.size === 1e3 && t.hero1000, e.font === "monospace" && t.monospace, e.font === "numeric" && t.numeric, e.weight === "medium" && t.weightMedium, e.weight === "semibold" && t.weightSemibold, e.weight === "bold" && t.weightBold, e.align === "center" && t.alignCenter, e.align === "end" && t.alignEnd, e.align === "justify" && t.alignJustify, e.root.className), e;
}, qs = /*#__PURE__*/ A.forwardRef((e, t) => {
	let n = Hs(e, t);
	return Ks(n), $r("useTextStyles_unstable")(n), Us(n);
});
qs.displayName = "Text";
//#endregion
//#region public/plugins/_shared/theme.js
var Js = _(), Ys = {
	background: "colorNeutralBackground1",
	foreground: "colorNeutralForeground1",
	muted: "colorNeutralForeground2",
	accent: "colorBrandBackground"
};
function Xs() {
	return (typeof window < "u" && window.matchMedia?.("(prefers-color-scheme: light)"))?.matches ? "light" : "dark";
}
function Zs(e) {
	let t = e && typeof e == "object" ? e : {}, n = t.colorScheme === "light" ? "light" : t.colorScheme === "dark" ? "dark" : Xs(), r = n === "light" ? so : lo, i = {};
	for (let [e, n] of Object.entries(t)) {
		if (typeof n != "string" || !n || e === "colorScheme") continue;
		let t = Ys[e];
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
function Qs(e) {
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
var $s = {
	init: null,
	legacyTheme: null,
	started: !1
};
function ec() {
	$s.started || ($s.started = !0, e.onInit((e) => {
		$s.init ||= e;
	}), window.addEventListener("message", (e) => {
		let t = e.data;
		t && t.type === "wtsl:init" && t.theme && ($s.legacyTheme ||= t.theme);
	}));
}
function tc() {
	return $s.init;
}
function nc(e) {
	return $s.init?.theme ? $s.init.theme : $s.legacyTheme && Qs($s.legacyTheme) || { colorScheme: e };
}
function rc(e) {
	let t = $s.init?.config;
	if (t && typeof t == "object") return t[e];
}
var ic = "(prefers-color-scheme: light)";
function ac() {
	return typeof window > "u" || typeof window.matchMedia != "function" ? "dark" : window.matchMedia(ic).matches ? "light" : "dark";
}
function oc(t = "dark") {
	let [n, r] = (0, A.useState)(() => nc(t)), [i, a] = (0, A.useState)(ac);
	(0, A.useEffect)(() => {
		let t = e.onInit((e) => {
			e && typeof e == "object" && e.theme && typeof e.theme == "object" && r(e.theme);
		}), n = e.onTheme((e) => {
			e && typeof e == "object" && r(e);
		});
		return () => {
			t(), n();
		};
	}, []), (0, A.useEffect)(() => {
		if (e.inHost || typeof window.matchMedia != "function") return;
		let t = window.matchMedia(ic), n = () => a(t.matches ? "light" : "dark");
		return typeof t.addEventListener == "function" ? (t.addEventListener("change", n), () => t.removeEventListener("change", n)) : (t.addListener(n), () => t.removeListener(n));
	}, []);
	let o = e.inHost ? n : {
		...n,
		colorScheme: i
	}, s = (0, A.useMemo)(() => Zs(o), [o]);
	return (0, A.useEffect)(() => {
		typeof document < "u" && (document.documentElement.style.colorScheme = s.scheme, document.body && (document.body.style.colorScheme = s.scheme));
	}, [s.scheme]), s;
}
function sc(t, n) {
	let r = (0, A.useRef)(t);
	r.current = t;
	let [i, a] = (0, A.useState)(() => {
		let e = $s.init?.size;
		return Array.isArray(e) ? r.current(e) : n;
	});
	return (0, A.useEffect)(() => {
		let t = (e) => {
			Array.isArray(e) && e.length === 2 && a(r.current(e));
		}, n = e.onInit((e) => t(e?.size)), i = e.onResize(t);
		return () => {
			n(), i();
		};
	}, []), i;
}
function cc(t, n, r) {
	let i = (0, A.useRef)(r);
	i.current = r;
	let [a, o] = (0, A.useState)(() => {
		let e = rc(t);
		return i.current ? i.current(e) : e ?? n;
	}), [s, c] = (0, A.useState)(() => rc(t) !== void 0);
	(0, A.useEffect)(() => {
		let r = rc(t);
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
	let l = (0, A.useCallback)((n) => {
		o((r) => {
			let i = typeof n == "function" ? n(r) : n;
			return e.setConfig(t, i).catch(() => {}), i;
		});
	}, [t]);
	return (0, A.useEffect)(() => {
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
function lc() {
	let e = new URLSearchParams(location.search);
	return e.get("view") || (e.get("settings") === "1" ? "settings" : null);
}
function uc(e, t) {
	window.parent.postMessage({
		type: "plugin:request-overlay",
		payload: {
			view: e,
			title: t
		}
	}, "*");
}
function dc() {
	window.parent.postMessage({ type: "plugin:request-host-settings" }, "*");
}
var fc = 500, pc = 8, mc = [
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
function hc(e, t) {
	if (!(t instanceof Element)) return !1;
	let n = t.closest(mc);
	return !!(n && n !== e && e.contains(n));
}
function gc() {
	let t = (0, A.useRef)(null);
	return (0, A.useEffect)(() => {
		let n = t.current;
		if (!n || !e.inHost || lc()) return;
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
			e.button === 0 && (hc(n, e.target) || r === null && (r = e.pointerId, i = e.clientX, a = e.clientY, s = !1, f("down", e.pointerType), o = window.setTimeout(() => {
				o = 0, s = !0, g(), window.parent.postMessage({ type: "plugin:request-edit-mode" }, "*");
			}, fc)));
		}, y = (e) => {
			if (d(e.pointerType)) {
				let t = !hc(n, e.target);
				t !== c && (c = t, f(t ? "hover-enter" : "hover-leave", e.pointerType));
			}
			r !== null && e.pointerId === r && (Math.hypot(e.clientX - i, e.clientY - a) <= pc || (p(), !s && (r = null, f("cancel", e.pointerType))));
		}, b = (e) => {
			r !== null && e.pointerId === r && (r = null, p(), f("up", e.pointerType), s && _());
		}, ee = (e) => {
			r !== null && e.pointerId === r && (r = null, p(), f("cancel", e.pointerType), s && _());
		}, x = (e) => {
			d(e.pointerType) && c && (c = !1, f("hover-leave", e.pointerType)), r !== null && e.pointerId === r && (r = null, p(), s ? _() : f("cancel", e.pointerType));
		}, te = (e) => e.preventDefault();
		return n.addEventListener("pointerdown", v, !0), n.addEventListener("pointermove", y, !0), n.addEventListener("pointerleave", x), window.addEventListener("pointerup", b), window.addEventListener("pointercancel", ee), document.addEventListener("contextmenu", te, !0), () => {
			n.removeEventListener("pointerdown", v, !0), n.removeEventListener("pointermove", y, !0), n.removeEventListener("pointerleave", x), window.removeEventListener("pointerup", b), window.removeEventListener("pointercancel", ee), document.removeEventListener("contextmenu", te, !0), p(), h();
		};
	}, []), { ref: t };
}
typeof window < "u" && lc() && window.addEventListener("keydown", (e) => {
	e.key === "Escape" && (e.preventDefault(), window.parent.postMessage({ type: "plugin:request-overlay-close" }, "*"));
});
function _c(t, n) {
	let r = (0, A.useRef)(n);
	r.current = n;
	let i = (0, A.useRef)(t);
	(0, A.useEffect)(() => (e.ready(i.current), e.onToolCall(async (t) => {
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
var vc = "(prefers-reduced-motion: reduce)", yc = "8px", bc = "4px", xc = "48px";
function Sc() {
	return typeof window > "u" || typeof window.matchMedia != "function" ? null : window.matchMedia(vc);
}
function Cc() {
	let [e, t] = (0, A.useState)(() => !!Sc()?.matches);
	return (0, A.useEffect)(() => {
		let e = Sc();
		if (!e) return;
		let n = () => t(e.matches);
		return n(), typeof e.addEventListener == "function" ? (e.addEventListener("change", n), () => e.removeEventListener("change", n)) : (e.addListener(n), () => e.removeListener(n));
	}, []), e;
}
function wc(e, t) {
	switch (e) {
		case "down": return `0px -${t}`;
		case "left": return `${t} 0px`;
		case "right": return `-${t} 0px`;
		default: return `0px ${t}`;
	}
}
function Tc(e, t = U.durationFaster, n = U.curveAccelerateMin) {
	return ({ direction: r = "up" }) => ({
		enter: {
			keyframes: [{
				opacity: 0,
				translate: wc(r, e)
			}, {
				opacity: 1,
				translate: "0px 0px"
			}],
			duration: U.durationNormal,
			easing: U.curveDecelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 0 }, { opacity: 1 }],
				duration: U.durationFaster,
				easing: U.curveDecelerateMid
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
				duration: U.durationFaster,
				easing: U.curveAccelerateMid
			}
		}
	});
}
ls(Tc(yc));
var Ec = ls(Tc(bc, U.durationFast, U.curveAccelerateMid));
ls(({ element: e }) => {
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
			duration: U.durationNormal,
			easing: U.curveDecelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 0 }, { opacity: 1 }],
				duration: U.durationFaster,
				easing: U.curveDecelerateMid
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
			duration: U.durationFast,
			easing: U.curveAccelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 1 }, { opacity: 0 }],
				duration: U.durationFaster,
				easing: U.curveAccelerateMid
			}
		}
	};
});
function Dc({ value: e, direction: t = "up", children: n, className: r, style: i }) {
	let a = e == null ? "default" : String(e);
	return (0, A.createElement)("div", {
		className: r,
		style: {
			display: "grid",
			minWidth: 0,
			...i
		},
		"data-cross-fade": a
	}, (0, A.createElement)(hs, null, (0, A.createElement)(Ec, {
		key: a,
		direction: t
	}, (0, A.createElement)("div", { style: {
		gridArea: "1 / 1",
		minWidth: 0
	} }, n))));
}
ls(({ direction: e = "forward" }) => {
	let t = e === "back", n = t ? `-${xc} 0px` : `${xc} 0px`, r = t ? `${xc} 0px` : `-${xc} 0px`;
	return {
		enter: {
			keyframes: [{
				opacity: 0,
				translate: n
			}, {
				opacity: 1,
				translate: "0px 0px"
			}],
			duration: U.durationGentle,
			easing: U.curveDecelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 0 }, { opacity: 1 }],
				duration: U.durationFaster,
				easing: U.curveDecelerateMid
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
			duration: U.durationNormal,
			easing: U.curveAccelerateMid,
			fill: "both",
			reducedMotion: {
				keyframes: [{ opacity: 1 }, { opacity: 0 }],
				duration: U.durationFaster,
				easing: U.curveAccelerateMid
			}
		}
	};
});
var Oc = {
	press: ["durationUltraFast", "curveAccelerateMin"],
	hoverEnter: ["durationFaster", "curveDecelerateMin"],
	hoverLeave: ["durationFaster", "curveAccelerateMin"],
	exit: ["durationFast", "curveAccelerateMid"],
	normal: ["durationNormal", "curveDecelerateMid"],
	gentle: ["durationGentle", "curveDecelerateMid"],
	slow: ["durationSlow", "curveDecelerateMid"],
	longPress: ["durationUltraSlow", "curveLinear"]
};
function kc(e = "normal") {
	let [t, n] = Oc[e] ?? Oc.normal;
	return {
		transitionDuration: `${U[t]}ms`,
		transitionTimingFunction: U[n]
	};
}
function Ac(e = "normal") {
	let t = Cc();
	return (0, A.useMemo)(() => t ? {
		transitionDuration: `${U.durationFaster}ms`,
		transitionTimingFunction: U.curveDecelerateMin
	} : kc(e), [e, t]);
}
//#endregion
//#region public/plugins/_shared/typography.js
var jc = {
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
function Mc(e) {
	let t = jc[e];
	if (!t) throw Error(`Display XL 只定义了 48/80/96/112，收到 ${String(e)}`);
	return t;
}
var Nc = { fontVariantNumeric: "tabular-nums" }, Pc = 40, Fc = 44, Ic = 56, Lc = 48, Rc = 40, zc = 56, Bc = [
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
function Vc(e, t) {
	if (!(t instanceof Element)) return !1;
	let n = t.closest(Bc);
	return !!(n && n !== e && e.contains(n));
}
var Hc = Xn({ root: {
	position: "relative",
	display: "flex",
	flexDirection: "column",
	width: "100%",
	height: "100%",
	minWidth: 0,
	minHeight: 0,
	overflow: "hidden",
	boxSizing: "border-box",
	color: B.colorNeutralForeground1,
	fontFamily: B.fontFamilyBase
} });
function Uc({ onActivate: e, ariaLabel: t, className: n, style: r, children: i, ...a }) {
	let o = Hc(), s = gc(), c = (0, A.useCallback)((t) => {
		Vc(t.currentTarget, t.target) || e?.(t);
	}, [e]), l = (0, A.useCallback)((t) => {
		(t.key === "Enter" || t.key === " ") && (Vc(t.currentTarget, t.target) || (t.preventDefault(), e?.(t)));
	}, [e]);
	return /* @__PURE__ */ (0, j.jsx)("div", {
		...a,
		ref: s.ref,
		role: "button",
		tabIndex: 0,
		"aria-label": t,
		className: T(o.root, n),
		style: r,
		"data-card-root": "true",
		onClick: c,
		onKeyDown: l,
		children: i
	});
}
var Wc = Xn({
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "space-between",
		gap: B.spacingHorizontalS,
		minHeight: B.lineHeightBase200,
		color: B.colorNeutralForeground3
	},
	title: {
		minWidth: 0,
		color: B.colorNeutralForeground3
	},
	trailing: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		gap: B.spacingHorizontalXS
	}
});
function Gc({ title: e, trailing: t, className: n, style: r }) {
	let i = Wc();
	return /* @__PURE__ */ (0, j.jsxs)("div", {
		className: T(i.header, n),
		style: r,
		children: [typeof e == "string" || typeof e == "number" ? /* @__PURE__ */ (0, j.jsx)(qs, {
			size: 200,
			weight: "semibold",
			truncate: !0,
			wrap: !1,
			className: i.title,
			children: e
		}) : e, t ? /* @__PURE__ */ (0, j.jsx)("div", {
			className: i.trailing,
			children: t
		}) : null]
	});
}
var Kc = Xn({
	root: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: B.spacingVerticalXXS,
		minWidth: 0
	},
	valueRow: {
		display: "flex",
		alignItems: "baseline",
		gap: B.spacingHorizontalXS,
		minWidth: 0
	},
	value: {
		...Nc,
		fontWeight: "600",
		color: B.colorNeutralForeground1,
		whiteSpace: "nowrap"
	},
	size48: Mc(48),
	size68: {
		fontSize: B.fontSizeHero1000,
		lineHeight: B.lineHeightHero1000
	},
	size80: Mc(80),
	size96: Mc(96),
	size112: Mc(112),
	unit: { color: B.colorNeutralForeground2 },
	meta: {
		display: "flex",
		flexDirection: "column",
		gap: B.spacingVerticalXXS,
		minWidth: 0
	},
	label: { color: B.colorNeutralForeground2 },
	caption: { color: B.colorNeutralForeground3 }
}), qc = {
	48: "size48",
	68: "size68",
	80: "size80",
	96: "size96",
	112: "size112"
};
function Jc({ value: e, unit: t, label: n, caption: r, size: i = 48, className: a, style: o }) {
	let s = Kc(), c = s[qc[i] ?? "size48"];
	return /* @__PURE__ */ (0, j.jsxs)("div", {
		className: T(s.root, a),
		style: o,
		children: [/* @__PURE__ */ (0, j.jsxs)("div", {
			className: s.valueRow,
			children: [/* @__PURE__ */ (0, j.jsx)("span", {
				className: T(s.value, c),
				children: e
			}), t ? /* @__PURE__ */ (0, j.jsx)(qs, {
				size: 300,
				className: s.unit,
				children: t
			}) : null]
		}), n || r ? /* @__PURE__ */ (0, j.jsxs)("div", {
			className: s.meta,
			children: [n ? /* @__PURE__ */ (0, j.jsx)(qs, {
				size: 300,
				className: s.label,
				children: n
			}) : null, r ? /* @__PURE__ */ (0, j.jsx)(qs, {
				size: 200,
				className: s.caption,
				children: r
			}) : null]
		}) : null]
	});
}
var Yc = Xn({
	row: {
		display: "flex",
		alignItems: "center",
		gap: B.spacingHorizontalS,
		width: "100%",
		minHeight: `${Fc}px`,
		boxSizing: "border-box",
		paddingInline: 0,
		border: "none",
		background: "transparent",
		color: B.colorNeutralForeground1,
		fontFamily: B.fontFamilyBase,
		textAlign: "left",
		borderRadius: B.borderRadiusMedium
	},
	interactive: {
		cursor: "pointer",
		":hover": { backgroundColor: B.colorNeutralBackground1Hover },
		":active": { backgroundColor: B.colorNeutralBackground1Pressed }
	},
	selected: { backgroundColor: B.colorNeutralBackground1Selected },
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
		gap: B.spacingVerticalXXS,
		minWidth: 0
	},
	title: {
		minWidth: 0,
		color: B.colorNeutralForeground1
	},
	subtitle: {
		minWidth: 0,
		color: B.colorNeutralForeground3
	},
	trailing: {
		display: "inline-flex",
		flexShrink: 0,
		alignItems: "center",
		gap: B.spacingHorizontalXS
	}
});
function Xc({ leading: e, title: t, subtitle: n, trailing: r, onClick: i, selected: a = !1, titleSize: o = 300, className: s, style: c, ...l }) {
	let u = Yc(), d = (e) => {
		i && (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && (e.preventDefault(), i(e));
	};
	return /* @__PURE__ */ (0, j.jsxs)("div", {
		...l,
		role: i ? "button" : void 0,
		tabIndex: i ? 0 : void 0,
		"aria-current": a ? "true" : void 0,
		"aria-pressed": i ? !!a : void 0,
		className: T(u.row, i && u.interactive, a && u.selected, s),
		style: c,
		"data-list-row": "true",
		"data-selected": a ? "true" : void 0,
		onClick: i,
		onKeyDown: d,
		children: [
			e ? /* @__PURE__ */ (0, j.jsx)("div", {
				className: u.leading,
				children: e
			}) : null,
			/* @__PURE__ */ (0, j.jsxs)("div", {
				className: u.main,
				children: [t ? /* @__PURE__ */ (0, j.jsx)(qs, {
					size: o,
					truncate: !0,
					wrap: !1,
					className: u.title,
					children: t
				}) : null, n ? /* @__PURE__ */ (0, j.jsx)(qs, {
					size: 200,
					truncate: !0,
					wrap: !1,
					className: u.subtitle,
					children: n
				}) : null]
			}),
			r ? /* @__PURE__ */ (0, j.jsx)("div", {
				className: u.trailing,
				children: r
			}) : null
		]
	});
}
var Zc = Xn({
	root: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: B.spacingVerticalS,
		padding: B.spacingVerticalXXL,
		textAlign: "center"
	},
	icon: {
		display: "inline-flex",
		color: B.colorNeutralForeground3
	},
	title: { color: B.colorNeutralForeground1 },
	description: {
		maxWidth: "42ch",
		color: B.colorNeutralForeground3
	},
	action: { marginTop: B.spacingVerticalS }
});
function Qc({ icon: e, title: t, description: n, action: r, className: i, style: a }) {
	let o = Zc();
	return /* @__PURE__ */ (0, j.jsxs)("div", {
		className: T(o.root, i),
		style: a,
		"data-empty-state": "true",
		children: [
			e ? /* @__PURE__ */ (0, j.jsx)("div", {
				className: o.icon,
				children: e
			}) : null,
			t ? /* @__PURE__ */ (0, j.jsx)(qs, {
				size: 400,
				weight: "semibold",
				className: o.title,
				children: t
			}) : null,
			n ? /* @__PURE__ */ (0, j.jsx)(qs, {
				size: 300,
				className: o.description,
				children: n
			}) : null,
			r ? /* @__PURE__ */ (0, j.jsx)("div", {
				className: o.action,
				children: r
			}) : null
		]
	});
}
var $c = Xn({ button: {
	minWidth: `${Pc}px`,
	minHeight: `${Pc}px`
} }), el = (0, A.forwardRef)(function({ appearance: e = "secondary", className: t, style: n, children: r, ...i }, a) {
	let o = $c();
	return /* @__PURE__ */ (0, j.jsx)(Vs, {
		...i,
		ref: a,
		type: "button",
		appearance: e,
		size: "large",
		className: T(o.button, t),
		style: n,
		children: r
	});
}), tl = el, nl = Xn({ root: {
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
	color: B.colorNeutralForeground1,
	fontFamily: B.fontFamilyBase
} });
function rl({ children: e, className: t, style: n }) {
	let r = nl();
	return /* @__PURE__ */ (0, j.jsx)("div", {
		className: T(r.root, t),
		style: n,
		"data-detail-page": "true",
		children: e
	});
}
var il = Xn({
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "space-between",
		gap: B.spacingHorizontalM,
		minHeight: `${Ic}px`,
		paddingInline: B.spacingHorizontalXXL,
		boxSizing: "border-box"
	},
	leading: {
		display: "flex",
		flex: 1,
		alignItems: "center",
		gap: B.spacingHorizontalM,
		minWidth: 0
	},
	trailing: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: B.spacingHorizontalS
	}
});
function al({ children: e, trailing: t, className: n, style: r }) {
	let i = il();
	return /* @__PURE__ */ (0, j.jsxs)("div", {
		className: T(i.header, n),
		style: r,
		"data-detail-header": "true",
		children: [/* @__PURE__ */ (0, j.jsx)("div", {
			className: i.leading,
			children: e
		}), t ? /* @__PURE__ */ (0, j.jsx)("div", {
			className: i.trailing,
			children: t
		}) : null]
	});
}
var ol = Xn({ toolbar: {
	display: "flex",
	flexShrink: 0,
	alignItems: "center",
	gap: B.spacingHorizontalS,
	minHeight: `${Lc}px`,
	paddingInline: B.spacingHorizontalXXL,
	boxSizing: "border-box"
} });
function sl({ children: e, className: t, style: n }) {
	let r = ol();
	return /* @__PURE__ */ (0, j.jsx)("div", {
		className: T(r.toolbar, t),
		style: n,
		"data-detail-toolbar": "true",
		children: e
	});
}
Xn({
	tabs: {
		flexShrink: 0,
		height: `${Rc}px`,
		minHeight: `${Rc}px`,
		paddingInline: B.spacingHorizontalXXL,
		boxSizing: "border-box",
		overflowX: "auto"
	},
	tab: {
		height: `${Rc}px`,
		minHeight: `${Rc}px`,
		paddingBlock: 0
	},
	badge: { marginInlineStart: B.spacingHorizontalXS }
});
var cl = Xn({
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
		paddingBlock: B.spacingVerticalXXL,
		paddingInline: B.spacingHorizontalXXL,
		boxSizing: "border-box",
		overscrollBehavior: "contain",
		scrollbarWidth: "thin"
	},
	scrollShadow: {
		position: "absolute",
		right: 0,
		bottom: 0,
		left: 0,
		height: B.spacingVerticalXXL,
		pointerEvents: "none",
		background: `linear-gradient(to top, ${B.colorNeutralBackground1} 0%, color-mix(in srgb, ${B.colorNeutralBackground1} 72%, transparent) 55%, transparent 100%)`,
		opacity: 0
	},
	scrollShadowVisible: { opacity: 1 }
});
function ll(e) {
	let [t, n] = (0, A.useState)(!1);
	return (0, A.useEffect)(() => {
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
function ul({ children: e, className: t, style: n }) {
	let r = cl(), i = (0, A.useRef)(null), a = ll(i);
	return /* @__PURE__ */ (0, j.jsxs)("div", {
		className: r.wrap,
		"data-scroll-more": a ? "true" : "false",
		children: [/* @__PURE__ */ (0, j.jsx)("div", {
			ref: i,
			className: T(r.scroll, t),
			style: n,
			"data-detail-scroll": "true",
			children: e
		}), /* @__PURE__ */ (0, j.jsx)("div", {
			"aria-hidden": "true",
			"data-scroll-shadow": a ? "visible" : "hidden",
			className: T(r.scrollShadow, a && r.scrollShadowVisible)
		})]
	});
}
(0, A.createContext)(null), Xn({
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
		backgroundColor: B.colorNeutralBackground1,
		color: B.colorNeutralForeground1,
		fontFamily: B.fontFamilyBase
	},
	header: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: B.spacingHorizontalS,
		minHeight: `${zc}px`,
		paddingInline: B.spacingHorizontalXXL,
		boxSizing: "border-box"
	},
	title: {
		flex: 1,
		minWidth: 0,
		color: B.colorNeutralForeground1
	},
	trailing: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: B.spacingHorizontalS
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
		paddingBlock: B.spacingVerticalXXL,
		paddingInline: B.spacingHorizontalXXL,
		boxSizing: "border-box",
		overscrollBehavior: "contain",
		scrollbarWidth: "thin"
	},
	scrollShadow: {
		position: "absolute",
		right: 0,
		bottom: 0,
		left: 0,
		height: B.spacingVerticalXXL,
		pointerEvents: "none",
		background: `linear-gradient(to top, ${B.colorNeutralBackground1} 0%, color-mix(in srgb, ${B.colorNeutralBackground1} 72%, transparent) 55%, transparent 100%)`,
		opacity: 0
	},
	scrollShadowVisible: { opacity: 1 },
	footer: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "flex-end",
		gap: B.spacingHorizontalS,
		paddingBlock: B.spacingVerticalM,
		paddingInline: B.spacingHorizontalXXL,
		boxSizing: "border-box"
	}
});
function dl(e = 1e3) {
	let [t, n] = (0, A.useState)(() => Date.now()), [r, i] = (0, A.useState)(() => typeof document > "u" || !document.hidden);
	return (0, A.useEffect)(() => {
		if (typeof document > "u") return;
		let e = () => i(!document.hidden);
		return document.addEventListener("visibilitychange", e), () => document.removeEventListener("visibilitychange", e);
	}, []), (0, A.useEffect)(() => {
		if (!r) return;
		n(Date.now());
		let t = window.setInterval(() => n(Date.now()), Math.max(1, e));
		return () => window.clearInterval(t);
	}, [e, r]), t;
}
//#endregion
//#region public/plugins/sedentary/src/data/engine.js
var fl = "settings", pl = "sedentary.days", ml = "sedentary.runtime", hl = "sedentary.command", gl = 1e4, _l = 500, W = 5, vl = 400, yl = 7, bl = "wtsl.sedentary.engine", xl = "sedentary:command", Sl = Object.freeze({
	enabled: !0,
	thresholdMin: 45,
	remindEveryMin: 10,
	strongReminder: !0
}), Cl = {
	thresholdMin: [5, 120],
	remindEveryMin: [1, 60]
}, wl = {
	success: "久坐中",
	warning: "接近提醒",
	danger: "该起身了",
	resting: "休息中",
	off: "已关闭"
}, Tl = {
	sitting: "坐着",
	standing: "站立"
}, El = /^\d{4}-\d{2}-\d{2}$/, Dl = (e) => String(e).padStart(2, "0");
function Ol(e) {
	return `${e.getFullYear()}-${Dl(e.getMonth() + 1)}-${Dl(e.getDate())}`;
}
function kl(e) {
	return `${Ol(e)}T${Dl(e.getHours())}:${Dl(e.getMinutes())}`;
}
function Al(e) {
	return !(e instanceof Date) || Number.isNaN(e.getTime()) ? "—" : `${Dl(e.getHours())}:${Dl(e.getMinutes())}`;
}
function jl(e) {
	if (typeof e != "string") return null;
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? null : t;
}
function Ml(e) {
	let t = new Date(e);
	return t.setHours(0, 0, 0, 0), t;
}
function Nl(e, t) {
	try {
		let n = localStorage.getItem(e);
		return n == null ? t : JSON.parse(n);
	} catch {
		return t;
	}
}
function Pl(e, t) {
	try {
		localStorage.setItem(e, JSON.stringify(t));
	} catch {}
}
function Fl(e, [t, n], r) {
	let i = Math.round(Number(e));
	return Number.isFinite(i) ? Math.min(n, Math.max(t, i)) : r;
}
function Il(e) {
	let t = Number(e);
	return Number.isFinite(t) && t > 0 ? t : 0;
}
function Ll(e) {
	return Math.round(e * 10) / 10;
}
function Rl(e) {
	let t = e && typeof e == "object" && !Array.isArray(e) ? e : {};
	return {
		enabled: typeof t.enabled == "boolean" ? t.enabled : Sl.enabled,
		thresholdMin: Fl(t.thresholdMin ?? Sl.thresholdMin, Cl.thresholdMin, Sl.thresholdMin),
		remindEveryMin: Fl(t.remindEveryMin ?? Sl.remindEveryMin, Cl.remindEveryMin, Sl.remindEveryMin),
		strongReminder: typeof t.strongReminder == "boolean" ? t.strongReminder : Sl.strongReminder
	};
}
async function zl() {
	let t = null;
	try {
		t = await e.getConfig(fl);
	} catch {
		t = null;
	}
	return Rl(t);
}
function Bl(e) {
	let t = e && typeof e == "object" && !Array.isArray(e) ? e : {}, n = {};
	typeof t.enabled == "boolean" && (n.enabled = t.enabled), typeof t.strongReminder == "boolean" && (n.strongReminder = t.strongReminder);
	for (let e of Object.keys(Cl)) typeof t[e] == "number" && Number.isFinite(t[e]) && (n[e] = t[e]);
	return n;
}
function Vl(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return {};
	let t = { ...e };
	return delete t.quietHours, t;
}
async function Hl() {
	let t = null;
	try {
		t = await e.getConfig(fl);
	} catch {
		return null;
	}
	if (!t || typeof t != "object" || Array.isArray(t)) return null;
	let n = {
		...Vl(t),
		...Rl(t)
	};
	if (JSON.stringify(n) === JSON.stringify(t)) return n;
	try {
		await e.setConfig(fl, n);
	} catch {
		return n;
	}
	return n;
}
async function Ul(t) {
	let n = null;
	try {
		n = await e.getConfig(fl);
	} catch {
		n = null;
	}
	let r = Rl({
		...Rl(n),
		...Bl(t)
	}), i = {
		...Vl(n),
		...r
	};
	try {
		await e.setConfig(fl, i);
	} catch {}
	return r;
}
function Wl(e, t) {
	let n = t && typeof t == "object" ? t : {};
	return {
		date: e,
		sittingMinutes: Il(n.sittingMinutes),
		standingMinutes: Il(n.standingMinutes),
		longestStreakMin: Il(n.longestStreakMin),
		breaks: Math.round(Il(n.breaks))
	};
}
function Gl(e) {
	return {
		date: e,
		sittingMinutes: 0,
		standingMinutes: 0,
		longestStreakMin: 0,
		breaks: 0
	};
}
function Kl(e, t) {
	return e[t] || (e[t] = Gl(t)), e[t];
}
function ql() {
	let e = Nl(pl, null), t = Array.isArray(e) ? e.reduce((e, t) => {
		let n = t && typeof t.date == "string" ? t.date : null;
		return n && (e[n] = t), e;
	}, {}) : e && typeof e == "object" ? e : {}, n = {};
	for (let [e, r] of Object.entries(t)) El.test(e) && (n[e] = Wl(e, r));
	return n;
}
function Jl(e) {
	Pl(pl, e);
}
function Yl() {
	let e = Nl(ml, null), t = e && typeof e == "object" && !Array.isArray(e) ? e : {}, n = typeof t.sittingSince == "string" ? t.sittingSince : null, r = t.posture === "sitting" || t.posture === "standing" ? t.posture : n ? "sitting" : null, i = typeof t.postureSince == "string" ? t.postureSince : r === "sitting" ? n : null;
	return {
		posture: r,
		postureSince: jl(i) ? i : null,
		lastRemindAt: typeof t.lastRemindAt == "string" ? t.lastRemindAt : null,
		lastRemindMinute: typeof t.lastRemindMinute == "string" ? t.lastRemindMinute : null,
		snoozedUntil: typeof t.snoozedUntil == "string" ? t.snoozedUntil : null,
		lastTickAt: typeof t.lastTickAt == "string" ? t.lastTickAt : null,
		lastBreakAt: typeof t.lastBreakAt == "string" ? t.lastBreakAt : null,
		commandId: typeof t.commandId == "string" ? t.commandId : null
	};
}
function Xl(e) {
	Pl(ml, e);
}
function Zl(e) {
	let t = Object.keys(e).sort();
	if (t.length <= vl) return e;
	let n = new Set(t.slice(-400)), r = {};
	for (let i of t) n.has(i) && (r[i] = e[i]);
	return r;
}
function Ql(e, t, n, r) {
	if (!(t instanceof Date) || !(n instanceof Date) || n.getTime() <= t.getTime()) return;
	let i = t;
	for (; i.getTime() < n.getTime();) {
		let t = Ol(i), a = new Date(i.getFullYear(), i.getMonth(), i.getDate() + 1), o = a.getTime() < n.getTime() ? a : n, s = (o.getTime() - i.getTime()) / 6e4;
		if (s > 0) {
			let n = Kl(e, t);
			r === "sitting" ? n.sittingMinutes += s : r === "standing" && (n.standingMinutes += s);
		}
		i = o;
	}
}
function $l(e, t, n, r) {
	if (t !== "sitting" || !(n instanceof Date)) return;
	let i = Math.max(0, (r.getTime() - n.getTime()) / 6e4);
	if (i <= 0) return;
	let a = Kl(e, Ol(r));
	i > a.longestStreakMin && (a.longestStreakMin = Math.round(i));
}
function eu(e, t = Date.now()) {
	let n = jl(e.postureSince);
	return !n || !e.posture ? 0 : Math.max(0, (t - n.getTime()) / 6e4);
}
function tu(e, t = Date.now()) {
	return e.posture === "sitting" ? eu(e, t) : 0;
}
function nu(e = /* @__PURE__ */ new Date()) {
	let t = Ol(e);
	return ql()[t] ?? Gl(t);
}
function ru(e, t, n = /* @__PURE__ */ new Date()) {
	if (!e.enabled) return "off";
	if (t.posture === "standing") return "resting";
	let r = tu(t, n.getTime());
	return r >= e.thresholdMin ? "danger" : r >= e.thresholdMin * .6 ? "warning" : "success";
}
function iu(e) {
	return wl[e] ?? wl.success;
}
function G(e, t, n = /* @__PURE__ */ new Date()) {
	let r = ru(e, t, n);
	if (r === "off") return "久坐提醒已关闭";
	if (r === "resting") return "";
	let i = jl(t.snoozedUntil);
	if (i && i > n) return `提醒已推迟到 ${Al(i)}`;
	if (!t.posture) return "";
	let a = e.thresholdMin - tu(t, n.getTime());
	return a <= 0 ? "该起身了" : `距提醒还有 ${Math.max(1, Math.ceil(a))} 分钟`;
}
function au(e, t, n = /* @__PURE__ */ new Date()) {
	if (!e.enabled || t.posture !== "sitting") return !1;
	let r = jl(t.snoozedUntil);
	return r && r > n ? !1 : tu(t, n.getTime()) >= e.thresholdMin;
}
function ou(e, t) {
	if (t === 0) return "今天";
	if (t === 1) return "昨天";
	let n = "日一二三四五六"[e.getDay()];
	return `${e.getMonth() + 1}月${e.getDate()}日 周${n}`;
}
function su(e = ql(), t = /* @__PURE__ */ new Date()) {
	let n = [];
	for (let r = 0; r < yl; r += 1) {
		let i = new Date(t.getFullYear(), t.getMonth(), t.getDate() - r), a = Ol(i), o = e[a] ?? Gl(a);
		n.push({
			...o,
			label: ou(i, r)
		});
	}
	return n;
}
function cu(e, t, n = /* @__PURE__ */ new Date()) {
	return eu(e, n.getTime()) > 0 || t.sittingMinutes > 0 || t.standingMinutes > 0 || t.breaks > 0 || !!jl(e.lastBreakAt);
}
function lu(e, t = /* @__PURE__ */ new Date()) {
	let n = Yl(), r = ql(), i = r[Ol(t)] ?? Gl(Ol(t)), a = ru(e, n, t), o = e.enabled ? n.posture : null, s = o ? eu(n, t.getTime()) : 0, c = jl(n.lastBreakAt);
	return {
		runtime: n,
		today: i,
		posture: o,
		postureLabel: o ? Tl[o] : "",
		status: a,
		statusLabel: iu(a),
		currentMin: Math.floor(s),
		stateMinutes: s,
		hint: G(e, n, t),
		lastBreakText: c ? Al(c) : "—",
		snoozable: au(e, n, t),
		hasData: cu(n, i, t),
		recentDays: su(r, t)
	};
}
function uu(e, t = /* @__PURE__ */ new Date()) {
	let n = Yl(), r = nu(t), i = e.enabled ? n.posture : null, a = i ? eu(n, t.getTime()) : 0, o = tu(n, t.getTime());
	return {
		enabled: e.enabled,
		posture: i,
		postureLabel: i ? Tl[i] : "未开始",
		status: ru(e, n, t),
		statusLabel: iu(ru(e, n, t)),
		currentStateMin: Math.round(a),
		currentStreakMin: Math.round(o),
		sittingMinutesToday: Ll(r.sittingMinutes),
		standingMinutesToday: Ll(r.standingMinutes),
		breaksToday: r.breaks,
		thresholdMin: e.thresholdMin,
		nextReminderMin: e.enabled && i === "sitting" ? Math.max(0, e.thresholdMin - Math.round(o)) : null,
		snoozable: au(e, n, t),
		snoozedUntil: n.snoozedUntil,
		lastBreakAt: n.lastBreakAt,
		hint: G(e, n, t)
	};
}
function du(e = /* @__PURE__ */ new Date()) {
	let t = ql(), n = Yl(), r = t[Ol(e)] ?? Gl(Ol(e));
	return {
		...r,
		sittingMinutes: Ll(r.sittingMinutes),
		standingMinutes: Ll(r.standingMinutes),
		lastBreakAt: n.lastBreakAt,
		recentDays: su(t, e)
	};
}
function fu(e = ql(), t = "today", n = /* @__PURE__ */ new Date(), r, i) {
	let a = jl(i) ?? n, o = jl(r);
	if (!o) {
		if (t === "week") {
			let e = Ml(n), t = (e.getDay() + 6) % 7;
			e.setDate(e.getDate() - t), o = e;
		} else o = t === "month" ? new Date(n.getFullYear(), n.getMonth(), 1) : Ml(n);
	}
	let s = Ol(o), c = Ol(a), l = 0, u = 0, d = 0, f = 0, p = {};
	for (let [t, n] of Object.entries(e)) {
		if (t < s || t > c) continue;
		let e = Wl(t, n);
		l += e.sittingMinutes, u += e.standingMinutes, d += e.breaks, e.longestStreakMin > f && (f = e.longestStreakMin), e.breaks > 0 && (p[t] = e.breaks);
	}
	return {
		range: t,
		from: o.toISOString(),
		to: a.toISOString(),
		completed: d,
		breaks: d,
		sittingMinutes: Ll(l),
		standingMinutes: Ll(u),
		longestStreakMin: Math.round(f),
		byDay: p
	};
}
function pu(e, t = {}) {
	let n = {
		id: `cmd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
		type: e,
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t
	};
	return Pl(hl, n), window.dispatchEvent(new CustomEvent(xl, { detail: n })), n;
}
function mu() {
	return pu("stand");
}
function hu() {
	return pu("sit");
}
function gu(e = 5) {
	return pu("snooze", { minutes: e });
}
function _u(e) {
	let t = (t) => e(t.detail);
	return window.addEventListener(xl, t), () => window.removeEventListener(xl, t);
}
function vu() {
	if (typeof navigator > "u") return null;
	let e = navigator.locks;
	return e && typeof e.request == "function" ? e : null;
}
async function yu(e) {
	let t = vu();
	if (!t) return e();
	let n = !1;
	try {
		return await t.request(bl, { ifAvailable: !0 }, async (t) => {
			if (t) return n = !0, e();
		});
	} catch (t) {
		if (n) throw t;
		return e();
	}
}
async function K(e) {
	let t = vu();
	if (!t) return e();
	let n = !1;
	try {
		return await t.request(bl, async () => (n = !0, e()));
	} catch (t) {
		if (n) throw t;
		return e();
	}
}
var bu = class {
	constructor() {
		this.running = !1, this.ticking = !1, this.timer = 0, this.firstTimer = 0, this.disposers = [];
	}
	start() {
		this.running || (this.running = !0, this.disposers.push(this.#e()), this.firstTimer = window.setTimeout(() => void this.tick(), _l), this.timer = window.setInterval(() => void this.tick(), gl));
	}
	stop() {
		this.running = !1, window.clearTimeout(this.firstTimer), window.clearInterval(this.timer);
		for (let e of this.disposers.splice(0)) e();
	}
	#e() {
		let e = (e) => {
			if (e.key !== "sedentary.command") return;
			let t = Nl(hl, null);
			t && this.handleCommand(t);
		};
		window.addEventListener("storage", e);
		let t = _u((e) => void this.handleCommand(e));
		return () => {
			window.removeEventListener("storage", e), t();
		};
	}
	async handleCommand(e) {
		if (!e) return;
		let t = e.type === "break" ? "stand" : e.type;
		if (t === "stand" || t === "sit" || t === "snooze") try {
			await K(() => this.#t({
				...e,
				type: t
			}));
		} catch (e) {
			console.warn("[sedentary] 命令执行失败", e);
		}
	}
	#t(e) {
		let t = Yl();
		t.commandId !== e.id && (t.commandId = e.id, Xl(t), e.type === "snooze" ? this.#n(e.minutes) : e.type === "sit" ? this.#s("manual") : this.#o("manual"));
	}
	async standUp(e = "manual") {
		return K(() => this.#o(e));
	}
	async sitDown(e = "manual") {
		return K(() => this.#s(e));
	}
	async snooze(e = 5) {
		return K(() => this.#n(e));
	}
	#n(e) {
		let t = Fl(e, [1, 60], 5), n = Yl();
		return n.posture === "sitting" ? (n.snoozedUntil = new Date(Date.now() + t * 6e4).toISOString(), n.lastRemindAt = null, n.lastRemindMinute = null, Xl(n), {
			minutes: t,
			snoozedUntil: n.snoozedUntil
		}) : null;
	}
	async tick() {
		if (this.running && !this.ticking) {
			this.ticking = !0;
			try {
				let e = await yu(() => this.#r());
				e?.remind && await this.#a(e.minutes, e.settings);
			} catch (e) {
				console.warn("[sedentary] tick 失败", e);
			} finally {
				this.ticking = !1;
			}
		}
	}
	#r() {
		let e = /* @__PURE__ */ new Date(), t = Yl(), n = ql();
		return zl().then((r) => {
			if (!r.enabled) return t.posture = null, t.postureSince = null, t.lastRemindAt = null, t.lastRemindMinute = null, t.snoozedUntil = null, t.lastTickAt = e.toISOString(), Xl(t), Jl(Zl(n)), null;
			let i = jl(t.lastTickAt), a = i ? Math.max(0, (e - i) / 6e4) : 0;
			if (i && a > W) {
				let r = jl(t.postureSince);
				return r && (t.postureSince = new Date(r.getTime() + (e.getTime() - i.getTime())).toISOString()), t.lastTickAt = e.toISOString(), Xl(t), Jl(Zl(n)), null;
			}
			t.posture || (t.posture = "sitting", t.postureSince = e.toISOString());
			let o = jl(t.postureSince);
			Ql(n, i ?? o ?? e, e, t.posture), $l(n, t.posture, o, e), t.lastTickAt = e.toISOString();
			let s = null;
			if (t.posture === "sitting") {
				let n = tu(t, e.getTime());
				s = this.#i(e, n, r, t);
			}
			return Xl(t), Jl(Zl(n)), s;
		});
	}
	#i(e, t, n, r) {
		if (t < n.thresholdMin) return null;
		let i = jl(r.snoozedUntil);
		if (i && i > e) return null;
		let a = kl(e);
		if (r.lastRemindMinute === a) return null;
		let o = jl(r.lastRemindAt), s = Math.max(1, n.remindEveryMin) * 6e4;
		return !o || e.getTime() - o.getTime() >= s ? (r.lastRemindAt = e.toISOString(), r.lastRemindMinute = a, r.snoozedUntil = null, {
			remind: !0,
			minutes: Math.round(t),
			settings: n
		}) : null;
	}
	async #a(t, n) {
		if (!n.strongReminder) {
			e.notify(`已连续坐 ${t} 分钟`);
			return;
		}
		let r = null;
		try {
			r = await e.showReminder({
				title: "该起来动一动了",
				message: `已连续坐 ${t} 分钟。`,
				actions: [{
					id: "stand",
					text: "我站起来了",
					kind: "primary"
				}, {
					id: "snooze",
					text: "稍后 5 分钟"
				}],
				autoDismissSec: 30
			});
		} catch {
			r = null;
		}
		let i = r && typeof r == "object" ? r.actionId : void 0;
		i === "stand" ? await this.standUp("reminder") : i === "snooze" && await this.snooze(5);
	}
	#o(e) {
		let t = /* @__PURE__ */ new Date(), n = Ol(t), r = ql(), i = Yl(), a = Kl(r, n);
		if (i.posture !== "sitting") return Jl(Zl(r)), {
			changed: !1,
			day: a,
			source: e
		};
		let o = jl(i.postureSince), s = jl(i.lastTickAt);
		return Ql(r, s && o && s > o ? s : o ?? s ?? t, t, "sitting"), $l(r, "sitting", o, t), a.breaks += 1, i.posture = "standing", i.postureSince = t.toISOString(), i.lastRemindAt = null, i.lastRemindMinute = null, i.snoozedUntil = null, i.lastBreakAt = t.toISOString(), i.lastTickAt = t.toISOString(), Xl(i), Jl(Zl(r)), {
			changed: !0,
			day: a,
			source: e
		};
	}
	#s(e) {
		let t = /* @__PURE__ */ new Date(), n = Ol(t), r = ql(), i = Yl(), a = Kl(r, n);
		if (i.posture !== "standing") return Jl(Zl(r)), {
			changed: !1,
			day: a,
			source: e
		};
		let o = jl(i.postureSince), s = jl(i.lastTickAt);
		return Ql(r, s && o && s > o ? s : o ?? s ?? t, t, "standing"), i.posture = "sitting", i.postureSince = t.toISOString(), i.lastRemindAt = null, i.lastRemindMinute = null, i.snoozedUntil = null, i.lastTickAt = t.toISOString(), Xl(i), Jl(Zl(r)), {
			changed: !0,
			day: a,
			source: e
		};
	}
};
async function xu() {
	let t = /* @__PURE__ */ new Date(), n = Nl(pl, null);
	if (!n || Object.keys(n).length === 0) {
		let e = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1);
		Jl({
			[Ol(t)]: {
				date: Ol(t),
				sittingMinutes: 187,
				standingMinutes: 24,
				longestStreakMin: 52,
				breaks: 3
			},
			[Ol(e)]: {
				date: Ol(e),
				sittingMinutes: 312,
				standingMinutes: 41,
				longestStreakMin: 96,
				breaks: 5
			}
		});
	}
	Xl({
		posture: "sitting",
		postureSince: (/* @__PURE__ */ new Date(t.getTime() - 72e4)).toISOString(),
		lastRemindAt: null,
		lastRemindMinute: null,
		snoozedUntil: null,
		lastTickAt: t.toISOString(),
		lastBreakAt: (/* @__PURE__ */ new Date(t.getTime() - 576e4)).toISOString(),
		commandId: null
	});
	let r = `plugin.${e.pluginId}.${fl}`;
	Nl(r, null) ?? Pl(r, { ...Sl });
}
var Su = null;
function Cu() {
	return Su ??= new bu(), Su;
}
//#endregion
//#region public/plugins/sedentary/src/useSedentaryState.js
function wu(e) {
	let t = dl(1e3), [, n] = (0, A.useReducer)((e) => e + 1, 0);
	return (0, A.useEffect)(() => {
		let e = (e) => {
			(e.key === null || e.key === "sedentary.days" || e.key === "sedentary.runtime") && n();
		};
		return window.addEventListener("storage", e), () => window.removeEventListener("storage", e);
	}, []), (0, A.useMemo)(() => lu(e, new Date(t)), [e, t]);
}
//#endregion
//#region public/plugins/sedentary/src/sizes.js
var Tu = {
	"1x1": [1, 1],
	"2x1": [2, 1],
	"2x2": [2, 2],
	"3x2": [3, 2]
};
function Eu(e) {
	if (!Array.isArray(e) || e.length < 2) return "2x1";
	let t = `${Number(e[0])}x${Number(e[1])}`;
	return Tu[t] ? t : "2x1";
}
function Du() {
	let e = new URLSearchParams(location.search).get("size"), t = /^(\d+)x(\d+)$/.exec(e || "");
	if (!t) return null;
	let n = `${Number(t[1])}x${Number(t[2])}`;
	return Tu[n] ? n : null;
}
//#endregion
//#region public/plugins/sedentary/src/SedentaryApp.jsx
var Ou = {
	success: "success",
	warning: "warning",
	danger: "danger",
	resting: "informative",
	off: "subtle"
}, ku = {
	success: B.colorStatusSuccessForeground1,
	warning: B.colorStatusWarningForeground1,
	danger: B.colorStatusDangerForeground1,
	resting: B.colorBrandForeground1,
	off: B.colorNeutralForeground4
}, Au = Xn({
	root: {
		minWidth: 0,
		minHeight: 0,
		color: B.colorNeutralForeground1,
		userSelect: "none"
	},
	rootCompact: {
		alignItems: "center",
		justifyContent: "center",
		gap: B.spacingVerticalS,
		padding: B.spacingVerticalS
	},
	rootRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: B.spacingHorizontalS,
		padding: `${B.spacingVerticalS} ${B.spacingHorizontalM}`
	},
	rootMedium: {
		gap: B.spacingVerticalS,
		padding: B.spacingVerticalM
	},
	rootWide: {
		display: "grid",
		gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr) auto",
		alignItems: "center",
		columnGap: B.spacingHorizontalXL,
		rowGap: B.spacingVerticalS,
		padding: `${B.spacingVerticalM} ${B.spacingHorizontalL}`
	},
	rowMain: {
		display: "flex",
		flex: 1,
		flexDirection: "column",
		gap: B.spacingVerticalXS,
		minWidth: 0
	},
	rowHead: {
		display: "flex",
		alignItems: "center",
		flexWrap: "nowrap",
		whiteSpace: "nowrap",
		gap: B.spacingHorizontalS,
		minWidth: 0
	},
	hintRow: {
		display: "flex",
		alignItems: "center",
		gap: B.spacingHorizontalXS,
		minWidth: 0
	},
	statusDot: {
		flexShrink: 0,
		width: B.spacingHorizontalM,
		height: B.spacingHorizontalM,
		borderRadius: B.borderRadiusCircular
	},
	wideMain: {
		display: "flex",
		flexDirection: "column",
		gap: B.spacingVerticalXS,
		minWidth: 0
	},
	wideStats: {
		display: "flex",
		flexDirection: "column",
		gap: B.spacingVerticalM,
		minWidth: 0
	},
	wideActions: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end"
	},
	statsRow: {
		display: "flex",
		alignItems: "flex-start",
		gap: B.spacingHorizontalXL,
		minWidth: 0
	},
	stat: {
		display: "flex",
		flexDirection: "column",
		gap: B.spacingVerticalXXS,
		minWidth: 0
	},
	statValueRow: {
		display: "flex",
		alignItems: "baseline",
		gap: B.spacingHorizontalXS,
		minWidth: 0
	},
	statValue: {
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap"
	},
	statLabel: { color: B.colorNeutralForeground3 },
	hint: {
		minWidth: 0,
		color: B.colorNeutralForeground3,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap"
	},
	actions: {
		display: "flex",
		marginTop: "auto",
		alignItems: "center",
		gap: B.spacingHorizontalS
	}
});
function ju({ fallbackSizeKey: t }) {
	let n = Au(), r = sc(Eu, t || "2x1"), [i] = cc(fl, Sl, Rl), a = wu(i), o = Ac("normal"), s = r === "1x1", c = r === "2x1", l = r === "3x2";
	(0, A.useEffect)(() => {
		if (e.inHost) return;
		let t = Cu();
		return t.start(), () => t.stop();
	}, []);
	let u = (0, A.useCallback)(() => uc("detail", "久坐详情"), []), d = a.posture === "standing", f = (0, A.useCallback)((e) => {
		e.stopPropagation(), i.enabled && (d ? hu() : mu());
	}, [i.enabled, d]), p = a.postureLabel || "久坐提醒", m = i.enabled ? `${a.statusLabel}，${p} ${a.currentMin} 分钟；点击打开详情` : "久坐提醒已关闭；点击打开详情", h = /* @__PURE__ */ (0, j.jsx)(Ts, {
		appearance: "tint",
		color: Ou[a.status] ?? "informative",
		size: "large",
		"aria-label": `状态：${a.statusLabel}`,
		children: a.statusLabel
	}), g = a.status === "resting" ? null : h, _ = [
		{
			key: "sitting",
			label: "今日久坐",
			value: Math.round(a.today.sittingMinutes),
			unit: "分钟"
		},
		{
			key: "standing",
			label: "今日站立",
			value: Math.round(a.today.standingMinutes),
			unit: "分钟"
		},
		{
			key: "breaks",
			label: "起身次数",
			value: a.today.breaks,
			unit: "次"
		}
	], v = (e) => /* @__PURE__ */ (0, j.jsxs)("div", {
		className: n.stat,
		children: [/* @__PURE__ */ (0, j.jsx)(qs, {
			size: 200,
			className: n.statLabel,
			children: e.label
		}), /* @__PURE__ */ (0, j.jsxs)("div", {
			className: n.statValueRow,
			children: [/* @__PURE__ */ (0, j.jsx)(qs, {
				size: 500,
				weight: "semibold",
				className: n.statValue,
				children: e.value
			}), /* @__PURE__ */ (0, j.jsx)(qs, {
				size: 200,
				className: n.statLabel,
				children: e.unit
			})]
		})]
	}, e.key), y = /* @__PURE__ */ (0, j.jsx)(el, {
		appearance: "primary",
		icon: d ? /* @__PURE__ */ (0, j.jsx)(Vo, {}) : /* @__PURE__ */ (0, j.jsx)(Ho, {}),
		onClick: f,
		disabled: !i.enabled,
		"aria-label": d ? "我坐下了" : "我站起来了",
		children: d ? "我坐下了" : "我站起来了"
	}), b = d ? "休息中" : a.hint;
	return s ? /* @__PURE__ */ (0, j.jsxs)(Uc, {
		ariaLabel: m,
		onActivate: u,
		className: T(n.root, n.rootCompact),
		children: [h, /* @__PURE__ */ (0, j.jsx)(Jc, {
			value: a.currentMin,
			unit: "分钟",
			size: 48
		})]
	}) : c ? /* @__PURE__ */ (0, j.jsxs)(Uc, {
		ariaLabel: m,
		onActivate: u,
		className: T(n.root, n.rootRow),
		children: [/* @__PURE__ */ (0, j.jsxs)("div", {
			className: n.rowMain,
			children: [/* @__PURE__ */ (0, j.jsx)("div", {
				className: n.rowHead,
				children: /* @__PURE__ */ (0, j.jsx)(Jc, {
					value: a.currentMin,
					unit: "分钟",
					size: 68
				})
			}), /* @__PURE__ */ (0, j.jsxs)("div", {
				className: n.hintRow,
				children: [/* @__PURE__ */ (0, j.jsx)("span", {
					className: n.statusDot,
					style: { backgroundColor: ku[a.status] },
					"aria-hidden": "true"
				}), b ? /* @__PURE__ */ (0, j.jsx)(qs, {
					size: 300,
					className: n.hint,
					style: o,
					children: b
				}) : null]
			})]
		}), y]
	}) : l ? /* @__PURE__ */ (0, j.jsxs)(Uc, {
		ariaLabel: m,
		onActivate: u,
		className: T(n.root, n.rootWide),
		children: [
			/* @__PURE__ */ (0, j.jsxs)("div", {
				className: n.wideMain,
				children: [
					/* @__PURE__ */ (0, j.jsx)(Gc, {
						title: d ? "站立休息" : "连续久坐",
						trailing: g
					}),
					/* @__PURE__ */ (0, j.jsx)(Jc, {
						value: a.currentMin,
						unit: "分钟",
						size: 96
					}),
					a.hint ? /* @__PURE__ */ (0, j.jsx)(qs, {
						size: 300,
						className: n.hint,
						style: o,
						children: a.hint
					}) : null
				]
			}),
			/* @__PURE__ */ (0, j.jsx)("div", {
				className: n.wideStats,
				children: _.map(v)
			}),
			/* @__PURE__ */ (0, j.jsx)("div", {
				className: n.wideActions,
				children: y
			})
		]
	}) : /* @__PURE__ */ (0, j.jsxs)(Uc, {
		ariaLabel: m,
		onActivate: u,
		className: T(n.root, n.rootMedium),
		children: [
			/* @__PURE__ */ (0, j.jsx)(Gc, {
				title: d ? "站立休息" : "连续久坐",
				trailing: g
			}),
			/* @__PURE__ */ (0, j.jsx)(Jc, {
				value: a.currentMin,
				unit: "分钟",
				size: 80
			}),
			a.hint ? /* @__PURE__ */ (0, j.jsx)(qs, {
				size: 300,
				className: n.hint,
				style: o,
				children: a.hint
			}) : null,
			/* @__PURE__ */ (0, j.jsx)("div", {
				className: n.statsRow,
				children: _.slice(0, 2).map(v)
			}),
			/* @__PURE__ */ (0, j.jsx)("div", {
				className: n.actions,
				children: y
			})
		]
	});
}
//#endregion
//#region public/plugins/sedentary/src/SedentaryDetail.jsx
var Mu = Xn({
	headerText: {
		display: "flex",
		flexDirection: "column",
		gap: B.spacingVerticalXXS,
		minWidth: 0
	},
	muted: { color: B.colorNeutralForeground3 },
	content: {
		display: "flex",
		flexDirection: "column",
		gap: B.spacingVerticalXXL,
		minWidth: 0
	},
	section: {
		display: "flex",
		flexDirection: "column",
		gap: B.spacingVerticalM,
		minWidth: 0
	},
	statGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
		gap: B.spacingHorizontalL,
		"@media (max-width: 699px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }
	},
	stat: {
		display: "flex",
		flexDirection: "column",
		gap: B.spacingVerticalXXS,
		minWidth: 0
	},
	statValueRow: {
		display: "flex",
		alignItems: "baseline",
		gap: B.spacingHorizontalXS,
		minWidth: 0
	},
	statValue: {
		fontVariantNumeric: "tabular-nums",
		color: B.colorNeutralForeground1
	},
	days: {
		display: "flex",
		flexDirection: "column",
		gap: B.spacingVerticalXS,
		minWidth: 0
	},
	dayLabel: { color: B.colorNeutralForeground2 },
	emptyWrap: { minWidth: 0 }
});
function Nu({ label: e, value: t, unit: n }) {
	let r = Mu();
	return /* @__PURE__ */ (0, j.jsxs)("div", {
		className: r.stat,
		children: [/* @__PURE__ */ (0, j.jsx)(qs, {
			size: 200,
			className: r.muted,
			children: e
		}), /* @__PURE__ */ (0, j.jsxs)("div", {
			className: r.statValueRow,
			children: [/* @__PURE__ */ (0, j.jsx)(qs, {
				size: 600,
				weight: "semibold",
				className: r.statValue,
				children: t
			}), n ? /* @__PURE__ */ (0, j.jsx)(qs, {
				size: 200,
				className: r.muted,
				children: n
			}) : null]
		})]
	});
}
function Pu() {
	let e = Mu(), [t] = cc(fl, Sl, Rl), n = wu(t), r = n.posture === "standing", i = n.posture === "sitting", a = (0, A.useCallback)((e) => {
		e?.stopPropagation?.(), t.enabled && (r ? hu() : mu());
	}, [t.enabled, r]), o = (0, A.useCallback)((e) => {
		e?.stopPropagation?.(), gu();
	}, []), s = t.enabled ? i ? `连续久坐 ${n.currentMin} 分钟` : r ? `站立休息 ${n.currentMin} 分钟` : "久坐计时未开始" : "久坐提醒已关闭", c = t.enabled && i ? n.hint : "", l = /* @__PURE__ */ (0, j.jsx)(tl, {
		appearance: "primary",
		icon: r ? /* @__PURE__ */ (0, j.jsx)(Vo, {}) : /* @__PURE__ */ (0, j.jsx)(Ho, {}),
		onClick: a,
		disabled: !t.enabled,
		"aria-label": r ? "我坐下了" : "我站起来了",
		children: r ? "我坐下了" : "我站起来了"
	});
	return /* @__PURE__ */ (0, j.jsxs)(rl, { children: [
		/* @__PURE__ */ (0, j.jsx)(al, {
			trailing: /* @__PURE__ */ (0, j.jsx)(tl, {
				onClick: () => dc(),
				"aria-label": "打开久坐设置",
				children: "设置…"
			}),
			children: /* @__PURE__ */ (0, j.jsxs)("div", {
				className: e.headerText,
				children: [/* @__PURE__ */ (0, j.jsx)(qs, {
					size: 400,
					weight: "semibold",
					children: s
				}), c ? /* @__PURE__ */ (0, j.jsx)(qs, {
					size: 200,
					className: e.muted,
					children: c
				}) : null]
			})
		}),
		n.hasData ? /* @__PURE__ */ (0, j.jsxs)(sl, { children: [l, n.snoozable ? /* @__PURE__ */ (0, j.jsx)(tl, {
			onClick: o,
			children: "稍后 5 分钟"
		}) : null] }) : null,
		/* @__PURE__ */ (0, j.jsx)(ul, { children: /* @__PURE__ */ (0, j.jsx)(Dc, {
			value: n.hasData ? "data" : "empty",
			children: n.hasData ? /* @__PURE__ */ (0, j.jsxs)("div", {
				className: e.content,
				children: [/* @__PURE__ */ (0, j.jsxs)("section", {
					className: e.section,
					"aria-label": "今日统计",
					children: [/* @__PURE__ */ (0, j.jsx)(qs, {
						size: 400,
						weight: "semibold",
						children: "今日统计"
					}), /* @__PURE__ */ (0, j.jsxs)("div", {
						className: e.statGrid,
						children: [
							/* @__PURE__ */ (0, j.jsx)(Nu, {
								label: "今日久坐",
								value: Math.round(n.today.sittingMinutes),
								unit: "分钟"
							}),
							/* @__PURE__ */ (0, j.jsx)(Nu, {
								label: "今日站立",
								value: Math.round(n.today.standingMinutes),
								unit: "分钟"
							}),
							/* @__PURE__ */ (0, j.jsx)(Nu, {
								label: "起身次数",
								value: n.today.breaks,
								unit: "次"
							}),
							/* @__PURE__ */ (0, j.jsx)(Nu, {
								label: "最长连续坐",
								value: Math.round(n.today.longestStreakMin),
								unit: "分钟"
							})
						]
					})]
				}), /* @__PURE__ */ (0, j.jsxs)("section", {
					className: e.section,
					"aria-label": "最近 7 天",
					children: [/* @__PURE__ */ (0, j.jsx)(qs, {
						size: 400,
						weight: "semibold",
						children: "最近 7 天"
					}), /* @__PURE__ */ (0, j.jsx)("div", {
						className: e.days,
						children: n.recentDays.map((t) => /* @__PURE__ */ (0, j.jsx)(Xc, {
							title: /* @__PURE__ */ (0, j.jsx)("span", {
								className: e.dayLabel,
								children: t.label
							}),
							subtitle: `站立 ${Math.round(t.standingMinutes)} 分钟 · 起身 ${t.breaks} 次`,
							trailing: /* @__PURE__ */ (0, j.jsxs)(qs, {
								size: 400,
								weight: "semibold",
								className: e.statValue,
								children: [Math.round(t.sittingMinutes), " 分钟"]
							}),
							"aria-label": `${t.label}：久坐 ${Math.round(t.sittingMinutes)} 分钟，站立 ${Math.round(t.standingMinutes)} 分钟，起身 ${t.breaks} 次`
						}, t.date))
					})]
				})]
			}) : /* @__PURE__ */ (0, j.jsx)("div", {
				className: e.emptyWrap,
				children: /* @__PURE__ */ (0, j.jsx)(Qc, {
					icon: /* @__PURE__ */ (0, j.jsx)(V, {}),
					title: "还没有今天的记录",
					action: l
				})
			})
		}) })
	] });
}
//#endregion
//#region public/plugins/sedentary/src/main.jsx
ec();
var Fu = new URLSearchParams(location.search), Iu = lc(), Lu = Fu.get("background") === "1", Ru = Du(), zu = [
	{
		name: "sedentary.status",
		description: "读取久坐状态：当前姿态、当前状态持续分钟、今日久坐/站立分钟、起身次数、距离下次提醒时间",
		parameters: {
			type: "object",
			properties: {},
			additionalProperties: !1
		}
	},
	{
		name: "sedentary.today",
		description: "读取今日久坐/站立分钟、最长连续、起身次数与最近 7 天记录",
		parameters: {
			type: "object",
			properties: {},
			additionalProperties: !1
		}
	},
	{
		name: "sedentary.standUp",
		description: "用户说自己站起来了、离开座位或起身活动时调用：记录一次起身（坐着→站立），返回当前姿态与今日起身次数。",
		phrases: [
			"我站起来了",
			"站起来了",
			"我起身了",
			"我离开座位了"
		],
		parameters: {
			type: "object",
			properties: {},
			additionalProperties: !1
		}
	},
	{
		name: "sedentary.sitDown",
		description: "用户说自己坐下了、回到座位时调用：记录坐下（站立→坐着），返回当前姿态与今日久坐分钟。",
		phrases: [
			"我坐下了",
			"我坐下来了",
			"坐下了",
			"我回到座位了"
		],
		parameters: {
			type: "object",
			properties: {},
			additionalProperties: !1
		}
	},
	{
		name: "sedentary.snooze",
		description: "把久坐提醒推迟 5 分钟（坐着且已到阈值时）",
		parameters: {
			type: "object",
			properties: {},
			additionalProperties: !1
		}
	},
	{
		name: "sedentary.stats",
		description: "复盘用：按区间汇总久坐分钟、站立分钟、起身次数、最长连续坐与按天起身次数",
		parameters: {
			type: "object",
			properties: {
				range: {
					type: "string",
					enum: [
						"today",
						"week",
						"month"
					],
					description: "统计范围，默认 today"
				},
				from: {
					type: "string",
					description: "自定义开始时间（ISO），可选"
				},
				to: {
					type: "string",
					description: "自定义结束时间（ISO），可选"
				}
			},
			additionalProperties: !1
		}
	},
	{
		name: "sedentary.settings.get",
		description: "读取久坐提醒设置（与宿主设置页同一份配置）",
		parameters: {
			type: "object",
			properties: {},
			additionalProperties: !1
		}
	},
	{
		name: "sedentary.settings.set",
		description: "修改久坐提醒设置（只改传入的字段）：enabled、strongReminder、thresholdMin、remindEveryMin",
		parameters: {
			type: "object",
			properties: {
				enabled: {
					type: "boolean",
					description: "启用久坐提醒"
				},
				strongReminder: {
					type: "boolean",
					description: "全屏强提醒；false 时只发通知"
				},
				thresholdMin: {
					type: "number",
					minimum: 5,
					maximum: 120,
					description: "连续久坐多少分钟后提醒"
				},
				remindEveryMin: {
					type: "number",
					minimum: 1,
					maximum: 60,
					description: "提醒后仍未起身的再催间隔"
				}
			},
			additionalProperties: !1
		}
	}
];
function Bu(t = 2500) {
	return !e.inHost || tc() ? Promise.resolve() : new Promise((e) => {
		let n = Date.now(), r = window.setInterval(() => {
			(tc() || Date.now() - n > t) && (window.clearInterval(r), e());
		}, 30);
	});
}
function Vu() {
	return (0, A.useEffect)(() => {
		let e = Cu();
		return e.start(), Hl(), () => e.stop();
	}, []), _c(zu, {
		"sedentary.status": async () => uu(await zl()),
		"sedentary.today": () => du(),
		"sedentary.standUp": async () => {
			if (!(await zl()).enabled) throw Error("久坐提醒已关闭");
			let e = await Cu().standUp("agent");
			if (!e.changed) throw Error("当前已经是站立状态");
			return {
				posture: "standing",
				breaksToday: e.day.breaks
			};
		},
		"sedentary.sitDown": async () => {
			if (!(await zl()).enabled) throw Error("久坐提醒已关闭");
			let e = await Cu().sitDown("agent");
			if (!e.changed) throw Error("当前已经是坐着状态");
			return {
				posture: "sitting",
				sittingMinutesToday: Math.round(e.day.sittingMinutes * 10) / 10,
				breaksToday: e.day.breaks
			};
		},
		"sedentary.snooze": async () => {
			let e = await zl();
			if (!e.enabled) throw Error("久坐提醒已关闭");
			if (!lu(e).snoozable) throw Error("当前没有可推迟的提醒");
			let t = await Cu().snooze();
			if (!t) throw Error("当前不在久坐计时中");
			return {
				snoozedUntil: t.snoozedUntil,
				status: uu(e)
			};
		},
		"sedentary.stats": async (e = {}) => fu(ql(), e.range, /* @__PURE__ */ new Date(), e.from, e.to),
		"sedentary.settings.get": async () => ({ settings: await zl() }),
		"sedentary.settings.set": async (e) => ({ settings: await Ul(e) })
	}), null;
}
function Hu() {
	let { theme: t } = oc(), n = e.inHost ? "transparent" : t.colorNeutralBackground1, r = /* @__PURE__ */ (0, j.jsx)(ju, { fallbackSizeKey: Ru });
	return Lu ? r = /* @__PURE__ */ (0, j.jsx)(Vu, {}) : Iu === "detail" && (r = /* @__PURE__ */ (0, j.jsx)(Pu, {})), /* @__PURE__ */ (0, j.jsx)(To, {
		theme: t,
		style: {
			width: "100%",
			height: "100%",
			background: n,
			colorScheme: "normal"
		},
		children: r
	});
}
async function Uu() {
	let e = document.getElementById("root");
	e && (await Bu(), Fu.get("demo") === "1" && await xu(), (0, Js.createRoot)(e).render(/* @__PURE__ */ (0, j.jsx)(Hu, {})));
}
Uu();
//#endregion
