import { Worker } from "bullmq";
import { ioredis } from "../ioredis.queue.connection.js";
import { EMAIL_QUEUE_NAME } from "../queues/email.queue.js";
import { JobEnum } from "../../../common/enums/job.enums.js";
import { sendMail } from "../../../common/utils/email/send.email.js";
export class EmailWorker {
    worker;
    constructor() {
        this.worker = new Worker(EMAIL_QUEUE_NAME, this.process.bind(this), {
            connection: ioredis,
            concurrency: 2,
        });
        this.registerEvents();
    }
    async process(job) {
        try {
            switch (job.name) {
                case JobEnum.SEND_EMAIL:
                    await sendMail(job.data);
                    break;
                default:
                    throw new Error(`Unknown job: ${job.name}`);
            }
        }
        catch (error) {
            console.error(`Email job failed ${job.id}`);
            throw error;
        }
    }
    registerEvents() {
        this.worker.on("completed", (job) => {
            console.log(`Job ${job.id} Completed Successfully`);
        });
        this.worker.on("failed", (job, error) => {
            console.log(`Email failed ${job?.id}`, error);
        });
    }
}
