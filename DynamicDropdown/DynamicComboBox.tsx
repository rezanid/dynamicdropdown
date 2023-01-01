// import * as React from 'react';
// import {
//   ComboBox,
//   IComboBoxOption,
//   IComboBoxStyles,
// } from '@fluentui/react';

import { TextField } from "@fluentui/react";
import { ComboBox, IComboBoxOption, IComboBoxStyles } from "@fluentui/react/lib/ComboBox";
import React, { memo, useCallback, useMemo } from "react";

export interface DynamicComboBoxProps {
  label: string;
  value: string | null;
  options: ComponentFramework.WebApi.Entity[];
  optionTextField: string | null;
  optionKeyField: string | null;
  disabled: boolean;
  masked: boolean;
  errorMessage: string | undefined;
  onChange: (newValue: string | number) => void;
}

/* Sample:
const options: IComboBoxOption[] = 
[
    { key: 'Header1', text: 'First heading', itemType: SelectableOptionMenuItemType.Header },
    { key: 'A', text: 'Option A' },
    { key: 'B', text: 'Option B' },
    { key: 'divider', text: '-', itemType: SelectableOptionMenuItemType.Divider },
    { key: 'Header2', text: 'Second heading', itemType: SelectableOptionMenuItemType.Header },
    { key: 'E', text: 'Option E' },
    { key: 'F', text: 'Option F', disabled: true },
    { key: 'J', text: 'Option J' },
  ];
*/

const comboBoxStyles: Partial<IComboBoxStyles> = { root: { maxWidth: 300 } };

export const DynamicComboBox = memo((props: DynamicComboBoxProps) => {
  const { label, value, options, optionKeyField, optionTextField, disabled, masked, errorMessage, onChange } = props;
  const valueKey = value != null ? value.toString() : undefined;

  const items = useMemo(() => {
    if (errorMessage) {
      return {
        error: errorMessage ?? 'Value field or text field are not set.',
        choices: [{} as IComboBoxOption]
      }
    }

    if (!optionKeyField || !optionTextField) {
      return {
        error: 'Value field or text field are not set.',
        choices: [{} as IComboBoxOption]
      }
    }

    return {
      error: undefined,
      choices: 
        options.map((item) => {
          return {
            key: optionKeyField.indexOf('$') > -1 ? optionKeyField.replace(/\${([\w_]+)}/gm, (_,m)=> item[m]) : item[optionKeyField],
            text: optionTextField.indexOf('$') > -1 ? optionTextField.replace(/\${([\w_]+)}/gm, (_,m)=> item[m]) : item[optionTextField]
          } as IComboBoxOption;
        })
    };
  }, [options]);

  const onChangeComboBox = useCallback(
    (ev?: unknown, option?: IComboBoxOption): void => {
      onChange(option ? (option.key) : '')
    },
    [onChange]
  );

  return (
    <>
      {items.error}

      {masked && '****'}

      <ComboBox
        label={label}
        selectedKey={valueKey}
        disabled={disabled}
        placeholder={'---'}
        options={items.choices}
        styles={comboBoxStyles}
        errorMessage={errorMessage}
        onChange={onChangeComboBox}
      />
    </>
  );
});
DynamicComboBox.displayName = 'DynamicComboBox';