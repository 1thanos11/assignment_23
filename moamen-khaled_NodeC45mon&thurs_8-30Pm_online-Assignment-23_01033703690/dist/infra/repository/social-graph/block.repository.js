import { Block } from "../../database/models/block.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class BlockRepository extends DataBaseRepository {
    constructor() {
        super(Block);
    }
}
