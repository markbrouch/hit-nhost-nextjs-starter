
export const recordsByType: { [key: string]: number } = {};

export function parseGedcomDate(dateString: string|undefined) : Date|string|undefined {
    if(!dateString) { return; }

    let date: Date|string|undefined;

    let dstring = dateString;
    let dateEpochMilli: number;

    // remove ABT
    const prefixes = [
        'abt.', 'ABT.', 'ABT', 'abt', 'BEF', 'c.', 'ca.', 'Abt.', 
    ];
    prefixes.forEach((p) => {
        dstring = dstring.replace('${p} ', '');
    });

    // check for year BC
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    const myRe = /(\d+) BC/;
    const myArray = myRe.exec(dstring);

    console.log("myArray ", myArray);
    if(myArray && myArray.length > 0) {
        const yearBc = parseInt( myArray[0] );
        let yearBcString: string|undefined;
        if(yearBc) {
            yearBcString = myArray[0];
            yearBcString = yearBcString.replace(' BC', '');
        }
        console.log("yearBcString ", yearBcString);
        let dateBC = new Date(-yearBc, 0, 1);

        // TEMP TODO  - BC will be null
        // dateEpoch = new Date(0).setUTCFullYear(0);

        // date = new Date(dateEpoch);
        // date = undefined;


        // https://github.com/mauricio/postgresql-async/issues/248
        // use 'YYYY BC' for postgresql
        date = `${yearBcString}-01-01 BC`;
        dateEpochMilli = dateBC.getTime();
    }
    else {
        dateEpochMilli = Date.parse(dateString);
        date = new Date(dateEpochMilli);
    }

    if(dateEpochMilli && date) {
        console.log(`${dstring} -> ${date}`);
    }
    else {
        console.log(`${dstring} -> null`);
    }

    return date;
}

