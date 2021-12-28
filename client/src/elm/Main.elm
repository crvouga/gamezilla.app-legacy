module Main exposing (main)

import Browser exposing (Document)
import Components exposing (container, typography, viewButton)
import Html exposing (Html, div, h6, nav, text)
import Html.Attributes exposing (class, classList)
import Html.Events exposing (onClick)
import List
import Tuple



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
    , snake : List { x : Int, y : Int }
    }


initialModel : Flags -> Model
initialModel flags =
    { count =
        0
    , snake = [ { x = 0, y = 0 }, { x = -1, y = 0 }, { x = -2, y = 0 } ]
    }


cartesian2 : List a -> List b -> List ( a, b )
cartesian2 xs ys =
    List.concatMap
        (\x -> List.map (\y -> ( x, y )) ys)
        xs


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialModel flags, Cmd.none )



-- VIEW


viewCount : Int -> Html msg
viewCount count =
    text ("Count " ++ String.fromInt count)


view : Model -> Document Msg
view model =
    Document "Home"
        [ container []
            [ nav [ class "p-2 flex" ]
                [ h6 [ class "text-xl font-bold flex-1" ] [ text "Home" ]
                ]
            , typography [] [ viewCount model.count ]
            , div
                [ class "flex justify-center items-center w-full"
                ]
                [ viewButton
                    [ class "mr-2"
                    , onClick Increment
                    ]
                    [ text "+"
                    ]
                , viewButton
                    [ onClick Decrement
                    ]
                    [ text "-"
                    ]
                ]
            , div
                [ class "relative flex flex-col w-full"
                ]
                (List.map
                    (\( x, y ) ->
                        div
                            [ class "absolute" ]
                            [ text ("(" ++ String.fromInt x ++ ", " ++ String.fromInt y ++ ")") ]
                    )
                    (cartesian2
                        (List.range 0 10)
                        (List.range 0 10)
                    )
                )
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
