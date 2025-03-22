import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
    const session = await auth();
    if (!session || !session.user) 
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    try {
        const { id } = await request.json();
        const resp = await fetch(`https://p2p-elo-worker.hunekejustus.workers.dev/get?id=${id}`, { method: "GET" });

        if (!resp.ok) {
            console.error("Error fetching user ELO: ", resp.status);
            return NextResponse.json({ error: "Error fetching ELO"}, { status: resp.status });
        }

        const { elo } = await resp.json();
        return NextResponse.json(parseInt(elo));
    } catch (error) {
        console.error("Error fetching user ELO: ", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export const POST = async (request: Request) => {
    const session = await auth();
    if (!session || !session.user)
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    try {
        const { id, newElo } = await request.json();
        const resp = await fetch(`https://p2p-elo-worker.hunekejustus.workers.dev/update?id=${id}&elo=${newElo}`, { method: "POST" });

        if (!resp.ok) {
            console.error("Error updating user ELO: ", resp.status);
            return NextResponse.json({ error: "Error updating ELO" }, { status: resp.status });
        }

        return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (error) {
        console.error("Error updating user ELO in KV: ", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}