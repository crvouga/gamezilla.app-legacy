module LogInMethod exposing (LogInMethod(..), encoder)

import Json.Encode
import TsJson.Encode exposing (Encoder, buildUnion, union, variantLiteral)


type LogInMethod
    = Google
    | Facebook


toString : LogInMethod -> String
toString method =
    case method of
        Google ->
            "Google"

        Facebook ->
            "Facebook"


encoder : Encoder LogInMethod
encoder =
    union
        (\vGoogle vFacebook value ->
            case value of
                Google ->
                    vGoogle

                Facebook ->
                    vFacebook
        )
        |> variantLiteral (Json.Encode.string (toString Google))
        |> variantLiteral (Json.Encode.string (toString Facebook))
        |> buildUnion
