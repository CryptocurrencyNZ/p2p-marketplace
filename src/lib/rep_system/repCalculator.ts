
const expected = (rA: number, rB: number): number => {
    return 1 / (1 + Math.pow(10, (rA - rB) / 1000));
}

const weight = (rA: number): number => {
    return rA / (rA + 5000);
}

function repUpdate(rReciever: number, rRater: number, score: number, numTrades: number): number {
    if (rReciever === -1) {
        if (score === 1){
            rReciever = 1300
            return rReciever;
        }
        if (score === 0){
            rReciever = 1100
            return rReciever;
        }
        if (score === -1){
            rReciever = 980
            return rReciever;
        }
        return rReciever + 1;
    }
    let newRating = rReciever + (150 * (1 / (0.6 * Math.sqrt(numTrades + 1)))) * weight(rRater) * (score - expected(rRater, rReciever));
    newRating = Math.min(newRating, 2000);
    newRating = Math.round(newRating);
    return newRating;
}

console.log(repUpdate(1000, 0, 0, 0));
