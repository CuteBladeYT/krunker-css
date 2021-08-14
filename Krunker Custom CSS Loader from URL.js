// ==UserScript==
// @name         Krunker Custom CSS Loader
// @version      1.1.0
// @description  Load custom CSS with URL to CSS file. This script also loads the css dynamically, so you will see the changes without refresing.
// @author       UnitedCatdom - Edit, SkidLamer - Code
// @match        https://krunker.io
// @icon         https://www.google.com/s2/favicons?domain=krunker.io
// @grant        none
// ==/UserScript==

(function(skidStr, CRC2d, skid) {

    function Log() {
        this.info = (str, args = []) => this.log('info', str, args);
        this.warn = (str, args = []) => this.log('warn', str, args);
        this.error = (str, args = []) => this.log('error', str, args);
        this.log = (level, str, args) => {
            let colour = [];
            switch(level) {
                case 'info':colour=["#07a1d5", "#6e07d5"];break;
                case 'error':colour=["#d50707", "#d53a07"];break;
                case 'warn':colour=["#d56e07", "#d5d507"];break;
            }
            console.log('%c '.concat('[ ', level.toUpperCase(), ' ] '), [
                `background: linear-gradient(${colour[0]}, ${colour[1]})`
                , 'border: 1px solid #3E0E02'
                , 'color: white'
                , 'display: block'
                , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
                , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
                , 'line-height: 12px'
                , 'text-align: center'
                , 'font-weight: bold'
            ].join(';'))
            if (args.length) console.log(str, args);
            else console.log(str);
        }
    } var log = new Log();

    class Skid {
        constructor() {
            skid = this;
            this.generated = false;
            this.gameJS = null;
            this.token = null;
            this.downKeys = new Set();
            this.settings = null;
            this.vars = {};
            this.playerMaps = [];
            this.skinCache = {};
            this.inputFrame = 0;
            this.renderFrame = 0;
            this.fps = 0;
            this.lists = {
                /*
                renderESP: {
                    off: "Off",
                    walls: "Walls",
                    twoD: "2d",
                    full: "Full"
                },
                renderChams: {
                    off: "Off",
                    "#FFFFFF": "White",
                    "#000000": "Black",
                    "#9400D3": "Purple",
                    "#FF1493": "Pink",
                    "#1E90FF": "Blue",
                    "#0000FF": "DarkBlue",
                    "#00FFFF": "Aqua",
                    "#008000": "Green",
                    "#7FFF00": "Lime",
                    "#FF8C00": "Orange",
                    "#FFFF00": "Yellow",
                    "#FF0000": "Red",
                    Rainbow: "Rainbow",
                },
                autoBhop: {
                    off: "Off",
                    autoJump: "Auto Jump",
                    keyJump: "Key Jump",
                    autoSlide: "Auto Slide",
                    keySlide: "Key Slide"
                },
                autoAim: {
                    off: "Off",
                    correction: "Aim Correction",
                    assist: "Legit Aim Assist",
                    easyassist: "Easy Aim Assist",
                    silent: "Silent Aim",
                    trigger: "Trigger Bot",
                    quickScope: "Quick Scope"
                },
                audioStreams: {
                    off: 'Off',
                    _2000s: 'General German/English',
                    _HipHopRNB: 'Hip Hop / RNB',
                    _Oldskool: 'Hip Hop Oldskool',
                    _Country: 'Country',
                    _Pop: 'Pop',
                    _Dance: 'Dance',
                    _Dubstep: 'DubStep',
                    _Lowfi: 'LoFi HipHop',
                    _Jazz: 'Jazz',
                    _Oldies: 'Golden Oldies',
                    _Club: 'Club',
                    _Folk: 'Folk',
                    _ClassicRock: 'Classic Rock',
                    _Metal: 'Heavy Metal',
                    _DeathMetal: 'Death Metal',
                    _Classical: 'Classical',
                    _Alternative: 'Alternative',
                },
                */
            }
            this.consts = {
                twoPI: Math.PI * 2,
                halfPI: Math.PI / 2,
                playerHeight: 11,
                cameraHeight: 1.5,
                headScale: 2,
                armScale: 1.3,
                armInset: 0.1,
                chestWidth: 2.6,
                hitBoxPad: 1,
                crouchDst: 3,
                recoilMlt: 0.3,
                nameOffset: 0.6,
                nameOffsetHat: 0.8,
            };
            /*
            this.key = {
                frame: 0,
                delta: 1,
                xdir: 2,
                ydir: 3,
                moveDir: 4,
                shoot: 5,
                scope: 6,
                jump: 7,
                reload: 8,
                crouch: 9,
                weaponScroll: 10,
                weaponSwap: 11,
                moveLock: 12
            };
            */
            this.css = {
                hideAdverts: `#aContainer, #aHolder, #endAContainer, #aMerger { display: none !important; }`,
                noTextShadows: `*, .button.small, .bigShadowT { text-shadow: none !important; }`,
            };
            this.isProxy = Symbol("isProxy");
            this.spinTimer = 1800;
            try {
                this.onLoad();
            }
            catch(e) {
                log.error(e);
                console.trace(e.stack);
            }
        }
        canStore() {
            return this.isDefined(Storage);
        }

        saveVal(name, val) {
            if (this.canStore()) localStorage.setItem("kro_utilities_"+name, val);
        }

        deleteVal(name) {
            if (this.canStore()) localStorage.removeItem("kro_utilities_"+name);
        }

        getSavedVal(name) {
            if (this.canStore()) return localStorage.getItem("kro_utilities_"+name);
            return null;
        }

        isType(item, type) {
            return typeof item === type;
        }

        isDefined(object) {
            return !this.isType(object, "undefined") && object !== null;
        }

        isNative(fn) {
            return (/^function\s*[a-z0-9_\$]*\s*\([^)]*\)\s*\{\s*\[native code\]\s*\}/i).test('' + fn)
        }

        getStatic(s, d) {
            return this.isDefined(s) ? s : d
        }

        crossDomain(url) {
            return "https://crossorigin.me/" + url;
        }

        async waitFor(test, timeout_ms = Infinity, doWhile = null) {
            let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
            return new Promise(async (resolve, reject) => {
                if (typeof timeout_ms != "number") reject("Timeout argument not a number in waitFor(selector, timeout_ms)");
                let result, freq = 100;
                while (result === undefined || result === false || result === null || result.length === 0) {
                    if (doWhile && doWhile instanceof Function) doWhile();
                    if (timeout_ms % 1e4 < freq) console.log("waiting for: ", test);
                    if ((timeout_ms -= freq) < 0) {
                        log.error( "Timeout : ", test );
                        resolve(false);
                        return;
                    }
                    await sleep(freq);
                    result = typeof test === "string" ? Function(test)() : test();
                }
                log.info("Passed : ", test);
                resolve(result);
            });
        };

        async request(url, type, opt = {}) {
            return fetch(url, opt).then(response => {
                if (!response.ok) {
                    throw new Error("Network response from " + url + " was not ok")
                }
                return response[type]()
            })
        }

        async fetchScript() {
           // const data = await this.request("https://krunker.io/social.html", "text");
           // const buffer = await this.request("https://krunker.io/pkg/krunker." + /\w.exports="(\w+)"/.exec(data)[1] + ".vries", "arrayBuffer");
           // const array = Array.from(new Uint8Array(buffer));
           // const xor = array[0] ^ '!'.charCodeAt(0);
           // return array.map((code) => String.fromCharCode(code ^ xor)).join('');
            return new Promise((erect, fostersFlop)=>erect(this.gameJS));
        }

        createSettings() {
            this.displayStyle = (el, val) => {
                this.waitFor(_=>window[el], 5e3).then(node => {
                    if (node) node.style.display = val ? "none" : "inherit";
                    else log.error(el, " was not found in the window object");
                })
            }
            this.settings = {
                //Rendering
                showSkidBtn: {
                    pre: "<div class='setHed'>CSS Settings</div>",
                    name: "Show Custom CSS Button",
                    val: true,
                    html: () => this.generateSetting("checkbox", "showSkidBtn", this),
                    set: (value, init) => {
                        let button = document.getElementById("mainButton");
                        if (!this.isDefined(button)) this.createButton("Change CSS", "https://www.google.com/s2/favicons?domain=krunker.io", this.toggleMenu, value)
                        else button.style.display = value ? "inherit" : "none";
                    }
                },
                hideAdverts: {
                    name: "Hide Advertisments",
                    val: true,
                    html: () => this.generateSetting("checkbox", "hideAdverts", this),
                    set: (value, init) => {
                        if (value) this.mainCustomRule("insert", this.css.hideAdverts);
                        else if (!init) this.mainCustomRule("delete", this.css.hideAdverts);
                    }
                },
                hideStreams: {
                    name: "Hide Streams",
                    val: true,
                    html: () => this.generateSetting("checkbox", "hideStreams", this),
                    set: (value) => { this.displayStyle("streamContainer", value) }
                },
                hideMerch: {
                    name: "Hide Merch",
                    val: true,
                    html: () => this.generateSetting("checkbox", "hideMerch", this),
                    set: (value) => { this.displayStyle("merchHolder", value) }
                },
                hideNewsConsole: {
                    name: "Hide News Console",
                    val: true,
                    html: () => this.generateSetting("checkbox", "hideNewsConsole", this),
                    set: (value) => { this.displayStyle("newsHolder", value) }
                },
                hideCookieButton: {
                    name: "Hide Security Manage Button",
                    val: true,
                    html: () => this.generateSetting("checkbox", "hideCookieButton", this),
                    set: (value) => { this.displayStyle("onetrust-consent-sdk", value) }
                },
                noTextShadows: {
                    name: "Remove Text Shadows",
                    val: false,
                    html: () => this.generateSetting("checkbox", "noTextShadows", this),
                    set: (value, init) => {
                        if (value) this.mainCustomRule("insert", this.css.noTextShadows);
                        else if (!init) this.mainCustomRule("delete", this.css.noTextShadows);
                    }
                },
                customCSS: {
                    name: "Custom CSS",
                    val: "",
                    html: () => this.generateSetting("url", "customCSS", "URL to CSS file"),
                    resources: { css: document.createElement("link") },
                    set: (value, init) => {
                        if (value.startsWith("http")&&value.endsWith(".css")) {
                            //let proxy = 'https://cors-anywhere.herokuapp.com/';
                            this.settings.customCSS.resources.css.href = value
                        }
                        if (init) {
                            this.settings.customCSS.resources.css.rel = "stylesheet"
                            try {
                                document.getElementsByTagName('head')[0].appendChild(this.settings.customCSS.resources.css)
                            } catch(e) {
                                alert(e)
                                this.settings.customCSS.resources.css = null
                            }
                        }
                    }
                },
            };

            if ('indexedDB' in window) {

                let openRequest = indexedDB.open("store", 1);

                openRequest.onupgradeneeded = event => {
                    skid.db = event.target.result;
                    if (!skid.db.objectStoreNames.contains('settings')) { // if there's no "settings" store
                        skid.db.createObjectStore('settings', {keyPath: 'id'}); // create it
                    }
                    //skid.db.deleteObjectStore('settings')
                };

                openRequest.onerror = event => {
                    console.error("Error", event.target.error);
                };

                openRequest.onsuccess = event => {
                    skid.db = event.target.result;
                    let transaction = skid.db.transaction("settings", "readwrite"); // (1)
                    let objectStore = transaction.objectStore("settings"); // (2)
                    let tempSettings = {};
                    for (let key in skid.settings) {
                        tempSettings[key] = skid.settings[key].val;
                    }
                    let encoded = window.btoa(JSON.stringify(tempSettings));
                    let settings = { id: 'skidfest', data: encoded };

                    let storeRequest = objectStore.add(settings); // (3)

                    storeRequest.onsuccess = event => { // (4)
                        console.log("Settings added to the store", event.target.result);
                    };

                    storeRequest.onerror = event => {
                        if (event.target.error.name == "ConstraintError") { // occurs when an object with the same id already exists
                            console.log("Settings with same id already exists"); // handle the error
                            event.preventDefault(); // don't abort the transaction
                            let getRequest = objectStore.get("skidfest");
                            getRequest.onsuccess = event => {
                                let result = event.target.result;
                                if (void 0 !== result) {
                                    let decoded = window.atob(result.data);
                                    let settings = JSON.parse(decoded);
                                    for (const key in settings) {
                                        skid.settings[key].val = settings[key]
                                    }
                                } else {
                                    console.log("No such Settings");
                                }
                            };
                        } else {
                            console.log("Error", event.target.error);
                            // unexpected error, can't handle it
                            // the transaction will abort
                        }
                    };
                };
            }

            const menu = window.windows[11];
            menu.header = "Settings";
            menu.gen = _ => {
                var tmpHTML = `<div style='text-align:center'>Custom CSS Settings</center></a> <hr> </div>`;
                for (const key in this.settings) {
                    if (this.settings[key].pre) tmpHTML += this.settings[key].pre;
                    tmpHTML += "<div class='settName' id='" + key + "_div' style='display:" + (this.settings[key].hide ? 'none' : 'block') + "'>" + this.settings[key].name +
                        " " + this.settings[key].html() + "</div>";
                }
                tmpHTML += '<br><hr>'
                tmpHTML += `<button type="button" autofocus onclick="${skidStr}.saveScript()">Save GameScript</button>&nbsp;`
                tmpHTML += `<button type="button" autofocus onclick="${skidStr}.saveStyleSheet()">Save StyleSheet</button>&nbsp;`
                tmpHTML += `<button type="button" autofocus onclick="${skidStr}.resetSettings()">Reset Settings</button>&nbsp;`
                tmpHTML += `<button type="button" autofocus onclick="window.open('https://skidlamer.github.io/wp')">Contact GamingGurus</button>`
                return tmpHTML;
            };

            for (const key in this.settings) {
                this.settings[key].def = this.settings[key].val;
                if (!this.settings[key].disabled) {
                    //let tmpVal = this.getSavedVal(key);
                    //this.settings[key].val = tmpVal !== null ? tmpVal : this.settings[key].val;
                    this.settings[key].val = this.settings[key].val;
                    if (this.settings[key].val == "false") this.settings[key].val = false;
                    if (this.settings[key].val == "true") this.settings[key].val = true;
                    if (this.settings[key].val == "undefined") this.settings[key].val = this.settings[key].def;
                    if (this.settings[key].set) this.settings[key].set(this.settings[key].val, true);
                }
            }
        }

        generateSetting(type, name, extra) {
            switch (type) {
                case 'checkbox':
                    return `<label class="switch"><input type="checkbox" onclick="${skidStr}.setSetting('${name}', this.checked)" ${this.settings[name].val ? 'checked' : ''}><span class="slider"></span></label>`;
                case 'slider':
                    return `<span class='sliderVal' id='slid_utilities_${name}'>${this.settings[name].val}</span><div class='slidecontainer'><input type='range' min='${this.settings[name].min}' max='${this.settings[name].max}' step='${this.settings[name].step}' value='${this.settings[name].val}' class='sliderM' oninput="${skidStr}.setSetting('${name}', this.value)"></div>`
                    case 'select': {
                        let temp = `<select onchange="${skidStr}.setSetting(\x27${name}\x27, this.value)" class="inputGrey2">`;
                        for (let option in extra) {
                            temp += '<option value="' + option + '" ' + (option == this.settings[name].val ? 'selected' : '') + '>' + extra[option] + '</option>';
                        }
                        temp += '</select>';
                        return temp;
                    }
                default:
                    return `<input type="${type}" name="${type}" id="slid_utilities_${name}"\n${'color' == type ? 'style="float:right;margin-top:5px"' : `class="inputGrey2" placeholder="${extra}"`}\nvalue="${this.settings[name].val}" oninput="${skidStr}.setSetting(\x27${name}\x27, this.value)"/>`;
            }
        }

        resetSettings() {
            if (confirm("Are you sure you want to reset all your settings? This will also refresh the page")) {
               // Object.keys(localStorage).filter(x => x.includes("kro_utilities_")).forEach(x => localStorage.removeItem(x));
                if (this.isDefined(skid.db)) {
                    skid.db.deleteObjectStore('settings')
                }
                location.reload();
            }
        }

        setSetting(t, e) {
            this.settings[t].val = e;
            //this.saveVal(t, e);
            if (document.getElementById(`slid_utilities_${t}`)) document.getElementById(`slid_utilities_${t}`).innerHTML = e;
            if (this.settings[t].set) this.settings[t].set(e);
            if (this.isDefined(skid.db)) {
                let transaction = skid.db.transaction("settings", "readwrite"); // (1)
                let objectStore = transaction.objectStore("settings"); // (2)
                let tempSettings = {};
                for (let key in skid.settings) {
                    tempSettings[key] = skid.settings[key].val;
                }
                let encoded = window.btoa(JSON.stringify(tempSettings));
                let settings = { id: 'skidfest', data: encoded };
                let storeRequest = objectStore.put(settings); // (3)
                storeRequest.onerror = event => {
                    console.log("Error", event.target.error);
                }
                storeRequest.onsuccess = event => {
                   console.log("Set", t, ":", e, "to", event.target.result, "store");
                }
            }
        }

        createObserver(elm, check, callback, onshow = true) {
            return new MutationObserver((mutationsList, observer) => {
                if (check == 'src' || onshow && mutationsList[0].target.style.display == 'block' || !onshow) {
                    callback(mutationsList[0].target);
                }
            }).observe(elm, check == 'childList' ? {childList: true} : {attributes: true, attributeFilter: [check]});
        }

        createListener(elm, type, callback = null) {
            if (!this.isDefined(elm)) {
                alert("Failed creating " + type + "listener");
                return
            }
            elm.addEventListener(type, event => callback(event));
        }

        createElement(element, attribute, inner) {
            if (!this.isDefined(element)) {
                return null;
            }
            if (!this.isDefined(inner)) {
                inner = "";
            }
            let el = document.createElement(element);
            if (this.isType(attribute, 'object')) {
                for (let key in attribute) {
                    el.setAttribute(key, attribute[key]);
                }
            }
            if (!Array.isArray(inner)) {
                inner = [inner];
            }
            for (let i = 0; i < inner.length; i++) {
                if (inner[i].tagName) {
                    el.appendChild(inner[i]);
                } else {
                    el.appendChild(document.createTextNode(inner[i]));
                }
            }
            return el;
        }

        createButton(name, iconURL, fn, visible) {
            visible = visible ? "inherit":"none";
            this.waitFor(_=>document.querySelector("#menuItemContainer")).then(menu => {
                let icon = this.createElement("div",{"class":"menuItemIcon", "style":`background-image:url("${iconURL}");display:inherit;`});
                let title= this.createElement("div",{"class":"menuItemTitle", "style":`display:inherit;`}, name);
                let host = this.createElement("div",{"id":"mainButton", "class":"menuItem", "onmouseenter":"playTick()", "onclick":"showWindow(12)", "style":`display:${visible};`},[icon, title]);
                if (menu) menu.append(host)
            })
        }

        objectHas(obj, arr) {
            return arr.some(prop => obj.hasOwnProperty(prop));
        }

        getVersion() {
           // const elems = document.getElementsByClassName('terms');
            //const version = elems[elems.length - 1].innerText;
            return this.version//version;
        }

        isElectron() {
            // Renderer process
            if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
                return true;
            }

            // Main process
            if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
                return true;
            }

            // Detect the user agent when the `nodeIntegration` option is set to true
            if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
                return true;
            }

            return false;
        }

        saveAs(name, data) {
            let blob = new Blob([data], {type: 'text/plain'});
            let el = window.document.createElement("a");
            el.href = window.URL.createObjectURL(blob);
            el.download = name;
            window.document.body.appendChild(el);
            el.click();
            window.document.body.removeChild(el);
        }

        saveScript() {
            this.saveAs("game_" + this.version + ".js", this.gameJS)
        }

        saveStyleSheet() {
            new Array(...document.styleSheets).map(css => {
                if (css.href) {
                    let arr = /http.*?krunker.io\/css\/(\w+.css).+/.exec(css.href);
                    if (arr && arr[1]) {
                        let name = arr[1];
                        if (name && name.includes("main")) {
                            let cssText = Array.from(css.cssRules).reduce((prev, cssRule) => {
                                return prev + '\n' + cssRule.cssText
                            }, '')
                            this.saveAs(name, cssText);
                        }
                    }
                }
            })
        }

        mainCustomRule(action, rule) {
            const rules = this.mainCustom.cssRules;
            if (action == "insert") this.mainCustom.insertRule(rule);
            else if (action == "delete") {
                for (let i = 0; i < rules.length; i++) {
                    if (rules[i].cssText == rule) {
                        this.mainCustom.deleteRule(i);
                    }
                }
            } else log.error(action + " not Implemented for mainCustomRule")
        }

        isKeyDown(key) {
            return this.downKeys.has(key);
        }

        simulateKey(keyCode) {
            var oEvent = document.createEvent('KeyboardEvent');
            // Chromium Hack
            Object.defineProperty(oEvent, 'keyCode', {
                get : function() {
                    return this.keyCodeVal;
                }
            });
            Object.defineProperty(oEvent, 'which', {
                get : function() {
                    return this.keyCodeVal;
                }
            });

            if (oEvent.initKeyboardEvent) {
                oEvent.initKeyboardEvent("keypress", true, true, document.defaultView, keyCode, keyCode, "", "", false, "");
            } else {
                oEvent.initKeyEvent("keypress", true, true, document.defaultView, false, false, false, false, keyCode, 0);
            }

            oEvent.keyCodeVal = keyCode;

            if (oEvent.keyCode !== keyCode) {
                alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
            }

            document.body.dispatchEvent(oEvent);
        }

        toggleMenu() {
            let lock = document.pointerLockElement || document.mozPointerLockElement;
            if (lock) document.exitPointerLock();
            window.showWindow(12);
            if (this.isDefined(window.SOUND)) window.SOUND.play(`tick_0`,0.1)
        }

        onLoad() {
            this.waitFor(_=>document.documentElement instanceof window.HTMLElement).then(_=>{
                this.iframe();
            })

            this.createObservers();

            this.defineProperties();

            // Delete Old Settings
            Object.keys(localStorage).filter(x => x.includes("kro_utilities_")).forEach(x => localStorage.removeItem(x));
            Object.keys(localStorage).filter(x => x.includes("kro_setngss_json")).forEach(x => localStorage.removeItem(x));

            this.waitFor(_=>window.windows, 3e5).then(_ => {
                // Get Main Custom CSS
                new Array(...document.styleSheets).map(css => {
                    if (css.href) {
                        let arr = /http.*?krunker.io\/css\/(\w+.css).+/.exec(css.href);
                        if (arr && arr[1]) {
                            let name = arr[1];
                            if (name && name.includes("main_custom")) {
                                this.mainCustom = css;
                            }
                        }
                    }
                })
                // Enumerate our CSS and insert each rule
                //if (this.isDefined(this.mainCustom)) {
                    //Object.entries(this.css).forEach(([name, rule], index) => {
                        //this.mainCustom.insertRule(rule, index);
                    //})
                //}
                this.createSettings();
            })

            this.waitFor(_=>this.token).then(_ => {
                //this.saveScript();
                if (!this.token) location.reload();
                this.version = /\['exports']\['gameVersion']='(\d+\.\d+\.\d+)',/.exec(this.gameJS)[1];
                if ( this.isElectron() || !this.isDefined(GM) ) {
                    const loader = new Function("WP_fetchMMToken", "Module", this.gamePatch());
                    return loader(new Promise(res=>res(this.token)), { csv: async () => 0 });
                } else if (GM.info.script.version !== this.version) {
                    /*
                    if (confirm('This Script Needs Updating by Skidlamer, visit The GamingGurus Discord now?\n\nCancel will attempt to use the script anyway \n(CHANCE OF BAN)')) {
                        return window.location.assign("https://skidlamer.github.io/wp");
                    } else {
                        const loader = new Function("WP_fetchMMToken", "Module", this.gamePatch());
                        return loader(new Promise(res=>res(this.token)), { csv: async () => 0 });
                    }

                } else {
                    const loader = new Function("WP_fetchMMToken", "Module", this.gamePatch());
                    return loader(new Promise(res=>res(this.token)), { csv: async () => 0 });
                    */
                }
            })
        }

        gamePatch() {
            let entries = {
                // Deobfu
                inView: { regex: /(\w+\['(\w+)']\){if\(\(\w+=\w+\['\w+']\['position']\['clone']\(\))/, index: 2 },
                spectating: { regex: /\['team']:window\['(\w+)']/, index: 1 },
                //inView: { regex: /\]\)continue;if\(!\w+\['(.+?)\']\)continue;/, index: 1 },
                //canSee: { regex: /\w+\['(\w+)']\(\w+,\w+\['x'],\w+\['y'],\w+\['z']\)\)&&/, index: 1 },
                //procInputs: { regex: /this\['(\w+)']=function\((\w+),(\w+),\w+,\w+\){(this)\['recon']/, index: 1 },
                aimVal: { regex: /this\['(\w+)']-=0x1\/\(this\['weapon']\['\w+']\/\w+\)/, index: 1 },
                pchObjc: { regex: /0x0,this\['(\w+)']=new \w+\['Object3D']\(\),this/, index: 1 },
                didShoot: { regex: /--,\w+\['(\w+)']=!0x0/, index: 1 },
                nAuto: { regex: /'Single\\x20Fire','varN':'(\w+)'/, index: 1 },
                crouchVal: { regex: /this\['(\w+)']\+=\w\['\w+']\*\w+,0x1<=this\['\w+']/, index: 1 },
                recoilAnimY: { regex: /\+\(-Math\['PI']\/0x4\*\w+\+\w+\['(\w+)']\*\w+\['\w+']\)\+/, index: 1 },
                //recoilAnimY: { regex: /this\['recoilAnim']=0x0,this\[(.*?\(''\))]/, index: 1 },
                ammos: { regex: /\['length'];for\(\w+=0x0;\w+<\w+\['(\w+)']\['length']/, index: 1 },
                weaponIndex: { regex: /\['weaponConfig']\[\w+]\['secondary']&&\(\w+\['(\w+)']==\w+/, index: 1 },
                isYou: { regex: /0x0,this\['(\w+)']=\w+,this\['\w+']=!0x0,this\['inputs']/, index: 1 },
                objInstances: { regex: /\w+\['\w+']\(0x0,0x0,0x0\);if\(\w+\['(\w+)']=\w+\['\w+']/, index: 1 },
                getWorldPosition: { regex: /{\w+=\w+\['camera']\['(\w+)']\(\);/, index: 1 },
                //mouseDownL: { regex: /this\['\w+'\]=function\(\){this\['(\w+)'\]=\w*0,this\['(\w+)'\]=\w*0,this\['\w+'\]={}/, index: 1 },
                mouseDownR: { regex: /this\['(\w+)']=0x0,this\['keys']=/, index: 1 },
                //reloadTimer: { regex:  /this\['(\w+)']&&\(\w+\['\w+']\(this\),\w+\['\w+']\(this\)/, index: 1 },
                maxHealth: { regex: /this\['health']\/this\['(\w+)']\?/, index: 1 },
                xDire: { regex: /this\['(\w+)']=Math\['lerpAngle']\(this\['xDir2']/, index: 1 },
                yDire: { regex: /this\['(\w+)']=Math\['lerpAngle']\(this\['yDir2']/, index: 1 },
                //xVel: { regex: /this\['x']\+=this\['(\w+)']\*\w+\['map']\['config']\['speedX']/, index: 1 },
                yVel: { regex: /this\['(\w+)']=this\['\w+'],this\['visible']/, index: 1 },
                //zVel: { regex: /this\['z']\+=this\['(\w+)']\*\w+\['map']\['config']\['speedZ']/, index: 1 },
                //socket: { regex: /this\['(\w+)']\['onmessage']/, index: 1 },

                // Patches
                exports: {regex: /(this\['\w+']\['\w+']\(this\);};},function\(\w+,\w+,(\w+)\){)/, patch: `$1 ${skidStr}.exports=$2.c; ${skidStr}.modules=$2.m;`},
                inputs: {regex: /(\w+\['\w+']\[\w+\['\w+']\['\w+']\?'\w+':'push']\()(\w+)\),/, patch: `$1${skidStr}.onInput($2)),`},
                inView: {regex: /&&(\w+\['\w+'])\){(if\(\(\w+=\w+\['\w+']\['\w+']\['\w+'])/, patch: `){if(!$1&&void 0 !== ${skidStr}.nameTags)continue;$2`},
                socket: {regex: /this\['\w+']=new WebSocket\(\w+\)/, patch: `${skidStr}.ws=this;$&`},
                thirdPerson:{regex: /(\w+)\[\'config\'\]\[\'thirdPerson\'\]/g, patch: `void 0 !== ${skidStr}.thirdPerson`},
                isHacker:{regex: /(window\['\w+']=)!0x0\)/, patch: `$1!0x1)`},
                fixHowler:{regex: /(Howler\['orientation'](.+?)\)\),)/, patch: ``},
                respawnT:{regex: /'\w+':0x3e8\*/g, patch: `'respawnT':0x0*`},
                anticheat1:{regex: /&&\w+\(\),window\['utilities']&&\(\w+\(null,null,null,!0x0\),\w+\(\)\)/, patch: ""},
                //anticheat2:{regex: /(\[]instanceof Array;).*?(var)/, patch: "$1 $2"},
                anticheat3:{regex: /windows\['length'\]>\d+.*?0x25/, patch: `0x25`},
                //anticheat4:{regex: /(\w+\=)\(!menuItemContainer\['innerHTML']\['includes'].*?\);/, patch: `$1false;`},
                //anticheat4:{regex: /kro_utilities_/g, patch: `K_P_A_L__IS__A__G_A_Y__P_E_D_O`},
                //kpal:{regex: /1tWAEJx/g, patch: `K_P_A_L__IS__A__G_A_Y__P_E_D_O`},
                //kpal2:{regex: /jjkFpnV/g, patch: `K_P_A_L__IS__A__G_A_Y__P_E_D_O`},
                commandline:{regex: /Object\['defineProperty']\(console.*?\),/, patch: ""},
                writeable:{regex: /'writeable':!0x1/g, patch: "writeable:true"},
                configurable:{regex: /'configurable':!0x1/g, patch: "configurable:true"},
                typeError:{regex: /throw new TypeError/g, patch: "console.error"},
                error:{regex: /throw new Error/g, patch: "console.error"},
            };
            let script = this.gameJS;
            for(let name in entries) {
                let object = entries[name];
                let found = object.regex.exec(script);
                if (object.hasOwnProperty('index')) {
                    if (!found) {
                        object.val = null;
                        alert("Failed to Find " + name);
                    } else {
                        object.val = found[object.index];
                        log.info ("Found ", name, ":", object.val);
                    }
                    Object.defineProperty(skid.vars, name, {
                        configurable: false,
                        value: object.val
                    });
                } else if (found) {
                    script = script.replace(object.regex, object.patch);
                    log.info ("Patched ", name);
                } else log.error("Failed to Patch " + name);
            }
            return script;
        }

        iframe() {
            const iframe = document.createElement('iframe');
            iframe.setAttribute('style', 'display:none');
            iframe.setAttribute("id", skidStr);
            iframe.src = location.origin;
            document.documentElement.appendChild(iframe);

            const ifrWin = iframe.contentWindow;
            const ifrDoc = iframe.contentDocument?iframe.contentDocument:iframe.contentWindow.document;

            //let request = new XMLHttpRequest();
			//request.open('GET', 'https://skidlamer.github.io/krunker/game_v3.6.8.js', false);
			//request.send(null);
			//if (request.status == 200) {
			//	skid.gameJS = request.responseText;
			//}

            let skidneySplizy = 0;

            ifrWin.TextDecoder.prototype.decode = new Proxy(window.TextDecoder.prototype.decode, {
                apply: function(target, that, args) {
                    let string = Reflect.apply(...arguments);
                    if (string.length > 5e4) {
                        log.warn("skidneySplizy = " + skidneySplizy);
                        if (skidneySplizy == 0) {
                            skid.gameJS = string;
                        } else {
                            skid.gameJS += string;
                        } skidneySplizy ++;
                        //console.log(string.length)
                        /*
                        if (!skid.gameJS) {
                            skid.gameJS = string;
                            console.log("1stSTR");
                        } else {
                           skid.gameJS += string;
                            console.log("2ndSTR");
                        }
                        */
                    } //else //console.log(string.length)
                    if (string.includes("generate-token")) skid.generated = true;
                    else if (string.length == 40||skid.generated) {
                        skid.token = string;
                        log.info("Token ", string);
                        document.documentElement.removeChild(iframe);
                    }
                    return string;
                },
            });
        }

        defineProperties() {
            let values = {updateItems:null}

            Object.defineProperties(Object.prototype, {
                isDev: {
                    get() { return skid.settings && skid.settings.fakeDev && skid.settings.fakeDev.val },
                    set(val) { return true }
                },
            });
        }

        createObservers() {

            let observer = new MutationObserver(mutations => {
                for (let mutation of mutations) {
                    for (let node of mutation.addedNodes) {
                        if (node.tagName === 'SCRIPT' && node.type === "text/javascript" && node.innerHTML.startsWith("*!", 1)) {
                            node.innerHTML = "";
                            observer.disconnect();
                        }
                    }
                }
            });
            observer.observe(document, {
                childList: true,
                subtree: true
            });

            this.waitFor(_=>window.instructionsUpdate, 2e3).then(_ => {
                this.createObserver(window.instructionsUpdate, 'style', (target) => {
                    if (this.settings.autoFindNew.val) {
                        console.log(target)
                        if (['Kicked', 'Banned', 'Disconnected', 'Error', 'Game is full'].some(text => target && target.innerHTML.includes(text))) {
                            location = document.location.origin;
                        }
                    }
                });
            })

            this.createListener(document, "mouseup", event => {
                switch (event.button) {
                    case 1:
                        event.preventDefault();
                        this.toggleMenu();
                        break;
                    default:
                        break;
                }
            })
        }

        onRender() { /* hrt / ttap - https://github.com/hrt */
            this.renderFrame ++;
            if (this.renderFrame >= 100000) this.renderFrame = 0;
            let scaledWidth = this.ctx.canvas.width / this.scale;
            let scaledHeight = this.ctx.canvas.height / this.scale;
            let playerScale = (2 * this.consts.armScale + this.consts.chestWidth + this.consts.armInset) / 2
            let worldPosition = this.renderer.camera[this.vars.getWorldPosition]();
            let espVal = this.settings.renderESP.val;
            if (espVal ==="walls"||espVal ==="twoD") this.nameTags = undefined; else this.nameTags = true;

            if (this.settings.autoActivateNuke.val && this.me && Object.keys(this.me.streaks).length) { /*chonker*/
                this.wsSend("k", 0);
            }

            if (espVal !== "off") {
                this.overlay.healthColE = this.settings.rainbowColor.val ? this.overlay.rainbow.col : "#eb5656";
            }

            for (let iter = 0, length = this.game.players.list.length; iter < length; iter++) {
                let player = this.game.players.list[iter];
                if (player[this.vars.isYou] || !player.active || !this.isDefined(player[this.vars.objInstances]) || this.getIsFriendly(player)) {
                    continue;
                }

                if (br) {
                    continue;
                }

                xmin = (xmin + 1) / 2;
                ymin = (ymin + 1) / 2;
                xmax = (xmax + 1) / 2;
                ymax = (ymax + 1) / 2;

                // save and restore these variables later so they got nothing on us
                const original_strokeStyle = this.ctx.strokeStyle;
                const original_lineWidth = this.ctx.lineWidth;
                const original_font = this.ctx.font;
                const original_fillStyle = this.ctx.fillStyle;

            }
        }

        getCanSee(from, toX, toY, toZ, boxSize) {
            if (!from) return 0;
            boxSize = boxSize||0;
            for (let obj, dist = this.getD3D(from.x, from.y, from.z, toX, toY, toZ), xDr = this.getDir(from.z, from.x, toZ, toX), yDr = this.getDir(this.getDistance(from.x, from.z, toX, toZ), toY, 0, from.y), dx = 1 / (dist * Math.sin(xDr - Math.PI) * Math.cos(yDr)), dz = 1 / (dist * Math.cos(xDr - Math.PI) * Math.cos(yDr)), dy = 1 / (dist * Math.sin(yDr)), yOffset = from.y + (from.height || 0) - this.consts.cameraHeight, aa = 0; aa < this.game.map.manager.objects.length; ++aa) {
                if (!(obj = this.game.map.manager.objects[aa]).noShoot && obj.active && !obj.transparent && (!this.settings.wallPenetrate.val || (!obj.penetrable || !this.me.weapon.pierce))) {
                    let tmpDst = this.lineInRect(from.x, from.z, yOffset, dx, dz, dy, obj.x - Math.max(0, obj.width - boxSize), obj.z - Math.max(0, obj.length - boxSize), obj.y - Math.max(0, obj.height - boxSize), obj.x + Math.max(0, obj.width - boxSize), obj.z + Math.max(0, obj.length - boxSize), obj.y + Math.max(0, obj.height - boxSize));
                    if (tmpDst && 1 > tmpDst) return tmpDst;
                }
            }

            return null;
        }

    }

    window[skidStr] = new Skid();

})([...Array(8)].map(_ => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[~~(Math.random()*52)]).join(''), CanvasRenderingContext2D.prototype);
