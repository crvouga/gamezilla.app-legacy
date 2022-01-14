module Main exposing (Flags, Model, Msg(..), main)

import Browser exposing (Document, UrlRequest)
import Components.BackdropLoader
import Components.Button
import Components.Container
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import InteropDefinitions exposing (AuthState, ToElm(..))
import InteropPorts
import LogInMethod
import Page.Login
import Url exposing (Url)



-- PROGRAM


main : Program Flags Model Msg
main =
    Browser.application
        { init = \flags url key -> init flags
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlRequest = UrlRequested
        , onUrlChange = UrlChanged
        }



-- MODEL


type alias Flags =
    InteropDefinitions.Flags


type Model
    = Loading
    | Loaded AuthState


initialModel : Model
initialModel =
    Loading


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialModel, Cmd.none )



-- UPDATE


type Msg
    = UrlChanged Url
    | UrlRequested Browser.UrlRequest
    | ToElmMsg ToElm
    | ToElmError


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UrlChanged url ->
            ( model, Cmd.none )

        UrlRequested urlRequest ->
            ( model, Cmd.none )

        ToElmError ->
            ( model, Cmd.none )

        ToElmMsg toElmMsg ->
            case toElmMsg of
                AuthStateChanged authState ->
                    ( Loaded authState, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.map
        (\result ->
            case result of
                Err _ ->
                    ToElmError

                Ok toElmMsg ->
                    ToElmMsg toElmMsg
        )
        InteropPorts.toElm



-- VIEW


view : Model -> Document Msg
view model =
    case model of
        Loading ->
            { title = "Loading"
            , body = [ Components.BackdropLoader.view [] [ Components.BackdropLoader.viewTitle [] [ text "Loading" ] ] ]
            }

        Loaded authState ->
            { title = "Loaded"
            , body = [ Components.BackdropLoader.view [] [ Components.BackdropLoader.viewTitle [] [ text "Loaded" ] ] ]
            }
