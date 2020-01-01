import * as vscode from 'vscode';
import { ExtensionContext } from '../extension-context';
import { renderComponentPreview } from './command-names';
import { isNumber } from 'util';

export function registerSetComponentStateCommand(context: ExtensionContext) {
    return vscode.commands.registerCommand('circuitDiagram.setComponentState', async (args: { state: string }) => {
        const existingValue = context.renderProperties.getComponentState(args.state);

        let result: string;
        switch (args.state) {
            case 'horizontal': {
                result = await vscode.window.showQuickPick([ '<default>', 'true', 'false' ], {
                    placeHolder: existingValue,
                });
                if (result === '<default>') {
                    result = '';
                }
                break;
            }
            case 'size': {
                result = await vscode.window.showInputBox({
                    placeHolder: existingValue,
                    validateInput: (input) => !input.length || !isNaN(Number.parseFloat(input)) ? null : 'Please enter a number.',
                });
                break;
            }
            case 'flip': {
                result = await vscode.window.showQuickPick([ '<default>', 'None', 'Primary', 'Secondary', 'Both' ], {
                    placeHolder: existingValue,
                });
                if (result === '<default>') {
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
