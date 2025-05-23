import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { HeaderNumberConfig } from '../styleTypes';
import DOC from '../pages/Doc.md?raw'

interface MdContextType {
    mdValue: string,
    setMdValue: Function,
    mdHNConfig: HeaderNumberConfig,
    setMdHNConfig: Function,
}

const MdContext = createContext<MdContextType | undefined>(undefined);
export const MdProvider = ({ children }: { children: ReactNode; }) => {
    const [mdValue, setMdValue] = useState("")

    useEffect(() => {
        const initialMdValue = localStorage.getItem('mdValue');
        const notNew = localStorage.getItem("notNew")
        if (!notNew) {
            setMdValue(DOC);
            localStorage.setItem("notNew", "true")
        }

        if (initialMdValue) {
            setMdValue(initialMdValue)
        } else {
            localStorage.setItem('mdValue', "")
        }
    }, [])

    useEffect(() => {
        if (mdValue == "") {
            return
        }
        localStorage.setItem('mdValue', mdValue)
    }, [mdValue])

    const [mdHNConfig, setMdHNConfig] = useState<HeaderNumberConfig>({ "minDepth": 2, "maxDepth": 4, "style": "dot", "separator": " " })

    useEffect(() => {
        const initialMdHNConfig = localStorage.getItem('mdHNConfig');
        if (initialMdHNConfig) {
            const parsedconfig = JSON.parse(initialMdHNConfig)
            if (parsedconfig) {
                setMdHNConfig(parsedconfig)
            } else {
                localStorage.setItem('mdHNConfig', '{"minDepth": 2,"maxDepth": 4,"style": "dot","separator": " "}')
            }
        } else {
            localStorage.setItem('mdHNConfig', '{"minDepth": 2,"maxDepth": 4,"style": "dot","separator": " "}')
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('mdHNConfig', JSON.stringify(mdHNConfig))
    }, [mdHNConfig])

    return (
        <MdContext.Provider value={{ mdValue, setMdValue, mdHNConfig, setMdHNConfig }}>
            {children}
        </MdContext.Provider>
    );
};

export const useMdContext = (): MdContextType => {
    const context = useContext(MdContext);
    if (context === undefined) {
        throw new Error('MdContext must be used within a StateProvider');
    }
    return context;
};