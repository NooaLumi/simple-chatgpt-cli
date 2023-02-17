#!/usr/bin/env node

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { prompt: promptUser } = require("enquirer");
import { Configuration, OpenAIApi } from "openai";
import ora from "ora";
import {
	OPENAI_API_KEY,
	MIN_QUESTION_LENGTH,
	INCLUDE_HISTORY,
	MODEL,
	MAX_TOKENS,
	MIN_RESPONSE_TOKENS,
	TEMPERATURE,
} from "./config.js";

interface PromptHistory {
	question: string;
	answer: string;
}

interface HistoryAPI {
	add(question: string, answer: string): this;
	get(): PromptHistory[];
	getAsPrompt(): string;
	clear(): this;
}

// Configure OpenAI
const openaiConfig = new Configuration({
	apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(openaiConfig);

// TODO There should be a more precise way to calculate this
const getTokenCountForString = (string: string) => string.split(" ").length;

// Initialize history
function createHistory(): HistoryAPI {
	let history: PromptHistory[] = [];

	function add(this: HistoryAPI, question: string, answer: string) {
		history.push({ question, answer });
		return this;
	}

	function getAsPrompt(): string {
		return history.reduce((prompt: string, historyObj: PromptHistory) => {
			return prompt + `Q: ${historyObj.question}\nA: ${historyObj.answer}\n`;
		}, "");
	}

	const get = () => history;

	function clear(this: HistoryAPI) {
		history = [];
		return this;
	}

	return {
		add,
		get,
		getAsPrompt,
		clear,
	};
}
const historyStore = createHistory();

const generateResponse = async (req: string): Promise<string> => {
	const prompt = INCLUDE_HISTORY ? `${historyStore.getAsPrompt()}Q: ${req}\n A: ` : req;
	const maxResponseTokens = MAX_TOKENS - getTokenCountForString(prompt);

	if (maxResponseTokens < MIN_RESPONSE_TOKENS) {
		console.error("Ran out of token space. Clearing history...");
		historyStore.clear();
		return await generateResponse(req); // Get response again
	}

	try {
		const completion = await openai.createCompletion({
			model: MODEL,
			prompt,
			max_tokens: maxResponseTokens,
			temperature: TEMPERATURE,
		});

		return completion.data.choices[0].text;
	} catch (err) {
		// TODO Option to retry when request fails with certain errors (server overloaded, bad internet, etc. )
		console.error("Error: Unexpected response generation failure.");
		if (err.response) {
			console.error(err.response.status, err.response.data);
		} else {
			console.error(err.message);
		}
		process.exit(1);
	}
};

const getInputValidity = (input: string): { isValid: boolean; message?: string } => {
	if (input.length < MIN_QUESTION_LENGTH) {
		return {
			isValid: false,
			message: `Error: Minimum question length is ${MIN_QUESTION_LENGTH}`,
		};
	}
	if (MAX_TOKENS - getTokenCountForString(input) < MIN_RESPONSE_TOKENS) {
		return {
			isValid: false,
			message: "Error: Prompt is too long. Either shorten your prompt, or check your configuration.",
		};
	}

	return {
		isValid: true,
	};
};

const handleInput = async (input: string) => {
	const cleanInput = input.trim();
	if (cleanInput === "exit") return;

	// Check input validity
	const inputValidity = getInputValidity(cleanInput);
	if (!inputValidity.isValid) {
		console.error(inputValidity.message);
		promptInput();
		return;
	}

	// Generate response
	const spinner = ora("Generating response...").start();
	const response = (await generateResponse(cleanInput)).trim();
	spinner.stop();
	console.log("ChatGPT: " + response);

	// Manage history

	historyStore.add(cleanInput, response);
	const historyTokenCount = getTokenCountForString(historyStore.getAsPrompt());

	if (historyTokenCount > MAX_TOKENS / 3) {
		console.log("Your chat history is filling up. Consider starting a new session.");
	}

	promptInput();
};

const promptInput = async () => {
	try {
		const { question } = (await promptUser({
			name: "question",
			type: "input",
			message: "Ask ChatGPT",
			multiline: true,
		})) as { question: string };

		await handleInput(question);
	} catch (err) {
		process.exit(0);
	}
};

process.on("exit", code => {
	// Exited without errors
	if (code === 0) {
		console.log("ChatGPT: Until next time :)\n");
	}
});

// Prompt user for input for the first time
promptInput();

// TODO
// * option to retry after request fail
// * option to override config defaults with cli parameters
