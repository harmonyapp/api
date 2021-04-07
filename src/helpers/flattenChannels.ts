import { IChannelDocument } from "../models/channel";

const flattenChannels = (channels: IChannelDocument[]): [IChannelDocument[], boolean] => {
    let didUpdate = false;

    const valueToIncides = new Map();
    const copy = [...channels];

    const sorted = copy.sort((a, b) => a.position > b.position ? 1 : ((b.position > a.position) ? -1 : 0));

    for (let i = 0; i < channels.length; i++) valueToIncides.set(sorted[i].id, i);

    for (let i = 0; i < channels.length; i++) {
        const index = valueToIncides.get(channels[i].id);

        if (channels[i].position !== index) {
            didUpdate = true;

            channels[i].position = index;
        }
    }

    return [channels, didUpdate];
};

export default flattenChannels;