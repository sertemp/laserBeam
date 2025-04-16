// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

interface TargetLocation {
    file: string;
    line: number;
    column: number;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
let myStatusBarItem: vscode.StatusBarItem;


    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "laserbeam" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = "$(rocket) LaserBeam Ready"; // use icon + text
    statusBar.tooltip = "Click to scan targets";
    statusBar.command = "laserbeam.scan"; // runs your command on click
    statusBar.show();

    context.subscriptions.push(statusBar); // clean up on deactivate

    const lockIn_1 = vscode.commands.registerCommand('laserbeam.lockIn_1', async () => {
        const currentFile = vscode.window.activeTextEditor;
        const position = vscode.window.activeTextEditor?.selection.active;

        let targetLocation: TargetLocation = {
            file: String(currentFile?.document.fileName),
            line: Number(position?.line),
            column: Number(position?.character)
        };

        await context.workspaceState.update('laserbeam.target_1', targetLocation);
        statusBar.text = "LB: Locked 1";
        //vscode.window.showInformationMessage('Locked in the position for buffer 1');
    });

    const lockIn2 = vscode.commands.registerCommand('laserbeam.lockIn_2', async () => {
        const currentFile = vscode.window.activeTextEditor;
        const position = vscode.window.activeTextEditor?.selection.active;

        let targetLocation: TargetLocation = {
            file: String(currentFile?.document.fileName),
            line: Number(position?.line),
            column: Number(position?.character)
        };

        await context.workspaceState.update('laserbeam.target_2', targetLocation);

        statusBar.text = "LB: Locked 2";
        //vscode.window.showInformationMessage('Locked in the position for buffer 2');
    });

    const lockIn3 = vscode.commands.registerCommand('laserbeam.lockIn_3', async () => {
        const currentFile = vscode.window.activeTextEditor;
        const position = vscode.window.activeTextEditor?.selection.active;

        let targetLocation: TargetLocation = {
            file: String(currentFile?.document.fileName),
            line: Number(position?.line),
            column: Number(position?.character)
        };

        await context.workspaceState.update('laserbeam.target_3', targetLocation);
        statusBar.text = "LB: Locked 3";
        //vscode.window.showInformationMessage('Locked in the position for buffer 3');
    });

    const lockIn4 = vscode.commands.registerCommand('laserbeam.lockIn_4', async () => {
        const currentFile = vscode.window.activeTextEditor;
        const position = vscode.window.activeTextEditor?.selection.active;

        let targetLocation: TargetLocation = {
            file: String(currentFile?.document.fileName),
            line: Number(position?.line),
            column: Number(position?.character)
        };

        await context.workspaceState.update('laserbeam.target_4', targetLocation);

        statusBar.text = "LB: Locked 4";
        //vscode.window.showInformationMessage('Locked in the position for buffer 4');
    });

    const fire = vscode.commands.registerCommand('laserbeam.fire', async (buffer) => {
        let selectedBuffer = "";
        
        // Get the value of the buffer
        if (buffer !== undefined ) {
            switch (buffer) {
                case 1:
                    selectedBuffer = 'laserbeam.target_1';
                    break;
                case 2:
                    selectedBuffer = 'laserbeam.target_2';
                    break;
                case 3:
                    selectedBuffer = 'laserbeam.target_3';
                    break;
                case 4:
                    selectedBuffer = 'laserbeam.target_4';
                    break;
                default:
                    break;
            }
        }
        else {
            let targets: TargetLocation[] = [];
            let quickPickItems: vscode.QuickPickItem[] = [];

            for (let i = 1; i <= 4; i++) {
                let qci: vscode.QuickPickItem;
                const savedValue = context.workspaceState.get<TargetLocation>('laserbeam.target_' + i);
                if (savedValue === undefined){
                    return 0;
                }
                if (savedValue.file === undefined){
                    qci = {
                        label: String(i),
                        description: 'laserbeam.target_' + i,
                    };
                } else {
                    qci = {
                        label: String(i),
                        description: 'laserbeam.target_' + i,
                        detail: savedValue.file
                    };
                }
                quickPickItems.push(qci);
                targets.push(savedValue);   
            } 

            const options: vscode.QuickPickOptions = {
                placeHolder: 'Select a target',
                canPickMany: false
            };

            const selectedItem = await vscode.window.showQuickPick(quickPickItems, options);
            //vscode.window.showInformationMessage(String(selectedItem));
            if (selectedItem?.description === undefined) {
                return 0;
            }

            selectedBuffer = selectedItem.description;
        }

        // Check if any workspace is open before trying to save location
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage("Please open a workspace folder first.");
            return;
        }

        try {
            // Open the document
            const savedValue = context.workspaceState.get<TargetLocation>(selectedBuffer);
            if (savedValue?.file === undefined) {
                return 0;
            }
            const fileUri = vscode.Uri.file(savedValue?.file); // Create a URI from the path
            const doc = await vscode.workspace.openTextDocument(fileUri);

            // Get the position of the cursor
            if (savedValue.line === undefined || savedValue.column === undefined) {
                return 0;
            }
            const position = new vscode.Position(savedValue.line, savedValue.column);
            const range = new vscode.Range(position, position);
            // Open on the position
            await vscode.window.showTextDocument(doc, {
                selection: range, 
                preserveFocus: false,
                preview: false,
            });

            statusBar.text = "LB: Fire";
            //vscode.window.showInformationMessage(`fired to ${path.basename(String(fileUri))}`);
        
        } catch (error) {
            console.error("Error opening file:", error);
            if (error instanceof Error) {
                // Check if it's a file not found error specifically
                if ((error as any).code === 'FileNotFound' || error.message.includes('cannot open file')) {
                    vscode.window.showErrorMessage(`File not found`);
                } else {
                    vscode.window.showErrorMessage(`Failed to open file: ${error.message}`);
                }
            } else {
                vscode.window.showErrorMessage(`An unknown error occurred while opening the file.`);
            }
        }
    });

    context.subscriptions.push(fire);
    context.subscriptions.push(lockIn_1);
    context.subscriptions.push(lockIn2);
    context.subscriptions.push(lockIn3);
    context.subscriptions.push(lockIn4);
}


export function deactivate() { }
