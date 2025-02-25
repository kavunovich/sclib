import { JustWebSocket } from './../JustWebSocket.js';
import { PROTOCOL_CONFIG, MESSAGE_TYPES } from './../constants.js';
import { SMDTransformer } from './SMDTransformer.js';
import { SMDRequests } from './SMDRequests.js';
import './../msgpack.min.js';

export class SMD extends SMDRequests {
    constructor() {
        super();

        this.account_connected = false;
        this.websocket_error = 0;
        this.username = null;
        this.filehash_cache = [];
        
        this.websocket = new JustWebSocket(PROTOCOL_CONFIG.WEBSOCKET_URLS);
        this.websocket.default_timeout = PROTOCOL_CONFIG.DEFAULT_TIMEOUT;
        this.websocket.ping_range = PROTOCOL_CONFIG.DEFAULT_TIMEOUT;

        this.setRequestURL(PROTOCOL_CONFIG.REQUEST_URLS[this.websocket.currentURLIndex]);

        this.websocket.add(`TYPE${MESSAGE_TYPES.NEW_MESSAGE}`, (data) => {
            delete data.type;

            if(data.message !== undefined) {
                const new_message = this.decodeMessage(data.message);
                data.message = new_message;
            }

            this.call('new_message', data);
        });
    }

    connect(userid, public_key) {
        this.websocket.connect();

        return new Promise((resolve) => {
            this.websocket.add('connected', () => {
                this.sendSerializedAndShorten({ userid, public_key });

                this.websocket.add(`TYPE${MESSAGE_TYPES.SUCCESSFUL_AUTH}`, (data) => {
                    this.account_connected = true;
                    this.username = data.username;
                    resolve(true);

                    this.setUserid(userid);
                    this.setPublicKey(public_key);
                });

                this.websocket.add(`TYPE${MESSAGE_TYPES.ERROR}`, (data) => {
                    this.websocket_error = data.error;
                    resolve(false);
                });
            });

            setTimeout(() => resolve(false), PROTOCOL_CONFIG.CONNECTION_TIMEOUT);
        });
    }

    sendMessage(chatid, message) {
        if(this.account_connected === false) return;

        const request_id = this.generateRequestID();
        const message_data = SMDTransformer.shorten({
            version: PROTOCOL_CONFIG.MESSAGE_VERSION,
            parse_mode: 'markdown',
            message: message
        });
        
        this.sendSerializedAndShorten({
            type: MESSAGE_TYPES.SEND_MESSAGE,
            request_id,
            chatid,
            message: JSON.stringify(message_data)
        });

        return new Promise((resolve) => {
            this.websocket.add(`TYPE${MESSAGE_TYPES.SEND_MESSAGE_SUCCESS}`, (data) => {
                if(request_id !== data.request_id) return true;
                resolve(true);
                return true;
            });

            this.websocket.add(`TYPE${MESSAGE_TYPES.SEND_MESSAGE_ERROR}`, (data) => {           
                if(request_id !== data.request_id) return true;
                resolve(false);
                return true;
            });

            setTimeout(() => resolve(false), PROTOCOL_CONFIG.CONNECTION_TIMEOUT);
        });
    }

    createPrivateChat(userid) {
        if(this.account_connected === false) return;

        const request_id = this.generateRequestID();

        this.sendSerializedAndShorten({
            type: MESSAGE_TYPES.CREATE_PRIVATE_CHAT,
            request_id,
            userid
        });

        return new Promise((resolve) => {
            this.websocket.add(`TYPE${MESSAGE_TYPES.CREATE_PRIVATE_CHAT}`, (data) => {
                if(request_id !== data.request_id) return true;
                resolve(true);
                return true;
            });

            this.websocket.add(`TYPE${MESSAGE_TYPES.CREATE_PRIVATE_CHAT_ERROR}`, (data) => {           
                if(request_id !== data.request_id) return true;
                resolve(false);
                return true;
            });

            setTimeout(() => resolve(false), PROTOCOL_CONFIG.CONNECTION_TIMEOUT);
        });
    }

    setProfileAvatar(file_key) {
        if(this.account_connected === false) return;

        const request_id = this.generateRequestID();

        this.sendSerializedAndShorten({
            type: MESSAGE_TYPES.SET_AVATAR,
            request_id,
            key: file_key
        });

        return new Promise((resolve) => {
            this.websocket.add(`TYPE${MESSAGE_TYPES.SET_AVATAR}`, (data) => {
                if(request_id !== data.request_id) return true;

                if(data.code === false) {
                    resolve(false);
                }

                resolve(true);
                return true;
            });

            setTimeout(() => resolve(false), PROTOCOL_CONFIG.CONNECTION_TIMEOUT);
        });
    }

