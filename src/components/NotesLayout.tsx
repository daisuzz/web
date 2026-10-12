import * as React from "react"
import NoteSidebar from "./organisms/NoteSidebar"
import {NoteNav} from "../types/note"
// @ts-ignore
import * as style from "./NotesLayout.module.css"

interface Props {
    nav: NoteNav
    currentSlug?: string
    children: React.ReactNode
}

// /notes配下のページ共通の2ペイン構成。左にハブノートをフォルダとしたノートツリー、右に各ページの本文を置く。
const NotesLayout: React.FC<Props> = ({nav, currentSlug, children}) => (
    <div className={style.shell}>
        <NoteSidebar nav={nav} currentSlug={currentSlug}/>
        <div className={style.content}>{children}</div>
    </div>
)

export default NotesLayout
