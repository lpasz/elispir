// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let terminal: vscode.Terminal | null = null;

const createTerminal = async () => {
	if (!terminal) {
		terminal = vscode.window.createTerminal("Integrated Terminal")
		terminal.show(true)
		terminal.sendText("iex")
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "elispir" is now active!');

	let reload = vscode.commands.registerCommand('elispir.reload', async () => {
		await createTerminal();
		const editor = vscode.window.activeTextEditor;
		if (editor) terminal?.sendText("reload", true)

	});

	let sendText = vscode.commands.registerCommand('elispir.sendText', async () => {
		await createTerminal();
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			var selection = editor.selection
			var selectionText = editor.document.getText(selection)
			if (selectionText) {
				if (selectionText) terminal?.sendText(selectionText, true)
			} else {
				const { text } = editor?.document.lineAt(editor.selection.active.line);
				if (text) terminal?.sendText(text, true);
			}
		}
	});

	let sendFile = vscode.commands.registerCommand('elispir.sendFile', async () => {
		await createTerminal();
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			var fileText = editor.document.getText()
			if (fileText) terminal?.sendText(fileText, true)
		}
	});

	let sendAllLinesAbove = vscode.commands.registerCommand('elispir.sendAllLinesAbove', async () => {
		await createTerminal();
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const currentLine = editor.selection.active.line;
			let allLinesAboveText = "";
			for (let index = 0; index < currentLine; index++) {
				const { text } = editor?.document.lineAt(index)
				allLinesAboveText = allLinesAboveText + text + "\n";
			}
			terminal?.sendText(allLinesAboveText, true)
			console.log({terminal})
		}
	});


	context.subscriptions.push(sendText);
	context.subscriptions.push(sendFile);
	context.subscriptions.push(sendAllLinesAbove);
	context.subscriptions.push(reload);
}

// This method is called when your extension is deactivated
export function deactivate() { }
