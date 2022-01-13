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
import Utility exposing (isEven, isOdd)



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


type alias Model =
    { authState : Maybe AuthState
    , loginPage : Page.Login.Model
    }


initialModel : Model
initialModel =
    { authState = Nothing
    , loginPage = Page.Login.initialModel
    }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialModel, Cmd.none )



-- UPDATE


type Msg
    = UrlChanged Url
    | UrlRequested Browser.UrlRequest
    | ToElmMsg ToElm
    | ToElmError
    | GotLoginPageMsg Page.Login.Msg


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotLoginPageMsg loginPageMsg ->
            let
                ( nextLoginPageModel, loginPageCmd ) =
                    Page.Login.update loginPageMsg model.loginPage
            in
            ( { model | loginPage = nextLoginPageModel }, Cmd.map GotLoginPageMsg loginPageCmd )

        UrlChanged url ->
            ( model, Cmd.none )

        UrlRequested urlRequest ->
            ( model, Cmd.none )

        ToElmError ->
            ( model, Cmd.none )

        ToElmMsg toElmMsg ->
            case toElmMsg of
                AuthStateChanged authState ->
                    ( { model | authState = Maybe.Just authState }, Cmd.none )



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
    { title = "Gamezilla"
    , body =
        [ Html.map GotLoginPageMsg (Page.Login.view model.loginPage)
        ]
    }
