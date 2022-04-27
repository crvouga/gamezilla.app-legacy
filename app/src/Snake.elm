module Snake exposing (..)

import Direction exposing (Direction(..))
import Html exposing (Html, div)
import Position exposing (Position)
import Svg exposing (g, rect, svg)
import Svg.Attributes exposing (fill, height, viewBox, width)
import Time



-- Model


type alias Model =
    { head : Position
    , tail : List Position
    , apples : List Position
    , topLeft : Position
    , bottomRight : Position
    , direction : Direction
    , tailLength : Int
    }


init : Model
init =
    { head = { x = 4, y = 6 }
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


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Step ->
            ( step model, Cmd.none )


step : Model -> Model
step model =
    { model
        | head = nextHead model
        , tail = nextTail model
    }


nextHead : Model -> Position
nextHead model =
    Position.add model.head (Direction.vector model.direction)


nextTail : Model -> List Position
nextTail model =
    List.take model.tailLength (List.append [ model.head ] model.tail)



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions _ =
    Time.every 500 (\_ -> Step)



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
