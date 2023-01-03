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
  onChange: (newValue: string | number | null, newText: string | null) => void;
  getKeyValue: (entity: ComponentFramework.WebApi.Entity, key: string) => string;
  getTextValue: (entity: ComponentFramework.WebApi.Entity, text: string) => string;
}
const comboBoxStyles: Partial<IComboBoxStyles> = { root: { maxWidth: 300 } };

export const DynamicComboBox = memo((props: DynamicComboBoxProps) => {
  const { label, value, options, optionKeyField, optionTextField, disabled, masked, errorMessage, onChange, getKeyValue: keyValueExtractor, getTextValue: textValueExtractor } = props;
  const valueKey = value != null ? value.toString() : undefined;
  let isValueKeyFound = false;

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
          let key = undefined;
          if (valueKey && !isValueKeyFound) { 
            key = keyValueExtractor(item, optionKeyField);
            isValueKeyFound = key == valueKey;
          }
          return {
            key: key ?? keyValueExtractor(item, optionKeyField),
            text: textValueExtractor(item, optionTextField)
          } as IComboBoxOption;
        })
    };
  }, [options]);

  const onChangeComboBox = useCallback(
    (ev?: unknown, option?: IComboBoxOption): void => {
      if (option) {
        onChange(option.key, option.text)
      }
    },
    [onChange]
  );

  if (valueKey && !isValueKeyFound) { onChange(null, null); }

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