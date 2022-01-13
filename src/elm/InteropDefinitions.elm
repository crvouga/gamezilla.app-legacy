module InteropDefinitions exposing (AuthState, Flags, FromElm(..), LoggedInUser, ToElm(..), interop)

import Json.Encode
import LogInMethod exposing (LoginInMethod)
import TsJson.Decode as Decode exposing (Decoder)
import TsJson.Decode.Pipeline as DecodePipeline
import TsJson.Encode as Encode exposing (Encoder, optional, required)


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
    = LogIn LoginInMethod
    | LogOut


type alias LoggedInUser =
    { userId : String }


type AuthState
    = LoggedIn LoggedInUser
    | LoggedOut


type ToElm
    = AuthStateChanged AuthState


type alias Flags =
    { greeting : String
    }



-- ENCODERS


logInEncoder : Encoder LogInMethod.LoginInMethod
logInEncoder =
    Encode.object
        [ required
            "method"
            (\method -> method)
            LogInMethod.encoder
        ]


logOutEncoder : Encoder ()
logOutEncoder =
    Encode.object []


fromElm : Encoder FromElm
fromElm =
    Encode.union
        (\vLogIn vLogOut value ->
            case value of
                LogIn method ->
                    vLogIn method

                LogOut ->
                    vLogOut
        )
        |> Encode.variantTagged "logIn" logInEncoder
        |> Encode.variant0 "logOut"
        |> Encode.buildUnion



-- DECODERS


authStateDecoder : Decoder AuthState
authStateDecoder =
    Decode.discriminatedUnion "type"
        [ ( "LoggedOut", Decode.succeed LoggedOut )
        , ( "LoggedIn"
          , Decode.succeed
                (\userId -> LoggedIn { userId = userId })
                |> Decode.andMap (Decode.field "userId" Decode.string)
          )
        ]


toElm : Decoder ToElm
toElm =
    Decode.discriminatedUnion "tag"
        [ ( "authStateChanged"
          , Decode.map AuthStateChanged authStateDecoder
          )
        ]



-- FLAGS


flags : Decoder Flags
flags =
    Decode.map Flags
        (Decode.field "greeting" Decode.string)
