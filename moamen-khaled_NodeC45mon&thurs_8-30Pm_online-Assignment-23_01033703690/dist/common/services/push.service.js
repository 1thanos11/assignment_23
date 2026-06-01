import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FIRE_BASE_CONFIG } from "../../config/config.js";
class PushService {
    client;
    constructor() {
        const serviceAccount = JSON.parse(readFileSync(resolve(FIRE_BASE_CONFIG), "utf-8"));
        this.client = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    async sendNotification({ token, data, }) {
        const message = { token, data };
        return await this.client.messaging().send(message);
    }
    async sendMultipleNotifications({ tokens, title, body, }) {
        const chunks = this.chunkArray(tokens, 500);
        const responses = await Promise.all(chunks.map((chunk) => {
            return this.client.messaging().sendEachForMulticast({
                tokens: chunk,
                data: {
                    title,
                    body,
                },
            });
        }));
        const successCount = responses.reduce((acc, res) => {
            return acc + res.successCount;
        }, 0);
        const failureCount = responses.reduce((acc, res) => {
            return acc + res.failureCount;
        }, 0);
        return { responses, successCount, failureCount };
    }
}
export const pushService = new PushService();
