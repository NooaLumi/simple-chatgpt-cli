import * as dotenv from "dotenv";
dotenv.config();

const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY;
const MIN_QUESTION_LENGTH: number = Number(process.env.MIN_QUESTION_LENGTH) ?? 10;
const INCLUDE_HISTORY: boolean = process.env?.INCLUDE_HISTORY === "true" ? true : false;
const MODEL: string = process.env.MODEL ?? "text-davinci-003";
const MAX_TOKENS: number = Number(process.env.MAX_TOKENS) ?? 4000;
const MIN_RESPONSE_TOKENS = Number(process.env.MIN_RESPONSE_TOKENS) ?? 800;
const TEMPERATURE: number = Number(process.env.TEMPERATURE) ?? 0.6;

if (MAX_TOKENS > 4000 || MAX_TOKENS < 1) {
	throw new TypeError("The MAX_TOKENS environment variable must be a number between 1 and 4000.");
}

if (TEMPERATURE > 2 || TEMPERATURE < 0.1) {
	throw new TypeError("The TEMPERATURE environemnt variable must be a number between 0.1 and 2.");
}

export { OPENAI_API_KEY, MIN_QUESTION_LENGTH, INCLUDE_HISTORY, MODEL, MAX_TOKENS, MIN_RESPONSE_TOKENS, TEMPERATURE };
