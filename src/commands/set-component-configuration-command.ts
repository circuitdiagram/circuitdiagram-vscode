import * as vscode from 'vscode';
import { ExtensionContext } from '../extension-context';
import { renderComponentPreview, setComponentConfiguration } from './command-names';

export function registerSetComponentConfigurationCommand(context: ExtensionContext) {
    return vscode.commands.registerCommand(setComponentConfiguration, async (args: { configuration: string }) => {
        context.renderProperties.setConfiguration(args.configuration);
        context.outlineProvider.refresh();
        await vscode.commands.executeCommand(renderComponentPreview);
    });
}
