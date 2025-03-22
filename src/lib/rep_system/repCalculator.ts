
const expected = (rA: number, rB: number, d?: number): number => {
    return 1 / (1 + Math.pow(10, (rA - rB) / (d ?? 1000)));
}

const weight = (rA: number, c?: number): number => {
    return rA / (rA + (c ?? 5000));
}

function repUpdate(rReciever: number, rRater: number, score: number, numTrades: number, k?: number): number {
    if (score === 0) {
        return rReciever + 1;
    }
    let newRating = rReciever + ((k ?? 150) * (1 / (0.6 * Math.sqrt(numTrades + 1)))) * weight(rRater) * (score - expected(rRater, rReciever));
    newRating = Math.min(newRating, 2000);
    newRating = Math.round(newRating);
    return newRating;
}

console.log(repUpdate(1500, 2000, 1, 2));