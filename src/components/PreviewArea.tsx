import { useEffect, useState } from "react";
import { useMdContext } from "../context/MdContext";

// import ReactMarkdown from "markdown-to-jsx";
import rehypeRaw from 'rehype-raw';
import rehypeKatexNotranslate from 'rehype-katex-notranslate';
import Markdown from 'react-markdown'

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeCallouts from 'rehype-callouts'
import { remarkHeadingNumbering } from '../utils/remarkHeadingNumbering';

// @ts-ignore
import 'rehype-callouts/theme/github'


import remarkGfm from 'remark-gfm'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { nord } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import remarkExternalLinks from 'remark-external-links';

import type { ImgHTMLAttributes } from 'react';


function getThemeStyle(th: string) {
    switch (th) {
        case "dark":
            return vscDarkPlus;
        case "bright":
            return vs;
        case "dracula":
            return dracula;
        case "nord":
            return nord;
        case "github":
            return github;
        case "monokai":
            return monokai;
        default:
            return vscDarkPlus;
    }
}

function processMarkdown(mdValue: string): string {
    // 找多行代碼塊
    const codeBlockPattern = /```[\s\S]*?```/g;
    const codeBlocks: string[] = [];

    // 記錄他們
    const textWithCodeBlocksMarked = mdValue.replace(codeBlockPattern, (match) => {
        const marker = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(match);
        return marker;
    });

    // 在代碼塊外面處理自訂語法

    let processedText = textWithCodeBlocksMarked
        // 註解語法
        .replace(/^<<\s*(.+)$/gm, (_, group1) =>
            `<ma>${group1
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\\/g, '&#92;')
                .replace(/\//g, '&#47;')}</ma>`
        )

        // 分頁語法
        .replace(/^([-]{3,})$/gm, (match) =>
            match.length === 3 ? '---' : '<bpf></bpf>'
        )

        // 強制換行
        .replace(/^ {2,}$/gm, '<br/>\n')

        // tab縮排，排除列表因為我不知道怎麼搞
        .replace(/^( {4})+(?![\*\-\d+\. ])/gm, match => '\n' + '&nbsp;'.repeat(match.length))

    // 回復多行代碼塊，順便幫懶得寫語言的人補上text當作語言
    codeBlocks.forEach((block, index) => {
        processedText = processedText.replace(`__CODE_BLOCK_${index}__`, block.replace(/^```(\w?)(?=\s|$)/, '```$1 text'));
    });

    return processedText;
}

function PreviewArea({ width, displayId, expandLevel, initMdValue = '', only = false }: { width: number, displayId: number, expandLevel: number, initMdValue?: string, only?: boolean }) {
    // 自訂解析 MD 的 HTML 標籤

    let { mdValue, mdHNConfig } = useMdContext()
    const [rootPath, setRootPath] = useState("")
    const absoluteRegex = /^(https?:\/\/)/;

    const components = {
        p: ({ children, ...props }: { children: React.ReactNode }) => {
            // 把僅包含換頁符號的 p 標籤弄掉 
            // @ts-ignore
            if (children && children.key && children.key.includes("bpf")) {
                return <span {...props} children={children} />;
            }

            return <p {...props} children={children} />;

        },
        img({ src, alt, className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
            //  自訂img標籤
            return (
                <span className={`md-img py-4 ${className || ''}`}>
                    <img
                        src={absoluteRegex.test(src || "") ? src : rootPath + src}
                        alt={alt || 'image'}
                        className="max-w-full object-contain"
                        {...props}
                    />
                </span>
            );
        },
        bpf: () => {
            // 換頁符號
            return (
                <div className="bkp bg-transparent h-8 flex">
                    <span className=" text-gray-300">{'>'}</span>
                    <div className=" inline-block h-[1.1px] bg-gray-300 flex-grow mt-4"></div>
                    <span className=" text-gray-300">{'<'}</span>
                </div>
            );
        },
        table: ({ children }: { children: React.ReactNode }) => {
            // 表格
            return (
                <div className="table-container">
                    <table >
                        {children}
                    </table>
                </div>
            );
        },
        ma: ({ children }: { children: React.ReactNode }) => {
            // 註解
            return (
                <span className=" w-full flex justify-center items-center mt-1 ">
                    <span className=" !text-sm">
                        {children}
                    </span>
                </span>
            );
        },
        blockquote({ children }: { children: React.ReactNode }) {
            // 引用塊
            return (
                <blockquote className="rounded-sm border-l-[0.25em] pl-4 italic my-4">
                    {children}
                </blockquote>
            );
        },
        code({ children, className, ...props }: { children: React.ReactNode, className?: string }) {
            // 多行代碼塊
            const match = /language-(\w+)/.exec(className || '')
            const th = getComputedStyle(document.documentElement).getPropertyValue("--code-theme") || "dark"

            return match ? (
                <SyntaxHighlighter
                    {...props}
                    PreTag="div"
                    children={String(children).replace(/\n$/, '')}
                    language={match[1]}
                    showLineNumbers={true}
                    // showInlineLineNumbers={true}
                    style={getThemeStyle(th)}
                    wrapLines={true}

                    lineNumberStyle={{ color: '#888', paddingRight: '10px' }}

                    codeTagProps={{
                        className: "code-block-jx",
                        style: {
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        },
                    }}
                />
            ) : (
                // 行內代碼
                <code {...props} className={className}>
                    {children}
                </code>
            )
        }
    }


    if (initMdValue) {
        mdValue = initMdValue;
    }

    useEffect(() => {
        const regex = /\[root-path\] *: *\((.*?)\)/;
        const match = mdValue.match(regex);
        if (match) {
            setRootPath(match[1]);
        }
    }, [mdValue])

    return (
        <div className={`preview-area no-scrollbar bg-stone-100 min-w-0 lg:min-w-48 w-full h-full overflow-y-scroll ${only ? " w-full" : expandLevel > 0 ? "flex-grow flex-shrink " : " absolute left-0 " + (displayId === 2 ? "" : " opacity-0 pointer-events-none ")} `} >

            <div className={`preview-area-2 p-2 relative ${only ? "w-full flex justify-center" : ""}`}>
                <div
                    // onClick={}
                    style={{
                        scale: width / 850
                    }}
                    className={` page markdown-content ${only ? " only " : ""}`}
                >
                    <Markdown
                        components={components}
                        // @ts-ignore
                        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeKatexNotranslate, rehypeCallouts]}

                        remarkPlugins={[
                            remarkMath,
                            [remarkHeadingNumbering,
                                {
                                    minDepth: mdHNConfig.minDepth,
                                    maxDepth: mdHNConfig.maxDepth,
                                    style: mdHNConfig.style,
                                    separator: mdHNConfig.separator
                                }],
                            remarkGfm,
                            // @ts-ignore
                            [remarkExternalLinks,
                                { target: '_blank', rel: 'noopener noreferrer' }
                            ]
                        ]}
                    >
                        {processMarkdown(mdValue)}
                    </Markdown>
                </div>
            </div>
        </ div>
    )
}

export default PreviewArea
