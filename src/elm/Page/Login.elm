module Page.Login exposing (Model, Msg, initialModel, update, view)

import BackdropLoader
import Container
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import Icons
import InteropPorts
import LogInMethod exposing (LoginInMethod)
import LogInSession



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
            ( Redirecting method, LogInSession.logIn method )



-- VIEW


view : Model -> Html Msg
view model =
    div []
        [ div
            [ class "w-full p-2 border-b-2"
            ]
            [ h1
                [ class "text-xl font-bold flex items-center justify-center flex-1"
                ]
                [ text "Log In" ]
            ]
        , div
            [ class "flex flex-row justify-start items-center font-bold p-4 border-b-2 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
            , onClick (LogIn LogInMethod.Google)
            ]
            [ div [ class "mr-2" ] [ Icons.google ]
            , div [ class "flex-1" ] [ text "Continue With Google" ]
            , div [] [ Icons.cheveronRight ]
            ]
        , div []
            (case model of
                Idle ->
                    []

                Redirecting logInMethod ->
                    [ BackdropLoader.view
                        { title =
                            "Redirecting..."
                        }
                    ]
            )
        ]
