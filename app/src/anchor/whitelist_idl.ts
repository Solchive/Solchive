import json from "../../../target/idl/solchive.json";

export type Solchive = typeof json;
export const IDL: Solchive = json;
