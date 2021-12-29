module Main exposing (main)

import Browser exposing (Document)
import Components exposing (container, typography, viewButton)
import Direction exposing (Direction)
import Html exposing (Html, button, div, h6, nav, text, time)
import Html.Attributes exposing (class, classList)
import Html.Events exposing (onClick)
import List
import Position exposing (Position)
import Random
import Set exposing (Set)
import Svg exposing (g, rect, svg)
import Svg.Attributes exposing (fill, height, viewBox, width, x, y)
import Svg.Events
import Time
import Utility exposing (isEven, isOdd)



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


type State
    = Idle
    | Playing


type alias Model =
    { state : State
    , head : Position
    , tail : List Position
    , apples : List Position
    , direction : Direction
    , tailLength : Int
    , boundary : Position
    }


initialModel : Flags -> Model
initialModel flags =
    { state = Playing
    , tailLength = 3
    , head = { x = 4, y = 4 }
    , tail =
        [ { x = 3, y = 4 }
        , { x = 2, y = 4 }
        ]
    , apples =
        [ { x = 7, y = 4 } ]
    , direction = Direction.East
    , boundary = { x = 18, y = 18 }
    }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialModel flags, Cmd.none )



-- UPDATE


type Msg
    = SnakeMoved
    | BoardClicked Position
    | ToggleState
    | SpawnApple


updateDirection : Direction -> Model -> Model
updateDirection direction model =
    if model.direction == Direction.opposite direction then
        model

    else
        { model
            | direction = direction
        }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SpawnApple ->
            ( model
            , Cmd.none
            )

        ToggleState ->
            ( { model
                | state =
                    if model.state == Playing then
                        Idle

                    else
                        Playing
              }
            , Cmd.none
            )

        BoardClicked clickedPosition ->
            let
                delta =
                    Position.subtract clickedPosition model.head

                xDirection =
                    if delta.x < 0 then
                        Direction.West

                    else
                        Direction.East

                yDirection =
                    if delta.y < 0 then
                        Direction.North

                    else
                        Direction.South

                nextDirection =
                    case model.direction of
                        Direction.East ->
                            yDirection

                        Direction.West ->
                            yDirection

                        Direction.North ->
                            xDirection

                        Direction.South ->
                            xDirection
            in
            ( updateDirection nextDirection model
            , Cmd.none
            )

        SnakeMoved ->
            let
                nextHead =
                    model.head
                        |> Position.add (Direction.vector model.direction)
                        |> Position.circular model.boundary

                nextTail =
                    (model.head :: model.tail)
                        |> List.take model.tailLength
                        |> List.map (Position.circular model.boundary)

                ( eaten, nonEaten ) =
                    List.partition (Position.equals nextHead) model.apples

                nextModel =
                    { model
                        | head = nextHead
                        , tail = nextTail
                        , apples = nonEaten
                        , tailLength = model.tailLength + List.length eaten
                    }

                nextCommand =
                    if List.length eaten > 0 then
                        -- TODO Spawn Apple
                        Cmd.none

                    else
                        Cmd.none
            in
            ( nextModel
            , nextCommand
            )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.state of
        Playing ->
            Time.every (1000 / 6) (\posfix -> SnakeMoved)

        Idle ->
            Sub.none



-- VIEW


viewCount : Int -> Html msg
viewCount count =
    text ("Count " ++ String.fromInt count)


type Checker
    = Light
    | Dark


toChecker : { x : Int, y : Int } -> Checker
toChecker { x, y } =
    if (isEven x && isEven y) || (isOdd x && isOdd y) then
        Dark

    else
        Light


toColor : Checker -> String
toColor tileColor =
    case tileColor of
        Dark ->
            "#A3D048"

        Light ->
            "#AAD751"


viewPositionChecker : Position -> Svg.Svg msg
viewPositionChecker position =
    rect
        [ x (String.fromInt position.x)
        , y (String.fromInt position.y)
        , width "1"
        , height "1"
        , position |> toChecker |> toColor |> fill
        ]
        []


viewPositionSnake : Position -> Svg.Svg msg
viewPositionSnake position =
    rect
        [ x (String.fromInt position.x)
        , y (String.fromInt position.y)
        , width "1"
        , height "1"
        , fill "#4E7DF7"
        ]
        []


viewPositionApple : Position -> Svg.Svg msg
viewPositionApple position =
    rect
        [ x (String.fromInt position.x)
        , y (String.fromInt position.y)
        , width "1"
        , height "1"
        , fill "#E7491C"
        ]
        []


view : Model -> Document Msg
view model =
    Document "Home"
        [ container []
            [ viewButton [ class "m-2", onClick ToggleState ]
                [ text
                    (if model.state == Playing then
                        "Pause"

                     else
                        "Play"
                    )
                ]
            , svg
                [ width "100%"
                , viewBox
                    (String.join
                        ", "
                        [ "0"
                        , "0"
                        , String.fromInt model.boundary.x
                        , String.fromInt model.boundary.y
                        ]
                    )
                ]
                (List.concat
                    [ List.map viewPositionChecker (Position.all model.boundary)
                    , List.map viewPositionApple model.apples
                    , [ viewPositionSnake model.head ]
                    , List.map viewPositionSnake model.tail
                    , List.map
                        (\position ->
                            rect
                                [ x (String.fromInt position.x)
                                , y (String.fromInt position.y)
                                , width "1"
                                , height "1"
                                , fill "transparent"
                                , Svg.Events.onClick (BoardClicked position)
                                ]
                                []
                        )
                        (Position.all model.boundary)
                    ]
                )
            ]
        ]
