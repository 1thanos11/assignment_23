import { Report } from "../../database/models/report.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class ReportRepository extends DataBaseRepository {
    constructor() {
        super(Report);
    }
}
