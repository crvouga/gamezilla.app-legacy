module InteropDefinitions exposing (Flags, FromElm(..), LoggedInUser, ToElm(..), interop)

import Json.Encode
import LogInMethod
import TsJson.Decode as TsDecode exposing (Decoder)
import TsJson.Encode as TsEncode exposing (Encoder, optional, required)


interop :
    { toElm : Decoder ToElm
    , fromElm : Encoder FromElm
    , flags : Decoder Flags
    }
interop =
    { toElm = toElm
    , fromElm = fromElm
    , flags = flags
    }


type FromElm
    = LogIn LogInMethod.LoginInMethod
    | LogOut


type ToElm
    = LoggedIn LoggedInUser
    | LoggedOut


type alias LoggedInUser =
    { userId : String
    }


type alias Flags =
    { greeting : String
    }


logInEncoder : Encoder LogInMethod.LoginInMethod
logInEncoder =
    TsEncode.object
        [ required
            "method"
            (\method -> method)
            LogInMethod.encoder
        ]


logOutEncoder : Encoder ()
logOutEncoder =
    TsEncode.object []


fromElm : Encoder FromElm
fromElm =
    TsEncode.union
        (\vLogIn vLogOut value ->
            case value of
                LogIn method ->
                    vLogIn method

                LogOut ->
                    vLogOut
        )
        |> TsEncode.variantTagged "logIn" logInEncoder
        |> TsEncode.variant0 "logOut"
        |> TsEncode.buildUnion


toElm : Decoder ToElm
toElm =
    TsDecode.discriminatedUnion "tag"
        [ ( "loggedIn"
          , TsDecode.map LoggedIn
                (TsDecode.map LoggedInUser
                    (TsDecode.field "userId" TsDecode.string)
                )
          )
        , ( "loggedOut", TsDecode.succeed LoggedOut )
        ]


flags : Decoder Flags
flags =
    TsDecode.map Flags
        (TsDecode.field "greeting" TsDecode.string)
