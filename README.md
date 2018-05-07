# Circuit Diagram VS Code Extension

Circuit Diagram component editor extension for Visual Studio Code.

## Features

Provides a "render preview" button when editing Circuit Diagram component XML files.
Any compilation errors will be displayed in VS Code and highlighted in the component
file.

If your component compiles successfully, a `render.png` file will be produced in the same
directory as your component file. You can open this in VS Code for easy editing.

## Installation

This project is in development and is not yet available in the VS marketplace.

Visit [circuit-diagram.org](http://www.circuit-diagram.org/downloads) to download the
latest version. You can manually install the VSIX file in VS Code.

You must also [download](http://www.circuit-diagram.org/downloads) the Circuit Diagram
`Command-line Tool` for your platform and configure the path in your VS Code settings.
If the command-line tool download is an archive file (e.g. zip), you will need to
extract it first.

For example:

```json
{
    "circuitDiagram.executablePath": "C:/Path/To/circuit-diagram-cli.exe"
}
```

## Extension Settings

This extension contributes the following settings:

* `circuitDiagram.executablePath`: path to the Circuit Diagram Command-line Tool executable (required)
