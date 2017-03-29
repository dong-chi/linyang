var requirejs, require, define;
(function (global) {
    var req, s, head, baseElement, dataMain, src, interactiveScript, currentlyAddingScript, mainScript, subPath, version = '2.1.11', commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm, cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g, jsSuffixRegExp = /\.js$/, currDirRegExp = /^\.\//, op = Object.prototype, ostring = op.toString, hasOwn = op.hasOwnProperty, ap = Array.prototype, apsp = ap.splice, isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document), isWebWorker = !isBrowser && typeof importScripts !== 'undefined', readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ? /^complete$/ : /^(complete|loaded)$/, defContextName = '_', isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]', contexts = {}, cfg = {}, globalDefQueue = [], useInteractive = false;
    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }
    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }
    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }
    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value === 'object' && value && !isArray(value) && !isFunction(value) && !(value instanceof RegExp)) {
                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }
    function scripts() {
        return document.getElementsByTagName('script');
    }
    function defaultOnError(err) {
        throw err;
    }
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }
    if (typeof define !== 'undefined') {
        return;
    }
    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }
    if (typeof require !== 'undefined' && !isFunction(require)) {
        cfg = require;
        require = undefined;
    }
    function newContext(contextName) {
        var inCheckLoaded, Module, context, handlers, checkLoadedTimeoutId, config = {
                waitSeconds: 7,
                baseUrl: './',
                paths: {},
                bundles: {},
                pkgs: {},
                shim: {},
                config: {}
            }, registry = {}, enabledRegistry = {}, undefEvents = {}, defQueue = [], defined = {}, urlFetched = {}, bundlesMap = {}, requireCounter = 1, unnormalizedCounter = 1;
        function trimDots(ary) {
            var i, part, length = ary.length;
            for (i = 0; i < length; i++) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                        break;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }
        function normalize(name, baseName, applyMap) {
            var pkgMain, mapValue, nameParts, i, j, nameSegment, lastIndex, foundMap, foundI, foundStarMap, starI, baseParts = baseName && baseName.split('/'), normalizedBaseParts = baseParts, map = config.map, starMap = map && map['*'];
            if (name && name.charAt(0) === '.') {
                if (baseName) {
                    normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                    name = name.split('/');
                    lastIndex = name.length - 1;
                    if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                        name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                    }
                    name = normalizedBaseParts.concat(name);
                    trimDots(name);
                    name = name.join('/');
                } else if (name.indexOf('./') === 0) {
                    name = name.substring(2);
                }
            }
            if (applyMap && map && (baseParts || starMap)) {
                nameParts = name.split('/');
                outerLoop:
                    for (i = nameParts.length; i > 0; i -= 1) {
                        nameSegment = nameParts.slice(0, i).join('/');
                        if (baseParts) {
                            for (j = baseParts.length; j > 0; j -= 1) {
                                mapValue = getOwn(map, baseParts.slice(0, j).join('/'));
                                if (mapValue) {
                                    mapValue = getOwn(mapValue, nameSegment);
                                    if (mapValue) {
                                        foundMap = mapValue;
                                        foundI = i;
                                        break outerLoop;
                                    }
                                }
                            }
                        }
                        if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
                            foundStarMap = getOwn(starMap, nameSegment);
                            starI = i;
                        }
                    }
                if (!foundMap && foundStarMap) {
                    foundMap = foundStarMap;
                    foundI = starI;
                }
                if (foundMap) {
                    nameParts.splice(0, foundI, foundMap);
                    name = nameParts.join('/');
                }
            }
            pkgMain = getOwn(config.pkgs, name);
            return pkgMain ? pkgMain : name;
        }
        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name && scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }
        function hasPathFallback(id) {
            var pathConfig = getOwn(config.paths, id);
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                pathConfig.shift();
                context.require.undef(id);
                context.require([id]);
                return true;
            }
        }
        function splitPrefix(name) {
            var prefix, index = name ? name.indexOf('!') : -1;
            if (index > -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            return [
                prefix,
                name
            ];
        }
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url, pluginModule, suffix, nameParts, prefix = null, parentName = parentModuleMap ? parentModuleMap.name : null, originalName = name, isDefine = true, normalizedName = '';
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }
            nameParts = splitPrefix(name);
            prefix = nameParts[0];
            name = nameParts[1];
            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = getOwn(defined, prefix);
            }
            if (name) {
                if (prefix) {
                    if (pluginModule && pluginModule.normalize) {
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    } else {
                        normalizedName = normalize(name, parentName, applyMap);
                    }
                } else {
                    normalizedName = normalize(name, parentName, applyMap);
                    nameParts = splitPrefix(normalizedName);
                    prefix = nameParts[0];
                    normalizedName = nameParts[1];
                    isNormalized = true;
                    url = context.nameToUrl(normalizedName);
                }
            }
            suffix = prefix && !pluginModule && !isNormalized ? '_unnormalized' + (unnormalizedCounter += 1) : '';
            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ? prefix + '!' + normalizedName : normalizedName) + suffix
            };
        }
        function getModule(depMap) {
            var id = depMap.id, mod = getOwn(registry, id);
            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }
            return mod;
        }
        function on(depMap, name, fn) {
            var id = depMap.id, mod = getOwn(registry, id);
            if (hasProp(defined, id) && (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id]);
                }
            } else {
                mod = getModule(depMap);
                if (mod.error && name === 'error') {
                    fn(mod.error);
                } else {
                    mod.on(name, fn);
                }
            }
        }
        function onError(err, errback) {
            var ids = err.requireModules, notified = false;
            if (errback) {
                errback(err);
            } else {
                each(ids, function (id) {
                    var mod = getOwn(registry, id);
                    if (mod) {
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });
                if (!notified) {
                    req.onError(err);
                }
            }
        }
        function takeGlobalQueue() {
            if (globalDefQueue.length) {
                apsp.apply(defQueue, [
                    defQueue.length,
                    0
                ].concat(globalDefQueue));
                globalDefQueue = [];
            }
        }
        handlers = {
            'require': function (mod) {
                if (mod.require) {
                    return mod.require;
                } else {
                    return mod.require = context.makeRequire(mod.map);
                }
            },
            'exports': function (mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    if (mod.exports) {
                        return defined[mod.map.id] = mod.exports;
                    } else {
                        return mod.exports = defined[mod.map.id] = {};
                    }
                }
            },
            'module': function (mod) {
                if (mod.module) {
                    return mod.module;
                } else {
                    return mod.module = {
                        id: mod.map.id,
                        uri: mod.map.url,
                        config: function () {
                            return getOwn(config.config, mod.map.id) || {};
                        },
                        exports: mod.exports || (mod.exports = {})
                    };
                }
            }
        };
        function cleanRegistry(id) {
            delete registry[id];
            delete enabledRegistry[id];
        }
        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;
            if (mod.error) {
                mod.emit('error', mod.error);
            } else {
                traced[id] = true;
                each(mod.depMaps, function (depMap, i) {
                    var depId = depMap.id, dep = getOwn(registry, depId);
                    if (dep && !mod.depMatched[i] && !processed[depId]) {
                        if (getOwn(traced, depId)) {
                            mod.defineDep(i, defined[depId]);
                            mod.check();
                        } else {
                            breakCycle(dep, traced, processed);
                        }
                    }
                });
                processed[id] = true;
            }
        }
        function checkLoaded() {
            var err, usingPathFallback, waitInterval = config.waitSeconds * 1000, expired = waitInterval && context.startTime + waitInterval < new Date().getTime(), noLoads = [], reqCalls = [], stillLoading = false, needCycleCheck = true;
            if (inCheckLoaded) {
                return;
            }
            inCheckLoaded = true;
            eachProp(enabledRegistry, function (mod) {
                var map = mod.map, modId = map.id;
                if (!mod.enabled) {
                    return;
                }
                if (!map.isDefine) {
                    reqCalls.push(mod);
                }
                if (!mod.error) {
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        } else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    } else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            return needCycleCheck = false;
                        }
                    }
                }
            });
            if (expired && noLoads.length) {
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }
            if (needCycleCheck) {
                each(reqCalls, function (mod) {
                    breakCycle(mod, {}, {});
                });
            }
            if ((!expired || usingPathFallback) && stillLoading) {
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }
            inCheckLoaded = false;
        }
        Module = function (map) {
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.shim = getOwn(config.shim, map.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;
        };
        Module.prototype = {
            init: function (depMaps, factory, errback, options) {
                options = options || {};
                if (this.inited) {
                    return;
                }
                this.factory = factory;
                if (errback) {
                    this.on('error', errback);
                } else if (this.events.error) {
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }
                this.depMaps = depMaps && depMaps.slice(0);
                this.errback = errback;
                this.inited = true;
                this.ignore = options.ignore;
                if (options.enabled || this.enabled) {
                    this.enable();
                } else {
                    this.check();
                }
            },
            defineDep: function (i, depExports) {
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },
            fetch: function () {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;
                context.startTime = new Date().getTime();
                var map = this.map;
                if (this.shim) {
                    context.makeRequire(this.map, { enableBuildCallback: true })(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                } else {
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },
            load: function () {
                var url = this.map.url;
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },
            check: function () {
                if (!this.enabled || this.enabling) {
                    return;
                }
                var err, cjsModule, id = this.map.id, depExports = this.depExports, exports = this.exports, factory = this.factory;
                if (!this.inited) {
                    this.fetch();
                } else if (this.error) {
                    this.emit('error', this.error);
                } else if (!this.defining) {
                    this.defining = true;
                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            if (this.events.error && this.map.isDefine || req.onError !== defaultOnError) {
                                try {
                                    exports = context.execCb(id, factory, depExports, exports);
                                } catch (e) {
                                    err = e;
                                }
                            } else {
                                exports = context.execCb(id, factory, depExports, exports);
                            }
                            if (this.map.isDefine && exports === undefined) {
                                cjsModule = this.module;
                                if (cjsModule) {
                                    exports = cjsModule.exports;
                                } else if (this.usingExports) {
                                    exports = this.exports;
                                }
                            }
                            if (err) {
                                err.requireMap = this.map;
                                err.requireModules = this.map.isDefine ? [this.map.id] : null;
                                err.requireType = this.map.isDefine ? 'define' : 'require';
                                return onError(this.error = err);
                            }
                        } else {
                            exports = factory;
                        }
                        this.exports = exports;
                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports;
                            if (req.onResourceLoad) {
                                req.onResourceLoad(context, this.map, this.depMaps);
                            }
                        }
                        cleanRegistry(id);
                        this.defined = true;
                    }
                    this.defining = false;
                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    }
                }
            },
            callPlugin: function () {
                var map = this.map, id = map.id, pluginMap = makeModuleMap(map.prefix);
                this.depMaps.push(pluginMap);
                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var load, normalizedMap, normalizedMod, bundleId = getOwn(bundlesMap, this.map.id), name = this.map.name, parentName = this.map.parentMap ? this.map.parentMap.name : null, localRequire = context.makeRequire(map.parentMap, { enableBuildCallback: true });
                    if (this.map.unnormalized) {
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }
                        normalizedMap = makeModuleMap(map.prefix + '!' + name, this.map.parentMap);
                        on(normalizedMap, 'defined', bind(this, function (value) {
                            this.init([], function () {
                                return value;
                            }, null, {
                                enabled: true,
                                ignore: true
                            });
                        }));
                        normalizedMod = getOwn(registry, normalizedMap.id);
                        if (normalizedMod) {
                            this.depMaps.push(normalizedMap);
                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }
                        return;
                    }
                    if (bundleId) {
                        this.map.url = context.nameToUrl(bundleId);
                        this.load();
                        return;
                    }
                    load = bind(this, function (value) {
                        this.init([], function () {
                            return value;
                        }, null, { enabled: true });
                    });
                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                cleanRegistry(mod.map.id);
                            }
                        });
                        onError(err);
                    });
                    load.fromText = bind(this, function (text, textAlt) {
                        var moduleName = map.name, moduleMap = makeModuleMap(moduleName), hasInteractive = useInteractive;
                        if (textAlt) {
                            text = textAlt;
                        }
                        if (hasInteractive) {
                            useInteractive = false;
                        }
                        getModule(moduleMap);
                        if (hasProp(config.config, id)) {
                            config.config[moduleName] = config.config[id];
                        }
                        try {
                            req.exec(text);
                        } catch (e) {
                            return onError(makeError('fromtexteval', 'fromText eval for ' + id + ' failed: ' + e, e, [id]));
                        }
                        if (hasInteractive) {
                            useInteractive = true;
                        }
                        this.depMaps.push(moduleMap);
                        context.completeLoad(moduleName);
                        localRequire([moduleName], load);
                    });
                    plugin.load(map.name, localRequire, load, config);
                }));
                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },
            enable: function () {
                enabledRegistry[this.map.id] = this;
                this.enabled = true;
                this.enabling = true;
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;
                    if (typeof depMap === 'string') {
                        depMap = makeModuleMap(depMap, this.map.isDefine ? this.map : this.map.parentMap, false, !this.skipMap);
                        this.depMaps[i] = depMap;
                        handler = getOwn(handlers, depMap.id);
                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }
                        this.depCount += 1;
                        on(depMap, 'defined', bind(this, function (depExports) {
                            this.defineDep(i, depExports);
                            this.check();
                        }));
                        if (this.errback) {
                            on(depMap, 'error', bind(this, this.errback));
                        }
                    }
                    id = depMap.id;
                    mod = registry[id];
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));
                this.enabling = false;
                this.check();
            },
            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },
            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    delete this.events[name];
                }
            }
        };
        function callGetModule(args) {
            if (!hasProp(defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
            }
        }
        function removeListener(node, func, name, ieName) {
            if (node.detachEvent && !isOpera) {
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        }
        function getScriptData(evt) {
            var node = evt.currentTarget || evt.srcElement;
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');
            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }
        function intakeDefines() {
            var args;
            takeGlobalQueue();
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' + args[args.length - 1]));
                } else {
                    callGetModule(args);
                }
            }
        }
        context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,
            onError: onError,
            configure: function (cfg) {
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }
                var shim = config.shim, objs = {
                        paths: true,
                        bundles: true,
                        config: true,
                        map: true
                    };
                eachProp(cfg, function (value, prop) {
                    if (objs[prop]) {
                        if (!config[prop]) {
                            config[prop] = {};
                        }
                        mixin(config[prop], value, true, true);
                    } else {
                        config[prop] = value;
                    }
                });
                if (cfg.bundles) {
                    eachProp(cfg.bundles, function (value, prop) {
                        each(value, function (v) {
                            if (v !== prop) {
                                bundlesMap[v] = prop;
                            }
                        });
                    });
                }
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        if (isArray(value)) {
                            value = { deps: value };
                        }
                        if ((value.exports || value.init) && !value.exportsFn) {
                            value.exportsFn = context.makeShimExports(value);
                        }
                        shim[id] = value;
                    });
                    config.shim = shim;
                }
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location, name;
                        pkgObj = typeof pkgObj === 'string' ? { name: pkgObj } : pkgObj;
                        name = pkgObj.name;
                        location = pkgObj.location;
                        if (location) {
                            config.paths[name] = pkgObj.location;
                        }
                        config.pkgs[name] = pkgObj.name + '/' + (pkgObj.main || 'main').replace(currDirRegExp, '').replace(jsSuffixRegExp, '');
                    });
                }
                eachProp(registry, function (mod, id) {
                    if (!mod.inited && !mod.map.unnormalized) {
                        mod.map = makeModuleMap(id);
                    }
                });
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },
            makeShimExports: function (value) {
                function fn() {
                    var ret;
                    if (value.init) {
                        ret = value.init.apply(global, arguments);
                    }
                    return ret || value.exports && getGlobal(value.exports);
                }
                return fn;
            },
            makeRequire: function (relMap, options) {
                options = options || {};
                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;
                    if (options.enableBuildCallback && callback && isFunction(callback)) {
                        callback.__requireJsBuild = true;
                    }
                    if (typeof deps === 'string') {
                        if (isFunction(callback)) {
                            return onError(makeError('requireargs', 'Invalid require call'), errback);
                        }
                        if (relMap && hasProp(handlers, deps)) {
                            return handlers[deps](registry[relMap.id]);
                        }
                        if (req.get) {
                            return req.get(context, deps, relMap, localRequire);
                        }
                        map = makeModuleMap(deps, relMap, false, true);
                        id = map.id;
                        if (!hasProp(defined, id)) {
                            return onError(makeError('notloaded', 'Module name "' + id + '" has not been loaded yet for context: ' + contextName + (relMap ? '' : '. Use require([])')));
                        }
                        return defined[id];
                    }
                    intakeDefines();
                    context.nextTick(function () {
                        intakeDefines();
                        requireMod = getModule(makeModuleMap(null, relMap));
                        requireMod.skipMap = options.skipMap;
                        requireMod.init(deps, callback, errback, { enabled: true });
                        checkLoaded();
                    });
                    return localRequire;
                }
                mixin(localRequire, {
                    isBrowser: isBrowser,
                    toUrl: function (moduleNamePlusExt) {
                        var ext, index = moduleNamePlusExt.lastIndexOf('.'), segment = moduleNamePlusExt.split('/')[0], isRelative = segment === '.' || segment === '..';
                        if (index !== -1 && (!isRelative || index > 1)) {
                            ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                            moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                        }
                        return context.nameToUrl(normalize(moduleNamePlusExt, relMap && relMap.id, true), ext, true);
                    },
                    defined: function (id) {
                        return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
                    },
                    specified: function (id) {
                        id = makeModuleMap(id, relMap, false, true).id;
                        return hasProp(defined, id) || hasProp(registry, id);
                    }
                });
                if (!relMap) {
                    localRequire.undef = function (id) {
                        takeGlobalQueue();
                        var map = makeModuleMap(id, relMap, true), mod = getOwn(registry, id);
                        removeScript(id);
                        delete defined[id];
                        delete urlFetched[map.url];
                        delete undefEvents[id];
                        eachReverse(defQueue, function (args, i) {
                            if (args[0] === id) {
                                defQueue.splice(i, 1);
                            }
                        });
                        if (mod) {
                            if (mod.events.defined) {
                                undefEvents[id] = mod.events;
                            }
                            cleanRegistry(id);
                        }
                    };
                }
                return localRequire;
            },
            enable: function (depMap) {
                var mod = getOwn(registry, depMap.id);
                if (mod) {
                    getModule(depMap).enable();
                }
            },
            completeLoad: function (moduleName) {
                var found, args, mod, shim = getOwn(config.shim, moduleName) || {}, shExports = shim.exports;
                takeGlobalQueue();
                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        if (found) {
                            break;
                        }
                        found = true;
                    } else if (args[0] === moduleName) {
                        found = true;
                    }
                    callGetModule(args);
                }
                mod = getOwn(registry, moduleName);
                if (!found && !hasProp(defined, moduleName) && mod && !mod.inited) {
                    if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        } else {
                            return onError(makeError('nodefine', 'No define call for ' + moduleName, null, [moduleName]));
                        }
                    } else {
                        callGetModule([
                            moduleName,
                            shim.deps || [],
                            shim.exportsFn
                        ]);
                    }
                }
                checkLoaded();
            },
            nameToUrl: function (moduleName, ext, skipExt) {
                var paths, syms, i, parentModule, url, parentPath, bundleId, pkgMain = getOwn(config.pkgs, moduleName);
                if (pkgMain) {
                    moduleName = pkgMain;
                }
                bundleId = getOwn(bundlesMap, moduleName);
                if (bundleId) {
                    return context.nameToUrl(bundleId, ext, skipExt);
                }
                if (req.jsExtRegExp.test(moduleName)) {
                    url = moduleName + (ext || '');
                } else {
                    paths = config.paths;
                    syms = moduleName.split('/');
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');
                        parentPath = getOwn(paths, parentModule);
                        if (parentPath) {
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        }
                    }
                    url = syms.join('/');
                    url += ext || (/^data\:|\?/.test(url) || skipExt ? '' : '.js');
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : config.baseUrl) + url;
                }
                return config.urlArgs ? url + ((url.indexOf('?') === -1 ? '?' : '&') + config.urlArgs) : url;
            },
            load: function (id, url) {
                req.load(context, id, url);
            },
            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args);
            },
            onScriptLoad: function (evt) {
                if (evt.type === 'load' || readyRegExp.test((evt.currentTarget || evt.srcElement).readyState)) {
                    interactiveScript = null;
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },
            onScriptError: function (evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    return onError(makeError('scripterror', 'Script error for: ' + data.id, evt, [data.id]));
                }
            }
        };
        context.require = context.makeRequire();
        return context;
    }
    req = requirejs = function (deps, callback, errback, optional) {
        var context, config, contextName = defContextName;
        if (!isArray(deps) && typeof deps !== 'string') {
            config = deps;
            if (isArray(callback)) {
                deps = callback;
                callback = errback;
                errback = optional;
            } else {
                deps = [];
            }
        }
        if (config && config.context) {
            contextName = config.context;
        }
        context = getOwn(contexts, contextName);
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }
        if (config) {
            context.configure(config);
        }
        return context.require(deps, callback, errback);
    };
    req.config = function (config) {
        return req(config);
    };
    req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
        setTimeout(fn, 4);
    } : function (fn) {
        fn();
    };
    if (!require) {
        require = req;
    }
    req.version = version;
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };
    req({});
    each([
        'toUrl',
        'undef',
        'defined',
        'specified'
    ], function (prop) {
        req[prop] = function () {
            var ctx = contexts[defContextName];
            return ctx.require[prop].apply(ctx, arguments);
        };
    });
    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }
    req.onError = defaultOnError;
    req.createNode = function (config, moduleName, url) {
        var node = config.xhtml ? document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') : document.createElement('script');
        node.type = config.scriptType || 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        return node;
    };
    req.load = function (context, moduleName, url) {
        var config = context && context.config || {}, node;
        if (isBrowser) {
            node = req.createNode(config, moduleName, url);
            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);
            if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera) {
                useInteractive = true;
                node.attachEvent('onreadystatechange', context.onScriptLoad);
            } else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;
            return node;
        } else if (isWebWorker) {
            try {
                importScripts(url);
                context.completeLoad(moduleName);
            } catch (e) {
                context.onError(makeError('importscripts', 'importScripts failed for ' + moduleName + ' at ' + url, e, [moduleName]));
            }
        }
    };
    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }
        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return interactiveScript = script;
            }
        });
        return interactiveScript;
    }
    if (isBrowser && !cfg.skipDataMain) {
        eachReverse(scripts(), function (script) {
            if (!head) {
                head = script.parentNode;
            }
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                mainScript = dataMain;
                if (!cfg.baseUrl) {
                    src = mainScript.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/') + '/' : './';
                    cfg.baseUrl = subPath;
                }
                mainScript = mainScript.replace(jsSuffixRegExp, '');
                if (req.jsExtRegExp.test(mainScript)) {
                    mainScript = dataMain;
                }
                cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript];
                return true;
            }
        });
    }
    define = function (name, deps, callback) {
        var node, context;
        if (typeof name !== 'string') {
            callback = deps;
            deps = name;
            name = null;
        }
        if (!isArray(deps)) {
            callback = deps;
            deps = null;
        }
        if (!deps && isFunction(callback)) {
            deps = [];
            if (callback.length) {
                callback.toString().replace(commentRegExp, '').replace(cjsRequireRegExp, function (match, dep) {
                    deps.push(dep);
                });
                deps = (callback.length === 1 ? ['require'] : [
                    'require',
                    'exports',
                    'module'
                ]).concat(deps);
            }
        }
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }
        (context ? context.defQueue : globalDefQueue).push([
            name,
            deps,
            callback
        ]);
    };
    define.amd = { jQuery: true };
    req.exec = function (text) {
        return eval(text);
    };
    req(cfg);
}(this));
define('R', [], function () {
    return;
});
define('$', [], function () {
    var Zepto = function () {
        var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter, document = window.document, elementDisplay = {}, classCache = {}, cssNumber = {
                'column-count': 1,
                'columns': 1,
                'font-weight': 1,
                'line-height': 1,
                'opacity': 1,
                'z-index': 1,
                'zoom': 1
            }, fragmentRE = /^\s*<(\w+|!)[^>]*>/, singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, rootNodeRE = /^(?:body|html)$/i, capitalRE = /([A-Z])/g, methodAttributes = [
                'val',
                'css',
                'html',
                'text',
                'data',
                'width',
                'height',
                'offset'
            ], adjacencyOperators = [
                'after',
                'prepend',
                'before',
                'append'
            ], table = document.createElement('table'), tableRow = document.createElement('tr'), containers = {
                'tr': document.createElement('tbody'),
                'tbody': table,
                'thead': table,
                'tfoot': table,
                'td': tableRow,
                'th': tableRow,
                '*': document.createElement('div')
            }, readyRE = /complete|loaded|interactive/, simpleSelectorRE = /^[\w-]*$/, class2type = {}, toString = class2type.toString, zepto = {}, camelize, uniq, tempParent = document.createElement('div'), propMap = {
                'tabindex': 'tabIndex',
                'readonly': 'readOnly',
                'for': 'htmlFor',
                'class': 'className',
                'maxlength': 'maxLength',
                'cellspacing': 'cellSpacing',
                'cellpadding': 'cellPadding',
                'rowspan': 'rowSpan',
                'colspan': 'colSpan',
                'usemap': 'useMap',
                'frameborder': 'frameBorder',
                'contenteditable': 'contentEditable'
            }, isArray = Array.isArray || function (object) {
                return object instanceof Array;
            };
        zepto.matches = function (element, selector) {
            if (!selector || !element || element.nodeType !== 1)
                return false;
            var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.matchesSelector;
            if (matchesSelector)
                return matchesSelector.call(element, selector);
            var match, parent = element.parentNode, temp = !parent;
            if (temp)
                (parent = tempParent).appendChild(element);
            match = ~zepto.qsa(parent, selector).indexOf(element);
            temp && tempParent.removeChild(element);
            return match;
        };
        function type(obj) {
            return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
        }
        function isFunction(value) {
            return type(value) == 'function';
        }
        function isWindow(obj) {
            return obj != null && obj == obj.window;
        }
        function isDocument(obj) {
            return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
        }
        function isObject(obj) {
            return type(obj) == 'object';
        }
        function isPlainObject(obj) {
            return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
        }
        function likeArray(obj) {
            return typeof obj.length == 'number';
        }
        function compact(array) {
            return filter.call(array, function (item) {
                return item != null;
            });
        }
        function flatten(array) {
            return array.length > 0 ? $.fn.concat.apply([], array) : array;
        }
        camelize = function (str) {
            return str.replace(/-+(.)?/g, function (match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
        };
        function dasherize(str) {
            return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
        }
        uniq = function (array) {
            return filter.call(array, function (item, idx) {
                return array.indexOf(item) == idx;
            });
        };
        function classRE(name) {
            return name in classCache ? classCache[name] : classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)');
        }
        function maybeAddPx(name, value) {
            return typeof value == 'number' && !cssNumber[dasherize(name)] ? value + 'px' : value;
        }
        function defaultDisplay(nodeName) {
            var element, display;
            if (!elementDisplay[nodeName]) {
                element = document.createElement(nodeName);
                document.body.appendChild(element);
                display = getComputedStyle(element, '').getPropertyValue('display');
                element.parentNode.removeChild(element);
                display == 'none' && (display = 'block');
                elementDisplay[nodeName] = display;
            }
            return elementDisplay[nodeName];
        }
        function children(element) {
            return 'children' in element ? slice.call(element.children) : $.map(element.childNodes, function (node) {
                if (node.nodeType == 1)
                    return node;
            });
        }
        zepto.fragment = function (html, name, properties) {
            var dom, nodes, container;
            if (singleTagRE.test(html))
                dom = $(document.createElement(RegExp.$1));
            if (!dom) {
                if (html.replace)
                    html = html.replace(tagExpanderRE, '<$1></$2>');
                if (name === undefined)
                    name = fragmentRE.test(html) && RegExp.$1;
                if (!(name in containers))
                    name = '*';
                container = containers[name];
                container.innerHTML = '' + html;
                dom = $.each(slice.call(container.childNodes), function () {
                    container.removeChild(this);
                });
            }
            if (isPlainObject(properties)) {
                nodes = $(dom);
                $.each(properties, function (key, value) {
                    if (methodAttributes.indexOf(key) > -1)
                        nodes[key](value);
                    else
                        nodes.attr(key, value);
                });
            }
            return dom;
        };
        zepto.Z = function (dom, selector) {
            dom = dom || [];
            dom.__proto__ = $.fn;
            dom.selector = selector || '';
            return dom;
        };
        zepto.isZ = function (object) {
            return object instanceof zepto.Z;
        };
        zepto.init = function (selector, context) {
            var dom;
            if (!selector)
                return zepto.Z();
            else if (typeof selector == 'string') {
                selector = selector.trim();
                if (selector[0] == '<' && fragmentRE.test(selector))
                    dom = zepto.fragment(selector, RegExp.$1, context), selector = null;
                else if (context !== undefined)
                    return $(context).find(selector);
                else
                    dom = zepto.qsa(document, selector);
            } else if (isFunction(selector))
                return $(document).ready(selector);
            else if (zepto.isZ(selector))
                return selector;
            else {
                if (isArray(selector))
                    dom = compact(selector);
                else if (isObject(selector))
                    dom = [selector], selector = null;
                else if (fragmentRE.test(selector))
                    dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null;
                else if (context !== undefined)
                    return $(context).find(selector);
                else
                    dom = zepto.qsa(document, selector);
            }
            return zepto.Z(dom, selector);
        };
        $ = function (selector, context) {
            return zepto.init(selector, context);
        };
        function extend(target, source, deep) {
            for (key in source)
                if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                    if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                        target[key] = {};
                    if (isArray(source[key]) && !isArray(target[key]))
                        target[key] = [];
                    extend(target[key], source[key], deep);
                } else if (source[key] !== undefined)
                    target[key] = source[key];
        }
        $.extend = function (target) {
            var deep, args = slice.call(arguments, 1);
            if (typeof target == 'boolean') {
                deep = target;
                target = args.shift();
            }
            args.forEach(function (arg) {
                extend(target, arg, deep);
            });
            return target;
        };
        zepto.qsa = function (element, selector) {
            var found, maybeID = selector[0] == '#', maybeClass = !maybeID && selector[0] == '.', nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, isSimple = simpleSelectorRE.test(nameOnly);
            return isDocument(element) && isSimple && maybeID ? (found = element.getElementById(nameOnly)) ? [found] : [] : element.nodeType !== 1 && element.nodeType !== 9 ? [] : slice.call(isSimple && !maybeID ? maybeClass ? element.getElementsByClassName(nameOnly) : element.getElementsByTagName(selector) : element.querySelectorAll(selector));
        };
        function filtered(nodes, selector) {
            return selector == null ? $(nodes) : $(nodes).filter(selector);
        }
        $.contains = document.documentElement.contains ? function (parent, node) {
            return parent !== node && parent.contains(node);
        } : function (parent, node) {
            while (node && (node = node.parentNode))
                if (node === parent)
                    return true;
            return false;
        };
        function funcArg(context, arg, idx, payload) {
            return isFunction(arg) ? arg.call(context, idx, payload) : arg;
        }
        function setAttribute(node, name, value) {
            value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
        }
        function className(node, value) {
            var klass = node.className, svg = klass && klass.baseVal !== undefined;
            if (value === undefined)
                return svg ? klass.baseVal : klass;
            svg ? klass.baseVal = value : node.className = value;
        }
        function deserializeValue(value) {
            var num;
            try {
                return value ? value == 'true' || (value == 'false' ? false : value == 'null' ? null : !/^0/.test(value) && !isNaN(num = Number(value)) ? num : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value;
            } catch (e) {
                return value;
            }
        }
        $.type = type;
        $.isFunction = isFunction;
        $.isWindow = isWindow;
        $.isArray = isArray;
        $.isPlainObject = isPlainObject;
        $.isEmptyObject = function (obj) {
            var name;
            for (name in obj)
                return false;
            return true;
        };
        $.inArray = function (elem, array, i) {
            return emptyArray.indexOf.call(array, elem, i);
        };
        $.camelCase = camelize;
        $.trim = function (str) {
            return str == null ? '' : String.prototype.trim.call(str);
        };
        $.uuid = 0;
        $.support = {};
        $.expr = {};
        $.map = function (elements, callback) {
            var value, values = [], i, key;
            if (likeArray(elements))
                for (i = 0; i < elements.length; i++) {
                    value = callback(elements[i], i);
                    if (value != null)
                        values.push(value);
                }
            else
                for (key in elements) {
                    value = callback(elements[key], key);
                    if (value != null)
                        values.push(value);
                }
            return flatten(values);
        };
        $.each = function (elements, callback) {
            var i, key;
            if (likeArray(elements)) {
                for (i = 0; i < elements.length; i++)
                    if (callback.call(elements[i], i, elements[i]) === false)
                        return elements;
            } else {
                for (key in elements)
                    if (callback.call(elements[key], key, elements[key]) === false)
                        return elements;
            }
            return elements;
        };
        $.grep = function (elements, callback) {
            return filter.call(elements, callback);
        };
        if (window.JSON)
            $.parseJSON = JSON.parse;
        $.each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function (i, name) {
            class2type['[object ' + name + ']'] = name.toLowerCase();
        });
        $.fn = {
            forEach: emptyArray.forEach,
            reduce: emptyArray.reduce,
            push: emptyArray.push,
            sort: emptyArray.sort,
            indexOf: emptyArray.indexOf,
            concat: emptyArray.concat,
            map: function (fn) {
                return $($.map(this, function (el, i) {
                    return fn.call(el, i, el);
                }));
            },
            slice: function () {
                return $(slice.apply(this, arguments));
            },
            ready: function (callback) {
                if (readyRE.test(document.readyState) && document.body)
                    callback($);
                else
                    document.addEventListener('DOMContentLoaded', function () {
                        callback($);
                    }, false);
                return this;
            },
            get: function (idx) {
                return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
            },
            toArray: function () {
                return this.get();
            },
            size: function () {
                return this.length;
            },
            remove: function () {
                return this.each(function () {
                    if (this.parentNode != null)
                        this.parentNode.removeChild(this);
                });
            },
            each: function (callback) {
                emptyArray.every.call(this, function (el, idx) {
                    return callback.call(el, idx, el) !== false;
                });
                return this;
            },
            filter: function (selector) {
                if (isFunction(selector))
                    return this.not(this.not(selector));
                return $(filter.call(this, function (element) {
                    return zepto.matches(element, selector);
                }));
            },
            add: function (selector, context) {
                return $(uniq(this.concat($(selector, context))));
            },
            is: function (selector) {
                return this.length > 0 && zepto.matches(this[0], selector);
            },
            not: function (selector) {
                var nodes = [];
                if (isFunction(selector) && selector.call !== undefined)
                    this.each(function (idx) {
                        if (!selector.call(this, idx))
                            nodes.push(this);
                    });
                else {
                    var excludes = typeof selector == 'string' ? this.filter(selector) : likeArray(selector) && isFunction(selector.item) ? slice.call(selector) : $(selector);
                    this.forEach(function (el) {
                        if (excludes.indexOf(el) < 0)
                            nodes.push(el);
                    });
                }
                return $(nodes);
            },
            has: function (selector) {
                return this.filter(function () {
                    return isObject(selector) ? $.contains(this, selector) : $(this).find(selector).size();
                });
            },
            eq: function (idx) {
                return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
            },
            first: function () {
                var el = this[0];
                return el && !isObject(el) ? el : $(el);
            },
            last: function () {
                var el = this[this.length - 1];
                return el && !isObject(el) ? el : $(el);
            },
            find: function (selector) {
                var result, $this = this;
                if (!selector)
                    result = [];
                else if (typeof selector == 'object')
                    result = $(selector).filter(function () {
                        var node = this;
                        return emptyArray.some.call($this, function (parent) {
                            return $.contains(parent, node);
                        });
                    });
                else if (this.length == 1)
                    result = $(zepto.qsa(this[0], selector));
                else
                    result = this.map(function () {
                        return zepto.qsa(this, selector);
                    });
                return result;
            },
            closest: function (selector, context) {
                var node = this[0], collection = false;
                if (typeof selector == 'object')
                    collection = $(selector);
                while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
                    node = node !== context && !isDocument(node) && node.parentNode;
                return $(node);
            },
            parents: function (selector) {
                var ancestors = [], nodes = this;
                while (nodes.length > 0)
                    nodes = $.map(nodes, function (node) {
                        if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                            ancestors.push(node);
                            return node;
                        }
                    });
                return filtered(ancestors, selector);
            },
            parent: function (selector) {
                return filtered(uniq(this.pluck('parentNode')), selector);
            },
            children: function (selector) {
                return filtered(this.map(function () {
                    return children(this);
                }), selector);
            },
            contents: function () {
                return this.map(function () {
                    return slice.call(this.childNodes);
                });
            },
            siblings: function (selector) {
                return filtered(this.map(function (i, el) {
                    return filter.call(children(el.parentNode), function (child) {
                        return child !== el;
                    });
                }), selector);
            },
            empty: function () {
                return this.each(function () {
                    this.innerHTML = '';
                });
            },
            pluck: function (property) {
                return $.map(this, function (el) {
                    return el[property];
                });
            },
            show: function () {
                return this.each(function () {
                    this.style.display == 'none' && (this.style.display = '');
                    if (getComputedStyle(this, '').getPropertyValue('display') == 'none')
                        this.style.display = defaultDisplay(this.nodeName);
                });
            },
            replaceWith: function (newContent) {
                return this.before(newContent).remove();
            },
            wrap: function (structure) {
                var func = isFunction(structure);
                if (this[0] && !func)
                    var dom = $(structure).get(0), clone = dom.parentNode || this.length > 1;
                return this.each(function (index) {
                    $(this).wrapAll(func ? structure.call(this, index) : clone ? dom.cloneNode(true) : dom);
                });
            },
            wrapAll: function (structure) {
                if (this[0]) {
                    $(this[0]).before(structure = $(structure));
                    var children;
                    while ((children = structure.children()).length)
                        structure = children.first();
                    $(structure).append(this);
                }
                return this;
            },
            wrapInner: function (structure) {
                var func = isFunction(structure);
                return this.each(function (index) {
                    var self = $(this), contents = self.contents(), dom = func ? structure.call(this, index) : structure;
                    contents.length ? contents.wrapAll(dom) : self.append(dom);
                });
            },
            unwrap: function () {
                this.parent().each(function () {
                    $(this).replaceWith($(this).children());
                });
                return this;
            },
            clone: function () {
                return this.map(function () {
                    return this.cloneNode(true);
                });
            },
            hide: function () {
                return this.css('display', 'none');
            },
            toggle: function (setting) {
                return this.each(function () {
                    var el = $(this);
                    (setting === undefined ? el.css('display') == 'none' : setting) ? el.show() : el.hide();
                });
            },
            prev: function (selector) {
                return $(this.pluck('previousElementSibling')).filter(selector || '*');
            },
            next: function (selector) {
                return $(this.pluck('nextElementSibling')).filter(selector || '*');
            },
            html: function (html) {
                return 0 in arguments ? this.each(function (idx) {
                    var originHtml = this.innerHTML;
                    $(this).empty().append(funcArg(this, html, idx, originHtml));
                }) : 0 in this ? this[0].innerHTML : null;
            },
            text: function (text) {
                return 0 in arguments ? this.each(function (idx) {
                    var newText = funcArg(this, text, idx, this.textContent);
                    this.textContent = newText == null ? '' : '' + newText;
                }) : 0 in this ? this[0].textContent : null;
            },
            attr: function (name, value) {
                var result;
                return typeof name == 'string' && !(1 in arguments) ? !this.length || this[0].nodeType !== 1 ? undefined : !(result = this[0].getAttribute(name)) && name in this[0] ? this[0][name] : result : this.each(function (idx) {
                    if (this.nodeType !== 1)
                        return;
                    if (isObject(name))
                        for (key in name)
                            setAttribute(this, key, name[key]);
                    else
                        setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
                });
            },
            removeAttr: function (name) {
                return this.each(function () {
                    this.nodeType === 1 && setAttribute(this, name);
                });
            },
            prop: function (name, value) {
                name = propMap[name] || name;
                return 1 in arguments ? this.each(function (idx) {
                    this[name] = funcArg(this, value, idx, this[name]);
                }) : this[0] && this[0][name];
            },
            data: function (name, value) {
                var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase();
                var data = 1 in arguments ? this.attr(attrName, value) : this.attr(attrName);
                return data !== null ? deserializeValue(data) : undefined;
            },
            val: function (value) {
                return 0 in arguments ? this.each(function (idx) {
                    this.value = funcArg(this, value, idx, this.value);
                }) : this[0] && (this[0].multiple ? $(this[0]).find('option').filter(function () {
                    return this.selected;
                }).pluck('value') : this[0].value);
            },
            offset: function (coordinates) {
                if (coordinates)
                    return this.each(function (index) {
                        var $this = $(this), coords = funcArg(this, coordinates, index, $this.offset()), parentOffset = $this.offsetParent().offset(), props = {
                                top: coords.top - parentOffset.top,
                                left: coords.left - parentOffset.left
                            };
                        if ($this.css('position') == 'static')
                            props['position'] = 'relative';
                        $this.css(props);
                    });
                if (!this.length)
                    return null;
                var obj = this[0].getBoundingClientRect();
                return {
                    left: obj.left + window.pageXOffset,
                    top: obj.top + window.pageYOffset,
                    width: Math.round(obj.width),
                    height: Math.round(obj.height)
                };
            },
            css: function (property, value) {
                if (arguments.length < 2) {
                    var element = this[0], computedStyle = getComputedStyle(element, '');
                    if (!element)
                        return;
                    if (typeof property == 'string')
                        return element.style[camelize(property)] || computedStyle.getPropertyValue(property);
                    else if (isArray(property)) {
                        var props = {};
                        $.each(isArray(property) ? property : [property], function (_, prop) {
                            props[prop] = element.style[camelize(prop)] || computedStyle.getPropertyValue(prop);
                        });
                        return props;
                    }
                }
                var css = '';
                if (type(property) == 'string') {
                    if (!value && value !== 0)
                        this.each(function () {
                            this.style.removeProperty(dasherize(property));
                        });
                    else
                        css = dasherize(property) + ':' + maybeAddPx(property, value);
                } else {
                    for (key in property)
                        if (!property[key] && property[key] !== 0)
                            this.each(function () {
                                this.style.removeProperty(dasherize(key));
                            });
                        else
                            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
                }
                return this.each(function () {
                    this.style.cssText += ';' + css;
                });
            },
            index: function (element) {
                return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
            },
            hasClass: function (name) {
                if (!name)
                    return false;
                return emptyArray.some.call(this, function (el) {
                    return this.test(className(el));
                }, classRE(name));
            },
            addClass: function (name) {
                if (!name)
                    return this;
                return this.each(function (idx) {
                    classList = [];
                    var cls = className(this), newName = funcArg(this, name, idx, cls);
                    newName.split(/\s+/g).forEach(function (klass) {
                        if (!$(this).hasClass(klass))
                            classList.push(klass);
                    }, this);
                    classList.length && className(this, cls + (cls ? ' ' : '') + classList.join(' '));
                });
            },
            removeClass: function (name) {
                return this.each(function (idx) {
                    if (name === undefined)
                        return className(this, '');
                    classList = className(this);
                    funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
                        classList = classList.replace(classRE(klass), ' ');
                    });
                    className(this, classList.trim());
                });
            },
            toggleClass: function (name, when) {
                if (!name)
                    return this;
                return this.each(function (idx) {
                    var $this = $(this), names = funcArg(this, name, idx, className(this));
                    names.split(/\s+/g).forEach(function (klass) {
                        (when === undefined ? !$this.hasClass(klass) : when) ? $this.addClass(klass) : $this.removeClass(klass);
                    });
                });
            },
            scrollTop: function (value) {
                if (!this.length)
                    return;
                var hasScrollTop = 'scrollTop' in this[0];
                if (value === undefined)
                    return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset;
                return this.each(hasScrollTop ? function () {
                    this.scrollTop = value;
                } : function () {
                    this.scrollTo(this.scrollX, value);
                });
            },
            scrollLeft: function (value) {
                if (!this.length)
                    return;
                var hasScrollLeft = 'scrollLeft' in this[0];
                if (value === undefined)
                    return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset;
                return this.each(hasScrollLeft ? function () {
                    this.scrollLeft = value;
                } : function () {
                    this.scrollTo(value, this.scrollY);
                });
            },
            position: function () {
                if (!this.length)
                    return;
                var elem = this[0], offsetParent = this.offsetParent(), offset = this.offset(), parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {
                        top: 0,
                        left: 0
                    } : offsetParent.offset();
                offset.top -= parseFloat($(elem).css('margin-top')) || 0;
                offset.left -= parseFloat($(elem).css('margin-left')) || 0;
                parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0;
                parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0;
                return {
                    top: offset.top - parentOffset.top,
                    left: offset.left - parentOffset.left
                };
            },
            offsetParent: function () {
                return this.map(function () {
                    var parent = this.offsetParent || document.body;
                    while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css('position') == 'static')
                        parent = parent.offsetParent;
                    return parent;
                });
            }
        };
        $.fn.detach = $.fn.remove;
        [
            'width',
            'height'
        ].forEach(function (dimension) {
            var dimensionProperty = dimension.replace(/./, function (m) {
                return m[0].toUpperCase();
            });
            $.fn[dimension] = function (value) {
                var offset, el = this[0];
                if (value === undefined)
                    return isWindow(el) ? el['inner' + dimensionProperty] : isDocument(el) ? el.documentElement['scroll' + dimensionProperty] : (offset = this.offset()) && offset[dimension];
                else
                    return this.each(function (idx) {
                        el = $(this);
                        el.css(dimension, funcArg(this, value, idx, el[dimension]()));
                    });
            };
        });
        function traverseNode(node, fun) {
            fun(node);
            for (var i = 0, len = node.childNodes.length; i < len; i++)
                traverseNode(node.childNodes[i], fun);
        }
        adjacencyOperators.forEach(function (operator, operatorIndex) {
            var inside = operatorIndex % 2;
            $.fn[operator] = function () {
                var argType, nodes = $.map(arguments, function (arg) {
                        argType = type(arg);
                        return argType == 'object' || argType == 'array' || arg == null ? arg : zepto.fragment(arg);
                    }), parent, copyByClone = this.length > 1;
                if (nodes.length < 1)
                    return this;
                return this.each(function (_, target) {
                    parent = inside ? target : target.parentNode;
                    target = operatorIndex == 0 ? target.nextSibling : operatorIndex == 1 ? target.firstChild : operatorIndex == 2 ? target : null;
                    var parentInDocument = $.contains(document.documentElement, parent);
                    nodes.forEach(function (node) {
                        if (copyByClone)
                            node = node.cloneNode(true);
                        else if (!parent)
                            return $(node).remove();
                        parent.insertBefore(node, target);
                        if (parentInDocument)
                            traverseNode(node, function (el) {
                                if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' && (!el.type || el.type === 'text/javascript') && !el.src)
                                    window['eval'].call(window, el.innerHTML);
                            });
                    });
                });
            };
            $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
                $(html)[operator](this);
                return this;
            };
        });
        zepto.Z.prototype = $.fn;
        zepto.uniq = uniq;
        zepto.deserializeValue = deserializeValue;
        $.zepto = zepto;
        return $;
    }();
    window.Zepto = Zepto;
    window.$ === undefined && (window.$ = Zepto);
    (function ($) {
        var _zid = 1, undefined, slice = Array.prototype.slice, isFunction = $.isFunction, isString = function (obj) {
                return typeof obj == 'string';
            }, handlers = {}, specialEvents = {}, focusinSupported = 'onfocusin' in window, focus = {
                focus: 'focusin',
                blur: 'focusout'
            }, hover = {
                mouseenter: 'mouseover',
                mouseleave: 'mouseout'
            };
        specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';
        function zid(element) {
            return element._zid || (element._zid = _zid++);
        }
        function findHandlers(element, event, fn, selector) {
            event = parse(event);
            if (event.ns)
                var matcher = matcherFor(event.ns);
            return (handlers[zid(element)] || []).filter(function (handler) {
                return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || zid(handler.fn) === zid(fn)) && (!selector || handler.sel == selector);
            });
        }
        function parse(event) {
            var parts = ('' + event).split('.');
            return {
                e: parts[0],
                ns: parts.slice(1).sort().join(' ')
            };
        }
        function matcherFor(ns) {
            return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
        }
        function eventCapture(handler, captureSetting) {
            return handler.del && (!focusinSupported && handler.e in focus) || !!captureSetting;
        }
        function realEvent(type) {
            return hover[type] || focusinSupported && focus[type] || type;
        }
        function add(element, events, fn, data, selector, delegator, capture) {
            var id = zid(element), set = handlers[id] || (handlers[id] = []);
            events.split(/\s/).forEach(function (event) {
                if (event == 'ready')
                    return $(document).ready(fn);
                var handler = parse(event);
                handler.fn = fn;
                handler.sel = selector;
                if (handler.e in hover)
                    fn = function (e) {
                        var related = e.relatedTarget;
                        if (!related || related !== this && !$.contains(this, related))
                            return handler.fn.apply(this, arguments);
                    };
                handler.del = delegator;
                var callback = delegator || fn;
                handler.proxy = function (e) {
                    e = compatible(e);
                    if (e.isImmediatePropagationStopped())
                        return;
                    e.data = data;
                    var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args));
                    if (result === false)
                        e.preventDefault(), e.stopPropagation();
                    return result;
                };
                handler.i = set.length;
                set.push(handler);
                if ('addEventListener' in element)
                    element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
            });
        }
        function remove(element, events, fn, selector, capture) {
            var id = zid(element);
            (events || '').split(/\s/).forEach(function (event) {
                findHandlers(element, event, fn, selector).forEach(function (handler) {
                    delete handlers[id][handler.i];
                    if ('removeEventListener' in element)
                        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
                });
            });
        }
        $.event = {
            add: add,
            remove: remove
        };
        $.proxy = function (fn, context) {
            var args = 2 in arguments && slice.call(arguments, 2);
            if (isFunction(fn)) {
                var proxyFn = function () {
                    return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments);
                };
                proxyFn._zid = zid(fn);
                return proxyFn;
            } else if (isString(context)) {
                if (args) {
                    args.unshift(fn[context], fn);
                    return $.proxy.apply(null, args);
                } else {
                    return $.proxy(fn[context], fn);
                }
            } else {
                throw new TypeError('expected function');
            }
        };
        $.fn.bind = function (event, data, callback) {
            return this.on(event, data, callback);
        };
        $.fn.unbind = function (event, callback) {
            return this.off(event, callback);
        };
        $.fn.one = function (event, selector, data, callback) {
            return this.on(event, selector, data, callback, 1);
        };
        var returnTrue = function () {
                return true;
            }, returnFalse = function () {
                return false;
            }, ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/, eventMethods = {
                preventDefault: 'isDefaultPrevented',
                stopImmediatePropagation: 'isImmediatePropagationStopped',
                stopPropagation: 'isPropagationStopped'
            };
        function compatible(event, source) {
            if (source || !event.isDefaultPrevented) {
                source || (source = event);
                $.each(eventMethods, function (name, predicate) {
                    var sourceMethod = source[name];
                    event[name] = function () {
                        this[predicate] = returnTrue;
                        return sourceMethod && sourceMethod.apply(source, arguments);
                    };
                    event[predicate] = returnFalse;
                });
                if (source.defaultPrevented !== undefined ? source.defaultPrevented : 'returnValue' in source ? source.returnValue === false : source.getPreventDefault && source.getPreventDefault())
                    event.isDefaultPrevented = returnTrue;
            }
            return event;
        }
        function createProxy(event) {
            var key, proxy = { originalEvent: event };
            for (key in event)
                if (!ignoreProperties.test(key) && event[key] !== undefined)
                    proxy[key] = event[key];
            return compatible(proxy, event);
        }
        $.fn.delegate = function (selector, event, callback) {
            return this.on(event, selector, callback);
        };
        $.fn.undelegate = function (selector, event, callback) {
            return this.off(event, selector, callback);
        };
        $.fn.live = function (event, callback) {
            $(document.body).delegate(this.selector, event, callback);
            return this;
        };
        $.fn.die = function (event, callback) {
            $(document.body).undelegate(this.selector, event, callback);
            return this;
        };
        $.fn.on = function (event, selector, data, callback, one) {
            var autoRemove, delegator, $this = this;
            if (event && !isString(event)) {
                $.each(event, function (type, fn) {
                    $this.on(type, selector, data, fn, one);
                });
                return $this;
            }
            if (!isString(selector) && !isFunction(callback) && callback !== false)
                callback = data, data = selector, selector = undefined;
            if (isFunction(data) || data === false)
                callback = data, data = undefined;
            if (callback === false)
                callback = returnFalse;
            return $this.each(function (_, element) {
                if (one)
                    autoRemove = function (e) {
                        remove(element, e.type, callback);
                        return callback.apply(this, arguments);
                    };
                if (selector)
                    delegator = function (e) {
                        var evt, match = $(e.target).closest(selector, element).get(0);
                        if (match && match !== element) {
                            evt = $.extend(createProxy(e), {
                                currentTarget: match,
                                liveFired: element
                            });
                            return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)));
                        }
                    };
                add(element, event, callback, data, selector, delegator || autoRemove);
            });
        };
        $.fn.off = function (event, selector, callback) {
            var $this = this;
            if (event && !isString(event)) {
                $.each(event, function (type, fn) {
                    $this.off(type, selector, fn);
                });
                return $this;
            }
            if (!isString(selector) && !isFunction(callback) && callback !== false)
                callback = selector, selector = undefined;
            if (callback === false)
                callback = returnFalse;
            return $this.each(function () {
                remove(this, event, callback, selector);
            });
        };
        $.fn.trigger = function (event, args) {
            event = isString(event) || $.isPlainObject(event) ? $.Event(event) : compatible(event);
            event._args = args;
            return this.each(function () {
                if ('dispatchEvent' in this)
                    this.dispatchEvent(event);
                else
                    $(this).triggerHandler(event, args);
            });
        };
        $.fn.triggerHandler = function (event, args) {
            var e, result;
            this.each(function (i, element) {
                e = createProxy(isString(event) ? $.Event(event) : event);
                e._args = args;
                e.target = element;
                $.each(findHandlers(element, event.type || event), function (i, handler) {
                    result = handler.proxy(e);
                    if (e.isImmediatePropagationStopped())
                        return false;
                });
            });
            return result;
        };
        ('focusin focusout load resize scroll unload click dblclick ' + 'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' + 'change select keydown keypress keyup error').split(' ').forEach(function (event) {
            $.fn[event] = function (callback) {
                return callback ? this.bind(event, callback) : this.trigger(event);
            };
        });
        [
            'focus',
            'blur'
        ].forEach(function (name) {
            $.fn[name] = function (callback) {
                if (callback)
                    this.bind(name, callback);
                else
                    this.each(function () {
                        try {
                            this[name]();
                        } catch (e) {
                        }
                    });
                return this;
            };
        });
        $.Event = function (type, props) {
            if (!isString(type))
                props = type, type = props.type;
            var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true;
            if (props)
                for (var name in props)
                    name == 'bubbles' ? bubbles = !!props[name] : event[name] = props[name];
            event.initEvent(type, bubbles, true);
            return compatible(event);
        };
    }(Zepto));
    (function ($) {
        var jsonpID = 0, document = window.document, key, name, rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, scriptTypeRE = /^(?:text|application)\/javascript/i, xmlTypeRE = /^(?:text|application)\/xml/i, jsonType = 'application/json', htmlType = 'text/html', blankRE = /^\s*$/;
        function triggerAndReturn(context, eventName, data) {
            var event = $.Event(eventName);
            $(context).trigger(event, data);
            return !event.isDefaultPrevented();
        }
        function triggerGlobal(settings, context, eventName, data) {
            if (settings.global)
                return triggerAndReturn(context || document, eventName, data);
        }
        $.active = 0;
        function ajaxStart(settings) {
            if (settings.global && $.active++ === 0)
                triggerGlobal(settings, null, 'ajaxStart');
        }
        function ajaxStop(settings) {
            if (settings.global && !--$.active)
                triggerGlobal(settings, null, 'ajaxStop');
        }
        function ajaxBeforeSend(xhr, settings) {
            var context = settings.context;
            if (settings.beforeSend.call(context, xhr, settings) === false || triggerGlobal(settings, context, 'ajaxBeforeSend', [
                    xhr,
                    settings
                ]) === false)
                return false;
            triggerGlobal(settings, context, 'ajaxSend', [
                xhr,
                settings
            ]);
        }
        function ajaxSuccess(data, xhr, settings, deferred) {
            var context = settings.context, status = 'success';
            settings.success.call(context, data, status, xhr);
            if (deferred)
                deferred.resolveWith(context, [
                    data,
                    status,
                    xhr
                ]);
            triggerGlobal(settings, context, 'ajaxSuccess', [
                xhr,
                settings,
                data
            ]);
            ajaxComplete(status, xhr, settings);
        }
        function ajaxError(error, type, xhr, settings, deferred) {
            var context = settings.context;
            settings.error.call(context, xhr, type, error);
            if (deferred)
                deferred.rejectWith(context, [
                    xhr,
                    type,
                    error
                ]);
            triggerGlobal(settings, context, 'ajaxError', [
                xhr,
                settings,
                error || type
            ]);
            ajaxComplete(type, xhr, settings);
        }
        function ajaxComplete(status, xhr, settings) {
            var context = settings.context;
            settings.complete.call(context, xhr, status);
            triggerGlobal(settings, context, 'ajaxComplete', [
                xhr,
                settings
            ]);
            ajaxStop(settings);
        }
        function empty() {
        }
        $.ajaxJSONP = function (options, deferred) {
            if (!('type' in options))
                return $.ajax(options);
            var _callbackName = options.jsonpCallback, callbackName = ($.isFunction(_callbackName) ? _callbackName() : _callbackName) || 'jsonp' + ++jsonpID, script = document.createElement('script'), originalCallback = window[callbackName], responseData, abort = function (errorType) {
                    $(script).triggerHandler('error', errorType || 'abort');
                }, xhr = { abort: abort }, abortTimeout;
            if (deferred)
                deferred.promise(xhr);
            $(script).on('load error', function (e, errorType) {
                clearTimeout(abortTimeout);
                $(script).off().remove();
                if (e.type == 'error' || !responseData) {
                    ajaxError(null, errorType || 'error', xhr, options, deferred);
                } else {
                    ajaxSuccess(responseData[0], xhr, options, deferred);
                }
                window[callbackName] = originalCallback;
                if (responseData && $.isFunction(originalCallback))
                    originalCallback(responseData[0]);
                originalCallback = responseData = undefined;
            });
            if (ajaxBeforeSend(xhr, options) === false) {
                abort('abort');
                return xhr;
            }
            window[callbackName] = function () {
                responseData = arguments;
            };
            script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName);
            document.head.appendChild(script);
            if (options.timeout > 0)
                abortTimeout = setTimeout(function () {
                    abort('timeout');
                }, options.timeout);
            return xhr;
        };
        $.ajaxSettings = {
            type: 'GET',
            beforeSend: empty,
            success: empty,
            error: empty,
            complete: empty,
            context: null,
            global: true,
            xhr: function () {
                return new window.XMLHttpRequest();
            },
            accepts: {
                script: 'text/javascript, application/javascript, application/x-javascript',
                json: jsonType,
                xml: 'application/xml, text/xml',
                html: htmlType,
                text: 'text/plain'
            },
            crossDomain: false,
            timeout: 0,
            processData: true,
            cache: true
        };
        function mimeToDataType(mime) {
            if (mime)
                mime = mime.split(';', 2)[0];
            return mime && (mime == htmlType ? 'html' : mime == jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml') || 'text';
        }
        function appendQuery(url, query) {
            if (query == '')
                return url;
            return (url + '&' + query).replace(/[&?]{1,2}/, '?');
        }
        function serializeData(options) {
            if (options.processData && options.data && $.type(options.data) != 'string')
                options.data = $.param(options.data, options.traditional);
            if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
                options.url = appendQuery(options.url, options.data), options.data = undefined;
        }
        $.ajax = function (options) {
            var settings = $.extend({}, options || {}), deferred = $.Deferred && $.Deferred();
            for (key in $.ajaxSettings)
                if (settings[key] === undefined)
                    settings[key] = $.ajaxSettings[key];
            ajaxStart(settings);
            if (!settings.crossDomain)
                settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) && RegExp.$2 != window.location.host;
            if (!settings.url)
                settings.url = window.location.toString();
            serializeData(settings);
            var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url);
            if (hasPlaceholder)
                dataType = 'jsonp';
            if (settings.cache === false || (!options || options.cache !== true) && ('script' == dataType || 'jsonp' == dataType))
                settings.url = appendQuery(settings.url, '_=' + Date.now());
            if ('jsonp' == dataType) {
                if (!hasPlaceholder)
                    settings.url = appendQuery(settings.url, settings.jsonp ? settings.jsonp + '=?' : settings.jsonp === false ? '' : 'callback=?');
                return $.ajaxJSONP(settings, deferred);
            }
            var mime = settings.accepts[dataType], headers = {}, setHeader = function (name, value) {
                    headers[name.toLowerCase()] = [
                        name,
                        value
                    ];
                }, protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol, xhr = settings.xhr(), nativeSetHeader = xhr.setRequestHeader, abortTimeout;
            if (deferred)
                deferred.promise(xhr);
            if (!settings.crossDomain)
                setHeader('X-Requested-With', 'XMLHttpRequest');
            setHeader('Accept', mime || '*/*');
            if (mime = settings.mimeType || mime) {
                if (mime.indexOf(',') > -1)
                    mime = mime.split(',', 2)[0];
                xhr.overrideMimeType && xhr.overrideMimeType(mime);
            }
            if (settings.contentType || settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET')
                setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
            if (settings.headers)
                for (name in settings.headers)
                    setHeader(name, settings.headers[name]);
            xhr.setRequestHeader = setHeader;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    xhr.onreadystatechange = empty;
                    clearTimeout(abortTimeout);
                    var result, error = false;
                    if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304 || xhr.status == 0 && protocol == 'file:') {
                        dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
                        result = xhr.responseText;
                        try {
                            if (dataType == 'script')
                                (1, eval)(result);
                            else if (dataType == 'xml')
                                result = xhr.responseXML;
                            else if (dataType == 'json')
                                result = blankRE.test(result) ? null : $.parseJSON(result);
                        } catch (e) {
                            error = e;
                        }
                        if (error)
                            ajaxError(error, 'parsererror', xhr, settings, deferred);
                        else
                            ajaxSuccess(result, xhr, settings, deferred);
                    } else {
                        ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred);
                    }
                }
            };
            if (ajaxBeforeSend(xhr, settings) === false) {
                xhr.abort();
                ajaxError(null, 'abort', xhr, settings, deferred);
                return xhr;
            }
            if (settings.xhrFields)
                for (name in settings.xhrFields)
                    xhr[name] = settings.xhrFields[name];
            var async = 'async' in settings ? settings.async : true;
            xhr.open(settings.type, settings.url, async, settings.username, settings.password);
            for (name in headers)
                nativeSetHeader.apply(xhr, headers[name]);
            if (settings.timeout > 0)
                abortTimeout = setTimeout(function () {
                    xhr.onreadystatechange = empty;
                    xhr.abort();
                    ajaxError(null, 'timeout', xhr, settings, deferred);
                }, settings.timeout);
            xhr.send(settings.data ? settings.data : null);
            return xhr;
        };
        function parseArguments(url, data, success, dataType) {
            if ($.isFunction(data))
                dataType = success, success = data, data = undefined;
            if (!$.isFunction(success))
                dataType = success, success = undefined;
            return {
                url: url,
                data: data,
                success: success,
                dataType: dataType
            };
        }
        $.get = function () {
            return $.ajax(parseArguments.apply(null, arguments));
        };
        $.post = function () {
            var options = parseArguments.apply(null, arguments);
            options.type = 'POST';
            return $.ajax(options);
        };
        $.getJSON = function () {
            var options = parseArguments.apply(null, arguments);
            options.dataType = 'json';
            return $.ajax(options);
        };
        $.fn.load = function (url, data, success) {
            if (!this.length)
                return this;
            var self = this, parts = url.split(/\s/), selector, options = parseArguments(url, data, success), callback = options.success;
            if (parts.length > 1)
                options.url = parts[0], selector = parts[1];
            options.success = function (response) {
                self.html(selector ? $('<div>').html(response.replace(rscript, '')).find(selector) : response);
                callback && callback.apply(self, arguments);
            };
            $.ajax(options);
            return this;
        };
        var escape = encodeURIComponent;
        function serialize(params, obj, traditional, scope) {
            var type, array = $.isArray(obj), hash = $.isPlainObject(obj);
            $.each(obj, function (key, value) {
                type = $.type(value);
                if (scope)
                    key = traditional ? scope : scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']';
                if (!scope && array)
                    params.add(value.name, value.value);
                else if (type == 'array' || !traditional && type == 'object')
                    serialize(params, value, traditional, key);
                else
                    params.add(key, value);
            });
        }
        $.param = function (obj, traditional) {
            var params = [];
            params.add = function (k, v) {
                this.push(escape(k) + '=' + escape(v));
            };
            serialize(params, obj, traditional);
            return params.join('&').replace(/%20/g, '+');
        };
    }(Zepto));
    (function ($) {
        $.fn.serializeArray = function () {
            var result = [], el;
            $([].slice.call(this.get(0).elements)).each(function () {
                el = $(this);
                var type = el.attr('type');
                if (this.nodeName.toLowerCase() != 'fieldset' && !this.disabled && type != 'submit' && type != 'reset' && type != 'button' && (type != 'radio' && type != 'checkbox' || this.checked))
                    result.push({
                        name: el.attr('name'),
                        value: el.val()
                    });
            });
            return result;
        };
        $.fn.serialize = function () {
            var result = [];
            this.serializeArray().forEach(function (elm) {
                result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value));
            });
            return result.join('&');
        };
        $.fn.submit = function (callback) {
            if (callback)
                this.bind('submit', callback);
            else if (this.length) {
                var event = $.Event('submit');
                this.eq(0).trigger(event);
                if (!event.isDefaultPrevented())
                    this.get(0).submit();
            }
            return this;
        };
    }(Zepto));
    (function ($) {
        if (!('__proto__' in {})) {
            $.extend($.zepto, {
                Z: function (dom, selector) {
                    dom = dom || [];
                    $.extend(dom, $.fn);
                    dom.selector = selector || '';
                    dom.__Z = true;
                    return dom;
                },
                isZ: function (object) {
                    return $.type(object) === 'array' && '__Z' in object;
                }
            });
        }
        try {
            getComputedStyle(undefined);
        } catch (e) {
            var nativeGetComputedStyle = getComputedStyle;
            window.getComputedStyle = function (element) {
                try {
                    return nativeGetComputedStyle(element);
                } catch (e) {
                    return null;
                }
            };
        }
    }(Zepto));
    return Zepto;
});
define('_', [], function () {
    (function () {
        var root = this;
        var previousUnderscore = root._;
        var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
        var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
        var nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
        var _ = function (obj) {
            if (obj instanceof _)
                return obj;
            if (!(this instanceof _))
                return new _(obj);
            this._wrapped = obj;
        };
        if (typeof exports !== 'undefined') {
            if (typeof module !== 'undefined' && module.exports) {
                exports = module.exports = _;
            }
            exports._ = _;
        } else {
            root._ = _;
        }
        _.VERSION = '1.7.0';
        var createCallback = function (func, context, argCount) {
            if (context === void 0)
                return func;
            switch (argCount == null ? 3 : argCount) {
            case 1:
                return function (value) {
                    return func.call(context, value);
                };
            case 2:
                return function (value, other) {
                    return func.call(context, value, other);
                };
            case 3:
                return function (value, index, collection) {
                    return func.call(context, value, index, collection);
                };
            case 4:
                return function (accumulator, value, index, collection) {
                    return func.call(context, accumulator, value, index, collection);
                };
            }
            return function () {
                return func.apply(context, arguments);
            };
        };
        _.iteratee = function (value, context, argCount) {
            if (value == null)
                return _.identity;
            if (_.isFunction(value))
                return createCallback(value, context, argCount);
            if (_.isObject(value))
                return _.matches(value);
            return _.property(value);
        };
        _.each = _.forEach = function (obj, iteratee, context) {
            if (obj == null)
                return obj;
            iteratee = createCallback(iteratee, context);
            var i, length = obj.length;
            if (length === +length) {
                for (i = 0; i < length; i++) {
                    iteratee(obj[i], i, obj);
                }
            } else {
                var keys = _.keys(obj);
                for (i = 0, length = keys.length; i < length; i++) {
                    iteratee(obj[keys[i]], keys[i], obj);
                }
            }
            return obj;
        };
        _.map = _.collect = function (obj, iteratee, context) {
            if (obj == null)
                return [];
            iteratee = _.iteratee(iteratee, context);
            var keys = obj.length !== +obj.length && _.keys(obj), length = (keys || obj).length, results = Array(length), currentKey;
            for (var index = 0; index < length; index++) {
                currentKey = keys ? keys[index] : index;
                results[index] = iteratee(obj[currentKey], currentKey, obj);
            }
            return results;
        };
        var reduceError = 'Reduce of empty array with no initial value';
        _.reduce = _.foldl = _.inject = function (obj, iteratee, memo, context) {
            if (obj == null)
                obj = [];
            iteratee = createCallback(iteratee, context, 4);
            var keys = obj.length !== +obj.length && _.keys(obj), length = (keys || obj).length, index = 0, currentKey;
            if (arguments.length < 3) {
                if (!length)
                    throw new TypeError(reduceError);
                memo = obj[keys ? keys[index++] : index++];
            }
            for (; index < length; index++) {
                currentKey = keys ? keys[index] : index;
                memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
        };
        _.reduceRight = _.foldr = function (obj, iteratee, memo, context) {
            if (obj == null)
                obj = [];
            iteratee = createCallback(iteratee, context, 4);
            var keys = obj.length !== +obj.length && _.keys(obj), index = (keys || obj).length, currentKey;
            if (arguments.length < 3) {
                if (!index)
                    throw new TypeError(reduceError);
                memo = obj[keys ? keys[--index] : --index];
            }
            while (index--) {
                currentKey = keys ? keys[index] : index;
                memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
        };
        _.find = _.detect = function (obj, predicate, context) {
            var result;
            predicate = _.iteratee(predicate, context);
            _.some(obj, function (value, index, list) {
                if (predicate(value, index, list)) {
                    result = value;
                    return true;
                }
            });
            return result;
        };
        _.filter = _.select = function (obj, predicate, context) {
            var results = [];
            if (obj == null)
                return results;
            predicate = _.iteratee(predicate, context);
            _.each(obj, function (value, index, list) {
                if (predicate(value, index, list))
                    results.push(value);
            });
            return results;
        };
        _.reject = function (obj, predicate, context) {
            return _.filter(obj, _.negate(_.iteratee(predicate)), context);
        };
        _.every = _.all = function (obj, predicate, context) {
            if (obj == null)
                return true;
            predicate = _.iteratee(predicate, context);
            var keys = obj.length !== +obj.length && _.keys(obj), length = (keys || obj).length, index, currentKey;
            for (index = 0; index < length; index++) {
                currentKey = keys ? keys[index] : index;
                if (!predicate(obj[currentKey], currentKey, obj))
                    return false;
            }
            return true;
        };
        _.some = _.any = function (obj, predicate, context) {
            if (obj == null)
                return false;
            predicate = _.iteratee(predicate, context);
            var keys = obj.length !== +obj.length && _.keys(obj), length = (keys || obj).length, index, currentKey;
            for (index = 0; index < length; index++) {
                currentKey = keys ? keys[index] : index;
                if (predicate(obj[currentKey], currentKey, obj))
                    return true;
            }
            return false;
        };
        _.contains = _.include = function (obj, target) {
            if (obj == null)
                return false;
            if (obj.length !== +obj.length)
                obj = _.values(obj);
            return _.indexOf(obj, target) >= 0;
        };
        _.invoke = function (obj, method) {
            var args = slice.call(arguments, 2);
            var isFunc = _.isFunction(method);
            return _.map(obj, function (value) {
                return (isFunc ? method : value[method]).apply(value, args);
            });
        };
        _.pluck = function (obj, key) {
            return _.map(obj, _.property(key));
        };
        _.where = function (obj, attrs) {
            return _.filter(obj, _.matches(attrs));
        };
        _.findWhere = function (obj, attrs) {
            return _.find(obj, _.matches(attrs));
        };
        _.max = function (obj, iteratee, context) {
            var result = -Infinity, lastComputed = -Infinity, value, computed;
            if (iteratee == null && obj != null) {
                obj = obj.length === +obj.length ? obj : _.values(obj);
                for (var i = 0, length = obj.length; i < length; i++) {
                    value = obj[i];
                    if (value > result) {
                        result = value;
                    }
                }
            } else {
                iteratee = _.iteratee(iteratee, context);
                _.each(obj, function (value, index, list) {
                    computed = iteratee(value, index, list);
                    if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                        result = value;
                        lastComputed = computed;
                    }
                });
            }
            return result;
        };
        _.min = function (obj, iteratee, context) {
            var result = Infinity, lastComputed = Infinity, value, computed;
            if (iteratee == null && obj != null) {
                obj = obj.length === +obj.length ? obj : _.values(obj);
                for (var i = 0, length = obj.length; i < length; i++) {
                    value = obj[i];
                    if (value < result) {
                        result = value;
                    }
                }
            } else {
                iteratee = _.iteratee(iteratee, context);
                _.each(obj, function (value, index, list) {
                    computed = iteratee(value, index, list);
                    if (computed < lastComputed || computed === Infinity && result === Infinity) {
                        result = value;
                        lastComputed = computed;
                    }
                });
            }
            return result;
        };
        _.shuffle = function (obj) {
            var set = obj && obj.length === +obj.length ? obj : _.values(obj);
            var length = set.length;
            var shuffled = Array(length);
            for (var index = 0, rand; index < length; index++) {
                rand = _.random(0, index);
                if (rand !== index)
                    shuffled[index] = shuffled[rand];
                shuffled[rand] = set[index];
            }
            return shuffled;
        };
        _.sample = function (obj, n, guard) {
            if (n == null || guard) {
                if (obj.length !== +obj.length)
                    obj = _.values(obj);
                return obj[_.random(obj.length - 1)];
            }
            return _.shuffle(obj).slice(0, Math.max(0, n));
        };
        _.sortBy = function (obj, iteratee, context) {
            iteratee = _.iteratee(iteratee, context);
            return _.pluck(_.map(obj, function (value, index, list) {
                return {
                    value: value,
                    index: index,
                    criteria: iteratee(value, index, list)
                };
            }).sort(function (left, right) {
                var a = left.criteria;
                var b = right.criteria;
                if (a !== b) {
                    if (a > b || a === void 0)
                        return 1;
                    if (a < b || b === void 0)
                        return -1;
                }
                return left.index - right.index;
            }), 'value');
        };
        var group = function (behavior) {
            return function (obj, iteratee, context) {
                var result = {};
                iteratee = _.iteratee(iteratee, context);
                _.each(obj, function (value, index) {
                    var key = iteratee(value, index, obj);
                    behavior(result, value, key);
                });
                return result;
            };
        };
        _.groupBy = group(function (result, value, key) {
            if (_.has(result, key))
                result[key].push(value);
            else
                result[key] = [value];
        });
        _.indexBy = group(function (result, value, key) {
            result[key] = value;
        });
        _.countBy = group(function (result, value, key) {
            if (_.has(result, key))
                result[key]++;
            else
                result[key] = 1;
        });
        _.sortedIndex = function (array, obj, iteratee, context) {
            iteratee = _.iteratee(iteratee, context, 1);
            var value = iteratee(obj);
            var low = 0, high = array.length;
            while (low < high) {
                var mid = low + high >>> 1;
                if (iteratee(array[mid]) < value)
                    low = mid + 1;
                else
                    high = mid;
            }
            return low;
        };
        _.toArray = function (obj) {
            if (!obj)
                return [];
            if (_.isArray(obj))
                return slice.call(obj);
            if (obj.length === +obj.length)
                return _.map(obj, _.identity);
            return _.values(obj);
        };
        _.size = function (obj) {
            if (obj == null)
                return 0;
            return obj.length === +obj.length ? obj.length : _.keys(obj).length;
        };
        _.partition = function (obj, predicate, context) {
            predicate = _.iteratee(predicate, context);
            var pass = [], fail = [];
            _.each(obj, function (value, key, obj) {
                (predicate(value, key, obj) ? pass : fail).push(value);
            });
            return [
                pass,
                fail
            ];
        };
        _.first = _.head = _.take = function (array, n, guard) {
            if (array == null)
                return void 0;
            if (n == null || guard)
                return array[0];
            if (n < 0)
                return [];
            return slice.call(array, 0, n);
        };
        _.initial = function (array, n, guard) {
            return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
        };
        _.last = function (array, n, guard) {
            if (array == null)
                return void 0;
            if (n == null || guard)
                return array[array.length - 1];
            return slice.call(array, Math.max(array.length - n, 0));
        };
        _.rest = _.tail = _.drop = function (array, n, guard) {
            return slice.call(array, n == null || guard ? 1 : n);
        };
        _.compact = function (array) {
            return _.filter(array, _.identity);
        };
        var flatten = function (input, shallow, strict, output) {
            if (shallow && _.every(input, _.isArray)) {
                return concat.apply(output, input);
            }
            for (var i = 0, length = input.length; i < length; i++) {
                var value = input[i];
                if (!_.isArray(value) && !_.isArguments(value)) {
                    if (!strict)
                        output.push(value);
                } else if (shallow) {
                    push.apply(output, value);
                } else {
                    flatten(value, shallow, strict, output);
                }
            }
            return output;
        };
        _.flatten = function (array, shallow) {
            return flatten(array, shallow, false, []);
        };
        _.without = function (array) {
            return _.difference(array, slice.call(arguments, 1));
        };
        _.uniq = _.unique = function (array, isSorted, iteratee, context) {
            if (array == null)
                return [];
            if (!_.isBoolean(isSorted)) {
                context = iteratee;
                iteratee = isSorted;
                isSorted = false;
            }
            if (iteratee != null)
                iteratee = _.iteratee(iteratee, context);
            var result = [];
            var seen = [];
            for (var i = 0, length = array.length; i < length; i++) {
                var value = array[i];
                if (isSorted) {
                    if (!i || seen !== value)
                        result.push(value);
                    seen = value;
                } else if (iteratee) {
                    var computed = iteratee(value, i, array);
                    if (_.indexOf(seen, computed) < 0) {
                        seen.push(computed);
                        result.push(value);
                    }
                } else if (_.indexOf(result, value) < 0) {
                    result.push(value);
                }
            }
            return result;
        };
        _.union = function () {
            return _.uniq(flatten(arguments, true, true, []));
        };
        _.intersection = function (array) {
            if (array == null)
                return [];
            var result = [];
            var argsLength = arguments.length;
            for (var i = 0, length = array.length; i < length; i++) {
                var item = array[i];
                if (_.contains(result, item))
                    continue;
                for (var j = 1; j < argsLength; j++) {
                    if (!_.contains(arguments[j], item))
                        break;
                }
                if (j === argsLength)
                    result.push(item);
            }
            return result;
        };
        _.difference = function (array) {
            var rest = flatten(slice.call(arguments, 1), true, true, []);
            return _.filter(array, function (value) {
                return !_.contains(rest, value);
            });
        };
        _.zip = function (array) {
            if (array == null)
                return [];
            var length = _.max(arguments, 'length').length;
            var results = Array(length);
            for (var i = 0; i < length; i++) {
                results[i] = _.pluck(arguments, i);
            }
            return results;
        };
        _.object = function (list, values) {
            if (list == null)
                return {};
            var result = {};
            for (var i = 0, length = list.length; i < length; i++) {
                if (values) {
                    result[list[i]] = values[i];
                } else {
                    result[list[i][0]] = list[i][1];
                }
            }
            return result;
        };
        _.indexOf = function (array, item, isSorted) {
            if (array == null)
                return -1;
            var i = 0, length = array.length;
            if (isSorted) {
                if (typeof isSorted == 'number') {
                    i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
                } else {
                    i = _.sortedIndex(array, item);
                    return array[i] === item ? i : -1;
                }
            }
            for (; i < length; i++)
                if (array[i] === item)
                    return i;
            return -1;
        };
        _.lastIndexOf = function (array, item, from) {
            if (array == null)
                return -1;
            var idx = array.length;
            if (typeof from == 'number') {
                idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
            }
            while (--idx >= 0)
                if (array[idx] === item)
                    return idx;
            return -1;
        };
        _.range = function (start, stop, step) {
            if (arguments.length <= 1) {
                stop = start || 0;
                start = 0;
            }
            step = step || 1;
            var length = Math.max(Math.ceil((stop - start) / step), 0);
            var range = Array(length);
            for (var idx = 0; idx < length; idx++, start += step) {
                range[idx] = start;
            }
            return range;
        };
        var Ctor = function () {
        };
        _.bind = function (func, context) {
            var args, bound;
            if (nativeBind && func.bind === nativeBind)
                return nativeBind.apply(func, slice.call(arguments, 1));
            if (!_.isFunction(func))
                throw new TypeError('Bind must be called on a function');
            args = slice.call(arguments, 2);
            bound = function () {
                if (!(this instanceof bound))
                    return func.apply(context, args.concat(slice.call(arguments)));
                Ctor.prototype = func.prototype;
                var self = new Ctor();
                Ctor.prototype = null;
                var result = func.apply(self, args.concat(slice.call(arguments)));
                if (_.isObject(result))
                    return result;
                return self;
            };
            return bound;
        };
        _.partial = function (func) {
            var boundArgs = slice.call(arguments, 1);
            return function () {
                var position = 0;
                var args = boundArgs.slice();
                for (var i = 0, length = args.length; i < length; i++) {
                    if (args[i] === _)
                        args[i] = arguments[position++];
                }
                while (position < arguments.length)
                    args.push(arguments[position++]);
                return func.apply(this, args);
            };
        };
        _.bindAll = function (obj) {
            var i, length = arguments.length, key;
            if (length <= 1)
                throw new Error('bindAll must be passed function names');
            for (i = 1; i < length; i++) {
                key = arguments[i];
                obj[key] = _.bind(obj[key], obj);
            }
            return obj;
        };
        _.memoize = function (func, hasher) {
            var memoize = function (key) {
                var cache = memoize.cache;
                var address = hasher ? hasher.apply(this, arguments) : key;
                if (!_.has(cache, address))
                    cache[address] = func.apply(this, arguments);
                return cache[address];
            };
            memoize.cache = {};
            return memoize;
        };
        _.delay = function (func, wait) {
            var args = slice.call(arguments, 2);
            return setTimeout(function () {
                return func.apply(null, args);
            }, wait);
        };
        _.defer = function (func) {
            return _.delay.apply(_, [
                func,
                1
            ].concat(slice.call(arguments, 1)));
        };
        _.throttle = function (func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options)
                options = {};
            var later = function () {
                previous = options.leading === false ? 0 : _.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout)
                    context = args = null;
            };
            return function () {
                var now = _.now();
                if (!previous && options.leading === false)
                    previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout)
                        context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        };
        _.debounce = function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;
            var later = function () {
                var last = _.now() - timestamp;
                if (last < wait && last > 0) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) {
                        result = func.apply(context, args);
                        if (!timeout)
                            context = args = null;
                    }
                }
            };
            return function () {
                context = this;
                args = arguments;
                timestamp = _.now();
                var callNow = immediate && !timeout;
                if (!timeout)
                    timeout = setTimeout(later, wait);
                if (callNow) {
                    result = func.apply(context, args);
                    context = args = null;
                }
                return result;
            };
        };
        _.wrap = function (func, wrapper) {
            return _.partial(wrapper, func);
        };
        _.negate = function (predicate) {
            return function () {
                return !predicate.apply(this, arguments);
            };
        };
        _.compose = function () {
            var args = arguments;
            var start = args.length - 1;
            return function () {
                var i = start;
                var result = args[start].apply(this, arguments);
                while (i--)
                    result = args[i].call(this, result);
                return result;
            };
        };
        _.after = function (times, func) {
            return function () {
                if (--times < 1) {
                    return func.apply(this, arguments);
                }
            };
        };
        _.before = function (times, func) {
            var memo;
            return function () {
                if (--times > 0) {
                    memo = func.apply(this, arguments);
                } else {
                    func = null;
                }
                return memo;
            };
        };
        _.once = _.partial(_.before, 2);
        _.keys = function (obj) {
            if (!_.isObject(obj))
                return [];
            if (nativeKeys)
                return nativeKeys(obj);
            var keys = [];
            for (var key in obj)
                if (_.has(obj, key))
                    keys.push(key);
            return keys;
        };
        _.values = function (obj) {
            var keys = _.keys(obj);
            var length = keys.length;
            var values = Array(length);
            for (var i = 0; i < length; i++) {
                values[i] = obj[keys[i]];
            }
            return values;
        };
        _.pairs = function (obj) {
            var keys = _.keys(obj);
            var length = keys.length;
            var pairs = Array(length);
            for (var i = 0; i < length; i++) {
                pairs[i] = [
                    keys[i],
                    obj[keys[i]]
                ];
            }
            return pairs;
        };
        _.invert = function (obj) {
            var result = {};
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                result[obj[keys[i]]] = keys[i];
            }
            return result;
        };
        _.functions = _.methods = function (obj) {
            var names = [];
            for (var key in obj) {
                if (_.isFunction(obj[key]))
                    names.push(key);
            }
            return names.sort();
        };
        _.extend = function (obj) {
            if (!_.isObject(obj))
                return obj;
            var source, prop;
            for (var i = 1, length = arguments.length; i < length; i++) {
                source = arguments[i];
                for (prop in source) {
                    if (hasOwnProperty.call(source, prop)) {
                        obj[prop] = source[prop];
                    }
                }
            }
            return obj;
        };
        _.pick = function (obj, iteratee, context) {
            var result = {}, key;
            if (obj == null)
                return result;
            if (_.isFunction(iteratee)) {
                iteratee = createCallback(iteratee, context);
                for (key in obj) {
                    var value = obj[key];
                    if (iteratee(value, key, obj))
                        result[key] = value;
                }
            } else {
                var keys = concat.apply([], slice.call(arguments, 1));
                obj = new Object(obj);
                for (var i = 0, length = keys.length; i < length; i++) {
                    key = keys[i];
                    if (key in obj)
                        result[key] = obj[key];
                }
            }
            return result;
        };
        _.omit = function (obj, iteratee, context) {
            if (_.isFunction(iteratee)) {
                iteratee = _.negate(iteratee);
            } else {
                var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
                iteratee = function (value, key) {
                    return !_.contains(keys, key);
                };
            }
            return _.pick(obj, iteratee, context);
        };
        _.defaults = function (obj) {
            if (!_.isObject(obj))
                return obj;
            for (var i = 1, length = arguments.length; i < length; i++) {
                var source = arguments[i];
                for (var prop in source) {
                    if (obj[prop] === void 0)
                        obj[prop] = source[prop];
                }
            }
            return obj;
        };
        _.clone = function (obj) {
            if (!_.isObject(obj))
                return obj;
            return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
        };
        _.tap = function (obj, interceptor) {
            interceptor(obj);
            return obj;
        };
        var eq = function (a, b, aStack, bStack) {
            if (a === b)
                return a !== 0 || 1 / a === 1 / b;
            if (a == null || b == null)
                return a === b;
            if (a instanceof _)
                a = a._wrapped;
            if (b instanceof _)
                b = b._wrapped;
            var className = toString.call(a);
            if (className !== toString.call(b))
                return false;
            switch (className) {
            case '[object RegExp]':
            case '[object String]':
                return '' + a === '' + b;
            case '[object Number]':
                if (+a !== +a)
                    return +b !== +b;
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                return +a === +b;
            }
            if (typeof a != 'object' || typeof b != 'object')
                return false;
            var length = aStack.length;
            while (length--) {
                if (aStack[length] === a)
                    return bStack[length] === b;
            }
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && 'constructor' in a && 'constructor' in b && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor)) {
                return false;
            }
            aStack.push(a);
            bStack.push(b);
            var size, result;
            if (className === '[object Array]') {
                size = a.length;
                result = size === b.length;
                if (result) {
                    while (size--) {
                        if (!(result = eq(a[size], b[size], aStack, bStack)))
                            break;
                    }
                }
            } else {
                var keys = _.keys(a), key;
                size = keys.length;
                result = _.keys(b).length === size;
                if (result) {
                    while (size--) {
                        key = keys[size];
                        if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack)))
                            break;
                    }
                }
            }
            aStack.pop();
            bStack.pop();
            return result;
        };
        _.isEqual = function (a, b) {
            return eq(a, b, [], []);
        };
        _.isEmpty = function (obj) {
            if (obj == null)
                return true;
            if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))
                return obj.length === 0;
            for (var key in obj)
                if (_.has(obj, key))
                    return false;
            return true;
        };
        _.isElement = function (obj) {
            return !!(obj && obj.nodeType === 1);
        };
        _.isArray = nativeIsArray || function (obj) {
            return toString.call(obj) === '[object Array]';
        };
        _.isObject = function (obj) {
            var type = typeof obj;
            return type === 'function' || type === 'object' && !!obj;
        };
        _.each([
            'Arguments',
            'Function',
            'String',
            'Number',
            'Date',
            'RegExp'
        ], function (name) {
            _['is' + name] = function (obj) {
                return toString.call(obj) === '[object ' + name + ']';
            };
        });
        if (!_.isArguments(arguments)) {
            _.isArguments = function (obj) {
                return _.has(obj, 'callee');
            };
        }
        if (typeof /./ !== 'function') {
            _.isFunction = function (obj) {
                return typeof obj == 'function' || false;
            };
        }
        _.isFinite = function (obj) {
            return isFinite(obj) && !isNaN(parseFloat(obj));
        };
        _.isNaN = function (obj) {
            return _.isNumber(obj) && obj !== +obj;
        };
        _.isBoolean = function (obj) {
            return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
        };
        _.isNull = function (obj) {
            return obj === null;
        };
        _.isUndefined = function (obj) {
            return obj === void 0;
        };
        _.has = function (obj, key) {
            return obj != null && hasOwnProperty.call(obj, key);
        };
        _.noConflict = function () {
            root._ = previousUnderscore;
            return this;
        };
        _.identity = function (value) {
            return value;
        };
        _.constant = function (value) {
            return function () {
                return value;
            };
        };
        _.noop = function () {
        };
        _.property = function (key) {
            return function (obj) {
                return obj[key];
            };
        };
        _.matches = function (attrs) {
            var pairs = _.pairs(attrs), length = pairs.length;
            return function (obj) {
                if (obj == null)
                    return !length;
                obj = new Object(obj);
                for (var i = 0; i < length; i++) {
                    var pair = pairs[i], key = pair[0];
                    if (pair[1] !== obj[key] || !(key in obj))
                        return false;
                }
                return true;
            };
        };
        _.times = function (n, iteratee, context) {
            var accum = Array(Math.max(0, n));
            iteratee = createCallback(iteratee, context, 1);
            for (var i = 0; i < n; i++)
                accum[i] = iteratee(i);
            return accum;
        };
        _.random = function (min, max) {
            if (max == null) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        };
        _.now = Date.now || function () {
            return new Date().getTime();
        };
        var escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#x27;',
            '`': '&#x60;'
        };
        var unescapeMap = _.invert(escapeMap);
        var createEscaper = function (map) {
            var escaper = function (match) {
                return map[match];
            };
            var source = '(?:' + _.keys(map).join('|') + ')';
            var testRegexp = RegExp(source);
            var replaceRegexp = RegExp(source, 'g');
            return function (string) {
                string = string == null ? '' : '' + string;
                return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
            };
        };
        _.escape = createEscaper(escapeMap);
        _.unescape = createEscaper(unescapeMap);
        _.result = function (object, property) {
            if (object == null)
                return void 0;
            var value = object[property];
            return _.isFunction(value) ? object[property]() : value;
        };
        var idCounter = 0;
        _.uniqueId = function (prefix) {
            var id = ++idCounter + '';
            return prefix ? prefix + id : id;
        };
        _.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        };
        var noMatch = /(.)^/;
        var escapes = {
            '\'': '\'',
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        };
        var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
        var escapeChar = function (match) {
            return '\\' + escapes[match];
        };
        _.template = function (text, settings, oldSettings) {
            if (!settings && oldSettings)
                settings = oldSettings;
            settings = _.defaults({}, settings, _.templateSettings);
            var matcher = RegExp([
                (settings.escape || noMatch).source,
                (settings.interpolate || noMatch).source,
                (settings.evaluate || noMatch).source
            ].join('|') + '|$', 'g');
            var index = 0;
            var source = '__p+=\'';
            text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
                source += text.slice(index, offset).replace(escaper, escapeChar);
                index = offset + match.length;
                if (escape) {
                    source += '\'+\n((__t=(' + escape + '))==null?\'\':_.escape(__t))+\n\'';
                } else if (interpolate) {
                    source += '\'+\n((__t=(' + interpolate + '))==null?\'\':__t)+\n\'';
                } else if (evaluate) {
                    source += '\';\n' + evaluate + '\n__p+=\'';
                }
                return match;
            });
            source += '\';\n';
            if (!settings.variable)
                source = 'with(obj||{}){\n' + source + '}\n';
            source = 'var __t,__p=\'\',__j=Array.prototype.join,' + 'print=function(){__p+=__j.call(arguments,\'\');};\n' + source + 'return __p;\n';
            try {
                var render = new Function(settings.variable || 'obj', '_', source);
            } catch (e) {
                e.source = source;
                throw e;
            }
            var template = function (data) {
                return render.call(this, data, _);
            };
            var argument = settings.variable || 'obj';
            template.source = 'function(' + argument + '){\n' + source + '}';
            return template;
        };
        _.chain = function (obj) {
            var instance = _(obj);
            instance._chain = true;
            return instance;
        };
        var result = function (obj) {
            return this._chain ? _(obj).chain() : obj;
        };
        _.mixin = function (obj) {
            _.each(_.functions(obj), function (name) {
                var func = _[name] = obj[name];
                _.prototype[name] = function () {
                    var args = [this._wrapped];
                    push.apply(args, arguments);
                    return result.call(this, func.apply(_, args));
                };
            });
        };
        _.mixin(_);
        _.each([
            'pop',
            'push',
            'reverse',
            'shift',
            'sort',
            'splice',
            'unshift'
        ], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
                var obj = this._wrapped;
                method.apply(obj, arguments);
                if ((name === 'shift' || name === 'splice') && obj.length === 0)
                    delete obj[0];
                return result.call(this, obj);
            };
        });
        _.each([
            'concat',
            'join',
            'slice'
        ], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
                return result.call(this, method.apply(this._wrapped, arguments));
            };
        });
        _.prototype.value = function () {
            return this._wrapped;
        };
        if (typeof define === 'function' && define.amd) {
            define('underscore', [], function () {
                return _;
            });
        }
    }.call(this));
    return _;
});
define('B', [
    '_',
    '$'
], function () {
    (function () {
        var root = this;
        var previousBackbone = root.Backbone;
        var array = [];
        var push = array.push;
        var slice = array.slice;
        var splice = array.splice;
        var Backbone;
        if (typeof exports !== 'undefined') {
            Backbone = exports;
        } else {
            Backbone = root.Backbone = {};
        }
        Backbone.VERSION = '1.0.0';
        var _ = root._;
        if (!_ && typeof require !== 'undefined')
            _ = require('underscore');
        Backbone.$ = root.jQuery || root.Zepto || root.ender || root.$;
        Backbone.noConflict = function () {
            root.Backbone = previousBackbone;
            return this;
        };
        Backbone.emulateHTTP = false;
        Backbone.emulateJSON = false;
        var Events = Backbone.Events = {
            on: function (name, callback, context) {
                if (!eventsApi(this, 'on', name, [
                        callback,
                        context
                    ]) || !callback)
                    return this;
                this._events || (this._events = {});
                var events = this._events[name] || (this._events[name] = []);
                events.push({
                    callback: callback,
                    context: context,
                    ctx: context || this
                });
                return this;
            },
            once: function (name, callback, context) {
                if (!eventsApi(this, 'once', name, [
                        callback,
                        context
                    ]) || !callback)
                    return this;
                var self = this;
                var once = _.once(function () {
                    self.off(name, once);
                    callback.apply(this, arguments);
                });
                once._callback = callback;
                return this.on(name, once, context);
            },
            off: function (name, callback, context) {
                var retain, ev, events, names, i, l, j, k;
                if (!this._events || !eventsApi(this, 'off', name, [
                        callback,
                        context
                    ]))
                    return this;
                if (!name && !callback && !context) {
                    this._events = {};
                    return this;
                }
                names = name ? [name] : _.keys(this._events);
                for (i = 0, l = names.length; i < l; i++) {
                    name = names[i];
                    if (events = this._events[name]) {
                        this._events[name] = retain = [];
                        if (callback || context) {
                            for (j = 0, k = events.length; j < k; j++) {
                                ev = events[j];
                                if (callback && callback !== ev.callback && callback !== ev.callback._callback || context && context !== ev.context) {
                                    retain.push(ev);
                                }
                            }
                        }
                        if (!retain.length)
                            delete this._events[name];
                    }
                }
                return this;
            },
            trigger: function (name) {
                if (!this._events)
                    return this;
                var args = slice.call(arguments, 1);
                if (!eventsApi(this, 'trigger', name, args))
                    return this;
                var events = this._events[name];
                var allEvents = this._events.all;
                if (events)
                    triggerEvents(events, args);
                if (allEvents)
                    triggerEvents(allEvents, arguments);
                return this;
            },
            stopListening: function (obj, name, callback) {
                var listeners = this._listeners;
                if (!listeners)
                    return this;
                var deleteListener = !name && !callback;
                if (typeof name === 'object')
                    callback = this;
                if (obj)
                    (listeners = {})[obj._listenerId] = obj;
                for (var id in listeners) {
                    listeners[id].off(name, callback, this);
                    if (deleteListener)
                        delete this._listeners[id];
                }
                return this;
            }
        };
        var eventSplitter = /\s+/;
        var eventsApi = function (obj, action, name, rest) {
            if (!name)
                return true;
            if (typeof name === 'object') {
                for (var key in name) {
                    obj[action].apply(obj, [
                        key,
                        name[key]
                    ].concat(rest));
                }
                return false;
            }
            if (eventSplitter.test(name)) {
                var names = name.split(eventSplitter);
                for (var i = 0, l = names.length; i < l; i++) {
                    obj[action].apply(obj, [names[i]].concat(rest));
                }
                return false;
            }
            return true;
        };
        var triggerEvents = function (events, args) {
            var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
            switch (args.length) {
            case 0:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx);
                return;
            case 1:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx, a1);
                return;
            case 2:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx, a1, a2);
                return;
            case 3:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
                return;
            default:
                while (++i < l)
                    (ev = events[i]).callback.apply(ev.ctx, args);
            }
        };
        var listenMethods = {
            listenTo: 'on',
            listenToOnce: 'once'
        };
        _.each(listenMethods, function (implementation, method) {
            Events[method] = function (obj, name, callback) {
                var listeners = this._listeners || (this._listeners = {});
                var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
                listeners[id] = obj;
                if (typeof name === 'object')
                    callback = this;
                obj[implementation](name, callback, this);
                return this;
            };
        });
        Events.bind = Events.on;
        Events.unbind = Events.off;
        _.extend(Backbone, Events);
        var View = Backbone.View = function (options) {
            this.cid = _.uniqueId('view');
            this._configure(options || {});
            this._ensureElement();
            this.initialize.apply(this, arguments);
            this.delegateEvents();
        };
        var delegateEventSplitter = /^(\S+)\s*(.*)$/;
        var viewOptions = [
            'model',
            'collection',
            'el',
            'id',
            'attributes',
            'className',
            'tagName',
            'events'
        ];
        _.extend(View.prototype, Events, {
            tagName: 'div',
            $: function (selector) {
                return this.$el.find(selector);
            },
            initialize: function () {
            },
            render: function () {
                return this;
            },
            remove: function () {
                this.$el.remove();
                this.stopListening();
                return this;
            },
            setElement: function (element, delegate) {
                if (this.$el)
                    this.undelegateEvents();
                this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
                this.el = this.$el[0];
                if (delegate !== false)
                    this.delegateEvents();
                return this;
            },
            delegateEvents: function (events) {
                if (!(events || (events = _.result(this, 'events'))))
                    return this;
                this.undelegateEvents();
                for (var key in events) {
                    var method = events[key];
                    if (!_.isFunction(method))
                        method = this[events[key]];
                    if (!method)
                        continue;
                    var match = key.match(delegateEventSplitter);
                    var eventName = match[1], selector = match[2];
                    method = _.bind(method, this);
                    eventName += '.delegateEvents' + this.cid;
                    if (selector === '') {
                        this.$el.on(eventName, method);
                    } else {
                        this.$el.on(eventName, selector, method);
                    }
                }
                return this;
            },
            undelegateEvents: function () {
                this.$el.off('.delegateEvents' + this.cid);
                return this;
            },
            _configure: function (options) {
                if (this.options)
                    options = _.extend({}, _.result(this, 'options'), options);
                _.extend(this, _.pick(options, viewOptions));
                this.options = options;
            },
            _ensureElement: function () {
                if (!this.el) {
                    var attrs = _.extend({}, _.result(this, 'attributes'));
                    if (this.id)
                        attrs.id = _.result(this, 'id');
                    if (this.className)
                        attrs['class'] = _.result(this, 'className');
                    var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
                    this.setElement($el, false);
                } else {
                    this.setElement(_.result(this, 'el'), false);
                }
            }
        });
        var extend = function (protoProps, staticProps) {
            var parent = this;
            var child;
            if (protoProps && _.has(protoProps, 'constructor')) {
                child = protoProps.constructor;
            } else {
                child = function () {
                    return parent.apply(this, arguments);
                };
            }
            _.extend(child, parent, staticProps);
            var Surrogate = function () {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate();
            if (protoProps)
                _.extend(child.prototype, protoProps);
            child.__super__ = parent.prototype;
            return child;
        };
        View.extend = extend;
    }.call(this));
    return Backbone;
});
define('libs', [
    '$',
    '_',
    'B'
], function () {
});
define('inherit', ['libs'], function (libs) {
    var slice = [].slice;
    var Core = function () {
    };
    Core.Class = function () {
        if (arguments.length == 0 || arguments.length > 2)
            throw '参数错误';
        var parent = null;
        var properties = slice.call(arguments);
        if (typeof properties[0] === 'function')
            parent = properties.shift();
        properties = properties[0];
        function klass() {
            this.__propertys__();
            this.initialize.apply(this, arguments);
        }
        klass.superclass = parent;
        klass.subclasses = [];
        var sup__propertys__ = function () {
        };
        var sub__propertys__ = properties.__propertys__ || function () {
        };
        if (parent) {
            if (parent.prototype.__propertys__)
                sup__propertys__ = parent.prototype.__propertys__;
            var subclass = function () {
            };
            subclass.prototype = parent.prototype;
            klass.prototype = new subclass();
            parent.subclasses.push(klass);
        }
        var ancestor = klass.superclass && klass.superclass.prototype;
        for (var k in properties) {
            var value = properties[k];
            if (ancestor && typeof value == 'function') {
                var argslist = /^\s*function\s*\(([^\(\)]*?)\)\s*?\{/i.exec(value.toString())[1].replace(/\s/i, '').split(',');
                if (argslist[0] === '$super' && ancestor[k]) {
                    value = function (methodName, fn) {
                        return function () {
                            var scope = this;
                            var args = [function () {
                                    return ancestor[methodName].apply(scope, arguments);
                                }];
                            return fn.apply(this, args.concat(slice.call(arguments)));
                        };
                    }(k, value);
                }
            }
            klass.prototype[k] = value;
        }
        if (!klass.prototype.initialize)
            klass.prototype.initialize = function () {
            };
        klass.prototype.__propertys__ = function () {
            sup__propertys__.call(this);
            sub__propertys__.call(this);
        };
        for (key in parent) {
            if (parent.hasOwnProperty(key) && key !== 'prototype' && key !== 'superclass')
                klass[key] = parent[key];
        }
        klass.prototype.constructor = klass;
        return klass;
    };
    Core.extend = function () {
        var args = slice.call(arguments);
        var source = args.shift() || {};
        if (!source)
            return false;
        for (var i = 0, l = args.length; i < l; i++) {
            if (typeof args[i] === 'object') {
                for (var key in args[i]) {
                    source[key] = args[i][key];
                }
            }
        }
        return source;
    };
    Core.implement = function (fn, propertys) {
        if (typeof fn !== 'function')
            return false;
        for (var i in propertys) {
            fn.prototype[i] = propertys[i];
        }
        return fn;
    };
    return Core;
});
define('pageview', ['libs'], function (libs) {
    var PageView = Backbone.View.extend({
        initialize: function () {
            this.id = this.$el.attr('id');
            this.create();
            this.triggerShow = true;
            this.triggerHide = true;
            this.switchByOut = false;
        },
        create: function () {
            this.onCreate && this.onCreate();
        },
        destroy: function () {
            this.$el.remove();
        },
        show: function () {
            document.activeElement && document.activeElement.blur();
            this.switchByOut && this.$el.show();
            this.triggerShow && this.onShow && this.onShow();
            this.triggerShow = true;
            this.triggerHide = true;
            this.switchByOut = true;
        },
        hide: function () {
            this.triggerHide && this.onHide && this.onHide();
            this.removeScrollListener && this.removeScrollListener();
            this.$el.hide();
        }
    });
    return PageView;
});
define('pageparser', ['inherit'], function () {
    var uuid = 0;
    var pageDocNode = null;
    function getID(url) {
        var id = 'client_id_viewport_' + ++uuid + '_' + new Date().getTime();
        return id;
    }
    ;
    alros._initParser = function (url, html) {
        pageDocNode = $('<DIV>' + html + '</DIV>');
        var pageConfig = getPageConfig();
        pageConfig.pageUrl = url;
        return pageConfig;
    };
    alros.render = function (pageConfig) {
        var ret = {
            header: '',
            viewport: ''
        };
        var id = getID(pageConfig.pageUrl);
        ret.viewport = [
            '<div id="',
            id,
            '" page-url="',
            pageConfig.pageUrl,
            '">',
            ret.viewport,
            '</div>'
        ].join('').trim();
        ret.id = id;
        ret.controller = pageConfig.controller;
        ret.config = pageConfig;
        return ret;
    };
    function getPageConfig() {
        var configStr = getPageConfigStr();
        eval('ret = ' + configStr);
        if (!ret.viewName) {
            if (ret.controller) {
                var viewName = ret.controller.substring(ret.controller.lastIndexOf('/') + 1);
                ret.viewName = viewName.substring(0, viewName.indexOf('.'));
            } else {
                ret.viewName = 'emptyName';
            }
        }
        return ret;
    }
    function getPageConfigStr() {
        var configStr = pageDocNode.find('script[type="text/lizard-config"]').text();
        if (!configStr) {
            configStr = '{"url_schema": "","model": {"apis": []},"view":{}}';
        }
        return configStr;
    }
});
define('pagedefault', [], function () {
    var renderAt = $('.main-viewport').attr('renderat');
    alros.renderAt = 'server';
    if (!renderAt)
        alros.renderAt = 'client';
    function PageView(options) {
        this.initialize(options);
    }
    PageView.subclasses = [], PageView.defaults = {
        'mainRoot': '#main',
        'viewport': '.main-viewport'
    };
    PageView.prototype = {
        initProperty: function (options) {
            var opts = _.extend({}, PageView.defaults, options || {});
            return opts;
        },
        initialize: function (options) {
            var opts = this.initProperty(options);
            this.options = opts;
            this.mainRoot = $(opts.mainRoot);
            this.viewport = this.mainRoot.find(opts.viewport);
            this.curView = null;
            this.lastView = null;
            this.views = {};
            this.bindEvents();
        },
        bindEvents: function () {
        },
        showView: function (e) {
            this.loadView(e.url, e.text, e.options);
        },
        loadView: function (url, html, options) {
            var pageConfig = alros._initParser(url, html);
            var renderObj = alros.render(pageConfig);
            require([renderObj.config.controller || 'cPageView'], _.bind(function (View) {
                if (_.isFunction(this.judgeForward) && !this.judgeForward(url)) {
                    return;
                }
                if (this.curView)
                    this.lastView = this.curView;
                if (renderObj.config.viewName && this.views[renderObj.config.viewName]) {
                    this.curView = this.views[renderObj.config.viewName];
                    if (this.curView.$el.attr('page-url') != url) {
                        this.curView.$el.remove();
                        this.curView.$el = $(renderObj.viewport).appendTo(this.viewport);
                        this.curView.onCreate && this.curView.onCreate();
                        this.curView.delegateEvents();
                    }
                } else {
                    this.curView = new View({ el: options.renderAt == 'server' ? this.viewport.children().first() : $(renderObj.viewport).appendTo(this.viewport) });
                    this.curView.$el.attr('page-url', url);
                    this.switchView(this.curView, this.lastView);
                    if (renderObj.config.viewName) {
                        this.views[renderObj.config.viewName] = this.curView;
                    }
                }
                if (this.curView && this.curView.switchByOut) {
                    var self = this;
                    self.lastView && self.lastView.hide();
                    self.curView.$el.show();
                }
            }, this));
        },
        switchView: function (inView, outView) {
            if (outView && !document.getElementById(outView.id) && (inView && !inView.switchByOut)) {
                outView.$el.appendTo(this.viewport);
                outView.$el.hide();
            }
            if (inView && !document.getElementById(inView.id)) {
                inView.$el.appendTo(this.viewport);
                inView.$el.hide();
            }
            if (outView) {
                inView && !inView.switchByOut && outView.hide();
            }
            inView.show();
        },
        goTo: function (url, opt) {
        },
        goBack: function () {
        },
        start: function () {
        },
        go: function () {
        },
        interface: function () {
            return {
                'goTo': this.goTo,
                'goBack': this.goBack,
                'forward': this.goTo,
                'back': this.goBack,
                'go': this.go,
                'start': this.start
            };
        }
    };
    return PageView;
});
define('utilPath', ['$'], function () {
    var Path = {};
    Path.parseUrl = function (url) {
        var urlParseRE = /^\s*(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;
        var matches = urlParseRE.exec(url || '') || [];
        return {
            href: matches[0] || '',
            hrefNoHash: matches[1] || '',
            hrefNoSearch: matches[2] || '',
            domain: matches[3] || '',
            protocol: matches[4] || '',
            doubleSlash: matches[5] || '',
            authority: matches[6] || '',
            username: matches[8] || '',
            password: matches[9] || '',
            host: matches[10] || '',
            hostname: matches[11] || '',
            port: matches[12] || '',
            pathname: matches[13] || '',
            directory: matches[14] || '',
            filename: matches[15] || '',
            search: matches[16] || '',
            hash: matches[17] || ''
        };
    };
    Path.getUrlParam = function (url, name) {
        var re = new RegExp('(\\?|&)' + name + '=([^&]+)(&|$)', 'i'), m = url.match(re);
        return m ? m[2] : '';
    };
    Path.getUrlParams = function (url) {
        var url = url.split('://');
        var searchReg = /([^&=?]+)=([^&]+)/g;
        var urlParams = {};
        var match, value, length, name;
        while (match = searchReg.exec(url[0])) {
            name = match[1];
            value = match[2];
            urlParams[name] = value;
        }
        if (url[1]) {
            var idx = 0;
            length = _.size(urlParams);
            _.each(urlParams, function (value, key) {
                if (++idx == length) {
                    urlParams[key] += '://' + url[1];
                }
            });
        }
        return urlParams;
    };
    return Path;
});
define('pageroute', [
    'inherit',
    'pagedefault',
    'utilPath'
], function (inherit, app, Path) {
    return inherit.Class(app, {
        bindEvents: function ($super) {
            $super();
            $(window).bind('popstate', _.bind(function (e) {
                var data = e.state || e.originalEvent && e.originalEvent.state;
                if (data.options) {
                    data.options.pushState = false;
                    data.options.landingpage = 0;
                    data.options.hideloading = true;
                }
                history.replaceState({
                    url: data.url,
                    text: data.text,
                    options: data.options
                }, document.title, data.url);
                this.showView(data);
            }, this));
        },
        start: function () {
            var self = this;
            var path = Path.parseUrl(location.href).pathname;
            path = '/' == path ? '/index' : location.href.substring(location.href.indexOf(path));
            history.pushState({
                url: path,
                text: document.documentElement.innerHTML,
                options: { pushState: false }
            }, document.title, path);
            self.loadView(path, document.documentElement.innerHTML, { pushState: false });
        },
        goTo: function (url, opt) {
            var self = this;
            $.get(url, opt ? opt.data : {}, function (html) {
                history.pushState({
                    url: url,
                    text: html,
                    options: { pushState: true }
                }, document.title, url);
                self.loadView(url, html, { pushState: true });
            });
        },
        goBack: function () {
            if (arguments.length == 0) {
                history.back();
            } else {
                this.goTo.apply(this, arguments);
            }
        },
        judgeForward: function (url) {
            var parseResult = Path.parseUrl(window.location.protocol + '//' + window.location.host + (url.indexOf('/') == 0 ? url : '/' + url)), reg = new RegExp(parseResult.pathname + '$');
            return reg.test(window.location.pathname);
        }
    });
});
define('test', [
    'R',
    '$',
    '_',
    'libs',
    'inherit',
    'pageview',
    'pageparser',
    'pagedefault',
    'pageroute',
    'utilPath'
], function () {
});