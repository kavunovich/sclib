import { SMDTransformer } from './SMDTransformer.js';
import { EventManager } from './../EventManager.js';

export class SMDRequests extends EventManager {
    #url;
    #userid;
    #public_key;

    setRequestURL(url) {
        this.#url = url;
    }

    setUserid(userid) {
        this.#userid = userid;
    }

    setPublicKey(public_key) {
        this.#public_key = public_key;
    }

    async postRequest(url, headers, body, json = true) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body
            });

            return { response };
        } catch (error) {
            return { error };
        }
    }

    async uploadFile(binary_data) {
        if(this.#url === undefined && this.#userid === undefined && this.#public_key === undefined) return;

        const hexString = [...new Uint8Array(binary_data)]
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

        const url = `${this.url}/upload/`;
        const headers = {
            'Content-Type': 'application/json'
        };

        const body = DataTransformer.shorten({
            userid: this.#userid,
            public_key: this.#public_key,
            data: hexString
        });

        const request = await this.postRequest(
            url, headers, JSON.stringify(body)
        );

        if(request.response === undefined) {
            return null;
        }

        const data = await request.response.json();
        const result = SMDTransformer.expand(data);

        return result;
    }

    async getFile(token) {
        if(token.length < 5) return null;
        const url = `${this.url}/download/`;
        const headers = {
            'Content-Type': 'application/json'
        };

        const body = SMDTransformer.shorten({
            userid: this.#userid,
            public_key: this.#public_key,
            key: token
        });

        const request = await this.postRequest(
            url, headers, JSON.stringify(body), false
        );

        const data = await request.response.blob();
        return data;
    }
}