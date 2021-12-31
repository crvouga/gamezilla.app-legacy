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
    = LoginPage Page.Login.Model


initialModel : Model
initialModel =
    LoginPage Page.Login.initialModel


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialModel, Cmd.none )



-- UPDATE


type Msg
    = LoginPageMsg Page.Login.Msg
    | Noop
    | UrlChanged Url
    | UrlRequested Browser.UrlRequest


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Noop ->
            ( model, Cmd.none )

        UrlRequested _ ->
            ( model, Cmd.none )

        UrlChanged _ ->
            ( model, Cmd.none )

        LoginPageMsg loginPageMsg ->
            ( model, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- VIEW


view : Model -> Document Msg
view model =
    case model of
        LoginPage loginPageModel ->
            Document "Login" [ Html.map LoginPageMsg (Page.Login.view loginPageModel) ]
