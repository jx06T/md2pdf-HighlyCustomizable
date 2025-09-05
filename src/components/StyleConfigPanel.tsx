import { useState, useCallback, useEffect, useRef } from 'react';
import { NumberInput, ColorInput, StringInput, SelectInput, HSelectInput, BooleanInput, StyleSelector, Section } from './AllInput';

import type { StyleConfig } from '../styleTypes';

import defaultStyleConfigJson from "./default.json"
import createConfirmDialog from '../utils/ConfirmDialog';
import { useMdContext } from '../context/MdContext';

const defaultStyleConfig = defaultStyleConfigJson as StyleConfig

const TextScaler = ({ scale }: { scale: Function }) => {
    const [multiple, setMultiple] = useState<number>(1);
    return (
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm ">Scale text</label>
            <div className=' flex'>
                <input
                    type="number"
                    value={multiple}
                    min={0.1}
                    max={10}
                    step={0.01}
                    onChange={(e) => setMultiple(parseFloat(e.target.value))}
                    className="w-16 p-1 mr-2 rounded bg-gray-50 h-9"
                />
                <button
                    onClick={() => createConfirmDialog("Scale Text?", `Scale Text ${multiple} times?`, () => scale(multiple), () => { }, "Scale", "Cancel")}
                    className="px-4 h-9 pb-1 bg-red-400 text-white rounded hover:bg-red-500 w-full"
                >
                    Apply
                </button>
            </div>
        </div >
    )
}

const StyleConfigPanel = () => {
    const [config, setConfig] = useState<StyleConfig>(() => {
        const savedConfig = localStorage.getItem('config');
        if (savedConfig) {
            try {
                return JSON.parse(savedConfig) as StyleConfig;
            } catch (e) {
                console.error("Failed to parse config from localStorage", e);
                return defaultStyleConfig;
            }
        }
        return defaultStyleConfig;
    });

    const isInitialMount = useRef(true);
    let { setMdHNConfig, mdHNConfig } = useMdContext();
    const [headingToConfigure, setHeadingToConfigure] = useState<string>('H1');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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

        if (path[path.length - 1] === "title") {
            document.title = value+" | md2pdf-jx";
        }

        if (path[0] === "headerNumber") {
            setMdHNConfig({ ...mdHNConfig, [path[1]]: value })
        }

        if (path[0] === "code" && path[1] === "theme") {
            setMdHNConfig({ ...mdHNConfig, codeTheme: value })
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
    }, [config, mdHNConfig, setMdHNConfig]);

    const textSizePaths = [
        ['page', 'font', 'size'],
        ['title', 'H1', 'size'],
        ['title', 'H2', 'size'],
        ['title', 'H3', 'size'],
        ['title', 'H4', 'size'],
        ['title', 'H5', 'size'],
        ['title', 'H6', 'size'],
        ['blockquotes', 'scaling'],
        ['blockquotes', 'titleMargin'],
        ['blockquotes', 'textScaling'],
        ...[1, 2, 3, 4, 5].map(n => ['list', 'orderedLists', `scaling${n}`]),
        ...[1, 2, 3, 4, 5].map(n => ['list', 'unorderedList', `scaling${n}`]),
        ['list', 'task', 'scaling'],
    ];

    const scale = useCallback((multiple: number) => {
        textSizePaths.forEach(path => {
            let current: any = config;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]] || {};
            }
            const key = path[path.length - 1];
            const value = current[key];
            if (typeof value === 'number') {
                const newValue = Math.round(value * multiple * 100) / 100;
                updateConfig(path, newValue);
            }
        });
    }, [config, updateConfig]);

    const initializeConfigStyles = useCallback((configToApply: StyleConfig) => {
        const traverseConfig = (currentConfig: Record<string, any>, currentPath: string[]) => {
            Object.entries(currentConfig).forEach(([key, value]) => {
                const newPath = [...currentPath, key];
                if (typeof value === "object" && value !== null) {
                    traverseConfig(value, newPath);
                } else {
                    const cssVarName = `--${newPath.join('-')}`;
                    if (newPath[newPath.length - 1] === "title") {
                        document.title = value+" | md2pdf-jx";
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
        traverseConfig(configToApply, []);
    }, []);

    useEffect(() => {
        initializeConfigStyles(config);
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            localStorage.setItem('config', JSON.stringify(config));
        }
    }, [config]);

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
        if (!event || !event.target) {
            return;
        }
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedConfig = JSON.parse(e.target?.result as string);
                    setConfig(importedConfig);
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
        setConfig(newStyleConfig);
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
                        min={1}
                        config={config}
                        updateConfig={updateConfig}
                    />
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
                    <TextScaler scale={scale} />

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
                title="Header Number Settings"
                section="headerNumber"
                isExpanded={expandedSections.headerNumber}
                onToggle={toggleSection}
            >
                <NumberInput
                    path={['headerNumber', 'minDepth']}
                    label="Min Depth"
                    config={config}
                    updateConfig={updateConfig}
                    min={1}
                    max={6}
                />
                <NumberInput
                    path={['headerNumber', 'maxDepth']}
                    label="Max Depth"
                    config={config}
                    updateConfig={updateConfig}
                    min={1}
                    max={6}
                />
                <SelectInput
                    path={['headerNumber', 'style']}
                    label="Style"
                    config={config}
                    updateConfig={updateConfig}
                    options={
                        [
                            { name: "none", value: "none" },
                            { name: "dot", value: "dot" },
                            { name: "dash", value: "dash" },
                            { name: "flat", value: "flat" },
                            { name: "zh", value: "zh" },
                            { name: "zh_big", value: "zh_big" },
                        ]
                    }
                />
                <StringInput
                    path={['headerNumber', 'separator']}
                    label='Separator'
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
                            onChange={(e) => {
                                createConfirmDialog("Import Config？", "This will override all current styles.", () => handleImportConfig(e), () => { }, "Import")
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