import StyleConfigPanel from "./StyleConfigPanel";

function SetArea({ displayId, width, expandLevel }: { displayId: number, width: number, expandLevel: number }) {

    return (
        <div style={{ width: width }} className={`set-area bg-blue-50 ${expandLevel > 1 ? " max-w-full-12 min-w-56 static flex-grow-0" : " absolute left-0 " + (displayId === 1 ? "" : " opacity-0 pointer-events-none ")}  h-full flex-grow-0 flex-shrink-0 min-w-0 lg:min-w-48`}>
            <div className=" p-0 h-full bg-blue-50">
                <StyleConfigPanel/>
            </div>
        </div>
    )
}

export default SetArea