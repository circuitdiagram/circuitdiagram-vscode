import * as fs from 'fs';
import { OutputChannel } from 'vscode';

export class RenderProperties {
    private lines: string[];
    private modified = false;

    constructor(private outputChannel: OutputChannel, private fsPath: string) {}

    public load(): Promise<void> {
        return new Promise(resolve => {
            fs.exists(this.fsPath, (exists) => {
                if (!exists) {
                    this.outputChannel.appendLine(`render.properties does not exist: '${this.fsPath}'`);
                    resolve();
                    return;
                }

                fs.readFile(this.fsPath, 'utf8', (_, data) => {
                    this.outputChannel.appendLine(`Successfully loaded render.properties from: '${this.fsPath}'`);
                    this.lines = data.split('\n');
                    resolve();
                });
            });
        });
    }

    public get isModified(): boolean {
        return this.modified;
    }

    public save(): Promise<void> {
        return new Promise(resolve => {
            fs.writeFile(this.fsPath, this.lines.join('\n'), (_) => {
                this.modified = false;
                resolve();
            });
        });
    }

    public getConfiguration(): string {
        const conf = this.lines.find(x => x.startsWith('configuration'));
        if (!conf) {
            return null;
        }
        return conf.split('=')[1].trim();
    }

    public setConfiguration(configuration: string): void {
        this.modified = true;
        const newProp = `configuration=${configuration}`;
        const confIndex = this.lines.findIndex(x => x.match(`^configuration ?=`));
        if (confIndex === -1) {
            this.lines.push(newProp);
            return;
        }

        this.lines.splice(confIndex, 1, newProp);
    }

    public getPropertyValue(propertyName: string): string {
        const prop = this.lines.find(x => x.match(`^\\$${propertyName} ?=`));
        if (!prop) {
            return null;
        }
        return prop.split('=')[1].trim();
    }

    public setPropertyValue(propertyName: string, propertyValue: string): void {
        this.modified = true;
        const newProp = `\$${propertyName}=${propertyValue}`;
        const propIndex = this.lines.findIndex(x => x.match(`^\\$${propertyName} ?=`));
        if (propIndex === -1) {
            this.lines.push(newProp);
            return;
        }

        if (propertyValue !== '') {
            this.lines.splice(propIndex, 1, newProp);
        } else {
            this.lines.splice(propIndex, 1);
        }
    }

    public getComponentState(state: string): string {
        const prop = this.lines.find(x => x.match(`^${state} ?=`));
        if (!prop) {
            return null;
        }
        return prop.split('=')[1].trim();
    }

    public setComponentState(state: string, value: string): void {
        this.modified = true;
        const newProp = `${state}=${value}`;
        const propIndex = this.lines.findIndex(x => x.match(`^${state} ?=`));
        if (propIndex === -1) {
            this.lines.push(newProp);
            return;
        }

        if (value !== '') {
            this.lines.splice(propIndex, 1, newProp);
        } else {
            this.lines.splice(propIndex, 1);
        }
    }
}
