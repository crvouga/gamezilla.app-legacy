module Page.Login exposing (Model, Msg, State, initialModel, update, view)

import Container
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (class)
import Icons
import LogInMethod exposing (LoginInMethod)



-- MODEL


type State
    = Idle
    | Redirecting


type alias Model =
    { state : State
    }


initialModel : Model
initialModel =
    { state = Idle
    }



-- UPDATE


type Msg
    = Login LoginInMethod


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Login method ->
            ( { model | state = Redirecting }, Cmd.none )



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
                [ text "Login" ]
            ]
        , div
            [ class "flex flex-row justify-start items-center font-bold p-4 border-b-2 hover:bg-gray-100 active:bg-gray-200 cursor-pointer" ]
            [ div [ class "mr-2" ] [ Icons.google ]
            , div [ class "flex-1" ] [ text "Continue With Google" ]
            , div [] [ Icons.cheveronRight ]
            ]
        ]
