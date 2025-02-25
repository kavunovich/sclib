import { EventManager } from './EventManager.js';
import { SMDTransformer } from './smd/SMDTransformer.js';

export class JustWebSocket extends EventManager {
    constructor(socket_urls) {
        super();

        this.is_debug = true;

        this.socket_urls = Array.isArray(socket_urls) ? socket_urls : [ socket_urls ];
        this.currentURLIndex = 0;
        this.connectionInterval = null;

        this.default_timeout = 2000;
        this.interval_time = 500;

        this.isConnecting = false;
        this.isConnected = false;

        this.websocket = null;

        this.time_request = 0;

        this.ping = 0;
        this.last_ping_time = 0;
        this.ping_range = -1;

        this.queue_messages = [];
    }

    connect() {
        if (this.connectionInterval) clearInterval(this.connectionInterval);

        this.connectionInterval = setInterval(() => {
            if(this.isConnected === false && this.isConnecting === true && Date.now() - this.time_request > this.default_timeout) {
                this.websocket.close();
                this.websocket = null;
                this.isConnecting = false;

                return;
            }

            if(this.isConnecting === false && this.isConnected === false) {
                this.isConnecting = true;
                this.time_request = Date.now();

                this.currentURLIndex = (this.currentURLIndex + 1) % this.socket_urls.length;
                this.setConnectWebsocket(this.socket_urls[this.currentURLIndex]);
            }

            if(typeof this.websocket === 'object') {
                if(this.websocket?.readyState !== 1 && this.isConnected === true) {
                    this.isConnected = false;
                }
            }

            if(this.isConnected === true) {
                if(this.ping_range > 0 && Date.now() - this.last_ping_time > this.ping_range) {
                    this.last_ping_time = Date.now();
                    this.sendPing();
                    
                    if (!document.hidden) this.call('heartbeat');
                }

                // for (let i = 0; i < this.queue_messages.length; i++) {
                //     const data = this.queue_messages[i].shift();
                //     this.send(data);
                // }
            }
        }, this.interval_time);
    }

    setConnectWebsocket(url) {
        if(this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        this.websocket = new WebSocket(url);
        this.websocket.binaryType = "arraybuffer";

        this.websocket.onopen = (event) => this.handleOpen(event);
        this.websocket.onmessage = (event) => this.handleMessage(event);
        this.websocket.onclose = (event) => this.handleClose(event);
        this.websocket.onerror = (event) => this.handleError(event);
    }

    async handleMessage(event) {
        try {
            const data = new Uint8Array(event.data ?? 0);
            const decoded_data = data.length > 1 ? msgpack.decode(data) : {};
            const expanded_data = SMDTransformer.expand(decoded_data);

            if(data[0] && data[0] === 1) {
                this.ping = Date.now() - this.last_ping_time;
                return;
            }

            let callback_namespace = 'message';

            if(expanded_data.type !== undefined) {  
                this.call(`TYPE${expanded_data.type}`, expanded_data);                
            }

            this.call('message', expanded_data);
        } catch (error) {
            this.error(error);
            this.call('error', error);
        }
    }

    handleOpen(event) {
        this.call('connected', event);
        this.isConnected = true;
    }

    handleClose(event) {
        this.isConnected = false;
    }

    handleError(event) {
        this.call('connection_error');
        this.isConnected = false;
    }

    sendPing() {
        if (this.websocket?.readyState === WebSocket.OPEN) {
            this.send(new Uint8Array([1]));
        }
    }

    send(data) {
        if (this.websocket?.readyState === WebSocket.OPEN) {
            try {
                this.websocket.send(data);
                return true;
            } catch (error) {
                this.queueMessage(data);
                return false;
            }
        }

        this.queueMessage(data);
        return false;
    }

    queueMessage(data) {
        this.queue_messages.push(data);
    }

    log(data) {
        if(this.is_debug === true) {
            console.log("%cSOCKET / DEBUG", "font-weight:900;color:black;background:gold;border-radius:5px;padding: 5px", data);
        }
    }

    error(data) {
        if(this.is_debug === true) {
            console.log("%cSOCKET / ERROR", "font-weight:900;color:white;background:red;border-radius:5px;padding: 5px", data);
        }
    }
}