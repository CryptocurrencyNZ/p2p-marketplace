/**
 * 
 * @param recievingUserId user Id of the user recieving the ELO change
 * @param raterUserId user Id of the user that is 
 * @param tradeScore The score that the user was given in the feedback (either 1, 0 or -1)
 */
export async function updateUserReputation(recievingUserId: string, raterUserId: string, tradeScore: number, numTrades: number) {
    const recieverELO = await fetchUserElo(recievingUserId);
    const raterELO = await fetchUserElo(raterUserId);

    const newRecieverELO = repUpdate(recieverELO, raterELO, tradeScore, numTrades);

    await updateUserElo(recievingUserId, newRecieverELO);
}

async function fetchUserElo(userId: string): Promise<number> {
    const resp = await fetch(`https://p2p-elo-worker.hunekejustus.workers.dev/get?id=${userId}`, { method: "GET" });

    if (!resp.ok) {
        console.error("Error fetching user ELO: ", resp.status);
    }

    const { elo } = await resp.json();
    return parseInt(elo);
}

export async function updateUserElo(userId: string, newElo: number) {
    const resp = await fetch(`https://p2p-elo-worker.hunekejustus.workers.dev/update?id=${userId}&elo=${newElo}`, { method: "POST" });

    if (!resp.ok) {
        console.error("Error updating user ELO: ", resp.status);
    }
}