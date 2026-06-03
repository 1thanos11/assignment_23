import { Job, Worker } from "bullmq";
import { INVITATION_QUEUE_NAME } from "../queues/invitation.queue.js";
import { ioredis } from "../ioredis.queue.connection.js";
import { invitationProcess } from "../process/invitation.processes.js";
import { JobEnum } from "../../../common/enums/job.enums.js";
export class InvitationWorker {
    worker;
    invitationProcess = invitationProcess;
    constructor() {
        this.worker = new Worker(INVITATION_QUEUE_NAME, this.process.bind(this), {
            connection: ioredis,
            concurrency: 10,
        });
        this.registerEvents();
    }
    process = async (job) => {
        switch (job.name) {
            case JobEnum.CREATE_INVITATION_MESSAGES:
                await this.invitationProcess.sendInvitationMessages(job.data.invitations);
                break;
            default:
                throw new Error(`Unknown job: ${job.name}`);
        }
    };
    registerEvents() {
        this.worker.on("completed", (job) => {
            console.log(`Invitation job ${job.id} completed`);
        });
        this.worker.on("failed", (job, error) => {
            console.error(`Invitation job ${job?.id} failed:`, error);
        });
    }
}
