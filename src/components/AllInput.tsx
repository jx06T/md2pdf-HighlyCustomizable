import { useState, useCallback, useEffect } from 'react';

import debounce from 'lodash/debounce';
import { JamChevronCircleDown, JamChevronCircleRight } from "../utils/Icons";
import type { StyleConfig } from '../styleTypes';

import createConfirmDialog from '../utils/ConfirmDialog';

// Props 類型定義
interface NumberInputProps {
    path: string[];
    label: string;
    min?: number;
    max?: number;
    step?: number;
    config: StyleConfig;
    updateConfig: (path: string[], value: number) => void;
}

interface ColorInputProps {
    path: string[];
    label: string;
    config: StyleConfig;
    updateConfig: (path: string[], value: string) => void;
}

interface StringInputProps {
    path: string[];
    label: string;
    config: StyleConfig;
    updateConfig: (path: string[], value: string) => void;
}

interface SelectInputProps {
    path: string[];
    label: string;
    config: StyleConfig;
    updateConfig: (path: string[], value: string) => void;
    options: { name: string, value: string }[]
}

interface BooleanInputProps {
    path: string[];
    label: string;
    tValue?: string;
    fValue?: string;
    config: StyleConfig;
    updateConfig: (path: string[], value: string) => void;
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
    section: string;
    // section: keyof typeof defaultStyleConfig;
    isExpanded: boolean;
    onToggle: (section: string) => void;
}


// 安全獲取嵌套值
const getNestedValue = (obj: any, path: string[]): any => {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

// NumberInput 組件
export const NumberInput = ({
    path,
    label,
    min = -100,
    max = 100,
    step = 1,
    config,
    updateConfig }:
    NumberInputProps) => {

    const initialValue = getNestedValue(config, path) ?? 0;
    const [localValue, setLocalValue] = useState<string>(initialValue.toString());

    useEffect(() => {
        const initialValue = getNestedValue(config, path) ?? 0;
        setLocalValue(initialValue)
    }, [config, path])

    const debouncedUpdate = useCallback(
        debounce((value: number) => {
            updateConfig(path, value);
        }, 300),
        [path, updateConfig]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        setLocalValue(newValue);

        const parsed = parseFloat(newValue);
        if (!isNaN(parsed)) {
            debouncedUpdate(parsed);
        }
    };


    useEffect(() => {
        updateConfig(path, parseFloat(localValue))
    }, [])

    const handleBlur = () => {
        let numberValue = parseFloat(localValue);

        if (isNaN(numberValue)) {
            numberValue = initialValue;
        } else {
            numberValue = Math.min(Math.max(numberValue, min), max);
        }

        setLocalValue(numberValue.toString());
        updateConfig(path, numberValue);
    };

    return (
        <div  id={path.join('-')}  className="flex items-center justify-between mb-2">
            <label className="text-sm">{label}</label>
            <input
                type="number"
                value={localValue}
                min={min}
                max={max}
                step={step}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-24 p-1 \border rounded bg-gray-50 h-9"
            />
        </div>
    );
};

// ColorInput 組件
export const ColorInput = ({
    path,
    label,
    config,
    updateConfig
}: ColorInputProps) => {
    const value = getNestedValue(config, path) ?? '#000000';
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        const initialValue = getNestedValue(config, path) ?? '#000000';
        setLocalValue(initialValue)
    }, [config, path])

    const debouncedUpdate = useCallback(
        debounce((value: string) => {
            updateConfig(path, value);
        }, 300),
        [path, updateConfig]
    );


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        debouncedUpdate(newValue)
    };

    useEffect(() => {
        updateConfig(path, localValue)
    }, [])

    return (
        <div  id={path.join('-')}  className="flex items-center justify-between mb-2">
            <label className="text-sm">{label}</label>
            <input
                type="color"
                value={localValue}
                onChange={handleChange}
                className=" w-24 px-1 py-2 rounded bg-gray-50 h-9"
            />
        </div>
    );
};

// StringInput 組件
export const StringInput = ({
    path,
    label,
    config,
    updateConfig
}: StringInputProps) => {
    const value = getNestedValue(config, path) ?? '';
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        const initialValue = getNestedValue(config, path) ?? '';
        setLocalValue(initialValue)
    }, [config, path])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        updateConfig(path, newValue);
    };


    useEffect(() => {
        updateConfig(path, localValue)
    }, [])

    return (
        <div  id={path.join('-')}  className="flex items-center justify-between mb-2">
            <label className="text-sm">{label}</label>
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                className="w-24 p-1 rounded bg-gray-50 h-9"
            />
        </div>
    );
};

