import * as vscode from 'vscode';
import { ExtensionContext } from '../extension-context';
import { renderComponentPreview } from './command-names';

export function registerSetComponentStateCommand(context: ExtensionContext) {
    return vscode.commands.registerCommand('circuitDiagram.setComponentState', async (args: { state: string }) => {
        const existingValue = context.renderProperties.getComponentState(args.state);

        let result: string;
        switch (args.state) {
            case 'horizontal': {
                result = await vscode.window.showQuickPick([ '<default>', 'true', 'false' ], {
                    placeHolder: existingValue,
                });
                if (result == '<default>') {
                    result = '';
                }
                break;
            }
            default: {
                return;
            }
        }

        if (result === undefined) {
            return;
        }

        context.renderProperties.setComponentState(args.state, result);
        context.outlineProvider.refresh();
        await vscode.commands.executeCommand(renderComponentPreview);
    });
}
