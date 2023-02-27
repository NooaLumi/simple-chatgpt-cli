# Simple CLI for ChatGPT

This is a very simple commandline interface for the OpenAI ChatGPT API built using node

## Requirements

-   **Node** (version 16 or newer)
-   **npm**

## Installation steps (Linux, Mac, WSL)

1. Clone this repository on your computer
2. Navigate to the project root on your terminal
3. Rename the `.env.example` file to `.env`, and add your OpenAI API key to the `OPENAI_API_KEY` - variable. You can also adjust the configuration to your liking. Get your API key here: https://platform.openai.com/docs/quickstart/add-your-api-key
4. Run `npm run build`
5. Make the script executable by running `sudo chmod +x ./dist/chatgpt-cli.js`
6. You can now run the script: `./dist/chatgpt-cli.js`
7. You may want to alias the path to the script in your shell. Here's how you can do it if you're using bash:
    1. Get the absolute path to the script. You can do this by running `pwd` inside the dist -folder, and appending the name of the script to the path.
    2. Open your `.bashrc` -file in your editor of choice. The file should be located in your home directory.
    3. To the bottom of the file, add the following line: `alias chatgpt="/absolute/path/to/script/here"`, and replace the part in quotes with the absolute path to the script.
    4. Either reboot your computer, or run the following command in your terminal: `source ~/.bashrc` (assuming your .bashrc -file is inside your home directory)
    5. You can now run `chatgpt` on your terminal, and the script should start.

## Usage

Simply write your question when prompted, and press enter twice to submit. To cancel your prompt and exit the program, press `ctrl+c`.

If you'd like ChatGPT to remember your previous questions in the current session, you can set the `INCLUDE_HISTORY` environment variable to `"true"`. This will include your previous questions and responses in every subsequent request, which will inevitably use more tokens. To clear your history, simply exit the current session with `ctrl+c` and start a new one.
