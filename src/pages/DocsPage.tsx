import React, { Suspense, useState } from 'react'

import { copyToClipboard } from '../utils/tool';
import { IcBaselinePrint, MaterialSymbolsContentCopyOutlineRounded } from "../utils/Icons";
import useStyleConfigInit from "../utils/useStyleConfigInit";

import DOC from './Doc.md?raw'

import defaultStyleConfigJson from "../components/default.json";
const defaultStyleConfig = defaultStyleConfigJson;

const PreviewArea = React.lazy(() => import('../components/PreviewArea') as Promise<{ default: React.ComponentType<PreviewAreaProps> }>)

interface PreviewAreaProps {
    width: number
    expandLevel: number
    displayId: number
    initMdValue?: string
    only?: boolean
}


const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin full h-8 w-8 border-b-2 border-t-2 border-gray-900"></div>
    </div>
)

function DocsPage({ maxW }: { maxW: number }) {
    const [copied, setCopied] = useState<boolean>(false);
    useStyleConfigInit(defaultStyleConfig);
    return (<Suspense fallback={<LoadingSpinner />}>
  

        <div className=' doc-tool fixed top-16 right-4 sm:right-8 w-10 z-30 bg-slate-200 p-2 pb-1 rounded-md'>
            <button onClick={() => window.print()} className="pb-2 rounded-md w-9 h-9 "><IcBaselinePrint className="text-2xl"></IcBaselinePrint></button>
            <button onClick={() => {
                setCopied(true)
                copyToClipboard(DOC)
                setTimeout(() => {
                    setCopied(false)
                }, 500);
            }} className="pb-2 rounded-md w-9 h-9"><MaterialSymbolsContentCopyOutlineRounded className={`text-2xl ${copied ? " text-green-700" : " text-black"} `}></MaterialSymbolsContentCopyOutlineRounded></button>
        </div>
        {copied && <span className=" fixed top-[9.5rem] right-4  text-black rounded-md h-6 !-ml-2 px-2 block z-30">copied!</span>}

        <PreviewArea
            width={Math.min(1024, maxW - 10)}
            expandLevel={2}
            displayId={2}
            only={true}
            initMdValue={DOC}
        />
    </Suspense>)
}

export default DocsPage;