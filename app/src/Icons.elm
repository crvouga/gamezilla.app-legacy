module Icons exposing (..)

import Element
import Html.Attributes exposing (attribute)
import Svg exposing (g, node, path, svg, text)
import Svg.Attributes exposing (d, fill, id, viewBox)


google : List (Element.Attribute msg) -> Element.Element msg
google attrs =
    Element.el (List.append [ Element.width (Element.px 24), Element.height (Element.px 24) ] attrs)
        (Element.html
            (svg
                [ attribute "height" "100%"
                , attribute "width" "100%"
                , attribute "version" "1.1"
                , viewBox "0 0 24 24"
                , attribute "xmlns" "http://www.w3.org/2000/svg"
                , attribute "xmlns:xlink" "http://www.w3.org/1999/xlink"
                ]
                [ node "title"
                    []
                    [ text "google" ]
                , node "desc"
                    []
                    [ text "Created with sketchtool." ]
                , g [ fill "none", attribute "fill-rule" "evenodd", id "brand", attribute "stroke" "none", attribute "stroke-width" "1" ]
                    [ g [ fill "#fff", attribute "fill-rule" "nonzero", id "google" ]
                        [ path [ d "M11.99,13.9 L11.99,10.18 L21.35,10.18 C21.49,10.81 21.6,11.4 21.6,12.23 C21.6,17.94 17.77,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 C14.7,2 16.96,2.99 18.69,4.61 L15.85,7.37 C15.13,6.69 13.87,5.89 12,5.89 C8.69,5.89 5.99,8.64 5.99,12.01 C5.99,15.38 8.69,18.13 12,18.13 C15.83,18.13 17.24,15.48 17.5,13.91 L11.99,13.91 L11.99,13.9 Z", id "Shape" ]
                            []
                        , text "        "
                        ]
                    ]
                ]
            )
        )
