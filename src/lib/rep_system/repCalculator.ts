/**
 * 
 * @param C constant C, defaults to 2
 * @returns A value calculator that returns the value for the initialised C given any n
 */
function valCalc(C: number = 2): (n: number) => number {
    return function(n: number) {
        // Calculates value given constant C and number of times traded in last 30 days (n)
        return C * Math.max(-1*Math.log10(n + 0.5) + 1, 0.05);
    };
}

/**
 * 
 * @param val value of the interaction for the trader
 * @param rep reputation of the trader
 * @param boost boost (defaults to 1)
 * @returns 
 */
const power = (n: number, rep: number, C?: number): number => {
    const val = valCalc(C);
    return (val(n) * rep) / 2000 ;
}

const prob = (repA: number, repB: number) => {
    return 1 / (1 + (Math.pow(10, (repB - repA) / 400)));
}

const nextRep = (repA: number, repB: number, scoreA: number, K: number = 10): number => {
    return repA + K * (scoreA - prob(repA, repB));
}

function completeInteraction(repA: number, repB: number, scoreA: number, scoreB: number, n: number, K?: number, C?: number): [number, number] {
    const powerA = power(n, repA);
    const powerB = power(n, repB);

    console.log(`Rep A before: ${repA}`);
    console.log(`Rep B before: ${repB}`);

    repA = scoreA * nextRep(repA, repB, scoreA, powerB);
    repB = scoreB * nextRep(repB, repA, scoreB, powerA);

    console.log(`Rep A after: ${repA}`);
    console.log(`Rep B after: ${repB}`);

    return [repA, repB];
}

completeInteraction(1100, 1000, 1.1, 0.9, 2);