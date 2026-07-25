"use client"
import { useState } from "react"

type Player = {
    player_id: string;
    nickname: string;
    country: string;
    avatar: string;
}

type lastReport = {
    reason: string,
    submitted_by: string,
    createdAt: number
}

type deathnoteInfo = {
    count: number;
    memeScore: number;
    lastReport: lastReport[]
}

export default function FaceitSearch() {

const [nickname,setNickname] = useState("")
const [player,setPlayer] = useState<Player | null>(null)
const [loading,setLoading] = useState(false)
const [error,setError] = useState<string | null>(null)

const [showForm,setShowForm] = useState(false)
const [deathnoteData, setDeathnoteData] = useState<deathnoteInfo | null>(null)

const [reason,setReason] = useState("")
const [submittedBy,setSubmittedBy] = useState("")
const [clipUrl,setClipUrl] = useState("")

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setPlayer(null)

        try {
        if (!nickname.trim()) {
            setError("nickname is required")
            return  
        } 
        setLoading(true)
        const response = await fetch(`/api/faceit/player?nickname=${nickname}`)
        if (!response.ok) return setError("Faceit nicknames are case-sensitive. Please enter the nickname exactly as it appears on Faceit")

        //Распарс json
        const data = await response.json()
        if (!data.player_id) return setError("didn`t find player")
        setPlayer(data)
        await deathnoteInfo(data.player_id)
        } catch (error){
        console.error(error)
        setError("Something went wrong")
        } finally {
        setLoading(false)
        }}

    async function handleSubmit() {
        if (!player) return
        try {
            if(!reason.trim()) {
                setError("reason is required") 
                return
            }
        setLoading(true)
        const response = await fetch("/api/deathnote/submit", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                ...player,
                reason,
                submittedBy,
                clipUrl
        })
        })
        if(!response.ok) return setError("failed to submit")
        //иначе
        setShowForm(false)
        setReason("")
        setSubmittedBy("")
        setClipUrl("")
        } catch (error) {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
}

    async function deathnoteInfo(playerId: string) {
	const response = await fetch(`/api/deathnote/player/${playerId}`)
	if (!response.ok) return 
	const data = await response.json()
	setDeathnoteData(data)
        
    }

    const deathnoteDataLastReport = deathnoteData?.lastReport.map((report) => {
        return (
        <div 
        key={`${report.submitted_by}-${report.createdAt}`}
        className="border-2 border-orange-500 rounded-2xl p-2 mt-2 space-y-2">{report.reason}
        <p>Submitted by :{report.submitted_by}</p>
        <p>Created at: {new Date(report.createdAt).toLocaleDateString()}</p>
        </div>
    )
    })

    function scoreBadge(score: number) {     
            if (score >= 100) {
                return "bg-black"
            } else if (score >= 80) {
                return "bg-red-500"
        } else if (score >= 60) {
            return "bg-orange-500"
        } else if (score >= 40) {
            return "bg-yellow-500"
        } else if (score >= 20) {
            return "bg-green-500"
        }
    }


    return (
<div className="min-h-screen bg-zinc-950 flex justify-center items-start p-6">
    <div className="w-[420px] rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">

        <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-700">
            <h1 className="text-xl font-bold tracking-wider text-orange-500">
                ☠ FACEIT DEATHNOTE
            </h1>
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"/>
                <span className="text-sm text-green-400">
                    Enabled
                </span>
            </div>

        </header>
        <section className="p-5">
            <p className="text-sm text-zinc-400 mb-2">
                Search Faceit Player
            </p>
            <form
                className="space-y-3"
                onSubmit={handleSearch}
                >
                <input
                    value={nickname}
                    onChange={(e)=>setNickname(e.target.value)}
                    placeholder="Faceit nickname"
                    className="
                    w-full
                    rounded-xl
                    bg-zinc-800
                    border
                    border-zinc-700
                    px-4
                    py-3
                    outline-none
                    text-white
                    focus:border-orange-500
                    transition"/>
                <button
                    disabled={loading}
                    className="
                    w-full
                    rounded-xl
                    bg-orange-500
                    py-3
                    font-bold
                    text-white
                    hover:bg-orange-600
                    transition">
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>
            {error && (
                <p className="mt-3 text-red-400 text-sm">
                    {error}
                </p>
            )}
        </section>

        {player && deathnoteData && (
        <>
        <section className="border-t border-zinc-700 p-6 flex flex-col items-center">
    {player.avatar ? (
        <img
            src={player.avatar}
            alt={player.nickname}
            className="
            w-24
            h-24
            rounded-full
            border-4
            border-orange-500
            object-cover
            shadow-lg"/>
    ) : (
        <div className="
            w-24
            h-24
            rounded-full
            border-4
            border-orange-500
            bg-zinc-800
            flex
            items-center
            justify-center
            text-3xl
            font-bold
            text-zinc-500
            shadow-lg">
            {player.nickname?.[0]?.toUpperCase()}
        </div>
    )}
    <h2 className="mt-4 text-3xl font-bold text-orange-400">
        {player.nickname}
    </h2>
    <p className="text-zinc-400 mt-1">
        {player.country}
    </p>
</section>

        <section className="border-t border-zinc-700 p-5">
            <div className="flex justify-between mb-2">
                <span className="font-semibold text-zinc-300">
                    MemeScore
                </span>
                <span className="font-bold text-orange-500">
                    {deathnoteData.memeScore}/100
                </span>
            </div>
            <div className="h-3 rounded-full bg-zinc-700 overflow-hidden">
                <div
                    style={{
                        width:`${deathnoteData.memeScore}%`
                    }}
                    className={`
                    ${scoreBadge(deathnoteData.memeScore)}
                    h-full
                    transition-all
                    duration-700`}/>
            </div>
            <div className="mt-4 flex justify-between">
                <span className="text-zinc-400">
                    Reports
                </span>
                <span className="text-orange-500 font-bold">
                    {deathnoteData.count}
                </span>
            </div>
        </section>
        <section className="border-t border-zinc-700 p-5">
            <h3 className="text-lg font-bold text-orange-500 mb-4">
                Latest Reports
            </h3>
            <div className="space-y-3">
                {deathnoteDataLastReport}
            </div>
        </section>
        <section className="border-t border-zinc-700 p-5">
            {!showForm && (
                <button
                    onClick={()=>setShowForm(true)}
                    className="
                    w-full
                    rounded-xl
                    bg-orange-500
                    py-3
                    font-bold
                    text-white
                    hover:bg-orange-600
                    transition">
                    Submit Report
                </button>
            )}

            {showForm && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-orange-500">
                        Submit Report
                    </h3>
                    <textarea
                        placeholder="Reason..."
                        value={reason}
                        onChange={(e)=>setReason(e.target.value)}
                        className="
                        w-full
                        rounded-xl
                        bg-zinc-800
                        border
                        border-zinc-700
                        p-3
                        outline-none
                        text-white
                        resize-none
                        h-28
                        focus:border-orange-500"/>
                    <input
                        placeholder="Your Faceit nickname"
                        value={submittedBy}
                        onChange={(e)=>setSubmittedBy(e.target.value)}
                        className="
                        w-full
                        rounded-xl
                        bg-zinc-800
                        border
                        border-zinc-700
                        p-3
                        outline-none
                        text-white
                        focus:border-orange-500"/>
                    <input
                        placeholder="Clip URL (optional)"
                        value={clipUrl}
                        onChange={(e)=>setClipUrl(e.target.value)}
                        className="
                        w-full
                        rounded-xl
                        bg-zinc-800
                        border
                        border-zinc-700
                        p-3
                        outline-none
                        text-white
                        focus:border-orange-500"/>

                    <div className="flex gap-3">
                        <button
                            onClick={()=>setShowForm(false)}
                            className="
                            flex-1
                            rounded-xl
                            bg-zinc-700
                            py-3
                            hover:bg-zinc-600
                            transition">
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="
                            flex-1
                            rounded-xl
                            bg-orange-500
                            py-3
                            font-bold
                            text-white
                            hover:bg-orange-600
                            transition">
                            Submit
                        </button>
                    </div>
                </div>
            )}
        </section>
        </>
        )}
    </div>
</div>
)}