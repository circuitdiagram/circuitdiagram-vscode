import * as vscode from 'vscode';
import { ComponentOutlineProvider } from './component-outline-provider';
import { RenderProperties } from './render-properties';

export interface ExtensionContext {
    outputChannel: vscode.OutputChannel;
    status: vscode.StatusBarItem;
    diagnostics: vscode.DiagnosticCollection;
    outlineProvider: ComponentOutlineProvider;
    renderProperties: RenderProperties;
}
