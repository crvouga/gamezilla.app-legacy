module LoginSession exposing (Model(..), Msg(..), User, subscriptions, update, viewLogInSessionButton)

import Button
import Container
import Html exposing (Html, h1, text)
import Html.Attributes exposing (class, disabled)
import Html.Events exposing (onClick)
import InteropDefinitions
import InteropPorts
import LogInMethod


type alias User =
    { userId : String
    }


type Model
    = IsLoading
    | IsLoggedOut
    | IsLoggedIn User


type Msg
    = LogIn LogInMethod.LoginInMethod
    | LoggedIn User
    | LogOut
    | LoggedOut
    | Error


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Error ->
            ( model, Cmd.none )

        LoggedOut ->
            ( IsLoggedOut, Cmd.none )

        LogOut ->
            ( model, InteropPorts.fromElm InteropDefinitions.LogOut )

        LoggedIn loggedInUser ->
            ( IsLoggedIn loggedInUser, Cmd.none )

        LogIn method ->
            ( model, InteropPorts.fromElm (InteropDefinitions.LogIn method) )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.map
        (\result ->
            case result of
                Ok toElm ->
                    case toElm of
                        InteropDefinitions.LoggedIn x ->
                            LoggedIn x

                        InteropDefinitions.LoggedOut ->
                            LoggedOut

                Err _ ->
                    Error
        )
        InteropPorts.toElm


viewLogInSessionButton : Model -> Html Msg
viewLogInSessionButton model =
    case model of
        IsLoggedIn loggedInUser ->
            Container.view []
                [ h1 [] [ text ("userId = " ++ loggedInUser.userId) ]
                , Button.view
                    [ class "m-2"
                    , onClick LogOut
                    ]
                    [ text "Log Out"
                    ]
                ]

        IsLoggedOut ->
            Button.view
                [ class "m-2"
                , onClick (LogIn LogInMethod.Google)
                ]
                [ text "Log In With Google"
                ]

        IsLoading ->
            Button.view
                [ class "m-2 bg-gray-400 hover:bg-gray-400"
                , disabled True
                ]
                [ text "Loading"
                ]
