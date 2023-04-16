import { Cmd } from '@gamezilla/core';
import { PhoneNumber, Route } from '@gamezilla/shared';
import * as PageLogin from './page-login';
import * as PageLoginEmailLink from './page-login-email-link';
import * as PageLoginPhone from './page-login-phone';
import * as PageLoginPhoneVerify from './page-login-phone-verify';

export type Model =
  | { t: 'login'; c: PageLogin.Model }
  | { t: 'login-email-link'; c: PageLoginEmailLink.Model }
  | { t: 'login-phone'; c: PageLoginPhone.Model }
  | {
      t: 'login-phone-verify';
      phoneNumber: PhoneNumber;
      c: PageLoginPhoneVerify.Model;
    };

export const init = ({
  route,
  model,
}: {
  route: Route.Model;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (route[0] === 'login') {
    return { model: { t: 'login', c: PageLogin.init } };
  }

  if (route[0] === 'login-email-link') {
    return {
      model: { t: 'login-email-link', c: PageLoginEmailLink.init },
    };
  }

  if (route[0] === 'login-phone') {
    const init = PageLoginPhone.init();
    return {
      model: { t: 'login-phone', c: init.model },
      cmd: Cmd.tag_('login-phone', init.cmd),
    };
  }

  if (route[0] === 'login-phone-verify') {
    const init = PageLoginPhoneVerify.init();
    return {
      model: {
        t: 'login-phone-verify',
        phoneNumber: route[1].phoneNumber,
        c: init.model,
      },
      cmd: Cmd.tag_('login-phone-verify', init.cmd),
    };
  }

  return {
    model,
    cmd: Route.push(['login']),
  };
};

//
//
// Update
//
//

export type Msg =
  | { t: 'login'; c: PageLogin.Msg }
  | { t: 'login-email-link'; c: PageLoginEmailLink.Msg }
  | { t: 'login-phone'; c: PageLoginPhone.Msg }
  | { t: 'login-phone-verify'; c: PageLoginPhoneVerify.Msg };

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'login' && model.t === 'login') {
    const updated = PageLogin.update({
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { ...model, c: updated.model },
      cmd: Cmd.tag_('login', updated.cmd ?? Cmd.None),
    };
  }

  if (msg.t === 'login-email-link' && model.t === 'login-email-link') {
    const updated = PageLoginEmailLink.update({
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { ...model, c: updated.model },
      cmd: Cmd.tag_('login-email-link', updated.cmd ?? Cmd.None),
    };
  }

  if (msg.t === 'login-phone' && model.t === 'login-phone') {
    const updated = PageLoginPhone.update({
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { ...model, c: updated.model },
      cmd: Cmd.tag_('login-phone', updated.cmd ?? Cmd.None),
    };
  }

  if (msg.t === 'login-phone-verify' && model.t === 'login-phone-verify') {
    const updated = PageLoginPhoneVerify.update({
      msg: msg.c,
      model: model.c,
      phoneNumber: model.phoneNumber,
    });
    return {
      model: { ...model, c: updated.model },
      cmd: Cmd.tag_('login-phone-verify', updated.cmd ?? Cmd.None),
    };
  }

  return { model };
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
  if (model.t === 'login') {
    return (
      <PageLogin.View model={model.c} $send={(c) => $send({ t: 'login', c })} />
    );
  }

  if (model.t === 'login-email-link') {
    return (
      <PageLoginEmailLink.View
        model={model.c}
        $send={(c) => $send({ t: 'login-email-link', c })}
      />
    );
  }

  if (model.t === 'login-phone') {
    return (
      <PageLoginPhone.View
        model={model.c}
        $send={(c) => $send({ t: 'login-phone', c })}
      />
    );
  }

  if (model.t === 'login-phone-verify') {
    return (
      <PageLoginPhoneVerify.View
        model={model.c}
        $send={(c) => $send({ t: 'login-phone-verify', c })}
        phoneNumber={model.phoneNumber}
      />
    );
  }

  const exhaustive: never = model;
  return exhaustive;
};
