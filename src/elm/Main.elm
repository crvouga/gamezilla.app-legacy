module Main exposing (CurrentPage(..), Flags, Model, Msg(..), main)

import Browser exposing (Document, UrlRequest)
import Components.BackdropLoader
import Components.Button
import Components.Container
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import InteropDefinitions
import InteropPorts
import LogInMethod
import LogInSession exposing (Model(..))
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


type alias User =
    { userId : String
    }


type alias Flags =
    InteropDefinitions.Flags


type CurrentPage
    = LogInPage Page.Login.Model


type alias Model =
    { page : Page.Login.Model }


initialModel : Model
initialModel =
    { page = Page.Login.initialModel }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialModel, Cmd.none )



-- UPDATE


type Msg
    = LogInPageMsg Page.Login.Msg
    | UrlChanged Url
    | UrlRequested Browser.UrlRequest


updateWith : (subModel -> Model) -> (subMsg -> Msg) -> Model -> ( subModel, Cmd subMsg ) -> ( Model, Cmd Msg )
updateWith toModel toMsg model ( subModel, subCmd ) =
    ( toModel subModel
    , Cmd.map toMsg subCmd
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UrlRequested url ->
            ( model, Cmd.none )

        UrlChanged url ->
            ( model, Cmd.none )

        LogInPageMsg logInPageMsg ->
            let
                ( m, c ) =
                    Page.Login.update logInPageMsg model.page
            in
            ( { model | page = m }, Cmd.map LogInPageMsg c )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- Sub.map
--     (\result ->
--         case result of
--             Ok toElm ->
--                 case toElm of
--                     InteropDefinitions.LoggedIn { userId } ->
--                         LogInSessionChanged (LogIn { page = Page.Login.initialModel })
--                     InteropDefinitions.LoggedOut ->
--                         LogInSessionChanged (LoggedOut { page = Page.Login.initialModel })
--             Err _ ->
--                 LogInSessionChanged (LoggedOut { page = Page.Login.initialModel })
--     )
--     InteropPorts.toElm
-- VIEW


view : Model -> Document Msg
view { page } =
    Document "Log In" [ Html.map LogInPageMsg (Page.Login.view page) ]
