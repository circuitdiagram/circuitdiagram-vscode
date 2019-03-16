# Circuit Diagram VS Code Extension

[![Build Status](https://travis-ci.org/circuitdiagram/circuitdiagram-vscode.svg?branch=master)](https://travis-ci.org/circuitdiagram/circuitdiagram-vscode)

Circuit Diagram component editor extension for Visual Studio Code.

## Features

Provides a _render preview_ button when editing Circuit Diagram component XML files.
Any compilation errors will be displayed in VS Code and highlighted in the component
file.

If your component compiles successfully, a `render.png` file will be produced in the same
directory as your component file. You can open this in VS Code for easy editing.

## Installation

This project is in development and is not yet available in the VS marketplace.

Visit [circuit-diagram.org](http://www.circuit-diagram.org/downloads) to download the
latest version. You can manually install the VSIX file in VS Code.

You must also [download](http://www.circuit-diagram.org/downloads) the Circuit Diagram
command line for your platform and configure the path in your VS Code settings.
If the command-line download is an archive file (e.g. zip), you will need to extract it first.
See [command line setup](https://www.circuit-diagram.org/help/command-line) for more information.

For example:

```json
{
    "circuitDiagram.executablePath": "C:/Path/To/circuit-diagram-cli.exe"
}
```

## Extension Settings

This extension contributes the following settings:

* `circuitDiagram.executablePath`: path to the Circuit Diagram Command-line executable (required)

* `circuitDiagram.debugLayout`: render component layout information (shown in blue, default `false`)

* `circuitDiagram.executableCommand`: override render command (advanced use only)
