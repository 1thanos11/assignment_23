import bcrypt from "bcrypt";
import { ROUNDS } from "../../config/config.js";
class SecurityService {
    constructor() { }
    async hash({ data, rounds = ROUNDS, }) {
        const salt = await bcrypt.genSalt(rounds);
        return await bcrypt.hash(data, salt);
    }
    async compare({ data, encrypted, }) {
        return await bcrypt.compare(data, encrypted);
    }
}
export const securityService = new SecurityService();
