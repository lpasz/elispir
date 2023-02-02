import * as vscode from 'vscode';

let terminal: vscode.Terminal | null = null;
const config = vscode.workspace.getConfiguration('elispir');

/// EXPERIMENTAL, STILL BROKEN.
const getTerminalText = async () => {
	let previousCopyPaste = await vscode.env.clipboard.readText()

	await vscode.commands.executeCommand('workbench.action.terminal.selectToPreviousLine')
	await vscode.commands.executeCommand('workbench.action.terminal.copySelection')
	await vscode.commands.executeCommand('workbench.action.terminal.clearSelection')
	await vscode.commands.executeCommand('workbench.action.terminal.')

	let lastTerminalCommand = await vscode.env.clipboard.readText()

	await vscode.env.clipboard.writeText(previousCopyPaste);

	console.log({ lastTerminalCommand })
}

const createTerminal = async () => {
	if (!terminal || terminal?.exitStatus) {
		terminal = vscode.window.createTerminal("Integrated Terminal")
		terminal.show(true)
		const startCmd = config.get('iexCommand') as string
		terminal.sendText(startCmd)
	}
}

const getSelectedText = (editor: vscode.TextEditor): string => {
	var selection = editor.selection
	return editor.document.getText(selection)
}

const getCurrentLineText = (editor: vscode.TextEditor): string => {
	const { text } = editor?.document.lineAt(editor.selection.active.line);
	return text;
}

const getAllLinesAbove = (editor: vscode.TextEditor, currentLine: number): string => {
	let allLinesAboveText = "";
	for (let index = 0; index < currentLine; index++) {
		const { text } = editor?.document.lineAt(index)
		allLinesAboveText = allLinesAboveText + text + "\n";
	}
	return allLinesAboveText;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let reload = vscode.commands.registerCommand('elispir.reload', async () => {
		await createTerminal();
		const editor = vscode.window.activeTextEditor;
		if (editor) terminal?.sendText("reload", true)

	});

	let sendText = vscode.commands.registerCommand('elispir.sendText', async () => {
		await createTerminal();
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const selectedText = getSelectedText(editor)
			if (selectedText) {
				terminal?.sendText(selectedText, true)
			} else {
				const currentLineText = getCurrentLineText(editor)
				terminal?.sendText(currentLineText, true)
			}

			getTerminalText()
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
			const allLinesAbove = getAllLinesAbove(editor, currentLine)
			terminal?.sendText(allLinesAbove, true)
			console.log({ terminal })
		}
	});


	context.subscriptions.push(sendText);
	context.subscriptions.push(sendFile);
	context.subscriptions.push(sendAllLinesAbove);
	context.subscriptions.push(reload);
}

export function deactivate() { }
