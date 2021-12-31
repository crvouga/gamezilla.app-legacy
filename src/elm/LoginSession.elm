module LogInSession exposing (Model(..), Msg(..), User, logIn, subscriptions, update)

import Components.Button
import Components.Container
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



-- UPDATE


type Msg
    = LoggedIn User
    | LoggedOut
    | Error


logIn : LogInMethod.LoginInMethod -> Cmd msg
logIn method =
    InteropPorts.fromElm (InteropDefinitions.LogIn method)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Error ->
            ( model, Cmd.none )

        LoggedOut ->
            ( IsLoggedOut, Cmd.none )

        LoggedIn loggedInUser ->
            ( IsLoggedIn loggedInUser, Cmd.none )


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
