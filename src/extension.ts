'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as child_process from "child_process";
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    const diagnostics = vscode.languages.createDiagnosticCollection('Circuit Diagram');

    const outputChannel = vscode.window.createOutputChannel('Circuit Diagram');
    context.subscriptions.push(outputChannel);

    const disposable = vscode.commands.registerCommand('circuitDiagram.renderPreview', (args) => {
        if (!args || !args.fsPath) {
            // Not invoked on a file
            return;
        }

        // Get path to Circuit Diagram exe
        const config = vscode.workspace.getConfiguration('circuitDiagram');
        const executablePath = config.get<string>('executablePath');
        if (executablePath === null) {
            vscode.window.showErrorMessage('Path to Circuit Diagram executable not set.');
            return;
        }
        if (!fs.existsSync(executablePath)) {
            vscode.window.showErrorMessage('Circuit Diagram executable is set to a path that does not exist.');
            return;
        }

        // Get command to run
        const executableCommand = config.get<string[]>('executableCommand');
        if (!executableCommand) {
            vscode.window.showErrorMessage('Executable command cannot be empty.');
            return;
        }

        // Debug layout
        const debugLayout = config.get<Boolean>('debugLayout');
        if (debugLayout) {
            executableCommand.push('-d');
        }

        // Build render command line args
        const propertiesPath = path.join(path.dirname(args.fsPath), 'render.properties');        
        const outputPath = path.join(path.dirname(args.fsPath), 'render.png');

        const renderArgs = [
            ...executableCommand,
            '-o',
            outputPath
        ];

        if (fs.existsSync(propertiesPath)) {
            console.log('Using properties file', propertiesPath);
            renderArgs.push('-p', propertiesPath);
        }

        renderArgs.push(args.fsPath);

        outputChannel.appendLine(`${executableCommand} ${renderArgs.join(' ')}`);
        const result = child_process.spawnSync(executablePath, renderArgs);

        // Print output to console for debugging        
        const output = result.stdout.toString();
        outputChannel.appendLine(output);
        outputChannel.appendLine(result.stderr.toString());

        // Parse errors
        const lines = output.split('\n');
        const ds = lines.map((x) => parseLogLine(x)).filter((x) => x !== null);
        diagnostics.set(args, ds);

        if (result.status) {
            vscode.window.showErrorMessage('An error occurred running the Circuit Diagram executable.');
        } else if (ds.find((x) => x.severity === vscode.DiagnosticSeverity.Error)) {
            vscode.window.showInformationMessage('Unable to render due to errors');
        } else {
            vscode.window.showInformationMessage('Rendered preview');
            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(outputPath), 2).then(() => {}, (rejectedReason) => {
                outputChannel.appendLine(rejectedReason);
                vscode.window.showInformationMessage('Unable to open preview.');
            });
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

// Example log line: "ERROR .\resistor.xml(88,8:88,19): Property single_text used for text value does not exist"
function parseLogLine(line: string): vscode.Diagnostic {
    const levels = ['ERROR', 'WARNING', 'INFORMATION'];

    const level = levels.find((x) => line.startsWith(x));
    if (!level) {
        return null;
    }

    const severity = getSeverity(level);

    const startPos = line.indexOf('(');    
    const endPos = line.indexOf(')');
    const location = line.substring(startPos + 1, endPos).split(/[,:]/).map(x => parseInt(x));
    
    return new vscode.Diagnostic(new vscode.Range(
        new vscode.Position(location[0] - 1, location[1] - 1),
        new vscode.Position(location[2] - 1, location[3] - 1),
    ), line.substring(endPos + 2), severity);
}

function getSeverity(level: string) {
    switch(level) {
        case 'ERROR':
            return vscode.DiagnosticSeverity.Error;
        case 'WARNING':
            return vscode.DiagnosticSeverity.Warning;
        default:
            return vscode.DiagnosticSeverity.Information;
    }
}