// SelectInput 組件
export const SelectInput = ({
    path,
    label,
    config,
    options,
    updateConfig
}: SelectInputProps) => {
    const value = getNestedValue(config, path) ?? '';
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        const initialValue = getNestedValue(config, path) ?? '';
        setLocalValue(initialValue)
    }, [config, path])

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        updateConfig(path, newValue);
    };

    useEffect(() => {
        updateConfig(path, localValue)
    }, [])

    return (
        <div  id={path.join('-')}  className="flex items-center justify-between mb-2 ">
            <label className="text-sm">{label}</label>
            <select className=" w-24 p-1 pr-0 rounded bg-gray-50 h-9" value={localValue} onChange={handleChange}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

// SelectInput 組件
export const HSelectInput = ({ value, update }: { value: string, update: Function }) => {
    const options = [
        { name: "H1", value: "H1" },
        { name: "H2", value: "H2" },
        { name: "H3", value: "H3" },
        { name: "H4", value: "H4" },
        { name: "H5", value: "H5" },
        { name: "H6", value: "H6" },
    ]

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        update(newValue);
    };

    return (
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm">{"the heading to configure"}</label>
            <select className=" w-24 p-1 \border rounded bg-gray-50 h-9" value={value} onChange={handleChange}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

// BooleanInput 組件
export const BooleanInput = ({
    path,
    label,
    config,
    tValue = "",
    fValue = "",
    updateConfig
}: BooleanInputProps) => {
    const value = getNestedValue(config, path) ?? false;
    const [localValue, setLocalValue] = useState(value == tValue);

    useEffect(() => {
        const initialValue = getNestedValue(config, path) ?? false;
        setLocalValue(initialValue == tValue)
    }, [config, path])

    const handleChange = () => {
        updateConfig(path, ((!localValue) ? tValue : fValue));
        setLocalValue(!localValue);
    };

    useEffect(() => {
        updateConfig(path, (localValue) ? tValue : fValue)
    }, [])

    return (
        <div id={path.join('-')} className="flex items-center justify-between mb-2">
            <label className="text-sm">{label}</label>
            <div className=' w-24 px-2 pt-[5px]  rounded bg-gray-50 h-9' onClick={handleChange}>
                <div className={` w-6 h-6  rounded m-auto ${localValue ? "bg-gray-700" : "bg-gray-200"}`}>
                </div>
            </div>
        </div>
    );
};


// SelectInput 組件
export const StyleSelector = ({ handleReset }: { handleReset: (newStyleConfig: StyleConfig) => void }) => {
    const [selectedStyle, setSelectedStyle] = useState<string>("default")
    const options = [
        { name: "default", value: "default" },
        { name: "purple", value: "purple" },
        { name: "iPad 1", value: "ipad1" },
    ]

    const handleChange = async () => {
        try {
            const response = await fetch(`/presetStyles/${selectedStyle}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${selectedStyle}`);
            }
            const data = await response.json();
            console.log("Loaded JSON:", data);
            createConfirmDialog("Reset Config？", "This will override all current styles.", () => handleReset(data), () => { }, "Reset")
        } catch (error) {
            console.error("Error loading JSON:", error);
        }
    };

    return (
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm ">{"Reset To Preset Config"}</label>
            <div className=' flex space-x-4 items-center'>
                <select className=" w-24 p-1 \border rounded bg-gray-50 h-9" value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleChange}
                    className="w-full px-4 py-2  bg-red-400 text-white rounded hover:bg-red-500"
                >
                    Reset to "{selectedStyle}"
                </button>
            </div>
        </div>
    );
};

// Section 組件
export const Section = ({
    title,
    children,
    section,
    isExpanded,
    onToggle
}: SectionProps) => (
    <div className="\border rounded mb-2">
        <button
            className="w-full p-2 flex items-center justify-between bg-gray-50 rounded"
            onClick={() => onToggle(section)}
        >
            <span>{title}</span>
            {isExpanded ?
                <JamChevronCircleDown className="text-2xl" /> :
                <JamChevronCircleRight className="text-2xl" />
            }
        </button>
        {isExpanded && (
            <div className="p-2 px-3">
                {children}
            </div>
        )}
    </div>
);
