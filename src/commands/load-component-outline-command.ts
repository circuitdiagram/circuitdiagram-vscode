import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { asyncSpawn } from '../async-spawn';

import { ExtensionContext } from '../extension-context';
import { ComponentOutline } from '../component-outline';
import { RenderProperties } from '../render-properties';

export function registerLoadComponentOutlineCommand(context: ExtensionContext) {
    return vscode.commands.registerCommand('circuitDiagram.loadComponentOutline', async (args) => {
        const fsPath = vscode.window.activeTextEditor.document.uri.fsPath;

        context.status.text = 'Loading Outline...';
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

        const executableCommandPrefix = config.get<string[]>('executableCommandPrefix');
        const outlineArgs = [...executableCommandPrefix, 'component-outline', fsPath];

        context.outputChannel.appendLine(`${executablePath} ${outlineArgs.join(' ')}`);
        const { code, stdout, stderr } = await asyncSpawn(executablePath, outlineArgs);

        if (code) {
            context.outputChannel.appendLine(stdout);
            context.outputChannel.appendLine(stderr);
            context.status.text = 'Error Loading Outline';
            vscode.window.showErrorMessage('Unable to load component outline.');
        } else {
            try {
                const outline = <ComponentOutline>JSON.parse(stdout);
                context.renderProperties = new RenderProperties(context.outputChannel, path.join(path.dirname(fsPath), 'render.properties'));
                await context.renderProperties.load();
                context.outlineProvider.componentChanged(outline, context.renderProperties);
                context.status.text = 'Loaded Outline';
            } catch (ex) {
                context.outputChannel.appendLine(ex);
                context.status.text = 'Error Loading Outline';
            }
        }
    });
}
