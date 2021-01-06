const scorePassword = (pass: string): number => {
    let score = 0;

    if (!pass)
        return score;

    const letters = new Object();

    // Award every unique letter until 5 repetitions
    for (let i = 0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // Bonus points for mixing it up
    const variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass)
    };

    let variationCount = 0;

    for (const check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }

    score += (variationCount - 1) * 10;

    return score;
};

export default scorePassword;