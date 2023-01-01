import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DynamicComboBox } from './DynamicComboBox';

export class DynamicDropdown implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    rootContainer: HTMLDivElement;
    selectedValue: string | number;
    context: ComponentFramework.Context<IInputs>;

    /**
     * Empty constructor.
     */
    constructor() { }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(
        context: ComponentFramework.Context<IInputs>, 
        notifyOutputChanged: () => void, 
        state: ComponentFramework.Dictionary, 
        container:HTMLDivElement): void
    {
        this.notifyOutputChanged = notifyOutputChanged;
        this.rootContainer = container;
        this.context = context;
        this.context.mode.trackContainerResize(true);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        const { value, entityType, query, textField, valueField, ...queryValues } = context.parameters;
        let errorMessage: string | undefined = undefined;
        let options: ComponentFramework.WebApi.Entity[] = [] as ComponentFramework.WebApi.Entity[];

        let disabled = context.mode.isControlDisabled;
        let masked = false;
        if (value.security) {
            disabled = disabled || !value.security.editable;
            masked = !value.security.readable;
        }

        type possibleQueryValueNames = 'queryValue1' | 'queryValue2' | 'queryValue3' | 'queryValue4' | 'queryValue5';

        const getQueryValue = (_: string, index: any) => {
            const queryValue = queryValues['queryValue' + index as possibleQueryValueNames]; 
            if (queryValue.type == 'Lookup.Simple') {
                const value = (queryValue as ComponentFramework.PropertyTypes.LookupProperty).raw
                return value ? value[0].id : null;
            }
            return queryValue.raw;
        }
        
        if (value && value.attributes && query && entityType.raw && query.raw) {
            const q = queryValues ? query.raw.replace(/\${(\d+)}/gm, getQueryValue) : query.raw;
            let p = context.webAPI.retrieveMultipleRecords(entityType.raw, q).then(
                (value) => { options = value.entities; },
                (error) => { errorMessage = error.message; }
            );

            p.then(() => {
                ReactDOM.render(
                    React.createElement(DynamicComboBox, {
                        //label: value.attributes.DisplayName,
                        label : '',
                        value: value.raw,
                        /* fetch list from webApi / fetchXml, then map and return it. */
                        options: options,
                        optionKeyField: valueField.raw,
                        optionTextField: textField.raw,
                        disabled: disabled,
                        masked: masked,
                        errorMessage: errorMessage,                    
                        onChange: this.onChange,
                    }),
                    this.rootContainer,
                );
            })
        }
    }

    retrieveOption = async (entityType: string, query: string, webAPI: ComponentFramework.WebApi): Promise<any> => {
        if (!entityType || !query) { return; }
        
        try {
            const t = await webAPI.retrieveMultipleRecords(entityType, query);
            return { options: t.entities }
        } catch (error) {
            return { errorMessage: error }
        }
    }

    onChange = (newValue: string | number): void => {
        this.selectedValue = newValue;
        this.notifyOutputChanged();
    };

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return { value: this.selectedValue } as IOutputs;
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        ReactDOM.unmountComponentAtNode(this.rootContainer);
    }
}
