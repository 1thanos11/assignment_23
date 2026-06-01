import { Settings } from "../../database/models/settings.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class SettingsRepository extends DataBaseRepository {
    constructor() {
        super(Settings);
    }
}
