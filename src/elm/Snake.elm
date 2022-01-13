module Snake exposing (Model, Msg, State(..), initialModel, subscriptions, update, view)

-- POSITION

import Browser exposing (Document)
import Components.Button
import Components.Container
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import InteropDefinitions
import InteropPorts
import List exposing (map, range)
import Random
import Set exposing (Set)
import Svg exposing (rect, svg)
import Svg.Attributes exposing (fill, height, viewBox, width, x, y)
import Svg.Events
import Time


type alias Position =
    { x : Int, y : Int }


add : Position -> Position -> Position
add a b =
    { x = a.x + b.x
    , y = a.y + b.y
    }


subtract : Position -> Position -> Position
subtract a b =
    { x = a.x - b.x
    , y = a.y - b.y
    }


equals : Position -> Position -> Bool
equals a b =
    a.x == b.x && a.y == b.y


circular : Position -> Position -> Position
circular bounds position =
    { x = modBy bounds.x position.x
    , y = modBy bounds.y position.y
    }


cartesian2 : List a -> List b -> List ( a, b )
cartesian2 xs ys =
    List.concatMap
        (\x -> List.map (\y -> ( x, y )) ys)
        xs


all : Position -> List Position
all bounds =
    cartesian2 (range 0 bounds.x) (range 0 bounds.y)
        |> map (\( x, y ) -> { x = x, y = y })



-- DIRECTIOn


type Direction
    = North
    | South
    | East
    | West


opposite : Direction -> Direction
opposite direction =
    case direction of
        North ->
            South

        South ->
            North

        West ->
            East

        East ->
            West


vector : Direction -> { x : Int, y : Int }
vector direction =
    case direction of
        North ->
            { x = 0
            , y = -1
            }

        South ->
            { x = 0
            , y = 1
            }

        East ->
            { x = 1
            , y = 0
            }

        West ->
            { x = -1
            , y = 0
            }



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
    , direction = East
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
    if model.direction == opposite direction then
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
                    subtract clickedPosition model.head

                xDirection : Direction
                xDirection =
                    if delta.x < 0 then
                        West

                    else
                        East

                yDirection : Direction
                yDirection =
                    if delta.y < 0 then
                        North

                    else
                        South

                nextDirection : Direction
                nextDirection =
                    case model.direction of
                        East ->
                            yDirection

                        West ->
                            yDirection

                        North ->
                            xDirection

                        South ->
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
                        |> add (vector model.direction)
                        |> circular model.boundary

                nextTail : List Position
                nextTail =
                    (model.head :: model.tail)
                        |> List.take model.tailLength
                        |> List.map (circular model.boundary)

                ( eaten, nonEaten ) =
                    List.partition (equals nextHead) model.apples

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


isEven : Int -> Bool
isEven n =
    modBy 2 n == 0


isOdd : Int -> Bool
isOdd n =
    not (isEven n)


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
    Components.Container.view []
        [ Components.Button.view
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
                    (all model.boundary)

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
