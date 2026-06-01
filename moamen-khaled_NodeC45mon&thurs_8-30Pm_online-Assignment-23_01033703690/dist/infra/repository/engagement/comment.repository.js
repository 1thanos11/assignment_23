import { Comment } from "../../database/models/comment.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class CommentRepository extends DataBaseRepository {
    constructor() {
        super(Comment);
    }
}
