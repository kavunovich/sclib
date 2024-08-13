var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class SCLib {
    static init() {
        if (SCLib.websocket_url.trim() === '' || SCLib.access_token.trim() === '' || SCLib.steam) {
            return false;
        }
        window.addEventListener('focus', () => {
            SCLib.active_window = true;
        });
        window.addEventListener('blur', () => {
            SCLib.active_window = false;
        });
        new Promise((resolve, reject) => {
            const steam_id = (Math.random() * 100000);
            const steam = setInterval(SCLib.get_steam_func(), (SCLib.steam_default_tick));
            SCLib.steam_id = steam_id;
            SCLib.steam = steam;
            const a = setInterval(() => {
                if (steam_id !== SCLib.steam_id) {
                    clearInterval(steam);
                    clearInterval(a);
                    resolve(0);
                }
            }, 100);
        })
            .catch((error) => {
            return false;
        });
        return true;
    }
    static init_background() {
        if (!SCLib.steam || SCLib.steam_background) {
            return false;
        }
        new Promise((resolve, reject) => {
            const steam_background_id = (Math.random() * 100000);
            const steam_background = setInterval(SCLib.get_background_steam_func(), (SCLib.steam_default_tick * 4));
            SCLib.steam_background_id = steam_background_id;
            SCLib.steam_background = steam_background;
            const a = setInterval(() => {
                if (steam_background_id !== SCLib.steam_background_id) {
                    clearInterval(steam_background);
                    clearInterval(a);
                    resolve(0);
                }
            }, 100);
        })
            .catch((error) => {
            return false;
        });
        return true;
    }
    static make_connection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!document.hidden) {
            }
        });
    }
    static get_steam_func() {
        return () => {
            if (document.hidden || !SCLib.active_window)
                return;
            SCLib.reach('on_steam_tick', {});
        };
    }
    static get_background_steam_func() {
        return () => {
            if (SCLib.active_window)
                return;
            SCLib.reach('on_background_steam_tick', {});
        };
    }
    static get_max_device_fps(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                let lastTime = performance.now();
                let frames = 0;
                let fps = 0;
                function calculateFPS(currentTime) {
                    const deltaTime = currentTime - lastTime;
                    frames++;
                    if (deltaTime >= 1000) {
                        fps = frames / (deltaTime / 1000);
                        frames = 0;
                        lastTime = currentTime;
                    }
                    requestAnimationFrame(calculateFPS);
                }
                requestAnimationFrame(calculateFPS);
                setTimeout(() => {
                    const optimalInterval = Math.round(1000 / fps);
                    resolve(optimalInterval);
                }, ms);
            });
        });
    }
    static set_steam_tick(ms) {
        clearInterval(SCLib.steam);
        SCLib.steam_default_tick = ms;
        new Promise((resolve, reject) => {
            const steam_id = (Math.random() * 100000);
            const steam = setInterval(SCLib.get_steam_func(), (SCLib.steam_default_tick));
            SCLib.steam_id = steam_id;
            SCLib.steam = steam;
            const a = setInterval(() => {
                if (steam_id !== SCLib.steam_id) {
                    clearInterval(steam);
                    clearInterval(a);
                    resolve(0);
                }
            }, 100);
        })
            .catch((error) => {
            return false;
        });
        return true;
    }
    static set_background_steam_tick(ms) {
        clearInterval(SCLib.steam_background);
        SCLib.steam_default_tick = ms;
        new Promise((resolve, reject) => {
            const steam_background_id = (Math.random() * 100000);
            const steam_background = setInterval(SCLib.get_background_steam_func(), (SCLib.steam_default_tick * 4));
            SCLib.steam_background_id = steam_background_id;
            SCLib.steam_background = steam_background;
            const a = setInterval(() => {
                if (steam_background_id !== SCLib.steam_background_id) {
                    clearInterval(steam_background);
                    clearInterval(a);
                    resolve(0);
                }
            }, 100);
        })
            .catch((error) => {
            return false;
        });
        return true;
    }
    static set_websocket_url(url) {
        let websocket_url = url;
        if (url.includes('wss://') || url.includes('ws://')) {
            websocket_url = `wss://${url}`;
        }
        SCLib.websocket_url = websocket_url;
    }
    static set_access_token(access_token) {
        SCLib.access_token = access_token;
    }
    static set_steam_min_tick(steam_min_tick) {
        SCLib.steam_min_tick = steam_min_tick;
    }
    static set_steam_max_tick(steam_max_tick) {
        SCLib.steam_max_tick = steam_max_tick;
    }
    static set_steam_default_tick(steam_default_tick) {
        SCLib.steam_default_tick = steam_default_tick;
    }
    static on(eventName, handler) {
        if (!SCLib.handlers.has(eventName)) {
            SCLib.handlers.set(eventName, []);
        }
        SCLib.handlers.get(eventName).push(handler);
    }
    static off(eventName, handler) {
        const handlers = SCLib.handlers.get(eventName);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }
    static reach(eventName, data) {
        const handlers = SCLib.handlers.get(eventName);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
}
SCLib.handlers = new Map();
SCLib.websocket_url = '';
SCLib.access_token = '';
SCLib.steam_default_tick = 100;
SCLib.steam_min_tick = 10;
SCLib.steam_max_tick = 1000;
SCLib.active_window = true;
