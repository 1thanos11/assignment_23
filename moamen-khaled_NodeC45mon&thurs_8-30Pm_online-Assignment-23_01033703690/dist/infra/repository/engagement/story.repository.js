import { Story } from "../../database/models/story.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class StoryRepository extends DataBaseRepository {
    constructor() {
        super(Story);
    }
}
