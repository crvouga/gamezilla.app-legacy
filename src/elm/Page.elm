module Page exposing (Model, Msg, initialModel)

import Browser exposing (Document)
import Html exposing (Html)
import Page.Login
import Url exposing (Url)



-- MODEL


type Model
    = PageLogin Page.Login.Model


initialModel : Model
initialModel =
    PageLogin Page.Login.initialModel



-- UPDATE


type Msg
    = GotPageLoginMsg Page.Login.Msg


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model ) of
        ( GotPageLoginMsg pageLoginMsg, PageLogin pageLoginModel ) ->
            let
                ( nextPageLoginModel, pageLoginCmd ) =
                    Page.Login.update pageLoginMsg pageLoginModel
            in
            ( PageLogin nextPageLoginModel, Cmd.map GotPageLoginMsg pageLoginCmd )



-- VIEW


view : Model -> Html Msg
view model =
    case model of
        PageLogin pageLoginModel ->
            Html.map GotPageLoginMsg (Page.Login.view pageLoginModel)
