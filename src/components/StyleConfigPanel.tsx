import React, { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { JamChevronCircleDown, JamChevronCircleRight } from "../utils/Icons";
import type{ StyleConfig } from '../styleTypes';


import defaultStyleConfigJson from "./default.json"
import createConfirmDialog from './ConfirmDialog';

const defaultStyleConfig = defaultStyleConfigJson as StyleConfig

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

// 工具函數：安全地獲取嵌套值
const getNestedValue = (obj: any, path: string[]): any => {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

// NumberInput 組件
const NumberInput: React.FC<NumberInputProps> = ({
    path,
    label,
    min = 0,
    max = 100,
    step = 1,
    config,
    updateConfig
}) => {
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
        const newValue = e.target.value;
        setLocalValue(newValue);

        const numberValue = Number(newValue);
        if (!isNaN(numberValue)) {
            debouncedUpdate(numberValue);
        }
    };


    useEffect(() => {
        updateConfig(path, Number(localValue))
    }, [])

    const handleBlur = () => {
        let numberValue = Number(localValue);

        if (isNaN(numberValue)) {
            numberValue = initialValue;
        } else {
            numberValue = Math.min(Math.max(numberValue, min), max);
        }

        setLocalValue(numberValue.toString());
        updateConfig(path, numberValue);
    };

    return (
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm">{label}</label>
            <input
                type="number"
                value={localValue}
                min={min}
                max={max}
                step={step}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-20 p-1 border rounded bg-gray-50 h-9"
            />
        </div>
    );
};

// ColorInput 組件
const ColorInput: React.FC<ColorInputProps> = ({
    path,
    label,
    config,
    updateConfig
}) => {
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
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm">{label}</label>
            <input
                type="color"
                value={localValue}
                onChange={handleChange}
                className=" w-24 p-1 \border rounded bg-gray-50 h-9"
            />
        </div>
    );
};

// StringInput 組件
const StringInput: React.FC<StringInputProps> = ({
    path,
    label,
    config,
    updateConfig
}) => {
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
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm">{label}</label>
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                className="w-24 p-1 border rounded bg-gray-50 h-9"
            />
        </div>
    );
};

