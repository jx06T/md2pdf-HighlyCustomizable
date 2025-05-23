import { useState } from "react";
import { IcBaselinePrint, MaterialSymbolsContentCopyOutlineRounded, MingcuteArrowToLeftFill, MingcuteAlignArrowRightFill } from "../utils/Icons";
import { copyToClipboard } from '../utils/tool';

function UpperToolbar({ editorWidth, setCustomExpandLevel, editorAndSetWidth, displayId, setDisplayId, maxExpandLevel, expandLevel }: { setCustomExpandLevel: Function, editorAndSetWidth: number, editorWidth: number, displayId: number, setDisplayId: Function, expandLevel: number, maxExpandLevel: number }) {
  const [copied, setCopied] = useState<boolean>(false);

  return (
    <div className="print-hide flex w-full h-9">
      <div
        style={{ width: expandLevel > 1 ? editorWidth : "fit-content" }}
        className={`${displayId === 0 || expandLevel > 1 ? " bg-b-2-w" : " bg-white"} pt-2 flex flex-shrink-0 flex-grow-0 `}
      >
        <span
          onClick={expandLevel > 1 ? () => { } : () => setDisplayId(0)}
          className={` cursor-pointer ${displayId === 0 || expandLevel > 1 ? "bg-black text-white " : "bg-stone-400 text-black "} rounded-t-md px-2 w-fit pt-1 left-point`}
        >
          Editor
        </span>
      </div>

      <div
        style={{ width: expandLevel > 0 ? (expandLevel > 1 ? (editorAndSetWidth - editorWidth) : editorWidth) : "fit-content" }}
        className={` bg-white pt-2 flex  flex-shrink-0 flex-grow-0 ${expandLevel > 1 ? "mr-2 " : (expandLevel > 0 ? "-mr-[4.5rem] " : "")} `}
      >
        <span
          onClick={expandLevel > 1 ? () => { } : () => setDisplayId(1)}
          className={` cursor-pointer ${displayId === 1 || expandLevel > 1 ? "bg-blue-50" : " bg-stone-400"} text-black rounded-t-md px-2 w-fit pt-1 left-point`}
        >
          Settings
        </span>

        {(expandLevel !== 0 && maxExpandLevel > 1) &&
          <button
            onClick={() => setCustomExpandLevel(expandLevel > 1 ? 1 : 2)}
            className="pb-2 rounded-md w-9 h-9 ml-2"
          >
            {expandLevel > 1 ?
              <MingcuteArrowToLeftFill className=" text-2xl"></MingcuteArrowToLeftFill> :
              <MingcuteAlignArrowRightFill className=" text-2xl"></MingcuteAlignArrowRightFill>
            }
          </button>
        }
      </div>

      {/* 預覽區標籤 */}
      <div className=" bg-white pt-2 w-full h-9 space-x-2 flex">
        <label
          onClick={expandLevel > 0 ? () => { } : () => setDisplayId(2)}
          className={` ${displayId === 2 || expandLevel > 0 ? "bg-slate-100" : " bg-stone-400"} cursor-pointer bg-stone-100 rounded-t-md px-2 w-fit pt-1 text-black left-point `}
        >
          Preview
        </label>

        {(maxExpandLevel > 0) &&
          <button
            onClick={() => {
              setCustomExpandLevel(expandLevel > 0 ? 0 : 1)
              setDisplayId(2)
            }}
            className="pb-2 rounded-md w-9 h-9 ml-2">
            {expandLevel > 0 ?
              <MingcuteArrowToLeftFill className=" text-2xl"></MingcuteArrowToLeftFill> :
              <MingcuteAlignArrowRightFill className=" text-2xl"></MingcuteAlignArrowRightFill>
            }
          </button>
        }

        <button
          onClick={() => window.print()}
          className="pb-2 rounded-md w-9 h-9 "
        >
          <IcBaselinePrint className="text-2xl"></IcBaselinePrint>
        </button>

        <button onClick={() => {
          setCopied(true)
          copyToClipboard(localStorage.getItem('mdValue') || "")
          setTimeout(() => {
            setCopied(false)
          }, 500);
        }} className="pb-2 rounded-md w-9 h-9"><MaterialSymbolsContentCopyOutlineRounded className={`text-2xl ${copied ? " text-green-700" : " text-black"} `}></MaterialSymbolsContentCopyOutlineRounded></button>


        {copied && <span className=" bg-stone-200 text-black rounded-full h-6 !-ml-2 px-2 block">copied!</span>}
      </div>
    </div >
  )
}

export default UpperToolbar