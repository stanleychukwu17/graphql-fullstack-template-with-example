// for showing error messages
export const show_bad_message = (cause: string) => {
    return {
        'msg':'bad',
        'cause':cause
    }
}

// for showing successful messages
export const show_good_message = (cause?: string) => {
    return {
        'msg':'okay',
        'cause':cause || 'everything is okay'
    }
}

export const generate_fake_id = (id:number) => {
    // Generate a random number between 100 and 999 (inclusive of 100, exclusive of 999)
    const randomNumber = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
    const new_fake_id = `${id}${randomNumber}`
    return Number(new_fake_id);
}

// returns the exact line where an error occurred including the filePath
export function get_the_line_where_this_error_occurred({errorMessage}: {errorMessage: string}) {
    const regex = /\(([^)]+)\)/; // captures the first "(" and everything in between until it reaches the first ")", you can ask chatGPT to explain to you the regular expression code
    const matches = errorMessage.match(regex); // result will look something like this in development mode - "D:\\Sz - projects\\26-learning\\4-postgres-1\\server\\src\\App.ts:10:15"
    let capturedErrorLine = ''
    if (matches) {
        capturedErrorLine = matches[1]; // The captured text is in matches[1] - do console.log(capturedErrorLine);
    } else {
        capturedErrorLine = ''
    }

    return capturedErrorLine
}