module Main exposing (main)

import Browser exposing (Document)
import Components exposing (container, typography, viewButton)
import Html exposing (Html, button, div, h6, nav, text, time)
import Html.Attributes exposing (class, classList)
import Html.Events exposing (onClick)
import List
import Set exposing (Set)
import Svg exposing (g, rect, svg)
import Svg.Attributes exposing (fill, height, viewBox, width, x, y)
import Time
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


type alias Position =
    { x : Int, y : Int }


add : Position -> Position -> Position
add a b =
    { x = a.x + b.x
    , y = a.y + b.y
    }


type alias Model =
    { head : Position
    , tail : List Position
    , apples : List Position
    , direction : Direction
    , tailLength : Int
    , boundary : { x : Int, y : Int }
    }


type Direction
    = North
    | South
    | East
    | West


toOpposite : Direction -> Direction
toOpposite direction =
    case direction of
        North ->
            South

        South ->
            North

        West ->
            East

        East ->
            West


toPositionVector : Direction -> { x : number, y : number }
toPositionVector direction =
    case direction of
        North ->
            { x = 0, y = -1 }

        South ->
            { x = 0, y = 1 }

        East ->
            { x = 1, y = 0 }

        West ->
            { x = -1, y = 0 }


initialModel : Flags -> Model
initialModel flags =
    { tailLength = 3
    , head =
        { x = 4
        , y = 4
        }
    , tail =
        [ { x = 3
          , y = 4
          }
        , { x = 2
          , y = 4
          }
        ]
    , apples =
        [ { x = 7
          , y = 4
          }
        ]
    , direction = East
    , boundary =
        { x = 12
        , y = 12
        }
    }


cartesian2 : List a -> List b -> List ( a, b )
cartesian2 xs ys =
    List.concatMap
        (\x -> List.map (\y -> ( x, y )) ys)
        xs


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialModel flags, Cmd.none )


allPositions : { x : Int, y : Int } -> List { x : Int, y : Int }
allPositions boundary =
    List.map
        (\( x, y ) -> { x = x, y = y })
        (cartesian2
            (List.range 0 boundary.x)
            (List.range 0 boundary.y)
        )



-- VIEW


viewCount : Int -> Html msg
viewCount count =
    text ("Count " ++ String.fromInt count)


isEven : Int -> Bool
isEven n =
    modBy 2 n == 0


isOdd : Int -> Bool
isOdd n =
    not (isEven n)


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
        , fill (toColor (toChecker position))
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
            [ nav [ class "p-2 flex" ]
                [ h6 [ class "text-xl font-bold flex-1" ] [ text "Home" ]
                ]
            , svg
                [ class "relative flex flex-col w-full"
                , width "100%"
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
                    [ List.map viewPositionChecker (allPositions model.boundary)
                    , List.map viewPositionApple model.apples
                    , [ viewPositionSnake model.head ]
                    , List.map viewPositionSnake model.tail
                    ]
                )
            , div [ class "flex" ]
                [ button [ class "w-full h-full p-4", onClick (SnakeTurned West) ] [ text "West" ]
                , button [ class "w-full h-full p-4", onClick (SnakeTurned East) ] [ text "East" ]
                , button [ class "w-full h-full p-4", onClick (SnakeTurned North) ] [ text "North" ]
                , button [ class "w-full h-full p-4", onClick (SnakeTurned South) ] [ text "South" ]
                ]
            ]
        ]



-- UPDATE


type Msg
    = SnakeMoved
    | SnakeTurned Direction


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SnakeTurned direction ->
            ( { model
                | direction =
                    if model.direction == toOpposite direction then
                        model.direction

                    else
                        direction
              }
            , Cmd.none
            )

        SnakeMoved ->
            let
                nextModel =
                    { model
                        | head =
                            add model.head (toPositionVector model.direction)
                        , tail =
                            List.take model.tailLength (model.head :: model.tail)
                    }

                applesEaten =
                    List.filter
                        (\apple ->
                            apple.x
                                == nextModel.head.x
                                && apple.y
                                == nextModel.head.y
                        )
                        nextModel.apples
            in
            if List.length applesEaten == 0 then
                ( nextModel
                , Cmd.none
                )

            else
                ( nextModel
                , Cmd.none
                )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Time.every (1000 / 3) (\posfix -> SnakeMoved)
