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
const power = (n: number, rep: number, boost: number = 1, c: number | undefined) => {
    const val = valCalc(c);
    return val(n) * rep * boost;
}

