module Page.Login exposing (Model, Msg, initialModel, update, view)

import Components.BackdropLoader
import Components.Container
import Components.Icons
import Components.Item
import Components.PageBar
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import InteropDefinitions
import InteropPorts
import LogInMethod exposing (LoginInMethod)



-- MODEL


type Model
    = Idle
    | Redirecting LoginInMethod


initialModel : Model
initialModel =
    Idle



-- UPDATE


type Msg
    = LogIn LoginInMethod


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        LogIn method ->
            ( Redirecting method, InteropPorts.fromElm (InteropDefinitions.LogIn method) )



-- VIEW


view : Model -> Html Msg
view model =
    Components.Container.view []
        [ Components.PageBar.view []
            [ Components.PageBar.viewTitle []
                [ text "Log In" ]
            ]
        , Components.Item.view [ onClick (LogIn LogInMethod.Google) ]
            [ Components.Item.viewStart [] [ Components.Icons.google ]
            , Components.Item.viewCenter [] [ text "Continue With Google" ]
            , Components.Item.viewEnd [] [ Components.Icons.cheveronRight ]
            ]
        , case model of
            Idle ->
                div [] []

            Redirecting _ ->
                Components.BackdropLoader.view [] [ Components.BackdropLoader.viewTitle [] [ text "Redirecting..." ] ]
        ]
