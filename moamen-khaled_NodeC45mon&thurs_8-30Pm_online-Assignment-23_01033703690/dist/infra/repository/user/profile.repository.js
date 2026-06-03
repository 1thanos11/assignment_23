import { Profile } from "../../database/models/profile.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class ProfileRepository extends DataBaseRepository {
    constructor() {
        super(Profile);
    }
    async findProfileByOwnerId(ownerId) {
        return await this.findById({ id: ownerId });
    }
}
