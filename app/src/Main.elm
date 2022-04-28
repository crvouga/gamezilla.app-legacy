module Main exposing (..)

import Browser
import Direction exposing (Direction(..))
import Html exposing (button, text)
import Html.Events exposing (onClick)
import InteropDefinitions exposing (ToElm(..))
import InteropPorts



-- Main


main : Program () Model Msg
main =
    Browser.document
        { update = update
        , view = view
        , subscriptions = subscriptions
        , init = init
        }



-- Model


type alias Flags =
    InteropDefinitions.Flags


type Model
    = Loading
    | Unauthenticated


init : () -> ( Model, Cmd Msg )
init _ =
    ( Loading
    , Cmd.none
    )



-- Update


type Msg
    = Greet
    | ToElm InteropDefinitions.ToElm
    | Problem String
    | SignInWithGoogle


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Greet ->
            ( model, greet "Hello" )

        SignInWithGoogle ->
            ( model, greet "Signing in..." )

        ToElm toElm ->
            case toElm of
                SignedIn _ ->
                    ( model, Cmd.none )

                SignedOut ->
                    ( Unauthenticated, Cmd.none )

        Problem _ ->
            ( model, Cmd.none )


greet : String -> Cmd msg
greet text =
    text
        |> InteropDefinitions.Alert
        |> InteropPorts.fromElm



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.map
        (\result ->
            case result of
                Err _ ->
                    Problem "Something went wrong"

                Ok toElm ->
                    ToElm toElm
        )
        InteropPorts.toElm



-- View


view : Model -> Browser.Document Msg
view model =
    case model of
        Loading ->
            { title = "Loading..."
            , body =
                [ text "Loading..."
                ]
            }

        Unauthenticated ->
            { title = "Gamezilla - Sign In"
            , body =
                [ button [ onClick SignInWithGoogle ] [ text "Sign in with google" ]
                ]
            }
