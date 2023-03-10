import * as vscode from 'vscode';

let terminal: vscode.Terminal | null = null;
let decorators: vscode.DecorationOptions[] = []
const config = vscode.workspace.getConfiguration('elispir');

export function activate(context: vscode.ExtensionContext) {
	let timeout: NodeJS.Timer | undefined = undefined;

	// create a decorator type that we use to decorate small numbers
	const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: {
			// this color will be used in light color themes
			borderColor: 'darkblue'
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightblue'
		}
	});

	let activeEditor = vscode.window.activeTextEditor;

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		activeEditor.setDecorations(smallNumberDecorationType, decorators);
	}

	function triggerUpdateDecorations(throttle = false) {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		if (throttle) {
			timeout = setTimeout(updateDecorations, 500);
		} else {
			updateDecorations();
		}
	}

	setInterval(triggerUpdateDecorations, 200)

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

			setTimeout(() => getTerminalText(editor), 500);
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
			setTimeout(() => getTerminalText(editor), 500);
		}
	});


	context.subscriptions.push(sendText);
	context.subscriptions.push(sendFile);
	context.subscriptions.push(sendAllLinesAbove);
	context.subscriptions.push(reload);

	const getTerminalText = async (editor: vscode.TextEditor) => {
		let previousCopyPaste = await vscode.env.clipboard.readText()

		await vscode.commands.executeCommand('workbench.action.terminal.focus')
		await vscode.commands.executeCommand('workbench.action.terminal.selectToPreviousLine')
		await vscode.commands.executeCommand('workbench.action.terminal.copySelection')
		await vscode.commands.executeCommand('workbench.action.terminal.clearSelection')
		await vscode.commands.executeCommand('workbench.action.terminal.scrollToBottom')
		await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup')
		const lastLineOfTerminal = await vscode.env.clipboard.readText()
		const lastTerminalCommand = lastLineOfTerminal?.split("iex(")?.at(-1)?.split("\n").slice(1).join("\n")

		await vscode.env.clipboard.writeText(previousCopyPaste)
		if (getSelectedText(editor)) {
			decorators = [{ range: editor.selection, hoverMessage: lastTerminalCommand }];
		} else {
			const line = editor.document.lineAt(editor.selection.active.line)
			decorators = [{ range: line.range, hoverMessage: lastTerminalCommand }];
		}
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
}

export function deactivate() { }