'use strict';
import * as vscode from 'vscode';
import * as child_process from "child_process";
import * as fs from 'fs';

export function asyncSpawn(command: string, args: string[]): Promise<{ code: number, stdout: string, stderr: string }> {
    const opts: child_process.SpawnOptions = {};

    // Set working dir to workspace folder
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]) {
        const fsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        if (fs.existsSync(fsPath)) {
            opts.cwd = fsPath;
        }
    }

    const process = child_process.spawn(command, args, opts);
    const stdout = [];
    const stderr = [];
    process.stdout.on('data', (x) => stdout.push(x));
    process.stderr.on('data', (x) => stderr.push(x));
    return new Promise(resolve => {
        process.on('exit', (code) => resolve({ code, stdout: stdout.join(''), stderr: stderr.join('') }));
    });
}
