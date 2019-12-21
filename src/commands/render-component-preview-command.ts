import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { asyncSpawn } from '../async-spawn';
import { ExtensionContext } from '../extension-context';
import { renderComponentPreview } from './command-names';

export function registerRenderComponentPreviewCommand(context: ExtensionContext) {
    return vscode.commands.registerCommand(renderComponentPreview, async (args) => {
        const uri = args ? args : vscode.window.activeTextEditor.document.uri;
        const fsPath = args ? args.fsPath : vscode.window.activeTextEditor.document.uri.fsPath;
        if (!fsPath) {
            // Not invoked on a file
            context.outputChannel.appendLine('Not invoked on a file.');
            return;
        }

        context.status.text = 'Rendering...';
        context.status.show();

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
        const executableCommandPrefix = [...config.get<string[]>('executableCommandPrefix')];

        // Build render command line args
        const propertiesPath = path.join(path.dirname(fsPath), 'render.properties');        
        const outputPath = path.join(path.dirname(fsPath), 'render.png');

        const renderArgs = [
            ...executableCommandPrefix,
            'component',
            '-o',
            outputPath
        ];

        // Debug layout
        const debugLayout = config.get<Boolean>('debugLayout');
        if (debugLayout) {
            renderArgs.push('-d');
        }

        if (context.renderProperties && context.renderProperties.isModified) {
            context.renderProperties.save();
        }

        if (fs.existsSync(propertiesPath)) {
            renderArgs.push('-p', propertiesPath);
        }

        // Set renderer
        const rendererOption = config.get<string>('renderer');
        if (rendererOption && rendererOption.toLowerCase() !== 'default') {
            renderArgs.push('--renderer', rendererOption);
        }

        renderArgs.push(fsPath);

        context.outputChannel.appendLine(`${executablePath} ${renderArgs.join(' ')}`);
        const { code, stdout, stderr } = await asyncSpawn(executablePath, renderArgs);

        // Print output to console for debugging
        context.outputChannel.appendLine(stdout);
        context.outputChannel.appendLine(stderr);

        // Parse errors
        const lines = stdout.split('\n');
        const ds = lines.map((x) => parseLogLine(x)).filter((x) => x !== null);
        context.diagnostics.set(uri, ds);

        if (code && code !== 2) {
            vscode.window.showErrorMessage('An error occurred running the Circuit Diagram executable.');
            context.status.text = 'Error Rendering';
            context.status.show();
        } else if (ds.find((x) => x.severity === vscode.DiagnosticSeverity.Error)) {
            vscode.window.showInformationMessage('Unable to render due to errors');
            context.status.text = 'Error Rendering';
            context.status.show();
        } else {
            context.status.text = 'Rendered Component';
            context.status.show();

            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(outputPath), 2).then(() => {}, (rejectedReason) => {
                context.outputChannel.appendLine(rejectedReason);
                vscode.window.showInformationMessage('Unable to open preview.');
            });
        }
    });
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
