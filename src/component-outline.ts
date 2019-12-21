export interface ComponentOutline {
    properties: ComponentProperty[];
    configurations: ComponentConfiguration[];
}

export interface ComponentProperty {
    name: string;
    type: string;
    enumOptions: string[];
}

export interface ComponentConfiguration {
    name: string;
}
