import { DataBaseRepository } from "../base.repository.js";
import { Stats } from "../../database/models/stats.model.js";
export class StatsRepository extends DataBaseRepository {
    constructor() {
        super(Stats);
    }
}
