import Member from "../../src/models/member";
import Server from "../../src/models/server";
import Session from "../../src/models/session";
import User from "../../src/models/user";

const user_raymond = new User({
    username: "Raymond",
    email: "raymond@example.com",
    password: "Password123!"
});

const user_dembe = new User({
    username: "Dembe",
    email: "dembe@example.com",
    password: "hunter123"
});

const raymond_session = new Session({
    user: user_raymond.id
});

const dembe_session = new Session({
    user: user_dembe.id
});

const dembes_server = new Server({
    name: "Dembe's Server",
    owner: user_dembe.id
});

const dembe_member = new Member({
    server: dembes_server,
    user: user_dembe.id
});

const setupDatabase = async (): Promise<void> => {
    await user_raymond.save();
    await user_dembe.save();

    await raymond_session.save();
    await dembe_session.save();

    await dembes_server.save();

    await dembe_member.save();
};

export {
    user_dembe,
    user_raymond,

    raymond_session,
    dembe_session,

    dembes_server,
    dembe_member,

    setupDatabase
};