import { Link as MuiLink, LinkBaseProps, LinkProps } from "@mui/material";
import React from "react";
import { Link as ReactRouterDomLink } from "react-router-dom";

export const LinkBehavior = React.forwardRef<any, Partial<LinkBaseProps>>(
  (props, _ref) => {
    return (
      <ReactRouterDomLink to={{ pathname: props.href }} {...props}>
        {props.children}
      </ReactRouterDomLink>
    );
  }
);

export const Link = (props: LinkProps) => {
  return <MuiLink component={LinkBehavior} {...props} />;
};
