module Main exposing (..)

import Browser
import Html exposing (Html)
import Set exposing (Set)
import Svg exposing (g, rect, svg)
import Svg.Attributes exposing (fill, height, viewBox, width)



-- Main


main : Program () Model Msg
main =
    Browser.document
        { update = update
        , view = view
        , subscriptions = subscriptions
        , init = init
        }



-- Model


type alias Position =
    ( Int, Int )


equals : Position -> Position -> Bool
equals ( x1, y1 ) ( x2, y2 ) =
    x1 == x2 && y1 == y2


cartesianProduct : List a -> List b -> List ( a, b )
cartesianProduct xs ys =
    List.concatMap
        (\x -> List.map (\y -> ( x, y )) ys)
        xs


range : Position -> Position -> List Position
range ( x1, y1 ) ( x2, y2 ) =
    cartesianProduct (List.range x1 x2) (List.range y1 y2)


type alias Model =
    { head : Position
    , tail : List Position
    , apples : List Position
    , topLeft : Position
    , bottomRight : Position
    }


init : flags -> ( Model, Cmd Msg )
init _ =
    ( { head = ( 4, 6 )
      , tail = [ ( 3, 6 ), ( 2, 6 ) ]
      , apples = [ ( 7, 6 ) ]
      , topLeft = ( 0, 0 )
      , bottomRight = ( 12, 12 )
      }
    , Cmd.none
    )



-- Update


type Msg
    = Increment
    | Decrement


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Increment ->
            ( model, Cmd.none )

        Decrement ->
            ( model, Cmd.none )



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none



-- View


view : Model -> Browser.Document Msg
view model =
    { title = "Gamezilla"
    , body =
        [ viewBoard model
        ]
    }


viewBoard : Model -> Html Msg
viewBoard model =
    svg
        [ width "100%"
        , viewBox "0 0 12 12"
        ]
        [ viewBoardGrid model
        , viewApples model
        , viewBoardSnake model
        ]


viewBoardGrid : Model -> Html Msg
viewBoardGrid model =
    g []
        (List.map
            (\( x, y ) ->
                rect
                    [ width "1"
                    , height "1"
                    , fill "white"
                    , Svg.Attributes.stroke "black"
                    , Svg.Attributes.strokeWidth "0.1"
                    , Svg.Attributes.x (String.fromInt x)
                    , Svg.Attributes.y (String.fromInt y)
                    ]
                    []
            )
            (range model.topLeft model.bottomRight)
        )


viewApples : Model -> Html Msg
viewApples model =
    g []
        (List.map
            (\( x, y ) ->
                rect
                    [ width "1"
                    , height "1"
                    , fill "red"
                    , Svg.Attributes.x (String.fromInt x)
                    , Svg.Attributes.y (String.fromInt y)
                    ]
                    []
            )
            model.apples
        )


viewBoardSnake : Model -> Html Msg
viewBoardSnake model =
    g []
        (List.map
            (\( x, y ) ->
                rect
                    [ width "1"
                    , height "1"
                    , fill "blue"
                    , Svg.Attributes.x (String.fromInt x)
                    , Svg.Attributes.y (String.fromInt y)
                    ]
                    []
            )
            (List.append [ model.head ] model.tail)
        )
