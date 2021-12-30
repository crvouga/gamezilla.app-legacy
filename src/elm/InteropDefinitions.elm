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


type ToElm
    = LoggedIn LoggedInUser


type alias LoggedInUser =
    { userId : String
    }


type alias Flags =
    { greeting : String
    }


fromElm : Encoder FromElm
fromElm =
    TsEncode.union
        (\vLogIn value ->
            case value of
                LogIn method ->
                    vLogIn method
        )
        |> TsEncode.variantTagged "logIn"
            (TsEncode.object
                [ required
                    "method"
                    (\method -> method)
                    LogInMethod.encoder
                ]
            )
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
        ]


flags : Decoder Flags
flags =
    TsDecode.map Flags
        (TsDecode.field "greeting" TsDecode.string)
