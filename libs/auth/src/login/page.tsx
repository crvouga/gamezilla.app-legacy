import { Cmd } from '@gamezilla/core';
import { PhoneNumber, Route } from '@gamezilla/temp-shared';
import * as PageLogin from './page-login';
import * as PageLoginEmailLink from './page-login-email-link';
import * as PageLoginPhone from './page-login-phone';
import * as PageLoginPhoneVerify from './page-login-phone-verify';

export type Model =
  | { type: 'login'; child: PageLogin.Model }
  | { type: 'login-email-link'; child: PageLoginEmailLink.Model }
  | {
      type: 'login-phone';
      isSelectingCountry: boolean;
      child: PageLoginPhone.Model;
    }
  | {
      type: 'login-phone-verify';
      phoneNumber: PhoneNumber;
      child: PageLoginPhoneVerify.Model;
    };

export const init = ({
  route,
  model,
}: {
  route: Route.Model;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (route[0]) {
    case 'login': {
      return { model: { type: 'login', child: PageLogin.init } };
    }

    case 'login-email-link': {
      return {
        model: { type: 'login-email-link', child: PageLoginEmailLink.init },
      };
    }

    case 'login-phone': {
      const init = PageLoginPhone.init({
        countrySearchText:
          model.type === 'login-phone' ? model.child.countrySearchText : '',
        phoneNumber:
          model.type === 'login-phone' ? model.child.phoneNumber : '',
        country: model.type === 'login-phone' ? model.child.country : 'US',
        isSelectingCountry: route[1].isSelectingCountry,
      });
      return {
        model: {
          type: 'login-phone',
          isSelectingCountry: route[1].isSelectingCountry,
          child: init.model,
        },
        cmd: Cmd.tag('login-phone', init.cmd),
      };
    }

    case 'login-phone-verify': {
      const init = PageLoginPhoneVerify.init();
      return {
        model: {
          type: 'login-phone-verify',
          phoneNumber: route[1].phoneNumber,
          child: init.model,
        },
        cmd: Cmd.tag('login-phone-verify', init.cmd),
      };
    }

    default: {
      return {
        model,
        cmd: Route.push(['login']),
      };
    }
  }
};

//
//
//
//
//

export type Msg =
  | ['login', PageLogin.Msg]
  | ['login-email-link', PageLoginEmailLink.Msg]
  | ['login-phone', PageLoginPhone.Msg]
  | ['login-phone-verify', PageLoginPhoneVerify.Msg];

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'login': {
      if (model.type !== 'login') {
        return { model };
      }
      const updated = PageLogin.update({
        msg: msg[1],
        model: model.child,
      });
      return {
        model: { ...model, child: updated.model },
        cmd: Cmd.tag('login', updated.cmd),
      };
    }

    case 'login-email-link': {
      if (model.type !== 'login-email-link') {
        return { model };
      }
      const updated = PageLoginEmailLink.update({
        msg: msg[1],
        model: model.child,
      });
      return {
        model: { ...model, child: updated.model },
        cmd: Cmd.tag('login-email-link', updated.cmd ?? Cmd.None),
      };
    }

    case 'login-phone': {
      if (model.type !== 'login-phone') {
        return { model };
      }
      const updated = PageLoginPhone.update({
        msg: msg[1],
        model: model.child,
      });
      return {
        model: { ...model, child: updated.model },
        cmd: Cmd.tag('login-phone', updated.cmd ?? Cmd.None),
      };
    }

    case 'login-phone-verify': {
      if (model.type !== 'login-phone-verify') {
        return { model };
      }
      const updated = PageLoginPhoneVerify.update({
        msg: msg[1],
        model: model.child,
        phoneNumber: model.phoneNumber,
      });
      return {
        model: { ...model, child: updated.model },
        cmd: Cmd.tag('login-phone-verify', updated.cmd ?? Cmd.None),
      };
    }
  }
};

//
//
// View
//
//

export const View = ({
  model,
  $send,
}: {
  model: Model;
  $send: (m: Msg) => void;
}) => {
  switch (model.type) {
    case 'login': {
      return (
        <PageLogin.View
          model={model.child}
          $send={(m) => $send(['login', m])}
        />
      );
    }

    case 'login-email-link': {
      return (
        <PageLoginEmailLink.View
          model={model.child}
          $send={(m) => $send(['login-email-link', m])}
        />
      );
    }

    case 'login-phone': {
      return (
        <PageLoginPhone.View
          isSelectingCountry={model.isSelectingCountry}
          model={model.child}
          $send={(m) => $send(['login-phone', m])}
        />
      );
    }

    case 'login-phone-verify': {
      return (
        <PageLoginPhoneVerify.View
          model={model.child}
          $send={(m) => $send(['login-phone-verify', m])}
          phoneNumber={model.phoneNumber}
        />
      );
    }
  }
};
