import { IChannelDocument } from "../models/channel";
import Util from "./Util";

class ChannelUtil extends Util {
    public static flattenChannels(channels: IChannelDocument[]): [IChannelDocument[], boolean] {
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
    }

    public static bumpChannels(channels: IChannelDocument[]): IChannelDocument[] {
        let i = 0;

        for (const channel of channels) {
            if (i !== 0) {
                const previous = channels[i - 1];

                if (channel.position <= previous.position) {
                    channels[i].position = previous.position + 1;
                }
            }

            i++;
        }

        return channels;
    }

    public static sortByPosition(channels: IChannelDocument[]): IChannelDocument[] {
        return channels.sort((a, b) => (a.position > b.position) ? 1 : ((b.position > a.position) ? -1 : 0));
    }
}

export default ChannelUtil;