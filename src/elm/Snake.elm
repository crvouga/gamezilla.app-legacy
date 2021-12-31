module Snake exposing (Model, Msg, State(..), initialModel, subscriptions, update, view)

import Browser exposing (Document)
import Components.Button
import Components.Container
import Direction exposing (Direction)
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import InteropDefinitions
import InteropPorts
import List
import Position exposing (Position)
import Random
import Set exposing (Set)
import Svg exposing (rect, svg)
import Svg.Attributes exposing (fill, height, viewBox, width, x, y)
import Svg.Events
import Time
import Utility exposing (isEven, isOdd)



-- MODEL


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


initialModel : Model
initialModel =
    { state = Idle
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
            let
                nextState : State
                nextState =
                    if model.state == Playing then
                        Idle

                    else
                        Playing

                nextModel : Model
                nextModel =
                    { model
                        | state = nextState
                    }
            in
            ( nextModel
            , Cmd.none
            )

        BoardClicked clickedPosition ->
            let
                delta : Position
                delta =
                    Position.subtract clickedPosition model.head

                xDirection : Direction
                xDirection =
                    if delta.x < 0 then
                        Direction.West

                    else
                        Direction.East

                yDirection : Direction
                yDirection =
                    if delta.y < 0 then
                        Direction.North

                    else
                        Direction.South

                nextDirection : Direction
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
                nextHead : Position
                nextHead =
                    model.head
                        |> Position.add (Direction.vector model.direction)
                        |> Position.circular model.boundary

                nextTail : List Position
                nextTail =
                    (model.head :: model.tail)
                        |> List.take model.tailLength
                        |> List.map (Position.circular model.boundary)

                ( eaten, nonEaten ) =
                    List.partition (Position.equals nextHead) model.apples

                nextModel : Model
                nextModel =
                    { model
                        | head = nextHead
                        , tail = nextTail
                        , apples = nonEaten
                        , tailLength = model.tailLength + List.length eaten
                    }

                nextCommand : Cmd Msg
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


toCheckColor : Position -> String
toCheckColor { x, y } =
    if (isEven x && isEven y) || (isOdd x && isOdd y) then
        "#A3D048"

    else
        "#AAD751"


viewToggleStateText : State -> String
viewToggleStateText state =
    case state of
        Playing ->
            "Pause"

        Idle ->
            "Play"


view : Model -> Html Msg
view model =
    Container.view []
        [ Button.view
            [ class "m-2"
            , onClick ToggleState
            ]
            [ text (viewToggleStateText model.state)
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
                [ -- Checkers
                  List.map
                    (\position ->
                        rect
                            [ x (String.fromInt position.x)
                            , y (String.fromInt position.y)
                            , width "1"
                            , height "1"
                            , fill (toCheckColor position)
                            , Svg.Events.onClick (BoardClicked position)
                            ]
                            []
                    )
                    (Position.all model.boundary)

                -- Apples
                , List.map
                    (\position ->
                        rect
                            [ x (String.fromInt position.x)
                            , y (String.fromInt position.y)
                            , width "1"
                            , height "1"
                            , fill "#E7491C"
                            ]
                            []
                    )
                    model.apples

                -- Snake
                , List.map
                    (\position ->
                        rect
                            [ x (String.fromInt position.x)
                            , y (String.fromInt position.y)
                            , width "1"
                            , height "1"
                            , fill "#4E7DF7"
                            ]
                            []
                    )
                    (model.head :: model.tail)
                ]
            )
        ]
