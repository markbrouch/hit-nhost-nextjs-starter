
export function parseGedcomDate(dateString: string|undefined) : Date|string|undefined {
    if(!dateString) { return; }

    let date: Date|string|undefined;

    let dstring = dateString;
    let dateEpoch: number;

    // remove ABT
    dstring = dstring.replace('abt. ', '');
    dstring = dstring.replace('ABT. ', '');
    dstring = dstring.replace('ABT ', '');
    dstring = dstring.replace('abt ', '');

    // check for year BC
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    const myRe = /(\d+) BC/;
    const myArray = myRe.exec(dstring);

    console.log("myArray ", myArray);
    if(myArray && myArray.length > 0) {
        const yearBc = 0 - parseInt( myArray[0] );
        console.log("yearBc ", yearBc);
        dateEpoch = new Date(0).setUTCFullYear(yearBc);

        // TEMP TODO  - BC will be null
        dateEpoch = new Date(0).setUTCFullYear(0);

        // date = new Date(dateEpoch);
        date = undefined;


        // https://github.com/mauricio/postgresql-async/issues/248
        // use 'YYYY BC' for postgresql
        // date = `${yearBc} BC`;
    }
    else {
        dateEpoch = Date.parse(dateString);
        date = new Date(dateEpoch);
    }

    if(dateEpoch && date) {
        console.log(`${dstring} -> ${date}`);
    }
    else {
        console.log(`${dstring} -> null`);
    }

    return date;
}

