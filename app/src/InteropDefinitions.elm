module InteropDefinitions exposing (Flags, FromElm(..), ToElm(..), interop)

import TsJson.Decode as TsDecode exposing (Decoder)
import TsJson.Encode as TsEncode exposing (Encoder, required)


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
    = Alert String
    | SignIn String
    | SignOut String


type ToElm
    = SignedIn User
    | SignedOut


type alias User =
    { userId : String }


type alias Flags =
    {}


fromElm : Encoder FromElm
fromElm =
    TsEncode.union
        (\vAlert vSignIn vSignOut value ->
            case value of
                Alert string ->
                    vAlert string

                SignIn string ->
                    vSignIn string

                SignOut string ->
                    vSignOut string
        )
        |> TsEncode.variantTagged "Alert"
            (TsEncode.object [ required "message" identity TsEncode.string ])
        |> TsEncode.variantTagged "SignIn"
            (TsEncode.object [ required "message" identity TsEncode.string ])
        |> TsEncode.variantTagged "SignOut"
            (TsEncode.object [ required "message" identity TsEncode.string ])
        |> TsEncode.buildUnion


toElm : Decoder ToElm
toElm =
    TsDecode.discriminatedUnion "tag"
        [ ( "SignedIn"
          , TsDecode.map SignedIn
                (TsDecode.map User
                    (TsDecode.field "userId" TsDecode.string)
                )
          )
        , ( "SignedOut", TsDecode.succeed SignedOut )
        ]


flags : Decoder Flags
flags =
    TsDecode.null {}
