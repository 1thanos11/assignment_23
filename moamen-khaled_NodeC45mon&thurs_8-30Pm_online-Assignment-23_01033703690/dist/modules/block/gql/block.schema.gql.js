import { GraphQLString } from "graphql";
import { blockGraphQLArgs } from "./block.args.gql.js";
import { blockGraphQLType } from "./block.types.gql.js";
import { blockResolver } from "./block.resolver.js";
class BlockGraphQLSchema {
    blockType = blockGraphQLType;
    blockArgs = blockGraphQLArgs;
    blockResolver = blockResolver;
    registerQuery() {
        return {
            blockList: {
                description: "block list of current user",
                args: this.blockArgs.blockList,
                type: this.blockType.blockList,
                resolve: this.blockResolver.blockList,
            },
        };
    }
    registerMutation() {
        return {
            block: {
                description: "block",
                args: this.blockArgs.block,
                type: this.blockType.block,
                resolve: this.blockResolver.block,
            },
            unBlock: {
                description: "un block",
                args: this.blockArgs.block,
                type: this.blockType.block,
                resolve: this.blockResolver.unBlock,
            },
        };
    }
}
export const blockGraphQLSchema = new BlockGraphQLSchema();
