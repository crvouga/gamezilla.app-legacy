module Snake exposing (..)

import Browser.Events
import Direction exposing (Direction(..))
import Html exposing (Html, div)
import Json.Decode as Decode
import Position exposing (Position)
import Status exposing (Status(..))
import Svg exposing (g, rect, svg)
import Svg.Attributes exposing (fill, height, viewBox, width)
import Time



-- Model


type alias Model =
    { status : Status
    , head : Position
    , tail : List Position
    , apples : List Position
    , topLeft : Position
    , bottomRight : Position
    , direction : Direction
    , tailLength : Int
    }


init : Model
init =
    { status = Status.Paused
    , head = { x = 4, y = 6 }
    , tail = [ { x = 3, y = 6 }, { x = 2, y = 6 } ]
    , apples = [ { x = 7, y = 6 } ]
    , topLeft = { x = 0, y = 0 }
    , bottomRight = { x = 12, y = 18 }
    , direction = Direction.East
    , tailLength = 3
    }



-- Update


type Msg
    = Step
    | KeyBoardPressed Key


type Key
    = ArrowDown
    | ArrowUp
    | ArrowLeft
    | ArrowRight
    | W
    | A
    | S
    | D
    | SpaceBar
    | Unknown


keyToDirection : Key -> Maybe Direction
keyToDirection key =
    case key of
        ArrowDown ->
            Just South

        ArrowUp ->
            Just North

        ArrowRight ->
            Just East

        ArrowLeft ->
            Just West

        S ->
            Just South

        W ->
            Just North

        D ->
            Just East

        A ->
            Just West

        _ ->
            Nothing


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case model.status of
        Paused ->
            case msg of
                Step ->
                    ( model, Cmd.none )

                KeyBoardPressed key ->
                    let
                        nextStatus =
                            case key of
                                SpaceBar ->
                                    Status.toggle model.status

                                _ ->
                                    model.status
                    in
                    ( { model
                        | status = nextStatus
                      }
                    , Cmd.none
                    )

        Playing ->
            case msg of
                Step ->
                    if model.status == Status.Paused then
                        ( model, Cmd.none )

                    else
                        let
                            nextTail =
                                List.take model.tailLength (List.append [ model.head ] model.tail)

                            nextHead =
                                Position.add model.head (Direction.vector model.direction)
                        in
                        ( { model | tail = nextTail, head = nextHead }
                        , Cmd.none
                        )

                KeyBoardPressed key ->
                    let
                        nextDirection =
                            keyToDirection key
                                |> Maybe.withDefault model.direction
                                |> (\direction ->
                                        if direction == Direction.opposite model.direction then
                                            model.direction

                                        else
                                            direction
                                   )

                        nextStatus =
                            case key of
                                SpaceBar ->
                                    Status.toggle model.status

                                _ ->
                                    model.status
                    in
                    ( { model
                        | direction = nextDirection
                        , status = nextStatus
                      }
                    , Cmd.none
                    )



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ case model.status of
            Playing ->
                Time.every 200 (\_ -> Step)

            Paused ->
                Sub.none
        , Sub.map KeyBoardPressed (Browser.Events.onKeyDown keyDownDecoder)
        ]


keyDownDecoder : Decode.Decoder Key
keyDownDecoder =
    Decode.map toKey (Decode.field "key" Decode.string)


toKey : String -> Key
toKey key =
    case key of
        "ArrowLeft" ->
            ArrowLeft

        "ArrowRight" ->
            ArrowRight

        "ArrowDown" ->
            ArrowDown

        "ArrowUp" ->
            ArrowUp

        "W" ->
            W

        "A" ->
            A

        "S" ->
            S

        "D" ->
            D

        "w" ->
            W

        "a" ->
            A

        "s" ->
            S

        "d" ->
            D

        " " ->
            SpaceBar

        _ ->
            Unknown



-- View


view : Model -> Html Msg
view model =
    div [] [ viewBoard model ]


viewBoard : Model -> Html Msg
viewBoard model =
    svg
        [ width "100%"
        , viewBox (toViewBox model)
        ]
        [ viewGrid model
        , viewApples model
        , viewSnake model
        ]


toViewBox : Model -> String
toViewBox model =
    [ model.topLeft.x, model.topLeft.y, model.bottomRight.x, model.bottomRight.y ]
        |> List.map String.fromInt
        |> List.intersperse " "
        |> String.concat


viewGrid : Model -> Html Msg
viewGrid model =
    g []
        (List.map
            (\position ->
                rect
                    [ width "1"
                    , height "1"
                    , fill "white"
                    , Svg.Attributes.stroke "black"
                    , Svg.Attributes.strokeWidth "0.1"
                    , Svg.Attributes.x (String.fromInt position.x)
                    , Svg.Attributes.y (String.fromInt position.y)
                    ]
                    []
            )
            (Position.range model.topLeft model.bottomRight)
        )


viewApples : Model -> Html Msg
viewApples model =
    g []
        (List.map
            (\position ->
                rect
                    [ width "1"
                    , height "1"
                    , fill "red"
                    , Svg.Attributes.x (String.fromInt position.x)
                    , Svg.Attributes.y (String.fromInt position.y)
                    ]
                    []
            )
            model.apples
        )


viewSnake : Model -> Html Msg
viewSnake model =
    g []
        (List.map
            (\position ->
                rect
                    [ width "1"
                    , height "1"
                    , fill "blue"
                    , Svg.Attributes.x (String.fromInt position.x)
                    , Svg.Attributes.y (String.fromInt position.y)
                    ]
                    []
            )
            (List.append [ model.head ] model.tail)
        )
