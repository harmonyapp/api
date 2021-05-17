import Util from "./Util";

interface PositionDocument {
    id: string;
    position?: number;
}

class PositionUtil extends Util {
    public static flatten<T extends PositionDocument>(documents: T[]): [T[], boolean] {
        let didUpdate = false;

        const valueToIncides = new Map();
        const copy = [...documents];

        const sorted = copy.sort((a, b) => a.position > b.position ? 1 : ((b.position > a.position) ? -1 : 0));

        for (let i = 0; i < documents.length; i++) valueToIncides.set(sorted[i].id, i);

        for (let i = 0; i < documents.length; i++) {
            const index = valueToIncides.get(documents[i].id);

            if (documents[i].position !== index) {
                didUpdate = true;

                documents[i].position = index;
            }
        }

        return [documents, didUpdate];
    }

    public static bump<T extends PositionDocument>(documents: T[]): T[] {
        let i = 0;

        for (const channel of documents) {
            if (i !== 0) {
                const previous = documents[i - 1];

                if (channel.position <= previous.position) {
                    documents[i].position = previous.position + 1;
                }
            }

            i++;
        }

        return documents;
    }

    /**
     * Sorts the documents by position, from lowest to highest
     */
    public static sortByPosition<T extends PositionDocument>(documents: T[]): T[] {
        return documents.sort((a, b) => (a.position > b.position) ? 1 : ((b.position > a.position) ? -1 : 0));
    }
}

export default PositionUtil;