/**
 * 
 * @param C constant C, defaults to 2
 * @returns A value calculator that returns the value for the initialised C given any n
 */
function val(C: number = 2): (n: number) => number {
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
const power = (val: number, rep: number, boost: number = 1) => {
    return val * rep * boost;
}




function expectedProbabilites(differenceForTraderA: number , differenceForTraderB: number): {probabilityA: number , probabilityB: number} {
    
    let probabilityA: number = ( 1 / ( 1 + ( 10 ** ((differenceForTraderB - differenceForTraderA)/400)))) 
    let probabilityB: number = ( 1 / ( 1 + ( 10 ** ((differenceForTraderA - differenceForTraderB)/400)))) 

    return{
        probabilityA, 
        probabilityB
    }
}

function nextRatings(currRating: number, score: number, expectedProbability: number): number{

    /**
     * 100 is the constant which needs to be changed and optimised 
     */
    let nextRating: number = (currRating + (100*(score - expectedProbability)))

    return nextRating;
    
}

function starRating(rep: number): number{

    return (5/2000 * rep);
}
