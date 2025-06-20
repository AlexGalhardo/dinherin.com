import { v4 as uuidv4 } from "uuid";

export function generateApiKey(): string {
	return `api_key_dinherin_${uuidv4().replace(/-/g, "")}`;
}
