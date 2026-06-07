import { ModerationCase } from "../../database/models/moderationCase.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class ModerationCaseRepository extends DataBaseRepository {
    constructor() {
        super(ModerationCase);
    }
}
