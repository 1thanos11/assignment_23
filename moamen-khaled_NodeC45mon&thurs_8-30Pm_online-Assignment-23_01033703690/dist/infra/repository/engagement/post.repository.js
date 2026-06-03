import { Post } from "../../database/models/post.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class PostRepository extends DataBaseRepository {
    constructor() {
        super(Post);
    }
}