// SelectInput 組件
const SelectInput: React.FC<SelectInputProps> = ({
    path,
    label,
    config,
    options,
    updateConfig
}) => {
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
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm">{label}</label>
            <select className=" w-24 p-1 \border rounded bg-gray-50 h-9" value={localValue} onChange={handleChange}>
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
function HSelectInput({ value, update }: { value: string, update: Function }) {
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
const BooleanInput: React.FC<BooleanInputProps> = ({
    path,
    label,
    config,
    tValue = "",
    fValue = "",
    updateConfig
}) => {
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
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm">{label}</label>
            <div className=' w-24 px-2 pt-[5px] border rounded bg-gray-50 h-9' onClick={handleChange}>
                <div className={` w-6 h-6 border rounded m-auto ${localValue ? "bg-blue-300" : "bg-gray-200"}`}>
                </div>
            </div>
        </div>
    );
};


// SelectInput 組件
function StyleSelector({ handleReset }: { handleReset: (newStyleConfig: StyleConfig) => void }) {
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
const Section: React.FC<SectionProps> = ({
    title,
    children,
    section,
    isExpanded,
    onToggle
}) => (
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

// 主組件
const StyleConfigPanel: React.FC = () => {
    const [config, setConfig] = useState(defaultStyleConfig);
    const [headingToConfigure, setHeadingToConfigure] = useState<string>('H1');

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const updateConfig = useCallback((path: string[], value: any) => {
        const newConfig = { ...config };
        let current: any = newConfig;

        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]] || {};
        }
        current[path[path.length - 1]] = value;
        // console.log(path, value)

        if (path[path.length - 1] == "title") {
            document.title = value;
        }


        if (typeof value === "number") {
            if (path.includes("layout")) {
                document.documentElement.style.setProperty("--" + path.join('-'), value.toString() + "mm");
            } else {
                document.documentElement.style.setProperty("--" + path.join('-'), value.toString() + "px");
            }
        } else {
            document.documentElement.style.setProperty("--" + path.join('-'), value + "");
        }

        setConfig(newConfig);
    }, [config, setConfig]);

    const initializeConfigStyles = useCallback((config: Record<string, any>, basePath: string[] = []) => {
        const traverseConfig = (currentConfig: Record<string, any>, currentPath: string[]) => {
            Object.entries(currentConfig).forEach(([key, value]) => {
                const newPath = [...currentPath, key];


                if (typeof value === "object" && value !== null) {
                    traverseConfig(value, newPath); // 递归处理嵌套结构
                } else {
                    const cssVarName = `--${newPath.join('-')}`;

                    if (newPath[newPath.length - 1] == "title") {
                        document.title = value;
                    }

                    if (typeof value === "number") {
                        if (newPath.includes("layout")) {
                            document.documentElement.style.setProperty(cssVarName, value.toString() + "mm");
                        } else {
                            document.documentElement.style.setProperty(cssVarName, value.toString() + "px");
                        }
                    } else {
                        document.documentElement.style.setProperty(cssVarName, value + "");
                    }
                }
            });
        };

        traverseConfig(config, basePath);
    }, []);


    useEffect(() => {
        const initialconfig = localStorage.getItem('config');
        if (initialconfig) {
            const parsedconfig = JSON.parse(initialconfig);
            setConfig({ ...parsedconfig, init: false })
            console.log(parsedconfig)
            initializeConfigStyles(parsedconfig);
        } else {
            localStorage.setItem('config', JSON.stringify(defaultStyleConfig))
        }
    }, [])

    useEffect(() => {
        if (config.init) {
            return
        }
        localStorage.setItem('config', JSON.stringify(config))
    }, [config])


    const handleExportConfig = () => {
        const dataStr = JSON.stringify(config, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'style-config.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedConfig = JSON.parse(e.target?.result as string);
                    setConfig({ ...importedConfig, init: false });
                    initializeConfigStyles(importedConfig);
                    localStorage.setItem('config', JSON.stringify(importedConfig));
                } catch (error) {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleReset = (newStyleConfig: StyleConfig) => {
        setConfig({ ...newStyleConfig, init: false });
        initializeConfigStyles(newStyleConfig);
        localStorage.setItem('config', JSON.stringify(newStyleConfig));
    };

    return (
        <div className="w-full bg-blue-50 p-4 overflow-y-auto h-full">
            <Section
                title="Page Settings"
                section="page"
                isExpanded={expandedSections.page}
                onToggle={toggleSection}
            >
                <Section
                    title="Font"
                    section="pageFont"
                    isExpanded={expandedSections.pageFont}
                    onToggle={toggleSection}
                >
                    <NumberInput
                        path={['page', 'font', 'size']}
                        label="Size"
                        config={config}
                        updateConfig={updateConfig}
                    />
                    {/* <NumberInput
                        path={['page', 'font', 'weight']}
                        label="Weight"
                        step={100}
                        max={3000}
                        config={config}
                        updateConfig={updateConfig}
                    /> */}
                    <SelectInput
                        path={['page', "font", 'weight']}
                        label="Weight"
                        config={config}
                        updateConfig={updateConfig}
                        options={
                            [
                                { name: "lighter", value: "lighter" },
                                { name: "normal", value: "normal" },
                                { name: "bold", value: "bold" },
                                { name: "bolder", value: "bolder" },
                            ]
                        }
                    />
                    <NumberInput
                        path={['page', 'font', 'height']}
                        label="Height"
                        step={100}
                        max={900}
                        config={config}
                        updateConfig={updateConfig}
                    />
                    <ColorInput
                        path={['page', 'font', 'color']}
                        label="Color"
                        config={config}
                        updateConfig={updateConfig}
                    />
                    {/* <FontsInput
                        path={['page', 'font', 'family']}
                        label="family"
                        config={config}
                        updateConfig={updateConfig}
                    /> */}
                    <SelectInput
                        path={['page', "font", 'familyC']}
                        label="Family C"
                        config={config}
                        updateConfig={updateConfig}
                        options={
                            [
                                { name: "黑體", value: '"Microsoft JhengHei", sans-serif' },
                                { name: "細明體", value: '"PMingLiU", serif' },
                                // { name: "宋體", value: '"SimSun", serif' },
                                { name: "標楷體", value: '"rrrrr", cursive' },
                                { name: "Noto Serif Traditional Chinese", value: ' "Noto Serif TC" , serif' },
                                { name: "Noto Sans Hong Kong", value: ' "Noto Sans HK", serif' },
                                { name: "LXGW WenKai TC", value: ' "LXGW WenKai TC", serif' },
                            ]
                        }
                    />
                    <SelectInput
                        path={['page', "font", 'familyE']}
                        label="Family E"
                        config={config}
                        updateConfig={updateConfig}
                        options={
                            [
                                { name: "auto", value: 'none' },
                                { name: "Roboto", value: '"Roboto", serif' },
                                { name: "Dancing Script", value: '"Dancing Script", serif' },
                                { name: "Arial", value: '"Arial", sans-serif' },
                                { name: "Times New Roman", value: '"Times New Roman", serif' },
                                { name: "Verdana", value: '"Verdana", sans-serif' },
                                { name: "Tahoma", value: '"Tahoma", sans-serif' },
                            ]
                        }
                    />
                    <ColorInput
                        path={['page', 'font', 'Dcolor']}
                        label="Decorative color"
                        config={config}
                        updateConfig={updateConfig}
                    />
                </Section>
                <Section
                    title="Layout"
                    section="layout"
                    isExpanded={expandedSections.layout}
                    onToggle={toggleSection}
                >
                    <ColorInput
                        path={['page', 'layout', 'bgColor']}
                        label="Background"
                        config={config}
                        updateConfig={updateConfig}
                    />
                    {/* <BooleanInput
                        path={['page', 'layout', 'pageNumber']}
                        label="PageNumber"
                        config={config}
                        updateConfig={updateConfig}
                    />
                    <StringInput
                        path={['page', 'layout', 'author']}
                        label="Author"
                        config={config}
                        updateConfig={updateConfig}
                    /> */}
                    <StringInput
                        path={['page', 'layout', 'title']}
                        label="Title"
                        config={config}
                        updateConfig={updateConfig}
                    />
                    <NumberInput
                        path={['page', 'layout', 'tPadding']}
                        label="Header margin"
                        step={1}
                        max={900}
                        config={config}
                        updateConfig={updateConfig}
                    />
                    <NumberInput
                        path={['page', 'layout', 'tBoundary']}
                        label="Top boundary"
                        step={1}
                        max={900}
                        config={config}
                        updateConfig={updateConfig}
                    />
                    <NumberInput
                        path={['page', 'layout', 'bBoundary']}
                        label="Bottom boundary"
                        step={1}
                        max={900}
                        config={config}
                        updateConfig={updateConfig}
                    />
                    <NumberInput
                        path={['page', 'layout', 'lBoundary']}
                        label="Left boundary"
                        step={1}
                        max={900}
                        config={config}
                        updateConfig={updateConfig}
                    />
                    <NumberInput
                        path={['page', 'layout', 'rBoundary']}
                        label="Right boundary"
                        step={1}
                        max={900}
                        config={config}
                        updateConfig={updateConfig}
                    />

                </Section>
            </Section>

            {/* Title Settings Section */}
            <Section
                title="Title Settings"
                section="title"
                isExpanded={expandedSections.title}
                onToggle={toggleSection}
            >
                <HSelectInput value={headingToConfigure} update={setHeadingToConfigure} />
                <h2 className=' my-3 text-xl'>currently configured title：{headingToConfigure}</h2>

                <NumberInput
                    path={['title', headingToConfigure, 'size']}
                    label="Size"
                    config={config}
                    updateConfig={updateConfig}
                />
                <SelectInput
                    path={['title', headingToConfigure, 'weight']}
                    label="Weight"
                    config={config}
                    updateConfig={updateConfig}
                    options={
                        [
                            { name: "lighter", value: "lighter" },
                            { name: "normal", value: "normal" },
                            { name: "bold", value: "bold" },
                            { name: "bolder", value: "bolder" },
                        ]
                    }
                />
                <NumberInput
                    path={['title', headingToConfigure, 'tMargin']}
                    label="Top Margin"
                    step={1}
                    max={900}
                    min={-900}
                    config={config}
                    updateConfig={updateConfig}
                />
                <NumberInput
                    path={['title', headingToConfigure, 'bMargin']}
                    label="Bottom Margin"
                    step={1}
                    max={900}
                    min={-900}
                    config={config}
                    updateConfig={updateConfig}
                />
                <NumberInput
                    path={['title', headingToConfigure, 'scaling']}
                    label="Scaling"
                    step={1}
                    max={900}
                    config={config}
                    updateConfig={updateConfig}
                />
                <ColorInput
                    path={['title', headingToConfigure, 'color']}
                    label="Color"
                    config={config}
                    updateConfig={updateConfig}
                />
                <BooleanInput
                    path={['title', headingToConfigure, 'underline']}
                    label="Underline"
                    config={config}
                    updateConfig={updateConfig}
                    tValue="underline"
                    fValue="none"
                />
                <ColorInput
                    path={['title', headingToConfigure, 'udlColor']}
                    label="Underline Color"
                    config={config}
                    updateConfig={updateConfig}
                />
                <StringInput
                    path={['title', headingToConfigure, 'decorativeSymbol']}
                    label="Decorative Symbol"
                    config={config}
                    updateConfig={updateConfig}
                />
                <SelectInput
                    path={['title', headingToConfigure, 'alignment']}
                    label="Alignment"
                    config={config}
                    updateConfig={updateConfig}
                    options={
                        [
                            { name: "left", value: "left" },
                            { name: "center", value: "center" },
                            { name: "right", value: "right" },
                        ]
                    }
                />
            </Section>

            {/* List Settings Section */}
            <Section
                title="List Settings"
                section="list"
                isExpanded={expandedSections.list}
                onToggle={toggleSection}
            >
                <Section
                    title="Ordered List"
                    section="orderedLists"
                    isExpanded={expandedSections.orderedLists}
                    onToggle={toggleSection}
                >
                    {[1, 2, 3, 4, 5].map(n => (
                        <div key={n}>
                            < NumberInput
                                path={['list', 'orderedLists', 'scaling' + n]}
                                label={`Scaling ${n}`}
                                step={1}
                                max={900}
                                config={config}
                                updateConfig={updateConfig}
                            />
                            <SelectInput

                                path={['list', 'orderedLists', 'decorativeSymbol' + n]}
                                label={`Bullet Style ${n}`}
                                config={config}
                                updateConfig={updateConfig}
                                options={
                                    [
                                        { name: "decimal (數字)", value: "decimal" },
                                        { name: "decimal-leading-zero (前置零數字)", value: "decimal-leading-zero" },
                                        { name: "lower-roman (小寫羅馬數字)", value: "lower-roman" },
                                        { name: "upper-roman (大寫羅馬數字)", value: "upper-roman" },
                                        { name: "lower-greek (小寫希臘字母)", value: "lower-greek" },
                                        { name: "lower-alpha (小寫拉丁字母)", value: "lower-alpha" },
                                        { name: "upper-alpha (大寫拉丁字母)", value: "upper-alpha" },
                                        { name: "arabic-indic (阿拉伯數字)", value: "arabic-indic" },
                                        // { name: "armenian (亞美尼亞數字)", value: "armenian" },
                                        // { name: "bengali (孟加拉數字)", value: "bengali" },
                                        // { name: "cambodian/khmer (柬埔寨數字)", value: "cambodian" },
                                        { name: "cjk-decimal (漢字數字)", value: "cjk-decimal" },
                                        { name: "cjk-earthly-branch (地支)", value: "cjk-earthly-branch" },
                                        { name: "cjk-heavenly-stem (天干)", value: "cjk-heavenly-stem" },
                                        { name: "cjk-ideographic (傳統漢字)", value: "cjk-ideographic" },
                                        { name: "devanagari (天城文數字)", value: "devanagari" },
                                        // { name: "ethiopic-numeric (埃塞俄比亞數字)", value: "ethiopic-numeric" },
                                        // { name: "georgian (格魯吉亞數字)", value: "georgian" },
                                        // { name: "gujarati (古吉拉特數字)", value: "gujarati" },
                                        // { name: "gurmukhi (古魯穆奇數字)", value: "gurmukhi" },
                                        // { name: "hebrew (希伯來數字)", value: "hebrew" },
                                        { name: "hiragana (平假名字母)", value: "hiragana" },
                                        // { name: "hiragana-iroha (平假名伊呂波)", value: "hiragana-iroha" },
                                        { name: "japanese-formal (日本正式數字)", value: "japanese-formal" },
                                        { name: "japanese-informal (日本非正式數字)", value: "japanese-informal" },
                                        // { name: "kannada (坎納達數字)", value: "kannada" },
                                        { name: "katakana (片假名字母)", value: "katakana" },
                                        // { name: "katakana-iroha (片假名伊呂波)", value: "katakana-iroha" },
                                        // { name: "korean-hangul-formal (韓文正式數字)", value: "korean-hangul-formal" },
                                        // { name: "korean-hanja-formal (韓文漢字正式數字)", value: "korean-hanja-formal" },
                                        // { name: "korean-hanja-informal (韓文漢字非正式數字)", value: "korean-hanja-informal" },
                                        { name: "lao (老撾數字)", value: "lao" },
                                        // { name: "lower-armenian (小寫亞美尼亞數字)", value: "lower-armenian" },
                                        // { name: "malayalam (馬拉雅拉姆數字)", value: "malayalam" },
                                        // { name: "mongolian (蒙古數字)", value: "mongolian" },
                                        // { name: "myanmar (緬甸數字)", value: "myanmar" },
                                        // { name: "oriya (奧里亞數字)", value: "oriya" },
                                        // { name: "persian (波斯數字)", value: "persian" },
                                        // { name: "tamil (泰米爾數字)", value: "tamil" },
                                        // { name: "telugu (泰盧固數字)", value: "telugu" },
                                        // { name: "thai (泰國數字)", value: "thai" },
                                        // { name: "tibetan (藏文數字)", value: "tibetan" },
                                        { name: "trad-chinese-formal (繁體中文正式數字)", value: "trad-chinese-formal" },
                                        { name: "trad-chinese-informal (繁體中文非正式數字)", value: "trad-chinese-informal" },
                                        // { name: "upper-armenian (大寫亞美尼亞數字)", value: "upper-armenian" }
                                    ]
                                }
                            />
                        </div>
                    ))
                    }
                </Section>
                <Section
                    title="Unordered List"
                    section="unorderedList"
                    isExpanded={expandedSections.unorderedList}
                    onToggle={toggleSection}
                >
                    {[1, 2, 3, 4, 5].map(n => (
                        <div key={n}>
                            <NumberInput
                                path={['list', 'unorderedList', 'scaling' + n]}
                                label={`Scaling ${n}`}
                                step={1}
                                max={900}
                                config={config}
                                updateConfig={updateConfig}
                            />
                            <SelectInput
                                path={['list', 'unorderedList', 'decorativeSymbol' + n]}
                                label={`Bullet Style ${n}`}
                                config={config}
                                updateConfig={updateConfig}
                                options={
                                    [
                                        { name: "none", value: "none" },
                                        { name: "disc", value: "disc" },
                                        { name: "circle", value: "circle" },
                                        { name: "square", value: "square" },
                                        { name: "disclosure-open", value: "disclosure-open" },
                                        { name: "disclosure-closed", value: "disclosure-closed" }
                                    ]
                                }
                            />
                        </div>
                    ))
                    }
                </Section>
                <NumberInput
                    path={['list', 'task', 'scaling']}
                    label=" Task List Scaling"
                    step={1}
                    max={900}
                    config={config}
                    updateConfig={updateConfig}
                />
            </Section>

            {/* Image Settings Section */}
            <Section
                title="Image Settings"
                section="image"
                isExpanded={expandedSections.image}
                onToggle={toggleSection}
            >
                <NumberInput
                    path={['image', 'radius']}
                    label="Border Radius"
                    config={config}
                    updateConfig={updateConfig}
                />

                <SelectInput
                    path={['image', 'alignment']}
                    label="Alignment"
                    config={config}
                    updateConfig={updateConfig}
                    options={
                        [
                            { name: "left", value: "left" },
                            { name: "center", value: "center" },
                            { name: "right", value: "right" },
                        ]
                    }
                />
                <NumberInput
                    path={['image', 'tMargin']}
                    label="Top Margin"
                    step={1}
                    max={900}
                    min={-900}
                    config={config}
                    updateConfig={updateConfig}
                />
                <NumberInput
                    path={['image', 'bMargin']}
                    label="Bottom Margin"
                    step={1}
                    max={900}
                    min={-900}
                    config={config}
                    updateConfig={updateConfig}
                />
                <NumberInput
                    path={['image', 'height']}
                    label="Max Height"
                    step={1}
                    max={900}
                    config={config}
                    updateConfig={updateConfig}
                />

                {/* <Section
                    title="Annotation"
                    section="annotation"
                    isExpanded={expandedSections.annotation}
                    onToggle={toggleSection}
                >
                    <NumberInput
                        path={['image', 'annotation', 'size']}
                        label="Annotation Size"
                        config={config}
                        updateConfig={updateConfig}
                    />
                    <NumberInput
                        path={['image', 'annotation', 'size']}
                        label="Size"
                        config={config}
                        updateConfig={updateConfig}
                    />
                    <NumberInput
                        path={['image', 'annotation', 'weight']}
                        label="Weight"
                        step={100}
                        max={3000}
                        config={config}
                        updateConfig={updateConfig}
                    />
                    <ColorInput
                        path={['image', 'annotation', 'color']}
                        label="Color"
                        config={config}
                        updateConfig={updateConfig}
                    />
                    <StringInput
                        path={['image', 'annotation', 'decorativeSymbol']}
                        label="Decorative Symbol"
                        config={config}
                        updateConfig={updateConfig}
                    />

                </Section> */}
            </Section>

            {/* Blockquotes Settings Section */}
            <Section
                title="Blockquotes Settings"
                section="blockquotes"
                isExpanded={expandedSections.blockquotes}
                onToggle={toggleSection}
            >
                <NumberInput
                    path={['blockquotes', 'scaling']}
                    label="Scaling"
                    step={1}
                    max={900}
                    config={config}
                    updateConfig={updateConfig}
                />

                <NumberInput
                    path={['blockquotes', 'titleMargin']}
                    label="Title Scaling"
                    step={1}
                    max={900}
                    config={config}
                    updateConfig={updateConfig}
                />

                <NumberInput
                    path={['blockquotes', 'textScaling']}
                    label="Text Scaling"
                    step={1}
                    max={900}
                    config={config}
                    updateConfig={updateConfig}
                />

                <NumberInput
                    path={['blockquotes', 'contentMargin']}
                    label="Content Margin"
                    step={1}
                    max={900}
                    config={config}
                    updateConfig={updateConfig}
                />

                <NumberInput
                    path={['blockquotes', 'tMargin']}
                    label="Top Margin"
                    step={1}
                    max={900}
                    config={config}
                    updateConfig={updateConfig}
                />
                <NumberInput
                    path={['blockquotes', 'bMargin']}
                    label="Bottom Margin"
                    step={1}
                    max={900}
                    config={config}
                    updateConfig={updateConfig}
                />

                <ColorInput
                    path={['blockquotes', 'color']}
                    label="Color"
                    config={config}
                    updateConfig={updateConfig}
                />
                <ColorInput
                    path={['blockquotes', 'bgColor']}
                    label="Background Color"
                    config={config}
                    updateConfig={updateConfig}
                />
                {/* <NumberInput
                    path={['blockquotes', 'size']}
                    label="Size"
                    config={config}
                    updateConfig={updateConfig}
                />
                <NumberInput
                    path={['blockquotes', 'weight']}
                    label="Weight"
                    step={100}
                    max={3000}
                    config={config}
                    updateConfig={updateConfig}
                /> */}
            </Section>

            <Section
                title="Code Settings"
                section="code"
                isExpanded={expandedSections.code}
                onToggle={toggleSection}
            >
                <ColorInput
                    path={['code', 'inlineColor']}
                    label="Inline Code Background Color"
                    config={config}
                    updateConfig={updateConfig}
                />
                <ColorInput
                    path={['code', 'bgColor']}
                    label="Background Color"
                    config={config}
                    updateConfig={updateConfig}
                />

                <NumberInput
                    path={['code', 'tMargin']}
                    label="Top Margin"
                    step={1}
                    max={900}
                    min={-900}
                    config={config}
                    updateConfig={updateConfig}
                />
                <NumberInput
                    path={['code', 'bMargin']}
                    label="Bottom Margin"
                    step={1}
                    max={900}
                    min={-900}
                    config={config}
                    updateConfig={updateConfig}
                />

                <SelectInput
                    path={['code', 'theme']}
                    label="Theme"
                    config={config}
                    updateConfig={updateConfig}
                    options={
                        [
                            { name: "vs-dark", value: "dark" },
                            { name: "vs-bright", value: "bright" },
                            { name: "github", value: "github" },
                            { name: "dracula", value: "dracula" },
                            { name: "nord", value: "nord" },
                            { name: "monokai", value: "monokai" },
                        ]
                    }
                />
            </Section>
            <Section
                title="Table Settings"
                section="table"
                isExpanded={expandedSections.table}
                onToggle={toggleSection}
            >
                <ColorInput
                    path={['table', 'titleColor']}
                    label="Title Color"
                    config={config}
                    updateConfig={updateConfig}
                />

                <ColorInput
                    path={['table', 'color1']}
                    label="Color1"
                    config={config}
                    updateConfig={updateConfig}
                />

                <ColorInput
                    path={['table', 'color2']}
                    label="Color2"
                    config={config}
                    updateConfig={updateConfig}
                />

                <ColorInput
                    path={['table', 'lineColor']}
                    label="Line Color"
                    config={config}
                    updateConfig={updateConfig}
                />

                <SelectInput
                    path={['table', 'textAlignment']}
                    label="Text Alignment"
                    config={config}
                    updateConfig={updateConfig}
                    options={
                        [
                            { name: "left", value: "left" },
                            { name: "center", value: "center" },
                            { name: "right", value: "right" },
                        ]
                    }
                />
                <NumberInput
                    path={['table', 'tMargin']}
                    label="Top Margin"
                    step={1}
                    max={900}
                    min={-900}
                    config={config}
                    updateConfig={updateConfig}
                />
                <NumberInput
                    path={['table', 'bMargin']}
                    label="Bottom Margin"
                    step={1}
                    max={900}
                    min={-900}
                    config={config}
                    updateConfig={updateConfig}
                />

            </Section>
            <Section
                title="Import and Export"
                section="importExport"
                isExpanded={expandedSections.importExport}
                onToggle={toggleSection}
            >
                <div className="mt-4 space-y-4">
                    <button
                        onClick={handleExportConfig}
                        className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 w-full"
                    >
                        Export Config
                    </button>
                    <label className=" block px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500 cursor-pointer w-full text-center">
                        Import Config
                        <input
                            type="file"
                            accept=".json"
                            onChange={() => {
                                createConfirmDialog("Import Config？", "This will override all current styles.", handleImportConfig, () => { }, "Import")
                            }}
                            className="hidden"
                        />
                    </label>
                    <StyleSelector handleReset={handleReset}></StyleSelector>

                </div>
            </Section>
            <div className=' h-24'></div>
        </div >
    );
};

export default StyleConfigPanel;