module Main exposing (..)

import Browser
import Browser.Navigation
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import InteropDefinitions exposing (FromElm(..), ToElm(..))
import InteropPorts
import Url exposing (..)
import View



-- Main


main : Program () Model Msg
main =
    Browser.application
        { update = update
        , view = view
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


view : Model -> Browser.Document Msg
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
            viewAuthenticated


viewLoading : Browser.Document msg
viewLoading =
    { title = "Loading..."
    , body =
        [ View.layout
            [ class "flex justify-center items-center" ]
            [ View.spinner []
            ]
        ]
    }


viewUnauthenticated : Browser.Document Msg
viewUnauthenticated =
    { title = "Sign In"
    , body =
        [ View.layout [ class "flex flex-col justify-center items-center p-4" ]
            [ View.typography [ class "mb-4 text-4xl" ] "Gamezilla"
            , View.button [ class "w-full", onClick SignInWithGoogle ] [ View.typography [] "Continue with Google" ]
            ]
        ]
    }


viewAuthenticated : Browser.Document Msg
viewAuthenticated =
    { title = "Welcome"
    , body =
        [ View.layout [ class "flex flex-col justify-center items-center" ]
            [ View.typography [ class "mb-4 text-4xl" ] "Welcome"
            , View.button [ onClick SignOut ] [ View.typography [] "Sign Out" ]
            ]
        ]
    }
