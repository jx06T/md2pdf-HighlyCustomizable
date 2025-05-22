import MDEditor from '../uiw/react-md-editor';

import { useMdContext } from "../context/MdContext";

function EditorArea({ width, expandLevel }: { width: number, expandLevel: number }) {

    const { mdValue, setMdValue } = useMdContext()
    const handleChange = (val?: string) => {
        if (val !== undefined) {
            setMdValue(val);
        }
    };

    return (
        <div style={{ width: width }} className={`editor-area bg-black ${expandLevel > 1 ? "max-w-full-24" : (expandLevel > 0 ? "max-w-full-12" : "")} min-w-0 lg:min-w-48 flex-grow-0 flex-shrink-0`}>
            <div className=" p-1 pl-2 h-full w-full" data-color-mode="dark">
                <MDEditor
                    value={mdValue}
                    onChange={handleChange}
                    preview="edit"
                    visibleDragbar={false}
                    height="100%"
                    minHeight={1000}
                    extraCommands={[
                    ]}
                />
            </div>
        </div>
    )
}

export default EditorArea