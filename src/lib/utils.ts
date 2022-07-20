
export function parseGedcomDate(dateString: string|undefined) : Date|undefined {
    if(!dateString) { return; }

    let date: Date|undefined;

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
    }
    else {
        dateEpoch = Date.parse(dateString);
    }
    date = new Date(dateEpoch);

    if(dateEpoch && date) {
        console.log(`${dstring} -> ${date?.toISOString()}`);
    }
    else {
        console.log(`${dstring} -> null`);
    }

    return date;
}