    getChatInfo(chatid) {
        if(this.account_connected === false) return;

        const request_id = this.generateRequestID();

        this.sendSerializedAndShorten({
            type: MESSAGE_TYPES.CHATINFO,
            request_id,
            chatid
        });

        return new Promise((resolve) => {
            this.websocket.add(`TYPE${MESSAGE_TYPES.CHATINFO}`, (data) => {
                if(request_id !== data.request_id) return true;

                delete data.type;
                delete data.request_id;

                resolve(data);
                return true;
            });

            this.websocket.add(`TYPE${MESSAGE_TYPES.CHATINFO_ERROR}`, (data) => {
                if(request_id !== data.request_id) return true;
                resolve(false);
                return true;
            });


            setTimeout(() => resolve(false), PROTOCOL_CONFIG.CONNECTION_TIMEOUT);
        });
    }

    getChats(last_chatid = null, offset = null, limit = null, post_message = true) {
        if(this.account_connected === false) return;

        const request_id = this.generateRequestID();

        const data = {
            type: MESSAGE_TYPES.CHATS,
            request_id,
            ...(last_chatid !== null && { last_chatid }),
            ...(offset !== null && { offset }),
            ...(limit !== null && { limit }),
            ...(post_message === false && { post: post_message })
        };

        this.sendSerializedAndShorten(data);

        return this.selectionPromise(
            `TYPE${MESSAGE_TYPES.CHATS}`, 
            `TYPE${MESSAGE_TYPES.CHATS_ERROR}`,
            request_id
        );
    }

    getChat(chatid, last_messageid = null, offset = null, limit = null, post_message = true) {
        const request_id = this.generateRequestID();
        const data = {
            type: MESSAGE_TYPES.CHAT,
            request_id,
            chatid,
            ...(last_messageid !== null && { last_messageid }),
            ...(offset !== null && { offset }),
            ...(limit !== null && { limit }),
            ...(post_message === false && { post: post_message })
        };

        this.sendSerializedAndShorten(data);

        return this.selectionPromise(
            `TYPE${MESSAGE_TYPES.CHAT}`, 
            `TYPE${MESSAGE_TYPES.CHAT_ERROR}`,
            request_id
        );
    }

    searchUsers(username, offset = null, limit = null) {
        const request_id = this.generateRequestID();
        const data = {
            type: MESSAGE_TYPES.SEARCH_USERS,
            request_id,
            username,
            ...(offset !== null && { offset }),
            ...(limit !== null && { limit })
        };
    
        this.sendSerializedAndShorten(data);

        return this.selectionPromise(
            `TYPE${MESSAGE_TYPES.SEARCH_USERS}`, 
            `TYPE${MESSAGE_TYPES.SEARCH_USERS_ERROR}`,
            request_id
        );
    }

    searchChats(chatname, offset = null, limit = null) {
        const request_id = this.generateRequestID();
        const data = {
            type: MESSAGE_TYPES.SEARCH_CHATS,
            request_id,
            chatname,
            ...(offset !== null && { offset }),
            ...(limit !== null && { limit })
        };
    
        this.sendSerializedAndShorten(data);

        return this.selectionPromise(
            `TYPE${MESSAGE_TYPES.SEARCH_CHATS}`, 
            `TYPE${MESSAGE_TYPES.SEARCH_CHATS_ERROR}`,
            request_id
        );
    }

    selectionPromise(success_name, error_name, request_id) {
        return new Promise((resolve) => {
            let request_data = [];
            let last_recieved_time = 0;

            this.websocket.add(success_name, (data) => {
                if(request_id !== data.request_id) return true;
                const count = data.count;

                if(count < 0) {
                    resolve(false);
                }

                delete data.type;
                delete data.index;
                delete data.count;
                delete data.request_id;

                if(data.message !== undefined) {
                    const new_message = this.decodeMessage(data.message);
                    data.message = new_message;
                }

                request_data.push(data);

                if(request_data.length === count) {
                    resolve(request_data);
                    return true;
                }

                last_recieved_time = Date.now();
            });

            this.websocket.add(error_name, (data) => {
                if(request_id !== data.request_id) return true;
                resolve(false);
                return true;
            });

            let interval = setInterval(() => {
                if(Date.now() - last_recieved_time > PROTOCOL_CONFIG.CONNECTION_TIMEOUT) {
                    clearInterval(interval);
                    resolve(false);
                };
            }, PROTOCOL_CONFIG.CONNECTION_TIMEOUT);
        });
    }

    decodeMessage(message) {
        let decoded_message = JSON.parse(message);
        return SMDTransformer.expand(decoded_message);
    }

    generateRequestID() {
        return Math.floor(Math.random() * 999999 + 1);
    }

    async sendSerializedAndShorten(data) {
        const shorten_data = SMDTransformer.shorten(data);
        const encodedData = msgpack.encode(shorten_data);
        const uint8Data = new Uint8Array(encodedData);

        this.websocket.send(uint8Data);
    }
}