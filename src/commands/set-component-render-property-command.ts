import * as vscode from 'vscode';
import { ExtensionContext } from '../extension-context';
import { renderComponentPreview, setComponentProperty } from './command-names';

export function registerSetComponentPropertyCommand(context: ExtensionContext) {
    return vscode.commands.registerCommand(setComponentProperty, async (args) => {
        const propertyName: string = args.propertyName;
        const property = context.outlineProvider.getProperty(propertyName);
        const existingValue = context.renderProperties.getPropertyValue(propertyName);

        let result: string;
        if (property && property.enumOptions && property.enumOptions.length) {
            result = await vscode.window.showQuickPick([ '<default>', ...property.enumOptions ], {
                placeHolder: propertyName,
            });
            if (result == '<default>') {
                result = '';
            }
        } else {
            result = await vscode.window.showInputBox({
                placeHolder: propertyName,
            });
        }

        if (result === undefined) {
            return;
        }
        
        context.renderProperties.setPropertyValue(propertyName, result);
        context.outlineProvider.refresh();
        await vscode.commands.executeCommand(renderComponentPreview);
    });
}
