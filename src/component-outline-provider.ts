import * as vscode from 'vscode';
import { ComponentOutline, ComponentProperty } from './component-outline';
import { RenderProperties } from './render-properties';
import * as commands from './commands';

export class ComponentOutlineProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    private outline: ComponentOutline;
    private renderProperties: RenderProperties;

    private stateNode = new vscode.TreeItem('State', vscode.TreeItemCollapsibleState.Expanded);
    private configurationsNode = new vscode.TreeItem('Configurations', vscode.TreeItemCollapsibleState.Expanded);
    private propertiesNode = new vscode.TreeItem('Properties', vscode.TreeItemCollapsibleState.Expanded);

    private horizontalStateNode = new vscode.TreeItem('horizontal');
    private sizeNode = new vscode.TreeItem('size');
    private flipStateNode = new vscode.TreeItem('flip');

	private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<vscode.TreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;
    
    constructor() {
        this.horizontalStateNode.command = {
            title: 'setState',
            command: commands.setComponentState,
            arguments: [{ state: 'horizontal' }],
        };
        this.sizeNode.command = {
            title: 'setSize',
            command: commands.setComponentState,
            arguments: [{ state: 'size' }],
        };
        this.flipStateNode.command = {
            title: 'setFlip',
            command: commands.setComponentState,
            arguments: [{ state: 'flip' }],
        };
    }

    componentChanged(outline: ComponentOutline, renderProperties: RenderProperties): void {
        this.outline = outline;
        this.renderProperties = renderProperties;
        this.refresh();
    }

    getProperty(propertyName: string): ComponentProperty {
        return this.outline.properties.find(x => x.name === propertyName);
    }

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (!this.outline) {
            return;
        }

        if (!element) {
            return Promise.resolve([ this.stateNode, this.configurationsNode, this.propertiesNode ]);
        }

        if (element === this.stateNode) {
            this.horizontalStateNode.description = this.renderProperties.getComponentState('horizontal');
            this.sizeNode.description = this.renderProperties.getComponentState('size');
            this.flipStateNode.description = this.renderProperties.getComponentState('flip');
            return Promise.resolve([ this.horizontalStateNode, this.sizeNode, this.flipStateNode ]);
        }

        if (element === this.configurationsNode) {
            return Promise.resolve(this.outline.configurations.map(x => {
                const confItem = new vscode.TreeItem(x.name);
                confItem.command = {
                    title: 'setConfiguration',
                    command: commands.setComponentConfiguration,
                    arguments: [{ configuration: x.name }],
                };
                return confItem;
            }));
        }

        if (element === this.propertiesNode) {
            return Promise.resolve(this.outline.properties.map(x => {
                const propertyItem = new vscode.TreeItem(x.name);
                propertyItem.description = this.renderProperties.getPropertyValue(x.name);
                propertyItem.command = {
                    title: 'setProperty',
                    command: commands.setComponentProperty,
                    arguments: [{ propertyName: x.name }],
                };
                return propertyItem;
            }));
        }
	}
}
