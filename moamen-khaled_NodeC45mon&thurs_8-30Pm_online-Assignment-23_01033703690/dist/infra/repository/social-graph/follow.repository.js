import { Follow } from "../../database/models/follow.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class FollowRepository extends DataBaseRepository {
    constructor() {
        super(Follow);
    }
}
