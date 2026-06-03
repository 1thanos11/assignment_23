import { Invitation } from "../../database/models/invitation.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class InvitationRepository extends DataBaseRepository {
    constructor() {
        super(Invitation);
    }
}
