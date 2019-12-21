'use strict';
import * as vscode from 'vscode';
import { ComponentOutlineProvider } from './component-outline-provider';
import { ExtensionContext } from './extension-context';
import * as commands from './commands';

export function activate(context: vscode.ExtensionContext) {
    const diagnostics = vscode.languages.createDiagnosticCollection('Circuit Diagram');

    const outputChannel = vscode.window.createOutputChannel('Circuit Diagram');
    context.subscriptions.push(outputChannel);

    context.subscriptions.push(vscode.commands.registerCommand('circuitDiagram.showOutputWindow', () => {
        outputChannel.show();
    }));

    const status = vscode.window.createStatusBarItem();
    status.tooltip = 'Circuit Diagram Output';
    status.command = 'circuitDiagram.showOutputWindow';

    const outlineProvider = new ComponentOutlineProvider();
    vscode.window.registerTreeDataProvider('circuitDiagram.componentOutline', outlineProvider);

    const circuitDiagramContext: ExtensionContext = {
        diagnostics,
        outlineProvider,
        outputChannel,
        renderProperties: null,
        status,
    };

    context.subscriptions.push(commands.registerRenderComponentPreviewCommand(circuitDiagramContext));
    context.subscriptions.push(commands.registerLoadComponentOutlineCommand(circuitDiagramContext));
    context.subscriptions.push(commands.registerRenderLoadOutlineCommand());
    context.subscriptions.push(commands.registerSetComponentStateCommand(circuitDiagramContext));
    context.subscriptions.push(commands.registerSetComponentPropertyCommand(circuitDiagramContext));
    context.subscriptions.push(commands.registerSetComponentConfigurationCommand(circuitDiagramContext));
}

export function deactivate() {
}
