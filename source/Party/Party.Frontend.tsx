import { Cmd, Sub } from "../Core";
import { FrontendModel, FrontendMsg, ToBackend, ToFrontend } from "./Party.Types";
import * as UI from "../UI"
import { PartyId, UserId } from "../Data";
import * as Route from "../Route"
import * as Store from "../Store"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: [Model, Cmd.Cmd<Msg>] = [{ parties: {}, users: {} }, Cmd.None];

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = Store.Action

export const update = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        // 
        //
        //
        //
        // 

        case 'ClickedBanner': {
            return [model, Route.push(['Party'])]
        }

        // 
        //
        //
        //
        // 

        case "StartParty": {
            return [model, sendToBackend(msg)]
        }

        case 'LeaveParty': {
            return [model, sendToBackend(msg)]
        }

        case 'JoinParty': {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
    switch (msg[0]) {
        case 'Sync': {
            const sharedModel = msg[1]
            const userIds = Object.values(sharedModel.users).map(user => user.userId)
            return [{ ...model, parties: sharedModel.parties, users: sharedModel.users }, Cmd.None, [['Store', ['Profile', ['FindMany', { userIds }]]]]]
        }

        case 'StartPartyResulted': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None, []]
            }

            const sharedModel = msg[1].value

            return [{ ...model, parties: sharedModel.parties, users: sharedModel.users }, Cmd.None, []]
        }

        case 'LeavePartyResulted': {
            return [model, Cmd.None, []]
        }

        case 'JoinPartyResulted': {
            return [model, Cmd.None, []]
        }
    }
}


export type Action = ['Party', ['Msg', Msg]]

export const runAction = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, action: Action, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (action[1][0]) {
        case 'Msg': {
            return update({ sendToBackend }, action[1][1], model)
        }
    }
}


//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
    return Sub.None;
};

// 
// 
// 
// View
// 
// 
// 

export const view = ({ currentUserId, store }: { currentUserId: UserId.UserId, store: Store.Model }, model: Model): UI.View<Msg> => (dispatch) => {

    const user = model.users[currentUserId]

    if (!user) {
        return <ViewNotInParty model={model} store={store} currentUserId={currentUserId} dispatch={dispatch} />
    }

    const party = model.parties[user.partyId]

    if (!party) {
        return <ViewNotInParty model={model} store={store} currentUserId={currentUserId} dispatch={dispatch} />
    }

    return <UI.FillBox>
        <UI.Box sx={{ paddingX: 2 }}>
            <UI.ListItemText
                primary={`${store.Profile[party.hostId]?.username ?? "..."}'s party`}
                secondary={`${countUsersInParty(party.partyId, model)} in party`}
            />
        </UI.Box>

        <UI.Box sx={{ flex: 1 }}>
            {Object.values(model.users)
                .filter(user => user.partyId === party.partyId)
                .map(user => (
                    <UI.ListItemButton key={user.userId} >
                        <UI.ListItemAvatar>
                            <UI.Avatar src={store.Profile[user.userId]?.avatarUrl} />
                        </UI.ListItemAvatar>

                        <UI.ListItemText
                            primary={`${store.Profile[user.userId]?.username ?? "..."}`}
                        />
                    </UI.ListItemButton>
                ))}
        </UI.Box>
        <UI.Box sx={{ padding: 2 }}>
            <UI.Button fullWidth variant="contained" size="large" onClick={() => dispatch(['LeaveParty', { userId: currentUserId }])}>
                Leave Party
            </UI.Button>
        </UI.Box>
    </UI.FillBox>
}

const ViewNotInParty = ({ currentUserId, model, store, dispatch }: { store: Store.Model, model: Model, currentUserId: UserId.UserId, dispatch: (msg: Msg) => void }) => {
    return (
        <UI.FillBox>
            <UI.Header title="Party" />
            <UI.Box sx={{ paddingX: 2 }}>
                <UI.Button fullWidth variant="contained" size="large" onClick={() => dispatch(['StartParty', { hostId: currentUserId, partyId: PartyId.generateSync() }])}>
                    Start Party
                </UI.Button>
            </UI.Box>
            <UI.Box sx={{ flex: 1 }}>
                {Object.values(model.parties).map(party => (
                    <UI.ListItemButton key={party.partyId} onClick={() => dispatch(['JoinParty', { userId: currentUserId, partyId: party.partyId }])}>
                        <UI.ListItemAvatar>
                            <UI.Avatar src={store.Profile[party.hostId]?.avatarUrl} />
                        </UI.ListItemAvatar>

                        <UI.ListItemText
                            primary={`${store.Profile[party.hostId]?.username ?? "..."}'s party`}
                            secondary={`${countUsersInParty(party.partyId, model)} in party`}
                        />
                    </UI.ListItemButton>
                ))}
            </UI.Box>
        </UI.FillBox>
    )
}

const countUsersInParty = (partyId: PartyId.PartyId, model: Model): number => {
    return Object.values(model.users).filter(user => user.partyId === partyId).length
}

export const viewBanner = ({ route, currentUserId, model, store, }: { store: Store.Model, route: Route.Model, currentUserId: UserId.UserId, model: Model }): UI.View<Msg> => (dispatch) => {
    if (route[0] === 'Party') {
        return <></>
    }

    const user = model.users[currentUserId]

    if (!user) {
        return <></>
    }

    const party = model.parties[user.partyId]

    if (!party) {
        return <></>
    }

    return <UI.Paper
        variant="outlined"
        sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            height: 54,
            padding: 0,
            margin: 0,
        }}
    >
        <UI.ListItemButton onClick={() => dispatch(['ClickedBanner'])}>
            <UI.ListItemText
                primary={`${store.Profile[party.hostId]?.username ?? "..."}'s party`}
                secondary={`${countUsersInParty(party.partyId, model)} in party`}
            />
        </UI.ListItemButton>

    </UI.Paper>

} 