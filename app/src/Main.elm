module Main exposing (..)

import Browser
import Browser.Navigation
import Element
import Element.Font as Font
import Icons
import InteropDefinitions exposing (FromElm(..), ToElm(..))
import InteropPorts
import Url exposing (..)
import Widgets



-- Main


main : Program () Model Msg
main =
    Browser.application
        { update = update
        , view =
            \model ->
                { title = "Gamezilla"
                , body = [ Widgets.layout (view model) ]
                }
        , subscriptions = subscriptions
        , init = init
        , onUrlChange = \url -> ChangedUrl url
        , onUrlRequest = \urlRequest -> ClickedLink urlRequest
        }



-- Model


type alias Flags =
    InteropDefinitions.Flags


type Status
    = Loading
    | Unauthenticated
    | Unauthenticating
    | Authenticating
    | Authenticated


type alias Model =
    { status : Status
    , navKey : Browser.Navigation.Key
    }


init : () -> Url.Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init _ _ navKey =
    ( { status = Loading, navKey = navKey }
    , Cmd.none
    )



-- Update


type Msg
    = Greet
    | ToElm InteropDefinitions.ToElm
    | Problem String
    | SignInWithGoogle
    | SignOut
    | ChangedUrl Url
    | ClickedLink Browser.UrlRequest


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ClickedLink urlRequest ->
            case urlRequest of
                Browser.Internal url ->
                    case url.fragment of
                        Nothing ->
                            ( model, Cmd.none )

                        Just _ ->
                            ( model
                            , Browser.Navigation.pushUrl model.navKey (Url.toString url)
                            )

                Browser.External href ->
                    ( model
                    , Browser.Navigation.load href
                    )

        ChangedUrl _ ->
            ( model, Cmd.none )

        Greet ->
            ( model, greet "Hello" )

        SignInWithGoogle ->
            ( { model | status = Authenticating }, signIn "sign in" )

        SignOut ->
            ( { model | status = Unauthenticating }, signOut "sign in" )

        ToElm toElm ->
            case toElm of
                SignedIn _ ->
                    ( { model | status = Authenticated }, Cmd.none )

                SignedOut ->
                    ( { model | status = Unauthenticated }, Cmd.none )

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


view : Model -> Element.Element Msg
view model =
    case model.status of
        Loading ->
            viewLoading

        Unauthenticating ->
            viewLoading

        Authenticating ->
            viewLoading

        Unauthenticated ->
            viewUnauthenticated

        Authenticated ->
            viewAuthenicated


viewAuthenicated : Element.Element Msg
viewAuthenicated =
    Element.column
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


viewUnauthenticated : Element.Element Msg
viewUnauthenticated =
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


viewLoading : Element.Element Msg
viewLoading =
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
            (Element.text "Loading...")
        ]
