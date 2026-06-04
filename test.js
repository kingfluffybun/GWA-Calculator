function parseOCRText(text) {
    return text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const match = line.match(/(\d+)\s+([0-9]+(?:\.[0-9]{1,2})?)/g);
            if (!match || match.length < 1) return null;
            const lastPair = match[match.length - 1];
            const pairMatch = lastPair.match(/(\d+)\s+([0-9]+(?:\.[0-9]{1,2})?)/);
            if (!pairMatch) return null;
            const units = pairMatch[1];
            const grade = pairMatch[2];
            if (Number(units) > 0 && Number(units) < 10 && Number(grade) >= 1 && Number(grade) <= 5) {
                return { units, grade };
            }
            return null;
        })
        .filter(Boolean);
}
const sampleOCR = "GED103 Science, Technology and Society 3 3.25 Outstanding\nITE113 Intermediate Programming 3 2.75 Very Satisfactory\nITE114 Information Management 3 3.25 Outstanding\nMST101 Living in the IT Era 3 3.25 Outstanding";
const result = parseOCRText(sampleOCR);
console.log('Results:', JSON.stringify(result, null, 2));
console.log('Total rows:', result.length);
