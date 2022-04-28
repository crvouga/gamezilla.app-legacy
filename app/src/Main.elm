module Main exposing (..)

import Browser
import Element
import Element.Background as Background
import Element.Border
import Element.Font as Font
import Element.Input as Input
import Icons
import InteropDefinitions exposing (FromElm(..), ToElm(..))
import InteropPorts
import Widgets



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


type alias Flags =
    InteropDefinitions.Flags


type Model
    = Loading
    | Unauthenticated
    | Unauthenticating
    | Authenticating
    | Authenticated


init : () -> ( Model, Cmd Msg )
init _ =
    ( Loading
    , Cmd.none
    )



-- Update


type Msg
    = Greet
    | ToElm InteropDefinitions.ToElm
    | Problem String
    | SignInWithGoogle
    | SignOut


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Greet ->
            ( model, greet "Hello" )

        SignInWithGoogle ->
            ( Authenticating, signIn "sign in" )

        SignOut ->
            ( Unauthenticating, signOut "sign in" )

        ToElm toElm ->
            case toElm of
                SignedIn _ ->
                    ( Authenticated, Cmd.none )

                SignedOut ->
                    ( Unauthenticated, Cmd.none )

        Problem _ ->
            ( model, Cmd.none )


greet : String -> Cmd msg
greet text =
    text
        |> InteropDefinitions.Alert
        |> InteropPorts.fromElm


signIn : String -> Cmd msg
signIn text =
    text
        |> InteropDefinitions.SignIn
        |> InteropPorts.fromElm


signOut : String -> Cmd msg
signOut text =
    text
        |> InteropDefinitions.SignOut
        |> InteropPorts.fromElm



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.map
        (\result ->
            case result of
                Err _ ->
                    Problem "Something went wrong"

                Ok toElm ->
                    ToElm toElm
        )
        InteropPorts.toElm



-- View


view : Model -> Browser.Document Msg
view model =
    case model of
        Loading ->
            loadingLayout "Loading..."

        Unauthenticating ->
            loadingLayout "Signing Out..."

        Authenticating ->
            loadingLayout "Signing in..."

        Unauthenticated ->
            Widgets.layout "Sign In" viewSignInScreen

        Authenticated ->
            Widgets.layout "Sign Out"
                (Element.column
                    [ Element.centerX
                    , Element.centerY
                    , Element.spacing (Widgets.theme.spacing * 2)
                    ]
                    [ Element.el
                        [ Font.size 48
                        , Element.centerX
                        , Element.centerY
                        ]
                        (Element.text "Welcome")
                    , Widgets.button [] { onPress = Just SignOut, label = "Sign Out", icon = Nothing }
                    ]
                )


viewSignInScreen : Element.Element Msg
viewSignInScreen =
    Element.column
        [ Element.centerX
        , Element.centerY
        , Element.spacing (Widgets.theme.spacing * 2)
        , Element.width Element.fill
        , Element.padding (Widgets.theme.spacing * 2)
        ]
        [ Element.el
            [ Font.size 48
            , Element.centerX
            , Element.centerY
            ]
            (Element.text "Gamezilla")
        , Widgets.button []
            { onPress = Just SignInWithGoogle
            , label = "Continue With Google"
            , icon = Just (Icons.google [])
            }
        ]


loadingLayout : String -> Browser.Document msg
loadingLayout title =
    Widgets.layout title
        (Element.column
            [ Element.centerX
            , Element.centerY
            , Element.spacing (Widgets.theme.spacing * 2)
            , Font.color Widgets.theme.fontSecondaryColor
            , Font.size 16
            ]
            [ Widgets.spinner [ Element.centerX ]
            , Element.text title
            ]
        )
