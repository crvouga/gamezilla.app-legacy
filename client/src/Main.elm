module Main exposing (main)

import Browser
import Components
import Html
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import List



-- PROGRAM


main : Program Flags Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Flags =
    ()


type alias Model =
    { count : Int
    }


initialModel : Flags -> Model
initialModel flags =
    { count = 0
    }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialModel flags, Cmd.none )



-- VIEW


view : Model -> Browser.Document Msg
view model =
    Browser.Document "Gamezilla"
        [ Components.container { maxWidth = Components.XS }
            [ Components.typography { variant = Components.Header1 } ("Count " ++ String.fromInt model.count)
            , Html.div
                [ class "flex justify-center items-center w-full" ]
                [ Components.button { text = "+", class = "mr-2", onClick = Increment }
                , Components.button { text = "-", class = "", onClick = Decrement }
                ]
            ]
        ]



-- UPDATE


type Msg
    = Increment
    | Decrement


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Increment ->
            ( { model | count = model.count + 1 }, Cmd.none )

        Decrement ->
            ( { model | count = model.count - 1 }, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none
