export class SCLib {
    private static handlers: Map<string, ((data: object) => void)[]> = new Map();
    
    private static steam: number;
    private static steam_background: number;

    private static steam_id: number;
    private static steam_background_id: number;

    private static websocket_url: string = '';
    private static access_token: string = '';

    private static steam_default_tick: number = 100;
    private static steam_min_tick: number = 10;
    private static steam_max_tick: number = 1000;

    private static active_window: boolean = true;
    
    public static init(): boolean {
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
                if(steam_id !== SCLib.steam_id) {
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

    public static init_background(): boolean {
        if (!SCLib.steam || SCLib.steam_background) {
            return false;
        }

        new Promise((resolve, reject) => {
            const steam_background_id = (Math.random() * 100000);
            const steam_background = setInterval(SCLib.get_background_steam_func(), (SCLib.steam_default_tick*4));
            SCLib.steam_background_id = steam_background_id;
            SCLib.steam_background = steam_background;

            const a = setInterval(() => {
                if(steam_background_id !== SCLib.steam_background_id) {
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

    private static async make_connection() {
        if (!document.hidden) {
        }
    }

    private static get_steam_func() {
        return () => {
            if (document.hidden || !SCLib.active_window) return;
            SCLib.reach('on_steam_tick', {
                
            });
        }
    }

    private static get_background_steam_func() {
        return () => {
            if (SCLib.active_window) return;
            SCLib.reach('on_background_steam_tick', {
                
            });
        }
    }

    public static async get_max_device_fps(ms: number): Promise<number> {
        return new Promise((resolve) => {
            let lastTime = performance.now();
            let frames = 0;
            let fps = 0;
    
            function calculateFPS(currentTime: number) {
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
    }

    public static set_steam_tick(ms: number): boolean {
        clearInterval(SCLib.steam);
        SCLib.steam_default_tick = ms;

        new Promise((resolve, reject) => {
            const steam_id = (Math.random() * 100000);
            const steam = setInterval(SCLib.get_steam_func(), (SCLib.steam_default_tick));
            SCLib.steam_id = steam_id;
            SCLib.steam = steam;

            const a = setInterval(() => {
                if(steam_id !== SCLib.steam_id) {
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

    public static set_background_steam_tick(ms: number): boolean {
        clearInterval(SCLib.steam_background);
        SCLib.steam_default_tick = ms;

        new Promise((resolve, reject) => {
            const steam_background_id = (Math.random() * 100000);
            const steam_background = setInterval(SCLib.get_background_steam_func(), (SCLib.steam_default_tick*4));
            SCLib.steam_background_id = steam_background_id;
            SCLib.steam_background = steam_background;

            const a = setInterval(() => {
                if(steam_background_id !== SCLib.steam_background_id) {
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

    public static set_websocket_url(url: string): void {
        let websocket_url = url;
        if (url.includes('wss://') || url.includes('ws://')) {
            websocket_url = `wss://${url}`;
        }

        SCLib.websocket_url = websocket_url;
    }

    public static set_access_token(access_token: string): void {
        SCLib.access_token = access_token;
    }

    public static set_steam_min_tick(steam_min_tick: number): void {
        SCLib.steam_min_tick = steam_min_tick;
    }

    public static set_steam_max_tick(steam_max_tick: number): void {
        SCLib.steam_max_tick = steam_max_tick;
    }

    public static set_steam_default_tick(steam_default_tick: number): void {
        SCLib.steam_default_tick = steam_default_tick;
    }

    public static on(eventName: string, handler: (data: object) => void): void {
        if (!SCLib.handlers.has(eventName)) {
            SCLib.handlers.set(eventName, []);
        }
        SCLib.handlers.get(eventName)!.push(handler);
    }

    public static off(eventName: string, handler: (data: object) => void): void {
        const handlers = SCLib.handlers.get(eventName);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    private static reach(eventName: string, data: object): void {
        const handlers = SCLib.handlers.get(eventName);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
}