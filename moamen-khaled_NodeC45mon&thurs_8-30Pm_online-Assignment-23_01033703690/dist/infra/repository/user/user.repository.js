import { User } from "../../database/models/user.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class UserRepository extends DataBaseRepository {
    constructor() {
        super(User);
    }
}
