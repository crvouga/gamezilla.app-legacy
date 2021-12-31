module Main exposing (Flags, Model, Msg, main)

import Browser exposing (Document, UrlRequest)
import Button
import Container
import Direction exposing (Direction)
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import InteropDefinitions
import InteropPorts
import List
import LogInMethod
import LoginSession
import Page.Login
import Position exposing (Position)
import Random
import Set exposing (Set)
import Snake
import Svg exposing (rect, svg)
import Svg.Attributes exposing (fill, height, viewBox, width, x, y)
import Svg.Events
import Time
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


type Model
    = LogInPage Page.Login.Model


initialModel : Model
initialModel =
    LogInPage Page.Login.initialModel


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialModel, Cmd.none )



-- UPDATE


type Msg
    = LogInPageMsg Page.Login.Msg
    | Noop
    | UrlChanged Url
    | UrlRequested Browser.UrlRequest


updateWith : (subModel -> Model) -> (subMsg -> Msg) -> Model -> ( subModel, Cmd subMsg ) -> ( Model, Cmd Msg )
updateWith toModel toMsg model ( subModel, subCmd ) =
    ( toModel subModel
    , Cmd.map toMsg subCmd
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( model, msg ) of
        ( _, UrlRequested _ ) ->
            ( model, Cmd.none )

        ( _, UrlChanged _ ) ->
            ( model, Cmd.none )

        ( LogInPage logInPageModel, LogInPageMsg logInPageMsg ) ->
            updateWith LogInPage LogInPageMsg model (Page.Login.update logInPageMsg logInPageModel)

        ( _, _ ) ->
            ( model, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- VIEW


view : Model -> Document Msg
view model =
    case model of
        LogInPage logInPageModel ->
            Document "Log In" [ Html.map LogInPageMsg (Page.Login.view logInPageModel) ]
