export type IRoute =
  | {
      type: "home";
    }
  | {
      type: "edit-profile";
    }
  | {
      type: "edit-avatar";
    }
  | {
      type: "search-users";
    }
  | {
      type: "logout";
    };

const encode = (route: IRoute) => {
  switch (route.type) {
    case "home":
      return {
        pathname: "/",
      };

    case "edit-profile":
      return {
        pathname: "/edit-profile",
      };

    case "edit-avatar":
      return {
        pathname: "/edit-avatar",
      };

    case "search-users":
      return {
        pathname: "/search-users",
      };

    case "logout":
      return {
        pathname: "/logout",
      };
  }
};

const decode = ({ pathname }: { pathname: string }): IRoute => {
  if (pathname === "/") {
    return {
      type: "home",
    };
  }

  if (pathname === "/edit-profile") {
    return {
      type: "edit-profile",
    };
  }

  if (pathname === "/edit-avatar") {
    return {
      type: "edit-avatar",
    };
  }

  if (pathname === "/search-users") {
    return {
      type: "search-users",
    };
  }

  if (pathname === "/logout") {
    return {
      type: "logout",
    };
  }

  return {
    type: "home",
  };
};

export default { encode, decode };
