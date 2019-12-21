import * as vscode from 'vscode';
import * as commands from './command-names';

export function registerRenderLoadOutlineCommand() {
    return vscode.commands.registerCommand(commands.renderAndLoadOutline, async () => {
        await vscode.commands.executeCommand(commands.loadComponentOutline);
        await vscode.commands.executeCommand(commands.renderComponentPreview);
    });
}
